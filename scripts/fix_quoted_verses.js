#!/usr/bin/env node
/* 將補充資料中的引用經文對齊 App 內建和合本 (app/data/text/zh_unv)。
 *
 * 內建經文是使用者在閱讀器看到的權威文字。此工具保留編者摘錄的範圍（哪幾句），
 * 但文字一律取自內建經文，並以「…」標示省略。
 *
 *   node scripts/fix_quoted_verses.js          檢查（有差異時 exit 1）
 *   node scripts/fix_quoted_verses.js --write  寫回資料檔與 gen_book_intros.py
 */
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const DATA = path.join(ROOT, 'app', 'data');
const WRITE = process.argv.includes('--write');

let books;
new Function('BIBLIA', fs.readFileSync(path.join(DATA, 'books.js'), 'utf8'))({ books: (b) => { books = b; } });
const byName = { 約壹: null };
books.forEach((b) => { byName[b.zh] = b; byName[b.ab] = b; });
['約翰一書', '約翰二書', '約翰三書'].forEach((n, i) => { byName['約' + '壹貳參'[i]] = byName[n]; });

const cache = {};
function chapters(no) {
  if (cache[no]) return cache[no];
  let got;
  new Function('BIBLIA', fs.readFileSync(path.join(DATA, 'text', 'zh_unv', String(no).padStart(2, '0') + '.js'), 'utf8'))({ layer: (k, v, n, d) => { got = d; } });
  const m = {};
  got.s.forEach((row, i) => { m[row[0]] = got.t[i]; });
  return (cache[no] = m);
}

/* 解析「馬太福音 26:15; 27:3-7」「約翰福音 19:23-24, 36」「詩篇 22:16-18; 出埃及記 12:46」 */
function parseRef(ref) {
  const out = [];
  let book = null; let chap = null;
  for (const raw of String(ref).split(/[;；,，、]/)) {
    const part = raw.trim();
    if (!part) continue;
    const m = /^([一-龥]+)?\s*(?:(\d+)[:：])?(\d+)(?:\s*[-–~]\s*(\d+))?(?:節)?$/.exec(part);
    if (!m) return null;
    if (m[1]) { book = byName[m[1]]; if (!book) return null; }
    if (m[2]) chap = +m[2];
    if (!book || !chap) return null;
    const from = +m[3]; const to = m[4] ? +m[4] : from;
    const list = chapters(book.no)[chap];
    if (!list) return null;
    for (let s = from; s <= to; s++) {
      if (list[s - 1] === undefined) return null;
      out.push(list[s - 1]);
    }
  }
  return out.length ? out : null;
}

const clean = (s) => String(s).replace(/^（([^（）]*)）$/, '$1')
  .replace(/（[^）]*）/g, '').replace(/【[^】]*】/g, '')
  .replace(/[「」『』]/g, '').replace(/[　\s]+/g, '');
const norm = (s) => clean(s).replace(/祂/g, '他').replace(/上帝/g, '神').replace(/她/g, '他')
  .replace(/[，。；：！？、…．.·,;:!?\-—─]/g, '');
const bigrams = (s) => { const a = []; for (let i = 0; i < s.length - 1; i++) a.push(s.slice(i, i + 2)); return a; };

/* 自動對齊無法判斷摘錄範圍時由編者指定；仍須逐字出自內建經文（以「…」分段），否則視為失敗 */
const OVERRIDES = {
  'p09 NT': '這人就是先知以賽亞所說的。他說：在曠野有人聲喊著說：預備主的道，修直他的路！',
  'p10 NT': '後又離開拿撒勒，往迦百農去，就住在那裡。…這是要應驗先知以賽亞的話…',
  'p12 OT': '於是他們給了三十塊錢作為我的工價。…我便將這三十塊錢，在耶和華的殿中丟給窯戶了。',
  'p14 NT': '兵丁既然將耶穌釘在十字架上…只要拈鬮，看誰得著。…這些事成了，為要應驗經上的話說：他的骨頭一根也不可折斷。',
  'c06.keyVerse': '你們心持兩意要到幾時呢？若耶和華是神，就當順從耶和華；若巴力是神，就當順從巴力。',
  'geo01.spiritualMeaning': '那座有根基的城，就是神所經營所建造的。',
  '民數記': '耶和華說：我指著我的永生起誓，我必要照你們達到我耳中的話待你們。',
  '雅歌': '求你將我放在你心上如印記，帶在你臂上如戳記。因為愛情如死之堅強…愛情，眾水不能息滅，大水也不能淹沒。',
  '西番雅書': '耶和華─你的神是施行拯救、大有能力的主。他在你中間必因你歡欣喜樂，默然愛你，且因你喜樂而歡呼。',
  '使徒行傳': '但聖靈降臨在你們身上，你們就必得著能力，並要在耶路撒冷、猶太全地，和撒馬利亞，直到地極，作我的見證。',
  '帖撒羅尼迦前書': '因為主必親自從天降臨，有呼叫的聲音和天使長的聲音…和他們一同被提到雲裡，在空中與主相遇。',
  '約翰二書': '我們若照他的命令行，這就是愛。你們從起初所聽見當行的，就是這命令。',
  '瑪拉基書': '萬軍之耶和華說：你們要將當納的十分之一全然送入倉庫…以此試試我，是否為你們敞開天上的窗戶，傾福與你們，甚至無處可容。'
};
/* 編者原引用範圍不足以涵蓋所引內容，一併修正章節 */
const REF_FIXES = { 'p06 NT': ['羅馬書 1:3', '羅馬書 1:3-4'], 'p15 NT': ['使徒行傳 2:31-32', '使徒行傳 2:30-32'] };

