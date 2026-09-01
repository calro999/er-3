const fs = require('fs');
const path = require('path');

const baseUrl = 'https://er-3.pages.dev';
const postsDir = path.join(__dirname, 'src', 'data', 'posts');
const mangaDir = path.join(__dirname, 'src', 'data', 'manga');
const publicDir = path.join(__dirname, 'public');

function escapeXml(unsafe) {
  if (!unsafe) return '';
  return unsafe.toString()
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function formatDate(dateInput) {
  if (!dateInput) return new Date().toISOString().split('T')[0];
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return new Date().toISOString().split('T')[0];
    return d.toISOString().split('T')[0];
  } catch {
    return new Date().toISOString().split('T')[0];
  }
}

// 1. データ読み込み & タクソノミー集計
let posts = [];
let mangas = [];
const actressMap = new Map(); // name -> latestDate (timestamp)
const genreMap = new Map();   // name -> latestDate (timestamp)
const makerMap = new Map();   // name -> latestDate (timestamp)

let latestPostTimestamp = 0;
let latestMangaTimestamp = 0;

if (fs.existsSync(postsDir)) {
  const files = fs.readdirSync(postsDir).filter(f => f.endsWith('.json'));
  for (const file of files) {
    try {
      const post = JSON.parse(fs.readFileSync(path.join(postsDir, file), 'utf8'));
      if (!post || !post.id) continue;
      posts.push(post);

      const postTime = post.date ? new Date(post.date).getTime() : 0;
      if (postTime > latestPostTimestamp) {
        latestPostTimestamp = postTime;
      }

      (post.actresses || []).forEach(a => {
        if (a && a.trim()) {
          const name = a.trim();
          const current = actressMap.get(name) || 0;
          if (postTime > current) actressMap.set(name, postTime);
        }
      });

      (post.genres || []).forEach(g => {
        if (g && g.trim()) {
          const name = g.trim();
          const current = genreMap.get(name) || 0;
          if (postTime > current) genreMap.set(name, postTime);
        }
      });

      if (post.maker && post.maker.trim()) {
        const name = post.maker.trim();
        const current = makerMap.get(name) || 0;
        if (postTime > current) makerMap.set(name, postTime);
      }
    } catch (e) {
      console.error(`Error reading ${file}:`, e.message);
    }
  }
}

// 最新順にソート
posts.sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime());

if (fs.existsSync(mangaDir)) {
  const mangaFiles = fs.readdirSync(mangaDir).filter(f => f.endsWith('.json'));
  for (const file of mangaFiles) {
    try {
      const manga = JSON.parse(fs.readFileSync(path.join(mangaDir, file), 'utf8'));
      if (!manga || !manga.id) continue;
      mangas.push(manga);

      const mangaTime = manga.date ? new Date(manga.date).getTime() : 0;
      if (mangaTime > latestMangaTimestamp) {
        latestMangaTimestamp = mangaTime;
      }
    } catch (e) {
      console.error(`Error reading ${file}:`, e.message);
    }
  }
}
mangas.sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime());

const overallLatestTime = Math.max(latestPostTimestamp, latestMangaTimestamp, Date.now() - 86400000);
const overallLatestDateStr = formatDate(overallLatestTime);

if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// ==========================================
// 2. 各サイトマップXMLの生成
// ==========================================

// A. メイン固定ページ (sitemap-main.xml)
const mainUrls = [
  { loc: `${baseUrl}/`, lastmod: overallLatestDateStr, changefreq: 'daily', priority: '1.0' },
  { loc: `${baseUrl}/ranking`, lastmod: overallLatestDateStr, changefreq: 'daily', priority: '0.9' },
  { loc: `${baseUrl}/archives`, lastmod: overallLatestDateStr, changefreq: 'daily', priority: '0.8' },
  { loc: `${baseUrl}/manga`, lastmod: formatDate(latestMangaTimestamp || overallLatestTime), changefreq: 'daily', priority: '0.9' },
];

let sitemapMain = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
` + mainUrls.map(u => `  <url>
    <loc>${escapeXml(u.loc)}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n') + '\n</urlset>\n';

fs.writeFileSync(path.join(publicDir, 'sitemap-main.xml'), sitemapMain, 'utf8');

