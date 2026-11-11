/**
 * Biblia - 正統研經法與聖經詮釋學旗艦指南 (Biblia Hermeneutics & Bible Study Methods Guide)
 * 深度收錄：
 * 1. 莊信德牧師《重返聖經現場：四重時間的聖經詮釋學》（校園書房專題影音 VID=73）全景理論與實踐工作坊
 * 2. 普世正統主流研經法（歸納法 OIA、歷史-文法-字義解經、救贖歷史/以基督為中心、經典聖言誦讀 Lectio Divina、SOAP、以經解經）
 * 3. 台灣三大正統神學院深度研究（台神 TGST、華神 CES、靈神 Bread of Life 及浸神、中神、正道跨學術互補）
 * 4. 台灣五大教會體系讀經傳統（長老會新眼光、靈糧堂活潑生命QT、行道會卓越門訓、浸信會歸納研經、聖教會成聖晨更）
 * 5. 韓國正統福音教會經典讀經法（大地教會/推拉奴 QT 與一對一、愛的教會玉漢欽門徒訓練研經法、純福音第四次元靈性默想）
 * 6. 非異端基督教正統研經防偽指針（大公信經規範、破除新天地/東方閃電/耶證/攝理教謬誤、三大釋經金科玉律）
 * 7. 互動研經實踐工具（研經法診斷測驗、四重時間經典經文動態解析台、SOAP/OIA 筆記生成器）
 */

