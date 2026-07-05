import re

def generate_hinban(content_id):
    if not content_id:
        return ""
    s = content_id.lower()
    s = re.sub(r'^(h_\d+|h_|\d+)', '', s)
    match = re.match(r'^([a-z]+)(\d+)', s)
    if match:
        alphabetic = match.group(1).upper()
        numeric = match.group(2)
        clean_num = numeric.lstrip('0')
        if not clean_num:
            clean_num = '0'
        formatted_standard = f"{alphabetic}-{numeric}"
        if clean_num != numeric:
            formatted_clean = f"{alphabetic}-{clean_num}"
            return f"{formatted_clean} ({formatted_standard})"
        return formatted_standard
    return content_id.upper()

import os, random, requests, time, json, re

CACHE_FILE = "posted_cache.txt"
POSTS_DIR = "src/data/posts"
API_ID = "4Lx0ftRf17Uuad6Ud7Gb"
API_AFFILIATE_ID = "onchan555-999"
LINK_AFFILIATE_ID = "onchan555-008"
TARGET_POST_COUNT = 20

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
    kws = ["コスプレ", "制服", "女子高生", "人気", "話題作", "美少女", "独占", "高画質", "人妻", "巨乳", "美脚", "ギャル"]
    url = "https://api.dmm.com/affiliate/v3/ItemList"
    all_items = []
    for kw in kws:
        p = {
            "api_id": API_ID,
            "affiliate_id": API_AFFILIATE_ID,
            "site": "FANZA",
            "service": "digital",
            "floor": "videoa",
            "sort": "rank",
            "offset": random.randint(1, 8),
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
        time.sleep(0.2)
        
    seen = set(); uniq = []
    ex = ["熟女", "おばさん", "五十路", "四十路", "六十路", "熟年", "マダム", "高齢", "ババ", "ニューハーフ", "レディーボーイ", "男の娘", "ゲイ"]
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

def generate_custom_seo_article(item, idx):
    title = item.get("title", "")
    comment = clean_for_safety(item.get("comment", ""))
    genres = [g.get("name", "") for g in item.get("iteminfo", {}).get("genre", [])]
    actresses = [a.get("name", "") for a in item.get("iteminfo", {}).get("actress", [])]
    maker_info = item.get("iteminfo", {}).get("maker")
    maker = maker_info[0].get("name", "") if maker_info else "大人気メーカー"
    cid = item.get("content_id", "")
    
    actress_str = "、".join(actresses) if actresses else "注目の主演女優"
    genre_str = "、".join(genres[:4]) if genres else "人気ジャンル"
    
    # 作品ごとにバリエーション豊かな切り口で記事を動的生成（完全な個別記事化）
    lines = []
    
    # バリエーションパターン（インデックス等により切り口を変える）
    pattern = idx % 4
    
    if pattern == 0:
        lines.append(f"<h2>【見どころ熱血レビュー】話題騒然！『{title}』の魅力に迫る</h2>")
        lines.append(f"<p>数ある新作の中でも一際異彩を放ち、ファンから熱狂的な支持を集めているのが<strong>『{title}』</strong>（{maker}）です。主演の【{actress_str}】が魅せる圧倒的なパフォーマンスと、{genre_str}のテーマが見事に組み合わさった傑作です。</p>")
        if comment:
            lines.append("<h2>ドラマ・あらすじのハイライト</h2>")
            lines.append(f"<blockquote style='background: #f8fafc; padding: 16px; border-left: 4px solid #f43f5e; margin: 16px 0; color: #334155;'><p>{comment}</p></blockquote>")
            lines.append(f"<p>設定の緻密さと登場人物の感情の機微が丁寧に表現されており、観る者を飽きさせない緊張感が最後まで持続します。</p>")
        lines.append("<h2>視聴者を魅了する3つの核心ポイント</h2>")
        lines.append("<ul style='list-style-type: disc; padding-left: 20px; margin: 16px 0;'>")
        lines.append(f"<li style='margin-bottom: 8px;'><strong>主演・{actress_str}のリアルな情熱：</strong> 画面から伝わる吐息や視線がとにかく刺激的です。</li>")
        lines.append(f"<li style='margin-bottom: 8px;'><strong>こだわり抜かれた世界観：</strong> {genre_str}ファンが求める最高の展開を徹底追求。</li>")
        lines.append("<li style='margin-bottom: 8px;'><strong>映像美とクオリティ：</strong> 音声・アングルともに最高水準で制作されています。</li>")
        lines.append("</ul>")
        lines.append("<h2>総評とおすすめ度</h2>")
        lines.append(f"<p>満足度非常に高く、{actress_str}の代表作として長く語り継がれるべき作品です。</p>")
        lines.append(f"<h2>まとめ：『{title}』は今すぐチェックすべき至高の一本</h2>")
        lines.append(f"<p>気になっている方は、ぜひ今すぐ本編の圧倒的な世界観を体感してください！</p>")
        
    elif pattern == 1:
        lines.append(f"<h2>【徹底考察】ファン必見の最高峰ドラマ『{title}』を徹底解剖</h2>")
        lines.append(f"<p>今回ご紹介するのは、圧倒的な完成度で話題を呼んでいる<strong>『{title}』</strong>。{maker}が自信を持って送り出す本作は、主演【{actress_str}】の持つ潜在的な魅力を最大限に引き出した注目作です。</p>")
        if comment:
            lines.append("<h2>ストーリー展開と世界観</h2>")
            lines.append(f"<blockquote style='background: #f8fafc; padding: 16px; border-left: 4px solid #3b82f6; margin: 16px 0; color: #334155;'><p>{comment}</p></blockquote>")
            lines.append(f"<p>ただの官能描写に留まらず、ストーリーとしての引き込みの強さが本作の真骨頂と言えます。</p>")
        lines.append("<h2>見逃厳禁のハイライト場面</h2>")
        lines.append("<ul style='list-style-type: circle; padding-left: 20px; margin: 16px 0;'>")
        lines.append(f"<li style='margin-bottom: 8px;'><strong>表情の変化と表現力：</strong> {actress_str}の無邪気さと妖艶さのギャップが素晴らしい。</li>")
        lines.append(f"<li style='margin-bottom: 8px;'><strong>{genre_str}の真髄：</strong> 期待を裏切らない怒涛の展開に大満足。</li>")
        lines.append("</ul>")
        lines.append("<h2>ファンからの評価と口コミ</h2>")
        lines.append(f"<p>SNSやレビュー掲示板でも「リピート必至」「{actress_str}の演技が光っている」と高評価が続出しています。</p>")
        lines.append(f"<h2>まとめ：『{title}』は絶対に見逃せない傑作</h2>")
        lines.append(f"<p>一度見始めたら止まらない極上の映像体験を、ぜひお手元でお楽しみください。</p>")
        
    elif pattern == 2:
        lines.append(f"<h2>【SEO特化レビュー】『{title}』が選ばれる理由と作品の全貌</h2>")
        lines.append(f"<p>今期最も注目を集めているタイトルの一つ、<strong>『{title}』</strong>。トップレーベル{maker}と名女優【{actress_str}】のタッグが実現した、まさに奇跡のような一本です。</p>")
        if comment:
            lines.append("<h2>公式が語る作品の背景</h2>")
            lines.append(f"<blockquote style='background: #f8fafc; padding: 16px; border-left: 4px solid #10b981; margin: 16px 0; color: #334155;'><p>{comment}</p></blockquote>")
            lines.append(f"<p>このあらすじ通り、臨場感あふれるカメラワークで余すところなく描写されています。</p>")
        lines.append("<h2>本作が提示する新しい楽しみ方</h2>")
        lines.append("<ol style='padding-left: 20px; margin: 16px 0;'>")
        lines.append(f"<li style='margin-bottom: 8px;'>{actress_str}の息遣いまで感じられる圧倒的な至近距離カット。</li>")
        lines.append(f"<li style='margin-bottom: 8px;'>{genre_str}好きには堪らない洗練された演出美。</li>")
        lines.append("</ol>")
        lines.append("<h2>結論：今すぐ見るべき理由</h2>")
        lines.append(f"<p>『{title}』は期待以上のクオリティと感動を届けてくれる間違いのない作品です。</p>")
        lines.append(f"<h2>まとめ：『{title}』の配信を今すぐチェック</h2>")
        lines.append(f"<p>ぜひ公式配信ページで、その目でお確かめください！</p>")
        
    else:
        lines.append(f"<h2>【決定版レビュー】『{title}』の魅力と視聴ポイント解説</h2>")
        lines.append(f"<p>本日の注目作品は、口コミで急速に評価を高めている<strong>『{title}』</strong>（{maker}）。{actress_str}が魅せる可憐で刺激的な姿に、誰もが心を奪われることでしょう。</p>")
        if comment:
            lines.append("<h2>物語のあらすじと見どころ</h2>")
            lines.append(f"<blockquote style='background: #f8fafc; padding: 16px; border-left: 4px solid #8b5cf6; margin: 16px 0; color: #334155;'><p>{comment}</p></blockquote>")
            lines.append(f"<p>{genre_str}の醍醐味が凝縮された素晴らしい構成です。</p>")
        lines.append("<h2>ユーザーの口コミとおすすめポイント</h2>")
        lines.append(f"<p>視聴者からは「{actress_str}の表情に引き込まれた」「{maker}のこだわりを感じる」との声多数。</p>")
        lines.append(f"<h2>まとめ：『{title}』鑑賞のトリセツ</h2>")
        lines.append(f"<p>最高レベルの満足感を味わえる『{title}』を、今すぐご堪能ください！</p>")
        
    article_body = "\n".join(lines)
    
    # 画像リンク処理
    imgs = item.get("imageURL", {})
    large_img = imgs.get("large", "")
    list_img = imgs.get("list", "")
    img_url = large_img if large_img else list_img
    
    # サンプル画像取得
    sample_imgs = []
    sample_data = item.get("sampleImageURL", {})
    if sample_data and "sample_l" in sample_data and "image" in sample_data["sample_l"]:
        sample_imgs = sample_data["sample_l"]["image"][:5]
        
    # アフィリエイトURL
    aff_url = item.get("affiliateURL", "")
    if LINK_AFFILIATE_ID and aff_url:
        aff_url = re.sub(r"affiliate_id=[^&]+", f"affiliate_id={LINK_AFFILIATE_ID}", aff_url)
        
    # タグ・ラベル
    labels = genres[:5]
    if actresses:
        labels.extend(actresses)
    labels.append(maker)
    
    return {
        "id": cid,
        "hinban": generate_hinban(cid),
        "title": title,
        "review": article_body,
        "image": img_url,
        "sample_images": sample_imgs,
        "affiliate_url": aff_url,
        "genres": genres,
        "actresses": actresses,
        "maker": maker,
        "date": time.strftime("%Y-%m-%d"),
        "labels": list(set(labels))
    }

def main():
    print("SEO特化記事20件の作成を開始します...")
    items = fetch_fanza_items()
    print(f"取得できた作品数: {len(items)}")
    
    os.makedirs(POSTS_DIR, exist_ok=True)
    
    # 既存の古いpostsファイルをクリア
    for old_f in os.listdir(POSTS_DIR):
        if old_f.endswith(".json"):
            os.remove(os.path.join(POSTS_DIR, old_f))
            
    created_count = 0
    for idx, item in enumerate(items):
        post_data = generate_custom_seo_article(item, idx)
        cid = post_data["id"]
        filepath = os.path.join(POSTS_DIR, f"{cid}.json")
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(post_data, f, ensure_ascii=False, indent=2)
        print(f"作成成功 [{created_count+1}/20]: {cid} - {post_data['title'][:30]}")
        created_count += 1
        if created_count >= TARGET_POST_COUNT:
            break
            
    print("20件の記事作成が完了しました。")

if __name__ == "__main__":
    main()
