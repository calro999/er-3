import type { NextConfig } from "next";
import fs from "fs";
import path from "path";
import { execSync } from "child_process";

// 1. ビルド開始前のプレビルド自動実行（npx next buildが単体で実行された場合でも必ずデータを生成）
try {
  if (fs.existsSync(path.join(__dirname, "bundle_posts.js"))) {
    execSync("node bundle_posts.js", { stdio: "inherit" });
  }
  if (fs.existsSync(path.join(__dirname, "bundle_manga.js"))) {
    execSync("node bundle_manga.js", { stdio: "inherit" });
  }
  if (fs.existsSync(path.join(__dirname, "generate_sitemap.js"))) {
    execSync("node generate_sitemap.js", { stdio: "inherit" });
  }
  if (fs.existsSync(path.join(__dirname, "generate_llms_txt.js"))) {
    execSync("node generate_llms_txt.js", { stdio: "inherit" });
  }
} catch (err) {
  console.warn("Prebuild step warning:", err);
}

// 2. ビルド終了時（プロセス終了時）の不要ファイル自動クリーンアップ
// Cloudflare Pagesの20,000ファイル上限対策:
// out/ 配下の __next* 中間ファイルおよび不要な .txt (RSCペイロード) を自動削除
function cleanupOutDir(targetDir: string) {
  if (!fs.existsSync(targetDir)) return;
  const entries = fs.readdirSync(targetDir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(targetDir, entry.name);
    if (entry.isDirectory()) {
      cleanupOutDir(fullPath);
      try {
        if (fs.readdirSync(fullPath).length === 0) {
          fs.rmdirSync(fullPath);
        }
      } catch {
        // ignore
      }
    } else {
      if (entry.name.includes("__next")) {
        try {
          fs.unlinkSync(fullPath);
        } catch {}
      } else if (
        entry.name.endsWith(".txt") &&
        !entry.name.startsWith("llms") &&
        entry.name !== "robots.txt" &&
        !entry.name.includes("indexnow")
      ) {
        try {
          fs.unlinkSync(fullPath);
        } catch {}
      }
    }
  }
}

let cleaned = false;
function triggerCleanup() {
  if (cleaned) return;
  cleaned = true;
  const outDir = path.join(__dirname, "out");
  if (fs.existsSync(outDir)) {
    console.log("--- Postbuild: Auto-cleaning out/ to stay under 20,000 files limit ---");
    cleanupOutDir(outDir);
    console.log("--- Postbuild: Cleanup complete! ---");
  }
}

process.on("exit", triggerCleanup);
process.on("SIGINT", () => {
  triggerCleanup();
  process.exit(0);
});
process.on("SIGTERM", () => {
  triggerCleanup();
  process.exit(0);
});

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
