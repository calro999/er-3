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
          </style>
        </head>
        <body>
          <ins class="widget-banner"></ins>
          <script class="widget-banner-script" src="https://widget-view.dmm.co.jp/js/banner_placement.js?affiliate_id=${affiliateId}&banner_id=${bannerId}"></script>
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
