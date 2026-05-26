import { useState } from 'react';
import { BookOpen, CheckCircle, Flame, Compass, ChevronRight, Trophy } from 'lucide-react';
import type { PlanProgress } from '../types';

interface ReadingPlansProps {
  progress: PlanProgress[];
  onJoinPlan: (planId: string) => void;
  onCompleteDay: (planId: string, day: number) => void;
  onNavigateToChapter: (bookId: string, chapterNum: number) => void;
}

interface PlanDefinition {
  id: string;
  title: string;
  description: string;
  totalDays: number;
  bannerGradient: string;
  badgeColor: string;
  badgeTextColor: string;
  icon: any;
  days: {
    dayNum: number;
    bookId: string;
    bookName: string;
    chapter: number;
    label: string;
  }[];
}

export function ReadingPlans({ progress, onJoinPlan, onCompleteDay, onNavigateToChapter }: ReadingPlansProps) {
  const [activeTab, setActiveTab] = useState<'browse' | 'my_plans'>('browse');

  // Plan 1: Jornada de Fé (7 dias)
  const PLAN_FE: PlanDefinition = {
    id: 'plan_fe',
    title: 'Jornada da Fé',
    description: 'Um estudo bíblico profundo de 7 dias sobre o significado e o poder da fé genuína nas Escrituras.',
    totalDays: 7,
    bannerGradient: 'linear-gradient(135deg, rgba(212, 163, 89, 0.15) 0%, rgba(212, 163, 89, 0.03) 100%)',
    badgeColor: 'var(--accent-gold)',
    badgeTextColor: 'var(--bg-primary)',
    icon: Compass,
    days: [
      { dayNum: 1, bookId: 'hebrews', bookName: 'Hebreus', chapter: 11, label: 'O Heróis da Fé' },
      { dayNum: 2, bookId: 'genesis', bookName: 'Gênesis', chapter: 12, label: 'O Chamado de Abraão' },
      { dayNum: 3, bookId: 'james', bookName: 'Tiago', chapter: 2, label: 'Fé e Obras' },
      { dayNum: 4, bookId: 'matthew', bookName: 'Mateus', chapter: 8, label: 'A Fé do Centurião' },
      { dayNum: 5, bookId: 'mark', bookName: 'Marcos', chapter: 5, label: 'A Fé da Mulher' },
      { dayNum: 6, bookId: 'romans', bookName: 'Romanos', chapter: 4, label: 'Fé Creditada como Justiça' },
      { dayNum: 7, bookId: 'ephesians', bookName: 'Efésios', chapter: 2, label: 'Salvos pela Graça mediante a Fé' }
    ]
  };

  // Plan 2: Provérbios (31 dias)
  const PLAN_PROVERBIOS: PlanDefinition = {
    id: 'plan_proverbios',
    title: 'Sabedoria de Provérbios',
    description: 'Construa uma vida de integridade e sabedoria prática lendo um capítulo do livro de Provérbios por dia.',
    totalDays: 31,
    bannerGradient: 'linear-gradient(135deg, rgba(56, 189, 248, 0.1) 0%, rgba(56, 189, 248, 0.02) 100%)',
    badgeColor: 'var(--accent-blue)',
    badgeTextColor: '#060f14',
    icon: BookOpen,
    days: Array.from({ length: 31 }, (_, i) => ({
      dayNum: i + 1,
      bookId: 'proverbs',
      bookName: 'Provérbios',
      chapter: i + 1,
      label: `Conselhos sobre Sabedoria - Cap. ${i + 1}`
    }))
  };

  // Plan 3: Evangelho de João (21 dias)
  const PLAN_JOAO: PlanDefinition = {
    id: 'plan_joao',
    title: 'O Evangelho de João',
    description: 'Caminhe com Jesus Cristo em uma jornada diária de 21 dias estudando seus milagres, ensinamentos e divindade.',
    totalDays: 21,
    bannerGradient: 'linear-gradient(135deg, rgba(45, 212, 191, 0.1) 0%, rgba(45, 212, 191, 0.02) 100%)',
    badgeColor: '#2dd4bf',
    badgeTextColor: '#031412',
    icon: Flame,
    days: Array.from({ length: 21 }, (_, i) => ({
      dayNum: i + 1,
      bookId: 'john',
      bookName: 'João',
      chapter: i + 1,
      label: `A Vida e Obra de Jesus - Cap. ${i + 1}`
    }))
  };

  const ALL_PLANS = [PLAN_FE, PLAN_PROVERBIOS, PLAN_JOAO];

  // Helper to determine if user has joined a plan
  const getProgressForPlan = (planId: string) => {
    return progress.find(p => p.planId === planId);
  };

  const getCompletedPercentage = (planId: string) => {
    const prog = getProgressForPlan(planId);
    if (!prog) return 0;
    const plan = ALL_PLANS.find(p => p.id === planId);
    if (!plan) return 0;
    return Math.round((prog.completedDays.length / plan.totalDays) * 100);
  };

  const activeUserProgressList = progress.map(p => {
    const plan = ALL_PLANS.find(ap => ap.id === p.planId);
    return { progress: p, plan };
  }).filter(item => item.plan !== undefined) as { progress: PlanProgress, plan: PlanDefinition }[];

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Navigation sub-tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(0,0,0,0.2)', padding: '0.25rem', borderRadius: '8px', border: '1px solid var(--glass-border)', alignSelf: 'flex-start' }}>
        <button
          onClick={() => setActiveTab('browse')}
          style={{
            background: activeTab === 'browse' ? 'var(--accent-gold)' : 'transparent',
            color: activeTab === 'browse' ? 'var(--bg-primary)' : 'var(--text-secondary)',
            border: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '6px',
            fontSize: '0.85rem',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'all var(--transition-fast)'
          }}
        >
          Explorar Planos
        </button>
        <button
          onClick={() => setActiveTab('my_plans')}
          style={{
            background: activeTab === 'my_plans' ? 'var(--accent-gold)' : 'transparent',
            color: activeTab === 'my_plans' ? 'var(--bg-primary)' : 'var(--text-secondary)',
            border: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '6px',
            fontSize: '0.85rem',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'all var(--transition-fast)'
          }}
        >
          Meus Planos ({activeUserProgressList.length})
        </button>
      </div>

      {/* Tab: Browse Plans */}
      {activeTab === 'browse' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {ALL_PLANS.map((plan) => {
            const userProg = getProgressForPlan(plan.id);
            const percentage = getCompletedPercentage(plan.id);
            const PlanIcon = plan.icon;
            
            return (
              <div 
                key={plan.id} 
                className="glass-panel" 
                style={{
                  background: plan.bannerGradient,
                  border: `1px solid ${userProg ? 'var(--accent-gold-muted)' : 'var(--glass-border)'}`,
                  padding: '2rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1.5rem',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {/* Visual Glow Ornament */}
                <div style={{ position: 'absolute', right: '-30px', top: '-30px', opacity: 0.05, transform: 'scale(1.2)' }}>
                  <PlanIcon size={120} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', zIndex: 5 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span className="badge" style={{ background: plan.badgeColor, color: plan.badgeTextColor, fontSize: '0.7rem', fontWeight: 'bold' }}>
                        {plan.totalDays} DIAS
                      </span>
                      {userProg && percentage === 100 && (
                        <span className="badge badge-gold" style={{ fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Trophy size={10} /> CONCLUÍDO!
                        </span>
                      )}
                    </div>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '0.25rem' }}>{plan.title}</h3>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', maxHeight: '80px', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: '0.25rem' }}>
                      {plan.description}
                    </p>
                  </div>

                  {!userProg ? (
                    <button 
                      onClick={() => onJoinPlan(plan.id)}
                      className="btn btn-primary"
                      style={{ fontSize: '0.85rem', alignSelf: 'center', padding: '0.65rem 1.5rem' }}
                    >
                      Iniciar Plano
                    </button>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', alignItems: 'flex-end', alignSelf: 'center' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>PROGRESSO: {percentage}%</span>
                      <div style={{ width: '120px', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden', border: '1px solid var(--glass-border)' }}>
                        <div style={{ width: `${percentage}%`, height: '100%', background: 'var(--accent-gold)', borderRadius: '3px', transition: 'width 0.4s ease' }} />
                      </div>
                      <button 
                        onClick={() => setActiveTab('my_plans')}
                        className="btn btn-text"
                        style={{ fontSize: '0.75rem', color: 'var(--accent-gold)', padding: '0.25rem 0', marginTop: '0.25rem', display: 'flex', alignItems: 'center' }}
                      >
                        Ver Cronograma <ChevronRight size={14} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab: My Active Plans Progress */}
      {activeTab === 'my_plans' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {activeUserProgressList.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '4rem 2rem',
              color: 'var(--text-muted)',
              border: '1px dashed var(--glass-border)',
              borderRadius: 'var(--radius-md)'
            }}>
              Você não se inscreveu em nenhum plano de leitura.
              <button 
                onClick={() => setActiveTab('browse')}
                className="btn btn-primary"
                style={{ marginTop: '1rem', fontSize: '0.85rem' }}
              >
                Escolher Primeiro Plano
              </button>
            </div>
          ) : (
            activeUserProgressList.map(({ progress: userProg, plan }) => {
              const percentage = getCompletedPercentage(plan.id);
              const isFinished = percentage === 100;
              
              return (
                <div 
                  key={plan.id} 
                  className="glass-panel" 
                  style={{
                    padding: '2rem',
                    border: `1px solid ${isFinished ? 'var(--accent-gold-muted)' : 'var(--glass-border)'}`,
                    background: 'rgba(10, 14, 23, 0.45)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1.5rem'
                  }}
                >
                  {/* Plan progress overview header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                      <span className="badge badge-gold" style={{ fontSize: '0.75rem' }}>PLANO ATIVO</span>
                      <h3 style={{ fontSize: '1.35rem', fontWeight: 800, marginTop: '0.25rem' }}>{plan.title}</h3>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.9rem', color: isFinished ? 'var(--accent-gold)' : 'var(--text-secondary)', fontWeight: 700 }}>
                        {isFinished ? '🏆 PLANO COMPLETO!' : `DIA ${userProg.completedDays.length} DE ${plan.totalDays} (${percentage}%)`}
                      </span>
                      <div style={{ width: '180px', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden', border: '1px solid var(--glass-border)', marginTop: '0.25rem' }}>
                        <div style={{ width: `${percentage}%`, height: '100%', background: isFinished ? 'var(--accent-gold)' : 'var(--accent-blue)', borderRadius: '3px', transition: 'width 0.4s ease' }} />
                      </div>
                    </div>
                  </div>

                  {/* Congratulations Banner if completed */}
                  {isFinished && (
                    <div className="glass-card animate-fade-in" style={{
                      background: 'linear-gradient(135deg, rgba(212, 163, 89, 0.05) 0%, rgba(212, 163, 89, 0.01) 100%)',
                      border: '1px solid rgba(212, 163, 89, 0.2)',
                      padding: '1.25rem 1.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      borderRadius: 'var(--radius-md)'
                    }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: 'var(--accent-gold-muted)',
                        color: 'var(--accent-gold)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 0 10px rgba(212, 163, 89, 0.15)'
                      }}>
                        <Trophy size={20} />
                      </div>
                      <div>
                        <h4 style={{ fontSize: '0.95rem', fontWeight: 'bold', color: 'var(--accent-gold)' }}>Parabéns por concluir seu plano!</h4>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.1rem' }}>
                          Você demonstrou grande dedicação e persistência na meditação diária nas Sagradas Escrituras.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Reading Timeline / Daily Checkboxes Grid */}
                  <div>
                    <h4 style={{ fontSize: '0.85rem', color: 'var(--text-primary)', fontWeight: 700, marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Cronograma de Leituras
                    </h4>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {plan.days.map((day) => {
                        const isDone = userProg.completedDays.includes(day.dayNum);
                        
                        return (
                          <div 
                            key={day.dayNum}
                            className="glass-card gold-border-hover animate-fade-in"
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '0.85rem 1.25rem',
                              background: isDone ? 'rgba(52, 211, 153, 0.02)' : 'rgba(0, 0, 0, 0.15)',
                              borderColor: isDone ? 'rgba(52, 211, 153, 0.15)' : 'var(--glass-border)'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                              {/* Custom circular day checkmark */}
                              <button
                                onClick={() => onCompleteDay(plan.id, day.dayNum)}
                                style={{
                                  background: 'transparent',
                                  border: 'none',
                                  cursor: 'pointer',
                                  color: isDone ? 'var(--accent-green)' : 'var(--text-muted)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  padding: 0
                                }}
                              >
                                <CheckCircle size={22} fill={isDone ? 'var(--accent-green)' : 'transparent'} />
                              </button>

                              <div>
                                <span style={{ fontSize: '0.8rem', color: isDone ? 'var(--accent-green)' : 'var(--accent-gold)', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' }}>
                                  DIA {day.dayNum}
                                </span>
                                <h4 style={{
                                  fontSize: '0.95rem',
                                  fontWeight: 600,
                                  color: isDone ? 'var(--text-muted)' : 'var(--text-primary)',
                                  textDecoration: isDone ? 'line-through' : 'none',
                                  marginTop: '0.1rem'
                                }}>
                                  {day.bookName} {day.chapter}
                                </h4>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{day.label}</span>
                              </div>
                            </div>

                            <button
                              onClick={() => onNavigateToChapter(day.bookId, day.chapter)}
                              className="btn btn-text animate-fade-in"
                              style={{
                                fontSize: '0.8rem',
                                color: isDone ? 'var(--text-muted)' : 'var(--text-primary)',
                                padding: '0.35rem 0.75rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                                background: 'rgba(255,255,255,0.02)',
                                border: '1px solid var(--glass-border)',
                                borderRadius: '6px'
                              }}
                            >
                              Abrir Passagem
                              <ChevronRight size={14} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>
              );
            })
          )}
        </div>
      )}

    </div>
  );
}
