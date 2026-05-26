import { useState, useEffect } from 'react';
import { Calendar, CheckCircle2, Flame, BookOpen, PenTool, UserCheck, Heart, BookMarked, Clock, ArrowRight } from 'lucide-react';
import type { JournalEntry, DiscipleshipGoal, PlanProgress, ReadingLog } from '../types';

interface DashboardProps {
  onNavigate: (tab: string) => void;
  journalEntries: JournalEntry[];
  streakCount: number;
  userName: string;
  setUserName: (name: string) => void;
  geminiApiKey: string;
  setGeminiApiKey: (key: string) => void;
  activeGoals?: DiscipleshipGoal[];
  readingProgress?: PlanProgress[];
  onNavigateToPassage?: (ref: string) => void;
  onNavigateToPlans?: () => void;
  readingLogs?: ReadingLog[];
}

interface CuratedVerse {
  text: string;
  reference: string;
}

const CURATED_VERSES: CuratedVerse[] = [
  { text: "Lampada para os meus pes e tua palavra, e luz para o meu caminho.", reference: "Salmos 119:105" },
  { text: "Nao fui eu que ordenei a voce? Seja forte e corajoso! Nao se apavore nem desanime, pois o Senhor, o seu Deus, estara com voce por onde voce andar.", reference: "Josue 1:9" },
  { text: "Porque sou eu que conheco os planos que tenho para voces, diz o Senhor, planos de faze-los prosperar e nao de causar dano, planos de dar a voces esperanca e um futuro.", reference: "Jeremias 29:11" },
  { text: "Busquem, pois, em primeiro lugar o Reino de Deus e a sua justica, e todas essas coisas serao acrescentadas a voces.", reference: "Mateus 6:33" },
  { text: "Tudo posso naquele que me fortalece.", reference: "Filipenses 4:13" },
  { text: "O Senhor e o meu pastor; de nada terei falta.", reference: "Salmos 23:1" },
  { text: "Confie no Senhor de todo o seu coracao e nao se apoie em seu proprio entendimento; reconheca o Senhor em todos os seus caminhos, e ele endireitara as suas veredas.", reference: "Proverbios 3:5-6" }
];

