/**
 * Biblia 聖經挑戰與益智小遊戲核心引擎 (Biblia Challenge & Games Engine v3.0)
 * 以「科學、有用、有趣」為設計原則，讓任何程度的學習者都能快樂學好聖經：
 * 1. 語音朗讀：自動挑選最自然的中文語音、慢／標準／快三段語速、長文分段朗讀
 *    （避開 Chrome 長句中斷），題目、選項、答案、解析、填字提示、年代事件皆可朗讀
 * 2. 遊戲化：10 題一輪的闖關與星級結算、漸進線索（越少線索越高分）、連擊倍率、
 *    每日目標與連續天數、等級晉升、20 款成就與學習儀表板
 * 3. 錯誤解說：易混淆辨析、選錯選項的對照記憶卡、記憶鉤，並自動收入錯題本
 * 4. 間隔重複：錯題依「當天 → 1 天後 → 3 天後」三格 Leitner 盒複習，三次都答對才算掌握
 * 5. 交錯練習：綜合挑戰把人物、地名、經文混合出題；難度分級（入門／進階／挑戰）
 * 6. 十字填字：作答列支援中文輸入法與手機鍵盤、字磚點選、逐詞即時批改
 * 7. 年代排序：點選互換或上下微調、逐張標示位置對錯、每件大事附經文出處說明
 */

