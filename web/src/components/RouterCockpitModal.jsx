import React, { useState, useEffect } from 'react';
import { 
  Cpu, 
  Activity, 
  ShieldCheck, 
  RefreshCw, 
  X, 
  ExternalLink, 
  Zap, 
  Server, 
  Users, 
  BarChart3, 
  CheckCircle2, 
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  Database,
  Lock,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { getRouterOverview, toggleRouterAccount, pingRouterModel } from '../utils/api';

export default function RouterCockpitModal({
  isOpen,
  onClose,
  selectedModel,
  onSelectModel,
}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'accounts' | 'models' | 'console'
  const [togglingId, setTogglingId] = useState(null);
  const [pingResults, setPingResults] = useState({});
  const [pingingModel, setPingingModel] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');

  const loadData = async () => {
    setLoading(true);
    setStatusMessage('');
    try {
      const res = await getRouterOverview();
      if (res.ok) {
        setData(res);
      } else {
        setStatusMessage(`Gagal memuat status: ${res.error}`);
      }
    } catch (err) {
      setStatusMessage(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleToggleAccount = async (account) => {
    const nextState = account.isActive === 1 ? 0 : 1;
    setTogglingId(account.id);
    try {
      const res = await toggleRouterAccount(account.id, nextState);
      if (res.ok) {
        setData(prev => {
          if (!prev) return prev;
          const nextAccounts = prev.accounts.map(a => 
            a.id === account.id ? { ...a, isActive: nextState } : a
          );
          return { ...prev, accounts: nextAccounts };
        });
        setStatusMessage(res.message);
        setTimeout(() => setStatusMessage(''), 3000);
      } else {
        setStatusMessage(`Gagal: ${res.error}`);
      }
    } catch (err) {
      setStatusMessage(`Error: ${err.message}`);
    } finally {
      setTogglingId(null);
    }
  };

  const handlePingModel = async (modelName) => {
    setPingingModel(modelName);
    try {
      const res = await pingRouterModel(modelName);
      setPingResults(prev => ({
        ...prev,
        [modelName]: res.ok 
          ? { status: 'ok', latency: res.latency } 
          : { status: 'error', error: res.error, latency: res.latency }
      }));
    } catch (err) {
      setPingResults(prev => ({
        ...prev,
        [modelName]: { status: 'error', error: err.message, latency: 0 }
      }));
    } finally {
      setPingingModel(null);
    }
  };

  // Helper formatting numbers
  const formatTokens = (num = 0) => {
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(2)}M`;
    if (num >= 1_000) return `${(num / 1_000).toFixed(1)}k`;
    return num.toLocaleString('id-ID');
  };

  const usage = data?.usageToday || {};
  const accounts = data?.accounts || [];
  const models = data?.availableModels || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-ink-950/80 backdrop-blur-xs animate-fade-in font-sans">
      <div className="bg-white dark:bg-ink-900 border border-parchment-200 dark:border-ink-800 rounded-3xl w-full max-w-4xl max-h-[92dvh] flex flex-col shadow-manuscript-lg overflow-hidden text-ink-900 dark:text-parchment-50">
        
        {/* Cockpit Top Header */}
        <div className="px-5 py-4 border-b border-parchment-200 dark:border-ink-800 bg-parchment-50 dark:bg-ink-950 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-turath-emerald text-parchment-50 flex items-center justify-center shadow-sm border border-turath-gold/30">
              <Cpu className="w-5 h-5 text-turath-gold" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif font-bold text-base sm:text-lg text-ink-900 dark:text-parchment-50">
                  9Router AI Gateway Cockpit
                </h3>
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>{data?.routerConnected ? 'ONLINE' : 'CONNECTING'}</span>
                  {data?.latencyMs > 0 && <span>• {data.latencyMs}ms</span>}
                </span>
              </div>
              <p className="text-xs text-ink-500 dark:text-ink-400">
                Pusat Kendali Beban Akun, Kuota Token, dan Latensi Model AI
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={loadData}
              disabled={loading}
              className="p-2 rounded-xl border border-parchment-200 dark:border-ink-800 hover:bg-parchment-200 dark:hover:bg-ink-800 text-ink-600 dark:text-parchment-200 transition-colors"
              title="Segarkan Data 9Router"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-turath-emerald' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-ink-400 hover:text-ink-900 dark:hover:text-parchment-100 hover:bg-parchment-200 dark:hover:bg-ink-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-5 border-b border-parchment-200 dark:border-ink-800 bg-white dark:bg-ink-900 flex items-center gap-1 overflow-x-auto">
          {[
            { id: 'overview', label: 'Ringkasan & Kuota', icon: BarChart3 },
            { id: 'accounts', label: `Node Akun (${accounts.length})`, icon: Users },
            { id: 'models', label: `Daftar Model (${models.length})`, icon: Cpu },
            { id: 'console', label: 'Konsol Web 9Router', icon: Server },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-3 px-3.5 border-b-2 text-xs font-semibold transition-all whitespace-nowrap ${
                  isActive
                    ? 'border-turath-emerald text-turath-emerald dark:text-emerald-300 font-bold'
                    : 'border-transparent text-ink-500 dark:text-ink-400 hover:text-ink-800 dark:hover:text-parchment-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Status Toast Banner if any */}
        {statusMessage && (
          <div className="px-5 py-2 bg-emerald-50 dark:bg-emerald-950/80 border-b border-emerald-200 dark:border-emerald-800 text-xs font-medium text-emerald-800 dark:text-emerald-300 text-center animate-fade-in">
            {statusMessage}
          </div>
        )}

        {/* Cockpit Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* TAB 1: OVERVIEW & QUOTA */}
          {activeTab === 'overview' && (
            <div className="space-y-5">
              {/* 4 Metric KPI Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 rounded-2xl bg-parchment-50 dark:bg-ink-950 border border-parchment-200 dark:border-ink-800 shadow-2xs space-y-1">
                  <div className="text-[11px] font-semibold text-ink-500 dark:text-ink-400 uppercase tracking-wider">
                    Permintaan Hari Ini
                  </div>
                  <div className="text-2xl font-serif font-bold text-ink-900 dark:text-parchment-50">
                    {usage.requests || 0}
                  </div>
                  <div className="text-[10px] text-ink-400 flex items-center gap-1">
                    <Activity className="w-3 h-3 text-emerald-600" />
                    <span>Lalu lintas musyawarah</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-parchment-50 dark:bg-ink-950 border border-parchment-200 dark:border-ink-800 shadow-2xs space-y-1">
                  <div className="text-[11px] font-semibold text-ink-500 dark:text-ink-400 uppercase tracking-wider">
                    Total Token Diproses
                  </div>
                  <div className="text-2xl font-serif font-bold text-turath-emerald dark:text-emerald-300">
                    {formatTokens((usage.promptTokens || 0) + (usage.completionTokens || 0))}
                  </div>
                  <div className="text-[10px] text-ink-400 font-mono">
                    P: {formatTokens(usage.promptTokens)} • C: {formatTokens(usage.completionTokens)}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-parchment-50 dark:bg-ink-950 border border-parchment-200 dark:border-ink-800 shadow-2xs space-y-1">
                  <div className="text-[11px] font-semibold text-ink-500 dark:text-ink-400 uppercase tracking-wider">
                    Token Cached (Hemat)
                  </div>
                  <div className="text-2xl font-serif font-bold text-turath-gold">
                    {formatTokens(usage.cachedTokens || 0)}
                  </div>
                  <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                    Efisiensi konteks kitab
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-parchment-50 dark:bg-ink-950 border border-parchment-200 dark:border-ink-800 shadow-2xs space-y-1">
                  <div className="text-[11px] font-semibold text-ink-500 dark:text-ink-400 uppercase tracking-wider">
                    Estimasi Biaya Hari Ini
                  </div>
                  <div className="text-2xl font-serif font-bold text-ink-900 dark:text-parchment-50">
                    ${(usage.cost || 0).toFixed(4)}
                  </div>
                  <div className="text-[10px] text-ink-400">
                    Mata uang USD
                  </div>
                </div>
              </div>

              {/* Usage Breakdown By Model */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-ink-900 border border-parchment-200 dark:border-ink-800 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-serif font-bold text-sm sm:text-base text-ink-900 dark:text-parchment-100 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-turath-emerald" />
                    <span>Distribusi Penggunaan per Model AI</span>
                  </h4>
                  <span className="text-xs text-ink-400">Hari ini</span>
                </div>

                {usage.byModel && Object.keys(usage.byModel).length > 0 ? (
                  <div className="divide-y divide-parchment-200 dark:divide-ink-800 text-xs">
                    {Object.entries(usage.byModel).map(([key, item]) => {
                      const modelClean = (item.rawModel || key).replace(/\|.*/, '');
                      return (
                        <div key={key} className="py-2.5 flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <span className="font-mono font-bold text-ink-900 dark:text-parchment-100 block truncate">
                              {modelClean}
                            </span>
                            <span className="text-[11px] text-ink-400">
                              {item.requests} permintaan • {formatTokens(item.promptTokens)} in • {formatTokens(item.completionTokens)} out
                            </span>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <div className="font-mono font-semibold text-ink-800 dark:text-parchment-200">
                              ${(item.cost || 0).toFixed(4)}
                            </div>
                            <div className="text-[10px] text-turath-gold">
                              Cached: {formatTokens(item.cachedTokens)}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-ink-400 py-4 text-center">
                    Belum ada riwayat permintaan hari ini. Data akan otomatis terakumulasi saat Anda mengajukan pertanyaan di studio.
                  </p>
                )}
              </div>

              {/* Technical Gateway Info Card */}
              <div className="p-4 rounded-2xl bg-parchment-100/70 dark:bg-ink-950/70 border border-parchment-200 dark:border-ink-800 space-y-2 text-xs">
                <div className="font-semibold text-ink-800 dark:text-parchment-200">
                  Parameter Infrastruktur 9Router
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-ink-600 dark:text-ink-400 font-mono text-[11px]">
                  <div>Upstream Gateway: <b className="text-ink-900 dark:text-parchment-100">{data?.routerUrl}</b></div>
                  <div>API Key: <b className="text-ink-900 dark:text-parchment-100">{data?.masterKeyMasked}</b></div>
                  <div>Database: <b className="text-ink-900 dark:text-parchment-100">{data?.hasDbAccess ? 'SQLite Terkoneksi' : 'Fallback Mode'}</b></div>
                  <div>Model Aktif: <b className="text-turath-emerald dark:text-emerald-400">{selectedModel}</b></div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PROVIDER ACCOUNTS */}
          {activeTab === 'accounts' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-turath-emerald-soft/60 dark:bg-turath-emerald-dark-soft/50 border border-turath-emerald/20 text-xs text-ink-700 dark:text-parchment-200 leading-relaxed">
                <p>
                  <b>Rotasi Multi-Akun Antigravity:</b> 9Router menghubungkan 4 akun Google Antigravity sekaligus untuk membagi beban kueri (*load-balancing*) dan mencegah batas limit per jam (*rate limit 429*). Anda dapat menonaktifkan sementara akun tertentu bila diinginkan.
                </p>
              </div>

              <div className="space-y-2.5">
                {accounts.map((acc) => {
                  const isEnabled = acc.isActive === 1;
                  const isToggling = togglingId === acc.id;

                  return (
                    <div
                      key={acc.id}
                      className="p-4 rounded-2xl border transition-all bg-white dark:bg-ink-900 border-parchment-200 dark:border-ink-800 hover:border-turath-emerald/40 flex items-center justify-between gap-4"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono font-bold text-xs sm:text-sm text-ink-900 dark:text-parchment-100 truncate">
                            {acc.name || acc.id}
                          </span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                            isEnabled
                              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                              : 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300'
                          }`}>
                            {isEnabled ? 'Aktif' : 'Non-Aktif'}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-ink-500 dark:text-ink-400 font-mono">
                          <span>{acc.email}</span>
                          <span>•</span>
                          <span>Prioritas: {acc.priority || 1}</span>
                          <span>•</span>
                          <span className="capitalize">{acc.authType || 'oauth'}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          type="button"
                          disabled={isToggling}
                          onClick={() => handleToggleAccount(acc)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                            isEnabled
                              ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300'
                              : 'bg-parchment-100 dark:bg-ink-800 border-parchment-300 dark:border-ink-700 text-ink-600 dark:text-ink-300 hover:bg-emerald-50 hover:text-emerald-700'
                          }`}
                        >
                          {isEnabled ? (
                            <>
                              <ToggleRight className="w-4 h-4 text-emerald-600" />
                              <span>Aktif</span>
                            </>
                          ) : (
                            <>
                              <ToggleLeft className="w-4 h-4 text-ink-400" />
                              <span>Mati</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: MODELS & LATENCY SPEEDTEST */}
          {activeTab === 'models' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs text-ink-500 dark:text-ink-400">
                  Uji latensi respon (*round-trip ping*) langsung ke gateway 9Router untuk memastikan model siap merespon cepat.
                </p>
              </div>

              <div className="divide-y divide-parchment-200 dark:divide-ink-800 border border-parchment-200 dark:border-ink-800 rounded-2xl bg-white dark:bg-ink-900 overflow-hidden">
                {models.map((modelName) => {
                  const isSelected = selectedModel === modelName;
                  const pingInfo = pingResults[modelName];
                  const isPinging = pingingModel === modelName;

                  return (
                    <div
                      key={modelName}
                      className={`p-3.5 flex items-center justify-between gap-3 transition-colors ${
                        isSelected ? 'bg-turath-emerald-soft/50 dark:bg-turath-emerald-dark-soft/30' : 'hover:bg-parchment-50 dark:hover:bg-ink-850'
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs text-ink-900 dark:text-parchment-100 truncate">
                            {modelName}
                          </span>
                          {isSelected && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-turath-emerald text-white">
                              Sedang Dipakai
                            </span>
                          )}
                        </div>

                        {pingInfo && (
                          <div className="mt-1 flex items-center gap-2 text-[11px] font-mono">
                            {pingInfo.status === 'ok' ? (
                              <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                                <Zap className="w-3 h-3" />
                                <span>Latensi: {pingInfo.latency}ms (Cepat)</span>
                              </span>
                            ) : (
                              <span className="text-rose-600 dark:text-rose-400">
                                Gagal: {pingInfo.error || 'Timeout'}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => handlePingModel(modelName)}
                          disabled={isPinging}
                          className="px-2.5 py-1.5 rounded-xl border border-parchment-300 dark:border-ink-700 text-xs font-mono font-medium hover:border-turath-emerald hover:text-turath-emerald transition-colors"
                        >
                          {isPinging ? 'Menguji...' : 'Tes Latensi'}
                        </button>

                        {!isSelected && (
                          <button
                            type="button"
                            onClick={() => {
                              onSelectModel(modelName);
                              setStatusMessage(`Model aktif diganti ke: ${modelName}`);
                              setTimeout(() => setStatusMessage(''), 2500);
                            }}
                            className="px-3 py-1.5 rounded-xl bg-turath-emerald hover:bg-turath-emerald-light text-white text-xs font-sans font-semibold transition-colors"
                          >
                            Pilih
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: WEB CONSOLE NATIVE ACCESS */}
          {activeTab === 'console' && (
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-white dark:bg-ink-900 border border-parchment-200 dark:border-ink-800 space-y-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-parchment-100 dark:bg-ink-800 flex items-center justify-center text-turath-emerald">
                    <Server className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-base text-ink-900 dark:text-parchment-100">
                      Konsol Web Asli 9Router (Next.js Dashboard)
                    </h4>
                    <p className="text-xs text-ink-500">
                      Akses antarmuka penuh 9Router untuk konfigurasi mendalam (Proxy Pools, Transkrip Mentah, Custom Headers).
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-parchment-50 dark:bg-ink-950 border border-parchment-200 dark:border-ink-800 space-y-2.5 text-xs font-sans">
                  <div className="font-semibold text-ink-900 dark:text-parchment-100">
                    Kredensial Akses Konsol Web:
                  </div>
                  <div className="space-y-1.5 font-mono text-[11px] text-ink-700 dark:text-parchment-200">
                    <div>Alamat Port: <b>http://127.0.0.1:20128</b> (Local VPS)</div>
                    <div>Password Awal: <code className="px-2 py-0.5 rounded bg-parchment-200 dark:bg-ink-800 font-bold">Antigravity2026!</code></div>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-dashed border-parchment-300 dark:border-ink-800 text-xs text-ink-600 dark:text-ink-400 space-y-2">
                  <p className="font-semibold text-ink-800 dark:text-parchment-200">
                    Cara Membuka Konsol Web dari Laptop Anda:
                  </p>
                  <p>
                    Karena port 20128 dilindungi firewall internal VPS, Anda dapat membuka port tunnel langsung ke laptop Anda menggunakan perintah SSH berikut di PowerShell:
                  </p>
                  <pre className="p-2.5 rounded-lg bg-ink-950 text-emerald-400 font-mono text-[11px] overflow-x-auto">
ssh -i ~/.ssh/vps_deploy_ed25519 -p 2288 -L 20128:127.0.0.1:20128 root@103.177.95.140
                  </pre>
                  <p className="text-[11px]">
                    Setelah perintah di atas berjalan di terminal Anda, buka <b className="text-turath-emerald">http://localhost:20128</b> di browser Anda untuk masuk ke antarmuka 9Router dengan password <b className="text-turath-emerald">Antigravity2026!</b>.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sticky Cockpit Footer */}
        <div className="px-5 py-3.5 border-t border-parchment-200 dark:border-ink-800 bg-parchment-50 dark:bg-ink-950 flex items-center justify-between text-xs text-ink-500 flex-shrink-0">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-turath-emerald" />
            <span>Koneksi aman terowongan lokal port 20128</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white dark:bg-ink-800 border border-parchment-300 dark:border-ink-700 text-ink-800 dark:text-parchment-100 font-semibold hover:bg-parchment-100 transition-colors"
          >
            Tutup Cockpit
          </button>
        </div>

      </div>
    </div>
  );
}
