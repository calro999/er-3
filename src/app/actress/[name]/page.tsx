import fs from "fs";
import path from "path";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Metadata } from "next";

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
    const actressSet = new Set<string>();
    for (const file of files) {
      try {
        const post: Post = JSON.parse(fs.readFileSync(path.join(postsDir, file), "utf-8"));
        (post.actresses || []).forEach(a => actressSet.add(a));
      } catch {}
    }
    return Array.from(actressSet).map(name => ({ name: encodeURIComponent(name) }));
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

export async function generateMetadata({ params }: { params: Promise<{ name: string }> }): Promise<Metadata> {
  const { name } = await params;
  const actressName = decodeURIComponent(name);
  const description = `${actressName}の全出演作品レビュー・感想まとめ。FANZAで配信中の${actressName}の動画をジャンル別に紹介。${actressName}のおすすめ作品・評価・見どころを徹底解説します。`;
  return {
    title: `${actressName} レビュー・全出演作品まとめ【美女ギャルクロニクル】`,
    description,
    keywords: [`${actressName} レビュー`, `${actressName} 出演作品`, `${actressName} AV`, `${actressName} FANZA`, `${actressName} 動画`, "AV女優 レビュー", "FANZA 女優"].join(","),
    alternates: { canonical: `https://er-3.pages.dev/actress/${name}` },
    openGraph: { title: `${actressName} レビュー・全出演作品まとめ`, description, url: `https://er-3.pages.dev/actress/${name}`, type: "website" },
    twitter: { card: "summary_large_image", title: `${actressName} レビュー・全出演作品まとめ`, description },
  };
}

