# -*- coding: utf-8 -*-
"""Build 777 Bible Memory Verses Database (app/data/memory_777.js)
Based on Gideons International Bible "Where to Find Help" (基甸會聖經「經文選讀 / 需要幫助的時候」)
and classical scripture memorization systems, using Chinese Union Version (和合本 zh_unv) + KJV + Original (WLC/WH).
"""
import io
import json
import os
import re
import sys

try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PARSED_DIR = os.path.join(ROOT, "parsed")
APP_DATA_DIR = os.path.join(ROOT, "app", "data")

BOOKS_META = {}
PARSED_BOOKS = {}

def load_books():
    needed_books = set()
    for _, _, _, ref_list in CURATED_PASSAGES:
        for (b, _, _) in ref_list:
            needed_books.add(b)

    for fname in sorted(os.listdir(PARSED_DIR)):
        if not re.match(r"^\d{2}_.*\.json$", fname):
            continue
        bno = int(fname[:2])
        if bno not in needed_books:
            continue
        fpath = os.path.join(PARSED_DIR, fname)
        with io.open(fpath, "r", encoding="utf-8") as fh:
            data = json.load(fh)
            no = data["no"]
            BOOKS_META[no] = {
                "no": no,
                "ab": data["ab"],
                "zh": data["zh"],
                "en": data["en"],
                "t": data["t"]
            }
            vmap = {}
            for ch in data["ch"]:
                c = ch["c"]
                for v in ch["v"]:
                    vmap[(c, v["s"])] = v
            PARSED_BOOKS[no] = vmap

def clean_zh_text(text):
    if not text:
        return ""
    text = re.sub(r"^（[^）]*(?:詩|歌|祈禱|伶長|調用|訓誨|金詩|流離|紀念|稱謝|安息日|所羅門|摩西|亞薩|可拉|以探|希幔|上行)[^）]*）\s*", "", text)
    text = re.sub(r"（細拉）", "", text)
    return text.strip()

def extract_strong_keywords(v_obj, zh_clean=""):
    w_list = (v_obj.get("w") or {}).get("zh_unv") or []
    out = []
    seen = set()
    for item in w_list:
        word = (item.get("w") or "").strip()
        s_codes = item.get("s") or []
        if not word or not s_codes:
            continue
        word_clean = re.sub(r"[，。；：！？「」『』（）─…、]", "", word).strip()
        if not word_clean:
            continue
        if zh_clean and word_clean not in zh_clean:
            continue
        primary_s = None
        for sc in s_codes:
            if sc in ("H853", "H834", "H3588", "G3588", "G2532", "G1161", "G1063") or sc.startswith("H900"):
                continue
            primary_s = sc
            break
        if not primary_s or primary_s in seen:
            continue
        seen.add(primary_s)
        out.append(f"{primary_s} ({word_clean})")
        if len(out) >= 4:
            break
    return ", ".join(out)

