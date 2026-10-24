// src/pages/SettingsPage.tsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard, ChevronRight, User, Sliders, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { useAuth } from '../context/AuthContext';

interface Preferences {
  theme: 'light' | 'dark' | 'system';
  default_quiz_count: 5 | 10 | 15 | 20;
  default_difficulty: 'easy' | 'medium' | 'hard';
  show_explanations: boolean;
}

const DEFAULT_PREFS: Preferences = {
  theme: 'light',
  default_quiz_count: 10,
  default_difficulty: 'medium',
  show_explanations: true,
};

export default function SettingsPage() {
  const { user, displayName, getAuthHeader, isConfigured } = useAuth();

  // Profile state
  const [name, setName] = useState(displayName);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Preferences state
  const [prefs, setPrefs] = useState<Preferences>(DEFAULT_PREFS);
  const [loadingPrefs, setLoadingPrefs] = useState(false);
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [prefsMsg, setPrefsMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Load current preferences from backend
  useEffect(() => {
    if (!isConfigured || !user) return;
    setLoadingPrefs(true);
    getAuthHeader().then((headers) =>
      fetch('/api/profile', { headers })
        .then((r) => r.json())
        .then((data) => {
          if (data.preferences) {
            setPrefs((p) => ({ ...p, ...data.preferences }));
          }
          if (data.profile?.display_name) {
            setName(data.profile.display_name);
          }
        })
        .catch(() => {/* silently ignore */})
        .finally(() => setLoadingPrefs(false))
    );
  }, [isConfigured, user, getAuthHeader]);

  const saveProfile = async () => {
    if (!isConfigured) return;
    setSavingProfile(true);
    setProfileMsg(null);
    try {
      const headers = await getAuthHeader();
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ display_name: name.trim() }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? 'Update failed');
      setProfileMsg({ type: 'success', text: 'Profile updated.' });
    } catch (err: any) {
      setProfileMsg({ type: 'error', text: err.message });
    } finally {
      setSavingProfile(false);
    }
  };

  const savePrefs = async () => {
    if (!isConfigured) return;
    setSavingPrefs(true);
    setPrefsMsg(null);
    try {
      const headers = await getAuthHeader();
      const res = await fetch('/api/profile/preferences', {
        method: 'PUT',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify(prefs),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? 'Update failed');
      setPrefsMsg({ type: 'success', text: 'Preferences saved.' });
    } catch (err: any) {
      setPrefsMsg({ type: 'error', text: err.message });
    } finally {
      setSavingPrefs(false);
    }
  };

  const inputCls = 'w-full rounded-xl border border-border bg-white py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/60';
  const selectCls = inputCls;

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-text-secondary font-medium mb-4">
        <Link to="/dashboard" className="flex items-center gap-1 hover:text-primary transition-colors">
          <LayoutDashboard className="w-3.5 h-3.5" /> Dashboard
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-text">Settings</span>
      </div>

      {!isConfigured && (
        <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>Supabase is not configured. Add <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> to your root <code>.env</code> to enable profile persistence.</span>
        </div>
      )}

      {/* Profile Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-primary" />
            <CardTitle className="text-base">Profile</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-0 space-y-4">
          <div>
            <label className="block text-sm font-medium text-text mb-1">Email</label>
            <input
              type="text"
              value={user?.email ?? '—'}
              disabled
              className={`${inputCls} bg-gray-50 text-text-secondary cursor-not-allowed`}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text mb-1">Display Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputCls}
              placeholder="Your display name"
            />
          </div>
          {profileMsg && (
            <div className={`flex items-center gap-2 text-sm px-3 py-2 rounded-lg ${
              profileMsg.type === 'success'
                ? 'bg-green-50 border border-green-200 text-green-700'
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}>
              {profileMsg.type === 'success'
                ? <CheckCircle2 className="w-4 h-4" />
                : <AlertCircle className="w-4 h-4" />}
              {profileMsg.text}
            </div>
          )}
          <div className="flex justify-end">
            <Button
              variant="primary"
              size="sm"
              onClick={saveProfile}
              disabled={savingProfile || !isConfigured || !name.trim()}
            >
              {savingProfile ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
              Save Profile
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Preferences Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-primary" />
            <CardTitle className="text-base">Study Preferences</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-0 space-y-4">
          {loadingPrefs ? (
            <div className="flex items-center gap-2 text-text-secondary text-sm py-4">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading preferences…
            </div>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-text mb-1">Default Quiz Count</label>
                <select
                  className={selectCls}
                  value={prefs.default_quiz_count}
                  onChange={(e) => setPrefs((p) => ({ ...p, default_quiz_count: Number(e.target.value) as Preferences['default_quiz_count'] }))}
                >
                  {[5, 10, 15, 20].map((n) => (
                    <option key={n} value={n}>{n} questions</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text mb-1">Default Difficulty</label>
                <select
                  className={selectCls}
                  value={prefs.default_difficulty}
                  onChange={(e) => setPrefs((p) => ({ ...p, default_difficulty: e.target.value as Preferences['default_difficulty'] }))}
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="show-explanations"
                  checked={prefs.show_explanations}
                  onChange={(e) => setPrefs((p) => ({ ...p, show_explanations: e.target.checked }))}
                  className="w-4 h-4 rounded border-gray-300 text-primary"
                />
                <label htmlFor="show-explanations" className="text-sm font-medium text-text cursor-pointer">
                  Show explanations after quiz
                </label>
              </div>

              {prefsMsg && (
                <div className={`flex items-center gap-2 text-sm px-3 py-2 rounded-lg ${
                  prefsMsg.type === 'success'
                    ? 'bg-green-50 border border-green-200 text-green-700'
                    : 'bg-red-50 border border-red-200 text-red-700'
                }`}>
                  {prefsMsg.type === 'success'
                    ? <CheckCircle2 className="w-4 h-4" />
                    : <AlertCircle className="w-4 h-4" />}
                  {prefsMsg.text}
                </div>
              )}

              <div className="flex justify-end">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={savePrefs}
                  disabled={savingPrefs || !isConfigured}
                >
                  {savingPrefs ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
                  Save Preferences
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
