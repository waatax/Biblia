/* v3 擴充建置：校正既有題庫 → 併入新增內容 → 以內建和合本驗證 → 寫回 app/data/challenge_data.js
 *   node scripts/data_expansion/v3/build.js          建置並寫檔
 *   node scripts/data_expansion/v3/build.js --check  只驗證不寫檔
 * 可重複執行：以 id 編號判斷哪些是 v2 既有題目（BASE 以內），其餘每次由 src_*.js 重新產生。 */
const fs = require('fs');
const path = require('path');
const L = require('./lib');
const { full } = require('./look');
const { layout } = require('./crossword_layout');
const fixExisting = require('./fix_existing');

const CHECK = process.argv.includes('--check');
const BASE = { characters: 150, places: 100, verses: 130, quotes: 50, trivia: 50, parables: 40, books: 40, scrambles: 30, matches: 20, timelineDecks: 20, crosswords: 20 };
const BASE_ACH = 48;
const errors = [];
const err = (m) => errors.push(m);
const opt = (f) => (fs.existsSync(path.join(__dirname, f + '.js')) ? require('./' + f) : []);
const pad = (n, w) => String(n).padStart(w || 2, '0');
const idNum = (id) => +String(id).replace(/^[a-z]+_/i, '').split('_')[0];

const d = L.loadData();
Object.keys(BASE).forEach((k) => { d[k] = (d[k] || []).filter((q) => idNum(q.id) <= BASE[k]); });
d.achievements = d.achievements.slice(0, BASE_ACH);

/* ---------- 1. 既有題庫校正 ---------- */
const byId = {};
Object.keys(d).forEach((k) => (Array.isArray(d[k]) ? d[k] : []).forEach((q) => { if (q && q.id) byId[q.id] = q; }));
const patch = (id, fn) => { if (byId[id]) fn(byId[id]); else err('patch target missing: ' + id); };
patch('quote_01', (q) => { q.mistakeExplanation = '「至於我和我家，我們必定事奉耶和華」是約書亞臨終在示劍立約時的名言；摩西死在尼波山，未曾分地；迦勒是與約書亞同作探子的同伴，八十五歲時求取希伯崙山地；撒母耳是後來的士師與先知。'; });
patch('trivia_43', (q) => { q.name = '10 個義人'; q.options = ['10 個義人', '5 個義人', '20 個義人', '1 個義人']; });
patch('trivia_35', (q) => { q.mistakeExplanation = '基督教新舊約正典合共「66 卷」：舊約 39 卷、新約 27 卷。73 卷是天主教聖經（含次經）的卷數；39 卷是舊約；70 則與卷數無關。'; });
patch('trivia_09', (q) => { q.mistakeExplanation = '大衛作王「四十年」：在希伯崙七年半、在耶路撒冷三十三年（撒下 5:4-5）。三十歲是他登基的年齡。'; });
// 名稱含括號的答案，填空時也接受不含括號的寫法
['characters', 'quotes'].forEach((k) => d[k].forEach((q) => {
  const m = /^(.+?)（(.+)）$/.exec(q.name);
  if (m) q.aliases = Array.from(new Set([...(q.aliases || []), m[1]]));
}));
// 重複的經文填空（同出處、同答案）只留第一題
const seenV = {};
d.verses = d.verses.filter((q) => { const k = q.ref + '|' + q.answer; if (seenV[k]) return false; seenV[k] = 1; return true; });
const fixed = fixExisting.run(d);
d.quotes.forEach((q) => {
  const p = L.parseRef(q.verseRef);
  if (!p) return;
  const a = String(q.quote).split(/\.\.\.|…+/).map((x) => L.alignExcerpt(x, p.verses.join('')));
  if (a.every(Boolean)) q.quote = a.join('…');
});

