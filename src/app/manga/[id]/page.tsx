import fs from "fs";
import path from "path";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Metadata } from "next";

interface MangaPost {
  id: string;
  hinban?: string;
  title: string;
  review: string;
  image: string;
  sample_images: string[];
  affiliate_url: string;
  tachiyomi_url?: string;
  genres: string[];
  author: string[];
  publisher?: string;
  date: string;
  labels: string[];
}

export const dynamicParams = false;

export async function generateStaticParams() {
  const mangaDir = path.join(process.cwd(), "src", "data", "manga");
  if (!fs.existsSync(mangaDir)) return [];
  try {
    const files = fs.readdirSync(mangaDir).filter(f => f.endsWith(".json"));
    return files.map(file => ({ id: file.replace(".json", "") }));
  } catch {
    return [];
  }
}

function getMangaPost(id: string): MangaPost | null {
  const filePath = path.join(process.cwd(), "src", "data", "manga", `${id}.json`);
  if (!fs.existsSync(filePath)) return null;
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf-8")) as MangaPost;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const post = getMangaPost(id);
  if (!post) return { title: "漫画が見つかりません" };

  const titleText = `【${post.hinban || id}】${post.title} ネタバレなしあらすじ・感想レビュー｜FANZA漫画おすすめ`;
  const description = `${post.title}のあらすじ・見どころ・評価を徹底レビュー！${post.author.length > 0 ? `著者：${post.author.join("、")}。` : ""}${post.genres.slice(0, 4).join("、")}が好きな方におすすめ。サンプル画像あり。`;

  return {
    title: titleText,
    description,
    keywords: [
      post.hinban || id,
      post.title,
      ...post.author,
      "漫画 レビュー",
      "漫画 ネタバレ",
      "FANZA漫画",
      "アダルト漫画",
      ...post.genres.slice(0, 5),
    ].join(","),
    alternates: { canonical: `https://er-3.pages.dev/manga/${id}` },
    openGraph: {
      title: titleText,
      description,
      url: `https://er-3.pages.dev/manga/${id}`,
      type: "article",
      images: post.image ? [{ url: post.image, width: 800, height: 538 }] : [],
    },
  };
}

