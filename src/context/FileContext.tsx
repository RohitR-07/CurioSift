import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import localforage from 'localforage';

export type FileCategory =
  | 'pdf'
  | 'image'
  | 'video'
  | 'audio'
  | 'code'
  | 'document'
  | 'spreadsheet'
  | 'presentation'
  | 'text'
  | 'other';

export interface FileRecord {
  id: string;
  name: string;
  extension: string;
  size: number;
  category: FileCategory;
  uploadTime: number;
  // originalFile is kept in memory only; the Blob is stored separately in IndexedDB
  originalFile?: File;
}

interface FileContextType {
  files: FileRecord[];
  isLoaded: boolean;
  addFiles: (newFiles: FileList | File[]) => Promise<void>;
  deleteFile: (id: string) => Promise<void>;
  getFileById: (id: string) => FileRecord | undefined;
  getFileUrl: (id: string) => string;
  getFileBlob: (id: string) => Promise<Blob | null>;
}

const FileContext = createContext<FileContextType | undefined>(undefined);

// Separate stores so we can save Blob data independently from metadata
const metaStore = localforage.createInstance({
  name: 'StudyMateAI',
  storeName: 'file_meta',
});

const blobStore = localforage.createInstance({
  name: 'StudyMateAI',
  storeName: 'file_blobs',
});

const categorizeFile = (file: File): FileCategory => {
  const ext = file.name.split('.').pop()?.toLowerCase() || '';
  if (ext === 'pdf') return 'pdf';
  if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(ext)) return 'image';
  if (['mp4', 'mov', 'webm'].includes(ext)) return 'video';
  if (['mp3', 'wav', 'm4a'].includes(ext)) return 'audio';
  if (['js', 'ts', 'jsx', 'tsx', 'py', 'java', 'cpp', 'c', 'html', 'css', 'json'].includes(ext)) return 'code';
  if (['docx', 'doc'].includes(ext)) return 'document';
  if (['xlsx'].includes(ext)) return 'spreadsheet';
  if (['csv'].includes(ext)) return 'spreadsheet';
  if (['pptx', 'ppt'].includes(ext)) return 'presentation';
  if (['txt', 'md', 'xml'].includes(ext)) return 'text';
  return 'other';
};

export function FileProvider({ children }: { children: ReactNode }) {
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  // In-memory blob URL cache to avoid re-creating them
  const [urlCache] = useState<Map<string, string>>(new Map());
  // In-memory blob cache (files from current session)
  const [blobCache] = useState<Map<string, Blob>>(new Map());

  useEffect(() => {
    const loadFiles = async () => {
      try {
        const keys = await metaStore.keys();
        const records: FileRecord[] = [];
        for (const key of keys) {
          const record = await metaStore.getItem<FileRecord>(key);
          if (record) records.push(record);
        }
        // Sort newest first
        records.sort((a, b) => b.uploadTime - a.uploadTime);
        setFiles(records);
      } catch (err) {
        console.error('Failed to load file metadata:', err);
      } finally {
        setIsLoaded(true);
      }
    };
    loadFiles();

    return () => {
      urlCache.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [urlCache]);

  const addFiles = async (newFiles: FileList | File[]) => {
    const fileArray = Array.from(newFiles);
    const newRecords: FileRecord[] = [];

    for (const file of fileArray) {
      const id =
        typeof crypto.randomUUID === 'function'
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).substring(2)}`;

      const record: FileRecord = {
        id,
        name: file.name,
        extension: file.name.split('.').pop()?.toLowerCase() || '',
        size: file.size,
        category: categorizeFile(file),
        uploadTime: Date.now(),
        originalFile: file,
      };

      // Store blob separately for persistence
      try {
        await metaStore.setItem(id, {
          id: record.id,
          name: record.name,
          extension: record.extension,
          size: record.size,
          category: record.category,
          uploadTime: record.uploadTime,
        } as FileRecord);
        await blobStore.setItem(id, file);
        blobCache.set(id, file);
      } catch (err) {
        console.error('Failed to persist file:', err);
      }

      newRecords.push(record);
    }

    setFiles((prev) => [...newRecords, ...prev]);
  };

  const deleteFile = async (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
    if (urlCache.has(id)) {
      URL.revokeObjectURL(urlCache.get(id)!);
      urlCache.delete(id);
    }
    blobCache.delete(id);
    try {
      await metaStore.removeItem(id);
      await blobStore.removeItem(id);
    } catch (err) {
      console.error('Failed to delete file:', err);
    }
  };

  const getFileById = (id: string): FileRecord | undefined => {
    return files.find((f) => f.id === id);
  };

  const getFileUrl = (id: string): string => {
    if (urlCache.has(id)) return urlCache.get(id)!;

    // Try in-memory blob cache (files from this session)
    const blob = blobCache.get(id);
    if (blob) {
      const url = URL.createObjectURL(blob);
      urlCache.set(id, url);
      return url;
    }

    // Fall back to originalFile from FileRecord state
    const record = files.find((f) => f.id === id);
    if (record?.originalFile) {
      const url = URL.createObjectURL(record.originalFile);
      urlCache.set(id, url);
      return url;
    }

    return '';
  };

  const getFileBlob = async (id: string): Promise<Blob | null> => {
    // Return from memory first
    if (blobCache.has(id)) return blobCache.get(id)!;

    // Check originalFile
    const record = files.find((f) => f.id === id);
    if (record?.originalFile) {
      blobCache.set(id, record.originalFile);
      return record.originalFile;
    }

    // Load from IndexedDB
    try {
      const blob = await blobStore.getItem<Blob>(id);
      if (blob) {
        blobCache.set(id, blob);
      }
      return blob;
    } catch (err) {
      console.error('Failed to load blob from IndexedDB:', err);
      return null;
    }
  };

  return (
    <FileContext.Provider
      value={{ files, isLoaded, addFiles, deleteFile, getFileById, getFileUrl, getFileBlob }}
    >
      {children}
    </FileContext.Provider>
  );
}

export function useFiles() {
  const context = useContext(FileContext);
  if (context === undefined) {
    throw new Error('useFiles must be used within a FileProvider');
  }
  return context;
}
