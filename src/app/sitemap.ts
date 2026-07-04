import { MetadataRoute } from 'next';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://er-3.pages.dev';
  const postsDir = path.join(process.cwd(), 'src', 'data', 'posts');

  const routes: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${baseUrl}/ranking`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
  ];

  if (!fs.existsSync(postsDir)) return routes;

  const actressSet = new Set<string>();
  const genreSet = new Set<string>();

  try {
    const files = fs.readdirSync(postsDir).filter(f => f.endsWith('.json'));

    for (const file of files) {
      try {
        const post = JSON.parse(fs.readFileSync(path.join(postsDir, file), 'utf8'));
        if (!post?.id) continue;

        const postDate = new Date(post.date || new Date());
        const ageMs = Date.now() - postDate.getTime();
        const ageDays = ageMs / (1000 * 60 * 60 * 24);
        const priority = ageDays < 30 ? 0.9 : ageDays < 90 ? 0.8 : ageDays < 180 ? 0.7 : 0.6;

        routes.push({
          url: `${baseUrl}/posts/${post.id}`,
          lastModified: postDate,
          changeFrequency: 'weekly',
          priority,
        });

        (post.actresses || []).forEach((a: string) => { if (a) actressSet.add(a); });
        (post.genres || []).forEach((g: string) => { if (g) genreSet.add(g); });
      } catch {}
    }

    actressSet.forEach(name => {
      routes.push({
        url: `${baseUrl}/actress/${encodeURIComponent(name)}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.85,
      });
    });

    genreSet.forEach(genre => {
      routes.push({
        url: `${baseUrl}/genre/${encodeURIComponent(genre)}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.85,
      });
    });
  } catch (error) {
    console.error('Error generating sitemap:', error);
  }

  return routes;
}
