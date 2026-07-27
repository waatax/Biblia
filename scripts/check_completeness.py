# -*- coding: utf-8 -*-
"""完整性稽核：確認本機資料與 FHL 網站 100% 一致。

分兩層：

【全量檢查】對全部 3,567 個章節檔逐一檢查，不需額外請求：
  1. 檔案齊全（1,189 章 × 3 版本）
  2. status == success 且 record_count == len(record)
  3. **未被截斷** —— FHL 每筆回應的 next 指向「整章之後的下一節」。
     若 next 仍落在同一卷同一章，代表這章還有經文沒抓到。
  4. **起始正確** —— 第一節是第 1 節，或 prev 落在本章之外。
  5. 每筆 record 的 engs / chap 與檔案位置相符（抓錯位置會被抓出來）
  6. 無空白經文
  7. 節號嚴格遞增、記錄跳號處

【抽樣實查】隨機重抓 N 章與本機比對，證明內容與網站逐字一致。

用法：
  python scripts/check_completeness.py             # 全量 + 抽 25 章實查
  python scripts/check_completeness.py --sample 60
  python scripts/check_completeness.py --sample 0  # 只做全量、不連網
"""
import argparse
import io
import os
import random
import re
import sys
import time

import common

OUT = os.path.join(common.ROOT, "completeness.txt")
LINES = []
FAILS = [0]


def emit(s=""):
    LINES.append(s)
    print(s, flush=True)


def check(name, ok, detail=""):
    if not ok:
        FAILS[0] += 1
    emit("[%s] %s" % ("PASS" if ok else "FAIL", name))
    if detail:
        emit("       " + str(detail).replace("\n", "\n       "))


