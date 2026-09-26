import React, { useState } from 'react';
import { 
  FileText, 
  Copy, 
  Check, 
  Save, 
  Download, 
  Layers, 
  BookOpen, 
  Sparkles, 
  ExternalLink,
  Edit3,
  Eye,
  Trash2,
  X,
  FolderArchive
} from 'lucide-react';
import { extractIbaratFromText, formatIbaratForWord } from '../utils/ibaratExtractor';
import { extractTemaFromContent, generateKajianSlug } from '../utils/kajianMeta';
import { saveKajian } from '../utils/api';

export default function TaswidahDock({
  taswidahContent,
  setTaswidahContent,
  onSaveSuccess,
  arabicFontSize,
  arabicFontFamily,
  matraMode,
  selectedModel,
  dockLayout = 'balanced',
  setDockLayout,
}) {
  const [activeTab, setActiveTab] = useState('ibarat'); // 'ibarat' | 'naskah'
  const [editorMode, setEditorMode] = useState('preview'); // 'preview' | 'edit'
  const [copiedStatus, setCopiedStatus] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  // Extract ibarat dynamically from current taswidahContent
  const ibaratList = extractIbaratFromText(taswidahContent);

  // Derive true Tema from content (not generic # DRAF TASWIDAH)
  const derivedTitle = extractTemaFromContent(taswidahContent, 'Draf Taswidah Bahtsul Masail');
  const derivedSlug = generateKajianSlug(derivedTitle);

  // Save Modal state
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [saveTitleInput, setSaveTitleInput] = useState('');
  const [saveSlugInput, setSaveSlugInput] = useState('');

  // Stats by layer
  const syaikhoniCount = ibaratList.filter(i => i.layer.includes('Syaikhoni')).length;
  const hawasyiCount = ibaratList.filter(i => i.layer.includes('Hawasyi')).length;
  const mutaqaddiminCount = ibaratList.filter(i => i.layer.includes('Mutaqaddimin')).length;
  const qawaidCount = ibaratList.filter(i => i.layer.includes('Qawā\'id')).length;
  const muqaranahCount = ibaratList.filter(i => i.layer.includes('Muqaranah')).length;

  const handleCopyWord = () => {
    // Copy the entire taswidah formatted for Word / Capacities
    const wordFormatted = taswidahContent
      .replace(/<u>\*\*【/g, '<u><b>')
      .replace(/】\*\*<\/u>/g, '</b></u>');
    navigator.clipboard.writeText(wordFormatted);
    setCopiedStatus('all-word');
    setTimeout(() => setCopiedStatus(null), 2500);
  };

  const handleCopySingleIbarat = (ibarat) => {
    const formatted = formatIbaratForWord(ibarat);
    navigator.clipboard.writeText(formatted);
    setCopiedStatus(ibarat.id);
    setTimeout(() => setCopiedStatus(null), 2000);
  };

  const handleDownloadMd = () => {
    const blob = new Blob([taswidahContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const now = new Date().toISOString().split('T')[0];
    const slug = generateKajianSlug(derivedTitle);
    link.href = url;
    link.download = `${now}-${slug}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const openSaveModal = () => {
    if (!taswidahContent.trim()) return;
    const currentTema = extractTemaFromContent(taswidahContent, 'Draf Taswidah Bahtsul Masail');
    const currentSlug = generateKajianSlug(currentTema);
    setSaveTitleInput(currentTema);
    setSaveSlugInput(currentSlug);
    setIsSaveModalOpen(true);
  };

  const handleConfirmSave = async () => {
    setIsSaving(true);
    setSaveMessage('');

    try {
      const res = await saveKajian({
        title: saveTitleInput || derivedTitle,
        slug: saveSlugInput || derivedSlug,
        content: taswidahContent,
        model: selectedModel,
        matraMode,
      });

      if (res.ok) {
        setSaveMessage(`Tersimpan: ${res.filename}`);
        setIsSaveModalOpen(false);
        if (onSaveSuccess) onSaveSuccess(res.filename);
        setTimeout(() => setSaveMessage(''), 4500);
      } else {
        alert(`Gagal menyimpan ke repositori: ${res.error}`);
      }
    } catch (err) {
      alert(`Error menyimpan berkas: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
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

  return (
    <div className="flex flex-col h-full bg-parchment-100/70 dark:bg-ink-900/60 border-l border-parchment-200 dark:border-ink-800 transition-colors w-full overflow-hidden">
      {/* Dock Top Tabs */}
      <div className="px-3 sm:px-4 py-2.5 sm:py-3 border-b border-parchment-200 dark:border-ink-800 bg-parchment-50/90 dark:bg-ink-950/90 flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
        <div className="flex items-center gap-1 bg-parchment-200/70 dark:bg-ink-900 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('ibarat')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-sans font-medium transition-all ${
              activeTab === 'ibarat'
                ? 'bg-white dark:bg-ink-800 text-turath-emerald dark:text-emerald-400 shadow-sm'
                : 'text-ink-600 dark:text-ink-400 hover:text-ink-900'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Ibarat & Marāji'</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-turath-emerald-soft dark:bg-turath-emerald-dark-soft text-turath-emerald font-bold">
              {ibaratList.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('naskah')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-sans font-medium transition-all ${
              activeTab === 'naskah'
                ? 'bg-white dark:bg-ink-800 text-turath-emerald dark:text-emerald-400 shadow-sm'
                : 'text-ink-600 dark:text-ink-400 hover:text-ink-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Draf Taswīdah</span>
          </button>
        </div>

        {/* Right Tools: Width Switcher + Auto-Sync + Clear */}
        <div className="flex items-center gap-1.5 ml-auto">
          {setDockLayout && (
            <div className="hidden sm:flex items-center bg-parchment-200/60 dark:bg-ink-900 p-0.5 rounded-lg text-[10px] font-sans font-medium border border-parchment-300/40 dark:border-ink-800">
              <button
                onClick={() => setDockLayout('compact')}
                className={`px-2 py-0.5 rounded transition-all ${
                  dockLayout === 'compact'
                    ? 'bg-white dark:bg-ink-800 text-turath-emerald font-bold shadow-2xs'
                    : 'text-ink-500 hover:text-ink-900 dark:hover:text-parchment-200'
                }`}
                title="Lebar Kompak (460px)"
              >
                Kompak
              </button>
              <button
                onClick={() => setDockLayout('balanced')}
                className={`px-2 py-0.5 rounded transition-all ${
                  dockLayout === 'balanced'
                    ? 'bg-white dark:bg-ink-800 text-turath-emerald font-bold shadow-2xs'
                    : 'text-ink-500 hover:text-ink-900 dark:hover:text-parchment-200'
                }`}
                title="Seimbang 50% Obrolan : 50% Taswidah"
              >
                50:50
              </button>
              <button
                onClick={() => setDockLayout('wide')}
                className={`px-2 py-0.5 rounded transition-all ${
                  dockLayout === 'wide'
                    ? 'bg-white dark:bg-ink-800 text-turath-emerald font-bold shadow-2xs'
                    : 'text-ink-500 hover:text-ink-900 dark:hover:text-parchment-200'
                }`}
                title="Lebar Penuh (62% Layar - Nyaman untuk Teks Arab Besar)"
              >
                Lebar
              </button>
            </div>
          )}

          <div 
            className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-sans font-medium bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 shadow-2xs"
            title="Auto-Sync aktif: ibarat dan draf otomatis terisi saat AI menghasilkan respon"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="hidden sm:inline">Auto-Sync</span>
          </div>

          {/* Clear Content Button */}
          {taswidahContent && (
            <button
              onClick={() => {
                if (window.confirm('Bersihkan draf taswidah aktif ini?')) {
                  setTaswidahContent('');
                }
              }}
              className="p-1.5 rounded text-ink-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-parchment-200 dark:hover:bg-ink-800 transition-colors"
              title="Bersihkan draf taswidah"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Dock Content Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {activeTab === 'ibarat' ? (
          /* IBARAT & MARAJI' TAB */
          <div className="space-y-4 font-sans">
            {/* Multi-source coverage scorecard */}
            <div className="p-3.5 rounded-xl bg-white dark:bg-ink-900 border border-parchment-200 dark:border-ink-800 shadow-sm space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-ink-900 dark:text-parchment-100 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-turath-emerald" />
                  <span>Kepatuhan Multi-Referensi (NU Standard)</span>
                </span>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                  ibaratList.length >= 3 
                    ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300' 
                    : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                }`}>
                  {ibaratList.length >= 3 ? '✓ Terverifikasi (≥3 Ibarat)' : `${ibaratList.length}/3 Ibarat`}
                </span>
              </div>

              {/* Layer distribution badges */}
              <div className="flex flex-wrap gap-1.5 text-[11px]">
                <span className={`px-2 py-0.5 rounded border ${
                  syaikhoniCount > 0 
                    ? 'bg-turath-emerald-soft dark:bg-turath-emerald-dark-soft border-turath-emerald/30 text-turath-emerald dark:text-emerald-300 font-medium'
                    : 'bg-parchment-100 dark:bg-ink-800 border-parchment-200 dark:border-ink-700 text-ink-400'
                }`}>
                  Syaikhoni ({syaikhoniCount})
                </span>
                <span className={`px-2 py-0.5 rounded border ${
                  hawasyiCount > 0 
                    ? 'bg-turath-emerald-soft dark:bg-turath-emerald-dark-soft border-turath-emerald/30 text-turath-emerald dark:text-emerald-300 font-medium'
                    : 'bg-parchment-100 dark:bg-ink-800 border-parchment-200 dark:border-ink-700 text-ink-400'
                }`}>
                  Hawasyi ({hawasyiCount})
                </span>
                <span className={`px-2 py-0.5 rounded border ${
                  mutaqaddiminCount > 0 
                    ? 'bg-turath-emerald-soft dark:bg-turath-emerald-dark-soft border-turath-emerald/30 text-turath-emerald dark:text-emerald-300 font-medium'
                    : 'bg-parchment-100 dark:bg-ink-800 border-parchment-200 dark:border-ink-700 text-ink-400'
                }`}>
                  Mutaqaddimin ({mutaqaddiminCount})
                </span>
                <span className={`px-2 py-0.5 rounded border ${
                  qawaidCount > 0 
                    ? 'bg-turath-emerald-soft dark:bg-turath-emerald-dark-soft border-turath-emerald/30 text-turath-emerald dark:text-emerald-300 font-medium'
                    : 'bg-parchment-100 dark:bg-ink-800 border-parchment-200 dark:border-ink-700 text-ink-400'
                }`}>
                  Qawa'id ({qawaidCount})
                </span>
                <span className={`px-2 py-0.5 rounded border ${
                  muqaranahCount > 0 
                    ? 'bg-turath-emerald-soft dark:bg-turath-emerald-dark-soft border-turath-emerald/30 text-turath-emerald dark:text-emerald-300 font-medium'
                    : 'bg-parchment-100 dark:bg-ink-800 border-parchment-200 dark:border-ink-700 text-ink-400'
                }`}>
                  Muqaranah ({muqaranahCount})
                </span>
              </div>
            </div>

            {/* List of extracted ibarat cards */}
            {ibaratList.length === 0 ? (
              <div className="p-6 sm:p-8 text-center space-y-2.5 border border-dashed border-parchment-300 dark:border-ink-800 rounded-2xl text-ink-500 bg-white/40 dark:bg-ink-900/40">
                <div className="w-10 h-10 rounded-full bg-turath-emerald/10 text-turath-emerald flex items-center justify-center mx-auto shadow-xs">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-serif font-bold text-sm text-ink-900 dark:text-parchment-100">
                    Dock Ibarat & Marāji'
                  </h4>
                  <p className="text-xs text-ink-600 dark:text-ink-400 max-w-xs mx-auto leading-relaxed mt-1">
                    Kutipan kitab turats, harakat, dan mahallus syahid akan otomatis terdeteksi dan tersusun rapi di sini saat Anda bermusyawarah di sebelah kiri.
                  </p>
                </div>
                <div className="pt-2 flex items-center justify-center gap-1.5 text-[11px] text-turath-emerald dark:text-emerald-400 font-medium">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Auto-Sync aktif atau tekan "Ekstrak ke Taswīdah" di obrolan</span>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {ibaratList.map((ibarat, idx) => (
                  <div
                    key={ibarat.id || idx}
                    className="p-4 rounded-xl bg-white dark:bg-ink-900 border border-parchment-200 dark:border-ink-800 shadow-sm space-y-3 group hover:border-turath-emerald/60 transition-all"
                  >
                    {/* Kitab Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h4 className="font-serif font-bold text-sm text-turath-emerald dark:text-emerald-300 leading-snug">
                          {ibarat.book}
                        </h4>
                        <div className="flex items-center gap-1.5 text-[10px] text-ink-500 dark:text-ink-400 mt-0.5">
                          <span className="px-1.5 py-0.2 rounded bg-parchment-100 dark:bg-ink-800 font-medium">
                            {ibarat.layer}
                          </span>
                          <span>•</span>
                          <span className="font-medium text-turath-gold">
                            Madzhab {ibarat.madzhab}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleCopySingleIbarat(ibarat)}
                        className="p-1.5 rounded-lg border border-parchment-200 dark:border-ink-800 hover:bg-parchment-100 dark:hover:bg-ink-800 text-ink-500 dark:text-ink-400 transition-colors"
                        title="Salin ibarat ini format Word / Capacities"
                      >
                        {copiedStatus === ibarat.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    {/* Arabic Text Quote */}
                    <div
                      dir="rtl"
                      className={`p-3.5 sm:p-4 rounded-xl bg-parchment-50 dark:bg-ink-950/80 border border-parchment-200/60 dark:border-ink-800/60 arabic-text break-words overflow-x-hidden ${
                        arabicFontFamily === 'scheherazade' ? 'font-scheherazade' : 'font-arabic'
                      }`}
                      style={{ fontSize: `${arabicFontSize}px` }}
                      dangerouslySetInnerHTML={{
                        __html: formatTextToHtml(ibarat.arabicText),
                      }}
                    />

                    {/* Mahallus Syahid badge if extracted */}
                    {ibarat.highlight && (
                      <div className="p-2 rounded-md bg-turath-gold-subtle dark:bg-turath-gold/10 border border-turath-gold/30 text-xs">
                        <div className="text-[10px] font-semibold text-turath-gold-dark dark:text-amber-300 uppercase tracking-wider mb-0.5">
                          Titik Temu Hukum (Mahallus Syahid)
                        </div>
                        <div className="arabic-text font-arabic text-ink-900 dark:text-parchment-100">
                          {ibarat.highlight}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* NASKAH TASWIDAH TAB */
          <div className="space-y-3 font-sans h-full flex flex-col">
            {/* Mode switch: Preview vs Edit */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-ink-900 dark:text-parchment-100 truncate">
                {derivedTitle}
              </span>
              <div className="flex items-center gap-1 bg-parchment-200/70 dark:bg-ink-900 p-0.5 rounded-lg text-xs">
                <button
                  onClick={() => setEditorMode('preview')}
                  className={`px-2 py-0.5 rounded flex items-center gap-1 ${
                    editorMode === 'preview'
                      ? 'bg-white dark:bg-ink-800 text-turath-emerald dark:text-emerald-400 font-medium shadow-xs'
                      : 'text-ink-600 dark:text-ink-400'
                  }`}
                >
                  <Eye className="w-3 h-3" />
                  <span>Pratinjau</span>
                </button>
                <button
                  onClick={() => setEditorMode('edit')}
                  className={`px-2 py-0.5 rounded flex items-center gap-1 ${
                    editorMode === 'edit'
                      ? 'bg-white dark:bg-ink-800 text-turath-emerald dark:text-emerald-400 font-medium shadow-xs'
                      : 'text-ink-600 dark:text-ink-400'
                  }`}
                >
                  <Edit3 className="w-3 h-3" />
                  <span>Edit .md</span>
                </button>
              </div>
            </div>

            {editorMode === 'preview' ? (
              <div className="p-4 rounded-xl bg-white dark:bg-ink-900 border border-parchment-200 dark:border-ink-800 shadow-sm flex-1 overflow-y-auto space-y-3 font-serif text-sm leading-relaxed text-ink-900 dark:text-parchment-100">
                {taswidahContent ? (
                  taswidahContent.split('\n').map((line, idx) => {
                    const trimmedLine = line.trim();
                    if (!trimmedLine) return <div key={idx} className="h-1.5" />;

                    if (trimmedLine.startsWith('#')) {
                      return (
                        <h3 key={idx} className="font-serif font-bold text-base sm:text-lg text-turath-emerald dark:text-emerald-300 mt-4 mb-2 pb-1 border-b border-parchment-200 dark:border-ink-800">
                          {trimmedLine.replace(/^#+\s*/, '')}
                        </h3>
                      );
                    }

                    if (trimmedLine.startsWith('>')) {
                      const quoteContent = trimmedLine.replace(/^>\s*/, '');
                      const arabicChars = (quoteContent.match(/[\u0600-\u06FF]/g) || []).length;
                      const isArabicQuote = arabicChars > 15 || (arabicChars / (quoteContent.length || 1) > 0.35);

                      if (isArabicQuote) {
                        return (
                          <blockquote
                            key={idx}
                            dir="rtl"
                            className={`my-3 p-3.5 sm:p-4 rounded-xl border-r-4 border-r-turath-gold border-l-0 bg-parchment-50/95 dark:bg-ink-950/90 text-right arabic-text break-words overflow-x-hidden ${
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
                          className="my-2.5 px-3.5 py-2 border-l-3 border-turath-gold bg-parchment-50/80 dark:bg-ink-950/80 rounded-r-lg text-sm sm:text-base leading-relaxed text-ink-800 dark:text-parchment-200"
                          dangerouslySetInnerHTML={{ __html: formatTextToHtml(quoteContent) }}
                        />
                      );
                    }

                    if (trimmedLine.includes('Makna Murod') || trimmedLine.includes('Wajhul Istidlal') || trimmedLine.includes('Wajhul Ilhaq')) {
                      return (
                        <div key={idx} className="mt-3.5 pt-1 text-xs sm:text-sm font-sans font-bold uppercase tracking-wider text-turath-emerald dark:text-emerald-300">
                          <span dangerouslySetInnerHTML={{ __html: formatTextToHtml(trimmedLine) }} />
                        </div>
                      );
                    }

                    if (trimmedLine.includes('Tautan Verifikasi') || (trimmedLine.includes('Turath.io') && trimmedLine.includes('http'))) {
                      return (
                        <div key={idx} className="my-2.5 p-3 rounded-xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/60 text-xs sm:text-sm text-blue-900 dark:text-blue-200 flex items-center gap-2 font-sans shadow-2xs">
                          <span className="shrink-0 text-base">🔗</span>
                          <div className="flex-1 break-words font-medium" dangerouslySetInnerHTML={{ __html: formatTextToHtml(trimmedLine) }} />
                        </div>
                      );
                    }

                    const arabicCount = (trimmedLine.match(/[\u0600-\u06FF]/g) || []).length;
                    const isArabic = arabicCount > 15 || (arabicCount / (trimmedLine.length || 1) > 0.4);

                    return (
                      <p
                        key={idx}
                        dir={isArabic ? 'rtl' : 'ltr'}
                        className={isArabic 
                          ? `arabic-text ${arabicFontFamily === 'scheherazade' ? 'font-scheherazade' : 'font-arabic'} my-2 px-1 break-words overflow-x-hidden` 
                          : 'my-2 text-sm sm:text-[15.5px] leading-relaxed text-ink-800 dark:text-parchment-100 break-words'
                        }
                        style={isArabic ? { fontSize: `${arabicFontSize}px` } : undefined}
                        dangerouslySetInnerHTML={{ __html: formatTextToHtml(trimmedLine) }}
                      />
                    );
                  })
                ) : (
                  <div className="text-center py-12 px-4 space-y-2.5 font-sans">
                    <div className="w-10 h-10 rounded-full bg-turath-emerald/10 text-turath-emerald flex items-center justify-center mx-auto shadow-xs">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-serif font-bold text-sm text-ink-900 dark:text-parchment-100">
                        Draf Naskah Taswīdah
                      </h4>
                      <p className="text-xs text-ink-600 dark:text-ink-400 max-w-xs mx-auto leading-relaxed mt-1">
                        Draf naskah tersusun otomatis setelah AI merumuskan kajian, atau Anda dapat menekan tombol <b>"Ekstrak ke Taswīdah"</b> di obrolan, atau mengetik mandiri pada tab <b>Edit .md</b>.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <textarea
                value={taswidahContent}
                onChange={(e) => setTaswidahContent(e.target.value)}
                placeholder="Tuliskan atau sesuaikan draf taswidah dalam format Markdown..."
                className="w-full flex-1 p-3 rounded-xl bg-white dark:bg-ink-900 border border-parchment-200 dark:border-ink-800 text-xs font-mono leading-relaxed text-ink-900 dark:text-parchment-50 focus:outline-none focus:ring-1 focus:ring-turath-emerald resize-none"
              />
            )}
          </div>
        )}
      </div>

      {/* Dock Action Footer */}
      <div className="p-3 border-t border-parchment-200 dark:border-ink-800 bg-parchment-50/90 dark:bg-ink-950/90 font-sans space-y-2">
        {saveMessage && (
          <div className="text-[11px] text-center font-medium text-turath-emerald dark:text-emerald-400 animate-fade-in">
            {saveMessage}
          </div>
        )}

        <div className="grid grid-cols-2 gap-2">
          {/* Copy for Word / Capacities */}
          <button
            onClick={handleCopyWord}
            disabled={!taswidahContent}
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border border-parchment-300 dark:border-ink-700 bg-white dark:bg-ink-800 hover:bg-parchment-100 dark:hover:bg-ink-700 text-ink-800 dark:text-parchment-100 disabled:opacity-40 transition-all shadow-xs"
            title="Salin seluruh draf dengan format tag Word / Capacities"
          >
            {copiedStatus === 'all-word' ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-600">Tersalin!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-turath-gold" />
                <span>Salin Word</span>
              </>
            )}
          </button>

          {/* Download .md */}
          <button
            onClick={handleDownloadMd}
            disabled={!taswidahContent}
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border border-parchment-300 dark:border-ink-700 bg-white dark:bg-ink-800 hover:bg-parchment-100 dark:hover:bg-ink-700 text-ink-800 dark:text-parchment-100 disabled:opacity-40 transition-all shadow-xs"
            title="Unduh berkas Markdown (.md) ke perangkat"
          >
            <Download className="w-3.5 h-3.5 text-ink-500" />
            <span>Unduh .md</span>
          </button>
        </div>

        {/* 1-Click Save to Repository (kajian/) with Tema & Slug confirmation */}
        <button
          onClick={openSaveModal}
          disabled={!taswidahContent || isSaving}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold bg-turath-emerald hover:bg-turath-emerald-light text-parchment-50 disabled:opacity-40 transition-all shadow-sm border border-turath-gold/30"
          title="Simpan langsung ke repositori berkas kajian/ di server"
        >
          <Save className="w-4 h-4 text-turath-gold" />
          <span>{isSaving ? 'Menyimpan ke Repositori...' : 'Simpan ke kajian/ Repositori'}</span>
        </button>
      </div>

      {/* Save to Kajian Repository Modal Dialog */}
      {isSaveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-ink-950/75 backdrop-blur-xs animate-fade-in font-sans">
          <div className="bg-white dark:bg-ink-900 border border-parchment-200 dark:border-ink-800 rounded-2xl w-full max-w-lg shadow-manuscript-lg overflow-hidden">
            <div className="px-5 py-4 border-b border-parchment-200 dark:border-ink-800 bg-parchment-50 dark:bg-ink-950 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-turath-emerald text-parchment-50 flex items-center justify-center font-bold">
                  <Save className="w-4 h-4 text-turath-gold" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-sm text-ink-900 dark:text-parchment-50">
                    Simpan Naskah ke Repositori Kajian
                  </h3>
                  <p className="text-[11px] text-ink-500">
                    Folder: <code className="font-mono text-turath-emerald font-semibold">kajian/</code> | Branch: <code className="font-mono text-ink-600 dark:text-ink-400">private/bahtsu-klangopan-app</code>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsSaveModalOpen(false)}
                className="p-1 rounded-lg text-ink-400 hover:text-ink-900 dark:hover:text-parchment-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-ink-800 dark:text-parchment-200 mb-1">
                  Tema / Judul Kajian
                </label>
                <textarea
                  rows={2}
                  value={saveTitleInput}
                  onChange={(e) => {
                    const newTitle = e.target.value;
                    setSaveTitleInput(newTitle);
                    setSaveSlugInput(generateKajianSlug(newTitle));
                  }}
                  placeholder="Contoh: Hukum Meletakkan Batu Kerikil di Atas Makam..."
                  className="w-full px-3 py-2 rounded-xl border border-parchment-300 dark:border-ink-700 bg-parchment-50 dark:bg-ink-950 text-xs text-ink-900 dark:text-parchment-50 focus:outline-none focus:ring-1 focus:ring-turath-emerald font-serif leading-relaxed"
                />
                <p className="text-[10px] text-ink-500 mt-1">
                  Judul ini akan menjadi nama tema di arsip kajian dan riwayat musyawarah.
                </p>
              </div>

              <div>
                <label className="block font-semibold text-ink-800 dark:text-parchment-200 mb-1">
                  Slug / Nama Berkas Markdown
                </label>
                <input
                  type="text"
                  value={saveSlugInput}
                  onChange={(e) => setSaveSlugInput(e.target.value.toLowerCase().replace(/[^\w-]/g, ''))}
                  placeholder="slug-nama-berkas"
                  className="w-full px-3 py-2 rounded-xl border border-parchment-300 dark:border-ink-700 bg-parchment-50 dark:bg-ink-950 text-xs font-mono text-ink-900 dark:text-parchment-50 focus:outline-none focus:ring-1 focus:ring-turath-emerald"
                />
                <div className="mt-1.5 p-2 rounded-lg bg-parchment-100 dark:bg-ink-950 border border-parchment-200 dark:border-ink-800 text-[11px] font-mono text-ink-600 dark:text-parchment-300 truncate">
                  📁 kajian/{new Date().toISOString().split('T')[0]}-{saveSlugInput || 'kajian-bahtsu'}.md
                </div>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 text-[11px] flex items-start gap-2">
                <Check className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-emerald-600" />
                <div>
                  Naskah akan otomatis di-commit dan di-push ke repositori GitHub secara aman pada branch private.
                </div>
              </div>
            </div>

            <div className="px-5 py-3 border-t border-parchment-200 dark:border-ink-800 bg-parchment-50 dark:bg-ink-950 flex items-center justify-end gap-2">
              <button
                onClick={() => setIsSaveModalOpen(false)}
                className="px-3.5 py-1.5 rounded-xl border border-parchment-300 dark:border-ink-700 text-ink-700 dark:text-parchment-300 hover:bg-parchment-200 dark:hover:bg-ink-800 transition-colors text-xs font-medium"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmSave}
                disabled={isSaving || !saveTitleInput.trim()}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-turath-emerald hover:bg-turath-emerald-light text-white text-xs font-semibold shadow-xs disabled:opacity-40 transition-colors"
              >
                <Save className="w-3.5 h-3.5 text-turath-gold" />
                <span>{isSaving ? 'Menyimpan & Push...' : 'Simpan & Push ke GitHub'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
