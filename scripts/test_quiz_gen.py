# -*- coding: utf-8 -*-
"""Test quiz question generation for all 777 verses."""
import io
import json
import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MEM_JS_PATH = os.path.join(ROOT, "app", "data", "memory_777.js")

with io.open(MEM_JS_PATH, "r", encoding="utf-8") as fh:
    raw = fh.read()
data = json.loads(raw.split("window.BIBLIA_MEMORY_777 = ")[1].rstrip(";\n "))
verses = data["verses"]

STOP_WORDS = {
    "一個", "我們", "你們", "他們", "自己", "甚麼", "這事", "若是", "就是", "若是", "因為",
    "所以", "但是", "然而", "並且", "而且", "也是", "不是", "若是", "如此", "那時",
    "那日", "這日", "那裡", "這裡", "甚麼", "為甚麼", "怎樣", "如何", "不可", "不要",
    "不能", "不可", "可以", "雖然", "凡是", "有的", "沒有", "若是"
}

def clean_word(w):
    return re.sub(r"[，。；：！？、─…「」『』（）\s]", "", w).strip()

def extract_candidates(v):
    # Method 1: from strong string
    strong_str = v.get("strong") or ""
    cands = []
    if strong_str:
        # e.g. H3068 (耶和華), H7462 (是我的牧者)
        items = re.findall(r"\(([^)]+)\)", strong_str)
        for it in items:
            cw = clean_word(it)
            if 2 <= len(cw) <= 4 and cw in v["zh"] and cw not in STOP_WORDS:
                cands.append(cw)
    
    # Method 2: from clauses
    clauses = re.split(r"[，。；：！？、─…「」『』（）]", v["zh"])
    for cl in clauses:
        cl = clean_word(cl)
        if len(cl) >= 4:
            # take 2 to 4 chars
            for wlen in (2, 3, 4):
                for i in range(0, len(cl) - wlen + 1):
                    sub = cl[i:i+wlen]
                    if sub not in STOP_WORDS and sub not in cands:
                        cands.append(sub)
    return cands

# Pre-index candidate words by category and word length
by_cat_len = {}
verse_target_map = {}

for v in verses:
    cands = extract_candidates(v)
    assert len(cands) > 0, f"No candidates for {v['ref']}: {v['zh']}"
    target = cands[0]
    verse_target_map[v["id"]] = target
    cat = v["cat"]
    wlen = len(target)
    by_cat_len.setdefault((cat, wlen), set()).add(target)
    by_cat_len.setdefault(("all", wlen), set()).add(target)

# Now verify for every verse we can get 1 answer + 3 distractors
failed = 0
for v in verses:
    target = verse_target_map[v["id"]]
    cat = v["cat"]
    wlen = len(target)
    
    pool = list(by_cat_len.get((cat, wlen), set()) - {target})
    if len(pool) < 3:
        pool += list(by_cat_len.get(("all", wlen), set()) - {target} - set(pool))
    
    if len(pool) < 3:
        # Fallback to any length 2-3 words
        pool += list(by_cat_len.get(("all", 2), set()) - {target} - set(pool))
        pool += list(by_cat_len.get(("all", 3), set()) - {target} - set(pool))
    
    if len(pool) < 3:
        print(f"Failed for verse {v['id']} ({v['ref']}): target='{target}', pool_len={len(pool)}")
        failed += 1

print(f"All 777 verses checked! Failed: {failed}")
assert failed == 0, "Some verses failed to generate 3 distractors"
print("SUCCESS: 100% of 777 verses can generate 4 distinct high-quality choices!")
