import { Sparkles, User } from 'lucide-react';
import { cn } from '../../utils/cn';
import type { ChatMessage as ChatMessageType } from '../../types/chat';

interface ChatMessageProps {
  message: ChatMessageType;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isAI = message.role === 'assistant';

  return (
    <div
      className={cn(
        'flex gap-4 w-full max-w-4xl',
        isAI ? 'self-start' : 'self-end flex-row-reverse'
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          'w-8 h-8 rounded-full flex items-center justify-center shrink-0 border',
          isAI
            ? 'bg-primary/10 border-primary/20 text-primary'
            : 'bg-gray-100 border-gray-200 text-gray-500'
        )}
      >
        {isAI ? <Sparkles className="w-4 h-4" /> : <User className="w-4 h-4" />}
      </div>

      {/* Bubble */}
      <div className={cn('flex flex-col', isAI ? 'items-start' : 'items-end')}>
        <p className="text-[11px] font-bold uppercase tracking-wider text-text-secondary mb-1 px-1">
          {isAI ? 'AI Assistant' : 'You'}
        </p>
        <div
          className={cn(
            'px-5 py-3.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap shadow-sm',
            isAI
              ? 'bg-white border border-gray-100 text-text rounded-tl-sm'
              : 'bg-primary text-white rounded-tr-sm'
          )}
        >
          {message.content}
        </div>
      </div>
    </div>
  );
}
