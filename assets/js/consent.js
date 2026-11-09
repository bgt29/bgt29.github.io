(function () {
'use strict';
var A = (window.SITE_CONFIG || {}).analytics || {};
var ID = String(A.metrika || '').replace(/\D/g, '');
var KEY = 'cookie-consent';
var EN = window.SITE_LANG === 'en';
var tr = window.SITE_T || function (v) { return v && typeof v === 'object' ? (v.ru || '') : (v || ''); };
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
var loaded = false;
document.addEventListener('site-pageview', function (e) {
if (!loaded || !window.ym) return;
var from = e.detail && e.detail.from;
window.ym(+ID, 'hit', location.href, from ? { title: document.title, referer: from } : { title: document.title });
});
function loadMetrika() {
if (loaded) return;
if (document.prerendering) {
document.addEventListener('prerenderingchange', loadMetrika, { once: true });
return;
}
loaded = true;
window.ym = window.ym || function () { (window.ym.a = window.ym.a || []).push(arguments); };
window.ym.l = +new Date();
var s = document.createElement('script');
s.async = true;
s.src = 'https://mc.yandex.ru/metrika/tag.js';
document.head.appendChild(s);
window.ym(+ID, 'init', {
clickmap: true,
trackLinks: true,
accurateTrackBounce: true,
webvisor: false
});
}
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
function decide(v) {
var was = get();
save(v);
if (v === 'yes') loadMetrika();
if (v === 'no' && was === 'yes') {
clearMetrika();
if (loaded) { location.reload(); return; }
}
showState();
}
function showState() {
var v = get();
Array.prototype.forEach.call(document.querySelectorAll('[data-bind="consent-state"]'), function (el) {
el.textContent = v === 'yes' ? UI.stateYes : v === 'no' ? UI.stateNo : UI.stateNone;
el.setAttribute('data-state', v || 'none');
});
Array.prototype.forEach.call(document.querySelectorAll('.choice [data-consent]'), function (b) {
b.disabled = b.getAttribute('data-consent') === v;
});
}
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
var v = get();
if (v === 'yes') loadMetrika();
if (onPolicy) showState();
else if (v !== 'yes' && v !== 'no') banner();
})();
