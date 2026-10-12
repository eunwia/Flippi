/**
 * Flashcard Generation Utility
 * Features:
 * 1. Smart Local NLP / Heuristic Extractor (100% offline, immediate, rule-based)
 * 2. AI Generator (Gemini / OpenAI proxy through backend or direct key)
 */

export async function generateFlashcards({
  text,
  count = 10,
  mode = 'smart', // 'smart' | 'ai'
  apiKey = '',
  provider = 'gemini',
  topic = '',
  onStatus = () => {},
}) {
  if (!text || text.trim().length < 20) {
    throw new Error('Please provide at least a paragraph of text to generate flashcards.');
  }

  if (mode === 'ai') {
    onStatus('Contacting AI Tutor to analyze material...');
    try {
      const cards = await generateWithAI({ text, count, apiKey, provider, topic });
      if (cards && cards.length > 0) {
        return cards;
      }
      throw new Error('AI returned an empty list of cards.');
    } catch (aiErr) {
      console.warn('AI generation failed, falling back to smart local extractor:', aiErr);
      onStatus('AI unavailable (' + (aiErr.message || 'error') + '). Using Smart Local Extractor...');
      // Fallback seamlessly to local extractor
      const localCards = generateSmartLocalCards(text, count, topic);
      return localCards.map(c => ({
        ...c,
        hint: c.hint ? `${c.hint} (Local Extractor)` : '(Smart Local Extractor)',
      }));
    }
  }

  // Default: Smart Local Extractor
  onStatus('Analyzing text structures, definitions, and key concepts...');
  const cards = generateSmartLocalCards(text, count, topic);
  return cards;
}

/**
 * AI-powered generator using backend proxy or direct client call
 */
async function generateWithAI({ text, count, apiKey, provider = 'gemini', topic = '' }) {
  // Try local backend proxy first
  try {
    const res = await fetch('/api/generate-ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, count, apiKey, provider, topic }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.cards && Array.isArray(data.cards)) {
        return normalizeCards(data.cards, topic);
      }
    } else {
      const errData = await res.json().catch(() => ({}));
      if (errData.requiresKey && !apiKey) {
        throw new Error('Please enter a Gemini API Key in Settings to use AI mode.');
      }
      throw new Error(errData.error || `Server responded with ${res.status}`);
    }
  } catch (err) {
    // If backend isn't reachable (e.g. running Vite preview without server), try direct Gemini call if user provided apiKey
    if (apiKey && provider === 'gemini') {
      return await generateDirectGemini(text, count, apiKey, topic);
    }
    throw err;
  }
}

/**
 * Direct Gemini client call if server is not active
 */
