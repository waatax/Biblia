/* 稽核：題庫內所有引用經文必須與內建和合本一致（或為其節錄） */
const { parseRef, loadData, strip } = require('./lib');
const d = loadData();
let bad = 0, total = 0, noref = 0;
const show = process.argv.includes('-v');
function check(kind, id, ref, text) {
  total++;
  const p = parseRef(ref);
  if (!p) { noref++; if (show) console.log('NOREF', kind, id, ref); return; }
  // 節錄允許以 ... 或 … 分段，每段都必須出現在原文
  const whole = strip(p.text);
  const parts = String(text).split(/\.\.\.|…+/).map(strip).filter(Boolean);
  if (!parts.every((x) => whole.includes(x))) { bad++; if (show) console.log('DIFF', kind, id, ref, '\n   has:', text, '\n   unv:', p.text.slice(0, 160)); }
}
['characters', 'places', 'quotes', 'trivia', 'parables', 'books', 'truefalse'].forEach((k) => (d[k] || []).forEach((q) => check(k, q.id, q.verseRef, q.verseText)));
d.verses.forEach((q) => { check('verses', q.id, q.ref, q.fullText); if (!q.fullText.includes(q.answer)) { bad++; console.log('ANSWER-NOT-IN-TEXT', q.id); } });
d.scrambles.forEach((q) => { check('scrambles', q.id, q.ref, q.fullText); if (q.tokens.join('') !== q.fullText) { bad++; console.log('TOKENS', q.id); } });
(d.quotes || []).forEach((q) => { const p = parseRef(q.verseRef); if (p && !strip(p.text).includes(strip(q.quote).slice(0, 8))) { if (show) console.log('QUOTE?', q.id, q.quote, '|', p.text.slice(0, 80)); } });
console.log(`checked ${total}, mismatched ${bad}, unparsable refs ${noref}`);
process.exit(bad ? 1 : 0);
