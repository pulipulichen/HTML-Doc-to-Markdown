# HTML Doc to Markdown

[English](./README.md) | [繁體中文](./README_zh_tw.md)

這是一個純瀏覽器端的文件轉換工具，可將 `docx`、`pptx`、`pdf`、`odt`、`odp` 轉為 Markdown，並把 Markdown 與擷取到的附件打包成適用於 Obsidian 的 ZIP。

線上示範：[https://pulipulichen.github.io/HTML-Doc-to-Markdown/](https://pulipulichen.github.io/HTML-Doc-to-Markdown/)

## 功能特色

- 支援拖放本機檔案，或用檔案選擇器上傳。
- 轉換完成後可直接預覽 Markdown。
- `docx`、`pptx`、`odt`、`odp` 的表格可保留為 Markdown table。
- 可擷取文件內嵌圖片（若格式支援），並放入 `attachments/`。
- 可下載單一 ZIP，內含：
  - `<檔名>.md`
  - `attachments/*`
- 支援網址轉換：
  - 可直接下載的檔案連結
  - Google Docs 連結（匯出為 `docx`）
  - Google Slides 連結（匯出為 `pptx`）
  - Google Drive 檔案連結（轉為直接下載網址）
- 具備 PWA 與 Service Worker，提供基本離線資產快取。

## 支援格式

- 輸入：`docx`、`pptx`、`pdf`、`odt`、`odp`
- 輸出：Markdown +（可選）附件圖片 ZIP

## 已知限制

- 網址轉換會受目標網站 CORS 與分享權限影響。
- 若網址回傳的是 HTML 網頁而非檔案，系統會拒絕轉換。
- PDF 目前僅支援文字擷取，不含內嵌圖片擷取。
- Office / OpenDocument 的複雜排版可能在轉換時被簡化。

## 技術堆疊

- `mammoth`：解析 `docx` 與擷取圖片
- `turndown`：將 HTML 轉為 Markdown
- `pdf.js`：擷取 PDF 文字內容
- `JSZip` + `FileSaver.js`：產生並下載 ZIP
- Tailwind CSS（CDN）：介面樣式
- Vanilla JavaScript 前端（`scripts/*.js`）
- Playwright：E2E 測試（透過 Docker 測試容器）

## 本機開發

本專案是靜態前端應用，可直接開啟 `index.html`，或用任意靜態伺服器啟動。

### 使用 Docker Compose 執行 E2E 測試

```bash
npm start
```

此指令會執行 `docker compose up --build --exit-code-from test-runner`，流程為：

1. 啟動 `http://localhost:8080` 靜態站台
2. 於容器內執行 Playwright 測試

## 專案結構

```text
.
├─ index.html
├─ styles/
│  └─ style.css
├─ scripts/
│  ├─ globals.js
│  ├─ processors.js
│  ├─ ui-utils.js
│  └─ main.js
├─ manifest.json
├─ sw.js
└─ e2e/
   └─ basic.spec.js
```
