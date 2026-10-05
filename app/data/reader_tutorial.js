/**
 * Biblia - 閱讀研經操作圖解教學指南 (Interactive Reader Tutorial & Exegesis Guide)
 * 完整圖解 Strong 原文逐字對照、多譯本比較、文法詞形解析、靈修筆記與全鍵盤快捷鍵
 */

(function () {
  'use strict';

  window.BIBLIA_READER_TUTORIAL = {
    title: 'Biblia 多語逐字對照閱讀與研經圖解教學指南',
    subtitle: '工欲善其事，必先利其器 —— 從新手入門到正統原文釋經的五大核心工具指南',
    modules: [
      {
        id: 'module_interlinear',
        badge: '核心工具 01',
        icon: '🏷️',
        title: 'Strong 原文逐字對照讀經法 (Strong Number Word Study)',
        summary: '告別翻譯隔閡，直達聖經希伯來文與希臘文原始精義。透視中文譯詞背後的古代字根與語義場。',
        steps: [
          {
            stepNo: 1,
            title: '什麼是 Strong 號碼？',
            desc: '由十九世紀詹姆斯·史特朗博士（Dr. James Strong）編纂，將聖經原文每個字根編列獨特編號：舊約希伯來文以 H 開頭（H1–H8674），新約希臘文以 G 開頭（G1–G5624）。無論跨越任何語言譯本，皆可精確鎖定同一個原文詞彙。'
          },
          {
            stepNo: 2,
            title: '假名風微膠囊與雙向高亮連動',
            desc: '在 Biblia 閱讀器中展開逐字對照後，中文和合本經文上方將浮現精巧的微膠囊標籤。將滑鼠懸停或輕觸標籤，原文希伯來/希臘文、和合本與英文 KJV 三欄對應詞彙將同步發光高亮，讓您一眼看清每個詞在句子中的精確對位！'
          },
          {
            stepNo: 3,
            title: '點擊展開原文字典與詞態解析',
            desc: '點擊任意 Strong 膠囊標籤，即可展開原文詞典浮動抽屜：立即查閱音標（Transliteration）、字根出處、正統神學釋義、全書出現頻率，以及該詞在該處經文中的精確詞態代碼（Morphology）。'
          }
        ],
        cases: [
          {
            ref: '約翰福音 1:1',
            word: '「太初有【道】，【道】與神同在，【道】就是神。」',
            strong: 'G3056 (λόγος, Logos)',
            analysis: '中文譯為「道」，英文譯為「Word」。希臘文 Logos 不僅是言語，更指宇宙終極的神聖理性、創造藍圖與自我啟示。約翰在此向希臘與猶太世界宣告：上帝創造與救贖的終極啟示，就是道成肉身的耶穌基督！'
          },
          {
            ref: '創世記 1:1',
            word: '「起初神【創造】天地。」',
            strong: 'H1254 (בָּרָא, Bara)',
            analysis: '在舊約希伯來文中，動詞 Bara 的主詞【永遠只能是上帝】！人只能使用 Asah（製造、塑形），唯獨上帝能施行從無到有（Ex Nihilo）的神聖主權創造。'
          },
          {
            ref: '約翰福音 21:15–17',
            word: '耶穌三次問彼得「你愛我嗎？」',
            strong: 'G0025 (ἀγαπάω) vs G5368 (φιλέω)',
            analysis: '前兩次耶穌問彼得是否以 Agapao（神聖捨己之愛）愛祂，痛悔自省的彼得只能用 Phileo（弟兄朋友情誼之愛）回應；第三次耶穌降卑遷就彼得的軟弱，改用 Phileo 問他。此細微情感張力唯有透過原文 Strong 對照方能深刻體會！'
          }
        ]
      },
      {
        id: 'module_parallel',
        badge: '核心工具 02',
        icon: '🔀',
        title: '多版本平行對照與譯本比較學 (Multi-Translation Comparative Study)',
        summary: '單一譯本難以完全呈現聖經豐富內涵。多版本並排研讀能互補盲點，照亮經文全貌。',
        translationMatrix: [
          {
            category: '形式對等 (Formal Equivalence / 字面直譯)',
            desc: '極力維持原文之詞性、文法結構與修辭風格，適合嚴謹深入研經。',
            versions: [
              { name: '和合本 1919 (unv)', lang: '中文', feature: '華人教會百年經典權威，信達雅典範，文體莊重。' },
              { name: 'King James Version (KJV)', lang: '英文', feature: '英語世界四百年經典，莎翁時代優雅文風，影響深遠。' },
              { name: 'World English Bible (WEB)', lang: '英文', feature: '現代美式英語公有領域直譯本，清晰嚴謹。' },
              { name: 'Reina-Valera 1909 (RVR1909)', lang: '西班牙文', feature: '西語世界經典之作，西語版欽定本地位。' }
            ]
          },
          {
            category: '動態對等 (Dynamic Equivalence / 意譯傳意)',
            desc: '著重將古代原文的思想觀念，以現代受眾最易明白的母語思想重新表述。',
            versions: [
              { name: 'Reina Valera Contemporánea (RVC)', lang: '西班牙文', feature: '當代西語美洲通俗流暢語法，通俗易懂。' },
              { name: 'Nouvelle Bible Segond (NBS)', lang: '法文', feature: '現代法語學術研讀旗艦，文思流暢。' },
              { name: '日語口語訳 (ja_jp)', lang: '日文', feature: '戰後日本聖經協會標準現代日語翻譯。' },
              { name: '韓語改譯 (ko_kor)', lang: '韓文', feature: '韓國教會跨世紀最廣泛使用的正統經文。' }
            ]
          }
        ],
        tips: [
          '點擊工具列上的版本按鈕，即可自由開啟或收合多版本平行欄位。',
          '在經文閱讀中，點擊任意節號旁的「🔀 單節多譯本對照」圖示，即可展開涵蓋希伯來/希臘原文與全球 11 大譯本的即時並排視窗！',
          '支援「一鍵複製全譯本對照文字」，方便直接貼入講章、小組查經講義或靈修筆記中。'
        ]
      },
      {
        id: 'module_morphology',
        badge: '核心工具 03',
        icon: '🔬',
        title: '希伯來與希臘原文文法詞形解析技巧 (Grammar & Morphology Decoder)',
        summary: '解開時態、態與語氣的神聖密碼。原文的文法不是枯燥規則，而是神學命題的骨架。',
        rules: [
          {
            aspect: '時態 (Tense)',
            code: 'Aorist (不定過去時)',
            meaning: '過去某個特定歷史時間點發生的定點動作，不強調持續過程。常表示決定性歷史事件（如基督受死與復活）。'
          },
          {
            aspect: '時態 (Tense)',
            code: 'Present (現在時)',
            meaning: '持續不斷進行、反覆發生或習慣性動作。例如約壹 3:9「凡從神生的就不（習慣性持續）犯罪」。'
          },
          {
            aspect: '時態 (Tense)',
            code: 'Perfect (完成時)',
            meaning: '過去已經完成的動作，但其產生的果效與狀態【持續存留直到如今】！神學含金量最高之時態。'
          },
          {
            aspect: '語態 (Voice)',
            code: 'Passive (被動態 / 神聖被動)',
            meaning: '主詞接受動作。在聖經中常隱含「神是背後行動者」（Divine Passive），如「清心的人有福了，因為他們必得見神（被神顯明）」。'
          },
          {
            aspect: '語態 (Voice)',
            code: 'Middle (中動態)',
            meaning: '主詞為自己的利益而行，或強調主詞的切身關聯性。'
          },
          {
            aspect: '語氣 (Mood)',
            code: 'Indicative (直說語氣)',
            meaning: '客觀事實、歷史真實性陳述。'
          },
          {
            aspect: '語氣 (Mood)',
            code: 'Imperative (命令語氣)',
            meaning: '使徒權柄的直接吩咐、戒命或呼籲。'
          }
        ],
        goldenCase: {
          title: '巔峰經典神學範例：十字架上的宣告「成了！」',
          verse: '約翰福音 19:30',
          greek: 'τετέλεσται (Tetelestai) — Strong G5055',
          morph: 'V-RPP-3S (Verb: Perfect Passive Indicative, 3rd Person Singular)',
          breakdown: '【完成時 (Perfect)】：救贖代價在十字架上已經一次永遠付清！\\n【被動態 (Passive)】：父神悅納此挽回祭，律法一切要求被完全成全！\\n【直說語氣 (Indicative)】：這不是假設或願望，而是宇宙永恆成立的歷史客觀真理！救恩已全備，無人能加添，無人能奪去！'
        }
      },
      {
        id: 'module_devotion',
        badge: '核心工具 04',
        icon: '✏️',
        title: '靈修筆記、主題標籤與經文手籤工作流 (Devotional Workflow & Tagging)',
        summary: '將讀經轉化為生命內化的沉思默想。建立屬於您一生的個人數位真理資料庫。',
        features: [
          {
            title: '1. 四色靈修螢光高亮',
            icon: '🖍️',
            desc: '黃色（應許與信心）、綠色（生命成長與誡命）、藍色（神性榮耀與恩典）、粉色（安慰與受苦）。輕按節號即可自由染色。'
          },
          {
            title: '2. 撰寫經文筆記與隨筆心得',
            icon: '📝',
            desc: '在經文旁即時記錄靈修感悟、講道重點或查經疑問。所有筆記本機自動永久保存，即使完全離線斷網亦永不丟失。'
          },
          {
            title: '3. 主題標籤系統 (#Tags)',
            icon: '🏷️',
            desc: '在筆記中輸入自訂標籤（如 #信心 #禱告 #苦難 #得勝 #婚姻），即可建立跨越 66 卷書的專題研經串連鏈。'
          },
          {
            title: '4. 個人研經中心 (快捷鍵 B)',
            icon: '🔖',
            desc: '集中管理所有書籤、標籤、螢光經文與筆記。支援關鍵字即時全文檢索，隨時重溫靈修軌跡。'
          },
          {
            title: '5. JSON 一鍵安全備份與還原',
            icon: '💾',
            desc: '完全尊重個人隱私與資料主權！點擊一鍵導出標準 JSON 備份檔，輕鬆移轉至手機、平板或新電腦。'
          }
        ]
      },
      {
        id: 'module_shortcuts',
        badge: '核心工具 05',
        icon: '⌨️',
        title: '沉浸專注閱讀與極速鍵盤操作地圖 (Zen Mode & Keyboard Navigation Map)',
        summary: '雙手不離鍵盤的流暢研經享受。按 ? 鍵隨時喚醒全域鍵盤操作中心。',
        keymap: [
          { key: 'G', action: '快速查經選卷選章盤 (Go to Book & Chapter)', desc: '2 次點擊或鍵盤輸入，瞬間直達 66 卷任意章節。' },
          { key: 'Z', action: '禪意專注默想模式 (Zen Mode)', desc: '隱藏所有工具列與干擾，經文如水流淌，專心聆聽神的話。' },
          { key: '/', action: '全書經文與 Strong 檢索 (Search)', desc: '支援中文繁簡詞語、英文關鍵字、H/G 原文 Strong 號碼搜尋。' },
          { key: 'B', action: '開啟個人研經中心 (Bookmarks & Notes)', desc: '快速檢視我的書籤、靈修筆記、閱讀歷史與備份管理。' },
          { key: 'M', action: '為當前經節標記書籤 (Mark Verse)', desc: '快速記住今日閱讀停留點。' },
          { key: 'T', action: '輪播和風護眼主題 (Toggle Themes)', desc: '和紙白練 ➔ 枯茶琥珀 ➔ 若竹抹茶 ➔ 藍鼠夜讀 ➔ 漆黑墨玄。' },
          { key: 'I', action: '切換逐字對照模式 (Interlinear)', desc: '快速展開或收合 Strong 號碼假名風微膠囊。' },
          { key: 'J / K', action: '平滑向下 / 向上捲動經文 (Scroll)', desc: '符合標準 Vim / 現代排版人體工學鍵盤滾動。' },
          { key: 'Space', action: '語音朗讀 播放 / 暫停 (Speech TTS)', desc: '結合 Web Speech API 與系統耳機線控朗讀。' },
          { key: '?', action: '開啟鍵盤快捷鍵說明 (Help)', desc: '完整查看所有支援的快捷鍵列表。' }
        ]
      }
    ]
  };

  /**
   * 渲染閱讀研經教學指南的 HTML 介面
   */
  window.renderReaderTutorialHtml = function () {
    var data = window.BIBLIA_READER_TUTORIAL;
    if (!data) return '<div class="ref-empty-state">教學資料庫載入中...</div>';

    var html = '<div class="reader-tutorial-container">';

    // 頂部 Hero
    html += '<div class="tutorial-hero-card">' +
      '<div class="tut-hero-badge"><span class="badge-icon">🎓</span> 實戰操作與釋經教學指南</div>' +
      '<h2 class="tut-hero-title">' + data.title + '</h2>' +
      '<p class="tut-hero-subtitle">' + data.subtitle + '</p>' +
      '<div class="tut-quick-jumps">' +
        '<a href="#tut-module-interlinear" class="tut-jump-btn"><span class="icon">🏷️</span> 逐字對照</a>' +
        '<a href="#tut-module-parallel" class="tut-jump-btn"><span class="icon">🔀</span> 多譯本對照</a>' +
        '<a href="#tut-module-morphology" class="tut-jump-btn"><span class="icon">🔬</span> 原文詞態</a>' +
        '<a href="#tut-module-devotion" class="tut-jump-btn"><span class="icon">✏️</span> 靈修筆記</a>' +
        '<a href="#tut-module-shortcuts" class="tut-jump-btn"><span class="icon">⌨️</span> 鍵盤地圖</a>' +
      '</div>' +
    '</div>';

    // 模組一：Strong 逐字對照
    var m1 = data.modules[0];
    html += '<section class="tut-section" id="tut-module-interlinear">' +
      '<div class="tut-sec-head">' +
        '<span class="tut-sec-badge">' + m1.badge + '</span>' +
        '<h3 class="tut-sec-title"><span class="sec-icon">' + m1.icon + '</span> ' + m1.title + '</h3>' +
        '<p class="tut-sec-lead">' + m1.summary + '</p>' +
      '</div>' +
      '<div class="tut-steps-grid">';
    m1.steps.forEach(function (st) {
      html += '<div class="tut-step-card">' +
        '<div class="step-num-badge">Step ' + st.stepNo + '</div>' +
        '<h4 class="step-title">' + st.title + '</h4>' +
        '<p class="step-desc">' + st.desc + '</p>' +
      '</div>';
    });
    html += '</div>' +
      '<h4 class="tut-sub-heading" style="margin-top:24px;">💡 經典原文關鍵詞實戰釋經範例</h4>' +
      '<div class="tut-cases-grid">';
    m1.cases.forEach(function (cs) {
      html += '<div class="tut-case-card">' +
        '<div class="case-header">' +
          '<span class="case-ref-tag">' + cs.ref + '</span>' +
          '<span class="case-strong-badge">' + cs.strong + '</span>' +
        '</div>' +
        '<div class="case-verse">' + cs.word + '</div>' +
        '<p class="case-analysis"><strong>📖 深度剖析：</strong>' + cs.analysis + '</p>' +
      '</div>';
    });
    html += '</div></section>';

    // 模組二：多譯本比較
    var m2 = data.modules[1];
    html += '<section class="tut-section" id="tut-module-parallel">' +
      '<div class="tut-sec-head">' +
        '<span class="tut-sec-badge">' + m2.badge + '</span>' +
        '<h3 class="tut-sec-title"><span class="sec-icon">' + m2.icon + '</span> ' + m2.title + '</h3>' +
        '<p class="tut-sec-lead">' + m2.summary + '</p>' +
      '</div>' +
      '<div class="tut-trans-matrix">';
    m2.translationMatrix.forEach(function (mat) {
      html += '<div class="trans-matrix-card">' +
        '<h4 class="matrix-cat-title">' + mat.category + '</h4>' +
        '<p class="matrix-cat-desc">' + mat.desc + '</p>' +
        '<div class="matrix-versions-list">';
      mat.versions.forEach(function (v) {
        html += '<div class="version-row">' +
          '<span class="version-lang-tag">' + v.lang + '</span>' +
          '<strong class="version-name">' + v.name + '</strong>：' +
          '<span class="version-feat">' + v.feature + '</span>' +
        '</div>';
      });
      html += '</div></div>';
    });
    html += '</div>' +
      '<div class="tut-pro-tips-card" style="margin-top:20px;">' +
        '<h4 class="tips-title">💡 閱讀器操作小秘訣</h4>' +
        '<ul class="tips-list">';
    m2.tips.forEach(function (tp) {
      html += '<li>' + tp + '</li>';
    });
    html += '</ul></div></section>';

    // 模組三：原文詞態文法解析
    var m3 = data.modules[2];
    html += '<section class="tut-section" id="tut-module-morphology">' +
      '<div class="tut-sec-head">' +
        '<span class="tut-sec-badge">' + m3.badge + '</span>' +
        '<h3 class="tut-sec-title"><span class="sec-icon">' + m3.icon + '</span> ' + m3.title + '</h3>' +
        '<p class="tut-sec-lead">' + m3.summary + '</p>' +
      '</div>' +
      '<div class="guide-table-responsive">' +
        '<table class="guide-table tut-morph-table">' +
          '<thead><tr>' +
            '<th>文法範疇</th><th>代碼識別</th><th>核心神學釋經意涵</th>' +
          '</tr></thead><tbody>';
    m3.rules.forEach(function (r) {
      html += '<tr>' +
        '<td><strong>' + r.aspect + '</strong></td>' +
        '<td><span class="morph-code-pill">' + r.code + '</span></td>' +
        '<td>' + r.meaning + '</td>' +
      '</tr>';
    });
    html += '</tbody></table></div>' +
      '<div class="tut-golden-case-box" style="margin-top:22px;">' +
        '<div class="gc-head">' +
          '<span class="gc-badge">✝️ 經典釋經案例</span>' +
          '<h4 class="gc-title">' + m3.goldenCase.title + '</h4>' +
          '<div class="gc-ref">' + m3.goldenCase.verse + ' · ' + m3.goldenCase.greek + '</div>' +
        '</div>' +
        '<div class="gc-body">' +
          '<div class="gc-morph-label"><strong>詞態結構：</strong><code>' + m3.goldenCase.morph + '</code></div>' +
          '<p class="gc-text">' + m3.goldenCase.breakdown.replace(/\\n/g, '<br>') + '</p>' +
        '</div>' +
      '</div></section>';

    // 模組四：靈修筆記與工作流
    var m4 = data.modules[3];
    html += '<section class="tut-section" id="tut-module-devotion">' +
      '<div class="tut-sec-head">' +
        '<span class="tut-sec-badge">' + m4.badge + '</span>' +
        '<h3 class="tut-sec-title"><span class="sec-icon">' + m4.icon + '</span> ' + m4.title + '</h3>' +
        '<p class="tut-sec-lead">' + m4.summary + '</p>' +
      '</div>' +
      '<div class="tut-features-grid">';
    m4.features.forEach(function (f) {
      html += '<div class="tut-feat-card">' +
        '<div class="feat-icon">' + f.icon + '</div>' +
        '<h4 class="feat-title">' + f.title + '</h4>' +
        '<p class="feat-desc">' + f.desc + '</p>' +
      '</div>';
    });
    html += '</div></section>';

    // 模組五：全鍵盤地圖
    var m5 = data.modules[4];
    html += '<section class="tut-section" id="tut-module-shortcuts">' +
      '<div class="tut-sec-head">' +
        '<span class="tut-sec-badge">' + m5.badge + '</span>' +
        '<h3 class="tut-sec-title"><span class="sec-icon">' + m5.icon + '</span> ' + m5.title + '</h3>' +
        '<p class="tut-sec-lead">' + m5.summary + '</p>' +
      '</div>' +
      '<div class="tut-keymap-grid">';
    m5.keymap.forEach(function (km) {
      html += '<div class="tut-key-item">' +
        '<div class="key-badge"><kbd>' + km.key + '</kbd></div>' +
        '<div class="key-info">' +
          '<strong class="key-action">' + km.action + '</strong>' +
          '<div class="key-desc">' + km.desc + '</div>' +
        '</div>' +
      '</div>';
    });
    html += '</div></section>';

    html += '</div>'; // End container
    return html;
  };

})();
