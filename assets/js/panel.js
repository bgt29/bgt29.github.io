/* =============================================================================
   Панель оформления: ползунок яркости и выбор акцентного цвета.
   Саму палитру считает assets/js/theme.js — здесь только интерфейс к ней.
   ========================================================================== */
(function () {
  'use strict';

  var T = window.SITE_THEME;
  var C = window.SITE_CONFIG || {};
  var cfg = C.appearance || {};
  // Текст на языке страницы из пары { ru, en } — см. assets/js/i18n.js
  var tr = window.SITE_T || function (v) { return v && typeof v === 'object' ? (v.ru || '') : (v || ''); };
  var UI = window.SITE_LANG === 'en'
    ? { button: 'Appearance', title: 'Brightness', accent: 'Accent color', custom: 'Custom' }
    : { button: 'Оформление', title: 'Яркость темы', accent: 'Акцентный цвет', custom: 'Другое' };

  var btn = document.querySelector('.theme-toggle');
  var panel = document.querySelector('[data-section="panel"]');
  if (!T || !btn || !panel) return;
  btn.setAttribute('aria-label', UI.button);

  /* Пасхалка: три быстрых нажатия на кнопку — RGB-режим (assets/js/eggs.js).
     Считаем нажатия сами, а не по e.detail: на телефонах он не растёт.
     Возвращает: 1 — обычное нажатие, 2 — второе подряд (пропускаем, вдруг
     будет третье), 3 — RGB включён или выключен.                         */
  var taps = 0, lastTap = 0;
  function countTap() {
    var now = Date.now();
    taps = now - lastTap < 450 ? taps + 1 : 1;
    lastTap = now;
    if (taps === 3 && window.SITE_EGGS) { taps = 0; window.SITE_EGGS.rgb(); return 3; }
    return Math.min(taps, 2);
  }

  // Панель выключена в конфиге — кнопка просто переключает светлую и тёмную
  if (cfg.enabled === false) {
    panel.remove();
    btn.addEventListener('click', function () {
      if (countTap() !== 1) return;
      T.setLevel(T.state.level < 3 ? 3 : 1);
      if (window.SITE_ON_THEME) window.SITE_ON_THEME();
    });
    return;
  }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
  function slot(n) { return document.querySelector('[data-bind="' + n + '"]'); }
  function fill(n, html) { var el = slot(n); if (el) el.innerHTML = html; }

  var range = panel.querySelector('.bright__input');

  /* --- Отрисовка ---------------------------------------------------------- */
  var title = tr(cfg.title) || UI.title;
  fill('panel-title', esc(title));
  fill('panel-accent-title', esc(tr(cfg.accentTitle) || UI.accent));
  range.setAttribute('aria-label', title);

  fill('panel-dots', T.levels.map(function () {
    return '<span class="bright__dot"></span>';
  }).join(''));

  function renderAccents() {
    var list = T.accents();
    var cur = T.state;
    var html = list.map(function (a, i) {
      var on = !cur.custom && i === cur.accent;
      return '<button class="accent' + (on ? ' is-on' : '') + '" type="button" data-accent="' + i + '">' +
        '<span class="accent__dot" style="background:' + esc(a.accent) + '"></span>' +
        '<span class="accent__name">' + esc(tr(a.name)) + '</span>' +
        '<svg class="accent__tick" viewBox="0 0 24 24" width="16" height="16" fill="none" ' +
        'stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">' +
        '<path d="M4 12.5 9.5 18 20 7"/></svg>' +
        '</button>';
    }).join('');

    // Свой цвет — системный выбор палитры браузера
    html += '<label class="accent accent--custom' + (cur.custom ? ' is-on' : '') + '">' +
      '<span class="accent__dot accent__dot--custom"' +
      (cur.custom ? ' style="background:' + esc(cur.custom) + ';border-style:solid"' : '') + '></span>' +
      '<span class="accent__name">' + esc(tr(cfg.customLabel) || UI.custom) + '</span>' +
      '<input class="accent__pick" type="color" value="' + esc(cur.custom || '#d9744f') + '">' +
      '</label>';

    fill('panel-accents', html);
  }

  function syncLevel() {
    range.value = T.state.level;
    var el = slot('panel-level');
    if (el) el.textContent = tr(T.levels[T.state.level].name);

    var dots = panel.querySelectorAll('.bright__dot');
    Array.prototype.forEach.call(dots, function (d, i) {
      d.classList.toggle('is-on', i === T.state.level);
    });
  }

  function refresh() {
    syncLevel();
    renderAccents();
    if (window.SITE_ON_THEME) window.SITE_ON_THEME();
  }

  refresh();

  /* --- Управление --------------------------------------------------------- */
  range.addEventListener('input', function () {
    T.setLevel(+range.value);
    refresh();
  });

  panel.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-accent]');
    if (!b) return;
    T.setAccent(+b.dataset.accent);
    refresh();
  });

  panel.addEventListener('input', function (e) {
    if (!e.target.classList || !e.target.classList.contains('accent__pick')) return;
    T.setCustom(e.target.value);
    refresh();
  });

  /* --- Открытие и закрытие ------------------------------------------------- */
  function open(yes) {
    panel.hidden = !yes;
    btn.setAttribute('aria-expanded', yes ? 'true' : 'false');
    btn.classList.toggle('is-open', yes);
  }

  btn.addEventListener('click', function (e) {
    e.stopPropagation();
    var n = countTap();
    if (n === 3) { open(false); return; }   // RGB — панель убираем
    if (n === 2) return;                     // ждём, не будет ли третьего
    open(panel.hidden);
  });

  // Тему поменяли не из панели (например, командой в терминале) — обновить подписи
  document.addEventListener('site-theme', refresh);

  // Клик мимо панели и Esc — закрыть. Внутри панели клики не считаются.
  panel.addEventListener('click', function (e) { e.stopPropagation(); });
  document.addEventListener('click', function () { if (!panel.hidden) open(false); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !panel.hidden) { open(false); btn.focus(); }
  });

  // Системная тема сменилась, а гость ничего не выбирал — обновить подписи
  var mq = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)');
  if (mq && mq.addEventListener) {
    mq.addEventListener('change', function () { if (!T.state.touched) refresh(); });
  }
})();
