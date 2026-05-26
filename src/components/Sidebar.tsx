import { useRef } from 'react';
import { LayoutDashboard, BookOpen, BookMarked, Users, Flame, Settings, Sun, Moon, Download, Upload } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  streakCount: number;
  onOpenSettings: () => void;
  onLogout?: () => void;
}

export function Sidebar({ activeTab, setActiveTab, streakCount, onOpenSettings, onLogout }: SidebarProps) {
  const { theme, toggleTheme, exportData, importData } = useAppContext();
  const importRef = useRef<HTMLInputElement>(null);

  const menuItems = [
    { id: 'dashboard', name: 'Painel', icon: LayoutDashboard },
    { id: 'bible', name: 'Leitor Biblico', icon: BookOpen },
    { id: 'journal', name: 'Diario Devocional', icon: BookMarked },
    { id: 'discipleship', name: 'Discipulado', icon: Users },
  ];

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (window.confirm('Isso vai substituir seus dados atuais pelo backup. Deseja continuar?')) {
        importData(file);
      }
    }
    e.target.value = '';
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="glass-panel" role="navigation" aria-label="Menu principal" style={{
        width: '280px',
        padding: '2rem 1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '2.5rem',
        height: '100vh',
        position: 'sticky',
        top: 0,
        borderRadius: 0,
        borderRight: '1px solid var(--glass-border)',
        borderLeft: 'none',
        borderTop: 'none',
        borderBottom: 'none',
        zIndex: 100
      }}>
        {/* Brand/Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingLeft: '0.5rem' }}>
          <div style={{
            background: 'var(--accent-gold-muted)',
            border: '1px solid var(--accent-gold)',
            color: 'var(--accent-gold)',
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.25rem',
            fontWeight: 'bold',
            boxShadow: '0 0 10px rgba(212, 163, 89, 0.15)'
          }}>
            D
          </div>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800, lineHeight: 1.1 }}>Devocional</h1>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500, letterSpacing: '0.05em' }}>ESTUDO & DISCIPULADO</span>
          </div>
        </div>

        {/* Streak Counter */}
        <div className="glass-card" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          padding: '1rem',
          borderRadius: 'var(--radius-md)',
          background: 'rgba(212, 163, 89, 0.05)',
          borderColor: 'rgba(212, 163, 89, 0.15)'
        }}>
          <div style={{
            color: 'var(--accent-gold)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: 'fadeIn 1s ease'
          }}>
            <Flame size={24} fill="var(--accent-gold)" className="pulse-gold" style={{ borderRadius: '50%' }} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 }}>OFENSIVA ATIVA</div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>{streakCount} {streakCount === 1 ? 'Dia' : 'Dias'} seguidos</div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }} aria-label="Navegacao principal">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className="btn"
                aria-current={isActive ? 'page' : undefined}
                style={{
                  justifyContent: 'flex-start',
                  width: '100%',
                  background: isActive ? 'var(--accent-gold-muted)' : 'transparent',
                  color: isActive ? 'var(--accent-gold)' : 'var(--text-secondary)',
                  border: '1px solid transparent',
                  borderColor: isActive ? 'rgba(212, 163, 89, 0.2)' : 'transparent',
                  padding: '0.85rem 1rem',
                  fontSize: '0.95rem',
                  fontWeight: isActive ? 600 : 500,
                  transition: 'all var(--transition-normal)'
                }}
              >
                <Icon size={20} style={{ color: isActive ? 'var(--accent-gold)' : 'var(--text-secondary)' }} />
                {item.name}
              </button>
            );
          })}
        </nav>

        {/* Theme Toggle + Data Actions */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={toggleTheme}
            className="btn btn-secondary"
            aria-label={theme === 'dark' ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
            title={theme === 'dark' ? 'Tema Claro' : 'Tema Escuro'}
            style={{ flex: 1, padding: '0.5rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            <span>{theme === 'dark' ? 'Claro' : 'Escuro'}</span>
          </button>
          <button
            onClick={exportData}
            className="btn btn-secondary"
            aria-label="Exportar backup dos dados"
            title="Exportar Backup"
            style={{ padding: '0.5rem 0.65rem' }}
          >
            <Download size={16} />
          </button>
          <button
            onClick={() => importRef.current?.click()}
            className="btn btn-secondary"
            aria-label="Importar backup dos dados"
            title="Importar Backup"
            style={{ padding: '0.5rem 0.65rem' }}
          >
            <Upload size={16} />
          </button>
          <input
            ref={importRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            style={{ display: 'none' }}
            aria-hidden="true"
          />
        </div>

        {/* Settings Button */}
        <button
          onClick={onOpenSettings}
          className="btn btn-secondary animate-fade-in"
          aria-label="Abrir configuracoes"
          style={{
            padding: '0.65rem',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.85rem',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            borderColor: 'rgba(255,255,255,0.05)',
            background: 'rgba(255,255,255,0.02)',
            cursor: 'pointer'
          }}
        >
          <Settings size={16} style={{ color: 'var(--accent-gold)' }} />
          <span>Ajustes do Perfil</span>
        </button>

        {/* Logout Button */}
        {onLogout && (
          <button
            onClick={onLogout}
            className="btn btn-text animate-fade-in"
            aria-label="Sair da conta"
            style={{
              padding: '0.65rem',
              fontSize: '0.85rem',
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              color: '#f87171',
              background: 'rgba(248, 113, 113, 0.05)',
              border: '1px solid rgba(248, 113, 113, 0.1)',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
              marginTop: '-1.5rem',
              transition: 'all var(--transition-fast)'
            }}
          >
            <span>Sair da Conta</span>
          </button>
        )}

        {/* Footer info */}
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', fontWeight: 500, marginTop: '0.25rem' }}>
          Versao PWA v2.0.0
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="glass-panel" role="navigation" aria-label="Navegacao mobile" style={{
        display: 'none',
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: '64px',
        borderRadius: 0,
        borderTop: '1px solid var(--glass-border)',
        borderLeft: 'none',
        borderRight: 'none',
        borderBottom: 'none',
        justifyContent: 'space-around',
        alignItems: 'center',
        padding: '0 0.5rem',
        zIndex: 1000
      }}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              aria-current={isActive ? 'page' : undefined}
              aria-label={item.name}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.25rem',
                background: 'transparent',
                border: 'none',
                color: isActive ? 'var(--accent-gold)' : 'var(--text-secondary)',
                fontSize: '0.65rem',
                fontWeight: isActive ? 600 : 500,
                width: '20%',
                height: '100%',
                cursor: 'pointer',
                transition: 'color var(--transition-fast)'
              }}
            >
              <Icon size={20} style={{ color: isActive ? 'var(--accent-gold)' : 'var(--text-secondary)' }} />
              <span>{item.name}</span>
            </button>
          );
        })}

        {/* Mobile Settings Button */}
        <button
          onClick={onOpenSettings}
          aria-label="Abrir configuracoes"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.25rem',
            background: 'transparent',
            border: 'none',
            color: 'var(--text-secondary)',
            fontSize: '0.65rem',
            fontWeight: 500,
            width: '20%',
            height: '100%',
            cursor: 'pointer',
            transition: 'color var(--transition-fast)'
          }}
        >
          <Settings size={20} style={{ color: 'var(--text-secondary)' }} />
          <span>Ajustes</span>
        </button>
      </nav>

      {/* Responsive overrides style block */}
      <style>{`
        @media (max-width: 768px) {
          aside {
            display: none !important;
          }
          nav.glass-panel {
            display: flex !important;
          }
        }
      `}</style>
    </>
  );
}