/* 回傳對齊後的摘錄；無法對齊回傳 null */
function align(ref, quote) {
  const verses = parseRef(ref);
  if (!verses) return null;
  const nq = norm(quote);
  const qb = new Set(bigrams(nq));
  const pieces = [];
  verses.forEach((v) => {
    (clean(v).match(/[^，。；：！？]+[，。；：！？]*/g) || []).forEach((c) => {
      const nc = norm(c);
      const bg = bigrams(nc);
      const score = bg.length ? bg.filter((x) => qb.has(x)).length / bg.length : (nq.includes(nc) ? 1 : 0);
      pieces.push({ c, keep: score >= 0.6 });
    });
  });
  if (!pieces.some((p) => p.keep)) return null;
  let out = '';
  let gap = false;
  let started = false;
  pieces.forEach((p) => {
    if (p.keep) {
      if (gap && started) out = out.replace(/[，；：、]$/, '') + '…';
      out += p.c;
      started = true;
      gap = false;
    } else gap = true;
  });
  return out.replace(/[，；：、]$/, '…');
}

const report = { same: 0, fixed: 0, failed: [] };
const pairs = [];
function apply(ref, quote, label) {
  const ov = OVERRIDES[label];
  let fixed;
  if (ov) {
    const body = clean((parseRef(ref) || []).join(''));
    const badFrag = ov.split('…').filter(Boolean).find((f) => !body.includes(clean(f)));
    if (badFrag) { report.failed.push(label + ' 覆寫非逐字：' + badFrag); return quote; }
    fixed = ov;
  } else {
    const verses = parseRef(ref);
    // 編者只引片語且逐字相符：保留原摘錄，不擴成整句
    const frags = clean(quote).replace(/\.\.\./g, '…').split('…').map((f) => f.replace(/[。，；！？]$/, '')).filter(Boolean);
    if (verses && frags.every((f) => clean(verses.join('')).includes(f)) && !/\.\.\./.test(quote)) { report.same++; return quote; }
    fixed = align(ref, quote);
  }
  if (fixed == null) { report.failed.push(label + ' ' + ref + ' 「' + quote + '」'); return quote; }
  if (fixed === quote) { report.same++; return quote; }
  report.fixed++;
  pairs.push([quote, fixed]);
  if (process.argv.includes('--show')) console.log('[' + label + '] ' + ref + ' | ' + quote + ' => ' + fixed);
  return fixed;
}

const REF = '[\\u4e00-\\u9fa5]{1,7}\\s*\\d+[:：]\\d+(?:\\s*[-–]\\s*\\d+)?';
const P_BEFORE = new RegExp('(' + REF + ')\\s*「([^」]{3,})」', 'g');
const P_AFTER = new RegExp('「([^」]{3,})」\\s*[（(](' + REF + ')[）)]', 'g');
function fixInline(str, label) {
  return str
    .replace(P_BEFORE, (all, r, q) => (parseRef(r) ? r + '「' + apply(r, q, label) + '」' : all))
    .replace(P_AFTER, (all, q, r) => (parseRef(r) ? '「' + apply(r, q, label) + '」（' + r + '）' : all));
}

/* -------- knowledge_base -------- */
const kbPath = path.join(DATA, 'knowledge_base.js');
const kbSrc = fs.readFileSync(kbPath, 'utf8');
const win = {};
new Function('window', kbSrc)(win);
const kb = win.BIBLIA_KNOWLEDGE_BASE;
const refPairs = [];
kb.prophecies.forEach((p) => {
  const fx = REF_FIXES[p.id + ' NT'];
  if (fx && p.ntRef === fx[0]) { p.ntRef = fx[1]; refPairs.push(fx); }
  p.otText = apply(p.otRef, p.otText, p.id + ' OT');
  p.ntText = apply(p.ntRef, p.ntText, p.id + ' NT');
});
['geography', 'characters', 'wordStudies', 'apologetics', 'covenants'].forEach((sec) => {
  kb[sec].forEach((it) => {
    Object.keys(it).forEach((k) => { if (typeof it[k] === 'string') it[k] = fixInline(it[k], it.id + '.' + k); });
  });
});

/* -------- book_intros -------- */
const inPath = path.join(DATA, 'book_intros.js');
const inSrc = fs.readFileSync(inPath, 'utf8');
const pyPath = path.join(ROOT, 'scripts', 'gen_book_intros.py');
const pySrc = fs.readFileSync(pyPath, 'utf8');
const win2 = {};
new Function('window', inSrc)(win2);
const kbPairs = pairs.slice();
pairs.length = 0;
win2.BIBLIA_BOOK_INTROS.forEach((b) => { fixInline(b.key_verse, b.name_zh); });

console.log('一致', report.same, '已校正', report.fixed, '無法對齊', report.failed.length);
report.failed.forEach((f) => console.log('  ✗', f));

/* 字串層級替換：只動被校正的引文，資料檔其他內容與格式一律不變 */
function patch(src, list, name) {
  let out = src;
  list.forEach(([a, b]) => {
    if (!out.includes(a)) console.log('  ! 找不到', name, a);
    out = out.split(a).join(b);
  });
  return out;
}
if (WRITE) {
  // 長字串先換，避免短引文是長引文的子字串
  const byLen = (x, y) => y[0].length - x[0].length;
  fs.writeFileSync(kbPath, patch(kbSrc, refPairs.concat(kbPairs).sort(byLen), 'kb'));
  fs.writeFileSync(inPath, patch(inSrc, pairs.slice().sort(byLen), 'intros'));
  fs.writeFileSync(pyPath, patch(pySrc, pairs.slice().sort(byLen), 'py'));
} else if (report.fixed || report.failed.length) {
  process.exitCode = 1;
}
