import fs from "fs";
import path from "path";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { censorText } from "@/lib/censor";

interface Post {
  id: string; hinban?: string; title: string; review: string; image: string;
  affiliate_url: string; genres: string[]; actresses: string[]; maker: string; date: string; labels: string[];
}

export const dynamicParams = false;

export async function generateStaticParams() {
  const postsDir = path.join(process.cwd(), "src", "data", "posts");
  if (!fs.existsSync(postsDir)) return [];
  try {
    const files = fs.readdirSync(postsDir).filter(f => f.endsWith(".json"));
    const genreSet = new Set<string>();
    for (const file of files) {
      try {
        const post: Post = JSON.parse(fs.readFileSync(path.join(postsDir, file), "utf-8"));
        (post.genres || []).forEach(g => genreSet.add(g));
      } catch {}
    }
    return Array.from(genreSet).map(genre => ({ genre: encodeURIComponent(genre) }));
  } catch { return []; }
}

function getAllPosts(): Post[] {
  const postsDir = path.join(process.cwd(), "src", "data", "posts");
  if (!fs.existsSync(postsDir)) return [];
  try {
    return fs.readdirSync(postsDir).filter(f => f.endsWith(".json"))
      .map(file => { try { return JSON.parse(fs.readFileSync(path.join(postsDir, file), "utf-8")) as Post; } catch { return null; } })
      .filter(Boolean) as Post[];
  } catch { return []; }
}

export async function generateMetadata({ params }: { params: Promise<{ genre: string }> }): Promise<Metadata> {
  const { genre } = await params;
  const genreName = decodeURIComponent(genre);
  const titleText = `【2026年最新】FANZA ${genreName}動画おすすめランキング！ガチで病むレベルの隠れた名作を厳選`;
  const descriptionText = `FANZA（DMM）で買える${genreName}ビデオの中から、本当に興奮できる名作・神作だけを厳選！「シチュエーションのリアルさ」「女優の表情」を基準にピックアップ。無料動画では絶対に味わえない、脳が溶ける背徳感を今夜あなたに。`;

  const allPosts = getAllPosts();
  const genrePosts = allPosts
    .filter(p => (p.genres || []).includes(genreName))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const ogImage = genrePosts.length > 0 && genrePosts[0].image ? genrePosts[0].image : undefined;

  return {
    title: titleText,
    description: descriptionText,
    keywords: [`${genreName} AV`, `${genreName} おすすめ`, `${genreName} 動画`, `${genreName} レビュー`, `${genreName} FANZA`, "AV おすすめ", "FANZA 人気"].join(","),
    alternates: { canonical: `https://er-3.pages.dev/genre/${genre}` },
    openGraph: { title: censorText(titleText), description: censorText(descriptionText), url: `https://er-3.pages.dev/genre/${genre}`, type: "website", images: ogImage ? [{ url: ogImage, width: 800, height: 538 }] : [] },
    twitter: { card: "summary_large_image", title: censorText(titleText), description: censorText(descriptionText), images: ogImage ? [ogImage] : [] },
  };
}