export default async function MangaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = getMangaPost(id);
  if (!post) notFound();

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": post.title,
    "author": post.author.map(a => ({ "@type": "Person", "name": a })),
    "datePublished": post.date,
    "image": post.image,
    "url": `https://er-3.pages.dev/manga/${id}`,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />

      <div className="space-y-8 max-w-4xl mx-auto">
        {/* パンくず */}
        <nav className="flex items-center gap-1.5 text-xs font-medium text-slate-500" aria-label="パンくずリスト">
          <Link href="/" className="hover:text-rose-600 transition-colors">ホーム</Link>
          <span className="text-slate-300">›</span>
          <Link href="/manga" className="hover:text-rose-600 transition-colors">漫画コーナー</Link>
          <span className="text-slate-300">›</span>
          <span className="text-slate-700 font-bold truncate max-w-[200px]">{post.title}</span>
        </nav>

        {/* ヘッダーカード */}
        <section className="rounded-2xl bg-gradient-to-br from-purple-900 to-slate-950 p-6 md:p-10 border border-purple-700/30 shadow-lg">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            {post.image && (
              <div className="flex-shrink-0 w-full md:w-48">
                <img src={post.image} alt={`${post.title} 表紙`} className="w-full rounded-xl shadow-lg" />
              </div>
            )}
            <div className="flex-1 space-y-3">
              <span className="inline-flex text-[9px] font-bold tracking-widest text-purple-400 bg-purple-500/10 border border-purple-500/20 px-3 py-1 rounded">
                📚 MANGA REVIEW
              </span>
              <h1 className="text-2xl md:text-3xl font-black text-white leading-snug">{post.title}</h1>

              <div className="flex flex-wrap gap-3 text-xs text-slate-300">
                {post.author.length > 0 && (
                  <span>✍️ {post.author.join("、")}</span>
                )}
                {post.publisher && (
                  <span>🏢 {post.publisher}</span>
                )}
                <span>📅 {post.date?.split(" ")[0]}</span>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {post.genres.slice(0, 6).map(g => (
                  <Link key={g} href={`/genre/${encodeURIComponent(g)}`}
                    className="text-[10px] font-bold text-purple-300 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded-full hover:bg-purple-500/20 transition">
                    {g}
                  </Link>
                ))}
              </div>

              {post.tachiyomi_url ? (
                <a href={post.tachiyomi_url} target="_blank" rel="noopener noreferrer"
                  className="inline-block mt-2 px-6 py-3 text-sm font-black text-white bg-gradient-to-r from-purple-500 to-rose-500 hover:from-purple-400 hover:to-rose-400 rounded-xl shadow transition">
                  📖 無料で試し読みする（FANZA）
                </a>
              ) : (
                <a href={post.affiliate_url} target="_blank" rel="noopener noreferrer"
                  className="inline-block mt-2 px-6 py-3 text-sm font-black text-white bg-gradient-to-r from-purple-500 to-rose-500 hover:from-purple-400 hover:to-rose-400 rounded-xl shadow transition">
                  📖 FANZAで読む（18禁）
                </a>
              )}
            </div>
          </div>
        </section>

        {/* サンプル画像（APIで提供されないため非表示） */}

        {/* レビュー本文 */}
        <section className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm prose prose-slate max-w-none
          [&_h2]:text-xl [&_h2]:font-black [&_h2]:text-slate-800 [&_h2]:border-b [&_h2]:border-slate-200 [&_h2]:pb-2 [&_h2]:mt-6
          [&_h3]:text-base [&_h3]:font-extrabold [&_h3]:text-slate-700 [&_h3]:mt-4
          [&_h4]:text-sm [&_h4]:font-bold [&_h4]:text-slate-600
          [&_p]:text-sm [&_p]:text-slate-600 [&_p]:leading-relaxed
          [&_table]:w-full [&_table]:text-xs [&_table]:border-collapse
          [&_th]:bg-purple-50 [&_th]:font-bold [&_th]:text-purple-700 [&_th]:p-2 [&_th]:border [&_th]:border-purple-100
          [&_td]:p-2 [&_td]:border [&_td]:border-slate-200 [&_td]:text-slate-600
          [&_ul]:list-disc [&_ul]:pl-5 [&_li]:text-sm [&_li]:text-slate-600 [&_li]:leading-relaxed">
          <div dangerouslySetInnerHTML={{ __html: post.review }} />
        </section>

        {/* CTAボタン */}
        <section className="text-center py-6 space-y-3">
          <a href={post.affiliate_url} target="_blank" rel="noopener noreferrer"
            className="inline-block px-10 py-4 text-base font-black text-white bg-gradient-to-r from-purple-500 via-purple-600 to-rose-500 hover:from-purple-400 hover:to-rose-400 rounded-xl shadow-lg transition">
            📖 今すぐFANZAで読む（全ページ）
          </a>
          <p className="text-[10px] text-slate-400">※クリックするとFANZA（18禁公式サイト）へ遷移します</p>
        </section>

        {/* 関連ジャンル */}
        {post.genres.length > 0 && (
          <section className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest">このジャンルの漫画も見る</h2>
            <div className="flex flex-wrap gap-2">
              {post.genres.map(g => (
                <Link key={g} href={`/genre/${encodeURIComponent(g)}`}
                  className="text-xs font-bold text-purple-600 bg-purple-50 hover:bg-purple-100 border border-purple-200 px-3 py-1.5 rounded-full transition">
                  {g}
                </Link>
              ))}
            </div>
          </section>
        )}

        <div className="text-center pt-4">
          <Link href="/manga" className="text-xs font-bold text-purple-600 hover:underline">
            ← 漫画コーナートップに戻る
          </Link>
        </div>
      </div>
    </>
  );
}
