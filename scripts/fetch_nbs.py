# -*- coding: utf-8 -*-
"""取得法文 Nouvelle Bible Segond（NBS），拆成與其他版本相同的逐章格式。

資料源：
    develop4God/bible_versions (NBS_fr.SQLite3.gz)
    「Nouvelle Bible Segond」，SQLite3 資料庫。

輸出：
    raw/fr_nbs/_source/NBS_fr.SQLite3.gz  原始檔
    raw/fr_nbs/<卷>/<章>.json             逐章，欄位沿用 record/sec/bible_text
"""
import argparse
import gzip
import io
import json
import os
import re
import sqlite3
import tempfile
import sys

import common

SOURCE_URL = ("https://raw.githubusercontent.com/develop4God/bible_versions/main/fr/NBS_fr.SQLite3.gz")
SOURCE_NAME = "develop4God/bible_versions (NBS_fr.SQLite3.gz)"
VKEY = "fr_nbs"


def source_path():
    return os.path.join(common.RAW_DIR, VKEY, "_source", "NBS_fr.SQLite3.gz")


def download_binary(force=False):
    path = source_path()
    if os.path.exists(path) and not force:
        common.log("原始檔已存在，跳過下載：%s" % path)
        return path
    common.log("下載 %s" % SOURCE_URL)
    import urllib.request
    req = urllib.request.Request(SOURCE_URL, headers={"User-Agent": common.USER_AGENT})
    with urllib.request.urlopen(req, timeout=180) as resp:
        data = resp.read()
    common.ensure_dir(os.path.dirname(path))
    with open(path, "wb") as fh:
        fh.write(data)
    common.log("已存 %s（%.1f MB）" % (path, len(data) / 1048576.0))
    return path


def clean_text(text):
    if not text:
        return ""
    t = re.sub(r"<f>.*?</f>", "", text, flags=re.DOTALL)
    t = re.sub(r"<[^>]+>", "", t)
    return t.strip()


def get_verses_map(conn):
    """讀取 SQLite 中的所有經文，針對 Joël 與 Malachie 的分章落差對位至 KJV 分章。"""
    c = conn.cursor()
    src_books = c.execute("SELECT book_number, short_name, long_name FROM books ORDER BY rowid").fetchall()

    data = {}
    for idx, (b_num, s_name, l_name) in enumerate(src_books, 1):
        rows = c.execute(
            "SELECT chapter, verse, text FROM verses WHERE book_number=? ORDER BY chapter, verse",
            (b_num,)
        ).fetchall()

        b_chaps = {}
        if b_num == 360:  # Joël (Hebrew 4 chapters -> KJV 3 chapters)
            b_chaps[1] = []
            b_chaps[2] = []
            b_chaps[3] = []
            for ch, v, t in rows:
                if ch == 1:
                    b_chaps[1].append((v, clean_text(t)))
                elif ch == 2:
                    b_chaps[2].append((v, clean_text(t)))
                elif ch == 3:
                    b_chaps[2].append((27 + v, clean_text(t)))
                elif ch == 4:
                    b_chaps[3].append((v, clean_text(t)))
        elif b_num == 460:  # Malachie (Hebrew 3 chapters -> KJV 4 chapters)
            b_chaps[1] = []
            b_chaps[2] = []
            b_chaps[3] = []
            b_chaps[4] = []
            for ch, v, t in rows:
                if ch == 1:
                    b_chaps[1].append((v, clean_text(t)))
                elif ch == 2:
                    b_chaps[2].append((v, clean_text(t)))
                elif ch == 3:
                    if v <= 18:
                        b_chaps[3].append((v, clean_text(t)))
                    else:
                        b_chaps[4].append((v - 18, clean_text(t)))
        else:
            for ch, v, t in rows:
                if ch not in b_chaps:
                    b_chaps[ch] = []
                b_chaps[ch].append((v, clean_text(t)))

        data[idx] = b_chaps
    return data


def main():
    common.utf8_stdout()
    ap = argparse.ArgumentParser()
    ap.add_argument("--force", action="store_true", help="重新下載原始檔並覆寫逐章檔")
    args = ap.parse_args()

    books = common.load_books()
    path = download_binary(args.force)

    with open(path, "rb") as fh:
        gz_data = fh.read()

    db_bytes = gzip.decompress(gz_data)
    tf = tempfile.NamedTemporaryFile(delete=False, suffix=".SQLite3")
    tf.write(db_bytes)
    tf.close()

    try:
        conn = sqlite3.connect(tf.name)
        data_map = get_verses_map(conn)
        conn.close()

        written = skipped = 0
        total_verses = 0

        for idx, b in enumerate(books, 1):
            b_data = data_map.get(idx, {})
            for chap in range(1, b["chapters"] + 1):
                rows = b_data.get(chap, [])
                recs = []
                for v_num, text in rows:
                    recs.append({
                        "engs": b["engs"],
                        "chineses": b["chineses"],
                        "chap": chap,
                        "sec": int(v_num),
                        "bible_text": text,
                    })
                total_verses += len(recs)

                out = os.path.join(common.RAW_DIR, VKEY, b["dir"], "%03d.json" % chap)
                if os.path.exists(out) and not args.force:
                    skipped += 1
                    continue

                common.write_json(out, {
                    "status": "success",
                    "record_count": len(recs),
                    "v_name": "Nouvelle Bible Segond",
                    "version": "nbs",
                    "source": SOURCE_NAME,
                    "source_url": SOURCE_URL,
                    "record": recs,
                })
                written += 1

        common.log("完成：寫入 %d 章、跳過 %d 章，共 %d 節"
                   % (written, skipped, total_verses))
    finally:
        try:
            os.unlink(tf.name)
        except OSError:
            pass


if __name__ == "__main__":
    main()
