/* 共用工具：載入內建和合本 (app/data/text/zh_unv)、解析經文出處、讀寫題庫 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const ROOT = path.join(__dirname, '..', '..', '..');
const DATA = path.join(ROOT, 'app', 'data');
const DATA_FILE = path.join(DATA, 'challenge_data.js');

let books;
new Function('BIBLIA', fs.readFileSync(path.join(DATA, 'books.js'), 'utf8'))({ books: (b) => { books = b; } });
const byName = {};
books.forEach((b) => { byName[b.zh] = b; });

const cache = {};
function chapters(no) {
  if (cache[no]) return cache[no];
  let got;
  new Function('BIBLIA', fs.readFileSync(path.join(DATA, 'text', 'zh_unv', String(no).padStart(2, '0') + '.js'), 'utf8'))({ layer: (k, v, n, d) => { got = d; } });
  const m = {};
  got.s.forEach((row, i) => { m[row[0]] = got.t[i]; });
  return (cache[no] = m);
}

/* 「約翰福音 3:16」「詩篇 23:1-3」「彌迦書 5:2 / 馬太福音 2:1」→ 只取第一段 */
function parseRef(ref) {
  const first = String(ref || '').split('/')[0].trim();
  const m = /^([一-龥]+)\s*(\d+):(\d+)(?:\s*[-–]\s*(\d+))?/.exec(first);
  if (!m) return null;
  const book = byName[m[1]];
  if (!book) return null;
  const chap = +m[2]; const from = +m[3]; const to = m[4] ? +m[4] : from;
  const list = chapters(book.no)[chap];
  if (!list) return null;
  const verses = [];
  for (let s = from; s <= to; s++) {
    if (list[s - 1] === undefined) return null;
    verses.push(list[s - 1]);
  }
  return { bookNo: book.no, bookName: book.zh, chap, from, to, verses, text: verses.join('') };
}

function loadData() {
  const ctx = { window: {} };
  vm.runInNewContext(fs.readFileSync(DATA_FILE, 'utf8'), ctx);
  return ctx.window.BIBLIA_CHALLENGE_DATA;
}

const strip = (s) => String(s || '').replace(/[\s，。；：！？、…．.·,;:!?\-—─「」『』（）()]/g, '');

module.exports = { ROOT, DATA, DATA_FILE, books, byName, chapters, parseRef, loadData, strip };

/* 內建經文 → 題庫顯示用文字：去掉譯註（或譯…／原文是…）、全形空白，修掉落單的引號 */
function canon(text) {
  let s = String(text).replace(/（[^（）]*）/g, '').replace(/[　\s]+/g, '').replace(/•/g, '·');
  const bal = (open, close) => {
    let depth = 0; let out = '';
    for (const ch of s) {
      if (ch === open) depth++;
      if (ch === close) { if (depth === 0) continue; depth--; }
      out += ch;
    }
    // 移除沒有收尾的開引號（由後往前）
    while (depth > 0) { const i = out.lastIndexOf(open); out = out.slice(0, i) + out.slice(i + 1); depth--; }
    s = out;
  };
  bal('「', '」'); bal('『', '』');
  // 只剩內層『』時升為「」
  if (!s.includes('「')) s = s.replace(/『/g, '「').replace(/』/g, '」');
  return s;
}

function refText(ref) {
  const p = parseRef(ref);
  return p ? canon(p.text) : null;
}

/* 以原文對齊節錄：回傳原文中對應 seg 的片段（延伸到子句邊界），找不到回傳 null */
function alignExcerpt(seg, src) {
  const a = strip(seg);
  if (a.length < 4) return null;
  // 建立 src 去標點後 → 原始索引對照
  const map = []; let flat = '';
  for (let i = 0; i < src.length; i++) { if (strip(src[i])) { flat += src[i]; map.push(i); } }
  let st = -1; let en = -1;
  for (let i = 0; i + 4 <= a.length && st < 0; i++) { const k = flat.indexOf(a.slice(i, i + 4)); if (k >= 0) st = Math.max(0, k - i); }
  for (let j = a.length; j - 4 >= 0 && en < 0; j--) { const k = flat.lastIndexOf(a.slice(j - 4, j)); if (k >= 0) en = Math.min(flat.length, k + 4 + (a.length - j)); }
  if (st < 0 || en < 0 || en <= st) return null;
  let s0 = map[st]; let e0 = map[en - 1] + 1;
  const B = '，。；：！？、';
  while (s0 > 0 && !B.includes(src[s0 - 1]) && !'「『'.includes(src[s0 - 1])) s0--;
  while (e0 < src.length && !B.includes(src[e0 - 1])) e0++;
  while (e0 < src.length && '」』'.includes(src[e0])) e0++;
  return canon(src.slice(s0, e0));
}

/* 經文重組：依標點切成詞組，過短的併入相鄰詞組，最多 max 塊 */
function tokenize(text, max) {
  max = max || 9;
  let toks = text.match(/[^，。；：！？、]+[，。；：！？、」』]*/g) || [text];
  const merge = (i) => { toks.splice(i, 2, toks[i] + toks[i + 1]); };
  for (let i = 0; i < toks.length - 1;) { if (strip(toks[i]).length < 3) merge(i); else i++; }
  if (toks.length > 1 && strip(toks[toks.length - 1]).length < 3) merge(toks.length - 2);
  while (toks.length > max) {
    let best = 0; let bl = Infinity;
    for (let i = 0; i < toks.length - 1; i++) { const l = toks[i].length + toks[i + 1].length; if (l < bl) { bl = l; best = i; } }
    merge(best);
  }
  // 太少塊時把最長的詞組對半切，確保至少 4 塊
  while (toks.length < 4) {
    let li = 0; toks.forEach((t, i) => { if (t.length > toks[li].length) li = i; });
    const t = toks[li]; if (t.length < 6) break;
    const h = Math.ceil(t.length / 2); toks.splice(li, 1, t.slice(0, h), t.slice(h));
  }
  return toks;
}

function writeData(d, header) {
  const out = header + '\n(function (window) {\n  \'use strict\';\n  window.BIBLIA_CHALLENGE_DATA = ' + JSON.stringify(d, null, 2).replace(/\n/g, '\n  ') + ';\n})(window);\n';
  fs.writeFileSync(DATA_FILE, out);
}

Object.assign(module.exports, { canon, refText, alignExcerpt, tokenize, writeData });
