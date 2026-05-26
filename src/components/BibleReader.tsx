import { useState, useEffect, useRef } from 'react';
import { useBible } from '../hooks/useBible';
import type { Verse } from '../hooks/useBible';
import { ChevronLeft, ChevronRight, BookOpen, Star, Copy, PenTool, Sparkles, X, Search, Palette } from 'lucide-react';
import { explainVerseWithAI } from '../services/gemini';
import { ReadingPlans } from './ReadingPlans';
import { VerseCardModal } from './VerseCardModal';
import type { PlanProgress } from '../types';

interface BibleReaderProps {
  onStartDevotional: (verseRef: string, verseText: string) => void;
  savedHighlights: string[]; // List of highlighted coordinates "bookId-chapter-verseNum"
  onToggleHighlight: (key: string) => void;
  geminiApiKey?: string;
  onChangeGeminiKey?: (key: string) => void;
  readingProgress: PlanProgress[];
  onJoinPlan: (planId: string) => void;
  onCompleteDay: (planId: string, day: number) => void;
  targetPassage?: { bookId: string; chapter: number; verse?: number } | null;
  onClearTargetPassage?: () => void;
  activeSubView?: 'bible' | 'plans';
  onChangeSubView?: (subView: 'bible' | 'plans') => void;
  onReportReadingTime?: (bookId: string, bookName: string, chapter: number, seconds: number) => void;
}

