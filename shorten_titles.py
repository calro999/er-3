import os
import json
import glob
import requests
import time
import re

POSTS_DIR = "src/data/posts"
MAX_LENGTH = 50 # 50文字を超えるものをリライト対象とする

def shorten_title_with_llm(original_title):
    prompt = f"""以下の長すぎるアダルトビデオ作品のタイトルを、SEOに最適化されたクリックしたくなるキャッチーなタイトルに要約してください。

【元のタイトル】
{original_title}

【ルール】
1. 文字数は必ず「30〜45文字以内」に収めてください。
2. 女優名（含まれている場合）や重要なシチュエーション（不倫、ネトラレなど）のキーワードは残してください。
3. 途中で「...」にならないよう、文章をきれいに完結させてください。
4. ポルノ的なNGワードは避け、「背徳」「禁断」「秘密」などのマイルドで妄想を掻き立てる表現にしてください。
5. 出力は「要約されたタイトル」の文字列のみとしてください（余計な説明や記号、カギカッコは不要です）。
"""
    
    system_message = "あなたは優秀なSEOライターです。長すぎるタイトルを短く魅力的に要約します。"
    
    for attempt in range(2):
        try:
            print(f"  -> Requesting AI to shorten title...")
            response = requests.post(
                "https://text.pollinations.ai/",
                json={
                    "messages": [
                        {"role": "system", "content": system_message},
                        {"role": "user", "content": prompt}
                    ],
                    "model": "openai-fast" # 速度重視
                },
                timeout=20
            )
            if response.status_code == 200:
                short_title = response.text.strip().replace('"', '').replace("「", "").replace("」", "").replace("【", "").replace("】", "")
                # ある程度短くなっていれば採用
                if len(short_title) > 0 and len(short_title) < 65:
                    return short_title
        except Exception as e:
            print(f"  -> AI request failed: {e}")
        time.sleep(1)
        
    # AI失敗時は単純な切り詰め（女優名を末尾に残すなどの簡易処理）
    return (original_title[:45] + "...").replace("......", "...")

def process_titles():
    files = glob.glob(os.path.join(POSTS_DIR, "*.json"))
    fixed_count = 0
    
    print(f"Checking {len(files)} posts for long titles...")
    
    for file_path in files:
        with open(file_path, "r", encoding="utf-8") as f:
            try:
                data = json.load(f)
            except Exception as e:
                continue
                
        original_title = data.get("title", "")
        
        if len(original_title) > MAX_LENGTH:
            print(f"\n[Long Title Found] Length: {len(original_title)}")
            print(f"Old: {original_title}")
            
            new_title = shorten_title_with_llm(original_title)
            print(f"New: {new_title}")
            
            data["title"] = new_title
            with open(file_path, "w", encoding="utf-8") as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
                
            fixed_count += 1
            time.sleep(1) # API制限回避
            
    print(f"\nTotal titles shortened: {fixed_count}")

if __name__ == "__main__":
    process_titles()
