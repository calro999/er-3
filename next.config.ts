import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true, // 静的エクスポート時には画像の自動最適化を無効化する
  },
  turbopack: {
    root: path.resolve(__dirname),
  },
  // Cloudflare Pagesの20,000ファイル上限対策
  cleanDistDir: true,
};

export default nextConfig;

