import { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
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
  ensureFileUrl: (id: string) => Promise<string>;
}

const FileContext = createContext<FileContextType | undefined>(undefined);

// Primary isolated stores: 1 store per database eliminates IndexedDB versionchange deadlocks completely.
const metaStore = localforage.createInstance({
  name: 'CurioSift_Files_Meta',
  storeName: 'files',
  driver: [localforage.INDEXEDDB, localforage.LOCALSTORAGE],
});

const blobStore = localforage.createInstance({
  name: 'CurioSift_Files_Blobs',
  storeName: 'blobs',
  driver: [localforage.INDEXEDDB],
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

/**
 * Timeout wrapper that guarantees a promise never hangs the application.
 */
function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`[FileContext] Timeout (${ms}ms) on ${label}`)), ms)
    ),
  ]);
}

/**
 * Helper to safely sync metadata to localStorage as immediate persistent cache.
 */
function syncToLocalStorage(records: FileRecord[]) {
  try {
    const cleanList = records.map((r) => ({
      id: r.id,
      name: r.name,
      extension: r.extension,
      size: r.size,
      category: r.category,
      uploadTime: r.uploadTime,
    }));
    localStorage.setItem('curiosift_files_meta', JSON.stringify(cleanList));
  } catch (err) {
    console.warn('[FileContext] LocalStorage sync warning:', err);
  }
}

/**
 * Inspects a legacy IndexedDB database WITHOUT version upgrade.
 * Times out after 1000ms so it never stalls loadFiles().
 */
async function readLegacyDb(dbName: string): Promise<{ records: FileRecord[]; blobs: Map<string, Blob> }> {
  const records: FileRecord[] = [];
  const blobs = new Map<string, Blob>();

  if (typeof window === 'undefined' || !window.indexedDB) {
    return { records, blobs };
  }

  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      resolve({ records, blobs });
    }, 1000);

    try {
      const req = window.indexedDB.open(dbName);

      req.onblocked = () => {
        clearTimeout(timer);
        resolve({ records, blobs });
      };

      req.onerror = () => {
        clearTimeout(timer);
        resolve({ records, blobs });
      };

      req.onsuccess = () => {
        clearTimeout(timer);
        const db = req.result;
        const storeNames = Array.from(db.objectStoreNames);

        if (storeNames.length === 0) {
          db.close();
          resolve({ records, blobs });
          return;
        }

        try {
          const tx = db.transaction(storeNames, 'readonly');

          tx.oncomplete = () => {
            db.close();
            resolve({ records, blobs });
          };
          tx.onerror = () => {
            db.close();
            resolve({ records, blobs });
          };

          // 1. file_meta store (individual file records)
          if (storeNames.includes('file_meta')) {
            const store = tx.objectStore('file_meta');
            const getAll = store.getAll ? store.getAll() : null;
            if (getAll) {
              getAll.onsuccess = () => {
                if (Array.isArray(getAll.result)) {
                  for (const item of getAll.result) {
                    if (item && item.id) records.push(item);
                  }
                }
              };
            }
          }

          // 2. files_store (Module 4 studymate_files array)
          if (storeNames.includes('files_store')) {
            const store = tx.objectStore('files_store');
            const getArray = store.get('studymate_files');
            getArray.onsuccess = () => {
              if (Array.isArray(getArray.result)) {
                for (const item of getArray.result) {
                  if (item && item.id) {
                    records.push(item);
                    if (item.originalFile) blobs.set(item.id, item.originalFile);
                  }
                }
              }
            };
            const getCurioArray = store.get('curiosift_files');
            getCurioArray.onsuccess = () => {
              if (Array.isArray(getCurioArray.result)) {
                for (const item of getCurioArray.result) {
                  if (item && item.id) {
                    records.push(item);
                    if (item.originalFile) blobs.set(item.id, item.originalFile);
                  }
                }
              }
            };
          }

          // 3. keyvaluepairs (default localforage store)
          if (storeNames.includes('keyvaluepairs')) {
            const store = tx.objectStore('keyvaluepairs');
            const getArray = store.get('studymate_files');
            getArray.onsuccess = () => {
              if (Array.isArray(getArray.result)) {
                for (const item of getArray.result) {
                  if (item && item.id) {
                    records.push(item);
                    if (item.originalFile) blobs.set(item.id, item.originalFile);
                  }
                }
              }
            };
          }
        } catch (_) {
          db.close();
          resolve({ records, blobs });
        }
      };
    } catch (_) {
      clearTimeout(timer);
      resolve({ records, blobs });
    }
  });
}

/**
 * Safely fetches a Blob from a legacy database.
 */