export default async function GenrePage({ params }: { params: Promise<{ genre: string }> }) {
  const { genre } = await params;
  const genreName = decodeURIComponent(genre);
  const allPosts = getAllPosts();
  const genrePosts = allPosts.filter(p => (p.genres || []).includes(genreName))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  if (genrePosts.length === 0) notFound();

  const relatedActresses = Array.from(new Set(genrePosts.flatMap(p => p.actresses || []))).slice(0, 8);
  const relatedGenres = Array.from(new Set(genrePosts.flatMap(p => (p.genres || []).filter(g => g !== genreName)))).slice(0, 8);

  const breadcrumbSchema = {
    "@context": "https://schema.org", "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "ホーム", "item": "https://er-3.pages.dev" },
      { "@type": "ListItem", "position": 2, "name": `${genreName} レビューまとめ`, "item": `https://er-3.pages.dev/genre/${genre}` }
    ]
  };
  const faqSchema = {
    "@context": "https://schema.org", "@type": "FAQPage",
    "mainEntity": [
      { "@type": "Question", "name": `${genreName}ジャンルのAVはどこで見られますか？`, "acceptedAnswer": { "@type": "Answer", "text": `${genreName}ジャンルのAVはFANZA（DMM）で配信されています。当サイトでは${genrePosts.length}作品のレビューを掲載しています。` } },
      { "@type": "Question", "name": `${genreName}のおすすめ作品は？`, "acceptedAnswer": { "@type": "Answer", "text": `当サイトでレビューしている${genreName}の人気作品は「${genrePosts[0]?.title || ""}」などです。` } }
    ]
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <div className="space-y-8 max-w-5xl mx-auto">
        <nav className="flex items-center gap-1.5 text-xs font-medium text-slate-500" aria-label="パンくずリスト">
          <Link href="/" className="hover:text-rose-600 transition-colors">ホーム</Link>
          <span className="text-slate-300">›</span>
          <span className="text-slate-700">ジャンル</span>
          <span className="text-slate-300">›</span>
          <span className="text-slate-700 font-bold">{genreName}</span>
        </nav>
        <section className="rounded-2xl bg-gradient-to-br from-slate-800 to-slate-950 p-8 md:p-10 border border-slate-700/30 shadow-sm">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6 justify-between">
            <div className="space-y-3">
              <span className="inline-flex text-[9px] font-bold tracking-widest text-rose-400 bg-rose-500/10 border border-rose-500/20 px-3 py-1 rounded">GENRE ARCHIVE</span>
              <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
                {genreName} <span className="text-slate-300 text-xl font-bold">おすすめ作品</span>
              </h1>
              <p className="text-slate-400 text-sm leading-relaxed max-w-lg">
                {genreName}ジャンルのFANZA人気作品を厳選レビュー。当サイトでは<strong className="text-slate-200">{genrePosts.length}作品</strong>を掲載しています。
              </p>
            </div>
            <div className="text-center bg-white/5 border border-white/10 rounded-xl px-6 py-4">
              <span className="block text-3xl font-black text-rose-500">{genrePosts.length}</span>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">REVIEWS</span>
            </div>
          </div>
        </section>
        {relatedActresses.length > 0 && (
          <section className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest">{genreName} に出演している女優</h2>
            <div className="flex flex-wrap gap-2">
              {relatedActresses.map(a => <Link key={a} href={`/actress/${encodeURIComponent(a)}`} className="text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-3 py-1.5 rounded-full transition-colors">{a}</Link>)}
            </div>
          </section>
        )}
        <section className="space-y-4">
          <h2 className="text-lg font-extrabold text-slate-800">{genreName} 作品レビュー一覧（{genrePosts.length}件）</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {genrePosts.map(post => (
              <article key={post.id} className="flex flex-col rounded-2xl overflow-hidden bg-white border border-slate-200/80 shadow-sm card-hover-effect">
                <div className="aspect-[16/10] relative overflow-hidden bg-slate-100">
                  {post.image ? <img src={post.image} alt={`${post.title} ジャケット`} referrerPolicy="no-referrer" className="w-full h-full object-cover" loading="lazy" /> : <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">No Image</div>}
                  <span className="absolute top-3 left-3 text-[9px] font-bold bg-rose-500 text-white px-2 py-0.5 rounded shadow">18+</span>
                </div>
                <div className="p-4 flex-grow flex flex-col justify-between space-y-3">
                  <div className="space-y-1.5">
                    <h3 className="text-sm font-extrabold text-slate-800 leading-snug line-clamp-2">{post.title}</h3>
                    <p className="text-xs text-slate-500">{(post.actresses || []).slice(0, 2).join("・") || "出演女優"}</p>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/posts/${post.id}`} className="flex-1 text-center text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 py-2 rounded-lg transition">レビューを読む</Link>
                    <a href={post.affiliate_url} target="_blank" rel="noopener noreferrer" className="flex-1 text-center text-xs font-bold text-white bg-gradient-to-r from-rose-500 to-rose-600 py-2 rounded-lg shadow transition">視聴する</a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
        {relatedGenres.length > 0 && (
          <section className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest">関連ジャンル</h2>
            <div className="flex flex-wrap gap-2">
              {relatedGenres.map(g => <Link key={g} href={`/genre/${encodeURIComponent(g)}`} className="text-xs font-bold text-slate-600 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 border border-slate-200 px-3 py-1.5 rounded-full transition-colors">{g}</Link>)}
            </div>
          </section>
        )}
        <section className="text-center py-6">
          <a href={`https://al.fanza.co.jp/?lurl=https%3A%2F%2Fwww.dmm.co.jp%2Fsearch%2F-%2F%3Fsearchstr%3D${encodeURIComponent(genreName)}%2F&af_id=`} target="_blank" rel="noopener noreferrer"
            className="inline-block px-8 py-4 text-base font-extrabold text-white bg-gradient-to-r from-rose-500 via-rose-600 to-pink-600 rounded-xl shadow-md transition duration-200">
            🔥 {genreName} の作品をFANZAで全部見る
          </a>
          <p className="text-[10px] text-slate-400 mt-2">※クリックするとFANZA（18禁公式サイト）へ遷移します</p>
        </section>
      </div>
    </>
  );
}
