import { motion } from 'framer-motion';
import { UploadCloud, ArrowRight, BrainCircuit, Sparkles, GraduationCap, BookOpen, MessageSquare, CheckCircle2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { NavLink } from 'react-router-dom';

export default function Hero() {
  return (
    <section id="home" className="relative pt-32 pb-20 md:pt-44 md:pb-28 overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-0 inset-x-0 h-[650px] bg-gradient-to-b from-blue-50/60 to-transparent pointer-events-none" />
      <div className="absolute top-10 right-1/4 w-[500px] h-[500px] bg-gradient-to-br from-blue-400/15 via-purple-400/15 to-transparent rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-20 left-10 w-[450px] h-[450px] bg-gradient-to-tr from-cyan-400/15 to-blue-400/10 rounded-full blur-[90px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-8 relative z-10 flex flex-col items-center text-center">
        
        {/* Floating Tag */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 border border-blue-200/60 text-blue-700 text-xs sm:text-sm font-semibold tracking-wide mb-6 shadow-xs backdrop-blur-sm"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
          </span>
          <span>Next-Gen AI Study Assistant</span>
          <span className="text-blue-300">•</span>
          <span className="text-text-secondary font-medium">CurioSift v1.0</span>
        </motion.div>

        {/* Main Headline */}
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.08 }}
          className="text-4xl sm:text-6xl md:text-7xl font-black text-text tracking-tight leading-[1.12] max-w-4xl"
        >
          Turn dense textbooks into <br className="hidden sm:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
            instant study guides.
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.16 }}
          className="mt-6 text-lg sm:text-xl md:text-2xl text-text-secondary leading-relaxed max-w-2xl font-medium"
        >
          Upload PDFs, generate interactive quizzes, smart flashcards, and exam revision notes with AI in seconds.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.24 }}
          className="mt-8 flex flex-col sm:flex-row items-center gap-3.5 w-full sm:w-auto"
        >
          <NavLink to="/signup" className="w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto gap-2.5 font-bold shadow-xl shadow-primary/25 px-8">
              <UploadCloud className="w-5 h-5" />
              <span>Get Started Free</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </NavLink>
          <NavLink to="/login" className="w-full sm:w-auto">
            <Button variant="outline" size="lg" className="w-full sm:w-auto gap-2 font-bold px-7">
              <span>Sign In</span>
            </Button>
          </NavLink>
        </motion.div>

        {/* High-Fidelity Interactive SaaS Product Preview */}
        <motion.div 
          initial={{ opacity: 0, y: 36 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.32, type: 'spring' }}
          className="mt-14 w-full max-w-5xl rounded-3xl bg-white/70 backdrop-blur-xl border border-border/80 shadow-2xl p-3 sm:p-5 relative overflow-hidden"
        >
          <div className="rounded-2xl border border-border/80 bg-background overflow-hidden flex flex-col md:flex-row h-[360px] sm:h-[420px] text-left">
            {/* Mock Sidebar */}
            <div className="w-60 bg-white border-r border-border p-4 hidden md:flex flex-col justify-between shrink-0">
              <div className="space-y-4">
                <div className="flex items-center gap-2.5 px-2">
                  <img src="/curiosift-mark.png" alt="CurioSift" className="w-6 h-6 object-contain" />
                  <span className="font-extrabold text-sm text-text">Curio<span className="text-primary">Sift</span></span>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-primary/10 text-primary text-xs font-bold">
                    <Sparkles className="w-4 h-4" /> Dashboard
                  </div>
                  <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-text-secondary text-xs font-medium hover:bg-gray-50">
                    <MessageSquare className="w-4 h-4" /> AI Chat
                  </div>
                  <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-text-secondary text-xs font-medium hover:bg-gray-50">
                    <GraduationCap className="w-4 h-4" /> Quiz Generator
                  </div>
                  <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-text-secondary text-xs font-medium hover:bg-gray-50">
                    <BrainCircuit className="w-4 h-4" /> Flashcards
                  </div>
                  <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-text-secondary text-xs font-medium hover:bg-gray-50">
                    <BookOpen className="w-4 h-4" /> Revision Notes
                  </div>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-gray-50 border border-border text-[11px] space-y-1">
                <p className="font-bold text-text">Pro Tier Ready</p>
                <p className="text-text-secondary">Unlimited AI processing</p>
              </div>
            </div>

            {/* Mock Main Workspace */}
            <div className="flex-1 p-5 sm:p-7 flex flex-col justify-between overflow-hidden bg-gradient-to-b from-transparent to-blue-50/20">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold inline-flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> AI Document Processed
                    </span>
                    <span className="text-xs text-text-secondary">Biology_101_Cellular_Respiration.pdf</span>
                  </div>
                  <span className="text-xs font-bold text-primary">Gemini 3.1 Flash-Lite</span>
                </div>

                {/* Mock Generated Note Card */}
                <div className="p-4 rounded-2xl bg-white border border-border shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-extrabold text-text text-sm sm:text-base">Krebs Cycle & ATP Synthesis Overview</h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700">Exam Note</span>
                  </div>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    Glycolysis yields 2 pyruvate molecules yielding net 2 ATP and 2 NADH. Pyruvate decarboxylation enters the mitochondrial matrix for the citric acid cycle producing FADH2 and ATP.
                  </p>
                </div>

                {/* Mock Flashcard Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl bg-white border border-border shadow-xs space-y-1">
                    <span className="text-[10px] font-bold text-purple-600 uppercase">Flashcard #1</span>
                    <p className="text-xs font-bold text-text truncate">What is the net ATP yield of glycolysis?</p>
                    <p className="text-[11px] text-text-secondary">Click to reveal answer</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white border border-border shadow-xs space-y-1">
                    <span className="text-[10px] font-bold text-blue-600 uppercase">Quiz Question</span>
                    <p className="text-xs font-bold text-text truncate">Where does oxidative phosphorylation occur?</p>
                    <p className="text-[11px] text-emerald-600 font-semibold">Inner mitochondrial membrane</p>
                  </div>
                </div>
              </div>

              {/* Bottom bar */}
              <div className="flex items-center justify-between pt-3 border-t border-border/80 text-xs text-text-secondary">
                <span>⚡ Instant generation from 150-page slides</span>
                <span className="font-semibold text-text">Accuracy: 99.4% strictly grounded</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
