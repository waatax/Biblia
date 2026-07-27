# -*- coding: utf-8 -*-
"""raw/ → parsed/*.json 與 app/data/*.js

以「節」為對位主鍵，多版本掛在同一節下。三個版本都出自 FHL 的同一套
版本化（versification），所以節鍵天生一致，不需要節對位表。

但實測發現少數地方版本間節數確實不同（例：約翰三書 KJV 14 節、和合本與
WEB 15 節），故採「所有版本 sec 的聯集」，缺的版本該節留空，前端顯示空格。

同時輸出兩種格式：
  parsed/NN_Engs.json  正規資料格式（重建 / 再利用用）
  app/data/NN_Engs.js  同一份資料包成 JS —— 因為 file:// 下 fetch() 會被
                       CORS 擋掉，只有 <script src> 載得進來，這是「雙擊
                       即開、免架伺服器」的關鍵。
"""
import io
import json
import os
import sys

import common
from fhl_markup import parse_verse

VERSION_KEYS = [v["key"] for v in common.VERSIONS]
STRONG_KEYS = [v["key"] for v in common.VERSIONS if v["strong"]]


def raw_path(vkey, book_dir, chap):
    return os.path.join(common.RAW_DIR, vkey, book_dir, "%03d.json" % chap)


def load_chapter(vkey, book_dir, chap):
    """回傳 {sec: bible_text}；檔案不存在回 None。"""
    path = raw_path(vkey, book_dir, chap)
    if not os.path.exists(path):
        return None
    try:
        data = common.read_json(path)
    except ValueError:
        # 檔案可能正被下載器寫入中，或先前寫壞了；當成缺漏，重跑下載即可補上
        return None
    out = {}
    for rec in data.get("record", []):
        try:
            sec = int(rec.get("sec"))
        except (TypeError, ValueError):
            continue
        text = rec.get("bible_text") or ""
        # 同一節偶有多筆（分段），接起來
        out[sec] = (out.get(sec, "") + text) if sec in out else text
    return out


def build_book(book, stats):
    chapters = []
    for chap in range(1, book["chapters"] + 1):
        loaded = {}
        for vkey in VERSION_KEYS:
            got = load_chapter(vkey, book["dir"], chap)
            if got is None:
                stats["missing_files"].append("%s/%s/%03d" % (vkey, book["dir"], chap))
            else:
                loaded[vkey] = got

        if not loaded:
            stats["missing_chapters"].append("%s %d" % (book["engs"], chap))
            continue

        secs = sorted({s for m in loaded.values() for s in m})
        verses = []
        for sec in secs:
            texts = {}
            words = {}
            notes = {}
            para = False
            for vkey in VERSION_KEYS:
                src = loaded.get(vkey, {}).get(sec)
                if src is None:
                    stats["verse_gaps"].append("%s %d:%d %s"
                                               % (book["engs"], chap, sec, vkey))
                    continue
                r = parse_verse(src)
                texts[vkey] = r["text"]
                if vkey in STRONG_KEYS and r["words"]:
                    words[vkey] = r["words"]
                if r["notes"]:
                    notes[vkey] = r["notes"]
                para = para or r["para"]
                stats["verses"] += 1
                for unit in r["words"]:
                    for s in unit.get("s", []):
                        stats["strongs"].add(s)

            verse = {"s": sec, "t": texts}
            if words:
                verse["w"] = words
            if notes:
                verse["n"] = notes
            if para:
                verse["p"] = 1
            verses.append(verse)

        chapters.append({"c": chap, "v": verses})
        stats["chapters"] += 1

    return {
        "no": book["book_no"],
        "engs": book["engs"],
        "dir": book["dir"],
        "ab": book["chineses"],
        "zh": book["name_zh"],
        "en": book["name_en"],
        "t": book["testament"],
        "nch": book["chapters"],
        "ch": chapters,
    }


def main():
    common.utf8_stdout()
    books = common.load_books()
    common.ensure_dir(common.PARSED_DIR)
    common.ensure_dir(common.APP_DATA_DIR)

    stats = {
        "verses": 0, "chapters": 0, "strongs": set(),
        "missing_files": [], "missing_chapters": [], "verse_gaps": [],
    }
    index = []
    total_bytes = 0

    for book in books:
        data = build_book(book, stats)
        stem = "%02d_%s" % (book["book_no"], book["dir"])

        json_path = os.path.join(common.PARSED_DIR, stem + ".json")
        common.write_json(json_path, data)

        js_path = os.path.join(common.APP_DATA_DIR, stem + ".js")
        blob = json.dumps(data, ensure_ascii=False, separators=(",", ":"))
        with io.open(js_path, "w", encoding="utf-8", newline="\n") as fh:
            fh.write("BIBLIA.receive(" + blob + ");\n")
        total_bytes += len(blob.encode("utf-8"))

        index.append({
            "no": book["book_no"], "engs": book["engs"], "dir": book["dir"],
            "ab": book["chineses"], "zh": book["name_zh"], "en": book["name_en"],
            "t": book["testament"], "nch": book["chapters"], "file": stem + ".js",
        })
        common.log("解析 %-12s %2d 卷 %3d 章" % (book["name_zh"], book["book_no"],
                                              len(data["ch"])), echo=False)

    books_js = os.path.join(common.APP_DATA_DIR, "books.js")
    with io.open(books_js, "w", encoding="utf-8", newline="\n") as fh:
        fh.write("BIBLIA.books(" + json.dumps(index, ensure_ascii=False,
                                              separators=(",", ":")) + ");\n")

    common.log("解析完成：%d 章 / %d 節 / %d 個相異 Strong / 資料 %.1f MB"
               % (stats["chapters"], stats["verses"], len(stats["strongs"]),
                  total_bytes / 1048576.0))
    if stats["missing_chapters"]:
        common.log("警告：%d 章完全沒有資料（前 10）：%s"
                   % (len(stats["missing_chapters"]), stats["missing_chapters"][:10]))
    if stats["missing_files"]:
        common.log("警告：%d 個 raw 檔缺漏（前 10）：%s"
                   % (len(stats["missing_files"]), stats["missing_files"][:10]))
    if stats["verse_gaps"]:
        common.log("提示：%d 處版本間節數落差（正常，前 5）：%s"
                   % (len(stats["verse_gaps"]), stats["verse_gaps"][:5]))

    if stats["missing_chapters"]:
        sys.exit(1)


if __name__ == "__main__":
    main()
