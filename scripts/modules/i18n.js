(function () {
    const TRANSLATIONS = window.I18N_TRANSLATIONS || {};
    const STORAGE_KEY = 'htmlDocToMarkdown_language';
    const DEFAULT_LANGUAGE = 'en';
    const SUPPORTED_LANGUAGES = Object.keys(TRANSLATIONS);

    let currentLanguage = DEFAULT_LANGUAGE;

    function getByPath(obj, path) {
        return path.split('.').reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), obj);
    }

    function interpolate(template, variables) {
        if (typeof template !== 'string') return template;
        return template.replace(/\{(\w+)\}/g, function (_, key) {
            return variables[key] !== undefined ? String(variables[key]) : '';
        });
    }

    function normalizeLanguageTag(languageTag) {
        if (!languageTag) return '';
        const lowerTag = languageTag.toLowerCase();
        if (lowerTag === 'zh-tw' || lowerTag.startsWith('zh-hant')) return 'zh-TW';
        if (lowerTag.startsWith('en')) return 'en';
        return '';
    }

    function getPreferredLanguage() {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored && SUPPORTED_LANGUAGES.includes(stored)) return stored;

        const browserLanguages = (navigator.languages && navigator.languages.length > 0) ? navigator.languages : [navigator.language];

        for (const language of browserLanguages) {
            const normalized = normalizeLanguageTag(language);
            if (normalized && SUPPORTED_LANGUAGES.includes(normalized)) {
                return normalized;
            }
        }

        return SUPPORTED_LANGUAGES.includes(DEFAULT_LANGUAGE) ? DEFAULT_LANGUAGE : (SUPPORTED_LANGUAGES[0] || DEFAULT_LANGUAGE);
    }

    function t(key, variables, fallback) {
        const dictionary = TRANSLATIONS[currentLanguage] || {};
        const englishDictionary = TRANSLATIONS.en || {};
        const value = getByPath(dictionary, key) ?? getByPath(englishDictionary, key) ?? fallback ?? key;
        return interpolate(value, variables || {});
    }

    function applyTranslations() {
        document.querySelectorAll('[data-i18n]').forEach(function (element) {
            element.innerHTML = t(element.dataset.i18n);
        });

        document.querySelectorAll('[data-i18n-text]').forEach(function (element) {
            element.textContent = t(element.dataset.i18nText);
        });

        document.querySelectorAll('[data-i18n-placeholder]').forEach(function (element) {
            element.setAttribute('placeholder', t(element.dataset.i18nPlaceholder));
        });
    }

    function setLanguage(language) {
        if (!SUPPORTED_LANGUAGES.includes(language)) return;
        currentLanguage = language;
        localStorage.setItem(STORAGE_KEY, language);
        document.documentElement.setAttribute('lang', language);

        const languageSelect = document.getElementById('languageSelect');
        if (languageSelect && languageSelect.value !== language) {
            languageSelect.value = language;
        }

        applyTranslations();
        window.dispatchEvent(new CustomEvent('languagechange', { detail: { language: language } }));
    }

    function initLanguageSwitcher() {
        const languageSelect = document.getElementById('languageSelect');
        if (!languageSelect) return;
        languageSelect.addEventListener('change', function (event) {
            setLanguage(event.target.value);
        });
    }

    function init() {
        setLanguage(getPreferredLanguage());
        initLanguageSwitcher();
    }

    window.i18n = {
        t: t,
        setLanguage: setLanguage,
        getLanguage: function () { return currentLanguage; },
        getSupportedLanguages: function () { return SUPPORTED_LANGUAGES.slice(); }
    };
    window.t = t;

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
