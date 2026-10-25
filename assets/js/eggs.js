/* =============================================================================
   Пасхалки. Ничего не меняют в содержимом страницы и не мешают поиску.

     1. RGB-режим — три быстрых нажатия на кнопку оформления (считает panel.js).
        Рамки плиток переливаются радугой, как подсветка в корпусе. Включённый
        режим запоминается в браузере гостя.
     2. Терминал — нажатие на мигающий жёлтый курсор в знаке EBK KVN.
        help показывает основные команды, а несколько секретных в список не
        входят — их ищут сами.
     3. Дождь из багетов — пять нажатий подряд на плашку с ником.
        Одинаково на компьютере и на телефоне.

   Кто в системе выключил анимацию, получает всё спокойно: без тряски и падения.
   ========================================================================== */
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
    term: 'Terminal', close: 'Close', input: 'Command',
    welcome: 'Baget terminal. Type <b>help</b> to see the commands.',
    secret: 'There are a couple of secret commands too — find them yourself 😉',
    unknown: 'command not found: ', hint: 'Type help.',
    help: [['help', 'this list'], ['about', 'who I am'], ['links', 'all my links'], ['vpn', 'the VPN bot'],
           ['portfolio', 'my work'], ['neofetch', 'about this site'], ['theme light|dark', 'switch the theme'],
           ['rgb', 'RGB mode on / off'], ['clear', 'clear the screen'], ['exit', 'close the terminal']],
    sudo: 'sudo: Kirill didn\'t give you the rights. Nice try though 🙂',
    rm: 'Nice try. The site is static — there is nothing to break 😄',
    brewing: 'Brewing coffee', tea: 'Tea? Only coffee is served here ☕ Type coffee.',
    coffee: ['Your hot coffee is ready ☕',
             'Kirill loves coffee too — drop by on {tg} for a chat ☕',
             'While your coffee cools down — check out my channel “{propc}” ☕',
             'A new PC goes great with coffee — have a look on {avito} ☕',
             'Your coffee is great — just like our {vpn} ☕',
             'Coffee\'s ready, and our {vpn} even more so ☕'],
    hello: 'Hi! 👋 Glad you found the terminal.',
    themeDone: 'Theme: ', themeUse: 'usage: theme light | theme dark',
    noPortfolio: 'The portfolio is not ready yet.', seconds: 's'
  } : {
    rgbOn: 'RGB-режим включён 🌈', rgbOff: 'RGB-режим выключен', rain: 'Багетопад 🥖',
    term: 'Терминал', close: 'Закрыть', input: 'Команда',
    welcome: 'Терминал Багета. Набери <b>help</b> — покажу команды.',
    secret: 'Есть и пара секретных команд — ищи сам 😉',
    unknown: 'команда не найдена: ', hint: 'Набери help.',
    help: [['help', 'эта подсказка'], ['about', 'кто я'], ['links', 'все мои ссылки'], ['vpn', 'VPN-бот'],
           ['portfolio', 'мои работы'], ['neofetch', 'о сайте'], ['theme light|dark', 'сменить тему'],
           ['rgb', 'RGB-режим вкл / выкл'], ['clear', 'очистить экран'], ['exit', 'закрыть терминал']],
    sudo: 'sudo: Кирилл не дал тебе прав. Но попытка засчитана 🙂',
    rm: 'Хорошая попытка. Сайт статический — ломать нечего 😄',
    brewing: 'Варю кофе', tea: 'Чай? Тут наливают только кофе ☕ Набери кофе.',
    coffee: ['Ваш горячий кофе готов ☕',
             'Кирилл тоже любит кофе — заходи в {tg}, поболтаем ☕',
             'Пока кофе остывает — загляни в канал «{propc}» ☕',
             'К кофе отлично подойдёт новый ПК — загляни на {avito} ☕',
             'Ваш отличный кофе — как и наш {vpn} ☕',
             'Кофе готов, а наш {vpn} — тем более ☕'],
    hello: 'Привет! 👋 Рад, что ты нашёл терминал.',
    themeDone: 'Тема: ', themeUse: 'как пользоваться: theme light | theme dark',
    noPortfolio: 'Портфолио пока не готово.', seconds: 'с'
  };

  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function read(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function store(k, v) {
    try { if (v == null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) {}
  }

  /* --- Подсказка вверху экрана -------------------------------------------- */
  var toastEl, toastTimer;
  function toast(text) {
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.className = 'egg-toast';
      toastEl.setAttribute('role', 'status');
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = text;
    // кадр на отрисовку, иначе появление без перехода
    requestAnimationFrame(function () { toastEl.classList.add('is-on'); });
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('is-on'); }, 2400);
  }

  /* --- 1. RGB-режим ------------------------------------------------------- */
  function setRgb(on, quiet) {
    root.classList.toggle('rgb', on);
    store('rgb', on ? '1' : null);
    if (!quiet) toast(on ? UI.rgbOn : UI.rgbOff);
  }
  function toggleRgb() { setRgb(!root.classList.contains('rgb')); }
  if (read('rgb') === '1') setRgb(true, true);   // включали раньше — так и оставляем

  /* --- 3. Дождь из багетов ------------------------------------------------ */
  function rain() {
    toast(UI.rain);
    if (calm) return;
    var box = document.createElement('div');
    box.className = 'rain';
    box.setAttribute('aria-hidden', 'true');
    for (var i = 0; i < 30; i++) {
      // Багет нарисован в стилях (.rain span): эмодзи на Windows — плоская
      // жёлтая палочка, а на телефонах другой рисунок. Свой — одинаков везде
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

  // Пять нажатий по плашке с ником, каждое не дольше секунды после прошлого
  var nickTaps = 0, nickLast = 0;
  document.addEventListener('click', function (e) {
    if (!e.target.closest || !e.target.closest('.nick')) return;
    var now = Date.now();
    nickTaps = now - nickLast < 1000 ? nickTaps + 1 : 1;
    nickLast = now;
    if (nickTaps >= 5) { nickTaps = 0; rain(); }
  });

  /* --- 2. Терминал --------------------------------------------------------- */
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
        '<button class="term__close" type="button" aria-label="' + esc(UI.close) + '">×</button>' +
      '</div>' +
      '<div class="term__out" aria-live="polite"></div>' +
      '<form class="term__line">' +
        '<label class="term__ps" for="term-in">baget@site:~$</label>' +
        '<input class="term__in" id="term-in" type="text" autocomplete="off" autocapitalize="off"' +
        ' autocorrect="off" spellcheck="false" enterkeyhint="send" aria-label="' + esc(UI.input) + '">' +
      '</form>';
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
      // Стрелки — прошлые команды, как в настоящем терминале
      if (e.key === 'ArrowUp' && hi > 0) { hi--; input.value = hist[hi]; e.preventDefault(); }
      if (e.key === 'ArrowDown') { hi = Math.min(hist.length, hi + 1); input.value = hist[hi] || ''; e.preventDefault(); }
    });
    term.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeTerminal(); });
    // Клик по экрану терминала — фокус в строку ввода
    out.addEventListener('click', function () { if (!getSelection().toString()) input.focus(); });

    drag(term.querySelector('.term__bar'));
    window.addEventListener('resize', place);
    if (window.visualViewport) {
      visualViewport.addEventListener('resize', place);
      visualViewport.addEventListener('scroll', place);
    }

    print(UI.welcome, 'is-dim');
  }

  /* Окно перетаскивается за верхнюю полосу — мышью и пальцем. Двойной
     щелчок по полосе возвращает его на место. Пока страница открыта, окно
     помнит, где его оставили; уйти за край экрана не даёт place().      */
  var pos = null;   // { x, y } — левый верхний угол; null — на своём месте внизу

  function place() {
    if (!term || term.hidden) return;
    var vv = window.visualViewport;
    var vw = vv ? vv.width : innerWidth, vh = vv ? vv.height : innerHeight;
    var ox = vv ? vv.offsetLeft : 0, oy = vv ? vv.offsetTop : 0;
    // Клавиатура на телефоне съедает пол-экрана — окно ужимается, строка ввода видна
    term.style.maxHeight = Math.max(160, vh - 16) + 'px';
    if (!pos) return;
    pos.x = Math.max(ox + 8, Math.min(pos.x, ox + vw - term.offsetWidth - 8));
    pos.y = Math.max(oy + 8, Math.min(pos.y, oy + vh - term.offsetHeight - 8));
    term.style.left = pos.x + 'px';
    term.style.top = pos.y + 'px';
    term.style.right = term.style.bottom = 'auto';
    term.style.margin = '0';
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
      place();
      e.preventDefault();
    });
    bar.addEventListener('pointermove', function (e) {
      if (e.pointerId !== id) return;
      pos.x = e.clientX - dx; pos.y = e.clientY - dy;
      place();
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
      pos = null;
      term.style.left = term.style.top = term.style.right = term.style.bottom = term.style.margin = '';
      place();
    });
  }

  function openTerminal() {
    if (!term) build();
    term.hidden = false;
    place();
    setTimeout(function () { input.focus(); }, 30);
  }
  function closeTerminal() { if (term) term.hidden = true; }

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

  // Русские слова — тоже команды
  var ALIAS = { 'помощь': 'help', 'обо мне': 'about', 'ссылки': 'links', 'портфолио': 'portfolio',
                'тема': 'theme', 'очистить': 'clear', 'выход': 'exit', 'quit': 'exit', 'cls': 'clear' };

  function run(raw) {
    var cmd = String(raw || '').trim();
    input.value = '';
    print('<span class="term__ps">baget@site:~$</span> ' + esc(cmd));
    if (!cmd) return;
    hist.push(cmd); hi = hist.length;

    var low = cmd.toLowerCase().replace(/\s+/g, ' ');
    var word = ALIAS[low] || ALIAS[low.split(' ')[0]] || low.split(' ')[0];
    var arg = low.split(' ').slice(1).join(' ');
    var h = C.hero || {};

    switch (word) {
      case 'help':
        print(UI.help.map(function (r) {
          return '<span class="is-acc">' + esc((r[0] + '                    ').slice(0, 19)) + '</span>' + esc(r[1]);
        }).join('\n'));
        print(UI.secret, 'is-dim');
        return;

      case 'about':
        print('<b>' + esc(T(h.name)) + '</b> · ' + esc(T(h.nick)) + '\n' + esc(String(T(h.bio))));
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

      /* --- Секретные: в help их нет ---------------------------------------- */
      case 'sudo':
        print(/rm\s+-rf/.test(low) ? UI.rm : UI.sudo, 'is-err');
        return;
      case 'rm':
        print(UI.rm, 'is-err');
        return;
      case 'багет': case 'baget': case 'baguette':
        print('🥖🥖🥖', 'is-acc');
        rain();
        return;
      case 'кофе': case 'coffee': case 'espresso': case 'эспрессо':
        brew();
        return;
      case 'чай': case 'tea':
        print(UI.tea, 'is-acc');
        return;
      case 'привет': case 'hello': case 'hi':
        print(UI.hello, 'is-ok');
        return;
    }
    print(esc(UI.unknown + cmd) + '. ' + UI.hint, 'is-err');
  }

  /* Кофе «варится»: бежит полоска готовности, потом чашка и одна из фраз.
     Фразы — в UI.coffee (выбрал Кирилл 24.10.2026). Метки в них заменяются
     ссылками из config.js: {tg} — Telegram-профиль, {propc} — канал
     «Про ПК», {avito} — Авито, {vpn} — VPN-бот из «Проектов». Ссылки нет —
     останется просто название. Про VPN — без обещаний и свойств сервиса. */
  var brewing = false, lastCup = -1;
  function brew() {
    if (brewing) return;
    brewing = true;
    var row = document.createElement('div');
    row.className = 'term__row is-acc';
    out.appendChild(row);
    var steps = 10, i = 0;
    (function tick() {
      var bar = '';
      for (var k = 0; k < steps; k++) bar += k < i ? '■' : '□';
      row.textContent = UI.brewing + ' [' + bar + '] ' + (i * 10) + '%';
      out.scrollTop = out.scrollHeight;
      if (i++ < steps) setTimeout(tick, calm ? 0 : 130);
      else serve();
    })();
  }
  function serve() {
    print([
      '     ) )',
      '    ( (',
      '  .______.',
      '  |      |]',
      '  \\      /',
      '   `----\''
    ].join('\n'), 'is-acc');
    // Случайная фраза, но не та же, что в прошлый раз
    var i;
    do { i = Math.floor(Math.random() * UI.coffee.length); } while (i === lastCup && UI.coffee.length > 1);
    lastCup = i;
    var links = (C.links || []).filter(function (l) { return T(l.url); });
    function find(test) { return links.filter(test)[0]; }
    function ref(l, fallback) { return l ? link(T(l.url), T(l.label) || fallback) : esc(fallback); }
    var refs = {
      tg: ref(find(function (l) { return l.icon === 'telegram' && l.featured; }) ||
              find(function (l) { return l.icon === 'telegram'; }), 'Telegram'),
      // канал ищем по русскому названию: на английской версии он «About PCs»
      propc: ref(find(function (l) { return (l.label && (l.label.ru || l.label)) === 'Про ПК'; }), 'Про ПК'),
      // во фразе по-русски — «Авито», хотя на плитке латиницей
      avito: (function (l) { return l ? link(T(l.url), EN ? 'Avito' : 'Авито') : esc(EN ? 'Avito' : 'Авито'); })(
               find(function (l) { return l.icon === 'avito'; })),
      // первый проект — VPN-бот; ссылкой становится само слово «VPN»
      vpn: (function (p) { return p ? link(T(p.url), 'VPN') : 'VPN'; })(
             ((C.projects || {}).items || []).filter(function (p) { return p && T(p.url); })[0])
    };
    var text = esc(UI.coffee[i]).replace(/\{(tg|propc|avito|vpn)\}/g, function (m, k) { return refs[k]; });
    print(text, 'is-ok');
    brewing = false;
  }

  // «Характеристики» сайта, как у neofetch в Linux. Только то, что правда.
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

    // Узкий экран (телефон): картинка и характеристики рядом не помещаются —
    // характеристики идут под картинкой. Нужно ~64 знака в строку.
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

  // Нажатие на мигающий курсор в знаке EBK KVN — терминал, а не переход к боту
  document.addEventListener('click', function (e) {
    var cur = e.target.closest && e.target.closest('.ebk__cursor');
    if (!cur) return;
    e.preventDefault();
    e.stopPropagation();
    openTerminal();
  }, true);

  window.SITE_EGGS = { rgb: toggleRgb, rain: rain, terminal: openTerminal };
})();
