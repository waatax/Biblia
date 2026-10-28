/* Biblia — 777 節經文背誦與基甸會聖經處境練習 ＆ 填空測驗挑戰系統 (app/memory.js)
 *
 * 核心功能：
 * 1. 雙視圖架構：
 *    - VIEW A: 🎴 經文背誦記憶卡（支援手機直橫式全螢幕自適應、6 大記憶模式、SRS 間隔記憶、偷看全文、語音伴讀）
 *    - VIEW B: 🎯 經文填空測驗 Section（基甸會 7 大生命處境自選、全書 777 節綜合闖關、4 選 1 智慧干擾項、即時對錯音效、成績單結算與錯題特訓）
 * 2. 777 節和合本智慧挖空與高擬真同處境干擾項生成器
 * 3. Web Audio API 免外部依賴的合成提示音效（答對升音和弦 / 答錯提示音）
 * 4. 手機全螢幕 (Fullscreen API) 與直式/橫式雙欄自適應
 */
(function () {
  'use strict';

  var DB = window.BIBLIA_MEMORY_777 || { categories: [], verses: [] };
  var CATEGORIES = DB.categories || [];
  var ALL_VERSES = DB.verses || [];

  var BOOK_DIRS = 'Gen Ex Lev Num Deut Josh Judg Ruth 1Sam 2Sam 1Kin 2Kin 1Chr 2Chr Ezra Neh Esth Job Ps Prov Eccl Song Is Jer Lam Ezek Dan Hos Joel Amos Obad Jon Mic Nah Hab Zeph Hag Zech Mal Matt Mark Luke John Acts Rom 1Cor 2Cor Gal Eph Phil Col 1Thess 2Thess 1Tim 2Tim Titus Philem Heb James 1Pet 2Pet 1John 2John 3John Jude Rev'.split(' ');

  var STORAGE_KEY = 'biblia_memory_777_v2';

  // 系統狀態
  var state = {
    view: 'card',        // 'card' | 'quiz'
    cat: 'fear',         // 'all' | 'due' | 'starred' | 7 category IDs
    idx: 0,              // index within filtered deck
    mode: 'mask',        // 'read' | 'mask' | 'first' | 'tap' | 'quiz' | 'dictation'
    maskRate: 30,        // 0 | 30 | 60 | 100
    fsize: '1.42rem',
    theme: 'light',
    sound: true,         // 音效開關
    showEn: true,
    showOrig: false,
    showStrong: true,
    audioRepeat: 2,
    autoPlay: false,
    peeking: false,
    records: {},         // verseId -> { level: 0..5, nextDue: timestamp, reps: 0, starred: false, wrongCount: 0 }
    streak: { count: 1, lastDate: '' }
  };

  var deck = [];
  var cardQuizState = null;

  // 測驗 Section 狀態
  var quizRunState = {
    cat: 'fear',
    totalCount: 10,
    questions: [],
    curIndex: 0,
    score: 0,
    correctCount: 0,
    startTime: 0,
    timeSpentStr: '',
    wrongQuestions: [],
    answered: false
  };

  /* ---------- Web Audio API 提示音效合成器 ---------- */
  var audioCtx = null;
  function getAudioContext() {
    if (!audioCtx && (window.AudioContext || window.webkitAudioContext)) {
      var AC = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AC();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  function playSound(type) {
    if (!state.sound) return;
    try {
      var ctx = getAudioContext();
      if (!ctx) return;
      var now = ctx.currentTime;
      if (type === 'correct') {
        // 清脆升調雙音 (C5 -> E5)
        var osc1 = ctx.createOscillator();
        var osc2 = ctx.createOscillator();
        var gain = ctx.createGain();
        osc1.type = 'sine';
        osc2.type = 'sine';
        osc1.frequency.setValueAtTime(523.25, now);
        osc1.frequency.setValueAtTime(659.25, now + 0.08);
        osc2.frequency.setValueAtTime(1046.5, now + 0.08);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);
        osc1.start(now);
        osc2.start(now + 0.08);
        osc1.stop(now + 0.35);
        osc2.stop(now + 0.35);
      } else if (type === 'wrong') {
        // 低沉提示音
        var osc = ctx.createOscillator();
        var gain2 = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.linearRampToValueAtTime(164.81, now + 0.22);
        gain2.gain.setValueAtTime(0.15, now);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc.connect(gain2);
        gain2.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.25);
      }
    } catch (e) {}
  }

  /* ---------- Toast 提示 ---------- */
  function showToast(msg, ms) {
    var t = document.getElementById('memToast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'memToast';
      t.style.cssText = 'position:fixed;bottom:96px;left:50%;transform:translateX(-50%);' +
        'background:rgba(24,22,20,0.94);color:#fff;padding:8px 16px;border-radius:999px;' +
        'font-size:0.82rem;font-weight:700;z-index:9999;pointer-events:none;' +
        'box-shadow:0 6px 20px rgba(0,0,0,0.3);transition:opacity 0.2s ease;opacity:0;white-space:nowrap;';
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.style.opacity = '1';
    clearTimeout(t._timer);
    t._timer = setTimeout(function () { t.style.opacity = '0'; }, ms || 1800);
  }

  /* ---------- 持久化讀取與儲存 ---------- */
  function todayStr() {
    var d = new Date();
    var m = d.getMonth() + 1;
    var day = d.getDate();
    return d.getFullYear() + '-' + (m < 10 ? '0' + m : m) + '-' + (day < 10 ? '0' + day : day);
  }

  function loadState() {
    try {
      var raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
      if (raw) {
        if (raw.view) state.view = raw.view;
        if (raw.cat) state.cat = raw.cat;
        if (typeof raw.idx === 'number') state.idx = raw.idx;
        if (raw.mode) state.mode = raw.mode;
        if (typeof raw.maskRate === 'number') state.maskRate = raw.maskRate;
        if (raw.fsize) state.fsize = raw.fsize;
        if (typeof raw.sound === 'boolean') state.sound = raw.sound;
        if (typeof raw.showEn === 'boolean') state.showEn = raw.showEn;
        if (typeof raw.showOrig === 'boolean') state.showOrig = raw.showOrig;
        if (typeof raw.showStrong === 'boolean') state.showStrong = raw.showStrong;
        if (raw.audioRepeat) state.audioRepeat = raw.audioRepeat;
        if (raw.records) state.records = raw.records;
        if (raw.streak) state.streak = raw.streak;
      }
      var mainBiblia = JSON.parse(localStorage.getItem('biblia') || 'null') || {};
      if (mainBiblia.theme) state.theme = mainBiblia.theme;
    } catch (e) {}

    // 更新連續打卡天數
    var t = todayStr();
    if (state.streak.lastDate !== t) {
      if (state.streak.lastDate) {
        var prev = new Date(state.streak.lastDate);
        var cur = new Date(t);
        var diffDays = Math.round((cur - prev) / 86400000);
        if (diffDays === 1) state.streak.count = (state.streak.count || 1) + 1;
        else if (diffDays > 1) state.streak.count = 1;
      } else {
        state.streak.count = 1;
      }
      state.streak.lastDate = t;
      saveState();
    }
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        view: state.view,
        cat: state.cat,
        idx: state.idx,
        mode: state.mode,
        maskRate: state.maskRate,
        fsize: state.fsize,
        sound: state.sound,
        showEn: state.showEn,
        showOrig: state.showOrig,
        showStrong: state.showStrong,
        audioRepeat: state.audioRepeat,
        records: state.records,
        streak: state.streak
      }));
    } catch (e) {}
  }

  function applyAppearance() {
    document.documentElement.style.setProperty('--mem-card-font-size', state.fsize);
    var classes = ['light', 'sepia', 'matcha', 'dark', 'oled'];
    classes.forEach(function (c) {
      document.documentElement.classList.remove(c);
      document.body.classList.remove(c);
    });
    document.documentElement.classList.add(state.theme);
    document.body.classList.add(state.theme);

    try {
      var b = JSON.parse(localStorage.getItem('biblia') || 'null') || {};
      b.theme = state.theme;
      localStorage.setItem('biblia', JSON.stringify(b));
    } catch (e) {}
  }

  /* ---------- 題目與干擾選項智慧生成引擎 ---------- */
  var STOP_WORDS = {
    '一個': 1, '我們': 1, '你們': 1, '他們': 1, '自己': 1, '甚麼': 1, '這事': 1,
    '因為': 1, '所以': 1, '但是': 1, '然而': 1, '並且': 1, '而且': 1, '也是': 1,
    '不是': 1, '若是': 1, '如此': 1, '那時': 1, '那日': 1, '那裡': 1, '這裡': 1,
    '不可': 1, '不要': 1, '不能': 1, '可以': 1, '雖然': 1, '凡是': 1, '沒有': 1
  };

  var poolByCatAndLen = {};

  function cleanChineseWord(w) {
    return (w || '').replace(/[，。；：！？、─…「」『』（）\s]/g, '').trim();
  }

  function extractCandidatesForVerse(v) {
    var cands = [];
    // 1. 從 Strong 提取
    if (v.strong) {
      var matches = v.strong.match(/\(([^)]+)\)/g) || [];
      matches.forEach(function (m) {
        var w = cleanChineseWord(m.replace(/[()]/g, ''));
        if (w.length >= 2 && w.length <= 4 && v.zh.indexOf(w) !== -1 && !STOP_WORDS[w]) {
          cands.push(w);
        }
      });
    }
    // 2. 從分句提取
    var clauses = v.zh.split(/[，。；：！？、─…「」『』（）]/);
    clauses.forEach(function (cl) {
      var cw = cleanChineseWord(cl);
      if (cw.length >= 4) {
        [2, 3, 4].forEach(function (wlen) {
          for (var i = 0; i <= cw.length - wlen; i++) {
            var sub = cw.slice(i, i + wlen);
            if (!STOP_WORDS[sub] && cands.indexOf(sub) === -1) {
              cands.push(sub);
            }
          }
        });
      }
    });
    return cands.length ? cands : [cleanChineseWord(v.zh.slice(0, 2))];
  }

  function buildDistractorPools() {
    poolByCatAndLen = {};
    ALL_VERSES.forEach(function (v) {
      var cands = extractCandidatesForVerse(v);
      var target = cands[0];
      var cat = v.cat;
      var wlen = target.length;
      var keyCat = cat + '_' + wlen;
      var keyAll = 'all_' + wlen;
      if (!poolByCatAndLen[keyCat]) poolByCatAndLen[keyCat] = [];
      if (!poolByCatAndLen[keyAll]) poolByCatAndLen[keyAll] = [];
      if (poolByCatAndLen[keyCat].indexOf(target) === -1) poolByCatAndLen[keyCat].push(target);
      if (poolByCatAndLen[keyAll].indexOf(target) === -1) poolByCatAndLen[keyAll].push(target);
    });
  }

  function generateQuestionForVerse(v) {
    var cands = extractCandidatesForVerse(v);
    var target = cands[0] || '信心';
    var wlen = target.length;
    var cat = v.cat;

    // 取得干擾項
    var poolCat = (poolByCatAndLen[cat + '_' + wlen] || []).filter(function (x) { return x !== target; });
    var poolAll = (poolByCatAndLen['all_' + wlen] || []).filter(function (x) { return x !== target && poolCat.indexOf(x) === -1; });
    var combinedPool = poolCat.concat(poolAll);

    // 隨機抽 3 個不同干擾項
    var distractors = [];
    var tempPool = combinedPool.slice();
    for (var i = tempPool.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = tempPool[i];
      tempPool[i] = tempPool[j];
      tempPool[j] = t;
    }
    distractors = tempPool.slice(0, 3);
    while (distractors.length < 3) {
      var fallback = ['平安', '慈愛', '磐石', '恩惠', '能力', '榮耀', '信實', '拯救'][distractors.length];
      if (distractors.indexOf(fallback) === -1 && fallback !== target) distractors.push(fallback);
    }

    // 組合選項並打亂
    var choices = [target].concat(distractors);
    for (var k = choices.length - 1; k > 0; k--) {
      var r = Math.floor(Math.random() * (k + 1));
      var tmp = choices[k];
      choices[k] = choices[r];
      choices[r] = tmp;
    }

    // 題幹中挖空
    var prompt = v.zh.replace(target, '【 ？ 】');

    return {
      verse: v,
      target: target,
      prompt: prompt,
      choices: choices,
      correctIndex: choices.indexOf(target)
    };
  }

  /* ---------- SRS 狀態與牌組篩選 ---------- */
  function getRecord(verseId) {
    return state.records[verseId] || { level: 0, nextDue: 0, reps: 0, starred: false, wrongCount: 0 };
  }

  function buildDeck() {
    var now = Date.now();
    if (state.cat === 'all') {
      deck = ALL_VERSES.slice();
    } else if (state.cat === 'due') {
      deck = ALL_VERSES.filter(function (v) {
        var r = state.records[v.id];
        return r && ((r.reps > 0 && r.level < 4 && r.nextDue <= now) || r.wrongCount > 0);
      });
      if (!deck.length) {
        showToast('目前無待複習經文，已切換為全部 777 節');
        state.cat = 'all';
        deck = ALL_VERSES.slice();
      }
    } else if (state.cat === 'starred') {
      deck = ALL_VERSES.filter(function (v) {
        var r = state.records[v.id];
        return r && r.starred;
      });
      if (!deck.length) {
        showToast('尚未收藏重點經文，請點擊卡片右上角 ☆ 收藏');
        state.cat = 'fear';
        deck = ALL_VERSES.filter(function (v) { return v.cat === 'fear'; });
      }
    } else {
      deck = ALL_VERSES.filter(function (v) { return v.cat === state.cat; });
    }
    if (state.idx >= deck.length) state.idx = 0;
    if (state.idx < 0) state.idx = 0;
  }

  /* ---------- 智慧分句與詞彙切分 ---------- */
  function splitIntoClauses(zhText) {
    var re = /([^，。；：！？、─…「」『』（）]+)([，。；：！？、─…「」『』（）]*)/g;
    var clauses = [];
    var m;
    while ((m = re.exec(zhText)) !== null) {
      if (m[1] || m[2]) {
        clauses.push({ text: m[1] || '', punc: m[2] || '' });
      }
    }
    return clauses.length ? clauses : [{ text: zhText, punc: '' }];
  }

  function splitClauseIntoChunks(clauseText) {
    var chunks = [];
    var i = 0;
    var len = clauseText.length;
    while (i < len) {
      var step = (len - i === 4) ? 2 : (len - i <= 3 ? len - i : 2);
      chunks.push(clauseText.slice(i, i + step));
      i += step;
    }
    return chunks;
  }

  function deterministicHash(str, seed) {
    var h = seed || 2166136261;
    for (var i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return Math.abs(h);
  }

  /* ---------- 頂部處境分類條 ---------- */
  function renderCategoryStrip() {
    var strip = document.getElementById('memCatStrip');
    if (!strip) return;

    var dueCount = 0;
    var starCount = 0;
    var now = Date.now();
    Object.keys(state.records).forEach(function (id) {
      var r = state.records[id];
      if (r.starred) starCount++;
      if ((r.reps > 0 && r.level < 4 && r.nextDue <= now) || r.wrongCount > 0) dueCount++;
    });

    var html = '';
    CATEGORIES.forEach(function (c) {
      var isAct = state.cat === c.id;
      html += '<button type="button" class="mem-cat-chip' + (isAct ? ' active' : '') + '" data-cat="' + c.id + '">' +
        '<span>' + c.icon + ' ' + c.title + '</span>' +
        '<span class="chip-count">111</span>' +
        '</button>';
    });

    html += '<button type="button" class="mem-cat-chip' + (state.cat === 'all' ? ' active' : '') + '" data-cat="all">' +
      '<span>📚 全部經文</span><span class="chip-count">777</span></button>';

    html += '<button type="button" class="mem-cat-chip' + (state.cat === 'due' ? ' active' : '') + '" data-cat="due">' +
      '<span>⏰ 待複習</span><span class="chip-count">' + dueCount + '</span></button>';

    html += '<button type="button" class="mem-cat-chip' + (state.cat === 'starred' ? ' active' : '') + '" data-cat="starred">' +
      '<span>⭐ 重點收藏</span><span class="chip-count">' + starCount + '</span></button>';

    strip.innerHTML = html;

    strip.querySelectorAll('.mem-cat-chip').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var newCat = btn.getAttribute('data-cat');
        if (newCat === state.cat) return;
        state.cat = newCat;
        state.idx = 0;
        buildDeck();
        saveState();
        renderAll();
        btn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      });
    });
  }

  /* ---------- 記憶卡渲染 (VIEW A) ---------- */
  function renderCard() {
    if (!deck.length) buildDeck();
    var v = deck[state.idx] || ALL_VERSES[0];
    if (!v) return;

    var catMeta = CATEGORIES.find(function (c) { return c.id === v.cat; }) || CATEGORIES[0];
    var rec = getRecord(v.id);

    var counterEl = document.getElementById('memCounterText');
    if (counterEl) counterEl.textContent = (state.idx + 1) + '/' + deck.length;

    var streakEl = document.getElementById('memStreakBadge');
    if (streakEl) streakEl.textContent = '🔥 ' + (state.streak.count || 1) + '天';

    var subcatEl = document.getElementById('memSubcatLabel');
    if (subcatEl) subcatEl.textContent = v.subcat + ' · ' + v.group;

    var globalIdEl = document.getElementById('memGlobalIdLabel');
    var padId = v.id < 10 ? '00' + v.id : (v.id < 100 ? '0' + v.id : '' + v.id);
    if (globalIdEl) globalIdEl.textContent = '#' + padId + ' / 777';

    var progBar = document.getElementById('memProgressBar');
    if (progBar) {
      var pct = deck.length ? Math.round(((state.idx + 1) / deck.length) * 100) : 0;
      progBar.style.width = pct + '%';
    }

    var ribbon = document.getElementById('memCardRibbon');
    if (ribbon && catMeta) ribbon.style.background = catMeta.color;

    var catTag = document.getElementById('memCardCatTag');
    if (catTag && catMeta) catTag.textContent = catMeta.icon + ' ' + catMeta.title;

    var groupTag = document.getElementById('memCardGroupTag');
    if (groupTag) groupTag.textContent = v.subcat;

    var starBtn = document.getElementById('memStarBtn');
    if (starBtn) {
      starBtn.textContent = rec.starred ? '★' : '☆';
      starBtn.classList.toggle('is-starred', !!rec.starred);
    }

    var refTitle = document.getElementById('memRefTitle');
    if (refTitle) refTitle.textContent = v.ref;

    var refEn = document.getElementById('memRefEn');
    if (refEn) refEn.textContent = v.refEn + ' · 中文和合本';

    var srsBadge = document.getElementById('memSrsBadge');
    if (srsBadge) {
      if (rec.level >= 4) {
        srsBadge.textContent = '✨ 已熟背 (Lv.' + rec.level + ')';
        srsBadge.className = 'mem-srs-badge mastered';
      } else if (rec.reps > 0) {
        srsBadge.textContent = '🌿 練習中 (Lv.' + rec.level + ')';
        srsBadge.className = 'mem-srs-badge learning';
      } else {
        srsBadge.textContent = '🌱 初學';
        srsBadge.className = 'mem-srs-badge';
      }
    }

    var readCtxBtn = document.getElementById('memReadContextBtn');
    if (readCtxBtn) {
      var bDir = BOOK_DIRS[v.bookNo - 1] || v.bookNo;
      readCtxBtn.href = 'index.html#read/' + bDir + '/' + v.chap;
    }

    var bodyEl = document.getElementById('memCardBody');
    if (bodyEl) {
      bodyEl.classList.toggle('is-long', v.zh.length > 65 || state.mode === 'quiz' || state.mode === 'dictation');
    }

    renderVerseByMode(v);

    var subLayers = document.getElementById('memSubLayers');
    var enEl = document.getElementById('memVerseEn');
    var origEl = document.getElementById('memVerseOrig');
    var strongEl = document.getElementById('memStrongPills');

    var hideSubDuringTest = (state.mode === 'quiz' || state.mode === 'dictation') && !state.peeking;
    if (subLayers) subLayers.hidden = hideSubDuringTest || (!state.showEn && !state.showOrig && !state.showStrong);

    if (enEl) {
      enEl.hidden = !state.showEn;
      enEl.textContent = v.en || '';
    }
    if (origEl) {
      origEl.hidden = !state.showOrig || !v.orig;
      origEl.textContent = v.orig || '';
      origEl.classList.toggle('rtl', v.testament === 'OT');
    }
    if (strongEl) {
      strongEl.hidden = !state.showStrong || !v.strong;
      if (v.strong) {
        var parts = v.strong.split(', ');
        strongEl.innerHTML = parts.map(function (p) {
          return '<span class="mem-strong-pill">' + escapeHtml(p) + '</span>';
        }).join('');
      } else {
        strongEl.innerHTML = '';
      }
    }

    var maskSubrow = document.getElementById('memMaskSubrow');
    if (maskSubrow) {
      maskSubrow.style.display = (state.mode === 'mask') ? 'flex' : 'none';
    }
  }

  /* ---------- 各模式經文內容渲染 ---------- */
  function renderVerseByMode(v) {
    var zhEl = document.getElementById('memVerseZh');
    var quizPanel = document.getElementById('memQuizPanel');
    var dictBox = document.getElementById('memDictationBox');
    if (!zhEl) return;

    quizPanel.hidden = true;
    dictBox.hidden = true;

    if (state.peeking || state.mode === 'read' || (state.mode === 'mask' && state.maskRate === 0)) {
      zhEl.innerHTML = escapeHtml(v.zh);
      return;
    }

    var clauses = splitIntoClauses(v.zh);

    if (state.mode === 'mask') {
      var html = '';
      var chunkIdx = 0;
      clauses.forEach(function (cl) {
        var chunks = splitClauseIntoChunks(cl.text);
        chunks.forEach(function (ch) {
          chunkIdx++;
          var hash = deterministicHash(v.ref + '_' + chunkIdx, v.id);
          var shouldMask = (state.maskRate >= 100) || ((hash % 100) < state.maskRate);
          if (shouldMask) {
            html += '<span class="mem-token masked" data-text="' + escapeHtml(ch) + '" title="點擊翻開">' + escapeHtml(ch) + '</span>';
          } else {
            html += '<span class="mem-token">' + escapeHtml(ch) + '</span>';
          }
        });
        if (cl.punc) html += '<span class="mem-punc">' + escapeHtml(cl.punc) + '</span>';
      });
      zhEl.innerHTML = html;
      zhEl.querySelectorAll('.mem-token.masked').forEach(function (tok) {
        tok.addEventListener('click', function (e) {
          e.stopPropagation();
          tok.classList.toggle('revealed');
        });
      });
      return;
    }

    if (state.mode === 'first') {
      var fHtml = '';
      clauses.forEach(function (cl) {
        if (!cl.text) {
          fHtml += escapeHtml(cl.punc);
          return;
        }
        var firstChar = cl.text.charAt(0);
        var rest = cl.text.slice(1);
        fHtml += '<span class="mem-token" style="font-weight:800;color:var(--accent);">' + escapeHtml(firstChar) + '</span>';
        if (rest) {
          fHtml += '<span class="mem-token masked" title="點擊展開此句">' + escapeHtml(rest) + '</span>';
        }
        if (cl.punc) fHtml += '<span class="mem-punc">' + escapeHtml(cl.punc) + '</span>';
      });
      zhEl.innerHTML = fHtml;
      zhEl.querySelectorAll('.mem-token.masked').forEach(function (tok) {
        tok.addEventListener('click', function (e) {
          e.stopPropagation();
          tok.classList.toggle('revealed');
        });
      });
      return;
    }

    if (state.mode === 'tap') {
      var tHtml = '';
      clauses.forEach(function (cl) {
        if (!cl.text) return;
        var preview = cl.text.charAt(0) + ' …（' + cl.text.length + '字）';
        tHtml += '<span class="mem-tap-phrase" data-full="' + escapeHtml(cl.text + cl.punc) + '" data-preview="' + escapeHtml(preview) + '">' +
          escapeHtml(preview) + '</span>';
      });
      zhEl.innerHTML = tHtml;
      zhEl.querySelectorAll('.mem-tap-phrase').forEach(function (p) {
        p.addEventListener('click', function () {
          var isRev = p.classList.toggle('revealed');
          p.textContent = isRev ? p.getAttribute('data-full') : p.getAttribute('data-preview');
        });
      });
      return;
    }

    if (state.mode === 'quiz') {
      quizPanel.hidden = false;
      renderCardQuiz(v, zhEl);
      return;
    }

    if (state.mode === 'dictation') {
      dictBox.hidden = false;
      var firstHint = clauses.map(function (c) {
        return c.text ? (c.text.charAt(0) + new Array(c.text.length).join('＿') + c.punc) : c.punc;
      }).join('');
      zhEl.innerHTML = '<span style="color:var(--fg-mute);font-size:0.92em;">' + escapeHtml(firstHint) + '</span>';
      var resEl = document.getElementById('memDictationResult');
      if (resEl && !resEl.innerHTML) resEl.hidden = true;
      return;
    }
  }

  /* ---------- 記憶卡填空測驗 (Card Quiz Mode) ---------- */
  function renderCardQuiz(v, zhEl) {
    if (!cardQuizState || cardQuizState.verseId !== v.id) {
      cardQuizState = generateQuestionForVerse(v);
      cardQuizState.verseId = v.id;
      cardQuizState.answered = false;
    }

    zhEl.innerHTML = escapeHtml(cardQuizState.prompt).replace('【 ？ 】', '<span class="quiz-blank-badge">【 ？ 】</span>');

    var stepEl = document.getElementById('memQuizStepText');
    var promptEl = document.getElementById('memQuizPromptText');
    var gridEl = document.getElementById('memQuizGrid');
    if (!gridEl) return;

    if (promptEl) promptEl.textContent = '請選出空格【 ？ 】處正確的和合本經文：';
    if (stepEl) stepEl.textContent = cardQuizState.target.length + ' 個字';

    gridEl.innerHTML = '';
    cardQuizState.choices.forEach(function (opt, idx) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'mem-quiz-opt';
      btn.textContent = String.fromCharCode(65 + idx) + '. ' + opt;
      if (cardQuizState.answered) {
        if (opt === cardQuizState.target) btn.classList.add('correct');
      }
      btn.addEventListener('click', function () {
        if (cardQuizState.answered) return;
        cardQuizState.answered = true;
        if (opt === cardQuizState.target) {
          btn.classList.add('correct');
          playSound('correct');
          showToast('🎉 答對了！' + cardQuizState.target);
          setTimeout(function () {
            recordSrs('easy');
          }, 800);
        } else {
          btn.classList.add('wrong');
          playSound('wrong');
          showToast('答錯囉，正確為：' + cardQuizState.target);
          var r = getRecord(v.id);
          r.wrongCount = (r.wrongCount || 0) + 1;
          state.records[v.id] = r;
          saveState();
          // 標記正確選項
          gridEl.querySelectorAll('.mem-quiz-opt').forEach(function (b) {
            if (b.textContent.indexOf(cardQuizState.target) !== -1) b.classList.add('correct');
          });
        }
      });
      gridEl.appendChild(btn);
    });
  }

  /* ---------- 默寫比對 ---------- */
  function normalizeChars(str) {
    return (str || '').replace(/[，。；：！？、─…「」『』（）\s]/g, '');
  }

  function checkDictation() {
    var v = deck[state.idx] || ALL_VERSES[0];
    if (!v) return;
    var inputEl = document.getElementById('memDictationInput');
    var scoreEl = document.getElementById('memDictationScore');
    var resEl = document.getElementById('memDictationResult');
    if (!inputEl || !resEl) return;

    var userRaw = inputEl.value.trim();
    if (!userRaw) {
      showToast('請先輸入默寫經文內容');
      return;
    }

    var targetClean = normalizeChars(v.zh);
    var userClean = normalizeChars(userRaw);

    var correctCount = 0;
    var diffHtml = '';
    for (var i = 0; i < targetClean.length; i++) {
      var tc = targetClean.charAt(i);
      var uc = userClean.charAt(i);
      if (uc === tc) {
        correctCount++;
        diffHtml += '<span style="color:var(--ok);font-weight:700;">' + escapeHtml(tc) + '</span>';
      } else if (targetClean.indexOf(uc) !== -1 && uc) {
        correctCount += 0.5;
        diffHtml += '<span style="color:#d69e2e;text-decoration:underline;">' + escapeHtml(tc) + '</span>';
      } else {
        diffHtml += '<span style="color:var(--seal);background:rgba(192,56,43,0.12);padding:0 2px;border-radius:3px;font-weight:800;">' + escapeHtml(tc) + '</span>';
      }
    }

    var accuracy = Math.min(100, Math.round((correctCount / Math.max(1, targetClean.length)) * 100));
    if (scoreEl) {
      scoreEl.textContent = '準確率：' + accuracy + '% ' + (accuracy >= 90 ? '🎉 優秀！' : (accuracy >= 70 ? '👍 繼續加油' : '💪 再多讀幾遍'));
    }
    if (accuracy >= 85) playSound('correct');
    resEl.hidden = false;
    resEl.innerHTML = '<div><strong>標準和合本比對：</strong></div><div style="margin-top:4px;font-family:var(--font-serif);font-size:1.05rem;">' + diffHtml + '</div>';
  }

  /* ---------- SRS 評分與翻頁 ---------- */
  function recordSrs(grade) {
    var v = deck[state.idx];
    if (!v) return;
    var r = getRecord(v.id);
    r.reps = (r.reps || 0) + 1;
    var now = Date.now();
    var DAY = 86400000;

    if (grade === 'again') {
      r.level = Math.max(0, (r.level || 0) - 1);
      r.nextDue = now + 10 * 60 * 1000;
      r.wrongCount = (r.wrongCount || 0) + 1;
      showToast('🔄 已加入今日重練隊列');
    } else if (grade === 'good') {
      r.level = Math.min(5, (r.level || 0) + 1);
      var daysGood = [1, 2, 4, 7, 14, 30][r.level] || 3;
      r.nextDue = now + daysGood * DAY;
      if (r.wrongCount > 0) r.wrongCount = Math.max(0, r.wrongCount - 1);
      showToast('👍 記憶穩固！' + daysGood + ' 天後複習');
    } else if (grade === 'easy') {
      r.level = Math.max(4, Math.min(5, (r.level || 0) + 2));
      var daysEasy = r.level >= 5 ? 45 : 14;
      r.nextDue = now + daysEasy * DAY;
      r.wrongCount = 0;
      showToast('✨ 已熟背掌握！');
    }

    state.records[v.id] = r;
    saveState();
    nextCard();
  }

  function prevCard() {
    if (!deck.length) return;
    stopSpeech();
    var card = document.getElementById('memCard');
    if (card) {
      card.classList.add('swipe-right');
      setTimeout(function () { card.classList.remove('swipe-right'); }, 180);
    }
    state.idx = (state.idx - 1 + deck.length) % deck.length;
    cardQuizState = null;
    resetDictationBox();
    saveState();
    renderCard();
  }

  function nextCard() {
    if (!deck.length) return;
    stopSpeech();
    var card = document.getElementById('memCard');
    if (card) {
      card.classList.add('swipe-left');
      setTimeout(function () { card.classList.remove('swipe-left'); }, 180);
    }
    state.idx = (state.idx + 1) % deck.length;
    cardQuizState = null;
    resetDictationBox();
    saveState();
    renderCard();
    if (state.autoPlay) {
      setTimeout(function () { speakCurrentVerse(true); }, 350);
    }
  }

  function resetDictationBox() {
    var inp = document.getElementById('memDictationInput');
    var res = document.getElementById('memDictationResult');
    var sc = document.getElementById('memDictationScore');
    if (inp) inp.value = '';
    if (res) { res.innerHTML = ''; res.hidden = true; }
    if (sc) sc.textContent = '準備默寫';
  }

  /* ---------- 語音朗讀與循環伴讀 ---------- */
  function stopSpeech() {
    if ('speechSynthesis' in window) {
      try { window.speechSynthesis.cancel(); } catch (e) {}
    }
    var ttsBtn = document.getElementById('memTtsBtn');
    if (ttsBtn) ttsBtn.classList.remove('is-speaking');
  }

  function speakCurrentVerse(isAutoLoop) {
    if (!('speechSynthesis' in window)) {
      showToast('您的瀏覽器不支援語音合成朗讀');
      return;
    }
    var v = deck[state.idx];
    if (!v) return;

    stopSpeech();
    var ttsBtn = document.getElementById('memTtsBtn');
    if (ttsBtn) ttsBtn.classList.add('is-speaking');

    var repeatTotal = isAutoLoop ? (state.audioRepeat || 2) : 1;
    var currentRep = 0;

    function speakOnce() {
      currentRep++;
      var u = new SpeechSynthesisUtterance(v.ref + '。' + v.zh);
      u.lang = 'zh-TW';
      u.rate = 0.94;
      u.onend = function () {
        if (currentRep < repeatTotal && (isAutoLoop ? state.autoPlay : true)) {
          setTimeout(speakOnce, 600);
        } else {
          if (ttsBtn) ttsBtn.classList.remove('is-speaking');
          if (isAutoLoop && state.autoPlay) {
            setTimeout(function () {
              if (state.autoPlay) nextCard();
            }, 900);
          }
        }
      };
      u.onerror = function () {
        if (ttsBtn) ttsBtn.classList.remove('is-speaking');
      };
      window.speechSynthesis.speak(u);
    }

    speakOnce();
  }

  /* ==========================================================================
   * ================== 核心升級：全新「經文測驗 Section」 ==================
   * ========================================================================== */

  function switchView(viewName) {
    state.view = viewName;
    saveState();
    var viewCard = document.getElementById('memViewCard');
    var viewQuiz = document.getElementById('memViewQuiz');
    var segCard = document.getElementById('segCardBtn');
    var segQuiz = document.getElementById('segQuizBtn');

    if (viewName === 'quiz') {
      if (viewCard) viewCard.hidden = true;
      if (viewQuiz) viewQuiz.hidden = false;
      if (segCard) segCard.classList.remove('active');
      if (segQuiz) segQuiz.classList.add('active');
      stopSpeech();
      initQuizSection();
    } else {
      if (viewCard) viewCard.hidden = false;
      if (viewQuiz) viewQuiz.hidden = true;
      if (segCard) segCard.classList.add('active');
      if (segQuiz) segQuiz.classList.remove('active');
      renderAll();
    }
  }

  function initQuizSection() {
    var pStart = document.getElementById('quizStartPanel');
    var pActive = document.getElementById('quizActivePanel');
    var pSummary = document.getElementById('quizSummaryPanel');
    if (pStart) pStart.hidden = false;
    if (pActive) pActive.hidden = true;
    if (pSummary) pSummary.hidden = true;

    renderQuizCatSelectGrid();
  }

  function renderQuizCatSelectGrid() {
    var grid = document.getElementById('quizCatSelectGrid');
    if (!grid) return;

    var wrongCount = 0;
    Object.keys(state.records).forEach(function (id) {
      if ((state.records[id].wrongCount || 0) > 0) wrongCount++;
    });

    var html = '';
    CATEGORIES.forEach(function (c) {
      var isSel = quizRunState.cat === c.id;
      html += '<div class="quiz-cat-card' + (isSel ? ' active' : '') + '" data-qcat="' + c.id + '">' +
        '<span class="quiz-cat-name">' + c.icon + ' ' + c.title + '</span>' +
        '<span class="quiz-cat-badge">111 節</span>' +
      '</div>';
    });

    html += '<div class="quiz-cat-card' + (quizRunState.cat === 'all' ? ' active' : '') + '" data-qcat="all">' +
      '<span class="quiz-cat-name">🌟 全書 777 節大綜合</span>' +
      '<span class="quiz-cat-badge">777 節</span>' +
    '</div>';

    html += '<div class="quiz-cat-card' + (quizRunState.cat === 'wrong' ? ' active' : '') + '" data-qcat="wrong">' +
      '<span class="quiz-cat-name">🔥 錯題特訓隊列</span>' +
      '<span class="quiz-cat-badge">' + wrongCount + ' 節</span>' +
    '</div>';

    grid.innerHTML = html;

    grid.querySelectorAll('.quiz-cat-card').forEach(function (card) {
      card.addEventListener('click', function () {
        var catId = card.getAttribute('data-qcat');
        quizRunState.cat = catId;
        renderQuizCatSelectGrid();
      });
    });
  }

  function startQuiz() {
    // 依據處境篩選經文池
    var pool = [];
    if (quizRunState.cat === 'all') {
      pool = ALL_VERSES.slice();
    } else if (quizRunState.cat === 'wrong') {
      pool = ALL_VERSES.filter(function (v) {
        return (state.records[v.id] && state.records[v.id].wrongCount > 0);
      });
      if (!pool.length) {
        showToast('目前無錯題，已自動切換為全書綜合測驗！');
        quizRunState.cat = 'all';
        pool = ALL_VERSES.slice();
      }
    } else {
      pool = ALL_VERSES.filter(function (v) { return v.cat === quizRunState.cat; });
    }

    // 隨機洗牌抽題
    var shuffled = pool.slice();
    for (var i = shuffled.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = shuffled[i];
      shuffled[i] = shuffled[j];
      shuffled[j] = t;
    }

    var takeCount = Math.min(quizRunState.totalCount, shuffled.length);
    var selectedVerses = shuffled.slice(0, takeCount);

    // 產生 4 選 1 填空題型
    quizRunState.questions = selectedVerses.map(function (v) {
      return generateQuestionForVerse(v);
    });

    quizRunState.curIndex = 0;
    quizRunState.score = 0;
    quizRunState.correctCount = 0;
    quizRunState.wrongQuestions = [];
    quizRunState.startTime = Date.now();
    quizRunState.answered = false;

    // 切換面板
    document.getElementById('quizStartPanel').hidden = true;
    document.getElementById('quizActivePanel').hidden = false;
    document.getElementById('quizSummaryPanel').hidden = true;

    renderCurrentQuizQuestion();
  }

  function renderCurrentQuizQuestion() {
    var q = quizRunState.questions[quizRunState.curIndex];
    if (!q) {
      finishQuiz();
      return;
    }

    quizRunState.answered = false;

    var curNum = quizRunState.curIndex + 1;
    var totalNum = quizRunState.questions.length;

    // 進度條與資訊
    var stepEl = document.getElementById('quizProgressText');
    if (stepEl) stepEl.textContent = '第 ' + curNum + ' / ' + totalNum + ' 題';

    var scoreBadge = document.getElementById('quizCurrentScoreBadge');
    if (scoreBadge) scoreBadge.textContent = '得分: ' + quizRunState.score;

    var bar = document.getElementById('quizRunnerProgressBar');
    if (bar) bar.style.width = Math.round((curNum / totalNum) * 100) + '%';

    var catTag = document.getElementById('quizRunnerCatTag');
    var catMeta = CATEGORIES.find(function (c) { return c.id === q.verse.cat; }) || CATEGORIES[0];
    if (catTag) catTag.textContent = catMeta.icon + ' ' + catMeta.title + ' · ' + q.verse.subcat;

    var refEl = document.getElementById('quizRunnerRef');
    if (refEl) refEl.textContent = q.verse.ref;

    var promptEl = document.getElementById('quizRunnerPrompt');
    if (promptEl) {
      var highlighted = escapeHtml(q.prompt).replace('【 ？ 】', '<span class="quiz-blank-badge">【 ？ 】</span>');
      promptEl.innerHTML = highlighted;
    }

    // 隱藏解析與下一題按鈕
    var feedbackBox = document.getElementById('quizFeedbackBox');
    if (feedbackBox) {
      feedbackBox.hidden = true;
      feedbackBox.className = 'quiz-feedback-box';
      feedbackBox.innerHTML = '';
    }

    var actionsBox = document.getElementById('quizRunnerActions');
    if (actionsBox) actionsBox.hidden = true;

    // 渲染 4 個選項
    var gridEl = document.getElementById('quizRunnerChoicesGrid');
    if (!gridEl) return;
    gridEl.innerHTML = '';

    q.choices.forEach(function (choiceText, cIdx) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'quiz-choice-btn';
      var keyChar = String.fromCharCode(65 + cIdx);
      btn.innerHTML = '<span class="quiz-choice-key">' + keyChar + '</span><span>' + escapeHtml(choiceText) + '</span>';

      btn.addEventListener('click', function () {
        handleQuizAnswer(choiceText, btn, q);
      });

      gridEl.appendChild(btn);
    });
  }

  function handleQuizAnswer(selectedText, btnEl, q) {
    if (quizRunState.answered) return;
    quizRunState.answered = true;

    var isCorrect = (selectedText === q.target);
    var feedbackBox = document.getElementById('quizFeedbackBox');
    var actionsBox = document.getElementById('quizRunnerActions');
    var nextBtn = document.getElementById('quizNextQuestionBtn');

    if (isCorrect) {
      btnEl.classList.add('correct');
      playSound('correct');
      quizRunState.score += Math.round(100 / quizRunState.questions.length);
      quizRunState.correctCount++;
      if (feedbackBox) {
        feedbackBox.className = 'quiz-feedback-box correct-box';
        feedbackBox.innerHTML = '<div style="color:var(--ok);font-weight:800;font-size:1.02rem;margin-bottom:4px;">🎉 答對了！恭喜！</div>' +
          '<div><strong>和合本完整經文：</strong>「' + escapeHtml(q.verse.zh) + '」</div>' +
          (q.verse.strong ? '<div style="font-size:0.78rem;color:var(--strong);margin-top:4px;">🏷️ ' + escapeHtml(q.verse.strong) + '</div>' : '');
        feedbackBox.hidden = false;
      }
    } else {
      btnEl.classList.add('wrong');
      playSound('wrong');
      quizRunState.wrongQuestions.push({
        verse: q.verse,
        target: q.target,
        userChoice: selectedText
      });
      // 記錄到全域錯題
      var r = getRecord(q.verse.id);
      r.wrongCount = (r.wrongCount || 0) + 1;
      state.records[q.verse.id] = r;
      saveState();

      // 高亮正確選項
      var gridEl = document.getElementById('quizRunnerChoicesGrid');
      if (gridEl) {
        gridEl.querySelectorAll('.quiz-choice-btn').forEach(function (b) {
          if (b.textContent.indexOf(q.target) !== -1) b.classList.add('correct');
        });
      }

      if (feedbackBox) {
        feedbackBox.className = 'quiz-feedback-box wrong-box';
        feedbackBox.innerHTML = '<div style="color:var(--seal);font-weight:800;font-size:1.02rem;margin-bottom:4px;">❌ 答錯了！正確答案是：<strong>' + escapeHtml(q.target) + '</strong></div>' +
          '<div><strong>和合本完整經文：</strong>「' + escapeHtml(q.verse.zh) + '」</div>' +
          (q.verse.strong ? '<div style="font-size:0.78rem;color:var(--strong);margin-top:4px;">🏷️ ' + escapeHtml(q.verse.strong) + '</div>' : '');
        feedbackBox.hidden = false;
      }
    }

    var scoreBadge = document.getElementById('quizCurrentScoreBadge');
    if (scoreBadge) scoreBadge.textContent = '得分: ' + quizRunState.score;

    if (actionsBox) actionsBox.hidden = false;
    if (nextBtn) {
      var isLast = (quizRunState.curIndex >= quizRunState.questions.length - 1);
      nextBtn.innerHTML = isLast ? '<span>查看測驗成績單 🏆</span>' : '<span>下一題 ➔</span>';
    }
  }

  function nextQuizQuestion() {
    quizRunState.curIndex++;
    if (quizRunState.curIndex >= quizRunState.questions.length) {
      finishQuiz();
    } else {
      renderCurrentQuizQuestion();
    }
  }

  function finishQuiz() {
    var spentSec = Math.max(1, Math.round((Date.now() - quizRunState.startTime) / 1000));
    var mins = Math.floor(spentSec / 60);
    var secs = spentSec % 60;
    quizRunState.timeSpentStr = (mins > 0 ? (mins + '分') : '') + secs + '秒';

    var total = quizRunState.questions.length;
    var correct = quizRunState.correctCount;
    var finalScore = Math.min(100, Math.round((correct / Math.max(1, total)) * 100));

    document.getElementById('quizActivePanel').hidden = true;
    var pSummary = document.getElementById('quizSummaryPanel');
    if (pSummary) pSummary.hidden = false;

    var sNum = document.getElementById('quizSummaryScore');
    if (sNum) sNum.textContent = finalScore;

    var sGrade = document.getElementById('quizSummaryGrade');
    if (sGrade) {
      if (finalScore === 100) sGrade.textContent = '🏆 滿分！聖經記憶大師，神的話純全精熟！';
      else if (finalScore >= 80) sGrade.textContent = '✨ 優秀精兵！真理之光照亮心懷意念！';
      else if (finalScore >= 60) sGrade.textContent = '🌿 漸入佳境！持續練習必結出豐盛果子！';
      else sGrade.textContent = '💪 剛強壯膽！將錯題多加複習，必能得勝！';
    }

    var sCor = document.getElementById('quizSummaryCorrect');
    var sTot = document.getElementById('quizSummaryTotal');
    var sAcc = document.getElementById('quizSummaryAccuracy');
    var sTime = document.getElementById('quizSummaryTime');
    if (sCor) sCor.textContent = correct;
    if (sTot) sTot.textContent = total;
    if (sAcc) sAcc.textContent = finalScore + '%';
    if (sTime) sTime.textContent = quizRunState.timeSpentStr;

    // 錯題回顧列表
    var wrongListEl = document.getElementById('quizWrongListContainer');
    var wrongTitleEl = document.getElementById('quizWrongTitle');
    var addWrongBtn = document.getElementById('quizAddWrongsToReviewBtn');

    if (quizRunState.wrongQuestions.length) {
      if (wrongTitleEl) wrongTitleEl.hidden = false;
      if (addWrongBtn) addWrongBtn.hidden = false;
      var wHtml = '';
      quizRunState.wrongQuestions.forEach(function (wq) {
        wHtml += '<div class="quiz-wrong-item">' +
          '<div class="quiz-wrong-item-ref">' + escapeHtml(wq.verse.ref) + ' · ' + escapeHtml(wq.verse.subcat) + '</div>' +
          '<div>你的選擇：<span style="color:var(--seal);text-decoration:line-through;">' + escapeHtml(wq.userChoice) + '</span>，正確答案：<strong style="color:var(--ok);">' + escapeHtml(wq.target) + '</strong></div>' +
          '<div style="font-family:var(--font-serif);margin-top:2px;color:var(--fg);">「' + escapeHtml(wq.verse.zh) + '」</div>' +
        '</div>';
      });
      if (wrongListEl) wrongListEl.innerHTML = wHtml;
    } else {
      if (wrongTitleEl) wrongTitleEl.hidden = true;
      if (addWrongBtn) addWrongBtn.hidden = true;
      if (wrongListEl) wrongListEl.innerHTML = '<div style="text-align:center;padding:16px;color:var(--ok);font-weight:700;">太棒了！本次測驗全數答對，無任何錯題！🎉</div>';
    }
  }

  /* ---------- 抽屜 1: 基甸會處境指南 ---------- */
  function renderGideonModal() {
    var grid = document.getElementById('memGideonGrid');
    if (!grid) return;

    var html = '';
    CATEGORIES.forEach(function (c) {
      var catVerses = ALL_VERSES.filter(function (v) { return v.cat === c.id; });
      var mastered = catVerses.filter(function (v) {
        var r = state.records[v.id];
        return r && r.level >= 4;
      }).length;

      var isAct = state.cat === c.id;
      html += '<div class="mem-gideon-card' + (isAct ? ' active' : '') + '" data-gcat="' + c.id + '">' +
        '<div class="mem-gideon-card-top">' +
          '<span class="mem-gideon-card-title">' + c.icon + ' ' + c.num + '. ' + escapeHtml(c.title) + '</span>' +
          '<span style="font-size:0.75rem;font-weight:800;color:var(--ok);">熟背 ' + mastered + ' / 111 節</span>' +
        '</div>' +
        '<div class="mem-gideon-card-sub">📍 ' + escapeHtml(c.gideonTitle) + '</div>' +
        '<div class="mem-gideon-card-desc">' + escapeHtml(c.desc) + '</div>' +
      '</div>';
    });
    grid.innerHTML = html;

    grid.querySelectorAll('.mem-gideon-card').forEach(function (card) {
      card.addEventListener('click', function () {
        var cid = card.getAttribute('data-gcat');
        state.cat = cid;
        state.idx = 0;
        buildDeck();
        saveState();
        switchView('card');
        document.getElementById('memGideonModal').hidden = true;
      });
    });
  }

  /* ---------- 抽屜 2: 777 經文總表清單 ---------- */
  function renderListModal(query) {
    var container = document.getElementById('memVerseListContainer');
    var titleEl = document.getElementById('memListSheetTitle');
    if (!container) return;

    var q = (query || '').trim().toLowerCase();
    var sourceList = q ? ALL_VERSES : deck;
    var filtered = sourceList.filter(function (v) {
      if (!q) return true;
      return v.ref.toLowerCase().indexOf(q) !== -1 ||
             v.zh.toLowerCase().indexOf(q) !== -1 ||
             v.subcat.toLowerCase().indexOf(q) !== -1 ||
             v.group.toLowerCase().indexOf(q) !== -1 ||
             (v.en && v.en.toLowerCase().indexOf(q) !== -1);
    });

    if (titleEl) {
      titleEl.textContent = q ? ('🔍 搜尋結果（' + filtered.length + ' 節）') : ('📋 當前分類經文（' + filtered.length + ' 節）');
    }

    var curV = deck[state.idx];
    var html = '';
    filtered.slice(0, 200).forEach(function (v) {
      var r = getRecord(v.id);
      var statusBadge = r.level >= 4 ? '✨ 已熟背' : (r.reps > 0 ? '🌿 練習中' : '');
      var isCur = curV && curV.id === v.id;
      html += '<div class="mem-verse-row' + (isCur ? ' current' : '') + '" data-vid="' + v.id + '">' +
        '<div class="mem-verse-row-top">' +
          '<span>#' + v.id + ' · ' + escapeHtml(v.ref) + ' <small style="color:var(--fg-mute);font-weight:600;">(' + escapeHtml(v.subcat) + ')</small></span>' +
          '<span>' + (r.starred ? '★ ' : '') + statusBadge + '</span>' +
        '</div>' +
        '<div class="mem-verse-row-zh">' + escapeHtml(v.zh) + '</div>' +
      '</div>';
    });
    if (filtered.length > 200) {
      html += '<div style="text-align:center;padding:10px;font-size:0.78rem;color:var(--fg-mute);">僅顯示前 200 筆，請輸入關鍵字縮小範圍</div>';
    }
    container.innerHTML = html;

    container.querySelectorAll('.mem-verse-row').forEach(function (row) {
      row.addEventListener('click', function () {
        var vid = parseInt(row.getAttribute('data-vid'), 10);
        var idxInDeck = deck.findIndex(function (item) { return item.id === vid; });
        if (idxInDeck !== -1) {
          state.idx = idxInDeck;
        } else {
          state.cat = 'all';
          buildDeck();
          state.idx = deck.findIndex(function (item) { return item.id === vid; });
          if (state.idx === -1) state.idx = 0;
        }
        saveState();
        switchView('card');
        document.getElementById('memListModal').hidden = true;
      });
    });
  }

  /* ---------- 抽屜 3: 統計與外觀設定 ---------- */
  function renderStatsModal() {
    var mastered = 0;
    var learning = 0;
    var due = 0;
    var now = Date.now();

    Object.keys(state.records).forEach(function (id) {
      var r = state.records[id];
      if (!r || !r.reps) return;
      if (r.level >= 4) mastered++;
      else learning++;
      if (r.level < 4 && r.nextDue <= now) due++;
    });

    var elMaster = document.getElementById('statMasteredCount');
    var elLearn = document.getElementById('statLearningCount');
    var elDue = document.getElementById('statDueCount');
    if (elMaster) elMaster.textContent = mastered;
    if (elLearn) elLearn.textContent = learning;
    if (elDue) elDue.textContent = due;
  }

  function syncToolbarButtons() {
    document.querySelectorAll('#memModeRow .mem-mode-btn').forEach(function (btn) {
      btn.classList.toggle('active', btn.getAttribute('data-mode') === state.mode);
    });
    document.querySelectorAll('#memMaskPills .mem-mask-pill').forEach(function (btn) {
      btn.classList.toggle('active', parseInt(btn.getAttribute('data-mask'), 10) === state.maskRate);
    });
    document.querySelectorAll('#memFontSizeGroup .mem-opt-chip').forEach(function (btn) {
      btn.classList.toggle('active', btn.getAttribute('data-fsize') === state.fsize);
    });
    document.querySelectorAll('#memThemeGroup .mem-opt-chip').forEach(function (btn) {
      btn.classList.toggle('active', btn.getAttribute('data-theme') === state.theme);
    });
    document.querySelectorAll('#memAudioRepeatGroup .mem-opt-chip').forEach(function (btn) {
      btn.classList.toggle('active', parseInt(btn.getAttribute('data-repeat'), 10) === state.audioRepeat);
    });

    var soundBtn = document.getElementById('memToggleSoundBtn');
    if (soundBtn) {
      soundBtn.classList.toggle('active', state.sound);
      soundBtn.textContent = state.sound ? '🔔 開啟音效' : '🔕 靜音模式';
    }

    var enBtn = document.getElementById('memToggleEnBtn');
    var origBtn = document.getElementById('memToggleOrigBtn');
    var strongBtn = document.getElementById('memToggleStrongBtn');
    if (enBtn) enBtn.classList.toggle('active', state.showEn);
    if (origBtn) origBtn.classList.toggle('active', state.showOrig);
    if (strongBtn) strongBtn.classList.toggle('active', state.showStrong);

    var autoBtn = document.getElementById('memAutoPlayBtn');
    if (autoBtn) autoBtn.classList.toggle('active', state.autoPlay);

    // 同步全螢幕按鈕圖標
    var fsBtn = document.getElementById('memFullscreenBtn');
    if (fsBtn) {
      var isFs = !!document.fullscreenElement;
      fsBtn.classList.toggle('active', isFs);
      fsBtn.title = isFs ? '退出全螢幕 (F)' : '切換手機全螢幕沉浸模式 (F)';
    }
  }

  function escapeHtml(str) {
    return (str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function renderAll() {
    renderCategoryStrip();
    syncToolbarButtons();
    if (state.view === 'card') {
      renderCard();
    }
  }

  /* ---------- 事件監聽綁定 ---------- */
  function bindEvents() {
    // 頂部視圖切換：背誦卡 vs 測驗
    document.getElementById('segCardBtn').addEventListener('click', function () {
      switchView('card');
    });
    document.getElementById('segQuizBtn').addEventListener('click', function () {
      switchView('quiz');
    });

    // 模式切換
    document.querySelectorAll('#memModeRow .mem-mode-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        state.mode = btn.getAttribute('data-mode');
        cardQuizState = null;
        saveState();
        syncToolbarButtons();
        renderCard();
      });
    });

    // 遮蔽難度
    document.querySelectorAll('#memMaskPills .mem-mask-pill').forEach(function (btn) {
      btn.addEventListener('click', function () {
        state.maskRate = parseInt(btn.getAttribute('data-mask'), 10);
        saveState();
        syncToolbarButtons();
        renderCard();
      });
    });

    // 上一節 / 下一節
    document.getElementById('memPrevBtn').addEventListener('click', prevCard);
    document.getElementById('memNextBtn').addEventListener('click', nextCard);

    // 隨機抽題
    document.getElementById('memShuffleBtn').addEventListener('click', function () {
      if (deck.length <= 1) return;
      var nextIdx = Math.floor(Math.random() * deck.length);
      if (nextIdx === state.idx) nextIdx = (nextIdx + 1) % deck.length;
      state.idx = nextIdx;
      cardQuizState = null;
      resetDictationBox();
      renderCard();
      showToast('🎲 隨機抽題：' + deck[state.idx].ref);
    });

    // SRS 自評
    document.querySelectorAll('.mem-srs-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        recordSrs(btn.getAttribute('data-srs'));
      });
    });

    // 按住偷看全文手勢
    var peekBtn = document.getElementById('memPeekBtn');
    if (peekBtn) {
      var startPeek = function (e) {
        e.preventDefault();
        state.peeking = true;
        peekBtn.classList.add('peeking');
        renderCard();
      };
      var endPeek = function () {
        if (!state.peeking) return;
        state.peeking = false;
        peekBtn.classList.remove('peeking');
        renderCard();
      };
      peekBtn.addEventListener('mousedown', startPeek);
      peekBtn.addEventListener('touchstart', startPeek, { passive: false });
      window.addEventListener('mouseup', endPeek);
      window.addEventListener('touchend', endPeek);
      window.addEventListener('touchcancel', endPeek);
    }

    // 收藏經文
    document.getElementById('memStarBtn').addEventListener('click', function () {
      var v = deck[state.idx];
      if (!v) return;
      var r = getRecord(v.id);
      r.starred = !r.starred;
      state.records[v.id] = r;
      saveState();
      renderAll();
      showToast(r.starred ? ('⭐ 已收藏重點背誦：' + v.ref) : '已取消收藏');
    });

    // 語音朗讀
    document.getElementById('memTtsBtn').addEventListener('click', function () {
      speakCurrentVerse(false);
    });

    // 伴讀循環
    document.getElementById('memAutoPlayBtn').addEventListener('click', function () {
      state.autoPlay = !state.autoPlay;
      syncToolbarButtons();
      if (state.autoPlay) {
        showToast('🎧 開啟語音伴讀（每節讀 ' + state.audioRepeat + ' 次自動推進）');
        speakCurrentVerse(true);
      } else {
        stopSpeech();
        showToast('已停止語音伴讀');
      }
    });

    // 分享經文
    document.getElementById('memShareBtn').addEventListener('click', function () {
      var v = deck[state.idx];
      if (!v) return;
      var text = '【' + v.ref + '】\n「' + v.zh + '」\n' + (v.en ? v.en + '\n' : '') + '—— Biblia 777 基甸會處境經文背誦 (' + v.subcat + ')';
      if (navigator.share) {
        navigator.share({ title: v.ref + ' 經文背誦卡', text: text }).catch(function () {});
      } else if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () {
          showToast('📋 已複製經文手籤：' + v.ref);
        });
      }
    });

    // 默寫核對
    var checkBtn = document.getElementById('memDictationCheckBtn');
    if (checkBtn) checkBtn.addEventListener('click', checkDictation);

    // 全螢幕切換
    document.getElementById('memFullscreenBtn').addEventListener('click', function () {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().then(function () {
          document.body.classList.add('is-true-fullscreen');
          showToast('⛶ 已進入沉浸全螢幕');
        }).catch(function () {
          document.body.classList.toggle('is-true-fullscreen');
        });
      } else {
        document.exitFullscreen().then(function () {
          document.body.classList.remove('is-true-fullscreen');
        }).catch(function () {});
      }
      setTimeout(syncToolbarButtons, 150);
    });

    document.addEventListener('fullscreenchange', function () {
      document.body.classList.toggle('is-true-fullscreen', !!document.fullscreenElement);
      syncToolbarButtons();
    });

    // 測驗題數按鈕群
    document.querySelectorAll('#quizCountGroup .quiz-count-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        document.querySelectorAll('#quizCountGroup .quiz-count-btn').forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        quizRunState.totalCount = parseInt(btn.getAttribute('data-qcount'), 10) || 10;
      });
    });

    // 開始測驗
    document.getElementById('quizStartBtn').addEventListener('click', function () {
      startQuiz();
    });

    // 測驗中下一題
    document.getElementById('quizNextQuestionBtn').addEventListener('click', function () {
      nextQuizQuestion();
    });

    // 提早結束測驗
    document.getElementById('quizAbortBtn').addEventListener('click', function () {
      if (confirm('確定要結束本次測驗嗎？已答題目將會結算成績。')) {
        finishQuiz();
      }
    });

    // 再測一次
    document.getElementById('quizRetryBtn').addEventListener('click', function () {
      startQuiz();
    });

    // 錯題加入重點複習
    document.getElementById('quizAddWrongsToReviewBtn').addEventListener('click', function () {
      quizRunState.wrongQuestions.forEach(function (wq) {
        var r = getRecord(wq.verse.id);
        r.starred = true;
        r.wrongCount = (r.wrongCount || 0) + 1;
        state.records[wq.verse.id] = r;
      });
      saveState();
      showToast('⭐ 已將 ' + quizRunState.wrongQuestions.length + ' 題加入重點複習！');
    });

    // 回到經文背誦卡
    document.getElementById('quizBackToCardBtn').addEventListener('click', function () {
      switchView('card');
    });

    // 抽屜控制
    document.getElementById('memOpenGideonBtn').addEventListener('click', function () {
      renderGideonModal();
      document.getElementById('memGideonModal').hidden = false;
    });

    document.getElementById('memOpenListBtn').addEventListener('click', function () {
      var sInp = document.getElementById('memListSearchInput');
      if (sInp) sInp.value = '';
      renderListModal('');
      document.getElementById('memListModal').hidden = false;
    });

    var listSearch = document.getElementById('memListSearchInput');
    if (listSearch) {
      listSearch.addEventListener('input', function () {
        renderListModal(listSearch.value);
      });
    }

    document.getElementById('memOpenSettingsBtn').addEventListener('click', function () {
      renderStatsModal();
      syncToolbarButtons();
      document.getElementById('memSettingsModal').hidden = false;
    });

    document.querySelectorAll('[data-close]').forEach(function (el) {
      el.addEventListener('click', function () {
        var targetId = el.getAttribute('data-close');
        var modal = document.getElementById(targetId);
        if (modal) modal.hidden = true;
      });
    });

    // 外觀設定
    document.querySelectorAll('#memFontSizeGroup .mem-opt-chip').forEach(function (btn) {
      btn.addEventListener('click', function () {
        state.fsize = btn.getAttribute('data-fsize');
        applyAppearance();
        saveState();
        syncToolbarButtons();
      });
    });

    document.querySelectorAll('#memThemeGroup .mem-opt-chip').forEach(function (btn) {
      btn.addEventListener('click', function () {
        state.theme = btn.getAttribute('data-theme');
        applyAppearance();
        saveState();
        syncToolbarButtons();
      });
    });

    document.getElementById('memToggleSoundBtn').addEventListener('click', function () {
      state.sound = !state.sound;
      saveState();
      syncToolbarButtons();
      showToast(state.sound ? '🔔 已開啟測驗音效' : '🔕 已切換為靜音');
    });

    document.getElementById('memToggleEnBtn').addEventListener('click', function () {
      state.showEn = !state.showEn;
      saveState();
      syncToolbarButtons();
      renderCard();
    });

    document.getElementById('memToggleOrigBtn').addEventListener('click', function () {
      state.showOrig = !state.showOrig;
      saveState();
      syncToolbarButtons();
      renderCard();
    });

    document.getElementById('memToggleStrongBtn').addEventListener('click', function () {
      state.showStrong = !state.showStrong;
      saveState();
      syncToolbarButtons();
      renderCard();
    });

    document.querySelectorAll('#memAudioRepeatGroup .mem-opt-chip').forEach(function (btn) {
      btn.addEventListener('click', function () {
        state.audioRepeat = parseInt(btn.getAttribute('data-repeat'), 10);
        saveState();
        syncToolbarButtons();
      });
    });

    // 匯出 / 匯入
    document.getElementById('memExportBtn').addEventListener('click', function () {
      var dataStr = JSON.stringify({
        exportedAt: new Date().toISOString(),
        records: state.records,
        streak: state.streak
      }, null, 2);
      var blob = new Blob([dataStr], { type: 'application/json' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = 'biblia_memory_777_backup_' + todayStr() + '.json';
      a.click();
      URL.revokeObjectURL(url);
      showToast('📥 已匯出 777 背誦與測驗進度備份');
    });

    document.getElementById('memImportInput').addEventListener('change', function (e) {
      var file = e.target.files && e.target.files[0];
      if (!file) return;
      var reader = new FileReader();
      reader.onload = function (ev) {
        try {
          var parsed = JSON.parse(ev.target.result);
          if (parsed && parsed.records) {
            state.records = Object.assign({}, state.records, parsed.records);
            if (parsed.streak) state.streak = parsed.streak;
            saveState();
            renderStatsModal();
            renderAll();
            showToast('📤 已成功還原紀錄！');
          }
        } catch (err) {
          showToast('匯入失敗：JSON 格式不正確');
        }
      };
      reader.readAsText(file);
    });

    // 手機左右滑動換卡手勢
    var stage = document.getElementById('memStage');
    var touchStartX = 0;
    var touchStartY = 0;
    if (stage) {
      stage.addEventListener('touchstart', function (e) {
        if (e.touches.length !== 1) return;
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
      }, { passive: true });

      stage.addEventListener('touchend', function (e) {
        if (!e.changedTouches.length) return;
        var dx = e.changedTouches[0].clientX - touchStartX;
        var dy = e.changedTouches[0].clientY - touchStartY;
        if (Math.abs(dx) > 56 && Math.abs(dx) > Math.abs(dy) * 1.4) {
          if (dx < 0) nextCard();
          else prevCard();
        }
      }, { passive: true });
    }

    // 鍵盤快捷鍵
    window.addEventListener('keydown', function (e) {
      if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
      if (state.view === 'card') {
        if (e.key === 'ArrowLeft') { e.preventDefault(); prevCard(); }
        else if (e.key === 'ArrowRight') { e.preventDefault(); nextCard(); }
        else if (e.key === '1') { e.preventDefault(); recordSrs('again'); }
        else if (e.key === '2') { e.preventDefault(); recordSrs('good'); }
        else if (e.key === '3') { e.preventDefault(); recordSrs('easy'); }
        else if (e.key === ' ') { e.preventDefault(); speakCurrentVerse(false); }
        else if (e.key === 's' || e.key === 'S') { e.preventDefault(); document.getElementById('memStarBtn').click(); }
        else if (e.key === 'f' || e.key === 'F') { e.preventDefault(); document.getElementById('memFullscreenBtn').click(); }
      } else if (state.view === 'quiz') {
        if (['1', '2', '3', '4', 'a', 'b', 'c', 'd', 'A', 'B', 'C', 'D'].indexOf(e.key) !== -1) {
          var map = { '1': 0, 'a': 0, 'A': 0, '2': 1, 'b': 1, 'B': 1, '3': 2, 'c': 2, 'C': 2, '4': 3, 'd': 3, 'D': 3 };
          var targetIndex = map[e.key];
          var btns = document.querySelectorAll('#quizRunnerChoicesGrid .quiz-choice-btn');
          if (btns[targetIndex]) btns[targetIndex].click();
        } else if (e.key === 'Enter' || e.key === 'ArrowRight') {
          var nextBtn = document.getElementById('quizNextQuestionBtn');
          if (nextBtn && !document.getElementById('quizRunnerActions').hidden) {
            nextBtn.click();
          }
        }
      }
    });

    // 監聽橫直式螢幕旋轉
    window.addEventListener('resize', function () {
      if (state.view === 'card') renderCard();
    });
  }

  /* ---------- URL Hash 支援 ---------- */
  function parseHash() {
    var h = (window.location.hash || '').replace(/^#/, '');
    if (!h) return;
    if (h === 'quiz') {
      state.view = 'quiz';
      return;
    }
    if (h.indexOf('cat=') === 0) {
      var cid = h.slice(4);
      if (CATEGORIES.some(function (c) { return c.id === cid; }) || cid === 'all') {
        state.cat = cid;
        state.idx = 0;
      }
    } else if (h.indexOf('id=') === 0) {
      var vid = parseInt(h.slice(3), 10);
      var targetV = ALL_VERSES.find(function (v) { return v.id === vid; });
      if (targetV) {
        state.cat = targetV.cat;
        buildDeck();
        var pos = deck.findIndex(function (v) { return v.id === vid; });
        if (pos !== -1) state.idx = pos;
      }
    }
  }

  /* ---------- 初始化 ---------- */
  function init() {
    buildDistractorPools();
    loadState();
    parseHash();
    applyAppearance();
    buildDeck();
    bindEvents();
    switchView(state.view || 'card');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
