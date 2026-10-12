/**
 * Flippi Storage and State Management
 * Persistent storage via localStorage with default sample sets and backup/restore.
 */

const STORAGE_KEYS = {
  SETS: 'flippi_study_sets_v1',
  SETTINGS: 'flippi_user_settings_v1',
  STATS: 'flippi_study_stats_v1',
};

// Initial Sample Study Sets for first-time users
export const SAMPLE_SETS = [
  {
    id: 'set_sample_bio_101',
    title: 'Biology 101: Cell Biology & Mitosis 🌿',
    description: 'Core concepts of cell structures, organelles, membrane dynamics, and mitotic stages.',
    subject: 'Science',
    icon: '🌿',
    theme: 'sage',
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
    lastStudiedAt: new Date(Date.now() - 3600000).toISOString(),
    cards: [
      {
        id: 'bio_c1',
        question: 'What is the primary function of the Mitochondria?',
        answer: 'Known as the "powerhouse of the cell," it generates most of the chemical energy needed through cellular respiration in the form of ATP.',
        category: 'Organelles',
        difficulty: 'Easy',
        mastered: true,
        needsPractice: false,
        starred: false,
        timesReviewed: 4,
      },
      {
        id: 'bio_c2',
        question: 'What is the role of Ribosomes in the cell?',
        answer: 'Ribosomes are responsible for protein synthesis. They translate messenger RNA (mRNA) sequences into amino acid polypeptide chains.',
        category: 'Organelles',
        difficulty: 'Medium',
        mastered: false,
        needsPractice: true,
        starred: true,
        timesReviewed: 3,
      },
      {
        id: 'bio_c3',
        question: 'What occurs during the Metaphase stage of Mitosis?',
        answer: 'Sister chromatids line up along the cell equator (the metaphase plate) attached to spindle fibers at their kinetochores.',
        category: 'Cell Cycle',
        difficulty: 'Medium',
        mastered: true,
        needsPractice: false,
        starred: false,
        timesReviewed: 2,
      },
      {
        id: 'bio_c4',
        question: 'How does Passive Transport differ from Active Transport?',
        answer: 'Passive transport moves molecules down their concentration gradient without energy consumption (ATP), while active transport pumps substances against their gradient using ATP.',
        category: 'Membrane Transport',
        difficulty: 'Hard',
        mastered: false,
        needsPractice: true,
        starred: true,
        timesReviewed: 5,
      },
      {
        id: 'bio_c5',
        question: 'What is the function of the Golgi Apparatus?',
        answer: 'It modifies, sorts, and packages proteins and lipids received from the endoplasmic reticulum for secretion or internal delivery.',
        category: 'Organelles',
        difficulty: 'Medium',
        mastered: true,
        needsPractice: false,
        starred: false,
        timesReviewed: 2,
      },
      {
        id: 'bio_c6',
        question: 'What is Osmosis?',
        answer: 'The passive movement of water molecules through a selectively permeable membrane from an area of higher water potential to lower water potential.',
        category: 'Membrane Transport',
        difficulty: 'Easy',
        mastered: true,
        needsPractice: false,
        starred: false,
        timesReviewed: 3,
      },
      {
        id: 'bio_c7',
        question: 'What occurs during Anaphase?',
        answer: 'Sister chromatids are separated at their centromeres and pulled to opposite poles of the dividing cell by shortening spindle microtubules.',
        category: 'Cell Cycle',
        difficulty: 'Medium',
        mastered: false,
        needsPractice: false,
        starred: false,
        timesReviewed: 1,
      },
      {
        id: 'bio_c8',
        question: 'What is the function of Lysosomes?',
        answer: 'They contain acidic hydrolytic enzymes that break down cellular waste, debris, foreign pathogens, and worn-out cell parts (autophagy).',
        category: 'Organelles',
        difficulty: 'Hard',
        mastered: false,
        needsPractice: true,
        starred: false,
        timesReviewed: 2,
      },
    ],
  },
  {
    id: 'set_sample_spanish_101',
    title: 'Spanish Essentials: Travel & Dining ☕',
    description: 'Common phrases, polite inquiries, and dining vocabulary for student travelers.',
    subject: 'Languages',
    icon: '☕',
    theme: 'blush',
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    lastStudiedAt: new Date(Date.now() - 86400000).toISOString(),
    cards: [
      {
        id: 'sp_c1',
        question: 'How do you ask "Where is the bathroom?" in Spanish?',
        answer: '¿Dónde está el baño?',
        category: 'Questions',
        difficulty: 'Easy',
        mastered: true,
        needsPractice: false,
        starred: false,
        timesReviewed: 5,
      },
      {
        id: 'sp_c2',
        question: 'How do you politely ask for the restaurant bill?',
        answer: 'La cuenta, por favor.',
        category: 'Dining',
        difficulty: 'Easy',
        mastered: true,
        needsPractice: false,
        starred: false,
        timesReviewed: 4,
      },
      {
        id: 'sp_c3',
        question: 'What does "Mucho gusto" mean?',
        answer: 'Nice to meet you (literally "Much pleasure").',
        category: 'Greetings',
        difficulty: 'Easy',
        mastered: true,
        needsPractice: false,
        starred: false,
        timesReviewed: 3,
      },
      {
        id: 'sp_c4',
        question: 'Translate: "¿Podría traerme un vaso de agua, por favor?"',
        answer: 'Could you bring me a glass of water, please?',
        category: 'Dining',
        difficulty: 'Medium',
        mastered: false,
        needsPractice: true,
        starred: true,
        timesReviewed: 3,
      },
      {
        id: 'sp_c5',
        question: 'What does "Disculpe, ¿a qué hora abre el museo?" translate to?',
        answer: 'Excuse me, what time does the museum open?',
        category: 'Travel',
        difficulty: 'Medium',
        mastered: false,
        needsPractice: true,
        starred: false,
        timesReviewed: 2,
      },
      {
        id: 'sp_c6',
        question: 'How do you say "Have a good trip!" in Spanish?',
        answer: '¡Buen viaje!',
        category: 'Travel',
        difficulty: 'Easy',
        mastered: true,
        needsPractice: false,
        starred: false,
        timesReviewed: 2,
      },
      {
        id: 'sp_c7',
        question: 'Translate: "¿Cuánto cuesta esto?"',
        answer: 'How much does this cost?',
        category: 'Shopping',
        difficulty: 'Easy',
        mastered: true,
        needsPractice: false,
        starred: false,
        timesReviewed: 4,
      },
      {
        id: 'sp_c8',
        question: 'What is the distinction between "Por favor" and "De nada"?',
        answer: '"Por favor" means "Please", while "De nada" means "You\'re welcome" (literally "of nothing").',
        category: 'Courtesy',
        difficulty: 'Easy',
        mastered: true,
        needsPractice: false,
        starred: false,
        timesReviewed: 3,
      },
    ],
  },
  {
    id: 'set_sample_webdev_101',
    title: 'Computer Science: Web Basics 💻',
    description: 'Foundational concepts of HTTP, DNS, APIs, and modern frontend architecture.',
    subject: 'Technology',
    icon: '💻',
    theme: 'lavender',
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    lastStudiedAt: null,
    cards: [
      {
        id: 'cs_c1',
        question: 'What is the difference between HTTP and HTTPS?',
        answer: 'HTTPS is encrypted using Transport Layer Security (TLS/SSL), protecting transmitted data from eavesdropping and tampering, whereas standard HTTP sends plaintext.',
        category: 'Networking',
        difficulty: 'Easy',
        mastered: false,
        needsPractice: false,
        starred: true,
        timesReviewed: 1,
      },
      {
        id: 'cs_c2',
        question: 'What is the role of a DNS (Domain Name System)?',
        answer: 'DNS serves as the phonebook of the internet, translating human-friendly domain names (e.g., flippi.app) into machine-routable IP addresses (e.g., 192.0.2.1).',
        category: 'Networking',
        difficulty: 'Easy',
        mastered: false,
        needsPractice: true,
        starred: false,
        timesReviewed: 2,
      },
      {
        id: 'cs_c3',
        question: 'What is a REST API?',
        answer: 'Representational State Transfer: an architectural style for web services using standard HTTP verbs (GET, POST, PUT, DELETE) to manage resources.',
        category: 'Web Architecture',
        difficulty: 'Medium',
        mastered: false,
        needsPractice: false,
        starred: false,
        timesReviewed: 1,
      },
      {
        id: 'cs_c4',
        question: 'What is the CSS Box Model composed of?',
        answer: 'From inside out: Content, Padding (space inside border), Border, and Margin (space outside border around other elements).',
        category: 'Frontend',
        difficulty: 'Easy',
        mastered: false,
        needsPractice: true,
        starred: true,
        timesReviewed: 2,
      },
      {
        id: 'cs_c5',
        question: 'What problem does the React Virtual DOM solve?',
        answer: 'It maintains a lightweight in-memory representation of UI, computing differences (diffing) and batching minimal DOM updates to avoid expensive real-DOM re-renders.',
        category: 'Frontend',
        difficulty: 'Hard',
        mastered: false,
        needsPractice: false,
        starred: false,
        timesReviewed: 1,
      },
      {
        id: 'cs_c6',
        question: 'What is CORS (Cross-Origin Resource Sharing)?',
        answer: 'A browser security mechanism that restricts HTTP requests from scripts running on one origin to resources hosted on a different origin, unless explicitly allowed via headers.',
        category: 'Security',
        difficulty: 'Hard',
        mastered: false,
        needsPractice: true,
        starred: false,
        timesReviewed: 3,
      },
    ],
  },
];

