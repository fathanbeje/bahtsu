import React, { useState, useEffect } from 'react';
import { FolderArchive, X, FileText, ArrowRight, Loader2, Calendar, HardDrive, RefreshCw } from 'lucide-react';
import { getKajianList, getKajianContent } from '../utils/api';

export default function KajianArchiveModal({ isOpen, onClose, onLoadToTaswidah }) {
  const [kajianList, setKajianList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileContent, setFileContent] = useState('');
  const [loadingContent, setLoadingContent] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchList();
    }
  }, [isOpen]);

  const fetchList = async () => {
    setLoading(true);
    try {
      const res = await getKajianList();
      if (res.ok) {
        setKajianList(res.files || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectFile = async (filename) => {
    setSelectedFile(filename);
    setLoadingContent(true);
    try {
      const res = await getKajianContent(filename);
      if (res.ok) {
        setFileContent(res.content || '');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingContent(false);
    }
  };

  if (!isOpen) return null;

  const filtered = kajianList.filter(k => 
    k.title.toLowerCase().includes(search.toLowerCase()) ||
    k.filename.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-ink-950/70 backdrop-blur-xs animate-fade-in font-sans">
      <div className="bg-white dark:bg-ink-900 border border-parchment-200 dark:border-ink-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-manuscript-lg overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-parchment-200 dark:border-ink-800 bg-parchment-50 dark:bg-ink-950 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-turath-emerald text-parchment-50 flex items-center justify-center font-bold">
              <FolderArchive className="w-4 h-4 text-turath-gold" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-ink-900 dark:text-parchment-50">
                Arsip Repositori Bahan Kajian (kajian/)
              </h3>
              <p className="text-[11px] text-ink-500 dark:text-ink-400">
                Dokumen draf taswidah dan telaah Bahtsul Masail yang tersimpan
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchList}
              className="p-1.5 rounded-lg text-ink-400 hover:text-ink-900 dark:hover:text-parchment-100 hover:bg-parchment-200 dark:hover:bg-ink-800 transition-colors"
              title="Perbarui daftar"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-ink-400 hover:text-ink-900 dark:hover:text-parchment-100 hover:bg-parchment-200 dark:hover:bg-ink-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body: Split view */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-parchment-200 dark:divide-ink-800">
          {/* File List Column */}
          <div className="flex flex-col h-full overflow-hidden p-4 space-y-3">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari judul kajian atau tanggal..."
              className="w-full px-3 py-2 rounded-xl border border-parchment-300 dark:border-ink-700 bg-parchment-50 dark:bg-ink-950 text-xs text-ink-900 dark:text-parchment-50 focus:outline-none focus:ring-1 focus:ring-turath-emerald"
            />

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {loading ? (
                <div className="py-12 text-center text-ink-500 text-xs">
                  <Loader2 className="w-5 h-5 animate-spin mx-auto mb-1 text-turath-emerald" />
                  <span>Memuat arsip...</span>
                </div>
              ) : filtered.length === 0 ? (
                <p className="text-center py-10 text-xs text-ink-400">
                  Tidak ada berkas kajian yang cocok.
                </p>
              ) : (
                filtered.map(k => (
                  <button
                    key={k.filename}
                    onClick={() => handleSelectFile(k.filename)}
                    className={`w-full text-left p-3 rounded-xl border transition-all text-xs flex flex-col gap-1 ${
                      selectedFile === k.filename
                        ? 'bg-turath-emerald-soft dark:bg-turath-emerald-dark-soft border-turath-emerald dark:border-emerald-600 shadow-xs'
                        : 'bg-white dark:bg-ink-900 border-parchment-200 dark:border-ink-800 hover:border-parchment-300 dark:hover:border-ink-700'
                    }`}
                  >
                    <div className="font-semibold text-ink-900 dark:text-parchment-100 line-clamp-1 font-serif text-[13px]">
                      {k.title}
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-ink-500 dark:text-ink-400">
                      <span className="flex items-center gap-0.5">
                        <Calendar className="w-3 h-3" />
                        <span>{k.filename.substring(0, 10)}</span>
                      </span>
                      <span>•</span>
                      <span className="font-mono text-ink-400">{(k.size / 1024).toFixed(1)} KB</span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Preview & Load Column */}
          <div className="flex flex-col h-full overflow-hidden p-4 space-y-3 bg-parchment-50/50 dark:bg-ink-950/50">
            {selectedFile ? (
              <>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] text-ink-500 truncate max-w-[200px]">
                    {selectedFile}
                  </span>
                  <button
                    onClick={() => {
                      onLoadToTaswidah(fileContent);
                      onClose();
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-turath-emerald hover:bg-turath-emerald-light text-white text-xs font-semibold shadow-xs transition-colors"
                  >
                    <span>Buka di Dock</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-3.5 rounded-xl bg-white dark:bg-ink-900 border border-parchment-200 dark:border-ink-800 font-mono text-[11px] leading-relaxed text-ink-800 dark:text-parchment-200 whitespace-pre-wrap">
                  {loadingContent ? (
                    <div className="py-12 text-center text-ink-400">
                      <Loader2 className="w-5 h-5 animate-spin mx-auto mb-1 text-turath-emerald" />
                      <span>Membaca naskah kajian...</span>
                    </div>
                  ) : (
                    fileContent
                  )}
                </div>
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-ink-400 space-y-2">
                <FileText className="w-8 h-8 text-ink-300 dark:text-ink-700" />
                <p className="text-xs">Pilih salah satu berkas di sebelah kiri untuk melihat isi atau memuatnya ke Dock.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
