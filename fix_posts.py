import os
import json
import glob

POSTS_DIR = "src/data/posts"

def fix_posts():
    files = glob.glob(os.path.join(POSTS_DIR, "*.json"))
    fixed_count = 0
    
    new_fallback_review = """<h2>【殿堂入り確実】この展開はヤバすぎる…！今すぐ見るべき超話題作</h2>
<p>日常のすぐ裏側に潜むスリリングな関係を描いた、本能を揺さぶる傑作が登場しました。</p>
<h3>マニアも納得の圧倒的なクオリティ</h3>
<p><strong>「日常が静かに、しかし劇的に崩壊していく感覚」</strong>をじっくりと味わえる本作。俳優陣の演技力はもちろん、シチュエーションの作り込みが段違いです。SNSや各レビューサイトでも「これは絶対に抜ける」「一度見たら忘れられない」と絶賛の嵐となっています。</p>
<h3>絶対に一度は見ておくべき究極のシチュエーション</h3>
<p>単なる映像作品の枠を超え、あなたの妄想を極限まで刺激すること間違いなし。まだ見ていない方は、ぜひこの機会に究極のシチュエーションをお楽しみください。</p>"""

    for file_path in files:
        with open(file_path, "r", encoding="utf-8") as f:
            try:
                data = json.load(f)
            except Exception as e:
                print(f"Error parsing {file_path}: {e}")
                continue
                
        review = data.get("review", "")
        needs_fix = False
        
        # 韓国語混じりや古いフォールバック
        if "확実" in review or "<h3>【殿堂入り" in review:
            needs_fix = True
            
        # 短すぎる記事（150文字未満など）
        elif len(review) < 150:
            needs_fix = True
            
        if needs_fix:
            print(f"Fixing low quality post: {file_path} (length: {len(review)})")
            data["review"] = new_fallback_review
            with open(file_path, "w", encoding="utf-8") as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
            fixed_count += 1
            
    print(f"Total fixed posts: {fixed_count}")

if __name__ == "__main__":
    fix_posts()
