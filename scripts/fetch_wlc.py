# -*- coding: utf-8 -*-
"""取得舊約希伯來文原文（Westminster Leningrad Codex），並對位到 KJV 版本化。

為什麼不用 FHL 的 bhs：
    信望愛的「舊約馬索拉原文」為 Biblia Hebraica Stuttgartensia，
    著作權屬 Deutsche Bibelgesellschaft，1967/77 版需授權，
    依本專案「只收公有領域」的立場不能整本保存。

改用的來源：
    openscriptures/morphhb —— Open Scriptures Hebrew Bible (OSHB)
      * WLC 本文：**公有領域**
      * 詞形與 lemma 資料：**CC BY 4.0**（需標示出處，本專案已於 README 與
        介面頁尾標明）
    倉庫同時提供 wlc/VerseMap.xml，明列 WLC 與 KJV 的版本化差異
    （1,978 筆，其中僅 7 筆為跨節分割），因此對位有權威依據，不必自行推導。

輸出格式刻意與 FHL 的章節檔一致（record / sec / bible_text，Strong 以
<WH####> 內嵌），如此 parse.py 完全不必修改即可處理這個版本。
"""
import argparse
import collections
import io
import os
import re
import sys
import xml.etree.ElementTree as ET

import common

BASE = "https://raw.githubusercontent.com/openscriptures/morphhb/master/wlc/"
VKEY = "he_wlc"
OSIS_NS = "{http://www.bibletechnologies.net/2003/OSIS/namespace}"

# OSIS 書卷代號 → 本專案 books.csv 的 dir
OSIS_TO_DIR = {
    "Gen": "Gen", "Exod": "Ex", "Lev": "Lev", "Num": "Num", "Deut": "Deut",
    "Josh": "Josh", "Judg": "Judg", "Ruth": "Ruth", "1Sam": "1Sam",
    "2Sam": "2Sam", "1Kgs": "1Kin", "2Kgs": "2Kin", "1Chr": "1Chr",
    "2Chr": "2Chr", "Ezra": "Ezra", "Neh": "Neh", "Esth": "Esth",
    "Job": "Job", "Ps": "Ps", "Prov": "Prov", "Eccl": "Eccl", "Song": "Song",
    "Isa": "Is", "Jer": "Jer", "Lam": "Lam", "Ezek": "Ezek", "Dan": "Dan",
    "Hos": "Hos", "Joel": "Joel", "Amos": "Amos", "Obad": "Obad",
    "Jonah": "Jon", "Mic": "Mic", "Nah": "Nah", "Hab": "Hab",
    "Zeph": "Zeph", "Hag": "Hag", "Zech": "Zech", "Mal": "Mal",
}


def source_dir():
    return os.path.join(common.RAW_DIR, VKEY, "_source")


def download(name, force=False):
    path = os.path.join(source_dir(), name)
    if os.path.exists(path) and not force:
        return path
    text = common.http_get(BASE + name, timeout=180)
    common.ensure_dir(os.path.dirname(path))
    with io.open(path, "w", encoding="utf-8", newline="\n") as fh:
        fh.write(text)
    return path


def load_versemap(path):
    """回傳 {wlc_ref: kjv_ref}，ref 形如 'Gen.32.1'。

    整節對應（type="full"）直接套用。跨節分割（type="partial"，全書僅 7 筆）
    要分辨三種情況，一律套用反而會整節搬錯位置：

      1. wlc 端不帶 !（如 1Kgs.22.44 → 1Kgs.22.43!b）
         整節併入 KJV 某節的後半 → 套用。
      2. wlc 端帶 ! 且同一節有兩筆（如 Ps.13.6!a→Ps.13.5、!b→Ps.13.6）
         一節拆成 KJV 兩節 → 取第一個目標，讓經文出現在較前的節號
         （符合閱讀順序），後一節留空。
      3. wlc 端帶 ! 且只有一筆（如 1Kgs.18.34!a → 1Kgs.18.33!b）
         只有開頭一小段屬於前一節，主體仍在原節 → **不套用**，留在原節號。
         若照套會把整節搬走，反而讓原節號變空。
    """
    text = io.open(path, encoding="utf-8").read()
    rows = re.findall(
        r'<verse wlc="([^"]*)" kjv="([^"]*)" type="([^"]*)"', text)

    partial_count = collections.Counter(
        w.split("!")[0] for w, _k, t in rows if t != "full")

    mapping = {}
    for wlc, kjv, vtype in rows:
        base = wlc.split("!")[0]
        if vtype == "full":
            mapping[base] = kjv.split("!")[0]
            continue
        if "!" not in wlc:                      # 情況 1
            mapping[base] = kjv.split("!")[0]
        elif partial_count[base] > 1:           # 情況 2：取第一個目標
            mapping.setdefault(base, kjv.split("!")[0])
        # 情況 3：略過，保留原節號
    return mapping


