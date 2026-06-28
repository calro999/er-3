"use client";

import { useState, useEffect } from "react";

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

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedGenre, setSelectedGenre] = useState<string>("すべて");
  const [selectedActress, setSelectedActress] = useState<string>("すべて");
  const [selectedLabel, setSelectedLabel] = useState<string>("すべて");
  const [loading, setLoading] = useState<boolean>(true);

  // モバイルアコーディオン用のフィルタートグル状態
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);

  useEffect(() => {
    fetch("/data/posts.json")
      .then((res) => res.json())
      .then((data) => {
        setPosts(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading posts:", err);
        setLoading(false);
      });
  }, []);

  // 重複のないジャンル、女優、ラベルのリストを抽出
  const allGenres = ["すべて", ...Array.from(new Set(posts.flatMap((p) => p.genres || [])))];
  const allActresses = ["すべて", ...Array.from(new Set(posts.flatMap((p) => p.actresses || []))).filter(Boolean)];
  const allLabels = ["すべて", ...Array.from(new Set(posts.flatMap((p) => p.labels || [])))];

  // フィルタリング処理（検索、ジャンル、女優、ラベル）
  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.review.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.maker.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesGenre = selectedGenre === "すべて" || post.genres?.includes(selectedGenre);
    const matchesActress = selectedActress === "すべて" || post.actresses?.includes(selectedActress);
    const matchesLabel = selectedLabel === "すべて" || post.labels?.includes(selectedLabel);

    return matchesSearch && matchesGenre && matchesActress && matchesLabel;
  });

  const hasActiveFilters = searchQuery || selectedGenre !== "すべて" || selectedActress !== "すべて" || selectedLabel !== "すべて";

  return (
    <div className="space-y-8 md:space-y-12">
      {/* ヒーローセクション - アダルト感を極限まで薄めたモダンで上品なマガジン風 */}
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
            感情のゆらぎや背徳的な心理描写を丁寧に紐解く、大人のための鑑賞支援サイト。厳選された作品の深いレビューをお届けします。
          </p>
        </div>

        {/* スタッツカウンター */}
        <div className="w-full md:w-auto grid grid-cols-2 gap-4 bg-white/5 border border-white/10 p-5 rounded-xl md:min-w-[200px] backdrop-blur-sm">
          <div className="text-center space-y-1">
            <span className="block text-2xl font-black text-rose-500 tracking-tight">{posts.length}</span>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Articles</span>
          </div>
          <div className="text-center space-y-1 border-l border-white/10">
            <span className="block text-2xl font-black text-slate-300 tracking-tight">{allActresses.length - 1}</span>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Actresses</span>
          </div>
        </div>
      </section>

      {/* 検索・絞り込みパネル - 明るいグレー基調の清潔感のあるコントロールパネル */}
      <section className="bg-white border border-slate-200 rounded-2xl p-4 md:p-5 shadow-sm space-y-4">
        
        {/* モバイル用アコーディオンヘッダー */}
        <div className="flex items-center justify-between md:hidden">
          <span className="text-xs font-bold text-slate-600">検索フィルター</span>
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="text-xs font-bold text-rose-600 bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-100 cursor-pointer"
          >
            {isFilterOpen ? "閉じる" : "フィルターを表示"}
          </button>
        </div>

        {/* フィルターフォーム */}
        <div className={`grid grid-cols-1 md:grid-cols-4 gap-4 ${isFilterOpen ? "block" : "hidden md:grid"}`}>
          {/* 検索入力 */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">キーワード検索</label>
            <input
              type="text"
              placeholder="作品名、女優、メーカー..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-rose-500 transition"
            />
          </div>

          {/* ジャンルフィルタ */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">ジャンル</label>
            <select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:border-rose-500 transition cursor-pointer"
            >
              {allGenres.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          {/* 女優フィルタ */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">出演女優</label>
            <select
              value={selectedActress}
              onChange={(e) => setSelectedActress(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:border-rose-500 transition cursor-pointer"
            >
              {allActresses.map((act) => (
                <option key={act} value={act}>{act}</option>
              ))}
            </select>
          </div>

          {/* ラベルフィルタ */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">タグレーベル</label>
            <select
              value={selectedLabel}
              onChange={(e) => setSelectedLabel(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:border-rose-500 transition cursor-pointer"
            >
              {allLabels.map((lbl) => (
                <option key={lbl} value={lbl}>{lbl}</option>
              ))}
            </select>
          </div>
        </div>

        {/* アクティブフィルターの状態表示 */}
        {hasActiveFilters && (
          <div className="flex items-center justify-between text-xs pt-3 border-t border-slate-100">
            <span className="text-slate-500">
              該当作品: <strong className="text-rose-600">{filteredPosts.length}</strong> 件
            </span>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedGenre("すべて");
                setSelectedActress("統括");
                setSelectedLabel("すべて");
              }}
              className="text-rose-600 font-bold hover:text-rose-500 cursor-pointer"
            >
              条件をクリア ×
            </button>
          </div>
        )}
      </section>

      {/* 記事一覧グリッド - 白地の清潔なカードデザイン */}
      {loading ? (
        <div className="text-center py-20">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-t-2 border-rose-500 border-r-2" />
          <p className="mt-4 text-xs text-slate-400">読み込み中...</p>
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-slate-200 rounded-2xl bg-white">
          <p className="text-slate-400 text-xs">該当するレビュー記事はありません。</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {filteredPosts.map((post) => (
            <article
              key={post.id}
              className="flex flex-col rounded-2xl overflow-hidden bg-white border border-slate-200/80 card-hover-effect shadow-sm"
            >
              {/* アイキャッチ画像 */}
              <div className="aspect-[16/10] relative overflow-hidden bg-slate-100 flex items-center justify-center border-b border-slate-200/60">
                {post.image ? (
                  <img
                    src={post.image}
                    alt={post.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                    loading="lazy"
                  />
                ) : (
                  <span className="text-slate-400 text-xs font-semibold">No Image</span>
                )}
                {/* プレミアムな小サイズ年齢制限タグ */}
                <span className="absolute top-4 left-4 text-[9px] font-bold bg-rose-500 text-white px-2.5 py-0.5 rounded shadow-sm">
                  18+
                </span>
                <span className="absolute bottom-4 right-4 text-[9px] font-bold bg-slate-900/80 text-white px-2 py-0.5 rounded">
                  {post.maker}
                </span>
              </div>

              {/* メモリアルな情報レイアウト */}
              <div className="p-5 flex-grow flex flex-col justify-between space-y-4">
                <div className="space-y-2.5">
                  <span className="text-[9px] font-bold text-slate-400 tracking-wider block">
                    {post.date}
                  </span>
                  <h2 className="text-sm md:text-base font-extrabold leading-snug text-slate-800 hover:text-rose-600 transition-colors duration-200 line-clamp-2">
                    {post.title}
                  </h2>
                  <div
                    className="text-xs text-slate-500 leading-relaxed line-clamp-3 font-medium"
                    dangerouslySetInnerHTML={{ __html: post.review }}
                  />
                </div>

                <div className="pt-3.5 flex flex-col gap-3 border-t border-slate-100">
                  {/* 主要ジャンルタグ */}
                  <div className="flex flex-wrap gap-1">
                    {post.genres?.slice(0, 3).map((genre) => (
                      <span key={genre} className="text-[9px] font-bold text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">
                        {genre}
                      </span>
                    ))}
                  </div>
                  <a
                    href={`/posts/${post.id}`}
                    className="w-full text-center text-xs font-bold text-white bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-400 hover:to-rose-500 py-2.5 rounded-xl shadow transition duration-200 cursor-pointer"
                  >
                    考察レビューを読む
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
