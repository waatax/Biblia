# -*- coding: utf-8 -*-
"""產生 config/books.csv。

書卷代號一律從 FHL 的 listall.html 取得，不手抄 —— 避免藍圖坑 #5
（雙字簡稱如「撒上」「林前」「約一」容易打錯）。
章數用標準新教正典章數表，並斷言總和 == 1,189（藍圖坑 #6 的定錨）。
"""
import csv
import io
import os

import common

LISTALL_URL = common.FHL_JSON_BASE + "/listall.html"

# 標準新教正典章數（舊約 929 + 新約 260 = 1,189），以 FHL 的 engs 為鍵。
CHAPTER_COUNTS = {
    "Gen": 50, "Ex": 40, "Lev": 27, "Num": 36, "Deut": 34,
    "Josh": 24, "Judg": 21, "Ruth": 4, "1 Sam": 31, "2 Sam": 24,
    "1 Kin": 22, "2 Kin": 25, "1 Chr": 29, "2 Chr": 36, "Ezra": 10,
    "Neh": 13, "Esth": 10, "Job": 42, "Ps": 150, "Prov": 31,
    "Eccl": 12, "Song": 8, "Is": 66, "Jer": 52, "Lam": 5,
    "Ezek": 48, "Dan": 12, "Hos": 14, "Joel": 3, "Amos": 9,
    "Obad": 1, "Jon": 4, "Mic": 7, "Nah": 3, "Hab": 3,
    "Zeph": 3, "Hag": 2, "Zech": 14, "Mal": 4,
    "Matt": 28, "Mark": 16, "Luke": 24, "John": 21, "Acts": 28,
    "Rom": 16, "1 Cor": 16, "2 Cor": 13, "Gal": 6, "Eph": 6,
    "Phil": 4, "Col": 4, "1 Thess": 5, "2 Thess": 3, "1 Tim": 6,
    "2 Tim": 4, "Titus": 3, "Philem": 1, "Heb": 13, "James": 5,
    "1 Pet": 5, "2 Pet": 3, "1 John": 5, "2 John": 1, "3 John": 1,
    "Jude": 1, "Rev": 22,
}

TOTAL_CHAPTERS = 1189
FIRST_NT_BOOK_NO = 40  # 馬太福音起算新約


def parse_listall(text):
    """listall.html 每列格式：no,engs,eng_full,chineses,name_zh,abbr"""
    books = []
    for line in text.replace("\r", "").split("\n"):
        line = line.strip()
        if not line:
            continue
        parts = line.split(",")
        if len(parts) < 6:
            raise SystemExit("listall.html 欄位數異常：%r" % line)
        no = int(parts[0])
        books.append({
            "book_no": no,
            "engs": parts[1],
            "name_en": parts[2],
            "chineses": parts[3],
            "name_zh": parts[4],
            "abbr": parts[5],
            "dir": common.safe_name(parts[1]),
            "testament": "NT" if no >= FIRST_NT_BOOK_NO else "OT",
        })
    return books


def main():
    common.utf8_stdout()
    common.log("抓取書卷清單 %s" % LISTALL_URL)
    books = parse_listall(common.http_get(LISTALL_URL))

    if len(books) != 66:
        raise SystemExit("書卷數應為 66，實得 %d" % len(books))

    missing = [b["engs"] for b in books if b["engs"] not in CHAPTER_COUNTS]
    if missing:
        raise SystemExit("章數表缺少書卷：%s" % missing)

    for b in books:
        b["chapters"] = CHAPTER_COUNTS[b["engs"]]

    total = sum(b["chapters"] for b in books)
    if total != TOTAL_CHAPTERS:
        raise SystemExit("總章數應為 %d，實得 %d" % (TOTAL_CHAPTERS, total))

    ot = sum(b["chapters"] for b in books if b["testament"] == "OT")
    nt = total - ot

    common.ensure_dir(common.CONFIG_DIR)
    cols = ["book_no", "engs", "dir", "chineses", "name_zh", "name_en",
            "abbr", "testament", "chapters"]
    with io.open(common.BOOKS_CSV, "w", encoding="utf-8", newline="") as fh:
        writer = csv.DictWriter(fh, fieldnames=cols, extrasaction="ignore")
        writer.writeheader()
        writer.writerows(books)

    common.log("已寫入 %s" % common.BOOKS_CSV)
    common.log("66 卷｜舊約 %d 章 + 新約 %d 章 = %d 章 ✓" % (ot, nt, total))


if __name__ == "__main__":
    main()
