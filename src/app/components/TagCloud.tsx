import fs from "fs";
import path from "path";
import Link from "next/link";

interface Post {
  id: string;
  genres: string[];
  actresses: string[];
}

export default function TagCloud() {
  const postsDir = path.join(process.cwd(), "src", "data", "posts");
  if (!fs.existsSync(postsDir)) return null;

  let allPosts: Post[] = [];
  try {
    const files = fs.readdirSync(postsDir).filter((f) => f.endsWith(".json"));
    allPosts = files.map((file) => {
      try {
        return JSON.parse(fs.readFileSync(path.join(postsDir, file), "utf-8")) as Post;
      } catch {
        return null;
      }
    }).filter(Boolean) as Post[];
  } catch {
    return null;
  }

  // 集計
  const genreCount: Record<string, number> = {};
  const actressCount: Record<string, number> = {};

  allPosts.forEach((p) => {
    (p.genres || []).forEach((g) => {
      genreCount[g] = (genreCount[g] || 0) + 1;
    });
    (p.actresses || []).forEach((a) => {
      actressCount[a] = (actressCount[a] || 0) + 1;
    });
  });

  // 数が多い順にソートし、上位からランダムピックする（固定にならないようシャッフル）
  const topGenres = Object.entries(genreCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 30)
    .sort(() => 0.5 - Math.random())
    .slice(0, 15);

  const topActresses = Object.entries(actressCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 30)
    .sort(() => 0.5 - Math.random())
    .slice(0, 15);

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8 space-y-6">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">
          🏷️ 人気のタグ・キーワード
        </h3>
        
        <div className="space-y-4">
          <div>
            <h4 className="text-[10px] font-bold text-slate-400 mb-2">おすすめ女優</h4>
            <div className="flex flex-wrap gap-1.5">
              {topActresses.map(([actress]) => (
                <Link
                  key={actress}
                  href={`/actress/${encodeURIComponent(actress)}`}
                  className="text-[10px] font-bold text-slate-600 bg-slate-50 hover:bg-rose-50 border border-slate-200 hover:border-rose-300 hover:text-rose-600 px-2.5 py-1 rounded-md transition-colors"
                >
                  {actress}
                </Link>
              ))}
              <Link href="/archives" className="text-[10px] font-bold text-rose-500 hover:underline px-2.5 py-1">
                + もっと見る
              </Link>
            </div>
          </div>

          <div>
            <h4 className="text-[10px] font-bold text-slate-400 mb-2">注目ジャンル</h4>
            <div className="flex flex-wrap gap-1.5">
              {topGenres.map(([genre]) => (
                <Link
                  key={genre}
                  href={`/genre/${encodeURIComponent(genre)}`}
                  className="text-[10px] font-bold text-slate-600 bg-slate-50 hover:bg-rose-50 border border-slate-200 hover:border-rose-300 hover:text-rose-600 px-2.5 py-1 rounded-md transition-colors"
                >
                  {genre}
                </Link>
              ))}
              <Link href="/archives" className="text-[10px] font-bold text-rose-500 hover:underline px-2.5 py-1">
                + もっと見る
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
