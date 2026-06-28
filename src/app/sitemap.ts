import { MetadataRoute } from 'next';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://er-3.pages.dev';

  const routes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
  ];

  try {
    const postsPath = path.join(process.cwd(), 'public', 'data', 'posts.json');
    if (fs.existsSync(postsPath)) {
      const postsData = fs.readFileSync(postsPath, 'utf8');
      const posts = JSON.parse(postsData);

      posts.forEach((post: any) => {
        if (post && post.id) {
          routes.push({
            url: `${baseUrl}/posts/${post.id}`,
            lastModified: new Date(post.date || new Date()),
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
