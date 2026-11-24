// Counts GitHub release-asset downloads, not installs, people, or button clicks.
export const RELEASE = Object.freeze({
  repository: "Ahmed-Gamal24/dawak-app",
  tag: "v0.8.0-preview",
  assetName: "dawak-0.8.0-preview.apk",
});
export const CACHE_KEY = `dawak-downloads:${RELEASE.tag}`;
export const CACHE_TTL = 15 * 60 * 1000;

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
    const response = await fetcher(
      `https://api.github.com/repos/${RELEASE.repository}/releases/tags/${RELEASE.tag}`,
      {
        headers: { Accept: "application/vnd.github+json" },
        signal,
        credentials: "omit",
      },
    );
    if (!response.ok)
      throw new Error(`Counter unavailable: ${response.status}`);
    const release = await response.json();
    const asset = release.assets?.find(
      (item) => item.name === RELEASE.assetName,
    );
    if (
      release.draft ||
      !Number.isSafeInteger(asset?.download_count) ||
      asset.download_count < 0
    )
      throw new Error("Missing release asset or invalid count");
    const count = asset.download_count;
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
