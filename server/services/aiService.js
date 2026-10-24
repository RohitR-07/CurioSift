import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config({ path: './server/.env' });

// Initialize the Gemini client only if the key is available
const ai = process.env.GEMINI_API_KEY ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }) : null;

/**
 * Transforms frontend ChatMessage format into Gemini Content format
 */
function formatMessagesForGemini(messages) {
  return messages.map(msg => ({
    role: msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: msg.content }]
  }));
}

/**
 * Generates an AI response using the Gemini API.
 * @param {Array} messages - The conversation history
 * @param {Object} context - Optional context (e.g., document details)
 * @returns {Promise<string>} The AI response text
 */
export async function generateChatResponse(messages, context = null) {
  if (!ai) {
    throw new Error('GEMINI_API_KEY is not configured in the server environment.');
  }

  // Extract the latest message and history
  const history = formatMessagesForGemini(messages.slice(0, -1));
  const latestMessage = messages[messages.length - 1];

  let systemInstruction = `You are StudyMate AI, a helpful, encouraging, and intelligent study assistant. Your goal is to help students learn, summarize documents, explain complex concepts simply, and create study questions.`;

  // Phase 3 Preparation: Inject document context if available
  if (context && context.documentName) {
    systemInstruction += `\n\nYou are currently discussing the document: "${context.documentName}".`;
    if (context.content) {
      systemInstruction += `\nHere is an excerpt from the document:\n"""\n${context.content}\n"""\nUse this context to answer the user's question.`;
    }
  }

  try {
    const chat = ai.chats.create({
      model: process.env.GEMINI_MODEL || "gemini-3.1-flash-lite",
      config: {
        systemInstruction,
        temperature: 0.7,
      },
      history: history
    });

    let response;

for (let attempt = 1; attempt <= 3; attempt++) {
  try {
    response = await chat.sendMessage({
      message: latestMessage.content,
    });
    break;
  } catch (error) {
    if (error.status === 503 && attempt < 3) {
      await new Promise(resolve => setTimeout(resolve, attempt * 2000));
    } else {
      throw error;
    }
  }
}
    return response.text;
  } catch (error) {
    console.error('Error in generateChatResponse:', error);
    throw error;
  }
}