CATEGORIES = [
    {
        "id": "fear",
        "num": 1,
        "title": "恐懼與平安",
        "gideonTitle": "當你遇到恐懼、害怕、驚慌或孤單時",
        "enTitle": "Overcoming Fear, Loneliness & Finding Peace",
        "icon": "🛡️",
        "color": "#2b6cb0",
        "desc": "基甸會聖經首推安慰經文：在黑暗、懼怕、未知與孤單中，經歷神同在的盾牌與出人意外的平安。"
    },
    {
        "id": "anxiety",
        "num": 2,
        "title": "憂慮與交託",
        "gideonTitle": "當你感到憂慮、焦躁、重擔或疲乏時",
        "enTitle": "Relief from Anxiety, Worry & Weariness",
        "icon": "🕊️",
        "color": "#2f855a",
        "desc": "將一切憂慮卸給神：學習飛鳥與百合花的信靠，在疲乏困倦中如鷹展翅上騰，進入基督的安息。"
    },
    {
        "id": "revival",
        "num": 3,
        "title": "靈性復興與悔改",
        "gideonTitle": "當你覺得靈性冷淡、軟弱、認罪與恢復時",
        "enTitle": "Spiritual Revival, Repentance & Abiding in Christ",
        "icon": "🌿",
        "color": "#38a169",
        "desc": "憂傷痛悔的心神不輕看：從認罪潔淨（詩51）到常在真葡萄樹裡（約15），恢復起初的愛心與聖潔生命。"
    },
    {
        "id": "guidance",
        "num": 4,
        "title": "人生方向與智慧",
        "gideonTitle": "當你需要人生方向、重大抉擇與智慧指引時",
        "enTitle": "Life Guidance, Wisdom & God's Word",
        "icon": "🧭",
        "color": "#d69e2e",
        "desc": "專心仰賴耶和華，不可倚靠自己的聰明：讓神的話成為腳前的燈、路上的光，察驗何為神善良純全的旨意。"
    },
    {
        "id": "suffering",
        "num": 5,
        "title": "患難安慰與盼望",
        "gideonTitle": "當你遭遇患難、悲傷、疾病、挫折或試探時",
        "enTitle": "Comfort in Suffering, Temptation & Eternal Hope",
        "icon": "🔥",
        "color": "#c53030",
        "desc": "患難中隨時的幫助：在流淚谷中經歷秋雨之福，勝過試探與苦難，持定永不羞愧的榮耀盼望。"
    },
    {
        "id": "salvation",
        "num": 6,
        "title": "救恩確據與信心",
        "gideonTitle": "認識救恩道路、罪得赦免、因信稱義與永生確據",
        "enTitle": "Assurance of Salvation, Grace & Faith",
        "icon": "✝️",
        "color": "#9b2c2c",
        "desc": "基甸會福音核心：神愛世人、十字架的救贖、因信稱義的恩典，以及在基督裡永遠穩固的生命確據。"
    },
    {
        "id": "virtues",
        "num": 7,
        "title": "愛心美德與頌讚",
        "gideonTitle": "基督徒品格美德、饒恕和睦、家庭職場與禱告讚美",
        "enTitle": "Christian Virtues, Love, Forgiveness & Praise",
        "icon": "👑",
        "color": "#805ad5",
        "desc": "活出愛的真諦與聖靈果子：彼此饒恕、謙卑服事、不住禱告、凡事謝恩，以詩章頌詞榮耀主名。"
    }
]

def r(bookNo, chap, s1, s2=None):
    if s2 is None:
        return [(bookNo, chap, s1)]
    return [(bookNo, chap, s) for s in range(s1, s2 + 1)]

