# Dawak download website

Public Arabic landing page and Android beta distribution for **دواك**. This repository contains only the website, existing brand assets, and screenshots of real application components rendered with fictional QA data. The backend/mobile source repository remains private.

- Website: https://ahmed-gamal24.github.io/dawak-app/
- APK releases: https://github.com/Ahmed-Gamal24/dawak-app/releases
- Feedback: https://forms.gle/94a5uQCWXbfw3zW47. Never submit patient information, credentials, or private screenshots.

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

## Role-specific usage guides

The `#guides` section sits after the app tour and before the download section.
Its patient, doctor and caregiver cards each contain the supplied portrait
walkthrough, an extracted JPEG cover, its duration and a direct video link.
The navigation, footer and installation instructions link to this section.
Individual cards can also be linked with `#guide-patient`, `#guide-doctor` and
`#guide-caregiver`.

Videos in `assets/video/guides/` preserve the supplied H.264/AAC files byte for
byte. Filenames retain the supplied version suffixes to avoid stale media caches.
Covers are extracted at eight seconds and resized to 540 × 960. All four players,
including the promotional video, have native controls and `preload="none"`;
none autoplays. JavaScript adds play/resume overlays, pauses other players when
one starts, and displays a direct-link fallback if playback fails. Without
JavaScript, the browser's controls and direct links still work.

| Guide     | Duration | Bytes      | SHA-256                                                            |
| --------- | -------- | ---------- | ------------------------------------------------------------------ |
| Patient   | 3:08     | 13,593,266 | `1380125995eed87614930ccb9ed7f0d0dbdc569d1ee7264f23b704b4c23462e5` |
| Doctor    | 2:30     | 11,798,472 | `4b451b4780aa82b5b2633c200fa86ac87d807c5ff4dd7d12ad10bc17c204556b` |
| Caregiver | 1:33     | 7,475,978  | `6aaf4c93a6fca2b9ba77afd4975f181afe7b04eb1acd3a8f281f94d40835fc80` |

## Feedback

The feedback card after the usage guides, FAQ and footer open the owner's
Google Form in a new tab. The privacy page uses the same link. This is a plain
external link: the website does not embed Google Forms, submit responses, add
Google scripts, or require a GitHub account to send feedback. Response storage
and optional email notifications are managed in the owner's Google Forms account.

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
| Tag             | `v0.8.0-preview`                                                      |
| APK             | `dawak-0.8.0-preview.apk`                                             |
| Version         | `0.8.0` / code `8`                                                    |
| Package         | `dev.smartmedication.preview`                                         |
| Minimum Android | 7.0 / API 24                                                          |
| Architectures   | arm64-v8a, x86_64                                                     |
| Size            | 59,171,556 bytes (56.4 MiB)                                           |
| SHA-256         | `073e6ad0a4c04eee1457f320f872c152230878a01c44f33837d96605cc557a22`    |
| API             | `https://dawak-staging-a58269c4-be.belgiumcentral.cloudapp.azure.com` |

This release adds public doctor/clinic directory results and an optional notice for future Android updates. Reference-data coverage is limited; missing specialties, phone numbers and hours are not invented. Public search data does not create physician accounts or grant access to patient records.

The package and signing certificate match 0.7.0. An isolated Android emulator install-over check retained the application UID, first installation time and saved Arabic preference. Install the new APK over the existing app; do not uninstall it. Version 0.7.0 users need to download this first update manually. The new optional update checker opens this website for later releases.

The APK is a signed local **preview**, not a Play Store release. Native static alignment/security checks passed; real-phone acceptance testing remains necessary, including medication alarm behavior. The beta is for fictional test data only, with a backup reminder method. Server-side push providers are not configured; do not advertise guaranteed remote push delivery. No fabricated testimonials, installation numbers, clinical claims, or patient records appear on the site.

## Privacy

There are no website analytics, advertising scripts, account forms, or medical-data uploads. The only website local-storage value is the public download-count cache. Hosting and API requests go to GitHub. Feedback links open an external Google Form only when clicked. The website's Arabic privacy notice describes this, the external feedback form and the Azure-hosted beta; it does not claim to be a completed production medical-app privacy policy.
