window.I18N_TRANSLATIONS = window.I18N_TRANSLATIONS || {};

window.I18N_TRANSLATIONS.ja = {
    language: {
        label: '言語'
    },
    app: {
        pageTitle: 'マルチ形式 Office から Obsidian への変換ツール',
        title: 'マルチ形式ドキュメントを Markdown に変換',
        subtitle: '<span class="text-blue-600">Docx</span>、<span class="text-orange-600">Pptx</span>、<span class="text-red-600">Pdf</span>、<span class="text-green-600">Odt</span>、<span class="text-emerald-600">Odp</span>、<span class="text-lime-600">Xlsx</span>、<span class="text-cyan-600">Ods</span>、<span class="text-violet-600">Md</span>、<span class="text-pink-600">Html</span> に対応し、表を Markdown テーブルとして保持します'
    },
    dropzone: {
        title: 'ここにファイルをドロップ',
        hint: 'docx、pptx、pdf、odt、odp、xlsx、ods、md、html 形式と表変換に対応'
    },
    url: {
        label: 'またはファイル URL を入力',
        placeholder: 'https://example.com/file.docx または Google Drive / Docs / Slides / Sheets のリンク',
        buttonConvert: 'ダウンロードして変換',
        example: 'Google ドキュメントのサンプルリンクが入力済みです。Google Docs は DOCX、Google Slides は PPTX、Google Sheets は XLSX として書き出されます。'
    },
    actions: {
        downloadZip: 'ZIP をダウンロード'
    },
    preview: {
        markdown: 'Markdown プレビュー',
        downloadMarkdown: 'MD をダウンロード',
        copyMarkdown: 'コピー',
        attachments: '添付ファイル',
        copyImage: 'コピー',
        downloadImage: 'ダウンロード',
        downloadSingleImage: '画像をダウンロード',
        closeImagePreview: '閉じる',
        previousImage: '前の画像',
        nextImage: '次の画像',
        collapsePanel: '折りたたむ',
        expandPanel: '展開'
    },
    status: {
        unsupportedFormat: '未対応の形式です: {ext}',
        parsingFile: '{ext} ファイルを解析中...',
        parseSuccess: '解析が完了しました！',
        convertFailed: '変換に失敗しました: {message}',
        enterUrl: '先にファイル URL を入力してください。',
        invalidUrl: 'URL 形式が正しくありません。例: https://example.com/file.docx',
        downloadingButton: 'ダウンロード中...',
        downloadingFile: 'ファイルをダウンロード中...',
        downloadingFileFromSource: '{source} ファイルをダウンロード中...',
        urlConvertFailed: 'URL 変換に失敗しました: {message}',
        copyEmpty: 'まだコピーできる内容がありません。',
        downloadMdEmpty: 'まだダウンロードできる Markdown がありません。',
        copySuccess: 'Markdown をクリップボードにコピーしました！',
        copyFailed: 'Markdown をコピーできませんでした。手動でコピーしてください。',
        copyImageSuccess: '画像をクリップボードにコピーしました！',
        copyImageFailed: '画像をコピーできませんでした。ダウンロードをお試しください。',
        copyImageUnsupported: 'このブラウザは画像コピーに対応していません。'
    },
    errors: {
        downloadBlockedByCors: 'この URL からダウンロードできません。配信元サイトがブラウザのクロスオリジン要求を拒否している可能性があります。CORS が有効な直接 URL を使うか、先にファイルをダウンロードしてからドラッグしてください。',
        downloadHttp: 'ダウンロードに失敗しました (HTTP {status})。URL と共有権限を確認してください。',
        googleReturnedHtml: '{source} からファイルではなく Web ページが返されました。共有権限を確認するか、直接ダウンロードリンクを利用してください。'
    }
};
