import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UploadCloud, 
  FileText, 
  Lightbulb, 
  HelpCircle, 
  MessageSquare, 
  BrainCircuit, 
  GraduationCap, 
  BookOpen, 
  BarChart3,
  Clock,
  Play,
  Files,
  MoreVertical,
  CheckCircle2,
  FolderOpen,
  Edit2,
  Trash2,
  AlertCircle
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { SectionHeader } from '../components/ui/SectionHeader';
import { EmptyState } from '../components/ui/EmptyState';
import { StatCard } from '../components/ui/StatCard';
import { FeatureCard } from '../components/ui/FeatureCard';
import { cn } from '../utils/cn';
import { useToast } from '../context/ToastContext';

const features = [
  { name: 'AI Summary', icon: FileText, color: 'from-blue-500 to-cyan-500', shadow: 'shadow-blue-500/20', desc: 'Condense long PDFs into key points instantly.', badge: 'POPULAR' },
  { name: 'Explain Concepts', icon: Lightbulb, color: 'from-yellow-400 to-orange-500', shadow: 'shadow-orange-500/20', desc: 'Simplify complex topics into simple terms.' },
  { name: 'Question Gen.', icon: HelpCircle, color: 'from-green-500 to-emerald-600', shadow: 'shadow-emerald-500/20', desc: 'Generate potential exam questions on the fly.' },
  { name: 'AI Chat', icon: MessageSquare, color: 'from-purple-500 to-indigo-500', shadow: 'shadow-indigo-500/20', desc: 'Chat directly with your documents.', badge: 'NEW' },
  { name: 'Flashcards', icon: BrainCircuit, color: 'from-pink-500 to-rose-500', shadow: 'shadow-rose-500/20', desc: 'Auto-generate study flashcards.' },
  { name: 'Quiz Generator', icon: GraduationCap, color: 'from-violet-500 to-purple-600', shadow: 'shadow-violet-500/20', desc: 'Test your knowledge with interactive quizzes.', badge: 'BETA' },
  { name: 'Revision Notes', icon: BookOpen, color: 'from-orange-400 to-red-500', shadow: 'shadow-red-500/20', desc: 'Create structured revision notes automatically.' },
  { name: 'Analytics', icon: BarChart3, color: 'from-teal-400 to-emerald-500', shadow: 'shadow-teal-500/20', desc: 'Track your study progress and habits.' },
];

const stats = [
  { label: 'PDFs Uploaded', value: 12, suffix: '', icon: Files, color: 'text-blue-500', bg: 'bg-blue-50' },
  { label: 'AI Summaries', value: 36, suffix: '', icon: FileText, color: 'text-green-500', bg: 'bg-green-50' },
  { label: 'Questions Gen.', value: 142, suffix: '', icon: HelpCircle, color: 'text-purple-500', bg: 'bg-purple-50' },
  { label: 'Study Hours Saved', value: 54, suffix: '+', icon: Clock, color: 'text-orange-500', bg: 'bg-orange-50' },
];

const initialPdfs = [
  { id: 1, name: 'Machine Learning Basics.pdf', date: '2 hours ago', progress: 85, color: 'text-blue-500', bg: 'bg-blue-50' },
  { id: 2, name: 'Advanced Calculus Chapter 4.pdf', date: 'Yesterday', progress: 40, color: 'text-purple-500', bg: 'bg-purple-50' },
  { id: 3, name: 'History of Renaissance.pdf', date: '2 days ago', progress: 100, color: 'text-green-500', bg: 'bg-green-50' },
  { id: 4, name: 'Biology 101 - Cell Structure.pdf', date: '3 days ago', progress: 15, color: 'text-orange-500', bg: 'bg-orange-50' },
];

