import { Router } from 'express';
import { body } from 'express-validator';
import { validateRequest } from '../middleware/validate';
import { OpenAIApi } from 'openai';
import { rateLimit } from 'express-rate-limit';

const router = Router();
const openai = new OpenAIApi({
  apiKey: process.env.OPENAI_API_KEY
});

// Rate limit for AI endpoints: 10 requests per minute
const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { error: 'Too many requests, please try again later.' }
});

router.post(
  '/generate',
  aiLimiter,
  [
    body('section').notEmpty().trim(),
    body('title').notEmpty().trim(),
    validateRequest
  ],
  async (req, res) => {
    try {
      const { section, title } = req.body;
      const userId = req.user.id; // From auth middleware

      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `You are an academic writer specializing in writing research papers in Arabic.`
          },
          {
            role: "user",
            content: `Title: "${title}"\n\nWrite the ${section} section.`
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      });

      res.json({ content: completion.choices[0].message.content });
    } catch (error) {
      console.error('OpenAI API error:', error);
      res.status(500).json({ error: 'Failed to generate content' });
    }
  }
);

router.post(
  '/enhance',
  aiLimiter,
  [
    body('content').notEmpty().trim(),
    validateRequest
  ],
  async (req, res) => {
    try {
      const { content } = req.body;
      const userId = req.user.id;

      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `You are an academic editor. Enhance the following text while maintaining its core meaning.`
          },
          {
            role: "user",
            content: `Enhance this text:\n\n${content}`
          }
        ],
        temperature: 0.3,
        max_tokens: 2000
      });

      res.json({ content: completion.choices[0].message.content });
    } catch (error) {
      console.error('OpenAI API error:', error);
      res.status(500).json({ error: 'Failed to enhance content' });
    }
  }
);

export default router;