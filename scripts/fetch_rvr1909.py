# -*- coding: utf-8 -*-
"""取得西班牙文 Reina-Valera 1909（公有領域），拆成與其他版本相同的逐章格式。

RVR1909 不在 FHL 提供的版本清單中（實測 abv.php 共 89 個版本、零個西班牙文），
所以改用外部公有領域資料源：

    scrollmapper/bible_databases  →  formats/json/SpaRV.json
    「SpaRV: La Santa Biblia Reina-Valera (1909)」，單一 8.2 MB JSON。
    倉庫本身為 MIT 授權；RVR1909 譯本本文為公有領域。

節對位：實測此資料源與 FHL 的版本化幾乎完全一致 ——
66 卷章數全部相符、總計 1,189 章、31,102 節，
只有 3 章節數不同（約翰福音 7、約翰三書 1、啟示錄 12），
且正是既有的版本化差異。因此不需要對位表，直接以
「卷序 + 章號 + 節號」對齊即可，差異由既有的節聯集邏輯吸收。

輸出：
    raw/es_rvr1909/_source/SpaRV.json   原始下載檔，永久保存
    raw/es_rvr1909/<卷>/<章>.json       逐章，欄位沿用 record/sec/bible_text
"""
import argparse
import io
import json
import os
import sys

import common

SOURCE_URL = ("https://raw.githubusercontent.com/scrollmapper/bible_databases"
              "/master/formats/json/SpaRV.json")
SOURCE_NAME = "scrollmapper/bible_databases formats/json/SpaRV.json"
VKEY = "es_rvr1909"


def source_path():
    return os.path.join(common.RAW_DIR, VKEY, "_source", "SpaRV.json")


def download(force=False):
    path = source_path()
    if os.path.exists(path) and not force:
        common.log("原始檔已存在，跳過下載：%s" % path)
        return path
    common.log("下載 %s" % SOURCE_URL)
    text = common.http_get(SOURCE_URL, timeout=180)
    common.ensure_dir(os.path.dirname(path))
    with io.open(path, "w", encoding="utf-8", newline="\n") as fh:
        fh.write(text)
    common.log("已存 %s（%.1f MB）" % (path, len(text.encode("utf-8")) / 1048576.0))
    return path


def main():
    common.utf8_stdout()
    ap = argparse.ArgumentParser()
    ap.add_argument("--force", action="store_true", help="重新下載原始檔並覆寫逐章檔")
    args = ap.parse_args()

    books = common.load_books()
    path = download(args.force)
    data = common.read_json(path)

    src_books = data.get("books") or []
    if len(src_books) != 66:
        raise SystemExit("來源書卷數應為 66，實得 %d" % len(src_books))

    # 以卷序對齊，並用「章數必須逐卷相符」當作驗證，確保沒有錯位。
    mismatch = []
    for b, sb in zip(books, src_books):
        if len(sb.get("chapters") or []) != b["chapters"]:
            mismatch.append("%s(%s) 應 %d 章、來源 %d 章"
                            % (b["engs"], sb.get("name"), b["chapters"],
                               len(sb.get("chapters") or [])))
    if mismatch:
        raise SystemExit("卷序對齊失敗：\n  " + "\n  ".join(mismatch[:10]))

    written = skipped = 0
    total_verses = 0
    for b, sb in zip(books, src_books):
        for ch in sb["chapters"]:
            chap = int(ch["chapter"])
            recs = []
            for v in ch["verses"]:
                recs.append({
                    "engs": b["engs"],
                    "chineses": b["chineses"],
                    "chap": chap,
                    "sec": int(v["verse"]),
                    "bible_text": v.get("text") or "",
                })
            total_verses += len(recs)

            out = os.path.join(common.RAW_DIR, VKEY, b["dir"], "%03d.json" % chap)
            if os.path.exists(out) and not args.force:
                skipped += 1
                continue
            common.write_json(out, {
                "status": "success",
                "record_count": len(recs),
                "v_name": data.get("translation", "Reina-Valera 1909"),
                "version": "rvr1909",
                "source": SOURCE_NAME,
                "source_url": SOURCE_URL,
                "record": recs,
            })
            written += 1

    common.log("完成：寫入 %d 章、跳過 %d 章，共 %d 節"
               % (written, skipped, total_verses))
    if total_verses != 31102:
        common.log("提醒：總節數 %d（RVR1909 預期 31,102）" % total_verses)


if __name__ == "__main__":
    main()
