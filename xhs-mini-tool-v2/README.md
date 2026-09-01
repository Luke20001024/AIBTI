# ArcBTI standalone release

This directory contains the standalone, Xiaohongshu-compatible ArcBTI build that is also published at the root of GitHub Pages.

## Build

From the repository root:

```bash
node xhs-mini-tool-v2/scripts/build.mjs
```

The build reads the existing ArcBTI content and image library, optimizes the runtime assets, and writes the deployable site to `xhs-mini-tool-v2/dist`.

## Validate

```bash
node xhs-mini-tool-v2/scripts/validate.mjs
node xhs-mini-tool-v2/scripts/offline-smoke.mjs
```

The validation checks the 16 personalities, 18 questions, linked architect and building records, packaged media, file-count and size limits, navigation, overlays, and the representative mobile browser flow.

## GitHub Pages

`.github/workflows/deploy-pages.yml` builds this package on every push to `main`, validates it, and deploys `xhs-mini-tool-v2/dist` as the Pages artifact. All browser assets use relative URLs so the same package works locally, under the `/AIBTI/` Pages subpath, and inside the Xiaohongshu mini-tool container.
