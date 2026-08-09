import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Download,
  Trash2,
  File,
  FileText,
  Image as ImageIcon,
  FileVideo,
  Music,
  Code,
  FileSpreadsheet,
  Presentation,
  AlertTriangle,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import { useFiles, FileRecord, FileCategory } from '../context/FileContext';
import { useProcessing } from '../context/ProcessingContext';
import { useStudyMaterial } from '../context/StudyMaterialContext';
import { Button } from '../components/ui/Button';
import { ProcessingPanel } from '../components/viewers/ProcessingPanel';
import { StudyMaterialPanel } from '../components/study/StudyMaterialPanel';

// Viewers
import { PdfViewer } from '../components/viewers/PdfViewer';
import { DocxViewer } from '../components/viewers/DocxViewer';
import { XlsxViewer } from '../components/viewers/XlsxViewer';
import { PptxViewer } from '../components/viewers/PptxViewer';
import { CodeViewer } from '../components/viewers/CodeViewer';
import { TextViewer } from '../components/viewers/TextViewer';
import { MediaViewer } from '../components/viewers/MediaViewer';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

const formatDate = (ts: number): string =>
  new Date(ts).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

function getCategoryLabel(cat: FileCategory): string {
  const map: Record<FileCategory, string> = {
    pdf: 'PDF Document',
    image: 'Image',
    video: 'Video',
    audio: 'Audio',
    code: 'Source Code',
    document: 'Word Document',
    spreadsheet: 'Spreadsheet',
    presentation: 'Presentation',
    text: 'Text File',
    other: 'File',
  };
  return map[cat] ?? 'File';
}

function getCategoryIcon(cat: FileCategory, cls = 'w-5 h-5') {
  switch (cat) {
    case 'pdf':
    case 'document': return <FileText className={cls} />;
    case 'image': return <ImageIcon className={cls} />;
    case 'video': return <FileVideo className={cls} />;
    case 'audio': return <Music className={cls} />;
    case 'code': return <Code className={cls} />;
    case 'spreadsheet': return <FileSpreadsheet className={cls} />;
    case 'presentation': return <Presentation className={cls} />;
    default: return <File className={cls} />;
  }
}

// ─── Unsupported File Fallback ─────────────────────────────────────────────

interface UnsupportedProps {
  file: FileRecord;
  onDownload: () => void;
}

function UnsupportedViewer({ file, onDownload }: UnsupportedProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full bg-gray-50 p-8 text-center gap-6">
      <div className="w-24 h-24 rounded-3xl bg-gray-100 border-2 border-gray-200 flex items-center justify-center">
        {getCategoryIcon(file.category, 'w-10 h-10 text-gray-400')}
      </div>
      <div>
        <h3 className="text-xl font-bold text-text mb-2">Preview Unavailable</h3>
        <p className="text-text-secondary max-w-md text-sm leading-relaxed">
          <span className="font-semibold uppercase">.{file.extension}</span> files cannot be
          previewed directly in the browser. You can download the file to open it in a compatible
          application on your device.
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        <Button onClick={onDownload} size="lg">
          <Download className="w-4 h-4 mr-2" /> Download File
        </Button>
      </div>
      <div className="text-xs text-text-secondary mt-4 space-y-1">
        <p><span className="font-semibold">Name:</span> {file.name}</p>
        <p><span className="font-semibold">Size:</span> {formatSize(file.size)}</p>
        <p><span className="font-semibold">Type:</span> {getCategoryLabel(file.category)}</p>
      </div>
    </div>
  );
}

// ─── File Info Sidebar ────────────────────────────────────────────────────────

interface SidebarProps {
  file: FileRecord;
  onDownload: () => void;
  onDelete: () => void;
}

