import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Resolve directory name in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define structures
interface BookMetadata {
  id: string;
  name: string;
  chapters: number;
}

// 66 Books Metadata
const BIBLE_BOOKS: BookMetadata[] = [
  { id: 'genesis', name: 'Gênesis', chapters: 50 },
  { id: 'exodus', name: 'Êxodo', chapters: 40 },
  { id: 'leviticus', name: 'Levítico', chapters: 27 },
  { id: 'numbers', name: 'Números', chapters: 36 },
  { id: 'deuteronomy', name: 'Deuteronômio', chapters: 34 },
  { id: 'joshua', name: 'Josué', chapters: 24 },
  { id: 'judges', name: 'Juízes', chapters: 21 },
  { id: 'ruth', name: 'Rute', chapters: 4 },
  { id: '1samuel', name: '1 Samuel', chapters: 31 },
  { id: '2samuel', name: '2 Samuel', chapters: 24 },
  { id: '1kings', name: '1 Reis', chapters: 22 },
  { id: '2kings', name: '2 Reis', chapters: 25 },
  { id: '1chronicles', name: '1 Crônicas', chapters: 29 },
  { id: '2chronicles', name: '2 Crônicas', chapters: 36 },
  { id: 'ezra', name: 'Esdras', chapters: 10 },
  { id: 'nehemiah', name: 'Neemias', chapters: 13 },
  { id: 'esther', name: 'Ester', chapters: 10 },
  { id: 'job', name: 'Jó', chapters: 42 },
  { id: 'psalms', name: 'Salmos', chapters: 150 },
  { id: 'proverbs', name: 'Provérbios', chapters: 31 },
  { id: 'ecclesiastes', name: 'Eclesiastes', chapters: 12 },
  { id: 'songofsolomon', name: 'Cânticos', chapters: 8 },
  { id: 'isaiah', name: 'Isaías', chapters: 66 },
  { id: 'jeremiah', name: 'Jeremias', chapters: 52 },
  { id: 'lamentations', name: 'Lamentações', chapters: 5 },
  { id: 'ezekiel', name: 'Ezequiel', chapters: 48 },
  { id: 'daniel', name: 'Daniel', chapters: 12 },
  { id: 'hosea', name: 'Oseias', chapters: 14 },
  { id: 'joel', name: 'Joel', chapters: 3 },
  { id: 'amos', name: 'Amós', chapters: 9 },
  { id: 'obadiah', name: 'Obadias', chapters: 1 },
  { id: 'jonah', name: 'Jonas', chapters: 4 },
  { id: 'micah', name: 'Miqueias', chapters: 7 },
  { id: 'nahum', name: 'Naum', chapters: 3 },
  { id: 'habakkuk', name: 'Habacuque', chapters: 3 },
  { id: 'zephaniah', name: 'Sofonias', chapters: 3 },
  { id: 'haggai', name: 'Ageu', chapters: 2 },
  { id: 'zechariah', name: 'Zacarias', chapters: 14 },
  { id: 'malachi', name: 'Malaquias', chapters: 4 },
  { id: 'matthew', name: 'Mateus', chapters: 28 },
  { id: 'mark', name: 'Marcos', chapters: 16 },
  { id: 'luke', name: 'Lucas', chapters: 24 },
  { id: 'john', name: 'João', chapters: 21 },
  { id: 'acts', name: 'Atos', chapters: 28 },
  { id: 'romans', name: 'Romanos', chapters: 16 },
  { id: '1corinthians', name: '1 Coríntios', chapters: 16 },
  { id: '2corinthians', name: '2 Coríntios', chapters: 13 },
  { id: 'galatians', name: 'Gálatas', chapters: 6 },
  { id: 'ephesians', name: 'Efésios', chapters: 6 },
  { id: 'philippians', name: 'Filipenses', chapters: 4 },
  { id: 'colossians', name: 'Colossenses', chapters: 4 },
  { id: '1thessalonians', name: '1 Tessalonicenses', chapters: 5 },
  { id: '2thessalonians', name: '2 Tessalonicenses', chapters: 3 },
  { id: '1timothy', name: '1 Timóteo', chapters: 6 },
  { id: '2timothy', name: '2 Timóteo', chapters: 4 },
  { id: 'titus', name: 'Tito', chapters: 3 },
  { id: 'philemon', name: 'Filemom', chapters: 1 },
  { id: 'hebrews', name: 'Hebreus', chapters: 13 },
  { id: 'james', name: 'Tiago', chapters: 5 },
  { id: '1peter', name: '1 Pedro', chapters: 5 },
  { id: '2peter', name: '2 Pedro', chapters: 3 },
  { id: '1john', name: '1 João', chapters: 5 },
  { id: '2john', name: '2 João', chapters: 1 },
  { id: '3john', name: '3 João', chapters: 1 },
  { id: 'jude', name: 'Judas', chapters: 1 },
  { id: 'revelation', name: 'Apocalipse', chapters: 22 }
];

