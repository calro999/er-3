
def call_groq_api(prompt, system_content="You are a helpful assistant.", model="llama-3.3-70b-versatile"):
    groq_key = os.environ.get("GROQ_API_KEY")
    if not groq_key:
        return None
    url = "https://api.groq.com/openai/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {groq_key}",
        "Content-Type": "application/json"
    }
    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": system_content},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.7
    }
    try:
        res = requests.post(url, headers=headers, json=payload, timeout=30)
        if res.status_code == 200:
            return res.json()["choices"][0]["message"]["content"].strip()
    except Exception as e:
        print(f"Groq API error: {e}")
    return None

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
    
    github_token = os.environ.get("GITHUB_TOKEN") or os.environ.get("GH_TOKEN")
    if github_token:
        try:
            res = requests.post(
                "https://models.inference.ai.azure.com/chat/completions",
                headers={
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {github_token}"
                },
                json={
                    "messages": [
                        {"role": "system", "content": system_message},
                        {"role": "user", "content": prompt}
                    ],
                    "model": "gpt-4o-mini"
                },
                timeout=15
            )
            if res.status_code == 200:
                short_title = res.json()["choices"][0]["message"]["content"].strip().replace('"', '').replace("「", "").replace("」", "").replace("【", "").replace("】", "")
                if 0 < len(short_title) < 65:
                    return short_title
        except Exception:
            pass

    clean_t = re.sub(r'【.*?】|\[.*?\]|（.*?）|\(.*?\)', '', original_title).strip()
    if len(clean_t) > 50:
        clean_t = clean_t[:50].rsplit(' ', 1)[0]
    return clean_t if clean_t else original_title[:50]
        
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
