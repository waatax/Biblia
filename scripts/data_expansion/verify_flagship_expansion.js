// verify_flagship_expansion.js
const fs = require('fs');
const path = require('path');
const vm = require('vm');

console.log('=== BIBLIA CHALLENGE 2× FLAGSHIP EXPANSION VERIFICATION ===\n');

// 1. Verify challenge_data.js
const dataCode = fs.readFileSync(path.join(__dirname, '../../app/data/challenge_data.js'), 'utf8');
const dataCtx = { window: {} };
vm.runInNewContext(dataCode, dataCtx);
const d = dataCtx.window.BIBLIA_CHALLENGE_DATA;

const EXPECTED = {
  characters: 150,
  places: 100,
  verses: 130,
  quotes: 50,
  trivia: 50,
  parables: 40,
  books: 40,
  scrambles: 30,
  matches: 20,
  crosswords: 20,
  timelineDecks: 20,
  achievements: 48
};

let errors = 0;

for (const [key, count] of Object.entries(EXPECTED)) {
  const actual = (d[key] || []).length;
  if (actual === count) {
    console.log(`✓ ${key.padEnd(15)}: ${actual} items (matches expected ${count})`);
  } else {
    console.error(`✗ ${key.padEnd(15)}: ${actual} items (EXPECTED ${count})`);
    errors++;
  }
}

// 2. Verify unique IDs
for (const key of Object.keys(EXPECTED)) {
  const ids = new Set();
  (d[key] || []).forEach((item, idx) => {
    if (!item.id) {
      console.error(`Missing id in ${key}[${idx}]`);
      errors++;
    } else if (ids.has(item.id)) {
      console.error(`Duplicate id '${item.id}' in ${key}`);
      errors++;
    } else {
      ids.add(item.id);
    }
  });
}
console.log('✓ All items in all 12 categories have unique IDs.');

// 3. Verify Scrambles tokens match fullText
d.scrambles.forEach(s => {
  if (s.tokens.join('') !== s.fullText) {
    console.error(`Scramble mismatch in ${s.id}`);
    errors++;
  }
});
console.log('✓ All 30 verse scramble levels tokens match fullText.');

// 4. Verify Matches have complete pairs
d.matches.forEach(m => {
  if (!m.pairs || m.pairs.length !== 4) {
    console.error(`Match level ${m.id} does not have 4 pairs`);
    errors++;
  }
  m.pairs.forEach(p => {
    if (!p.left || !p.right || !p.explanation) {
      console.error(`Incomplete pair in match level ${m.id}`);
      errors++;
    }
  });
});
console.log('✓ All 20 match levels have 4 complete pairs with explanations.');

// 5. Verify Crosswords intersection geometry for all 20 puzzles
d.crosswords.forEach(cw => {
  const grid = {};
  cw.words.forEach(w => {
    for (let i = 0; i < w.answer.length; i++) {
      const r = w.dir === 'across' ? w.r : w.r + i;
      const c = w.dir === 'across' ? w.c + i : w.c;
      const key = `${r}_${c}`;
      const ch = w.answer[i];
      if (grid[key] && grid[key] !== ch) {
        console.error(`Crossword ${cw.id} intersection conflict at (${r},${c}): '${grid[key]}' vs '${ch}'`);
        errors++;
      }
      grid[key] = ch;
    }
  });
});
console.log('✓ All 20 crossword levels verified: 0 grid/character intersection conflicts.');

// 6. Verify Service Worker version
const swCode = fs.readFileSync(path.join(__dirname, '../../app/sw.js'), 'utf8');
const shellCacheMatch = swCode.match(/const SHELL_CACHE = 'biblia-shell-v(\d+)';/);
if (shellCacheMatch && parseInt(shellCacheMatch[1], 10) >= 43) {
  console.log(`✓ Service Worker shell cache correctly set to biblia-shell-v${shellCacheMatch[1]}.`);
} else {
  console.error('✗ Service Worker shell cache is not valid!');
  errors++;
}

// 7. Verify challenge.html contains all 14 view panels and 14 tabs
const html = fs.readFileSync(path.join(__dirname, '../../app/challenge.html'), 'utf8');
const requiredViews = [
  'viewCharacters', 'viewPlaces', 'viewVerses', 'viewQuotes', 'viewTrivia',
  'viewParables', 'viewBooks', 'viewScramble', 'viewMatch', 'viewMixed',
  'viewCrossword', 'viewTimeline', 'viewMistakes', 'viewEncyclopedia'
];
requiredViews.forEach(v => {
  if (html.includes(`id="${v}"`)) {
    // ok
  } else {
    console.error(`Missing view section id="${v}" in challenge.html`);
    errors++;
  }
});
console.log('✓ All 14 view sections found in challenge.html.');

// 8. Verify challenge.js ACH_VALUE covers all 48 achievements
const jsCode = fs.readFileSync(path.join(__dirname, '../../app/challenge.js'), 'utf8');
d.achievements.forEach(ach => {
  if (!jsCode.includes(`${ach.id}:`)) {
    console.error(`Missing evaluator for achievement '${ach.id}' in challenge.js ACH_VALUE`);
    errors++;
  }
});
console.log('✓ All 48 achievements have evaluators in ACH_VALUE in challenge.js.');

console.log(`\n=================================================`);
if (errors === 0) {
  console.log('🎉 ALL CHECKS PASSED WITH 0 ERRORS! READY FOR DEPLOYMENT.');
} else {
  console.error(`❌ Verification failed with ${errors} errors.`);
  process.exit(1);
}
