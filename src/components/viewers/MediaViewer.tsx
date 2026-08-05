import { FileCategory } from '../../context/FileContext';

interface MediaViewerProps {
  url: string;
  category: FileCategory;
  name: string;
}

export function MediaViewer({ url, category, name }: MediaViewerProps) {
  if (category === 'image') {
    return (
      <div className="flex items-center justify-center h-full bg-gray-900 overflow-auto p-4">
        <img src={url} alt={name} className="max-w-full max-h-full object-contain drop-shadow-2xl" />
      </div>
    );
  }

  if (category === 'video') {
    return (
      <div className="flex items-center justify-center h-full bg-black">
        <video controls className="max-w-full max-h-full outline-none">
          <source src={url} />
          Your browser does not support the video tag.
        </video>
      </div>
    );
  }

  if (category === 'audio') {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gray-100 p-8">
        <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl flex flex-col items-center gap-6 border border-border">
          <div className="w-32 h-32 bg-blue-50 rounded-full flex items-center justify-center border-4 border-blue-100 shadow-inner">
             <svg className="w-12 h-12 text-blue-500" fill="currentColor" viewBox="0 0 24 24"><path d="M9 18V5l12-2v13M9 18c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3-1.343-3-3-3zM21 16c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3-1.343-3-3-3z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <h3 className="font-bold text-lg text-text text-center line-clamp-2">{name}</h3>
          <audio controls className="w-full mt-4 outline-none">
            <source src={url} />
            Your browser does not support the audio element.
          </audio>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center h-full bg-gray-50">
      <p className="text-text-secondary font-medium">Preview unavailable</p>
    </div>
  );
}