(function () {
  'use strict';

  var HERMENEUTICS_DATA = {
    meta: {
      title: '正統研經法與聖經詮釋學旗艦指南',
      subtitle: '重返四重時間聖經現場 · 承接台灣神學院與普世正統教會恩膏 · 建立一生純全讀經根基',
      version: '1.0.0',
      campusVideoUrl: 'https://shop.campus.org.tw/Media/VideoDetails.aspx?VID=73',
      campusVideoTitle: '莊信德《重返聖經現場：四重時間的聖經詮釋學》校園書房專題影音'
    },

    // 1. 莊信德《重返聖經現場：四重時間的聖經詮釋學》
    fourfoldTimeTheory: {
      author: '莊信德 牧師',
      authorTitle: '前校園書房出版社社長 · 台中盤石浸信會牧師 · 美國波士頓大學神學博士候選人',
      bookTitle: '《重返聖經現場：四重時間的聖經詮釋學》',
      videoUrl: 'https://shop.campus.org.tw/Media/VideoDetails.aspx?VID=73',
      corePremise: '把聖經詮釋的主權，重新交還給正在向我們說話的三一上帝！',
      critiqueProblem: '當代讀經往往陷入兩大極端死胡同：\n1. 「歷史批判客觀主義」：將時間冰凍在古代考古標本中，只問「第一世紀發生何事」，使經文成為與當代生命無關的古老骨董。\n2. 「後現代主觀靈修主義」：切斷歷史與正典脈絡，讀者成為詮釋的主人，隨意將自我情緒與慾望投射在經文中，導致「我怎麼想就是神怎麼說」的自戀式讀經。\n\n莊信德牧師所提出的「四重時間」詮釋架構，建構了從三一上帝的歷史主權、正典默示、基督成全到聖靈在當代讀者心中的四維立體通道。',
      dimensions: [
        {
          timeNo: 1,
          name: '第一時間：歷史救贖事件現場 (Historical Event Time)',
          trinityPerson: '聖父主動在人類歷史時空中的救贖介入',
          badge: '第一時間 · 歷史救贖現場',
          color: '#d97706',
          icon: 'fa-landmark',
          definition: '三一上帝在人類時空中具體發動、介入、啟示救恩的客觀歷史時空座標點。',
          theologyAnchor: '上帝不是抽象哲學觀念，而是真正進入人類苦難與歷史的行動者。創世記的摩利亞山築壇、出埃及記的紅海分開、西奈山的雷轟烈火、客西馬尼園的橄欖樹下、各各他十字架上的流血受難、以及空墳墓的破曉清晨，皆是人類時空中不容抹煞的客觀歷史真實性（Historicity）。',
          hermeneuticMethod: '考證古代歷史背景、地理水文、考古發現、政治帝國脈絡（埃及、亞述、巴比倫、波斯、羅馬），還原當事人所處的殘酷生存現實，拒絕將經文神話化或靈意化。',
          exercisePrompt: '闔上眼睛，想像自己正站在當日事件的現場：你聞到何種氣味？聽見何種狂風或哀哭？當事人在面對生死關頭時對上帝的呼求是何等真實？'
        },
        {
          timeNo: 2,
          name: '第二時間：經文文本成形與正典默示現場 (Inscripturation & Canon Formation Time)',
          trinityPerson: '聖靈默示先知與使徒在社群危機中記錄編纂',
          badge: '第二時間 · 正典默示現場',
          color: '#2563eb',
          icon: 'fa-feather-alt',
          definition: '聖靈感動被揀選的人類作者（摩西、先知、福音書作者、使徒保羅等），在信仰群體面臨特定歷史危機時，將救贖記憶記錄、編纂為正典的成書現場。',
          theologyAnchor: '聖經文本不是機械式聽寫，而是神聖默示（Divine Inspiration）與人類作者處境深刻交融的產物。申命記是摩西在約旦河東面對進迦南第二代的新生代重申盟約；以西結書是祭司在巴比倫迦巴魯河邊為被擄亡國者重燃盼望；保羅書信是使徒身處羅馬陰暗監獄、面對初代教會分裂與異端威脅時以眼淚寫下的牧養心腸。',
          hermeneuticMethod: '深入探究作者寫作意圖、文學體裁（敘事、詩歌、箴言、預言、天啟、書信）、篇章文法結構、原文關鍵字語義場，以及信仰群體的原初生活處境（Sitz im Leben）。',
          exercisePrompt: '回到作者拿起鵝毛筆或羊皮卷的那一刻：作者正在為教會的哪一個裂痕痛心？聖靈如何藉著他當下的痛苦，將永恆不變的神聖話語銘刻為正典？'
        },
        {
          timeNo: 3,
          name: '第三時間：基督救贖歷史焦點與正典互文大時間 (Canonical Christ-Centered Redemptive Time)',
          trinityPerson: '聖子耶穌基督在十字架與復活中的終極應驗',
          badge: '第三時間 · 基督正典互文大時間',
          color: '#dc2626',
          icon: 'fa-cross',
          definition: '整本舊約與新約 66 卷正典，以道成肉身、受死、復活、升天並將再臨的耶穌基督為救贖歷史的軸心與終極應驗（路 24:27, 44）。',
          theologyAnchor: '聖經不是互不相干的獨立故事拼盤，而是一首以基督十字架為高潮的救贖交響曲。舊約的一切影子、預表、律法祭儀、君王受膏體系，皆在耶穌基督身上得到完全解答（林後 1:20「神的應許，在基督都是是的」）。創世記傷蛇頭的後裔、出埃及記被殺的逾越節羔羊、利未記大祭司的贖罪祭、約書亞記領民進安息的元帥、以賽亞書受苦的僕人，全是指向基督。',
          hermeneuticMethod: '正典神學（Canonical Theology）與正典互文對照（Intertextuality）。從整本聖經的救贖弧線（創造—墮落—救贖—成全）解讀經文，追溯預表學（Typology）與盟約漸進啟示，破除孤立的道德主義說教。',
          exercisePrompt: '這段經文如何指向耶穌基督？如果沒有基督的十字架與復活，這段經文是否會淪為不可承受的律法重擔或廉價的心靈雞湯？基督如何在此承擔了我們的絕望？'
        },
        {
          timeNo: 4,
          name: '第四時間：聖靈在當下對讀者說話與行動的時間 (Reader\'s Present Under the Holy Spirit)',
          trinityPerson: '聖靈在今日信徒心中動工轉化並差遣走向世界',
          badge: '第四時間 · 今日讀者更新現場',
          color: '#059669',
          icon: 'fa-heart',
          definition: '身處今日歷史時空與具體處境的讀者群體，在聖靈的光照（Illumination）與運行下，順服回應三一上帝當下的呼召。',
          theologyAnchor: '詮釋學的終點不是頭腦神學知識的積累，而是生命的順服與降服！此時讀者不再是「審判經文」的旁觀評論家，而是經文成為「審判並剖開讀者心懷意念」的兩刃利劍（來 4:12）。聖靈藉著已經成形的經文，在我們當前的家庭撕裂、職場試探、苦難哀傷、時代恐慌中發出呼喚，推動我們悔改、成聖、並在世界中踐行愛與公義。',
          hermeneuticMethod: '處境化應用（Contextual Application）、聖靈光照祈求、認罪悔改、社群實踐、國度宣教與門徒行道。',
          exercisePrompt: '三一上帝今天透過這段經文，正在嚴肅責備我內心隱藏的哪一個偶像？祂正賜給我何種超越環境的平安？祂呼召我今天向身旁的哪一個人伸出憐憫的雙手？'
        }
      ],
      interactiveCases: [
        {
          id: 'case_gen22',
          title: '創世記 22 章 · 亞伯拉罕在摩利亞山獻以撒',
          keyVerse: '創世記 22:14「亞伯拉罕給那地方起名叫『耶和華以勒』，直到今日人還說：『在耶和華的山上必有預備。』」',
          t1: '主前兩千年古代迦南異教盛行嬰兒獻祭背景下，百歲得子的亞伯拉罕走過三日痛苦死蔭曠野路，在摩利亞山舉刀順服，聽見天使急切阻止的驚險歷史現場。',
          t2: '出埃及第一代選民在曠野面對多神誘惑之際，聖靈藉摩西將列祖堅貞立約信心化為成文憲章，確立以色列敬拜唯獨順服立約之神，神絕不喜悅人獻人祭，卻必親自預備替罪救贖。',
          t3: '基督就是神所預備的終極公羊與獨生愛子！父神不愛惜自己的兒子為我們眾人捨了（羅 8:32），耶穌背著木頭各各他山，在十字架上一次作了永遠的挽回祭。',
          t4: '今天在你的生命祭壇上，何為你緊抓不放的「以撒」（名利、子女掌控、虛假安全感）？你是否敢憑信交在神手中，經歷神必親自作你的「耶和華以勒」？'
        },
        {
          id: 'case_ex14',
          title: '出埃及記 14 章 · 紅海阻隔與救贖之夜',
          keyVerse: '出埃及記 14:13-14「摩西對百姓說：『不要懼怕，只管站住！看耶和華今天向你們所要施行的救恩... 耶和華必為你們爭戰，你們只管靜默，不要作聲。』」',
          t1: '前有滾滾紅海阻斷生路，後有法老鐵甲戰車狂飆追殺。曠野奴隸百姓絕望哀嚎，摩西向海伸杖，東風吹拂一夜，海水立起如壘的生死拯救現場。',
          t2: '聖靈保守這段戰歌記憶（出 15），在被奴役四百年的流浪民族心中植入不可磨滅的立約身分：耶和華是打破埃及假神權柄的宇宙唯一真神與戰士。',
          t3: '使徒保羅指出：「我們的祖宗都在雲裡、海裡受洗歸了摩西」（林前 10:2）。基督在十字架與死蔭深淵中為我們劈開一條活路，藉著受死復活帶領我們從撒但死權中永遠出埃及！',
          t4: '今天在你眼前是否有看似不可能跨越的困境障礙（經濟危機、重病、關係冰點）？聽見主說：「你只管靜默，看神今天為你施行的救恩！」'
        },
        {
          id: 'case_ps23',
          title: '詩篇 23 篇 · 耶和華是我的牧者',
          keyVerse: '詩篇 23:4「我雖然行過死陰的幽谷，也不怕遭害，因為你與我同在；你的杖，你的竿，都安慰我。」',
          t1: '猶大曠野險峻乾涸的河谷（Wadi）中，狼群猛獸潛伏，大衛少年放羊經歷生死交界，親身體驗牧羊人手持短杖禦敵、長竿引路的實境。',
          t2: '聖靈引導被擄與苦難中的以色列敬拜群體，將大衛詩歌編入聖殿五卷讚美詩集，使一代代受屈辱、背井離鄉的選民在流淚中重拾對聖約之神的倚靠。',
          t3: '主耶穌宣告「我是好牧人，好牧人為羊捨命」（約 10:11）！祂親身走過十字架最深沉的死陰幽谷，以復活的大能戰勝死亡深淵，為我們在仇敵面前擺設天國豐盛筵席。',
          t4: '此時此刻你是否正陷在失業、疾病、原生家庭破碎或抑鬱低谷的幽谷中？聽見好牧人耶穌正呼喚你的名字，祂的竿與杖從未離開你一步！'
        },
        {
          id: 'case_isa53',
          title: '以賽亞書 53 章 · 受苦僕人之歌',
          keyVerse: '以賽亞書 53:5「哪知祂為我們的過犯受害，為我們的罪孽壓傷。因祂受的刑罰，我們得平安；因祂受的鞭傷，我們得醫治。」',
          t1: '主前八世紀面對強暴亞述帝國橫行、猶大國道德敗壞之時，先知以賽亞在聖殿異象中預先看見那無佳形美容、如同羊羔被牽往宰殺之地的神秘義僕。',
          t2: '在被擄巴比倫亡國最灰暗絕望之夜，聖靈藉這卷先知書安慰餘民：神沒有背棄祂的盟約，以色列一切罪債由一位神聖代理僕人全然承擔，預告新出埃及救贖。',
          t3: '耶穌在客西馬尼園被捕、彼拉多公堂受鞭笞、各各他十架上背負全人類罪孽，彼得直接引用本章宣告「因祂受的鞭傷，你們便得了醫治」（彼前 2:24），字字精確應驗！',
          t4: '我們日常總想證明自己的清白與義氣，然而基督卻為我們這群如羊走迷的罪人承擔了所有羞辱與壓傷。今天你願否卸下自以為義的偽裝，安息在祂完全的赦罪恩典中？'
        },
        {
          id: 'case_john1',
          title: '約翰福音 1:14 · 道成肉身住在我們中間',
          keyVerse: '約翰福音 1:14「道成了肉身，住在我們中間，充充滿滿地有恩典有真理。我們也見過祂的榮光，正是父獨生子的榮光。」',
          t1: '主後第一世紀羅馬帝國統治下，拿撒勒人耶穌降生伯利恆馬槽，真實走在巴勒斯坦塵土漫飛的鄉野，觸摸痲瘋病人、與哀哭者一同落淚的歷史時空。',
          t2: '第一世紀末以弗所教會面對諾斯底主義（Gnosticism）幻影論——妄稱物質皆邪惡、基督肉身是幻覺——老使徒約翰在聖靈默示下寫下「道成了肉身，支搭帳幕在我們中間」（Skēnoō），徹底捍衛信仰正統。',
          t3: '基督是舊約摩西會幕與所羅門聖殿的終極實體！上帝不再隱藏於幽暗至聖所幔子後，而是在耶穌基督受傷的肋旁向世界敞開完全的救贖榮光。',
          t4: '基督教不是遠離人間煙火的虛幻冥想，而是上帝親自進入我們破碎、痛苦、汗水與眼淚的肉身世界。神今天呼召你走入身旁哪一個受傷者的身旁，成為祂具體的擁抱？'
        },
        {
          id: 'case_rom8',
          title: '羅馬書 8:28-39 · 萬事互相效力與得勝有餘',
          keyVerse: '羅馬書 8:37「然而，靠著愛我們的主，在這一切的事上已經得勝有餘了。」',
          t1: '主後 57 年在哥林多城，使徒保羅預備前往耶路撒冷冒死解送救濟款前夕，面臨猶太暴徒追殺與未來羅馬殉道險境的真實告白。',
          t2: '聖靈藉保羅向帝國首都羅馬的猶太與外邦信徒頒布這部救恩神學巔峰憲章，宣告凡在基督耶穌裡的就不定罪，聖靈親自以說不出的嘆息為聖徒代求。',
          t3: '「誰能使我們與基督的愛隔絕呢？」受死、復活、升天並在神右邊為我們代求的基督，就是這份宇宙級永遠之愛的永久保證！',
          t4: '無論今日世局多麼動盪、個人前途多麼迷茫，沒有任何患難、困苦、逼迫、飢餓能叫我們與基督的愛隔絕。今天你能在眼淚中向仇敵誇勝宣告！'
        }
      ]
    },

    // 2. 普世正統主流研經法
    mainstreamMethods: [
      {
        id: 'method_oia',
        name: '歸納法研經 (Inductive Bible Study - OIA 法)',
        tag: '經典正統 · 福音派學術與團契基石',
        icon: 'fa-search-plus',
        color: '#2563eb',
        summary: '從客觀經文事實出發，由細節歸納出普遍真理，避免先入為主的偏見投射。',
        coreSteps: [
          {
            name: '1. 觀察 (Observation) — 經文說了什麼？ (What does the text say?)',
            detail: '動用所有感官細緻閱讀：\n• 5W1H (Who 誰, What 甚麼事, Where 何處, When 何時, Why 為何, How 如何)\n• 重複出現的關鍵字詞與概念\n• 轉折連接詞（因此、但是、因為、叫、若）\n• 修辭與結構（對稱交叉 Chiasm、對比、遞進平行）\n• 文體類型判別（敘事、律法、詩歌、箴言、書信、天啟）'
          },
          {
            name: '2. 解釋 (Interpretation) — 經文意味著什麼？ (What does the text mean?)',
            detail: '重回原作者與原初讀者語境：\n• 詞彙在希伯來/希臘原文的原初含義（語義場）\n• 當代歷史政治、地理水文、古代近東或希臘羅馬文化習俗\n• 上下文脈絡（Context is King）\n• 正典互參以經解經（經文與整本聖經神學的和諧一致性）'
          },
          {
            name: '3. 應用 (Application) — 經文對今日的我意味著什麼？ (How does it apply to me?)',
            detail: '將永恆真理橋接至當前生活：\n• SPACE 檢驗法則：\n  S (Sin) — 有何當認之罪？\n  P (Promise) — 有何當握之應許？\n  A (Attitude) — 有何當調整的態度或價值觀？\n  C (Command) — 有何當遵行之命令？\n  E (Example) — 有何當效法或引以為戒之榜樣？\n• 具體可行性（SMART 原則，避免空洞口號）'
          }
        ],
        suitableFor: '個人每日研讀、小組查經帶領、主日學教材編寫、講道大綱預備。'
      },
      {
        id: 'method_historical_grammatical',
        name: '歷史-文法-字義解經法 (Historical-Grammatical Hermeneutics)',
        tag: '改教家正統 · 學術原文釋經講道核心',
        icon: 'fa-book-reader',
        color: '#4f46e5',
        summary: '馬丁路德與加爾文確立之改教原則，堅守聖經的字面歷史文法涵義（Sensus Literalis），反對中世紀任意四重靈意附會。',
        coreSteps: [
          {
            name: '1. 原文文法與句法結構分析 (Syntactical Analysis)',
            detail: '解剖希伯來文/希臘文原文字根、時態（如希臘文完成時 Tetelestai 救贖已永遠成就）、語態（神聖被動態 Divine Passive）、語氣（直說語氣 vs 命令語氣），畫出句法結構圖（Block Diagramming）。'
          },
          {
            name: '2. 歷史與文化背景重構 (Historical-Cultural Context)',
            detail: '還原寫作年代之帝國霸權、經濟制度、階級衝突、宗教異教風俗，辨識何者為具有永恆規範性的道德真理，何者為受當時文化處境制約的具體表述。'
          },
          {
            name: '3. 文體體裁與修辭規範 (Literary Genre Hermeneutics)',
            detail: '依據不同體裁遵循相應解經法則：不能將舊約詩歌誇張修辭（如「山嶺跳躍如公羊」）當作地質學記錄；不能將箴言通用生活智慧格言當作百分之百絕對契約應許；不能將舊約敘事中歷史人物的道德軟弱（如多妻、謊言）直接當作道德模範。'
          }
        ],
        suitableFor: '神學生、傳道人講道預備、教義爭議澄清、護教學深造。'
      },
      {
        id: 'method_christocentric',
        name: '救贖歷史/以基督為中心研經法 (Redemptive-Historical / Christocentric Method)',
        tag: '救贖大敘事 · 破除律法道德主義',
        icon: 'fa-church',
        color: '#b91c1c',
        summary: '葛瑞登（Graeme Goldsworthy）、柴培爾（Bryan Chapell）、提摩太凱勒（Timothy Keller）極力倡導：整本聖經都在見證神在基督裡的拯救史詩。',
        coreSteps: [
          {
            name: '1. 辨識「人類墮落處境焦點」 (Fallen Condition Focus - FCF)',
            detail: '每一段經文都在對準墮落後人類共同面臨的某種罪性、恐懼、軟弱、無力自救的困境（如大衛與歌利亞中以色列全軍的恐懼顫抖）。'
          },
          {
            name: '2. 拒絕「道德主義英雄化」 (Anti-Moralism)',
            detail: '不把大衛簡化為「我們要勇敢甩石擊敗人生的歌利亞」（這會將人推向靠自己意志力行律法的自義或絕望），而是看見真大衛——耶穌基督——才是那位替我們下到戰場擊碎撒但巨人的真正得勝元帥！我們是大衛身後白白享受戰利品的軟弱以色列百姓。'
          },
          {
            name: '3. 連接至基督恩典與十架救贖 (Connecting to Grace & Cross)',
            detail: '追溯經文在整部救贖歷史（創造—墮落—救贖—復興）中的座標，看基督如何在十字架上承擔了本段經文所揭露的審判，並在復活中賜下聖靈成全恩典。'
          }
        ],
        suitableFor: '以福音為中心的講道、心靈醫治輔導、福音性查經、跨越新舊約的整合理解。'
      },
      {
        id: 'method_lectio_divina',
        name: '聖言誦讀與靈修默想法 (Lectio Divina)',
        tag: '修院靈修瑰寶 · 深刻親近神心靈沉浸',
        icon: 'fa-pray',
        color: '#0891b2',
        summary: '源遠流長的基督教靈修操練，將讀經從「理性解剖知識」轉化為「與三一上帝溫柔親密的聖愛對話」。',
        coreSteps: [
          {
            name: '1. 讀 (Lectio) — 聆聽聖言',
            detail: '以沉靜、緩慢、敬畏的心，將簡短經文反覆朗讀數遍，如同品嚐醇釀，留心聖靈讓哪一個字或句子在心中「發光」。'
          },
          {
            name: '2. 默 (Meditatio) — 反覆咀嚼',
            detail: '將觸動心靈的字句含在口中、放在心中反覆默念思索。像羊反芻一樣，問自己：「上帝在此刻藉這個詞對我的心說什麼？」'
          },
          {
            name: '3. 禱 (Oratio) — 傾心吐意',
            detail: '不再背誦空泛禱詞，而是直接將默想所激發的情感、痛悔、感恩、渴慕化為真誠呼求，毫無保留向神敞開內心陰暗與渴望。'
          },
          {
            name: '4. 安歇/順服 (Contemplatio) — 在愛中歇息',
            detail: '放下所有言語與思考，單單安靜在神榮耀的同在與慈愛中。帶著被聖靈更新的心靈步入日常，堅定順服祂的帶領。'
          }
        ],
        suitableFor: '清晨守晨更、退修會靈修、心靈疲憊者恢復、每日安靜親近神。'
      },
      {
        id: 'method_soap',
        name: 'SOAP 靈修讀經法',
        tag: '當代青年與上班族最愛 · 結構精煉執行力強',
        icon: 'fa-pencil-alt',
        color: '#ea580c',
        summary: '全球當代活力教會廣泛推行的靈修筆記架構，將讀經內化為每日可落實的門徒步履。',
        coreSteps: [
          {
            name: 'S - Scripture (經文)',
            detail: '在今日進度中親手抄寫最打動你靈魂的 1~2 節經文。抄寫過程能減緩心速，深深刻入記憶。'
          },
          {
            name: 'O - Observation (觀察)',
            detail: '簡短列出經文中上帝的心意、人物的情感、背後的屬靈原則或因果關聯。'
          },
          {
            name: 'A - Application (應用)',
            detail: '緊扣自己的真實生活：今天我在家庭、工作或言行中，具體要落實什麼行動？（避免泛泛而談）'
          },
          {
            name: 'P - Prayer (禱告)',
            detail: '以一段真情流露的短禱作結，求聖靈賜下能力行道，而非單單聽道自欺。'
          }
        ],
        suitableFor: '初信造就、青年團契每日打卡、上班族碎片時間靈修、門徒建立穩定習慣。'
      },
      {
        id: 'method_analogy_of_faith',
        name: '以經解經與信仰類比法 (Scripture Interprets Scripture / Analogy of Faith)',
        tag: '大公信條根基 · 杜絕斷章取義',
        icon: 'fa-link',
        color: '#0d9488',
        summary: '威斯敏斯特信條宣告：「解釋聖經最無謬的規則就是聖經本身」。以明確經文解釋晦澀經文，持守整本聖經和諧救恩真理。',
        coreSteps: [
          {
            name: '1. 清晰經文光照晦澀經文 (The Clear Illuminates the Obscure)',
            detail: '遇到難解經文（如替死人受洗、啟示錄象徵性符號）時，決不可孤立建立教義，而必須以新舊約中數十處反覆清晰宣告的基要真理（如因信稱義、獨一救贖）作為解釋基準。'
          },
          {
            name: '2. 串珠經文連鎖參照 (Treasury of Scripture Knowledge)',
            detail: '善用聖經串珠（Cross-references），追溯字根、引語起源與使徒詮釋，發現整本聖經如何自我註解。'
          },
          {
            name: '3. 受大公信經規範保護 (Regula Fidei / Rule of Faith)',
            detail: '凡是導向否定三位一體、否認基督完全神人二性、否認唯獨恩典救恩的私意解經，皆是異端曲解。'
          }
        ],
        suitableFor: '難題解答、教義查經、破除異端歪理、系統神學架構建立。'
      }
    ],

    // 3. 台灣三大代表性正統神學院深度研究
    taiwanSeminaries: [
      {
        id: 'sem_tgst',
        name: '台灣神學研究學院 (台神 TGST)',
        fullName: 'Taiwan Graduate School of Theology',
        tradition: '長老教會體系 (PCT) · 普世改革宗神學',
        established: '1872 年 (馬偕博士奠基)',
        accentColor: '#059669',
        emblemIcon: 'fa-seedling',
        theologicalHeritage: '承襲蘇格蘭長老會與加爾文改革宗學統，融合台灣本土歷史創傷與普世神學反思。',
        hermeneuticPillars: [
          {
            title: '1. 嚴謹歷史-正典批判與文本分析 (Socio-Historical & Canonical Exegesis)',
            desc: '拒絕去歷史化的空泛教條，深入挖掘古代以色列社會、階級、文化結構與成典過程，還原聖經作者在具體歷史動盪中的吶喊。'
          },
          {
            title: '2. 處境化釋經學 (Contextual Hermeneutics)',
            desc: '將上帝的話與台灣在地的土地認同、原住民族群文化、社會邊緣底層群體、民主轉型與生態公義深刻對話。讀經是「一手拿聖經，一手拿報紙」（卡爾巴特名言），讓聖言切中時代脈搏。'
          },
          {
            title: '3. 聖約神學與先知性公共神學 (Covenant & Public Theology)',
            desc: '強調上帝公義之約要求選民在社會行公義、好憐憫、存謙卑的心與神同行，堅持教會在公共領域中的先知性批判與守望功能。'
          }
        ],
        studyMethodQuote: '「研經不只是個人象牙塔中的心靈滋養，更是上帝的子民在歷史苦難與土地處境中，辨識並參與上帝救贖漫長大工的先知性實踐。」'
      },
      {
        id: 'sem_ces',
        name: '中華福音神學院 (華神 CES)',
        fullName: 'China Evangelical Seminary',
        tradition: '超宗派福音派旗艦 (Evangelical & Reformed)',
        established: '1970 年 (戴紹曾、張明哲等創校)',
        accentColor: '#1d4ed8',
        emblemIcon: 'fa-bible',
        theologicalHeritage: '堅守芝加哥聖經無誤宣言（Chicago Statement on Biblical Inerrancy），培育忠心傳講神話語的華人牧長。',
        hermeneuticPillars: [
          {
            title: '1. 聖經完全無誤與最高權威 (Biblical Inerrancy & Authority)',
            desc: '堅信原稿完全無誤，以敬畏謙卑降服於聖道之下的嚴謹態度解經，視經文為所有信仰生活與教會牧養的最高規範。'
          },
          {
            title: '2. 嚴格希伯來/希臘原文釋經講道 (Original Language Expository Preaching)',
            desc: '華神傳道人必修希伯來文與希臘文，精研原文動詞時態、句法圖解、原文字根語義場，強調講章的主題與論點必須直接從經文原意流淌而出。'
          },
          {
            title: '3. 救贖歷史神學與普世宣教使命 (Redemptive History & Missional Hermeneutics)',
            desc: '以整本聖經救贖大敘事統整新舊約，將經文詮釋直接對準普世跨文化宣教、未得之民開拓與華人教會靈性大復興。'
          }
        ],
        studyMethodQuote: '「按著正意分解真理的道！神的話語是一切力量的源頭；研經者最大的責任，是誠實挖掘原文真義，不折不扣、不偏不倚地傳講基督。」'
      },
      {
        id: 'sem_bol',
        name: '靈糧教牧宣教神學院 (靈神 BOLTS)',
        fullName: 'Bread of Life Theological Seminary',
        tradition: '靈恩-福音派 (Charismatic-Evangelical) · 使徒中心',
        established: '1990 年 (靈糧全球使徒網絡)',
        accentColor: '#b91c1c',
        emblemIcon: 'fa-fire-alt',
        theologicalHeritage: '承接靈糧堂使徒性植堂宣教網絡，融合神的話（Logos）與神的靈（Pneuma），推動天國文化落地。',
        hermeneuticPillars: [
          {
            title: '1. 聖靈與聖道平衡雙翼 (Spirit & Word Equilibrium)',
            desc: '聖經客觀真理（Logos）是不可妥協的基石與軌道，而聖靈（Spirit）是使話語在當下對人心活潑作工的動力。雙翼齊飛，既無偏差靈異，亦無枯燥教條。'
          },
          {
            title: '2. 琴與爐的敬拜默想與禱讀 (Harp & Bowl Pray-Reading & Rhema)',
            desc: '將研經浸泡在敬拜與禱告的氛圍中。透過方言與悟性禱讀經文，敏銳聆聽聖靈在當下賜給信徒的即時話語（Rhema），釋放屬天安慰、醫治與突破。'
          },
          {
            title: '3. 天國文化轉化與屬靈爭戰權柄 (Kingdom Culture & Spiritual Authority)',
            desc: '研經目標不在頭腦邏輯，而在領受屬天權柄、破除仇敵謊言堅固營壘、醫治心靈創傷，並將神的話實踐於家庭祭壇、職場七山與全地植堂宣教。'
          }
        ],
        studyMethodQuote: '「讀經是向那口中吐出兩刃利劍的復活基督敞開全人！讓聖道與聖靈同作奇工，使我們聽見神在今日向教會發出的心跳與號角。」'
      }
    ],

    // 4. 台灣五大教會體系讀經傳統
    denominationalTraditions: [
      {
        id: 'denom_pct',
        name: '長老會體系 (Presbyterian Church in Taiwan)',
        traditionBadge: '百年加爾文改革宗 · 普世聖約傳統',
        coreMovement: '《新眼光讀經運動》(New Vision Bible Reading)',
        icon: 'fa-burning-bush',
        accent: '#059669',
        features: [
          '每日一章深入閱讀，由本土牧長與神學家共同編寫每日研讀指引。',
          '強調立足台灣土地處境，關懷原住民族、勞工弱勢、母語傳承與公共公義。',
          '在團契小組中推動共讀與代禱，落實加爾文「生活即崇拜、世界即修道院」之聖約實踐。'
        ],
        recommendedMethod: '處境化歷史批判 + 聖約群體共讀法'
      },
      {
        id: 'denom_bol',
        name: '靈糧堂體系 (Bread of Life Christian Church)',
        traditionBadge: '靈恩福音派 · 使徒性網絡',
        coreMovement: '《活潑的生命》QT 靈修默想 & 晨禱禱讀運動',
        icon: 'fa-bread-slice',
        accent: '#dc2626',
        features: [
          '長年與韓國推拉奴書房深度合作，全堂推行《活潑的生命》每日經文默想。',
          '清晨全教會晨禱會，集體開口禱讀經文，領受當天神對教會整體與個人的即時 Rhema 恩膏。',
          '在牧養小組中分享 SOAP 筆記與心靈敞開，將神的話化為屬靈爭戰與職場見證的得勝兵器。'
        ],
        recommendedMethod: 'QT 默想法 + 聆聽神聲音的禱讀 (Pray-Reading)'
      },
      {
        id: 'denom_covenant',
        name: '行道會體系 (Covenant / Top Church)',
        traditionBadge: '卓越門徒 · 剛強壯膽的信心實踐',
        coreMovement: '狂熱卓越門徒讀經 · 一年讀經一遍挑戰',
        icon: 'fa-shield-alt',
        accent: '#d97706',
        features: [
          '推動信徒全員挑戰「一年讀經一遍」，建立對全本聖經恢弘敘事的宏觀骨架。',
          '講道信息強調剛強壯膽、熱情燃燒、卓越得勝，將聖經原則直接轉化為職場影響力。',
          '建立家庭祭壇讀經，父母帶領兒女同領聖道，在爭戰中抓緊神的應許宣告突破。'
        ],
        recommendedMethod: '宏觀通讀法 + 信心宣告與生活卓越應用法'
      },
      {
        id: 'denom_baptist',
        name: '浸信會體系 (Taiwan Baptist Convention)',
        traditionBadge: '聖經無誤 · 信徒皆祭司 · 嚴謹字義',
        coreMovement: '歸納法查經 (OIA) & 《每日研經釋義》(SU) 合作',
        icon: 'fa-water',
        accent: '#2563eb',
        features: [
          '堅守聖經完全權威，注重主日學分級系統化經文研讀與逐節釋經講道。',
          '廣泛採用讀經會（Scripture Union）《每日研經釋義》，按部就班在數年內讀遍全本聖經。',
          '崇尚平信徒自發性深入查經，每人一把聖經與串珠筆記，講求字義精準與教義純正。'
        ],
        recommendedMethod: '歸納法查經 (OIA) + 原文逐節釋經對照'
      },
      {
        id: 'denom_holiness',
        name: '聖教會體系 (Taiwan Holiness Church / OMS)',
        traditionBadge: '衛斯理約翰聖潔運動 · 完全成聖',
        coreMovement: '四重福音靈修 · 破曉晨更守望讀經',
        icon: 'fa-sun',
        accent: '#7c3aed',
        features: [
          '傳承遠東宣教會（OMS）與約翰衛斯理聖潔學統，高舉四重福音（重生、成聖、神醫、再臨）。',
          '每日破曉黎明守晨更，以敬虔敬畏的心在經文面前深切痛悔、除滅隱惡。',
          '研經焦點緊扣「完全成聖」（Entire Sanctification）與無可指摘的愛，追求基督化品格塑造。'
        ],
        recommendedMethod: '成聖省思讀經法 + 衛斯理禱讀晨更'
      }
    ],

    // 5. 韓國正統福音教會推薦之讀經法
    koreanTraditions: [
      {
        id: 'kr_onnuri',
        name: '大地教會 (Onnuri Church 온누리교회) & 推拉奴 (Duranno)',
        foundingPastor: '河用祚 牧師 (Rev. Ha Yong-jo)',
        bannerTag: '全球 QT 默想運動與一對一門徒養育發源地',
        accent: '#0284c7',
        icon: 'fa-globe-asia',
        methodology: {
          name: 'QT 默想讀經法 (Quiet Time) & 《活潑的生命》(생명의 삶)',
          steps: [
            '1. 預備的心與求光照禱告：安靜心靈，求聖靈賜下渴慕與領悟真理的智慧。',
            '2. 深度慢讀三遍：第一遍通讀抓大意，第二遍細讀劃關鍵詞，第三遍化為向神的傾聽。',
            '3. 沉思默想 (Meditation)：聚焦神是怎樣的神（神的屬性），並對照自己的罪性、軟弱或缺乏。',
            '4. 具體應用 (Application)：制定當天可在 24 小時內落實的愛心、饒恕、節制或行道計畫。',
            '5. 順服祈求禱告：將應用的決心化為禱告，求神加添順服的心志。'
          ],
          discipleshipTool: '「一對一門徒養育」(One-on-One Discipleship)：以經文為唯一核心，師徒二人面對面每週數小時深入生命交通、背誦經文，建立終生生命傳承。'
        }
      },
      {
        id: 'kr_sarang',
        name: '愛的教會 (Sarang Community Church 사랑의교회)',
        foundingPastor: '玉漢欽 牧師 (Rev. Oak Han-heum)',
        bannerTag: '狂熱門徒訓練研經法 (Discipleship Bible Study / DBS)',
        accent: '#0d9488',
        icon: 'fa-users-cog',
        methodology: {
          name: '門徒訓練歸納研經法 (Discipleship Bible Study)',
          steps: [
            '1. 嚴謹課前獨立預查：學員每週必須花費 4~6 小時獨立查考經文，查閱原文註釋與字義，填寫厚重講義。',
            '2. 經文骨架與神學提煉：透過層層提問，迫使門徒從經文推導出嚴謹神學命題，不容許模糊或浮躁的廉價回答。',
            '3. 靈魂解剖式敞開分享：在門訓小組中，學員將經文當作手術刀，毫無隱藏地承認自己的罪、家庭撕裂與驕傲。',
            '4. 委身基督的平信徒僕人：將平信徒徹底喚醒為「基督的精兵與小牧者」，不再是主日旁觀看戲的平信徒消費者。'
          ]
        }
      },
      {
        id: 'kr_yoido',
        name: '汝矣島純福音教會 (Yoido Full Gospel Church 여의도순복음교회)',
        foundingPastor: '趙鏞基 牧師 (Rev. David Yonggi Cho)',
        bannerTag: '五重福音 · 第四次元靈性研經與信心宣告',
        accent: '#e11d48',
        icon: 'fa-mountain',
        methodology: {
          name: '第四次元靈性經文默想與信心宣告 (Fourth-Dimensional Scripture Meditation)',
          steps: [
            '1. 改變思想 (Thinking)：以聖經話語清洗屬地的消極自卑思想，讓神的意念成為自己的意念。',
            '2. 描繪信心異象 (Vision)：在心靈螢幕中描繪經文應許成全的生動畫卷（如同亞伯拉罕仰望繁星）。',
            '3. 堅定信心 (Faith)：越過看得見的肉體極限，單單抓住神信實的話語，深信「在神凡事都能」。',
            '4. 開口宣告神的話 (Speaking)：以大聲的信心宣告擊碎仇敵的驚恐與疑慮，釋放創造性話語的屬靈權能。'
          ]
        }
      }
    ],

    // 6. 非異端基督教正統研經防偽指針
    orthodoxSafeguards: {
      foundationalCreeds: [
        { name: '使徒信經 (Apostles\' Creed)', core: '大公正統信仰的最簡約骨架：三位一體、基督降生受難復活、聖靈同在與身體復活。' },
        { name: '尼西亞信經 (Nicene Creed, 325/381 AD)', core: '確立基督「與父同質」（Homoousios），徹底擊碎亞流派將基督視為受造物的異端。' },
        { name: '迦克敦信經 (Chalcedonian Definition, 451 AD)', core: '確立基督「完全的神性、完全的人性，不相混亂、不相改變、不能分開、不能離散」。' }
      ],
      reformationSolas: [
        'Sola Scriptura (唯獨聖經)：聖經為信仰與實踐的無上權威，絕無任何教主個人啟示可與之平起平坐。',
        'Sola Gratia (唯獨恩典)：救恩完全出於三一上帝的主權揀選與無條件慈愛。',
        'Sola Fide (唯獨信心)：藉著信心領受基督義袍，不靠人類功德立義。',
        'Solus Christus (唯獨基督)：基督是神與人之間唯一的真正中保與救贖主。',
        'Soli Deo Gloria (唯獨榮耀歸神)：一切創造、救贖與歷史的終極歸向皆為神的榮耀。'
      ],
      cultExposures: [
        {
          name: '新天地耶穌教證據帳幕聖殿 (韓國 李萬熙)',
          dangerLevel: '極危險 · 嚴重破壞家庭',
          heresyModus: '「比喻論」與「暗號解經」：宣稱聖經全本都封印著暗號，將特定詞彙（樹、鳥、種子、碗、新郎、新婦）賦予荒謬固定暗喻；宣稱只有「得勝者總會長李萬熙」擁有啟示錄解密鑰匙。',
          orthodoxRefutation: '彼後 1:20 嚴正宣告：「經上所有的預言沒有可隨己意解說的！」聖經文意應優先按照歷史字義理解，啟示錄的焦點永遠是「被殺又復活的羔羊耶穌基督」，而非任何二十世紀的韓國教主。'
        },
        {
          name: '全能神教會 / 東方閃電 (趙維山 · 楊向彬)',
          dangerLevel: '極危險 · 恐嚇脅迫滲透',
          heresyModus: '「國度時代女基督」：妄稱耶穌在十字架上的救贖「只完成了救贖工作的一半」，在末世上帝以「東方閃電的女性基督肉身」降臨在中國，頒布所謂《話在肉身顯現》，架空聖經正典。',
          orthodoxRefutation: '約翰福音 19:30 耶穌在十架上宣告「成了！」（Tetelestai），救贖代價一次永遠成全！啟示錄 1:7 宣告基督再臨時是「駕雲降臨，眾目要看見祂」，絕非在隱密處降生為另一名罪人。啟示錄 22:18-19 警告在聖經上加添或刪減話語的必受審判。'
        },
        {
          name: '耶和華見證人 (守望台 Watch Tower)',
          dangerLevel: '高危險 · 篡改聖經正文',
          heresyModus: '「否認三位一體與基督神性」：為了否定基督神性，在自家《新世界譯本》（NWT）中刻意將約翰福音 1:1 改成「話語就是一個神（a god）」，將基督降格為受造的天使長米迦勒。',
          orthodoxRefutation: '希臘原文 θεὸς ἦν ὁ λόγος（Theos en ho Logos），Logos 帶定冠詞表示主詞，無定冠詞之 Theos 表明主詞的本質本性（Predicative），清楚宣告基督擁有與父神完全相同無二的神性（同本質）。歌羅西書 2:9 證實「神本性一切的豐盛都有形有體地居住在基督裡面」。'
        },
        {
          name: '基督教福音宣教會 / 攝理教 (韓國 鄭明析 JMS)',
          dangerLevel: '極危險 · 道德敗壞與性侵害',
          heresyModus: '「三十個論比喻論」：將創世記伊甸園善惡果曲解為「夏娃與蛇發生性關係」，並宣稱舊約救靈魂、新約救心靈、主後歷史必須透過教主鄭明析來拯救肉體，假藉宗教聖潔實施性侵害。',
          orthodoxRefutation: '創世記墮落純粹是人違背上帝聖約誡命的叛逆罪性，絕無性關係隱喻。提摩太前書 2:5「因為只有一位神，在神和人中間，只有一位中保，乃是降世為人的基督耶穌！」'
        }
      ],
      threePillars: [
        {
          rule: '第一金科玉律：上下文至上 (Context is King)',
          desc: '絕不孤立拔出單一節句。必須查考其上下文（段落、章、全卷書主題）。正如經典解經箴言：「離開上下文的經文，只不過是異端曲解的藉口（A text without a context is a pretext）。」'
        },
        {
          rule: '第二金科玉律：以經解經 (Scripture Interprets Scripture)',
          desc: '以清晰易明的經文去照亮深奧晦澀的象徵或預言。聖經新舊約全書在聖靈帶領下完美和諧，絕不會在核心救恩真理上自我推翻或自相矛盾。'
        },
        {
          rule: '第三金科玉律：基督救贖中心與大公信經 (Christocentricity & Regula Fidei)',
          desc: '整本聖經都指向耶穌基督並祂釘十字架。所有正統詮釋必須在歷代大公信經所劃定之三位一體、基督神人二性、唯獨恩典之聖道護欄內運行。'
        }
      ]
    },

    // 7. 互動測驗快篩資料
    methodFinderQuiz: {
      questions: [
        {
          id: 'q_role',
          prompt: '1. 您目前的讀經身分或屬靈階段是什麼？',
          options: [
            { label: '初信者 / 想建立規律讀經習慣', val: 'beginner' },
            { label: '職場信徒 / 時間緊湊但渴慕每日得力', val: 'busy' },
            { label: '小組長 / 團契查經帶領者 / 主日學同工', val: 'leader' },
            { label: '渴望深刻安靜心靈、與神親密相交者', val: 'contemplative' },
            { label: '神學生 / 傳道人 / 渴望深入原文與神學骨架者', val: 'academic' }
          ]
        },
        {
          id: 'q_time',
          prompt: '2. 您每天平均可投入的安靜研經時間？',
          options: [
            { label: '10 ~ 15 分鐘（碎片化晨更或通勤）', val: 'short' },
            { label: '20 ~ 30 分鐘（規律靈修時間）', val: 'medium' },
            { label: '45 分鐘以上（可深度查考筆記）', val: 'long' }
          ]
        },
        {
          id: 'q_goal',
          prompt: '3. 本次研經的最核心目標是什麼？',
          options: [
            { label: '得著當天指引、認罪、悔改與具體行道', val: 'action' },
            { label: '安歇在神懷中、聆聽聖靈微小的聲音', val: 'communion' },
            { label: '客觀釐清經文原意、上下文結構與神學真理', val: 'exegetical' },
            { label: '重返救贖歷史現場、突破律法自義、看見基督恩典', val: 'redemptive' }
          ]
        }
      ]
    }
  };

  // Helper function for HTML escaping
  function escapeHtml(str) {
    if (str == null) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // 頂層全覽 HTML 生成器
  function renderHermeneuticsGuideHtml(options) {
    options = options || {};
    var activeSubTab = options.subTab || 'fourfold';
    var data = HERMENEUTICS_DATA;

    var html = '<div class="herm-guide-container" id="hermGuideContainer">';

    // 1. Hero Header
    html += '<div class="herm-hero-header">';
    html += '  <div class="herm-hero-badge"><i class="fas fa-compass"></i> 正統聖經詮釋學旗艦專區</div>';
    html += '  <h2 class="herm-hero-title">🧭 ' + escapeHtml(data.meta.title) + '</h2>';
    html += '  <p class="herm-hero-subtitle">' + escapeHtml(data.meta.subtitle) + '</p>';
    html += '  <div class="herm-hero-actions">';
    html += '    <a href="' + escapeHtml(data.meta.campusVideoUrl) + '" target="_blank" rel="noopener noreferrer" class="herm-btn-ext"><i class="fas fa-video"></i> 📺 校園書房專題影音 VID=73：莊信德牧師《重返聖經現場：四重時間的聖經詮釋學》 ↗</a>';
    html += '    <a href="#ref/book_study/1" class="herm-btn-books"><i class="fas fa-th-large"></i> 查閱 66 卷書專屬四重時間導讀 ➔</a>';
    html += '  </div>';
    html += '</div>';

    // 2. Navigation Pills
    html += '<div class="herm-nav-pills" id="hermNavPills">';
    html += '  <button type="button" class="herm-pill ' + (activeSubTab === 'fourfold' ? 'active' : '') + '" data-tab="fourfold"><i class="fas fa-hourglass-half"></i> ⏳ 四重時間詮釋學 (校園 VID=73)</button>';
    html += '  <button type="button" class="herm-pill ' + (activeSubTab === 'mainstream' ? 'active' : '') + '" data-tab="mainstream"><i class="fas fa-book-open"></i> 📚 普世主流研經法 (OIA · 歷史文法 · 救贖)</button>';
    html += '  <button type="button" class="herm-pill ' + (activeSubTab === 'seminaries' ? 'active' : '') + '" data-tab="seminaries"><i class="fas fa-university"></i> 🏛️ 台灣三大神學院與宗派透鏡</button>';
    html += '  <button type="button" class="herm-pill ' + (activeSubTab === 'korean' ? 'active' : '') + '" data-tab="korean"><i class="fas fa-globe-asia"></i> 🇰🇷 韓國正統福音教會讀經法</button>';
    html += '  <button type="button" class="herm-pill ' + (activeSubTab === 'safeguards' ? 'active' : '') + '" data-tab="safeguards"><i class="fas fa-shield-alt"></i> 🛡️ 非異端防偽指針</button>';
    html += '  <button type="button" class="herm-pill ' + (activeSubTab === 'workbench' ? 'active' : '') + '" data-tab="workbench"><i class="fas fa-tools"></i> 🛠️ 研經實踐互動工坊 (快篩 & 產生器)</button>';
    html += '</div>';

    // 3. Tab Content Panels
    html += '<div class="herm-tab-panels">';

    // ===== TAB 1: 四重時間詮釋學 =====
    html += '<div class="herm-panel ' + (activeSubTab === 'fourfold' ? 'active' : '') + '" id="hermPanel_fourfold">';
    html += '  <div class="herm-section-intro-card fourfold-theme">';
    html += '    <div class="intro-card-head">';
    html += '      <span class="intro-badge"><i class="fas fa-star"></i> 校園書房影音權威專題 · VID=73</span>';
    html += '      <span class="intro-author">講員：' + escapeHtml(data.fourfoldTimeTheory.author) + '（' + escapeHtml(data.fourfoldTimeTheory.authorTitle) + '）</span>';
    html += '    </div>';
    html += '    <h3 class="intro-title">《' + escapeHtml(data.fourfoldTimeTheory.bookTitle) + '》核心精義</h3>';
    html += '    <div class="intro-premise-banner"><i class="fas fa-quote-left"></i> ' + escapeHtml(data.fourfoldTimeTheory.corePremise) + '</div>';
    html += '    <p class="intro-desc" style="white-space: pre-line;">' + escapeHtml(data.fourfoldTimeTheory.critiqueProblem) + '</p>';
    html += '  </div>';

    // 4 Dimensions Cards
    html += '  <h3 class="herm-group-title"><i class="fas fa-layer-group"></i> 四重時間神學架構立體解剖</h3>';
    html += '  <div class="fourfold-dims-grid">';
    data.fourfoldTimeTheory.dimensions.forEach(function (dim) {
      html += '    <div class="dim-card" style="--dim-accent: ' + dim.color + ';">';
      html += '      <div class="dim-card-header">';
      html += '        <span class="dim-badge"><i class="fas ' + dim.icon + '"></i> ' + escapeHtml(dim.badge) + '</span>';
      html += '        <span class="dim-trinity">' + escapeHtml(dim.trinityPerson) + '</span>';
      html += '      </div>';
      html += '      <h4 class="dim-title">' + escapeHtml(dim.name) + '</h4>';
      html += '      <div class="dim-definition"><strong>💡 核心定義：</strong>' + escapeHtml(dim.definition) + '</div>';
      html += '      <div class="dim-theology"><strong>⚓ 神學基石：</strong>' + escapeHtml(dim.theologyAnchor) + '</div>';
      html += '      <div class="dim-method"><strong>🔍 釋經方法：</strong>' + escapeHtml(dim.hermeneuticMethod) + '</div>';
      html += '      <div class="dim-prompt"><i class="fas fa-question-circle"></i> <strong>現場默想提問：</strong>' + escapeHtml(dim.exercisePrompt) + '</div>';
      html += '    </div>';
    });
    html += '  </div>';

    // Interactive Cases
    html += '  <h3 class="herm-group-title" style="margin-top:2.5rem;"><i class="fas fa-vial"></i> 四重時間經典經文動態解析演練</h3>';
    html += '  <div class="fourfold-case-selector" id="fourfoldCaseSelector">';
    data.fourfoldTimeTheory.interactiveCases.forEach(function (c, idx) {
      html += '    <button type="button" class="case-btn ' + (idx === 0 ? 'active' : '') + '" data-caseid="' + c.id + '">' + escapeHtml(c.title) + '</button>';
    });
    html += '  </div>';

    html += '  <div class="fourfold-cases-container" id="fourfoldCasesContainer">';
    data.fourfoldTimeTheory.interactiveCases.forEach(function (c, idx) {
      html += '    <div class="case-display-card ' + (idx === 0 ? 'active' : '') + '" id="caseCard_' + c.id + '">';
      html += '      <div class="case-card-top">';
      html += '        <h4 class="case-title">' + escapeHtml(c.title) + '</h4>';
      html += '        <div class="case-verse"><i class="fas fa-bookmark"></i> ' + escapeHtml(c.keyVerse) + '</div>';
      html += '      </div>';
      html += '      <div class="case-times-row">';
      html += '        <div class="case-time-item t1">';
      html += '          <div class="ct-label"><span class="ct-num">1</span> 第一時間 · 歷史救贖現場</div>';
      html += '          <p class="ct-text">' + escapeHtml(c.t1) + '</p>';
      html += '        </div>';
      html += '        <div class="case-time-item t2">';
      html += '          <div class="ct-label"><span class="ct-num">2</span> 第二時間 · 正典默示成書</div>';
      html += '          <p class="ct-text">' + escapeHtml(c.t2) + '</p>';
      html += '        </div>';
      html += '        <div class="case-time-item t3">';
      html += '          <div class="ct-label"><span class="ct-num">3</span> 第三時間 · 基督正典互文應驗</div>';
      html += '          <p class="ct-text">' + escapeHtml(c.t3) + '</p>';
      html += '        </div>';
      html += '        <div class="case-time-item t4">';
      html += '          <div class="ct-label"><span class="ct-num">4</span> 第四時間 · 聖靈在今日對我說話</div>';
      html += '          <p class="ct-text">' + escapeHtml(c.t4) + '</p>';
      html += '        </div>';
      html += '      </div>';
      html += '    </div>';
    });
    html += '  </div>';

    // Link to 66 book guide
    html += '  <div class="herm-banner-callout">';
    html += '    <div class="callout-icon">📖</div>';
    html += '    <div class="callout-body">';
    html += '      <h4>Biblia 已將「四重時間詮釋」全面注流於 66 卷書深度導讀！</h4>';
    html += '      <p>每一卷書皆量身打造第一時間現場錨點、成典歷史處境、基督救贖樞紐與今日台灣處境默想。立即前往任一卷書導讀探索！</p>';
    html += '    </div>';
    html += '    <a href="#ref/book_study/1" class="callout-btn">開啟創世記導讀 ➔</a>';
    html += '  </div>';
    html += '</div>';

    // ===== TAB 2: 主流研經法總覽 =====
    html += '<div class="herm-panel ' + (activeSubTab === 'mainstream' ? 'active' : '') + '" id="hermPanel_mainstream">';
    html += '  <h3 class="herm-group-title"><i class="fas fa-graduation-cap"></i> 普世正統福音派主流研經法體系</h3>';
    html += '  <div class="methods-grid">';
    data.mainstreamMethods.forEach(function (m) {
      html += '    <div class="method-card" style="--m-accent: ' + m.color + ';">';
      html += '      <div class="m-card-header">';
      html += '        <span class="m-tag"><i class="fas ' + m.icon + '"></i> ' + escapeHtml(m.tag) + '</span>';
      html += '      </div>';
      html += '      <h4 class="m-title">' + escapeHtml(m.name) + '</h4>';
      html += '      <p class="m-summary">' + escapeHtml(m.summary) + '</p>';
      html += '      <div class="m-steps-list">';
      m.coreSteps.forEach(function (st) {
        html += '        <div class="m-step-item">';
        html += '          <div class="m-step-name">' + escapeHtml(st.name) + '</div>';
        html += '          <div class="m-step-detail" style="white-space: pre-line;">' + escapeHtml(st.detail) + '</div>';
        html += '        </div>';
      });
      html += '      </div>';
      html += '      <div class="m-suitable"><i class="fas fa-check-circle"></i> <strong>最佳適用情境：</strong>' + escapeHtml(m.suitableFor) + '</div>';
      html += '    </div>';
    });
    html += '  </div>';
    html += '</div>';

    // ===== TAB 3: 台灣三大神學院與宗派透鏡 =====
    html += '<div class="herm-panel ' + (activeSubTab === 'seminaries' ? 'active' : '') + '" id="hermPanel_seminaries">';
    html += '  <h3 class="herm-group-title"><i class="fas fa-university"></i> 台灣三大正統神學院研經特色深度對比</h3>';
    html += '  <div class="seminaries-grid">';
    data.taiwanSeminaries.forEach(function (sem) {
      html += '    <div class="seminary-card" style="--sem-accent: ' + sem.accentColor + ';">';
      html += '      <div class="sem-header">';
      html += '        <div class="sem-emblem"><i class="fas ' + sem.emblemIcon + '"></i></div>';
      html += '        <div class="sem-header-text">';
      html += '          <h4 class="sem-name">' + escapeHtml(sem.name) + '</h4>';
      html += '          <span class="sem-tradition">' + escapeHtml(sem.tradition) + ' · 創立於 ' + escapeHtml(sem.established) + '</span>';
      html += '        </div>';
      html += '      </div>';
      html += '      <div class="sem-heritage"><strong>🏛️ 神學學統：</strong>' + escapeHtml(sem.theologicalHeritage) + '</div>';
      html += '      <div class="sem-pillars">';
      sem.hermeneuticPillars.forEach(function (p) {
        html += '        <div class="sem-pillar-item">';
        html += '          <div class="pillar-title">' + escapeHtml(p.title) + '</div>';
        html += '          <div class="pillar-desc">' + escapeHtml(p.desc) + '</div>';
        html += '        </div>';
      });
      html += '      </div>';
      html += '      <div class="sem-quote"><i class="fas fa-quote-left"></i> ' + escapeHtml(sem.studyMethodQuote) + '</div>';
      html += '    </div>';
    });
    html += '  </div>';

    html += '  <h3 class="herm-group-title" style="margin-top:3rem;"><i class="fas fa-place-of-worship"></i> 台灣五大正統教會體系之讀經運動傳統</h3>';
    html += '  <div class="denoms-grid">';
    data.denominationalTraditions.forEach(function (d) {
      html += '    <div class="denom-card" style="--d-accent: ' + d.accent + ';">';
      html += '      <div class="d-header">';
      html += '        <span class="d-badge"><i class="fas ' + d.icon + '"></i> ' + escapeHtml(d.traditionBadge) + '</span>';
      html += '        <h4 class="d-name">' + escapeHtml(d.name) + '</h4>';
      html += '        <div class="d-movement"><i class="fas fa-fire"></i> 核心讀經運動：<strong>' + escapeHtml(d.coreMovement) + '</strong></div>';
      html += '      </div>';
      html += '      <ul class="d-features">';
      d.features.forEach(function (f) {
        html += '        <li><i class="fas fa-check"></i> ' + escapeHtml(f) + '</li>';
      });
      html += '      </ul>';
      html += '      <div class="d-method"><strong>🌟 推薦特色研經法：</strong>' + escapeHtml(d.recommendedMethod) + '</div>';
      html += '    </div>';
    });
    html += '  </div>';
    html += '</div>';

    // ===== TAB 4: 韓國正統福音教會讀經法 =====
    html += '<div class="herm-panel ' + (activeSubTab === 'korean' ? 'active' : '') + '" id="hermPanel_korean">';
    html += '  <div class="korean-hero-box">';
    html += '    <h3><i class="fas fa-globe-asia"></i> 韓國正統巨型福音教會之讀經與門訓體系</h3>';
    html += '    <p>二十世紀下半葉韓國教會經歷了舉世矚目的靈性大復興，其背後最關鍵的動力就是「全民化 QT 默想運動」與「狂熱門徒訓練研經」。神的話語不再是神職人員的專利，而是平信徒生活每日呼吸的氧氣。</p>';
    html += '  </div>';

    html += '  <div class="korean-grid">';
    data.koreanTraditions.forEach(function (kr) {
      html += '    <div class="kr-card" style="--kr-accent: ' + kr.accent + ';">';
      html += '      <div class="kr-card-head">';
      html += '        <span class="kr-badge"><i class="fas ' + kr.icon + '"></i> ' + escapeHtml(kr.bannerTag) + '</span>';
      html += '        <h4 class="kr-title">' + escapeHtml(kr.name) + '</h4>';
      html += '        <span class="kr-pastor">創會牧師：' + escapeHtml(kr.foundingPastor) + '</span>';
      html += '      </div>';
      html += '      <div class="kr-method-box">';
      html += '        <div class="kr-method-title"><i class="fas fa-scroll"></i> ' + escapeHtml(kr.methodology.name) + '</div>';
      html += '        <div class="kr-steps">';
      kr.methodology.steps.forEach(function (st) {
        html += '          <div class="kr-step-row">' + escapeHtml(st) + '</div>';
      });
      html += '        </div>';
      if (kr.methodology.discipleshipTool) {
        html += '        <div class="kr-discipleship-tool"><strong>🤝 門徒培育重器：</strong>' + escapeHtml(kr.methodology.discipleshipTool) + '</div>';
      }
      html += '      </div>';
      html += '    </div>';
    });
    html += '  </div>';
    html += '</div>';

    // ===== TAB 5: 非異端防偽指針 =====
    html += '<div class="herm-panel ' + (activeSubTab === 'safeguards' ? 'active' : '') + '" id="hermPanel_safeguards">';
    html += '  <div class="safeguards-hero-box">';
    html += '    <h3><i class="fas fa-shield-virus"></i> 非異端基督教正統研經防偽指針</h3>';
    html += '    <p>提摩太後書 4:3 警告：「因為時候要到，人必厭煩純正的道理，耳朵發癢，就隨從自己的情慾，增添好些師傅。」正統研經必須在歷史大公信經與正統救贖真理的護欄之內！</p>';
    html += '  </div>';

    // Pillars
    html += '  <h3 class="herm-group-title"><i class="fas fa-monument"></i> 正統研經三大金科玉律 (Three Pillars)</h3>';
    html += '  <div class="three-pillars-grid">';
    data.orthodoxSafeguards.threePillars.forEach(function (p) {
      html += '    <div class="pillar-card">';
      html += '      <div class="pillar-head"><i class="fas fa-gem"></i> ' + escapeHtml(p.rule) + '</div>';
      html += '      <p class="pillar-text">' + escapeHtml(p.desc) + '</p>';
      html += '    </div>';
    });
    html += '  </div>';

    // Creeds & Solas
    html += '  <div class="creeds-solas-row">';
    html += '    <div class="creeds-card">';
    html += '      <h4><i class="fas fa-scroll"></i> 大公正統三大信經基石</h4>';
    data.orthodoxSafeguards.foundationalCreeds.forEach(function (c) {
      html += '      <div class="creed-item">';
      html += '        <strong>' + escapeHtml(c.name) + '：</strong>' + escapeHtml(c.core);
      html += '      </div>';
    });
    html += '    </div>';

    html += '    <div class="solas-card">';
    html += '      <h4><i class="fas fa-feather"></i> 改教家五大唯獨 (Five Solas)</h4>';
    html += '      <ul>';
    data.orthodoxSafeguards.reformationSolas.forEach(function (s) {
      html += '        <li>' + escapeHtml(s) + '</li>';
    });
    html += '      </ul>';
    html += '    </div>';
    html += '  </div>';

    // Cult breakdown
    html += '  <h3 class="herm-group-title" style="margin-top:2.5rem;"><i class="fas fa-exclamation-triangle"></i> 四大活躍異端解經手法解密與正統經文反駁</h3>';
    html += '  <div class="cults-grid">';
    data.orthodoxSafeguards.cultExposures.forEach(function (cult) {
      html += '    <div class="cult-card">';
      html += '      <div class="cult-header">';
      html += '        <h4 class="cult-name">' + escapeHtml(cult.name) + '</h4>';
      html += '        <span class="cult-danger-badge"><i class="fas fa-skull"></i> ' + escapeHtml(cult.dangerLevel) + '</span>';
      html += '      </div>';
      html += '      <div class="cult-modus"><strong>⚠️ 異端曲解手法：</strong>' + escapeHtml(cult.heresyModus) + '</div>';
      html += '      <div class="cult-refutation"><strong>🛡️ 正統經文破斥：</strong>' + escapeHtml(cult.orthodoxRefutation) + '</div>';
      html += '    </div>';
    });
    html += '  </div>';
    html += '</div>';

    // ===== TAB 6: 研經實踐互動工坊 =====
    html += '<div class="herm-panel ' + (activeSubTab === 'workbench' ? 'active' : '') + '" id="hermPanel_workbench">';
    html += '  <div class="workbench-sub-tabs" id="wbSubTabs">';
    html += '    <button type="button" class="wb-tab-btn active" data-wbtab="finder"><i class="fas fa-stethoscope"></i> 1. 研經法智能快篩測驗</button>';
    html += '    <button type="button" class="wb-tab-btn" data-wbtab="soap_gen"><i class="fas fa-pen-nib"></i> 2. SOAP / OIA 研經筆記產生器</button>';
    html += '  </div>';

    // 1. Finder Quiz
    html += '  <div class="wb-pane active" id="wbPane_finder">';
    html += '    <div class="quiz-container">';
    html += '      <div class="quiz-head">';
    html += '        <h4><i class="fas fa-question-circle"></i> 3 題智能快篩：為您診斷當下最合適的研經法</h4>';
    html += '        <p>根據您目前的屬靈階段、可用時間與讀經目標，智能適配最蒙福的研經節奏。</p>';
    html += '      </div>';

    data.methodFinderQuiz.questions.forEach(function (q) {
      html += '      <div class="quiz-question-card" data-qid="' + q.id + '">';
      html += '        <div class="q-prompt">' + escapeHtml(q.prompt) + '</div>';
      html += '        <div class="q-options-grid">';
      q.options.forEach(function (opt, oIdx) {
        html += '          <label class="q-option-label">';
        html += '            <input type="radio" name="' + q.id + '" value="' + opt.val + '" ' + (oIdx === 0 ? 'checked' : '') + '>';
        html += '            <span class="q-opt-text">' + escapeHtml(opt.label) + '</span>';
        html += '          </label>';
      });
      html += '        </div>';
      html += '      </div>';
    });

    html += '      <div class="quiz-action-bar">';
    html += '        <button type="button" class="quiz-diagnose-btn" id="quizDiagnoseBtn"><i class="fas fa-magic"></i> 立即運算推薦研經法</button>';
    html += '      </div>';

    html += '      <div class="quiz-result-box" id="quizResultBox" style="display:none;"></div>';
    html += '    </div>';
    html += '  </div>';

    // 2. SOAP / OIA Generator
    html += '  <div class="wb-pane" id="wbPane_soap_gen">';
    html += '    <div class="note-gen-container">';
    html += '      <div class="note-gen-head">';
    html += '        <h4><i class="fas fa-edit"></i> 互動式靈修研經筆記工坊</h4>';
    html += '        <p>一鍵生成排版端莊之研經筆記卡片，支援複製為 Markdown 格式以便存入個人筆記軟體或小組分享。</p>';
    html += '      </div>';

    html += '      <div class="note-mode-selector">';
    html += '        <label class="note-mode-pill active"><input type="radio" name="noteMode" value="SOAP" checked> 📝 SOAP 每日靈修筆記模式 (Scripture, Observation, Application, Prayer)</label>';
    html += '        <label class="note-mode-pill"><input type="radio" name="noteMode" value="OIA"> 🔍 OIA 歸納法查經模式 (Observation, Interpretation, Application)</label>';
    html += '      </div>';

    html += '      <div class="note-form-grid">';
    html += '        <div class="note-field-row">';
    html += '          <label>經文出處 (Verse Ref)：</label>';
    html += '          <input type="text" id="noteRefInput" class="note-input" placeholder="例如：詩篇 23:1-6 或 約翰福音 15:1-8" value="詩篇 23:1-3">';
    html += '        </div>';
    html += '        <div class="note-field-row">';
    html += '          <label>經文內容 (Scripture Text)：</label>';
    html += '          <textarea id="noteTextInput" class="note-textarea" rows="3" placeholder="抄寫或貼上今日經文...">耶和華是我的牧者，我必不致缺乏。祂使我躺臥在青草地上，領我在可安歇的水邊。祂使我的靈魂甦醒，為自己的名引導我走義路。</textarea>';
    html += '        </div>';

    html += '        <div class="note-dynamic-fields" id="noteDynamicFields">';
    // Default SOAP fields
    html += '          <div class="note-field-row">';
    html += '            <label id="lblField1">【O - Observation 觀察】經文中我看見了什麼屬靈事實或神的屬性？</label>';
    html += '            <textarea id="noteObsInput" class="note-textarea" rows="3" placeholder="記錄人事物時地、神的主動作為、對比與重複字句...">1. 上帝主動扮演牧羊人的角色，供應我一切所需。\\n2. 靈魂的甦醒源於上帝為祂自己的榮耀聖名所施行的引導。</textarea>';
    html += '          </div>';
    html += '          <div class="note-field-row" id="rowFieldInterp" style="display:none;">';
    html += '            <label id="lblFieldInterp">【I - Interpretation 解釋】這段經文對原作者與原讀者意味著什麼？</label>';
    html += '            <textarea id="noteInterpInput" class="note-textarea" rows="3" placeholder="字義、背景、救贖歷史與基督應驗..."></textarea>';
    html += '          </div>';
    html += '          <div class="note-field-row">';
    html += '            <label id="lblField2">【A - Application 應用】今天我如何在生活/家庭/工作中具體順服？</label>';
    html += '            <textarea id="noteAppInput" class="note-textarea" rows="3" placeholder="具體可行的悔改或行動... (SPACE 檢驗)">今天放下對職場企劃案的焦慮掌控，在中午花 10 分鐘安靜向好牧人交託重擔。</textarea>';
    html += '          </div>';
    html += '          <div class="note-field-row" id="rowFieldPrayer">';
    html += '            <label id="lblField3">【P - Prayer 禱告】向三一上帝獻上的真誠禱詞：</label>';
    html += '            <textarea id="notePrayerInput" class="note-textarea" rows="3" placeholder="將所默想的真理化作禱告...">親愛的主耶穌，祢是我生命的好牧人。赦免我常依靠自己而焦慮缺乏，求祢今天引導我的腳步走在義路中。阿們！</textarea>';
    html += '          </div>';
    html += '        </div>';

    html += '        <div class="note-actions">';
    html += '          <button type="button" class="note-btn-generate" id="noteGenerateBtn"><i class="fas fa-file-signature"></i> 產生美化筆記卡片</button>';
    html += '          <button type="button" class="note-btn-copy" id="noteCopyBtn"><i class="fas fa-copy"></i> 複製 Markdown 格式</button>';
    html += '        </div>';

    html += '        <div class="note-preview-box" id="notePreviewBox" style="display:none;"></div>';
    html += '      </div>';
    html += '    </div>';
    html += '  </div>';

    html += '</div>'; // End Tab 6

    html += '</div>'; // End herm-tab-panels
    html += '</div>'; // End herm-guide-container

    return html;
  }

  // 互動事件綁定引擎
  function initHermeneuticsInteractions(container) {
    if (!container) return;

    // 1. 頂部主要分頁標籤切換 (SubTab switching)
    var navPills = container.querySelectorAll('.herm-pill');
    var panels = container.querySelectorAll('.herm-panel');
    navPills.forEach(function (pill) {
      pill.addEventListener('click', function () {
        var targetTab = pill.getAttribute('data-tab');
        navPills.forEach(function (p) { p.classList.toggle('active', p === pill); });
        panels.forEach(function (pan) {
          pan.classList.toggle('active', pan.id === 'hermPanel_' + targetTab);
        });
      });
    });

    // 2. 四重時間案例切換 (Case switching in Tab 1)
    var caseBtns = container.querySelectorAll('.case-btn');
    caseBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var caseId = btn.getAttribute('data-caseid');
        caseBtns.forEach(function (b) { b.classList.toggle('active', b === btn); });
        var targetCard = container.querySelector('#caseCard_' + caseId);
        container.querySelectorAll('.case-display-card').forEach(function (c) {
          c.classList.remove('active');
        });
        if (targetCard) targetCard.classList.add('active');
      });
    });

    // 3. 工坊內部子頁面切換 (Workbench sub-pane switching)
    var wbBtns = container.querySelectorAll('.wb-tab-btn');
    var wbPanes = container.querySelectorAll('.wb-pane');
    wbBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var targetPane = btn.getAttribute('data-wbtab');
        wbBtns.forEach(function (b) { b.classList.toggle('active', b === btn); });
        wbPanes.forEach(function (p) {
          p.classList.toggle('active', p.id === 'wbPane_' + targetPane);
        });
      });
    });

    // 4. 研經法智能快篩測驗運算 (Quiz Diagnosis)
    var diagBtn = container.querySelector('#quizDiagnoseBtn');
    if (diagBtn) {
      diagBtn.addEventListener('click', function () {
        var roleEl = container.querySelector('input[name="q_role"]:checked');
        var timeEl = container.querySelector('input[name="q_time"]:checked');
        var goalEl = container.querySelector('input[name="q_goal"]:checked');

        var role = roleEl ? roleEl.value : 'busy';
        var time = timeEl ? timeEl.value : 'medium';
        var goal = goalEl ? goalEl.value : 'action';

        var resultTitle = '';
        var resultMethod = '';
        var resultIcon = '';
        var resultColor = '';
        var resultFlow = '';
        var resultDesc = '';

        if (role === 'academic' || goal === 'exegetical') {
          resultTitle = '推薦方案：歷史-文法-字義解經法 + 原文 Strong 逐字對照';
          resultMethod = 'Historical-Grammatical Hermeneutics';
          resultIcon = 'fa-book-reader';
          resultColor = '#4f46e5';
          resultFlow = '1. 閱讀原文/和合本/KJV 對照 ➔ 2. 勾勒原文句法時態圖 ➔ 3. 查考古代歷史文化背景 ➔ 4. 提煉作者原意神學命題';
          resultDesc = '適合追求精確文本真理、講道預備與神學深造。建議搭配 Biblia「原文 Strong 膠囊標籤」與「多版本對照」工具使用。';
        } else if (goal === 'communion' || role === 'contemplative') {
          resultTitle = '推薦方案：聖言誦讀與靈修默想法 (Lectio Divina)';
          resultMethod = 'Lectio Divina & Prayerful Meditation';
          resultIcon = 'fa-pray';
          resultColor = '#0891b2';
          resultFlow = '1. 慢讀數遍 (Lectio) ➔ 2. 咀嚼發光字句 (Meditatio) ➔ 3. 傾心吐意祈求 (Oratio) ➔ 4. 安歇降服於神 (Contemplatio)';
          resultDesc = '適合渴望卸下頭腦疲憊、單單浸泡在三一上帝溫柔聖愛同在中的讀者。';
        } else if (goal === 'redemptive') {
          resultTitle = '推薦方案：莊信德《四重時間釋經法》+ 救贖歷史中心法';
          resultMethod = 'Fourfold Time & Christocentric Hermeneutics';
          resultIcon = 'fa-hourglass-half';
          resultColor = '#d97706';
          resultFlow = '1. 重返第一時間歷史現場 ➔ 2. 體察第二時間正典默示處境 ➔ 3. 仰望第三時間基督十字架成全 ➔ 4. 順服第四時間聖靈對我說話';
          resultDesc = '打破道德主義律法說教，看見整本聖經在基督裡的終極拯救，將詮釋主權交還給正在說話的三一上帝！';
        } else if (time === 'short' || role === 'beginner' || role === 'busy') {
          resultTitle = '推薦方案：SOAP 每日靈修筆記法 / 韓國大地教會 QT 默想法';
          resultMethod = 'SOAP Devotional Method / Living Life QT';
          resultIcon = 'fa-pencil-alt';
          resultColor = '#ea580c';
          resultFlow = 'S 抄寫經文 (Scripture) ➔ O 記錄觀察 (Observation) ➔ A 具體應用 (Application) ➔ P 順服禱告 (Prayer)';
          resultDesc = '適合每日生活節奏緊湊的信徒，在 15~20 分鐘內建立穩定靈修架構，帶出今日可落實的行道見證。';
        } else {
          resultTitle = '推薦方案：經典歸納法研經 (Inductive Bible Study - OIA 法)';
          resultMethod = 'Inductive Bible Study (Observation, Interpretation, Application)';
          resultIcon = 'fa-search-plus';
          resultColor = '#2563eb';
          resultFlow = '1. 細緻觀察經文人事物 (Observation) ➔ 2. 探究原意上下文 (Interpretation) ➔ 3. SPACE 生活應用 (Application)';
          resultDesc = '歷久彌新的福音派正統研經基石，最適合小組查經、個人深度研讀與門徒真理扎根。';
        }

        var resBox = container.querySelector('#quizResultBox');
        if (resBox) {
          resBox.style.display = 'block';
          resBox.innerHTML = '<div class="diag-card" style="--diag-color:' + resultColor + ';">' +
            '<div class="diag-head"><i class="fas ' + resultIcon + '"></i> <strong>診斷結果：</strong>' + escapeHtml(resultTitle) + '</div>' +
            '<div class="diag-method-en">' + escapeHtml(resultMethod) + '</div>' +
            '<div class="diag-flow"><strong>🚀 建議每日實踐流程：</strong><br>' + escapeHtml(resultFlow) + '</div>' +
            '<p class="diag-desc">' + escapeHtml(resultDesc) + '</p>' +
            '<div class="diag-actions">' +
              '<button type="button" class="diag-action-btn" id="diagGoSoapBtn"><i class="fas fa-edit"></i> 前往產生器開始填寫筆記 ➔</button>' +
            '</div>' +
          '</div>';

          var goSoap = resBox.querySelector('#diagGoSoapBtn');
          if (goSoap) {
            goSoap.addEventListener('click', function () {
              var btnGen = container.querySelector('.wb-tab-btn[data-wbtab="soap_gen"]');
              if (btnGen) btnGen.click();
            });
          }
        }
      });
    }

    // 5. SOAP / OIA 模式切換與筆記生成
    var noteRadios = container.querySelectorAll('input[name="noteMode"]');
    var rowInterp = container.querySelector('#rowFieldInterp');
    var rowPrayer = container.querySelector('#rowFieldPrayer');
    var lblField1 = container.querySelector('#lblField1');
    var lblField2 = container.querySelector('#lblField2');

    noteRadios.forEach(function (radio) {
      radio.addEventListener('change', function () {
        var isOIA = (radio.value === 'OIA');
        container.querySelectorAll('.note-mode-pill').forEach(function (p) {
          p.classList.toggle('active', p.querySelector('input').checked);
        });
        if (isOIA) {
          if (rowInterp) rowInterp.style.display = 'block';
          if (rowPrayer) rowPrayer.style.display = 'none';
          if (lblField1) lblField1.textContent = '【O - Observation 觀察】經文說了什麼？(5W1H、連接詞、重複詞、文體結構)';
          if (lblField2) lblField2.textContent = '【A - Application 應用】經文對今日的我意味著什麼？(SPACE 檢驗法則)';
        } else {
          if (rowInterp) rowInterp.style.display = 'none';
          if (rowPrayer) rowPrayer.style.display = 'block';
          if (lblField1) lblField1.textContent = '【O - Observation 觀察】經文中我看見了什麼屬靈事實或神的屬性？';
          if (lblField2) lblField2.textContent = '【A - Application 應用】今天我如何在生活/家庭/工作中具體順服？';
        }
      });
    });

    var noteGenBtn = container.querySelector('#noteGenerateBtn');
    var noteCopyBtn = container.querySelector('#noteCopyBtn');
    var previewBox = container.querySelector('#notePreviewBox');

    function getNoteData() {
      var modeRadio = container.querySelector('input[name="noteMode"]:checked');
      var mode = modeRadio ? modeRadio.value : 'SOAP';
      var ref = (container.querySelector('#noteRefInput') || {}).value || '';
      var text = (container.querySelector('#noteTextInput') || {}).value || '';
      var obs = (container.querySelector('#noteObsInput') || {}).value || '';
      var interp = (container.querySelector('#noteInterpInput') || {}).value || '';
      var app = (container.querySelector('#noteAppInput') || {}).value || '';
      var prayer = (container.querySelector('#notePrayerInput') || {}).value || '';
      return { mode: mode, ref: ref, text: text, obs: obs, interp: interp, app: app, prayer: prayer };
    }

    if (noteGenBtn && previewBox) {
      noteGenBtn.addEventListener('click', function () {
        var d = getNoteData();
        var dateStr = new Date().toLocaleDateString();

        var cardHtml = '<div class="generated-note-card">' +
          '<div class="gn-head">' +
            '<span class="gn-badge"><i class="fas fa-feather"></i> Biblia ' + d.mode + ' 研經靈修筆記</span>' +
            '<span class="gn-date">' + dateStr + '</span>' +
          '</div>' +
          '<h3 class="gn-ref">📖 ' + escapeHtml(d.ref) + '</h3>' +
          '<blockquote class="gn-scripture">' + escapeHtml(d.text) + '</blockquote>' +
          '<div class="gn-section">' +
            '<h4><i class="fas fa-eye"></i> 觀察 (Observation)：</h4>' +
            '<p style="white-space:pre-line;">' + escapeHtml(d.obs) + '</p>' +
          '</div>';

        if (d.mode === 'OIA') {
          cardHtml += '<div class="gn-section">' +
            '<h4><i class="fas fa-lightbulb"></i> 解釋 (Interpretation)：</h4>' +
            '<p style="white-space:pre-line;">' + escapeHtml(d.interp) + '</p>' +
          '</div>';
        }

        cardHtml += '<div class="gn-section">' +
          '<h4><i class="fas fa-shoe-prints"></i> 應用 (Application)：</h4>' +
          '<p style="white-space:pre-line;">' + escapeHtml(d.app) + '</p>' +
        '</div>';

        if (d.mode === 'SOAP') {
          cardHtml += '<div class="gn-section prayer-bg">' +
            '<h4><i class="fas fa-pray"></i> 禱告 (Prayer)：</h4>' +
            '<p style="white-space:pre-line;">' + escapeHtml(d.prayer) + '</p>' +
          '</div>';
        }

        cardHtml += '</div>';

        previewBox.style.display = 'block';
        previewBox.innerHTML = cardHtml;
        previewBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      });
    }

    if (noteCopyBtn) {
      noteCopyBtn.addEventListener('click', function () {
        var d = getNoteData();
        var dateStr = new Date().toLocaleDateString();
        var md = '### 📖 Biblia ' + d.mode + ' 研經筆記 (' + dateStr + ')\n\n' +
          '**經文出處**：' + d.ref + '\n\n' +
          '> ' + d.text.replace(/\n/g, '\n> ') + '\n\n' +
          '#### 🔍 觀察 (Observation)\n' + d.obs + '\n\n';

        if (d.mode === 'OIA') {
          md += '#### 💡 解釋 (Interpretation)\n' + d.interp + '\n\n';
        }

        md += '#### 👣 應用 (Application)\n' + d.app + '\n\n';

        if (d.mode === 'SOAP') {
          md += '#### 🙏 禱告 (Prayer)\n' + d.prayer + '\n\n';
        }

        md += '---\n*透過 Biblia 正統研經系統生成*';

        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(md).then(function () {
            var oldText = noteCopyBtn.innerHTML;
            noteCopyBtn.innerHTML = '<i class="fas fa-check"></i> 已成功複製 Markdown！';
            setTimeout(function () { noteCopyBtn.innerHTML = oldText; }, 2000);
          }).catch(function () {
            alert('複製失敗，請手動複製！');
          });
        } else {
          prompt('請複製以下 Markdown 筆記內容：', md);
        }
      });
    }
  }

  window.BIBLIA_HERMENEUTICS_DATA = HERMENEUTICS_DATA;
  window.renderHermeneuticsGuideHtml = renderHermeneuticsGuideHtml;
  window.initHermeneuticsInteractions = initHermeneuticsInteractions;

})();
