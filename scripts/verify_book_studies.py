# -*- coding: utf-8 -*-
"""
Verification script to test the complete 66 books and surveys system:
- Check data integrity of compiled JS files
- Verify schema completeness
- Verify file references
"""

import json
import os
import re
import sys

# Ensure UTF-8 output on Windows console
if sys.platform == "win32":
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

APP_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "app"))
DATA_DIR = os.path.join(APP_DIR, "data")

def extract_json_from_js(js_path, var_name):
    with open(js_path, "r", encoding="utf-8") as f:
        content = f.read()
    pattern = rf"{var_name}\s*=\s*({{[\s\S]+?}});\s*\n"
    m = re.search(pattern, content)
    if not m:
        raise ValueError(f"Could not find JSON payload for {var_name} in {js_path}")
    return json.loads(m.group(1))

def test_surveys():
    print("Testing Bible Surveys...")
    surveys_path = os.path.join(DATA_DIR, "bible_surveys.js")
    data = extract_json_from_js(surveys_path, r"window\.BIBLIA_BIBLE_SURVEYS")
    assert "ot_survey" in data, "ot_survey missing in bible_surveys.js"
    assert "nt_survey" in data, "nt_survey missing in bible_surveys.js"
    
    for s_key in ["ot_survey", "nt_survey"]:
        s = data[s_key]
        assert s["title"], f"{s_key} missing title"
        assert s["subtitle"], f"{s_key} missing subtitle"
        assert len(s["sections"]) >= 7, f"{s_key} has too few sections ({len(s['sections'])})"
        print(f"  [OK] {s['title']} verified with {len(s['sections'])} in-depth sections.")

def test_books():
    print("Testing 66 Book Studies...")
    ot_path = os.path.join(DATA_DIR, "book_studies_ot.js")
    nt_path = os.path.join(DATA_DIR, "book_studies_nt.js")

    ot_data = extract_json_from_js(ot_path, r"window\.BIBLIA_BOOK_STUDIES_OT")
    nt_data = extract_json_from_js(nt_path, r"window\.BIBLIA_BOOK_STUDIES_NT")

    assert len(ot_data) == 39, f"Expected 39 OT books, got {len(ot_data)}"
    assert len(nt_data) == 27, f"Expected 27 NT books, got {len(nt_data)}"

    all_books = {}
    for k, v in ot_data.items():
        all_books[int(k)] = v
    for k, v in nt_data.items():
        all_books[int(k)] = v

    assert len(all_books) == 66, f"Expected 66 books total, got {len(all_books)}"

    for book_no in range(1, 67):
        assert book_no in all_books, f"Book #{book_no} is missing!"
        b = all_books[book_no]
        m = b["meta"]
        assert m["bookNo"] == book_no
        assert m["nameZh"]
        assert m["nameEn"]
        assert m["originalTitle"]
        assert m["theme"]
        assert len(m["keyVerses"]) >= 1

        h = b["historicalContext"]
        assert h["summary"]
        assert h["geopolitical"]
        assert h["archaeology"]
        assert h["canonicalContext"]

        a = b["authorshipDebate"]
        assert a["traditionalView"]
        assert a["criticalTheories"]
        assert a["evangelicalRebuttal"]

        t = b["theologyAndChrist"]
        assert t["covenantLocation"]
        assert len(t["majorThemes"]) >= 2
        assert t["christology"]

        l = b["literaryStructure"]
        assert l["genre"]
        assert l["structureHighlights"]
        assert len(l["outline"]) >= 2

        assert len(b["keyWordsOriginal"]) >= 1
        assert len(b["interpretiveIssues"]) >= 1
        assert len(b["pastoralApplications"]) >= 1
        assert len(b["bibliography"]) >= 1

        print(f"  [OK] Book #{book_no:02d} [{m['testament']}] {m['nameZh']} ({m['nameEn']}) - 10 Dimensions Fully Verified.")

def test_html_files():
    print("Testing HTML integration...")
    index_path = os.path.join(APP_DIR, "index.html")
    guide_path = os.path.join(APP_DIR, "book_guide.html")
    
    with open(index_path, "r", encoding="utf-8") as f:
        index_content = f.read()
    assert "bible_surveys.js" in index_content
    assert "book_studies_ot.js" in index_content
    assert "book_studies_nt.js" in index_content
    assert "book_guide_renderer.js" in index_content
    assert "refPanelBookStudy" in index_content
    assert "refPanelOtSurvey" in index_content
    assert "refPanelNtSurvey" in index_content
    print("  [OK] index.html has all script references and tab panels.")

    with open(guide_path, "r", encoding="utf-8") as f:
        guide_content = f.read()
    assert "bible_surveys.js" in guide_content
    assert "book_studies_ot.js" in guide_content
    assert "book_studies_nt.js" in guide_content
    assert "book_guide_renderer.js" in guide_content
    assert "bookPickerSelect" in guide_content
    print("  [OK] book_guide.html has all required scripts and picker.")

def main():
    print("==================================================")
    print("      BIBLIA 66 BOOKS & SURVEYS TEST SUITE        ")
    print("==================================================")
    test_surveys()
    test_books()
    test_html_files()
    print("==================================================")
    print("      ALL TESTS PASSED WITH 100% SUCCESS!         ")
    print("==================================================")

if __name__ == "__main__":
    main()
