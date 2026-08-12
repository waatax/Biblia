# -*- coding: utf-8 -*-
"""抓取國際讀經會台灣總會（su101.net）「每日研經釋義」的每日讀經進度。

資料來源：https://www.su101.net/ 的 WordPress REST API。
站上每天會發三則貼文（讀經大聯盟／SUK／兒童讀經聯合國），標題長這樣：

    讀經大聯盟<br><span …>2026年8月10日 (週一) <br>撒迦利亞書 5:1-11</span>

我們只取「讀經大聯盟」那一則，它是中文成人版的每日進度。
標題裡的日期是「讀經日」，不是貼文發佈日（貼文都在前一晚 21:10 發），
所以一律以標題日期為準。

限制：站方是一天一天發佈的，未來的日期還沒有公開頁面，
因此本腳本只能拿到「到今天為止」的進度。之後再跑一次就會補上新的日子；
已存在的日子不會被改動（同一天重覆出現時取最後一則）。

未來的日子則靠 scripts/data/su101_plan_2026.tsv 補：那是官方「整季經文進度表」
PDF 的逐日轉錄（訂戶教會會把 PDF 放上網）。貼文永遠優先，季表只填還沒發佈的
日子；重疊的日子會互相比對，不一致就警告。

僅使用 Python 標準庫。輸出 app/data/plan_su101_2026.js。
"""
import datetime
import io
import json
import os
import re
import sys
import time
import urllib.error
import urllib.request

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import common  # noqa: E402

YEAR = 2026
API = "https://www.su101.net/wp-json/wp/v2/posts"
OUT_JS = os.path.join(common.APP_DATA_DIR, "plan_su101_%d.js" % YEAR)
RAW_JSON = os.path.join(common.RAW_DIR, "su101", "posts_%d.json" % YEAR)
SOURCE_URL = "https://www.su101.net/"
SEASON_TSV = os.path.join(os.path.dirname(os.path.abspath(__file__)),
                          "data", "su101_plan_%d.tsv" % YEAR)
PER_PAGE = 100
MAX_PAGES = 20

# 標題裡的日期＋經文。日期後面的星期括號偶爾會缺，所以做成選擇性。
TITLE_RE = re.compile(
    r"(?P<y>\d{4})\s*年\s*(?P<m>\d{1,2})\s*月\s*(?P<d>\d{1,2})\s*日"
    r"\s*(?:[（(](?P<wd>[^）)]*)[）)])?\s*(?P<ref>.+)$"
)

# 「馬太福音 5:20-32」／「馬太福音 19:27-20:16」／「出埃及記 1章1-7節」
REF_RE = re.compile(
    r"^(?P<book>[^\s\d]+)\s*"
    r"(?P<c1>\d+)\s*(?:章|:|：)\s*(?P<v1>\d+)"
    r"(?:\s*[-–~]\s*(?:(?P<c2>\d+)\s*(?:章|:|：)\s*)?(?P<v2>\d+))?\s*節?\s*$"
)


def http_json(url):
    """GET 並解析 JSON，沿用 common 的 UA 與退避策略。"""
    last_err = None
    for attempt in range(1, common.MAX_RETRIES + 1):
        try:
            req = urllib.request.Request(
                url, headers={"User-Agent": common.USER_AGENT})
            with urllib.request.urlopen(req, timeout=common.TIMEOUT) as resp:
                return json.loads(resp.read().decode("utf-8"))
        except (urllib.error.URLError, urllib.error.HTTPError,
                OSError, ValueError) as exc:
            last_err = exc
            if attempt < common.MAX_RETRIES:
                time.sleep(1.5 * (2 ** attempt))
    raise RuntimeError("GET 失敗 %s：%s" % (url, last_err))


def fetch_posts():
    """把 YEAR 這一年的貼文全部翻頁抓下來。

    貼文都在讀經日的「前一晚」發佈，所以 after 要往前跨到前一年年底，
    否則 1/1 的進度會被濾掉。
    """
    posts = []
    for page in range(1, MAX_PAGES + 1):
        url = ("%s?after=%d-12-30T00%%3A00%%3A00&before=%d-01-01T00%%3A00%%3A00"
               "&per_page=%d&orderby=date&order=asc&page=%d"
               "&_fields=id,date,title,link"
               % (API, YEAR - 1, YEAR + 1, PER_PAGE, page))
        batch = http_json(url)
        if not batch:
            break
        posts.extend(batch)
        common.log("su101 第 %d 頁：%d 則" % (page, len(batch)))
        if len(batch) < PER_PAGE:
            break
        time.sleep(0.4)
    return posts


def plain_title(rendered):
    """把標題的 HTML 標籤換成空白、還原常見 entity。"""
    text = re.sub(r"<[^>]+>", " ", rendered)
    for src, dst in (("&#8211;", "-"), ("&#8212;", "-"), ("&#038;", "&"),
                     ("&amp;", "&"), ("&nbsp;", " "), ("&#8230;", "…")):
        text = text.replace(src, dst)
    return re.sub(r"\s+", " ", text).strip()


