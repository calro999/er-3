import os
import json
import requests

KEY = "c0h8f4d5e9a6b3c2d7e0f1a5b8c9d0e6"
HOST = "er-3.pages.dev"
URL_LIST = [f"https://{HOST}/", f"https://{HOST}/ranking"]

POSTS_DIR = "src/data/posts"
if os.path.exists(POSTS_DIR):
    for f in os.listdir(POSTS_DIR):
        if f.endswith('.json'):
            try:
                with open(os.path.join(POSTS_DIR, f), 'r', encoding='utf-8') as file:
                    data = json.load(file)
                    if data.get('id'):
                        URL_LIST.append(f"https://{HOST}/posts/{data['id']}")
            except:
                pass

payload = {
    "host": HOST,
    "key": KEY,
    "keyLocation": f"https://{HOST}/{KEY}.txt",
    "urlList": URL_LIST
}

print(f"Submitting {len(URL_LIST)} URLs to IndexNow (Bing/Yahoo/Yandex)...")
try:
    response = requests.post("https://api.indexnow.org/indexnow", json=payload)
    print(f"Status Code: {response.status_code}")
    if response.status_code == 200:
        print("Success! URLs have been submitted to IndexNow.")
    else:
        print(f"Error: {response.text}")
except Exception as e:
    print(f"Failed to submit: {e}")
