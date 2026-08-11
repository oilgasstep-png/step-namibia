import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

export type UserRole = 'admin' | 'recruiter' | 'viewer' | null;

interface AuthContextType {
  user: User | null;
  role: UserRole;
  loading: boolean;
  loginWithEmail: (email: string, pass: string) => Promise<{ error: any }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: null,
  loading: true,
  loginWithEmail: async () => ({ error: null }),
  logout: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    // Obtém a sessão inicial
    async function initAuth() {
      try {
        const { data } = await supabase.auth.getSession();
        if (isMounted) {
          const currentUser = data.session?.user ?? null;
          setUser(currentUser);
          setRole((currentUser?.user_metadata?.role as UserRole) || (currentUser ? 'viewer' : null));
        }
      } catch (err) {
        console.warn('Erro ao inicializar sessão do Supabase:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    initAuth();

    // Listener global para mudanças de estado de autenticação (login, logout, refresh)
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (isMounted) {
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        setRole((currentUser?.user_metadata?.role as UserRole) || (currentUser ? 'viewer' : null));
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  const loginWithEmail = async (email: string, pass: string) => {
    // O próprio Supabase acionará o onAuthStateChange em caso de sucesso
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: pass,
    });
    return { error };
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.error('Erro ao realizar logout:', e);
    }
    setUser(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{ user, role, loading, loginWithEmail, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);