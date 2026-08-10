import { useState, useRef, useEffect } from 'react';
import { AlertTriangle, Book, BrainCircuit } from 'lucide-react';
import { useFiles } from '../context/FileContext';

import { MaterialSidebar } from '../components/ai-assistant/MaterialSidebar';
import { ChatMessage } from '../components/ai-assistant/ChatMessage';
import { ChatInput } from '../components/ai-assistant/ChatInput';
import { ChatEmptyState } from '../components/ai-assistant/ChatEmptyState';
import { TypingIndicator } from '../components/ai-assistant/TypingIndicator';

import type { ChatMessage as ChatMessageType } from '../types/chat';

export default function AIAssistant() {
  const { files, isLoaded } = useFiles();
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  
  // State for messages per file
  // In a real app this might be persisted, but Phase 1 uses mock memory state
  const [messagesMap, setMessagesMap] = useState<Record<string, ChatMessageType[]>>({});
  const [isTyping, setIsTyping] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

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

  const handleSendMessage = async (text: string) => {
    if (!selectedFileId) return;

    // 1. Add user message
    const userMsg: ChatMessageType = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2)}`,
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };

    setMessagesMap((prev) => ({
      ...prev,
      [selectedFileId]: [...(prev[selectedFileId] || []), userMsg],
    }));

    setApiError(null);
    setIsTyping(true);

    // 2. Mock API delay
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      // 3. Add AI mock response
      const aiMsg: ChatMessageType = {
        id: `${Date.now()}-${Math.random().toString(36).substring(2)}`,
        role: 'assistant',
        content: `Based on your selected study material, here's a helpful explanation of the concept you asked about.\n\nThis is currently a mock response for Module 6 Phase 1. Real AI integration will be added in a later phase.`,
        timestamp: Date.now(),
      };

      setMessagesMap((prev) => ({
        ...prev,
        [selectedFileId]: [...(prev[selectedFileId] || []), aiMsg],
      }));
    } catch (err) {
      setApiError('Something went wrong generating the AI response. Please try again.');
    } finally {
      setIsTyping(false);
    }
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
        <header className="shrink-0 h-16 bg-white border-b border-gray-200 flex items-center px-6 gap-3 z-10">
          <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center">
            <BrainCircuit className="w-4 h-4 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-sm font-bold text-text truncate">AI Study Assistant</h1>
            <p className="text-[10px] uppercase tracking-widest text-text-secondary font-semibold truncate">
              {selectedFile ? selectedFile.name : 'Ask questions about your study material'}
            </p>
          </div>
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
                <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 border border-red-200 self-center">
                  <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
                  <p className="text-sm font-medium text-red-800">{apiError}</p>
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
                AI Assistant uses mock responses for Module 6 Phase 1.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
