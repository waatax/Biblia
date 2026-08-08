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

  /* 原文置首，其後沿用藍圖的 中 | 西 | 英 */
  var VERSIONS = [
    { key: 'he_wlc', label: '原文', full: '希伯來文原文 WLC（僅舊約）',
      strong: true, otonly: true, rtl: true },
    { key: 'gr_wh', label: '原文', full: '希臘文原文 Westcott-Hort（僅新約）',
      strong: true, ntonly: true, greek: true },
    { key: 'zh_unv', label: '和合本', full: '和合本 (1919)', strong: true },
    { key: 'es_rvr1909', label: 'RVR1909', full: 'Reina-Valera 1909', strong: false },
    { key: 'es_rvc', label: 'RVC', full: 'Reina Valera Contemporánea', strong: false },
    { key: 'fr_nbs', label: 'NBS', full: 'Nouvelle Bible Segond (法文)', strong: false },
    { key: 'ja_jp', label: '日語', full: '日語聖經 (口語訳)', strong: false },
    { key: 'ko_kor', label: '韓語', full: '韓語聖經 (개역한글)', strong: false },
    { key: 'vi_vie', label: '越南語', full: '越南聖經 (Kinh Thánh)', strong: false },
    { key: 'en_kjv', label: 'KJV', full: 'King James Version', strong: true },
    { key: 'en_web', label: 'WEB', full: 'World English Bible', strong: false }
  ];

  var DEFAULTS = { he_wlc: true, gr_wh: true, zh_unv: true,
                   es_rvr1909: true, es_rvc: false,
                   fr_nbs: false, ja_jp: false, ko_kor: false, vi_vie: false,
                   en_kjv: true, en_web: false };
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

  var searchIndexData = null;
  var searchState = {
    results: [],
    page: 0,
    pageSize: 25,
    query: '',
    tokens: [],
    version: 'zh_unv',
    scope: 'all'
  };

  function searchIndex(data) {
    searchIndexData = data;
  }

  /* ---------- Strong 原文字典 ----------
   * 1.4 萬筆、數 MB，所以不放進首頁載入路徑，
   * 改成「第一次點到 Strong 號碼」時才注入 <script> 延遲載入。
   */
  /* 依語言分成 H／G 兩份，只載入實際點到的那一種 */
  var strongDictData = { H: null, G: null };
  var strongDictState = { H: 'idle', G: 'idle' };   // idle|loading|ready|failed
  var strongDictWaiting = { H: [], G: [] };

  function strongDict(lang, data) {   // 由 data/strong_dict_<lang>.js 呼叫
    strongDictData[lang] = data;
    strongDictState[lang] = 'ready';
    var waiting = strongDictWaiting[lang];
    strongDictWaiting[lang] = [];
    waiting.forEach(function (fn) { fn(); });
  }

  function dictEntry(code) {
    var lang = code.charAt(0);
    var bag = strongDictData[lang];
    return bag ? bag[code] : null;
  }

  function ensureStrongDict(code, cb) {
    var lang = code.charAt(0) === 'H' ? 'H' : 'G';
    if (strongDictState[lang] === 'ready' || strongDictState[lang] === 'failed') {
      cb(); return;
    }
    strongDictWaiting[lang].push(cb);
    if (strongDictState[lang] === 'loading') return;

    strongDictState[lang] = 'loading';
    var s = document.createElement('script');
    s.src = 'data/strong_dict_' + lang + '.js';
    s.charset = 'utf-8';
    s.onerror = function () {
      strongDictState[lang] = 'failed';
      var waiting = strongDictWaiting[lang];
      strongDictWaiting[lang] = [];
      waiting.forEach(function (fn) { fn(); });
    };
    document.head.appendChild(s);
  }

  function setDarkMode(isDark) {
    document.body.classList.toggle('dark', !!isDark);
    document.documentElement.classList.toggle('dark', !!isDark);
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
    if (saved && saved.dark) setDarkMode(true);
    if (!state.byNo[state.bookNo]) { state.bookNo = 1; state.chap = 1; }

    cacheEls();
    buildStart();
    buildReaderControls();
    buildSearchControls();
    buildPlanUI();
    applySize();
    showStart();
  }

  function cacheEls() {
    [
      'startView', 'readerView', 'planView', 'otBook', 'otChap', 'ntBook', 'ntChap',
      'startVersions', 'startInter', 'startDark', 'bookSelect', 'chapSelect',
      'reader', 'versionBox', 'interlinearChk', 'strongPanel', 'strongNum',
      'strongMeta', 'strongHits', 'strongOrig', 'strongDict', 'strongSearchBtn',
      'strongEngBtn', 'startSearchBtn', 'searchBarBtn', 'searchModal',
      'searchOverlay', 'searchInput', 'searchExecBtn', 'searchCloseBtn',
      'searchVersionSelect', 'searchScopeSelect', 'searchSummary', 'searchResults',
      'searchFoot', 'searchMoreBtn', 'startPlanBtn', 'readerPlanBtn', 'planHomeBtn',
      'planReaderBtn', 'planJumpTodayBtn', 'planThemeBtn', 'planStatsPercent',
      'planProgressFill', 'planStatsCount', 'planMarkTodayBtn', 'planMonthTabs',
      'planWeekSelect', 'planSearchInput', 'planList', 'startPlanTodayBox'
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
      setDarkMode(el.startDark.checked);
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
    if (el.planView) el.planView.hidden = true;
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
    renderStartPlanCard();
  }

  function showReader(no, chap, cb) {
    el.startView.hidden = true;
    if (el.planView) el.planView.hidden = true;
    el.readerView.hidden = false;
    go(no, chap, cb);
  }

  function showPlan() {
    el.startView.hidden = true;
    el.readerView.hidden = true;
    if (el.planView) el.planView.hidden = false;
    renderPlan();
  }

  /* ---------- 教會讀經計畫（2026第三季） ---------- */
  var planCompleted = loadPlanProgress();
  var planFilterState = { month: 'all', week: 'all', query: '' };

  function loadPlanProgress() {
    try {
      var raw = localStorage.getItem('biblia_q3_progress');
      return raw ? JSON.parse(raw) : {};
    } catch (e) { return {}; }
  }

  function savePlanProgress() {
    try {
      localStorage.setItem('biblia_q3_progress', JSON.stringify(planCompleted));
    } catch (e) {}
  }

  function getTodayPlanItem() {
    if (!window.BIBLIA_PLAN_2026_Q3 || !window.BIBLIA_PLAN_2026_Q3.items) return null;
    var items = window.BIBLIA_PLAN_2026_Q3.items;
    var now = new Date();
    var m = now.getMonth() + 1;
    var d = now.getDate();
    var dateStr = m + '/' + d;

    var match = items.find(function(it) { return it.date === dateStr; });
    return match || items[0];
  }

  function buildPlanUI() {
    if (!el.planView) return;

    // 填入週次選單
    if (el.planWeekSelect) {
      el.planWeekSelect.innerHTML = '<option value="all">所有週次 (27~40)</option>';
      for (var w = 27; w <= 40; w++) {
        var opt = document.createElement('option');
        opt.value = w;
        opt.textContent = '第 ' + w + ' 週';
        el.planWeekSelect.appendChild(opt);
      }
      el.planWeekSelect.addEventListener('change', function() {
        planFilterState.week = el.planWeekSelect.value;
        renderPlan();
      });
    }

    // 月份頁籤點擊
    if (el.planMonthTabs) {
      var tabs = el.planMonthTabs.querySelectorAll('.plan-tab');
      Array.prototype.forEach.call(tabs, function(tab) {
        tab.addEventListener('click', function() {
          Array.prototype.forEach.call(tabs, function(t) { t.classList.remove('active'); });
          tab.classList.add('active');
          planFilterState.month = tab.getAttribute('data-month');
          renderPlan();
        });
      });
    }

    // 搜尋功能
    if (el.planSearchInput) {
      el.planSearchInput.addEventListener('input', function() {
        planFilterState.query = el.planSearchInput.value.trim().toLowerCase();
        renderPlan();
      });
    }

    // 按鈕事件綁定
    if (el.startPlanBtn) el.startPlanBtn.addEventListener('click', showPlan);
    if (el.readerPlanBtn) el.readerPlanBtn.addEventListener('click', showPlan);
    if (el.planHomeBtn) el.planHomeBtn.addEventListener('click', showStart);
    if (el.planReaderBtn) el.planReaderBtn.addEventListener('click', function() {
      showReader(state.bookNo, state.chap);
    });

    if (el.planThemeBtn) {
      el.planThemeBtn.addEventListener('click', function() {
        setDarkMode(!document.body.classList.contains('dark'));
        syncVersions();
        save();
      });
    }

    if (el.planJumpTodayBtn) {
      el.planJumpTodayBtn.addEventListener('click', function() {
        var todayItem = getTodayPlanItem();
        if (todayItem) {
          planFilterState.month = 'all';
          planFilterState.week = 'all';
          planFilterState.query = '';
          if (el.planWeekSelect) el.planWeekSelect.value = 'all';
          if (el.planSearchInput) el.planSearchInput.value = '';
          if (el.planMonthTabs) {
            var tabs = el.planMonthTabs.querySelectorAll('.plan-tab');
            Array.prototype.forEach.call(tabs, function(t) {
              t.classList.toggle('active', t.getAttribute('data-month') === 'all');
            });
          }
          renderPlan(function() {
            var card = el.planList.querySelector('.plan-card[data-id="' + todayItem.id + '"]');
            if (card) {
              card.scrollIntoView({ behavior: 'smooth', block: 'center' });
              card.classList.add('today-highlight');
              setTimeout(function() { card.classList.remove('today-highlight'); }, 2000);
            }
          });
        }
      });
    }

    if (el.planMarkTodayBtn) {
      el.planMarkTodayBtn.addEventListener('click', function() {
        var todayItem = getTodayPlanItem();
        if (todayItem) {
          planCompleted[todayItem.id] = !planCompleted[todayItem.id];
          savePlanProgress();
          renderPlan();
          renderStartPlanCard();
        }
      });
    }

    renderStartPlanCard();
  }

  function renderStartPlanCard() {
    if (!el.startPlanTodayBox) return;
    var todayItem = getTodayPlanItem();
    if (!todayItem) return;

    var isDone = !!planCompleted[todayItem.id];
    var html = '<div class="today-summary-row">';
    html += '<div>';
    html += '<span class="today-tag">今日進度</span> ';
    html += '<span class="today-date-str">第 ' + todayItem.week + ' 週 ・ ' + todayItem.date + '</span>';
    html += '</div>';
    html += '<div>';
    if (isDone) {
      html += '<span style="color:#27ae60; font-weight:700; font-size:13px;">✓ 今日已完成</span>';
    } else {
      html += '<span style="color:var(--fg-dim); font-size:13px;">未完成</span>';
    }
    html += '</div>';
    html += '</div>';

    html += '<div class="passage-chips" style="margin-top: 10px;">';
    todayItem.passages.forEach(function(p) {
      html += '<button type="button" class="passage-chip" data-b="' + p.bookNo + '" data-c="' + p.startChap + '">';
      html += '📖 ' + p.label;
      html += '</button>';
    });
    html += '</div>';

    el.startPlanTodayBox.innerHTML = html;

    var chips = el.startPlanTodayBox.querySelectorAll('.passage-chip');
    Array.prototype.forEach.call(chips, function(chip) {
      chip.addEventListener('click', function() {
        var b = parseInt(chip.getAttribute('data-b'), 10);
        var c = parseInt(chip.getAttribute('data-c'), 10);
        showReader(b, c);
      });
    });
  }

  function renderPlan(cb) {
    if (!el.planList || !window.BIBLIA_PLAN_2026_Q3) return;
    var data = window.BIBLIA_PLAN_2026_Q3;
    var items = data.items;
    var todayItem = getTodayPlanItem();

    var totalCount = items.length;
    var completedCount = 0;
    items.forEach(function(it) {
      if (planCompleted[it.id]) completedCount++;
    });
    var pct = Math.round((completedCount / totalCount) * 100);

    if (el.planStatsPercent) el.planStatsPercent.textContent = pct + '%';
    if (el.planProgressFill) el.planProgressFill.style.width = pct + '%';
    if (el.planStatsCount) el.planStatsCount.textContent = '已完成 ' + completedCount + ' / ' + totalCount + ' 天';

    if (el.planMarkTodayBtn && todayItem) {
      var isTodayDone = !!planCompleted[todayItem.id];
      el.planMarkTodayBtn.textContent = isTodayDone ? '✓ 今日已完成 (取消)' : '✓ 標記今天已讀';
    }

    var filtered = items.filter(function(it) {
      if (planFilterState.month !== 'all' && it.month !== parseInt(planFilterState.month, 10)) {
        return false;
      }
      if (planFilterState.week !== 'all' && it.week !== parseInt(planFilterState.week, 10)) {
        return false;
      }
      if (planFilterState.query) {
        var q = planFilterState.query;
        var matchDate = it.date.toLowerCase().indexOf(q) !== -1;
        var matchRaw = it.rawText.toLowerCase().indexOf(q) !== -1;
        var matchPassage = it.passages.some(function(p) {
          return p.label.toLowerCase().indexOf(q) !== -1 || p.fullLabel.toLowerCase().indexOf(q) !== -1;
        });
        if (!matchDate && !matchRaw && !matchPassage) return false;
      }
      return true;
    });

    if (!filtered.length) {
      el.planList.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--fg-dim);">沒有符合條件的讀經進度</div>';
      if (cb) cb();
      return;
    }

    var html = '';
    filtered.forEach(function(it) {
      var isToday = todayItem && todayItem.id === it.id;
      var isDone = !!planCompleted[it.id];
      var cardCls = 'plan-card' + (isToday ? ' today' : '') + (isDone ? ' completed' : '');

      html += '<div class="' + cardCls + '" data-id="' + it.id + '">';
      
      html += '<div class="plan-card-top">';
      html += '<div class="plan-card-date-wrap">';
      html += '<span class="plan-card-week">第 ' + it.week + ' 週</span>';
      html += '<span class="plan-card-date">' + it.date + '</span>';
      if (isToday) html += '<span class="plan-card-today-badge">今天</span>';
      html += '</div>';

      html += '<label class="plan-card-check">';
      html += '<input type="checkbox" class="plan-check-box" data-id="' + it.id + '"' + (isDone ? ' checked' : '') + '>';
      html += '<span>' + (isDone ? '已完成' : '勾選完成') + '</span>';
      html += '</label>';
      html += '</div>';

      html += '<div class="plan-card-body">';
      html += '<div class="passage-chips">';
      it.passages.forEach(function(p) {
        html += '<button type="button" class="passage-chip" data-b="' + p.bookNo + '" data-c="' + p.startChap + '" title="點擊閱讀 ' + p.fullLabel + '">';
        html += '📖 ' + p.label;
        html += '</button>';
      });
      html += '</div>';
      html += '</div>';

      html += '</div>';
    });

    el.planList.innerHTML = html;

    var chips = el.planList.querySelectorAll('.passage-chip');
    Array.prototype.forEach.call(chips, function(chip) {
      chip.addEventListener('click', function() {
        var b = parseInt(chip.getAttribute('data-b'), 10);
        var c = parseInt(chip.getAttribute('data-c'), 10);
        showReader(b, c);
      });
    });

    var boxes = el.planList.querySelectorAll('.plan-check-box');
    Array.prototype.forEach.call(boxes, function(box) {
      box.addEventListener('change', function() {
        var id = box.getAttribute('data-id');
        planCompleted[id] = box.checked;
        savePlanProgress();
        renderPlan();
        renderStartPlanCard();
      });
    });

    if (cb) cb();
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
      setDarkMode(!document.body.classList.contains('dark'));
      syncVersions();
      save();
    });
    document.getElementById('strongClose').addEventListener('click', clearStrong);
    if (el.strongSearchBtn) {
      el.strongSearchBtn.addEventListener('click', searchCurrentStrong);
    }
    if (el.strongEngBtn) {
      el.strongEngBtn.addEventListener('click', toggleDictLang);
    }

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

  function go(no, chap, cb) {
    state.bookNo = no;
    state.chap = chap;
    state.strong = null;
    el.strongPanel.hidden = true;
    el.bookSelect.value = no;
    fillChapSelect(el.chapSelect, state.byNo[no].nch, false);
    el.chapSelect.value = chap;
    save();

    if (state.cache[no]) { render(); if (cb) cb(); return; }
    el.reader.innerHTML = '<p class="placeholder">載入 ' + state.byNo[no].zh + ' …</p>';
    loadBook(no, function (data) {
      if (!data) {
        el.reader.innerHTML = '<p class="placeholder">載入失敗：找不到 ' +
          bookFile(no) + '<br>請先執行 scripts/parse.py 產生資料。</p>';
        return;
      }
      render();
      if (cb) cb();
    });
  }

  /* ---------- 繪製 ---------- */
  function activeVersions() {
    // 只涵蓋舊約的版本（希伯來文原文）在新約整欄都會是空的，直接不顯示，
    // 免得讀新約時多出一欄空白。
    var meta = state.byNo[state.bookNo];
    var isNT = meta ? meta.no >= FIRST_NT : false;
    return VERSIONS.filter(function (v) {
      if (!state.on[v.key]) return false;
      if (v.otonly && isNT) return false;
      if (v.ntonly && !isNT) return false;
      return true;
    });
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
      row.setAttribute('data-sec', verse.s);
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
    d.className = 'cell' + (v.rtl ? ' rtl' : '') + (v.greek ? ' greek' : '');
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

    if (!text) {
      // 節號存在但無內文。多半是版本化差異：
      //   WEB —— 現代校勘本略去的節（如 Acts 8:37），保留節號、無內文。
      //   RVR1909 —— 依希伯來文分章，跨章經文併入前一章末節，章尾以空節補齊。
      // 標示清楚，才不會被誤認為資料缺漏。
      var blank = document.createElement('span');
      blank.className = 'blank';
      blank.textContent = '（此版本本節無內文）';
      blank.title = '這是該譯本的版本化差異，不是資料缺漏。'
                  + '經文可能併入鄰近章節，或為現代校勘本所略去。';
      d.appendChild(blank);
    } else if (state.inter && units && units.length) {
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

  /* ---------- Strong 高亮與釋義 ---------- */
  function showStrong(code, unit) {
    state.strong = code;
    el.strongNum.textContent = code;
    el.strongMeta.textContent = (code.charAt(0) === 'H' ? '希伯來文' : '希臘文') +
      ' Strong' + (unit && unit.m && unit.m.length ? '　文法 ' + unit.m.join('/') : '');
    el.strongOrig.textContent = '';
    el.strongDict.textContent = '載入釋義中…';
    el.strongDict.className = 'strong-dict loading';
    el.strongEngBtn.hidden = true;
    el.strongPanel.hidden = false;
    paintStrong();

    ensureStrongDict(code, function () { renderDict(code); });
  }

  function renderDict(code) {
    if (state.strong !== code) return;         // 使用者已改點別的字

    var lang = code.charAt(0) === 'H' ? 'H' : 'G';
    if (strongDictState[lang] !== 'ready') {
      el.strongDict.className = 'strong-dict muted';
      el.strongDict.textContent =
        '尚無字典資料。請執行 scripts/fetch_strong_dict.py 與 build_strong_dict.py。';
      return;
    }
    var entry = dictEntry(code);
    if (!entry) {
      // 可能是上游真的沒有這個號碼，也可能是字典還沒下載完整 —— 兩者要講清楚，
      // 不要讓「還沒抓到」看起來像「查無此字」。
      el.strongDict.className = 'strong-dict muted';
      el.strongDict.textContent =
        '此號碼尚無釋義資料。若字典尚未下載完整，請執行 '
        + 'scripts/fetch_strong_dict.py 後再跑 build_strong_dict.py。';
      return;
    }

    el.strongOrig.textContent = entry.o || '';
    el.strongDict.className = 'strong-dict';
    el.strongDict.textContent = entry.z || entry.e || '';

    // 有英文釋義才給切換鈕
    if (entry.e && entry.z) {
      el.strongEngBtn.hidden = false;
      el.strongEngBtn.textContent = '顯示英文釋義';
      el.strongEngBtn.setAttribute('data-mode', 'zh');
    } else {
      el.strongEngBtn.hidden = true;
    }
  }

  function toggleDictLang() {
    var entry = state.strong ? dictEntry(state.strong) : null;
    if (!entry) return;
    var mode = el.strongEngBtn.getAttribute('data-mode') === 'zh' ? 'en' : 'zh';
    el.strongEngBtn.setAttribute('data-mode', mode);
    el.strongDict.textContent = mode === 'en' ? entry.e : entry.z;
    el.strongEngBtn.textContent = mode === 'en' ? '顯示中文釋義' : '顯示英文釋義';
  }

  /* 從 Strong 面板直接跳到搜尋，並鎖定 Strong 號碼模式 */
  function searchCurrentStrong() {
    if (!state.strong) return;
    if (el.searchVersionSelect) el.searchVersionSelect.value = 'strong';
    openSearchModal(state.strong);
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

  /* ---------- 搜尋系統引擎 ---------- */
  function buildSearchControls() {
    if (el.startSearchBtn) {
      el.startSearchBtn.addEventListener('click', function () { openSearchModal(''); });
    }
    if (el.searchBarBtn) {
      el.searchBarBtn.addEventListener('click', function () { openSearchModal(''); });
    }
    if (el.searchCloseBtn) {
      el.searchCloseBtn.addEventListener('click', closeSearchModal);
    }
    if (el.searchOverlay) {
      el.searchOverlay.addEventListener('click', closeSearchModal);
    }
    if (el.searchExecBtn) {
      el.searchExecBtn.addEventListener('click', function () { runSearch(); });
    }
    if (el.searchInput) {
      el.searchInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') runSearch();
        if (e.key === 'Escape') closeSearchModal();
      });
    }
    if (el.searchMoreBtn) {
      el.searchMoreBtn.addEventListener('click', renderNextBatch);
    }
    if (el.searchVersionSelect) {
      el.searchVersionSelect.addEventListener('change', function () { runSearch(); });
    }
    if (el.searchScopeSelect) {
      el.searchScopeSelect.addEventListener('change', function () { runSearch(); });
    }
  }

  function openSearchModal(initialQuery) {
    el.searchModal.hidden = false;
    if (initialQuery !== undefined && initialQuery !== '') el.searchInput.value = initialQuery;
    el.searchInput.focus();
    if (el.searchInput.value.trim()) runSearch();
  }

  function closeSearchModal() {
    el.searchModal.hidden = true;
  }

  function filterBooksByScope(scope) {
    if (scope === 'ot') return state.index.filter(function (b) { return b.no < FIRST_NT; });
    if (scope === 'nt') return state.index.filter(function (b) { return b.no >= FIRST_NT; });
    if (scope === 'current') return state.index.filter(function (b) { return b.no === state.bookNo; });
    return state.index;
  }

  function runSearch() {
    var rawQ = (el.searchInput.value || '').trim();
    if (!rawQ) {
      el.searchSummary.textContent = '請輸入關鍵字或 Strong 號碼進行搜尋';
      el.searchResults.innerHTML = '';
      el.searchFoot.hidden = true;
      return;
    }

    var targetVersion = el.searchVersionSelect.value;
    var targetScope = el.searchScopeSelect.value;
    var isStrongMatch = /^[HG]\d+[a-zA-Z]?$/i.test(rawQ) || targetVersion === 'strong';

    searchState.query = rawQ;
    searchState.tokens = rawQ.toLowerCase().split(/\s+/).filter(Boolean);
    searchState.version = targetVersion;
    searchState.scope = targetScope;
    searchState.results = [];
    searchState.page = 0;

    el.searchSummary.textContent = '搜尋中…';
    el.searchResults.innerHTML = '';
    el.searchFoot.hidden = true;

    if (isStrongMatch && searchIndexData && searchIndexData.strong) {
      var code = rawQ.toUpperCase();
      var hits = searchIndexData.strong[code] || [];
      if (!hits.length && !code.startsWith('H') && !code.startsWith('G')) {
        hits = (searchIndexData.strong['H' + code] || []).concat(searchIndexData.strong['G' + code] || []);
      }
      var scopedBookNos = {};
      filterBooksByScope(targetScope).forEach(function (b) { scopedBookNos[b.no] = true; });

      var matchedRefs = hits.filter(function (ref) { return scopedBookNos[ref[0]]; });
      searchState.results = matchedRefs.map(function (ref) {
        return { bookNo: ref[0], chap: ref[1], sec: ref[2], vkey: 'zh_unv', isStrong: true, code: code };
      });
      finishSearchRender();
    } else {
      var allowedBooks = filterBooksByScope(targetScope);
      var countLoaded = 0;

      if (!allowedBooks.length) {
        finishSearchRender();
        return;
      }

      allowedBooks.forEach(function (b) {
        loadBook(b.no, function (bookData) {
          countLoaded++;
          if (bookData && bookData.ch) {
            bookData.ch.forEach(function (ch) {
              ch.v.forEach(function (verse) {
                var verseTexts = verse.t || {};
                var checkVersions = (targetVersion === 'all' || targetVersion === 'strong')
                  ? Object.keys(verseTexts)
                  : [targetVersion];

                checkVersions.forEach(function (vkey) {
                  var text = verseTexts[vkey];
                  if (!text) return;
                  var lowerText = text.toLowerCase();
                  var matchAll = searchState.tokens.every(function (t) { return lowerText.indexOf(t) !== -1; });
                  if (matchAll) {
                    searchState.results.push({
                      bookNo: b.no, chap: ch.c, sec: verse.s, vkey: vkey, text: text, tokens: searchState.tokens
                    });
                  }
                });
              });
            });
          }
          if (countLoaded === allowedBooks.length) {
            finishSearchRender();
          }
        });
      });
    }
  }

  function finishSearchRender() {
    var total = searchState.results.length;
    if (!total) {
      el.searchSummary.textContent = '未找到相符的經文結果（關鍵字：「' + searchState.query + '」）';
      el.searchResults.innerHTML = '<p class="placeholder">嘗試更改關鍵字或切換搜尋範圍/版本</p>';
      el.searchFoot.hidden = true;
      return;
    }

    el.searchSummary.textContent = '共找到 ' + total + ' 筆結果（關鍵字：「' + searchState.query + '」）';
    renderNextBatch();
  }

  function renderNextBatch() {
    var start = searchState.page * searchState.pageSize;
    var batch = searchState.results.slice(start, start + searchState.pageSize);
    if (!batch.length) return;

    var frag = document.createDocumentFragment();
    batch.forEach(function (item) {
      var bMeta = state.byNo[item.bookNo];
      var div = document.createElement('div');
      div.className = 'search-item';

      var ref = document.createElement('div');
      ref.className = 'search-ref';
      var vLabel = (VERSIONS.find(function (v) { return v.key === item.vkey; }) || { label: item.vkey }).label;
      ref.textContent = (bMeta ? bMeta.zh : ('第' + item.bookNo + '卷')) + ' ' + item.chap + ':' + item.sec +
        ' (' + vLabel + ')';
      div.appendChild(ref);

      var snip = document.createElement('div');
      snip.className = 'search-snippet';

      if (item.text) {
        var highlighted = escapeHtml(item.text);
        item.tokens.forEach(function (tok) {
          var re = new RegExp('(' + escapeRegExp(tok) + ')', 'gi');
          highlighted = highlighted.replace(re, '<mark>$1</mark>');
        });
        snip.innerHTML = highlighted;
      } else if (item.isStrong) {
        snip.innerHTML = '包含 Strong 號碼 <mark>' + escapeHtml(item.code) + '</mark>';
      }
      div.appendChild(snip);

      div.addEventListener('click', function () {
        closeSearchModal();
        jumpToVerse(item.bookNo, item.chap, item.sec);
      });
      frag.appendChild(div);
    });

    if (searchState.page === 0) el.searchResults.innerHTML = '';
    el.searchResults.appendChild(frag);

    searchState.page++;
    el.searchFoot.hidden = (searchState.page * searchState.pageSize) >= searchState.results.length;
  }

  function escapeHtml(str) {
    return (str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function escapeRegExp(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function jumpToVerse(bookNo, chap, sec) {
    showReader(bookNo, chap, function () {
      setTimeout(function () {
        var row = el.reader.querySelector('.verse[data-sec="' + sec + '"]') ||
                  el.reader.querySelectorAll('.verse')[sec - 1];
        if (row) {
          row.scrollIntoView({ behavior: 'smooth', block: 'center' });
          row.classList.add('target-highlight');
          setTimeout(function () { row.classList.remove('target-highlight'); }, 2600);
        }
      }, 150);
    });
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

  return { books: books, receive: receive, searchIndex: searchIndex,
           strongDict: strongDict, showPlan: showPlan, showStart: showStart,
           showReader: showReader };
})();

