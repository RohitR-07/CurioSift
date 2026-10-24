
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';

interface FlashcardViewerProps {
  card: {
    front: string;
    back: string;
    explanation?: string;
  };
  onFlip?: () => void;
}

export default function FlashcardViewer({ card, onFlip }: FlashcardViewerProps) {
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    setFlipped(false);
  }, [card]);

  const handleFlip = () => {
    setFlipped((prev) => !prev);
    onFlip?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleFlip();
    }
  };

  return (
    <Card
      className="relative cursor-pointer select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2"
      onClick={handleFlip}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={flipped ? 'Showing answer. Click to show question.' : 'Showing question. Click to show answer.'}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-base">
          {flipped ? 'Answer' : 'Question'}
        </CardTitle>
      </CardHeader>

      <CardContent className="pt-0">
        <div
          className="relative w-full h-[320px] sm:h-[360px]"
          style={{ perspective: '800px' }}
        >
          <motion.div
            className="relative w-full h-full"
            animate={{ rotateY: flipped ? 180 : 0 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            style={{ transformStyle: 'preserve-3d' }}
          >
            {/* Front side */}
            <div
              className="absolute inset-0 flex items-center justify-center p-4 sm:p-6 overflow-y-auto overflow-x-hidden"
              style={{ backfaceVisibility: 'hidden' }}
            >
              <p className="w-full whitespace-pre-wrap break-words text-base sm:text-lg font-medium text-text text-center">
                {card.front}
              </p>
            </div>

            {/* Back side */}
            <div
              className="absolute inset-0 flex flex-col items-center justify-center p-4 sm:p-6 overflow-y-auto overflow-x-hidden"
              style={{
                backfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)',
              }}
            >
              <p className="w-full whitespace-pre-wrap break-words text-base sm:text-lg font-medium text-emerald-600 text-center">
                {card.back}
              </p>

              {card.explanation && (
                <p className="w-full whitespace-pre-wrap break-words text-sm text-text-secondary text-center mt-3">
                  {card.explanation}
                </p>
              )}
            </div>
          </motion.div>
        </div>
      </CardContent>
    </Card>
  );
}
