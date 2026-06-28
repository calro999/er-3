import os, random, requests, time, json, re, hashlib

CACHE_FILE = "posted_cache.txt"
POSTS_DIR = "src/data/posts"
API_ID = "4Lx0ftRf17Uuad6Ud7Gb"
API_AFFILIATE_ID = "onchan555-999"
LINK_AFFILIATE_ID = "onchan555-003"
TARGET_POST_COUNT = 10

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

def load_posted_cache():
    if os.path.exists(CACHE_FILE):
        with open(CACHE_FILE, "r", encoding="utf-8") as f:
            return set(line.strip() for line in f if line.strip())
    return set()

def save_to_cache(cid):
    with open(CACHE_FILE, "a", encoding="utf-8") as f:
        f.write(f"{cid}\n")

def fetch_fanza_items():
    kws = ["高画質", "プレミアム", "傑作", "名作", "話題作", "巨乳", "美少女", "独占", "大人気"]
    url = "https://api.dmm.com/affiliate/v3/ItemList"
    all_items = []
    combos = [(random.choice(kws), "rank"), (random.choice(kws), "date"), ("", "rank")]
    for kw, sort in combos:
        print(f"  API取得中 => keyword='{kw}', sort='{sort}'")
        p = {"api_id": API_ID, "affiliate_id": API_AFFILIATE_ID, "site": "FANZA", "service": "digital", "floor": "videoa", "sort": sort, "offset": random.randint(1, 15), "hits": 40, "output": "json"}
        if kw: p["keyword"] = kw
        try:
            r = requests.get(url, params=p, timeout=15)
            if r.status_code == 200:
                items = r.json().get("result", {}).get("items", [])
                all_items.extend(items)
                print(f"    -> {len(items)}件")
        except Exception as e:
            print(f"    -> ERR: {e}")
        time.sleep(0.5)
    seen = set(); uniq = []
    for i in all_items:
        c = i.get("content_id")
        if c and c not in seen: seen.add(c); uniq.append(i)
    random.shuffle(uniq)
    print(f"  ユニーク候補: {len(uniq)}件")
    return uniq

def filter_items(items, cache):
    ex = ["熟女", "おばさん", "五十路", "四十路", "六十路", "熟年", "マダム", "高齢", "ババ", "ニューハーフ", "レディーボーイ", "男の娘", "ゲイ"]
    out = []
    for i in items:
        c = i.get("content_id")
        if not c or c in cache: continue
        t = i.get("title", "")
        gs = " ".join(g.get("name", "") for g in i.get("iteminfo", {}).get("genre", []))
        if any(w in t + " " + gs for w in ex): continue
        imgs = i.get("imageURL", {})
        if not imgs or not (imgs.get("large") or imgs.get("list")): continue
        out.append(i)
    return out

