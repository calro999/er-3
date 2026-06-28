# FANZAアフィリエイト自動投稿システム移行計画

FANZAアフィリエイトAPIから特定の「超ニッチジャンル（人妻・ネトラレ・背徳系）」の作品情報を取得し、LLMによって濃厚なレビュー記事を生成してBloggerへ自動投稿するシステムへと移行します。

## 必要な環境変数
以下の変数をGitHub Secretsまたは環境変数として用意します。
- `FANZA_AFFILIATE_ID`: DMMアフィリエイトID（例: `xxxxx-999`）
- `FANZA_API_ID`: DMM API ID
- `BLOGGER_BLOG_ID`: 投稿先のBloggerブログID
- `BLOGGER_SESSION_B64`: BloggerのPlaywrightセッション情報
- `GITHUB_TOKEN` または `GH_TOKEN`: LLM生成用のGitHub Models APIトークン（またはPollinations AIのフォールバックを使用）

---

## 変更内容

### 1. [MODIFY] [bad_blogger.py](file:///Users/calro/Downloads/blogger-er/bad_blogger.py)
楽天API連携および楽天ROOM投稿ロジックを削除し、FANZA API連携と指示書に基づくアフィリエイトリンク付ブログ記事生成・投稿ロジックに置き換えます。

#### 変更点：
- **リサーチAPI**: `https://api.dmm.com/affiliate/v3/ItemList` を使用。
  - `site=FANZA`, `service=digital`, `floor=videoa`
  - `keyword=人妻 ネトラレ` (背徳系ワードへの拡張対応)
  - `sort=date` または `sort=rank`
  - 重複投稿を防ぐためのキャッシュ機能（`posted_cache.txt`）を継続利用。
- **LLMプロンプト**: 指示書のカリスマレビュアーペルソナ、心理描写、官能的で表現の防壁を守ったHTML本文の生成プロンプト。
- **HTMLレイアウト構成**: 
  - タイトル: `【超ド級の背徳感】 + [FANZAの商品タイトル]`
  - アイキャッチ: 中央揃えのジャケット画像（`imageURL.large`）と `affiliateURL` の埋め込み。
  - 本文: 生成されたHTMLレビュー。
  - CTA: グラデーションカラーの押しやすい購入・視聴誘導ボタン。
  - Bloggerへのラベル自動付与: `["FANZA新作", "人妻", "ネトラレ", "背徳不倫"]` のサポート。

### 2. [MODIFY] [auto_post.yml](file:///Users/calro/Downloads/blogger-er/.github/workflows/auto_post.yml)
環境変数とスケジュール、不要になった楽天系環境変数を整理します。

### 3. [MODIFY] [generate_session.py](file:///Users/calro/Downloads/blogger-er/generate_session.py)
楽天ROOMへのログイン手順が不要になるため、Bloggerログインのみにシンプル化します。

---

## 検証プラン
1. **APIテスト**: ローカルでFANZA APIの疎通確認およびデータ構造チェック。
2. **LLM生成テスト**: プロンプトの出力フォーマット（マークダウンブロックを除外したHTML）が正しく機能するかテスト。
3. **ローカル投稿テスト**: `session.json` を使ったBloggerへのテスト投稿（Playwrightの挙動・ラベル付与の動作確認）。
