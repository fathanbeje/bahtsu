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
  Settings,
  GitPullRequest
} from 'lucide-react';
import { stripThinkingTags } from '../utils/thinkingHelper';
import { getKajianList, syncKajianFromGitHub } from '../utils/api';

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
  const [syncingGit, setSyncingGit] = useState(false);
  const [syncNotice, setSyncNotice] = useState(null);

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

  const handleSyncGitHub = async () => {
    setSyncingGit(true);
    setSyncNotice(null);
    try {
      const res = await syncKajianFromGitHub();
      if (res.ok) {
        setSyncNotice({
          type: 'success',
          message: res.message || 'Kajian berhasil diperbarui dari GitHub!',
          commit: res.latestCommit,
          filesCount: res.totalFiles,
        });
        await fetchList();
      } else {
        setSyncNotice({
          type: 'error',
          message: res.error || 'Gagal menyinkronkan dari GitHub.',
        });
      }
    } catch (err) {
      setSyncNotice({
        type: 'error',
        message: err.message,
      });
    } finally {
      setSyncingGit(false);
      setTimeout(() => setSyncNotice(null), 6000);
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
    const clean = stripThinkingTags(content);
    const formatted = clean
      .replace(/<u>\*\*【/g, '<u><b>')
      .replace(/】\*\*<\/u>/g, '</b></u>');
    navigator.clipboard.writeText(formatted);
    setCopiedStatus('word');
    setTimeout(() => setCopiedStatus(null), 2500);
  };

  const handleDownload = (item) => {
    if (!item?.content) return;
    const clean = stripThinkingTags(item.content);
    const blob = new Blob([clean], { type: 'text/markdown;charset=utf-8' });
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
      {/* Top Explorer Navigation Bar (Hidden on mobile when in reader mode to prevent double headers) */}
      <div className={`px-3 sm:px-6 py-2 border-b border-parchment-200 dark:border-ink-800 bg-white/95 dark:bg-ink-900/95 backdrop-blur-md items-center justify-between gap-2 flex-shrink-0 z-10 shadow-2xs ${
        mobileView === 'reader' ? 'hidden md:flex' : 'flex'
      }`}>
        <div className="flex items-center gap-2 min-w-0">
          <button
            onClick={onBackToStudio}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-turath-emerald/30 bg-turath-emerald/10 text-turath-emerald dark:text-emerald-300 hover:bg-turath-emerald/20 text-xs font-semibold transition-all shrink-0 group shadow-2xs"
            title="Kembali ke Studio Musyawarah"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            <span className="hidden sm:inline">Studio</span>
          </button>

          <div className="flex items-center gap-2 min-w-0">
            <FolderArchive className="w-4 h-4 text-turath-gold shrink-0" />
            <span className="font-serif font-bold text-sm sm:text-base text-ink-900 dark:text-parchment-50 truncate">
              Arsip Kajian
            </span>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-parchment-200/80 dark:bg-ink-800 text-ink-700 dark:text-ink-300 shrink-0 font-medium">
              {totalDocs}
            </span>
          </div>
        </div>

        {/* Right Tools: Mobile Switcher, Theme, Refresh */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Mobile View Toggle */}
          <div className="flex md:hidden items-center bg-parchment-200 dark:bg-ink-800 p-0.5 rounded-lg text-xs shrink-0">
            <button
              onClick={() => setMobileView('list')}
              className={`px-2.5 py-1 rounded-md font-semibold text-xs transition-all ${
                mobileView === 'list'
                  ? 'bg-white dark:bg-ink-900 text-turath-emerald shadow-2xs'
                  : 'text-ink-600 dark:text-ink-400'
              }`}
            >
              Daftar ({filteredAndSearched.length})
            </button>
            <button
              onClick={() => setMobileView('reader')}
              className={`px-2.5 py-1 rounded-md font-semibold text-xs transition-all ${
                mobileView === 'reader'
                  ? 'bg-white dark:bg-ink-900 text-turath-emerald shadow-2xs'
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
              className="p-1.5 sm:p-2 rounded-xl border border-parchment-300 dark:border-ink-700 bg-white dark:bg-ink-900 text-ink-600 dark:text-parchment-300 hover:text-turath-emerald transition-colors"
              title={darkMode ? "Ganti ke Mode Siang" : "Ganti ke Mode Malam"}
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-ink-600" />}
            </button>
          )}

          {/* Force Update from GitHub Button */}
          <button
            onClick={handleSyncGitHub}
            disabled={syncingGit || loading}
            className={`flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-all shadow-2xs ${
              syncingGit
                ? 'bg-amber-100 border-amber-300 text-amber-800 dark:bg-amber-950/60 dark:border-amber-700 dark:text-amber-200'
                : 'border-turath-emerald/30 bg-turath-emerald/10 text-turath-emerald dark:text-emerald-300 hover:bg-turath-emerald/20'
            }`}
            title="Tarik & Paksa Sinkronisasi Berkas Kajian Terbaru dari GitHub"
          >
            <GitPullRequest className={`w-3.5 h-3.5 ${syncingGit ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">
              {syncingGit ? 'Menarik...' : 'Update GitHub'}
            </span>
          </button>

          {/* Refresh Button */}
          <button
            onClick={fetchList}
            disabled={loading}
            className="p-1.5 sm:p-2 rounded-xl border border-parchment-300 dark:border-ink-700 bg-white dark:bg-ink-900 text-ink-600 dark:text-parchment-300 hover:text-turath-emerald transition-colors"
            title="Muat ulang daftar lokal"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-turath-emerald' : ''}`} />
          </button>
        </div>
      </div>

      {/* GitHub Sync Status Notification Banner */}
      {syncNotice && (
        <div className={`px-4 py-2 text-xs flex items-center justify-between border-b transition-all animate-fade-in shrink-0 z-20 ${
          syncNotice.type === 'success'
            ? 'bg-emerald-50 dark:bg-emerald-950/90 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-100'
            : 'bg-rose-50 dark:bg-rose-950/90 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-100'
        }`}>
          <div className="flex items-center gap-2 flex-wrap min-w-0">
            <span className="font-bold flex items-center gap-1">
              {syncNotice.type === 'success' ? '✅' : '⚠️'} {syncNotice.message}
            </span>
            {syncNotice.commit && (
              <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-emerald-200/60 dark:bg-emerald-900/60 text-emerald-950 dark:text-emerald-200">
                Commit: {syncNotice.commit}
              </span>
            )}
            {typeof syncNotice.filesCount === 'number' && (
              <span className="text-[11px] opacity-80">
                ({syncNotice.filesCount} berkas naskah aktif)
              </span>
            )}
          </div>
          <button onClick={() => setSyncNotice(null)} className="p-1 hover:opacity-75 shrink-0 ml-2">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Dual-Column Explorer Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Explorer Pane: Search & Filter */}
        <div 
          className={`h-full w-full md:w-[380px] lg:w-[440px] xl:w-[480px] flex-shrink-0 border-r border-parchment-200 dark:border-ink-800 bg-parchment-100/50 dark:bg-ink-900/40 flex flex-col overflow-hidden transition-all ${
            mobileView === 'list' ? 'flex' : 'hidden md:flex'
          }`}
        >
          {/* Instant Search & Filter Header with comfortable editorial typography */}
          <div className="p-3 sm:p-3.5 border-b border-parchment-200 dark:border-ink-800 space-y-2.5 bg-white/70 dark:bg-ink-900/70 backdrop-blur-xs">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-ink-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                ref={searchInputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari isi naskah, kitab, ibarat..."
                className="w-full pl-9 pr-8 py-2 rounded-xl border border-parchment-300 dark:border-ink-700 bg-white dark:bg-ink-950 text-sm text-ink-900 dark:text-parchment-50 placeholder-ink-400 focus:outline-none focus:ring-1 focus:ring-turath-emerald shadow-2xs font-sans"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-700 dark:hover:text-parchment-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Matra Filter Chips with comfortable touch targets */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs py-0.5">
              <button
                onClick={() => setFilterMatra('all')}
                className={`px-3 py-1.5 rounded-full whitespace-nowrap transition-all font-medium min-h-[30px] flex items-center ${
                  filterMatra === 'all'
                    ? 'bg-turath-emerald text-white shadow-2xs font-semibold'
                    : 'bg-white dark:bg-ink-900 text-ink-600 dark:text-ink-400 border border-parchment-300 dark:border-ink-800'
                }`}
              >
                Semua ({kajianList.length})
              </button>
              <button
                onClick={() => setFilterMatra('waqi_iyyah')}
                className={`px-3 py-1.5 rounded-full whitespace-nowrap transition-all font-medium min-h-[30px] flex items-center ${
                  filterMatra === 'waqi_iyyah'
                    ? 'bg-turath-emerald text-white shadow-2xs font-semibold'
                    : 'bg-white dark:bg-ink-900 text-ink-600 dark:text-ink-400 border border-parchment-300 dark:border-ink-800'
                }`}
              >
                Wāqi'iyyah
              </button>
              <button
                onClick={() => setFilterMatra('maudlu_iyyah')}
                className={`px-3 py-1.5 rounded-full whitespace-nowrap transition-all font-medium min-h-[30px] flex items-center ${
                  filterMatra === 'maudlu_iyyah'
                    ? 'bg-turath-emerald text-white shadow-2xs font-semibold'
                    : 'bg-white dark:bg-ink-900 text-ink-600 dark:text-ink-400 border border-parchment-300 dark:border-ink-800'
                }`}
              >
                Maudlū'iyyah
              </button>
              <button
                onClick={() => setFilterMatra('qanuniyyah')}
                className={`px-3 py-1.5 rounded-full whitespace-nowrap transition-all font-medium min-h-[30px] flex items-center ${
                  filterMatra === 'qanuniyyah'
                    ? 'bg-turath-emerald text-white shadow-2xs font-semibold'
                    : 'bg-white dark:bg-ink-900 text-ink-600 dark:text-ink-400 border border-parchment-300 dark:border-ink-800'
                }`}
              >
                Qānūniyyah
              </button>
            </div>

            {/* Results count & Sort */}
            <div className="flex items-center justify-between text-xs text-ink-500 pt-0.5 font-sans">
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
                className="bg-transparent border-0 text-xs text-ink-700 dark:text-ink-300 font-semibold focus:ring-0 cursor-pointer p-0"
              >
                <option value="newest">Terbaru</option>
                <option value="oldest">Terlama</option>
                <option value="title">Judul (A-Z)</option>
                <option value="size">Ukuran File</option>
              </select>
            </div>
          </div>

          {/* High-Density Results Document Cards List with comfortable font sizes */}
          <div className="flex-1 overflow-y-auto p-2.5 sm:p-3 space-y-2.5">
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
                    className={`w-full text-left p-3 sm:p-3.5 rounded-xl border transition-all flex flex-col gap-2 relative ${
                      isSelected
                        ? 'bg-white dark:bg-ink-900 border-turath-emerald dark:border-emerald-600 shadow-xs ring-1 ring-turath-emerald'
                        : 'bg-white/85 dark:bg-ink-900/85 border-parchment-200 dark:border-ink-800 hover:border-parchment-300 dark:hover:border-ink-700'
                    }`}
                  >
                    {/* Title */}
                    <div className="font-serif font-bold text-[14.5px] sm:text-base leading-snug text-ink-950 dark:text-parchment-50 line-clamp-2">
                      {item.title}
                    </div>

                    {/* Metadata Inline Strip */}
                    <div className="flex items-center gap-1.5 text-xs text-ink-500 dark:text-ink-400 font-sans flex-wrap">
                      {item.matra && (
                        <span className="text-xs px-2 py-0.5 rounded-md bg-turath-emerald-soft dark:bg-turath-emerald-dark-soft text-turath-emerald dark:text-emerald-300 font-semibold shrink-0">
                          {item.matra.split('(')[0].trim()}
                        </span>
                      )}
                      <span>•</span>
                      <span className="flex items-center gap-1 font-mono text-xs text-ink-500 dark:text-ink-400">
                        <Calendar className="w-3 h-3 text-ink-400" />
                        <span>{item.filename.substring(0, 10)}</span>
                      </span>
                      <span>•</span>
                      <span className="ml-auto font-mono text-xs text-ink-500 dark:text-ink-400">{(item.size / 1024).toFixed(1)} KB</span>
                    </div>

                    {/* Search match snippet */}
                    {search && item.snippet && (
                      <div className="p-2 rounded-lg bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-xs sm:text-[13px] leading-relaxed text-ink-800 dark:text-parchment-200 font-sans">
                        <div className="text-xs font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1 mb-1">
                          <Sparkles className="w-3 h-3 text-amber-600 dark:text-amber-400" />
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
              {/* Document Action Toolbar (Comfortable touch targets & single top bar on mobile) */}
              <div className="px-3 sm:px-5 py-2 sm:py-2.5 border-b border-parchment-200 dark:border-ink-800 bg-white/95 dark:bg-ink-900/95 backdrop-blur-md flex items-center justify-between gap-2 flex-shrink-0 shadow-2xs">
                {/* Left: Mobile back button & View Switcher */}
                <div className="flex items-center gap-1.5 min-w-0 flex-1">
                  <button
                    onClick={() => setMobileView('list')}
                    className="md:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-parchment-200 dark:bg-ink-800 text-ink-800 dark:text-parchment-100 text-xs font-semibold shrink-0 shadow-2xs"
                    title="Kembali ke Daftar Naskah"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Daftar</span>
                  </button>

                  <div className="flex items-center bg-parchment-200 dark:bg-ink-800 p-0.5 rounded-lg text-xs font-sans shrink-0">
                    <button
                      onClick={() => setActiveTab('preview')}
                      className={`px-2.5 sm:px-3 py-1 rounded-md flex items-center gap-1 transition-all ${
                        activeTab === 'preview'
                          ? 'bg-white dark:bg-ink-900 text-turath-emerald font-bold shadow-2xs'
                          : 'text-ink-600 dark:text-ink-400'
                      }`}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Baca</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('raw')}
                      className={`px-2.5 sm:px-3 py-1 rounded-md flex items-center gap-1 transition-all ${
                        activeTab === 'raw'
                          ? 'bg-white dark:bg-ink-900 text-turath-emerald font-bold shadow-2xs'
                          : 'text-ink-600 dark:text-ink-400'
                      }`}
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>.md</span>
                    </button>
                  </div>
                </div>

                {/* Right Action Buttons */}
                <div className="flex items-center gap-1 sm:gap-2 text-xs font-sans shrink-0">
                  {/* Load to Dock */}
                  <button
                    onClick={() => {
                      onLoadToTaswidah(selectedFile.content);
                      onBackToStudio();
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-turath-emerald text-white hover:bg-turath-emerald-light transition-all shadow-2xs font-semibold text-xs"
                    title="Muat ke Dock Taswidah dan buka Studio"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-turath-gold" />
                    <span>Muat ke Dock</span>
                  </button>

                  {/* Load to Chat */}
                  {onLoadToChat && (
                    <button
                      onClick={() => {
                        onLoadToChat(`Telaah lebih lanjut dari berkas kajian "${selectedFile.title}":\n\n${selectedFile.content.substring(0, 500)}...`);
                        onBackToStudio();
                      }}
                      className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-parchment-300 dark:border-ink-700 bg-white dark:bg-ink-900 text-ink-700 dark:text-parchment-200 hover:border-turath-emerald text-xs"
                      title="Lanjutkan musyawarah naskah ini di Chat"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Bahas di Chat</span>
                    </button>
                  )}

                  {/* Copy Word */}
                  <button
                    onClick={() => handleCopyWord(selectedFile.content)}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-parchment-300 dark:border-ink-700 bg-white dark:bg-ink-900 text-ink-700 dark:text-parchment-200 hover:border-turath-emerald transition-all shadow-2xs text-xs font-medium"
                    title="Salin untuk Word"
                  >
                    {copiedStatus === 'word' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-600 font-semibold">Tersalin!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-turath-gold" />
                        <span className="hidden sm:inline">Salin Word</span>
                      </>
                    )}
                  </button>

                  {/* Download */}
                  <button
                    onClick={() => handleDownload(selectedFile)}
                    className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border border-parchment-300 dark:border-ink-700 bg-white dark:bg-ink-900 text-ink-700 dark:text-parchment-200 hover:border-turath-emerald transition-all shadow-2xs text-xs flex items-center gap-1"
                    title="Unduh .md"
                  >
                    <Download className="w-3.5 h-3.5 text-ink-500" />
                    <span className="hidden sm:inline">Unduh</span>
                  </button>
                </div>
              </div>

              {/* Document Reading View */}
              <div className="flex-1 overflow-y-auto p-3.5 sm:p-8 space-y-4 sm:space-y-6">
                <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
                  {/* Meta Callout Card */}
                  <div className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-ink-900 border border-parchment-200 dark:border-ink-800 shadow-xs space-y-2.5 font-sans">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-turath-emerald-soft dark:bg-turath-emerald-dark-soft text-turath-emerald dark:text-emerald-300">
                        {selectedFile.matra || "Bahtsul Masail Nahdlatul Ulama"}
                      </span>
                      <span className="font-mono text-xs text-ink-500 dark:text-ink-400">
                        {selectedFile.filename}
                      </span>
                    </div>

                    <h1 className="font-serif font-bold text-lg sm:text-2xl text-ink-950 dark:text-parchment-50 leading-snug">
                      {selectedFile.title}
                    </h1>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm pt-2 border-t border-parchment-100 dark:border-ink-800 text-ink-600 dark:text-ink-400">
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
                    <div className="p-4 sm:p-8 rounded-2xl bg-white dark:bg-ink-900 border border-parchment-200 dark:border-ink-800 shadow-xs space-y-3.5 font-serif text-[15.5px] sm:text-[17.5px] leading-[1.85] text-ink-900 dark:text-parchment-100">
                      {stripThinkingTags(selectedFile.content) ? (
                        stripThinkingTags(selectedFile.content).split('\n').map((line, idx) => {
                          const trimmed = line.trim();
                          if (!trimmed) return <div key={idx} className="h-2" />;

                          if (trimmed.startsWith('#')) {
                            const level = trimmed.match(/^#+/)[0].length;
                            const text = trimmed.replace(/^#+\s*/, '');
                            if (level === 1) return <h2 key={idx} className="font-serif font-bold text-xl sm:text-2xl text-turath-emerald dark:text-emerald-300 mt-5 mb-2.5 pb-1.5 border-b border-parchment-200 dark:border-ink-800">{text}</h2>;
                            if (level === 2) return <h3 key={idx} className="font-serif font-bold text-lg sm:text-xl text-ink-900 dark:text-parchment-100 mt-4 mb-2">{text}</h3>;
                            return <h4 key={idx} className="font-serif font-bold text-base sm:text-lg text-ink-800 dark:text-parchment-200 mt-3 mb-1.5">{text}</h4>;
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
                                  className={`my-3.5 p-4 sm:p-5 rounded-2xl border-r-4 border-r-turath-gold border-l-0 bg-parchment-100/70 dark:bg-ink-950/60 text-right arabic-text break-words overflow-x-hidden ${
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
                                className="my-3 pl-4 border-l-4 border-l-turath-emerald/60 italic text-ink-800 dark:text-parchment-200 text-sm sm:text-base leading-relaxed"
                                dangerouslySetInnerHTML={{
                                  __html: formatTextToHtml(quoteContent),
                                }}
                              />
                            );
                          }

                          if (trimmed.includes('Tautan Verifikasi') || (trimmed.includes('Turath.io') && trimmed.includes('http'))) {
                            return (
                              <div key={idx} className="my-2.5 p-3 rounded-xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/60 text-xs sm:text-sm text-blue-900 dark:text-blue-200 flex items-center gap-2.5 font-sans shadow-2xs">
                                <span className="shrink-0 text-base">🔗</span>
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
                                  ? `arabic-text ${arabicFontFamily === 'scheherazade' ? 'font-scheherazade' : 'font-arabic'} my-2.5 px-1`
                                  : 'text-[15.5px] sm:text-[17.5px] leading-[1.85] my-1.5'
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
                    <div className="p-4 sm:p-6 rounded-2xl bg-ink-950 border border-ink-800 text-parchment-200 font-mono text-xs sm:text-sm overflow-x-auto whitespace-pre-wrap leading-relaxed">
                      {stripThinkingTags(selectedFile.content)}
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
