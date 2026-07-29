# -*- coding: utf-8 -*-
"""新約希臘文原文（Westcott-Hort 1881），並盡可能掛上 Strong 號碼。

授權
    Westcott-Hort 1881 已逾著作權保護期（信望愛版權頁載明「已超過美國的
    著作權保護期 70 年」）。byztxt 的 Robinson 版本亦標示 "Public Domain.
    Copy freely."。UBS6／NA28 等現代校勘本受版權保護，本專案完全不使用。

為什麼要合併兩個來源
    * FHL 的 fhlwh 有**重音的 Unicode 希臘文**（Ἐν ἀρχῇ ἦν ὁ λόγος），
      節鍵與本專案其餘版本同源，但 FHL 全站僅 unv／rcuv／kjv 帶 Strong，
      希臘文沒有。
    * byztxt/greektext-westcott-hort 有 **Strong 號碼與詞形**，但文字是
      無重音的 Beta Code（logov）。
    兩者同為 Westcott-Hort，因此可逐詞對位，把 Strong 掛到有重音的字上。

寧可少掛，絕不掛錯
    兩份數位化本在少數地方斷詞不同（WH 的括號異文，FHL 用 + 標記、
    byztxt 用 | 標記），因此不能只靠「第幾個字對第幾個字」。
    作法是先把 Beta Code 轉成希臘字母、把 FHL 的字去掉重音，兩邊化為
    可比較的形式後用 difflib 做序列比對，**只有字面真的相同的配對才掛
    Strong**；異文造成的插入或刪除會被跳過，不影響其後的對位。
    對不上的字就不給 Strong —— 研經工具給錯字義比沒有字義更糟。
    實際覆蓋率會列在稽核報告與 README 中。

輸出與 WLC 一致：兩個來源都原樣保存在 _source/，合併結果寫成逐章檔，
格式沿用 FHL 標記（<WG####>），parse.py 不必修改。
"""
import argparse
import difflib
import io
import os
import re
import sys
import time
import unicodedata

import common

VKEY = "gr_wh"
BYZ_BASE = ("https://raw.githubusercontent.com/byztxt/"
            "greektext-westcott-hort/master/parsed/")

# byztxt 檔名 → 本專案 books.csv 的 dir
BYZ_TO_DIR = {
    "MT": "Matt", "MR": "Mark", "LU": "Luke", "JOH": "John", "AC": "Acts",
    "RO": "Rom", "1CO": "1Cor", "2CO": "2Cor", "GA": "Gal", "EPH": "Eph",
    "PHP": "Phil", "COL": "Col", "1TH": "1Thess", "2TH": "2Thess",
    "1TI": "1Tim", "2TI": "2Tim", "TIT": "Titus", "PHM": "Philem",
    "HEB": "Heb", "JAS": "James", "1PE": "1Pet", "2PE": "2Pet",
    "1JO": "1John", "2JO": "2John", "3JO": "3John", "JUDE": "Jude",
    "RE": "Rev",
}

# Robinson Beta Code → 希臘字母（v 為字尾 sigma）
BETA = {
    "a": "α", "b": "β", "g": "γ", "d": "δ", "e": "ε", "z": "ζ", "h": "η",
    "q": "θ", "i": "ι", "k": "κ", "l": "λ", "m": "μ", "n": "ν", "x": "ξ",
    "o": "ο", "p": "π", "r": "ρ", "s": "σ", "v": "σ", "t": "τ", "u": "υ",
    "f": "φ", "c": "χ", "y": "ψ", "w": "ω",
}

GREEK_RE = re.compile(r"[Ͱ-Ͽἀ-῿]+")
BYZ_WORD_RE = re.compile(r"([a-zA-Z]+)((?:\s+\d+)+)\s*\{([^}]*)\}")


def source_dir(*parts):
    return os.path.join(common.RAW_DIR, VKEY, "_source", *parts)


def align_strongs(fhl_words, byz_words):
    """把 byztxt 的 Strong 對到 FHL 的字上，回傳與 fhl_words 等長的清單。

    兩邊先化成可比較的形式（FHL 去重音、byztxt 由 Beta Code 轉希臘字母），
    再用 difflib 找出相同的區段。只有落在 'equal' 區段裡的配對才掛號碼，
    異文造成的插入／刪除會被跳過，不會讓整節作廢，也不會錯位。
    """
    tags = [[] for _ in fhl_words]
    if not fhl_words or not byz_words:
        return tags

    left = [bare(w) for w in fhl_words]
    right = [beta_to_greek(w) for w, _s in byz_words]

    matcher = difflib.SequenceMatcher(a=left, b=right, autojunk=False)
    for op, i1, i2, j1, j2 in matcher.get_opcodes():
        if op != "equal":
            continue
        for offset in range(i2 - i1):
            tags[i1 + offset] = byz_words[j1 + offset][1]
    return tags


def beta_to_greek(word):
    return "".join(BETA.get(ch, ch) for ch in word.lower())


def bare(greek):
    """去掉重音、氣音等附加符號，並統一字尾 sigma，方便比對。"""
    decomposed = unicodedata.normalize("NFD", greek)
    stripped = "".join(c for c in decomposed if not unicodedata.combining(c))
    return stripped.lower().replace("ς", "σ")


def fetch_fhl_chapters(books, interval, force):
    """抓 FHL fhlwh 的新約 260 章，存進 _source/fhl/。"""
    got = 0
    for b in books:
        for chap in range(1, b["chapters"] + 1):
            path = source_dir("fhl", b["dir"], "%03d.json" % chap)
            if os.path.exists(path) and not force:
                continue
            data = common.fetch_chapter(b["chineses"], chap, "fhlwh", 0, 0)
            common.write_json(path, data)
            got += 1
            if got % 40 == 0:
                common.log("  FHL 希臘文已抓 %d 章" % got)
            time.sleep(interval)
    return got


