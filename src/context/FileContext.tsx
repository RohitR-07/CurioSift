import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import localforage from 'localforage';

export type FileCategory = 'pdf' | 'image' | 'video' | 'audio' | 'code' | 'document' | 'spreadsheet' | 'presentation' | 'text' | 'other';

export interface FileRecord {
  id: string;
  originalFile: File;
  name: string;
  extension: string;
  size: number;
  category: FileCategory;
  uploadTime: number;
}

interface FileContextType {
  files: FileRecord[];
  isLoaded: boolean;
  addFiles: (newFiles: FileList | File[]) => Promise<void>;
  deleteFile: (id: string) => Promise<void>;
  getFileUrl: (id: string) => string;
}

const FileContext = createContext<FileContextType | undefined>(undefined);

const STORE_KEY = 'studymate_files';

localforage.config({
  name: 'StudyMateAI',
  storeName: 'files_store'
});

export function FileProvider({ children }: { children: ReactNode }) {
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  // Keep object URLs in memory so we don't leak them
  const [urls] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    const loadFiles = async () => {
      try {
        const storedFiles = await localforage.getItem<FileRecord[]>(STORE_KEY);
        if (storedFiles) {
          setFiles(storedFiles);
        }
      } catch (error) {
        console.error('Error loading files from IndexedDB:', error);
      } finally {
        setIsLoaded(true);
      }
    };
    loadFiles();
    
    // Cleanup URLs on unmount
    return () => {
      urls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [urls]);

  const categorizeFile = (file: File): FileCategory => {
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    if (ext === 'pdf') return 'pdf';
    if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(ext)) return 'image';
    if (['mp4', 'mov', 'webm'].includes(ext)) return 'video';
    if (['mp3', 'wav', 'm4a'].includes(ext)) return 'audio';
    if (['js', 'ts', 'jsx', 'tsx', 'py', 'java', 'cpp', 'c', 'html', 'css', 'json'].includes(ext)) return 'code';
    if (['docx', 'doc'].includes(ext)) return 'document';
    if (['xlsx', 'csv'].includes(ext)) return 'spreadsheet';
    if (['pptx', 'ppt'].includes(ext)) return 'presentation';
    if (['txt', 'md', 'xml'].includes(ext)) return 'text';
    return 'other';
  };

  const addFiles = async (newFiles: FileList | File[]) => {
    const fileArray = Array.from(newFiles);
    
    const records: FileRecord[] = fileArray.map(file => ({
      id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString() + Math.random().toString(36).substring(7),
      originalFile: file,
      name: file.name,
      extension: file.name.split('.').pop()?.toLowerCase() || '',
      size: file.size,
      category: categorizeFile(file),
      uploadTime: Date.now()
    }));

    const updatedFiles = [...records, ...files];
    setFiles(updatedFiles);
    
    try {
      await localforage.setItem(STORE_KEY, updatedFiles);
    } catch (error) {
      console.error('Error saving files to IndexedDB:', error);
    }
  };

  const deleteFile = async (id: string) => {
    const updatedFiles = files.filter(f => f.id !== id);
    setFiles(updatedFiles);
    
    if (urls.has(id)) {
      URL.revokeObjectURL(urls.get(id)!);
      urls.delete(id);
    }

    try {
      await localforage.setItem(STORE_KEY, updatedFiles);
    } catch (error) {
      console.error('Error deleting file from IndexedDB:', error);
    }
  };

  const getFileUrl = (id: string): string => {
    if (urls.has(id)) {
      return urls.get(id)!;
    }
    const record = files.find(f => f.id === id);
    if (!record) return '';
    
    const url = URL.createObjectURL(record.originalFile);
    urls.set(id, url);
    return url;
  };

  return (
    <FileContext.Provider value={{ files, isLoaded, addFiles, deleteFile, getFileUrl }}>
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