const DEFAULT_SETTINGS = {
  geminiApiKey: '',
  aiProvider: 'gemini',
  defaultGenerator: 'smart', // 'smart' | 'ai'
  ttsEnabled: true,
  autoAdvanceOnMastery: false,
  soundEffects: true,
  pastelTheme: 'lavender',
};

const DEFAULT_STATS = {
  totalCardsStudied: 32,
  sessionsCompleted: 6,
  studyStreakDays: 3,
  lastStudyDate: new Date().toISOString().split('T')[0],
};

/**
 * Load Study Sets from localStorage (or populate sample sets on first visit)
 */
export function getSavedSets() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.SETS, JSON.stringify(SAMPLE_SETS));
      return SAMPLE_SETS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : SAMPLE_SETS;
  } catch (e) {
    console.error('Error loading study sets from localStorage:', e);
    return SAMPLE_SETS;
  }
}

/**
 * Save all study sets
 */
export function saveSets(sets) {
  try {
    localStorage.setItem(STORAGE_KEYS.SETS, JSON.stringify(sets));
  } catch (e) {
    console.error('Error saving study sets to localStorage:', e);
  }
}

/**
 * Add or update a single study set
 */
export function saveSingleSet(set) {
  const sets = getSavedSets();
  const index = sets.findIndex((s) => s.id === set.id);
  if (index >= 0) {
    sets[index] = { ...set, updatedAt: new Date().toISOString() };
  } else {
    sets.unshift({
      ...set,
      id: set.id || `set_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      createdAt: set.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastStudiedAt: null,
    });
  }
  saveSets(sets);
  return sets;
}

/**
 * Delete a study set by ID
 */
export function deleteSetById(id) {
  const sets = getSavedSets().filter((s) => s.id !== id);
  saveSets(sets);
  return sets;
}

/**
 * Load User Settings
 */
export function getSavedSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch (e) {
    return DEFAULT_SETTINGS;
  }
}

/**
 * Save User Settings
 */
export function saveSettings(settings) {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Error saving settings:', e);
  }
}

/**
 * Load Study Stats
 */
export function getStudyStats() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.STATS);
    if (!raw) return DEFAULT_STATS;
    return { ...DEFAULT_STATS, ...JSON.parse(raw) };
  } catch (e) {
    return DEFAULT_STATS;
  }
}

/**
 * Record a card review or study session
 */
export function recordStudySession({ cardsStudiedCount = 1 }) {
  const stats = getStudyStats();
  const today = new Date().toISOString().split('T')[0];

  let streak = stats.studyStreakDays;
  if (stats.lastStudyDate !== today) {
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    if (stats.lastStudyDate === yesterday) {
      streak += 1;
    } else {
      streak = 1;
    }
  }

  const updatedStats = {
    totalCardsStudied: stats.totalCardsStudied + cardsStudiedCount,
    sessionsCompleted: stats.sessionsCompleted + 1,
    studyStreakDays: streak,
    lastStudyDate: today,
  };

  try {
    localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(updatedStats));
  } catch (e) {
    console.error('Error updating stats:', e);
  }

  return updatedStats;
}

/**
 * Export all study sets as a JSON file
 */
export function exportSetsToJson() {
  const sets = getSavedSets();
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(sets, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `flippi_flashcards_backup_${new Date().toISOString().split('T')[0]}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

/**
 * Import study sets from JSON file
 */
export function importSetsFromJson(jsonString) {
  try {
    const imported = JSON.parse(jsonString);
    if (!Array.isArray(imported)) {
      throw new Error('Invalid backup file: Top level data must be an array of study sets.');
    }
    const currentSets = getSavedSets();
    const merged = [...imported, ...currentSets.filter((c) => !imported.some((i) => i.id === c.id))];
    saveSets(merged);
    return merged;
  } catch (err) {
    throw new Error('Failed to import backup: ' + err.message);
  }
}

/**
 * Reset all sets back to default samples
 */
export function resetToSampleSets() {
  localStorage.setItem(STORAGE_KEYS.SETS, JSON.stringify(SAMPLE_SETS));
  return SAMPLE_SETS;
}
