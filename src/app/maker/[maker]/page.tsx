import fs from "fs";
import path from "path";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { censorText } from "@/lib/censor";

interface Post {
  id: string;
  hinban?: string;
  title: string;
  review: string;
  image: string;
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
  if (!fs.existsSync(postsDir)) return [];
  try {
    const files = fs.readdirSync(postsDir).filter(f => f.endsWith(".json"));
    const makerSet = new Set<string>();
    for (const file of files) {
      try {
        const content = fs.readFileSync(path.join(postsDir, file), "utf-8");
        const post: Post = JSON.parse(content);
        if (post.maker) makerSet.add(post.maker);
      } catch { /* skip */ }
    }
    return Array.from(makerSet).map(maker => ({ maker: encodeURIComponent(maker) }));
  } catch {
    return [];
  }
}

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

export async function generateMetadata({ params }: { params: Promise<{ maker: string }> }): Promise<Metadata> {
  const { maker } = await params;
  const makerName = decodeURIComponent(maker);
  const titleText = `【メーカー特集】${makerName} のおすすめ人気作・最新作レビューまとめ`;
  const descriptionText = `人気メーカー「${makerName}」のヒット作品・最新リリース作を徹底レビュー！神作・人気女優出演作の評価、見どころ、お得なFANZA配信情報をどこよりも分かりやすく解説します。`;

  const allPosts = getAllPosts();
  const makerPosts = allPosts
    .filter(p => p.maker === makerName)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const ogImage = makerPosts.length > 0 && makerPosts[0].image ? makerPosts[0].image : undefined;

  return {
    title: titleText,
    description: descriptionText,
    keywords: [
      `${makerName} レビュー`,
      `${makerName} 新作`,
      `${makerName} おすすめ`,
      `${makerName} FANZA`,
      `${makerName} アダルト`,
      "メーカー別 AV",
      "DMM メーカー"
    ].join(","),
    alternates: { canonical: `https://er-3.pages.dev/maker/${maker}` },
    openGraph: {
      title: censorText(titleText),
      description: censorText(descriptionText),
      url: `https://er-3.pages.dev/maker/${maker}`,
      type: "website",
      images: ogImage ? [{ url: ogImage, width: 800, height: 538 }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: censorText(titleText),
      description: censorText(descriptionText),
      images: ogImage ? [ogImage] : [],
    },
  };
}

export default async function MakerPage({ params }: { params: Promise<{ maker: string }> }) {
  const { maker } = await params;
  const makerName = decodeURIComponent(maker);
  const allPosts = getAllPosts();
  const makerPosts = allPosts
    .filter(p => p.maker === makerName)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (makerPosts.length === 0) notFound();

  const relatedActresses = Array.from(new Set(makerPosts.flatMap(p => p.actresses || []))).slice(0, 8);
  const relatedGenres = Array.from(new Set(makerPosts.flatMap(p => p.genres || []))).slice(0, 8);

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "ホーム", "item": "https://er-3.pages.dev" },
      { "@type": "ListItem", "position": 2, "name": `${makerName} レビュー`, "item": `https://er-3.pages.dev/maker/${maker}` }
    ]
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <div className="space-y-8 max-w-5xl mx-auto">
        <nav className="flex items-center gap-1.5 text-xs font-medium text-slate-500" aria-label="パンくずリスト">
          <Link href="/" className="hover:text-rose-600 transition-colors">ホーム</Link>
          <span className="text-slate-300">›</span>
          <span className="text-slate-700 font-bold">美女ギャルクロニクル</span>
          <span className="text-slate-300">›</span>
          <span className="text-slate-700 font-bold">{makerName}</span>
        </nav>

        <section className="rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 p-8 md:p-10 border border-slate-800 shadow-sm">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6 justify-between">
            <div className="space-y-3">
              <span className="inline-flex text-[9px] font-bold tracking-widest text-rose-400 bg-rose-500/10 border border-rose-500/20 px-3 py-1 rounded">
                STUDIO / MAKER
              </span>
              <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">{makerName}</h1>
              <p className="text-slate-400 text-sm leading-relaxed max-w-lg">
                人気メーカー「{makerName}」の全作品レビューまとめ。当サイトでは
                <strong className="text-slate-200">{makerPosts.length}作品</strong>の詳しい考察記事を掲載中。
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <div className="text-center bg-white/5 border border-white/10 rounded-xl px-6 py-4">
                <span className="block text-3xl font-black text-rose-500">{makerPosts.length}</span>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">TITLES</span>
              </div>
            </div>
          </div>
        </section>

        {relatedActresses.length > 0 && (
          <section className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest">{makerName} の主な出演女優</h2>
            <div className="flex flex-wrap gap-2">
              {relatedActresses.map(actress => (
                <Link key={actress} href={`/actress/${encodeURIComponent(actress)}`}
                  className="text-xs font-bold text-slate-600 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 border border-slate-200 hover:border-rose-200 px-3 py-1.5 rounded-full transition-colors duration-200">
                  {actress}
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className="space-y-4">
          <h2 className="text-lg font-extrabold text-slate-800">{makerName} の作品一覧（{makerPosts.length}件）</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {makerPosts.map(post => (
              <article key={post.id} className="flex flex-col rounded-2xl overflow-hidden bg-white border border-slate-200/80 shadow-sm card-hover-effect">
                <div className="aspect-[16/10] relative overflow-hidden bg-slate-100">
                  {post.image ? (
                    <img src={post.image} alt={`${post.title} ジャケット`} referrerPolicy="no-referrer" className="w-full h-full object-cover" loading="lazy" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">No Image</div>
                  )}
                  <span className="absolute top-3 left-3 text-[9px] font-bold bg-rose-500 text-white px-2 py-0.5 rounded shadow">18+</span>
                </div>
                <div className="p-4 flex-grow flex flex-col justify-between space-y-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[9px] font-bold text-slate-400">
                      <time dateTime={post.date}>{post.date?.split(" ")[0]}</time>
                      {post.hinban && <span className="text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-100">{post.hinban}</span>}
                    </div>
                    <h3 className="text-sm font-extrabold text-slate-800 leading-snug line-clamp-2">{post.title}</h3>
                    <div className="flex flex-wrap gap-1">
                      {(post.genres || []).slice(0, 3).map(g => (
                        <span key={g} className="text-[9px] font-bold text-slate-500 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded">{g}</span>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/posts/${post.id}`} className="flex-1 text-center text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 py-2 rounded-lg transition">レビューを読む</Link>
                    <a href={post.affiliate_url} target="_blank" rel="noopener noreferrer" className="flex-1 text-center text-xs font-bold text-white bg-gradient-to-r from-pink-500 to-pink-600 py-2 rounded-lg shadow transition">視聴する</a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {relatedGenres.length > 0 && (
          <section className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest">{makerName} の人気ジャンル</h2>
            <div className="flex flex-wrap gap-2">
              {relatedGenres.map(genre => (
                <Link key={genre} href={`/genre/${encodeURIComponent(genre)}`}
                  className="text-xs font-bold text-slate-600 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 border border-slate-200 px-3 py-1.5 rounded-full transition-colors">
                  {genre}
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
