import { MetadataRoute } from 'next';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://er-3.pages.dev';
  const routes: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${baseUrl}/ranking`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/archives`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${baseUrl}/manga`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
  ];

  // 動画記事
  const postsDir = path.join(process.cwd(), 'src', 'data', 'posts');
  const actressSet = new Set<string>();
  const genreSet = new Set<string>();
  const makerSet = new Set<string>();

  if (fs.existsSync(postsDir)) {
    try {
      const files = fs.readdirSync(postsDir).filter(f => f.endsWith('.json'));
      const now = Date.now();

      for (const file of files) {
        try {
          const post = JSON.parse(fs.readFileSync(path.join(postsDir, file), 'utf-8'));
          if (!post?.id) continue;

          const postDate = post.date ? new Date(post.date).getTime() : 0;
          const ageInDays = (now - postDate) / (1000 * 60 * 60 * 24);
          const priority = ageInDays < 30 ? 0.95 : ageInDays < 90 ? 0.85 : ageInDays < 180 ? 0.75 : 0.65;

          routes.push({
            url: `${baseUrl}/posts/${post.id}`,
            lastModified: post.date ? new Date(post.date) : new Date(),
            changeFrequency: 'weekly',
            priority,
          });

          (post.actresses || []).forEach((a: string) => { if (a) actressSet.add(a); });
          (post.genres || []).forEach((g: string) => { if (g) genreSet.add(g); });
          if (post.maker) makerSet.add(post.maker);
        } catch {}
      }
    } catch (e) {
      console.error('Sitemap post error:', e);
    }
  }

  // 女優ページ
  actressSet.forEach((name) => {
    routes.push({
      url: `${baseUrl}/actress/${encodeURIComponent(name)}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.85,
    });
  });

  // ジャンルページ
  genreSet.forEach((genre) => {
    routes.push({
      url: `${baseUrl}/genre/${encodeURIComponent(genre)}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.85,
    });
  });

  // メーカーページ
  makerSet.forEach((maker) => {
    routes.push({
      url: `${baseUrl}/maker/${encodeURIComponent(maker)}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.85,
    });
  });

  // 漫画記事
  const mangaDir = path.join(process.cwd(), 'src', 'data', 'manga');
  if (fs.existsSync(mangaDir)) {
    try {
      const mangaFiles = fs.readdirSync(mangaDir).filter(f => f.endsWith('.json'));
      for (const file of mangaFiles) {
        try {
          const manga = JSON.parse(fs.readFileSync(path.join(mangaDir, file), 'utf-8'));
          if (!manga?.id) continue;
          routes.push({
            url: `${baseUrl}/manga/${manga.id}`,
            lastModified: manga.date ? new Date(manga.date) : new Date(),
            changeFrequency: 'monthly',
            priority: 0.85,
          });
        } catch {}
      }
    } catch (e) {
      console.error('Sitemap manga error:', e);
    }
  }

  return routes;
}