export function Dashboard({
  onNavigate,
  journalEntries,
  streakCount,
  userName,
  setUserName,
  geminiApiKey,
  setGeminiApiKey: _setGeminiApiKey,
  activeGoals = [],
  readingProgress = [],
  onNavigateToPassage,
  onNavigateToPlans,
  readingLogs = []
}: DashboardProps) {
  const [verseOfTheDay, setVerseOfTheDay] = useState<CuratedVerse>(CURATED_VERSES[0]);
  const [completedHabits, setCompletedHabits] = useState<string[]>([]);

  const today = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const getUniqueChaptersCount = () => {
    const uniqueChapters = new Set<string>();
    readingProgress.forEach(prog => {
      if (prog.planId === 'plan_fe') {
        const daysMap: Record<number, string> = { 1: 'hebrews-11', 2: 'genesis-12', 3: 'james-2', 4: 'matthew-8', 5: 'mark-5', 6: 'romans-4', 7: 'ephesians-2' };
        prog.completedDays.forEach((day: number) => { if (daysMap[day]) uniqueChapters.add(daysMap[day]); });
      } else if (prog.planId === 'plan_proverbios') {
        prog.completedDays.forEach((day: number) => { uniqueChapters.add(`proverbs-${day}`); });
      } else if (prog.planId === 'plan_joao') {
        prog.completedDays.forEach((day: number) => { uniqueChapters.add(`john-${day}`); });
      }
    });
    return uniqueChapters.size;
  };

  const totalBibleChapters = 1189;
  const biblePercent = ((getUniqueChaptersCount() / totalBibleChapters) * 100).toFixed(1);

  const todayStr = new Date().toISOString().split('T')[0];
  const todaySeconds = readingLogs.filter(log => log.date === todayStr).reduce((sum, log) => sum + log.seconds, 0);

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m ${seconds}s`;
    return `${seconds}s`;
  };

  useEffect(() => {
    const day = new Date().getDate();
    setVerseOfTheDay(CURATED_VERSES[day % CURATED_VERSES.length]);

    const wroteToday = journalEntries.some(entry => entry.date === todayStr);
    if (wroteToday) {
      setCompletedHabits(prev => {
        const habits = [...prev];
        if (!habits.includes('journal')) habits.push('journal');
        if (!habits.includes('bible')) habits.push('bible');
        return habits;
      });
    }
  }, [journalEntries]);

  const toggleHabit = (habitId: string) => {
    setCompletedHabits(prev =>
      prev.includes(habitId) ? prev.filter(id => id !== habitId) : [...prev, habitId]
    );
  };

  const habits = [
    { id: 'bible', label: 'Leitura Biblica', icon: BookOpen, tab: 'bible' },
    { id: 'journal', label: 'Devocional', icon: PenTool, tab: 'journal' },
    { id: 'prayer', label: 'Oracao', icon: Heart, tab: 'journal' },
    { id: 'discipleship', label: 'Discipulado', icon: UserCheck, tab: 'discipleship' }
  ];

  const completedCount = completedHabits.length;
  const totalHabits = habits.length;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* Header */}
      <header>
        <span style={{ fontSize: '0.8rem', color: 'var(--accent-gold)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>PAINEL DE ESTUDO</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.15rem', flexWrap: 'wrap' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Ola, {userName || 'Bem-vindo'}!</h2>
          {geminiApiKey && (
            <span className="badge badge-gold" style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem' }}>IA Ativa</span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.15rem' }}>
          <Calendar size={14} />
          <span style={{ textTransform: 'capitalize' }}>{today}</span>
        </div>
      </header>

      {/* Onboarding - compact, only shows what's missing */}
      {!userName && (
        <div className="glass-card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', borderColor: 'var(--accent-gold-muted)' }}>
          <div style={{ flex: '1 1 200px' }}>
            <label className="form-label" style={{ fontSize: '0.7rem' }}>Seu Nome</label>
            <input type="text" value={userName} onChange={(e) => setUserName(e.target.value)} placeholder="Como quer ser chamado?" className="input-field" style={{ width: '100%' }} />
          </div>
          <button onClick={() => userName.trim() && alert('Perfil salvo!')} className="btn btn-primary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem', flexShrink: 0 }}>
            Salvar
          </button>
        </div>
      )}

      {/* KPI Stats - 4 cards inline */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem' }}>
        {/* Streak */}
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(212, 163, 89, 0.1)', border: '1px solid var(--accent-gold-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Flame size={20} fill="var(--accent-gold)" color="var(--accent-gold)" />
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, lineHeight: 1 }}>{streakCount}</div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Dias Seguidos</div>
          </div>
        </div>

        {/* Devotionals */}
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <BookMarked size={20} color="var(--accent-blue)" />
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, lineHeight: 1 }}>{journalEntries.length}</div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Devocionais</div>
          </div>
        </div>

        {/* Bible % */}
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(212, 163, 89, 0.15)', border: '1px solid var(--accent-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <BookOpen size={20} color="var(--accent-gold)" />
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, lineHeight: 1, color: 'var(--accent-gold)' }}>{biblePercent}%</div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Biblia Lida</div>
          </div>
        </div>

        {/* Today's reading time */}
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(52, 211, 153, 0.1)', border: '1px solid rgba(52, 211, 153, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Clock size={20} color="var(--accent-green)" />
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, lineHeight: 1, color: 'var(--accent-green)' }}>{formatTime(todaySeconds)}</div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Leitura Hoje</div>
          </div>
        </div>
      </div>

      {/* Verse of the Day + Daily Habits (side by side) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
        {/* Verse of the Day */}
        <div className="glass-card" style={{
          background: 'linear-gradient(135deg, var(--glass-bg), rgba(212, 163, 89, 0.05))',
          borderColor: 'var(--accent-gold-muted)',
          padding: '1.75rem',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div style={{ position: 'absolute', top: '-20px', right: '-10px', fontSize: '7rem', fontFamily: 'Georgia, serif', color: 'rgba(212, 163, 89, 0.04)', userSelect: 'none', lineHeight: 1 }}>"</div>
          <div>
            <span className="badge badge-gold" style={{ marginBottom: '0.75rem' }}>VERSICULO DO DIA</span>
            <p className="scripture-text" style={{ fontSize: '1.1rem', fontStyle: 'italic', marginBottom: '1rem', color: 'var(--text-primary)', lineHeight: 1.6 }}>
              "{verseOfTheDay.text}"
            </p>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 600, color: 'var(--accent-gold)', fontSize: '0.9rem' }}>{verseOfTheDay.reference}</span>
            <button
              onClick={() => onNavigateToPassage ? onNavigateToPassage(verseOfTheDay.reference) : onNavigate('bible')}
              className="btn btn-text"
              style={{ fontSize: '0.8rem', padding: '0.3rem 0.6rem' }}
            >
              Abrir na Biblia <ArrowRight size={14} />
            </button>
          </div>
        </div>

        {/* Daily Habits - compact checklist */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Habitos do Dia</h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{completedCount}/{totalHabits} completos</span>
            </div>
            {/* Mini progress ring */}
            <div style={{
              width: '44px', height: '44px', borderRadius: '50%',
              background: `conic-gradient(var(--accent-gold) ${(completedCount / totalHabits) * 360}deg, var(--bg-tertiary) 0deg)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'var(--glass-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 800, color: 'var(--accent-gold)' }}>
                {completedCount}/{totalHabits}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {habits.map(habit => {
              const Icon = habit.icon;
              const done = completedHabits.includes(habit.id);
              return (
                <div key={habit.id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '0.6rem 0.75rem', borderRadius: 'var(--radius-sm)',
                  background: done ? 'rgba(52, 211, 153, 0.04)' : 'rgba(0,0,0,0.1)',
                  border: `1px solid ${done ? 'rgba(52, 211, 153, 0.15)' : 'var(--glass-border)'}`,
                  transition: 'all var(--transition-fast)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <button onClick={() => toggleHabit(habit.id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: done ? 'var(--accent-green)' : 'var(--text-muted)', display: 'flex' }}>
                      <CheckCircle2 size={18} fill={done ? 'var(--accent-green)' : 'transparent'} />
                    </button>
                    <Icon size={15} style={{ color: done ? 'var(--accent-green)' : 'var(--text-secondary)' }} />
                    <span style={{ fontSize: '0.85rem', fontWeight: 500, textDecoration: done ? 'line-through' : 'none', color: done ? 'var(--text-muted)' : 'var(--text-primary)' }}>
                      {habit.label}
                    </span>
                  </div>
                  {!done && (
                    <button onClick={() => onNavigate(habit.tab)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--accent-gold)', fontSize: '0.75rem', fontWeight: 600 }}>
                      Ir <ArrowRight size={12} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom row: 3 compact cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>

        {/* Recent Devotionals */}
        <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Devocionais Recentes</h3>
            {journalEntries.length > 0 && (
              <button onClick={() => onNavigate('journal')} className="btn btn-text" style={{ fontSize: '0.75rem', color: 'var(--accent-gold)', padding: '0.2rem 0.4rem' }}>
                Ver todos
              </button>
            )}
          </div>
          {journalEntries.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '1.25rem 0.75rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              <PenTool size={28} style={{ margin: '0 auto 0.5rem', opacity: 0.3 }} />
              <p style={{ marginBottom: '0.75rem' }}>Nenhum devocional ainda.</p>
              <button onClick={() => onNavigate('journal')} className="btn btn-primary" style={{ width: '100%', fontSize: '0.85rem', padding: '0.5rem' }}>
                Escrever Primeiro
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {journalEntries.slice(0, 3).map(entry => (
                <div key={entry.id} onClick={() => onNavigate('journal')} style={{
                  padding: '0.7rem', borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                  background: 'rgba(0,0,0,0.1)', border: '1px solid var(--glass-border)',
                  transition: 'border-color var(--transition-fast)'
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent-gold-muted)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--glass-border)'}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--accent-gold)' }}>{entry.verseRef || entry.bookName}</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{new Date(entry.date).toLocaleDateString('pt-BR')}</span>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.3 }}>
                    {entry.reflection}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Reading Plans */}
        <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Planos de Leitura</h3>
            <span className="badge badge-gold" style={{ fontSize: '0.65rem' }}>{readingProgress.length > 0 ? `${readingProgress.length} ativo${readingProgress.length > 1 ? 's' : ''}` : 'NOVO'}</span>
          </div>

          {readingProgress.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {readingProgress.map(prog => {
                const title = prog.planId === 'plan_fe' ? 'Jornada da Fe' : prog.planId === 'plan_joao' ? 'Evangelho de Joao' : 'Proverbios';
                const total = prog.planId === 'plan_fe' ? 7 : prog.planId === 'plan_joao' ? 21 : 31;
                const pct = Math.round((prog.completedDays.length / total) * 100);
                return (
                  <div key={prog.planId}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.2rem' }}>
                      <span style={{ fontWeight: 600 }}>{title}</span>
                      <span style={{ color: 'var(--accent-gold)', fontWeight: 700, fontSize: '0.75rem' }}>{pct}%</span>
                    </div>
                    <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: 'var(--accent-gold)', borderRadius: '2px', transition: 'width 0.5s' }} />
                    </div>
                  </div>
                );
              })}
              <button onClick={() => onNavigateToPlans ? onNavigateToPlans() : onNavigate('bible')} className="btn btn-primary" style={{ width: '100%', fontSize: '0.8rem', padding: '0.45rem', marginTop: '0.25rem' }}>
                Continuar Leituras
              </button>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '1rem 0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              <BookOpen size={28} style={{ margin: '0 auto 0.5rem', opacity: 0.3 }} />
              <p style={{ marginBottom: '0.75rem' }}>Nenhum plano ativo.</p>
              <button onClick={() => onNavigateToPlans ? onNavigateToPlans() : onNavigate('bible')} className="btn btn-secondary" style={{ width: '100%', fontSize: '0.8rem', padding: '0.45rem', borderColor: 'var(--accent-gold)' }}>
                Explorar Planos
              </button>
            </div>
          )}
        </div>

        {/* Goals + Quick Links */}
        <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Metas & Comunidade</h3>
          </div>

          {activeGoals.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {activeGoals.slice(0, 2).map(goal => (
                <div key={goal.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0.75rem', borderRadius: 'var(--radius-sm)', background: 'rgba(0,0,0,0.1)', border: '1px solid var(--glass-border)' }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{goal.title}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Com: {goal.partnerName}</div>
                  </div>
                  <button onClick={() => onNavigate('discipleship')} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--accent-gold)', fontSize: '0.75rem', fontWeight: 600, flexShrink: 0 }}>
                    Focar <ArrowRight size={12} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '0.5rem 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Crie metas com seu mentor para crescerem juntos.
            </div>
          )}

          {/* Quick action buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: 'auto' }}>
            <button onClick={() => onNavigate('discipleship')} className="btn btn-secondary" style={{ width: '100%', fontSize: '0.8rem', padding: '0.45rem', justifyContent: 'space-between' }}>
              <span>{activeGoals.length > 0 ? 'Ver Todas as Metas' : 'Criar Primeiro Desafio'}</span>
              <ArrowRight size={14} />
            </button>
            <button onClick={() => onNavigate('discipleship')} className="btn btn-text" style={{ width: '100%', fontSize: '0.75rem', padding: '0.4rem', color: 'var(--text-secondary)', justifyContent: 'space-between' }}>
              <span>Mural de Edificacao</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>

      </div>

      {/* Gemini API hint - only if not configured */}
      {!geminiApiKey && userName && (
        <div className="glass-card" style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', borderColor: 'rgba(56, 189, 248, 0.15)', background: 'rgba(56, 189, 248, 0.03)' }}>
          <div style={{ flex: '1 1 250px' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Ative o Assistente de Estudo com IA</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
              Configure sua chave do Gemini em <b>Ajustes do Perfil</b> para comentarios inteligentes nos versiculos.
            </div>
          </div>
          <a href="https://aistudio.google.com/" target="_blank" rel="noreferrer" className="btn btn-secondary" style={{ fontSize: '0.8rem', padding: '0.4rem 1rem', borderColor: 'rgba(56, 189, 248, 0.2)', color: 'var(--accent-blue)', flexShrink: 0 }}>
            Obter Chave Gratis
          </a>
        </div>
      )}
    </div>
  );
}
