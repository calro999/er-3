import os
import random
import re
import time
import json
import requests

SITE = "er-3"
CACHE_FILE = "manga_cache.txt"
POSTS_DIR = "src/data/manga"
API_ID = "4Lx0ftRf17Uuad6Ud7Gb"
API_AFFILIATE_ID = "onchan555-999"
LINK_AFFILIATE_ID = "onchan555-003"
TARGET_POST_COUNT = 5

# er-3: 美少女・美女・制服・清楚系漫画
SEARCH_KEYWORDS = ["美少女", "制服", "清楚", "美女", "JK", "天使", "処女"]
EXCLUDE_WORDS = ["熟女", "五十路", "四十路", "六十路", "高齢", "ニューハーフ", "おばさん", "マダム"]

def generate_hinban(content_id):
    if not content_id:
        return ""
    s = content_id.lower()
    s = re.sub(r'^(h_\d+|h_|\d+)', '', s)
    match = re.match(r'^([a-z]+)(\d+)', s)
    if match:
        a = match.group(1).upper()
        n = match.group(2)
        c = n.lstrip('0') or '0'
        std = f"{a}-{n}"
        return f"{a}-{c} ({std})" if c != n else std
    return content_id.upper()

def load_posted_cache():
    if os.path.exists(CACHE_FILE):
        with open(CACHE_FILE, "r", encoding="utf-8") as f:
            return set(line.strip() for line in f if line.strip())
    return set()

def save_to_cache(content_id):
    with open(CACHE_FILE, "a", encoding="utf-8") as f:
        f.write(f"{content_id}\n")

def save_manga_post(post_data):
    os.makedirs(POSTS_DIR, exist_ok=True)
    filename = os.path.join(POSTS_DIR, f"{post_data['id']}.json")
    with open(filename, "w", encoding="utf-8") as f:
        json.dump(post_data, f, ensure_ascii=False, indent=2)
    print(f"Saved: {filename}")

def fetch_fanza_manga():
    url = "https://api.dmm.com/affiliate/v3/ItemList"
    all_items = []
    for keyword in SEARCH_KEYWORDS:
        for sort_type in ["rank", "date"]:
            params = {
                "api_id": API_ID,
                "affiliate_id": API_AFFILIATE_ID,
                "site": "FANZA",
                "service": "ebook",
                "floor": "comic",
                "keyword": keyword,
                "sort": sort_type,
                "offset": random.randint(1, 10),
                "hits": 20,
                "output": "json"
            }
            try:
                print(f"Fetching manga: '{keyword}', sort: '{sort_type}'")
                r = requests.get(url, params=params, timeout=15)
                if r.status_code == 200:
                    items = r.json().get("result", {}).get("items", [])
                    all_items.extend(items)
            except Exception as e:
                print(f"Error: {e}")
            time.sleep(0.5)
    random.shuffle(all_items)
    return all_items

def filter_items(items, posted_cache):
    valid = []
    seen = set()
    for item in items:
        cid = item.get("content_id")
        if not cid or cid in posted_cache or cid in seen:
            continue
        seen.add(cid)
        title = item.get("title", "")
        genres = " ".join([g.get("name", "") for g in item.get("iteminfo", {}).get("genre", [])])
        if not any(w in title or w in genres for w in EXCLUDE_WORDS):
            valid.append(item)
    return valid

def generate_manga_article(item):
    title = item.get("title", "")
    comment = item.get("comment", "")
    genres = ", ".join([g.get("name", "") for g in item.get("iteminfo", {}).get("genre", [])])
    authors = "、".join([a.get("name", "") for a in item.get("iteminfo", {}).get("author", [])])
    cid = item.get("content_id", "")

    prompt = f"""以下のアダルト漫画（美少女・美女系）の情報を元に、SEO完全特化の高品質ブログ記事HTML本文を生成してください。

【品番】: {cid}
【タイトル】: {title}
【作者】: {authors if authors else "不明"}
【あらすじ（公式）】: {comment}
【ジャンル】: {genres}

【SEO超特化ルール】
1. h2を3つ以上、h3を4つ以上含める
2. 2000文字以上
3. 「{cid}」「レビュー」「感想」「ネタバレなし」「あらすじ」「美少女漫画」「おすすめ」を自然に含める
4. 必須セクション: 概要・設定紹介（ネタバレなし）/見どころ・絵柄の魅力（箇条書き）/作者・画風の分析/こんな人におすすめ/評価表(table: ストーリー・エロ度・画力・ヒロインの可愛さ)/FANZAで読む方法
5. ネタバレは最小限にし「続きはFANZAで確認」へ誘導
6. HTMLのみ出力。マークダウン禁止。"""

    system_message = "あなたはアダルト漫画に精通したカリスマレビュアーです。美少女・美女系漫画に詳しく、可愛さ・エロさを文学的に表現し、品番検索で辿り着く読者向けのSEO最強記事をHTMLで書きます。"
    models = ["openai", "openai-fast", "mistral"]

    for attempt in range(2):
        for model in models:
            try:
                print(f"  Generating with {model}...")
                r = requests.post(
                    "https://text.pollinations.ai/",
                    json={"messages": [
                        {"role": "system", "content": system_message},
                        {"role": "user", "content": prompt}
                    ], "model": model},
                    timeout=45
                )
                if r.status_code == 200 and len(r.text.strip()) > 300:
                    result = r.text.strip()
                    if "```html" in result:
                        result = result.split("```html", 1)[1]
                    if "```" in result:
                        result = result.split("```")[0]
                    return result.strip()
            except Exception as e:
                print(f"  Error with {model}: {e}")
            time.sleep(1)

    return f"<h2>{title}</h2><p>{comment}</p>"

def main():
    print(f"--- Manga Generator ({SITE}) | Target: {TARGET_POST_COUNT} ---")
    posted_cache = load_posted_cache()
    all_items = fetch_fanza_manga()
    valid_items = filter_items(all_items, posted_cache)
    print(f"Found {len(valid_items)} valid manga candidates.")

    count = 0
    for item in valid_items:
        if count >= TARGET_POST_COUNT:
            break
        cid = item.get("content_id")
        title = item.get("title", "")
        affiliate_url = item.get("affiliateURL", "")
        if "af_id=" in affiliate_url:
            affiliate_url = re.sub(r"af_id=[^&]+", f"af_id={LINK_AFFILIATE_ID}", affiliate_url)

        imgs = item.get("imageURL", {})
        image_url = imgs.get("large") or imgs.get("list") or ""
        sample_images = item.get("sampleImageURL", {}).get("sample_l", {}).get("image", []) or []

        print(f"[{count+1}/{TARGET_POST_COUNT}] {title[:60]}")
        review_html = generate_manga_article(item)

        post_data = {
            "id": cid,
            "type": "manga",
            "hinban": generate_hinban(cid),
            "title": title,
            "review": review_html,
            "image": image_url,
            "sample_images": sample_images,
            "affiliate_url": affiliate_url,
            "genres": [g.get("name", "") for g in item.get("iteminfo", {}).get("genre", [])],
            "author": [a.get("name", "") for a in item.get("iteminfo", {}).get("author", [])],
            "publisher": (item.get("iteminfo", {}).get("label", [{}]) or [{}])[0].get("name", ""),
            "date": item.get("date", time.strftime("%Y-%m-%d %H:%M:%S")),
            "labels": ["漫画", "アダルト漫画", "美少女漫画", "2026年最新"]
        }

        save_manga_post(post_data)
        save_to_cache(cid)
        count += 1
        time.sleep(2)

    print(f"--- Generated {count} manga posts ---")

if __name__ == "__main__":
    main()
