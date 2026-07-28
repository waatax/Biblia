# Biblia — 多語逐字對照聖經閱讀器

離線、可長期保存的多語逐字對照聖經閱讀器。**希伯來文原文（WLC，舊約）**、
中文（和合本）、西班牙文（RVR1909）、英文（KJV / WEB）並排，
原文、和合本、KJV 三欄都可展開 **Strong number 逐字對照**。

點任一詞即可高亮全章中所有相同 Strong 的詞 —— 例如在創世記點「神」，
希伯來文的 `אֱלֹהִים`、和合本的「神」、KJV 的 `God` 會**同時亮起**（各 32 處），
直接把原文對應關係視覺化。點擊還會顯示該 Strong 的原文字與詳細釋義，
並可一鍵搜尋全書出現該號碼的所有經節。

介面沿用信望愛 [read100.html](https://springbible.fhl.net/Bible2/cgic201/read100.html)
的選擇方式（舊約 / 新約各自「書卷 → 章 → 閱讀」＋版本選擇）。

## 快速開始

資料已產生的話，**直接用瀏覽器開啟 `app/index.html` 即可**，不需要架伺服器、不需要網路。

從零開始重建：

```bash
python scripts/build_books.py         # 產生 config/books.csv（66 卷 / 1,189 章）
python scripts/fetch_fhl.py           # 中／英三版共 3,567 章（約 90 分鐘，可中斷續傳）
python scripts/fetch_rvr1909.py       # 西班牙文 RVR1909（單檔下載，數秒）
python scripts/fetch_wlc.py           # 舊約希伯來文原文 WLC（含節對位，數十秒）
python scripts/parse.py               # 解析 Strong 標記，產出 parsed/ 與 app/data/
python scripts/verify.py              # 解析正確性驗證 → report.txt
python scripts/check_completeness.py  # 完整性稽核 → completeness.txt

python scripts/fetch_strong_dict.py   # Strong 原文字典釋義（14,279 筆，約 4 小時）
python scripts/build_strong_dict.py   # → app/data/strong_dict_H.js / _G.js
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

RVR1909 不經由 FHL（FHL 89 個版本中沒有西班牙文），改為與原始下載檔
`raw/es_rvr1909/_source/SpaRV.json` 做**全量**逐字比對，1,189 章、31,102 節全數相符。

已知且已核對過的上游特性（忠實保存，非缺漏）：

- 約翰三書 KJV 與 RVR1909 為 14 節，和合本與 WEB 為 15 節
- WEB 有 7 節保留節號但無內文（Acts 8:37、Acts 15:34 等），
  是現代校勘本略去的節
- `H8675`、`H31961`、`H19691` 各出現 1 次，是 FHL 上游資料的筆誤
- `H9001`–`H9013` 是 FHL 標示希伯來文前綴質詞的擴充碼（出現三萬餘次，正常）

### RVR1909 的分章差異（重要）

RVR1909 在 18 處依**希伯來文分章**，與英文分章不同（民 12/13、伯 38/39、
伯 40/41、撒上 23/24、拿 1/2 等）。這些地方的處理方式是：跨章的經文併入
前一章末節，章尾以空節補齊英文章長。

實際影響：**經文一字未少**（已逐字核對，例如伯 39:30 是一節 575 字元的合併節，
內含 KJV 伯 39:27–30 與 40:1–5），但在這 18 章（佔 1,189 章的 1.5%）
西班牙文欄位會與其他欄位相差 1–5 節。

這是 RVR1909 譯本本身的分章方式，不是資料來源的缺陷 —— 任何忠實的 RVR1909
都會如此，換用 eBible.org 的 USFM 也一樣。由於合併是「多節併一節」，
要重新對位就得切分譯文，那已超出資料處理的範圍，因此選擇**忠實保留並明確標示**：
閱讀器在這些節會顯示「（此版本本節無內文）」並附說明，不會被誤認為資料缺漏。

## 版本與授權

本專案**只收錄公有領域版本**：

| 版本 | 語言 | 授權 | Strong | 來源 |
|---|---|---|---|---|
| **WLC 原文**（僅舊約） | 希伯來文 | 公有領域 | ✅ | openscriptures/morphhb |
| 和合本 (1919) | 中文 | 公有領域 | ✅ | FHL API |
| Reina-Valera 1909 | 西班牙文 | 公有領域 | — | scrollmapper/bible_databases |
| King James Version | 英文 | 公有領域 | ✅ | FHL API |
| World English Bible | 英文 | 公有領域 | — | FHL API |
| Strong Number (1890) | — | 公有領域 | — | FHL API |

### 舊約希伯來文原文（WLC）

信望愛站的「舊約馬索拉原文」為 **Biblia Hebraica Stuttgartensia**，著作權屬
Deutsche Bibelgesellschaft、1967/77 版需授權，依本專案「只收公有領域」的立場
不能整本保存。因此改用公有領域的替代方案：

**Westminster Leningrad Codex**，取自
[openscriptures/morphhb](https://github.com/openscriptures/morphhb)（Open Scriptures Hebrew Bible）

- **WLC 本文：公有領域**
- **詞形與 lemma 資料：CC BY 4.0** —— 需標示出處，本專案已於 README 與介面頁尾標明

**節對位**：WLC 採希伯來文版本化（詩篇標題自成一節、珥、瑪等分章不同），
與本專案其餘版本所用的 KJV 版本化有 1,973 處差異。所幸該倉庫附有
`wlc/VerseMap.xml`，權威地列出 WLC ↔ KJV 的對應，因此不需自行推導。

其中 7 筆為「跨節分割」，需分三種情況處理，一律套用反而會整節搬錯位置：

1. WLC 端為整節（如 `1Kgs.22.44 → 1Kgs.22.43!b`）→ 套用
2. WLC 一節拆成 KJV 兩節（如 `Ps.13.6!a`／`!b`）→ 取較前的節號，符合閱讀順序
3. WLC 端只有開頭一小段屬前一節（如 `1Kgs.18.34!a → 1Kgs.18.33!b`）→ **不套用**，
   主體仍留在原節號

處理後，929 章中僅 3 節無希伯來文對應，且各有明確原因：

| 節 | 原因 |
|---|---|
| 尼希米記 7:68 | 希伯來文傳統本無此節（真實文本差異） |
| 詩篇 13:6 | WLC 13:6 橫跨 KJV 13:5–6，經文置於 13:5 |
| 以賽亞書 64:1 | 即希伯來文 63:19 後半，保留在 63:19 未搬動 |

**經文一字未少** —— 稽核會重新解析 39 個 OSIS XML 並與逐章檔逐字比對（23,142 節全數相符）。

### Strong 原文字典

點擊逐字對照中的任一詞，除了高亮全章同號碼之外，還會顯示：

- 原文字（如 `רֵאשִׁית`、`ἀγάπη`）
- 中文詳細釋義（字源、詞性、欽定本譯法統計、分項字義），可切換英文釋義
- 「🔍 搜尋全書此號碼」—— 一鍵跳到搜尋，列出全本出現該 Strong 的所有經節

字典依語言切成 `strong_dict_H.js` / `strong_dict_G.js` 兩份，
且是**點到 Strong 號碼才延遲載入**，不影響首頁開啟速度（讀舊約不會載到希臘文那份）。

**字典授權依據**（已查證 <https://www.fhl.net/main/fhl/fhl8.html>）：

- 信望愛《和合本》的 Strong's numbers 著作權為信望愛所有，採 **open source FDL**
  授權，可散布；並要求「請勿任意移除 Strong's numbers 標記」—— 本專案完整保留。
- 站上另有兩個詞典端點 `sbdag.php`（希臘文）與 `stwcbhdic.php`（希伯來文），
  明載「僅授權給信望愛站使用」（向 UBS、浸宣出版社購買的僅為網路刊載權），
  **本專案完全不使用這兩個端點**。
- 本專案採用的 `sd.php` 原文字典不在上述受限清單中；其 `edic_text` 為公有領域的
  BDB／Thayer 系精簡詞典資料。

**受著作權的譯本（RVR1960 / NIV / NVI 等）一律不整本下載或儲存** ——
整本重製受著作權譯本即使自用也構成侵權。若日後要支援，只能走「授權 API
即時取單章顯示、標註出處、不快取」的線上模式。

經文資料來源：[信望愛信仰與聖經資源中心](https://bible.fhl.net/)（FHL JSON API）。

## 目錄結構

```
config/books.csv       66 卷書卷表（代號自 FHL listall.html 取得，章數經 1,189 斷言）
scripts/               下載、解析、驗證工具
raw/                   原始 API 回應，唯一真相來源，永不覆寫
raw/strong_dict/       Strong 原文字典原始回應（14,478 筆）
raw/es_rvr1909/_source 西班牙文原始下載檔
raw/he_wlc/_source     希伯來文 OSIS XML（39 卷 + VerseMap.xml）
parsed/                解析後的正規 JSON，一卷一檔（可由 raw/ 重建，未進版控）
app/                   離線閱讀器（純 HTML + CSS + 原生 JS，零框架）
app/data/              前端資料：66 卷經文 + 搜尋索引 + Strong 字典（H／G 分檔）
manifest.csv           每章的下載紀錄與 SHA1
report.txt             解析正確性報告
completeness.txt       完整性稽核報告
Biblia.md              原始設計藍圖
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

- **新約希臘文原文**：FHL 的 `fhlwh`（Westcott-Hort 1881）已逾著作權保護期，
  可合法加入。加入後新約也會有原文欄，逐字對照即新舊約皆備。
- 受著作權版本的線上模式（需自備 `scripture.api.bible` 金鑰）
- 簡體中文（`python scripts/fetch_fhl.py --gb 1`）
- 希伯來文詞形（morph）標記：OSHB 的 `morph` 屬性已在 `raw/` 中保留，
  目前僅取用 Strong 號碼，日後可加上詞性與變化分析
