// src/components/flashcards/FlashcardControls.tsx
import { Button } from '../ui/Button';
import { ChevronLeft, ChevronRight, RefreshCw, Shuffle, CheckCircle2, XCircle, RotateCcw } from 'lucide-react';

interface FlashcardControlsProps {
  index: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
  onShuffle: () => void;
  onRestart: () => void;
  onRegenerate: () => void;
  known: boolean;
  onMarkKnown: (known: boolean) => void;
}

export default function FlashcardControls({
  index,
  total,
  onPrev,
  onNext,
  onShuffle,
  onRestart,
  onRegenerate,
  known,
  onMarkKnown,
}: FlashcardControlsProps) {
  return (
    <div className="flex flex-col items-center gap-3">
      {/* Navigation */}
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={onPrev} disabled={index === 0}>
          <ChevronLeft className="w-4 h-4" /> Prev
        </Button>
        <span className="text-sm text-text-secondary">
          {index + 1} / {total}
        </span>
        <Button variant="outline" size="sm" onClick={onNext} disabled={index === total - 1}>
          Next <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button variant={known ? 'primary' : 'outline'} size="sm" onClick={() => onMarkKnown(!known)}>
          {known ? <CheckCircle2 className="w-4 h-4 mr-1" /> : <XCircle className="w-4 h-4 mr-1" />}
          {known ? 'Known' : 'Needs Review'}
        </Button>
        <Button variant="secondary" size="sm" onClick={onShuffle}>
          <Shuffle className="w-4 h-4 mr-1" /> Shuffle
        </Button>
        <Button variant="secondary" size="sm" onClick={onRestart}>
          <RotateCcw className="w-4 h-4 mr-1" /> Restart
        </Button>
        <Button variant="primary" size="sm" onClick={onRegenerate}>
          <RefreshCw className="w-4 h-4 mr-1" /> Regenerate
        </Button>
      </div>
    </div>
  );
}
