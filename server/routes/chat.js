import express from 'express';
import { generateChatResponse } from '../services/aiService.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { messages, context } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required and cannot be empty.' });
    }

    const responseContent = await generateChatResponse(messages, context);
    
    res.json({
      role: 'assistant',
      content: responseContent,
      timestamp: Date.now()
    });

  } catch (error) {
    console.error('Chat API Error:', error);
    
    // Check for specific error types if needed, but return generic to client for security
    const statusCode = error.status || 500;
    res.status(statusCode).json({ error: 'Failed to generate AI response. Please try again.' });
  }
});

export default router;
