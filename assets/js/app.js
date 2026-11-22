(function () {
'use strict';
var C = window.SITE_CONFIG;
if (!C) {
document.body.innerHTML = '<p style="padding:40px;font:16px sans-serif">' +
'Не найден assets/js/config.js</p>';
return;
}
var LANG = window.SITE_LANG || 'ru';
var T = window.SITE_T || function (v) { return v && typeof v === 'object' ? (v.ru || '') : (v || ''); };
var B = document.body;
var PAGE = B.getAttribute('data-page') || 'home';
if (!/^(portfolio|category|work|reviews|services|service|site|articles|article)$/.test(PAGE)) PAGE = 'home';
var ART = B.getAttribute('data-article') || '';
var CAT = B.getAttribute('data-cat') || '', WORK = B.getAttribute('data-work') || '';
var SVC = B.getAttribute('data-svc') || '';
function pathFor(lang, page) {
var p = '/';
if (page === 'portfolio') p = '/portfolio/';
else if (page === 'category') p = '/portfolio/' + CAT + '/';
else if (page === 'work') p = '/portfolio/' + CAT + '/' + WORK + '/';
else if (page === 'reviews') p = '/reviews/';
else if (page === 'services') p = '/services/';
else if (page === 'service') p = '/services/' + SVC + '/';
else if (page === 'site') p = '/about-site/';
else if (page === 'articles' || page === 'article') {
var arts = (C.articles || {}).items || [];
var cur = arts.filter(function (a) { return a && a.id === ART; })[0];
if (page === 'article' && (lang !== 'en' || artHasEn(cur))) p = '/articles/' + ART + '/';
else if (lang !== 'en' || arts.some(artHasEn)) p = '/articles/';
}
return (lang === 'en' ? '/en' : '') + p;
}
var UI = {
ru: { page: 'Личная страница', links: 'Мои ссылки', now: 'Сейчас',
copy: 'Скопировать адрес', copied: 'Адрес скопирован', copyByHand: 'Скопируй адрес:',
copyNick: 'Скопировать ник', nickCopied: 'Ник скопирован',
policy: 'Конфиденциальность и куки',
bug: 'Нашли ошибку? Напишите мне', bugDraft: 'Нашёл ошибку на странице ',
bugTo: 'Нашли ошибку? Напишите в', bugOr: 'или',
reviews: 'Отзывы', reviewsAll: 'Все отзывы', reviewsMore: 'Все отзывы', path: 'Где вы на сайте',
reviewCase: 'К работе', reviewProjects: 'Проекты', reviewsCount: function (n) {
var k = n % 10, h = n % 100;
return n + (k === 1 && h !== 11 ? ' отзыв' : k >= 2 && k <= 4 && (h < 12 || h > 14) ? ' отзыва' : ' отзывов');
},
tabLinks: 'Ссылки', tabWorks: 'Портфолио', tabs: 'Разделы сайта', qr: 'QR-код сайта', aboutSite: 'О сайте',
services: 'Услуги', deal: 'по договорённости', works: 'Работы', order: 'Как заказать',
write: 'Написать в Telegram', writeVk: 'Написать в ВК', seller: 'Исполнитель', inn: 'ИНН', offer: 'Договор-оферта',
other: { code: 'EN', lang: 'en', title: 'English version' } },
en: { page: 'Personal page', links: 'My links', now: 'Now',
copy: 'Copy address', copied: 'Address copied', copyByHand: 'Copy the address:',
copyNick: 'Copy username', nickCopied: 'Username copied',
policy: 'Privacy & cookies',
bug: 'Found a bug? Let me know', bugDraft: 'Found a bug on the page ',
bugTo: 'Found a bug? Message me on', bugOr: 'or',
reviews: 'Reviews', reviewsAll: 'All reviews', reviewsMore: 'All reviews', path: 'You are here',
reviewCase: 'See the work', reviewProjects: 'Projects', reviewsCount: function (n) { return n + (n === 1 ? ' review' : ' reviews'); },
tabLinks: 'Links', tabWorks: 'Portfolio', tabs: 'Site sections', qr: 'QR code of the site', aboutSite: 'About this site',
services: 'Services', deal: 'by agreement', works: 'Works', order: 'How to order',
write: 'Message me on Telegram', writeVk: 'Message me on VK', seller: 'Contractor', inn: 'TIN', offer: 'Public offer (in Russian)',
other: { code: 'RU', lang: 'ru', title: 'Русская версия' } }
}[LANG];
var P = C.portfolio || {};
var HAS_WORKS = P.enabled !== false && ((P.items || []).length > 0 || P.showEmpty === true);
var HAS_REVIEWS = !!(C.reviews && C.reviews.enabled !== false && (C.reviews.items || []).length);
var HAS_SERVICES = !!(C.services && C.services.enabled !== false && (C.services.pages || []).length);
function asset(p) {
p = String(p || '');
return !p || /^([a-z]+:|\/)/i.test(p) ? p : '/' + p;
}
var ICONS = window.SITE_ICONS || {};
var ICONS_LINE = {
link: '<path d="M10 13a5 5 0 0 0 7.5.5l3-3A5 5 0 0 0 13.4 3.4l-1.7 1.7"/><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7.1 7.1l1.7-1.7"/>',
arrow: '<path d="M5 12h13M12.5 6l6 6-6 6"/>',
copy: '<rect x="9" y="9" width="12" height="12" rx="2.5"/><path d="M5.5 15H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v.5"/>',
check: '<path d="M4 12.5 9.5 18 20 7"/>',
cpu: '<rect x="6" y="6" width="12" height="12" rx="2"/><rect x="9.5" y="9.5" width="5" height="5" rx=".8"/><path d="M9 3v3M15 3v3M9 18v3M15 18v3M3 9h3M3 15h3M18 9h3M18 15h3"/>',
gpu: '<rect x="2.5" y="6" width="19" height="11" rx="2"/><circle cx="9" cy="11.5" r="3"/><circle cx="16" cy="11.5" r="1.6"/><path d="M5 17v2.5M8 17v2.5"/>',
board: '<rect x="4" y="3.5" width="16" height="17" rx="2"/><rect x="7" y="6.5" width="5" height="5" rx="1"/><path d="M15 6.5v8M7 15h5M7 17.5h9"/>',
ram: '<rect x="2.5" y="8" width="19" height="7" rx="1.2"/><path d="M6 11h2M10 11h2M14 11h2M5 15v2.5M9 15v2.5M15 15v2.5M19 15v2.5"/>',
drive: '<rect x="3" y="7" width="18" height="10" rx="2"/><path d="M7 7v10"/><circle cx="16.5" cy="12" r="1.3"/>',
fan: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="1.6"/><path d="M12 10.4c0-3 1-4.5 3.2-4.6M13.6 12c3 0 4.5 1 4.6 3.2M12 13.6c0 3-1 4.5-3.2 4.6M10.4 12c-3 0-4.5-1-4.6-3.2"/>',
power: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M13 8.5l-3 4h4l-3 4"/>',
tower: '<rect x="6" y="2.5" width="12" height="19" rx="2"/><path d="M9 6h6M9 8.5h6"/><circle cx="12" cy="15" r="2.6"/>',
laptop: '<rect x="4.5" y="5" width="15" height="10.5" rx="1.6"/><path d="M2.5 19h19"/>',
search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.4 15.4 20.5 20.5"/>',
camera: '<path d="M3.5 8.5a2 2 0 0 1 2-2h2.2l1.6-2.2h5.4l1.6 2.2h2.2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2z"/><circle cx="12" cy="13" r="3.6"/>',
article: '<rect x="5" y="3.5" width="14" height="17" rx="2.5"/><path d="M8.5 8h7M8.5 12h7M8.5 16h4"/>',
post: '<rect x="4" y="3" width="16" height="18" rx="3"/><rect x="7" y="6" width="10" height="6.5" rx="1.2"/><path d="M7 15.5h10M7 18.2h6"/>',
lens: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><path d="M10.2 10.4a2.4 2.4 0 0 1 1.8-1"/>',
mic: '<rect x="9" y="3" width="6" height="11.5" rx="3"/><path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3M9 21h6"/>',
light: '<path d="M9.5 18h5M10.5 21h3M12 3a6 6 0 0 0-3.6 10.8c.7.5 1.1 1.3 1.1 2.1V16h5v-.1c0-.8.4-1.6 1.1-2.1A6 6 0 0 0 12 3z"/>',
tripod: '<rect x="8" y="3" width="8" height="5" rx="1.2"/><path d="M12 8v4M12 12l-5.5 9M12 12l5.5 9M12 12v9"/>',
calc: '<rect x="5" y="2.5" width="14" height="19" rx="2.5"/><rect x="8" y="5.5" width="8" height="4" rx=".8"/><path d="M8.5 13h.01M12 13h.01M15.5 13h.01M8.5 16.5h.01M12 16.5h.01M15.5 16.5h.01"/>',
layers: '<path d="M12 3.5 21 8l-9 4.5L3 8z"/><path d="M3 12.5l9 4.5 9-4.5M3 16.5l9 4.5 9-4.5"/>',
code: '<path d="M8.5 7 3.5 12l5 5M15.5 7l5 5-5 5M13.5 4.5l-3 15"/>',
pin: '<path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.4"/>',
cake: '<path d="M4.5 20.5h15v-6a2 2 0 0 0-2-2h-11a2 2 0 0 0-2 2z"/><path d="M4.5 16c1.5 1.2 3 1.2 4.5 0s3-1.2 4.5 0 3 1.2 4.5 0 1.5-1 1.5-1M12 12.5V9.5"/><path d="M12 7.5c-.9 0-1.4-.8-1-1.6L12 4l1 1.9c.4.8-.1 1.6-1 1.6z"/>',
cap: '<path d="M2.5 9.5 12 5l9.5 4.5L12 14z"/><path d="M6.5 11.5v4c0 1.4 2.5 2.5 5.5 2.5s5.5-1.1 5.5-2.5v-4M21.5 9.5v5"/>',
work: '<rect x="3" y="7.5" width="18" height="12" rx="2.5"/><path d="M9 7.5V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1.5M3 12.5h18"/>',
terminal: '<rect x="3" y="4.5" width="18" height="15" rx="2.5"/><path d="m7 10 3 2.5L7 15M12.5 15H17"/>',
qr: '<rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><path d="M14 14h2.5v2.5M20 14v2.5M14 20h2.5M19.5 19.5h.5v.5"/>',
cup: '<path d="M4.5 10h11v4a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5z"/><path d="M15.5 11.5h1.2a2.4 2.4 0 0 1 0 4.8h-1.5"/><path d="M8.5 3.5c-.8 1 .8 2 0 3M12 3.5c-.8 1 .8 2 0 3"/>',
bread: '<path d="M5.2 18.8c-2.2-2.2.2-7 4.7-11.5s9.3-6.9 11.5-4.7-.2 7-4.7 11.5-9.3 6.9-11.5 4.7z"/><path d="M8.5 12.5l2 2M11.5 9.5l2 2M14.5 6.5l2 2"/>',
gamepad: '<path d="M7.5 7h9a5 5 0 0 1 5 5v.5a4.5 4.5 0 0 1-8 2.8l-.3-.3h-2.4l-.3.3a4.5 4.5 0 0 1-8-2.8V12a5 5 0 0 1 5-5z"/><path d="M7.5 10v4M5.5 12h4"/><circle cx="15.5" cy="11" r=".6"/><circle cx="17.5" cy="13" r=".6"/>',
sparkle: '<path d="M12 3.5l1.8 4.7 4.7 1.8-4.7 1.8L12 16.5l-1.8-4.7L5.5 10l4.7-1.8z"/><path d="M18.5 15.5l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z"/>',
video: '<rect x="3" y="6.5" width="13" height="11" rx="2.5"/><path d="M16 11l5-3v8l-5-3"/>',
more: '<circle cx="6" cy="12" r="1.3"/><circle cx="12" cy="12" r="1.3"/><circle cx="18" cy="12" r="1.3"/>',
chat: '<path d="M20.5 11.5a8.5 8.5 0 0 1-12.3 7.6L3.5 20.5l1.4-4.5a8.5 8.5 0 1 1 15.6-4.5z"/><path d="M8.5 11.5h7M8.5 14.5h4"/>',
shield: '<path d="M12 3l7 3v5.5c0 4.3-2.9 7.7-7 9.5-4.1-1.8-7-5.2-7-9.5V6z"/><path d="M9 12l2.2 2.2L15.5 10"/>',
verified: '<circle cx="9" cy="8.5" r="3.5"/><path d="M3 19.5c.8-3 3.2-4.8 6-4.8 1.3 0 2.5.4 3.5 1.1"/><path d="M15 16l2 2 4-4"/>',
calendar: '<rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
out: '<path d="M7 17 17 7"/><path d="M8.5 7H17v8.5"/>',
browser: '<rect x="3" y="4.5" width="18" height="15" rx="3"/><path d="M3 9.5h18M6.5 7h.01M9 7h.01"/>',
megaphone: '<path d="M4 10v4h3l6 4.5v-13L7 10H4z"/><path d="M16.5 9a4 4 0 0 1 0 6M19 6.5a7.5 7.5 0 0 1 0 11"/>',
bug: '<rect x="8" y="6" width="8" height="14" rx="4"/><path d="M12 11v9M8 13H4.5M19.5 13H16M8 17.5 5 19.5M16 17.5l3 2M8 9.5 5 7.5M16 9.5l3-2M10 6.5 9 4M14 6.5 15 4"/>'
};
function icon(name, size, cls) {
var attrs = (cls ? ' class="' + cls + '"' : '') +
' viewBox="0 0 24 24" width="' + size + '" height="' + size + '" aria-hidden="true"';
if (ICONS[name]) {
return '<svg' + attrs + ' fill="currentColor"><g>' + ICONS[name] + '</g></svg>';
}
return '<svg' + attrs + ' fill="none" stroke="currentColor" stroke-width="1.8"' +
' stroke-linecap="round" stroke-linejoin="round">' +
(ICONS_LINE[name] || ICONS_LINE.link) + '</svg>';
}
function normalizeIcons() {
var BOX = 24;
var TARGET = 20 * 20;
var list = document.querySelectorAll('.link__icon svg > g');
Array.prototype.forEach.call(list, function (g) {
var b;
try { b = g.getBBox(); } catch (e) { return; }
if (!b || !b.width || !b.height) return;
var k = Math.sqrt(TARGET / (b.width * b.height));
k = Math.min(k, BOX / b.width, BOX / b.height);
var dx = BOX / 2 - (b.x + b.width / 2) * k;
var dy = BOX / 2 - (b.y + b.height / 2) * k;
g.setAttribute('transform',
'translate(' + dx.toFixed(3) + ' ' + dy.toFixed(3) + ') scale(' + k.toFixed(4) + ')');
});
}
function esc(s) {
return String(s == null ? '' : s)
.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
.replace(/"/g, '&quot;');
}
function typo(s) {
return String(s == null ? '' : s)
.replace(/(^|[\s(«])([а-яё]{1,2})\s+/gi, '$1$2 ')
.replace(/\s+—/g, ' —');
}
function slot(n) { return document.querySelector('[data-bind="' + n + '"]'); }
function fill(n, html) { var el = slot(n); if (el) el.innerHTML = html; }
function setMeta(attr, key, val) {
var el = document.querySelector('meta[' + attr + '="' + key + '"]');
if (el) el.setAttribute('content', val);
}
function applyMeta() {
var m = C.meta || {}, h = C.hero || {};
var title = T(m.title) || T(h.name) || UI.page;
var desc = T(m.description) || T(h.bio).replace(/\n/g, ' ');
document.title = title;
setMeta('name', 'description', desc);
setMeta('property', 'og:title', title);
setMeta('property', 'og:description', desc);
setMeta('name', 'twitter:title', title);
setMeta('name', 'twitter:description', desc);
if (m.favicon) {
var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">' +
'<text y=".9em" font-size="88">' + m.favicon + '</text></svg>';
var link = document.querySelector('link[rel="icon"]');
if (link) link.href = 'data:image/svg+xml,' + encodeURIComponent(svg);
}
}
function initials(name) {
var parts = String(name || '').trim().split(/\s+/).slice(0, 2);
return parts.map(function (p) { return p.charAt(0); }).join('').toUpperCase() || '·';
}
function renderHero() {
var h = C.hero || {};
var name = T(h.name);
var photo = asset(h.avatar);
var ready = slot('avatar') && slot('avatar').querySelector('img');
if (!(photo && ready && ready.getAttribute('src') === photo)) {
fill('avatar', photo
? '<img src="' + esc(photo) + '" alt="' + esc(name) + '">'
: esc(initials(name)));
}
var box = slot('avatar');
var img = box && box.querySelector('img');
if (img) {
img.addEventListener('error', function () { box.textContent = initials(name); });
}
fill('status', esc(T(h.status)));
fill('name', String(name).trim().split(/\s+/).map(function (w) {
return '<span class="name__line">' + esc(w) + '</span>';
}).join(' '));
fill('nick', esc(T(h.nick)));
fill('role', esc(T(h.role)));
qrButton();
fill('bio', String(T(h.bio)).split('\n').filter(function (s) { return s.trim(); })
.map(function (s) {
s = s.trim();
if (/\s·\s/.test(s)) {
return '<span class="bio__chips">' + s.split(/\s*·\s*/).filter(Boolean).map(function (c, i) {
var ic = (h.bioIcons || [])[i];
return '<span class="chip">' + (ic ? icon(ic, 16) : '') + esc(typo(c)) + '</span>';
}).join('') + '</span>';
}
return '<span class="bio__line">' + esc(typo(s)) + '</span>';
}).join(''));
fill('about', aboutFacts(h));
}
function aboutFacts(h) {
var items = [];
if (T(h.city)) items.push(['pin', T(h.city)]);
var m = String(h.born || '').match(/^(\d{4})-(\d{2})-(\d{2})$/);
if (m) {
var y = +m[1], mo = +m[2], d = +m[3], now = new Date();
var age = now.getFullYear() - y - ((now.getMonth() + 1 < mo || (now.getMonth() + 1 === mo && now.getDate() < d)) ? 1 : 0);
var k = age % 10, hh = age % 100;
var yw = LANG === 'en' ? 'years old' : k === 1 && hh !== 11 ? 'год' : k >= 2 && k <= 4 && (hh < 12 || hh > 14) ? 'года' : 'лет';
var date = LANG === 'en' ? m[2] + '/' + m[3] + '/' + y : m[3] + '.' + m[2] + '.' + y;
items.push(['cake', date + ' · ' + age + ' ' + yw]);
}
if (T(h.education)) items.push(['cap', T(h.education)]);
if (T(h.work)) items.push(['work', T(h.work)]);
return items.map(function (it) {
return '<span class="about__item">' + icon(it[0], 15) + '<span>' + esc(typo(it[1])) + '</span></span>';
}).join('');
}
var QR_ICON = '<svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true" fill="none" ' +
'stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">' +
'<rect x="3.5" y="3.5" width="6.5" height="6.5" rx="1.6"/><rect x="14" y="3.5" width="6.5" height="6.5" rx="1.6"/>' +
'<rect x="3.5" y="14" width="6.5" height="6.5" rx="1.6"/>' +
'<path d="M14 14h2.6v2.6M20.5 14v.01M14 20.5h.01M17.6 20.5h2.9v-2.9"/></svg>';
function qrButton() {
var intro = document.querySelector('.intro');
if (!intro) return;
var b = intro.querySelector('.intro__qr');
if (!b) {
intro.insertAdjacentHTML('afterbegin', '<button class="intro__qr" type="button">' + QR_ICON + '</button>');
b = intro.querySelector('.intro__qr');
}
b.setAttribute('aria-label', UI.qr);
b.setAttribute('title', UI.qr);
b.setAttribute('aria-haspopup', 'dialog');
}
function initQr() {
var b = document.querySelector('.intro__qr');
if (!b) return;
b.addEventListener('click', function () {
if (window.SITE_QR) { window.SITE_QR.open(); return; }
if (b.hasAttribute('data-loading')) return;
b.setAttribute('data-loading', '');
var s = document.createElement('script');
s.src = '/assets/js/qr.js';
s.onload = function () { b.removeAttribute('data-loading'); if (window.SITE_QR) window.SITE_QR.open(); };
s.onerror = function () { b.removeAttribute('data-loading'); };
document.body.appendChild(s);
});
}
var BRAND = {
telegram: '#2aa3e0', instagram: 'linear-gradient(45deg, #f9a13a, #e1306c 55%, #833ab4)',
vk: '#0077ff', itd: '#1d1d1d', avito: '#00aaff', github: '#24292f', gitlab: '#fc6d26',
boosty: '#f15f2c', youtube: '#ff0033', x: '#111111', threads: '#111111', discord: '#5865f2',
tiktok: '#111111', twitch: '#9146ff', whatsapp: '#25d366', spotify: '#1db954',
linkedin: '#0a66c2', behance: '#1769ff', dribbble: '#ea4c89', habr: '#65a3be',
steam: '#171a21', epicgames: '#2a2a2a', xbox: '#107c10', playstation: '#0070d1', rockstar: '#111111'
};
function tile(l, big) {
var url = T(l.url), handle = T(l.handle);
var mail = /^mailto:/i.test(url);
var cls = 'link tile' + (big ? ' tile--feat' : '');
var inner =
'<span class="link__icon" style="--brand: ' + (BRAND[l.icon] || 'var(--accent)') + '">' +
icon(l.icon, 24) + '</span>' +
'<span class="link__text">' +
'<span class="link__label">' + esc(T(l.label)) + '</span>' +
(handle ? '<span class="link__handle">' +
(mail ? esc(handle).replace('@', '@<wbr>') : esc(handle)) + '</span>' : '') +
'</span>';
if (!url && l.copy) {
var nick = T(l.copy);
return '<button class="' + cls + ' link--copy fade" type="button" data-copy="' + esc(nick) + '"' +
' data-copied="' + esc(UI.nickCopied) + '"' +
' aria-label="' + esc(UI.copyNick + ' ' + T(l.label) + ': ' + nick) + '" title="' + esc(UI.copyNick) + '">' +
inner + icon('copy', 18, 'link__arrow i-copy') + icon('check', 18, 'link__arrow i-done') + '</button>';
}
if (!mail && !l.copy) {
return '<a class="' + cls + ' fade" href="' + esc(url) + '"' +
' target="_blank" rel="noopener me">' + inner + icon('out', 18, 'link__arrow') + '</a>';
}
var address = mail ? url.replace(/^mailto:/i, '').split('?')[0] : T(l.copy);
var copyLabel = mail ? UI.copy : UI.copyNick;
return '<div class="link-wrap fade">' +
'<a class="' + cls + (mail ? ' link--mail' : '') + '" href="' + esc(url) + '"' +
' target="_blank" rel="noopener me">' + inner + '</a>' +
'<button class="link__copy" type="button" data-copy="' + esc(address) + '"' +
(mail ? '' : ' data-copied="' + esc(UI.nickCopied) + '"') +
' aria-label="' + esc(copyLabel + ' ' + address) + '" title="' + esc(copyLabel) + '">' +
icon('copy', 18, 'i-copy') + icon('check', 18, 'i-done') +
'</button>' +
'</div>';
}
function worksTile() {
if (!HAS_WORKS) return '';
var items = (P.items || []).slice().sort(function (a, b) {
return String(b.date || '').localeCompare(String(a.date || ''));
});
var photos = window.SITE_PHOTOS || {};
var covers = items.map(function (w) {
return ((LANG === 'en' && photos[w.id + '-en']) || photos[w.id] || [])[0];
}).filter(Boolean).slice(0, 3);
var cats = (P.categories || []).filter(function (c) {
var more = [].concat((c && c.more) || []).some(function (m) { return m && (T(m.url) || m.links); });
return c && c.id && (P.showEmpty === true || more ||
items.some(function (w) { return w.category === c.id; }));
});
return '<a class="tile tile--works fade" href="' + pathFor(LANG, 'portfolio') + '">' +
'<span class="tile__head"><span class="tile__title">' + esc(T(P.title) || UI.tabWorks) + '</span>' +
icon('arrow', 22) + '</span>' +
(covers.length
? '<span class="tile__covers">' + covers.map(function (c) {
return '<img src="' + esc(c.thumb) + '" alt="" width="' + c.tw + '" height="' + c.th + '">';
}).join('') + '</span>'
: '') +
'<span class="tile__chips">' + cats.map(function (c) {
return '<span class="chip">' + (c.icon ? icon(c.icon, 15) : '') + esc(T(c.name)) + '</span>';
}).join('') + '</span>' +
'</a>';
}
function renderLinks() {
var nav = slot('links');
if (nav) nav.setAttribute('aria-label', UI.links);
var html = '', open = false, groups = 0, artDone = false;
function close() { if (open) { html += '</div>'; open = false; } }
(C.links || []).forEach(function (l) {
if (l.group && !T(l.url)) {
if (groups === 1 && open) html += worksTile();
close();
if (groups === 2) { html += homeArticles(); artDone = true; }
groups++;
html += '<h2 class="links__group fade">' + esc(T(l.group)) + '</h2>';
return;
}
if (l.featured) return;
if (!open) { html += '<div class="bento">'; open = true; }
html += tile(l, false);
});
if (groups < 2) {
var works = worksTile();
if (works && !open) { html += '<div class="bento">'; open = true; }
html += works;
}
close();
if (!artDone) html += homeArticles();
fill('links', html);
if (window.SITE_SHELVES) window.SITE_SHELVES(slot('links'));
}
function artHasEn(a) { return !!(a && a.title && typeof a.title === 'object' && a.title.en); }
function artItems() {
return ((C.articles || {}).items || []).filter(function (a) {
return a && /^[a-z0-9][a-z0-9-]*$/.test(a.id || '') && (LANG !== 'en' || artHasEn(a));
}).slice().sort(function (a, b) { return String(b.date || '').localeCompare(String(a.date || '')); });
}
function artCard(a) {
var p = ((window.SITE_PHOTOS || {})[a.id] || [])[0];
return '<a class="art-card fade" href="' + (LANG === 'en' ? '/en' : '') + '/articles/' + esc(a.id) + '/">' +
(p ? '<span class="art-card__cover"><img src="' + esc(p.thumb) + '" alt="" width="' + p.tw + '" height="' + p.th +
'" loading="lazy" decoding="async"></span>'
: '<span class="art-card__cover art-card__cover--empty">' + icon('article', 40) + '</span>') +
'<span class="art-card__body">' +
(a.date ? '<span class="art-card__date">' + esc(month(a.date)) + '</span>' : '') +
'<span class="art-card__title">' + esc(typo(T(a.title))) + '</span>' +
(T(a.description) ? '<span class="art-card__text">' + esc(typo(T(a.description))) + '</span>' : '') +
'</span></a>';
}
function homeArticles() {
var list = artItems();
if (!list.length) return '';
var en = LANG === 'en';
return '<div class="shelf__head fade"><h2 class="links__group">' + esc(T((C.articles || {}).title) || (en ? 'Articles' : 'Статьи')) + '</h2>' +
'<a class="shelf__all" href="' + (en ? '/en' : '') + '/articles/">' + (en ? 'All articles' : 'Все статьи') +
'<span>' + list.length + '</span>' + icon('arrow', 15) + '</a></div>' +
'<div class="shelf__wrap fade"><div class="shelf__row shelf__row--art">' + list.slice(0, 8).map(artCard).join('') + '</div>' +
shelfArrow('prev', en ? 'Scroll back' : 'Пролистать назад') + shelfArrow('next', en ? 'Scroll forward' : 'Пролистать вперёд') + '</div>';
}
function shelfArrow(dir, label) {
return '<button class="shelf__nav shelf__nav--' + dir + '" type="button" aria-label="' + esc(label) + '">' +
'<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="none" stroke="currentColor"' +
' stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="' +
(dir === 'prev' ? 'M15 5l-7 7 7 7' : 'M9 5l7 7-7 7') + '"/></svg></button>';
}
function projectCard(p) {
var mark = p.logo === 'ebk'
? '<span class="ebk" role="img" aria-label="EBK KVN bot">' +
'<span class="ebk__layer ebk__chev"></span>' +
'<span class="ebk__layer ebk__name"></span>' +
'<span class="ebk__layer ebk__sub"></span>' +
'<span class="ebk__cursor"></span>' +
'</span>'
: '<span class="link__icon">' + icon(p.icon || 'link', 24) + '</span>';
var handle = T(p.handle), cta = T(p.cta);
var links = (p.links || []).filter(function (l) { return l && T(l.url); });
if (links.length) {
return '<div class="feat feat--multi fade">' + mark +
'<span class="feat__text">' +
'<span class="feat__title">' + esc(typo(T(p.title))) + '</span>' +
(handle ? '<span class="feat__sub">' + esc(typo(handle)) + '</span>' : '') +
'<span class="feat__btns">' + links.map(function (l, i) {
return '<a class="feat__cta' + (i ? ' feat__cta--ghost' : '') + '" href="' + esc(T(l.url)) + '" target="_blank" rel="noopener"' +
(T(l.label) ? ' aria-label="' + esc(T(l.label) + ': ' + T(l.text)) + '"' : '') + '>' +
(l.icon ? icon(l.icon, 15) : '') + '<span class="feat__addr">' + esc(T(l.text)) + '</span>' + icon('arrow', 15) + '</a>';
}).join('') + '</span>' +
'</span>' +
'</div>';
}
return '<a class="feat fade" href="' + esc(T(p.url)) + '" target="_blank" rel="noopener">' +
mark +
'<span class="feat__text">' +
'<span class="feat__title">' + esc(typo(T(p.title))) + '</span>' +
(handle ? '<span class="feat__handle">' + esc(handle) + '</span>' : '') +
(cta ? '<span class="feat__cta">' + esc(cta) + icon('arrow', 15) + '</span>' : '') +
'</span>' +
'</a>';
}
function renderProjects() {
var box = document.querySelector('[data-section="projects"]');
if (!box) return;
var pr = C.projects || {};
var feat = (C.links || []).filter(function (l) { return l.featured && T(l.url); });
var items = pr.enabled === false ? [] : (pr.items || []).filter(function (p) { return p && T(p.url); });
if (!feat.length && !items.length) { box.innerHTML = ''; box.hidden = true; return; }
if (T(pr.title)) box.setAttribute('aria-label', T(pr.title));
box.innerHTML = feat.map(function (l) { return tile(l, true); }).join('') +
items.map(projectCard).join('');
box.hidden = false;
}
function copyText(text) {
if (navigator.clipboard && window.isSecureContext) {
return navigator.clipboard.writeText(text);
}
return new Promise(function (ok, fail) {
var ta = document.createElement('textarea');
ta.value = text;
ta.setAttribute('readonly', '');
ta.style.position = 'fixed';
ta.style.opacity = '0';
document.body.appendChild(ta);
ta.select();
var done = false;
try { done = document.execCommand('copy'); } catch (e) {}
ta.remove();
if (done) ok(); else fail();
});
}
function initCopy() {
document.addEventListener('click', function (e) {
var btn = e.target.closest && e.target.closest('[data-copy]');
if (!btn) return;
var text = btn.getAttribute('data-copy');
var hint = btn.querySelector('.link__handle') || btn.parentNode.querySelector('.link__handle');
copyText(text).then(function () {
if (hint && !hint.dataset.orig) hint.dataset.orig = hint.innerHTML;
if (hint) hint.textContent = btn.getAttribute('data-copied') || UI.copied;
btn.classList.add('is-done');
clearTimeout(btn._timer);
btn._timer = setTimeout(function () {
btn.classList.remove('is-done');
if (hint) hint.innerHTML = hint.dataset.orig;
}, 2200);
}, function () {
window.prompt(UI.copyByHand, text);
});
});
}
function initTap() {
if (!window.matchMedia || !matchMedia('(hover: none)').matches) return;
var SEL = '.more__btn, .feat--multi .feat__cta, .tile, .link-wrap, .work, .more, .feat, .cta-btn, .socials__item';
var el = null, on = 0, off = 0, x0 = 0, y0 = 0;
function clear() {
clearTimeout(on); clearTimeout(off);
if (el) el.classList.remove('is-tap', 'is-press');
el = null;
}
document.addEventListener('pointerdown', function (e) {
if (e.pointerType === 'mouse') return;
clear();
x0 = e.clientX; y0 = e.clientY;
var t = e.target.closest && e.target.closest(SEL);
if (t && t.parentNode.classList && t.parentNode.classList.contains('link-wrap')) t = t.parentNode;
if (!t || t.classList.contains('more--group') || t.classList.contains('work--group') ||
t.classList.contains('more--offer') || t.classList.contains('feat--multi')) return;
el = t;
on = setTimeout(function () { t.classList.add('is-press'); }, 70);
}, { passive: true });
document.addEventListener('pointerup', function () {
if (!el) return;
clearTimeout(on);
el.classList.remove('is-press');
el.classList.add('is-tap');
off = setTimeout(clear, 450);
}, { passive: true });
document.addEventListener('pointercancel', clear, { passive: true });
document.addEventListener('pointermove', function (e) {
if (el && Math.abs(e.clientX - x0) + Math.abs(e.clientY - y0) > 10) clear();
}, { passive: true });
document.addEventListener('scroll', function () { if (el) clear(); }, { passive: true, capture: true });
window.addEventListener('pageshow', clear);
}
document.addEventListener('touchstart', function () {}, { passive: true });
function initNoDrag() {
document.addEventListener('dragstart', function (e) {
var t = e.target;
if (t && t.closest && t.closest('a, img, svg')) e.preventDefault();
});
document.addEventListener('contextmenu', function (e) {
var t = e.target;
if (t && t.closest && t.closest('img, video, .gallery')) e.preventDefault();
});
}
var MONTHS = {
ru: ['январь', 'февраль', 'март', 'апрель', 'май', 'июнь', 'июль', 'август',
'сентябрь', 'октябрь', 'ноябрь', 'декабрь'],
en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August',
'September', 'October', 'November', 'December']
}[LANG];
function month(d) {
var m = /^(\d{4})-(\d{2})/.exec(d || '');
return m ? MONTHS[+m[2] - 1] + ' ' + m[1] : (d || '');
}
var STAR = '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="currentColor">' +
'<path d="M12 2.6l2.9 6 6.6.8-4.9 4.6 1.3 6.5L12 17.3l-5.9 3.2 1.3-6.5L2.5 9.4l6.6-.8z"/></svg>';
function stars(n) { return '<span class="stars" aria-hidden="true">' + new Array((n || 5) + 1).join(STAR) + '</span>'; }
function reviewCard(i, link) {
var meta = [T(i.what), month(i.date)].filter(Boolean).join(' · ');
return '<figure class="rev fade">' + stars(5) +
'<blockquote class="rev__text">' + String(T(i.quote) || '').split(/\n+/).filter(function (x) { return x.trim(); })
.map(function (x) { return '<p>' + esc(typo(x.trim())) + '</p>'; }).join('') + '</blockquote>' +
'<figcaption class="rev__who"><span class="rev__name">' + esc(T(i.name)) + '</span>' +
(meta ? '<span class="rev__meta">' + esc(meta) + '</span>' : '') +
(link ? '<a class="rev__link" href="' + esc(link) + '">' + esc(UI.reviewCase) + icon('arrow', 15) + '</a>' : '') +
'</figcaption>' +
'</figure>';
}
function renderReviews() {
var R = C.reviews;
var box = document.querySelector('[data-section="reviews"]');
if (!box || !R || R.enabled === false || !(R.items || []).length) return;
var full = PAGE === 'reviews';
var pre = LANG === 'en' ? '/en' : '';
var r = R.rating || {}, url = T(r.url);
var title = T(R.title) || UI.reviews;
var head = r.score
? '<div class="rating fade">' +
'<div class="rating__score">' +
'<span class="rating__num">' + esc(r.score) + '</span>' +
'<span class="rating__stars">' + stars(5) +
'<span class="rating__count">' + esc(UI.reviewsCount(r.count) + ' ' + T(r.where)) + '</span></span>' +
'</div>' +
'<ul class="rating__badges">' + (r.badges || []).map(function (b) {
return '<li>' + (b && b.icon ? icon(b.icon, 16) : '') + esc(T(b)) + '</li>';
}).join('') + '</ul>' +
(url ? '<a class="rating__all" href="' + esc(url) + '" target="_blank" rel="noopener">' +
esc(T(R.all) || UI.reviewsAll) + icon('out', 16) + '</a>' : '') +
'</div>'
: '';
if (!full) {
var some = R.items.filter(function (i) { return i.home; });
if (!some.length) some = R.items.slice(0, 3);
box.innerHTML = '<h2 class="links__group fade">' + esc(title) + '</h2>' + head +
'<div class="revs">' + some.map(function (i) { return reviewCard(i); }).join('') + '</div>' +
'<a class="cta-btn reviews__more fade" href="' + pre + '/reviews/">' +
esc(UI.reviewsMore + ' ' + countAll(R)) + icon('arrow', 16) + '</a>';
box.hidden = false;
return;
}
var groups = R.groups || {};
var html = '';
Object.keys(groups).forEach(function (g) {
if (g === 'projects') return;
var list = R.items.filter(function (i) { return (i.group || 'build') === g; });
if (!list.length) return;
html += '<h2 class="links__group fade">' + esc(T(groups[g])) + '</h2>' +
'<div class="revs">' + list.map(function (i) { return reviewCard(i); }).join('') + '</div>';
});
var works = ((C.portfolio || {}).items || []).filter(function (w) { return w && w.review && T(w.review.text); });
if (works.length) {
html += '<h2 class="links__group fade">' + esc(T(groups.projects) || UI.reviewProjects) + '</h2>' +
'<div class="revs revs--wide">' + works.map(function (w) {
var rv = w.review;
return reviewCard({ name: rv.name, quote: rv.text, what: { ru: T(w.title), en: T(w.title) } },
pre + '/portfolio/' + w.category + '/' + w.id + '/');
}).join('') + '</div>';
}
box.innerHTML = head + html;
box.hidden = false;
}
function countAll(R) {
var n = R.items.length + ((C.portfolio || {}).items || []).filter(function (w) { return w && w.review; }).length;
return '(' + n + ')';
}
var SVC_PAGES = HAS_SERVICES ? C.services.pages.filter(function (p) { return p && p.id; }) : [];
function svcPath(id) { return (LANG === 'en' ? '/en' : '') + '/services/' + id + '/'; }
function keepNum(s) {
return String(s || '').replace(/(\d) (?=\d)/g, '$1 ').replace(/ (₽|%)/g, ' $1');
}
function sellerName() {
var h = C.hero || {}, parts = String(T(h.name) || '').trim().split(/\s+/), pat = T(h.patronymic);
return parts.length === 2 ? parts[1] + ' ' + parts[0] + (pat ? ' ' + pat : '') : parts.join(' ');
}
function svcRows(items) {
return (items || []).map(function (i) {
var price = keepNum(T(i.price));
var kind = !price ? ' svc__price--deal' : /[a-zа-яё]/i.test(price.replace(/^(от|from)\s/i, '')) ? ' svc__price--text' : '';
return '<li class="svc__row"><span class="svc__name">' + esc(keepNum(typo(T(i.name)))) + '</span>' +
'<span class="svc__price' + kind + '">' + esc(price || UI.deal) + '</span></li>';
}).join('');
}
function svcNotes(notes) {
if (!(notes || []).length) return '';
return '<ul class="svc__notes">' + notes.map(function (n) {
return '<li>' + icon(n.icon || 'check', 16) + '<span>' + esc(keepNum(typo(T(n)))) + '</span></li>';
}).join('') + '</ul>';
}
function svcBadges() {
var S = C.services;
if (!(S.badges || []).length) return '';
return '<div class="rating svc-lead fade"><ul class="rating__badges">' + S.badges.map(function (b) {
return '<li>' + (b.icon ? icon(b.icon, 16) : '') + esc(T(b)) + '</li>';
}).join('') + '</ul></div>';
}
function askText(ask) {
var S = C.services || {};
if (typeof ask === 'string') {
if (ask === 'extra') return T((S.extra || {}).ask);
var pg = (S.pages || []).filter(function (x) { return x && x.id === ask; })[0];
return pg ? T(pg.ask) : '';
}
return T(ask);
}
function askUrl(url, ask) {
var t = askText(ask);
if (!url || !t || !/^https:\/\/t\.me\//i.test(url)) return url;
return url + (url.indexOf('?') < 0 ? '?' : '&') + 'text=' + encodeURIComponent(t);
}
function ctaPair(ask, tg, cls, vk) {
var S = C.services || {}, out = '';
if (S.orderUrl) {
out += '<a class="cta-btn cta-btn--tg' + (cls ? ' ' + cls : '') + '" href="' + esc(askUrl(S.orderUrl, ask)) + '" target="_blank" rel="noopener">' +
icon('telegram', 18) + '<span class="cta-long">' + esc(tg || UI.write) + '</span><span class="cta-short">Telegram</span></a>';
}
if (S.orderVk) {
out += '<a class="cta-btn cta-btn--vk" href="' + esc(S.orderVk) + '" target="_blank" rel="noopener">' +
icon('vk', 18) + '<span class="cta-long">' + esc(vk || UI.writeVk) + '</span><span class="cta-short">' + (LANG === 'en' ? 'VK' : 'ВК') + '</span></a>';
}
return out ? '<div class="cta-row">' + out + '</div>' : '';
}
function svcExtra() {
var x = C.services.extra, url = askUrl(C.services.orderUrl, 'extra');
if (!x || !T(x.title)) return '';
var ex = (x.examples || []).map(function (e) { return T(e); }).filter(Boolean);
var vkX = C.services.orderVk;
if (vkX) {
return '<div class="svc-card svc-card--extra svc-card--btns fade">' +
'<span class="svc-card__ic">' + icon('more', 24) + '</span>' +
'<span class="svc-card__body"><span class="svc-card__title">' + esc(T(x.title)) + '</span>' +
'<span class="svc-card__text">' + esc(typo(T(x.text))) + '</span>' +
(ex.length ? '<span class="svc-card__tags">' + ex.map(function (e) {
return '<span>' + esc(typo(e)) + '</span>';
}).join('') + '</span>' : '') +
(T(x.note) ? '<span class="svc-card__text">' + esc(typo(T(x.note))) + '</span>' : '') +
'<span class="svc-card__price svc-card__price--deal">' + esc(UI.deal) + '</span>' +
'<span class="more__btns svc-card__btns">' +
'<a class="more__btn more__btn--tg" href="' + esc(url) + '" target="_blank" rel="noopener">' + icon('telegram', 16) + 'Telegram</a>' +
'<a class="more__btn more__btn--vk" href="' + esc(vkX) + '" target="_blank" rel="noopener">' + icon('vk', 16) + (LANG === 'en' ? 'VK' : 'ВК') + '</a>' +
'</span></span>' +
'</div>';
}
return '<a class="svc-card svc-card--extra fade" href="' + esc(url || '#') + '" target="_blank" rel="noopener">' +
'<span class="svc-card__ic">' + icon('more', 24) + '</span>' +
'<span class="svc-card__body"><span class="svc-card__title">' + esc(T(x.title)) + '</span>' +
'<span class="svc-card__text">' + esc(typo(T(x.text))) + '</span>' +
(ex.length ? '<span class="svc-card__tags">' + ex.map(function (e) {
return '<span>' + esc(typo(e)) + '</span>';
}).join('') + '</span>' : '') +
(T(x.note) ? '<span class="svc-card__text">' + esc(typo(T(x.note))) + '</span>' : '') +
'<span class="svc-card__price svc-card__price--deal">' + esc(UI.deal) + '</span></span>' +
icon('out', 18, 'svc-card__go') + '</a>';
}
function svcOrder(ask) {
var S = C.services;
if (!T(S.order) && !S.orderUrl) return '';
return '<h2 class="links__group fade">' + esc(UI.order) + '</h2>' +
'<div class="svc svc--order fade">' +
(T(S.order) ? '<p class="svc__order">' + esc(typo(T(S.order))) + '</p>' : '') +
ctaPair(ask || S.ask) +
'</div>';
}
function svcSeller() {
var sel = C.services.seller || {}, inn = String(sel.inn || '').replace(/\D/g, '');
var who = [sellerName(), T(sel.status), inn ? UI.inn + ' ' + inn : ''].filter(Boolean).join(', ');
return '<p class="svc__seller fade">' + esc(UI.seller) + ': ' + esc(who) +
' · <a href="/offer/' + (LANG === 'en' ? '?lang=en' : '') + '">' + esc(UI.offer) + '</a></p>';
}
function svcCard(p) {
var price = keepNum(T(p.price));
return '<a class="svc-card fade" href="' + svcPath(p.id) + '">' +
'<span class="svc-card__ic">' + icon(p.icon || 'check', 24) + '</span>' +
'<span class="svc-card__body"><span class="svc-card__title">' + esc(typo(T(p.title))) + '</span>' +
(T(p.short) ? '<span class="svc-card__text">' + esc(keepNum(typo(T(p.short)))) + '</span>' : '') +
'<span class="svc-card__price' + (price ? '' : ' svc-card__price--deal') + '">' + esc(price || UI.deal) + '</span></span>' +
icon('arrow', 18, 'svc-card__go') + '</a>';
}
function renderServices() {
var box = document.querySelector('[data-section="services"]');
if (!box || !HAS_SERVICES) return;
box.innerHTML = svcBadges() +
'<div class="svc-grid">' + SVC_PAGES.map(svcCard).join('') + svcExtra() + '</div>' +
svcOrder() + svcSeller();
box.hidden = false;
}
function renderNow() {
var n = C.now;
if (!n || n.enabled === false) return;
var box = document.querySelector('[data-section="now"]');
if (box) box.hidden = false;
fill('now-title', esc(T(n.title) || UI.now));
fill('now-items', (n.items || []).map(function (i) {
return '<li>' + esc(T(i)) + '</li>';
}).join(''));
}
function renderFooter() {
var f = C.footer || {};
var text = T(f.text) || T((C.hero || {}).name);
var year = f.showYear === false ? '' : ' · ' + new Date().getFullYear();
var line = esc(text ? text + year : year.replace(/^ · /, ''));
var url = T(f.url);
if (url && line) {
line = '<a class="footer__main" href="' + esc(url) + '" target="_blank" rel="noopener me">' + line + '</a>';
}
var bug = T(f.bugUrl);
if (bug) {
var page = (T((C.meta || {}).url) || location.origin).replace(/\/+$/, '') + location.pathname;
var draft = UI.bugDraft + page + ' — ';
if (/^https:\/\/t\.me\//i.test(bug)) bug += (bug.indexOf('?') < 0 ? '?' : '&') + 'text=' + encodeURIComponent(draft);
else if (/^mailto:/i.test(bug)) bug += '?subject=' + encodeURIComponent(UI.bug) + '&body=' + encodeURIComponent(draft);
var vkBug = (C.services || {}).orderVk;
line = (vkBug
? '<span class="footer__bug footer__bug--two">' + icon('bug', 15) +
'<span>' + esc(UI.bugTo) + ' <a href="' + esc(bug) + '" target="_blank" rel="noopener">Telegram</a> ' +
esc(UI.bugOr) + ' <a href="' + esc(vkBug) + '" target="_blank" rel="noopener">' + (LANG === 'en' ? 'VK' : 'ВК') + '</a></span></span>'
: '<a class="footer__bug" href="' + esc(bug) + '" target="_blank" rel="noopener">' +
icon('bug', 15) + esc(UI.bug) + '</a>') + line;
}
var more = [];
if (artItems().length) {
more.push('<a class="footer__articles" href="' + (LANG === 'en' ? '/en' : '') + '/articles/">' +
esc(T((C.articles || {}).title) || (LANG === 'en' ? 'Articles' : 'Статьи')) + '</a>');
}
if (C.siteInfo && C.siteInfo.enabled !== false) {
more.push('<a class="footer__about" href="' + (LANG === 'en' ? '/en' : '') + '/about-site/">' + esc(UI.aboutSite) + '</a>');
}
if ((C.analytics || {}).metrika || (C.analytics || {}).goatcounter) {
more.push('<a class="footer__policy" href="/privacy/' + (LANG === 'en' ? '?lang=en' : '') + '">' +
esc(UI.policy) + '</a>');
}
if (more.length) line += '<span class="footer__more">' + more.join('<span class="footer__dot" aria-hidden="true">·</span>') + '</span>';
fill('footer', line);
}
function renderLang() {
var a = slot('lang-switch');
if (!a) return;
if (!window.SITE_HAS_EN) { a.hidden = true; a.removeAttribute('href'); return; }
var o = UI.other;
a.hidden = false;
a.href = pathFor(o.lang, PAGE);
a.hreflang = o.lang;
a.lang = o.lang;
a.title = o.title;
a.setAttribute('aria-label', o.title);
a.textContent = o.code;
}
function renderTabs() {
var nav = slot('tabs');
if (!nav) return;
if (!(HAS_WORKS || HAS_REVIEWS || HAS_SERVICES) || PAGE === 'category' || PAGE === 'work' || PAGE === 'service' || PAGE === 'site' ||
PAGE === 'articles' || PAGE === 'article') { nav.hidden = true; nav.innerHTML = ''; return; }
var tab = function (key, label) {
var on = key === PAGE;
return '<a class="tabs__item' + (on ? ' is-on' : '') + '" href="' + pathFor(LANG, key) + '"' +
(on ? ' aria-current="page"' : '') + '>' + esc(label) + '</a>';
};
nav.setAttribute('aria-label', UI.tabs);
nav.classList.remove('has-pill', 'is-sliding');
nav.innerHTML = tab('home', UI.tabLinks) +
(HAS_WORKS ? tab('portfolio', T(P.title) || UI.tabWorks) : '') +
(HAS_REVIEWS ? tab('reviews', UI.reviews) : '') +
(HAS_SERVICES ? tab('services', T(C.services.title) || UI.services) : '') +
'<span class="tabs__pill" aria-hidden="true"></span>';
var n = nav.querySelectorAll('.tabs__item').length;
nav.style.setProperty('--tabs', n);
nav.classList.toggle('tabs--4', n >= 4);
nav.hidden = false;
}
function initPill() {
var nav = slot('tabs');
if (!nav || nav.hidden) return;
var pill = nav.querySelector('.tabs__pill'), on = nav.querySelector('.tabs__item.is-on');
var items = nav.querySelectorAll('.tabs__item');
if (!pill || !on) return;
var cur = [].indexOf.call(items, on);
function fitTabs() {
if (!nav.classList.contains('tabs--4')) return;
nav.style.removeProperty('--tabs-fs');
var last = items[items.length - 1], ns = getComputedStyle(nav);
var over = function () {
return last.getBoundingClientRect().right >
nav.getBoundingClientRect().right - parseFloat(ns.borderRightWidth) - parseFloat(ns.paddingRight) + 0.5;
};
var fs = parseFloat(getComputedStyle(items[0]).fontSize), k = 0;
while (over() && fs > 10 && k++ < 24) {
fs -= 0.25;
nav.style.setProperty('--tabs-fs', fs + 'px');
}
}
fitTabs();
function place(el) {
pill.style.setProperty('--x', el.offsetLeft + 'px');
pill.style.setProperty('--w', el.offsetWidth + 'px');
}
place(on);
nav.classList.add('has-pill');
function indexOf(url) {
var p;
try { p = new URL(url, location.href).pathname; } catch (e) { return -1; }
for (var k = 0; k < items.length; k++) if (items[k].pathname === p) return k;
return -1;
}
function cameFrom() {
var i = -1, mark = null;
try {
var a = window.navigation && window.navigation.activation;
if (a && a.from && a.navigationType !== 'reload') i = indexOf(a.from.url);
} catch (e) {}
try { mark = sessionStorage.getItem('site-tab-from'); sessionStorage.removeItem('site-tab-from'); } catch (e) {}
if (i < 0 && mark !== null && mark !== '') i = +mark;
return i;
}
function reveal(e) {
var i = cameFrom();
if (i < 0 || i === cur || !items[i]) return;
if (!document.documentElement.classList.contains('motion')) return;
if (e && e.viewTransition) slideIn(i < cur ? 'tab-forward' : 'tab-back');
nav.classList.add('no-anim');
place(items[i]);
pill.getBoundingClientRect();
nav.classList.remove('no-anim');
nav.classList.add('is-sliding');
var go = function () {
place(on);
setTimeout(function () { nav.classList.remove('is-sliding'); }, 180);
};
if (window.requestAnimationFrame) requestAnimationFrame(function () { requestAnimationFrame(go); });
else go();
}
if ('onpagereveal' in window) window.addEventListener('pagereveal', reveal);
else reveal(null);
nav.addEventListener('click', function (e) {
var a = e.target.closest && e.target.closest('.tabs__item');
var now = nav.querySelector('.tabs__item.is-on');
if (!a || a === now) return;
try { sessionStorage.setItem('site-tab-from', String([].indexOf.call(items, now))); } catch (e2) {}
});
var again = function () {
fitTabs();
var now = nav.querySelector('.tabs__item.is-on');
if (now && !nav.classList.contains('is-sliding')) place(now);
};
window.addEventListener('resize', again);
if (document.fonts && document.fonts.ready) document.fonts.ready.then(again);
}
var TAB_ORDER = ['home', 'portfolio', 'reviews', 'services'];
function tabPageOf(pathname) {
for (var i = 0; i < TAB_ORDER.length; i++) {
var p = TAB_ORDER[i];
if (p === 'portfolio' && !HAS_WORKS) continue;
if (p === 'reviews' && !HAS_REVIEWS) continue;
if (p === 'services' && !HAS_SERVICES) continue;
if (pathFor(LANG, p) === pathname) return p;
}
return null;
}
function titleFor(page) {
var name = T((C.hero || {}).name);
if (page === 'home') return T((C.meta || {}).title) || name || UI.page;
var label = page === 'portfolio' ? (T(P.title) || UI.tabWorks)
: page === 'services' ? (T((C.services || {}).title) || UI.services)
: (T((C.reviews || {}).title) || UI.reviews);
return label + ' — ' + name;
}
function movePill() {
var nav = slot('tabs'), pill = nav && nav.querySelector('.tabs__pill');
var on = nav && nav.querySelector('.tabs__item.is-on');
if (!pill || !on) return;
nav.classList.add('is-sliding');
pill.style.setProperty('--x', on.offsetLeft + 'px');
pill.style.setProperty('--w', on.offsetWidth + 'px');
clearTimeout(movePill.t);
movePill.t = setTimeout(function () { nav.classList.remove('is-sliding'); }, 180);
}
function showPage(page) {
PAGE = page;
if (page === 'home') B.removeAttribute('data-page'); else B.setAttribute('data-page', page);
if (window.SITE_UTIL) window.SITE_UTIL.page = page;
var works = document.querySelector('[data-section="works"]');
if (works) {
works.classList.remove('is-warming');
works.removeAttribute('aria-hidden');
works.innerHTML = '';
works.hidden = true;
}
var svc = document.querySelector('[data-section="services"]');
if (svc && page !== 'services') { svc.innerHTML = ''; svc.hidden = true; }
if (page === 'home') {
applyMeta();
var links = slot('links');
if (links) links.hidden = false;
renderProjects();
renderLinks();
normalizeIcons();
var now = document.querySelector('[data-section="now"]');
if (now && !now.querySelector('[data-bind="now-items"]')) {
now.innerHTML = '<h2 class="now__title" data-bind="now-title"></h2><ul class="now__list" data-bind="now-items"></ul>';
}
renderNow();
renderReviews();
} else {
clearHomeBlocks();
document.title = titleFor(page);
if (page === 'reviews') renderReviews();
if (page === 'services') renderServices();
if (page === 'portfolio' && window.SITE_RENDER_WORKS) window.SITE_RENDER_WORKS();
}
var nav = slot('tabs');
if (nav) {
Array.prototype.forEach.call(nav.querySelectorAll('.tabs__item'), function (a) {
var on = tabPageOf(a.pathname) === page;
a.classList.toggle('is-on', on);
if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
});
}
movePill();
renderFooter();
renderLang();
Array.prototype.forEach.call(document.querySelectorAll('.fade:not(.is-in)'), function (el) {
el.classList.add('is-in');
});
}
function slideIn(dir, wait) {
var root = document.documentElement;
clearTimeout(slideIn.t);
root.classList.remove('slide-r', 'slide-l', 'slide-wait');
if (!dir || !root.classList.contains('motion')) return;
root.classList.add(dir === 'tab-forward' ? 'slide-r' : 'slide-l');
if (wait) root.classList.add('slide-wait'); else slideDone();
}
function slideDone() {
var root = document.documentElement;
clearTimeout(slideIn.t);
slideIn.t = setTimeout(function () { root.classList.remove('slide-r', 'slide-l'); }, 700);
}
function slidePlay() {
var root = document.documentElement;
if (!root.classList.contains('slide-wait')) return;
root.classList.remove('slide-wait');
slideDone();
}
var vtNow = null, vtSeq = 0, swipeOut = '';
function switchTo(page, dir) {
var root = document.documentElement;
var out = swipeOut; swipeOut = '';
if (!document.startViewTransition || !root.classList.contains('motion')) {
clearSwipe(); showPage(page); slideIn(dir); return;
}
var n = ++vtSeq;
var go = function () { clearSwipe(); showPage(page); slideIn(dir, true); };
var play = function () { if (n === vtSeq) slidePlay(); };
var done = function () {
if (n !== vtSeq) return;
vtNow = null;
slidePlay();
root.classList.remove('vt-tab', 'swipe-out-l', 'swipe-out-r');
};
root.classList.remove('swipe-out-l', 'swipe-out-r');
root.classList.add('vt-tab');
if (out) root.classList.add('swipe-out-' + out);
try {
var vt = vtNow = document.startViewTransition(go);
vt.ready.then(play, play);
vt.updateCallbackDone.catch(function () {});
vt.finished.then(done, done);
} catch (e) { vtNow = null; root.classList.remove('vt-tab', 'swipe-out-l', 'swipe-out-r'); clearSwipe(); showPage(page); slideIn(dir); }
}
window.addEventListener('scroll', function () {
if (vtNow && window.scrollY > 2) { try { vtNow.skipTransition(); } catch (e) {} }
}, { passive: true });
function announce(from) {
try { document.dispatchEvent(new CustomEvent('site-pageview', { detail: { from: from || '' } })); } catch (e) {}
}
function initSwitch() {
if (!window.history || !history.pushState) return;
var nav = slot('tabs');
if (!nav || nav.hidden || TAB_ORDER.indexOf(PAGE) < 0) return;
try { history.replaceState({ page: PAGE }, '', location.href); } catch (e) {}
function dirFor(a, b) { return TAB_ORDER.indexOf(b) > TAB_ORDER.indexOf(a) ? 'tab-forward' : 'tab-back'; }
document.addEventListener('click', function (e) {
if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
var a = e.target.closest && e.target.closest('a[href]');
if (!a || (a.target && a.target !== '_self') || a.hasAttribute('download')) return;
if (a.origin !== location.origin || a.search || a.hash) return;
var page = tabPageOf(a.pathname);
if (!page) return;
e.preventDefault();
if (page === PAGE) return;
var from = PAGE, prev = location.href;
if (window.scrollY > 0) window.scrollTo({ top: 0, behavior: 'instant' });
history.pushState({ page: page }, '', a.href);
switchTo(page, dirFor(from, page));
announce(prev);
});
window.addEventListener('popstate', function () {
var page = tabPageOf(location.pathname);
if (!page || page === PAGE) return;
switchTo(page, dirFor(PAGE, page));
announce('');
});
}
var swipeEls = [];
function swipeTargets() {
return Array.prototype.filter.call(document.querySelectorAll(
'.top, [data-bind="links"], [data-section="works"], [data-section="reviews"], [data-section="now"], [data-section="services"]'), function (el) {
return !el.hidden && el.offsetParent !== null && !el.classList.contains('is-warming');
});
}
var swipeFrame = 0, swipeNext = 0;
function paintSwipe(dx, back) {
swipeEls.forEach(function (el) {
el.style.transition = back ? 'translate .4s var(--spring), opacity .3s ease' : 'none';
el.style.translate = dx ? dx.toFixed(1) + 'px 0' : '';
el.style.opacity = dx ? String(1 - Math.min(Math.abs(dx) / 320, .3)) : '';
});
}
function setSwipe(dx, back) {
swipeNext = dx;
if (back) { cancelAnimationFrame(swipeFrame); swipeFrame = 0; paintSwipe(dx, true); return; }
if (!swipeFrame) swipeFrame = requestAnimationFrame(function () { swipeFrame = 0; paintSwipe(swipeNext, false); });
}
function clearSwipe() {
clearTimeout(clearSwipe.t);
cancelAnimationFrame(swipeFrame); swipeFrame = 0;
swipeEls.forEach(function (el) { el.style.transition = el.style.translate = el.style.opacity = ''; });
swipeEls = [];
document.documentElement.classList.remove('swiping');
}
function initSwipe() {
if (!window.matchMedia || !matchMedia('(hover: none) and (pointer: coarse)').matches) return;
if (!window.history || !history.pushState) return;
var nav = slot('tabs');
if (!nav || nav.hidden || TAB_ORDER.indexOf(PAGE) < 0) return;
var EDGE = 24, LOCK = 10, COMMIT = 56;
var x0 = 0, y0 = 0, xs = 0, dx = 0, mode = 'no';
var track = [];
function tabLink(p) {
return Array.prototype.filter.call(nav.querySelectorAll('.tabs__item'), function (a) {
return tabPageOf(a.pathname) === p;
})[0] || null;
}
function order() { return TAB_ORDER.filter(function (p) { return tabLink(p); }); }
function blocked(t) {
for (var el = t; el && el !== document.body && el.nodeType === 1; el = el.parentElement) {
if (el.matches('.panel, .term, dialog, .tabs, .gallery, input, textarea, select, [contenteditable]')) return true;
if (el.scrollWidth > el.clientWidth + 2) {
var ox = getComputedStyle(el).overflowX;
if (ox === 'auto' || ox === 'scroll') return true;
}
}
return false;
}
document.addEventListener('touchstart', function (e) {
mode = 'no';
if (e.touches.length !== 1 || TAB_ORDER.indexOf(PAGE) < 0) return;
var t = e.touches[0];
if (t.clientX < EDGE || t.clientX > window.innerWidth - EDGE || blocked(e.target)) return;
x0 = xs = t.clientX; y0 = t.clientY; dx = 0; mode = '';
track = [[e.timeStamp, t.clientX]];
}, { passive: true });
document.addEventListener('touchmove', function (e) {
if (mode === 'no' || e.touches.length !== 1) return;
var t = e.touches[0], mx = t.clientX - x0, my = t.clientY - y0;
track.push([e.timeStamp, t.clientX]);
while (track.length > 2 && e.timeStamp - track[0][0] > 100) track.shift();
if (mode === '') {
if (Math.abs(mx) < LOCK && Math.abs(my) < LOCK) return;
if (Math.abs(mx) < Math.abs(my) * 1.4) { mode = 'no'; return; }
mode = 'x'; x0 = t.clientX; mx = 0;
clearSwipe();
clearTimeout(slideIn.t);
document.documentElement.classList.remove('slide-r', 'slide-l', 'slide-wait');
swipeEls = swipeTargets();
document.documentElement.classList.add('swiping');
}
var list = order(), i = list.indexOf(PAGE);
var has = mx < 0 ? i >= 0 && i < list.length - 1 : i > 0;
dx = t.clientX - xs;
setSwipe(mx * (has ? .55 : .14), false);
}, { passive: true });
function end() {
if (mode !== 'x') { mode = 'no'; return; }
mode = 'no';
var list = order(), i = list.indexOf(PAGE);
var j = dx < 0 ? i + 1 : i - 1, a = list[j] && tabLink(list[j]);
var a0 = track[0], a1 = track[track.length - 1];
var v = a1 && a0 && a1[0] > a0[0] ? (a1[1] - a0[1]) / (a1[0] - a0[0]) : 0;
var fast = Math.abs(dx) > 24 && Math.abs(v) > .3 && (v < 0) === (dx < 0);
if (a && i >= 0 && (Math.abs(dx) > COMMIT || fast)) {
cancelAnimationFrame(swipeFrame); swipeFrame = 0;
paintSwipe(swipeNext, false);
swipeOut = dx < 0 ? 'l' : 'r';
a.click();
swipeOut = '';
} else {
setSwipe(0, true);
clearSwipe.t = setTimeout(clearSwipe, 460);
}
}
document.addEventListener('touchend', end, { passive: true });
document.addEventListener('touchcancel', function () {
if (mode === 'x') { setSwipe(0, true); clearSwipe.t = setTimeout(clearSwipe, 460); }
mode = 'no';
}, { passive: true });
}
function warmUp() {
if (!HAS_WORKS || PAGE === 'portfolio' || !window.SITE_RENDER_WORKS || !window.SITE_UTIL) return;
var c = navigator.connection;
if (c && (c.saveData || /(^|-)2g$/.test(c.effectiveType || ''))) return;
var works = document.querySelector('[data-section="works"]');
if (!works || !works.hidden) return;
var page = window.SITE_UTIL.page;
works.classList.add('is-warming');
works.setAttribute('aria-hidden', 'true');
window.SITE_UTIL.page = 'portfolio';
try { window.SITE_RENDER_WORKS(); } catch (e) {}
window.SITE_UTIL.page = page;
Array.prototype.forEach.call(works.querySelectorAll('.fade'), function (el) { el.classList.add('is-in'); });
setTimeout(function () {
if (!works.classList.contains('is-warming')) return;
works.classList.remove('is-warming');
works.removeAttribute('aria-hidden');
if (PAGE !== 'portfolio') { works.innerHTML = ''; works.hidden = true; }
}, 600);
}
function whenIdle(fn) {
var go = function () {
if (window.requestIdleCallback) requestIdleCallback(fn, { timeout: 4000 });
else setTimeout(fn, 1200);
};
if (document.readyState === 'complete') setTimeout(go, 800);
else window.addEventListener('load', function () { setTimeout(go, 800); }, { once: true });
}
function clearHomeBlocks() {
var list = ['[data-section="projects"]', '[data-bind="links"]', '[data-section="now"]'];
if (PAGE !== 'reviews') list.push('[data-section="reviews"]');
if (PAGE === 'category' || PAGE === 'work' || PAGE === 'service' || PAGE === 'site' ||
PAGE === 'articles' || PAGE === 'article') list.push('.intro');
list.forEach(function (s) {
var el = document.querySelector(s);
if (el) { el.innerHTML = ''; el.hidden = true; }
});
}
function initFade() {
var root = document.documentElement;
var items = document.querySelectorAll('.fade');
if (!root.classList.contains('motion')) {
Array.prototype.forEach.call(items, function (el) { el.classList.add('is-in'); });
return;
}
var vh = window.innerHeight || 800, vw = window.innerWidth || 400, last = 0;
Array.prototype.forEach.call(items, function (el) {
var r = el.getBoundingClientRect();
var d = r.top < vh ? Math.round(Math.max(0, r.top) / vh * 380 + Math.max(0, r.left) / vw * 70) : 0;
if (d > last) last = d;
el.style.setProperty('--d', d + 'ms');
el.classList.add('is-in');
});
var done = false;
var show = function () {
if (done) return;
done = true;
root.classList.add('motion-go');
setTimeout(function () { root.classList.add('motion-done'); }, last + 1000);
};
if (window.requestAnimationFrame) {
requestAnimationFrame(function () { requestAnimationFrame(show); });
}
setTimeout(show, 150);
}
if (PAGE === 'home' || PAGE === 'portfolio' || PAGE === 'reviews' || PAGE === 'services') renderHero();
renderTabs();
if (PAGE === 'home') {
applyMeta();
renderProjects();
renderLinks();
normalizeIcons();
renderNow();
renderReviews();
} else {
clearHomeBlocks();
if (PAGE === 'reviews') renderReviews();
if (PAGE === 'services') renderServices();
}
renderFooter();
renderLang();
initPill();
initCopy();
initTap();
initNoDrag();
initQr();
window.SITE_UTIL = { esc: esc, typo: typo, asset: asset, icon: icon, brand: BRAND, askUrl: askUrl, cta: ctaPair,
articles: artItems, artCard: artCard,
page: PAGE, cat: CAT, work: WORK, svcId: SVC, art: ART,
svc: { rows: svcRows, notes: svcNotes, order: svcOrder, seller: svcSeller, card: svcCard,
path: svcPath, keep: keepNum, review: reviewCard, deal: UI.deal } };
if (PAGE !== 'home' && window.SITE_RENDER_WORKS) window.SITE_RENDER_WORKS();
initFade();
initSwitch();
initSwipe();
if (slot('tabs') && !slot('tabs').hidden) whenIdle(warmUp);
})();
