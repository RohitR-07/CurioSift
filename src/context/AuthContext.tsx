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

    let isMounted = true;

    // Safety timeout: Ensure loading is dismissed even if network or Supabase is unresponsive
    const safetyTimeout = setTimeout(() => {
      if (isMounted) setLoading(false);
    }, 3000);

    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        if (!isMounted) return;
        setSession(session);
        setUser(session?.user ?? null);
      })
      .catch((err) => {
        console.warn('[AuthContext] Failed to get session:', err);
      })
      .finally(() => {
        clearTimeout(safetyTimeout);
        if (isMounted) setLoading(false);
      });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) return;
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      isMounted = false;
      clearTimeout(safetyTimeout);
      subscription.unsubscribe();
    };
  }, [configured]);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (!error && data?.session) {
        setSession(data.session);
        setUser(data.session.user);
      }
      return { error };
    } catch (err: any) {
      console.error('[AuthContext] signIn error:', err);
      return { error: err as AuthError };
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string, displayName?: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { display_name: displayName ?? email.split('@')[0] },
        },
      });
      if (!error && data?.session) {
        setSession(data.session);
        setUser(data.session.user);
      }
      return { error };
    } catch (err: any) {
      console.error('[AuthContext] signUp error:', err);
      return { error: err as AuthError };
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('[AuthContext] signOut error:', err);
    } finally {
      setSession(null);
      setUser(null);
    }
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
