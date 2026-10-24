import { motion } from 'framer-motion';
import { FileText, Lightbulb, HelpCircle, MessageSquare } from 'lucide-react';
import { FeatureCard } from '../ui/FeatureCard';

const features = [
  { 
    title: 'AI PDF Summary', 
    icon: FileText, 
    color: 'from-blue-500 to-cyan-500', 
    shadow: 'shadow-blue-500/20', 
    desc: 'Instantly condense hundreds of pages into bite-sized, digestible summaries.' 
  },
  { 
    title: 'AI Explain', 
    icon: Lightbulb, 
    color: 'from-yellow-400 to-orange-500', 
    shadow: 'shadow-orange-500/20', 
    desc: 'Highlight any complex topic and let AI break it down into simple terms.' 
  },
  { 
    title: 'Question Generator', 
    icon: HelpCircle, 
    color: 'from-green-500 to-emerald-600', 
    shadow: 'shadow-emerald-500/20', 
    desc: 'Automatically generate potential exam questions based on your material.' 
  },
  { 
    title: 'AI Chat', 
    icon: MessageSquare, 
    color: 'from-purple-500 to-indigo-500', 
    shadow: 'shadow-indigo-500/20', 
    desc: 'Have a conversation with your documents. Ask anything and get instant answers.' 
  },
];

export default function Features() {
  return (
    <section id="features" className="py-24 bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-sm font-bold tracking-widest text-primary uppercase mb-3">Core Features</h2>
          <h3 className="text-3xl md:text-5xl font-extrabold text-text tracking-tight mb-6">
            Everything you need to master your subjects.
          </h3>
          <p className="text-lg text-text-secondary">
            CurioSift brings the power of advanced language models directly to your course materials.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
            >
              <FeatureCard 
                title={feature.title}
                description={feature.desc}
                icon={feature.icon}
                gradientClass={feature.color}
                shadowClass={feature.shadow}
              />
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
