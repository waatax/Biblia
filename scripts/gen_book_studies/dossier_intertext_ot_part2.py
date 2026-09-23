# -*- coding: utf-8 -*-
"""
Book Dossier & Canonical Intertextuality Datasets for Old Testament Part 2 (Books 11-22).
Books covered:
11: 1 Kings (列王紀上)
12: 2 Kings (列王紀下)
13: 1 Chronicles (歷代志上)
14: 2 Chronicles (歷代志下)
15: Ezra (以斯拉記)
16: Nehemiah (尼希米記)
17: Esther (以斯帖記)
18: Job (約伯記)
19: Psalms (詩篇)
20: Proverbs (箴言)
21: Ecclesiastes (傳道書)
22: Song of Songs (雅歌)
"""

DOSSIER_INTERTEXT_OT_PART2 = {
    11: {
        "bookDossier": {
            "hebrewGreekTitle": "מְלָכִים א (Melakhim Alef) / Βασιλειῶν Γʹ (Kingdoms III) / Liber I Regum",
            "canonicalOrder": "舊約前先知書第 4 卷上部 (Former Prophets #4a) / 榮耀聖殿與分裂衰微史",
            "historicalEra": "所羅門登基黃金盛世至亞哈王戰死 (主前 970–853 年)",
            "writingPeriod": "被擄巴比倫時期先知性修史 (約主前 560–538 年)",
            "geopoliticalContext": "所羅門地中海與紅海貿易盛世；南北分裂後北國以色列（暗利、亞哈）與南國猶大，面對亞蘭與新亞述崛起",
            "primaryLiteraryGenre": "皇家正史年表、聖殿建造銘刻文獻、先知以利亞傳奇奇蹟敘事",
            "covenantAnchor": "大衛王約的試煉與聖殿獻殿之約 (王上 8:22-53, 9:1-9)",
            "christologicalArchetype": "所羅門超越的屬天智慧 (比所羅門更大)、以利亞先知事奉（施洗約翰來臨之影）、榮美聖殿真本體"
        },
        "canonicalIntertextuality": {
            "tableTitle": "列王紀上記正典互文與新約引用成全對照表",
            "citations": [
                {
                    "sourceRef": "王上 10:1-9",
                    "targetRef": "太 12:42, 路 11:31",
                    "theologicalEcho": "【示巴女王朝見所羅門】：南方的女王要起來定這世代的罪，因為她從地極來要聽所羅門的智慧話；看哪，在這裡有一人比所羅門更大！"
                },
                {
                    "sourceRef": "王上 19:10-18",
                    "targetRef": "羅 11:2-5",
                    "theologicalEcho": "【神留下七千未拜巴力之餘民】：保羅以此印證神未曾棄絕祂預先知道的百姓，在任何黑暗背道世代神都按著恩典保留屬天餘民"
                }
            ]
        }
    },
    12: {
        "bookDossier": {
            "hebrewGreekTitle": "מְלָכִים ב (Melakhim Bet) / Βασιλειῶν Δʹ (Kingdoms IV) / Liber II Regum",
            "canonicalOrder": "舊約前先知書第 4 卷下部 (Former Prophets #4b) / 亡國被擄與神聖公義審判史",
            "historicalEra": "亞哈謝登基至猶大亡國聖殿被焚（主前 853–586 年，歷時近三百年）",
            "writingPeriod": "被擄巴比倫初期由耶利米或先知學派編撰 (約主前 560–538 年)",
            "geopoliticalContext": "亞述帝國滅北國撒瑪利亞 (主前 722 年)；新巴比倫帝國尼布甲尼撒三破耶路撒冷滅南國 (主前 586 年)",
            "primaryLiteraryGenre": "先知以利沙神蹟敘事、王室評鑑編年體、聖殿毀滅哀歌歷史",
            "covenantAnchor": "背約受詛與大衛燈光不滅恩約 (王下 8:19, 17:7-23, 25:27-30)",
            "christologicalArchetype": "以利沙憐憫救贖神蹟（使死人復活、乃縵麻風得潔、麵餅吃飽）、約雅斤在巴比倫抬頭得恩待（大衛苗裔不斷）"
        },
        "canonicalIntertextuality": {
            "tableTitle": "列王紀下記正典互文與新約引用成全對照表",
            "citations": [
                {
                    "sourceRef": "王下 5:1-14",
                    "targetRef": "路 4:27",
                    "theologicalEcho": "【敘利亞乃縵麻風潔淨】：先知以利沙的時候以色列有許多長大麻風的，只有敘利亞的乃縵得潔淨，耶穌用以啟示恩典臨及外邦"
                },
                {
                    "sourceRef": "王下 2:9-12",
                    "targetRef": "太 17:3, 可 9:4, 路 9:30",
                    "theologicalEcho": "【以利亞乘旋風升天與變像山顯現】：以利亞未經死亡被接升天，黑門山上與摩西一同向顯露榮光之基督顯現談論祂受難受死之事"
                }
            ]
        }
    },
    13: {
        "bookDossier": {
            "hebrewGreekTitle": "דִּבְרֵי הַיָּמִים א (Divrei HaYamim Alef,「歷代大事記上」) / Παραλειπομένων Αʹ / Liber I Paralipomenon",
            "canonicalOrder": "希伯來正典聖卷第 11 卷 (Ketuvim #11) / 歸回群體大衛正統家譜聖殿敬拜史",
            "historicalEra": "始祖亞當家譜跨越千年至大衛離世 (創世至主前 970 年)",
            "writingPeriod": "波斯統治回歸重建時期，傳統認為文士以斯拉執筆 (約主前 450–400 年)",
            "geopoliticalContext": "波斯帝國耶胡德省（Yehud）貧弱歸回省民，身處列邦環伺與身分認同危機中",
            "primaryLiteraryGenre": "神聖普世正典家譜、祭司視角大衛正史、利未利器聖樂敬拜禮儀紀實",
            "covenantAnchor": "永遠大衛王約與利未敬拜條約 (代上 17:11-15, 23-26章)",
            "christologicalArchetype": "家譜終極後裔基督、大衛帳幕敬拜之復興（阿摩司與使徒行傳呼應）、買禾場預備至聖殿堂"
        },
        "canonicalIntertextuality": {
            "tableTitle": "歷代志上記正典互文與新約引用成全對照表",
            "citations": [
                {
                    "sourceRef": "代上 1-3章",
                    "targetRef": "太 1:1-16, 路 3:23-38",
                    "theologicalEcho": "【基督神聖家譜之骨幹】：歷代志開篇九章家譜上溯亞當直貫大衛，為新約馬太與路加福音確立基督彌賽亞之合法正統血統"
                },
                {
                    "sourceRef": "代上 17:11-14",
                    "targetRef": "路 1:32-33, 來 1:5",
                    "theologicalEcho": "【大衛王室與神聖國度】：神應許「我卻要將他永遠堅立在我家和我國裡，他的國位也必堅定直到永遠」，直接指向基督天國"
                }
            ]
        }
    },
    14: {
        "bookDossier": {
            "hebrewGreekTitle": "דִּבְרֵי הַיָּמִים ב (Divrei HaYamim Bet,「歷代大事記下」) / Παραλειπομένων Βʹ / Liber II Paralipomenon",
            "canonicalOrder": "希伯來正典聖卷最末卷 (Ketuvim 終卷 / 希伯來舊約聖經最後一卷)",
            "historicalEra": "所羅門建殿至波斯王居魯士下詔歸回 (主前 970–538 年)",
            "writingPeriod": "波斯統治回歸時期由文士以斯拉完成 (約主前 450–400 年)",
            "geopoliticalContext": "從所羅門王國榮耀、歷代猶大列王復興與墮落，歷經巴比倫被擄七十年，到波斯帝國居魯士大帝登基",
            "primaryLiteraryGenre": "神學歷史敘事、聖殿復興記實（希西家、約西亞宗教改革）、居魯士復興敕令",
            "covenantAnchor": "聖殿禱告應許：「這稱為我名下的子民若自卑、禱告、尋求我的面、轉離他們的惡行」 (代下 7:14)",
            "christologicalArchetype": "毀壞三日重建的真聖殿基督 (約 2:19)、居魯士下詔救贖者（彌賽亞受膏牧者）、全舊約以「上去建殿」盼望結束"
        },
        "canonicalIntertextuality": {
            "tableTitle": "歷代志下記正典互文與新約引用成全對照表",
            "citations": [
                {
                    "sourceRef": "代下 7:14",
                    "targetRef": "雅 4:8-10, 彼前 5:6",
                    "theologicalEcho": "【自卑禱告蒙神醫治全地】：神向所羅門顯現的認罪悔改金約，成為新約信徒竭力自卑、親近神、蒙神升高救拔的永恆依據"
                },
                {
                    "sourceRef": "代下 24:20-22",
                    "targetRef": "太 23:35, 路 11:51",
                    "theologicalEcho": "【從亞伯的血到撒迦利亞的血】：耶穌痛斥猶太宗教領袖流義人血，以創世記「亞伯」至舊約正典終卷歷代志下「祭司撒迦利亞被殺」囊括全舊約受害義人"
                },
                {
                    "sourceRef": "代下 36:22-23",
                    "targetRef": "拉 1:1-3, 賽 44:28",
                    "theologicalEcho": "【居魯士下詔返鄉建殿】：全本希伯來正典以居魯士宣告「耶和華以色列的神要他上去」作壓軸句，宣告神掌管外邦帝國成全救恩"
                }
            ]
        }
    },
    15: {
        "bookDossier": {
            "hebrewGreekTitle": "עֶזְרָא (Ezra,「幫助/耶和華是幫助」) / Ἔσδρας (Esdras) / Liber Esdrae",
            "canonicalOrder": "舊約歷史書歸回重建第 1 卷 / 聖殿祭壇與律法回歸史",
            "historicalEra": "波斯居魯士元年至亞達薛西統治年間 (主前 538–458 年)",
            "writingPeriod": "第二次回歸後由精通摩西律法的文士以斯拉執筆 (約主前 450 年)",
            "geopoliticalContext": "阿契美尼德波斯帝國統治下猶太行省（居魯士、大利烏一世、亞達薛西一世敕令）",
            "primaryLiteraryGenre": "官方皇家波斯公文與檔案詔書（亞蘭文記載 4:8-6:18, 7:12-26）、回歸家譜清單、贖罪懺悔禱文",
            "covenantAnchor": "聖民身分分別為聖與守摩西律法之約 (拉 9:1-15, 10:3)",
            "christologicalArchetype": "所羅巴伯預表大衛苗裔領袖、以斯拉作大祭司文士中保宣講神言、回歸聖殿迎接未來彌賽亞臨格"
        },
        "canonicalIntertextuality": {
            "tableTitle": "以斯拉記正典互文與新約引用成全對照表",
            "citations": [
                {
                    "sourceRef": "拉 7:10",
                    "targetRef": "提後 2:15, 雅 1:22",
                    "theologicalEcho": "【立志考究遵行教訓律法】：以斯拉立志考究遵行耶和華律法並教導人，奠定初代教會無愧工人、聽道且行道的教牧標準"
                },
                {
                    "sourceRef": "拉 3:10-13",
                    "targetRef": "該 2:7-9, 約 2:19",
                    "theologicalEcho": "【第二聖殿奠基喜泣交加】：老年人哭初殿輝煌，少年人大聲歡呼；先知預言這殿後來的榮耀必大過先前的榮耀，基督道成肉身親臨聖殿"
                }
            ]
        }
    },
    16: {
        "bookDossier": {
            "hebrewGreekTitle": "נְחֶמְיָה (Nechemyah,「耶和華是安慰」) / Νεεμίας (Neemias) / Liber Nehemiae",
            "canonicalOrder": "舊約歷史書歸回重建第 2 卷 / 城牆建造與社會治理改革史",
            "historicalEra": "波斯亞達薛西王二十年至三十二年 (主前 445–432 年)",
            "writingPeriod": "尼希米返回書珊城後寫就之第一人稱回憶錄 (約主前 430 年)",
            "geopoliticalContext": "波斯帝國書珊王宮酒政要職奉差赴耶路撒冷，面對參巴拉、多比雅等周邊敵對勢力軍事恐嚇",
            "primaryLiteraryGenre": "第一人稱公僕回憶錄、建築工程工班排程表、同心抵禦軍事防務日誌、全體簽名立約書",
            "covenantAnchor": "修牆守約防禦異端與安息日聖化之約 (尼 9:38, 10:28-39)",
            "christologicalArchetype": "尼希米捨己服事不吃省長俸祿（基督降卑僕人樣式）、一手做工一手拿兵器（信徒屬靈爭戰建堂）"
        },
        "canonicalIntertextuality": {
            "tableTitle": "尼希米記正典互文與新約引用成全對照表",
            "citations": [
                {
                    "sourceRef": "尼 8:1-8",
                    "targetRef": "徒 8:30-35, 提後 4:2",
                    "theologicalEcho": "【宣讀律法書清清楚楚講明】：以斯拉清清楚楚念神律法書並講明意思使百姓明白，奠定新約教會講道釋經、使人明白救恩之典範"
                },
                {
                    "sourceRef": "尼 4:17-18",
                    "targetRef": "弗 6:10-18",
                    "theologicalEcho": "【一手做工一手拿兵器】：修造城牆者一手做工一手拿兵器，預表基督精兵在地上既要建造教會身體，又要穿戴神所賜全副軍裝抵擋魔鬼"
                }
            ]
        }
    },
    17: {
        "bookDossier": {
            "hebrewGreekTitle": "אֶסְתֵּר (Ester,「星」/波斯語語源) / Ἐσθήρ (Esther) / Liber Esther",
            "canonicalOrder": "舊約聖卷五小卷之五 (Megilloth #5) / 普珥節必讀反轉救贖史詩",
            "historicalEra": "波斯亞哈隨魯王（薛西斯一世 Xerxes I）在位年間 (主前 486–465 年)",
            "writingPeriod": "薛西斯統治結束後不久由波斯宮廷猶太史官或末底改記載 (約主前 460–400 年)",
            "geopoliticalContext": "阿契美尼德波斯帝國極盛全境（從印度至古實跨洲一百二十七行省），冬宮書珊城城堡",
            "primaryLiteraryGenre": "波斯宮廷敘事小說體裁、文學諷刺喜劇反轉 (Peripeteia)、節期起源憲章 (Aition)",
            "covenantAnchor": "神隱蔽之天理護理（Providencia Dei）與普珥節反轉慶典 (斯 4:14, 9:20-28)",
            "christologicalArchetype": "以斯帖冒死代求（基督十架代求中保）、「我若死就死吧」順服、哈曼木架反殺仇敵（十架粉碎魔鬼死權）"
        },
        "canonicalIntertextuality": {
            "tableTitle": "以斯帖記正典互文與新約引用成全對照表",
            "citations": [
                {
                    "sourceRef": "斯 4:14-16",
                    "targetRef": "來 4:16, 7:25",
                    "theologicalEcho": "【冒死進見與坦然進至施恩寶座】：以斯帖冒死違例進見波斯王為民求命；基督親自作完美中保使我們得以坦然無懼來到施恩寶座前得憐恤"
                },
                {
                    "sourceRef": "斯 7:9-10",
                    "targetRef": "西 2:14-15, 來 2:14",
                    "theologicalEcho": "【哈曼懸掛自造木架反轉勝仗】：撒但藉十字架欲致基督於死地，神卻在十字架上將執政掌權的擄來仗著十架誇勝，以死廢掉掌死權的"
                }
            ]
        }
    },
    18: {
        "bookDossier": {
            "hebrewGreekTitle": "אִיּוֹב (Iyyov,「受仇敵攻擊者」) / Ἰώβ (Iob) / Liber Iob",
            "canonicalOrder": "希伯來正典聖卷智慧書第 1 卷 (Wisdom Literature #1) / 神義論哲學史詩巔峰",
            "historicalEra": "族長亞伯拉罕時代或更早 (約主前 2000–1800 年，以壽數與獻祭形式為證)",
            "writingPeriod": "族長時代口傳，於所羅門智慧盛世由神聖作者筆之於書 (約主前 10 世紀)",
            "geopoliticalContext": "烏斯地（靠近以東荒漠與阿拉伯北部沙漠綠洲），超越以色列國界之普世智慧舞台",
            "primaryLiteraryGenre": "散文序幕結尾框架、高超希伯來對偶辯論長詩、神聖旋風神諭大問 (Theophany)",
            "covenantAnchor": "苦難中的無條件純全信心與救贖主永活之約 (伯 1:9, 19:25-27)",
            "christologicalArchetype": "無辜受苦義人約伯、天庭神人中保仲裁者 (9:33)、「我知道我的救贖主活著」(19:25)、為控告其三友獻祭代求"
        },
        "canonicalIntertextuality": {
            "tableTitle": "約伯記正典互文與新約引用成全對照表",
            "citations": [
                {
                    "sourceRef": "伯 19:25-27",
                    "targetRef": "林前 15:20, 帖前 4:16, 約 11:25",
                    "theologicalEcho": "【救贖主永活與肉身復活見主】：約伯在極度病痛中宣告「我知道我的救贖主活著，末了必站立在地上，我這皮肉滅絕之後我必在肉體之外得見神」"
                },
                {
                    "sourceRef": "伯 9:33",
                    "targetRef": "提前 2:5, 來 8:6",
                    "theologicalEcho": "【神人間需要聽訟之中保】：約伯痛呼在人與神之間沒有聽訟的仲裁者把手按在兩造身上；新約宣告基督正是那唯一的中保"
                },
                {
                    "sourceRef": "伯 42:10",
                    "targetRef": "雅 5:11",
                    "theologicalEcho": "【約伯的忍耐與主給他的結局】：你們聽見過約伯的忍耐，也知道主給他的結局，明顯主是滿心憐憫大有慈悲"
                }
            ]
        }
    },
    19: {
        "bookDossier": {
            "hebrewGreekTitle": "תְּהִלִּים (Tehillim,「讚美詩」) / Ψαλμοί (Psalmoi) / Liber Psalmorum",
            "canonicalOrder": "希伯來正典聖卷首卷 (Ketuvim #1) / 全本聖經崇拜祈禱頌讚心臟",
            "historicalEra": "摩西時代至被擄歸回時期，橫跨千年的靈魂呼求 (約主前 1440–430 年)",
            "writingPeriod": "大衛、亞薩、可拉後裔、所羅門等先後創作，被擄歸回時期編輯成五卷",
            "geopoliticalContext": "猶大山地、耶路撒冷錫安聖殿、隱基底曠野洞穴、巴比倫河畔被擄異鄉",
            "primaryLiteraryGenre": "希伯來抒情詩歌、平行對偶律、讚美詩、哀歌、朝聖上行詩、懺悔詩、彌賽亞受膏君王詩",
            "covenantAnchor": "大衛永遠聖約的敬拜頌歌與錫安神權寶座 (詩 89, 132篇)",
            "christologicalArchetype": "彌賽亞受膏受苦復活登基全景：受苦十架 (22篇)、好牧人 (23篇)、得勝君王 (2篇)、麥基洗德祭司 (110篇)、房角石 (118篇)"
        },
        "canonicalIntertextuality": {
            "tableTitle": "詩篇正典互文與新約引用成全對照表",
            "citations": [
                {
                    "sourceRef": "詩 22:1, 16-18",
                    "targetRef": "太 27:46, 約 19:24, 來 2:12",
                    "theologicalEcho": "【各各他十架受難驚人寫照】：基督在十架上引「我的神我的神為什麼離棄我」，扎手扎腳、分外衣拈鬮細節全數精準成全"
                },
                {
                    "sourceRef": "詩 110:1, 4",
                    "targetRef": "太 22:44, 徒 2:34-35, 來 5:6, 7:17",
                    "theologicalEcho": "【全本新約引用次數最多之彌賽亞經文】：「主對我主說你坐在我的右邊」證明基督是大衛之主，「照麥基洗德等次永遠為祭司」奠定大祭司論"
                },
                {
                    "sourceRef": "詩 118:22-23",
                    "targetRef": "太 21:42, 徒 4:11, 彼前 2:7",
                    "theologicalEcho": "【匠人所棄的石頭已成房角的頭塊石頭】：耶穌親引此詩宣告自己被猶太宗教領袖棄絕，卻成為神殿宇永恆房角石"
                }
            ]
        }
    },
    20: {
        "bookDossier": {
            "hebrewGreekTitle": "מִשְׁלֵי (Mishlei,「箴言/比喻」) / Παροιμίαι (Paroimiai) / Liber Proverbiorum",
            "canonicalOrder": "舊約聖卷智慧書第 2 卷 (Wisdom Literature #2) / 日常敬虔生活實踐大百科",
            "historicalEra": "所羅門登基盛世至希西家王整理時期 (約主前 970–700 年)",
            "writingPeriod": "所羅門輯錄主體，希西家王文士抄錄補充雅基兒子亞古珥及利慕伊勒母親言語 (約主前 700 年前成書)",
            "geopoliticalContext": "古代近東國際宮廷智慧交流繁盛期（埃及阿曼尼摩比箴言等同時代背景對照）",
            "primaryLiteraryGenre": "短警句格言 (Mashal)、擬人化智慧長詩、兩條道路倫理對比（愚蒙與智慧、淫婦與才德婦人）",
            "covenantAnchor": "西奈盟約倫理在世俗日常、家庭、職場與言語中的細緻具現化（「敬畏耶和華是智慧的開端」）(箴 1:7, 9:10)",
            "christologicalArchetype": "創世以前神身旁的擬人化先在「神聖智慧」(8:22-31)、道成肉身成全神的智慧（林前 1:30「神使基督成為我們的智慧」）"
        },
        "canonicalIntertextuality": {
            "tableTitle": "箴言正典互文與新約引用成全對照表",
            "citations": [
                {
                    "sourceRef": "箴 8:22-30",
                    "targetRef": "約 1:1-3, 西 1:15-17",
                    "theologicalEcho": "【太初創造之神聖智慧與永恆道】：智慧在創造之初與神同在，新約使徒指明這正是太初有道、萬有藉祂而造的基督"
                },
                {
                    "sourceRef": "箴 3:11-12",
                    "targetRef": "來 12:5-6, 啟 3:19",
                    "theologicalEcho": "【父對愛子的管教】：不可輕看主的管教，因為主所愛的祂必管教；希伯來書以此安慰在逼迫試煉中受苦的基督徒"
                },
                {
                    "sourceRef": "箴 25:21-22",
                    "targetRef": "羅 12:20",
                    "theologicalEcho": "【把炭火堆在仇敵頭上】：仇敵餓了給他吃渴了給他喝，保羅直接引用作為基督徒以善勝惡、活出天國之愛的實踐律"
                }
            ]
        }
    },
    21: {
        "bookDossier": {
            "hebrewGreekTitle": "קֹהֶלֶת (Qohelet,「傳道者/召集人」) / Ἐκκλησιαστής (Ekklesiastes) / Liber Ecclesiastes",
            "canonicalOrder": "舊約聖卷五小卷之三 (Megilloth #3) / 住棚節慶典研讀思想人生之書",
            "historicalEra": "所羅門王晚年極盡富貴榮華反思時期 (約主前 935 年)",
            "writingPeriod": "所羅門王晚年撰寫 (約主前 935 年)",
            "geopoliticalContext": "以色列全盛繁華期，世俗財富、知識、享樂與權力達到頂點，卻看透日光之下的極致虛空",
            "primaryLiteraryGenre": "自傳式哲學反思剖析、批判性智慧散文、哀歌格言、存在主義反轉認信",
            "covenantAnchor": "終極審判信仰：「敬畏神，謹守祂的誡命，這是人所當盡的本分，因為人所做的事連一切隱藏的事神都必審問」 (傳 12:13-14)",
            "christologicalArchetype": "打破「日光之下虛空」的唯一日光之上主宰基督、唯一的好牧人 (12:11)、賦予短暫生命永恆重量的復活者"
        },
        "canonicalIntertextuality": {
            "tableTitle": "傳道書正典互文與新約引用成全對照表",
            "citations": [
                {
                    "sourceRef": "傳 1:2, 3:11",
                    "targetRef": "羅 8:20-22, 約 4:14",
                    "theologicalEcho": "【受造之物服在虛妄之下】：保羅指出受造之物服在虛空之下不是自己願意，乃在乎那叫他如此的，盼望脫離敗壞轄制得享基督自由"
                },
                {
                    "sourceRef": "傳 12:13-14",
                    "targetRef": "林後 5:10, 羅 14:10-12",
                    "theologicalEcho": "【基督台前的終極審判】：神審問一切隱秘善惡，新約定性為眾人都要在基督台前顯露出來，按所行的受報"
                }
            ]
        }
    },
    22: {
        "bookDossier": {
            "hebrewGreekTitle": "שִׁיר הַשִּׁירִים (Shir HaShirim,「歌中的歌/妙歌」) / ᾎσμα ᾈσμάτων (Asma Asmaton) / Canticum Canticorum",
            "canonicalOrder": "舊約聖卷五小卷之首 (Megilloth #1) / 逾越節必誦讀神聖至聖之歌",
            "historicalEra": "所羅門王統治早中期 (約主前 960 年前後)",
            "writingPeriod": "所羅門極盛時期創作 (約主前 960 年)",
            "geopoliticalContext": "北國書念鄉間純樸葡萄園田野與耶路撒冷奢華大理石王宮象牙樓",
            "primaryLiteraryGenre": "希伯來婚禮抒情對話詩歌集、愛情頌歌、男女對唱互答、花園葡萄園自然象徵主義",
            "covenantAnchor": "盟約之愛的專一忠貞：「愛情如死之堅強，嫉恨如陰間之殘忍」 (歌 8:6-7)",
            "christologicalArchetype": "基督是新郎、教會是純潔新婦；基督為新婦捨命、新婦切切尋求愛良人、羔羊婚娶之永恆筵席 (啟 19:7)"
        },
        "canonicalIntertextuality": {
            "tableTitle": "雅歌正典互文與新約引用成全對照表",
            "citations": [
                {
                    "sourceRef": "歌 2:16, 6:3",
                    "targetRef": "弗 5:25-32, 啟 19:7-9",
                    "theologicalEcho": "【良人屬我我也屬良人之盟約聯合】：丈夫愛妻子正如基督愛教會為教會捨命，二人成為一體的極大奧秘指著基督和教會說的"
                },
                {
                    "sourceRef": "歌 8:6-7",
                    "targetRef": "約 15:13, 羅 8:35-39",
                    "theologicalEcho": "【無可隔絕的如死之堅強大愛】：大水不能息滅洪水不能淹沒，預表基督十字架無與倫比的大愛，沒有任何受造之物能使我們與基督的愛隔絕"
                }
            ]
        }
    }
}

if __name__ == "__main__":
    print(f"Loaded DOSSIER_INTERTEXT_OT_PART2 with {len(DOSSIER_INTERTEXT_OT_PART2)} books (Books 11-22).")
    for b_no in range(11, 23):
        assert b_no in DOSSIER_INTERTEXT_OT_PART2
        d = DOSSIER_INTERTEXT_OT_PART2[b_no]
        assert "bookDossier" in d and len(d["bookDossier"]) >= 6
        assert "canonicalIntertextuality" in d and len(d["canonicalIntertextuality"]["citations"]) >= 2
    print("OT Part 2 Verified successfully!")
