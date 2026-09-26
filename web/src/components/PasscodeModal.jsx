import React, { useState } from 'react';
import { Lock, KeyRound, Loader2, BookOpen, ShieldCheck } from 'lucide-react';
import { login } from '../utils/api';

export default function PasscodeModal({ isOpen, onSuccess }) {
  const [passcode, setPasscode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!passcode.trim() || loading) return;

    setLoading(true);
    setError('');

    try {
      const res = await login(passcode.trim());
      if (res.ok) {
        onSuccess(res.token);
      } else {
        setError(res.error || 'Passcode salah.');
      }
    } catch (err) {
      setError(err.message || 'Gagal memverifikasi passcode.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/85 backdrop-blur-md animate-fade-in font-sans">
      <div className="bg-white dark:bg-ink-900 border border-parchment-200 dark:border-ink-800 rounded-3xl w-full max-w-md p-6 sm:p-8 shadow-manuscript-lg text-center space-y-6">
        {/* Emblem */}
        <div className="w-16 h-16 rounded-2xl bg-turath-emerald text-parchment-50 flex items-center justify-center mx-auto shadow-md border border-turath-gold/40">
          <BookOpen className="w-8 h-8 text-turath-gold" />
        </div>

        {/* Title */}
        <div className="space-y-1.5">
          <h2 className="font-serif font-bold text-2xl text-ink-900 dark:text-parchment-50">
            Bahtsu Klangopan
          </h2>
          <p className="font-arabic text-turath-emerald dark:text-emerald-400 text-sm">
            بَحْثُ كِلَانْغُوفَانْ — مَكْتَبَةُ التَّحْقِيقِ
          </p>
          <p className="text-xs text-ink-500 dark:text-ink-400 max-w-xs mx-auto pt-1 leading-relaxed">
            Masukkan Master Passcode untuk mengakses Studio Bahtsul Masail dan orkestrasi 9Router.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div>
            <label className="block text-xs font-semibold text-ink-700 dark:text-parchment-200 mb-1.5">
              Master Passcode
            </label>
            <div className="relative">
              <input
                type="password"
                autoFocus
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Masukkan passcode akses..."
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-parchment-300 dark:border-ink-700 bg-parchment-50 dark:bg-ink-950 text-sm text-ink-900 dark:text-parchment-50 focus:outline-none focus:ring-2 focus:ring-turath-emerald font-mono"
              />
              <KeyRound className="w-4 h-4 text-ink-400 absolute left-3 top-3.5 pointer-events-none" />
            </div>
            {error && (
              <p className="text-xs text-rose-600 dark:text-rose-400 mt-1.5 font-medium">
                {error}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !passcode.trim()}
            className="w-full py-2.5 rounded-xl bg-turath-emerald hover:bg-turath-emerald-light disabled:opacity-50 text-parchment-50 text-xs font-bold transition-all shadow-md border border-turath-gold/30 flex items-center justify-center gap-1.5"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <ShieldCheck className="w-4 h-4 text-turath-gold" />
                <span>Buka Studio Bahtsu</span>
              </>
            )}
          </button>
        </form>

        <div className="text-[11px] text-ink-400 dark:text-ink-500 border-t border-parchment-200 dark:border-ink-800 pt-3">
          Standar Resmi Munas Alim Ulama & Konbes Nahdlatul Ulama
        </div>
      </div>
    </div>
  );
}
