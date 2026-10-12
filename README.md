# Flippi 🌸 — Aesthetic Flashcard Generator Website for Students

A fully functional, cute, and delightful flashcard generator web application crafted for students. Built with a soft pastel aesthetic (lavender, blush pink, cream, and sage green), rounded cards, friendly typography, and rich interactive study modes.

---

## ✨ Features

### 1. Manual Flashcard Creation & Management
- **Custom Study Sets**: Create, name, and categorize study sets with custom pastel themes (Lavender Dream, Blush Rose, Sage Meadow, Peach Vanilla, Sky Serenade) and cute emoji icons (🌸, 🌿, 💡, 💻, ☕, etc.).
- **Card Authoring**: Add, edit, duplicate, reorder, and delete flashcards with custom difficulty tags (`Easy`, `Medium`, `Hard`) and categories.
- **Bulk Import**: Paste plain text or notes formatted as `Term - Definition` or `Question : Answer` to generate multiple cards at once.
- **Persistent Storage**: Saved sets, cards, and study stats are stored in `localStorage` with JSON export/import and one-click sample restore.

### 2. File Upload & Automatic Flashcard Generation
- **Supported Formats**: `.pdf` (PDF documents), `.docx` (Microsoft Word documents), and `.txt` (Plain text / Markdown).
- **Client-Side & Server Text Extraction**:
  - **PDF Extraction**: Powered by `pdfjs-dist` with page-by-page progress reporting.
  - **DOCX Extraction**: Powered by `mammoth` parsing array buffers.
  - **TXT Extraction**: Instant UTF-8 FileReader processing.
- **Dual Flashcard Generation Engine**:
  - **Smart Local Extractor (Offline & Instant)**: Uses academic NLP heuristics and pattern recognition to extract definitions (`X is defined as Y`, `X refers to Y`, `The primary function of X is Y`), term-dash pairs, structural classifications, and testable concepts without requiring any external API key.
  - **AI Tutor Generation (Optional Gemini / OpenAI integration)**: Connect your Google Gemini API key or OpenAI key in Settings to let an LLM extract active recall questions and explanations.
- **Card Preview & Approval**:
  - Checkbox inclusion/exclusion toggling.
  - Inline question and answer editing.
  - Difficulty tag adjustments.
  - Save directly to a **New Study Set** or append to an **Existing Study Set**.
- **Error & Edge-Case Handling**:
  - Detects scanned / image-only PDFs without text layers and provides helpful warnings.
  - Detects empty or corrupted files.
  - Size limit and unsupported file format validation.
  - Built-in one-click demo notes (Biology 101, Web Systems) for instant testing!

### 3. Interactive Study Mode
- **3D Card Flip**: Tactile, smooth 3D flipping animation revealing answers on click or keypress.
- **Spaced Repetition & Recall**:
  - **Know It! 🌸** (Key `2`) — marks card as mastered.
  - **Need Practice 💭** (Key `1`) — marks card for review.
- **Study Navigation & Controls**:
  - Previous (`←`), Next (`→`), Flip (`Space` / `Enter`), Shuffle (`S`), and Restart (`R`).
  - Progress bar and counter (`Card 4 of 12`).
  - Text-to-Speech (read question or answer aloud).
  - Star / Bookmark cards for focused studying.
- **Celebratory Completion Screen**:
  - Confetti burst (`canvas-confetti`).
  - Study accuracy stats and direct button to review only cards marked as "Need Practice".

### 4. Student Dashboard
- **Study Progress Summary**: Total Study Sets, Total Cards, Mastered Count & Percentage Bar, Study Streak Days.
- **Set Grid**: Pastel cards showing subject badges, card count, mastery bar, last studied date, and quick action buttons.
- **Search, Filter & Sort**: Search by title/term, filter by subject category, sort by recently studied, title, or card count.

### 5. Settings & Data Management
- **API Key Configuration**: Enter Gemini or OpenAI key (stored securely in local browser storage, never exposed in client bundles).
- **Backup & Restore**: Export all flashcards as a portable `.json` file and restore backups at any time.
- **Reset to Samples**: Restore original pre-populated sample decks (Biology 🌿, Spanish ☕, Computer Science 💻).

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm

### Installation & Running

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Start the Development Server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.

3. **Or Run Full-Stack with Express Backend**:
   ```bash
   # Build the production assets
   npm run build

   # Start the Express server
   npm start
   ```
   Open `http://localhost:3001` in your browser.

---

## 🎨 Design Philosophy
- **Colors**: Soft lavender (`#EDE9FE`), blush pink (`#FCE7F3`), mint sage (`#DCFCE7`), warm peach (`#FEF3C7`), and cream vanilla (`#FAF7F2`).
- **Typography**: Google Fonts Quicksand (headings) and Nunito (reading body).
- **Accents**: Soft sparkles (✨), flowers (🌸), smooth rounded corners (`rounded-3xl`), and subtle micro-shadows.
