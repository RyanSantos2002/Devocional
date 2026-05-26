import { lazy, Suspense, useState, useEffect, useRef } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useAppContext } from './contexts/AppContext';
import { Sidebar } from './components/Sidebar';
import { Auth } from './components/Auth';
import { SearchModal } from './components/SearchModal';
import { supabase } from './services/supabase';

const Dashboard = lazy(() => import('./components/Dashboard').then(m => ({ default: m.Dashboard })));
const BibleReader = lazy(() => import('./components/BibleReader').then(m => ({ default: m.BibleReader })));
const Journal = lazy(() => import('./components/Journal').then(m => ({ default: m.Journal })));
const Discipleship = lazy(() => import('./components/Discipleship').then(m => ({ default: m.Discipleship })));

function PageLoader() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '50vh',
      color: 'var(--text-secondary)'
    }}>
      <div className="pulse-gold" style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--accent-gold-muted)' }} />
    </div>
  );
}

function AppContent() {
  const ctx = useAppContext();
  const [searchOpen, setSearchOpen] = useState(false);

  // Ctrl+K to open search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (ctx.authLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(circle at center, #111827 0%, #030712 100%)',
        color: 'var(--text-secondary)'
      }}>
        <div className="pulse-gold" style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'var(--accent-gold-muted)', marginBottom: '1.5rem' }} />
        <span style={{ fontSize: '0.9rem', letterSpacing: '0.05em' }}>Carregando sua jornada devocional...</span>
      </div>
    );
  }

  if (supabase && !ctx.session) {
    return (
      <Auth
        onAuthSuccess={(newSession) => ctx.setSession(newSession)}
        initialUserName={ctx.userName}
        onSaveUserName={ctx.setUserName}
      />
    );
  }

  return (
    <div className="app-container">
      <Sidebar
        activeTab={ctx.activeTab}
        setActiveTab={ctx.setActiveTab}
        streakCount={ctx.streakCount}
        onOpenSettings={() => ctx.setShowSettingsModal(true)}
        onLogout={ctx.session ? ctx.handleLogout : undefined}
      />

      <main className="main-content" id="main-content" role="main">
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={
              <Dashboard
                onNavigate={ctx.setActiveTab}
                journalEntries={ctx.journalEntries}
                streakCount={ctx.streakCount}
                userName={ctx.userName}
                setUserName={ctx.setUserName}
                geminiApiKey={ctx.geminiApiKey}
                setGeminiApiKey={ctx.setGeminiApiKey}
                activeGoals={ctx.goals.filter(g => !g.isCompleted)}
                readingProgress={ctx.readingProgress}
                onNavigateToPassage={ctx.handleNavigateToPassage}
                onNavigateToPlans={ctx.handleNavigateToPlans}
                readingLogs={ctx.readingLogs}
              />
            } />
            <Route path="/bible" element={
              <BibleReader
                onStartDevotional={ctx.handleStartDevotionalFromBible}
                savedHighlights={ctx.bibleHighlights}
                onToggleHighlight={ctx.handleToggleHighlight}
                geminiApiKey={ctx.geminiApiKey}
                onChangeGeminiKey={ctx.setGeminiApiKey}
                readingProgress={ctx.readingProgress}
                onJoinPlan={ctx.handleJoinPlan}
                onCompleteDay={ctx.handleCompleteDay}
                targetPassage={ctx.bibleTargetPassage}
                onClearTargetPassage={ctx.clearTargetPassage}
                activeSubView={ctx.bibleSubView}
                onChangeSubView={ctx.setBibleSubView}
                onReportReadingTime={ctx.handleReportReadingTime}
              />
            } />
            <Route path="/journal" element={
              <Journal
                entries={ctx.journalEntries}
                onAddEntry={ctx.handleAddJournalEntry}
                onDeleteEntry={ctx.handleDeleteJournalEntry}
                prefillVerseRef={ctx.prefillVerseRef}
                prefillVerseText={ctx.prefillVerseText}
                onClearPrefill={ctx.clearPrefill}
                prayers={ctx.prayers}
                onAddPrayer={ctx.handleAddPrayer}
                onToggleAnswered={ctx.handleToggleAnswered}
                onDeletePrayer={ctx.handleDeletePrayer}
              />
            } />
            <Route path="/discipleship" element={
              <Discipleship
                meetings={ctx.discipleshipMeetings}
                onAddMeeting={ctx.handleAddMeeting}
                onDeleteMeeting={ctx.handleDeleteMeeting}
                activeGoals={ctx.goals}
                onAddGoal={ctx.handleAddGoal}
                onToggleGoal={ctx.handleToggleGoal}
                onDeleteGoal={ctx.handleDeleteGoal}
                sharedDevocionais={ctx.sharedDevocionais}
                onRefreshFeed={ctx.handleRefreshFeed}
                feedLoading={ctx.feedLoading}
              />
            } />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>

      {ctx.showSettingsModal && <SettingsModal />}
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}