/* ---------- 2. 新增內容 ---------- */
function need(ref, key, where) {
  const p = L.parseRef(full(ref));
  if (!p) { err(`${where}: 出處無法解析「${ref}」`); return null; }
  const text = L.canon(p.text);
  (Array.isArray(key) ? key : key ? [key] : []).forEach((k) => {
    if (!L.strip(text).includes(L.strip(k))) err(`${where}: 「${ref}」經文中找不到「${k}」→ ${text.slice(0, 90)}`);
  });
  let shown = text;
  if (shown.length > 150) {
    const cut = shown.slice(0, 150);
    const i = Math.max(cut.lastIndexOf('。'), cut.lastIndexOf('；'), cut.lastIndexOf('！'), cut.lastIndexOf('？'));
    shown = (i > 60 ? cut.slice(0, i + 1) : cut) + '…';
  }
  return { ref: full(ref), text, shown, bookNo: p.bookNo, chap: p.chap };
}
function opts(ans, o, where) {
  if (!Array.isArray(o) || o.length !== 3 || new Set([ans, ...o]).size !== 4) err(`${where}: 選項需為 3 個且不可重複 (${ans} / ${o})`);
  return [ans, ...(o || [])];
}
const names = (k) => new Set(d[k].map((q) => q.name));

// 人物
let n = BASE.characters;
const charNames = names('characters');
opt('src_chars').forEach((c) => {
  const w = 'char ' + c.n;
  if (charNames.has(c.n)) return err(w + ': 人物重複');
  charNames.add(c.n);
  const v = need(c.r, c.k, w);
  if (!v) return;
  if (c.cl.length !== 4) err(w + ': 需 4 條線索');
  d.characters.push({ id: 'char_' + pad(++n), difficulty: c.d || 2, name: c.n, aliases: c.al || [], nameMeaning: c.m || '', era: c.e, category: c.c, clues: c.cl, options: opts(c.n, c.o, w), bookNo: v.bookNo, chap: v.chap, verseRef: v.ref, verseText: v.shown, bio: c.b, mistakeExplanation: c.x });
});
// 地名
n = BASE.places;
const placeNames = names('places');
opt('src_places').forEach((c) => {
  const w = 'place ' + c.n;
  if (placeNames.has(c.n)) return err(w + ': 地名重複');
  placeNames.add(c.n);
  const v = need(c.r, c.k, w);
  if (!v) return;
  if (c.cl.length !== 4) err(w + ': 需 4 條線索');
  d.places.push({ id: 'place_' + pad(++n), difficulty: c.d || 2, name: c.n, aliases: c.al || [], nameMeaning: c.m || '', region: c.g, clues: c.cl, options: opts(c.n, c.o, w), bookNo: v.bookNo, chap: v.chap, verseRef: v.ref, verseText: v.shown, notes: c.b, mistakeExplanation: c.x });
});
// 經文填空：答案後綴 * 代表全部出現處都挖空，#N 代表第 N 次出現
n = BASE.verses;
opt('src_verses').forEach(([ref, ansSpec, o, hint, meaning, x, diff]) => {
  const w = 'verse ' + ref;
  const m = /^(.+?)(\*|#(\d+))?$/.exec(ansSpec);
  const ans = m[1];
  const v = need(ref, ans, w);
  if (!v) return;
  if (seenV[v.ref + '|' + ans]) return err(w + ': 與既有題目重複');
  seenV[v.ref + '|' + ans] = 1;
  let blank;
  if (m[2] === '*') blank = v.text.split(ans).join('【____】');
  else {
    let idx = -1;
    for (let i = 0; i < (m[3] ? +m[3] : 1); i++) idx = v.text.indexOf(ans, idx + 1);
    if (idx < 0) return err(w + ': 找不到指定的出現位置');
    blank = v.text.slice(0, idx) + '【____】' + v.text.slice(idx + ans.length);
  }
  o.forEach((x2) => { if (x2.length > 1 && v.text.includes(x2)) err(`${w}: 干擾選項「${x2}」出現在經文裡`); });
  d.verses.push({ id: 'v_' + pad(++n), difficulty: diff || 2, ref: v.ref, fullText: v.text, blankText: blank, answer: ans, options: opts(ans, o, w), hint, bookNo: v.bookNo, chap: v.chap, meaning, mistakeExplanation: x });
});
// 名言
n = BASE.quotes;
opt('src_quotes').forEach(([who, ref, quote, occasion, o, clues, x, diff, al]) => {
  const w = 'quote ' + ref;
  const v = need(ref, quote, w);
  if (!v) return;
  d.quotes.push({ id: 'quote_' + pad(++n), difficulty: diff || 2, name: who, aliases: al || [], quote, occasion, clues: ['場合：' + occasion + '。', ...clues], options: opts(who, o, w), bookNo: v.bookNo, chap: v.chap, verseRef: v.ref, verseText: v.shown, mistakeExplanation: x });
});
// 數字與知識
n = BASE.trivia;
const seenQ = new Set(d.trivia.map((q) => q.question));
opt('src_trivia').forEach(([question, ans, o, clues, ref, key, x, diff]) => {
  const w = 'trivia ' + question.slice(0, 14);
  if (seenQ.has(question)) return err(w + ': 題目重複');
  seenQ.add(question);
  const v = need(ref, key, w);
  if (!v) return;
  d.trivia.push({ id: 'trivia_' + pad(++n), difficulty: diff || 2, name: ans, question, clues, options: opts(ans, o, w), bookNo: v.bookNo, chap: v.chap, verseRef: v.ref, verseText: v.shown, mistakeExplanation: x });
});
// 比喻與神蹟
n = BASE.parables;
const paraNames = names('parables');
opt('src_parables').forEach((c) => {
  const w = 'parable ' + c.n;
  if (paraNames.has(c.n)) return err(w + ': 重複');
  paraNames.add(c.n);
  const v = need(c.r, c.k, w);
  if (!v) return;
  if (c.cl.length !== 4) err(w + ': 需 4 條線索');
  d.parables.push({ id: 'para_' + pad(++n), difficulty: c.d || 2, name: c.n, title: c.n, clues: c.cl, options: opts(c.n, c.o, w), bookNo: v.bookNo, chap: v.chap, verseRef: v.ref, verseText: v.shown, notes: c.b, mistakeExplanation: c.x });
});
// 書卷
n = BASE.books;
const bookNames = names('books');
opt('src_books').forEach((c) => {
  const w = 'book ' + c.n;
  if (bookNames.has(c.n)) return err(w + ': 重複');
  bookNames.add(c.n);
  if (!L.byName[c.n]) return err(w + ': 不是書卷名');
  const v = need(c.r, c.k, w);
  if (!v) return;
  if (v.bookNo !== L.byName[c.n].no) err(w + ': 金句不在本書卷');
  if (c.cl.length !== 4) err(w + ': 需 4 條線索');
  c.o.forEach((x2) => { if (!L.byName[x2]) err(w + ': 選項不是書卷名 ' + x2); });
  d.books.push({ id: 'book_' + pad(++n), difficulty: c.d || 2, name: c.n, clues: c.cl, options: opts(c.n, c.o, w), bookNo: v.bookNo, chap: v.chap, verseRef: v.ref, verseText: v.shown, notes: c.b || '', mistakeExplanation: c.x });
});
const missingBooks = L.books.filter((b) => !d.books.some((q) => q.name === b.zh)).map((b) => b.zh);
// 經文重組
n = BASE.scrambles;
const seenS = new Set(d.scrambles.map((q) => q.ref));
opt('src_scrambles').forEach(([ref, theme, diff]) => {
  const v = need(ref, null, 'scramble ' + ref);
  if (!v) return;
  if (seenS.has(v.ref)) return err('scramble ' + ref + ': 重複');
  seenS.add(v.ref);
  const tokens = L.tokenize(v.text, 9);
  if (tokens.length < 3) err('scramble ' + ref + ': 詞組太少');
  n++;
  d.scrambles.push({ id: 'scramble_' + pad(n), level: n, difficulty: diff || (tokens.length <= 4 ? 1 : tokens.length <= 6 ? 2 : 3), ref: v.ref, theme, tokens, fullText: v.text });
});
const meaningByRef = {};
d.verses.forEach((q) => { meaningByRef[q.ref] = q.meaning; });
d.scrambles.forEach((q) => { if (!q.meaning && meaningByRef[q.ref]) q.meaning = meaningByRef[q.ref]; });
// 配對
n = BASE.matches;
opt('src_matches').forEach(([title, hint, diff, pairs]) => {
  const w = 'match ' + title;
  if (new Set(pairs.map((p) => p[0])).size !== pairs.length || new Set(pairs.map((p) => p[1])).size !== pairs.length) err(w + ': 左右欄不可重複');
  n++;
  d.matches.push({
    id: 'match_' + pad(n), level: n, difficulty: diff, title, hint,
    pairs: pairs.map(([left, right, explanation, ref]) => {
      const o = { left, right, explanation };
      if (ref) { const v = need(ref, null, w); if (v) o.ref = v.ref; }
      return o;
    })
  });
});
// 年代排序
n = BASE.timelineDecks;
opt('src_timelines').forEach(([title, desc, events]) => {
  n++;
  d.timelineDecks.push({ id: 'time_' + pad(n), title, desc, events: events.map(([text, year, era, note], i) => ({ id: 'e' + n + '_' + (i + 1), text, year, era, note })) });
});
// 十字填字
n = BASE.crosswords;
const CN = '零一二三四五六七八九十';
const cnNum = (x) => (x <= 10 ? CN[x] : x < 20 ? '十' + CN[x - 10] : CN[Math.floor(x / 10)] + '十' + (x % 10 ? CN[x % 10] : ''));
const cwSrc = opt('src_crosswords');
// 橋接詞庫：既有 20 關與新關卡的全部詞（皆附提示）
const bridgeClue = {};
d.crosswords.forEach((cw) => cw.words.forEach((w) => { if (!bridgeClue[w.answer]) bridgeClue[w.answer] = [w.answer, w.clue, w.info]; }));
cwSrc.forEach(([, , ws]) => ws.forEach((w) => { if (!bridgeClue[w[0]]) bridgeClue[w[0]] = w; }));
const bridgeWords = Object.keys(bridgeClue).filter((w) => w.length >= 2 && w.length <= 5);
cwSrc.forEach(([title, desc, words]) => {
  const g = layout(words.map((x) => x[0]), bridgeWords);
  const themed = g.words.filter((w) => !w.bridge).length;
  if (g.words.length < 7 || themed < 5) return console.log(`  填字「${title}」主題詞只排進 ${themed} 個，本關略過`);
  if (false) return err(`crossword ${title}: 只排進 ${g.words.length} 詞，無法交叉：${g.unplaced.join('、')}`);
  if (g.unplaced.length) console.log(`  填字「${title}」略過：${g.unplaced.join('、')}`);
  n++;
  d.crosswords.push({
    id: 'cw_' + pad(n), title: '第' + cnNum(n) + '關：' + title, desc, rows: g.rows, cols: g.cols,
    words: g.words.map((p) => { const src = words.find((x) => x[0] === p.answer) || bridgeClue[p.answer]; return { answer: p.answer, r: p.r, c: p.c, dir: p.dir, clue: src[1], info: src[2] }; })
  });
});
// 是非快答
d.truefalse = opt('src_truefalse').map(([statement, answer, explanation, ref, key, diff], i) => {
  const v = need(ref, key, 'tf ' + statement.slice(0, 12));
  return { id: 'tf_' + pad(i + 1, 3), difficulty: diff || 2, name: answer ? '對' : '錯', statement, answer: !!answer, options: ['對', '錯'], explanation, verseRef: v ? v.ref : '', verseText: v ? v.shown : '', bookNo: v ? v.bookNo : 0, chap: v ? v.chap : 0 };
});
// 成就
d.achievements = d.achievements.concat(opt('src_achievements'));

/* ---------- 3. 全庫驗證 ---------- */
const ids = new Set();
Object.keys(d).forEach((k) => (Array.isArray(d[k]) ? d[k] : []).forEach((q) => {
  if (!q || !q.id) return;
  if (ids.has(q.id)) err('id 重複 ' + q.id);
  ids.add(q.id);
}));
['characters', 'places', 'quotes', 'trivia', 'parables', 'books', 'verses'].forEach((k) => d[k].forEach((q) => {
  const ans = q.name || q.answer;
  if (!q.options || q.options.length !== 4 || !q.options.includes(ans) || new Set(q.options).size !== 4) err(`${q.id}: 選項異常`);
  if (k !== 'verses' && (!q.clues || !q.clues.length)) err(`${q.id}: 沒有線索`);
  if (![1, 2, 3].includes(q.difficulty)) err(`${q.id}: 難度異常`);
}));
d.verses.forEach((q) => { if (!q.fullText.includes(q.answer) || !q.blankText.includes('【')) err(q.id + ': 填空異常'); });
d.scrambles.forEach((q) => { if (q.tokens.join('') !== q.fullText) err(q.id + ': 詞組與全文不符'); });
d.crosswords.forEach((cw) => {
  const grid = {};
  cw.words.forEach((w) => [...w.answer].forEach((ch, i) => {
    const r = w.r + (w.dir === 'down' ? i : 0);
    const c = w.c + (w.dir === 'across' ? i : 0);
    const k = r + ',' + c;
    if (r < 0 || c < 0 || r >= cw.rows || c >= cw.cols) err(cw.id + ': 超出邊界 ' + w.answer);
    if (grid[k] && grid[k] !== ch) err(`${cw.id}: 交叉衝突 ${w.answer} @${k}`);
    grid[k] = ch;
  }));
});
const achIds = new Set();
d.achievements.forEach((a) => { if (achIds.has(a.id)) err('成就重複 ' + a.id); achIds.add(a.id); });

const counts = {};
Object.keys(d).forEach((k) => { if (Array.isArray(d[k])) counts[k] = d[k].length; });
const quizTotal = ['characters', 'places', 'verses', 'quotes', 'trivia', 'parables', 'books', 'truefalse'].reduce((a, k) => a + (counts[k] || 0), 0);
const levelTotal = ['scrambles', 'matches', 'timelineDecks', 'crosswords'].reduce((a, k) => a + counts[k], 0);
console.log('既有引文校正', fixed, '筆');
console.log(counts);
console.log('題目', quizTotal, '＋關卡', levelTotal, '＝', quizTotal + levelTotal, '（v2：630）');
if (missingBooks.length) console.log('尚未收錄的書卷：', missingBooks.join(' '));
if (errors.length) { console.log('\n✗ ' + errors.length + ' 個問題：\n' + errors.join('\n')); process.exit(1); }
if (!CHECK) {
  const c = counts;
  const header = `/**
 * Biblia 聖經挑戰 (Bible Quests) 題庫與成就資料
 * -------------------------------------------------------------------------
 * 本檔由 scripts/data_expansion/v3/build.js 產生；所有引用經文皆取自內建和合本
 * (app/data/text/zh_unv)，並於建置時逐筆驗證。請修改 v3/src_*.js 後重新建置，不要手改本檔。
 *
 * 猜人名 ${c.characters}・猜地名 ${c.places}・經文填空 ${c.verses}・誰說這句話 ${c.quotes}・數字與知識 ${c.trivia}・
 * 比喻與神蹟 ${c.parables}・書卷 ${c.books}・是非快答 ${c.truefalse || 0}・經文重組 ${c.scrambles}・配對 ${c.matches}・
 * 十字填字 ${c.crosswords}・年代排序 ${c.timelineDecks}・成就 ${c.achievements}
 */`;
  L.writeData(d, header);
  fs.writeFileSync(path.join(__dirname, 'counts.json'), JSON.stringify(Object.assign({ quizTotal, levelTotal }, counts), null, 2) + '\n');
  console.log('✓ 已寫入 challenge_data.js');
}
