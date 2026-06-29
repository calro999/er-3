import type { Metadata } from "next";
import Script from "next/script";
import AmateurBanner from "./components/AmateurBanner";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://er-3.pages.dev"),
  title: "禁断の美女ギャルクロニクル - 素人・流出・ハプニング濃厚レビュー",
  description: "決して覗いてはならない、素人たちの裏の顔。裏アカ、流出、ハプニング映像を徹底レビュー。あなたの本能を直撃するリアルな快感記録。マニアが厳選したお宝映像アーカイブ。",
  keywords: [
    "素人", "流出", "裏アカ", "ハプニング", "マジックミラー", "ナンパ", "パパ活", "リアル",
    "暴露", "お宝映像", "官能", "大人向けレビュー"
  ],
  referrer: "no-referrer",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "ja_JP",
    url: "https://er-3.pages.dev",
    siteName: "禁断 of 美女ギャルクロニクル",
    title: "禁断の美女ギャルクロニクル - 素人・流出・ハプニング濃厚レビュー",
    description: "決して覗いてはならない、素人たちの裏の顔。裏アカ、流出、ハプニング映像を徹底レビュー。あなたの本能を直撃するリアルな快感記録。マニアが厳選したお宝映像アーカイブ。",
  },
  twitter: {
    card: "summary_large_image",
    title: "禁断の美女ギャルクロニクル - 素人・流出・ハプニング濃厚レビュー",
    description: "決して覗いてはならない、素人たちの裏の顔。裏アカ、流出、ハプニング映像を徹底レビュー。あなたの本能を直撃するリアルな快感記録。マニアが厳選したお宝映像アーカイブ。",
  },
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
          src="https://www.googletagmanager.com/gtag/js?id=G-C3LC7MD4BC"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-C3LC7MD4BC');
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
              <span className="text-xl font-black tracking-tight bg-gradient-to-r from-slate-900 via-rose-700 to-slate-800 bg-clip-text text-transparent group-hover:opacity-90 transition">
                美女ギャルクロニクル
              </span>
              <span className="text-[9px] font-bold tracking-widest text-slate-500 uppercase border border-slate-300 px-2 py-0.5 rounded-md bg-white">
                AMATEUR
              </span>
            </a>
            <nav className="flex items-center gap-5 text-xs font-bold text-slate-500">
              <a href="/" className="hover:text-slate-950 transition">Home</a>
              <span className="text-slate-300">/</span>
              <a href="https://haitoku.pages.dev/" target="_blank" rel="noopener noreferrer" className="hover:text-rose-600 transition text-rose-700 border border-rose-500/30 px-2 py-1 rounded">姉妹サイト: 深夜書斎</a>
              <span className="text-slate-300">/</span>
              <a href="https://er-2.pages.dev/" target="_blank" rel="noopener noreferrer" className="hover:text-rose-600 transition text-rose-700 border border-rose-500/30 px-2 py-1 rounded">姉妹サイト: バクロファイル</a>
              <span className="text-slate-300">/</span>
              <span className="text-[10px] bg-rose-500 text-white font-black px-2 py-0.5 rounded">
                R-18
              </span>
            </nav>
          </div>
        </header>

        {/* メインコンテンツ */}
        <div className="flex-grow w-full relative flex justify-center items-start">
          {/* 左サイド追従バナー */}
          <aside className="hidden xl:flex flex-col fixed left-4 top-24 w-[270px] z-30 space-y-6 items-center">
            <AmateurBanner affiliateId="onchan555-003" bannerId="1082_300_250" />
            <AmateurBanner affiliateId="onchan555-003" bannerId="377_300_250" />
            <AmateurBanner affiliateId="onchan555-003" bannerId="1980_300_250" />
          </aside>

          <main className="flex-grow max-w-6xl w-full mx-auto px-4 py-8 md:py-12">
            {children}
          </main>

          {/* 右サイド追従バナー */}
          <aside className="hidden xl:flex flex-col fixed right-4 xl:right-[calc((100vw-1152px)/4-135px)] top-24 w-[270px] z-30 space-y-6 items-center">
            <AmateurBanner affiliateId="onchan555-003" bannerId="75_300_250" />
            <AmateurBanner affiliateId="onchan555-003" bannerId="68_300_250" />
            <AmateurBanner affiliateId="onchan555-003" bannerId="1506_300_250" />
          </aside>
        </div>





        {/* ミニマル・モダンなフッター */}
        <footer className="border-t border-slate-200 bg-white py-10 text-xs text-slate-500 shadow-inner">
          <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1.5 text-center md:text-left">
              <p className="font-bold text-slate-700">© 2026 禁断の美女ギャルクロニクル. All Rights Reserved.</p>
              <p className="text-[10px] max-w-md leading-relaxed text-slate-400">
                当サイトに記載されているアフィリエイトリンクは適正に管理されており、紹介する作品はマニアが厳選した大人の作品のみです。
              </p>
            </div>
            <div className="flex flex-wrap gap-4 text-[10px] font-bold text-slate-500 justify-center md:justify-end">
              <a href="/" className="hover:text-slate-950">ホーム</a>
              <span>•</span>
              <span className="text-slate-400">姉妹サイト:</span>
              <a href="https://haitoku.pages.dev/" target="_blank" rel="noopener noreferrer" className="hover:text-rose-600 text-rose-700">背徳の深夜書斎</a>
              <span>•</span>
              <a href="https://er-2.pages.dev/" target="_blank" rel="noopener noreferrer" className="hover:text-rose-600 text-rose-700">禁断のバクロファイル</a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
