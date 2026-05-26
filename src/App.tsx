import { lazy, Suspense, useState, useEffect } from 'react';
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

  return (
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
      zIndex: 2500,
      padding: '1.5rem',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)'
    }}>
      <div className="glass-panel animate-fade-in" style={{
        width: '100%',
        maxWidth: '500px',
        padding: '2rem',
        background: 'var(--bg-secondary)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
        border: '1px solid var(--accent-gold)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Ajustes do Aplicativo</h3>
          <button
            onClick={() => ctx.setShowSettingsModal(false)}
            className="btn btn-secondary"
            style={{ padding: '0.25rem 0.75rem', fontSize: '0.85rem' }}
          >
            Fechar
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <h4 style={{ fontSize: '0.95rem', color: 'var(--accent-gold)', marginBottom: '0.25rem' }}>Perfil & Assistente de Estudo IA</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
              Personalize seu perfil local e configure sua chave do Gemini. Todos os dados permanecem estritamente privados no seu navegador.
            </p>
          </div>

          <div className="form-group">
            <label className="form-label" style={{ fontSize: '0.75rem' }}>Seu Nome / Apelido</label>
            <input
              type="text"
              value={ctx.userName}
              onChange={(e) => ctx.setUserName(e.target.value)}
              className="input-field"
              placeholder="Como você quer ser chamado?"
              style={{ width: '100%' }}
            />
          </div>

          <div className="form-group">
            <label className="form-label" style={{ fontSize: '0.75rem' }}>Chave de API do Gemini</label>
            <input
              type="password"
              value={ctx.geminiApiKey}
              onChange={(e) => ctx.setGeminiApiKey(e.target.value)}
              className="input-field"
              placeholder="Cole sua API Key (AI_zaSy...)"
              style={{ width: '100%' }}
            />
          </div>

          <div style={{
            background: 'rgba(212, 163, 89, 0.05)',
            border: '1px solid rgba(212, 163, 89, 0.15)',
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.8rem',
            lineHeight: '1.4'
          }}>
            <span style={{ fontWeight: 'bold', color: 'var(--accent-gold)' }}>Como pegar uma chave gratis?</span>
            <ol style={{ paddingLeft: '1.25rem', marginTop: '0.25rem' }}>
              <li>Acesse o <a href="https://aistudio.google.com/" target="_blank" rel="noreferrer" style={{ color: 'var(--accent-blue)', textDecoration: 'underline' }}>Google AI Studio</a>.</li>
              <li>Faca login com seu Gmail.</li>
              <li>Clique em <b>Get API Key</b> e crie uma chave nova.</li>
              <li>Copie e cole a chave no campo acima!</li>
            </ol>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--glass-border)', paddingTop: '1rem', marginTop: '0.5rem' }}>
          {ctx.session && (
            <button
              onClick={ctx.handleLogout}
              className="btn"
              style={{
                background: 'rgba(248, 113, 113, 0.1)',
                color: '#f87171',
                border: '1px solid rgba(248, 113, 113, 0.2)',
                fontSize: '0.9rem',
                padding: '0.5rem 1rem'
              }}
            >
              Sair da Conta
            </button>
          )}
          <button
            onClick={() => {
              ctx.setShowSettingsModal(false);
              alert('Configuracoes salvas localmente!');
            }}
            className="btn btn-primary"
            style={{ fontSize: '0.9rem', padding: '0.5rem 1.5rem', marginLeft: 'auto' }}
          >
            Salvar e Fechar
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
