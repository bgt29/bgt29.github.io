(function () {
'use strict';
var LEVELS = [
{ name: { ru: 'Ночь', en: 'Night' },       dark: true,  glow: .85,
bg: [20, 22,  4], card: [20, 20,  8], text: [26, 55, 93], dim: [24, 22, 62], faint: [23, 16, 46] },
{ name: { ru: 'Тёмная', en: 'Dark' },      dark: true,  glow: 1,
bg: [20, 21,  9], card: [20, 19, 13], text: [26, 55, 92], dim: [24, 24, 66], faint: [23, 16, 50] },
{ name: { ru: 'Сумерки', en: 'Dusk' },     dark: true,  glow: .8,
bg: [22, 18, 17], card: [22, 16, 23], text: [28, 45, 91], dim: [24, 20, 71], faint: [23, 14, 57] },
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
if (typeof saved.accentHex === 'string') {
var at = accents().map(function (a) { return String(a.accent).toLowerCase(); })
.indexOf(saved.accentHex.toLowerCase());
if (at >= 0) state.accent = at;
}
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
var BASE_HUE = 16;
var turn = 0, calm = 1;
function tone(c) {
var h = ((c[0] + turn) % 360 + 360) % 360;
return [Math.round(h), Math.round(c[1] * calm * 10) / 10, c[2]];
}
function apply() {
var root = document.documentElement;
var s = root.style;
var lv = LEVELS[state.level];
var ac = currentAccent();
var dark = lv.dark;
var rgb = hexToRgb(ac.accent);
var grey = !rgb || Math.max(rgb[0], rgb[1], rgb[2]) - Math.min(rgb[0], rgb[1], rgb[2]) < 12;
turn = grey ? 0 : hue(ac.accent) - BASE_HUE;
var dist = Math.abs(((turn % 360) + 540) % 360 - 180);
calm = 1 - (dark ? .4 : .12) * dist / 180;
root.dataset.theme = dark ? 'dark' : 'light';
s.setProperty('--bg', hsl(tone(lv.bg)));
s.setProperty('--card', hsl(tone(lv.card)));
s.setProperty('--card-hover', hsl(tone(lv.card), dark ? 4 : 1));
s.setProperty('--text', hsl(tone(lv.text)));
s.setProperty('--text-dim', hsl(tone(lv.dim)));
s.setProperty('--text-faint', hsl(tone(lv.faint)));
var t = tone([BASE_HUE + 8, 100, 0])[0], sc = Math.round(34 * calm);
var ink = function (l, a) { return 'hsla(' + t + ', ' + sc + '%, ' + l + '%, ' + a + ')'; };
s.setProperty('--stroke', dark ? 'hsla(' + t + ', ' + Math.round(100 * calm) + '%, 89%, .10)' : ink(36, .14));
s.setProperty('--shadow', dark ? '0 2px 4px rgba(0, 0, 0, .2)' : '0 2px 4px ' + ink(36, .05));
s.setProperty('--shadow-lift', dark ? '0 12px 28px -10px rgba(0, 0, 0, .5)'
: '0 12px 28px -10px ' + ink(36, .26));
s.setProperty('--tile-shadow', dark
? '0 1px 0 rgba(255, 255, 255, .04) inset, 0 16px 32px -20px rgba(0, 0, 0, .65)'
: '0 1px 0 rgba(255, 255, 255, .8) inset, 0 14px 30px -22px hsla(' + (t - 4) + ', ' + Math.round(60 * calm) + '%, 20%, .45)');
s.setProperty('--accent', ac.accent);
s.setProperty('--accent-2', ac.accent2 || ac.accent);
s.setProperty('--tint', rgba(ac.accent, dark ? .15 : .1));
s.setProperty('--stroke-hover', rgba(ac.accent, dark ? .5 : .42));
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
level: state.level, accent: state.accent, custom: state.custom,
accentHex: (accents()[state.accent] || {}).accent || ''
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
var SCALES = [0.7, 0.8, 0.9, 1, 1.1, 1.2, 1.3];
var wide = window.matchMedia ? window.matchMedia('(min-width: 740px)') : null;
var scaleAt = SCALES.indexOf(1);
try {
var savedScale = SCALES.indexOf(+localStorage.getItem('site-scale'));
if (savedScale >= 0) scaleAt = savedScale;
} catch (e) {}
function applyScale() {
var z = wide && !wide.matches ? 1 : SCALES[scaleAt];
document.documentElement.style.zoom = z === 1 ? '' : String(z);
}
applyScale();
if (wide && wide.addEventListener) wide.addEventListener('change', applyScale);
window.SITE_THEME.scales = SCALES;
window.SITE_THEME.scale = function () { return scaleAt; };
window.SITE_THEME.setScale = function (i) {
scaleAt = Math.max(0, Math.min(SCALES.length - 1, i));
try { localStorage.setItem('site-scale', String(SCALES[scaleAt])); } catch (e) {}
applyScale();
try { window.dispatchEvent(new Event('resize')); } catch (e) {}
};
var mq = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)');
if (mq && mq.addEventListener) {
mq.addEventListener('change', function () {
if (state.touched) return;
state.level = systemLevel();
apply();
if (window.SITE_ON_THEME) window.SITE_ON_THEME();
});
}
var root = document.documentElement;
root.classList.add('js');
var still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (!still) {
root.classList.add('motion');
setTimeout(function () {
if (!root.classList.contains('motion-go')) root.classList.add('motion-fail');
}, 2500);
window.addEventListener('pagereveal', function (e) {
if (e.viewTransition) root.classList.add('vt-nav');
});
}
})();
