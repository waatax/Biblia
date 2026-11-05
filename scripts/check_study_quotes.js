#!/usr/bin/env node
/* 檢查 66 卷深度導讀、舊新約總覽與啟示錄導論的引文是否出自內建和合本 (zh_unv)。
 *
 *   node scripts/check_study_quotes.js          只回報（有差異時 exit 1）
 *   node scripts/check_study_quotes.js --json F 另把差異寫成 JSON
 *
 * 比對範圍是「章節＋「引文」」或「「引文」（章節）」的組合。
 * 引號內若只是術語、標題（非經文引用），列入 NOT_QUOTES。
 */
const fs = require('fs');
const path = require('path');
const DATA = path.join(__dirname, '..', 'app', 'data');
const FILES = ['book_studies_ot.js', 'book_studies_nt.js', 'bible_surveys.js', 'intro_revelation.js'];

/* 引號內是術語或討論標題，不是經文引用 */
const NOT_QUOTES = new Set(['以利沙咒詛童子被母熊撕裂', '預定揀選', '基督虛己', '約翰逗號', '像摩西的真先知', '長結尾']);

let books;
new Function('BIBLIA', fs.readFileSync(path.join(DATA, 'books.js'), 'utf8'))({ books: (b) => { books = b; } });
const by = {};
books.forEach((b) => { by[b.zh] = b; by[b.ab] = b; });
['約翰一書', '約翰二書', '約翰三書'].forEach((n, i) => { by['約' + '壹貳參'[i]] = by[n]; });

const cache = {};
function chapters(no) {
  if (cache[no]) return cache[no];
  let got;
  new Function('BIBLIA', fs.readFileSync(path.join(DATA, 'text', 'zh_unv', String(no).padStart(2, '0') + '.js'), 'utf8'))({ layer: (a, b, c, d) => { got = d; } });
  const m = {};
  got.s.forEach((r, i) => { m[r[0]] = got.t[i]; });
  return (cache[no] = m);
}
/* 去標點與編者括註後比對；祂／上帝／祢不視為相同，須與內建用字一致 */
const norm = (s) => s.replace(/\([^)]*\)/g, '').replace(/（[^）]*）/g, '').replace(/【[^】]*】/g, '')
  .replace(/[\s　，。；：！？、「」『』…．.·,;:!?\-—─•]/g, '');

/* 「太 2:2；啟 22:16」「約 19:23-24, 36」：合併所有章節的經文；任一段解析不了就略過 */
function versesOf(refText) {
  let book = null; let chap = null; let body = '';
  for (const raw of refText.replace(/^參\s*/, '').split(/[;；,，、]/)) {
    const m = /^\s*(?:參\s*)?([一-龥]+)?\s*(?:(\d+):)?(\d+)(?:[-–](\d+))?\s*$/.exec(raw);
    if (!m) return null;
    if (m[1]) { book = by[m[1]]; if (!book) return null; }
    if (m[2]) chap = m[2];
    if (!book || !chap) return null;
    const list = chapters(book.no)[chap];
    if (!list) return null;
    body += list.slice(+m[3] - 1, m[4] ? +m[4] : +m[3]).join('');
  }
  return body;
}

function scan() {
  const out = [];
  let total = 0;
  FILES.forEach((f) => {
    const text = fs.readFileSync(path.join(DATA, f), 'utf8');
    const seen = new Set();
    const test = (refText, q) => {
      if (NOT_QUOTES.has(q)) return;
      const body = versesOf(refText);
      if (body == null) return;
      const key = refText + q;
      if (seen.has(key)) return;
      seen.add(key);
      total++;
      const nb = norm(body);
      const frags = q.split(/…|\.\.\./).map(norm).filter((x) => x.length > 1);
      if (!frags.every((x) => nb.includes(x))) out.push({ file: f, ref: refText, quote: q, body });
    };
    const A = /([\u4e00-\u9fa5]{1,7}\s*\d+:\d+(?:[-–]\d+)?)\s*[：:]?\s*「([^」]{2,})」/g;
    const B = /「([^」]{2,})」\s*[（(]((?:參\s*)?[\u4e00-\u9fa5]{1,7}\s*\d+:\d+[^）)]*)[）)]/g;
    let m;
    while ((m = A.exec(text))) test(m[1], m[2]);
    while ((m = B.exec(text))) test(m[2], m[1]);
  });
  return { out, total };
}

if (require.main === module) {
  const { out, total } = scan();
  out.forEach((o) => console.log('✗ ' + o.file + ' ' + o.ref + '\n   引 ' + o.quote + '\n   經 ' + o.body.slice(0, 120)));
  console.log('檢查 ' + total + ' 條引文，不一致 ' + out.length + ' 條');
  const i = process.argv.indexOf('--json');
  if (i > 0) fs.writeFileSync(process.argv[i + 1], JSON.stringify(out, null, 1));
  if (out.length) process.exitCode = 1;
}
module.exports = { scan, norm, chapters, by };
