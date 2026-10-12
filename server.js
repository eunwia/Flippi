import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// AI Flashcard Generation Endpoint (Gemini / OpenAI proxy)
app.post('/api/generate-ai', async (req, res) => {
  try {
    const { text, count = 10, apiKey, provider = 'gemini', topic } = req.body;

    const keyToUse = apiKey || process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;

    if (!keyToUse) {
      return res.status(400).json({
        error: 'No API key provided. Please configure a Gemini API key in Settings or your server .env file.',
        requiresKey: true,
      });
    }

    if (!text || text.trim().length < 20) {
      return res.status(400).json({
        error: 'Text is too short or empty to generate flashcards from.',
      });
    }

    // Limit text length to avoid token limits
    const truncatedText = text.slice(0, 15000);

    const prompt = `You are a friendly, expert study tutor creating flashcards for students.
Analyze the following study material and generate exactly ${count} clear, high-yield, high-quality question-and-answer flashcards.

Study Material:
"""
${truncatedText}
"""

Instructions:
1. Identify key definitions, terms, major concepts, mechanisms, and important takeaways.
2. Formulate clear, concise questions that test active recall.
3. Formulate clear, accurate, easy-to-understand answers.
4. Provide a difficulty tag ("Easy", "Medium", or "Hard") for each card.
5. Provide a short subtopic/category for each card.
6. Return ONLY valid JSON as an array of objects matching this exact schema:
[
  {
    "question": "What is ...?",
    "answer": "...",
    "category": "...",
    "difficulty": "Easy" | "Medium" | "Hard"
  }
]
Do not wrap in markdown code blocks if possible, or use standard \`\`\`json blocks.`;

    if (provider === 'gemini') {
      // Use Gemini API
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${keyToUse}`;
      
      const response = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.4,
            responseMimeType: 'application/json',
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return res.status(response.status).json({
          error: errorData.error?.message || `Gemini API error (${response.status})`,
        });
      }

      const data = await response.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) {
        throw new Error('No content returned from Gemini');
      }

      let parsedCards = [];
      try {
        const cleaned = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
        parsedCards = JSON.parse(cleaned);
      } catch (err) {
        throw new Error('Failed to parse AI output into flashcards JSON: ' + err.message);
      }

      return res.json({ success: true, cards: parsedCards, provider: 'gemini' });
    } else {
      // OpenAI-compatible fallback
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${keyToUse}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'You are an educational tutor that outputs JSON arrays of flashcards.' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.4,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return res.status(response.status).json({
          error: errorData.error?.message || `OpenAI API error (${response.status})`,
        });
      }

      const data = await response.json();
      const rawText = data.choices?.[0]?.message?.content;
      const cleaned = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsedCards = JSON.parse(cleaned);
      return res.json({ success: true, cards: parsedCards, provider: 'openai' });
    }
  } catch (error) {
    console.error('AI Generation error:', error);
    res.status(500).json({ error: error.message || 'Internal server error while generating cards.' });
  }
});

// Serve frontend build if dist exists
const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.use((req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`🌸 Flippi Flashcard Server running on http://localhost:${PORT}`);
});
