# -*- coding: utf-8 -*-
"""
Fetch all 45 reference items from su101.net and build app/data/su101_references.js
"""
from concurrent.futures import ThreadPoolExecutor, as_completed
import html
import io
import json
import os
import re
import sys
import time
import urllib.request

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

CONTENT_MD = r"C:\Users\User\.gemini\antigravity\brain\14dede90-42a3-4143-86a7-63b76524e7e9\.system_generated\steps\10\content.md"
OUT_JS = r"c:\Users\User\OneDrive\文件\Antigravity\Biblia\app\data\su101_references.js"
RAW_JSON = r"c:\Users\User\OneDrive\文件\Antigravity\Biblia\raw\su101_references.json"

with open(CONTENT_MD, "r", encoding="utf-8") as f:
    raw_html = f.read()

quarters = re.findall(r'<span class="vc_tta-title-text">(.*?)</span>.*?<div class="vc_tta-panel-body">(.*?)</div>\s*</div>\s*</div>', raw_html, re.DOTALL)

items = []
for q_title, q_body in quarters:
    quarter_name = re.sub(r'<[^>]+>', '', q_title).strip()
    links = re.findall(r'<a[^>]+href="([^"]+)"[^>]*>(.*?)</a>', q_body, re.DOTALL)
    for href, text in links:
        clean_text = html.unescape(re.sub(r'<[^>]+>', '', text).strip())
        m = re.search(r'archives/(\d+)', href)
        pid = m.group(1) if m else None
        items.append({
            'quarter': quarter_name,
            'title': clean_text,
            'url': href,
            'post_id': pid
        })

print(f"Total reference items parsed: {len(items)}")

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}

def fetch_one(item):
    pid = item['post_id']
    title = item['title']
    quarter = item['quarter']
    url = item['url']
    
    post_detail = None
    if pid:
        for endpoint in ["posts", "pages"]:
            api_url = f"https://www.su101.net/wp-json/wp/v2/{endpoint}/{pid}"
            req = urllib.request.Request(api_url, headers=headers)
            try:
                with urllib.request.urlopen(req, timeout=12) as resp:
                    post_detail = json.loads(resp.read().decode('utf-8'))
                    break
            except Exception as e:
                pass

    rendered_content = ""
    post_title = title
    date = ""
    if post_detail:
        rendered_content = post_detail.get('content', {}).get('rendered', '')
        post_title = html.unescape(post_detail.get('title', {}).get('rendered', ''))
        date = post_detail.get('date', '')
    else:
        try:
            req = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(req, timeout=12) as resp:
                page_html = resp.read().decode('utf-8')
                m_content = re.search(r'<div[^>]*class="[^"]*entry-content[^"]*"[^>]*>(.*?)</div>\s*<footer', page_html, re.DOTALL)
                if m_content:
                    rendered_content = m_content.group(1)
        except Exception as e:
            print(f"Failed to fetch {url}: {e}")

    return {
        'id': pid,
        'quarter': quarter,
        'title': title,
        'post_title': post_title,
        'url': url,
        'date': date,
        'content_html': rendered_content
    }

fetched_data = []
print("Fetching 45 articles using ThreadPoolExecutor...")
with ThreadPoolExecutor(max_workers=8) as executor:
    futures = [executor.submit(fetch_one, item) for item in items]
    for future in as_completed(futures):
        res = future.result()
        fetched_data.append(res)
        print(f"  Done: [{res['quarter']}] {res['title']} ({len(res['content_html'])} bytes)")

# Sort by original quarter order
quarter_order = {q_title.strip(): i for i, (q_title, _) in enumerate(quarters)}
fetched_data.sort(key=lambda x: (quarter_order.get(x['quarter'], 99), x['title']))

os.makedirs(os.path.dirname(RAW_JSON), exist_ok=True)
with open(RAW_JSON, "w", encoding="utf-8") as f:
    json.dump(fetched_data, f, ensure_ascii=False, indent=2)

print(f"Saved raw JSON to {RAW_JSON}")

# Write JS file for front-end consumption
js_content = "window.BIBLIA_SU101_REFERENCES = " + json.dumps(fetched_data, ensure_ascii=False, indent=2) + ";\n"
with open(OUT_JS, "w", encoding="utf-8") as f:
    f.write(js_content)

print(f"Saved JS file to {OUT_JS}")