def parse_ref(ref, by_name):
    """把「馬太福音 19:27-20:16」解析成可跳轉的段落資訊。"""
    m = REF_RE.match(ref.strip())
    if not m:
        return None
    book = by_name.get(m.group("book"))
    if not book:
        return None

    c1 = int(m.group("c1"))
    v1 = int(m.group("v1"))
    c2 = int(m.group("c2")) if m.group("c2") else c1
    v2 = int(m.group("v2")) if m.group("v2") else v1

    if c1 == c2:
        label = "%s %d:%d-%d" % (book["chineses"], c1, v1, v2)
        full = "%s %d章%d-%d節" % (book["name_zh"], c1, v1, v2)
    else:
        label = "%s %d:%d-%d:%d" % (book["chineses"], c1, v1, c2, v2)
        full = "%s %d章%d節-%d章%d節" % (book["name_zh"], c1, v1, c2, v2)

    return {
        "abbr": book["chineses"],
        "bookNo": book["book_no"],
        "bookZh": book["name_zh"],
        "startChap": c1,
        "startVerse": v1,
        "endChap": c2,
        "endVerse": v2,
        "label": label,
        "fullLabel": full,
    }


def book_index(books):
    by_name = {}
    for b in books:
        by_name[b["name_zh"]] = b
        by_name[b["chineses"]] = b
    return by_name


def make_item(day, ref, passage, link, src):
    return {
        "id": "su%s" % day.isoformat(),
        "isoDate": day.isoformat(),
        "date": "%d/%d" % (day.month, day.day),
        "month": day.month,
        "day": day.day,
        "week": day.isocalendar()[1],
        "wd": "週%s" % "一二三四五六日"[day.weekday()],
        "rawText": ref,
        "passages": [passage],
        "link": link,
        "src": src,
    }


def load_season_table(by_name):
    """讀官方季表轉錄檔。回傳 {date: item}（src="plan"）。

    檔案不存在就當成沒有 —— 只靠貼文也還是能產出，只是補不到未來。
    """
    if not os.path.exists(SEASON_TSV):
        common.log("找不到季表 %s，只用貼文。" % SEASON_TSV)
        return {}, []

    by_date = {}
    bad = []
    source = ""
    with io.open(SEASON_TSV, "r", encoding="utf-8") as fh:
        for lineno, line in enumerate(fh, 1):
            line = line.rstrip("\n")
            if line.startswith("#"):
                m = re.search(r"@source\s+\S+\s+(\S+)", line)
                if m:
                    source = m.group(1)
                continue
            if not line.strip():
                continue

            parts = [p.strip() for p in line.split("\t") if p.strip()]
            if len(parts) < 2:
                bad.append("第 %d 行：欄位不足 —— %s" % (lineno, line))
                continue

            try:
                day = datetime.date.fromisoformat(parts[0])
            except ValueError:
                bad.append("第 %d 行：日期無法解析 —— %s" % (lineno, parts[0]))
                continue
            if day.year != YEAR:
                bad.append("第 %d 行：不是 %d 年 —— %s" % (lineno, YEAR, parts[0]))
                continue

            passage = parse_ref(parts[1], by_name)
            if not passage:
                bad.append("第 %d 行：經文無法解析 —— %s" % (lineno, parts[1]))
                continue

            by_date[day] = make_item(day, parts[1], passage, source, "plan")
    return by_date, bad


def merge_season(by_date, season):
    """貼文優先；季表只補還沒發佈的日子。重疊的日子拿來對帳。"""
    added = 0
    mismatch = []
    for day, item in sorted(season.items()):
        post = by_date.get(day)
        if post is None:
            by_date[day] = item
            added += 1
            continue
        a, b = post["passages"][0], item["passages"][0]
        keys = ("bookNo", "startChap", "startVerse", "endChap", "endVerse")
        if [a[k] for k in keys] != [b[k] for k in keys]:
            mismatch.append("%s 貼文 %s ≠ 季表 %s"
                            % (day.isoformat(), a["label"], b["label"]))
    return added, mismatch


def build_items(posts, by_name):
    by_date = {}
    unparsed = []
    for post in posts:
        title = plain_title(post.get("title", {}).get("rendered", ""))
        if not title.startswith("讀經大聯盟"):
            continue
        m = TITLE_RE.search(title)
        if not m or int(m.group("y")) != YEAR:
            unparsed.append(title)
            continue

        ref = m.group("ref").strip()
        passage = parse_ref(ref, by_name)
        if not passage:
            unparsed.append(title)
            continue

        day = datetime.date(YEAR, int(m.group("m")), int(m.group("d")))
        item = make_item(day, ref, passage, post.get("link", ""), "post")
        item["wd"] = (m.group("wd") or "").strip() or item["wd"]
        by_date[day] = item

    return by_date, unparsed


