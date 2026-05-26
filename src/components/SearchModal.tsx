import { useState, useEffect, useRef } from 'react';
import { Search, X, BookOpen, BookMarked } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';
import { BIBLE_BOOKS } from '../hooks/useBible';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type SearchResult = {
  type: 'journal' | 'bible_book';
  title: string;
  subtitle: string;
  action: () => void;
};

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const { journalEntries, setActiveTab, prayers } = useAppContext();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setResults([]);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Keyboard shortcut to open (Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const q = query.toLowerCase();
    const found: SearchResult[] = [];

    // Search Bible books
    BIBLE_BOOKS.forEach(book => {
      if (book.name.toLowerCase().includes(q) || book.abbrev.toLowerCase().includes(q) || book.id.includes(q)) {
        found.push({
          type: 'bible_book',
          title: book.name,
          subtitle: `${book.chapters} capitulos - ${book.testament === 'AT' ? 'Antigo' : 'Novo'} Testamento`,
          action: () => {
            setActiveTab('bible');
            onClose();
          },
        });
      }
    });

    // Search journal entries
    journalEntries.forEach(entry => {
      if (
        entry.reflection.toLowerCase().includes(q) ||
        entry.prayer.toLowerCase().includes(q) ||
        entry.gratitude.toLowerCase().includes(q) ||
        (entry.verseRef && entry.verseRef.toLowerCase().includes(q)) ||
        (entry.verseText && entry.verseText.toLowerCase().includes(q))
      ) {
        found.push({
          type: 'journal',
          title: entry.verseRef || `Devocional ${entry.date}`,
          subtitle: entry.reflection.substring(0, 80) + (entry.reflection.length > 80 ? '...' : ''),
          action: () => {
            setActiveTab('journal');
            onClose();
          },
        });
      }
    });

    // Search prayers
    prayers.forEach(prayer => {
      if (prayer.title.toLowerCase().includes(q) || prayer.description.toLowerCase().includes(q)) {
        found.push({
          type: 'journal',
          title: prayer.title,
          subtitle: prayer.description.substring(0, 80) + (prayer.description.length > 80 ? '...' : ''),
          action: () => {
            setActiveTab('journal');
            onClose();
          },
        });
      }
    });

    setResults(found.slice(0, 12));
  }, [query, journalEntries, prayers]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(0,0,0,0.7)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        zIndex: 3000,
        padding: '10vh 1.5rem 1.5rem',
        backdropFilter: 'blur(4px)',
      }}
      onClick={onClose}
    >
      <div
        className="glass-panel animate-fade-in"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '560px',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--accent-gold)',
          overflow: 'hidden',
        }}
      >
        {/* Search Input */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem 1.25rem', borderBottom: '1px solid var(--glass-border)' }}>
          <Search size={20} style={{ color: 'var(--accent-gold)', flexShrink: 0 }} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar livros, devocionais, oracoes..."
            className="input-field"
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              padding: '0.25rem',
              fontSize: '1rem',
            }}
          />
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '0.25rem' }}
            aria-label="Fechar busca"
          >
            <X size={18} />
          </button>
        </div>

        {/* Results */}
        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
          {query && results.length === 0 && (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Nenhum resultado para "{query}"
            </div>
          )}
          {results.map((result, i) => (
            <button
              key={i}
              onClick={result.action}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                width: '100%',
                padding: '0.85rem 1.25rem',
                background: 'transparent',
                border: 'none',
                borderBottom: '1px solid var(--glass-border)',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'background var(--transition-fast)',
                color: 'var(--text-primary)',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(212, 163, 89, 0.05)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              {result.type === 'bible_book' ? (
                <BookOpen size={18} style={{ color: 'var(--accent-gold)', flexShrink: 0 }} />
              ) : (
                <BookMarked size={18} style={{ color: 'var(--accent-blue)', flexShrink: 0 }} />
              )}
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {result.title}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {result.subtitle}
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Footer hint */}
        {!query && (
          <div style={{ padding: '0.75rem 1.25rem', borderTop: '1px solid var(--glass-border)', fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
            <span>Digite para buscar</span>
            <span><kbd style={{ background: 'var(--bg-tertiary)', padding: '0.1rem 0.4rem', borderRadius: '4px', fontSize: '0.7rem' }}>ESC</kbd> para fechar</span>
          </div>
        )}
      </div>
    </div>
  );
}
