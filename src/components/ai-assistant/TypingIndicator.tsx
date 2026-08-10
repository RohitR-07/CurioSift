import { motion } from 'framer-motion';

export function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 p-3 rounded-2xl bg-white border border-gray-100 shadow-sm w-fit">
      <motion.div
        className="w-1.5 h-1.5 bg-primary rounded-full"
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 0.6, repeat: Infinity, ease: 'easeInOut', delay: 0 }}
      />
      <motion.div
        className="w-1.5 h-1.5 bg-primary/80 rounded-full"
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 0.6, repeat: Infinity, ease: 'easeInOut', delay: 0.15 }}
      />
      <motion.div
        className="w-1.5 h-1.5 bg-primary/60 rounded-full"
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 0.6, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
      />
      <span className="text-xs font-medium text-text-secondary ml-1">
        AI Assistant is thinking...
      </span>
    </div>
  );
}
