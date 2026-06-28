import os
import random
import requests
import time
import json
import re
import urllib.parse

CACHE_FILE = "posted_cache.txt"
POSTS_DIR = "src/data/posts"

def clean_for_safety(text):
    if not text:
        return ""
    safety_map = {
        "流出": "プライベート",
        "裏アカ": "秘密のアカウント",
        "パパ活": "秘密の交際",
        "ナンパ": "運命の出会い",
        "ハプニング": "予期せぬ出来事",
        "マジックミラー": "特殊車両",
        "素人": "一般の女性",
        "痴女": "積極的な女性",
        "中出し": "愛の結末",
        "AV": "ビデオ作品",
        "アダルト": "大人向け"
    }
    for old, new in safety_map.items():
        text = text.replace(old, new)
    return text

def load_posted_cache():
    if os.path.exists(CACHE_FILE):
        with open(CACHE_FILE, "r", encoding="utf-8") as f:
            return set(line.strip() for line in f if line.strip())
    return set()

def save_to_cache(content_id):
    with open(CACHE_FILE, "a", encoding="utf-8") as f:
        f.write(f"{content_id}\n")

def fetch_fanza_item():
    api_id = os.environ.get("FANZA_API_ID")
    affiliate_id = os.environ.get("FANZA_AFFILIATE_ID")
    if not api_id or not affiliate_id:
        raise ValueError("FANZA_API_ID and FANZA_AFFILIATE_ID must be set in environment variables.")

    raw_api_id = api_id
    raw_affiliate_id = affiliate_id

    # api_idのパース
    if "api_id=" in raw_api_id:
        match = re.search(r"[?&]api_id=([^&]+)", raw_api_id)
        if match:
            api_id = match.group(1)

    # affiliate_idのパース
    if "affiliate_id=" in raw_affiliate_id:
        match = re.search(r"[?&]affiliate_id=([^&]+)", raw_affiliate_id)
        if match:
            affiliate_id = match.group(1)
    elif "affiliate_id=" in raw_api_id:
        match = re.search(r"[?&]affiliate_id=([^&]+)", raw_api_id)
        if match:
            affiliate_id = match.group(1)

    # URLデコードしてアンパサンドなどのエスケープを解除
    api_id = urllib.parse.unquote(api_id).strip()
    affiliate_id = urllib.parse.unquote(affiliate_id).strip()

    # 余計な末尾のブラケットや特殊記号を完全に排除
    api_id = re.sub(r"[^a-zA-Z0-9_-]", "", api_id).strip()
    affiliate_id = re.sub(r"[^a-zA-Z0-9-]", "", affiliate_id).strip()

    print(f"[DEBUG] Final parsed API ID: {api_id}")
    print(f"[DEBUG] Final parsed Affiliate ID: {affiliate_id}")

    # 素人・流出・ハプニング系キーワードリスト
    keywords = ["素人 流出", "裏アカ ハプニング", "パパ活 素人", "マジックミラー ナンパ"]
    selected_keyword = random.choice(keywords)
    print(f"Searching FANZA for keyword: {selected_keyword}")

    # 重複アイテムを避けるため、ランダムなページオフセット(1〜20)を指定
    random_offset = random.randint(1, 20)
    print(f"Using random offset: {random_offset}")

    url = "https://api.dmm.com/affiliate/v3/ItemList"
    params = {
        "api_id": api_id,
        "affiliate_id": affiliate_id,
        "site": "FANZA",
        "service": "digital",
        "floor": "videoa",
        "keyword": selected_keyword,
        "sort": random.choice(["date", "rank"]),
        "offset": random_offset,
        "hits": 30, # スキップ処理のために多めに取得する
        "output": "json"
    }

    response = requests.get(url, params=params)
    if response.status_code != 200:
        raise RuntimeError(f"Failed to fetch from FANZA API: {response.status_code} - {response.text}")

    data = response.json()
    items = data.get("result", {}).get("items", [])
    if not items:
        raise RuntimeError(f"No items found for keyword: {selected_keyword}")

    posted_cache = load_posted_cache()
    for item in items:
        content_id = item.get("content_id")
        if not content_id:
            continue

        # 熟女・高齢者系コンテンツの強制スキップ処理
        title = item.get("title", "")
        comment = item.get("comment", "")
        genres = [g.get("name", "") for g in item.get("iteminfo", {}).get("genre", [])]
        genres_str = " ".join(genres)
        
        exclude_words = ["熟女", "おばさん", "五十路", "四十路", "六十路", "熟年", "マダム", "高齢", "お姉さん", "ババ", "ニューハーフ", "レディーボーイ", "男の娘"]
        is_excluded = False
        for word in exclude_words:
            if word in title or word in comment or word in genres_str:
                print(f"[SKIP] Excluding mature content (matched '{word}'): {title}")
                is_excluded = True
                break
        
        if is_excluded:
            continue

        if content_id not in posted_cache:
            return item

    # 1件も新しいものがない場合は、エラーにせずNoneを返す（エラー終了によるGitHub Actions停止を防ぐ）
    return None

