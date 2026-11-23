# Dawak download website

Public Arabic landing page and Android beta distribution for **دواك**. This repository contains only the website, existing brand assets, and screenshots of real application components rendered with fictional QA data. The backend/mobile source repository remains private.

- Website: https://ahmed-gamal24.github.io/dawak-app/
- APK releases: https://github.com/Ahmed-Gamal24/dawak-app/releases
- Feedback: use this repository's issue template. Never post patient information, credentials, or private screenshots.

## Development

No dependency installation or framework build is required. Use Node.js 24 or later for checks:

```sh
npm run check
npm test
python3 -m http.server 8788 --bind 127.0.0.1
```

Open http://127.0.0.1:8788. HTML works without JavaScript; the screenshot tabs and counter progressively enhance the page. Fonts, icons, and screenshots are local. Font licensing is in `assets/fonts/NOTICE.txt`.

## Promotional video

The `#watch` section follows the introduction and links to the APK download section.
The supplied 59.23-second portrait video is served directly from `assets/video/` with
its original H.264/AAC encoding and bytes preserved (5,444,417 bytes; SHA-256
`6de6b4f77e37aac81e1fd106d85cabe9f5ded14f6f65688447efdd906f648ceb`).
The active file is `assets/video/dawak-promo-v9.mp4`; versioned filenames prevent
browsers from reusing the previous video or poster from cache. The JPEG poster is a frame extracted at eight seconds. No external video host,
tracking embed, paid service, or additional Azure resource is used.

The video uses `preload="none"`, inline playback, native controls, and no autoplay.
A play-button overlay enhances the player when JavaScript is available. Native
controls and a direct video link remain available without JavaScript, with an
inline message if playback fails. The video is displayed in its 9:16 proportions.

## Publishing

The repository's GitHub Pages source is **GitHub Actions**. Pull requests run static checks and counter tests. Pushes to `main` publish only the allowlisted site files, excluding scripts, Git metadata, and APK binaries. GitHub Pages and public GitHub Releases are used within their free usage limits; there are no added Azure resources or paid website services.

Before changing the published APK:

1. Verify the build uses the public HTTPS API origin, not a laptop address or localhost. Never upload environment files or signing keys.
2. Test the artifact, note its version, required Android version, size, and SHA-256, and create a versioned **prerelease** in this public repository.
3. Attach the APK and checksum file to that release. Do not commit the binary to Git.
4. Update `index.html`, `counter.js`, the release metadata below, and the exact-link check in `scripts/check.mjs` together in a pull request.
5. Verify the workflow, public site, download URL, hash, and counter after release publication.

The counter reads `download_count` for the exact APK asset from the public GitHub release API. It measures **file downloads**, including repeated requests and tests, not installs or distinct users. A browser caches the value for 15 minutes to reduce unauthenticated API calls. A stale value is labeled; unavailable is displayed as a dash, never an invented zero. The download link works independently of JavaScript and the counter API. Changing the release tag intentionally starts the displayed count for the new release; it is not an all-time total.

## Current Android preview

| Field           | Value                                                                 |
| --------------- | --------------------------------------------------------------------- |
| Tag             | `v0.7.0-preview`                                                      |
| APK             | `dawak-0.7.0-preview.apk`                                             |
| Version         | `0.7.0` / code `7`                                                    |
| Package         | `dev.smartmedication.preview`                                         |
| Minimum Android | 7.0 / API 24                                                          |
| Architectures   | arm64-v8a, x86_64                                                     |
| Size            | 59,165,732 bytes (56.4 MiB)                                           |
| SHA-256         | `5c0993c12c3f127690f4c6b3f06360dcae88ebd6f72dae21480f8f82216607ca`    |
| API             | `https://dawak-staging-a58269c4-be.belgiumcentral.cloudapp.azure.com` |

The APK is a signed local **preview**, not a Play Store release. Native static alignment/security checks passed, but this cloud build still needs real-phone acceptance testing. The beta is for fictional test data only, with a backup reminder method. Server-side push providers are not configured; do not advertise guaranteed remote push delivery. No fabricated testimonials, installation numbers, clinical claims, or patient records appear on the site.

## Privacy

There are no website analytics, advertising scripts, account forms, or medical-data uploads. The only website local-storage value is the public download-count cache. Hosting and API requests go to GitHub. The website's Arabic privacy notice describes this and the Azure-hosted beta; it does not claim to be a completed production medical-app privacy policy.
