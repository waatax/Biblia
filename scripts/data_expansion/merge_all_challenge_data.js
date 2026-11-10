// merge_all_challenge_data.js
const fs = require('fs');
const path = require('path');
const vm = require('vm');

// 1. Read existing challenge_data.js
const existingCode = fs.readFileSync(path.join(__dirname, '../../app/data/challenge_data.js'), 'utf8');
const ctx = { window: {} };
vm.runInNewContext(existingCode, ctx);
const baseData = ctx.window.BIBLIA_CHALLENGE_DATA;

// 2. Read all new JSON files
const newChars1 = JSON.parse(fs.readFileSync(path.join(__dirname, 'new_characters_1.json'), 'utf8'));
const newChars2 = JSON.parse(fs.readFileSync(path.join(__dirname, 'new_characters_2.json'), 'utf8'));
const newChars3 = JSON.parse(fs.readFileSync(path.join(__dirname, 'new_characters_3.json'), 'utf8'));

const newPlaces1 = JSON.parse(fs.readFileSync(path.join(__dirname, 'new_places_1.json'), 'utf8'));
const newPlaces2 = JSON.parse(fs.readFileSync(path.join(__dirname, 'new_places_2.json'), 'utf8'));

const newVerses = JSON.parse(fs.readFileSync(path.join(__dirname, 'new_verses.json'), 'utf8'));
const newCrosswords = JSON.parse(fs.readFileSync(path.join(__dirname, 'new_crosswords.json'), 'utf8'));
const newTimelines = JSON.parse(fs.readFileSync(path.join(__dirname, 'new_timelines.json'), 'utf8'));
const newAchievements = JSON.parse(fs.readFileSync(path.join(__dirname, 'new_achievements.json'), 'utf8'));

const newQuotes1 = JSON.parse(fs.readFileSync(path.join(__dirname, 'new_quotes_1.json'), 'utf8'));
const newQuotes2 = JSON.parse(fs.readFileSync(path.join(__dirname, 'new_quotes_2.json'), 'utf8'));

const newTrivia = JSON.parse(fs.readFileSync(path.join(__dirname, 'new_trivia.json'), 'utf8'));
const newParables = JSON.parse(fs.readFileSync(path.join(__dirname, 'new_parables.json'), 'utf8'));
const newBooks = JSON.parse(fs.readFileSync(path.join(__dirname, 'new_books.json'), 'utf8'));
const newScrambles = JSON.parse(fs.readFileSync(path.join(__dirname, 'new_scrambles.json'), 'utf8'));
const newMatches = JSON.parse(fs.readFileSync(path.join(__dirname, 'new_matches.json'), 'utf8'));

// 3. Assemble merged data (slice base items to original counts for idempotence)
const baseChars = baseData.characters.slice(0, 74);
const basePlaces = baseData.places.slice(0, 49);
const baseVerses = baseData.verses.slice(0, 65);
const baseCWs = baseData.crosswords.slice(0, 10);
const baseTimelines = baseData.timelineDecks.slice(0, 10);
const baseAchs = baseData.achievements.slice(0, 24);

const mergedData = {
  characters: [...baseChars, ...newChars1, ...newChars2, ...newChars3],
  places: [...basePlaces, ...newPlaces1, ...newPlaces2],
  verses: [...baseVerses, ...newVerses],
  crosswords: [...baseCWs, ...newCrosswords],
  timelineDecks: [...baseTimelines, ...newTimelines],
  achievements: [...baseAchs, ...newAchievements],
  quotes: [...newQuotes1, ...newQuotes2],
  trivia: newTrivia,
  parables: newParables,
  books: newBooks,
  scrambles: newScrambles,
  matches: newMatches,
  learningTips: baseData.learningTips
};

// 4. Verify uniqueness of IDs within each category
const checkUniqueIds = (arr, name) => {
  const ids = new Set();
  arr.forEach((item, idx) => {
    if (!item.id) {
      console.error(`Missing id in ${name}[${idx}]`);
      process.exit(1);
    }
    if (ids.has(item.id)) {
      console.error(`Duplicate id '${item.id}' in ${name}[${idx}]`);
      process.exit(1);
    }
    ids.add(item.id);
  });
  console.log(`✓ ${name}: ${arr.length} items, all unique IDs.`);
};

checkUniqueIds(mergedData.characters, 'characters');
checkUniqueIds(mergedData.places, 'places');
checkUniqueIds(mergedData.verses, 'verses');
checkUniqueIds(mergedData.crosswords, 'crosswords');
checkUniqueIds(mergedData.timelineDecks, 'timelineDecks');
checkUniqueIds(mergedData.achievements, 'achievements');
checkUniqueIds(mergedData.quotes, 'quotes');
checkUniqueIds(mergedData.trivia, 'trivia');
checkUniqueIds(mergedData.parables, 'parables');
checkUniqueIds(mergedData.books, 'books');
checkUniqueIds(mergedData.scrambles, 'scrambles');
checkUniqueIds(mergedData.matches, 'matches');

// 5. Generate output JS content
const header = `/**
 * Biblia 聖經挑戰與益智小遊戲 題庫與成就資料庫 (Bible Challenge & Mini-Games Data)
 * -------------------------------------------------------------------------
 * 全方位 2× 翻倍旗艦升級版：
 * 1. 猜聖經人名 (Who Am I? — 150 位核心聖經人物、四階段漸進線索與百科連結)
 * 2. 猜聖經地名 (Where Is It? — 100 處關鍵聖經地理座標、歷史事件與地圖連結)
 * 3. 經典經文填空 (Scripture Cloze — 130 節精選和合本金句，挖空理解核心真理)
 * 4. 聖經填字遊戲 (Bible Crossword — 20 大精心交織關卡，全盤 100% 幾何文字交叉驗證)
 * 5. 救贖歷史時間線 (Redemption Timeline — 20 大歷史牌組，卡牌排序與歷史脈絡)
 * 6. 誰說了這句話 (Who Said It? — 50 道聖經名言出處與情境挑戰)
 * 7. 聖經數字與奧祕 (Bible Trivia — 50 道聖經數字、歷史、制度與深層奧祕考題)
 * 8. 耶穌比喻與神蹟 (Parables & Miracles — 40 道經典比喻與超凡神蹟辨識)
 * 9. 聖經書卷正典解密 (Canon Detective — 40 卷聖經書卷結構、主題與金句解密)
 * 10. 經文重組大師 (Verse Scramble — 30 關經典金句碎片拖曳重組遊戲)
 * 11. 奇妙聖經配對 (Bible Match — 20 關聖經關聯卡片配對益智遊戲)
 * 12. 全能綜合挑戰 (Grand Mixed Quiz — 融合全題庫的極限聖經知識大考驗)
 *
 * 榮譽勳章成就系統：共 48 項成就 (包含 24 項原有成就 + 24 項全新進階成就)
 * 遵循 Offline-First 設計，支援 PWA Service Worker 完全離線遊玩。
 */

(function(window) {
  'use strict';

  const CHALLENGE_DATA = ${JSON.stringify(mergedData, null, 2)};

  // Expose to window
  window.BIBLIA_CHALLENGE_DATA = CHALLENGE_DATA;
})(window);
`;

const outputPath = path.join(__dirname, '../../app/data/challenge_data.js');
fs.writeFileSync(outputPath, header, 'utf8');
console.log(`\n🎉 Successfully merged all challenge data into ${outputPath}!`);
console.log(`File size: ${(fs.statSync(outputPath).size / 1024).toFixed(1)} KB`);