def generate_article_with_llm(item):
    title = item.get("title")
    comment = item.get("comment", "")
    genres = ", ".join([g.get("name", "") for g in item.get("iteminfo", {}).get("genre", [])])
    
    safe_title = clean_for_safety(title)
    safe_comment = clean_for_safety(comment)
    safe_genres = clean_for_safety(genres)

    prompt = f"""以下の大人向け映像作品の情報を基にして、指定の執筆ルールに従ってブログ記事のHTML本文（レビュー文）を生成してください。

【作品名】: {safe_title}
【あらすじ】: {safe_comment}
【ジャンル】: {safe_genres}

【執筆ルール】
1. ペルソナ: ネットで絶大な支持を集める「秘密の恋愛・大人の背徳ドラマ専門」のカリスマ熱血レビュアー。圧倒的な文章の熱量で語ってください。
2. 感情的なキャッチコピー: 冒頭に作品の「禁断のシチュエーションのヤバさ」を突いた見出し（<h3>）を配置してください。
3. マニア目線の心理描写: 公式のあらすじをなぞるのではない、ストーリー・心理・情景の推しポイントを熱量MAXで書いてください（例：「登場人物の葛藤する表情」「日常が崩壊していく感覚」など）。
4. ロングテールSEOの埋め込み: 記事内に自然な形で「主婦」「不倫」「旦那の留守中」「寝取られ」などの関連サジェストワードを散りばめてください。
5. 表現の防壁: 直接的な性描写（ポルノワード）を完全に避け、官能的で妄想を刺激する文学的表現（例：「禁断の領域」「蜜月」「背徳の泥沼」）に必ず変換してください。
6. 出力フォーマット: Bloggerにそのまま流し込めるように、本文のみをHTML（<p>, <h3>, <strong>）で出力し、マークダウンのコードブロック（```html や ```）は一切出力しないでください。

それでは、HTML本文のみを出力してください。
"""

    system_message = "あなたはネットで絶大な支持を集める「秘密の恋愛・大人の背徳ドラマ専門」のカリスマ熱血レビュアーです。規約に配慮しつつ極めて熱量の高いレビュー文をHTML形式で作成します。"

    pollinations_models = ["openai", "openai-fast", "llama", "mistral", "qwen"]
    for attempt in range(2):
        for model in pollinations_models:
            try:
                print(f"Attempting to generate article with Pollinations AI (model: {model}, attempt: {attempt+1})...")
                response = requests.post(
                    "https://text.pollinations.ai/",
                    json={
                        "messages": [
                            {"role": "system", "content": system_message},
                            {"role": "user", "content": prompt}
                        ],
                        "model": model
                    },
                    timeout=35
                )
                if response.status_code == 200 and len(response.text.strip()) > 100:
                    result_text = response.text.strip()
                    if "```html" in result_text:
                        result_text = result_text.split("```html", 1)[1]
                    if "```" in result_text:
                        result_text = result_text.split("```")[0]
                    return result_text.strip()
                elif response.status_code == 429:
                    print(f"Pollinations AI ({model}) returned 429 (Rate Limit). Waiting...")
                    time.sleep(3)
            except Exception as e:
                print(f"Pollinations AI ({model}) failed with exception: {e}")
                time.sleep(2)

    print("Warning: All LLM models failed. Using high-quality fallback template.")
    fallback_html = f"""
    <h3>禁断のシチュエーションが織りなす大人の濃厚ストーリー！</h3>
    <p>日常のすぐ裏側に潜むスリリングな関係を描いた、本能を揺さぶる名作が登場しました。</p>
    <p><strong>「日常が静かに、しかし劇的に崩壊していく感覚」</strong>をじっくりと味わえる本作。登場人物たちが織りなす葛藤と、罪悪感に濡れた表情はまさにマニアも納得の仕上がりです。</p>
    <p>禁断 of 領域へと足を踏み入れていく二人の蜜月を、ぜひその目で確かめてみてください。</p>
    """
    return fallback_html.strip()

