import { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import { cn } from '../../utils/cn';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    
    ta.style.height = 'auto';
    ta.style.height = `${Math.min(ta.scrollHeight, 150)}px`;
  }, [input]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || disabled) return;
    
    onSend(trimmed);
    setInput('');
    
    // Reset height explicitly
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="relative flex items-end gap-2 bg-white rounded-2xl border border-gray-200 p-2 shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      <textarea
        ref={textareaRef}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder="Ask something about your study material..."
        className="flex-1 max-h-[150px] min-h-[44px] bg-transparent resize-none py-2.5 px-3 text-sm text-text placeholder:text-gray-400 focus:outline-none disabled:opacity-50"
        rows={1}
      />
      
      <button
        onClick={handleSend}
        disabled={!input.trim() || disabled}
        className={cn(
          'w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all',
          input.trim() && !disabled
            ? 'bg-primary text-white hover:bg-primary-hover shadow-sm'
            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
        )}
        aria-label="Send message"
      >
        <Send className="w-4 h-4" />
      </button>
    </div>
  );
}
