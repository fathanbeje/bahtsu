import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  FolderArchive, 
  Search, 
  ArrowLeft, 
  RefreshCw, 
  Calendar, 
  HardDrive, 
  BookOpen, 
  Download, 
  Copy, 
  Check, 
  Layers, 
  ExternalLink, 
  Eye, 
  Edit3, 
  X, 
  MessageSquare, 
  Sparkles,
  Filter,
  ArrowRight,
  Sun,
  Moon,
  Settings
} from 'lucide-react';
import { getKajianList } from '../utils/api';

export default function KajianArchivePage({
  onBackToStudio,
  onLoadToTaswidah,
  onLoadToChat,
  arabicFontSize = 24,
  arabicFontFamily = 'amiri',
  darkMode,
  setDarkMode,
  onOpenSettings,
  onLock,
}) {
  const [kajianList, setKajianList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [activeTab, setActiveTab] = useState('preview'); // 'preview' | 'raw'
  const [filterMatra, setFilterMatra] = useState('all'); // 'all' | 'waqi_iyyah' | 'maudlu_iyyah' | 'qanuniyyah'
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'oldest' | 'title' | 'size'
  const [copiedStatus, setCopiedStatus] = useState(null);

  // Mobile column switch: 'list' | 'reader'
  const [mobileView, setMobileView] = useState('list');
  const searchInputRef = useRef(null);

  useEffect(() => {
    fetchList();
  }, []);

  const fetchList = async () => {
    setLoading(true);
    try {
      const res = await getKajianList();
      if (res.ok) {
        const files = res.files || [];
        setKajianList(files);
        // Default select first non-readme document if not selected
        if (!selectedFile && files.length > 0) {
          const firstNonReadme = files.find(f => f.filename !== 'README.md') || files[0];
          setSelectedFile(firstNonReadme);
        }
      }
    } catch (err) {
      console.error('Gagal mengambil daftar kajian:', err);
    } finally {
      setLoading(false);
    }
  };

  // Keyboard shortcut: Press '/' or 'Ctrl+K' to focus search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.key === '/' && document.activeElement !== searchInputRef.current) || ((e.ctrlKey || e.metaKey) && e.key === 'k')) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Filter & Search Logic with Live Snippet Extraction
  const filteredAndSearched = useMemo(() => {
    const query = search.trim().toLowerCase();

    return kajianList
      .filter(item => {
        // Exclude README.md unless explicitly searched
        if (item.filename === 'README.md' && !query) return false;

        // Matra filter
        if (filterMatra !== 'all') {
          const itemMatra = (item.matra || '').toLowerCase();
          if (filterMatra === 'waqi_iyyah' && !itemMatra.includes('waqi')) return false;
          if (filterMatra === 'maudlu_iyyah' && !itemMatra.includes('maudlu')) return false;
          if (filterMatra === 'qanuniyyah' && !itemMatra.includes('qanun')) return false;
        }

        // Full text search in content + title + filename
        if (query) {
          const inTitle = (item.title || '').toLowerCase().includes(query);
          const inFilename = (item.filename || '').toLowerCase().includes(query);
          const inContent = (item.content || '').toLowerCase().includes(query);
          return inTitle || inFilename || inContent;
        }

        return true;
      })
      .map(item => {
        let matchCount = 0;
        let snippet = '';

        if (query && item.content) {
          const contentLower = item.content.toLowerCase();
          let pos = 0;
          while ((pos = contentLower.indexOf(query, pos)) !== -1) {
            matchCount++;
            pos += query.length;
          }

          // Extract best snippet around first or second occurrence
          const firstIdx = contentLower.indexOf(query);
          if (firstIdx !== -1) {
            const start = Math.max(0, firstIdx - 60);
            const end = Math.min(item.content.length, firstIdx + query.length + 80);
            snippet = (start > 0 ? '...' : '') + item.content.substring(start, end).replace(/[\r\n]+/g, ' ') + (end < item.content.length ? '...' : '');
          }
        }

        return { ...item, matchCount, snippet };
      })
      .sort((a, b) => {
        if (query && b.matchCount !== a.matchCount) {
          return b.matchCount - a.matchCount;
        }
        if (sortBy === 'newest') return (b.filename > a.filename ? 1 : -1);
        if (sortBy === 'oldest') return (a.filename > b.filename ? 1 : -1);
        if (sortBy === 'title') return a.title.localeCompare(b.title);
        if (sortBy === 'size') return b.size - a.size;
        return 0;
      });
  }, [kajianList, search, filterMatra, sortBy]);

  const totalDocs = kajianList.filter(f => f.filename !== 'README.md').length;

  const handleCopyWord = (content) => {
    const formatted = content
      .replace(/<u>\*\*【/g, '<u><b>')
      .replace(/】\*\*<\/u>/g, '</b></u>');
    navigator.clipboard.writeText(formatted);
    setCopiedStatus('word');
    setTimeout(() => setCopiedStatus(null), 2500);
  };

  const handleDownload = (item) => {
    if (!item?.content) return;
    const blob = new Blob([item.content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = item.filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const formatTextToHtml = (text) => {
    if (!text) return '';
    return text
      .replace(/<u>\*\*【(.*?)】\*\*<\/u>/g, '<u class="mahallus-syahid"><strong>【 $1 】</strong></u>')
      .replace(/【(.*?)】/g, '<span class="mahallus-syahid">【 $1 】</span>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code class="px-1 py-0.5 rounded bg-parchment-200 dark:bg-ink-800 text-xs font-mono">$1</code>')
      .replace(/\[(.*?)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1 font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline underline-offset-2 break-all transition-colors">$1 <svg class="w-3.5 h-3.5 inline-block shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg></a>');
  };

  const highlightSnippet = (snippet, query) => {
    if (!query || !snippet) return snippet;
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = snippet.split(regex);
    return parts.map((part, i) => 
      regex.test(part) ? (
        <mark key={i} className="bg-amber-200 dark:bg-amber-900/70 text-ink-950 dark:text-amber-100 font-bold px-0.5 rounded">
          {part}
        </mark>
      ) : part
    );
  };

  return (
    <div className="flex flex-col h-full w-full bg-parchment-50 dark:bg-ink-950 text-ink-900 dark:text-parchment-50 overflow-hidden font-sans">
      {/* Top Explorer Navigation Bar (Sleek Single 44px Row on Mobile) */}
      <div className="px-3 sm:px-6 py-2 border-b border-parchment-200 dark:border-ink-800 bg-white/95 dark:bg-ink-900/95 backdrop-blur-md flex items-center justify-between gap-2 flex-shrink-0 z-10 shadow-2xs">
        <div className="flex items-center gap-2 min-w-0">
          <button
            onClick={onBackToStudio}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl border border-turath-emerald/30 bg-turath-emerald/10 text-turath-emerald dark:text-emerald-300 hover:bg-turath-emerald/20 text-xs font-semibold transition-all shrink-0 group shadow-2xs"
            title="Kembali ke Studio Musyawarah"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            <span>Studio</span>
          </button>

          <div className="flex items-center gap-1.5 min-w-0">
            <FolderArchive className="w-4 h-4 text-turath-gold shrink-0" />
            <span className="font-serif font-bold text-xs sm:text-base text-ink-900 dark:text-parchment-50 truncate">
              Arsip Kajian
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-parchment-200/80 dark:bg-ink-800 text-ink-600 dark:text-ink-400 shrink-0">
              {totalDocs} naskah
            </span>
          </div>
        </div>

        {/* Right Tools: Mobile Switcher, Theme, Refresh */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Mobile View Toggle */}
          <div className="flex md:hidden items-center bg-parchment-200 dark:bg-ink-800 p-0.5 rounded-lg text-xs shrink-0">
            <button
              onClick={() => setMobileView('list')}
              className={`px-2 py-0.5 rounded-md font-medium text-[11px] transition-all ${
                mobileView === 'list'
                  ? 'bg-white dark:bg-ink-900 text-turath-emerald font-bold shadow-2xs'
                  : 'text-ink-600 dark:text-ink-400'
              }`}
            >
              Daftar ({filteredAndSearched.length})
            </button>
            <button
              onClick={() => setMobileView('reader')}
              className={`px-2 py-0.5 rounded-md font-medium text-[11px] transition-all ${
                mobileView === 'reader'
                  ? 'bg-white dark:bg-ink-900 text-turath-emerald font-bold shadow-2xs'
                  : 'text-ink-600 dark:text-ink-400'
              }`}
            >
              Baca
            </button>
          </div>

          {/* Theme Toggle */}
          {setDarkMode && (
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-1 sm:p-1.5 rounded-xl border border-parchment-300 dark:border-ink-700 bg-white dark:bg-ink-900 text-ink-600 dark:text-parchment-300 hover:text-turath-emerald transition-colors"
              title={darkMode ? "Ganti ke Mode Siang" : "Ganti ke Mode Malam"}
            >
              {darkMode ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-ink-600" />}
            </button>
          )}

          {/* Refresh Button */}
          <button
            onClick={fetchList}
            disabled={loading}
            className="p-1 sm:p-1.5 rounded-xl border border-parchment-300 dark:border-ink-700 bg-white dark:bg-ink-900 text-ink-600 dark:text-parchment-300 hover:text-turath-emerald transition-colors"
            title="Muat ulang repositori"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-turath-emerald' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Dual-Column Explorer Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Explorer Pane: Search & Filter */}
        <div 
          className={`h-full w-full md:w-[380px] lg:w-[440px] xl:w-[480px] flex-shrink-0 border-r border-parchment-200 dark:border-ink-800 bg-parchment-100/50 dark:bg-ink-900/40 flex flex-col overflow-hidden transition-all ${
            mobileView === 'list' ? 'flex' : 'hidden md:flex'
          }`}
        >
          {/* Compact Instant Search & Filter Header (Saves 60% vertical space) */}
          <div className="p-2.5 sm:p-3 border-b border-parchment-200 dark:border-ink-800 space-y-2 bg-white/70 dark:bg-ink-900/70 backdrop-blur-xs">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-ink-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                ref={searchInputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari kata kunci isi naskah, kitab, ibarat..."
                className="w-full pl-8 pr-7 py-1.5 rounded-xl border border-parchment-300 dark:border-ink-700 bg-white dark:bg-ink-950 text-xs text-ink-900 dark:text-parchment-50 placeholder-ink-400 focus:outline-none focus:ring-1 focus:ring-turath-emerald shadow-2xs font-sans"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-700 dark:hover:text-parchment-200"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Compact Horizontal Matra Filter Chips */}
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar text-[11px]">
              <button
                onClick={() => setFilterMatra('all')}
                className={`px-2 py-0.5 rounded-full whitespace-nowrap transition-all font-medium ${
                  filterMatra === 'all'
                    ? 'bg-turath-emerald text-white shadow-2xs font-semibold'
                    : 'bg-white dark:bg-ink-900 text-ink-600 dark:text-ink-400 border border-parchment-300 dark:border-ink-800'
                }`}
              >
                Semua ({kajianList.length})
              </button>
              <button
                onClick={() => setFilterMatra('waqi_iyyah')}
                className={`px-2 py-0.5 rounded-full whitespace-nowrap transition-all font-medium ${
                  filterMatra === 'waqi_iyyah'
                    ? 'bg-turath-emerald text-white shadow-2xs font-semibold'
                    : 'bg-white dark:bg-ink-900 text-ink-600 dark:text-ink-400 border border-parchment-300 dark:border-ink-800'
                }`}
              >
                Wāqi'iyyah
              </button>
              <button
                onClick={() => setFilterMatra('maudlu_iyyah')}
                className={`px-2 py-0.5 rounded-full whitespace-nowrap transition-all font-medium ${
                  filterMatra === 'maudlu_iyyah'
                    ? 'bg-turath-emerald text-white shadow-2xs font-semibold'
                    : 'bg-white dark:bg-ink-900 text-ink-600 dark:text-ink-400 border border-parchment-300 dark:border-ink-800'
                }`}
              >
                Maudlū'iyyah
              </button>
              <button
                onClick={() => setFilterMatra('qanuniyyah')}
                className={`px-2 py-0.5 rounded-full whitespace-nowrap transition-all font-medium ${
                  filterMatra === 'qanuniyyah'
                    ? 'bg-turath-emerald text-white shadow-2xs font-semibold'
                    : 'bg-white dark:bg-ink-900 text-ink-600 dark:text-ink-400 border border-parchment-300 dark:border-ink-800'
                }`}
              >
                Qānūniyyah
              </button>
            </div>

            {/* Results count & Sort */}
            <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-ink-500 pt-0.5">
              <span>
                {search ? (
                  <span className="font-semibold text-turath-emerald dark:text-emerald-400">
                    {filteredAndSearched.length} naskah cocok
                  </span>
                ) : (
                  <span>{filteredAndSearched.length} kajian</span>
                )}
              </span>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent border-0 text-[10px] sm:text-[11px] text-ink-600 dark:text-ink-400 font-medium focus:ring-0 cursor-pointer p-0"
              >
                <option value="newest">Terbaru</option>
                <option value="oldest">Terlama</option>
                <option value="title">Judul (A-Z)</option>
                <option value="size">Ukuran File</option>
              </select>
            </div>
          </div>

          {/* High-Density Results Document Cards List (Fits 4 cards on screen) */}
          <div className="flex-1 overflow-y-auto p-2 sm:p-3 space-y-2">
            {filteredAndSearched.length === 0 ? (
              <div className="text-center py-12 px-4 text-xs text-ink-400 space-y-2">
                <Search className="w-6 h-6 mx-auto text-ink-300 dark:text-ink-700" />
                <p>Tidak ada naskah kajian yang memuat kata kunci <b>"{search}"</b>.</p>
                <button
                  onClick={() => setSearch('')}
                  className="text-turath-emerald font-semibold underline underline-offset-2"
                >
                  Bersihkan Pencarian
                </button>
              </div>
            ) : (
              filteredAndSearched.map(item => {
                const isSelected = selectedFile?.filename === item.filename;

                return (
                  <button
                    key={item.filename}
                    onClick={() => {
                      setSelectedFile(item);
                      setMobileView('reader');
                    }}
                    className={`w-full text-left p-2.5 sm:p-3 rounded-xl border transition-all flex flex-col gap-1.5 relative ${
                      isSelected
                        ? 'bg-white dark:bg-ink-900 border-turath-emerald dark:border-emerald-600 shadow-xs ring-1 ring-turath-emerald'
                        : 'bg-white/80 dark:bg-ink-900/80 border-parchment-200 dark:border-ink-800 hover:border-parchment-300 dark:hover:border-ink-700'
                    }`}
                  >
                    {/* Title */}
                    <div className="font-serif font-bold text-xs sm:text-[13.5px] leading-snug text-ink-900 dark:text-parchment-50 line-clamp-2">
                      {item.title}
                    </div>

                    {/* Metadata Inline Strip */}
                    <div className="flex items-center gap-1.5 text-[10px] text-ink-500 dark:text-ink-400 font-mono">
                      {item.matra && (
                        <span className="text-[9.5px] px-1.5 py-0.2 rounded-md bg-turath-emerald-soft dark:bg-turath-emerald-dark-soft text-turath-emerald dark:text-emerald-300 font-semibold shrink-0">
                          {item.matra.split('(')[0].trim()}
                        </span>
                      )}
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-2.5 h-2.5" />
                        <span>{item.filename.substring(0, 10)}</span>
                      </span>
                      <span>•</span>
                      <span className="ml-auto">{(item.size / 1024).toFixed(1)} KB</span>
                    </div>

                    {/* Search match snippet */}
                    {search && item.snippet && (
                      <div className="p-1.5 rounded-lg bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/60 text-[10.5px] leading-relaxed text-ink-800 dark:text-parchment-200 font-sans">
                        <div className="text-[9.5px] font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1 mb-0.5">
                          <Sparkles className="w-2.5 h-2.5" />
                          <span>Cocok {item.matchCount}x dalam isi:</span>
                        </div>
                        <div className="line-clamp-2">{highlightSnippet(item.snippet, search)}</div>
                      </div>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Reader Pane: Full Document View */}
        <div 
          className={`flex-1 flex flex-col h-full bg-parchment-50 dark:bg-ink-950 overflow-hidden ${
            mobileView === 'reader' ? 'flex' : 'hidden md:flex'
          }`}
        >
          {selectedFile ? (
            <>
              {/* Document Action Toolbar (Compact 38px on Mobile) */}
              <div className="px-3 sm:px-5 py-2 border-b border-parchment-200 dark:border-ink-800 bg-white/85 dark:bg-ink-900/85 backdrop-blur-md flex items-center justify-between gap-2 flex-shrink-0 shadow-2xs">
                {/* Left: Mobile back button & View Switcher */}
                <div className="flex items-center gap-1.5 min-w-0 flex-1">
                  <button
                    onClick={() => setMobileView('list')}
                    className="md:hidden flex items-center gap-1 px-2 py-1 rounded-xl bg-parchment-200 dark:bg-ink-800 text-ink-700 dark:text-parchment-200 text-xs font-semibold shrink-0"
                    title="Kembali ke Daftar Naskah"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Daftar</span>
                  </button>

                  <div className="flex items-center bg-parchment-200 dark:bg-ink-800 p-0.5 rounded-lg text-xs font-sans shrink-0">
                    <button
                      onClick={() => setActiveTab('preview')}
                      className={`px-2 sm:px-2.5 py-0.5 rounded-md flex items-center gap-1 transition-all ${
                        activeTab === 'preview'
                          ? 'bg-white dark:bg-ink-900 text-turath-emerald font-bold shadow-2xs'
                          : 'text-ink-600 dark:text-ink-400'
                      }`}
                    >
                      <Eye className="w-3 h-3" />
                      <span>Baca</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('raw')}
                      className={`px-2 sm:px-2.5 py-0.5 rounded-md flex items-center gap-1 transition-all ${
                        activeTab === 'raw'
                          ? 'bg-white dark:bg-ink-900 text-turath-emerald font-bold shadow-2xs'
                          : 'text-ink-600 dark:text-ink-400'
                      }`}
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>.md</span>
                    </button>
                  </div>
                </div>

                {/* Right Action Buttons */}
                <div className="flex items-center gap-1 sm:gap-1.5 text-xs font-sans shrink-0">
                  {/* Load to Dock */}
                  <button
                    onClick={() => {
                      onLoadToTaswidah(selectedFile.content);
                      onBackToStudio();
                    }}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-turath-emerald text-white hover:bg-turath-emerald-light transition-all shadow-2xs font-semibold text-[11px] sm:text-xs"
                    title="Muat ke Dock Taswidah dan buka Studio"
                  >
                    <BookOpen className="w-3 h-3 text-turath-gold" />
                    <span>Muat ke Dock</span>
                  </button>

                  {/* Load to Chat */}
                  {onLoadToChat && (
                    <button
                      onClick={() => {
                        onLoadToChat(`Telaah lebih lanjut dari berkas kajian "${selectedFile.title}":\n\n${selectedFile.content.substring(0, 500)}...`);
                        onBackToStudio();
                      }}
                      className="hidden xl:flex items-center gap-1 px-2.5 py-1 rounded-xl border border-parchment-300 dark:border-ink-700 bg-white dark:bg-ink-900 text-ink-700 dark:text-parchment-200 hover:border-turath-emerald text-xs"
                      title="Lanjutkan musyawarah naskah ini di Chat"
                    >
                      <MessageSquare className="w-3 h-3" />
                      <span>Bahas di Chat</span>
                    </button>
                  )}

                  {/* Copy Word */}
                  <button
                    onClick={() => handleCopyWord(selectedFile.content)}
                    className="flex items-center gap-1 px-2 py-1 rounded-xl border border-parchment-300 dark:border-ink-700 bg-white dark:bg-ink-900 text-ink-700 dark:text-parchment-200 hover:border-turath-emerald transition-all shadow-2xs text-[11px] sm:text-xs"
                    title="Salin untuk Word"
                  >
                    {copiedStatus === 'word' ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span className="text-emerald-600 font-semibold">Tersalin!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 text-turath-gold" />
                        <span className="hidden sm:inline">Salin Word</span>
                      </>
                    )}
                  </button>

                  {/* Download */}
                  <button
                    onClick={() => handleDownload(selectedFile)}
                    className="p-1 sm:px-2 sm:py-1 rounded-xl border border-parchment-300 dark:border-ink-700 bg-white dark:bg-ink-900 text-ink-700 dark:text-parchment-200 hover:border-turath-emerald transition-all shadow-2xs text-xs flex items-center gap-1"
                    title="Unduh .md"
                  >
                    <Download className="w-3 h-3 text-ink-500" />
                    <span className="hidden sm:inline">Unduh</span>
                  </button>
                </div>
              </div>

              {/* Document Reading View */}
              <div className="flex-1 overflow-y-auto p-3 sm:p-8 space-y-4 sm:space-y-6">
                <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
                  {/* Meta Callout Card */}
                  <div className="p-3.5 sm:p-6 rounded-xl bg-white dark:bg-ink-900 border border-parchment-200 dark:border-ink-800 shadow-xs space-y-2 font-sans">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-turath-emerald-soft dark:bg-turath-emerald-dark-soft text-turath-emerald dark:text-emerald-300">
                        {selectedFile.matra || "Bahtsul Masail Nahdlatul Ulama"}
                      </span>
                      <span className="font-mono text-[10px] sm:text-xs text-ink-400">
                        {selectedFile.filename}
                      </span>
                    </div>

                    <h1 className="font-serif font-bold text-base sm:text-2xl text-ink-950 dark:text-parchment-50 leading-snug">
                      {selectedFile.title}
                    </h1>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px] pt-1.5 border-t border-parchment-100 dark:border-ink-800 text-ink-600 dark:text-ink-400">
                      {selectedFile.fan && (
                        <div>
                          <span className="font-semibold text-ink-900 dark:text-parchment-200">Kajian Fan:</span> {selectedFile.fan}
                        </div>
                      )}
                      {selectedFile.penyusun && (
                        <div>
                          <span className="font-semibold text-ink-900 dark:text-parchment-200">Penyusun:</span> {selectedFile.penyusun}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Rendered Markdown or Raw Code View */}
                  {activeTab === 'preview' ? (
                    <div className="p-4 sm:p-8 rounded-xl bg-white dark:bg-ink-900 border border-parchment-200 dark:border-ink-800 shadow-xs space-y-3 font-serif text-sm sm:text-[17px] leading-[1.85] text-ink-900 dark:text-parchment-100">
                      {selectedFile.content ? (
                        selectedFile.content.split('\n').map((line, idx) => {
                          const trimmed = line.trim();
                          if (!trimmed) return <div key={idx} className="h-1.5" />;

                          if (trimmed.startsWith('#')) {
                            const level = trimmed.match(/^#+/)[0].length;
                            const text = trimmed.replace(/^#+\s*/, '');
                            if (level === 1) return <h2 key={idx} className="font-serif font-bold text-lg sm:text-2xl text-turath-emerald dark:text-emerald-300 mt-4 mb-2 pb-1 border-b border-parchment-200 dark:border-ink-800">{text}</h2>;
                            if (level === 2) return <h3 key={idx} className="font-serif font-bold text-base sm:text-xl text-ink-900 dark:text-parchment-100 mt-3 mb-1.5">{text}</h3>;
                            return <h4 key={idx} className="font-serif font-bold text-sm sm:text-lg text-ink-800 dark:text-parchment-200 mt-2 mb-1">{text}</h4>;
                          }

                          if (trimmed.startsWith('>')) {
                            const quoteContent = trimmed.replace(/^>\s*/, '');
                            const arabicChars = (quoteContent.match(/[\u0600-\u06FF]/g) || []).length;
                            const isArabicQuote = arabicChars > 15 || (arabicChars / (quoteContent.length || 1) > 0.35);

                            if (isArabicQuote) {
                              return (
                                <blockquote
                                  key={idx}
                                  dir="rtl"
                                  className={`my-3 p-3.5 sm:p-5 rounded-xl border-r-4 border-r-turath-gold border-l-0 bg-parchment-100/70 dark:bg-ink-950/60 text-right arabic-text break-words overflow-x-hidden ${
                                    arabicFontFamily === 'scheherazade' ? 'font-scheherazade' : 'font-arabic'
                                  }`}
                                  style={{ fontSize: `${arabicFontSize}px` }}
                                  dangerouslySetInnerHTML={{
                                    __html: formatTextToHtml(quoteContent),
                                  }}
                                />
                              );
                            }

                            return (
                              <blockquote
                                key={idx}
                                className="my-2.5 pl-3.5 border-l-3 border-l-turath-emerald/50 italic text-ink-700 dark:text-parchment-300"
                                dangerouslySetInnerHTML={{
                                  __html: formatTextToHtml(quoteContent),
                                }}
                              />
                            );
                          }

                          if (trimmed.includes('Tautan Verifikasi') || (trimmed.includes('Turath.io') && trimmed.includes('http'))) {
                            return (
                              <div key={idx} className="my-2 p-2.5 rounded-xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/60 text-xs text-blue-900 dark:text-blue-200 flex items-center gap-2 font-sans shadow-2xs">
                                <span className="shrink-0 text-sm">🔗</span>
                                <div className="flex-1 break-words font-medium" dangerouslySetInnerHTML={{ __html: formatTextToHtml(trimmed) }} />
                              </div>
                            );
                          }

                          const arabicCount = (trimmed.match(/[\u0600-\u06FF]/g) || []).length;
                          const isArabic = arabicCount > 20 && (arabicCount / (trimmed.length || 1) > 0.4);

                          return (
                            <p
                              key={idx}
                              dir={isArabic ? 'rtl' : 'ltr'}
                              className={`leading-relaxed text-ink-900 dark:text-parchment-50 break-words ${
                                isArabic
                                  ? `arabic-text ${arabicFontFamily === 'scheherazade' ? 'font-scheherazade' : 'font-arabic'} my-2 px-1`
                                  : 'text-sm sm:text-[17px] leading-[1.8] my-1'
                              }`}
                              style={isArabic ? { fontSize: `${arabicFontSize}px` } : undefined}
                              dangerouslySetInnerHTML={{
                                __html: formatTextToHtml(trimmed),
                              }}
                            />
                          );
                        })
                      ) : (
                        <p className="text-ink-400 italic">Berkas kajian ini kosong.</p>
                      )}
                    </div>
                  ) : (
                    <div className="p-4 sm:p-6 rounded-xl bg-ink-950 border border-ink-800 text-parchment-200 font-mono text-xs overflow-x-auto whitespace-pre-wrap leading-relaxed">
                      {selectedFile.content}
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="h-full flex items-center justify-center p-6 text-center text-ink-400 text-sm">
              Pilih salah satu naskah kajian dari daftar di sebelah kiri untuk membaca dan menelaah.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
