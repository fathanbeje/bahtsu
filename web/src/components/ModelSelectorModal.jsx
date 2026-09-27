import React, { useState } from 'react';
import { Cpu, X, Check, Search, Sparkles, Zap, Brain, Shield } from 'lucide-react';

export default function ModelSelectorModal({
  isOpen,
  onClose,
  selectedModel,
  onSelectModel,
  availableModels = [],
}) {
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  // Curated list if availableModels is empty or fallback
  const fallbackModels = [
    'ag/gemini-3.8-flash-high',
    'ag/gemini-3.8-flash-medium',
    'ag/gemini-3.8-flash-low',
    'ag/gemini-3.8-flash',
    'ag/gemini-3.7-flash-high',
    'ag/gemini-3.7-flash-medium',
    'ag/gemini-3.6-flash-high',
    'ag/claude-sonnet-4-6',
    'ag/claude-opus-4-6-thinking',
    'ag/gemini-pro-agent',
    'ag/gemini-3-flash-agent',
    'ag/gpt-oss-120b-medium',
  ];

  const modelsToDisplay = availableModels.length > 0 ? availableModels : fallbackModels;

  const filteredModels = modelsToDisplay.filter(m =>
    m.toLowerCase().includes(search.toLowerCase())
  );

  const getModelCategory = (modelName) => {
    const name = modelName.toLowerCase();
    if (name.includes('claude')) return { category: 'Anthropic Claude', icon: Brain, badge: 'High Reasoning', color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/40' };
    if (name.includes('gemini-3.8')) return { category: 'Gemini 3.8 Flagship', icon: Sparkles, badge: 'Generasi Terbaru', color: 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/40' };
    if (name.includes('gemini-3.7') || name.includes('gemini-3.6')) return { category: 'Gemini 3.7 / 3.6', icon: Zap, badge: 'Cepat & Stabil', color: 'text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/40 border-teal-200 dark:border-teal-900/40' };
    if (name.includes('agent')) return { category: 'Agentic Tool-Calling', icon: Cpu, badge: 'Agentic', color: 'text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900/40' };
    return { category: 'Model Tambahan', icon: Cpu, badge: 'General', color: 'text-ink-600 dark:text-ink-400 bg-parchment-100 dark:bg-ink-800 border-parchment-200 dark:border-ink-700' };
  };

  const handleSelect = (model) => {
    onSelectModel(model);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-ink-950/75 backdrop-blur-xs animate-fade-in font-sans">
      <div className="bg-white dark:bg-ink-900 border-t sm:border border-parchment-200 dark:border-ink-800 rounded-t-3xl sm:rounded-2xl w-full max-w-lg max-h-[88dvh] flex flex-col shadow-manuscript-lg overflow-hidden">
        {/* Sticky Header */}
        <div className="px-5 py-4 border-b border-parchment-200 dark:border-ink-800 bg-parchment-50 dark:bg-ink-950 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-turath-emerald text-turath-gold flex items-center justify-center font-bold shadow-xs">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-ink-900 dark:text-parchment-50">
                Pilih Model AI 9Router
              </h3>
              <p className="text-[11px] text-ink-500 dark:text-ink-400">
                Klik model untuk langsung beralih seketika
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

        {/* Search Bar */}
        <div className="p-3 sm:p-4 border-b border-parchment-200 dark:border-ink-800 bg-white dark:bg-ink-900 flex-shrink-0">
          <div className="relative">
            <Search className="w-4 h-4 text-ink-400 absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari model (cth: 3.8, claude, flash)..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-parchment-300 dark:border-ink-700 bg-parchment-50 dark:bg-ink-950 text-xs font-mono text-ink-900 dark:text-parchment-50 focus:outline-none focus:ring-1 focus:ring-turath-emerald"
            />
          </div>
        </div>

        {/* Scrollable Model List */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2 overscroll-contain">
          {filteredModels.length === 0 ? (
            <div className="text-center py-10 text-xs text-ink-400">
              Tidak ada model yang cocok dengan pencarian "{search}".
            </div>
          ) : (
            filteredModels.map((model) => {
              const isSelected = selectedModel === model;
              const meta = getModelCategory(model);
              const Icon = meta.icon;

              return (
                <button
                  key={model}
                  type="button"
                  onClick={() => handleSelect(model)}
                  className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-turath-emerald-soft dark:bg-turath-emerald-dark-soft border-turath-emerald dark:border-emerald-500 shadow-xs ring-1 ring-turath-emerald/30'
                      : 'bg-white dark:bg-ink-900 border-parchment-200 dark:border-ink-800 hover:border-turath-emerald/40 hover:bg-parchment-50 dark:hover:bg-ink-850'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`p-2 rounded-lg border flex-shrink-0 ${meta.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-mono text-xs font-semibold text-ink-900 dark:text-parchment-100 truncate">
                          {model}
                        </span>
                        {isSelected && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded font-sans font-bold bg-turath-emerald text-white">
                            Aktif
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-ink-500 dark:text-ink-400 font-sans mt-0.5">
                        {meta.category} • <span className="opacity-75">{meta.badge}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex-shrink-0">
                    {isSelected ? (
                      <div className="w-6 h-6 rounded-full bg-turath-emerald text-white flex items-center justify-center">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-full border border-parchment-300 dark:border-ink-700" />
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Sticky Footer */}
        <div className="p-3 sm:p-4 border-t border-parchment-200 dark:border-ink-800 bg-parchment-50 dark:bg-ink-950 flex items-center justify-between text-xs text-ink-500 flex-shrink-0">
          <span className="text-[11px]">
            Total: <b>{modelsToDisplay.length} Model</b> terhubung di 9Router
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
