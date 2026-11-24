import { test } from "node:test";
import assert from "node:assert/strict";
import {
  CACHE_KEY,
  CACHE_TTL,
  loadDownloadCount,
} from "../counter.js";
const now = 2_000_000;
const storage = (data) => {
  const values = new Map(data ? [[CACHE_KEY, JSON.stringify(data)]] : []);
  return {
    getItem: (key) => values.get(key),
    setItem: (key, value) => values.set(key, value),
  };
};
const release = (version, count, extra = {}) => ({
  tag_name: `v${version}-preview`,
  draft: false,
  assets: [{ name: `dawak-${version}-preview.apk`, download_count: count }],
  ...extra,
});
const response = (count = 0, name = 'dawak-0.8.0-preview.apk') => ({
  ok: true,
  json: async () => [release('0.8.0', count, { assets: [{ name, download_count: count }] })],
});
test("a real zero is displayed and cached, without inventing a baseline", async () => {
  const cache = storage();
  const result = await loadDownloadCount({
    now,
    storage: cache,
    fetcher: async () => response(0),
  });
  assert.deepEqual(result, { count: 0, state: "live" });
  assert.equal(JSON.parse(cache.getItem(CACHE_KEY)).count, 0);
});
test("a fresh cache avoids repeat API requests", async () => {
  const result = await loadDownloadCount({
    now,
    storage: storage({ count: 14, timestamp: now - 1000 }),
    fetcher: () => assert.fail("unnecessary API call"),
  });
  assert.deepEqual(result, { count: 14, state: "cached" });
});
test("rate limits preserve an explicitly stale count", async () => {
  const result = await loadDownloadCount({
    now,
    storage: storage({ count: 4, timestamp: now - CACHE_TTL - 1 }),
    fetcher: async () => ({ ok: false, status: 403 }),
  });
  assert.deepEqual(result, { count: 4, state: "stale" });
});
test("network failure without valid cache returns unavailable, not zero", async () => {
  const result = await loadDownloadCount({
    now,
    fetcher: async () => {
      throw new Error("offline");
    },
  });
  assert.deepEqual(result, { count: null, state: "unavailable" });
});
test("checksums and unrelated assets do not count as APK downloads", async () => {
  const result = await loadDownloadCount({
    now,
    fetcher: async () => response(100, "checksums.txt"),
  });
  assert.deepEqual(result, { count: 0, state: "live" });
});

test("publishing a new APK retains old downloads and adds new ones", async () => {
  const result = await loadDownloadCount({
    now,
    fetcher: async () => ({
      ok: true,
      json: async () => [release('0.8.0', 3), release('0.7.0', 46)],
    }),
  });
  assert.deepEqual(result, { count: 49, state: 'live' });
  assert.ok(!CACHE_KEY.includes('0.8.0'));
});

test("drafts, non-app files and mismatched APK versions never inflate the total", async () => {
  const result = await loadDownloadCount({
    now,
    fetcher: async () => ({
      ok: true,
      json: async () => [
        release('0.9.0', 500, { draft: true }),
        release('0.8.0', 2),
        release('0.7.0', 46, { assets: [
          { name: 'dawak-0.7.0-preview.apk', download_count: 46 },
          { name: 'SHA256SUMS.txt', download_count: 1000 },
          { name: 'video.mp4', download_count: 1000 },
        ] }),
        release('0.6.0', 0, { assets: [{ name: 'dawak-0.8.0-preview.apk', download_count: 100 }] }),
      ],
    }),
  });
  assert.deepEqual(result, { count: 48, state: 'live' });
});

test("all release pages are read without double-counting repeated boundary entries", async () => {
  const urls = [];
  const first = [release('0.8.0', 3), ...Array.from({ length: 99 }, (_, i) => ({ tag_name: `other-${i}` }))];
  const result = await loadDownloadCount({
    now,
    fetcher: async (url) => {
      urls.push(url);
      return { ok: true, json: async () => urls.length === 1 ? first : [release('0.8.0', 3), release('0.7.0', 46)] };
    },
  });
  assert.deepEqual(result, { count: 49, state: 'live' });
  assert.equal(urls.length, 2);
  assert.match(urls[1], /per_page=100&page=2$/);
});

test("a later-page failure retains the cached total instead of displaying a partial sum", async () => {
  let calls = 0;
  const first = Array.from({ length: 100 }, (_, i) => release(`0.${i}.0`, 1));
  const result = await loadDownloadCount({
    now,
    storage: storage({ count: 146, timestamp: now - CACHE_TTL - 1 }),
    fetcher: async () => ++calls === 1 ? { ok: true, json: async () => first } : { ok: false, status: 403 },
  });
  assert.deepEqual(result, { count: 146, state: 'stale' });
});

test("malformed API responses and integer overflow do not become totals", async () => {
  for (const payload of [{ message: 'not a release list' }, [release('0.8.0', Number.MAX_SAFE_INTEGER), release('0.7.0', 1)]]) {
    const result = await loadDownloadCount({ now, fetcher: async () => ({ ok: true, json: async () => payload }) });
    assert.deepEqual(result, { count: null, state: 'unavailable' });
  }
});
test("blocked browser storage does not break a working counter", async () => {
  const blocked = {
    getItem() {
      throw new Error("blocked");
    },
    setItem() {
      throw new Error("full");
    },
  };
  assert.deepEqual(
    await loadDownloadCount({
      now,
      storage: blocked,
      fetcher: async () => response(9),
    }),
    { count: 9, state: "live" },
  );
});
test("invalid values and future caches never become download totals", async () => {
  for (const value of [-1, "99", 1.5, null]) {
    assert.deepEqual(
      await loadDownloadCount({
        now,
        storage: storage({ count: 40, timestamp: now + 60000 }),
        fetcher: async () => response(value),
      }),
      { count: null, state: "unavailable" },
    );
  }
});
