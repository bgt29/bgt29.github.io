(function () {
'use strict';
function initShelves(root) {
Array.prototype.forEach.call((root || document).querySelectorAll('.shelf__wrap'), function (wrap) {
var row = wrap.querySelector('.shelf__row');
var prev = wrap.querySelector('.shelf__nav--prev'), next = wrap.querySelector('.shelf__nav--next');
if (!prev || !next) return;
if (wrap._shelf) return;
wrap._shelf = true;
wrap.classList.add('has-fade');
function sync() {
prev.hidden = row.scrollLeft <= 4;
next.hidden = row.scrollLeft + row.clientWidth >= row.scrollWidth - 4;
wrap.classList.toggle('is-start', prev.hidden);
wrap.classList.toggle('is-end', next.hidden);
}
function step(dir) {
cancelAnimationFrame(glide);
var r = row.getBoundingClientRect(), k = row.clientWidth / Math.max(1, r.width);
var pad = parseFloat(getComputedStyle(row).paddingLeft) || 0;
var target = row.scrollLeft + dir * row.clientWidth * 0.9, best = target, bd = Infinity;
Array.prototype.forEach.call(row.children, function (c) {
var x = (c.getBoundingClientRect().left - r.left) * k + row.scrollLeft - pad;
if (Math.abs(x - target) < bd) { bd = Math.abs(x - target); best = x; }
});
row.scrollTo({ left: Math.max(0, best), behavior: 'smooth' });
}
prev.addEventListener('click', function () { step(-1); });
next.addEventListener('click', function () { step(1); });
var drag = null, moved = false, glide = 0;
row.addEventListener('pointerdown', function (e) {
if (e.pointerType !== 'mouse' || e.button !== 0) return;
cancelAnimationFrame(glide);
moved = false;
drag = { id: e.pointerId, x: e.clientX, left: row.scrollLeft, lx: e.clientX, t: e.timeStamp, v: 0,
k: row.clientWidth / Math.max(1, row.getBoundingClientRect().width) };
});
row.addEventListener('pointermove', function (e) {
if (!drag || e.pointerId !== drag.id) return;
var dx = e.clientX - drag.x;
if (!moved) {
if (Math.abs(dx) < 6) return;
moved = true;
try { row.setPointerCapture(e.pointerId); } catch (err) {}
wrap.classList.add('is-dragging');
}
row.scrollLeft = drag.left - dx * drag.k;
var dt = e.timeStamp - drag.t;
if (dt > 0) {
drag.v = .7 * ((e.clientX - drag.lx) * drag.k / dt) + .3 * drag.v;
drag.t = e.timeStamp; drag.lx = e.clientX;
}
});
function release(e) {
if (!drag || e.pointerId !== drag.id) return;
var d = drag, v = -d.v, last = performance.now();
drag = null;
wrap.classList.remove('is-dragging');
if (!moved || e.timeStamp - d.t > 90) return;
(function roll() {
glide = requestAnimationFrame(function () {
var now = performance.now(), dt = Math.min(32, now - last), max = row.scrollWidth - row.clientWidth;
last = now;
row.scrollLeft += v * dt;
v *= Math.pow(.996, dt);
if (Math.abs(v) > .03 && row.scrollLeft > 0 && row.scrollLeft < max) roll();
});
})();
}
row.addEventListener('pointerup', release);
row.addEventListener('pointercancel', release);
row.addEventListener('click', function (e) {
if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; }
}, true);
row.addEventListener('scroll', sync, { passive: true });
window.addEventListener('resize', sync);
sync();
});
}
window.SITE_SHELVES = initShelves;
window.SITE_RENDER_WORKS = function () {
var box = document.querySelector('[data-section="works"]');
if (!box) return;
var C = window.SITE_CONFIG || {};
var P = C.portfolio || {};
var T = window.SITE_T;
var U = window.SITE_UTIL;
if (U.page === 'reviews' || U.page === 'services') return;
var esc = U.esc, typo = U.typo;
var LANG = window.SITE_LANG;
var PHOTOS = window.SITE_PHOTOS || {};
var PRE = LANG === 'en' ? '/en' : '';
var UI = {
ru: { portfolio: 'Портфолио', all: 'Все', photo: 'фото', more: 'Ещё в разделе',
prev: 'Пролистать назад', next: 'Пролистать вперёд',
prevPhoto: 'Предыдущее фото', nextPhoto: 'Следующее фото',
site: 'Открыть сайт', learn: 'Подробнее', path: 'Где вы на сайте',
tgPost: 'Пост в Telegram', igPost: 'Пост в Instagram', video: 'видео',
empty: 'Работы скоро появятся.', soon: 'Скоро здесь появятся работы',
services: 'Услуги', includes: 'Что входит', steps: 'Как проходит', prices: 'Цены',
terms: 'Условия', works: 'Работы', where: 'Где посмотреть', reviews: 'Отзывы',
allReviews: 'Все отзывы', faq: 'Частые вопросы', otherSvc: 'Другие услуги',
write: 'Написать в Telegram',
aboutSite: 'О сайте', siteFeatures: 'Что умеет', siteControls: 'Управление',
siteEggs: 'Пасхалки', siteTech: 'Как сделан',
months: ['январь', 'февраль', 'март', 'апрель', 'май', 'июнь', 'июль',
'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь'] },
en: { portfolio: 'Portfolio', all: 'All', photo: 'photo', more: 'More in',
prev: 'Scroll back', next: 'Scroll forward',
prevPhoto: 'Previous photo', nextPhoto: 'Next photo',
site: 'Open website', learn: 'Learn more', path: 'You are here',
tgPost: 'Telegram post (in Russian)', igPost: 'Instagram post', video: 'video',
empty: 'Work coming soon.', soon: 'Work coming soon',
services: 'Services', includes: 'What’s included', steps: 'How it works', prices: 'Prices',
terms: 'Terms', works: 'Work', where: 'Where to see it', reviews: 'Reviews',
allReviews: 'All reviews', faq: 'Questions', otherSvc: 'Other services',
write: 'Message me on Telegram',
aboutSite: 'About this site', siteFeatures: 'Features', siteControls: 'Controls',
siteEggs: 'Easter eggs', siteTech: 'How it’s built',
months: ['January', 'February', 'March', 'April', 'May', 'June', 'July',
'August', 'September', 'October', 'November', 'December'] }
}[LANG];
function count(n) {
if (LANG === 'en') return n + (n === 1 ? ' work' : ' works');
var a = n % 10, b = n % 100;
var w = a === 1 && b !== 11 ? 'работа' : a >= 2 && a <= 4 && (b < 12 || b > 14) ? 'работы' : 'работ';
return n + ' ' + w;
}
var cats = (P.categories || []).filter(function (c) { return c && c.id; });
var catName = {}, catMore = {}, catOrg = {};
cats.forEach(function (c) {
catName[c.id] = T(c.name);
catMore[c.id] = [].concat(c.more || []).filter(function (m) {
return m && (T(m.url) || (m.links || []).some(function (l) { return T(l.url); }));
});
catOrg[c.id] = c.org && T(c.org.text) ? c.org : null;
});
var items = (P.items || []).filter(function (w) { return w && w.id && catName[w.category]; })
.map(function (w, i) { return { w: w, i: i }; })
.sort(function (a, b) {
var da = String(a.w.date || ''), db = String(b.w.date || '');
if (da !== db) return da < db ? 1 : -1;
return a.i - b.i;
})
.map(function (x) { return x.w; });
function inCat(id) { return items.filter(function (w) { return w.category === id; }); }
function photosOf(w) { return (LANG === 'en' && PHOTOS[w.id + '-en']) || PHOTOS[w.id] || []; }
function isVideo(p) { return !!(p && p.video); }
var CAMERA_ICON = '<svg viewBox="0 0 24 24" width="13" height="13" aria-hidden="true" fill="none" stroke="currentColor"' +
' stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="15" rx="3"/>' +
'<circle cx="12" cy="12.5" r="3.5"/><path d="M8 5l1.5-2h5L16 5"/></svg>';
var PLAY_ICON = '<svg viewBox="0 0 24 24" width="13" height="13" aria-hidden="true" fill="currentColor">' +
'<path d="M8 5.5v13l10.5-6.5z"/></svg>';
function urlPortfolio() { return PRE + '/portfolio/'; }
function urlCat(id) { return PRE + '/portfolio/' + id + '/'; }
function urlWork(w) { return PRE + '/portfolio/' + w.category + '/' + w.id + '/'; }
function ctaFor(url, cat) {
var host = (/^https?:\/\/(?:www\.)?([^\/?#]+)/i.exec(url) || [])[1] || '';
if (/^(t\.me|telegram\.me)$/i.test(host)) return UI.tgPost;
if (/^instagram\.com$/i.test(host)) return UI.igPost;
return cat === 'sites' ? UI.site : UI.learn;
}
function when(date, full) {
var m = /^(\d{4})(?:-(\d{1,2}))?/.exec(String(date || ''));
if (!m) return '';
if (!full || !m[2]) return m[1];
var month = UI.months[+m[2] - 1];
return month ? month + ' ' + m[1] : m[1];
}
function arrow(dir, label, cls) {
return '<button class="' + cls + ' ' + cls + '--' + dir + '" type="button" aria-label="' + esc(label) + '">' +
'<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="none" stroke="currentColor"' +
' stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="' +
(dir === 'prev' ? 'M15 5l-7 7 7 7' : 'M9 5l7 7-7 7') + '"/></svg></button>';
}
var ART_UI = {
ru: { title: 'Статьи', useful: 'Полезное', all: 'Все статьи', more: 'Ещё статьи',
services: 'Услуги по теме', min: 'мин чтения',
source: 'Впервые — в моём Telegram-канале «Про ПК»:', post: 'пост',
sources: 'Собрано из постов моего Telegram-канала «Про ПК»:' },
en: { title: 'Articles', useful: 'Useful reading', all: 'All articles', more: 'More articles',
services: 'Related services', min: 'min read',
source: 'First published on my Telegram channel (in Russian):', post: 'post',
sources: 'Based on posts from my Telegram channel (in Russian):' }
}[LANG];
function articles() { return U.articles(); }
function artCard(a) { return U.artCard(a); }
var eagerLeft = 2;
function card(w, withText) {
var ph = photosOf(w), cover = ph[0];
var lazy = eagerLeft > 0 ? (eagerLeft--, '') : ' loading="lazy"';
var title = T(w.title), text = String(T(w.text) || '').replace(/\n+/g, ' ');
var year = when(w.date);
var sizes = withText ? '(max-width: 520px) 100vw, 260px' : '(max-width: 520px) 86vw, 480px';
return '<a class="work fade" href="' + urlWork(w) + '">' +
'<span class="work__cover">' +
(cover
? '<img src="' + esc(cover.thumb) + '" srcset="' + esc(cover.thumb) + ' ' + cover.tw + 'w, ' +
esc(cover.src) + ' ' + cover.w + 'w" sizes="' + sizes + '" alt="' + esc(title) + '"' +
' width="' + cover.tw + '" height="' + cover.th + '"' + lazy + ' decoding="async">'
: U.icon('link', 28)) +
'</span>' +
(ph.length > 1 || isVideo(cover)
? '<span class="work__count" aria-label="' + ph.length + ' ' + (isVideo(cover) ? UI.video : UI.photo) + '">' +
(isVideo(cover) ? PLAY_ICON : CAMERA_ICON) + ph.length + '</span>'
: '') +
'<span class="work__body">' +
(year ? '<span class="work__meta">' + esc(year) + '</span>' : '') +
'<span class="work__title">' + esc(typo(title)) + '</span>' +
(withText && text ? '<span class="work__text">' + esc(typo(text)) + '</span>' : '') +
'</span>' +
'</a>';
}
function brandOf(m) { return (U.brand || {})[m.icon] || 'var(--accent)'; }
function socials(m) {
return '<span class="socials">' + m.links.filter(function (l) { return T(l.url); }).map(function (l) {
var label = T(l.label) || l.icon;
if (!l.icon) {
return '<a class="socials__item socials__item--text" href="' + esc(T(l.url)) + '" target="_blank" rel="noopener">' +
esc(label) + '</a>';
}
return '<a class="socials__item" href="' + esc(T(l.url)) + '" target="_blank" rel="noopener"' +
' style="--brand: ' + brandOf(l) + '" aria-label="' + esc(label) + '" title="' + esc(label) + '">' +
U.icon(l.icon, 24) + '</a>';
}).join('') + '</span>';
}
function moreCard(m) {
var sub = T(m.sub);
if (m.links) {
return '<div class="work work--more work--group fade">' +
'<span class="work__cover" style="--brand: ' + brandOf(m) + '">' + U.icon(m.icon, 46) + '</span>' +
'<span class="work__body">' +
'<span class="work__title">' + esc(typo(T(m.title))) + '</span>' +
(sub ? '<span class="work__sub">' + esc(typo(sub)) + '</span>' : '') +
socials(m) +
'</span>' +
'</div>';
}
return '<a class="work work--more fade" href="' + esc(U.askUrl(T(m.url), m.ask)) + '" target="_blank" rel="noopener">' +
'<span class="work__cover" style="--brand: ' + brandOf(m) + '">' + U.icon(m.icon, 46) + '</span>' +
'<span class="work__body">' +
'<span class="work__title">' + esc(typo(T(m.title))) + '</span>' +
(sub ? '<span class="work__sub">' + esc(typo(sub)) + '</span>' : '') +
'</span>' +
'</a>';
}
function moreBanner(m) {
var sub = T(m.sub);
if (m.links) {
return '<div class="more more--group">' +
'<span class="link__icon" style="--brand: ' + brandOf(m) + '">' + U.icon(m.icon, 24) + '</span>' +
'<span class="more__text">' +
'<span class="more__title">' + esc(typo(T(m.title))) + '</span>' +
(sub ? '<span class="more__sub">' + esc(typo(sub)) + '</span>' : '') +
socials(m) +
'</span>' +
'</div>';
}
return '<a class="more" href="' + esc(U.askUrl(T(m.url), m.ask)) + '" target="_blank" rel="noopener">' +
'<span class="link__icon" style="--brand: ' + brandOf(m) + '">' + U.icon(m.icon, 24) + '</span>' +
'<span class="more__text">' +
'<span class="more__title">' + esc(typo(T(m.title))) + '</span>' +
(sub ? '<span class="more__sub">' + esc(typo(sub)) + '</span>' : '') +
'</span>' +
U.icon('out', 18, 'more__arrow') +
'</a>';
}
function orgLine(id, key) {
var o = catOrg[id];
var line = o && T(o[key || 'text']);
if (!line) return '';
var href = T(o.url), text = esc(typo(line));
return href
? '<a class="org" href="' + esc(href) + '" target="_blank" rel="noopener">' + text + U.icon('out', 14) + '</a>'
: '<p class="org">' + text + '</p>';
}
function offersOf(id) { return (catMore[id] || []).filter(function (m) { return m.offer; }); }
function linksOf(id) { return (catMore[id] || []).filter(function (m) { return !m.offer; }); }
function shelf(id, list, title, allHref, total, cat) {
var more = linksOf(cat || id);
return '<section class="shelf fade" aria-labelledby="shelf-' + esc(id) + '">' +
'<div class="shelf__head">' +
'<h2 class="shelf__title" id="shelf-' + esc(id) + '">' +
(allHref ? '<a href="' + allHref + '">' + esc(title) + '</a>' : esc(title)) + '</h2>' +
(allHref
? '<a class="shelf__all" href="' + allHref + '">' + esc(UI.all) +
' <span>' + (total || list.length) + '</span>' + U.icon('arrow', 15) + '</a>'
: '') +
'</div>' +
(cat ? '' : orgLine(id) + offersOf(id).map(moreBanner).join('')) +
'<div class="shelf__wrap">' +
'<div class="shelf__row">' + list.map(function (w) { return card(w, false); }).join('') +
more.map(moreCard).join('') + '</div>' +
arrow('prev', UI.prev, 'shelf__nav') + arrow('next', UI.next, 'shelf__nav') +
'</div>' +
'</section>';
}
function crumbs(trail) {
var h = C.hero || {};
var av = U.asset(h.avatar);
return '<nav class="crumbs fade" aria-label="' + esc(UI.path) + '">' +
'<a class="crumbs__me" href="' + PRE + '/" aria-label="' + esc(T(h.name)) + '">' +
(av ? '<img src="' + esc(av) + '" alt="" width="28" height="28">' : '') +
'<span>' + esc(T(h.name)) + '</span></a>' +
trail.map(function (c) {
return '<span class="crumbs__sep" aria-hidden="true">›</span><a href="' + c.href + '">' + esc(c.label) + '</a>';
}).join('') +
'</nav>';
}
var portfolioName = T(P.title) || UI.portfolio;
if (U.page === 'portfolio') {
box.innerHTML = cats.map(function (c) {
var list = inCat(c.id);
if (list.length) return shelf(c.id, list, catName[c.id], urlCat(c.id));
return P.showEmpty === true || catMore[c.id].length ? soonShelf(c.id, catName[c.id]) : '';
}).join('') || '<p class="works__empty fade">' + esc(UI.empty) + '</p>';
}
function soonShelf(id, title) {
return '<section class="shelf fade" aria-labelledby="shelf-' + esc(id) + '">' +
'<div class="shelf__head"><h2 class="shelf__title" id="shelf-' + esc(id) + '">' + esc(title) + '</h2></div>' +
orgLine(id) +
(catMore[id].length ? catMore[id].map(moreBanner).join('') :
'<div class="soon">' +
'<span class="soon__icon">' +
'<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" fill="none" stroke="currentColor"' +
' stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/>' +
'<path d="M12 7v5l3 2"/></svg>' +
'</span>' +
'<span class="soon__text">' + esc(UI.soon) + '</span>' +
'</div>') +
'</section>';
}
if (U.page === 'category') {
var cat = cats.filter(function (c) { return c.id === U.cat; })[0] || {};
var list = inCat(U.cat);
var about = T(cat.description);
box.innerHTML = crumbs([{ href: urlPortfolio(), label: portfolioName }]) +
'<header class="pagehead fade">' +
'<h1 class="pagehead__title">' + esc(catName[U.cat] || '') + '</h1>' +
'<p class="pagehead__sub">' + esc(count(list.length)) + '</p>' +
(about ? '<p class="pagehead__text">' + esc(typo(about)) + '</p>' : '') +
orgLine(U.cat) +
'</header>' +
offersOf(U.cat).map(moreBanner).join('') +
'<div class="works__grid">' + list.map(function (w) { return card(w, true); }).join('') +
linksOf(U.cat).map(moreCard).join('') + '</div>';
}
var PARTS = {
cpu:      { icon: 'cpu',    ru: 'Процессор',         en: 'Processor' },
gpu:      { icon: 'gpu',    ru: 'Видеокарта',        en: 'Graphics card' },
mb:       { icon: 'board',  ru: 'Материнская плата', en: 'Motherboard' },
ram:      { icon: 'ram',    ru: 'Память',            en: 'Memory' },
ssd:      { icon: 'drive',  ru: 'Накопитель',        en: 'Storage' },
cool:     { icon: 'fan',    ru: 'Охлаждение',        en: 'Cooling' },
psu:      { icon: 'power',  ru: 'Блок питания',      en: 'Power supply' },
case:     { icon: 'tower',  ru: 'Корпус',            en: 'Case' },
camera:   { icon: 'camera', ru: 'Камера',            en: 'Camera' },
platform: { icon: 'layers', ru: 'Платформа',         en: 'Platform' },
tech:     { icon: 'code',   ru: 'Технологии',        en: 'Technologies' }
};
function specsBlock(list) {
if (!list.length) return '';
return '<ul class="specs' + (list.length === 1 ? ' specs--one' : '') + '">' + list.map(function (s) {
var p = PARTS[s.part];
return p
? '<li class="specs__item"><span class="specs__ic">' + U.icon(p.icon, 22) + '</span>' +
'<span class="specs__txt"><span class="specs__k">' + esc(LANG === 'en' ? p.en : p.ru) + '</span>' +
'<span class="specs__v">' + esc(typo(s.name)) + '</span></span></li>'
: '<li class="specs__item specs__item--tag"><span class="specs__ic">' + U.icon('check', 15) + '</span>' +
'<span class="specs__v">' + esc(typo(s.name)) + '</span></li>';
}).join('') + '</ul>';
}
function reviewBlock(r) {
var text = r && T(r.text);
if (!text) return '';
var who = [T(r.role), T(r.source)].filter(Boolean).join(' · ');
return '<figure class="review">' +
'<svg class="review__mark" viewBox="0 0 24 24" width="30" height="30" aria-hidden="true" fill="currentColor">' +
'<path d="M4.6 18.3c-1-1.1-1.6-2.3-1.6-4.3 0-3.5 2.5-6.6 6-8.2l.9 1.4C6.6 9 6 11 5.7 12.4c.7-.4 1.6-.5 2.4-.4 2.2.2 3.9 2 3.9 4.3a4.4 4.4 0 0 1-4.4 4.4c-1.3 0-2.5-.6-3.1-1.4Zm10 0c-1-1.1-1.6-2.3-1.6-4.3 0-3.5 2.5-6.6 6-8.2l.9 1.4c-3.3 1.8-3.9 3.8-4.2 5.2.7-.4 1.6-.5 2.4-.4 2.2.2 3.9 2 3.9 4.3a4.4 4.4 0 0 1-4.4 4.4c-1.3 0-2.5-.6-3.1-1.4Z"/></svg>' +
'<blockquote class="review__text">' +
String(text).split(/\n+/).filter(function (s) { return s.trim(); })
.map(function (s) { return '<p>' + esc(typo(s.trim())) + '</p>'; }).join('') +
'</blockquote>' +
'<figcaption class="review__who">' +
'<span class="review__name">' + esc(T(r.name)) + '</span>' +
(who ? '<span class="review__role">' + esc(who) + '</span>' : '') +
'</figcaption>' +
'</figure>';
}
if (U.page === 'work') {
var w = items.filter(function (x) { return x.id === U.work; })[0];
if (!w) { box.innerHTML = '<p class="works__empty fade">' + esc(UI.empty) + '</p>'; box.hidden = false; return; }
var ph = photosOf(w), title = T(w.title);
var ratio = ph[0] ? Math.min(16 / 9, Math.max(3 / 4, ph[0].w / ph[0].h)) : 4 / 3;
var narrow = ph.length ? Math.min.apply(null, ph.map(function (p) { return p.w / p.h; })) : 4 / 3;
var ratioWide = narrow > 4 / 3 ? Math.min(16 / 9, narrow) : 4 / 3;
var specs = (w.specs || []).map(function (s) {
return s && s.part ? { part: PARTS[s.part] ? s.part : '', name: T(s.name) } : { part: '', name: T(s) };
}).filter(function (s) { return s.name; });
var stats = (w.stats || []).filter(function (s) { return s && T(s.value); });
var url = T(w.url);
var others = inCat(w.category).filter(function (x) { return x.id !== w.id; });
box.innerHTML = crumbs([
{ href: urlPortfolio(), label: portfolioName },
{ href: urlCat(w.category), label: catName[w.category] }
]) +
(ph.length
? '<div class="gallery fade" style="--r-phone:' + ratio.toFixed(4) + ';--r-wide:' + ratioWide.toFixed(4) + '">' +
'<div class="gallery__track" tabindex="0">' +
ph.map(function (p, i) {
var label = title + (ph.length > 1 ? ' — ' + (isVideo(p) ? UI.video : UI.photo) + ' ' + (i + 1) : '');
if (isVideo(p)) {
return '<figure class="gallery__slide"><video src="' + esc(p.video) + '" poster="' + esc(p.src) + '"' +
' width="' + p.w + '" height="' + p.h + '" controls playsinline preload="none"' +
' aria-label="' + esc(label) + '"></video></figure>';
}
return '<figure class="gallery__slide"><img src="' + esc(p.src) + '" alt="' +
esc(label) + '" width="' + p.w +
'" height="' + p.h + '"' + (i ? ' loading="lazy"' : '') + ' decoding="async"></figure>';
}).join('') +
'</div>' +
(ph.length > 1
? arrow('prev', UI.prevPhoto, 'gallery__nav') + arrow('next', UI.nextPhoto, 'gallery__nav') +
'<span class="gallery__count">1 / ' + ph.length + '</span>'
: '') +
'</div>'
: '') +
'<article class="work-page fade">' +
'<p class="work-page__meta">' + esc([catName[w.category], when(w.date, true)].filter(Boolean).join(' · ')) + '</p>' +
'<h1 class="work-page__title">' + esc(typo(title)) + '</h1>' +
(w.team ? orgLine(w.category, 'work') : '') +
(stats.length
? '<ul class="stats" style="--n:' + Math.min(stats.length, 4) + ';--m:' + (stats.length > 3 ? 2 : stats.length) + '">' + stats.map(function (s) {
return '<li class="stats__item"><span class="stats__num">' + esc(T(s.value)) + '</span>' +
'<span class="stats__label">' + esc(typo(T(s.label) || '')) + '</span></li>';
}).join('') + '</ul>'
: '') +
'<div class="work-page__text">' +
String(T(w.text) || '').split(/\n+/).filter(function (s) { return s.trim(); })
.map(function (s) { return '<p>' + esc(typo(s.trim())) + '</p>'; }).join('') +
'</div>' +
specsBlock(specs) +
reviewBlock(w.review) +
(url
? (url.charAt(0) === '/'
? '<a class="cta-btn" href="' + esc(PRE + url) + '">'
: '<a class="cta-btn" href="' + esc(url) + '" target="_blank" rel="noopener">') +
esc(T(w.cta) || ctaFor(url, w.category)) + U.icon('arrow', 16) + '</a>'
: '') +
(catMore[w.category] || []).map(moreBanner).join('') +
'</article>' +
(others.length
? shelf('more', others, LANG === 'en' ? UI.more + ' ' + catName[w.category]
: UI.more + ' «' + catName[w.category] + '»',
urlCat(w.category), others.length + 1, w.category)
: '');
}
if (U.page === 'service' && U.svc) {
var SV = C.services || {}, S2 = U.svc;
var pages = (SV.pages || []).filter(function (x) { return x && x.id; });
var sp = pages.filter(function (x) { return x.id === U.svcId; })[0];
if (!sp) { box.innerHTML = '<p class="works__empty fade">' + esc(UI.empty) + '</p>'; box.hidden = false; return; }
var head = function (t) { return '<h2 class="links__group fade">' + esc(t) + '</h2>'; };
var price = S2.keep(T(sp.price));
var html = crumbs([{ href: PRE + '/services/', label: T(SV.title) || UI.services }]) +
'<header class="svc-hero fade">' +
'<span class="svc-hero__ic">' + U.icon(sp.icon || 'check', 28) + '</span>' +
'<h1 class="svc-hero__title">' + esc(typo(T(sp.title))) + '</h1>' +
'<p class="svc-hero__price' + (price ? '' : ' svc-hero__price--deal') + '">' + esc(price || S2.deal) + '</p>' +
'<div class="svc-hero__lead">' + String(T(sp.lead) || '').split(/\n+/).filter(function (x) { return x.trim(); })
.map(function (x) { return '<p>' + esc(typo(x.trim())) + '</p>'; }).join('') + '</div>' +
U.cta(sp.id) +
'</header>';
var nums = (sp.stats || []).filter(function (x) { return x && T(x.value); });
if (nums.length) {
html += '<ul class="stats svc-stats fade" style="--n:' + Math.min(nums.length, 4) + ';--m:' + (nums.length > 3 ? 2 : nums.length) + '">' +
nums.map(function (x) {
return '<li class="stats__item"><span class="stats__num">' + esc(T(x.value)) + '</span>' +
'<span class="stats__label">' + esc(typo(T(x.label) || '')) + '</span></li>';
}).join('') + '</ul>';
}
if ((sp.features || []).length) {
html += head(UI.includes) + '<div class="svc-feats">' + sp.features.map(function (f) {
return '<div class="svc-feat fade"><span class="svc-feat__ic">' + U.icon(f.icon || 'check', 22) + '</span>' +
'<span class="svc-feat__title">' + esc(typo(T(f.title))) + '</span>' +
'<span class="svc-feat__text">' + esc(S2.keep(typo(T(f.text)))) + '</span></div>';
}).join('') + '</div>';
}
if ((sp.steps || []).length) {
html += head(UI.steps) + '<ol class="svc-steps fade">' + sp.steps.map(function (st, i) {
return '<li class="svc-steps__item"><span class="svc-steps__num">' + (i + 1) + '</span>' +
'<span class="svc-steps__txt"><span class="svc-steps__title">' + esc(typo(T(st.title))) + '</span>' +
'<span class="svc-steps__text">' + esc(S2.keep(typo(T(st.text)))) + '</span></span></li>';
}).join('') + '</ol>';
}
var KIT = (sp.kit && typeof sp.kit === 'object') ? sp.kit : (SV.kit || {});
if (sp.kit && (KIT.items || []).length) {
html += head(T(KIT.title)) + '<div class="svc-kit' + (KIT.photo ? '' : ' svc-kit--list') + ' fade">' +
(KIT.photo ? '<img class="svc-kit__photo" src="' + esc(U.asset(KIT.photo)) + '" alt="' + esc(T(KIT.alt)) + '" loading="lazy" width="1600" height="1200">' : '') +
'<ul class="svc-kit__list">' + KIT.items.map(function (k) {
return '<li><span class="svc-feat__ic">' + U.icon(k.icon || 'check', 20) + '</span>' +
'<span><span class="svc-kit__title">' + esc(typo(T(k.title))) + '</span>' +
'<span class="svc-kit__text">' + esc(typo(T(k.text))) + '</span></span></li>';
}).join('') + '</ul></div>';
}
var notes = S2.notes(sp.notes);
if ((sp.prices || []).length) {
html += head(UI.prices) + '<div class="svc fade"><ul class="svc__list">' + S2.rows(sp.prices) + '</ul>' +
(notes ? '<div class="svc__foot">' + notes + '</div>' : '') + '</div>';
} else if (notes) {
html += head(UI.terms) + '<div class="svc fade"><div class="svc__foot svc__foot--only">' + notes + '</div></div>';
}
var K = sp.calc;
if (K && K.fixed && K.threshold) {
var lab = esc(T(K.label));
html += head(T(K.title)) +
'<div class="svc-calc fade" data-calc="' + esc(sp.id) + '">' +
'<div class="svc-calc__in">' +
'<label class="svc-calc__label" for="calc-sum">' + lab + '</label>' +
'<span class="svc-calc__field"><input id="calc-sum" class="svc-calc__sum" type="text" inputmode="numeric" autocomplete="off" size="1"' +
' value="' + esc(String(K.value || K.threshold)) + '"><span class="svc-calc__cur">₽</span></span>' +
'<input class="svc-calc__range" type="range" aria-label="' + lab + '" min="0" max="1000" step="1" value="500">' +
'</div>' +
'<div class="svc-calc__out" aria-live="polite">' +
'<span class="svc-calc__label">' + esc(T(K.result)) + '</span>' +
'<span class="svc-calc__price"></span>' +
'<span class="svc-calc__note"></span>' +
U.cta(sp.id, T(K.button), 'svc-calc__go') +
'</div>' +
(T(K.hint) ? '<p class="svc-calc__hint">' + esc(typo(T(K.hint))) + '</p>' : '') +
'</div>';
}
var list = sp.cat ? inCat(sp.cat) : [];
var chans = [].concat(sp.links || []).reduce(function (all, id) { return all.concat(linksOf(id)); }, []);
if (list.length) {
html += shelf('svc', list, UI.works, urlCat(sp.cat), list.length, sp.cat);
var inRow = linksOf(sp.cat);
chans = chans.filter(function (m) { return inRow.indexOf(m) < 0; });
}
if (chans.length) html += head(list.length ? UI.where : UI.works) + chans.map(moreBanner).join('');
var R = C.reviews || {}, revs = [];
if (sp.reviews && R.enabled !== false) {
var re = new RegExp(sp.reviews, 'i');
revs = (R.items || []).filter(function (r) { return r && r.what && (r.group || 'build') === 'build' && re.test(r.what.ru || T(r.what)); })
.map(function (r) { return S2.review(r); });
}
list.filter(function (w) { return w.review && T(w.review.text); }).forEach(function (w) {
revs.push(S2.review({ name: w.review.name, quote: w.review.text, what: { ru: T(w.title), en: T(w.title) } }, urlWork(w)));
});
if (revs.length) {
html += '<div class="svc-head fade"><h2 class="links__group">' + esc(UI.reviews) + '</h2>' +
'<a class="shelf__all" href="' + PRE + '/reviews/">' + esc(UI.allReviews) + U.icon('arrow', 15) + '</a></div>' +
'<div class="revs">' + revs.slice(0, 6).join('') + '</div>';
}
var useful = articles().filter(function (a) { return (a.services || []).indexOf(sp.id) >= 0; });
if (useful.length) {
html += '<div class="shelf__head fade"><h2 class="links__group">' + esc(ART_UI.useful) + '</h2>' +
'<a class="shelf__all" href="' + PRE + '/articles/">' + esc(ART_UI.all) + U.icon('arrow', 15) + '</a></div>' +
'<div class="art-grid">' + useful.slice(0, 3).map(artCard).join('') + '</div>';
}
if ((sp.faq || []).length) {
html += head(UI.faq) + '<div class="faq fade">' + sp.faq.map(function (q) {
return '<details class="faq__item"><summary class="faq__q"><span>' + esc(typo(T(q.q))) + '</span>' +
U.icon('arrow', 16, 'faq__mark') + '</summary>' +
'<p class="faq__a">' + esc(S2.keep(typo(T(q.a)))) + '</p></details>';
}).join('') + '</div>';
}
var extra = S2.extra();
if (extra) html += '<div class="svc-grid svc-grid--one">' + extra + '</div>';
html += S2.order(sp.ask);
var rest = pages.filter(function (x) { return x.id !== sp.id; });
if (rest.length) {
html += head(UI.otherSvc) + '<div class="svc-links fade">' + rest.map(function (x) {
return '<a class="svc-links__item" href="' + S2.path(x.id) + '">' + U.icon(x.icon || 'check', 18) +
'<span>' + esc(typo(T(x.title))) + '</span></a>';
}).join('') + '</div>';
}
box.innerHTML = html + S2.seller();
}
if (U.page === 'site') {
var SI = C.siteInfo || {};
var h2 = function (t) { return '<h2 class="links__group fade">' + esc(t) + '</h2>'; };
var tiles = function (list) {
return '<div class="svc-feats">' + list.map(function (f) {
var href = f.href ? f.href + (f.href === '/privacy/' && LANG === 'en' ? '?lang=en' : '') : '';
var inner = '<span class="svc-feat__ic">' + U.icon(f.icon || 'check', 22) + '</span>' +
'<span class="svc-feat__title">' + esc(typo(T(f.title))) + '</span>' +
'<span class="svc-feat__text">' + esc(typo(T(f.text))) + '</span>';
return href ? '<a class="svc-feat svc-feat--link fade" href="' + esc(href) + '">' + inner + '</a>'
: '<div class="svc-feat fade">' + inner + '</div>';
}).join('') + '</div>';
};
var sh = crumbs([]) +
'<header class="svc-hero svc-hero--compact fade">' +
'<span class="svc-hero__ic">' + U.icon('code', 28) + '</span>' +
'<h1 class="svc-hero__title">' + esc(typo(T(SI.title) || UI.aboutSite)) + '</h1>' +
(T(SI.lead) ? '<div class="svc-hero__lead"><p>' + esc(typo(T(SI.lead))) + '</p></div>' : '') +
'</header>';
if ((SI.features || []).length) sh += h2(UI.siteFeatures) + tiles(SI.features);
if ((SI.controls || []).length) {
sh += h2(UI.siteControls) + '<ul class="site-keys fade">' + SI.controls.map(function (c) {
return '<li><span class="site-keys__k">' + esc(T(c.keys)) + '</span>' +
'<span class="site-keys__t">' + esc(typo(T(c.text))) + '</span></li>';
}).join('') + '</ul>';
}
if ((SI.eggs || []).length) {
sh += h2(UI.siteEggs) + (T(SI.eggsIntro) ? '<p class="site-note fade">' + esc(typo(T(SI.eggsIntro))) + '</p>' : '') +
'<div class="faq site-eggs fade">' + SI.eggs.map(function (e) {
return '<details class="faq__item"><summary class="faq__q">' +
'<span class="site-egg__ic">' + U.icon(e.icon || 'sparkle', 20) + '</span>' +
'<span class="site-egg__name"><span>' + esc(typo(T(e.title))) + '</span>' +
'<span class="site-egg__hint">' + esc(typo(T(e.hint))) + '</span></span>' +
U.icon('arrow', 16, 'faq__mark') + '</summary>' +
'<p class="faq__a">' + esc(typo(T(e.how))) + '</p></details>';
}).join('') + '</div>';
}
if ((SI.tech || []).length) sh += h2(UI.siteTech) + tiles(SI.tech);
box.innerHTML = sh;
}
if (U.page === 'articles') {
var AR = C.articles || {};
box.innerHTML = crumbs([]) +
'<header class="svc-hero svc-hero--compact fade">' +
'<span class="svc-hero__ic">' + U.icon('article', 28) + '</span>' +
'<h1 class="svc-hero__title">' + esc(typo(T(AR.title) || ART_UI.title)) + '</h1>' +
(T(AR.lead) ? '<div class="svc-hero__lead"><p>' + esc(typo(T(AR.lead))) + '</p></div>' : '') +
'</header>' +
(articles().length ? '<div class="art-grid art-grid--list">' + articles().map(artCard).join('') + '</div>'
: '<p class="works__empty fade">' + esc(UI.empty) + '</p>');
}
if (U.page === 'article') {
var A = articles().filter(function (a) { return a.id === U.art; })[0];
if (!A) box.innerHTML = '<p class="works__empty fade">' + esc(UI.empty) + '</p>';
else {
var aph = photosOf(A), cov = aph[0];
var BODY = [].concat(T(A.body) || []);
var words = BODY.map(function (b) {
return typeof b === 'string' ? b : [T(b.h), T(b.note), (b.list || []).map(T).join(' '), T(b.caption)].join(' ');
}).join(' ').split(/\s+/).filter(Boolean).length;
var mins = Math.max(1, Math.round(words / 170));
var meta = [when(A.date, true), mins + ' ' + ART_UI.min].filter(Boolean).join(' · ');
var figure = function (p, cap, eager) {
return '<figure class="art__fig">' +
'<img src="' + esc(p.src) + '" srcset="' + esc(p.thumb) + ' ' + p.tw + 'w, ' + esc(p.src) + ' ' + p.w + 'w"' +
' sizes="(max-width: 820px) 100vw, 780px" alt="' + esc(cap || T(A.title)) + '" width="' + p.w + '" height="' + p.h + '"' +
(eager ? '' : ' loading="lazy"') + ' decoding="async">' +
(cap ? '<figcaption>' + esc(typo(cap)) + '</figcaption>' : '') + '</figure>';
};
var body = BODY.map(function (b) {
if (typeof b === 'string' || (b && (b.ru || b.en))) return '<p>' + esc(typo(T(b))) + '</p>';
if (!b) return '';
if (b.h) return '<h2>' + esc(typo(T(b.h))) + '</h2>';
if (b.list) return '<ul>' + b.list.map(function (li) { return '<li>' + esc(typo(T(li))) + '</li>'; }).join('') + '</ul>';
if (b.photo) { var p = aph[b.photo - 1]; return p ? figure(p, T(b.caption), false) : ''; }
if (b.note) return '<aside class="art__note">' + U.icon('sparkle', 20) + '<p>' + esc(typo(T(b.note))) + '</p></aside>';
return '';
}).join('');
var src = [].concat(A.source || []).filter(Boolean);
var svcs = ((C.services || {}).pages || []).filter(function (x) { return x && (A.services || []).indexOf(x.id) >= 0; });
var others = articles().filter(function (a) { return a.id !== A.id; }).slice(0, 2);
box.innerHTML = '<div class="art-wrap">' +
crumbs([{ href: PRE + '/articles/', label: T((C.articles || {}).title) || ART_UI.title }]) +
'<article class="art fade">' +
'<header class="art__head">' +
(meta ? '<p class="art__meta">' + esc(meta) + '</p>' : '') +
'<h1 class="art__title">' + esc(typo(T(A.title))) + '</h1>' +
(T(A.description) ? '<p class="art__lead">' + esc(typo(T(A.description))) + '</p>' : '') +
'</header>' +
(cov ? figure(cov, '', true) : '') +
'<div class="art__body">' + body + '</div>' +
(src.length ? '<p class="art__source">' + U.icon('telegram', 16) + '<span>' +
esc(src.length > 1 ? ART_UI.sources : ART_UI.source) + ' ' + src.map(function (u, i) {
return '<a href="' + esc(u) + '" target="_blank" rel="noopener">' +
esc(src.length > 1 ? ART_UI.post + ' ' + (i + 1) : ART_UI.post) + '</a>';
}).join(', ') + '</span></p>' : '') +
'</article>' +
(svcs.length ? '<h2 class="links__group fade">' + esc(ART_UI.services) + '</h2>' +
'<div class="svc-grid">' + svcs.map(U.svc.card).join('') + '</div>' : '') +
(others.length ? '<div class="shelf__head fade"><h2 class="links__group">' + esc(ART_UI.more) + '</h2>' +
'<a class="shelf__all" href="' + PRE + '/articles/">' + esc(ART_UI.all) + U.icon('arrow', 15) + '</a></div>' +
'<div class="art-grid art-grid--two">' + others.map(artCard).join('') + '</div>' : '') +
'</div>';
}
}
box.hidden = false;
initShelves(box);
initGallery();
initCalc();
function initCalc() {
var el = box.querySelector('[data-calc]');
if (!el) return;
var sp = ((C.services || {}).pages || []).filter(function (x) { return x && x.id === el.getAttribute('data-calc'); })[0];
var K = sp && sp.calc;
if (!K) return;
var sum = el.querySelector('.svc-calc__sum'), range = el.querySelector('.svc-calc__range');
var out = el.querySelector('.svc-calc__price'), note = el.querySelector('.svc-calc__note');
var go = el.querySelector('.svc-calc__go');
var EN = document.documentElement.lang === 'en';
var fmt = function (n) { return EN ? n.toLocaleString('en-US') + '\u00a0₽' : n.toLocaleString('ru-RU').replace(/\s/g, '\u00a0') + '\u00a0₽'; };
var digits = function (n) { return EN ? n.toLocaleString('en-US') : n.toLocaleString('ru-RU').replace(/\s/g, '\u00a0'); };
function show(n) {
var price = n <= K.threshold ? K.fixed : Math.round(n * K.percent / 100);
out.textContent = fmt(price);
note.textContent = T(n <= K.threshold ? K.fixedNote : K.percentNote);
if (go) {
var t = String(T(K.ask) || '').replace('{budget}', fmt(n)).replace('{price}', fmt(price));
go.href = U.askUrl((C.services || {}).orderUrl, { ru: t, en: t });
}
}
var lo = K.min || 10000, hi = K.max || 2000000, span = Math.log(hi / lo);
function toSum(pos) {
var v = lo * Math.exp(span * pos / 1000), st = v < 100000 ? 1000 : v < 500000 ? 5000 : 10000;
return Math.round(v / st) * st;
}
function toPos(n) { return n <= lo ? 0 : n >= hi ? 1000 : Math.round(1000 * Math.log(n / lo) / span); }
function fromSum() {
var n = parseInt(String(sum.value).replace(/\D/g, '').slice(0, 15), 10) || 0;
sum.value = n ? digits(n) : '';
range.value = toPos(n);
show(n);
}
sum.addEventListener('input', fromSum);
range.addEventListener('input', function () { var n = toSum(+range.value); sum.value = digits(n); show(n); });
fromSum();
}
function lightSlide(img) {
var GW = 24, GH = 18;
var slide = img.closest('.gallery__slide');
if (!slide || !img.naturalWidth) return;
try {
var c = lightSlide.canvas || (lightSlide.canvas = document.createElement('canvas'));
c.width = GW; c.height = GH;
var ctx = c.getContext('2d', { willReadFrequently: true });
ctx.imageSmoothingQuality = 'high';
ctx.drawImage(img, 0, 0, GW, GH);
var d = ctx.getImageData(0, 0, GW, GH).data;
var avg = function (x0, x1, y0, y1) {
var r = 0, g = 0, b = 0, n = 0;
for (var y = y0; y <= y1; y++) for (var x = x0; x <= x1; x++) {
var k = (y * GW + x) * 4; r += d[k]; g += d[k + 1]; b += d[k + 2]; n++;
}
r /= n; g /= n; b /= n;
var top = Math.max(r, g, b, 1), m = top < 90 ? Math.min(1.6, 90 / top) : .95;
var grey = (r + g + b) / 3, sat = function (v) { return Math.max(0, Math.min(255, Math.round((grey + (v - grey) * 1.12) * m))); };
return 'rgb(' + sat(r) + ',' + sat(g) + ',' + sat(b) + ')';
};
var s = slide.style;
s.setProperty('--g-lt', avg(0, 3, 0, 5));
s.setProperty('--g-lm', avg(0, 3, 6, 11));
s.setProperty('--g-lb', avg(0, 3, 12, 17));
s.setProperty('--g-rt', avg(20, 23, 0, 5));
s.setProperty('--g-rm', avg(20, 23, 6, 11));
s.setProperty('--g-rb', avg(20, 23, 12, 17));
s.setProperty('--g-tm', avg(8, 15, 0, 2));
s.setProperty('--g-bm', avg(8, 15, 15, 17));
slide.classList.add('is-lit');
} catch (e) {}
}
function initGallery() {
var g = box.querySelector('.gallery');
if (!g) return;
var track = g.querySelector('.gallery__track');
var counter = g.querySelector('.gallery__count');
var total = track.children.length;
var cur = 0, pos = 0, off = 0, busyUntil = 0, looped = false;
var videos = track.querySelectorAll('video');
var slides = track.children, shown = null;
function W() { return Math.max(1, track.clientWidth); }
function real(p) { return ((p - off) % total + total) % total; }
function lightAll() {
Array.prototype.forEach.call(track.querySelectorAll('.gallery__slide img'), function (img) {
var sl = img.closest('.gallery__slide');
if (sl.classList.contains('is-lit')) return;
if (img.complete && img.naturalWidth) lightSlide(img);
else img.addEventListener('load', function () { lightSlide(img); }, { once: true });
});
}
lightAll();
function ensureLoop() {
if (looped || total < 2) return;
looped = true;
var first = slides[0], last = slides[slides.length - 1];
var head = last.cloneNode(true), tail = first.cloneNode(true);
[head, tail].forEach(function (c) {
c.setAttribute('aria-hidden', 'true');
c.classList.remove('is-cur');
var im = c.querySelector('img');
if (im) { im.alt = ''; im.loading = 'eager'; }
});
var x = track.scrollLeft;
track.insertBefore(head, first);
track.appendChild(tail);
off = 1; pos += 1;
track.scrollLeft = x + W();
shown = null;
lightAll();
show();
}
function warm(i) {
Array.prototype.forEach.call(slides, function (sl, p) {
if (real(p) !== (i + total) % total) return;
var img = sl.querySelector('img');
if (img && img.loading === 'lazy') img.loading = 'eager';
});
}
function breath(sl) {
if (!sl || !sl.getAnimations) return null;
var list = sl.getAnimations({ subtree: true });
for (var i = 0; i < list.length; i++) if (list[i].animationName === 'gallery-breathe') return list[i];
return null;
}
function show() {
if (counter) counter.textContent = (cur + 1) + ' / ' + total;
var now = slides[pos];
if (now && now !== shown) {
var a = breath(shown), b = breath(now);
if (a && b) { try { b.currentTime = a.currentTime; } catch (e) {} }
if (shown) shown.classList.remove('is-cur');
now.classList.add('is-cur');
shown = now;
warm(cur - 1); warm(cur + 1);
}
Array.prototype.forEach.call(videos, function (v) {
if (!v.paused && v.closest('.gallery__slide') !== now) v.pause();
});
}
show();
var steering = false;
function home() {
if (!looped || drag || steering) return;
var p = Math.round(track.scrollLeft / W());
if (Math.abs(track.scrollLeft - p * W()) > 2) return;
if (p === 0 || p === total + 1) {
pos = p === 0 ? total : 1;
track.scrollLeft = pos * W();
show();
}
}
function unwrap() {
if (!looped) return false;
var shift = pos >= total + 1 ? -total : pos <= 0 ? total : 0;
if (!shift) return false;
pos += shift;
track.scrollTo({ left: track.scrollLeft + shift * W(), behavior: 'instant' });
return true;
}
function go(dir) {
ensureLoop();
var jumped = unwrap();
pos = Math.max(0, Math.min(slides.length - 1, pos + dir));
cur = real(pos);
busyUntil = Date.now() + 700;
var run = function () { steering = false; track.scrollTo({ left: pos * W(), behavior: 'smooth' }); };
if (jumped) { steering = true; requestAnimationFrame(run); } else run();
show();
}
var settle = 0;
track.addEventListener('scroll', function () {
if (Date.now() >= busyUntil) {
pos = Math.round(track.scrollLeft / W());
cur = real(pos);
show();
}
clearTimeout(settle);
settle = setTimeout(home, 120);
}, { passive: true });
track.addEventListener('scrollend', function () { clearTimeout(settle); home(); });
window.addEventListener('resize', function () { track.scrollLeft = pos * W(); });
['pointerdown', 'wheel', 'touchstart', 'focusin'].forEach(function (t) {
g.addEventListener(t, ensureLoop, { passive: true });
});
var prev = g.querySelector('.gallery__nav--prev'), next = g.querySelector('.gallery__nav--next');
if (prev) prev.addEventListener('click', function () { go(-1); });
if (next) next.addEventListener('click', function () { go(1); });
track.addEventListener('keydown', function (e) {
if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
});
var drag = null;
track.addEventListener('pointerdown', function (e) {
if (e.pointerType !== 'mouse' || e.button !== 0 || total < 2) return;
if (e.target.closest && e.target.closest('video')) return;
ensureLoop();
unwrap();
drag = { id: e.pointerId, x: e.clientX, left: track.scrollLeft, lx: e.clientX, t: e.timeStamp, v: 0,
moved: false, start: pos, k: track.clientWidth / Math.max(1, track.getBoundingClientRect().width) };
});
track.addEventListener('pointermove', function (e) {
if (!drag || e.pointerId !== drag.id) return;
var dx = e.clientX - drag.x;
if (!drag.moved) {
if (Math.abs(dx) < 6) return;
drag.moved = true;
try { track.setPointerCapture(e.pointerId); } catch (err) {}
g.classList.add('is-dragging');
}
track.scrollLeft = drag.left - dx * drag.k;
var dt = e.timeStamp - drag.t;
if (dt > 0) { drag.v = .7 * ((e.clientX - drag.lx) / dt) + .3 * drag.v; drag.t = e.timeStamp; drag.lx = e.clientX; }
});
function drop(e) {
if (!drag || e.pointerId !== drag.id) return;
var d = drag; drag = null;
if (!d.moved) return;
var dx = e.clientX - d.x, fast = e.timeStamp - d.t < 90 && Math.abs(d.v) > .4;
var to = d.start;
if (dx < -track.clientWidth / 5 / d.k || (fast && d.v < 0)) to = d.start + 1;
else if (dx > track.clientWidth / 5 / d.k || (fast && d.v > 0)) to = d.start - 1;
pos = Math.max(0, Math.min(slides.length - 1, to));
cur = real(pos);
busyUntil = Date.now() + 700;
track.scrollTo({ left: pos * W(), behavior: 'smooth' });
show();
setTimeout(function () { if (!drag) g.classList.remove('is-dragging'); }, 650);
}
track.addEventListener('pointerup', drop);
track.addEventListener('pointercancel', drop);
}
};
})();
