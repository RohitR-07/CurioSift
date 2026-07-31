import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../utils/cn';

const faqs = [
  {
    question: 'Can I upload multiple PDFs?',
    answer: 'Yes! You can upload multiple PDFs and organize them into different folders or subjects in your dashboard.'
  },
  {
    question: 'Is StudyMate AI free?',
    answer: 'We offer a generous free tier that includes 5 PDF uploads and 50 AI queries per month. For heavy users, we have a Pro plan with unlimited access.'
  },
  {
    question: 'Which files are supported?',
    answer: 'Currently we support PDF documents up to 20MB in size. We are actively working on adding support for DOCX, PPT, and TXT files.'
  },
  {
    question: 'Does AI answer my questions accurately?',
    answer: 'StudyMate AI is explicitly instructed to search only within the context of the documents you upload, minimizing hallucinations and ensuring high accuracy.'
  }
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="py-24 bg-white">
      <div className="max-w-3xl mx-auto px-6 md:px-8">
        
        <div className="text-center mb-16">
          <h3 className="text-3xl md:text-5xl font-extrabold text-text tracking-tight mb-6">
            Frequently Asked Questions
          </h3>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, i) => {
            const isOpen = openIndex === i;
            
            return (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={cn(
                  "border rounded-2xl overflow-hidden transition-colors duration-300",
                  isOpen ? "border-primary/50 bg-primary/[0.02]" : "border-border bg-white hover:border-gray-300"
                )}
              >
                <button
                  className="w-full px-6 py-5 flex items-center justify-between focus-visible:outline-none focus-visible:bg-gray-50"
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                >
                  <span className="font-bold text-text text-left text-lg">{faq.question}</span>
                  <ChevronDown className={cn(
                    "w-5 h-5 text-text-secondary transition-transform duration-300 shrink-0",
                    isOpen && "rotate-180 text-primary"
                  )} />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <div className="px-6 pb-5 text-text-secondary font-medium leading-relaxed">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
