import { useEffect, useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Loader2 } from 'lucide-react';

interface CodeViewerProps {
  url: string;
  extension: string;
}

export function CodeViewer({ url, extension }: CodeViewerProps) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchCode = async () => {
      try {
        setLoading(true);
        const res = await fetch(url);
        const text = await res.text();
        setContent(text);
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchCode();
  }, [url]);

  const getLanguage = (ext: string) => {
    const map: Record<string, string> = {
      js: 'javascript',
      jsx: 'jsx',
      ts: 'typescript',
      tsx: 'tsx',
      py: 'python',
      java: 'java',
      cpp: 'cpp',
      c: 'c',
      cs: 'csharp',
      html: 'html',
      css: 'css',
      json: 'json',
      md: 'markdown',
      xml: 'xml',
      txt: 'plaintext',
      csv: 'csv'
    };
    return map[ext] || 'plaintext';
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 gap-3 bg-gray-900">
        <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50 p-4">
        <div className="p-8 text-center text-danger bg-red-50 rounded-xl border border-red-200">
          <p className="font-bold">Failed to load code file.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-[#1E1E1E] overflow-auto">
      <SyntaxHighlighter 
        language={getLanguage(extension)} 
        style={vscDarkPlus} 
        customStyle={{ margin: 0, padding: '1.5rem', background: 'transparent', fontSize: '14px' }}
        showLineNumbers
      >
        {content}
      </SyntaxHighlighter>
    </div>
  );
}
