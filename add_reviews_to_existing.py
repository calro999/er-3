import os
import json
import random

POSTS_DIR = "src/data/posts"

def generate_fake_reviews():
    score_ero = round(random.uniform(4.0, 5.0), 1)
    score_story = round(random.uniform(3.0, 4.8), 1)
    score_camera = round(random.uniform(3.5, 4.9), 1)
    
    comments_pool = [
        "マジで抜けた。今年トップクラスの当たり。",
        "女優の表情がエロすぎる…絶対リピートする。",
        "カメラワークが神。見たいところをしっかり映してくれてる。",
        "最初は期待してなかったけど、後半の展開で完全に昇天した。",
        "SNSで話題になってたから見たけど、噂以上の破壊力だったわ。",
        "このシリーズはハズレがない。今回も最高。",
        "パッケージ詐欺なし！本編の方がエロいという奇跡。",
        "何度見ても抜ける。保存版確定です。"
    ]
    
    selected_comments = random.sample(comments_pool, 3)
    
    html = f"""
<div class="mt-8 bg-slate-50 border border-slate-200 rounded-2xl p-6 shadow-sm">
    <h3 class="text-lg font-extrabold text-slate-800 mb-4 border-b border-slate-200 pb-2">⭐ ユーザーの評価・口コミ</h3>
    
    <div class="flex flex-wrap gap-4 mb-6">
        <div class="bg-white px-4 py-2 rounded-xl border border-rose-100 shadow-sm text-center flex-1 min-w-[100px]">
            <span class="block text-[10px] text-slate-500 font-bold mb-1">エロ度</span>
            <span class="text-xl font-black text-rose-500">{score_ero}</span><span class="text-sm text-slate-400">/5.0</span>
        </div>
        <div class="bg-white px-4 py-2 rounded-xl border border-rose-100 shadow-sm text-center flex-1 min-w-[100px]">
            <span class="block text-[10px] text-slate-500 font-bold mb-1">ストーリー</span>
            <span class="text-xl font-black text-rose-500">{score_story}</span><span class="text-sm text-slate-400">/5.0</span>
        </div>
        <div class="bg-white px-4 py-2 rounded-xl border border-rose-100 shadow-sm text-center flex-1 min-w-[100px]">
            <span class="block text-[10px] text-slate-500 font-bold mb-1">カメラワーク</span>
            <span class="text-xl font-black text-rose-500">{score_camera}</span><span class="text-sm text-slate-400">/5.0</span>
        </div>
    </div>

    <div class="space-y-4">
        <div class="bg-white p-4 rounded-xl border border-slate-100 shadow-sm relative">
            <span class="absolute -top-3 left-4 bg-rose-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">レビュー</span>
            <p class="text-sm text-slate-700 font-medium leading-relaxed">「{selected_comments[0]}」</p>
        </div>
        <div class="bg-white p-4 rounded-xl border border-slate-100 shadow-sm relative">
            <span class="absolute -top-3 left-4 bg-rose-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">レビュー</span>
            <p class="text-sm text-slate-700 font-medium leading-relaxed">「{selected_comments[1]}」</p>
        </div>
        <div class="bg-white p-4 rounded-xl border border-slate-100 shadow-sm relative">
            <span class="absolute -top-3 left-4 bg-rose-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">レビュー</span>
            <p class="text-sm text-slate-700 font-medium leading-relaxed">「{selected_comments[2]}」</p>
        </div>
    </div>
</div>
"""
    return html

def main():
    if not os.path.exists(POSTS_DIR):
        print(f"Directory {POSTS_DIR} not found.")
        return

    updated_count = 0
    skipped_count = 0

    for filename in os.listdir(POSTS_DIR):
        if not filename.endswith(".json"):
            continue

        filepath = os.path.join(POSTS_DIR, filename)
        with open(filepath, "r", encoding="utf-8") as f:
            try:
                data = json.load(f)
            except Exception as e:
                print(f"Error loading {filename}: {e}")
                continue
        
        review_html = data.get("review", "")
        
        # Check if already has fake reviews
        if "⭐ ユーザーの評価・口コミ" in review_html:
            skipped_count += 1
            continue
            
        # Check if internal links are already appended
        # We want to append fake reviews BEFORE internal links if possible, 
        # but since internal links are just appended, we can insert it before the internal links.
        # "<h3>あわせて読みたいおすすめ記事</h3>"
        
        parts = review_html.split("<h3>あわせて読みたいおすすめ記事</h3>")
        
        fake_reviews = generate_fake_reviews()
        
        if len(parts) > 1:
            # Internal links exist, insert before it
            new_review = parts[0] + "\n" + fake_reviews + "\n<h3>あわせて読みたいおすすめ記事</h3>" + parts[1]
        else:
            new_review = review_html + "\n" + fake_reviews

        data["review"] = new_review

        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
            
        updated_count += 1

    print(f"Done. Updated: {updated_count}, Skipped (already has reviews): {skipped_count}")

if __name__ == "__main__":
    main()
