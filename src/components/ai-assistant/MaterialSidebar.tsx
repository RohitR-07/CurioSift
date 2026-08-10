import {
  FileText,
  ImageIcon,
  FileVideo,
  Music,
  Code,
  FileSpreadsheet,
  Presentation,
} from 'lucide-react';
import { cn } from '../../utils/cn';
import type { FileRecord, FileCategory } from '../../context/FileContext';

interface MaterialSidebarProps {
  files: FileRecord[];
  selectedFileId: string | null;
  onSelectFile: (fileId: string) => void;
}

function getCategoryIcon(cat: FileCategory, cls = 'w-4 h-4') {
  switch (cat) {
    case 'pdf':
    case 'document': return <FileText className={cls} />;
    case 'image': return <ImageIcon className={cls} />;
    case 'video': return <FileVideo className={cls} />;
    case 'audio': return <Music className={cls} />;
    case 'code': return <Code className={cls} />;
    case 'spreadsheet': return <FileSpreadsheet className={cls} />;
    case 'presentation': return <Presentation className={cls} />;
    default: return <FileText className={cls} />;
  }
}

function formatBytes(bytes: number, decimals = 1) {
  if (!+bytes) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function MaterialSidebar({ files, selectedFileId, onSelectFile }: MaterialSidebarProps) {
  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      <div className="p-5 border-b border-gray-100">
        <h2 className="text-sm font-bold uppercase tracking-wider text-text-secondary">
          Study Materials
        </h2>
        <p className="text-xs text-text-secondary mt-1">
          Select a document to ask questions about it.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-1.5 scrollbar-hide">
        {files.length === 0 ? (
          <div className="p-4 text-center text-sm text-text-secondary">
            No materials uploaded yet.
          </div>
        ) : (
          files.map((file) => {
            const isSelected = selectedFileId === file.id;
            return (
              <button
                key={file.id}
                onClick={() => onSelectFile(file.id)}
                className={cn(
                  'w-full flex items-start gap-3 p-3 rounded-xl transition-all text-left outline-none focus-visible:ring-2 focus-visible:ring-primary',
                  isSelected
                    ? 'bg-primary/5 border border-primary/20 ring-1 ring-primary/20 shadow-sm'
                    : 'border border-transparent hover:bg-gray-50 hover:border-gray-200 text-text-secondary hover:text-text'
                )}
                aria-pressed={isSelected}
              >
                <div
                  className={cn(
                    'w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border',
                    isSelected
                      ? 'bg-white border-primary/20 text-primary'
                      : 'bg-gray-50 border-gray-200 text-gray-400'
                  )}
                >
                  {getCategoryIcon(file.category)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p
                    className={cn(
                      'text-sm font-semibold truncate',
                      isSelected ? 'text-primary' : 'text-text'
                    )}
                  >
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500 truncate mt-0.5">
                    {file.category} • {formatBytes(file.size)}
                  </p>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