export default function Dashboard() {
  const [isDragging, setIsDragging] = useState(false);
  const [pdfs, setPdfs] = useState(initialPdfs);
  const { toast } = useToast();

  const handleDelete = (id: number) => {
    setPdfs(pdfs.filter(p => p.id !== id));
    toast('PDF deleted successfully', 'success');
  };

  const handleUploadClick = () => {
    toast('Upload functionality coming in Module 2', 'info');
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-12">
      
      {/* Premium Hero Section */}
      <section className="flex flex-col lg:flex-row items-center justify-between gap-12 pt-4">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="max-w-2xl space-y-6 flex-1"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-sm font-semibold tracking-wide mb-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            StudyMate AI v1.0
          </div>
          <h1 className="text-5xl sm:text-6xl font-extrabold text-text tracking-tight leading-[1.1]">
            Study Smarter. <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              Not Harder.
            </span>
          </h1>
          <p className="text-lg text-text-secondary leading-relaxed max-w-xl">
            Upload your PDFs and let AI summarize, explain concepts, generate exam questions, create quizzes, and help you study faster.
          </p>
          <div className="flex flex-wrap items-center gap-4 pt-4">
            <Button size="lg" className="font-bold shadow-blue-500/25" onClick={handleUploadClick}>
              <UploadCloud className="w-5 h-5" />
              Upload PDF
            </Button>
            <Button variant="secondary" size="lg" className="font-semibold bg-white border border-border shadow-sm hover:border-gray-300">
              <Play className="w-4 h-4 fill-current" />
              Watch Demo
            </Button>
          </div>
        </motion.div>

        {/* Hero SVG Illustration */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.6, type: 'spring' }}
          className="hidden lg:flex w-96 h-96 relative items-center justify-center shrink-0"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-100 to-purple-100 rounded-[3rem] rotate-3 scale-105 opacity-50 blur-3xl"></div>
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-50 to-purple-50 rounded-[3rem] border-2 border-white shadow-2xl overflow-hidden flex items-center justify-center">
             <div className="absolute top-0 right-0 w-32 h-32 bg-purple-200/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
             <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-200/50 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
             
             <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="relative z-10 drop-shadow-lg">
                <rect x="60" y="40" width="80" height="100" rx="8" fill="white" stroke="#E2E8F0" strokeWidth="4"/>
                <path d="M75 60H125M75 80H125M75 100H105" stroke="#CBD5E1" strokeWidth="4" strokeLinecap="round"/>
                <circle cx="140" cy="120" r="40" fill="url(#paint0_linear_1)" />
                <path d="M125 120C125 111.716 131.716 105 140 105C148.284 105 155 111.716 155 120C155 128.284 148.284 135 140 135C131.716 135 125 128.284 125 120ZM125 120H115M140 105V95M155 120H165M140 135V145" stroke="white" strokeWidth="3" strokeLinecap="round"/>
                <circle cx="140" cy="120" r="15" fill="white"/>
                <circle cx="140" cy="120" r="6" fill="url(#paint0_linear_1)"/>
                <path d="M40 80L45 95L60 100L45 105L40 120L35 105L20 100L35 95L40 80Z" fill="#FDE047"/>
                <path d="M160 50L163 60L173 63L163 66L160 76L157 66L147 63L157 60L160 50Z" fill="#A78BFA"/>
                <defs>
                  <linearGradient id="paint0_linear_1" x1="100" y1="80" x2="180" y2="160" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#3B82F6" />
                    <stop offset="1" stopColor="#9333EA" />
                  </linearGradient>
                </defs>
              </svg>
          </div>
        </motion.div>
      </section>

      {/* Redesigned Upload Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div 
          className={cn(
            "relative overflow-hidden border-2 border-dashed rounded-3xl p-14 transition-all duration-300 ease-in-out flex flex-col items-center justify-center gap-5 text-center group bg-white",
            isDragging ? 'border-primary bg-primary/[0.03] scale-[1.01] shadow-[0_0_40px_rgba(37,99,235,0.15)]' : 'border-border/80 hover:border-primary/40 hover:bg-gray-50/50 hover:shadow-lg hover:shadow-primary/5'
          )}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => { e.preventDefault(); setIsDragging(false); toast('Upload triggered!', 'success'); }}
        >
          <div className={cn(
            "w-24 h-24 rounded-full flex items-center justify-center transition-all duration-500 mb-2",
            isDragging ? "bg-primary/10 scale-110" : "bg-blue-50 group-hover:scale-110 group-hover:bg-blue-100/50"
          )}>
            <UploadCloud className={cn(
              "w-12 h-12 transition-colors",
              isDragging ? "text-primary" : "text-primary/70 group-hover:text-primary"
            )} />
          </div>
          
          <div className="space-y-1">
            <h3 className="text-2xl font-bold text-text tracking-tight">Drag & Drop your PDF here</h3>
            <p className="text-text-secondary text-base max-w-md mx-auto">
              Upload your study material and unlock AI-powered learning. Maximum file size is <span className="font-semibold text-text">20 MB</span>.
            </p>
          </div>

          <div className="flex items-center gap-3 mt-2">
            <Badge variant="success" className="px-3 py-1 bg-green-50">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> PDF
            </Badge>
            <span className="text-xs font-medium text-text-secondary">
              Coming soon: DOCX, PPT, TXT
            </span>
          </div>

          <div className="mt-4">
            <Button variant="outline" className="shadow-sm bg-white" onClick={handleUploadClick}>
              Browse Files
            </Button>
          </div>
        </div>
      </motion.section>

      {/* Premium Statistics using reusable StatCard */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6"
      >
        {stats.map((stat, i) => (
          <StatCard 
            key={i}
            label={stat.label}
            value={stat.value}
            suffix={stat.suffix}
            icon={stat.icon}
            colorClass={stat.color}
            bgClass={stat.bg}
          />
        ))}
      </motion.section>

      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Improved Feature Grid using reusable FeatureCard and SectionHeader */}
        <div className="lg:col-span-2 space-y-6">
          <SectionHeader title="Explore Features" />
          <div className="grid sm:grid-cols-2 gap-5">
            {features.map((feature, i) => (
              <motion.div
                key={feature.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i }}
                className="h-full"
              >
                <FeatureCard 
                  title={feature.name}
                  description={feature.desc}
                  icon={feature.icon}
                  gradientClass={feature.color}
                  shadowClass={feature.shadow}
                  badge={feature.badge}
                />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Right Sidebar (Recent + Quick Actions) */}
        <div className="space-y-8">
          
          {/* Enhanced Quick Actions */}
          <section className="space-y-4">
            <SectionHeader title="Quick Actions" />
            <div className="grid grid-cols-2 gap-3">
              {[
                { name: 'Upload PDF', icon: UploadCloud, color: 'text-blue-600', bg: 'bg-blue-50' },
                { name: 'Summarize', icon: FileText, color: 'text-green-600', bg: 'bg-green-50' },
                { name: 'Ask AI', icon: MessageSquare, color: 'text-purple-600', bg: 'bg-purple-50' },
                { name: 'Create Quiz', icon: GraduationCap, color: 'text-orange-600', bg: 'bg-orange-50' },
              ].map((action, i) => (
                <button 
                  key={i} 
                  className="flex flex-col items-center justify-center gap-3 p-5 rounded-2xl bg-white border border-border hover:border-primary hover:shadow-lg hover:shadow-primary/5 transition-all group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  onClick={() => toast(`Quick action: ${action.name}`, 'info')}
                >
                  <div className={cn("p-3 rounded-full transition-transform duration-300 group-hover:scale-110", action.bg, action.color)}>
                    <action.icon className="w-6 h-6" />
                  </div>
                  <span className="text-sm font-semibold text-text group-hover:text-primary transition-colors">{action.name}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Upgraded Recent PDFs */}
          <section className="space-y-4">
            <SectionHeader 
              title="Recent PDFs" 
              action={
                <button className="text-sm font-semibold text-primary hover:text-blue-700 hover:underline focus-visible:outline-none focus-visible:underline">
                  View All
                </button>
              } 
            />
            
            <div className="space-y-3">
              <AnimatePresence>
                {pdfs.length > 0 ? (
                  pdfs.map((pdf) => (
                    <motion.div 
                      key={pdf.id}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                      className="p-4 rounded-2xl bg-white border border-border hover:border-gray-300 shadow-sm hover:shadow-md transition-all group overflow-hidden"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 overflow-hidden flex-1">
                          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", pdf.bg, pdf.color)}>
                            <FileText className="w-5 h-5" />
                          </div>
                          <div className="overflow-hidden flex-1">
                            <p className="text-sm font-semibold text-text truncate group-hover:text-primary transition-colors cursor-pointer">{pdf.name}</p>
                            <p className="text-xs text-text-secondary mt-0.5">{pdf.date}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-1.5 text-text-secondary hover:text-primary rounded-md hover:bg-gray-100 focus-visible:opacity-100" title="Open">
                            <FolderOpen className="w-4 h-4" />
                          </button>
                          <button className="p-1.5 text-text-secondary hover:text-green-600 rounded-md hover:bg-gray-100 focus-visible:opacity-100" title="Rename">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(pdf.id)}
                            className="p-1.5 text-text-secondary hover:text-danger rounded-md hover:bg-red-50 focus-visible:opacity-100" 
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        
                        {/* More options fallback for mobile */}
                        <button className="lg:hidden p-1 text-text-secondary">
                          <MoreVertical className="w-5 h-5" />
                        </button>
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="mt-4 flex items-center gap-3">
                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary rounded-full transition-all duration-500"
                            style={{ width: `${pdf.progress}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-bold text-text-secondary w-8 text-right">
                          {pdf.progress}%
                        </span>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <EmptyState 
                    icon={AlertCircle}
                    title="No PDFs Uploaded Yet"
                    description="Upload your first study material and unlock AI-powered learning."
                    actionLabel="Upload PDF"
                    onAction={handleUploadClick}
                  />
                )}
              </AnimatePresence>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