def save_individual_post(post_data):
    os.makedirs(POSTS_DIR, exist_ok=True)
    post_id = post_data["id"]
    file_path = os.path.join(POSTS_DIR, f"{post_id}.json")
    
    with open(file_path, "w", encoding="utf-8") as f:
        json.dump(post_data, f, ensure_ascii=False, indent=2)
    print(f"Successfully saved individual JSON: {file_path}")

def main():
    try:
        # 1. FANZAから商品取得
        item = fetch_fanza_item()
        if not item:
            print("No new items found that haven't been posted yet. Exiting cleanly (exit 0).")
            return

        content_id = item.get("content_id")
        title = item.get("title")
        affiliate_url = item.get("affiliateURL")
        
        # リンク用のアフィリエイトIDをonchan555-003に変更
        if affiliate_url:
            affiliate_url = affiliate_url.replace("af_id=onchan555-999", "af_id=onchan555-003")
            api_aff_id = os.environ.get("FANZA_AFFILIATE_ID")
            if api_aff_id and api_aff_id != "onchan555-003":
                affiliate_url = affiliate_url.replace(f"af_id={api_aff_id}", "af_id=onchan555-003")

        print(f"Selected FANZA Item: {title} ({content_id})")

        # 画像URL
        image_url = ""
        images = item.get("imageURL", {})
        if images:
            image_url = images.get("large") or images.get("list") or ""

        # サブ画像URL
        sample_images = []
        sample_img_obj = item.get("sampleImageURL", {}).get("sample_l", {})
        if sample_img_obj:
            sample_images = sample_img_obj.get("image", [])

        # 2. LLMでレビュー文生成
        review_html = generate_article_with_llm(item)

        # 3. 個別JSONデータ構造の組み立て
        post_data = {
            "id": content_id,
            "title": f"【超ド級の背徳感】 {title}",
            "review": review_html,
            "image": image_url,
            "sample_images": sample_images,
            "affiliate_url": affiliate_url,
            "genres": [g.get("name", "") for g in item.get("iteminfo", {}).get("genre", [])],
            "actresses": [a.get("name", "") for a in item.get("iteminfo", {}).get("actress", [])],
            "maker": item.get("iteminfo", {}).get("maker", [{}])[0].get("name", ""),
            "date": item.get("date", time.strftime("%Y-%m-%d %H:%M:%S")),
            "labels": ["FANZA新作", "人妻", "ネトラレ", "背徳不倫"]
        }

        # 個別のJSONとして保存する
        save_individual_post(post_data)

        # 4. キャッシュに保存
        save_to_cache(content_id)
        print("Crawler run completed successfully.")

    except Exception as e:
        print(f"Error in execution: {e}")
        exit(1)

if __name__ == "__main__":
    main()
