/**
 * Biblia 聖經挑戰與益智小遊戲核心引擎 (Biblia Challenge & Games Engine v2.0)
 * 深度優化設計：
 * 1. Web Speech API 語音朗讀系統 (自然中文語音朗讀題目、選項、答案與解析)
 * 2. 深度遊戲化 (Gamification) 體系：
 *    - 6 階屬靈天路客等級階梯與即時經驗條 (Level & XP Progress Bar)
 *    - 連勝連擊倍率機制 (Combo Multipliers: 1.2x ~ 2.0x XP)
 *    - 等級晉升榮耀祝賀 (Level-Up Fanfare & Confetti)
 *    - 12 款精美成就勳章
 * 3. 錯題複習專區 (Spaced Repetition Mistake Notebook)：
 *    - 錯誤時提供結構化學習解惑指引（❌ 您的作答、💡 易混淆辨析、🎯 關鍵記憶法）
 *    - 自動收錄錯題庫，支援專屬「錯題複習」重測，掌握後頒發訂正獎勵
 * 4. 五大單元內容增加 28% ~ 50%：
 *    - 猜聖經人名 (32 位)、猜聖經地名 (20 處)、經典經文填空 (24 節)
 *    - 聖經十字填字 (4 套原創字盤)、救贖年代排序 (4 組大進程)
 * 5. 全面支援「選擇題 4選1」與「打字/字磚填空題」即時無縫切換
 */

