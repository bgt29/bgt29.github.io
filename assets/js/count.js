/* =============================================================================
   Простой счётчик посещений без куки — GoatCounter
   -----------------------------------------------------------------------------
   Считает всех гостей, без уведомления и согласия: в браузере гостя ничего
   не сохраняет, а сервис не хранит IP и данные браузера — сразу превращает
   их в цифры. Кроме просмотров считает нажатия на ссылки наружу: видно,
   какие соцсети и каналы открывают.

   Пока в config.js пуст analytics.goatcounter, файл ничего не делает.
   Считает только на настоящем адресе сайта (meta.url): проверки на
   компьютере и сборка в статистику не попадают.
   ========================================================================== */
(function () {
  'use strict';

  var C = window.SITE_CONFIG || {};
  var CODE = String((C.analytics || {}).goatcounter || '').trim().toLowerCase();
  if (!/^[a-z0-9-]+$/.test(CODE)) return;

  function bare(h) { return String(h || '').toLowerCase().replace(/^www\./, ''); }
  var SITE = bare((/^https?:\/\/([^\/:]+)/i.exec((C.meta || {}).url || '') || [])[1]);
  var HERE = bare(location.hostname);
  if (!SITE || HERE !== SITE) return;
  if (navigator.webdriver) return;   // сборка и роботы

  /* Свои заходы не считать: открыть сайт с #toggle-goatcounter в конце адреса
     (как у официального скрипта GoatCounter). Метка ставится только в этом
     браузере и только тому, кто сам открыл такой адрес; повтор — снимает.  */
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

  // Запрос картинкой — так GoatCounter принимает данные без своего скрипта
  function send(params) {
    var q = Object.keys(params).filter(function (k) { return params[k]; }).map(function (k) {
      return k + '=' + encodeURIComponent(params[k]);
    });
    q.push('rnd=' + Math.random().toString(36).slice(2));
    new Image().src = END + '?' + q.join('&');
  }

  /* --- Просмотр страницы ----------------------------------------------------- */
  send({
    p: location.pathname + location.search,
    t: document.title,
    r: document.referrer,
    s: [screen.width, screen.height, window.devicePixelRatio || 1].join(',')
  });

  /* --- Нажатия на ссылки наружу ----------------------------------------------
     В отчёте событием: адрес без «https://» (t.me/Baget_PC), почта —
     просто «mailto» без самого адреса. /avito — переходник на профиль
     Авито, его тоже считаем выходом.                                       */
  document.addEventListener('click', function (e) {
    // Переход отменён скриптом (курсор EBK открывает терминал, а не бота) — не считаем
    if (e.defaultPrevented) return;
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a) return;
    var u;
    try { u = new URL(a.getAttribute('href'), location.href); } catch (err) { return; }
    var name = '';
    if (u.protocol === 'mailto:') name = 'mailto';
    else if (/^https?:$/.test(u.protocol) && bare(u.hostname) !== HERE) {
      // Кириллица в адресе (youtube.com/@багет29) — в отчёте буквами, а не %D0%B1…
      var path = u.pathname;
      try { path = decodeURIComponent(path); } catch (err) {}
      name = bare(u.hostname) + path.replace(/\/+$/, '');
    }
    else if (/^\/avito\/?$/.test(u.pathname)) name = 'avito';
    if (!name) return;
    send({
      p: name,
      // innerText, а не textContent: «Telegram» и «@Baget_PC» в плитке —
      // разные строки, textContent склеил бы их без пробела
      t: (a.getAttribute('aria-label') || a.innerText || a.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 100),
      e: 'true'
    });
  }, true);
})();
