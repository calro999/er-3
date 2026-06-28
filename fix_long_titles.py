import os
import json
import glob
import re

POSTS_DIR = "src/data/posts"
MAX_LENGTH = 45

def shorten_title_smart(title):
    if len(title) <= MAX_LENGTH:
        return title
        
    # まず全角スペースや不要な記号で分割を試みる
    parts = re.split(r'[ 　！。！？\n]', title)
    
    new_title = ""
    for part in parts:
        if not part:
            continue
        if len(new_title) + len(part) + 1 <= MAX_LENGTH:
            if new_title:
                new_title += " " + part
            else:
                new_title = part
        else:
            break
            
    # それでも短すぎたりうまく分割できなかった場合は、単純に40文字で切って末尾に自然な言葉を補う
    if len(new_title) < 10:
        new_title = title[:40]
        # 変なところで切れないように最後の単語を削るなど
        last_space = max(new_title.rfind(' '), new_title.rfind('　'))
        if last_space > 20:
            new_title = new_title[:last_space]
            
    # 末尾を整える
    new_title = new_title.strip(' 　【】『』（）[]「」！？!?、。,-')
    return new_title + "【名作】" if len(new_title) > 0 else title[:MAX_LENGTH]

def fix_long_titles():
    files = glob.glob(os.path.join(POSTS_DIR, "*.json"))
    fixed_count = 0
    
    for file_path in files:
        with open(file_path, "r", encoding="utf-8") as f:
            try:
                data = json.load(f)
            except Exception as e:
                continue
                
        original_title = data.get("title", "")
        # 前回の「...」で終わってしまっているものもきれいに直す
        if original_title.endswith("..."):
            original_title = original_title.replace("...", "")
            
        if len(original_title) > MAX_LENGTH or "..." in original_title:
            new_title = shorten_title_smart(original_title)
            
            if new_title != original_title:
                print(f"Old: {original_title}\nNew: {new_title}\n---")
                data["title"] = new_title
                with open(file_path, "w", encoding="utf-8") as f:
                    json.dump(data, f, ensure_ascii=False, indent=2)
                fixed_count += 1
                
    print(f"Total titles fixed: {fixed_count}")

if __name__ == "__main__":
    fix_long_titles()
