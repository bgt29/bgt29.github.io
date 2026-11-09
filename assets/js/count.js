(function () {
'use strict';
var C = window.SITE_CONFIG || {};
var CODE = String((C.analytics || {}).goatcounter || '').trim().toLowerCase();
if (!/^[a-z0-9-]+$/.test(CODE)) return;
function bare(h) { return String(h || '').toLowerCase().replace(/^www\./, ''); }
var SITE = bare((/^https?:\/\/([^\/:]+)/i.exec((C.meta || {}).url || '') || [])[1]);
var HERE = bare(location.hostname);
if (!SITE || HERE !== SITE) return;
if (navigator.webdriver) return;
try {
if (location.hash === '#toggle-goatcounter') {
var off = localStorage.getItem('skipgc') === 't';
if (off) localStorage.removeItem('skipgc'); else localStorage.setItem('skipgc', 't');
alert(off ? 'GoatCounter снова считает заходы из этого браузера.'
: 'GoatCounter больше не считает заходы из этого браузера. ' +
'Включить обратно — открыть этот же адрес ещё раз.');
}
if (localStorage.getItem('skipgc') === 't') return;
} catch (e) {}
var END = 'https://' + CODE + '.goatcounter.com/count';
function send(params) {
var q = Object.keys(params).filter(function (k) { return params[k]; }).map(function (k) {
return k + '=' + encodeURIComponent(params[k]);
});
q.push('rnd=' + Math.random().toString(36).slice(2));
new Image().src = END + '?' + q.join('&');
}
function view(from) {
send({
p: location.pathname + location.search,
t: document.title,
r: typeof from === 'string' ? from : document.referrer,
s: [screen.width, screen.height, window.devicePixelRatio || 1].join(',')
});
}
if (document.prerendering) document.addEventListener('prerenderingchange', function () { view(); }, { once: true });
else view();
document.addEventListener('site-pageview', function (e) { view((e.detail && e.detail.from) || ''); });
document.addEventListener('click', function (e) {
if (e.defaultPrevented) return;
var a = e.target.closest && e.target.closest('a[href]');
if (!a) return;
var u;
try { u = new URL(a.getAttribute('href'), location.href); } catch (err) { return; }
var name = '';
if (u.protocol === 'mailto:') name = 'mailto';
else if (/^https?:$/.test(u.protocol) && bare(u.hostname) !== HERE) {
var path = u.pathname;
try { path = decodeURIComponent(path); } catch (err) {}
name = bare(u.hostname) + path.replace(/\/+$/, '');
}
else if (/^\/avito\/?$/.test(u.pathname)) name = 'avito';
if (!name) return;
send({
p: name,
t: (a.getAttribute('aria-label') || a.innerText || a.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 100),
e: 'true'
});
}, true);
})();
