# -*- coding: utf-8 -*-
"""端到端驗證，輸出 report.txt。

刻意用「與 parse.py 不同的程式路徑」重新剝除標記來比對，避免自己驗自己。
"""
import io
import os
import random
import re
import sys

import common

REPORT = []
FAILED = [0]


def check(name, ok, detail=""):
    tag = "PASS" if ok else "FAIL"
    if not ok:
        FAILED[0] += 1
    line = "[%s] %s" % (tag, name)
    if detail:
        line += "\n         " + str(detail).replace("\n", "\n         ")
    REPORT.append(line)
    return ok


def info(name, detail=""):
    line = "[INFO] %s" % name
    if detail:
        line += "\n         " + str(detail).replace("\n", "\n         ")
    REPORT.append(line)


# --- 獨立的標記剝除（不呼叫 fhl_markup，確保是第二套實作） ---------------
FOOTNOTE = re.compile(r"<RF>.*?<Rf>", re.S)
ANYTAG = re.compile(r"<[^>]*>")


def strip_markup(text):
    t = FOOTNOTE.sub("", text)
    t = ANYTAG.sub("", t)
    t = t.replace("{", "").replace("}", "")
    t = re.sub(r"[ \t]+", " ", t)
    return t.strip()


def main():
    common.utf8_stdout()
    books = common.load_books()
    vkeys = [v["key"] for v in common.VERSIONS]

    REPORT.append("Biblia 驗證報告  %s" % common.now())
    REPORT.append("=" * 66)

    # 1) books.csv ---------------------------------------------------------
    total_ch = sum(b["chapters"] for b in books)
    check("books.csv 共 66 卷", len(books) == 66, "實得 %d" % len(books))
    check("books.csv 總章數 == 1189", total_ch == 1189, "實得 %d" % total_ch)

    # 2) raw 完整性 --------------------------------------------------------
    missing_raw = []
    for v in common.VERSIONS:
        for b in books:
            for c in range(1, b["chapters"] + 1):
                p = os.path.join(common.RAW_DIR, v["key"], b["dir"], "%03d.json" % c)
                if not os.path.exists(p):
                    missing_raw.append("%s/%s/%03d" % (v["key"], b["dir"], c))
    expected_raw = total_ch * len(common.VERSIONS)
    check("raw 檔齊全（%d 個）" % expected_raw, not missing_raw,
          "缺 %d 個，前 5：%s" % (len(missing_raw), missing_raw[:5]) if missing_raw else "")

    # 3) parsed 章數 -------------------------------------------------------
    parsed_total = 0
    bad_counts = []
    verses_by_version = dict((k, 0) for k in vkeys)
    verse_total = 0
    strongs = set()
    gaps = []
    all_books_data = {}

    for b in books:
        stem = "%02d_%s" % (b["book_no"], b["dir"])
        path = os.path.join(common.PARSED_DIR, stem + ".json")
        if not os.path.exists(path):
            bad_counts.append("%s 檔案不存在" % stem)
            continue
        data = common.read_json(path)
        all_books_data[b["engs"]] = data
        parsed_total += len(data["ch"])
        if len(data["ch"]) != b["chapters"]:
            bad_counts.append("%s 應 %d 章、實得 %d 章"
                              % (b["engs"], b["chapters"], len(data["ch"])))
        for ch in data["ch"]:
            for verse in ch["v"]:
                verse_total += 1
                for k in vkeys:
                    if k in verse.get("t", {}):
                        verses_by_version[k] += 1
                    else:
                        gaps.append("%s %d:%d 缺 %s"
                                    % (b["engs"], ch["c"], verse["s"], k))
                for k, units in (verse.get("w") or {}).items():
                    for u in units:
                        for s in u.get("s", []):
                            strongs.add(s)

    check("parsed 各卷章數與 books.csv 相符", not bad_counts,
          "；".join(bad_counts[:5]) if bad_counts else "")
    check("parsed 總章數 == 1189", parsed_total == 1189, "實得 %d" % parsed_total)

    info("節數統計（以聯集計 %d 節）" % verse_total,
         "；".join("%s %d" % (k, verses_by_version[k]) for k in vkeys))
    info("版本間節數落差 %d 處（正常，非錯誤）" % len(gaps),
         "；".join(gaps[:5]) if gaps else "無")
    info("相異 Strong 號碼 %d 個" % len(strongs))

    # 4) raw → parsed 文字保真度（隨機抽查） --------------------------------
    random.seed(20260727)
    pool = [b for b in books if b["engs"] in all_books_data]
    mismatches = []
    sampled = 0
    for _ in range(40):
        if not pool:
            break
        b = random.choice(pool)
        data = all_books_data[b["engs"]]
        if not data["ch"]:
            continue
        ch = random.choice(data["ch"])
        if not ch["v"]:
            continue
        verse = random.choice(ch["v"])
        for v in common.VERSIONS:
            if v["key"] not in verse.get("t", {}):
                continue
            rp = os.path.join(common.RAW_DIR, v["key"], b["dir"], "%03d.json" % ch["c"])
            if not os.path.exists(rp):
                continue
            raw = common.read_json(rp)
            src = None
            for rec in raw.get("record", []):
                if int(rec.get("sec", -1)) == verse["s"]:
                    src = (src or "") + (rec.get("bible_text") or "")
            if src is None:
                continue
            sampled += 1
            if strip_markup(src) != verse["t"][v["key"]]:
                mismatches.append("%s %d:%d %s\n  raw  =%r\n  parsed=%r"
                                  % (b["engs"], ch["c"], verse["s"], v["key"],
                                     strip_markup(src)[:80],
                                     verse["t"][v["key"]][:80]))
    check("raw → parsed 經文保真（抽查 %d 節）" % sampled, not mismatches,
          "\n".join(mismatches[:3]) if mismatches else "")

    # 5) Strong 抽查 -------------------------------------------------------
    def units_of(engs, chap, sec, vkey):
        data = all_books_data.get(engs)
        if not data:
            return None
        for ch in data["ch"]:
            if ch["c"] != chap:
                continue
            for verse in ch["v"]:
                if verse["s"] == sec:
                    return (verse.get("w") or {}).get(vkey)
        return None

    gen = units_of("Gen", 1, 1, "zh_unv")
    if gen is None:
        check("創 1:1 和合本 Strong", False, "找不到資料（尚未下載完成？）")
    else:
        codes = [s for u in gen for s in u.get("s", [])]
        want = ["H7225", "H430", "H1254", "H8064", "H776"]
        check("創 1:1 和合本 Strong 含 %s" % "/".join(want),
              all(w in codes for w in want), "實得 %s" % codes)

    mat = units_of("Matt", 1, 1, "zh_unv")
    if mat is None:
        check("太 1:1 和合本 Strong", False, "找不到資料（尚未下載完成？）")
    else:
        codes = [s for u in mat for s in u.get("s", [])]
        want = ["G11", "G1138", "G2424", "G5547"]
        check("太 1:1 和合本 Strong 含 %s（新約為 G）" % "/".join(want),
              all(w in codes for w in want), "實得 %s" % codes)
        check("太 1:1 無誤植的 H 開頭 Strong",
              not [c for c in codes if c.startswith("H")],
              "誤植：%s" % [c for c in codes if c.startswith("H")])

    # 6) 文法解析碼不可混進 Strong ----------------------------------------
    if gen:
        create = [u for u in gen if u.get("m")]
        leaked = [u for u in gen if "H8804" in u.get("s", [])]
        check("創 1:1「創造」文法碼 8804 收在 m、未混入 s",
              bool(create) and not leaked,
              "m=%s" % ([u.get("m") for u in create]))

    # 7) Strong 號碼範圍稽核（希伯來上限 8674、希臘上限 5624；
    #    H9001-H9006 為 FHL 標示前綴質詞的擴充碼，屬正常） -----------------
    odd = set()
    ext = set()
    zero = set()
    for s in strongs:
        try:
            n = int(re.sub(r"[^0-9]", "", s))
        except ValueError:
            continue
        if n == 0:
            zero.add(s)
        elif s.startswith("H"):
            if 9001 <= n <= 9099:
                ext.add(s)          # FHL 標示前綴質詞的擴充碼，數萬次出現，正常
            elif n > 8674:
                odd.add(s)          # 希伯來文 Strong 上限 8674
        elif s.startswith("G"):
            if n > 5624:            # 希臘文 Strong 上限 5624
                odd.add(s)

    check("無 H0／G0 佔位符混入 Strong", not zero, "殘留：%s" % sorted(zero))

    # 少數幾個是 FHL 上游資料本身的筆誤（如 <WAH031961>），raw/ 已原樣保存；
    # 種類一多才代表是解析器壞了，這裡才該 FAIL。
    check("Strong 號碼無系統性超界（種類 <= 5 視為上游雜訊）", len(odd) <= 5,
          "超界 %d 種：%s" % (len(odd), sorted(odd)[:20]) if odd else "")
    if odd:
        info("上游資料雜訊 %d 種（已原樣保留於 raw/）" % len(odd), " ".join(sorted(odd)))
    if ext:
        info("FHL 擴充前綴碼 %d 種（正常，前綴質詞）" % len(ext), " ".join(sorted(ext)))

    # 8) 編碼與前端資料 ----------------------------------------------------
    bom = []
    for d in (common.PARSED_DIR, common.APP_DATA_DIR):
        if not os.path.isdir(d):
            continue
        for fn in os.listdir(d):
            p = os.path.join(d, fn)
            if not os.path.isfile(p):
                continue
            with io.open(p, "rb") as fh:
                if fh.read(3) == b"\xef\xbb\xbf":
                    bom.append(fn)
    check("所有輸出檔為 UTF-8 無 BOM", not bom, "含 BOM：%s" % bom[:5] if bom else "")

    missing_js = []
    for b in books:
        stem = "%02d_%s.js" % (b["book_no"], b["dir"])
        if not os.path.exists(os.path.join(common.APP_DATA_DIR, stem)):
            missing_js.append(stem)
    check("app/data 66 卷 JS 齊全", not missing_js,
          "缺：%s" % missing_js[:5] if missing_js else "")
    check("app/data/books.js 存在",
          os.path.exists(os.path.join(common.APP_DATA_DIR, "books.js")))

    for f in ("index.html", "style.css", "reader.js"):
        check("app/%s 存在" % f, os.path.exists(os.path.join(common.APP_DIR, f)))

    # --- 輸出 -------------------------------------------------------------
    REPORT.append("=" * 66)
    REPORT.append("失敗項目：%d" % FAILED[0])
    text = "\n".join(REPORT) + "\n"
    with io.open(common.REPORT_TXT, "w", encoding="utf-8", newline="\n") as fh:
        fh.write(text)
    print(text)
    print("報告已寫入 %s" % common.REPORT_TXT)
    sys.exit(1 if FAILED[0] else 0)


if __name__ == "__main__":
    main()
