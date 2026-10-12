import React, { useState, useMemo } from 'react';
import { 
  Play, Plus, Upload, Search, BookOpen, CheckCircle2, 
  Flame, Sparkles, MoreVertical, Trash2, Edit3, Copy, 
  ArrowRight, Filter, AlertCircle, Heart, FolderPlus
} from 'lucide-react';
import { getTheme, SUBJECT_OPTIONS } from '../utils/themeStyles';

export default function Dashboard({
  sets,
  stats,
  onStartStudy,
  onEditSet,
  onCreateSet,
  onGoToUpload,
  onDeleteSet,
  onDuplicateSet,
  onResetSamples,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [sortBy, setSortBy] = useState('recent'); // 'recent' | 'name' | 'cards' | 'created'
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // Compute overall stats
  const totalCards = useMemo(() => {
    return sets.reduce((acc, set) => acc + (set.cards?.length || 0), 0);
  }, [sets]);

  const masteredCards = useMemo(() => {
    return sets.reduce((acc, set) => {
      const mastered = (set.cards || []).filter((c) => c.mastered).length;
      return acc + mastered;
    }, 0);
  }, [sets]);

  const masteryPercent = totalCards > 0 ? Math.round((masteredCards / totalCards) * 100) : 0;

  // Filtered and sorted sets
  const filteredSets = useMemo(() => {
    let result = sets.filter((set) => {
      const matchesSearch = 
        set.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (set.description && set.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (set.subject && set.subject.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesSubject = selectedSubject === 'All' || set.subject === selectedSubject;
      return matchesSearch && matchesSubject;
    });

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'recent') {
        const timeA = a.lastStudiedAt ? new Date(a.lastStudiedAt).getTime() : 0;
        const timeB = b.lastStudiedAt ? new Date(b.lastStudiedAt).getTime() : 0;
        return timeB - timeA;
      }
      if (sortBy === 'name') {
        return a.title.localeCompare(b.title);
      }
      if (sortBy === 'cards') {
        return (b.cards?.length || 0) - (a.cards?.length || 0);
      }
      if (sortBy === 'created') {
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      }
      return 0;
    });

    return result;
  }, [sets, searchTerm, selectedSubject, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#EDE9FE]/80 via-[#FCE7F3]/80 to-[#DCFCE7]/70 border border-[#E9E1F5] p-6 sm:p-8 shadow-sm">
        {/* Soft background sparkles */}
        <div className="absolute top-3 right-6 text-3xl opacity-60 animate-pulse-subtle">✨</div>
        <div className="absolute bottom-2 right-24 text-2xl opacity-40 animate-float-slow">🌸</div>
        <div className="absolute top-1/2 right-1/3 text-lg opacity-30">🌿</div>

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/80 text-[#6D28D9] border border-[#DDD6FE] mb-3">
            <span>🌸</span> Ready for today&apos;s review?
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#383144] tracking-tight">
            Welcome to your gentle study nook!
          </h1>
          <p className="mt-2 text-sm sm:text-base text-[#675C78] leading-relaxed">
            Create flashcards manually, or upload documents to automatically generate question-and-answer decks with smart concept extraction.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onCreateSet()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold text-sm shadow-md shadow-[#DDD6FE] hover:shadow-lg transition-all duration-200 cursor-pointer hover:-translate-y-0.5"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Set</span>
            </button>
            <button
              onClick={onGoToUpload}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white hover:bg-[#FAF7F2] text-[#4F46E5] font-bold text-sm border border-[#DDD6FE] shadow-sm hover:shadow transition-all duration-200 cursor-pointer hover:-translate-y-0.5"
            >
              <Upload className="w-4 h-4 text-[#7C3AED]" />
              <span>Upload File & Generate</span>
            </button>
          </div>
        </div>
      </div>

      {/* Study Progress Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Sets Count */}
        <div className="bg-white rounded-2xl p-5 border border-[#EDE8F3] shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#EDE9FE] text-[#7C3AED] flex items-center justify-center text-xl shrink-0">
            📚
          </div>
          <div>
            <p className="text-xs font-bold text-[#8A8197] uppercase tracking-wider">Study Sets</p>
            <h3 className="text-2xl font-extrabold text-[#383144] mt-0.5">{sets.length}</h3>
            <p className="text-[11px] text-[#6D28D9] font-medium mt-0.5">Organized decks</p>
          </div>
        </div>

        {/* Total Cards */}
        <div className="bg-white rounded-2xl p-5 border border-[#EDE8F3] shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#FCE7F3] text-[#DB2777] flex items-center justify-center text-xl shrink-0">
            🎴
          </div>
          <div>
            <p className="text-xs font-bold text-[#8A8197] uppercase tracking-wider">Total Cards</p>
            <h3 className="text-2xl font-extrabold text-[#383144] mt-0.5">{totalCards}</h3>
            <p className="text-[11px] text-[#BE185D] font-medium mt-0.5">Across all subjects</p>
          </div>
        </div>

        {/* Mastered Progress */}
        <div className="bg-white rounded-2xl p-5 border border-[#EDE8F3] shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#DCFCE7] text-[#059669] flex items-center justify-center text-xl shrink-0">
            🌸
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-[#8A8197] uppercase tracking-wider">Mastered</p>
            <div className="flex items-baseline gap-2 mt-0.5">
              <h3 className="text-2xl font-extrabold text-[#383144]">{masteredCards}</h3>
              <span className="text-xs font-bold text-[#059669]">({masteryPercent}%)</span>
            </div>
            {/* Mini Progress Bar */}
            <div className="w-full bg-[#E5E7EB] h-1.5 rounded-full mt-1.5 overflow-hidden">
              <div 
                className="bg-[#10B981] h-full rounded-full transition-all duration-500" 
                style={{ width: `${masteryPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Streak */}
        <div className="bg-white rounded-2xl p-5 border border-[#EDE8F3] shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#FEF3C7] text-[#D97706] flex items-center justify-center text-xl shrink-0">
            🔥
          </div>
          <div>
            <p className="text-xs font-bold text-[#8A8197] uppercase tracking-wider">Study Streak</p>
            <h3 className="text-2xl font-extrabold text-[#383144] mt-0.5">{stats.studyStreakDays} Days</h3>
            <p className="text-[11px] text-[#B45309] font-medium mt-0.5">Keep the rhythm! ✨</p>
          </div>
        </div>
      </div>

      {/* Search, Filter & Sort Controls */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#9F96AC] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search study sets by title, concept, or tag..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-[#E7E1EE] text-sm text-[#483D5A] placeholder-[#9F96AC] focus:outline-none focus:ring-2 focus:ring-[#C4B5FD] focus:border-transparent transition-all shadow-xs"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#9F96AC] hover:text-[#483D5A] p-1"
              >
                ✕
              </button>
            )}
          </div>

          {/* Sort dropdown & Create button */}
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-2xl border border-[#E7E1EE] text-xs font-semibold text-[#665D74]">
              <span>Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent text-[#483D5A] font-bold focus:outline-none cursor-pointer"
              >
                <option value="recent">Recently Studied</option>
                <option value="name">Title (A-Z)</option>
                <option value="cards">Most Cards</option>
                <option value="created">Newest First</option>
              </select>
            </div>

            <button
              onClick={() => onCreateSet()}
              className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-[#EDE9FE] hover:bg-[#DDD6FE] text-[#6D28D9] font-bold text-xs border border-[#DDD6FE] transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Set</span>
            </button>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <span className="text-xs font-bold text-[#8C829B] shrink-0 flex items-center gap-1 mr-1">
            <Filter className="w-3 h-3" /> Filter:
          </span>
          {['All', ...SUBJECT_OPTIONS].map((subj) => {
            const isSelected = selectedSubject === subj;
            return (
              <button
                key={subj}
                onClick={() => setSelectedSubject(subj)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#7C3AED] text-white shadow-xs'
                    : 'bg-white text-[#675C78] hover:bg-[#F5F2F9] border border-[#EAE4F0]'
                }`}
              >
                {subj}
              </button>
            );
          })}
        </div>
      </div>

      {/* Sets Grid */}
      {filteredSets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSets.map((set) => {
            const theme = getTheme(set.theme);
            const cardCount = set.cards?.length || 0;
            const masteredCount = (set.cards || []).filter((c) => c.mastered).length;
            const needsPracticeCount = (set.cards || []).filter((c) => c.needsPractice).length;
            const setMasteryPct = cardCount > 0 ? Math.round((masteredCount / cardCount) * 100) : 0;

            return (
              <div
                key={set.id}
                className={`group rounded-3xl ${theme.cardBg} border ${theme.cardBorder} p-6 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between relative hover:-translate-y-1`}
              >
                {/* Top Set Card Header */}
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-white border border-black/5 shadow-xs flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                        {set.icon || '🌸'}
                      </div>
                      <div>
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold ${theme.badgeBg} ${theme.badgeText} border ${theme.badgeBorder}`}>
                          {set.subject || 'General'}
                        </span>
                        <p className="text-[11px] text-[#978FA4] mt-0.5">
                          {cardCount} {cardCount === 1 ? 'card' : 'cards'}
                        </p>
                      </div>
                    </div>

                    {/* Action buttons (Edit, Duplicate, Delete) */}
                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => onEditSet(set)}
                        className="p-1.5 rounded-xl hover:bg-white text-[#776E84] hover:text-[#4A4059] transition-all cursor-pointer"
                        title="Edit Study Set"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDuplicateSet(set)}
                        className="p-1.5 rounded-xl hover:bg-white text-[#776E84] hover:text-[#4A4059] transition-all cursor-pointer"
                        title="Duplicate Set"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(set.id)}
                        className="p-1.5 rounded-xl hover:bg-[#FFE4E6] text-[#776E84] hover:text-[#E11D48] transition-all cursor-pointer"
                        title="Delete Set"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Title and description */}
                  <h3 className="text-lg font-bold text-[#383144] tracking-tight group-hover:text-[#7C3AED] transition-colors line-clamp-1">
                    {set.title}
                  </h3>
                  <p className="mt-1 text-xs text-[#6F6480] line-clamp-2 leading-relaxed min-h-[2.5rem]">
                    {set.description || 'No description provided.'}
                  </p>
                </div>

                {/* Bottom stats and Study button */}
                <div className="mt-6 pt-4 border-t border-black/5 space-y-4">
                  {/* Progress Indicator */}
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-[#847B91] font-medium">Mastery</span>
                      <span className="font-bold text-[#483D5A]">{setMasteryPct}%</span>
                    </div>
                    <div className="w-full bg-black/5 h-2 rounded-full overflow-hidden">
                      <div
                        className={`${theme.progressFill} h-full rounded-full transition-all duration-500`}
                        style={{ width: `${setMasteryPct}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-[#9A91A7] mt-1.5">
                      <span>🌸 {masteredCount} mastered</span>
                      {needsPracticeCount > 0 && (
                        <span className="text-[#DB2777] font-semibold">💭 {needsPracticeCount} review</span>
                      )}
                    </div>
                  </div>

                  {/* Study Now CTA */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onStartStudy(set)}
                      disabled={cardCount === 0}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl font-bold text-xs transition-all duration-200 cursor-pointer ${
                        cardCount === 0
                          ? 'bg-[#E5E7EB] text-[#9CA3AF] cursor-not-allowed'
                          : `${theme.btnPrimary} shadow-sm hover:shadow hover:-translate-y-0.5`
                      }`}
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>{cardCount === 0 ? 'Empty Set' : 'Study Deck'}</span>
                    </button>
                    <button
                      onClick={() => onEditSet(set)}
                      className="px-3 py-2.5 rounded-2xl bg-white hover:bg-[#FAF7F2] border border-[#E4DEEC] text-[#554B64] font-bold text-xs transition-all cursor-pointer"
                      title="Manage cards in this set"
                    >
                      Cards
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white rounded-3xl border border-[#EDE8F3] p-12 text-center max-w-lg mx-auto shadow-xs">
          <div className="w-16 h-16 rounded-3xl bg-[#EDE9FE] text-[#7C3AED] flex items-center justify-center text-3xl mx-auto mb-4 animate-float-slow">
            🌸
          </div>
          <h3 className="text-xl font-bold text-[#383144]">
            {searchTerm || selectedSubject !== 'All' ? 'No matching study sets found' : 'No study sets yet'}
          </h3>
          <p className="mt-2 text-sm text-[#746985] leading-relaxed">
            {searchTerm || selectedSubject !== 'All'
              ? 'Try adjusting your search terms or clearing the subject filter.'
              : 'Create your first flashcard deck manually, or upload a document (PDF, Word, or Text) to generate flashcards automatically!'}
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            {searchTerm || selectedSubject !== 'All' ? (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedSubject('All');
                }}
                className="px-4 py-2 rounded-xl bg-[#EDE9FE] text-[#6D28D9] font-bold text-xs hover:bg-[#DDD6FE] transition-all cursor-pointer"
              >
                Clear Filters
              </button>
            ) : (
              <>
                <button
                  onClick={() => onCreateSet()}
                  className="px-4 py-2 rounded-xl bg-[#7C3AED] text-white font-bold text-xs hover:bg-[#6D28D9] transition-all cursor-pointer"
                >
                  Create Manually
                </button>
                <button
                  onClick={onGoToUpload}
                  className="px-4 py-2 rounded-xl bg-[#FCE7F3] text-[#BE185D] font-bold text-xs hover:bg-[#FBCFE8] transition-all cursor-pointer"
                >
                  Upload & Generate
                </button>
                <button
                  onClick={onResetSamples}
                  className="px-4 py-2 rounded-xl bg-white border border-[#E4DEEC] text-[#645B73] font-bold text-xs hover:bg-[#FAF7F2] transition-all cursor-pointer"
                >
                  Restore Sample Sets
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-[#EDE8F3] shadow-xl text-center">
            <div className="w-12 h-12 rounded-2xl bg-[#FFE4E6] text-[#E11D48] flex items-center justify-center text-xl mx-auto mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-[#383144]">Delete this study set?</h4>
            <p className="text-xs text-[#756A86] mt-2">
              This action cannot be undone. All flashcards within this set will be removed.
            </p>
            <div className="mt-6 flex items-center gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2.5 rounded-2xl border border-[#E2DCED] text-xs font-bold text-[#675C78] hover:bg-[#F7F4FA] transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDeleteSet(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="flex-1 py-2.5 rounded-2xl bg-[#E11D48] hover:bg-[#BE123C] text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
