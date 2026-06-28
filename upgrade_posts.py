import os
import json
import glob

POSTS_DIR = "src/data/posts"

def generate_long_killer_review(title, genres_str, maker):
    # タイトルやジャンルを使って、動的かつ超長文の最強汎用レビューHTMLを生成する
    return f"""<h2>【2026年最新・超絶バズり中】『{title}』の全貌と圧倒的魅力に迫る！</h2>
<p>今、ネット上やSNSで「絶対に一度は見るべき」「これは歴史に名を残す名作」と爆発的な話題を呼んでいる<strong>『{title}』</strong>。本作がなぜここまで多くの人々を熱狂させ、ファンから絶賛の嵐を浴びているのか。その魅力の真髄と、日常のすぐ裏側に潜むスリリングで刺激的な展開について、徹底的に深掘りしてレビューしていきます！</p>

<h3>1. 圧倒的なシチュエーションと作り込まれた世界観</h3>
<p>本作の最大の魅力は、なんといっても<strong>「非日常へと一気に引きずり込まれる極限のシチュエーション」</strong>です。平穏な日常が、ほんの少しのきっかけで劇的に崩壊していく感覚。その過程が信じられないほどのリアリティと緊迫感をもって描かれています。</p>
<p>特に、ジャンルとして挙げられている「{genres_str}」の要素がこれでもかというほど詰め込まれており、マニアの期待を一切裏切らない完璧な構成となっています。制作を手がけた{maker}の本気度が画面全体から伝わってきて、開始数分で心拍数が跳ね上がること間違いなしです。</p>

<h3>2. 俳優陣の狂気すら感じる圧倒的パフォーマンス</h3>
<p>どれだけシチュエーションが良くても、それを表現するキャストの演技力が伴わなければ作品は成り立ちません。しかし、本作『{title}』においてはその心配は完全に無用です。登場人物たちが織りなす葛藤、背徳感、そしてそこから生まれる快楽への没入……。瞳の奥に宿る「理性と本能のせめぎ合い」が、見ているこちらの妄想を極限まで掻き立てます。</p>
<p>「こんな表情、見たことない…」と誰もが唸るような、狂気すら感じる圧倒的なパフォーマンスが、この作品をただの映像から【芸術】の域へと押し上げています。SNSでの口コミでも「演技がリアルすぎて見入ってしまった」という声が多数寄せられているのも納得です。</p>

<h3>3. 見る者の本能を揺さぶる「神演出」とカメラワーク</h3>
<p>本作を語る上で欠かせないのが、絶妙なアングルと緊張感を煽る神がかった演出です。見る側が「そこが見たい！」「もう少し近づいて！」と思う瞬間を完全に計算し尽くしたかのようなカメラワーク。これによって、あたかも自分がその場にいて、その秘密の関係を覗き見しているかのような圧倒的な没入感を得られます。</p>
<ul>
    <li><strong>息遣いまで伝わる臨場感</strong>：高画質映像ならではの鮮明な映像美。</li>
    <li><strong>背徳感を増幅させるBGMと環境音</strong>：静寂の中に響く衣擦れの音や吐息が、ヤバさを引き立てます。</li>
    <li><strong>予測不能な展開</strong>：王道を行きながらも、いい意味で予想を裏切る展開の連続。</li>
</ul>

<h3>総評：絶対にあなたのフォルダに保存すべき最高傑作</h3>
<p>結論から言うと、<strong>『{title}』は2026年を代表する最高傑作の一つ</strong>と言っても過言ではありません。まだ見ていないのであれば、それは人生において非常にもったいないことです。</p>
<p>単なる映像作品の枠を大きく超え、あなたの脳裏に深く刻み込まれるであろう究極のシチュエーション。ぜひこの機会に、誰にも邪魔されない一人きりの空間で、この圧倒的なクオリティを存分に堪能してください。見終わった後、必ずもう一度最初から見返したくなるはずです！</p>"""

def upgrade_posts():
    files = glob.glob(os.path.join(POSTS_DIR, "*.json"))
    upgraded_count = 0
    
    for file_path in files:
        with open(file_path, "r", encoding="utf-8") as f:
            try:
                data = json.load(f)
            except Exception as e:
                print(f"Error parsing {file_path}: {e}")
                continue
                
        review = data.get("review", "")
        # 文字数が800文字未満、または「確実」が含まれるフォールバック記事などを対象にする
        if len(review) < 800 or "殿堂入り確実" in review or "확実" in review:
            title = data.get("title", "本作").replace("【2026年最新・超話題作】 ", "").replace("【絶対必見・キラー記事】 ", "")
            genres_str = "、".join(data.get("genres", ["極上のシチュエーション"]))
            if not genres_str:
                genres_str = "大人の背徳ドラマ"
            maker = data.get("maker", "制作陣")
            if not maker:
                maker = "一流メーカー"
                
            long_review = generate_long_killer_review(title, genres_str, maker)
            data["review"] = long_review
            
            with open(file_path, "w", encoding="utf-8") as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
            print(f"Upgraded to ultra-long killer post: {file_path}")
            upgraded_count += 1
            
    print(f"Total upgraded posts: {upgraded_count}")

if __name__ == "__main__":
    upgrade_posts()
