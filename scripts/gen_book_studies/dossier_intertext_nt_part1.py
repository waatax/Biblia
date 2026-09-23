# -*- coding: utf-8 -*-
"""
Book Dossier & Canonical Intertextuality Datasets for New Testament Part 1 (Books 40-53).
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

DOSSIER_INTERTEXT_NT_PART1 = {
    40: {
        "bookDossier": {
            "hebrewGreekTitle": "Κατὰ Μαθθαῖον (Kata Maththaion) / Evangelium secundum Matthaeum",
            "canonicalOrder": "新約四福音書首卷 (Gospels #1) / 兩約銜接基石彌賽亞君王傳記",
            "historicalEra": "耶穌生平事奉受難復活至早期教會 (主前 4 年至主後 30/33 年)",
            "writingPeriod": "早期使徒世代，耶路撒冷陷落前夕 (約主後 60–65 年)",
            "geopoliticalContext": "羅馬帝國統治下猶太行省（希律王朝、彼拉多總督巡撫）與加利利分封王轄區",
            "primaryLiteraryGenre": "古代希臘羅馬傳記 (Bioi)、五大天國講論對偶結構（對應摩西五經）、應驗公式引用神諭",
            "covenantAnchor": "亞伯拉罕之約與大衛王約之成全：「亞伯拉罕的後裔，大衛的子孫，耶穌基督的家譜」 (太 1:1)",
            "christologicalArchetype": "大衛子孫真彌賽亞君王、登山寶訓頒布天國憲章之大摩西、承擔萬民罪孽之受苦君王、頒布普世大使命的天地之主 (28:18-20)"
        },
        "canonicalIntertextuality": {
            "tableTitle": "馬太福音正典互文與舊約引用成全對照表",
            "citations": [
                {
                    "sourceRef": "太 1:22-23",
                    "targetRef": "賽 7:14",
                    "theologicalEcho": "【應驗以馬內利童女懷孕】：這一切的事成就是要應驗主藉先知所說的話「必有童女懷孕生子，人要稱祂的名為以馬內利」"
                },
                {
                    "sourceRef": "太 2:15",
                    "targetRef": "何 11:1, 出 4:22",
                    "theologicalEcho": "【從埃及召出真神子】：耶穌避難埃及再回迦南，應驗「我從埃及召出我的兒子來」，基督親自代表並成全真以色列"
                },
                {
                    "sourceRef": "太 26:28",
                    "targetRef": "出 24:8, 耶 31:31-34",
                    "theologicalEcho": "【設立新約救贖寶血】：「這是我立約的血，為多人流出來，使罪得赦」；結合西奈立約之血與耶利米新約赦罪應許"
                }
            ]
        }
    },
    41: {
        "bookDossier": {
            "hebrewGreekTitle": "Κατὰ Μᾶρκον (Kata Markon) / Evangelium secundum Marcum",
            "canonicalOrder": "新約四福音書第 2 卷 (Gospels #2) / 最早成書行動福音與受苦僕人傳",
            "historicalEra": "耶穌在世服事、受難週與十字架受死 (約主後 26–30/33 年)",
            "writingPeriod": "彼得殉道前後由約翰馬可於羅馬城寫就 (約主後 64–68 年)",
            "geopoliticalContext": "羅馬帝國尼祿皇帝火燒羅馬、血腥迫害基督徒之危機黑夜",
            "primaryLiteraryGenre": "緊湊行動傳記（40多次「立時」）、十字架導向敘事（受難史詩篇幅佔全書三分之一）、羅馬百夫長認信峰頂",
            "covenantAnchor": "捨命作萬人贖價之受苦義僕聖約 (可 10:45, 賽 53:10-12)",
            "christologicalArchetype": "神的受苦僕人、捨命作多人的贖價、粉碎污鬼狂風死權的神子基督 (1:1, 15:39)"
        },
        "canonicalIntertextuality": {
            "tableTitle": "馬可福音正典互文與舊約引用成全對照表",
            "citations": [
                {
                    "sourceRef": "可 1:2-3",
                    "targetRef": "瑪 3:1, 賽 40:3",
                    "theologicalEcho": "【曠野呼喊者之聲與預備主道】：開卷融合瑪拉基與以賽亞書，宣告施洗約翰曠野開路先鋒角色，引介神子基督降臨"
                },
                {
                    "sourceRef": "可 10:45",
                    "targetRef": "賽 53:10-12, 但 7:13",
                    "theologicalEcho": "【人子來捨命作多人贖價】：將但以理書榮耀「人子」與以賽亞書「受苦義僕捨命作贖價」融鑄為基督十字架核心使命"
                },
                {
                    "sourceRef": "可 15:38",
                    "targetRef": "出 26:31-33, 利 16:2",
                    "theologicalEcho": "【聖殿幔子從上到下裂為兩半】：基督斷氣之時，隔絕人與神至聖所的幔子徹底撕裂，神聖救贖通天之路豁然洞開"
                }
            ]
        }
    },
    42: {
        "bookDossier": {
            "hebrewGreekTitle": "Κατὰ Λουκᾶν (Kata Loukan) / Evangelium secundum Lucam",
            "canonicalOrder": "新約四福音書第 3 卷 (Gospels #3) / 最詳實嚴謹史家傳記與完美人子福音",
            "historicalEra": "施洗約翰降生至基督升天 (約主前 5 年至主後 30/33 年)",
            "writingPeriod": "醫生路加陪同保羅被囚於凱撒利亞或羅馬期間 (約主後 60–62 年)",
            "geopoliticalContext": "羅馬奧古斯都帝國大普查、提庇留統治、希律安提帕管轄加利利，外邦與猶太交匯大時代",
            "primaryLiteraryGenre": "古典希臘史學序言 (1:1-4)、精密按著次序編年敘事、宏大旅行長征 (9:51-19:27)、讚美詩歌（尊主頌、撒迦利亞頌、西面頌）",
            "covenantAnchor": "禧年恩典聖約（報告被擄的得釋放、瞎眼的得看見）(路 4:18-19, 利 25:10)",
            "christologicalArchetype": "家譜溯至亞當的「末後亞當真人類」、憐憫罪人外邦婦女貧寒者的救主、尋找拯救失喪之人的好牧人 (19:10)"
        },
        "canonicalIntertextuality": {
            "tableTitle": "路加福音正典互文與舊約引用成全對照表",
            "citations": [
                {
                    "sourceRef": "路 4:18-19",
                    "targetRef": "賽 61:1-2, 利 25:10",
                    "theologicalEcho": "【禧年釋放神聖使命宣告】：主耶穌在拿撒勒會堂宣讀以賽亞書，報告神悅納人的禧年，開啟向一切邊緣受壓制者施恩之時代"
                },
                {
                    "sourceRef": "路 24:27, 44-45",
                    "targetRef": "創世記至瑪拉基書全舊約正典",
                    "theologicalEcho": "【以馬忤斯路上全舊約基督論解經】：基督從摩西、眾先知和詩篇起，凡經上指著自己的話都給門徒講解明白，確立全舊約指向基督受害復活"
                },
                {
                    "sourceRef": "路 1:54-55, 72-73",
                    "targetRef": "創 12:3, 17:7, 22:16-18",
                    "theologicalEcho": "【記念亞伯拉罕與列祖之聖約】：馬利亞與撒迦利亞頌歌皆頌讚神眷顧以色列，記念向亞伯拉罕所起之神聖恩約"
                }
            ]
        }
    },
    43: {
        "bookDossier": {
            "hebrewGreekTitle": "Κατὰ Ἰωάννην (Kata Ioannen) / Evangelium secundum Ioannem",
            "canonicalOrder": "新約四福音書壓軸終卷 (Gospels #4) / 道成肉身至高神學與永生神子啟示",
            "historicalEra": "太初有道跨越時空至基督受死復活與提比哩亞海顯現",
            "writingPeriod": "使徒約翰晚年於小亞細亞以弗所完成 (約主後 85–95 年)",
            "geopoliticalContext": "第一世紀末葉羅馬帝國多神泛靈崇拜、初期諾斯底主義與希臘哲學邏各斯思潮交鋒",
            "primaryLiteraryGenre": "崇高序幕神學長詩 (1:1-18)、七大標記神蹟 (Sign Miracles)、七重「我是 (Ego Eimi)」神聖啟示講論、高祭司禱詞 (17章)",
            "covenantAnchor": "新誡命彼此相愛之約與生命之道盟約 (約 13:34-35, 15:1-12)",
            "christologicalArchetype": "太初與神同在的道、神的羔羊 (1:29)、新會幕聖所 (1:14)、摩西曠野銅蛇 (3:14)、天降生命之糧 (6:35)、好牧人與真葡萄樹"
        },
        "canonicalIntertextuality": {
            "tableTitle": "約翰福音正典互文與舊約引用成全對照表",
            "citations": [
                {
                    "sourceRef": "約 1:1, 14",
                    "targetRef": "創 1:1, 出 40:34",
                    "theologicalEcho": "【太初有道與道成肉身搭棚】：太初有道遙對創世記起初，道成肉身住在（tabernacled）我們中間，將舊約曠野會幕榮光推至終極肉身實體"
                },
                {
                    "sourceRef": "約 8:58",
                    "targetRef": "出 3:14",
                    "theologicalEcho": "【神聖自有永有「我是」宣言】：「還沒有亞伯拉罕就有了我（I AM）」；基督直接宣告自己擁有荊棘火焰中神向摩西啟示的神聖自有永有名號"
                },
                {
                    "sourceRef": "約 19:36-37",
                    "targetRef": "出 12:46, 詩 34:20, 亞 12:10",
                    "theologicalEcho": "【骨頭不折與仰望所扎的】：十字架斷氣時兵丁不打斷祂的腿，反扎祂肋旁流出血水，同時應驗逾越節羊羔規條與撒迦利亞被刺預言"
                }
            ]
        }
    },
    44: {
        "bookDossier": {
            "hebrewGreekTitle": "Πράξεις Ἀποστόλων (Praxeis Apostolon) / Actus Apostolorum",
            "canonicalOrder": "新約歷史書唯一卷 (History #1) / 聖靈行傳與教會自耶路撒冷至地極大開拓",
            "historicalEra": "耶穌升天五旬節至保羅在羅馬租屋傳道兩年 (主後 30–62 年，歷時逾三十年)",
            "writingPeriod": "醫生路加於保羅首次羅馬獲釋前完成 (約主後 62–63 年)",
            "geopoliticalContext": "羅馬帝國地中海世界全境（巴勒斯坦、敘利亞、小亞細亞、馬其頓、希臘、羅馬首都）",
            "primaryLiteraryGenre": "神聖救贖歷史敘事、早期使徒護教宣道演講辭集（彼得、司提反、保羅共24篇講章）、航海冒險與法庭紀實",
            "covenantAnchor": "聖靈大能差派大使命：「但聖靈降臨在你們身上，你們就必得著能力...直到地極作我的見證」 (徒 1:8)",
            "christologicalArchetype": "復活升天坐在寶座發施號令的主耶穌、從天降下聖靈的主、站在神右邊迎接司提放的榮耀人子 (7:56)"
        },
        "canonicalIntertextuality": {
            "tableTitle": "使徒行傳正典互文與舊約引用成全對照表",
            "citations": [
                {
                    "sourceRef": "徒 2:16-21, 25-31",
                    "targetRef": "珥 2:28-32, 詩 16:8-11",
                    "theologicalEcho": "【五旬節聖靈澆灌與大衛預言主復活】：彼得講道直接引用約珥書應驗末世聖靈澆灌，引用詩篇證實大衛肉身見朽壞，基督卻從死裡復活不見朽壞"
                },
                {
                    "sourceRef": "徒 13:33-34",
                    "targetRef": "詩 2:7, 賽 55:3",
                    "theologicalEcho": "【你是我的兒子與大衛聖潔可靠的恩典】：保羅在彼息底安提阿會堂解經，指明神叫耶穌復活正是應驗詩篇「你是我的兒子我今日生你」和大衛聖約"
                },
                {
                    "sourceRef": "徒 15:15-18",
                    "targetRef": "摩 9:11-12",
                    "theologicalEcho": "【耶路撒冷大會外邦歸主依據】：使徒雅各引用阿摩司書重建大衛倒塌帳幕神諭，確立萬國求告主名乃是神創世以來早已定規的旨意"
                }
            ]
        }
    },
    45: {
        "bookDossier": {
            "hebrewGreekTitle": "Πρὸς Ῥωμαίους (Pros Romaious) / Epistula ad Romanos",
            "canonicalOrder": "新約保羅書信首卷 (Pauline Epistles #1) / 基督教神學珠穆朗瑪峰與救贖大憲章",
            "historicalEra": "保羅第三次宣教旅程尾聲 (約主後 57 年初冬)",
            "writingPeriod": "哥林多堅革哩港客居該猶家中時寫就 (約主後 57 年)",
            "geopoliticalContext": "帝國權力中樞羅馬城，克勞第皇帝驅逐令後猶太信徒與外邦信徒混合群體之張力",
            "primaryLiteraryGenre": "古典辯論法教義論文 (Diatribe)、救贖法律學論證、神聖頌讚 doxology、普世宣教願景信函",
            "covenantAnchor": "【因信稱義與亞伯拉罕之約】：本於信以致於信，恩典藉著義在基督裡作王 (羅 1:17, 4:1-12, 5:21)",
            "christologicalArchetype": "末後的亞當扭轉墮落死咒 (5:12-21)、神所設立的挽回祭 (3:25)、使信徒在聖靈中脫離罪與死之律的基督耶穌 (8:1-2)"
        },
        "canonicalIntertextuality": {
            "tableTitle": "羅馬書正典互文與舊約引用成全對照表",
            "citations": [
                {
                    "sourceRef": "羅 1:17",
                    "targetRef": "哈 2:4",
                    "theologicalEcho": "【因信得生之全書題旨】：神的義在福音上顯明出來，這義是本於信以致於信，如經上所記「義人必因信得生」"
                },
                {
                    "sourceRef": "羅 4:3, 7-8",
                    "targetRef": "創 15:6, 詩 32:1-2",
                    "theologicalEcho": "【亞伯拉罕與大衛雙重見證稱義】：亞伯拉罕信神就算為義（未受割禮前稱義典範）；大衛稱那不算為有罪、罪蒙赦免的人為有福"
                },
                {
                    "sourceRef": "羅 9:25-29, 10:13",
                    "targetRef": "何 1:10, 賽 10:22, 珥 2:32",
                    "theologicalEcho": "【外邦蒙召與以色列餘民得救】：引用何西阿、以賽亞與約珥書，證明外邦信徒被收納為神兒女，凡求告主名的就必得救"
                }
            ]
        }
    },
    46: {
        "bookDossier": {
            "hebrewGreekTitle": "Πρὸς Κορινθίους Αʹ (Pros Korinthious I) / Epistula I ad Corinthios",
            "canonicalOrder": "新約保羅書信第 2 卷 (Pauline Epistles #2) / 十字架智慧重塑世俗文化生活指南",
            "historicalEra": "保羅第三次宣教旅程駐紮以弗所推喇奴學房三年期間 (約主後 55 年春)",
            "writingPeriod": "小亞細亞以弗所城 (約主後 55 年)",
            "geopoliticalContext": "希臘亞該亞商貿十字路口哥林多，希臘哲學思潮、繁華海港、道德淫亂與偶像崇拜交融大都市",
            "primaryLiteraryGenre": "使徒牧養書信、古典修辭答辯（針對分門結黨、訴訟、道德淫亂逐一破題）、愛篇崇高讚歌 (13章)、復活論神學專論 (15章)",
            "covenantAnchor": "十字架愚拙救恩聖約與初熟的果子復活盟約 (林前 1:18-25, 15:20-23)",
            "christologicalArchetype": "釘十字架的神聖大能與智慧、我們逾越節的羔羊 (5:7)、曠野隨行的靈磐石 (10:4)、叫人活的末後亞當 (15:45)"
        },
        "canonicalIntertextuality": {
            "tableTitle": "哥林多前書正典互文與舊約引用成全對照表",
            "citations": [
                {
                    "sourceRef": "林前 1:19, 31",
                    "targetRef": "賽 29:14, 耶 9:24",
                    "theologicalEcho": "【滅絕智慧人的智慧與指主誇口】：神要滅絕智慧人的智慧；誇口的當指著主誇口，十字架徹底顛覆人間自傲"
                },
                {
                    "sourceRef": "林前 5:7-8",
                    "targetRef": "出 12:15-20",
                    "theologicalEcho": "【除淨舊酵守逾越節】：基督是我們逾越節的羔羊已被殺獻祭，信徒當除淨惡毒邪惡的舊酵，用純全真實的無酵餅過節"
                },
                {
                    "sourceRef": "林前 15:54-55",
                    "targetRef": "賽 25:8, 何 13:14",
                    "theologicalEcho": "【死被得勝吞滅凱歌】：死被得勝吞滅的話就應驗了；死啊你的得勝在哪裡？基督復活打破一切死亡終局"
                }
            ]
        }
    },
    47: {
        "bookDossier": {
            "hebrewGreekTitle": "Πρὸς Κορινθίους Βʹ (Pros Korinthious II) / Epistula II ad Corinthios",
            "canonicalOrder": "新約保羅書信第 3 卷 (Pauline Epistles #3) / 最深情使徒自白與瓦器寶貝十架凱歌",
            "historicalEra": "第三次宣教旅程離開以弗所經特羅亞抵達馬其頓 (約主後 55/56 年秋)",
            "writingPeriod": "馬其頓腓立比或帖撒羅尼迦 (約主後 55/56 年)",
            "geopoliticalContext": "哥林多教會假使徒侵入攻擊保羅使徒職分、傳另一個耶穌、自詡異象背景下的生死爭戰",
            "primaryLiteraryGenre": "深情辯護性自白書信 (Apologia)、使徒職分神學論文（新約執事榮耀）、慈惠奉獻神學章程 (8-9章)、屬靈愚妄自誇",
            "covenantAnchor": "【新約聖靈執事榮光】：字句是叫人死，精意（聖靈）是叫人活 (林後 3:6)",
            "christologicalArchetype": "無罪替我們成為罪的代贖主 (5:21)、本來富足為我們成貧窮的恩主 (8:9)、在人軟弱上顯得完全的基督恩典 (12:9)"
        },
        "canonicalIntertextuality": {
            "tableTitle": "哥林多後書正典互文與舊約引用成全對照表",
            "citations": [
                {
                    "sourceRef": "林後 3:7-18",
                    "targetRef": "出 34:29-35",
                    "theologicalEcho": "【摩西褪色面皮榮光與敞著臉返照主榮】：刻在石版屬死的律法尚有榮光，何況刻在心版屬靈的執事！敞著臉得見主的榮光榮上加榮"
                },
                {
                    "sourceRef": "林後 5:21",
                    "targetRef": "賽 53:6, 9-11",
                    "theologicalEcho": "【神使無罪的替我們成為罪】：神使那無罪的替我們成為罪，好叫我們在祂裡面成為神的義；精準呼應以賽亞受苦義僕擔當眾人罪孽"
                },
                {
                    "sourceRef": "林後 6:16-18",
                    "targetRef": "利 26:12, 結 37:27, 賽 52:11",
                    "theologicalEcho": "【永生神的殿與從他們中間出來】：你們是永生神的殿，神要與他們同住同往來；從他們中間出來不可沾不潔之物，作全能主的兒女"
                }
            ]
        }
    },
    48: {
        "bookDossier": {
            "hebrewGreekTitle": "Πρὸς Γαλάτας (Pros Galatas) / Epistula ad Galatas",
            "canonicalOrder": "新約保羅書信第 4 卷 (Pauline Epistles #4) / 基督徒信仰自由大憲章與抗擊律法主義利劍",
            "historicalEra": "第一次宣教旅程結束後不久或耶路撒冷大會前夕 (約主後 48/49 年，或 55 年)",
            "writingPeriod": "敘利亞安提阿 (若為早期論主後 48 年，為保羅最早成文書信之一)",
            "geopoliticalContext": "南加拉太四城（彼息底安提阿、以哥念、路司得、特庇），猶太律法割禮派滲透要求外邦人守摩西律法",
            "primaryLiteraryGenre": "激烈辯駁法庭抗辯信函（略去問安感激語）、自傳式福音源流論證、兩位婦人（夏甲與撒拉）寓意神學解經",
            "covenantAnchor": "應許恩典之約 vs 律法為奴之約 (加 3:15-18, 4:21-31)",
            "christologicalArchetype": "為我們受咒詛贖出我們的基督 (3:13)、由女子所生生在律法以下贖出我們的神子 (4:4-5)、與信徒同釘十架內住的生命之主 (2:20)"
        },
        "canonicalIntertextuality": {
            "tableTitle": "加拉太書正典互文與舊約引用成全對照表",
            "citations": [
                {
                    "sourceRef": "加 3:6, 8",
                    "targetRef": "創 15:6, 12:3",
                    "theologicalEcho": "【亞伯拉罕因信稱義與萬國蒙福】：亞伯拉罕信神就算為他的義；聖經早已預先看明神要叫外邦人因信稱義，就向亞伯拉罕傳福音"
                },
                {
                    "sourceRef": "加 3:10, 13",
                    "targetRef": "申 27:26, 21:23",
                    "theologicalEcho": "【凡掛在木頭上的都受咒詛】：凡不常照律法書所記去行的都被咒詛；基督既為我們受了咒詛，就贖出我們脫離律法的咒詛"
                },
                {
                    "sourceRef": "加 4:22-31",
                    "targetRef": "創 16:15, 21:2, 賽 54:1",
                    "theologicalEcho": "【使女夏甲與自主婦人撒拉兩約比喻】：西奈山屬地耶路撒冷生子為奴，天上自由耶路撒冷生子承受應許，信徒乃是憑應許生的兒女"
                }
            ]
        }
    },
    49: {
        "bookDossier": {
            "hebrewGreekTitle": "Πρὸς Ἐφεσίους (Pros Ephesious) / Epistula ad Ephesios",
            "canonicalOrder": "新約監獄書信首卷 (Prison Epistles #1) / 教會論最高峰與天上屬靈奧秘通函",
            "historicalEra": "保羅第一次羅馬軟禁監獄期間 (主後 60–62 年)",
            "writingPeriod": "帝國首都羅馬獄中 (約主後 60–62 年)",
            "geopoliticalContext": "小亞細亞西岸愛琴海大都會以弗所及周邊各亞西亞教會，亞底米異教女神崇拜與泛靈邪術環境",
            "primaryLiteraryGenre": "巡迴公函 (Encyclical Letter)、三位一體創世救贖頌歌 (1:3-14)、代求長禱、新人合一憲章、神所賜全副軍裝戰備手冊",
            "covenantAnchor": "神在基督裡將天上地上一切所有的都在基督裡同歸於一 (弗 1:9-10, 2:12-16)",
            "christologicalArchetype": "宇宙教會的元首 (1:22)、拆毀猶太與外邦隔斷的牆造成一個新人的和平主宰 (2:14-15)、深愛新婦為教會捨命的新郎 (5:25-32)"
        },
        "canonicalIntertextuality": {
            "tableTitle": "以弗所書正典互文與舊約引用成全對照表",
            "citations": [
                {
                    "sourceRef": "弗 2:13-17",
                    "targetRef": "賽 57:19, 9:6",
                    "theologicalEcho": "【傳和平給遠處的人與近處的人】：基督在十字架廢掉冤仇成就和平，向猶太人與外邦人傳和平福音，將兩下造成一個新人"
                },
                {
                    "sourceRef": "弗 4:8",
                    "targetRef": "詩 68:18",
                    "theologicalEcho": "【祂升上高天擄掠仇敵賞賜恩賜】：引用詩篇得勝神諭，指出基督降下到地底下又升上遠超諸天之上，擄掠仇敵並將恩賜賞給人建立教會"
                },
                {
                    "sourceRef": "弗 5:31-32",
                    "targetRef": "創 2:24",
                    "theologicalEcho": "【二人成為一體的極大奧秘】：人要離開父母與妻子連合二人成為一體；保羅啟示這極大奧秘是指著基督和教會說的"
                },
                {
                    "sourceRef": "弗 6:14-17",
                    "targetRef": "賽 11:5, 59:17",
                    "theologicalEcho": "【穿戴神的全副軍裝】：公義當作護心鏡、救恩當作頭盔、真理束腰，直接承繼以賽亞書耶和華神聖戰士披戴之盔甲武裝"
                }
            ]
        }
    },
    50: {
        "bookDossier": {
            "hebrewGreekTitle": "Πρὸς Φιλιππησίους (Pros Philippesious) / Epistula ad Philippenses",
            "canonicalOrder": "新約監獄書信第 2 卷 (Prison Epistles #2) / 喜樂書信與基督虛己頌歌瑰寶",
            "historicalEra": "保羅第一次羅馬囚禁即將聽候凱撒判決之際 (約主後 61–62 年)",
            "writingPeriod": "羅馬禁衛軍監獄中 (約主後 61–62 年)",
            "geopoliticalContext": "馬其頓行省羅馬特權殖民城邦腓立比，公民權引以為豪，歐洲第一座教會基地",
            "primaryLiteraryGenre": "使徒友誼感激信函 (Letter of Friendship)、初代教會著名基督頌歌 (Carmen Christi 2:5-11)、屬天公民標竿賽跑隱喻",
            "covenantAnchor": "天國屬天公民權與認識基督為至寶的恩約 (腓 3:8, 20-21)",
            "christologicalArchetype": "本有神形像倒空虛己順服至死且死在十架上的僕人基督 (2:6-8)、被神升為至高賜超乎萬名之上之名的大君王 (2:9-11)"
        },
        "canonicalIntertextuality": {
            "tableTitle": "腓立比書正典互文與舊約引用成全對照表",
            "citations": [
                {
                    "sourceRef": "腓 2:9-11",
                    "targetRef": "賽 45:23",
                    "theologicalEcho": "【萬膝屈膝萬口承認基督為主】：以賽亞書神宣告「萬膝必向我跪拜萬口必憑我起誓」，此處神聖主權位格全然賦予升為至高的主耶穌基督"
                },
                {
                    "sourceRef": "腓 3:4-9",
                    "targetRef": "耶 9:23-24, 哈 3:17-18",
                    "theologicalEcho": "【將世俗肉體資本看作糞土以基督為至寶】：割禮家譜宗派資歷皆為有損，只為得著因信基督而來的義"
                }
            ]
        }
    },
    51: {
        "bookDossier": {
            "hebrewGreekTitle": "Πρὸς Κολοσσαεῖς (Pros Kolossaeis) / Epistula ad Colossenses",
            "canonicalOrder": "新約監獄書信第 3 卷 (Prison Epistles #3) / 基督在萬有中居首位之至尊讚歌",
            "historicalEra": "保羅首次羅馬被囚期間 (主後 60–62 年)",
            "writingPeriod": "羅馬獄中與以巴弗相見後寫就 (約主後 60–62 年)",
            "geopoliticalContext": "弗呂家南部呂家谷三城之一歌羅西，面臨東方諾斯底神智異端、拜天使與猶太律法割禮禁慾混合主義威脅",
            "primaryLiteraryGenre": "崇高基督論詩歌 (Christ Hymn 1:15-20)、反駁異端護教論證、家庭倫理行事準則 (Haustafeln)",
            "covenantAnchor": "在愛子裡脫離黑暗遷入愛子光明國度之約 (西 1:13-14)",
            "christologicalArchetype": "不能看見之神的像、首生的在萬有之先 (1:15)、神本性一切豐盛都有形有體居住在祂裡面的宇宙主宰 (2:9)、撤銷定罪字據的十字架勝者 (2:14-15)"
        },
        "canonicalIntertextuality": {
            "tableTitle": "歌羅西書正典互文與舊約引用成全對照表",
            "citations": [
                {
                    "sourceRef": "西 1:15-17",
                    "targetRef": "創 1:1, 箴 8:22-30",
                    "theologicalEcho": "【基督超越萬有居首位】：萬有靠祂造藉祂造為祂造，在萬有之先萬有靠祂而立；創世記創造與箴言智慧在基督身上集大成"
                },
                {
                    "sourceRef": "西 2:14-15",
                    "targetRef": "創 3:15, 詩 68:18",
                    "theologicalEcho": "【十字架撤銷字據擄掠執政掌權者】：基督將律法欠債字據撤去釘在十字架上，公開擄掠幽暗魔鬼權勢，仗著十字架誇勝"
                },
                {
                    "sourceRef": "西 2:16-17",
                    "targetRef": "利 23章全, 民 28-29章",
                    "theologicalEcho": "【飲食節期月朔安息日原是影兒本體是基督】：舊約祭儀節期只是將來之事的影子，那形體的本體乃是基督"
                }
            ]
        }
    },
    52: {
        "bookDossier": {
            "hebrewGreekTitle": "Πρὸς Θεσσαλονικεῖς Αʹ (Pros Thessalonikeis I) / Epistula I ad Thessalonicenses",
            "canonicalOrder": "新約保羅書信第 5 卷 (Pauline Epistles #5) / 末世主降臨盼望與聖潔生活模範",
            "historicalEra": "第二次宣教旅程抵達哥林多不久 (主後 50/51 年)",
            "writingPeriod": "希臘亞該亞哥林多城 (約主後 50/51 年，為保羅現存最早書信之一)",
            "geopoliticalContext": "馬其頓行省首府首要海港帖撒羅尼迦，扼守厄納齊雅大道，初信群體在逼迫患難中堅守真道",
            "primaryLiteraryGenre": "初代宣教親情書信、牧者慈母奶母心腸自白 (2:7-8)、死人復活與主從天降臨末世論啟示專章 (4:13-5:11)",
            "covenantAnchor": "主必親自從天降臨之再臨聖約 (帖前 4:16-17, 5:23)",
            "christologicalArchetype": "救我們脫離將來忿怒的耶穌 (1:10)、在呼叫天使長與神的號筒吹響中親自從天降臨的再臨救主 (4:16)"
        },
        "canonicalIntertextuality": {
            "tableTitle": "帖撒羅尼迦前書正典互文與舊約引用成全對照表",
            "citations": [
                {
                    "sourceRef": "帖前 4:16-17",
                    "targetRef": "出 19:16-19, 賽 27:13, 但 7:13",
                    "theologicalEcho": "【號筒吹響與主自天而降被提】：西奈山神降臨時的角聲與以賽亞大號筒，在主耶穌再臨聖徒空中相會時得著終極歷史實現"
                },
                {
                    "sourceRef": "帖前 5:8",
                    "targetRef": "賽 59:17",
                    "theologicalEcho": "【信望愛之屬天軍裝】：把信和愛當作護心鏡遮胸，把得救的盼望當作頭盔戴上，直接化用以賽亞書耶和華戰士披戴之救恩盔甲"
                }
            ]
        }
    },
    53: {
        "bookDossier": {
            "hebrewGreekTitle": "Πρὸς Θεσσαλονικεῖς Βʹ (Pros Thessalonikeis II) / Epistula II ad Thessalonicenses",
            "canonicalOrder": "新約保羅書信第 6 卷 (Pauline Epistles #6) / 大罪人沉淪之子顯露與基督烈火降臨審判",
            "historicalEra": "前書寄出後數月 (約主後 51 年)",
            "writingPeriod": "哥林多城 (約主後 51 年)",
            "geopoliticalContext": "帖城信徒因假冒書信謠傳「主的日子已經到了」引起恐慌與遊手好閒混亂",
            "primaryLiteraryGenre": "先知性末世啟示書信 (Apocalyptic Epistle)、敵基督神學解析、嚴正勞動生活教規 (「不肯做工就不可吃飯」)",
            "covenantAnchor": "公義審判聖約：使受患難者同得平安，使逼迫者受永遠沉淪 (帖後 1:6-9)",
            "christologicalArchetype": "同祂有能力的天使在烈火中從天顯現的審判之主、用口中的氣滅絕大罪人沉淪之子的得勝基督 (2:8)"
        },
        "canonicalIntertextuality": {
            "tableTitle": "帖撒羅尼迦後書正典互文與舊約引用成全對照表",
            "citations": [
                {
                    "sourceRef": "帖後 2:3-4",
                    "targetRef": "但 7:25, 11:36, 賽 14:13-14",
                    "theologicalEcho": "【大罪人自高自大自稱為神】：末世沉淪之子坐在殿裡自稱是神，直接應驗但以理書狂傲小角與褻瀆君王之預言"
                },
                {
                    "sourceRef": "帖後 2:8",
                    "targetRef": "賽 11:4",
                    "theologicalEcho": "【主用口中的氣滅絕沉淪之子】：主耶穌要用口中的氣滅絕他，用降臨的榮光廢掉他；完全成全以賽亞書大衛苗裔以口中之杖擊打全地之神諭"
                },
                {
                    "sourceRef": "帖後 1:7-9",
                    "targetRef": "賽 66:15, 詩 96:13",
                    "theologicalEcho": "【在烈火中顯現公義審判】：耶和華必在火中降臨施行公義審判，基督顯現徹底清算一切罪孽"
                }
            ]
        }
    }
}

if __name__ == "__main__":
    print(f"Loaded DOSSIER_INTERTEXT_NT_PART1 with {len(DOSSIER_INTERTEXT_NT_PART1)} books (Books 40-53).")
    for b_no in range(40, 54):
        assert b_no in DOSSIER_INTERTEXT_NT_PART1
        d = DOSSIER_INTERTEXT_NT_PART1[b_no]
        assert "bookDossier" in d and len(d["bookDossier"]) >= 6
        assert "canonicalIntertextuality" in d and len(d["canonicalIntertextuality"]["citations"]) >= 2
    print("NT Part 1 Verified successfully!")
