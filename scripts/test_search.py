# -*- coding: utf-8 -*-
"""搜尋資料自動化測試：Strong 反向索引與和合本經文分層檔。"""
import io
import json
import os
import re
import sys

import common


def read_payload(path, pattern):
    if not os.path.exists(path):
        raise SystemExit("找不到 %s，請先執行 scripts/build_layers.py" % path)
    with io.open(path, "r", encoding="utf-8") as fh:
        content = fh.read()
    m = re.match(pattern, content, re.S)
    if not m:
        raise SystemExit("%s 格式不正確" % path)
    return json.loads(m.group(1))


def decode(deltas):
    acc, out = 0, []
    for d in deltas:
        acc += d
        out.append([acc // 1000000, acc // 1000 % 1000, acc % 1000])
    return out


def main():
    common.utf8_stdout()
    strong_map = {}
    for lang in ("H", "G"):
        path = os.path.join(common.APP_DATA_DIR, "strong_index_%s.js" % lang)
        strong_map.update(read_payload(path, r'BIBLIA\.strongIndex\("%s",(.*)\);\s*$' % lang))
    print("[PASS] Strong 索引載入正常 (共 %d 個 Strong 號碼)" % len(strong_map))

    test_cases = [
        ("H7225", [1, 1, 1], "創世記 1:1 起初"),
        ("H0430", [1, 1, 1], "創世記 1:1 神 (簡化後 H430)"),
        ("G2424", [40, 1, 1], "馬太福音 1:1 耶穌"),
    ]
    for code, expected_ref, desc in test_cases:
        norm_code = code.replace("H0", "H").replace("G0", "G")
        deltas = strong_map.get(norm_code) or strong_map.get(code)
        if not deltas:
            print("[FAIL] 找不到 Strong 號碼 %s (%s)" % (code, desc))
            sys.exit(1)
        hits = decode(deltas)
        if expected_ref in hits:
            print("[PASS] Strong 號碼 %s 精準命中 %s (共有 %d 處經文)" % (norm_code, desc, len(hits)))
        else:
            print("[FAIL] Strong 號碼 %s 未命中預期經文 %s" % (norm_code, expected_ref))
            sys.exit(1)

    # 和合本關鍵字：前端全文搜尋讀的就是 text/zh_unv/NN.js
    gen = read_payload(os.path.join(common.APP_DATA_DIR, "text", "zh_unv", "01.js"),
                       r'BIBLIA\.layer\("t","zh_unv",1,(.*)\);\s*$')
    first = gen["t"][0][0]
    if "起初" in first and "創造天地" in first:
        print("[PASS] 和合本分層檔 創世記 1:1：%s" % first)
    else:
        print("[FAIL] 和合本分層檔 創世記 1:1 內容不符：%s" % first)
        sys.exit(1)

    print("\n[SUCCESS] 搜尋資料自動化驗證全數通過！")


if __name__ == "__main__":
    main()
