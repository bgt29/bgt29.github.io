/* =============================================================================
   Язык страницы: русский или английский.

   Язык задаёт сама страница — атрибут lang у <html>: главная — ru,
   /en/ — en. Тексты в config.js бывают двух видов:
     'Telegram'                                         — одинаково везде;
     { ru: 'Телеграм профиль', en: 'Telegram profile' } — на каждом языке свой.
   SITE_T(значение) отдаёт нужный вариант. Английского нет — берётся русский,
   а сборка подскажет, где перевод забыли.

   Подключается в <head> после config.js, до остальных скриптов.
   ========================================================================== */
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
  // Английская версия включена в конфиге — есть куда переключаться
  window.SITE_HAS_EN = !!(english && english.enabled !== false);
})();