def js_literal(meta, items):
    """輸出成「表頭好讀、每天一行」的 JS 物件實字。

    每天一行是刻意的：這個檔會反覆重跑補新日子，一天一行才能在 git diff
    看出「只多了幾天」，而不是整檔重排。
    """
    head = json.dumps(meta, ensure_ascii=False, indent=2).rstrip()
    assert head.endswith("}")
    head = head[:-1].rstrip().rstrip(",")     # 去掉結尾的 }，等等自己補
    rows = ",\n".join(
        "    " + json.dumps(it, ensure_ascii=False, separators=(",", ":"))
        for it in items)
    return '%s,\n  "items": [\n%s\n  ]\n}' % (head, rows)


def write_js(items):
    if not items:
        raise SystemExit("沒有解析到任何進度，未寫檔。")

    first, last = items[0], items[-1]
    months = sorted({it["month"] for it in items})
    weeks = sorted({it["week"] for it in items})
    post_days = sum(1 for it in items if it["src"] == "post")
    plan_days = len(items) - post_days

    meta = {
        "id": "su101_%d" % YEAR,
        "title": "每日研經釋義 %d 年讀經進度" % YEAR,
        "shortTitle": "每日研經釋義",
        "subtitle": "%s ~ %s ・ 共 %d 天" % (first["date"], last["date"], len(items)),
        "org": "國際讀經會台灣總會",
        "sourceUrl": SOURCE_URL,
        "year": YEAR,
        "months": months,
        "weeks": weeks,
        "coverage": "%s ~ %s" % (first["isoDate"], last["isoDate"]),
        "postDays": post_days,
        "planDays": plan_days,
        "coverageNote": (
            "其中 %d 天來自站方每日貼文，%d 天來自官方整季經文進度表；"
            "站方逐日發佈，重跑 scripts/fetch_su101_plan.py 可補上新進度。"
            % (post_days, plan_days)),
        "fetchedAt": datetime.date.today().isoformat(),
    }

    header = (
        "/* Biblia — 每日研經釋義 %d 年讀經進度（國際讀經會台灣總會 su101.net）\n"
        " *\n"
        " * 由 scripts/fetch_su101_plan.py 產生，請勿手動編輯。\n"
        " * 涵蓋範圍：%s（共 %d 天：貼文 %d 天、官方季表 %d 天）\n"
        " * 站方一天發佈一天的進度；未來日期取自 scripts/data/su101_plan_%d.tsv。\n"
        " * 抓取日期：%s\n"
        " */\n" % (YEAR, meta["coverage"], len(items), meta["postDays"],
                  meta["planDays"], YEAR, meta["fetchedAt"])
    )

    common.ensure_dir(os.path.dirname(OUT_JS))
    with io.open(OUT_JS, "w", encoding="utf-8", newline="\n") as fh:
        fh.write(header)
        fh.write("window.BIBLIA_PLAN_SU101_%d = " % YEAR)
        fh.write(js_literal(meta, items))
        fh.write(";\n")
    return meta


def main():
    common.utf8_stdout()
    books = common.load_books()

    posts = fetch_posts()
    common.ensure_dir(os.path.dirname(RAW_JSON))
    with io.open(RAW_JSON, "w", encoding="utf-8", newline="\n") as fh:
        json.dump(posts, fh, ensure_ascii=False, indent=1)
    common.log("原始貼文 %d 則 → %s" % (len(posts), RAW_JSON))

    by_name = book_index(books)
    by_date, unparsed = build_items(posts, by_name)
    common.log("貼文解析出 %d 天。" % len(by_date))

    season, bad_rows = load_season_table(by_name)
    if season:
        added, mismatch = merge_season(by_date, season)
        common.log("季表 %d 天，補上未發佈的 %d 天。" % (len(season), added))
        if mismatch:
            common.log("注意：貼文與季表不一致 %d 處（以貼文為準）：" % len(mismatch))
            for line in mismatch[:10]:
                common.log("  " + line)
        else:
            common.log("貼文與季表重疊部分完全一致。")
    if bad_rows:
        common.log("季表有 %d 行讀不進來：" % len(bad_rows))
        for line in bad_rows[:10]:
            common.log("  " + line)

    items = [by_date[d] for d in sorted(by_date)]
    meta = write_js(items)

    common.log("寫出 %d 天進度 → %s" % (len(items), OUT_JS))
    common.log("涵蓋 %s" % meta["coverage"])

    # 日期是否連續 —— 不連續代表站方漏發或標題格式改了，要讓人看得到。
    days = [datetime.date.fromisoformat(it["isoDate"]) for it in items]
    gaps = [(days[i], days[i + 1]) for i in range(len(days) - 1)
            if (days[i + 1] - days[i]).days != 1]
    if gaps:
        common.log("注意：日期不連續 %d 處 → %s" %
                   (len(gaps), ", ".join("%s→%s" % g for g in gaps[:10])))
    else:
        common.log("日期連續，無缺日。")

    if unparsed:
        common.log("未能解析的標題 %d 則（多半是活動公告，非進度）：" % len(unparsed))
        for t in unparsed[:10]:
            common.log("  " + t)


if __name__ == "__main__":
    main()
