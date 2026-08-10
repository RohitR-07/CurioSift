import { Sparkles, MessageSquarePlus } from 'lucide-react';
import type { FileRecord } from '../../context/FileContext';

interface ChatEmptyStateProps {
  selectedFile: FileRecord;
  onSelectSuggestion: (question: string) => void;
}

const SUGGESTIONS = [
  'Summarize this chapter',
  'Explain the main concept',
  'Give me important questions',
  'Create a practice quiz',
  'What are the key takeaways?',
];

export function ChatEmptyState({ selectedFile, onSelectSuggestion }: ChatEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full max-w-2xl mx-auto px-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-100 to-purple-100 border border-blue-200 flex items-center justify-center mb-6 shadow-inner">
        <Sparkles className="w-8 h-8 text-primary" />
      </div>
      
      <h2 className="text-2xl font-extrabold text-text mb-3">
        How can I help you study?
      </h2>
      
      <p className="text-text-secondary leading-relaxed mb-8">
        Ask me anything about <span className="font-semibold text-text">{selectedFile.name}</span>. 
        I can explain concepts, generate summaries, or test your knowledge.
      </p>

      <div className="w-full">
        <p className="text-[11px] font-bold uppercase tracking-widest text-text-secondary mb-4">
          Try asking
        </p>
        <div className="flex flex-wrap justify-center gap-2.5">
          {SUGGESTIONS.map((suggestion, i) => (
            <button
              key={i}
              onClick={() => onSelectSuggestion(suggestion)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-text-secondary hover:border-primary/40 hover:bg-primary/5 hover:text-primary transition-all shadow-sm"
            >
              <MessageSquarePlus className="w-4 h-4 opacity-70" />
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
