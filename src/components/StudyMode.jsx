import React, { useState, useEffect, useCallback, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { 
  RotateCw, ArrowLeft, ArrowRight, Shuffle, Volume2, 
  Star, CheckCircle2, HelpCircle, Award, BookOpen, 
  Sparkles, Keyboard, RefreshCcw, Eye, ChevronLeft
} from 'lucide-react';
import { getTheme } from '../utils/themeStyles';
import { recordStudySession } from '../utils/storage';

export default function StudyMode({
  studySet,
  onExitStudy,
  onUpdateSetCards,
}) {
  const theme = getTheme(studySet.theme);

  // Filter mode: 'all' | 'needsPractice' | 'starred'
  const [filterMode, setFilterMode] = useState('all');
  
  // Working list of cards
  const [cardsList, setCardsList] = useState(() => {
    return [...(studySet.cards || [])];
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);
  
  // Session tracking tallies
  const [sessionMasteredCount, setSessionMasteredCount] = useState(0);
  const [sessionPracticeCount, setSessionPracticeCount] = useState(0);

  // Filter cards based on filterMode
  const activeCards = useMemo(() => {
    if (filterMode === 'needsPractice') {
      const filtered = cardsList.filter((c) => c.needsPractice);
      return filtered.length > 0 ? filtered : cardsList;
    }
    if (filterMode === 'starred') {
      const filtered = cardsList.filter((c) => c.starred);
      return filtered.length > 0 ? filtered : cardsList;
    }
    return cardsList;
  }, [cardsList, filterMode]);

  const currentCard = activeCards[currentIndex] || null;
  const totalInSession = activeCards.length;

  // Handle flipping
  const handleFlip = useCallback(() => {
    setIsFlipped((prev) => !prev);
  }, []);

  // Handle navigation
  const handleNext = useCallback(() => {
    if (currentIndex < totalInSession - 1) {
      setIsFlipped(false);
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Completed session!
      triggerCompletion();
    }
  }, [currentIndex, totalInSession]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setIsFlipped(false);
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex]);

  // Handle Shuffle
  const handleShuffle = useCallback(() => {
    setIsFlipped(false);
    setCurrentIndex(0);
    const shuffled = [...cardsList].sort(() => Math.random() - 0.5);
    setCardsList(shuffled);
  }, [cardsList]);

  // Handle Restart
  const handleRestart = useCallback(() => {
    setIsFlipped(false);
    setCurrentIndex(0);
    setSessionCompleted(false);
    setSessionMasteredCount(0);
    setSessionPracticeCount(0);
  }, []);

  // Mark card Know It / Mastered
  const handleMarkMastered = useCallback(() => {
    if (!currentCard) return;
    const cardId = currentCard.id;

    // Update state in working list
    setCardsList((prevList) => {
      const updated = prevList.map((c) => {
        if (c.id === cardId) {
          return {
            ...c,
            mastered: true,
            needsPractice: false,
            timesReviewed: (c.timesReviewed || 0) + 1,
          };
        }
        return c;
      });
      onUpdateSetCards(studySet.id, updated);
      return updated;
    });

    setSessionMasteredCount((prev) => prev + 1);
    handleNext();
  }, [currentCard, studySet.id, onUpdateSetCards, handleNext]);

  // Mark card Need Practice
  const handleMarkPractice = useCallback(() => {
    if (!currentCard) return;
    const cardId = currentCard.id;

    setCardsList((prevList) => {
      const updated = prevList.map((c) => {
        if (c.id === cardId) {
          return {
            ...c,
            mastered: false,
            needsPractice: true,
            timesReviewed: (c.timesReviewed || 0) + 1,
          };
        }
        return c;
      });
      onUpdateSetCards(studySet.id, updated);
      return updated;
    });

    setSessionPracticeCount((prev) => prev + 1);
    handleNext();
  }, [currentCard, studySet.id, onUpdateSetCards, handleNext]);

  // Toggle Star on current card
  const handleToggleStar = useCallback(() => {
    if (!currentCard) return;
    const cardId = currentCard.id;

    setCardsList((prevList) => {
      const updated = prevList.map((c) => {
        if (c.id === cardId) {
          return { ...c, starred: !c.starred };
        }
        return c;
      });
      onUpdateSetCards(studySet.id, updated);
      return updated;
    });
  }, [currentCard, studySet.id, onUpdateSetCards]);

  // Text to Speech
  const speakCurrent = useCallback(() => {
    if (!window.speechSynthesis || !currentCard) return;
    window.speechSynthesis.cancel();
    const textToRead = isFlipped ? currentCard.answer : currentCard.question;
    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
  }, [currentCard, isFlipped]);

  // Trigger celebratory confetti on completion
  const triggerCompletion = useCallback(() => {
    setSessionCompleted(true);
    recordStudySession({ cardsStudiedCount: totalInSession });

    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#DDD6FE', '#FBCFE8', '#DCFCE7', '#FEF08A', '#BAE6FD'],
      });
    } catch (e) {
      // Confetti fallback
    }
  }, [totalInSession]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't intercept if an input is focused
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) return;

      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        handleFlip();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === '1') {
        e.preventDefault();
        handleMarkPractice();
      } else if (e.key === '2') {
        e.preventDefault();
        handleMarkMastered();
      } else if (e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleShuffle();
      } else if (e.key.toLowerCase() === 'r') {
        e.preventDefault();
        handleRestart();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleFlip, handleNext, handlePrev, handleMarkPractice, handleMarkMastered, handleShuffle, handleRestart]);

  if (!studySet || !studySet.cards || studySet.cards.length === 0) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center">
        <p className="text-base text-[#645B73]">This study set doesn&apos;t have any cards yet.</p>
        <button
          onClick={onExitStudy}
          className="mt-4 px-5 py-2.5 rounded-2xl bg-[#7C3AED] text-white font-bold text-xs"
        >
          Return to Sets
        </button>
      </div>
    );
  }

  // Session Completion View
  if (sessionCompleted) {
    const needsPracticeRemaining = cardsList.filter((c) => c.needsPractice).length;
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 animate-in zoom-in-95 duration-300">
        <div className="bg-white rounded-3xl border border-[#EDE8F3] p-8 sm:p-10 shadow-lg text-center relative overflow-hidden">
          {/* Pastel Sparkles */}
          <div className="absolute top-4 left-6 text-2xl animate-float-slow">🌸</div>
          <div className="absolute top-6 right-8 text-2xl animate-pulse-subtle">✨</div>
          <div className="absolute bottom-6 right-10 text-2xl">🌿</div>

          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-[#EDE9FE] via-[#FCE7F3] to-[#DCFCE7] flex items-center justify-center text-4xl mx-auto shadow-sm">
            🌸
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#383144] mt-5">
            Sweet Job! Session Complete!
          </h2>
          <p className="text-sm text-[#6C617B] mt-2 max-w-md mx-auto leading-relaxed">
            You just studied through <span className="font-bold text-[#7C3AED]">{totalInSession} flashcards</span> in{' '}
            <span className="font-bold text-[#383144]">&ldquo;{studySet.title}&rdquo;</span>.
          </p>

          {/* Stats Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-8">
            <div className="bg-[#FAF8FF] border border-[#EDE9FE] rounded-2xl p-4">
              <p className="text-xs font-bold text-[#8A8197] uppercase tracking-wider">Studied</p>
              <h4 className="text-2xl font-extrabold text-[#7C3AED] mt-1">{totalInSession}</h4>
            </div>
            <div className="bg-[#F0FDF4] border border-[#DCFCE7] rounded-2xl p-4">
              <p className="text-xs font-bold text-[#8A8197] uppercase tracking-wider">Know It 🌸</p>
              <h4 className="text-2xl font-extrabold text-[#059669] mt-1">{sessionMasteredCount}</h4>
            </div>
            <div className="bg-[#FFF1F2] border border-[#FCE7F3] rounded-2xl p-4 col-span-2 sm:col-span-1">
              <p className="text-xs font-bold text-[#8A8197] uppercase tracking-wider">Need Practice 💭</p>
              <h4 className="text-2xl font-extrabold text-[#DB2777] mt-1">{sessionPracticeCount}</h4>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            {needsPracticeRemaining > 0 && (
              <button
                onClick={() => {
                  setFilterMode('needsPractice');
                  handleRestart();
                }}
                className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-[#DB2777] hover:bg-[#BE185D] text-white font-bold text-xs shadow-md shadow-[#FCE7F3] transition-all cursor-pointer hover:-translate-y-0.5"
              >
                💭 Review {needsPracticeRemaining} Need-Practice Cards
              </button>
            )}

            <button
              onClick={() => {
                setFilterMode('all');
                handleRestart();
              }}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold text-xs shadow-md shadow-[#DDD6FE] transition-all cursor-pointer hover:-translate-y-0.5"
            >
              <RefreshCcw className="w-3.5 h-3.5 inline mr-1.5" /> Study All Again
            </button>

            <button
              onClick={onExitStudy}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-white border border-[#E2DCED] text-[#554B64] hover:bg-[#FAF7F2] font-bold text-xs transition-all cursor-pointer"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentNumber = currentIndex + 1;
  const progressPct = totalInSession > 0 ? Math.round((currentNumber / totalInSession) * 100) : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      
      {/* Top Header Bar */}
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={onExitStudy}
          className="flex items-center gap-1.5 text-xs font-bold text-[#6D637E] hover:text-[#383144] px-3 py-1.5 rounded-xl hover:bg-white border border-transparent hover:border-[#E8E2EE] transition-all cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Exit Study</span>
        </button>

        {/* Set Title & Mode Badge */}
        <div className="text-center truncate px-2">
          <div className="flex items-center justify-center gap-2">
            <span className="text-base">{studySet.icon || '🌸'}</span>
            <h2 className="text-sm sm:text-base font-extrabold text-[#383144] truncate">
              {studySet.title}
            </h2>
          </div>
          {filterMode !== 'all' && (
            <span className="inline-block mt-0.5 px-2 py-0.2 rounded-full text-[10px] font-bold bg-[#FCE7F3] text-[#BE185D]">
              Mode: {filterMode === 'needsPractice' ? 'Reviewing Practice Cards' : 'Starred Only'}
            </span>
          )}
        </div>

        {/* Keyboard Help trigger */}
        <button
          onClick={() => setShowKeyboardHelp(true)}
          className="flex items-center gap-1 text-xs font-bold text-[#776C87] hover:text-[#4A405A] p-2 rounded-xl hover:bg-white border border-transparent hover:border-[#E8E2EE] transition-all cursor-pointer"
          title="Keyboard shortcuts"
        >
          <Keyboard className="w-4 h-4" />
          <span className="hidden sm:inline">Keys</span>
        </button>
      </div>

      {/* Study Progress Indicator */}
      <div className="bg-white rounded-2xl p-3.5 border border-[#EDE8F3] shadow-xs">
        <div className="flex items-center justify-between text-xs font-bold text-[#6E647D] mb-1.5">
          <span>Card {currentNumber} of {totalInSession}</span>
          <span className="text-[#7C3AED]">{progressPct}%</span>
        </div>
        <div className="w-full bg-[#EAE5F2] h-2 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-[#7C3AED] via-[#DB2777] to-[#10B981] h-full rounded-full transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Main 3D Flip Flashcard */}
      <div className="perspective-1000 w-full min-h-[340px] sm:min-h-[380px]">
        <div
          onClick={handleFlip}
          className={`relative w-full min-h-[340px] sm:min-h-[380px] rounded-3xl cursor-pointer transition-transform duration-500 transform-style-3d select-none shadow-sm hover:shadow-md ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
        >
          {/* FRONT FACE (Question / Term) */}
          <div className="absolute inset-0 w-full h-full backface-hidden rounded-3xl bg-white border-2 border-[#E9E2F1] p-6 sm:p-10 flex flex-col justify-between">
            {/* Top row of card front */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#EDE9FE] text-[#6D28D9] border border-[#DDD6FE]">
                  Question / Term
                </span>
                {currentCard?.category && (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#F5F2F8] text-[#716781]">
                    {currentCard.category}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={speakCurrent}
                  className="p-2 rounded-xl text-[#8E859B] hover:text-[#4A405A] hover:bg-[#F5F2F9] transition-all cursor-pointer"
                  title="Read question aloud"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
                <button
                  onClick={handleToggleStar}
                  className={`p-2 rounded-xl transition-all cursor-pointer ${
                    currentCard?.starred
                      ? 'text-[#F59E0B] bg-[#FEF3C7]'
                      : 'text-[#8E859B] hover:text-[#F59E0B] hover:bg-[#F5F2F9]'
                  }`}
                  title={currentCard?.starred ? 'Starred card' : 'Star this card'}
                >
                  <Star className={`w-4 h-4 ${currentCard?.starred ? 'fill-current' : ''}`} />
                </button>
              </div>
            </div>

            {/* Question Text Center */}
            <div className="my-auto py-6 text-center">
              <h3 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[#383144] tracking-tight leading-snug">
                {currentCard?.question}
              </h3>
            </div>

            {/* Bottom Flip Hint */}
            <div className="text-center">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#8C829B] bg-[#FAF8FC] px-3.5 py-1.5 rounded-full border border-[#EDE7F4]">
                <RotateCw className="w-3.5 h-3.5 text-[#7C3AED]" />
                Click card or press [Space] to flip
              </span>
            </div>
          </div>

          {/* BACK FACE (Answer / Definition) */}
          <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 rounded-3xl bg-gradient-to-br from-[#FFFDF9] via-[#FAF6FF] to-[#F5FFF8] border-2 border-[#DDD6FE] p-6 sm:p-10 flex flex-col justify-between">
            {/* Top row of card back */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#DCFCE7] text-[#15803D] border border-[#BBF7D0]">
                  Answer / Definition
                </span>
                {currentCard?.difficulty && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    currentCard.difficulty === 'Hard'
                      ? 'bg-[#FFE4E6] text-[#BE123C]'
                      : currentCard.difficulty === 'Medium'
                      ? 'bg-[#FEF3C7] text-[#B45309]'
                      : 'bg-[#E0F2FE] text-[#0369A1]'
                  }`}>
                    {currentCard.difficulty}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={speakCurrent}
                  className="p-2 rounded-xl text-[#8E859B] hover:text-[#4A405A] hover:bg-[#F5F2F9] transition-all cursor-pointer"
                  title="Read answer aloud"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
                <button
                  onClick={handleToggleStar}
                  className={`p-2 rounded-xl transition-all cursor-pointer ${
                    currentCard?.starred
                      ? 'text-[#F59E0B] bg-[#FEF3C7]'
                      : 'text-[#8E859B] hover:text-[#F59E0B] hover:bg-[#F5F2F9]'
                  }`}
                >
                  <Star className={`w-4 h-4 ${currentCard?.starred ? 'fill-current' : ''}`} />
                </button>
              </div>
            </div>

            {/* Answer Text Center */}
            <div className="my-auto py-6 text-center">
              <p className="text-base sm:text-xl font-bold text-[#3B3448] leading-relaxed max-w-xl mx-auto">
                {currentCard?.answer}
              </p>
            </div>

            {/* Bottom Flip Back Hint */}
            <div className="text-center">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#8C829B] bg-white px-3.5 py-1.5 rounded-full border border-[#EDE7F4]">
                <RotateCw className="w-3.5 h-3.5 text-[#10B981]" />
                Click card to flip back to question
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Active Recall / Mastery Buttons ("Need Practice" & "Know It") */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 max-w-lg mx-auto">
        <button
          onClick={handleMarkPractice}
          className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-[#FFF1F2] hover:bg-[#FFE4E6] text-[#BE123C] border border-[#FECDD3] font-bold text-sm shadow-xs transition-all duration-200 cursor-pointer hover:-translate-y-0.5 active:translate-y-0"
        >
          <span>💭</span>
          <span>Need Practice</span>
          <span className="hidden sm:inline text-[11px] font-normal text-[#BE123C]/70 bg-white/70 px-1.5 py-0.5 rounded-md">[1]</span>
        </button>

        <button
          onClick={handleMarkMastered}
          className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-[#ECFDF5] hover:bg-[#D1FAE5] text-[#047857] border border-[#A7F3D0] font-bold text-sm shadow-xs transition-all duration-200 cursor-pointer hover:-translate-y-0.5 active:translate-y-0"
        >
          <span>🌸</span>
          <span>Know It!</span>
          <span className="hidden sm:inline text-[11px] font-normal text-[#047857]/70 bg-white/70 px-1.5 py-0.5 rounded-md">[2]</span>
        </button>
      </div>

      {/* Navigation Controls (Prev, Next, Flip, Shuffle, Restart) */}
      <div className="flex items-center justify-between gap-3 max-w-lg mx-auto bg-white p-2.5 rounded-2xl border border-[#EDE8F3] shadow-xs">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className={`flex items-center gap-1 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            currentIndex === 0
              ? 'text-[#C5BED0] cursor-not-allowed'
              : 'text-[#5E546F] hover:bg-[#F5F2F9]'
          }`}
          title="Previous card (Left Arrow)"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Prev</span>
        </button>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleShuffle}
            className="p-2 rounded-xl text-[#786E87] hover:text-[#4A405A] hover:bg-[#F5F2F9] transition-all cursor-pointer"
            title="Shuffle cards [S]"
          >
            <Shuffle className="w-4 h-4" />
          </button>
          <button
            onClick={handleFlip}
            className="px-4 py-2 rounded-xl bg-[#EDE9FE] text-[#6D28D9] hover:bg-[#DDD6FE] text-xs font-bold transition-all cursor-pointer"
          >
            Flip Card
          </button>
          <button
            onClick={handleRestart}
            className="p-2 rounded-xl text-[#786E87] hover:text-[#4A405A] hover:bg-[#F5F2F9] transition-all cursor-pointer"
            title="Restart session [R]"
          >
            <RefreshCcw className="w-4 h-4" />
          </button>
        </div>

        <button
          onClick={handleNext}
          className="flex items-center gap-1 px-3.5 py-2 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
          title="Next card (Right Arrow)"
        >
          <span>{currentIndex === totalInSession - 1 ? 'Finish' : 'Next'}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Keyboard Shortcuts Modal */}
      {showKeyboardHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-[#EDE8F3] shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#F0EAF5]">
              <div className="flex items-center gap-2">
                <Keyboard className="w-4 h-4 text-[#7C3AED]" />
                <h4 className="text-sm font-bold text-[#383144]">Keyboard Controls</h4>
              </div>
              <button
                onClick={() => setShowKeyboardHelp(false)}
                className="text-xs font-bold text-[#8C829B] hover:text-[#383144] p-1"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-2.5 text-xs text-[#5D536D]">
              <div className="flex items-center justify-between py-1 border-b border-[#FAF7FC]">
                <span>Flip Card</span>
                <kbd className="px-2 py-0.5 rounded-lg bg-[#FAF7FC] border border-[#E9E2F1] font-mono font-bold">Space / Enter</kbd>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-[#FAF7FC]">
                <span>Next Card</span>
                <kbd className="px-2 py-0.5 rounded-lg bg-[#FAF7FC] border border-[#E9E2F1] font-mono font-bold">→</kbd>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-[#FAF7FC]">
                <span>Previous Card</span>
                <kbd className="px-2 py-0.5 rounded-lg bg-[#FAF7FC] border border-[#E9E2F1] font-mono font-bold">←</kbd>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-[#FAF7FC]">
                <span>Need Practice</span>
                <kbd className="px-2 py-0.5 rounded-lg bg-[#FAF7FC] border border-[#E9E2F1] font-mono font-bold">1</kbd>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-[#FAF7FC]">
                <span>Know It!</span>
                <kbd className="px-2 py-0.5 rounded-lg bg-[#FAF7FC] border border-[#E9E2F1] font-mono font-bold">2</kbd>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-[#FAF7FC]">
                <span>Shuffle Deck</span>
                <kbd className="px-2 py-0.5 rounded-lg bg-[#FAF7FC] border border-[#E9E2F1] font-mono font-bold">S</kbd>
              </div>
              <div className="flex items-center justify-between py-1">
                <span>Restart Session</span>
                <kbd className="px-2 py-0.5 rounded-lg bg-[#FAF7FC] border border-[#E9E2F1] font-mono font-bold">R</kbd>
              </div>
            </div>

            <button
              onClick={() => setShowKeyboardHelp(false)}
              className="mt-5 w-full py-2.5 rounded-2xl bg-[#EDE9FE] text-[#6D28D9] font-bold text-xs hover:bg-[#DDD6FE] transition-all cursor-pointer"
            >
              Got it! ✨
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
