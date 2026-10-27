# -*- coding: utf-8 -*-
"""Verification suite for Biblia 777 Scripture Memorization System."""
import io
import json
import os
import re
import sys

try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MEM_JS_PATH = os.path.join(ROOT, "app", "data", "memory_777.js")
MEM_HTML_PATH = os.path.join(ROOT, "app", "memory.html")
MEM_ENGINE_PATH = os.path.join(ROOT, "app", "memory.js")
SW_PATH = os.path.join(ROOT, "app", "sw.js")
INDEX_HTML_PATH = os.path.join(ROOT, "app", "index.html")

def main():
    assert os.path.exists(MEM_JS_PATH), "Missing app/data/memory_777.js"
    assert os.path.exists(MEM_HTML_PATH), "Missing app/memory.html"
    assert os.path.exists(MEM_ENGINE_PATH), "Missing app/memory.js"

    with io.open(MEM_JS_PATH, "r", encoding="utf-8") as fh:
        raw = fh.read()
    m = re.search(r"window\.BIBLIA_MEMORY_777\s*=\s*(\{.*\})\s*;\s*$", raw, re.S)
    assert m, "Invalid format in memory_777.js"
    data = json.loads(m.group(1))

    cats = data["categories"]
    verses = data["verses"]
    assert len(cats) == 7, f"Expected 7 categories, got {len(cats)}"
    assert len(verses) == 777, f"Expected 777 verses, got {len(verses)}"

    # Verify each category has 111 verses
    by_cat = {}
    seen_refs = set()
    for v in verses:
        cid = v["cat"]
        by_cat.setdefault(cid, []).append(v)
        key = (v["bookNo"], v["chap"], v["sec"])
        assert key not in seen_refs, f"Duplicate verse found: {key}"
        seen_refs.add(key)
        assert v["zh"] and len(v["zh"]) >= 4, f"Invalid zh text in {v['ref']}"
        assert v["en"], f"Missing en text in {v['ref']}"
        assert v["orig"], f"Missing orig text in {v['ref']}"

    for c in cats:
        cnt = len(by_cat.get(c["id"], []))
        assert cnt == 111, f"Category {c['id']} has {cnt} verses, expected 111"

    # Verify all user-requested Gideon passages are present
    required_refs = [
        # 當你遇到恐懼、害怕時：詩篇 23:4, 詩篇 56:3-4, 以賽亞書 41:10, 約翰一書 4:18
        (19, 23, 4), (19, 56, 3), (19, 56, 4), (23, 41, 10), (62, 4, 18),
        # 當你感到憂慮、焦躁時：詩篇 55:22, 詩篇 94:19, 馬太福音 6:25-34, 腓立比書 4:6-7, 彼得前書 5:7
        (19, 55, 22), (19, 94, 19), (40, 6, 25), (40, 6, 33), (40, 6, 34), (50, 4, 6), (50, 4, 7), (60, 5, 7),
        # 當你覺得靈性冷淡、軟弱時：詩篇 51篇, 約翰福音 15章
        (19, 51, 1), (19, 51, 10), (19, 51, 17), (43, 15, 1), (43, 15, 5), (43, 15, 7),
        # 當你需要人生方向與指引時：箴言 3:5-6, 羅馬書 12:1-2
        (20, 3, 5), (20, 3, 6), (45, 12, 1), (45, 12, 2)
    ]
    for req in required_refs:
        assert req in seen_refs, f"Required Gideon verse missing: {req}"

    # Verify HTML IDs referenced in memory.js exist in memory.html
    with io.open(MEM_HTML_PATH, "r", encoding="utf-8") as fh:
        html_text = fh.read()
    with io.open(MEM_ENGINE_PATH, "r", encoding="utf-8") as fh:
        js_text = fh.read()

    html_ids = set(re.findall(r'id="([^"]+)"', html_text))
    js_ids = set(re.findall(r"getElementById\('([^']+)'\)", js_text))
    # Ignore dynamic toast id 'memToast' and dynamic quiz button 'memQuizNextVerseBtn'
    dynamic_ids = {"memToast", "memQuizNextVerseBtn"}
    missing_ids = (js_ids - html_ids) - dynamic_ids
    assert not missing_ids, f"IDs used in memory.js but missing in memory.html: {missing_ids}"

    print("ALL VERIFICATION CHECKS PASSED SUCCESSFULLY!")
    print(f"  - 7 Categories x 111 Verses = {len(verses)} Total Verses")
    print(f"  - All {len(required_refs)} core Gideon benchmark verses verified")
    print(f"  - All {len(js_ids - dynamic_ids)} DOM IDs between memory.html and memory.js verified")

if __name__ == "__main__":
    main()
