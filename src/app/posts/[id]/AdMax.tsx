'use client';

import { useEffect } from 'react';

export default function AdMax({ id }: { id: string }) {
  useEffect(() => {
    // 既に該当IDのスクリプトが挿入されているかチェック（多重挿入防止）
    if (document.querySelector(`script[data-admax-id="${id}"]`)) return;

    // ユーザー指定の通り、/body の直前に配置（bodyの末尾にappendChild）
    const script = document.createElement("script");
    script.async = true;
    script.src = "https://adm.shinobi.jp/st/auto.js";
    script.setAttribute("data-admax-id", id);
    document.body.appendChild(script);
  }, [id]);

  // UI上のコンテナは持たず、body直下のスクリプト実行に任せる
  return null;
}
