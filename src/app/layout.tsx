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
          src="https://www.googletagmanager.com/gtag/js?id=G-XMJN1W1EBN"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-XMJN1W1EBN');
          `}
        </Script>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Noto+Sans+JP:wght@400;500;700;900&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-full flex flex-col bg-[#f1f5f9] text-slate-900 selection:bg-rose-500 selection:text-white font-sans antialiased">

        {/* 極薄トップインフォバー */}
        <div className="w-full text-center py-2 bg-gradient-to-r from-slate-200 via-rose-100 to-slate-200 border-b border-slate-300/60 text-[10px] font-bold tracking-widest text-slate-600 flex items-center justify-center gap-4 flex-wrap px-4">
          <span>FOR ADULTS ONLY • 18歳未満の閲覧は固く禁止されています</span>
        </div>

        {/* プレミアムなクリーンガラスヘッダー */}
        <header className="border-b border-slate-200 glass-header sticky top-0 z-50 py-3.5 px-6 shadow-sm">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <a href="/" className="flex items-center gap-2 group">
              <span className="text-xl font-black tracking-tight bg-gradient-to-r from-rose-600 via-pink-600 to-slate-800 bg-clip-text text-transparent group-hover:opacity-90 transition">
                極上美女クロニクル
              </span>
              <span className="text-[9px] font-bold tracking-widest text-rose-500 uppercase border border-rose-200 px-2 py-0.5 rounded-md bg-rose-50">
                GAL & BEAUTY
              </span>
            </a>
            <nav className="flex items-center gap-3 flex-wrap justify-center text-xs font-bold text-slate-500">
              <a href="/" className="hover:text-slate-950 transition px-2 py-1">Home</a>
              <span className="text-slate-300">|</span>
              <span className="text-[11px] text-slate-400 font-semibold">姉妹サイト:</span>
              <a
                href="https://er-2.pages.dev/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 bg-slate-100 hover:bg-rose-500 hover:text-white text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200 hover:border-rose-500 transition duration-200 text-[11px] font-bold cursor-pointer shadow-sm"
              >
                <span>🔗</span> バクロファイル
              </a>
              <a
                href="https://haitoku.pages.dev/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 bg-slate-100 hover:bg-rose-500 hover:text-white text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200 hover:border-rose-500 transition duration-200 text-[11px] font-bold cursor-pointer shadow-sm"
              >
                <span>📖</span> 背徳深夜書斎
              </a>
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
            <div className="flex flex-col sm:flex-row items-center gap-4 text-xs font-bold text-slate-600">
              <span className="text-slate-400 text-[11px]">【公式姉妹サイト】</span>
              <div className="flex items-center gap-3">
                <a
                  href="https://er-2.pages.dev/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-slate-50 hover:bg-rose-50 border border-slate-200 hover:border-rose-300 text-slate-700 hover:text-rose-600 px-3 py-1.5 rounded-lg transition text-xs font-bold shadow-sm"
                >
                  バクロファイル ↗
                </a>
                <a
                  href="https://haitoku.pages.dev/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-slate-50 hover:bg-rose-50 border border-slate-200 hover:border-rose-300 text-slate-700 hover:text-rose-600 px-3 py-1.5 rounded-lg transition text-xs font-bold shadow-sm"
                >
                  背徳深夜書斎 ↗
                </a>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
