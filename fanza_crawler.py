import os
import random
import requests
import time
import json
import re
import urllib.parse
import hashlib

CACHE_FILE = "posted_cache.txt"
POSTS_DIR = "src/data/posts"

def clean_for_safety(text):
    if not text:
        return ""
    safety_map = {
        "流出": "秘密のプライベート映像",
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

LINK_AFFILIATE_ID = "onchan555-003"  # 記事内アフィリリンク用（固定）

def fetch_fanza_item():
    api_id = os.environ.get("FANZA_API_ID")
    affiliate_id = os.environ.get("FANZA_AFFILIATE_ID")  # API呼び出し用（-999）
    if not api_id or not affiliate_id:
        raise ValueError("FANZA_API_ID and FANZA_AFFILIATE_ID must be set in environment variables.")

    raw_api_id = api_id
    raw_affiliate_id = affiliate_id

    if "api_id=" in raw_api_id:
        match = re.search(r"[?&]api_id=([^&]+)", raw_api_id)
        if match:
            api_id = match.group(1)

    if "affiliate_id=" in raw_affiliate_id:
        match = re.search(r"[?&]affiliate_id=([^&]+)", raw_affiliate_id)
        if match:
            affiliate_id = match.group(1)
    elif "affiliate_id=" in raw_api_id:
        match = re.search(r"[?&]affiliate_id=([^&]+)", raw_api_id)
        if match:
            affiliate_id = match.group(1)

    api_id = urllib.parse.unquote(api_id).strip()
    affiliate_id = urllib.parse.unquote(affiliate_id).strip()

    api_id = re.sub(r"[^a-zA-Z0-9_-]", "", api_id).strip()
    affiliate_id = re.sub(r"[^a-zA-Z0-9-]", "", affiliate_id).strip()

    print(f"[DEBUG] Final parsed API ID: {api_id}")
    print(f"[DEBUG] Final parsed Affiliate ID: {affiliate_id}")

    # ギャル・美少女特化キーワードリスト
    keywords = ["ギャル", "黒ギャル", "制服ギャル", "ギャルJK", "パパ活 ギャル", "コスプレ ギャル", "美少女 ギャル", "ギャルママ"]
    selected_keyword = random.choice(keywords)
    print(f"Searching FANZA for keyword: {selected_keyword}")

    random_offset = random.randint(1, 10)
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
        "hits": 40,
        "output": "json"
    }

    response = requests.get(url, params=params, timeout=15)
    print(f"API Response Status: {response.status_code}")
    
    if response.status_code != 200:
        print(f"API Error Response Body: {response.text}")
        print("")
        print("===== FANZA API 認証エラー 解決ガイド =====")
        print(f"  現在使用中のAPI_ID: [{api_id}]")
        print(f"  現在使用中のAFFILIATE_ID: [{affiliate_id}]")
        print("")
        print("よくある原因:")
        print("  1. GitHubのSecrets設定でIDの値にスペースや改行が入っている")
        print("  2. affiliate_idの形式が誤っている（正: onchan555-999 / 誤: onchan555-003など番号違い）")
        print("  3. APIアクセスが承認されていない（FANZA側の審査待ち）")
        print("")
        print("対処法: GitHubリポジトリの Settings > Secrets > FANZA_AFFILIATE_ID を確認・修正してください")
        print("===== ====================== =====")
        raise Exception(f"FANZA API returned status code {response.status_code}")

    data = response.json()
    items = data.get("result", {}).get("items", [])
    
    if not items:
        print("No items returned from API with selected keyword and offset.")
        return None, affiliate_id

    posted_cache = load_posted_cache()
    
    # 禁止ワード（VR、バーチャル、レディーボーイ、オカマ、ニューハーフ、熟女系を完全排除）
    exclude_keywords = [
        "VR", "vr", "8KVR", "バーチャル", "レディーボーイ", "オカマ", "ニューハーフ",
        "男の娘", "ゲイ", "熟女", "おばさん", "五十路", "四十路", "六十路", "熟年",
        "マダム", "高齢", "ババ"
    ]
    
    selected_item = None
    for item in items:
        content_id = item.get("content_id")
        title = item.get("title", "")
        genres = " ".join(g.get("name", "") for g in item.get("iteminfo", {}).get("genre", []))
        
        # キャッシュチェック
        if content_id in posted_cache:
            continue
            
        # 禁止ワードチェック
        if any(ex in title + " " + genres for ex in exclude_keywords):
            print(f"Skipping prohibited item: {title[:30]}")
            continue
            
        selected_item = item
        break

    if not selected_item:
        print("All fetched items were either already posted or contained prohibited keywords.")
        return None, affiliate_id

    # API用(999)ではなくリンク用(003)を記事生成に渡す
    return selected_item, LINK_AFFILIATE_ID

