(function () {
'use strict';
var T = window.SITE_THEME;
var C = window.SITE_CONFIG || {};
var cfg = C.appearance || {};
var tr = window.SITE_T || function (v) { return v && typeof v === 'object' ? (v.ru || '') : (v || ''); };
var UI = window.SITE_LANG === 'en'
? { button: 'Appearance', title: 'Brightness', accent: 'Accent color', custom: 'Custom',
hue: 'Hue', sat: 'Saturation', hex: 'Color code', base: 'Default color' }
: { button: 'Оформление', title: 'Яркость темы', accent: 'Акцентный цвет', custom: 'Другое',
hue: 'Оттенок', sat: 'Насыщенность', hex: 'Код цвета', base: 'Базовый цвет' };
var btn = document.querySelector('.theme-toggle');
var panel = document.querySelector('[data-section="panel"]');
if (!T || !btn || !panel) return;
btn.setAttribute('aria-label', UI.button);
var taps = 0, lastTap = 0;
function countTap() {
var now = Date.now();
taps = now - lastTap < 450 ? taps + 1 : 1;
lastTap = now;
if (taps === 3 && window.SITE_EGGS) { taps = 0; window.SITE_EGGS.rgb(); return 3; }
return Math.min(taps, 2);
}
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
return (i === 1 ? '<span class="accents__sep" aria-hidden="true" style="--i:4"></span>' : '') +
'<button class="accent' + (i === 0 ? ' accent--base' : '') + (on ? ' is-on' : '') + '" type="button"' +
' data-accent="' + i + '" style="--i:' + (i ? i + 4 : 3) + '">' +
'<span class="accent__dot" style="background:' + esc(a.accent) + '"></span>' +
'<span class="accent__name">' + esc(i === 0 ? (tr(cfg.baseLabel) || UI.base) : tr(a.name)) + '</span>' +
'<svg class="accent__tick" viewBox="0 0 24 24" width="16" height="16" fill="none" ' +
'stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">' +
'<path d="M4 12.5 9.5 18 20 7"/></svg>' +
'</button>';
}).join('');
html += '<button class="accent accent--custom' + (cur.custom ? ' is-on' : '') + '" type="button"' +
' style="--i:' + (list.length + 4) + '"' +
' data-custom aria-expanded="' + (picker && !picker.hidden ? 'true' : 'false') + '">' +
'<span class="accent__dot accent__dot--custom"' +
(cur.custom ? ' style="background:' + esc(cur.custom) + ';border-style:solid"' : '') + '></span>' +
'<span class="accent__name">' + esc(tr(cfg.customLabel) || UI.custom) + '</span>' +
'<svg class="accent__tick" viewBox="0 0 24 24" width="16" height="16" fill="none" ' +
'stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">' +
'<path d="M4 12.5 9.5 18 20 7"/></svg>' +
'</button>';
fill('panel-accents', html);
}
var picker = null, pick = { h: 15, s: 64, l: 58 };
function hexToHsl(hex) {
var n = parseInt(hex.slice(1), 16);
var r = (n >> 16 & 255) / 255, g = (n >> 8 & 255) / 255, b = (n & 255) / 255;
var max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
var h = 0, l = (max + min) / 2, s = d ? d / (1 - Math.abs(2 * l - 1)) : 0;
if (d) {
h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
h = (h * 60 + 360) % 360;
}
return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) };
}
function hslToHex(h, s, l) {
s /= 100; l /= 100;
var k = function (n) { return (n + h / 30) % 12; };
var a = s * Math.min(l, 1 - l);
var f = function (n) {
var v = l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
return ('0' + Math.round(v * 255).toString(16)).slice(-2);
};
return '#' + f(0) + f(8) + f(4);
}
function cleanHex(v) {
var m = /^#?([0-9a-f]{6})$/i.exec(String(v).trim());
return m ? '#' + m[1].toLowerCase() : null;
}
function buildPicker() {
picker = document.createElement('div');
picker.className = 'picker';
picker.hidden = true;
picker.innerHTML =
'<div class="picker__top">' +
'<span class="picker__swatch" aria-hidden="true"></span>' +
'<input class="picker__hex" type="text" maxlength="7" spellcheck="false" autocomplete="off"' +
' autocapitalize="off" aria-label="' + esc(UI.hex) + '">' +
'</div>' +
'<label class="picker__label">' + esc(UI.hue) +
'<input class="picker__range picker__range--hue" type="range" min="0" max="359" step="1"></label>' +
'<label class="picker__label">' + esc(UI.sat) +
'<input class="picker__range picker__range--sat" type="range" min="10" max="100" step="1"></label>';
var box = slot('panel-accents');
box.parentNode.insertBefore(picker, box.nextSibling);
var hue = picker.querySelector('.picker__range--hue');
var sat = picker.querySelector('.picker__range--sat');
var hex = picker.querySelector('.picker__hex');
function fromSliders() {
pick.h = +hue.value; pick.s = +sat.value;
T.setCustom(hslToHex(pick.h, pick.s, pick.l));
refresh();
}
hue.addEventListener('input', fromSliders);
sat.addEventListener('input', fromSliders);
hex.addEventListener('input', function () {
var v = cleanHex(hex.value);
hex.classList.toggle('is-bad', !v && hex.value.length >= 7);
if (!v) return;
pick = hexToHsl(v);
T.setCustom(v);
refresh();
});
hex.addEventListener('blur', function () { hex.classList.remove('is-bad'); syncPicker(true); });
hex.addEventListener('keydown', function (e) { if (e.key === 'Enter') hex.blur(); });
}
function syncPicker(force) {
if (!picker) return;
var cur = T.state.custom;
if (cur && cleanHex(cur)) {
var hsl = hexToHsl(cur);
if (document.activeElement && document.activeElement.classList.contains('picker__range')) hsl = pick;
pick = hsl;
}
var color = hslToHex(pick.h, pick.s, pick.l);
picker.style.setProperty('--pick', cur || color);
picker.style.setProperty('--pick-h', pick.h);
picker.style.setProperty('--pick-l', pick.l + '%');
var hue = picker.querySelector('.picker__range--hue');
var sat = picker.querySelector('.picker__range--sat');
var hex = picker.querySelector('.picker__hex');
if (document.activeElement !== hue) hue.value = pick.h;
if (document.activeElement !== sat) sat.value = pick.s;
if (force || document.activeElement !== hex) hex.value = (cur || color).toUpperCase();
}
function showPicker(yes) {
if (!picker) buildPicker();
picker.hidden = !yes;
var b = panel.querySelector('[data-custom]');
if (b) b.setAttribute('aria-expanded', yes ? 'true' : 'false');
if (yes) syncPicker(true);
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
syncPicker();
if (window.SITE_ON_THEME) window.SITE_ON_THEME();
}
refresh();
var still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
var wave = null, waveAnim = null, pending = null;
var FAST = 4;
function morph(x, y, fn) {
if (still || !document.startViewTransition) { fn(); return; }
if (wave) {
pending = { x: x, y: y, fn: fn };
if (waveAnim) waveAnim.playbackRate = FAST;
return;
}
run(x, y, fn);
}
function run(x, y, fn) {
var root = document.documentElement;
root.classList.add('vt-theme');
var done = function () {
wave = null; waveAnim = null;
if (pending) { var p = pending; pending = null; run(p.x, p.y, p.fn); return; }
root.classList.remove('vt-theme');
};
try { wave = document.startViewTransition(fn); }
catch (e) { wave = null; root.classList.remove('vt-theme'); fn(); return; }
var w = window.innerWidth, h = window.innerHeight;
var r = Math.hypot(Math.max(x, w - x), Math.max(y, h - y));
wave.ready.then(function () {
waveAnim = root.animate({ clipPath: ['circle(0px at ' + x + 'px ' + y + 'px)', 'circle(' + r + 'px at ' + x + 'px ' + y + 'px)'] },
{ duration: 720, easing: 'cubic-bezier(.45, .05, .2, 1)', pseudoElement: '::view-transition-new(root)' });
if (pending) waveAnim.playbackRate = FAST;
}).catch(function () {});
wave.finished.then(done, done);
}
function center(el) {
var b = el.getBoundingClientRect();
return [b.left + b.width / 2, b.top + b.height / 2];
}
range.addEventListener('input', function () {
var v = +range.value, b = range.getBoundingClientRect(), max = +range.max || 1;
var x = b.left + 10.5 + (b.width - 21) * v / max;
morph(x, b.top + b.height / 2, function () { T.setLevel(v); refresh(); });
});
panel.addEventListener('click', function (e) {
var c = e.target.closest && e.target.closest('[data-custom]');
if (c) {
var opening = !picker || picker.hidden;
if (opening && !T.state.custom) {
var now = T.current && T.current();
var start = now && cleanHex(now.accent) || hslToHex(pick.h, pick.s, pick.l);
pick = hexToHsl(start);
T.setCustom(start);
}
showPicker(opening);
refresh();
return;
}
var b = e.target.closest && e.target.closest('[data-accent]');
if (!b) return;
var i = +b.dataset.accent, dot = b.querySelector('.accent__dot') || b, c = center(dot);
morph(c[0], c[1], function () {
T.setAccent(i);
showPicker(false);
refresh();
var now = panel.querySelector('[data-accent="' + i + '"]');
if (now) now.classList.add('just-on');
});
});
var isOpen = false, tOpen = 0, tClose = 0;
function open(yes) {
isOpen = yes;
clearTimeout(tOpen); clearTimeout(tClose);
if (yes) {
panel.classList.remove('is-closing');
panel.hidden = false;
panel.classList.add('is-opening');
tOpen = setTimeout(function () { panel.classList.remove('is-opening'); }, 900);
} else if (!panel.hidden) {
panel.classList.remove('is-opening');
if (still) { panel.hidden = true; }
else {
panel.classList.add('is-closing');
tClose = setTimeout(function () { panel.hidden = true; panel.classList.remove('is-closing'); }, 200);
}
}
btn.setAttribute('aria-expanded', yes ? 'true' : 'false');
btn.classList.toggle('is-open', yes);
}
btn.addEventListener('click', function (e) {
e.stopPropagation();
var n = countTap();
if (n === 3) { open(false); return; }
if (n === 2) return;
open(!isOpen);
});
document.addEventListener('site-theme', refresh);
panel.addEventListener('click', function (e) { e.stopPropagation(); });
document.addEventListener('click', function () { if (isOpen) open(false); });
document.addEventListener('keydown', function (e) {
if (e.key === 'Escape' && isOpen) { open(false); btn.focus(); }
});
var mq = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)');
if (mq && mq.addEventListener) {
mq.addEventListener('change', function () { if (!T.state.touched) refresh(); });
}
})();
