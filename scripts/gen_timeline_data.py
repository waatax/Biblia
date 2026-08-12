# -*- coding: utf-8 -*-
"""
Generate app/data/timeline_data.js containing Bible Chronology, Prophets Timeline, Jewish Calendar & Feasts, and Diagram data.
"""
import json
import os

TIMELINE_DATA = {
    # 1. 聖經歷史大年表 (Biblical Eras Chronology)
    "eras": [
        {
            "id": "creation",
            "name": "遠古與族長時代 (Creation & Patriarchs)",
            "period": "約公元前 2000 年以前 - 1800 年",
            "books": ["創世記 1-50", "約伯記"],
            "summary": "上帝創造天地萬物、人的墮落、大洪水與巴別塔。上帝呼召亞伯拉罕立約，經以撒、雅各（以色列）與約瑟下埃及。",
            "events": [
                {"year": "太古", "event": "上帝創造天地、人類墮落、諾亞大洪水、巴別塔"},
                {"year": "約 BC 2000", "event": "亞伯拉罕蒙召離開吾珥，前往迦南應許之地"},
                {"year": "約 BC 1900", "event": "以撒生雅各，雅各改名以色列，十二支派祖先"},
                {"year": "約 BC 1875", "event": "約瑟被賣至埃及作宰相，雅各全家 70 人下埃及避荒"}
            ]
        },
        {
            "id": "exodus",
            "name": "出埃及與曠野時代 (Exodus & Wilderness)",
            "period": "約公元前 1446 年 - 1406 年",
            "books": ["出埃及記", "利未記", "民數記", "申命記"],
            "summary": "以色列人在埃及受苦400年後，上帝興起摩西降十災、過紅海、西奈山立約賜十誡與會幕，因不信在曠野漂流40年。",
            "events": [
                {"year": "約 BC 1446", "event": "摩西領以色列人出埃及，過紅海，進入西奈曠野"},
                {"year": "約 BC 1445", "event": "西奈山頒布十誡與約書，建造會幕，利未祭司制度建立"},
                {"year": "約 BC 1444", "event": "加低斯巴尼亞十二探子事件，以色列人漂流曠野 40 年"},
                {"year": "約 BC 1406", "event": "摩西在摩押平原重申律法（申命記），登尼波山離世"}
            ]
        },
        {
            "id": "conquest",
            "name": "征服迦南與士師時代 (Conquest & Judges)",
            "period": "約公元前 1406 年 - 1050 年",
            "books": ["約書亞記", "士師記", "路得記"],
            "summary": "約書亞領百姓過約旦海攻取迦南並分劃地業。約書亞死後進入士師時代，百姓陷於「犯罪-受苦-呼求-拯救」的黑暗循環。",
            "events": [
                {"year": "約 BC 1406", "event": "約書亞率軍過約旦海，攻破耶利哥城，征服迦南"},
                {"year": "約 BC 1390", "event": "十二支派分劃迦南地業，設立逃城"},
                {"year": "約 BC 1375-1050", "event": "士師治理時期：俄陀涅、底波拉、基甸、耶弗他、參孫等拯救以色列"},
                {"year": "約 BC 1100", "event": "路得與波阿斯的忠愛故事，大衛王祖先誕生於伯利恆"}
            ]
        },
        {
            "id": "united_kingdom",
            "name": "統一王國時代 (United Kingdom)",
            "period": "公元前 1050 年 - 931 年",
            "books": ["撒母耳記上下", "列王紀上 1-11", "歷代志上", "歷代志下 1-9", "詩篇", "箴言", "傳道書", "雅歌"],
            "summary": "撒母耳膏立以色列第一位君王掃羅。大衛建立耶路撒冷為首都並蒙上帝賜「大衛之約」。所羅門建榮耀聖殿，晚年離異引致分國。",
            "events": [
                {"year": "約 BC 1050", "event": "掃羅登基為以色列第一任君王"},
                {"year": "BC 1010", "event": "大衛於希伯崙登基，後統一全國，定都耶路撒冷，迎約櫃"},
                {"year": "BC 1000", "event": "上帝與大衛立永約（大衛之約，應許王位永遠堅立）"},
                {"year": "BC 970", "event": "所羅門登基，建造第一聖殿（歷時 7 年完工），以色列王國鼎盛"},
                {"year": "BC 931", "event": "所羅門離世，羅波安繼位，十支派反叛，王國正式分裂"}
            ]
        },
        {
            "id": "divided_kingdom",
            "name": "南北國分裂時代 (Divided Kingdom)",
            "period": "公元前 931 年 - 586 年",
            "books": ["列王紀上下", "歷代志下 10-36", "以賽亞書", "耶利米書", "何西阿書", "約珥書", "阿摩司書", "俄巴底亞書", "彌迦書", "那鴻書", "哈巴谷書", "西番雅書"],
            "summary": "王國分裂為北國以色列（首都合瑪利亞，19王皆惡，BC 722 亡於亞述）與南國猶大（首都耶路撒冷，大衛後裔，BC 586 亡於巴比倫）。先知興起警告悔改。",
            "events": [
                {"year": "BC 931", "event": "北國以色列（耶羅波安，拜金牛犢）與南國猶大（羅波安）分裂"},
                {"year": "BC 860", "event": "以利亞與以利沙先知在北國行大能神蹟抵抗巴力崇拜"},
                {"year": "BC 760-750", "event": "阿摩司與何西阿先知向北國發出社會公義與悔改警告"},
                {"year": "BC 740-680", "event": "以賽亞與彌迦先知向南國猶大傳講審判與彌賽亞降臨預言"},
                {"year": "BC 722", "event": "北國以色列首都撒瑪利亞陷落，北國亡於亞述帝國，百姓被拋散"},
                {"year": "BC 622", "event": "南國約西亞王大改革，律法書重見，清除丘壇"},
                {"year": "BC 605, 597, 586", "event": "巴比倫尼布甲尼撒王三次圍攻耶路撒冷，但以理、以西結先後被擄"},
                {"year": "BC 586", "event": "耶路撒冷城牆被毀，所羅門聖殿被焚，南國猶大亡於巴比倫，全面被擄"}
            ]
        },
        {
            "id": "exile_return",
            "name": "被擄與歸回重建時代 (Exile & Return)",
            "period": "公元前 586 年 - 400 年",
            "books": ["以西結書", "但以理書", "以斯拉記", "尼希米記", "以斯帖記", "哈該書", "撒迦利亞書", "瑪拉基書"],
            "summary": "猶太人在巴比倫被擄 70 年。波斯帝國滅巴比倫後，古列王發詔允許猶太人分三批歸回故土，重建聖殿與城牆，復興律法。",
            "events": [
                {"year": "BC 586-538", "event": "巴比倫被擄時期：以西結見枯骨復生異象，但以理在巴比倫朝廷立志"},
                {"year": "BC 539", "event": "波斯帝國波斯王古列（居魯士）滅巴比倫"},
                {"year": "BC 538", "event": "古列頒布詔書，所羅巴伯率第一批猶太人歸回 Jerusalem"},
                {"year": "BC 520-516", "event": "先知哈該與撒迦利亞鼓勵建殿，第二聖殿於 BC 516 竣工完工"},
                {"year": "BC 483-473", "event": "以斯帖在波斯王宮拯救猶太人免遭哈曼滅絕，訂立普洱節"},
                {"year": "BC 458", "event": "文士以斯拉率第二批歸回，推動信仰與律法大復興"},
                {"year": "BC 445", "event": "尼希米率第三批歸回，52 天內重建耶路撒冷城牆"},
                {"year": "BC 430-400", "event": "瑪拉基先知事工，舊約聖經正典正滿正封，進入兩約中間400年沉默期"}
            ]
        },
        {
            "id": "intertestamental",
            "name": "兩約中間時代 (Intertestamental Silent Period)",
            "period": "公元前 400 年 - 公元前 4 年",
            "books": ["死海古卷、次經、馬加比傳（歷史背景）"],
            "summary": "舊約完結至新約基督降生之間的400年。經歷亞歷山大大帝希臘化、安提阿古四世污穢聖殿、馬加比家族修殿節反抗及羅馬帝國統治。",
            "events": [
                {"year": "BC 332", "event": "亞歷山大大帝征服波斯，希臘文化與希臘文普及（七十士譯本 SEPTUAGINT 誕生）"},
                {"year": "BC 167", "event": "敘利亞王安提阿古四世在聖殿獻豬肉污穢祭壇，禁止割禮與安息日"},
                {"year": "BC 164", "event": "馬加比家族發起革命起義，奪回聖殿，潔淨獻殿（修殿節/光明節 Hanukkah）"},
                {"year": "BC 63", "event": "羅馬將軍龐培攻佔耶路撒冷，猶太地納入羅馬帝國版圖"},
                {"year": "BC 37", "event": "大希律王被羅馬元老院立為猶太人之王，擴建第二聖殿"}
            ]
        },
        {
            "id": "new_testament",
            "name": "新約基督與使徒時代 (Christ & New Testament Church)",
            "period": "公元前 4 年 - 公元 100 年",
            "books": ["馬太福音", "馬可福音", "路加福音", "約翰福音", "使徒行傳", "保羅書信(13封)", "希伯來書", "通用書信(7封)", "啟示錄"],
            "summary": "耶穌基督降生受洗、傳講天國福音、十字架受難代贖、第三天復活升天。聖靈五旬節降臨，教會成立，福音傳遍羅馬帝國與地極。",
            "events": [
                {"year": "約 BC 5-4", "event": "主耶穌基督降生於猶大伯利恆"},
                {"year": "約 AD 27-30", "event": "耶穌受洗、傳天國福音、行神蹟、揀選十二使徒"},
                {"year": "約 AD 30", "event": "耶穌於逾越節在耶路撒冷受難釘十字架、第三天復活、四十天後升天"},
                {"year": "約 AD 30", "event": "五旬節聖靈大能降臨，耶路撒冷教會成立"},
                {"year": "約 AD 34", "event": "保羅在大馬士革路上蒙主耶穌光照悔改蒙召"},
                {"year": "AD 46-57", "event": "保羅展開三次大宣教旅程，在小亞細亞與歐洲建立眾教會，撰寫書信"},
                {"year": "AD 64-67", "event": "羅馬皇帝尼祿逼迫教會，使徒彼得與保羅在羅馬殉道"},
                {"year": "AD 70", "event": "羅馬將軍提多攻陷耶路撒冷，第二聖殿被焚毀，正如耶穌所預言"},
                {"year": "約 AD 95-96", "event": "使徒約翰被流放拔摩島，見異象撰寫啟示錄，新約聖經正典完滿成書"}
            ]
        }
    ],

    # 2. 先知書之歷史分期表 (Historical Periods of Old Testament Prophets)
    "prophetic_periods": [
        {
            "era": "亞述帝國時期 (Assyrian Period)",
            "time": "公元前 8 世紀 - 7 世紀初",
            "bg": "亞述帝國崛起強盛，北方十支派陷入嚴重邪淫拜金牛犢與社會不公，最終於 BC 722 亡於亞述。",
            "prophets": [
                {"name": "約珥", "target": "南國猶大", "date": "約 BC 835", "focus": "蝗災與耶和華大日子、聖靈降臨預言"},
                {"name": "約拿", "target": "亞述尼尼微", "date": "約 BC 780", "focus": "上帝對外邦惡城的憐憫與拯救"},
                {"name": "阿摩司", "target": "北國以色列", "date": "約 BC 760", "focus": "公義如大水滾滾，譴責欺壓貧民"},
                {"name": "何西阿", "target": "北國以色列", "date": "約 BC 755-715", "focus": "娶淫婦彰顯上帝對背道民不離不棄的愛"},
                {"name": "以賽亞", "target": "南國猶大/萬國", "date": "約 BC 740-680", "focus": "至聖上帝、受苦僕人與彌賽亞榮耀"},
                {"name": "彌迦", "target": "南國與北國", "date": "約 BC 735-700", "focus": "行公義好憐憫、伯利恆君王降生預言"}
            ]
        },
        {
            "era": "巴比倫帝國時期 (Babylonian Period)",
            "time": "公元前 7 世紀末 - 6 世紀初",
            "bg": "巴比倫崛起滅亞述，南國猶大叛逆不悔改，遭巴比倫三次圍攻，聖殿被毀，百姓被擄。",
            "prophets": [
                {"name": "那鴻", "target": "亞述尼尼微", "date": "約 BC 660-612", "focus": "殘暴亞述城池公義毀滅的預言"},
                {"name": "西番雅", "target": "南國猶大", "date": "約 BC 640-609", "focus": "大而可畏耶和華的日子與謙卑餘民"},
                {"name": "哈巴谷", "target": "南國猶大", "date": "約 BC 605", "focus": "義人必因信得生，質疑到信心歡呼"},
                {"name": "耶利米", "target": "南國猶大", "date": "約 BC 627-580", "focus": "流淚呼籲悔改、預言被擄70年與上帝立新約"},
                {"name": "俄巴底亞", "target": "以東國", "date": "約 BC 586", "focus": "落井下石之以東的降卑與國度歸上帝"},
                {"name": "以西結", "target": "被擄猶太人(巴比倫)", "date": "約 BC 593-571", "focus": "榮耀離開與復興、枯骨復生、新心新靈"},
                {"name": "但以理", "target": "巴比倫/波斯朝廷", "date": "約 BC 605-536", "focus": "至高上帝在人間帝國掌權、列國與七十週異象"}
            ]
        },
        {
            "era": "波斯帝國 / 歸回重建時期 (Persian / Post-Exilic Period)",
            "time": "公元前 6 世紀末 - 5 世紀",
            "bg": "波斯王古列許可猶太人歸回 Jerusalem，先知鼓勵百姓克服阻撓、重建聖殿與恢復敬虔。",
            "prophets": [
                {"name": "哈該", "target": "歸回餘民", "date": "BC 520", "focus": "省察行為，優先建造上帝的殿，後來的榮耀更大"},
                {"name": "撒迦利亞", "target": "歸回餘民", "date": "BC 520-480", "focus": "夜間異象、靠聖靈成事、彌賽亞騎驢與被扎預言"},
                {"name": "瑪拉基", "target": "歸回猶大社群", "date": "約 BC 430-400", "focus": "責備殘疾獻祭與休妻，預言公義日頭與以利亞降臨"}
            ]
        }
    ],

    # 3. 猶太神聖曆與民政曆對照 (Jewish Sacred & Civil Calendar)
    "jewish_calendar": [
        {"month_no": 1, "jewish_name": "尼散月 (Nisan/Abib)", "civil_no": 7, "gregorian": "3月-4月", "feasts": "14日逾越節 (Passover)、15-21日無酵節 (Unleavened Bread)、初熟節", "agri": "大麥收割、春雨降下"},
        {"month_no": 2, "jewish_name": "基流月/細萬月 (Iyar/Ziv)", "civil_no": 8, "gregorian": "4月-5月", "feasts": "補過逾越節 (民 9:11)", "agri": "小麥收割開始、乾旱季節開始"},
        {"month_no": 3, "jewish_name": "西番月 (Sivan)", "civil_no": 9, "gregorian": "5月-6月", "feasts": "6日七七節 / 五旬節 (Pentecost/Feast of Weeks)", "agri": "小麥收割完畢、初熟無花果"},
        {"month_no": 4, "jewish_name": "他密月 (Tammuz)", "civil_no": 10, "gregorian": "6月-7月", "feasts": "17日禁食日 (記念城牆被攻破)", "agri": "葡萄成熟、盛夏酷熱"},
        {"month_no": 5, "jewish_name": "埃波月 (Ab)", "civil_no": 11, "gregorian": "7月-8月", "feasts": "9日聖殿被毀日禁食 (Tisha B'Av)", "agri": "橄欖與無花果採收"},
        {"month_no": 6, "jewish_name": "以祿月 (Elul)", "civil_no": 12, "gregorian": "8月-9月", "feasts": "吹角節前的預備與悔改月", "agri": "椰棗採收、葡萄釀酒"},
        {"month_no": 7, "jewish_name": "以他尼月/提斯利月 (Ethanim/Tishrei)", "civil_no": 1, "gregorian": "9月-10月", "feasts": "1日吹角節 (Rosh Hashanah)、10日贖罪日 (Yom Kippur)、15-21日住棚節 (Tabernacles)", "agri": "猶太民政新年初一、秋雨降下、耕地播種"},
        {"month_no": 8, "jewish_name": "布勒月/瑪赫旬月 (Bul/Marchesvan)", "civil_no": 2, "gregorian": "10月-11月", "feasts": "無重大節期", "agri": "大麥與小麥播種"},
        {"month_no": 9, "jewish_name": "基斯流月 (Chislev)", "civil_no": 3, "gregorian": "11月-12月", "feasts": "25日修殿節 / 光明節 (Hanukkah/Dedication)", "agri": "進入冬季雨季"},
        {"month_no": 10, "jewish_name": "提別月 (Tebeth)", "civil_no": 4, "gregorian": "12月-1月", "feasts": "10日禁食日 (記念耶路撒冷被圍)", "agri": "寒冬降雨"},
        {"month_no": 11, "jewish_name": "細罷特月 (Sebat)", "civil_no": 5, "gregorian": "1月-2月", "feasts": "15日樹木節 (Tu BiShvat)", "agri": "杏樹開花、冬雨"},
        {"month_no": 12, "jewish_name": "亞達月 (Adar)", "civil_no": 6, "gregorian": "2月-3月", "feasts": "14-15日普洱節 (Purim - 記念以斯帖奇蹟救恩)", "agri": "晚雨降下、大麥成熟"}
    ],

    # 4. 結構圖表與圖解 (Special Structural Charts)
    "charts": [
        {
            "id": "prophets_timeline_chart",
            "title": "先知書之歷史分期圖",
            "desc": "完整涵蓋亞述、巴比倫、波斯三大帝國時期，各先知（以賽亞、耶利米、以西結、但以理及小先知書）事奉時間與歷史背景對照圖。",
            "img": "https://www.su101.net/wp-content/uploads/2024/04/截圖-2024-04-01-下午6.17.02.png"
        },
        {
            "id": "haggai_structure_chart",
            "title": "哈該書經文內容對稱結構圖",
            "desc": "哈該書四次宣講上帝話語的交錯對稱（Chiasm）結構圖，展現上帝神聖啟示的縝密編排。",
            "img": "https://www.su101.net/wp-content/uploads/2024/04/截圖-2024-04-01-下午6.17.34.png"
        },
        {
            "id": "jewish_calendar_chart",
            "title": "猶太曆法與七大節期圓盤圖",
            "desc": "神聖曆（以尼散月為正月）與民政曆（以提斯利月為正月）、以色列季節農作及七大節期（逾越節、無酵節、初熟節、五旬節、吹角節、贖罪日、住棚節）全貌圖。",
            "img": "https://www.su101.net/wp-content/uploads/2024/04/猶太曆.jpg"
        }
    ]
}

OUT_JS = r"c:\Users\User\OneDrive\文件\Antigravity\Biblia\app\data\timeline_data.js"
js_code = "window.BIBLIA_TIMELINE_DATA = " + json.dumps(TIMELINE_DATA, ensure_ascii=False, indent=2) + ";\n"

with open(OUT_JS, "w", encoding="utf-8") as f:
    f.write(js_code)

print(f"Generated {OUT_JS} with timeline, prophetic eras, jewish calendar, and charts.")
