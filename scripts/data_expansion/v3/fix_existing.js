/* 把既有題庫的引用經文對齊內建和合本：保留編者節錄的範圍，但文字一律取自內建經文 */
const L = require('./lib');
const { parseRef, strip, canon, alignExcerpt, tokenize } = L;

function fixQuote(ref, text) {
  const p = parseRef(ref);
  if (!p) return text;
  const src = p.verses.join('');
  const whole = canon(src);
  const segs = String(text).split(/\.\.\.|…+/).map((x) => x.trim()).filter(Boolean);
  if (segs.every((x) => strip(whole).includes(strip(x))) && !/\.\.\./.test(text)) {
    // 內容一致：若差異只在標點／引號就整段換成原文片段
    const al = segs.length === 1 ? alignExcerpt(segs[0], src) : null;
    return al || text;
  }
  const out = segs.map((x) => alignExcerpt(x, src));
  if (out.some((x) => !x)) return whole.length <= 130 ? whole : (alignExcerpt(segs[0], src) || whole.slice(0, 120) + '…');
  // 相鄰片段若在原文中相連或重疊就合併
  let res = out[0];
  for (let i = 1; i < out.length; i++) {
    if (res.includes(out[i])) continue;
    res += (whole.includes(res + out[i]) ? '' : '…') + out[i];
  }
  return res;
}

function run(d) {
  let n = 0;
  const touch = (o, k, v) => { if (v && o[k] !== v) { o[k] = v; n++; } };
  ['characters', 'places', 'quotes', 'trivia', 'parables', 'books'].forEach((k) => d[k].forEach((q) => {
    if (q.verseRef && q.verseText) touch(q, 'verseText', fixQuote(q.verseRef, q.verseText));
  }));
  d.verses.forEach((q) => {
    const p = parseRef(q.ref); if (!p) return;
    const full = canon(p.text);
    if (!full.includes(q.answer)) { console.log('  ! verse answer missing in text:', q.id, q.ref, q.answer); return; }
    const old = q.blankText.replace(/【[_＿]+】/, '\u0000');
    const before = old.split('\u0000')[0];
    const nth = before.split(q.answer).length - 1;
    let idx = -1; for (let i = 0; i <= nth; i++) { const k = full.indexOf(q.answer, idx + 1); if (k < 0) break; idx = k; }
    touch(q, 'fullText', full);
    touch(q, 'blankText', full.slice(0, idx) + '【____】' + full.slice(idx + q.answer.length));
  });
  d.scrambles.forEach((q) => {
    const p = parseRef(q.ref); if (!p) return;
    const full = canon(p.text);
    let text = full.includes(q.fullText) ? q.fullText : (alignExcerpt(q.fullText, p.verses.join('')) || full);
    if (strip(text).length < strip(q.fullText).length - 2 || /…/.test(text)) text = full;
    if (text !== q.fullText || q.tokens.join('') !== text) { q.fullText = text; q.tokens = tokenize(text, 10); n++; }
  });
  return n;
}
module.exports = { run, fixQuote };
if (require.main === module) {
  const d = L.loadData();
  console.log('fixed', run(d));
  const show = (id) => { for (const k of Object.keys(d)) for (const q of d[k]) if (q.id === id) console.log(id, '→', q.verseText || q.fullText, q.tokens ? JSON.stringify(q.tokens) : ''); };
  ['trivia_43', 'trivia_48', 'para_17', 'para_23', 'para_35', 'book_35', 'v_94', 'scramble_29', 'scramble_18', 'char_01', 'quote_01'].forEach(show);
}
