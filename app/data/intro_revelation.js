/**
 * Biblia - 《啟示錄》深度神學導論與逐段釋義資料庫 (Book of Revelation In-Depth Study Guide)
 * 彙整正統基督新教、福音派、經典靈恩派、正統神學院非異端學術成果
 */

(function () {
  'use strict';

  window.BIBLIA_REVELATION_GUIDE = {
    meta: {
      bookNo: 66,
      nameZh: '啟示錄',
      nameEn: 'Revelation',
      greekTitle: 'Ἀποκάλυψις Ἰωάννου (Apokalypseis Iōannou)',
      author: '使徒約翰（Apostle John，於拔摩海島）',
      date: '約公元 95–96 年（羅馬皇帝圖密善 Domitian 逼迫時期）',
      theme: '萬王之王基督的終極得勝：三一神的寶座主權、羔羊救贖、堅忍得勝、審判惡勢力、新天新地新耶路撒冷降臨',
      keyVerses: [
        {
          ref: '啟示錄 1:8',
          text: '主神說：「我是阿拉法，我是俄梅戛，是昔在、今在、以後永在的全能者。」'
        },
        {
          ref: '啟示錄 11:15',
          text: '第七位天使吹號，天上就有大聲音說：「世上的國成了我主和主基督的國；祂要作王，直到永永遠遠。」'
        },
        {
          ref: '啟示錄 12:11',
          text: '弟兄勝過牠，是因羔羊的血和自己所見證的道。他們雖至於死，也不愛惜性命。'
        },
        {
          ref: '啟示錄 21:3-4',
          text: '我聽見有大聲音從寶座出來說：「看哪，神的帳幕在人間。祂要與人同住，他們要作祂的子民...神要擦去他們一切的眼淚；不再有死亡，也不再有悲哀、哭號、疼痛，因為以前的事都過去了。」'
        },
        {
          ref: '啟示錄 22:20',
          text: '證明這事的說：「是了，我必快來！」阿們！主耶穌啊，我願祢來！'
        }
      ]
    },

    // 導論與文體特徵
    introduction: {
      genre: [
        {
          type: '啟示文學 (Apocalyptic)',
          desc: '以高度象徵性的異象、數字（7, 12, 144000, 666）、天體圖象揭示屬靈背後的終極現實，激勵在水深火熱逼迫中的信徒看見神的寶座主權。'
        },
        {
          type: '先知預言 (Prophecy)',
          desc: '不是單純的算命式時間表，而是承接舊約先知傳統，向當代發出悔改警戒（forth-telling），並宣告神救贖歷史終局的必成定命（fore-telling）。'
        },
        {
          type: '牧會書信 (Epistle)',
          desc: '以典型的初代教會書信格式開始（1:4）與結束（22:21），直接寫給小亞細亞七個真實具體的教會，具有強烈的牧養、糾正與安慰目的。'
        }
      ],
      historicalContext: '寫於羅馬帝國皇帝圖密善（Domitian，主後 81–96 年）在位末期。當時帝國強制推行羅馬皇帝崇拜（Caesar Worship），拒絕稱凱撒為「主和神」（Dominus et Deus）的基督徒面臨嚴酷的經濟抵制、監禁、流放與殉道。使徒約翰被流放至愛琴海的拔摩島（Patmos），在靈裡領受此終極異象。'
    },

    // 四大解經傳統比較
    approaches: [
      {
        name: '過去派 / 已過派 (Preterist)',
        representatives: 'R.C. Sproul (部分已過論), Kenneth Gentry, David Chilton',
        coreView: '認為啟示錄大部分異象已在公元一世紀應驗（特別是公元 70 年耶路撒冷聖殿被毀與羅馬帝國初期逼迫）。大淫婦象徵背約的猶太教體系或尼祿的羅馬。',
        evaluation: '優點是緊扣初代讀者的直接歷史處境；正統神學院強調必須持守「部分已過論」（Partial Preterism），堅決排斥否認基督肉身再來的「全已過論」（Hyper-Preterism 異端）。'
      },
      {
        name: '歷史派 (Historicist)',
        representatives: '馬丁·路德、約翰·加爾文、經典改教家、約翰·衛斯理',
        coreView: '將啟示錄視為從使徒時代直到基督再來整段世界教會歷史的全景預告。敵基督常被指為中世紀背道教廷，七印七號對應歐洲歷史大事件。',
        evaluation: '在改教時期極大鼓舞了反抗教權專制的信徒；但在現代學術界因過於聚焦西歐歷史、缺乏客觀標準而較少作為單一架構，但其批判世俗宗教權勢的洞見仍具價值。'
      },
      {
        name: '理想派 / 象徵派 (Idealist)',
        representatives: 'William Hendriksen, G.K. Beale, Richard Bauckham, 改革宗聖約神學主流',
        coreView: '認為啟示錄超越具體歷史年代，主要揭示神國與撒但黑暗勢力在「整個教會時代」的普遍屬靈爭戰原則。七印、七號、七碗採取「重疊論」（Recapitulation），反覆從不同角度描述從基督初臨至再臨的屬靈現實。',
        evaluation: '神學底蘊最為深厚，普遍適用於歷代受苦教會，強調十字架的得勝、寶座的主權與信徒堅忍。多持無千禧年觀（Amillennialism）。'
      },
      {
        name: '未來派 (Futurist)',
        representatives: 'George Eldon Ladd (歷史前千禧年), John Walvoord (時代論), Craig Keener, 靈恩/五旬節派傳統',
        coreView: '認為第 4 至 22 章主要指向世界歷史末期：七年大災難、敵基督興起、基督可見的榮耀再來、千禧年國度、白色大寶座審判與新天新地。',
        evaluation: '嚴肅看待末世預言的終局性應驗，極富宣教使命感與儆醒警惕性。正統福音派在時代論前千禧年與歷史前千禧年間有深刻對話。'
      }
    ],

    // 福音派與正統靈恩派的互補亮光
    traditions: [
      {
        school: '福音派 / 改革宗神學亮光 (Evangelical & Reformed)',
        scholars: 'G.K. Beale, D.A. Carson, John Stott, F.F. Bruce',
        points: [
          '**基督十字架的終極得勝**：萬物的主權已在基督受死與復活中決定，被殺的羔羊是揭開歷史書卷的唯一配得者。',
          '**三一神寶座的絕對主權**：無論地上帝國多麼不可一世，天上的寶座（出現40餘次）始終掌控歷史每一分秒。',
          '**得勝者聖徒的堅忍**：真正的信徒在各樣誘惑與逼迫中，持守純全教義與聖潔道德，靠主恩典忍耐到底。'
        ]
      },
      {
        school: '正統五旬 / 靈恩派神學亮光 (Pentecostal & Charismatic)',
        scholars: 'Craig Keener, Gordon Fee, Jack Hayford, David Pawson, Assemblies of God (神召會神學)',
        points: [
          '**聖靈的末世澆灌與運行**：強調 1:10「在主日被聖靈感動」、七靈（全備之靈）的先知性恩膏與末世全球大收割。',
          '**天體敬拜與屬靈爭戰**：啟示錄 4–5 章與 19 章的天上敬拜是地上教會爭戰的最高範本；敬拜即是向空中黑暗權勢宣告得勝。',
          '**得勝的屬靈武裝 (12:11)**：宣告「羔羊的寶血」、「見證的道」與「至死忠心的獻身」，擊破仇敵控告與謊言。',
          '**新婦教會的甦醒預備**：聖靈在末後世代喚醒教會穿上光明潔白的細麻衣（聖徒所行的義），等候基督迎娶。'
        ]
      }
    ],

    // 正統防禦 vs 異端辨析
    heresyDefense: [
      {
        topic: '十四萬四千人 (144,000)',
        ref: '啟 7:4, 14:1',
        orthodox: '象徵神全體立約子民的完全數 (12 支派 × 12 使徒 × 1000 完全數)。7:4 聽見的 144,000 地上受印軍隊，即是 7:9 看見的無數各國各族各民之天國凱旋群體。',
        heresy: '【新天地 (李萬熙)】宣稱只有加入其組織並考核通過的 144,000 人才能得救作祭司王。【耶和華見證人】宣稱僅有 144,000 人能進天上天堂統治。',
        defense: '救恩本乎恩、因信稱義，絕非依賴特定封閉邪教的考試或入會名額；啟 7:9 明確記載有「無數的大群眾，沒有人能數過來」同得救恩。'
      },
      {
        topic: '得勝者 (Overcomers)',
        ref: '啟 2-3章, 21:7',
        orthodox: '得勝者是指**所有因信靠耶穌、靠主寶血勝過世界與罪惡的真實基督徒**（約壹 5:4-5「使我們勝了世界的，就是我們的信心」）。',
        heresy: '異端常將「得勝者」單數化，硬套在其教主身上（如新天地李萬熙自稱「唯一的得勝者」、「保惠師實相領受者」）。',
        defense: '啟示錄中的得勝者是複數、普遍性的呼召，給每位忠心信徒。整本聖經唯一的救主與中保只有道成肉身的耶穌基督。'
      },
      {
        topic: '基督第二次降臨',
        ref: '啟 1:7, 19:11-16',
        orthodox: '耶穌基督將以**肉身復活、榮耀、清晰可見**的方式親自從天降臨，「眾目要看見祂，連刺祂的人也要看見祂」（徒 1:11）。',
        heresy: '【全能神 / 東方閃電】宣稱基督已於 1991 年以中國女性肉身秘密重返降生。',
        defense: '主耶穌在太 24:26-27 明確警告：凡說基督在曠野或內室秘密降臨的，切不可信；基督降臨必如閃電從東邊照到西邊，普世共睹。'
      },
      {
        topic: '獸印「666」與敬拜',
        ref: '啟 13:16-18',
        orthodox: '額上與手上的印記象徵**思想（額）與行為（手）對敵基督極權/世俗體系的徹底效忠**。666（人的數字，殘缺的三重重複）對比神聖完全的 777。希伯來字母數值對應「尼祿該撒」（Neron Caesar = 666）。',
        heresy: '炒作為晶片、條碼或疫苗的恐慌迷信，使人偏離心靈真實敬拜神與遠離道德妥協的核心。',
        defense: '獸印的核心在於「屬靈效忠與崇拜的對象」，拒絕獸印是在極端考驗下拒絕向反神政權與偶像妥協，持守基督信仰。'
      }
    ],

    // 小亞細亞七教會環形郵路地理動線與屬靈診斷全圖表
    sevenChurches: [
      {
        no: 1,
        nameZh: '以弗所教會',
        nameEn: 'Ephesus',
        routeOrder: '第 1 站（亞細亞省首府與愛琴海大港）',
        cityBg: '亞細亞省行政商業中心，擁有世界七大奇蹟之一的亞底米女神大廟，異教迷信與巫術盛行。',
        christTitle: '那右手拿著七星、在七個金燈臺中間行走的 (2:1)',
        spiritualState: '真理純全堅固，但離棄起初愛心',
        stateType: 'warning',
        commendation: '勞碌、忍耐、試驗出假使徒並揭露其偽、痛恨尼哥拉黨的妥協惡行。',
        critique: '把起初的愛心（對神、對弟兄姊妹真摯的熱忱）離棄了。',
        counsel: '當回想是從哪裡墜落的，並要悔改，行起初所行的事；若不悔改，我就臨到你那裡，把你的燈臺從原處挪去。',
        promise: '得勝的，我必將神樂園中生命樹的果子賜給他吃 (2:7)。'
      },
      {
        no: 2,
        nameZh: '士每拿教會',
        nameEn: 'Smyrna',
        routeOrder: '第 2 站（沿海向北約55公里之繁榮海港）',
        cityBg: '忠誠效忠羅馬的自由市，凱撒崇拜重鎮；猶太勢力強大且敵視基督徒；產沒藥（象徵受苦死亡）。',
        christTitle: '那首先的、末後的、死過又活的 (2:8)',
        spiritualState: '在受苦與赤貧中蒙神稱許為極其富足',
        stateType: 'honor',
        commendation: '在極端患難貧窮中持守信仰，實質在神面前極其富足；勇敢面對自稱猶太人者（實為撒但一會）的毀謗。',
        critique: '【無任何責備】七教會中僅有的兩個全蒙稱讚教會之一！',
        counsel: '你將要受的苦你不用怕。魔鬼要將你們幾個人下在監裡受試煉十日；你務要至死忠心，我就賜給你那生命的冠冕。',
        promise: '得勝的，必不受第二次死的害 (2:11)。'
      },
      {
        no: 3,
        nameZh: '別迦摩教會',
        nameEn: 'Pergamum',
        routeOrder: '第 3 站（轉向內陸以北之高山政治衛城）',
        cityBg: '羅馬總督駐地與文化名城，建於高山上；有巨型宙斯祭壇（如寶座）與蛇神廟，被稱為「撒但座位之處」。',
        christTitle: '那有兩刃利劍的 (2:12)',
        spiritualState: '堅守主名但容讓巴蘭妥協與肉體縱慾',
        stateType: 'warning',
        commendation: '堅守主名，即使在忠心見證人安提帕殉道時，也沒有棄絕信仰。',
        critique: '有人服從了巴蘭的教訓（引誘人吃祭偶像之物，行姦淫），也有人服從了尼哥拉黨的教訓。',
        counsel: '所以，你當悔改；若不悔改，我就快臨到你那裡，用我口中的劍攻擊他們。',
        promise: '得勝的，我必將那隱藏的嗎哪賜給他，並賜他一塊白石，石上寫著新名 (2:17)。'
      },
      {
        no: 4,
        nameZh: '推雅推喇教會',
        nameEn: 'Thyatira',
        routeOrder: '第 4 站（東南內陸交通要衝與商業行會重鎮）',
        cityBg: '手工業行會（銅匠、染布業）極發達；入會必須參加異教宴席吃祭肉，否則遭經濟封鎖。',
        christTitle: '那眼目如火焰、腳像光明銅的神之子 (2:18)',
        spiritualState: '愛心與善行增加，但容讓假先知耶洗別引誘行淫',
        stateType: 'danger',
        commendation: '知道你的行為、愛心、信心、勤勞、忍耐，又知道你末後所行的善比起初所行的更多。',
        critique: '容讓那自稱是先知的婦人耶洗別教導我的僕人，引誘他們行姦淫，吃祭偶像之物。',
        counsel: '我曾給她悔改的機會，她卻不肯。看哪，我要叫她臥病在床...但你們其餘不從這教訓的人，我只要你們持守你們所有的，直等到我來。',
        promise: '得勝的，又遵守我命令到底的，我賜給他制伏列國的權柄，並要把晨星賜給他 (2:26-28)。'
      },
      {
        no: 5,
        nameZh: '撒狄教會',
        nameEn: 'Sardis',
        routeOrder: '第 5 站（向南之昔日呂底亞帝國雄偉古都）',
        cityBg: '古代黃金產地與紡織工業中心；建於峭壁上號稱固若金湯，但歷史上曾兩次因守衛傲慢嗜睡被敵軍突襲攻破。',
        christTitle: '那有神的七靈和七星的 (3:1)',
        spiritualState: '按名是活著的，實質上是死的',
        stateType: 'danger',
        commendation: '在撒狄你還有幾名是未曾污穢自己衣服的，他們要穿白衣與我同行。',
        critique: '按名你是活的，其實是死的！我見你的行為，在我神面前沒有一樣是完全的。',
        counsel: '你要儆醒，堅固那剩下將要衰微的...若不儆醒，我必臨到你那裡，如同賊一樣。我幾時臨到，你也決不能知道。',
        promise: '凡得勝的必這樣穿白衣，我也必不從生命冊上塗抹他的名，且要在我父面前宣告他的名 (3:5)。'
      },
      {
        no: 6,
        nameZh: '非拉鐵非教會',
        nameEn: 'Philadelphia',
        routeOrder: '第 6 站（向東南之「弟兄相愛」之城與宣教門戶）',
        cityBg: '建城為向弗呂家傳播希臘文化，被稱為「通往東方的大門」；位處地震帶，居民常逃至城外空地。',
        christTitle: '那聖潔、真實、拿著大衛的鑰匙、開了就沒有人能關的 (3:7)',
        spiritualState: '略有一點力量，但堅守主道未曾棄絕主名',
        stateType: 'honor',
        commendation: '略有一點力量，也曾遵守我的道，沒有棄絕我的名；在患難中忍耐持守。無任何責備！',
        critique: '【無任何責備】七教會中另一個全蒙喜悅讚賞的教會！',
        counsel: '我必快來，你要持守你所有的，免得人奪去你的冠冕。',
        promise: '得勝的，我要叫他在我神殿中作柱子，他也必不再從那裡出去。我又要將我神的名和我神城的名寫在他上面 (3:12)。'
      },
      {
        no: 7,
        nameZh: '老底嘉教會',
        nameEn: 'Laodicea',
        routeOrder: '第 7 站（向東南利卡河谷三城之一，金融醫療重鎮）',
        cityBg: '富庶的銀行金融中心、黑色羊毛紡織業、著名眼藥粉醫學院；本地無水源，引泉水到城中變成溫吞令人作嘔的水。',
        christTitle: '那為阿們的，為誠信真實見證的，在神創造萬物之上為元首的 (3:14)',
        spiritualState: '不冷不熱，自誇富足卻貧窮瞎眼赤身',
        stateType: 'danger',
        commendation: '【無任何稱讚】七教會中唯一沒有得到任何正面稱讚的教會！',
        critique: '我知道你的行為，你也不冷也不熱；你既如溫水，所以我必從我口中把你吐出去！你說我是富足，卻不知自己是貧窮、瞎眼、赤身的。',
        counsel: '我勸你向我買火煉的金子，叫你富足；又買白衣穿上，叫你赤身的羞恥不露出來；又買眼藥擦你的眼睛...看哪，我站在門外叩門，若有聽見我聲音就開門的，我要進到他那裡去與他同席。',
        promise: '得勝的，我要賜他在我寶座上與我同坐，就如我得了勝，在我父的寶座上與祂同坐一般 (3:21)。'
      }
    ],

    // 七印、七號、七碗結構遞進與重疊對照全景圖表
    sevenJudgments: {
      overview: '啟示錄採用三組「七重審判」呈現救贖歷史終末審判的進程。神學界普遍肯定三者既具備「重疊性（Recapitulation，反覆從不同維度檢視基督初臨到再臨之屬靈現實）」，又具備「遞進性（Progression，審判的烈度與範圍從 1/4 到 1/3，最終達到 100% 全然傾倒）」。',
      series: [
        {
          id: 'seals',
          title: '一、七印審判 (The 7 Seals, 啟 6:1–8:1)',
          agent: '被殺的羔羊親自揭開書卷七印',
          scope: '影響地上 1/4（四分之一）的範圍',
          character: '普世人類歷史歷史性大趨勢與屬靈爭戰，揭示受苦中神的掌權',
          items: [
            { no: 1, name: '第一印：白馬騎士', ref: '6:1-2', focus: '手拿著弓，並有冠冕賜給他，出來勝了又要勝（福音得勝宣揚 / 軍事帝國征服）' },
            { no: 2, name: '第二印：紅馬騎士', ref: '6:3-4', focus: '有大刀賜給他，可以從地上奪去太平，使人彼此相殺（殘酷戰火與流血內訌）' },
            { no: 3, name: '第三印：黑馬騎士', ref: '6:5-6', focus: '手拿天平，一錢銀子買一升麥子，油和酒不可糟蹋（嚴重通貨膨脹與物資匱乏饑荒）' },
            { no: 4, name: '第四印：灰馬騎士', ref: '6:7-8', focus: '名字叫作死，陰府也隨著他；用刀劍、饑荒、瘟疫、野獸殺害地上四分之一的人' },
            { no: 5, name: '第五印：祭壇下的呼冤', ref: '6:9-11', focus: '為神之道被殺之人的靈魂大聲喊著：「聖潔真實的主啊，要到幾時呢？」賜給白衣並要安息片時' },
            { no: 6, name: '第六印：天地宇宙震動', ref: '6:12-17', focus: '地大震動，日黑如毛布，滿月變紅像血，天星墜落，列王世人向大山巖石求藏身，躲避羔羊的忿怒' },
            { no: '插曲', name: '【第7章重要插曲】', ref: '7:1-17', focus: '地上受印的 144,000 立約爭戰軍隊（7:1-8）＋ 天上無數身穿白衣手拿棕樹枝的凱旋大群眾（7:9-17）' },
            { no: 7, name: '第七印：寂靜與七號引出', ref: '8:1-5', focus: '天上寂靜約有二刻；天使拿金香爐盛滿聖徒的祈禱倒在地上，有雷轟、大聲、閃電、地震，帶出七枝號！' }
          ]
        },
        {
          id: 'trumpets',
          title: '二、七號審判 (The 7 Trumpets, 啟 8:2–11:19)',
          agent: '七位天使依序吹號宣告審判警戒',
          scope: '摧毀自然生態與人類社會 1/3（三分之一）的範圍',
          character: '神針對背道與叛逆世界的超自然警告性審判，回應祭壇下聖徒的祈禱',
          items: [
            { no: 1, name: '第一號：雹與火摻血', ref: '8:7', focus: '雹與火摻著血丟在地上；地的三分之一和樹的三分之一被燒了，一切青草也被燒了' },
            { no: 2, name: '第二號：火燒大山投海', ref: '8:8-9', focus: '彷彿火燒的大山扔在海中；海的三分之一變成血，海中有生命之物死了三分之一，船隻壞了三分之一' },
            { no: 3, name: '第三號：茵陳巨星落江', ref: '8:10-11', focus: '燒著的大星名叫茵陳，落在江河的三分之一和眾水的泉源上；水變苦，因水變苦死了許多人' },
            { no: 4, name: '第四號：日月星辰擊打', ref: '8:12', focus: '日頭、月亮、星辰的三分之一都被擊打，以致日月星的三分之一黑暗了，白晝的三分之一沒有光' },
            { no: 5, name: '第五號：第一樣災禍（無底坑蝗蟲）', ref: '9:1-12', focus: '無底坑開啟，如蠍子毒鉤的蝗蟲大軍折磨額上沒有神印記之人五個月，求死不得' },
            { no: 6, name: '第六號：第二樣災禍（二萬萬馬軍）', ref: '9:13-21', focus: '釋放伯拉大河捆綁的四個使者；二萬萬馬軍出動，殺害人類的三分之一；其餘未被殺的人仍不悔改' },
            { no: '插曲', name: '【第10-11章重要插曲】', ref: '10:1-11:14', focus: '大能天使與小書卷（約翰吃盡，肚子發苦口中甘甜，必再指萬民說預言）＋ 兩位見證人（傳道1260天，被獸殺死三天半復活升天）' },
            { no: 7, name: '第七號：第三樣災禍（基督國度降臨）', ref: '11:15-19', focus: '世上的國成了我主和主基督的國！祂要作王直到永永遠遠！神在天上的殿開了，顯出約櫃，帶出七碗！' }
          ]
        },
        {
          id: 'bowls',
          title: '三、七碗審判 (The 7 Bowls, 啟 15:1–16:21)',
          agent: '七位天使將盛滿神大怒的金碗全數傾倒',
          scope: '全然傾倒，影響全地 100%（毫無保留與延遲）',
          character: '神公義忿怒的終極審判與罪惡帝國巴比倫的徹底毀滅，救贖歷史大結局',
          items: [
            { no: 1, name: '第一碗：生極惡毒瘡', ref: '16:2', focus: '倒在地上，就有惡而且毒的瘡生在那些有獸印記、拜獸像的人身上' },
            { no: 2, name: '第二碗：全海變死人血', ref: '16:3', focus: '倒在海裡，海就變成血，好像死人的血，海中的活物都死了（全面性徹底崩毀）' },
            { no: 3, name: '第三碗：江河水泉成血', ref: '16:4-7', focus: '倒在江河與泉源裡，水就變成血；掌管水的天使宣告神是公義的，因他們曾流聖徒與先知的血' },
            { no: 4, name: '第四碗：烈日炙烤眾人', ref: '16:8-9', focus: '倒在日頭上，叫日頭能用火烤人；人被大熱所烤，就褻瀆神的名，並不悔改歸榮耀給神' },
            { no: 5, name: '第五碗：獸的國度黑暗', ref: '16:10-11', focus: '倒在獸的座位上；獸的國就黑暗了；人因疼痛就咬自己的舌頭，仍褻瀆天上的神' },
            { no: 6, name: '第六碗：伯拉大河乾涸', ref: '16:12-16', focus: '伯拉大河水乾了，為東方諸王預備道路；三個青蛙怪靈從龍口、獸口、假先知口中出來，招聚普世列王在哈米吉多頓爭戰' },
            { no: '警語', name: '【基督親自警語宣告】', ref: '16:15', focus: '「看哪，我來像賊一樣。那儆醒、看守衣服、免得赤身而行叫人見他羞恥的有福了！」' },
            { no: 7, name: '第七碗：傾倒空中·成了！', ref: '16:17-21', focus: '倒在空中，寶座出大聲音說：「成了 (Gegonen)！」大地震、大雹子、大巴比倫裂為三段，神的忿怒大杯全傾！' }
          ]
        }
      ]
    },

    // 天體敬拜與寶座同在層次圖解
    throneLiturgy: {
      title: '啟示錄天體敬拜與宇宙寶座同在層次圖解 (Revelation 4–5 Liturgy)',
      desc: '在世上苦難與逼迫爆發前，聖靈首先將信徒的視線引導至宇宙的最高控制中心——天上的寶座。這是一切屬靈得勝與歷史命定的發源地。',
      layers: [
        {
          rank: '核心中樞',
          name: '坐寶座的三一真神 (The Enthroned One)',
          ref: '啟 4:2-3',
          symbol: '碧玉與紅寶石，周圍有虹圍繞如綠寶石',
          meaning: '至高榮耀、公義審判與信實守約（彩虹是聖約記號）的宇宙掌管者'
        },
        {
          rank: '神聖運行',
          name: '神的七靈與被殺的羔羊 (Seven Spirits & The Slain Lamb)',
          ref: '啟 4:5, 5:6',
          symbol: '寶座前的七盞火燈、站立如被殺過之羔羊（七角七眼）',
          meaning: '全備全能的聖靈；唯有在十字架受死流血代贖的基督，配開救贖審判歷史書卷'
        },
        {
          rank: '受造代表',
          name: '四活物 (Four Living Creatures)',
          ref: '啟 4:6-8',
          symbol: '獅、牛、人、鷹，前後遍體滿了眼睛，六個翅膀',
          meaning: '代表全體受造界（野獸、牲畜、人類、飛禽）晝夜不息頌讚「聖哉！聖哉！聖哉！」'
        },
        {
          rank: '聖約子民',
          name: '二十四位長老 (Twenty-Four Elders)',
          ref: '啟 4:4, 4:10',
          symbol: '身穿白衣，頭戴金冠冕，俯伏將冠冕放在寶座前',
          meaning: '代表舊約十二支派與新約十二使徒的全體立約選民共同體，將一切冠冕榮耀歸給主'
        },
        {
          rank: '天體大軍',
          name: '千萬天使天軍 (Myriads of Angels)',
          ref: '啟 5:11-12',
          symbol: '千千萬萬的天使大聲宣告',
          meaning: '「曾被殺的羔羊是配得權柄、豐富、智慧、能力、尊貴、榮耀、頌讚的！」'
        },
        {
          rank: '得勝聖徒',
          name: '十四萬四千人與各國各族大群眾 (Sealed Army & Great Multitude)',
          ref: '啟 7:1-17, 14:1-5',
          symbol: '額上受印者、身穿白衣手拿棕樹枝的大群眾',
          meaning: '在世上歷經大患難、用羔羊的血洗淨衣裳的得勝教會，在永恆寶座前歡呼得救'
        },
        {
          rank: '終極成全',
          name: '新天新地與新耶路撒冷 (New Creation & New Jerusalem)',
          ref: '啟 21:1-22:5',
          symbol: '聖城新耶路撒冷由神那裡從天而降，城中無殿，生命水的河與生命樹',
          meaning: '神要親自與人同住，擦去一切眼淚，不再有死亡、悲哀、哭號、疼痛，永遠作王！'
        }
      ]
    },
    // 二十二章逐段深度研經
    sections: [
      {
        partNo: 1,
        title: '第一部分：序言與拔摩海島榮耀基督大祭司異象 (1:1–20)',
        chapters: '啟示錄 第 1 章',
        summary: '全書宏偉的序幕，宣告啟示的源頭、三一神問安、基督再來預言，以及約翰在拔摩島上看見復活升天、身著大祭司袍服、手握七星巡行在七金燈臺間的榮耀基督。',
        paragraphs: [
          {
            range: '1:1–3',
            title: '神聖啟示的傳遞與第一福',
            content: '啟示的希臘原文 Ἀποκάλυψις (Apokalypseis) 意為「揭開遮蓋」。啟示鏈條為：神 → 耶穌基督 → 天使 → 僕人約翰 → 眾教會。宣告「念這書上預言的和那些聽見又遵守其中所記載的，都是有福的」，立下全書七福之首。',
            notes: '啟示錄不是封閉的謎語，而是神為了賜福並指引聖徒所揭開的話語。'
          },
          {
            range: '1:4–8',
            title: '三一神問安與基督再來宣告',
            content: '三一神的立約問安：聖父是「昔在、今在、以後永在的」；聖靈是「寶座前的七靈」（全備、全知、七倍恩膏的靈，呼應賽 11:2）；聖子是「誠實見證的先知、死裡首生的祭司、地上君王元首的君王」。1:7 結合但以理書 7:13（人子駕雲）與撒迦利亞書 12:10（刺祂的要看見祂並哀哭），宣告歷史終局必由基督掌管。神親自印證「我是阿拉法，我是俄梅戛（Alpha & Omega）」。',
            notes: 'Pantokrator（全能者）在七十士譯本常用於翻譯「萬軍之耶和華」，奠定神掌權的磐石神學。'
          },
          {
            range: '1:9–20',
            title: '拔摩島大祭司基督顯現',
            content: '約翰在患難、國度、忍耐裡與眾聖徒同伴，在主日「被聖靈感動」（ἐν πνεύματι）。他看見身穿長衣、胸間束金帶、頭與髮皆白（亙古常在者神性）、眼目如火焰（聖潔鑒察）、腳像光明銅（堅定審判）、聲音如眾水（全能話語）、口吐兩刃利劍（公義之道）、面如烈日的基督。基督右手拿著七星（七教會使者/牧者），在七個金燈臺（七教會）中行走，宣告「我曾死過，現在又活了，直活到永永遠遠，並且拿著死亡和陰間的鑰匙」。',
            notes: '教會不是光源，而是承載基督真理的金燈臺。基督親自看顧巡行在祂的教會中。'
          }
        ]
      },
      {
        partNo: 2,
        title: '第二部分：給亞西亞七教會的書信 (2:1–3:22)',
        chapters: '啟示錄 第 2–3 章',
        summary: '主耶穌寫給當代小亞細亞七個具體教會的牧養書信，也是歷代普世教會的靈命診斷書。每封信皆具備五重神聖結構：基督自稱、讚許、責備、勸勉警告、得勝者應許。',
        paragraphs: [
          {
            range: '2:1–7',
            title: '以弗所教會：真理嚴謹卻失落起初愛心',
            content: '【稱讚】勞碌、忍耐、試驗出假使者、恨惡尼哥拉黨行為。【責備】離棄了起初的愛心（對神對人的熱忱）。【勸勉】回想、悔改、行起初所行的，否則挪去燈臺。【應許】得吃神樂園中生命樹的果子。',
            notes: '尼哥拉黨（Nicolaitans）：主張在羅馬異教文化中妥協、縱慾的假教師。'
          },
          {
            range: '2:8–11',
            title: '士每拿教會：受苦至死的忠心冠冕',
            content: '【自稱】那首先的、末後的、死過又活的。【稱讚】在患難貧窮中卻是極富足，受假猶太人（撒但一會）毀謗。【無責備】【勸勉】不要怕受苦，務要至死忠心，受試煉十日。【應許】賜給生命的冠冕，不受第二次死的害。',
            notes: '士每拿主教坡旅甲（Polycarp）主後 155 年殉道：「我事奉祂86年，祂從未虧負我，我豈能褻瀆拯救我的王？」'
          },
          {
            range: '2:12–17',
            title: '別迦摩教會：妥協巴蘭教訓的危機',
            content: '【自稱】有兩刃利劍者。【稱讚】在撒但座位之處（羅馬總督權柄/宙斯祭壇）堅守主名，安提帕忠心殉道。【責備】有人服從巴蘭教訓（吃祭物、行姦淫）與尼哥拉黨。【勸勉】快快悔改，否則用口中的劍攻擊他們。【應許】賜隱藏的嗎哪與刻有新名的白石。',
            notes: '白石（White Stone）：古代法庭象徵無罪釋放，或獲准進入榮耀筵席的貴賓憑證。'
          },
          {
            range: '2:18–29',
            title: '推雅推喇教會：容讓假先知耶洗別',
            content: '【自稱】眼如火焰、腳像光明銅的神之子。【稱讚】愛心、信心、事奉、忍耐，末後所行的比起初更多。【責備】容讓婦人耶洗別自稱先知引誘信徒行姦淫、吃祭物。【勸勉】持守所擁有的直到主來。【應許】賜制伏列國的鐵杖權柄並賜給晨星。',
            notes: '商業行會（Guilds）強迫參加拜偶像異教筵席，推雅推喇教會面臨向經濟利益妥協的巨大試探。'
          },
          {
            range: '3:1–6',
            title: '撒狄教會：按名是活其實是死',
            content: '【自稱】有神的七靈和七星者。【責備】按名是活的，其實是死的；善行在神面前沒有一樣是完全的。【稱讚】少數幾人未曾污穢衣服。【勸勉】要儆醒，堅固剩下的；若不儆醒，主要如賊臨到。【應許】穿白衣同行，決不從生命冊塗名，在父與使者前認他。',
            notes: '撒狄古城曾兩次因夜間守衛疏忽被敵軍突襲陷落，「如賊臨到」對撒狄人具深刻歷史警示。'
          },
          {
            range: '3:7–13',
            title: '非拉鐵非教會：持守真道與敞開的門',
            content: '【自稱】聖潔、真實、拿大衛鑰匙開了無人能關者。【稱讚】略有一點力量，仍遵守主道、沒有棄絕主名。【無責備】【勸勉】持守所有，免得冠冕被奪。【應許】在神殿中作柱子，不再出去；寫上神的名與新耶路撒冷的名。',
            notes: '非拉鐵非位處地震帶，居民常逃到城外；主應許他們在永恆聖殿中作穩固的柱子，永不再出。'
          },
          {
            range: '3:14–22',
            title: '老底嘉教會：不冷不熱與門外叩門',
            content: '【自稱】為阿們的，誠信真實見證，神創造元首。【無稱讚】【責備】不冷也不熱，如溫水必吐出；自誇富足發財，不知自己困苦貧窮瞎眼赤身。【勸勉】買火煉金子、白衣與眼藥；基督在門外叩門，開門的與祂同席。【應許】與基督同坐寶座。',
            notes: '老底嘉以銀行業（富足）、黑羊毛織品（衣服）、眼藥膏（眼藥）聞名，其引水道水質溫吞令人作嘔。主精準切中其屬靈盲點。'
          }
        ]
      },
      {
        partNo: 3,
        title: '第三部分：天上的寶座與羔羊的書卷 (4:1–5:14)',
        chapters: '啟示錄 第 4–5 章',
        summary: '全書神學樞紐！在地上災難臨到前，聖靈首先引導信徒仰望天上：第四章看見創造之主的至尊寶座與不息敬拜；第五章揭示唯有猶大獅子（即被殺的羔羊）配揭開神救贖與審判歷史的七印書卷。',
        paragraphs: [
          {
            range: '4:1–11',
            title: '至高寶座、長老與四活物敬拜',
            content: '天門敞開，約翰看見天上的寶座（Thronos，本章出現14次）。坐寶座者如同碧玉紅寶石，周圍有彩虹像綠寶石。二十四位長老（代表全體立約子民）身穿白衣戴金冠冕；寶座前有七盞火燈（神的七靈）與玻璃海。四活物（獅、牛、人、鷹，代表全受造界）晝夜不息讚美「聖哉！聖哉！聖哉！主神是昔在、今在、以後永在的全能者！」長老俯伏將冠冕放在寶座前，頌讚造物主配得榮耀尊貴權柄。',
            notes: '天體敬拜（Heavenly Liturgy）：揭示宇宙的中心不是地上的暴君凱撒，而是掌管一切的神。'
          },
          {
            range: '5:1–14',
            title: '被殺的羔羊：唯一配開書卷的得勝者',
            content: '坐寶座者右手中有七印封嚴的書卷（神的終末救贖審判計畫）。全宇宙無人配開，約翰大哭。長老宣告「猶大支派的獅子已得勝」，約翰轉頭看見的卻是「有羔羊站立，像是被殺過的，有七角七眼」。羔羊拿了書卷，四活物與長老拿著琴和盛滿聖徒祈禱的香爐，唱新歌頌讚羔羊「用自己的血從各族各方各民各國買了人來歸於神，叫他們作祭司歸於神，在地上執掌王權」。',
            notes: '基督論核心悖論：基督不是藉由屠殺仇敵得勝，而是藉由在十字架上甘願被殺、流血代贖而贏得歷史的最高產權與統治權！'
          }
        ]
      },
      {
        partNo: 4,
        title: '第四部分：七印、七號與插曲 (6:1–11:19)',
        chapters: '啟示錄 第 6–11 章',
        summary: '羔羊揭開七印，拉開對叛逆世界的警告性審判序幕。第七印帶出七號。其中穿插兩大重要插曲：第七章神印記十四萬四千人與天國無數群眾，以及第十至十一章小書卷與兩位見證人的先知使命。',
        paragraphs: [
          {
            range: '6:1–17, 8:1',
            title: '七印審判：四騎士與末日恐慌',
            content: '【前四印：四騎士】白馬（軍事征服/假和平）、紅馬（戰爭殺戮）、黑馬（糧荒經濟剝削）、灰馬（瘟疫與死亡審判，權柄害及地上四分之一）。【第五印】祭壇下殉道者的靈魂呼喊伸冤，獲賜白衣安息，等候同作僕人數目滿足。【第六印】宇宙性大震動（日黑如麻布、滿月變血、星辰墜落），世上君王臣宰藏身岩洞，呼喊躲避羔羊的忿怒。【第七印 (8:1)】天上寂靜約二刻，帶出七號。',
            notes: '七印與耶穌橄欖山講論（太 24 章「災難的起頭」）完全對照，表明歷史中的動盪皆在神的量度之中。'
          },
          {
            range: '7:1–17',
            title: '第一插曲：十四萬四千受印者與天國大群眾',
            content: '四位天使執掌四方的風，在神僕人額上受印。約翰「聽見」以色列十二支派受印數目共十四萬四千；轉身「看見」有無數各國各族各民各方的大群眾，身穿白衣手拿棕樹枝，頌讚「救恩歸於坐寶座的神與羔羊」。長老解明：他們是從大患難中出來的，曾用羔羊的血把衣裳洗白淨了，神要擦去他們一切的眼淚。',
            notes: '同一群體的雙重視角：地上的爭戰部隊（144,000）與天上的凱旋會眾（無數大群眾）。'
          },
          {
            range: '8:2–9:21',
            title: '七號審判：警告性生態之災與無底坑邪靈',
            content: '【前奏 (8:2-5)】天使將盛滿聖徒祈禱的金香爐加上火倒在地上，引發雷轟大震。【前四號】生態界三分之一受創（雹與火燒地、火燒大山沉海、茵蔯星苦水、日月星辰變黑）。【第五號/第一禍 (9:1-11)】無底坑之星墜落，釋放邪靈蝗蟲折磨無神印記之人五個月，魔王名亞巴頓（Abaddon）。【第六號/第二禍 (9:13-21)】幼發拉底河解開四使者，兩億馬隊殺害人類三分之一；倖存者仍不悔改其偶像與惡行。',
            notes: '七號審判具有「三分之一」的限制，顯明神在末後傾倒烈怒前，仍給予世人悔改的憐憫空間。'
          },
          {
            range: '10:1–11:14',
            title: '第二插曲：大力天使、小書卷與兩位見證人',
            content: '【第十章】大力天使手拿展開的小書卷，宣告「不再耽延了」。約翰吃下小書卷，肚子發苦口中甜如蜜，領受指著多國多民再說預言的使命。【第十一章】量度神的殿與祭壇。兩位見證人（穿毛衣傳道1260天，具摩西與以利亞的權能）作完見證後被無底坑上來的獸殺害，屍首倒在罪惡大城三天半；神氣息進入體內使他們復活升天，大地震降臨。',
            notes: '兩位見證人象徵末世教會在苦難中發揮的先知性見證，歷經十字架受苦、殉道，最終必蒙神榮耀復活。'
          },
          {
            range: '11:15–19',
            title: '第七號：神的國完全臨到',
            content: '第七位天使吹號，天上宣告「世上的國成了我主和主基督的國；祂要作王，直到永永遠遠！」二十四位長老敬拜感謝神執掌大權作王，賞賜眾僕人聖徒，敗壞那敗壞世界之人。天上的殿開了，殿中顯出神的約櫃（象徵神永遠信實的立約同在）。',
            notes: '第七號標誌著神終極統治的確立，為後半卷書的屬靈爭戰揭開勝利基調。'
          }
        ]
      },
      {
        partNo: 5,
        title: '第五部分：屬靈爭戰終極焦點：婦人、龍與兩隻獸 (12:1–14:20)',
        chapters: '啟示錄 第 12–14 章',
        summary: '全書屬靈大爭戰核心幕後揭秘！展現大紅龍（撒但）對婦人與男孩子的迫害，海陸二獸（敵基督政權與假先知宗教體系）的興起與獸印「666」，以及錫安山十四萬四千人的得勝與末日雙重大收割。',
        paragraphs: [
          {
            range: '12:1–17',
            title: '婦人、男孩子與大紅龍之戰',
            content: '天上現出大異象：身披日頭、腳踏月亮、頭戴十二星冠冕的婦人（神的立約子民/以色列與教會）懷孕生產。大紅龍（七頭十角，古蛇魔鬼）欲吞吃男孩子（基督）。男孩子被提到神寶座去；米迦勒在天上同龍爭戰，龍被摔在地上。天上宣告「弟兄勝過牠，是因羔羊的血和自己所見證的道，他們雖至於死也不愛惜性命」。龍轉而迫害婦人其餘的兒女（守神誡命為耶穌作見證的信徒）。',
            notes: '基督十字架的代贖徹底粉碎了撒但在神面前對信徒的「晝夜控告權」！'
          },
          {
            range: '13:1–18',
            title: '海獸、陸獸與獸印「666」',
            content: '【海獸（敵基督政權）】從動盪外邦海中上來，七頭十角，受龍賜予權柄，死傷醫好引發全地跟從，褻瀆神並與聖徒爭戰。【陸獸（假先知宗教文化體系）】說話像龍，行大奇事叫火從天降，迷惑人立獸像並敬拜。【獸印 666】強迫人在右手或額上受印記，否則不得買賣。666 是人的數字（殘缺的人本罪惡極致，對比神聖 777；字母數值對應尼祿該撒）。',
            notes: '撒但的偽三位一體：大紅龍（偽天父）、海獸（偽聖子，受死傷又醫好）、陸獸（偽聖靈，引導人敬拜獸）。'
          },
          {
            range: '14:1–20',
            title: '錫安山羔羊、三天使信息與末日大收割',
            content: '【14:1-5】羔羊與十四萬四千人站在錫安山，額上有父名，唱新歌，聖潔無瑕疵。【14:6-13】三天使傳永遠福音、宣告巴比倫傾倒、警告拜獸者受火湖之刑；宣告「在主裡面而死的人有福了」。【14:14-20 雙重收割】莊稼熟透（人子揮鐮收割聖徒）與葡萄熟透（天使收割惡人丟入神烈怒的大酒醡，血流高及馬嚼環）。',
            notes: '末世大收割：神對義人的恩惠收割與對惡人罪孽滿盈的公義審判同時成熟。'
          }
        ]
      },
      {
        partNo: 6,
        title: '第六部分：七碗與大淫婦巴比倫的覆滅 (15:1–18:24)',
        chapters: '啟示錄 第 15–18 章',
        summary: '神烈怒的終極完全傾倒（七碗 100% 審判）與反神世俗政經文化體系（大淫婦巴比倫）的徹底崩潰。信徒蒙召「要從那城出來」，持守聖潔。',
        paragraphs: [
          {
            range: '15:1–16:21',
            title: '玻璃海之歌與七碗烈怒傾倒',
            content: '【第十五章】勝過獸的得勝者站在玻璃海上，拿神琴唱摩西之歌與羔羊之歌，稱頌神道的公義真實。七天使從殿中領受盛滿神大怒的七個金碗。【第十六章 七碗全面傾倒】1. 毒瘡 → 2. 海成血 → 3. 江河成血 → 4. 日頭如火烤人 → 5. 獸國黑暗人咬舌呻吟 → 6. 幼發拉底河乾涸，三污穢靈召集君王聚集在哈米吉多頓（Armageddon） → 7. 天崩地裂，巴比倫大城裂為三段。',
            notes: '不同於七印（1/4）與七號（1/3），七碗代表神對惡貫滿盈之罪惡體系毫無保留的 100% 徹底審判。'
          },
          {
            range: '17:1–18',
            title: '騎在朱紅獸上的大淫婦',
            content: '天使向約翰指示大淫婦巴比倫：身穿紫色朱紅色衣服，戴金銀寶石，手拿金杯滿盛淫亂污穢，喝醉了聖徒的血。她騎在七頭十角的獸上（象徵假宗教與世俗暴政政權相互勾結利用）。天使解明：獸與十角最終將憎恨淫婦，使她冷落赤身，吞吃其肉用火焚燒（邪惡勢力的自相殘殺與瓦解）。',
            notes: '大淫婦代表背離真神、沉湎物質奢華、迷惑萬國、殘害聖徒的世俗宗教與文化體系。'
          },
          {
            range: '18:1–24',
            title: '巴比倫大城的徹底傾倒與哀歌',
            content: '天使大聲宣告「巴比倫大城傾倒了！」天上傳來呼召：「我的民哪，你們要從那城出來，免得與她一同有罪，受她所受的災殃！」世上君王、客商、船主為這曾帶來巨大奢華暴利的政經體系在「一時之間」徹底化為烏有而哀哭。大力天使將大磨石扔進海中，預表巴比倫永不再見。',
            notes: '從那城出來：正統神學強調信徒在世不屬乎世，遠離貪婪與偶像崇拜，過聖潔分別為聖的生活。'
          }
        ]
      },
      {
        partNo: 7,
        title: '第七部分：基督凱旋降臨、千禧年與白色大寶座審判 (19:1–20:15)',
        chapters: '啟示錄 第 19–20 章',
        summary: '救贖歷史的高峰！天上四次哈利路亞頌讚羔羊婚宴，萬王之王基督騎白馬榮耀降臨擒拿獸與假先知；撒但被捆綁一千年，千年國度統治與最後叛亂覆滅，白色大寶座的終極公義大審判。',
        paragraphs: [
          {
            range: '19:1–10',
            title: '四次哈利路亞與羔羊婚宴',
            content: '天上群眾四次呼喊「哈利路亞！」頌讚神的審判真實公義，神作王了。宣告羔羊婚娶的時候到了，新婦（教會）預備齊整，獲賜穿光明潔白的細麻衣（「這細麻衣就是聖徒所行的義 dikaiōmata」）。天使宣告「凡被請赴羔羊之婚筵的有福了！」',
            notes: '婚宴新婦與 17 章大淫婦形成強烈對比：貞潔的愛 vs 淫亂的交易；潔白細麻衣 vs 奢華朱紅外袍。'
          },
          {
            range: '19:11–21',
            title: '萬王之王白馬降臨大獲全勝',
            content: '天開了，基督騎白馬顯現，名為「誠信真實」、「神之道（Logos）」、「萬王之王，萬主之主」。眼睛如火焰，頭戴多冠冕，穿著濺了血的衣服，口吐利劍擊殺列國，用鐵杖轄管他們。獸與地上君王聚集與基督爭戰；獸與假先知被擒拿，活活扔在燒著硫磺的火湖裡；其餘全被口中的劍擊殺。',
            notes: '基督以祂口中的話語（神之道）審判全地，仇敵無招架之力。'
          },
          {
            range: '20:1–10',
            title: '撒但被捆綁、千禧年與歌各瑪各之役',
            content: '天使拿無底坑鑰匙捆綁大龍（撒但）一千年，扔在無底坑中封閉。殉道者與未曾拜獸印者復活，與基督一同作王一千年（第一次的復活）。一千年完了，撒但被釋放出來迷惑列國（歌各和瑪各）圍攻聖城；火從天降吞滅仇敵，魔鬼被扔進燒著硫磺的火湖，晝夜受痛苦直到永永遠遠。',
            notes: '千禧年論戰（Premillennialism vs Amillennialism vs Postmillennialism）是正統內部的釋經多樣性，皆持守基督再來與魔鬼終局滅亡。'
          },
          {
            range: '20:11–15',
            title: '白色大寶座最後審判',
            content: '約翰看見極大的白色寶座與坐寶座者，天地都逃避。死人無論大小都站在寶座前。案卷展開（照各人所行的受審判），另一卷生命冊也展開。海、死亡、陰間交出死人，凡名字沒記在生命冊上的都被扔在火湖裡。死亡和陰間也被扔在火湖裡，這火湖就是「第二次的死」。',
            notes: '生命冊（Book of Life）：唯有藉著基督在十字架上的代贖受恩得救者，名錄其中，完全本乎恩典。'
          }
        ]
      },
      {
        partNo: 8,
        title: '第八部分：新天新地、新耶路撒冷與終末圓滿 (21:1–22:21)',
        chapters: '啟示錄 第 21–22 章',
        summary: '全本聖經六十六卷書的終極圓滿！創世記中失去的伊甸樂園，在基督裡轉化為榮耀完全的新天新地與新耶路撒冷聖城。神親自與人同住，擦去一切眼淚；聖靈與新婦同心呼求：「主耶穌啊，我願祢來！」',
        paragraphs: [
          {
            range: '21:1–8',
            title: '新天新地與神同在的帳幕',
            content: '先前的天地已經過去，海也不再有了（邪惡動盪的淵藪消逝）。聖城新耶路撒冷由神那裡從天而降，預備好了如新婦妝飾整齊等候丈夫。寶座大聲音宣告「神的帳幕在人間！祂要與人同住...神要擦去他們一切的眼淚；不再有死亡，也不再有悲哀、哭號、疼痛」。坐寶座者宣告「看哪，我將一切都更新了！」「得勝的，必承受這些為業：我要作他的神，他要作我的兒子。」',
            notes: '帳幕在人間：出埃及記的會幕同在與約翰福音 1:14「道成肉身住在我們中間」在永恆裡的完全實現。'
          },
          {
            range: '21:9–27',
            title: '聖城新耶路撒冷的榮耀結構',
            content: '城充滿神的榮耀，光輝如同極貴的寶石。城牆高大，有十二個門（刻以色列十二支派名，有十二位天使），城牆有十二根基（刻羔羊十二使徒名）。城是正立方體（長寬高皆四千里 / 12,000 斯他町，與舊約聖殿至聖所形制相同，表明全城皆是神的至聖所）。城牆碧玉，城是精金；城內沒有殿，因主神全能者和羔羊為城的殿；城不用日月光照，因有神榮耀光照，羔羊為城的燈。',
            notes: '以色列十二支派（舊約）與十二使徒（新約）在聖城完全結合，象徵神歷代救贖全體子民的完美成全。'
          },
          {
            range: '22:1–5',
            title: '生命水河、生命樹與永遠作王',
            content: '城內街道當中有一道生命水的河，明亮如水晶，從神和羔羊的寶座流出。河兩邊有生命樹，結十二樣果子，樹葉為醫治萬民。再沒有咒詛。在城裡有神和羔羊的寶座，祂的僕人要事奉祂，也要見祂的面，祂的名字必寫在他們的額上。不再有黑夜，他們要作王直到永永遠遠。',
            notes: '救贖歷史的完全圓滿：創世記失落生命樹 $\\rightarrow$ 啟示錄生命樹豐盛碩果；人被逐出神的面 $\\rightarrow$ 人在聖城面對面事奉神。'
          },
          {
            range: '22:6–21',
            title: '基督切近再來誓言與封卷祝福',
            content: '天使保證「這些話是真實可信的」。主三次親自宣告：「看哪，我必快來！」(22:7, 12, 20)。警告不可在預言上加添或刪減。聖靈和新婦都說：「來！」聽見的人也說：「來！」口渴的白白取生命水喝。使徒約翰代表普世教會回應：「阿們！主耶穌啊，我願祢來！」（亞蘭文 Maranatha）。全書以恩惠祝福作結。',
            notes: 'Maranatha（馬拉拿達）：初代受苦教會的核心問候語，兼具熱切期盼與堅忍守道的信仰宣告。'
          }
        ]
      }
    ],

    // 千禧年四大觀點對照表
        // 四大千禧年神學觀點深度對比
    millenniumViews: [
      {
        id: 'historic_pre',
        name: '歷史前千禧年派 (Historic Premillennialism)',
        advocates: '查斯丁 (Justin Martyr)、愛任紐 (Irenaeus)、George Eldon Ladd、Craig Keener',
        timeline: '教會時代受苦 ➔ 基督榮耀再來 ➔ 信徒復活、基督在地上統治一千年 ➔ 撒但最後叛亂覆滅 ➔ 白色大寶座審判 ➔ 新天新地。',
        features: '不區分秘密被提與降臨，強調教會與以色列在救贖歷史中的連續性，重視神國在地上歷史中的具體彰顯。',
        stages: [
          { name: '基督初臨受死', desc: '十字架代贖' },
          { name: '教會時代受苦', desc: '患難中作見證' },
          { name: '基督榮耀再臨', desc: '聖徒復活相會' },
          { name: '千禧年地上統治', desc: '基督與聖徒掌王權 1,000 年' },
          { name: '末日最後審判', desc: '撒但徹底敗亡' },
          { name: '新天新地永恆', desc: '永世榮美成全' }
        ]
      },
      {
        id: 'dispensational_pre',
        name: '時代論前千禧年派 (Dispensational Premillennialism)',
        advocates: '達秘 (J.N. Darby)、司可福 (C.I. Scofield)、John Walvoord、達拉斯神學院 (DTS) 傳統',
        timeline: '教會時代 ➔ 基督秘密被提教會 ➔ 七年大災難 ➔ 基督與聖徒榮耀降臨 ➔ 猶太民族復興、地上千禧年國度 ➔ 撒但叛亂 ➔ 審判 ➔ 新天新地。',
        features: '嚴格區分以色列與教會的定命，字面解釋舊約國度預言，強調末世大災難與被提的時間次序。',
        stages: [
          { name: '基督初臨恩典', desc: '教會奧祕開啟' },
          { name: '信徒空中被提', desc: '七年大災難前被提' },
          { name: '七年大患難期', desc: '敵基督與普世審判' },
          { name: '基督可見降臨', desc: '橄欖山降臨' },
          { name: '字面千禧年國', desc: '以色列復興作王 1,000 年' },
          { name: '新天新地永恆', desc: '白色大寶座後' }
        ]
      },
      {
        id: 'amillennialism',
        name: '無千禧年派 (Amillennialism)',
        advocates: '奧古斯丁、加爾文、B.B. Warfield、William Hendriksen、G.K. Beale、改革宗/長老會主流',
        timeline: '「一千年」是象徵完全數，指基督初臨復活到再來之間的整個「教會時代」（撒但在此期間受捆綁無法迷惑萬國） ➔ 基督榮耀再來 ➔ 死人一同復活與最後審判 ➔ 新天新地永恆狀態。',
        features: '強調神國在當下以屬靈方式（基督在人心與教會中掌權）已經臨在（Already），在再來時完全成全（Not Yet）。',
        stages: [
          { name: '基督初臨得勝', desc: '捆綁撒但、十字架掌權' },
          { name: '屬靈千禧年國', desc: '現在教會時代＝千禧年' },
          { name: '末期短暫背道', desc: '撒但暫時被釋放' },
          { name: '基督榮耀再臨', desc: '唯一一次降臨' },
          { name: '普世總復活審判', desc: '綿羊山羊分別' },
          { name: '新天新地永恆', desc: '永恆神國成全' }
        ]
      },
      {
        id: 'postmillennialism',
        name: '後千禧年派 (Postmillennialism)',
        advocates: '清教徒傳統 (Puritans)、約拿單·愛德華茲 (Jonathan Edwards)、Loraine Boettner',
        timeline: '教會時代福音廣傳 ➔ 聖靈大澆灌引發普世復興、地上進入公義和平的黃金時代（千禧年） ➔ 基督降臨 ➔ 最後審判與新天新地。',
        features: '對福音改變社會文化抱持高度樂觀，強調大使命的歷史性得勝，多在歷史大復興時期興盛。',
        stages: [
          { name: '基督初臨開國', desc: '福音種子灑下' },
          { name: '福音漸進征服', desc: '聖靈澆灌普世復興' },
          { name: '地上黃金千禧', desc: '公義和平遍滿全地' },
          { name: '基督凱旋再臨', desc: '接納已得勝國度' },
          { name: '終局最後審判', desc: '公義裁決' },
          { name: '新天新地永恆', desc: '榮耀極致' }
        ]
      }
    ],
    // 權威註釋書與學者參考庫
    bibliography: [
      {
        category: '經典福音派 / 改革宗權威註釋',
        books: [
          {
            author: 'G. K. Beale',
            title: 'The Book of Revelation (NIGTC, Eerdmans, 1999)',
            desc: '當代最具深度之希臘文聖經神學註釋書，以舊約聖經互文性（Intertextuality）研究著稱。'
          },
          {
            author: 'William Hendriksen',
            title: 'More Than Conquerors: An Interpretation of the Book of Revelation（中譯：《得勝有餘》，道聲）',
            desc: '理想派重疊論經典權威之作，結構嚴謹，充滿牧者安慰與得勝信息。'
          },
          {
            author: 'Richard Bauckham',
            title: 'The Theology of the Book of Revelation（中譯：《啟示錄神學》，基道）',
            desc: '啟示錄基督論與神論的巔峰神學專著，精闢剖析羔羊敬拜與見證人神學。'
          },
          {
            author: 'Robert H. Mounce',
            title: 'The Book of Revelation (NICNT, Eerdmans, 1997)',
            desc: '兼顧學術嚴謹性與經文清晰脈絡的福音派標準註釋權威。'
          },
          {
            author: 'Grant R. Osborne',
            title: 'Revelation (BECNT, Baker Academic, 2002)',
            desc: '全方位整合歷史文體、文法、神學與當代應用的重量級巨著。'
          }
        ]
      },
      {
        category: '歷史前千禧年 / 正統五旬與靈恩派學者',
        books: [
          {
            author: 'Craig S. Keener',
            title: 'Revelation (NIVAC, Zondervan, 2000)',
            desc: '著名五旬/靈恩派福音學者，古代歷史文獻考證極其詳實，兼顧現代生活實踐。'
          },
          {
            author: 'George Eldon Ladd',
            title: 'A Commentary on the Revelation of John (Eerdmans, 1972)',
            desc: '歷史前千禧年派經典巨著，論證嚴密，奠定福音派國度已臨未臨架構。'
          },
          {
            author: 'Gordon D. Fee',
            title: 'Revelation (New Covenant Commentary Series, Cascade, 2011)',
            desc: '頂尖靈恩派新約學者撰寫，強調聖靈工作與初代教會敬拜處境。'
          }
        ]
      },
      {
        category: '華人正統神學家專著',
        books: [
          {
            author: '孫寶玲',
            title: '《啟示錄：宣講與註釋》（香港天道書樓）',
            desc: '深入剖析羅馬帝國政治經濟處境與教會先知性見證的華人註釋巨著。'
          },
          {
            author: '莊祖鯤',
            title: '《說律法、話終末——加拉太書與啟示錄的研讀》（校園書房）',
            desc: '宏觀視野與救贖歷史的深刻整合，分析清晰透徹。'
          },
          {
            author: '賴若瀚',
            title: '《啟示錄逐節研讀》（聖言資源）',
            desc: '結構嚴密、歸納釋經法與講道應用的典範之作。'
          }
        ]
      }
    ]
  };

  /**
   * 渲染啟示錄深度導論與全書釋義的主面板 HTML
   */
  /**
   * 渲染啟示錄深度導論與全書釋義的主面板 HTML
   */
  window.renderRevelationStudyGuideHtml = function (activeSubSection) {
    var g = window.BIBLIA_REVELATION_GUIDE;
    if (!g) return '<div class="ref-empty-state">啟示錄導論資料庫加載中...</div>';

    var curSub = activeSubSection || 'all';

    var html = '<div class="rev-guide-container">';

    // 頂部 Hero Banner
    html += '<div class="rev-guide-hero">' +
      '<div class="rev-hero-badge">👑 正統基督新教 · 福音派 · 靈恩派 · 正統神學院</div>' +
      '<h2 class="rev-guide-title">《啟示錄》深度神學導論與全書逐段釋義</h2>' +
      '<p class="rev-guide-subtitle">' + g.meta.greekTitle + ' · 萬王之王終極得勝 · 三一神寶座主權 · 救贖歷史終末成全</p>' +
      '<div class="rev-meta-chips">' +
        '<span class="rev-meta-chip">✍️ <strong>作者：</strong>' + g.meta.author + '</span>' +
        '<span class="rev-meta-chip">📅 <strong>年代：</strong>' + g.meta.date + '</span>' +
        '<span class="rev-meta-chip">🎯 <strong>書卷定位：</strong>新約第 27 卷 / 聖經第 66 卷終極封卷</span>' +
      '</div>' +
      '<div class="rev-hero-actions">' +
        '<button type="button" class="btn btn-primary go-book-reader-btn" data-bookno="66" data-chap="1">' +
          '📖 開啟《啟示錄》第 1 章逐字對照閱讀器</button>' +
        '<button type="button" class="btn btn-secondary back-to-intros-btn">' +
          '📚 返回 66 卷聖經簡介列表</button>' +
      '</div>' +
    '</div>';

    // 核心鑰節卡片
    html += '<div class="rev-card keyverses-card">' +
      '<h3 class="rev-card-title">🔑 啟示錄核心鑰節（Golden Verses）</h3>' +
      '<div class="rev-keyverses-grid">';
    g.meta.keyVerses.forEach(function (kv) {
      html += '<div class="rev-keyverse-item">' +
        '<div class="rev-kv-ref">' + kv.ref + '</div>' +
        '<div class="rev-kv-text">「' + kv.text + '」</div>' +
      '</div>';
    });
    html += '</div></div>';

    // 導航選單 Pills
    html += '<div class="rev-subnav-bar" id="revGuideNavPills">' +
      '<button type="button" class="rev-nav-pill ' + (curSub === 'all' ? 'active' : '') + '" data-revtab="all">📑 完整研經全覽</button>' +
      '<button type="button" class="rev-nav-pill ' + (curSub === 'charts' ? 'active' : '') + '" data-revtab="charts">📊 審判圖表與架構</button>' +
      '<button type="button" class="rev-nav-pill ' + (curSub === 'churches' ? 'active' : '') + '" data-revtab="churches">⛪ 七教會郵路與診斷表</button>' +
      '<button type="button" class="rev-nav-pill ' + (curSub === 'intro' ? 'active' : '') + '" data-revtab="intro">🏛️ 導論與文體</button>' +
      '<button type="button" class="rev-nav-pill ' + (curSub === 'approaches' ? 'active' : '') + '" data-revtab="approaches">⚖️ 四大解經進路</button>' +
      '<button type="button" class="rev-nav-pill ' + (curSub === 'traditions' ? 'active' : '') + '" data-revtab="traditions">🔥 福音派與靈恩派亮光</button>' +
      '<button type="button" class="rev-nav-pill ' + (curSub === 'heresy' ? 'active' : '') + '" data-revtab="heresy">🛡️ 正統界線 vs 異端辨析</button>' +
      '<button type="button" class="rev-nav-pill ' + (curSub === 'exposition' ? 'active' : '') + '" data-revtab="exposition">📜 二十二章逐段深度釋義</button>' +
      '<button type="button" class="rev-nav-pill ' + (curSub === 'millennium' ? 'active' : '') + '" data-revtab="millennium">⏳ 四大千禧年觀點</button>' +
      '<button type="button" class="rev-nav-pill ' + (curSub === 'biblio' ? 'active' : '') + '" data-revtab="biblio">📚 權威註釋書目</button>' +
    '</div>';

    // ==========================================
    // 【新增組件 1】宏觀審判結構圖表 (七印、七號、七碗)
    // ==========================================
    if (curSub === 'all' || curSub === 'charts') {
      html += '<section class="rev-section" id="revSecCharts">' +
        '<h3 class="rev-sec-heading"><span class="sec-icon">📊</span> 七印、七號、七碗結構遞進與重疊對照全景圖</h3>' +
        '<p class="rev-section-lead">' + g.sevenJudgments.overview + '</p>' +

        // 審判強度遞進指示條
        '<div class="rev-intensity-bar">' +
          '<div class="intensity-col intensity-seals"><span class="badge-scope">1/4 範圍</span> <strong>七印審判</strong>：普世歷史趨勢與受苦警告</div>' +
          '<div class="intensity-arrow">➔</div>' +
          '<div class="intensity-col intensity-trumpets"><span class="badge-scope">1/3 範圍</span> <strong>七號審判</strong>：自然生態與背道世界警告</div>' +
          '<div class="intensity-arrow">➔</div>' +
          '<div class="intensity-col intensity-bowls"><span class="badge-scope">100% 全然傾倒</span> <strong>七碗審判</strong>：神公義忿怒的終極傾倒</div>' +
        '</div>' +

        // 三大審判系列平行並排卡片
        '<div class="rev-judgments-grid">';

      g.sevenJudgments.series.forEach(function (ser) {
        html += '<div class="rev-judgment-card series-' + ser.id + '">' +
          '<div class="judgment-card-head">' +
            '<h4 class="judgment-series-title">' + ser.title + '</h4>' +
            '<div class="judgment-meta-scope"><strong>⚡ 審判強度：</strong>' + ser.scope + '</div>' +
            '<div class="judgment-meta-agent"><strong>👤 執行實體：</strong>' + ser.agent + '</div>' +
            '<p class="judgment-meta-char">' + ser.character + '</p>' +
          '</div>' +
          '<div class="judgment-items-list">';

        ser.items.forEach(function (it) {
          var isInterlude = (it.no === '插曲' || it.no === '警語');
          html += '<div class="judgment-item-row ' + (isInterlude ? 'item-interlude' : '') + '">' +
            '<span class="j-badge ' + (isInterlude ? 'badge-interlude' : '') + '">' + it.no + '</span>' +
            '<div class="j-content">' +
              '<div class="j-title"><strong>' + it.name + '</strong> <small class="text-mute">(' + it.ref + ')</small></div>' +
              '<div class="j-focus">' + it.focus + '</div>' +
            '</div>' +
          '</div>';
        });

        html += '</div></div>';
      });

      html += '</div>' +

        // 天體敬拜層次圖解
        '<div class="rev-throne-liturgy-box" style="margin-top:28px;">' +
          '<div class="throne-box-header">' +
            '<h4 class="throne-box-title"><span class="sec-icon">🕊️</span> ' + g.throneLiturgy.title + '</h4>' +
            '<p class="throne-box-desc">' + g.throneLiturgy.desc + '</p>' +
          '</div>' +
          '<div class="throne-layers-track">';

      g.throneLiturgy.layers.forEach(function (lay, idx) {
        html += '<div class="throne-layer-card layer-rank-' + (idx + 1) + '">' +
          '<div class="throne-layer-top">' +
            '<span class="throne-rank-tag">' + lay.rank + '</span>' +
            '<span class="throne-ref-tag">' + lay.ref + '</span>' +
          '</div>' +
          '<h5 class="throne-layer-name">' + lay.name + '</h5>' +
          '<div class="throne-symbol"><strong>象徵異象：</strong>' + lay.symbol + '</div>' +
          '<div class="throne-meaning"><strong>神學本質：</strong>' + lay.meaning + '</div>' +
        '</div>';
      });

      html += '</div></div>' +
      '</section>';
    }

    // ==========================================
    // 【新增組件 2】小亞細亞七教會郵路與屬靈診斷全表
    // ==========================================
    if (curSub === 'all' || curSub === 'churches') {
      html += '<section class="rev-section" id="revSecChurches">' +
        '<h3 class="rev-sec-heading"><span class="sec-icon">⛪</span> 小亞細亞七教會環形郵路地理動線與屬靈診斷全圖表</h3>' +
        '<p class="rev-section-lead">使徒約翰受聖靈感動從拔摩島寄發信件，依照古代羅馬帝國小亞細亞行省的天然環形郵政驛道依序造訪七大教會。七教會既是公元一世紀的具體教會，亦代表歷世歷代基督教會面臨的七種屬靈光景與試煉。</p>' +

        // 郵路路線站點視覺圖
        '<div class="rev-route-flow" role="region" aria-label="七教會郵路進程">' +
          '<div class="route-origin"><span class="origin-icon">🏝️</span> 拔摩島 (Patmos)</div>' +
          '<div class="route-arrow">➔</div>' +
          '<div class="route-station"><span class="station-num">1</span> 以弗所</div>' +
          '<div class="route-arrow">➔</div>' +
          '<div class="route-station"><span class="station-num">2</span> 士每拿</div>' +
          '<div class="route-arrow">➔</div>' +
          '<div class="route-station"><span class="station-num">3</span> 別迦摩</div>' +
          '<div class="route-arrow">➔</div>' +
          '<div class="route-station"><span class="station-num">4</span> 推雅推喇</div>' +
          '<div class="route-arrow">➔</div>' +
          '<div class="route-station"><span class="station-num">5</span> 撒狄</div>' +
          '<div class="route-arrow">➔</div>' +
          '<div class="route-station"><span class="station-num">6</span> 非拉鐵非</div>' +
          '<div class="route-arrow">➔</div>' +
          '<div class="route-station"><span class="station-num">7</span> 老底嘉</div>' +
        '</div>' +

        // 七教會完整診斷大表格
        '<div class="rev-churches-table-wrap">' +
          '<table class="rev-churches-table">' +
            '<thead>' +
              '<tr>' +
                '<th style="width:12%;">教會與地理位置</th>' +
                '<th style="width:14%;">基督顯現自稱</th>' +
                '<th style="width:13%;">屬靈狀態診斷</th>' +
                '<th style="width:15%;">正面稱讚 (Commendation)</th>' +
                '<th style="width:15%;">責備與危機 (Critique)</th>' +
                '<th style="width:15%;">警戒與勸勉 (Counsel)</th>' +
                '<th style="width:16%;">給得勝者應許 (Promise)</th>' +
              '</tr>' +
            '</thead>' +
            '<tbody>';

      g.sevenChurches.forEach(function (c) {
        html += '<tr>' +
          '<td class="td-church-name">' +
            '<span class="church-num-badge">#' + c.no + '</span>' +
            '<strong>' + c.nameZh + '</strong><br>' +
            '<small class="text-mute">' + c.nameEn + '</small><br>' +
            '<span class="church-route-desc">' + c.routeOrder + '</span>' +
          '</td>' +
          '<td class="td-christ-title">' + c.christTitle + '</td>' +
          '<td class="td-state">' +
            '<span class="badge-state badge-' + c.stateType + '">' + c.spiritualState + '</span>' +
          '</td>' +
          '<td class="td-commend">' + c.commendation + '</td>' +
          '<td class="td-critique">' + c.critique + '</td>' +
          '<td class="td-counsel">' + c.counsel + '</td>' +
          '<td class="td-promise"><strong>' + c.promise + '</strong></td>' +
        '</tr>';
      });

      html += '</tbody></table></div></section>';
    }

    // 1. 導論與文體特徵
    if (curSub === 'all' || curSub === 'intro') {
      html += '<section class="rev-section" id="revSecIntro">' +
        '<h3 class="rev-sec-heading"><span class="sec-icon">🏛️</span> 啟示錄文體特徵與歷史處境</h3>' +
        '<div class="rev-card">' +
          '<h4 class="rev-inner-title">一、三重文體的神聖交織</h4>' +
          '<div class="rev-genres-grid">';
      g.introduction.genre.forEach(function (item) {
        html += '<div class="genre-box">' +
          '<div class="genre-badge">' + item.type + '</div>' +
          '<p class="genre-desc">' + item.desc + '</p>' +
        '</div>';
      });
      html += '</div>' +
          '<h4 class="rev-inner-title" style="margin-top:18px;">二、歷史背景與拔摩島處境</h4>' +
          '<p class="rev-prose">' + g.introduction.historicalContext + '</p>' +
        '</div>' +
      '</section>';
    }

    // 2. 四大解經傳統
    if (curSub === 'all' || curSub === 'approaches') {
      html += '<section class="rev-section" id="revSecApproaches">' +
        '<h3 class="rev-sec-heading"><span class="sec-icon">⚖️</span> 正統神學界四大解經進路綜合矩陣</h3>' +
        '<div class="rev-approaches-grid">';
      g.approaches.forEach(function (app) {
        html += '<div class="rev-approach-card">' +
          '<div class="approach-head">' +
            '<h4 class="approach-name">' + app.name + '</h4>' +
            '<div class="approach-scholars"><strong>代表學者：</strong>' + app.representatives + '</div>' +
          '</div>' +
          '<div class="approach-body">' +
            '<div class="approach-block"><strong>🎯 核心詮釋觀點：</strong>' + app.coreView + '</div>' +
            '<div class="approach-block eval-block"><strong>🔍 正統神學評價：</strong>' + app.evaluation + '</div>' +
          '</div>' +
        '</div>';
      });
      html += '</div></section>';
    }

    // 3. 福音派與靈恩派互補亮光
    if (curSub === 'all' || curSub === 'traditions') {
      html += '<section class="rev-section" id="revSecTraditions">' +
        '<h3 class="rev-sec-heading"><span class="sec-icon">🔥</span> 福音派與正統靈恩派的互補神學亮光</h3>' +
        '<div class="rev-traditions-grid">';
      g.traditions.forEach(function (trad) {
        html += '<div class="rev-trad-card">' +
          '<h4 class="trad-school-title">' + trad.school + '</h4>' +
          '<div class="trad-scholars">👥 核心代表：' + trad.scholars + '</div>' +
          '<ul class="trad-points-list">';
        trad.points.forEach(function (pt) {
          html += '<li>' + pt.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') + '</li>';
        });
        html += '</ul></div>';
      });
      html += '</div></section>';
    }

    // 4. 正統神學界線 vs 異端辨析表
    if (curSub === 'all' || curSub === 'heresy') {
      html += '<section class="rev-section" id="revSecHeresy">' +
        '<h3 class="rev-sec-heading"><span class="sec-icon">🛡️</span> 正統神學防線 vs. 啟示錄常見異端對照防禦表</h3>' +
        '<div class="rev-heresy-table-wrap">' +
          '<table class="rev-heresy-table">' +
            '<thead>' +
              '<tr>' +
                '<th>經文主題</th>' +
                '<th>正統福音派 / 靈恩派共識</th>' +
                '<th>異端常見扭曲（新天地 / 東方閃電 / 耶證）</th>' +
                '<th>正統聖經辨析關鍵</th>' +
              '</tr>' +
            '</thead>' +
            '<tbody>';
      g.heresyDefense.forEach(function (h) {
        html += '<tr>' +
          '<td><strong>' + h.topic + '</strong><br><small class="text-mute">(' + h.ref + ')</small></td>' +
          '<td class="td-orthodox"><span class="badge-orthodox">✅ 正統</span> ' + h.orthodox + '</td>' +
          '<td class="td-heresy"><span class="badge-heresy">⚠️ 異端</span> ' + h.heresy + '</td>' +
          '<td class="td-defense"><span class="badge-defense">🛡️ 辨析</span> ' + h.defense + '</td>' +
        '</tr>';
      });
      html += '</tbody></table></div></section>';
    }

    // 5. 二十二章逐段深度釋義
    if (curSub === 'all' || curSub === 'exposition') {
      html += '<section class="rev-section" id="revSecExposition">' +
        '<h3 class="rev-sec-heading"><span class="sec-icon">📜</span> 全書二十二章八大段落深度逐段釋義</h3>' +
        '<div class="rev-parts-list">';

      g.sections.forEach(function (sec) {
        html += '<div class="rev-part-card">' +
          '<div class="rev-part-head">' +
            '<div class="rev-part-badge">Part ' + sec.partNo + '</div>' +
            '<h4 class="rev-part-title">' + sec.title + '</h4>' +
            '<div class="rev-part-chapters">' + sec.chapters + '</div>' +
          '</div>' +
          '<div class="rev-part-summary">' + sec.summary + '</div>' +
          '<div class="rev-paragraphs-list">';

        sec.paragraphs.forEach(function (p) {
          html += '<div class="rev-para-item">' +
            '<div class="rev-para-head">' +
              '<span class="rev-para-range">' + p.range + '</span>' +
              '<h5 class="rev-para-title">' + p.title + '</h5>' +
            '</div>' +
            '<p class="rev-para-content">' + p.content + '</p>' +
            '<div class="rev-para-notes"><strong>💡 補充神學資料與背景：</strong>' + p.notes + '</div>' +
          '</div>';
        });

        html += '</div>' +
          '<div class="rev-part-footer">' +
            '<button type="button" class="btn btn-sm btn-primary go-book-reader-btn" data-bookno="66" data-chap="' + sec.partNo + '">' +
              '📖 在閱讀器中研讀本段經文</button>' +
          '</div>' +
        '</div>';
      });

      html += '</div></section>';
    }

    // 6. 四大千禧年觀點深度對比 (含視覺化時間線)
    if (curSub === 'all' || curSub === 'millennium') {
      html += '<section class="rev-section" id="revSecMillennium">' +
        '<h3 class="rev-sec-heading"><span class="sec-icon">⏳</span> 啟示錄第二十章：四大千禧年神學觀點深度對照</h3>' +
        '<div class="rev-millennium-grid">';

      g.millenniumViews.forEach(function (mv) {
        html += '<div class="rev-mill-card">' +
          '<h4 class="mill-name">' + mv.name + '</h4>' +
          '<div class="mill-advocates">👥 <strong>代表學者 / 傳統：</strong>' + mv.advocates + '</div>' +
          '<div class="mill-timeline"><strong>📈 文字進程：</strong><p>' + mv.timeline + '</p></div>' +
          '<div class="mill-features"><strong>🔑 釋經重點：</strong>' + mv.features + '</div>';

        // 視覺化時間軸節點
        if (mv.stages && mv.stages.length) {
          html += '<div class="mill-visual-track" role="region" aria-label="' + mv.name + ' 時間軸">' +
            '<div class="mill-track-label"><i class="fas fa-stream"></i> 救贖歷史進程圖解：</div>' +
            '<div class="mill-nodes-row">';
          mv.stages.forEach(function (st, sIdx) {
            html += '<div class="mill-node-item">' +
              '<div class="mill-node-dot">' + (sIdx + 1) + '</div>' +
              '<div class="mill-node-name">' + st.name + '</div>' +
              '<div class="mill-node-desc">' + st.desc + '</div>' +
            '</div>';
            if (sIdx < mv.stages.length - 1) {
              html += '<div class="mill-node-connector">➔</div>';
            }
          });
          html += '</div></div>';
        }

        html += '</div>';
      });

      html += '</div></section>';
    }

    // 7. 權威註釋書與學術參考書目
    if (curSub === 'all' || curSub === 'biblio') {
      html += '<section class="rev-section" id="revSecBiblio">' +
        '<h3 class="rev-sec-heading"><span class="sec-icon">📚</span> 正統神學院權威註釋書與學者參考庫</h3>' +
        '<div class="rev-biblio-groups">';
      g.bibliography.forEach(function (bg) {
        html += '<div class="rev-biblio-card">' +
          '<h4 class="biblio-group-title">' + bg.category + '</h4>' +
          '<div class="biblio-books-list">';
        bg.books.forEach(function (bk) {
          html += '<div class="biblio-book-item">' +
            '<div class="bk-author">✍️ ' + bk.author + '</div>' +
            '<div class="bk-title">《' + bk.title + '》</div>' +
            '<div class="bk-desc">' + bk.desc + '</div>' +
          '</div>';
        });
        html += '</div></div>';
      });
      html += '</div></section>';
    }

    html += '</div>'; // End rev-guide-container

    return html;
  };

})();
