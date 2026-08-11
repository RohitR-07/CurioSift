/// <reference types="vite/client" />
import type { ChatMessage, AIContext, AIRequest, AIResponse } from './types';

// Connects to our local Express backend using the Vite proxy
// Fallback to absolute URL if needed in other setups, but proxy is preferred
const API_URL = import.meta.env.VITE_AI_API_URL || '/api/chat';

export class AIService {
  /**
   * Generates a response from the AI backend.
   * @param messages The conversation history
   * @param context Optional document context for RAG
   * @returns A promise that resolves to the generated ChatMessage
   */
  static async generateResponse(messages: ChatMessage[], context?: AIContext): Promise<ChatMessage> {
    try {
      const payload: AIRequest = {
        messages,
        context,
      };

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        let errorMessage = 'Failed to generate AI response.';
        try {
          const errorData = await response.json();
          if (errorData.error) {
            errorMessage = errorData.error;
          }
        } catch (e) {
          // Fallback if not JSON
        }
        
        throw new Error(errorMessage);
      }

      const data: AIResponse = await response.json();

      return {
        id: `${Date.now()}-${Math.random().toString(36).substring(2)}`,
        role: data.role,
        content: data.content,
        timestamp: data.timestamp || Date.now(),
      };
    } catch (error) {
      console.error('AIService Error:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected network error occurred. Please check your connection and try again.');
    }
  }
}