function SettingsModal() {
  const ctx = useAppContext();
  const importRef = useRef<HTMLInputElement>(null);

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (window.confirm('Isso vai substituir seus dados atuais pelo backup. Deseja continuar?')) {
        ctx.importData(file);
      }
    }
    e.target.value = '';
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 2500, padding: '1.5rem', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)'
    }} onClick={() => ctx.setShowSettingsModal(false)}>
      <div className="glass-panel animate-fade-in" onClick={e => e.stopPropagation()} style={{
        width: '100%', maxWidth: '480px', padding: '1.75rem',
        background: 'var(--bg-secondary)', display: 'flex', flexDirection: 'column', gap: '1.25rem',
        border: '1px solid var(--glass-border)', maxHeight: '85vh', overflowY: 'auto'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.75rem', borderBottom: '1px solid var(--glass-border)' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Configuracoes</h3>
          <button onClick={() => ctx.setShowSettingsModal(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '1.25rem', lineHeight: 1 }}>
            ×
          </button>
        </div>

        {/* Theme Toggle */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', borderRadius: 'var(--radius-sm)', background: 'var(--bg-tertiary)' }}>
          <div>
            <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>Tema</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{ctx.theme === 'dark' ? 'Escuro' : 'Claro'}</div>
          </div>
          <button
            onClick={ctx.toggleTheme}
            className="btn btn-secondary"
            style={{ padding: '0.4rem 1rem', fontSize: '0.8rem', gap: '0.4rem' }}
          >
            {ctx.theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}
          </button>
        </div>

        {/* Profile */}
        <div>
          <h4 style={{ fontSize: '0.85rem', color: 'var(--accent-gold)', fontWeight: 700, marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.03em' }}>Perfil</h4>
          <div className="form-group" style={{ marginBottom: '0.75rem' }}>
            <label className="form-label" style={{ fontSize: '0.7rem' }}>Seu Nome / Apelido</label>
            <input type="text" value={ctx.userName} onChange={e => ctx.setUserName(e.target.value)} className="input-field" placeholder="Como quer ser chamado?" style={{ width: '100%' }} />
          </div>
        </div>

        {/* Gemini API */}
        <div>
          <h4 style={{ fontSize: '0.85rem', color: 'var(--accent-gold)', fontWeight: 700, marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.03em' }}>Assistente IA (Gemini)</h4>
          <div className="form-group" style={{ marginBottom: '0.5rem' }}>
            <label className="form-label" style={{ fontSize: '0.7rem', display: 'flex', justifyContent: 'space-between' }}>
              <span>Chave de API</span>
              <a href="https://aistudio.google.com/" target="_blank" rel="noreferrer" style={{ color: 'var(--accent-blue)', textDecoration: 'underline', fontSize: '0.65rem' }}>Obter gratis</a>
            </label>
            <input type="password" value={ctx.geminiApiKey} onChange={e => ctx.setGeminiApiKey(e.target.value)} className="input-field" placeholder="Cole sua API Key (AI_zaSy...)" style={{ width: '100%' }} />
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
            Acesse o Google AI Studio, faca login e clique em "Get API Key" para obter uma chave gratuita.
          </p>
        </div>

        {/* Backup */}
        <div>
          <h4 style={{ fontSize: '0.85rem', color: 'var(--accent-gold)', fontWeight: 700, marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.03em' }}>Dados & Backup</h4>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={ctx.exportData} className="btn btn-secondary" style={{ flex: 1, fontSize: '0.8rem', padding: '0.5rem' }}>
              Exportar Backup
            </button>
            <button onClick={() => importRef.current?.click()} className="btn btn-secondary" style={{ flex: 1, fontSize: '0.8rem', padding: '0.5rem' }}>
              Importar Backup
            </button>
            <input ref={importRef} type="file" accept=".json" onChange={handleImport} style={{ display: 'none' }} />
          </div>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
            Exporte seus devocionais, oracoes e progresso em um arquivo JSON.
          </p>
        </div>

        {/* Footer actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--glass-border)', paddingTop: '0.75rem', marginTop: '0.25rem' }}>
          {ctx.session && (
            <button onClick={ctx.handleLogout} className="btn" style={{ background: 'rgba(248,113,113,0.08)', color: 'var(--accent-red)', border: '1px solid rgba(248,113,113,0.15)', fontSize: '0.8rem', padding: '0.4rem 0.75rem' }}>
              Sair da Conta
            </button>
          )}
          <button onClick={() => ctx.setShowSettingsModal(false)} className="btn btn-primary" style={{ fontSize: '0.85rem', padding: '0.4rem 1.25rem', marginLeft: 'auto' }}>
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
