import fs from "fs";
import path from "path";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { censorText } from "@/lib/censor";

interface Post {
  id: string;
  hinban?: string;
  title: string;
  review: string;
  image: string;
  sample_images: string[];
  affiliate_url: string;
  genres: string[];
  actresses: string[];
  maker: string;
  date: string;
  labels: string[];
}

export const dynamicParams = false;

export async function generateStaticParams() {
  const postsDir = path.join(process.cwd(), "src", "data", "posts");
  if (!fs.existsSync(postsDir)) {
    return [];
  }
  try {
    const files = fs.readdirSync(postsDir).filter((f) => f.endsWith(".json"));
    return files.map((file) => ({
      id: file.replace(".json", ""),
    }));
  } catch (e) {
    console.error("Failed to read posts directory for static params:", e);
    return [];
  }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const postPath = path.join(process.cwd(), "src", "data", "posts", `${id}.json`);

  if (!fs.existsSync(postPath)) {
    return {
      title: "作品が見つかりません",
    };
  }

  try {
    const fileContent = fs.readFileSync(postPath, "utf-8");
    const post: Post = JSON.parse(fileContent);
    const hinbanText = post.hinban || post.id;
    const shortTitle = post.title.length > 15 ? post.title.slice(0, 15) + '…' : post.title;
    const actressText = (post.actresses || []).slice(0, 2).join("・");
    const genreText = (post.genres || []).slice(0, 3).join("・");

    const titleText = actressText 
      ? `【ガチ評価】${hinbanText}（${shortTitle}）は本当に抜ける？${actressText}の出演シーンを徹底レビュー！`
      : `【ガチ評価】${hinbanText}（${shortTitle}）は本当に抜ける？出演シーンを徹底レビュー！`;

    const cleanReview = post.review ? post.review.replace(/<[^>]*>/g, "").replace(/\s+/g, " ") : "";
    const reviewExcerpt = cleanReview.slice(0, 50) + "...";

    const descriptionText = actressText
      ? `${actressText}の最新作『${hinbanText}』を最速レビュー！SNSで話題の「${genreText || '注目ジャンル'}」はサンプル詐欺じゃない？【${reviewExcerpt}】ハズレを引きたくない方は購入前の参考にどうぞ！`
      : `最新作『${hinbanText}』を最速レビュー！SNSで話題の「${genreText || '注目ジャンル'}」はサンプル詐欺じゃない？【${reviewExcerpt}】ハズレを引きたくない方は購入前の参考にどうぞ！`;

    const keywords = (post.genres || []).concat(post.actresses || []).concat(post.labels || []).concat([hinbanText, "レビュー", "感想", "評価", "FANZA"]);
    return {
      title: titleText,
      description: descriptionText.slice(0, 155),
      keywords: keywords.join(","),
      alternates: {
        canonical: `https://er-3.pages.dev/posts/${id}`,
      },
      openGraph: {
        title: censorText(titleText),
        description: censorText(descriptionText),
        url: `https://er-3.pages.dev/posts/${id}`,
        type: "article",
        publishedTime: post.date || undefined,
        authors: ["禁断の美女ギャルクロニクル"],
        images: post.image ? [{ url: post.image, alt: censorText(post.title), width: 800, height: 538 }] : [],
      },
      twitter: {
        card: "summary_large_image",
        title: censorText(titleText),
        description: censorText(descriptionText),
        images: post.image ? [post.image] : [],
      }
    };
  } catch (e) {
    console.error(`Failed to generate metadata for post ${id}:`, e);
    return {
      title: "禁断の美女ギャルクロニクル",
    };
  }
}

// 関連作品の検索
function getRelatedPosts(currentPost: Post, allPostsDir: string): Post[] {
  try {
    if (!fs.existsSync(allPostsDir)) return [];
    const files = fs.readdirSync(allPostsDir).filter((f) => f.endsWith(".json") && f !== `${currentPost.id}.json`);
    const related: Post[] = [];
    const others: Post[] = [];
    for (const file of files) {
      const filePath = path.join(allPostsDir, file);
      const content = fs.readFileSync(filePath, "utf-8");
      const post: Post = JSON.parse(content);
      const hasCommonActress = currentPost.actresses && currentPost.actresses.length > 0 && post.actresses?.some(act => currentPost.actresses.includes(act));
      if (hasCommonActress) {
        related.push(post);
      } else {
        others.push(post);
      }
    }
    // 足りない場合はランダムで補充
    if (related.length < 3) {
      others.sort(() => 0.5 - Math.random());
      related.push(...others.slice(0, 3 - related.length));
    }
    return related.slice(0, 3);
  } catch (e) {
    console.error("Failed to get related posts:", e);
    return [];
  }
}

