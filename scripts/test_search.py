# -*- coding: utf-8 -*-
"""搜尋引擎與索引功能自動化測試腳本。"""
import json
import os
import sys

import common


def main():
    common.utf8_stdout()
    index_js = os.path.join(common.APP_DATA_DIR, "search_index.js")

    if not os.path.exists(index_js):
        raise SystemExit("找不到 search_index.js，請先執行 scripts/build_search_index.py")

    with open(index_js, "r", encoding="utf-8") as fh:
        content = fh.read()

    # 提取 JSON 內容
    prefix = "BIBLIA.searchIndex("
    suffix = ");"
    if not (content.startswith(prefix) and content.endswith(suffix + "\n") or content.endswith(suffix)):
        raise SystemExit("search_index.js 格式不正確")

    json_str = content[len(prefix):content.rfind(suffix)]
    data = json.loads(json_str)

    strong_map = data.get("strong", {})
    meta = data.get("meta", {})

    print("[PASS] 搜尋索引載入正常 (共 %d 個 Strong 號碼)" % len(strong_map))

    # 測試關鍵 Strong 號碼
    test_cases = [
        ("H7225", [1, 1, 1], "創世記 1:1 起初"),
        ("H0430", [1, 1, 1], "創世記 1:1 神 (簡化後 H430)"),
        ("G2424", [40, 1, 1], "馬太福音 1:1 耶穌"),
    ]

    for code, expected_ref, desc in test_cases:
        norm_code = code.replace("H0", "H").replace("G0", "G")
        hits = strong_map.get(norm_code) or strong_map.get(code)
        if not hits:
            print("[FAIL] 找不到 Strong 號碼 %s (%s)" % (code, desc))
            sys.exit(1)
        
        found = any(h[0] == expected_ref[0] and h[1] == expected_ref[1] and h[2] == expected_ref[2] for h in hits)
        if found:
            print("[PASS] Strong 號碼 %s 精準命中 %s (共有 %d 處經文)" % (norm_code, desc, len(hits)))
        else:
            print("[FAIL] Strong 號碼 %s 未命中預期經文 %s" % (norm_code, expected_ref))
            sys.exit(1)

    print("\n[SUCCESS] 搜尋索引自動化驗證全數通過！")


if __name__ == "__main__":
    main()
