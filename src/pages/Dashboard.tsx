import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  UploadCloud, 
  MessageSquare, 
  BrainCircuit, 
  GraduationCap, 
  BookOpen, 
  Clock,
  Files,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { SectionHeader } from '../components/ui/SectionHeader';
import { StatCard } from '../components/ui/StatCard';
import { UploadArea } from '../components/dashboard/UploadArea';
import { cn } from '../utils/cn';
import { useToast } from '../context/ToastContext';

import { FileManager } from '../components/dashboard/FileManager';
import { FileViewerModal } from '../components/dashboard/FileViewerModal';
import { useFiles, FileRecord } from '../context/FileContext';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getQuizStats } from '../services/dbApi';

export default function Dashboard() {
  const [viewingFile, setViewingFile] = useState<FileRecord | null>(null);
  const { toast } = useToast();
  const { files } = useFiles();
  const navigate = useNavigate();
  const { displayName, getAuthHeader, isConfigured } = useAuth();

  const [quizStats, setQuizStats] = useState<{ totalAttempts: number; avgScore: number } | null>(null);

  useEffect(() => {
    if (!isConfigured) return;
    getQuizStats(getAuthHeader).then((s) => {
      if (!s.error) setQuizStats(s);
    });
  }, [isConfigured, getAuthHeader]);

  const handleUploadClick = () => {
    document.getElementById('upload-area-section')?.scrollIntoView({ behavior: 'smooth' });
  };
  const handleNavigate = (direction: 'prev' | 'next') => {
    if (!viewingFile) return;
    const currentIndex = files.findIndex(f => f.id === viewingFile.id);
    if (direction === 'prev' && currentIndex > 0) {
      setViewingFile(files[currentIndex - 1]);
    } else if (direction === 'next' && currentIndex < files.length - 1) {
      setViewingFile(files[currentIndex + 1]);
    }
  };

  const viewingIndex = viewingFile ? files.findIndex(f => f.id === viewingFile.id) : -1;
  const hasPrev = viewingIndex > 0;
  const hasNext = viewingIndex >= 0 && viewingIndex < files.length - 1;

  // Quick Actions — each one navigates to its real, working page
  const quickActions = [
    { 
      name: 'Upload PDF', 
      desc: 'Add study files',
      icon: UploadCloud, 
      gradient: 'from-blue-500 to-cyan-500', 
      shadow: 'shadow-blue-500/25', 
      action: () => handleUploadClick() 
    },
    { 
      name: 'AI Chat', 
      desc: 'Ask your docs',
      icon: MessageSquare, 
      gradient: 'from-purple-500 to-indigo-500', 
      shadow: 'shadow-indigo-500/25', 
      action: () => navigate('/chat') 
    },
    { 
      name: 'Generate Quiz', 
      desc: 'Test knowledge',
      icon: GraduationCap, 
      gradient: 'from-violet-500 to-purple-600', 
      shadow: 'shadow-violet-500/25', 
      action: () => navigate('/quiz') 
    },
    { 
      name: 'Flashcards', 
      desc: 'Spaced repetition',
      icon: BrainCircuit, 
      gradient: 'from-pink-500 to-rose-500', 
      shadow: 'shadow-rose-500/25', 
      action: () => navigate('/flashcards') 
    },
    { 
      name: 'Revision Notes', 
      desc: 'Instant summaries',
      icon: BookOpen, 
      gradient: 'from-amber-500 to-orange-500', 
      shadow: 'shadow-orange-500/25', 
      action: () => navigate('/notes') 
    },
  ];

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-10">
      
      {/* Welcome Bar */}
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-text tracking-tight">
            Welcome back, {displayName} 👋
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary font-medium">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/[0.06] border border-primary/15 text-primary text-xs font-semibold self-start sm:self-auto">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          <span>CurioSift AI Study Suite</span>
        </div>
      </section>

      {/* Premium Hero Card */}
      <section className="relative overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-br from-white via-white to-blue-50/40 p-8 sm:p-12 shadow-sm">
        {/* Ambient background glow circles */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-blue-400/10 via-purple-400/10 to-transparent rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-gradient-to-tr from-cyan-400/10 to-transparent rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/60 text-blue-700 text-xs font-bold tracking-wide">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
              </span>
              CurioSift AI v1.0
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-text tracking-tight leading-[1.15]">
              Turn dense textbooks into <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
                instant study guides.
              </span>
            </h2>

            <p className="text-base sm:text-lg text-text-secondary leading-relaxed max-w-xl font-medium">
              Upload your lecture slides or textbooks and let AI create quizzes, flashcards, revision notes, and chat answers in seconds.
            </p>

            <div className="pt-2">
              <Button size="lg" className="shadow-lg shadow-primary/20 gap-2 font-bold" onClick={handleUploadClick}>
                <UploadCloud className="w-5 h-5" />
                <span>Upload PDF Document</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Quick Stats Pill Panel */}
          <div className="grid grid-cols-2 gap-3 shrink-0 lg:w-80">
            <div className="p-4 rounded-2xl bg-white/80 border border-border/80 backdrop-blur-sm shadow-xs space-y-1">
              <p className="text-xs font-bold uppercase tracking-wider text-text-secondary">Study Files</p>
              <p className="text-2xl font-black text-text">{files.length}</p>
              <p className="text-[11px] text-text-secondary">Ready in library</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/80 border border-border/80 backdrop-blur-sm shadow-xs space-y-1">
              <p className="text-xs font-bold uppercase tracking-wider text-text-secondary">Quizzes</p>
              <p className="text-2xl font-black text-primary">{quizStats?.totalAttempts ?? 0}</p>
              <p className="text-[11px] text-text-secondary">Completed</p>
            </div>
            <div className="col-span-2 p-4 rounded-2xl bg-white/80 border border-border/80 backdrop-blur-sm shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-text-secondary">Average Score</p>
                <p className="text-xl font-black text-emerald-600">{quizStats?.avgScore ?? 0}%</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm">
                ✓
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Redesigned Upload Dropzone Section */}
      <div id="upload-area-section" className="scroll-mt-24">
        <UploadArea onUpload={(files) => toast(`Selected ${files?.length} files for upload`, 'success')} />
      </div>

      {/* Statistics Cards */}
      <motion.section 
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6"
      >
        <StatCard label="Files Uploaded" value={files.length} suffix="" icon={Files} colorClass="text-blue-500" bgClass="bg-blue-50" />
        <StatCard label="Quizzes Completed" value={quizStats?.totalAttempts ?? 0} suffix="" icon={GraduationCap} colorClass="text-purple-500" bgClass="bg-purple-50" />
        <StatCard label="Avg Quiz Score" value={quizStats?.avgScore ?? 0} suffix="%" icon={Clock} colorClass="text-orange-500" bgClass="bg-orange-50" />
      </motion.section>

      {/* Quick Actions — modern SaaS grid */}
      <section className="space-y-4">
        <SectionHeader title="Quick Actions" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
          {quickActions.map((action, i) => (
            <motion.button
              key={action.name}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.04 * i }}
              onClick={action.action}
              className="relative overflow-hidden flex flex-col items-center justify-center gap-3 p-5 rounded-2xl bg-card border border-border/70 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary text-center"
            >
              <div className={cn(
                "w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br transition-transform duration-300 group-hover:scale-110",
                action.gradient, action.shadow,
              )}>
                <action.icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>
              <div className="space-y-0.5">
                <span className="text-sm font-bold text-text group-hover:text-primary transition-colors block leading-snug">
                  {action.name}
                </span>
                <span className="text-[11px] text-text-secondary font-medium block">
                  {action.desc}
                </span>
              </div>
            </motion.button>
          ))}
        </div>
      </section>

      {/* File Management Center (Full Width) */}
      <section className="pt-6 border-t border-border/80">
        <div className="flex items-center justify-between mb-5">
          <SectionHeader title="File Management Center" />
        </div>
        <FileManager />
      </section>

      {/* Fullscreen File Viewer */}
      <FileViewerModal 
        file={viewingFile}
        onClose={() => setViewingFile(null)}
        onNavigate={handleNavigate}
        hasNext={hasNext}
        hasPrev={hasPrev}
      />
    </div>
  );
}
