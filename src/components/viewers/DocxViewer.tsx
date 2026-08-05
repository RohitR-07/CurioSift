import { useEffect, useState } from 'react';
import mammoth from 'mammoth';
import { Loader2 } from 'lucide-react';

interface DocxViewerProps {
  url: string;
}

export function DocxViewer({ url }: DocxViewerProps) {
  const [html, setHtml] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const loadDocx = async () => {
      try {
        setLoading(true);
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        
        const result = await mammoth.convertToHtml({ arrayBuffer });
        setHtml(result.value);
        setLoading(false);
      } catch (err) {
        console.error('Error parsing DOCX:', err);
        setError(true);
        setLoading(false);
      }
    };

    loadDocx();
  }, [url]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 gap-3 bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm font-medium text-text-secondary">Extracting Document Text...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50 p-4">
        <div className="p-8 text-center text-danger bg-red-50 rounded-xl border border-red-200">
          <p className="font-bold">Failed to parse DOCX file.</p>
          <p className="text-sm mt-1">Preview unavailable.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto bg-gray-100 p-4 md:p-8 flex justify-center">
      <div 
        className="w-full max-w-4xl bg-white shadow-xl rounded-sm p-8 md:p-12 prose prose-sm md:prose-base prose-blue focus:outline-none"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