def strongs_from_lemma(lemma):
    """'b/7225' → ['H7225']；'1254 a' → ['H1254']；'c/d/776' → ['H776']。

    斜線前的是前綴語素（b=בְּ、c=וְ、d=הַ 等），本身不帶 Strong 號碼；
    空白後的字母是同號異義變體，正規化時併回主號碼，
    才能和 FHL 和合本／KJV 既有的 H#### 對得起來（跨語言高亮要靠這個）。
    """
    out = []
    for part in str(lemma or "").split("/"):
        m = re.match(r"^\s*(\d+)", part)
        if m:
            out.append("H%d" % int(m.group(1)))
    return out


def parse_book(path):
    """回傳 {wlc_ref: [(詞, [Strong...]), ...]}"""
    tree = ET.parse(path)
    verses = {}
    for verse in tree.iter(OSIS_NS + "verse"):
        ref = verse.get("osisID")
        if not ref:
            continue
        tokens = []
        for child in verse:
            tag = child.tag.replace(OSIS_NS, "")
            text = "".join(child.itertext()).strip()
            if not text:
                continue
            if tag == "w":
                # 詞內的 / 是語素分隔，顯示時還原成連續的希伯來文
                tokens.append((text.replace("/", ""),
                               strongs_from_lemma(child.get("lemma"))))
            elif tag == "seg":
                tokens.append((text, []))      # 如 sof pasuq ׃
        if tokens:
            verses[ref] = tokens
    return verses


def to_markup(tokens):
    """組成 FHL 風格的 bible_text，讓 parse.py 直接沿用既有解析器。"""
    parts = []
    for word, strongs in tokens:
        parts.append(word + "".join("<WH%s>" % s[1:] for s in strongs))
    return " ".join(parts)


def main():
    common.utf8_stdout()
    ap = argparse.ArgumentParser()
    ap.add_argument("--force", action="store_true")
    args = ap.parse_args()

    books = dict((b["dir"], b) for b in common.load_books())

    common.log("下載 VerseMap.xml")
    vmap = load_versemap(download("VerseMap.xml", args.force))
    common.log("版本化對應 %d 筆" % len(vmap))

    # kjv_ref -> [tokens...]（多個 WLC 節可能併入同一個 KJV 節）
    by_kjv = {}
    remapped = 0
    for osis, dirname in sorted(OSIS_TO_DIR.items()):
        path = download("%s.xml" % osis, args.force)
        verses = parse_book(path)
        for wlc_ref, tokens in verses.items():
            kjv_ref = vmap.get(wlc_ref, wlc_ref)
            if kjv_ref != wlc_ref:
                remapped += 1
            parts = kjv_ref.split(".")
            if len(parts) != 3:
                continue
            _bk, chap, sec = parts
            try:
                key = (dirname, int(chap), int(sec))
            except ValueError:
                continue
            by_kjv.setdefault(key, []).extend(tokens)
        common.log("  %-6s → %-6s %4d 節" % (osis, dirname, len(verses)),
                   echo=False)

    common.log("依 VerseMap 重新對位 %d 節" % remapped)

    # 寫出逐章檔
    chapters = {}
    for (dirname, chap, sec), tokens in by_kjv.items():
        chapters.setdefault((dirname, chap), []).append((sec, tokens))

    written = 0
    total_verses = 0
    for (dirname, chap), rows in sorted(chapters.items()):
        book = books.get(dirname)
        if not book:
            common.log("警告：books.csv 沒有 %s" % dirname)
            continue
        rows.sort(key=lambda r: r[0])
        recs = []
        for sec, tokens in rows:
            recs.append({
                "engs": book["engs"], "chineses": book["chineses"],
                "chap": chap, "sec": sec, "bible_text": to_markup(tokens),
            })
        total_verses += len(recs)
        out = os.path.join(common.RAW_DIR, VKEY, dirname, "%03d.json" % chap)
        common.write_json(out, {
            "status": "success", "record_count": len(recs),
            "v_name": "Westminster Leningrad Codex", "version": "wlc",
            "source": "openscriptures/morphhb (OSHB)",
            "source_url": BASE,
            "license": "WLC text: Public Domain; lemma/morphology: CC BY 4.0",
            "versification": "已依 wlc/VerseMap.xml 對位到 KJV 版本化",
            "record": recs,
        })
        written += 1

    common.log("完成：寫出 %d 章 / %d 節" % (written, total_verses))

    # 章數自我檢查（舊約 929 章）
    expect = sum(b["chapters"] for b in common.load_books()
                 if b["testament"] == "OT")
    if written != expect:
        common.log("提醒：舊約應有 %d 章，實得 %d 章" % (expect, written))
        sys.exit(1)


if __name__ == "__main__":
    main()
