import fs from "fs";
import path from "path";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Metadata } from "next";

interface Post {
  id: string;
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
    const descriptionText = post.review
      ? post.review.replace(/<[^>]*>/g, "").slice(0, 120) + "..."
      : `${post.title}の作品詳細と見どころレビューです。`;

    return {
      title: `${post.title}`,
      description: descriptionText,
      keywords: (post.genres || []).concat(post.actresses || []).concat(post.labels || []).join(","),
      openGraph: {
        title: post.title,
        description: descriptionText,
        images: post.image ? [{ url: post.image }] : [],
      },
    };
  } catch (e) {
    console.error(`Failed to generate metadata for post ${id}:`, e);
    return {
      title: "クロード・アーカイブ",
    };
  }
}

export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const postPath = path.join(process.cwd(), "src", "data", "posts", `${id}.json`);

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

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* 戻るナビゲーション */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-rose-600 transition-colors duration-200"
      >
        <span>←</span> <span>書庫一覧に戻る</span>
      </Link>

      {/* メイン詳細パネル - クリーンなホワイト基調デザイン */}
      <div className="border border-slate-200 bg-white rounded-2xl p-6 md:p-10 shadow-sm space-y-8">
        
        {/* ヘッダー情報 */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <span>{post.date}</span>
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
        </div>

        {/* アートジャケット画像 */}
        <div className="flex justify-center bg-slate-50 rounded-xl p-4 border border-slate-200/60 overflow-hidden">
          <a href={post.affiliate_url} target="_blank" rel="noopener noreferrer" className="block relative group max-w-full">
            <img
              src={post.image}
              alt={post.title}
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
        </div>

        {/* サンプル写真スライド */}
        {post.sample_images && post.sample_images.length > 0 && (
          <div className="space-y-3">
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
                    alt={`Sample ${idx}`}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover opacity-90 hover:opacity-100 transition duration-200"
                    loading="lazy"
                  />
                </a>
              ))}
            </div>
          </div>
        )}

        {/* メタ情報テーブル */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
          <div className="space-y-1">
            <span className="text-slate-400 font-bold uppercase tracking-wider block text-[9px]">出演女優</span>
            <span className="text-slate-800 font-bold text-sm">
              {post.actresses?.join("、 ") || "紹介制・単体女優"}
            </span>
          </div>
          <div className="space-y-1">
            <span className="text-slate-400 font-bold uppercase tracking-wider block text-[9px]">作品属性</span>
            <span className="text-slate-700 font-semibold">
              {post.genres?.join("、 ") || "人妻、不倫、ネトラレ"}
            </span>
          </div>
        </div>

        {/* 濃厚レビューテキスト */}
        <div className="prose prose-slate max-w-none text-slate-600 space-y-6 leading-relaxed text-sm md:text-base font-medium">
          <div
            className="review-content-html"
            dangerouslySetInnerHTML={{ __html: post.review }}
          />
        </div>



        {/* 極上のプレミアムCTAボタン */}
        <div className="pt-6 border-t border-slate-100 text-center space-y-3">
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
        </div>

      </div>
    </div>
  );
}