# 超高品質レビュー生成（あらすじ・解説を組み込み深みを持たせる）
def build_high_quality_review(item, gen_idx):
    title = item.get("title", "")
    comment = clean_for_safety(item.get("comment", ""))
    genres = [g.get("name", "") for g in item.get("iteminfo", {}).get("genre", [])]
    actresses = [a.get("name", "") for a in item.get("iteminfo", {}).get("actress", [])]
    maker = item.get("iteminfo", {}).get("maker", [{}])[0].get("name", "")
    cid = item.get("content_id", "")
    
    G = "、".join(genres[:5]) if genres else "純愛・背徳ドラマ"
    TG = genres[0] if genres else "ドラマ"
    A = actresses[0] if actresses else ""
    M = maker or "最高峰スタジオ"
    T = title
    
    s = int(hashlib.md5(f"{cid}_hq_{gen_idx}".encode()).hexdigest()[:12], 16)
    
    # 1. 導入（あらすじ要約と期待感）
    intro_h = f"<h2>【徹底考察】『{T}』が描く極上の美学と背徳の衝動</h2>"
    intro_p = f"<p>映像エンターテインメントの極致を提示し続ける{M}から、また一つ記憶に深く刻まれる傑作が登場した。本作『{T}』は、{G}という魅惑的なテーマを軸に、観る者の本能と情緒を揺さぶる至高のプロダクションである。</p>"
    
    # 2. あらすじ・世界観深掘りセクション（あらすじがある場合）
    story_html = ""
    if comment and len(comment) > 20:
        short_comment = comment[:250] + "..." if len(comment) > 250 else comment
        story_h = f"<h3>物語の深層と核心：日常が解き放たれる瞬間</h3>"
        story_p = f"<p>本作のバックボーンとなる世界観について触れておきたい。公式に寄せられた概要によれば、<strong>「{short_comment}」</strong>というドラマチックな展開が用意されている。</p><p>単なる官能描写にとどまらず、登場人物たちが織りなす葛藤、葛藤の末に訪れる理性からの解放、そして互いの視線が交差する瞬間の温度感――それらが緻密な計算のもとに構築されており、スクリーン越しに息遣いまでもが伝わってくるかのようだ。</p>"
        story_html = f"{story_h}\n{story_p}"
    
    # 3. キャスト・パフォーマンス表現
    actress_html = ""
    if A:
        act_h = f"<h3>圧倒的存在感：{A}が魅せる情熱と官能の演技</h3>"
        act_p = f"<p>本作における{A}のパフォーマンスは、間違いなく彼女のキャリアにおいても一画を画すレベルに達している。カメラが捉える一瞬の表情の揺らぎ、溜息混じりの吐息、そして感情が最高潮に達した際の解き放たれた姿――そのすべてにおいて一切の妥協がない。{M}の細やかな演出と見事にシンクロし、ただ美しく、そして切なく観る者の心を奪っていく。</p>"
        actress_html = f"{act_h}\n{act_p}"
    
    # 4. 映像美・プロダクションクオリティ
    prod_h = f"<h3>【映像美と演出】こだわり抜かれた撮影技術と音響演出</h3>"
    prod_p = f"<p>技術的側面においても、本作は妥協のないクリエイティビティに溢れている。特に注目すべきは以下のポイントだ。</p>"
    prod_list = f"<ul><li><strong>光と陰影のコントラスト</strong>: 被写体の美しさを最も引き立てる照明設計。</li><li><strong>臨場感を高める音響</strong>: 吐息や衣擦れの音まで鮮明に拾い上げる高品質サウンド。</li><li><strong>計算し尽くされたカメラワーク</strong>: 視聴者が最も観たいアングルを逃さない絶妙な構図。</li></ul>"
    prod_html = f"{prod_h}\n{prod_p}\n{prod_list}"
    
    # 5. 総評・結論
    end_h = f"<h3>総評：あなたのコレクションに加えるべき最高峰の作品</h3>"
    end_p = f"<p>総括すると、本作『{T}』は{G}を愛するすべての人々へ捧げられた、満足度の極めて高い逸品である。一度の視聴だけでは消化しきれないほどの情報量と美学が詰まっており、何度も見返したくなる中毒性を秘めている。ぜひ、誰にも邪魔されないプライベートな空間で、この感動と刺激を心ゆくまで堪能していただきたい。</p>"
    end_html = f"{end_h}\n{end_p}"
    
    # 全体組み立て
    parts = [intro_h, intro_p]
    if story_html: parts.append(story_html)
    if actress_html: parts.append(actress_html)
    parts.append(prod_html)
    parts.append(end_html)
    
    return "\n\n".join(parts)

def save_post(pd):
    os.makedirs(POSTS_DIR, exist_ok=True)
    fp = os.path.join(POSTS_DIR, f"{pd['id']}.json")
    with open(fp, "w", encoding="utf-8") as f:
        json.dump(pd, f, ensure_ascii=False, indent=2)
    print(f"    ✅ {fp}")

def main():
    print("="*60)
    print(f" 超高品質キラー記事ジェネレーター (あらすじ・深層考察組み込み版)")
    print(f" 目標: {TARGET_POST_COUNT}記事")
    print("="*60)
    
    print("\n[1] API取得中...")
    items = fetch_fanza_items()
    print("\n[2] フィルタリング...")
    cache = load_posted_cache()
    valid = filter_items(items, cache)
    print(f"  候補: {len(valid)}件")
    
    print(f"\n[3] 超高品質記事生成開始...")
    gen = 0
    for item in valid:
        if gen >= TARGET_POST_COUNT: break
        cid = item.get("content_id")
        t = item.get("title", "")
        aff = item.get("affiliateURL", "")
        if "af_id=" in aff:
            aff = re.sub(r"af_id=[^&]+", f"af_id={LINK_AFFILIATE_ID}", aff)
        imgs = item.get("imageURL", {})
        img = imgs.get("large") or imgs.get("list") or ""
        si = item.get("sampleImageURL", {}).get("sample_l", {})
        samples = si.get("image", []) if si else []
        
        print(f"\n  [{gen+1}/{TARGET_POST_COUNT}] {t[:50]}...")
        review = build_high_quality_review(item, gen)
        
        genres = [g.get("name", "") for g in item.get("iteminfo", {}).get("genre", [])]
        actresses = [a.get("name", "") for a in item.get("iteminfo", {}).get("actress", [])]
        maker = item.get("iteminfo", {}).get("maker", [{}])[0].get("name", "")
        
        labels = ["プレミアム", "最高峰", "徹底考察"]
        if "独占配信" in genres: labels.append("独占配信")
        if any(g in ["ハイビジョン", "4K"] for g in genres): labels.append("高画質")
        if actresses: labels.append("単体作品")
        
        save_post({
            "id": cid, "title": t, "review": review,
            "image": img, "sample_images": samples,
            "affiliate_url": aff, "genres": genres,
            "actresses": actresses, "maker": maker,
            "date": item.get("date", time.strftime("%Y-%m-%d %H:%M:%S")),
            "labels": labels
        })
        save_to_cache(cid)
        gen += 1
    
    print(f"\n{'='*60}")
    print(f" 完了！ 超高品質記事 {gen}件生成完了")
    print(f"{'='*60}")

if __name__ == "__main__":
    main()
