# HTML Doc to Markdown

[English](./README.md) | [繁體中文](./README_zh_tw.md)

A browser-based converter that transforms `docx`, `pptx`, `pdf`, `odt`, `odp`, `xlsx`, and `ods` files into Markdown, then packages the Markdown file and extracted attachments into an Obsidian-friendly ZIP.

Online Demo: [https://pulipulichen.github.io/HTML-Doc-to-Markdown/](https://pulipulichen.github.io/HTML-Doc-to-Markdown/)

Google Sheets Demo File: [HTML Doc to Markdown demo](https://docs.google.com/spreadsheets/d/11pkVxcBIrDiUO3Hpg7l223awkAoz-XaTnLxlywafpUI/edit?usp=sharing)

## Features

- Drag and drop local files, or pick files from the file input.
- Convert document content to Markdown with a built-in preview panel.
- Keep tables as Markdown tables for `docx`, `pptx`, `odt`, `odp`, `xlsx`, and `ods`.
- Extract embedded images (when available) and include them under `attachments/`.
- Download one ZIP containing:
  - `<filename>.md`
  - `attachments/*`
- Convert from URL input:
  - Direct downloadable links
  - Google Docs links (exported as `docx`)
  - Google Slides links (exported as `pptx`)
  - Google Sheets links (exported as `xlsx`)
  - Google Drive file links (converted to direct download URL)
- Install as a PWA with a service worker for basic offline asset caching.

## Supported Formats

- Input: `docx`, `pptx`, `pdf`, `odt`, `odp`, `xlsx`, `ods`
- Output: Markdown + optional extracted images in ZIP

## Known Limitations

- URL conversion depends on target-site CORS and sharing permissions.
- If a URL returns HTML instead of a file, conversion is rejected.
- PDF conversion currently extracts text only (no embedded image extraction).
- Some complex layouts in Office/OpenDocument files may be simplified during conversion.

## Tech Stack

- `mammoth` for `docx` parsing and image extraction
- `turndown` for HTML-to-Markdown conversion
- `pdf.js` for PDF text extraction
- `JSZip` + `FileSaver.js` for ZIP generation and download
- Tailwind CSS (CDN) for UI styling
- Vanilla JavaScript frontend (`scripts/*.js`)
- Playwright for E2E tests (Docker-based test runner)

## Local Development

This project is a static frontend app. Open `index.html` directly, or serve it with any static file server.

### Run E2E tests with Docker Compose

```bash
npm start
```

This command runs `docker compose up --build --exit-code-from test-runner`, which:

1. Starts a static server at `http://localhost:8080`
2. Runs Playwright tests in container

## Project Structure

```text
.
├─ index.html
├─ styles/
│  └─ style.css
├─ scripts/
│  ├─ globals.js
│  ├─ processors.js
│  └─ modules/
├─ manifest.json
├─ sw.js
└─ e2e/
   └─ basic.spec.js
```
