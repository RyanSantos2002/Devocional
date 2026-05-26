import { useState } from 'react';
import { Users, CheckSquare, Plus, HelpCircle, Save, Calendar, User, Trash2, Target, Sparkles } from 'lucide-react';
import { EdificationFeed } from './EdificationFeed';
import type { Meeting, DiscipleshipGoal, SharedDevocional } from '../types';

interface DiscipleshipProps {
  meetings: Meeting[];
  onAddMeeting: (meeting: Omit<Meeting, 'id'>) => void;
  onDeleteMeeting: (id: string) => void;

  // Goals props
  activeGoals: DiscipleshipGoal[];
  onAddGoal: (title: string, description: string, targetDate: string, partnerName: string, proposedBy: 'mentor' | 'disciple') => void;
  onToggleGoal: (id: string) => void;
  onDeleteGoal: (id: string) => void;

  // Shared Feed props
  sharedDevocionais: SharedDevocional[];
  onRefreshFeed: () => void;
  feedLoading: boolean;
}

export function Discipleship({ 
  meetings, 
  onAddMeeting, 
  onDeleteMeeting,
  activeGoals,
  onAddGoal,
  onToggleGoal,
  onDeleteGoal,
  sharedDevocionais,
  onRefreshFeed,
  feedLoading
}: DiscipleshipProps) {
  const [activeTab, setActiveTab] = useState<'meetings' | 'goals' | 'feed'>('meetings');

  // Form states for Meetings
  const [partnerName, setPartnerName] = useState('');
  const [role, setRole] = useState<'mentor' | 'disciple'>('disciple');
  const [notes, setNotes] = useState('');
  const [commitment, setCommitment] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  // Form states for Goals
  const [goalTitle, setGoalTitle] = useState('');
  const [goalPartner, setGoalPartner] = useState('');
  const [goalDate, setGoalDate] = useState('');
  const [goalProposedBy, setGoalProposedBy] = useState<'mentor' | 'disciple'>('disciple');
  const [goalDesc, setGoalDesc] = useState('');

  // Weekly discipleship growth check
  const [weeklyGoals, setWeeklyGoals] = useState([
    { id: '1', label: 'Reunião semanal com mentor/discípulo', done: false },
    { id: '2', label: 'Leitura bíblica compartilhada', done: false },
    { id: '3', label: 'Momento de intercessão mútua', done: false },
    { id: '4', label: 'Preencher o Diário Devocional pelo menos 3 vezes', done: false }
  ]);

  const toggleWeeklyGoal = (id: string) => {
    setWeeklyGoals(prev => 
      prev.map(g => g.id === id ? { ...g, done: !g.done } : g)
    );
  };

  const handleMeetingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!partnerName.trim() || !notes.trim()) {
      alert('Por favor, preencha o nome do participante e o resumo do encontro.');
      return;
    }

    onAddMeeting({
      date: new Date().toISOString().split('T')[0],
      partnerName: partnerName.trim(),
      role,
      notes: notes.trim(),
      commitment: commitment.trim()
    });

    setPartnerName('');
    setNotes('');
    setCommitment('');
    setShowAddForm(false);
  };

  const handleGoalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalTitle.trim() || !goalPartner.trim() || !goalDate) {
      alert('Por favor, preencha os campos obrigatórios.');
      return;
    }

    onAddGoal(
      goalTitle.trim(),
      goalDesc.trim(),
      goalDate,
      goalPartner.trim(),
      goalProposedBy
    );

    setGoalTitle('');
    setGoalPartner('');
    setGoalDate('');
    setGoalProposedBy('disciple');
    setGoalDesc('');
  };

  const DISCIPLESHIP_QUESTIONS = [
    "Como está sua vida devocional e tempo diário com Deus esta semana?",
    "Quais foram suas maiores vitórias e onde você experimentou tentação?",
    "Você conseguiu aplicar a reflexão prática do seu devocional em suas ações?",
    "Como podemos orar um pelo outro nos próximos dias?"
  ];

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Header section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
        <div>
          <span style={{ fontSize: '0.85rem', color: 'var(--accent-gold)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>CRESCIMENTO MÚTUO</span>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.25rem' }}>Hub de Discipulado</h2>
        </div>

        {/* Hub Sub-navigation Tabs */}
        <div style={{
          display: 'flex',
          gap: '0.25rem',
          background: 'rgba(0,0,0,0.25)',
          padding: '0.35rem',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--glass-border)'
        }}>
          <button
            onClick={() => setActiveTab('meetings')}
            style={{
              background: activeTab === 'meetings' ? 'var(--accent-gold)' : 'transparent',
              color: activeTab === 'meetings' ? 'var(--bg-primary)' : 'var(--text-secondary)',
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
            <Users size={16} />
            Encontros
          </button>
          
          <button
            onClick={() => setActiveTab('goals')}
            style={{
              background: activeTab === 'goals' ? 'var(--accent-gold)' : 'transparent',
              color: activeTab === 'goals' ? 'var(--bg-primary)' : 'var(--text-secondary)',
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
            <Target size={16} />
            Metas & Desafios
          </button>

          <button
            onClick={() => {
              setActiveTab('feed');
              onRefreshFeed();
            }}
            style={{
              background: activeTab === 'feed' ? 'var(--accent-gold)' : 'transparent',
              color: activeTab === 'feed' ? 'var(--bg-primary)' : 'var(--text-secondary)',
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
            <Sparkles size={16} />
            Mural de Edificação
          </button>
        </div>
      </div>

      {/* TAB 1: MEETINGS REGISTRY */}
      {activeTab === 'meetings' && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '2rem'
        }}>
          
          {/* Left Column: Weekly Focus and Questions Guide */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            {/* Weekly Growth Checklist */}
            <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckSquare size={22} style={{ color: 'var(--accent-gold)' }} />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Foco de Crescimento Semanal</h3>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {weeklyGoals.map(goal => (
                  <div 
                    key={goal.id} 
                    className="glass-card"
                    onClick={() => toggleWeeklyGoal(goal.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      cursor: 'pointer',
                      padding: '1rem',
                      background: goal.done ? 'rgba(52, 211, 153, 0.03)' : 'rgba(0,0,0,0.15)',
                      borderColor: goal.done ? 'rgba(52, 211, 153, 0.2)' : 'var(--glass-border)'
                    }}
                  >
                    <input 
                      type="checkbox" 
                      checked={goal.done}
                      onChange={() => {}} 
                      style={{
                        accentColor: 'var(--accent-gold)',
                        width: '16px',
                        height: '16px',
                        cursor: 'pointer'
                      }}
                    />
                    <span style={{
                      fontSize: '0.9rem',
                      textDecoration: goal.done ? 'line-through' : 'none',
                      color: goal.done ? 'var(--text-muted)' : 'var(--text-primary)',
                      fontWeight: goal.done ? 400 : 500
                    }}>
                      {goal.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Guide Questions for Mentor/Disciple */}
            <div className="glass-panel" style={{
              padding: '1.5rem',
              background: 'linear-gradient(135deg, var(--glass-bg), rgba(56, 189, 248, 0.03))'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <HelpCircle size={20} style={{ color: 'var(--accent-blue)' }} />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Roteiro para Encontro</h3>
              </div>
              
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', lineHeight: '1.4' }}>
                Utilize estas perguntas reflexivas para aprofundar a conversa e a prestação de contas mútua durante a reunião de discipulado:
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {DISCIPLESHIP_QUESTIONS.map((q, idx) => (
                  <div key={idx} style={{
                    display: 'flex',
                    gap: '0.75rem',
                    alignItems: 'flex-start'
                  }}>
                    <div style={{
                      background: 'rgba(56, 189, 248, 0.1)',
                      color: 'var(--accent-blue)',
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: '2px'
                    }}>
                      {idx + 1}
                    </div>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: '1.4' }}>{q}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column: Meetings Registry */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Users size={22} style={{ color: 'var(--accent-gold)' }} />
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Registros de Encontros</h3>
                </div>

                {!showAddForm && (
                  <button 
                    onClick={() => setShowAddForm(true)}
                    className="btn btn-secondary" 
                    style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}
                  >
                    <Plus size={16} /> Novo Registro
                  </button>
                )}
              </div>

              {showAddForm && (
                <form onSubmit={handleMeetingSubmit} className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', border: '1px solid var(--glass-border)', padding: '1.25rem', borderRadius: 'var(--radius-md)', background: 'rgba(0,0,0,0.15)' }}>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <div className="form-group" style={{ flex: 2, margin: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.75rem' }}>Nome da Pessoa</label>
                      <input 
                        type="text" 
                        value={partnerName}
                        onChange={(e) => setPartnerName(e.target.value)}
                        className="input-field" 
                        placeholder="Mentor ou Discípulo..."
                        required
                      />
                    </div>

                    <div className="form-group" style={{ flex: 1, margin: 0 }}>
                      <label className="form-label" style={{ fontSize: '0.75rem' }}>Papel</label>
                      <select 
                        value={role} 
                        onChange={(e) => setRole(e.target.value as 'mentor' | 'disciple')}
                        className="select-field"
                        style={{ background: 'rgba(0,0,0,0.4)', cursor: 'pointer' }}
                      >
                        <option value="disciple" style={{ background: 'var(--bg-secondary)' }}>Discípulo</option>
                        <option value="mentor" style={{ background: 'var(--bg-secondary)' }}>Mentor</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>Resumo do Encontro</label>
                    <textarea 
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="textarea-field" 
                      style={{ minHeight: '80px' }}
                      placeholder="Quais foram os tópicos conversados e orações compartilhadas?"
                      required
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.75rem' }}>Compromisso / Meta de Oração</label>
                    <input 
                      type="text" 
                      value={commitment}
                      onChange={(e) => setCommitment(e.target.value)}
                      className="input-field" 
                      placeholder="Ex: Ler Hebreus esta semana ou orar por emprego..."
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                    <button 
                      type="button" 
                      onClick={() => setShowAddForm(false)}
                      className="btn btn-text"
                      style={{ fontSize: '0.85rem', padding: '0.4rem 0.75rem' }}
                    >
                      Cancelar
                    </button>

                    <button 
                      type="submit" 
                      className="btn btn-primary"
                      style={{ fontSize: '0.85rem', padding: '0.4rem 1rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                    >
                      <Save size={14} /> Salvar Encontro
                    </button>
                  </div>
                </form>
              )}

              {/* History */}
              {meetings.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '2.5rem',
                  color: 'var(--text-muted)',
                  fontSize: '0.9rem',
                  border: '1px dashed var(--glass-border)',
                  borderRadius: 'var(--radius-md)'
                }}>
                  Nenhum encontro registrado. Registre seu primeiro momento de discipulado!
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '420px', overflowY: 'auto' }}>
                  {meetings.map(m => (
                    <div key={m.id} className="glass-card" style={{ padding: '1rem', background: 'rgba(0,0,0,0.1)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <User size={16} style={{ color: m.role === 'mentor' ? 'var(--accent-blue)' : 'var(--accent-gold)' }} />
                          <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{m.partnerName}</span>
                          <span className="badge" style={{
                            fontSize: '0.65rem',
                            background: m.role === 'mentor' ? 'rgba(56, 189, 248, 0.1)' : 'rgba(212, 163, 89, 0.1)',
                            color: m.role === 'mentor' ? 'var(--accent-blue)' : 'var(--accent-gold)',
                            padding: '0.15rem 0.5rem'
                          }}>
                            {m.role === 'mentor' ? 'MENTOR' : 'DISCÍPULO'}
                          </span>
                        </div>

                        <button 
                          onClick={() => onDeleteMeeting(m.id)}
                          style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                        <Calendar size={12} />
                        <span>{new Date(m.date).toLocaleDateString('pt-BR')}</span>
                      </div>

                      <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.75rem', whiteSpace: 'pre-wrap' }}>
                        {m.notes}
                      </p>

                      {m.commitment && (
                        <div style={{
                          background: 'rgba(255,255,255,0.02)',
                          border: '1px solid var(--glass-border)',
                          padding: '0.5rem 0.75rem',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.85rem'
                        }}>
                          <span style={{ color: 'var(--accent-gold)', fontWeight: 600, marginRight: '0.25rem' }}>Compromisso:</span>
                          <span style={{ color: 'var(--text-primary)' }}>{m.commitment}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: METAS & COMPROMISSOS */}
      {activeTab === 'goals' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Goal Creator Form */}
          <div className="glass-panel animate-fade-in" style={{ padding: '1.5rem', background: 'rgba(212, 163, 89, 0.02)', border: '1px solid var(--accent-gold-muted)' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--accent-gold)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <Target size={20} /> Estabelecer Novo Compromisso de Crescimento
            </h3>

            <form onSubmit={handleGoalSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>Título do Compromisso</label>
                  <input 
                    type="text" 
                    value={goalTitle}
                    onChange={(e) => setGoalTitle(e.target.value)}
                    placeholder="Ex: Ler o livro de Tiago até semana que vem..."
                    className="input-field" 
                    required
                  />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>Parceiro de Discipulado</label>
                  <input 
                    type="text" 
                    value={goalPartner}
                    onChange={(e) => setGoalPartner(e.target.value)}
                    placeholder="Nome do seu mentor ou discípulo..."
                    className="input-field" 
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>Data Limite / Alvo</label>
                  <input 
                    type="date" 
                    value={goalDate}
                    onChange={(e) => setGoalDate(e.target.value)}
                    className="input-field" 
                    style={{ cursor: 'pointer' }}
                    required
                  />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>Proposto Por</label>
                  <select 
                    value={goalProposedBy}
                    onChange={(e) => setGoalProposedBy(e.target.value as 'mentor' | 'disciple')}
                    className="select-field"
                    style={{ background: 'rgba(0,0,0,0.4)', cursor: 'pointer' }}
                  >
                    <option value="disciple" style={{ background: 'var(--bg-secondary)' }}>Discípulo</option>
                    <option value="mentor" style={{ background: 'var(--bg-secondary)' }}>Mentor</option>
                  </select>
                </div>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontSize: '0.75rem' }}>Descrição ou detalhes (Opcional)</label>
                <input 
                  type="text" 
                  value={goalDesc}
                  onChange={(e) => setGoalDesc(e.target.value)}
                  placeholder="Algum detalhe de como vão cumprir este desafio ou orar por isso..."
                  className="input-field" 
                />
              </div>

              <button type="submit" className="btn btn-primary animate-fade-in" style={{ alignSelf: 'flex-end', fontSize: '0.85rem', padding: '0.5rem 1.5rem' }}>
                Registrar Compromisso
              </button>
            </form>
          </div>

          {/* Active Goals list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Lista de Compromissos e Desafios</h3>

            {activeGoals.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '3rem',
                color: 'var(--text-muted)',
                border: '1px dashed var(--glass-border)',
                borderRadius: 'var(--radius-md)'
              }}>
                Nenhum compromisso de discipulado ativo. Proponha uma meta prática acima!
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
                {activeGoals.map(goal => (
                  <div key={goal.id} className="glass-card gold-border-hover animate-fade-in" style={{
                    padding: '1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                    background: goal.isCompleted ? 'rgba(52, 211, 153, 0.02)' : 'rgba(0,0,0,0.15)',
                    borderColor: goal.isCompleted ? 'rgba(52, 211, 153, 0.15)' : 'var(--glass-border)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <input 
                          type="checkbox"
                          checked={goal.isCompleted}
                          onChange={() => onToggleGoal(goal.id)}
                          style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--accent-gold)' }}
                        />
                        <h4 style={{
                          fontSize: '1.05rem',
                          fontWeight: 700,
                          color: goal.isCompleted ? 'var(--text-muted)' : 'var(--text-primary)',
                          textDecoration: goal.isCompleted ? 'line-through' : 'none',
                          marginTop: '1px'
                        }}>
                          {goal.title}
                        </h4>
                      </div>

                      <button 
                        onClick={() => onDeleteGoal(goal.id)}
                        style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.15)', cursor: 'pointer' }}
                        title="Excluir Compromisso"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    {goal.description && (
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontStyle: 'italic', margin: 0 }}>
                        "{goal.description}"
                      </p>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--glass-border)', paddingTop: '0.75rem', marginTop: 'auto', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      <span>Parceiro: <b>{goal.partnerName}</b> ({goal.proposedBy === 'mentor' ? 'Mentor' : 'Discípulo'})</span>
                      <span style={{ color: goal.isCompleted ? 'var(--accent-green)' : 'var(--accent-gold)', fontWeight: 600 }}>
                        {goal.isCompleted ? '✓ CONCLUÍDO' : `Até: ${new Date(goal.targetDate).toLocaleDateString('pt-BR')}`}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

      {/* TAB 3: MURAL DE EDIFICAÇÃO (FEED) */}
      {activeTab === 'feed' && (
        <div className="animate-fade-in">
          <EdificationFeed 
            feed={sharedDevocionais} 
            loading={feedLoading} 
            onRefresh={onRefreshFeed} 
          />
        </div>
      )}

    </div>
  );
}
