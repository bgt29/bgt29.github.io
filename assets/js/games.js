(function () {
'use strict';
var EN = window.SITE_LANG === 'en';
var PAL = {
bg: '#14110e', panel: '#191510', grid: '#1e1a15', line: '#3a332b',
fg: '#e8e2d6', dim: '#8f877a', acc: '#ffb000', ok: '#7fd18b', err: '#ff8a7a', blue: '#6aa9ff',
crust: '#c9822f', crustDark: '#9a5f1c', crumb: '#f2c98a'
};
var MONO = 'ui-monospace, "Cascadia Mono", Consolas, Menlo, monospace';
var L = EN ? {
start: 'Space or tap — start', again: 'Space or tap — play again', quit: 'Esc — quit',
over: 'Game over', score: 'Score', best: 'Best', newBest: 'New record!', exit: 'Quit the game',
next: 'NEXT', rows: 'ROWS', level: 'LEVEL', result: function (t, s, b) { return t + ': score ' + s + ', best ' + b; }
} : {
start: 'Пробел или касание — старт', again: 'Пробел или касание — ещё раз', quit: 'Esc — выйти',
over: 'Игра окончена', score: 'Счёт', best: 'Рекорд', newBest: 'Новый рекорд!', exit: 'Выйти из игры',
next: 'ДАЛЬШЕ', rows: 'РЯДЫ', level: 'УРОВЕНЬ', result: function (t, s, b) { return t + ': счёт ' + s + ', рекорд ' + b; }
};
function readBest(id) { try { return +localStorage.getItem('game-best-' + id) || 0; } catch (e) { return 0; } }
function saveBest(id, v) { try { localStorage.setItem('game-best-' + id, String(v)); } catch (e) {} }
function rnd(a, b) { return a + Math.random() * (b - a); }
function pad(n, w) { n = String(Math.floor(n)); while (n.length < w) n = '0' + n; return n; }
function rrect(c, x, y, w, h, r) {
c.beginPath();
c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r);
c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
}
var KEYS = { KeyA: 'ArrowLeft', KeyD: 'ArrowRight', KeyW: 'ArrowUp', KeyS: 'ArrowDown',
ArrowLeft: 'ArrowLeft', ArrowRight: 'ArrowRight', ArrowUp: 'ArrowUp', ArrowDown: 'ArrowDown',
Space: 'Space', Enter: 'Space', KeyX: 'ArrowUp' };
function run(api, g) {
var row = api.row();
row.className += ' term__game';
var btns = g.pad.map(function (b) {
return '<button type="button" class="game__btn" data-k="' + b[0] + '"' + (b[3] ? ' data-rep="1"' : '') +
' aria-label="' + b[2] + '">' + b[1] + '</button>';
}).join('');
row.innerHTML = '<div class="game"><canvas class="game__cv" role="img" aria-label="' + g.title + '"></canvas>' +
'<div class="game__pad">' + btns +
'<button type="button" class="game__btn game__btn--x" data-k="Escape" aria-label="' + L.exit + '">✕</button></div></div>';
var cv = row.querySelector('canvas'), c = cv.getContext('2d');
var out = row.parentNode;
function fit() {
var avail = row.clientWidth || 300;
var padH = row.querySelector('.game__pad').offsetHeight + 10;
var maxH = Math.max(140, (out.clientHeight || 400) - padH - 30);
var cssW = Math.min(avail, g.w * 1.5, maxH * g.w / g.h);
var s = cssW / g.w, dpr = window.devicePixelRatio || 1;
cv.style.width = cssW + 'px';
cv.style.height = g.h * s + 'px';
cv.width = Math.round(g.w * s * dpr);
cv.height = Math.round(g.h * s * dpr);
c.setTransform(s * dpr, 0, 0, s * dpr, 0, 0);
}
fit();
out.scrollTop = out.scrollHeight;
var state = 'ready', best = readBest(g.id), fresh = false, alive = true, raf = 0, last = 0;
g.reset();
function start() { g.reset(); state = 'play'; fresh = false; }
function over() {
state = 'over';
var s = g.score();
if (s > best) { best = s; fresh = true; saveBest(g.id, s); }
}
function centerText(lines) {
c.fillStyle = 'rgba(15,13,11,.78)';
c.fillRect(0, 0, g.w, g.h);
var rows = [];
lines.forEach(function (l) {
c.font = (l[2] || '500') + ' ' + (l[3] || 10) + 'px ' + MONO;
var words = String(l[0]).split(' '), cur = '';
words.forEach(function (w) {
var t = cur ? cur + ' ' + w : w;
if (cur && c.measureText(t).width > g.w - 16) { rows.push([cur, l]); cur = w; } else cur = t;
});
rows.push([cur, l]);
});
var hgt = rows.reduce(function (a, r) { return a + (r[1][3] || 10) + 7; }, 0);
var y = (g.h - hgt) / 2 + 10;
c.textAlign = 'center';
rows.forEach(function (r) {
var l = r[1];
c.font = (l[2] || '500') + ' ' + (l[3] || 10) + 'px ' + MONO;
c.fillStyle = l[1] || PAL.fg;
c.fillText(r[0], g.w / 2, y);
y += (l[3] || 10) + 7;
});
c.textAlign = 'left';
}
function frame(now) {
if (!alive) return;
var dt = Math.min(0.05, last ? (now - last) / 1000 : 0);
last = now;
if (state === 'play' && !document.hidden && g.update(dt) === 'over') over();
c.clearRect(0, 0, g.w, g.h);
g.draw(c, state);
if (state === 'ready') {
centerText([[g.title, PAL.acc, '700', 15], [g.help, PAL.dim, '500', 9], [L.start, PAL.fg], [L.quit, PAL.dim, '500', 9]]);
} else if (state === 'over') {
centerText([[L.over, PAL.err, '700', 14],
[L.score + ': ' + g.score() + ' · ' + L.best + ': ' + best, PAL.fg],
fresh ? [L.newBest, PAL.ok, '700'] : ['', PAL.dim],
[L.again, PAL.fg], [L.quit, PAL.dim, '500', 9]]);
}
raf = requestAnimationFrame(frame);
}
function key(k, down) {
if (k === 'Escape') { if (down) quit(); return; }
if (state !== 'play') {
if (down && (k === 'Space' || k === 'tap' || k === 'ArrowUp')) start();
return;
}
g.key(k, down);
}
function onKey(e) {
if (!alive || e.ctrlKey || e.metaKey || e.altKey) return;
var k = e.key === 'Escape' ? 'Escape' : KEYS[e.code];
e.preventDefault();
e.stopPropagation();
if (!k || (e.type === 'keydown' && e.repeat && (k === 'Space' || (k === 'ArrowUp' && g.id !== 'blocks')))) return;
key(k, e.type === 'keydown');
}
window.addEventListener('keydown', onKey, true);
window.addEventListener('keyup', onKey, true);
var repT = 0;
Array.prototype.forEach.call(row.querySelectorAll('[data-k]'), function (b) {
var k = b.getAttribute('data-k'), rep = b.hasAttribute('data-rep');
function up() { clearTimeout(repT); b.classList.remove('is-on'); if (k !== 'Escape') key(k, false); }
b.addEventListener('pointerdown', function (e) {
e.preventDefault();
b.classList.add('is-on');
key(k, true);
if (rep) {
clearTimeout(repT);
var again = function () { key(k, true); repT = setTimeout(again, 70); };
repT = setTimeout(again, 230);
}
});
b.addEventListener('pointerup', up);
b.addEventListener('pointercancel', up);
b.addEventListener('pointerleave', function () { if (b.classList.contains('is-on')) up(); });
});
var sx = 0, sy = 0, held = false;
cv.addEventListener('pointerdown', function (e) {
e.preventDefault();
sx = e.clientX; sy = e.clientY; held = true;
if (g.hold) key('tap', true);
});
cv.addEventListener('pointerup', function (e) {
if (!held) return;
held = false;
var dx = e.clientX - sx, dy = e.clientY - sy;
if (g.hold) { key('tap', false); return; }
if (Math.max(Math.abs(dx), Math.abs(dy)) < 14) { key('tap', true); key('tap', false); return; }
var dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'ArrowRight' : 'ArrowLeft') : (dy > 0 ? 'ArrowDown' : 'ArrowUp');
key(g.swipe ? g.swipe(dir) : dir, true);
key(g.swipe ? g.swipe(dir) : dir, false);
});
cv.addEventListener('pointercancel', function () { held = false; if (g.hold) key('tap', false); });
var onResize = function () { fit(); };
window.addEventListener('resize', onResize);
function quit() {
if (!alive) return;
alive = false;
cancelAnimationFrame(raf);
clearTimeout(repT);
window.removeEventListener('keydown', onKey, true);
window.removeEventListener('keyup', onKey, true);
window.removeEventListener('resize', onResize);
row.classList.add('is-done');
if (state === 'play' && g.score() > best) { best = g.score(); saveBest(g.id, best); }
api.done(L.result(g.title, g.score(), best));
}
raf = requestAnimationFrame(frame);
return { quit: quit };
}
function runner() {
var W = 360, H = 150, GY = 128, X = 40;
var p, obs, beans, speed, dist, t, gap, got, sky = [], dots = [];
for (var i = 0, x = 0; x < 640; i++) {
var bw = rnd(18, 42), bh = rnd(16, 58);
sky.push([x, bw, bh]);
for (var k = 0; k < 3; k++) if (Math.random() < .5) dots.push([x + rnd(4, bw - 4), GY - rnd(6, bh - 4)]);
x += bw + rnd(2, 10);
}
var stars = [];
for (i = 0; i < 26; i++) stars.push([rnd(0, 640), rnd(6, 60), rnd(.4, 1)]);
function reset() {
p = { y: 0, vy: 0, hold: false };
obs = []; beans = []; speed = 185; dist = 0; t = 0; gap = 140; got = 0;
}
function spawn() {
var kinds = ['bug', 'cable', 'cup'];
if (t > 14) kinds.push('cups');
if (t > 22) kinds.push('fly', 'fly');
var kind = kinds[Math.floor(Math.random() * kinds.length)];
var o = { kind: kind, x: W + 10, alt: 0 };
if (kind === 'bug') { o.w = 16; o.h = 11; }
else if (kind === 'cable') { o.w = 34; o.h = 7; }
else if (kind === 'cup') { o.w = 14; o.h = 19; }
else if (kind === 'cups') { o.w = 32; o.h = 19; }
else { o.w = 18; o.h = 10; o.alt = rnd(30, 40); }
obs.push(o);
if (Math.random() < .4) beans.push({ x: W + 10 + o.w + rnd(40, 80), alt: rnd(48, 74) });
gap = Math.max(speed * .62 + 50, rnd(180, 320) * (speed / 230));
}
function key(k, down) {
if (k === 'Space' || k === 'ArrowUp' || k === 'tap') {
if (down && p.y <= 0) { p.vy = 420; p.hold = true; }
if (!down) { p.hold = false; if (p.vy > 170) p.vy = 170; }
}
if (k === 'ArrowDown' && down && p.y > 0) p.vy = Math.min(p.vy, -420);
}
function update(dt) {
t += dt;
speed = Math.min(470, 185 + t * 7);
var dx = speed * dt;
dist += dx;
p.vy -= 1600 * (p.hold && p.vy > 0 ? .6 : 1) * dt;
p.y += p.vy * dt;
if (p.y <= 0) { p.y = 0; p.vy = 0; }
gap -= dx;
if (gap <= 0) spawn();
obs.forEach(function (o) { o.x -= dx; });
beans.forEach(function (b) { b.x -= dx; });
obs = obs.filter(function (o) { return o.x + o.w > -10; });
beans = beans.filter(function (b) { return b.x > -10 && !b.taken; });
var top = p.y + 15, bot = p.y;
for (var i = 0; i < obs.length; i++) {
var o = obs[i];
if (X + 27 > o.x + 2 && X + 3 < o.x + o.w - 2 && bot < o.alt + o.h - 2 && top > o.alt + 2) return 'over';
}
beans.forEach(function (b) {
if (Math.abs(b.x - (X + 15)) < 14 && Math.abs(b.alt - (p.y + 8)) < 13) { b.taken = true; got++; }
});
}
function bug(c, x, y, w, fly) {
c.fillStyle = fly ? PAL.blue : PAL.err;
c.beginPath(); c.ellipse(x + w / 2, y - 5, w / 2 - 2, 5, 0, 0, Math.PI * 2); c.fill();
c.fillStyle = PAL.bg; c.fillRect(x + w / 2 - .5, y - 9, 1, 8);
c.strokeStyle = fly ? PAL.blue : PAL.err; c.lineWidth = 1;
c.beginPath();
if (fly) {
var flap = Math.sin(t * 40) * 3;
c.moveTo(x + 4, y - 7); c.lineTo(x + 1, y - 12 - flap);
c.moveTo(x + w - 4, y - 7); c.lineTo(x + w - 1, y - 12 - flap);
} else {
for (var i = 0; i < 3; i++) {
c.moveTo(x + 4 + i * 4, y - 2); c.lineTo(x + 2 + i * 5, y + 1);
}
}
c.moveTo(x + w - 3, y - 8); c.lineTo(x + w + 1, y - 11);
c.moveTo(x + w - 5, y - 9); c.lineTo(x + w - 3, y - 13);
c.stroke();
}
function cup(c, x, y) {
c.fillStyle = PAL.fg; rrect(c, x, y - 17, 11, 17, 2); c.fill();
c.fillStyle = '#6e3c20'; c.fillRect(x + 1, y - 16, 9, 3);
c.strokeStyle = PAL.fg; c.lineWidth = 1.6;
c.beginPath(); c.arc(x + 11, y - 10, 3, -Math.PI / 2, Math.PI / 2); c.stroke();
c.strokeStyle = 'rgba(232,226,214,.35)'; c.lineWidth = 1;
c.beginPath(); c.moveTo(x + 4, y - 20); c.quadraticCurveTo(x + 2, y - 23, x + 5, y - 26); c.stroke();
}
function draw(c) {
c.fillStyle = PAL.bg; c.fillRect(0, 0, W, H);
stars.forEach(function (s) {
var sx2 = ((s[0] - dist * .05) % 640 + 640) % 640;
if (sx2 < W) { c.fillStyle = 'rgba(232,226,214,' + s[2] * .5 + ')'; c.fillRect(sx2, s[1], 1, 1); }
});
var off = dist * .22;
sky.forEach(function (b) {
var bx = ((b[0] - off) % 640 + 640) % 640;
if (bx < W + 40) { c.fillStyle = '#1d1915'; c.fillRect(bx, GY - b[2], b[1], b[2]); }
if (bx - 640 > -60) { c.fillStyle = '#1d1915'; c.fillRect(bx - 640, GY - b[2], b[1], b[2]); }
});
dots.forEach(function (d) {
var dx2 = ((d[0] - off) % 640 + 640) % 640;
if (dx2 < W) { c.fillStyle = 'rgba(255,176,0,.35)'; c.fillRect(dx2, d[1], 2, 2); }
});
c.fillStyle = PAL.line; c.fillRect(0, GY, W, 1);
c.fillStyle = '#2a251f';
for (var gx = -(dist % 23); gx < W; gx += 23) c.fillRect(gx, GY + 5 + (Math.floor((gx + dist) / 23) % 3) * 3, 6, 1);
obs.forEach(function (o) {
var y = GY - o.alt;
if (o.kind === 'bug') bug(c, o.x, y, o.w, false);
else if (o.kind === 'fly') bug(c, o.x, y, o.w, true);
else if (o.kind === 'cup') cup(c, o.x, y);
else if (o.kind === 'cups') { cup(c, o.x, y); cup(c, o.x + 17, y); }
else {
c.strokeStyle = '#2f2a25'; c.lineWidth = 5; c.lineCap = 'round';
c.beginPath(); c.moveTo(o.x + 4, y - 3); c.bezierCurveTo(o.x + 12, y - 9, o.x + 20, y + 2, o.x + 28, y - 3); c.stroke();
c.fillStyle = PAL.acc; c.fillRect(o.x + 27, y - 6, 7, 6);
c.fillStyle = PAL.fg; c.fillRect(o.x + 33, y - 5, 2, 1); c.fillRect(o.x + 33, y - 3, 2, 1);
c.lineCap = 'butt';
}
});
beans.forEach(function (b) {
var y = GY - b.alt;
c.fillStyle = '#7a4222'; c.beginPath(); c.ellipse(b.x, y, 4, 5.5, .5, 0, Math.PI * 2); c.fill();
c.strokeStyle = '#d9a066'; c.lineWidth = 1; c.beginPath(); c.moveTo(b.x - 1.5, y - 4); c.quadraticCurveTo(b.x + 1.5, y, b.x - 1, y + 4); c.stroke();
});
var by = GY - 6 - p.y, tilt = p.y > 0 ? -Math.max(-.25, Math.min(.25, p.vy / 1600)) : 0;
c.save();
c.translate(X + 15, by - 4.5); c.rotate(tilt);
c.fillStyle = PAL.crust; rrect(c, -15, -4.5, 30, 9, 4.5); c.fill();
c.fillStyle = PAL.crustDark; rrect(c, -15, 1.5, 30, 3, 1.5); c.fill();
c.strokeStyle = PAL.crumb; c.lineWidth = 1.4;
c.beginPath();
for (var j = 0; j < 4; j++) { c.moveTo(-10 + j * 6, -2.5); c.lineTo(-7 + j * 6, 1); }
c.stroke();
c.restore();
c.strokeStyle = PAL.crumb; c.lineWidth = 1.6; c.lineCap = 'round';
var ph = p.y > 0 ? 0 : Math.sin(dist / 7) * 3;
c.beginPath();
c.moveTo(X + 10, by); c.lineTo(X + 10 + ph, by + (p.y > 0 ? 3 : 6));
c.moveTo(X + 20, by); c.lineTo(X + 20 - ph, by + (p.y > 0 ? 3 : 6));
c.stroke(); c.lineCap = 'butt';
c.font = '600 10px ' + MONO; c.textAlign = 'right';
c.fillStyle = PAL.dim; c.fillText(L.best.toUpperCase() + ' ' + pad(readBest('runner'), 5), W - 70, 16);
c.fillStyle = PAL.acc; c.fillText(pad(score(), 5), W - 10, 16);
c.textAlign = 'left';
}
function score() { return Math.floor(dist / 8) + got * 25; }
return {
id: 'runner', w: W, h: H, hold: true,
title: EN ? 'Baguette Run' : 'Багет-раннер',
help: EN ? 'Jump: Space, ↑ or tap. Hold to jump higher.' : 'Прыжок — пробел, ↑ или касание. Подержи — выше.',
pad: [['Space', '⤒', EN ? 'Jump' : 'Прыжок']],
reset: reset, update: update, draw: draw, key: key, score: score
};
}
function blocks() {
var COLS = 9, ROWS = 16, S = 14, OX = 6, OY = 6, W = 240, H = 236;
var KINDS = [
{ id: 'cpu',  name: EN ? 'CPU' : 'Процессор',     color: '#ffb000', cells: [[0, 0]] },
{ id: 'ram',  name: EN ? 'RAM' : 'Память',        color: '#7fd18b', cells: [[0, 0], [1, 0], [2, 0]] },
{ id: 'psu',  name: EN ? 'PSU' : 'Блок питания',  color: '#ff8a7a', cells: [[0, 0], [0, 1], [1, 1]] },
{ id: 'fan',  name: EN ? 'Fan' : 'Кулер',         color: '#6aa9ff', cells: [[0, 0], [1, 0], [0, 1], [1, 1]] },
{ id: 'gpu',  name: EN ? 'GPU' : 'Видеокарта',    color: '#c08bff', cells: [[0, 0], [1, 0], [2, 0], [3, 0]] },
{ id: 'mb',   name: EN ? 'Board' : 'Плата',       color: '#4fd1c5', cells: [[0, 0], [1, 0], [2, 0], [1, 1]] },
{ id: 'case', name: EN ? 'Case' : 'Корпус',       color: '#e8e2d6', cells: [[0, 0], [2, 0], [0, 1], [1, 1], [2, 1]] }
];
var grid, cur, next, bag, acc, soft, lines, level, pts, clearing, traces = [];
for (var i = 0; i < 18; i++) traces.push([Math.random() < .5, Math.floor(rnd(0, i % 2 ? COLS : ROWS)), rnd(0, 1), rnd(.3, 1)]);
function take() {
if (!bag || !bag.length) {
bag = KINDS.slice();
for (var i = bag.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), x = bag[i]; bag[i] = bag[j]; bag[j] = x; }
}
return bag.pop();
}
function piece(kind) {
var cells = kind.cells.map(function (c) { return [c[0], c[1]]; });
var w = Math.max.apply(null, cells.map(function (c) { return c[0]; })) + 1;
return { kind: kind, cells: cells, x: Math.floor((COLS - w) / 2), y: 0 };
}
function fits(cells, x, y) {
return cells.every(function (c) {
var cx = x + c[0], cy = y + c[1];
return cx >= 0 && cx < COLS && cy < ROWS && (cy < 0 || !grid[cy][cx]);
});
}
function reset() {
grid = []; for (var r = 0; r < ROWS; r++) { grid.push([]); for (var c = 0; c < COLS; c++) grid[r].push(0); }
bag = null; next = take(); cur = piece(take()); acc = 0; soft = false; lines = 0; level = 1; pts = 0; clearing = null;
}
function rotate() {
var r = cur.cells.map(function (c) { return [-c[1], c[0]]; });
var mx = Math.min.apply(null, r.map(function (c) { return c[0]; })), my = Math.min.apply(null, r.map(function (c) { return c[1]; }));
r = r.map(function (c) { return [c[0] - mx, c[1] - my]; });
var kicks = [0, -1, 1, -2, 2];
for (var i = 0; i < kicks.length; i++) if (fits(r, cur.x + kicks[i], cur.y)) { cur.cells = r; cur.x += kicks[i]; return; }
}
function lock() {
var over = false;
cur.cells.forEach(function (c) {
var cy = cur.y + c[1];
if (cy < 0) over = true; else grid[cy][cur.x + c[0]] = cur.kind.color;
});
if (over) return 'over';
var full = [];
for (var r = 0; r < ROWS; r++) if (grid[r].every(Boolean)) full.push(r);
if (full.length) clearing = { rows: full, t: .2 };
cur = piece(next); next = take();
if (!fits(cur.cells, cur.x, cur.y)) return 'over';
}
function step() {
if (fits(cur.cells, cur.x, cur.y + 1)) { cur.y++; return; }
return lock();
}
function key(k, down) {
if (k === 'ArrowDown') { soft = down; return; }
if (!down || clearing) return;
if (k === 'ArrowLeft' && fits(cur.cells, cur.x - 1, cur.y)) cur.x--;
else if (k === 'ArrowRight' && fits(cur.cells, cur.x + 1, cur.y)) cur.x++;
else if (k === 'ArrowUp' || k === 'tap') rotate();
else if (k === 'Space') {
var n = 0;
while (fits(cur.cells, cur.x, cur.y + 1)) { cur.y++; n++; }
pts += n * 2;
return lock() === 'over' ? (cur.dead = true) : null;
}
}
function update(dt) {
if (cur.dead) return 'over';
if (clearing) {
clearing.t -= dt;
if (clearing.t <= 0) {
clearing.rows.forEach(function (r) { grid.splice(r, 1); var row = []; for (var c = 0; c < COLS; c++) row.push(0); grid.unshift(row); });
var n = clearing.rows.length;
lines += n;
pts += [0, 100, 300, 600, 1000][n] * level;
level = 1 + Math.floor(lines / 8);
clearing = null;
}
return;
}
acc += dt;
var every = soft ? .04 : Math.max(.09, .75 - (level - 1) * .065);
while (acc >= every) {
acc -= every;
if (soft) pts += 1;
if (step() === 'over') return 'over';
if (clearing) break;
}
}
function cell(c, x, y, color, ghost) {
if (ghost) {
c.strokeStyle = color; c.globalAlpha = .35; c.lineWidth = 1;
rrect(c, x + 1.5, y + 1.5, S - 3, S - 3, 3); c.stroke(); c.globalAlpha = 1; return;
}
c.fillStyle = color; rrect(c, x + 1, y + 1, S - 2, S - 2, 3); c.fill();
c.fillStyle = 'rgba(0,0,0,.22)'; rrect(c, x + 4, y + 4, S - 8, S - 8, 1.5); c.fill();
c.fillStyle = 'rgba(255,255,255,.28)'; c.fillRect(x + 3, y + 2, S - 7, 1);
}
function draw(c) {
c.fillStyle = PAL.bg; c.fillRect(0, 0, W, H);
c.fillStyle = PAL.panel; c.fillRect(OX, OY, COLS * S, ROWS * S);
c.strokeStyle = PAL.grid; c.lineWidth = 1;
traces.forEach(function (tr) {
c.beginPath();
if (tr[0]) { var y = OY + tr[1] * S + S / 2; c.moveTo(OX + tr[2] * 40, y); c.lineTo(OX + tr[2] * 40 + tr[3] * 70, y); }
else { var x = OX + (tr[1] % COLS) * S + S / 2; c.moveTo(x, OY + tr[2] * 120); c.lineTo(x, OY + tr[2] * 120 + tr[3] * 80); }
c.stroke();
});
c.strokeStyle = PAL.line; rrect(c, OX - .5, OY - .5, COLS * S + 1, ROWS * S + 1, 4); c.stroke();
for (var r = 0; r < ROWS; r++) for (var col = 0; col < COLS; col++) {
if (grid[r][col]) {
var flash = clearing && clearing.rows.indexOf(r) >= 0;
cell(c, OX + col * S, OY + r * S, flash ? (Math.floor(clearing.t * 30) % 2 ? '#fff' : PAL.acc) : grid[r][col]);
}
}
if (!clearing && !cur.dead) {
var gy = cur.y;
while (fits(cur.cells, cur.x, gy + 1)) gy++;
cur.cells.forEach(function (q) { if (gy + q[1] >= 0) cell(c, OX + (cur.x + q[0]) * S, OY + (gy + q[1]) * S, cur.kind.color, true); });
cur.cells.forEach(function (q) { if (cur.y + q[1] >= 0) cell(c, OX + (cur.x + q[0]) * S, OY + (cur.y + q[1]) * S, cur.kind.color); });
}
var px = OX + COLS * S + 12;
c.font = '600 8.5px ' + MONO; c.fillStyle = PAL.dim;
c.fillText(L.next, px, 16);
next.cells.forEach(function (q) { cell(c, px + q[0] * S, 22 + q[1] * S, next.kind ? next.kind.color : next.color); });
c.font = '500 9px ' + MONO; c.fillStyle = PAL.fg;
c.fillText(next.name, px, 62);
var info = [[L.score.toUpperCase(), pad(pts, 5), PAL.acc], [L.rows, String(lines), PAL.fg],
[L.level, String(level), PAL.fg], [L.best.toUpperCase(), pad(readBest('blocks'), 5), PAL.dim]];
info.forEach(function (it, i) {
c.font = '600 8.5px ' + MONO; c.fillStyle = PAL.dim; c.fillText(it[0], px, 92 + i * 34);
c.font = '700 13px ' + MONO; c.fillStyle = it[2]; c.fillText(it[1], px, 108 + i * 34);
});
}
return {
id: 'blocks', w: W, h: H,
title: EN ? 'Build It' : 'Сборка',
help: EN ? '← → move, ↑ rotate, ↓ faster, Space — drop' : '← → двигать, ↑ повернуть, ↓ быстрее, пробел — вниз',
pad: [['ArrowLeft', '◀', EN ? 'Left' : 'Влево', true], ['ArrowUp', '⟳', EN ? 'Rotate' : 'Повернуть'],
['ArrowRight', '▶', EN ? 'Right' : 'Вправо', true], ['ArrowDown', '▼', EN ? 'Faster' : 'Быстрее'],
['Space', '⤓', EN ? 'Drop' : 'Сбросить']],
swipe: function (dir) { return dir === 'ArrowDown' ? 'Space' : dir; },
reset: reset, update: update, draw: draw, key: key, score: function () { return pts; }
};
}
function cable() {
var COLS = 22, ROWS = 14, S = 14, W = COLS * S, H = ROWS * S;
var body, dir, queue, food, acc, eaten, dead, bugs;
var FOOD = [['ram', '#7fd18b'], ['cpu', '#ffb000'], ['ssd', '#6aa9ff']];
function busy(x, y) {
if (y <= 1 && x >= 9) return true;
return body.some(function (b) { return b[0] === x && b[1] === y; }) ||
bugs.some(function (b) { return b[0] === x && b[1] === y; }) || (food && food.x === x && food.y === y);
}
function place() {
var free = [];
for (var y = 0; y < ROWS; y++) for (var x = 0; x < COLS; x++) if (!busy(x, y)) free.push([x, y]);
var f = free[Math.floor(Math.random() * free.length)];
food = { x: f[0], y: f[1], kind: FOOD[eaten % FOOD.length] };
}
function addBug() {
var h = body[0], spots = [];
for (var y = 1; y < ROWS - 1; y++) for (var x = 1; x < COLS - 1; x++) {
if (busy(x, y)) continue;
if (bugs.some(function (b) { return Math.abs(b[0] - x) <= 1 && Math.abs(b[1] - y) <= 1; })) continue;
var ahead = false;
for (var k = 1; k <= 3; k++) {
if (Math.abs(x - (h[0] + dir[0] * k)) <= 1 && Math.abs(y - (h[1] + dir[1] * k)) <= 1) ahead = true;
}
if (!ahead && !(Math.abs(x - h[0]) <= 1 && Math.abs(y - h[1]) <= 1)) spots.push([x, y]);
}
if (spots.length) bugs.push(spots[Math.floor(Math.random() * spots.length)]);
}
function reset() {
body = [[8, 7], [7, 7], [6, 7], [5, 7]]; dir = [1, 0]; queue = []; acc = 0; eaten = 0; dead = false;
bugs = []; food = null;
for (var i = 0; i < 6; i++) addBug();
place();
}
var DIRS = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
function key(k, down) {
if (!down || !DIRS[k]) return;
var d = DIRS[k], lastD = queue.length ? queue[queue.length - 1] : dir;
if ((d[0] === -lastD[0] && d[1] === -lastD[1]) || (d[0] === lastD[0] && d[1] === lastD[1])) return;
if (queue.length < 2) queue.push(d);
}
function update(dt) {
acc += dt;
var every = Math.max(.1, .21 - eaten * .0025);
while (acc >= every) {
acc -= every;
if (queue.length) dir = queue.shift();
var h = [body[0][0] + dir[0], body[0][1] + dir[1]];
if (h[0] < 0 || h[1] < 0 || h[0] >= COLS || h[1] >= ROWS ||
bugs.some(function (b) { return b[0] === h[0] && b[1] === h[1]; }) ||
body.slice(0, -1).some(function (b) { return b[0] === h[0] && b[1] === h[1]; })) { dead = true; return 'over'; }
body.unshift(h);
if (h[0] === food.x && h[1] === food.y) {
eaten++;
if (eaten % 5 === 0 && bugs.length < 14) addBug();
place();
} else body.pop();
}
}
function item(c, f) {
var x = f.x * S, y = f.y * S, col = f.kind[1];
c.fillStyle = col;
if (f.kind[0] === 'ram') {
c.fillRect(x + 1, y + 4, S - 2, 6);
c.fillStyle = PAL.bg; c.fillRect(x + 6, y + 9, 1, 1);
c.fillStyle = '#2f5e36'; for (var i = 0; i < 4; i++) c.fillRect(x + 2 + i * 3, y + 5, 2, 3);
} else if (f.kind[0] === 'cpu') {
c.fillRect(x + 3, y + 3, 8, 8);
c.fillStyle = 'rgba(0,0,0,.3)'; c.fillRect(x + 5, y + 5, 4, 4);
c.fillStyle = col; for (var j = 0; j < 3; j++) { c.fillRect(x + 4 + j * 2.5, y + 1, 1, 2); c.fillRect(x + 4 + j * 2.5, y + 11, 1, 2); }
} else {
rrect(c, x + 2, y + 3, S - 4, 8, 2); c.fill();
c.fillStyle = PAL.bg; c.fillRect(x + 4, y + 6, 3, 2);
}
}
function draw(c) {
c.fillStyle = PAL.bg; c.fillRect(0, 0, W, H);
c.fillStyle = '#211c17';
for (var y = 1; y < ROWS; y++) for (var x = 1; x < COLS; x++) c.fillRect(x * S - .5, y * S - .5, 1, 1);
c.strokeStyle = PAL.line; c.lineWidth = 1; c.strokeRect(.5, .5, W - 1, H - 1);
item(c, food);
bugs.forEach(function (b) {
var x = b[0] * S, y = b[1] * S;
c.fillStyle = PAL.err;
c.beginPath(); c.ellipse(x + 7, y + 7.5, 4, 5, 0, 0, Math.PI * 2); c.fill();
c.fillStyle = PAL.bg; c.fillRect(x + 6.5, y + 3.5, 1, 8);
c.strokeStyle = PAL.err; c.lineWidth = 1; c.beginPath();
c.moveTo(x + 3, y + 5); c.lineTo(x + 1, y + 4); c.moveTo(x + 3, y + 9); c.lineTo(x + 1, y + 10);
c.moveTo(x + 11, y + 5); c.lineTo(x + 13, y + 4); c.moveTo(x + 11, y + 9); c.lineTo(x + 13, y + 10);
c.moveTo(x + 6, y + 3); c.lineTo(x + 5, y + 1); c.moveTo(x + 8, y + 3); c.lineTo(x + 9, y + 1);
c.stroke();
});
c.lineJoin = 'round'; c.lineCap = 'round';
c.beginPath();
body.forEach(function (b, i) { var px = b[0] * S + S / 2, py = b[1] * S + S / 2; if (i) c.lineTo(px, py); else c.moveTo(px, py); });
c.strokeStyle = '#3a3029'; c.lineWidth = 9; c.stroke();
c.strokeStyle = 'rgba(255,176,0,.75)'; c.lineWidth = 2; c.setLineDash([4, 3]); c.stroke(); c.setLineDash([]);
c.lineJoin = 'miter'; c.lineCap = 'butt';
var h = body[0], cx = h[0] * S + S / 2, cy = h[1] * S + S / 2;
c.save(); c.translate(cx, cy); c.rotate(Math.atan2(dir[1], dir[0]));
c.fillStyle = dead ? PAL.err : PAL.fg; rrect(c, -5, -5.5, 10, 11, 2.5); c.fill();
c.fillStyle = '#c9c2b5'; c.fillRect(5, -3.5, 4, 1.6); c.fillRect(5, 1.9, 4, 1.6);
c.restore();
c.font = '600 10px ' + MONO; c.textAlign = 'right';
c.fillStyle = PAL.dim; c.fillText(L.best.toUpperCase() + ' ' + pad(readBest('cable'), 4), W - 58, 13);
c.fillStyle = PAL.acc; c.fillText(pad(eaten * 10, 4), W - 8, 13);
c.textAlign = 'left';
}
return {
id: 'cable', w: W, h: H,
title: EN ? 'Cable' : 'Кабель',
help: EN ? 'Arrows or swipes. Collect hardware, dodge the bugs.' : 'Стрелки или свайпы. Собирай железо, обходи баги.',
pad: [['ArrowLeft', '◀', EN ? 'Left' : 'Влево'], ['ArrowUp', '▲', EN ? 'Up' : 'Вверх'],
['ArrowDown', '▼', EN ? 'Down' : 'Вниз'], ['ArrowRight', '▶', EN ? 'Right' : 'Вправо']],
reset: reset, update: update, draw: draw, key: key, score: function () { return eaten * 10; }
};
}
var MAKERS = { runner: runner, blocks: blocks, cable: cable };
window.SITE_GAMES = {
start: function (id, api) { return MAKERS[id] ? run(api, MAKERS[id]()) : null; }
};
})();
