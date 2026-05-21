window.I18N_TRANSLATIONS = window.I18N_TRANSLATIONS || {};

window.I18N_TRANSLATIONS['zh-TW'] = {
    language: {
        label: '語言'
    },
    app: {
        pageTitle: '多格式 Office 轉 Obsidian 轉換器',
        title: '全能 Document 格式 轉 Markdown',
        subtitle: '支援 <span class="text-blue-600">Docx</span>, <span class="text-orange-600">Pptx</span>, <span class="text-red-600">Pdf</span>, <span class="text-green-600">Odt</span>, <span class="text-emerald-600">Odp</span>，並保留表格為 Markdown table'
    },
    dropzone: {
        title: '拖放檔案到這裡',
        hint: '支援 docx, pptx, pdf, odt, odp 格式與表格轉換'
    },
    url: {
        label: '或輸入檔案網址',
        placeholder: 'https://example.com/file.docx 或 Google Drive / Docs / Slides 連結',
        buttonConvert: '下載並轉換',
        example: '範例已填入 Google Doc 連結；Google Docs 會匯出為 DOCX，Google Slides 會匯出為 PPTX。'
    },
    actions: {
        downloadZip: '下載 Obsidian ZIP 打包檔'
    },
    preview: {
        markdown: 'Markdown 預覽',
        copyMarkdown: '複製',
        attachments: '附件資源',
        copyImage: '複製',
        downloadImage: '下載',
        downloadSingleImage: '下載圖片',
        closeImagePreview: '關閉'
    },
    status: {
        unsupportedFormat: '不支援的格式：{ext}',
        parsingFile: '正在解析 {ext} 檔案...',
        parseSuccess: '解析成功！',
        convertFailed: '轉換失敗：{message}',
        enterUrl: '請先輸入檔案網址。',
        invalidUrl: '網址格式不正確，請輸入完整網址，例如 https://example.com/file.docx。',
        downloadingButton: '下載中...',
        downloadingFile: '正在下載檔案...',
        downloadingFileFromSource: '正在下載 {source} 檔案...',
        urlConvertFailed: '網址轉換失敗：{message}',
        copyEmpty: '目前沒有可複製的內容。',
        copySuccess: '已複製 Markdown 到剪貼簿！',
        copyFailed: '無法複製 Markdown，請手動複製。',
        copyImageSuccess: '已複製圖片到剪貼簿！',
        copyImageFailed: '無法複製圖片，請改用下載。',
        copyImageUnsupported: '此瀏覽器不支援複製圖片。'
    },
    errors: {
        downloadBlockedByCors: '無法從此網址下載。對方網站可能未允許瀏覽器跨網域讀取，請改用可公開存取且允許 CORS 的直連網址，或先下載後再拖放檔案。',
        downloadHttp: '下載失敗（HTTP {status}）。請確認網址與分享權限。',
        googleReturnedHtml: '{source} 回傳的是網頁而不是檔案，請確認分享權限或改用可直接下載的連結。'
    }
};
