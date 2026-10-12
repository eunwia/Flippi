import React, { useState, useRef } from 'react';
import { 
  Upload, FileText, CheckCircle2, AlertCircle, Sparkles, 
  Layers, ArrowRight, RefreshCw, Trash2, Edit2, Plus, 
  HelpCircle, Settings, Check, FileCheck, BookOpen, Clock, File
} from 'lucide-react';
import { extractTextFromFile } from '../utils/fileExtractor';
import { generateFlashcards } from '../utils/flashcardGenerator';
import { SUBJECT_OPTIONS, ICON_OPTIONS, THEME_CONFIGS } from '../utils/themeStyles';

export default function FileGenerator({
  savedSets = [],
  userSettings = {},
  onOpenSettings,
  onSaveNewSet,
  onAppendToSet,
  onGoToManual,
  onStudyImmediately,
}) {
  const fileInputRef = useRef(null);

  // Upload & File State
  const [selectedFile, setSelectedFile] = useState(null);
  const [extractedData, setExtractedData] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressState, setProgressState] = useState({ stage: 'idle', percent: 0, message: '' });
  const [errorMessage, setErrorMessage] = useState('');

  // Generation Configuration
  const [generationMode, setGenerationMode] = useState(userSettings.defaultGenerator || 'smart');
  const [cardCount, setCardCount] = useState(10);
  const [topicSubject, setTopicSubject] = useState('General');

  // Generated Cards Preview & Approval State
  const [generatedCards, setGeneratedCards] = useState([]);
  const [selectedCardIds, setSelectedCardIds] = useState(new Set());
  const [hasGenerated, setHasGenerated] = useState(false);

  // Saving Destination: 'new' | 'existing'
  const [saveDestination, setSaveDestination] = useState('new');
  const [newSetTitle, setNewSetTitle] = useState('');
  const [newSetDescription, setNewSetDescription] = useState('');
  const [newSetTheme, setNewSetTheme] = useState('sage');
  const [newSetIcon, setNewSetIcon] = useState('🌸');
  const [selectedExistingSetId, setSelectedExistingSetId] = useState(savedSets[0]?.id || '');

  // Drag and Drop handlers
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processSelectedFile(e.target.files[0]);
    }
  };

  // Process and extract text
  const processSelectedFile = async (file) => {
    setErrorMessage('');
    setSelectedFile(file);
    setIsProcessing(true);
    setHasGenerated(false);
    setGeneratedCards([]);

    // Infer deck title from file name without extension
    const baseName = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
    setNewSetTitle(capitalizeWords(baseName));

    try {
      const result = await extractTextFromFile(file, (progress) => {
        setProgressState(progress);
      });

      setExtractedData(result);

      // Immediately start generation
      await runCardGeneration(result.text, baseName);
    } catch (err) {
      console.error('File extraction failed:', err);
      setErrorMessage(err.message || 'An error occurred while reading the file.');
      setIsProcessing(false);
      setProgressState({ stage: 'error', percent: 0, message: '' });
    }
  };

  // Run Flashcard Generation
  const runCardGeneration = async (textToUse, titleHint = '') => {
    setIsProcessing(true);
    setErrorMessage('');

    try {
      setProgressState({
        stage: 'generating',
        percent: 60,
        message: generationMode === 'ai' ? 'Consulting AI Tutor...' : 'Identifying key definitions and concepts...',
      });

      const cards = await generateFlashcards({
        text: textToUse,
        count: cardCount,
        mode: generationMode,
        apiKey: userSettings.geminiApiKey || '',
        provider: userSettings.aiProvider || 'gemini',
        topic: topicSubject,
        onStatus: (msg) => {
          setProgressState((prev) => ({ ...prev, message: msg }));
        },
      });

      setGeneratedCards(cards);
      setSelectedCardIds(new Set(cards.map((c) => c.id)));
      setHasGenerated(true);
      setProgressState({ stage: 'done', percent: 100, message: `Created ${cards.length} flashcards!` });
    } catch (err) {
      console.error('Generation failed:', err);
      setErrorMessage(err.message || 'Failed to generate flashcards from extracted text.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Regenerate cards
  const handleRegenerate = () => {
    if (extractedData?.text) {
      runCardGeneration(extractedData.text, newSetTitle);
    }
  };

  // Toggle card approval
  const toggleCardSelection = (cardId) => {
    const updated = new Set(selectedCardIds);
    if (updated.has(cardId)) {
      updated.delete(cardId);
    } else {
      updated.add(cardId);
    }
    setSelectedCardIds(updated);
  };

  // Toggle Select All
  const toggleSelectAll = () => {
    if (selectedCardIds.size === generatedCards.length) {
      setSelectedCardIds(new Set());
    } else {
      setSelectedCardIds(new Set(generatedCards.map((c) => c.id)));
    }
  };

  // Update generated card
  const handleUpdateGeneratedCard = (id, field, value) => {
    setGeneratedCards((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    );
  };

  // Delete generated card
  const handleDeleteGeneratedCard = (id) => {
    setGeneratedCards((prev) => prev.filter((c) => c.id !== id));
    const updated = new Set(selectedCardIds);
    updated.delete(id);
    setSelectedCardIds(updated);
  };

  // Add custom card to preview
  const handleAddPreviewCard = () => {
    const newCard = {
      id: `gen_custom_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      question: 'New Question / Term',
      answer: 'New Answer / Definition',
      category: topicSubject,
      difficulty: 'Medium',
      source: 'User Custom',
    };
    setGeneratedCards([...generatedCards, newCard]);
    setSelectedCardIds(new Set([...selectedCardIds, newCard.id]));
  };

  // Final Approve & Save
  const handleApproveAndSave = (andStudy = false) => {
    const approvedCards = generatedCards
      .filter((c) => selectedCardIds.has(c.id))
      .map((c) => ({
        id: c.id,
        question: c.question.trim(),
        answer: c.answer.trim(),
        category: c.category || topicSubject,
        difficulty: c.difficulty || 'Medium',
        mastered: false,
        needsPractice: false,
        starred: false,
        timesReviewed: 0,
      }))
      .filter((c) => c.question && c.answer);

    if (approvedCards.length === 0) {
      setErrorMessage('Please approve and select at least one flashcard to save.');
      return;
    }

    if (saveDestination === 'new') {
      if (!newSetTitle.trim()) {
        setErrorMessage('Please provide a title for the new study set.');
        return;
      }

      const newSet = {
        id: `set_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        title: newSetTitle.trim(),
        description: newSetDescription.trim() || `Generated from ${selectedFile?.name || 'uploaded file'} (${extractedData?.metadata?.wordCount || 0} words)`,
        subject: topicSubject,
        theme: newSetTheme,
        icon: newSetIcon,
        cards: approvedCards,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastStudiedAt: null,
      };

      onSaveNewSet(newSet);
      if (andStudy) {
        onStudyImmediately(newSet);
      }
    } else {
      // Append to existing set
      if (!selectedExistingSetId) {
        setErrorMessage('Please select an existing study set to append cards to.');
        return;
      }

      const targetSet = savedSets.find((s) => s.id === selectedExistingSetId);
      if (!targetSet) {
        setErrorMessage('Selected study set not found.');
        return;
      }

      const updatedSet = {
        ...targetSet,
        cards: [...(targetSet.cards || []), ...approvedCards],
        updatedAt: new Date().toISOString(),
      };

      onAppendToSet(updatedSet);
      if (andStudy) {
        onStudyImmediately(updatedSet);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-in fade-in duration-200">
      
      {/* Header Banner */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#DCFCE7] text-[#15803D] border border-[#BBF7D0]">
            🌿 Smart File Processor
          </span>
          <span className="text-xs text-[#8A8098]">PDF • DOCX • TXT</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#383144] tracking-tight">
          Generate Flashcards from Files 📄✨
        </h1>
        <p className="text-xs sm:text-sm text-[#706482] mt-1 max-w-2xl leading-relaxed">
          Upload class notes, textbooks, research papers, or syllabus slides. Our intelligent extractor automatically detects definitions, mechanisms, and key takeaways to generate high-yield study cards.
        </p>
      </div>

      {/* Mode and Option Configuration */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#EDE8F3] shadow-xs space-y-4">
        <h3 className="text-xs font-bold text-[#564C66] uppercase tracking-wider">
          Generation Settings
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Extractor Engine */}
          <div>
            <label className="text-xs font-bold text-[#564C66] block mb-1">
              Extractor Engine
            </label>
            <div className="flex rounded-2xl bg-[#FAF8FC] p-1 border border-[#E9E2F1]">
              <button
                type="button"
                onClick={() => setGenerationMode('smart')}
                className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  generationMode === 'smart'
                    ? 'bg-white text-[#7C3AED] shadow-xs'
                    : 'text-[#7B718B] hover:text-[#383144]'
                }`}
              >
                Smart Local (Offline)
              </button>
              <button
                type="button"
                onClick={() => setGenerationMode('ai')}
                className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  generationMode === 'ai'
                    ? 'bg-[#EDE9FE] text-[#6D28D9] shadow-xs'
                    : 'text-[#7B718B] hover:text-[#383144]'
                }`}
              >
                AI Tutor 🤖
              </button>
            </div>
            {generationMode === 'ai' && !userSettings.geminiApiKey && (
              <p className="text-[11px] text-[#BE185D] mt-1.5 flex items-center gap-1">
                <span>⚠️</span> No Gemini Key set.{' '}
                <button
                  type="button"
                  onClick={onOpenSettings}
                  className="underline font-bold hover:text-[#9D174D] cursor-pointer"
                >
                  Configure in Settings
                </button>
              </p>
            )}
          </div>

          {/* Target Card Count */}
          <div>
            <label className="text-xs font-bold text-[#564C66] block mb-1">
              Target Card Count
            </label>
            <select
              value={cardCount}
              onChange={(e) => setCardCount(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-2xl bg-[#FAF8FC] border border-[#E9E2F1] text-xs font-bold text-[#383144] focus:outline-none focus:ring-2 focus:ring-[#C4B5FD] cursor-pointer"
            >
              <option value={5}>5 Flashcards (Quick review)</option>
              <option value={10}>10 Flashcards (Standard)</option>
              <option value={15}>15 Flashcards (Comprehensive)</option>
              <option value={20}>20 Flashcards (Deep dive)</option>
            </select>
          </div>

          {/* Subject Tag */}
          <div>
            <label className="text-xs font-bold text-[#564C66] block mb-1">
              Subject Category
            </label>
            <select
              value={topicSubject}
              onChange={(e) => setTopicSubject(e.target.value)}
              className="w-full px-3 py-2 rounded-2xl bg-[#FAF8FC] border border-[#E9E2F1] text-xs font-bold text-[#383144] focus:outline-none focus:ring-2 focus:ring-[#C4B5FD] cursor-pointer"
            >
              {SUBJECT_OPTIONS.map((sub) => (
                <option key={sub} value={sub}>{sub}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Upload Drag & Drop Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center transition-all duration-300 cursor-pointer ${
          isDragOver
            ? 'border-[#7C3AED] bg-[#F5F1FF] scale-[1.01]'
            : 'border-[#DDD6FE] hover:border-[#7C3AED] bg-white hover:bg-[#FAF8FF]'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,.txt"
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-[#EDE9FE] via-[#FCE7F3] to-[#DCFCE7] flex items-center justify-center text-3xl mx-auto shadow-xs mb-4">
          <Upload className="w-7 h-7 text-[#7C3AED]" />
        </div>

        <h3 className="text-base sm:text-lg font-bold text-[#383144]">
          {selectedFile ? `Selected: ${selectedFile.name}` : 'Click to upload or drag & drop files here'}
        </h3>
        <p className="text-xs text-[#7B718B] mt-1 max-w-sm mx-auto leading-relaxed">
          Supports <span className="font-bold text-[#6D28D9]">PDF</span>,{' '}
          <span className="font-bold text-[#BE185D]">DOCX</span>, and{' '}
          <span className="font-bold text-[#059669]">TXT</span> files up to 25 MB.
        </p>

        {/* Format Badges */}
        <div className="mt-4 flex items-center justify-center gap-2">
          <span className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-[#F5F2F9] text-[#695F77] border border-[#EAE4F1]">
            📄 .PDF
          </span>
          <span className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-[#F5F2F9] text-[#695F77] border border-[#EAE4F1]">
            📝 .DOCX
          </span>
          <span className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-[#F5F2F9] text-[#695F77] border border-[#EAE4F1]">
            📑 .TXT
          </span>
        </div>
      </div>

      {/* Quick Sample Notes for Testing */}
      <div className="bg-[#FAF8FC] rounded-2xl p-3.5 border border-[#EBE4F3] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <span className="text-[#756A86] font-semibold flex items-center gap-1.5">
          <span>✨</span> Don&apos;t have a file on hand? Try a sample study note:
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={async () => {
              try {
                setIsProcessing(true);
                const res = await fetch('/sample-notes/Biology_Cell_Study_Guide.txt');
                const txt = await res.text();
                const mockFile = new File([txt], 'Biology_Cell_Study_Guide.txt', { type: 'text/plain' });
                processSelectedFile(mockFile);
              } catch (e) {
                setErrorMessage('Error loading demo note: ' + e.message);
                setIsProcessing(false);
              }
            }}
            className="px-3 py-1.5 rounded-xl bg-white hover:bg-[#F3EEFA] border border-[#DDD6FE] text-[#6D28D9] font-bold text-xs transition-all cursor-pointer shadow-2xs"
          >
            🌿 Biology 101 Notes
          </button>
          <button
            type="button"
            onClick={async () => {
              try {
                setIsProcessing(true);
                const res = await fetch('/sample-notes/Web_Development_Networking.txt');
                const txt = await res.text();
                const mockFile = new File([txt], 'Web_Development_Networking.txt', { type: 'text/plain' });
                processSelectedFile(mockFile);
              } catch (e) {
                setErrorMessage('Error loading demo note: ' + e.message);
                setIsProcessing(false);
              }
            }}
            className="px-3 py-1.5 rounded-xl bg-white hover:bg-[#F3EEFA] border border-[#DDD6FE] text-[#6D28D9] font-bold text-xs transition-all cursor-pointer shadow-2xs"
          >
            💻 Web Systems Notes
          </button>
        </div>
      </div>

      {/* Error Message Box */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-[#FFF1F2] border border-[#FECDD3] text-[#BE123C] text-xs font-bold flex items-start gap-3 animate-in slide-in-from-top-2">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-extrabold">Notice regarding your file:</p>
            <p className="font-normal text-[11.5px] leading-relaxed">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Extraction & Generation Progress Bar */}
      {isProcessing && (
        <div className="bg-white rounded-3xl p-6 border border-[#EDE8F3] shadow-xs space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between text-xs font-bold text-[#564C66]">
            <span className="flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#7C3AED]" />
              {progressState.message || 'Processing file and analyzing content...'}
            </span>
            <span className="text-[#7C3AED] font-extrabold">{progressState.percent}%</span>
          </div>

          <div className="w-full bg-[#EFEAF6] h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-[#7C3AED] via-[#DB2777] to-[#10B981] h-full rounded-full transition-all duration-300"
              style={{ width: `${progressState.percent}%` }}
            />
          </div>

          <p className="text-[11px] text-[#8E849C] text-center">
            Extracting definitions, terms, and testable concepts from your document...
          </p>
        </div>
      )}

      {/* Extracted File Metadata Summary */}
      {extractedData && !isProcessing && (
        <div className="bg-[#FAF8FC] rounded-2xl p-4 border border-[#EAE3F2] flex flex-wrap items-center justify-between gap-3 text-xs text-[#635974]">
          <div className="flex items-center gap-2.5">
            <FileCheck className="w-4 h-4 text-[#059669]" />
            <span className="font-bold text-[#383144]">{extractedData.metadata.fileName}</span>
            <span className="px-2 py-0.5 rounded-full bg-white text-[#7C3AED] font-bold border border-[#E2DCED]">
              {extractedData.metadata.fileType}
            </span>
            {extractedData.metadata.pageCount && (
              <span>• {extractedData.metadata.pageCount} Pages</span>
            )}
            <span>• {extractedData.metadata.wordCount.toLocaleString()} Words extracted</span>
          </div>

          <button
            type="button"
            onClick={handleRegenerate}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-[#F3EEF9] border border-[#DDD6FE] text-[#6D28D9] font-bold text-xs transition-all cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Regenerate Cards</span>
          </button>
        </div>
      )}

      {/* Preview & Approval Screen */}
      {hasGenerated && generatedCards.length > 0 && (
        <div className="space-y-6 animate-in fade-in duration-300">
          
          {/* Header of Preview */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-3xl border border-[#EDE8F3] shadow-xs">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl">🌸</span>
                <h3 className="text-lg font-bold text-[#383144]">
                  Preview & Approve Generated Cards
                </h3>
              </div>
              <p className="text-xs text-[#7B718B] mt-0.5">
                Review each card below. Edit text, adjust difficulty, or uncheck cards you don&apos;t want.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleSelectAll}
                className="px-3 py-1.5 rounded-xl bg-[#FAF8FC] hover:bg-[#F0ECF6] border border-[#E4DDEE] text-xs font-bold text-[#564C66] cursor-pointer"
              >
                {selectedCardIds.size === generatedCards.length ? 'Deselect All' : 'Select All'}
              </button>
              <button
                type="button"
                onClick={handleAddPreviewCard}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#EDE9FE] text-[#6D28D9] text-xs font-bold hover:bg-[#DDD6FE] cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Card</span>
              </button>
            </div>
          </div>

          {/* Cards Preview Grid */}
          <div className="space-y-4">
            {generatedCards.map((card, idx) => {
              const isSelected = selectedCardIds.has(card.id);
              return (
                <div
                  key={card.id}
                  className={`rounded-3xl p-5 sm:p-6 border transition-all duration-200 ${
                    isSelected
                      ? 'bg-white border-[#DDD6FE] shadow-xs ring-1 ring-[#C4B5FD]/40'
                      : 'bg-[#FAF9FC] border-[#ECE7F2] opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between border-b border-[#FAF6FC] pb-3 mb-3">
                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleCardSelection(card.id)}
                        className="w-4 h-4 rounded text-[#7C3AED] focus:ring-[#C4B5FD] cursor-pointer"
                      />
                      <span className="text-xs font-bold text-[#4B405C]">
                        Card #{idx + 1} {isSelected ? '🌸 Included' : '(Excluded)'}
                      </span>
                    </label>

                    <div className="flex items-center gap-2">
                      {card.source && (
                        <span className="text-[10px] text-[#9A91A5] bg-[#FAF8FC] px-2 py-0.5 rounded-full border border-[#EAE3F2]">
                          {card.source}
                        </span>
                      )}
                      <select
                        value={card.difficulty || 'Medium'}
                        onChange={(e) => handleUpdateGeneratedCard(card.id, 'difficulty', e.target.value)}
                        className="text-[11px] font-bold px-2 py-1 rounded-xl bg-[#FAF8FC] border border-[#EAE3F2] text-[#695F77] focus:outline-none cursor-pointer"
                      >
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => handleDeleteGeneratedCard(card.id)}
                        className="p-1.5 rounded-xl text-[#9A91A5] hover:text-[#E11D48] hover:bg-[#FFE4E6] cursor-pointer"
                        title="Delete this generated card"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Editable Question */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[#564C66]">Question / Term</label>
                      <textarea
                        rows={2}
                        value={card.question}
                        onChange={(e) => handleUpdateGeneratedCard(card.id, 'question', e.target.value)}
                        className="w-full p-2.5 rounded-2xl bg-[#FAF8FD] border border-[#EAE3F2] text-xs sm:text-sm text-[#383144] focus:outline-none focus:ring-2 focus:ring-[#C4B5FD] focus:bg-white resize-none"
                      />
                    </div>

                    {/* Editable Answer */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[#564C66]">Answer / Definition</label>
                      <textarea
                        rows={2}
                        value={card.answer}
                        onChange={(e) => handleUpdateGeneratedCard(card.id, 'answer', e.target.value)}
                        className="w-full p-2.5 rounded-2xl bg-[#FAF8FD] border border-[#EAE3F2] text-xs sm:text-sm text-[#383144] focus:outline-none focus:ring-2 focus:ring-[#C4B5FD] focus:bg-white resize-none"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Destination Selection (Save to New Set or Append to Existing) */}
          <div className="bg-white rounded-3xl p-6 border border-[#EDE8F3] shadow-xs space-y-5">
            <h4 className="text-sm font-bold text-[#383144] flex items-center gap-2">
              <span>📚</span> Choose Where to Save Your Approved Cards
            </h4>

            {/* Destination Toggle */}
            <div className="flex rounded-2xl bg-[#FAF8FC] p-1 border border-[#E8E1F0] max-w-md">
              <button
                type="button"
                onClick={() => setSaveDestination('new')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  saveDestination === 'new'
                    ? 'bg-white text-[#7C3AED] shadow-xs'
                    : 'text-[#7B718B]'
                }`}
              >
                + Create New Study Set
              </button>
              <button
                type="button"
                onClick={() => setSaveDestination('existing')}
                disabled={savedSets.length === 0}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  saveDestination === 'existing'
                    ? 'bg-white text-[#7C3AED] shadow-xs'
                    : 'text-[#7B718B] disabled:opacity-40'
                }`}
              >
                Append to Existing Set
              </button>
            </div>

            {saveDestination === 'new' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="space-y-1 md:col-span-2">
                  <label className="text-xs font-bold text-[#564C66]">New Set Title</label>
                  <input
                    type="text"
                    value={newSetTitle}
                    onChange={(e) => setNewSetTitle(e.target.value)}
                    placeholder="e.g. Chapter 4: Cellular Respiration"
                    className="w-full px-4 py-2.5 rounded-2xl bg-[#FAF8FC] border border-[#E7E0EF] text-sm text-[#383144] focus:outline-none focus:ring-2 focus:ring-[#C4B5FD]"
                  />
                </div>

                {/* Theme Selector */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#564C66]">Theme Palette</label>
                  <select
                    value={newSetTheme}
                    onChange={(e) => setNewSetTheme(e.target.value)}
                    className="w-full px-3 py-2 rounded-2xl bg-[#FAF8FC] border border-[#E7E0EF] text-xs font-bold text-[#383144]"
                  >
                    <option value="sage">Sage Meadow 🌿</option>
                    <option value="lavender">Lavender Dream 💜</option>
                    <option value="blush">Blush Rose 🌸</option>
                    <option value="peach">Peach Vanilla 🍑</option>
                    <option value="sky">Sky Serenade ☁️</option>
                  </select>
                </div>

                {/* Icon Selector */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#564C66]">Icon Emoji</label>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {ICON_OPTIONS.slice(0, 7).map((emoji) => (
                      <button
                        type="button"
                        key={emoji}
                        onClick={() => setNewSetIcon(emoji)}
                        className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm cursor-pointer ${
                          newSetIcon === emoji
                            ? 'bg-[#EDE9FE] border-2 border-[#7C3AED]'
                            : 'bg-[#FAF8FC] border border-[#EAE3F2]'
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="pt-2 space-y-1">
                <label className="text-xs font-bold text-[#564C66]">Select Study Set</label>
                <select
                  value={selectedExistingSetId}
                  onChange={(e) => setSelectedExistingSetId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-[#FAF8FC] border border-[#E7E0EF] text-sm text-[#383144] font-bold"
                >
                  {savedSets.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.icon || '🌸'} {s.title} ({s.cards?.length || 0} cards)
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Sticky Approval Bar */}
          <div className="sticky bottom-4 z-20 bg-white/95 backdrop-blur-md rounded-3xl p-4 border border-[#EDE8F3] shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="text-xs text-[#716682]">
              <span className="font-extrabold text-[#383144]">
                {selectedCardIds.size} of {generatedCards.length} flashcards
              </span>{' '}
              approved and ready to save.
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => handleApproveAndSave(false)}
                className="px-5 py-2.5 rounded-2xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold text-xs shadow-md shadow-[#DDD6FE] transition-all cursor-pointer hover:-translate-y-0.5"
              >
                Approve & Save Cards
              </button>
              <button
                type="button"
                onClick={() => handleApproveAndSave(true)}
                className="px-5 py-2.5 rounded-2xl bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs shadow-md shadow-[#A7F3D0] transition-all cursor-pointer hover:-translate-y-0.5"
              >
                Approve & Study Now 🌸
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
