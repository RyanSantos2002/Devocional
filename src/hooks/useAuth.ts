import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import type { Session } from '@supabase/supabase-js';

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setAuthLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setAuthLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    if (window.confirm('Deseja realmente sair da sua conta? Seus dados sincronizados continuarão seguros em nuvem.')) {
      if (supabase) {
        await supabase.auth.signOut();
        setSession(null);
      }
    }
  };

  return { session, setSession, authLoading, handleLogout };
}
