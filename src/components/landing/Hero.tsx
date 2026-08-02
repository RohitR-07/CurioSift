import { motion } from 'framer-motion';
import { UploadCloud, ArrowRight } from 'lucide-react';
import { Button } from '../ui/Button';
import { NavLink } from 'react-router-dom';

export default function Hero() {
  return (
    <section id="home" className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 inset-x-0 h-[800px] bg-gradient-to-b from-blue-50/50 to-transparent pointer-events-none" />
      <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-[800px] h-[800px] bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-[100px] opacity-70 pointer-events-none" />
      <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 w-[600px] h-[600px] bg-gradient-to-tr from-purple-400/20 to-pink-400/20 rounded-full blur-[100px] opacity-70 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-8 relative z-10 flex flex-col items-center text-center">
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-blue-100 text-blue-600 text-sm font-semibold tracking-wide mb-8 shadow-sm"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
          </span>
          StudyMate AI Module 2 is Live
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-5xl md:text-7xl font-extrabold text-text tracking-tight leading-[1.1] max-w-4xl"
        >
          Study Smarter with <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
            Artificial Intelligence
          </span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-6 text-lg md:text-xl text-text-secondary leading-relaxed max-w-2xl font-medium"
        >
          Upload PDFs, generate notes, ask questions and learn faster with AI. Your personal study companion for acing exams.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-10 flex flex-col sm:flex-row items-center gap-4"
        >
          <NavLink to="/signup">
            <Button size="lg" className="w-full sm:w-auto gap-2.5 font-bold shadow-xl shadow-primary/20 px-8">
              <UploadCloud className="w-5 h-5" />
              Upload PDF
            </Button>
          </NavLink>
          <NavLink to="/signup">
            <Button variant="outline" size="lg" className="w-full sm:w-auto gap-2 font-bold bg-white px-8">
              Get Started <ArrowRight className="w-4 h-4" />
            </Button>
          </NavLink>
        </motion.div>

        {/* Hero Illustration */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4, type: 'spring' }}
          className="mt-20 w-full max-w-5xl aspect-video rounded-[2rem] bg-white/50 backdrop-blur-xl border border-white shadow-2xl p-4 flex items-center justify-center relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-50/50 to-purple-50/50"></div>
          
          {/* Abstract App Mockup Illustration */}
          <div className="w-full h-full bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex relative z-10">
            {/* Sidebar Mock */}
            <div className="w-48 bg-gray-50 border-r border-gray-100 hidden md:block p-4 space-y-4">
              <div className="w-24 h-6 bg-gray-200 rounded-md animate-pulse"></div>
              <div className="space-y-2 mt-8">
                {[1,2,3,4].map(i => <div key={i} className="w-full h-8 bg-gray-200 rounded-md animate-pulse" style={{ animationDelay: `${i * 0.1}s` }}></div>)}
              </div>
            </div>
            {/* Content Mock */}
            <div className="flex-1 p-8 flex flex-col gap-6">
               <div className="w-48 h-8 bg-gray-200 rounded-lg animate-pulse"></div>
               <div className="w-full h-32 bg-blue-50 rounded-xl border border-blue-100 flex items-center justify-center relative overflow-hidden">
                 <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]"></div>
                 <UploadCloud className="w-8 h-8 text-blue-400" />
               </div>
               <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                 {[1,2,3,4].map(i => <div key={i} className="h-24 bg-gray-50 rounded-xl border border-gray-100 animate-pulse" style={{ animationDelay: `${i * 0.15}s` }}></div>)}
               </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
