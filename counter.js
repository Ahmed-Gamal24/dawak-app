// Sum published Dawak APK downloads across releases; never reset on an APK update.
// These are file downloads, not installs, people, or button clicks.
export const REPOSITORY = "Ahmed-Gamal24/dawak-app";
export const CACHE_KEY = "dawak-downloads:all-apk-releases:v1";
export const CACHE_TTL = 15 * 60 * 1000;
const PAGE_SIZE = 100;
const MAX_PAGES = 20;

async function totalDownloads(fetcher, signal) {
  let count = 0;
  const seen = new Set();
  for (let page = 1; page <= MAX_PAGES; page++) {
    const response = await fetcher(
      `https://api.github.com/repos/${REPOSITORY}/releases?per_page=${PAGE_SIZE}&page=${page}`,
      {
        headers: { Accept: "application/vnd.github+json" },
        signal,
        credentials: "omit",
      },
    );
    if (!response.ok)
      throw new Error(`Counter unavailable: ${response.status}`);
    const releases = await response.json();
    if (!Array.isArray(releases)) throw new Error("Invalid release list");
    for (const release of releases) {
      if (release.draft) continue;
      const version = /^v(\d+\.\d+\.\d+)((?:-preview|-beta)?)$/.exec(release.tag_name);
      if (!version) continue;
      if (seen.has(release.tag_name)) continue;
      seen.add(release.tag_name);
      const name = `dawak-${version[1]}${version[2]}.apk`;
      const asset = release.assets?.find((item) => item.name === name);
      if (!asset) continue; // Checksums, videos and unrelated files do not count.
      if (!Number.isSafeInteger(asset.download_count) || asset.download_count < 0)
        throw new Error("Invalid APK download count");
      count += asset.download_count;
      if (!Number.isSafeInteger(count)) throw new Error("Download total overflow");
    }
    if (releases.length < PAGE_SIZE) return count;
  }
  throw new Error("Release pagination incomplete"); // Never display a partial total.
}

export function readCachedCount(storage, now) {
  try {
    const data = JSON.parse(storage?.getItem(CACHE_KEY) || "null");
    if (
      Number.isSafeInteger(data?.count) &&
      data.count >= 0 &&
      Number.isSafeInteger(data?.timestamp) &&
      data.timestamp <= now
    ) {
      return { ...data, fresh: now - data.timestamp < CACHE_TTL };
    }
  } catch {
    /* Storage may be disabled, corrupted, or full. */
  }
  return null;
}

export async function loadDownloadCount({
  fetcher = fetch,
  storage,
  now = Date.now(),
  signal,
} = {}) {
  const cached = readCachedCount(storage, now);
  if (cached?.fresh) return { count: cached.count, state: "cached" };
  try {
    const count = await totalDownloads(fetcher, signal);
    try {
      storage?.setItem(CACHE_KEY, JSON.stringify({ count, timestamp: now }));
    } catch {
      /* Optional cache. */
    }
    return { count, state: "live" };
  } catch {
    return cached
      ? { count: cached.count, state: "stale" }
      : { count: null, state: "unavailable" };
  }
}
