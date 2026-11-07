(function () {
'use strict';
var ECL = {
L: [1, [7, 10, 15, 20, 26, 18, 20, 24, 30, 18], [1, 1, 1, 1, 1, 2, 2, 2, 2, 4]],
M: [0, [10, 16, 26, 18, 24, 16, 18, 22, 22, 26], [1, 1, 1, 2, 2, 4, 4, 4, 5, 5]],
Q: [3, [13, 22, 18, 26, 18, 24, 18, 22, 20, 24], [1, 1, 2, 2, 4, 4, 6, 6, 8, 8]],
H: [2, [17, 28, 22, 16, 22, 28, 26, 26, 24, 28], [1, 1, 2, 4, 4, 4, 5, 6, 8, 8]]
};
var MAX_VER = 10;
function gfMul(x, y) {
var z = 0;
for (var i = 7; i >= 0; i--) {
z = (z << 1) ^ ((z >>> 7) * 0x11d);
z ^= ((y >>> i) & 1) * x;
}
return z;
}
function rsDivisor(deg) {
var r = [];
for (var i = 0; i < deg - 1; i++) r.push(0);
r.push(1);
var root = 1;
for (i = 0; i < deg; i++) {
for (var j = 0; j < r.length; j++) {
r[j] = gfMul(r[j], root);
if (j + 1 < r.length) r[j] ^= r[j + 1];
}
root = gfMul(root, 2);
}
return r;
}
function rsRemainder(data, div) {
var r = div.map(function () { return 0; });
data.forEach(function (b) {
var f = b ^ r.shift();
r.push(0);
div.forEach(function (c, i) { r[i] ^= gfMul(c, f); });
});
return r;
}
function rawModules(ver) {
var n = (16 * ver + 128) * ver + 64;
if (ver >= 2) {
var a = Math.floor(ver / 7) + 2;
n -= (25 * a - 10) * a - 55;
if (ver >= 7) n -= 36;
}
return n;
}
function dataWords(ver, e) {
return Math.floor(rawModules(ver) / 8) - ECL[e][1][ver - 1] * ECL[e][2][ver - 1];
}
function alignPos(ver) {
if (ver === 1) return [];
var num = Math.floor(ver / 7) + 2;
var step = Math.ceil((ver * 4 + 4) / (num * 2 - 2)) * 2;
var res = [6];
for (var p = ver * 4 + 10; res.length < num; p -= step) res.splice(1, 0, p);
return res;
}
function utf8(s) {
if (window.TextEncoder) return Array.prototype.slice.call(new TextEncoder().encode(s));
var e = unescape(encodeURIComponent(s)), out = [];
for (var i = 0; i < e.length; i++) out.push(e.charCodeAt(i));
return out;
}
function maskBit(m, x, y) {
switch (m) {
case 0: return (x + y) % 2 === 0;
case 1: return y % 2 === 0;
case 2: return x % 3 === 0;
case 3: return (x + y) % 3 === 0;
case 4: return (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0;
case 5: return x * y % 2 + x * y % 3 === 0;
case 6: return (x * y % 2 + x * y % 3) % 2 === 0;
default: return ((x + y) % 2 + x * y % 3) % 2 === 0;
}
}
function encode(text) {
var bytes = utf8(text), ver, e = 'M', cc;
for (ver = 1; ver <= MAX_VER; ver++) {
cc = ver < 10 ? 8 : 16;
if (4 + cc + bytes.length * 8 <= dataWords(ver, e) * 8) break;
}
if (ver > MAX_VER) return null;
['Q', 'H'].forEach(function (x) {
if (4 + cc + bytes.length * 8 <= dataWords(ver, x) * 8) e = x;
});
var bits = [], cap = dataWords(ver, e) * 8, i, j;
function put(v, n) { for (var k = n - 1; k >= 0; k--) bits.push((v >>> k) & 1); }
put(4, 4);
put(bytes.length, cc);
bytes.forEach(function (b) { put(b, 8); });
put(0, Math.min(4, cap - bits.length));
put(0, (8 - bits.length % 8) % 8);
for (var pad = 0xec; bits.length < cap; pad ^= 0xec ^ 0x11) put(pad, 8);
var words = [];
for (i = 0; i < bits.length; i += 8) {
var w = 0;
for (j = 0; j < 8; j++) w = (w << 1) | bits[i + j];
words.push(w);
}
var nb = ECL[e][2][ver - 1], el = ECL[e][1][ver - 1];
var raw = Math.floor(rawModules(ver) / 8);
var nShort = nb - raw % nb, shortLen = Math.floor(raw / nb);
var div = rsDivisor(el), blocks = [], k = 0;
for (i = 0; i < nb; i++) {
var dat = words.slice(k, k + shortLen - el + (i < nShort ? 0 : 1));
k += dat.length;
var ecc = rsRemainder(dat, div);
if (i < nShort) dat.push(0);
blocks.push(dat.concat(ecc));
}
var all = [];
for (i = 0; i < blocks[0].length; i++) {
for (j = 0; j < blocks.length; j++) {
if (i !== shortLen - el || j >= nShort) all.push(blocks[j][i]);
}
}
var size = ver * 4 + 17, mod = [], fn = [];
for (i = 0; i < size; i++) {
mod.push([]); fn.push([]);
for (j = 0; j < size; j++) { mod[i].push(false); fn[i].push(false); }
}
function set(x, y, dark) { mod[y][x] = dark; fn[y][x] = true; }
for (i = 0; i < size; i++) { set(6, i, i % 2 === 0); set(i, 6, i % 2 === 0); }
[[3, 3], [size - 4, 3], [3, size - 4]].forEach(function (c) {
for (var dy = -4; dy <= 4; dy++) {
for (var dx = -4; dx <= 4; dx++) {
var d = Math.max(Math.abs(dx), Math.abs(dy)), x = c[0] + dx, y = c[1] + dy;
if (x >= 0 && x < size && y >= 0 && y < size) set(x, y, d !== 2 && d !== 4);
}
}
});
var ap = alignPos(ver), na = ap.length;
for (i = 0; i < na; i++) {
for (j = 0; j < na; j++) {
if ((i === 0 && j === 0) || (i === 0 && j === na - 1) || (i === na - 1 && j === 0)) continue;
for (var ay = -2; ay <= 2; ay++) {
for (var ax = -2; ax <= 2; ax++) set(ap[i] + ax, ap[j] + ay, Math.max(Math.abs(ax), Math.abs(ay)) !== 1);
}
}
}
function drawFormat(mask) {
var d = ECL[e][0] << 3 | mask, rem = d;
for (var t = 0; t < 10; t++) rem = (rem << 1) ^ ((rem >>> 9) * 0x537);
var b = (d << 10 | rem) ^ 0x5412;
function bit(n) { return ((b >>> n) & 1) !== 0; }
for (t = 0; t <= 5; t++) set(8, t, bit(t));
set(8, 7, bit(6)); set(8, 8, bit(7)); set(7, 8, bit(8));
for (t = 9; t < 15; t++) set(14 - t, 8, bit(t));
for (t = 0; t < 8; t++) set(size - 1 - t, 8, bit(t));
for (t = 8; t < 15; t++) set(8, size - 15 + t, bit(t));
set(8, size - 8, true);
}
drawFormat(0);
if (ver >= 7) {
var vr = ver;
for (i = 0; i < 12; i++) vr = (vr << 1) ^ ((vr >>> 11) * 0x1f25);
var vb = ver << 12 | vr;
for (i = 0; i < 18; i++) {
var on = ((vb >>> i) & 1) !== 0, va = size - 11 + i % 3, vc = Math.floor(i / 3);
set(va, vc, on); set(vc, va, on);
}
}
var bi = 0;
for (var right = size - 1; right >= 1; right -= 2) {
if (right === 6) right = 5;
for (var vert = 0; vert < size; vert++) {
for (j = 0; j < 2; j++) {
var x = right - j, up = ((right + 1) & 2) === 0, y = up ? size - 1 - vert : vert;
if (!fn[y][x] && bi < all.length * 8) {
mod[y][x] = ((all[bi >>> 3] >>> (7 - (bi & 7))) & 1) !== 0;
bi++;
}
}
}
}
function applyMask(m) {
for (var yy = 0; yy < size; yy++) {
for (var xx = 0; xx < size; xx++) {
if (!fn[yy][xx] && maskBit(m, xx, yy)) mod[yy][xx] = !mod[yy][xx];
}
}
}
function penalty() {
var p = 0, dark = 0, a, b2;
function line(get) {
var s = '', run = 0, res = 0, prev = null;
for (var t = 0; t < size; t++) {
var c = get(t);
s += c ? '1' : '0';
if (c === prev) { run++; if (run === 5) res += 3; else if (run > 5) res++; }
else { run = 1; prev = c; }
}
var str = '0000' + s + '0000', at = -1;
while ((at = str.indexOf('1011101', at + 1)) >= 0) {
if (str.slice(at - 4, at) === '0000' || str.slice(at + 7, at + 11) === '0000') res += 40;
}
return res;
}
for (a = 0; a < size; a++) {
p += line(function (t) { return mod[a][t]; });
p += line(function (t) { return mod[t][a]; });
}
for (a = 0; a < size; a++) {
for (b2 = 0; b2 < size; b2++) {
if (mod[a][b2]) dark++;
if (a < size - 1 && b2 < size - 1) {
var c0 = mod[a][b2];
if (c0 === mod[a][b2 + 1] && c0 === mod[a + 1][b2] && c0 === mod[a + 1][b2 + 1]) p += 3;
}
}
}
var total = size * size;
p += (Math.ceil(Math.abs(dark * 20 - total * 10) / total) - 1) * 10;
return p;
}
var best = 0, bestP = Infinity;
for (var m = 0; m < 8; m++) {
applyMask(m);
drawFormat(m);
var pen = penalty();
if (pen < bestP) { best = m; bestP = pen; }
applyMask(m);
}
applyMask(best);
drawFormat(best);
return { size: size, mod: mod, version: ver, ecl: e, mask: best };
}
function rgbOf(s) {
s = String(s || '').trim();
var m = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(s);
if (m) {
var h = m[1].length === 3 ? m[1].replace(/./g, '$&$&') : m[1];
return [0, 2, 4].map(function (i) { return parseInt(h.substr(i, 2), 16); });
}
m = /rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)/i.exec(s);
return m ? [+m[1], +m[2], +m[3]] : [84, 134, 216];
}
function mix(a, b, t) { return a.map(function (x, i) { return Math.round(x * t + b[i] * (1 - t)); }); }
function lum(c) {
var v = c.map(function (x) { x /= 255; return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4); });
return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2];
}
function hex(c) { return '#' + c.map(function (x) { return ('0' + x.toString(16)).slice(-2); }).join(''); }
function colors() {
var acc = rgbOf(getComputedStyle(document.documentElement).getPropertyValue('--accent'));
var t, ink, eye;
for (t = 0.32; t > 0; t -= 0.04) { ink = mix(acc, [11, 13, 18], t); if (1.05 / (lum(ink) + 0.05) >= 12) break; }
for (t = 0.8; t > 0; t -= 0.05) { eye = mix(acc, [0, 0, 0], t); if (1.05 / (lum(eye) + 0.05) >= 5.5) break; }
return { ink: hex(ink), eye: hex(eye) };
}
var QUIET = 2;
function inEye(x, y, n) { return (x < 7 && y < 7) || (x >= n - 7 && y < 7) || (x < 7 && y >= n - 7); }
function eyes(n) { return [[0, 0], [n - 7, 0], [0, n - 7]]; }
function svg(qr, col, label) {
var n = qr.size, N = n + QUIET * 2, out = [];
for (var y = 0; y < n; y++) {
for (var x = 0; x < n; x++) {
if (qr.mod[y][x] && !inEye(x, y, n)) {
out.push('<rect x="' + (x + QUIET) + '" y="' + (y + QUIET) + '" width="1" height="1" rx=".3"/>');
}
}
}
var eyeSvg = eyes(n).map(function (p) {
var x0 = p[0] + QUIET, y0 = p[1] + QUIET;
return '<rect x="' + x0 + '" y="' + y0 + '" width="7" height="7" rx="2.1" fill="' + col.eye + '"/>' +
'<rect x="' + (x0 + 1) + '" y="' + (y0 + 1) + '" width="5" height="5" rx="1.4" fill="#fff"/>' +
'<rect x="' + (x0 + 2) + '" y="' + (y0 + 2) + '" width="3" height="3" rx=".9" fill="' + col.eye + '"/>';
}).join('');
return '<svg viewBox="0 0 ' + N + ' ' + N + '" role="img" aria-label="' + esc(label) + '">' +
'<g fill="' + col.ink + '">' + out.join('') + '</g>' + eyeSvg + '</svg>';
}
function rr(ctx, x, y, w, h, r) {
ctx.beginPath();
if (ctx.roundRect) ctx.roundRect(x, y, w, h, r); else ctx.rect(x, y, w, h);
ctx.fill();
}
function png(qr, col, caption, done) {
var n = qr.size, q = 4, s = Math.max(8, Math.floor(1000 / (n + q * 2)));
var W = (n + q * 2) * s, H = W + Math.round(s * 3.2);
var cv = document.createElement('canvas');
cv.width = W; cv.height = H;
var ctx = cv.getContext('2d');
ctx.fillStyle = '#fff';
ctx.fillRect(0, 0, W, H);
ctx.fillStyle = col.ink;
for (var y = 0; y < n; y++) {
for (var x = 0; x < n; x++) {
if (qr.mod[y][x] && !inEye(x, y, n)) rr(ctx, (x + q) * s, (y + q) * s, s, s, s * 0.3);
}
}
eyes(n).forEach(function (p) {
var x0 = (p[0] + q) * s, y0 = (p[1] + q) * s;
ctx.fillStyle = col.eye; rr(ctx, x0, y0, 7 * s, 7 * s, 2.1 * s);
ctx.fillStyle = '#fff'; rr(ctx, x0 + s, y0 + s, 5 * s, 5 * s, 1.4 * s);
ctx.fillStyle = col.eye; rr(ctx, x0 + 2 * s, y0 + 2 * s, 3 * s, 3 * s, 0.9 * s);
});
ctx.fillStyle = col.ink;
ctx.font = '700 ' + Math.round(s * 1.7) + 'px Onest, "Segoe UI", Roboto, Arial, sans-serif';
ctx.textAlign = 'center';
ctx.textBaseline = 'middle';
ctx.fillText(caption, W / 2, W - s * 1.2);
cv.toBlob(done, 'image/png');
}
var EN = window.SITE_LANG === 'en';
var UI = EN
? { title: 'QR code of the site', hint: 'Point your phone camera at it', close: 'Close',
save: 'Download', share: 'Share', copy: 'Copy link', copied: 'Copied', saved: 'Saved', code: 'QR code: ' }
: { title: 'QR-код сайта', hint: 'Наведите камеру телефона', close: 'Закрыть',
save: 'Скачать', share: 'Поделиться', copy: 'Скопировать', copied: 'Скопировано', saved: 'Сохранено', code: 'QR-код: ' };
function esc(s) {
return String(s == null ? '' : s)
.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
var ICON = {
close: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>',
save: '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v11M7 10.5l5 5 5-5M5 19.5h14"/></svg>',
share: '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 15V4M7.5 8.5 12 4l4.5 4.5M6 12.5v5A2.5 2.5 0 0 0 8.5 20h7a2.5 2.5 0 0 0 2.5-2.5v-5"/></svg>',
copy: '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="8.5" y="8.5" width="11" height="11" rx="2.5"/><path d="M15.5 8.5V6.5A2 2 0 0 0 13.5 4.5h-7a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h2"/></svg>'
};
function target() {
var base = String(((window.SITE_CONFIG || {}).meta || {}).url || '').trim().replace(/\/+$/, '');
if (!/^https?:\/\//.test(base)) base = location.origin;
var url = base + (EN ? '/en/' : '/');
return { url: url, label: url.replace(/^https?:\/\//, '').replace(/\/$/, '') };
}
var dlg, current;
var canShare = !!navigator.share;
function flash(btn, text) {
var lab = btn.querySelector('span');
var was = lab.textContent;
lab.textContent = text;
btn.classList.add('is-done');
setTimeout(function () { lab.textContent = was; btn.classList.remove('is-done'); }, 1600);
}
function build() {
dlg = document.createElement('dialog');
dlg.className = 'qr';
dlg.setAttribute('aria-labelledby', 'qr-title');
dlg.innerHTML =
'<div class="qr__card">' +
'<button class="qr__close" type="button" data-qr="close" aria-label="' + UI.close + '">' + ICON.close + '</button>' +
'<p class="qr__cap" id="qr-title">' + UI.title + '</p>' +
'<div class="qr__code"></div>' +
'<p class="qr__url"></p>' +
'<p class="qr__hint">' + UI.hint + '</p>' +
'<div class="qr__actions">' +
'<button class="qr__btn" type="button" data-qr="save">' + ICON.save + '<span>' + UI.save + '</span></button>' +
'<button class="qr__btn" type="button" data-qr="share">' + (canShare ? ICON.share : ICON.copy) +
'<span>' + (canShare ? UI.share : UI.copy) + '</span></button>' +
'</div>' +
'</div>';
document.body.appendChild(dlg);
dlg.addEventListener('click', function (e) {
if (e.target === dlg) { close(); return; }
var b = e.target.closest && e.target.closest('[data-qr]');
if (!b || !current) return;
var act = b.getAttribute('data-qr');
if (act === 'close') close();
else if (act === 'save') save(b);
else if (act === 'share') share(b);
});
document.addEventListener('keydown', function (e) {
if (e.key === 'Escape' && dlg.classList.contains('qr--flat') && dlg.hasAttribute('open')) close();
});
}
function save(btn) {
var name = current.label.replace(/[^a-z0-9.-]+/gi, '-') + '-qr.png';
png(current.qr, current.col, current.label, function (blob) {
if (!blob) return;
var a = document.createElement('a');
a.href = URL.createObjectURL(blob);
a.download = name;
document.body.appendChild(a);
a.click();
a.remove();
setTimeout(function () { URL.revokeObjectURL(a.href); }, 4000);
flash(btn, UI.saved);
});
}
function share(btn) {
if (canShare) {
navigator.share({ title: document.title, url: current.url }).catch(function () {});
return;
}
var done = function () { flash(btn, UI.copied); };
if (navigator.clipboard && navigator.clipboard.writeText) {
navigator.clipboard.writeText(current.url).then(done, function () {});
}
}
function open() {
if (!dlg) build();
var t = target(), qr = encode(t.url);
if (!qr) return;
var col = colors();
current = { url: t.url, label: t.label, qr: qr, col: col };
dlg.querySelector('.qr__code').innerHTML = svg(qr, col, UI.code + t.label);
dlg.querySelector('.qr__url').textContent = t.label;
if (typeof dlg.showModal === 'function') dlg.showModal();
else { dlg.classList.add('qr--flat'); dlg.setAttribute('open', ''); }
}
function close() {
if (typeof dlg.close === 'function' && !dlg.classList.contains('qr--flat')) dlg.close();
else dlg.removeAttribute('open');
}
window.SITE_QR = { open: open, encode: encode, _rs: { divisor: rsDivisor, remainder: rsRemainder } };
})();
