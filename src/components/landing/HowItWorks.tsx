import { motion } from 'framer-motion';
import { UploadCloud, Cpu, FileOutput, GraduationCap } from 'lucide-react';
import { cn } from '../../utils/cn';

const steps = [
  { 
    title: 'Upload PDF', 
    icon: UploadCloud, 
    desc: 'Simply drag and drop your course materials, lecture slides, or textbook chapters.',
    color: 'text-blue-500',
    bg: 'bg-blue-50'
  },
  { 
    title: 'AI Processing', 
    icon: Cpu, 
    desc: 'Our advanced models analyze the text, extract key concepts, and structure the data.',
    color: 'text-purple-500',
    bg: 'bg-purple-50'
  },
  { 
    title: 'Generate Notes', 
    icon: FileOutput, 
    desc: 'Instantly receive beautiful summaries, flashcards, and potential exam questions.',
    color: 'text-green-500',
    bg: 'bg-green-50'
  },
  { 
    title: 'Study Smarter', 
    icon: GraduationCap, 
    desc: 'Save hours of manual note-taking and focus entirely on mastering the material.',
    color: 'text-orange-500',
    bg: 'bg-orange-50'
  }
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-sm font-bold tracking-widest text-primary uppercase mb-3">Workflow</h2>
          <h3 className="text-3xl md:text-5xl font-extrabold text-text tracking-tight mb-6">
            Four steps to better grades.
          </h3>
        </div>

        <div className="relative">
          {/* Connecting Line (Desktop) */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gray-100 -translate-y-1/2 z-0" />

          <div className="grid lg:grid-cols-4 gap-12 lg:gap-8 relative z-10">
            {steps.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ delay: i * 0.2, duration: 0.5 }}
                className="flex flex-col items-center text-center"
              >
                <div className={cn(
                  "w-20 h-20 rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-gray-200/50 bg-white border border-gray-100 relative group transition-transform duration-300 hover:-translate-y-2"
                )}>
                  <div className={cn("absolute inset-0 rounded-2xl opacity-50 blur-lg transition-opacity duration-300 group-hover:opacity-100", step.bg)} />
                  <div className={cn("relative z-10 w-16 h-16 rounded-xl flex items-center justify-center", step.bg)}>
                    <step.icon className={cn("w-8 h-8", step.color)} />
                  </div>
                  
                  {/* Arrow for Desktop */}
                  {i < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-1/2 -right-8 w-8 h-0.5 bg-gradient-to-r from-gray-200 to-transparent -translate-y-1/2" />
                  )}
                </div>
                
                <h4 className="text-xl font-bold text-text mb-3">{step.title}</h4>
                <p className="text-sm font-medium text-text-secondary leading-relaxed">
                  {step.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
