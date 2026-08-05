import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { UploadCloud, File, AlertCircle } from 'lucide-react';
import { cn } from '../../utils/cn';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
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
          "relative overflow-hidden border-2 border-dashed rounded-3xl p-10 sm:p-14 transition-all duration-300 ease-in-out flex flex-col items-center justify-center gap-5 text-center group bg-white cursor-pointer",
          isDragging 
            ? 'border-primary bg-primary/[0.03] scale-[1.01] shadow-[0_0_40px_rgba(37,99,235,0.15)]' 
            : 'border-border/80 hover:border-primary/40 hover:bg-gray-50/50 hover:shadow-lg hover:shadow-primary/5'
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

        {/* Large Upload Icon */}
        <div className={cn(
          "w-24 h-24 rounded-full flex items-center justify-center transition-all duration-500 mb-2 shadow-sm",
          isDragging ? "bg-primary/10 scale-110" : "bg-blue-50 group-hover:scale-110 group-hover:bg-blue-100/50"
        )}>
          <UploadCloud className={cn(
            "w-12 h-12 transition-colors",
            isDragging ? "text-primary" : "text-primary/70 group-hover:text-primary"
          )} />
        </div>
        
        {/* Headings */}
        <div className="space-y-1.5">
          <h3 className="text-2xl font-extrabold text-text tracking-tight group-hover:text-primary transition-colors">
            Upload Your Study Files
          </h3>
          <p className="text-text-secondary text-base max-w-md mx-auto font-medium">
            Drag & drop files here or browse from your computer
          </p>
        </div>

        {/* Browse Button */}
        <div className="mt-2">
          <Button 
            type="button"
            variant="primary" 
            className="shadow-md shadow-primary/20 pointer-events-none"
          >
            Browse Files
          </Button>
        </div>

        {/* Badges / Support Text */}
        <div className="flex flex-wrap items-center justify-center gap-3 mt-4">
          <Badge variant="success" className="px-3 py-1.5 bg-green-50 text-green-700 font-semibold shadow-sm">
            <File className="w-3.5 h-3.5 mr-1" /> Supports all file types
          </Badge>
          <Badge variant="warning" className="px-3 py-1.5 bg-amber-50 text-amber-700 font-semibold shadow-sm">
            <AlertCircle className="w-3.5 h-3.5 mr-1" /> Large files supported
          </Badge>
        </div>

        {/* File extensions hint */}
        <div className="mt-2 text-xs font-semibold text-text-secondary/60 flex flex-wrap justify-center gap-1.5 max-w-lg">
          {['PDF', 'DOCX', 'PPT', 'PPTX', 'TXT', 'CSV', 'XLSX', 'ZIP', 'RAR', 'JPG', 'PNG', 'MP4', 'MP3'].map((ext) => (
            <span key={ext} className="bg-gray-100 px-2 py-0.5 rounded-md">{ext}</span>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
