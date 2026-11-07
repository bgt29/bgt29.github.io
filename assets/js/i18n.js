(function () {
'use strict';
var lang = String(document.documentElement.lang || 'ru').slice(0, 2).toLowerCase();
if (lang !== 'en') lang = 'ru';
function t(v) {
if (v && typeof v === 'object' && !Array.isArray(v)) {
var s = v[lang];
return s != null && s !== '' ? s : (v.ru != null ? v.ru : '');
}
return v == null ? '' : v;
}
var english = (window.SITE_CONFIG || {}).english;
window.SITE_LANG = lang;
window.SITE_T = t;
window.SITE_HAS_EN = !!(english && english.enabled !== false);
})();
