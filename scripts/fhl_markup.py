# -*- coding: utf-8 -*-
"""解析 FHL bible_text 的內嵌標記。

實測歸納出的標記家族（樣本涵蓋舊約希伯來文與新約希臘文）：

  <WH0430>    希伯來文 Strong（舊約）
  <WG2424>    希臘文 Strong（新約）
  <WAH0853>   附加/前綴質詞的 Strong（A = attached）
  <WTH8804>   字形文法解析碼（T = parsing），**不是 Strong**
  <WTG5719>   同上，希臘文
  <WG3588a>   Strong 號碼可帶字母後綴（a/b/c…）—— 正則不可只吃 \\d+
  <FI>..<Fi>  斜體：KJV 標示「原文所無、譯者補上」的字
  <RF>..<Rf>  註腳
  <CM>        分段標記
  {...}       和合本中標示原文有、但中文未直譯的字
  （...）      和合本譯者註（純文字，不帶 Strong）

Strong 號碼一律正規化為去前導零（H07225 → H7225），與標準 Strong 編號一致。
文法解析碼另外收在 m，避免 8804 這種碼被誤當成 Strong（藍圖坑 #4 的延伸）。
"""
import re

# 一次抓出所有角括號標記；分組讓我們能分辨 W 系列與其他控制標記。
TOKEN_RE = re.compile(
    r"<(?P<tag>"
    r"W(?P<attached>A?)(?P<parse>T?)(?P<lang>[HG])(?P<num>\d+[a-zA-Z]?)"
    r"|FI|Fi|RF|Rf|CM|CL|PF\d*|PI\d*|[^>]*"
    r")>"
)

STRONG_KEEP = re.compile(r"^\d+[a-zA-Z]?$")

# Strong 標記跟在其所修飾的詞「之後」，所以一個詞單元累積到的文字，其開頭
# 可能夾帶上一個詞留下的標點或譯者註。把這些拆成獨立的無 Strong 單元，
# 逐字對照顯示時才不會出現「（後裔…下同），耶穌」這種黏在一起的詞塊。
NOTE_RE = re.compile(r"（[^（）]*）|\([^()]*\)")
LEAD_PUNCT_RE = re.compile(r"^[\s　,.;:!?、，。；：！？）〕」』》〉…—\-–—'\"]+")


def _refine(words):
    out = []
    for unit in words:
        text = unit.get("w", "")
        head_parts = []

        while text:
            note = NOTE_RE.match(text)
            if note:
                head_parts.append(note.group(0))
                text = text[note.end():]
                continue
            lead = LEAD_PUNCT_RE.match(text)
            if lead:
                head_parts.append(lead.group(0))
                text = text[lead.end():]
                continue
            break

        # 譯者註／標點單獨成一個沒有 Strong 的單元
        for part in head_parts:
            part = part.strip()
            if part:
                out.append({"w": part})

        if text:
            unit = dict(unit)
            unit["w"] = text
            out.append(unit)
        elif unit.get("s") or unit.get("m"):
            # 整段都是標點但帶 Strong → 掛回前一個實詞，避免遺失號碼
            if out:
                if unit.get("s"):
                    out[-1].setdefault("s", []).extend(unit["s"])
                if unit.get("m"):
                    out[-1].setdefault("m", []).extend(unit["m"])
            else:
                out.append(unit)
    return out


def _norm_strong(lang, num):
    """H07225 → H7225；保留字母後綴（3588a）。"""
    digits = num.rstrip("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ")
    suffix = num[len(digits):]
    return "%s%d%s" % (lang, int(digits), suffix) if digits else lang + num


def _is_zero(num):
    digits = re.sub(r"[^0-9]", "", num)
    return digits != "" and int(digits) == 0


def _norm_parse(num):
    digits = num.rstrip("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ")
    suffix = num[len(digits):]
    return "%d%s" % (int(digits), suffix) if digits else num


def parse_verse(bible_text):
    """把一節帶標記的經文拆成乾淨經文、逐字單元、註腳、分段旗標。

    回傳 dict：
      text  : str        去除所有標記的乾淨經文（純閱讀模式用）
      words : list[dict] [{"w": 詞, "s": [Strong...], "m": [文法碼...], "i": 1}]
      notes : list[str]  註腳內容
      para  : bool       此節前是否有分段標記
    """
    if not bible_text:
        return {"text": "", "words": [], "notes": [], "para": False}

    words = []
    notes = []
    para = False
    clean_parts = []

    cur_text = []
    cur_s = []
    cur_m = []
    italic = False
    cur_italic = False
    in_note = False
    note_buf = []

    def flush():
        """把目前累積的詞單元收進 words。"""
        text = "".join(cur_text).strip()
        if not text and not cur_s and not cur_m:
            reset()
            return
        if not text and words:
            # 孤兒標記（如 {<WAH0853>} 這種原文有、譯文無的字）→ 掛回前一個詞
            if cur_s:
                words[-1].setdefault("s", []).extend(cur_s)
            if cur_m:
                words[-1].setdefault("m", []).extend(cur_m)
            reset()
            return
        unit = {"w": text}
        if cur_s:
            unit["s"] = list(cur_s)
        if cur_m:
            unit["m"] = list(cur_m)
        if cur_italic:
            unit["i"] = 1
        words.append(unit)
        reset()

    def reset():
        del cur_text[:]
        del cur_s[:]
        del cur_m[:]

    pos = 0
    for m in TOKEN_RE.finditer(bible_text):
        chunk = bible_text[pos:m.start()]
        pos = m.end()

        if chunk:
            if in_note:
                note_buf.append(chunk)
            else:
                # 純文字出現在標記之後 → 前一個詞單元結束
                if cur_s or cur_m:
                    flush()
                    cur_italic = italic
                chunk_clean = chunk.replace("{", "").replace("}", "")
                cur_text.append(chunk_clean)
                clean_parts.append(chunk_clean)
                if not cur_text or not "".join(cur_text).strip():
                    cur_italic = italic

        tag = m.group("tag")
        lang = m.group("lang")
        num = m.group("num")

        if lang and num and STRONG_KEEP.match(num):
            if in_note:
                continue
            if m.group("parse"):
                cur_m.append(_norm_parse(num))
            elif _is_zero(num):
                # <WH00> / <WG0> 是「此處無 Strong」的佔位符（全書 56 處），
                # 收進來會變成不存在的 H0/G0，直接丟掉。
                pass
            else:
                cur_s.append(_norm_strong(lang, num))
        elif tag == "RF":
            in_note = True
            note_buf = []
        elif tag == "Rf":
            in_note = False
            note = "".join(note_buf).strip()
            if note:
                notes.append(note)
            note_buf = []
        elif tag == "FI":
            if cur_s or cur_m:
                flush()
            italic = True
            if not "".join(cur_text).strip():
                cur_italic = True
        elif tag == "Fi":
            italic = False
        elif tag in ("CM", "CL") or tag.startswith("PF") or tag.startswith("PI"):
            para = True

    tail = bible_text[pos:]
    if tail:
        if in_note:
            note_buf.append(tail)
        else:
            if cur_s or cur_m:
                flush()
                cur_italic = italic
            tail_clean = tail.replace("{", "").replace("}", "")
            cur_text.append(tail_clean)
            clean_parts.append(tail_clean)
    flush()

    if in_note and note_buf:
        note = "".join(note_buf).strip()
        if note:
            notes.append(note)

    clean = "".join(clean_parts)
    clean = re.sub(r"[ \t]+", " ", clean).strip()

    return {"text": clean, "words": _refine(words), "notes": notes, "para": para}