def load_byz(name):
    """讀 byztxt 的 .UWH，回傳 {(chap, sec): [(betaword, [strong...]), ...]}

    檔案是續行格式：只有以 'c:v ' 起頭的行才是新的一節。
    """
    path = source_dir("byztxt", name + ".UWH")
    text = io.open(path, encoding="utf-8").read().replace("\r", "")
    raw = {}
    cur = None
    for line in text.split("\n"):
        m = re.match(r"^(\d+):(\d+)\s+(.*)$", line)
        if m:
            cur = (int(m.group(1)), int(m.group(2)))
            raw[cur] = m.group(3)
        elif cur and line.strip():
            raw[cur] += " " + line.strip()

    out = {}
    for key, blob in raw.items():
        words = []
        for word, nums, _morph in BYZ_WORD_RE.findall(blob):
            codes = nums.split()
            # 第一個數字是 Strong，其後多為 Robinson 的時態語態語氣碼（5xxx）
            strongs = ["G%d" % int(codes[0])] if codes else []
            words.append((word, strongs))
        out[key] = words
    return out


def main():
    common.utf8_stdout()
    ap = argparse.ArgumentParser()
    ap.add_argument("--interval", type=float, default=common.REQUEST_INTERVAL)
    ap.add_argument("--force", action="store_true")
    args = ap.parse_args()

    books = [b for b in common.load_books() if b["testament"] == "NT"]
    by_dir = dict((b["dir"], b) for b in books)

    # 1) FHL 重音希臘文
    common.log("抓取 FHL 新約原文（fhlwh）%d 卷 / %d 章"
               % (len(books), sum(b["chapters"] for b in books)))
    n = fetch_fhl_chapters(books, args.interval, args.force)
    common.log("FHL 希臘文新增 %d 章" % n)

    # 2) byztxt 的 Strong 標記
    for name in sorted(BYZ_TO_DIR):
        path = source_dir("byztxt", name + ".UWH")
        if os.path.exists(path) and not args.force:
            continue
        text = common.http_get(BYZ_BASE + name + ".UWH", timeout=180)
        common.ensure_dir(os.path.dirname(path))
        with io.open(path, "w", encoding="utf-8", newline="\n") as fh:
            fh.write(text)
    common.log("byztxt Westcott-Hort 取得完成（27 卷）")

    # 3) 逐詞對位並驗證
    stat = {"verses": 0, "count_ok": 0, "words": 0, "tagged": 0}
    written = 0
    for name, dirname in sorted(BYZ_TO_DIR.items()):
        book = by_dir.get(dirname)
        if not book:
            common.log("警告：books.csv 沒有 %s" % dirname)
            continue
        byz = load_byz(name)

        for chap in range(1, book["chapters"] + 1):
            src = source_dir("fhl", dirname, "%03d.json" % chap)
            if not os.path.exists(src):
                common.log("警告：缺 %s" % src)
                continue
            data = common.read_json(src)

            recs = []
            for r in data.get("record", []):
                sec = int(r["sec"])
                text = re.sub(r"<[^>]*>", "", r.get("bible_text") or "")
                fhl_words = GREEK_RE.findall(text)
                byz_words = byz.get((chap, sec), [])

                stat["verses"] += 1
                stat["words"] += len(fhl_words)

                tags = align_strongs(fhl_words, byz_words)
                hit = sum(1 for t in tags if t)
                stat["tagged"] += hit
                if fhl_words and hit == len(fhl_words):
                    stat["count_ok"] += 1

                # 以 FHL 原文為底，在每個希臘字後插入驗證過的 Strong
                idx = [0]

                def repl(m):
                    i = idx[0]
                    idx[0] += 1
                    codes = tags[i] if i < len(tags) else []
                    return m.group(0) + "".join("<WG%s>" % c[1:] for c in codes)

                recs.append({
                    "engs": book["engs"], "chineses": book["chineses"],
                    "chap": chap, "sec": sec,
                    "bible_text": GREEK_RE.sub(repl, text),
                })

            out = os.path.join(common.RAW_DIR, VKEY, dirname, "%03d.json" % chap)
            common.write_json(out, {
                "status": "success", "record_count": len(recs),
                "v_name": "Westcott-Hort 1881 (希臘文新約)", "version": "wh",
                "source": "文字：FHL fhlwh；Strong：byztxt/greektext-westcott-hort",
                "license": "Westcott-Hort 1881 已逾著作權保護期；byztxt 標示 Public Domain",
                "note": "Strong 僅在逐詞驗證相符時掛上，對不上者不給號碼",
                "record": recs,
            })
            written += 1

    common.log("完成：寫出 %d 章 / %d 節" % (written, stat["verses"]))
    common.log("整節全部掛上 Strong 的節：%d / %d（%.1f%%）"
               % (stat["count_ok"], stat["verses"],
                  100.0 * stat["count_ok"] / max(stat["verses"], 1)))
    common.log("Strong 覆蓋：%d / %d 詞（%.1f%%）"
               % (stat["tagged"], stat["words"],
                  100.0 * stat["tagged"] / max(stat["words"], 1)))

    expect = sum(b["chapters"] for b in books)
    if written != expect:
        common.log("提醒：新約應有 %d 章，實得 %d 章" % (expect, written))
        sys.exit(1)


if __name__ == "__main__":
    main()
