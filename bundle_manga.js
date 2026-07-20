const fs = require('fs');
const path = require('path');

const mangaDir = path.join(__dirname, 'src', 'data', 'manga');
const outputFile = path.join(__dirname, 'public', 'data', 'manga.json');

console.log('--- Prebuild: Bundling manga JSONs ---');

if (!fs.existsSync(mangaDir)) {
  console.log('No manga directory found. Creating empty manga.json.');
  fs.mkdirSync(path.join(__dirname, 'public', 'data'), { recursive: true });
  fs.writeFileSync(outputFile, JSON.stringify([], null, 2), 'utf-8');
  process.exit(0);
}

const files = fs.readdirSync(mangaDir).filter(f => f.endsWith('.json'));
const allManga = [];

for (const file of files) {
  try {
    const content = fs.readFileSync(path.join(mangaDir, file), 'utf-8');
    const data = JSON.parse(content);
    allManga.push(data);
  } catch (e) {
    console.warn(`Skipping ${file}: ${e.message}`);
  }
}

// 日付降順ソート
allManga.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

fs.mkdirSync(path.join(__dirname, 'public', 'data'), { recursive: true });
fs.writeFileSync(outputFile, JSON.stringify(allManga, null, 2), 'utf-8');
console.log(`Bundled ${allManga.length} manga into ${outputFile}`);
