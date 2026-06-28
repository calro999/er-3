import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "極上美女クロニクル - 厳選ギャル＆美少女作品徹底レビュー",
  description: "今一番熱いトレンドギャル＆美少女作品をマニア視点で徹底考察！人気女優の見どころ、演出のリアルさ、見逃せないハイライト場面を独自レビュー。大人のための極上エンタメアーカイブ。",
  keywords: [
    "ギャル", "美少女", "制服ギャル", "黒ギャル", "パパ活", "コスプレ", "高画質", 
    "人気女優", "作品レビュー", "徹底考察", "大人向け"
  ],
  metadataBase: new URL("https://er-3.pages.dev"),
  referrer: "no-referrer",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className="h-full">
      <head>
        <meta name="referrer" content="no-referrer" />
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-BTJKTTHLHB"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-BTJKTTHLHB');
          `}
        </Script>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Noto+Sans+JP:wght@400;500;700;900&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-full flex flex-col bg-[#f1f5f9] text-slate-900 selection:bg-rose-500 selection:text-white font-sans antialiased">
        
        {/* 極薄トップインフォバー */}
        <div className="w-full text-center py-2 bg-gradient-to-r from-slate-200 via-rose-100 to-slate-200 border-b border-slate-300/60 text-[10px] font-bold tracking-widest text-slate-600">
          FOR ADULTS ONLY • 18歳未満の閲覧は固く禁止されています
        </div>

        {/* プレミアムなクリーンガラスヘッダー */}
        <header className="border-b border-slate-200 glass-header sticky top-0 z-50 py-3.5 px-6 shadow-sm">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <a href="/" className="flex items-center gap-2 group">
              <span className="text-xl font-black tracking-tight bg-gradient-to-r from-rose-600 via-pink-600 to-slate-800 bg-clip-text text-transparent group-hover:opacity-90 transition">
                極上美女クロニクル
              </span>
              <span className="text-[9px] font-bold tracking-widest text-rose-500 uppercase border border-rose-200 px-2 py-0.5 rounded-md bg-rose-50">
                GAL & BEAUTY
              </span>
            </a>
            <nav className="flex items-center gap-5 text-xs font-bold text-slate-500">
              <a href="/" className="hover:text-slate-950 transition">Home</a>
              <span className="text-slate-300">/</span>
              <span className="text-[10px] bg-rose-500 text-white font-black px-2 py-0.5 rounded">
                R-18
              </span>
            </nav>
          </div>
        </header>

        {/* メインコンテンツ */}
        <main className="flex-grow max-w-6xl w-full mx-auto px-4 py-8 md:py-12">
          {children}
        </main>

        {/* ミニマル・モダンなフッター */}
        <footer className="border-t border-slate-200 bg-white py-10 text-xs text-slate-500 shadow-inner">
          <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1.5 text-center md:text-left">
              <p className="font-bold text-slate-700">© 2026 極上美女クロニクル. All Rights Reserved.</p>
              <p className="text-[10px] max-w-md leading-relaxed text-slate-400">
                当サイトに記載されているアフィリエイトリンクは適正に管理されており、厳選したギャル＆美女作品のみを紹介しております。
              </p>
            </div>
            <div className="flex flex-wrap gap-4 text-[10px] font-bold text-slate-500 justify-center md:justify-end">
              <a href="/" className="hover:text-slate-950">ホーム</a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
