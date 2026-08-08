import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FileRecord, useFiles } from '../../context/FileContext';
import { X, Download, Trash2, ChevronLeft, ChevronRight, File, Maximize2 } from 'lucide-react';
import { Button } from '../ui/Button';

import { PdfViewer } from '../viewers/PdfViewer';
import { DocxViewer } from '../viewers/DocxViewer';
import { XlsxViewer } from '../viewers/XlsxViewer';
import { PptxViewer } from '../viewers/PptxViewer';
import { CodeViewer } from '../viewers/CodeViewer';
import { TextViewer } from '../viewers/TextViewer';
import { MediaViewer } from '../viewers/MediaViewer';

interface FileViewerModalProps {
  file: FileRecord | null;
  onClose: () => void;
  onNavigate: (direction: 'prev' | 'next') => void;
  hasNext: boolean;
  hasPrev: boolean;
}

export function FileViewerModal({ file, onClose, onNavigate, hasNext, hasPrev }: FileViewerModalProps) {
  const { getFileUrl, deleteFile } = useFiles();
  const navigate = useNavigate();

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
    if (e.key === 'ArrowLeft' && hasPrev) onNavigate('prev');
    if (e.key === 'ArrowRight' && hasNext) onNavigate('next');
  }, [onClose, onNavigate, hasNext, hasPrev]);

  useEffect(() => {
    if (file) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [file, handleKeyDown]);

  if (!file) return null;

  const fileUrl = getFileUrl(file.id);

  const handleDownload = () => {
    if (!fileUrl) return;
    const a = document.createElement('a');
    a.href = fileUrl;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete "${file.name}"?`)) {
      deleteFile(file.id);
      onClose();
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const renderContent = () => {
    if (!fileUrl) return <div className="flex items-center justify-center h-full">File not found</div>;

    switch (file.category) {
      case 'pdf': return <PdfViewer url={fileUrl} />;
      case 'document': return <DocxViewer url={fileUrl} />;
      case 'spreadsheet': return <XlsxViewer url={fileUrl} />;
      case 'presentation': return <PptxViewer url={fileUrl} />;
      case 'code': return <CodeViewer url={fileUrl} extension={file.extension} />;
      case 'text': return <TextViewer url={fileUrl} extension={file.extension} />;
      case 'image':
      case 'video':
      case 'audio': return <MediaViewer url={fileUrl} category={file.category} name={file.name} />;
      default:
        return (
          <div className="flex flex-col items-center justify-center h-full bg-gray-50 p-8 text-center">
            <File className="w-16 h-16 text-gray-300 mb-4" />
            <h3 className="text-xl font-bold text-text mb-2">Preview Unavailable</h3>
            <p className="text-text-secondary max-w-md mb-6">
              This file type ({file.extension.toUpperCase()}) cannot be previewed in the browser. You can download it to view it locally.
            </p>
            <Button onClick={handleDownload} size="lg">
              <Download className="w-5 h-5 mr-2" /> Download File
            </Button>
          </div>
        );
    }
  };

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex bg-black/60 backdrop-blur-sm"
        role="dialog"
        aria-modal="true"
        aria-label="File Viewer"
      >
        {/* Navigation Left */}
        <button 
          onClick={() => onNavigate('prev')}
          disabled={!hasPrev}
          className="absolute left-4 top-1/2 -translate-y-1/2 p-3 text-white/50 hover:text-white disabled:opacity-0 transition-colors z-50 bg-black/20 rounded-full backdrop-blur-md"
          aria-label="Previous file"
        >
          <ChevronLeft className="w-8 h-8" />
        </button>

        {/* Navigation Right */}
        <button 
          onClick={() => onNavigate('next')}
          disabled={!hasNext}
          className="absolute right-4 md:right-80 top-1/2 -translate-y-1/2 p-3 text-white/50 hover:text-white disabled:opacity-0 transition-colors z-50 bg-black/20 rounded-full backdrop-blur-md mr-4"
          aria-label="Next file"
        >
          <ChevronRight className="w-8 h-8" />
        </button>

        <div className="flex flex-col md:flex-row w-full h-full">
          
          {/* Main Viewer Area */}
          <div className="flex-1 flex flex-col h-full bg-white md:bg-transparent">
            {/* Mobile Header (Hidden on Desktop) */}
            <div className="md:hidden flex items-center justify-between p-4 border-b border-border bg-white">
              <h2 className="font-bold text-text truncate pr-4">{file.name}</h2>
              <button onClick={onClose} className="p-2 text-text-secondary hover:bg-gray-100 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-hidden bg-white shadow-2xl md:m-4 md:rounded-2xl border-none md:border border-border">
              {renderContent()}
            </div>
          </div>

          {/* Right Sidebar (Info Panel) */}
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="w-full md:w-80 bg-white border-l border-border h-full flex flex-col shrink-0 overflow-y-auto"
          >
            <div className="flex items-center justify-between p-4 border-b border-border sticky top-0 bg-white z-10">
              <h3 className="font-bold text-text">File Details</h3>
              <button onClick={onClose} className="p-2 text-text-secondary hover:text-danger hover:bg-red-50 rounded-full transition-colors hidden md:block">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 flex flex-col gap-6">
              <div>
                <p className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-1">Filename</p>
                <p className="font-bold text-text break-all">{file.name}</p>
              </div>

              <div>
                <p className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-1">Type</p>
                <p className="font-medium text-text capitalize">{file.category} ({file.extension.toUpperCase()})</p>
              </div>

              <div>
                <p className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-1">Size</p>
                <p className="font-medium text-text">{formatSize(file.size)}</p>
              </div>

              <div>
                <p className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-1">Uploaded On</p>
                <p className="font-medium text-text">{new Date(file.uploadTime).toLocaleString()}</p>
              </div>
            </div>

            <div className="mt-auto p-6 flex flex-col gap-3 border-t border-border">
              <Button
                variant="outline"
                onClick={() => { onClose(); navigate(`/viewer/${file.id}`); }}
                className="w-full justify-center"
              >
                <Maximize2 className="w-4 h-4 mr-2" /> Open Full Page
              </Button>
              <Button onClick={handleDownload} className="w-full justify-center shadow-sm">
                <Download className="w-4 h-4 mr-2" /> Download
              </Button>
              <Button variant="outline" onClick={handleDelete} className="w-full justify-center text-danger hover:bg-red-50 hover:text-danger hover:border-red-200">
                <Trash2 className="w-4 h-4 mr-2" /> Delete File
              </Button>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
