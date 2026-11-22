import { readFile, stat } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
for (const name of ["index.html", "privacy.html", "styles.css", "app.js"]) {
  const source = await readFile(resolve(root, name), "utf8");
  const paths = [
    ...source.matchAll(/(?:src|href)="([^"#]+)"|url\(['"]?([^'"\)]+)['"]?\)/g),
  ];
  for (const match of paths) {
    const asset = match[1] || match[2];
    if (/^(https?:|data:|\.\/)/.test(asset)) continue;
    assert.ok(
      (await stat(resolve(root, asset))).isFile(),
      `Missing local asset: ${asset}`,
    );
  }
}
const html = await readFile(resolve(root, "index.html"), "utf8");
assert.match(html, /lang="ar" dir="rtl"/);
assert.match(
  html,
  /releases\/download\/v0\.7\.0-preview\/dawak-0\.7\.0-preview\.apk/,
);
assert.ok(
  !/127\.0\.0\.1|localhost/.test(html),
  "Published HTML must not target a local server",
);
console.log("Static asset and download-link checks passed.");
