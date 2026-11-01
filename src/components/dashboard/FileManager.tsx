import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useFiles, FileRecord, FileCategory } from '../../context/FileContext';
import { useProcessing } from '../../context/ProcessingContext';
import { isProcessable } from '../../services/documentProcessor';
import { Search, Filter, Trash2, Download, ExternalLink, File, FileText, Image, FileVideo, Music, Code, FileArchive, SearchX, CheckCircle2, Cpu, AlertTriangle, Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn';
import { Button } from '../ui/Button';
import { EmptyState } from '../ui/EmptyState';
import { useToast } from '../../context/ToastContext';

export function FileManager() {
  const { files, deleteFile, getFileUrl, ensureFileUrl } = useFiles();
  const { toast } = useToast();
  const { getRecord } = useProcessing();
  const navigate = useNavigate();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FileCategory | 'all'>('all');
  const [sortOption, setSortOption] = useState<'newest' | 'oldest' | 'name' | 'size' | 'type'>('newest');

  const handleDownload = async (record: FileRecord) => {
    let url = getFileUrl(record.id);
    if (!url && ensureFileUrl) {
      url = await ensureFileUrl(record.id);
    }
    if (!url) {
      toast(`Could not prepare download for ${record.name}`, 'error');
      return;
    }
    const a = document.createElement('a');
    a.href = url;
    a.download = record.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast(`Downloading ${record.name}`, 'info');
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      await deleteFile(id);
      toast('File deleted successfully', 'success');
    }
  };

  const filteredAndSortedFiles = useMemo(() => {
    let result = [...files];

    // Filter
    if (activeFilter !== 'all') {
      result = result.filter(f => f.category === activeFilter);
    }

    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(f => 
        f.name.toLowerCase().includes(q) || 
        f.extension.toLowerCase().includes(q) ||
        f.category.toLowerCase().includes(q)
      );
    }

    // Sort
    result.sort((a, b) => {
      switch (sortOption) {
        case 'newest': return b.uploadTime - a.uploadTime;
        case 'oldest': return a.uploadTime - b.uploadTime;
        case 'name': return a.name.localeCompare(b.name);
        case 'size': return b.size - a.size;
        case 'type': return a.category.localeCompare(b.category);
        default: return 0;
      }
    });

    return result;
  }, [files, activeFilter, searchQuery, sortOption]);

  const getCategoryIcon = (category: FileCategory) => {
    switch (category) {
      case 'pdf':
      case 'document': return <FileText className="w-5 h-5 text-blue-500" />;
      case 'image': return <Image className="w-5 h-5 text-purple-500" />;
      case 'video': return <FileVideo className="w-5 h-5 text-rose-500" />;
      case 'audio': return <Music className="w-5 h-5 text-amber-500" />;
      case 'code': return <Code className="w-5 h-5 text-green-500" />;
      case 'text': return <FileText className="w-5 h-5 text-gray-500" />;
      case 'spreadsheet': return <File className="w-5 h-5 text-emerald-500" />;
      case 'presentation': return <FileArchive className="w-5 h-5 text-orange-500" />;
      default: return <File className="w-5 h-5 text-gray-400" />;
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const categories = [
    { id: 'all', label: 'All' },
    { id: 'pdf', label: 'PDFs' },
    { id: 'document', label: 'Docs' },
    { id: 'image', label: 'Images' },
    { id: 'code', label: 'Code' },
    { id: 'spreadsheet', label: 'Sheets' },
    { id: 'presentation', label: 'Slides' }
  ] as const;

  if (files.length === 0) {
    return (
      <EmptyState 
        icon={File}
        title="No files uploaded yet"
        description="Upload your first study material using the dropzone above to get started."
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col gap-4 bg-white p-4 rounded-2xl border border-border shadow-sm">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          
          <div className="relative flex-1 w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
            <input 
              type="text" 
              placeholder="Search by name, extension, or type..."
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-2 text-sm text-text-secondary bg-gray-50 px-3 py-2 rounded-xl border border-border">
              <Filter className="w-4 h-4" />
              <span>Sort by:</span>
              <select 
                className="bg-transparent font-medium text-text focus:outline-none"
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value as any)}
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="name">Name</option>
                <option value="size">Size</option>
                <option value="type">Type</option>
              </select>
            </div>
          </div>

        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveFilter(cat.id as any)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-sm font-semibold whitespace-nowrap transition-all",
                activeFilter === cat.id 
                  ? "bg-primary text-white shadow-md shadow-primary/20" 
                  : "bg-gray-100 text-text-secondary hover:bg-gray-200"
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* File List */}
      <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
        {filteredAndSortedFiles.length > 0 ? (
          <div className="divide-y divide-border">
            <AnimatePresence mode="popLayout">
              {filteredAndSortedFiles.map((file) => (
                <motion.div 
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  key={file.id}
                  className="p-4 hover:bg-gray-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                >
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center shrink-0 border border-gray-200">
                      {getCategoryIcon(file.category)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4
                        className="font-semibold text-text truncate group-hover:text-primary transition-colors cursor-pointer"
                        onClick={() => navigate(`/viewer/${file.id}`)}
                      >
                        {file.name}
                      </h4>
                      <div className="flex items-center gap-3 mt-1 text-xs text-text-secondary font-medium flex-wrap">
                          <span className="uppercase tracking-wider">{file.extension}</span>
                          <span>•</span>
                          <span>{formatSize(file.size)}</span>
                          <span className="hidden sm:inline">•</span>
                          <span className="hidden sm:inline">{new Date(file.uploadTime).toLocaleString()}</span>
                          {/* Processing status badge */}
                          {(() => {
                            if (!isProcessable(file.category)) return null;
                            const rec = getRecord(file.id);
                            const status = rec?.status ?? 'idle';
                            if (status === 'processed') return (
                              <span className="inline-flex items-center gap-1 text-green-700 bg-green-50 border border-green-200 rounded-full px-2 py-0.5 text-[10px] font-bold">
                                <CheckCircle2 className="w-3 h-3" /> Processed
                              </span>
                            );
                            if (status === 'processing') return (
                              <span className="inline-flex items-center gap-1 text-blue-600 bg-blue-50 border border-blue-200 rounded-full px-2 py-0.5 text-[10px] font-bold">
                                <Loader2 className="w-3 h-3 animate-spin" /> Processing…
                              </span>
                            );
                            if (status === 'error') return (
                              <span className="inline-flex items-center gap-1 text-red-600 bg-red-50 border border-red-200 rounded-full px-2 py-0.5 text-[10px] font-bold">
                                <AlertTriangle className="w-3 h-3" /> Failed
                              </span>
                            );
                            return (
                              <span className="inline-flex items-center gap-1 text-text-secondary bg-gray-100 border border-gray-200 rounded-full px-2 py-0.5 text-[10px] font-bold">
                                <Cpu className="w-3 h-3" /> Ready to Process
                              </span>
                            );
                          })()}
                        </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-9 px-3 bg-white"
                      onClick={() => navigate(`/viewer/${file.id}`)}
                    >
                      <ExternalLink className="w-4 h-4 mr-1.5" /> Open
                    </Button>
                    <button 
                      className="p-2 text-text-secondary hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors focus-visible:outline-none" 
                      title="Download"
                      onClick={() => handleDownload(file)}
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button 
                      className="p-2 text-text-secondary hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors focus-visible:outline-none" 
                      title="Delete"
                      onClick={() => handleDelete(file.id, file.name)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="py-16 flex flex-col items-center justify-center text-center px-4">
            <SearchX className="w-12 h-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-bold text-text mb-1">No files found</h3>
            <p className="text-text-secondary max-w-sm">
              We couldn't find any files matching your search or filter criteria. Try adjusting them.
            </p>
            <Button variant="outline" className="mt-4" onClick={() => { setSearchQuery(''); setActiveFilter('all'); }}>
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
