import { useState, useRef, useEffect } from 'react';
import { AlertTriangle, Book, BrainCircuit, Trash2, RefreshCw } from 'lucide-react';
import { useFiles } from '../context/FileContext';
import { useAIChat } from '../hooks/useAIChat';

import { MaterialSidebar } from '../components/ai-assistant/MaterialSidebar';
import { ChatMessage } from '../components/ai-assistant/ChatMessage';
import { ChatInput } from '../components/ai-assistant/ChatInput';
import { ChatEmptyState } from '../components/ai-assistant/ChatEmptyState';
import { TypingIndicator } from '../components/ai-assistant/TypingIndicator';

export default function AIAssistant() {
  const { files, isLoaded } = useFiles();
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  
  const {
    messagesMap,
    isTyping: isTypingMap,
    errorMap,
    sendMessage,
    retry,
    clearChat
  } = useAIChat();

  const isTyping = selectedFileId ? !!isTypingMap[selectedFileId] : false;
  const apiError = selectedFileId ? errorMap[selectedFileId] : null;

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-select first file if none selected
  useEffect(() => {
    if (isLoaded && files.length > 0 && !selectedFileId) {
      setSelectedFileId(files[0].id);
    }
  }, [isLoaded, files, selectedFileId]);

  // Scroll to bottom when messages change or typing status changes
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messagesMap, isTyping, selectedFileId]);

  const selectedFile = files.find((f) => f.id === selectedFileId);
  const currentMessages = selectedFileId ? messagesMap[selectedFileId] || [] : [];

  const handleSendMessage = (text: string) => {
    if (!selectedFileId) return;
    
    const context = {
      documentId: selectedFile?.id,
      documentName: selectedFile?.name,
    };
    
    sendMessage(selectedFileId, text, context);
  };

  const handleRetry = () => {
    if (!selectedFileId) return;
    const context = {
      documentId: selectedFile?.id,
      documentName: selectedFile?.name,
    };
    retry(selectedFileId, context);
  };

  const handleClearChat = () => {
    if (!selectedFileId) return;
    clearChat(selectedFileId);
  };

  // ── No files uploaded state ────────────────────────────────────────────────
  if (isLoaded && files.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gray-50 p-8 text-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-gray-100 border border-gray-200 flex items-center justify-center">
          <Book className="w-8 h-8 text-gray-400" />
        </div>
        <h2 className="text-xl font-bold text-text">No Study Materials Found</h2>
        <p className="text-text-secondary max-w-md">
          Upload a document from your dashboard first before using the AI Assistant.
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full bg-background overflow-hidden relative">
      {/* ── Left Sidebar (hidden on small mobile, handled by CSS) ────────── */}
      <div className="hidden md:block w-72 shrink-0 h-full">
        <MaterialSidebar 
          files={files} 
          selectedFileId={selectedFileId} 
          onSelectFile={setSelectedFileId} 
        />
      </div>

      {/* ── Main Chat Area ────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 h-full relative">
        {/* Header */}
        <header className="shrink-0 h-16 bg-white border-b border-gray-200 flex items-center px-6 gap-3 z-10 justify-between">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
              <BrainCircuit className="w-4 h-4 text-primary" />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm font-bold text-text truncate">AI Study Assistant</h1>
              <p className="text-[10px] uppercase tracking-widest text-text-secondary font-semibold truncate">
                {selectedFile ? selectedFile.name : 'Ask questions about your study material'}
              </p>
            </div>
          </div>
          
          {selectedFile && currentMessages.length > 0 && (
            <button 
              onClick={handleClearChat}
              className="p-2 text-text-secondary hover:text-danger rounded-lg hover:bg-red-50 transition-colors shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-red-500"
              title="Clear Conversation"
              aria-label="Clear Conversation"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </header>

        {/* Chat Output Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col items-center">
          {currentMessages.length === 0 && selectedFile ? (
            <ChatEmptyState 
              selectedFile={selectedFile} 
              onSelectSuggestion={handleSendMessage} 
            />
          ) : (
            <div className="w-full max-w-4xl flex flex-col gap-6">
              {currentMessages.map((msg) => (
                <ChatMessage key={msg.id} message={msg} />
              ))}
              
              {isTyping && (
                <div className="self-start">
                  <TypingIndicator />
                </div>
              )}

              {apiError && (
                <div className="flex flex-col items-center gap-3 p-4 rounded-xl bg-red-50 border border-red-200 self-center">
                  <div className="flex items-center gap-2 text-red-800">
                    <AlertTriangle className="w-5 h-5 shrink-0" />
                    <p className="text-sm font-medium">{apiError}</p>
                  </div>
                  <button 
                    onClick={handleRetry}
                    className="flex items-center gap-2 px-4 py-1.5 bg-white border border-red-200 rounded-lg text-sm font-medium text-red-700 hover:bg-red-50 hover:border-red-300 transition-colors shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Try Again
                  </button>
                </div>
              )}
              
              {/* Invisible element to scroll to */}
              <div ref={messagesEndRef} className="h-4" />
            </div>
          )}
        </div>

        {/* Chat Input Area */}
        <div className="shrink-0 p-4 bg-white border-t border-gray-200">
          <div className="max-w-4xl mx-auto">
            <ChatInput onSend={handleSendMessage} disabled={isTyping || !selectedFileId} />
            <div className="text-center mt-2">
              <p className="text-[10px] text-text-secondary">
                StudyMate AI can make mistakes. Consider verifying important information.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
