(function () {
'use strict';
var C = window.SITE_CONFIG || {};
var T = window.SITE_T || function (v) { return v && typeof v === 'object' ? (v.ru || '') : (v || ''); };
var EN = window.SITE_LANG === 'en';
var PRE = EN ? '/en' : '';
var root = document.documentElement;
var calm = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
var UI = EN ? {
rgbOn: 'RGB mode on 🌈', rgbOff: 'RGB mode off', rain: 'Baguette shower 🥖',
term: 'Terminal', close: 'Close', input: 'Command', smaller: 'Smaller text', larger: 'Larger text',
welcome: 'Baget terminal. Type <b>help</b> to see the commands.',
secret: 'There are a couple of secret commands too — find them yourself 😉',
unknown: 'command not found: ', hint: 'Type help.',
help: [['help', 'this list'], ['about', 'who I am'], ['links', 'all my links'], ['vpn', 'the VPN bot'],
['portfolio', 'my work'], ['games', 'mini games'], ['site', 'about this site: features, eggs'], ['neofetch', 'site specs'],
['theme light|dark', 'switch the theme'],
['rgb', 'RGB mode on / off'], ['clear', 'clear the screen'], ['exit', 'close the terminal']],
sudo: 'sudo: Kirill didn\'t give you the rights. Nice try though 🙂',
rm: 'Nice try. The site is static — there is nothing to break 😄',
brewing: 'Brewing coffee', bar: 'bar', pouring: 'Pouring tea', puffing: 'Lighting up the hookah',
hookahSay: ['The hookah is ready 💨',
'Kirill loves hookah too — drop by on {tg} for a chat 💨',
'While it smokes — check out my channel “{propc}” 💨',
'Nice rings! And a new PC is on {avito} 💨'], busy: 'Hold on — the previous cup is still on its way ☕',
layout: '(wrong keyboard layout — running “{cmd}”)',
bilingual: 'Commands work in Russian too: помощь, ссылки, впн, кофе…',
teaSay: ['Your tea is ready 🍵',
'Kirill loves tea too — drop by on {tg} for a chat 🍵',
'While your tea cools down — check out my channel “{propc}” 🍵',
'A new PC goes great with tea — have a look on {avito} 🍵',
'Tea’s ready — and so is our {vpn} 🍵'],
coffee: ['Your hot coffee is ready ☕',
'Kirill loves coffee too — drop by on {tg} for a chat ☕',
'While your coffee cools down — check out my channel “{propc}” ☕',
'A new PC goes great with coffee — have a look on {avito} ☕',
'Your coffee is great — just like our {vpn} ☕',
'Coffee\'s ready, and our {vpn} even more so ☕'],
hello: 'Hi! 👋 Glad you found the terminal.',
themeDone: 'Theme: ', themeUse: 'usage: theme light | theme dark',
noPortfolio: 'The portfolio is not ready yet.', seconds: 's', siteLink: 'About this site',
games: [['Mini games — type a name:'], ['runner', 'Baguette Run: jump over bugs'],
['blocks', 'Build It: fill rows with PC parts'], ['cable', 'Cable: collect hardware, dodge the bugs']],
gamesNote: 'Records stay in this browser. Esc — quit a game.',
gameFail: 'Couldn’t load the game. Check your connection and try again.',
notOurs: 'Not here — but there are our own games. Type games.'
} : {
rgbOn: 'RGB-режим включён 🌈', rgbOff: 'RGB-режим выключен', rain: 'Багетопад 🥖',
term: 'Терминал', close: 'Закрыть', input: 'Команда', smaller: 'Текст мельче', larger: 'Текст крупнее',
welcome: 'Терминал Багета. Набери <b>help</b> — покажу команды.',
secret: 'Есть и пара секретных команд — ищи сам 😉',
unknown: 'команда не найдена: ', hint: 'Набери help.',
help: [['help', 'эта подсказка'], ['about', 'кто я'], ['links', 'все мои ссылки'], ['vpn', 'VPN-бот'],
['portfolio', 'мои работы'], ['игры', 'мини-игры'], ['site', 'о сайте: фишки, пасхалки'], ['neofetch', 'характеристики сайта'],
['theme light|dark', 'сменить тему'],
['rgb', 'RGB-режим вкл / выкл'], ['clear', 'очистить экран'], ['exit', 'закрыть терминал']],
sudo: 'sudo: Кирилл не дал тебе прав. Но попытка засчитана 🙂',
rm: 'Хорошая попытка. Сайт статический — ломать нечего 😄',
brewing: 'Варю кофе', bar: 'бар', pouring: 'Наливаю чай', puffing: 'Раскуриваю кальян',
hookahSay: ['Кальян раскурен 💨',
'Кирилл тоже любит кальян — заходи в {tg}, поболтаем 💨',
'Пока дымится — загляни в канал «{propc}» 💨',
'Колечки удались! А новый ПК — на {avito} 💨'], busy: 'Погоди — прошлая чашка ещё готовится ☕',
layout: '(не та раскладка — выполняю «{cmd}»)',
bilingual: 'Команды можно писать и по-русски: помощь, ссылки, впн, портфолио, тема, выход.',
teaSay: ['Ваш чай заварен 🍵',
'Кирилл тоже любит чай — заходи в {tg}, поболтаем 🍵',
'Пока чай остывает — загляни в канал «{propc}» 🍵',
'К чаю отлично подойдёт новый ПК — загляни на {avito} 🍵',
'Чай готов, а наш {vpn} — тем более 🍵'],
coffee: ['Ваш горячий кофе готов ☕',
'Кирилл тоже любит кофе — заходи в {tg}, поболтаем ☕',
'Пока кофе остывает — загляни в канал «{propc}» ☕',
'К кофе отлично подойдёт новый ПК — загляни на {avito} ☕',
'Ваш отличный кофе — как и наш {vpn} ☕',
'Кофе готов, а наш {vpn} — тем более ☕'],
hello: 'Привет! 👋 Рад, что ты нашёл терминал.',
themeDone: 'Тема: ', themeUse: 'как пользоваться: theme light | theme dark',
noPortfolio: 'Портфолио пока не готово.', seconds: 'с', siteLink: 'О сайте',
games: [['Мини-игры — набери название:'], ['раннер', 'Багет-раннер: прыгай через баги'],
['сборка', 'Сборка: собирай ряды из деталей ПК'], ['кабель', 'Кабель: собирай железо, обходи баги']],
gamesNote: 'Рекорды хранятся в этом браузере. Esc — выйти из игры.',
gameFail: 'Не получилось загрузить игру. Проверь интернет и попробуй ещё раз.',
notOurs: 'Такого нет, зато есть свои игры. Набери игры.'
};
function esc(s) {
return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
.replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function read(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
function store(k, v) {
try { if (v == null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) {}
}
var toastEl, toastTimer;
function toast(text) {
if (!toastEl) {
toastEl = document.createElement('div');
toastEl.className = 'egg-toast';
toastEl.setAttribute('role', 'status');
document.body.appendChild(toastEl);
}
toastEl.textContent = text;
requestAnimationFrame(function () { toastEl.classList.add('is-on'); });
clearTimeout(toastTimer);
toastTimer = setTimeout(function () { toastEl.classList.remove('is-on'); }, 2400);
}
function setRgb(on, quiet) {
root.classList.toggle('rgb', on);
store('rgb', on ? '1' : null);
if (!quiet) toast(on ? UI.rgbOn : UI.rgbOff);
}
function toggleRgb() { setRgb(!root.classList.contains('rgb')); }
if (read('rgb') === '1') setRgb(true, true);
function rain() {
toast(UI.rain);
if (calm) return;
var box = document.createElement('div');
box.className = 'rain';
box.setAttribute('aria-hidden', 'true');
for (var i = 0; i < 30; i++) {
var b = document.createElement('span');
var w = 56 + Math.random() * 60;
b.style.left = (Math.random() * 100) + 'vw';
b.style.width = w + 'px';
b.style.height = (w / 3) + 'px';
b.style.animationDuration = (2.2 + Math.random() * 1.8) + 's';
b.style.animationDelay = (Math.random() * 1.4) + 's';
b.style.setProperty('--spin', ((Math.random() < .5 ? -1 : 1) * (180 + Math.random() * 360)) + 'deg');
box.appendChild(b);
}
document.body.appendChild(box);
setTimeout(function () { box.remove(); }, 5600);
}
var nickTaps = 0, nickLast = 0;
document.addEventListener('click', function (e) {
if (!e.target.closest || !e.target.closest('.nick')) return;
var now = Date.now();
nickTaps = now - nickLast < 1000 ? nickTaps + 1 : 1;
nickLast = now;
if (nickTaps >= 5) { nickTaps = 0; rain(); }
});
var term, out, input, hist = [], hi = 0, opened = Date.now();
function build() {
term = document.createElement('div');
term.className = 'term';
term.setAttribute('role', 'dialog');
term.setAttribute('aria-label', UI.term);
term.hidden = true;
term.innerHTML =
'<div class="term__bar">' +
'<span class="term__dots" aria-hidden="true"><i></i><i></i><i></i></span>' +
'<span class="term__title">baget@site: ~</span>' +
'<button class="term__btn" type="button" data-zoom="-1" aria-label="' + esc(UI.smaller) + '" title="' + esc(UI.smaller) + '">−</button>' +
'<button class="term__btn" type="button" data-zoom="1" aria-label="' + esc(UI.larger) + '" title="' + esc(UI.larger) + '">+</button>' +
'<button class="term__close" type="button" aria-label="' + esc(UI.close) + '">×</button>' +
'</div>' +
'<div class="term__out" aria-live="polite"></div>' +
'<form class="term__line">' +
'<label class="term__ps" for="term-in">baget@site:~$</label>' +
'<input class="term__in" id="term-in" type="text" autocomplete="off" autocapitalize="off"' +
' autocorrect="off" spellcheck="false" enterkeyhint="send" aria-label="' + esc(UI.input) + '">' +
'</form>' +
'<div class="term__grip" aria-hidden="true"></div>';
document.body.appendChild(term);
out = term.querySelector('.term__out');
input = term.querySelector('.term__in');
term.querySelector('.term__line').addEventListener('submit', function (e) {
e.preventDefault();
run(input.value);
});
term.querySelector('.term__close').addEventListener('click', closeTerminal);
input.addEventListener('keydown', function (e) {
if (e.key === 'Escape') { closeTerminal(); return; }
if (e.key === 'ArrowUp' && hi > 0) { hi--; input.value = hist[hi]; e.preventDefault(); }
if (e.key === 'ArrowDown') { hi = Math.min(hist.length, hi + 1); input.value = hist[hi] || ''; e.preventDefault(); }
});
term.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeTerminal(); });
out.addEventListener('click', function () { if (!getSelection().toString()) input.focus(); });
drag(term.querySelector('.term__bar'));
resize(term.querySelector('.term__grip'));
zoomable();
window.addEventListener('resize', settle);
if (window.visualViewport) {
visualViewport.addEventListener('resize', settle);
visualViewport.addEventListener('scroll', function () { place(); });
}
input.addEventListener('blur', settle);
input.addEventListener('focus', settle);
print(UI.welcome, 'is-dim');
}
var pos = null;
var want = null;
function zoomOf() {
var z = parseFloat(getComputedStyle(document.body).zoom);
return z > 0 ? z : 1;
}
function place(fix) {
if (!term || term.hidden) return;
var vv = window.visualViewport;
var vw = vv ? vv.width : innerWidth, vh = vv ? vv.height : innerHeight;
var ox = vv ? vv.offsetLeft : 0, oy = vv ? vv.offsetTop : 0;
var z = zoomOf();
var avail = Math.max(160, vh - 16) / z;
term.style.maxHeight = avail + 'px';
term.style.minHeight = Math.min(MIN_H, avail) + 'px';
if (want) {
var availW = Math.max(160, vw - 16) / z;
term.style.width = Math.min(want.w, availW) + 'px';
term.style.height = Math.min(want.h, avail) + 'px';
}
if (!pos) return;
var x = Math.max(ox + 8, Math.min(pos.x, ox + vw - term.offsetWidth * z - 8));
var y = Math.max(oy + 8, Math.min(pos.y, oy + vh - term.offsetHeight * z - 8));
if (fix) { pos.x = x; pos.y = y; }
term.style.left = x / z + 'px';
term.style.top = y / z + 'px';
term.style.right = term.style.bottom = 'auto';
term.style.margin = '0';
}
var placeT = [];
function settle() {
placeT.forEach(clearTimeout);
place();
placeT = [setTimeout(place, 150), setTimeout(place, 450)];
}
function drag(bar) {
var dx = 0, dy = 0, id = null;
bar.addEventListener('pointerdown', function (e) {
if (e.button !== 0 || e.target.closest('button')) return;
var r = term.getBoundingClientRect();
pos = { x: r.left, y: r.top };
dx = e.clientX - r.left; dy = e.clientY - r.top;
id = e.pointerId;
bar.setPointerCapture(id);
term.classList.add('is-drag');
place(true);
e.preventDefault();
});
bar.addEventListener('pointermove', function (e) {
if (e.pointerId !== id) return;
pos.x = e.clientX - dx; pos.y = e.clientY - dy;
place(true);
});
function stop(e) {
if (e.pointerId !== id) return;
id = null;
term.classList.remove('is-drag');
}
bar.addEventListener('pointerup', stop);
bar.addEventListener('pointercancel', stop);
bar.addEventListener('dblclick', function (e) {
if (e.target.closest('button')) return;
pos = null; want = null;
term.style.left = term.style.top = term.style.right = term.style.bottom = term.style.margin = '';
term.style.width = term.style.height = '';
setZoom(1);
place();
});
}
var zoom = 1;
function setZoom(z) {
zoom = Math.round(Math.max(.8, Math.min(1.6, z)) * 10) / 10;
term.style.setProperty('--tz', zoom);
out.scrollTop = out.scrollHeight;
}
function zoomable() {
term.querySelector('.term__bar').addEventListener('click', function (e) {
var b = e.target.closest && e.target.closest('[data-zoom]');
if (!b) return;
setZoom(zoom + .1 * +b.getAttribute('data-zoom'));
input.focus();
});
term.addEventListener('wheel', function (e) {
if (!e.ctrlKey && !e.metaKey) return;
e.preventDefault();
setZoom(zoom + (e.deltaY < 0 ? .1 : -.1));
}, { passive: false });
term.addEventListener('keydown', function (e) {
if (!e.ctrlKey && !e.metaKey) return;
var k = e.key;
if (k === '+' || k === '=') setZoom(zoom + .1);
else if (k === '-' || k === '_') setZoom(zoom - .1);
else if (k === '0') setZoom(1);
else return;
e.preventDefault();
});
Array.prototype.forEach.call(term.querySelectorAll('[data-zoom]'), function (b) {
b.addEventListener('dblclick', function (e) { e.stopPropagation(); });
});
}
var MIN_W = 420, MIN_H = 280;
function resize(grip) {
var id = null, sx = 0, sy = 0, sw = 0, sh = 0;
grip.addEventListener('pointerdown', function (e) {
if (e.button !== 0) return;
var r = term.getBoundingClientRect();
pos = { x: r.left, y: r.top };
sx = e.clientX; sy = e.clientY; sw = r.width; sh = r.height;
id = e.pointerId;
grip.setPointerCapture(id);
term.classList.add('is-resize');
place(true);
e.preventDefault();
});
grip.addEventListener('pointermove', function (e) {
if (e.pointerId !== id) return;
var vv = window.visualViewport;
var vw = vv ? vv.width : innerWidth, vh = vv ? vv.height : innerHeight;
var z = zoomOf(), maxW = vw - pos.x - 8, maxH = vh - pos.y - 8;
want = { w: Math.min(maxW, Math.max(Math.min(MIN_W * z, maxW), sw + e.clientX - sx)) / z,
h: Math.min(maxH, Math.max(Math.min(MIN_H * z, maxH), sh + e.clientY - sy)) / z };
term.style.width = want.w + 'px';
term.style.height = want.h + 'px';
});
function stop(e) {
if (e.pointerId !== id) return;
id = null;
term.classList.remove('is-resize');
}
grip.addEventListener('pointerup', stop);
grip.addEventListener('pointercancel', stop);
}
function openTerminal() {
if (!term) build();
term.hidden = false;
place();
setTimeout(function () { input.focus(); }, 30);
}
function closeTerminal() {
if (game) game.quit();
if (term) term.hidden = true;
}
var game = null, gamesLoad = null;
var touch = !!(window.matchMedia && matchMedia('(pointer: coarse)').matches);
function loadGames() {
if (window.SITE_GAMES) return Promise.resolve(window.SITE_GAMES);
if (gamesLoad) return gamesLoad;
var tag = document.querySelector('script[data-games]');
var src = (tag && tag.getAttribute('data-games')) || '/assets/js/games.js';
gamesLoad = new Promise(function (ok, fail) {
var s = document.createElement('script');
s.src = src;
s.onload = function () { if (window.SITE_GAMES) ok(window.SITE_GAMES); else { gamesLoad = null; fail(); } };
s.onerror = function () { gamesLoad = null; fail(); };
document.head.appendChild(s);
});
return gamesLoad;
}
function playGame(id) {
if (busy) { print(UI.busy, 'is-dim'); return; }
if (game) game.quit();
loadGames().then(function (G) {
game = G.start(id, {
term: term,
row: function () {
var r = document.createElement('div');
r.className = 'term__row';
out.appendChild(r);
return r;
},
done: function (line) {
game = null;
print(esc(line), 'is-ok');
if (!touch) input.focus();
}
});
if (touch) input.blur(); else input.focus();
}, function () { print(UI.gameFail, 'is-err'); });
}
function print(html, cls) {
var row = document.createElement('div');
row.className = 'term__row' + (cls ? ' ' + cls : '');
row.innerHTML = html;
out.appendChild(row);
out.scrollTop = out.scrollHeight;
}
function link(href, text) {
var ext = /^https?:/.test(href);
return '<a href="' + esc(href) + '"' + (ext ? ' target="_blank" rel="noopener"' : '') + '>' + esc(text) + '</a>';
}
var ALIAS = {
'помощь': 'help', 'справка': 'help', 'хелп': 'help', '?': 'help',
'обо мне': 'about', 'кто': 'about', 'whoami': 'about', 'о себе': 'about',
'ссылки': 'links', 'впн': 'vpn', 'портфолио': 'portfolio', 'работы': 'portfolio', 'works': 'portfolio',
'неофетч': 'neofetch', 'тема': 'theme', 'ргб': 'rgb',
'о сайте': 'site', 'сайт': 'site', 'пасхалки': 'site', 'eggs': 'site',
'игры': 'games', 'игра': 'games', 'game': 'games', 'играть': 'games', 'play': 'games',
'раннер': 'runner', 'багет-раннер': 'runner', 'бег': 'runner', 'run': 'runner',
'сборка': 'blocks', 'блоки': 'blocks', 'build': 'blocks',
'кабель': 'cable', 'змейка': 'cable', 'snake': 'cable',
'тетрис': 'notours', 'tetris': 'notours', 'динозаврик': 'notours', 'динозавр': 'notours', 'dino': 'notours',
'очистить': 'clear', 'очисти': 'clear', 'cls': 'clear',
'выход': 'exit', 'закрыть': 'exit', 'quit': 'exit',
'судо': 'sudo', 'багет': 'baget', 'baguette': 'baget',
'кофе': 'coffee', 'кофеёк': 'coffee', 'espresso': 'coffee', 'эспрессо': 'coffee',
'чай': 'tea', 'чаёк': 'tea', 'чаек': 'tea',
'кальян': 'hookah', 'кальянчик': 'hookah', 'калик': 'hookah', 'shisha': 'hookah', 'наргиле': 'hookah',
'привет': 'hello', 'hi': 'hello', 'хай': 'hello', 'здравствуй': 'hello'
};
var KNOWN = ['help', 'about', 'links', 'vpn', 'portfolio', 'site', 'games', 'runner', 'blocks', 'cable', 'notours',
'neofetch', 'theme', 'rgb', 'clear', 'exit',
'sudo', 'rm', 'baget', 'coffee', 'tea', 'hookah', 'hello'];
function resolve(low) {
var parts = low.split(' ');
var word = ALIAS[low] || ALIAS[parts[0]] || parts[0];
return KNOWN.indexOf(word) >= 0 ? { word: word, arg: ALIAS[low] ? '' : parts.slice(1).join(' ') } : null;
}
var KEYS_EN = 'qwertyuiop[]asdfghjkl;\'zxcvbnm,.`';
var KEYS_RU = 'йцукенгшщзхъфывапролджэячсмитьбюё';
function swapLayout(s) {
return s.replace(/./g, function (ch) {
var i = KEYS_EN.indexOf(ch);
if (i >= 0) return KEYS_RU[i];
i = KEYS_RU.indexOf(ch);
return i >= 0 ? KEYS_EN[i] : ch;
});
}
function run(raw) {
var cmd = String(raw || '').trim();
input.value = '';
print('<span class="term__ps">baget@site:~$</span> ' + esc(cmd));
if (!cmd) return;
hist.push(cmd); hi = hist.length;
var low = cmd.toLowerCase().replace(/\s+/g, ' ');
var r = resolve(low);
if (!r) {
var swapped = swapLayout(low);
r = resolve(swapped);
if (r) print(UI.layout.replace('{cmd}', esc(swapped)), 'is-dim');
}
if (!r) { print(esc(UI.unknown + cmd) + '. ' + UI.hint, 'is-err'); return; }
var word = r.word, arg = r.arg;
var h = C.hero || {};
switch (word) {
case 'help':
print(UI.help.map(function (r) {
return '<span class="is-acc">' + esc((r[0] + '                    ').slice(0, 19)) + '</span>' + esc(r[1]);
}).join('\n'));
print(UI.bilingual + '\n' + UI.secret, 'is-dim');
return;
case 'about':
var bd = String(h.born || '').split('-');
var facts = [T(h.city), bd.length === 3 ? (EN ? bd[1] + '/' + bd[2] + '/' + bd[0] : bd[2] + '.' + bd[1] + '.' + bd[0]) : '',
T(h.education), T(h.work)].filter(Boolean).join(' · ');
print('<b>' + esc(T(h.name)) + '</b> · ' + esc(T(h.nick)) + (facts ? '\n' + esc(facts) : '') + '\n' + esc(String(T(h.bio))));
return;
case 'links':
print((C.links || []).filter(function (l) { return T(l.url); }).map(function (l) {
var u = T(l.url), label = T(l.label);
if (/^mailto:/i.test(u)) return '✉  ' + link(u, u.replace(/^mailto:/i, ''));
return '↗  ' + link(u, label) + (T(l.handle) ? ' <span class="is-dim">— ' + esc(T(l.handle)) + '</span>' : '');
}).join('\n'));
return;
case 'vpn':
var pr = ((C.projects || {}).items || []).filter(function (p) { return p && T(p.url); });
print(pr.length ? pr.map(function (p) { return '↗  ' + link(T(p.url), T(p.title)) + ' <span class="is-dim">' + esc(T(p.handle)) + '</span>'; }).join('\n')
: '—', pr.length ? '' : 'is-dim');
return;
case 'portfolio':
var P = C.portfolio || {};
if (P.enabled === false || !((P.items || []).length || P.showEmpty === true)) { print(UI.noPortfolio, 'is-dim'); return; }
print('→  ' + link(PRE + '/portfolio/', T(P.title) || 'Портфолио'));
return;
case 'site':
print('→  ' + link(PRE + '/about-site/', UI.siteLink));
return;
case 'games':
print(UI.games.map(function (r, i) {
return i ? '<span class="is-acc">' + esc((r[0] + '          ').slice(0, 10)) + '</span>' + esc(r[1]) : esc(r[0]);
}).join('\n'));
print(UI.gamesNote, 'is-dim');
return;
case 'runner': case 'blocks': case 'cable':
playGame(word);
return;
case 'notours':
print(UI.notOurs, 'is-acc');
return;
case 'neofetch':
neofetch();
return;
case 'theme':
if (!window.SITE_THEME || !/^(light|dark|светлая|тёмная|темная)$/.test(arg)) { print(UI.themeUse, 'is-dim'); return; }
window.SITE_THEME.setLevel(/^(light|светлая)$/.test(arg) ? 3 : 1);
if (window.SITE_ON_THEME) window.SITE_ON_THEME();
document.dispatchEvent(new Event('site-theme'));
print(UI.themeDone + arg, 'is-ok');
return;
case 'rgb':
toggleRgb();
print(root.classList.contains('rgb') ? UI.rgbOn : UI.rgbOff, 'is-ok');
return;
case 'clear':
out.innerHTML = '';
return;
case 'exit':
closeTerminal();
return;
case 'sudo':
print(/rm\s+-rf/.test(low) ? UI.rm : UI.sudo, 'is-err');
return;
case 'rm':
print(UI.rm, 'is-err');
return;
case 'baget':
print('🥖🥖🥖', 'is-acc');
rain();
return;
case 'coffee':
if (busy) print(UI.busy, 'is-dim'); else coffee();
return;
case 'tea':
if (busy) print(UI.busy, 'is-dim'); else tea();
return;
case 'hookah':
if (busy) print(UI.busy, 'is-dim'); else hookah();
return;
case 'hello':
print(UI.hello, 'is-ok');
return;
}
}
var busy = false, seq = 0;
function clamp01(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
function seg(t, a, b) { return clamp01((t - a) / (b - a)); }
function ease(x) { return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }
function lerp(a, b, x) { return a + (b - a) * x; }
function scene(svg) {
var row = document.createElement('div');
row.className = 'term__row term__scene';
row.innerHTML = svg + '<div class="term__cap"></div>';
out.appendChild(row);
out.scrollTop = out.scrollHeight;
return row;
}
function animate(row, dur, frame, done) {
busy = true;
var t0 = null;
function step(now) {
if (t0 === null) t0 = now;
var t = calm ? dur : Math.min(dur, (now - t0) / 1000);
frame(t);
if (t < dur) { requestAnimationFrame(step); return; }
busy = false;
if (row.isConnected && done) done();
}
requestAnimationFrame(step);
}
function attr(el, o) { for (var k in o) el.setAttribute(k, o[k]); }
function pour(main, glint, d, from, to, t) {
main.setAttribute('d', d); glint.setAttribute('d', d);
main.setAttribute('stroke-dashoffset', String(to > 0 ? -100 * to : 100 * (1 - from)));
main.style.opacity = from > 0 && to < 1 ? 1 : 0;
glint.style.opacity = from >= 1 && to <= 0 ? .55 : 0;
glint.setAttribute('stroke-dashoffset', String(-t * 60));
}
function steam(paths, t, start, rise) {
paths.forEach(function (p, i) {
if (t < start) { p.style.opacity = 0; return; }
var ph = ((t - start) / 1.7 + i / 3) % 1;
p.setAttribute('transform', 'translate(0 ' + (-ph * rise).toFixed(1) + ')');
p.style.opacity = (Math.sin(Math.PI * ph) * .5 * seg(t, start, start + .4)).toFixed(2);
});
}
var STEAM_D = 'c-5 -7 5 -12 0 -19 c-5 -7 5 -12 0 -19';
var STEAM_S = 'c-4 -5 4 -8 0 -13 c-4 -5 4 -8 0 -13';
function tea() {
var u = 'egg' + (++seq);
var CUP = 'M152 112 C152 138 166 152 178 152 L192 152 C204 152 218 138 218 112';
var row = scene(
'<svg class="term__svg" viewBox="0 0 260 168" aria-hidden="true">' +
'<defs>' +
'<linearGradient id="' + u + 'p" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fdfbf6"/>' +
'<stop offset=".55" stop-color="#e4ddd0"/><stop offset="1" stop-color="#a99f8e"/></linearGradient>' +
'<linearGradient id="' + u + 't" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f0a531" stop-opacity=".92"/>' +
'<stop offset="1" stop-color="#a24c0c" stop-opacity=".95"/></linearGradient>' +
'<clipPath id="' + u + 'c"><path d="M154 112 C154 137 167 150 178 150 L192 150 C203 150 216 137 216 112 Z"/></clipPath>' +
'<clipPath id="' + u + 'b"><path d="M30 78 C30 52 50 44 66 44 C82 44 102 52 102 78 C102 100 86 108 66 108 C46 108 30 100 30 78 Z"/></clipPath>' +
'</defs>' +
'<ellipse cx="130" cy="160" rx="118" ry="4" fill="#000" opacity=".45"/>' +
'<ellipse cx="185" cy="155" rx="48" ry="7" fill="url(#' + u + 'p)"/>' +
'<ellipse cx="185" cy="153.5" rx="29" ry="3.6" fill="#cbc2b1"/>' +
'<g clip-path="url(#' + u + 'c)"><rect class="liq" x="148" y="152" width="76" height="0" fill="url(#' + u + 't)"/>' +
'<ellipse class="surf" cx="185" cy="152" rx="0" ry="3" fill="#f2b85e"/>' +
'<ellipse class="ripple" cx="171" cy="152" rx="3" ry="1.2" fill="none" stroke="#ffd896" stroke-width="1"/></g>' +
'<path d="' + CUP + ' Z" fill="rgba(255,255,255,.07)" stroke="rgba(255,255,255,.62)" stroke-width="1.6"/>' +
'<ellipse cx="185" cy="112" rx="33" ry="5" fill="rgba(255,255,255,.04)" stroke="rgba(255,255,255,.62)" stroke-width="1.4"/>' +
'<path d="M216 121 C233 120 233 141 209 142" fill="none" stroke="rgba(255,255,255,.62)" stroke-width="3.4" stroke-linecap="round"/>' +
'<path d="M160 119 C160 131 164 141 171 146" fill="none" stroke="rgba(255,255,255,.4)" stroke-width="2.4" stroke-linecap="round"/>' +
'<path class="st" fill="none" stroke="#d98a2a" stroke-width="3.2" stroke-linecap="round" pathLength="100" stroke-dasharray="100 100"/>' +
'<path class="gl" fill="none" stroke="#ffd896" stroke-width="1" stroke-linecap="round" pathLength="100" stroke-dasharray="6 14"/>' +
'<g class="pot">' +
'<path d="M33 62 C11 58 11 99 36 95" fill="none" stroke="#ddd5c6" stroke-width="6" stroke-linecap="round"/>' +
'<path d="M92 82 C112 84 118 70 126 56 C128 52 133 50 137 51 L135 58 C128 70 123 92 104 98 L90 100 Z" fill="url(#' + u + 'p)"/>' +
'<path d="M30 78 C30 52 50 44 66 44 C82 44 102 52 102 78 C102 100 86 108 66 108 C46 108 30 100 30 78 Z" fill="url(#' + u + 'p)"/>' +
'<rect x="26" y="70" width="80" height="6" fill="#ffb000" opacity=".9" clip-path="url(#' + u + 'b)"/>' +
'<path d="M40 62 C44 52 54 48 62 48" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".7"/>' +
'<path d="M46 46 C48 32 84 32 86 46 Z" fill="url(#' + u + 'p)"/>' +
'<ellipse cx="66" cy="46" rx="21" ry="3.6" fill="#d6cebf"/>' +
'<ellipse cx="66" cy="32.5" rx="5" ry="4" fill="#ffb000"/>' +
'</g>' +
'<g class="steam" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round">' +
'<path d="M176 104 ' + STEAM_D + '"/><path d="M186 102 ' + STEAM_D + '"/><path d="M196 104 ' + STEAM_D + '"/></g>' +
'</svg>');
var q = function (s) { return row.querySelector(s); };
var pot = q('.pot'), liq = q('.liq'), surf = q('.surf'), rip = q('.ripple'), st = q('.st'), gl = q('.gl'), cap = q('.term__cap');
var wisps = [].slice.call(row.querySelectorAll('.steam path'));
var PX = 100, PY = 106, TIP = [137, 54], REST = 49, FULL = 118, EMPTY = 151;
animate(row, 5.6, function (t) {
var lift = t < 2 ? ease(seg(t, 0, .9)) : 1 - ease(seg(t, 3.8, 4.7));
var tilt = t < 2 ? ease(seg(t, .5, 1.3)) : 1 - ease(seg(t, 3.4, 4.0));
var ty = lerp(REST, -6, lift), ang = 42 * tilt;
pot.setAttribute('transform', 'translate(0 ' + ty.toFixed(1) + ') rotate(' + ang.toFixed(1) + ' ' + PX + ' ' + PY + ')');
var lvl = ease(seg(t, 1.3, 3.4)), y = lerp(EMPTY, FULL, lvl);
var hw = 31 - 24 * Math.pow((y - 112) / 38, 2);
attr(liq, { y: y.toFixed(1), height: lvl > 0 ? (152 - y).toFixed(1) : 0 });
attr(surf, { cy: y.toFixed(1), rx: lvl > 0 ? hw.toFixed(1) : 0 });
var a = ang * Math.PI / 180, dx = TIP[0] - PX, dy = TIP[1] - PY;
var tx = PX + dx * Math.cos(a) - dy * Math.sin(a), tyy = PY + dx * Math.sin(a) + dy * Math.cos(a) + ty;
var ex = 172, ey = y;
pour(st, gl, 'M' + tx.toFixed(1) + ' ' + tyy.toFixed(1) + ' C' + (tx + 7).toFixed(1) + ' ' + (tyy + 2).toFixed(1) +
' ' + ex + ' ' + (tyy + 10).toFixed(1) + ' ' + ex + ' ' + ey.toFixed(1), seg(t, 1.15, 1.45), seg(t, 3.35, 3.7), t);
var pouring = t > 1.4 && t < 3.5, rp = (t * 2.2) % 1;
attr(rip, { cy: y.toFixed(1), rx: (3 + rp * 6).toFixed(1), ry: (1.2 + rp * 1.4).toFixed(1) });
rip.style.opacity = pouring ? (1 - rp) * .8 : 0;
steam(wisps, t, 3.6, 16);
cap.textContent = t < 3.7 ? UI.pouring + '...'.slice(0, 1 + Math.floor(t * 3) % 3) : '';
}, function () { say(UI.teaSay); });
}
function coffee() {
var u = 'egg' + (++seq);
var row = scene(
'<svg class="term__svg" viewBox="0 0 260 168" aria-hidden="true">' +
'<defs>' +
'<linearGradient id="' + u + 'm" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#8d867b"/>' +
'<stop offset=".35" stop-color="#ece8e1"/><stop offset=".7" stop-color="#bdb6aa"/><stop offset="1" stop-color="#7e776c"/></linearGradient>' +
'<linearGradient id="' + u + 'v" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ece8e1"/>' +
'<stop offset="1" stop-color="#9c9589"/></linearGradient>' +
'<linearGradient id="' + u + 'k" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5b2e14"/>' +
'<stop offset="1" stop-color="#2a1408"/></linearGradient>' +
'<linearGradient id="' + u + 'r" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e7bb82"/>' +
'<stop offset="1" stop-color="#b8743a"/></linearGradient>' +
'<clipPath id="' + u + 'c"><path d="M147.5 112 L184.5 112 L180 147 C179.6 148.4 178.6 149 177 149 L155 149 C153.4 149 152.4 148.4 152 147 Z"/></clipPath>' +
'</defs>' +
'<ellipse cx="130" cy="161" rx="118" ry="4" fill="#000" opacity=".45"/>' +
'<rect x="22" y="149" width="206" height="9" rx="3" fill="url(#' + u + 'v)"/>' +
'<path d="M128 151.5 H222 M128 154.5 H222" stroke="#6f685d" stroke-width="1"/>' +
'<rect x="22" y="12" width="88" height="138" rx="10" fill="url(#' + u + 'm)"/>' +
'<rect x="96" y="12" width="112" height="28" rx="8" fill="url(#' + u + 'v)"/>' +
'<text x="35" y="66" font-family="ui-monospace, Consolas, monospace" font-size="15" font-weight="700" letter-spacing="2" fill="#ffb000">BAGET</text>' +
'<circle class="lamp-glow" cx="38" cy="28" r="7" fill="#7fd18b" opacity="0"/>' +
'<circle class="lamp" cx="38" cy="28" r="3.4" fill="#3b3631"/>' +
'<circle cx="66" cy="104" r="15" fill="#d9d4cb"/><circle cx="66" cy="104" r="12" fill="#15120f"/>' +
'<path d="M57.5 112.5 A12 12 0 1 1 74.5 112.5" fill="none" stroke="#5c564d" stroke-width="1.4"/>' +
'<path d="M73.8 96.2 A11 11 0 0 1 76.9 105" fill="none" stroke="#ff8a7a" stroke-width="1.6"/>' +
'<line class="needle" x1="66" y1="104" x2="66" y2="95" stroke="#ffb000" stroke-width="1.8" stroke-linecap="round"/>' +
'<circle cx="66" cy="104" r="1.8" fill="#ffb000"/>' +
'<rect x="144" y="40" width="44" height="9" fill="#8f887c"/>' +
'<path d="M140 49 H192 V55 C192 60 187 63 181 63 H151 C145 63 140 60 140 55 Z" fill="#2f2a25"/>' +
'<rect x="190" y="52" width="52" height="8" rx="4" fill="#1d1a17"/>' +
'<path d="M154 63 h8 l-2 6 h-4 Z M170 63 h8 l-2 6 h-4 Z" fill="#4a433b"/>' +
'<g clip-path="url(#' + u + 'c)"><rect class="cof" x="146" y="150" width="40" height="0" fill="url(#' + u + 'k)"/>' +
'<rect class="crema" x="146" y="150" width="40" height="0" fill="url(#' + u + 'r)"/></g>' +
'<path d="M146 112 L186 112 L181.5 147.5 C181 150 179.5 151 177 151 L155 151 C152.5 151 151 150 150.5 147.5 Z" ' +
'fill="rgba(255,255,255,.07)" stroke="rgba(255,255,255,.62)" stroke-width="1.5"/>' +
'<path d="M185 119 C197 119 197 138 182 139" fill="none" stroke="rgba(255,255,255,.62)" stroke-width="3" stroke-linecap="round"/>' +
'<path d="M151.5 117 L154.5 143" stroke="rgba(255,255,255,.35)" stroke-width="2" stroke-linecap="round"/>' +
'<path class="s1" fill="none" stroke="#6a3416" stroke-width="2.4" stroke-linecap="round" pathLength="100" stroke-dasharray="100 100"/>' +
'<path class="g1" fill="none" stroke="#c98b4a" stroke-width=".9" stroke-linecap="round" pathLength="100" stroke-dasharray="5 12"/>' +
'<path class="s2" fill="none" stroke="#6a3416" stroke-width="2.4" stroke-linecap="round" pathLength="100" stroke-dasharray="100 100"/>' +
'<path class="g2" fill="none" stroke="#c98b4a" stroke-width=".9" stroke-linecap="round" pathLength="100" stroke-dasharray="5 12"/>' +
'<g class="steam" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round">' +
'<path d="M158 108 ' + STEAM_S + '"/><path d="M166 106 ' + STEAM_S + '"/><path d="M174 108 ' + STEAM_S + '"/></g>' +
'</svg>');
var q = function (s) { return row.querySelector(s); };
var cof = q('.cof'), crema = q('.crema'), needle = q('.needle'), lamp = q('.lamp'), glow = q('.lamp-glow'), cap = q('.term__cap');
var s1 = q('.s1'), g1 = q('.g1'), s2 = q('.s2'), g2 = q('.g2');
var wisps = [].slice.call(row.querySelectorAll('.steam path'));
var FULL = 117, EMPTY = 150;
animate(row, 6.2, function (t) {
var on = t > .15;
lamp.setAttribute('fill', on ? '#7fd18b' : '#3b3631');
glow.style.opacity = on ? (.25 + .1 * Math.sin(t * 6)).toFixed(2) : 0;
var bar = t < 2.5 ? ease(seg(t, .2, 1.0)) : 1 - ease(seg(t, 4.1, 4.8));
var na = (-130 + 165 * bar + (bar > .95 ? Math.sin(t * 40) * 1.5 : 0)) * Math.PI / 180;
attr(needle, { x2: (66 + 9 * Math.sin(na)).toFixed(1), y2: (104 - 9 * Math.cos(na)).toFixed(1) });
var lvl = seg(t, 1.2, 4.1), y = lerp(EMPTY, FULL, Math.sqrt(lvl)), cr = 6 * ease(seg(t, 1.8, 4.3));
attr(cof, { y: y.toFixed(1), height: lvl > 0 ? (151 - y).toFixed(1) : 0 });
attr(crema, { y: (y - .5).toFixed(1), height: Math.min(cr, 151 - y).toFixed(1) });
var from = seg(t, 1.0, 1.3), to = seg(t, 4.1, 4.5);
pour(s1, g1, 'M158 69 L158 ' + y.toFixed(1), from, to, t);
pour(s2, g2, 'M174 69 L174 ' + y.toFixed(1), from, to, t + .3);
steam(wisps, t, 4.5, 6);
cap.textContent = t < 4.6 ? UI.brewing + ' · ' + Math.round(9 * bar) + ' ' + UI.bar + ' · ' + Math.round(100 * lvl) + '%' : '';
}, function () { say(UI.coffee); });
}
function hookah() {
var u = 'egg' + (++seq);
var VASE = 'M88 118 C88 128 62 132 62 150 C62 162 72 168 84 168 L106 168 C118 168 128 162 128 150 C128 132 102 128 102 118 Z';
var bubbles = '', rings = '';
for (var i = 0; i < 6; i++) bubbles += '<circle class="bub" cx="95" cy="160" r="' + (1.4 + (i % 3) * .7) + '" fill="none" stroke="#dff3ff" stroke-width=".9"/>';
for (i = 0; i < 3; i++) rings += '<ellipse class="ring" cx="230" cy="88" rx="4" ry="2" fill="none" stroke="#fff" stroke-width="3.2"/>';
var row = scene(
'<svg class="term__svg" viewBox="0 -14 260 194" aria-hidden="true">' +
'<defs>' +
'<linearGradient id="' + u + 'm" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#8d867b"/>' +
'<stop offset=".4" stop-color="#f1ede6"/><stop offset="1" stop-color="#7e776c"/></linearGradient>' +
'<linearGradient id="' + u + 'c" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c8774a"/>' +
'<stop offset="1" stop-color="#7a3a1c"/></linearGradient>' +
'<radialGradient id="' + u + 'g"><stop offset="0" stop-color="#ff9a3c" stop-opacity=".9"/>' +
'<stop offset="1" stop-color="#ff5a1f" stop-opacity="0"/></radialGradient>' +
'<radialGradient id="' + u + 'f"><stop offset="0" stop-color="#fff" stop-opacity=".35"/>' +
'<stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>' +
'<clipPath id="' + u + 'v"><path d="' + VASE + '"/></clipPath>' +
'<filter id="' + u + 'b" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation=".9"/></filter>' +
'</defs>' +
'<ellipse cx="130" cy="172" rx="118" ry="4" fill="#000" opacity=".45"/>' +
'<path d="M106 100 C150 96 168 152 198 152 C220 152 228 138 226 120" fill="none" stroke="#2b241e" stroke-width="5.5" stroke-linecap="round"/>' +
'<path d="M106 99 C149 95 168 150 198 150 C218 150 225 138 224 121" fill="none" stroke="#5a4b3e" stroke-width="1.2" stroke-linecap="round" opacity=".8"/>' +
'<path d="M223.5 121 L229 90" stroke="url(#' + u + 'm)" stroke-width="5" stroke-linecap="round"/>' +
'<g clip-path="url(#' + u + 'v)">' +
'<rect x="60" y="142" width="70" height="30" fill="#3d8fb0" opacity=".42"/>' +
'<rect class="fog" x="60" y="112" width="70" height="31" fill="#d9d9d9" opacity="0"/>' +
'<line x1="95" y1="118" x2="95" y2="158" stroke="#b9b2a6" stroke-width="3" opacity=".7"/>' +
bubbles +
'</g>' +
'<path d="' + VASE + '" fill="rgba(255,255,255,.06)" stroke="rgba(255,255,255,.6)" stroke-width="1.5"/>' +
'<path d="M70 146 C70 156 75 162 82 165" fill="none" stroke="rgba(255,255,255,.35)" stroke-width="2.2" stroke-linecap="round"/>' +
'<ellipse cx="95" cy="142" rx="31" ry="2.2" fill="none" stroke="#9fd3e6" stroke-width=".8" opacity=".6"/>' +
'<rect x="91" y="48" width="8" height="72" fill="url(#' + u + 'm)"/>' +
'<rect x="88" y="112" width="14" height="7" rx="2" fill="url(#' + u + 'm)"/>' +
'<rect x="89" y="92" width="12" height="5" rx="2" fill="url(#' + u + 'm)"/>' +
'<rect x="99" y="96.5" width="9" height="7" rx="2" fill="url(#' + u + 'm)"/>' +
'<rect x="89.5" y="70" width="11" height="4" rx="2" fill="#ffb000"/>' +
'<ellipse cx="95" cy="52" rx="28" ry="4.5" fill="url(#' + u + 'm)"/>' +
'<path d="M80 30 L110 30 L104 47 L86 47 Z" fill="url(#' + u + 'c)"/>' +
'<ellipse cx="95" cy="30" rx="16" ry="2.6" fill="#d8d4cc"/>' +
'<ellipse class="glow" cx="95" cy="26" rx="20" ry="11" fill="url(#' + u + 'g)" opacity=".3"/>' +
'<rect x="83" y="23" width="9" height="6" rx="1.5" fill="#3a2a22"/><rect x="93" y="22" width="9" height="7" rx="1.5" fill="#3a2a22"/>' +
'<rect class="ember" x="84.5" y="24.5" width="6" height="3" rx="1" fill="#ff6a2a" opacity=".4"/>' +
'<rect class="ember" x="94.5" y="23.5" width="6" height="4" rx="1" fill="#ff7d32" opacity=".4"/>' +
'<g class="steam" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="1.8" stroke-linecap="round">' +
'<path d="M89 20 ' + STEAM_S + '"/><path d="M96 19 ' + STEAM_S + '"/><path d="M102 20 ' + STEAM_S + '"/></g>' +
'<circle class="cloud" cx="230" cy="86" r="6" fill="url(#' + u + 'f)" opacity="0"/>' +
'<g filter="url(#' + u + 'b)">' + rings + '</g>' +
'</svg>');
var q = function (s) { return row.querySelector(s); };
var all = function (s) { return [].slice.call(row.querySelectorAll(s)); };
var glow = q('.glow'), fog = q('.fog'), cloud = q('.cloud'), cap = q('.term__cap');
var embers = all('.ember'), bubs = all('.bub'), ringEls = all('.ring'), wisps = all('.steam path');
animate(row, 6.4, function (t) {
var draw = seg(t, .6, 1.0) * (1 - seg(t, 2.3, 2.7));
var flick = .08 * Math.sin(t * 23) + .05 * Math.sin(t * 37);
glow.style.opacity = (.3 + .65 * draw + flick * draw).toFixed(2);
embers.forEach(function (e) { e.style.opacity = (.4 + .6 * draw + flick).toFixed(2); });
bubs.forEach(function (b, i) {
var ph = (t * 1.6 + i / bubs.length) % 1;
b.setAttribute('cy', (158 - ph * 15).toFixed(1));
b.setAttribute('cx', (95 + Math.sin((ph + i) * 9) * 3 + (i % 2 ? 2 : -2)).toFixed(1));
b.style.opacity = draw > .2 ? (1 - ph).toFixed(2) : 0;
});
fog.style.opacity = (.55 * ease(seg(t, .9, 2.4)) * (1 - .8 * seg(t, 2.8, 5.8))).toFixed(2);
var ex = seg(t, 2.8, 5.6);
cloud.setAttribute('r', (6 + 26 * ex).toFixed(1));
cloud.setAttribute('cy', (86 - 30 * ex).toFixed(1));
cloud.setAttribute('cx', (230 - 14 * ex).toFixed(1));
cloud.style.opacity = (Math.sin(Math.PI * ex) * .9).toFixed(2);
ringEls.forEach(function (r, i) {
var p = seg(t, 3.0 + i * .45, 5.4 + i * .45);
var cx = 229 - 22 * p - i * 4 + Math.sin(p * 5 + i) * 3, cy = 86 - 64 * p;
r.setAttribute('cx', cx.toFixed(1));
r.setAttribute('cy', cy.toFixed(1));
r.setAttribute('transform', 'rotate(' + (-14 + Math.sin(p * 4 + i * 2) * 8).toFixed(1) + ' ' + cx.toFixed(1) + ' ' + cy.toFixed(1) + ')');
r.setAttribute('rx', (3 + 12 * p).toFixed(1));
r.setAttribute('ry', (1.6 + 5 * p).toFixed(1));
r.style.opacity = p > 0 && p < 1 ? (Math.sin(Math.PI * p) * .75).toFixed(2) : 0;
});
steam(wisps, t, 0, 10);
cap.textContent = t < 2.7 ? UI.puffing + '...'.slice(0, 1 + Math.floor(t * 3) % 3) : '';
}, function () { say(UI.hookahSay); });
}
var lastSay = {};
function say(list) {
var key = list === UI.coffee ? 'c' : list === UI.teaSay ? 't' : 'h', i;
do { i = Math.floor(Math.random() * list.length); } while (i === lastSay[key] && list.length > 1);
lastSay[key] = i;
var links = (C.links || []).filter(function (l) { return T(l.url); });
function find(test) { return links.filter(test)[0]; }
function ref(l, fallback) { return l ? link(T(l.url), T(l.label) || fallback) : esc(fallback); }
var refs = {
tg: ref(find(function (l) { return l.icon === 'telegram' && l.featured; }) ||
find(function (l) { return l.icon === 'telegram'; }), 'Telegram'),
propc: ref(find(function (l) { return (l.label && (l.label.ru || l.label)) === 'Про ПК'; }), 'Про ПК'),
avito: (function (l) { return l ? link(T(l.url), EN ? 'Avito' : 'Авито') : esc(EN ? 'Avito' : 'Авито'); })(
find(function (l) { return l.icon === 'avito'; })),
vpn: (function (p) { return p ? link(T(p.url), 'VPN') : 'VPN'; })(
((C.projects || {}).items || []).filter(function (p) { return p && T(p.url); })[0])
};
print(esc(list[i]).replace(/\{(tg|propc|avito|vpn)\}/g, function (m, k) { return refs[k]; }), 'is-ok');
}
function neofetch() {
var art = [
' ____    _    ____ _____ _____ ',
'| __ )  / \\  / ___| ____|_   _|',
'|  _ \\ / _ \\| |  _|  _|   | |  ',
'| |_) / ___ \\ |_| | |___  | |  ',
'|____/_/   \\_\\____|_____| |_|  '
];
var th = window.SITE_THEME, lv = th ? th.levels[th.state.level] : null, ac = th ? th.current() : null;
var links = (C.links || []).filter(function (l) { return T(l.url); }).length;
var info = [
['user', T((C.hero || {}).name) + ' (' + T((C.hero || {}).nick) + ')'],
['host', location.host || 'localhost'],
['shell', 'baget-sh 1.0'],
['theme', lv ? T(lv.name) : '—'],
['accent', ac ? T(ac.name) : '—'],
['lang', 'RU, EN'],
['links', String(links)],
['uptime', Math.round((Date.now() - opened) / 1000) + ' ' + UI.seconds]
];
function line(r) { return '<span class="is-acc">' + esc(r[0]) + '</span>: ' + esc(r[1]); }
var charW = 8.2, wide = out.clientWidth >= 64 * charW;
if (!wide) {
print('<span class="is-acc">' + esc(art.join('\n')) + '</span>');
print(info.map(line).join('\n'));
return;
}
var rows = [];
for (var i = 0; i < Math.max(art.length, info.length); i++) {
var left = '<span class="is-acc">' + esc(art[i] || '                               ') + '</span>';
rows.push(left + (info[i] ? '  ' + line(info[i]) : ''));
}
print(rows.join('\n'));
}
document.addEventListener('click', function (e) {
var cur = e.target.closest && e.target.closest('.ebk__cursor');
if (!cur) return;
e.preventDefault();
e.stopPropagation();
openTerminal();
}, true);
window.SITE_EGGS = { rgb: toggleRgb, rain: rain, terminal: openTerminal };
})();
