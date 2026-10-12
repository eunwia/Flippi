import React, { useState, useMemo } from 'react';
import { 
  Search, BookOpen, Star, CheckCircle2, AlertCircle, 
  Trash2, Edit3, Filter, Play, Volume2, Plus, ArrowRight
} from 'lucide-react';
import { getTheme } from '../utils/themeStyles';

export default function MyFlashcards({
  sets = [],
  onStartStudy,
  onEditSet,
  onUpdateCardInSet,
  onDeleteCardInSet,
  onCreateNewSet,
  onGoToUpload,
}) {
  const [selectedSetId, setSelectedSetId] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'mastered' | 'practice' | 'starred'
  const [searchTerm, setSearchTerm] = useState('');
  const [editingCardId, setEditingCardId] = useState(null);
  const [editDraft, setEditDraft] = useState({ question: '', answer: '', category: '', difficulty: 'Medium' });

  // Gather all cards with their parent set metadata
  const allCardsWithSet = useMemo(() => {
    const list = [];
    sets.forEach((set) => {
      (set.cards || []).forEach((card) => {
        list.push({
          ...card,
          parentSetId: set.id,
          parentSetTitle: set.title,
          parentSetIcon: set.icon,
          parentSetTheme: set.theme,
        });
      });
    });
    return list;
  }, [sets]);

  // Filtered Cards
  const filteredCards = useMemo(() => {
    return allCardsWithSet.filter((card) => {
      // Set filter
      if (selectedSetId !== 'all' && card.parentSetId !== selectedSetId) {
        return false;
      }

      // Status filter
      if (statusFilter === 'mastered' && !card.mastered) return false;
      if (statusFilter === 'practice' && !card.needsPractice) return false;
      if (statusFilter === 'starred' && !card.starred) return false;

      // Search term
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesQ = card.question?.toLowerCase().includes(query);
        const matchesA = card.answer?.toLowerCase().includes(query);
        const matchesCat = card.category?.toLowerCase().includes(query);
        if (!matchesQ && !matchesA && !matchesCat) return false;
      }

      return true;
    });
  }, [allCardsWithSet, selectedSetId, statusFilter, searchTerm]);

  // Start Editing a card
  const handleStartEdit = (card) => {
    setEditingCardId(card.id);
    setEditDraft({
      question: card.question,
      answer: card.answer,
      category: card.category || '',
      difficulty: card.difficulty || 'Medium',
    });
  };

  // Save Card Edits
  const handleSaveEdit = (parentSetId, cardId) => {
    if (!editDraft.question.trim() || !editDraft.answer.trim()) return;
    onUpdateCardInSet(parentSetId, cardId, editDraft);
    setEditingCardId(null);
  };

  // Toggle Star
  const handleToggleStar = (parentSetId, card) => {
    onUpdateCardInSet(parentSetId, card.id, { starred: !card.starred });
  };

  // Toggle Mastered
  const handleToggleMastered = (parentSetId, card) => {
    const newMastered = !card.mastered;
    onUpdateCardInSet(parentSetId, card.id, {
      mastered: newMastered,
      needsPractice: newMastered ? false : card.needsPractice,
    });
  };

  // Text to speech
  const handleSpeak = (text) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.rate = 0.95;
    window.speechSynthesis.speak(utt);
  };

  // Active set if filtered to single
  const activeSingleSet = sets.find((s) => s.id === selectedSetId);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">🎴</span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#383144] tracking-tight">
              My Flashcards
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-[#776D87] mt-1">
            Browse, search, edit, and organize all {allCardsWithSet.length} cards across your study sets.
          </p>
        </div>

        {/* Quick action buttons */}
        <div className="flex items-center gap-2">
          {activeSingleSet && (
            <button
              onClick={() => onStartStudy(activeSingleSet)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Study Deck</span>
            </button>
          )}
          <button
            onClick={onCreateNewSet}
            className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-[#EDE9FE] text-[#6D28D9] hover:bg-[#DDD6FE] font-bold text-xs transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Set</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#EDE8F3] shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-[#9D94AA] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by question or answer..."
              className="w-full pl-10 pr-4 py-2 rounded-2xl bg-[#FAF8FC] border border-[#E7DFEF] text-xs text-[#383144] focus:outline-none focus:ring-2 focus:ring-[#C4B5FD]"
            />
          </div>

          {/* Select Study Set Filter */}
          <div>
            <select
              value={selectedSetId}
              onChange={(e) => setSelectedSetId(e.target.value)}
              className="w-full px-3 py-2 rounded-2xl bg-[#FAF8FC] border border-[#E7DFEF] text-xs font-bold text-[#383144] focus:outline-none cursor-pointer"
            >
              <option value="all">All Study Sets ({sets.length})</option>
              {sets.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.icon || '🌸'} {s.title} ({s.cards?.length || 0} cards)
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-2xl bg-[#FAF8FC] border border-[#E7DFEF] text-xs font-bold text-[#383144] focus:outline-none cursor-pointer"
            >
              <option value="all">All Learning Statuses</option>
              <option value="mastered">🌸 Mastered (Know It)</option>
              <option value="practice">💭 Need Practice</option>
              <option value="starred">⭐ Starred Only</option>
            </select>
          </div>
        </div>

        {/* Quick Result Counter */}
        <div className="flex items-center justify-between text-xs text-[#827891] pt-1 border-t border-[#F5F1FA]">
          <span>
            Showing <strong className="text-[#383144]">{filteredCards.length}</strong> cards
          </span>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-[#059669]">
              🌸 {allCardsWithSet.filter((c) => c.mastered).length} Mastered
            </span>
            <span className="flex items-center gap-1 text-[#DB2777]">
              💭 {allCardsWithSet.filter((c) => c.needsPractice).length} Need Practice
            </span>
          </div>
        </div>
      </div>

      {/* Cards Grid */}
      {filteredCards.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredCards.map((card) => {
            const isEditing = editingCardId === card.id;
            const theme = getTheme(card.parentSetTheme);

            return (
              <div
                key={card.id}
                className="bg-white rounded-3xl p-5 border border-[#EDE8F3] shadow-xs hover:shadow-md transition-all space-y-3 relative group"
              >
                {/* Card Top Meta */}
                <div className="flex items-center justify-between text-xs pb-2 border-b border-[#FAF6FC]">
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-sm shrink-0">{card.parentSetIcon || '🌸'}</span>
                    <span className="font-bold text-[#574E66] truncate max-w-[160px] sm:max-w-[200px]">
                      {card.parentSetTitle}
                    </span>
                    {card.category && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#FAF8FC] text-[#7C3AED] border border-[#EDE7F5]">
                        {card.category}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    {/* Star toggle */}
                    <button
                      onClick={() => handleToggleStar(card.parentSetId, card)}
                      className={`p-1 rounded-lg transition-all cursor-pointer ${
                        card.starred ? 'text-[#F59E0B]' : 'text-[#A097AC] hover:text-[#F59E0B]'
                      }`}
                      title={card.starred ? 'Unstar' : 'Star'}
                    >
                      <Star className={`w-3.5 h-3.5 ${card.starred ? 'fill-current' : ''}`} />
                    </button>

                    {/* Mastered toggle */}
                    <button
                      onClick={() => handleToggleMastered(card.parentSetId, card)}
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
                        card.mastered
                          ? 'bg-[#DCFCE7] text-[#15803D] border border-[#BBF7D0]'
                          : card.needsPractice
                          ? 'bg-[#FCE7F3] text-[#BE185D] border border-[#FBCFE8]'
                          : 'bg-[#FAF8FC] text-[#867B96] hover:bg-[#F3EEFA]'
                      }`}
                      title="Toggle Mastery"
                    >
                      {card.mastered ? '🌸 Mastered' : card.needsPractice ? '💭 Review' : 'Learning'}
                    </button>

                    {/* Edit button */}
                    <button
                      onClick={() => (isEditing ? setEditingCardId(null) : handleStartEdit(card))}
                      className="p-1 rounded-lg text-[#8C829B] hover:text-[#383144] hover:bg-[#F5F2F9] cursor-pointer"
                      title="Edit card"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete button */}
                    <button
                      onClick={() => onDeleteCardInSet(card.parentSetId, card.id)}
                      className="p-1 rounded-lg text-[#8C829B] hover:text-[#E11D48] hover:bg-[#FFE4E6] cursor-pointer"
                      title="Delete card"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {isEditing ? (
                  /* Edit Mode Inputs */
                  <div className="space-y-3 pt-1">
                    <div>
                      <label className="text-[11px] font-bold text-[#6D637E] block mb-1">
                        Question / Term
                      </label>
                      <textarea
                        rows={2}
                        value={editDraft.question}
                        onChange={(e) => setEditDraft({ ...editDraft, question: e.target.value })}
                        className="w-full p-2 rounded-xl bg-[#FAF8FD] border border-[#EAE3F2] text-xs font-semibold text-[#383144] resize-none"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-[#6D637E] block mb-1">
                        Answer / Definition
                      </label>
                      <textarea
                        rows={2}
                        value={editDraft.answer}
                        onChange={(e) => setEditDraft({ ...editDraft, answer: e.target.value })}
                        className="w-full p-2 rounded-xl bg-[#FAF8FD] border border-[#EAE3F2] text-xs font-semibold text-[#383144] resize-none"
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setEditingCardId(null)}
                        className="px-3 py-1 rounded-xl text-xs font-bold text-[#7A7089] hover:bg-[#FAF8FC]"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleSaveEdit(card.parentSetId, card.id)}
                        className="px-3 py-1 rounded-xl bg-[#7C3AED] text-white text-xs font-bold hover:bg-[#6D28D9]"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Display Mode */
                  <div className="space-y-3 pt-1">
                    {/* Front Question */}
                    <div>
                      <span className="text-[10px] font-bold text-[#958C9F] uppercase tracking-wider block">
                        Front
                      </span>
                      <p className="text-sm font-bold text-[#383144] mt-0.5">
                        {card.question}
                      </p>
                    </div>

                    {/* Back Answer */}
                    <div className="pt-2 border-t border-[#F8F5FB]">
                      <span className="text-[10px] font-bold text-[#958C9F] uppercase tracking-wider block">
                        Back
                      </span>
                      <p className="text-xs text-[#554C64] leading-relaxed mt-0.5">
                        {card.answer}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-12 text-center border border-[#EDE8F3] max-w-md mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-[#EDE9FE] text-[#7C3AED] flex items-center justify-center text-2xl mx-auto mb-3">
            🎴
          </div>
          <h4 className="text-base font-bold text-[#383144]">No flashcards found</h4>
          <p className="text-xs text-[#7A7089] mt-1">
            Try clearing search filters or create new flashcards manually or from files.
          </p>
        </div>
      )}
    </div>
  );
}