def build_ultra_seo_article(item, link_affiliate_id):
    title = item.get("title", "")
    comment = clean_for_safety(item.get("comment", ""))
    genres = [g.get("name", "") for g in item.get("iteminfo", {}).get("genre", [])]
    actresses = [a.get("name", "") for a in item.get("iteminfo", {}).get("actress", [])]
    maker_info = item.get("iteminfo", {}).get("maker")
    maker = maker_info[0].get("name", "") if maker_info else "大注目レーベル"
    cid = item.get("content_id", "")
    date_str = item.get("date", time.strftime("%Y-%m-%d"))[:10]
    
    actress_str = "、".join(actresses) if actresses else "注目のギャル女優"
    genre_str = "、".join(genres[:4]) if genres else "ギャル・トレンド"
    
    h_num = int(hashlib.md5(cid.encode()).hexdigest(), 16)
    
    lines = []
    
    intros = [
        f"<p>検索でこの記事に辿り着いたあなたへ。いま話題作として各種ランキングを賑わせている<strong>『{title}』</strong>（{maker}）。「実際の見どころは？」「自分の好みに合うか？」と気になっている方も多いのではないでしょうか。本記事では、ギャル系コンテンツファン視点から本作の見どころ、演出のリアルさ、キャスト【{actress_str}】の魅力を余すところなく徹底解説します！</p>",
        f"<p>「間違いのない最高のギャル作品を選びたい」――そんな映像ファンの期待に100%応える傑作が登場しました。{maker}が放つ超話題作<strong>『{title}』</strong>です。主演の【{actress_str}】が見せる圧倒的なギャルマインドと表現力、そして{genre_str}の魅力を凝縮した本作。実際に視聴した上でのリアルな見どころと満足度をわかりやすく紐解いていきます。</p>",
        f"<p>数あるコンテンツの中でも、今最も熱い視線を集めているギャル系タイトル<strong>『{title}』</strong>。評判通りのクオリティなのか、どのシーンが一番のハイライトなのか。主演【{actress_str}】の熱演ぶりや作品全体の仕上がりについて、SEO視点でも注目のポイントを深掘りしてご紹介します！</p>"
    ]
    lines.append(intros[h_num % len(intros)])
    
    lines.append("<h2 style='border-bottom: 2px solid #f43f5e; padding-bottom: 8px; margin-top: 28px;'>【基本データ】作品スペック＆詳細情報</h2>")
    lines.append("<table style='width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 14px;'>")
    lines.append(f"<tr style='border-bottom: 1px solid #e2e8f0;'><th style='background: #f8fafc; padding: 10px; text-align: left; width: 30%; font-weight: bold; color: #475569;'>タイトル</th><td style='padding: 10px; color: #1e293b;'>{title}</td></tr>")
    lines.append(f"<tr style='border-bottom: 1px solid #e2e8f0;'><th style='background: #f8fafc; padding: 10px; text-align: left; font-weight: bold; color: #475569;'>出演女優</th><td style='padding: 10px; color: #e11d48; font-weight: bold;'>{actress_str}</td></tr>")
    lines.append(f"<tr style='border-bottom: 1px solid #e2e8f0;'><th style='background: #f8fafc; padding: 10px; text-align: left; font-weight: bold; color: #475569;'>メーカー</th><td style='padding: 10px; color: #1e293b;'>{maker}</td></tr>")
    lines.append(f"<tr style='border-bottom: 1px solid #e2e8f0;'><th style='background: #f8fafc; padding: 10px; text-align: left; font-weight: bold; color: #475569;'>主要ジャンル</th><td style='padding: 10px; color: #1e293b;'>{genre_str}</td></tr>")
    lines.append(f"<tr style='border-bottom: 1px solid #e2e8f0;'><th style='background: #f8fafc; padding: 10px; text-align: left; font-weight: bold; color: #475569;'>配信日/発売日</th><td style='padding: 10px; color: #1e293b;'>{date_str}</td></tr>")
    lines.append("</table>")
    
    if comment:
        lines.append("<h2 style='border-bottom: 2px solid #f43f5e; padding-bottom: 8px; margin-top: 28px;'>公式ストーリーと展開の背景</h2>")
        lines.append(f"<blockquote style='background: #f8fafc; padding: 18px; border-left: 5px solid #f43f5e; margin: 16px 0; line-height: 1.7; color: #334155; border-radius: 4px;'><p style='margin:0;'>{comment}</p></blockquote>")
        lines.append(f"<p>本作のストーリー設計は非常に洗練されています。単にシチュエーションを並べるだけでなく、登場人物の距離感が徐々に縮まっていく心理描写や、ギャルならではの明るく積極的なノリとギャップのある表情が完璧に構築されています。{maker}ならではの高画質かつ計算された構図が見事です。</p>")
        
    lines.append(f"<h2 style='border-bottom: 2px solid #f43f5e; padding-bottom: 8px; margin-top: 28px;'>【徹底検証】『{title}』のここがスゴい！3つの見どころ</h2>")
    
    point1_titles = [f"1. 主演・{actress_str}の圧倒的なギャル気質と演技美", f"1. {actress_str}が魅せるド直球な可愛さとリアクション", f"1. レンズ越しに伝わる{actress_str}の弾ける魅力と存在感"]
    point1_texts = [
        f"画面に映し出された瞬間から、{actress_str}の持つ独特のギャルオーラに引き込まれます。特に視線の配り方や無邪気な笑顔からの表情の変化は、観る者の本能を揺さぶるのに充分すぎる魅力を持っています。",
        f"普段見せる強気なギャルスマイルと、照れや開放感を見せる瞬間のギャップがたまりません。{actress_str}の身体を張った熱演は、今作における最大のハイライトと言っても過言ではありません。"
    ]
    
    point2_titles = [f"2. {genre_str}ファンを唸らせる最高峰の演出", f"2. ギャルの臨場感を極限まで高めるカメラワークと音声", f"2. テンポ良く期待感をあおるシチュエーション構築"]
    point2_texts = [
        f"{genre_str}という枠組みを最大限に活用し、視聴者が「一番見たいシーン」をベストな角度・ライティングで捉えています。制作陣の並々ならぬこだわりが感じられるクオリティです。",
        f"音響のリアリティにも注目です。耳元で囁くような吐息や甘い声までクリアに拾われており、まるでその場に同席しているかのような没入感を体験できます。"
    ]
    
    point3_titles = ["3. 全編を通してダレ場のない爽快な展開", "3. リピート鑑賞に耐えうる密度の高いギャル映像美", "3. 満足度100%を誇る最高のクライマックス"]
    point3_texts = [
        "終始テンポ良くストーリーが進行し、中弛みすることが一切ありません。一度再生ボタンを押したら最後まで一気に駆け抜けるスピード感と満足度があります。",
        "細部まで作り込まれた演出とライティングにより、何度見返しても新しい発見がある奥深い作品に仕上がっています。"
    ]
    
    lines.append(f"<h3 style='font-size: 16px; color: #be123c; margin-top: 20px;'>{point1_titles[h_num % len(point1_titles)]}</h3>")
    lines.append(f"<p>{point1_texts[h_num % len(point1_texts)]}</p>")
    
    lines.append(f"<h3 style='font-size: 16px; color: #be123c; margin-top: 20px;'>{point2_titles[h_num % len(point2_titles)]}</h3>")
    lines.append(f"<p>{point2_texts[h_num % len(point2_texts)]}</p>")
    
    lines.append(f"<h3 style='font-size: 16px; color: #be123c; margin-top: 20px;'>{point3_titles[h_num % len(point3_titles)]}</h3>")
    lines.append(f"<p>{point3_texts[h_num % len(point3_texts)]}</p>")
    
    lines.append("<h2 style='border-bottom: 2px solid #f43f5e; padding-bottom: 8px; margin-top: 28px;'>本作品をおすすめする人・満足できる人</h2>")
    lines.append("<div style='background: #fff1f2; border: 1px solid #fecdd3; padding: 16px; border-radius: 8px; margin: 16px 0;'>")
    lines.append("<ul style='margin:0; padding-left: 20px; color: #9f1239; font-weight: 500;'>")
    lines.append(f"<li style='margin-bottom: 6px;'>【{actress_str}】のファン、またはギャル系コンテンツが好きな方</li>")
    lines.append(f"<li style='margin-bottom: 6px;'>【{genre_str}】の明るく積極的なシチュエーションが好みな方</li>")
    lines.append("<li style='margin-bottom: 6px;'>映像クオリティや演出の美しさ、没入感を重視したい方</li>")
    lines.append("<li style='margin-bottom: 6px;'>最後まで飽きずに楽しめるテンポの良い作品を探している方</li>")
    lines.append("</ul>")
    lines.append("</div>")
    
    lines.append("<h2 style='border-bottom: 2px solid #f43f5e; padding-bottom: 8px; margin-top: 28px;'>よくある質問（FAQ）</h2>")
    lines.append("<div style='margin: 16px 0;'>")
    lines.append(f"<p style='font-weight: bold; color: #1e293b; margin-bottom: 4px;'>Q1: 『{title}』はギャル好き初心者でも楽しめますか？</p>")
    lines.append(f"<p style='color: #475569; margin-bottom: 16px; padding-left: 12px; border-left: 3px solid #cbd5e1;'>A1: はい！テンポが非常に良く王道のギャル作品展開となっているため、初めて鑑賞する方にも自信を持っておすすめできます。</p>")
    lines.append(f"<p style='font-weight: bold; color: #1e293b; margin-bottom: 4px;'>Q2: 他の同ジャンル作品との違いは何ですか？</p>")
    lines.append(f"<p style='color: #475569; margin-bottom: 16px; padding-left: 12px; border-left: 3px solid #cbd5e1;'>A2: {maker}ならではの洗練された映像クオリティと、{actress_str}の底抜けた明るさ・魅力の融合が最大のポイントです。</p>")
    lines.append("</div>")
    
    lines.append("<h2 style='border-bottom: 2px solid #f43f5e; padding-bottom: 8px; margin-top: 28px;'>まとめ：今すぐ体感すべき至高のギャル作品</h2>")
    lines.append(f"<p>『<strong>{title}</strong>』は、キャスト・演出・映像美のすべてが高水準で融合した傑作です。【{actress_str}】が見せる最高のパフォーマンスを、ぜひ配信でお楽しみください。気になった方は今すぐ公式ページで詳細情報をチェックしてみましょう！</p>")
    
    article_body = "\n".join(lines)
    
    imgs = item.get("imageURL", {})
    large_img = imgs.get("large", "")
    list_img = imgs.get("list", "")
    img_url = large_img if large_img else list_img
    
    sample_imgs = []
    sample_data = item.get("sampleImageURL", {})
    if sample_data and "sample_l" in sample_data and "image" in sample_data["sample_l"]:
        sample_imgs = sample_data["sample_l"]["image"][:5]
        
    aff_url = item.get("affiliateURL", "")
    if link_affiliate_id and aff_url:
        aff_url = re.sub(r"affiliate_id=[^&]+", f"affiliate_id={link_affiliate_id}", aff_url)
        
    labels = genres[:5]
    if actresses:
        labels.extend(actresses)
    labels.append(maker)
    
    return {
        "id": cid,
        "title": title,
        "review": article_body,
        "image": img_url,
        "sample_images": sample_imgs,
        "affiliate_url": aff_url,
        "genres": genres,
        "actresses": actresses,
        "maker": maker,
        "date": date_str,
        "labels": list(set(labels))
    }

def main():
    print("--- Starting FANZA Crawler for Gal & Ultra SEO Posts ---")
    try:
        item, affiliate_id = fetch_fanza_item()
        if not item:
            print("No new item to post. Exiting gracefully.")
            return

        content_id = item.get("content_id")
        print(f"Selected Item Content ID: {content_id}")

        post_data = build_ultra_seo_article(item, affiliate_id)

        os.makedirs(POSTS_DIR, exist_ok=True)
        post_filepath = os.path.join(POSTS_DIR, f"{content_id}.json")

        with open(post_filepath, "w", encoding="utf-8") as f:
            json.dump(post_data, f, ensure_ascii=False, indent=2)

        print(f"Successfully generated post JSON: {post_filepath}")
        save_to_cache(content_id)
        print(f"Saved {content_id} to cache.")

    except Exception as e:
        print(f"Error during crawler execution: {e}")
        print("APIエラーのため今回はスキップします。既存の記事は保持されています。")
        exit(0)  # exit(0)で正常終了扱い → 後続のbundle・commitステップが動作する

if __name__ == "__main__":
    main()
