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

import os, random, requests, time, json, re, hashlib

CACHE_FILE = "posted_cache.txt"
POSTS_DIR = "src/data/posts"
API_ID = "4Lx0ftRf17Uuad6Ud7Gb"
API_AFFILIATE_ID = "onchan555-999"
LINK_AFFILIATE_ID = "onchan555-003"
TARGET_POST_COUNT = 10

def load_posted_cache():
    if os.path.exists(CACHE_FILE):
        with open(CACHE_FILE, "r", encoding="utf-8") as f:
            return set(line.strip() for line in f if line.strip())
    return set()

def save_to_cache(cid):
    with open(CACHE_FILE, "a", encoding="utf-8") as f:
        f.write(f"{cid}\n")

def fetch_fanza_items():
    # er-3特化ジャンル：コスプレ、制服、学園、フェティシズム
    kws = [
        "コスプレ", "メイド", "レースクイーン", "制服", "女子高生",
        "ナース", "教頭 先生", "マネージャー", "部活", "保健室",
        "パンスト", "タイツ", "水着", "電マ", "バイブ", "拘束"
    ]
    url = "https://api.dmm.com/affiliate/v3/ItemList"
    all_items = []
    combos = [(random.choice(kws), "rank"), (random.choice(kws), "date"), (random.choice(kws), "rank"), ("", "rank")]
    for kw, sort in combos:
        print(f"  API => kw='{kw}', sort='{sort}'")
        p = {"api_id": API_ID, "affiliate_id": API_AFFILIATE_ID, "site": "FANZA", "service": "digital", "floor": "videoa", "sort": sort, "offset": random.randint(1, 10), "hits": 40, "output": "json"}
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
    # 熟女・ニューハーフ等の絶対禁止ワード
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

H2_HEADS = [
    "『{T}』を見逃してはいけない", "『{T}』に引きずり込まれた話", "あなたが次に見るべき作品はこれだ ―『{T}』",
    "配信開始から目が離せない ―『{T}』", "『{T}』― なぜこれほど話題なのか", "刺さる人には深く刺さる ―『{T}』",
    "これを見ずに何を見る ―『{T}』", "『{T}』レビュー ― 率直に書く", "本棚に並べておきたい一本 ―『{T}』",
    "『{T}』に見る{M}の底力", "今期の台風の目 ―『{T}』", "気づいたら最後まで見ていた ―『{T}』",
    "期待値を超えてきた ―『{T}』", "『{T}』― 地味に最強の一本", "繰り返し見たくなる ―『{T}』の中毒性"
]
H2_BODIES = [
    "数ある新作の中から手を止めてチェックする価値があるタイトルは限られる。{M}が送り出したこの一本は間違いなくその中に入る。{G}という構成で組み上げられた映像は、最初の数分で「これは違う」と直感させる密度がある。",
    "正直、タイトルを見た時点では半信半疑だった。しかし再生ボタンを押した瞬間にその疑念は吹き飛んだ。{M}制作という安心感もあるが、映像そのものが持つ引力が強い。{G}の要素を扱いながら既視感がまるでない。",
    "膨大なラインナップの海で溺れかけている人に朗報だ。{M}から出たこの作品を選べばいい。{G}をテーマに据えながらも独自路線を突き進んでいる。"
]
ACT_HEADS = ["{A}という選択", "{A}の仕事ぶり", "{A}に注目すべき理由", "{A}が作品を支えている", "今作の{A}は一味違う"]
ACT_BODIES = [
    "画面に映った瞬間から空気が変わる。仕草の一つひとつに無駄がなく、レンズの前で生きている。演技ではなく「存在している」という表現が正確だ。",
    "ここまで作品の色を決定づけるとは思わなかった。持ち味である自然体の表情がシーンごとに変化していく様は飽きない。{M}との相性も抜群だ。"
]
GNR_HEADS = ["{TG}を軸にした構成力", "ジャンルの垣根を超えた仕上がり", "なぜ{TG}好きに刺さるのか", "{G}の掛け合わせが絶妙"]
GNR_BODIES = [
    "{G}という要素が重なり合うことで単独では出せない化学反応が生まれている。特に{TG}の扱い方が巧い。ありがちなパターンに落とし込まず独自の切り口で見せてくる。",
    "タグだけ見ると想像がつくかもしれない。だが実際の映像はその想像を軽々と飛び越える。各要素がバラバラではなく一本の流れに溶け込んでいる。"
]
PRD_HEADS = ["{M}の仕事を見る", "映像設計の話", "音の設計にこそ注目してほしい", "テンポの良さは編集の賜物"]
PRD_BODIES = [
    "画質、音、編集。三拍子揃っていると言えるタイトルは案外少ない。本作は三つとも高水準だ。映像に安っぽさが一切ない。",
    "画面のどこを切り取っても構図が成立している。色温度の使い分けも巧みで場面の空気が色で語られている。"
]
END_HEADS = ["結びに", "この作品について、最後に", "端的に言えば", "閉めの言葉", "要するに"]
END_BODIES = [
    "『{T}』はジャンルの看板に甘えない作品だ。{G}という枠組みを超えた完成度で見る側の期待を上回ってくる。手元に残しておく価値がある。",
    "書き始めると止まらなくなるタイプの作品だ。究極的には自分の目で確かめてもらうのが一番早い。『{T}』は見た人間を裏切らない。"
]

