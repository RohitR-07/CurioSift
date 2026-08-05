import { useEffect, useState } from 'react';
import JSZip from 'jszip';
import { Loader2 } from 'lucide-react';

interface PptxViewerProps {
  url: string;
}

interface Slide {
  id: number;
  content: string[];
}

export function PptxViewer({ url }: PptxViewerProps) {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const parsePptx = async () => {
      try {
        setLoading(true);
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        
        const zip = await JSZip.loadAsync(arrayBuffer);
        const slideFiles = Object.keys(zip.files).filter(name => name.startsWith('ppt/slides/slide') && name.endsWith('.xml'));
        
        // Sort slides logically (slide1, slide2, ..., slide10)
        slideFiles.sort((a, b) => {
          const numA = parseInt(a.replace(/[^\d]/g, ''), 10);
          const numB = parseInt(b.replace(/[^\d]/g, ''), 10);
          return numA - numB;
        });

        const extractedSlides: Slide[] = [];

        for (let i = 0; i < slideFiles.length; i++) {
          const filename = slideFiles[i];
          const xmlContent = await zip.file(filename)?.async('string');
          
          if (xmlContent) {
            // Very naive regex to extract text from a:t tags
            const textMatches = xmlContent.match(/<a:t>(.*?)<\/a:t>/g);
            const lines = textMatches 
              ? textMatches.map(tag => tag.replace(/<\/?a:t>/g, '').trim()).filter(t => t.length > 0)
              : [];

            if (lines.length > 0) {
              extractedSlides.push({
                id: i + 1,
                content: lines
              });
            }
          }
        }

        setSlides(extractedSlides);
      } catch (err) {
        console.error('Error parsing PPTX:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    parsePptx();
  }, [url]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 gap-3 bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm font-medium text-text-secondary">Extracting Presentation Slides...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50 p-4">
        <div className="p-8 text-center text-danger bg-red-50 rounded-xl border border-red-200">
          <p className="font-bold">Failed to extract slides.</p>
          <p className="text-sm mt-1">Preview unavailable.</p>
        </div>
      </div>
    );
  }

  if (slides.length === 0) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50 p-4">
        <p className="text-text-secondary font-medium">No readable text found in this presentation.</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto bg-gray-100 p-4 md:p-8 flex flex-col items-center gap-6">
      {slides.map(slide => (
        <div key={slide.id} className="w-full max-w-4xl bg-white shadow-xl rounded-lg p-8 aspect-video border border-border flex flex-col justify-center">
          <div className="w-full h-full overflow-hidden">
            {slide.content.map((text, idx) => (
              <p 
                key={idx} 
                className={idx === 0 ? "text-3xl font-bold text-center mb-6 text-text" : "text-lg text-text-secondary mb-2"}
              >
                {text}
              </p>
            ))}
          </div>
          <div className="mt-auto pt-4 text-right text-xs text-gray-400 border-t border-gray-100">
            Slide {slide.id}
          </div>
        </div>
      ))}
    </div>
  );
}
