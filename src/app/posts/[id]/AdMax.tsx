'use client';

import { useEffect, useRef } from 'react';

export default function AdMax({ id }: { id: string }) {
  const adRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!adRef.current) return;
    // Prevent multiple injections
    if (adRef.current.querySelector('script')) return;

    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://adm.shinobi.jp/st/auto.js';
    script.setAttribute('data-admax-id', id);
    adRef.current.appendChild(script);
  }, [id]);

  return <div ref={adRef} className="admax-container w-full min-h-[50px] flex justify-center my-4" />;
}
