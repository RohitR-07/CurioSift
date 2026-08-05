import { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn';

interface XlsxViewerProps {
  url: string;
}

export function XlsxViewer({ url }: XlsxViewerProps) {
  const [html, setHtml] = useState<string>('');
  const [sheets, setSheets] = useState<string[]>([]);
  const [activeSheet, setActiveSheet] = useState<string>('');
  const [workbook, setWorkbook] = useState<XLSX.WorkBook | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const loadXlsx = async () => {
      try {
        setLoading(true);
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        const wb = XLSX.read(arrayBuffer, { type: 'array' });
        
        setWorkbook(wb);
        setSheets(wb.SheetNames);
        if (wb.SheetNames.length > 0) {
          setActiveSheet(wb.SheetNames[0]);
        }
      } catch (err) {
        console.error('Error parsing XLSX:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    loadXlsx();
  }, [url]);

  useEffect(() => {
    if (workbook && activeSheet) {
      const ws = workbook.Sheets[activeSheet];
      const htmlStr = XLSX.utils.sheet_to_html(ws, { id: 'spreadsheet-table' });
      setHtml(htmlStr);
    }
  }, [workbook, activeSheet]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 gap-3 bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm font-medium text-text-secondary">Parsing Spreadsheet...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50 p-4">
        <div className="p-8 text-center text-danger bg-red-50 rounded-xl border border-red-200">
          <p className="font-bold">Failed to parse spreadsheet.</p>
          <p className="text-sm mt-1">Preview unavailable.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden">
      {/* Sheet Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto border-b border-border p-2 bg-gray-50 shrink-0 scrollbar-hide">
        {sheets.map(sheet => (
          <button
            key={sheet}
            onClick={() => setActiveSheet(sheet)}
            className={cn(
              "px-4 py-2 rounded-t-lg text-sm font-semibold transition-colors whitespace-nowrap border-b-2",
              activeSheet === sheet 
                ? "bg-white text-primary border-primary shadow-sm" 
                : "text-text-secondary border-transparent hover:bg-gray-200"
            )}
          >
            {sheet}
          </button>
        ))}
      </div>

      {/* Table Container */}
      <div className="flex-1 overflow-auto p-4 bg-white relative">
        <style dangerouslySetInnerHTML={{__html: `
          #spreadsheet-table { border-collapse: collapse; width: 100%; font-size: 13px; }
          #spreadsheet-table td, #spreadsheet-table th { border: 1px solid #E2E8F0; padding: 6px 12px; }
          #spreadsheet-table tr:first-child { font-weight: bold; background: #F8FAFC; }
        `}} />
        <div dangerouslySetInnerHTML={{ __html: html }} className="min-w-max" />
      </div>
    </div>
  );
}