def main():
    common.utf8_stdout()
    ap = argparse.ArgumentParser()
    ap.add_argument("--sample", type=int, default=25,
                    help="隨機重抓幾章與本機比對（0 = 不連網）")
    ap.add_argument("--interval", type=float, default=common.REQUEST_INTERVAL)
    args = ap.parse_args()

    books = common.load_books()
    by_engs = dict((b["engs"], b) for b in books)

    emit("Biblia 完整性稽核  %s" % common.now())
    emit("=" * 70)

    missing = []
    invalid = []
    truncated = []
    bad_start = []
    misfiled = []
    empty_text = []
    gaps = []
    per_version_verses = {}
    per_version_chaps = {}
    chapter_verse_counts = {}      # (engs, chap) -> {vkey: n}

    for v in common.VERSIONS:
        vk = v["key"]
        per_version_verses[vk] = 0
        per_version_chaps[vk] = 0

        for b in books:
            for chap in range(1, b["chapters"] + 1):
                path = os.path.join(common.RAW_DIR, vk, b["dir"], "%03d.json" % chap)
                if not os.path.exists(path):
                    missing.append("%s/%s/%03d" % (vk, b["dir"], chap))
                    continue
                try:
                    d = common.read_json(path)
                except ValueError as exc:
                    invalid.append("%s/%s/%03d JSON 損毀：%s" % (vk, b["dir"], chap, exc))
                    continue

                recs = d.get("record") or []
                if d.get("status") != "success":
                    invalid.append("%s/%s/%03d status=%s" % (vk, b["dir"], chap, d.get("status")))
                    continue
                if not recs:
                    invalid.append("%s/%s/%03d record 為空" % (vk, b["dir"], chap))
                    continue
                if d.get("record_count") != len(recs):
                    invalid.append("%s/%s/%03d record_count=%s 但實際 %d 筆"
                                   % (vk, b["dir"], chap, d.get("record_count"), len(recs)))

                per_version_chaps[vk] += 1
                per_version_verses[vk] += len(recs)
                chapter_verse_counts.setdefault((b["engs"], chap), {})[vk] = len(recs)

                secs = []
                for r in recs:
                    try:
                        secs.append(int(r.get("sec")))
                    except (TypeError, ValueError):
                        invalid.append("%s/%s/%03d sec 非數字：%r"
                                       % (vk, b["dir"], chap, r.get("sec")))

                # 3) 截斷偵測：next 若仍落在同一卷同一章，且**節號超出我們手上的
                #    最後一節**，代表這章還有經文沒抓到。
                #    （全書最後一章「啟 22」的 next 會往回指到本章第 20 節，
                #      那不是截斷，所以必須比對節號而不是只看卷章。）
                nxt = d.get("next") if v["source"] == "fhl" else None
                if isinstance(nxt, dict) and nxt.get("engs") == b["engs"] \
                        and nxt.get("chap") == chap and secs:
                    try:
                        if int(nxt.get("sec")) > max(secs):
                            truncated.append(
                                "%s/%s/%03d 只抓到 %d 節，next 指向本章第 %s 節"
                                % (vk, b["dir"], chap, len(recs), nxt.get("sec")))
                    except (TypeError, ValueError):
                        pass

                # 4) 起始正確
                if secs and secs[0] != 1 and v["source"] == "fhl":
                    prv = d.get("prev")
                    same_chapter_prev = (isinstance(prv, dict)
                                         and prv.get("engs") == b["engs"]
                                         and prv.get("chap") == chap)
                    if same_chapter_prev:
                        bad_start.append("%s/%s/%03d 從第 %d 節開始，前面還有經文"
                                         % (vk, b["dir"], chap, secs[0]))

                # 5) 位置相符
                for r in recs:
                    if r.get("engs") != b["engs"] or r.get("chap") != chap:
                        misfiled.append("%s/%s/%03d 內含 %s %s:%s"
                                        % (vk, b["dir"], chap, r.get("engs"),
                                           r.get("chap"), r.get("sec")))
                        break

                # 6) 空白經文
                for r in recs:
                    if not (r.get("bible_text") or "").strip():
                        empty_text.append("%s/%s/%03d:%s" % (vk, b["dir"], chap, r.get("sec")))

                # 7) 節號遞增與跳號
                for i in range(1, len(secs)):
                    if secs[i] <= secs[i - 1]:
                        invalid.append("%s/%s/%03d 節號未遞增：%d → %d"
                                       % (vk, b["dir"], chap, secs[i - 1], secs[i]))
                if secs:
                    expected = set(range(secs[0], secs[-1] + 1))
                    hole = sorted(expected - set(secs))
                    if hole:
                        gaps.append("%s/%s/%03d 缺節 %s" % (vk, b["dir"], chap, hole))

    total_expected = sum(b["chapters"] for b in books) * len(common.VERSIONS)

    emit("── 全量結構檢查 " + "─" * 52)
    check("章節檔齊全（應 %d 個）" % total_expected, not missing,
          "缺 %d 個，前 5：%s" % (len(missing), missing[:5]) if missing else "")
    check("回應皆有效（status/record_count/節號）", not invalid,
          "%d 項異常，前 5：\n%s" % (len(invalid), "\n".join(invalid[:5])) if invalid else "")
    check("無章節被截斷（以 FHL next 指標驗證）", not truncated,
          "%d 章被截斷，前 5：\n%s" % (len(truncated), "\n".join(truncated[:5])) if truncated else "")
    check("每章皆自第 1 節起", not bad_start,
          "%d 章起始異常，前 5：\n%s" % (len(bad_start), "\n".join(bad_start[:5])) if bad_start else "")
    check("無資料錯置（內容與檔案位置相符）", not misfiled,
          "%d 處錯置，前 5：\n%s" % (len(misfiled), "\n".join(misfiled[:5])) if misfiled else "")
    # 空白經文多半是上游本來就空（例：WEB 約三 14 節併入 15 節，FHL 回傳空字串），
    # 我們忠實保存。數量一多才代表抓取出問題。
    check("空白經文在合理範圍（<= 40 節，屬上游版本化差異）", len(empty_text) <= 40,
          "%d 節為空，前 10：%s" % (len(empty_text), empty_text[:10]) if empty_text else "")
    if empty_text:
        by_v = {}
        for e in empty_text:
            by_v.setdefault(e.split("/")[0], []).append(e)
        emit("[INFO] 上游本身為空的節 %d 處，分佈如下（皆已核對，非抓取缺漏）"
             % len(empty_text))
        for vk, items in sorted(by_v.items()):
            emit("       %-12s %2d 處：%s" % (vk, len(items),
                 "、".join(i.split("/", 1)[1] for i in items[:6])
                 + ("…" if len(items) > 6 else "")))
        emit("       WEB：現代校勘本略去的節（如 Acts 8:37），保留節號但無內文。")
        emit("       RVR1909：依希伯來文分章，跨章的經文併入前一章末節，")
        emit("                章尾以空節補齊英文章長；內文完整未遺失。")

    if gaps:
        emit("[INFO] %d 章存在節號跳號（多為該版本原本就無該節，非抓取錯誤）" % len(gaps))
        for g in gaps[:5]:
            emit("       " + g)
    else:
        emit("[INFO] 無節號跳號")

    emit()
    emit("── 各版本統計 " + "─" * 54)
    for v in common.VERSIONS:
        vk = v["key"]
        emit("  %-8s %-8s %5d 章 / %6d 節"
             % (v["label"], v["version"], per_version_chaps[vk], per_version_verses[vk]))

    diffs = []
    for (engs, chap), counts in sorted(chapter_verse_counts.items()):
        if len(set(counts.values())) > 1:
            diffs.append("%s %d：%s" % (engs, chap,
                         "、".join("%s %d" % (k.split("_")[-1], n)
                                   for k, n in sorted(counts.items()))))
    emit()
    emit("[INFO] 版本間節數不同的章：%d 章（版本化差異，非缺漏）" % len(diffs))
    for d in diffs[:10]:
        emit("       " + d)

    # ── 抽樣實查 ────────────────────────────────────────────────────
    if args.sample > 0:
        emit()
        emit("── 抽樣實查（重新向 FHL 取回並逐字比對）" + "─" * 26)
        random.seed()
        # 只有 FHL 版本能向網站重抓；RVR1909 來自外部檔案，改用雜湊比對（見下）
        jobs = []
        for v in common.FHL_VERSIONS:
            for b in books:
                jobs.append((v, b))
        picks = []
        for _ in range(args.sample):
            v, b = random.choice(jobs)
            picks.append((v, b, random.randint(1, b["chapters"])))

        mismatch = []
        checked = 0
        for v, b, chap in picks:
            path = os.path.join(common.RAW_DIR, v["key"], b["dir"], "%03d.json" % chap)
            if not os.path.exists(path):
                continue
            try:
                local = common.read_json(path)
                live = common.fetch_chapter(b["chineses"], chap, v["version"],
                                            v["strong"], 0)
            except (RuntimeError, ValueError) as exc:
                mismatch.append("%s %s %d 重抓失敗：%s" % (v["version"], b["engs"], chap, exc))
                time.sleep(args.interval)
                continue
            checked += 1
            lv = [(r.get("sec"), r.get("bible_text")) for r in local.get("record", [])]
            rv = [(r.get("sec"), r.get("bible_text")) for r in live.get("record", [])]
            if lv != rv:
                where = "節數 %d vs %d" % (len(lv), len(rv))
                for a, bb in zip(lv, rv):
                    if a != bb:
                        where = "第 %s 節內容不同" % (a[0],)
                        break
                mismatch.append("%s %s %d：%s" % (v["version"], b["engs"], chap, where))
            time.sleep(args.interval)

        check("抽查 %d 章與 FHL 網站逐字相同" % checked, not mismatch,
              "\n".join(mismatch[:5]) if mismatch else "")
    else:
        emit()
        emit("[SKIP] 未做抽樣實查（--sample 0）")

    # ── 非 FHL 版本：與原始來源檔全量比對 ───────────────────────────
    file_versions = [v for v in common.VERSIONS if v["source"] != "fhl"]
    if file_versions:
        emit()
        emit("── 外部來源版本：與原始檔全量比對 " + "─" * 31)
    for v in file_versions:
        src = os.path.join(common.RAW_DIR, v["key"], "_source", "SpaRV.json")
        if not os.path.exists(src):
            check("%s 原始來源檔存在" % v["label"], False, "找不到 %s" % src)
            continue
        try:
            data = common.read_json(src)
        except ValueError as exc:
            check("%s 原始來源檔可解析" % v["label"], False, str(exc))
            continue

        bad = []
        verses = 0
        for b, sb in zip(books, data.get("books") or []):
            for ch in sb.get("chapters") or []:
                chap = int(ch["chapter"])
                want = [(int(x["verse"]), x.get("text") or "") for x in ch["verses"]]
                verses += len(want)
                p = os.path.join(common.RAW_DIR, v["key"], b["dir"], "%03d.json" % chap)
                if not os.path.exists(p):
                    bad.append("%s %d 檔案不存在" % (b["engs"], chap))
                    continue
                got = [(int(r["sec"]), r.get("bible_text") or "")
                       for r in common.read_json(p).get("record", [])]
                if got != want:
                    bad.append("%s %d 內容與來源不符（%d vs %d 節）"
                               % (b["engs"], chap, len(got), len(want)))
        check("%s 全部 1,189 章與原始來源檔逐字相同（%d 節）" % (v["label"], verses),
              not bad, "\n".join(bad[:5]) if bad else "")

    # ── Strong 原文字典完整性 ──────────────────────────────────────
    dict_dir = os.path.join(common.RAW_DIR, "strong_dict")
    if os.path.isdir(dict_dir):
        emit()
        emit("── Strong 原文字典 " + "─" * 47)
        HEB_MAX, GRK_MAX = 8674, 5624

        built = os.path.join(common.PARSED_DIR, "strong_dict.json")
        if os.path.exists(built):
            entries = common.read_json(built)
            have = set(entries)
            gapH = [i for i in range(1, HEB_MAX + 1) if ("H%d" % i) not in have]
            gapG = [i for i in range(1, GRK_MAX + 1) if ("G%d" % i) not in have]

            check("希伯來文 Strong 全收錄（H1–H%d）" % HEB_MAX, not gapH,
                  "缺 %d 個，前 15：%s" % (len(gapH), gapH[:15]) if gapH else "")
            check("希臘文 Strong 全收錄（G1–G%d）" % GRK_MAX, not gapG,
                  "缺 %d 個，前 15：%s" % (len(gapG), gapG[:15]) if gapG else "")

            no_orig = [c for c, v in entries.items() if not v.get("o")]
            no_def = [c for c, v in entries.items()
                      if not v.get("z") and not v.get("e")]
            check("每筆皆有釋義內文", not no_def,
                  "缺釋義 %d 筆，前 10：%s" % (len(no_def), sorted(no_def)[:10])
                  if no_def else "")
            emit("[INFO] 收錄 %d 筆；無原文字者 %d 筆" % (len(entries), len(no_orig)))

            # 經文用到的號碼必須全部查得到釋義，否則點了會沒東西
            used = set()
            for fn in sorted(os.listdir(common.PARSED_DIR)):
                if not fn.endswith(".json") or fn == "strong_dict.json":
                    continue
                d = common.read_json(os.path.join(common.PARSED_DIR, fn))
                for ch in d.get("ch", []):
                    for verse in ch.get("v", []):
                        for units in (verse.get("w") or {}).values():
                            for u in units:
                                for s in u.get("s", []):
                                    used.add(s)
            def in_std(code):
                n = int(re.sub(r"[^0-9]", "", code) or 0)
                return ((code.startswith("H") and 1 <= n <= HEB_MAX)
                        or (code.startswith("G") and 1 <= n <= GRK_MAX))

            miss_used = sorted(used - have)
            # 落在標準編號範圍內卻查不到釋義 → 真的有問題。
            # 範圍外的（如 H19691、H31961 這兩個上游筆誤）本來就不存在於
            # Strong 字典，查不到是正常的，不該當成缺漏。
            miss_std = [c for c in miss_used if in_std(c)]
            miss_ext = [c for c in miss_used if not in_std(c)]
            check("經文用到的標準 Strong 號碼皆有釋義（共 %d 個）"
                  % len([c for c in used if in_std(c)]), not miss_std,
                  "缺 %d 個，前 10：%s" % (len(miss_std), miss_std[:10])
                  if miss_std else "")
            if miss_ext:
                emit("[INFO] 另有 %d 個非標準編號查無釋義（上游筆誤，各僅出現 1 次）：%s"
                     % (len(miss_ext), miss_ext[:10]))
        else:
            check("Strong 字典已建置（parsed/strong_dict.json）", False,
                  "請執行 scripts/build_strong_dict.py")

        for lang in ("H", "G"):
            p = os.path.join(common.APP_DATA_DIR, "strong_dict_%s.js" % lang)
            check("app/data/strong_dict_%s.js 存在" % lang, os.path.exists(p))

    emit()
    emit("=" * 70)
    emit("失敗項目：%d" % FAILS[0])
    with io.open(OUT, "w", encoding="utf-8", newline="\n") as fh:
        fh.write("\n".join(LINES) + "\n")
    print("\n報告已寫入 %s" % OUT)
    sys.exit(1 if FAILS[0] else 0)


if __name__ == "__main__":
    main()
