'use client';

import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    admaxads: any[];
  }
}

export default function AdMax({ id }: { id: string }) {
  const adRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const SCRIPT_ID = "admax-script";
    
    // Clear previous instances for SPA navigation
    const existingScript = document.getElementById(SCRIPT_ID);
    if (existingScript) {
      existingScript.remove();
      if ((window as any).__admax_tag__) {
        (window as any).__admax_tag__ = undefined;
      }
      if ((window as any).__admax_render__) {
        (window as any).__admax_render__ = undefined;
      }
    }

    // Initialize array and push the current ad id
    window.admaxads = window.admaxads || [];
    window.admaxads.push({ admax_id: id, type: "switch" });

    // Inject the SPA compatible script tag
    const timeout = setTimeout(() => {
      const script = document.createElement("script");
      script.id = SCRIPT_ID;
      script.src = "https://adm.shinobi.jp/st/t.js";
      script.async = true;
      document.head.appendChild(script);
    }, 100);

    return () => clearTimeout(timeout);
  }, [id]);

  return (
    <div 
      ref={adRef} 
      className="admax-switch w-full min-h-[50px] flex justify-center my-4" 
      data-admax-id={id} 
    />
  );
}
