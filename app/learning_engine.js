/* ============================================================================
 * Biblia Ultralearning & See-Do-Feedback Learning Engine (learning_engine.js)
 * 融合 Scott H. Young《Ultralearning 超速學習》九大原則與
 * 《Get Better at Anything 精進的科學》See · Do · Feedback 十二法則，
 * 以「讀懂 · 讀通 · 讀出興趣」為核心目標，貫通閱讀器、777背誦與聖經挑戰。
 * ============================================================================ */
(function () {
  'use strict';

  var LEARN_KEY = 'biblia_learn_v1';

  /* ---------- 66 卷書元資料與一句話核心定位（讀懂：Metalearning Map） ---------- */
  var BOOKS_META = [
    null,
    { no: 1, dir: 'Gen', zh: '創世記', genre: 'law', nch: 50, hook: '萬物起源、人類墮落與神揀選亞伯拉罕家族的應許開端' },
    { no: 2, dir: 'Ex', zh: '出埃及記', genre: 'law', nch: 40, hook: '神大能拯救以色列脫離為奴、西乃立約與會幕同在' },
    { no: 3, dir: 'Lev', zh: '利未記', genre: 'law', nch: 27, hook: '聖潔的神如何透過獻祭與潔淨律例，使罪人得以親近祂' },
    { no: 4, dir: 'Num', zh: '民數記', genre: 'law', nch: 36, hook: '曠野四十年漂流：人的不信怨言對比神不離不棄的信實' },
    { no: 5, dir: 'Deut', zh: '申命記', genre: 'law', nch: 34, hook: '摩西臨終重申聖約：盡心愛神、選擇生命與祝福的呼召' },
    { no: 6, dir: 'Josh', zh: '約書亞記', genre: 'history', nch: 24, hook: '憑信心跨過約旦河、承受應許之地與神話語無一落空' },
    { no: 7, dir: 'Judg', zh: '士師記', genre: 'history', nch: 21, hook: '「各人任意而行」的墮落循環與神屢次興起拯救的憐憫' },
    { no: 8, dir: 'Ruth', zh: '路得記', genre: 'history', nch: 4, hook: '黑暗士師時代中的暖心微光：外邦女子的忠誠與至近親屬的救贖' },
    { no: 9, dir: '1Sam', zh: '撒母耳記上', genre: 'history', nch: 31, hook: '從士師過渡到王國：掃羅的失落與合神心意的大衛受膏' },
    { no: 10, dir: '2Sam', zh: '撒母耳記下', genre: 'history', nch: 24, hook: '大衛作王、神立永遠王國之約，以及罪的真實代價與悔改' },
    { no: 11, dir: '1Kin', zh: '列王紀上', genre: 'history', nch: 22, hook: '所羅門建殿的榮耀高峰、王國分裂與先知以利亞的力挽狂瀾' },
    { no: 12, dir: '2Kin', zh: '列王紀下', genre: 'history', nch: 25, hook: '南北二國離棄聖約走向被擄，見證歷史掌權在神手中' },
    { no: 13, dir: '1Chr', zh: '歷代志上', genre: 'history', nch: 29, hook: '歸回後重述譜系與大衛敬拜體制，重燃重建聖殿的盼望' },
    { no: 14, dir: '2Chr', zh: '歷代志下', genre: 'history', nch: 36, hook: '猶大諸王興衰史：尋求耶和華必蒙復興，直到歸回詔書頒布' },
    { no: 15, dir: 'Ezra', zh: '以斯拉記', genre: 'history', nch: 10, hook: '被擄歸回重建聖殿，並以神的話語更新群體信仰' },
    { no: 16, dir: 'Neh', zh: '尼希米記', genre: 'history', nch: 13, hook: '禱告與行動並進：52 天重建耶路撒冷城牆與重立聖約' },
    { no: 17, dir: 'Esth', zh: '以斯帖記', genre: 'history', nch: 10, hook: '全書未提神名，卻處處看見神隱密而精準的護理與拯救' },
    { no: 18, dir: 'Job', zh: '約伯記', genre: 'poetry', nch: 42, hook: '義人為何受苦？打破因果報應迷思，在旋風中遇見創造主' },
    { no: 19, dir: 'Ps', zh: '詩篇', genre: 'poetry', nch: 150, hook: '人類最真實的靈魂禱告集：從悲嘆呼求到全心讚美' },
    { no: 20, dir: 'Prov', zh: '箴言', genre: 'poetry', nch: 31, hook: '敬畏耶和華是智慧的開端：把信仰落實在日常決策與人際中' },
    { no: 21, dir: 'Eccl', zh: '傳道書', genre: 'poetry', nch: 12, hook: '日光之下一切虛空，唯有紀念造你的主才能得著永恆意義' },
    { no: 22, dir: 'Song', zh: '雅歌', genre: 'poetry', nch: 8, hook: '歌頌神所創造忠貞熱烈的愛情，也映照神與子民的深情' },
    { no: 23, dir: 'Is', zh: '以賽亞書', genre: 'prophets', nch: 66, hook: '舊約中的福音書：聖潔審判與受苦僕人帶來的新天新地' },
    { no: 24, dir: 'Jer', zh: '耶利米書', genre: 'prophets', nch: 52, hook: '流淚先知的忠心警告，並在絕望中預告刻在心版上的「新約」' },
    { no: 25, dir: 'Lam', zh: '耶利米哀歌', genre: 'prophets', nch: 5, hook: '耶路撒冷傾覆後的深沉哀悼，卻在廢墟中宣告神每早晨更新的慈愛' },
    { no: 26, dir: 'Ezek', zh: '以西結書', genre: 'prophets', nch: 48, hook: '被擄河畔的榮耀異象：枯骨復生、賜下新心與神榮耀重返' },
    { no: 27, dir: 'Dan', zh: '但以理書', genre: 'prophets', nch: 12, hook: '異邦王宮中的忠誠見證與至高者在列國歷史中掌權的異象' },
    { no: 28, dir: 'Hos', zh: '何西阿書', genre: 'prophets', nch: 14, hook: '以破碎婚姻比喻神對背道子民不離不棄、挽回到底的堅定慈愛' },
    { no: 29, dir: 'Joel', zh: '約珥書', genre: 'prophets', nch: 3, hook: '蝗災呼召撕裂心腸的悔改，並預言末後聖靈澆灌凡有血氣的' },
    { no: 30, dir: 'Amos', zh: '阿摩司書', genre: 'prophets', nch: 9, hook: '牧人先知怒斥虛偽宗教與社會不義：願公平如大水滾滾' },
    { no: 31, dir: 'Obad', zh: '俄巴底亞書', genre: 'prophets', nch: 1, hook: '舊約最短書卷：驕傲必招審判，國度終必歸耶和華' },
    { no: 32, dir: 'Jon', zh: '約拿書', genre: 'prophets', nch: 4, hook: '逃跑先知與大魚的故事：揭開神對萬邦敵人超乎想像的憐憫' },
    { no: 33, dir: 'Mic', zh: '彌迦書', genre: 'prophets', nch: 7, hook: '預言伯利恆降生之君，並總結神的心意：行公義、好憐憫、存謙卑' },
    { no: 34, dir: 'Nah', zh: '那鴻書', genre: 'prophets', nch: 3, hook: '神對殘暴帝國尼尼微的公義審判，成為受壓迫者的安慰' },
    { no: 35, dir: 'Hab', zh: '哈巴谷書', genre: 'prophets', nch: 3, hook: '從「為何不聽」的質問到「無花果樹不發旺仍要歡欣」的信心讚歌' },
    { no: 36, dir: 'Zeph', zh: '西番雅書', genre: 'prophets', nch: 3, hook: '耶和華大日潔淨萬民後，神要因祂的百姓歡呼喜樂' },
    { no: 37, dir: 'Hag', zh: '哈該書', genre: 'prophets', nch: 2, hook: '省察優先次序：放下自私安逸，起來重建神的殿必得應許榮耀' },
    { no: 38, dir: 'Zech', zh: '撒迦利亞書', genre: 'prophets', nch: 14, hook: '夜間八異象與騎驢進城的謙和君王，指向終末的潔淨與得勝' },
    { no: 39, dir: 'Mal', zh: '瑪拉基書', genre: 'prophets', nch: 4, hook: '舊約最後的深情辯論：重燃敬畏之心，靜候公義日頭升起' },
    { no: 40, dir: 'Matt', zh: '馬太福音', genre: 'gospels', nch: 28, hook: '耶穌是舊約應許的彌賽亞君王：登山寶訓、天國比喻與大使命' },
    { no: 41, dir: 'Mark', zh: '馬可福音', genre: 'gospels', nch: 16, hook: '節奏最明快的行動福音：權能僕人耶穌走上十架捨命之路' },
    { no: 42, dir: 'Luke', zh: '路加福音', genre: 'gospels', nch: 24, hook: '醫師史家筆下滿有恩典的救主：特別關懷邊緣人、浪子與萬邦' },
    { no: 43, dir: 'John', zh: '約翰福音', genre: 'gospels', nch: 21, hook: '道成肉身的生命之光：七大神蹟與七個「我是」，叫信的人得生命' },
    { no: 44, dir: 'Acts', zh: '使徒行傳', genre: 'acts', nch: 28, hook: '聖靈降臨點燃教會誕生，福音從耶路撒冷一路震撼羅馬帝國' },
    { no: 45, dir: 'Rom', zh: '羅馬書', genre: 'epistles', nch: 16, hook: '福音神學的珠穆朗瑪峰：因信稱義、聖靈自由與活祭人生' },
    { no: 46, dir: '1Cor', zh: '哥林多前書', genre: 'epistles', nch: 16, hook: '十架智慧回應教會紛爭與日常難題，寫下不朽的愛的真諦與復活凱歌' },
    { no: 47, dir: '2Cor', zh: '哥林多後書', genre: 'epistles', nch: 13, hook: '保羅最敞開心扉的書信：瓦器裡的寶貝，神的能力在軟弱上顯得完全' },
    { no: 48, dir: 'Gal', zh: '加拉太書', genre: 'epistles', nch: 6, hook: '捍衛純粹恩典的自由宣言：脫離律法主義，結出聖靈九果' },
    { no: 49, dir: 'Eph', zh: '以弗所書', genre: 'epistles', nch: 6, hook: '前半坐享基督裡天上福氣，後半在教會與家庭中穿戴全副軍裝行走' },
    { no: 50, dir: 'Phil', zh: '腓立比書', genre: 'epistles', nch: 4, hook: '監獄裡寫出的喜樂書信：以基督謙卑的心為心，靠主凡事都能' },
    { no: 51, dir: 'Col', zh: '歌羅西書', genre: 'epistles', nch: 4, hook: '基督超越萬有、本性一切豐盛都在祂裡面，因此不必再求虛空小學' },
    { no: 52, dir: '1Thess', zh: '帖撒羅尼迦前書', genre: 'epistles', nch: 5, hook: '年輕教會的信心榜樣：在逼迫中堅立，帶著主再來的盼望聖潔生活' },
    { no: 53, dir: '2Thess', zh: '帖撒羅尼迦後書', genre: 'epistles', nch: 3, hook: '澄清末世誤解：不恐慌、不怠惰，安靜作工並堅守所領受的真道' },
    { no: 54, dir: '1Tim', zh: '提摩太前書', genre: 'epistles', nch: 6, hook: '老僕人給年輕牧者的教會治理指南：守住純正福音與敬虔品格' },
    { no: 55, dir: '2Tim', zh: '提摩太後書', genre: 'epistles', nch: 4, hook: '保羅殉道前的最後囑託：剛強壯膽、按正意分解真理，跑完當跑的路' },
    { no: 56, dir: 'Titus', zh: '提多書', genre: 'epistles', nch: 3, hook: '純正的信仰必然生出美好善行，使救主神的道在社區中凡事尊榮' },
    { no: 57, dir: 'Philem', zh: '腓利門書', genre: 'epistles', nch: 1, hook: '最短卻最動人的書信：福音如何以愛與饒恕化解奴隸與主人的鴻溝' },
    { no: 58, dir: 'Heb', zh: '希伯來書', genre: 'epistles', nch: 13, hook: '基督更美！超越天使、摩西與舊約祭司，激勵疲乏信徒存心忍耐奔跑' },
    { no: 59, dir: 'James', zh: '雅各書', genre: 'epistles', nch: 5, hook: '新約的智慧箴言：真信心必有行動，管住舌頭並活出憐憫公義' },
    { no: 60, dir: '1Pet', zh: '彼得前書', genre: 'epistles', nch: 5, hook: '給苦難中寄居客旅的盼望之書：效法受苦基督，以溫柔敬畏回應世界' },
    { no: 61, dir: '2Pet', zh: '彼得後書', genre: 'epistles', nch: 3, hook: '在真知識上長進、防備假師傅，以敬虔盼望新天新地的到來' },
    { no: 62, dir: '1John', zh: '約翰一書', genre: 'epistles', nch: 5, hook: '三大確據檢驗真信仰：行在光中、彼此相愛、認耶穌是道成肉身的基督' },
    { no: 63, dir: '2John', zh: '約翰二書', genre: 'epistles', nch: 1, hook: '真理與愛心不可偏廢：熱情接待肢體，卻絕不向錯謬教訓妥協' },
    { no: 64, dir: '3John', zh: '約翰三書', genre: 'epistles', nch: 1, hook: '對比好客的該猶與專權的丟特腓，鼓勵信徒成為真理同工的後盾' },
    { no: 65, dir: 'Jude', zh: '猶大書', genre: 'epistles', nch: 1, hook: '為從前一次交付聖徒的真道竭力爭辯，保守自己常在神的愛中' },
    { no: 66, dir: 'Rev', zh: '啟示錄', genre: 'apocalyptic', nch: 22, hook: '拉開屬靈帷幕的終極盼望：被殺羔羊已經得勝，神必擦去一切眼淚' }
  ];

  /* ---------- 8 大體裁「專家讀法範本」(Get Better at Anything: See & Worked Examples) ---------- */
  var GENRE_MODELS = {
    law: {
      name: '摩西五經 · 聖約根基',
      icon: '📜',
      color: '#b45309',
      workedExample: '像讀「建國憲法與家族盟約」一樣讀：先看神主動賜下什麼恩典（拯救），再看神要求什麼回應（律例），兩者順序千萬別顛倒。',
      pitfall: '避坑：別把律法讀成冰冷的規則清單——每條規定背後都在問「聖潔的神如何與不完美的人同住？」',
      questions: [
        '這一章裡，神展現了哪一種品格（創造、信實、聖潔或憐憫）？',
        '人面對神的呼召或命令時，做出了什麼選擇，帶來什麼後果？'
      ]
    },
    history: {
      name: '舊約歷史 · 敘事長河',
      icon: '🏰',
      color: '#9a3412',
      workedExample: '像看「紀錄片」一樣抓三大線索：場景衝突 → 人物轉折 → 上帝在幕後的掌權。記住聖經忠實記錄人性軟弱，記錄不等於贊同。',
      pitfall: '避坑：別把大衛、參孫等人物直接英雄化或道德化——真正永遠忠誠的主角是上帝自己。',
      questions: [
        '這一章的戲劇衝突是什麼？人物的信心或軟弱如何推動情節？',
        '就算經文沒直接明說，上帝在這段歷史中如何保守祂的應許？'
      ]
    },
    poetry: {
      name: '詩歌智慧 · 心靈與生活',
      icon: '🎵',
      color: '#0f766e',
      workedExample: '希伯來詩歌重視「意思的平行對仗」（同義、反義、遞進）。慢慢朗讀，感受作者真實的情感起伏與意象比喻。',
      pitfall: '避坑：箴言是「智慧原則」而非無條件的機械公式；詩篇的哀嘆則是邀請你誠實向神傾訴。',
      questions: [
        '哪一個比喻或對仗句子最打動你？它描繪了什麼真實的人生處境？',
        '這段話如何邀請你在情緒或日常選擇中重新對齊上帝？'
      ]
    },
    prophets: {
      name: '先知書 · 聖約法庭與盼望',
      icon: '🔥',
      color: '#b91c1c',
      workedExample: '先知不是算命師，而是「聖約檢察官＋盼望吹號者」。每章多半包含三拍子：指出背約罪行 → 宣告審判管教 → 應許復興與彌賽亞。',
      pitfall: '避坑：先弄清先知是對「當時哪個時代」說話（被擄前／中／後），再看它如何遙指基督與末後。',
      questions: [
        '先知在這章責備了哪種虛偽或偏離？這對今日有何提醒？',
        '在審判與警告的縫隙中，神埋下了什麼盼望與恢復的應許？'
      ]
    },
    gospels: {
      name: '四福音書 · 認識耶穌現場',
      icon: '✝️',
      color: '#1d4ed8',
      workedExample: '把自己放進現場當旁觀者！注意耶穌「說了什麼」、「做了什麼」以及「周圍門徒、法利賽人、群眾各自的反應」。',
      pitfall: '避坑：讀比喻時先找「一個核心衝擊點」，別把每個小道具都過度靈意化拆解。',
      questions: [
        '耶穌在這章的言行如何顛覆當時人們對神或對宗教的既有想像？',
        '如果你就在現場，你最像裡面的哪一個角色？耶穌會對你說什麼？'
      ]
    },
    acts: {
      name: '使徒行傳 · 聖靈與初代教會',
      icon: '⛵',
      color: '#0369a1',
      workedExample: '邊讀邊在心裡畫「福音擴張地圖」：耶路撒冷 → 猶太撒瑪利亞 → 地極（羅馬），觀察聖靈如何帶領教會跨越文化疆界。',
      pitfall: '避坑：區分「歷史描述（當時發生了什麼）」與「永恆規範（每間教會都該學習的原則）」。',
      questions: [
        '初代門徒遇到什麼阻礙或逼迫？聖靈如何引導他們化危機為契機？',
        '這章展現了哪種讓人羨慕的教會生命力或見證勇氣？'
      ]
    },
    epistles: {
      name: '使徒書信 · 邏輯與生活應用',
      icon: '✉️',
      color: '#6d28d9',
      workedExample: '像讀「一封寄給真實教會的回信」！特別圈出邏輯轉折詞（「因為」「所以」「然而」），通常前半講神學根基，後半講生活實踐。',
      pitfall: '避坑：切忌只抽一句金句斷章取義——一定要往上讀兩節、往下讀兩節，聽懂作者到底在回應什麼問題。',
      questions: [
        '這章的核心論點是什麼？（試著找「因為…所以…」的因果脈絡）',
        '作者把這個真理落實到哪一件具體的日常態度或人際關係上？'
      ]
    },
    apocalyptic: {
      name: '啟示文學 · 屬靈帷幕與終極得勝',
      icon: '👑',
      color: '#be185d',
      workedExample: '像欣賞「政治漫畫與交響樂異象」：先抓整體震撼畫面與舊約典故（如但以理書、以西結書），而不是拿新聞報紙逐字硬套。',
      pitfall: '避坑：啟示錄不是為了嚇人，而是為了安慰受苦的信徒：「無論世界多混亂，寶座上的羔羊已經得勝！」',
      questions: [
        '這章的異象要帶給受壓迫的信徒什麼安慰、警醒或敬拜的眼光？',
        '異象中哪個象徵（數字、寶座、羔羊、敬拜）呼應了舊約聖經？'
      ]
    }
  };

  /* ---------- 4 條階梯式主題學習路線 (Early Wins + Variability + Directness) ---------- */
  var LEARNING_QUESTS = [
    {
      id: 'icebreaker7',
      badge: '🌱 零基礎首推 · 7 站',
      title: '7 天破冰之旅：愛上讀聖經',
      subtitle: '專為新手與重新出發者設計——精選 7 章最動人、最有共鳴的經典，建立「我真的讀得懂」的早勝信心！',
      principle: 'Get Better at Anything Ch.3「成功是最好的老師」× Ch.12「漸進暴露消除畏懼」',
      color: '#15803d',
      stops: [
        { bookNo: 1, chap: 1, title: '創世記 1 章 · 光與秩序的開端', why: '看懂世界與生命的起點：神稱一切「甚好」，人類按神的形像受造。' },
        { bookNo: 19, chap: 23, title: '詩篇 23 篇 · 耶和華是我的牧者', why: '短短 6 節卻陪伴人類三千年，感受最溫柔的平安與同在。' },
        { bookNo: 42, chap: 15, title: '路加福音 15 章 · 浪子回頭的擁抱', why: '耶穌講過最震撼人心的故事：徹底改寫你對「父親與恩典」的想像。' },
        { bookNo: 43, chap: 3, title: '約翰福音 3 章 · 深夜裡的「重生」對話', why: '一位頂尖學者夜訪耶穌，引出全聖經最著名的 3:16 核心宣言。' },
        { bookNo: 43, chap: 14, title: '約翰福音 14 章 · 心裡不要憂愁', why: '耶穌在離別前夕留給門徒最深的安慰：道路、真理、生命與保惠師。' },
        { bookNo: 45, chap: 8, title: '羅馬書 8 章 · 沒有任何事能隔絕祂的愛', why: '聖經中最具力量的一章：從「不再定罪」直奔「得勝有餘」的凱歌。' },
        { bookNo: 46, chap: 13, title: '哥林多前書 13 章 · 愛的真諦', why: '超越浪漫與情緒，看見什麼是永不止息、能撐起一生的真愛。' }
      ]
    },
    {
      id: 'jesus12',
      badge: '✝️ 經典敘事 · 12 站',
      title: '12 站耶穌生平全景速覽',
      subtitle: '透過四福音最關鍵的 12 個現場，身歷其境認識耶穌的教導、神蹟、十架與復活。',
      principle: 'Get Better at Anything Part I「See 看見典範」× Ultralearning「直接法」',
      color: '#1d4ed8',
      stops: [
        { bookNo: 43, chap: 1, title: '約 1 章 · 道成肉身來到人間', why: '從永恆視角拉開序幕：光進入黑暗。' },
        { bookNo: 42, chap: 2, title: '路 2 章 · 伯利恆降生與牧羊人', why: '宇宙君王降生在馬槽裡，大喜的信息先報給卑微的人。' },
        { bookNo: 40, chap: 5, title: '太 5 章 · 登山寶訓與八福', why: '天國價值觀大翻轉：什麼才是真正有福的人生？' },
        { bookNo: 43, chap: 4, title: '約 4 章 · 井旁活水的對話', why: '耶穌主動跨越種族與道德圍牆，接住一顆乾渴的心。' },
        { bookNo: 41, chap: 4, title: '可 4 章 · 撒種比喻與平靜風浪', why: '聽道的心田與掌管自然風暴的權柄。' },
        { bookNo: 42, chap: 10, title: '路 10 章 · 好撒瑪利亞人', why: '「誰是我的鄰舍？」把愛心從抽象口號變成具體行動。' },
        { bookNo: 43, chap: 11, title: '約 11 章 · 耶穌哭了與拉撒路復活', why: '看見救主最深的同理心，與勝過死亡的生命權柄。' },
        { bookNo: 42, chap: 19, title: '路 19 章 · 樹上的撒該與榮耀進城', why: '沒有一個人小到被遺忘，或壞到無法被改變。' },
        { bookNo: 43, chap: 13, title: '約 13 章 · 最後晚餐與彼此洗腳', why: '真正的偉大不是轄制人，而是彎下腰服事人。' },
        { bookNo: 42, chap: 22, title: '路 22 章 · 客西馬尼園的禱告', why: '在極大痛苦中仍說「不要成就我的意思，只要成就你的意思」。' },
        { bookNo: 42, chap: 23, title: '路 23 章 · 各各他十字架', why: '「父啊，赦免他們！」十架上的赦免與同釘強盜的盼望。' },
        { bookNo: 42, chap: 24, title: '路 24 章 · 空墳墓與以馬忤斯之路', why: '復活的主親自用整本舊約講解自己，點燃門徒火熱的心！' }
      ]
    },
    {
      id: 'paul10',
      badge: '🧠 邏輯貫通 · 10 站',
      title: '10 站保羅書信思維框架',
      subtitle: '打通新約神學的任督二脈！用「問題筆記法＋費曼法」讀通恩典、信心、自由與喜樂的底層邏輯。',
      principle: 'Ultralearning P8「直覺與費曼法」× Get Better at Anything Ch.6「建立心智模組」',
      color: '#6d28d9',
      stops: [
        { bookNo: 45, chap: 3, title: '羅 3 章 · 因信稱義的核心突破', why: '世人都犯了罪，卻因基督的救贖白白稱義。' },
        { bookNo: 45, chap: 5, title: '羅 5 章 · 患難生忍耐與和好的恩典', why: '我們還作罪人的時候，基督就為我們死了。' },
        { bookNo: 45, chap: 12, title: '羅 12 章 · 活祭與心意更新', why: '把崇高神學落實成不效法世界、以善勝惡的日常。' },
        { bookNo: 46, chap: 15, title: '林前 15 章 · 復活的終極凱歌', why: '如果基督沒有復活，信便是徒然；但祂果然復活了！' },
        { bookNo: 47, chap: 4, title: '林後 4 章 · 瓦器裡的寶貝', why: '四面受敵卻不被困住：軟弱反倒成為神大能的舞台。' },
        { bookNo: 48, chap: 5, title: '加 5 章 · 真自由與聖靈九果', why: '自由不是放縱情慾，而是靠聖靈彼此相愛。' },
        { bookNo: 49, chap: 2, title: '弗 2 章 · 本乎恩、因著信的傑作', why: '我們原是祂的工作（傑作），在基督裡拆除一切隔斷的牆。' },
        { bookNo: 49, chap: 6, title: '弗 6 章 · 穿戴神所賜的全副軍裝', why: '面對屬靈爭戰的六大裝備與隨時多方禱告。' },
        { bookNo: 50, chap: 2, title: '腓 2 章 · 基督虛己的榜樣', why: '新約最壯麗的基督頌歌：降卑自己，反升為至高。' },
        { bookNo: 50, chap: 4, title: '腓 4 章 · 一無掛慮的喜樂祕訣', why: '在任何景況都能知足的祕訣：靠著那加給我力量的！' }
      ]
    },
    {
      id: 'story14',
      badge: '🌍 全局鳥瞰 · 14 站',
      title: '14 站救贖歷史大串連（創世到新天新地）',
      subtitle: '橫跨律法、歷史、詩歌、先知、福音、書信、啟示錄，一次看懂 66 卷書其實在講同一個宏大故事！',
      principle: 'Ultralearning P1「後設學習地圖」× Get Better at Anything Ch.7「多樣化交錯練習」',
      color: '#b45309',
      stops: [
        { bookNo: 1, chap: 3, title: '創 3 章 · 墮落與第一個福音應許', why: '罪進入世界，但神立刻應許女人的後裔要傷蛇的頭。' },
        { bookNo: 1, chap: 12, title: '創 12 章 · 亞伯拉罕之約', why: '神揀選一人一族，目的是「地上的萬族都要因你得福」。' },
        { bookNo: 2, chap: 12, title: '出 12 章 · 逾越節羔羊與出埃及', why: '羔羊的血救贖頭生的，成為後來基督十字架的預表。' },
        { bookNo: 2, chap: 20, title: '出 20 章 · 西乃山十誡', why: '先拯救、後立約：自由之民的生命藍圖。' },
        { bookNo: 10, chap: 7, title: '撒下 7 章 · 大衛之約', why: '神應許大衛的國位必永遠堅立——指向彌賽亞君王。' },
        { bookNo: 18, chap: 38, title: '伯 38 章 · 旋風中的創造主', why: '苦難未必有簡化答案，但創造主的智慧與同在遠超我們想像。' },
        { bookNo: 23, chap: 53, title: '賽 53 章 · 受苦僕人的預言', why: '耶穌降生前七百年，就精準描繪了十架代贖的畫面。' },
        { bookNo: 24, chap: 31, title: '耶 31 章 · 刻在心版上的新約', why: '神應許不再只是外在石版律法，而是從內心更新生命。' },
        { bookNo: 26, chap: 37, title: '結 37 章 · 枯骨復生的異象', why: '看似毫無希望的死寂中，神的靈吹氣就能帶來復興！' },
        { bookNo: 42, chap: 2, title: '路 2 章 · 應許成真：道成肉身', why: '四百年沉默後，舊約所有的線索都在耶穌身上交會。' },
        { bookNo: 44, chap: 2, title: '徒 2 章 · 五旬節聖靈降臨', why: '巴別塔分散的萬國語言，在聖靈裡重新聽見神的作為。' },
        { bookNo: 45, chap: 8, title: '羅 8 章 · 新約聖靈裡的兒女', why: '連受造之物都切望等候神的眾子顯出來。' },
        { bookNo: 58, chap: 11, title: '來 11 章 · 信心英雄雲彩見證', why: '串起整本舊約人物，看見信心是未見之事的確據。' },
        { bookNo: 66, chap: 21, title: '啟 21 章 · 新天新地與神同住', why: '聖經大結局：神要擦去一切眼淚，回到比伊甸園更榮耀的家！' }
      ]
    }
  ];

  /* ---------- 狀態讀寫 ---------- */
  function todayKey() {
    var d = new Date();
    var m = d.getMonth() + 1;
    var day = d.getDate();
    return d.getFullYear() + '-' + (m < 10 ? '0' + m : m) + '-' + (day < 10 ? '0' + day : day);
  }

  function loadState() {
    var fallback = {
      v: 1,
      activeQuestId: 'icebreaker7',
      masteredChapters: {},   // "bookNo:chap": { ts, quizScore }
      reflections: {},        // "bookNo:chap": { feynman, question, ts, bookZh }
      dailyLoops: {},         // "YYYY-MM-DD": { see: bool, do: bool, feedback: bool }
      streak: 0,
      lastActiveDay: '',
      orientCollapsed: false
    };
    try {
      var raw = JSON.parse(localStorage.getItem(LEARN_KEY) || 'null');
      if (!raw || typeof raw !== 'object') return fallback;
      return Object.assign(fallback, raw, {
        masteredChapters: raw.masteredChapters || {},
        reflections: raw.reflections || {},
        dailyLoops: raw.dailyLoops || {}
      });
    } catch (e) {
      return fallback;
    }
  }

  function saveState(st) {
    try {
      localStorage.setItem(LEARN_KEY, JSON.stringify(st));
    } catch (e) {}
  }

  function markDailyStep(stepName) {
    var st = loadState();
    var today = todayKey();
    if (!st.dailyLoops[today]) st.dailyLoops[today] = { see: false, do: false, feedback: false };
    st.dailyLoops[today][stepName] = true;
    if (st.lastActiveDay !== today) {
      // 檢查是否連續昨天
      var y = new Date();
      y.setDate(y.getDate() - 1);
      var ym = y.getMonth() + 1;
      var yd = y.getDate();
      var yKey = y.getFullYear() + '-' + (ym < 10 ? '0' + ym : ym) + '-' + (yd < 10 ? '0' + yd : yd);
      st.streak = (st.lastActiveDay === yKey) ? (st.streak || 0) + 1 : 1;
      st.lastActiveDay = today;
    }
    saveState(st);
    return st;
  }

  /* ---------- 跨模組即時數據彙整（Reader + 777 Memory + Bible Quests） ---------- */
  function gatherEcosystemStats() {
    var st = loadState();
    var history = [];
    var bookmarks = {};
    var memMastered = 0, memDue = 0, memStarted = 0;
    var chTotal = 0, chCorrect = 0, chDueMistakes = 0, chWeakest = null;

    try { history = JSON.parse(localStorage.getItem('biblia_history') || '[]') || []; } catch (e) {}
    try { bookmarks = JSON.parse(localStorage.getItem('biblia_bookmarks') || '{}') || {}; } catch (e) {}

    try {
      var mem = JSON.parse(localStorage.getItem('biblia_memory_777_v2') || 'null');
      if (mem && mem.records) {
        var now = Date.now();
        Object.keys(mem.records).forEach(function (id) {
          var r = mem.records[id] || {};
          if (r.level >= 4) memMastered++;
          if (r.reps > 0) memStarted++;
          if ((r.reps > 0 && r.level < 4 && r.nextDue <= now) || r.wrongCount > 0) memDue++;
        });
      }
    } catch (e) {}

    try {
      var ch = JSON.parse(localStorage.getItem('biblia_challenge_state_v2') || 'null');
      if (ch) {
        chTotal = ch.totalAnswered || 0;
        chCorrect = ch.totalCorrect || 0;
        var nowMs = Date.now();
        if (ch.mistakes && typeof ch.mistakes === 'object') {
          Object.keys(ch.mistakes).forEach(function (k) {
            var m = ch.mistakes[k];
            if (m && (!m.nextReview || m.nextReview <= nowMs)) chDueMistakes++;
          });
        }
        // 偵測弱點分類 (Ultralearning P4: Drill Attack Your Weakest Point)
        var catMap = {
          char: { name: '聖經人物', hash: '#char' },
          place: { name: '聖經地理', hash: '#place' },
          verse: { name: '經典經文填空', hash: '#verse' },
          quote: { name: '名言出處', hash: '#quote' },
          trivia: { name: '數字與制度', hash: '#trivia' },
          parable: { name: '耶穌比喻神蹟', hash: '#parable' },
          books: { name: '書卷正典架構', hash: '#books' },
          tf: { name: '是非快答', hash: '#tf' }
        };
        if (ch.catStats && typeof ch.catStats === 'object') {
          var worstAcc = 2;
          Object.keys(catMap).forEach(function (key) {
            var cs = ch.catStats[key];
            if (cs && cs.total >= 3) {
              var acc = cs.correct / cs.total;
              if (acc < worstAcc) {
                worstAcc = acc;
                chWeakest = {
                  key: key,
                  name: catMap[key].name,
                  hash: catMap[key].hash,
                  acc: Math.round(acc * 100),
                  total: cs.total
                };
              }
            }
          });
        }
      }
    } catch (e) {}

    var masteredCount = Object.keys(st.masteredChapters).length;
    var reflectionCount = Object.keys(st.reflections).length;
    var readChapCount = Math.max(history.length, masteredCount);
    var today = todayKey();
    var loop = st.dailyLoops[today] || { see: false, do: false, feedback: false };

    return {
      learn: st,
      readChapCount: readChapCount,
      masteredCount: masteredCount,
      reflectionCount: reflectionCount,
      bookmarkCount: Object.keys(bookmarks).length,
      memMastered: memMastered,
      memDue: memDue,
      memStarted: memStarted,
      chTotal: chTotal,
      chCorrect: chCorrect,
      chAcc: chTotal ? Math.round((chCorrect / chTotal) * 100) : 0,
      chDueMistakes: chDueMistakes,
      chWeakest: chWeakest,
      todayLoop: loop,
      streak: st.streak || 0
    };
  }

  function escHtml(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function getQuestById(id) {
    for (var i = 0; i < LEARNING_QUESTS.length; i++) {
      if (LEARNING_QUESTS[i].id === id) return LEARNING_QUESTS[i];
    }
    return LEARNING_QUESTS[0];
  }

  function getQuestProgress(quest, st) {
    var done = 0;
    var nextStop = null;
    for (var i = 0; i < quest.stops.length; i++) {
      var s = quest.stops[i];
      var key = s.bookNo + ':' + s.chap;
      if (st.masteredChapters[key]) {
        done++;
      } else if (!nextStop) {
        nextStop = Object.assign({ index: i + 1 }, s);
      }
    }
    return { done: done, total: quest.stops.length, nextStop: nextStop || Object.assign({ index: 1 }, quest.stops[0]), completed: done >= quest.stops.length };
  }

  function chapterHash(bookNo, chap) {
    var b = BOOKS_META[bookNo];
    return '#read/' + (b ? b.dir : bookNo) + '/' + chap;
  }

  /* ---------- 首頁「讀懂 · 讀通 · 讀出興趣」超速學習儀表板 ---------- */
  function renderHomeHub() {
    var host = document.getElementById('startLearningHub');
    if (!host) return;

    var stats = gatherEcosystemStats();
    var st = stats.learn;
    var quest = getQuestById(st.activeQuestId);
    var qp = getQuestProgress(quest, st);
    var nextStop = qp.nextStop;
    var loop = stats.todayLoop;
    var loopDone = (loop.see ? 1 : 0) + (loop.do ? 1 : 0) + (loop.feedback ? 1 : 0);

    // 弱點特訓建議 (Ultralearning P4 Drill)
    var drillHtml = '';
    if (stats.chDueMistakes > 0) {
      drillHtml =
        '<div class="ul-drill-banner">' +
          '<div class="ul-drill-info">' +
            '<span class="ul-drill-tag">🎯 弱點精準特訓 (Drill)</span>' +
            '<strong>你有 ' + stats.chDueMistakes + ' 題到期錯題</strong>，現在花 2 分鐘攻克最弱環節，記憶保留率提升 3 倍！' +
          '</div>' +
          '<a href="challenge.html#mistakes" class="btn btn-sm btn-primary ul-drill-btn">立即複習錯題 →</a>' +
        '</div>';
    } else if (stats.chWeakest && stats.chWeakest.acc < 80) {
      drillHtml =
        '<div class="ul-drill-banner">' +
          '<div class="ul-drill-info">' +
            '<span class="ul-drill-tag">🎯 弱點精準特訓 (Drill)</span>' +
            '偵測到「<strong>' + escHtml(stats.chWeakest.name) + '</strong>」正確率 <strong>' + stats.chWeakest.acc + '%</strong>，來一輪 3 分鐘專攻特訓打通盲點！' +
          '</div>' +
          '<a href="challenge.html' + stats.chWeakest.hash + '" class="btn btn-sm btn-primary ul-drill-btn">專攻此分類 →</a>' +
        '</div>';
    } else if (stats.memDue > 0) {
      drillHtml =
        '<div class="ul-drill-banner">' +
          '<div class="ul-drill-info">' +
            '<span class="ul-drill-tag">⏰ 間隔提取複習 (Retention)</span>' +
            '你有 <strong>' + stats.memDue + ' 節經文</strong>剛好進入最佳遺忘臨界點，趁現在提取一次就能鎖入長期記憶！' +
          '</div>' +
          '<a href="memory.html#cat=due" class="btn btn-sm btn-primary ul-drill-btn">立即提取複習 →</a>' +
        '</div>';
    } else {
      drillHtml =
        '<div class="ul-drill-banner ul-drill-fresh">' +
          '<div class="ul-drill-info">' +
            '<span class="ul-drill-tag">⚡ 直接實戰 (Directness)</span>' +
            '還沒試過「看→做→回饋」？從「<strong>' + escHtml(nextStop.title) + '</strong>」開始，5 分鐘體驗真正讀懂又記住！' +
          '</div>' +
          '<a href="' + chapterHash(nextStop.bookNo, nextStop.chap) + '" class="btn btn-sm btn-primary ul-drill-btn">開始第 ' + nextStop.index + ' 站 →</a>' +
        '</div>';
    }

    var questTabsHtml = LEARNING_QUESTS.map(function (q) {
      var p = getQuestProgress(q, st);
      var active = q.id === quest.id;
      return '<button type="button" class="ul-quest-tab' + (active ? ' active' : '') + '" data-quest-id="' + q.id + '">' +
        '<span class="ul-qt-title">' + escHtml(q.title.split('：')[0]) + '</span>' +
        '<span class="ul-qt-prog">' + p.done + '/' + p.total + '</span>' +
      '</button>';
    }).join('');

    var stopsPreviewHtml = quest.stops.map(function (s, idx) {
      var key = s.bookNo + ':' + s.chap;
      var isDone = !!st.masteredChapters[key];
      var isNext = !qp.completed && (idx + 1 === nextStop.index);
      return '<a href="' + chapterHash(s.bookNo, s.chap) + '" class="ul-stop-pill' +
        (isDone ? ' is-done' : '') + (isNext ? ' is-next' : '') + '" title="' + escHtml(s.why) + '">' +
        '<span class="ul-stop-num">' + (isDone ? '✓' : (idx + 1)) + '</span>' +
        '<span class="ul-stop-name">' + escHtml(s.title.split(' · ')[0]) + '</span>' +
      '</a>';
    }).join('');

    host.innerHTML =
      '<div class="ul-hub-head">' +
        '<div class="ul-hub-title-wrap">' +
          '<span class="ul-hub-eyebrow">ULTRALEARNING × SEE · DO · FEEDBACK</span>' +
          '<h2 class="ul-hub-title">🚀 讀懂 · 讀通 · 讀出興趣 — 科學讀經中樞</h2>' +
          '<p class="ul-hub-sub">融合《超速學習》九大原則與《精進的科學》看・做・回饋三引擎，讓任何程度都能每天 5 分鐘有感進步。</p>' +
        '</div>' +
        '<div class="ul-hub-actions">' +
          '<button type="button" class="btn btn-sm btn-ghost" id="ulOpenMapBtn">🗺️ 66 卷地圖</button>' +
          '<button type="button" class="btn btn-sm btn-ghost" id="ulOpenLogBtn">📝 費曼筆記 (' + stats.reflectionCount + ')</button>' +
          '<button type="button" class="btn btn-sm btn-primary-light" id="ulOpenAcademyBtn">🎓 科學讀經法</button>' +
        '</div>' +
      '</div>' +

      /* 三維成長儀表：讀懂 / 讀通 / 讀出興趣 */
      '<div class="ul-pillars">' +
        '<div class="ul-pillar ul-pillar-see">' +
          '<div class="ul-pillar-top"><span class="ul-pillar-badge">👀 讀懂 · SEE</span><strong>' + stats.readChapCount + ' 章</strong></div>' +
          '<div class="ul-pillar-desc">章前體裁範本＋導讀提問，不再霧裡看花</div>' +
        '</div>' +
        '<div class="ul-pillar ul-pillar-do">' +
          '<div class="ul-pillar-top"><span class="ul-pillar-badge">🧠 讀通 · DO</span><strong>' + stats.masteredCount + ' 章 · ' + stats.memMastered + ' 節</strong></div>' +
          '<div class="ul-pillar-desc">30 秒空白回想＋本章微測驗＋費曼一句話</div>' +
        '</div>' +
        '<div class="ul-pillar ul-pillar-fb">' +
          '<div class="ul-pillar-top"><span class="ul-pillar-badge">🔥 讀出興趣 · FEEDBACK</span><strong>' + (stats.streak ? ('連續 ' + stats.streak + ' 天') : (stats.chTotal ? (stats.chAcc + '% 準確率') : '今日啟程')) + '</strong></div>' +
          '<div class="ul-pillar-desc">階梯路線早勝回饋＋弱點精準特訓</div>' +
        '</div>' +
      '</div>' +

      /* 今日 5 分鐘「看 → 做 → 回饋」循環 */
      '<div class="ul-loop-box">' +
        '<div class="ul-loop-head">' +
          '<span class="ul-loop-title">✨ 今日 5 分鐘「看 → 做 → 回饋」學習循環</span>' +
          '<span class="ul-loop-count">' + loopDone + ' / 3 完成</span>' +
        '</div>' +
        '<div class="ul-loop-steps">' +
          '<a href="' + chapterHash(nextStop.bookNo, nextStop.chap) + '" class="ul-loop-step' + (loop.see ? ' done' : '') + '">' +
            '<span class="ul-step-check">' + (loop.see ? '✓' : '1') + '</span>' +
            '<span class="ul-step-body"><strong>看 (See · 讀懂)</strong><small>讀 ' + escHtml(nextStop.title.split(' · ')[0]) + ' 並看章前導航</small></span>' +
          '</a>' +
          '<a href="' + chapterHash(nextStop.bookNo, nextStop.chap) + '" class="ul-loop-step' + (loop.do ? ' done' : '') + '">' +
            '<span class="ul-step-check">' + (loop.do ? '✓' : '2') + '</span>' +
            '<span class="ul-step-body"><strong>做 (Do · 讀通)</strong><small>完成章末微測驗或 30 秒回想</small></span>' +
          '</a>' +
          '<a href="' + (stats.memDue > 0 ? 'memory.html#cat=due' : 'challenge.html#mixed') + '" class="ul-loop-step' + (loop.feedback ? ' done' : '') + '" id="ulLoopFeedbackLink">' +
            '<span class="ul-step-check">' + (loop.feedback ? '✓' : '3') + '</span>' +
            '<span class="ul-step-body"><strong>回饋 (Feedback · 興趣)</strong><small>' + (stats.memDue > 0 ? ('複習 ' + stats.memDue + ' 節到期經文') : '玩 1 輪交錯挑戰或背 1 節金句') + '</small></span>' +
          '</a>' +
        '</div>' +
      '</div>' +

      /* 階梯式主題學習路線 */
      '<div class="ul-quest-section">' +
        '<div class="ul-quest-tabs" role="tablist" aria-label="選擇學習路線">' + questTabsHtml + '</div>' +
        '<div class="ul-quest-card" style="--q-accent:' + quest.color + ';">' +
          '<div class="ul-quest-top">' +
            '<div>' +
              '<span class="ul-quest-badge">' + escHtml(quest.badge) + '</span>' +
              '<h3 class="ul-quest-name">' + escHtml(quest.title) + '</h3>' +
              '<p class="ul-quest-desc">' + escHtml(quest.subtitle) + '</p>' +
              '<p class="ul-quest-principle">💡 科學原理：' + escHtml(quest.principle) + '</p>' +
            '</div>' +
            '<a href="' + chapterHash(nextStop.bookNo, nextStop.chap) + '" class="btn btn-primary ul-quest-go">' +
              (qp.completed ? '🏆 重溫第 1 站' : ('▶ 開始第 ' + nextStop.index + ' 站')) +
            '</a>' +
          '</div>' +
          '<div class="ul-quest-next-why"><strong>下一站亮點（' + escHtml(nextStop.title) + '）：</strong>' + escHtml(nextStop.why) + '</div>' +
          '<div class="ul-stops-strip">' + stopsPreviewHtml + '</div>' +
        '</div>' +
      '</div>' +

      drillHtml;

    // 綁定路線切換
    host.querySelectorAll('.ul-quest-tab').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var qid = btn.getAttribute('data-quest-id');
        var cur = loadState();
        cur.activeQuestId = qid;
        saveState(cur);
        renderHomeHub();
      });
    });

    // 綁定回饋連結自動打卡
    var fbLink = host.querySelector('#ulLoopFeedbackLink');
    if (fbLink) {
      fbLink.addEventListener('click', function () {
        markDailyStep('feedback');
      });
    }

    var mapBtn = host.querySelector('#ulOpenMapBtn');
    if (mapBtn) mapBtn.addEventListener('click', function () { openLearningModal('map'); });
    var logBtn = host.querySelector('#ulOpenLogBtn');
    if (logBtn) logBtn.addEventListener('click', function () { openLearningModal('log'); });
    var acaBtn = host.querySelector('#ulOpenAcademyBtn');
    if (acaBtn) acaBtn.addEventListener('click', function () { openLearningModal('academy'); });
  }

  /* ---------- 閱讀器章前：「讀懂導航卡」(See: Worked Example + Question-Book) ---------- */
  function findQuestStop(bookNo, chap) {
    var st = loadState();
    var ordered = [getQuestById(st.activeQuestId)].concat(LEARNING_QUESTS.filter(function (q) { return q.id !== st.activeQuestId; }));
    for (var i = 0; i < ordered.length; i++) {
      var q = ordered[i];
      for (var j = 0; j < q.stops.length; j++) {
        if (q.stops[j].bookNo === bookNo && q.stops[j].chap === chap) {
          return { quest: q, stop: q.stops[j], index: j + 1, next: q.stops[j + 1] || null };
        }
      }
    }
    return null;
  }

  function mountChapterTop(readerEl, bookData, chap, chapterObj) {
    if (!readerEl || !bookData) return;
    var bookNo = parseInt(bookData.no, 10);
    var chNo = parseInt(chap, 10);
    var meta = BOOKS_META[bookNo];
    if (!meta) return;

    var genre = GENRE_MODELS[meta.genre] || GENRE_MODELS.history;
    var st = loadState();
    var key = bookNo + ':' + chNo;
    var isMastered = !!st.masteredChapters[key];
    var qMatch = findQuestStop(bookNo, chNo);

    // 記錄今日「看 (See)」完成
    markDailyStep('see');

    var box = document.createElement('section');
    box.className = 'ul-orient-card' + (st.orientCollapsed ? ' is-collapsed' : '');
    box.setAttribute('aria-label', '本章讀懂導航');
    box.style.setProperty('--g-color', genre.color);

    var questRibbon = qMatch ? (
      '<div class="ul-orient-quest">' +
        '<span>🎯 <strong>' + escHtml(qMatch.quest.title.split('：')[0]) + '</strong> · 第 ' + qMatch.index + ' / ' + qMatch.quest.stops.length + ' 站</span>' +
        '<span class="ul-orient-quest-why">' + escHtml(qMatch.stop.why) + '</span>' +
      '</div>'
    ) : '';

    box.innerHTML =
      questRibbon +
      '<div class="ul-orient-head">' +
        '<div class="ul-orient-left">' +
          '<span class="ul-genre-chip">' + genre.icon + ' ' + escHtml(genre.name) + '</span>' +
          '<span class="ul-book-hook">' + escHtml(meta.hook) + '</span>' +
          (isMastered ? '<span class="ul-mastered-pill">✓ 已讀通</span>' : '') +
        '</div>' +
        '<div class="ul-orient-tools">' +
          '<button type="button" class="ul-mini-btn" data-action="blur-toggle" title="Ultralearning 空白回想法：暫時遮蔽經文，測試自己記得多少">🙈 盲測回想</button>' +
          '<button type="button" class="ul-mini-btn" data-action="jump-station" title="直接跳到章末讀通檢核站與微測驗">⚡ 本章微測驗</button>' +
          '<button type="button" class="ul-mini-btn ul-toggle-btn" data-action="collapse" aria-expanded="' + (!st.orientCollapsed) + '">' + (st.orientCollapsed ? '展開讀懂導航 ▾' : '收合 ▴') + '</button>' +
        '</div>' +
      '</div>' +
      '<div class="ul-orient-body">' +
        '<div class="ul-orient-grid">' +
          '<div class="ul-orient-col">' +
            '<div class="ul-orient-label">👀 專家讀法範本（See · 這樣讀秒懂）</div>' +
            '<p class="ul-orient-text">' + escHtml(genre.workedExample) + '</p>' +
            '<p class="ul-orient-pitfall">⚠️ ' + escHtml(genre.pitfall) + '</p>' +
          '</div>' +
          '<div class="ul-orient-col">' +
            '<div class="ul-orient-label">❓ 帶著這 2 個問題讀（Question-Book 法）</div>' +
            '<ol class="ul-orient-qs">' +
              '<li>' + escHtml(genre.questions[0]) + '</li>' +
              '<li>' + escHtml(genre.questions[1]) + '</li>' +
            '</ol>' +
          '</div>' +
        '</div>' +
      '</div>';

    // 插入在 chapter-head 之後
    var headEl = readerEl.querySelector('.chapter-head');
    if (headEl && headEl.nextSibling) {
      readerEl.insertBefore(box, headEl.nextSibling);
    } else {
      readerEl.appendChild(box);
    }

    // 綁定互動
    var collapseBtn = box.querySelector('[data-action="collapse"]');
    if (collapseBtn) {
      collapseBtn.addEventListener('click', function () {
        var collapsed = box.classList.toggle('is-collapsed');
        collapseBtn.textContent = collapsed ? '展開讀懂導航 ▾' : '收合 ▴';
        collapseBtn.setAttribute('aria-expanded', String(!collapsed));
        var cur = loadState();
        cur.orientCollapsed = collapsed;
        saveState(cur);
      });
    }

    var blurBtn = box.querySelector('[data-action="blur-toggle"]');
    if (blurBtn) {
      blurBtn.addEventListener('click', function () {
        var blurred = readerEl.classList.toggle('ul-recall-blur');
        blurBtn.classList.toggle('active', blurred);
        blurBtn.textContent = blurred ? '👁️ 恢復顯示經文' : '🙈 盲測回想';
      });
    }

    var jumpBtn = box.querySelector('[data-action="jump-station"]');
    if (jumpBtn) {
      jumpBtn.addEventListener('click', function () {
        var stEl = readerEl.querySelector('.ul-mastery-station');
        if (stEl) stEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
  }

  /* ---------- 自動產生「本章 1 分鐘即時微測驗」(1,189 章離線通用) ---------- */
  function buildChapterQuiz(chapterObj, bookZh, chapNo) {
    if (!chapterObj || !chapterObj.v || chapterObj.v.length < 2) return [];
    var candidates = [];

    chapterObj.v.forEach(function (v) {
      var txt = (v.t && (v.t.zh_unv || v.t.zh)) || '';
      if (!txt || txt.length < 14) return;
      // 依標點分句，挑出最有辨識度的一段詞組
      var segs = txt.split(/[，。；：！？、「」『』（）\s]+/).filter(function (s) {
        return s.length >= 4 && s.length <= 14;
      });
      if (!segs.length) return;
      // 選中間或較具語意的片段
      var pickSeg = segs[Math.min(1, segs.length - 1)];
      var subLen = Math.min(4, Math.max(2, Math.floor(pickSeg.length / 2)));
      var startPos = Math.max(0, pickSeg.length - subLen);
      var answer = pickSeg.slice(startPos, startPos + subLen);
      if (answer.length < 2) return;

      var masked = txt.replace(answer, '【 ____ 】');
      if (masked === txt) return;
      candidates.push({
        sec: v.s,
        fullText: txt,
        masked: masked,
        answer: answer
      });
    });

    if (candidates.length < 1) return [];

    // 均勻抽最多 3 題（前、中、後）
    var chosen = [];
    var total = candidates.length;
    var indices = total <= 3
      ? [0, 1, 2].slice(0, total)
      : [Math.floor(total * 0.15), Math.floor(total * 0.5), Math.floor(total * 0.85)];

    // 收集所有干擾詞池
    var distractorPool = [];
    candidates.forEach(function (c) {
      if (distractorPool.indexOf(c.answer) === -1) distractorPool.push(c.answer);
    });
    var fallbackDistractors = ['恩典慈愛', '公義聖潔', '信心盼望', '永遠長存', '智慧真理', '平安喜樂', '耶和華神', '天國福音'];

    indices.forEach(function (idx) {
      var item = candidates[idx];
      if (!item) return;
      var opts = [item.answer];
      // 先從同章其他節抽干擾項（更具鑑別度），不足則補通用詞
      for (var i = 0; i < distractorPool.length && opts.length < 4; i++) {
        var d = distractorPool[(idx + i * 3 + 1) % distractorPool.length];
        if (opts.indexOf(d) === -1 && d !== item.answer) opts.push(d);
      }
      for (var j = 0; j < fallbackDistractors.length && opts.length < 4; j++) {
        var fd = fallbackDistractors[j].slice(0, item.answer.length);
        if (opts.indexOf(fd) === -1 && fd.length >= 2) opts.push(fd);
      }
      // 洗牌
      for (var k = opts.length - 1; k > 0; k--) {
        var r = Math.floor(Math.random() * (k + 1));
        var tmp = opts[k]; opts[k] = opts[r]; opts[r] = tmp;
      }
      chosen.push({
        ref: bookZh + ' ' + chapNo + ':' + item.sec,
        masked: item.masked,
        fullText: item.fullText,
        answer: item.answer,
        options: opts
      });
    });
    return chosen;
  }

  /* ---------- 閱讀器章末：「讀通檢核站」(Do + Feedback: Retrieval + Feynman + Quiz) ---------- */
  function mountChapterBottom(readerEl, bookData, chap, chapterObj) {
    if (!readerEl || !bookData) return;
    var bookNo = parseInt(bookData.no, 10);
    var chNo = parseInt(chap, 10);
    var meta = BOOKS_META[bookNo];
    if (!meta) return;

    var st = loadState();
    var key = bookNo + ':' + chNo;
    var isMastered = !!st.masteredChapters[key];
    var savedRef = st.reflections[key] || { feynman: '', question: '' };
    var qMatch = findQuestStop(bookNo, chNo);
    var quizItems = buildChapterQuiz(chapterObj, bookData.zh, chNo);

    var station = document.createElement('section');
    station.className = 'ul-mastery-station';
    station.setAttribute('aria-label', '本章讀通檢核站');

    var nextQuestHtml = '';
    if (qMatch && qMatch.next) {
      nextQuestHtml =
        '<a href="' + chapterHash(qMatch.next.bookNo, qMatch.next.chap) + '" class="btn btn-primary ul-next-quest-btn">' +
          '🎯 前往路線下一站：' + escHtml(qMatch.next.title.split(' · ')[0]) + ' →' +
        '</a>';
    }

    station.innerHTML =
      '<div class="ul-station-head">' +
        '<div>' +
          '<span class="ul-station-eyebrow">DO · FEEDBACK · RETRIEVAL</span>' +
          '<h3 class="ul-station-title">🧠 本章讀通檢核站 — ' + escHtml(bookData.zh) + ' 第 ' + chNo + ' 章</h3>' +
          '<p class="ul-station-sub">《超速學習》提取效應：讀完立刻閉眼回想或小測驗 1 分鐘，比重複讀 5 遍記得更牢！</p>' +
        '</div>' +
        '<button type="button" class="btn ' + (isMastered ? 'btn-mastered' : 'btn-primary') + ' ul-master-btn" id="ulMarkMasteredBtn">' +
          (isMastered ? '✅ 本章已讀通' : '☑️ 標記本章「已讀通」') +
        '</button>' +
      '</div>' +

      '<div class="ul-station-grid">' +
        /* 左欄：即時 1 分鐘本章微測驗 */
        '<div class="ul-station-panel ul-quiz-panel">' +
          '<div class="ul-panel-head">' +
            '<strong>⚡ 即時 1 分鐘經文提取測驗</strong>' +
            '<span class="ul-panel-tag">立即回饋 · Feedback</span>' +
          '</div>' +
          '<div class="ul-quiz-body" id="ulQuizBody"></div>' +
        '</div>' +

        /* 右欄：30 秒空白回想 + 費曼一句話 + 問題筆記法 */
        '<div class="ul-station-panel ul-feynman-panel">' +
          '<div class="ul-panel-head">' +
            '<strong>💡 費曼一句話 &amp; 問題筆記法</strong>' +
            '<button type="button" class="ul-mini-btn" id="ulStationBlurBtn">🙈 遮蔽上方經文</button>' +
          '</div>' +
          '<label class="ul-field">' +
            '<span>1. 空白回想（費曼法：用 1 句話講給沒讀過聖經的朋友聽）</span>' +
            '<textarea id="ulFeynmanInput" rows="2" placeholder="例：這章告訴我們神從無到有創造秩序，並稱人為甚好…">' + escHtml(savedRef.feynman) + '</textarea>' +
          '</label>' +
          '<label class="ul-field">' +
            '<span>2. 留給未來的考題（問題筆記法：之後翻開先考自己）</span>' +
            '<input type="text" id="ulQuestionInput" placeholder="例：為什麼這章特別強調…？" value="' + escHtml(savedRef.question) + '">' +
          '</label>' +
          '<div class="ul-feynman-foot">' +
            '<span class="ul-save-hint" id="ulSaveHint">' + (savedRef.feynman || savedRef.question ? '已儲存於你的學習日誌' : '寫完即自動記錄為今日「做」完成') + '</span>' +
            '<button type="button" class="btn btn-sm btn-primary" id="ulSaveRefBtn">💾 儲存回想並打卡</button>' +
          '</div>' +
        '</div>' +
      '</div>' +

      /* 底部橫向貫通列 (Variability & Multiple Representations) */
      '<div class="ul-station-links">' +
        nextQuestHtml +
        '<a href="#ref/book_study/' + bookNo + '" class="btn btn-sm btn-ghost">👑 深入 ' + escHtml(bookData.zh) + ' 全卷導讀</a>' +
        '<a href="memory.html" class="btn btn-sm btn-ghost">🧠 去背誦處境金句</a>' +
        '<a href="challenge.html#mixed" class="btn btn-sm btn-ghost">🎮 玩一輪交錯挑戰</a>' +
        '<button type="button" class="btn btn-sm btn-ghost" id="ulStationMapBtn">🗺️ 查看 66 卷掌握地圖</button>' +
      '</div>';

    readerEl.appendChild(station);

    // 渲染即時微測驗
    var quizBody = station.querySelector('#ulQuizBody');
    var qIdx = 0;
    var qScore = 0;

    function renderQuizStep() {
      if (!quizItems.length) {
        quizBody.innerHTML = '<p class="ul-quiz-empty">本章節數較少，請直接使用右側「費曼一句話」完成主動回想！</p>';
        return;
      }
      if (qIdx >= quizItems.length) {
        quizBody.innerHTML =
          '<div class="ul-quiz-done">' +
            '<div class="ul-quiz-score">🎉 本章提取測驗完成：<strong>' + qScore + ' / ' + quizItems.length + '</strong></div>' +
            '<p>你剛剛透過主動提取強化了長期記憶神經迴路！</p>' +
            '<button type="button" class="btn btn-sm btn-ghost" id="ulQuizRetryBtn">🔄 再測一次</button>' +
          '</div>';
        markDailyStep('do');
        var retry = quizBody.querySelector('#ulQuizRetryBtn');
        if (retry) retry.addEventListener('click', function () { qIdx = 0; qScore = 0; renderQuizStep(); });
        return;
      }
      var cur = quizItems[qIdx];
      var optsHtml = cur.options.map(function (opt) {
        return '<button type="button" class="ul-quiz-opt" data-val="' + escHtml(opt) + '">' + escHtml(opt) + '</button>';
      }).join('');

      quizBody.innerHTML =
        '<div class="ul-quiz-meta"><span>第 ' + (qIdx + 1) + ' / ' + quizItems.length + ' 題</span><span>' + escHtml(cur.ref) + '</span></div>' +
        '<p class="ul-quiz-prompt">' + escHtml(cur.masked) + '</p>' +
        '<div class="ul-quiz-opts">' + optsHtml + '</div>' +
        '<div class="ul-quiz-fb" id="ulQuizFb" hidden></div>';

      var answered = false;
      quizBody.querySelectorAll('.ul-quiz-opt').forEach(function (btn) {
        btn.addEventListener('click', function () {
          if (answered) return;
          answered = true;
          var val = btn.getAttribute('data-val');
          var ok = val === cur.answer;
          if (ok) qScore++;
          quizBody.querySelectorAll('.ul-quiz-opt').forEach(function (b) {
            var bv = b.getAttribute('data-val');
            if (bv === cur.answer) b.classList.add('is-correct');
            else if (b === btn && !ok) b.classList.add('is-wrong');
            b.disabled = true;
          });
          var fb = quizBody.querySelector('#ulQuizFb');
          fb.hidden = false;
          fb.className = 'ul-quiz-fb ' + (ok ? 'ok' : 'err');
          fb.innerHTML =
            '<div>' + (ok ? '✅ 答對了！記憶提取成功。' : ('💡 正解是「<strong>' + escHtml(cur.answer) + '</strong>」')) + '</div>' +
            '<div class="ul-quiz-full">原經文：' + escHtml(cur.fullText) + '</div>' +
            '<button type="button" class="btn btn-sm btn-primary ul-quiz-next">' + (qIdx + 1 < quizItems.length ? '下一題 →' : '看測驗結果 →') + '</button>';
          fb.querySelector('.ul-quiz-next').addEventListener('click', function () {
            qIdx++;
            renderQuizStep();
          });
        });
      });
    }
    renderQuizStep();

    // 綁定遮蔽經文按鈕
    var blurBtn = station.querySelector('#ulStationBlurBtn');
    if (blurBtn) {
      blurBtn.addEventListener('click', function () {
        var blurred = readerEl.classList.toggle('ul-recall-blur');
        blurBtn.textContent = blurred ? '👁️ 恢復顯示經文' : '🙈 遮蔽上方經文';
      });
    }

    // 綁定儲存費曼與問題筆記
    var saveBtn = station.querySelector('#ulSaveRefBtn');
    var feyInput = station.querySelector('#ulFeynmanInput');
    var qInput = station.querySelector('#ulQuestionInput');
    var saveHint = station.querySelector('#ulSaveHint');
    if (saveBtn) {
      saveBtn.addEventListener('click', function () {
        var fey = (feyInput.value || '').trim();
        var q = (qInput.value || '').trim();
        if (!fey && !q) {
          saveHint.textContent = '請至少寫下一句總結或一個自測問題！';
          return;
        }
        var cur = loadState();
        cur.reflections[key] = { feynman: fey, question: q, ts: Date.now(), bookZh: bookData.zh, bookNo: bookNo, chap: chNo };
        cur.masteredChapters[key] = cur.masteredChapters[key] || { ts: Date.now() };
        saveState(cur);
        markDailyStep('do');
        saveHint.textContent = '✅ 已存入費曼學習日誌，並自動標記本章已讀通！';
        var mBtn = station.querySelector('#ulMarkMasteredBtn');
        if (mBtn) {
          mBtn.className = 'btn btn-mastered ul-master-btn';
          mBtn.textContent = '✅ 本章已讀通';
        }
      });
    }

    // 綁定標記已讀通
    var masterBtn = station.querySelector('#ulMarkMasteredBtn');
    if (masterBtn) {
      masterBtn.addEventListener('click', function () {
        var cur = loadState();
        if (cur.masteredChapters[key]) {
          delete cur.masteredChapters[key];
          masterBtn.className = 'btn btn-primary ul-master-btn';
          masterBtn.textContent = '☑️ 標記本章「已讀通」';
        } else {
          cur.masteredChapters[key] = { ts: Date.now() };
          masterBtn.className = 'btn btn-mastered ul-master-btn';
          masterBtn.textContent = '✅ 本章已讀通';
          markDailyStep('do');
        }
        saveState(cur);
      });
    }

    var mapBtn = station.querySelector('#ulStationMapBtn');
    if (mapBtn) mapBtn.addEventListener('click', function () { openLearningModal('map'); });
  }

  /* ---------- 學習中樞彈窗：66 卷地圖 / 費曼筆記本 / 兩書科學讀經法學院 ---------- */
  function ensureModal() {
    var modal = document.getElementById('ulLearningModal');
    if (modal) return modal;
    modal = document.createElement('div');
    modal.id = 'ulLearningModal';
    modal.className = 'ul-modal';
    modal.hidden = true;
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-label', '科學讀經中心');
    modal.innerHTML =
      '<div class="ul-modal-backdrop" data-close="1"></div>' +
      '<div class="ul-modal-dialog">' +
        '<header class="ul-modal-head">' +
          '<div class="ul-modal-tabs" role="tablist">' +
            '<button type="button" class="ul-mtab active" data-tab="map">🗺️ 66 卷掌握地圖</button>' +
            '<button type="button" class="ul-mtab" data-tab="log">📝 費曼與問題筆記本</button>' +
            '<button type="button" class="ul-mtab" data-tab="academy">🎓 科學讀經法學院</button>' +
          '</div>' +
          '<button type="button" class="ul-modal-close" data-close="1" aria-label="關閉">×</button>' +
        '</header>' +
        '<div class="ul-modal-body" id="ulModalBody"></div>' +
      '</div>';
    document.body.appendChild(modal);

    modal.addEventListener('click', function (e) {
      if (e.target && e.target.getAttribute('data-close') === '1') {
        modal.hidden = true;
      }
    });
    modal.querySelectorAll('.ul-mtab').forEach(function (t) {
      t.addEventListener('click', function () {
        renderModalTab(t.getAttribute('data-tab'));
      });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !modal.hidden) modal.hidden = true;
    });
    return modal;
  }

  function openLearningModal(tabName) {
    var modal = ensureModal();
    modal.hidden = false;
    renderModalTab(tabName || 'map');
  }

  function renderModalTab(tab) {
    var modal = ensureModal();
    modal.querySelectorAll('.ul-mtab').forEach(function (b) {
      b.classList.toggle('active', b.getAttribute('data-tab') === tab);
    });
    var body = modal.querySelector('#ulModalBody');
    var st = loadState();

    if (tab === 'map') {
      // 統計每卷已讀通章數
      var bookDone = {};
      Object.keys(st.masteredChapters).forEach(function (k) {
        var bNo = parseInt(k.split(':')[0], 10);
        bookDone[bNo] = (bookDone[bNo] || 0) + 1;
      });
      var genreOrder = ['law', 'history', 'poetry', 'prophets', 'gospels', 'acts', 'epistles', 'apocalyptic'];
      var html = '<p class="ul-modal-lead"><strong>後設學習地圖（Metalearning Map）：</strong>一眼看清聖經 66 卷的 8 大體裁結構與你的讀通進度。點擊任意書卷即可直接開啟閱讀！</p>';
      genreOrder.forEach(function (gKey) {
        var g = GENRE_MODELS[gKey];
        var books = BOOKS_META.filter(function (b) { return b && b.genre === gKey; });
        html += '<div class="ul-map-group">' +
          '<h4 class="ul-map-gtitle" style="color:' + g.color + ';">' + g.icon + ' ' + escHtml(g.name) + '</h4>' +
          '<div class="ul-map-grid">' +
          books.map(function (b) {
            var cnt = bookDone[b.no] || 0;
            var pct = Math.min(100, Math.round((cnt / b.nch) * 100));
            return '<a href="' + chapterHash(b.no, 1) + '" class="ul-map-cell' + (cnt > 0 ? ' has-prog' : '') + '" title="' + escHtml(b.zh + '：' + b.hook) + '">' +
              '<span class="ul-mc-name">' + escHtml(b.zh) + '</span>' +
              '<span class="ul-mc-stat">' + cnt + '/' + b.nch + '章</span>' +
              '<span class="ul-mc-bar"><i style="width:' + pct + '%;background:' + g.color + ';"></i></span>' +
            '</a>';
          }).join('') +
          '</div></div>';
      });
      body.innerHTML = html;
      body.querySelectorAll('.ul-map-cell').forEach(function (a) {
        a.addEventListener('click', function () { modal.hidden = true; });
      });
      return;
    }

    if (tab === 'log') {
      var keys = Object.keys(st.reflections).sort(function (a, b) {
        return (st.reflections[b].ts || 0) - (st.reflections[a].ts || 0);
      });
      if (!keys.length) {
        body.innerHTML =
          '<div class="ul-empty-log">' +
            '<div style="font-size:2.2rem;">📝</div>' +
            '<h4>還沒有費曼筆記或自測考題</h4>' +
            '<p>讀完任何一章後，滑到章末「讀通檢核站」，用一句話寫下你的理解或出一道考題給未來的自己，就會自動收錄在這裡變成專屬記憶卡！</p>' +
            '<a href="#read/Gen/1" class="btn btn-primary" data-close-jump="1">立刻去讀創世記 1 章 →</a>' +
          '</div>';
      } else {
        body.innerHTML =
          '<p class="ul-modal-lead"><strong>問題筆記法 × 費曼回想卡：</strong>試著先看自己的考題、在心裡回答，再點「揭曉我的總結」檢驗記憶！</p>' +
          '<div class="ul-log-list">' +
          keys.map(function (k) {
            var r = st.reflections[k];
            var refLabel = (r.bookZh || ('書卷' + r.bookNo)) + ' 第 ' + r.chap + ' 章';
            return '<article class="ul-log-card">' +
              '<div class="ul-log-head">' +
                '<a href="' + chapterHash(r.bookNo, r.chap) + '" class="ul-log-ref" data-close-jump="1">📖 ' + escHtml(refLabel) + '</a>' +
                '<span class="ul-log-date">' + new Date(r.ts).toLocaleDateString() + '</span>' +
              '</div>' +
              (r.question ? '<div class="ul-log-q">❓ 考題：' + escHtml(r.question) + '</div>' : '') +
              (r.feynman ? '<details class="ul-log-ans"><summary>👁️ 點擊揭曉我的費曼一句話</summary><p>' + escHtml(r.feynman) + '</p></details>' : '') +
            '</article>';
          }).join('') +
          '</div>';
      }
      body.querySelectorAll('[data-close-jump="1"]').forEach(function (a) {
        a.addEventListener('click', function () { modal.hidden = true; });
      });
      return;
    }

    // tab === 'academy'
    body.innerHTML =
      '<div class="ul-academy">' +
        '<p class="ul-modal-lead">將 Scott H. Young 兩本學習科學經典——<strong>《Ultralearning 超速學習》</strong>與<strong>《Get Better at Anything 精進的科學》</strong>——轉化為人人做得到的聖經學習系統：</p>' +
        '<div class="ul-aca-pillars">' +
          '<div class="ul-aca-card">' +
            '<span class="ul-aca-badge" style="background:#dbeafe;color:#1d4ed8;">一、讀懂（SEE · 看見典範與地圖）</span>' +
            '<ul>' +
              '<li><strong>先畫地圖（Metalearning）：</strong>先看體裁與全卷一句話定位，再進入經文細節，大腦立刻有掛鉤。</li>' +
              '<li><strong>借鏡專家範本（Worked Examples）：</strong>每章上方內建「專家讀法範本＋避坑提醒」，把神學家的隱形思維變成看得見的步驟。</li>' +
              '<li><strong>早勝建立信心（Success Is the Best Teacher）：</strong>從「7 天破冰之旅」開始，每天 5 分鐘讀懂最動人的篇章，徹底消除畏懼。</li>' +
            '</ul>' +
            '<a href="#read/Luke/15" class="btn btn-sm btn-primary-light" data-close-jump="1">立即體驗：讀懂路加福音 15 章 →</a>' +
          '</div>' +
          '<div class="ul-aca-card">' +
            '<span class="ul-aca-badge" style="background:#dcfce7;color:#15803d;">二、讀通（DO · 主動提取與多樣練習）</span>' +
            '<ul>' +
              '<li><strong>提取大於重讀（Retrieval）：</strong>讀完按下「🙈 盲測回想」，用 30 秒空白回想＋章末 1 分鐘微測驗，把知識鎖進長期記憶。</li>' +
              '<li><strong>費曼直覺法（Intuition）：</strong>能用一句白話講給朋友聽，才算真正讀通；把心得改寫成「問題筆記」供日後自測。</li>' +
              '<li><strong>多樣交錯勝過死背（Variability Over Repetition）：</strong>交替使用閱讀器、777 處境背誦與聖經挑戰，從敘事、金句、地理多維度打通！</li>' +
            '</ul>' +
            '<a href="memory.html" class="btn btn-sm btn-primary-light">前往 777 經文主動提取背誦 →</a>' +
          '</div>' +
          '<div class="ul-aca-card">' +
            '<span class="ul-aca-badge" style="background:#fef3c7;color:#b45309;">三、讀出興趣（FEEDBACK · 即時回饋與弱點特訓）</span>' +
            '<ul>' +
              '<li><strong>直球實戰（Directness）：</strong>別等到「準備好」才開始，直接進經文、直接做微測驗、直接玩闖關。</li>' +
              '<li><strong>精準攻克弱點（Drill）：</strong>系統自動偵測你最不熟的分類與 Leitner 到期錯題，花 3 分鐘集中突破，成就感翻倍。</li>' +
              '<li><strong>漸進探索（Experimentation）：</strong>透過 11 譯本對照、Strong 原文與四重時間釋經，把讀經變成充滿驚喜的探索旅程！</li>' +
            '</ul>' +
            '<a href="challenge.html#mixed" class="btn btn-sm btn-primary-light">進入聖經挑戰・全能交錯闖關 →</a>' +
          '</div>' +
        '</div>' +
      '</div>';
    body.querySelectorAll('[data-close-jump="1"]').forEach(function (a) {
      a.addEventListener('click', function () { modal.hidden = true; });
    });
  }

  /* ---------- 初始化與對外 API ---------- */
  window.BibliaLearn = {
    BOOKS_META: BOOKS_META,
    GENRE_MODELS: GENRE_MODELS,
    LEARNING_QUESTS: LEARNING_QUESTS,
    renderHomeHub: renderHomeHub,
    mountChapterTop: mountChapterTop,
    mountChapterBottom: mountChapterBottom,
    openLearningModal: openLearningModal,
    markDailyStep: markDailyStep,
    gatherEcosystemStats: gatherEcosystemStats
  };

  function boot() {
    renderHomeHub();
    // 回首頁時自動刷新學習中樞最新統計
    window.addEventListener('hashchange', function () {
      if (!location.hash || location.hash === '#' || location.hash === '#home') {
        setTimeout(renderHomeHub, 50);
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