// B. 記事ページ (sitemap-posts.xml) + 画像情報
const now = Date.now();
let sitemapPosts = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
` + posts.map(post => {
  const postDate = post.date ? new Date(post.date).getTime() : 0;
  const ageDays = (now - postDate) / (1000 * 60 * 60 * 24);
  const priority = ageDays < 30 ? '0.9' : ageDays < 90 ? '0.8' : ageDays < 180 ? '0.7' : '0.6';
  const lastmod = formatDate(post.date);
  const loc = `${baseUrl}/posts/${post.id}`;
  
  let imageTag = '';
  if (post.image) {
    imageTag = `\n    <image:image>
      <image:loc>${escapeXml(post.image)}</image:loc>
      <image:title>${escapeXml(post.title || post.hinban || '動画画像')}</image:title>
    </image:image>`;
  }

  return `  <url>
    <loc>${escapeXml(loc)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${priority}</priority>${imageTag}
  </url>`;
}).join('\n') + '\n</urlset>\n';

fs.writeFileSync(path.join(publicDir, 'sitemap-posts.xml'), sitemapPosts, 'utf8');

// C. マンガページ (sitemap-manga.xml) + 画像情報
let sitemapManga = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
` + mangas.map(manga => {
  const lastmod = formatDate(manga.date);
  const loc = `${baseUrl}/manga/${manga.id}`;
  
  let imageTag = '';
  if (manga.image) {
    imageTag = `\n    <image:image>
      <image:loc>${escapeXml(manga.image)}</image:loc>
      <image:title>${escapeXml(manga.title || '漫画画像')}</image:title>
    </image:image>`;
  }

  return `  <url>
    <loc>${escapeXml(loc)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>${imageTag}
  </url>`;
}).join('\n') + '\n</urlset>\n';

fs.writeFileSync(path.join(publicDir, 'sitemap-manga.xml'), sitemapManga, 'utf8');

// D. 女優一覧 (sitemap-actress.xml)
const sortedActresses = Array.from(actressMap.entries()).sort((a, b) => b[1] - a[1]);
let sitemapActress = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
` + sortedActresses.map(([name, latestTime]) => {
  const loc = `${baseUrl}/actress/${encodeURIComponent(name)}`;
  const lastmod = formatDate(latestTime || overallLatestTime);
  return `  <url>
    <loc>${escapeXml(loc)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
}).join('\n') + '\n</urlset>\n';

fs.writeFileSync(path.join(publicDir, 'sitemap-actress.xml'), sitemapActress, 'utf8');

// E. ジャンル一覧 (sitemap-genre.xml)
const sortedGenres = Array.from(genreMap.entries()).sort((a, b) => b[1] - a[1]);
let sitemapGenre = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
` + sortedGenres.map(([name, latestTime]) => {
  const loc = `${baseUrl}/genre/${encodeURIComponent(name)}`;
  const lastmod = formatDate(latestTime || overallLatestTime);
  return `  <url>
    <loc>${escapeXml(loc)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
}).join('\n') + '\n</urlset>\n';

fs.writeFileSync(path.join(publicDir, 'sitemap-genre.xml'), sitemapGenre, 'utf8');

// F. メーカー一覧 (sitemap-maker.xml)
const sortedMakers = Array.from(makerMap.entries()).sort((a, b) => b[1] - a[1]);
let sitemapMaker = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
` + sortedMakers.map(([name, latestTime]) => {
  const loc = `${baseUrl}/maker/${encodeURIComponent(name)}`;
  const lastmod = formatDate(latestTime || overallLatestTime);
  return `  <url>
    <loc>${escapeXml(loc)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
}).join('\n') + '\n</urlset>\n';

fs.writeFileSync(path.join(publicDir, 'sitemap-maker.xml'), sitemapMaker, 'utf8');

// ==========================================
// 3. サイトマップインデックス (sitemap.xml)
// Google Search Consoleが最も推奨するインデックス構成
// ==========================================
const sitemaps = [
  { loc: `${baseUrl}/sitemap-main.xml`, lastmod: overallLatestDateStr },
  { loc: `${baseUrl}/sitemap-posts.xml`, lastmod: formatDate(latestPostTimestamp) },
  { loc: `${baseUrl}/sitemap-manga.xml`, lastmod: formatDate(latestMangaTimestamp) },
  { loc: `${baseUrl}/sitemap-actress.xml`, lastmod: formatDate(latestPostTimestamp) },
  { loc: `${baseUrl}/sitemap-genre.xml`, lastmod: formatDate(latestPostTimestamp) },
  { loc: `${baseUrl}/sitemap-maker.xml`, lastmod: formatDate(latestPostTimestamp) },
];

let sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
` + sitemaps.map(s => `  <sitemap>
    <loc>${escapeXml(s.loc)}</loc>
    <lastmod>${s.lastmod}</lastmod>
  </sitemap>`).join('\n') + '\n</sitemapindex>\n';

fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemapIndex, 'utf8');

console.log('✅ Google Search Console最適化サイトマップ生成完了:');
console.log(` - sitemap.xml (Sitemap Index: ${sitemaps.length} 個のサブサイトマップ)`);
console.log(` - sitemap-main.xml (${mainUrls.length} URLs)`);
console.log(` - sitemap-posts.xml (${posts.length} URLs, 画像タグ付き)`);
console.log(` - sitemap-manga.xml (${mangas.length} URLs, 画像タグ付き)`);
console.log(` - sitemap-actress.xml (${sortedActresses.length} URLs)`);
console.log(` - sitemap-genre.xml (${sortedGenres.length} URLs)`);
console.log(` - sitemap-maker.xml (${sortedMakers.length} URLs)`);

