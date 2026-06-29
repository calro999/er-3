"use client";

import { useState } from "react";
import AmateurBanner from "./AmateurBanner";

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

interface PostListContainerProps {
  initialPosts: Post[];
}

export default function PostListContainer({ initialPosts }: PostListContainerProps) {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedGenre, setSelectedGenre] = useState<string>("すべて");
  const [selectedActress, setSelectedActress] = useState<string>("すべて");
  const [selectedLabel, setSelectedLabel] = useState<string>("すべて");

  // モバイルアコーディオン用のフィルタートグル状態
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);

  // 重複のないジャンル、女優、ラベルのリストを抽出
  const allGenres = ["すべて", ...Array.from(new Set(initialPosts.flatMap((p) => p.genres || [])))];
  const allActresses = ["すべて", ...Array.from(new Set(initialPosts.flatMap((p) => p.actresses || []))).filter(Boolean)];
  const allLabels = ["すべて", ...Array.from(new Set(initialPosts.flatMap((p) => p.labels || [])))];

  // フィルタリング処理（検索、ジャンル、女優、ラベル）
  const filteredPosts = initialPosts.filter((post) => {
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
          {/* キーワード検索 */}
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
                setSelectedActress("すべて");
                setSelectedLabel("すべて");
              }}
              className="text-rose-600 font-bold hover:text-rose-500 cursor-pointer"
            >
              条件をクリア ×
            </button>
          </div>
        )}
      </section>

      {/* 記事一覧グリッド */}
      {filteredPosts.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-slate-200 rounded-2xl bg-white">
          <p className="text-slate-400 text-xs">該当するレビュー記事はありません。</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {(() => {
            const list: React.ReactNode[] = [];
            const mobileBanners = [
              { affiliateId: "onchan555-003", bannerId: "1082_300_250" },
              { affiliateId: "onchan555-003", bannerId: "377_300_250" },
              { affiliateId: "onchan555-003", bannerId: "75_300_250" },
              { affiliateId: "onchan555-003", bannerId: "68_300_250" },
              { affiliateId: "onchan555-003", bannerId: "1980_300_250" },
              { affiliateId: "onchan555-003", bannerId: "1506_300_250" },
            ];

            filteredPosts.forEach((post, index) => {
              list.push(
                <article
                  key={post.id}
                  className="flex flex-col rounded-2xl overflow-hidden bg-white border border-slate-200/80 card-hover-effect shadow-sm"
                >
                  {/* アイキャッチ画像 */}
                  <div className="aspect-[16/10] relative overflow-hidden bg-slate-100 flex items-center justify-center border-b border-slate-200/60">
                    {post.image ? (
                      <img
                        src={post.image}
                        alt={`${post.title} ジャケット画像`}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover transition-transform duration-500 ease-out hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <span className="text-slate-400 text-xs font-semibold">No Image</span>
                    )}
                    <span className="absolute top-4 left-4 text-[9px] font-bold bg-rose-500 text-white px-2.5 py-0.5 rounded shadow-sm">
                      18+
                    </span>
                    <span className="absolute bottom-4 right-4 text-[9px] font-bold bg-slate-900/80 text-white px-2 py-0.5 rounded">
                      {post.maker}
                    </span>
                  </div>

                  {/* 記事情報レイアウト */}
                  <div className="p-5 flex-grow flex flex-col justify-between space-y-4">
                    <div className="space-y-2.5">
                      <time dateTime={post.date} className="text-[9px] font-bold text-slate-400 tracking-wider block">
                        {post.date}
                      </time>
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
              );

              const count = index + 1;
              if (count % 3 === 0) {
                const bannerIndex = (Math.floor(count / 3) - 1) % mobileBanners.length;
                const banner = mobileBanners[bannerIndex];
                list.push(
                  <div
                    key={`mobile-banner-${count}`}
                    className="xl:hidden flex items-center justify-center py-4 col-span-1 sm:col-span-2 md:col-span-1"
                  >
                    <AmateurBanner affiliateId={banner.affiliateId} bannerId={banner.bannerId} />
                  </div>
                );
              }
            });

            return list;
          })()}
        </div>
      )}
    </div>
  );
}
