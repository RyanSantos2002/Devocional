import { useState, useEffect } from 'react';
import { fetchBibleChapterFromSupabase, saveBibleChapterToSupabase } from '../services/supabase';

export interface Book {
  id: string; // API identification (e.g. "genesis", "john")
  name: string; // Display name in Portuguese
  abbrev: string; // Portuguese abbreviation
  chapters: number; // Total chapters
  testament: 'AT' | 'NT'; // Old/New Testament
}

export interface Verse {
  number: number;
  text: string;
}

export interface ChapterData {
  book: string;
  chapter: number;
  verses: Verse[];
  version: 'nvi' | 'acf';
}

export const BIBLE_BOOKS: Book[] = [
  // Antigo Testamento (AT)
  { id: 'genesis', name: 'Gênesis', abbrev: 'Gn', chapters: 50, testament: 'AT' },
  { id: 'exodus', name: 'Êxodo', abbrev: 'Êx', chapters: 40, testament: 'AT' },
  { id: 'leviticus', name: 'Levítico', abbrev: 'Lv', chapters: 27, testament: 'AT' },
  { id: 'numbers', name: 'Números', abbrev: 'Nm', chapters: 36, testament: 'AT' },
  { id: 'deuteronomy', name: 'Deuteronômio', abbrev: 'Dt', chapters: 34, testament: 'AT' },
  { id: 'joshua', name: 'Josué', abbrev: 'Js', chapters: 24, testament: 'AT' },
  { id: 'judges', name: 'Juízes', abbrev: 'Jz', chapters: 21, testament: 'AT' },
  { id: 'ruth', name: 'Rute', abbrev: 'Rt', chapters: 4, testament: 'AT' },
  { id: '1samuel', name: '1 Samuel', abbrev: '1Sm', chapters: 31, testament: 'AT' },
  { id: '2samuel', name: '2 Samuel', abbrev: '2Sm', chapters: 24, testament: 'AT' },
  { id: '1kings', name: '1 Reis', abbrev: '1Rs', chapters: 22, testament: 'AT' },
  { id: '2kings', name: '2 Reis', abbrev: '2Rs', chapters: 25, testament: 'AT' },
  { id: '1chronicles', name: '1 Crônicas', abbrev: '1Cr', chapters: 29, testament: 'AT' },
  { id: '2chronicles', name: '2 Crônicas', abbrev: '2Cr', chapters: 36, testament: 'AT' },
  { id: 'ezra', name: 'Esdras', abbrev: 'Ed', chapters: 10, testament: 'AT' },
  { id: 'nehemiah', name: 'Neemias', abbrev: 'Ne', chapters: 13, testament: 'AT' },
  { id: 'esther', name: 'Ester', abbrev: 'Et', chapters: 10, testament: 'AT' },
  { id: 'job', name: 'Jó', abbrev: 'Jó', chapters: 42, testament: 'AT' },
  { id: 'psalms', name: 'Salmos', abbrev: 'Sl', chapters: 150, testament: 'AT' },
  { id: 'proverbs', name: 'Provérbios', abbrev: 'Pv', chapters: 31, testament: 'AT' },
  { id: 'ecclesiastes', name: 'Eclesiastes', abbrev: 'Ec', chapters: 12, testament: 'AT' },
  { id: 'songofsolomon', name: 'Cânticos', abbrev: 'Ct', chapters: 8, testament: 'AT' },
  { id: 'isaiah', name: 'Isaías', abbrev: 'Is', chapters: 66, testament: 'AT' },
  { id: 'jeremiah', name: 'Jeremias', abbrev: 'Jr', chapters: 52, testament: 'AT' },
  { id: 'lamentations', name: 'Lamentações', abbrev: 'Lm', chapters: 5, testament: 'AT' },
  { id: 'ezekiel', name: 'Ezequiel', abbrev: 'Ez', chapters: 48, testament: 'AT' },
  { id: 'daniel', name: 'Daniel', abbrev: 'Dn', chapters: 12, testament: 'AT' },
  { id: 'hosea', name: 'Oseias', abbrev: 'Os', chapters: 14, testament: 'AT' },
  { id: 'joel', name: 'Joel', abbrev: 'Jl', chapters: 3, testament: 'AT' },
  { id: 'amos', name: 'Amós', abbrev: 'Am', chapters: 9, testament: 'AT' },
  { id: 'obadiah', name: 'Obadias', abbrev: 'Ob', chapters: 1, testament: 'AT' },
  { id: 'jonah', name: 'Jonas', abbrev: 'Jon', chapters: 4, testament: 'AT' },
  { id: 'micah', name: 'Miqueias', abbrev: 'Mq', chapters: 7, testament: 'AT' },
  { id: 'nahum', name: 'Naum', abbrev: 'Na', chapters: 3, testament: 'AT' },
  { id: 'habakkuk', name: 'Habacuque', abbrev: 'Hc', chapters: 3, testament: 'AT' },
  { id: 'zephaniah', name: 'Sofonias', abbrev: 'Sf', chapters: 3, testament: 'AT' },
  { id: 'haggai', name: 'Ageu', abbrev: 'Ag', chapters: 2, testament: 'AT' },
  { id: 'zechariah', name: 'Zacarias', abbrev: 'Zc', chapters: 14, testament: 'AT' },
  { id: 'malachi', name: 'Malaquias', abbrev: 'Ml', chapters: 4, testament: 'AT' },

  // Novo Testamento (NT)
  { id: 'matthew', name: 'Mateus', abbrev: 'Mt', chapters: 28, testament: 'NT' },
  { id: 'mark', name: 'Marcos', abbrev: 'Mc', chapters: 16, testament: 'NT' },
  { id: 'luke', name: 'Lucas', abbrev: 'Lc', chapters: 24, testament: 'NT' },
  { id: 'john', name: 'João', abbrev: 'Jo', chapters: 21, testament: 'NT' },
  { id: 'acts', name: 'Atos', abbrev: 'At', chapters: 28, testament: 'NT' },
  { id: 'romans', name: 'Romanos', abbrev: 'Rm', chapters: 16, testament: 'NT' },
  { id: '1corinthians', name: '1 Coríntios', abbrev: '1Co', chapters: 16, testament: 'NT' },
  { id: '2corinthians', name: '2 Coríntios', abbrev: '2Co', chapters: 13, testament: 'NT' },
  { id: 'galatians', name: 'Gálatas', abbrev: 'Gl', chapters: 6, testament: 'NT' },
  { id: 'ephesians', name: 'Efésios', abbrev: 'Ef', chapters: 6, testament: 'NT' },
  { id: 'philippians', name: 'Filipenses', abbrev: 'Fp', chapters: 4, testament: 'NT' },
  { id: 'colossians', name: 'Colossenses', abbrev: 'Cl', chapters: 4, testament: 'NT' },
  { id: '1thessalonians', name: '1 Tessalonicenses', abbrev: '1Ts', chapters: 5, testament: 'NT' },
  { id: '2thessalonians', name: '2 Tessalonicenses', abbrev: '2Ts', chapters: 3, testament: 'NT' },
  { id: '1timothy', name: '1 Timóteo', abbrev: '1Tm', chapters: 6, testament: 'NT' },
  { id: '2timothy', name: '2 Timóteo', abbrev: '2Tm', chapters: 4, testament: 'NT' },
  { id: 'titus', name: 'Tito', abbrev: 'Tt', chapters: 3, testament: 'NT' },
  { id: 'philemon', name: 'Filemom', abbrev: 'Fl', chapters: 1, testament: 'NT' },
  { id: 'hebrews', name: 'Hebreus', abbrev: 'Hb', chapters: 13, testament: 'NT' },
  { id: 'james', name: 'Tiago', abbrev: 'Tg', chapters: 5, testament: 'NT' },
  { id: '1peter', name: '1 Pedro', abbrev: '1Pe', chapters: 5, testament: 'NT' },
  { id: '2peter', name: '2 Pedro', abbrev: '2Pe', chapters: 3, testament: 'NT' },
  { id: '1john', name: '1 João', abbrev: '1Jo', chapters: 5, testament: 'NT' },
  { id: '2john', name: '2 João', abbrev: '2Jo', chapters: 1, testament: 'NT' },
  { id: '3john', name: '3 João', abbrev: '3Jo', chapters: 1, testament: 'NT' },
  { id: 'jude', name: 'Judas', abbrev: 'Jd', chapters: 1, testament: 'NT' },
  { id: 'revelation', name: 'Apocalipse', abbrev: 'Ap', chapters: 22, testament: 'NT' }
];

