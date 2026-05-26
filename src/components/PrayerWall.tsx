import { useState } from 'react';
import { Heart, Plus, Trash2, Calendar, Award, CheckCircle, Sparkles, Smile } from 'lucide-react';
import type { PrayerRequest } from '../types';

interface PrayerWallProps {
  prayers: PrayerRequest[];
  onAddPrayer: (title: string, description: string) => void;
  onToggleAnswered: (id: string, answerText?: string) => void;
  onDeletePrayer: (id: string) => void;
}

export function PrayerWall({ prayers, onAddPrayer, onToggleAnswered, onDeletePrayer }: PrayerWallProps) {
  const [activeSubTab, setActiveSubTab] = useState<'active' | 'answered'>('active');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Testimony modal state for answering a prayer
  const [answeringId, setAnsweringId] = useState<string | null>(null);
  const [testimony, setTestimony] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAddPrayer(title.trim(), description.trim());
    setTitle('');
    setDescription('');
    setShowAddForm(false);
  };

  const handleMarkAnswered = (id: string) => {
    setAnsweringId(id);
    setTestimony('');
  };

  const submitAnswer = () => {
    if (!answeringId) return;
    onToggleAnswered(answeringId, testimony.trim());
    setAnsweringId(null);
    setTestimony('');
  };

  const activePrayers = prayers.filter(p => !p.isAnswered);
  const answeredPrayers = prayers.filter(p => p.isAnswered);

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Prayer Sub-tabs Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(0,0,0,0.2)', padding: '0.25rem', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
          <button
            onClick={() => setActiveSubTab('active')}
            style={{
              background: activeSubTab === 'active' ? 'var(--accent-gold)' : 'transparent',
              color: activeSubTab === 'active' ? 'var(--bg-primary)' : 'var(--text-secondary)',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              fontSize: '0.85rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all var(--transition-fast)'
            }}
          >
            <Heart size={16} fill={activeSubTab === 'active' ? 'var(--bg-primary)' : 'none'} />
            Clamores Ativos ({activePrayers.length})
          </button>
          
          <button
            onClick={() => setActiveSubTab('answered')}
            style={{
              background: activeSubTab === 'answered' ? 'var(--accent-gold)' : 'transparent',
              color: activeSubTab === 'answered' ? 'var(--bg-primary)' : 'var(--text-secondary)',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              fontSize: '0.85rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all var(--transition-fast)'
            }}
          >
            <Award size={16} />
            Mural de Gratidão ({answeredPrayers.length})
          </button>
        </div>

        {activeSubTab === 'active' && (
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', padding: '0.5rem 1.25rem' }}
          >
            <Plus size={16} />
            Novo Pedido
          </button>
        )}
      </div>

      {/* Adding Prayer Form */}
      {showAddForm && activeSubTab === 'active' && (
        <form onSubmit={handleSubmit} className="glass-panel animate-fade-in" style={{
          padding: '1.5rem',
          background: 'rgba(212, 163, 89, 0.03)',
          border: '1px solid var(--accent-gold-muted)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          <h4 style={{ color: 'var(--accent-gold)', fontWeight: 700 }}>🙏 Cadastrar Alvo de Clamor</h4>
          
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ fontSize: '0.75rem' }}>O que você está colocando diante de Deus?</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Saúde de minha mãe, Decisão de carreira, etc."
              className="input-field"
              style={{ width: '100%' }}
              required
            />
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ fontSize: '0.75rem' }}>Detalhes ou motivos específicos (Opcional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Insira detalhes adicionais sobre o alvo da oração para acompanhar posteriormente..."
              className="input-field"
              style={{ width: '100%', minHeight: '80px', resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="btn btn-secondary"
              style={{ fontSize: '0.85rem' }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ fontSize: '0.85rem' }}
            >
              Apresentar Oração
            </button>
          </div>
        </form>
      )}

      {/* Tab Content 1: Active Clamors */}
      {activeSubTab === 'active' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {activePrayers.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '3rem',
              color: 'var(--text-muted)',
              border: '1px dashed var(--glass-border)',
              borderRadius: 'var(--radius-md)'
            }}>
              Nenhum clamor ativo registrado. Coloque suas petições diante de Deus hoje!
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
              {activePrayers.map((prayer) => (
                <div key={prayer.id} className="glass-card gold-border-hover animate-fade-in" style={{
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  background: 'rgba(0,0,0,0.15)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                    <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>{prayer.title}</h4>
                    <button
                      onClick={() => onDeletePrayer(prayer.id)}
                      style={{ background: 'transparent', border: 'none', color: 'rgba(248, 113, 113, 0.4)', cursor: 'pointer', transition: 'color 0.2s' }}
                      title="Deletar Clamor"
                      onMouseEnter={(e) => e.currentTarget.style.color = '#f87171'}
                      onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(248, 113, 113, 0.4)'}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  {prayer.description && (
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.4', flex: 1, whiteSpace: 'pre-wrap' }}>
                      {prayer.description}
                    </p>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--glass-border)', paddingTop: '0.75rem', marginTop: 'auto' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Calendar size={12} />
                      {new Date(prayer.date).toLocaleDateString('pt-BR')}
                    </span>

                    <button
                      onClick={() => handleMarkAnswered(prayer.id)}
                      className="btn animate-fade-in"
                      style={{
                        background: 'rgba(212, 163, 89, 0.1)',
                        color: 'var(--accent-gold)',
                        border: '1px solid rgba(212, 163, 89, 0.2)',
                        padding: '0.35rem 0.75rem',
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem'
                      }}
                    >
                      <Sparkles size={12} />
                      Respondida!
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab Content 2: Gratitude answered prayers Wall */}
      {activeSubTab === 'answered' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {answeredPrayers.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '3rem',
              color: 'var(--text-muted)',
              border: '1px dashed var(--glass-border)',
              borderRadius: 'var(--radius-md)'
            }}>
              Nenhuma oração respondida catalogada ainda. As respostas de Deus virão no tempo certo!
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
              {answeredPrayers.map((prayer) => (
                <div key={prayer.id} className="glass-card animate-fade-in" style={{
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.4), rgba(212, 163, 89, 0.06))',
                  border: '1px solid var(--accent-gold-muted)',
                  boxShadow: '0 8px 24px rgba(212, 163, 89, 0.05)',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  {/* Subtle watermarked golden award icon in background */}
                  <Award size={80} style={{ position: 'absolute', right: '-15px', bottom: '-15px', color: 'rgba(212, 163, 89, 0.04)', pointerEvents: 'none' }} />

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <CheckCircle size={18} style={{ color: 'var(--accent-gold)' }} />
                      <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--accent-gold)' }}>{prayer.title}</h4>
                    </div>
                    <button
                      onClick={() => onDeletePrayer(prayer.id)}
                      style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.15)', cursor: 'pointer', transition: 'color 0.2s', zIndex: 5 }}
                      title="Deletar Registro"
                      onMouseEnter={(e) => e.currentTarget.style.color = '#f87171'}
                      onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.15)'}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  {prayer.description && (
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', background: 'rgba(0,0,0,0.15)', padding: '0.5rem 0.75rem', borderRadius: '4px', fontStyle: 'italic' }}>
                      <b>Pedido original:</b> "{prayer.description}"
                    </div>
                  )}

                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--accent-gold)', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Smile size={12} /> Testemunho da Resposta
                    </span>
                    <p style={{ fontSize: '0.9rem', color: '#f1f5f9', lineHeight: '1.4', marginTop: '0.25rem', whiteSpace: 'pre-wrap', fontWeight: 500 }}>
                      {prayer.answerText || 'Oração respondida com sucesso! (Nenhum texto de testemunho registrado)'}
                    </p>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(212, 163, 89, 0.15)', paddingTop: '0.75rem', marginTop: 'auto', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    <span>Apresentada em: {new Date(prayer.date).toLocaleDateString('pt-BR')}</span>
                    <span style={{ color: 'var(--accent-gold)', fontWeight: 600 }}>Respondida em: {prayer.answerDate ? new Date(prayer.answerDate).toLocaleDateString('pt-BR') : ''}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Testimony Input Popup Modal */}
      {answeringId && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          zIndex: 3500,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.5rem'
        }} onClick={() => setAnsweringId(null)}>
          <div className="glass-panel animate-fade-in" style={{
            width: '100%',
            maxWidth: '500px',
            padding: '2rem',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--accent-gold)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem'
          }} onClick={(e) => e.stopPropagation()}>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent-gold)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Sparkles size={20} /> Registrar Resposta & Gratidão
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                Deus respondeu ao seu clamor! Escreva um breve testemunho ou reflexão sobre como esta oração foi respondida para guardar no seu Mural de Gratidão.
              </p>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontSize: '0.75rem' }}>Escreva seu Testemunho</label>
              <textarea
                value={testimony}
                onChange={(e) => setTestimony(e.target.value)}
                placeholder="Descreva a resposta de Deus a esta oração..."
                className="input-field"
                style={{ width: '100%', minHeight: '120px', resize: 'vertical' }}
                required
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={() => setAnsweringId(null)}
                className="btn btn-secondary"
                style={{ fontSize: '0.85rem' }}
              >
                Voltar
              </button>
              <button
                onClick={submitAnswer}
                className="btn btn-primary"
                style={{ fontSize: '0.85rem', fontWeight: 'bold' }}
              >
                Gravar no Mural
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
