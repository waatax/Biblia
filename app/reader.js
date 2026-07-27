/* Biblia — 多語逐字對照聖經閱讀器
 *
 * 介面沿用信望愛 read100.html 的選擇方式：舊約 / 新約 各自一組
 * 「書卷 → 章 → 閱讀」，另加版本選擇；原站的「背景」選項不做。
 *
 * 資料以 <script src="data/NN_Book.js"> 動態注入載入，而不是 fetch()。
 * 原因：用 file:// 直接開啟時，fetch()/XHR 會被 CORS 擋掉，讀不到本地檔案；
 * <script src> 不受此限。這是「雙擊 index.html 即可用、免架伺服器」的關鍵。
 */
var BIBLIA = (function () {
  'use strict';

  var VERSIONS = [
    { key: 'zh_unv', label: '和合本', full: '和合本 (1919)', strong: true },
    { key: 'en_kjv', label: 'KJV', full: 'King James Version', strong: true },
    { key: 'en_web', label: 'WEB', full: 'World English Bible', strong: false }
  ];

  var DEFAULTS = { zh_unv: true, en_kjv: true, en_web: true };
  var FIRST_NT = 40;

  var state = {
    index: [],
    byNo: {},
    cache: {},
    pending: {},
    bookNo: 1,
    chap: 1,
    on: {},
    inter: false,
    size: 18,
    strong: null
  };

  var el = {};

  /* ---------- 設定持久化（file:// 下可能被擋，故全部包 try） ---------- */
  function save() {
    try {
      localStorage.setItem('biblia', JSON.stringify({
        on: state.on, inter: state.inter, size: state.size,
        bookNo: state.bookNo, chap: state.chap,
        dark: document.body.classList.contains('dark')
      }));
    } catch (e) { /* 忽略 */ }
  }

  function load() {
    try {
      var raw = localStorage.getItem('biblia');
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  }

  /* ---------- 資料載入 ---------- */
  function bookFile(no) {
    var meta = state.byNo[no];
    return meta ? 'data/' + meta.file : null;
  }

  function loadBook(no, cb) {
    if (state.cache[no]) { cb(state.cache[no]); return; }
    if (state.pending[no]) { state.pending[no].push(cb); return; }

    var src = bookFile(no);
    if (!src) { cb(null); return; }

    state.pending[no] = [cb];
    var s = document.createElement('script');
    s.src = src;
    s.charset = 'utf-8';
    s.onerror = function () {
      var waiting = state.pending[no] || [];
      delete state.pending[no];
      waiting.forEach(function (fn) { fn(null); });
    };
    document.head.appendChild(s);
  }

  function receive(data) {                    // 由 data/NN_Book.js 呼叫
    state.cache[data.no] = data;
    var waiting = state.pending[data.no] || [];
    delete state.pending[data.no];
    waiting.forEach(function (fn) { fn(data); });
  }

  /* ---------- 進入點：由 data/books.js 呼叫 ---------- */
  function books(list) {
    state.index = list;
    list.forEach(function (b) { state.byNo[b.no] = b; });

    var saved = load();
    state.on = (saved && saved.on) || Object.assign({}, DEFAULTS);
    state.inter = saved ? !!saved.inter : false;
    state.size = (saved && saved.size) || 18;
    state.bookNo = (saved && saved.bookNo) || 1;
    state.chap = (saved && saved.chap) || 1;
    if (saved && saved.dark) document.body.classList.add('dark');
    if (!state.byNo[state.bookNo]) { state.bookNo = 1; state.chap = 1; }

    cacheEls();
    buildStart();
    buildReaderControls();
    applySize();
    showStart();
  }

  function cacheEls() {
    [
      'startView', 'readerView', 'otBook', 'otChap', 'ntBook', 'ntChap',
      'startVersions', 'startInter', 'startDark', 'bookSelect', 'chapSelect',
      'reader', 'versionBox', 'interlinearChk', 'strongPanel', 'strongNum',
      'strongMeta', 'strongHits'
    ].forEach(function (id) { el[id] = document.getElementById(id); });
  }

  /* ---------- 初始介面 ---------- */
  function fillBookSelect(sel, from, to) {
    sel.innerHTML = '';
    state.index.forEach(function (b) {
      if (b.no < from || b.no > to) return;
      var o = document.createElement('option');
      o.value = b.no;
      o.textContent = b.zh;
      sel.appendChild(o);
    });
  }

  function fillChapSelect(sel, nch, labelled) {
    sel.innerHTML = '';
    for (var i = 1; i <= nch; i++) {
      var o = document.createElement('option');
      o.value = i;
      o.textContent = labelled ? ('第 ' + i + ' 章') : i;
      sel.appendChild(o);
    }
  }

  function buildStart() {
    fillBookSelect(el.otBook, 1, FIRST_NT - 1);
    fillBookSelect(el.ntBook, FIRST_NT, 66);

    function bind(bookSel, chapSel, goBtn) {
      function refresh() {
        var meta = state.byNo[parseInt(bookSel.value, 10)];
        fillChapSelect(chapSel, meta ? meta.nch : 1, true);
      }
      bookSel.addEventListener('change', refresh);
      goBtn.addEventListener('click', function () {
        showReader(parseInt(bookSel.value, 10), parseInt(chapSel.value, 10));
      });
      refresh();
    }
    bind(el.otBook, el.otChap, document.getElementById('otGo'));
    bind(el.ntBook, el.ntChap, document.getElementById('ntGo'));

    VERSIONS.forEach(function (v) {
      var lab = document.createElement('label');
      lab.className = 'pick-opt';
      var box = document.createElement('input');
      box.type = 'checkbox';
      box.checked = !!state.on[v.key];
      box.addEventListener('change', function () {
        state.on[v.key] = box.checked;
        syncVersions();
        save();
        if (!el.readerView.hidden) render();
      });
      lab.appendChild(box);
      var t = document.createElement('span');
      t.textContent = v.full;
      lab.appendChild(t);
      lab.setAttribute('data-v', v.key);
      el.startVersions.appendChild(lab);
    });

    el.startInter.checked = state.inter;
    el.startInter.addEventListener('change', function () {
      state.inter = el.startInter.checked;
      syncVersions();
      save();
      if (!el.readerView.hidden) render();
    });

    el.startDark.checked = document.body.classList.contains('dark');
    el.startDark.addEventListener('change', function () {
      document.body.classList.toggle('dark', el.startDark.checked);
      save();
    });
  }

  function syncVersions() {
    Array.prototype.forEach.call(
      el.startVersions.querySelectorAll('label'), function (lab) {
        var k = lab.getAttribute('data-v');
        lab.querySelector('input').checked = !!state.on[k];
      });
    Array.prototype.forEach.call(
      el.versionBox.querySelectorAll('label'), function (lab) {
        var k = lab.getAttribute('data-v');
        lab.querySelector('input').checked = !!state.on[k];
        lab.classList.toggle('on', !!state.on[k]);
      });
    el.startInter.checked = state.inter;
    el.interlinearChk.checked = state.inter;
    el.startDark.checked = document.body.classList.contains('dark');
  }

  function showStart() {
    el.readerView.hidden = true;
    el.startView.hidden = false;
    var meta = state.byNo[state.bookNo];
    if (meta) {
      if (meta.no < FIRST_NT) {
        el.otBook.value = meta.no;
        fillChapSelect(el.otChap, meta.nch, true);
        el.otChap.value = state.chap;
      } else {
        el.ntBook.value = meta.no;
        fillChapSelect(el.ntChap, meta.nch, true);
        el.ntChap.value = state.chap;
      }
    }
    syncVersions();
  }

  function showReader(no, chap) {
    el.startView.hidden = true;
    el.readerView.hidden = false;
    go(no, chap);
  }

  /* ---------- 閱讀介面控制列 ---------- */
  function buildReaderControls() {
    var ot = document.createElement('optgroup'); ot.label = '舊約';
    var nt = document.createElement('optgroup'); nt.label = '新約';
    state.index.forEach(function (b) {
      var o = document.createElement('option');
      o.value = b.no;
      o.textContent = b.no + '. ' + b.zh;
      (b.no >= FIRST_NT ? nt : ot).appendChild(o);
    });
    el.bookSelect.appendChild(ot);
    el.bookSelect.appendChild(nt);

    VERSIONS.forEach(function (v) {
      var lab = document.createElement('label');
      lab.setAttribute('data-v', v.key);
      var box = document.createElement('input');
      box.type = 'checkbox';
      box.checked = !!state.on[v.key];
      box.addEventListener('change', function () {
        state.on[v.key] = box.checked;
        syncVersions();
        save();
        render();
      });
      lab.appendChild(box);
      lab.appendChild(document.createTextNode(v.label));
      lab.classList.toggle('on', box.checked);
      el.versionBox.appendChild(lab);
    });

    el.interlinearChk.checked = state.inter;
    el.interlinearChk.addEventListener('change', function () {
      state.inter = el.interlinearChk.checked;
      syncVersions();
      save();
      render();
    });

    el.bookSelect.addEventListener('change', function () {
      go(parseInt(el.bookSelect.value, 10), 1);
    });
    el.chapSelect.addEventListener('change', function () {
      go(state.bookNo, parseInt(el.chapSelect.value, 10));
    });

    document.getElementById('homeBtn').addEventListener('click', showStart);
    document.getElementById('prevBtn').addEventListener('click', function () { step(-1); });
    document.getElementById('nextBtn').addEventListener('click', function () { step(1); });
    document.getElementById('fontUp').addEventListener('click', function () { bump(1); });
    document.getElementById('fontDown').addEventListener('click', function () { bump(-1); });
    document.getElementById('themeBtn').addEventListener('click', function () {
      document.body.classList.toggle('dark');
      syncVersions();
      save();
    });
    document.getElementById('strongClose').addEventListener('click', clearStrong);

    document.addEventListener('keydown', function (e) {
      if (el.readerView.hidden) return;
      if (e.target && /^(INPUT|SELECT|TEXTAREA)$/.test(e.target.tagName)) return;
      if (e.key === 'ArrowLeft') step(-1);
      else if (e.key === 'ArrowRight') step(1);
      else if (e.key === 'Escape') clearStrong();
    });
  }

  function bump(dir) {
    state.size = Math.max(13, Math.min(34, state.size + dir));
    applySize();
    save();
  }

  function applySize() {
    document.documentElement.style.setProperty('--reading-size', state.size + 'px');
  }

  /* ---------- 導覽 ---------- */
  function step(dir) {
    var meta = state.byNo[state.bookNo];
    if (!meta) return;
    var c = state.chap + dir;
    if (c >= 1 && c <= meta.nch) { go(state.bookNo, c); return; }

    var nextMeta = state.byNo[state.bookNo + dir];   // 跨卷
    if (!nextMeta) return;
    go(nextMeta.no, dir > 0 ? 1 : nextMeta.nch);
  }

  function go(no, chap) {
    state.bookNo = no;
    state.chap = chap;
    state.strong = null;
    el.strongPanel.hidden = true;
    el.bookSelect.value = no;
    fillChapSelect(el.chapSelect, state.byNo[no].nch, false);
    el.chapSelect.value = chap;
    save();

    if (state.cache[no]) { render(); return; }
    el.reader.innerHTML = '<p class="placeholder">載入 ' + state.byNo[no].zh + ' …</p>';
    loadBook(no, function (data) {
      if (!data) {
        el.reader.innerHTML = '<p class="placeholder">載入失敗：找不到 ' +
          bookFile(no) + '<br>請先執行 scripts/parse.py 產生資料。</p>';
        return;
      }
      render();
    });
  }

  /* ---------- 繪製 ---------- */
  function activeVersions() {
    return VERSIONS.filter(function (v) { return state.on[v.key]; });
  }

  function render() {
    var data = state.cache[state.bookNo];
    if (!data) return;

    var chapter = null;
    for (var i = 0; i < data.ch.length; i++) {
      if (data.ch[i].c === state.chap) { chapter = data.ch[i]; break; }
    }

    var cols = activeVersions();
    el.reader.innerHTML = '';

    var head = document.createElement('div');
    head.className = 'chapter-head';
    head.innerHTML = '<div class="bk"></div><div class="ch"></div>';
    head.querySelector('.bk').textContent = data.zh + ' 第 ' + state.chap + ' 章';
    head.querySelector('.ch').textContent = data.en + ' ' + state.chap +
      '　·　' + (data.t === 'NT' ? '新約' : '舊約');
    el.reader.appendChild(head);

    if (!cols.length) { el.reader.appendChild(msg('請至少勾選一個版本。')); return; }
    if (!chapter || !chapter.v.length) { el.reader.appendChild(msg('本章尚無資料。')); return; }

    var tmpl = 'repeat(' + cols.length + ', minmax(0, 1fr))';

    var ch = document.createElement('div');
    ch.className = 'colhead';
    ch.style.gridTemplateColumns = tmpl;
    cols.forEach(function (v) {
      var d = document.createElement('div');
      d.textContent = v.label;
      ch.appendChild(d);
    });
    el.reader.appendChild(ch);

    chapter.v.forEach(function (verse) {
      var row = document.createElement('div');
      row.className = 'verse' + (verse.p ? ' para' : '');
      row.style.gridTemplateColumns = tmpl;
      cols.forEach(function (v) { row.appendChild(cell(verse, v)); });
      el.reader.appendChild(row);
    });

    if (state.strong) paintStrong();
  }

  function msg(text) {
    var p = document.createElement('p');
    p.className = 'placeholder';
    p.textContent = text;
    return p;
  }

  function cell(verse, v) {
    var d = document.createElement('div');
    d.className = 'cell';
    d.setAttribute('data-label', v.label);

    var text = verse.t ? verse.t[v.key] : null;
    var units = verse.w ? verse.w[v.key] : null;

    if (text === undefined || text === null) {
      d.className += ' empty';    // 該版本沒有這一節（如約三 KJV 只有 14 節）
      return d;
    }

    var num = document.createElement('span');
    num.className = 'vn';
    num.textContent = verse.s;
    d.appendChild(num);

    if (state.inter && units && units.length) {
      var wrap = document.createElement('span');
      wrap.className = 'interlinear';
      units.forEach(function (u) { wrap.appendChild(unitNode(u)); });
      d.appendChild(wrap);
    } else {
      d.appendChild(document.createTextNode(text));
    }

    if (verse.n && verse.n[v.key]) {
      verse.n[v.key].forEach(function (n) {
        var s = document.createElement('span');
        s.className = 'note';
        s.textContent = '註：' + n;
        d.appendChild(s);
      });
    }
    return d;
  }

  function unitNode(u) {
    var span = document.createElement('span');
    span.className = 'unit' + (u.i ? ' italic' : '');

    var w = document.createElement('span');
    w.className = 'u-w';
    w.textContent = u.w;
    span.appendChild(w);

    if (u.s && u.s.length) {
      span.className += ' has-strong';
      span.setAttribute('data-s', u.s.join(' '));

      var s = document.createElement('span');
      s.className = 'u-s';
      s.textContent = u.s.join('/');
      span.appendChild(s);

      if (u.m && u.m.length) {
        var m = document.createElement('span');
        m.className = 'u-m';
        m.textContent = u.m.join('/');
        span.appendChild(m);
      }
      span.addEventListener('click', function () { showStrong(u.s[0], u); });
    }
    return span;
  }

  /* ---------- Strong 高亮 ---------- */
  function showStrong(code, unit) {
    state.strong = code;
    el.strongNum.textContent = code;
    el.strongMeta.textContent = (code.charAt(0) === 'H' ? '希伯來文' : '希臘文') +
      ' Strong' + (unit && unit.m && unit.m.length ? '　文法 ' + unit.m.join('/') : '');
    el.strongPanel.hidden = false;
    paintStrong();
  }

  function clearStrong() {
    state.strong = null;
    el.strongPanel.hidden = true;
    Array.prototype.forEach.call(el.reader.querySelectorAll('.unit.hit'),
      function (n) { n.classList.remove('hit'); });
  }

  function paintStrong() {
    var hitsByVersion = {};
    var cols = activeVersions();

    Array.prototype.forEach.call(el.reader.querySelectorAll('.unit'),
      function (n) { n.classList.remove('hit'); });

    Array.prototype.forEach.call(el.reader.querySelectorAll('.verse'), function (row) {
      Array.prototype.forEach.call(row.children, function (cellNode, idx) {
        var v = cols[idx];
        if (!v) return;
        Array.prototype.forEach.call(cellNode.querySelectorAll('.unit'), function (n) {
          if ((n.getAttribute('data-s') || '').split(' ').indexOf(state.strong) !== -1) {
            n.classList.add('hit');
            hitsByVersion[v.label] = (hitsByVersion[v.label] || 0) + 1;
          }
        });
      });
    });

    var parts = Object.keys(hitsByVersion).map(function (k) {
      return k + ' <b>' + hitsByVersion[k] + '</b> 處';
    });
    el.strongHits.innerHTML = parts.length
      ? '本章出現：' + parts.join('、')
      : (state.inter ? '本章其他版本未標此號。' : '切到「逐字對照」才會顯示高亮。');
  }

  /* ---------- 啟動守門：資料沒載進來時給出可行動的訊息 ----------
   * 用 file:// 開啟時，若瀏覽器（例如某些 Firefox 設定）連 <script src> 都擋，
   * 畫面會停在空的下拉選單。與其靜靜壞掉，不如直接說明怎麼辦。
   */
  function guard() {
    if (state.index.length) return;
    var box = document.getElementById('startView');
    if (!box) return;
    var warn = document.createElement('div');
    warn.className = 'start-card';
    warn.style.borderColor = '#c0392b';
    warn.innerHTML =
      '<b>載入不到經文資料</b><br><br>' +
      '請確認 <code>app/data/</code> 底下有 <code>books.js</code> 與 66 個卷檔；' +
      '若沒有，請先執行：<br><code>python scripts/parse.py</code><br><br>' +
      '若檔案存在但仍看到這則訊息，代表你的瀏覽器擋掉了 file:// 的指令碼載入。' +
      '改用本機伺服器開啟即可：<br>' +
      '<code>python -m http.server 8777 --directory app</code><br>' +
      '然後開 <code>http://localhost:8777</code>';
    box.appendChild(warn);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { setTimeout(guard, 1200); });
  } else {
    setTimeout(guard, 1200);
  }

  return { books: books, receive: receive };
})();
