# -*- coding: utf-8 -*-
"""Biblia 共用模組：HTTP 取得、限速、退避重試、日誌、書卷表載入。

僅使用 Python 標準庫，不依賴任何 pip 套件（符合「永久保存」目標）。
"""
import csv
import io
import json
import os
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime

# --- 路徑 ---------------------------------------------------------------
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CONFIG_DIR = os.path.join(ROOT, "config")
RAW_DIR = os.path.join(ROOT, "raw")
PARSED_DIR = os.path.join(ROOT, "parsed")
APP_DIR = os.path.join(ROOT, "app")
APP_DATA_DIR = os.path.join(APP_DIR, "data")
BOOKS_CSV = os.path.join(CONFIG_DIR, "books.csv")
MANIFEST_CSV = os.path.join(ROOT, "manifest.csv")
DOWNLOAD_LOG = os.path.join(ROOT, "download.log")
REPORT_TXT = os.path.join(ROOT, "report.txt")

# --- FHL API ------------------------------------------------------------
FHL_JSON_BASE = "https://bible.fhl.net/json"
# 實測：FHL 對預設的 Python urllib UA 回 403，必須帶瀏覽器 UA（藍圖坑 #7）
USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
)
REQUEST_INTERVAL = 1.5   # 秒，對信望愛站保持禮貌
MAX_RETRIES = 3
TIMEOUT = 45

# 本次範圍的三個公有領域版本。strong=1 只有 unv 與 kjv 支援（實測 abv.php）。
VERSIONS = [
    {"key": "zh_unv", "version": "unv", "strong": 1, "label": "和合本"},
    {"key": "en_kjv", "version": "kjv", "strong": 1, "label": "KJV"},
    {"key": "en_web", "version": "web", "strong": 0, "label": "WEB"},
]


def utf8_stdout():
    """Windows 主控台預設非 UTF-8，印中文會炸；統一轉成 UTF-8。"""
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except AttributeError:  # pragma: no cover - 舊版 Python
        pass


def now():
    return datetime.now().strftime("%Y-%m-%d %H:%M:%S")


def log(msg, logfile=None, echo=True):
    line = "[%s] %s" % (now(), msg)
    if echo:
        print(line, flush=True)
    if logfile:
        os.makedirs(os.path.dirname(logfile), exist_ok=True)
        with io.open(logfile, "a", encoding="utf-8") as fh:
            fh.write(line + "\n")


def ensure_dir(path):
    os.makedirs(path, exist_ok=True)
    return path


def safe_name(engs):
    """把 FHL 的 engs 轉成檔案系統安全的名字。

    FHL 的 engs 含空白（'1 Sam'、'3 John'），直接拿來當資料夾名會很難用。
    """
    return engs.replace(" ", "")


def http_get(url, retries=MAX_RETRIES, timeout=TIMEOUT):
    """GET 純文字內容，含指數退避重試。回傳 str。"""
    last_err = None
    for attempt in range(1, retries + 1):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
            with urllib.request.urlopen(req, timeout=timeout) as resp:
                return resp.read().decode("utf-8", errors="replace")
        except (urllib.error.URLError, urllib.error.HTTPError, OSError) as exc:
            last_err = exc
            if attempt < retries:
                backoff = REQUEST_INTERVAL * (2 ** attempt)
                time.sleep(backoff)
    raise RuntimeError("GET 失敗 %s：%s" % (url, last_err))


def fhl_chapter_url(chineses, chap, version, strong, gb=0):
    """組出 qb.php 整章查詢網址。

    省略 sec 參數即回傳整章（實測創1 → record_count 31）。
    chineses 為中文，必須 percent-encode。
    """
    params = {
        "chineses": chineses,
        "chap": str(chap),
        "version": version,
        "gb": str(gb),
    }
    if strong:
        params["strong"] = "1"
    return FHL_JSON_BASE + "/qb.php?" + urllib.parse.urlencode(params, encoding="utf-8")


def fetch_chapter(chineses, chap, version, strong, gb=0):
    """抓一章並回傳已解析的 dict。內容有問題時丟 RuntimeError。"""
    url = fhl_chapter_url(chineses, chap, version, strong, gb)
    text = http_get(url)
    try:
        data = json.loads(text)
    except ValueError as exc:
        raise RuntimeError("JSON 解析失敗 %s：%s" % (url, exc))
    if data.get("status") != "success":
        raise RuntimeError("status 非 success（%s）：%s" % (data.get("status"), url))
    if not data.get("record"):
        raise RuntimeError("record 為空：%s" % url)
    return data


def load_books():
    """讀 config/books.csv，回傳 list[dict]。"""
    if not os.path.exists(BOOKS_CSV):
        raise SystemExit("找不到 %s，請先執行 scripts/build_books.py" % BOOKS_CSV)
    books = []
    with io.open(BOOKS_CSV, "r", encoding="utf-8", newline="") as fh:
        for row in csv.DictReader(fh):
            row["book_no"] = int(row["book_no"])
            row["chapters"] = int(row["chapters"])
            books.append(row)
    return books


def write_json(path, obj):
    ensure_dir(os.path.dirname(path))
    with io.open(path, "w", encoding="utf-8", newline="\n") as fh:
        json.dump(obj, fh, ensure_ascii=False, separators=(",", ":"))


def read_json(path):
    with io.open(path, "r", encoding="utf-8") as fh:
        return json.load(fh)
