# Changelog

## [0.0.2] - 2026-05-10

### Added in 0.0.2

- 支援輸入檔案網址，下載後直接轉換為 Markdown。
- 支援 Google Docs 匯出為 `docx`、Google Slides 匯出為 `pptx` 後轉換。
- 支援 Google Drive 檔案連結轉換為直接下載網址後處理。
- 支援將 `docx`、`pptx`、`odt`、`odp` 中的表格保留為 Markdown table。
- 新增預填 Google Doc 範例網址，方便快速測試網址轉換。

### Changed in 0.0.2

- 更新 Service Worker 快取版本，確保網址轉換與表格支援的前端資源會重新載入。
- 更新端對端測試，檢查網址輸入欄、Google Doc 範例與表格支援文案。

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
