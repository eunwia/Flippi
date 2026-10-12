import React, { useState, useEffect, useMemo } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import StudyMode from './components/StudyMode';
import ManualCreator from './components/ManualCreator';
import FileGenerator from './components/FileGenerator';
import MyFlashcards from './components/MyFlashcards';
import SettingsModal from './components/SettingsModal';
import { 
  getSavedSets, saveSets, saveSingleSet, deleteSetById, 
  getSavedSettings, saveSettings, getStudyStats, resetToSampleSets 
} from './utils/storage';
import { Sparkles, Heart, Plus, Upload, BookOpen, Layers } from 'lucide-react';

export default function App() {
  // Navigation & View State
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'my-flashcards' | 'create' | 'study'
  const [creatorSubTab, setCreatorSubTab] = useState('manual'); // 'manual' | 'upload'
  const [activeStudySet, setActiveStudySet] = useState(null);
  const [editingSet, setEditingSet] = useState(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Data State
  const [sets, setSets] = useState(() => getSavedSets());
  const [settings, setSettings] = useState(() => getSavedSettings());
  const [stats, setStats] = useState(() => getStudyStats());

  // Compute total cards count
  const totalCardsCount = useMemo(() => {
    return sets.reduce((acc, s) => acc + (s.cards?.length || 0), 0);
  }, [sets]);

  // Handlers for Sets
  const handleSaveSet = (setPayload) => {
    const updatedSets = saveSingleSet(setPayload);
    setSets(updatedSets);
    setEditingSet(null);
    setActiveTab('dashboard');
  };

  const handleStudyImmediately = (setPayload) => {
    const updatedSets = saveSingleSet(setPayload);
    setSets(updatedSets);
    setEditingSet(null);
    setActiveStudySet(setPayload);
    setActiveTab('study');
  };

  const handleDeleteSet = (id) => {
    const updatedSets = deleteSetById(id);
    setSets(updatedSets);
    if (activeStudySet?.id === id) {
      setActiveStudySet(null);
      setActiveTab('dashboard');
    }
  };

  const handleDuplicateSet = (setToDuplicate) => {
    const duplicated = {
      ...setToDuplicate,
      id: `set_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      title: `${setToDuplicate.title} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastStudiedAt: null,
      cards: (setToDuplicate.cards || []).map((c) => ({
        ...c,
        id: `card_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        mastered: false,
        needsPractice: false,
      })),
    };
    const updated = saveSingleSet(duplicated);
    setSets(updated);
  };

  // Study Mode Handlers
  const handleStartStudy = (studySet) => {
    // Record last studied time
    const updated = {
      ...studySet,
      lastStudiedAt: new Date().toISOString(),
    };
    saveSingleSet(updated);
    setSets(getSavedSets());
    setActiveStudySet(updated);
    setActiveTab('study');
  };

  const handleExitStudy = () => {
    setActiveStudySet(null);
    setActiveTab('dashboard');
    setStats(getStudyStats());
  };

  const handleUpdateSetCards = (setId, updatedCards) => {
    const target = sets.find((s) => s.id === setId);
    if (!target) return;
    const updatedSet = {
      ...target,
      cards: updatedCards,
      updatedAt: new Date().toISOString(),
    };
    saveSingleSet(updatedSet);
    setSets(getSavedSets());
    if (activeStudySet?.id === setId) {
      setActiveStudySet(updatedSet);
    }
  };

  // Individual card update in MyFlashcards
  const handleUpdateCardInSet = (setId, cardId, cardUpdates) => {
    const target = sets.find((s) => s.id === setId);
    if (!target) return;
    const updatedCards = (target.cards || []).map((c) =>
      c.id === cardId ? { ...c, ...cardUpdates } : c
    );
    handleUpdateSetCards(setId, updatedCards);
  };

  const handleDeleteCardInSet = (setId, cardId) => {
    const target = sets.find((s) => s.id === setId);
    if (!target) return;
    const updatedCards = (target.cards || []).filter((c) => c.id !== cardId);
    handleUpdateSetCards(setId, updatedCards);
  };

  // Reset to default sample flashcards
  const handleResetSamples = () => {
    const samples = resetToSampleSets();
    setSets(samples);
  };

  // Update Settings
  const handleSaveSettings = (newSettings) => {
    saveSettings(newSettings);
    setSettings(newSettings);
  };

  const handleRefreshData = () => {
    setSets(getSavedSets());
    setSettings(getSavedSettings());
    setStats(getStudyStats());
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#4A4458] flex flex-col selection:bg-[#DDD6FE] selection:text-[#5B21B6]">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          if (tab === 'create') {
            setEditingSet(null);
            setCreatorSubTab('manual');
          }
          setActiveTab(tab);
        }}
        onOpenSettings={() => setIsSettingsOpen(true)}
        totalCardsCount={totalCardsCount}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {/* 1. Study Mode View */}
        {activeTab === 'study' && activeStudySet && (
          <StudyMode
            studySet={activeStudySet}
            onExitStudy={handleExitStudy}
            onUpdateSetCards={handleUpdateSetCards}
          />
        )}

        {/* 2. Dashboard View */}
        {activeTab === 'dashboard' && (
          <Dashboard
            sets={sets}
            stats={stats}
            onStartStudy={handleStartStudy}
            onEditSet={(set) => {
              setEditingSet(set);
              setCreatorSubTab('manual');
              setActiveTab('create');
            }}
            onCreateSet={() => {
              setEditingSet(null);
              setCreatorSubTab('manual');
              setActiveTab('create');
            }}
            onGoToUpload={() => {
              setCreatorSubTab('upload');
              setActiveTab('create');
            }}
            onDeleteSet={handleDeleteSet}
            onDuplicateSet={handleDuplicateSet}
            onResetSamples={handleResetSamples}
          />
        )}

        {/* 3. My Flashcards View */}
        {activeTab === 'my-flashcards' && (
          <MyFlashcards
            sets={sets}
            onStartStudy={handleStartStudy}
            onEditSet={(set) => {
              setEditingSet(set);
              setCreatorSubTab('manual');
              setActiveTab('create');
            }}
            onUpdateCardInSet={handleUpdateCardInSet}
            onDeleteCardInSet={handleDeleteCardInSet}
            onCreateNewSet={() => {
              setEditingSet(null);
              setCreatorSubTab('manual');
              setActiveTab('create');
            }}
            onGoToUpload={() => {
              setCreatorSubTab('upload');
              setActiveTab('create');
            }}
          />
        )}

        {/* 4. Create Flashcards View (Manual vs File Upload tabs) */}
        {activeTab === 'create' && (
          <div>
            {/* Sub-navigation Switcher between Manual and File Upload */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-6">
              <div className="flex p-1.5 rounded-2xl bg-white border border-[#EDE8F3] max-w-sm mx-auto shadow-xs">
                <button
                  type="button"
                  onClick={() => setCreatorSubTab('manual')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    creatorSubTab === 'manual'
                      ? 'bg-[#EDE9FE] text-[#6D28D9] shadow-xs'
                      : 'text-[#7B718B] hover:text-[#383144]'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Manual Creator</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCreatorSubTab('upload')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    creatorSubTab === 'upload'
                      ? 'bg-[#DCFCE7] text-[#15803D] shadow-xs'
                      : 'text-[#7B718B] hover:text-[#383144]'
                  }`}
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Document</span>
                </button>
              </div>
            </div>

            {/* Sub-view Content */}
            {creatorSubTab === 'manual' ? (
              <ManualCreator
                initialSet={editingSet}
                onSaveSet={handleSaveSet}
                onCancel={() => {
                  setEditingSet(null);
                  setActiveTab('dashboard');
                }}
                onStudyImmediately={handleStudyImmediately}
              />
            ) : (
              <FileGenerator
                savedSets={sets}
                userSettings={settings}
                onOpenSettings={() => setIsSettingsOpen(true)}
                onSaveNewSet={handleSaveSet}
                onAppendToSet={(updatedSet) => {
                  saveSingleSet(updatedSet);
                  setSets(getSavedSets());
                  setActiveTab('dashboard');
                }}
                onGoToManual={() => setCreatorSubTab('manual')}
                onStudyImmediately={handleStudyImmediately}
              />
            )}
          </div>
        )}
      </main>

      {/* Cute Student Footer */}
      <footer className="border-t border-[#EDE8F3] bg-white/60 py-6 mt-12 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#8C839A]">
          <div className="flex items-center gap-2">
            <span className="text-base">🌸</span>
            <span className="font-bold text-[#483D5A]">Flippi Flashcards</span>
            <span>—</span>
            <span>Study softer, learn deeper.</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <span>Made with</span>
              <Heart className="w-3 h-3 text-[#DB2777] fill-current" />
              <span>for students</span>
            </span>
            <span>•</span>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="hover:text-[#6D28D9] font-semibold cursor-pointer"
            >
              Settings
            </button>
          </div>
        </div>
      </footer>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSaveSettings={handleSaveSettings}
        onRefreshData={handleRefreshData}
      />
    </div>
  );
}
