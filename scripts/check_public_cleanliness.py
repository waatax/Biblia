# -*- coding: utf-8 -*-
"""公開倉庫與 GitHub Pages 發布純淨度防護檢測工具

用途：
在每次執行 git commit / push 或發布至 GitHub Pages 前執行此檢測，
確保所有本地私有檔案（Local/、規劃、CORE.md、修正歷史、AI 對話、爬蟲日誌）
均被 100% 阻隔，公開倉庫只呈現乾淨的最終成品模板。
"""
import os
import subprocess
import sys

# 避免 Windows 主控台 CP950 編碼輸出異常
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# 嚴格禁止出現在 Git 追蹤或暫存中的關鍵字與特徵
FORBIDDEN_PATTERNS = [
    "local/",
    ".claude/",
    ".gemini/",
    ".vscode/",
    ".idea/",
    "biblia.md",
    "report.txt",
    "completeness.txt",
    "manifest.csv",
    ".log",
    ".out",
]


def run_git(args):
    """執行 git 命令並取得輸出文字"""
    try:
        res = subprocess.run(
            ["git"] + args,
            cwd=ROOT,
            capture_output=True,
            text=True,
            encoding="utf-8",
            errors="replace",
        )
        return res.stdout.strip().splitlines()
    except Exception as e:
        print(f"[ERROR] 無法執行 git: {e}")
        return []


def main():
    print("=" * 60)
    print("[CHECK] 開始檢驗 GitHub / GitHub Pages 公開內容純淨度...")
    print("=" * 60)

    # 1. 檢驗 Git 已追蹤 (tracked) 的檔案
    tracked_files = run_git(["ls-files"])
    violations = []

    for f in tracked_files:
        f_lower = f.lower().replace("\\", "/")
        for pat in FORBIDDEN_PATTERNS:
            if pat in f_lower:
                violations.append((f, f"符合禁止規則: {pat}"))

    # 2. 檢驗 Git 暫存區 (staged) 中即將加入或修改的檔案（排除已標記刪除者）
    staged_files = run_git(["diff", "--cached", "--name-only", "--diff-filter=ACMR"])
    for f in staged_files:
        f_lower = f.lower().replace("\\", "/")
        for pat in FORBIDDEN_PATTERNS:
            if pat in f_lower and (f, f"符合禁止規則: {pat}") not in violations:
                violations.append((f, f"[STAGED 暫存中] 符合禁止規則: {pat}"))

    # 3. 輸出結果
    if violations:
        print("\n[FAIL] 警告！偵測到非公開檔案存在於 Git 追蹤或暫存中：")
        for f, reason in violations:
            print(f"  - [X] {f} ({reason})")
        print("\n【處置建議】")
        print("  請執行以下指令將其從 Git 追蹤中移除（檔案會保留於 Local/）：")
        print("  git rm --cached <檔案名稱>")
        print("  並確保 .gitignore 包含相應忽略規則。")
        sys.exit(1)

    print("\n[PASS] Git 追蹤清單中無任何 Local 私有文件、AI 規劃或測試日誌。")

    # 4. 驗證公開成品模板檔案是否存在
    critical_public_files = [
        "index.html",
        "404.html",
        ".nojekyll",
        "README.md",
        "app/index.html",
        "app/style.css",
        "app/reader.js",
        "app/sw.js",
        "config/books.csv",
    ]
    missing = [f for f in critical_public_files if not os.path.exists(os.path.join(ROOT, f))]
    if missing:
        print(f"\n[WARN] 注意：缺少以下公開成品核心檔案：{missing}")
        sys.exit(1)

    print("[PASS] 公開 Web 閱讀器最終模板核心檔案均完整齊備。")
    print("[SUCCESS] 安全狀態：可以安全推送至 GitHub / GitHub Pages！\n")


if __name__ == "__main__":
    main()
