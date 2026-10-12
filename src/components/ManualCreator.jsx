import React, { useState } from 'react';
import { 
  Plus, Trash2, Edit2, ArrowUp, ArrowDown, Save, 
  CheckCircle, AlertCircle, ArrowLeft, Layers, 
  Palette, Sparkles, BookOpen, Copy, FileText
} from 'lucide-react';
import { THEME_CONFIGS, SUBJECT_OPTIONS, ICON_OPTIONS } from '../utils/themeStyles';

export default function ManualCreator({
  initialSet = null,
  onSaveSet,
  onCancel,
  onStudyImmediately,
}) {
  const isEditing = Boolean(initialSet && initialSet.id);

  // Set Details state
  const [title, setTitle] = useState(initialSet?.title || '');
  const [description, setDescription] = useState(initialSet?.description || '');
  const [subject, setSubject] = useState(initialSet?.subject || 'General');
  const [theme, setTheme] = useState(initialSet?.theme || 'lavender');
  const [icon, setIcon] = useState(initialSet?.icon || '🌸');

  // Cards List state
  const [cards, setCards] = useState(() => {
    if (initialSet?.cards && initialSet.cards.length > 0) {
      return [...initialSet.cards];
    }
    // Start with 2 empty card drafts for convenience
    return [
      { id: 'draft_1', question: '', answer: '', category: '', difficulty: 'Medium', mastered: false, needsPractice: false, starred: false },
      { id: 'draft_2', question: '', answer: '', category: '', difficulty: 'Medium', mastered: false, needsPractice: false, starred: false },
    ];
  });

  const [validationError, setValidationError] = useState('');
  const [showBulkAdd, setShowBulkAdd] = useState(false);
  const [bulkText, setBulkText] = useState('');

  // Add a blank card
  const handleAddCard = () => {
    const newCard = {
      id: `card_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      question: '',
      answer: '',
      category: subject !== 'General' ? subject : '',
      difficulty: 'Medium',
      mastered: false,
      needsPractice: false,
      starred: false,
    };
    setCards([...cards, newCard]);
  };

  // Update card field
  const handleUpdateCard = (id, field, value) => {
    setCards(cards.map((c) => (c.id === id ? { ...c, [field]: value } : c)));
  };

  // Remove card
  const handleRemoveCard = (id) => {
    if (cards.length === 1) {
      setValidationError('A study set should have at least one card.');
      return;
    }
    setCards(cards.filter((c) => c.id !== id));
    setValidationError('');
  };

  // Duplicate card
  const handleDuplicateCard = (id) => {
    const cardToDup = cards.find((c) => c.id === id);
    if (!cardToDup) return;
    const duplicated = {
      ...cardToDup,
      id: `card_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      question: `${cardToDup.question} (Copy)`,
    };
    const index = cards.findIndex((c) => c.id === id);
    const updated = [...cards];
    updated.splice(index + 1, 0, duplicated);
    setCards(updated);
  };

  // Move card up
  const handleMoveUp = (index) => {
    if (index === 0) return;
    const updated = [...cards];
    const temp = updated[index];
    updated[index] = updated[index - 1];
    updated[index - 1] = temp;
    setCards(updated);
  };

  // Move card down
  const handleMoveDown = (index) => {
    if (index === cards.length - 1) return;
    const updated = [...cards];
    const temp = updated[index];
    updated[index] = updated[index + 1];
    updated[index + 1] = temp;
    setCards(updated);
  };

  // Process bulk pasted cards
  const handleProcessBulk = () => {
    if (!bulkText.trim()) {
      setShowBulkAdd(false);
      return;
    }

    const lines = bulkText.split('\n').filter((l) => l.trim().length > 0);
    const parsedNewCards = [];

    for (const line of lines) {
      let q = '';
      let a = '';

      if (line.includes(' - ')) {
        const parts = line.split(' - ');
        q = parts[0].trim();
        a = parts.slice(1).join(' - ').trim();
      } else if (line.includes('\t')) {
        const parts = line.split('\t');
        q = parts[0].trim();
        a = parts.slice(1).join('\t').trim();
      } else if (line.includes(': ')) {
        const parts = line.split(': ');
        q = parts[0].trim();
        a = parts.slice(1).join(': ').trim();
      } else if (line.includes('?')) {
        const parts = line.split('?');
        q = parts[0].trim() + '?';
        a = parts.slice(1).join('?').trim();
      } else {
        q = line.trim();
        a = 'Review definition.';
      }

      if (q && a) {
        parsedNewCards.push({
          id: `card_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          question: q,
          answer: a,
          category: subject,
          difficulty: 'Medium',
          mastered: false,
          needsPractice: false,
          starred: false,
        });
      }
    }

    if (parsedNewCards.length > 0) {
      // Filter out empty placeholder cards if any
      const cleanedExisting = cards.filter((c) => c.question.trim() || c.answer.trim());
      setCards([...cleanedExisting, ...parsedNewCards]);
      setBulkText('');
      setShowBulkAdd(false);
    } else {
      setValidationError('Could not parse any cards. Separate terms and definitions with "-" or ":" on each line.');
    }
  };

  // Save the Set
  const handleSave = (andStudy = false) => {
    if (!title.trim()) {
      setValidationError('Please provide a title for your study set.');
      return;
    }

    // Filter cards that have both question and answer
    const validCards = cards
      .filter((c) => c.question.trim().length > 0 && c.answer.trim().length > 0)
      .map((c) => ({
        ...c,
        question: c.question.trim(),
        answer: c.answer.trim(),
        category: c.category?.trim() || subject,
      }));

    if (validCards.length === 0) {
      setValidationError('Please add at least one complete flashcard with both a Question/Term and an Answer/Definition.');
      return;
    }

    setValidationError('');

    const setPayload = {
      id: initialSet?.id || `set_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      title: title.trim(),
      description: description.trim(),
      subject,
      theme,
      icon,
      cards: validCards,
      createdAt: initialSet?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastStudiedAt: initialSet?.lastStudiedAt || null,
    };

    onSaveSet(setPayload);

    if (andStudy) {
      onStudyImmediately(setPayload);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-in fade-in duration-200">
      
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button
            onClick={onCancel}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#7E748E] hover:text-[#383144] mb-2 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Dashboard</span>
          </button>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#383144] tracking-tight">
            {isEditing ? 'Edit Study Set 🌸' : 'Create Study Set 🌸'}
          </h1>
          <p className="text-xs sm:text-sm text-[#736885] mt-1">
            Build your personalized flashcards by typing questions, terms, and definitions.
          </p>
        </div>

        {/* Action Buttons Top */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onCancel}
            className="px-4 py-2.5 rounded-2xl bg-white border border-[#E3DCEB] text-[#635974] hover:bg-[#FAF7F2] font-bold text-xs transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={() => handleSave(false)}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-2xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold text-xs shadow-md shadow-[#DDD6FE] transition-all cursor-pointer hover:-translate-y-0.5"
          >
            <Save className="w-4 h-4" />
            <span>Save Set</span>
          </button>
        </div>
      </div>

      {/* Validation Error Banner */}
      {validationError && (
        <div className="p-4 rounded-2xl bg-[#FFF1F2] border border-[#FECDD3] text-[#BE123C] text-xs font-bold flex items-center gap-2.5 animate-in slide-in-from-top-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      {/* Set Details Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EDE8F3] shadow-xs space-y-6">
        <h3 className="text-base font-bold text-[#383144] flex items-center gap-2">
          <span>🌸</span> Study Set Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Title */}
          <div className="space-y-1.5 md:col-span-2">
            <label className="text-xs font-bold text-[#5F5570]">
              Set Title <span className="text-[#E11D48]">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setValidationError('');
              }}
              placeholder="e.g. Psychology 101: Cognitive Development"
              className="w-full px-4 py-3 rounded-2xl bg-[#FAF8FC] border border-[#E7E0EF] text-sm text-[#383144] placeholder-[#A49BAF] focus:outline-none focus:ring-2 focus:ring-[#C4B5FD] focus:bg-white transition-all"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5 md:col-span-2">
            <label className="text-xs font-bold text-[#5F5570]">
              Description (Optional)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What topics or exams does this deck cover?"
              className="w-full px-4 py-2.5 rounded-2xl bg-[#FAF8FC] border border-[#E7E0EF] text-sm text-[#383144] placeholder-[#A49BAF] focus:outline-none focus:ring-2 focus:ring-[#C4B5FD] focus:bg-white transition-all resize-none"
            />
          </div>

          {/* Subject Dropdown */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#5F5570]">Subject Category</label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl bg-[#FAF8FC] border border-[#E7E0EF] text-sm text-[#383144] focus:outline-none focus:ring-2 focus:ring-[#C4B5FD] focus:bg-white cursor-pointer"
            >
              {SUBJECT_OPTIONS.map((sub) => (
                <option key={sub} value={sub}>{sub}</option>
              ))}
            </select>
          </div>

          {/* Icon Picker */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#5F5570]">Set Icon</label>
            <div className="flex items-center gap-1.5 flex-wrap">
              {ICON_OPTIONS.map((emoji) => (
                <button
                  type="button"
                  key={emoji}
                  onClick={() => setIcon(emoji)}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg transition-all cursor-pointer ${
                    icon === emoji
                      ? 'bg-[#EDE9FE] border-2 border-[#7C3AED] scale-110 shadow-xs'
                      : 'bg-[#FAF8FC] border border-[#EAE3F2] hover:bg-white'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Pastel Theme Selector */}
          <div className="space-y-1.5 md:col-span-2">
            <label className="text-xs font-bold text-[#5F5570]">Pastel Theme Palette</label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {Object.values(THEME_CONFIGS).map((t) => {
                const isSelected = theme === t.id;
                return (
                  <button
                    type="button"
                    key={t.id}
                    onClick={() => setTheme(t.id)}
                    className={`flex items-center gap-2 p-2.5 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? `${t.badgeBg} ${t.badgeText} border-2 ${t.badgeBorder} shadow-xs`
                        : 'bg-[#FAF8FC] border-[#E8E1F0] text-[#716781] hover:bg-white'
                    }`}
                  >
                    <span 
                      className="w-3.5 h-3.5 rounded-full shrink-0" 
                      style={{ backgroundColor: t.dotColor }}
                    />
                    <span className="truncate">{t.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Cards List Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-[#383144] flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#7C3AED]" />
              <span>Cards in this Set</span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#EDE9FE] text-[#6D28D9]">
                {cards.length}
              </span>
            </h3>
            <p className="text-xs text-[#7F758F] mt-0.5">
              Enter the question on the front and answer on the back.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowBulkAdd(!showBulkAdd)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-white hover:bg-[#FAF7F2] border border-[#E3DCEB] text-xs font-bold text-[#675C78] transition-all cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Bulk Paste</span>
            </button>
            <button
              type="button"
              onClick={handleAddCard}
              className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-[#EDE9FE] hover:bg-[#DDD6FE] text-[#6D28D9] text-xs font-bold border border-[#DDD6FE] transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Card</span>
            </button>
          </div>
        </div>

        {/* Bulk Paste Drawer */}
        {showBulkAdd && (
          <div className="bg-[#FAF8FC] rounded-3xl p-5 border border-[#E5DEEE] space-y-3 animate-in fade-in">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-[#4B415C]">Quick Bulk Card Importer</h4>
              <button 
                onClick={() => setShowBulkAdd(false)}
                className="text-xs text-[#958C9F] hover:text-[#383144]"
              >
                ✕
              </button>
            </div>
            <p className="text-[11px] text-[#786D87]">
              Paste lines formatted as <code className="bg-white px-1.5 py-0.5 rounded border">Term - Definition</code> or <code className="bg-white px-1.5 py-0.5 rounded border">Question : Answer</code>. Each line generates a flashcard.
            </p>
            <textarea
              rows={4}
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
              placeholder={"Mitochondria - The powerhouse of the cell generating ATP\nRibosomes - Cellular structures responsible for protein synthesis"}
              className="w-full p-3 rounded-2xl bg-white border border-[#E0D8E9] text-xs font-mono text-[#383144] focus:outline-none focus:ring-2 focus:ring-[#C4B5FD]"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowBulkAdd(false)}
                className="px-3 py-1.5 rounded-xl text-xs font-bold text-[#6D637E]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleProcessBulk}
                className="px-4 py-1.5 rounded-xl bg-[#7C3AED] text-white text-xs font-bold hover:bg-[#6D28D9]"
              >
                Import Cards
              </button>
            </div>
          </div>
        )}

        {/* Cards Items List */}
        <div className="space-y-4">
          {cards.map((card, index) => (
            <div
              key={card.id}
              className="bg-white rounded-3xl p-5 sm:p-6 border border-[#ECE7F2] shadow-xs hover:border-[#DDD6FE] transition-all space-y-4 group"
            >
              {/* Card Header & Controls */}
              <div className="flex items-center justify-between border-b border-[#FAF6FC] pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#FAF7FC] text-[#7C3AED] font-bold text-xs flex items-center justify-center border border-[#EDE7F4]">
                    {index + 1}
                  </span>
                  <span className="text-xs font-bold text-[#746A84]">Flashcard #{index + 1}</span>
                </div>

                <div className="flex items-center gap-1">
                  {/* Difficulty selector */}
                  <select
                    value={card.difficulty || 'Medium'}
                    onChange={(e) => handleUpdateCard(card.id, 'difficulty', e.target.value)}
                    className="text-[11px] font-bold px-2 py-1 rounded-xl bg-[#FAF8FC] border border-[#EAE3F2] text-[#695F77] focus:outline-none cursor-pointer"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>

                  {/* Move Up/Down */}
                  <button
                    type="button"
                    onClick={() => handleMoveUp(index)}
                    disabled={index === 0}
                    className="p-1.5 rounded-xl text-[#9288A1] hover:text-[#483D5A] hover:bg-[#FAF7FC] disabled:opacity-30 cursor-pointer"
                    title="Move card up"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMoveDown(index)}
                    disabled={index === cards.length - 1}
                    className="p-1.5 rounded-xl text-[#9288A1] hover:text-[#483D5A] hover:bg-[#FAF7FC] disabled:opacity-30 cursor-pointer"
                    title="Move card down"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>

                  {/* Duplicate */}
                  <button
                    type="button"
                    onClick={() => handleDuplicateCard(card.id)}
                    className="p-1.5 rounded-xl text-[#9288A1] hover:text-[#483D5A] hover:bg-[#FAF7FC] cursor-pointer"
                    title="Duplicate card"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>

                  {/* Delete */}
                  <button
                    type="button"
                    onClick={() => handleRemoveCard(card.id)}
                    className="p-1.5 rounded-xl text-[#9288A1] hover:text-[#E11D48] hover:bg-[#FFE4E6] cursor-pointer"
                    title="Delete card"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Card Inputs (Question & Answer) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Front: Question */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-[#564C67]">
                      Front (Question / Term)
                    </label>
                    <span className="text-[10px] text-[#A69CAD]">Front Face</span>
                  </div>
                  <textarea
                    rows={3}
                    value={card.question}
                    onChange={(e) => handleUpdateCard(card.id, 'question', e.target.value)}
                    placeholder="e.g. What is the powerhouse of the cell?"
                    className="w-full p-3 rounded-2xl bg-[#FAF9FD] border border-[#EAE3F2] text-xs sm:text-sm text-[#383144] placeholder-[#A9A0B4] focus:outline-none focus:ring-2 focus:ring-[#C4B5FD] focus:bg-white resize-none"
                  />
                </div>

                {/* Back: Answer */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-[#564C67]">
                      Back (Answer / Definition)
                    </label>
                    <span className="text-[10px] text-[#A69CAD]">Back Face</span>
                  </div>
                  <textarea
                    rows={3}
                    value={card.answer}
                    onChange={(e) => handleUpdateCard(card.id, 'answer', e.target.value)}
                    placeholder="e.g. Mitochondria, generating ATP via cellular respiration."
                    className="w-full p-3 rounded-2xl bg-[#FAF9FD] border border-[#EAE3F2] text-xs sm:text-sm text-[#383144] placeholder-[#A9A0B4] focus:outline-none focus:ring-2 focus:ring-[#C4B5FD] focus:bg-white resize-none"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add Another Card Button */}
        <button
          type="button"
          onClick={handleAddCard}
          className="w-full py-4 rounded-3xl border-2 border-dashed border-[#DDD6FE] hover:border-[#7C3AED] bg-white hover:bg-[#FAF8FF] text-[#6D28D9] font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Another Flashcard</span>
        </button>
      </div>

      {/* Bottom Save Bar */}
      <div className="sticky bottom-4 z-20 bg-white/90 backdrop-blur-md rounded-3xl p-4 border border-[#EDE8F3] shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="text-xs text-[#7B718B]">
          <span className="font-bold text-[#383144]">{cards.filter((c) => c.question && c.answer).length} valid cards</span> ready to save
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 rounded-2xl border border-[#E3DCEB] text-xs font-bold text-[#645B73] hover:bg-[#FAF7F2] transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => handleSave(false)}
            className="px-5 py-2.5 rounded-2xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold text-xs shadow-md shadow-[#DDD6FE] transition-all cursor-pointer hover:-translate-y-0.5"
          >
            Save Set
          </button>
          <button
            type="button"
            onClick={() => handleSave(true)}
            className="px-5 py-2.5 rounded-2xl bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs shadow-md shadow-[#A7F3D0] transition-all cursor-pointer hover:-translate-y-0.5"
          >
            Save & Study Now 🌸
          </button>
        </div>
      </div>
    </div>
  );
}
