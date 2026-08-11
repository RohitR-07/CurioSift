export type ChatRole = 'user' | 'assistant';

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  timestamp: number;
}

export interface AIContext {
  documentId?: string;
  documentName?: string;
  content?: string;
}

export interface AIRequest {
  messages: ChatMessage[];
  context?: AIContext;
}

export interface AIResponse {
  role: ChatRole;
  content: string;
  timestamp: number;
  error?: string;
}