export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const postsDir = path.join(process.cwd(), "src", "data", "posts");
  const postPath = path.join(postsDir, `${id}.json`);

  if (!fs.existsSync(postPath)) {
    notFound();
  }

  let post: Post | undefined;
  try {
    const fileContent = fs.readFileSync(postPath, "utf-8");
    post = JSON.parse(fileContent);
  } catch (e) {
    console.error(`Failed to parse post JSON at ${postPath}:`, e);
  }

  if (!post) {
    notFound();
  }

  const hinbanText = post.hinban || post.id;
  const relatedPosts = getRelatedPosts(post, postsDir);

  // AI-SEO / GEO 向け JSON-LD 構造化データ
  const cleanReviewText = post.review ? post.review.replace(/<[^>]*>/g, "") : "";
  
  // 1. レビュー構造化データ
  const reviewSchema = {
    "@context": "https://schema.org",
    "@type": "Review",
    "itemReviewed": {
      "@type": "VideoObject",
      "name": post.title,
      "image": post.image,
      "description": cleanReviewText.slice(0, 150) + "...",
      "productID": hinbanText,
      "sku": hinbanText,
      "director": {
        "@type": "Organization",
        "name": post.maker || "メーカー不明"
      },
      "actor": (post.actresses || []).map(actress => ({
        "@type": "Person",
        "name": actress
      }))
    },
    "author": {
      "@type": "Person",
      "name": "禁断の美女ギャルクロニクル レビュアー"
    },
    "reviewRating": {
      "@type": "Rating",
      "ratingValue": "4.8",
      "bestRating": "5"
    },
    "publisher": {
      "@type": "Organization",
      "name": "禁断の美女ギャルクロニクル",
      "url": "https://er-3.pages.dev"
    },
    "datePublished": post.date || new Date().toISOString().split('T')[0],
    "reviewBody": cleanReviewText
  };

  // 2. パンくずリスト構造化データ
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "ホーム",
        "item": "https://er-3.pages.dev"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": post.title,
        "item": `https://er-3.pages.dev/posts/${post.id}`
      }
    ]
  };


  // Article構造化データ
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": post.title,
    "description": (post.review || "").replace(/<[^>]*>/g, "").slice(0, 150),
    "image": post.image ? [post.image] : [],
    "author": { "@type": "Organization", "name": "美女ギャルクロニクル" },
    "publisher": { "@type": "Organization", "name": "美女ギャルクロニクル" },
    "datePublished": post.date || "",
    "dateModified": post.date || "",
    "url": `https://er-3.pages.dev/posts/${id}`,
  };

  // FAQPage構造化データ
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": `${post.title}はどこで見られますか？`,
        "acceptedAnswer": { "@type": "Answer", "text": `${post.title}はFANZA（DMM）で配信されています。品番は${post.hinban || post.id}です。` }
      },
      {
        "@type": "Question",
        "name": `${post.title}の出演女優は？`,
        "acceptedAnswer": { "@type": "Answer", "text": (post.actresses || []).length > 0 ? `出演女優は${(post.actresses || []).join("・")}です。` : `出演女優情報はFANZA（DMM）の作品ページでご確認ください。` }
      }
    ]
  };

  return (
    <>
      {/* 構造化データ埋め込み */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(reviewSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <article className="space-y-6 max-w-4xl mx-auto" lang="ja">
        {/* 戻るナビゲーション */}
        <nav aria-label="パンくずリスト">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-rose-600 transition-colors duration-200"
          >
            <span>←</span> <span>書庫一覧に戻る</span>
          </Link>
        </nav>

        {/* メイン詳細パネル - クリーンなホワイト基調デザイン */}
        <div className="border border-slate-200 bg-white rounded-2xl p-6 md:p-10 shadow-sm space-y-8">
          
          {/* ヘッダー情報 */}
          <header className="space-y-3">
            <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <time dateTime={post.date}>{post.date}</time>
              <span>•</span>
              <span className="text-rose-600">{post.maker || "単体作品"}</span>
            </div>
            <h1 className="text-xl md:text-3xl font-extrabold leading-snug text-slate-800">
              {post.title}
            </h1>
            <div className="flex flex-wrap gap-1">
              {post.labels?.map((lbl) => (
                <span key={lbl} className="bg-rose-50 text-rose-600 border border-rose-100 text-[9px] font-bold px-2.5 py-0.5 rounded-full">
                  #{lbl}
                </span>
              ))}
            </div>
          </header>

          {/* アートジャケット画像 */}
          <section className="flex justify-center bg-slate-50 rounded-xl p-4 border border-slate-200/60 overflow-hidden" aria-label="作品ジャケット">
            <a href={post.affiliate_url} target="_blank" rel="noopener noreferrer" className="block relative group max-w-full">
              <img
                src={post.image}
                alt={`${post.title} ジャケットお宝画像`}
                referrerPolicy="no-referrer"
                className="max-h-[500px] w-auto object-contain rounded-lg shadow-md group-hover:opacity-90 transition duration-300"
              />
              {/* ホバーガイダンス */}
              <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition duration-200 flex items-center justify-center rounded-lg">
                <span className="text-xs font-bold text-white bg-rose-600 px-4 py-2.5 rounded-xl shadow-lg">
                  公式サイトで詳細を視聴
                </span>
              </div>
            </a>
          </section>

          {/* サンプル写真スライド */}
          {post.sample_images && post.sample_images.length > 0 && (
            <section className="space-y-3" aria-label="サンプルプレビュー画像">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                ▼ 現場の瞬間（サンプル写真）
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {post.sample_images.map((imgUrl, idx) => (
                  <a
                    key={idx}
                    href={post.affiliate_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block aspect-video relative overflow-hidden rounded-lg border border-slate-200 bg-slate-100 hover:border-rose-500 transition duration-200"
                  >
                    <img
                      src={imgUrl}
                      alt={`${post.title} サンプル場面カット ${idx + 1}`}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover opacity-90 hover:opacity-100 transition duration-200"
                      loading="lazy"
                    />
                  </a>
                ))}
              </div>
            </section>
          )}

          {/* メタ情報テーブル */}
          <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 rounded-xl bg-slate-50 border border-slate-200 text-xs" aria-label="作品基本スペック情報">
            <div className="space-y-1">
              <span className="text-slate-400 font-bold uppercase tracking-wider block text-[9px]">品番</span>
              <span className="text-slate-800 font-bold text-xs">
                {hinbanText}
              </span>
            </div>
            <div className="space-y-1">
              <span className="text-slate-400 font-bold uppercase tracking-wider block text-[9px]">出演女優</span>
              <span className="text-slate-800 font-bold text-xs">
                {post.actresses?.join("、 ") || "紹介制・単体女優"}
              </span>
            </div>
            <div className="space-y-1">
              <span className="text-slate-400 font-bold uppercase tracking-wider block text-[9px]">作品属性</span>
              <span className="text-slate-700 font-semibold text-xs">
                {post.genres?.join("、 ") || "人妻、不倫、ネトラレ"}
              </span>
            </div>
          </section>

          {/* 濃厚レビューテキスト */}
          <section className="prose prose-slate max-w-none text-slate-600 space-y-6 leading-relaxed text-sm md:text-base font-medium" aria-label="詳細考察レビュー">
            <h2 className="sr-only">レビュー詳細</h2>
            <div
              className="review-content-html"
              dangerouslySetInnerHTML={{ __html: post.review }}
            />
          </section>

          {/* 関連動画・出演女優の作品（CTA形式のボタン） */}
          <section className="pt-6 border-t border-slate-100 space-y-4" aria-label="関連作品・動画をチェック">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">
              ▼ あわせて読みたい関連作品・動画をチェック！
            </h3>
            <div className="flex flex-col gap-3">
              {/* ブログ内の関連作品 */}
              {relatedPosts.map((relPost) => (
                <div key={relPost.id} className="flex flex-col sm:flex-row items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200/80 gap-3">
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    {relPost.image && (
                      <img src={relPost.image} alt={relPost.title} referrerPolicy="no-referrer" className="w-10 h-14 object-cover rounded shadow-sm flex-shrink-0" />
                    )}
                    <div className="text-left">
                      <span className="text-[9px] font-bold text-rose-500 block">品番: {relPost.hinban || relPost.id}</span>
                      <span className="text-xs font-bold text-slate-800 line-clamp-1">{relPost.title}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <Link
                      href={`/posts/${relPost.id}`}
                      className="flex-1 sm:flex-none text-center text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 px-4 py-2 rounded-lg transition"
                    >
                      レビューを見る
                    </Link>
                    <a
                      href={relPost.affiliate_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 sm:flex-none text-center text-xs font-bold text-white bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-400 hover:to-rose-500 px-4 py-2 rounded-lg shadow transition"
                    >
                      作品を視聴する
                    </a>
                  </div>
                </div>
              ))}
              
              {/* 女優ごとのFANZA検索リンク */}
              {post.actresses && post.actresses.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                {post.actresses.map((actress) => {
                  const encodedActress = encodeURIComponent(actress);
                  const searchUrl = `https://al.fanza.co.jp/?lurl=https%3A%2F%2Fwww.dmm.co.jp%2Fsearch%2F-%2F%3Fsearchstr%3D${encodedActress}%2F&af_id=onchan555-008`;
                  return (
                    <a
                      key={actress}
                      href={searchUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full text-center text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200/80 py-3 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>✨</span> {actress} の全出演作品を見る（FANZA）
                    </a>
                  );
                })}
              </div>
              )}
            </div>
          </section>

          {/* 極上のプレミアムCTAボタン */}
          <section className="pt-6 border-t border-slate-100 text-center space-y-3" aria-label="視聴誘導">
            <a
              href={post.affiliate_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-8 py-4.5 text-base font-extrabold text-white bg-gradient-to-r from-rose-500 via-rose-600 to-pink-600 hover:from-rose-400 hover:to-rose-500 rounded-xl shadow-md transition duration-200 cursor-pointer"
            >
              🔥 この作品の全貌を視聴する！
            </a>
            <p className="text-[10px] text-slate-400">
              ※クリックするとFANZA（18禁公式サイト）へ直接遷移します
            </p>
          </section>

          {/* Admax Advertisement removed from here and placed in layout.tsx */}
        </div>
      </article>
    </>
  );
}