const OUTPUT_DIR = path.resolve(__dirname, '../public');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'bible-nvi.json');

// Ensure public directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Function to download the entire Bible in a single, high-speed call (Free NVI CDN)
async function downloadEntireBibleCDN() {
  console.log('🚀 Iniciando download da Bíblia NVI completa de fonte rápida...');
  const url = 'https://raw.githubusercontent.com/maatheusgois/bible/main/versions/pt-br/nvi.json';
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Falha no download (${response.status})`);
    }
    const data = await response.json();
    
    // Save to local public folder
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(data, null, 2));
    console.log(`✅ Bíblia NVI importada com sucesso para: ${OUTPUT_FILE}`);
    console.log(`🎉 Tamanho do arquivo: ${(fs.statSync(OUTPUT_FILE).size / 1024 / 1024).toFixed(2)} MB`);
    return true;
  } catch (error: any) {
    console.error('❌ Erro no download por CDN:', error.message);
    return false;
  }
}

// Function to download chapter by chapter (e.g. from API.Bible or JSDelivr API)
async function downloadChapterByChapter(apiKey?: string) {
  console.log('🚀 Iniciando download capítulo por capítulo (Total de 1.189 capítulos)...');
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
  
  const bibleData: Record<string, Record<number, string[]>> = {};

  let totalChaptersDownloaded = 0;

  for (const book of BIBLE_BOOKS) {
    console.log(`\nImportando livro: ${book.name} (${book.chapters} capítulos)`);
    bibleData[book.id] = {};

    for (let ch = 1; ch <= book.chapters; ch++) {
      let success = false;
      let retries = 3;

      while (!success && retries > 0) {
        try {
          const url = `https://cdn.jsdelivr.net/gh/wldeh/bible-api/bibles/nvi/books/${book.id}/chapters/${ch}.json`;
          
          const headers: HeadersInit = apiKey ? { 'api-key': apiKey } : {};
          const response = await fetch(url, { headers });

          if (!response.ok) throw new Error(`Status ${response.status}`);
          
          const data = await response.json();
          let verses: string[] = [];

          if (Array.isArray(data)) {
            verses = data.map(v => v.text || v.verse || '');
          } else if (data.verses && Array.isArray(data.verses)) {
            verses = data.verses.map((v: any) => v.text || '');
          }

          bibleData[book.id][ch] = verses;
          success = true;
          totalChaptersDownloaded++;
          
          // Print progress inline
          process.stdout.write(`\rProgresso: [${totalChaptersDownloaded}/1189] capítulos baixados...`);
          
          // Respect rate limiting
          await delay(80); 
        } catch (err: any) {
          retries--;
          console.log(`\n⚠️ Erro em ${book.name} ${ch}. Tentativas restantes: ${retries}. Erro: ${err.message}`);
          await delay(1000);
        }
      }

      if (!success) {
        console.error(`\n❌ Falha definitiva ao carregar ${book.name} capítulo ${ch}`);
      }
    }
  }

  // Save detailed structured file
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(bibleData, null, 2));
  console.log(`\n✅ Download capítulo a capítulo finalizado com sucesso! Salvo em: ${OUTPUT_FILE}`);
}

async function main() {
  const args = process.argv.slice(2);
  const useSlowMethod = args.includes('--slow');
  const apiKey = process.env.API_BIBLE_KEY;

  console.log('==================================================');
  console.log('      SCRIPT DE IMPORTAÇÃO BÍBLICA: DEVOCIONAL    ');
  console.log('==================================================');

  if (useSlowMethod || apiKey) {
    await downloadChapterByChapter(apiKey);
  } else {
    // Default fast method using pre-compiled CDN
    const success = await downloadEntireBibleCDN();
    if (!success) {
      console.log('🔄 Tentando método alternativo capítulo a capítulo...');
      await downloadChapterByChapter();
    }
  }
}

main().catch(err => {
  console.error('❌ Erro fatal no script:', err);
});
