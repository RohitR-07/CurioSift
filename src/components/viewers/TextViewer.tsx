import { useEffect, useState } from 'react';
import { Loader2, AlertTriangle } from 'lucide-react';

interface TextViewerProps {
  url: string;
  extension: string;
}

export function TextViewer({ url, extension }: TextViewerProps) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const fetchText = async () => {
      try {
        setLoading(true);
        setError(false);
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const text = await res.text();
        if (!cancelled) setContent(text);
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchText();
    return () => { cancelled = true; };
  }, [url]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-white gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm font-medium text-text-secondary">Loading document…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-white p-8 text-center gap-4">
        <AlertTriangle className="w-12 h-12 text-amber-400" />
        <h3 className="text-lg font-bold text-text">Unable to preview this file</h3>
        <p className="text-text-secondary max-w-sm">
          The file content could not be loaded. It may be in a format that cannot be displayed as text.
        </p>
      </div>
    );
  }

  // Render CSV as a simple table if possible
  if (extension === 'csv') {
    const rows = content.split('\n').filter(r => r.trim());
    const parsed = rows.map(row => {
      // Simple CSV split (handles quoted commas naively)
      const cells: string[] = [];
      let current = '';
      let inQuote = false;
      for (const ch of row) {
        if (ch === '"') { inQuote = !inQuote; }
        else if (ch === ',' && !inQuote) { cells.push(current); current = ''; }
        else { current += ch; }
      }
      cells.push(current);
      return cells;
    });

    return (
      <div className="h-full overflow-auto bg-gray-50">
        <div className="min-w-max p-4">
          <table className="text-sm border-collapse bg-white shadow-sm rounded-xl overflow-hidden">
            <thead>
              {parsed[0] && (
                <tr>
                  {parsed[0].map((cell, i) => (
                    <th
                      key={i}
                      className="px-4 py-2.5 text-left font-bold text-text bg-gray-100 border border-gray-200 whitespace-nowrap"
                    >
                      {cell.replace(/^"|"$/g, '')}
                    </th>
                  ))}
                </tr>
              )}
            </thead>
            <tbody>
              {parsed.slice(1).map((row, ri) => (
                <tr key={ri} className="hover:bg-blue-50 transition-colors">
                  {row.map((cell, ci) => (
                    <td
                      key={ci}
                      className="px-4 py-2 text-text-secondary border border-gray-100 whitespace-nowrap"
                    >
                      {cell.replace(/^"|"$/g, '')}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {parsed.length === 0 && (
            <p className="text-text-secondary p-4">This CSV file appears to be empty.</p>
          )}
        </div>
      </div>
    );
  }

  // Render Markdown as plain text with basic formatting cues
  return (
    <div className="h-full overflow-auto bg-white">
      <pre
        className={[
          'p-6 md:p-10 whitespace-pre-wrap break-words leading-relaxed text-text',
          extension === 'md' ? 'font-mono text-sm' : 'font-sans text-sm',
        ].join(' ')}
        style={{ fontFamily: extension === 'md' ? 'ui-monospace, SFMono-Regular, Menlo, monospace' : 'inherit' }}
      >
        {content}
      </pre>
    </div>
  );
}
