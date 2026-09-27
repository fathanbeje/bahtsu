import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import ChatPane from './components/ChatPane';
import TaswidahDock from './components/TaswidahDock';
import TurathModal from './components/TurathModal';
import KajianArchivePage from './components/KajianArchivePage';
import PasscodeModal from './components/PasscodeModal';
import SettingsModal from './components/SettingsModal';
import ModelSelectorModal from './components/ModelSelectorModal';
import SessionHistoryModal from './components/SessionHistoryModal';
import RouterCockpitModal from './components/RouterCockpitModal';
import MatraInfoModal from './components/MatraInfoModal';
import { getAuthToken, clearAuthToken, checkStatus, streamChat } from './utils/api';
import { 
  getActiveSessionOrDefault, 
  saveCurrentSessionState, 
  createNewSession, 
  setActiveSessionId 
} from './utils/sessionStorage';
import { MessageSquare, BookOpen } from 'lucide-react';

export default function App() {
  const [token, setToken] = useState(getAuthToken());
  const [isAuthenticated, setIsAuthenticated] = useState(!!getAuthToken());

  // Load initial active session from localStorage
  const initialSession = getActiveSessionOrDefault();
  const [activeSessionId, setActiveSessionIdState] = useState(() => initialSession?.id || null);
  
  // App Preferences
  const [matraMode, setMatraMode] = useState(() => initialSession?.matraMode || 'waqi_iyyah');
  const [arabicFontSize, setArabicFontSize] = useState(24);
  const [arabicFontFamily, setArabicFontFamily] = useState('amiri');
  const [darkMode, setDarkMode] = useState(false);
  const [selectedModel, setSelectedModel] = useState(
    () => initialSession?.model || localStorage.getItem('bahtsu_selected_model') || 'ag/gemini-3.8-flash-high'
  );
  const [temperature, setTemperature] = useState(0.3);
  const [dockLayout, setDockLayout] = useState(() => localStorage.getItem('bahtsu_dock_layout') || 'balanced');

  // Data & State
  const [messages, setMessages] = useState(() => initialSession?.messages || []);
  const [isStreaming, setIsStreaming] = useState(false);
  const [taswidahContent, setTaswidahContent] = useState(() => initialSession?.taswidahContent || '');
  const [routerStatus, setRouterStatus] = useState(null);

  // Main App View: 'studio' (Dual Pane) | 'arsip' (Full Repositori Page)
  const [activeMainView, setActiveMainView] = useState('studio');

  // Mobile View Toggle ('chat' | 'dock')
  const [mobileTab, setMobileTab] = useState('chat');

  // Modals
  const [isTurathOpen, setIsTurathOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isModelSelectorOpen, setIsModelSelectorOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isRouterCockpitOpen, setIsRouterCockpitOpen] = useState(false);
  const [isMatraInfoOpen, setIsMatraInfoOpen] = useState(false);

  const abortControllerRef = useRef(null);

  // Dark mode effect
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Initial status check
  useEffect(() => {
    if (isAuthenticated) {
      fetchRouterStatus();
    }
  }, [isAuthenticated]);

  // Auto-save session state to localStorage on state change
  useEffect(() => {
    if (activeSessionId) {
      saveCurrentSessionState({
        id: activeSessionId,
        matraMode,
        model: selectedModel,
        messages,
        taswidahContent,
      });
    }
  }, [activeSessionId, messages, taswidahContent, matraMode, selectedModel]);

  const fetchRouterStatus = async () => {
    const status = await checkStatus();
    setRouterStatus(status);
    
    // If current selectedModel is not set or invalid, sync with router available models
    const saved = localStorage.getItem('bahtsu_selected_model');
    if (!saved && status.availableModels && status.availableModels.length > 0) {
      const topModel = status.availableModels.find(m => m.includes('3.8-flash-high')) || status.availableModels[0];
      setSelectedModel(topModel);
      localStorage.setItem('bahtsu_selected_model', topModel);
    }
  };

  const handleModelChange = (model) => {
    setSelectedModel(model);
    localStorage.setItem('bahtsu_selected_model', model);
  };

  const handleDockLayoutChange = (layout) => {
    setDockLayout(layout);
    localStorage.setItem('bahtsu_dock_layout', layout);
  };

  const handleAuthSuccess = (newToken) => {
    setToken(newToken);
    setIsAuthenticated(true);
    fetchRouterStatus();
  };

  const handleLock = () => {
    clearAuthToken();
    setToken('');
    setIsAuthenticated(false);
  };

  const handleSelectSession = (session) => {
    if (!session) return;
    setActiveSessionId(session.id);
    setActiveSessionIdState(session.id);
    setMessages(session.messages || []);
    setTaswidahContent(session.taswidahContent || '');
    if (session.matraMode) setMatraMode(session.matraMode);
    if (session.model) {
      setSelectedModel(session.model);
      localStorage.setItem('bahtsu_selected_model', session.model);
    }
  };

  const handleNewSession = () => {
    handleStopStreaming();
    const newSession = createNewSession('Telaah Masalah Baru', matraMode, selectedModel);
    setActiveSessionIdState(newSession.id);
    setMessages([]);
    setTaswidahContent('');
  };

  const handleSendMessage = async (text) => {
    if (!text.trim() || isStreaming) return;

    // Ensure session ID exists
    let curId = activeSessionId;
    if (!curId) {
      const newSession = createNewSession(text.substring(0, 50), matraMode, selectedModel);
      setActiveSessionIdState(newSession.id);
      curId = newSession.id;
    }

    const userMessage = { role: 'user', content: text };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);

    // Prepare assistant placeholder
    const assistantIndex = updatedMessages.length;
    setMessages(prev => [...prev, { role: 'assistant', content: '' }]);
    setIsStreaming(true);

    abortControllerRef.current = new AbortController();

    let fullAssistantResponse = '';

    await streamChat({
      messages: updatedMessages,
      model: selectedModel,
      matraMode,
      temperature,
      signal: abortControllerRef.current.signal,
      onChunk: (chunk) => {
        fullAssistantResponse += chunk;
        setMessages(prev => {
          const next = [...prev];
          next[assistantIndex] = { role: 'assistant', content: fullAssistantResponse };
          return next;
        });
      },
      onError: (err) => {
        console.error('Streaming error:', err);
        setMessages(prev => {
          const next = [...prev];
          if (fullAssistantResponse.length > 50) {
            next[assistantIndex] = {
              role: 'assistant',
              content: fullAssistantResponse + `\n\n*(Aliran terhenti sejenak karena timeout jaringan. Anda dapat mengetik "Lanjutkan" untuk meneruskan)*`,
            };
          } else {
            next[assistantIndex] = {
              role: 'assistant',
              content: fullAssistantResponse + `\n\n> ⚠️ *Kendala Komunikasi Jaringan: ${err.message}. Silakan coba kirim ulang.*`,
            };
          }
          return next;
        });
        setIsStreaming(false);
      },
      onFinish: () => {
        setIsStreaming(false);
        if (!fullAssistantResponse.trim()) {
          setMessages(prev => {
            const next = [...prev];
            next[assistantIndex] = {
              role: 'assistant',
              content: '> ⚠️ *Model selesai menalar namun tidak menghasilkan draf jawaban. Silakan coba kirim ulang atau beralih ke model lain.*',
            };
            return next;
          });
        } else if (fullAssistantResponse && fullAssistantResponse.length > 60) {
          // Auto-sync clean response into TaswidahDock if it's currently empty
          setTaswidahContent(prev => {
            if (!prev.trim()) {
              return fullAssistantResponse.replace(/<think>[\s\S]*?<\/think>/, '').trim();
            }
            return prev;
          });
        }
      },
    });
  };

  const handleStopStreaming = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsStreaming(false);
    // Bersihkan placeholder pesan kosong jika pengguna menghentikan respons sebelum teks masuk
    setMessages(prev => {
      if (prev.length > 0 && prev[prev.length - 1].role === 'assistant' && !prev[prev.length - 1].content.trim()) {
        return prev.slice(0, -1);
      }
      return prev;
    });
  };

  const handleResetChat = () => {
    if (window.confirm('Mulai sesi bahtsul masail baru? Topik saat ini akan tetap tersimpan aman di Riwayat.')) {
      handleNewSession();
    }
  };

  const handleTransferToTaswidah = (content) => {
    if (!taswidahContent.trim()) {
      setTaswidahContent(content);
    } else {
      setTaswidahContent(prev => `${prev}\n\n---\n\n${content}`);
    }
    setMobileTab('dock');
  };

  const handleLoadToTaswidah = (content) => {
    setTaswidahContent(content);
    setMobileTab('dock');
  };

  const handleInsertTurathQuote = (quote) => {
    handleSendMessage(quote);
    setMobileTab('chat');
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-parchment-50 dark:bg-ink-950 text-ink-900 dark:text-parchment-50">
      {/* Security Gate */}
      <PasscodeModal
        isOpen={!isAuthenticated}
        onSuccess={handleAuthSuccess}
      />

      {/* Main Workspace: Studio Bahtsu or Full Archive Page */}
      {activeMainView === 'arsip' ? (
        <main className="flex-1 flex overflow-hidden">
          <KajianArchivePage
            onBackToStudio={() => setActiveMainView('studio')}
            onLoadToTaswidah={(content) => {
              handleLoadToTaswidah(content);
              setActiveMainView('studio');
            }}
            onLoadToChat={(prompt) => {
              setActiveMainView('studio');
              handleSendMessage(prompt);
            }}
            arabicFontSize={arabicFontSize}
            arabicFontFamily={arabicFontFamily}
            darkMode={darkMode}
            setDarkMode={setDarkMode}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onLock={handleLock}
          />
        </main>
      ) : (
        <>
          {/* Header (Studio Mode) */}
          <Header
            matraMode={matraMode}
            setMatraMode={setMatraMode}
            arabicFontSize={arabicFontSize}
            setArabicFontSize={setArabicFontSize}
            arabicFontFamily={arabicFontFamily}
            setArabicFontFamily={setArabicFontFamily}
            darkMode={darkMode}
            setDarkMode={setDarkMode}
            activeMainView={activeMainView}
            setActiveMainView={setActiveMainView}
            onOpenTurath={() => setIsTurathOpen(true)}
            onOpenArchive={() => setActiveMainView('arsip')}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onOpenModelSelector={() => setIsModelSelectorOpen(true)}
            onOpenHistory={() => setIsHistoryOpen(true)}
            onOpenRouterCockpit={() => setIsRouterCockpitOpen(true)}
            onOpenMatraInfo={() => setIsMatraInfoOpen(true)}
            onNewSession={handleNewSession}
            onLock={handleLock}
            routerStatus={routerStatus}
            selectedModel={selectedModel}
          />

          <main className="flex-1 flex overflow-hidden pb-12 md:pb-0">
          {/* Left Column: Chat & Formulasi */}
          <div
            className={`h-full flex-1 flex flex-col min-w-0 transition-all ${
              mobileTab === 'chat' ? 'flex' : 'hidden md:flex'
            }`}
          >
            <ChatPane
              messages={messages}
              isStreaming={isStreaming}
              onSendMessage={handleSendMessage}
              onStopStreaming={handleStopStreaming}
              onResetChat={handleResetChat}
              onTransferToTaswidah={handleTransferToTaswidah}
              onOpenModelSelector={() => setIsModelSelectorOpen(true)}
              onOpenTurath={() => setIsTurathOpen(true)}
              onOpenArchive={() => setActiveMainView('arsip')}
              onOpenRouterCockpit={() => setIsRouterCockpitOpen(true)}
              onOpenHistory={() => setIsHistoryOpen(true)}
              onNewSession={handleNewSession}
              matraMode={matraMode}
              arabicFontSize={arabicFontSize}
              arabicFontFamily={arabicFontFamily}
              selectedModel={selectedModel}
            />
          </div>

          {/* Right Column: Taswīdah & Ibarat Dock */}
          <div
            className={`h-full transition-all duration-300 flex-shrink-0 ${
              mobileTab === 'dock' ? 'w-full flex' : 'hidden md:flex'
            } ${
              dockLayout === 'wide'
                ? 'md:w-[58%] lg:w-[60%] xl:w-[62%]'
                : dockLayout === 'balanced'
                ? 'md:w-1/2 lg:w-1/2'
                : 'md:w-[420px] lg:w-[460px] xl:w-[500px]'
            }`}
          >
            <TaswidahDock
              taswidahContent={taswidahContent}
              setTaswidahContent={setTaswidahContent}
              onSaveSuccess={fetchRouterStatus}
              arabicFontSize={arabicFontSize}
              arabicFontFamily={arabicFontFamily}
              matraMode={matraMode}
              selectedModel={selectedModel}
              dockLayout={dockLayout}
              setDockLayout={handleDockLayoutChange}
            />
          </div>
        </main>

        {/* Mobile Fixed Bottom Navigation Bar (Only in Studio mode) */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 flex items-center justify-around border-t border-parchment-200 dark:border-ink-800 bg-parchment-50/95 dark:bg-ink-950/95 backdrop-blur-md text-xs font-sans font-medium h-12 shadow-lg">
          <button
            onClick={() => setMobileTab('chat')}
            className={`flex items-center gap-1.5 h-full flex-1 justify-center transition-all ${
              mobileTab === 'chat'
                ? 'text-turath-emerald dark:text-emerald-400 font-bold bg-turath-emerald/10 dark:bg-turath-emerald/15 border-t-2 border-turath-emerald'
                : 'text-ink-500 hover:text-ink-900 dark:hover:text-parchment-100'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Musyawarah (Chat)</span>
          </button>

          <button
            onClick={() => setMobileTab('dock')}
            className={`flex items-center gap-1.5 h-full flex-1 justify-center transition-all ${
              mobileTab === 'dock'
                ? 'text-turath-emerald dark:text-emerald-400 font-bold bg-turath-emerald/10 dark:bg-turath-emerald/15 border-t-2 border-turath-emerald'
                : 'text-ink-500 hover:text-ink-900 dark:hover:text-parchment-100'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Taswīdah & Ibarat</span>
            {taswidahContent && (
              <span className="w-2 h-2 rounded-full bg-turath-emerald" />
            )}
          </button>
        </div>
      </>
    )}

      {/* Model Selector Modal Drawer */}
      <ModelSelectorModal
        isOpen={isModelSelectorOpen}
        onClose={() => setIsModelSelectorOpen(false)}
        selectedModel={selectedModel}
        onSelectModel={handleModelChange}
        availableModels={routerStatus?.availableModels || []}
      />

      {/* Turath.io API Modal Drawer */}
      <TurathModal
        isOpen={isTurathOpen}
        onClose={() => setIsTurathOpen(false)}
        onInsertToChat={handleInsertTurathQuote}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        selectedModel={selectedModel}
        onOpenModelSelector={() => setIsModelSelectorOpen(true)}
        temperature={temperature}
        setTemperature={setTemperature}
        routerStatus={routerStatus}
        onRefreshStatus={fetchRouterStatus}
      />

      {/* Session History Modal Drawer */}
      <SessionHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        activeSessionId={activeSessionId}
        onSelectSession={handleSelectSession}
        onNewSession={handleNewSession}
      />

      {/* 9Router Mission Control Cockpit */}
      <RouterCockpitModal
        isOpen={isRouterCockpitOpen}
        onClose={() => setIsRouterCockpitOpen(false)}
        currentModel={selectedModel}
        onSelectModel={handleModelChange}
      />

      {/* Tri-Matra Metodologi Info Modal */}
      <MatraInfoModal
        isOpen={isMatraInfoOpen}
        onClose={() => setIsMatraInfoOpen(false)}
        currentMatra={matraMode}
        onSelectMatra={setMatraMode}
      />
    </div>
  );
}
