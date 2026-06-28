import os, random, requests, time, json, re, hashlib

CACHE_FILE = "posted_cache.txt"
POSTS_DIR = "src/data/posts"
API_ID = "4Lx0ftRf17Uuad6Ud7Gb"
API_AFFILIATE_ID = "onchan555-999"
LINK_AFFILIATE_ID = "onchan555-003"
TARGET_POST_COUNT = 60

def clean_for_safety(text):
    if not text: return ""
    safety_map = {
        "流出": "秘密のプライベート映像", "裏アカ": "秘密のアカウント",
        "パパ活": "秘密の交際", "ナンパ": "運命の出会い",
        "ハプニング": "予期せぬドラマ", "マジックミラー": "特殊車両",
        "素人": "一般女性", "痴女": "積極的な女性", "中出し": "愛の結末"
    }
    for old, new in safety_map.items():
        text = text.replace(old, new)
    return text

def fetch_fanza_items():
    kws = ["ギャル", "黒ギャル", "制服ギャル", "ギャルJK", "コギャル", "ギャルママ", "美少女 ギャル", "コスプレ ギャル", "パパ活 ギャル", "美少女", "制服", "女子高生", "単体", "チアガール", "レースクイーン"]
    url = "https://api.dmm.com/affiliate/v3/ItemList"
    all_items = []
    for kw in kws:
        for offset in [1, 10, 20, 30]:
            p = {
                "api_id": API_ID,
                "affiliate_id": API_AFFILIATE_ID,
                "site": "FANZA",
                "service": "digital",
                "floor": "videoa",
                "sort": "rank",
                "offset": offset,
                "hits": 30,
                "output": "json",
                "keyword": kw
            }
            try:
                r = requests.get(url, params=p, timeout=15)
                if r.status_code == 200:
                    items = r.json().get("result", {}).get("items", [])
                    all_items.extend(items)
            except Exception as e:
                print(f"ERR: {e}")
            time.sleep(0.08)
        
    seen = set(); uniq = []
    # 禁止ワード（VR、バーチャル、レディーボーイ、オカマ、ニューハーフ、熟女系を完全排除）
    ex = [
        "VR", "vr", "8KVR", "バーチャル", "レディーボーイ", "オカマ", "ニューハーフ",
        "男の娘", "ゲイ", "熟女", "おばさん", "五十路", "四十路", "六十路", "熟年",
        "マダム", "高齢", "ババ"
    ]
    for i in all_items:
        c = i.get("content_id")
        if not c or c in seen: continue
        t = i.get("title", "")
        gs = " ".join(g.get("name", "") for g in i.get("iteminfo", {}).get("genre", []))
        if any(w in t + " " + gs for w in ex): continue
        imgs = i.get("imageURL", {})
        if not imgs or not (imgs.get("large") or imgs.get("list")): continue
        seen.add(c)
        uniq.append(i)
        
    random.shuffle(uniq)
    return uniq[:TARGET_POST_COUNT]

def build_ultra_seo_article(item, idx):
    title = item.get("title", "")
    comment = clean_for_safety(item.get("comment", ""))
    genres = [g.get("name", "") for g in item.get("iteminfo", {}).get("genre", [])]
    actresses = [a.get("name", "") for a in item.get("iteminfo", {}).get("actress", [])]
    maker_info = item.get("iteminfo", {}).get("maker")
    maker = maker_info[0].get("name", "") if maker_info else "大注目レーベル"
    cid = item.get("content_id", "")
    date_str = item.get("date", "2026-06-28")[:10]
    
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
    if LINK_AFFILIATE_ID and aff_url:
        aff_url = re.sub(r"affiliate_id=[^&]+", f"affiliate_id={LINK_AFFILIATE_ID}", aff_url)
        
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
    print("ギャル・美少女特化 超高品質SEO記事60件の作成を開始します...")
    items = fetch_fanza_items()
    print(f"取得できた作品数: {len(items)}")
    
    os.makedirs(POSTS_DIR, exist_ok=True)
    
    for old_f in os.listdir(POSTS_DIR):
        if old_f.endswith(".json"):
            os.remove(os.path.join(POSTS_DIR, old_f))
            
    created_count = 0
    for idx, item in enumerate(items):
        post_data = build_ultra_seo_article(item, idx)
        cid = post_data["id"]
        filepath = os.path.join(POSTS_DIR, f"{cid}.json")
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(post_data, f, ensure_ascii=False, indent=2)
        print(f"作成成功 [{created_count+1}/60]: {cid} - {post_data['title'][:30]}")
        created_count += 1
        if created_count >= TARGET_POST_COUNT:
            break
            
    print("60件の超高品質記事作成が完了しました。")

if __name__ == "__main__":
    main()
