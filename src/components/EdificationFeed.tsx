import { RefreshCw, BookOpen, Quote, Calendar } from 'lucide-react';
import type { SharedDevocional } from '../types';

interface EdificationFeedProps {
  feed: SharedDevocional[];
  loading: boolean;
  onRefresh: () => void;
}

export function EdificationFeed({ feed, loading, onRefresh }: EdificationFeedProps) {
  
  const getInitials = (name: string) => {
    if (!name) return 'D';
    const split = name.trim().split(' ');
    if (split.length > 1) {
      return (split[0][0] + split[1][0]).toUpperCase();
    }
    return name[0].toUpperCase();
  };

  const getAvatarColor = (name: string) => {
    // Generate a beautiful consistent color based on name string
    const colors = [
      'linear-gradient(135deg, #d4a359 0%, #7c5825 100%)', // Gold
      'linear-gradient(135deg, #38bdf8 0%, #1e3a8a 100%)', // Blue
      'linear-gradient(135deg, #2dd4bf 0%, #115e59 100%)', // Teal
      'linear-gradient(135deg, #a855f7 0%, #581c87 100%)', // Purple
      'linear-gradient(135deg, #f43f5e 0%, #9f1239 100%)', // Rose
    ];
    let sum = 0;
    for (let i = 0; i < name.length; i++) {
      sum += name.charCodeAt(i);
    }
    return colors[sum % colors.length];
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header with refresh button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc' }}>📖 Mural de Edificação Mútua</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Acompanhe as reflexões bíblicas compartilhadas por seus parceiros de discipulado.</p>
        </div>

        <button
          onClick={onRefresh}
          disabled={loading}
          className="btn btn-secondary animate-fade-in"
          style={{
            padding: '0.5rem 1rem',
            fontSize: '0.8rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
            borderRadius: '8px',
            borderColor: 'var(--glass-border)',
            background: 'rgba(255,255,255,0.02)'
          }}
        >
          <RefreshCw size={14} className={loading ? 'spin' : ''} />
          {loading ? 'Atualizando...' : 'Atualizar'}
        </button>
      </div>

      {/* Main Feed List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        
        {loading && feed.length === 0 ? (
          /* Loading Skeleton feed cards */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[1, 2].map((i) => (
              <div key={i} className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', animation: 'pulse 1.5s infinite' }}></div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1 }}>
                    <div style={{ height: '14px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', width: '30%', animation: 'pulse 1.5s infinite' }}></div>
                    <div style={{ height: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: '4px', width: '15%', animation: 'pulse 1.5s infinite' }}></div>
                  </div>
                </div>
                <div style={{ height: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '4px', width: '100%', animation: 'pulse 1.5s infinite' }}></div>
                <div style={{ height: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '4px', width: '80%', animation: 'pulse 1.5s infinite' }}></div>
              </div>
            ))}
          </div>
        ) : feed.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '4rem 2rem',
            color: 'var(--text-muted)',
            border: '1px dashed var(--glass-border)',
            borderRadius: 'var(--radius-md)'
          }}>
            Nenhuma reflexão compartilhada no momento. 
            <p style={{ fontSize: '0.85rem', marginTop: '0.5rem', color: 'var(--text-secondary)' }}>
              Escreva no seu Diário Devocional e marque a caixa "Compartilhar no Discipulado" para abençoar seus irmãos!
            </p>
          </div>
        ) : (
          /* Real Feed List */
          feed.map((post) => (
            <div
              key={post.id}
              className="glass-card gold-border-hover animate-fade-in"
              style={{
                padding: '1.75rem',
                background: 'rgba(15, 23, 42, 0.35)',
                border: '1px solid var(--glass-border)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
              }}
            >
              {/* Post Author / Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '50%',
                    background: getAvatarColor(post.user_name),
                    color: '#f8fafc',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    fontSize: '0.95rem',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)'
                  }}>
                    {getInitials(post.user_name)}
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f1f5f9' }}>{post.user_name}</h4>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.1rem' }}>
                      <Calendar size={12} />
                      {new Date(post.created_at).toLocaleDateString('pt-BR')} às {new Date(post.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                {post.verse_ref && (
                  <span className="badge badge-gold" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.35rem 0.75rem', fontSize: '0.75rem', fontWeight: 600 }}>
                    <BookOpen size={12} />
                    {post.verse_ref}
                  </span>
                )}
              </div>

              {/* Shared Verse Citações (if available) */}
              {post.verse_ref && post.verse_text && (
                <div style={{
                  background: 'rgba(0, 0, 0, 0.15)',
                  padding: '1rem 1.25rem',
                  borderRadius: 'var(--radius-md)',
                  borderLeft: '3px solid var(--accent-gold)',
                  position: 'relative'
                }}>
                  <Quote size={20} style={{ position: 'absolute', right: '1rem', top: '0.5rem', color: 'rgba(212, 163, 89, 0.05)' }} />
                  <p className="scripture-text" style={{ fontSize: '0.9rem', fontStyle: 'italic', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                    "{post.verse_text}"
                  </p>
                </div>
              )}

              {/* Reflection Body */}
              <div style={{
                fontSize: '0.95rem',
                lineHeight: '1.6',
                color: '#e2e8f0',
                whiteSpace: 'pre-wrap',
                fontFamily: 'system-ui, sans-serif'
              }}>
                {post.reflection}
              </div>

            </div>
          ))
        )}

      </div>

      <style>{`
        .spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