async function generateDirectGemini(text, count, apiKey, topic) {
  const truncatedText = text.slice(0, 15000);
  const prompt = `You are an educational study assistant. Analyze the study text below and generate ${count} high-yield flashcards.
Text:
"""
${truncatedText}
"""
Respond strictly in JSON format as an array of objects:
[
  {
    "question": "Clear, active recall question?",
    "answer": "Accurate, concise explanation.",
    "category": "${topic || 'General'}",
    "difficulty": "Easy" | "Medium" | "Hard"
  }
]`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.3,
        responseMimeType: 'application/json',
      },
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Gemini API error: ${response.status}`);
  }

  const data = await response.json();
  const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
  const cleaned = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
  const cards = JSON.parse(cleaned);
  return normalizeCards(cards, topic);
}

/**
 * Smart Local Heuristic NLP Extractor
 * Extracts definitions, key concepts, bullet facts, and question patterns without external APIs.
 */
export function generateSmartLocalCards(rawText, targetCount = 10, defaultTopic = '') {
  const cards = [];
  const seenQuestions = new Set();

  // Normalize text lines
  const lines = rawText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  // 1. Extract Colon and Hyphen Term-Definition pairs
  // e.g. "Mitochondria: The powerhouse of the cell generating ATP"
  for (const line of lines) {
    if (line.length < 15 || line.length > 400) continue;

    // Pattern: Term: Definition
    const colonMatch = line.match(/^([A-Za-z0-9\s\-()]{3,45})\s*:\s*(.{15,})$/);
    if (colonMatch) {
      const term = colonMatch[1].trim();
      const def = colonMatch[2].trim();
      if (isValidTerm(term) && !seenQuestions.has(term.toLowerCase())) {
        seenQuestions.add(term.toLowerCase());
        cards.push({
          id: generateCardId(),
          question: `What is ${term}?`,
          answer: def,
          category: defaultTopic || guessCategory(line),
          difficulty: def.length > 120 ? 'Hard' : def.length > 60 ? 'Medium' : 'Easy',
          source: 'Definition Pattern',
        });
      }
      continue;
    }

    // Pattern: Term - Definition (with en-dash, em-dash, or hyphen)
    const dashMatch = line.match(/^([A-Za-z0-9\s()]{3,45})\s*[-—–]\s*(.{15,})$/);
    if (dashMatch) {
      const term = dashMatch[1].trim();
      const def = dashMatch[2].trim();
      if (isValidTerm(term) && !seenQuestions.has(term.toLowerCase())) {
        seenQuestions.add(term.toLowerCase());
        cards.push({
          id: generateCardId(),
          question: `Define: ${term}`,
          answer: def,
          category: defaultTopic || guessCategory(line),
          difficulty: def.length > 120 ? 'Hard' : 'Medium',
          source: 'Term-Dash Pattern',
        });
      }
    }
  }

  // 2. Extract Sentences with Definitional Verbs
  // e.g. "X is defined as...", "X refers to...", "X means...", "X is a..."
  const fullText = rawText.replace(/\s+/g, ' ');
  const sentenceRegex = /([^.?!]+[.?!])/g;
  const sentences = fullText.match(sentenceRegex) || [];

  for (const sentenceRaw of sentences) {
    const s = sentenceRaw.trim();
    if (s.length < 25 || s.length > 300) continue;

    // "X is defined as Y"
    const defMatch = s.match(/^([A-Z][a-zA-Z0-9\s\-]{2,40})\s+(?:is|are)\s+defined\s+as\s+([^.?!]+)/i);
    if (defMatch) {
      const term = defMatch[1].trim();
      const def = defMatch[2].trim();
      const qKey = term.toLowerCase();
      if (!seenQuestions.has(qKey)) {
        seenQuestions.add(qKey);
        cards.push({
          id: generateCardId(),
          question: `How is "${term}" defined?`,
          answer: capitalize(def) + '.',
          category: defaultTopic || 'Concepts',
          difficulty: 'Medium',
          source: 'Definitional Rule',
        });
        continue;
      }
    }

    // "X refers to Y"
    const refersMatch = s.match(/^([A-Z][a-zA-Z0-9\s\-]{2,40})\s+refers\s+to\s+([^.?!]+)/i);
    if (refersMatch) {
      const term = refersMatch[1].trim();
      const def = refersMatch[2].trim();
      const qKey = term.toLowerCase();
      if (!seenQuestions.has(qKey)) {
        seenQuestions.add(qKey);
        cards.push({
          id: generateCardId(),
          question: `What does "${term}" refer to?`,
          answer: capitalize(def) + '.',
          category: defaultTopic || 'Concepts',
          difficulty: 'Medium',
          source: 'Reference Pattern',
        });
        continue;
      }
    }

    // "The primary function of X is Y" or "The main purpose of X is Y"
    const funcMatch = s.match(/(?:The|A)\s+(?:primary|main|key|essential)\s+(?:function|purpose|role|goal)\s+of\s+([a-zA-Z0-9\s\-]{3,40})\s+is\s+([^.?!]+)/i);
    if (funcMatch) {
      const term = funcMatch[1].trim();
      const role = funcMatch[2].trim();
      const qKey = `func_${term.toLowerCase()}`;
      if (!seenQuestions.has(qKey)) {
        seenQuestions.add(qKey);
        cards.push({
          id: generateCardId(),
          question: `What is the primary function of ${term}?`,
          answer: `To ${role.replace(/^to\s+/i, '')}.`,
          category: defaultTopic || 'Functions',
          difficulty: 'Medium',
          source: 'Function Rule',
        });
        continue;
      }
    }

    // "X consists of Y" or "X is composed of Y"
    const composedMatch = s.match(/^([A-Z][a-zA-Z0-9\s\-]{2,40})\s+(?:consists of|is composed of|is divided into)\s+([^.?!]+)/i);
    if (composedMatch) {
      const term = composedMatch[1].trim();
      const parts = composedMatch[2].trim();
      const qKey = `comp_${term.toLowerCase()}`;
      if (!seenQuestions.has(qKey)) {
        seenQuestions.add(qKey);
        cards.push({
          id: generateCardId(),
          question: `What are the main components of ${term}?`,
          answer: `It consists of ${parts}.`,
          category: defaultTopic || 'Structure',
          difficulty: 'Hard',
          source: 'Composition Rule',
        });
        continue;
      }
    }

    // "X is an/a [Noun] that/which [Action]"
    const isNounMatch = s.match(/^([A-Z][a-zA-Z0-9\s\-]{2,35})\s+is\s+(?:an?|the)\s+([a-zA-Z\s]{4,30})\s+(?:that|which|used to)\s+([^.?!]+)/i);
    if (isNounMatch) {
      const term = isNounMatch[1].trim();
      const type = isNounMatch[2].trim();
      const desc = isNounMatch[3].trim();
      const qKey = term.toLowerCase();
      if (!seenQuestions.has(qKey)) {
        seenQuestions.add(qKey);
        cards.push({
          id: generateCardId(),
          question: `What is ${term}?`,
          answer: `${capitalize(type)} that ${desc}.`,
          category: defaultTopic || 'Vocabulary',
          difficulty: 'Easy',
          source: 'Noun Class Rule',
        });
        continue;
      }
    }
  }

  // 3. Extract High-Yield Sentences with Academic Signal Words
  // (e.g. "Because of X...", "The major difference between X and Y is Z")
  const signalKeywords = [
    'crucial', 'essential', 'fundamental', 'characteristic',
    'mechanism', 'advantage', 'disadvantage', 'distinction',
    'principle', 'consequence', 'process', 'stage', 'phase'
  ];

  for (const sentenceRaw of sentences) {
    if (cards.length >= targetCount * 2) break;
    const s = sentenceRaw.trim();
    if (s.length < 35 || s.length > 250) continue;

    const lower = s.toLowerCase();
    const hasSignal = signalKeywords.some((word) => lower.includes(word));

    if (hasSignal) {
      // Find difference or contrast
      if (lower.includes('difference between') || lower.includes('in contrast to')) {
        const diffKey = s.slice(0, 40).toLowerCase();
        if (!seenQuestions.has(diffKey)) {
          seenQuestions.add(diffKey);
          cards.push({
            id: generateCardId(),
            question: `Explain the key distinction described in this concept:`,
            answer: s,
            category: defaultTopic || 'Distinctions',
            difficulty: 'Hard',
            source: 'Comparison',
          });
          continue;
        }
      }

      // Convert signal sentence to active inquiry
      const firstComma = s.indexOf(',');
      if (firstComma > 10 && firstComma < 60) {
        const clause = s.substring(0, firstComma).trim();
        const rest = s.substring(firstComma + 1).trim();
        const key = clause.toLowerCase();
        if (!seenQuestions.has(key)) {
          seenQuestions.add(key);
          cards.push({
            id: generateCardId(),
            question: `In the context of "${clause}", what is significant?`,
            answer: capitalize(rest),
            category: defaultTopic || 'Core Principles',
            difficulty: 'Medium',
            source: 'Key Principle',
          });
          continue;
        }
      }
    }
  }

  // 4. Fallback: If still under target count, pull paragraphs / bullet points
  if (cards.length < targetCount) {
    for (const line of lines) {
      if (cards.length >= targetCount) break;
      if (line.length >= 40 && line.length <= 250 && !line.startsWith('#')) {
        const cleanLine = line.replace(/^[•\-\*\d\.\)]\s*/, '').trim();
        const qKey = cleanLine.slice(0, 30).toLowerCase();
        if (!seenQuestions.has(qKey)) {
          seenQuestions.add(qKey);
          cards.push({
            id: generateCardId(),
            question: `Explain this key concept: "${cleanLine.slice(0, 50)}..."`,
            answer: cleanLine,
            category: defaultTopic || 'Key Points',
            difficulty: 'Easy',
            source: 'Key Point',
          });
        }
      }
    }
  }

  // Return formatted & trimmed to requested target count
  return cards.slice(0, targetCount);
}

function isValidTerm(term) {
  if (!term || term.length < 2 || term.length > 50) return false;
  // Discard generic line numbers, "Page 1", etc.
  if (/^(page|chapter|section|figure|table)\s*\d+$/i.test(term)) return false;
  return true;
}

function guessCategory(str) {
  const lower = str.toLowerCase();
  if (lower.includes('cell') || lower.includes('bio') || lower.includes('organ') || lower.includes('dna')) return 'Biology';
  if (lower.includes('code') || lower.includes('function') || lower.includes('data') || lower.includes('api')) return 'Computer Science';
  if (lower.includes('history') || lower.includes('war') || lower.includes('century') || lower.includes('empire')) return 'History';
  if (lower.includes('math') || lower.includes('equation') || lower.includes('formula') || lower.includes('theorem')) return 'Mathematics';
  if (lower.includes('spanish') || lower.includes('french') || lower.includes('verb') || lower.includes('vocab')) return 'Languages';
  return 'Study Notes';
}

function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function generateCardId() {
  return 'card_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now().toString(36);
}

function normalizeCards(cards, fallbackCategory = 'General') {
  return cards.map((c, idx) => ({
    id: c.id || generateCardId(),
    question: (c.question || `Question #${idx + 1}`).trim(),
    answer: (c.answer || 'Answer details.').trim(),
    category: (c.category || fallbackCategory || 'Key Concept').trim(),
    difficulty: ['Easy', 'Medium', 'Hard'].includes(c.difficulty) ? c.difficulty : 'Medium',
    source: c.source || 'AI Tutor',
  }));
}
