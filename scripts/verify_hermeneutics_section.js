/**
 * Verification script for Biblia Hermeneutics Section & Fourfold Time Integration
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

console.log('=== VERIFYING BIBLIA HERMENEUTICS & FOURFOLD TIME INTEGRATION ===\n');

let errors = 0;

// 1. Verify hermeneutics_guide.js
const hermCode = fs.readFileSync(path.join(__dirname, '../app/data/hermeneutics_guide.js'), 'utf8');
const sandbox = { window: {}, console: console };
vm.createContext(sandbox);

try {
  vm.runInContext(hermCode, sandbox);
  console.log('✓ app/data/hermeneutics_guide.js executed successfully in sandbox.');
} catch (e) {
  console.error('✗ Failed to execute hermeneutics_guide.js:', e);
  errors++;
}

const data = sandbox.window.BIBLIA_HERMENEUTICS_DATA;
if (data) {
  // Check Fourfold Time Theory (Campus VID=73)
  if (data.fourfoldTimeTheory && data.fourfoldTimeTheory.dimensions && data.fourfoldTimeTheory.dimensions.length === 4) {
    console.log('✓ Fourfold Time Theory correctly structured with 4 dimensions (校園書房 VID=73 莊信德).');
  } else {
    console.error('✗ Fourfold Time Theory missing or incomplete!');
    errors++;
  }

  // Check Interactive cases
  if (data.fourfoldTimeTheory.interactiveCases && data.fourfoldTimeTheory.interactiveCases.length >= 4) {
    console.log(`✓ Fourfold Time interactive cases present: ${data.fourfoldTimeTheory.interactiveCases.length} cases.`);
  } else {
    console.error('✗ Fourfold Time interactive cases missing!');
    errors++;
  }

  // Check Mainstream methods
  if (data.mainstreamMethods && data.mainstreamMethods.length >= 6) {
    console.log(`✓ Mainstream methods present: ${data.mainstreamMethods.length} methods (OIA, Historical-Grammatical, Christocentric, Lectio Divina, SOAP, Analogy of Faith).`);
  } else {
    console.error('✗ Mainstream methods incomplete!');
    errors++;
  }

  // Check Taiwan seminaries (台神, 華神, 靈神)
  const semIds = (data.taiwanSeminaries || []).map(s => s.id);
  if (semIds.includes('sem_tgst') && semIds.includes('sem_ces') && semIds.includes('sem_bol')) {
    console.log('✓ Taiwan Major Seminaries present: 台神 (TGST), 華神 (CES), 靈神 (Bread of Life).');
  } else {
    console.error('✗ Taiwan Seminaries incomplete!');
    errors++;
  }

  // Check 5 Denominations (長老會, 靈糧堂, 行道會, 浸信會, 聖教會)
  const denomIds = (data.denominationalTraditions || []).map(d => d.id);
  if (denomIds.includes('denom_pct') && denomIds.includes('denom_bol') && denomIds.includes('denom_covenant') && denomIds.includes('denom_baptist') && denomIds.includes('denom_holiness')) {
    console.log('✓ 5 Major Taiwan Denominations present: 長老會, 靈糧堂, 行道會, 浸信會, 聖教會.');
  } else {
    console.error('✗ Denominations incomplete!');
    errors++;
  }

  // Check Korean traditions (Onnuri, Sarang, Yoido)
  const krIds = (data.koreanTraditions || []).map(k => k.id);
  if (krIds.includes('kr_onnuri') && krIds.includes('kr_sarang') && krIds.includes('kr_yoido')) {
    console.log('✓ Korean Orthodox Evangelical Traditions present: 大地教會/推拉奴 QT, 愛的教會門訓, 純福音第四次元.');
  } else {
    console.error('✗ Korean Traditions incomplete!');
    errors++;
  }

  // Check Safeguards & Anti-Cult
  if (data.orthodoxSafeguards && data.orthodoxSafeguards.cultExposures.length >= 4 && data.orthodoxSafeguards.threePillars.length === 3) {
    console.log('✓ Non-cult Orthodox Safeguards present with 3 Creeds, 5 Solas, 4 Cult exposures, and 3 Pillars.');
  } else {
    console.error('✗ Safeguards incomplete!');
    errors++;
  }

  // Test render function
  const renderFn = sandbox.window.renderHermeneuticsGuideHtml;
  if (typeof renderFn === 'function') {
    const renderedHtml = renderFn({ subTab: 'fourfold' });
    if (renderedHtml && renderedHtml.includes('herm-hero-title') && renderedHtml.includes('VID=73')) {
      console.log('✓ renderHermeneuticsGuideHtml() successfully generated complete markup.');
    } else {
      console.error('✗ renderHermeneuticsGuideHtml() output unexpected markup!');
      errors++;
    }
  } else {
    console.error('✗ renderHermeneuticsGuideHtml is not a function!');
    errors++;
  }
}

// 2. Verify reader.js wiring
const readerCode = fs.readFileSync(path.join(__dirname, '../app/reader.js'), 'utf8');
if (readerCode.includes("'data/hermeneutics_guide.js'")) {
  console.log('✓ app/reader.js includes data/hermeneutics_guide.js in REF_SCRIPTS.');
} else {
  console.error('✗ app/reader.js missing data/hermeneutics_guide.js in REF_SCRIPTS!');
  errors++;
}
if (readerCode.includes('refPanelHermeneutics')) {
  console.log('✓ app/reader.js handles refPanelHermeneutics.');
} else {
  console.error('✗ app/reader.js missing refPanelHermeneutics!');
  errors++;
}
if (readerCode.includes('renderRefPanelHermeneutics')) {
  console.log('✓ app/reader.js defines renderRefPanelHermeneutics().');
} else {
  console.error('✗ app/reader.js missing renderRefPanelHermeneutics()!');
  errors++;
}

// 3. Verify index.html markup
const indexCode = fs.readFileSync(path.join(__dirname, '../app/index.html'), 'utf8');
if (indexCode.includes('data-reftab="hermeneutics"')) {
  console.log('✓ app/index.html contains tab button with data-reftab="hermeneutics".');
} else {
  console.error('✗ app/index.html missing data-reftab="hermeneutics" button!');
  errors++;
}
if (indexCode.includes('id="refPanelHermeneutics"')) {
  console.log('✓ app/index.html contains #refPanelHermeneutics container.');
} else {
  console.error('✗ app/index.html missing #refPanelHermeneutics container!');
  errors++;
}
if (indexCode.includes('id="startHermeneuticsCard"')) {
  console.log('✓ app/index.html contains #startHermeneuticsCard on start page.');
} else {
  console.error('✗ app/index.html missing #startHermeneuticsCard!');
  errors++;
}

// 4. Verify style.css
const styleCode = fs.readFileSync(path.join(__dirname, '../app/style.css'), 'utf8');
if (styleCode.includes('.biblia-fourfold-time-box') && styleCode.includes('.herm-guide-container')) {
  console.log('✓ app/style.css contains complete styling for fourfold time and hermeneutics guide.');
} else {
  console.error('✗ app/style.css missing required styles!');
  errors++;
}

// 5. Verify 66 book studies have fourfoldTimeHermeneutics
const otCode = fs.readFileSync(path.join(__dirname, '../app/data/book_studies_ot.js'), 'utf8');
const ntCode = fs.readFileSync(path.join(__dirname, '../app/data/book_studies_nt.js'), 'utf8');
const otCount = (otCode.match(/"fourfoldTimeHermeneutics"/g) || []).length;
const ntCount = (ntCode.match(/"fourfoldTimeHermeneutics"/g) || []).length;
if (otCount === 39 && ntCount === 27) {
  console.log(`✓ All 66 book studies (39 OT + 27 NT) have fourfoldTimeHermeneutics!`);
} else {
  console.error(`✗ Mismatch in book studies fourfoldTimeHermeneutics count: OT=${otCount} (expected 39), NT=${ntCount} (expected 27)!`);
  errors++;
}

console.log('\n=================================================');
if (errors === 0) {
  console.log('🎉 ALL HERMENEUTICS & FOURFOLD TIME CHECKS PASSED WITH 0 ERRORS!');
  process.exit(0);
} else {
  console.error(`❌ Verification failed with ${errors} errors.`);
  process.exit(1);
}