(function (window, document) {
  'use strict';

  var DAY = 86400000;

  // ========================================================
  // 0. 共用小工具
  // ========================================================
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function dayKey(t) {
    var d = new Date(t || Date.now());
    return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
  }

  function db() {
    return window.BIBLIA_CHALLENGE_DATA || {};
  }

  // 作答比對：忽略空白與標點
  function norm(s) {
    return String(s || '').replace(/[\s，,、。．.「」『』（）()：:;；!！?？·•‧\-]/g, '');
  }

  function typeOf(q) {
    if (!q) return '';
    return q._type || (q.blankText ? 'verse' : (q.region ? 'place' : 'char'));
  }

  function answerOf(q) {
    return String(q.name || q.answer || '').trim();
  }

  var TYPE_META = {
    char: { icon: '👤', label: '人物', ask: '哪一位聖經人物' },
    place: { icon: '🗺️', label: '地名', ask: '哪一個聖經地名' },
    verse: { icon: '📜', label: '經文', ask: '' }
  };

  var DIFF_META = {
    1: { stars: '★', label: '入門' },
    2: { stars: '★★', label: '進階' },
    3: { stars: '★★★', label: '挑戰' }
  };

  // 經文出處 → 閱讀器連結（index.html#read/書卷號/章/節）
  var BOOK_NAMES = ['創世記', '出埃及記', '利未記', '民數記', '申命記', '約書亞記', '士師記', '路得記', '撒母耳記上', '撒母耳記下',
    '列王紀上', '列王紀下', '歷代志上', '歷代志下', '以斯拉記', '尼希米記', '以斯帖記', '約伯記', '詩篇', '箴言', '傳道書', '雅歌',
    '以賽亞書', '耶利米書', '耶利米哀歌', '以西結書', '但以理書', '何西阿書', '約珥書', '阿摩司書', '俄巴底亞書', '約拿書', '彌迦書',
    '那鴻書', '哈巴谷書', '西番雅書', '哈該書', '撒迦利亞書', '瑪拉基書', '馬太福音', '馬可福音', '路加福音', '約翰福音', '使徒行傳',
    '羅馬書', '哥林多前書', '哥林多後書', '加拉太書', '以弗所書', '腓立比書', '歌羅西書', '帖撒羅尼迦前書', '帖撒羅尼迦後書',
    '提摩太前書', '提摩太後書', '提多書', '腓利門書', '希伯來書', '雅各書', '彼得前書', '彼得後書', '約翰一書', '約翰二書', '約翰三書',
    '猶大書', '啟示錄'];

  function readerLink(q) {
    var ref = typeOf(q) === 'verse' ? q.ref : q.verseRef;
    var m = ref && String(ref).split('/')[0].trim().match(/^(.+?)\s*(\d+):(\d+)/);
    if (m) {
      var no = BOOK_NAMES.indexOf(m[1].trim()) + 1;
      if (no > 0) return 'index.html#read/' + no + '/' + m[2] + '/' + m[3];
    }
    if (q.bookNo && q.chap) return 'index.html#read/' + q.bookNo + '/' + q.chap;
    return '';
  }

  function testament(q) {
    return q && q.bookNo ? (q.bookNo <= 39 ? 'OT' : 'NT') : '';
  }

  function relTime(due) {
    var diff = due - Date.now();
    if (diff <= 60000) return '現在';
    if (diff < 3600000) return Math.ceil(diff / 60000) + ' 分鐘後';
    if (diff < 20 * 3600000) return Math.ceil(diff / 3600000) + ' 小時後';
    return Math.max(1, Math.round(diff / DAY)) + ' 天後';
  }

  // 為題庫標上題型並建立索引
  var QINDEX = {};
  function prepareData() {
    var d = db();
    [['characters', 'char'], ['places', 'place'], ['verses', 'verse']].forEach(function (pair) {
      (d[pair[0]] || []).forEach(function (q) {
        q._type = pair[1];
        QINDEX[q.id] = q;
      });
    });
  }

  function listOf(type) {
    var d = db();
    if (type === 'char') return d.characters || [];
    if (type === 'place') return d.places || [];
    if (type === 'verse') return d.verses || [];
    return [];
  }

  function findByName(name, type) {
    var key = norm(name);
    var list = listOf(type);
    for (var i = 0; i < list.length; i++) {
      var q = list[i];
      if (norm(answerOf(q)) === key) return q;
      if ((q.aliases || []).some(function (a) { return norm(a) === key; })) return q;
    }
    return null;
  }

  // ========================================================
  // 1. 輕量提示泡泡 (Toast)
  // ========================================================
  var Toast = (function () {
    function stack() {
      var s = document.getElementById('toastStack');
      if (!s) {
        s = document.createElement('div');
        s.id = 'toastStack';
        s.className = 'toast-stack';
        s.setAttribute('aria-live', 'polite');
        document.body.appendChild(s);
      }
      return s;
    }

    function push(el, ms) {
      stack().appendChild(el);
      setTimeout(function () { el.classList.add('visible'); }, 30);
      setTimeout(function () {
        el.classList.remove('visible');
        setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 400);
      }, ms || 2800);
    }

    function show(msg, kind) {
      var el = document.createElement('div');
      el.className = 'game-toast' + (kind ? ' toast-' + kind : '');
      el.textContent = msg;
      push(el, 2800);
    }

    return { show: show, push: push };
  })();

  // ========================================================
  // 2. Web Audio API 音效引擎 (零外部檔案依賴)
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

    function toggle() {
      enabled = !enabled;
      try {
        localStorage.setItem('biblia_challenge_sound', String(enabled));
      } catch (e) {}
      if (enabled) playTone(659.25, 'sine', 0.12, 0.1);
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
      // 和弦三連音 (E5 -> G#5 -> B5 -> E6)
      playTone(659.25, 'triangle', 0.18, 0.18, 0);
      playTone(830.61, 'triangle', 0.20, 0.18, 0.08);
      playTone(987.77, 'triangle', 0.24, 0.20, 0.16);
      playTone(1318.51, 'sine', 0.35, 0.22, 0.24);
    }

    function playWrong() {
      // 柔和雙音低鳴
      playTone(220.00, 'sine', 0.16, 0.15, 0);
      playTone(174.61, 'sine', 0.26, 0.14, 0.10);
    }

    function playStreak() {
      [523.25, 659.25, 783.99, 1046.50, 1318.51].forEach(function (f, idx) {
        playTone(f, 'sine', 0.22, 0.16, idx * 0.06);
      });
    }

    function playWin() {
      playTone(523.25, 'triangle', 0.25, 0.20, 0);
      playTone(659.25, 'triangle', 0.25, 0.20, 0.12);
      playTone(783.99, 'triangle', 0.30, 0.22, 0.24);
      playTone(1046.50, 'sine', 0.55, 0.28, 0.38);
    }

    function playClick() {
      playTone(880, 'sine', 0.04, 0.05, 0);
    }

    function playReveal() {
      playTone(587.33, 'sine', 0.10, 0.08, 0);
      playTone(739.99, 'sine', 0.14, 0.08, 0.06);
    }

    init();

    return {
      isEnabled: function () { return enabled; },
      toggle: toggle,
      playCorrect: playCorrect,
      playWrong: playWrong,
      playStreak: playStreak,
      playWin: playWin,
      playClick: playClick,
      playReveal: playReveal
    };
  })();

  // ========================================================
  // 3. Web Speech API 語音朗讀引擎
  // ========================================================
  var SpeechEngine = (function () {
    var synth = window.speechSynthesis || null;
    var RATES = [
      { v: 0.8, icon: '🐢', label: '慢速' },
      { v: 1.0, icon: '▶️', label: '標準' },
      { v: 1.2, icon: '🐇', label: '快速' }
    ];
    var autoSpeech = false;
    var rateIdx = 1;
    var voice = null;
    var token = 0;
    var activeBtn = null;
    var speaking = false;

    function init() {
      try {
        autoSpeech = localStorage.getItem('biblia_challenge_autospeech') === 'true';
        var r = parseInt(localStorage.getItem('biblia_challenge_tts_rate'), 10);
        if (r >= 0 && r < RATES.length) rateIdx = r;
      } catch (e) {}
      if (!synth) return;
      pickVoice();
      // 多數瀏覽器的語音清單是非同步載入
      if (synth.addEventListener) synth.addEventListener('voiceschanged', pickVoice);
      else synth.onvoiceschanged = pickVoice;
    }

    // 優先繁體中文，其次粵語、普通話；同語系中優先「自然／線上」高品質語音
    function pickVoice() {
      var voices = (synth && synth.getVoices && synth.getVoices()) || [];
      var zh = voices.filter(function (v) { return /^(zh|cmn|yue)/i.test(v.lang || ''); });
      if (!zh.length) { voice = null; return; }
      function rank(v) {
        var lang = String(v.lang).replace('_', '-').toLowerCase();
        var s = lang === 'zh-tw' || lang.indexOf('hant') !== -1 ? 40 : (lang === 'zh-hk' ? 22 : 12);
        if (/natural|online|neural|premium|enhanced/i.test(v.name)) s += 20;
        if (/hsiaochen|hsiaoyu|yunjhe|yating|meijia|hanhan|google/i.test(v.name)) s += 8;
        if (v.localService) s += 2;
        return s;
      }
      zh.sort(function (a, b) { return rank(b) - rank(a); });
      voice = zh[0];
    }

    // 把畫面文字整理成適合朗讀的句子
    function clean(text) {
      return String(text || '')
        .replace(/<[^>]+>/g, '')
        .replace(/【[_＿\s]*】/g, '（空格）')
        .replace(/[（(][A-Za-z][^）)]*[）)]/g, '')
        .replace(/(\d+):(\d+)\s*[-–]\s*(\d+)/g, '$1章$2到$3節')
        .replace(/(\d+):(\d+)/g, '$1章$2節')
        .replace(/\bBC\s*/g, '主前').replace(/\bAD\s*/g, '主後')
        .replace(/(\d)\s*[–—-]\s*(\d)/g, '$1到$2')
        .replace(/\.\.\.|…/g, '，')
        .replace(/[☀-➿️‍]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|\uD83E[\uDC00-\uDFFF]/g, '')
        .replace(/[＿_]{2,}/g, '空格')
        .replace(/\s+/g, ' ')
        .trim();
    }

    // 依句號分段，每段不超過約 90 字，避免長語句被瀏覽器中途截斷
    function chunks(text) {
      var parts = text.match(/[^。！？；\n]+[。！？；\n]?/g) || [];
      var out = [];
      var buf = '';
      parts.forEach(function (p) {
        p = p.trim();
        if (!p) return;
        while (p.length > 120) {
          var cut = p.lastIndexOf('，', 100);
          if (cut < 30) cut = 100;
          out.push(p.slice(0, cut + 1));
          p = p.slice(cut + 1);
        }
        if ((buf + p).length > 90 && buf) {
          out.push(buf);
          buf = p;
        } else {
          buf += p;
        }
      });
      if (buf) out.push(buf);
      return out;
    }

    function setUI(on) {
      document.querySelectorAll('.tts-speak-btn.speaking').forEach(function (b) {
        b.classList.remove('speaking');
        var l = b.querySelector('.tts-label');
        if (l && b.getAttribute('data-label')) l.textContent = b.getAttribute('data-label');
      });
      if (on && activeBtn) {
        activeBtn.classList.add('speaking');
        var lbl = activeBtn.querySelector('.tts-label');
        if (lbl) lbl.textContent = '停止';
      }
    }

    function stop() {
      token++;
      if (synth) {
        try { synth.cancel(); } catch (e) {}
      }
      speaking = false;
      setUI(false);
      activeBtn = null;
    }

    function speak(text, btn) {
      if (!synth) {
        Toast.show('此瀏覽器不支援語音朗讀，建議改用 Chrome、Edge 或 Safari。', 'warn');
        return;
      }
      stop();
      var list = chunks(clean(text));
      if (!list.length) return;
      var my = ++token;
      activeBtn = btn || null;
      speaking = true;
      setUI(true);
      StateManager.recordAudioListen();
      var i = 0;
      function next() {
        if (my !== token) return;
        if (i >= list.length) {
          speaking = false;
          setUI(false);
          activeBtn = null;
          return;
        }
        var u = new SpeechSynthesisUtterance(list[i++]);
        if (voice) {
          u.voice = voice;
          u.lang = voice.lang;
        } else {
          u.lang = 'zh-TW';
        }
        u.rate = RATES[rateIdx].v;
        u.pitch = 1;
        u.onend = next;
        u.onerror = function () {
          if (my !== token) return;
          speaking = false;
          setUI(false);
        };
        synth.speak(u);
      }
      // Chrome 在 cancel() 後立即 speak() 偶爾會被吞掉，稍候再開始
      setTimeout(next, 80);
    }

    // 同一顆按鈕再按一次＝停止
    function toggle(text, btn) {
      if (speaking && btn && activeBtn === btn) {
        stop();
      } else {
        speak(text, btn);
      }
    }

    function questionText(q, ctx) {
      var t = typeOf(q);
      var s = '';
      if (t === 'verse') {
        s = '經文填空。出處：' + q.ref + '。' + q.blankText + '。提示：' + q.hint + '。';
      } else {
        s = '請猜猜看，這是' + TYPE_META[t].ask + '？';
        q.clues.slice(0, ctx.revealed).forEach(function (c, i) {
          s += '線索' + '一二三四五'.charAt(i) + '：' + c + '。';
        });
      }
      if (ctx.inputMode === 'choice' && ctx.choices) {
        s += '選項：';
        ctx.choices.forEach(function (c, i) {
          if (ctx.removed && ctx.removed.indexOf(c) !== -1) return;
          s += 'ABCD'.charAt(i) + '，' + c + '；';
        });
      } else {
        s += '請輸入 ' + answerOf(q).length + ' 個字的答案。';
      }
      return s;
    }

    function answerText(q, pick, ok) {
      var ans = answerOf(q);
      var s = ok ? '答對了！答案是：' + ans + '。' : '正確答案是：' + ans + '。你的回答是：' + (pick || '未作答') + '。';
      if (!ok && q.mistakeExplanation) s += '辨析：' + q.mistakeExplanation;
      if (q.nameMeaning) s += '名字的意思是：' + q.nameMeaning + '。';
      var desc = q.bio || q.notes || q.meaning;
      if (desc) s += desc;
      if (typeOf(q) === 'verse') s += '完整經文：' + q.ref + '：' + q.fullText;
      else if (q.verseText) s += '相關經文，' + q.verseRef + '：' + q.verseText;
      return s;
    }

    function cycleRate() {
      rateIdx = (rateIdx + 1) % RATES.length;
      try { localStorage.setItem('biblia_challenge_tts_rate', String(rateIdx)); } catch (e) {}
      return RATES[rateIdx];
    }

    function toggleAuto() {
      autoSpeech = !autoSpeech;
      try { localStorage.setItem('biblia_challenge_autospeech', String(autoSpeech)); } catch (e) {}
      return autoSpeech;
    }

    init();

    return {
      isSupported: function () { return !!synth; },
      isAuto: function () { return autoSpeech; },
      toggleAuto: toggleAuto,
      rate: function () { return RATES[rateIdx]; },
      cycleRate: cycleRate,
      speak: speak,
      toggle: toggle,
      stop: stop,
      questionText: questionText,
      answerText: answerText,
      isSpeaking: function () { return speaking; }
    };
  })();

  // 統一的朗讀按鈕
  function ttsButton(id, label, extraClass) {
    return '<button type="button" class="tts-speak-btn' + (extraClass ? ' ' + extraClass : '') + '" id="' + id + '" data-label="' + esc(label) + '" title="語音朗讀">' +
      '<span aria-hidden="true">🔊</span> <span class="tts-label">' + esc(label) + '</span></button>';
  }

  // ========================================================
  // 4. Confetti 五彩碎紙歡慶特效 (Canvas 粒子引擎)
  // ========================================================
  var ConfettiEngine = (function () {
    var canvas, ctx, particles = [], animationId = null;
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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
      if (reduce) return;
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
      if (!animationId) loop();
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

    return { init: init, fire: fire };
  })();

  // ========================================================
  // 5. 等級、每日目標、間隔複習與成就 (State Manager)
  // ========================================================
  var StateManager = (function () {
    var STORAGE_KEY = 'biblia_challenge_state_v2';

    var LEVELS = [
      { level: 1, name: '🌿 聖經學徒', minXp: 0, desc: '初窺真道殿堂，如同新生嬰孩愛慕純淨的靈奶。' },
      { level: 2, name: '🌱 忠心門徒', minXp: 300, desc: '日日在神的話語中扎根生長，立志跟隨主的腳蹤行。' },
      { level: 3, name: '📜 經學學士', minXp: 800, desc: '按著正意分解真理的道，心竅習練通達，能明辨是非。' },
      { level: 4, name: '🛡️ 屬靈勇士', minXp: 1600, desc: '拿起聖靈的寶劍，就是神的道，在屬靈爭戰中剛強得勝。' },
      { level: 5, name: '👑 先知祭司', minXp: 3000, desc: '胸懷聖約真理，體貼神的心腸，為時代呼求禱告守望。' },
      { level: 6, name: '🕊️ 神學宗師', minXp: 5000, desc: '神的話豐豐富富藏在心裡，活出真理與愛的最高基督品格。' }
    ];

    // Leitner 三格：答錯回到第 1 格（當天再練），之後 1 天、3 天各複習一次，三次答對即掌握
    var INTERVALS = [0, DAY, 3 * DAY];

    function defaults() {
      return {
        score: 0,
        streak: 0,
        maxStreak: 0,
        totalAnswered: 0,
        totalCorrect: 0,
        charCorrect: 0,
        placeCorrect: 0,
        verseCorrect: 0,
        mixedCorrect: 0,
        mistakesCorrected: 0,
        masteredCount: 0,
        audioListenedCount: 0,
        firstClueWins: 0,
        perfectRounds: 0,
        crosswordsSolved: {},
        cwProgress: {},
        timelineSolved: {},
        achievements: [],
        mistakes: [],
        qStats: {},
        daily: { date: '', answered: 0, correct: 0, goalHit: false },
        dayStreak: 0,
        bestDayStreak: 0,
        lastGoalDate: '',
        settings: { difficulty: 0, dailyGoal: 10, lastDeck: '', lastCw: '' }
      };
    }

    var state = defaults();
    var listeners = [];

    function load() {
      try {
        var raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          var parsed = JSON.parse(raw);
          if (parsed && typeof parsed === 'object') {
            Object.keys(parsed).forEach(function (k) { state[k] = parsed[k]; });
            state.settings = Object.assign(defaults().settings, parsed.settings || {});
            state.daily = Object.assign(defaults().daily, parsed.daily || {});
          }
        }
      } catch (e) {
        console.warn('Failed to load challenge state', e);
      }
      // v2 的錯題存整份題目；改為只存 id 與複習排程
      state.mistakes = (state.mistakes || []).map(function (m) {
        return {
          id: m.id,
          box: m.box || 0,
          due: m.due || m.failedAt || Date.now(),
          wrong: m.wrong || 1,
          lastPick: m.lastPick || m.userPick || ''
        };
      }).filter(function (m) { return !!QINDEX[m.id]; });
      rollDaily();
      return state;
    }

    function save() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch (e) {}
    }

    function emit() {
      listeners.forEach(function (fn) { fn(); });
    }

    function rollDaily() {
      var today = dayKey();
      if (state.daily.date !== today) {
        state.daily = { date: today, answered: 0, correct: 0, goalHit: false };
      }
    }

    function currentDayStreak() {
      var today = dayKey();
      var yesterday = dayKey(Date.now() - DAY);
      return (state.lastGoalDate === today || state.lastGoalDate === yesterday) ? state.dayStreak : 0;
    }

    function getCurrentLevelInfo() {
      var score = state.score;
      for (var i = LEVELS.length - 1; i >= 0; i--) {
        if (score >= LEVELS[i].minXp) {
          var cur = LEVELS[i];
          var next = LEVELS[i + 1] || null;
          var percent = next ? Math.floor(((score - cur.minXp) / (next.minXp - cur.minXp)) * 100) : 100;
          return {
            level: cur.level,
            name: cur.name,
            desc: cur.desc,
            currentXp: score,
            nextXp: next ? next.minXp : 'MAX',
            percent: Math.min(100, Math.max(0, percent))
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

    function addScore(basePoints, noCombo) {
      var prevLevel = getCurrentLevelInfo().level;
      var earned = Math.round(basePoints * (noCombo ? 1 : getComboMultiplier()));
      state.score += earned;
      save();
      var lvl = getCurrentLevelInfo();
      if (lvl.level > prevLevel) triggerLevelUp(lvl);
      updateTopBarStats();
      checkAchievements();
      return earned;
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

    // 每日目標：答對（或解出填字詞、排好年代）達到目標數即完成
    function checkDailyGoal() {
      if (state.daily.goalHit || state.daily.correct < state.settings.dailyGoal) return false;
      var today = dayKey();
      state.daily.goalHit = true;
      state.dayStreak = state.lastGoalDate === dayKey(Date.now() - DAY) ? state.dayStreak + 1 : 1;
      state.lastGoalDate = today;
      if (state.dayStreak > state.bestDayStreak) state.bestDayStreak = state.dayStreak;
      return true;
    }

    function bumpDaily(correct) {
      rollDaily();
      state.daily.answered++;
      if (correct) state.daily.correct++;
      var hit = checkDailyGoal();
      save();
      updateTopBarStats();
      checkAchievements();
      return hit;
    }

    function findMistake(id) {
      for (var i = 0; i < state.mistakes.length; i++) {
        if (state.mistakes[i].id === id) return state.mistakes[i];
      }
      return null;
    }

    function addMistake(q, pick) {
      var m = findMistake(q.id);
      if (m) {
        m.box = 0;
        m.due = Date.now();
        m.wrong++;
        m.lastPick = pick;
      } else {
        state.mistakes.push({ id: q.id, box: 0, due: Date.now(), wrong: 1, lastPick: pick });
      }
    }

    // 答對錯題：到期才升一格；未到期的提前練習不計進度，維持間隔效果
    function reviewSuccess(id) {
      var m = findMistake(id);
      if (!m) return null;
      if (m.due > Date.now()) return { status: 'early', box: m.box, due: m.due };
      state.mistakesCorrected++;
      m.box++;
      if (m.box >= INTERVALS.length) {
        state.mistakes.splice(state.mistakes.indexOf(m), 1);
        state.masteredCount++;
        return { status: 'mastered' };
      }
      m.due = Date.now() + INTERVALS[m.box];
      return { status: 'advanced', box: m.box, due: m.due };
    }

    function recordAnswer(q, ok, pick, opts) {
      opts = opts || {};
      rollDaily();
      state.totalAnswered++;
      state.daily.answered++;
      var st = state.qStats[q.id] || (state.qStats[q.id] = { c: 0, w: 0 });
      var res = { review: null, goalReached: false };
      if (ok) {
        state.totalCorrect++;
        state.daily.correct++;
        st.c++;
        state.streak++;
        if (state.streak > state.maxStreak) state.maxStreak = state.streak;
        var t = typeOf(q);
        if (t === 'char') state.charCorrect++;
        else if (t === 'place') state.placeCorrect++;
        else if (t === 'verse') state.verseCorrect++;
        if (opts.mixed) state.mixedCorrect++;
        if (opts.firstClue) state.firstClueWins++;
        res.review = reviewSuccess(q.id);
      } else {
        st.w++;
        state.streak = 0;
        addMistake(q, pick);
        res.review = { status: 'added' };
      }
      res.goalReached = checkDailyGoal();
      save();
      updateTopBarStats();
      checkAchievements();
      return res;
    }

    function recordAudioListen() {
      state.audioListenedCount++;
      save();
      checkAchievements();
    }

    function recordCrosswordSolved(cwId) {
      var first = !state.crosswordsSolved[cwId];
      state.crosswordsSolved[cwId] = Date.now();
      save();
      checkAchievements();
      return first;
    }

    function recordTimelineSolved(deckId) {
      var first = !state.timelineSolved[deckId];
      state.timelineSolved[deckId] = Date.now();
      save();
      checkAchievements();
      return first;
    }

    function recordPerfectRound() {
      state.perfectRounds++;
      save();
      checkAchievements();
    }

    function count(obj) {
      return Object.keys(obj || {}).length;
    }

    // 各成就目前的進度值（與資料檔中的 req 比較）
    var ACH_VALUE = {
      ach_first: function (s) { return s.totalCorrect; },
      ach_streak5: function (s) { return s.maxStreak; },
      ach_streak10: function (s) { return s.maxStreak; },
      ach_char_master: function (s) { return s.charCorrect; },
      ach_geo_master: function (s) { return s.placeCorrect; },
      ach_verse_master: function (s) { return s.verseCorrect; },
      ach_cw_solver: function (s) { return count(s.crosswordsSolved); },
      ach_score2000: function (s) { return s.score; },
      ach_mistake_fixer: function (s) { return s.mistakesCorrected; },
      ach_audio_listener: function (s) { return s.audioListenedCount; },
      ach_level_master: function () { return getCurrentLevelInfo().level; },
      ach_crossword_all: function (s) { return count(s.crosswordsSolved); },
      ach_daily_goal: function (s) { return s.lastGoalDate ? 1 : 0; },
      ach_day_streak3: function (s) { return s.bestDayStreak; },
      ach_day_streak7: function (s) { return s.bestDayStreak; },
      ach_round_perfect: function (s) { return s.perfectRounds; },
      ach_timeline_all: function (s) { return count(s.timelineSolved); },
      ach_mastered5: function (s) { return s.masteredCount; },
      ach_mixed_master: function (s) { return s.mixedCorrect; },
      ach_clue_sharp: function (s) { return s.firstClueWins; }
    };

    function achProgress(ach) {
      var fn = ACH_VALUE[ach.id];
      var v = fn ? fn(state) : 0;
      return { value: Math.min(v, ach.req), req: ach.req };
    }

    function checkAchievements() {
      var list = db().achievements || [];
      var fresh = [];
      list.forEach(function (ach) {
        if (state.achievements.indexOf(ach.id) !== -1) return;
        var fn = ACH_VALUE[ach.id];
        if (fn && fn(state) >= ach.req) {
          state.achievements.push(ach.id);
          fresh.push(ach);
        }
      });
      if (fresh.length) {
        save();
        fresh.forEach(showAchievementNotification);
      }
    }

    function showAchievementNotification(ach) {
      var toast = document.createElement('div');
      toast.className = 'game-achievement-toast';
      toast.innerHTML = '<span class="ach-toast-icon">' + ach.icon + '</span>' +
        '<div class="ach-toast-body">' +
          '<div class="ach-toast-badge">榮譽成就解鎖！</div>' +
          '<div class="ach-toast-title">' + esc(ach.title) + '</div>' +
          '<div class="ach-toast-desc">' + esc(ach.desc) + '</div>' +
        '</div>';
      Toast.push(toast, 4500);
      SoundEngine.playStreak();
      ConfettiEngine.fire(40);
    }

    function dueMistakes() {
      var now = Date.now();
      return state.mistakes.filter(function (m) { return m.due <= now; });
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
      var mult = getComboMultiplier();
      if (comboEl) {
        comboEl.hidden = !(mult > 1.0);
        comboEl.textContent = '⚡ ' + mult + 'x 加乘';
      }
      var lvl = getCurrentLevelInfo();
      if (levelBadge) levelBadge.textContent = lvl.name + ' Lv.' + lvl.level;
      if (xpFill) xpFill.style.width = lvl.percent + '%';
      if (xpText) xpText.textContent = state.score + ' / ' + lvl.nextXp + ' XP';

      var badge = document.getElementById('mistakesCountBadge');
      if (badge) {
        var due = dueMistakes().length;
        badge.textContent = due;
        badge.hidden = due === 0;
      }
      emit();
    }

    return {
      load: load,
      get: function () { return state; },
      save: save,
      addScore: addScore,
      getComboMultiplier: getComboMultiplier,
      recordAnswer: recordAnswer,
      recordAudioListen: recordAudioListen,
      recordCrosswordSolved: recordCrosswordSolved,
      recordTimelineSolved: recordTimelineSolved,
      recordPerfectRound: recordPerfectRound,
      bumpDaily: bumpDaily,
      getCurrentLevelInfo: getCurrentLevelInfo,
      currentDayStreak: currentDayStreak,
      updateTopBarStats: updateTopBarStats,
      achProgress: achProgress,
      getMistakes: function () { return state.mistakes; },
      dueMistakes: dueMistakes,
      findMistake: findMistake,
      intervals: INTERVALS,
      subscribe: function (fn) { listeners.push(fn); },
      setSetting: function (k, v) { state.settings[k] = v; save(); }
    };
  })();

  // ========================================================
  // 6. 主遊戲控制器 (Main Challenge Controller)
  // ========================================================
  var ChallengeApp = (function () {
    var TABS = ['char', 'place', 'verse', 'mixed', 'crossword', 'timeline', 'mistakes'];
    var QUIZ_CONTAINERS = {
      char: 'charQuizContainer',
      place: 'placeQuizContainer',
      verse: 'verseQuizContainer',
      mixed: 'mixedQuizContainer',
      mistakes: 'mistakesQuizContainer'
    };
    var ROUND_SIZE = 10;
    var CLUE_BONUS = [50, 25, 0, -20]; // 看了 1／2／3／4 條線索的加減分

    var currentTab = 'char';
    var inputMode = 'choice';
    var session = null; // { mode, pool, idx, review, round, qs }
    var sessions = {};  // 各分頁進行中的一輪，切換分頁後可接續
    var qs = null;      // 目前題目的作答狀態
    var elements = {};

    function init() {
      prepareData();
      cacheElements();
      StateManager.load();
      bindEvents();
      ConfettiEngine.init();
      StateManager.subscribe(renderTodayPanel);
      StateManager.updateTopBarStats();
      syncTopButtons();
      renderTips();

      try {
        var savedMode = localStorage.getItem('biblia_challenge_inputmode');
        if (savedMode === 'fill' || savedMode === 'choice') inputMode = savedMode;
      } catch (e) {}
      var params = new URLSearchParams(window.location.search);
      if (params.get('type') === 'fill') inputMode = 'fill';

      var hash = window.location.hash.replace('#', '');
      switchTab(TABS.indexOf(hash) !== -1 ? hash : 'char');
    }

    function cacheElements() {
      elements.navTabs = document.querySelectorAll('.game-nav-tab');
      elements.views = {
        char: document.getElementById('viewCharacters'),
        place: document.getElementById('viewPlaces'),
        verse: document.getElementById('viewVerses'),
        mixed: document.getElementById('viewMixed'),
        crossword: document.getElementById('viewCrossword'),
        timeline: document.getElementById('viewTimeline'),
        mistakes: document.getElementById('viewMistakes')
      };
      elements.soundToggleBtn = document.getElementById('soundToggleBtn');
      elements.speechToggleBtn = document.getElementById('speechToggleBtn');
      elements.speechRateBtn = document.getElementById('speechRateBtn');
      elements.themeToggleBtn = document.getElementById('themeToggleBtn');
      elements.btnAchievements = document.getElementById('btnAchievements');
      elements.achievementsModal = document.getElementById('achievementsModal');
      elements.achievementsCloseBtn = document.getElementById('achievementsCloseBtn');
      elements.levelUpModal = document.getElementById('levelUpModal');
      elements.levelUpConfirmBtn = document.getElementById('levelUpConfirmBtn');
    }

    function bindEvents() {
      elements.navTabs.forEach(function (tab) {
        tab.addEventListener('click', function () {
          SoundEngine.playClick();
          switchTab(this.getAttribute('data-tab'));
        });
      });

      window.addEventListener('hashchange', function () {
        var h = window.location.hash.replace('#', '');
        if (TABS.indexOf(h) !== -1 && h !== currentTab) switchTab(h);
      });

      if (elements.soundToggleBtn) {
        elements.soundToggleBtn.addEventListener('click', function () {
          SoundEngine.toggle();
          syncTopButtons();
        });
      }

      if (elements.speechToggleBtn) {
        elements.speechToggleBtn.addEventListener('click', function () {
          var on = SpeechEngine.toggleAuto();
          syncTopButtons();
          SoundEngine.playClick();
          Toast.show(on ? '🗣️ 已開啟自動朗讀：出題與解答都會念出來' : '已關閉自動朗讀（仍可隨時按 🔊 朗讀）');
          if (on && quizActive() && !qs.answered) speakCurrentQuestion();
        });
      }

      if (elements.speechRateBtn) {
        elements.speechRateBtn.addEventListener('click', function () {
          var r = SpeechEngine.cycleRate();
          syncTopButtons();
          SpeechEngine.speak('語速：' + r.label, null);
        });
      }

      if (elements.themeToggleBtn) {
        elements.themeToggleBtn.addEventListener('click', cycleTheme);
      }

      if (elements.btnAchievements) {
        elements.btnAchievements.addEventListener('click', openAchievementsModal);
      }
      if (elements.achievementsCloseBtn) {
        elements.achievementsCloseBtn.addEventListener('click', closeAchievementsModal);
      }
      if (elements.achievementsModal) {
        elements.achievementsModal.addEventListener('click', function (e) {
          if (e.target === elements.achievementsModal) closeAchievementsModal();
        });
      }
      if (elements.levelUpConfirmBtn) {
        elements.levelUpConfirmBtn.addEventListener('click', function () {
          if (elements.levelUpModal) elements.levelUpModal.hidden = true;
          SoundEngine.playClick();
        });
      }

      var tipsBtn = document.getElementById('todayTipsBtn');
      if (tipsBtn) {
        tipsBtn.addEventListener('click', function () {
          var panel = document.getElementById('tipsPanel');
          if (!panel) return;
          panel.hidden = !panel.hidden;
          this.setAttribute('aria-expanded', panel.hidden ? 'false' : 'true');
          SoundEngine.playClick();
        });
      }

      var goalSel = document.getElementById('dailyGoalSelect');
      if (goalSel) {
        goalSel.addEventListener('change', function () {
          StateManager.setSetting('dailyGoal', parseInt(this.value, 10) || 10);
          StateManager.updateTopBarStats();
        });
      }

      window.addEventListener('keydown', handleGlobalKeydown);
    }

    function syncTopButtons() {
      if (elements.soundToggleBtn) {
        var on = SoundEngine.isEnabled();
        elements.soundToggleBtn.innerHTML = '<span aria-hidden="true">' + (on ? '🔊' : '🔇') + '</span>';
        elements.soundToggleBtn.setAttribute('title', on ? '音效：開（點擊靜音）' : '音效：關（點擊開啟）');
        elements.soundToggleBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
      }
      if (elements.speechToggleBtn) {
        var auto = SpeechEngine.isAuto();
        var icon = document.getElementById('speechIcon');
        var text = document.getElementById('speechStateText');
        if (icon) icon.textContent = auto ? '🗣️' : '🎙️';
        if (text) text.textContent = auto ? '自動朗讀:開' : '自動朗讀';
        elements.speechToggleBtn.classList.toggle('is-on', auto);
        elements.speechToggleBtn.setAttribute('aria-pressed', auto ? 'true' : 'false');
      }
      if (elements.speechRateBtn) {
        var r = SpeechEngine.rate();
        elements.speechRateBtn.innerHTML = '<span aria-hidden="true">' + r.icon + '</span> <span class="btn-text">' + r.label + '</span>';
        elements.speechRateBtn.setAttribute('title', '朗讀語速：' + r.label + '（點擊切換）');
      }
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
      var nextTheme = themes[(themes.indexOf(curTheme) + 1) % themes.length];
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
      SpeechEngine.stop();
      currentTab = tabId;
      if (window.location.hash.replace('#', '') !== tabId) {
        if (window.history && history.replaceState) history.replaceState(null, '', '#' + tabId);
        else window.location.hash = tabId;
      }

      elements.navTabs.forEach(function (tab) {
        var active = tab.getAttribute('data-tab') === tabId;
        tab.classList.toggle('active', active);
        tab.setAttribute('aria-selected', active ? 'true' : 'false');
        if (active && tab.scrollIntoView) tab.scrollIntoView({ block: 'nearest', inline: 'nearest' });
      });
      Object.keys(elements.views).forEach(function (key) {
        if (elements.views[key]) elements.views[key].hidden = (key !== tabId);
      });

      // 只保留目前分頁的題卡 DOM，避免隱藏分頁裡同名 id 被誤抓
      Object.keys(QUIZ_CONTAINERS).forEach(function (key) {
        if (key === tabId) return;
        var el = document.getElementById(QUIZ_CONTAINERS[key]);
        if (el) el.innerHTML = '';
      });

      if (tabId === 'crossword') initCrosswordMode();
      else if (tabId === 'timeline') initTimelineMode();
      else if (tabId === 'mistakes') renderMistakesHome();
      else resumeOrStart(tabId);
    }

    // 切換分頁回來時接續原本那一輪，不重新開始
    function resumeOrStart(mode) {
      var saved = sessions[mode];
      if (!saved || saved.round.results.length >= saved.round.size || !saved.qs) {
        startQuiz(mode);
        return;
      }
      session = saved;
      qs = saved.qs;
      if (qs.answered) {
        session.idx++;
        showQuestion();
      } else {
        renderQuestionCard();
      }
    }

    function quizRoot() {
      return session ? document.getElementById(QUIZ_CONTAINERS[session.mode]) : null;
    }

    function quizActive() {
      return !!(qs && session && QUIZ_CONTAINERS[currentTab] && session.mode === currentTab);
    }

    // ========================================================
    // 7. 今日目標面板與科學學習法
    // ========================================================
    function renderTodayPanel() {
      var s = StateManager.get();
      var goal = s.settings.dailyGoal;
      var done = Math.min(s.daily.correct, goal);
      var pct = goal ? done / goal : 0;
      var ring = document.getElementById('todayRingFill');
      if (ring) {
        var C = 2 * Math.PI * 18;
        ring.setAttribute('stroke-dasharray', C.toFixed(1));
        ring.setAttribute('stroke-dashoffset', (C * (1 - pct)).toFixed(1));
      }
      var txt = document.getElementById('todayGoalText');
      if (txt) txt.textContent = s.daily.goalHit ? '今日目標達成！' : '今日目標 ' + done + ' / ' + goal;
      var sub = document.getElementById('todayGoalSub');
      if (sub) sub.textContent = s.daily.goalHit ? '已答對 ' + s.daily.correct + ' 題，繼續保持' : '答對題目、解出填字或排好年代都算';
      var panel = document.getElementById('todayPanel');
      if (panel) panel.classList.toggle('goal-hit', !!s.daily.goalHit);

      var streakEl = document.getElementById('todayStreakChip');
      if (streakEl) streakEl.textContent = '📅 連續 ' + StateManager.currentDayStreak() + ' 天';
      var accEl = document.getElementById('todayAccChip');
      if (accEl) accEl.textContent = '🎯 正確率 ' + (s.totalAnswered ? Math.round(s.totalCorrect / s.totalAnswered * 100) + '%' : '—');
      var dueEl = document.getElementById('todayDueChip');
      if (dueEl) {
        var due = StateManager.dueMistakes().length;
        dueEl.textContent = '📝 待複習 ' + due;
        dueEl.classList.toggle('has-due', due > 0);
      }
      var sel = document.getElementById('dailyGoalSelect');
      if (sel && String(sel.value) !== String(goal)) sel.value = String(goal);
    }

    function renderTips() {
      var panel = document.getElementById('tipsGrid');
      var tips = db().learningTips || [];
      if (!panel || !tips.length) return;
      panel.innerHTML = tips.map(function (t) {
        return '<div class="tip-card"><div class="tip-head"><span class="tip-icon">' + t.icon + '</span>' +
          '<strong>' + esc(t.title) + '</strong><span class="tip-en">' + esc(t.en) + '</span></div>' +
          '<p>' + esc(t.text) + '</p></div>';
      }).join('');
    }

    function randomTip() {
      var tips = db().learningTips || [];
      return tips.length ? tips[Math.floor(Math.random() * tips.length)] : null;
    }

    // 達成每日目標的獎勵
    function celebrateGoal() {
      var bonus = StateManager.addScore(50, true);
      SoundEngine.playWin();
      ConfettiEngine.fire(90);
      Toast.show('📅 今日學習目標達成！獎勵 +' + bonus + ' XP，連續 ' + StateManager.currentDayStreak() + ' 天', 'ok');
    }

    // ========================================================
    // 8. 問答引擎：人物／地名／經文／綜合／錯題複習
    // ========================================================
    function poolFor(mode) {
      var list = mode === 'mixed' ? listOf('char').concat(listOf('place'), listOf('verse')) : listOf(mode);
      var diff = StateManager.get().settings.difficulty;
      if (diff) list = list.filter(function (q) { return (q.difficulty || 2) === diff; });
      return list;
    }

    // 從未答對過的題目優先，其次再隨機複習，確保題庫逐步全面覆蓋
    function orderPool(list) {
      var stats = StateManager.get().qStats;
      var fresh = [];
      var seen = [];
      list.forEach(function (q) {
        (stats[q.id] && stats[q.id].c > 0 ? seen : fresh).push(q);
      });
      return shuffle(fresh).concat(shuffle(seen));
    }

    function newRound(size) {
      return { size: size, results: [], xp: 0, wrongIds: [], bestStreak: 0, streak: 0 };
    }

    function startQuiz(mode) {
      var list = poolFor(mode);
      var container = document.getElementById(QUIZ_CONTAINERS[mode]);
      if (!container) return;
      if (!list.length) {
        container.innerHTML = renderDiffBar(mode) +
          '<div class="quiz-card empty-card"><div class="empty-icon">🔍</div><p>這個難度目前沒有題目，請改選其他難度。</p></div>';
        bindDiffBar(container, mode);
        return;
      }
      session = {
        mode: mode,
        review: false,
        pool: orderPool(list),
        idx: 0,
        round: newRound(Math.min(ROUND_SIZE, list.length))
      };
      sessions[mode] = session;
      showQuestion();
    }

    function startReview(practiceAll) {
      var source = practiceAll ? StateManager.getMistakes() : StateManager.dueMistakes();
      var pool = shuffle(source.map(function (m) { return QINDEX[m.id]; }).filter(Boolean)).slice(0, 20);
      if (!pool.length) {
        renderMistakesHome();
        return;
      }
      session = { mode: 'mistakes', review: true, practiceAll: !!practiceAll, pool: pool, idx: 0, round: newRound(pool.length) };
      showQuestion();
    }

    function showQuestion() {
      if (!session || !session.pool.length) return;
      var q = session.pool[session.idx % session.pool.length];
      var t = typeOf(q);
      qs = {
        q: q,
        revealed: t === 'verse' ? 0 : 1,
        choices: shuffle(q.options),
        removed: [],
        answered: false,
        hintUsed: false,
        fiftyUsed: false
      };
      session.qs = qs;
      renderQuestionCard();
      if (SpeechEngine.isAuto()) {
        setTimeout(speakCurrentQuestion, 350);
      }
    }

    function speakCurrentQuestion(btn) {
      if (!qs) return;
      SpeechEngine.toggle(SpeechEngine.questionText(qs.q, {
        revealed: qs.revealed,
        choices: qs.choices,
        removed: qs.removed,
        inputMode: inputMode
      }), btn || document.getElementById('ttsSpeakQuestionBtn'));
    }

    function setInputMode(mode) {
      inputMode = mode;
      try { localStorage.setItem('biblia_challenge_inputmode', mode); } catch (e) {}
      if (qs && !qs.answered) renderQuestionCard();
    }

    function renderDiffBar(mode) {
      if (mode === 'mistakes') return '';
      var cur = StateManager.get().settings.difficulty;
      var all = mode === 'mixed' ? listOf('char').concat(listOf('place'), listOf('verse')) : listOf(mode);
      var counts = { 1: 0, 2: 0, 3: 0 };
      all.forEach(function (q) { counts[q.difficulty || 2]++; });
      var html = '<div class="diff-bar" role="group" aria-label="選擇難度">';
      html += '<span class="diff-bar-label">難度</span>';
      html += '<button type="button" class="diff-chip' + (cur === 0 ? ' active' : '') + '" data-diff="0">全部 <small>' + all.length + '</small></button>';
      [1, 2, 3].forEach(function (d) {
        html += '<button type="button" class="diff-chip diff-' + d + (cur === d ? ' active' : '') + '" data-diff="' + d + '">' +
          DIFF_META[d].stars + ' ' + DIFF_META[d].label + ' <small>' + counts[d] + '</small></button>';
      });
      html += '</div>';
      return html;
    }

    function bindDiffBar(container, mode) {
      container.querySelectorAll('.diff-chip').forEach(function (b) {
        b.addEventListener('click', function () {
          StateManager.setSetting('difficulty', parseInt(this.getAttribute('data-diff'), 10) || 0);
          SoundEngine.playClick();
          SpeechEngine.stop();
          startQuiz(mode);
        });
      });
    }

    function roundDots() {
      var r = session.round;
      var html = '<div class="round-dots" aria-label="本輪進度">';
      for (var i = 0; i < r.size; i++) {
        var cls = i < r.results.length ? (r.results[i] ? 'ok' : 'bad') : (i === r.results.length ? 'cur' : '');
        html += '<span class="round-dot ' + cls + '"></span>';
      }
      html += '</div>';
      return html;
    }

    function renderQuestionCard() {
      var container = document.getElementById(QUIZ_CONTAINERS[session.mode]);
      if (!container || !qs) return;
      var q = qs.q;
      var t = typeOf(q);
      var r = session.round;
      var num = Math.min(r.results.length + (qs.answered ? 0 : 1), r.size);

      var html = renderDiffBar(session.mode);
      html += '<div class="quiz-card" id="quizCard">';

      html += '<div class="quiz-card-head">';
      html += '  <div class="quiz-meta-info">';
      html += '    <span class="quiz-pill-badge">' + (session.review ? '複習 ' : '第 ') + num + ' / ' + r.size + ' 題</span>';
      if (session.mode === 'mixed' || session.mode === 'mistakes') {
        html += '    <span class="quiz-type-badge type-' + t + '">' + TYPE_META[t].icon + ' ' + TYPE_META[t].label + '</span>';
      }
      var d = q.difficulty || 2;
      html += '    <span class="diff-badge diff-' + d + '" title="難度">' + DIFF_META[d].stars + ' ' + DIFF_META[d].label + '</span>';
      if (t === 'char' && q.category) html += '    <span class="quiz-cat-badge">' + esc(q.category) + '</span>';
      html += '  </div>';
      html += '  <div class="quiz-mode-switch" role="group" aria-label="切換作答方式">';
      html += '    <button type="button" class="mode-switch-btn ' + (inputMode === 'choice' ? 'active' : '') + '" data-mode="choice" aria-pressed="' + (inputMode === 'choice') + '">選擇題</button>';
      html += '    <button type="button" class="mode-switch-btn ' + (inputMode === 'fill' ? 'active' : '') + '" data-mode="fill" aria-pressed="' + (inputMode === 'fill') + '">填空題 +30</button>';
      html += '  </div>';
      html += '</div>';

      html += roundDots();
      html += '<div id="quizPromptBox">' + renderPrompt() + '</div>';

      html += '<div class="quiz-interactive-zone" id="quizInteractiveZone">';
      html += inputMode === 'choice' ? renderChoiceOptions() : renderFillInInputs();
      html += '</div>';

      html += '<div class="lifeline-row" id="lifelineRow">';
      html += ttsButton('ttsSpeakQuestionBtn', '念題目');
      if (inputMode === 'choice') {
        html += '<button type="button" class="lifeline-btn" id="fiftyBtn"' + (qs.fiftyUsed || qs.answered ? ' disabled' : '') + ' title="刪去兩個錯誤選項（本題 −40 XP）">✂️ 刪去兩個錯誤選項 <small>−40</small></button>';
      }
      html += '<span class="kbd-hint">鍵盤：1–4 作答 · Enter 下一題 · S 朗讀</span>';
      html += '</div>';

      html += '<div class="quiz-result-feedback" id="quizFeedbackBox" hidden></div>';
      html += '</div>';

      container.innerHTML = html;
      bindDiffBar(container, session.mode);
      bindQuizCardEvents(container);
    }

    function renderPrompt() {
      var q = qs.q;
      var t = typeOf(q);
      var html = '';
      if (t === 'verse') {
        html += '<div class="quiz-prompt-box verse-prompt-box">';
        html += '  <div class="verse-ref-title">📖 ' + esc(q.ref) + '</div>';
        html += '  <div class="verse-cloze-text">' + esc(qs.answered ? q.fullText : q.blankText).replace(/【[_＿]+】/g, '<span class="quiz-blank-word">【　？　】</span>') + '</div>';
        html += '  <div class="quiz-clue-hint">💡 提示：' + esc(q.hint) + '</div>';
        html += '</div>';
        return html;
      }
      var total = q.clues.length;
      var shown = qs.answered ? total : qs.revealed;
      html += '<div class="quiz-prompt-box">';
      html += '  <div class="clue-list-heading"><span>🔎 猜猜這是' + TYPE_META[t].ask + '？</span>';
      html += '    <span class="clue-count">線索 ' + shown + ' / ' + total + '</span></div>';
      html += '  <ol class="clues-ordered-list">';
      q.clues.forEach(function (clue, idx) {
        if (idx < shown) {
          html += '<li class="clue-item' + (idx === shown - 1 && !qs.answered && idx > 0 ? ' clue-new' : '') + '"><span class="clue-num">' + (idx + 1) + '</span><span class="clue-content">' + esc(clue) + '</span></li>';
        } else {
          html += '<li class="clue-item clue-locked"><span class="clue-num">🔒</span><span class="clue-content">第 ' + (idx + 1) + ' 條線索' + (idx === shown ? '（越少線索答對，經驗值越高）' : '') + '</span></li>';
        }
      });
      html += '  </ol>';
      if (!qs.answered && shown < total) {
        var nextBonus = CLUE_BONUS[shown] || 0;
        html += '  <div class="clue-actions">';
        html += '    <button type="button" class="clue-reveal-btn" id="revealClueBtn">💡 再給一條線索 <small>（本題獎勵 ' + (nextBonus >= 0 ? '+' : '') + nextBonus + '）</small></button>';
        html += '    <button type="button" class="clue-reveal-all" id="revealAllBtn">全部顯示</button>';
        html += '  </div>';
      }
      html += '</div>';
      return html;
    }

    function renderChoiceOptions() {
      var target = answerOf(qs.q);
      var html = '<div class="quiz-options-grid">';
      qs.choices.forEach(function (opt, idx) {
        var removed = qs.removed.indexOf(opt) !== -1;
        var cls = 'quiz-opt-btn';
        if (removed) cls += ' removed';
        if (qs.answered && opt === target) cls += ' correct';
        if (qs.answered && opt === qs.pick && opt !== target) cls += ' wrong';
        html += '<button type="button" class="' + cls + '" data-answer="' + esc(opt) + '"' + (removed || qs.answered ? ' disabled' : '') + '>';
        html += '  <span class="opt-label">' + 'ABCD'.charAt(idx) + '</span>';
        html += '  <span class="opt-text">' + esc(opt) + '</span>';
        html += '</button>';
      });
      html += '</div>';
      return html;
    }

    // 字磚：答案用字＋同題型其他答案的字作干擾，比隨機字更有鑑別度
    function buildCharBank(q) {
      var target = answerOf(q);
      var bank = target.split('');
      var size = Math.max(12, target.length + 6);
      var pool = [];
      listOf(typeOf(q)).forEach(function (x) {
        if (x !== q) pool = pool.concat(answerOf(x).split(''));
      });
      pool = shuffle(pool);
      for (var i = 0; i < pool.length && bank.length < size; i++) {
        var ch = pool[i];
        if (/[\s，、]/.test(ch)) continue;
        if (bank.indexOf(ch) === -1) bank.push(ch);
      }
      return shuffle(bank);
    }

    function renderFillInInputs() {
      var q = qs.q;
      var len = answerOf(q).length;
      var html = '<div class="fill-in-container">';
      html += '  <div class="fill-input-row">';
      html += '    <input type="text" id="fillTextInput" class="fill-text-input" placeholder="請輸入答案（共 ' + len + ' 個字）" autocomplete="off" spellcheck="false" maxlength="24" enterkeyhint="done"' + (qs.answered ? ' disabled' : '') + '>';
      html += '    <button type="button" id="fillSubmitBtn" class="btn btn-primary fill-submit-btn"' + (qs.answered ? ' disabled' : '') + '>送出 ↵</button>';
      html += '  </div>';
      html += '  <div class="fill-slots" aria-hidden="true">';
      for (var i = 0; i < len; i++) html += '<span class="fill-slot"></span>';
      html += '  </div>';
      html += '  <div class="fill-tools-row">';
      html += '    <button type="button" class="fill-tool-chip" id="fillHintCharBtn">💡 提示首字 <small>−30</small></button>';
      html += '    <button type="button" class="fill-tool-chip" id="fillBackspaceBtn">⌫ 退格</button>';
      html += '    <button type="button" class="fill-tool-chip" id="fillClearBtn">✕ 清空</button>';
      html += '  </div>';
      html += '  <div class="fill-char-bank-title">點按字磚快速輸入：</div>';
      html += '  <div class="fill-char-bank" id="fillCharBank">';
      buildCharBank(q).forEach(function (ch) {
        html += '<button type="button" class="char-tile-btn" data-char="' + esc(ch) + '">' + esc(ch) + '</button>';
      });
      html += '  </div>';
      html += '</div>';
      return html;
    }

    function syncFillSlots(input) {
      var root = quizRoot();
      if (!root) return;
      var slots = root.querySelectorAll('.fill-slot');
      var val = norm(input.value);
      slots.forEach(function (s, i) {
        s.textContent = val.charAt(i) || '';
        s.classList.toggle('filled', !!val.charAt(i));
      });
    }

    function bindQuizCardEvents(container) {
      var q = qs.q;

      var speakBtn = container.querySelector('#ttsSpeakQuestionBtn');
      if (speakBtn) {
        speakBtn.addEventListener('click', function () { speakCurrentQuestion(this); });
      }

      container.querySelectorAll('.mode-switch-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
          SoundEngine.playClick();
          setInputMode(this.getAttribute('data-mode'));
        });
      });

      bindPromptEvents(container);

      container.querySelectorAll('.quiz-opt-btn').forEach(function (btn) {
        btn.addEventListener('click', function () {
          if (qs.answered || this.disabled) return;
          evaluateAnswer(this.getAttribute('data-answer'));
        });
      });

      var fifty = container.querySelector('#fiftyBtn');
      if (fifty) {
        fifty.addEventListener('click', function () {
          if (qs.answered || qs.fiftyUsed) return;
          var target = answerOf(q);
          var wrongs = shuffle(qs.choices.filter(function (c) { return c !== target; }));
          qs.removed = wrongs.slice(0, 2);
          qs.fiftyUsed = true;
          SoundEngine.playReveal();
          var zone = document.getElementById('quizInteractiveZone');
          if (zone) {
            zone.innerHTML = renderChoiceOptions();
            zone.querySelectorAll('.quiz-opt-btn').forEach(function (btn) {
              btn.addEventListener('click', function () {
                if (qs.answered || this.disabled) return;
                evaluateAnswer(this.getAttribute('data-answer'));
              });
            });
          }
          this.disabled = true;
        });
      }

      var fillInput = container.querySelector('#fillTextInput');
      var submitBtn = container.querySelector('#fillSubmitBtn');
      if (fillInput && submitBtn) {
        submitBtn.addEventListener('click', function () {
          if (qs.answered) return;
          var val = fillInput.value.trim();
          if (!val) {
            fillInput.focus();
            return;
          }
          evaluateAnswer(val);
        });
        fillInput.addEventListener('keydown', function (e) {
          // 中文輸入法選字時的 Enter 不送出
          if (e.key === 'Enter' && !e.isComposing && e.keyCode !== 229) {
            e.preventDefault();
            submitBtn.click();
          }
        });
        fillInput.addEventListener('input', function () { syncFillSlots(fillInput); });
      }

      container.querySelectorAll('.char-tile-btn').forEach(function (tile) {
        tile.addEventListener('click', function () {
          if (qs.answered || !fillInput) return;
          SoundEngine.playClick();
          fillInput.value += this.getAttribute('data-char');
          syncFillSlots(fillInput);
        });
      });

      var backspaceBtn = container.querySelector('#fillBackspaceBtn');
      if (backspaceBtn && fillInput) {
        backspaceBtn.addEventListener('click', function () {
          SoundEngine.playClick();
          fillInput.value = Array.from(fillInput.value).slice(0, -1).join('');
          syncFillSlots(fillInput);
        });
      }

      var clearBtn = container.querySelector('#fillClearBtn');
      if (clearBtn && fillInput) {
        clearBtn.addEventListener('click', function () {
          SoundEngine.playClick();
          fillInput.value = '';
          syncFillSlots(fillInput);
        });
      }

      var hintCharBtn = container.querySelector('#fillHintCharBtn');
      if (hintCharBtn && fillInput) {
        hintCharBtn.addEventListener('click', function () {
          var target = answerOf(q);
          if (!target || qs.answered) return;
          SoundEngine.playReveal();
          qs.hintUsed = true;
          if (norm(fillInput.value).indexOf(target.charAt(0)) !== 0) fillInput.value = target.charAt(0);
          syncFillSlots(fillInput);
          fillInput.focus();
        });
      }
    }

    function bindPromptEvents(container) {
      var revealBtn = container.querySelector('#revealClueBtn');
      if (revealBtn) {
        revealBtn.addEventListener('click', function () {
          if (qs.answered) return;
          qs.revealed = Math.min(qs.q.clues.length, qs.revealed + 1);
          SoundEngine.playReveal();
          refreshPrompt();
          // 只念新線索，不必從頭再聽一次
          if (SpeechEngine.isAuto()) SpeechEngine.speak('線索' + '一二三四五'.charAt(qs.revealed - 1) + '：' + qs.q.clues[qs.revealed - 1], null);
        });
      }
      var allBtn = container.querySelector('#revealAllBtn');
      if (allBtn) {
        allBtn.addEventListener('click', function () {
          if (qs.answered) return;
          qs.revealed = qs.q.clues.length;
          SoundEngine.playReveal();
          refreshPrompt();
        });
      }
    }

    function refreshPrompt() {
      var box = document.getElementById('quizPromptBox');
      if (!box) return;
      box.innerHTML = renderPrompt();
      bindPromptEvents(box);
    }

    function computeXp() {
      var q = qs.q;
      var parts = [['基礎', session.review ? 120 : 100]];
      if (typeOf(q) !== 'verse') {
        var bonus = CLUE_BONUS[qs.revealed - 1] || 0;
        if (bonus) parts.push([bonus > 0 ? '線索 ' + qs.revealed + '/' + q.clues.length : '線索全開', bonus]);
      }
      if (inputMode === 'fill') parts.push(['填空', 30]);
      if (qs.hintUsed) parts.push(['提示首字', -30]);
      if (qs.fiftyUsed) parts.push(['刪去兩項', -40]);
      var sum = 0;
      parts.forEach(function (p) { sum += p[1]; });
      return { sum: Math.max(30, sum), parts: parts };
    }

    function evaluateAnswer(userVal) {
      if (!qs || qs.answered) return;
      var q = qs.q;
      var target = answerOf(q);
      var clean = norm(userVal);
      var ok = clean === norm(target) || (q.aliases || []).some(function (a) { return clean === norm(a); });

      qs.answered = true;
      qs.pick = userVal;
      var firstClue = typeOf(q) !== 'verse' && qs.revealed === 1;

      var res = StateManager.recordAnswer(q, ok, userVal, { mixed: session.mode === 'mixed', firstClue: ok && firstClue });
      var xp = null;
      var earned = 0;
      if (ok) {
        SoundEngine.playCorrect();
        xp = computeXp();
        earned = StateManager.addScore(xp.sum);
        if (StateManager.get().streak >= 3) ConfettiEngine.fire(40);
      } else {
        SoundEngine.playWrong();
        var card = document.getElementById('quizCard');
        if (card) {
          card.classList.remove('shake');
          void card.offsetWidth;
          card.classList.add('shake');
        }
      }

      var r = session.round;
      r.results.push(ok);
      r.xp += earned;
      r.streak = ok ? r.streak + 1 : 0;
      if (r.streak > r.bestStreak) r.bestStreak = r.streak;
      if (!ok) r.wrongIds.push(q.id);

      // 作答後：顯示所有線索、標出正解、鎖定工具
      refreshPrompt();
      var zone = document.getElementById('quizInteractiveZone');
      if (zone && inputMode === 'choice') zone.innerHTML = renderChoiceOptions();
      if (inputMode === 'fill') {
        var input = document.getElementById('fillTextInput');
        if (input) {
          input.disabled = true;
          input.classList.add(ok ? 'is-correct' : 'is-wrong');
        }
        var sb = document.getElementById('fillSubmitBtn');
        if (sb) sb.disabled = true;
        var root = quizRoot();
        if (root) root.querySelectorAll('.char-tile-btn, .fill-tool-chip').forEach(function (b) { b.disabled = true; });
      }
      var fifty = document.getElementById('fiftyBtn');
      if (fifty) fifty.disabled = true;
      var dots = document.querySelector('#quizCard .round-dots');
      if (dots) dots.outerHTML = roundDots();

      renderFeedbackCard(ok, q, userVal, earned, xp, res);

      if (res.goalReached) setTimeout(celebrateGoal, 700);

      if (SpeechEngine.isAuto()) {
        setTimeout(function () {
          SpeechEngine.speak(SpeechEngine.answerText(q, userVal, ok), document.getElementById('ttsSpeakAnswerBtn'));
        }, 500);
      }
    }

    function memoryHook(q) {
      if (q.tip) return q.tip;
      var t = typeOf(q);
      if (t === 'verse') {
        return '默念三遍「' + q.ref + '」→「' + q.answer + '」，再閉上眼睛試著背出整節經文。';
      }
      if (q.nameMeaning) {
        return '把「' + answerOf(q) + '」和字義「' + q.nameMeaning.replace(/\s*\([^)]*\)/g, '') + '」連在一起記，再配上一個畫面：' + q.clues[q.clues.length - 1].slice(0, 28) + '…';
      }
      return '用一句話說出「' + answerOf(q) + '」最關鍵的事蹟，並和相似的選項作對比。';
    }

    function reviewLine(res) {
      if (!res || !res.review) return '';
      var rv = res.review;
      var total = StateManager.intervals.length;
      if (rv.status === 'added') {
        return '<div class="review-line review-added">📥 已收入錯題本：將在稍後、1 天後、3 天後安排間隔複習，三次答對就算掌握。</div>';
      }
      if (rv.status === 'advanced') {
        return '<div class="review-line review-up">📈 間隔複習進度 ' + rv.box + ' / ' + total + ' ✓ · 下次複習：' + relTime(rv.due) + '</div>';
      }
      if (rv.status === 'mastered') {
        return '<div class="review-line review-done">🏆 恭喜！這題已透過間隔複習完全掌握，從錯題本畢業。</div>';
      }
      if (rv.status === 'early') {
        return '<div class="review-line review-early">⏰ 這題的下次複習在 ' + relTime(rv.due) + '，提前練習不計入進度（間隔越恰當，記得越久）。</div>';
      }
      return '';
    }

    function renderFeedbackCard(ok, q, userVal, earned, xp, res) {
      var box = document.getElementById('quizFeedbackBox');
      if (!box) return;
      var t = typeOf(q);
      var target = answerOf(q);
      var s = StateManager.get();
      var mult = StateManager.getComboMultiplier();

      var html = '<div class="feedback-card ' + (ok ? 'fb-correct' : 'fb-wrong') + '">';
      html += '<div class="fb-header">';
      html += '  <span class="fb-title">' + (ok ? '🎉 答對了！+' + earned + ' XP' : '💡 差一點點！一起弄清楚') + (ok && s.streak > 1 ? ' · 🔥 ' + s.streak + ' 連勝' : '') + '</span>';
      html += ttsButton('ttsSpeakAnswerBtn', '朗讀答案與解說');
      html += '</div>';

      if (ok && xp) {
        html += '<div class="xp-breakdown">';
        xp.parts.forEach(function (p) {
          html += '<span class="xp-chip' + (p[1] < 0 ? ' neg' : '') + '">' + esc(p[0]) + ' ' + (p[1] >= 0 ? '+' : '') + p[1] + '</span>';
        });
        if (mult > 1) html += '<span class="xp-chip combo">⚡ 連擊 ×' + mult + '</span>';
        html += '</div>';
      }

      if (!ok) {
        html += '<div class="mistake-clarify-box">';
        html += '  <div class="mistake-clarify-title"><span>❌</span> 你的作答：<strong>「' + esc(userVal || '未填寫') + '」</strong>　✅ 正確答案：<strong>「' + esc(target) + '」</strong></div>';
        html += '  <div class="mistake-clarify-content"><strong>💡 易混淆辨析：</strong>' + esc(q.mistakeExplanation || '請留意線索中的原文字義、歷史時代與關鍵事蹟，區分同時代的其他人物或事件。') + '</div>';
        var other = t !== 'verse' ? findByName(userVal, t) : null;
        if (other && other !== q && testament(other) === testament(q)) {
          html += '  <div class="contrast-card">';
          html += '    <div class="contrast-title">🔁 對照記憶：你選的「' + esc(answerOf(other)) + '」是誰／哪裡？</div>';
          html += '    <div class="contrast-body"><strong>' + esc(answerOf(other)) + '</strong>' + (other.nameMeaning ? '（' + esc(other.nameMeaning) + '）' : '') + '：' + esc(other.clues[0]) + '</div>';
          html += '  </div>';
        }
        html += '  <div class="memory-hook-box"><div class="memory-hook-title">🎯 記憶鉤</div><div>' + esc(memoryHook(q)) + '</div></div>';
        html += '</div>';
      }

      html += reviewLine(res);

      html += '<div class="fb-body">';
      html += '  <div class="fb-target-row"><span class="fb-label">標準答案：</span><strong class="fb-target-name">' + esc(target) + '</strong>';
      if (q.nameMeaning) html += '<span class="fb-name-meaning">（' + esc(q.nameMeaning) + '）</span>';
      html += '  </div>';
      if (q.era) html += '  <div class="fb-info-row"><span class="fb-label">歷史時代：</span>' + esc(q.era) + '</div>';
      if (q.region) html += '  <div class="fb-info-row"><span class="fb-label">地理位置：</span>' + esc(q.region) + '</div>';
      var descText = q.bio || q.notes || q.meaning || '';
      if (descText) html += '  <p class="fb-desc-text">' + esc(descText) + '</p>';
      if (t === 'verse') {
        html += '  <div class="fb-verse-box"><div class="fb-verse-ref">📜 ' + esc(q.ref) + '</div><div class="fb-verse-text">「' + esc(q.fullText) + '」</div></div>';
      } else if (q.verseRef && q.verseText) {
        html += '  <div class="fb-verse-box"><div class="fb-verse-ref">📜 ' + esc(q.verseRef) + '</div><div class="fb-verse-text">「' + esc(q.verseText) + '」</div></div>';
      }
      html += '</div>';

      var roundDone = session.round.results.length >= session.round.size;
      html += '<div class="fb-actions-row">';
      var link = readerLink(q);
      if (link) {
        html += '<a href="' + link + '" target="_blank" rel="noopener" class="btn btn-sm btn-ghost fb-read-link">📖 在 Biblia 中讀這段經文 ↗</a>';
      }
      html += '<button type="button" id="nextQuestionBtn" class="btn btn-primary fb-next-btn">' + (roundDone ? '查看本輪成績 🏁' : '下一題 →') + '</button>';
      html += '</div>';
      html += '</div>';

      box.innerHTML = html;
      box.hidden = false;

      var speakAnsBtn = box.querySelector('#ttsSpeakAnswerBtn');
      if (speakAnsBtn) {
        speakAnsBtn.addEventListener('click', function () {
          SpeechEngine.toggle(SpeechEngine.answerText(q, userVal, ok), this);
        });
      }

      var nextBtn = box.querySelector('#nextQuestionBtn');
      if (nextBtn) {
        nextBtn.addEventListener('click', goNext);
        try { nextBtn.focus({ preventScroll: true }); } catch (e) { nextBtn.focus(); }
      }
      if (box.scrollIntoView) {
        setTimeout(function () { box.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }, 60);
      }
    }

    function goNext() {
      SoundEngine.playClick();
      SpeechEngine.stop();
      if (session.round.results.length >= session.round.size) {
        renderRoundSummary();
        return;
      }
      session.idx++;
      showQuestion();
    }

    // ========================================================
    // 9. 一輪結算 (Round Summary)
    // ========================================================
    function renderRoundSummary() {
      var container = document.getElementById(QUIZ_CONTAINERS[session.mode]);
      if (!container) return;
      var r = session.round;
      var correct = r.results.filter(Boolean).length;
      var acc = r.size ? Math.round(correct / r.size * 100) : 0;
      var stars = acc >= 90 ? 3 : acc >= 70 ? 2 : acc >= 40 ? 1 : 0;
      var bonus = 0;
      if (correct === r.size && r.size >= 5 && !session.review) {
        bonus = StateManager.addScore(100, true);
        StateManager.recordPerfectRound();
      }
      if (stars >= 2) SoundEngine.playWin();
      if (stars === 3) ConfettiEngine.fire(120);

      var praise = ['再接再厲，每一題錯誤都是記憶的機會！', '有進步！把錯題複習一遍會更穩。', '很不錯！你已經掌握大部分重點。', '太精彩了！神的話豐豐富富存在你心裡。'][stars];
      var tip = randomTip();

      var html = '<div class="quiz-card round-summary">';
      html += '<div class="rs-stars" aria-label="' + stars + ' 顆星">' + [1, 2, 3].map(function (i) { return '<span class="rs-star' + (i <= stars ? ' on' : '') + '">★</span>'; }).join('') + '</div>';
      html += '<h3 class="rs-title">' + (session.review ? '本次複習完成' : '本輪挑戰完成') + '</h3>';
      html += '<p class="rs-praise">' + praise + '</p>';
      html += '<div class="rs-stats">';
      html += '  <div class="rs-stat"><b>' + correct + ' / ' + r.size + '</b><span>答對</span></div>';
      html += '  <div class="rs-stat"><b>' + acc + '%</b><span>正確率</span></div>';
      html += '  <div class="rs-stat"><b>+' + (r.xp + bonus) + '</b><span>獲得 XP</span></div>';
      html += '  <div class="rs-stat"><b>' + r.bestStreak + '</b><span>最佳連勝</span></div>';
      html += '</div>';
      if (bonus) html += '<div class="review-line review-done">💯 全對通關獎勵 +' + bonus + ' XP！</div>';
      if (r.wrongIds.length) {
        html += '<div class="rs-wrong"><div class="rs-wrong-title">📝 已加入錯題本，稍後用間隔複習鞏固：</div><div class="rs-wrong-list">';
        r.wrongIds.forEach(function (id) {
          var q = QINDEX[id];
          if (q) html += '<span class="rs-wrong-chip">' + TYPE_META[typeOf(q)].icon + ' ' + esc(typeOf(q) === 'verse' ? q.ref : answerOf(q)) + '</span>';
        });
        html += '</div></div>';
      }
      if (tip) {
        html += '<div class="rs-tip"><span class="tip-icon">' + tip.icon + '</span><div><strong>學習小錦囊・' + esc(tip.title) + '</strong><p>' + esc(tip.text) + '</p></div></div>';
      }
      html += '<div class="rs-actions">';
      if (session.review) {
        html += '<button type="button" class="btn btn-primary" id="rsAgainBtn">回到錯題本 →</button>';
      } else {
        html += '<button type="button" class="btn btn-primary" id="rsAgainBtn">再來一輪 🔄</button>';
        var due = StateManager.dueMistakes().length;
        if (due) html += '<button type="button" class="btn btn-ghost" id="rsReviewBtn">📝 複習錯題（' + due + '）</button>';
      }
      html += '</div>';
      html += '</div>';
      container.innerHTML = html;

      var again = container.querySelector('#rsAgainBtn');
      if (again) {
        again.addEventListener('click', function () {
          SoundEngine.playClick();
          if (session.review) renderMistakesHome();
          else startQuiz(session.mode);
        });
        try { again.focus({ preventScroll: true }); } catch (e) {}
      }
      var rev = container.querySelector('#rsReviewBtn');
      if (rev) {
        rev.addEventListener('click', function () {
          switchTab('mistakes');
          startReview(false);
        });
      }
      qs = null;
      if (container.scrollIntoView) container.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // ========================================================
    // 10. 錯題本：間隔重複 (Leitner Spaced Repetition)
    // ========================================================
    function renderMistakesHome() {
      var container = document.getElementById('mistakesQuizContainer');
      if (!container) return;
      session = null;
      qs = null;
      var s = StateManager.get();
      var mistakes = StateManager.getMistakes().slice().sort(function (a, b) { return a.due - b.due; });
      var due = StateManager.dueMistakes();
      var boxes = [0, 0, 0];
      mistakes.forEach(function (m) { boxes[Math.min(2, m.box)]++; });

      var html = '<div class="srs-dashboard">';
      html += '<div class="srs-head"><h3>📝 錯題複習本 <small>間隔重複記憶法</small></h3>';
      html += '<p>答錯的題目會放進第 1 格，之後在 <b>當天</b>、<b>1 天後</b>、<b>3 天後</b> 各複習一次；每答對一次往前移一格，三格都過關就「完全掌握」。這是對抗遺忘曲線最有效的方法。</p></div>';

      html += '<div class="srs-boxes">';
      var boxLabels = ['第 1 格 · 今天', '第 2 格 · 1 天後', '第 3 格 · 3 天後'];
      boxes.forEach(function (n, i) {
        html += '<div class="srs-box box-' + (i + 1) + '"><span class="srs-box-n">' + n + '</span><span class="srs-box-label">📦 ' + boxLabels[i] + '</span></div>';
      });
      html += '<div class="srs-box box-done"><span class="srs-box-n">' + s.masteredCount + '</span><span class="srs-box-label">🏆 已掌握</span></div>';
      html += '</div>';

      if (!mistakes.length) {
        html += '<div class="srs-empty"><div class="empty-icon">🌟</div>';
        html += '<h4>目前沒有待複習的錯題！</h4>';
        html += '<p>做題時答錯的題目會自動收進這裡，並依照記憶科學安排複習時間。</p>';
        html += '<div class="srs-actions"><button type="button" class="btn btn-primary" data-go="mixed">🎲 來一輪綜合挑戰 →</button>';
        html += '<button type="button" class="btn btn-ghost" data-go="verse">📜 經文填空</button></div></div>';
      } else {
        html += '<div class="srs-actions">';
        html += '<button type="button" class="btn btn-primary" id="srsStartBtn"' + (due.length ? '' : ' disabled') + '>' + (due.length ? '開始複習（' + due.length + ' 題到期）→' : '今天的複習都完成了 ✓') + '</button>';
        html += '<button type="button" class="btn btn-ghost" id="srsPracticeBtn">提前練習全部（不計進度）</button>';
        html += '</div>';
        html += '<ul class="srs-list">';
        mistakes.forEach(function (m) {
          var q = QINDEX[m.id];
          if (!q) return;
          var t = typeOf(q);
          var isDue = m.due <= Date.now();
          html += '<li class="srs-item' + (isDue ? ' is-due' : '') + '">';
          html += '<span class="srs-item-icon">' + TYPE_META[t].icon + '</span>';
          html += '<span class="srs-item-name">' + esc(t === 'verse' ? q.ref : answerOf(q)) + '</span>';
          html += '<span class="srs-item-box" title="複習進度">' + [0, 1, 2].map(function (i) { return '<i class="' + (i < m.box ? 'on' : '') + '"></i>'; }).join('') + '</span>';
          html += '<span class="srs-item-due">' + (isDue ? '⏰ 現在複習' : '下次：' + relTime(m.due)) + '</span>';
          html += '<span class="srs-item-wrong">錯 ' + m.wrong + ' 次</span>';
          html += '</li>';
        });
        html += '</ul>';
      }
      html += '</div>';
      container.innerHTML = html;

      var startBtn = container.querySelector('#srsStartBtn');
      if (startBtn) startBtn.addEventListener('click', function () { SoundEngine.playClick(); startReview(false); });
      var practiceBtn = container.querySelector('#srsPracticeBtn');
      if (practiceBtn) practiceBtn.addEventListener('click', function () { SoundEngine.playClick(); startReview(true); });
      container.querySelectorAll('[data-go]').forEach(function (b) {
        b.addEventListener('click', function () { switchTab(this.getAttribute('data-go')); });
      });
    }

    function handleGlobalKeydown(e) {
      var tag = e.target && e.target.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (!quizActive()) return;
      if (elements.achievementsModal && !elements.achievementsModal.hidden) return;

      if (inputMode === 'choice' && !qs.answered && ['1', '2', '3', '4'].indexOf(e.key) !== -1) {
        var btn = quizRoot().querySelectorAll('.quiz-opt-btn')[parseInt(e.key, 10) - 1];
        if (btn && !btn.disabled) btn.click();
      } else if (qs.answered && (e.key === ' ' || e.key === 'Enter')) {
        var nextBtn = document.getElementById('nextQuestionBtn');
        if (nextBtn && e.target !== nextBtn) {
          e.preventDefault();
          nextBtn.click();
        }
      } else if (e.key === 's' || e.key === 'S') {
        if (qs.answered) {
          var ab = document.getElementById('ttsSpeakAnswerBtn');
          if (ab) ab.click();
        } else {
          speakCurrentQuestion();
        }
      }
    }

    // ========================================================
    // 11. 聖經十字填字 (Crossword Engine)
    // ========================================================
    var cw = null; // { level, cells, nums, active, attempts }

    function cwProgress(id) {
      var s = StateManager.get();
      if (!s.cwProgress[id]) s.cwProgress[id] = { solved: [], revealed: [], hints: {} };
      var p = s.cwProgress[id];
      p.solved = p.solved || [];
      p.revealed = p.revealed || [];
      p.hints = p.hints || {};
      return p;
    }

    function wordCells(w) {
      var out = [];
      for (var k = 0; k < w.answer.length; k++) {
        out.push((w.dir === 'down' ? w.r + k : w.r) + '_' + (w.dir === 'across' ? w.c + k : w.c));
      }
      return out;
    }

    function buildCrossword(level) {
      var cells = {};
      level.words.forEach(function (w, i) {
        wordCells(w).forEach(function (key, k) {
          var cell = cells[key] || (cells[key] = { ch: w.answer.charAt(k), words: [] });
          cell.words.push(i);
        });
      });
      var nums = [];
      var numAt = {};
      var n = 0;
      level.words.map(function (w, i) { return { i: i, r: w.r, c: w.c }; })
        .sort(function (a, b) { return (a.r - b.r) || (a.c - b.c); })
        .forEach(function (s) {
          var key = s.r + '_' + s.c;
          if (!numAt[key]) numAt[key] = ++n;
          nums[s.i] = numAt[key];
        });
      return { cells: cells, nums: nums, numAt: numAt };
    }

    function initCrosswordMode(levelId) {
      var levels = db().crosswords || [];
      if (!levels.length) return;
      var s = StateManager.get();
      var id = levelId || (cw && cw.level.id) || s.settings.lastCw;
      var level = levels.filter(function (l) { return l.id === id; })[0];
      if (!level) {
        // 預設跳到第一個尚未完成的關卡
        level = levels.filter(function (l) { return !s.crosswordsSolved[l.id]; })[0] || levels[0];
      }
      StateManager.setSetting('lastCw', level.id);
      var built = buildCrossword(level);
      cw = { level: level, cells: built.cells, nums: built.nums, numAt: built.numAt, active: -1, attempts: {} };
      var p = cwProgress(level.id);
      cw.active = firstUnsolved(p);
      renderCrosswordUI();
    }

    function firstUnsolved(p, after) {
      var order = cw.level.words.map(function (w, i) { return i; }).sort(function (a, b) {
        return (cw.nums[a] - cw.nums[b]) || (cw.level.words[a].dir === 'across' ? -1 : 1);
      });
      var start = after != null ? order.indexOf(after) + 1 : 0;
      for (var k = 0; k < order.length; k++) {
        var i = order[(start + k) % order.length];
        if (p.solved.indexOf(i) === -1) return i;
      }
      return -1;
    }

    function knownChar(key, p) {
      var cell = cw.cells[key];
      if (!cell) return '';
      var solved = cell.words.some(function (i) { return p.solved.indexOf(i) !== -1; });
      return solved || p.revealed.indexOf(key) !== -1 ? cell.ch : '';
    }

    function renderCrosswordUI() {
      var container = document.getElementById('crosswordAppContainer');
      if (!container || !cw) return;
      var level = cw.level;
      var levels = db().crosswords || [];
      var s = StateManager.get();
      var p = cwProgress(level.id);
      var total = level.words.length;
      var done = p.solved.length;

      var html = '<div class="cw-app-shell">';
      html += '<div class="cw-header-bar">';
      html += '  <div class="cw-title-group"><h3 class="cw-title">🧩 ' + esc(level.title) + '</h3><span class="cw-desc">' + esc(level.desc) + '</span></div>';
      html += '  <div class="cw-level-selector"><select id="cwLevelSelect" class="cw-level-select" aria-label="選擇填字關卡">';
      levels.forEach(function (l, idx) {
        html += '<option value="' + l.id + '"' + (l.id === level.id ? ' selected' : '') + '>' + (s.crosswordsSolved[l.id] ? '✓ ' : '') + '關卡 ' + (idx + 1) + '：' + esc(l.title.replace(/^第.關：/, '')) + '</option>';
      });
      html += '  </select></div>';
      html += '</div>';

      html += '<div class="cw-progress"><div class="cw-progress-track"><div class="cw-progress-fill" style="width:' + Math.round(done / total * 100) + '%"></div></div>';
      html += '<span class="cw-progress-text">已解 ' + done + ' / ' + total + ' 詞</span></div>';

      html += '<div class="cw-tools-bar">';
      html += '  <button type="button" class="cw-tool-btn" id="cwHintBtn">💡 提示一個字 <small>−10</small></button>';
      html += '  <button type="button" class="cw-tool-btn" id="cwResetBtn">🔄 重新開始</button>';
      html += '  <button type="button" class="cw-tool-btn btn-ghost" id="cwSolveBtn">揭曉全部答案</button>';
      html += '</div>';

      html += '<div class="cw-layout-body">';
      html += '  <div class="cw-grid-wrap">' + renderCrosswordGrid(p) + '</div>';
      html += '  <div class="cw-side">';
      html += '    <div class="cw-answer-bar" id="cwAnswerBar">' + renderAnswerBar(p) + '</div>';
      html += '    <div class="cw-clues-wrap">';
      ['across', 'down'].forEach(function (dir) {
        var items = level.words.map(function (w, i) { return i; }).filter(function (i) { return level.words[i].dir === dir; })
          .sort(function (a, b) { return cw.nums[a] - cw.nums[b]; });
        if (!items.length) return;
        html += '<div class="cw-clues-column"><h4 class="cw-clue-heading">' + (dir === 'across' ? '橫向提示 →' : '縱向提示 ↓') + '</h4><ul class="cw-clue-list">';
        items.forEach(function (i) {
          var w = level.words[i];
          var solved = p.solved.indexOf(i) !== -1;
          html += '<li class="cw-clue-item' + (solved ? ' solved' : '') + (i === cw.active ? ' active' : '') + '" data-word="' + i + '">';
          html += '<span class="cw-clue-badge">' + cw.nums[i] + '</span>';
          html += '<span class="cw-clue-text">' + esc(w.clue) + '（' + w.answer.length + ' 字）';
          if (solved) html += '<span class="cw-clue-answer">✓ ' + esc(w.answer) + '</span>';
          html += '</span></li>';
        });
        html += '</ul></div>';
      });
      html += '    </div>';
      html += '  </div>';
      html += '</div>';
      html += '<div id="cwCompleteBox"></div>';
      html += '</div>';

      container.innerHTML = html;
      bindCrosswordEvents(container);
      if (done === total) renderCwComplete(false);
    }

    function renderCrosswordGrid(p) {
      var level = cw.level;
      var activeCells = cw.active >= 0 ? wordCells(level.words[cw.active]) : [];
      var html = '<div class="cw-board-grid" style="grid-template-columns: repeat(' + level.cols + ', 1fr); aspect-ratio: ' + level.cols + ' / ' + level.rows + '; max-width: ' + Math.min(460, level.cols * 54) + 'px;">';
      for (var r = 0; r < level.rows; r++) {
        for (var c = 0; c < level.cols; c++) {
          var key = r + '_' + c;
          var cell = cw.cells[key];
          if (!cell) {
            html += '<div class="cw-cell cw-block-cell" aria-hidden="true"></div>';
            continue;
          }
          var ch = knownChar(key, p);
          var solved = cell.words.some(function (i) { return p.solved.indexOf(i) !== -1; });
          var cls = 'cw-cell cw-active-cell';
          if (activeCells.indexOf(key) !== -1) cls += ' cw-word-highlight';
          if (solved) cls += ' cw-correct-cell';
          else if (ch) cls += ' cw-revealed-cell';
          html += '<button type="button" class="' + cls + '" data-key="' + key + '" aria-label="第 ' + (r + 1) + ' 列第 ' + (c + 1) + ' 格' + (ch ? '：' + ch : '') + '">';
          if (cw.numAt[key]) html += '<span class="cell-num">' + cw.numAt[key] + '</span>';
          html += '<span class="cell-letter">' + esc(ch) + '</span>';
          html += '</button>';
        }
      }
      html += '</div>';
      return html;
    }

    function cwBank(w) {
      var bank = w.answer.split('');
      var pool = [];
      cw.level.words.forEach(function (x) { if (x !== w) pool = pool.concat(x.answer.split('')); });
      pool = shuffle(pool);
      for (var i = 0; i < pool.length && bank.length < w.answer.length + 6; i++) {
        if (bank.indexOf(pool[i]) === -1) bank.push(pool[i]);
      }
      return shuffle(bank);
    }

    function renderAnswerBar(p) {
      if (cw.active < 0) {
        return '<div class="cw-ab-empty">🎉 所有詞都解出來了！</div>';
      }
      var w = cw.level.words[cw.active];
      var solved = p.solved.indexOf(cw.active) !== -1;
      var keys = wordCells(w);
      var html = '<div class="cw-ab-head">';
      html += '<span class="cw-clue-badge">' + cw.nums[cw.active] + '</span>';
      html += '<span class="cw-ab-dir">' + (w.dir === 'across' ? '橫向 →' : '縱向 ↓') + ' · ' + w.answer.length + ' 個字</span>';
      html += ttsButton('cwSpeakBtn', '念提示', 'tts-compact');
      html += '</div>';
      html += '<div class="cw-ab-clue">' + esc(w.clue) + '</div>';
      html += '<div class="cw-slots">';
      keys.forEach(function (k) {
        var ch = knownChar(k, p);
        html += '<span class="cw-slot' + (ch ? ' known' : '') + '">' + esc(ch) + '</span>';
      });
      html += '</div>';
      if (solved) {
        html += '<div class="cw-ab-solved">✓ 已解出：<strong>' + esc(w.answer) + '</strong><p>📖 ' + esc(w.info) + '</p></div>';
        html += '<button type="button" class="btn btn-sm btn-primary" id="cwNextWordBtn">下一個未解的詞 →</button>';
        return html;
      }
      html += '<div class="fill-input-row">';
      html += '<input type="text" id="cwInput" class="fill-text-input" placeholder="輸入 ' + w.answer.length + ' 個字的答案" autocomplete="off" spellcheck="false" maxlength="12" enterkeyhint="done">';
      html += '<button type="button" id="cwSubmitBtn" class="btn btn-primary fill-submit-btn">填入 ↵</button>';
      html += '</div>';
      html += '<div class="fill-tools-row"><button type="button" class="fill-tool-chip" id="cwBackBtn">⌫ 退格</button><button type="button" class="fill-tool-chip" id="cwClearBtn">✕ 清空</button></div>';
      html += '<div class="fill-char-bank">';
      cwBank(w).forEach(function (ch) {
        html += '<button type="button" class="char-tile-btn" data-char="' + esc(ch) + '">' + esc(ch) + '</button>';
      });
      html += '</div>';
      html += '<div class="cw-ab-msg" id="cwMsg" role="status"></div>';
      return html;
    }

    function selectWord(i, focus) {
      cw.active = i;
      renderCrosswordUI();
      if (focus) {
        var input = document.getElementById('cwInput');
        // 手機上不自動彈出鍵盤，避免遮住盤面
        if (input && window.matchMedia && window.matchMedia('(pointer: fine)').matches) input.focus();
      }
    }

    function bindCrosswordEvents(container) {
      var p = cwProgress(cw.level.id);

      var sel = container.querySelector('#cwLevelSelect');
      if (sel) {
        sel.addEventListener('change', function () {
          SoundEngine.playClick();
          SpeechEngine.stop();
          initCrosswordMode(this.value);
        });
      }

      container.querySelectorAll('.cw-active-cell').forEach(function (cellEl) {
        cellEl.addEventListener('click', function () {
          var key = this.getAttribute('data-key');
          var words = cw.cells[key].words;
          var pick = words[0];
          if (words.length > 1) {
            var curIdx = words.indexOf(cw.active);
            if (curIdx !== -1) {
              pick = words[(curIdx + 1) % words.length]; // 再點一次切換橫／縱
            } else {
              var unsolved = words.filter(function (i) { return p.solved.indexOf(i) === -1; });
              pick = unsolved[0] != null ? unsolved[0] : words[0];
            }
          }
          SoundEngine.playClick();
          selectWord(pick, true);
        });
      });

      container.querySelectorAll('.cw-clue-item').forEach(function (item) {
        item.addEventListener('click', function () {
          SoundEngine.playClick();
          selectWord(parseInt(this.getAttribute('data-word'), 10), true);
          var bar = document.getElementById('cwAnswerBar');
          if (bar && bar.scrollIntoView) bar.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        });
      });

      var speakBtn = container.querySelector('#cwSpeakBtn');
      if (speakBtn && cw.active >= 0) {
        speakBtn.addEventListener('click', function () {
          var w = cw.level.words[cw.active];
          var text = '第 ' + cw.nums[cw.active] + ' 題，' + (w.dir === 'across' ? '橫向' : '縱向') + '，' + w.answer.length + ' 個字。' + w.clue + '。';
          if (p.solved.indexOf(cw.active) !== -1) text += '答案是：' + w.answer + '。' + w.info;
          SpeechEngine.toggle(text, this);
        });
      }

      var input = container.querySelector('#cwInput');
      var submit = container.querySelector('#cwSubmitBtn');
      if (input && submit) {
        submit.addEventListener('click', function () { submitCwWord(input.value); });
        input.addEventListener('keydown', function (e) {
          if (e.key === 'Enter' && !e.isComposing && e.keyCode !== 229) {
            e.preventDefault();
            submitCwWord(input.value);
          }
        });
        input.addEventListener('input', function () { syncCwSlots(input.value); });
      }
      container.querySelectorAll('.cw-answer-bar .char-tile-btn').forEach(function (tile) {
        tile.addEventListener('click', function () {
          if (!input) return;
          SoundEngine.playClick();
          input.value += this.getAttribute('data-char');
          syncCwSlots(input.value);
        });
      });
      var back = container.querySelector('#cwBackBtn');
      if (back && input) {
        back.addEventListener('click', function () {
          input.value = Array.from(input.value).slice(0, -1).join('');
          syncCwSlots(input.value);
        });
      }
      var clear = container.querySelector('#cwClearBtn');
      if (clear && input) {
        clear.addEventListener('click', function () {
          input.value = '';
          syncCwSlots('');
        });
      }
      var nextWord = container.querySelector('#cwNextWordBtn');
      if (nextWord) {
        nextWord.addEventListener('click', function () {
          var n = firstUnsolved(p, cw.active);
          if (n >= 0) selectWord(n, true);
        });
      }

      var hintBtn = container.querySelector('#cwHintBtn');
      if (hintBtn) hintBtn.addEventListener('click', revealCwLetter);

      var resetBtn = container.querySelector('#cwResetBtn');
      if (resetBtn) {
        resetBtn.addEventListener('click', function () {
          if (!confirm('確定要清空本關進度、重新開始嗎？')) return;
          StateManager.get().cwProgress[cw.level.id] = { solved: [], revealed: [], hints: {} };
          StateManager.save();
          cw.attempts = {};
          cw.active = firstUnsolved(cwProgress(cw.level.id));
          SoundEngine.playClick();
          renderCrosswordUI();
        });
      }

      var solveBtn = container.querySelector('#cwSolveBtn');
      if (solveBtn) {
        solveBtn.addEventListener('click', function () {
          if (!confirm('揭曉全部答案後本關不計分、也不算完成。確定要看答案嗎？')) return;
          var prog = cwProgress(cw.level.id);
          Object.keys(cw.cells).forEach(function (k) {
            if (prog.revealed.indexOf(k) === -1) prog.revealed.push(k);
          });
          // 看過答案後只當練習：每詞僅保底分、完成也不計入關卡成就
          cw.level.words.forEach(function (w, i) { prog.hints[i] = 9; });
          prog.gaveUp = true;
          StateManager.save();
          SoundEngine.playReveal();
          renderCrosswordUI();
          Toast.show('已揭曉所有字。點選每個詞仍可練習作答並閱讀說明。');
        });
      }
    }

    function syncCwSlots(val) {
      var p = cwProgress(cw.level.id);
      var w = cw.level.words[cw.active];
      if (!w) return;
      var chars = Array.from(norm(val));
      document.querySelectorAll('.cw-slot').forEach(function (slot, i) {
        var known = knownChar(wordCells(w)[i], p);
        slot.textContent = chars[i] || known || '';
        slot.classList.toggle('typed', !!chars[i]);
      });
    }

    function cwMsg(text, kind) {
      var el = document.getElementById('cwMsg');
      if (!el) return;
      el.className = 'cw-ab-msg' + (kind ? ' ' + kind : '');
      el.textContent = text;
    }

    function submitCwWord(val) {
      if (cw.active < 0) return;
      var p = cwProgress(cw.level.id);
      var idx = cw.active;
      var w = cw.level.words[idx];
      var guess = norm(val);
      if (!guess) return;
      if (guess.length !== w.answer.length) {
        cwMsg('這個詞需要 ' + w.answer.length + ' 個字，目前是 ' + guess.length + ' 個字。', 'warn');
        return;
      }
      if (guess !== w.answer) {
        cw.attempts[idx] = (cw.attempts[idx] || 0) + 1;
        SoundEngine.playWrong();
        var bar = document.getElementById('cwAnswerBar');
        if (bar) {
          bar.classList.remove('shake');
          void bar.offsetWidth;
          bar.classList.add('shake');
        }
        // 錯兩次以上，主動送一個字（不扣分），避免卡關挫折
        if (cw.attempts[idx] >= 2) {
          var key = wordCells(w).filter(function (k) { return !knownChar(k, p); })[0];
          if (key) {
            p.revealed.push(key);
            StateManager.save();
            renderCrosswordUI();
            cwMsg('還不對喔！送你一個字當提示，再想想看。', 'err');
            return;
          }
        }
        cwMsg('還不對喔！再讀一次提示，留意字數與已知的字。', 'err');
        return;
      }
      p.solved.push(idx);
      var xp = StateManager.addScore(Math.max(10, 30 - 10 * (p.hints[idx] || 0)), true);
      SoundEngine.playCorrect();
      var goal = StateManager.bumpDaily(true);
      if (goal) setTimeout(celebrateGoal, 600);
      Toast.show('✓ ' + w.answer + '　+' + xp + ' XP', 'ok');
      if (p.solved.length >= cw.level.words.length) {
        cw.active = -1;
        renderCrosswordUI();
        renderCwComplete(true);
        return;
      }
      // 停在剛解出的詞，讓學習者先讀完經文說明，再按「下一個未解的詞」
      cw.active = idx;
      renderCrosswordUI();
    }

    function revealCwLetter() {
      if (cw.active < 0) return;
      var p = cwProgress(cw.level.id);
      var w = cw.level.words[cw.active];
      if (p.solved.indexOf(cw.active) !== -1) return;
      var keys = wordCells(w).filter(function (k) { return !knownChar(k, p); });
      if (!keys.length) return;
      p.revealed.push(keys[0]);
      p.hints[cw.active] = (p.hints[cw.active] || 0) + 1;
      StateManager.save();
      SoundEngine.playReveal();
      renderCrosswordUI();
      if (keys.length === 1) cwMsg('只剩這最後一個字，把整個詞輸入一次就完成了！', 'ok');
    }

    function renderCwComplete(fresh) {
      var box = document.getElementById('cwCompleteBox');
      if (!box) return;
      var levels = db().crosswords || [];
      var idx = levels.indexOf(cw.level);
      var next = levels[idx + 1];
      var bonusText = '';
      var gaveUp = cwProgress(cw.level.id).gaveUp;
      if (fresh && gaveUp) {
        bonusText = '本關曾揭曉答案，僅作練習不計完成；按「重玩本關」可正式挑戰。';
        SoundEngine.playCorrect();
      } else if (fresh) {
        var first = StateManager.recordCrosswordSolved(cw.level.id);
        var opt = document.querySelector('#cwLevelSelect option[value="' + cw.level.id + '"]');
        if (opt && opt.textContent.indexOf('✓') !== 0) opt.textContent = '✓ ' + opt.textContent;
        var bonus = StateManager.addScore(first ? 200 : 50, true);
        bonusText = '全盤完成獎勵 +' + bonus + ' XP' + (first ? '' : '（重玩）');
        SoundEngine.playWin();
        ConfettiEngine.fire(100);
      }
      var html = '<div class="cw-complete">';
      html += '<div class="cw-complete-title">🎉 太棒了！「' + esc(cw.level.title) + '」全部完成</div>';
      if (bonusText) html += '<div class="review-line review-done">' + bonusText + '</div>';
      html += '<ul class="cw-recap">';
      cw.level.words.forEach(function (w) {
        html += '<li><strong>' + esc(w.answer) + '</strong>：' + esc(w.info) + '</li>';
      });
      html += '</ul>';
      html += '<div class="rs-actions">';
      if (next) html += '<button type="button" class="btn btn-primary" id="cwNextLevelBtn">下一關：' + esc(next.title.replace(/^第.關：/, '')) + ' →</button>';
      html += '<button type="button" class="btn btn-ghost" id="cwReplayBtn">🔄 重玩本關</button>';
      html += '</div></div>';
      box.innerHTML = html;
      var nb = box.querySelector('#cwNextLevelBtn');
      if (nb) nb.addEventListener('click', function () { initCrosswordMode(next.id); });
      var rb = box.querySelector('#cwReplayBtn');
      if (rb) {
        rb.addEventListener('click', function () {
          StateManager.get().cwProgress[cw.level.id] = { solved: [], revealed: [], hints: {} };
          StateManager.save();
          initCrosswordMode(cw.level.id);
        });
      }
      if (fresh && box.scrollIntoView) setTimeout(function () { box.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, 200);
    }

    // ========================================================
    // 12. 救贖年代排序 (Timeline Sorter)
    // ========================================================
    var tl = null; // { deck, order, attempts, selected, marks, solved, revealed }

    function initTimelineMode(deckId) {
      var decks = db().timelineDecks || [];
      if (!decks.length) return;
      var s = StateManager.get();
      var id = deckId || (tl && tl.deck.id) || s.settings.lastDeck;
      var deck = decks.filter(function (d) { return d.id === id; })[0];
      if (!deck) deck = decks.filter(function (d) { return !s.timelineSolved[d.id]; })[0] || decks[0];
      StateManager.setSetting('lastDeck', deck.id);
      var correct = deck.events.map(function (e) { return e.id; });
      // 洗牌後至少一半卡片不在原位，避免一開始就幾乎排好
      function misplaced(o) {
        return o.filter(function (id, i) { return correct[i] !== id; }).length;
      }
      var order = shuffle(correct);
      var guard = 0;
      while (misplaced(order) < Math.ceil(correct.length / 2) && guard++ < 30) order = shuffle(correct);
      tl = { deck: deck, order: order, attempts: 0, selected: null, marks: {}, solved: false, revealed: false };
      renderTimeline();
    }

    function eventById(id) {
      return tl.deck.events.filter(function (e) { return e.id === id; })[0];
    }

    function renderTimeline() {
      var container = document.getElementById('timelineAppContainer');
      if (!container || !tl) return;
      var decks = db().timelineDecks || [];
      var s = StateManager.get();
      var deck = tl.deck;
      var finished = tl.solved || tl.revealed;

      var html = '<div class="timeline-app-shell">';
      html += '<div class="tl-header-bar">';
      html += '  <div class="tl-title-group"><h3 class="tl-title">⏳ ' + esc(deck.title) + '</h3><span class="tl-desc">' + esc(deck.desc) + '</span></div>';
      html += '  <div class="tl-deck-selector"><select id="tlDeckSelect" class="cw-level-select" aria-label="選擇年代主題">';
      decks.forEach(function (d) {
        html += '<option value="' + d.id + '"' + (d.id === deck.id ? ' selected' : '') + '>' + (s.timelineSolved[d.id] ? '✓ ' : '') + esc(d.title) + '</option>';
      });
      html += '  </select></div>';
      html += '</div>';

      html += '<div class="tl-howto">' + (finished ? '📜 正確順序與經文說明如下，可按 🔊 聽整段歷史。' : '👆 先點一張卡片、再點另一張即可<b>互換位置</b>；也可用 ▲▼ 微調。排好後按「檢查順序」。') + '</div>';
      html += '<div class="tl-tools">';
      html += ttsButton('tlSpeakBtn', finished ? '朗讀歷史與說明' : '朗讀事件');
      if (!finished) html += '<button type="button" class="cw-tool-btn" id="tlShuffleBtn">🔀 重新洗牌</button>';
      html += '</div>';

      html += '<ol class="tl-events-list" id="tlEventsList">';
      tl.order.forEach(function (id, idx) {
        var ev = eventById(id);
        var mark = tl.marks[id];
        var cls = 'tl-event-card';
        if (tl.selected === id) cls += ' selected';
        if (mark === 'ok' || finished) cls += ' correct';
        else if (mark) cls += ' misplaced';
        html += '<li class="' + cls + '" data-id="' + id + '">';
        html += '  <button type="button" class="tl-card-main" data-act="pick" aria-label="選取：' + esc(ev.text) + '"' + (finished ? ' disabled' : '') + '>';
        html += '    <span class="tl-card-order-badge">' + (idx + 1) + '</span>';
        html += '    <span class="tl-card-content"><span class="tl-event-text">' + esc(ev.text) + '</span>';
        if (finished) {
          html += '<span class="tl-event-history-info"><span class="tl-history-year">📅 ' + esc(ev.year) + '</span><span class="tl-history-era">🏷️ ' + esc(ev.era) + '</span></span>';
          if (ev.note) html += '<span class="tl-event-note">' + esc(ev.note) + '</span>';
        } else if (mark && mark !== 'ok') {
          html += '<span class="tl-mark-hint">' + (mark === 'up' ? '↑ 應該更早一點' : '↓ 應該更晚一點') + '</span>';
        }
        html += '    </span>';
        if (!finished && mark === 'ok') html += '<span class="tl-ok-tick" aria-label="位置正確">✓</span>';
        html += '  </button>';
        if (!finished) {
          html += '  <span class="tl-card-actions">';
          html += '    <button type="button" class="tl-move-btn" data-act="up" title="上移" aria-label="上移"' + (idx === 0 ? ' disabled' : '') + '>▲</button>';
          html += '    <button type="button" class="tl-move-btn" data-act="down" title="下移" aria-label="下移"' + (idx === tl.order.length - 1 ? ' disabled' : '') + '>▼</button>';
          html += '  </span>';
        }
        html += '</li>';
      });
      html += '</ol>';

      html += '<div class="tl-actions-bar">';
      if (!finished) {
        html += '<button type="button" id="tlVerifyBtn" class="btn btn-primary tl-verify-btn">檢查順序 ↵</button>';
        if (tl.attempts >= 2) html += '<button type="button" id="tlRevealBtn" class="btn btn-ghost">揭曉正確順序</button>';
      } else {
        var nextDeck = decks[decks.indexOf(deck) + 1];
        if (nextDeck) html += '<button type="button" id="tlNextBtn" class="btn btn-primary">下一組：' + esc(nextDeck.title.split('：')[0]) + ' →</button>';
        html += '<button type="button" id="tlAgainBtn" class="btn btn-ghost">🔄 再排一次</button>';
      }
      html += '<div id="tlFeedbackMsg" class="tl-feedback-msg" hidden role="status"></div>';
      html += '</div>';
      html += '</div>';

      container.innerHTML = html;
      bindTimelineEvents(container);
    }

    function tlFeedback(html, kind) {
      var el = document.getElementById('tlFeedbackMsg');
      if (!el) return;
      el.hidden = false;
      el.className = 'tl-feedback-msg ' + kind;
      el.innerHTML = html;
    }

    function bindTimelineEvents(container) {
      var sel = container.querySelector('#tlDeckSelect');
      if (sel) {
        sel.addEventListener('change', function () {
          SoundEngine.playClick();
          SpeechEngine.stop();
          initTimelineMode(this.value);
        });
      }

      var list = container.querySelector('#tlEventsList');
      if (list) {
        list.addEventListener('click', function (e) {
          var btn = e.target.closest('[data-act]');
          if (!btn || btn.disabled) return;
          var card = btn.closest('.tl-event-card');
          var id = card.getAttribute('data-id');
          var i = tl.order.indexOf(id);
          var act = btn.getAttribute('data-act');
          if (act === 'up' && i > 0) {
            swap(i, i - 1);
          } else if (act === 'down' && i < tl.order.length - 1) {
            swap(i, i + 1);
          } else if (act === 'pick') {
            if (!tl.selected) {
              tl.selected = id;
              SoundEngine.playClick();
              renderTimeline();
            } else if (tl.selected === id) {
              tl.selected = null;
              renderTimeline();
            } else {
              swap(tl.order.indexOf(tl.selected), i);
            }
          }
        });
      }

      var speakBtn = container.querySelector('#tlSpeakBtn');
      if (speakBtn) {
        speakBtn.addEventListener('click', function () {
          var finished = tl.solved || tl.revealed;
          var text = finished ? '正確的歷史順序：' : '請把以下事件依照時間先後排列：';
          tl.order.forEach(function (id, idx) {
            var ev = eventById(id);
            text += '第' + (idx + 1) + '，' + ev.text + '。';
            if (finished) text += ev.year + '，' + ev.era + '。' + (ev.note || '');
          });
          SpeechEngine.toggle(text, this);
        });
      }

      var shuffleBtn = container.querySelector('#tlShuffleBtn');
      if (shuffleBtn) {
        shuffleBtn.addEventListener('click', function () {
          tl.order = shuffle(tl.order);
          tl.marks = {};
          tl.selected = null;
          SoundEngine.playClick();
          renderTimeline();
        });
      }

      var verifyBtn = container.querySelector('#tlVerifyBtn');
      if (verifyBtn) verifyBtn.addEventListener('click', verifyTimeline);

      var revealBtn = container.querySelector('#tlRevealBtn');
      if (revealBtn) {
        revealBtn.addEventListener('click', function () {
          tl.order = tl.deck.events.map(function (e) { return e.id; });
          tl.revealed = true;
          tl.selected = null;
          SoundEngine.playReveal();
          renderTimeline();
          tlFeedback('📜 這是正確順序。讀完說明後，可以按「再排一次」重新挑戰並獲得經驗值！', 'info');
        });
      }

      var nextBtn = container.querySelector('#tlNextBtn');
      if (nextBtn) {
        nextBtn.addEventListener('click', function () {
          var decks = db().timelineDecks || [];
          var nd = decks[decks.indexOf(tl.deck) + 1];
          if (nd) initTimelineMode(nd.id);
        });
      }
      var againBtn = container.querySelector('#tlAgainBtn');
      if (againBtn) againBtn.addEventListener('click', function () { initTimelineMode(tl.deck.id); });
    }

    function swap(a, b) {
      var t = tl.order[a];
      tl.order[a] = tl.order[b];
      tl.order[b] = t;
      tl.marks = {};
      tl.selected = null;
      SoundEngine.playClick();
      renderTimeline();
    }

    function verifyTimeline() {
      var correct = tl.deck.events.map(function (e) { return e.id; });
      var okCount = 0;
      tl.marks = {};
      tl.order.forEach(function (id, i) {
        var want = correct.indexOf(id);
        if (want === i) {
          tl.marks[id] = 'ok';
          okCount++;
        } else {
          tl.marks[id] = want < i ? 'up' : 'down';
        }
      });
      tl.attempts++;
      if (okCount === correct.length) {
        tl.solved = true;
        var first = StateManager.recordTimelineSolved(tl.deck.id);
        var base = tl.attempts === 1 ? 150 : tl.attempts === 2 ? 100 : 60;
        var xp = StateManager.addScore(first ? base : Math.round(base / 2), true);
        var goal = StateManager.bumpDaily(true);
        SoundEngine.playWin();
        ConfettiEngine.fire(80);
        renderTimeline();
        tlFeedback('🎉 完全正確！' + (tl.attempts === 1 ? '一次就排對，' : '') + '獲得 +' + xp + ' XP。下面每件大事都附上經文說明。', 'ok');
        if (goal) setTimeout(celebrateGoal, 700);
        return;
      }
      SoundEngine.playWrong();
      renderTimeline();
      tlFeedback('💡 ' + correct.length + ' 件中有 <b>' + okCount + '</b> 件位置正確（綠色 ✓）。紅色卡片上的箭頭告訴你該往前或往後移。' + (tl.attempts >= 2 ? '真的卡住了，可以按「揭曉正確順序」。' : ''), 'err');
    }

    // ========================================================
    // 13. 學習儀表板與成就 (Dashboard & Achievements Modal)
    // ========================================================
    function openAchievementsModal() {
      var modal = elements.achievementsModal;
      if (!modal) return;
      var list = db().achievements || [];
      var s = StateManager.get();
      var lvl = StateManager.getCurrentLevelInfo();
      var unlocked = s.achievements || [];

      function coverage(type) {
        var all = listOf(type);
        var n = all.filter(function (q) { return s.qStats[q.id] && s.qStats[q.id].c > 0; }).length;
        return { n: n, total: all.length };
      }

      var html = '<div class="stats-grid">';
      [
        ['🏅', lvl.name + ' Lv.' + lvl.level, '目前等級'],
        ['✨', s.score + ' XP', '累計經驗值'],
        ['🎯', s.totalAnswered ? Math.round(s.totalCorrect / s.totalAnswered * 100) + '%' : '—', '正確率（' + s.totalCorrect + '/' + s.totalAnswered + '）'],
        ['🔥', s.maxStreak, '最高連勝'],
        ['📅', StateManager.currentDayStreak() + ' 天', '連續達標（最佳 ' + s.bestDayStreak + '）'],
        ['🧠', s.masteredCount, '錯題已掌握'],
        ['🧩', Object.keys(s.crosswordsSolved || {}).length + ' / ' + (db().crosswords || []).length, '填字完成'],
        ['🎧', s.audioListenedCount, '語音朗讀次數']
      ].forEach(function (x) {
        html += '<div class="stat-card"><span class="stat-icon">' + x[0] + '</span><b>' + esc(x[1]) + '</b><span>' + esc(x[2]) + '</span></div>';
      });
      html += '</div>';

      html += '<h4 class="modal-section-title">📚 題庫掌握度（至少答對一次）</h4><div class="coverage-list">';
      [['char', '👤 聖經人物'], ['place', '🗺️ 聖經地名'], ['verse', '📜 經文填空']].forEach(function (x) {
        var c = coverage(x[0]);
        var pct = c.total ? Math.round(c.n / c.total * 100) : 0;
        html += '<div class="coverage-row"><span>' + x[1] + '</span><div class="coverage-track"><div class="coverage-fill" style="width:' + pct + '%"></div></div><b>' + c.n + ' / ' + c.total + '</b></div>';
      });
      html += '</div>';

      html += '<h4 class="modal-section-title">🏆 榮譽成就（' + unlocked.length + ' / ' + list.length + '）</h4>';
      html += '<div class="ach-modal-grid">';
      list.forEach(function (ach) {
        var isUnlocked = unlocked.indexOf(ach.id) !== -1;
        var pr = StateManager.achProgress(ach);
        html += '<div class="ach-card ' + (isUnlocked ? 'unlocked' : 'locked') + '">';
        html += '  <div class="ach-icon">' + ach.icon + '</div>';
        html += '  <div class="ach-body">';
        html += '    <div class="ach-title">' + esc(ach.title) + (isUnlocked ? ' <span class="ach-ok-badge">已達成 ✓</span>' : '') + '</div>';
        html += '    <div class="ach-desc">' + esc(ach.desc) + '</div>';
        if (!isUnlocked && ach.req > 1) {
          html += '    <div class="ach-progress"><div class="ach-progress-fill" style="width:' + Math.round(pr.value / pr.req * 100) + '%"></div></div><div class="ach-progress-text">' + pr.value + ' / ' + pr.req + '</div>';
        }
        html += '  </div>';
        html += '</div>';
      });
      html += '</div>';

      var body = document.getElementById('achievementsListContainer');
      if (body) body.innerHTML = html;
      modal.hidden = false;
      SoundEngine.playClick();
      if (elements.achievementsCloseBtn) elements.achievementsCloseBtn.focus();
    }

    function closeAchievementsModal() {
      if (elements.achievementsModal) elements.achievementsModal.hidden = true;
      if (elements.btnAchievements) elements.btnAchievements.focus();
    }

    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      if (elements.achievementsModal && !elements.achievementsModal.hidden) closeAchievementsModal();
      if (elements.levelUpModal && !elements.levelUpModal.hidden) elements.levelUpModal.hidden = true;
    });

    return { init: init };
  })();

  // 頁面載入完成後啟動
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ChallengeApp.init);
  } else {
    ChallengeApp.init();
  }

})(window, document);
