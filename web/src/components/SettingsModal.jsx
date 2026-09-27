import React, { useState } from 'react';
import { Settings, X, Cpu, Thermometer, Shield, Check, RefreshCw, ChevronRight } from 'lucide-react';

export default function SettingsModal({
  isOpen,
  onClose,
  selectedModel,
  onOpenModelSelector,
  temperature,
  setTemperature,
  routerStatus,
  onRefreshStatus,
}) {
  const [tempTemperature, setTempTemperature] = useState(temperature);
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    setTemperature(tempTemperature);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-ink-950/75 backdrop-blur-xs animate-fade-in font-sans">
      <div className="bg-white dark:bg-ink-900 border-t sm:border border-parchment-200 dark:border-ink-800 rounded-t-3xl sm:rounded-2xl w-full max-w-md max-h-[88dvh] flex flex-col shadow-manuscript-lg overflow-hidden">
        {/* Sticky Header */}
        <div className="px-5 py-4 border-b border-parchment-200 dark:border-ink-800 bg-parchment-50 dark:bg-ink-950 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-turath-emerald/10 dark:bg-turath-emerald/20 text-turath-emerald dark:text-emerald-400">
              <Settings className="w-4 h-4" />
            </div>
            <h3 className="font-serif font-bold text-base text-ink-900 dark:text-parchment-50">
              Pengaturan Bahtsu Klangopan
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-ink-400 hover:text-ink-900 dark:hover:text-parchment-100 hover:bg-parchment-200 dark:hover:bg-ink-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 overscroll-contain">
          {/* 9Router Status Indicator */}
          <div className="p-3.5 rounded-xl bg-parchment-50 dark:bg-ink-950 border border-parchment-200 dark:border-ink-800 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-ink-800 dark:text-parchment-200 flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-turath-emerald" />
                <span>Koneksi 9Router Gateway</span>
              </span>
              <button
                onClick={onRefreshStatus}
                className="p-1 rounded text-ink-400 hover:text-ink-700 dark:hover:text-ink-200"
                title="Cek ulang koneksi"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex items-center gap-1.5 font-medium">
              {routerStatus?.routerConnected ? (
                <span className="text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Terhubung Aktif (Local VPS)</span>
                </span>
              ) : (
                <span className="text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span>Menunggu respons 9Router...</span>
                </span>
              )}
            </div>
            <p className="text-[10px] text-ink-400 font-mono truncate">
              {routerStatus?.routerUrl || 'http://127.0.0.1:20128/v1'}
            </p>
          </div>

          {/* Active Model Card with direct switch button */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-ink-800 dark:text-parchment-200">
              Model AI Aktif
            </label>
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenModelSelector();
              }}
              className="w-full p-3.5 rounded-xl border border-turath-emerald/40 bg-turath-emerald-soft/50 dark:bg-turath-emerald-dark-soft/40 hover:border-turath-emerald flex items-center justify-between transition-all text-left group"
            >
              <div className="min-w-0">
                <div className="text-[10px] uppercase font-bold tracking-wider text-turath-emerald dark:text-emerald-400 mb-0.5">
                  Model Yang Digunakan Saat Ini
                </div>
                <div className="font-mono text-xs font-bold text-ink-900 dark:text-parchment-100 truncate">
                  {selectedModel}
                </div>
              </div>
              <div className="flex items-center gap-1 text-xs text-turath-emerald font-semibold flex-shrink-0 group-hover:translate-x-0.5 transition-transform">
                <span>Ganti</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </button>
            <p className="text-[11px] text-ink-400">
              Tersedia {routerStatus?.availableModels?.length || 20} model di 9Router (Gemini 3.8, Claude Sonnet 4.6, Opus, dll.)
            </p>
          </div>

          {/* Temperature Setting */}
          <div className="space-y-2 p-3.5 rounded-xl border border-parchment-200 dark:border-ink-800 bg-white dark:bg-ink-950">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-ink-800 dark:text-parchment-200 flex items-center gap-1.5">
                <Thermometer className="w-3.5 h-3.5 text-turath-gold" />
                <span>Suhu Presisi (Temperature)</span>
              </span>
              <span className="font-mono text-ink-700 dark:text-parchment-100 font-bold px-2 py-0.5 rounded bg-parchment-100 dark:bg-ink-800">
                {tempTemperature}
              </span>
            </div>
            <input
              type="range"
              min="0.0"
              max="1.0"
              step="0.05"
              value={tempTemperature}
              onChange={(e) => setTempTemperature(parseFloat(e.target.value))}
              className="w-full accent-turath-emerald cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-ink-400 font-sans">
              <span>0.0 (Ketetapan Tekstual)</span>
              <span className="font-medium text-turath-emerald">0.3 (Optimal Bahtsu)</span>
              <span>1.0 (Kreatif)</span>
            </div>
          </div>

          {/* App Version Info */}
          <div className="p-3 rounded-xl bg-parchment-100/60 dark:bg-ink-800/40 border border-parchment-200 dark:border-ink-800 flex items-center justify-between text-[11px] text-ink-600 dark:text-ink-300">
            <span className="font-serif font-bold text-ink-800 dark:text-parchment-100">Bahtsu Klangopan</span>
            <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-md bg-turath-emerald/10 text-turath-emerald dark:bg-emerald-950/60 dark:text-emerald-400 border border-turath-emerald/20 tracking-wider">
              v2.5.7 · Otentik Turats
            </span>
          </div>
        </div>

        {/* Sticky Footer */}
        <div className="p-3 sm:p-4 border-t border-parchment-200 dark:border-ink-800 bg-parchment-50 dark:bg-ink-950 flex items-center justify-end gap-2 flex-shrink-0">
          <button
            onClick={onClose}
            className="px-3.5 py-2 rounded-xl border border-parchment-200 dark:border-ink-700 text-ink-600 dark:text-ink-400 text-xs font-medium hover:bg-parchment-100 dark:hover:bg-ink-800 transition-colors"
          >
            Batal
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-xl bg-turath-emerald hover:bg-turath-emerald-light text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
          >
            {saved ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-300" />
                <span>Tersimpan</span>
              </>
            ) : (
              <span>Simpan Pengaturan</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
