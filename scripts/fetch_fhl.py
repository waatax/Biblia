# -*- coding: utf-8 -*-
"""從 FHL JSON API 逐章下載公有領域聖經版本到 raw/。

三個版本共 1,189 章 × 3 = 3,567 次請求，1.5s 間隔約 90 分鐘。

設計要點：
  * 冪等 —— 已存在的章直接跳過，中斷後重跑即續傳。
  * raw/ 為唯一真相來源，永不覆寫（除非 --force）。
  * 每章驗證 status/record_count，失敗記入 download.log 並繼續，最後彙總。

用法：
  python scripts/fetch_fhl.py                # 抓全部三個版本（繁體）
  python scripts/fetch_fhl.py --gb 1         # 改抓簡體
  python scripts/fetch_fhl.py --books Gen,Matt --versions unv
"""
import argparse
import csv
import hashlib
import io
import json
import os
import sys
import time

import common


def manifest_writer():
    """開啟 manifest.csv 供附加；不存在時先寫表頭。"""
    exists = os.path.exists(common.MANIFEST_CSV)
    fh = io.open(common.MANIFEST_CSV, "a", encoding="utf-8", newline="")
    writer = csv.writer(fh)
    if not exists:
        writer.writerow(["version", "engs", "chap", "verses", "bytes",
                         "sha1", "fetched_at"])
    return fh, writer


def raw_path(vkey, book_dir, chap):
    return os.path.join(common.RAW_DIR, vkey, book_dir, "%03d.json" % chap)


def build_jobs(books, versions, gb):
    jobs = []
    for v in versions:
        for b in books:
            for chap in range(1, b["chapters"] + 1):
                jobs.append((v, b, chap))
    return jobs


def main():
    common.utf8_stdout()
    ap = argparse.ArgumentParser()
    ap.add_argument("--gb", type=int, default=0,
                    help="0=繁體（預設），1=簡體")
    ap.add_argument("--books", default="",
                    help="限定書卷，逗號分隔的 engs（如 Gen,Matt）")
    ap.add_argument("--versions", default="",
                    help="限定版本，逗號分隔（unv,kjv,web）")
    ap.add_argument("--interval", type=float, default=common.REQUEST_INTERVAL,
                    help="每請求間隔秒數（預設 1.5）")
    ap.add_argument("--force", action="store_true",
                    help="即使已存在也重抓（預設跳過）")
    args = ap.parse_args()

    books = common.load_books()
    if args.books:
        want = {s.strip() for s in args.books.split(",") if s.strip()}
        books = [b for b in books if b["engs"] in want or b["dir"] in want]
        if not books:
            raise SystemExit("--books 沒有比對到任何書卷")

    versions = common.FHL_VERSIONS      # RVR1909 不在 FHL，由 fetch_rvr1909.py 處理
    if args.versions:
        want = {s.strip() for s in args.versions.split(",") if s.strip()}
        versions = [v for v in versions if v["version"] in want]
        if not versions:
            raise SystemExit("--versions 沒有比對到任何版本")

    jobs = build_jobs(books, versions, args.gb)
    total = len(jobs)
    common.log("準備下載 %d 章（%d 版本 × %d 卷），間隔 %.2fs，gb=%d"
               % (total, len(versions), len(books), args.interval, args.gb),
               common.DOWNLOAD_LOG)

    fh, manifest = manifest_writer()
    done = skipped = failed = 0
    failures = []
    started = time.time()

    try:
        for idx, (v, b, chap) in enumerate(jobs, 1):
            path = raw_path(v["key"], b["dir"], chap)
            if os.path.exists(path) and not args.force:
                skipped += 1
                continue

            try:
                data = common.fetch_chapter(
                    b["chineses"], chap, v["version"], v["strong"], args.gb)
                if v["version"] == "korean" and "record" in data:
                    for rec in data["record"]:
                        if "bible_text" in rec and rec["bible_text"]:
                            words = rec["bible_text"].split("  ")
                            clean_words = [w.replace(" ", "") for w in words if w.strip()]
                            rec["bible_text"] = " ".join(clean_words)
            except RuntimeError as exc:
                failed += 1
                failures.append((v["version"], b["engs"], chap, str(exc)))
                common.log("失敗 %s %s %d：%s"
                           % (v["version"], b["engs"], chap, exc),
                           common.DOWNLOAD_LOG)
                time.sleep(args.interval)
                continue

            payload = json.dumps(data, ensure_ascii=False, separators=(",", ":"))
            common.ensure_dir(os.path.dirname(path))
            with io.open(path, "w", encoding="utf-8", newline="\n") as out:
                out.write(payload)

            blob = payload.encode("utf-8")
            manifest.writerow([v["version"], b["engs"], chap,
                               len(data["record"]), len(blob),
                               hashlib.sha1(blob).hexdigest(), common.now()])
            fh.flush()
            done += 1

            if done % 25 == 0 or idx == total:
                elapsed = time.time() - started
                rate = done / elapsed if elapsed else 0
                remain = (total - idx) * args.interval / 60.0
                common.log("進度 %d/%d｜新增 %d 跳過 %d 失敗 %d｜約剩 %.0f 分"
                           % (idx, total, done, skipped, failed, remain),
                           common.DOWNLOAD_LOG)

            time.sleep(args.interval)
    except KeyboardInterrupt:
        common.log("使用者中斷；已抓的章保留，重跑即續傳。", common.DOWNLOAD_LOG)
    finally:
        fh.close()

    common.log("完成：新增 %d、跳過 %d、失敗 %d（共 %d）"
               % (done, skipped, failed, total), common.DOWNLOAD_LOG)
    if failures:
        common.log("以下章節需重跑：", common.DOWNLOAD_LOG)
        for f in failures[:50]:
            common.log("  %s %s %s → %s" % f, common.DOWNLOAD_LOG)
        sys.exit(1)


if __name__ == "__main__":
    main()
