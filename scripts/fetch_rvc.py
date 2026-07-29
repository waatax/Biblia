# -*- coding: utf-8 -*-
"""取得西班牙文 Reina Valera Contemporánea（RVC），拆成與其他版本相同的逐章格式。

資料源：
    mrk214/bible-data-es-spa (RVC_vid_146.json)
    「Reina Valera Contemporánea」，單一 JSON。

輸出：
    raw/es_rvc/_source/RVC.json        原始下載檔，離線保存
    raw/es_rvc/<卷>/<章>.json          逐章，欄位沿用 record/sec/bible_text
"""
import argparse
import io
import json
import os
import sys

import common

SOURCE_URL = ("https://mrk214.github.io/snapshots/es___spa___spa/RVC_vid_146.json")
SOURCE_NAME = "mrk214/bible-data-es-spa (RVC_vid_146.json)"
VKEY = "es_rvc"


def source_path():
    return os.path.join(common.RAW_DIR, VKEY, "_source", "RVC.json")


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
        for ch_idx, ch in enumerate(sb.get("chapters", []), 1):
            chap = ch_idx
            recs = []
            for item in ch.get("items", []):
                if item.get("type") == "verse":
                    vn_list = item.get("verse_numbers") or []
                    sec = int(vn_list[0]) if vn_list else len(recs) + 1
                    text = " ".join(item.get("lines") or []).strip()
                    if recs and recs[-1]["sec"] == sec:
                        if text:
                            recs[-1]["bible_text"] = (recs[-1]["bible_text"] + " " + text).strip()
                    else:
                        recs.append({
                            "engs": b["engs"],
                            "chineses": b["chineses"],
                            "chap": chap,
                            "sec": sec,
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
                "v_name": data.get("local_title") or "Reina Valera Contemporánea",
                "version": "rvc",
                "source": SOURCE_NAME,
                "source_url": SOURCE_URL,
                "record": recs,
            })
            written += 1

    common.log("完成：寫入 %d 章、跳過 %d 章，共 %d 節"
               % (written, skipped, total_verses))


if __name__ == "__main__":
    main()
