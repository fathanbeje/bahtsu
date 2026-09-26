import React, { useState } from 'react';
import { Settings, X, Cpu, Thermometer, Shield, Check, RefreshCw } from 'lucide-react';

export default function SettingsModal({
  isOpen,
  onClose,
  selectedModel,
  setSelectedModel,
  temperature,
  setTemperature,
  routerStatus,
  onRefreshStatus,
}) {
  const [tempModel, setTempModel] = useState(selectedModel);
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const popularModels = [
    'gemini-2.5-pro',
    'claude-3-7-sonnet',
    'gemini-2.5-flash',
    'gpt-4o',
    'claude-3-5-sonnet',
    'gemini-2.0-flash',
  ];

  const handleSave = () => {
    setSelectedModel(tempModel);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/70 backdrop-blur-xs animate-fade-in font-sans">
      <div className="bg-white dark:bg-ink-900 border border-parchment-200 dark:border-ink-800 rounded-2xl w-full max-w-md p-5 sm:p-6 shadow-manuscript-lg space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-parchment-200 dark:border-ink-800">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-turath-emerald/10 dark:bg-turath-emerald/20 text-turath-emerald dark:text-emerald-400">
              <Settings className="w-4 h-4" />
            </div>
            <h3 className="font-serif font-bold text-base text-ink-900 dark:text-parchment-50">
              Pengaturan Sistem & Model AI
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-ink-400 hover:text-ink-900 dark:hover:text-parchment-100 hover:bg-parchment-200 dark:hover:bg-ink-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 9Router Status Indicator */}
        <div className="p-3 rounded-xl bg-parchment-50 dark:bg-ink-950 border border-parchment-200 dark:border-ink-800 space-y-1.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-ink-700 dark:text-parchment-200 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-turath-emerald" />
              <span>Status Koneksi 9Router</span>
            </span>
            <button
              onClick={onRefreshStatus}
              className="p-1 rounded text-ink-400 hover:text-ink-700 dark:hover:text-ink-200"
              title="Cek ulang koneksi"
            >
              <RefreshCw className="w-3 h-3" />
            </button>
          </div>
          <p className="text-[11px] text-ink-500 font-mono truncate">
            Gateway: {routerStatus?.routerUrl || 'http://127.0.0.1:20128/v1'}
          </p>
          <div className="flex items-center gap-1.5 text-[11px] font-medium pt-1">
            {routerStatus?.routerConnected ? (
              <span className="text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Terhubung ke 9Router
              </span>
            ) : (
              <span className="text-amber-700 dark:text-amber-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                Belum terhubung ke 9Router lokal/VPS
              </span>
            )}
          </div>
        </div>

        {/* AI Model Selection */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-ink-800 dark:text-parchment-200">
            Model AI Aktif
          </label>
          <input
            type="text"
            value={tempModel}
            onChange={(e) => setTempModel(e.target.value)}
            placeholder="cth: gemini-2.5-pro, claude-3-7-sonnet"
            className="w-full px-3 py-2 rounded-xl border border-parchment-300 dark:border-ink-700 bg-white dark:bg-ink-950 text-xs font-mono text-ink-900 dark:text-parchment-50 focus:outline-none focus:ring-1 focus:ring-turath-emerald"
          />

          {/* Quick Model Badges */}
          <div className="flex flex-wrap gap-1 pt-1">
            {(routerStatus?.availableModels?.length > 0 ? routerStatus.availableModels : popularModels).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setTempModel(m)}
                className={`px-2 py-0.5 rounded text-[10px] font-mono border transition-all ${
                  tempModel === m
                    ? 'bg-turath-emerald text-white border-turath-emerald'
                    : 'bg-parchment-100 dark:bg-ink-800 border-parchment-200 dark:border-ink-700 text-ink-600 dark:text-ink-400 hover:border-turath-emerald/40'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* Temperature Setting */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-ink-800 dark:text-parchment-200 flex items-center gap-1">
              <Thermometer className="w-3.5 h-3.5 text-turath-gold" />
              <span>Suhu Presisi (Temperature)</span>
            </span>
            <span className="font-mono text-ink-500 font-semibold">{temperature}</span>
          </div>
          <input
            type="range"
            min="0.0"
            max="1.0"
            step="0.05"
            value={temperature}
            onChange={(e) => setTemperature(parseFloat(e.target.value))}
            className="w-full accent-turath-emerald cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-ink-400 font-sans">
            <span>0.0 (Sangat Ketat & Tekstual)</span>
            <span>0.3 (Optimal Bahtsu)</span>
            <span>1.0 (Kreatif / Bebas)</span>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-parchment-200 dark:border-ink-800">
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg border border-parchment-200 dark:border-ink-700 text-ink-600 dark:text-ink-400 text-xs font-medium hover:bg-parchment-100 dark:hover:bg-ink-800"
          >
            Batal
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-1.5 rounded-lg bg-turath-emerald hover:bg-turath-emerald-light text-white text-xs font-semibold flex items-center gap-1 shadow-sm"
          >
            {saved ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-300" />
                <span>Tersimpan</span>
              </>
            ) : (
              <span>Simpan Perubahan</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
