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
  Trash2
} from 'lucide-react';
import { extractIbaratFromText, formatIbaratForWord } from '../utils/ibaratExtractor';
import { saveKajian } from '../utils/api';

export default function TaswidahDock({
  taswidahContent,
  setTaswidahContent,
  onSaveSuccess,
  arabicFontSize,
  arabicFontFamily,
  matraMode,
  selectedModel,
}) {
  const [activeTab, setActiveTab] = useState('ibarat'); // 'ibarat' | 'naskah'
  const [editorMode, setEditorMode] = useState('preview'); // 'preview' | 'edit'
  const [copiedStatus, setCopiedStatus] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  // Extract ibarat dynamically from current taswidahContent
  const ibaratList = extractIbaratFromText(taswidahContent);

  // Derive title from content
  const titleMatch = taswidahContent.match(/^#\s+(.+)$/m);
  const derivedTitle = titleMatch ? titleMatch[1].trim() : 'Draf Taswidah Bahtsul Masail';

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
    const slug = derivedTitle.toLowerCase().replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-');
    link.href = url;
    link.download = `${now}-${slug || 'taswidah'}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleSaveToRepo = async () => {
    if (!taswidahContent.trim()) return;
    setIsSaving(true);
    setSaveMessage('');

    try {
      const now = new Date().toISOString().split('T')[0];
      const slug = derivedTitle.toLowerCase().replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-');
      const res = await saveKajian({
        title: derivedTitle,
        slug,
        content: taswidahContent,
        model: selectedModel,
        matraMode,
      });

      if (res.ok) {
        setSaveMessage(`Tersimpan: ${res.filename}`);
        if (onSaveSuccess) onSaveSuccess(res.filename);
        setTimeout(() => setSaveMessage(''), 4000);
      } else {
        setSaveMessage(`Gagal: ${res.error}`);
      }
    } catch (err) {
      setSaveMessage(`Error: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const formatTextToHtml = (text) => {
    return text
      .replace(/<u>\*\*【(.*?)】\*\*<\/u>/g, '<u class="mahallus-syahid"><strong>【 $1 】</strong></u>')
      .replace(/【(.*?)】/g, '<span class="mahallus-syahid">【 $1 】</span>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code class="px-1 py-0.5 rounded bg-parchment-200 dark:bg-ink-800 text-xs font-mono">$1</code>');
  };

  return (
    <div className="flex flex-col h-full bg-parchment-100/70 dark:bg-ink-900/60 border-l border-parchment-200 dark:border-ink-800 transition-colors">
      {/* Dock Top Tabs */}
      <div className="px-4 py-3 border-b border-parchment-200 dark:border-ink-800 bg-parchment-50/80 dark:bg-ink-950/80 flex items-center justify-between gap-2">
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
              <div className="p-8 text-center space-y-2 border border-dashed border-parchment-300 dark:border-ink-800 rounded-xl text-ink-500">
                <BookOpen className="w-8 h-8 mx-auto text-ink-400 dark:text-ink-600" />
                <p className="text-xs">Belum ada ibarat yang terdeteksi.</p>
                <p className="text-[11px] text-ink-400">
                  Klik tombol <b>"Ekstrak ke Taswīdah"</b> pada respon obrolan untuk mengalirkan kutipan maraji' ke sini.
                </p>
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
                      className={`p-3 rounded-lg bg-parchment-50 dark:bg-ink-950/80 border border-parchment-200/60 dark:border-ink-800/60 arabic-text ${
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
                    if (line.startsWith('#')) {
                      return <h3 key={idx} className="font-bold text-turath-emerald dark:text-emerald-300 mt-3 mb-1">{line.replace(/^#+\s*/, '')}</h3>;
                    }
                    if (line.startsWith('>')) {
                      return (
                        <blockquote
                          key={idx}
                          className="my-1.5 pl-3 py-1 border-l-2 border-turath-gold bg-parchment-50 dark:bg-ink-950 rounded-r text-xs leading-relaxed"
                          dangerouslySetInnerHTML={{ __html: formatTextToHtml(line.replace(/^>\s*/, '')) }}
                        />
                      );
                    }
                    const arabicCount = (line.match(/[\u0600-\u06FF]/g) || []).length;
                    const isArabic = arabicCount > 15;
                    return (
                      <p
                        key={idx}
                        className={isArabic ? 'arabic-text font-arabic my-1' : 'my-1'}
                        style={isArabic ? { fontSize: `${arabicFontSize}px` } : undefined}
                        dangerouslySetInnerHTML={{ __html: formatTextToHtml(line) }}
                      />
                    );
                  })
                ) : (
                  <p className="text-ink-400 text-xs text-center py-10 font-sans">
                    Draf naskah masih kosong. Gunakan tombol <b>"Ekstrak ke Taswīdah"</b> dari obrolan untuk mulai merumuskan draf kajian.
                  </p>
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

        {/* 1-Click Save to Repository (kajian/) */}
        <button
          onClick={handleSaveToRepo}
          disabled={!taswidahContent || isSaving}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold bg-turath-emerald hover:bg-turath-emerald-light text-parchment-50 disabled:opacity-40 transition-all shadow-sm border border-turath-gold/30"
          title="Simpan langsung ke repositori berkas kajian/ di server"
        >
          <Save className="w-4 h-4 text-turath-gold" />
          <span>{isSaving ? 'Menyimpan ke Repositori...' : 'Simpan ke kajian/ Repositori'}</span>
        </button>
      </div>
    </div>
  );
}
