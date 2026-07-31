import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';

const testimonials = [
  {
    name: 'Sarah Jenkins',
    college: 'Stanford University',
    avatar: 'SJ',
    color: 'from-pink-500 to-rose-500',
    review: 'StudyMate AI completely changed how I prep for finals. The AI summaries condense 100-page readings into 5 pages of pure gold.',
    rating: 5
  },
  {
    name: 'Michael Chen',
    college: 'MIT',
    avatar: 'MC',
    color: 'from-blue-500 to-cyan-500',
    review: 'The question generator is mind-blowing. It literally predicted three of my short-answer questions on the Biology midterm.',
    rating: 5
  },
  {
    name: 'Emily Rodriguez',
    college: 'UC Berkeley',
    avatar: 'ER',
    color: 'from-purple-500 to-indigo-500',
    review: 'I used to spend hours making flashcards. Now I just drop my lecture slides in, and StudyMate does it for me instantly.',
    rating: 5
  }
];

export default function Testimonials() {
  return (
    <section className="py-24 bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-sm font-bold tracking-widest text-primary uppercase mb-3">Wall of Love</h2>
          <h3 className="text-3xl md:text-5xl font-extrabold text-text tracking-tight mb-6">
            Loved by students worldwide.
          </h3>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: i * 0.15, duration: 0.5 }}
            >
              <Card hoverable className="h-full group">
                <CardContent className="p-8 flex flex-col h-full gap-6">
                  <div className="flex gap-1">
                    {[...Array(t.rating)].map((_, idx) => (
                      <Star key={idx} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  
                  <p className="flex-1 text-text font-medium leading-relaxed">
                    "{t.review}"
                  </p>
                  
                  <div className="flex items-center gap-4 pt-4 border-t border-border">
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-tr ${t.color} flex items-center justify-center text-white font-bold shadow-md`}>
                      {t.avatar}
                    </div>
                    <div>
                      <h4 className="font-bold text-text">{t.name}</h4>
                      <p className="text-sm text-text-secondary">{t.college}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
