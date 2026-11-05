/* =============================================================================
   Уведомление о куки и Яндекс.Метрика
   -----------------------------------------------------------------------------
   Пока в config.js не вписан номер счётчика (analytics.metrika), файл ничего
   не делает: сайт не ставит куки, и сообщать гостю не о чем.

   С номером — спрашивает согласие и только после «Принять» подключает
   Метрику. Ответ хранится у гостя в браузере. Передумать можно на странице
   /privacy/: там кнопки «Разрешить» и «Запретить», а при отказе куки
   Метрики с этого сайта стираются.
   ========================================================================== */
(function () {
  'use strict';

  var A = (window.SITE_CONFIG || {}).analytics || {};
  var ID = String(A.metrika || '').replace(/\D/g, '');
  var KEY = 'cookie-consent';
  var EN = window.SITE_LANG === 'en';
  var tr = window.SITE_T || function (v) { return v && typeof v === 'object' ? (v.ru || '') : (v || ''); };

  // Политика одна на оба языка, английский текст в ней включается параметром
  var POLICY = EN ? '/privacy/?lang=en' : '/privacy/';
  var UI = EN ? {
    text: 'I use cookies and Yandex Metrica to see how many people visit ' +
          'this page. The counter stays off unless you agree.',
    more: 'Details', yes: 'Accept', no: 'Decline', region: 'Cookie notice',
    stateYes: 'counter allowed', stateNo: 'counter denied',
    stateNone: 'you haven’t decided yet — the counter is off'
  } : {
    text: 'Я использую куки и Яндекс.Метрику, чтобы видеть, сколько людей заходит ' +
          'на страницу. Без вашего согласия счётчик не включится.',
    more: 'Подробнее', yes: 'Принять', no: 'Отказаться', region: 'Уведомление о куки',
    stateYes: 'счётчик разрешён', stateNo: 'счётчик запрещён',
    stateNone: 'вы ещё не решили — счётчик выключен'
  };
  var TEXT = tr(A.text) || UI.text;

  // Страница политики показывает решение и даёт его поменять — баннер там лишний
  var onPolicy = !!document.querySelector('[data-consent-page]');

  window.SITE_CONSENT = { enabled: !!ID, get: get };
  document.documentElement.setAttribute('data-metrika', ID ? 'on' : 'off');
  if (!ID) return;

  function get() {
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
  }
  function save(v) {
    try { localStorage.setItem(KEY, v); } catch (e) {}
  }

  /* --- Метрика ------------------------------------------------------------- */
  var loaded = false;
  function loadMetrika() {
    if (loaded) return;
    loaded = true;
    // Официальный код счётчика, только без Вебвизора и без пикселя для
    // гостей без скриптов: тот срабатывал бы и без согласия
    window.ym = window.ym || function () { (window.ym.a = window.ym.a || []).push(arguments); };
    window.ym.l = +new Date();
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://mc.yandex.ru/metrika/tag.js';
    document.head.appendChild(s);
    window.ym(+ID, 'init', {
      clickmap: true,            // куда нажимают на странице
      trackLinks: true,          // переходы по ссылкам наружу — какие соцсети открывают
      accurateTrackBounce: true,
      webvisor: false
    });
  }

  /* Отказ после согласия: стираем куки и записи Метрики на этом сайте.
     Пробуем все уровни домена — куки могли поставить на любой из них.   */
  function clearMetrika() {
    var parts = location.hostname.split('.');
    var domains = [''];
    for (var i = 0; i < parts.length - 1; i++) domains.push('; domain=.' + parts.slice(i).join('.'));
    document.cookie.split(';').forEach(function (c) {
      var name = c.split('=')[0].trim();
      if (name.indexOf('_ym') !== 0) return;
      domains.forEach(function (d) {
        document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/' + d;
      });
    });
    try {
      Object.keys(localStorage).forEach(function (k) {
        if (k.indexOf('_ym') === 0) localStorage.removeItem(k);
      });
    } catch (e) {}
  }

  /* --- Решение гостя ------------------------------------------------------- */
  function decide(v) {
    var was = get();
    save(v);
    if (v === 'yes') loadMetrika();
    if (v === 'no' && was === 'yes') {
      clearMetrika();
      // Уже запущенный счётчик не выключить — перезагрузка его просто не подключит
      if (loaded) { location.reload(); return; }
    }
    showState();
  }

  // Текущее решение на странице политики (там по блоку на каждый язык)
  function showState() {
    var v = get();
    Array.prototype.forEach.call(document.querySelectorAll('[data-bind="consent-state"]'), function (el) {
      el.textContent = v === 'yes' ? UI.stateYes : v === 'no' ? UI.stateNo : UI.stateNone;
      el.setAttribute('data-state', v || 'none');
    });
    // Уже выбранный вариант нажимать незачем — гасим его кнопку
    Array.prototype.forEach.call(document.querySelectorAll('.choice [data-consent]'), function (b) {
      b.disabled = b.getAttribute('data-consent') === v;
    });
  }

  /* --- Уведомление --------------------------------------------------------- */
  function banner() {
    var box = document.createElement('div');
    box.className = 'cookie';
    box.setAttribute('role', 'region');
    box.setAttribute('aria-label', UI.region);
    box.innerHTML =
      '<p class="cookie__text">' + String(TEXT).replace(/</g, '&lt;') +
      ' <a href="' + POLICY + '">' + UI.more + '</a></p>' +
      '<div class="cookie__actions">' +
        '<button class="cookie__btn cookie__btn--main" type="button" data-consent="yes">' + UI.yes + '</button>' +
        '<button class="cookie__btn" type="button" data-consent="no">' + UI.no + '</button>' +
      '</div>';
    document.body.appendChild(box);
    return box;
  }

  function hide(box) {
    box.classList.add('is-out');
    setTimeout(function () { box.remove(); }, 320);
  }

  document.addEventListener('click', function (e) {
    var btn = e.target.closest && e.target.closest('[data-consent]');
    if (!btn) return;
    decide(btn.getAttribute('data-consent'));
    var box = btn.closest('.cookie');
    if (box) hide(box);
  });

  /* --- Старт --------------------------------------------------------------- */
  var v = get();
  if (v === 'yes') loadMetrika();
  if (onPolicy) showState();
  else if (v !== 'yes' && v !== 'no') banner();
})();
