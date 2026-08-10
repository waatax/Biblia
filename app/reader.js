/* Biblia — 多語逐字對照聖經閱讀器
 *
 * 介面沿用信望愛 read100.html 的選擇方式：舊約 / 新約 各自一組
 * 「書卷 → 章 → 閱讀」，另加版本選擇；原站的「背景」選項不做。
 *
 * 資料以 <script src="data/NN_Book.js"> 動態注入載入，而不是 fetch()。
 * 原因：用 file:// 直接開啟時，fetch()/XHR 會被 CORS 擋掉，讀不到本地檔案；
 * <script src> 不受此限。這是「雙擊 index.html 即可用、免架伺服器」的關鍵。
 *
 * 版面策略：欄數不寫死在 CSS，改由 JS 依「容器寬度 ÷ 單欄最小可讀寬度」算出
 * --cols。因為要幾欄取決於使用者勾了幾個版本、字級調多大，不是只看螢幕寬度。
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
    lh: 'normal',       // 'compact' | 'normal' | 'relaxed'
    font: 'serif',      // 'serif' | 'sans' | 'kaiti'
    theme: 'light',     // 'light' | 'sepia' | 'dark' | 'oled'
    largeVn: false,     // boolean
    strong: null
  };

  var el = {};

  /* ---------- 設定持久化（file:// 下可能被擋，故全部包 try） ---------- */
  function save() {
    try {
      localStorage.setItem('biblia', JSON.stringify({
        on: state.on,
        inter: state.inter,
        size: state.size,
        lh: state.lh,
        font: state.font,
        theme: state.theme,
        largeVn: state.largeVn,
        bookNo: state.bookNo,
        chap: state.chap,
        dark: state.theme === 'dark' || state.theme === 'oled',
        tools: document.body.classList.contains('tools-open')
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

  /* ---------- Strong 原文字典 ---------- */
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

  function applyTheme(themeName) {
    state.theme = themeName || 'light';
    ['light', 'sepia', 'dark', 'oled'].forEach(function (t) {
      document.body.classList.toggle(t, state.theme === t);
      document.documentElement.classList.toggle(t, state.theme === t);
    });

    var meta = document.querySelector('meta[name="theme-color"]:not([media])');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'theme-color');
      document.head.appendChild(meta);
    }
    var colors = { light: '#fbfaf7', sepia: '#f7f1e5', dark: '#16181c', oled: '#000000' };
    meta.setAttribute('content', colors[state.theme] || '#fbfaf7');
  }

  function prefersDark() {
    try {
      return window.matchMedia &&
             window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch (e) { return false; }
  }

  function defaultSize() {
    var w = window.innerWidth || 1280;
    if (w >= 2560) return 22;
    if (w >= 1920) return 19;
    if (w <= 600) return 17;
    return 18;
  }

  /* ---------- 進入點：由 data/books.js 呼叫 ---------- */
  function books(list) {
    state.index = list;
    list.forEach(function (b) { state.byNo[b.no] = b; });

    var saved = load();
    state.on = (saved && saved.on) || Object.assign({}, DEFAULTS);
    state.inter = saved ? !!saved.inter : false;
    state.size = (saved && typeof saved.size === 'number') ? saved.size : defaultSize();
    state.lh = (saved && saved.lh) || 'normal';
    state.font = (saved && saved.font) || 'serif';
    state.theme = (saved && saved.theme) ? saved.theme : ((saved && saved.dark) ? 'dark' : (prefersDark() ? 'dark' : 'light'));
    state.largeVn = saved ? !!saved.largeVn : false;

    state.bookNo = (saved && saved.bookNo) || 1;
    state.chap = (saved && saved.chap) || 1;

    // 寬螢幕的 ⚙ 面板是工具列第二排，記住使用者的選擇；
    // 窄螢幕它只是暫時浮出來的下拉，一律從關閉開始，才不會一進頁面就擋住經文。
    document.body.classList.toggle('tools-open',
      (window.innerWidth || 1280) >= 900 &&
      (!saved || typeof saved.tools !== 'boolean' || saved.tools));
    if (!state.byNo[state.bookNo]) { state.bookNo = 1; state.chap = 1; }

    cacheEls();
    buildStart();
    buildReaderControls();
    buildAppearanceControls();
    buildSearchControls();
    buildPlanUI();
    initSwipeGesture();
    observeLayout();
    applyAppearance();
    showStart();
  }

  function cacheEls() {
    [
      'startView', 'readerView', 'planView', 'otBook', 'otChap', 'ntBook', 'ntChap',
      'startVersions', 'startInter', 'startDark', 'bookSelect', 'chapSelect',
      'reader', 'readerBar', 'versionBox', 'interlinearChk', 'strongPanel', 'strongOverlay',
      'strongNum', 'strongMeta', 'strongHits', 'strongOrig', 'strongDict',
      'strongSearchBtn', 'strongEngBtn', 'startSearchBtn', 'searchBarBtn',
      'searchModal', 'searchOverlay', 'searchInput', 'searchExecBtn',
      'searchCloseBtn', 'searchVersionSelect', 'searchScopeSelect', 'searchSummary',
      'searchResults', 'searchFoot', 'searchMoreBtn', 'startPlanBtn',
      'readerPlanBtn', 'planHomeBtn', 'planReaderBtn', 'planJumpTodayBtn',
      'planThemeBtn', 'planStatsPercent', 'planProgressFill', 'planProgressBar',
      'planStatsCount', 'planMarkTodayBtn', 'planMonthTabs', 'planWeekSelect',
      'planSearchInput', 'planList', 'startPlanTodayBox', 'startPlanDate',
      'planSwitch', 'planTitle', 'planSubtitle', 'planSource', 'planHeadTitle',
      'toolsBtn', 'barTools', 'sizeVal', 'pager', 'pagerPrev', 'pagerNext', 'pagerLoc',
      'readerAaBtn', 'openAaModalBtn', 'pagerAaBtn', 'appearanceModal', 'appearanceOverlay',
      'appearanceCloseBtn', 'aaSizeText', 'aaFontSlider', 'aaFontDown', 'aaFontUp',
      'aaLhControls', 'aaFontControls', 'aaThemeControls', 'aaInterlinearSwitch', 'aaLargeVnSwitch'
    ].forEach(function (id) { el[id] = document.getElementById(id); });
  }

  /* ---------- 版面度量 ---------- */
  var layoutTimer = 0, lastReaderW = -1, lastBarH = -1;

  function measureLayout() {
    clearTimeout(layoutTimer);
    layoutTimer = 0;

    if (el.readerBar) {
      var h = Math.round(el.readerBar.getBoundingClientRect().height);
      if (h > 0 && h !== lastBarH) {
        lastBarH = h;
        document.documentElement.style.setProperty('--bar-h', h + 'px');
      }
    }
    var w = el.reader ? el.reader.clientWidth : 0;
    if (w !== lastReaderW) { lastReaderW = w; colLayout(); }
  }

  function scheduleLayout() {
    if (layoutTimer) return;
    layoutTimer = setTimeout(measureLayout, 16);
  }

  /* ⚙ 面板開合。窄螢幕它是浮層（不影響工具列高度），寬螢幕是工具列第二排
   * （會改變高度），所以兩種情況都要重量一次 --bar-h。 */
  function setToolsOpen(open) {
    document.body.classList.toggle('tools-open', !!open);
    if (el.toolsBtn) el.toolsBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    measureLayout();
  }

  function observeLayout() {
    if (window.ResizeObserver) {
      var ro = new ResizeObserver(scheduleLayout);
      if (el.readerBar) ro.observe(el.readerBar);
      if (el.reader) ro.observe(el.reader);
    }
    window.addEventListener('resize', scheduleLayout);
    window.addEventListener('orientationchange', scheduleLayout);
    measureLayout();
  }

  /* 依容器寬度與字級決定要排幾欄 */
  function colLayout() {
    if (!el.reader) return;
    var total = activeVersions().length;
    if (!total) return;

    var w = el.reader.clientWidth || document.documentElement.clientWidth || 1280;
    var cssMin = parseInt(getComputedStyle(document.documentElement)
                            .getPropertyValue('--col-min'), 10) || 300;
    var min = Math.round(cssMin * (state.size / 18));
    var gap = w < 600 ? 14 : 24;

    var fit = Math.max(1, Math.floor((w + gap) / (min + gap)));
    if (w < 560) fit = 1;                 // 手機直式一律單欄

    var rows = Math.ceil(total / Math.min(total, fit));
    var n = Math.ceil(total / rows);

    el.reader.style.setProperty('--cols', n);
    el.reader.classList.toggle('wrapped', n < total);
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

    el.startDark.checked = state.theme === 'dark' || state.theme === 'oled';
    el.startDark.addEventListener('change', function () {
      applyTheme(el.startDark.checked ? 'dark' : 'light');
      syncVersions();
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
    if (el.startInter) el.startInter.checked = state.inter;
    if (el.interlinearChk) el.interlinearChk.checked = state.inter;
    if (el.aaInterlinearSwitch) el.aaInterlinearSwitch.checked = state.inter;
    if (el.startDark) el.startDark.checked = state.theme === 'dark' || state.theme === 'oled';
  }

  /* ---------- 檢視切換 ---------- */
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
    window.scrollTo(0, 0);
  }

  function showReader(no, chap, cb) {
    el.startView.hidden = true;
    if (el.planView) el.planView.hidden = true;
    el.readerView.hidden = false;
    measureLayout();
    go(no, chap, cb);
  }

  function showPlan() {
    el.startView.hidden = true;
    el.readerView.hidden = true;
    if (el.planView) el.planView.hidden = false;
    renderPlan();
    window.scrollTo(0, 0);
  }

  /* ===================== 讀經計畫資料與邏輯 ===================== */
  var PLAN_SOURCES = [
    {
      id: 'church_q3_2026',
      name: '教會聖經速讀',
      sub: '2026 第三季',
      get: function () { return window.BIBLIA_PLAN_2026_Q3; },
      note: '教會 2026 年聖經速讀進度表（第三季）'
    },
    {
      id: 'su101_2026',
      name: '每日研經釋義',
      sub: '2026 全年',
      get: function () { return window.BIBLIA_PLAN_SU101_2026; },
      note: ''
    }
  ];

  var WEEKDAY = ['週日', '週一', '週二', '週三', '週四', '週五', '週六'];

  var plans = [];
  var planIdx = 0;
  var planProgress = loadPlanProgress();
  var planFilterState = { month: 'all', week: 'all', query: '' };

  function normalisePlans() {
    plans = [];
    PLAN_SOURCES.forEach(function (src) {
      var raw = src.get();
      if (!raw || !raw.items || !raw.items.length) return;

      var items = raw.items.map(function (it) {
        var iso = it.isoDate;
        var wd = it.wd;
        if (!wd && iso) {
          var parts = iso.split('-');
          wd = WEEKDAY[new Date(+parts[0], +parts[1] - 1, +parts[2]).getDay()];
        }
        return {
          id: it.id,
          isoDate: iso,
          date: it.date,
          month: it.month,
          day: it.day,
          week: it.week,
          wd: wd || '',
          rawText: it.rawText || '',
          passages: it.passages || [],
          link: it.link || ''
        };
      });

      var months = [], weeks = [];
      items.forEach(function (it) {
        if (months.indexOf(it.month) === -1) months.push(it.month);
        if (weeks.indexOf(it.week) === -1) weeks.push(it.week);
      });
      months.sort(function (a, b) { return a - b; });
      weeks.sort(function (a, b) { return a - b; });

      plans.push({
        id: src.id,
        name: src.name,
        sub: src.sub,
        title: raw.title || src.name,
        subtitle: raw.subtitle || '',
        org: raw.org || '',
        sourceUrl: raw.sourceUrl || '',
        note: src.note,
        coverage: raw.coverage || '',
        months: months,
        weeks: weeks,
        items: items
      });
    });

    var savedId = null;
    try { savedId = localStorage.getItem('biblia_plan_id'); } catch (e) {}
    planIdx = 0;
    plans.forEach(function (p, i) { if (p.id === savedId) planIdx = i; });
  }

  function currentPlan() { return plans[planIdx] || null; }

  function loadPlanProgress() {
    var bag = {};
    try {
      var raw = localStorage.getItem('biblia_plan_progress');
      if (raw) bag = JSON.parse(raw) || {};
    } catch (e) { bag = {}; }

    if (!bag.church_q3_2026) {
      try {
        var old = localStorage.getItem('biblia_q3_progress');
        if (old) bag.church_q3_2026 = JSON.parse(old) || {};
      } catch (e) { /* 忽略 */ }
    }
    return bag;
  }

  function savePlanProgress() {
    try {
      localStorage.setItem('biblia_plan_progress', JSON.stringify(planProgress));
    } catch (e) { /* 忽略 */ }
  }

  function progressOf(plan) {
    if (!planProgress[plan.id]) planProgress[plan.id] = {};
    return planProgress[plan.id];
  }

  function todayIso() {
    var d = new Date();
    function pad(n) { return n < 10 ? '0' + n : '' + n; }
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  }

  function todayItemOf(plan) {
    if (!plan) return null;
    var iso = todayIso();
    for (var i = 0; i < plan.items.length; i++) {
      if (plan.items[i].isoDate === iso) return plan.items[i];
    }
    return null;
  }

  /* ---------- 計畫 UI ---------- */
  function buildPlanUI() {
    normalisePlans();
    if (!plans.length) return;

    buildPlanSwitch();

    if (el.planWeekSelect) {
      el.planWeekSelect.addEventListener('change', function () {
        planFilterState.week = el.planWeekSelect.value;
        renderPlan();
      });
    }

    if (el.planSearchInput) {
      el.planSearchInput.addEventListener('input', function () {
        planFilterState.query = el.planSearchInput.value.trim().toLowerCase();
        renderPlan();
      });
    }

    if (el.startPlanBtn) el.startPlanBtn.addEventListener('click', showPlan);
    if (el.readerPlanBtn) el.readerPlanBtn.addEventListener('click', showPlan);
    if (el.planHomeBtn) el.planHomeBtn.addEventListener('click', showStart);
    if (el.planReaderBtn) {
      el.planReaderBtn.addEventListener('click', function () {
        showReader(state.bookNo, state.chap);
      });
    }

    if (el.planThemeBtn) {
      el.planThemeBtn.addEventListener('click', function () {
        var nextTheme = state.theme === 'light' ? 'dark' : (state.theme === 'dark' ? 'sepia' : 'light');
        applyTheme(nextTheme);
        syncVersions();
        save();
      });
    }

    if (el.planJumpTodayBtn) {
      el.planJumpTodayBtn.addEventListener('click', function () {
        var plan = currentPlan();
        var todayItem = todayItemOf(plan);
        if (!todayItem) {
          if (el.planSearchInput) el.planSearchInput.focus();
          return;
        }
        resetPlanFilters();
        renderPlan(function () {
          var card = el.planList.querySelector('.plan-card[data-id="' + todayItem.id + '"]');
          if (!card) return;
          card.scrollIntoView({ behavior: 'smooth', block: 'center' });
          card.classList.add('today-highlight');
          setTimeout(function () { card.classList.remove('today-highlight'); }, 2200);
        });
      });
    }

    if (el.planMarkTodayBtn) {
      el.planMarkTodayBtn.addEventListener('click', function () {
        var plan = currentPlan();
        var todayItem = todayItemOf(plan);
        if (!plan || !todayItem) return;
        var done = progressOf(plan);
        if (done[todayItem.id]) delete done[todayItem.id];
        else done[todayItem.id] = 1;
        savePlanProgress();
        renderPlan();
        renderStartPlanCard();
      });
    }

    applyPlanMeta();
    renderStartPlanCard();
  }

  function resetPlanFilters() {
    planFilterState.month = 'all';
    planFilterState.week = 'all';
    planFilterState.query = '';
    if (el.planWeekSelect) el.planWeekSelect.value = 'all';
    if (el.planSearchInput) el.planSearchInput.value = '';
    if (el.planMonthTabs) {
      Array.prototype.forEach.call(
        el.planMonthTabs.querySelectorAll('.plan-tab'), function (t) {
          t.classList.toggle('active', t.getAttribute('data-month') === 'all');
        });
    }
  }

  function buildPlanSwitch() {
    if (!el.planSwitch) return;
    el.planSwitch.innerHTML = '';
    if (plans.length < 2) { el.planSwitch.hidden = true; return; }
    el.planSwitch.hidden = false;

    plans.forEach(function (p, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'plan-switch-btn' + (i === planIdx ? ' active' : '');
      b.setAttribute('role', 'tab');
      b.setAttribute('aria-selected', i === planIdx ? 'true' : 'false');

      var n = document.createElement('span');
      n.className = 'sw-name';
      n.textContent = p.name;
      b.appendChild(n);

      var s = document.createElement('span');
      s.className = 'sw-sub';
      s.textContent = p.sub + '　·　' + p.items.length + ' 天';
      b.appendChild(s);

      b.addEventListener('click', function () {
        if (planIdx === i) return;
        planIdx = i;
        try { localStorage.setItem('biblia_plan_id', p.id); } catch (e) {}
        buildPlanSwitch();
        applyPlanMeta();
        resetPlanFilters();
        renderPlan();
      });
      el.planSwitch.appendChild(b);
    });
  }

  function applyPlanMeta() {
    var plan = currentPlan();
    if (!plan) return;

    if (el.planTitle) el.planTitle.textContent = plan.title;
    if (el.planSubtitle) el.planSubtitle.textContent = plan.subtitle;
    if (el.planHeadTitle) el.planHeadTitle.textContent = plan.name;

    if (el.planSource) {
      el.planSource.innerHTML = '';
      if (plan.org || plan.sourceUrl) {
        el.planSource.appendChild(document.createTextNode('資料來源：' + (plan.org || '')));
        if (plan.sourceUrl) {
          el.planSource.appendChild(document.createTextNode('　'));
          var a = document.createElement('a');
          a.href = plan.sourceUrl;
          a.target = '_blank';
          a.rel = 'noopener noreferrer';
          a.textContent = plan.sourceUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');
          el.planSource.appendChild(a);
        }
        if (plan.coverage) {
          el.planSource.appendChild(document.createElement('br'));
          el.planSource.appendChild(document.createTextNode(
            '已收錄 ' + plan.coverage + '；站方逐日發佈，重跑 scripts/fetch_su101_plan.py 可補上新進度。'));
        }
      } else if (plan.note) {
        el.planSource.textContent = plan.note;
      }
    }

    if (el.planMonthTabs) {
      el.planMonthTabs.innerHTML = '';
      var mk = function (value, text) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'plan-tab' + (value === 'all' ? ' active' : '');
        b.setAttribute('data-month', value);
        b.textContent = text;
        b.addEventListener('click', function () {
          Array.prototype.forEach.call(
            el.planMonthTabs.querySelectorAll('.plan-tab'),
            function (t) { t.classList.remove('active'); });
          b.classList.add('active');
          planFilterState.month = value;
          renderPlan();
        });
        el.planMonthTabs.appendChild(b);
      };
      mk('all', '全部 (' + plan.items.length + '天)');
      plan.months.forEach(function (m) {
        var n = 0;
        plan.items.forEach(function (it) { if (it.month === m) n++; });
        mk(String(m), m + ' 月 (' + n + ')');
      });
    }

    if (el.planWeekSelect) {
      el.planWeekSelect.innerHTML = '';
      var all = document.createElement('option');
      all.value = 'all';
      all.textContent = plan.weeks.length
        ? '所有週次 (' + plan.weeks[0] + '~' + plan.weeks[plan.weeks.length - 1] + ')'
        : '所有週次';
      el.planWeekSelect.appendChild(all);
      plan.weeks.forEach(function (w) {
        var o = document.createElement('option');
        o.value = w;
        o.textContent = '第 ' + w + ' 週';
        el.planWeekSelect.appendChild(o);
      });
    }
  }

  function renderStartPlanCard() {
    if (!el.startPlanTodayBox) return;

    if (el.startPlanDate) {
      var now = new Date();
      el.startPlanDate.textContent =
        now.getFullYear() + '年' + (now.getMonth() + 1) + '月' + now.getDate() + '日　' +
        WEEKDAY[now.getDay()];
    }

    el.startPlanTodayBox.innerHTML = '';
    if (!plans.length) {
      el.startPlanTodayBox.textContent = '尚未載入任何讀經計畫資料。';
      return;
    }

    plans.forEach(function (plan) {
      var item = todayItemOf(plan);
      var done = progressOf(plan);

      var block = document.createElement('div');
      block.className = 'today-block';

      var row = document.createElement('div');
      row.className = 'today-summary-row';

      var name = document.createElement('span');
      name.className = 'today-plan-name';
      var tag = document.createElement('span');
      tag.className = 'today-tag';
      tag.textContent = plan.name;
      name.appendChild(tag);
      name.appendChild(document.createTextNode(
        item ? (item.date + '（' + item.wd + '）') : '今日無進度'));
      row.appendChild(name);

      var st = document.createElement('span');
      st.className = 'today-state' + (item && done[item.id] ? ' done' : '');
      st.textContent = !item ? '—' : (done[item.id] ? '✓ 已完成' : '未完成');
      row.appendChild(st);
      block.appendChild(row);

      var ref = document.createElement('div');
      ref.className = 'today-ref';
      ref.textContent = item ? item.rawText
        : ('今天不在此計畫範圍內' + (plan.coverage ? '（收錄 ' + plan.coverage + '）' : ''));
      block.appendChild(ref);

      if (item && item.passages.length) {
        block.appendChild(passageChips(item.passages));
      }

      el.startPlanTodayBox.appendChild(block);
    });
  }

  function passageChips(passages) {
    var wrap = document.createElement('div');
    wrap.className = 'passage-chips';
    passages.forEach(function (p) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'passage-chip';
      b.textContent = '📖 ' + p.label;
      b.title = '點擊閱讀 ' + p.fullLabel;
      b.addEventListener('click', function () {
        if (p.startVerse) jumpToVerse(p.bookNo, p.startChap, p.startVerse);
        else showReader(p.bookNo, p.startChap);
      });
      wrap.appendChild(b);
    });
    return wrap;
  }

  function renderPlan(cb) {
    var plan = currentPlan();
    if (!el.planList || !plan) return;

    var items = plan.items;
    var done = progressOf(plan);
    var todayItem = todayItemOf(plan);

    var completedCount = 0;
    items.forEach(function (it) { if (done[it.id]) completedCount++; });
    var pct = items.length ? Math.round((completedCount / items.length) * 100) : 0;

    if (el.planStatsPercent) el.planStatsPercent.textContent = pct + '%';
    if (el.planProgressFill) el.planProgressFill.style.width = pct + '%';
    if (el.planProgressBar) el.planProgressBar.setAttribute('aria-valuenow', pct);
    if (el.planStatsCount) {
      el.planStatsCount.textContent = '已完成 ' + completedCount + ' / ' + items.length + ' 天';
    }

    if (el.planMarkTodayBtn) {
      if (!todayItem) {
        el.planMarkTodayBtn.disabled = true;
        el.planMarkTodayBtn.textContent = '今日不在此計畫';
      } else {
        el.planMarkTodayBtn.disabled = false;
        el.planMarkTodayBtn.textContent =
          done[todayItem.id] ? '✓ 今日已完成（取消）' : '✓ 標記今天已讀';
      }
    }
    if (el.planJumpTodayBtn) el.planJumpTodayBtn.disabled = !todayItem;

    var q = planFilterState.query;
    var filtered = items.filter(function (it) {
      if (planFilterState.month !== 'all' && it.month !== parseInt(planFilterState.month, 10)) return false;
      if (planFilterState.week !== 'all' && it.week !== parseInt(planFilterState.week, 10)) return false;
      if (q) {
        var hit = it.date.toLowerCase().indexOf(q) !== -1 ||
                  it.isoDate.indexOf(q) !== -1 ||
                  it.rawText.toLowerCase().indexOf(q) !== -1 ||
                  it.passages.some(function (p) {
                    return p.label.toLowerCase().indexOf(q) !== -1 ||
                           p.fullLabel.toLowerCase().indexOf(q) !== -1;
                  });
        if (!hit) return false;
      }
      return true;
    });

    el.planList.innerHTML = '';

    if (!filtered.length) {
      var empty = document.createElement('div');
      empty.className = 'plan-empty';
      empty.textContent = '沒有符合條件的讀經進度';
      el.planList.appendChild(empty);
      if (cb) cb();
      return;
    }

    var frag = document.createDocumentFragment();
    filtered.forEach(function (it) {
      frag.appendChild(planCard(it, plan, done, todayItem));
    });
    el.planList.appendChild(frag);

    if (cb) cb();
  }

  function planCard(it, plan, done, todayItem) {
    var isToday = !!(todayItem && todayItem.id === it.id);
    var isDone = !!done[it.id];

    var card = document.createElement('div');
    card.className = 'plan-card' + (isToday ? ' today' : '') + (isDone ? ' completed' : '');
    card.setAttribute('data-id', it.id);

    var top = document.createElement('div');
    top.className = 'plan-card-top';

    var dateWrap = document.createElement('div');
    dateWrap.className = 'plan-card-date-wrap';

    var wk = document.createElement('span');
    wk.className = 'plan-card-week';
    wk.textContent = '第 ' + it.week + ' 週';
    dateWrap.appendChild(wk);

    var dt = document.createElement('span');
    dt.className = 'plan-card-date';
    dt.textContent = it.date;
    dateWrap.appendChild(dt);

    if (it.wd) {
      var wd = document.createElement('span');
      wd.className = 'plan-card-wd';
      wd.textContent = it.wd;
      dateWrap.appendChild(wd);
    }

    if (isToday) {
      var badge = document.createElement('span');
      badge.className = 'plan-card-today-badge';
      badge.textContent = '今天';
      dateWrap.appendChild(badge);
    }
    top.appendChild(dateWrap);

    var check = document.createElement('label');
    check.className = 'plan-card-check';
    var box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = isDone;
    box.addEventListener('change', function () {
      if (box.checked) done[it.id] = 1;
      else delete done[it.id];
      savePlanProgress();
      renderPlan();
      renderStartPlanCard();
    });
    check.appendChild(box);
    var checkText = document.createElement('span');
    checkText.textContent = isDone ? '已完成' : '勾選完成';
    check.appendChild(checkText);
    top.appendChild(check);

    card.appendChild(top);

    var body = document.createElement('div');
    body.className = 'plan-card-body';

    var ref = document.createElement('div');
    ref.className = 'plan-card-ref';
    ref.textContent = it.rawText;
    body.appendChild(ref);

    if (it.passages.length) body.appendChild(passageChips(it.passages));

    if (it.link) {
      var a = document.createElement('a');
      a.className = 'plan-card-link';
      a.href = it.link;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.textContent = '看當日釋義 ↗';
      body.appendChild(a);
    }

    card.appendChild(body);
    return card;
  }

  /* ===================== 閱讀排版與外觀設定 (Aa Modal) 控制器 ===================== */
  var appearanceOpener = null;

  function buildAppearanceControls() {
    // 按鈕綁定
    if (el.readerAaBtn) el.readerAaBtn.addEventListener('click', openAppearanceModal);
    if (el.openAaModalBtn) el.openAaModalBtn.addEventListener('click', openAppearanceModal);
    if (el.pagerAaBtn) el.pagerAaBtn.addEventListener('click', openAppearanceModal);
    if (el.appearanceCloseBtn) el.appearanceCloseBtn.addEventListener('click', closeAppearanceModal);
    if (el.appearanceOverlay) el.appearanceOverlay.addEventListener('click', closeAppearanceModal);

    // 字級滑桿與步進
    if (el.aaFontSlider) {
      el.aaFontSlider.addEventListener('input', function () {
        state.size = parseInt(el.aaFontSlider.value, 10);
        updateAaUI();
        applyAppearance();
        save();
      });
    }

    if (el.aaFontDown) {
      el.aaFontDown.addEventListener('click', function () { bump(-1); });
    }
    if (el.aaFontUp) {
      el.aaFontUp.addEventListener('click', function () { bump(1); });
    }

    // 字級一鍵預設選取
    if (el.appearanceModal) {
      Array.prototype.forEach.call(el.appearanceModal.querySelectorAll('.aa-preset-btn'), function (btn) {
        btn.addEventListener('click', function () {
          var sz = parseInt(btn.getAttribute('data-size'), 10);
          if (sz) {
            state.size = sz;
            updateAaUI();
            applyAppearance();
            save();
          }
        });
      });
    }

    // 行距選取
    if (el.aaLhControls) {
      Array.prototype.forEach.call(el.aaLhControls.querySelectorAll('.aa-seg-btn'), function (btn) {
        btn.addEventListener('click', function () {
          state.lh = btn.getAttribute('data-lh') || 'normal';
          updateAaUI();
          applyAppearance();
          save();
        });
      });
    }

    // 字型選取
    if (el.aaFontControls) {
      Array.prototype.forEach.call(el.aaFontControls.querySelectorAll('.aa-seg-btn'), function (btn) {
        btn.addEventListener('click', function () {
          state.font = btn.getAttribute('data-font') || 'serif';
          updateAaUI();
          applyAppearance();
          save();
        });
      });
    }

    // 主題選取
    if (el.aaThemeControls) {
      Array.prototype.forEach.call(el.aaThemeControls.querySelectorAll('.aa-theme-card'), function (card) {
        card.addEventListener('click', function () {
          state.theme = card.getAttribute('data-theme') || 'light';
          updateAaUI();
          applyAppearance();
          syncVersions();
          save();
        });
      });
    }

    // 逐字對照與節號放大切換
    if (el.aaInterlinearSwitch) {
      el.aaInterlinearSwitch.addEventListener('change', function () {
        state.inter = el.aaInterlinearSwitch.checked;
        syncVersions();
        save();
        if (!el.readerView.hidden) render();
      });
    }

    if (el.aaLargeVnSwitch) {
      el.aaLargeVnSwitch.addEventListener('change', function () {
        state.largeVn = el.aaLargeVnSwitch.checked;
        applyAppearance();
        save();
      });
    }
  }

  function openAppearanceModal() {
    appearanceOpener = document.activeElement;
    updateAaUI();
    if (el.appearanceModal) {
      el.appearanceModal.hidden = false;
      document.body.classList.add('appearance-open');
    }
  }

  function closeAppearanceModal() {
    if (el.appearanceModal) {
      el.appearanceModal.hidden = true;
      document.body.classList.remove('appearance-open');
    }
    if (appearanceOpener && appearanceOpener.focus) appearanceOpener.focus();
    appearanceOpener = null;
  }

  function updateAaUI() {
    if (el.aaSizeText) el.aaSizeText.textContent = state.size;
    if (el.aaFontSlider) el.aaFontSlider.value = state.size;
    if (el.sizeVal) el.sizeVal.textContent = state.size;

    // 預設字級高亮
    if (el.appearanceModal) {
      Array.prototype.forEach.call(el.appearanceModal.querySelectorAll('.aa-preset-btn'), function (btn) {
        var sz = parseInt(btn.getAttribute('data-size'), 10);
        btn.classList.toggle('active', sz === state.size);
      });
    }

    // 行距按鈕高亮
    if (el.aaLhControls) {
      Array.prototype.forEach.call(el.aaLhControls.querySelectorAll('.aa-seg-btn'), function (btn) {
        var isAct = btn.getAttribute('data-lh') === state.lh;
        btn.classList.toggle('active', isAct);
        btn.setAttribute('aria-checked', isAct ? 'true' : 'false');
      });
    }

    // 字型按鈕高亮
    if (el.aaFontControls) {
      Array.prototype.forEach.call(el.aaFontControls.querySelectorAll('.aa-seg-btn'), function (btn) {
        var isAct = btn.getAttribute('data-font') === state.font;
        btn.classList.toggle('active', isAct);
        btn.setAttribute('aria-checked', isAct ? 'true' : 'false');
      });
    }

    // 主題卡片高亮
    if (el.aaThemeControls) {
      Array.prototype.forEach.call(el.aaThemeControls.querySelectorAll('.aa-theme-card'), function (card) {
        var isAct = card.getAttribute('data-theme') === state.theme;
        card.classList.toggle('active', isAct);
        card.setAttribute('aria-checked', isAct ? 'true' : 'false');
      });
    }

    if (el.aaInterlinearSwitch) el.aaInterlinearSwitch.checked = state.inter;
    if (el.aaLargeVnSwitch) el.aaLargeVnSwitch.checked = !!state.largeVn;
  }

  function applyAppearance() {
    document.documentElement.style.setProperty('--reading-size', state.size + 'px');
    if (el.sizeVal) el.sizeVal.textContent = state.size;

    // 字型族群
    ['font-serif', 'font-sans', 'font-kaiti'].forEach(function (cls) {
      document.body.classList.remove(cls);
    });
    document.body.classList.add('font-' + (state.font || 'serif'));

    // 行距
    ['lh-compact', 'lh-normal', 'lh-relaxed'].forEach(function (cls) {
      document.body.classList.remove(cls);
    });
    document.body.classList.add('lh-' + (state.lh || 'normal'));

    // 節號醒目放大
    document.body.classList.toggle('large-vn', !!state.largeVn);

    // 主題
    applyTheme(state.theme);

    // 重新佈局
    colLayout();
    measureLayout();
  }

  /* ---------- 手機直式章節滑動手勢引擎 (Swipe Gesture) ---------- */
  function initSwipeGesture() {
    var readerEl = el.reader;
    if (!readerEl) return;

    var startX = 0, startY = 0, startTime = 0, isSwiping = false;

    readerEl.addEventListener('touchstart', function (e) {
      if (e.touches.length !== 1) return;
      var touch = e.touches[0];
      startX = touch.clientX;
      startY = touch.clientY;
      startTime = Date.now();
      isSwiping = true;
    }, { passive: true });

    readerEl.addEventListener('touchmove', function (e) {
      if (!isSwiping || e.touches.length !== 1) return;
      var touch = e.touches[0];
      var dx = touch.clientX - startX;
      var dy = touch.clientY - startY;

      // 若垂直滾動大於水平滑動的 1.2 倍，判定為上下對焦閱讀，不干擾經文垂直滾動
      if (Math.abs(dy) > Math.abs(dx) * 1.2) {
        isSwiping = false;
      }
    }, { passive: true });

    readerEl.addEventListener('touchend', function (e) {
      if (!isSwiping) return;
      isSwiping = false;
      var touch = e.changedTouches[0];
      if (!touch) return;

      var dx = touch.clientX - startX;
      var dy = touch.clientY - startY;
      var duration = Date.now() - startTime;

      // 觸控時間 50ms~600ms，水平位移 >= 55px，且水平位移顯著大於垂直位移 (dx > 1.8 * dy)
      if (duration >= 50 && duration <= 600 && Math.abs(dx) >= 55 && Math.abs(dx) > Math.abs(dy) * 1.8) {
        if (dx < 0) {
          step(1);  // 向左滑 -> 下一章
        } else {
          step(-1); // 向右滑 -> 上一章
        }
      }
    }, { passive: true });
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
      lab.title = v.full;
      var box = document.createElement('input');
      box.type = 'checkbox';
      box.checked = !!state.on[v.key];
      box.setAttribute('aria-label', v.full);
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
      var nextTheme = state.theme === 'light' ? 'dark' : (state.theme === 'dark' ? 'sepia' : 'light');
      applyTheme(nextTheme);
      syncVersions();
      save();
    });
    document.getElementById('strongClose').addEventListener('click', clearStrong);
    if (el.strongOverlay) el.strongOverlay.addEventListener('click', clearStrong);
    if (el.strongSearchBtn) el.strongSearchBtn.addEventListener('click', searchCurrentStrong);
    if (el.strongEngBtn) el.strongEngBtn.addEventListener('click', toggleDictLang);

    if (el.toolsBtn) {
      el.toolsBtn.setAttribute('aria-expanded',
        document.body.classList.contains('tools-open') ? 'true' : 'false');
      el.toolsBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        setToolsOpen(!document.body.classList.contains('tools-open'));
        save();
      });

      // 窄螢幕上 ⚙ 面板是浮在經文上的下拉，點到別處就該收起來
      // （寬螢幕它是工具列的第二排，本來就該一直開著，不要亂關）。
      document.addEventListener('click', function (e) {
        if (!document.body.classList.contains('tools-open')) return;
        if (window.matchMedia && window.matchMedia('(min-width: 900px)').matches) return;
        if (el.barTools && el.barTools.contains(e.target)) return;
        if (el.toolsBtn.contains(e.target)) return;
        setToolsOpen(false);
        save();
      });
    }

    if (el.pagerPrev) el.pagerPrev.addEventListener('click', function () { step(-1); });
    if (el.pagerNext) el.pagerNext.addEventListener('click', function () { step(1); });

    document.addEventListener('keydown', function (e) {
      if (e.target && /^(INPUT|SELECT|TEXTAREA)$/.test(e.target.tagName)) {
        if (e.key === 'Escape' && !el.searchModal.hidden) closeSearchModal();
        if (e.key === 'Escape' && el.appearanceModal && !el.appearanceModal.hidden) closeAppearanceModal();
        return;
      }
      if (e.key === 'Escape') {
        if (!el.searchModal.hidden) { closeSearchModal(); return; }
        if (el.appearanceModal && !el.appearanceModal.hidden) { closeAppearanceModal(); return; }
        clearStrong();
        return;
      }
      if (e.key === '/' && el.searchModal.hidden) {
        e.preventDefault();
        openSearchModal('');
        return;
      }
      if (el.readerView.hidden || !el.searchModal.hidden) return;
      if (e.key === 'ArrowLeft') step(-1);
      else if (e.key === 'ArrowRight') step(1);
    });
  }

  function bump(dir) {
    state.size = Math.max(13, Math.min(34, state.size + dir));
    updateAaUI();
    applyAppearance();
    save();
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
    clearStrong();
    el.bookSelect.value = no;
    fillChapSelect(el.chapSelect, state.byNo[no].nch, false);
    el.chapSelect.value = chap;
    updatePager();
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

  function updatePager() {
    if (!el.pagerLoc) return;
    var meta = state.byNo[state.bookNo];
    if (!meta) return;
    el.pagerLoc.textContent = meta.zh + ' ' + state.chap + ' / ' + meta.nch;

    var atStart = state.chap <= 1 && !state.byNo[state.bookNo - 1];
    var atEnd = state.chap >= meta.nch && !state.byNo[state.bookNo + 1];
    if (el.pagerPrev) el.pagerPrev.disabled = atStart;
    if (el.pagerNext) el.pagerNext.disabled = atEnd;
    document.getElementById('prevBtn').disabled = atStart;
    document.getElementById('nextBtn').disabled = atEnd;
  }

  /* ---------- 繪製 ---------- */
  function activeVersions() {
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
    colLayout();

    var head = document.createElement('div');
    head.className = 'chapter-head';
    head.innerHTML = '<div class="bk"></div><div class="ch"></div>';
    head.querySelector('.bk').textContent = data.zh + ' 第 ' + state.chap + ' 章';
    head.querySelector('.ch').textContent = data.en + ' ' + state.chap +
      '　·　' + (data.t === 'NT' ? '新約' : '舊約');
    el.reader.appendChild(head);

    if (!cols.length) { el.reader.appendChild(msg('請至少勾選一個版本。')); return; }
    if (!chapter || !chapter.v.length) { el.reader.appendChild(msg('本章尚無資料。')); return; }

    var ch = document.createElement('div');
    ch.className = 'colhead';
    cols.forEach(function (v) {
      var d = document.createElement('div');
      d.textContent = v.label;
      ch.appendChild(d);
    });
    el.reader.appendChild(ch);

    var frag = document.createDocumentFragment();
    chapter.v.forEach(function (verse) {
      var row = document.createElement('div');
      row.className = 'verse' + (verse.p ? ' para' : '');
      row.setAttribute('data-sec', verse.s);
      cols.forEach(function (v) { row.appendChild(cell(verse, v)); });
      frag.appendChild(row);
    });
    el.reader.appendChild(frag);

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
      d.className += ' empty';
      return d;
    }

    var num = document.createElement('span');
    num.className = 'vn';
    num.textContent = verse.s;
    d.appendChild(num);

    if (!text) {
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
    if (el.strongOverlay) el.strongOverlay.hidden = false;
    document.body.classList.add('strong-open');
    paintStrong();

    ensureStrongDict(code, function () { renderDict(code); });
  }

  function renderDict(code) {
    if (state.strong !== code) return;

    var lang = code.charAt(0) === 'H' ? 'H' : 'G';
    if (strongDictState[lang] !== 'ready') {
      el.strongDict.className = 'strong-dict muted';
      el.strongDict.textContent =
        '尚無字典資料。請執行 scripts/fetch_strong_dict.py 與 build_strong_dict.py。';
      return;
    }
    var entry = dictEntry(code);
    if (!entry) {
      el.strongDict.className = 'strong-dict muted';
      el.strongDict.textContent =
        '此號碼尚無釋義資料。若字典尚未下載完整，請執行 '
        + 'scripts/fetch_strong_dict.py 後再跑 build_strong_dict.py。';
      return;
    }

    el.strongOrig.textContent = entry.o || '';
    el.strongDict.className = 'strong-dict';
    el.strongDict.textContent = entry.z || entry.e || '';

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

  function searchCurrentStrong() {
    if (!state.strong) return;
    if (el.searchVersionSelect) el.searchVersionSelect.value = 'strong';
    openSearchModal(state.strong);
  }

  function clearStrong() {
    state.strong = null;
    el.strongPanel.hidden = true;
    if (el.strongOverlay) el.strongOverlay.hidden = true;
    document.body.classList.remove('strong-open');
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

  /* ---------- 搜尋引擎 ---------- */
  var searchOpener = null;

  function buildSearchControls() {
    if (el.startSearchBtn) {
      el.startSearchBtn.addEventListener('click', function () { openSearchModal(''); });
    }
    if (el.searchBarBtn) {
      el.searchBarBtn.addEventListener('click', function () { openSearchModal(''); });
    }
    if (el.searchCloseBtn) el.searchCloseBtn.addEventListener('click', closeSearchModal);
    if (el.searchOverlay) el.searchOverlay.addEventListener('click', closeSearchModal);
    if (el.searchExecBtn) el.searchExecBtn.addEventListener('click', function () { runSearch(); });
    if (el.searchInput) {
      el.searchInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') runSearch();
        if (e.key === 'Escape') closeSearchModal();
      });
    }
    if (el.searchMoreBtn) el.searchMoreBtn.addEventListener('click', renderNextBatch);
    if (el.searchVersionSelect) {
      el.searchVersionSelect.addEventListener('change', function () { runSearch(); });
    }
    if (el.searchScopeSelect) {
      el.searchScopeSelect.addEventListener('change', function () { runSearch(); });
    }
  }

  function openSearchModal(initialQuery) {
    searchOpener = document.activeElement;
    el.searchModal.hidden = false;
    if (initialQuery !== undefined && initialQuery !== '') el.searchInput.value = initialQuery;
    el.searchInput.focus();
    el.searchInput.select();
    if (el.searchInput.value.trim()) runSearch();
  }

  function closeSearchModal() {
    el.searchModal.hidden = true;
    if (searchOpener && searchOpener.focus) searchOpener.focus();
    searchOpener = null;
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

  /* ---------- 啟動守門 ---------- */
  function guard() {
    if (state.index.length) return;
    var box = document.getElementById('startPickCard');
    if (!box) return;
    var warn = document.createElement('div');
    warn.className = 'start-card';
    warn.style.borderColor = '#c0392b';
    warn.style.marginTop = '16px';
    warn.innerHTML =
      '<b>載入不到經文資料</b><br><br>' +
      '請確認 <code>app/data/</code> 底下有 <code>books.js</code> 與 66 個卷檔；' +
      '若沒有，請先執行：<br><code>python scripts/parse.py</code><br><br>' +
      '若檔案存在但仍看到這則訊息，代表你的瀏覽器擋掉了 file:// 的指令碼載入。' +
      '改用本機伺服器開啟即可：<br>' +
      '<code>python -m http.server 8777 --directory app</code><br>' +
      '然後開 <code>http://localhost:8777</code>';
    box.parentNode.appendChild(warn);
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
