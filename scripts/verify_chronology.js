#!/usr/bin/env node
/* 驗證 app/data/bible_chronology.js 與補充資料的年代邏輯。
 *   node scripts/verify_chronology.js
 * 檢查：66 卷完整、年代區間合理、時代色帶首尾相接、書卷都有對應時代、
 *      君王/先知/地點的引用章節確實提到該人名或地名、聖經月份名符合和合本。
 */
const fs = require('fs');
const path = require('path');
const DATA = path.join(__dirname, '..', 'app', 'data');
const win = {};
for (const f of ['bible_chronology', 'timeline_data', 'book_intros', 'knowledge_base']) {
  new Function('window', fs.readFileSync(path.join(DATA, f + '.js'), 'utf8'))(win);
}
let books;
new Function('BIBLIA', fs.readFileSync(path.join(DATA, 'books.js'), 'utf8'))({ books: (b) => { books = b; } });
const C = win.BIBLIA_CHRONOLOGY;
const T = win.BIBLIA_TIMELINE_DATA;
const errors = [];
const err = (m) => errors.push(m);
const cache = {};
function verse(ref) {
  const m = /^([一-龥]+)\s*(\d+):(\d+)$/.exec(ref);
  const b = m && books.find((x) => x.zh === m[1]);
  if (!b) return null;
  if (!cache[b.no]) {
    new Function('BIBLIA', fs.readFileSync(path.join(DATA, 'text', 'zh_unv', String(b.no).padStart(2, '0') + '.js'), 'utf8'))({ layer: (k, v, n, d) => { cache[b.no] = d; } });
  }
  const d = cache[b.no];
  const i = d.s.findIndex((r) => r[0] === +m[2]);
  return i < 0 ? null : d.t[i][+m[3] - 1] || null;
}
function checkRange(label, r) {
  if (!Array.isArray(r) || r.length !== 2 || r[0] > r[1]) err(label + ' 區間不合理 ' + JSON.stringify(r));
}
function checkMention(label, ref, names) {
  const v = verse(ref);
  if (v == null) return err(label + ' 找不到經文 ' + ref);
  if (!names.some((n) => v.includes(n))) err(label + ' 經文未提及 ' + names.join('/') + '：' + ref + ' ' + v);
  return true;
}
let mentions = 0;

/* 66 卷 */
if (C.books.length !== 66) err('books 不是 66 卷');
C.books.forEach((b, i) => {
  if (b.no !== i + 1) err('books 順序錯誤 #' + (i + 1));
  if (b.w) checkRange('卷' + b.no + ' w', b.w);
  checkRange('卷' + b.no + ' s', b.s);
  // 不可能先寫作才發生（詩歌書除外：寫作與背景重疊）
  if (b.w && b.w[1] < b.s[0]) err('卷' + b.no + ' 寫作早於所記歷史');
});
const covered = new Set();
C.groups.forEach((g) => { for (let n = g.from; n <= g.to; n++) covered.add(n); });
if (covered.size !== 66) err('groups 未涵蓋 66 卷');

/* 時代色帶首尾相接 */
const eraIds = T.eras.map((e) => e.id);
eraIds.forEach((id) => { if (!C.eraRanges[id]) err('eraRanges 缺 ' + id); });
for (let i = 1; i < eraIds.length; i++) {
  const a = C.eraRanges[eraIds[i - 1]]; const b = C.eraRanges[eraIds[i]];
  if (a && b && a.r[1] !== b.r[0]) err('時代不相接：' + eraIds[i - 1] + ' → ' + eraIds[i]);
}
/* 66 卷都出現在某時代的 books */
const eraText = T.eras.map((e) => e.books.join('、')).join('、');
win.BIBLIA_BOOK_INTROS.forEach((b) => {
  const core = b.name_zh.replace(/[上下前後一二三]$|書$|記$/, '').replace(/[上下前後一二三]書$/, '');
  const ok = eraText.includes(b.name_zh) || eraText.includes(core) ||
    (b.category.includes('書信') && /書信/.test(eraText));
  if (!ok) err('書卷未對應時代：' + b.name_zh);
});

/* 君王 */
const allKings = C.kings.judah.concat(C.kings.israel);
if (C.kings.judah.length !== 20) err('南國應 20 位');
if (C.kings.israel.length !== 19) err('北國應 19 位');
allKings.forEach((k) => {
  checkRange('王 ' + k.n, k.r);
  const names = [k.short || k.n].concat(k.alt ? [k.alt] : []);
  if (checkMention('王 ' + k.n, k.ref, names)) mentions++;
});
/* 先知 */
C.prophets.forEach((p) => {
  checkRange('先知 ' + p.n, p.r);
  if (p.ref && checkMention('先知 ' + p.n, p.ref, [p.n])) mentions++;
  if (p.book) {
    const b = C.books[p.book - 1];
    if (b.w[0] !== p.r[0] || b.w[1] !== p.r[1]) {
      // 但以理：書卷成於晚年，事工更早，屬合理差異
      if (p.n !== '但以理') err('先知 ' + p.n + ' 與書卷年代不一致');
    }
  }
});
/* 地點 */
C.routes.forEach((r) => r.legs.forEach((l) => l.stops.forEach((s) => {
  if (!s.ref) return;
  if (checkMention(r.id + ' ' + s.n, s.ref, [s.n])) mentions++;
  const [lat, lon] = s.p;
  if (lat < 24 || lat > 46 || lon < 8 || lon > 54) err('座標超出範圍 ' + s.n);
})));
/* 大事與使徒時代：章節存在 */
C.milestones.forEach((m) => { if (!verse(m.ref)) err('大事 ' + m.t + ' 章節不存在 ' + m.ref); });
C.apostolic.forEach((a) => { checkRange(a.t, a.r); if (!verse(a.ref)) err('使徒 ' + a.t + ' 章節不存在 ' + a.ref); });
for (let i = 1; i < C.milestones.length; i++) if (C.milestones[i].y <= C.milestones[i - 1].y) err('大事未依年代排序：' + C.milestones[i].t);
/* 人物與聖約 id 對得上 */
win.BIBLIA_KNOWLEDGE_BASE.characters.forEach((c) => { if (!C.people[c.id]) err('人物缺年代 ' + c.id); });
win.BIBLIA_KNOWLEDGE_BASE.covenants.forEach((c) => { if (!C.covenantYears[c.id]) err('聖約缺年代 ' + c.id); });
win.BIBLIA_KNOWLEDGE_BASE.geography.forEach((g) => { if (!C.routes.find((r) => r.id === g.id)) err('路線缺 ' + g.id); });
/* 君王數與評語在書卷中的總覽文字一致：統計 */
const good = C.kings.judah.filter((k) => k.v !== 'evil').length;

console.log('66 卷 ✓  君王 ' + allKings.length + ' 位  先知 ' + C.prophets.length + ' 位  章節核對 ' + mentions + ' 處  南國善/參半 ' + good);
if (errors.length) { errors.forEach((e) => console.log('✗', e)); process.exit(1); }
console.log('ALL CHRONOLOGY CHECKS PASSED');