export function BibleReader({
  onStartDevotional,
  savedHighlights,
  onToggleHighlight,
  geminiApiKey = '',
  onChangeGeminiKey,
  readingProgress,
  onJoinPlan,
  onCompleteDay,
  targetPassage,
  onClearTargetPassage,
  activeSubView: activeSubViewProp,
  onChangeSubView,
  onReportReadingTime
}: BibleReaderProps) {
  // Use custom hook
  const {
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
    books
  } = useBible('genesis', 1, 'nvi');

  const [showBookSelector, setShowBookSelector] = useState(false);
  const [showChapterSelector, setShowChapterSelector] = useState(false);
  const [selectedVerse, setSelectedVerse] = useState<number | null>(null);
  
  // Local Database in memory loaded from imported public json
  const [localBibleData, setLocalBibleData] = useState<any | null>(null);

  // AI Explainer State Variables
  const [showAIDrawer, setShowAIDrawer] = useState(false);
  const [aiExplanation, setAIExplanation] = useState('');
  const [loadingAI, setLoadingAI] = useState(false);
  const [aiError, setAIError] = useState<string | null>(null);
  const [localKeyInput, setLocalKeyInput] = useState('');

  // Switcher states for plans and card modal (sync with parent state)
  const [localActiveSubView, setLocalActiveSubView] = useState<'bible' | 'plans'>('bible');
  const activeSubView = activeSubViewProp || localActiveSubView;
  const setActiveSubView = onChangeSubView || setLocalActiveSubView;
  
  const [showCardModal, setShowCardModal] = useState(false);

  // Timer tracking variables
  const timerRef = useRef<number | null>(null);
  const [secondsSpent, setSecondsSpent] = useState(0);
  const lastReportedRef = useRef(0);

  // Effect to navigate to specific verse when redirected from Verse of the Day
  useEffect(() => {
    if (targetPassage) {
      setCurrentBookId(targetPassage.bookId);
      setCurrentChapter(targetPassage.chapter);
      setActiveSubView('bible');
      if (targetPassage.verse) {
        setSelectedVerse(targetPassage.verse);
      }
      if (onClearTargetPassage) {
        onClearTargetPassage();
      }
    }
  }, [targetPassage]);

  // Effect to track reading time spent in standard Scripture view
  useEffect(() => {
    if (activeSubView !== 'bible' || loading || !currentBookId || !currentChapter) {
      // Report any unreported time before stopping
      if (secondsSpent > lastReportedRef.current && onReportReadingTime) {
        onReportReadingTime(currentBookId, currentBook.name, currentChapter, secondsSpent - lastReportedRef.current);
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    // Reset on chapter/book change
    setSecondsSpent(0);
    lastReportedRef.current = 0;

    timerRef.current = window.setInterval(() => {
      setSecondsSpent(prev => prev + 1);
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [activeSubView, loading, currentBookId, currentChapter]);

  // Periodically report accumulated seconds (every 30s) without resetting display
  useEffect(() => {
    const unreported = secondsSpent - lastReportedRef.current;
    if (unreported >= 30) {
      if (onReportReadingTime) {
        onReportReadingTime(currentBookId, currentBook.name, currentChapter, unreported);
      }
      lastReportedRef.current = secondsSpent;
    }
  }, [secondsSpent, currentBookId, currentChapter, onReportReadingTime, currentBook.name]);

  // Handle AI Explanation call
  const handleExplainVerse = async () => {
    if (selectedVerse === null) return;
    const verse = displayVerses.find(v => v.number === selectedVerse);
    if (!verse) return;

    const verseRef = `${currentBook.name} ${currentChapter}:${selectedVerse}`;
    const verseText = verse.text;

    setAIExplanation('');
    setAIError(null);
    setLoadingAI(true);
    setShowAIDrawer(true);

    try {
      const explanation = await explainVerseWithAI(verseRef, verseText, geminiApiKey);
      setAIExplanation(explanation);
    } catch (err: any) {
      console.error(err);
      setAIError(err.message || 'Erro ao carregar a explicação da inteligência artificial.');
    } finally {
      setLoadingAI(false);
    }
  };

  const handleSaveLocalKey = () => {
    if (!localKeyInput.trim()) return;
    if (onChangeGeminiKey) {
      onChangeGeminiKey(localKeyInput.trim());
      alert('Chave de API salva com sucesso! Explicando versículo...');
      // Re-trigger explain
      setTimeout(() => {
        const verse = displayVerses.find(v => v.number === selectedVerse);
        if (verse) {
          const verseRef = `${currentBook.name} ${currentChapter}:${selectedVerse}`;
          setLoadingAI(true);
          setAIError(null);
          explainVerseWithAI(verseRef, verse.text, localKeyInput.trim())
            .then(res => setAIExplanation(res))
            .catch(err => setAIError(err.message))
            .finally(() => setLoadingAI(false));
        }
      }, 100);
    }
  };

  const containerRef = useRef<HTMLDivElement>(null);

  // Load the full offline NVI Bible from /bible-nvi.json if available
  useEffect(() => {
    async function loadLocalDb() {
      try {
        const response = await fetch('/bible-nvi.json');
        if (response.ok) {
          const data = await response.json();
          setLocalBibleData(data);
          console.log("Offline NVI Bible loaded successfully in browser memory.");
        }
      } catch (e) {
        console.warn("Local NVI Bible JSON not found or could not be loaded. Falling back to CDN chapter loading.", e);
      }
    }
    loadLocalDb();
  }, []);

  // Determine the active source of verses
  // If local NVI database is loaded and version is NVI, we query it instantly in memory!
  let displayVerses: Verse[] = [];
  let isLocalSource = false;

  if (localBibleData && currentVersion === 'nvi') {
    const bookData = localBibleData[currentBookId];
    if (bookData) {
      const chapterVerses = bookData[currentChapter];
      if (Array.isArray(chapterVerses)) {
        displayVerses = chapterVerses.map((txt: string, index: number) => ({
          number: index + 1,
          text: txt
        }));
        isLocalSource = true;
      } else if (chapterVerses && typeof chapterVerses === 'object') {
        displayVerses = Object.keys(chapterVerses).map(key => ({
          number: parseInt(key),
          text: chapterVerses[key]
        }));
        isLocalSource = true;
      }
    }
  }

  // Fallback to CDN hook contents
  if (displayVerses.length === 0 && chapterContent) {
    displayVerses = chapterContent.verses;
  }

  // Reset selected verse when chapter changes
  useEffect(() => {
    setSelectedVerse(null);
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
  }, [currentBookId, currentChapter]);

  const handleBookSelect = (bookId: string) => {
    setCurrentBookId(bookId);
    setCurrentChapter(1);
    setShowBookSelector(false);
    setShowChapterSelector(true);
  };

  const handleChapterSelect = (chapterNum: number) => {
    setCurrentChapter(chapterNum);
    setShowChapterSelector(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Versículo copiado para a área de transferência!');
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 4rem)', gap: '1rem' }}>
      {/* Header Selector Bar */}
      <div className="glass-panel" style={{
        padding: '1rem 1.5rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        
        {/* Book and Chapter Selectors */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {activeSubView === 'bible' ? (
            <>
              <button 
                onClick={() => {
                  setShowBookSelector(!showBookSelector);
                  setShowChapterSelector(false);
                }}
                className="btn btn-secondary"
                style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid var(--accent-gold)' }}
              >
                <BookOpen size={18} style={{ color: 'var(--accent-gold)' }} />
                {currentBook.name}
              </button>

              <button 
                onClick={() => {
                  setShowChapterSelector(!showChapterSelector);
                  setShowBookSelector(false);
                }}
                className="btn btn-secondary"
                style={{ fontWeight: 700 }}
              >
                Cap. {currentChapter}
              </button>
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BookOpen size={18} style={{ color: 'var(--accent-gold)' }} />
              <span style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--accent-gold)', fontFamily: 'var(--font-serif)' }}>Planos de Leitura</span>
            </div>
          )}
        </div>

        {/* Source and Version Switcher & View Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {activeSubView === 'bible' && (
            <>
              {secondsSpent > 0 && (
                <span className="badge badge-gold animate-fade-in" style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  ⏱️ MEDITANDO: {Math.floor(secondsSpent / 60)}m {secondsSpent % 60}s
                </span>
              )}
              {isLocalSource && (
                <span className="badge badge-gold" style={{ fontSize: '0.75rem' }}>BANCO LOCAL OFFLINE</span>
              )}
              
              <div style={{
                background: 'var(--bg-primary)',
                padding: '0.25rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--glass-border)',
                display: 'flex',
                gap: '0.25rem'
              }}>
                <button
                  onClick={() => setCurrentVersion('nvi')}
                  style={{
                    background: currentVersion === 'nvi' ? 'var(--accent-gold)' : 'transparent',
                    color: currentVersion === 'nvi' ? 'var(--bg-primary)' : 'var(--text-secondary)',
                    border: 'none',
                    padding: '0.35rem 0.75rem',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)'
                  }}
                >
                  NVI
                </button>
                <button
                  onClick={() => setCurrentVersion('acf')}
                  style={{
                    background: currentVersion === 'acf' ? 'var(--accent-gold)' : 'transparent',
                    color: currentVersion === 'acf' ? 'var(--bg-primary)' : 'var(--text-secondary)',
                    border: 'none',
                    padding: '0.35rem 0.75rem',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)'
                  }}
                >
                  ACF
                </button>
              </div>
            </>
          )}

          {/* Sub-view Toggle */}
          <div style={{
            background: 'var(--bg-primary)',
            padding: '0.25rem',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--glass-border)',
            display: 'flex',
            gap: '0.25rem'
          }}>
            <button
              onClick={() => setActiveSubView('bible')}
              style={{
                background: activeSubView === 'bible' ? 'var(--accent-gold)' : 'transparent',
                color: activeSubView === 'bible' ? 'var(--bg-primary)' : 'var(--text-secondary)',
                border: 'none',
                padding: '0.35rem 0.75rem',
                borderRadius: '4px',
                fontSize: '0.75rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)'
              }}
            >
              Leitura
            </button>
            <button
              onClick={() => setActiveSubView('plans')}
              style={{
                background: activeSubView === 'plans' ? 'var(--accent-gold)' : 'transparent',
                color: activeSubView === 'plans' ? 'var(--bg-primary)' : 'var(--text-secondary)',
                border: 'none',
                padding: '0.35rem 0.75rem',
                borderRadius: '4px',
                fontSize: '0.75rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)'
              }}
            >
              Planos
            </button>
          </div>
        </div>

      </div>

      {/* Selectors Modals/Grids (overlay) */}
      <div style={{ position: 'relative' }}>
        
        {/* Book Selector Grid */}
        {showBookSelector && (
          <div className="glass-panel" style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            maxHeight: '400px',
            overflowY: 'auto',
            zIndex: 50,
            padding: '1.5rem',
            background: 'var(--bg-secondary)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem'
          }}>
            <div>
              <h4 style={{ color: 'var(--accent-gold)', marginBottom: '0.75rem' }}>Antigo Testamento</h4>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))',
                gap: '0.5rem'
              }}>
                {books.filter(b => b.testament === 'AT').map(book => (
                  <button
                    key={book.id}
                    onClick={() => handleBookSelect(book.id)}
                    className="btn btn-secondary"
                    style={{
                      padding: '0.5rem',
                      fontSize: '0.85rem',
                      background: currentBookId === book.id ? 'var(--accent-gold-muted)' : 'rgba(0,0,0,0.2)',
                      borderColor: currentBookId === book.id ? 'var(--accent-gold)' : 'var(--glass-border)'
                    }}
                  >
                    {book.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h4 style={{ color: 'var(--accent-blue)', marginBottom: '0.75rem' }}>Novo Testamento</h4>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))',
                gap: '0.5rem'
              }}>
                {books.filter(b => b.testament === 'NT').map(book => (
                  <button
                    key={book.id}
                    onClick={() => handleBookSelect(book.id)}
                    className="btn btn-secondary"
                    style={{
                      padding: '0.5rem',
                      fontSize: '0.85rem',
                      background: currentBookId === book.id ? 'var(--accent-gold-muted)' : 'rgba(0,0,0,0.2)',
                      borderColor: currentBookId === book.id ? 'var(--accent-gold)' : 'var(--glass-border)'
                    }}
                  >
                    {book.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Chapter Selector Grid */}
        {showChapterSelector && (
          <div className="glass-panel" style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            maxHeight: '300px',
            overflowY: 'auto',
            zIndex: 50,
            padding: '1.5rem',
            background: 'var(--bg-secondary)'
          }}>
            <h4 style={{ color: 'var(--accent-gold)', marginBottom: '1rem' }}>Selecione o Capítulo: {currentBook.name}</h4>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(50px, 1fr))',
              gap: '0.5rem'
            }}>
              {Array.from({ length: currentBook.chapters }, (_, i) => i + 1).map(num => (
                <button
                  key={num}
                  onClick={() => handleChapterSelect(num)}
                  className="btn btn-secondary"
                  style={{
                    padding: '0.75rem 0',
                    fontSize: '0.95rem',
                    background: currentChapter === num ? 'var(--accent-gold)' : 'rgba(0,0,0,0.2)',
                    color: currentChapter === num ? 'var(--bg-primary)' : 'var(--text-primary)',
                    borderColor: currentChapter === num ? 'var(--accent-gold)' : 'var(--glass-border)'
                  }}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>
        )}

      </div>

      {activeSubView === 'plans' ? (
        <div 
          className="glass-panel" 
          style={{
            flex: 1,
            padding: '2rem 2.5rem',
            overflowY: 'auto',
            background: 'rgba(10, 14, 23, 0.4)'
          }}
        >
          <ReadingPlans 
            progress={readingProgress} 
            onJoinPlan={onJoinPlan} 
            onCompleteDay={onCompleteDay} 
            onNavigateToChapter={(bookId, chap) => { 
              setCurrentBookId(bookId); 
              setCurrentChapter(chap); 
              setActiveSubView('bible'); 
            }} 
          />
        </div>
      ) : (
        /* Main Scripture Text Container */
        <div 
          ref={containerRef}
          className="glass-panel" 
          style={{
            flex: 1,
            padding: '2rem 2.5rem',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            background: 'rgba(10, 14, 23, 0.4)'
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* Chapter Title Banner */}
            <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                BÍBLIA SAGRADA • {currentVersion.toUpperCase()}
              </span>
              <h3 style={{ fontSize: '2.25rem', fontFamily: 'var(--font-serif)', fontWeight: 400, marginTop: '0.5rem' }}>
                {currentBook.name} {currentChapter}
              </h3>
              <div style={{
                width: '40px',
                height: '3px',
                background: 'var(--accent-gold)',
                margin: '0.75rem auto 0'
              }} />
            </div>

            {/* Scripture Reading Content */}
            {loading && displayVerses.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
                <div className="pulse-gold" style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--accent-gold-muted)', margin: '0 auto 1rem' }} />
                Carregando as escrituras sagradas...
              </div>
            ) : error && displayVerses.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--accent-red)' }}>
                {error}
              </div>
            ) : (
              <div className="scripture-text">
                {displayVerses.map((verse) => {
                  const highlightKey = `${currentBookId}-${currentChapter}-${verse.number}`;
                  const isHighlighted = savedHighlights.includes(highlightKey);
                  const isSelected = selectedVerse === verse.number;

                  return (
                    <span 
                      key={verse.number}
                      className={`verse-item ${isHighlighted ? 'highlighted' : ''}`}
                      onClick={() => setSelectedVerse(isSelected ? null : verse.number)}
                      style={{
                        position: 'relative',
                        borderBottom: isSelected ? '2px solid var(--accent-blue)' : undefined,
                        backgroundColor: isSelected ? 'rgba(56, 189, 248, 0.08)' : undefined
                      }}
                    >
                      <span className="verse-num">{verse.number}</span>
                      {verse.text}{' '}
                    </span>
                  );
                })}
              </div>
            )}

          </div>

          {/* Dynamic Action Toolbar for Selected Verse */}
          {selectedVerse !== null && (
            <div className="glass-panel animate-fade-in" style={{
              position: 'sticky',
              bottom: '1rem',
              background: 'var(--bg-tertiary)',
              padding: '0.75rem 1.5rem',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '2rem',
              border: '1px solid var(--accent-blue)',
              boxShadow: '0 0 15px rgba(56, 189, 248, 0.15)',
              zIndex: 10
            }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--accent-blue)', fontWeight: 700 }}>
                  VERSÍCULO SELECIONADO
                </span>
                <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                  {currentBook.name} {currentChapter}:{selectedVerse}
                </span>
              </div>
              
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button 
                  onClick={handleExplainVerse}
                  className="btn btn-secondary animate-fade-in"
                  style={{
                    padding: '0.5rem 0.75rem',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    border: '1px solid var(--accent-gold)'
                  }}
                >
                  <Sparkles size={16} style={{ color: 'var(--accent-gold)' }} />
                  <span>IA Explicar</span>
                </button>

                <button 
                  onClick={() => setShowCardModal(true)}
                  className="btn btn-secondary"
                  style={{
                    padding: '0.5rem 0.75rem',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    border: '1px solid var(--accent-gold)'
                  }}
                  title="Criar Card de Imagem"
                >
                  <Palette size={16} style={{ color: 'var(--accent-gold)' }} />
                  <span>Gerar Card</span>
                </button>

                <button 
                  onClick={() => {
                    const key = `${currentBookId}-${currentChapter}-${selectedVerse}`;
                    onToggleHighlight(key);
                  }}
                  className="btn btn-secondary"
                  style={{ padding: '0.5rem', borderRadius: '8px' }}
                  title="Destacar Versículo"
                >
                  <Star size={16} style={{ 
                    color: savedHighlights.includes(`${currentBookId}-${currentChapter}-${selectedVerse}`) ? 'var(--accent-gold)' : 'var(--text-secondary)',
                    fill: savedHighlights.includes(`${currentBookId}-${currentChapter}-${selectedVerse}`) ? 'var(--accent-gold)' : 'none'
                  }} />
                </button>

                <button 
                  onClick={() => {
                    const verse = displayVerses.find(v => v.number === selectedVerse);
                    if (verse) copyToClipboard(`"${verse.text}" (${currentBook.name} ${currentChapter}:${selectedVerse})`);
                  }}
                  className="btn btn-secondary"
                  style={{ padding: '0.5rem', borderRadius: '8px' }}
                  title="Copiar Versículo"
                >
                  <Copy size={16} />
                </button>

                <button 
                  onClick={() => {
                    const verse = displayVerses.find(v => v.number === selectedVerse);
                    if (verse) {
                      onStartDevotional(
                        `${currentBook.name} ${currentChapter}:${selectedVerse}`,
                        verse.text
                      );
                    }
                  }}
                  className="btn btn-primary"
                  style={{ padding: '0.5rem 1rem', borderRadius: '8px', fontSize: '0.85rem' }}
                >
                  <PenTool size={16} />
                  Devocional
                </button>
              </div>
            </div>
          )}

          {/* Footer Navigation Bar */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '2rem',
            borderTop: '1px solid var(--glass-border)',
            paddingTop: '1.5rem'
          }}>
            <button 
              onClick={prevChapter}
              className="btn btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}
            >
              <ChevronLeft size={18} />
              Anterior
            </button>

            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
              {currentBook.name} • {currentChapter} de {currentBook.chapters}
            </span>

            <button 
              onClick={nextChapter}
              className="btn btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}
            >
              Próximo
              <ChevronRight size={18} />
            </button>
          </div>

        </div>
      )}

      {/* AI Explanation Slide Drawer */}
      {showAIDrawer && (
        <div style={{
          position: 'fixed',
          top: 0,
          right: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          zIndex: 2000,
          display: 'flex',
          justifyContent: 'flex-end',
          animation: 'fadeIn 0.25s ease'
        }} onClick={() => setShowAIDrawer(false)}>
          <div className="glass-panel animate-fade-in" style={{
            width: '100%',
            maxWidth: '550px',
            height: '100%',
            background: 'var(--bg-secondary)',
            borderLeft: '1px solid var(--accent-gold)',
            borderRadius: 0,
            padding: '2.5rem 2rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
            overflowY: 'auto',
            boxShadow: 'var(--shadow-lg)'
          }} onClick={(e) => e.stopPropagation()}>
            
            {/* Drawer Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Sparkles size={20} style={{ color: 'var(--accent-gold)' }} />
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Assistente de Estudo IA</h3>
              </div>
              <button 
                onClick={() => setShowAIDrawer(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Selected Verse Context */}
            <div style={{
              background: 'rgba(0,0,0,0.15)',
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              borderLeft: '3px solid var(--accent-gold)'
            }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--accent-gold)', fontWeight: 700 }}>
                PASSAGEM SELECIONADA
              </span>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: '0.25rem 0' }}>
                {currentBook.name} {currentChapter}:{selectedVerse}
              </h4>
              <p className="scripture-text" style={{ fontSize: '0.95rem', fontStyle: 'italic', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                "{displayVerses.find(v => v.number === selectedVerse)?.text}"
              </p>
            </div>

            {/* Main Content Area */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              {loadingAI ? (
                /* Loading Skeleton */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1rem 0' }}>
                  <div style={{ height: '20px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', width: '40%', animation: 'pulse 1.5s infinite' }}></div>
                  <div style={{ height: '14px', background: 'rgba(255,255,255,0.03)', borderRadius: '4px', width: '100%', animation: 'pulse 1.5s infinite' }}></div>
                  <div style={{ height: '14px', background: 'rgba(255,255,255,0.03)', borderRadius: '4px', width: '90%', animation: 'pulse 1.5s infinite' }}></div>
                  <div style={{ height: '14px', background: 'rgba(255,255,255,0.03)', borderRadius: '4px', width: '95%', animation: 'pulse 1.5s infinite' }}></div>
                  
                  <div style={{ height: '20px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', width: '50%', marginTop: '1rem', animation: 'pulse 1.5s infinite' }}></div>
                  <div style={{ height: '14px', background: 'rgba(255,255,255,0.03)', borderRadius: '4px', width: '100%', animation: 'pulse 1.5s infinite' }}></div>
                  <div style={{ height: '14px', background: 'rgba(255,255,255,0.03)', borderRadius: '4px', width: '85%', animation: 'pulse 1.5s infinite' }}></div>
                  
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '2rem' }}>
                    Consultando as escrituras com Inteligência Artificial...
                  </span>
                </div>
              ) : aiError ? (
                /* Error State */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1rem 0' }}>
                  <div style={{
                    background: 'rgba(248, 113, 113, 0.05)',
                    border: '1px solid rgba(248, 113, 113, 0.2)',
                    padding: '1.25rem',
                    borderRadius: 'var(--radius-md)',
                    color: '#f87171',
                    fontSize: '0.9rem',
                    lineHeight: '1.5'
                  }}>
                    {aiError.includes('não configurada') ? (
                      <div>
                        <span style={{ fontWeight: 'bold' }}>⚠️ Assistente IA Não Configurado</span>
                        <p style={{ marginTop: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                          Para usar a IA, cole sua chave gratuita do Gemini abaixo. Ela ficará salva localmente e de forma totalmente segura.
                        </p>
                      </div>
                    ) : aiError}
                  </div>

                  {aiError.includes('não configurada') && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <div className="form-group" style={{ margin: 0 }}>
                        <input 
                          type="password" 
                          value={localKeyInput}
                          onChange={(e) => setLocalKeyInput(e.target.value)}
                          className="input-field" 
                          placeholder="Cole sua API Key do Gemini (AI_zaSy...)"
                        />
                      </div>
                      
                      <button 
                        onClick={handleSaveLocalKey}
                        className="btn btn-primary"
                        style={{ width: '100%', fontSize: '0.9rem' }}
                      >
                        Salvar e Habilitar Explicação
                      </button>

                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                        Não tem uma chave? Crie uma grátis em 1 minuto no <a href="https://aistudio.google.com/" target="_blank" rel="noreferrer" style={{ color: 'var(--accent-blue)', textDecoration: 'underline' }}>Google AI Studio</a>.
                      </div>
                    </div>
                  )}

                  {/* Fallback traditional Search Button */}
                  <a 
                    href={`https://www.google.com/search?q=comentario+biblico+${currentBook.name}+${currentChapter}:${selectedVerse}`}
                    target="_blank" 
                    rel="noreferrer"
                    className="btn btn-secondary"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      marginTop: '1rem'
                    }}
                  >
                    <Search size={16} /> Pesquisar Comentário no Google
                  </a>
                </div>
              ) : (
                /* Successful AI commentary Display */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', flex: 1 }}>
                  <div style={{
                    fontSize: '0.95rem',
                    lineHeight: '1.6',
                    whiteSpace: 'pre-wrap',
                    color: 'var(--text-primary)',
                    maxHeight: '60vh',
                    overflowY: 'auto',
                    paddingRight: '0.5rem'
                  }}>
                    {aiExplanation}
                  </div>

                  {/* Action Toolbar to copy explanation into new Devotional */}
                  <div style={{
                    borderTop: '1px solid var(--glass-border)',
                    paddingTop: '1rem',
                    display: 'flex',
                    justifyContent: 'flex-end',
                    marginTop: 'auto'
                  }}>
                    <button
                      onClick={() => {
                        const verse = displayVerses.find(v => v.number === selectedVerse);
                        if (verse) {
                          onStartDevotional(
                            `${currentBook.name} ${currentChapter}:${selectedVerse}`,
                            verse.text + `\n\n📖 Explicação Teológica IA:\n${aiExplanation}`
                          );
                          setShowAIDrawer(false);
                        }
                      }}
                      className="btn btn-primary"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.65rem 1.25rem',
                        fontSize: '0.85rem'
                      }}
                    >
                      <PenTool size={16} /> Anexar ao meu Diário Devocional
                    </button>
                  </div>
                </div>
              )}

            </div>

          </div>
        </div>
      )}

      {/* Canvas Verse Card Modal */}
      <VerseCardModal
        isOpen={showCardModal}
        onClose={() => setShowCardModal(false)}
        verseRef={`${currentBook.name} ${currentChapter}:${selectedVerse}`}
        verseText={displayVerses.find(v => v.number === selectedVerse)?.text || ''}
      />

    </div>
  );
}
