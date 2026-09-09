"use client";

import { useEffect, useRef } from "react";

interface AmateurBannerProps {
  bannerId: string;
  affiliateId: string;
}

export default function AmateurBanner({ bannerId, affiliateId }: AmateurBannerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    containerRef.current.innerHTML = "";

    // Create an iframe to isolate each banner's script execution.
    // This resolves script deduplication / execution collision when multiple identical scripts are placed.
    const iframe = document.createElement("iframe");
    iframe.style.width = "270px";
    iframe.style.height = "225px";
    iframe.style.border = "none";
    iframe.style.overflow = "hidden";
    iframe.scrolling = "no";

    containerRef.current.appendChild(iframe);

    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            html, body {
              margin: 0;
              padding: 0;
              overflow: hidden;
              background: transparent;
              width: 300px;
              height: 250px;
              transform: scale(0.9);
              transform-origin: top left;
            }
            a.fallback-banner {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              width: 290px;
              height: 240px;
              background: linear-gradient(135deg, #1e293b, #0f172a);
              color: #fff;
              text-decoration: none;
              border-radius: 12px;
              border: 1px solid #334155;
              font-family: sans-serif;
              text-align: center;
              padding: 10px;
              box-sizing: border-box;
            }
            a.fallback-banner:hover {
              border-color: #f43f5e;
            }
          </style>
        </head>
        <body>
          <ins class="widget-banner"></ins>
          <script class="widget-banner-script" src="https://widget-view.dmm.co.jp/js/banner_placement.js?affiliate_id=${affiliateId}&banner_id=${bannerId}"></script>
          <script>
            setTimeout(function() {
              var ins = document.querySelector('.widget-banner');
              if (ins && (!ins.children || ins.children.length === 0)) {
                ins.innerHTML = '<a href="https://al.fanza.co.jp/?lurl=https%3A%2F%2Fwww.dmm.co.jp%2Fdigital%2Fvideoa%2F&af_id=${affiliateId}" target="_blank" class="fallback-banner"><span style="font-size:24px;margin-bottom:8px;">🔥</span><strong style="font-size:14px;color:#f43f5e;">FANZA公式 動画配信コーナー</strong><span style="font-size:11px;color:#94a3b8;margin-top:6px;">最新のヒット作・限定作品を見る ›</span></a>';
              }
            }, 1200);
          </script>
        </body>
        </html>
      `);
      doc.close();
    }
  }, [bannerId, affiliateId]);

  return (
    <div
      ref={containerRef}
      style={{
        width: "270px",
        height: "225px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden"
      }}
    />
  );
}
