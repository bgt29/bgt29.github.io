/* =============================================================================
   Движок страницы. Трогать не нужно — весь контент в config.js
   ========================================================================== */
(function () {
  'use strict';

  var C = window.SITE_CONFIG;

  /* Сборка вшивает содержимое страницы прямо в HTML и ставит метку data-static:
     поисковики и боты нейросетей скрипты не выполняют, им нужен готовый текст.
     Скрипт всё равно перерисовывает страницу из конфига — так правки видны и
     до сборки, — но учитывает, что содержимое уже на экране.               */
  var STATIC = !!document.querySelector('.page[data-static]');

  if (!C) {
    document.body.innerHTML = '<p style="padding:40px;font:16px sans-serif">' +
      'Не найден assets/js/config.js</p>';
    return;
  }

  /* Язык страницы и выбор текста из пары { ru, en } — см. assets/js/i18n.js */
  var LANG = window.SITE_LANG || 'ru';
  var T = window.SITE_T || function (v) { return v && typeof v === 'object' ? (v.ru || '') : (v || ''); };

  /* Какая это страница. Разметка у всех одна (index.html), сборка делает из
     неё копии и помечает их: <body data-page="portfolio">, у раздела ещё
     data-cat="pc", у работы — data-cat и data-work="имя".                  */
  var B = document.body;
  var PAGE = B.getAttribute('data-page') || 'home';
  if (!/^(portfolio|category|work)$/.test(PAGE)) PAGE = 'home';
  var CAT = B.getAttribute('data-cat') || '', WORK = B.getAttribute('data-work') || '';

  // Адрес этой страницы на нужном языке: английская — та же, только под /en/
  function pathFor(lang, page) {
    var p = '/';
    if (page === 'portfolio') p = '/portfolio/';
    else if (page === 'category') p = '/portfolio/' + CAT + '/';
    else if (page === 'work') p = '/portfolio/' + CAT + '/' + WORK + '/';
    return (lang === 'en' ? '/en' : '') + p;
  }

  // Надписи самого движка — их нет в конфиге
  var UI = {
    ru: { page: 'Личная страница', links: 'Мои ссылки', now: 'Сейчас',
          copy: 'Скопировать адрес', copied: 'Адрес скопирован', copyByHand: 'Скопируй адрес:',
          policy: 'Конфиденциальность и куки',
          bug: 'Нашли ошибку? Напишите мне', bugDraft: 'Нашёл ошибку на странице ',
          tabLinks: 'Ссылки', tabWorks: 'Портфолио', tabs: 'Разделы сайта',
          other: { code: 'EN', lang: 'en', title: 'English version' } },
    en: { page: 'Personal page', links: 'My links', now: 'Now',
          copy: 'Copy address', copied: 'Address copied', copyByHand: 'Copy the address:',
          policy: 'Privacy & cookies',
          bug: 'Found a bug? Let me know', bugDraft: 'Found a bug on the page ',
          tabLinks: 'Links', tabWorks: 'Portfolio', tabs: 'Site sections',
          other: { code: 'RU', lang: 'ru', title: 'Русская версия' } }
  }[LANG];

  // Портфолио есть, когда в нём хоть одна работа — или когда в конфиге
  // включён показ пустого (showEmpty), — иначе и вкладки нет
  var P = C.portfolio || {};
  var HAS_WORKS = P.enabled !== false && ((P.items || []).length > 0 || P.showEmpty === true);

  /* Пути к файлам из конфига — от корня сайта. Английская версия лежит
     в папке /en/, и путь «assets/…» оттуда вёл бы в /en/assets/ — мимо.  */
  function asset(p) {
    p = String(p || '');
    return !p || /^([a-z]+:|\/)/i.test(p) ? p : '/' + p;
  }

  /* --- Иконки ------------------------------------------------------------- */
  /* Логотипы соцсетей приходят из assets/js/icons.js (официальные контуры).
     Здесь остаются только служебные значки, которых там нет.               */
  var ICONS = window.SITE_ICONS || {};

  var ICONS_LINE = {
    link: '<path d="M10 13a5 5 0 0 0 7.5.5l3-3A5 5 0 0 0 13.4 3.4l-1.7 1.7"/><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7.1 7.1l1.7-1.7"/>',
    arrow: '<path d="M5 12h13M12.5 6l6 6-6 6"/>',
    copy: '<rect x="9" y="9" width="12" height="12" rx="2.5"/><path d="M5.5 15H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v.5"/>',
    check: '<path d="M4 12.5 9.5 18 20 7"/>',
    out: '<path d="M7 17 17 7"/><path d="M8.5 7H17v8.5"/>',
    browser: '<rect x="3" y="4.5" width="18" height="15" rx="3"/><path d="M3 9.5h18M6.5 7h.01M9 7h.01"/>',
    megaphone: '<path d="M4 10v4h3l6 4.5v-13L7 10H4z"/><path d="M16.5 9a4 4 0 0 1 0 6M19 6.5a7.5 7.5 0 0 1 0 11"/>',
    bug: '<rect x="8" y="6" width="8" height="14" rx="4"/><path d="M12 11v9M8 13H4.5M19.5 13H16M8 17.5 5 19.5M16 17.5l3 2M8 9.5 5 7.5M16 9.5l3-2M10 6.5 9 4M14 6.5 15 4"/>'
  };

  function icon(name, size, cls) {
    var attrs = (cls ? ' class="' + cls + '"' : '') +
      ' viewBox="0 0 24 24" width="' + size + '" height="' + size + '" aria-hidden="true"';

    // Логотип бренда — сплошная заливка. Обёртка <g> нужна для выравнивания ниже.
    if (ICONS[name]) {
      return '<svg' + attrs + ' fill="currentColor"><g>' + ICONS[name] + '</g></svg>';
    }

    // Служебный значок — контурный
    return '<svg' + attrs + ' fill="none" stroke="currentColor" stroke-width="1.8"' +
      ' stroke-linecap="round" stroke-linejoin="round">' +
      (ICONS_LINE[name] || ICONS_LINE.link) + '</svg>';
  }

  /* Логотипы нарисованы разными людьми и по-разному заполняют квадрат: один
     упирается в края, другой сидит с полями, третий шире, чем выше. Поэтому
     не подгоняем каждый руками, а меряем реальные границы рисунка и приводим
     все к одной площади с центром в центре плитки. Новый значок, добавленный
     позже, подхватится автоматически.                                        */
  function normalizeIcons() {
    var BOX = 24;
    var TARGET = 20 * 20;   // площадь рисунка в единицах viewBox
    var list = document.querySelectorAll('.link__icon svg > g');

    Array.prototype.forEach.call(list, function (g) {
      var b;
      try { b = g.getBBox(); } catch (e) { return; }
      if (!b || !b.width || !b.height) return;

      var k = Math.sqrt(TARGET / (b.width * b.height));
      k = Math.min(k, BOX / b.width, BOX / b.height);   // чтобы не вылезло за края

      var dx = BOX / 2 - (b.x + b.width / 2) * k;
      var dy = BOX / 2 - (b.y + b.height / 2) * k;
      g.setAttribute('transform',
        'translate(' + dx.toFixed(3) + ' ' + dy.toFixed(3) + ') scale(' + k.toFixed(4) + ')');
    });
  }

  /* --- Утилиты ------------------------------------------------------------ */
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
  /* Русская вёрстка: короткие предлоги и союзы («и», «в», «на»…) не остаются
     висеть в конце строки, а тире не начинает новую. Склеиваем их со
     следующим словом неразрывным пробелом. Работает для любого текста,
     который впишут в конфиг, — переносы руками расставлять не нужно.       */
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

  /* --- Мета и тема --------------------------------------------------------- */
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

    /* Адрес страницы и картинку превью вписывает только сборка: мессенджеры
       берут их по полному адресу, и у английской версии они свои.          */

    // Цвета здесь не трогаем: ими заведует theme.js. Раньше тут читался
    // meta.accent, и он перебивал выбор гостя в панели оформления.

    if (m.favicon) {
      var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">' +
        '<text y=".9em" font-size="88">' + m.favicon + '</text></svg>';
      var link = document.querySelector('link[rel="icon"]');
      if (link) link.href = 'data:image/svg+xml,' + encodeURIComponent(svg);
    }

    /* Палитрой заведует assets/js/theme.js — он подключён в <head> и успевает
       примениться до отрисовки. Здесь тему больше не трогаем.               */
  }

  /* --- Свечение под аватаром ------------------------------------------------
     Ореол подбирается по самому фото: считаем его средний цвет, подмешиваем
     акцент палитры и удерживаем итог в тёплом секторе. Так свечение
     перекликается со снимком, но не выбивается из оформления сайта.        */
  var avatarTone = null;   // средний цвет фото, считается один раз

  function averageColor(img) {
    var n = 24;
    var canvas = document.createElement('canvas');
    canvas.width = n; canvas.height = n;
    var ctx = canvas.getContext && canvas.getContext('2d');
    if (!ctx) return null;

    var data;
    try {
      ctx.drawImage(img, 0, 0, n, n);
      data = ctx.getImageData(0, 0, n, n).data;
    } catch (e) {
      return null;   // фото с чужого домена — читать пиксели браузер не даст
    }

    var r = 0, g = 0, b = 0, sum = 0;
    for (var i = 0; i < data.length; i += 4) {
      if (data[i + 3] < 128) continue;
      var mx = Math.max(data[i], data[i + 1], data[i + 2]);
      var mn = Math.min(data[i], data[i + 1], data[i + 2]);
      // цветные и светлые точки весят больше, иначе тёмный фон съест весь тон
      var w = (mx - mn) / 255 * 2 + mx / 255 + 0.15;
      r += data[i] * w; g += data[i + 1] * w; b += data[i + 2] * w; sum += w;
    }
    return sum ? [r / sum, g / sum, b / sum] : null;
  }

  function hexToRgb(s) {
    s = String(s).trim().replace('#', '');
    if (s.length === 3) s = s[0] + s[0] + s[1] + s[1] + s[2] + s[2];
    if (!/^[0-9a-f]{6}$/i.test(s)) return null;
    return [parseInt(s.slice(0, 2), 16), parseInt(s.slice(2, 4), 16), parseInt(s.slice(4, 6), 16)];
  }

  function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    var mx = Math.max(r, g, b), mn = Math.min(r, g, b);
    var l = (mx + mn) / 2, h = 0, s = 0;
    if (mx !== mn) {
      var d = mx - mn;
      s = l > .5 ? d / (2 - mx - mn) : d / (mx + mn);
      if (mx === r) h = (g - b) / d + (g < b ? 6 : 0);
      else if (mx === g) h = (b - r) / d + 2;
      else h = (r - g) / d + 4;
      h *= 60;
    }
    return [h, s, l];
  }

  /* Тёплый сектор: от красноватого до янтарного. Холодный тон подтягиваем
     к ближайшему краю, а не выкидываем — так остаётся связь с фото.       */
  function toWarm(h) {
    var lo = 8, hi = 55;
    if (h >= lo && h <= hi) return h;
    var dLo = Math.min(Math.abs(h - lo), 360 - Math.abs(h - lo));
    var dHi = Math.min(Math.abs(h - hi), 360 - Math.abs(h - hi));
    return dLo < dHi ? lo : hi;
  }

  function tuneAvatarGlow() {
    var root = document.documentElement;
    if (!avatarTone) { root.style.removeProperty('--avatar-glow'); return; }

    var accent = hexToRgb(getComputedStyle(root).getPropertyValue('--accent'));
    if (!accent) return;

    var mixed = [0, 1, 2].map(function (i) {
      return avatarTone[i] * 0.45 + accent[i] * 0.55;
    });

    var hsl = rgbToHsl(mixed[0], mixed[1], mixed[2]);
    var h = Math.round(toWarm(hsl[0]));
    var s = Math.round(Math.min(0.85, Math.max(0.45, hsl[1])) * 100);
    var l = Math.round((root.dataset.theme === 'dark' ? 0.6 : 0.56) * 100);

    root.style.setProperty('--avatar-glow', 'hsl(' + h + ', ' + s + '%, ' + l + '%)');
  }

  /* --- Шапка --------------------------------------------------------------- */
  function initials(name) {
    var parts = String(name || '').trim().split(/\s+/).slice(0, 2);
    return parts.map(function (p) { return p.charAt(0); }).join('').toUpperCase() || '·';
  }

  function renderHero() {
    var h = C.hero || {};
    var name = T(h.name);
    var photo = asset(h.avatar);

    // Если сборка уже вшила это же фото в страницу — не пересоздаём его,
    // иначе на долю секунды мелькнул бы пустой круг
    var ready = slot('avatar') && slot('avatar').querySelector('img');
    if (!(photo && ready && ready.getAttribute('src') === photo)) {
      fill('avatar', photo
        ? '<img src="' + esc(photo) + '" alt="' + esc(name) + '">'
        : esc(initials(name)));
    }

    // Файла может не быть или он битый — тогда вместо «сломанной картинки» буква
    var box = slot('avatar');
    var img = box && box.querySelector('img');
    if (img) {
      img.addEventListener('error', function () {
        box.textContent = initials(name);
        avatarTone = null;
        tuneAvatarGlow();
      });

      var onReady = function () {
        avatarTone = averageColor(img);
        tuneAvatarGlow();
      };
      if (img.complete && img.naturalWidth) onReady();
      else img.addEventListener('load', onReady);
    }
    fill('status', esc(T(h.status)));
    /* Имя и фамилия — всегда отдельными строками. Иначе короткое имя на одном
       языке влезало в строку, а на другом переносилось, и верх страницы у
       русской и английской версий выходил разной высоты. Пробел между
       строками остаётся — для поиска это по-прежнему «Кирилл Булдаков».  */
    fill('name', String(name).trim().split(/\s+/).map(function (w) {
      return '<span class="name__line">' + esc(w) + '</span>';
    }).join(' '));
    fill('nick', esc(T(h.nick)));
    fill('role', esc(T(h.role)));
    /* Описание. Строка с «·» — это занятия: они идут плашками. Остальные
       строки — текстом, каждая отдельным блоком: браузер выравнивает строки
       по длине только внутри блока, и на узком телефоне слово не повиснет. */
    fill('bio', String(T(h.bio)).split('\n').filter(function (s) { return s.trim(); })
      .map(function (s) {
        s = s.trim();
        if (/\s·\s/.test(s)) {
          return '<span class="bio__chips">' + s.split(/\s*·\s*/).filter(Boolean).map(function (c) {
            return '<span class="chip">' + esc(typo(c)) + '</span>';
          }).join('') + '</span>';
        }
        return '<span class="bio__line">' + esc(typo(s)) + '</span>';
      }).join(''));
  }

  /* --- Ссылки: плитки ---------------------------------------------------------
     Каждая ссылка — плитка со значком в фирменном цвете соцсети. Ссылка с
     featured: true — большая цветная плитка вверху, рядом с именем. Строка
     { group } — заголовок, после него начинается новая сетка плиток.       */
  var BRAND = {
    telegram: '#2aa3e0', instagram: 'linear-gradient(45deg, #f9a13a, #e1306c 55%, #833ab4)',
    vk: '#0077ff', itd: '#1d1d1d', avito: '#00aaff', github: '#24292f', gitlab: '#fc6d26',
    boosty: '#f15f2c', youtube: '#ff0033', x: '#111111', threads: '#111111', discord: '#5865f2',
    tiktok: '#111111', twitch: '#9146ff', whatsapp: '#25d366', spotify: '#1db954',
    linkedin: '#0a66c2', behance: '#1769ff', dribbble: '#ea4c89', habr: '#65a3be'
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
        // Адрес почты на телефоне не влезает в строку — переносится после @,
        // а не обрезается: его ведь и пришли посмотреть
        (handle ? '<span class="link__handle">' +
          (mail ? esc(handle).replace('@', '@<wbr>') : esc(handle)) + '</span>' : '') +
      '</span>';

    // Все ссылки — в новой вкладке, включая почту: сайт не должен закрываться
    if (!mail) {
      return '<a class="' + cls + ' fade" href="' + esc(url) + '"' +
        ' target="_blank" rel="noopener me">' + inner + icon('out', 18, 'link__arrow') + '</a>';
    }

    /* Почта. Без настроенного почтового клиента ссылка mailto: открывает
       пустую вкладку, а сам адрес человек так и не видит. Поэтому в углу
       кнопка «скопировать». Она соседняя, а не вложенная: кнопка внутри
       ссылки — недопустимая разметка, да и клик по ней открыл бы почту.   */
    var address = url.replace(/^mailto:/i, '').split('?')[0];
    return '<div class="link-wrap fade">' +
      '<a class="' + cls + ' link--mail" href="' + esc(url) + '"' +
        ' target="_blank" rel="noopener me">' + inner + '</a>' +
      '<button class="link__copy" type="button" data-copy="' + esc(address) + '"' +
        ' aria-label="' + esc(UI.copy + ' ' + address) + '" title="' + esc(UI.copy) + '">' +
        icon('copy', 18, 'i-copy') + icon('check', 18, 'i-done') +
      '</button>' +
      '</div>';
  }

  /* Плитка «Портфолио» среди ссылок: разделы плашками и обложки последних
     работ. Есть, только когда есть само портфолио.                       */
  function worksTile() {
    if (!HAS_WORKS) return '';
    var items = (P.items || []).slice().sort(function (a, b) {
      return String(b.date || '').localeCompare(String(a.date || ''));
    });
    var photos = window.SITE_PHOTOS || {};
    var covers = items.map(function (w) { return (photos[w.id] || [])[0]; }).filter(Boolean).slice(0, 3);
    // Пустой раздел со ссылкой «Больше — в …» (more) тоже виден: в нём эта ссылка
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
            return '<img src="' + esc(c.thumb) + '" alt="" width="' + c.tw + '" height="' + c.th + '" loading="lazy">';
          }).join('') + '</span>'
        : '') +
      '<span class="tile__chips">' + cats.map(function (c) {
        return '<span class="chip">' + esc(T(c.name)) + '</span>';
      }).join('') + '</span>' +
    '</a>';
  }

  function renderLinks() {
    var nav = slot('links');
    if (nav) nav.setAttribute('aria-label', UI.links);
    var html = '', open = false, groups = 0;
    function close() { if (open) { html += '</div>'; open = false; } }

    (C.links || []).forEach(function (l) {
      // Строка без ссылки, только с group — это заголовок раздела
      if (l.group && !T(l.url)) {
        // Портфолио — последней плиткой первой группы: после профилей, до
        // каналов. Внутри сетки, чтобы оно добрало пустое место в ряду
        if (groups === 1 && open) html += worksTile();
        close();
        groups++;
        html += '<h2 class="links__group fade">' + esc(T(l.group)) + '</h2>';
        return;
      }
      if (l.featured) return;   // она наверху, рядом с именем
      if (!open) { html += '<div class="bento">'; open = true; }
      html += tile(l, false);
    });
    // Групп меньше двух — плитка портфолио в конце последней сетки
    if (groups < 2) {
      var works = worksTile();
      if (works && !open) { html += '<div class="bento">'; open = true; }
      html += works;
    }
    close();
    fill('links', html);
  }

  /* --- Проекты ---------------------------------------------------------------
     Плитки справа от имени: выделенная ссылка (featured) и проекты. У EBK KVN
     свой знак — он собран из трафаретов, а не вставлен картинкой: так буквы
     берут цвета плитки, и форма их ровно как в оригинальном логотипе.      */
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
    // Справа пусто — плитка с именем растянется на всю ширину
    if (!feat.length && !items.length) { box.innerHTML = ''; box.hidden = true; return; }

    if (T(pr.title)) box.setAttribute('aria-label', T(pr.title));
    box.innerHTML = feat.map(function (l) { return tile(l, true); }).join('') +
                    items.map(projectCard).join('');
    box.hidden = false;
  }

  /* --- Копирование адреса ----------------------------------------------------
     Буфер обмена через clipboard работает только на https и localhost. На
     всякий случай есть запасной путь через выделение, а если не сработал и
     он — адрес показывается в окошке, откуда его можно скопировать руками. */
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
      var hint = btn.parentNode.querySelector('.link__handle');

      copyText(text).then(function () {
        // Исходную подпись запоминаем один раз, иначе второй клик подряд
        // запомнил бы уже «Скопировано…» и вернул её вместо настоящей
        // (с разметкой: в адресе почты стоит перенос после @)
        if (hint && !hint.dataset.orig) hint.dataset.orig = hint.innerHTML;
        // Коротко: на телефоне подпись с адресом обрезалась бы многоточием
        if (hint) hint.textContent = UI.copied;
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

  /* --- Касание на телефоне ---------------------------------------------------
     У пальца нет наведения, поэтому та же анимация, что на компьютере при
     наведении (карточка приподнимается, значок поворачивается), включается
     на время касания классом is-tap и сама уходит. Чуть позже касания — чтобы
     при листании карточки не дёргались: начнёт палец листать, браузер
     пришлёт pointercancel, и класс не появится. Стили — в style.css.      */
  function initTap() {
    if (!window.matchMedia || !matchMedia('(hover: none)').matches) return;
    var SEL = '.tile, .link-wrap, .work, .more, .feat, .cta-btn, .socials__item';
    var el = null, on = 0, off = 0, x0 = 0, y0 = 0;
    function clear() { clearTimeout(on); clearTimeout(off); if (el) el.classList.remove('is-tap'); el = null; }
    document.addEventListener('pointerdown', function (e) {
      if (e.pointerType === 'mouse') return;
      clear();
      x0 = e.clientX; y0 = e.clientY;
      var t = e.target.closest && e.target.closest(SEL);
      // Почта: плитка и кнопка «скопировать» поднимаются вместе — как при наведении
      if (t && t.parentNode.classList && t.parentNode.classList.contains('link-wrap')) t = t.parentNode;
      // Карточка с несколькими ссылками сама не нажимается — отклик только у значков
      if (!t || t.classList.contains('more--group') || t.classList.contains('work--group')) return;
      el = t;
      on = setTimeout(function () { t.classList.add('is-tap'); }, 70);
    }, { passive: true });
    document.addEventListener('pointerup', function () {
      if (!el) return;
      clearTimeout(on);
      el.classList.add('is-tap');   // быстрое касание — анимацию всё равно видно
      off = setTimeout(clear, 450);
    }, { passive: true });
    document.addEventListener('pointercancel', clear, { passive: true });
    // Палец поехал или страница (ряд карточек) прокрутилась — это листание, не нажатие
    document.addEventListener('pointermove', function (e) {
      if (el && Math.abs(e.clientX - x0) + Math.abs(e.clientY - y0) > 10) clear();
    }, { passive: true });
    document.addEventListener('scroll', function () { if (el) clear(); }, { passive: true, capture: true });
    // Вернулись «Назад» — страница из кэша браузера не должна остаться с поднятой карточкой
    window.addEventListener('pageshow', clear);
  }

  /* --- Блок «Сейчас» -------------------------------------------------------- */
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

  /* --- Подвал --------------------------------------------------------------- */
  function renderFooter() {
    var f = C.footer || {};
    // Без своего текста подвал повторяет имя из шапки — так они не разойдутся.
    // Имя на другом языке живёт на своей странице (/en/), здесь его не дублируем
    var text = T(f.text) || T((C.hero || {}).name);
    var year = f.showYear === false ? '' : ' · ' + new Date().getFullYear();
    var line = esc(text ? text + year : year.replace(/^ · /, ''));
    var url = T(f.url);
    if (url && line) {
      line = '<a class="footer__main" href="' + esc(url) + '" target="_blank" rel="noopener me">' + line + '</a>';
    }
    // «Нашли ошибку?» — с готовым началом сообщения и адресом этой страницы.
    // Адрес — от meta.url, а не от location: сборка вшивает подвал в HTML
    // на своём компьютере, и там был бы адрес локального сервера
    var bug = T(f.bugUrl);
    if (bug) {
      var page = (T((C.meta || {}).url) || location.origin).replace(/\/+$/, '') + location.pathname;
      var draft = UI.bugDraft + page + ' — ';
      if (/^https:\/\/t\.me\//i.test(bug)) bug += (bug.indexOf('?') < 0 ? '?' : '&') + 'text=' + encodeURIComponent(draft);
      else if (/^mailto:/i.test(bug)) bug += '?subject=' + encodeURIComponent(UI.bug) + '&body=' + encodeURIComponent(draft);
      line = '<a class="footer__bug" href="' + esc(bug) + '" target="_blank" rel="noopener">' +
        icon('bug', 15) + esc(UI.bug) + '</a>' + line;
    }
    // Счётчик включён (любой из двух) — рядом ссылка на политику: она должна быть под рукой
    if ((C.analytics || {}).metrika || (C.analytics || {}).goatcounter) {
      line += '<a class="footer__policy" href="/privacy/' + (LANG === 'en' ? '?lang=en' : '') + '">' +
        esc(UI.policy) + '</a>';
    }
    fill('footer', line);
  }

  /* --- Переключатель языка ---------------------------------------------------
     Обычная ссылка на другую версию страницы. Сборка вшивает её в HTML
     готовой — по ней поисковики находят английскую версию. Здесь только
     подстраховка: правки конфига видны и до сборки.                       */
  function renderLang() {
    var a = slot('lang-switch');
    if (!a) return;
    if (!window.SITE_HAS_EN) { a.hidden = true; a.removeAttribute('href'); return; }
    var o = UI.other;
    a.hidden = false;
    a.href = pathFor(o.lang, PAGE);   // та же страница, только на другом языке
    a.hreflang = o.lang;
    a.lang = o.lang;
    a.title = o.title;
    a.setAttribute('aria-label', o.title);
    a.textContent = o.code;
  }

  /* --- Вкладки «Ссылки | Портфолио» -------------------------------------------
     Выглядят как вкладки, но это две отдельные страницы со своими адресами:
     портфолио можно отправить ссылкой отдельно, и поиск видит его целиком.  */
  function renderTabs() {
    var nav = slot('tabs');
    if (!nav) return;
    // На странице раздела и работы вместо вкладок — путь «Портфолио › ПК»
    if (!HAS_WORKS || PAGE === 'category' || PAGE === 'work') { nav.hidden = true; nav.innerHTML = ''; return; }
    var tab = function (key, label) {
      var on = key === PAGE;
      return '<a class="tabs__item' + (on ? ' is-on' : '') + '" href="' + pathFor(LANG, key) + '"' +
        (on ? ' aria-current="page"' : '') + '>' + esc(label) + '</a>';
    };
    nav.setAttribute('aria-label', UI.tabs);
    nav.innerHTML = tab('home', UI.tabLinks) + tab('portfolio', T(P.title) || UI.tabWorks);
    nav.hidden = false;
  }

  /* На странице портфолио блоки главной не нужны. Разметка общая, поэтому
     в копии от сборки они могли остаться — убираем, а не прячем: поисковик
     не должен видеть на этой странице чужие ссылки.                     */
  function clearHomeBlocks() {
    var list = ['[data-section="projects"]', '[data-bind="links"]', '[data-section="now"]'];
    /* На страницах раздела и работы большая шапка не нужна: заголовок
       страницы — название раздела или работы, а кто автор, видно в пути
       над ним (маленький аватар и имя).                                 */
    if (PAGE === 'category' || PAGE === 'work') list.push('.intro');
    list.forEach(function (s) {
      var el = document.querySelector(s);
      if (el) { el.innerHTML = ''; el.hidden = true; }
    });
  }

  /* --- Плавное появление ---------------------------------------------------- */
  /* Страница короткая и помещается почти в один экран, поэтому показываем всё
     сразу после отрисовки. Раньше это было завязано на скролл, и нижние ссылки
     висели невидимыми до прокрутки — выглядело как недогруженная страница.     */
  function initFade() {
    var items = document.querySelectorAll('.fade');

    /* Содержимое уже вшито сборкой и видно с первого кадра. Прятать его ради
       анимации нельзя — получилось бы «показалось, пропало, проявилось».
       Поэтому сразу ставим конечное состояние, без перехода.               */
    if (STATIC) {
      Array.prototype.forEach.call(items, function (el) { el.classList.add('is-in'); });
      return;
    }

    var done = false;
    var show = function () {
      if (done) return;
      done = true;
      Array.prototype.forEach.call(items, function (el, i) {
        el.style.setProperty('--d', Math.min(i, 12) * 40 + 'ms');
        el.classList.add('is-in');
      });
    };

    // Два кадра: первый — чтобы браузер успел отрисовать исходное состояние,
    // иначе перехода не будет и элементы просто «моргнут».
    if (window.requestAnimationFrame) {
      requestAnimationFrame(function () { requestAnimationFrame(show); });
    }
    // Подстраховка: в фоновой вкладке кадры не рисуются и requestAnimationFrame
    // не срабатывает вовсе — без этого ссылки остались бы невидимыми.
    setTimeout(show, 150);
  }

  /* --- Старт ---------------------------------------------------------------- */
  if (PAGE === 'home' || PAGE === 'portfolio') renderHero();
  renderTabs();
  if (PAGE === 'home') {
    // У портфолио заголовок свой — его вписывает сборка
    applyMeta();
    renderProjects();
    renderLinks();
    normalizeIcons();
    renderNow();
  } else {
    clearHomeBlocks();
  }
  renderFooter();
  renderLang();
  initCopy();
  initTap();

  // Общие помощники — для assets/js/portfolio.js, чтобы не дублировать их
  window.SITE_UTIL = { esc: esc, typo: typo, asset: asset, icon: icon, brand: BRAND,
                       page: PAGE, cat: CAT, work: WORK };

  // Портфолио рисуется отдельным файлом — появление общее
  if (PAGE !== 'home' && window.SITE_RENDER_WORKS) window.SITE_RENDER_WORKS();
  initFade();

  /* Панель оформления меняет акцент, а ореол под аватаром считается от него.
     Отдаём пересчёт наружу, чтобы panel.js и theme.js могли его дёрнуть.    */
  window.SITE_ON_THEME = tuneAvatarGlow;
})();
