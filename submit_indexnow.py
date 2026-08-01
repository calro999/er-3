import os
import json
import requests

KEY = "c0h8f4d5e9a6b3c2d7e0f1a5b8c9d0e6"
HOST = "er-3.pages.dev"
BASE_URL = f"https://{HOST}"

URL_SET = {
    f"{BASE_URL}/",
    f"{BASE_URL}/ranking",
    f"{BASE_URL}/archives",
    f"{BASE_URL}/manga"
}

POSTS_DIR = "src/data/posts"
MANGA_DIR = "src/data/manga"

if os.path.exists(POSTS_DIR):
    for f in os.listdir(POSTS_DIR):
        if f.endswith('.json'):
            try:
                with open(os.path.join(POSTS_DIR, f), 'r', encoding='utf-8') as file:
                    data = json.load(file)
                    if data.get('id'):
                        URL_SET.add(f"{BASE_URL}/posts/{data['id']}")
                    for act in data.get('actresses', []):
                        if act:
                            URL_SET.add(f"{BASE_URL}/actress/{requests.utils.quote(act)}")
                    for g in data.get('genres', []):
                        if g:
                            URL_SET.add(f"{BASE_URL}/genre/{requests.utils.quote(g)}")
                    if data.get('maker'):
                        URL_SET.add(f"{BASE_URL}/maker/{requests.utils.quote(data['maker'])}")
            except Exception as e:
                pass

if os.path.exists(MANGA_DIR):
    for f in os.listdir(MANGA_DIR):
        if f.endswith('.json'):
            try:
                with open(os.path.join(MANGA_DIR, f), 'r', encoding='utf-8') as file:
                    data = json.load(file)
                    if data.get('id'):
                        URL_SET.add(f"{BASE_URL}/manga/{data['id']}")
            except Exception as e:
                pass

URL_LIST = list(URL_SET)
print(f"[er-3] Total target URLs collected: {len(URL_LIST)}")

INDEXNOW_ENDPOINTS = [
    "https://api.indexnow.org/indexnow",
    "https://www.bing.com/indexnow",
    "https://yandex.com/indexnow"
]

payload = {
    "host": HOST,
    "key": KEY,
    "keyLocation": f"{BASE_URL}/{KEY}.txt",
    "urlList": URL_LIST
}

print("\n--- Sending IndexNow Push Signals for er-3 ---")
for endpoint in INDEXNOW_ENDPOINTS:
    try:
        res = requests.post(endpoint, json=payload, timeout=30)
        print(f"[{endpoint}] Status: {res.status_code}")
    except Exception as e:
        print(f"Failed to connect to {endpoint}: {e}")

print("\n[er-3] All indexing signals dispatched successfully!")
