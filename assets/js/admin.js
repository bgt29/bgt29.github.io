/* =============================================================================
   Админка (/admin/): правка assets/js/config.js прямо в репозитории сайта
   на GitHub. Сделана по просьбе Кирилла 25.10.2026.

   Вход — ключом GitHub (fine-grained token) только на этот репозиторий и
   только с правом Contents. Ключ хранится в этом браузере: до закрытия
   вкладки или, с галочкой «Запомнить», до выхода. Отправляется он только
   на api.github.com — иначе не даст правило безопасности страницы (CSP).

   Как сохраняется: файл целиком уходит новой правкой (коммитом) в ветку,
   GitHub Pages сам пересобирает сайт за минуту-две. Перед сохранением конфиг
   проверяется — с ошибкой он сломал бы сайт — и показывается, что изменится.
   Если файл успели поменять в другом месте, GitHub правку не примет, и
   ничего не затрётся.
   ========================================================================== */
(function () {
  'use strict';

  var API = 'https://api.github.com';
  var FILE = 'assets/js/config.js';
  var KEY = 'admin-auth';

  var auth = null;          // { token, repo, branch }
  var sha = null;           // версия файла на GitHub — без неё правку не примут
  var original = '';        // текст, как он сейчас на сайте
  var crlf = false;         // переводы строк файла: вернём те же, что были
  var checked = null;       // текст, который проверили и показали изменения

  function $(id) { return document.getElementById(id); }

  /* --- Ключ ---------------------------------------------------------------- */
  function loadAuth() {
    try { return JSON.parse(sessionStorage.getItem(KEY) || localStorage.getItem(KEY) || 'null'); }
    catch (e) { return null; }
  }
  function saveAuth(a, remember) {
    try { (remember ? localStorage : sessionStorage).setItem(KEY, JSON.stringify(a)); } catch (e) {}
  }
  function clearAuth() {
    try { sessionStorage.removeItem(KEY); localStorage.removeItem(KEY); } catch (e) {}
  }

  function status(text, kind) {
    var s = $('status');
    s.textContent = text || '';
    s.setAttribute('data-kind', kind || '');
  }

  /* --- GitHub -------------------------------------------------------------- */
  function gh(path, opts) {
    opts = opts || {};
    return fetch(API + path, {
      method: opts.method || 'GET',
      headers: {
        'Accept': 'application/vnd.github+json',
        'Authorization': 'Bearer ' + auth.token,
        'X-GitHub-Api-Version': '2022-11-28',
        'Content-Type': 'application/json'
      },
      body: opts.body ? JSON.stringify(opts.body) : undefined,
      cache: 'no-store'
    }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (data) {
        if (!r.ok) {
          var e = new Error(data.message || ('HTTP ' + r.status));
          e.status = r.status;
          throw e;
        }
        return data;
      });
    });
  }

  // Понятные слова вместо кодов GitHub
  function explain(e) {
    if (!e || !e.status) return 'Нет связи с GitHub. Проверьте интернет и попробуйте ещё раз.';
    if (e.status === 401) return 'Ключ не подошёл: опечатка или истёк срок. Сделайте новый.';
    if (e.status === 403) return 'У ключа нет права на запись. Нужно Contents: Read and write для репозитория сайта.';
    if (e.status === 404) return 'Не нашёл репозиторий или файл. Проверьте название репозитория и что ключу дан доступ к нему.';
    if (e.status === 409 || e.status === 422) return 'Файл успели изменить в другом месте. Нажмите «Отменить правки», чтобы загрузить свежий, и повторите.';
    return 'GitHub ответил ошибкой ' + e.status + ': ' + e.message;
  }

  /* Текст файла в base64 и обратно. atob/btoa работают с байтами, а конфиг
     в UTF-8 с русскими буквами — поэтому через TextEncoder и TextDecoder. */
  function fromB64(b64) {
    var bin = atob(String(b64).replace(/\s/g, ''));
    var bytes = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new TextDecoder('utf-8').decode(bytes);
  }
  function toB64(text) {
    var bytes = new TextEncoder().encode(text), bin = '';
    for (var i = 0; i < bytes.length; i += 0x8000) {
      bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
    }
    return btoa(bin);
  }

  /* --- Быстрые поля ---------------------------------------------------------
     Каждое — одна строка конфига, найденная по образцу. Нашлось не ровно
     одно место — поле выключается, правьте в редакторе целиком.          */
  var QUICK = [
    { id: 'q-avito', rx: /(redirectTo:\s*')([^']*)(')/,
      check: function (v) { return !v || /^https:\/\/(www\.|m\.)?avito\.ru\/\S+$/.test(v) || 'Ссылка на Авито должна начинаться с https://www.avito.ru/'; },
      // Рядом в конфиге пометка «проверено ДД.ММ.ГГГГ» — обновляем дату
      stamp: true },
    { id: 'q-goat', rx: /(goatcounter:\s*')([^']*)(')/,
      check: function (v) { return /^[a-z0-9-]*$/.test(v) || 'Код GoatCounter — только строчные латинские буквы, цифры и дефис'; } },
    { id: 'q-metrika', rx: /(metrika:\s*')([^']*)(')/,
      check: function (v) { return /^\d*$/.test(v) || 'Номер Метрики — только цифры'; } }
  ];

  function count(text, rx) { return (text.match(new RegExp(rx.source, 'g')) || []).length; }

  function today() {
    var d = new Date();
    return ('0' + d.getDate()).slice(-2) + '.' + ('0' + (d.getMonth() + 1)).slice(-2) + '.' + d.getFullYear();
  }

  function fillQuick() {
    var text = $('code').value;
    QUICK.forEach(function (q) {
      var el = $(q.id), one = count(text, q.rx) === 1;
      el.disabled = !one;
      el.value = one ? text.match(q.rx)[2] : '';
      el.title = one ? '' : 'В конфиге не нашлось ровно одного такого поля — правьте его в редакторе ниже';
    });
  }

  function onQuick(q) {
    var el = $(q.id), v = el.value.trim();
    var ok = /['"\\\n\r]/.test(v) ? 'Без кавычек и обратной косой черты' : q.check(v);
    if (ok !== true) { status(ok, 'err'); return; }
    status('');
    var text = $('code').value.replace(q.rx, function (m, a, b, c) { return a + v + c; });
    if (q.stamp) {
      text = text.replace(/(redirectTo:\s*'[^']*'[^\n]*?\/\/\s*проверено\s*)\d{2}\.\d{2}\.\d{4}/, '$1' + today());
    }
    $('code').value = text;
    changed();
  }

  /* --- Проверка конфига -----------------------------------------------------
     Выполняем текст файла с подставным window и смотрим, что получилось.
     Сам сайт так же выполняет config.js — значит, если здесь без ошибок,
     то и там загрузится.                                                 */
  function validate(text) {
    var w = {};
    try { new Function('window', text)(w); }
    catch (e) { return ['Ошибка в коде конфига: ' + e.message + '. Проверьте запятые, кавычки и скобки рядом с последней правкой.']; }
    var c = w.SITE_CONFIG, errs = [];
    if (!c || typeof c !== 'object') return ['В файле нет window.SITE_CONFIG — так сайт не запустится.'];

    if (!Array.isArray(c.links)) errs.push('Нет списка ссылок (links).');
    else c.links.forEach(function (l, i) {
      if (!l || (!l.group && !l.url)) errs.push('Ссылка №' + (i + 1) + ' без адреса (url).');
    });

    var P = c.portfolio || {}, ids = {};
    var cats = (P.categories || []).map(function (x) { return x && x.id; });
    (P.items || []).forEach(function (it, i) {
      if (!it || !it.id) { errs.push('Работа №' + (i + 1) + ' без id.'); return; }
      if (!/^[a-z0-9][a-z0-9-]*$/.test(it.id)) errs.push('id работы «' + it.id + '»: только строчная латиница, цифры и дефис.');
      if (ids[it.id]) errs.push('Работа «' + it.id + '» записана дважды.');
      ids[it.id] = 1;
      if (cats.indexOf(it.category) < 0) errs.push('У работы «' + it.id + '» раздел «' + it.category + '», а такого раздела нет.');
    });

    var A = c.analytics || {};
    if (A.metrika && !/^\d+$/.test(A.metrika)) errs.push('Номер Метрики — только цифры.');
    if (A.goatcounter && !/^[a-z0-9-]+$/.test(A.goatcounter)) errs.push('Код GoatCounter — латиница, цифры и дефис.');
    return errs;
  }

  /* --- Что изменится --------------------------------------------------------
     Построчное сравнение (наибольшая общая подпоследовательность). Конфиг
     — сотни строк, это мгновенно.                                         */
  function diff(a, b) {
    a = a.split('\n'); b = b.split('\n');
    // Одинаковые начало и конец отрезаем сразу — сравнивать остаётся немного
    var s = 0;
    while (s < a.length && s < b.length && a[s] === b[s]) s++;
    var ea = a.length, eb = b.length;
    while (ea > s && eb > s && a[ea - 1] === b[eb - 1]) { ea--; eb--; }
    var x = a.slice(s, ea), y = b.slice(s, eb);
    var n = x.length, m = y.length, L = [];
    for (var i = 0; i <= n; i++) { L.push(new Array(m + 1).fill(0)); }
    for (i = n - 1; i >= 0; i--) for (var j = m - 1; j >= 0; j--) {
      L[i][j] = x[i] === y[j] ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]);
    }
    var out = [];
    i = 0; j = 0;
    while (i < n || j < m) {
      if (i < n && j < m && x[i] === y[j]) { i++; j++; }
      // Сначала старая строка (−), потом новая (+) — так читать привычнее
      else if (i < n && (j >= m || L[i + 1][j] >= L[i][j + 1])) { out.push({ t: '−', line: s + i + 1, text: x[i] }); i++; }
      else { out.push({ t: '+', line: s + j + 1, text: y[j] }); j++; }
    }
    return out;
  }

  function showDiff(list) {
    var box = $('diff');
    box.textContent = '';
    if (!list.length) { box.hidden = true; return; }
    list.slice(0, 80).forEach(function (d) {
      var row = document.createElement('div');
      row.className = d.t === '+' ? 'is-add' : 'is-del';
      row.textContent = d.t + ' ' + d.line + ':  ' + d.text;
      box.appendChild(row);
    });
    if (list.length > 80) {
      var more = document.createElement('div');
      more.textContent = '… и ещё строк: ' + (list.length - 80);
      box.appendChild(more);
    }
    box.hidden = false;
  }

  /* --- Шаги ---------------------------------------------------------------- */
  function changed() {
    checked = null;
    $('save').disabled = true;
    $('diff').hidden = true;
  }

  function check() {
    var text = $('code').value;
    var errs = validate(text);
    if (errs.length) { changed(); status(errs.join('\n'), 'err'); return; }
    var d = diff(original, text);
    showDiff(d);
    if (!d.length) { status('Изменений нет — сайт и так такой.'); return; }
    checked = text;
    $('save').disabled = false;
    status('Ошибок нет. Изменится строк: ' + d.length + '. Если всё верно — «Сохранить на сайт».', 'ok');
  }

  function save() {
    var text = $('code').value;
    if (checked !== text) { check(); return; }   // правили после проверки — проверить заново
    $('save').disabled = true;
    status('Сохраняю…');
    gh('/repos/' + auth.repo + '/contents/' + FILE, {
      method: 'PUT',
      body: {
        message: $('msg').value.trim() || 'Правка конфига через админку',
        content: toB64(crlf ? text.replace(/\n/g, '\r\n') : text),
        sha: sha,
        branch: auth.branch
      }
    }).then(function (r) {
      sha = r.content && r.content.sha;
      original = text;
      checked = null;
      $('msg').value = '';
      $('diff').hidden = true;
      status('Сохранено. Сайт обновится через 1–2 минуты — потом обновите его страницу.', 'ok');
    }).catch(function (e) {
      $('save').disabled = false;
      status(explain(e), 'err');
    });
  }

  function loadFile() {
    status('Загружаю конфиг…');
    return gh('/repos/' + auth.repo + '/contents/' + FILE + '?ref=' + encodeURIComponent(auth.branch))
      .then(function (f) {
        var text = fromB64(f.content);
        crlf = /\r\n/.test(text);
        original = text.replace(/\r\n/g, '\n');
        sha = f.sha;
        $('code').value = original;
        fillQuick();
        changed();
        $('login-box').hidden = true;
        $('editor').hidden = false;
        $('logout').hidden = false;
        status('');
      });
  }

  function login(e) {
    e.preventDefault();
    var a = {
      token: $('token').value.trim(),
      repo: $('repo').value.trim().replace(/^https?:\/\/github\.com\//, '').replace(/\/+$/, ''),
      branch: $('branch').value.trim() || 'main'
    };
    if (!a.token) { status('Вставьте ключ доступа.', 'err'); return; }
    if (!/^[\w.-]+\/[\w.-]+$/.test(a.repo)) { status('Репозиторий — в виде владелец/название, например bgt29/bgt29.github.io.', 'err'); return; }
    auth = a;
    status('Проверяю ключ…');
    loadFile().then(function () {
      saveAuth(a, $('remember').checked);
      $('token').value = '';
    }).catch(function (err) {
      auth = null;
      status(explain(err), 'err');
    });
  }

  function logout() {
    if (dirty() && !confirm('Есть несохранённые правки. Выйти без сохранения?')) return;
    clearAuth();
    auth = null; sha = null; original = ''; checked = null;
    $('code').value = '';
    $('editor').hidden = true;
    $('login-box').hidden = false;
    $('logout').hidden = true;
    status('Вы вышли. Ключ с этого устройства удалён.');
  }

  function dirty() { return !$('editor').hidden && $('code').value !== original; }

  /* --- Старт --------------------------------------------------------------- */
  $('login').addEventListener('submit', login);
  $('logout').addEventListener('click', logout);
  $('check').addEventListener('click', check);
  $('save').addEventListener('click', save);
  $('reset').addEventListener('click', function () {
    if (dirty() && !confirm('Отменить все несохранённые правки?')) return;
    loadFile().catch(function (e) { status(explain(e), 'err'); });
  });
  $('code').addEventListener('input', function () { changed(); fillQuick(); });
  QUICK.forEach(function (q) { $(q.id).addEventListener('change', function () { onQuick(q); }); });
  window.addEventListener('beforeunload', function (e) {
    if (dirty()) { e.preventDefault(); e.returnValue = ''; }
  });

  // Уже входили на этом устройстве — сразу к правке
  auth = loadAuth();
  if (auth && auth.token) {
    loadFile().catch(function (e) {
      // Ключ истёк или отозван — забываем его и показываем вход
      if (e.status === 401) clearAuth();
      auth = null;
      status(explain(e), 'err');
    });
  }
})();
