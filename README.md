# Biblia — 多語逐字對照聖經閱讀器

離線、可長期保存的多語逐字對照聖經閱讀器。中文（和合本）、英文（KJV / WEB）
三欄並排，中文與 KJV 兩欄都可展開 **Strong number 逐字對照**，點任一詞即可
高亮全章中所有相同 Strong 的詞 —— 中英欄位會一起亮，直接把原文對應關係視覺化。

介面沿用信望愛 [read100.html](https://springbible.fhl.net/Bible2/cgic201/read100.html)
的選擇方式（舊約 / 新約各自「書卷 → 章 → 閱讀」＋版本選擇）。

## 快速開始

資料已產生的話，**直接用瀏覽器開啟 `app/index.html` 即可**，不需要架伺服器、不需要網路。

從零開始重建：

```bash
python scripts/build_books.py         # 產生 config/books.csv（66 卷 / 1,189 章）
python scripts/fetch_fhl.py           # 下載 3,567 章（約 90 分鐘，可中斷續傳）
python scripts/parse.py               # 解析 Strong 標記，產出 parsed/ 與 app/data/
python scripts/verify.py              # 解析正確性驗證 → report.txt
python scripts/check_completeness.py  # 完整性稽核 → completeness.txt
```

只需要 Python 3（**僅用標準庫**，無任何 pip 依賴）。

## 完整性怎麼保證

`check_completeness.py` 分兩層確認本機資料與 FHL 網站一致：

**全量檢查**（3,567 章逐一檢查，不需額外請求）

- 檔案齊全、`status == success`、`record_count` 與實際筆數相符
- **截斷偵測**：FHL 每筆回應的 `next` 指向「整章之後的下一節」。若某章的
  `next` 仍落在同一卷同一章，代表這章還有經文沒抓到 —— 這讓 1,189 章
  全部都能被證明未被截斷，而不必逐章重抓。
- 每章自第 1 節起、節號嚴格遞增、內容與檔案位置相符、無非預期空白經文

**抽樣實查**：隨機重抓數十章，與本機逐字比對，證明內容與網站一致。

已知且已與網站核對過的上游特性（忠實保存，非缺漏）：

- 約翰三書 KJV 只有 14 節，和合本與 WEB 為 15 節
- WEB 約翰三書第 14 節在 FHL 本來就是空字串（併入第 15 節）
- `H8675`、`H31961`、`H19691` 各出現 1 次，是 FHL 上游資料的筆誤
- `H9001`–`H9013` 是 FHL 標示希伯來文前綴質詞的擴充碼（出現三萬餘次，正常）

## 版本與授權

本專案**只收錄公有領域版本**：

| 版本 | 語言 | 授權 | Strong |
|---|---|---|---|
| 和合本 (1919) | 中文 | 公有領域 | ✅ |
| King James Version | 英文 | 公有領域 | ✅ |
| World English Bible | 英文 | 公有領域 | — |
| Strong Number (1890) | — | 公有領域 | — |

**受著作權的譯本（RVR1960 / NIV / NVI 等）一律不整本下載或儲存** ——
整本重製受著作權譯本即使自用也構成侵權。若日後要支援，只能走「授權 API
即時取單章顯示、標註出處、不快取」的線上模式。

經文資料來源：[信望愛信仰與聖經資源中心](https://bible.fhl.net/)（FHL JSON API）。

## 目錄結構

```
config/books.csv     66 卷書卷表（代號自 FHL listall.html 取得，章數經 1,189 斷言）
scripts/             下載、解析、驗證工具
raw/                 原始 API 回應，唯一真相來源，永不覆寫
parsed/              解析後的正規 JSON，一卷一檔
app/                 離線閱讀器（純 HTML + CSS + 原生 JS，零框架）
app/data/            前端用的資料（同 parsed，包成 JS）
manifest.csv         每章的下載紀錄與 SHA1
report.txt           驗證報告
Biblia.md            原始設計藍圖
```

## 幾個實作上的關鍵決定

**為什麼資料是 `.js` 而不是 `.json`？**
用 `file://` 直接開啟網頁時，`fetch()` / `XHR` 會被 CORS 擋掉，讀不到本地
JSON。`<script src>` 不受此限。`app/data/*.js` 就是把同一份 JSON 包成
`BIBLIA.receive({...})`，讓「雙擊 index.html 就能用」成立。
`parsed/*.json` 仍保留為正規資料格式。

**Strong 標記怎麼解析？**
FHL 在經文內嵌一整族標記，實測歸納如下：

| 標記 | 意義 |
|---|---|
| `<WH0430>` / `<WG2424>` | 希伯來文 / 希臘文 Strong |
| `<WAH0853>` | 附加前綴質詞的 Strong |
| `<WTH8804>` | **字形文法解析碼，不是 Strong** |
| `<WG3588a>` | Strong 號碼可帶字母後綴 |
| `<FI>…<Fi>` | 斜體（譯者補字） |
| `<RF>…<Rf>` | 註腳 |
| `<CM>` | 分段 |
| `{…}` / `（…）` | 和合本的補字 / 譯者註 |

解析器必須把 `WT` 解析碼與 Strong 分開收（分別放進 `m` 與 `s`），否則 8804
這類文法碼會被誤當成 Strong 號碼。號碼一律正規化去前導零（`H07225` → `H7225`）。

**節對位**
三個版本都出自 FHL 的同一套版本化，節鍵天生一致，不需要節對位表。
但少數地方版本間節數確實不同（例：約翰三書 KJV 14 節、和合本與 WEB 15 節），
故以「所有版本 sec 的聯集」為準，缺的版本該節留空。

**下載禮節**
每請求間隔 1.5 秒、帶瀏覽器 UA（FHL 對預設的 Python UA 回 403）、
指數退避重試 ≤3、已存在的章直接跳過。

## 尚未納入（架構已預留）

- 西班牙文 RVR1909（公有領域，需外部來源，屆時才需要節對位層）
- 受著作權版本的線上模式（需自備 `scripture.api.bible` 金鑰）
- 簡體中文（`python scripts/fetch_fhl.py --gb 1`）
- 原文字典釋義（FHL 另有 `sd.php`）
