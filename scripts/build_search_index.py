# -*- coding: utf-8 -*-
"""從 parsed/*.json 建立離線搜尋索引 app/data/search_index.js

包含：
  1. strong: Strong 號碼到經文位置的反向索引 (Inverted Index)
     格式：{ "H7225": [[1, 1, 1], ...], "G2424": [...] }  (bookNo, chap, sec)
  2. 索引元資料與統計資訊
"""
import io
import json
import os
import sys

import common


def main():
    common.utf8_stdout()
    books = common.load_books()
    
    strong_index = {}
    total_verses = 0
    total_strong_hits = 0

    for book in books:
        stem = "%02d_%s" % (book["book_no"], book["dir"])
        json_path = os.path.join(common.PARSED_DIR, stem + ".json")
        if not os.path.exists(json_path):
            continue
            
        data = common.read_json(json_path)
        book_no = data["no"]
        
        for ch in data["ch"]:
            chap = ch["c"]
            for verse in ch["v"]:
                sec = verse["s"]
                total_verses += 1
                
                # 蒐集此節出現的所有 Strong 號碼
                verse_strongs = set()
                words_dict = verse.get("w") or {}
                for vkey, units in words_dict.items():
                    for u in units:
                        for s in u.get("s", []):
                            verse_strongs.add(s)
                            
                for s in verse_strongs:
                    if s not in strong_index:
                        strong_index[s] = []
                    strong_index[s].append([book_no, chap, sec])
                    total_strong_hits += 1

    payload = {
        "strong": strong_index,
        "meta": {
            "verses": total_verses,
            "strongs": len(strong_index),
            "hits": total_strong_hits,
        }
    }

    js_path = os.path.join(common.APP_DATA_DIR, "search_index.js")
    blob = json.dumps(payload, ensure_ascii=False, separators=(",", ":"))
    with io.open(js_path, "w", encoding="utf-8", newline="\n") as fh:
        fh.write("BIBLIA.searchIndex(" + blob + ");\n")

    common.log("搜尋索引建置完成：%d 個相異 Strong 號碼，共 %d 次命中 (%.2f KB)" % (
        len(strong_index), total_strong_hits, len(blob.encode("utf-8")) / 1024.0
    ))


if __name__ == "__main__":
    main()
