import { test } from "node:test";
import assert from "node:assert/strict";
import {
  CACHE_KEY,
  CACHE_TTL,
  RELEASE,
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
const response = (count = 0, name = RELEASE.assetName) => ({
  ok: true,
  json: async () => ({ assets: [{ name, download_count: count }] }),
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
test("a different release asset cannot become the APK count", async () => {
  const result = await loadDownloadCount({
    now,
    fetcher: async () => response(100, "checksums.txt"),
  });
  assert.deepEqual(result, { count: null, state: "unavailable" });
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