export default async function ActressPage({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const actressName = decodeURIComponent(name);
  const allPosts = getAllPosts();
  const actressPosts = allPosts.filter(p => (p.actresses || []).includes(actressName))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  if (actressPosts.length === 0) notFound();

  const relatedGenres = Array.from(new Set(actressPosts.flatMap(p => p.genres || []))).slice(0, 8);
  const coActresses = Array.from(new Set(actressPosts.flatMap(p => (p.actresses || []).filter(a => a !== actressName)))).slice(0, 6);

  const breadcrumbSchema = {
    "@context": "https://schema.org", "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "ホーム", "item": "https://er-3.pages.dev" },
      { "@type": "ListItem", "position": 2, "name": `${actressName} レビュー`, "item": `https://er-3.pages.dev/actress/${name}` }
    ]
  };
  const faqSchema = {
    "@context": "https://schema.org", "@type": "FAQPage",
    "mainEntity": [
      { "@type": "Question", "name": `${actressName}の作品はどこで見られますか？`, "acceptedAnswer": { "@type": "Answer", "text": `${actressName}の作品はFANZA（DMM）で配信されています。当サイトでは${actressPosts.length}作品のレビューを掲載しています。` } },
      { "@type": "Question", "name": `${actressName}のおすすめ作品は？`, "acceptedAnswer": { "@type": "Answer", "text": `当サイトでレビューしている${actressName}の人気作品は「${actressPosts[0]?.title || ""}」などです。` } }
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
          <span className="text-slate-700 font-bold">{actressName}</span>
        </nav>
        <section className="rounded-2xl bg-gradient-to-br from-slate-800 to-slate-950 p-8 md:p-10 border border-slate-700/30 shadow-sm">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6 justify-between">
            <div className="space-y-3">
              <span className="inline-flex text-[9px] font-bold tracking-widest text-rose-400 bg-rose-500/10 border border-rose-500/20 px-3 py-1 rounded">ACTRESS REVIEW</span>
              <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">{actressName}</h1>
              <p className="text-slate-400 text-sm leading-relaxed max-w-lg">
                {actressName}の全出演作品レビュー・感想まとめ。当サイトでは<strong className="text-slate-200">{actressPosts.length}作品</strong>のレビューを掲載しています。
              </p>
            </div>
            <div className="text-center bg-white/5 border border-white/10 rounded-xl px-6 py-4">
              <span className="block text-3xl font-black text-rose-500">{actressPosts.length}</span>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">REVIEWS</span>
            </div>
          </div>
        </section>
        {relatedGenres.length > 0 && (
          <section className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest">{actressName} の主な出演ジャンル</h2>
            <div className="flex flex-wrap gap-2">
              {relatedGenres.map(genre => (
                <Link key={genre} href={`/genre/${encodeURIComponent(genre)}`}
                  className="text-xs font-bold text-slate-600 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 border border-slate-200 hover:border-rose-200 px-3 py-1.5 rounded-full transition-colors duration-200">
                  {genre}
                </Link>
              ))}
            </div>
          </section>
        )}
        <section className="space-y-4">
          <h2 className="text-lg font-extrabold text-slate-800">{actressName} の全出演作品レビュー（{actressPosts.length}件）</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {actressPosts.map(post => (
              <article key={post.id} className="flex flex-col rounded-2xl overflow-hidden bg-white border border-slate-200/80 shadow-sm card-hover-effect">
                <div className="aspect-[16/10] relative overflow-hidden bg-slate-100">
                  {post.image ? <img src={post.image} alt={`${post.title} ジャケット`} referrerPolicy="no-referrer" className="w-full h-full object-cover" loading="lazy" /> : <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">No Image</div>}
                  <span className="absolute top-3 left-3 text-[9px] font-bold bg-rose-500 text-white px-2 py-0.5 rounded shadow">18+</span>
                </div>
                <div className="p-4 flex-grow flex flex-col justify-between space-y-3">
                  <div className="space-y-1.5">
                    <time className="text-[9px] font-bold text-slate-400" dateTime={post.date}>{post.date?.split(" ")[0]}</time>
                    <h3 className="text-sm font-extrabold text-slate-800 leading-snug line-clamp-2">{post.title}</h3>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/posts/${post.id}`} className="flex-1 text-center text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 py-2 rounded-lg transition">レビューを読む</Link>
                    <a href={post.affiliate_url} target="_blank" rel="noopener noreferrer" className="flex-1 text-center text-xs font-bold text-white bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-400 hover:to-rose-500 py-2 rounded-lg shadow transition">視聴する</a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
        {coActresses.length > 0 && (
          <section className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest">{actressName} の共演女優</h2>
            <div className="flex flex-wrap gap-2">
              {coActresses.map(a => <Link key={a} href={`/actress/${encodeURIComponent(a)}`} className="text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-3 py-1.5 rounded-full transition-colors">{a}</Link>)}
            </div>
          </section>
        )}
        <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-extrabold text-slate-800">{actressName} に関するよくある質問</h2>
          <div className="space-y-4 divide-y divide-slate-100">
            <div className="pt-4 first:pt-0 space-y-1.5">
              <p className="text-sm font-bold text-slate-700">Q. {actressName}の作品はどこで見られますか？</p>
              <p className="text-xs text-slate-500 leading-relaxed">A. {actressName}の作品はFANZA（DMM）で配信されています。当サイトでは{actressPosts.length}作品のレビューを掲載しています。</p>
            </div>
            <div className="pt-4 space-y-1.5">
              <p className="text-sm font-bold text-slate-700">Q. {actressName}のおすすめ作品は？</p>
              <p className="text-xs text-slate-500 leading-relaxed">A. 「{actressPosts[0]?.title || ""}」などがおすすめです。各作品ページで詳しいレビュー・感想をご確認ください。</p>
            </div>
          </div>
        </section>
        <section className="text-center py-6">
          <a href={`https://al.fanza.co.jp/?lurl=https%3A%2F%2Fwww.dmm.co.jp%2Fsearch%2F-%2F%3Fsearchstr%3D${encodeURIComponent(actressName)}%2F&af_id=onchan555-003`} target="_blank" rel="noopener noreferrer"
            className="inline-block px-8 py-4 text-base font-extrabold text-white bg-gradient-to-r from-rose-500 via-rose-600 to-pink-600 rounded-xl shadow-md transition duration-200">
            ✨ {actressName} の全作品をFANZAで見る
          </a>
          <p className="text-[10px] text-slate-400 mt-2">※クリックするとFANZA（18禁公式サイト）へ遷移します</p>
        </section>
      </div>
    </>
  );
}