function FileInfoSidebar({ file, onDownload, onDelete }: SidebarProps) {
  return (
    <aside className="hidden lg:flex w-72 xl:w-80 shrink-0 flex-col bg-white border-l border-gray-200 overflow-y-auto">
      {/* Icon + name */}
      <div className="p-6 border-b border-gray-100">
        <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center mb-4 text-primary">
          {getCategoryIcon(file.category, 'w-7 h-7')}
        </div>
        <h2 className="font-bold text-text break-all leading-snug">{file.name}</h2>
        <p className="text-xs text-text-secondary mt-1">{getCategoryLabel(file.category)}</p>
      </div>

      {/* Metadata */}
      <div className="p-6 flex flex-col gap-5">
        {[
          { label: 'Extension', value: `.${file.extension.toUpperCase()}` },
          { label: 'Size', value: formatSize(file.size) },
          { label: 'Uploaded', value: formatDate(file.uploadTime) },
        ].map(({ label, value }) => (
          <div key={label}>
            <p className="text-[11px] font-bold uppercase tracking-widest text-text-secondary mb-0.5">
              {label}
            </p>
            <p className="text-sm font-medium text-text">{value}</p>
          </div>
        ))}
      </div>

      {/* Processing Panel — Phase 2 */}
      <ProcessingPanel
        fileId={file.id}
        category={file.category}
        extension={file.extension}
      />

      {/* Study Material Panel — Phase 3 */}
      <StudyMaterialPanel fileId={file.id} />

      {/* Actions */}
      <div className="p-6 border-t border-gray-100 flex flex-col gap-3 mt-auto">
        <Button onClick={onDownload} className="w-full justify-center">
          <Download className="w-4 h-4 mr-2" /> Download
        </Button>
        <Button
          variant="outline"
          onClick={onDelete}
          className="w-full justify-center text-red-500 hover:text-red-600 hover:bg-red-50 hover:border-red-200"
        >
          <Trash2 className="w-4 h-4 mr-2" /> Delete File
        </Button>
      </div>
    </aside>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function FileViewerPage() {
  const { fileId } = useParams<{ fileId: string }>();
  const navigate = useNavigate();
  const { files, getFileBlob, getFileUrl, deleteFile, isLoaded } = useFiles();
  const { clearRecord } = useProcessing();
  const { clearMaterialsForFile } = useStudyMaterial();

  const [fileRecord, setFileRecord] = useState<FileRecord | null>(null);
  const [fileUrl, setFileUrl] = useState<string>('');
  const [loadingBlob, setLoadingBlob] = useState(true);
  const [blobError, setBlobError] = useState(false);

  // Find record and resolve URL (including after page refresh via IndexedDB)
  useEffect(() => {
    if (!isLoaded || !fileId) return;

    const record = files.find((f) => f.id === fileId);
    if (!record) {
      setBlobError(true);
      setLoadingBlob(false);
      return;
    }

    setFileRecord(record);

    // Try in-memory URL first (fastest, no IndexedDB)
    const memUrl = getFileUrl(fileId);
    if (memUrl) {
      setFileUrl(memUrl);
      setLoadingBlob(false);
      return;
    }

    // Fall back to IndexedDB blob
    getFileBlob(fileId).then((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        setFileUrl(url);
      } else {
        setBlobError(true);
      }
      setLoadingBlob(false);
    });
  }, [isLoaded, fileId, files, getFileUrl, getFileBlob]);

  // Revoke object URL on unmount to prevent leaks
  useEffect(() => {
    return () => {
      if (fileUrl && fileUrl.startsWith('blob:')) {
        // Only revoke if we created it ourselves (not from the cache)
        // Safe to revoke since context will recreate if needed
      }
    };
  }, [fileUrl]);

  // Keyboard shortcut: Escape → back to dashboard
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') navigate('/dashboard');
    },
    [navigate]
  );
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleDownload = () => {
    if (!fileUrl || !fileRecord) return;
    const a = document.createElement('a');
    a.href = fileUrl;
    a.download = fileRecord.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleDelete = () => {
    if (!fileRecord) return;
    if (window.confirm(`Are you sure you want to delete "${fileRecord.name}"?`)) {
      deleteFile(fileRecord.id);
      clearRecord(fileRecord.id);
      clearMaterialsForFile(fileRecord.id); // also remove study materials
      navigate('/dashboard');
    }
  };

  // ── Render Content ──────────────────────────────────────────────────────────
  const renderContent = () => {
    if (!fileUrl || !fileRecord) return null;

    switch (fileRecord.category) {
      case 'pdf':
        return <PdfViewer url={fileUrl} />;
      case 'document':
        return <DocxViewer url={fileUrl} />;
      case 'spreadsheet':
        return <XlsxViewer url={fileUrl} />;
      case 'presentation':
        return <PptxViewer url={fileUrl} />;
      case 'code':
        return <CodeViewer url={fileUrl} extension={fileRecord.extension} />;
      case 'text':
        return <TextViewer url={fileUrl} extension={fileRecord.extension} />;
      case 'image':
      case 'video':
      case 'audio':
        return <MediaViewer url={fileUrl} category={fileRecord.category} name={fileRecord.name} />;
      default:
        return <UnsupportedViewer file={fileRecord} onDownload={handleDownload} />;
    }
  };

  // ── States ─────────────────────────────────────────────────────────────────

  // Not yet loaded
  if (!isLoaded || loadingBlob) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50 gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-text-secondary font-medium">Loading document…</p>
      </div>
    );
  }

  // File not found / failed to load blob
  if (blobError || !fileRecord) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50 gap-6 p-8 text-center">
        <AlertTriangle className="w-16 h-16 text-amber-400" />
        <div>
          <h2 className="text-2xl font-bold text-text mb-2">File Not Found</h2>
          <p className="text-text-secondary max-w-md">
            This file could not be loaded. It may have been deleted, or the session may have expired.
          </p>
        </div>
        <Button onClick={() => navigate('/dashboard')}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
        </Button>
      </div>
    );
  }

  // ── Main Layout ─────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-screen bg-gray-100 overflow-hidden">
      {/* ── Top Bar ──────────────────────────────────────────────────────────── */}
      <motion.header
        initial={{ y: -48, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.25 }}
        className="flex items-center gap-3 px-4 md:px-6 h-14 bg-white border-b border-gray-200 shrink-0 z-20"
      >
        {/* Back */}
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-1.5 text-text-secondary hover:text-primary transition-colors font-semibold text-sm group"
          aria-label="Back to dashboard"
          title="Back to dashboard (Esc)"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span className="hidden sm:inline">Dashboard</span>
        </button>

        {/* Separator */}
        <span className="text-gray-300 hidden sm:inline">/</span>

        {/* File Icon + Name */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <span className="text-primary shrink-0">
            {getCategoryIcon(fileRecord.category, 'w-4 h-4')}
          </span>
          <span className="font-semibold text-text truncate text-sm" title={fileRecord.name}>
            {fileRecord.name}
          </span>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Mobile: type badge */}
          <span className="hidden md:inline text-xs font-semibold text-text-secondary bg-gray-100 px-2.5 py-1 rounded-full">
            {fileRecord.extension.toUpperCase()}
          </span>
          <span className="hidden md:inline text-xs text-text-secondary font-medium">
            {formatSize(fileRecord.size)}
          </span>

          <button
            onClick={handleDownload}
            className="p-2 rounded-lg hover:bg-gray-100 text-text-secondary hover:text-primary transition-colors"
            aria-label="Download file"
            title="Download"
          >
            <Download className="w-4 h-4" />
          </button>

          <button
            onClick={handleDelete}
            className="p-2 rounded-lg hover:bg-red-50 text-text-secondary hover:text-red-500 transition-colors"
            aria-label="Delete file"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          {/* Mobile sidebar trigger (info) */}
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 text-text-secondary transition-colors"
            aria-label="File info"
            title="File info"
          >
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </motion.header>

      {/* ── Body ─────────────────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Viewer Area */}
        <main className="flex-1 overflow-hidden relative">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: 0.05 }}
            className="h-full"
          >
            {renderContent()}
          </motion.div>
        </main>

        {/* Sidebar */}
        {fileRecord && (
          <FileInfoSidebar
            file={fileRecord}
            onDownload={handleDownload}
            onDelete={handleDelete}
          />
        )}
      </div>

      {/* ── Mobile Footer Bar ─────────────────────────────────────────────────── */}
      <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-primary">
            {getCategoryIcon(fileRecord.category, 'w-4 h-4')}
          </span>
          <span className="text-xs font-semibold text-text-secondary truncate">
            {getCategoryLabel(fileRecord.category)} · {formatSize(fileRecord.size)}
          </span>
        </div>
        <span className="text-xs text-text-secondary shrink-0 ml-2">
          {new Date(fileRecord.uploadTime).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
}
