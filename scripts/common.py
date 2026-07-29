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

# 收錄的公有領域版本。
#   source="fhl"  —— 由 FHL JSON API 逐章抓取；strong=1 只有 unv 與 kjv 支援。
#   source="file" —— 由外部公有領域資料源取得（非 FHL），故不做 FHL 專屬檢查。
VERSIONS = [
    {"key": "zh_unv", "version": "unv", "strong": 1,
     "label": "和合本", "source": "fhl"},
    {"key": "en_kjv", "version": "kjv", "strong": 1,
     "label": "KJV", "source": "fhl"},
    {"key": "en_web", "version": "web", "strong": 0,
     "label": "WEB", "source": "fhl"},
    {"key": "es_rvr1909", "version": "rvr1909", "strong": 0,
     "label": "RVR1909", "source": "file"},
    {"key": "es_rvc", "version": "rvc", "strong": 0,
     "label": "RVC", "source": "file"},
    {"key": "fr_nbs", "version": "nbs", "strong": 0,
     "label": "NBS", "source": "file"},
    {"key": "ja_jp", "version": "jp", "strong": 0,
     "label": "日語", "source": "fhl"},
    {"key": "ko_kor", "version": "korean", "strong": 0,
     "label": "韓語", "source": "fhl"},
    {"key": "vi_vie", "version": "vietnamese", "strong": 0,
     "label": "越南語", "source": "fhl"},
    # 舊約希伯來文原文。FHL 的 bhs 受 Deutsche Bibelgesellschaft 版權限制，
    # 改用公有領域的 Westminster Leningrad Codex（openscriptures/morphhb）。
    # 只有舊約，且帶 Strong 號碼，可併入跨語言高亮。
    {"key": "he_wlc", "version": "wlc", "strong": 1,
     "label": "WLC", "source": "file", "otonly": True},
    # 新約希臘文原文。Westcott-Hort 1881 已逾著作權保護期；
    # 文字取自 FHL fhlwh（有重音的 Unicode），Strong 取自 byztxt 的同底本，
    # 逐詞驗證相符才掛號碼（見 scripts/fetch_gnt.py）。
    {"key": "gr_wh", "version": "wh", "strong": 1,
     "label": "WH", "source": "file", "ntonly": True},
]

FHL_VERSIONS = [v for v in VERSIONS if v["source"] == "fhl"]


def covers(version, book):
    """這個版本是否涵蓋該卷書。

    希伯來文 WLC 只有舊約，新約沒有它的檔案是正常的，不該算成缺漏。
    """
    if version.get("otonly") and book["testament"] != "OT":
        return False
    if version.get("ntonly") and book["testament"] != "NT":
        return False
    return True


def expected_chapter_count(books):
    """所有版本應有的章節檔總數（已扣除不涵蓋的約）。"""
    return sum(b["chapters"] for v in VERSIONS for b in books if covers(v, b))


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
