import { MetadataRoute } from 'next';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://er-3.pages.dev';

  const routes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date().toISOString(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
  ];

  try {
    const postsPath = path.join(process.cwd(), 'public', 'data', 'posts.json');
    if (fs.existsSync(postsPath)) {
      const postsData = fs.readFileSync(postsPath, 'utf8');
      const posts = JSON.parse(postsData);

      posts.forEach((post: any) => {
        if (post && post.id) {
          let lastMod = new Date().toISOString();
          if (post.date) {
            try {
              lastMod = new Date(post.date).toISOString();
            } catch (e) {
              lastMod = new Date().toISOString();
            }
          }
          routes.push({
            url: `${baseUrl}/posts/${post.id}`,
            lastModified: lastMod,
            changeFrequency: 'weekly',
            priority: 0.8,
          });
        }
      });
    }
  } catch (error) {
    console.error('Error generating sitemap:', error);
  }

  return routes;
}