def build_review(item, gen_idx):
    title = item.get("title", "")
    genres = [g.get("name", "") for g in item.get("iteminfo", {}).get("genre", [])]
    actresses = [a.get("name", "") for a in item.get("iteminfo", {}).get("actress", [])]
    maker = item.get("iteminfo", {}).get("maker", [{}])[0].get("name", "")
    cid = item.get("content_id", "")
    
    G = "、".join(genres[:5]) if genres else "コスプレ・特撮ドラマ"
    TG = genres[0] if genres else "コスプレ"
    A = actresses[0] if actresses else ""
    M = maker or "新鋭スタジオ"
    T = title
    
    s = int(hashlib.md5(f"{cid}_er3_{gen_idx}".encode()).hexdigest()[:12], 16)
    def fmt(tmpl): return tmpl.replace("{T}", T).replace("{M}", M).replace("{G}", G).replace("{TG}", TG).replace("{A}", A)
    
    h2 = f"<h2>{fmt(H2_HEADS[s % len(H2_HEADS)])}</h2>\n<p>{fmt(H2_BODIES[(s>>4)%len(H2_BODIES)])}</p>"
    parts = [h2]
    if A:
        parts.append(f"<h3>{fmt(ACT_HEADS[(s>>7)%len(ACT_HEADS)])}</h3>\n<p>{fmt(ACT_BODIES[(s>>10)%len(ACT_BODIES)])}</p>")
    parts.append(f"<h3>{fmt(GNR_HEADS[(s>>13)%len(GNR_HEADS)])}</h3>\n<p>{fmt(GNR_BODIES[(s>>16)%len(GNR_BODIES)])}</p>")
    parts.append(f"<h3>{fmt(PRD_HEADS[(s>>19)%len(PRD_HEADS)])}</h3>\n<p>{fmt(PRD_BODIES[(s>>22)%len(PRD_BODIES)])}</p>")
    parts.append(f"<h3>{fmt(END_HEADS[(s>>25)%len(END_HEADS)])}</h3>\n<p>{fmt(END_BODIES[(s>>28)%len(END_BODIES)])}</p>")
    return "\n\n".join(parts)

def save_post(pd):
    os.makedirs(POSTS_DIR, exist_ok=True)
    fp = os.path.join(POSTS_DIR, f"{pd['id']}.json")
    with open(fp, "w", encoding="utf-8") as f:
        json.dump(pd, f, ensure_ascii=False, indent=2)
    print(f"    ✅ {fp}")

def main():
    print("="*60)
    print(" er-3 新プロジェクト専用キラー記事ジェネレーター")
    print(f" ターゲット特化: コスプレ・学園・制服・フェティシズム")
    print(f" 目標: {TARGET_POST_COUNT}記事")
    print("="*60)
    
    print("\n[1] API取得中...")
    items = fetch_fanza_items()
    print("\n[2] フィルタリング...")
    cache = load_posted_cache()
    valid = filter_items(items, cache)
    print(f"  候補: {len(valid)}件")
    
    print("\n[3] 記事生成開始...")
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
        review = build_review(item, gen)
        
        genres = [g.get("name", "") for g in item.get("iteminfo", {}).get("genre", [])]
        actresses = [a.get("name", "") for a in item.get("iteminfo", {}).get("actress", [])]
        maker = item.get("iteminfo", {}).get("maker", [{}])[0].get("name", "")
        
        labels = ["er-3限定", "フェティッシュ", "コスプレ特化"]
        if "独占配信" in genres: labels.append("独占配信")
        if any(g in ["ハイビジョン", "4K"] for g in genres): labels.append("高画質")
        if actresses: labels.append("単体作品")
        
        save_post({
            "id": cid, "hinban": generate_hinban(cid), "title": t, "review": review,
            "image": img, "sample_images": samples,
            "affiliate_url": aff, "genres": genres,
            "actresses": actresses, "maker": maker,
            "date": item.get("date", time.strftime("%Y-%m-%d %H:%M:%S")),
            "labels": labels
        })
        save_to_cache(cid)
        gen += 1
    
    print(f"\n{'='*60}")
    print(f" 完了！ er-3用記事 {gen}件生成完了")
    print(f"{'='*60}")

if __name__ == "__main__":
    main()
