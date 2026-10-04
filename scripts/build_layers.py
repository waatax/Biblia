# -*- coding: utf-8 -*-
"""parsed/*.json → app/data/text/<版本>/NN.js、app/data/words/<版本>/NN.js、
app/data/strong_index_<H|G>.js

為什麼要拆：
  原本一卷一檔（NN_Book.js）把 11 個譯本的經文、四個譯本的逐字 Strong 對照
  全塞在一起，創世記一檔 4.6 MB。只讀和合本的人也得下載、解析整包，
  手機在 GitHub Pages 上要等很久；全文搜尋更要一次吞下 66 卷 ≈ 107 MB。

  拆成「版本 × 書卷」的經文層與逐字層後：
    text/zh_unv/01.js   創世記和合本 ≈ 0.2 MB（gzip 後約 70 KB）
    words/zh_unv/01.js  只有開啟「逐字對照」時才載入
  前端只抓目前勾選的版本，搜尋也只抓要搜的那個版本。

檔案格式（皆為 <script> 可直接載入的 JS，維持 file:// 雙擊可用）：
  BIBLIA.layer("t", "zh_unv", 1, {"s": 骨架, "t": [[經文...], ...], "n": [...]})
  BIBLIA.layer("w", "zh_unv", 1, {"s": 骨架, "w": [[逐字單元...], ...]})

  骨架 s = [[章號, 節數或節號陣列, [分段節的索引...]], ...]，
  每一層都附同一份骨架，因此任何一層先到都能建出整卷結構。
  t/w 陣列與骨架逐節對齊；該版本此節不存在時填 null（與 "" 空內文區分）。
  n 只有 KJV 有：[[章索引, 節索引, [註...]], ...]

Strong 反向索引改為 H / G 兩檔、經節位置以 b*1e6+c*1e3+s 編碼後差分，
體積約為原 search_index.js 的三分之一，且只在真的做 Strong 搜尋時才載入。

用法：python scripts/build_layers.py      （parse.py 結尾也會自動呼叫）
"""
import io
import json
import os
import shutil

import common

TEXT_DIR = os.path.join(common.APP_DATA_DIR, "text")
WORDS_DIR = os.path.join(common.APP_DATA_DIR, "words")


def _dump(obj):
    return json.dumps(obj, ensure_ascii=False, separators=(",", ":"))


def _write(path, text):
    common.ensure_dir(os.path.dirname(path))
    tmp = path + ".tmp"
    with io.open(tmp, "w", encoding="utf-8", newline="\n") as fh:
        fh.write(text)
    os.replace(tmp, path)


def skeleton(data):
    skel = []
    for ch in data["ch"]:
        secs = [v["s"] for v in ch["v"]]
        paras = [i for i, v in enumerate(ch["v"]) if v.get("p")]
        verses = len(secs) if secs == list(range(1, len(secs) + 1)) else secs
        skel.append([ch["c"], verses, paras])
    return skel


def split_book(data):
    """回傳 {("t"|"w", vkey): payload}。"""
    skel = skeleton(data)
    tkeys, wkeys = set(), set()
    for ch in data["ch"]:
        for v in ch["v"]:
            tkeys.update((v.get("t") or {}).keys())
            wkeys.update((v.get("w") or {}).keys())

    out = {}
    for k in sorted(tkeys):
        texts, notes = [], []
        for ci, ch in enumerate(data["ch"]):
            row = []
            for vi, v in enumerate(ch["v"]):
                row.append((v.get("t") or {}).get(k))
                n = (v.get("n") or {}).get(k)
                if n:
                    notes.append([ci, vi, n])
            texts.append(row)
        payload = {"s": skel, "t": texts}
        if notes:
            payload["n"] = notes
        out[("t", k)] = payload

    for k in sorted(wkeys):
        words = [[(v.get("w") or {}).get(k) for v in ch["v"]] for ch in data["ch"]]
        out[("w", k)] = {"s": skel, "w": words}
    return out


def strong_refs(data, index):
    no = data["no"]
    for ch in data["ch"]:
        for v in ch["v"]:
            codes = set()
            for units in (v.get("w") or {}).values():
                for u in units:
                    codes.update(u.get("s", []))
            ref = no * 1000000 + ch["c"] * 1000 + v["s"]
            for code in codes:
                index.setdefault(code, []).append(ref)


def write_strong_index(index):
    total = 0
    for lang in ("H", "G"):
        bag = {}
        for code in sorted(k for k in index if k.startswith(lang)):
            refs = sorted(set(index[code]))
            prev, deltas = 0, []
            for r in refs:
                deltas.append(r - prev)
                prev = r
            bag[code] = deltas
        blob = _dump(bag)
        _write(os.path.join(common.APP_DATA_DIR, "strong_index_%s.js" % lang),
               'BIBLIA.strongIndex("%s",%s);\n' % (lang, blob))
        total += len(blob.encode("utf-8"))
    return total


def load_book_json(book):
    stem = "%02d_%s" % (book["book_no"], book["dir"])
    path = os.path.join(common.PARSED_DIR, stem + ".json")
    if os.path.exists(path):
        return common.read_json(path)
    raise SystemExit("找不到 %s，請先執行 scripts/parse.py" % path)


def build(books=None, datas=None):
    """books 與 datas 由 parse.py 直接傳入時省去重讀 parsed/。"""
    common.utf8_stdout()
    books = books or common.load_books()
    # 先清掉舊輸出，避免版本改名後殘留孤兒檔
    for d in (TEXT_DIR, WORDS_DIR):
        if os.path.isdir(d):
            shutil.rmtree(d)

    sizes = {}
    strong = {}
    for i, book in enumerate(books):
        data = datas[i] if datas else load_book_json(book)
        no = data["no"]
        for (kind, vkey), payload in split_book(data).items():
            base = TEXT_DIR if kind == "t" else WORDS_DIR
            js = 'BIBLIA.layer("%s","%s",%d,%s);\n' % (kind, vkey, no, _dump(payload))
            _write(os.path.join(base, vkey, "%02d.js" % no), js)
            sizes[(kind, vkey)] = sizes.get((kind, vkey), 0) + len(js.encode("utf-8"))
        strong_refs(data, strong)

    sidx = write_strong_index(strong)
    for (kind, vkey), n in sorted(sizes.items()):
        common.log("  %s/%-11s %6.2f MB" % ("text" if kind == "t" else "words",
                                            vkey, n / 1048576.0))
    common.log("拆層完成：%d 個版本經文層、%d 個逐字層；Strong 索引 %.2f MB（%d 個號碼）"
               % (sum(1 for k in sizes if k[0] == "t"), sum(1 for k in sizes if k[0] == "w"),
                  sidx / 1048576.0, len(strong)))


if __name__ == "__main__":
    build()
