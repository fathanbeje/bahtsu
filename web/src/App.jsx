import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import ChatPane from './components/ChatPane';
import TaswidahDock from './components/TaswidahDock';
import TurathModal from './components/TurathModal';
import KajianArchiveModal from './components/KajianArchiveModal';
import PasscodeModal from './components/PasscodeModal';
import SettingsModal from './components/SettingsModal';
import { getAuthToken, clearAuthToken, checkStatus, streamChat } from './utils/api';
import { MessageSquare, BookOpen } from 'lucide-react';

export default function App() {
  const [token, setToken] = useState(getAuthToken());
  const [isAuthenticated, setIsAuthenticated] = useState(!!getAuthToken());
  
  // App Preferences
  const [matraMode, setMatraMode] = useState('waqi_iyyah');
  const [arabicFontSize, setArabicFontSize] = useState(24);
  const [arabicFontFamily, setArabicFontFamily] = useState('amiri');
  const [darkMode, setDarkMode] = useState(false);
  const [selectedModel, setSelectedModel] = useState('gemini-2.5-pro');
  const [temperature, setTemperature] = useState(0.3);

  // Data & State
  const [messages, setMessages] = useState([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [taswidahContent, setTaswidahContent] = useState('');
  const [routerStatus, setRouterStatus] = useState(null);

  // Mobile View Toggle ('chat' | 'dock')
  const [mobileTab, setMobileTab] = useState('chat');

  // Modals
  const [isTurathOpen, setIsTurathOpen] = useState(false);
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

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

  const fetchRouterStatus = async () => {
    const status = await checkStatus();
    setRouterStatus(status);
    if (status.defaultModel && !selectedModel) {
      setSelectedModel(status.defaultModel);
    }
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

  const handleSendMessage = async (text) => {
    if (!text.trim() || isStreaming) return;

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
          next[assistantIndex] = {
            role: 'assistant',
            content: fullAssistantResponse + `\n\n> ⚠️ *Kendala Komunikasi 9Router: ${err.message}*`,
          };
          return next;
        });
        setIsStreaming(false);
      },
      onFinish: () => {
        setIsStreaming(false);
      },
    });
  };

  const handleStopStreaming = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsStreaming(false);
  };

  const handleResetChat = () => {
    if (window.confirm('Mulai sesi bahtsul masail baru dan bersihkan riwayat obrolan?')) {
      handleStopStreaming();
      setMessages([]);
    }
  };

  const handleTransferToTaswidah = (content) => {
    // If taswidah already has content, append cleanly; otherwise set directly
    if (!taswidahContent.trim()) {
      setTaswidahContent(content);
    } else {
      setTaswidahContent(prev => `${prev}\n\n---\n\n${content}`);
    }
    // On mobile, automatically show the dock tab
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

      {/* Header */}
      <Header
        matraMode={matraMode}
        setMatraMode={setMatraMode}
        arabicFontSize={arabicFontSize}
        setArabicFontSize={setArabicFontSize}
        arabicFontFamily={arabicFontFamily}
        setArabicFontFamily={setArabicFontFamily}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        onOpenTurath={() => setIsTurathOpen(true)}
        onOpenArchive={() => setIsArchiveOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onLock={handleLock}
        routerStatus={routerStatus}
      />

      {/* Mobile Tab Navigation Bar (Visible only on small viewports) */}
      <div className="md:hidden flex items-center justify-around border-b border-parchment-200 dark:border-ink-800 bg-parchment-100/90 dark:bg-ink-900/90 text-xs font-sans font-medium">
        <button
          onClick={() => setMobileTab('chat')}
          className={`flex items-center gap-1.5 py-2.5 px-4 flex-1 justify-center border-b-2 transition-colors ${
            mobileTab === 'chat'
              ? 'border-turath-emerald text-turath-emerald dark:text-emerald-400 font-bold bg-white/40 dark:bg-ink-800/40'
              : 'border-transparent text-ink-500'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Musyawarah (Chat)</span>
        </button>

        <button
          onClick={() => setMobileTab('dock')}
          className={`flex items-center gap-1.5 py-2.5 px-4 flex-1 justify-center border-b-2 transition-colors ${
            mobileTab === 'dock'
              ? 'border-turath-emerald text-turath-emerald dark:text-emerald-400 font-bold bg-white/40 dark:bg-ink-800/40'
              : 'border-transparent text-ink-500'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Taswīdah & Ibarat</span>
          {taswidahContent && (
            <span className="w-2 h-2 rounded-full bg-turath-emerald" />
          )}
        </button>
      </div>

      {/* Main Dual-Pane Research Studio */}
      <main className="flex-1 flex overflow-hidden">
        {/* Left Column: Chat & Formulasi (Visible always on desktop, or when mobileTab === 'chat' on mobile) */}
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
            matraMode={matraMode}
            arabicFontSize={arabicFontSize}
            arabicFontFamily={arabicFontFamily}
            selectedModel={selectedModel}
          />
        </div>

        {/* Right Column: Taswīdah & Ibarat Dock (Visible always on desktop, or when mobileTab === 'dock' on mobile) */}
        <div
          className={`h-full w-full md:w-[420px] lg:w-[480px] xl:w-[540px] flex-shrink-0 transition-all ${
            mobileTab === 'dock' ? 'flex' : 'hidden md:flex'
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
          />
        </div>
      </main>

      {/* Turath.io API Modal Drawer */}
      <TurathModal
        isOpen={isTurathOpen}
        onClose={() => setIsTurathOpen(false)}
        onInsertToChat={handleInsertTurathQuote}
      />

      {/* Kajian Archive Modal Drawer */}
      <KajianArchiveModal
        isOpen={isArchiveOpen}
        onClose={() => setIsArchiveOpen(false)}
        onLoadToTaswidah={handleLoadToTaswidah}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        selectedModel={selectedModel}
        setSelectedModel={setSelectedModel}
        temperature={temperature}
        setTemperature={setTemperature}
        routerStatus={routerStatus}
        onRefreshStatus={fetchRouterStatus}
      />
    </div>
  );
}
