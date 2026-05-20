function tMessage(key, variables, fallback) {
    if (window.i18n && typeof window.i18n.t === 'function') {
        return window.i18n.t(key, variables, fallback);
    }
    return fallback || key;
}
