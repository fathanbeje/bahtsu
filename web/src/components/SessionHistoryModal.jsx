import React, { useState } from 'react';
import { History, Plus, X, Trash2, MessageSquare, Calendar, Check, Search, BookOpen } from 'lucide-react';
import { getAllSessions, deleteSessionById } from '../utils/sessionStorage';

export default function SessionHistoryModal({
  isOpen,
  onClose,
  activeSessionId,
  onSelectSession,
  onNewSession,
}) {
  const [sessions, setSessions] = useState(() => getAllSessions());
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const refreshSessions = () => {
    setSessions(getAllSessions());
  };

  const handleDelete = (e, id) => {
    e.stopPropagation();
    if (window.confirm('Hapus riwayat sesi musyawarah ini?')) {
      deleteSessionById(id);
      refreshSessions();
    }
  };

  const handleSelect = (session) => {
    onSelectSession(session);
    onClose();
  };

  const handleCreate = () => {
    onNewSession();
    onClose();
  };

  const filtered = sessions.filter(s =>
    (s.title || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-ink-950/75 backdrop-blur-xs animate-fade-in font-sans">
      <div className="bg-white dark:bg-ink-900 border-t sm:border border-parchment-200 dark:border-ink-800 rounded-t-3xl sm:rounded-2xl w-full max-w-lg max-h-[88dvh] flex flex-col shadow-manuscript-lg overflow-hidden">
        {/* Sticky Header */}
        <div className="px-5 py-4 border-b border-parchment-200 dark:border-ink-800 bg-parchment-50 dark:bg-ink-950 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-turath-emerald text-turath-gold flex items-center justify-center font-bold shadow-xs">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-ink-900 dark:text-parchment-50">
                Riwayat Sesi Musyawarah
              </h3>
              <p className="text-[11px] text-ink-500 dark:text-ink-400">
                Semua diskusi dan draf otomatis tersimpan aman di peramban
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-ink-400 hover:text-ink-900 dark:hover:text-parchment-100 hover:bg-parchment-200 dark:hover:bg-ink-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Bar: New Session + Search */}
        <div className="p-3 sm:p-4 border-b border-parchment-200 dark:border-ink-800 bg-white dark:bg-ink-900 flex flex-col gap-2.5 flex-shrink-0">
          <button
            onClick={handleCreate}
            className="w-full py-2.5 px-4 rounded-xl bg-turath-emerald hover:bg-turath-emerald-light text-parchment-50 text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-all border border-turath-gold/30"
          >
            <Plus className="w-4 h-4 text-turath-gold" />
            <span>Mulai Telaah Masalah Baru (+ Sesi Baru)</span>
          </button>

          <div className="relative">
            <Search className="w-4 h-4 text-ink-400 absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari judul diskusi sebelumnya..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-parchment-300 dark:border-ink-700 bg-parchment-50 dark:bg-ink-950 text-xs text-ink-900 dark:text-parchment-50 focus:outline-none focus:ring-1 focus:ring-turath-emerald font-sans"
            />
          </div>
        </div>

        {/* Scrollable Session List */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2 overscroll-contain">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-ink-400 text-xs space-y-2">
              <MessageSquare className="w-8 h-8 mx-auto text-ink-300 dark:text-ink-700" />
              <p>Belum ada riwayat sesi yang cocok.</p>
              <p className="text-[11px] text-ink-500">
                Setiap kali Anda bertanya atau merumuskan kajian, riwayat akan otomatis tersimpan di sini.
              </p>
            </div>
          ) : (
            filtered.map((s) => {
              const isActive = s.id === activeSessionId;
              const dateStr = s.updatedAt ? new Date(s.updatedAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '';
              const dateFull = s.updatedAt ? new Date(s.updatedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) : '';

              return (
                <div
                  key={s.id}
                  onClick={() => handleSelect(s)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 group ${
                    isActive
                      ? 'bg-turath-emerald-soft dark:bg-turath-emerald-dark-soft border-turath-emerald dark:border-emerald-500 shadow-xs ring-1 ring-turath-emerald/30'
                      : 'bg-white dark:bg-ink-900 border-parchment-200 dark:border-ink-800 hover:border-turath-emerald/40 hover:bg-parchment-50 dark:hover:bg-ink-850'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="font-serif font-bold text-xs sm:text-sm text-ink-900 dark:text-parchment-100 truncate block">
                        {s.title || 'Telaah Masalah Tanpa Judul'}
                      </span>
                      {isActive && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded font-sans font-bold bg-turath-emerald text-white flex-shrink-0">
                          Aktif
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-ink-500 dark:text-ink-400 font-sans">
                      <span className="px-1.5 py-0.2 rounded bg-parchment-100 dark:bg-ink-800 text-[10px] font-medium uppercase font-mono">
                        {s.matraMode || 'Waqi\'iyyah'}
                      </span>
                      <span>•</span>
                      <span>{s.messages ? s.messages.length : 0} pesan</span>
                      {s.taswidahContent && (
                        <>
                          <span>•</span>
                          <span className="text-turath-emerald dark:text-emerald-400 font-medium">Ada Draf</span>
                        </>
                      )}
                      <span>•</span>
                      <span>{dateFull} {dateStr}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      type="button"
                      onClick={(e) => handleDelete(e, s.id)}
                      className="p-1.5 rounded-lg text-ink-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors opacity-0 group-hover:opacity-100"
                      title="Hapus sesi ini"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    {isActive ? (
                      <div className="w-6 h-6 rounded-full bg-turath-emerald text-white flex items-center justify-center flex-shrink-0">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-full border border-parchment-300 dark:border-ink-700 flex-shrink-0" />
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Sticky Footer */}
        <div className="p-3 sm:p-4 border-t border-parchment-200 dark:border-ink-800 bg-parchment-50 dark:bg-ink-950 flex items-center justify-between text-xs text-ink-500 flex-shrink-0">
          <span className="text-[11px]">
            Total: <b>{sessions.length} Sesi Diskusi</b> Tersimpan
          </span>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg border border-parchment-300 dark:border-ink-700 bg-white dark:bg-ink-800 text-ink-700 dark:text-parchment-200 text-xs font-medium hover:bg-parchment-100"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
