import { useState, useEffect } from 'react';
import { Plus, Search, Trash2, Calendar, BookMarked, MessageSquare, Heart, Eye, Sparkles } from 'lucide-react';
import { PrayerWall } from './PrayerWall';
import type { JournalEntry, PrayerRequest } from '../types';

interface JournalProps {
  entries: JournalEntry[];
  onAddEntry: (entry: Omit<JournalEntry, 'id' | 'date'> & { shareWithDiscipleship?: boolean }) => void;
  onDeleteEntry: (id: string) => void;
  prefillVerseRef?: string;
  prefillVerseText?: string;
  onClearPrefill?: () => void;

  // Prayer Wall Props
  prayers: PrayerRequest[];
  onAddPrayer: (title: string, description: string) => void;
  onToggleAnswered: (id: string, answerText?: string) => void;
  onDeletePrayer: (id: string) => void;
}

export function Journal({ 
  entries, 
  onAddEntry, 
  onDeleteEntry, 
  prefillVerseRef, 
  prefillVerseText, 
  onClearPrefill,
  prayers,
  onAddPrayer,
  onToggleAnswered,
  onDeletePrayer
}: JournalProps) {
  const [activeMainTab, setActiveMainTab] = useState<'journal' | 'prayers'>('journal');
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Form fields
  const [verseRef, setVerseRef] = useState('');
  const [verseText, setVerseText] = useState('');
  const [reflection, setReflection] = useState('');
  const [application, setApplication] = useState('');
  const [gratitude, setGratitude] = useState('');
  const [prayer, setPrayer] = useState('');
  const [shareWithDiscipleship, setShareWithDiscipleship] = useState(false);

  // Selected entry for modal view
  const [viewingEntry, setViewingEntry] = useState<JournalEntry | null>(null);

  // Check if we have prefilled values from the Bible reader
  useEffect(() => {
    if (prefillVerseRef) {
      setVerseRef(prefillVerseRef);
      setVerseText(prefillVerseText || '');
      setIsCreating(true);
      setActiveMainTab('journal'); // guarantee we show the journal form
    }
  }, [prefillVerseRef, prefillVerseText]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reflection.trim()) {
      alert('Por favor, escreva sua reflexão devocional antes de salvar.');
      return;
    }

    onAddEntry({
      bookId: '', 
      bookName: verseRef || 'Geral',
      chapter: 1,
      reflection: reflection + (application ? `\n\n🎯 Aplicação Prática:\n${application}` : ''),
      prayer,
      gratitude,
      verseRef,
      verseText,
      shareWithDiscipleship // Pass the public shared feed parameter!
    });

    // Reset Form
    setVerseRef('');
    setVerseText('');
    setReflection('');
    setApplication('');
    setGratitude('');
    setPrayer('');
    setShareWithDiscipleship(false);
    setIsCreating(false);
    
    if (onClearPrefill) {
      onClearPrefill();
    }
  };

  const handleCancel = () => {
    setIsCreating(false);
    setVerseRef('');
    setVerseText('');
    setReflection('');
    setApplication('');
    setGratitude('');
    setPrayer('');
    setShareWithDiscipleship(false);
    if (onClearPrefill) {
      onClearPrefill();
    }
  };

  const filteredEntries = entries.filter(entry => 
    entry.verseRef?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entry.reflection.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entry.prayer?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entry.gratitude?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Header section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
        <div>
          <span style={{ fontSize: '0.85rem', color: 'var(--accent-gold)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>REGISTRO ESPIRITUAL</span>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.25rem' }}>Diário Devocional & Oração</h2>
        </div>

        {/* Tab switcher at the top level */}
        {!isCreating && (
          <div style={{
            display: 'flex',
            gap: '0.25rem',
            background: 'rgba(0,0,0,0.25)',
            padding: '0.35rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--glass-border)'
          }}>
            <button
              onClick={() => setActiveMainTab('journal')}
              style={{
                background: activeMainTab === 'journal' ? 'var(--accent-gold)' : 'transparent',
                color: activeMainTab === 'journal' ? 'var(--bg-primary)' : 'var(--text-secondary)',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                fontSize: '0.85rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)'
              }}
            >
              Meu Diário
            </button>
            <button
              onClick={() => setActiveMainTab('prayers')}
              style={{
                background: activeMainTab === 'prayers' ? 'var(--accent-gold)' : 'transparent',
                color: activeMainTab === 'prayers' ? 'var(--bg-primary)' : 'var(--text-secondary)',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                fontSize: '0.85rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)'
              }}
            >
              Mural de Orações
            </button>
          </div>
        )}
        
        {!isCreating && activeMainTab === 'journal' && (
          <button 
            onClick={() => setIsCreating(true)}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <Plus size={20} />
            Novo Devocional
          </button>
        )}
      </div>

      {/* Main Flow: Form vs List */}
      {isCreating ? (
        <div className="glass-panel animate-fade-in" style={{ padding: '2rem' }}>
          <div style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Escrever Novo Registro</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Dedique um tempo para refletir e registrar o que Deus falou com você.</p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* Associated Verse */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr',
              gap: '1rem',
              background: 'rgba(0,0,0,0.15)',
              padding: '1.25rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--glass-border)'
            }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Referência Bíblica (Ex: João 3:16)</label>
                <input 
                  type="text" 
                  value={verseRef} 
                  onChange={(e) => setVerseRef(e.target.value)}
                  className="input-field" 
                  placeholder="Selecione um versículo no leitor ou digite aqui..."
                />
              </div>

              {verseText && (
                <div style={{
                  borderLeft: '3px solid var(--accent-gold)',
                  paddingLeft: '1rem',
                  marginTop: '0.5rem'
                }}>
                  <p className="scripture-text" style={{ fontSize: '0.95rem', fontStyle: 'italic', color: 'var(--text-secondary)' }}>
                    "{verseText}"
                  </p>
                </div>
              )}
            </div>

            {/* Core Reflection */}
            <div className="form-group">
              <label className="form-label">1. O que aprendi? (Reflexão sobre a Palavra)</label>
              <textarea 
                value={reflection} 
                onChange={(e) => setReflection(e.target.value)}
                className="textarea-field" 
                placeholder="O que esta passagem bíblica ensina? Como ela revela o caráter de Deus?"
                required
              />
            </div>

            {/* Practical Application */}
            <div className="form-group">
              <label className="form-label">2. Aplicação Prática (Como viver isso hoje?)</label>
              <textarea 
                value={application} 
                onChange={(e) => setApplication(e.target.value)}
                className="textarea-field" 
                style={{ minHeight: '80px' }}
                placeholder="De que forma prática posso obedecer a este mandamento ou aplicar esta verdade na minha rotina?"
              />
            </div>

            {/* Gratitude & Prayer requests in 2 columns */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1.5rem'
            }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">3. Motivos de Gratidão (Agradecer)</label>
                <textarea 
                  value={gratitude} 
                  onChange={(e) => setGratitude(e.target.value)}
                  className="textarea-field" 
                  style={{ minHeight: '100px' }}
                  placeholder="Liste bênçãos, respostas de oração ou livramentos recentes."
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">4. Clamor e Pedidos de Oração</label>
                <textarea 
                  value={prayer} 
                  onChange={(e) => setPrayer(e.target.value)}
                  className="textarea-field" 
                  style={{ minHeight: '100px' }}
                  placeholder="Por quem você deseja interceder? Quais são suas lutas pessoais entregues a Deus?"
                />
              </div>
            </div>

            {/* Share option with Discipleship Hub */}
            <div className="glass-card" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '1rem',
              background: shareWithDiscipleship ? 'rgba(212, 163, 89, 0.04)' : 'rgba(0,0,0,0.15)',
              border: `1px solid ${shareWithDiscipleship ? 'var(--accent-gold-muted)' : 'var(--glass-border)'}`
            }}>
              <input 
                type="checkbox"
                id="share-discipleship"
                checked={shareWithDiscipleship}
                onChange={(e) => setShareWithDiscipleship(e.target.checked)}
                style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--accent-gold)' }}
              />
              <label htmlFor="share-discipleship" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Sparkles size={14} style={{ color: 'var(--accent-gold)' }} />
                Compartilhar esta reflexão no Mural de Edificação do Discipulado público
              </label>
            </div>

            {/* Buttons */}
            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '1rem',
              borderTop: '1px solid var(--glass-border)',
              paddingTop: '1.5rem',
              marginTop: '1rem'
            }}>
              <button 
                type="button" 
                onClick={handleCancel}
                className="btn btn-secondary"
              >
                Cancelar
              </button>
              
              <button 
                type="submit" 
                className="btn btn-primary"
                style={{ padding: '0.75rem 2rem' }}
              >
                Salvar Devocional
              </button>
            </div>

          </form>
        </div>
      ) : activeMainTab === 'prayers' ? (
        /* Render newly designed PrayerWall */
        <PrayerWall 
          prayers={prayers}
          onAddPrayer={onAddPrayer}
          onToggleAnswered={onToggleAnswered}
          onDeletePrayer={onDeletePrayer}
        />
      ) : (
        /* Journal Entries List view */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Search bar */}
          <div className="glass-panel" style={{
            padding: '0.75rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            <Search size={20} style={{ color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Pesquisar nos seus devocionais anteriores..." 
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: 'var(--text-primary)',
                width: '100%',
                fontSize: '0.95rem'
              }}
            />
          </div>

          {/* List layout */}
          {filteredEntries.length === 0 ? (
            <div className="glass-card" style={{
              padding: '4rem 2rem',
              textAlign: 'center',
              color: 'var(--text-muted)'
            }}>
              {searchQuery ? 'Nenhum resultado encontrado para a sua pesquisa.' : 'Você não possui registros neste diário. Escreva o seu primeiro devocional clicando no botão acima!'}
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
              gap: '1.5rem'
            }}>
              {filteredEntries.map((entry) => (
                <div 
                  key={entry.id} 
                  className="glass-card"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '1.25rem',
                    background: 'rgba(15, 20, 32, 0.4)'
                  }}
                >
                  <div>
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                        <Calendar size={14} />
                        <span>{new Date(entry.date).toLocaleDateString('pt-BR')}</span>
                      </div>
                      
                      <button 
                        onClick={() => onDeleteEntry(entry.id)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--text-muted)',
                          cursor: 'pointer',
                          padding: '0.25rem',
                          borderRadius: '4px',
                          transition: 'color var(--transition-fast)'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-red)'}
                        onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                        title="Excluir Registro"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    {/* Verse Tag */}
                    <div style={{ marginBottom: '1rem' }}>
                      <span className="badge badge-gold" style={{ display: 'inline-flex', gap: '0.25rem', alignItems: 'center' }}>
                        <BookMarked size={12} />
                        {entry.verseRef || 'Reflexão Geral'}
                      </span>
                    </div>

                    {/* Preview Content */}
                    <p style={{
                      fontSize: '0.95rem',
                      lineHeight: '1.5',
                      color: 'var(--text-primary)',
                      display: '-webkit-box',
                      WebkitLineClamp: 4,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'pre-wrap'
                    }}>
                      {entry.reflection}
                    </p>
                  </div>

                  {/* Badges and click to expand */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderTop: '1px solid var(--glass-border)',
                    paddingTop: '0.75rem'
                  }}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {entry.gratitude && (
                        <span className="badge badge-blue" title="Contém motivos de Gratidão">
                          <Heart size={10} style={{ marginRight: '0.25rem' }} /> Gratidão
                        </span>
                      )}
                      {entry.prayer && (
                        <span className="badge" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)' }} title="Contém pedidos de Oração">
                          <MessageSquare size={10} style={{ marginRight: '0.25rem' }} /> Oração
                        </span>
                      )}
                    </div>

                    <button 
                      onClick={() => setViewingEntry(entry)}
                      className="btn btn-text"
                      style={{
                        padding: '0.25rem 0.5rem',
                        fontSize: '0.85rem',
                        color: 'var(--accent-gold)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem'
                      }}
                    >
                      <Eye size={12} /> Expandir
                    </button>
                  </div>

                </div>
              ))}
            </div>
          )}

        </div>
      )}

      {/* Expanded Devotional Entry Modal View */}
      {viewingEntry && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.85)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000,
          padding: '1.5rem',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)'
        }}>
          <div className="glass-panel animate-fade-in" style={{
            width: '100%',
            maxWidth: '650px',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '2rem',
            background: 'var(--bg-secondary)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
            border: '1px solid var(--accent-gold)'
          }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem' }}>
              <div>
                <span className="badge badge-gold" style={{ fontSize: '0.8rem' }}>
                  {viewingEntry.verseRef || 'Devocional'}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                  <Calendar size={14} />
                  <span>{new Date(viewingEntry.date).toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
              </div>
              <button 
                onClick={() => setViewingEntry(null)}
                className="btn btn-secondary"
                style={{ padding: '0.25rem 0.75rem', fontSize: '0.85rem' }}
              >
                Fechar
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              {viewingEntry.verseText && (
                <div style={{
                  borderLeft: '3px solid var(--accent-gold)',
                  paddingLeft: '1.25rem',
                  margin: '0.5rem 0'
                }}>
                  <p className="scripture-text" style={{ fontSize: '1.05rem', fontStyle: 'italic', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                    "{viewingEntry.verseText}"
                  </p>
                </div>
              )}

              {/* Reflection */}
              <div>
                <h4 style={{ fontSize: '0.85rem', color: 'var(--accent-gold)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                  Reflexão e Aprendizado
                </h4>
                <p style={{ fontSize: '1rem', whiteSpace: 'pre-wrap', lineHeight: '1.6', color: 'var(--text-primary)' }}>
                  {viewingEntry.reflection}
                </p>
              </div>

              {/* Gratitude */}
              {viewingEntry.gratitude && (
                <div>
                  <h4 style={{ fontSize: '0.85rem', color: 'var(--accent-blue)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                    Coração Grato
                  </h4>
                  <p style={{ fontSize: '0.95rem', whiteSpace: 'pre-wrap', lineHeight: '1.5', color: 'var(--text-secondary)' }}>
                    {viewingEntry.gratitude}
                  </p>
                </div>
              )}

              {/* Prayer requests */}
              {viewingEntry.prayer && (
                <div>
                  <h4 style={{ fontSize: '0.85rem', color: '#f87171', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                    Pedido de Oração & Diálogo com Deus
                  </h4>
                  <p style={{ fontSize: '0.95rem', whiteSpace: 'pre-wrap', lineHeight: '1.5', color: 'var(--text-secondary)' }}>
                    {viewingEntry.prayer}
                  </p>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
