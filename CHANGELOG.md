# Changelog

## [0.0.1] - 2026-05-10

### Added

- 建立「全能 Office 轉 Obsidian」前端轉換工具。
- 支援拖放或點選上傳 `docx`、`pptx`、`pdf`、`odt`、`odp` 檔案。
- 將文件內容轉換為 Markdown，並提供即時 Markdown 預覽。
- 支援從 `docx`、`pptx`、`odt`、`odp` 擷取附件圖片，輸出為 Obsidian 可使用的 `attachments` 資料夾結構。
- 支援將 Markdown 與附件圖片打包下載為 Obsidian ZIP 檔。
- 加入 PDF.js，支援從 PDF 擷取文字內容。
- 加入 PWA manifest、圖示、主題色與 Service Worker 快取，讓應用可安裝並具備基本離線載入能力。
- 新增 Playwright 基本端對端測試，驗證頁面載入、標題、拖放區與檔案輸入元件。

### Changed

- 將頁面樣式與應用邏輯拆分到 `styles/` 與 `scripts/`，降低 `index.html` 複雜度並提升維護性。
- 更新頁面標題與介面文案，明確標示支援的 Office、PDF 與 OpenDocument 格式。