(function (window, document) {
  'use strict';

  // ========================================================
  // 1. Web Audio API 音效引擎 (零外部檔案依賴，優雅純淨)
  // ========================================================
  var SoundEngine = (function () {
    var ctx = null;
    var enabled = true;

    function getContext() {
      if (!ctx && (window.AudioContext || window.webkitAudioContext)) {
        try {
          ctx = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
          ctx = null;
        }
      }
      if (ctx && ctx.state === 'suspended') {
        ctx.resume().catch(function () {});
      }
      return ctx;
    }

    function init() {
      try {
        var saved = localStorage.getItem('biblia_challenge_sound');
        enabled = saved !== null ? saved === 'true' : true;
      } catch (e) {
        enabled = true;
      }
    }

    function isEnabled() {
      return enabled;
    }

    function toggle() {
      enabled = !enabled;
      try {
        localStorage.setItem('biblia_challenge_sound', String(enabled));
      } catch (e) {}
      if (enabled) {
        playTone(659.25, 'sine', 0.12, 0.1);
      }
      return enabled;
    }

    function playTone(freq, type, duration, gainVal, delay) {
      if (!enabled) return;
      var c = getContext();
      if (!c) return;

      var startTime = c.currentTime + (delay || 0);
      var osc = c.createOscillator();
      var gain = c.createGain();

      osc.type = type || 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.exponentialRampToValueAtTime(gainVal || 0.15, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

      osc.connect(gain);
      gain.connect(c.destination);

      osc.start(startTime);
      osc.stop(startTime + duration + 0.05);
    }

    function playCorrect() {
      if (!enabled) return;
      // 和弦三連音 (E5 -> G#5 -> B5 -> E6)
      playTone(659.25, 'triangle', 0.18, 0.18, 0);
      playTone(830.61, 'triangle', 0.20, 0.18, 0.08);
      playTone(987.77, 'triangle', 0.24, 0.20, 0.16);
      playTone(1318.51, 'sine', 0.35, 0.22, 0.24);
    }

    function playWrong() {
      if (!enabled) return;
      // 柔和雙音低鳴
      playTone(220.00, 'sine', 0.16, 0.15, 0);
      playTone(174.61, 'sine', 0.26, 0.14, 0.10);
    }

    function playStreak() {
      if (!enabled) return;
      // 連勝豎琴琶音
      var notes = [523.25, 659.25, 783.99, 1046.50, 1318.51];
      notes.forEach(function (f, idx) {
        playTone(f, 'sine', 0.22, 0.16, idx * 0.06);
      });
    }

    function playWin() {
      if (!enabled) return;
      // 榮耀大得勝號角
      playTone(523.25, 'triangle', 0.25, 0.20, 0);
      playTone(659.25, 'triangle', 0.25, 0.20, 0.12);
      playTone(783.99, 'triangle', 0.30, 0.22, 0.24);
      playTone(1046.50, 'sine', 0.55, 0.28, 0.38);
    }

    function playClick() {
      if (!enabled) return;
      playTone(880, 'sine', 0.04, 0.05, 0);
    }

    init();

    return {
      isEnabled: isEnabled,
      toggle: toggle,
      playCorrect: playCorrect,
      playWrong: playWrong,
      playStreak: playStreak,
      playWin: playWin,
      playClick: playClick
    };
  })();

  // ========================================================
  // 2. Web Speech API 語音朗讀引擎 (自然中文朗讀題目與答案)
  // ========================================================
  var SpeechEngine = (function () {
    var synth = window.speechSynthesis || null;
    var currentUtterance = null;
    var autoSpeechEnabled = false;
    var isSpeakingNow = false;

    function init() {
      try {
        var saved = localStorage.getItem('biblia_challenge_autospeech');
        autoSpeechEnabled = saved === 'true';
      } catch (e) {
        autoSpeechEnabled = false;
      }
    }

    function isSupported() {
      return synth !== null;
    }

    function isAutoSpeech() {
      return autoSpeechEnabled;
    }

    function toggleAutoSpeech() {
      autoSpeechEnabled = !autoSpeechEnabled;
      try {
        localStorage.setItem('biblia_challenge_autospeech', String(autoSpeechEnabled));
      } catch (e) {}
      return autoSpeechEnabled;
    }

    function stop() {
      if (synth) {
        try {
          synth.cancel();
        } catch (e) {}
      }
      isSpeakingNow = false;
      updateSpeechUI(false);
    }

    function getBestVoice() {
      if (!synth) return null;
      var voices = synth.getVoices() || [];
      // 優先尋找繁體中文 (zh-TW, zh-HK)，其次簡體中文 (zh-CN, zh)
      var twVoice = voices.find(function (v) { return v.lang === 'zh-TW' || v.lang === 'zh-HK'; });
      if (twVoice) return twVoice;
      var cnVoice = voices.find(function (v) { return v.lang && v.lang.indexOf('zh') === 0; });
      if (cnVoice) return cnVoice;
      return null;
    }

    function speak(text, onStart, onEnd) {
      if (!synth || !text) return;

      stop(); // 停止先前的朗讀

      var utter = new SpeechSynthesisUtterance(text);
      currentUtterance = utter;

      var voice = getBestVoice();
      if (voice) utter.voice = voice;

      utter.rate = 0.95; // 舒緩清晰的教學語速
      utter.pitch = 1.0;

      utter.onstart = function () {
        isSpeakingNow = true;
        updateSpeechUI(true);
        if (typeof onStart === 'function') onStart();
      };

      utter.onend = function () {
        isSpeakingNow = false;
        updateSpeechUI(false);
        if (typeof onEnd === 'function') onEnd();
      };

      utter.onerror = function () {
        isSpeakingNow = false;
        updateSpeechUI(false);
        if (typeof onEnd === 'function') onEnd();
      };

      // 觸發成就統計
      StateManager.recordAudioListen();

      synth.speak(utter);
    }

    function speakQuestion(q, currentTab) {
      if (!q) return;

      var speechText = '';
      if (currentTab === 'verse') {
        speechText = '經典經文填空。經文出處：' + q.ref + '。請聽經文：' + q.blankText.replace(/【____+】/g, '某某') + '。靈修提示：' + q.hint + '。';
      } else {
        var subject = (currentTab === 'char') ? '聖經人物' : '聖經地名';
        speechText = '請依循屬靈線索，猜猜看這是哪一個' + subject + '？';
        q.clues.forEach(function (c, idx) {
          speechText += '線索' + (idx + 1) + '：' + c + '。';
        });
      }

      speak(speechText);
    }

    function speakAnswer(q, userPick, isCorrect, currentTab) {
      if (!q) return;

      var targetName = q.name || q.answer;
      var speechText = '';

      if (isCorrect) {
        speechText = '恭喜您，完全答對！標準答案是：' + targetName + '。';
        var meaning = q.nameMeaning ? '原文字義：' + q.nameMeaning + '。' : '';
        var bio = q.bio || q.notes || q.meaning || '';
        speechText += meaning + bio;
        if (q.verseText) speechText += '相關聖經金句：' + q.verseText;
      } else {
        speechText = '這題答錯了。您的回答是：' + (userPick || '未填寫') + '。標準答案是：' + targetName + '。';
        if (q.mistakeExplanation) {
          speechText += '學習解惑指引：' + q.mistakeExplanation + '。';
        }
        var info = q.bio || q.notes || q.meaning || '';
        speechText += info;
      }

      speak(speechText);
    }

    function updateSpeechUI(speaking) {
      var speakBtns = document.querySelectorAll('.tts-speak-btn');
      speakBtns.forEach(function (btn) {
        btn.classList.toggle('speaking', speaking);
        if (btn.querySelector('.tts-text')) {
          btn.querySelector('.tts-text').textContent = speaking ? '停止朗讀 ⏹' : '語音念題 🔊';
        }
      });
    }

    init();

    return {
      isSupported: isSupported,
      isAutoSpeech: isAutoSpeech,
      toggleAutoSpeech: toggleAutoSpeech,
      speak: speak,
      stop: stop,
      speakQuestion: speakQuestion,
      speakAnswer: speakAnswer,
      isSpeaking: function () { return isSpeakingNow; }
    };
  })();

  // ========================================================
  // 3. Confetti 五彩碎紙歡慶特效 (HTML5 Canvas 粒子引擎)
  // ========================================================
  var ConfettiEngine = (function () {
    var canvas, ctx, particles = [], animationId = null;

    function init() {
      canvas = document.getElementById('confettiCanvas');
      if (!canvas) return;
      ctx = canvas.getContext('2d');
      resize();
      window.addEventListener('resize', resize);
    }

    function resize() {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    function fire(count) {
      if (!canvas || !ctx) init();
      if (!canvas || !ctx) return;
      resize();

      var colors = ['#8b5523', '#d49b38', '#2e6b49', '#c0382b', '#3b82f6', '#eab308', '#ec4899', '#10b981'];
      var total = count || 80;

      for (var i = 0; i < total; i++) {
        particles.push({
          x: canvas.width * 0.5 + (Math.random() - 0.5) * 200,
          y: canvas.height * 0.4 + (Math.random() - 0.5) * 100,
          w: Math.random() * 9 + 5,
          h: Math.random() * 6 + 4,
          color: colors[Math.floor(Math.random() * colors.length)],
          vx: (Math.random() - 0.5) * 14,
          vy: (Math.random() - 1.2) * 12 - 4,
          angle: Math.random() * 360,
          angleSpeed: (Math.random() - 0.5) * 10,
          opacity: 1,
          gravity: 0.28,
          drag: 0.96
        });
      }

      if (!animationId) {
        loop();
      }
    }

    function loop() {
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (var i = particles.length - 1; i >= 0; i--) {
        var p = particles[i];
        p.vx *= p.drag;
        p.vy *= p.drag;
        p.vy += p.gravity;
        p.x += p.vx;
        p.y += p.vy;
        p.angle += p.angleSpeed;
        p.opacity -= 0.012;

        if (p.opacity <= 0 || p.y > canvas.height + 20) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.angle * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, p.opacity);
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      }

      if (particles.length > 0) {
        animationId = requestAnimationFrame(loop);
      } else {
        cancelAnimationFrame(animationId);
        animationId = null;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }

    return {
      init: init,
      fire: fire
    };
  })();

  // ========================================================
  // 4. 等級與深層遊戲化管理 (Gamification & State Manager)
  // ========================================================
  var StateManager = (function () {
    var STORAGE_KEY = 'biblia_challenge_state_v2';

    // 6 大屬靈天路客階梯等級設定
    var LEVELS = [
      { level: 1, name: "🌿 聖經學徒", minXp: 0, maxXp: 300, desc: "初窺真道殿堂，如同新生嬰孩愛慕純淨的靈奶。" },
      { level: 2, name: "🌱 忠心門徒", minXp: 300, maxXp: 800, desc: "日日在神的話語中扎根生長，立志跟隨主的腳蹤行。" },
      { level: 3, name: "📜 經學學士", minXp: 800, maxXp: 1600, desc: "按著正意分解真理的道，心竅習練通達，能明辨是非。" },
      { level: 4, name: "🛡️ 屬靈勇士", minXp: 1600, maxXp: 3000, desc: "拿起聖靈的寶劍，就是神的道，在屬靈爭戰中剛強得勝。" },
      { level: 5, name: "👑 先知祭司", minXp: 3000, maxXp: 5000, desc: "胸懷聖約真理，體貼神的心腸，為時代呼求禱告守望。" },
      { level: 6, name: "🕊️ 神學宗師", minXp: 5000, maxXp: 999999, desc: "神的話豐豐富富藏在心裡，活出真理與愛的最高基督品格。" }
    ];

    var state = {
      score: 0,
      streak: 0,
      maxStreak: 0,
      totalAnswered: 0,
      totalCorrect: 0,
      charCorrect: 0,
      placeCorrect: 0,
      verseCorrect: 0,
      mistakesCorrected: 0,
      audioListenedCount: 0,
      crosswordsSolved: {},
      achievements: [],
      mistakes: [] // 錯題庫：[{ id, mode, q, userPick, failedAt }]
    };

    function load() {
      try {
        var raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          var parsed = JSON.parse(raw);
          if (parsed && typeof parsed === 'object') {
            state = Object.assign(state, parsed);
          }
        }
      } catch (e) {
        console.warn('Failed to load challenge state', e);
      }
      return state;
    }

    function save() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch (e) {}
    }

    function getCurrentLevelInfo() {
      var score = state.score;
      for (var i = LEVELS.length - 1; i >= 0; i--) {
        if (score >= LEVELS[i].minXp) {
          var cur = LEVELS[i];
          var next = LEVELS[i + 1] || null;
          var range = next ? (next.minXp - cur.minXp) : 1000;
          var currentProgress = next ? (score - cur.minXp) : range;
          var percent = Math.min(100, Math.max(0, Math.floor((currentProgress / range) * 100)));
          return {
            level: cur.level,
            name: cur.name,
            desc: cur.desc,
            currentXp: score,
            nextXp: next ? next.minXp : 'MAX',
            percent: percent
          };
        }
      }
      return { level: 1, name: LEVELS[0].name, desc: LEVELS[0].desc, currentXp: score, nextXp: 300, percent: 0 };
    }

    function getComboMultiplier() {
      if (state.streak >= 10) return 2.0;
      if (state.streak >= 5) return 1.5;
      if (state.streak >= 3) return 1.2;
      return 1.0;
    }

    function addScore(basePoints) {
      var prevLevel = getCurrentLevelInfo().level;
      var multiplier = getComboMultiplier();
      var earnedPoints = Math.round(basePoints * multiplier);

      state.score += earnedPoints;
      save();

      var newLevelInfo = getCurrentLevelInfo();
      if (newLevelInfo.level > prevLevel) {
        triggerLevelUp(newLevelInfo);
      }

      updateTopBarStats();
      checkAchievements();
      return earnedPoints;
    }

    function triggerLevelUp(levelInfo) {
      SoundEngine.playWin();
      ConfettiEngine.fire(100);

      var modal = document.getElementById('levelUpModal');
      var title = document.getElementById('levelUpTitle');
      var desc = document.getElementById('levelUpDesc');

      if (title) title.textContent = levelInfo.name + ' Lv.' + levelInfo.level;
      if (desc) desc.textContent = levelInfo.desc;
      if (modal) modal.hidden = false;
    }

    function recordAnswer(isCorrect, mode, q, userPick) {
      state.totalAnswered++;
      if (isCorrect) {
        state.totalCorrect++;
        state.streak++;
        if (state.streak > state.maxStreak) {
          state.maxStreak = state.streak;
        }
        if (mode === 'char') state.charCorrect++;
        if (mode === 'place') state.placeCorrect++;
        if (mode === 'verse') state.verseCorrect++;

        // 若此題在錯題本中，將其移除並累加訂正數
        removeMistake(q.id);
      } else {
        state.streak = 0;
        // 自動收錄至錯題複習專區
        addMistake(q, mode, userPick);
      }
      save();
      updateTopBarStats();
      checkAchievements();
    }

    function addMistake(q, mode, userPick) {
      if (!state.mistakes) state.mistakes = [];
      var existing = state.mistakes.find(function (m) { return m.id === q.id; });
      if (!existing) {
        state.mistakes.push({
          id: q.id,
          mode: mode,
          q: q,
          userPick: userPick,
          failedAt: Date.now()
        });
      } else {
        existing.userPick = userPick;
        existing.failedAt = Date.now();
      }
      save();
      updateMistakesBadge();
    }

    function removeMistake(qid) {
      if (!state.mistakes) return;
      var idx = state.mistakes.findIndex(function (m) { return m.id === qid; });
      if (idx !== -1) {
        state.mistakes.splice(idx, 1);
        state.mistakesCorrected++;
        save();
        updateMistakesBadge();
      }
    }

    function recordAudioListen() {
      state.audioListenedCount++;
      save();
      checkAchievements();
    }

    function recordCrosswordSolved(cwId) {
      if (!state.crosswordsSolved) state.crosswordsSolved = {};
      state.crosswordsSolved[cwId] = Date.now();
      save();
      updateTopBarStats();
      checkAchievements();
    }

    function checkAchievements() {
      var db = window.BIBLIA_CHALLENGE_DATA;
      if (!db || !db.achievements) return;

      var newUnlocked = [];

      db.achievements.forEach(function (ach) {
        if (state.achievements.indexOf(ach.id) !== -1) return;

        var unlock = false;
        if (ach.id === 'ach_first' && state.totalCorrect >= 1) unlock = true;
        if (ach.id === 'ach_streak5' && state.maxStreak >= 5) unlock = true;
        if (ach.id === 'ach_streak10' && state.maxStreak >= 10) unlock = true;
        if (ach.id === 'ach_char_master' && state.charCorrect >= 10) unlock = true;
        if (ach.id === 'ach_geo_master' && state.placeCorrect >= 10) unlock = true;
        if (ach.id === 'ach_verse_master' && state.verseCorrect >= 10) unlock = true;
        if (ach.id === 'ach_cw_solver' && Object.keys(state.crosswordsSolved || {}).length >= 1) unlock = true;
        if (ach.id === 'ach_score2000' && state.score >= 2000) unlock = true;
        if (ach.id === 'ach_mistake_fixer' && state.mistakesCorrected >= 3) unlock = true;
        if (ach.id === 'ach_audio_listener' && state.audioListenedCount >= 5) unlock = true;
        if (ach.id === 'ach_level_master' && getCurrentLevelInfo().level >= 3) unlock = true;
        if (ach.id === 'ach_crossword_all' && Object.keys(state.crosswordsSolved || {}).length >= 4) unlock = true;

        if (unlock) {
          state.achievements.push(ach.id);
          newUnlocked.push(ach);
        }
      });

      if (newUnlocked.length > 0) {
        save();
        newUnlocked.forEach(function (ach) {
          showAchievementNotification(ach);
        });
      }
    }

    function showAchievementNotification(ach) {
      var toast = document.createElement('div');
      toast.className = 'game-achievement-toast';
      toast.innerHTML = '<span class="ach-toast-icon">' + ach.icon + '</span>' +
        '<div class="ach-toast-body">' +
          '<div class="ach-toast-badge">榮譽成就解鎖！</div>' +
          '<div class="ach-toast-title">' + ach.title + '</div>' +
          '<div class="ach-toast-desc">' + ach.desc + '</div>' +
        '</div>';
      document.body.appendChild(toast);

      SoundEngine.playStreak();
      ConfettiEngine.fire(40);

      setTimeout(function () {
        toast.classList.add('visible');
      }, 50);

      setTimeout(function () {
        toast.classList.remove('visible');
        setTimeout(function () {
          if (toast.parentNode) toast.parentNode.removeChild(toast);
        }, 400);
      }, 4500);
    }

    function updateTopBarStats() {
      var scoreEl = document.getElementById('topScoreBadge');
      var streakEl = document.getElementById('topStreakBadge');
      var comboEl = document.getElementById('topComboBadge');
      var levelBadge = document.getElementById('topLevelBadge');
      var xpFill = document.getElementById('topXpFill');
      var xpText = document.getElementById('topXpText');

      if (scoreEl) scoreEl.textContent = state.score + ' XP';
      if (streakEl) streakEl.textContent = '🔥 ' + state.streak;

      // 連擊倍率
      var mult = getComboMultiplier();
      if (comboEl) {
        if (mult > 1.0) {
          comboEl.hidden = false;
          comboEl.textContent = '⚡ ' + mult + 'x 加乘';
        } else {
          comboEl.hidden = true;
        }
      }

      // 等級與經驗條
      var lvl = getCurrentLevelInfo();
      if (levelBadge) levelBadge.textContent = lvl.name;
      if (xpFill) xpFill.style.width = lvl.percent + '%';
      if (xpText) xpText.textContent = state.score + ' / ' + lvl.nextXp + ' XP';

      updateMistakesBadge();
    }

    function updateMistakesBadge() {
      var badge = document.getElementById('mistakesCountBadge');
      if (badge) {
        var count = (state.mistakes || []).length;
        badge.textContent = count;
        badge.hidden = (count === 0);
      }
    }

    return {
      load: load,
      get: function () { return state; },
      addScore: addScore,
      getComboMultiplier: getComboMultiplier,
      recordAnswer: recordAnswer,
      recordAudioListen: recordAudioListen,
      recordCrosswordSolved: recordCrosswordSolved,
      getCurrentLevelInfo: getCurrentLevelInfo,
      updateTopBarStats: updateTopBarStats,
      getMistakes: function () { return state.mistakes || []; }
    };
  })();

  // ========================================================
  // 5. 主遊戲控制器 (Main Challenge Controller)
  // ========================================================
  var ChallengeApp = (function () {
    var currentTab = 'char'; // 'char' | 'place' | 'verse' | 'crossword' | 'timeline' | 'mistakes'
    var inputMode = 'choice'; // 'choice' (選擇題) | 'fill' (填空題)
    var currentQuestion = null;
    var questionIndex = 0;
    var questionPool = [];
    var isAnswered = false;
    var activeCrossword = null;
    var cwSelectedCell = null;
    var cwDirection = 'across';

    // DOM Elements
    var elements = {};

    function init() {
      cacheElements();
      bindEvents();
      StateManager.load();
      StateManager.updateTopBarStats();
      ConfettiEngine.init();

      // Read hash to direct to specific game mode
      var hash = window.location.hash.replace('#', '');
      if (['char', 'place', 'verse', 'crossword', 'timeline', 'mistakes'].indexOf(hash) !== -1) {
        switchTab(hash);
      } else {
        switchTab('char');
      }

      // Check URL parameters
      var params = new URLSearchParams(window.location.search);
      if (params.get('type') === 'fill') {
        setInputMode('fill');
      } else {
        setInputMode('choice');
      }
    }

    function cacheElements() {
      elements.navTabs = document.querySelectorAll('.game-nav-tab');
      elements.views = {
        char: document.getElementById('viewCharacters'),
        place: document.getElementById('viewPlaces'),
        verse: document.getElementById('viewVerses'),
        crossword: document.getElementById('viewCrossword'),
        timeline: document.getElementById('viewTimeline'),
        mistakes: document.getElementById('viewMistakes')
      };
      elements.soundToggleBtn = document.getElementById('soundToggleBtn');
      elements.speechToggleBtn = document.getElementById('speechToggleBtn');
      elements.themeToggleBtn = document.getElementById('themeToggleBtn');
      elements.btnAchievements = document.getElementById('btnAchievements');
      elements.achievementsModal = document.getElementById('achievementsModal');
      elements.achievementsCloseBtn = document.getElementById('achievementsCloseBtn');
      elements.levelUpModal = document.getElementById('levelUpModal');
      elements.levelUpConfirmBtn = document.getElementById('levelUpConfirmBtn');
    }

    function bindEvents() {
      // 標籤頁切換
      elements.navTabs.forEach(function (tab) {
        tab.addEventListener('click', function () {
          var targetTab = this.getAttribute('data-tab');
          SoundEngine.playClick();
          SpeechEngine.stop();
          switchTab(targetTab);
        });
      });

      // 音效切換
      if (elements.soundToggleBtn) {
        elements.soundToggleBtn.addEventListener('click', function () {
          var on = SoundEngine.toggle();
          this.innerHTML = on ? '<span>🔊</span>' : '<span>🔇</span>';
          this.setAttribute('title', on ? '靜音' : '開啟音效');
        });
      }

      // 語音自動朗讀切換
      if (elements.speechToggleBtn) {
        elements.speechToggleBtn.addEventListener('click', function () {
          var on = SpeechEngine.toggleAutoSpeech();
          var icon = document.getElementById('speechIcon');
          var text = document.getElementById('speechStateText');
          if (icon) icon.textContent = on ? '🗣️' : '🎙️';
          if (text) text.textContent = on ? '自讀:開' : '語音';
          SoundEngine.playClick();
        });
      }

      // 主題切換
      if (elements.themeToggleBtn) {
        elements.themeToggleBtn.addEventListener('click', function () {
          cycleTheme();
        });
      }

      // 成就清單視窗
      if (elements.btnAchievements) {
        elements.btnAchievements.addEventListener('click', function () {
          openAchievementsModal();
        });
      }
      if (elements.achievementsCloseBtn) {
        elements.achievementsCloseBtn.addEventListener('click', function () {
          closeAchievementsModal();
        });
      }

      // 升級視窗確認按鈕
      if (elements.levelUpConfirmBtn) {
        elements.levelUpConfirmBtn.addEventListener('click', function () {
          if (elements.levelUpModal) elements.levelUpModal.hidden = true;
          SoundEngine.playClick();
        });
      }

      // 監聽鍵盤快捷鍵 (1,2,3,4 作答，Enter 送出，Space 下一題)
      window.addEventListener('keydown', handleGlobalKeydown);
    }

    function cycleTheme() {
      var themes = ['light', 'sepia', 'matcha', 'dark', 'oled'];
      var curTheme = 'light';
      for (var i = 0; i < themes.length; i++) {
        if (document.documentElement.classList.contains(themes[i])) {
          curTheme = themes[i];
          break;
        }
      }
      var nextIdx = (themes.indexOf(curTheme) + 1) % themes.length;
      var nextTheme = themes[nextIdx];

      themes.forEach(function (t) {
        document.documentElement.classList.remove(t);
        document.body.classList.remove(t);
      });
      document.documentElement.classList.add(nextTheme);
      document.body.classList.add(nextTheme);

      try {
        var s = JSON.parse(localStorage.getItem('biblia') || '{}');
        s.theme = nextTheme;
        s.dark = (nextTheme === 'dark' || nextTheme === 'oled');
        localStorage.setItem('biblia', JSON.stringify(s));
      } catch (e) {}

      SoundEngine.playClick();
    }

    function switchTab(tabId) {
      currentTab = tabId;
      window.location.hash = tabId;

      elements.navTabs.forEach(function (tab) {
        var active = tab.getAttribute('data-tab') === tabId;
        tab.classList.toggle('active', active);
        tab.setAttribute('aria-selected', active ? 'true' : 'false');
      });

      Object.keys(elements.views).forEach(function (key) {
        var view = elements.views[key];
        if (view) {
          view.hidden = (key !== tabId);
        }
      });

      // 初始化當前模式
      if (tabId === 'char') {
        initQuizMode('char');
      } else if (tabId === 'place') {
        initQuizMode('place');
      } else if (tabId === 'verse') {
        initQuizMode('verse');
      } else if (tabId === 'crossword') {
        initCrosswordMode();
      } else if (tabId === 'timeline') {
        initTimelineMode();
      } else if (tabId === 'mistakes') {
        initMistakesMode();
      }
    }

    // ========================================================
    // 6. 選擇題與填空題雙模式問答引擎 (Quiz Mode: Char / Place / Verse)
    // ========================================================
    function initQuizMode(mode) {
      var db = window.BIBLIA_CHALLENGE_DATA;
      if (!db) return;

      var rawList = [];
      if (mode === 'char') rawList = db.characters || [];
      else if (mode === 'place') rawList = db.places || [];
      else if (mode === 'verse') rawList = db.verses || [];

      // 隨機打亂題目池
      questionPool = rawList.slice().sort(function () { return 0.5 - Math.random(); });
      questionIndex = 0;
      loadNextQuestion();
    }

    function initMistakesMode() {
      var container = document.getElementById('mistakesQuizContainer');
      if (!container) return;

      var mistakes = StateManager.getMistakes();
      if (mistakes.length === 0) {
        renderEmptyMistakes(container);
        return;
      }

      // 將錯題池載入
      questionPool = mistakes.map(function (m) { return m.q; });
      questionIndex = 0;
      loadNextQuestion();
    }

    function renderEmptyMistakes(container) {
      var html = '<div class="quiz-card" style="text-align:center; padding: 48px 24px;">';
      html += '  <div style="font-size:3.5rem; margin-bottom: 12px;">🌟</div>';
      html += '  <h3 style="font-size:1.35rem; font-weight:800; color:var(--ok); margin:0 0 8px;">太棒了！目前沒有任何待複習錯題！</h3>';
      html += '  <p style="font-size:0.92rem; color:var(--fg-dim); line-height:1.6; max-width:440px; margin:0 auto 24px;">';
      html += '    在做題過程中遇到任何答錯的題目，系統都會以科學的記憶法自動收錄到這裡，供您反覆練習直到徹底掌握！';
      html += '  </p>';
      html += '  <div style="display:flex; justify-content:center; gap:10px;">';
      html += '    <button type="button" class="btn btn-primary" onclick="window.location.hash=\'char\'; location.reload();">前往猜人名挑戰 →</button>';
      html += '    <button type="button" class="btn btn-ghost" onclick="window.location.hash=\'verse\'; location.reload();">經文填空挑戰 ↗</button>';
      html += '  </div>';
      html += '</div>';
      container.innerHTML = html;
    }

    function loadNextQuestion() {
      if (questionPool.length === 0) {
        if (currentTab === 'mistakes') {
          var container = document.getElementById('mistakesQuizContainer');
          if (container) renderEmptyMistakes(container);
        }
        return;
      }
      if (questionIndex >= questionPool.length) {
        questionIndex = 0; // 循環題庫
      }
      currentQuestion = questionPool[questionIndex];
      isAnswered = false;
      renderQuestionCard();

      // 如果開啟了自動語音朗讀，自動念出題目
      if (SpeechEngine.isAutoSpeech()) {
        setTimeout(function () {
          SpeechEngine.speakQuestion(currentQuestion, currentTab);
        }, 300);
      }
    }

    function setInputMode(mode) {
      inputMode = mode; // 'choice' or 'fill'
      if (currentQuestion && !isAnswered) {
        renderQuestionCard();
      }
    }

    function renderQuestionCard() {
      var container = null;
      if (currentTab === 'char') container = document.getElementById('charQuizContainer');
      else if (currentTab === 'place') container = document.getElementById('placeQuizContainer');
      else if (currentTab === 'verse') container = document.getElementById('verseQuizContainer');
      else if (currentTab === 'mistakes') container = document.getElementById('mistakesQuizContainer');

      if (!container || !currentQuestion) return;

      var q = currentQuestion;
      var qNumberText = '第 ' + (questionIndex + 1) + ' / ' + questionPool.length + ' 題';
      var categoryTag = q.category || q.region || q.ref || '聖經挑戰';
      if (currentTab === 'mistakes') categoryTag = '📝 錯題訂正專用';

      var html = '';
      html += '<div class="quiz-card">';
      
      // 卡片頂部欄：題號、分類、語音念題按鈕、以及「選擇 / 填空 切換鈕」
      html += '<div class="quiz-card-head">';
      html += '  <div class="quiz-meta-info">';
      html += '    <span class="quiz-pill-badge">' + qNumberText + '</span>';
      html += '    <span class="quiz-cat-badge">' + categoryTag + '</span>';
      html += '    <button type="button" class="tts-speak-btn" id="ttsSpeakQuestionBtn" title="語音念出題目">';
      html += '      <span>🔊</span> <span class="tts-text">語音念題</span>';
      html += '    </button>';
      html += '  </div>';
      
      // 核心需求：切換開關 (Choice vs Fill-in)
      html += '  <div class="quiz-mode-switch" role="group" aria-label="切換作答方式">';
      html += '    <button type="button" class="mode-switch-btn ' + (inputMode === 'choice' ? 'active' : '') + '" data-mode="choice">選擇題 (4選1)</button>';
      html += '    <button type="button" class="mode-switch-btn ' + (inputMode === 'fill' ? 'active' : '') + '" data-mode="fill">填空題 (拼字/打字)</button>';
      html += '  </div>';
      html += '</div>';

      // 題目主體：經文填空 VS 人名/地名線索
      if (currentTab === 'verse' || (currentTab === 'mistakes' && q.blankText)) {
        html += '<div class="quiz-prompt-box verse-prompt-box">';
        html += '  <div class="verse-ref-title">📖 ' + q.ref + '</div>';
        html += '  <div class="verse-cloze-text">' + q.blankText + '</div>';
        html += '  <div class="quiz-clue-hint">💡 靈修提示：' + q.hint + '</div>';
        html += '</div>';
      } else {
        // 人名或地名：漸進線索清單
        var promptDesc = (q.category && q.category.indexOf('地') !== -1) ? '哪一個聖經地名' : '哪一位聖經人物';
        html += '<div class="quiz-prompt-box">';
        html += '  <div class="clue-list-heading">🔎 請依循以下屬靈線索，猜猜看這是' + promptDesc + '？</div>';
        html += '  <ol class="clues-ordered-list">';
        q.clues.forEach(function (clue, idx) {
          html += '    <li class="clue-item"><span class="clue-num">' + (idx + 1) + '</span><span class="clue-content">' + clue + '</span></li>';
        });
        html += '  </ol>';
        html += '</div>';
      }

      // 作答區域：根據 inputMode 渲染選擇題按鈕或填空輸入框
      html += '<div class="quiz-interactive-zone" id="quizInteractiveZone">';
      if (inputMode === 'choice') {
        html += renderChoiceOptions(q);
      } else {
        html += renderFillInInputs(q);
      }
      html += '</div>';

      // 回饋與小百科區域 (預設隱藏，答題後展開)
      html += '<div class="quiz-result-feedback" id="quizFeedbackBox" hidden></div>';

      html += '</div>'; // End .quiz-card

      container.innerHTML = html;

      // 綁定動態事件
      bindQuizCardEvents(container, q);
    }

    function renderChoiceOptions(q) {
      var html = '<div class="quiz-options-grid">';
      var opts = q.options.slice();
      // 確保答案在選項中並打亂
      opts.sort(function () { return 0.5 - Math.random(); });

      opts.forEach(function (opt, idx) {
        var label = ['A', 'B', 'C', 'D'][idx] || '';
        html += '<button type="button" class="quiz-opt-btn" data-answer="' + opt + '">';
        html += '  <span class="opt-label">' + label + '</span>';
        html += '  <span class="opt-text">' + opt + '</span>';
        html += '</button>';
      });
      html += '</div>';
      return html;
    }

    function renderFillInInputs(q) {
      var targetAnswer = q.name || q.answer;
      var len = targetAnswer.length;

      var html = '<div class="fill-in-container">';
      html += '  <div class="fill-input-row">';
      html += '    <input type="text" id="fillTextInput" class="fill-text-input" placeholder="請在此輸入答案（共 ' + len + ' 個字）..." autocomplete="off" spellcheck="false" maxlength="20">';
      html += '    <button type="button" id="fillSubmitBtn" class="btn btn-primary fill-submit-btn">送出答案 ↵</button>';
      html += '  </div>';

      // 提示與清空小按鈕
      html += '  <div class="fill-tools-row">';
      html += '    <button type="button" class="fill-tool-chip" id="fillHintCharBtn">💡 提示首字</button>';
      html += '    <button type="button" class="fill-tool-chip" id="fillBackspaceBtn">⌫ 退格</button>';
      html += '    <button type="button" class="fill-tool-chip" id="fillClearBtn">✕ 清空</button>';
      html += '  </div>';

      // 字磚快選區 (Character Bank: 特別適合手機觸控與長輩點按)
      html += '  <div class="fill-char-bank-title">點按字磚快速輸入：</div>';
      html += '  <div class="fill-char-bank" id="fillCharBank">';

      // 生成混淆字元集
      var bankChars = targetAnswer.split('');
      var distractorPool = ['亞', '以', '利', '撒', '大', '衛', '摩', '西', '約', '書', '各', '他', '伯', '恆', '神', '愛', '恩', '典', '光', '道', '靈', '拿', '但', '保', '羅', '彼', '得', '示', '劍', '心', '信', '望'];
      while (bankChars.length < 12) {
        var rChar = distractorPool[Math.floor(Math.random() * distractorPool.length)];
        if (bankChars.indexOf(rChar) === -1) {
          bankChars.push(rChar);
        }
      }
      bankChars.sort(function () { return 0.5 - Math.random(); });

      bankChars.forEach(function (ch) {
        html += '    <button type="button" class="char-tile-btn" data-char="' + ch + '">' + ch + '</button>';
      });
      html += '  </div>';

      html += '</div>';
      return html;
    }

    function bindQuizCardEvents(container, q) {
      // 語音朗讀題目
      var speakBtn = container.querySelector('#ttsSpeakQuestionBtn');
      if (speakBtn) {
        speakBtn.addEventListener('click', function () {
          if (SpeechEngine.isSpeaking()) {
            SpeechEngine.stop();
          } else {
            SpeechEngine.speakQuestion(q, currentTab);
          }
        });
      }

      // 模式切換按鈕
      var switchBtns = container.querySelectorAll('.mode-switch-btn');
      switchBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
          var targetMode = this.getAttribute('data-mode');
          SoundEngine.playClick();
          setInputMode(targetMode);
        });
      });

      // 選擇題選項點擊
      var optBtns = container.querySelectorAll('.quiz-opt-btn');
      optBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
          if (isAnswered) return;
          var selected = this.getAttribute('data-answer');
          evaluateAnswer(selected, q, this);
        });
      });

      // 填空題輸入與送出
      var fillInput = container.querySelector('#fillTextInput');
      var submitBtn = container.querySelector('#fillSubmitBtn');
      if (submitBtn && fillInput) {
        submitBtn.addEventListener('click', function () {
          if (isAnswered) return;
          var val = fillInput.value.trim();
          if (!val) {
            fillInput.focus();
            return;
          }
          evaluateAnswer(val, q, null);
        });

        fillInput.addEventListener('keydown', function (e) {
          if (e.key === 'Enter') {
            e.preventDefault();
            submitBtn.click();
          }
        });
      }

      // 字磚點按
      var charTiles = container.querySelectorAll('.char-tile-btn');
      charTiles.forEach(function (tile) {
        tile.addEventListener('click', function () {
          if (isAnswered || !fillInput) return;
          SoundEngine.playClick();
          fillInput.value += this.getAttribute('data-char');
          fillInput.focus();
        });
      });

      // 退格與清空
      var backspaceBtn = container.querySelector('#fillBackspaceBtn');
      if (backspaceBtn && fillInput) {
        backspaceBtn.addEventListener('click', function () {
          SoundEngine.playClick();
          fillInput.value = fillInput.value.slice(0, -1);
          fillInput.focus();
        });
      }

      var clearBtn = container.querySelector('#fillClearBtn');
      if (clearBtn && fillInput) {
        clearBtn.addEventListener('click', function () {
          SoundEngine.playClick();
          fillInput.value = '';
          fillInput.focus();
        });
      }

      // 提示首字
      var hintCharBtn = container.querySelector('#fillHintCharBtn');
      if (hintCharBtn && fillInput) {
        hintCharBtn.addEventListener('click', function () {
          var target = q.name || q.answer;
          if (target && target.length > 0) {
            SoundEngine.playClick();
            if (fillInput.value.indexOf(target[0]) !== 0) {
              fillInput.value = target[0];
            }
            fillInput.focus();
          }
        });
      }
    }

    function evaluateAnswer(userVal, q, clickedBtn) {
      if (isAnswered) return;
      isAnswered = true;

      var targetAnswer = (q.name || q.answer).trim();
      var cleanUser = userVal.trim().replace(/\s+/g, '');
      var cleanTarget = targetAnswer.replace(/\s+/g, '');

      // 判斷正確與否 (支援別名與同義詞)
      var isCorrect = (cleanUser === cleanTarget);
      if (!isCorrect && q.aliases && q.aliases.length > 0) {
        q.aliases.forEach(function (alias) {
          if (cleanUser === alias.replace(/\s+/g, '')) {
            isCorrect = true;
          }
        });
      }

      // 選擇題樣式反饋
      if (clickedBtn) {
        if (isCorrect) {
          clickedBtn.classList.add('correct');
        } else {
          clickedBtn.classList.add('wrong');
        }
      }

      // 同時將所有選項標記出正確答案
      var allOpts = document.querySelectorAll('.quiz-opt-btn');
      allOpts.forEach(function (b) {
        var optVal = b.getAttribute('data-answer');
        if (optVal === targetAnswer) {
          b.classList.add('correct');
        }
      });

      // 狀態統計與積分
      var earnedPoints = 0;
      if (isCorrect) {
        SoundEngine.playCorrect();
        StateManager.recordAnswer(true, currentTab, q, userVal);
        earnedPoints = StateManager.addScore(currentTab === 'mistakes' ? 120 : 100);

        if (StateManager.get().streak >= 3) {
          ConfettiEngine.fire(40);
        }
      } else {
        SoundEngine.playWrong();
        StateManager.recordAnswer(false, currentTab, q, userVal);
      }

      // 展開詳細屬靈小百科與解析卡片（包含錯誤時的學習解說）
      renderFeedbackCard(isCorrect, q, userVal, earnedPoints);

      // 自動語音朗讀解答與解析
      if (SpeechEngine.isAutoSpeech()) {
        setTimeout(function () {
          SpeechEngine.speakAnswer(q, userVal, isCorrect, currentTab);
        }, 500);
      }
    }

    function renderFeedbackCard(isCorrect, q, userVal, earnedPoints) {
      var box = document.getElementById('quizFeedbackBox');
      if (!box) return;

      var mult = StateManager.getComboMultiplier();
      var comboBonusText = mult > 1.0 ? ' (含 ' + mult + 'x 連擊加乘)' : '';
      var title = isCorrect ? 
        ('🎉 太棒了，完全答對！(+' + earnedPoints + ' XP' + comboBonusText + ')') : 
        '💡 差了一點點，仔細研讀解惑指引！';

      var state = StateManager.get();
      var streakText = state.streak > 1 ? ' · 🔥 ' + state.streak + ' 連勝！' : '';

      var html = '';
      html += '<div class="feedback-card ' + (isCorrect ? 'fb-correct' : 'fb-wrong') + '">';
      
      // 回饋標題列 + 語音朗讀解析按鈕
      html += '  <div class="fb-header" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">';
      html += '    <span class="fb-title">' + title + streakText + '</span>';
      html += '    <button type="button" class="tts-speak-btn" id="ttsSpeakAnswerBtn">';
      html += '      <span>🔊</span> 朗讀答案與解說';
      html += '    </button>';
      html += '  </div>';

      // 核心需求：錯誤時的結構化學習解說指引 (Mistake Clarification Guide)
      if (!isCorrect) {
        html += '  <div class="mistake-clarify-box">';
        html += '    <div class="mistake-clarify-title"><span>❌</span> 您的作答：<strong>「' + (userVal || '未填寫') + '」</strong></div>';
        if (q.mistakeExplanation) {
          html += '    <div class="mistake-clarify-content"><strong>💡 易混淆辨析：</strong>' + q.mistakeExplanation + '</div>';
        } else {
          html += '    <div class="mistake-clarify-content"><strong>💡 學習指引：</strong>請特別留意題目線索中的原文字義、歷史分期與關鍵神蹟，區隔同時代其他人物或事件。</div>';
        }
        html += '    <div class="memory-hook-box">';
        html += '      <div class="memory-hook-title">🎯 正確關鍵記憶點：</div>';
        html += '      <div>本題正解為<strong>【' + (q.name || q.answer) + '】</strong>。此題已自動收錄至「📝 錯題複習庫」，可隨時反覆重測直到掌握！</div>';
        html += '    </div>';
        html += '  </div>';
      }

      // 答案與釋義
      var targetName = q.name || q.answer;
      html += '  <div class="fb-body">';
      html += '    <div class="fb-target-row">';
      html += '      <span class="fb-label">標準答案：</span>';
      html += '      <strong class="fb-target-name">' + targetName + '</strong>';
      if (q.nameMeaning) {
        html += '      <span class="fb-name-meaning">（' + q.nameMeaning + '）</span>';
      }
      html += '    </div>';

      if (q.era) {
        html += '    <div class="fb-info-row"><span class="fb-label">歷史時代：</span>' + q.era + '</div>';
      }
      if (q.region) {
        html += '    <div class="fb-info-row"><span class="fb-label">地理位置：</span>' + q.region + '</div>';
      }

      // 詳細敘述或屬靈信息
      var descText = q.bio || q.notes || q.meaning || '';
      if (descText) {
        html += '    <p class="fb-desc-text">' + descText + '</p>';
      }

      // 相關經文金句
      if (q.verseRef && q.verseText) {
        html += '    <div class="fb-verse-box">';
        html += '      <div class="fb-verse-ref">📜 ' + q.verseRef + '</div>';
        html += '      <div class="fb-verse-text">「' + q.verseText + '」</div>';
        html += '    </div>';
      } else if (q.fullText) {
        html += '    <div class="fb-verse-box">';
        html += '      <div class="fb-verse-ref">📜 ' + q.ref + '</div>';
        html += '      <div class="fb-verse-text">「' + q.fullText + '」</div>';
        html += '    </div>';
      }

      html += '  </div>';

      // 底部動作按鈕：Biblia 經文閱讀跳轉 + 下一題
      html += '  <div class="fb-actions-row">';
      if (q.bookNo && q.chap) {
        html += '    <a href="index.html#book=' + q.bookNo + '&chap=' + q.chap + '" target="_blank" rel="noopener" class="btn btn-sm btn-ghost fb-read-link">';
        html += '      <span>📖 在 Biblia 中研讀經文 ↗</span>';
        html += '    </a>';
      }
      html += '    <button type="button" id="nextQuestionBtn" class="btn btn-primary fb-next-btn">下一題 →</button>';
      html += '  </div>';

      html += '</div>';

      box.innerHTML = html;
      box.hidden = false;

      // 語音朗讀答案與解說事件
      var speakAnsBtn = box.querySelector('#ttsSpeakAnswerBtn');
      if (speakAnsBtn) {
        speakAnsBtn.addEventListener('click', function () {
          if (SpeechEngine.isSpeaking()) {
            SpeechEngine.stop();
          } else {
            SpeechEngine.speakAnswer(q, userVal, isCorrect, currentTab);
          }
        });
      }

      // 下一題按鈕事件
      var nextBtn = box.querySelector('#nextQuestionBtn');
      if (nextBtn) {
        nextBtn.focus();
        nextBtn.addEventListener('click', function () {
          SoundEngine.playClick();
          SpeechEngine.stop();
          questionIndex++;
          loadNextQuestion();
        });
      }
    }

    function handleGlobalKeydown(e) {
      if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) {
        return;
      }

      // 1, 2, 3, 4 選擇題快捷作答
      if (inputMode === 'choice' && !isAnswered && ['1', '2', '3', '4'].indexOf(e.key) !== -1) {
        var idx = parseInt(e.key, 10) - 1;
        var optBtns = document.querySelectorAll('.quiz-opt-btn');
        if (optBtns[idx]) {
          optBtns[idx].click();
        }
      }

      // Space 或 Enter 下一題
      if (isAnswered && (e.key === ' ' || e.key === 'Enter')) {
        var nextBtn = document.getElementById('nextQuestionBtn');
        if (nextBtn) {
          e.preventDefault();
          nextBtn.click();
        }
      }
    }

    // ========================================================
    // 7. 聖經十字填字遊戲引擎 (Crossword Puzzle Engine)
    // ========================================================
    function initCrosswordMode() {
      var db = window.BIBLIA_CHALLENGE_DATA;
      if (!db || !db.crosswords || db.crosswords.length === 0) return;

      var container = document.getElementById('crosswordAppContainer');
      if (!container) return;

      if (!activeCrossword) {
        activeCrossword = db.crosswords[0];
      }

      renderCrosswordUI(container);
    }

    function renderCrosswordUI(container) {
      var cw = activeCrossword;
      var db = window.BIBLIA_CHALLENGE_DATA;

      var html = '';
      html += '<div class="cw-app-shell">';
      
      // 關卡切換下拉
      html += '  <div class="cw-header-bar">';
      html += '    <div class="cw-title-group">';
      html += '      <h3 class="cw-title">🧩 ' + cw.title + '</h3>';
      html += '      <span class="cw-desc">' + cw.desc + '</span>';
      html += '    </div>';
      html += '    <div class="cw-level-selector">';
      html += '      <select id="cwLevelSelect" class="cw-level-select" aria-label="選擇填字遊戲關卡">';
      db.crosswords.forEach(function (level, idx) {
        var sel = (level.id === cw.id) ? 'selected' : '';
        html += '        <option value="' + level.id + '" ' + sel + '>關卡 ' + (idx + 1) + '：' + level.title + '</option>';
      });
      html += '      </select>';
      html += '    </div>';
      html += '  </div>';

      // 填字工具列
      html += '  <div class="cw-tools-bar">';
      html += '    <button type="button" class="cw-tool-btn" id="cwHintCellBtn">💡 提示目前格子</button>';
      html += '    <button type="button" class="cw-tool-btn" id="cwCheckBtn">🔍 檢查盤面</button>';
      html += '    <button type="button" class="cw-tool-btn" id="cwResetBtn">🔄 重置字盤</button>';
      html += '    <button type="button" class="cw-tool-btn btn-ghost" id="cwSolveBtn">揭曉解答</button>';
      html += '  </div>';

      // 主版面：網格與線索
      html += '  <div class="cw-layout-body">';
      
      html += '    <div class="cw-grid-wrap">';
      html += renderCrosswordGrid(cw);
      html += '    </div>';

      html += '    <div class="cw-clues-wrap">';
      html += '      <div class="cw-clues-column">';
      html += '        <h4 class="cw-clue-heading">橫向提示 (Across)</h4>';
      html += '        <ul class="cw-clue-list" id="cwAcrossCluesList">';
      cw.clues.across.forEach(function (c) {
        html += '          <li class="cw-clue-item" data-num="' + c.num + '" data-dir="across" data-r="' + c.r + '" data-c="' + c.c + '">';
        html += '            <span class="cw-clue-badge">' + c.num + '</span>';
        html += '            <span class="cw-clue-text">' + c.clue + ' (' + c.len + '字)</span>';
        html += '          </li>';
      });
      html += '        </ul>';
      html += '      </div>';

      html += '      <div class="cw-clues-column">';
      html += '        <h4 class="cw-clue-heading">縱向提示 (Down)</h4>';
      html += '        <ul class="cw-clue-list" id="cwDownCluesList">';
      cw.clues.down.forEach(function (c) {
        html += '          <li class="cw-clue-item" data-num="' + c.num + '" data-dir="down" data-r="' + c.r + '" data-c="' + c.c + '">';
        html += '            <span class="cw-clue-badge">' + c.num + '</span>';
        html += '            <span class="cw-clue-text">' + c.clue + ' (' + c.len + '字)</span>';
        html += '          </li>';
      });
      html += '        </ul>';
      html += '      </div>';
      html += '    </div>';

      html += '  </div>';
      html += '</div>';

      container.innerHTML = html;

      bindCrosswordEvents(container, cw);
    }

    function renderCrosswordGrid(cw) {
      var size = cw.size || 7;
      var gridMap = {};
      cw.grid.forEach(function (cell) {
        gridMap[cell.r + '_' + cell.c] = cell;
      });

      var html = '<div class="cw-board-grid" style="grid-template-columns: repeat(' + size + ', 1fr);">';
      for (var r = 0; r < size; r++) {
        for (var c = 0; c < size; c++) {
          var cell = gridMap[r + '_' + c];
          if (cell && cell.char) {
            var numHtml = cell.num ? '<span class="cell-num">' + cell.num + '</span>' : '';
            html += '<div class="cw-cell cw-active-cell" data-r="' + r + '" data-c="' + c + '" data-ans="' + cell.char + '">';
            html += numHtml;
            html += '<span class="cell-letter" id="cwCell_' + r + '_' + c + '"></span>';
            html += '</div>';
          } else {
            html += '<div class="cw-cell cw-block-cell" data-r="' + r + '" data-c="' + c + '"></div>';
          }
        }
      }
      html += '</div>';
      return html;
    }

    function bindCrosswordEvents(container, cw) {
      var levelSelect = container.querySelector('#cwLevelSelect');
      if (levelSelect) {
        levelSelect.addEventListener('change', function () {
          var db = window.BIBLIA_CHALLENGE_DATA;
          var selectedId = this.value;
          var found = db.crosswords.find(function (x) { return x.id === selectedId; });
          if (found) {
            activeCrossword = found;
            SoundEngine.playClick();
            initCrosswordMode();
          }
        });
      }

      var cells = container.querySelectorAll('.cw-active-cell');
      cells.forEach(function (cell) {
        cell.addEventListener('click', function () {
          var r = parseInt(this.getAttribute('data-r'), 10);
          var c = parseInt(this.getAttribute('data-c'), 10);
          selectCrosswordCell(r, c, cw);
        });
      });

      var clueItems = container.querySelectorAll('.cw-clue-item');
      clueItems.forEach(function (item) {
        item.addEventListener('click', function () {
          var r = parseInt(this.getAttribute('data-r'), 10);
          var c = parseInt(this.getAttribute('data-c'), 10);
          var dir = this.getAttribute('data-dir');
          cwDirection = dir;
          selectCrosswordCell(r, c, cw);
          SoundEngine.playClick();
        });
      });

      window.removeEventListener('keypress', handleCwKeyPress);
      window.addEventListener('keypress', handleCwKeyPress);

      window.removeEventListener('keydown', handleCwNavKey);
      window.addEventListener('keydown', handleCwNavKey);

      var hintBtn = container.querySelector('#cwHintCellBtn');
      if (hintBtn) {
        hintBtn.addEventListener('click', function () {
          if (!cwSelectedCell) return;
          var targetChar = cwSelectedCell.getAttribute('data-ans');
          var letterEl = cwSelectedCell.querySelector('.cell-letter');
          if (letterEl && targetChar) {
            letterEl.textContent = targetChar;
            SoundEngine.playClick();
            checkCrosswordCompletion(cw);
          }
        });
      }

      var checkBtn = container.querySelector('#cwCheckBtn');
      if (checkBtn) {
        checkBtn.addEventListener('click', function () {
          verifyCrosswordGrid(cw);
        });
      }

      var resetBtn = container.querySelector('#cwResetBtn');
      if (resetBtn) {
        resetBtn.addEventListener('click', function () {
          if (confirm('確定要清空目前盤面重新開始嗎？')) {
            cells.forEach(function (c) {
              var l = c.querySelector('.cell-letter');
              if (l) l.textContent = '';
              c.classList.remove('cw-correct-cell', 'cw-wrong-cell');
            });
            SoundEngine.playClick();
          }
        });
      }

      var solveBtn = container.querySelector('#cwSolveBtn');
      if (solveBtn) {
        solveBtn.addEventListener('click', function () {
          cells.forEach(function (c) {
            var l = c.querySelector('.cell-letter');
            var ans = c.getAttribute('data-ans');
            if (l && ans) l.textContent = ans;
            c.classList.remove('cw-wrong-cell');
            c.classList.add('cw-correct-cell');
          });
          SoundEngine.playWin();
          ConfettiEngine.fire(60);
          StateManager.recordCrosswordSolved(cw.id);
          StateManager.addScore(200);
        });
      }
    }

    function selectCrosswordCell(r, c, cw) {
      var cellEl = document.querySelector('.cw-active-cell[data-r="' + r + '"][data-c="' + c + '"]');
      if (!cellEl) return;

      if (cwSelectedCell === cellEl) {
        cwDirection = (cwDirection === 'across') ? 'down' : 'across';
      }

      cwSelectedCell = cellEl;

      document.querySelectorAll('.cw-active-cell').forEach(function (el) {
        el.classList.remove('cw-selected', 'cw-word-highlight');
      });
      document.querySelectorAll('.cw-clue-item').forEach(function (el) {
        el.classList.remove('active');
      });

      cellEl.classList.add('cw-selected');
      highlightActiveWord(r, c, cwDirection, cw);
    }

    function highlightActiveWord(r, c, dir, cw) {
      var wordCells = [];
      var startR = r, startC = c;

      if (dir === 'across') {
        while (startC > 0 && document.querySelector('.cw-active-cell[data-r="' + startR + '"][data-c="' + (startC - 1) + '"]')) {
          startC--;
        }
        var curC = startC;
        while (curC < (cw.size || 7)) {
          var el = document.querySelector('.cw-active-cell[data-r="' + startR + '"][data-c="' + curC + '"]');
          if (!el) break;
          wordCells.push(el);
          curC++;
        }
      } else {
        while (startR > 0 && document.querySelector('.cw-active-cell[data-r="' + (startR - 1) + '"][data-c="' + startC + '"]')) {
          startR--;
        }
        var curR = startR;
        while (curR < (cw.size || 7)) {
          var el = document.querySelector('.cw-active-cell[data-r="' + curR + '"][data-c="' + startC + '"]');
          if (!el) break;
          wordCells.push(el);
          curR++;
        }
      }

      wordCells.forEach(function (wEl) {
        wEl.classList.add('cw-word-highlight');
      });

      var startCell = (dir === 'across') ? 
        document.querySelector('.cw-active-cell[data-r="' + startR + '"][data-c="' + startC + '"]') :
        document.querySelector('.cw-active-cell[data-r="' + startR + '"][data-c="' + startC + '"]');
      
      if (startCell) {
        var numEl = startCell.querySelector('.cell-num');
        if (numEl) {
          var numVal = numEl.textContent.trim();
          var clueEl = document.querySelector('.cw-clue-item[data-num="' + numVal + '"][data-dir="' + dir + '"]');
          if (clueEl) {
            clueEl.classList.add('active');
            clueEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
        }
      }
    }

    function handleCwKeyPress(e) {
      if (currentTab !== 'crossword' || !cwSelectedCell) return;
      var char = e.key;
      if (char.length !== 1 || e.ctrlKey || e.metaKey || e.altKey) return;

      var letterEl = cwSelectedCell.querySelector('.cell-letter');
      if (letterEl) {
        letterEl.textContent = char;
        SoundEngine.playClick();
        moveCrosswordFocus(1, activeCrossword);
        checkCrosswordCompletion(activeCrossword);
      }
    }

    function handleCwNavKey(e) {
      if (currentTab !== 'crossword' || !cwSelectedCell) return;
      
      if (e.key === 'Backspace') {
        var letterEl = cwSelectedCell.querySelector('.cell-letter');
        if (letterEl && letterEl.textContent) {
          letterEl.textContent = '';
        } else {
          moveCrosswordFocus(-1, activeCrossword);
          var prevEl = cwSelectedCell.querySelector('.cell-letter');
          if (prevEl) prevEl.textContent = '';
        }
        e.preventDefault();
      } else if (e.key === 'ArrowRight') {
        moveCrosswordDirection(0, 1);
      } else if (e.key === 'ArrowLeft') {
        moveCrosswordDirection(0, -1);
      } else if (e.key === 'ArrowDown') {
        moveCrosswordDirection(1, 0);
      } else if (e.key === 'ArrowUp') {
        moveCrosswordDirection(-1, 0);
      }
    }

    function moveCrosswordFocus(step, cw) {
      if (!cwSelectedCell) return;
      var r = parseInt(cwSelectedCell.getAttribute('data-r'), 10);
      var c = parseInt(cwSelectedCell.getAttribute('data-c'), 10);

      var nextR = r + (cwDirection === 'down' ? step : 0);
      var nextC = c + (cwDirection === 'across' ? step : 0);

      var nextCell = document.querySelector('.cw-active-cell[data-r="' + nextR + '"][data-c="' + nextC + '"]');
      if (nextCell) {
        selectCrosswordCell(nextR, nextC, cw);
      }
    }

    function moveCrosswordDirection(dr, dc) {
      if (!cwSelectedCell) return;
      var r = parseInt(cwSelectedCell.getAttribute('data-r'), 10);
      var c = parseInt(cwSelectedCell.getAttribute('data-c'), 10);
      var nextCell = document.querySelector('.cw-active-cell[data-r="' + (r + dr) + '"][data-c="' + (c + dc) + '"]');
      if (nextCell) {
        selectCrosswordCell(r + dr, c + dc, activeCrossword);
      }
    }

    function verifyCrosswordGrid(cw) {
      var cells = document.querySelectorAll('.cw-active-cell');
      var allFilled = true;
      var allCorrect = true;

      cells.forEach(function (c) {
        var letterEl = c.querySelector('.cell-letter');
        var userChar = letterEl ? letterEl.textContent.trim() : '';
        var targetChar = c.getAttribute('data-ans').trim();

        c.classList.remove('cw-correct-cell', 'cw-wrong-cell');

        if (!userChar) {
          allFilled = false;
        } else if (userChar === targetChar) {
          c.classList.add('cw-correct-cell');
        } else {
          c.classList.add('cw-wrong-cell');
          allCorrect = false;
        }
      });

      if (allFilled && allCorrect) {
        SoundEngine.playWin();
        ConfettiEngine.fire(80);
        StateManager.recordCrosswordSolved(cw.id);
        StateManager.addScore(300);
        alert('🎉 恭喜您！完美解開了全盤聖經十字填字！獲得 300 XP！');
      } else if (allCorrect && !allFilled) {
        SoundEngine.playCorrect();
        alert('目前已填寫的格子全部正確！請繼續完成剩餘格子！');
      } else {
        SoundEngine.playWrong();
      }
    }

    function checkCrosswordCompletion(cw) {
      var cells = document.querySelectorAll('.cw-active-cell');
      var isComplete = true;

      for (var i = 0; i < cells.length; i++) {
        var c = cells[i];
        var letterEl = c.querySelector('.cell-letter');
        var userChar = letterEl ? letterEl.textContent.trim() : '';
        var targetChar = c.getAttribute('data-ans').trim();
        if (userChar !== targetChar) {
          isComplete = false;
          break;
        }
      }

      if (isComplete) {
        cells.forEach(function (c) { c.classList.add('cw-correct-cell'); });
        SoundEngine.playWin();
        ConfettiEngine.fire(90);
        StateManager.recordCrosswordSolved(cw.id);
        StateManager.addScore(300);
      }
    }

    // ========================================================
    // 8. 聖經歷史時間線排序引擎 (Timeline Sorter Engine)
    // ========================================================
    function initTimelineMode() {
      var db = window.BIBLIA_CHALLENGE_DATA;
      if (!db || !db.timelineDecks) return;

      var container = document.getElementById('timelineAppContainer');
      if (!container) return;

      var currentDeck = db.timelineDecks[0];
      renderTimelineDeck(container, currentDeck);
    }

    function renderTimelineDeck(container, deck) {
      var db = window.BIBLIA_CHALLENGE_DATA;

      var html = '';
      html += '<div class="timeline-app-shell">';
      
      html += '  <div class="tl-header-bar">';
      html += '    <div class="tl-title-group">';
      html += '      <h3 class="tl-title">⏳ ' + deck.title + '</h3>';
      html += '      <span class="tl-desc">' + deck.desc + '</span>';
      html += '    </div>';
      html += '    <div class="tl-deck-selector">';
      html += '      <select id="tlDeckSelect" class="cw-level-select" aria-label="選擇時間線歷史主題">';
      db.timelineDecks.forEach(function (d) {
        var sel = (d.id === deck.id) ? 'selected' : '';
        html += '        <option value="' + d.id + '" ' + sel + '>' + d.title + '</option>';
      });
      html += '      </select>';
      html += '    </div>';
      html += '  </div>';

      var shuffledEvents = deck.events.slice().sort(function () { return 0.5 - Math.random(); });

      html += '  <div class="tl-events-list" id="tlEventsList">';
      shuffledEvents.forEach(function (ev, idx) {
        html += '    <div class="tl-event-card" data-id="' + ev.id + '" data-year="' + ev.year + '" data-era="' + ev.era + '">';
        html += '      <div class="tl-card-order-badge">' + (idx + 1) + '</div>';
        html += '      <div class="tl-card-content">';
        html += '        <div class="tl-event-text">' + ev.text + '</div>';
        html += '        <div class="tl-event-history-info" hidden>';
        html += '          <span class="tl-history-year">📅 ' + ev.year + '</span>';
        html += '          <span class="tl-history-era">🏷️ ' + ev.era + '</span>';
        html += '        </div>';
        html += '      </div>';
        html += '      <div class="tl-card-actions">';
        html += '        <button type="button" class="tl-move-btn tl-btn-up" title="上移">▲</button>';
        html += '        <button type="button" class="tl-move-btn tl-btn-down" title="下移">▼</button>';
        html += '      </div>';
        html += '    </div>';
      });
      html += '  </div>';

      html += '  <div class="tl-actions-bar">';
      html += '    <button type="button" id="tlVerifyBtn" class="btn btn-primary tl-verify-btn">驗證年代順序 ↵</button>';
      html += '    <div id="tlFeedbackMsg" class="tl-feedback-msg" hidden></div>';
      html += '  </div>';

      html += '</div>';

      container.innerHTML = html;

      bindTimelineEvents(container, deck);
    }

    function bindTimelineEvents(container, deck) {
      var deckSelect = container.querySelector('#tlDeckSelect');
      if (deckSelect) {
        deckSelect.addEventListener('change', function () {
          var db = window.BIBLIA_CHALLENGE_DATA;
          var selectedId = this.value;
          var found = db.timelineDecks.find(function (d) { return d.id === selectedId; });
          if (found) {
            SoundEngine.playClick();
            renderTimelineDeck(container, found);
          }
        });
      }

      var list = container.querySelector('#tlEventsList');
      if (list) {
        list.addEventListener('click', function (e) {
          var target = e.target;
          var card = target.closest('.tl-event-card');
          if (!card) return;

          if (target.classList.contains('tl-btn-up')) {
            var prev = card.previousElementSibling;
            if (prev) {
              list.insertBefore(card, prev);
              SoundEngine.playClick();
              refreshTimelineBadges(list);
            }
          } else if (target.classList.contains('tl-btn-down')) {
            var next = card.nextElementSibling;
            if (next) {
              list.insertBefore(next, card);
              SoundEngine.playClick();
              refreshTimelineBadges(list);
            }
          }
        });
      }

      var verifyBtn = container.querySelector('#tlVerifyBtn');
      var fbMsg = container.querySelector('#tlFeedbackMsg');
      if (verifyBtn && list) {
        verifyBtn.addEventListener('click', function () {
          var cards = list.querySelectorAll('.tl-event-card');
          var correctIds = deck.events.map(function (ev) { return ev.id; });
          var userIds = [];
          cards.forEach(function (c) {
            userIds.push(c.getAttribute('data-id'));
          });

          var isCorrect = true;
          for (var i = 0; i < correctIds.length; i++) {
            if (correctIds[i] !== userIds[i]) {
              isCorrect = false;
              break;
            }
          }

          if (isCorrect) {
            SoundEngine.playWin();
            ConfettiEngine.fire(70);
            StateManager.addScore(150);

            cards.forEach(function (c) {
              c.classList.add('correct');
              var info = c.querySelector('.tl-event-history-info');
              if (info) info.hidden = false;
            });

            if (fbMsg) {
              fbMsg.hidden = false;
              fbMsg.className = 'tl-feedback-msg ok';
              fbMsg.innerHTML = '🎉 太精彩了！完全正確排列救贖歷史進程！(+150 XP)';
            }
          } else {
            SoundEngine.playWrong();
            if (fbMsg) {
              fbMsg.hidden = false;
              fbMsg.className = 'tl-feedback-msg err';
              fbMsg.innerHTML = '💡 順序中還有部分事件有待調整，請仔細思考救贖歷史的先後順序！';
            }
          }
        });
      }
    }

    function refreshTimelineBadges(list) {
      var badges = list.querySelectorAll('.tl-card-order-badge');
      badges.forEach(function (b, idx) {
        b.textContent = idx + 1;
      });
    }

    // ========================================================
    // 9. 成就榮譽彈窗 (Achievements Modal)
    // ========================================================
    function openAchievementsModal() {
      var modal = elements.achievementsModal;
      if (!modal) return;
      var db = window.BIBLIA_CHALLENGE_DATA;
      if (!db || !db.achievements) return;

      var listContainer = document.getElementById('achievementsListContainer');
      var unlocked = StateManager.get().achievements || [];

      var html = '<div class="ach-modal-grid">';
      db.achievements.forEach(function (ach) {
        var isUnlocked = unlocked.indexOf(ach.id) !== -1;
        html += '<div class="ach-card ' + (isUnlocked ? 'unlocked' : 'locked') + '">';
        html += '  <div class="ach-icon">' + ach.icon + '</div>';
        html += '  <div class="ach-body">';
        html += '    <div class="ach-title">' + ach.title + (isUnlocked ? ' <span class="ach-ok-badge">已達成 ✓</span>' : '') + '</div>';
        html += '    <div class="ach-desc">' + ach.desc + '</div>';
        html += '  </div>';
        html += '</div>';
      });
      html += '</div>';

      if (listContainer) listContainer.innerHTML = html;
      modal.hidden = false;
      SoundEngine.playClick();
    }

    function closeAchievementsModal() {
      var modal = elements.achievementsModal;
      if (modal) modal.hidden = true;
    }

    return {
      init: init
    };
  })();

  // 頁面載入完成後啟動
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ChallengeApp.init);
  } else {
    ChallengeApp.init();
  }

})(window, document);
