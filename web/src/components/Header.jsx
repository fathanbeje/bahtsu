import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  BookOpen, 
  Search, 
  FolderArchive, 
  Settings, 
  Moon, 
  Sun, 
  Lock, 
  Cpu, 
  Type, 
  ChevronDown, 
  History, 
  Plus, 
  Activity, 
  HelpCircle,
  MoreVertical,
  X,
  Sparkles
} from 'lucide-react';

export default function Header({
  matraMode,
  setMatraMode,
  arabicFontSize,
  setArabicFontSize,
  arabicFontFamily,
  setArabicFontFamily,
  darkMode,
  setDarkMode,
  activeMainView = 'studio',
  setActiveMainView,
  onOpenTurath,
  onOpenArchive,
  onOpenSettings,
  onOpenModelSelector,
  onOpenHistory,
  onNewSession,
  onOpenRouterCockpit,
  onOpenMatraInfo,
  onLock,
  routerStatus,
  selectedModel,
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const matraList = [
    {
      id: 'waqi_iyyah',
      label: "Wāqi'iyyah",
      arabic: 'واقـعية',
      desc: 'Kasuistik Aktual & Qauli Mu\'tamad',
      icon: '🕌',
    },
    {
      id: 'maudlu_iyyah',
      label: 'Maudlū\'iyyah',
      arabic: 'مـوضوعية',
      desc: 'Tematik Peradaban & Manhaji',
      icon: '📜',
    },
    {
      id: 'qanuniyyah',
      label: 'Qānūniyyah',
      arabic: 'قـانونية',
      desc: 'Harmonisasi Yuridis & Maslahah',
      icon: '⚖️',
    },
  ];

  const currentMatra = matraList.find(m => m.id === matraMode) || matraList[0];

  const formatModelBadge = (name = '') => {
    return name.replace(/^ag\//, '');
  };

  const formatShortModel = (name = '') => {
    return name
      .replace(/^ag\//, '')
      .replace(/^gemini-/, '')
      .replace(/-preview$/, '');
  };

  return (
    <header className="border-b border-parchment-200 dark:border-ink-800 bg-parchment-50/95 dark:bg-ink-950/95 backdrop-blur-md sticky top-0 z-40 transition-colors duration-200">
      <div className="max-w-[1720px] mx-auto px-2.5 sm:px-6 py-1.5 sm:py-2 flex items-center justify-between gap-1.5 sm:gap-3">
        {/* Left: Brand + Matra Indicator */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0">
          <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-xl bg-turath-emerald text-parchment-50 flex items-center justify-center shadow-md border border-turath-gold/40 shrink-0">
            <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-turath-gold" />
          </div>

          <div className="min-w-0 flex items-center gap-1.5 sm:gap-2">
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-serif font-bold text-sm sm:text-lg tracking-tight text-ink-900 dark:text-parchment-50 truncate flex items-center gap-1.5">
                  <span className="sm:hidden font-bold">Bahtsu</span>
                  <span className="hidden sm:inline font-bold">Bahtsu Klangopan</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-md bg-turath-emerald/10 text-turath-emerald dark:bg-emerald-950/60 dark:text-emerald-400 font-bold border border-turath-emerald/20 tracking-wider">
                    v2.5.7
                  </span>
                </h1>
                <span className="hidden 2xl:inline-block font-arabic text-xs text-turath-emerald dark:text-emerald-400 font-medium px-2 py-0.2 rounded-full bg-turath-emerald-soft dark:bg-turath-emerald-dark-soft border border-turath-emerald/20">
                  بَحْثُ كِلَانْغُوفَانْ
                </span>
              </div>

              {/* Desktop View Switcher & 9Router indicator */}
              <div className="hidden md:flex text-[11px] text-ink-500 dark:text-ink-400 truncate items-center gap-1.5 font-sans">
                <button
                  onClick={() => setActiveMainView && setActiveMainView('studio')}
                  className={`transition-colors font-medium cursor-pointer ${activeMainView === 'studio' ? 'text-turath-emerald font-bold' : 'hover:text-ink-900 dark:hover:text-parchment-200'}`}
                >
                  Studio Musyawarah
                </button>
                <span>•</span>
                <button
                  onClick={() => setActiveMainView && setActiveMainView('arsip')}
                  className={`transition-colors font-medium cursor-pointer ${activeMainView === 'arsip' ? 'text-turath-emerald font-bold' : 'hover:text-ink-900 dark:hover:text-parchment-200'}`}
                >
                  Arsip Repositori
                </button>
                <span>•</span>
                <button
                  onClick={onOpenRouterCockpit}
                  className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.2 rounded-full border border-emerald-300 dark:border-emerald-800 hover:border-turath-emerald group"
                  title="Buka 9Router Remote Cockpit"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>9Router</span>
                </button>
              </div>
            </div>

            {/* Mobile Compact Matra Selector Pill (Ultra compact, no horizontal overflow) */}
            <button
              onClick={onOpenMatraInfo}
              className="md:hidden flex items-center gap-1 px-1.5 py-0.5 rounded-lg bg-turath-emerald/10 dark:bg-turath-emerald/20 border border-turath-emerald/25 text-[11px] font-sans font-semibold text-turath-emerald dark:text-emerald-300 shrink-0"
              title="Ganti Matra Metodologi Fiqih"
            >
              <span>{currentMatra.icon}</span>
              <ChevronDown className="w-3 h-3 opacity-60" />
            </button>
          </div>

          {/* Desktop History & New Buttons */}
          <div className="hidden sm:flex items-center gap-1 ml-1 sm:ml-2">
            <button
              onClick={onOpenHistory}
              className="flex items-center gap-1 px-2 py-1.5 rounded-xl border border-parchment-300 dark:border-ink-700 bg-white dark:bg-ink-900 text-ink-700 dark:text-parchment-200 hover:border-turath-emerald hover:text-turath-emerald text-xs font-sans font-medium transition-all shadow-xs"
              title="Lihat riwayat topik bahasan yang tersimpan"
            >
              <History className="w-3.5 h-3.5 text-turath-emerald" />
              <span>Riwayat</span>
            </button>

            <button
              onClick={onNewSession}
              className="p-1.5 sm:px-2 sm:py-1.5 rounded-xl border border-dashed border-turath-emerald/40 hover:border-turath-emerald bg-turath-emerald-soft/50 dark:bg-turath-emerald-dark-soft/40 text-turath-emerald dark:text-emerald-300 text-xs font-sans font-semibold transition-all flex items-center gap-1"
              title="Mulai topik bahasan baru"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Baru</span>
            </button>
          </div>
        </div>

        {/* Center: Desktop Tri-Matra Mode Switcher */}
        <div className="hidden lg:flex items-center gap-1">
          <div className="flex items-center p-1 rounded-xl bg-parchment-100 dark:bg-ink-900 border border-parchment-200 dark:border-ink-800 shadow-inner">
            {matraList.map(matra => {
              const isActive = matraMode === matra.id;
              return (
                <button
                  key={matra.id}
                  onClick={() => setMatraMode(matra.id)}
                  title={matra.desc}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-sans transition-all duration-150 ${
                    isActive
                      ? 'bg-card-parchment dark:bg-ink-800 text-turath-emerald dark:text-emerald-300 font-semibold shadow-sm border border-parchment-200 dark:border-ink-700'
                      : 'text-ink-600 dark:text-ink-400 hover:text-ink-900 dark:hover:text-parchment-200'
                  }`}
                >
                  <span>{matra.icon}</span>
                  <span>{matra.label}</span>
                  <span className="font-arabic text-[11px] opacity-75">({matra.arabic})</span>
                </button>
              );
            })}
          </div>

          <button
            onClick={onOpenMatraInfo}
            className="p-1.5 rounded-lg text-ink-400 hover:text-turath-emerald hover:bg-parchment-200 dark:hover:bg-ink-800 transition-colors"
            title="Pelajari fungsi ketiga Matra Bahtsul Masail"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>

        {/* Right Tools Bar (Clean Mobile Spacing, Zero Overlap) */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          {/* Desktop 9Router Cockpit Button */}
          <button
            onClick={onOpenRouterCockpit}
            className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50/80 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900 text-xs font-mono font-semibold transition-all shadow-2xs"
            title="Buka 9Router Remote Cockpit"
          >
            <Activity className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>9Router</span>
          </button>

          {/* Canonical AI Model Selector (Sole Primary Model Picker) */}
          <button
            onClick={onOpenModelSelector}
            className="flex items-center gap-1 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-xl border border-turath-emerald/30 bg-turath-emerald-soft/80 dark:bg-turath-emerald-dark-soft/70 text-turath-emerald dark:text-emerald-300 hover:border-turath-emerald text-[11px] sm:text-xs font-mono font-semibold transition-all max-w-[85px] sm:max-w-[190px] truncate shadow-2xs"
            title="Klik untuk memilih model AI"
          >
            <Cpu className="w-3 h-3 shrink-0 text-turath-gold" />
            <span className="truncate sm:hidden">
              {formatShortModel(selectedModel)}
            </span>
            <span className="hidden sm:inline truncate">
              {formatModelBadge(selectedModel)}
            </span>
          </button>

          {/* Turath Search Button (Desktop & Tablet) */}
          <button
            onClick={onOpenTurath}
            className="hidden sm:flex p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl text-xs font-sans font-medium bg-turath-emerald text-parchment-50 hover:bg-turath-emerald-light transition-all shadow-2xs border border-turath-gold/30 items-center gap-1 shrink-0"
            title="Pencarian Kitab Turath.io"
          >
            <Search className="w-3.5 h-3.5 text-turath-gold" />
            <span className="hidden xl:inline">Turath</span>
          </button>

          {/* Kajian Archive Button */}
          <button
            onClick={() => {
              if (activeMainView === 'arsip') {
                setActiveMainView && setActiveMainView('studio');
              } else {
                setActiveMainView && setActiveMainView('arsip');
              }
            }}
            className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl text-xs font-sans font-medium transition-all border flex items-center gap-1 shrink-0 ${
              activeMainView === 'arsip'
                ? 'bg-turath-emerald text-white border-turath-emerald shadow-xs font-semibold'
                : 'bg-parchment-100 dark:bg-ink-900 text-ink-700 dark:text-parchment-200 hover:bg-parchment-200 dark:hover:bg-ink-800 border-parchment-200 dark:border-ink-800'
            }`}
            title="Buka Repositori Arsip Kajian (Full Tab)"
          >
            <FolderArchive className={`w-3.5 h-3.5 ${activeMainView === 'arsip' ? 'text-turath-gold' : 'text-turath-emerald'}`} />
            <span className="hidden sm:inline">Arsip</span>
          </button>

          {/* Desktop Typography Controls Popover */}
          <div className="hidden md:block relative group">
            <button
              className="p-1.5 sm:p-2 rounded-xl text-ink-600 dark:text-ink-300 hover:bg-parchment-200 dark:hover:bg-ink-800 transition-colors"
              title="Pengaturan Huruf Arab"
            >
              <Type className="w-4 h-4" />
            </button>
            <div className="hidden group-hover:block absolute right-0 mt-1 w-56 p-3 bg-white dark:bg-ink-900 rounded-2xl shadow-manuscript-lg border border-parchment-200 dark:border-ink-800 text-xs z-50 animate-fade-in font-sans">
              <div className="font-semibold text-ink-900 dark:text-parchment-50 mb-2">Ukuran Huruf Arab</div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-[11px] text-ink-500">{arabicFontSize}px</span>
                <input
                  type="range"
                  min="18"
                  max="34"
                  step="2"
                  value={arabicFontSize}
                  onChange={(e) => setArabicFontSize(parseInt(e.target.value, 10))}
                  className="w-32 accent-turath-emerald cursor-pointer"
                />
              </div>
              <div className="font-semibold text-ink-900 dark:text-parchment-50 mb-1.5">Jenis Huruf Arab</div>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => setArabicFontFamily('amiri')}
                  className={`px-2 py-1 rounded text-center font-arabic ${
                    arabicFontFamily === 'amiri'
                      ? 'bg-turath-emerald text-white'
                      : 'bg-parchment-100 dark:bg-ink-800 text-ink-700 dark:text-ink-300'
                  }`}
                >
                  الأميري (Amiri)
                </button>
                <button
                  onClick={() => setArabicFontFamily('scheherazade')}
                  className={`px-2 py-1 rounded text-center font-arabic ${
                    arabicFontFamily === 'scheherazade'
                      ? 'bg-turath-emerald text-white'
                      : 'bg-parchment-100 dark:bg-ink-800 text-ink-700 dark:text-ink-300'
                  }`}
                >
                  شهرزاد (Scheherazade)
                </button>
              </div>
            </div>
          </div>

          {/* Desktop Theme Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="hidden md:flex p-1.5 sm:p-2 rounded-xl text-ink-600 dark:text-ink-300 hover:bg-parchment-200 dark:hover:bg-ink-800 transition-colors"
            title={darkMode ? "Ganti ke Mode Siang" : "Ganti ke Mode Malam"}
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-ink-600" />}
          </button>

          {/* Desktop Settings */}
          <button
            onClick={onOpenSettings}
            className="hidden md:flex p-1.5 sm:p-2 rounded-xl text-ink-600 dark:text-ink-300 hover:bg-parchment-200 dark:hover:bg-ink-800 transition-colors"
            title="Pengaturan"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Desktop Lock App */}
          <button
            onClick={onLock}
            className="hidden md:flex p-1.5 sm:p-2 rounded-xl text-ink-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-parchment-200 dark:hover:bg-ink-800 transition-colors"
            title="Kunci Sesi"
          >
            <Lock className="w-4 h-4" />
          </button>

          {/* Mobile All-in-One Menu Button (Opens Drawer) */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="md:hidden p-1.5 rounded-xl border border-parchment-300 dark:border-ink-700 bg-white dark:bg-ink-900 text-ink-700 dark:text-parchment-200 hover:text-turath-emerald shrink-0"
            title="Menu Fitur Lengkap"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu rendered in React Portal to escape Header stacking context */}
      {isMobileMenuOpen && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-ink-950/65 backdrop-blur-xs animate-fade-in font-sans">
          <div 
            className="fixed inset-0"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="relative bg-white dark:bg-ink-900 rounded-t-3xl border-t border-parchment-300 dark:border-ink-800 p-4 space-y-4 shadow-manuscript-lg max-h-[85vh] overflow-y-auto">
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-2 border-b border-parchment-200 dark:border-ink-800">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-turath-emerald" />
                <span className="font-serif font-bold text-sm text-ink-900 dark:text-parchment-50">
                  Menu Bahtsu Klangopan
                </span>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1 rounded-lg text-ink-400 hover:text-ink-900 dark:hover:text-parchment-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Sesi Tools */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onNewSession();
                }}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-turath-emerald-soft/60 dark:bg-turath-emerald-dark-soft/40 border border-turath-emerald/30 text-turath-emerald dark:text-emerald-300 font-semibold"
              >
                <Plus className="w-4 h-4" />
                <span>Sesi Baru</span>
              </button>

              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenHistory();
                }}
                className="flex items-center gap-2 p-2.5 rounded-xl border border-parchment-300 dark:border-ink-700 bg-parchment-50 dark:bg-ink-950 text-ink-700 dark:text-parchment-200 font-semibold"
              >
                <History className="w-4 h-4 text-turath-emerald" />
                <span>Riwayat Sesi</span>
              </button>
            </div>

            {/* Turath Search Button */}
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                onOpenTurath();
              }}
              className="w-full flex items-center justify-between p-2.5 rounded-xl bg-turath-emerald text-parchment-50 text-xs font-semibold shadow-xs"
            >
              <span className="flex items-center gap-2">
                <Search className="w-4 h-4 text-turath-gold" />
                <span>Pencarian Kitab Turath.io</span>
              </span>
              <span className="text-[10px] opacity-80">Buka ↗</span>
            </button>

            {/* 9Router Status & Cockpit */}
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                onOpenRouterCockpit();
              }}
              className="w-full flex items-center justify-between p-3 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50/70 dark:bg-emerald-950/40 text-xs text-left"
            >
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <div>
                  <div className="font-semibold text-emerald-800 dark:text-emerald-300">
                    9Router Remote Cockpit
                  </div>
                  <div className="text-[10px] text-ink-500 font-mono">
                    Model: {formatModelBadge(selectedModel)}
                  </div>
                </div>
              </div>
              <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-white dark:bg-ink-900 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                Online
              </span>
            </button>

            {/* Typography Controls on Mobile */}
            <div className="p-3 rounded-xl bg-parchment-100/70 dark:bg-ink-950/70 border border-parchment-200 dark:border-ink-800 space-y-2 text-xs">
              <div className="flex items-center justify-between font-semibold text-ink-800 dark:text-parchment-200">
                <span>Ukuran Teks Arab</span>
                <span className="font-mono text-turath-emerald">{arabicFontSize}px</span>
              </div>
              <input
                type="range"
                min="18"
                max="34"
                step="2"
                value={arabicFontSize}
                onChange={(e) => setArabicFontSize(parseInt(e.target.value, 10))}
                className="w-full accent-turath-emerald cursor-pointer"
              />
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => setArabicFontFamily('amiri')}
                  className={`py-1.5 px-2 rounded-lg text-center font-arabic text-sm ${
                    arabicFontFamily === 'amiri'
                      ? 'bg-turath-emerald text-white font-bold'
                      : 'bg-white dark:bg-ink-900 border border-parchment-300 dark:border-ink-800'
                  }`}
                >
                  الأميري (Amiri)
                </button>
                <button
                  onClick={() => setArabicFontFamily('scheherazade')}
                  className={`py-1.5 px-2 rounded-lg text-center font-arabic text-sm ${
                    arabicFontFamily === 'scheherazade'
                      ? 'bg-turath-emerald text-white font-bold'
                      : 'bg-white dark:bg-ink-900 border border-parchment-300 dark:border-ink-800'
                  }`}
                >
                  شهرزاد (Scheherazade)
                </button>
              </div>
            </div>

            {/* General Actions */}
            <div className="space-y-1.5 text-xs">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="w-full flex items-center justify-between p-2.5 rounded-xl border border-parchment-200 dark:border-ink-800 bg-white dark:bg-ink-900 text-ink-700 dark:text-parchment-200"
              >
                <span className="flex items-center gap-2">
                  {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-ink-600" />}
                  <span>Mode Tampilan</span>
                </span>
                <span className="font-semibold text-turath-emerald">
                  {darkMode ? 'Mode Malam' : 'Mode Siang'}
                </span>
              </button>

              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenSettings();
                }}
                className="w-full flex items-center gap-2 p-2.5 rounded-xl border border-parchment-200 dark:border-ink-800 bg-white dark:bg-ink-900 text-ink-700 dark:text-parchment-200"
              >
                <Settings className="w-4 h-4 text-ink-500" />
                <span>Pengaturan Sistem & Suhu</span>
              </button>

              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onLock();
                }}
                className="w-full flex items-center gap-2 p-2.5 rounded-xl border border-rose-200 dark:border-rose-900/40 bg-white dark:bg-ink-900 text-rose-600 dark:text-rose-400 font-semibold"
              >
                <Lock className="w-4 h-4" />
                <span>Kunci Aplikasi (Passcode)</span>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </header>
  );
}
