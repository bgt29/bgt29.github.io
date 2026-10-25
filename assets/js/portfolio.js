/* =============================================================================
   Портфолио: ряды-карусели, страница раздела и страница работы.

   Страницы делает сборка из index.html и помечает их:
     <body data-page="portfolio">                          — все разделы рядами;
     <body data-page="category" data-cat="pc">             — один раздел;
     <body data-page="work" data-cat="pc" data-work="имя"> — одна работа.
   Здесь по этой метке рисуется нужное. Подключается ДО app.js: тот сначала
   рисует общее, потом вызывает SITE_RENDER_WORKS. Тексты — из config.js
   (portfolio), список фото — из assets/portfolio/photos.js, его пишет сборка.
   ========================================================================== */
(function () {
  'use strict';

  window.SITE_RENDER_WORKS = function () {
    var box = document.querySelector('[data-section="works"]');
    if (!box) return;

    var C = window.SITE_CONFIG || {};
    var P = C.portfolio || {};
    var T = window.SITE_T;
    var U = window.SITE_UTIL;
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
            months: ['январь', 'февраль', 'март', 'апрель', 'май', 'июнь', 'июль',
                     'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь'] },
      en: { portfolio: 'Portfolio', all: 'All', photo: 'photo', more: 'More in',
            prev: 'Scroll back', next: 'Scroll forward',
            prevPhoto: 'Previous photo', nextPhoto: 'Next photo',
            site: 'Open website', learn: 'Learn more', path: 'You are here',
            tgPost: 'Telegram post (in Russian)', igPost: 'Instagram post', video: 'video',
            empty: 'Work coming soon.', soon: 'Work coming soon',
            months: ['January', 'February', 'March', 'April', 'May', 'June', 'July',
                     'August', 'September', 'October', 'November', 'December'] }
    }[LANG];

    // 1 работа, 2 работы, 5 работ — по-русски; 1 work, 2 works — по-английски
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
      // more — одна ссылка или список: «Могу устроить фотосессию» + Instagram
      catMore[c.id] = [].concat(c.more || []).filter(function (m) { return m && T(m.url); });
      catOrg[c.id] = c.org && T(c.org.text) ? c.org : null;
    });

    // Свежие первыми; без даты — в конце, в том порядке, как записаны
    var items = (P.items || []).filter(function (w) { return w && w.id && catName[w.category]; })
      .map(function (w, i) { return { w: w, i: i }; })
      .sort(function (a, b) {
        var da = String(a.w.date || ''), db = String(b.w.date || '');
        if (da !== db) return da < db ? 1 : -1;
        return a.i - b.i;
      })
      .map(function (x) { return x.w; });

    function inCat(id) { return items.filter(function (w) { return w.category === id; }); }
    function photosOf(w) { return PHOTOS[w.id] || []; }
    // Видео — в том же списке, что и фото: у него обложка-кадр и поле video
    function isVideo(p) { return !!(p && p.video); }
    var CAMERA_ICON = '<svg viewBox="0 0 24 24" width="13" height="13" aria-hidden="true" fill="none" stroke="currentColor"' +
      ' stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="15" rx="3"/>' +
      '<circle cx="12" cy="12.5" r="3.5"/><path d="M8 5l1.5-2h5L16 5"/></svg>';
    var PLAY_ICON = '<svg viewBox="0 0 24 24" width="13" height="13" aria-hidden="true" fill="currentColor">' +
      '<path d="M8 5.5v13l10.5-6.5z"/></svg>';
    function urlPortfolio() { return PRE + '/portfolio/'; }
    function urlCat(id) { return PRE + '/portfolio/' + id + '/'; }
    function urlWork(w) { return PRE + '/portfolio/' + w.category + '/' + w.id + '/'; }

    // Надпись на кнопке работы, если cta не задан: пост в Telegram или
    // Instagram узнаём по адресу, сайт — по разделу
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

    /* --- Карточка работы ------------------------------------------------------
       В ряду — обложка, название и год. На странице раздела ещё и начало
       текста: его читает поиск, а гость видит, о чём работа.                */
    function card(w, withText) {
      var ph = photosOf(w), cover = ph[0];
      var title = T(w.title), text = String(T(w.text) || '').replace(/\n+/g, ' ');
      var year = when(w.date);
      /* Две копии обложки: 640 и 1600 точек. Браузер берёт ту, что нужна по
         ширине карточки и плотности экрана: широкая карточка в ряду на
         телефоне с плотным экраном с маленькой копией выглядела бы мутной. */
      var sizes = withText ? '(max-width: 520px) 100vw, 260px' : '(max-width: 520px) 86vw, 480px';
      return '<a class="work fade" href="' + urlWork(w) + '">' +
        '<span class="work__cover">' +
          (cover
            ? '<img src="' + esc(cover.thumb) + '" srcset="' + esc(cover.thumb) + ' ' + cover.tw + 'w, ' +
              esc(cover.src) + ' ' + cover.w + 'w" sizes="' + sizes + '" alt="' + esc(title) + '"' +
              ' width="' + cover.tw + '" height="' + cover.th + '" loading="lazy" decoding="async">'
            : U.icon('link', 28)) +
        '</span>' +
        // Значок в углу: сколько фото — или что это видео (тогда даже у одного)
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

    /* --- «Больше — в Telegram / Instagram» (more у раздела в конфиге) ---------
       Карточка — последней в ряду и на странице раздела: значок соцсети на
       месте обложки. Плашка — на странице работы и в пустом разделе.        */
    function brandOf(m) { return (U.brand || {})[m.icon] || 'var(--accent)'; }
    function moreCard(m) {
      var sub = T(m.sub);
      return '<a class="work work--more fade" href="' + esc(T(m.url)) + '" target="_blank" rel="noopener">' +
        '<span class="work__cover" style="--brand: ' + brandOf(m) + '">' + U.icon(m.icon, 46) + '</span>' +
        '<span class="work__body">' +
          '<span class="work__title">' + esc(typo(T(m.title))) + '</span>' +
          (sub ? '<span class="work__sub">' + esc(typo(sub)) + '</span>' : '') +
        '</span>' +
      '</a>';
    }
    function moreBanner(m) {
      var sub = T(m.sub);
      return '<a class="more" href="' + esc(T(m.url)) + '" target="_blank" rel="noopener">' +
        '<span class="link__icon" style="--brand: ' + brandOf(m) + '">' + U.icon(m.icon, 24) + '</span>' +
        '<span class="more__text">' +
          '<span class="more__title">' + esc(typo(T(m.title))) + '</span>' +
          (sub ? '<span class="more__sub">' + esc(typo(sub)) + '</span>' : '') +
        '</span>' +
        U.icon('out', 18, 'more__arrow') +
      '</a>';
    }

    /* --- Подпись раздела (org в конфиге): где сделаны работы ------------------
       text — под заголовком ряда и в шапке раздела; work — на странице работы,
       только у работ с team: true (заказы компании, а не свои проекты).
       С адресом — ссылкой на сайт компании.                                 */
    function orgLine(id, key) {
      var o = catOrg[id];
      var line = o && T(o[key || 'text']);
      if (!line) return '';
      var href = T(o.url), text = esc(typo(line));
      return href
        ? '<a class="org" href="' + esc(href) + '" target="_blank" rel="noopener">' + text + U.icon('out', 14) + '</a>'
        : '<p class="org">' + text + '</p>';
    }

    /* --- Ряд-карусель -------------------------------------------------------- */
    // Ссылки раздела делятся надвое: предложение услуги (offer: true) — плашкой
    // над кейсами, первым делом (просьба Кирилла 25.10.2026); канал — карточкой
    // последней в ряду, к нему приходят, пролистав работы
    function offersOf(id) { return (catMore[id] || []).filter(function (m) { return m.offer; }); }
    function linksOf(id) { return (catMore[id] || []).filter(function (m) { return !m.offer; }); }

    // total — сколько работ в разделе всего: в «Ещё в разделе» в ряду не все;
    // cat — раздел, чья карточка канала встаёт последней. Он задан только
    // в «Ещё в разделе» — там подпись раздела и предложение не повторяем:
    // они есть на самой странице работы
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

    // Путь над заголовком: маленький аватар с именем › Портфолио › Раздел
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

    /* --- Страница портфолио: по ряду на раздел ------------------------------- */
    if (U.page === 'portfolio') {
      box.innerHTML = cats.map(function (c) {
        var list = inCat(c.id);
        if (list.length) return shelf(c.id, list, catName[c.id], urlCat(c.id));
        // Пустой раздел — если в конфиге включён showEmpty или у раздела есть more
        return P.showEmpty === true || catMore[c.id].length ? soonShelf(c.id, catName[c.id]) : '';
      }).join('') || '<p class="works__empty fade">' + esc(UI.empty) + '</p>';
    }

    // Ряд раздела, где работ пока нет: заголовок и строка-заглушка во всю
    // ширину — как строки ссылок на главной, только с пунктирной рамкой.
    // Если у раздела есть more — вместо заглушки зовём туда
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

    /* --- Страница раздела ----------------------------------------------------- */
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

    /* --- Страница работы ------------------------------------------------------- */
    if (U.page === 'work') {
      var w = items.filter(function (x) { return x.id === U.work; })[0];
      if (!w) { box.innerHTML = '<p class="works__empty fade">' + esc(UI.empty) + '</p>'; box.hidden = false; return; }
      var ph = photosOf(w), title = T(w.title);
      // Высота галереи — по обложке, но без крайностей: от 3:4 до 16:9
      var ratio = ph[0] ? Math.min(16 / 9, Math.max(3 / 4, ph[0].w / ph[0].h)) : 4 / 3;
      var specs = (w.specs || []).map(T).filter(Boolean);
      var url = T(w.url);
      var others = inCat(w.category).filter(function (x) { return x.id !== w.id; });

      box.innerHTML = crumbs([
          { href: urlPortfolio(), label: portfolioName },
          { href: urlCat(w.category), label: catName[w.category] }
        ]) +
        (ph.length
          ? '<div class="gallery fade" style="--ratio:' + ratio.toFixed(4) + '">' +
              '<div class="gallery__track" tabindex="0">' +
                ph.map(function (p, i) {
                  var label = title + (ph.length > 1 ? ' — ' + (isVideo(p) ? UI.video : UI.photo) + ' ' + (i + 1) : '');
                  // Ролик: не грузится, пока не нажмут «играть» (preload="none"), обложка — его кадр
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
          '<div class="work-page__text">' +
            String(T(w.text) || '').split(/\n+/).filter(function (s) { return s.trim(); })
              .map(function (s) { return '<p>' + esc(typo(s.trim())) + '</p>'; }).join('') +
          '</div>' +
          (specs.length ? '<ul class="specs">' + specs.map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('') + '</ul>' : '') +
          (url
            ? '<a class="cta-btn" href="' + esc(url) + '" target="_blank" rel="noopener">' +
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

    box.hidden = false;
    initShelves();
    initGallery();

    /* --- Листание рядов -------------------------------------------------------
       Пальцем ряд листается сам. Стрелки — для мыши: прячутся у краёв.      */
    function initShelves() {
      Array.prototype.forEach.call(box.querySelectorAll('.shelf__wrap'), function (wrap) {
        var row = wrap.querySelector('.shelf__row');
        var prev = wrap.querySelector('.shelf__nav--prev'), next = wrap.querySelector('.shelf__nav--next');
        if (!prev || !next) return;   // ряд-заглушка пустого раздела — листать нечего
        function sync() {
          prev.hidden = row.scrollLeft <= 4;
          next.hidden = row.scrollLeft + row.clientWidth >= row.scrollWidth - 4;
        }
        prev.addEventListener('click', function () { row.scrollBy({ left: -row.clientWidth * 0.9, behavior: 'smooth' }); });
        next.addEventListener('click', function () { row.scrollBy({ left: row.clientWidth * 0.9, behavior: 'smooth' }); });
        row.addEventListener('scroll', sync, { passive: true });
        window.addEventListener('resize', sync);
        sync();
      });
    }

    /* --- Фото работы ----------------------------------------------------------
       Лента с прилипанием: пальцем листается сама, стрелки и клавиши ←/→
       сдвигают на одно фото, счётчик следит за прокруткой.              */
    function initGallery() {
      var g = box.querySelector('.gallery');
      if (!g) return;
      var track = g.querySelector('.gallery__track');
      var counter = g.querySelector('.gallery__count');
      var total = track.children.length;
      /* Номер фото помним сами: пока лента плавно едет, прокрутка ещё «между»
         фото, и два быстрых нажатия подряд посчитались бы как одно.       */
      var cur = 0, busyUntil = 0;
      var videos = track.querySelectorAll('video');
      function show() {
        if (counter) counter.textContent = (cur + 1) + ' / ' + total;
        // Ушли с ролика на другой слайд — ролик на паузу, чтобы не играл за кадром
        Array.prototype.forEach.call(videos, function (v) {
          if (!v.paused && v.closest('.gallery__slide') !== track.children[cur]) v.pause();
        });
      }
      function go(i) {
        var to = (i + total) % total;
        /* С первого фото на последнее и обратно — сразу, без плавной прокрутки:
           иначе лента пролетала бы через все снимки, а счётчик по дороге
           мелькал промежуточными номерами                                  */
        var far = Math.abs(to - cur) > 1;
        cur = to;
        busyUntil = Date.now() + (far ? 150 : 700);
        track.scrollTo({ left: cur * track.clientWidth, behavior: far ? 'auto' : 'smooth' });
        show();
      }
      // Листают пальцем — номер берём из прокрутки
      track.addEventListener('scroll', function () {
        if (Date.now() < busyUntil) return;
        cur = Math.round(track.scrollLeft / Math.max(1, track.clientWidth));
        show();
      }, { passive: true });
      var prev = g.querySelector('.gallery__nav--prev'), next = g.querySelector('.gallery__nav--next');
      if (prev) prev.addEventListener('click', function () { go(cur - 1); });
      if (next) next.addEventListener('click', function () { go(cur + 1); });
      track.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowLeft') { e.preventDefault(); go(cur - 1); }
        if (e.key === 'ArrowRight') { e.preventDefault(); go(cur + 1); }
      });
    }
  };
})();
