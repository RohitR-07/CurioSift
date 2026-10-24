// src/pages/AnalyticsPage.tsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BarChart3,
  LayoutDashboard,
  ChevronRight,
  GraduationCap,
  FileText,
  TrendingUp,
  Trophy,
  Target,
  RefreshCw,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useFiles } from '../context/FileContext';
import { useProcessing } from '../context/ProcessingContext';
import { useAuth } from '../context/AuthContext';
import { getAnalytics, type AnalyticsData } from '../services/dbApi';
import { cn } from '../utils/cn';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function scoreColor(score: number) {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-blue-600';
  if (score >= 40) return 'text-amber-600';
  return 'text-red-500';
}

function scoreBg(score: number) {
  if (score >= 80) return 'bg-green-500';
  if (score >= 60) return 'bg-blue-500';
  if (score >= 40) return 'bg-amber-400';
  return 'bg-red-400';
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
  label, value, sub, icon: Icon, gradient, delay = 0,
}: {
  label: string; value: string | number; sub?: string;
  icon: React.ElementType; gradient: string; delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <Card className="h-full">
        <CardContent className="pt-5 pb-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1">{label}</p>
              <p className="text-3xl font-extrabold text-text tracking-tight">{value}</p>
              {sub && <p className="text-xs text-text-secondary mt-0.5">{sub}</p>}
            </div>
            <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', gradient)}>
              <Icon className="w-5 h-5 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ─── Bar chart (pure CSS) ─────────────────────────────────────────────────────

function BarChart({ data }: { data: { label: string; count: number }[] }) {
  const max = Math.max(...data.map(d => d.count), 1);
  return (
    <div className="flex items-end gap-2 h-28 w-full">
      {data.map((d, i) => (
        <div key={i} className="flex flex-col items-center gap-1 flex-1">
          <span className="text-xs font-bold text-text-secondary">{d.count > 0 ? d.count : ''}</span>
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: `${Math.max((d.count / max) * 96, d.count > 0 ? 8 : 2)}px` }}
            transition={{ delay: i * 0.08, duration: 0.4, ease: 'easeOut' }}
            className={cn(
              'w-full rounded-t-lg',
              d.count > 0 ? 'bg-primary' : 'bg-gray-100'
            )}
          />
          <span className="text-[10px] text-text-secondary text-center leading-tight">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Score progress bar ───────────────────────────────────────────────────────

function ScoreBar({ label, score, count }: { label: string; score: number; count: number }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-text capitalize">{label}</span>
        <span className="text-text-secondary">{count} quiz{count !== 1 ? 'zes' : ''} · <span className={cn('font-bold', scoreColor(score))}>{score}% avg</span></span>
      </div>
      <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className={cn('h-full rounded-full', scoreBg(score))}
        />
      </div>
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptySection({ icon: Icon, title, desc, link, linkLabel }: {
  icon: React.ElementType; title: string; desc: string; link?: string; linkLabel?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-3 py-8 text-center">
      <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center">
        <Icon className="w-6 h-6 text-text-secondary" />
      </div>
      <div>
        <p className="font-semibold text-text text-sm">{title}</p>
        <p className="text-xs text-text-secondary mt-0.5">{desc}</p>
      </div>
      {link && linkLabel && (
        <Link to={link} className="text-xs text-primary font-semibold hover:underline">{linkLabel} →</Link>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const { files } = useFiles();
  const { records } = useProcessing();
  const { getAuthHeader, isConfigured } = useAuth();

  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    const data = await getAnalytics(getAuthHeader);
    if (data.error && data.totalAttempts === 0 && !isConfigured) {
      setError('Connect your Supabase account to track quiz history and analytics.');
    } else if (data.error) {
      setError(data.error);
    }
    setAnalytics(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, [isConfigured]);

  // Local file-based stats (always available from FileContext + ProcessingContext)
  const processedCount = Object.values(records).filter(r => r.status === 'processed').length;
  const difficultyEntries = analytics
    ? Object.entries(analytics.byDifficulty).sort((a, b) => b[1].count - a[1].count)
    : [];

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-7">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs text-text-secondary font-medium mb-1">
            <Link to="/dashboard" className="flex items-center gap-1 hover:text-primary transition-colors">
              <LayoutDashboard className="w-3.5 h-3.5" /> Dashboard
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-text">Analytics</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center shadow-md shadow-teal-500/25">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-text tracking-tight">Analytics</h1>
              <p className="text-sm text-text-secondary font-medium">Your study progress at a glance.</p>
            </div>
          </div>
        </div>
        <Button size="sm" variant="secondary" onClick={load} disabled={loading}>
          <RefreshCw className={cn('w-3.5 h-3.5 mr-1.5', loading && 'animate-spin')} />
          Refresh
        </Button>
      </div>

      {/* Error banner */}
      {error && (
        <div className="flex items-start gap-3 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-800">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading skeleton */}
      {loading && !analytics && (
        <div className="flex items-center justify-center py-20 gap-3 text-text-secondary">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm font-medium">Loading analytics…</span>
        </div>
      )}

      {/* ── Stats Grid ────────────────────────────────────────────── */}
      {analytics && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="PDFs Uploaded" value={files.length}
              sub={`${processedCount} processed`}
              icon={FileText} gradient="bg-gradient-to-br from-blue-500 to-cyan-500"
              delay={0}
            />
            <StatCard
              label="Quizzes Taken" value={analytics.totalAttempts}
              sub={analytics.totalAttempts === 0 ? 'Take a quiz to start tracking' : 'AI-graded quizzes'}
              icon={GraduationCap} gradient="bg-gradient-to-br from-purple-500 to-indigo-600"
              delay={0.05}
            />
            <StatCard
              label="Average Score"
              value={analytics.totalAttempts > 0 ? `${analytics.avgScore}%` : '—'}
              sub={analytics.totalAttempts > 0 ? 'across all quizzes' : 'No quiz data yet'}
              icon={Target} gradient="bg-gradient-to-br from-orange-400 to-red-500"
              delay={0.1}
            />
            <StatCard
              label="Best Score"
              value={analytics.totalAttempts > 0 ? `${analytics.bestScore}%` : '—'}
              sub={analytics.totalAttempts > 0 ? 'personal best' : 'No quiz data yet'}
              icon={Trophy} gradient="bg-gradient-to-br from-amber-400 to-yellow-500"
              delay={0.15}
            />
          </div>

          {/* ── Charts Row ───────────────────────────────────────────── */}
          <div className="grid lg:grid-cols-2 gap-6">

            {/* Score Distribution */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    <CardTitle className="text-sm">Score Distribution</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-1">
                  {analytics.scoreDistribution.length > 0 && analytics.totalAttempts > 0 ? (
                    <BarChart data={analytics.scoreDistribution} />
                  ) : (
                    <EmptySection
                      icon={GraduationCap}
                      title="No quiz data yet"
                      desc="Complete quizzes to see your score distribution."
                      link="/quiz"
                      linkLabel="Take a Quiz"
                    />
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* By Difficulty */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-primary" />
                    <CardTitle className="text-sm">Performance by Difficulty</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-2 space-y-3">
                  {difficultyEntries.length > 0 ? (
                    difficultyEntries.map(([diff, stat]) => (
                      <ScoreBar key={diff} label={diff} score={stat.avgScore} count={stat.count} />
                    ))
                  ) : (
                    <EmptySection
                      icon={Target}
                      title="No difficulty data"
                      desc="Quiz attempts will appear here once you play."
                    />
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* ── Bottom Row ───────────────────────────────────────────── */}
          <div className="grid lg:grid-cols-2 gap-6">

            {/* Recent Quiz Attempts */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-primary" />
                    <CardTitle className="text-sm">Recent Quiz Attempts</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-1 space-y-2">
                  {analytics.recentAttempts.length > 0 ? (
                    analytics.recentAttempts.slice(0, 8).map((a: any, i: number) => (
                      <div key={i} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                        <div className={cn(
                          'w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-extrabold shrink-0',
                          scoreBg(a.score_percent)
                        )}>
                          {a.score_percent}%
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-text truncate">
                            {a.document_name || 'Quiz'}
                          </p>
                          <p className="text-xs text-text-secondary">
                            {a.difficulty} · {a.question_type} · {a.correct_answers}/{a.total_questions} correct
                          </p>
                        </div>
                        <span className="text-xs text-text-secondary shrink-0">{formatDate(a.completed_at)}</span>
                      </div>
                    ))
                  ) : (
                    <EmptySection
                      icon={GraduationCap}
                      title="No attempts yet"
                      desc="Complete a quiz to see your history here."
                      link="/quiz"
                      linkLabel="Take a Quiz"
                    />
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Right column: Top Documents */}
            <div className="space-y-6">

              {/* Top Documents */}
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-primary" />
                      <CardTitle className="text-sm">Most Quizzed Documents</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-1 space-y-2">
                    {analytics.byDocument.length > 0 ? (
                      analytics.byDocument.map((doc, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <span className="text-xs font-bold text-text-secondary w-4 text-right shrink-0">{i + 1}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-text truncate">{doc.name}</p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-xs text-text-secondary">{doc.count}×</span>
                            <span className={cn('text-xs font-bold', scoreColor(doc.avgScore))}>{doc.avgScore}%</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <EmptySection
                        icon={FileText}
                        title="No document data"
                        desc="Quiz results will be grouped by document."
                      />
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
