/* Biblia — 777 節經文背誦與基甸會聖經處境練習引擎 (app/memory.js)
 *
 * 支援功能：
 * 1. 基甸會聖經「經文選讀」7 大生命處境分類（7 × 111 = 777 節）+ 待複習/收藏隊列
 * 2. 6 大主動提取背誦練習模式：
 *    - read:      熟讀默想（全文清晰呈現）
 *    - mask:      漸進遮蔽（支援 0% / 30% / 60% / 100% 智慧詞彙遮蔽，點擊單詞翻開）
 *    - first:     首字提示（每句僅留首字與標點，訓練整句提取）
 *    - tap:       逐句點按（以分句膠囊呈現，背出一句點開一句）
 *    - quiz:      挖空四選一（自動自同處境經文中抽取干擾項，即時互動闖關）
 *    - dictation: 默寫核對（輸入文字自動比對和合本原文、計算準確率並標示差異）
 * 3. 間隔重複記憶系統 (SRS)：還不熟 (Again) / 有印象 (Good) / 已熟背 (Easy)
 * 4. 語音朗讀與循環伴讀 (Web Speech API)：支援單節朗讀與自動連續伴讀
 * 5. 手機全螢幕觸控手勢：左右滑動切換上/下一節，按住偷看全文
 */
(function () {
  'use strict';

  var DB = window.BIBLIA_MEMORY_777 || { categories: [], verses: [] };
  var CATEGORIES = DB.categories || [];
  var ALL_VERSES = DB.verses || [];

  var BOOK_DIRS = 'Gen Ex Lev Num Deut Josh Judg Ruth 1Sam 2Sam 1Kin 2Kin 1Chr 2Chr Ezra Neh Esth Job Ps Prov Eccl Song Is Jer Lam Ezek Dan Hos Joel Amos Obad Jon Mic Nah Hab Zeph Hag Zech Mal Matt Mark Luke John Acts Rom 1Cor 2Cor Gal Eph Phil Col 1Thess 2Thess 1Tim 2Tim Titus Philem Heb James 1Pet 2Pet 1John 2John 3John Jude Rev'.split(' ');

  var STORAGE_KEY = 'biblia_memory_777_v1';

  // 狀態管理
  var state = {
    cat: 'fear',         // 'all' | 'due' | 'starred' | 7 category IDs
    idx: 0,              // index within filtered deck
    mode: 'mask',        // 'read' | 'mask' | 'first' | 'tap' | 'quiz' | 'dictation'
    maskRate: 30,        // 0 | 30 | 60 | 100
    fsize: '1.42rem',
    theme: 'light',
    showEn: true,
    showOrig: false,
    showStrong: true,
    audioRepeat: 2,
    autoPlay: false,
    peeking: false,
    records: {},         // verseId -> { level: 0..5, nextDue: timestamp, reps: 0, starred: false }
    streak: { count: 1, lastDate: '' }
  };

  var deck = [];
  var quizState = null;

  /* ---------- Toast 提示 ---------- */
  function showToast(msg, ms) {
    var t = document.getElementById('memToast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'memToast';
      t.style.cssText = 'position:fixed;bottom:96px;left:50%;transform:translateX(-50%);' +
        'background:rgba(24,22,20,0.92);color:#fff;padding:8px 16px;border-radius:999px;' +
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
        if (raw.cat) state.cat = raw.cat;
        if (typeof raw.idx === 'number') state.idx = raw.idx;
        if (raw.mode) state.mode = raw.mode;
        if (typeof raw.maskRate === 'number') state.maskRate = raw.maskRate;
        if (raw.fsize) state.fsize = raw.fsize;
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
        cat: state.cat,
        idx: state.idx,
        mode: state.mode,
        maskRate: state.maskRate,
        fsize: state.fsize,
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

    // 同步主閱讀器主題
    try {
      var b = JSON.parse(localStorage.getItem('biblia') || 'null') || {};
      b.theme = state.theme;
      localStorage.setItem('biblia', JSON.stringify(b));
    } catch (e) {}
  }

  /* ---------- SRS 狀態與牌組篩選 ---------- */
  function getRecord(verseId) {
    return state.records[verseId] || { level: 0, nextDue: 0, reps: 0, starred: false };
  }

  function isDue(verseId) {
    var r = state.records[verseId];
    if (!r || !r.reps) return false;
    return r.level < 4 && r.nextDue <= Date.now();
  }

  function buildDeck() {
    var now = Date.now();
    if (state.cat === 'all') {
      deck = ALL_VERSES.slice();
    } else if (state.cat === 'due') {
      deck = ALL_VERSES.filter(function (v) {
        var r = state.records[v.id];
        return r && r.reps > 0 && (r.level < 4 || r.nextDue <= now);
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

  /* ---------- 智慧分句與詞彙切分引擎 ---------- */
  function splitIntoClauses(zhText) {
    // 依標點符號切分成子句陣列：[{ text: '耶和華是我的牧者', punc: '，' }, ...]
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
    // 將子句切成 2~3 字的語意記憶塊，方便 30% / 60% 遮蔽
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

  /* ---------- 渲染頂部處境分類條 ---------- */
  function renderCategoryStrip() {
    var strip = document.getElementById('memCatStrip');
    if (!strip) return;

    var dueCount = 0;
    var starCount = 0;
    var now = Date.now();
    Object.keys(state.records).forEach(function (id) {
      var r = state.records[id];
      if (r.starred) starCount++;
      if (r.reps > 0 && (r.level < 4 || r.nextDue <= now)) dueCount++;
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

  /* ---------- 渲染主背誦卡片 ---------- */
  function renderCard() {
    if (!deck.length) buildDeck();
    var v = deck[state.idx] || ALL_VERSES[0];
    if (!v) return;

    var catMeta = CATEGORIES.find(function (c) { return c.id === v.cat; }) || CATEGORIES[0];
    var rec = getRecord(v.id);

    // 頂部計數與進度條
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

    // 卡片裝飾與處境徽章
    var ribbon = document.getElementById('memCardRibbon');
    if (ribbon && catMeta) ribbon.style.background = catMeta.color;

    var catTag = document.getElementById('memCardCatTag');
    if (catTag && catMeta) {
      catTag.textContent = catMeta.icon + ' ' + catMeta.title;
    }

    var groupTag = document.getElementById('memCardGroupTag');
    if (groupTag) groupTag.textContent = v.subcat;

    var starBtn = document.getElementById('memStarBtn');
    if (starBtn) {
      starBtn.textContent = rec.starred ? '★' : '☆';
      starBtn.classList.toggle('is-starred', !!rec.starred);
    }

    // 經文出處標題
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

    // 讀整章跳轉連結
    var readCtxBtn = document.getElementById('memReadContextBtn');
    if (readCtxBtn) {
      var bDir = BOOK_DIRS[v.bookNo - 1] || v.bookNo;
      readCtxBtn.href = 'index.html#read/' + bDir + '/' + v.chap;
    }

    // 根據當前模式渲染和合本經文區
    var bodyEl = document.getElementById('memCardBody');
    if (bodyEl) {
      bodyEl.classList.toggle('is-long', v.zh.length > 65 || state.mode === 'quiz' || state.mode === 'dictation');
    }

    renderVerseByMode(v);

    // 渲染底部輔助對照層 (英文 KJV / 原文 / Strong)
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

    // 控制遮蔽子列的顯示
    var maskSubrow = document.getElementById('memMaskSubrow');
    if (maskSubrow) {
      maskSubrow.style.display = (state.mode === 'mask') ? 'flex' : 'none';
    }
  }

  /* ---------- 各背誦練習模式渲染邏輯 ---------- */
  function renderVerseByMode(v) {
    var zhEl = document.getElementById('memVerseZh');
    var quizPanel = document.getElementById('memQuizPanel');
    var dictBox = document.getElementById('memDictationBox');
    if (!zhEl) return;

    quizPanel.hidden = true;
    dictBox.hidden = true;

    // 若按住偷看全文或處於「熟讀」模式
    if (state.peeking || state.mode === 'read' || (state.mode === 'mask' && state.maskRate === 0)) {
      zhEl.innerHTML = escapeHtml(v.zh);
      return;
    }

    var clauses = splitIntoClauses(v.zh);

    if (state.mode === 'mask') {
      // 漸進遮蔽模式 (30% / 60% / 100%)
      var html = '';
      var chunkIdx = 0;
      clauses.forEach(function (cl) {
        var chunks = splitClauseIntoChunks(cl.text);
        chunks.forEach(function (ch) {
          chunkIdx++;
          var hash = deterministicHash(v.ref + '_' + chunkIdx, v.id);
          var shouldMask = (state.maskRate >= 100) || ((hash % 100) < state.maskRate);
          if (shouldMask) {
            var fullWidthDots = new Array(ch.length + 1).join('＿');
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
      // 首字提示模式：每分句保留第 1 個字，其餘遮蔽，點擊該句可翻開
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
      // 逐句點按模式：每一分句做成互動卡片膠囊，背出一句點開一句
      var tHtml = '';
      clauses.forEach(function (cl, idx) {
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
      // 挖空四選一模式
      quizPanel.hidden = false;
      initOrRenderQuiz(v, clauses, zhEl);
      return;
    }

    if (state.mode === 'dictation') {
      // 默寫核對模式
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

  /* ---------- 挖空四選一 (Quiz Mode) 互動邏輯 ---------- */
  function initOrRenderQuiz(v, clauses, zhEl) {
    if (!quizState || quizState.verseId !== v.id) {
      // 挑選 1~3 個長度 >= 2 的子句進行關鍵詞挖空
      var candidates = [];
      clauses.forEach(function (cl, ci) {
        if (cl.text && cl.text.length >= 3) {
          var takeLen = Math.min(4, Math.max(2, Math.floor(cl.text.length / 2)));
          var startPos = cl.text.length - takeLen;
          var targetWord = cl.text.slice(startPos);
          var prefixText = cl.text.slice(0, startPos);
          candidates.push({
            clauseIdx: ci,
            prefix: prefixText,
            answer: targetWord,
            solved: false
          });
        }
      });
      // 最多取 3 個空位
      if (candidates.length > 3) {
        candidates = [candidates[0], candidates[Math.floor(candidates.length / 2)], candidates[candidates.length - 1]];
      }
      quizState = {
        verseId: v.id,
        blanks: candidates,
        curBlank: 0
      };
    }

    // 渲染帶空格的經文
    var html = '';
    clauses.forEach(function (cl, ci) {
      var bIdx = quizState.blanks.findIndex(function (b) { return b.clauseIdx === ci; });
      if (bIdx === -1) {
        html += escapeHtml(cl.text + cl.punc);
      } else {
        var bObj = quizState.blanks[bIdx];
        html += escapeHtml(bObj.prefix);
        if (bObj.solved) {
          html += '<span class="mem-token masked revealed">' + escapeHtml(bObj.answer) + '</span>';
        } else if (bIdx === quizState.curBlank) {
          html += '<span style="display:inline-block;padding:0 8px;margin:0 3px;border-radius:6px;background:var(--accent-soft);color:var(--accent);border:2px solid var(--accent);font-weight:900;">【 ？ 】</span>';
        } else {
          html += '<span style="display:inline-block;padding:0 6px;margin:0 2px;color:var(--fg-mute);border-bottom:2px dashed var(--line);">＿＿</span>';
        }
        html += escapeHtml(cl.punc);
      }
    });
    zhEl.innerHTML = html;

    var stepEl = document.getElementById('memQuizStepText');
    var promptEl = document.getElementById('memQuizPromptText');
    var gridEl = document.getElementById('memQuizGrid');
    if (!gridEl) return;

    var activeBlank = quizState.blanks[quizState.curBlank];
    if (!activeBlank) {
      if (promptEl) promptEl.textContent = '🎉 恭喜！本節經文填空全數答對！';
      if (stepEl) stepEl.textContent = quizState.blanks.length + ' / ' + quizState.blanks.length;
      gridEl.innerHTML = '<button type="button" class="mem-quiz-opt correct" style="grid-column:span 2;" id="memQuizNextVerseBtn">✨ 太棒了！標記熟練並前往下一節 →</button>';
      var nxtBtn = document.getElementById('memQuizNextVerseBtn');
      if (nxtBtn) {
        nxtBtn.addEventListener('click', function () {
          recordSrs('easy');
        });
      }
      return;
    }

    if (promptEl) promptEl.textContent = '請選出【 ？ 】處正確的和合本經文：';
    if (stepEl) stepEl.textContent = (quizState.curBlank + 1) + ' / ' + quizState.blanks.length;

    // 產生 3 個干擾選項 + 1 個正確答案
    var distractors = getDistractors(activeBlank.answer, v);
    var options = [activeBlank.answer].concat(distractors);
    // 洗牌
    for (var i = options.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = options[i];
      options[i] = options[j];
      options[j] = tmp;
    }

    gridEl.innerHTML = '';
    options.forEach(function (opt) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'mem-quiz-opt';
      btn.textContent = opt;
      btn.addEventListener('click', function () {
        if (opt === activeBlank.answer) {
          btn.classList.add('correct');
          activeBlank.solved = true;
          quizState.curBlank++;
          setTimeout(function () {
            renderVerseByMode(v);
          }, 260);
        } else {
          btn.classList.add('wrong');
        }
      });
      gridEl.appendChild(btn);
    });
  }

  function getDistractors(answer, currentVerse) {
    var len = answer.length;
    var pool = [];
    ALL_VERSES.forEach(function (other) {
      if (other.id === currentVerse.id) return;
      var cls = splitIntoClauses(other.zh);
      cls.forEach(function (c) {
        if (c.text && c.text.length >= len) {
          var sub = c.text.slice(c.text.length - len);
          if (sub !== answer && pool.indexOf(sub) === -1) {
            pool.push(sub);
          }
        }
      });
    });
    var picked = [];
    var seed = currentVerse.id * 31 + answer.charCodeAt(0);
    for (var k = 0; k < 3 && pool.length > 0; k++) {
      var idx = (seed + k * 97) % pool.length;
      picked.push(pool[idx]);
      pool.splice(idx, 1);
    }
    return picked;
  }

  /* ---------- 默寫比對引擎 (Dictation Checker) ---------- */
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
    resEl.hidden = false;
    resEl.innerHTML = '<div><strong>標準和合本比對：</strong></div><div style="margin-top:4px;font-family:var(--font-serif);font-size:1.05rem;">' + diffHtml + '</div>';
  }

  /* ---------- SRS 記憶評分與翻頁 ---------- */
  function recordSrs(grade) {
    var v = deck[state.idx];
    if (!v) return;
    var r = getRecord(v.id);
    r.reps = (r.reps || 0) + 1;
    var now = Date.now();
    var DAY = 86400000;

    if (grade === 'again') {
      r.level = Math.max(0, (r.level || 0) - 1);
      r.nextDue = now + 10 * 60 * 1000; // 10 分鐘後
      showToast('🔄 已加入今日重練隊列');
    } else if (grade === 'good') {
      r.level = Math.min(5, (r.level || 0) + 1);
      var daysGood = [1, 2, 4, 7, 14, 30][r.level] || 3;
      r.nextDue = now + daysGood * DAY;
      showToast('👍 記憶穩固！將於 ' + daysGood + ' 天後提醒複習');
    } else if (grade === 'easy') {
      r.level = Math.max(4, Math.min(5, (r.level || 0) + 2));
      var daysEasy = r.level >= 5 ? 45 : 14;
      r.nextDue = now + daysEasy * DAY;
      showToast('✨ 太棒了！已標記為「熟背掌握」');
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
    quizState = null;
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
    quizState = null;
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

  /* ---------- Web Speech API 語音朗讀與循環伴讀 ---------- */
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

  /* ---------- 抽屜渲染：基甸會 7 大處境導覽 ---------- */
  function renderGideonModal() {
    var grid = document.getElementById('memGideonGrid');
    if (!grid) return;

    var html = '';
    CATEGORIES.forEach(function (c) {
      // 計算該分類已熟背數量
      var catVerses = ALL_VERSES.filter(function (v) { return v.cat === c.id; });
      var mastered = catVerses.filter(function (v) {
        var r = state.records[v.id];
        return r && r.level >= 4;
      }).length;

      var isAct = state.cat === c.id;
      html += '<div class="mem-gideon-card' + (isAct ? ' active' : '') + '" data-gcat="' + c.id + '">' +
        '<div class="mem-gideon-card-top">' +
          '<span class="mem-gideon-card-title">' + c.icon + ' ' + c.num + '. ' + escapeHtml(c.title) + '</span>' +
          '<span style="font-size:0.75rem;font-weight:800;color:var(--ok);">已熟背 ' + mastered + ' / 111 節</span>' +
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
        renderAll();
        document.getElementById('memGideonModal').hidden = true;
      });
    });
  }

  /* ---------- 抽屜渲染：777 經文總表搜尋 ---------- */
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
        renderAll();
        document.getElementById('memListModal').hidden = true;
      });
    });
  }

  /* ---------- 抽屜渲染：記憶統計與設定 ---------- */
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

    var enBtn = document.getElementById('memToggleEnBtn');
    var origBtn = document.getElementById('memToggleOrigBtn');
    var strongBtn = document.getElementById('memToggleStrongBtn');
    if (enBtn) enBtn.classList.toggle('active', state.showEn);
    if (origBtn) origBtn.classList.toggle('active', state.showOrig);
    if (strongBtn) strongBtn.classList.toggle('active', state.showStrong);

    var autoBtn = document.getElementById('memAutoPlayBtn');
    if (autoBtn) autoBtn.classList.toggle('active', state.autoPlay);
  }

  function escapeHtml(str) {
    return (str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function renderAll() {
    renderCategoryStrip();
    syncToolbarButtons();
    renderCard();
  }

  /* ---------- 事件綁定與全螢幕手勢 ---------- */
  function bindEvents() {
    // 模式切換
    document.querySelectorAll('#memModeRow .mem-mode-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        state.mode = btn.getAttribute('data-mode');
        quizState = null;
        saveState();
        syncToolbarButtons();
        renderCard();
      });
    });

    // 遮蔽比例切換
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

    // 隨機抽卡
    document.getElementById('memShuffleBtn').addEventListener('click', function () {
      if (deck.length <= 1) return;
      var nextIdx = Math.floor(Math.random() * deck.length);
      if (nextIdx === state.idx) nextIdx = (nextIdx + 1) % deck.length;
      state.idx = nextIdx;
      quizState = null;
      resetDictationBox();
      renderCard();
      showToast('🎲 已隨機抽題：' + deck[state.idx].ref);
    });

    // SRS 三鍵評分
    document.querySelectorAll('.mem-srs-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        recordSrs(btn.getAttribute('data-srs'));
      });
    });

    // 按住偷看全文 / 點擊切換偷看
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

    // 收藏重點經文
    document.getElementById('memStarBtn').addEventListener('click', function () {
      var v = deck[state.idx];
      if (!v) return;
      var r = getRecord(v.id);
      r.starred = !r.starred;
      state.records[v.id] = r;
      saveState();
      renderAll();
      showToast(r.starred ? ('⭐ 已加入重點背誦：' + v.ref) : '已取消重點收藏');
    });

    // 單節語音朗讀
    document.getElementById('memTtsBtn').addEventListener('click', function () {
      speakCurrentVerse(false);
    });

    // 連續循環伴讀模式
    document.getElementById('memAutoPlayBtn').addEventListener('click', function () {
      state.autoPlay = !state.autoPlay;
      syncToolbarButtons();
      if (state.autoPlay) {
        showToast('🎧 已開啟連續語音伴讀（每節讀 ' + state.audioRepeat + ' 次後自動下一節）');
        speakCurrentVerse(true);
      } else {
        stopSpeech();
        showToast('已停止連續語音伴讀');
      }
    });

    // 分享或複製經文卡
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
        document.documentElement.requestFullscreen().catch(function () {});
        document.body.classList.add('is-true-fullscreen');
      } else {
        document.exitFullscreen().catch(function () {});
        document.body.classList.remove('is-true-fullscreen');
      }
    });

    // 開關 3 大底部抽屜
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

    // 設定面板互動
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

    // 匯出與匯入備份
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
      showToast('📥 已匯出 777 背誦進度備份');
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
            showToast('📤 已成功還原背誦紀錄！');
          }
        } catch (err) {
          showToast('匯入失敗：JSON 格式不正確');
        }
      };
      reader.readAsText(file);
    });

    // 手機觸控左右滑動換卡手勢
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
        if (Math.abs(dx) > 58 && Math.abs(dx) > Math.abs(dy) * 1.4) {
          if (dx < 0) nextCard();
          else prevCard();
        }
      }, { passive: true });
    }

    // 鍵盤快捷鍵支援 (桌機與外接鍵盤)
    window.addEventListener('keydown', function (e) {
      if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
      if (e.key === 'ArrowLeft') { e.preventDefault(); prevCard(); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); nextCard(); }
      else if (e.key === '1') { e.preventDefault(); recordSrs('again'); }
      else if (e.key === '2') { e.preventDefault(); recordSrs('good'); }
      else if (e.key === '3') { e.preventDefault(); recordSrs('easy'); }
      else if (e.key === ' ') { e.preventDefault(); speakCurrentVerse(false); }
      else if (e.key === 's' || e.key === 'S') { e.preventDefault(); document.getElementById('memStarBtn').click(); }
      else if (e.key === 'f' || e.key === 'F') { e.preventDefault(); document.getElementById('memFullscreenBtn').click(); }
    });
  }

  /* ---------- 支援 URL Hash 指定分類或經節 (如 memory.html#cat=anxiety 或 #id=112) ---------- */
  function parseHash() {
    var h = (window.location.hash || '').replace(/^#/, '');
    if (!h) return;
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
    loadState();
    parseHash();
    applyAppearance();
    buildDeck();
    bindEvents();
    renderAll();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
