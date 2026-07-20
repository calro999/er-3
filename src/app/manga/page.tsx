import fs from "fs";
import path from "path";
import Link from "next/link";
import { Metadata } from "next";

interface MangaPost {
  id: string;
  hinban?: string;
  title: string;
  image: string;
  affiliate_url: string;
  genres: string[];
  author: string[];
  date: string;
  labels: string[];
}

export const metadata: Metadata = {
  title: "【漫画コーナー】FANZA厳選アダルト漫画レビュー｜おすすめ・あらすじ・感想",
  description: "FANZA（DMM）で配信中のアダルト漫画を厳選レビュー！NTR・レズ・百合・SM・美少女系など様々なジャンルの漫画を、あらすじ・見どころ・評価とともに紹介します。",
};

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

export default function MangaTopPage() {
  const allManga = getAllManga().sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const genreSet = new Set(allManga.flatMap(m => m.genres || []));
  const genres = Array.from(genreSet).slice(0, 12);

  return (
    <div className="space-y-10 max-w-5xl mx-auto">
      {/* ヒーロー */}
      <section className="rounded-2xl bg-gradient-to-br from-purple-900 via-purple-800 to-slate-950 p-8 md:p-12 border border-purple-700/30 shadow-xl text-center">
        <span className="inline-flex text-[9px] font-bold tracking-widest text-purple-400 bg-purple-500/10 border border-purple-500/20 px-3 py-1 rounded mb-4">
          MANGA CORNER
        </span>
        <h1 className="text-3xl md:text-5xl font-black text-white mb-4">
          📚 漫画コーナー
        </h1>
        <p className="text-slate-300 text-sm md:text-base max-w-xl mx-auto leading-relaxed">
          FANZA厳選のアダルト漫画を毎日更新！NTR・レズ・百合・SM・美少女など、
          あらすじ・サンプル画像・評価付きで完全レビュー。
        </p>
        <div className="mt-4 inline-flex items-center gap-2 bg-white/10 rounded-xl px-5 py-2">
          <span className="text-2xl font-black text-purple-300">{allManga.length}</span>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">REVIEWS</span>
        </div>
      </section>

      {/* ジャンルフィルタ */}
      {genres.length > 0 && (
        <section className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">ジャンルで絞り込む</p>
          <div className="flex flex-wrap gap-2">
            {genres.map(g => (
              <Link key={g} href={`/genre/${encodeURIComponent(g)}`}
                className="text-xs font-bold text-purple-600 bg-purple-50 hover:bg-purple-100 border border-purple-200 px-3 py-1.5 rounded-full transition">
                {g}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 記事一覧 */}
      {allManga.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <p className="text-4xl mb-4">📚</p>
          <p className="font-bold">漫画レビュー準備中です！もうすぐ公開します。</p>
        </div>
      ) : (
        <section className="space-y-4">
          <h2 className="text-lg font-extrabold text-slate-800">
            最新の漫画レビュー（{allManga.length}件）
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {allManga.map(post => (
              <article key={post.id} className="flex flex-col rounded-2xl overflow-hidden bg-white border border-slate-200/80 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                <div className="aspect-[3/4] relative overflow-hidden bg-slate-100">
                  {post.image ? (
                    <img src={post.image} alt={`${post.title} 表紙`}
                      className="w-full h-full object-cover" loading="lazy" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl">📚</div>
                  )}
                  <span className="absolute top-2 left-2 text-[9px] font-bold bg-purple-500 text-white px-1.5 py-0.5 rounded">漫画</span>
                </div>
                <div className="p-3 flex-grow flex flex-col justify-between space-y-2">
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold mb-1">{post.date?.split(" ")[0]}</p>
                    <h3 className="text-xs font-extrabold text-slate-800 leading-snug line-clamp-3">{post.title}</h3>
                    {post.author.length > 0 && (
                      <p className="text-[10px] text-slate-500 mt-1">✍️ {post.author[0]}</p>
                    )}
                  </div>
                  <Link href={`/manga/${post.id}`}
                    className="block text-center text-[10px] font-black text-purple-600 bg-purple-50 hover:bg-purple-100 border border-purple-200 py-1.5 rounded-lg transition">
                    レビューを読む
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* FANZA CTA */}
      <section className="text-center py-6">
        <a href="https://al.fanza.co.jp/?lurl=https%3A%2F%2Fbook.dmm.co.jp%2F&af_id=onchan555-003"
          target="_blank" rel="noopener noreferrer"
          className="inline-block px-8 py-4 text-base font-extrabold text-white bg-gradient-to-r from-purple-500 via-purple-600 to-rose-500 rounded-xl shadow-md hover:opacity-90 transition">
          📚 FANZA漫画を全部チェックする
        </a>
        <p className="text-[10px] text-slate-400 mt-2">※FANZA（18禁公式サイト）へ遷移します</p>
      </section>
    </div>
  );
}
