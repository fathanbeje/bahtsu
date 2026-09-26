import React from 'react';
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
  Plus
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
  onOpenTurath,
  onOpenArchive,
  onOpenSettings,
  onOpenModelSelector,
  onOpenHistory,
  onNewSession,
  onLock,
  routerStatus,
  selectedModel,
}) {
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

  const formatModelBadge = (name = '') => {
    return name.replace(/^ag\//, '');
  };

  return (
    <header className="border-b border-parchment-200 dark:border-ink-800 bg-parchment-50/95 dark:bg-ink-950/95 backdrop-blur-md sticky top-0 z-40 transition-colors duration-200">
      <div className="max-w-[1720px] mx-auto px-2.5 sm:px-6 py-2 flex items-center justify-between gap-1.5 sm:gap-3">
        {/* Left: Brand / Title + Sesi Navigation */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-turath-emerald text-parchment-50 flex items-center justify-center shadow-md border border-turath-gold/40 flex-shrink-0">
            <BookOpen className="w-4 h-4 text-turath-gold" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h1 className="font-serif font-bold text-sm sm:text-lg tracking-tight text-ink-900 dark:text-parchment-50 truncate">
                Bahtsu Klangopan
              </h1>
              <span className="hidden 2xl:inline-block font-arabic text-xs text-turath-emerald dark:text-emerald-400 font-medium px-2 py-0.2 rounded-full bg-turath-emerald-soft dark:bg-turath-emerald-dark-soft border border-turath-emerald/20">
                بَحْثُ كِلَانْغُوفَانْ
              </span>
            </div>
            <p className="hidden md:flex text-[11px] text-ink-500 dark:text-ink-400 truncate items-center gap-1 font-sans">
              <span>Studio Bahtsul Masail</span>
              <span>•</span>
              <span className="text-emerald-700 dark:text-emerald-400 font-medium">9Router Aktif</span>
            </p>
          </div>

          {/* Quick Session History & New Buttons */}
          <div className="flex items-center gap-1 ml-1 sm:ml-2">
            <button
              onClick={onOpenHistory}
              className="flex items-center gap-1 px-2 py-1.5 rounded-xl border border-parchment-300 dark:border-ink-700 bg-white dark:bg-ink-900 text-ink-700 dark:text-parchment-200 hover:border-turath-emerald hover:text-turath-emerald text-xs font-sans font-medium transition-all shadow-xs"
              title="Lihat riwayat topik bahasan yang tersimpan"
            >
              <History className="w-3.5 h-3.5 text-turath-emerald" />
              <span className="hidden sm:inline">Riwayat</span>
            </button>

            <button
              onClick={onNewSession}
              className="p-1.5 sm:px-2 sm:py-1.5 rounded-xl border border-dashed border-turath-emerald/40 hover:border-turath-emerald bg-turath-emerald-soft/50 dark:bg-turath-emerald-dark-soft/40 text-turath-emerald dark:text-emerald-300 text-xs font-sans font-semibold transition-all flex items-center gap-1"
              title="Mulai topik bahasan baru"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Baru</span>
            </button>
          </div>
        </div>

        {/* Center: Tri-Matra Mode Switcher (Desktop only) */}
        <div className="hidden lg:flex items-center p-1 rounded-xl bg-parchment-100 dark:bg-ink-900 border border-parchment-200 dark:border-ink-800 shadow-inner">
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

        {/* Right Tools Bar */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          {/* Direct Model Picker Button */}
          <button
            onClick={onOpenModelSelector}
            className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-xl border border-turath-emerald/30 bg-turath-emerald-soft/80 dark:bg-turath-emerald-dark-soft/70 text-turath-emerald dark:text-emerald-300 hover:border-turath-emerald text-xs font-mono font-semibold transition-all max-w-[140px] sm:max-w-[210px] truncate"
            title="Klik untuk memilih model AI"
          >
            <Cpu className="w-3.5 h-3.5 flex-shrink-0 text-turath-emerald" />
            <span className="truncate text-[11px] sm:text-xs">
              {formatModelBadge(selectedModel)}
            </span>
            <ChevronDown className="w-3 h-3 flex-shrink-0 opacity-70" />
          </button>

          {/* Turath Search Button */}
          <button
            onClick={onOpenTurath}
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl text-xs font-sans font-medium bg-turath-emerald text-parchment-50 hover:bg-turath-emerald-light transition-all shadow-sm border border-turath-gold/30 flex items-center gap-1 flex-shrink-0"
            title="Pencarian Kitab Turath.io"
          >
            <Search className="w-3.5 h-3.5 text-turath-gold" />
            <span className="hidden xl:inline">Turath</span>
          </button>

          {/* Kajian Archive Button */}
          <button
            onClick={onOpenArchive}
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl text-xs font-sans font-medium bg-parchment-100 dark:bg-ink-900 text-ink-700 dark:text-parchment-200 hover:bg-parchment-200 dark:hover:bg-ink-800 transition-all border border-parchment-200 dark:border-ink-800 flex items-center gap-1 flex-shrink-0"
            title="Arsip Kajian"
          >
            <FolderArchive className="w-3.5 h-3.5 text-ink-500" />
            <span className="hidden xl:inline">Arsip</span>
          </button>

          {/* Typography Controls Popover */}
          <div className="relative group">
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

          {/* Theme Mode Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-1.5 sm:p-2 rounded-xl text-ink-600 dark:text-ink-300 hover:bg-parchment-200 dark:hover:bg-ink-800 transition-colors"
            title={darkMode ? "Ganti ke Mode Siang" : "Ganti ke Mode Malam"}
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-ink-600" />}
          </button>

          {/* Settings */}
          <button
            onClick={onOpenSettings}
            className="p-1.5 sm:p-2 rounded-xl text-ink-600 dark:text-ink-300 hover:bg-parchment-200 dark:hover:bg-ink-800 transition-colors"
            title="Pengaturan"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Lock App */}
          <button
            onClick={onLock}
            className="p-1.5 sm:p-2 rounded-xl text-ink-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-parchment-200 dark:hover:bg-ink-800 transition-colors"
            title="Kunci Sesi"
          >
            <Lock className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mobile Matra Selector Strip */}
      <div className="lg:hidden px-2 py-1 bg-parchment-100/90 dark:bg-ink-900/90 border-t border-parchment-200 dark:border-ink-800 flex items-center justify-around gap-1 overflow-x-auto no-scrollbar">
        {matraList.map(matra => {
          const isActive = matraMode === matra.id;
          return (
            <button
              key={matra.id}
              onClick={() => setMatraMode(matra.id)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-sans whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-turath-emerald text-white font-semibold shadow-xs'
                  : 'text-ink-600 dark:text-ink-400'
              }`}
            >
              <span>{matra.icon}</span>
              <span>{matra.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
}
