/* Biblia — 聖經補充資料資訊圖表（年代編排、列王、先知、曆法、地圖、書架…）
 * 全部以 HTML/SVG 由 bible_chronology.js 產生，無外部圖片、可離線、跟隨主題。
 * 由 reader.js 呼叫：BibliaInfographics.xxxHtml(ctx) 產生內容，bind(container, ctx) 綁定互動。
 */
(function (window) {
  'use strict';

  var ui = { bookScope: 'ot', bookOrder: 'canon', route: 'geo01', month: 1 };

  function C() { return window.BIBLIA_CHRONOLOGY; }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* ---------- 年代格式 ---------- */
  function yr(y) { return y < 0 ? 'BC ' + (-y) : 'AD ' + y; }
  function fmtRange(r) {
    if (!r) return '不詳';
    if (r[0] === r[1]) return '約 ' + yr(r[0]);
    if (r[0] < 0 && r[1] < 0) return '約 BC ' + (-r[0]) + '–' + (-r[1]);
    if (r[0] > 0) return '約 AD ' + r[0] + '–' + r[1];
    return '約 BC ' + (-r[0]) + ' – AD ' + r[1];
  }
  function pct(y, ax) { return (y - ax[0]) / (ax[1] - ax[0]) * 100; }

  function groupOf(no) {
    var gs = C().groups;
    for (var i = 0; i < gs.length; i++) if (no >= gs[i].from && no <= gs[i].to) return gs[i];
    return gs[0];
  }
  function chronoBook(no) { return C().books[no - 1]; }
  function intro(ctx, no) { return (ctx.intros || [])[no - 1] || {}; }
  function bookMeta(ctx, no) {
    return (ctx.books || []).filter(function (b) { return b.no === no; })[0] || {};
  }

  /* ---------- 共用：按鈕與圖例 ---------- */
  function readBtn(no, label) {
    return '<button type="button" class="ig-link-btn" data-ig-read="' + no + '">📖 ' + esc(label || '讀經') + '</button>';
  }
  function refBtn(ref) {
    return '<button type="button" class="ig-link-btn" data-ig-ref="' + esc(ref) + '">📖 ' + esc(ref) + '</button>';
  }
  function legend(items) {
    return '<div class="ig-legend">' + items.map(function (it) {
      return '<span class="ig-legend-item"><span class="ig-swatch ' + (it.cls || '') + '"' +
        (it.color ? ' style="background:' + it.color + '"' : '') + '></span>' + esc(it.label) + '</span>';
    }).join('') + '</div>';
  }
  function tiles(list) {
    return '<div class="ig-tiles">' + list.map(function (t) {
      return '<div class="ig-tile"><strong>' + esc(t[0]) + '</strong><span>' + esc(t[1]) + '</span></div>';
    }).join('') + '</div>';
  }
  function seg(name, current, options) {
    return '<div class="ig-seg" role="group" aria-label="' + esc(options.label) + '">' + options.items.map(function (o) {
      var on = o[0] === current;
      return '<button type="button" class="ig-seg-btn' + (on ? ' active' : '') + '" data-ig-set="' + name + '" data-ig-val="' + o[0] + '" aria-pressed="' + on + '">' + esc(o[1]) + '</button>';
    }).join('') + '</div>';
  }

  /* ---------- 共用：甘特圖（每列一個直接標籤，整列可點開詳情） ---------- */
  function gantt(opts) {
    var ax = opts.axis;
    var ticks = opts.ticks.map(function (t) {
      return '<span class="ig-tick" style="left:' + pct(t, ax).toFixed(2) + '%">' + esc(t === 0 ? '公元元年' : (t < 0 ? 'BC ' + (-t) : 'AD ' + t)) + '</span>';
    }).join('');
    var lines = opts.ticks.map(function (t) {
      return '<i class="ig-gridline" style="left:' + pct(t, ax).toFixed(2) + '%"></i>';
    }).join('');
    (opts.markers || []).forEach(function (m) {
      lines += '<i class="ig-marker' + (pct(m.y, ax) > 78 ? ' flip' : '') + '" style="left:' + pct(m.y, ax).toFixed(2) + '%"><b>' + esc(m.label) + '</b></i>';
    });

    var rows = opts.rows.map(function (row) {
      if (row.heading) {
        return '<div class="ig-row-heading">' + (row.color ? '<span class="ig-swatch" style="background:' + row.color + '"></span>' : '') + esc(row.heading) + '</div>';
      }
      var bars = row.bars.map(function (b) {
        var left = Math.max(0, Math.min(100, pct(b.r[0], ax)));
        var right = Math.max(0, Math.min(100, pct(b.r[1], ax)));
        var style = 'left:' + left.toFixed(2) + '%;width:' + Math.max(0, right - left).toFixed(2) + '%;' + (b.color ? 'background:' + b.color + ';' : '');
        return '<i class="ig-bar ' + (b.cls || '') + '" style="' + style + '"></i>';
      }).join('');
      var tip = row.tip || row.label;
      var labelHtml = '<span class="ig-label">' + (row.mark ? '<em class="ig-mark ' + row.markCls + '" aria-hidden="true">' + row.mark + '</em>' : '') + '<span>' + esc(row.label) + '</span>' + (row.sub ? '<small>' + esc(row.sub) + '</small>' : '') + '</span>';
      if (!row.detail) {
        return '<div class="ig-row ig-row-static" data-ig-tip="' + esc(tip) + '">' + labelHtml + '<span class="ig-track">' + bars + '</span></div>';
      }
      return '<div class="ig-row-wrap">' +
        '<button type="button" class="ig-row" data-ig-toggle aria-expanded="false" aria-label="' + esc(tip) + '" data-ig-tip="' + esc(tip) + '">' + labelHtml + '<span class="ig-track">' + bars + '</span></button>' +
        '<div class="ig-row-detail" hidden>' + row.detail + '</div>' +
      '</div>';
    }).join('');

    return '<div class="ig-gantt' + (opts.compact ? ' ig-compact' : '') + '">' +
      '<div class="ig-axis"><span class="ig-axis-gap"></span><span class="ig-axis-track">' + ticks + '</span></div>' +
      '<div class="ig-gantt-body"><div class="ig-grid"><div class="ig-grid-inner">' + lines + '</div></div>' + rows + '</div>' +
    '</div>';
  }

  /* ---------- 1. 總覽 ---------- */
  function overviewHtml(ctx) {
    var c = C();
    var ax = c.axis.full;
    var eras = (ctx.tdata && ctx.tdata.eras) || [];
    var totalCh = (ctx.books || []).reduce(function (a, b) { return a + (b.nch || 0); }, 0);

    var ribbon = eras.map(function (e, i) {
      var r = c.eraRanges[e.id].r;
      return '<i class="ig-ribbon-seg ' + (i % 2 ? 'alt' : '') + '" style="left:' + pct(r[0], ax).toFixed(2) + '%;width:' + (pct(r[1], ax) - pct(r[0], ax)).toFixed(2) + '%" data-ig-tip="' + esc(e.name.split(' (')[0] + '｜' + fmtRange(r)) + '"></i>';
    }).join('');
    var dots = c.milestones.map(function (m) {
      return '<i class="ig-ribbon-dot" style="left:' + pct(m.y, ax).toFixed(2) + '%" data-ig-tip="' + esc(yr(m.y) + '｜' + m.t) + '"></i>';
    }).join('');

    var rows = [{ heading: '聖經歷史的九個時代' }].concat(eras.map(function (e, i) {
      var r = c.eraRanges[e.id].r;
      var chips = (e.books || []).map(function (name) {
        var hit = (ctx.books || []).filter(function (b) { return name.indexOf(b.zh) === 0; })[0];
        return hit
          ? '<button type="button" class="ig-chip" data-ig-read="' + hit.no + '">' + esc(name) + '</button>'
          : '<span class="ig-chip ig-chip-plain">' + esc(name) + '</span>';
      }).join('');
      var events = (e.events || []).map(function (ev) {
        return '<li><span>' + esc(ev.year) + '</span><span>' + esc(ev.event) + '</span></li>';
      }).join('');
      return {
        label: (i + 1) + '. ' + e.name.split(' (')[0],
        sub: fmtRange(r),
        tip: e.name.split(' (')[0] + '｜' + fmtRange(r),
        bars: [{ r: r, cls: 'ig-bar-era' }],
        detail: '<p>' + esc(e.summary) + '</p><div class="ig-chips">' + chips + '</div><ul class="ig-events">' + events + '</ul>'
      };
    }));
    rows.push({ heading: '同時期的世界強權' });
    c.empires.forEach(function (em) {
      rows.push({ label: em.name, sub: fmtRange(em.r), tip: em.name + '｜' + fmtRange(em.r), bars: [{ r: em.r, cls: 'ig-bar-empire' }] });
    });

    var ms = c.milestones.map(function (m) {
      return '<li><button type="button" class="ig-mile" data-ig-ref="' + esc(m.ref) + '"><span class="ig-mile-y">約 ' + yr(m.y) + '</span><span class="ig-mile-t">' + esc(m.t) + '</span><small>' + esc(m.ref) + '</small></button></li>';
    }).join('');

    return tiles([
      ['66 卷', '舊約 39 · 新約 27'],
      [totalCh.toLocaleString('en-US') + ' 章', '舊約 929 · 新約 260'],
      ['約 1,500 年', '從摩西到約翰的寫作跨度'],
      [eras.length + ' 個時代', '點選下方列展開細節']
    ]) +
    '<div class="ig-card"><h3 class="ig-title">救贖歷史一覽</h3>' +
      '<div class="ig-ribbon" role="img" aria-label="聖經歷史時代色帶，自約公元前 2166 年至公元 100 年">' + ribbon + dots + '</div>' +
      '<div class="ig-ribbon-ends"><span>約 BC 2166 亞伯拉罕</span><span>約 AD 100</span></div>' +
      gantt({ axis: ax, ticks: [-2000, -1500, -1000, -500, 0], rows: rows }) +
    '</div>' +
    '<div class="ig-card"><h3 class="ig-title">十六件大事</h3><ol class="ig-miles">' + ms + '</ol></div>' +
    '<p class="ig-note">' + esc(c.note) + '</p>';
  }

  /* ---------- 2. 66 卷年代編排 ---------- */
  var GROUP_COLORS = { law: 1, history: 2, poetry: 3, major: 4, minor: 5, gospel: 6, paul: 7, general: 8, rev: 8 };
  function groupColor(key) { return 'var(--ig-s' + GROUP_COLORS[key] + ')'; }

  function bookDetail(ctx, no) {
    var b = chronoBook(no); var i = intro(ctx, no);
    return '<dl class="ig-dl">' +
      '<div><dt>作者</dt><dd>' + esc(i.author) + '</dd></div>' +
      '<div><dt>寫作</dt><dd>' + esc(b.w ? fmtRange(b.w) : '不詳') + '</dd></div>' +
      '<div><dt>所記歷史</dt><dd>' + (b.prim ? '含太古／家譜；' : '') + esc(fmtRange(b.s)) + '</dd></div>' +
    '</dl>' +
    (b.note ? '<p class="ig-detail-note">' + esc(b.note) + '</p>' : '') +
    '<p>' + esc(i.theme) + '</p>' +
    '<div class="ig-actions">' + readBtn(no) +
      '<button type="button" class="ig-link-btn" data-ig-study="' + no + '">🏛️ 深度導讀</button>' +
      '<button type="button" class="ig-link-btn" data-ig-intro="' + no + '">📋 書卷簡介</button>' +
    '</div>';
  }

  function sortBooks(list, order) {
    var key = order === 'written'
      ? function (b) { return b.w ? b.w[0] : Infinity; }
      : order === 'history'
        ? function (b) { return b.prim && b.no === 1 ? -99999 : b.s[0]; }
        : function (b) { return b.no; };
    return list.slice().sort(function (a, b) { return (key(a) - key(b)) || (a.no - b.no); });
  }

  function booksHtml(ctx) {
    var c = C();
    var isOT = ui.bookScope === 'ot';
    var ax = isOT ? c.axis.ot : c.axis.nt;
    var ticks = isOT ? [-2000, -1600, -1200, -800, -400] : [0, 25, 50, 75, 100];
    var list = sortBooks(c.books.filter(function (b) { return isOT ? b.no <= 39 : b.no >= 40; }), ui.bookOrder);
    var rows = [];
    var lastGroup = null;
    list.forEach(function (b) {
      var g = groupOf(b.no);
      var color = groupColor(g.key);
      if (ui.bookOrder === 'canon' && g.key !== lastGroup) {
        rows.push({ heading: g.label, color: color });
        lastGroup = g.key;
      }
      var m = bookMeta(ctx, b.no);
      var bars = [{ r: b.s, cls: 'ig-bar-setting', color: color }];
      if (b.w) bars.push({ r: b.w, cls: 'ig-bar-written', color: color });
      rows.push({
        label: m.zh || ('#' + b.no),
        sub: ui.bookOrder === 'history' ? fmtRange(b.s) : (b.w ? fmtRange(b.w) : '成書不詳'),
        tip: (m.zh || '') + '｜寫作 ' + (b.w ? fmtRange(b.w) : '不詳') + '｜所記歷史 ' + fmtRange(b.s),
        bars: bars,
        detail: bookDetail(ctx, b.no)
      });
    });
    var groupsShown = c.groups.filter(function (g) {
      return isOT ? g.to <= 39 : g.from >= 40 && g.key !== 'rev';
    }).map(function (g) {
      return { label: g.key === 'general' ? '普通書信與啟示錄' : g.label, color: groupColor(g.key) };
    });
    return '<div class="ig-card">' +
      '<h3 class="ig-title">66 卷年代編排</h3>' +
      '<p class="ig-lead">同一卷書有兩個年代：<strong>事情發生的時候</strong>（淺色）與<strong>寫下來的時候</strong>（深色）。例如列王紀記載 BC 971 起的歷史，成書卻已在被擄期間。</p>' +
      '<div class="ig-controls">' +
        seg('bookScope', ui.bookScope, { label: '約別', items: [['ot', '舊約 39 卷'], ['nt', '新約 27 卷']] }) +
        seg('bookOrder', ui.bookOrder, { label: '排序', items: [['canon', '正典順序'], ['written', '寫作先後'], ['history', '歷史先後']] }) +
      '</div>' +
      legend([{ label: '所記歷史', cls: 'ig-swatch-setting' }, { label: '寫作時間', cls: 'ig-swatch-written' }]) +
      legend(groupsShown) +
      gantt({ axis: ax, ticks: ticks, rows: rows }) +
    '</div>' +
    (isOT ? '' : '<p class="ig-note">新約年代集中在約 70 年內，因此使用獨立的放大時間軸。</p>') +
    '<p class="ig-note">' + esc(c.note) + '</p>';
  }

  /* ---------- 3. 列王對照 ---------- */
  var VERDICT = {
    good: { mark: '✓', cls: 'ig-good', text: '行耶和華眼中看為正的事' },
    mixed: { mark: '△', cls: 'ig-mixed', text: '有善有惡或晚節有失' },
    evil: { mark: '✕', cls: 'ig-evil', text: '行耶和華眼中看為惡的事' }
  };
  function kingRows(list, label) {
    var rows = [{ heading: label }];
    list.forEach(function (k) {
      var v = VERDICT[k.v];
      var years = k.r[1] - k.r[0];
      rows.push({
        label: k.n + (k.alt ? '（' + k.alt + '）' : ''),
        sub: fmtRange(k.r),
        mark: v.mark, markCls: v.cls,
        tip: k.n + '｜' + fmtRange(k.r) + '｜' + v.text,
        bars: [{ r: k.r, cls: 'ig-bar-king ' + v.cls }],
        detail: '<p><strong>' + esc(v.mark + ' ' + v.text) + '</strong>' + (k.note ? '：' + esc(k.note) : '') + '</p>' +
          (years > 0 ? '<p class="ig-detail-note">在位（含共治）約 ' + years + ' 年。</p>' : '') +
          '<div class="ig-actions">' + refBtn(k.ref) + '</div>'
      });
    });
    return rows;
  }
  function kingsHtml() {
    var c = C();
    var ax = [-940, -580];
    var j = c.kings.judah; var n = c.kings.israel;
    var good = j.filter(function (k) { return k.v === 'good'; }).length;
    var mixed = j.filter(function (k) { return k.v === 'mixed'; }).length;
    return tiles([
      ['南國猶大 ' + j.length + ' 王', '約 345 年；大衛王朝不斷'],
      ['北國以色列 ' + n.length + ' 王', '約 209 年；多次政變換朝'],
      [good + ' 位敬虔王', '南國；另有 ' + mixed + ' 位有善有惡'],
      ['BC 722 · BC 586', '北國與南國相繼滅亡']
    ]) +
    '<div class="ig-card"><h3 class="ig-title">分國君王對照</h3>' +
      '<p class="ig-lead">列王紀與歷代志常以「行耶和華眼中看為正」或「為惡」評價君王。部分長條重疊，是因為父子共治。</p>' +
      legend([
        { label: '✓ 看為正', cls: 'ig-good' },
        { label: '△ 有善有惡', cls: 'ig-mixed' },
        { label: '✕ 看為惡', cls: 'ig-evil' }
      ]) +
      gantt({
        axis: ax, ticks: [-900, -800, -700, -600],
        markers: [{ y: -722, label: '722' }, { y: -586, label: '586' }],
        rows: kingRows(j, '南國猶大').concat(kingRows(n, '北國以色列'))
      }) +
    '</div><p class="ig-note">' + esc(c.note) + '</p>';
  }

  /* ---------- 4. 先知與帝國 ---------- */
  var TARGETS = {
    north: { label: '北國以色列', s: 1 }, south: { label: '南國猶大', s: 2 }, nations: { label: '外邦', s: 3 },
    exile: { label: '被擄者', s: 7 }, 'return': { label: '歸回餘民', s: 6 }
  };
  function prophetsHtml(ctx) {
    var c = C();
    var ax = [-900, -380];
    var focus = {};
    ((ctx.tdata && ctx.tdata.prophetic_periods) || []).forEach(function (pe) {
      (pe.prophets || []).forEach(function (p) { focus[p.name] = p.focus; });
    });
    var rows = [{ heading: '世界強權' }];
    c.empires.filter(function (e) { return e.r[1] > ax[0] && e.r[0] < ax[1] && e.name !== '埃及新王國' && e.name !== '希臘化王國'; }).forEach(function (e) {
      rows.push({ label: e.name, sub: fmtRange(e.r), bars: [{ r: e.r, cls: 'ig-bar-empire' }], tip: e.name + '｜' + fmtRange(e.r) });
    });
    rows.push({ heading: '先知（依事工先後）' });
    c.prophets.forEach(function (p) {
      var t = TARGETS[p.t];
      rows.push({
        label: p.n,
        sub: fmtRange(p.r),
        tip: p.n + '｜' + fmtRange(p.r) + '｜對象：' + t.label,
        bars: [{ r: p.r, color: 'var(--ig-s' + t.s + ')', cls: 'ig-bar-solid' }],
        detail: '<p><strong>主要對象：</strong>' + esc(t.label) + (p.nonWriting ? '（未留下同名書卷）' : '') + '</p>' +
          (focus[p.n] ? '<p>' + esc(focus[p.n]) + '</p>' : '') +
          '<div class="ig-actions">' + (p.book ? readBtn(p.book, '閱讀《' + (bookMeta(ctx, p.book).zh || '') + '》') : refBtn(p.ref)) + '</div>'
      });
    });
    return '<div class="ig-card"><h3 class="ig-title">先知與帝國對照</h3>' +
      '<p class="ig-lead">先知書要放回當時的強權之下讀：亞述壓境時有以賽亞與彌迦，巴比倫崛起時有耶利米，波斯時代有哈該與撒迦利亞。</p>' +
      legend(Object.keys(TARGETS).map(function (k) { return { label: TARGETS[k].label, color: 'var(--ig-s' + TARGETS[k].s + ')' }; })) +
      gantt({ axis: ax, ticks: [-800, -700, -600, -500, -400], markers: [{ y: -722, label: '722' }, { y: -586, label: '586' }, { y: -538, label: '538' }], rows: rows }) +
    '</div>';
  }

  /* ---------- 5. 使徒時代與新約書信 ---------- */
  function apostolicHtml(ctx) {
    var c = C();
    var ax = [25, 100];
    var KIND = { life: { label: '事件', s: 1 }, journey: { label: '宣教旅程', s: 2 }, letter: { label: '新約書卷寫作', s: 7 } };
    var items = c.apostolic.map(function (a) {
      return { start: a.r[0], end: a.r[1], label: a.t, kind: a.kind, ref: a.ref };
    });
    c.books.filter(function (b) { return b.no >= 40; }).forEach(function (b) {
      items.push({ start: b.w[0], end: b.w[1], label: bookMeta(ctx, b.no).zh || ('#' + b.no), kind: 'letter', no: b.no });
    });
    items.sort(function (a, b) { return (a.start - b.start) || (a.end - b.end); });
    var rows = items.map(function (it) {
      var k = KIND[it.kind];
      return {
        label: it.label, sub: fmtRange([it.start, it.end]),
        tip: it.label + '｜' + fmtRange([it.start, it.end]),
        bars: [{ r: [it.start, it.end], color: 'var(--ig-s' + k.s + ')', cls: 'ig-bar-solid' }],
        detail: it.no ? bookDetail(ctx, it.no) : '<div class="ig-actions">' + refBtn(it.ref) + '</div>'
      };
    });
    return '<div class="ig-card"><h3 class="ig-title">使徒時代與新約書卷</h3>' +
      '<p class="ig-lead">把書信放回保羅的旅程：加拉太書寫於第一次旅程之後，羅馬書寫於第三次旅程尾聲，監獄書信寫於羅馬軟禁期間。</p>' +
      legend(Object.keys(KIND).map(function (k) { return { label: KIND[k].label, color: 'var(--ig-s' + KIND[k].s + ')' }; })) +
      gantt({ axis: ax, ticks: [30, 50, 70, 90], rows: rows }) +
    '</div><p class="ig-note">' + esc(c.note) + '</p>';
  }

  /* ---------- 6. 曆法圓盤 ---------- */
  var SEASONS = [
    { label: '春（1–3 月）', s: 3 }, { label: '夏（4–6 月）', s: 4 }, { label: '秋（7–9 月）', s: 2 }, { label: '冬（10–12 月）', s: 1 }
  ];
  function arc(cx, cy, r0, r1, a0, a1) {
    function pt(r, a) { return (cx + r * Math.cos(a)).toFixed(2) + ' ' + (cy + r * Math.sin(a)).toFixed(2); }
    var large = a1 - a0 > Math.PI ? 1 : 0;
    return 'M' + pt(r1, a0) + 'A' + r1 + ' ' + r1 + ' 0 ' + large + ' 1 ' + pt(r1, a1) + 'L' + pt(r0, a1) + 'A' + r0 + ' ' + r0 + ' 0 ' + large + ' 0 ' + pt(r0, a0) + 'Z';
  }
  function monthName(m) { return m.jewish_name.split(/[\s(（/]/)[0]; }
  function calendarHtml(ctx) {
    var months = (ctx.tdata && ctx.tdata.jewish_calendar) || [];
    var cx = 200; var cy = 200;
    var step = Math.PI * 2 / 12;
    var gap = 0.012;
    var sectors = months.map(function (m, i) {
      var a0 = -Math.PI / 2 + i * step + gap;
      var a1 = a0 + step - gap * 2;
      var mid = (a0 + a1) / 2;
      var season = SEASONS[Math.floor(i / 3)];
      var on = m.month_no === ui.month;
      var hasFeast = m.feasts !== '無重大節期' && /[逾五住吹贖七]/.test(m.feasts.slice(0, 40)) && [1, 3, 7].indexOf(m.month_no) !== -1;
      var tx = cx + 137 * Math.cos(mid); var ty = cy + 137 * Math.sin(mid);
      return '<g class="ig-month' + (on ? ' active' : '') + '" data-ig-month="' + m.month_no + '" tabindex="0" role="button" aria-label="' + esc(monthName(m) + '，' + m.gregorian + '，' + m.feasts) + '">' +
        '<path d="' + arc(cx, cy, 92, 186, a0, a1) + '" style="fill:var(--ig-s' + season.s + ')"></path>' +
        '<text x="' + tx.toFixed(1) + '" y="' + (ty - 7).toFixed(1) + '" class="ig-month-name">' + esc(monthName(m)) + '</text>' +
        '<text x="' + tx.toFixed(1) + '" y="' + (ty + 11).toFixed(1) + '" class="ig-month-sub">' + esc(m.gregorian) + '</text>' +
        (hasFeast ? '<circle cx="' + (cx + 172 * Math.cos(mid)).toFixed(1) + '" cy="' + (cy + 172 * Math.sin(mid)).toFixed(1) + '" r="5" class="ig-feast-dot"></circle>' : '') +
      '</g>';
    }).join('');
    var cur = months.filter(function (m) { return m.month_no === ui.month; })[0] || months[0] || {};
    return '<div class="ig-card"><h3 class="ig-title">猶太曆法圓盤</h3>' +
      '<p class="ig-lead">從尼散月（亞筆月）開始順時針排列。神聖曆由春天起算，民政曆由秋天的提斯利月起算。點選月份查看節期與農事。</p>' +
      legend(SEASONS.map(function (s) { return { label: s.label, color: 'var(--ig-s' + s.s + ')' }; }).concat([{ label: '七大節期所在月份', cls: 'ig-swatch-feast' }])) +
      '<div class="ig-cal-wrap">' +
        '<svg class="ig-cal" viewBox="0 0 400 400" role="group" aria-label="猶太曆十二個月">' + sectors +
          '<text x="200" y="192" class="ig-cal-c1">神聖曆</text><text x="200" y="216" class="ig-cal-c2">12 個月</text>' +
        '</svg>' +
        '<div class="ig-cal-detail" aria-live="polite">' +
          '<div class="ig-cal-no">神聖曆第 ' + esc(cur.month_no) + ' 月・民政曆第 ' + esc(cur.civil_no) + ' 月</div>' +
          '<h4>' + esc(cur.jewish_name) + '</h4>' +
          '<p class="ig-cal-greg">約公曆 ' + esc(cur.gregorian) + '</p>' +
          '<dl class="ig-dl ig-dl-col"><div><dt>節期</dt><dd>' + esc(cur.feasts) + '</dd></div><div><dt>農事與氣候</dt><dd>' + esc(cur.agri) + '</dd></div></dl>' +
        '</div>' +
      '</div>' +
    '</div>';
  }

  /* ---------- 7. 示意地圖 ---------- */
  function mapSvg(route) {
    var base = C().mapBase;
    var pts = [];
    route.legs.forEach(function (l) { l.stops.forEach(function (s) { pts.push(s.p); }); });
    var lats = pts.map(function (p) { return p[0]; }); var lons = pts.map(function (p) { return p[1]; });
    var minLat = Math.min.apply(null, lats); var maxLat = Math.max.apply(null, lats);
    var minLon = Math.min.apply(null, lons); var maxLon = Math.max.apply(null, lons);
    var small = window.innerWidth < 600;
    var W = small ? 560 : 1000;
    var Hmax = small ? 600 : 680;
    var padLat = Math.max(0.2, (maxLat - minLat) * 0.12); var padLon = Math.max(0.3, (maxLon - minLon) * 0.1);
    minLat -= padLat; maxLat += padLat; minLon -= padLon; maxLon += padLon;
    var cos = Math.cos((minLat + maxLat) / 2 * Math.PI / 180);
    // 等比例投影：同時容納經度與緯度，不足的方向向外延伸可視範圍
    var scale = Math.min(W / ((maxLon - minLon) * cos), Hmax / (maxLat - minLat));
    var H = Math.max(small ? 380 : 440, Math.min(Hmax, (maxLat - minLat) * scale));
    var midLon = (minLon + maxLon) / 2;
    var viewLon = W / (scale * cos);
    minLon = midLon - viewLon / 2;
    var midLat = (minLat + maxLat) / 2;
    var top = midLat + (H / scale) / 2;
    function X(lon) { return (lon - minLon) * cos * scale; }
    function Y(lat) { return (top - lat) * scale; }
    function poly(list) { return list.map(function (p) { return X(p[0]).toFixed(1) + ',' + Y(p[1]).toFixed(1); }).join(' '); }

    var s = '<svg class="ig-map" viewBox="0 0 ' + W + ' ' + H.toFixed(0) + '" role="img" aria-label="' + esc(route.title) + '示意地圖">';
    s += '<rect width="' + W + '" height="' + H.toFixed(0) + '" class="ig-land"></rect>';
    base.seas.forEach(function (p) { s += '<polygon points="' + poly(p) + '" class="ig-sea"></polygon>'; });
    base.islands.forEach(function (p) { s += '<polygon points="' + poly(p) + '" class="ig-land-fill"></polygon>'; });
    base.lakes.forEach(function (p) { s += '<polygon points="' + poly(p) + '" class="ig-sea"></polygon>'; });
    base.rivers.forEach(function (r) { s += '<polyline points="' + poly(r.pts) + '" class="ig-river"></polyline>'; });

    var TONES = { north: 1, south: 2, exile: 8, 'return': 6, j1: 1, j2: 2, j3: 6, j4: 7 };
    route.legs.forEach(function (l) {
      var color = l.tone ? 'var(--ig-s' + TONES[l.tone] + ')' : 'var(--accent)';
      if (!route.points) {
        s += '<polyline points="' + l.stops.map(function (st) { return X(st.p[1]).toFixed(1) + ',' + Y(st.p[0]).toFixed(1); }).join(' ') + '" class="ig-path" style="stroke:' + color + '"></polyline>';
      }
    });

    /* 標籤避讓：先佔住所有站點，再依序試近位置；擠不下時外移並畫引線 */
    var placed = [];
    function hit(a) {
      return placed.some(function (b) { return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y; });
    }
    var numbered = route.legs.length === 1;
    var R = numbered ? 15 : 9;
    route.legs.forEach(function (l) {
      l.stops.forEach(function (st) {
        if (st.via) return;
        placed.push({ x: X(st.p[1]) - R, y: Y(st.p[0]) - R, w: R * 2, h: R * 2 });
      });
    });
    var seen = {};
    var marks = '';
    var leaders = '';
    var n = 0;
    route.legs.forEach(function (l) {
      var color = l.tone ? 'var(--ig-s' + TONES[l.tone] + ')' : 'var(--accent)';
      l.stops.forEach(function (st) {
        n++;
        var key = st.p.join(',');
        if (seen[key] || st.via) { seen[key] = true; return; }
        seen[key] = true;
        var x = X(st.p[1]); var y = Y(st.p[0]);
        marks += '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="' + R + '" class="ig-stop" style="fill:' + color + '" data-ig-tip="' + esc(st.n + (st.tentative ? '（位置有爭議）' : '')) + '"></circle>';
        if (numbered) marks += '<text x="' + x.toFixed(1) + '" y="' + (y + 6).toFixed(1) + '" class="ig-stop-no">' + n + '</text>';
        // 手機上保羅路線站點太密：只標主要城市，完整地名列在圖下方
        if (small && route.id === 'geo07' && ['安提阿', '特羅亞', '腓立比', '雅典', '以弗所', '耶路撒冷', '羅馬', '馬耳他'].indexOf(st.n) === -1) return;
        var label = (st.short || st.n) + (st.tentative ? '?' : '');
        var w = label.length * 24 + 6; var h = 28;
        var pick = null;
        [0, 26, 52, 80, 110, 145].forEach(function (d) {
          [[1, -1], [-1, -1], [1, 1], [-1, 1]].forEach(function (dir) {
            if (pick) return;
            var ox = dir[0] > 0 ? x + R + 4 + d * 0.5 : x - R - 4 - w - d * 0.5;
            var oy = d === 0 ? y - h / 2 : (dir[1] < 0 ? y - h - R - d * 0.6 : y + R + d * 0.6);
            var box = { x: ox, y: oy, w: w, h: h };
            if (hit(box) || ox < 3 || ox + w > W - 3 || oy < 3 || oy + h > H - 3) return;
            pick = { x: ox, y: oy, a: dir[0] > 0 ? 'start' : 'end', d: d };
            placed.push(box);
          });
        });
        if (!pick) pick = x + R + 4 + w < W ? { x: x + R + 4, y: y - h / 2, a: 'start', d: 0 } : { x: x - R - 4 - w, y: y - h / 2, a: 'end', d: 0 };
        var tx = pick.a === 'start' ? pick.x : pick.x + w;
        if (pick.d > 0) {
          leaders += '<line x1="' + x.toFixed(1) + '" y1="' + y.toFixed(1) + '" x2="' + tx.toFixed(1) + '" y2="' + (pick.y + h / 2).toFixed(1) + '" class="ig-leader"></line>';
        }
        marks += '<text x="' + tx.toFixed(1) + '" y="' + (pick.y + 21).toFixed(1) + '" text-anchor="' + pick.a + '" class="ig-stop-label">' + esc(label) + '</text>';
      });
    });
    s += leaders;
    return s + marks + '</svg>';
  }

  function mapHtml(ctx) {
    var c = C();
    var route = c.routes.filter(function (r) { return r.id === ui.route; })[0] || c.routes[0];
    var geo = ((ctx.kb && ctx.kb.geography) || []).filter(function (g) { return g.id === route.id; })[0] || {};
    var TONES = { north: 1, south: 2, exile: 8, 'return': 6, j1: 1, j2: 2, j3: 6, j4: 7 };
    var pills = c.routes.map(function (r) {
      var on = r.id === route.id;
      return '<button type="button" class="ig-seg-btn' + (on ? ' active' : '') + '" data-ig-set="route" data-ig-val="' + r.id + '" aria-pressed="' + on + '">' + esc(r.title) + '</button>';
    }).join('');
    var n = 0;
    var lists = route.legs.map(function (l) {
      var color = l.tone ? 'var(--ig-s' + TONES[l.tone] + ')' : 'var(--accent)';
      return '<div class="ig-leg"><div class="ig-leg-head"><span class="ig-swatch" style="background:' + color + '"></span>' + esc(l.label) + '</div><ol class="ig-stops">' +
        l.stops.map(function (st) {
          n++;
          if (st.via) return '<li class="ig-stop-via">經 ' + esc(st.n) + '</li>';
          return '<li><button type="button" class="ig-chip" data-ig-ref="' + esc(st.ref) + '" title="' + esc(st.ref) + '">' +
            (route.legs.length === 1 ? '<b>' + n + '</b> ' : '') + esc(st.short || st.n) + (st.role ? '（' + esc(st.role) + '）' : '') + (st.tentative ? ' ?' : '') + '</button></li>';
        }).join('') + '</ol></div>';
    }).join('');
    return '<div class="ig-card ig-map-card">' +
      '<h3 class="ig-title">聖經路線示意圖</h3>' +
      '<div class="ig-seg ig-seg-scroll" role="group" aria-label="選擇路線">' + pills + '</div>' +
      '<div class="ig-map-body"><div class="ig-map-frame">' + mapSvg(route) + '</div><div class="ig-map-side">' +
      '<div class="ig-map-meta"><strong>' + esc(geo.title ? geo.title.split(' (')[0] : route.title) + '</strong><span>' + esc(geo.period || '') + '</span></div>' +
      (route.caveat ? '<p class="ig-detail-note">' + esc(route.caveat) + '</p>' : '') +
      lists + '</div></div>' +
      '<p class="ig-note">示意圖：水域與河流為手繪簡化，地點依遺址或傳統位置標示，僅供理解相對方位。標「?」者位置仍有爭議。點地名可開啟該段經文。</p>' +
    '</div>';
  }

  /* ---------- 8. 66 卷書架（高度依章數） ---------- */
  function shelfHtml(ctx) {
    var c = C();
    function shelf(from, to, title) {
      var chapters = 0;
      var spines = '';
      for (var no = from; no <= to; no++) {
        var m = bookMeta(ctx, no);
        var g = groupOf(no);
        chapters += m.nch || 0;
        spines += '<button type="button" class="ig-spine' + (g.key === 'major' || g.key === 'minor' ? ' ink' : '') + '" style="height:' + Math.round(22 + (m.nch || 1) * 0.62) + 'px;background:' + groupColor(g.key) + '" data-ig-intro="' + no + '" data-ig-tip="' + esc((m.zh || '') + '｜' + (m.nch || '') + ' 章｜' + g.label) + '" aria-label="' + esc((m.zh || '') + '，' + (m.nch || '') + ' 章') + '"><span>' + esc(m.ab || '') + '</span></button>';
      }
      return '<div class="ig-shelf"><div class="ig-shelf-head"><strong>' + esc(title) + '</strong><span>' + (to - from + 1) + ' 卷 · ' + chapters + ' 章</span></div><div class="ig-shelf-row">' + spines + '</div></div>';
    }
    var labels = c.groups.filter(function (g) { return g.key !== 'rev'; }).map(function (g) {
      return { label: g.key === 'general' ? '普通書信與啟示錄' : g.label, color: groupColor(g.key) };
    });
    return '<div class="ig-card ig-shelf-card"><h3 class="ig-title">66 卷聖經書架</h3>' +
      '<p class="ig-lead">書背高度依章數比例。點一本書可跳到它的簡介。</p>' +
      legend(labels) + shelf(1, 39, '舊約') + shelf(40, 66, '新約') +
    '</div>';
  }

  /* ---------- 9. 書卷卡片的年代定位條 ---------- */
  function miniBarHtml(no) {
    var c = C();
    var b = chronoBook(no);
    if (!b) return '';
    var ax = no <= 39 ? c.axis.ot : c.axis.nt;
    var color = groupColor(groupOf(no).key);
    function seg2(r, cls) {
      var l = pct(r[0], ax); var w = pct(r[1], ax) - l;
      return '<i class="' + cls + '" style="left:' + l.toFixed(2) + '%;width:' + w.toFixed(2) + '%;background:' + color + '"></i>';
    }
    return '<div class="ig-mini" role="img" aria-label="所記歷史 ' + esc(fmtRange(b.s)) + '，寫作 ' + esc(b.w ? fmtRange(b.w) : '不詳') + '">' +
      '<div class="ig-mini-track">' + seg2(b.s, 'ig-bar-setting') + (b.w ? seg2(b.w, 'ig-bar-written') : '') + '</div>' +
      '<div class="ig-mini-axis"><span>' + (no <= 39 ? 'BC 2200' : 'BC 10') + '</span><span>所記歷史 ' + esc(fmtRange(b.s)) + '</span><span>' + (no <= 39 ? 'BC 350' : 'AD 100') + '</span></div>' +
    '</div>';
  }

  /* ---------- 10. 舊／新約組成比例 ---------- */
  function compositionHtml(ctx, testament) {
    var c = C();
    var isOT = testament === 'OT';
    var groups = c.groups.filter(function (g) { return isOT ? g.to <= 39 : g.from >= 40; });
    var data = groups.map(function (g) {
      var ch = 0;
      for (var n = g.from; n <= g.to; n++) ch += bookMeta(ctx, n).nch || 0;
      return { g: g, ch: ch, count: g.to - g.from + 1 };
    });
    var total = data.reduce(function (a, d) { return a + d.ch; }, 0);
    var bar = data.map(function (d) {
      return '<i style="flex:' + d.ch + ' 0 0;background:' + groupColor(d.g.key) + '" data-ig-tip="' + esc(d.g.label + '｜' + d.count + ' 卷｜' + d.ch + ' 章') + '"></i>';
    }).join('');
    var legendItems = data.map(function (d) {
      return '<li><span class="ig-swatch" style="background:' + groupColor(d.g.key) + '"></span><strong>' + esc(d.g.label) + '</strong><span>' + d.count + ' 卷 · ' + d.ch + ' 章 · ' + Math.round(d.ch / total * 100) + '%</span></li>';
    }).join('');
    return '<div class="ig-card ig-compact-card"><h3 class="ig-title">' + (isOT ? '舊約' : '新約') + '的組成</h3>' +
      '<div class="ig-stack" role="img" aria-label="依章數的書卷類別比例">' + bar + '</div>' +
      '<ul class="ig-stack-legend">' + legendItems + '</ul></div>';
  }

  /* ---------- 11. 人物生平 ---------- */
  function peopleHtml(ctx) {
    var c = C();
    var list = (ctx.kb && ctx.kb.characters) || [];
    var rows = list.map(function (p) {
      var r = c.people[p.id];
      return {
        label: p.name.split(' (')[0], sub: esc(p.era),
        tip: p.name.split(' (')[0] + '｜' + p.era,
        bars: [{ r: r, cls: 'ig-bar-solid', color: r[1] > -10 ? 'var(--ig-s7)' : 'var(--ig-s1)' }]
      };
    });
    return '<div class="ig-card ig-compact-card"><h3 class="ig-title">人物年代軸</h3>' +
      legend([{ label: '舊約人物', color: 'var(--ig-s1)' }, { label: '新約人物', color: 'var(--ig-s7)' }]) +
      gantt({ axis: c.axis.full, ticks: [-2000, -1500, -1000, -500, 0], rows: rows, compact: true }) +
    '</div>';
  }

  /* ---------- 12. 聖約鏈 ---------- */
  function covenantChainHtml(ctx) {
    var c = C();
    var list = (ctx.kb && ctx.kb.covenants) || [];
    var nodes = list.map(function (v, i) {
      var name = v.name.split(/ \/ | \(/)[0];
      return '<li class="ig-cov' + (i === list.length - 1 ? ' final' : '') + '"><span class="ig-cov-no">' + (i + 1) + '</span>' +
        '<span class="ig-cov-year">' + esc(c.covenantYears[v.id]) + '</span>' +
        '<strong>' + esc(name) + '</strong>' +
        '<small>' + esc(v.covenantSign) + '</small></li>';
    }).join('');
    return '<div class="ig-card ig-compact-card"><h3 class="ig-title">聖約的進展</h3>' +
      '<p class="ig-lead">從伊甸的應許到基督裡的新約，一步步指向同一位救主。</p>' +
      '<ol class="ig-covs">' + nodes + '</ol></div>';
  }

  /* ---------- 總入口：年代與圖表分頁 ---------- */
  var TIMELINE_TABS = [
    { key: 'overview', label: '🧭 歷史總覽' },
    { key: 'books', label: '📚 66 卷年代' },
    { key: 'kings', label: '👑 分國列王' },
    { key: 'prophets', label: '📜 先知與帝國' },
    { key: 'apostolic', label: '✉️ 使徒與書信' },
    { key: 'calendar', label: '🗓️ 曆法圓盤' },
    { key: 'charts', label: '📊 結構圖' }
  ];
  function timelineChartHtml(tab, ctx) {
    if (tab === 'books') return booksHtml(ctx);
    if (tab === 'kings') return kingsHtml(ctx);
    if (tab === 'prophets') return prophetsHtml(ctx);
    if (tab === 'apostolic') return apostolicHtml(ctx);
    if (tab === 'calendar') return calendarHtml(ctx);
    if (tab === 'overview') return overviewHtml(ctx);
    return '';
  }

  /* ---------- 互動（事件委派，每個容器只綁一次） ---------- */
  var tipEl = null;
  function showTip(text, x, y) {
    if (!tipEl) {
      tipEl = document.createElement('div');
      tipEl.className = 'ig-tooltip';
      document.body.appendChild(tipEl);
    }
    tipEl.textContent = text;
    tipEl.style.display = 'block';
    var w = tipEl.offsetWidth;
    tipEl.style.left = Math.max(8, Math.min(window.innerWidth - w - 8, x + 12)) + 'px';
    tipEl.style.top = Math.max(8, y - 38) + 'px';
  }
  function hideTip() { if (tipEl) tipEl.style.display = 'none'; }

  function bind(container, ctx) {
    container.__igCtx = ctx;
    if (container.__igBound) return;
    container.__igBound = true;

    container.addEventListener('click', function (e) {
      var c = container.__igCtx;
      var t = e.target.closest ? e.target.closest('[data-ig-toggle],[data-ig-read],[data-ig-ref],[data-ig-study],[data-ig-intro],[data-ig-set],[data-ig-month]') : null;
      if (!t) return;
      hideTip();
      if (t.hasAttribute('data-ig-toggle')) {
        var det = t.nextElementSibling;
        var open = det.hidden;
        det.hidden = !open;
        t.setAttribute('aria-expanded', open ? 'true' : 'false');
        t.parentNode.classList.toggle('open', open);
        return;
      }
      if (t.hasAttribute('data-ig-read')) { c.openBook(parseInt(t.getAttribute('data-ig-read'), 10)); return; }
      if (t.hasAttribute('data-ig-ref')) { c.jump(t.getAttribute('data-ig-ref')); return; }
      if (t.hasAttribute('data-ig-study')) { c.openStudy(parseInt(t.getAttribute('data-ig-study'), 10)); return; }
      if (t.hasAttribute('data-ig-intro')) { c.openIntro(parseInt(t.getAttribute('data-ig-intro'), 10)); return; }
      if (t.hasAttribute('data-ig-set')) {
        ui[t.getAttribute('data-ig-set')] = t.getAttribute('data-ig-val');
        c.rerender();
        return;
      }
      if (t.hasAttribute('data-ig-month')) {
        ui.month = parseInt(t.getAttribute('data-ig-month'), 10);
        c.rerender();
      }
    });
    container.addEventListener('keydown', function (e) {
      if ((e.key === 'Enter' || e.key === ' ') && e.target.hasAttribute && e.target.hasAttribute('data-ig-month')) {
        e.preventDefault();
        e.target.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      }
    });
    container.addEventListener('mousemove', function (e) {
      var t = e.target.closest ? e.target.closest('[data-ig-tip]') : null;
      if (t) showTip(t.getAttribute('data-ig-tip'), e.clientX, e.clientY);
      else hideTip();
    });
    container.addEventListener('mouseleave', hideTip);
  }

  window.BibliaInfographics = {
    TIMELINE_TABS: TIMELINE_TABS,
    timelineChartHtml: timelineChartHtml,
    mapHtml: mapHtml,
    shelfHtml: shelfHtml,
    miniBarHtml: miniBarHtml,
    compositionHtml: compositionHtml,
    peopleHtml: peopleHtml,
    covenantChainHtml: covenantChainHtml,
    sortBooks: sortBooks,
    bind: bind
  };
})(window);
