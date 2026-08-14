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
      strong: true, otonly: true, rtl: true, lang: 'he' },
    { key: 'gr_wh', label: '原文', full: '希臘文原文 Westcott-Hort（僅新約）',
      strong: true, ntonly: true, greek: true, lang: 'el' },
    { key: 'zh_unv', label: '和合本', full: '和合本 (1919)', strong: true, lang: 'zh-TW' },
    { key: 'es_rvr1909', label: 'RVR1909', full: 'Reina-Valera 1909', strong: false, lang: 'es-ES' },
    { key: 'es_rvc', label: 'RVC', full: 'Reina Valera Contemporánea', strong: false, lang: 'es-ES' },
    { key: 'fr_nbs', label: 'NBS', full: 'Nouvelle Bible Segond (法文)', strong: false, lang: 'fr-FR' },
    { key: 'ja_jp', label: '日語', full: '日語聖經 (口語訳)', strong: false, lang: 'ja-JP' },
    { key: 'ko_kor', label: '韓語', full: '韓語聖經 (개역한글)', strong: false, lang: 'ko-KR' },
    { key: 'vi_vie', label: '越南語', full: '越南聖經 (Kinh Thánh)', strong: false, lang: 'vi-VN' },
    { key: 'en_kjv', label: 'KJV', full: 'King James Version', strong: true, lang: 'en-US' },
    { key: 'en_web', label: 'WEB', full: 'World English Bible', strong: false, lang: 'en-US' }
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

  /* ---------- Toast 輕量提示訊息 ---------- */
  function showToast(text, duration) {
    var toast = document.getElementById('bibliaToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'bibliaToast';
      toast.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);' +
        'background:rgba(28,26,23,0.92);color:#fff;padding:9px 18px;border-radius:20px;' +
        'font-family:var(--font-ui);font-size:0.88rem;font-weight:600;z-index:9999;' +
        'box-shadow:0 6px 20px rgba(0,0,0,0.3);pointer-events:none;transition:opacity 0.2s ease, transform 0.2s ease;' +
        'opacity:0;display:flex;align-items:center;gap:6px;';
      document.body.appendChild(toast);
    }
    toast.textContent = text;
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(-50%) translateY(0)';
    clearTimeout(toast._timer);
    toast._timer = setTimeout(function () {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(-50%) translateY(10px)';
    }, duration || 2000);
  }

  /* ---------- 設定持久化 ---------- */
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

  /* ---------- 書籤、螢光與歷史記錄儲存 ---------- */
  function loadUserAsset(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) { return fallback; }
  }

  function saveUserAsset(key, val) {
    try {
      localStorage.setItem(key, JSON.stringify(val));
    } catch (e) { /* 忽略 */ }
  }

  var bookmarks = loadUserAsset('biblia_bookmarks', {});
  var highlights = loadUserAsset('biblia_highlights', {});
  var readHistory = loadUserAsset('biblia_history', []);

  function addReadHistory(bNo, ch) {
    var bMeta = state.byNo[bNo];
    if (!bMeta) return;
    var now = new Date();
    function pad(n) { return n < 10 ? '0' + n : '' + n; }
    var timeStr = (now.getMonth() + 1) + '/' + pad(now.getDate()) + ' ' + pad(now.getHours()) + ':' + pad(now.getMinutes());

    readHistory = readHistory.filter(function (h) { return !(h.bookNo === bNo && h.chap === ch); });
    readHistory.unshift({ bookNo: bNo, chap: ch, bookZh: bMeta.zh, time: timeStr });
    if (readHistory.length > 30) readHistory = readHistory.slice(0, 30);
    saveUserAsset('biblia_history', readHistory);
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
    ['light', 'sepia', 'matcha', 'dark', 'oled'].forEach(function (t) {
      document.body.classList.toggle(t, state.theme === t);
      document.documentElement.classList.toggle(t, state.theme === t);
    });

    var meta = document.querySelector('meta[name="theme-color"]:not([media])');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'theme-color');
      document.head.appendChild(meta);
    }
    var colors = { light: '#fbf9f5', sepia: '#f6f0e2', matcha: '#eff4ef', dark: '#14171d', oled: '#000000' };
    meta.setAttribute('content', colors[state.theme] || '#fbf9f5');
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

    document.body.classList.toggle('tools-open',
      (window.innerWidth || 1280) >= 900 &&
      (!saved || typeof saved.tools !== 'boolean' || saved.tools));
    if (!state.byNo[state.bookNo]) { state.bookNo = 1; state.chap = 1; }

    cacheEls();
    buildStart();
    buildDailyVerseWidget();
    buildQuickNavUI();
    buildVerseActionMenu();
    buildVerseNoteModal();
    buildCompareVerseModal();
    buildAudioTTS();
    buildStudyCenterUI();
    buildShortcutsGuide();
    buildReaderControls();
    buildAppearanceControls();
    buildSearchControls();
    buildPlanUI();
    buildRefUI();
    initSwipeGesture();
    observeLayout();
    applyAppearance();
    showStart();
    window.addEventListener('hashchange', handleHash);
    window.addEventListener('popstate', handleHash);
    if (window.location.hash) handleHash();
  }

  function cacheEls() {
    [
      'startView', 'readerView', 'planView', 'refView', 'otBook', 'otChap', 'ntBook', 'ntChap',
      'startVersions', 'startInter', 'startDark', 'bookSelect', 'chapSelect',
      'reader', 'readerBar', 'versionBox', 'interlinearChk', 'strongPanel', 'strongOverlay',
      'strongNum', 'strongMeta', 'strongHits', 'strongOrig', 'strongDict', 'strongCopyBtn', 'strongMorphBox',
      'strongSearchBtn', 'strongEngBtn', 'startSearchBtn', 'searchBarBtn',
      'searchModal', 'searchOverlay', 'searchInput', 'searchExecBtn',
      'searchCloseBtn', 'searchVersionSelect', 'searchScopeSelect', 'searchSummary',
      'searchResults', 'searchFoot', 'searchMoreBtn', 'startPlanBtn',
      'readerPlanBtn', 'planHomeBtn', 'planReaderBtn', 'planJumpTodayBtn',
      'planThemeBtn', 'planStatsPercent', 'planProgressFill', 'planProgressBar',
      'planStatsCount', 'planStreakBadge', 'planMarkTodayBtn', 'planMonthTabs', 'planWeekSelect',
      'planSearchInput', 'planList', 'startPlanTodayBox', 'startPlanDate',
      'planSwitch', 'planTitle', 'planSubtitle', 'planSource', 'planHeadTitle',
      'startRefBtn', 'readerRefBtn', 'planRefBtn', 'refHomeBtn', 'refReaderBtn',
      'refPlanBtn', 'refThemeBtn', 'refNavTabs', 'refPanelSu101', 'refPanelIntros',
      'refPanelTimeline',
      'startDailyVerseCard', 'dailyVerseTheme', 'dailyVerseShuffleBtn', 'dailyVerseText',
      'dailyVerseEn', 'dailyVerseOrig', 'dailyVerseRef', 'dailyVerseCopyBtn', 'dailyVerseShareBtn', 'dailyVerseReadBtn',
      'startQuickNavBtn', 'quickNavBtn', 'quickNavBtnText', 'quickNavModal', 'quickNavOverlay',
      'quickNavCloseBtn', 'quickNavSearchInput', 'quickNavBooksPanel', 'quickNavTestamentTabs',
      'quickNavCategoryPills', 'quickNavBooksGrid', 'quickNavChapsPanel', 'quickNavBackBtn',
      'quickSelectedBookTitle', 'quickNavChapsGrid',
      'verseActionMenu', 'vamRefTitle', 'vamCloseBtn', 'vamCopyBtn', 'vamCompareBtn',
      'vamBookmarkBtn', 'vamNoteBtn', 'vamShareBtn', 'vamAudioBtn', 'vamHighlighterColors',
      'verseNoteModal', 'noteOverlay', 'noteModalTitle', 'noteModalVerseText', 'noteCloseBtn',
      'noteInput', 'notePresetTags', 'noteTagsInput', 'noteDeleteBtn', 'noteCancelBtn', 'noteSaveBtn',
      'compareVerseModal', 'compareOverlay', 'compareVerseTitle', 'compareCopyAllBtn',
      'compareCloseBtn', 'compareVerseList',
      'studyCenterModal', 'studyOverlay', 'studyCloseBtn', 'studyNavTabs', 'studyPanelHistory',
      'studyPanelBookmarks', 'studyPanelHighlights', 'studyPanelBackup', 'studyHistoryList',
      'studyBookmarksList', 'studyHighlightsList', 'bookmarksCountText', 'studyBookmarkSearch', 'studyTagFilterRow',
      'studyHlFilterPills', 'clearHistoryBtn', 'exportBackupBtn', 'importBackupInput', 'backupStatusMsg',
      'startStudyCenterBtn', 'readerStudyBtn',
      'audioControlBar', 'audioProgressLabel', 'audioPrevBtn', 'audioToggleBtn',
      'audioNextBtn', 'audioStopBtn', 'audioSpeedSelect', 'audioLangSelect', 'audioCloseBtn', 'audioPlayBtn',
      'shortcutsModal', 'shortcutsOverlay', 'shortcutsCloseBtn', 'shortcutsBtn',
      'toolsBtn', 'barTools', 'sizeVal', 'pager', 'pagerPrev', 'pagerNext', 'pagerLoc',
      'readerAaBtn', 'openAaModalBtn', 'pagerAaBtn', 'zenBtn', 'pagerZenBtn', 'readingProgressBar', 'readingProgressFill',
      'appearanceModal', 'appearanceOverlay',
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

    if (el.startQuickNavBtn) el.startQuickNavBtn.addEventListener('click', openQuickNav);
    if (el.startStudyCenterBtn) el.startStudyCenterBtn.addEventListener('click', openStudyCenter);
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

  /* ---------- 每日精選金句卡片邏輯 ---------- */
  var currentGoldenVerseIdx = 0;

  function buildDailyVerseWidget() {
    var verses = window.BIBLIA_GOLDEN_VERSES || [];
    if (!verses.length) return;

    var dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
    currentGoldenVerseIdx = dayOfYear % verses.length;
    renderDailyVerseWidget();

    if (el.dailyVerseShuffleBtn) {
      el.dailyVerseShuffleBtn.addEventListener('click', function () {
        currentGoldenVerseIdx = Math.floor(Math.random() * verses.length);
        renderDailyVerseWidget();
      });
    }

    if (el.dailyVerseCopyBtn) {
      el.dailyVerseCopyBtn.addEventListener('click', function () {
        var gv = verses[currentGoldenVerseIdx];
        if (!gv) return;
        var copyText = '【Biblia 每日經文手籤】\n「' + gv.zh + '」\n' + (gv.en ? gv.en + '\n' : '') + (gv.orig ? gv.orig + '\n' : '') + '—— ' + gv.ref;
        navigator.clipboard.writeText(copyText).then(function () {
          showToast('已複製每日經文手籤 📋');
        });
      });
    }

    if (el.dailyVerseShareBtn) {
      el.dailyVerseShareBtn.addEventListener('click', function () {
        var gv = verses[currentGoldenVerseIdx];
        if (!gv) return;
        var shareText = '【Biblia 每日經文手籤】\n「' + gv.zh + '」\n' + (gv.en ? gv.en + '\n' : '') + '—— ' + gv.ref + '\n' + window.location.href;
        if (navigator.share) {
          navigator.share({
            title: 'Biblia 每日金句 — ' + gv.ref,
            text: shareText,
            url: window.location.href
          }).catch(function () {});
        } else {
          navigator.clipboard.writeText(shareText).then(function () {
            showToast('已複製每日金句手籤 📋');
          });
        }
      });
    }

    if (el.dailyVerseReadBtn) {
      el.dailyVerseReadBtn.addEventListener('click', function () {
        var gv = verses[currentGoldenVerseIdx];
        if (gv) jumpToVerse(gv.bookNo, gv.chap, gv.sec);
      });
    }
  }

  function renderDailyVerseWidget() {
    var verses = window.BIBLIA_GOLDEN_VERSES || [];
    if (!verses.length) return;
    var gv = verses[currentGoldenVerseIdx];
    if (!gv) return;

    if (el.dailyVerseTheme) el.dailyVerseTheme.textContent = gv.theme || '靈修金句';
    if (el.dailyVerseText) el.dailyVerseText.textContent = '「' + gv.zh + '」';
    if (el.dailyVerseEn) el.dailyVerseEn.textContent = gv.en || '';
    if (el.dailyVerseOrig) el.dailyVerseOrig.textContent = gv.orig || '';
    if (el.dailyVerseRef) el.dailyVerseRef.textContent = gv.ref;
  }

  /* ---------- 極速選卷選章導航盤 (Quick Nav Modal) ---------- */
  var quickNavState = {
    testament: 'OT',
    category: 'all',
    search: '',
    selectedBook: null
  };

  function getBookCategory(b) {
    var n = b.no;
    if (n >= 1 && n <= 5) return '律法書';
    if (n >= 6 && n <= 17) return '歷史書';
    if (n >= 18 && n <= 22) return '詩歌智慧書';
    if (n >= 23 && n <= 27) return '大先知書';
    if (n >= 28 && n <= 39) return '小先知書';
    if (n >= 40 && n <= 44) return '福音書與歷史';
    if (n >= 45 && n <= 57) return '保羅書信';
    if (n >= 58 && n <= 66) return '普通書信與啟示';
    return '其他';
  }

  function buildQuickNavUI() {
    if (el.quickNavBtn) el.quickNavBtn.addEventListener('click', openQuickNav);
    if (el.quickNavCloseBtn) el.quickNavCloseBtn.addEventListener('click', closeQuickNav);
    if (el.quickNavOverlay) el.quickNavOverlay.addEventListener('click', closeQuickNav);

    if (el.quickNavTestamentTabs) {
      el.quickNavTestamentTabs.querySelectorAll('.quick-tab-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
          quickNavState.testament = btn.getAttribute('data-testament');
          quickNavState.category = 'all';
          renderQuickNav();
        });
      });
    }

    if (el.quickNavSearchInput) {
      el.quickNavSearchInput.addEventListener('input', function () {
        quickNavState.search = el.quickNavSearchInput.value.trim();
        renderQuickNav();
      });
    }

    if (el.quickNavBackBtn) {
      el.quickNavBackBtn.addEventListener('click', function () {
        if (el.quickNavChapsPanel) el.quickNavChapsPanel.hidden = true;
        if (el.quickNavBooksPanel) el.quickNavBooksPanel.hidden = false;
        quickNavState.selectedBook = null;
      });
    }
  }

  function openQuickNav() {
    if (!el.quickNavModal) return;
    var meta = state.byNo[state.bookNo];
    quickNavState.testament = meta && meta.no >= FIRST_NT ? 'NT' : 'OT';
    quickNavState.category = 'all';
    quickNavState.search = '';
    quickNavState.selectedBook = null;

    if (el.quickNavSearchInput) el.quickNavSearchInput.value = '';
    if (el.quickNavChapsPanel) el.quickNavChapsPanel.hidden = true;
    if (el.quickNavBooksPanel) el.quickNavBooksPanel.hidden = false;

    renderQuickNav();
    el.quickNavModal.hidden = false;
    setTimeout(function () {
      if (el.quickNavSearchInput) el.quickNavSearchInput.focus();
    }, 100);
  }

  function closeQuickNav() {
    if (el.quickNavModal) el.quickNavModal.hidden = true;
  }

  function renderQuickNav() {
    if (!el.quickNavBooksGrid) return;

    if (el.quickNavTestamentTabs) {
      el.quickNavTestamentTabs.querySelectorAll('.quick-tab-btn').forEach(function (btn) {
        var isAct = btn.getAttribute('data-testament') === quickNavState.testament;
        btn.classList.toggle('active', isAct);
        btn.setAttribute('aria-selected', isAct ? 'true' : 'false');
      });
    }

    // 分類 Pills
    var otCategories = ['all', '律法書', '歷史書', '詩歌智慧書', '大先知書', '小先知書'];
    var ntCategories = ['all', '福音書與歷史', '保羅書信', '普通書信與啟示'];
    var categories = quickNavState.testament === 'OT' ? otCategories : ntCategories;

    if (el.quickNavCategoryPills) {
      var pillsHtml = '';
      categories.forEach(function (cat) {
        var label = cat === 'all' ? '全部' : cat;
        var actCls = quickNavState.category === cat ? 'active' : '';
        pillsHtml += '<button type="button" class="quick-cat-btn ' + actCls + '" data-cat="' + escapeHtml(cat) + '">' + escapeHtml(label) + '</button>';
      });
      el.quickNavCategoryPills.innerHTML = pillsHtml;

      el.quickNavCategoryPills.querySelectorAll('.quick-cat-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
          quickNavState.category = btn.getAttribute('data-cat');
          renderQuickNav();
        });
      });
    }

    // 過濾書卷
    var isNT = quickNavState.testament === 'NT';
    var filteredBooks = state.index.filter(function (b) {
      if (isNT && b.no < FIRST_NT) return false;
      if (!isNT && b.no >= FIRST_NT) return false;
      if (quickNavState.category !== 'all' && getBookCategory(b) !== quickNavState.category) return false;

      if (quickNavState.search) {
        var q = quickNavState.search.toLowerCase();
        var mZh = (b.zh || '').toLowerCase().indexOf(q) !== -1;
        var mEn = (b.en || '').toLowerCase().indexOf(q) !== -1;
        var mAb = (b.ab || '').toLowerCase().indexOf(q) !== -1;
        var mDir = (b.dir || '').toLowerCase().indexOf(q) !== -1;
        if (!mZh && !mEn && !mAb && !mDir) return false;
      }
      return true;
    });

    var booksHtml = '';
    filteredBooks.forEach(function (b) {
      var isCurrent = b.no === state.bookNo;
      booksHtml += '<button type="button" class="quick-book-btn ' + (isCurrent ? 'current' : '') + '" data-bookno="' + b.no + '">' +
        '<span class="qb-zh">' + escapeHtml(b.zh) + '</span>' +
        '<span class="qb-sub">' + escapeHtml(b.en || '') + ' (' + b.nch + '章)</span>' +
      '</button>';
    });

    el.quickNavBooksGrid.innerHTML = booksHtml || '<p class="placeholder">查無符合的書卷</p>';

    el.quickNavBooksGrid.querySelectorAll('.quick-book-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var bNo = parseInt(btn.getAttribute('data-bookno'), 10);
        openQuickChaps(bNo);
      });
    });
  }

  function openQuickChaps(bNo) {
    var bMeta = state.byNo[bNo];
    if (!bMeta) return;
    quickNavState.selectedBook = bMeta;

    if (el.quickSelectedBookTitle) {
      el.quickSelectedBookTitle.textContent = bMeta.zh + ' (' + bMeta.en + ' · 共 ' + bMeta.nch + ' 章)';
    }

    var chapsHtml = '';
    for (var c = 1; c <= bMeta.nch; c++) {
      var isCurrent = (bNo === state.bookNo && c === state.chap);
      chapsHtml += '<button type="button" class="quick-chap-btn ' + (isCurrent ? 'current' : '') + '" data-chap="' + c + '">' + c + '</button>';
    }
    el.quickNavChapsGrid.innerHTML = chapsHtml;

    el.quickNavChapsGrid.querySelectorAll('.quick-chap-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var ch = parseInt(btn.getAttribute('data-chap'), 10);
        closeQuickNav();
        go(bNo, ch);
      });
    });

    if (el.quickNavBooksPanel) el.quickNavBooksPanel.hidden = true;
    if (el.quickNavChapsPanel) el.quickNavChapsPanel.hidden = false;
  }

  /* ---------- 經文深度互動工具箱 (Verse Action Menu) ---------- */
  var activeVerseCtx = null;

  function buildVerseActionMenu() {
    if (el.vamCloseBtn) el.vamCloseBtn.addEventListener('click', closeVerseActionMenu);

    if (el.vamCopyBtn) {
      el.vamCopyBtn.addEventListener('click', function () {
        if (!activeVerseCtx) return;
        copyVerseText(activeVerseCtx.bookNo, activeVerseCtx.chap, activeVerseCtx.sec);
        closeVerseActionMenu();
      });
    }

    if (el.vamCompareBtn) {
      el.vamCompareBtn.addEventListener('click', function () {
        if (!activeVerseCtx) return;
        var ctx = activeVerseCtx;
        closeVerseActionMenu();
        openCompareVerseModal(ctx.bookNo, ctx.chap, ctx.sec);
      });
    }

    if (el.vamBookmarkBtn) {
      el.vamBookmarkBtn.addEventListener('click', function () {
        if (!activeVerseCtx) return;
        toggleVerseBookmark(activeVerseCtx.bookNo, activeVerseCtx.chap, activeVerseCtx.sec);
        closeVerseActionMenu();
      });
    }

    if (el.vamNoteBtn) {
      el.vamNoteBtn.addEventListener('click', function () {
        if (!activeVerseCtx) return;
        var ctx = activeVerseCtx;
        closeVerseActionMenu();
        openVerseNoteModal(ctx.bookNo, ctx.chap, ctx.sec);
      });
    }

    if (el.vamShareBtn) {
      el.vamShareBtn.addEventListener('click', function () {
        if (!activeVerseCtx) return;
        shareVerseText(activeVerseCtx.bookNo, activeVerseCtx.chap, activeVerseCtx.sec);
        closeVerseActionMenu();
      });
    }

    if (el.vamAudioBtn) {
      el.vamAudioBtn.addEventListener('click', function () {
        if (!activeVerseCtx) return;
        var sec = activeVerseCtx.sec;
        closeVerseActionMenu();
        startAudioTTS(state.bookNo, state.chap, sec);
      });
    }

    if (el.vamHighlighterColors) {
      el.vamHighlighterColors.querySelectorAll('.vam-color-dot').forEach(function (btn) {
        btn.addEventListener('click', function () {
          if (!activeVerseCtx) return;
          var color = btn.getAttribute('data-hl');
          setVerseHighlight(activeVerseCtx.bookNo, activeVerseCtx.chap, activeVerseCtx.sec, color);
          closeVerseActionMenu();
        });
      });
    }

    document.addEventListener('click', function (e) {
      if (el.verseActionMenu && !el.verseActionMenu.hidden) {
        if (!el.verseActionMenu.contains(e.target) && !e.target.classList.contains('vn')) {
          closeVerseActionMenu();
        }
      }
    });
  }

  function openVerseActionMenu(bNo, chap, sec, anchorEl) {
    activeVerseCtx = { bookNo: bNo, chap: chap, sec: sec, anchor: anchorEl };
    var bMeta = state.byNo[bNo];
    if (el.vamRefTitle) {
      el.vamRefTitle.textContent = (bMeta ? bMeta.zh : '') + ' ' + chap + ':' + sec;
    }

    var key = bNo + ':' + chap + ':' + sec;
    var isBookmarked = !!bookmarks[key];
    if (el.vamBookmarkBtn) {
      el.vamBookmarkBtn.innerHTML = isBookmarked
        ? '<span aria-hidden="true">★</span> 移除書籤'
        : '<span aria-hidden="true">🔖</span> 加入書籤';
    }

    el.verseActionMenu.hidden = false;

    // 計算定位
    var rect = anchorEl.getBoundingClientRect();
    var top = window.scrollY + rect.bottom + 6;
    var left = window.scrollX + rect.left;
    var maxLeft = window.innerWidth - 320;
    if (left > maxLeft) left = maxLeft;
    if (left < 10) left = 10;

    el.verseActionMenu.style.top = top + 'px';
    el.verseActionMenu.style.left = left + 'px';
  }

  function closeVerseActionMenu() {
    if (el.verseActionMenu) el.verseActionMenu.hidden = true;
    activeVerseCtx = null;
  }

  function shareVerseText(bNo, chap, sec) {
    var bMeta = state.byNo[bNo];
    var data = state.cache[bNo];
    if (!bMeta || !data) return;

    var chapter = data.ch.find(function (c) { return c.c === chap; });
    var verse = chapter ? chapter.v.find(function (v) { return v.s === sec; }) : null;
    if (!verse) return;

    var zhText = (verse.t && verse.t.zh_unv) || '';
    var kjvText = (verse.t && verse.t.en_kjv) || '';
    var shareText = '「' + zhText + '」（' + bMeta.zh + ' ' + chap + ':' + sec + ' 和合本）' +
      (kjvText ? '\n' + kjvText + ' (KJV)' : '') + '\n' + window.location.href;

    if (navigator.share) {
      navigator.share({
        title: (bMeta ? bMeta.zh : '') + ' ' + chap + ':' + sec + ' — Biblia',
        text: shareText,
        url: window.location.href
      }).catch(function () {});
    } else {
      navigator.clipboard.writeText(shareText).then(function () {
        showToast('已複製經文與連結至剪貼簿 📋');
      });
    }
  }

  function copyVerseText(bNo, chap, sec) {
    var bMeta = state.byNo[bNo];
    var data = state.cache[bNo];
    if (!bMeta || !data) return;

    var chapter = data.ch.find(function (c) { return c.c === chap; });
    var verse = chapter ? chapter.v.find(function (v) { return v.s === sec; }) : null;
    if (!verse) return;

    var zhText = (verse.t && verse.t.zh_unv) || '';
    var kjvText = (verse.t && verse.t.en_kjv) || '';
    var textToCopy = '「' + zhText + '」（' + bMeta.zh + ' ' + chap + ':' + sec + ' 和合本）' +
      (kjvText ? '\n' + kjvText + ' (KJV)' : '');

    navigator.clipboard.writeText(textToCopy).then(function () {
      showToast('已複製 ' + bMeta.zh + ' ' + chap + ':' + sec + ' 經文 📋');
    });
  }

  function toggleVerseBookmark(bNo, chap, sec) {
    var bMeta = state.byNo[bNo];
    var key = bNo + ':' + chap + ':' + sec;

    if (bookmarks[key]) {
      delete bookmarks[key];
      saveUserAsset('biblia_bookmarks', bookmarks);
      showToast('已自書籤移除 ✕');
    } else {
      var data = state.cache[bNo];
      var ch = data ? data.ch.find(function (c) { return c.c === chap; }) : null;
      var v = ch ? ch.v.find(function (item) { return item.s === sec; }) : null;
      var text = (v && v.t && v.t.zh_unv) || '';

      var now = new Date();
      var pad = function (n) { return n < 10 ? '0' + n : '' + n; };
      var dateStr = (now.getMonth() + 1) + '/' + pad(now.getDate()) + ' ' + now.getHours() + ':' + pad(now.getMinutes());

      bookmarks[key] = {
        bookNo: bNo,
        chap: chap,
        sec: sec,
        bookZh: bMeta ? bMeta.zh : '',
        text: text,
        time: dateStr,
        note: '',
        tags: []
      };
      saveUserAsset('biblia_bookmarks', bookmarks);
      showToast('已加入書籤 🔖');
    }
    render();
  }

  /* ---------- 經文靈修筆記彈窗 (Verse Note Modal) ---------- */
  var activeNoteCtx = null;

  function buildVerseNoteModal() {
    if (el.noteCloseBtn) el.noteCloseBtn.addEventListener('click', closeVerseNoteModal);
    if (el.noteCancelBtn) el.noteCancelBtn.addEventListener('click', closeVerseNoteModal);
    if (el.noteOverlay) el.noteOverlay.addEventListener('click', closeVerseNoteModal);

    if (el.notePresetTags) {
      el.notePresetTags.querySelectorAll('.note-tag-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var tag = btn.getAttribute('data-tag');
          if (!el.noteTagsInput) return;
          var cur = el.noteTagsInput.value.trim();
          if (cur.indexOf(tag) === -1) {
            el.noteTagsInput.value = cur ? (cur + ' ' + tag) : tag;
          }
        });
      });
    }

    if (el.noteSaveBtn) {
      el.noteSaveBtn.addEventListener('click', function () {
        if (!activeNoteCtx) return;
        saveVerseNote(activeNoteCtx.bookNo, activeNoteCtx.chap, activeNoteCtx.sec);
        closeVerseNoteModal();
      });
    }

    if (el.noteDeleteBtn) {
      el.noteDeleteBtn.addEventListener('click', function () {
        if (!activeNoteCtx) return;
        deleteVerseNote(activeNoteCtx.bookNo, activeNoteCtx.chap, activeNoteCtx.sec);
        closeVerseNoteModal();
      });
    }
  }

  function openVerseNoteModal(bNo, chap, sec) {
    activeNoteCtx = { bookNo: bNo, chap: chap, sec: sec };
    var bMeta = state.byNo[bNo];
    var data = state.cache[bNo];
    var chapter = data ? data.ch.find(function (c) { return c.c === chap; }) : null;
    var verse = chapter ? chapter.v.find(function (v) { return v.s === sec; }) : null;
    var vText = (verse && verse.t && verse.t.zh_unv) || '';

    if (el.noteModalTitle) {
      el.noteModalTitle.textContent = (bMeta ? bMeta.zh : '') + ' ' + chap + ':' + sec + ' 靈修筆記';
    }
    if (el.noteModalVerseText) {
      el.noteModalVerseText.textContent = vText ? ('「' + vText + '」') : '';
    }

    var key = bNo + ':' + chap + ':' + sec;
    var bm = bookmarks[key];
    if (el.noteInput) el.noteInput.value = (bm && bm.note) ? bm.note : '';
    if (el.noteTagsInput) el.noteTagsInput.value = (bm && bm.tags) ? bm.tags.join(' ') : '';
    if (el.noteDeleteBtn) el.noteDeleteBtn.hidden = !(bm && (bm.note || (bm.tags && bm.tags.length)));

    if (el.verseNoteModal) el.verseNoteModal.hidden = false;
    if (el.noteInput) el.noteInput.focus();
  }

  function closeVerseNoteModal() {
    if (el.verseNoteModal) el.verseNoteModal.hidden = true;
    activeNoteCtx = null;
  }

  function saveVerseNote(bNo, chap, sec) {
    var bMeta = state.byNo[bNo];
    var key = bNo + ':' + chap + ':' + sec;
    var noteVal = (el.noteInput ? el.noteInput.value.trim() : '');
    var tagsVal = (el.noteTagsInput ? el.noteTagsInput.value.trim() : '');
    var tagList = tagsVal ? tagsVal.split(/\s+/).filter(Boolean) : [];

    var data = state.cache[bNo];
    var ch = data ? data.ch.find(function (c) { return c.c === chap; }) : null;
    var v = ch ? ch.v.find(function (item) { return item.s === sec; }) : null;
    var text = (v && v.t && v.t.zh_unv) || '';

    var now = new Date();
    var pad = function (n) { return n < 10 ? '0' + n : '' + n; };
    var dateStr = (now.getMonth() + 1) + '/' + pad(now.getDate()) + ' ' + now.getHours() + ':' + pad(now.getMinutes());

    bookmarks[key] = {
      bookNo: bNo,
      chap: chap,
      sec: sec,
      bookZh: bMeta ? bMeta.zh : '',
      text: text,
      time: dateStr,
      note: noteVal,
      tags: tagList
    };

    saveUserAsset('biblia_bookmarks', bookmarks);
    showToast('已儲存靈修筆記 ✏️');
    render();
    if (el.studyCenterModal && !el.studyCenterModal.hidden) renderStudyCenter();
  }

  function deleteVerseNote(bNo, chap, sec) {
    var key = bNo + ':' + chap + ':' + sec;
    if (bookmarks[key]) {
      bookmarks[key].note = '';
      bookmarks[key].tags = [];
      saveUserAsset('biblia_bookmarks', bookmarks);
      showToast('已刪除筆記內容');
      render();
      if (el.studyCenterModal && !el.studyCenterModal.hidden) renderStudyCenter();
    }
  }

  function setVerseHighlight(bNo, chap, sec, color) {
    var key = bNo + ':' + chap + ':' + sec;
    if (!color || color === 'none') {
      delete highlights[key];
      showToast('已清除高亮劃線');
    } else {
      highlights[key] = color;
      showToast('已套用螢光劃線 🎨');
    }
    saveUserAsset('biblia_highlights', highlights);
    render();
  }

  /* ---------- 單節 11 譯本深度對照彈窗 ---------- */
  function buildCompareVerseModal() {
    if (el.compareCloseBtn) el.compareCloseBtn.addEventListener('click', closeCompareVerseModal);
    if (el.compareOverlay) el.compareOverlay.addEventListener('click', closeCompareVerseModal);

    if (el.compareCopyAllBtn) {
      el.compareCopyAllBtn.addEventListener('click', function () {
        var list = el.compareVerseList;
        if (!list) return;
        var lines = [];
        lines.push('【' + el.compareVerseTitle.textContent + '】\n');
        list.querySelectorAll('.compare-card').forEach(function (card) {
          var tag = card.querySelector('.compare-v-tag').textContent;
          var text = card.querySelector('.compare-card-text').textContent;
          lines.push(tag + ': ' + text);
        });
        navigator.clipboard.writeText(lines.join('\n\n')).then(function () {
          showToast('已複製所有譯本對照經文 📋');
        });
      });
    }
  }

  function openCompareVerseModal(bNo, chap, sec) {
    var bMeta = state.byNo[bNo];
    if (!bMeta) return;

    if (el.compareVerseTitle) {
      el.compareVerseTitle.textContent = bMeta.zh + ' ' + chap + ':' + sec + ' 單節全版本對照';
    }

    el.compareVerseList.innerHTML = '<p class="placeholder">載入各版本對照中…</p>';
    el.compareVerseModal.hidden = false;

    loadBook(bNo, function (data) {
      if (!data) return;
      var chapter = data.ch.find(function (c) { return c.c === chap; });
      var verse = chapter ? chapter.v.find(function (v) { return v.s === sec; }) : null;
      if (!verse) {
        el.compareVerseList.innerHTML = '<p class="placeholder">查無本節資料</p>';
        return;
      }

      var cardsHtml = '';
      var isNT = bNo >= FIRST_NT;

      VERSIONS.forEach(function (v) {
        if (v.otonly && isNT) return;
        if (v.ntonly && !isNT) return;

        var text = (verse.t && verse.t[v.key]) || '';
        if (text === undefined || text === null) return;

        var rtlCls = v.rtl ? 'rtl' : '';
        cardsHtml += '<div class="compare-card ' + rtlCls + '">' +
          '<div class="compare-card-head">' +
            '<span class="compare-v-tag">' + escapeHtml(v.label) + '</span>' +
            '<span class="compare-v-lang">' + escapeHtml(v.full) + '</span>' +
          '</div>' +
          '<div class="compare-card-text">' + (text ? escapeHtml(text) : '<span class="blank">（此版本本節無內文）</span>') + '</div>' +
        '</div>';
      });

      el.compareVerseList.innerHTML = cardsHtml;
    });
  }

  function closeCompareVerseModal() {
    if (el.compareVerseModal) el.compareVerseModal.hidden = true;
  }

  /* ---------- Web Speech API 語音朗讀經文 (Audio TTS) ---------- */
  var audioState = {
    isPlaying: false,
    isPaused: false,
    bookNo: 1,
    chap: 1,
    sec: 1,
    totalSecs: 1,
    rate: 1.0,
    lang: 'zh-TW',
    synth: window.speechSynthesis,
    currentUtterance: null
  };

  function buildAudioTTS() {
    if (el.audioPlayBtn) el.audioPlayBtn.addEventListener('click', function () {
      if (audioState.isPlaying) {
        stopAudioTTS();
      } else {
        startAudioTTS(state.bookNo, state.chap, 1);
      }
    });

    if (el.audioToggleBtn) el.audioToggleBtn.addEventListener('click', toggleAudioPlayPause);
    if (el.audioStopBtn) el.audioStopBtn.addEventListener('click', stopAudioTTS);
    if (el.audioCloseBtn) el.audioCloseBtn.addEventListener('click', stopAudioTTS);

    if (el.audioNextBtn) el.audioNextBtn.addEventListener('click', function () { stepAudioVerse(1); });
    if (el.audioPrevBtn) el.audioPrevBtn.addEventListener('click', function () { stepAudioVerse(-1); });

    if (el.audioSpeedSelect) {
      el.audioSpeedSelect.addEventListener('change', function () {
        audioState.rate = parseFloat(el.audioSpeedSelect.value) || 1.0;
        if (audioState.isPlaying && !audioState.isPaused) {
          readCurrentVerseAudio();
        }
      });
    }

    if (el.audioLangSelect) {
      var supportedLangs = [
        { key: 'zh-TW', label: '國語 / 中文 (和合本)' },
        { key: 'en-US', label: 'English (KJV / WEB)' },
        { key: 'es-ES', label: 'Español (RVR1909)' },
        { key: 'fr-FR', label: 'Français (NBS)' },
        { key: 'ja-JP', label: '日本語 (口語訳)' },
        { key: 'ko-KR', label: '한국어 (개역한글)' },
        { key: 'vi-VN', label: 'Tiếng Việt (Kinh Thánh)' }
      ];
      el.audioLangSelect.innerHTML = '';
      supportedLangs.forEach(function (lg) {
        var opt = document.createElement('option');
        opt.value = lg.key;
        opt.textContent = lg.label;
        el.audioLangSelect.appendChild(opt);
      });
      el.audioLangSelect.addEventListener('change', function () {
        audioState.lang = el.audioLangSelect.value;
        if (audioState.isPlaying) readCurrentVerseAudio();
      });
    }
  }

  function startAudioTTS(bNo, chap, startSec) {
    if (!window.speechSynthesis) {
      showToast('您的瀏覽器不支援語音朗讀功能 (Web Speech API)');
      return;
    }

    audioState.bookNo = bNo;
    audioState.chap = chap;
    audioState.sec = startSec || 1;
    audioState.isPlaying = true;
    audioState.isPaused = false;

    var bMeta = state.byNo[bNo];
    var data = state.cache[bNo];
    if (data) {
      var chapter = data.ch.find(function (c) { return c.c === chap; });
      audioState.totalSecs = chapter ? chapter.v.length : 30;
    }

    if (el.audioControlBar) el.audioControlBar.hidden = false;
    if (el.audioToggleBtn) el.audioToggleBtn.textContent = '⏸';

    readCurrentVerseAudio();
  }

  function readCurrentVerseAudio() {
    if (!audioState.isPlaying) return;
    if (audioState.synth) audioState.synth.cancel();

    var bNo = audioState.bookNo;
    var chap = audioState.chap;
    var sec = audioState.sec;

    var bMeta = state.byNo[bNo];
    if (el.audioProgressLabel) {
      el.audioProgressLabel.textContent = (bMeta ? bMeta.zh : '') + ' ' + chap + ':' + sec;
    }

    // 捲動並高亮經文
    document.querySelectorAll('.audio-reading-active').forEach(function (n) {
      n.classList.remove('audio-reading-active');
    });

    var targetRow = document.querySelector('.verse[data-sec="' + sec + '"]');
    if (targetRow) {
      targetRow.classList.add('audio-reading-active');
      targetRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    var data = state.cache[bNo];
    if (!data) {
      loadBook(bNo, function () { readCurrentVerseAudio(); });
      return;
    }

    var chapter = data.ch.find(function (c) { return c.c === chap; });
    var verse = chapter ? chapter.v.find(function (v) { return v.s === sec; }) : null;
    if (!verse) {
      stopAudioTTS();
      return;
    }

    // 根據選定語言取得朗讀文字
    var vkeyMap = {
      'zh-TW': 'zh_unv',
      'en-US': 'en_kjv',
      'es-ES': 'es_rvr1909',
      'fr-FR': 'fr_nbs',
      'ja-JP': 'ja_jp',
      'ko-KR': 'ko_kor',
      'vi-VN': 'vi_vie'
    };
    var vkey = vkeyMap[audioState.lang] || 'zh_unv';
    var text = (verse.t && verse.t[vkey]) || (verse.t && verse.t.zh_unv) || '';
    if (!text) {
      stepAudioVerse(1);
      return;
    }

    var utter = new SpeechSynthesisUtterance(text);
    utter.rate = audioState.rate;
    utter.lang = audioState.lang;

    // 嘗試選擇優質語音
    if (window.speechSynthesis && window.speechSynthesis.getVoices) {
      var voices = window.speechSynthesis.getVoices();
      var matchingVoice = voices.find(function (v) {
        return v.lang && v.lang.replace('_', '-').toLowerCase().startsWith(audioState.lang.toLowerCase().slice(0, 2));
      });
      if (matchingVoice) utter.voice = matchingVoice;
    }

    utter.onend = function () {
      if (!audioState.isPlaying || audioState.isPaused) return;
      if (audioState.sec < audioState.totalSecs) {
        audioState.sec++;
        readCurrentVerseAudio();
      } else {
        stopAudioTTS();
        showToast('本章經文朗讀完畢 ✓');
      }
    };

    utter.onerror = function () {
      if (audioState.isPlaying) stepAudioVerse(1);
    };

    audioState.currentUtterance = utter;
    updateMediaSession(bNo, chap, sec);
    audioState.synth.speak(utter);
  }

  function updateMediaSession(bNo, chap, sec) {
    if (!('mediaSession' in navigator)) return;
    var bMeta = state.byNo[bNo];
    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: (bMeta ? bMeta.zh : '') + ' 第 ' + chap + ' 章 ' + sec + ' 節',
        artist: 'Biblia 多語逐字對照聖經',
        album: (bMeta ? bMeta.en : 'Bible') + ' ' + chap,
        artwork: [
          { src: 'icons/icon.svg', sizes: '512x512', type: 'image/svg+xml' }
        ]
      });

      navigator.mediaSession.setActionHandler('play', function () {
        if (audioState.isPaused) toggleAudioPlayPause();
      });
      navigator.mediaSession.setActionHandler('pause', function () {
        if (audioState.isPlaying && !audioState.isPaused) toggleAudioPlayPause();
      });
      navigator.mediaSession.setActionHandler('previoustrack', function () {
        stepAudioVerse(-1);
      });
      navigator.mediaSession.setActionHandler('nexttrack', function () {
        stepAudioVerse(1);
      });
      navigator.mediaSession.setActionHandler('stop', function () {
        stopAudioTTS();
      });
    } catch (e) {}
  }

  function toggleAudioPlayPause() {
    if (!audioState.isPlaying) {
      startAudioTTS(state.bookNo, state.chap, 1);
      return;
    }

    if (audioState.synth.paused || audioState.isPaused) {
      audioState.synth.resume();
      audioState.isPaused = false;
      if (el.audioToggleBtn) el.audioToggleBtn.textContent = '⏸';
      if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'playing';
    } else {
      audioState.synth.pause();
      audioState.isPaused = true;
      if (el.audioToggleBtn) el.audioToggleBtn.textContent = '▶';
      if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'paused';
    }
  }

  function stepAudioVerse(dir) {
    var nextSec = audioState.sec + dir;
    if (nextSec >= 1 && nextSec <= audioState.totalSecs) {
      audioState.sec = nextSec;
      readCurrentVerseAudio();
    } else if (nextSec > audioState.totalSecs) {
      stopAudioTTS();
    }
  }

  function stopAudioTTS() {
    audioState.isPlaying = false;
    audioState.isPaused = false;
    if (audioState.synth) audioState.synth.cancel();
    if (el.audioControlBar) el.audioControlBar.hidden = true;
    if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'none';
    document.querySelectorAll('.audio-reading-active').forEach(function (n) {
      n.classList.remove('audio-reading-active');
    });
  }

  /* ---------- 靈修研經與書籤中心 (Study Center Modal) ---------- */
  var studyCenterTab = 'history';
  var hlFilterColor = 'all';

  var studyBookmarkQuery = '';
  var studySelectedTag = 'all';

  function buildStudyCenterUI() {
    if (el.readerStudyBtn) el.readerStudyBtn.addEventListener('click', function () { openStudyCenter(); });
    if (el.studyCloseBtn) el.studyCloseBtn.addEventListener('click', closeStudyCenter);
    if (el.studyOverlay) el.studyOverlay.addEventListener('click', closeStudyCenter);

    if (el.studyNavTabs) {
      el.studyNavTabs.querySelectorAll('.study-tab-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
          studyCenterTab = btn.getAttribute('data-studytab');
          renderStudyCenter();
        });
      });
    }

    if (el.studyBookmarkSearch) {
      el.studyBookmarkSearch.addEventListener('input', function () {
        studyBookmarkQuery = (el.studyBookmarkSearch.value || '').trim().toLowerCase();
        renderStudyBookmarks();
      });
    }

    if (el.clearHistoryBtn) {
      el.clearHistoryBtn.addEventListener('click', function () {
        readHistory = [];
        saveUserAsset('biblia_history', readHistory);
        renderStudyCenter();
        showToast('已清空閱讀歷程');
      });
    }

    if (el.studyHlFilterPills) {
      el.studyHlFilterPills.querySelectorAll('.hl-pill-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
          hlFilterColor = btn.getAttribute('data-color');
          renderStudyCenter();
        });
      });
    }

    // 備份匯出與匯入
    if (el.exportBackupBtn) {
      el.exportBackupBtn.addEventListener('click', function () {
        var backupData = {
          version: 'Biblia_Backup_v4',
          exportedAt: new Date().toISOString(),
          bookmarks: bookmarks,
          highlights: highlights,
          history: readHistory,
          planProgress: planProgress
        };
        var blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = 'biblia_backup_' + todayIso() + '.json';
        a.click();
        URL.revokeObjectURL(url);
        showToast('已匯出備份檔案 📥');
      });
    }

    if (el.importBackupInput) {
      el.importBackupInput.addEventListener('change', function (e) {
        var file = e.target.files[0];
        if (!file) return;
        var reader = new FileReader();
        reader.onload = function (evt) {
          try {
            var data = JSON.parse(evt.target.result);
            if (data.bookmarks) { bookmarks = Object.assign(bookmarks, data.bookmarks); saveUserAsset('biblia_bookmarks', bookmarks); }
            if (data.highlights) { highlights = Object.assign(highlights, data.highlights); saveUserAsset('biblia_highlights', highlights); }
            if (data.history) { readHistory = data.history; saveUserAsset('biblia_history', readHistory); }
            if (data.planProgress) { planProgress = Object.assign(planProgress, data.planProgress); savePlanProgress(); }

            renderStudyCenter();
            render();
            if (el.backupStatusMsg) {
              el.backupStatusMsg.textContent = '✓ 成功還原備份資料（' + new Date().toLocaleTimeString() + '）';
            }
            showToast('已成功還原備份資料！✓');
          } catch (err) {
            alert('匯入失敗：檔案格式不正確。');
          }
        };
        reader.readAsText(file);
      });
    }
  }

  function openStudyCenter(tab) {
    if (tab) studyCenterTab = tab;
    el.studyCenterModal.hidden = false;
    renderStudyCenter();
  }

  function closeStudyCenter() {
    if (el.studyCenterModal) el.studyCenterModal.hidden = true;
  }

  function renderStudyCenter() {
    if (!el.studyNavTabs) return;

    el.studyNavTabs.querySelectorAll('.study-tab-btn').forEach(function (btn) {
      var isAct = btn.getAttribute('data-studytab') === studyCenterTab;
      btn.classList.toggle('active', isAct);
      btn.setAttribute('aria-selected', isAct ? 'true' : 'false');
    });

    if (el.studyPanelHistory) el.studyPanelHistory.hidden = (studyCenterTab !== 'history');
    if (el.studyPanelBookmarks) el.studyPanelBookmarks.hidden = (studyCenterTab !== 'bookmarks');
    if (el.studyPanelHighlights) el.studyPanelHighlights.hidden = (studyCenterTab !== 'highlights');
    if (el.studyPanelBackup) el.studyPanelBackup.hidden = (studyCenterTab !== 'backup');

    if (studyCenterTab === 'history') {
      renderStudyHistory();
    } else if (studyCenterTab === 'bookmarks') {
      renderStudyBookmarks();
    } else if (studyCenterTab === 'highlights') {
      renderStudyHighlights();
    }
  }

  function renderStudyHistory() {
    if (!el.studyHistoryList) return;
    if (!readHistory.length) {
      el.studyHistoryList.innerHTML = '<p class="placeholder">尚無閱讀歷程紀錄</p>';
      return;
    }

    var htmlStr = '';
    readHistory.forEach(function (h) {
      htmlStr += '<div class="study-item-card">' +
        '<div class="study-item-top">' +
          '<span class="study-item-ref" data-bookno="' + h.bookNo + '" data-chap="' + h.chap + '">' + escapeHtml(h.bookZh) + ' 第 ' + h.chap + ' 章</span>' +
          '<span class="study-item-time">' + escapeHtml(h.time) + '</span>' +
        '</div></div>';
    });
    el.studyHistoryList.innerHTML = htmlStr;

    el.studyHistoryList.querySelectorAll('.study-item-ref').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var bNo = parseInt(btn.getAttribute('data-bookno'), 10);
        var ch = parseInt(btn.getAttribute('data-chap'), 10);
        closeStudyCenter();
        showReader(bNo, ch);
      });
    });
  }

  function renderStudyBookmarks() {
    if (!el.studyBookmarksList) return;
    var allKeys = Object.keys(bookmarks);

    // 收集所有標籤
    var tagCounts = {};
    allKeys.forEach(function (k) {
      var bm = bookmarks[k];
      if (bm && bm.tags && Array.isArray(bm.tags)) {
        bm.tags.forEach(function (t) {
          tagCounts[t] = (tagCounts[t] || 0) + 1;
        });
      }
    });

    // 渲染標籤篩選列
    if (el.studyTagFilterRow) {
      var tagKeys = Object.keys(tagCounts);
      if (tagKeys.length > 0) {
        var pillsHtml = '<button type="button" class="study-tag-chip' + (studySelectedTag === 'all' ? ' active' : '') + '" data-tag="all">全部 (' + allKeys.length + ')</button>';
        tagKeys.forEach(function (t) {
          pillsHtml += '<button type="button" class="study-tag-chip' + (studySelectedTag === t ? ' active' : '') + '" data-tag="' + escapeHtml(t) + '">' + escapeHtml(t) + ' (' + tagCounts[t] + ')</button>';
        });
        el.studyTagFilterRow.innerHTML = pillsHtml;
        el.studyTagFilterRow.querySelectorAll('.study-tag-chip').forEach(function (chip) {
          chip.addEventListener('click', function () {
            studySelectedTag = chip.getAttribute('data-tag');
            renderStudyBookmarks();
          });
        });
      } else {
        el.studyTagFilterRow.innerHTML = '';
      }
    }

    // 依關鍵字與標籤過濾
    var filteredKeys = allKeys.filter(function (k) {
      var bm = bookmarks[k];
      if (!bm) return false;
      if (studySelectedTag !== 'all') {
        if (!bm.tags || bm.tags.indexOf(studySelectedTag) === -1) return false;
      }
      if (studyBookmarkQuery) {
        var matchRef = (bm.bookZh + ' ' + bm.chap + ':' + bm.sec).toLowerCase().indexOf(studyBookmarkQuery) !== -1;
        var matchText = (bm.text || '').toLowerCase().indexOf(studyBookmarkQuery) !== -1;
        var matchNote = (bm.note || '').toLowerCase().indexOf(studyBookmarkQuery) !== -1;
        var matchTag = (bm.tags || []).some(function (t) { return t.toLowerCase().indexOf(studyBookmarkQuery) !== -1; });
        return matchRef || matchText || matchNote || matchTag;
      }
      return true;
    });

    if (el.bookmarksCountText) {
      el.bookmarksCountText.textContent = '共 ' + filteredKeys.length + ' 條書籤' + (allKeys.length !== filteredKeys.length ? '（篩選中）' : '');
    }

    if (!filteredKeys.length) {
      el.studyBookmarksList.innerHTML = '<p class="placeholder">' + (allKeys.length ? '查無相符之書籤筆記' : '尚無書籤收藏。點擊經文節號即可將感動經文加入書籤！') + '</p>';
      return;
    }

    var htmlStr = '';
    filteredKeys.forEach(function (k) {
      var bm = bookmarks[k];
      var tagsHtml = '';
      if (bm.tags && bm.tags.length) {
        tagsHtml = '<div class="study-card-tags">';
        bm.tags.forEach(function (t) {
          tagsHtml += '<span class="study-tag-pill">' + escapeHtml(t) + '</span>';
        });
        tagsHtml += '</div>';
      }

      htmlStr += '<div class="study-item-card">' +
        '<div class="study-item-top">' +
          '<span class="study-item-ref" data-bookno="' + bm.bookNo + '" data-chap="' + bm.chap + '" data-sec="' + bm.sec + '">' +
            '★ ' + escapeHtml(bm.bookZh) + ' ' + bm.chap + ':' + bm.sec + '</span>' +
          '<span class="study-item-time">' + escapeHtml(bm.time || '') + '</span>' +
        '</div>' +
        '<div class="study-item-text">' + escapeHtml(bm.text || '') + '</div>' +
        (bm.note ? ('<div class="study-note-box">📝 <strong>筆記：</strong>' + escapeHtml(bm.note) + '</div>') : '') +
        tagsHtml +
        '<div class="study-item-actions">' +
          '<button type="button" class="btn btn-sm btn-ghost edit-note-btn" data-key="' + k + '">✏️ 編輯筆記/標籤</button>' +
          '<button type="button" class="btn btn-sm btn-ghost del-bm-btn" data-key="' + k + '">✕ 刪除</button>' +
        '</div></div>';
    });
    el.studyBookmarksList.innerHTML = htmlStr;

    el.studyBookmarksList.querySelectorAll('.study-item-ref').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var bNo = parseInt(btn.getAttribute('data-bookno'), 10);
        var ch = parseInt(btn.getAttribute('data-chap'), 10);
        var sec = parseInt(btn.getAttribute('data-sec'), 10);
        closeStudyCenter();
        jumpToVerse(bNo, ch, sec);
      });
    });

    el.studyBookmarksList.querySelectorAll('.del-bm-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var k = btn.getAttribute('data-key');
        delete bookmarks[k];
        saveUserAsset('biblia_bookmarks', bookmarks);
        renderStudyBookmarks();
        render();
        showToast('已刪除書籤');
      });
    });

    el.studyBookmarksList.querySelectorAll('.edit-note-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var k = btn.getAttribute('data-key');
        var bm = bookmarks[k];
        if (bm) {
          openVerseNoteModal(bm.bookNo, bm.chap, bm.sec);
        }
      });
    });
  }

  function renderStudyHighlights() {
    if (!el.studyHighlightsList) return;
    if (el.studyHlFilterPills) {
      el.studyHlFilterPills.querySelectorAll('.hl-pill-btn').forEach(function (btn) {
        btn.classList.toggle('active', btn.getAttribute('data-color') === hlFilterColor);
      });
    }

    var keys = Object.keys(highlights);
    var filteredKeys = keys.filter(function (k) {
      return hlFilterColor === 'all' || highlights[k] === hlFilterColor;
    });

    if (!filteredKeys.length) {
      el.studyHighlightsList.innerHTML = '<p class="placeholder">此篩選條件下無螢光標記經文</p>';
      return;
    }

    var htmlStr = '';
    filteredKeys.forEach(function (k) {
      var parts = k.split(':');
      var bNo = parseInt(parts[0], 10);
      var ch = parseInt(parts[1], 10);
      var sec = parseInt(parts[2], 10);
      var bMeta = state.byNo[bNo];
      var color = highlights[k];

      var colorEmoji = { yellow: '💛 金黃', green: '🌿 草綠', blue: '💧 天藍', pink: '🌸 粉紅' }[color] || color;

      htmlStr += '<div class="study-item-card hl-' + color + '">' +
        '<div class="study-item-top">' +
          '<span class="study-item-ref" data-bookno="' + bNo + '" data-chap="' + ch + '" data-sec="' + sec + '">' +
            escapeHtml(bMeta ? bMeta.zh : '') + ' ' + ch + ':' + sec + '</span>' +
          '<span class="study-item-time">' + colorEmoji + '</span>' +
        '</div>' +
        '<div class="study-item-actions">' +
          '<button type="button" class="btn btn-sm btn-ghost del-hl-btn" data-key="' + k + '">✕ 清除高亮</button>' +
        '</div></div>';
    });
    el.studyHighlightsList.innerHTML = htmlStr;

    el.studyHighlightsList.querySelectorAll('.study-item-ref').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var bNo = parseInt(btn.getAttribute('data-bookno'), 10);
        var ch = parseInt(btn.getAttribute('data-chap'), 10);
        var sec = parseInt(btn.getAttribute('data-sec'), 10);
        closeStudyCenter();
        jumpToVerse(bNo, ch, sec);
      });
    });

    el.studyHighlightsList.querySelectorAll('.del-hl-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var k = btn.getAttribute('data-key');
        delete highlights[k];
        saveUserAsset('biblia_highlights', highlights);
        renderStudyHighlights();
        render();
        showToast('已清除高亮');
      });
    });
  }

  /* ---------- 全域鍵盤快捷鍵指南 (Shortcuts Modal) ---------- */
  function buildShortcutsGuide() {
    if (el.shortcutsBtn) el.shortcutsBtn.addEventListener('click', openShortcutsGuide);
    if (el.shortcutsCloseBtn) el.shortcutsCloseBtn.addEventListener('click', closeShortcutsGuide);
    if (el.shortcutsOverlay) el.shortcutsOverlay.addEventListener('click', closeShortcutsGuide);
  }

  function openShortcutsGuide() {
    if (el.shortcutsModal) el.shortcutsModal.hidden = false;
  }

  function closeShortcutsGuide() {
    if (el.shortcutsModal) el.shortcutsModal.hidden = true;
  }

  /* ---------- URL Hash 路由與同步 ---------- */
  function updateHash() {
    if (!el.startView || el.startView.hidden === false) {
      if (window.location.hash) {
        try { history.replaceState(null, '', window.location.pathname + window.location.search); } catch (e) {}
      }
    } else if (el.planView && !el.planView.hidden) {
      try { history.replaceState(null, '', '#plan'); } catch (e) {}
    } else if (el.refView && !el.refView.hidden) {
      try { history.replaceState(null, '', '#ref' + (refState && refState.activeTab ? '/' + refState.activeTab : '')); } catch (e) {}
    } else if (el.readerView && !el.readerView.hidden) {
      var bMeta = state.byNo[state.bookNo];
      var bKey = bMeta ? bMeta.abbr : state.bookNo;
      try { history.replaceState(null, '', '#read/' + bKey + '/' + state.chap); } catch (e) {}
    }
  }

  function handleHash() {
    var hash = window.location.hash || '';
    if (!hash || hash === '#' || hash === '#/') return;
    if (hash === '#plan') {
      showPlan();
      return;
    }
    if (hash.indexOf('#ref') === 0) {
      var refTab = hash.split('/')[1] || 'su101';
      showRef(refTab);
      return;
    }
    if (hash === '#study') {
      openStudyCenter();
      return;
    }
    var m = hash.match(/^#read\/([^\/]+)(?:\/(\d+))?(?:\/(\d+))?$/);
    if (m) {
      var bkKey = decodeURIComponent(m[1]).toLowerCase();
      var chap = m[2] ? parseInt(m[2], 10) : 1;
      var sec = m[3] ? parseInt(m[3], 10) : null;
      var targetBookNo = null;
      var num = parseInt(bkKey, 10);
      if (!isNaN(num) && state.byNo[num]) {
        targetBookNo = num;
      } else {
        for (var i = 0; i < state.index.length; i++) {
          var b = state.index[i];
          if ((b.abbr && b.abbr.toLowerCase() === bkKey) ||
              (b.zh && b.zh.toLowerCase() === bkKey) ||
              (b.en && b.en.toLowerCase() === bkKey)) {
            targetBookNo = b.no;
            break;
          }
        }
      }
      if (targetBookNo) {
        if (sec) {
          jumpToVerse(targetBookNo, chap, sec);
        } else {
          showReader(targetBookNo, chap);
        }
      }
    }
  }

  /* ---------- 檢視切換 ---------- */
  function showStart() {
    el.readerView.hidden = true;
    if (el.planView) el.planView.hidden = true;
    if (el.refView) el.refView.hidden = true;
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
    renderDailyVerseWidget();
    window.scrollTo(0, 0);
    updateHash();
  }

  function showReader(no, chap, cb) {
    el.startView.hidden = true;
    if (el.planView) el.planView.hidden = true;
    if (el.refView) el.refView.hidden = true;
    el.readerView.hidden = false;
    measureLayout();
    go(no, chap, cb);
    updateHash();
  }

  function showPlan() {
    el.startView.hidden = true;
    el.readerView.hidden = true;
    if (el.refView) el.refView.hidden = true;
    if (el.planView) el.planView.hidden = false;
    renderPlan();
    window.scrollTo(0, 0);
    updateHash();
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
      sub: '2026 逐季累積',
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
          link: it.link || '',
          src: it.src || ''
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
        coverageNote: raw.coverageNote || '',
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
        renderPlanList();
      });
    }

    if (el.planSearchInput) {
      el.planSearchInput.addEventListener('input', function () {
        planFilterState.query = el.planSearchInput.value.trim().toLowerCase();
        renderPlanList();
      });
    }

    if (el.planHomeBtn) el.planHomeBtn.addEventListener('click', showStart);
    if (el.planReaderBtn) el.planReaderBtn.addEventListener('click', function () {
      showReader(state.bookNo, state.chap);
    });
    if (el.planRefBtn) el.planRefBtn.addEventListener('click', function () { showRef(); });

    if (el.planThemeBtn) {
      el.planThemeBtn.addEventListener('click', function () {
        var next = { light: 'sepia', sepia: 'dark', dark: 'oled', oled: 'light' }[state.theme] || 'light';
        applyTheme(next);
        save();
      });
    }

    if (el.planMarkTodayBtn) {
      el.planMarkTodayBtn.addEventListener('click', function () {
        var plan = currentPlan();
        var todayIt = todayItemOf(plan);
        if (!todayIt) return;
        var p = progressOf(plan);
        p[todayIt.id] = !p[todayIt.id];
        savePlanProgress();
        updatePlanStats();
        renderPlanList();
      });
    }

    if (el.planJumpTodayBtn) {
      el.planJumpTodayBtn.addEventListener('click', function () {
        var plan = currentPlan();
        var todayIt = todayItemOf(plan);
        if (!todayIt) {
          alert('今天（' + todayIso() + '）不在目前計畫的進度範圍內。');
          return;
        }
        planFilterState.month = todayIt.month;
        planFilterState.week = 'all';
        planFilterState.query = '';
        if (el.planSearchInput) el.planSearchInput.value = '';
        renderPlan(function () {
          var target = document.getElementById('plan-item-' + todayIt.id);
          if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'center' });
            target.classList.add('plan-target-highlight');
            setTimeout(function () { target.classList.remove('plan-target-highlight'); }, 2400);
          }
        });
      });
    }

    if (el.startPlanBtn) el.startPlanBtn.addEventListener('click', showPlan);
    if (el.readerPlanBtn) el.readerPlanBtn.addEventListener('click', showPlan);
  }

  function buildPlanSwitch() {
    if (!el.planSwitch) return;
    el.planSwitch.innerHTML = '';
    plans.forEach(function (p, i) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'plan-switch-btn' + (i === planIdx ? ' active' : '');
      btn.setAttribute('role', 'tab');
      btn.setAttribute('aria-selected', i === planIdx ? 'true' : 'false');
      btn.innerHTML = '<span class="plan-switch-main">' + escapeHtml(p.name) + '</span>' +
                      '<span class="plan-switch-sub">' + escapeHtml(p.sub) + '</span>';
      btn.addEventListener('click', function () {
        if (planIdx === i) return;
        planIdx = i;
        try { localStorage.setItem('biblia_plan_id', p.id); } catch (e) {}
        planFilterState.month = 'all';
        planFilterState.week = 'all';
        planFilterState.query = '';
        if (el.planSearchInput) el.planSearchInput.value = '';
        buildPlanSwitch();
        renderPlan();
      });
      el.planSwitch.appendChild(btn);
    });
  }

  function renderStartPlanCard() {
    if (!el.startPlanTodayBox) return;
    normalisePlans();
    if (!plans.length) return;

    var iso = todayIso();
    var parts = iso.split('-');
    var d = new Date(+parts[0], +parts[1] - 1, +parts[2]);
    var dateLabel = (+parts[1]) + ' 月 ' + (+parts[2]) + ' 日 ' + WEEKDAY[d.getDay()];
    if (el.startPlanDate) el.startPlanDate.textContent = dateLabel;

    el.startPlanTodayBox.innerHTML = '';
    var frag = document.createDocumentFragment();

    plans.forEach(function (plan) {
      var it = todayItemOf(plan);
      var card = document.createElement('div');
      card.className = 'start-plan-subcard';

      var top = document.createElement('div');
      top.className = 'start-plan-subtop';

      var name = document.createElement('span');
      name.className = 'start-plan-subname';
      name.textContent = plan.name;
      top.appendChild(name);

      if (it) {
        var p = progressOf(plan);
        var done = !!p[it.id];
        var chk = document.createElement('label');
        chk.className = 'start-plan-chk';
        var box = document.createElement('input');
        box.type = 'checkbox';
        box.checked = done;
        box.addEventListener('change', function () {
          p[it.id] = box.checked;
          savePlanProgress();
          renderStartPlanCard();
        });
        chk.appendChild(box);
        var chkText = document.createElement('span');
        chkText.textContent = done ? '今日已讀 ✓' : '標為已讀';
        chk.appendChild(chkText);
        top.appendChild(chk);
      }
      card.appendChild(top);

      var body = document.createElement('div');
      body.className = 'start-plan-subbody';
      if (it) {
        var rawT = document.createElement('div');
        rawT.className = 'start-plan-rawtext';
        rawT.textContent = it.rawText;
        body.appendChild(rawT);

        if (it.passages && it.passages.length) {
          body.appendChild(passageChips(it.passages));
        }
      } else {
        var nodata = document.createElement('div');
        nodata.className = 'start-plan-nodata';
        nodata.textContent = '今日非此計畫進度日';
        body.appendChild(nodata);
      }
      card.appendChild(body);
      frag.appendChild(card);
    });

    el.startPlanTodayBox.appendChild(frag);
  }

  function renderPlan(cb) {
    var plan = currentPlan();
    if (!plan) return;

    if (el.planHeadTitle) el.planHeadTitle.textContent = plan.name;
    if (el.planTitle) el.planTitle.textContent = plan.title;
    if (el.planSubtitle) {
      el.planSubtitle.textContent = plan.subtitle || (plan.sub + (plan.org ? ' · ' + plan.org : ''));
    }
    if (el.planSource) {
      el.planSource.innerHTML = '';
      if (plan.coverage) {
        var span = document.createElement('span');
        span.className = 'plan-coverage-badge';
        span.textContent = plan.coverage;
        el.planSource.appendChild(span);
      }
      if (plan.sourceUrl) {
        var a = document.createElement('a');
        a.href = plan.sourceUrl;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.textContent = plan.org ? ('來源：' + plan.org + ' ↗') : '官方網頁 ↗';
        el.planSource.appendChild(a);
      }
      if (plan.note) {
        var noteSpan = document.createElement('span');
        noteSpan.textContent = plan.note;
        el.planSource.appendChild(noteSpan);
      }
    }

    renderMonthTabs(plan);
    renderWeekSelect(plan);
    updatePlanStats();
    renderPlanList();
    if (cb) cb();
  }

  function renderMonthTabs(plan) {
    if (!el.planMonthTabs) return;
    el.planMonthTabs.innerHTML = '';
    var frag = document.createDocumentFragment();

    var allBtn = document.createElement('button');
    allBtn.type = 'button';
    allBtn.className = 'plan-tab' + (planFilterState.month === 'all' ? ' active' : '');
    allBtn.textContent = '全部 (' + plan.items.length + '天)';
    allBtn.addEventListener('click', function () {
      planFilterState.month = 'all';
      renderMonthTabs(plan);
      renderPlanList();
    });
    frag.appendChild(allBtn);

    plan.months.forEach(function (m) {
      var count = plan.items.filter(function (it) { return it.month === m; }).length;
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'plan-tab' + (planFilterState.month === m ? ' active' : '');
      btn.textContent = m + ' 月 (' + count + ')';
      btn.addEventListener('click', function () {
        planFilterState.month = m;
        renderMonthTabs(plan);
        renderPlanList();
      });
      frag.appendChild(btn);
    });

    el.planMonthTabs.appendChild(frag);
  }

  function renderWeekSelect(plan) {
    if (!el.planWeekSelect) return;
    el.planWeekSelect.innerHTML = '<option value="all">所有週次</option>';
    plan.weeks.forEach(function (w) {
      var o = document.createElement('option');
      o.value = w;
      o.textContent = '第 ' + w + ' 週';
      if (planFilterState.week === String(w)) o.selected = true;
      el.planWeekSelect.appendChild(o);
    });
  }

  function computeReadingStreaks() {
    var allDays = {};
    try {
      var prog = planProgress || {};
      Object.keys(prog).forEach(function (pk) {
        if (prog[pk] && typeof prog[pk] === 'object') {
          Object.keys(prog[pk]).forEach(function (k) { if (prog[pk][k]) allDays[k] = true; });
        }
      });
    } catch (e) {}

    (readHistory || []).forEach(function (h) {
      if (h.time) {
        var parts = h.time.split(' ')[0];
        if (parts) allDays['2026/' + parts] = true;
      }
    });

    var today = new Date();
    var streak = 0;
    var checkDate = new Date(today);

    for (var i = 0; i < 365; i++) {
      var y = checkDate.getFullYear();
      var m = checkDate.getMonth() + 1;
      var d = checkDate.getDate();
      var pad = function (n) { return n < 10 ? '0' + n : '' + n; };
      var kIso = y + '-' + pad(m) + '-' + pad(d);

      var isHit = Object.keys(allDays).some(function (k) {
        return k.indexOf(kIso) !== -1 || k.indexOf(m + '/' + d) !== -1 || k.indexOf(pad(m) + '/' + pad(d)) !== -1;
      });

      if (isHit || (i === 0 && streak === 0)) {
        if (isHit) streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  }

  function updatePlanStats() {
    var plan = currentPlan();
    if (!plan) return;
    var p = progressOf(plan);
    var done = 0;
    plan.items.forEach(function (it) { if (p[it.id]) done++; });
    var total = plan.items.length;
    var percent = total ? Math.round((done / total) * 100) : 0;

    if (el.planStatsPercent) el.planStatsPercent.textContent = percent + '%';
    if (el.planStatsCount) el.planStatsCount.textContent = '已完成 ' + done + ' / ' + total + ' 天';
    if (el.planProgressFill) el.planProgressFill.style.width = percent + '%';
    if (el.planProgressBar) el.planProgressBar.setAttribute('aria-valuenow', percent);

    if (el.planStreakBadge) {
      var streaks = computeReadingStreaks();
      el.planStreakBadge.textContent = '🔥 連續 ' + streaks + ' 天';
      el.planStreakBadge.title = '持續讀經 ' + streaks + ' 天！堅持不懈，生命豐盛！';
    }

    var todayIt = todayItemOf(plan);
    if (el.planMarkTodayBtn) {
      if (todayIt) {
        var todayDone = !!p[todayIt.id];
        el.planMarkTodayBtn.disabled = false;
        el.planMarkTodayBtn.textContent = todayDone ? '✓ 今日已讀（點擊取消）' : '✓ 標記今天已讀';
        el.planMarkTodayBtn.classList.toggle('done', todayDone);
      } else {
        el.planMarkTodayBtn.disabled = true;
        el.planMarkTodayBtn.textContent = '今天非進度日';
        el.planMarkTodayBtn.classList.remove('done');
      }
    }
  }

  function renderPlanList() {
    if (!el.planList) return;
    var plan = currentPlan();
    if (!plan) return;

    var filtered = plan.items.filter(function (it) {
      if (planFilterState.month !== 'all' && it.month !== planFilterState.month) return false;
      if (planFilterState.week !== 'all' && String(it.week) !== String(planFilterState.week)) return false;
      if (planFilterState.query) {
        var q = planFilterState.query;
        var inRaw = it.rawText.toLowerCase().indexOf(q) !== -1;
        var inDate = it.date.indexOf(q) !== -1 || (it.isoDate && it.isoDate.indexOf(q) !== -1);
        var inPass = it.passages.some(function (p) {
          var b = state.byNo[p.bookNo];
          return (b && b.zh.indexOf(q) !== -1) || p.label.toLowerCase().indexOf(q) !== -1;
        });
        if (!inRaw && !inDate && !inPass) return false;
      }
      return true;
    });

    el.planList.innerHTML = '';
    if (!filtered.length) {
      var emp = document.createElement('div');
      emp.className = 'plan-empty';
      emp.textContent = '沒有符合條件的讀經進度';
      el.planList.appendChild(emp);
      return;
    }

    var byWeek = {};
    filtered.forEach(function (it) {
      var w = it.week || 0;
      if (!byWeek[w]) byWeek[w] = [];
      byWeek[w].push(it);
    });

    var todayStr = todayIso();
    var frag = document.createDocumentFragment();

    Object.keys(byWeek).sort(function (a, b) { return a - b; }).forEach(function (w) {
      var sec = document.createElement('section');
      sec.className = 'plan-week-section';

      if (w !== '0') {
        var head = document.createElement('h2');
        head.className = 'plan-week-title';
        head.textContent = '第 ' + w + ' 週';
        sec.appendChild(head);
      }

      var grid = document.createElement('div');
      grid.className = 'plan-grid';
      byWeek[w].forEach(function (it) {
        grid.appendChild(buildPlanItemCard(plan, it, it.isoDate === todayStr));
      });
      sec.appendChild(grid);
      frag.appendChild(sec);
    });

    el.planList.appendChild(frag);
  }

  function buildPlanItemCard(plan, it, isToday) {
    var p = progressOf(plan);
    var done = !!p[it.id];

    var card = document.createElement('div');
    card.className = 'plan-card' + (done ? ' done' : '') + (isToday ? ' today' : '');
    card.id = 'plan-item-' + it.id;

    var head = document.createElement('div');
    head.className = 'plan-card-head';

    var dateBadge = document.createElement('div');
    dateBadge.className = 'plan-card-date';
    dateBadge.innerHTML = '<span class="plan-date-num">' + escapeHtml(it.date) + '</span>' +
                          '<span class="plan-date-wd">' + escapeHtml(it.wd) + '</span>';
    head.appendChild(dateBadge);

    if (isToday) {
      var todayPill = document.createElement('span');
      todayPill.className = 'plan-today-pill';
      todayPill.textContent = '今日';
      head.appendChild(todayPill);
    }

    var chk = document.createElement('label');
    chk.className = 'plan-chk';
    var box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = done;
    box.addEventListener('change', function () {
      p[it.id] = box.checked;
      savePlanProgress();
      card.classList.toggle('done', box.checked);
      updatePlanStats();
    });
    chk.appendChild(box);
    var mark = document.createElement('span');
    mark.className = 'plan-chk-mark';
    mark.setAttribute('aria-hidden', 'true');
    chk.appendChild(mark);
    head.appendChild(chk);
    card.appendChild(head);

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
      a.textContent = it.src === 'plan' ? '看整季進度表 ↗' : '看當日釋義 ↗';
      body.appendChild(a);
    }

    card.appendChild(body);
    return card;
  }

  function passageChips(passages) {
    var wrap = document.createElement('div');
    wrap.className = 'plan-passages';
    passages.forEach(function (pass) {
      var bMeta = state.byNo[pass.bookNo];
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'plan-pass-btn';
      btn.innerHTML = '<span class="plan-pass-icon" aria-hidden="true">📖</span>' +
                      '<span class="plan-pass-label">' + escapeHtml(pass.label) + '</span>';
      btn.title = '前往 ' + (bMeta ? bMeta.zh : '') + ' 第 ' + pass.chap + ' 章';
      btn.addEventListener('click', function () {
        jumpToVerse(pass.bookNo, pass.chap, pass.secStart || 1);
      });
      wrap.appendChild(btn);
    });
    return wrap;
  }

  /* ===================== 讀經會補充資料庫邏輯 ===================== */
  var refState = {
    activeTab: 'su101',       // 'su101' | 'intros' | 'timeline'
    su101Quarter: 'all',
    su101Search: '',
    introsCategory: 'all',
    introsSearch: '',
    timelineTab: 'eras'       // 'eras' | 'prophets' | 'calendar' | 'charts'
  };

  function buildRefUI() {
    if (el.startRefBtn) el.startRefBtn.addEventListener('click', function () { showRef(); });
    if (el.readerRefBtn) el.readerRefBtn.addEventListener('click', function () { showRef(); });
    if (el.planRefBtn) el.planRefBtn.addEventListener('click', function () { showRef(); });
    if (el.refHomeBtn) el.refHomeBtn.addEventListener('click', function () { showStart(); });
    if (el.refReaderBtn) el.refReaderBtn.addEventListener('click', function () { showReader(state.bookNo, state.chap); });
    if (el.refPlanBtn) el.refPlanBtn.addEventListener('click', function () { showPlan(); });
    if (el.refThemeBtn) el.refThemeBtn.addEventListener('click', function () {
      var next = { light: 'sepia', sepia: 'dark', dark: 'oled', oled: 'light' }[state.theme] || 'light';
      applyTheme(next);
      save();
    });

    if (el.refNavTabs) {
      el.refNavTabs.querySelectorAll('.ref-tab-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var tab = btn.getAttribute('data-reftab');
          refState.activeTab = tab;
          renderRefView();
        });
      });
    }
  }

  function showRef(tabName) {
    if (tabName) refState.activeTab = tabName;
    el.startView.hidden = true;
    el.readerView.hidden = true;
    if (el.planView) el.planView.hidden = true;
    if (el.refView) el.refView.hidden = false;
    renderRefView();
    window.scrollTo(0, 0);
    updateHash();
  }

  function renderRefView() {
    if (el.refNavTabs) {
      el.refNavTabs.querySelectorAll('.ref-tab-btn').forEach(function (btn) {
        var isCurrent = btn.getAttribute('data-reftab') === refState.activeTab;
        btn.classList.toggle('active', isCurrent);
        btn.setAttribute('aria-selected', isCurrent ? 'true' : 'false');
      });
    }

    if (el.refPanelSu101) el.refPanelSu101.hidden = (refState.activeTab !== 'su101');
    if (el.refPanelIntros) el.refPanelIntros.hidden = (refState.activeTab !== 'intros');
    if (el.refPanelTimeline) el.refPanelTimeline.hidden = (refState.activeTab !== 'timeline');

    if (refState.activeTab === 'su101') renderRefPanelSu101();
    else if (refState.activeTab === 'intros') renderRefPanelIntros();
    else if (refState.activeTab === 'timeline') renderRefPanelTimeline();
  }

  function findBookNoFromTitle(title) {
    if (!title) return null;
    var clean = title.replace(/[《》\s]/g, '');
    var books = state.index || [];
    for (var i = 0; i < books.length; i++) {
      var b = books[i];
      if (clean.indexOf(b.zh) !== -1 || (b.ab && clean.indexOf(b.ab) !== -1)) {
        return b.no;
      }
    }
    return null;
  }

  function parseLinksFromHtml(htmlContent) {
    if (!htmlContent) return [];
    var links = [];
    var re = /<a[^>]+href="([^"]+)"[^>]*>(.*?)<\/a>/gi;
    var match;
    var count = 0;
    while ((match = re.exec(htmlContent)) !== null && count < 15) {
      var url = match[1];
      var rawLabel = match[2].replace(/<[^>]+>/g, '').trim();
      var label = rawLabel || url;
      if (url && !url.startsWith('javascript:')) {
        links.push({ url: url, label: label });
        count++;
      }
    }
    return links;
  }

  function renderRefPanelSu101() {
    var container = el.refPanelSu101;
    if (!container) return;

    var items = window.BIBLIA_SU101_REFERENCES || [];

    var quartersMap = {};
    items.forEach(function (it) {
      if (it.quarter) quartersMap[it.quarter] = (quartersMap[it.quarter] || 0) + 1;
    });

    var quartersList = ['all'].concat(Object.keys(quartersMap));

    var filtered = items.filter(function (it) {
      if (refState.su101Quarter !== 'all' && it.quarter !== refState.su101Quarter) return false;
      if (refState.su101Search) {
        var q = refState.su101Search.toLowerCase().trim();
        var matchTitle = (it.title || '').toLowerCase().includes(q);
        var matchQuarter = (it.quarter || '').toLowerCase().includes(q);
        var matchContent = (it.content_html || '').toLowerCase().includes(q);
        if (!matchTitle && !matchQuarter && !matchContent) return false;
      }
      return true;
    });

    var htmlStr = '<div class="ref-sub-header">' +
      '<div class="ref-search-row">' +
        '<input type="search" class="ref-search-input" id="refSu101SearchInput" placeholder="🔍 搜尋研經釋義資料（如 馬太福音、出埃及記、猶太曆...）" value="' + escapeHtml(refState.su101Search) + '">' +
      '</div>' +
      '<div class="ref-pills-row" id="refSu101QuarterPills">';

    quartersList.forEach(function (q) {
      var activeClass = refState.su101Quarter === q ? 'active' : '';
      var label = q === 'all' ? ('全部 (' + items.length + ')') : (q + ' (' + (quartersMap[q] || 0) + ')');
      htmlStr += '<button type="button" class="ref-pill-btn ' + activeClass + '" data-quarter="' + escapeHtml(q) + '">' + escapeHtml(label) + '</button>';
    });

    htmlStr += '</div>' +
      '<div class="ref-count-bar">找到 ' + filtered.length + ' 篇參考資料庫文獻</div>' +
    '</div>';

    htmlStr += '<div class="ref-cards-grid">';
    if (!filtered.length) {
      htmlStr += '<div class="ref-empty-state">查無符合關鍵字的參考資料</div>';
    } else {
      filtered.forEach(function (it) {
        var matchedBookNo = findBookNoFromTitle(it.title);
        var parsedLinks = parseLinksFromHtml(it.content_html);

        htmlStr += '<div class="ref-card">' +
          '<div class="ref-card-header">' +
            '<span class="ref-quarter-badge">' + escapeHtml(it.quarter || '參考資料') + '</span>' +
            '<h3 class="ref-card-title">' + escapeHtml(it.title) + '</h3>' +
          '</div>' +
          '<div class="ref-card-body">';

        if (parsedLinks.length) {
          htmlStr += '<ul class="ref-links-list">';
          parsedLinks.forEach(function (lk) {
            htmlStr += '<li><a href="' + escapeHtml(lk.url) + '" target="_blank" rel="noopener noreferrer" class="ref-ext-link">' +
              '<span class="ref-link-icon">🔗</span>' + escapeHtml(lk.label) + ' ↗</a></li>';
          });
          htmlStr += '</ul>';
        } else if (it.content_html) {
          htmlStr += '<div class="ref-raw-preview">' + it.content_html + '</div>';
        }

        htmlStr += '</div>' +
          '<div class="ref-card-footer">';

        if (matchedBookNo) {
          htmlStr += '<button type="button" class="btn btn-sm btn-primary ref-go-book-btn" data-bookno="' + matchedBookNo + '">' +
            '📖 開啟聖經經文</button>';
        }
        if (it.url) {
          htmlStr += '<a href="' + escapeHtml(it.url) + '" target="_blank" rel="noopener noreferrer" class="btn btn-sm ref-orig-link">' +
            '🌐 讀經會官網頁面 ↗</a>';
        }

        htmlStr += '</div></div>';
      });
    }
    htmlStr += '</div>';

    container.innerHTML = htmlStr;

    var searchInput = container.querySelector('#refSu101SearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', function () {
        refState.su101Search = searchInput.value;
        renderRefPanelSu101();
      });
    }

    var pillsRow = container.querySelector('#refSu101QuarterPills');
    if (pillsRow) {
      pillsRow.querySelectorAll('.ref-pill-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
          refState.su101Quarter = btn.getAttribute('data-quarter');
          renderRefPanelSu101();
        });
      });
    }

    container.querySelectorAll('.ref-go-book-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var bNo = parseInt(btn.getAttribute('data-bookno'), 10);
        if (bNo) showReader(bNo, 1);
      });
    });
  }

  function renderRefPanelIntros() {
    var container = el.refPanelIntros;
    if (!container) return;

    var intros = window.BIBLIA_BOOK_INTROS || [];

    var categories = [
      { key: 'all', label: '全部 (66卷)' },
      { key: 'ot', label: '舊約 (39卷)' },
      { key: 'nt', label: '新約 (27卷)' },
      { key: '律法書', label: '律法書 (5卷)' },
      { key: '歷史書', label: '歷史書 (13卷)' },
      { key: '詩歌智慧書', label: '詩歌智慧書 (5卷)' },
      { key: '大先知書', label: '大先知書 (5卷)' },
      { key: '小先知書', label: '小先知書 (12卷)' },
      { key: '福音書', label: '福音書 (4卷)' },
      { key: '保羅書信', label: '保羅書信 (13卷)' },
      { key: '通用書信', label: '通用與預言 (9卷)' }
    ];

    var filtered = intros.filter(function (b) {
      if (refState.introsCategory === 'ot' && b.testament !== 'OT') return false;
      if (refState.introsCategory === 'nt' && b.testament !== 'NT') return false;
      if (refState.introsCategory !== 'all' && refState.introsCategory !== 'ot' && refState.introsCategory !== 'nt') {
        if (b.category !== refState.introsCategory && !(refState.introsCategory === '通用書信' && (b.category === '通用書信' || b.category === '預言書' || b.category === '監獄書信' || b.category === '教牧書信'))) return false;
      }

      if (refState.introsSearch) {
        var q = refState.introsSearch.toLowerCase().trim();
        var mZh = (b.name_zh || '').toLowerCase().includes(q);
        var mEn = (b.name_en || '').toLowerCase().includes(q);
        var mAb = (b.abbr || '').toLowerCase().includes(q);
        var mTheme = (b.theme || '').toLowerCase().includes(q);
        var mKey = (b.key_verse || '').toLowerCase().includes(q);
        if (!mZh && !mEn && !mAb && !mTheme && !mKey) return false;
      }
      return true;
    });

    var htmlStr = '<div class="ref-sub-header">' +
      '<div class="ref-search-row">' +
        '<input type="search" class="ref-search-input" id="refIntrosSearchInput" placeholder="🔍 搜尋書卷簡介（如 創世記、大衛、因信稱義...）" value="' + escapeHtml(refState.introsSearch) + '">' +
      '</div>' +
      '<div class="ref-pills-row" id="refIntrosCategoryPills">';

    categories.forEach(function (cat) {
      var activeClass = refState.introsCategory === cat.key ? 'active' : '';
      htmlStr += '<button type="button" class="ref-pill-btn ' + activeClass + '" data-cat="' + escapeHtml(cat.key) + '">' + escapeHtml(cat.label) + '</button>';
    });

    htmlStr += '</div>' +
      '<div class="ref-count-bar">共顯示 ' + filtered.length + ' 卷聖經書卷簡介</div>' +
    '</div>';

    htmlStr += '<div class="book-intros-grid">';
    if (!filtered.length) {
      htmlStr += '<div class="ref-empty-state">查無符合關鍵字的聖經書卷</div>';
    } else {
      filtered.forEach(function (b) {
        htmlStr += '<div class="book-intro-card">' +
          '<div class="book-intro-head">' +
            '<div class="book-intro-title-group">' +
              '<span class="book-no-badge">#' + b.no + '</span>' +
              '<h3 class="book-name-zh">' + escapeHtml(b.name_zh) + '</h3>' +
              '<span class="book-name-en">' + escapeHtml(b.name_en) + '</span>' +
            '</div>' +
            '<div class="book-badges-group">' +
              '<span class="testament-badge ' + (b.testament === 'OT' ? 'ot' : 'nt') + '">' + (b.testament === 'OT' ? '舊約' : '新約') + '</span>' +
              '<span class="cat-badge">' + escapeHtml(b.category) + '</span>' +
            '</div>' +
          '</div>' +

          '<div class="book-intro-meta">' +
            '<span>✍️ <strong>作者：</strong>' + escapeHtml(b.author) + '</span>' +
            '<span>📅 <strong>年代：</strong>' + escapeHtml(b.date) + '</span>' +
          '</div>' +

          '<div class="book-intro-box theme-box">' +
            '<strong>🎯 核心主題：</strong>' + escapeHtml(b.theme) +
          '</div>' +

          '<div class="book-intro-box keyverse-box">' +
            '<strong>🔑 核心鑰節：</strong>' + escapeHtml(b.key_verse) +
          '</div>';

        if (b.outline && b.outline.length) {
          htmlStr += '<div class="book-outline-section">' +
            '<strong>📋 全書結構大綱：</strong>' +
            '<ol class="book-outline-list">';
          b.outline.forEach(function (item) {
            htmlStr += '<li><strong>' + escapeHtml(item.title) + '：</strong>' + escapeHtml(item.desc) + '</li>';
          });
          htmlStr += '</ol></div>';
        }

        htmlStr += '<div class="book-intro-actions">' +
          '<button type="button" class="btn btn-primary go-book-reader-btn" data-bookno="' + b.no + '">' +
            '📖 開啟《' + escapeHtml(b.name_zh) + '》經文閱讀器</button>' +
          '<button type="button" class="btn filter-su101-ref-btn" data-bookname="' + escapeHtml(b.name_zh) + '">' +
            '📑 查閱研經釋義資料庫</button>' +
        '</div></div>';
      });
    }
    htmlStr += '</div>';

    container.innerHTML = htmlStr;

    var searchInput = container.querySelector('#refIntrosSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', function () {
        refState.introsSearch = searchInput.value;
        renderRefPanelIntros();
      });
    }

    var pillsRow = container.querySelector('#refIntrosCategoryPills');
    if (pillsRow) {
      pillsRow.querySelectorAll('.ref-pill-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
          refState.introsCategory = btn.getAttribute('data-cat');
          renderRefPanelIntros();
        });
      });
    }

    container.querySelectorAll('.go-book-reader-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var bNo = parseInt(btn.getAttribute('data-bookno'), 10);
        if (bNo) showReader(bNo, 1);
      });
    });

    container.querySelectorAll('.filter-su101-ref-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var bName = btn.getAttribute('data-bookname');
        refState.activeTab = 'su101';
        refState.su101Quarter = 'all';
        refState.su101Search = bName;
        renderRefView();
      });
    });
  }

  function renderRefPanelTimeline() {
    var container = el.refPanelTimeline;
    if (!container) return;

    var data = window.BIBLIA_TIMELINE_DATA || {};

    var subTabs = [
      { key: 'eras', label: '⏳ 聖經大歷史年表' },
      { key: 'prophets', label: '📜 先知書歷史分期表' },
      { key: 'calendar', label: '🗓️ 猶太神聖曆與節期表' },
      { key: 'charts', label: '📊 結構對稱圖與年代圖表' }
    ];

    var htmlStr = '<div class="ref-sub-header">' +
      '<div class="ref-pills-row" id="refTimelineSubTabs">';

    subTabs.forEach(function (tab) {
      var activeClass = refState.timelineTab === tab.key ? 'active' : '';
      htmlStr += '<button type="button" class="ref-pill-btn ' + activeClass + '" data-sub="' + tab.key + '">' + tab.label + '</button>';
    });

    htmlStr += '</div></div>';

    if (refState.timelineTab === 'eras') {
      htmlStr += '<div class="timeline-eras-list">';
      (data.eras || []).forEach(function (era, idx) {
        htmlStr += '<div class="timeline-era-card">' +
          '<div class="era-card-head">' +
            '<span class="era-no-badge">Phase ' + (idx + 1) + '</span>' +
            '<h3 class="era-title">' + escapeHtml(era.name) + '</h3>' +
            '<span class="era-period-badge">' + escapeHtml(era.period) + '</span>' +
          '</div>' +
          '<div class="era-books-bar"><strong>📖 對應書卷：</strong>' + escapeHtml((era.books || []).join('、')) + '</div>' +
          '<p class="era-summary">' + escapeHtml(era.summary) + '</p>' +
          '<div class="era-events-timeline">' +
            '<span class="era-events-title">📍 關鍵歷史里程碑：</span>' +
            '<ul class="era-events-list">';
        (era.events || []).forEach(function (ev) {
          htmlStr += '<li><span class="ev-year">' + escapeHtml(ev.year) + '</span><span class="ev-text">' + escapeHtml(ev.event) + '</span></li>';
        });
        htmlStr += '</ul></div></div>';
      });
      htmlStr += '</div>';
    } else if (refState.timelineTab === 'prophets') {
      htmlStr += '<div class="timeline-table-wrap">' +
        '<table class="ref-data-table">' +
          '<thead>' +
            '<tr><th>歷史時期</th><th>先知</th><th>主要對象</th><th>年代</th><th>核心信息與審判焦點</th></tr>' +
          '</thead><tbody>';

      (data.prophetic_periods || []).forEach(function (pEra) {
        (pEra.prophets || []).forEach(function (p, idx) {
          htmlStr += '<tr>';
          if (idx === 0) {
            htmlStr += '<td rowspan="' + pEra.prophets.length + '" class="tbl-era-cell">' +
              '<strong>' + escapeHtml(pEra.era) + '</strong><br>' +
              '<span class="tbl-time">' + escapeHtml(pEra.time) + '</span><br>' +
              '<small class="tbl-bg">' + escapeHtml(pEra.bg) + '</small></td>';
          }
          htmlStr += '<td class="tbl-prophet-name">' + escapeHtml(p.name) + '</td>' +
            '<td><span class="target-badge">' + escapeHtml(p.target) + '</span></td>' +
            '<td class="tbl-date">' + escapeHtml(p.date) + '</td>' +
            '<td class="tbl-focus">' + escapeHtml(p.focus) + '</td>' +
          '</tr>';
        });
      });
      htmlStr += '</tbody></table></div>';
    } else if (refState.timelineTab === 'calendar') {
      htmlStr += '<div class="timeline-table-wrap">' +
        '<table class="ref-data-table calendar-table">' +
          '<thead>' +
            '<tr><th>神聖曆</th><th>民政曆</th><th>猶太月份名稱</th><th>對應公曆</th><th>主要節期與神聖日子</th><th>氣候與農業收割</th></tr>' +
          '</thead><tbody>';

      (data.jewish_calendar || []).forEach(function (m) {
        htmlStr += '<tr>' +
          '<td class="tbl-num">第 ' + m.month_no + ' 月</td>' +
          '<td class="tbl-num">第 ' + m.civil_no + ' 月</td>' +
          '<td class="tbl-jname"><strong>' + escapeHtml(m.jewish_name) + '</strong></td>' +
          '<td class="tbl-greg">' + escapeHtml(m.gregorian) + '</td>' +
          '<td class="tbl-feasts">' + (m.feasts !== '無重大節期' ? ('<span class="feast-highlight">🎉 ' + escapeHtml(m.feasts) + '</span>') : '無重大節期') + '</td>' +
          '<td class="tbl-agri">🌾 ' + escapeHtml(m.agri) + '</td>' +
        '</tr>';
      });
      htmlStr += '</tbody></table></div>';
    } else if (refState.timelineTab === 'charts') {
      htmlStr += '<div class="charts-grid">';
      (data.charts || []).forEach(function (ch) {
        htmlStr += '<div class="chart-card">' +
          '<div class="chart-card-header">' +
            '<h3 class="chart-title">' + escapeHtml(ch.title) + '</h3>' +
          '</div>' +
          '<div class="chart-img-wrap">' +
            '<img src="' + escapeHtml(ch.img) + '" alt="' + escapeHtml(ch.title) + '" loading="lazy" class="chart-img">' +
          '</div>' +
          '<div class="chart-card-body">' +
            '<p>' + escapeHtml(ch.desc) + '</p>' +
            '<a href="' + escapeHtml(ch.img) + '" target="_blank" rel="noopener noreferrer" class="btn btn-sm btn-outline">' +
              '🔍 放大檢視高畫質原圖 ↗</a>' +
          '</div></div>';
      });
      htmlStr += '</div>';
    }

    container.innerHTML = htmlStr;

    var subRow = container.querySelector('#refTimelineSubTabs');
    if (subRow) {
      subRow.querySelectorAll('.ref-pill-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
          refState.timelineTab = btn.getAttribute('data-sub');
          renderRefPanelTimeline();
        });
      });
    }
  }

  /* ===================== 閱讀排版與外觀設定 (Aa Modal) 控制器 ===================== */
  var appearanceOpener = null;

  function buildAppearanceControls() {
    if (el.readerAaBtn) el.readerAaBtn.addEventListener('click', openAppearanceModal);
    if (el.openAaModalBtn) el.openAaModalBtn.addEventListener('click', openAppearanceModal);
    if (el.pagerAaBtn) el.pagerAaBtn.addEventListener('click', openAppearanceModal);
    if (el.appearanceCloseBtn) el.appearanceCloseBtn.addEventListener('click', closeAppearanceModal);
    if (el.appearanceOverlay) el.appearanceOverlay.addEventListener('click', closeAppearanceModal);

    if (el.aaFontSlider) {
      el.aaFontSlider.addEventListener('input', function () {
        state.size = parseInt(el.aaFontSlider.value, 10);
        updateAaUI();
        applyAppearance();
        save();
      });
    }

    if (el.aaFontDown) el.aaFontDown.addEventListener('click', function () { bump(-1); });
    if (el.aaFontUp) el.aaFontUp.addEventListener('click', function () { bump(1); });

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

    if (el.appearanceModal) {
      Array.prototype.forEach.call(el.appearanceModal.querySelectorAll('.aa-preset-btn'), function (btn) {
        var sz = parseInt(btn.getAttribute('data-size'), 10);
        btn.classList.toggle('active', sz === state.size);
      });
    }

    if (el.aaLhControls) {
      Array.prototype.forEach.call(el.aaLhControls.querySelectorAll('.aa-seg-btn'), function (btn) {
        var isAct = btn.getAttribute('data-lh') === state.lh;
        btn.classList.toggle('active', isAct);
        btn.setAttribute('aria-checked', isAct ? 'true' : 'false');
      });
    }

    if (el.aaFontControls) {
      Array.prototype.forEach.call(el.aaFontControls.querySelectorAll('.aa-seg-btn'), function (btn) {
        var isAct = btn.getAttribute('data-font') === state.font;
        btn.classList.toggle('active', isAct);
        btn.setAttribute('aria-checked', isAct ? 'true' : 'false');
      });
    }

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

    ['font-serif', 'font-shippori', 'font-sans', 'font-kaiti'].forEach(function (cls) {
      document.body.classList.remove(cls);
    });
    document.body.classList.add('font-' + (state.font || 'serif'));

    ['lh-compact', 'lh-normal', 'lh-relaxed'].forEach(function (cls) {
      document.body.classList.remove(cls);
    });
    document.body.classList.add('lh-' + (state.lh || 'normal'));

    document.body.classList.toggle('large-vn', !!state.largeVn);
    applyTheme(state.theme);

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

      if (duration >= 50 && duration <= 600 && Math.abs(dx) >= 55 && Math.abs(dx) > Math.abs(dy) * 1.8) {
        if (dx < 0) {
          step(1);  // 向左滑 -> 下一章
        } else {
          step(-1); // 向右滑 -> 上一章
        }
      }
    }, { passive: true });
  }

  /* ---------- 閱讀介面控制列與快捷鍵 ---------- */
  /* ---------- 禪意專注閱讀模式與閱讀進度 ---------- */
  function toggleZen(force) {
    if (el.readerView && el.readerView.hidden) return;
    var next = typeof force === 'boolean' ? force : !document.body.classList.contains('zen-mode');
    document.body.classList.toggle('zen-mode', next);
    state.zen = next;

    var exitPill = document.getElementById('zenExitPill');
    if (!exitPill && next) {
      exitPill = document.createElement('button');
      exitPill.id = 'zenExitPill';
      exitPill.className = 'zen-exit-pill';
      exitPill.type = 'button';
      exitPill.innerHTML = '<span aria-hidden="true">✕</span><span>退出專注 (Z)</span>';
      exitPill.addEventListener('click', function () {
        toggleZen(false);
      });
      document.body.appendChild(exitPill);
    }

    showToast(next ? '🍵 進入禪意專注閱讀模式 (按 Z 或 Esc 退出)' : '📖 退出專注模式');
  }

  function updateReadingProgress() {
    if (el.readerView && el.readerView.hidden) return;
    var fill = document.getElementById('readingProgressFill');
    if (!fill) return;
    var st = window.pageYOffset || document.documentElement.scrollTop || 0;
    var sh = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    var pct = sh > 0 ? Math.min(100, Math.max(0, (st / sh) * 100)) : 0;
    fill.style.width = pct + '%';
  }

  function quickBookmarkCurrentChapter() {
    if (el.readerView.hidden) return;
    var bMeta = state.byNo[state.bookNo];
    var bName = bMeta ? bMeta.zh : '經文';
    var key = state.bookNo + '_' + state.chap + '_1';
    if (bookmarks[key]) {
      delete bookmarks[key];
      saveUserAsset('biblia_bookmarks', bookmarks);
      showToast('已取消 ' + bName + ' 第 ' + state.chap + ' 章書籤 🔖');
    } else {
      bookmarks[key] = {
        bookNo: state.bookNo,
        chap: state.chap,
        sec: 1,
        bookName: bName,
        time: Date.now(),
        note: ''
      };
      saveUserAsset('biblia_bookmarks', bookmarks);
      showToast('已加入 ' + bName + ' 第 ' + state.chap + ' 章書籤 🔖');
    }
  }

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

    if (el.zenBtn) el.zenBtn.addEventListener('click', function () { toggleZen(); });
    if (el.pagerZenBtn) el.pagerZenBtn.addEventListener('click', function () { toggleZen(); });

    document.getElementById('themeBtn').addEventListener('click', function () {
      var nextTheme = { light: 'sepia', sepia: 'matcha', matcha: 'dark', dark: 'oled', oled: 'light' }[state.theme] || 'light';
      applyTheme(nextTheme);
      syncVersions();
      save();
    });
    document.getElementById('strongClose').addEventListener('click', clearStrong);
    if (el.strongOverlay) el.strongOverlay.addEventListener('click', clearStrong);
    if (el.strongSearchBtn) el.strongSearchBtn.addEventListener('click', searchCurrentStrong);
    if (el.strongEngBtn) el.strongEngBtn.addEventListener('click', toggleDictLang);

    if (el.strongCopyBtn) {
      el.strongCopyBtn.addEventListener('click', function () {
        if (!state.strong) return;
        var entry = dictEntry(state.strong);
        var copyText = state.strong + (entry && entry.o ? ' (' + entry.o + ')' : '') + '\n' +
          (entry && entry.z ? entry.z : (entry && entry.e ? entry.e : ''));
        navigator.clipboard.writeText(copyText).then(function () {
          showToast('已複製 Strong 釋義 📋');
        });
      });
    }

    if (el.toolsBtn) {
      el.toolsBtn.setAttribute('aria-expanded',
        document.body.classList.contains('tools-open') ? 'true' : 'false');
      el.toolsBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        setToolsOpen(!document.body.classList.contains('tools-open'));
        save();
      });

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

    window.addEventListener('scroll', updateReadingProgress, { passive: true });

    // 全域快捷鍵
    document.addEventListener('keydown', function (e) {
      if (e.target && /^(INPUT|SELECT|TEXTAREA)$/.test(e.target.tagName)) {
        if (e.key === 'Escape') {
          if (el.searchModal && !el.searchModal.hidden) closeSearchModal();
          if (el.quickNavModal && !el.quickNavModal.hidden) closeQuickNav();
          if (el.appearanceModal && !el.appearanceModal.hidden) closeAppearanceModal();
          if (el.compareVerseModal && !el.compareVerseModal.hidden) closeCompareVerseModal();
          if (el.studyCenterModal && !el.studyCenterModal.hidden) closeStudyCenter();
          if (el.shortcutsModal && !el.shortcutsModal.hidden) closeShortcutsGuide();
        }
        return;
      }

      if (e.key === 'Escape') {
        if (document.body.classList.contains('zen-mode')) { toggleZen(false); return; }
        if (el.searchModal && !el.searchModal.hidden) { closeSearchModal(); return; }
        if (el.quickNavModal && !el.quickNavModal.hidden) { closeQuickNav(); return; }
        if (el.appearanceModal && !el.appearanceModal.hidden) { closeAppearanceModal(); return; }
        if (el.compareVerseModal && !el.compareVerseModal.hidden) { closeCompareVerseModal(); return; }
        if (el.studyCenterModal && !el.studyCenterModal.hidden) { closeStudyCenter(); return; }
        if (el.shortcutsModal && !el.shortcutsModal.hidden) { closeShortcutsGuide(); return; }
        if (el.verseActionMenu && !el.verseActionMenu.hidden) { closeVerseActionMenu(); return; }
        clearStrong();
        return;
      }

      if ((e.key === 'z' || e.key === 'Z') && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        toggleZen();
        return;
      }

      if (e.key === '/' && el.searchModal.hidden) {
        e.preventDefault();
        openSearchModal('');
        return;
      }

      if ((e.key === 'g' || e.key === 'G') && el.quickNavModal && el.quickNavModal.hidden) {
        e.preventDefault();
        openQuickNav();
        return;
      }

      if ((e.key === 'b' || e.key === 'B') && el.studyCenterModal && el.studyCenterModal.hidden) {
        e.preventDefault();
        openStudyCenter();
        return;
      }

      if ((e.key === 'm' || e.key === 'M') && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        quickBookmarkCurrentChapter();
        return;
      }

      if (e.key === '?' || (e.key === '/' && e.shiftKey)) {
        e.preventDefault();
        openShortcutsGuide();
        return;
      }

      if ((e.key === 't' || e.key === 'T') && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        var nextTheme = { light: 'sepia', sepia: 'matcha', matcha: 'dark', dark: 'oled', oled: 'light' }[state.theme] || 'light';
        applyTheme(nextTheme);
        save();
        showToast('切換主題：' + state.theme);
        return;
      }

      if ((e.key === 'i' || e.key === 'I') && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        state.inter = !state.inter;
        syncVersions();
        save();
        if (!el.readerView.hidden) render();
        showToast(state.inter ? '逐字對照：開啟' : '逐字對照：關閉');
        return;
      }

      if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        bump(1);
        return;
      }

      if (e.key === '-' || e.key === '_') {
        e.preventDefault();
        bump(-1);
        return;
      }

      if (e.code === 'Space' && audioState.isPlaying) {
        e.preventDefault();
        toggleAudioPlayPause();
        return;
      }

      if (el.readerView.hidden || !el.searchModal.hidden) return;
      if (e.key === 'ArrowLeft' || e.key === 'p' || e.key === 'P') step(-1);
      else if (e.key === 'ArrowRight' || e.key === 'n' || e.key === 'N') step(1);
      else if (e.key === 'j' || e.key === 'J') window.scrollBy({ top: 140, behavior: 'smooth' });
      else if (e.key === 'k' || e.key === 'K') window.scrollBy({ top: -140, behavior: 'smooth' });
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

  function schedulePreloadAdjacent(no, chap) {
    var meta = state.byNo[no];
    if (!meta) return;

    function doPreload() {
      if (chap >= meta.nch - 1 && state.byNo[no + 1] && !state.cache[no + 1]) {
        loadBook(no + 1, function () {});
      }
      if (chap <= 2 && state.byNo[no - 1] && !state.cache[no - 1]) {
        loadBook(no - 1, function () {});
      }
    }

    if (window.requestIdleCallback) {
      window.requestIdleCallback(doPreload, { timeout: 2500 });
    } else {
      setTimeout(doPreload, 800);
    }
  }

  function go(no, chap, cb) {
    state.bookNo = no;
    state.chap = chap;
    clearStrong();
    if (el.bookSelect) el.bookSelect.value = no;
    fillChapSelect(el.chapSelect, state.byNo[no].nch, false);
    if (el.chapSelect) el.chapSelect.value = chap;
    updatePager();
    save();
    addReadHistory(no, chap);

    if (el.quickNavBtnText) {
      var bMeta = state.byNo[no];
      el.quickNavBtnText.textContent = (bMeta ? bMeta.zh : '') + ' 第 ' + chap + ' 章';
    }
    updateHash();

    if (state.cache[no]) {
      render();
      schedulePreloadAdjacent(no, chap);
      if (cb) cb();
      return;
    }
    el.reader.innerHTML = '<p class="placeholder">載入 ' + state.byNo[no].zh + ' …</p>';
    loadBook(no, function (data) {
      if (!data) {
        el.reader.innerHTML = '<p class="placeholder">載入失敗：找不到 ' +
          bookFile(no) + '<br>請先執行 scripts/parse.py 產生資料。</p>';
        return;
      }
      render();
      schedulePreloadAdjacent(no, chap);
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
      var hlColor = highlights[state.bookNo + ':' + state.chap + ':' + verse.s];
      row.className = 'verse' + (verse.p ? ' para' : '') + (hlColor ? (' hl-' + hlColor) : '');
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
    num.title = '點擊操作本節（複製 / 螢光 / 書籤 / 對照 / 朗讀）';

    var key = state.bookNo + ':' + state.chap + ':' + verse.s;
    if (bookmarks[key]) {
      var bmIcon = document.createElement('span');
      bmIcon.className = 'verse-bookmark-badge';
      bmIcon.textContent = '★';
      num.appendChild(bmIcon);
    }
    num.appendChild(document.createTextNode(verse.s));

    num.addEventListener('click', function (e) {
      e.stopPropagation();
      openVerseActionMenu(state.bookNo, state.chap, verse.s, num);
    });
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
      span.addEventListener('click', function (e) {
        e.stopPropagation();
        showStrong(u.s[0], u);
      });
    }
    return span;
  }

  /* ---------- Strong 高亮與釋義 ---------- */
  function showStrong(code, unit) {
    state.strong = code;
    el.strongNum.textContent = code;
    el.strongMeta.textContent = (code.charAt(0) === 'H' ? '希伯來文' : '希臘文') +
      ' Strong' + (unit && unit.m && unit.m.length ? '　文法碼 ' + unit.m.join('/') : '');

    // 文法詞形解碼 (Morphology Decoder)
    if (el.strongMorphBox) {
      var morphDict = window.BIBLIA_MORPH_CODES || {};
      if (unit && unit.m && unit.m.length) {
        var explanations = [];
        unit.m.forEach(function (mCode) {
          var entry = morphDict[mCode];
          if (entry) {
            explanations.push('🏷️ ' + mCode + '：' + entry.zh + (entry.en ? ' (' + entry.en + ')' : ''));
          } else {
            explanations.push('🏷️ ' + mCode + ' (文法解析代碼)');
          }
        });
        el.strongMorphBox.innerHTML = explanations.join('<br>');
        el.strongMorphBox.hidden = false;
      } else {
        el.strongMorphBox.hidden = true;
      }
    }

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
           strongDict: strongDict, showPlan: showPlan, showStart: showStart, showRef: showRef,
           showReader: showReader, jumpToVerse: jumpToVerse };
})();
