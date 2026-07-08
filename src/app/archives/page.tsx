import fs from "fs";
import path from "path";
import Link from "next/link";
import { Metadata } from "next";

interface Post {
  id: string;
  title: string;
  date: string;
  genres: string[];
  actresses: string[];
}

export const metadata: Metadata = {
  title: "全記事・女優・ジャンル一覧（サイトマップ）",
  description: "当サイトで紹介している全AV作品レビュー、女優一覧、ジャンル一覧を網羅したサイトマップページです。お探しの作品や好みの女優・ジャンルからレビューを見つけることができます。",
  alternates: { canonical: "https://er-3.pages.dev/archives" },
  openGraph: {
    title: "全記事・女優・ジャンル一覧（サイトマップ）",
    description: "当サイトで紹介している全AV作品レビュー、女優一覧、ジャンル一覧を網羅したサイトマップページです。",
    url: "https://er-3.pages.dev/archives",
    type: "website",
  },
};

function getAllPosts(): Post[] {
  const postsDir = path.join(process.cwd(), "src", "data", "posts");
  if (!fs.existsSync(postsDir)) return [];
  try {
    return fs.readdirSync(postsDir)
      .filter(f => f.endsWith(".json"))
      .map(file => {
        try {
          return JSON.parse(fs.readFileSync(path.join(postsDir, file), "utf-8")) as Post;
        } catch { return null; }
      })
      .filter(Boolean) as Post[];
  } catch { return []; }
}

export default function ArchivesPage() {
  const allPosts = getAllPosts().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // ジャンル別集計
  const genreCount: Record<string, number> = {};
  allPosts.forEach(p => (p.genres || []).forEach(g => { genreCount[g] = (genreCount[g] || 0) + 1; }));
  const sortedGenres = Object.entries(genreCount).sort((a, b) => b[1] - a[1]);

  // 女優別集計
  const actressCount: Record<string, number> = {};
  allPosts.forEach(p => (p.actresses || []).forEach(a => { actressCount[a] = (actressCount[a] || 0) + 1; }));
  const sortedActresses = Object.entries(actressCount).sort((a, b) => b[1] - a[1]);

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "ホーム", "item": "https://er-3.pages.dev" },
      { "@type": "ListItem", "position": 2, "name": "サイトマップ", "item": "https://er-3.pages.dev/archives" }
    ]
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <div className="space-y-10 max-w-5xl mx-auto">
        <nav className="flex items-center gap-1.5 text-xs font-medium text-slate-500" aria-label="パンくずリスト">
          <Link href="/" className="hover:text-rose-600 transition-colors">ホーム</Link>
          <span className="text-slate-300">›</span>
          <span className="text-slate-700 font-bold">サイトマップ</span>
        </nav>

        {/* ヒーロー */}
        <section className="rounded-2xl bg-gradient-to-br from-slate-800 to-slate-950 p-8 md:p-12 border border-slate-700/30 shadow-sm text-center">
          <div className="space-y-4">
            <span className="inline-flex text-[9px] font-bold tracking-widest text-rose-400 bg-rose-500/10 border border-rose-500/20 px-3 py-1 rounded">
              SITE MAP & ARCHIVES
            </span>
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight leading-snug">
              全記事・サイトマップ
            </h1>
            <p className="text-slate-400 text-sm leading-relaxed max-w-lg mx-auto">
              当サイトの全コンテンツを網羅しています。女優、ジャンル、全記事一覧からお探しの作品を見つけてください。
            </p>
          </div>
        </section>

        {/* 女優一覧（全件） */}
        <section className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm space-y-6">
          <h2 className="text-xl font-extrabold text-slate-800 border-b border-slate-100 pb-3">💃 出演女優一覧 ({sortedActresses.length}名)</h2>
          <div className="flex flex-wrap gap-2">
            {sortedActresses.map(([actress, count]) => (
              <Link key={actress} href={`/actress/${encodeURIComponent(actress)}`}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 bg-slate-50 hover:bg-rose-50 border border-slate-200 hover:border-rose-300 px-3 py-2 rounded-lg transition-colors">
                <span className="group-hover:text-rose-600">{actress}</span>
                <span className="text-[10px] text-slate-400 font-normal">({count})</span>
              </Link>
            ))}
          </div>
        </section>

        {/* ジャンル一覧（全件） */}
        <section className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm space-y-6">
          <h2 className="text-xl font-extrabold text-slate-800 border-b border-slate-100 pb-3">🎭 全ジャンル一覧 ({sortedGenres.length}件)</h2>
          <div className="flex flex-wrap gap-2">
            {sortedGenres.map(([genre, count]) => (
              <Link key={genre} href={`/genre/${encodeURIComponent(genre)}`}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 bg-slate-50 hover:bg-rose-50 border border-slate-200 hover:border-rose-300 px-3 py-2 rounded-lg transition-colors">
                <span className="group-hover:text-rose-600">{genre}</span>
                <span className="text-[10px] text-slate-400 font-normal">({count})</span>
              </Link>
            ))}
          </div>
        </section>

        {/* 全記事一覧 */}
        <section className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm space-y-6">
          <h2 className="text-xl font-extrabold text-slate-800 border-b border-slate-100 pb-3">📄 全レビュー記事一覧 ({allPosts.length}件)</h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-3">
            {allPosts.map((post) => (
              <li key={post.id} className="flex items-start gap-2 text-sm">
                <span className="text-slate-300 flex-shrink-0 mt-0.5">▶</span>
                <Link href={`/posts/${post.id}`} className="font-medium text-slate-700 hover:text-rose-600 transition-colors line-clamp-2 leading-snug">
                  {post.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>

      </div>
    </>
  );
}
