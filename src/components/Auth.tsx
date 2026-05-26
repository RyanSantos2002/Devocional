import { useState } from 'react';
import { supabase } from '../services/supabase';
import { Mail, Lock, User, Sparkles, ArrowRight, CheckCircle, AlertTriangle, KeyRound } from 'lucide-react';

interface AuthProps {
  onAuthSuccess: (session: any) => void;
  initialUserName?: string;
  onSaveUserName: (name: string) => void;
}

export function Auth({ onAuthSuccess, initialUserName = '', onSaveUserName }: AuthProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'recovery'>('login');
  
  // Form values
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState(initialUserName);
  
  // Loading & states
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Clear messages when switching tabs
  const handleTabChange = (tab: 'login' | 'register' | 'recovery') => {
    setActiveTab(tab);
    setMessage(null);
    setPassword('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setMessage({ type: 'error', text: 'Por favor, preencha todos os campos.' });
      return;
    }

    if (!supabase) {
      setMessage({ type: 'error', text: 'Supabase não está devidamente configurado no arquivo .env.' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password
      });

      if (error) throw error;
      
      if (data?.session) {
        // Retrieve display name from user metadata if available
        const userDisplayName = data.session.user?.user_metadata?.display_name || '';
        if (userDisplayName) {
          onSaveUserName(userDisplayName);
        }
        onAuthSuccess(data.session);
      }
    } catch (err: any) {
      console.error(err);
      setMessage({ type: 'error', text: err.message || 'Erro ao realizar login. Verifique suas credenciais.' });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !name) {
      setMessage({ type: 'error', text: 'Por favor, preencha todos os campos.' });
      return;
    }

    if (password.length < 6) {
      setMessage({ type: 'error', text: 'A senha deve conter no mínimo 6 caracteres.' });
      return;
    }

    if (!supabase) {
      setMessage({ type: 'error', text: 'Supabase não está configurado no arquivo .env.' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
        options: {
          data: {
            display_name: name.trim()
          }
        }
      });

      if (error) throw error;

      onSaveUserName(name.trim());
      
      // Some Supabase setups have email confirmation enabled
      if (data?.session) {
        setMessage({ type: 'success', text: 'Conta criada e autenticada com sucesso! Redirecionando...' });
        setTimeout(() => {
          onAuthSuccess(data.session);
        }, 1500);
      } else {
        setMessage({ 
          type: 'success', 
          text: 'Cadastro realizado! Por favor, verifique sua caixa de entrada para confirmar o e-mail.' 
        });
      }
    } catch (err: any) {
      console.error(err);
      setMessage({ type: 'error', text: err.message || 'Erro ao realizar cadastro.' });
    } finally {
      setLoading(false);
    }
  };

  const handleRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setMessage({ type: 'error', text: 'Por favor, preencha o campo de e-mail.' });
      return;
    }

    if (!supabase) {
      setMessage({ type: 'error', text: 'Supabase não está configurado.' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: window.location.origin
      });

      if (error) throw error;

      setMessage({ 
        type: 'success', 
        text: 'E-mail de recuperação enviado com sucesso! Verifique sua caixa de entrada.' 
      });
    } catch (err: any) {
      console.error(err);
      setMessage({ type: 'error', text: err.message || 'Erro ao enviar e-mail de recuperação.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(circle at center, #111827 0%, #030712 100%)',
      padding: '1.5rem',
      position: 'fixed',
      top: 0,
      left: 0,
      zIndex: 9999,
      overflowY: 'auto'
    }}>
      {/* Visual background lights for premium feel */}
      <div style={{
        position: 'absolute',
        width: '300px',
        height: '300px',
        background: 'var(--accent-gold)',
        filter: 'blur(150px)',
        borderRadius: '50%',
        opacity: 0.08,
        top: '20%',
        left: '25%',
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute',
        width: '300px',
        height: '300px',
        background: 'var(--accent-blue)',
        filter: 'blur(150px)',
        borderRadius: '50%',
        opacity: 0.08,
        bottom: '20%',
        right: '25%',
        pointerEvents: 'none'
      }} />

      {/* Main Glass Panel */}
      <div className="glass-panel animate-fade-in" style={{
        width: '100%',
        maxWidth: '450px',
        padding: '2.5rem 2rem',
        background: 'rgba(15, 23, 42, 0.45)',
        border: '1px solid var(--accent-gold-muted)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)',
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem'
      }}>
        
        {/* App Logo Header */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', textAlign: 'center' }}>
          <div style={{
            background: 'var(--accent-gold-muted)',
            border: '1px solid var(--accent-gold)',
            color: 'var(--accent-gold)',
            width: '54px',
            height: '54px',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.75rem',
            fontWeight: 800,
            boxShadow: '0 0 20px rgba(212, 163, 89, 0.25)'
          }}>
            D
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f8fafc', marginTop: '0.5rem', fontFamily: 'var(--font-serif)' }}>
            Devocional
          </h2>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600 }}>
            Estudo & Discipulado Pessoal
          </span>
        </div>

        {/* Dynamic Action Tabs */}
        {activeTab !== 'recovery' && (
          <div style={{
            background: 'rgba(0,0,0,0.25)',
            padding: '0.3rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--glass-border)',
            display: 'flex',
            gap: '0.25rem'
          }}>
            <button
              onClick={() => handleTabChange('login')}
              style={{
                flex: 1,
                background: activeTab === 'login' ? 'var(--accent-gold)' : 'transparent',
                color: activeTab === 'login' ? 'var(--bg-primary)' : 'var(--text-secondary)',
                border: 'none',
                padding: '0.6rem 0',
                borderRadius: '8px',
                fontSize: '0.9rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)'
              }}
            >
              Entrar
            </button>
            <button
              onClick={() => handleTabChange('register')}
              style={{
                flex: 1,
                background: activeTab === 'register' ? 'var(--accent-gold)' : 'transparent',
                color: activeTab === 'register' ? 'var(--bg-primary)' : 'var(--text-secondary)',
                border: 'none',
                padding: '0.6rem 0',
                borderRadius: '8px',
                fontSize: '0.9rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)'
              }}
            >
              Cadastrar
            </button>
          </div>
        )}

        {/* Message Alert Banners */}
        {message && (
          <div className="animate-fade-in" style={{
            background: message.type === 'success' ? 'rgba(52, 211, 153, 0.05)' : 'rgba(248, 113, 113, 0.05)',
            border: `1px solid ${message.type === 'success' ? 'rgba(52, 211, 153, 0.2)' : 'rgba(248, 113, 113, 0.2)'}`,
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            color: message.type === 'success' ? 'var(--accent-green)' : '#f87171',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.5rem',
            lineHeight: '1.4'
          }}>
            {message.type === 'success' ? (
              <CheckCircle size={18} style={{ flexShrink: 0, marginTop: '1px' }} />
            ) : (
              <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: '1px' }} />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {/* Authentication Forms */}
        {activeTab === 'login' && (
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontSize: '0.75rem' }}>E-mail</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seuemail@exemplo.com"
                  className="input-field"
                  style={{ width: '100%', paddingLeft: '2.5rem' }}
                  required
                />
              </div>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                <label className="form-label" style={{ fontSize: '0.75rem', margin: 0 }}>Senha</label>
                <button
                  type="button"
                  onClick={() => handleTabChange('recovery')}
                  style={{ background: 'transparent', border: 'none', color: 'var(--accent-blue)', fontSize: '0.75rem', cursor: 'pointer', textDecoration: 'underline' }}
                >
                  Esqueceu a senha?
                </button>
              </div>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-field"
                  style={{ width: '100%', paddingLeft: '2.5rem' }}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '0.85rem',
                fontSize: '0.95rem',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                marginTop: '0.5rem'
              }}
            >
              {loading ? 'Entrando...' : 'Entrar na Conta'}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>
        )}

        {activeTab === 'register' && (
          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontSize: '0.75rem' }}>Seu Nome</label>
              <div style={{ position: 'relative' }}>
                <User size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Como quer ser chamado?"
                  className="input-field"
                  style={{ width: '100%', paddingLeft: '2.5rem' }}
                  required
                />
              </div>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontSize: '0.75rem' }}>E-mail</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seuemail@exemplo.com"
                  className="input-field"
                  style={{ width: '100%', paddingLeft: '2.5rem' }}
                  required
                />
              </div>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontSize: '0.75rem' }}>Senha</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo de 6 caracteres"
                  className="input-field"
                  style={{ width: '100%', paddingLeft: '2.5rem' }}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '0.85rem',
                fontSize: '0.95rem',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                marginTop: '0.5rem'
              }}
            >
              {loading ? 'Cadastrando...' : 'Criar Conta Grátis'}
              {!loading && <Sparkles size={18} style={{ color: 'var(--bg-primary)' }} />}
            </button>
          </form>
        )}

        {activeTab === 'recovery' && (
          <form onSubmit={handleRecovery} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <KeyRound size={20} style={{ color: 'var(--accent-gold)' }} />
              <h3 style={{ fontSize: '1rem', fontWeight: 'bold' }}>Recuperar Senha</h3>
            </div>
            
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
              Insira o e-mail associado à sua conta abaixo. Nós enviaremos um link seguro para você redefinir sua senha de acesso.
            </p>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontSize: '0.75rem' }}>E-mail de Cadastro</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seuemail@exemplo.com"
                  className="input-field"
                  style={{ width: '100%', paddingLeft: '2.5rem' }}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button
                type="button"
                onClick={() => handleTabChange('login')}
                className="btn btn-secondary"
                style={{ flex: 1, padding: '0.85rem', fontSize: '0.9rem' }}
              >
                Voltar
              </button>
              
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
                style={{ flex: 1, padding: '0.85rem', fontSize: '0.9rem', fontWeight: 'bold' }}
              >
                {loading ? 'Enviando...' : 'Enviar Link'}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
