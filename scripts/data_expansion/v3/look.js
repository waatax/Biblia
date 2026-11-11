/* 查經文：node look.js "創 2:24" "詩 23:1-3" …（可用書卷簡稱），輸出題庫顯示用文字 */
const L = require('./lib');
const ab = {}; L.books.forEach((b) => { ab[b.ab] = b.zh; });
const full = (r) => r.replace(/^([一-龥]+)\s*/, (m, n) => (ab[n] || n) + ' ');
module.exports = { full };
if (require.main === module) {
  process.argv.slice(2).join(' ').split(/\s*[,;]\s*/).filter(Boolean).forEach((r) => {
    const t = L.refText(full(r)); console.log(r + '｜' + (t || '??? NOT FOUND'));
  });
}
