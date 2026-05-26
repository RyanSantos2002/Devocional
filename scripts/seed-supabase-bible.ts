import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

// Resolve paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Read and parse .env manually
const envPath = path.resolve(__dirname, '../.env');
if (!fs.existsSync(envPath)) {
  console.error("❌ Arquivo .env não encontrado na raiz do projeto!");
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf-8');
const envs: Record<string, string> = {};

envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    let value = match[2] ? match[2].trim() : '';
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
    if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
    envs[match[1]] = value;
  }
});

const supabaseUrl = envs['VITE_SUPABASE_URL'] || '';
const supabaseAnonKey = envs['VITE_SUPABASE_ANON_KEY'] || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("❌ VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY não estão configurados no seu .env!");
  process.exit(1);
}

// 2. Initialize Supabase
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface Book {
  id: string;
  name: string;
  chapters: number;
}

const BIBLE_BOOKS: Book[] = [
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

async function seedBible() {
  const version = 'nvi'; // Seed NVI which we have locally
  const localBiblePath = path.resolve(__dirname, '../public/bible-nvi.json');

  console.log('==================================================');
  console.log('    SEMEADOR SUPABASE: POPULAR BÍBLIA NA NUVEM    ');
  console.log('==================================================');
  console.log(`Versão selecionada: ${version.toUpperCase()}`);
  console.log(`Método: LEITURA LOCAL OFFLINE (CUSTO 0 E IMUNE A BLOQUEIOS CDN)`);

  if (!fs.existsSync(localBiblePath)) {
    console.error("❌ Arquivo bible-nvi.json não encontrado em public/!");
    console.log("Por favor, rode o importador primeiro usando: npm run import-bible");
    process.exit(1);
  }

  // 1. Read and parse local JSON database
  console.log("📖 Lendo banco de dados da Bíblia NVI local...");
  const jsonRaw = fs.readFileSync(localBiblePath, 'utf-8');
  const jsonData = JSON.parse(jsonRaw);

  if (!Array.isArray(jsonData) || jsonData.length < 66) {
    console.error("❌ Arquivo JSON local corrompido ou incompleto!");
    process.exit(1);
  }

  const batch: any[] = [];
  let totalChapters = 0;

  // 2. Loop through all 66 books and their chapters
  for (let i = 0; i < BIBLE_BOOKS.length; i++) {
    const book = BIBLE_BOOKS[i];
    const jsonBook = jsonData[i];

    if (!jsonBook || !jsonBook.chapters) {
      console.warn(`⚠️ Livro do índice ${i} não corresponde no JSON local.`);
      continue;
    }

    process.stdout.write(`\nProcessando livro: ${book.name} (${book.chapters} capítulos)...`);

    for (let ch = 1; ch <= book.chapters; ch++) {
      const jsonVerses = jsonBook.chapters[ch - 1];
      if (!Array.isArray(jsonVerses)) {
        console.warn(`\n⚠️ Capítulo ${ch} de ${book.name} não encontrado no JSON.`);
        continue;
      }

      // Format verses as expected by database [{number: 1, text: "..."}]
      const verses = jsonVerses.map((txt: string, vIdx: number) => ({
        number: vIdx + 1,
        text: txt
      }));

      const id = `${version}-${book.id}-${ch}`.toLowerCase();
      batch.push({
        id,
        version,
        book: book.id,
        chapter: ch,
        verses
      });
      totalChapters++;

      // When batch hits 50, upload to Supabase
      if (batch.length >= 50) {
        process.stdout.write(`\n☁️ Subindo lote de 50 capítulos para o Supabase...`);
        const { error } = await supabase
          .from('capitulos_biblia')
          .upsert(batch, { onConflict: 'id' });

        if (error) {
          console.error(`\n❌ Erro ao enviar lote para o Supabase:`, error.message);
        } else {
          process.stdout.write(` Enviado com sucesso.`);
        }
        batch.length = 0; // Clear
      }
    }
  }

  // Upload final batch
  if (batch.length > 0) {
    console.log(`\n☁️ Subindo lote final de ${batch.length} capítulos para o Supabase...`);
    const { error } = await supabase
      .from('capitulos_biblia')
      .upsert(batch, { onConflict: 'id' });

    if (error) {
      console.error(`❌ Erro ao enviar lote final:`, error.message);
    } else {
      console.log(`✅ Enviado com sucesso.`);
    }
  }

  console.log(`\n==================================================`);
  console.log(`🎉 BANCO DE DADOS POPULADO COM SUCESSO!`);
  console.log(`🔥 Total de ${totalChapters} capítulos da versão NVI cadastrados na nuvem.`);
  console.log(`🚀 Custo de API original: EXATAMENTE 0 CHAMADAS.`);
  console.log(`==================================================`);
}

seedBible().catch(err => {
  console.error("❌ Erro fatal na semeadura:", err);
});
