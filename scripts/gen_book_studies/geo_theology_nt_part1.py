# -*- coding: utf-8 -*-
"""
Biblical Geography Maps & Theological Matrix Datasets for New Testament Part 1 (Books 40-53).
Books covered:
40: Matthew (馬太福音)
41: Mark (馬可福音)
42: Luke (路加福音)
43: John (約翰福音)
44: Acts (使徒行傳)
45: Romans (羅馬書)
46: 1 Corinthians (哥林多前書)
47: 2 Corinthians (哥林多後書)
48: Galatians (加拉太書)
49: Ephesians (以弗所書)
50: Philippians (腓立比書)
51: Colossians (歌羅西書)
52: 1 Thessalonians (帖撒羅尼迦前書)
53: 2 Thessalonians (帖撒羅尼迦後書)
"""

GEO_THEOLOGY_NT_PART1 = {
    40: {
        "geographyMap": {
            "mapTitle": "馬太福音天國君王彌賽亞事奉動線與受難升天地理圖",
            "mapType": "itinerary",
            "keyRegions": ["猶大伯利恆與埃及 (Bethlehem & Egypt)", "加利利海周邊 (Sea of Galilee)", "凱撒利亞腓立比 (Caesarea Philippi)", "耶路撒冷與橄欖山 (Jerusalem)"],
            "routeStages": [
                {"stopNo": 1, "location": "伯利恆至埃及地 (Bethlehem to Egypt)", "region": "猶大山地至尼羅河三角洲", "event": "彌賽亞降生伯利恆應驗先知預言；東方博士朝拜；約瑟攜全家逃往埃及躲避希律屠殺", "ref": "太 2:1-23"},
                {"stopNo": 2, "location": "約旦河與猶太曠野 (Jordan & Judean Wilderness)", "region": "死海以北約旦裂谷", "event": "耶穌受施洗約翰的浸禮天開聖靈降臨；聖靈引至曠野四十天擊退撒但三重試探", "ref": "太 3:13-4:11"},
                {"stopNo": 3, "location": "加利利海與迦百農 (Capernaum & Sea of Galilee)", "region": "北疆加利利湖區", "event": "定居迦百農宣講「天國近了應當悔改」；登山寶訓頒布天國憲章；施行醫病趕鬼神蹟", "ref": "太 4:12-15:20"},
                {"stopNo": 4, "location": "凱撒利亞腓立比黑門山麓 (Caesarea Philippi)", "region": "加利利極北境", "event": "彼得認信「你是基督，是永生神的兒子」；耶穌宣告建造教會並首次預言受難復活", "ref": "太 16:13-28"},
                {"stopNo": 5, "location": "耶路撒冷聖殿、客西馬尼與橄欖山 (Jerusalem & Olivet)", "region": "猶大心臟首都", "event": "君王騎驢進聖城；受難週潔淨聖殿；客西馬尼順服祈禱；十字架斷氣復活；加利利山上頒大使命", "ref": "太 21:1-28:20"}
            ],
            "strategicNote": "馬太福音以地理路線凸顯「應驗與君王權柄」：從伯利恆（大衛家鄉）到加利利（外邦人的加利利得見大光），再一路走向耶路撒冷受難，最後在加利利高山頒發天上地下一切權柄的普世大使命。"
        },
        "theologyMatrixChart": {
            "chartTitle": "馬太福音「舊約預言應驗—大衛君王—基督天國權柄」神學對照矩陣",
            "comparisonRows": [
                {"dimension": "君王受膏與權柄傳承", "typeShadow": "所羅門與大衛王朝：地上受膏君王登基，雖盛極一時卻終因犯罪而使王權傾覆分裂 (撒下 7:12-16, 王上 11:1-11)", "antitypeChrist": "大衛子孫永遠的彌賽亞君王：基督生於大衛城，掌管永不敗壞的天國寶座，擁有天上地下一切權柄 (太 1:1, 28:18)", "scriptureSupport": "太 1:1 / 撒下 7:13, 太 28:18"},
                {"dimension": "頒布律法與登山寶訓", "typeShadow": "西奈山摩西頒十誡：雷轟閃電中頒布石版律法，百姓戰兢退後，律法指出人之罪咎 (出 19:16-20:17)", "antitypeChrist": "加利利山登山寶訓：基督坐在山上以神聖第一人稱「我告訴你們」成全律法，將公義銘刻信徒心版 (太 5:17-48)", "scriptureSupport": "太 5:17-22 / 出 20:1-17"},
                {"dimension": "出埃及與神子經歷", "typeShadow": "以色列全族出埃及：神稱以色列為長子從埃及召出來，在曠野四十年發怨言失敗 (出 4:22, 何 11:1)", "antitypeChrist": "神子避難埃及並勝過試探：「我從埃及召出我的兒子來」，基督在曠野禁食四十天以真理全勝撒但 (太 2:15, 4:1-11)", "scriptureSupport": "太 2:15 / 何 11:1, 太 4:1-11"}
            ],
            "christologicalCenter": "馬太福音啟示耶穌基督是舊約指望的集大成者——大衛之子、萬王之王。祂不是藉地上武力爭勝，而是以十架順服完成救贖，並差遣門徒使萬民作祂門徒。"
        }
    },
    41: {
        "geographyMap": {
            "mapTitle": "馬可福音受苦僕人事奉行蹤與十架進軍地理圖",
            "mapType": "itinerary",
            "keyRegions": ["加利利湖畔鄉村 (Galilee Towns)", "外邦推羅西頓與低加波利 (Tyre, Sidon, Decapolis)", "耶利哥行道 (Road of Jericho)", "耶路撒冷各各他 (Golgotha)"],
            "routeStages": [
                {"stopNo": 1, "location": "約旦河受浸至加利利海岸 (Jordan to Sea of Galilee)", "region": "約旦裂谷至加利利湖", "event": "耶穌立時受浸、曠野受試探；隨即呼召彼得、安得烈等四漁夫，在迦百農會堂趕逐污鬼", "ref": "可 1:9-39"},
                {"stopNo": 2, "location": "加利利各城鎮村莊 (Villages of Galilee)", "region": "加利利內陸與沿岸", "event": "潔淨大痲瘋、醫治癱子赦罪；在海面行走、平靜風暴；行五餅二魚神蹟，馬不停蹄服事百姓", "ref": "可 2:1-6:56"},
                {"stopNo": 3, "location": "外邦境界：推羅、西頓、低加波利 (Gentile Borderlands)", "region": "腓尼基沿海與約旦河東", "event": "跨越猶太邊界，醫治迦南婦人被鬼附女兒；在低加波利醫好耳聾舌結之人，行四千人吃飽神蹟", "ref": "可 7:24-8:21"},
                {"stopNo": 4, "location": "行路上耶路撒冷的猶太山道 (Road through Jericho to Zion)", "region": "猶大山地爬升道", "event": "在行路中三度預言受難復活，門徒卻爭論誰為大；在耶利哥醫好瞎子巴底買，表明人子來非受服事乃是服事人", "ref": "可 8:27-10:52"},
                {"stopNo": 5, "location": "耶路撒冷客西馬尼至各各他 (Gethsemane to Golgotha)", "region": "耶路撒冷城內外", "event": "最後晚餐設立新約；客西馬尼血汗禱告；被公會定罪；各各他捨命作萬人贖價；百夫長認信「這人真是神的兒子」", "ref": "可 14:12-16:20"}
            ],
            "strategicNote": "馬可福音節奏極其緊湊，全書使用了40多次「立時」（immediately）。前半部在加利利與外邦邊陲神蹟事奉，後半部聚焦於「行路走向各各他」，凸顯神子降卑為奴僕服事人並捨命作贖價的偉大行徑。"
        },
        "theologyMatrixChart": {
            "chartTitle": "馬可福音「受苦僕人—捨命贖價—神子基督」神學對照矩陣",
            "comparisonRows": [
                {"dimension": "事奉模式與僕人姿態", "typeShadow": "利未僕役與先知事奉：地上的僕人服事常受限於體力軟弱與私心，無法完全擔當人靈魂深處重擔 (民 8:14-26)", "antitypeChrist": "神聖受苦僕人：基督不辭勞苦服事無助人群，「人子來不是要受人的服事，乃是要服事人，並且要捨命作多人的贖價」 (可 10:45)", "scriptureSupport": "可 10:45 / 賽 42:1-4"},
                {"dimension": "彌賽亞的受難與代贖", "typeShadow": "以賽亞書受苦義僕：預言祂被藐視、被厭棄，為我們的過犯受害，為我們的罪孽壓傷 (賽 53:3-5)", "antitypeChrist": "十架上的順服贖罪祭：基督在各各他承擔全人類罪孽被釘十字架，殿裡幔子從上到下裂為兩半，開闢通天之路 (可 15:37-38)", "scriptureSupport": "可 15:37-38 / 賽 53:5, 10"},
                {"dimension": "屬世掌權與屬天領袖觀", "typeShadow": "外邦君王操權壓制：地上的外邦元首以權力高高在上壓制統治百姓，爭奪世俗高位 (可 10:42)", "antitypeChrist": "降卑為僕者為大：在天國的價值觀中，誰願為首就必作眾人的僕人，基督親自作門徒的榜樣與洗腳救主 (可 10:43-44, 約 13:14-15)", "scriptureSupport": "可 10:43-44 / 路 22:25-27"}
            ],
            "christologicalCenter": "馬可福音展現無懈可擊的行動力：基督是神的受苦僕人，以完全的降卑與甘心捨命，打破了人間追求名利的權力體系，彰顯真正的神子尊貴。"
        }
    },
    42: {
        "geographyMap": {
            "mapTitle": "路加福音完美人子長征耶路撒冷救贖動線圖",
            "mapType": "itinerary",
            "keyRegions": ["猶大山地與拿撒勒 (Judean Hills & Nazareth)", "加利利海岸城鄉 (Galilee Villages)", "撒瑪利亞行路旅程 (Samaria Travel Narrative)", "耶路撒冷與以馬忤斯 (Jerusalem & Emmaus)"],
            "routeStages": [
                {"stopNo": 1, "location": "猶大山地、拿撒勒與伯利恆 (Nazareth to Bethlehem)", "region": "猶大山嶺與加利利谷地", "event": "天使向馬利亞報喜；馬利亞造訪以利沙伯；耶穌降生馬槽牧羊人夜間朝拜；十二歲在聖殿坐教師中間", "ref": "路 1:26-2:52"},
                {"stopNo": 2, "location": "拿撒勒會堂與加利利湖畔 (Nazareth Synagogue & Lake)", "region": "加利利山區與加利利海", "event": "宣告以賽亞書聖靈降臨禧年使命「傳福音給貧窮人」；在加利利治百病、憐憫拿因城寡婦使獨子復活", "ref": "路 4:16-9:50"},
                {"stopNo": 3, "location": "長途旅行敘事：經撒瑪利亞南下 (The Great Travel Narrative)", "region": "撒瑪利亞與約旦河谷中途", "event": "「耶穌定意面向耶路撒冷去」；講述好撒瑪利亞人、浪子回頭、財主與拉撒路等失喪得尋救恩比喻", "ref": "路 9:51-19:27"},
                {"stopNo": 4, "location": "耶利哥城至耶路撒冷城門 (Jericho to Jerusalem)", "region": "耶利哥平原攀升至猶大山脊", "event": "在耶利哥尋找拯救稅吏撒該；為耶路撒冷哀哭哀嘆城必遭圍困；進入聖殿天天教導百姓", "ref": "路 19:1-48"},
                {"stopNo": 5, "location": "客西馬尼、公會、各各他與以馬忤斯 (Jerusalem & Emmaus)", "region": "受難地與橄欖山升天處", "event": "最後晚餐洗滌門徒；公會與彼拉多受審；各各他饒恕仇敵、拯救十架強盜；復活在以馬忤斯路上同走解經；伯大尼升天", "ref": "路 22:1-24:53"}
            ],
            "strategicNote": "路加福音著名的「旅行敘事」（Travel Narrative, 9:51-19:27）佔據全書三分之一篇幅，地理焦點單一而堅決地朝向耶路撒冷，象徵神子有目的地走向受難與救恩之頂峰，尋找拯救失喪的人。"
        },
        "theologyMatrixChart": {
            "chartTitle": "路加福音「完美人子—普世救恩—基督憐憫」神學對照矩陣",
            "comparisonRows": [
                {"dimension": "人類始祖與完美末後亞當", "typeShadow": "首先的亞當：墮落犯罪使罪與死亡入了世界，全人類在罪孽中沉淪與神隔絕 (創 3:1-19, 路 3:38)", "antitypeChrist": "末後的亞當完美人子：路加家譜上溯至亞當，耶穌在人性的每一個試探中全然無罪得勝，恢復神的完美形像 (路 3:23-38, 羅 5:14-19)", "scriptureSupport": "路 3:38 / 創 3:6, 羅 5:18"},
                {"dimension": "禧年釋放與邊緣群體拯救", "typeShadow": "利未記禧年制度：每五十年宣告自由釋放奴僕、歸還土地，但常因人的貪婪未能切實貫徹 (利 25:8-17)", "antitypeChrist": "天國神聖恩年降臨：基督親自受膏，報告被擄的得釋放、瞎眼的得看見、受壓制的得自由，尋找拯救稅吏、娼妓、外邦與貧寒者 (路 4:18-19, 19:10)", "scriptureSupport": "路 4:18-19 / 賽 61:1-2, 利 25:10"},
                {"dimension": "以馬忤斯十架與經卷通曉", "typeShadow": "舊約摩西與眾先知預言：零散寫於律法、先知與詩篇中的彌賽亞受苦印記，歷代猶太人不得其解 (路 24:25-27)", "antitypeChrist": "復活救主親自解經開竅：基督在路上從摩西和眾先知起，凡經上指著自己的話都給門徒講解明白，使人心裡火熱 (路 24:27, 44-45)", "scriptureSupport": "路 24:27 / 詩 22:1, 賽 53:1"}
            ],
            "christologicalCenter": "路加福音呈現最溫暖、最具人性關懷的救主耶穌：祂是全然聖潔的末後亞當，也是為普世受壓制者帶來禧年釋放的和平君王。"
        }
    },
    43: {
        "geographyMap": {
            "mapTitle": "約翰福音道成肉身節期往返猶太與加利利空間圖",
            "mapType": "itinerary",
            "keyRegions": ["約旦河外伯大尼 (Bethany beyond Jordan)", "迦拿與加利利海 (Cana & Sea of Galilee)", "撒瑪利亞敘加 (Sychar in Samaria)", "耶路撒冷聖殿與畢士大 (Jerusalem & Bethesda)"],
            "routeStages": [
                {"stopNo": 1, "location": "約旦河外伯大尼與加利利迦拿 (Jordan to Cana)", "region": "約旦河谷至加利利丘陵", "event": "約翰宣告「看哪神羔羊除去世人罪孽」；迦拿婚宴行第一件神蹟變水為酒彰顯榮耀", "ref": "約 1:28-2:11"},
                {"stopNo": 2, "location": "耶路撒冷夜訪與撒瑪利亞敘加井旁 (Jerusalem to Sychar)", "region": "猶大山地至撒瑪利亞古井", "event": "潔淨聖殿；夜訪尼哥底母論重生；特意途經撒瑪利亞在雅各井旁賜活水予婦人，宣告心靈誠實敬拜", "ref": "約 2:13-4:42"},
                {"stopNo": 3, "location": "耶路撒冷畢士大池與西羅亞池 (Bethesda & Siloam)", "region": "耶路撒冷聖殿周圍水池", "event": "安息日醫治病了三十八年的癱子宣告「父做事直到如今我也做事」；住棚節用泥抹眼治好生來瞎眼者", "ref": "約 5:1-18, 9:1-41"},
                {"stopNo": 4, "location": "伯大尼拉撒路墓穴與以法蓮曠野 (Bethany near Jerusalem)", "region": "橄欖山東麓至近曠野城鎮", "event": "宣告「復活在我生命也在我」，呼喚死了四天的拉撒路走出墳墓；公會決議殺害耶穌", "ref": "約 11:1-54"},
                {"stopNo": 5, "location": "耶路撒冷樓房、公館、各各他與提比哩亞海 (Upper Room to Galilee)", "region": "最後告別、受難處與提比哩亞湖", "event": "洗腳設立彼此相愛新命令；臨別真理聖靈應許；各各他成全救恩「成了」；復活在提比哩亞海三次堅固彼得", "ref": "約 13:1-21:25"}
            ],
            "strategicNote": "不同於對觀福音以加利利事奉為重，約翰福音圍繞猶太三大節期（逾越節、住棚節、修殿節）往返於加利利與耶路撒冷之間，在宗教中心直接交鋒，以七大神蹟印證耶穌是道成肉身的神子。"
        },
        "theologyMatrixChart": {
            "chartTitle": "約翰福音「道成肉身—七大『我是』—永生神子」神學對照矩陣",
            "comparisonRows": [
                {"dimension": "神聖自稱與自有永有", "typeShadow": "荊棘火焰中神向摩西啟示神聖名字：神對摩西說「我是自有永有的」（I AM WHO I AM） (出 3:14)", "antitypeChrist": "基督神聖七重「我是」宣言：基督宣告「還沒有亞伯拉罕就有了我」；我是生命的糧、世界的光、羊的門、好牧人、復活與生命、道路真理生命、真葡萄樹 (約 8:58, 6:35, 8:12, 10:7, 10:11, 11:25, 14:6, 15:1)", "scriptureSupport": "約 8:58 / 出 3:14, 約 14:6"},
                {"dimension": "會幕居所與真理恩典顯現", "typeShadow": "曠野可拆卸之會幕帳幕：神的榮光雲彩遮蓋會幕居於以色列十二支派中間，但仍隔著幔子 (出 40:34-35)", "antitypeChrist": "道成肉身支搭帳棚：道成了肉身，住在（tabernacled）我們中間，充充滿滿地有恩典有真理，彰顯獨生子的真榮光 (約 1:14)", "scriptureSupport": "約 1:14 / 出 40:34, 西 2:9"},
                {"dimension": "摩西舉蛇與十字架得永生", "typeShadow": "曠野銅蛇掛木竿：以色列人犯罪遭火蛇咬死，神命摩西做銅蛇掛在竿上，凡望著的就活了 (民 21:8-9)", "antitypeChrist": "人子被舉起來成就救贖：摩西在曠野怎樣舉蛇，人子也必照樣被舉起來，叫一切信祂的不知滅亡反得永生 (約 3:14-16, 12:32)", "scriptureSupport": "約 3:14-16 / 民 21:9, 約 19:30"}
            ],
            "christologicalCenter": "約翰福音將神學思想推至頂峰：太初有道，道與神同在，道就是神。祂道成肉身並非抽象哲理，而是以肉體親歷苦難、流出血與水，賜給信祂之人作神兒女的無上權柄。"
        }
    },
    44: {
        "geographyMap": {
            "mapTitle": "使徒行傳福音從耶路撒冷至地極宣教擴展版圖",
            "mapType": "journey",
            "keyRegions": ["耶路撒冷至猶太全地 (Jerusalem & Judea)", "撒瑪利亞與敘利亞安提阿 (Samaria & Antioch)", "小亞細亞與愛琴海 (Asia Minor & Aegean)", "羅馬帝國心臟 (Imperial Rome)"],
            "routeStages": [
                {"stopNo": 1, "location": "耶路撒冷馬可樓房與聖殿門口 (Jerusalem Upper Room)", "region": "猶大行省首都", "event": "五旬節聖靈降臨如火舌澆灌，彼得講道三千人悔改受浸；教會建立，凡物公用，神蹟大行", "ref": "徒 1:1-4:37"},
                {"stopNo": 2, "location": "撒瑪利亞、迦薩路上與凱撒利亞 (Samaria & Caesarea)", "region": "巴勒斯坦全地擴散", "event": "司提反殉道引發大逼迫；腓利下撒瑪利亞並在迦薩曠野帶領埃提阿伯太監受浸；彼得在凱撒利亞引領百夫長哥尼流全家歸主", "ref": "徒 8:1-10:48"},
                {"stopNo": 3, "location": "敘利亞安提阿至第一次宣教旅程 (Antioch to Galatia)", "region": "敘利亞、塞浦路斯與南加拉太", "event": "外邦宣教中樞安提阿差派保羅與巴拿巴；經塞浦路斯、別加、彼息底安提阿、以哥念、路司得建立教會", "ref": "徒 13:1-14:28"},
                {"stopNo": 4, "location": "馬其頓呼聲與愛琴海巡迴宣教 (Macedonia, Greece, Ephesus)", "region": "第二、三次宣教旅程（歐洲及小亞細亞）", "event": "順從馬其頓異象橫渡愛琴海進軍歐洲（腓立比、帖撒羅尼迦、雅典、哥林多）；第三次在以弗所駐足推喇奴學房三年", "ref": "徒 16:6-20:38"},
                {"stopNo": 5, "location": "耶路撒冷被捕經馬爾他海難抵羅馬 (Jerusalem to Rome)", "region": "地中海航線至帝國首都", "event": "保羅在聖殿被捕、上訴凱撒；乘船押解遭遇地中海十四天暴風船碎在馬爾他島；最終抵達羅馬放膽傳講神國，無人禁止", "ref": "徒 21:27-28:31"}
            ],
            "strategicNote": "使徒行傳完整實踐了主耶穌在 1:8 的宏偉藍圖：從耶路撒冷（1-7章）到猶太和撒瑪利亞全地（8-12章），直到地極羅馬帝國心臟（13-28章）。福音打破了民族、地理與政治樊籬。"
        },
        "theologyMatrixChart": {
            "chartTitle": "使徒行傳「聖靈澆灌—教會擴展—基督國度突破」神學對照矩陣",
            "comparisonRows": [
                {"dimension": "巴別塔語言變亂與五旬節聖靈合一", "typeShadow": "創世記巴別塔之變亂：人類因驕傲自建通天高塔，神變亂其口音，全人類分散各地彼此隔絕阻斷 (創 11:1-9)", "antitypeChrist": "五旬節聖靈說鄉談賜合一：聖靈降臨賜使徒按著各國鄉談說話，打破種族語言隔閡，在基督裡重建屬天合一子民 (徒 2:1-12, 弗 2:14-16)", "scriptureSupport": "徒 2:4-11 / 創 11:7-9"},
                {"dimension": "摩西按立長老與使徒設立執事", "typeShadow": "摩西曠野選立領袖：摩西因管理百姓勞碌難當，聽從葉忒羅建議選立千夫長、百夫長同擔重責 (出 18:17-26)", "antitypeChrist": "使徒設立七位聖靈充滿的執事：使徒專心以祈禱傳道為事，選立有好名聲、聖靈和智慧充滿的執事管理飯食，主道越發興旺 (徒 6:1-7)", "scriptureSupport": "徒 6:1-7 / 出 18:21-22"},
                {"dimension": "外邦受納與亞伯拉罕之約成全", "typeShadow": "舊約亞伯拉罕萬國蒙福之約：神應許亞伯拉罕「地上萬族都要因你得福」，舊約世代萬邦外人多被隔絕在外 (創 12:3, 出 12:48)", "antitypeChrist": "哥尼流歸主與耶路撒冷大會：異象宣告「神所潔淨的不可當作俗物」，外邦信徒藉信得救不需負割禮重軛，萬族湧入神家 (徒 10:15, 15:1-21)", "scriptureSupport": "徒 10:15, 15:11 / 創 12:3, 加 3:8"}
            ],
            "christologicalCenter": "使徒行傳是復活升天的耶穌藉聖靈繼續在地上工作的行傳：祂從天上的寶座差遣保惠師，將軟弱膽怯的門徒轉化為無所畏懼的十架精兵，使神國直闖羅馬帝國心臟。"
        }
    },
    45: {
        "geographyMap": {
            "mapTitle": "羅馬書保羅宣教戰略樞紐與帝國西進願景圖",
            "mapType": "epistle_network",
            "keyRegions": ["亞該亞哥林多 (Corinth, 書信撰寫地)", "耶路撒冷 (Jerusalem, 送交賑災款)", "帝國首都羅馬 (Rome, 核心受信教會)", "西班牙地極 (Spain, 西部宣教前線)"],
            "routeStages": [
                {"stopNo": 1, "location": "哥林多堅革哩港口 (Corinth & Cenchreae)", "region": "希臘亞該亞行省", "event": "第三次宣教旅程結束前，保羅在哥林多接待於該猶家中，託女執事非比將這卷偉大教義書信帶往羅馬", "ref": "羅 16:1-2, 23"},
                {"stopNo": 2, "location": "前往耶路撒冷之海道與陸路 (Route to Jerusalem)", "region": "愛琴海轉地中海東岸", "event": "保羅定意先上耶路撒冷，將馬其頓和亞該亞信徒的愛心賑災款送交猶太窮苦聖徒，修復猶太與外邦信徒合一", "ref": "羅 15:25-27"},
                {"stopNo": 3, "location": "帝國首都羅馬教會各聚會點 (House Churches of Rome)", "region": "羅馬帝國政治權力中樞", "event": "向羅馬猶太與外邦混合教會詳細闡明「因信稱義」福音真理，盼望途經羅馬獲得屬靈交通與宣教支持", "ref": "羅 1:8-15, 16:3-16"},
                {"stopNo": 4, "location": "遠征西班牙未得之地 (Western Frontier: Spain)", "region": "地中海西陲歐洲大陸盡頭", "event": "立定志向不在基督名被稱過的地方傳福音；計劃以羅馬為補給基地，進軍西方西班牙地極開拓神國", "ref": "羅 15:20-24, 28"}
            ],
            "strategicNote": "保羅寫羅馬書時正處於其宣教生涯的重大轉折點：東方地中海盆地（耶路撒冷至以利哩古）開拓已告一段落，他正望向西方未得之地西班牙，而羅馬正是連結東方教會與西方宣教前線的樞紐。"
        },
        "theologyMatrixChart": {
            "chartTitle": "羅馬書「律法罪咎—因信稱義—基督恩典掌權」神學對照矩陣",
            "comparisonRows": [
                {"dimension": "罪咎之普及與普遍墮落", "typeShadow": "亞當之約與人類徹底墮落：因一人的悖逆，眾人成為罪人；律法顯多過犯，世人都犯了罪虧缺神的榮耀 (創 3:6, 羅 3:23, 5:12)", "antitypeChrist": "末後亞當因信稱義之恩：因一人的順從，眾人也成為義了；神設立基督作挽回祭，憑著祂的血藉著人的信顯明神的義 (羅 3:24-25, 5:19)", "scriptureSupport": "羅 3:23-25, 5:19 / 創 3:19"},
                {"dimension": "律法規條與因信稱義榜樣", "typeShadow": "摩西律法割禮與行為稱義之企圖：猶太人仗著律法自誇，企圖靠行律法在神面前立自己的義，卻發現人不能靠行律法稱義 (羅 2:17-3:20)", "antitypeChrist": "亞伯拉罕在割禮前因信稱義：亞伯拉罕信神，這就算為他的義；基督釋放我們脫離律法咒詛，使恩典藉義作王 (羅 4:1-5, 5:21, 8:1-2)", "scriptureSupport": "羅 4:3 / 創 15:6, 羅 8:1-3"},
                {"dimension": "肉體之交戰與聖靈生命的律", "typeShadow": "在罪與死律下的肉體無奈：「我所願意的善我反不做；我所不願意的惡我倒去做。我真是苦啊！誰能救我脫離這取死的身體？」 (羅 7:18-24)", "antitypeChrist": "賜生命聖靈的律在基督裡釋放：在基督裡就不定罪了；聖靈同證我們是神的兒女，萬事互相效力，沒有任何受造之物能使我們與基督的愛隔絕 (羅 8:1-2, 38-39)", "scriptureSupport": "羅 8:1-2, 38-39 / 詩 103:12"}
            ],
            "christologicalCenter": "羅馬書是基督教神學的珠穆朗瑪峰：基督是全人類唯一的公義與挽回祭。律法顯出死路，唯有在基督裡的因信稱義，賦予人勝過罪惡與死亡的聖靈新生命。"
        }
    },
    46: {
        "geographyMap": {
            "mapTitle": "哥林多前書愛琴海雙向書信交通與十字架智慧對決圖",
            "mapType": "epistle_network",
            "keyRegions": ["小亞細亞以弗所 (Ephesus, 保羅執筆處)", "哥林多衛城與雙海峽 (Corinth Isthmus)", "愛琴海跨海航道 (Aegean Shipping Lanes)"],
            "routeStages": [
                {"stopNo": 1, "location": "以弗所推喇奴學房 (Ephesus Hall of Tyrannus)", "region": "小亞細亞西岸愛琴海大都會", "event": "保羅在以弗所宣教三年期間，聽聞革來氏家裡的人報告哥林多教會分門別類，又收到教會信件詢問婚姻、祭偶像等問題", "ref": "林前 1:11, 7:1, 16:8"},
                {"stopNo": 2, "location": "愛琴海海運航線與堅革哩港 (Aegean Sea to Cenchreae)", "region": "愛琴海航運要道", "event": "書信與使者（司提反、福徒拿都、亞該古等）經由愛琴海往來於以弗所與哥林多地峽之間，傳遞牧者心腸與使徒規勸", "ref": "林前 16:17-18"},
                {"stopNo": 3, "location": "哥林多城各聚會點與市場 (City of Corinth & Agora)", "region": "希臘亞該亞商貿十字路口", "event": "針對世俗智慧衝擊、淫亂、信徒相告、吃祭偶像之物、聖餐混亂、屬靈恩賜爭競及復活懷疑逐一提供十架解答", "ref": "林前 1-15章"},
                {"stopNo": 4, "location": "亞該亞與馬其頓募款集結點 (Macedonia & Achaia Gathering)", "region": "全希臘半島網絡", "event": "指示每逢七日的第一日，各人按自己的進項抽出款項積蓄，預備送往耶路撒冷救濟窮苦信徒", "ref": "林前 16:1-4"}
            ],
            "strategicNote": "哥林多橫跨愛琴海與愛奧尼亞海之間的狹窄地峽，是地中海東西商旅的交匯點，極度繁華卻道德敗壞、哲學思辨混雜。保羅在以弗所遙控這座教會，用「釘十字架的基督」徹底重塑世俗文化。"
        },
        "theologyMatrixChart": {
            "chartTitle": "哥林多前書「世俗智慧—十架愚拙—基督復活大能」神學對照矩陣",
            "comparisonRows": [
                {"dimension": "人間智慧哲學與十架救贖", "typeShadow": "希臘人的哲學智慧與猶太人的神蹟求索：世人憑自己的智慧不認識神，崇尚雄辯口才與世俗榮耀 (林前 1:20-22)", "antitypeChrist": "釘十字架基督的無比智慧：十架道理在滅亡的人為愚拙，在得救的人卻為神的大能與智慧；神揀選軟弱的叫強壯的羞愧 (林前 1:18, 23-28)", "scriptureSupport": "林前 1:23-25 / 賽 29:14"},
                {"dimension": "逾越節羔羊與教會純潔生活", "typeShadow": "出埃及逾越節除酵：以色列人殺羊羔塗血，七日之內全家嚴禁有酵，違者從民中剪除 (出 12:15-20)", "antitypeChrist": "基督是我們逾越節的羔羊：基督既被殺獻祭，信徒應當把舊酵（惡毒邪惡）除淨，用純全真實的無酵餅過節守聖潔 (林前 5:7-8)", "scriptureSupport": "林前 5:7-8 / 出 12:21, 賽 53:7"},
                {"dimension": "肉身朽壞死亡與終極榮耀復活", "typeShadow": "亞當所受之死咒：出于塵土歸于塵土，死亡成了人間無法跨越的終點與恐懼 (創 3:19, 來 2:15)", "antitypeChrist": "基督初熟的果子與末號得勝：死既藉一人而來，死人復活也藉一人而來；末後號筒吹響，必朽壞的要穿上不朽壞的，死被得勝吞滅 (林前 15:20-22, 54-57)", "scriptureSupport": "林前 15:20, 55-57 / 何 13:14, 賽 25:8"}
            ],
            "christologicalCenter": "哥林多前書直面教會生活的一切現實挑戰，其核心答案永遠是：釘十字架又榮耀復活的耶穌基督。沒有愛的恩賜是鳴的鑼響的鈸，唯有基督的愛與復活盼望能醫治撕裂與驕傲。"
        }
    },
    47: {
        "geographyMap": {
            "mapTitle": "哥林多後書保羅使徒職分心路行蹤與和好宣教版圖",
            "mapType": "epistle_network",
            "keyRegions": ["小亞細亞以弗所亞西亞 (Asia / Ephesus)", "特羅亞港口 (Troas)", "馬其頓腓立比/帖撒羅尼迦 (Macedonia)", "亞該亞哥林多 (Corinth)"],
            "routeStages": [
                {"stopNo": 1, "location": "以弗所亞西亞遭難處 (Asia / Ephesus Tribulation)", "region": "小亞細亞西境", "event": "遭遇極大患難「被壓太重力不能勝甚至連活命的指望都絕了」，自己心裡斷定是必死的，叫他們不信靠自己只信靠叫死人復活的神", "ref": "林後 1:8-10"},
                {"stopNo": 2, "location": "特羅亞港口 (Troas Sea Port)", "region": "愛琴海東北端", "event": "前往特羅亞傳基督福音，雖然主開了門，但因沒有遇見提多心裡不安，便辭別那裡往馬其頓去", "ref": "林後 2:12-13"},
                {"stopNo": 3, "location": "馬其頓境內會合提多處 (Macedonia Meeting with Titus)", "region": "希臘北部行省", "event": "外有爭戰內有懼怕之際，神藉提多到來帶來哥林多信徒悔改憂傷的好消息，得著無比安慰；在此執筆撰寫哥林多後書", "ref": "林後 7:5-16"},
                {"stopNo": 4, "location": "馬其頓前往哥林多第三次探訪行道 (Road to Corinth - 3rd Visit)", "region": "希臘全境", "event": "差遣提多攜帶書信前往，呼籲完成為耶路撒冷聖徒的慈惠捐獻；宣告自己已預備第三次到哥林多，憑基督的能力行事", "ref": "林後 8:16-9:5, 12:14, 13:1"}
            ],
            "strategicNote": "哥林多後書是保羅書信中最具個人自白色彩的作品，紀錄了使徒在愛琴海南北兩岸心力交瘁的行程：從亞西亞的生死邊緣、特羅亞的憂心如焚，到馬其頓遇見提多後的絕地轉悲為喜。"
        },
        "theologyMatrixChart": {
            "chartTitle": "哥林多後書「瓦器寶貝—軟弱得勝—新約執事榮耀」神學對照矩陣",
            "comparisonRows": [
                {"dimension": "舊約字句律法與新約聖靈執事", "typeShadow": "摩西發光卻漸漸褪色的面皮：摩西在西奈山領受刻在石版上的律法，面皮發光百姓不敢直視，但這屬死的執事榮光終歸漸漸退去 (出 34:29-35, 林後 3:7-11)", "antitypeChrist": "敞著臉得見主榮的新約聖靈執事：新約非刻在石版乃刻在心版，文字是叫人死，精意（聖靈）是叫人活；主就是那靈，使我們敞著臉如鏡子返照榮光，榮上加榮 (林後 3:6, 17-18)", "scriptureSupport": "林後 3:6, 18 / 出 34:29-30"},
                {"dimension": "脆弱瓦器與神聖內住莫大能力", "typeShadow": "基甸破瓦瓶與火把：基甸三百勇士打破手中陶瓶，裡面的火把才光芒大射擊潰米甸大軍 (士 7:16-20)", "antitypeChrist": "有這寶貝放在瓦器裡：我們四面受敵卻不被困住，心裡作難卻不至失望，身上常帶著耶穌的死，使耶穌的生也在我們身上顯明 (林後 4:7-11)", "scriptureSupport": "林後 4:7-10 / 士 7:20"},
                {"dimension": "肉體的一根刺與基督夠用恩典", "typeShadow": "人求免去痛苦患難：肉體的刺叫人痛苦不堪，人本能求神三次挪去苦杯與軟弱 (林後 12:7-8)", "antitypeChrist": "基督能力在人的軟弱上顯得完全：神對保羅說「我的恩典夠你用的，因為我的能力是在人的軟弱上顯得完全」；以軟弱、凌辱、急難為可喜樂的 (林後 12:9-10)", "scriptureSupport": "林後 12:9-10 / 賽 40:29"}
            ],
            "christologicalCenter": "哥林多後書彰顯十字架悖論的神學巔峰：神的榮耀不是彰顯在人世的權柄威風，而是透過脆弱瓦器般的生命，讓復活基督的馨香之氣與莫大恩典全然流露。"
        }
    },
    48: {
        "geographyMap": {
            "mapTitle": "加拉太書耶路撒冷與南加拉太真理抗辯動線圖",
            "mapType": "epistle_network",
            "keyRegions": ["阿拉伯曠野 (Arabia Wilderness)", "大馬士革 (Damascus)", "敘利亞安提阿 (Syrian Antioch)", "南加拉太四城 (Pisidian Antioch, Iconium, Lystra, Derbe)"],
            "routeStages": [
                {"stopNo": 1, "location": "大馬士革路上與阿拉伯曠野 (Road to Damascus & Arabia)", "region": "敘利亞至阿拉伯沙漠", "event": "復活之主在大光中顯現呼召；保羅未與屬血氣之人商量，往阿拉伯曠野隱退領受基督親自啟示的福音", "ref": "加 1:11-17"},
                {"stopNo": 2, "location": "耶路撒冷短暫造訪與大公會議 (Jerusalem Visits)", "region": "猶大行省教會母會", "event": "三年後初訪彼得雅各停留十五天；十四年後帶提多上耶路撒冷，使徒柱石認定外邦人免受割禮，認可保羅使徒職分", "ref": "加 1:18-24, 2:1-10"},
                {"stopNo": 3, "location": "敘利亞安提阿公然責備磯法 (Antioch Face-to-Face Rebuke)", "region": "敘利亞外邦教會宣教中心", "event": "彼得與外邦人同桌吃飯，因奉割禮的人來到而裝假退縮，保羅當面痛斥其「不按福音的真理正直而行」", "ref": "加 2:11-14"},
                {"stopNo": 4, "location": "加拉太各城眾教會 (Churches of Galatia)", "region": "小亞細亞南加拉太高地", "event": "寫信痛心責備信徒何竟速速離棄福音歸從別的福音，嚴肅宣告「基督釋放了我們，叫我們得自由，不要再被奴僕的軛挾制」", "ref": "加 1:6-9, 5:1"}
            ],
            "strategicNote": "加拉太書涉及保羅皈依後的地理軌跡（大馬士革—阿拉伯—耶路撒冷—安提阿）。保羅以個人無可辯駁的歷史行蹤，證明其使徒權柄與所傳福音完全直接來自天上的基督，絕非受制於耶路撒冷宗教權威。"
        },
        "theologyMatrixChart": {
            "chartTitle": "加拉太書「律法奴僕—基督自由—因信得生」神學對照矩陣",
            "comparisonRows": [
                {"dimension": "律法訓蒙師傅與兒子名分", "typeShadow": "孩童之監護奴僕：律法是我們的訓蒙師傅（pedagogue），因人犯罪而添上，看守圈禁眾人直到救贖之日 (加 3:19, 23-24)", "antitypeChrist": "在基督裡得神兒子的名分：及至時候滿足神就差遣祂的兒子由女子所生，贖出律法以下的人，使我們得著兒子的名分呼叫「阿爸，父！」 (加 4:4-6)", "scriptureSupport": "加 4:4-6 / 加 3:24-26"},
                {"dimension": "夏甲與撒拉的兩個約比喻", "typeShadow": "夏甲生子按著血氣為奴：使女夏甲代表西奈山的律法之約，生子為奴，對應地上受轄制的耶路撒冷 (創 16:1-4, 加 4:22-25)", "antitypeChrist": "撒拉生子憑著應許自由：自主婦人撒拉代表天上自由的耶路撒冷，我們是憑應許生的兒女，承受永恆應許的屬天產業 (創 21:1-3, 加 4:26-31)", "scriptureSupport": "加 4:26-31 / 創 21:12"},
                {"dimension": "肉體情慾與聖靈仁愛果子", "typeShadow": "肉體情慾的敗壞作為：姦淫、污穢、邪蕩、拜偶像、仇恨、爭競、忌恨、惱怒、結黨、紛爭，行這樣事的人必不能承受神的國 (加 5:19-21)", "antitypeChrist": "聖靈所結九重生命美果：仁愛、喜樂、和平、忍耐、恩慈、良善、信實、溫柔、節制，這樣的事沒有律法禁止；我已經與基督同釘十字架 (加 5:22-23, 2:20)", "scriptureSupport": "加 5:22-23, 2:20 / 羅 6:6"}
            ],
            "christologicalCenter": "加拉太書是基督教信仰的自由大憲章：十字架粉碎一切宗教律法主義捆綁。「我斷不以別的誇口，只誇我們主耶穌基督的十字架；因這十字架，就我而論，世界已經釘在十字架上；就世界而論，我已經釘在十字架上。」"
        }
    },
    49: {
        "geographyMap": {
            "mapTitle": "以弗所書天上屬靈界與小亞細亞巡迴教會網絡圖",
            "mapType": "epistle_network",
            "keyRegions": ["羅馬帝國監獄 (Rome Prison, 執筆處)", "天上的界域 (Heavenly Realms)", "亞西亞首府以弗所 (Ephesus & Lycus Valley)"],
            "routeStages": [
                {"stopNo": 1, "location": "羅馬監獄捆鎖處 (Rome Prison)", "region": "羅馬帝國首都監房", "event": "保羅為外邦人作了基督耶穌被囚的，在捆鎖中藉聖靈啟示看透創世以前隱藏的奧秘", "ref": "弗 3:1-4, 4:1"},
                {"stopNo": 2, "location": "至高天上的界域 (The Heavenly Realms)", "region": "神寶座與屬靈維度（全書出現五次）", "event": "神在天上各樣屬靈福氣賜給我們；叫基督從死裡復活坐在天上遠超一切執政掌權的，我們與祂一同坐在天上", "ref": "弗 1:3, 20, 2:6, 3:10, 6:12"},
                {"stopNo": 3, "location": "小亞細亞西海岸以弗所大城 (Ephesus Metropolis)", "region": "愛琴海東岸亞西亞省心臟", "event": "推基古攜帶這卷巡迴公函送信給眾聖徒，堅固他們抵擋亞底米女神偶像異端與巫術邪靈風氣", "ref": "弗 1:1, 6:21-22"},
                {"stopNo": 4, "location": "亞西亞眾教會與家庭聚會點 (Asia Minor Circular Churches)", "region": "呂高尼、弗呂家等小亞細亞眾城", "event": "在夫妻、父子、主僕等日常生活中活出基督新人的樣式，穿戴神所賜全副軍裝抵擋魔鬼詭計", "ref": "弗 5:21-6:20"}
            ],
            "strategicNote": "以弗所書是一封跨越地理界限的通函（Circular Letter）。保羅從羅馬監房極度受限的狹小空間，心靈卻翱翔至「天上的界域」，勾勒出包羅萬有、貫穿時空的宇宙性基督教會神聖藍圖。"
        },
        "theologyMatrixChart": {
            "chartTitle": "以弗所書「隔斷的牆拆毀—基督身體—宇宙教會奧秘」神學對照矩陣",
            "comparisonRows": [
                {"dimension": "聖殿隔離隔牆與外邦隔離", "typeShadow": "耶路撒冷聖殿的外邦人院隔離矮牆（Soreg）：牆上刻有希臘文警告「外邦人膽敢越過此牆者，死罪自負」，族群仇恨根深蒂固 (弗 2:11-12)", "antitypeChrist": "基督在十字架拆毀隔斷的牆：基督以自己的身體廢掉冤仇，將猶太與外邦兩下藉著自己造成一個新人，成就了和平，同為後嗣、同為一體 (弗 2:14-16, 3:6)", "scriptureSupport": "弗 2:14-16 / 賽 57:19, 創 12:3"},
                {"dimension": "死在罪中與基督同坐天上", "typeShadow": "屬靈死屍與空中掌權魔鬼轄制：從前死在過犯罪惡中，隨從今世風俗，順服空中掌權者邪靈，本為可怒之子 (弗 2:1-3)", "antitypeChrist": "同活同復活同坐寶座的浩瀚恩典：神以豐富的憐憫和大愛，在我們死在過犯中時便叫我們與基督一同活過來，並一同坐在天上 (弗 2:4-7)", "scriptureSupport": "弗 2:4-6 / 西 2:12-13"},
                {"dimension": "地上婚姻夫妻與基督和教會", "typeShadow": "創世記骨肉聯合與家庭盟約：人要離開父母與妻子連合，二人成為一體 (創 2:24)", "antitypeChrist": "極大奧秘指著基督和教會：丈夫愛妻子如同基督愛教會為教會捨命，用道藉著水洗淨教會成為聖潔無瑕疵榮耀新婦 (弗 5:25-32)", "scriptureSupport": "弗 5:25-32 / 創 2:24, 啟 19:7"}
            ],
            "christologicalCenter": "以弗所書宣告至高無上的教會論：教會不是人間社交俱樂部，而是「基督的身體，是那充滿萬有者所充滿的」。全宇宙都在基督裡歸於一統。"
        }
    },
    50: {
        "geographyMap": {
            "mapTitle": "腓立比書羅馬禁衛軍營與歐洲橋頭堡福音連線圖",
            "mapType": "epistle_network",
            "keyRegions": ["帝國首府羅馬禁衛軍營 (Rome Praetorium)", "馬其頓腓立比駐防城 (Philippi Colony)", "厄納齊雅軍事大道 (Via Egnatia)"],
            "routeStages": [
                {"stopNo": 1, "location": "馬其頓腓立比城門外河邊與監獄 (Philippi Riverside & Prison)", "region": "歐洲第一座福音城鎮", "event": "十年前保羅響應馬其頓呼聲渡海抵達，呂底亞全家受浸；夜間地震獄卒歸主，歐洲首座教會建立", "ref": "徒 16:11-40, 腓 1:3-5"},
                {"stopNo": 2, "location": "羅馬城保羅寓所與禁衛軍全營 (Rome Praetorium Prison)", "region": "帝國權力心臟禁衛軍總部", "event": "保羅帶鎖鏈傳福音，叫禁衛軍全營和其餘的人都知道基督；福音直達凱撒宮裡的人", "ref": "腓 1:12-14, 4:22"},
                {"stopNo": 3, "location": "厄納齊雅大道與以巴弗提生死旅程 (Via Egnatia & Epaphroditus)", "region": "橫貫希臘半島羅馬軍道", "event": "以巴弗提代表腓立比教會送愛心饋贈，在羅馬病得要死蒙神憐恤；保羅打發他攜此書信返回腓立比", "ref": "腓 2:25-30, 4:18"},
                {"stopNo": 4, "location": "腓立比信徒同心合意聚集處 (Philippi Assembly)", "region": "羅馬直轄特權殖民城邦", "event": "提醒信徒行事為人要與基督福音相稱，放下同工爭執（友阿爹與循都基），在主裡常常喜樂，仰望屬天公民身分", "ref": "腓 1:27, 3:20, 4:2-4"}
            ],
            "strategicNote": "腓立比是羅馬帝國在希臘東北的特權軍事殖民城（Colonia），居民享有羅馬公民特權。保羅巧妙地將「屬地羅馬公民權」升華為「天上的國民身分」（3:20），激勵信徒在苦難逼迫中同享基督之樂。"
        },
        "theologyMatrixChart": {
            "chartTitle": "腓立比書「基督降卑頌歌—屬天公民—牢獄喜樂」神學對照矩陣",
            "comparisonRows": [
                {"dimension": "自高為大與基督虛己降卑", "typeShadow": "路西弗與始祖企圖與神同等之背叛：撒但妄圖高升寶座與至上者同等；始祖企圖如神有智慧奪取禁果 (賽 14:12-14, 創 3:5)", "antitypeChrist": "基督原與神同等卻倒空虛己：祂本有神的形像卻不堅持與神同等，反倒虛己取了奴僕形像，存心順服以至於死且死在十字架上 (腓 2:5-8)", "scriptureSupport": "腓 2:5-8 / 賽 14:14, 創 3:5"},
                {"dimension": "地上羅馬公民與天上屬天身分", "typeShadow": "屬世公民特權之誇耀：羅馬特權殖民地市民以羅馬公民權驕傲自矜，享有免稅與司法特權 (徒 16:37, 22:28)", "antitypeChrist": "我們卻是天上的國民：我們是天國屬天公民，等候救主主耶穌基督從天降臨，將卑賤身體改變形狀如祂榮耀的身體 (腓 3:20-21)", "scriptureSupport": "腓 3:20-21 / 徒 22:28, 來 11:16"},
                {"dimension": "律法宗派資歷與視為糞土得基督", "typeShadow": "保羅舊有的宗教金牌資歷：第八天受割禮、以色列族、便雅憫支派、希伯來人所生的、法利賽人、逼迫教會、無可指摘 (腓 3:4-6)", "antitypeChrist": "為基督視萬事如糞土：我將萬事當作有損的，因我以認識我主基督耶穌為至寶；看作糞土為要得著基督，向著標竿直跑 (腓 3:7-14)", "scriptureSupport": "腓 3:7-10, 14 / 哈 3:17-18"}
            ],
            "christologicalCenter": "腓立比書的核心是基督教最著名的基督頌歌（Carmen Christi, 2:5-11）：神將祂升為至高，賜給祂那超乎萬名之上的名，叫一切因耶穌的名無不屈膝、無不口稱耶穌基督為主！"
        }
    },
    51: {
        "geographyMap": {
            "mapTitle": "歌羅西書呂家山谷與基督至高超越抵禦諾斯底圖",
            "mapType": "epistle_network",
            "keyRegions": ["羅馬獄中 (Rome Prison)", "呂家山谷三城：歌羅西、老底嘉、希拉波立 (Lycus Valley)", "以弗所 (Ephesus)"],
            "routeStages": [
                {"stopNo": 1, "location": "羅馬獄中與以巴弗造訪 (Rome Prison & Epaphras)", "region": "帝國首都獄中", "event": "歌羅西教會開拓者以巴弗千里迢迢趕赴羅馬探視保羅，報告教會面臨混合主義哲學、拜天使與禁慾主義威脅", "ref": "西 1:7-8, 4:12-13"},
                {"stopNo": 2, "location": "呂家河谷歌羅西城聚會處 (Colossae in Lycus Valley)", "region": "弗呂家南部富庶河谷", "event": "推基古與阿尼西母攜信抵達歌羅西，在腓利門家中宣讀這卷宣告基督宇宙至高地位與豐盛的書信", "ref": "西 4:7-9, 門 1-2"},
                {"stopNo": 3, "location": "鄰近姐妹城老底嘉與希拉波立 (Laodicea & Hierapolis)", "region": "呂家谷鄰近城市", "event": "指示此信在歌羅西讀完後，務要交在老底嘉教會也讀，並念從老底嘉來的書信，保持眾教會神學純全", "ref": "西 4:15-16"}
            ],
            "strategicNote": "歌羅西城雖然在羅馬時期商貿地位漸被鄰近的老底嘉和希拉波立超越，但其位於東方神祕主義、希臘哲學思潮與猶太割禮禁食法規的交匯處。保羅在此豎立基督宇宙至尊的神學界標。"
        },
        "theologyMatrixChart": {
            "chartTitle": "歌羅西書「世俗哲學異端—基督包羅萬有—神格豐盛」神學對照矩陣",
            "comparisonRows": [
                {"dimension": "人間哲學小學與基督包羅萬有", "typeShadow": "世上的小學與拜天使奧祕：異端倡導玄秘神智、天使仲介等級、苦待己身與節期規條禁忌 (西 2:8, 16-18, 20-23)", "antitypeChrist": "愛子在萬有中居首位：基督是不能看見之神的像，萬有都是靠祂造的、藉祂造的、為祂造的；祂在萬有之先，萬有也靠祂而立 (西 1:15-17)", "scriptureSupport": "西 1:15-17 / 箴 8:22-30, 創 1:1"},
                {"dimension": "神人隔閡中介與神本性一切豐盛", "typeShadow": "諾斯底主義之次等神靈發散：認為物質屬惡、神聖至高者不能接觸物質世界，需有無數中間天使靈體引渡 (西 2:18)", "antitypeChrist": "神本性一切的豐盛形形色色在基督裡：因為神本性一切的豐盛都有形有體地居住在基督裡面，你們在祂裡面也得了豐盛 (西 2:9-10)", "scriptureSupport": "西 2:9-10 / 約 1:16"},
                {"dimension": "律法規條字據與十字架上撤銷", "typeShadow": "在律法字據下的罪愆定罪：律法如同不可摸、不可嘗、攻擊我們在律例上所寫的欠債字據 (西 2:14, 21)", "antitypeChrist": "十字架塗抹字據釘死仇敵：基督把攻擊我們的字據撤去釘在十字架上；既將一切執政的掌權的擄來，明顯給眾人看就仗著十字架誇勝 (西 2:14-15)", "scriptureSupport": "西 2:14-15 / 創 3:15, 詩 68:18"}
            ],
            "christologicalCenter": "歌羅西書宣告基督是不可挑戰的宇宙中心：祂是創造的主、維繫萬有的主、教會的元首、從死裡首先復生的。基督之外毫無救贖，基督之內有一切豐盛！"
        }
    },
    52: {
        "geographyMap": {
            "mapTitle": "帖撒羅尼迦前書馬其頓戰略軍港與主再臨盼望圖",
            "mapType": "epistle_network",
            "keyRegions": ["愛琴海軍港帖撒羅尼迦 (Thessalonica)", "南部重鎮雅典與哥林多 (Athens & Corinth)", "馬其頓與亞該亞全境 (Macedonia & Achaia)"],
            "routeStages": [
                {"stopNo": 1, "location": "帖撒羅尼迦猶太會堂與耶孫家 (Thessalonica Synagogue & Jason's House)", "region": "馬其頓行省首府首要海港", "event": "保羅第二次宣教旅程進城，一連三個安息日本著聖經講解基督受害復活；暴民騷亂圍攻耶孫家，保羅夜間被迫撤往庇哩亞", "ref": "徒 17:1-10"},
                {"stopNo": 2, "location": "雅典孤單等候與差遣提摩太 (Athens Waiting & Sending Timothy)", "region": "希臘亞該亞學術名城", "event": "保羅在雅典不能再忍，差遣提摩太回帖撒羅尼迦堅固這群在逼迫中如新生嬰孩般的初信徒", "ref": "帖前 3:1-2"},
                {"stopNo": 3, "location": "哥林多接獲大喜信息執筆書信 (Corinth Composition)", "region": "希臘亞該亞商港", "event": "提摩太自馬其頓歸來帶來信徒信心與愛心的絕佳喜訊；保羅激動不已，在哥林多寫下這封充滿熱淚與安慰的初代書信", "ref": "帖前 3:6-10, 徒 18:5"},
                {"stopNo": 4, "location": "福音風聲傳遍馬其頓與亞該亞 (Sounding out across Greece)", "region": "希臘全境", "event": "帖撒羅尼迦信徒棄絕偶像服事真神，在患難中蒙受大喜樂，福音真道從他們那裡傳遍希臘全地", "ref": "帖前 1:8-10"}
            ],
            "strategicNote": "帖撒羅尼迦座落於羅馬帝國著名的厄納齊雅大道與愛琴海港灣交匯點，是連接羅馬與拜占庭的軍事經貿心臟。保羅在此建立的教會如同一座屬靈燈塔，將主再臨的警醒盼望照亮全歐洲。"
        },
        "theologyMatrixChart": {
            "chartTitle": "帖撒羅尼迦前書「患難堅忍—主必親臨—信望愛聖潔」神學對照矩陣",
            "comparisonRows": [
                {"dimension": "偶像膜拜與事奉永生真神", "typeShadow": "外邦偶像虛妄拜祭：信徒原本拜希臘羅馬眾神靈與泛靈偶像，生活在無指望的黑暗中 (帖前 1:9)", "antitypeChrist": "離棄偶像歸向又真又活的神：等候祂兒子從天降臨，就是祂從死裡復活的、那位救我們脫離將來忿怒的耶穌 (帖前 1:9-10)", "scriptureSupport": "帖前 1:9-10 / 賽 44:9-20"},
                {"dimension": "睡了之人與號筒吹響空中被提", "typeShadow": "古代異教對死亡的絕望：世人面對死亡如無指望之人哀痛欲絕，視死後為虛無縹緲陰間 (帖前 4:13)", "antitypeChrist": "主親自從天降臨與聖徒被提：主必親自從天降臨，有呼叫的聲音和天使長聲音並神的號吹響；在基督裡死的人必先復活，活著活著的人一同被提到雲裡在空中與主相遇 (帖前 4:14-17)", "scriptureSupport": "帖前 4:16-17 / 林前 15:51-52"},
                {"dimension": "黑夜沉睡之人與白晝光明之子", "typeShadow": "黑夜醉酒放蕩之世俗生活：屬黑夜幽暗的人沉睡醉酒，在罪中放浪形骸毫無戒備 (帖前 5:5-7)", "antitypeChrist": "光明之子謹守儆醒戴上信望愛盔甲：我們都是光明之子，應當謹守，把信和愛當作護心鏡遮胸，把得救的盼望當作頭盔戴上 (帖前 5:8-11)", "scriptureSupport": "帖前 5:8 / 賽 59:17, 弗 6:14"}
            ],
            "christologicalCenter": "帖撒羅尼迦前書每一章末尾（1:10, 2:19, 3:13, 4:16-17, 5:23）都指向同一個燦爛終點：耶穌基督的榮耀再臨。信徒的聖潔生活與無懼患難，全係於這末世榮耀盼望。"
        }
    },
    53: {
        "geographyMap": {
            "mapTitle": "帖撒羅尼迦後書末世大罪人狂傲與主降臨烈火公義審判圖",
            "mapType": "epistle_network",
            "keyRegions": ["哥林多城 (Corinth, 執筆處)", "帖撒羅尼迦 (Thessalonica, 受信教會)", "天門開啟處 (Heaven Revealed)"],
            "routeStages": [
                {"stopNo": 1, "location": "哥林多再接帖城書信反饋 (Corinth Follow-up)", "region": "亞該亞行省首府", "event": "保羅寄出前書後數月，得知帖城信徒因假冒書信誤以為「主的日子現在就到了」，有人荒手遊手不肯做工，遂再度撰寫後書糾正", "ref": "帖後 1:1, 2:1-2, 3:11"},
                {"stopNo": 2, "location": "聖殿與末世沈淪之子顯現地 (Temple & Man of Lawlessness)", "region": "歷史終結敵基督顯現處", "event": "指明主降臨前必有離道反教之事，那大罪人（沉淪之子）必顯露出來，自高自大甚至坐在神的殿裡自稱是神", "ref": "帖後 2:3-4"},
                {"stopNo": 3, "location": "主耶穌同有能力的天使從天降臨處 (The Lord's Parousia in Fire)", "region": "榮耀天際降臨處", "event": "主耶穌同祂有能力的天使在烈火中顯現，要報應那不認識神和不聽從福音的人，主用口中的氣滅絕沉淪之子，用降臨的榮光廢掉他", "ref": "帖後 1:7-9, 2:8"},
                {"stopNo": 4, "location": "帖撒羅尼迦安靜做工群體 (Diligent Believers at Thessalonica)", "region": "帖城日常生活與職場工場", "event": "嚴肅吩咐「若有人不肯做工就不可吃飯」，勉勵聖徒不可喪志、安靜做工吃自己的飯，堅守真道", "ref": "帖後 3:6-15"}
            ],
            "strategicNote": "帖撒羅尼迦後書在地理空間上雖然承繼前書的哥林多—帖撒羅尼迦航線，但其末世論視野直探歷史末期的「大罪人座堂」與「基督烈火自天而降」的終極宇宙戰場，平衡了熱狂主義與怠惰生活。"
        },
        "theologyMatrixChart": {
            "chartTitle": "帖撒羅尼迦後書「大罪人狂傲—基督口氣滅敵—公義審判」神學對照矩陣",
            "comparisonRows": [
                {"dimension": "狂傲沉淪之子與虛妄神格", "typeShadow": "巴比倫王與安提阿哥四世之自大褻瀆：歷史上的暴君自封神明，在聖所安放可憎之物踐踏聖約 (賽 14:13-14, 但 11:36)", "antitypeChrist": "大罪人狂傲自高被基督口氣廢掉：末世沉淪之子坐在殿裡自稱是神，行各樣出於撒但的虛假異能；但主耶穌要用口中的氣滅絕他，用降臨的榮光廢掉他 (帖後 2:3-9)", "scriptureSupport": "帖後 2:8 / 賽 11:4, 但 7:26"},
                {"dimension": "逼迫受苦與神公義判斷的明證", "typeShadow": "義人受苦與惡人暫時猖獗之困惑：哈巴谷與詩人困惑為何惡人吞滅比自己公義的人 (哈 1:13, 詩 73:2-12)", "antitypeChrist": "主降臨施行公義翻轉：神是公義的，必將患難報應加患難給信徒的人；叫受患難的人與使徒同得平安，惡人受永遠沉淪的刑罰 (帖後 1:5-9)", "scriptureSupport": "帖後 1:6-9 / 賽 66:15, 詩 96:13"},
                {"dimension": "末世狂熱妄誕與腳踏實地生活", "typeShadow": "荒宴好閒與怠惰虛擲：假借屬靈之名遊手好閒，專管閒事，使主道受羞辱 (帖後 3:11)", "antitypeChrist": "安靜做工榮耀主名：以使徒晝夜勞碌不白吃人飯為榜樣，腳踏實地安靜做工吃自己的飯；行善不可喪志，願主賜平安 (帖後 3:7-13, 16)", "scriptureSupport": "帖後 3:10-12 / 箴 10:4, 弗 4:28"}
            ],
            "christologicalCenter": "帖撒羅尼迦後書以鋼鐵般的基督權柄抵禦末世恐慌：耶穌基督是掌管歷史日程的萬王之王。邪惡有其被神命定的限期，任何假基督在真正基督的榮耀降臨面前都將瞬間如灰燼瓦解。"
        }
    }
}

if __name__ == "__main__":
    print(f"NT Part 1 contains {len(GEO_THEOLOGY_NT_PART1)} books (Books 40-53).")
    for b_no in range(40, 54):
        assert b_no in GEO_THEOLOGY_NT_PART1, f"Missing NT book #{b_no}"
        d = GEO_THEOLOGY_NT_PART1[b_no]
        assert "geographyMap" in d and len(d["geographyMap"]["routeStages"]) >= 3
        assert "theologyMatrixChart" in d and len(d["theologyMatrixChart"]["comparisonRows"]) >= 2
    print("NT Part 1 verified successfully!")
