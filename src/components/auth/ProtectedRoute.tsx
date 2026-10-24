// src/components/auth/ProtectedRoute.tsx
// Redirects unauthenticated users to /login.
// Shows a loading spinner while the auth state is being resolved.

import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading, isConfigured } = useAuth();
  const location = useLocation();

  // While auth state is being restored from the persisted session, show a spinner
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
          <p className="text-sm text-text-secondary">Loading…</p>
        </div>
      </div>
    );
  }

  // If Supabase is not configured (missing env vars), allow access to avoid
  // locking the developer out during local development without env vars.
  if (!isConfigured) {
    return <>{children}</>;
  }

  // Not authenticated — redirect to login preserving the intended destination
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
