import fs from "fs";
import path from "path";
import { Metadata } from "next";
import Link from "next/link";
import PostListContainer from "./components/PostListContainer";

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

export const metadata: Metadata = {
  alternates: {
    canonical: "/",
  },
};

function getPosts(): Post[] {
  try {
    const postsPath = path.join(process.cwd(), "public", "data", "posts.json");
    if (fs.existsSync(postsPath)) {
      const postsData = fs.readFileSync(postsPath, "utf8");
      return JSON.parse(postsData);
    }
  } catch (error) {
    console.error("Error reading posts.json in page.tsx:", error);
  }
  return [];
}

export default function Home() {
  const posts = getPosts();

  // JSON-LD 構造化データの作成
  // 1. WebSite 構造化データ
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "禁断の美女ギャルクロニクル",
    "alternateName": ["禁断の美女ギャルクロニクル - 素人・流出・ハプニング濃厚レビュー"],
    "url": "https://er-3.pages.dev",
  };

  // 2. ItemList 構造化データ
  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "numberOfItems": posts.length,
    "itemListElement": posts.map((post, idx) => ({
      "@type": "ListItem",
      "position": idx + 1,
      "url": `https://er-3.pages.dev/posts/${post.id}`,
      "name": post.title,
    })),
  };

  const actressCount = new Set(posts.flatMap((p) => p.actresses || [])).size;

  return (
    <>
      {/* 構造化データの埋め込み */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />

      <div className="space-y-8 md:space-y-12">
        {/* ヒーローセクション */}
        <section className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-slate-800 to-slate-950 p-8 md:p-12 border border-slate-700/30 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-rose-500/[0.01] rounded-full filter blur-3xl pointer-events-none" />
          
          <div className="relative max-w-xl space-y-4">
            <span className="inline-flex text-[9px] font-bold tracking-widest text-rose-500 bg-rose-500/10 border border-rose-500/10 px-3 py-1 rounded">
              CINEMATIC DRAMA ARCHIVE
            </span>
            <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight leading-snug text-white">
              大人のストーリーを追求する、<br />
              <span className="bg-gradient-to-r from-slate-100 via-rose-200 to-slate-200 bg-clip-text text-transparent">
                作品紹介と徹底考察
              </span>
            </h1>
            <p className="text-slate-300 leading-relaxed text-xs md:text-sm max-w-md">
              決して覗いてはならない、素人たちの裏の顔。裏アカ、流出、ハプニング映像を徹底レビュー。あなたの本能を直撃するリアルな快感記録。マニアが厳選したお宝映像アーカイブ。
            </p>
          </div>

          {/* スタッツカウンター */}
          <div className="w-full md:w-auto grid grid-cols-2 gap-4 bg-white/5 border border-white/10 p-5 rounded-xl md:min-w-[200px] backdrop-blur-sm">
            <div className="text-center space-y-1">
              <span className="block text-2xl font-black text-rose-500 tracking-tight">{posts.length}</span>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Articles</span>
            </div>
            <div className="text-center space-y-1 border-l border-white/10">
              <span className="block text-2xl font-black text-slate-300 tracking-tight">{actressCount}</span>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Actresses</span>
            </div>
          </div>
        </section>

        {/* フィルタおよび記事一覧 */}
        <PostListContainer initialPosts={posts} />
        {/* 女優別・ジャンル別のクイックリンク集 (内部リンクSEO強化) */}
        <section className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm space-y-6">
          <div className="space-y-4">
            <h2 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
              <span className="w-1.5 h-4 bg-rose-500 rounded-full" />
              人気女優から探す
            </h2>
            <div className="flex flex-wrap gap-2">
              {Array.from(new Set(posts.flatMap(p => p.actresses || [])))
                .filter(Boolean)
                .slice(0, 45)
                .map(actress => (
                  <Link
                    key={actress}
                    href={`/actress/${encodeURIComponent(actress)}`}
                    className="text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 hover:text-rose-700 border border-rose-100 px-3.5 py-2 rounded-xl transition duration-150"
                  >
                    {actress}
                  </Link>
                ))}
            </div>
          </div>

          <div className="border-t border-slate-100 pt-6 space-y-4">
            <h2 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
              <span className="w-1.5 h-4 bg-slate-700 rounded-full" />
              人気のジャンルから探す
            </h2>
            <div className="flex flex-wrap gap-2">
              {Array.from(new Set(posts.flatMap(p => p.genres || [])))
                .filter(Boolean)
                .slice(0, 30)
                .map(genre => (
                  <Link
                    key={genre}
                    href={`/genre/${encodeURIComponent(genre)}`}
                    className="text-xs font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 hover:text-slate-800 border border-slate-200/80 px-3.5 py-2 rounded-xl transition duration-150"
                  >
                    {genre}
                  </Link>
                ))}
            </div>
          </div>
        </section>

      </div>
    </>
  );
}
