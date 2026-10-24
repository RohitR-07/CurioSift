import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { UploadCloud, File, Sparkles } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useFiles } from '../../context/FileContext';

interface UploadAreaProps {
  onUpload?: (files: FileList | null) => void;
}

export function UploadArea({ onUpload }: UploadAreaProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addFiles } = useFiles();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await addFiles(e.dataTransfer.files);
      if (onUpload) onUpload(e.dataTransfer.files);
    }
  };

  const handleClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await addFiles(e.target.files);
      if (onUpload) onUpload(e.target.files);
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="w-full"
    >
      <div 
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "relative overflow-hidden border-2 border-dashed rounded-3xl p-8 sm:p-12 transition-all duration-300 ease-in-out flex flex-col items-center justify-center gap-5 text-center group bg-white/60 backdrop-blur-sm cursor-pointer shadow-sm",
          isDragging 
            ? 'border-primary bg-primary/[0.04] scale-[1.01] shadow-[0_0_35px_rgba(37,99,235,0.18)]' 
            : 'border-border/80 hover:border-primary/50 hover:bg-white hover:shadow-xl hover:shadow-primary/5'
        )}
      >
        <input 
          type="file" 
          ref={fileInputRef}
          className="hidden" 
          onChange={handleFileChange}
          multiple 
          accept="*"
        />

        {/* Upload Icon */}
        <div className={cn(
          "w-20 h-20 rounded-2xl flex items-center justify-center transition-all duration-500 mb-1 shadow-sm border border-blue-100",
          isDragging 
            ? "bg-primary text-white scale-110 shadow-primary/30 shadow-lg" 
            : "bg-gradient-to-tr from-blue-50 to-indigo-50 text-primary group-hover:scale-110 group-hover:shadow-md"
        )}>
          <UploadCloud className="w-10 h-10 transition-transform duration-300 group-hover:-translate-y-0.5" />
        </div>
        
        {/* Headings */}
        <div className="space-y-1.5 max-w-lg">
          <h3 className="text-xl sm:text-2xl font-extrabold text-text tracking-tight group-hover:text-primary transition-colors">
            Upload Your Study Materials
          </h3>
          <p className="text-text-secondary text-sm sm:text-base font-medium">
            Drag & drop files here, or <span className="text-primary font-semibold underline decoration-primary/40 underline-offset-4">browse files</span>
          </p>
        </div>

        {/* Badges / Support Text */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> AI-Ready Instant Analysis
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/60 shadow-xs">
            <File className="w-3.5 h-3.5 text-blue-600" /> PDF, DOCX, TXT, Slides
          </span>
        </div>
      </div>
    </motion.section>
  );
}