// Helper to get book by abbreviation or ID
export const getBookById = (id: string) => BIBLE_BOOKS.find(b => b.id === id);

export function useBible(initialBookId: string = 'genesis', initialChapter: number = 1, version: 'nvi' | 'acf' = 'nvi') {
  const [currentBookId, setCurrentBookId] = useState(initialBookId);
  const [currentChapter, setCurrentChapter] = useState(initialChapter);
  const [currentVersion, setCurrentVersion] = useState<'nvi' | 'acf'>(version);
  const [chapterContent, setChapterContent] = useState<ChapterData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentBook = getBookById(currentBookId) || BIBLE_BOOKS[0];

  useEffect(() => {
    let active = true;

    async function loadChapter() {
      const cacheKey = `bible-cache-${currentVersion}-${currentBookId}-${currentChapter}`;
      
      // 1. Check local cache first
      try {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed && parsed.verses && parsed.verses.length > 0) {
            setChapterContent(parsed);
            setError(null);
            return;
          }
        }
      } catch (err) {
        console.warn('Failed to read from localStorage cache:', err);
      }

      setLoading(true);
      setError(null);

      // 2. Check Supabase cloud cache (Proxy Cache Pattern)
      try {
        const supabaseVerses = await fetchBibleChapterFromSupabase(currentBookId, currentChapter, currentVersion);
        if (supabaseVerses && supabaseVerses.length > 0) {
          const formattedChapter: ChapterData = {
            book: currentBookId,
            chapter: currentChapter,
            verses: supabaseVerses,
            version: currentVersion
          };
          
          try {
            localStorage.setItem(cacheKey, JSON.stringify(formattedChapter));
          } catch (e) {}

          if (active) {
            setChapterContent(formattedChapter);
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.warn('Failed to query Supabase cache:', err);
      }

      // 3. Fetch from CDN API (as last fallback)
      try {
        const url = `https://cdn.jsdelivr.net/gh/wldeh/bible-api/bibles/${currentVersion}/books/${currentBookId}/chapters/${currentChapter}.json`;
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`Capítulo não disponível (${response.status})`);
        }
        
        const data = await response.json();
        let verses: Verse[] = [];
        
        if (Array.isArray(data)) {
          verses = data.map((v: any, index: number) => ({
            number: v.number || (index + 1),
            text: v.text || v.verse || ''
          }));
        } else if (data.verses && Array.isArray(data.verses)) {
          verses = data.verses.map((v: any) => ({
            number: parseInt(v.number || v.verse || 0),
            text: v.text || ''
          }));
        } else if (typeof data === 'object') {
          verses = Object.keys(data).map(key => ({
            number: parseInt(key),
            text: (data as any)[key]
          })).filter(v => !isNaN(v.number));
        }

        if (verses.length === 0) {
          throw new Error("Erro ao interpretar dados da Bíblia.");
        }

        const formattedChapter: ChapterData = {
          book: currentBookId,
          chapter: currentChapter,
          verses,
          version: currentVersion
        };

        if (active) {
          // Store in local storage for subsequent loads
          try {
            localStorage.setItem(cacheKey, JSON.stringify(formattedChapter));
          } catch (e) {}
          
          // Save to Supabase cache so other clients query it without hitting CDN API again!
          saveBibleChapterToSupabase(currentBookId, currentChapter, currentVersion, verses);

          setChapterContent(formattedChapter);
        }
      } catch (err: any) {
        console.error('Error fetching Bible chapter:', err);
        if (active) {
          const mockChapter: ChapterData = {
            book: currentBookId,
            chapter: currentChapter,
            verses: [
              { number: 1, text: `Você está offline ou a API falhou. O capítulo ${currentChapter} do livro ${currentBook.name} será carregado quando você estiver online.` },
              { number: 2, text: `No entanto, você pode continuar escrevendo seus devocionais no Diário offline normalmente!` },
              { number: 3, text: `"Lâmpada para os meus pés é tua palavra, e luz para o meu caminho." (Salmos 119:105)` }
            ],
            version: currentVersion
          };
          setChapterContent(mockChapter);
          setError(`Não foi possível carregar o texto da API (Usando versão offline de backup)`);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadChapter();

    return () => {
      active = false;
    };
  }, [currentBookId, currentChapter, currentVersion]);

  const nextChapter = () => {
    if (currentChapter < currentBook.chapters) {
      setCurrentChapter(currentChapter + 1);
    } else {
      // Go to next book
      const bookIndex = BIBLE_BOOKS.findIndex(b => b.id === currentBookId);
      if (bookIndex < BIBLE_BOOKS.length - 1) {
        setCurrentBookId(BIBLE_BOOKS[bookIndex + 1].id);
        setCurrentChapter(1);
      }
    }
  };

  const prevChapter = () => {
    if (currentChapter > 1) {
      setCurrentChapter(currentChapter - 1);
    } else {
      // Go to previous book, last chapter
      const bookIndex = BIBLE_BOOKS.findIndex(b => b.id === currentBookId);
      if (bookIndex > 0) {
        const prevBook = BIBLE_BOOKS[bookIndex - 1];
        setCurrentBookId(prevBook.id);
        setCurrentChapter(prevBook.chapters);
      }
    }
  };

  return {
    currentBook,
    currentBookId,
    currentChapter,
    currentVersion,
    chapterContent,
    loading,
    error,
    setCurrentBookId,
    setCurrentChapter,
    setCurrentVersion,
    nextChapter,
    prevChapter,
    books: BIBLE_BOOKS
  };
}
