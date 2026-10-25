/* =============================================================================
   Оформление: яркость темы и акцентный цвет.

   Файл подключается в <head> ДО отрисовки. Иначе гость, выбравший себе тему,
   на долю секунды увидит стандартную, и страница мигнёт.

   Палитра считается из двух вещей: уровня яркости и акцента. Остальные цвета —
   карточки, обводки, текст, фоновые пятна — выводятся из них, поэтому новый
   акцент не требует правки CSS.
   ========================================================================== */
(function () {
  'use strict';

  /* Уровни яркости. Каждый цвет задан как [тон, насыщенность, светлота].
     Тона тёплые — от 20 до 36 градусов, чтобы гамма не уезжала в синеву.   */
  /* glow — сила фоновых пятен. Чем светлее уровень, тем слабее: на почти белом
     фоне цветная подсветка забивает всё и вид получается выцветшим.         */
  var LEVELS = [
    { name: { ru: 'Ночь', en: 'Night' },       dark: true,  glow: .85,
      bg: [20, 22,  4], card: [20, 20,  8], text: [26, 55, 93], dim: [24, 22, 62], faint: [23, 16, 46] },
    { name: { ru: 'Тёмная', en: 'Dark' },      dark: true,  glow: 1,
      bg: [20, 21,  9], card: [20, 19, 13], text: [26, 55, 92], dim: [24, 24, 66], faint: [23, 16, 50] },
    { name: { ru: 'Сумерки', en: 'Dusk' },     dark: true,  glow: .8,
      bg: [22, 18, 17], card: [22, 16, 23], text: [28, 45, 91], dim: [24, 20, 71], faint: [23, 14, 57] },
    /* Фон светлых уровней чуть темнее плиток — иначе белые плитки на почти
       белом фоне сливаются и сетка теряется                               */
    { name: { ru: 'Светлая', en: 'Light' },    dark: false, glow: 1,
      bg: [33, 45, 91], card: [34, 100, 98.5], text: [24, 26, 13], dim: [24, 19, 40], faint: [24, 17, 54] },
    { name: { ru: 'Дневная', en: 'Daylight' }, dark: false, glow: .5,
      bg: [36, 30, 95], card: [0, 0, 100], text: [24, 28, 12], dim: [24, 18, 38], faint: [24, 16, 52] }
  ];

  var FALLBACK_ACCENTS = [
    { name: 'Терракота', accent: '#d9744f', accent2: '#e8a04b' }
  ];

  function accents() {
    var a = ((window.SITE_CONFIG || {}).appearance || {}).accents;
    return (a && a.length) ? a : FALLBACK_ACCENTS;
  }

  function hsl(c, shift) {
    return 'hsl(' + c[0] + ', ' + c[1] + '%, ' + (c[2] + (shift || 0)) + '%)';
  }

  function hexToRgb(s) {
    s = String(s || '').trim().replace('#', '');
    if (s.length === 3) s = s[0] + s[0] + s[1] + s[1] + s[2] + s[2];
    if (!/^[0-9a-f]{6}$/i.test(s)) return null;
    return [parseInt(s.slice(0, 2), 16), parseInt(s.slice(2, 4), 16), parseInt(s.slice(4, 6), 16)];
  }

  function rgba(hex, a) {
    var c = hexToRgb(hex);
    return c ? 'rgba(' + c[0] + ', ' + c[1] + ', ' + c[2] + ', ' + a + ')' : 'transparent';
  }

  function hue(hex) {
    var c = hexToRgb(hex);
    if (!c) return 22;
    var r = c[0] / 255, g = c[1] / 255, b = c[2] / 255;
    var mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn, h = 0;
    if (!d) return 22;
    if (mx === r) h = (g - b) / d + (g < b ? 6 : 0);
    else if (mx === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    return h * 60;
  }

  /* --- Состояние ---------------------------------------------------------- */
  function systemLevel() {
    var dark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    return dark ? 1 : 3;
  }

  var state = { level: null, accent: 0, custom: null, touched: false };

  try {
    var raw = localStorage.getItem('appearance');
    if (raw) {
      var saved = JSON.parse(raw);
      if (typeof saved.level === 'number') state.level = saved.level;
      if (typeof saved.accent === 'number') state.accent = saved.accent;
      if (typeof saved.custom === 'string') state.custom = saved.custom;
      state.touched = true;
    }
  } catch (e) {}

  if (state.level === null) {
    var mode = ((window.SITE_CONFIG || {}).meta || {}).theme || 'auto';
    state.level = mode === 'dark' ? 1 : mode === 'light' ? 3 : systemLevel();
  }
  state.level = Math.max(0, Math.min(LEVELS.length - 1, state.level));

  function currentAccent() {
    if (state.custom) return { name: 'Свой', accent: state.custom, accent2: state.custom };
    var list = accents();
    return list[Math.max(0, Math.min(list.length - 1, state.accent))] || list[0];
  }

  /* --- Применение --------------------------------------------------------- */
  function apply() {
    var root = document.documentElement;
    var s = root.style;
    var lv = LEVELS[state.level];
    var ac = currentAccent();
    var dark = lv.dark;

    // Тёмная или светлая — от этого зависят иконка кнопки и пара мелочей в CSS
    root.dataset.theme = dark ? 'dark' : 'light';

    s.setProperty('--bg', hsl(lv.bg));
    s.setProperty('--card', hsl(lv.card));
    s.setProperty('--card-hover', hsl(lv.card, dark ? 4 : 1));
    s.setProperty('--text', hsl(lv.text));
    s.setProperty('--text-dim', hsl(lv.dim));
    s.setProperty('--text-faint', hsl(lv.faint));

    s.setProperty('--stroke', dark ? 'rgba(255, 226, 200, .10)' : 'rgba(122, 84, 60, .14)');
    s.setProperty('--shadow', dark ? '0 2px 4px rgba(0, 0, 0, .2)'
                                   : '0 2px 4px rgba(122, 84, 60, .05)');
    s.setProperty('--shadow-lift', dark ? '0 12px 28px -10px rgba(0, 0, 0, .5)'
                                        : '0 12px 28px -10px rgba(122, 84, 60, .26)');

    s.setProperty('--accent', ac.accent);
    s.setProperty('--accent-2', ac.accent2 || ac.accent);
    s.setProperty('--tint', rgba(ac.accent, dark ? .15 : .1));
    s.setProperty('--stroke-hover', rgba(ac.accent, dark ? .5 : .42));

    // Фоновые пятна — тоже от акцента, иначе при смене цвета фон остаётся чужим
    var h = Math.round(hue(ac.accent));
    var sat = dark ? 62 : 78;
    var k = lv.glow == null ? 1 : lv.glow;
    var a = function (v) { return Math.round(v * k * 1000) / 1000; };
    s.setProperty('--glow-1', 'hsla(' + (h + 6) + ', ' + sat + '%, 68%, ' + a(dark ? .20 : .34) + ')');
    s.setProperty('--glow-2', 'hsla(' + (h - 16) + ', ' + sat + '%, 72%, ' + a(dark ? .16 : .22) + ')');
    s.setProperty('--glow-3', 'hsla(' + (h + 15) + ', ' + sat + '%, 70%, ' + a(dark ? .13 : .28) + ')');
  }

  function save() {
    try {
      localStorage.setItem('appearance', JSON.stringify({
        level: state.level, accent: state.accent, custom: state.custom
      }));
    } catch (e) {}
    state.touched = true;
  }

  window.SITE_THEME = {
    levels: LEVELS,
    accents: accents,
    state: state,
    apply: apply,
    setLevel: function (i) {
      state.level = Math.max(0, Math.min(LEVELS.length - 1, i));
      save(); apply();
    },
    setAccent: function (i) {
      state.accent = i; state.custom = null;
      save(); apply();
    },
    setCustom: function (hex) {
      state.custom = hex;
      save(); apply();
    },
    current: currentAccent
  };

  apply();

  // Пока гость не выбрал сам — следуем за системной темой
  var mq = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)');
  if (mq && mq.addEventListener) {
    mq.addEventListener('change', function () {
      if (state.touched) return;
      state.level = systemLevel();
      apply();
      if (window.SITE_ON_THEME) window.SITE_ON_THEME();
    });
  }
})();