async function getLegacyDbBlob(dbName: string, id: string): Promise<Blob | null> {
  if (typeof window === 'undefined' || !window.indexedDB) return null;

  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve(null), 1000);

    try {
      const req = window.indexedDB.open(dbName);
      req.onerror = () => { clearTimeout(timer); resolve(null); };
      req.onblocked = () => { clearTimeout(timer); resolve(null); };

      req.onsuccess = () => {
        clearTimeout(timer);
        const db = req.result;
        if (!db.objectStoreNames.contains('file_blobs')) {
          db.close();
          resolve(null);
          return;
        }

        try {
          const tx = db.transaction('file_blobs', 'readonly');
          const store = tx.objectStore('file_blobs');
          const getReq = store.get(id);

          getReq.onsuccess = () => {
            db.close();
            resolve(getReq.result || null);
          };
          getReq.onerror = () => {
            db.close();
            resolve(null);
          };
        } catch (_) {
          db.close();
          resolve(null);
        }
      };
    } catch (_) {
      clearTimeout(timer);
      resolve(null);
    }
  });
}

export function FileProvider({ children }: { children: ReactNode }) {
  // Synchronously hydrate from localStorage so files are visible immediately at 0ms render
  const [files, setFiles] = useState<FileRecord[]>(() => {
    try {
      const raw = localStorage.getItem('curiosift_files_meta') || localStorage.getItem('studymate_files');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (_) {}
    return [];
  });

  const [isLoaded, setIsLoaded] = useState(false);
  const [urlCache] = useState<Map<string, string>>(new Map());
  const [blobCache] = useState<Map<string, Blob>>(new Map());
  const filesRef = useRef<FileRecord[]>(files);
  filesRef.current = files;

  useEffect(() => {
    let isMounted = true;

    // Safety timeout: Ensure loading flag resolves within 1.5s no matter what happens
    const safetyTimer = setTimeout(() => {
      if (isMounted) setIsLoaded(true);
    }, 1500);

    const loadFiles = async () => {
      try {
        const foundMap = new Map<string, FileRecord>();

        // Seed with current state/localStorage
        for (const file of filesRef.current) {
          if (file && file.id) foundMap.set(file.id, file);
        }

        // 1. Read from our conflict-free primary store with timeout
        try {
          const keys = await withTimeout(metaStore.keys(), 1200, 'metaStore.keys()');
          for (const key of keys) {
            try {
              const record = await withTimeout(
                metaStore.getItem<FileRecord>(key),
                800,
                `metaStore.getItem(${key})`
              );
              if (record && record.id) {
                foundMap.set(record.id, record);
              }
            } catch (e) {
              console.warn(`[FileContext] Error reading record ${key}:`, e);
            }
          }
        } catch (e) {
          console.warn('[FileContext] Primary metaStore keys check timed out or errored:', e);
        }

        // 2. Safely recover any existing files from legacy 'StudyMateAI'
        try {
          const { records: legacyStudyMate, blobs: smBlobs } = await readLegacyDb('StudyMateAI');
          for (const record of legacyStudyMate) {
            if (record && record.id && !foundMap.has(record.id)) {
              foundMap.set(record.id, record);
              metaStore.setItem(record.id, {
                id: record.id,
                name: record.name,
                extension: record.extension,
                size: record.size,
                category: record.category,
                uploadTime: record.uploadTime || Date.now(),
              }).catch(() => {});
            }
          }
          smBlobs.forEach((blob, id) => {
            blobCache.set(id, blob);
            blobStore.setItem(id, blob).catch(() => {});
          });
        } catch (e) {
          console.warn('[FileContext] Legacy StudyMateAI check warning:', e);
        }

        // 3. Safely recover any existing files from legacy 'CurioSift'
        try {
          const { records: legacyCurio, blobs: curioBlobs } = await readLegacyDb('CurioSift');
          for (const record of legacyCurio) {
            if (record && record.id && !foundMap.has(record.id)) {
              foundMap.set(record.id, record);
              metaStore.setItem(record.id, record).catch(() => {});
            }
          }
          curioBlobs.forEach((blob, id) => {
            blobCache.set(id, blob);
            blobStore.setItem(id, blob).catch(() => {});
          });
        } catch (_) {}

        const allRecords = Array.from(foundMap.values());
        allRecords.sort((a, b) => b.uploadTime - a.uploadTime);

        if (isMounted) {
          setFiles(allRecords);
          syncToLocalStorage(allRecords);
        }
      } catch (err) {
        console.error('[FileContext] Error in loadFiles:', err);
      } finally {
        clearTimeout(safetyTimer);
        if (isMounted) {
          setIsLoaded(true);
        }
      }
    };

    loadFiles();

    return () => {
      isMounted = false;
      clearTimeout(safetyTimer);
      urlCache.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [urlCache, blobCache]);

  const addFiles = async (newFiles: FileList | File[]) => {
    const fileArray = Array.from(newFiles);
    if (fileArray.length === 0) return;

    const newRecords: FileRecord[] = [];

    for (const file of fileArray) {
      const id =
        typeof crypto.randomUUID === 'function'
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).substring(2)}`;

      const ext = file.name.split('.').pop()?.toLowerCase() || '';
      const category = categorizeFile(file);

      const record: FileRecord = {
        id,
        name: file.name,
        extension: ext,
        size: file.size,
        category,
        uploadTime: Date.now(),
        originalFile: file,
      };

      const metaToPersist: FileRecord = {
        id: record.id,
        name: record.name,
        extension: record.extension,
        size: record.size,
        category: record.category,
        uploadTime: record.uploadTime,
      };

      // 1. Immediately cache in memory for 0ms UI reactivity
      blobCache.set(id, file);
      try {
        const url = URL.createObjectURL(file);
        urlCache.set(id, url);
      } catch (_) {}

      newRecords.push(record);

      // 2. Persist to IndexedDB asynchronously with timeout safety
      withTimeout(metaStore.setItem(id, metaToPersist), 2500, `metaStore.setItem(${id})`)
        .then(() => console.log(`[FileContext] Metadata persisted for "${file.name}"`))
        .catch((err) => console.warn(`[FileContext] Metadata async storage notice:`, err.message));

      // 3. Persist blob safely with timeout safety
      (async () => {
        try {
          await withTimeout(blobStore.setItem(id, file), 3000, `blobStore.setItem(${id})`);
          console.log(`[FileContext] Blob persisted for "${file.name}"`);
        } catch (_) {
          try {
            const safeBlob = new Blob([await file.arrayBuffer()], {
              type: file.type || 'application/octet-stream',
            });
            await withTimeout(blobStore.setItem(id, safeBlob), 3000, `blobStore.setItem(fallback)`);
            console.log(`[FileContext] Fallback blob persisted for "${file.name}"`);
          } catch (e: any) {
            console.warn(`[FileContext] Blob storage notice for "${file.name}":`, e.message);
          }
        }
      })();
    }

    if (newRecords.length > 0) {
      setFiles((prev) => {
        const updated = [...newRecords, ...prev];
        syncToLocalStorage(updated);
        return updated;
      });
    }
  };

  const deleteFile = async (id: string) => {
    setFiles((prev) => {
      const updated = prev.filter((f) => f.id !== id);
      syncToLocalStorage(updated);
      return updated;
    });

    if (urlCache.has(id)) {
      URL.revokeObjectURL(urlCache.get(id)!);
      urlCache.delete(id);
    }
    blobCache.delete(id);

    withTimeout(metaStore.removeItem(id), 2000, 'metaStore.removeItem')
      .catch((e) => console.warn('[FileContext] metaStore delete notice:', e.message));

    withTimeout(blobStore.removeItem(id), 2000, 'blobStore.removeItem')
      .catch((e) => console.warn('[FileContext] blobStore delete notice:', e.message));
  };

  const getFileById = (id: string): FileRecord | undefined => {
    return files.find((f) => f.id === id);
  };

  const getFileUrl = (id: string): string => {
    if (urlCache.has(id)) return urlCache.get(id)!;

    const blob = blobCache.get(id);
    if (blob) {
      const url = URL.createObjectURL(blob);
      urlCache.set(id, url);
      return url;
    }

    const record = files.find((f) => f.id === id);
    if (record?.originalFile) {
      const url = URL.createObjectURL(record.originalFile);
      urlCache.set(id, url);
      return url;
    }

    return '';
  };

  const getFileBlob = async (id: string): Promise<Blob | null> => {
    // 1. In-memory cache
    if (blobCache.has(id)) return blobCache.get(id)!;

    // 2. FileRecord in memory
    const record = files.find((f) => f.id === id);
    if (record?.originalFile) {
      blobCache.set(id, record.originalFile);
      return record.originalFile;
    }

    // 3. Primary blob store with timeout
    try {
      const blob = await withTimeout(blobStore.getItem<Blob>(id), 2000, `blobStore.getItem(${id})`);
      if (blob) {
        blobCache.set(id, blob);
        return blob;
      }
    } catch (err) {
      console.warn('[FileContext] blobStore.getItem notice:', err);
    }

    // 4. Fallback: check legacy StudyMateAI
    try {
      const smBlob = await getLegacyDbBlob('StudyMateAI', id);
      if (smBlob) {
        blobCache.set(id, smBlob);
        blobStore.setItem(id, smBlob).catch(() => {});
        return smBlob;
      }
    } catch (_) {}

    // 5. Fallback: check legacy CurioSift
    try {
      const curioBlob = await getLegacyDbBlob('CurioSift', id);
      if (curioBlob) {
        blobCache.set(id, curioBlob);
        blobStore.setItem(id, curioBlob).catch(() => {});
        return curioBlob;
      }
    } catch (_) {}

    return null;
  };

  const ensureFileUrl = async (id: string): Promise<string> => {
    const existing = getFileUrl(id);
    if (existing) return existing;

    const blob = await getFileBlob(id);
    if (blob) {
      const url = URL.createObjectURL(blob);
      urlCache.set(id, url);
      return url;
    }
    return '';
  };

  return (
    <FileContext.Provider
      value={{
        files,
        isLoaded,
        addFiles,
        deleteFile,
        getFileById,
        getFileUrl,
        getFileBlob,
        ensureFileUrl,
      }}
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
