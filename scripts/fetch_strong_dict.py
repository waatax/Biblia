# -*- coding: utf-8 -*-
"""下載 Strong 號碼的原文字典釋義（FHL sd.php）。

授權說明（下載前已查證 https://www.fhl.net/main/fhl/fhl8.html）：
  * 信望愛《和合本》的 Strong's numbers 著作權為信望愛所有，採 **open source FDL**
    授權，可散布；並要求「請勿任意移除 Strong's numbers 標記」——
    本專案完整保留這些標記。
  * 另有兩個詞典端點 sbdag.php（希臘文）與 stwcbhdic.php（希伯來文）明載
    「僅授權給信望愛站使用」，本專案**完全不碰**。
  * 此處使用的 sd.php 原文字典不在上述受限清單中；其 edic_text 為公有領域的
    BDB／Thayer 系精簡詞典資料。

sd.php 一次只能查一個號碼（實測逗號、空白、範圍都只回第一筆），
所以是逐號抓取。全書用到 14,279 個相異號碼，間隔 1.0 秒約 4 小時。
與經文下載一樣採冪等設計：已存在就跳過，中斷後重跑即續傳。

用法：
  python scripts/fetch_strong_dict.py
  python scripts/fetch_strong_dict.py --interval 1.5
"""
import argparse
import json
import os
import re
import sys
import time
import urllib.parse

import common

DICT_DIR = os.path.join(common.RAW_DIR, "strong_dict")
LOG = os.path.join(common.ROOT, "strong_dict.log")


# 標準 Strong 編號範圍
HEBREW_MAX = 8674          # Strong's Hebrew：H1–H8674
GREEK_MAX = 5624           # Strong's Greek：G1–G5624
# 信望愛用來標希伯來文前綴質詞的擴充碼（實測見到 H9001–H9013）
FHL_EXT_RANGE = (9001, 9099)


def sort_key(code):
    return (code[0], int(re.sub(r"[^0-9]", "", code) or 0), code)


def collect_used():
    """從 parsed/ 掃出經文實際用到的 Strong 號碼（含 G3588a 這類字母變體）。"""
    codes = set()
    if not os.path.isdir(common.PARSED_DIR):
        raise SystemExit("找不到 parsed/，請先執行 scripts/parse.py")
    for fn in sorted(os.listdir(common.PARSED_DIR)):
        if not fn.endswith(".json") or fn == "strong_dict.json":
            continue
        data = common.read_json(os.path.join(common.PARSED_DIR, fn))
        for ch in data.get("ch", []):
            for verse in ch.get("v", []):
                for units in (verse.get("w") or {}).values():
                    for u in units:
                        for s in u.get("s", []):
                            codes.add(s)
    return codes


def collect_codes(complete=True):
    """完整字典 = 標準全編號 ∪ 信望愛擴充碼 ∪ 經文實際用到的（含字母變體）。"""
    used = collect_used()
    if not complete:
        return sorted(used, key=sort_key)

    codes = set(used)
    codes |= set("H%d" % i for i in range(1, HEBREW_MAX + 1))
    codes |= set("G%d" % i for i in range(1, GREEK_MAX + 1))
    codes |= set("H%d" % i for i in range(FHL_EXT_RANGE[0], FHL_EXT_RANGE[1] + 1))
    return sorted(codes, key=sort_key)


def out_path(code):
    return os.path.join(DICT_DIR, code[0], "%s.json" % code)


def fetch_one(code):
    """code 形如 H7225 / G26。N=1 為舊約(希伯來)、N=0 為新約(希臘)。"""
    num = re.sub(r"[^0-9]", "", code)
    n = 1 if code.startswith("H") else 0
    url = common.FHL_JSON_BASE + "/sd.php?" + urllib.parse.urlencode(
        {"k": num, "N": n, "gb": 0})
    data = json.loads(common.http_get(url))
    if data.get("status") != "success":
        raise RuntimeError("status=%s" % data.get("status"))
    return data


def main():
    common.utf8_stdout()
    ap = argparse.ArgumentParser()
    ap.add_argument("--interval", type=float, default=1.0)
    ap.add_argument("--force", action="store_true")
    ap.add_argument("--codes", default="",
                    help="只抓指定號碼，逗號分隔（如 H7225,G26），供測試用")
    ap.add_argument("--used-only", action="store_true",
                    help="只抓經文用到的號碼（預設抓完整字典）")
    args = ap.parse_args()

    if args.codes:
        codes = [c.strip().upper() for c in args.codes.split(",") if c.strip()]
    else:
        codes = collect_codes(complete=not args.used_only)
    scope = "經文用到的" if args.used_only else "完整字典"
    common.log("%s Strong 號碼：%d 個（H %d / G %d）；間隔 %.2fs，預估 %.1f 小時"
               % (scope, len(codes),
                  len([c for c in codes if c[0] == "H"]),
                  len([c for c in codes if c[0] == "G"]),
                  args.interval, len(codes) * args.interval / 3600.0), LOG)

    done = skipped = failed = empty = 0
    started = time.time()
    try:
        for i, code in enumerate(codes, 1):
            path = out_path(code)
            if os.path.exists(path) and not args.force:
                skipped += 1
                continue
            try:
                data = fetch_one(code)
            except (RuntimeError, ValueError) as exc:
                failed += 1
                common.log("失敗 %s：%s" % (code, exc), LOG)
                time.sleep(args.interval)
                continue

            recs = data.get("record") or []
            # sn 為 00000 代表查無此號（如 FHL 的 H9001-H9013 前綴擴充碼）
            hit = [r for r in recs
                   if str(r.get("sn", "")).strip("0") not in ("", None)]
            if not hit:
                empty += 1
            common.write_json(path, {
                "code": code,
                "found": bool(hit),
                "record": recs,
            })
            done += 1

            if done % 200 == 0:
                left = (len(codes) - i) * args.interval / 60.0
                common.log("進度 %d/%d｜新增 %d 跳過 %d 查無 %d 失敗 %d｜約剩 %.0f 分"
                           % (i, len(codes), done, skipped, empty, failed, left), LOG)
            time.sleep(args.interval)
    except KeyboardInterrupt:
        common.log("使用者中斷；已抓的保留，重跑即續傳。", LOG)

    common.log("完成：新增 %d、跳過 %d、查無 %d、失敗 %d（共 %d），耗時 %.1f 分"
               % (done, skipped, empty, failed, len(codes),
                  (time.time() - started) / 60.0), LOG)
    if failed:
        sys.exit(1)


if __name__ == "__main__":
    main()
