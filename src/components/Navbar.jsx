import React, { useState } from 'react';
import { Sparkles, BookOpen, PlusCircle, Settings, Home, Layers, Menu, X, Heart } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, onOpenSettings, totalCardsCount }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Home', icon: Home, badge: null },
    { id: 'my-flashcards', label: 'My Flashcards', icon: BookOpen, badge: totalCardsCount },
    { id: 'create', label: 'Create Flashcards', icon: PlusCircle, badge: null },
  ];

  const handleNavClick = (id) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b border-[#EFE9F4] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div 
            onClick={() => handleNavClick('dashboard')}
            className="flex items-center gap-2.5 cursor-pointer group select-none"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#EDE9FE] via-[#FCE7F3] to-[#DCFCE7] flex items-center justify-center shadow-sm group-hover:scale-105 group-hover:shadow-md transition-all duration-300">
              <span className="text-xl transform group-hover:rotate-12 transition-transform duration-300">🌸</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-bold font-['Quicksand'] tracking-tight text-[#483d5a]">
                  Flippi
                </span>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#EDE9FE] text-[#6D28D9] border border-[#DDD6FE]">
                  study studio ✨
                </span>
              </div>
              <p className="text-[11px] text-[#8C829B] hidden sm:block -mt-0.5">
                Cute, smart flashcards for students
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id || (item.id === 'create' && (activeTab === 'create-manual' || activeTab === 'create-upload'));
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-[#EDE9FE] text-[#5B21B6] shadow-sm font-bold border border-[#DDD6FE]'
                      : 'text-[#645B73] hover:text-[#483D5A] hover:bg-[#F7F4FA]'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#7C3AED]' : 'text-[#8C829B]'}`} />
                  <span>{item.label}</span>
                  {item.badge !== null && item.badge > 0 && (
                    <span className="ml-1 px-1.5 py-0.2 rounded-full text-[11px] bg-white/90 text-[#7C3AED] font-bold border border-[#DDD6FE]">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action Icons */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenSettings}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold text-[#645B73] hover:text-[#483D5A] hover:bg-[#F3EFEA] border border-[#E9E3ED] transition-all cursor-pointer"
              title="Settings & API Configuration"
            >
              <Settings className="w-4 h-4 text-[#8C829B]" />
              <span className="hidden sm:inline text-xs font-bold">Settings</span>
            </button>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-[#645B73] hover:bg-[#F5F2F9] cursor-pointer"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#EFE9F4] bg-[#FAF8F5] px-4 pt-3 pb-4 space-y-1.5 shadow-lg animate-in fade-in duration-200">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-[#EDE9FE] text-[#5B21B6] border border-[#DDD6FE]'
                    : 'text-[#645B73] hover:bg-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {item.badge !== null && item.badge > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-xs bg-white text-[#7C3AED] font-bold">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
          <button
            onClick={() => {
              onOpenSettings();
              setMobileMenuOpen(false);
            }}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-[#645B73] hover:bg-white"
          >
            <Settings className="w-4 h-4 text-[#8C829B]" />
            <span>Settings & API Key</span>
          </button>
        </div>
      )}
    </header>
  );
}
