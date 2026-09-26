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
  ArrowRight
} from 'lucide-react';
import { getKajianList } from '../utils/api';

export default function KajianArchivePage({
  onBackToStudio,
  onLoadToTaswidah,
  onLoadToChat,
  arabicFontSize = 24,
  arabicFontFamily = 'amiri',
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
        // Default select first document if not selected
        if (!selectedFile && files.length > 0) {
          const firstNonReadme = files.find(f => f.filename !== 'README.md') || files[0];
          setSelectedFile(firstNonReadme);
        }
      }
    } catch (err) {
      console.error('Error fetching kajian list:', err);
    } finally {
      setLoading(false);
    }
  };

  // Keyboard shortcut Ctrl+K or / to focus search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey && e.key === 'k') || (e.key === '/' && document.activeElement !== searchInputRef.current)) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Filter & Search Engine (Instant 0ms in-memory full-text search)
  const filteredAndSearched = useMemo(() => {
    const query = search.trim().toLowerCase();

    return kajianList
      .filter(item => {
        // Matra filter
        if (filterMatra !== 'all') {
          const matraLower = (item.matra || '').toLowerCase();
          if (filterMatra === 'waqi_iyyah' && !matraLower.includes('waqi')) return false;
          if (filterMatra === 'maudlu_iyyah' && !matraLower.includes('maudlu')) return false;
          if (filterMatra === 'qanuniyyah' && !matraLower.includes('qanun')) return false;
        }

        if (!query) return true;

        // Search in title, filename, matra, fan, and full content
        const titleMatch = (item.title || '').toLowerCase().includes(query);
        const filenameMatch = (item.filename || '').toLowerCase().includes(query);
        const matraMatch = (item.matra || '').toLowerCase().includes(query);
        const fanMatch = (item.fan || '').toLowerCase().includes(query);
        const contentMatch = (item.content || '').toLowerCase().includes(query);

        return titleMatch || filenameMatch || matraMatch || fanMatch || contentMatch;
      })
      .map(item => {
        if (!query || !item.content) {
          return { ...item, matchCount: 0, snippet: '' };
        }

        // Count occurrences and extract contextual snippet
        const contentLower = item.content.toLowerCase();
        let matchCount = 0;
        let pos = contentLower.indexOf(query);
        let firstPos = pos;

        while (pos !== -1) {
          matchCount++;
          pos = contentLower.indexOf(query, pos + query.length);
        }

        // Extract excerpt around first occurrence
        let snippet = '';
        if (firstPos !== -1) {
          const start = Math.max(0, firstPos - 60);
          const end = Math.min(item.content.length, firstPos + query.length + 80);
          const rawSnippet = item.content.substring(start, end).replace(/\n/g, ' ');
          snippet = (start > 0 ? '...' : '') + rawSnippet + (end < item.content.length ? '...' : '');
        }

        return { ...item, matchCount, snippet };
      })
      .sort((a, b) => {
        // If searching, prioritize match count
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

  // Total stats
  const totalDocs = kajianList.filter(f => f.filename !== 'README.md').length;
  const totalSizeKb = (kajianList.reduce((acc, f) => acc + (f.size || 0), 0) / 1024).toFixed(1);

  const handleCopyText = (text, type = 'all') => {
    navigator.clipboard.writeText(text);
    setCopiedStatus(type);
    setTimeout(() => setCopiedStatus(null), 2500);
  };

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

  // Highlight search keyword in snippet
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
      {/* Top Explorer Navigation Bar */}
      <div className="px-4 sm:px-6 py-3 border-b border-parchment-200 dark:border-ink-800 bg-white/90 dark:bg-ink-900/90 backdrop-blur-md flex items-center justify-between gap-3 flex-shrink-0 z-10 shadow-2xs">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToStudio}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-parchment-300 dark:border-ink-700 hover:border-turath-emerald bg-parchment-50 dark:bg-ink-950 text-xs font-semibold text-turath-emerald dark:text-emerald-300 hover:bg-turath-emerald/10 transition-all shadow-xs group"
            title="Kembali ke Studio Musyawarah Bahtsul Masail"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            <span>Kembali ke Studio</span>
          </button>

          <div className="hidden sm:block h-5 w-[1px] bg-parchment-300 dark:border-ink-800" />

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-turath-emerald text-parchment-50 flex items-center justify-center font-bold shadow-xs">
              <FolderArchive className="w-4 h-4 text-turath-gold" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-sm sm:text-base leading-tight text-ink-900 dark:text-parchment-50">
                Repositori Naskah Kajian (kajian/)
              </h2>
              <p className="text-[11px] text-ink-500 font-mono">
                {totalDocs} naskah tersimpan • {totalSizeKb} KB total
              </p>
            </div>
          </div>
        </div>

        {/* Right Tools: Refresh & Mobile View Switcher */}
        <div className="flex items-center gap-2">
          {/* Mobile View Toggle */}
          <div className="flex md:hidden items-center bg-parchment-200 dark:bg-ink-800 p-0.5 rounded-lg text-xs">
            <button
              onClick={() => setMobileView('list')}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                mobileView === 'list'
                  ? 'bg-white dark:bg-ink-900 text-turath-emerald font-bold shadow-xs'
                  : 'text-ink-600 dark:text-ink-400'
              }`}
            >
              Daftar ({filteredAndSearched.length})
            </button>
            <button
              onClick={() => setMobileView('reader')}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                mobileView === 'reader'
                  ? 'bg-white dark:bg-ink-900 text-turath-emerald font-bold shadow-xs'
                  : 'text-ink-600 dark:text-ink-400'
              }`}
            >
              Baca
            </button>
          </div>

          <button
            onClick={fetchList}
            disabled={loading}
            className="p-2 rounded-xl border border-parchment-300 dark:border-ink-700 bg-white dark:bg-ink-900 text-ink-600 dark:text-parchment-300 hover:text-turath-emerald hover:border-turath-emerald transition-all shadow-xs"
            title="Muat ulang repositori"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-turath-emerald' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Dual-Column Explorer Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Explorer Pane: Search & Filter (Width: 360px - 440px) */}
        <div 
          className={`h-full w-full md:w-[380px] lg:w-[440px] xl:w-[480px] flex-shrink-0 border-r border-parchment-200 dark:border-ink-800 bg-parchment-100/50 dark:bg-ink-900/40 flex flex-col overflow-hidden transition-all ${
            mobileView === 'list' ? 'flex' : 'hidden md:flex'
          }`}
        >
          {/* Instant Search Bar */}
          <div className="p-3.5 border-b border-parchment-200 dark:border-ink-800 space-y-2.5 bg-white/60 dark:bg-ink-900/60 backdrop-blur-xs">
            <div className="relative">
              <Search className="w-4 h-4 text-ink-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                ref={searchInputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari kata kunci di seluruh isi naskah, kitab, ibarat..."
                className="w-full pl-9 pr-8 py-2 rounded-xl border border-parchment-300 dark:border-ink-700 bg-white dark:bg-ink-950 text-xs text-ink-900 dark:text-parchment-50 placeholder-ink-400 focus:outline-none focus:ring-1 focus:ring-turath-emerald shadow-inner font-sans"
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

            {/* Quick Matra Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar text-[11px]">
              <button
                onClick={() => setFilterMatra('all')}
                className={`px-2.5 py-1 rounded-full whitespace-nowrap transition-all font-medium ${
                  filterMatra === 'all'
                    ? 'bg-turath-emerald text-white shadow-2xs font-semibold'
                    : 'bg-white dark:bg-ink-900 text-ink-600 dark:text-ink-400 border border-parchment-300 dark:border-ink-800'
                }`}
              >
                Semua ({kajianList.length})
              </button>
              <button
                onClick={() => setFilterMatra('waqi_iyyah')}
                className={`px-2.5 py-1 rounded-full whitespace-nowrap transition-all font-medium ${
                  filterMatra === 'waqi_iyyah'
                    ? 'bg-turath-emerald text-white shadow-2xs font-semibold'
                    : 'bg-white dark:bg-ink-900 text-ink-600 dark:text-ink-400 border border-parchment-300 dark:border-ink-800'
                }`}
              >
                Wāqi'iyyah
              </button>
              <button
                onClick={() => setFilterMatra('maudlu_iyyah')}
                className={`px-2.5 py-1 rounded-full whitespace-nowrap transition-all font-medium ${
                  filterMatra === 'maudlu_iyyah'
                    ? 'bg-turath-emerald text-white shadow-2xs font-semibold'
                    : 'bg-white dark:bg-ink-900 text-ink-600 dark:text-ink-400 border border-parchment-300 dark:border-ink-800'
                }`}
              >
                Maudlū'iyyah
              </button>
              <button
                onClick={() => setFilterMatra('qanuniyyah')}
                className={`px-2.5 py-1 rounded-full whitespace-nowrap transition-all font-medium ${
                  filterMatra === 'qanuniyyah'
                    ? 'bg-turath-emerald text-white shadow-2xs font-semibold'
                    : 'bg-white dark:bg-ink-900 text-ink-600 dark:text-ink-400 border border-parchment-300 dark:border-ink-800'
                }`}
              >
                Qānūniyyah
              </button>
            </div>

            {/* Results count & Sort */}
            <div className="flex items-center justify-between text-[11px] text-ink-500 pt-1">
              <span>
                {search ? (
                  <span className="font-semibold text-turath-emerald dark:text-emerald-400">
                    {filteredAndSearched.length} naskah cocok
                  </span>
                ) : (
                  <span>Menampilkan {filteredAndSearched.length} kajian</span>
                )}
              </span>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent border-0 text-[11px] text-ink-600 dark:text-ink-400 font-medium focus:ring-0 cursor-pointer"
              >
                <option value="newest">Urut: Terbaru</option>
                <option value="oldest">Urut: Terlama</option>
                <option value="title">Urut: Judul (A-Z)</option>
                <option value="size">Urut: Ukuran File</option>
              </select>
            </div>
          </div>

          {/* Results Document Cards List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
            {filteredAndSearched.length === 0 ? (
              <div className="text-center py-16 px-4 text-xs text-ink-400 space-y-2">
                <Search className="w-8 h-8 mx-auto text-ink-300 dark:text-ink-700" />
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
                    className={`w-full text-left p-3.5 rounded-2xl border transition-all flex flex-col gap-2 relative ${
                      isSelected
                        ? 'bg-white dark:bg-ink-900 border-turath-emerald dark:border-emerald-600 shadow-md ring-1 ring-turath-emerald'
                        : 'bg-white/80 dark:bg-ink-900/80 border-parchment-200 dark:border-ink-800 hover:border-parchment-300 dark:hover:border-ink-700 hover:shadow-xs'
                    }`}
                  >
                    {/* Header: Title + Matra Badge */}
                    <div className="space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="font-serif font-bold text-[13.5px] leading-snug text-ink-900 dark:text-parchment-50 line-clamp-2">
                          {item.title}
                        </div>
                        {item.matra && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-turath-emerald-soft dark:bg-turath-emerald-dark-soft text-turath-emerald dark:text-emerald-300 font-semibold shrink-0">
                            {item.matra.split('—')[0].trim()}
                          </span>
                        )}
                      </div>

                      {/* Content search match snippet */}
                      {search && item.snippet && (
                        <div className="p-2 rounded-xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/60 text-[11px] leading-relaxed text-ink-800 dark:text-parchment-200 mt-1.5 font-sans">
                          <div className="text-[10px] font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1 mb-0.5">
                            <Sparkles className="w-3 h-3" />
                            <span>Ditemukan {item.matchCount} kali dalam isi naskah:</span>
                          </div>
                          <div>{highlightSnippet(item.snippet, search)}</div>
                        </div>
                      )}
                    </div>

                    {/* Metadata Footer */}
                    <div className="flex items-center gap-2 text-[10.5px] text-ink-500 dark:text-ink-400 font-mono pt-1 border-t border-parchment-100 dark:border-ink-800/80">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{item.filename.substring(0, 10)}</span>
                      </span>
                      <span>•</span>
                      <span className="truncate max-w-[140px] text-ink-400">{item.filename.replace(/^\d{4}-\d{2}-\d{2}-/, '')}</span>
                      <span>•</span>
                      <span className="ml-auto">{(item.size / 1024).toFixed(1)} KB</span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Reader Pane: Full Document View (Generous Layout) */}
        <div 
          className={`flex-1 flex flex-col h-full bg-parchment-50 dark:bg-ink-950 overflow-hidden ${
            mobileView === 'reader' ? 'flex' : 'hidden md:flex'
          }`}
        >
          {selectedFile ? (
            <>
              {/* Document Action Toolbar */}
              <div className="px-5 py-3 border-b border-parchment-200 dark:border-ink-800 bg-white/80 dark:bg-ink-900/80 backdrop-blur-md flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap flex-shrink-0 shadow-2xs">
                {/* Left: Document quick title and mode switcher */}
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <div className="flex items-center bg-parchment-200 dark:bg-ink-800 p-0.5 rounded-lg text-xs font-sans shrink-0">
                    <button
                      onClick={() => setActiveTab('preview')}
                      className={`px-3 py-1 rounded-md flex items-center gap-1.5 transition-all ${
                        activeTab === 'preview'
                          ? 'bg-white dark:bg-ink-900 text-turath-emerald font-bold shadow-xs'
                          : 'text-ink-600 dark:text-ink-400'
                      }`}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Baca Naskah</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('raw')}
                      className={`px-3 py-1 rounded-md flex items-center gap-1.5 transition-all ${
                        activeTab === 'raw'
                          ? 'bg-white dark:bg-ink-900 text-turath-emerald font-bold shadow-xs'
                          : 'text-ink-600 dark:text-ink-400'
                      }`}
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Markdown (.md)</span>
                    </button>
                  </div>

                  <span className="hidden lg:inline text-xs font-mono text-ink-500 truncate max-w-xs">
                    📁 kajian/{selectedFile.filename}
                  </span>
                </div>

                {/* Right Action Buttons */}
                <div className="flex items-center gap-1.5 sm:gap-2 text-xs font-sans flex-wrap">
                  {/* Load to Dock */}
                  <button
                    onClick={() => {
                      onLoadToTaswidah(selectedFile.content);
                      onBackToStudio();
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-turath-emerald text-white hover:bg-turath-emerald-light transition-all shadow-xs font-semibold"
                    title="Muat naskah ini ke Dock Taswidah dan buka Studio"
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
                      className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-parchment-300 dark:border-ink-700 bg-white dark:bg-ink-900 text-ink-700 dark:text-parchment-200 hover:border-turath-emerald hover:text-turath-emerald transition-all shadow-xs"
                      title="Lanjutkan musyawarah naskah ini di Chat"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Bahas di Chat</span>
                    </button>
                  )}

                  {/* Copy Word */}
                  <button
                    onClick={() => handleCopyWord(selectedFile.content)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-parchment-300 dark:border-ink-700 bg-white dark:bg-ink-900 text-ink-700 dark:text-parchment-200 hover:border-turath-emerald transition-all shadow-xs"
                    title="Salin untuk dokumen Word / Capacities"
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
                    className="p-1.5 sm:px-3 sm:py-1.5 rounded-xl border border-parchment-300 dark:border-ink-700 bg-white dark:bg-ink-900 text-ink-700 dark:text-parchment-200 hover:border-turath-emerald transition-all shadow-xs flex items-center gap-1"
                    title="Unduh berkas .md ke perangkat"
                  >
                    <Download className="w-3.5 h-3.5 text-ink-500" />
                    <span className="hidden sm:inline">Unduh .md</span>
                  </button>
                </div>
              </div>

              {/* Document Reading View Body */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6">
                <div className="max-w-4xl mx-auto space-y-6">
                  {/* Meta Callout Card */}
                  <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-ink-900 border border-parchment-200 dark:border-ink-800 shadow-sm space-y-3 font-sans">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-turath-emerald-soft dark:bg-turath-emerald-dark-soft text-turath-emerald dark:text-emerald-300">
                        {selectedFile.matra || "Bahtsul Masail Nahdlatul Ulama"}
                      </span>
                      <span className="font-mono text-xs text-ink-400">
                        Diperbarui: {new Date(selectedFile.updatedAt).toLocaleDateString('id-ID', { dateStyle: 'full' })}
                      </span>
                    </div>

                    <h1 className="font-serif font-bold text-xl sm:text-2xl lg:text-3xl text-ink-950 dark:text-parchment-50 leading-snug">
                      {selectedFile.title}
                    </h1>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-2 border-t border-parchment-100 dark:border-ink-800 text-ink-600 dark:text-ink-400">
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
                      {selectedFile.waktu && (
                        <div className="sm:col-span-2">
                          <span className="font-semibold text-ink-900 dark:text-parchment-200">Waktu Sidang:</span> {selectedFile.waktu}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Rendered Markdown or Raw Code View */}
                  {activeTab === 'preview' ? (
                    <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-ink-900 border border-parchment-200 dark:border-ink-800 shadow-sm space-y-4 font-serif text-base sm:text-[17px] leading-[1.85] text-ink-900 dark:text-parchment-100">
                      {selectedFile.content ? (
                        selectedFile.content.split('\n').map((line, idx) => {
                          const trimmed = line.trim();
                          if (!trimmed) return <div key={idx} className="h-2" />;

                          if (trimmed.startsWith('#')) {
                            const level = trimmed.match(/^#+/)[0].length;
                            const text = trimmed.replace(/^#+\s*/, '');
                            if (level === 1) return <h2 key={idx} className="font-serif font-bold text-xl sm:text-2xl text-turath-emerald dark:text-emerald-300 mt-6 mb-3 pb-1 border-b border-parchment-200 dark:border-ink-800">{text}</h2>;
                            if (level === 2) return <h3 key={idx} className="font-serif font-bold text-lg sm:text-xl text-ink-900 dark:text-parchment-100 mt-5 mb-2">{text}</h3>;
                            return <h4 key={idx} className="font-serif font-bold text-base sm:text-lg text-ink-800 dark:text-parchment-200 mt-4 mb-1.5">{text}</h4>;
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
                                  className={`my-4 p-4 sm:p-5 rounded-2xl border-r-4 border-r-turath-gold border-l-0 bg-parchment-100/70 dark:bg-ink-950/80 text-right arabic-text break-words overflow-x-hidden ${
                                    arabicFontFamily === 'scheherazade' ? 'font-scheherazade' : 'font-arabic'
                                  }`}
                                  style={{ fontSize: `${arabicFontSize}px` }}
                                  dangerouslySetInnerHTML={{ __html: formatTextToHtml(quoteContent) }}
                                />
                              );
                            }

                            return (
                              <blockquote
                                key={idx}
                                dir="ltr"
                                className="my-3 px-4 py-3 border-l-4 border-turath-gold bg-parchment-100/60 dark:bg-ink-950/60 rounded-r-xl text-sm sm:text-base leading-relaxed text-ink-800 dark:text-parchment-200"
                                dangerouslySetInnerHTML={{ __html: formatTextToHtml(quoteContent) }}
                              />
                            );
                          }

                          if (trimmed.includes('Makna Murod') || trimmed.includes('Wajhul Istidlal') || trimmed.includes('Wajhul Ilhaq')) {
                            return (
                              <div key={idx} className="mt-4 pt-1 text-xs sm:text-sm font-sans font-bold uppercase tracking-wider text-turath-emerald dark:text-emerald-300">
                                <span dangerouslySetInnerHTML={{ __html: formatTextToHtml(trimmed) }} />
                              </div>
                            );
                          }

                          if (trimmed.includes('Tautan Verifikasi') || (trimmed.includes('Turath.io') && trimmed.includes('http'))) {
                            return (
                              <div key={idx} className="my-3 p-3.5 rounded-xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/60 text-xs sm:text-sm text-blue-900 dark:text-blue-200 flex items-center gap-2 font-sans shadow-2xs">
                                <span className="shrink-0 text-base">🔗</span>
                                <div className="flex-1 break-words font-medium" dangerouslySetInnerHTML={{ __html: formatTextToHtml(trimmed) }} />
                              </div>
                            );
                          }

                          const arabicCount = (trimmed.match(/[\u0600-\u06FF]/g) || []).length;
                          const isArabic = arabicCount > 15 || (arabicCount / (trimmed.length || 1) > 0.4);

                          return (
                            <p
                              key={idx}
                              dir={isArabic ? 'rtl' : 'ltr'}
                              className={isArabic 
                                ? `arabic-text ${arabicFontFamily === 'scheherazade' ? 'font-scheherazade' : 'font-arabic'} my-3 px-1 break-words overflow-x-hidden` 
                                : 'my-2.5 break-words'
                              }
                              style={isArabic ? { fontSize: `${arabicFontSize}px` } : undefined}
                              dangerouslySetInnerHTML={{ __html: formatTextToHtml(trimmed) }}
                            />
                          );
                        })
                      ) : (
                        <p className="text-ink-400">Berkas kosong.</p>
                      )}
                    </div>
                  ) : (
                    /* Raw Markdown Source View */
                    <div className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-ink-900 border border-parchment-200 dark:border-ink-800 font-mono text-xs leading-relaxed text-ink-800 dark:text-parchment-200 whitespace-pre-wrap overflow-x-auto">
                      {selectedFile.content}
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-ink-400 space-y-3 font-sans">
              <FolderArchive className="w-12 h-12 text-ink-300 dark:text-ink-700" />
              <h3 className="font-serif font-bold text-lg text-ink-800 dark:text-parchment-200">
                Pilih Berkas Kajian untuk Dibaca
              </h3>
              <p className="text-xs text-ink-500 max-w-sm">
                Pilih salah satu dokumen dari daftar di sebelah kiri atau ketik kata kunci untuk mencari di seluruh isi naskah turats.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
