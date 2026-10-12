import React, { useState, useRef } from 'react';
import { 
  X, Key, Download, Upload, RefreshCcw, ShieldCheck, 
  Sparkles, Eye, EyeOff, Check, AlertCircle, Heart, Volume2
} from 'lucide-react';
import { exportSetsToJson, importSetsFromJson, resetToSampleSets } from '../utils/storage';

export default function SettingsModal({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  onRefreshData,
}) {
  const [apiKey, setApiKey] = useState(settings.geminiApiKey || '');
  const [showKey, setShowKey] = useState(false);
  const [aiProvider, setAiProvider] = useState(settings.aiProvider || 'gemini');
  const [defaultGenerator, setDefaultGenerator] = useState(settings.defaultGenerator || 'smart');
  const [ttsEnabled, setTtsEnabled] = useState(settings.ttsEnabled ?? true);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const importFileRef = useRef(null);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveSettings({
      ...settings,
      geminiApiKey: apiKey.trim(),
      aiProvider,
      defaultGenerator,
      ttsEnabled,
    });
    setSuccessMessage('Settings saved successfully! 🌸');
    setTimeout(() => {
      setSuccessMessage('');
      onClose();
    }, 1200);
  };

  const handleExport = () => {
    exportSetsToJson();
    setSuccessMessage('Downloaded backup JSON file! 📂');
    setTimeout(() => setSuccessMessage(''), 2500);
  };

  const handleImportFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result;
        importSetsFromJson(content);
        onRefreshData();
        setSuccessMessage('Backup restored successfully! ✨');
        setTimeout(() => setSuccessMessage(''), 2500);
      } catch (err) {
        setErrorMessage(err.message || 'Failed to import backup.');
        setTimeout(() => setErrorMessage(''), 3000);
      }
    };
    reader.readAsText(file);
  };

  const handleResetSamples = () => {
    if (window.confirm('Reset all decks back to the original sample study sets? This will overwrite existing decks.')) {
      resetToSampleSets();
      onRefreshData();
      setSuccessMessage('Reset to sample flashcards complete! 🌸');
      setTimeout(() => setSuccessMessage(''), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-[#EDE8F3] shadow-2xl p-6 sm:p-7 space-y-6">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#F2ECF7]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[#EDE9FE] text-[#7C3AED] flex items-center justify-center text-lg">
              ⚙️
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-[#383144]">
                Settings & Configuration
              </h3>
              <p className="text-xs text-[#877D97]">Preferences, API keys, and backups</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#8E859B] hover:text-[#383144] hover:bg-[#F5F2F9] transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Alerts */}
        {successMessage && (
          <div className="p-3 rounded-2xl bg-[#ECFDF5] border border-[#A7F3D0] text-[#059669] text-xs font-bold flex items-center gap-2">
            <Check className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}
        {errorMessage && (
          <div className="p-3 rounded-2xl bg-[#FFF1F2] border border-[#FECDD3] text-[#BE123C] text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* AI API Key Section */}
        <div className="bg-[#FAF8FC] rounded-2xl p-4 sm:p-5 border border-[#E9E2F1] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4 text-[#7C3AED]" />
              <h4 className="text-xs font-bold text-[#383144]">
                AI Flashcard Generation (Optional)
              </h4>
            </div>
            <span className="text-[10px] font-bold text-[#059669] bg-[#DCFCE7] px-2 py-0.5 rounded-full">
              Stored locally in browser
            </span>
          </div>

          <p className="text-[11px] text-[#736885] leading-relaxed">
            Flippi includes a built-in <strong>Smart Local Extractor</strong> that works 100% offline without any keys. To enable optional AI Tutor generation, enter your Google Gemini API key below:
          </p>

          <div className="relative">
            <input
              type={showKey ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="AIzaSy... (Gemini API Key)"
              className="w-full pl-3 pr-10 py-2.5 rounded-xl bg-white border border-[#E3DCEB] text-xs font-mono text-[#383144] focus:outline-none focus:ring-2 focus:ring-[#C4B5FD]"
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9E95AA] hover:text-[#383144] p-1"
            >
              {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2 text-xs">
              <label className="text-[11px] font-bold text-[#645A73]">Provider:</label>
              <select
                value={aiProvider}
                onChange={(e) => setAiProvider(e.target.value)}
                className="bg-white border border-[#E3DCEB] rounded-lg px-2 py-1 text-xs font-bold text-[#383144]"
              >
                <option value="gemini">Google Gemini (Free tier available)</option>
                <option value="openai">OpenAI (GPT-4o-mini)</option>
              </select>
            </div>
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] text-[#7C3AED] hover:underline font-bold"
            >
              Get free Gemini key ↗
            </a>
          </div>
        </div>

        {/* Study Experience Preferences */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-[#564C66] uppercase tracking-wider">
            Study Preferences
          </h4>

          <div className="flex items-center justify-between p-3 rounded-2xl bg-[#FAF8FC] border border-[#E9E2F1]">
            <div className="flex items-center gap-2.5">
              <Volume2 className="w-4 h-4 text-[#7C3AED]" />
              <div>
                <p className="text-xs font-bold text-[#383144]">Audio Pronunciation</p>
                <p className="text-[10px] text-[#867C96]">Text-to-Speech narration for cards</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={ttsEnabled}
              onChange={(e) => setTtsEnabled(e.target.checked)}
              className="w-4 h-4 rounded text-[#7C3AED] focus:ring-[#C4B5FD] cursor-pointer"
            />
          </div>
        </div>

        {/* Data Backup & Restore */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-[#564C66] uppercase tracking-wider">
            Data Backup & Restore
          </h4>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={handleExport}
              className="flex items-center justify-center gap-2 p-2.5 rounded-2xl bg-[#FAF8FC] hover:bg-[#F3EEFA] border border-[#E7DFEF] text-xs font-bold text-[#574C67] transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-[#7C3AED]" />
              <span>Export All (JSON)</span>
            </button>

            <button
              type="button"
              onClick={() => importFileRef.current?.click()}
              className="flex items-center justify-center gap-2 p-2.5 rounded-2xl bg-[#FAF8FC] hover:bg-[#F3EEFA] border border-[#E7DFEF] text-xs font-bold text-[#574C67] transition-all cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 text-[#DB2777]" />
              <span>Import JSON Backup</span>
            </button>
            <input
              ref={importFileRef}
              type="file"
              accept=".json"
              onChange={handleImportFile}
              className="hidden"
            />
          </div>

          <button
            type="button"
            onClick={handleResetSamples}
            className="w-full flex items-center justify-center gap-2 p-2 rounded-xl text-xs font-bold text-[#BE123C] hover:bg-[#FFF1F2] border border-transparent hover:border-[#FECDD3] transition-all cursor-pointer"
          >
            <RefreshCcw className="w-3 h-3" />
            <span>Reset to Original Sample Study Sets</span>
          </button>
        </div>

        {/* Bottom Save Button */}
        <div className="pt-2 border-t border-[#F2ECF7] flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-[#6A607A] hover:bg-[#FAF8FC]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2.5 rounded-2xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold shadow-md shadow-[#DDD6FE] transition-all cursor-pointer"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}
