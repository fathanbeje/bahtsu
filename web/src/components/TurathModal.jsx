import React, { useState } from 'react';
import { Search, X, BookOpen, ExternalLink, Copy, Check, Send, Loader2 } from 'lucide-react';
import { searchTurath } from '../utils/api';

export default function TurathModal({ isOpen, onClose, onInsertToChat }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('16'); // Default 16: Fiqh Syafi'i
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [totalMatches, setTotalMatches] = useState(0);
  const [copiedId, setCopiedId] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  if (!isOpen) return null;

  const categories = [
    { id: '', label: 'Semua Kategori' },
    { id: '16', label: "Fiqh Syafi'i (16)" },
    { id: '14', label: 'Fiqh Hanafi (14)' },
    { id: '15', label: 'Fiqh Maliki (15)' },
    { id: '17', label: 'Fiqh Hanbali (17)' },
    { id: '18', label: 'Muqaranah 4 Madzhab (18)' },
  ];

  const handleSearch = async (e) => {
    e?.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setHasSearched(true);
    try {
      const res = await searchTurath(query.trim(), category || null, 8);
      if (res.ok) {
        setResults(res.results || []);
        setTotalMatches(res.total || 0);
      } else {
        setResults([]);
        setTotalMatches(0);
      }
    } catch (err) {
      console.error(err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (id, text, book, vol, page) => {
    const formatted = `> **${book}** (Jilid ${vol}, Hlm. ${page})\n> \n> ${text}`;
    navigator.clipboard.writeText(formatted);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSendToChat = (text, book, vol, page) => {
    const quote = `Telaah ibarat dari **${book}** (Jilid ${vol}, Hlm. ${page}):\n\n"${text}"\n\nBagaimana korelasi wajhul istidlal ibarat di atas dengan konteks permasalahan ini?`;
    onInsertToChat(quote);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-ink-950/70 backdrop-blur-xs animate-fade-in font-sans">
      <div className="bg-white dark:bg-ink-900 border border-parchment-200 dark:border-ink-800 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-manuscript-lg overflow-hidden">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-parchment-200 dark:border-ink-800 bg-parchment-50 dark:bg-ink-950 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-turath-emerald text-turath-gold flex items-center justify-center font-bold">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-ink-900 dark:text-parchment-50">
                Pencarian Kitab Turath.io API v3
              </h3>
              <p className="text-[11px] text-ink-500 dark:text-ink-400">
                Pencarian matan, syarah, dan hawasyi klasik secara 100% online
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-ink-400 hover:text-ink-900 dark:hover:text-parchment-100 hover:bg-parchment-200 dark:hover:bg-ink-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar & Category Filter */}
        <div className="p-4 border-b border-parchment-200 dark:border-ink-800 bg-parchment-50/50 dark:bg-ink-950/50 space-y-3">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Masukkan kata kunci Arab (cth: فدية الصلاة, تكبيرة الإحرام, الاستصناع)..."
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-parchment-300 dark:border-ink-700 bg-white dark:bg-ink-900 text-sm text-ink-900 dark:text-parchment-50 placeholder-ink-400 focus:outline-none focus:ring-1 focus:ring-turath-emerald font-arabic text-right dir-rtl"
                dir="rtl"
              />
              <Search className="w-4 h-4 text-ink-400 absolute left-3 top-3 pointer-events-none" />
            </div>
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="px-4 py-2 rounded-xl bg-turath-emerald hover:bg-turath-emerald-light disabled:opacity-50 text-parchment-50 text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4 text-turath-gold" />}
              <span>Cari Kitab</span>
            </button>
          </form>

          {/* Category Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-[11px] pb-1 no-scrollbar">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={`px-2.5 py-1 rounded-lg border transition-all whitespace-nowrap ${
                  category === cat.id
                    ? 'bg-turath-emerald text-white border-turath-emerald font-medium shadow-xs'
                    : 'bg-white dark:bg-ink-900 border-parchment-200 dark:border-ink-800 text-ink-600 dark:text-ink-400 hover:border-turath-emerald/40'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <div className="py-16 text-center space-y-2 text-ink-500">
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-turath-emerald" />
              <p className="text-xs">Menghubungi Turath.io API...</p>
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-3">
              <div className="text-[11px] text-ink-500 font-medium px-1">
                Ditemukan {totalMatches} kecocokan di Turath.io
              </div>
              {results.map((item, idx) => (
                <div
                  key={item.id || idx}
                  className="p-4 rounded-xl border border-parchment-200 dark:border-ink-800 bg-white dark:bg-ink-900/90 shadow-sm space-y-2.5 hover:border-turath-emerald/50 transition-all"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-serif font-bold text-sm text-turath-emerald dark:text-emerald-300">
                        {item.bookName}
                      </h4>
                      <p className="text-[11px] text-ink-500 dark:text-ink-400 mt-0.5">
                        Karya: <span className="font-medium text-ink-700 dark:text-ink-300">{item.authorName}</span> • Jilid {item.volume}, Hlm. {item.page}
                      </p>
                    </div>

                    <a
                      href={item.turathUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg border border-parchment-200 dark:border-ink-800 hover:bg-parchment-100 dark:hover:bg-ink-800 text-ink-400 hover:text-turath-emerald transition-colors"
                      title="Buka langsung di Turath.io"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  {/* Matan / Text snippet */}
                  <div className="p-3 rounded-lg bg-parchment-50 dark:bg-ink-950/70 border border-parchment-200/50 dark:border-ink-800/50 text-right arabic-text font-arabic text-sm text-ink-900 dark:text-parchment-100 leading-relaxed">
                    {item.snippet}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      onClick={() => handleCopy(item.id, item.snippet, item.bookName, item.volume, item.page)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs border border-parchment-200 dark:border-ink-800 text-ink-600 dark:text-ink-300 hover:bg-parchment-100 dark:hover:bg-ink-800 transition-colors"
                    >
                      {copiedId === item.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span className="text-emerald-600">Tersalin</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Salin Ibarat</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => handleSendToChat(item.snippet, item.bookName, item.volume, item.page)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs bg-turath-emerald text-white hover:bg-turath-emerald-light transition-colors"
                    >
                      <Send className="w-3 h-3" />
                      <span>Kirim ke Diskusi</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : hasSearched ? (
            <div className="py-16 text-center space-y-1 text-ink-500">
              <p className="text-sm">Tidak ditemukan hasil untuk "{query}".</p>
              <p className="text-xs text-ink-400">Coba ganti kata kunci Arab tanpa harakat atau ubah kategori madzhab.</p>
            </div>
          ) : (
            <div className="py-16 text-center space-y-2 text-ink-400">
              <Search className="w-8 h-8 mx-auto text-ink-300 dark:text-ink-700" />
              <p className="text-xs">Ketik kata kunci Arab di atas untuk mencari dalil & kutipan kitab kuning.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
