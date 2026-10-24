// src/context/AuthContext.tsx
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import type { Session, User, AuthError } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

// ─── Types ────────────────────────────────────────────────────

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  /** Whether Supabase is properly configured with real env vars */
  isConfigured: boolean;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signUp: (email: string, password: string, displayName?: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  /** Display name resolved from user_metadata or email prefix */
  displayName: string;
  /** Helper: sends JWT in Authorization header for backend API calls */
  getAuthHeader: () => Promise<Record<string, string>>;
}

// ─── Context ──────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}

// ─── Provider ─────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const configured = isSupabaseConfigured();

  // Initialise from persisted session on mount
  useEffect(() => {
    if (!configured) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [configured]);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  }, []);

  const signUp = useCallback(async (email: string, password: string, displayName?: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName ?? email.split('@')[0] },
      },
    });
    return { error };
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  /** Returns an Authorization header for backend API calls. */
  const getAuthHeader = useCallback(async (): Promise<Record<string, string>> => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) return {};
    return { Authorization: `Bearer ${session.access_token}` };
  }, []);

  const displayName = user?.user_metadata?.display_name
    ?? user?.email?.split('@')[0]
    ?? 'User';

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        isConfigured: configured,
        signIn,
        signUp,
        signOut,
        displayName,
        getAuthHeader,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
