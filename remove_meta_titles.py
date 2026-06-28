import os
import json
import glob

POSTS_DIR = "src/data/posts"

def remove_meta_titles():
    files = glob.glob(os.path.join(POSTS_DIR, "*.json"))
    fixed_count = 0
    
    for file_path in files:
        with open(file_path, "r", encoding="utf-8") as f:
            try:
                data = json.load(f)
            except Exception as e:
                print(f"Error parsing {file_path}: {e}")
                continue
                
        original_title = data.get("title", "")
        new_title = original_title
        
        # 悪目立ちするプレフィックスを削除
        prefixes_to_remove = [
            "【絶対必見・キラー記事】 ",
            "【2026年最新・超話題作】 ",
            "【超ド級の背徳感】 "
        ]
        
        for prefix in prefixes_to_remove:
            if new_title.startswith(prefix):
                new_title = new_title.replace(prefix, "", 1)
                
        # labelsからの不要なメタタグ削除
        labels = data.get("labels", [])
        bad_labels = ["キラー記事", "最強コンテンツ", "絶対抜ける"]
        new_labels = [l for l in labels if l not in bad_labels]
                
        if original_title != new_title or labels != new_labels:
            data["title"] = new_title
            data["labels"] = new_labels
            with open(file_path, "w", encoding="utf-8") as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
            print(f"Fixed title/labels in {file_path}: {new_title}")
            fixed_count += 1
            
    print(f"Total fixed posts: {fixed_count}")

if __name__ == "__main__":
    remove_meta_titles()
