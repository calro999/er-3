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
  maker: string;
}

interface MangaPost {
  id: string;
  title: string;
}

export const metadata: Metadata = {
  title: "HTMLサイトマップ（全記事・カテゴリ一覧）",
  description: "当サイトの全コンテンツ（AV作品レビュー、漫画レビュー、女優一覧、メーカー一覧、ジャンル一覧）を網羅したHTMLサイトマップです。",
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

function getAllManga(): MangaPost[] {
  const mangaDir = path.join(process.cwd(), "src", "data", "manga");
  if (!fs.existsSync(mangaDir)) return [];
  try {
    return fs.readdirSync(mangaDir)
      .filter(f => f.endsWith(".json"))
      .map(file => {
        try {
          return JSON.parse(fs.readFileSync(path.join(mangaDir, file), "utf-8")) as MangaPost;
        } catch { return null; }
      })
      .filter(Boolean) as MangaPost[];
  } catch { return []; }
}

export default function ArchivesPage() {
  const allPosts = getAllPosts().sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime());
  const allManga = getAllManga();
  
  // 統計と集計
  const actressCount: Record<string, number> = {};
  const genreCount: Record<string, number> = {};
  const makerCount: Record<string, number> = {};

  allPosts.forEach(post => {
    (post.actresses || []).forEach(a => { if (a) actressCount[a] = (actressCount[a] || 0) + 1; });
    (post.genres || []).forEach(g => { if (g) genreCount[g] = (genreCount[g] || 0) + 1; });
    if (post.maker) makerCount[post.maker] = (makerCount[post.maker] || 0) + 1;
  });

  const sortedActresses = Object.entries(actressCount).sort((a, b) => b[1] - a[1]);
  const sortedGenres = Object.entries(genreCount).sort((a, b) => b[1] - a[1]);
  const sortedMakers = Object.entries(makerCount).sort((a, b) => b[1] - a[1]);

  return (
    <div className="space-y-10 max-w-5xl mx-auto px-4 py-8">
      
      <section className="rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 p-8 border border-slate-700 shadow-sm text-center">
        <h1 className="text-3xl font-black text-white tracking-tight mb-3">HTMLサイトマップ</h1>
        <p className="text-slate-400 text-sm">当サイトの全コンテンツをカテゴリ別に一覧でご確認いただけます。</p>
      </section>

      {/* メーカー一覧 */}
      {sortedMakers.length > 0 && (
        <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-xl font-extrabold text-slate-800 border-b border-slate-100 pb-3">🏢 メーカー・レーベル一覧</h2>
          <div className="flex flex-wrap gap-3">
            {sortedMakers.map(([maker, count]) => (
              <Link key={maker} href={`/maker/${encodeURIComponent(maker)}`} className="group flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-rose-300 hover:bg-rose-50 transition-all">
                <span className="text-sm font-bold text-slate-600 group-hover:text-rose-600">{maker}</span>
                <span className="text-[10px] text-slate-400 font-normal">({count})</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 女優一覧 */}
      <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <h2 className="text-xl font-extrabold text-slate-800 border-b border-slate-100 pb-3">💃 出演女優一覧</h2>
        <div className="flex flex-wrap gap-3">
          {sortedActresses.map(([actress, count]) => (
            <Link key={actress} href={`/actress/${encodeURIComponent(actress)}`} className="group flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-rose-300 hover:bg-rose-50 transition-all">
              <span className="text-sm font-bold text-slate-600 group-hover:text-rose-600">{actress}</span>
              <span className="text-[10px] text-slate-400 font-normal">({count})</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ジャンル一覧 */}
      <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <h2 className="text-xl font-extrabold text-slate-800 border-b border-slate-100 pb-3">🏷️ ジャンル一覧</h2>
        <div className="flex flex-wrap gap-2">
          {sortedGenres.map(([genre, count]) => (
            <Link key={genre} href={`/genre/${encodeURIComponent(genre)}`} className="group flex items-center gap-1 px-2.5 py-1 rounded border border-slate-200 hover:border-rose-300 hover:bg-rose-50 transition-all">
              <span className="text-xs font-medium text-slate-600 group-hover:text-rose-600">{genre}</span>
              <span className="text-[9px] text-slate-400">({count})</span>
            </Link>
          ))}
        </div>
      </section>

      {/* 全記事一覧 */}
      <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <h2 className="text-xl font-extrabold text-slate-800 border-b border-slate-100 pb-3">📄 動画レビュー 全記事一覧 ({allPosts.length}件)</h2>
        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-3">
          {allPosts.map((post) => (
            <li key={post.id} className="flex items-start gap-2 text-sm">
              <span className="text-slate-300 flex-shrink-0 mt-0.5">▶</span>
              <Link href={`/posts/${post.id}`} className="font-medium text-slate-700 hover:text-rose-600 transition-colors line-clamp-1">
                {post.title}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* 漫画一覧 */}
      {allManga.length > 0 && (
        <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-xl font-extrabold text-slate-800 border-b border-slate-100 pb-3">📚 漫画レビュー 全記事一覧 ({allManga.length}件)</h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-3">
            {allManga.map((manga) => (
              <li key={manga.id} className="flex items-start gap-2 text-sm">
                <span className="text-slate-300 flex-shrink-0 mt-0.5">▶</span>
                <Link href={`/manga/${manga.id}`} className="font-medium text-slate-700 hover:text-purple-600 transition-colors line-clamp-1">
                  {manga.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

    </div>
  );
}
