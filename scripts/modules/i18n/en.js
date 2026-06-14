window.I18N_TRANSLATIONS = window.I18N_TRANSLATIONS || {};

window.I18N_TRANSLATIONS.en = {
    language: {
        label: 'Language'
    },
    app: {
        pageTitle: 'Multi-Format Office to Obsidian Converter',
        title: 'Multi-Format Document to Markdown',
        subtitle: 'Supports <span class="text-blue-600">Docx</span>, <span class="text-orange-600">Pptx</span>, <span class="text-red-600">Pdf</span>, <span class="text-green-600">Odt</span>, <span class="text-emerald-600">Odp</span>, <span class="text-lime-600">Xlsx</span>, <span class="text-cyan-600">Ods</span>, <span class="text-violet-600">Md</span>, and <span class="text-pink-600">Html</span> while preserving tables as Markdown tables'
    },
    dropzone: {
        title: 'Drop files here',
        hint: 'Supports docx, pptx, pdf, odt, odp, xlsx, ods, md, and html formats with table conversion'
    },
    url: {
        label: 'Or enter a file URL',
        placeholder: 'https://example.com/file.docx or a Google Drive / Docs / Slides / Sheets link',
        buttonConvert: 'Download and convert',
        example: 'A Google Doc sample link is prefilled. Google Docs exports as DOCX, Google Slides exports as PPTX, and Google Sheets exports as XLSX.'
    },
    actions: {
        downloadZip: 'Download ZIP'
    },
    preview: {
        markdown: 'Markdown Preview',
        downloadMarkdown: 'Download MD',
        copyMarkdown: 'Copy',
        attachments: 'Attachments',
        copyImage: 'Copy',
        downloadImage: 'Download',
        downloadSingleImage: 'Download image',
        closeImagePreview: 'Close'
    },
    status: {
        unsupportedFormat: 'Unsupported format: {ext}',
        parsingFile: 'Parsing {ext} file...',
        parseSuccess: 'Parsing completed successfully!',
        convertFailed: 'Conversion failed: {message}',
        enterUrl: 'Please enter a file URL first.',
        invalidUrl: 'Invalid URL format. Please enter a full URL, for example: https://example.com/file.docx.',
        downloadingButton: 'Downloading...',
        downloadingFile: 'Downloading file...',
        downloadingFileFromSource: 'Downloading {source} file...',
        urlConvertFailed: 'URL conversion failed: {message}',
        copyEmpty: 'Nothing to copy yet.',
        downloadMdEmpty: 'No Markdown content to download yet.',
        copySuccess: 'Markdown copied to clipboard!',
        copyFailed: 'Unable to copy Markdown. Please copy manually.',
        copyImageSuccess: 'Image copied to clipboard!',
        copyImageFailed: 'Unable to copy image. Please download it.',
        copyImageUnsupported: 'This browser does not support image copy.'
    },
    errors: {
        downloadBlockedByCors: 'Unable to download from this URL. The source site may block cross-origin browser requests. Use a direct URL with CORS enabled, or download the file first and then drag it in.',
        downloadHttp: 'Download failed (HTTP {status}). Please verify the URL and sharing permission.',
        googleReturnedHtml: '{source} returned a webpage instead of a file. Check sharing permission or use a direct download link.'
    }
};