CURATED_PASSAGES = [
    # ==================== 1. 恐懼與平安 (fear) ====================
    ("fear", "面對恐懼與害怕", "詩篇23篇・好牧人的同在", r(19, 23, 1, 6)),
    ("fear", "面對恐懼與害怕", "懼怕時倚靠神", r(19, 56, 3, 4) + r(19, 56, 8, 11) + r(19, 56, 13)),
    ("fear", "面對恐懼與害怕", "不要害怕我與你同在", r(23, 41, 10) + r(23, 41, 13, 14)),
    ("fear", "面對恐懼與害怕", "愛裡沒有懼怕", r(62, 4, 16, 19)),
    ("fear", "面對恐懼與害怕", "亮光與拯救", r(19, 27, 1, 6) + r(19, 27, 13, 14)),
    ("fear", "勝過驚慌與威脅", "至高者隱密處的庇護", r(19, 91, 1, 16)),
    ("fear", "勝過驚慌與威脅", "患難中隨時的幫助", r(19, 46, 1, 11)),
    ("fear", "勝過驚慌與威脅", "出你入耶和華保護", r(19, 121, 1, 8)),
    ("fear", "勝過驚慌與威脅", "剛強壯膽不要懼怕", r(5, 31, 6) + r(5, 31, 8) + r(6, 1, 5, 9)),
    ("fear", "勝過驚慌與威脅", "剛強仁愛謹守的心", r(55, 1, 7) + r(45, 8, 15) + r(58, 13, 5, 6)),
    ("fear", "孤單時的同在與出人意外的平安", "神無處不在的看顧", r(19, 139, 1, 12) + r(19, 139, 17, 18) + r(19, 139, 23, 24)),
    ("fear", "孤單時的同在與出人意外的平安", "基督賜下真平安", r(43, 14, 1, 3) + r(43, 14, 18) + r(43, 14, 27) + r(43, 16, 33)),
    ("fear", "孤單時的同在與出人意外的平安", "十分平安與保護", r(23, 26, 3, 4) + r(23, 43, 1, 5) + r(23, 54, 10) + r(23, 54, 17)),
    ("fear", "孤單時的同在與出人意外的平安", "安然躺下睡覺", r(19, 3, 3, 6) + r(19, 4, 7, 8) + r(19, 16, 8, 9) + r(19, 62, 1, 2) + r(19, 62, 5, 8)),
    ("fear", "孤單時的同在與出人意外的平安", "平靜風浪的主", r(41, 4, 39, 40) + r(40, 14, 27) + r(40, 28, 20) + r(4, 6, 24, 26) + r(53, 3, 16)),

    # ==================== 2. 憂慮與交託 (anxiety) ====================
    ("anxiety", "卸下憂慮與重擔", "把重擔卸給耶和華", r(19, 55, 16, 17) + r(19, 55, 22) + r(19, 94, 18, 19) + r(19, 68, 19)),
    ("anxiety", "卸下憂慮與重擔", "不要為明天憂慮", r(40, 6, 25, 34)),
    ("anxiety", "卸下憂慮與重擔", "應當一無掛慮", r(50, 4, 4, 9) + r(50, 4, 11, 13) + r(50, 4, 19)),
    ("anxiety", "卸下憂慮與重擔", "將一切憂慮卸給神", r(60, 5, 6, 11)),
    ("anxiety", "疲乏軟弱中重新得力", "如鷹展翅上騰", r(23, 40, 28, 31)),
    ("anxiety", "疲乏軟弱中重新得力", "凡勞苦擔重擔的人", r(40, 11, 28, 30) + r(23, 30, 15) + r(23, 30, 18)),
    ("anxiety", "疲乏軟弱中重新得力", "我的恩典夠你用的", r(47, 12, 9, 10) + r(47, 4, 7, 9) + r(47, 4, 16, 18)),
    ("anxiety", "專心等候與心靈安息", "耐心等候耶和華", r(19, 37, 1, 11) + r(19, 37, 23, 25) + r(19, 37, 39, 40)),
    ("anxiety", "專心等候與心靈安息", "切慕溪水與仰望神", r(19, 42, 1, 2) + r(19, 42, 5) + r(19, 42, 8) + r(19, 42, 11) + r(19, 43, 3, 5)),
    ("anxiety", "專心等候與心靈安息", "平穩安靜如斷奶孩子", r(19, 131, 1, 3) + r(19, 130, 1, 8)),
    ("anxiety", "專心等候與心靈安息", "耶和華必然預備", r(1, 22, 14) + r(19, 28, 7) + r(19, 31, 14, 15) + r(19, 31, 19) + r(19, 31, 24) + r(19, 34, 4, 10)),
    ("anxiety", "專心等候與心靈安息", "不可丟棄勇敢的心", r(58, 4, 9, 11) + r(58, 10, 35, 36) + r(20, 12, 25) + r(20, 14, 30) + r(20, 17, 22) + r(19, 127, 1, 2) + r(42, 12, 29, 32)),

    # ==================== 3. 靈性復興與悔改 (revival) ====================
    ("revival", "認罪悔改與潔淨更新", "詩篇51篇・憂傷痛悔的心", r(19, 51, 1, 17)),
    ("revival", "認罪悔改與潔淨更新", "得赦免其過遮蓋其罪", r(19, 32, 1, 8) + r(19, 32, 10, 11)),
    ("revival", "認罪悔改與潔淨更新", "信實公義赦免洗淨", r(62, 1, 5, 10) + r(62, 2, 1, 2)),
    ("revival", "認罪悔改與潔淨更新", "罪雖像硃紅必白如雪", r(23, 1, 18) + r(23, 55, 6, 9) + r(23, 57, 15) + r(20, 28, 13) + r(14, 7, 14)),
    ("revival", "常在基督裡・真葡萄樹", "約翰福音15章・常在我裡面", r(43, 15, 1, 17)),
    ("revival", "常在基督裡・真葡萄樹", "與基督同釘十字架", r(48, 2, 20) + r(48, 5, 16, 17) + r(48, 5, 24, 25) + r(48, 6, 7, 9) + r(48, 6, 14)),
    ("revival", "靈性甦醒與渴慕神", "渴想神如無水之地", r(19, 63, 1, 5) + r(19, 63, 7, 8) + r(19, 84, 1, 2) + r(19, 84, 4, 7) + r(19, 84, 10, 12)),
    ("revival", "靈性甦醒與渴慕神", "換去石心賜下肉心", r(26, 36, 25, 27) + r(24, 29, 12, 14) + r(28, 6, 1, 3) + r(28, 14, 4, 5)),
    ("revival", "脫去舊人穿上新人", "心意更新與穿戴全副軍裝", r(49, 4, 22, 24) + r(49, 5, 8, 10) + r(49, 5, 14, 18) + r(49, 6, 10, 18)),
    ("revival", "脫去舊人穿上新人", "思念上面的事與發熱心", r(51, 3, 1, 4) + r(51, 3, 9, 10) + r(66, 2, 4, 5) + r(66, 3, 19, 20) + r(59, 4, 8, 10)),

    # ==================== 4. 人生方向與智慧 (guidance) ====================
    ("guidance", "專心仰賴與尋求神旨意", "箴言3章・專心仰賴耶和華", r(20, 3, 1, 13)),
    ("guidance", "專心仰賴與尋求神旨意", "羅馬書12章・獻上活祭察驗旨意", r(45, 12, 1, 3) + r(45, 12, 9, 21)),
    ("guidance", "專心仰賴與尋求神旨意", "喜愛律法晝夜思想", r(19, 1, 1, 6)),
    ("guidance", "神的話語是腳前的燈", "耶和華的律法全備", r(19, 19, 1, 2) + r(19, 19, 7, 14)),
    ("guidance", "神的話語是腳前的燈", "詩篇119篇・話語的亮光", r(19, 119, 9, 11) + r(19, 119, 18) + r(19, 119, 24) + r(19, 119, 33, 37) + r(19, 119, 49, 50) + r(19, 119, 71, 72) + r(19, 119, 89) + r(19, 119, 97, 105) + r(19, 119, 130) + r(19, 119, 133) + r(19, 119, 165)),
    ("guidance", "神的話語是腳前的燈", "聖經都是神所默示的", r(55, 3, 14, 17) + r(58, 4, 12, 13) + r(23, 55, 10, 11) + r(24, 15, 16)),
    ("guidance", "人生道路的引導与抉擇", "指示當選擇的道路", r(19, 25, 4, 5) + r(19, 25, 8, 10) + r(19, 25, 12) + r(19, 25, 14) + r(19, 143, 8, 10)),
    ("guidance", "人生道路的引導与抉擇", "這是正路要行在其間", r(23, 30, 20, 21) + r(23, 48, 17) + r(24, 29, 11) + r(24, 33, 3) + r(19, 73, 23, 26)),
    ("guidance", "敬畏耶和華是智慧的開端", "箴言智慧金句", r(20, 1, 7) + r(20, 2, 1, 6) + r(20, 4, 18) + r(20, 4, 23) + r(20, 9, 10) + r(20, 16, 1) + r(20, 16, 3) + r(20, 16, 9) + r(20, 19, 21) + r(20, 21, 1)),
    ("guidance", "敬畏耶和華是智慧的開端", "求智慧與先求神的國", r(59, 1, 5, 6) + r(59, 3, 17, 18) + r(40, 7, 7, 8) + r(40, 7, 13, 14) + r(40, 7, 24, 25) + r(50, 3, 13, 14) + r(21, 12, 1) + r(21, 12, 13, 14) + r(33, 6, 8)),

    # ==================== 5. 患難安慰與盼望 (suffering) ====================
    ("suffering", "患難中的安慰與醫治", "發慈悲的父與賜各樣安慰的神", r(47, 1, 3, 5) + r(47, 1, 8, 10)),
    ("suffering", "患難中的安慰與醫治", "醫好傷心的人", r(19, 147, 3) + r(19, 34, 17, 19) + r(19, 30, 5) + r(19, 30, 11, 12) + r(19, 126, 5, 6) + r(19, 71, 20, 21)),
    ("suffering", "患難中的安慰與醫治", "患難生忍耐、萬事互相效力", r(45, 5, 3, 5) + r(45, 8, 18) + r(45, 8, 26, 28) + r(45, 8, 31, 39)),
    ("suffering", "勝過試探與信心試煉", "受試探時開一條出路", r(46, 10, 13) + r(58, 2, 18) + r(58, 4, 15, 16) + r(59, 1, 2, 4) + r(59, 1, 12, 15) + r(59, 4, 7)),
    ("suffering", "勝過試探與信心試煉", "信心經過試驗比金子更顯寶貴", r(60, 1, 6, 9) + r(60, 2, 21, 24) + r(60, 4, 12, 13) + r(18, 19, 25, 27) + r(18, 23, 10) + r(18, 42, 5)),
    ("suffering", "病痛軟弱中的扶持与盼望", "赦免一切罪孽醫治一切疾病", r(19, 103, 1, 14) + r(19, 103, 17, 18) + r(19, 41, 3) + r(19, 77, 10, 14) + r(24, 17, 14)),
    ("suffering", "病痛軟弱中的扶持与盼望", "每早晨這都是新的", r(25, 3, 21, 26) + r(25, 3, 31, 33) + r(35, 3, 17, 19) + r(33, 7, 7, 8) + r(34, 1, 7)),
    ("suffering", "永恆榮耀的盼望", "擦去一切的眼淚", r(43, 11, 25, 26) + r(52, 4, 13, 14) + r(52, 4, 16, 18) + r(66, 21, 3, 7) + r(66, 22, 1, 5) + r(45, 15, 13)),

    # ==================== 6. 救恩確據與信心 (salvation) ====================
    ("salvation", "基甸會福音核心・神的愛與救贖", "神愛世人賜下獨生子", r(43, 3, 14, 18) + r(43, 3, 36) + r(43, 1, 1, 5) + r(43, 1, 12, 14) + r(43, 1, 29)),
    ("salvation", "基甸會福音核心・神的愛與救贖", "世人都犯了罪與白白稱義", r(45, 1, 16, 17) + r(45, 3, 20, 26) + r(45, 5, 1, 2) + r(45, 5, 6, 11) + r(45, 6, 23)),
    ("salvation", "十架代贖與復活大能", "以賽亞書53章・受苦的僕人", r(23, 53, 1, 12)),
    ("salvation", "十架代贖與復活大能", "口裡認耶穌心裡信神叫他復活", r(45, 8, 1, 2) + r(45, 8, 11) + r(45, 10, 9, 13) + r(45, 10, 17) + r(44, 4, 12) + r(44, 16, 31)),
    ("salvation", "恩典稱義與新造的人", "本乎恩也因著信", r(49, 1, 3, 7) + r(49, 1, 13, 14) + r(49, 2, 4, 10) + r(56, 3, 4, 7)),
    ("salvation", "恩典稱義與新造的人", "在基督裡新造的人與好牧人", r(47, 5, 17, 21) + r(43, 5, 24) + r(43, 6, 35) + r(43, 6, 37) + r(43, 8, 12) + r(43, 8, 31, 32) + r(43, 10, 9, 11) + r(43, 10, 27, 29) + r(43, 14, 6)),
    ("salvation", "永生確據與信心的根基", "信就是所望之事的實底", r(62, 5, 11, 15) + r(62, 3, 1, 2) + r(58, 11, 1) + r(58, 11, 6) + r(58, 12, 1, 2) + r(54, 1, 15) + r(54, 2, 4, 6) + r(55, 1, 12) + r(60, 1, 3, 5) + r(60, 2, 9, 10)),

    # ==================== 7. 愛心美德與頌讚 (virtues) ====================
    ("virtues", "愛的真諦與彼此相愛", "哥林多前書13章・愛的真諦", r(46, 13, 1, 8) + r(46, 13, 13)),
    ("virtues", "愛的真諦與彼此相愛", "新命令・彼此相愛", r(43, 13, 34, 35) + r(62, 3, 16, 18) + r(62, 4, 7, 12) + r(60, 4, 8, 10)),
    ("virtues", "聖靈果子、謙卑與饒恕", "聖靈所結的果子與基督的心", r(48, 5, 22, 23) + r(48, 6, 1, 2) + r(50, 2, 1, 11)),
    ("virtues", "聖靈果子、謙卑與饒恕", "彼此包容饒恕與愛心聯絡", r(51, 3, 12, 17) + r(51, 3, 23, 24) + r(49, 4, 1, 3) + r(49, 4, 26, 27) + r(49, 4, 29) + r(49, 4, 31, 32) + r(40, 6, 14, 15)),
    ("virtues", "登山寶訓・天國八福與鹽光", "八福與作鹽作光", r(40, 5, 3, 16) + r(40, 5, 44) + r(40, 22, 37, 39) + r(40, 28, 19)),
    ("virtues", "智慧言語與家庭生活", "謹守口舌與智慧處世", r(20, 10, 12) + r(20, 10, 19) + r(20, 11, 24, 25) + r(20, 15, 1) + r(20, 15, 4) + r(20, 16, 24) + r(20, 16, 32) + r(20, 17, 17) + r(20, 18, 21) + r(20, 22, 1) + r(20, 22, 6) + r(20, 25, 11) + r(20, 27, 17) + r(20, 31, 10) + r(20, 31, 30) + r(59, 1, 19, 20) + r(59, 1, 22)),
    ("virtues", "不住禱告與歡呼頌讚", "主禱文與警醒感恩", r(40, 6, 9, 13) + r(52, 5, 15, 24) + r(54, 4, 12) + r(54, 6, 6, 8) + r(55, 4, 7, 8) + r(65, 1, 20, 21) + r(65, 1, 24, 25)),
    ("virtues", "不住禱告與歡呼頌讚", "普天下當向耶和華歡呼", r(19, 100, 1, 5) + r(19, 133, 1, 3) + r(19, 145, 8, 9) + r(19, 145, 18, 19) + r(19, 150, 1, 6)),
]

