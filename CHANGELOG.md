# CHANGELOG

## 0.0.2

### Added (0.0.2)

- Added one-click Markdown copy from the preview header.
- Added per-attachment image copy actions (alongside existing image download actions).
- Added a dedicated "Download MD" action in the Markdown preview header to export the current Markdown without ZIP packaging.
- Added URL input support to download a document and convert it directly to Markdown.
- Added support for converting Google Docs exports (`docx`) and Google Slides exports (`pptx`).
- Added support for converting Google Drive links into direct-download URLs before processing.
- Added Markdown table preservation for tables in `docx`, `pptx`, `odt`, and `odp`.
- Added a prefilled Google Doc sample URL for faster URL conversion testing.
- Added frontend internationalization with `en` and `zh-TW` translation dictionaries under `scripts/modules/i18n/`.
- Added language detection and persistence (`localStorage` + browser language fallback) with runtime UI language switching.
- Added a root `.jslintrc` to centralize browser/global JSHint configuration for app scripts and E2E tests.
- Added attachment image interactions: click-to-enlarge modal preview and per-image download actions in the attachments panel.

### Changed (0.0.2)

- Updated the app layout to a compact workspace: a narrow left action column plus a right preview column split into Markdown (top) and attachments (bottom).
- Updated the workspace behavior so the upload area remains full-width before conversion, then switches to the split layout only after results are available.
- Reduced header/drop-zone visual footprint for better 1280x720 usability.
- Updated preview controls and labels, including the shorter "Download ZIP" wording.
- Removed the explicit "Parsing completed successfully!" success banner after conversion.
- Removed the obsolete `scripts/main.js` bootstrap file by moving initialization directly into `event-bindings.js`.
- Updated Service Worker precache entries and cache version to reflect the script graph changes.
- Updated the Service Worker cache version so URL-conversion and table-support assets are refreshed correctly.
- Updated end-to-end tests to verify URL input, sample Google Doc URL content, and table-support messaging.
- Updated Playwright E2E coverage to validate i18n initialization, manual language switching, and language persistence after reload.
- Split the previous monolithic E2E spec into logic-based files for language initialization, manual switching, and reload persistence scenarios.
- Updated E2E test comments and test titles to use consistent English wording.
- Downloaded third-party runtime libraries from CDN and vendored them under `scripts/vendor/` for local loading.
- Switched library references in `index.html`, `sw.js`, and `scripts/globals.js` from remote CDN URLs to local vendor paths.
- Added local `pdf.worker.min.js` loading and cached it through the Service Worker to improve offline reliability.
- Vendored the Tailwind CDN runtime as `scripts/vendor/tailwindcss.cdn.js` for offline-first usage.
- Updated Tailwind script loading and Service Worker cache entries to use local paths, and bumped the cache version to refresh existing clients.
- Refactored `scripts/main.js` into focused app modules (`messages`, `file-conversion`, `url-conversion`, `export-zip`, `event-bindings`) and kept `main.js` as a small bootstrap entry.
- Split previous `scripts/ui-utils.js` responsibilities into dedicated UI modules (`result-preview`, `image-modal`, `status-message`) to align files with business logic boundaries.
- Removed the obsolete `scripts/ui-utils.js` stub after completing the UI-module migration to avoid redundant files.
- Moved per-file JSHint ES-version directives into centralized lint config (`.jslintrc` and `.jshintrc`) and removed inline `/* jshint esversion: 11 */` headers.
- Removed stale `./scripts/ui-utils.js` from the Service Worker precache list to keep offline assets in sync with the current script graph.

### Documentation (0.0.2)

- Reorganized `README.md` into a clear, maintainable English guide aligned with current app behavior and constraints.
- Added synchronized bilingual documentation via `README_zh_tw.md`, including language switch links and matching section structure.
- Updated project-structure sections in both `README.md` and `README_zh_tw.md` to remove the deleted `scripts/ui-utils.js` entry.

## 0.0.1

### Added (0.0.1)

- Created the "Office to Obsidian" frontend conversion tool.
- Added drag-and-drop and file-picker upload support for `docx`, `pptx`, `pdf`, `odt`, and `odp`.
- Added document-to-Markdown conversion with live Markdown preview.
- Added attachment image extraction from `docx`, `pptx`, `odt`, and `odp`, with an Obsidian-friendly `attachments` folder structure.
- Added ZIP packaging for converted Markdown and attachment images.
- Added PDF.js integration for PDF text extraction.
- Added PWA setup with manifest, icons, theme color, and Service Worker caching for basic installable/offline behavior.
- Added baseline Playwright end-to-end tests for page load, title, drop zone, and file input.

### Changed (0.0.1)

- Split page styles and application logic into `styles/` and `scripts/` to reduce `index.html` complexity and improve maintainability.
- Updated page title and UI copy to clearly highlight supported Office, PDF, and OpenDocument formats.
