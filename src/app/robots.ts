import { MetadataRoute } from 'next';

export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: [
      'https://haitoku.pages.dev/sitemap.xml',
      'https://er-2.pages.dev/sitemap.xml',
      'https://er-3.pages.dev/sitemap.xml',
    ],
  };
}
