# -*- coding: utf-8 -*-
"""raw/strong_dict/ → app/data/strong_dict.js

輸出格式（鍵名縮到最短，因為有 1.4 萬筆）：
    BIBLIA.strongDict({"H7225":{"o":"רֵאשִׁית","z":"中文釋義","e":"English"}, ...})

這個檔在前端是**點到 Strong 號碼時才延遲載入**，不進首頁的載入路徑，
以免拖慢開啟速度。
"""
import io
import json
import os
import re

import common

DICT_DIR = os.path.join(common.RAW_DIR, "strong_dict")
OUT_JS = os.path.join(common.APP_DATA_DIR, "strong_dict.js")
OUT_JSON = os.path.join(common.PARSED_DIR, "strong_dict.json")


def norm(text):
    if not text:
        return ""
    text = text.replace("\r\n", "\n").replace("\r", "\n")
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def main():
    common.utf8_stdout()
    if not os.path.isdir(DICT_DIR):
        raise SystemExit("找不到 %s，請先執行 scripts/fetch_strong_dict.py" % DICT_DIR)

    entries = {}
    missing = []
    files = 0
    for lang in sorted(os.listdir(DICT_DIR)):
        sub = os.path.join(DICT_DIR, lang)
        if not os.path.isdir(sub):
            continue
        for fn in sorted(os.listdir(sub)):
            if not fn.endswith(".json"):
                continue
            files += 1
            data = common.read_json(os.path.join(sub, fn))
            code = data.get("code")
            recs = data.get("record") or []
            if not data.get("found") or not recs:
                missing.append(code)
                continue
            r = recs[0]
            item = {}
            if r.get("orig"):
                item["o"] = r["orig"]
            z = norm(r.get("dic_text"))
            e = norm(r.get("edic_text"))
            if z:
                item["z"] = z
            if e and e != z:
                item["e"] = e
            if item:
                entries[code] = item

    common.ensure_dir(common.APP_DATA_DIR)
    common.ensure_dir(common.PARSED_DIR)

    # 依語言切成兩檔：讀舊約只會載到希伯來文那份，不必背著希臘文。
    # 前端是點到 Strong 號碼才延遲載入，載入量因此再少一半。
    total = 0
    for lang in ("H", "G"):
        part = dict((k, v) for k, v in entries.items() if k.startswith(lang))
        blob = json.dumps(part, ensure_ascii=False, separators=(",", ":"),
                          sort_keys=True)
        path = os.path.join(common.APP_DATA_DIR, "strong_dict_%s.js" % lang)
        with io.open(path, "w", encoding="utf-8", newline="\n") as fh:
            fh.write("BIBLIA.strongDict('%s'," % lang + blob + ");\n")
        size = len(blob.encode("utf-8")) / 1048576.0
        total += size
        common.log("  %s：%5d 筆、%.1f MB → %s" % (lang, len(part), size,
                                                 os.path.basename(path)))

    blob = json.dumps(entries, ensure_ascii=False, separators=(",", ":"),
                      sort_keys=True)
    with io.open(OUT_JSON, "w", encoding="utf-8", newline="\n") as fh:
        fh.write(blob)

    common.log("字典建立完成：讀入 %d 檔、收錄 %d 筆、合計 %.1f MB"
               % (files, len(entries), total))

    # ---- 完整性報告：對照標準 Strong 編號全範圍 ----
    HEB_MAX, GRK_MAX = 8674, 5624
    have = set(entries)
    gapH = sorted(i for i in range(1, HEB_MAX + 1) if ("H%d" % i) not in have)
    gapG = sorted(i for i in range(1, GRK_MAX + 1) if ("G%d" % i) not in have)
    extra = sorted(c for c in have
                   if (c.startswith("H") and _num(c) > HEB_MAX)
                   or (c.startswith("G") and _num(c) > GRK_MAX))

    common.log("完整性：希伯來 %d/%d、希臘 %d/%d"
               % (HEB_MAX - len(gapH), HEB_MAX, GRK_MAX - len(gapG), GRK_MAX))
    if gapH:
        common.log("  H 缺 %d 個（前 15）：%s" % (len(gapH), gapH[:15]))
    if gapG:
        common.log("  G 缺 %d 個（前 15）：%s" % (len(gapG), gapG[:15]))
    if not gapH and not gapG:
        common.log("  ✓ 標準 Strong 編號全數收錄")
    if extra:
        common.log("  另收錄範圍外號碼 %d 個（FHL 擴充碼／字母變體）：%s"
                   % (len(extra), extra[:10]))
    if missing:
        common.log("上游查無釋義 %d 筆（前 10）：%s" % (len(missing), missing[:10]))


def _num(code):
    return int(re.sub(r"[^0-9]", "", code) or 0)


if __name__ == "__main__":
    main()
