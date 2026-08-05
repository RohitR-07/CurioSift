import { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Loader2, ZoomIn, ZoomOut, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../ui/Button';

// Worker required for react-pdf
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

interface PdfViewerProps {
  url: string;
}

export function PdfViewer({ url }: PdfViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [loading, setLoading] = useState(true);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setLoading(false);
  }

  const zoomIn = () => setScale(prev => Math.min(prev + 0.2, 3.0));
  const zoomOut = () => setScale(prev => Math.max(prev - 0.2, 0.5));
  const prevPage = () => setPageNumber(prev => Math.max(prev - 1, 1));
  const nextPage = () => setPageNumber(prev => Math.min(prev + 1, numPages || 1));

  return (
    <div className="flex flex-col h-full items-center bg-gray-100 overflow-hidden">
      
      {/* PDF Controls */}
      <div className="flex items-center justify-between w-full p-3 bg-white border-b border-border shadow-sm z-10 shrink-0">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={zoomOut} title="Zoom Out" className="px-2">
            <ZoomOut className="w-4 h-4" />
          </Button>
          <span className="text-sm font-semibold w-12 text-center">{Math.round(scale * 100)}%</span>
          <Button variant="outline" size="sm" onClick={zoomIn} title="Zoom In" className="px-2">
            <ZoomIn className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={prevPage} disabled={pageNumber <= 1} className="px-2">
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm font-medium">
            Page {pageNumber} of {numPages || '?'}
          </span>
          <Button variant="outline" size="sm" onClick={nextPage} disabled={pageNumber >= (numPages || 1)} className="px-2">
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Document Area */}
      <div className="flex-1 overflow-auto w-full flex justify-center p-4">
        {loading && (
          <div className="flex items-center justify-center absolute inset-0">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}
        <Document
          file={url}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={
            <div className="flex flex-col items-center justify-center p-8 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-sm font-medium text-text-secondary">Loading PDF document...</p>
            </div>
          }
          error={
            <div className="p-8 text-center text-danger bg-red-50 rounded-xl border border-red-200">
              <p className="font-bold">Failed to load PDF file.</p>
              <p className="text-sm mt-1">The file might be corrupted or unsupported.</p>
            </div>
          }
          className="shadow-xl"
        >
          <Page 
            pageNumber={pageNumber} 
            scale={scale} 
            renderTextLayer={false} 
            renderAnnotationLayer={false}
            className="bg-white"
          />
        </Document>
      </div>
    </div>
  );
}