def main():
    load_books()
    seen = set()
    verses_by_cat = {c["id"]: [] for c in CATEGORIES}

    for cat_id, subcat, group_label, ref_list in CURATED_PASSAGES:
        for (b, c, s) in ref_list:
            if len(verses_by_cat[cat_id]) >= 111:
                break
            key = (b, c, s)
            if key in seen:
                continue
            v_obj = (PARSED_BOOKS.get(b) or {}).get((c, s))
            if not v_obj:
                continue
            t_map = v_obj.get("t") or {}
            zh = clean_zh_text(t_map.get("zh_unv") or "")
            if not zh or zh == "a":
                continue
            seen.add(key)
            bmeta = BOOKS_META[b]
            en = (t_map.get("en_kjv") or t_map.get("en_web") or "").strip()
            orig = (t_map.get("he_wlc") or t_map.get("gr_wh") or "").strip()
            strong_str = extract_strong_keywords(v_obj, zh)

            rec = {
                "bookNo": b,
                "chap": c,
                "sec": s,
                "bookZh": bmeta["zh"],
                "bookAb": bmeta["ab"],
                "bookEn": bmeta["en"],
                "testament": bmeta["t"],
                "ref": f"{bmeta['zh']} {c}:{s}",
                "refShort": f"{bmeta['ab']} {c}:{s}",
                "refEn": f"{bmeta['en']} {c}:{s}",
                "cat": cat_id,
                "subcat": subcat,
                "group": group_label,
                "zh": zh,
                "en": en,
                "orig": orig,
                "strong": strong_str
            }
            verses_by_cat[cat_id].append(rec)

    all_records = []
    idx = 1
    for c in CATEGORIES:
        cid = c["id"]
        vlist = verses_by_cat[cid]
        assert len(vlist) == 111, f"Category {cid} has {len(vlist)} verses instead of 111"
        for i, rec in enumerate(vlist):
            rec["id"] = idx
            rec["catIndex"] = i + 1
            all_records.append(rec)
            idx += 1

    assert len(all_records) == 777, f"Expected 777 verses, got {len(all_records)}"

    out_path = os.path.join(APP_DATA_DIR, "memory_777.js")
    payload = {
        "meta": {
            "title": "Biblia 777 經文背誦與基甸會處境選讀庫",
            "total": 777,
            "perCategory": 111,
            "categoriesCount": 7,
            "version": "zh_unv (中文和合本 1919) + KJV + WLC/WH 原文"
        },
        "categories": CATEGORIES,
        "verses": all_records
    }
    js_content = (
        "/* Biblia — 777 節經文背誦與基甸會聖經「經文選讀」資料庫 (7 大處境主題 × 111 節 = 777 節)\n"
        " * 由 scripts/build_memory_777.py 自 parsed/*.json 驗證產出，一字不差對應和合本與 KJV、希伯來/希臘原文。\n"
        " */\n"
        "window.BIBLIA_MEMORY_777 = " + json.dumps(payload, ensure_ascii=False, indent=2) + ";\n"
    )
    with io.open(out_path, "w", encoding="utf-8", newline="\n") as fh:
        fh.write(js_content)

    print(f"Successfully generated {out_path} with {len(all_records)} verses ({len(js_content)/1024:.1f} KB)!")
    for c in CATEGORIES:
        cid = c["id"]
        print(f"  [{c['num']}] {c['title']} ({cid}): {len(verses_by_cat[cid])} verses")

if __name__ == "__main__":
    main()
