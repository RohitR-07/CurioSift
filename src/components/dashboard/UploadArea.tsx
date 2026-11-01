import React, { useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, File, Sparkles, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useFiles } from '../../context/FileContext';
import { useToast } from '../../context/ToastContext';

export interface UploadAreaHandle {
  openPicker: () => void;
}

interface UploadAreaProps {
  onUpload?: (files: FileList | null) => void;
}

export const UploadArea = forwardRef<UploadAreaHandle, UploadAreaProps>(function UploadArea(
  { onUpload },
  ref
) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [lastUploadedCount, setLastUploadedCount] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addFiles } = useFiles();
  const { toast } = useToast();

  // Safety watchdog: ensure isUploading NEVER remains stuck
  React.useEffect(() => {
    if (!isUploading) return;
    const watchdog = setTimeout(() => {
      console.warn('[UploadArea] Watchdog auto-cleared stuck upload loading state');
      setIsUploading(false);
    }, 5000);
    return () => clearTimeout(watchdog);
  }, [isUploading]);

  const openPicker = () => {
    if (fileInputRef.current) {
      // Clear previous value so selecting the same file again triggers onChange
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  // Expose openPicker to parent via ref
  useImperativeHandle(ref, () => ({
    openPicker,
  }));

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const processAndUploadFiles = async (filesList: FileList | File[]) => {
    const rawFiles = Array.from(filesList);
    if (rawFiles.length === 0) return;

    setUploadError(null);
    setLastUploadedCount(null);

    // Validation
    const validFiles: File[] = [];
    const validationErrors: string[] = [];
    const MAX_SIZE_MB = 100;
    const MAX_BYTES = MAX_SIZE_MB * 1024 * 1024;

    for (const file of rawFiles) {
      if (file.size === 0) {
        validationErrors.push(`"${file.name}" is empty (0 bytes).`);
        continue;
      }
      if (file.size > MAX_BYTES) {
        validationErrors.push(`"${file.name}" exceeds the ${MAX_SIZE_MB}MB size limit.`);
        continue;
      }
      validFiles.push(file);
    }

    if (validationErrors.length > 0) {
      const errMsg = validationErrors.join(' ');
      setUploadError(errMsg);
      toast(errMsg, 'error');
    }

    if (validFiles.length === 0) {
      return;
    }

    setIsUploading(true);

    try {
      // Guard addFiles with a strict timeout so loading ALWAYS stops
      await Promise.race([
        addFiles(validFiles),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Storage took longer than expected. Files preserved in memory.')), 4000)
        ),
      ]);
      setLastUploadedCount(validFiles.length);
      const successMsg = `Successfully uploaded ${validFiles.length} file${validFiles.length > 1 ? 's' : ''}`;
      toast(successMsg, 'success');

      if (onUpload) {
        onUpload(filesList instanceof FileList ? filesList : null);
      }
    } catch (err: any) {
      const msg = err?.message || 'Failed to save uploaded files.';
      setUploadError(msg);
      toast(msg, 'error');
      console.error('[UploadArea] Upload error:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (isUploading) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await processAndUploadFiles(e.dataTransfer.files);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await processAndUploadFiles(files);
      // Reset input value so selecting the same file again triggers onChange
      e.target.value = '';
    }
  };

  const handleContainerClick = (e: React.MouseEvent) => {
    // Prevent double invocation if click originated directly from the hidden input
    if (e.target === fileInputRef.current) return;
    openPicker();
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="w-full space-y-3"
    >
      {/* File input placed with stopPropagation to prevent recursive bubbling */}
      <input
        type="file"
        ref={fileInputRef}
        id="study-materials-file-input"
        className="hidden"
        onChange={handleFileChange}
        onClick={(e) => e.stopPropagation()}
        multiple
        accept=".pdf,.docx,.doc,.txt,.md,.png,.jpg,.jpeg,.pptx,.ppt,.xlsx,.csv,application/pdf"
      />

      {/* Upload Dropzone Container */}
      <div
        onClick={handleContainerClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            openPicker();
          }
        }}
        className={cn(
          "relative overflow-hidden border-2 border-dashed rounded-3xl p-8 sm:p-12 transition-all duration-300 ease-in-out flex flex-col items-center justify-center gap-5 text-center group bg-white/60 dark:bg-card/60 backdrop-blur-sm cursor-pointer shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
          isDragging
            ? 'border-primary bg-primary/[0.06] scale-[1.01] shadow-[0_0_35px_rgba(37,99,235,0.18)]'
            : 'border-border/80 hover:border-primary/50 hover:bg-white dark:hover:bg-card hover:shadow-xl hover:shadow-primary/5',
          isUploading && 'pointer-events-none opacity-90'
        )}
      >
        {/* Upload Icon / Spinner */}
        <div
          className={cn(
            "w-20 h-20 rounded-2xl flex items-center justify-center transition-all duration-500 mb-1 shadow-sm border border-blue-100 dark:border-blue-900/40",
            isUploading
              ? "bg-primary text-white scale-105"
              : isDragging
              ? "bg-primary text-white scale-110 shadow-primary/30 shadow-lg"
              : "bg-gradient-to-tr from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 text-primary group-hover:scale-110 group-hover:shadow-md"
          )}
        >
          {isUploading ? (
            <Loader2 className="w-10 h-10 animate-spin text-white" />
          ) : (
            <UploadCloud className="w-10 h-10 transition-transform duration-300 group-hover:-translate-y-0.5" />
          )}
        </div>

        {/* Headings */}
        <div className="space-y-1.5 max-w-lg">
          <h3 className="text-xl sm:text-2xl font-extrabold text-text tracking-tight group-hover:text-primary transition-colors">
            {isUploading ? 'Saving Study Materials…' : 'Upload Your Study Materials'}
          </h3>
          <p className="text-text-secondary text-sm sm:text-base font-medium">
            {isUploading ? (
              <span className="text-primary font-semibold">Persisting to your secure offline study vault…</span>
            ) : (
              <>
                Drag & drop files here, or{' '}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    openPicker();
                  }}
                  className="text-primary font-semibold underline decoration-primary/40 underline-offset-4 hover:decoration-primary focus:outline-none cursor-pointer"
                >
                  browse files
                </button>
              </>
            )}
          </p>
        </div>

        {/* Badges / Support Text */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> AI-Ready Instant Analysis
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/40 shadow-xs">
            <File className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> PDF, DOCX, TXT, Slides, Images
          </span>
        </div>
      </div>

      {/* Inline Feedback Banners */}
      <AnimatePresence>
        {uploadError && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-center justify-between gap-3 p-4 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400 text-sm"
          >
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{uploadError}</span>
            </div>
            <button
              onClick={() => setUploadError(null)}
              className="text-xs font-bold uppercase tracking-wider underline hover:opacity-80"
            >
              Dismiss
            </button>
          </motion.div>
        )}

        {lastUploadedCount !== null && !uploadError && !isUploading && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-400 text-sm font-medium"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
              <span>{lastUploadedCount} file{lastUploadedCount > 1 ? 's' : ''} successfully added to your library!</span>
            </div>
            <button
              onClick={() => setLastUploadedCount(null)}
              className="text-xs font-bold uppercase tracking-wider underline hover:opacity-80"
            >
              Dismiss
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
});
