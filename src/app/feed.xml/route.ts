import fs from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

export const dynamic = 'force-static';

export async function GET() {
  const baseUrl = 'https://er-3.pages.dev';
  const postsDir = path.join(process.cwd(), 'src', 'data', 'posts');
  let items = '';

  if (fs.existsSync(postsDir)) {
    try {
      const files = fs.readdirSync(postsDir).filter(f => f.endsWith('.json'));
      const posts = files.map(file => {
        try {
          return JSON.parse(fs.readFileSync(path.join(postsDir, file), 'utf-8'));
        } catch { return null; }
      }).filter(Boolean);

      posts.sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime());

      items = posts.slice(0, 50).map(post => `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${baseUrl}/posts/${post.id}</link>
      <guid>${baseUrl}/posts/${post.id}</guid>
      <pubDate>${new Date(post.date || Date.now()).toUTCString()}</pubDate>
      <description><![CDATA[${(post.review || '').replace(/<[^>]*>/g, '').slice(0, 200)}...]]></description>
    </item>`).join('\n');
    } catch (e) {
      console.error(e);
    }
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>美女ギャルクロニクル</title>
    <link>https://er-3.pages.dev</link>
    <description>美少女・清楚系AV・漫画レビュー</description>
    <language>ja</language>
    <atom:link href="https://er-3.pages.dev/feed.xml" rel="self" type="application/rss+xml" />
    ${items}
  </channel>
</rss>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 's-maxage=3600, stale-while-revalidate',
    },
  });
}
