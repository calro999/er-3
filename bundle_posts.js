const fs = require('fs');
const path = require('path');

// ビルド時に個別JSONファイルを結合して一時的なposts.jsonを生成し、
// Next.jsビルドがそれを静的読み込みできるようにするプレビルド処理
const POSTS_DIR = path.join(__dirname, 'src', 'data', 'posts');
const PUBLIC_DATA_DIR = path.join(__dirname, 'public', 'data');
const OUTPUT_FILE = path.join(PUBLIC_DATA_DIR, 'posts.json');

function main() {
  console.log('--- Prebuild: Bundling individual post JSONs for Next.js ---');
  
  // posts.json出力先のディレクトリを作成
  fs.mkdirSync(PUBLIC_DATA_DIR, { recursive: true });

  let posts = [];
  
  if (fs.existsSync(POSTS_DIR)) {
    const files = fs.readdirSync(POSTS_DIR).filter(file => file.endsWith('.json'));
    
    posts = files.map(file => {
      try {
        const content = fs.readFileSync(path.join(POSTS_DIR, file), 'utf8');
        return JSON.parse(content);
      } catch (err) {
        console.error(`Failed to parse: ${file}`, err);
        return null;
      }
    }).filter(Boolean);

    // 最新記事順（date降順）にソート
    posts.sort((a, b) => {
      const dateA = new Date(a.date || 0);
      const dateB = new Date(b.date || 0);
      return dateB.getTime() - dateA.getTime();
    });
  }

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(posts, null, 2), 'utf8');
  console.log(`Bundled ${posts.length} posts into ${OUTPUT_FILE}`);
}

main();
