import { useState, useCallback } from 'react';
import { AIService } from '../services/ai/aiService';
import type { ChatMessage, AIContext } from '../services/ai/types';

export function useAIChat() {
  const [messagesMap, setMessagesMap] = useState<Record<string, ChatMessage[]>>({});
  const [isTyping, setIsTyping] = useState<Record<string, boolean>>({});
  const [errorMap, setErrorMap] = useState<Record<string, string | null>>({});

  const appendMessage = useCallback((fileId: string, message: ChatMessage) => {
    setMessagesMap(prev => ({
      ...prev,
      [fileId]: [...(prev[fileId] || []), message]
    }));
  }, []);

  const clearChat = useCallback((fileId: string) => {
    setMessagesMap(prev => ({
      ...prev,
      [fileId]: []
    }));
    setErrorMap(prev => ({
      ...prev,
      [fileId]: null
    }));
  }, []);

  const sendMessage = useCallback(async (fileId: string, text: string, context?: AIContext) => {
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2)}`,
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };

    // Add user message to history
    setMessagesMap(prev => {
      const currentHistory = prev[fileId] || [];
      return {
        ...prev,
        [fileId]: [...currentHistory, userMsg]
      };
    });

    setIsTyping(prev => ({ ...prev, [fileId]: true }));
    setErrorMap(prev => ({ ...prev, [fileId]: null }));

    try {
      // Get the updated history by reading from state updater to ensure we have the latest
      // However, we already have currentHistory + userMsg
      const updatedHistory = [...(messagesMap[fileId] || []), userMsg];
      
      const aiResponse = await AIService.generateResponse(updatedHistory, context);
      
      appendMessage(fileId, aiResponse);
    } catch (err) {
      console.error('AI Chat Error:', err);
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred.';
      setErrorMap(prev => ({ ...prev, [fileId]: errorMessage }));
    } finally {
      setIsTyping(prev => ({ ...prev, [fileId]: false }));
    }
  }, [messagesMap, appendMessage]);

  const retry = useCallback(async (fileId: string, context?: AIContext) => {
    // Retry sends the last user message again
    const currentMessages = messagesMap[fileId] || [];
    if (currentMessages.length === 0) return;

    const lastMessage = currentMessages[currentMessages.length - 1];
    if (lastMessage.role !== 'user') return;

    setIsTyping(prev => ({ ...prev, [fileId]: true }));
    setErrorMap(prev => ({ ...prev, [fileId]: null }));

    try {
      const aiResponse = await AIService.generateResponse(currentMessages, context);
      appendMessage(fileId, aiResponse);
    } catch (err) {
      console.error('AI Retry Error:', err);
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred.';
      setErrorMap(prev => ({ ...prev, [fileId]: errorMessage }));
    } finally {
      setIsTyping(prev => ({ ...prev, [fileId]: false }));
    }
  }, [messagesMap, appendMessage]);

  return {
    messagesMap,
    isTyping,
    errorMap,
    sendMessage,
    retry,
    clearChat
  };
}
