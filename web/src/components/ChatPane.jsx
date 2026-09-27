import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Square, 
  Copy, 
  Check, 
  FileText, 
  Sparkles, 
  BookMarked, 
  ChevronDown, 
  ChevronRight,
  RotateCcw,
  Feather,
  Cpu,
  Search,
  FolderArchive,
  Activity,
  History,
  Plus,
  X,
  ArrowRight,
  Settings2,
  BookOpen,
  Mic,
  MicOff
} from 'lucide-react';
import { extractThoughts, stripThinkingTags } from '../utils/thinkingHelper';

export default function ChatPane({
  messages,
  isStreaming,
  onSendMessage,
  onStopStreaming,
  onResetChat,
  onTransferToTaswidah,
  onOpenModelSelector,
  onOpenTurath,
  onOpenArchive,
  onOpenRouterCockpit,
  onOpenHistory,
  onNewSession,
  matraMode,
  arabicFontSize,
  arabicFontFamily,
  selectedModel,
}) {
  const [inputText, setInputText] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const [openThoughts, setOpenThoughts] = useState({});
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const recognitionRef = useRef(null);

  // Setup SpeechRecognition for Bahasa Indonesia dictation
  const isSpeechSupported = typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  const toggleListening = () => {
    if (!isSpeechSupported) {
      alert('Browser Anda belum mendukung fitur Web Speech Recognition (Dikte Suara). Coba gunakan Google Chrome atau Microsoft Edge.');
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = 'id-ID';
      recognition.interimResults = false;
      recognition.continuous = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        const transcript = event.results?.[0]?.[0]?.transcript;
        if (transcript) {
          setInputText((prev) => {
            const trimmed = prev.trim();
            return trimmed ? `${trimmed} ${transcript}` : transcript;
          });
          setTimeout(() => {
            if (textareaRef.current) {
              textareaRef.current.focus();
              textareaRef.current.style.height = 'auto';
              textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
            }
          }, 50);
        }
      };

      recognition.onerror = (event) => {
        console.warn('SpeechRecognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
        recognitionRef.current = null;
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.warn('Gagal memulai SpeechRecognition:', err);
      setIsListening(false);
    }
  };

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // ignore
        }
      }
    };
  }, []);

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  // Adjust textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [inputText]);

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!inputText.trim() || isStreaming) return;
    onSendMessage(inputText.trim());
    setInputText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleCopyText = (id, text) => {
    const cleanText = stripThinkingTags(text);
    navigator.clipboard.writeText(cleanText);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCopyFormattedWord = (id, content) => {
    const cleanContent = stripThinkingTags(content);
    const formatted = cleanContent
      .replace(/<u>\*\*【/g, '<u><b>')
      .replace(/】\*\*<\/u>/g, '</b></u>');
    navigator.clipboard.writeText(formatted);
    setCopiedId(`word-${id}`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleThought = (idx) => {
    setOpenThoughts(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const renderMessageContent = (content, msgIndex) => {
    const { thoughtText, mainContent } = extractThoughts(content);

    const isCurrentStreaming = isStreaming && msgIndex === messages.length - 1;
    const isThoughtOpen = openThoughts[msgIndex] !== undefined ? openThoughts[msgIndex] : isCurrentStreaming;

    const paragraphs = mainContent ? mainContent.split('\n') : [];

    return (
      <div className="space-y-3 font-serif">
        {thoughtText && (
          <div className={`mb-3 rounded-xl border p-3 text-xs font-sans transition-all ${
            isCurrentStreaming
              ? 'border-turath-gold/50 bg-amber-50/80 dark:bg-amber-950/40 text-ink-700 dark:text-amber-200'
              : 'border-parchment-300 dark:border-ink-800 bg-parchment-100/70 dark:bg-ink-900/70 text-ink-600 dark:text-ink-400'
          }`}>
            <button
              type="button"
              onClick={() => toggleThought(msgIndex)}
              className="flex items-center justify-between font-medium hover:text-ink-900 dark:hover:text-parchment-200 transition-colors w-full text-left"
            >
              <div className="flex items-center gap-1.5">
                {isThoughtOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                <Sparkles className={`w-3.5 h-3.5 text-turath-gold ${isCurrentStreaming ? 'animate-spin' : ''}`} />
                <span className="font-semibold">Nalar Ushul & Istinbath AI ({thoughtText.length} karakter)</span>
              </div>
              {isCurrentStreaming && (
                <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-turath-gold/20 text-amber-800 dark:text-amber-300 font-bold animate-pulse">
                  Sedang Menalar...
                </span>
              )}
            </button>
            {isThoughtOpen && (
              <div className="mt-2.5 pt-2 border-t border-parchment-200 dark:border-ink-800 whitespace-pre-wrap font-mono text-[11px] leading-relaxed max-h-56 overflow-y-auto">
                {thoughtText}
              </div>
            )}
          </div>
        )}

        {isCurrentStreaming && !mainContent && (
          <div className="flex items-center gap-2.5 py-3 px-1 text-sm text-ink-600 dark:text-parchment-200 font-sans">
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-turath-emerald animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2.5 h-2.5 rounded-full bg-turath-emerald animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2.5 h-2.5 rounded-full bg-turath-emerald animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <span className="text-xs font-semibold text-turath-emerald dark:text-emerald-400">
              {thoughtText ? 'Merumuskan ibarat & wajhul istidlal turats...' : 'Menghubungkan ke Tim Asistensi Bahtsul Masail...'}
            </span>
          </div>
        )}

        {!isCurrentStreaming && !mainContent && !thoughtText && (
          <div className="py-2 px-1 text-xs text-ink-500 italic">
            Respons belum selesai dimuat atau terputus saat koneksi terputus. Silakan ajukan ulang pertanyaan Anda.
          </div>
        )}

        {paragraphs.map((p, idx) => {
          if (!p.trim()) return <div key={idx} className="h-1" />;

          if (p.startsWith('#')) {
            const level = p.match(/^#+/)[0].length;
            const text = p.replace(/^#+\s*/, '');
            if (level === 1) return <h2 key={idx} className="text-xl font-bold font-serif text-turath-emerald dark:text-emerald-300 mt-4 mb-2 pb-1 border-b border-parchment-200 dark:border-ink-800">{text}</h2>;
            if (level === 2) return <h3 key={idx} className="text-lg font-bold font-serif text-ink-900 dark:text-parchment-100 mt-3 mb-1.5">{text}</h3>;
            return <h4 key={idx} className="text-base font-semibold font-serif text-ink-800 dark:text-parchment-200 mt-2 mb-1">{text}</h4>;
          }

          if (p.startsWith('>')) {
            const quoteContent = p.replace(/^>\s*/, '');
            const arabicChars = (quoteContent.match(/[\u0600-\u06FF]/g) || []).length;
            const isArabicQuote = arabicChars > 15 || (arabicChars / (quoteContent.length || 1) > 0.35);

            if (isArabicQuote) {
              return (
                <blockquote
                  key={idx}
                  dir="rtl"
                  className={`my-3 p-4 sm:p-5 rounded-2xl border-r-4 border-r-turath-gold border-l-0 bg-parchment-100/70 dark:bg-ink-900/60 text-right arabic-text break-words overflow-x-hidden ${
                    arabicFontFamily === 'scheherazade' ? 'font-scheherazade' : 'font-arabic'
                  }`}
                  style={{ fontSize: `${arabicFontSize}px` }}
                  dangerouslySetInnerHTML={{
                    __html: formatTextToHtml(quoteContent),
                  }}
                />
              );
            }

            return (
              <blockquote
                key={idx}
                dir="ltr"
                className="my-2.5 px-4 py-2.5 border-l-4 border-turath-gold bg-parchment-100/60 dark:bg-ink-900/50 rounded-r-xl text-sm sm:text-base leading-relaxed text-ink-800 dark:text-parchment-200"
                dangerouslySetInnerHTML={{
                  __html: formatTextToHtml(quoteContent),
                }}
              />
            );
          }

          if (p.includes('Makna Murod') || p.includes('Wajhul Istidlal') || p.includes('Wajhul Ilhaq')) {
            return (
              <div key={idx} className="mt-3.5 pt-1 text-xs sm:text-sm font-sans font-bold uppercase tracking-wider text-turath-emerald dark:text-emerald-300">
                <span dangerouslySetInnerHTML={{ __html: formatTextToHtml(p) }} />
              </div>
            );
          }

          if (p.startsWith('Karya:') || p.startsWith('*Karya:')) {
            return (
              <div key={idx} className="text-xs sm:text-[13.5px] text-ink-600 dark:text-ink-400 font-sans my-1 bg-parchment-100/60 dark:bg-ink-900/40 p-2 rounded-lg border border-parchment-200 dark:border-ink-800">
                <span dangerouslySetInnerHTML={{ __html: formatTextToHtml(p) }} />
              </div>
            );
          }

          if (p.includes('Tautan Verifikasi') || (p.includes('Turath.io') && p.includes('http'))) {
            return (
              <div key={idx} className="my-2.5 p-3 rounded-xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/60 text-xs sm:text-sm text-blue-900 dark:text-blue-200 flex items-center gap-2 font-sans shadow-2xs">
                <span className="shrink-0 text-base">🔗</span>
                <div className="flex-1 break-words font-medium" dangerouslySetInnerHTML={{ __html: formatTextToHtml(p) }} />
              </div>
            );
          }

          const arabicCount = (p.match(/[\u0600-\u06FF]/g) || []).length;
          const isArabic = arabicCount > 20 && (arabicCount / (p.length || 1) > 0.4);

          return (
            <p
              key={idx}
              dir={isArabic ? 'rtl' : 'ltr'}
              className={`leading-relaxed text-ink-900 dark:text-parchment-50 break-words ${
                isArabic 
                  ? `arabic-text ${arabicFontFamily === 'scheherazade' ? 'font-scheherazade' : 'font-arabic'} my-2.5 px-1` 
                  : 'text-base sm:text-[17px] leading-[1.85] my-1.5'
              }`}
              style={isArabic ? { fontSize: `${arabicFontSize}px` } : undefined}
              dangerouslySetInnerHTML={{
                __html: formatTextToHtml(p),
              }}
            />
          );
        })}
      </div>
    );
  };

  const formatTextToHtml = (text) => {
    if (!text) return '';
    return text
      .replace(/<u>\*\*【(.*?)】\*\*<\/u>/g, '<u class="mahallus-syahid"><strong>【 $1 】</strong></u>')
      .replace(/【(.*?)】/g, '<span class="mahallus-syahid">【 $1 】</span>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code class="px-1 py-0.5 rounded bg-parchment-200 dark:bg-ink-800 text-xs font-mono">$1</code>')
      .replace(/\[(.*?)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1 font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline underline-offset-2 break-all transition-colors">$1 <svg class="w-3.5 h-3.5 inline-block shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg></a>');
  };

  // State for interactive template parameter popover
  const [activeTemplateModal, setActiveTemplateModal] = useState(null);
  const [paramTopic, setParamTopic] = useState('');
  const [paramDetails, setParamDetails] = useState('');
  const [paramQuestions, setParamQuestions] = useState('');
  const [paramReference, setParamReference] = useState('');

  const openTemplateModal = (templateId) => {
    setActiveTemplateModal(templateId);
    if (templateId === 'as_ilah') {
      setParamTopic('Hukum Transaksi PayLater & Biaya Layanan Tambahan');
      setParamDetails('Pengguna berbelanja online menggunakan fasilitas talangan belanja dengan skema angsuran bertahap dan pengenaan biaya administrasi serta denda keterlambatan.');
      setParamQuestions('1. Bagaimana status akad antara konsumen, merchant, dan penyedia dana?\n2. Bagaimana hukum biaya layanan dan denda keterlambatan menurut qaul mu\'tamad madzhab Syafi\'i?');
    } else if (templateId === 'muqaranah') {
      setParamTopic('Batasan Niat Mukim dan Shalat Jamak Qashar bagi Musafir');
      setParamDetails('Perbandingan qaul fuqaha 4 madzhab mengenai jumlah hari maksimal keringanan jamak qashar bagi musafir yang berada di kota tujuan.');
      setParamQuestions('');
    } else if (templateId === 'takhrij') {
      setParamTopic('Hadits Peletakan Pelepah Kurma dan Batu Kerikil di Atas Makam (أن النبي ﷺ وضع على قبر جريدة رطبة وقال لعله يخفف عنهما)');
      setParamReference('Shahih Bukhari & Shahih Muslim (Bab Ahkamul Janaiz wal Qubur)');
    } else if (templateId === 'putusan') {
      setParamTopic('Status Hukum Penggunaan Azimat, Rajah, dan Wifiq dalam Pengobatan');
      setParamDetails('Sidang Komisi Fiqhiyyah Bahtsul Masail Nahdlatul Ulama');
      setParamQuestions('Diktum: Diperinci antara azimat yang berisi ayat Al-Qur\'an dan asma Allah (mubah) dengan yang mengandung sihir/istianah bil jin (haram).');
    }
  };

  const buildPrompt = (type) => {
    if (type === 'as_ilah') {
      return `Mohon telaah masalah waqi'iyyah berikut dengan metodologi resmi Bahtsul Masail Nahdlatul Ulama:

**Judul / Kasus:** ${paramTopic || 'Masalah Waqi\'iyyah Kontemporer'}

**Deskripsi Masalah (Tashawwur Mas'alah):**
${paramDetails || 'Deskripsikan konteks fakta empiris masalah secara jelas di sini...'}

**Pokok Masalah (As'ilah):**
${paramQuestions || '1. Bagaimana status hukum kasus tersebut?\n2. Bagaimana batasan syar\'i dan solusinya?'}

Sajikan rumusan jawaban terstruktur, ibarat mu'tamad Syafi'iyyah berharakat lengkap dari kutubus Syaikhoni dan Hawasyi Muta'akhirin, penandaan mahallus syahid 【 ... 】, serta uraian Wajhul Istidlal/Ilhaq.`;
    } else if (type === 'muqaranah') {
      return `Lakukan telaah komparasi fiqih lintas empat mazhab (Muqāranatul Madzāhib) untuk masalah berikut:

**Isu Khilafiyyah:** ${paramTopic || 'Isu Khilafiyyah Fiqhiyyah'}
${paramDetails ? `\n**Konteks Masalah:**\n${paramDetails}\n` : ''}
Mohon uraikan:
1. Qaul Mu'tamad Mazhab Syafi'i (disertai ibarat kitab induk dan hawasyi).
2. Pandangan Mazhab Hanafi, Maliki, dan Hanbali (disertai penegasan tamyiz madzhab dan maraji' mu'tabar masing-masing).
3. Titik temu dalil (wajhul istidlal) dan analisis tarjih / maslahah untuk konteks kekinian di Indonesia.`;
    } else if (type === 'takhrij') {
      return `Mohon lakukan takhrij dan validasi kesahihan dalil riwayat berikut:

**Teks Dalil / Matan Hadits:** ${paramTopic || 'Matan atau teks riwayat dalil'}
${paramReference ? `\n**Dugaan Sumber / Perawi:** ${paramReference}\n` : ''}
Sajikan:
1. Takhrij sumber kitab hadits primer (mukharrij, nomor hadits, bab & sanad).
2. Status sanad dan derajat hadits (Shahih, Hasan, Dha'if, atau Maudhu') menurut para imam muhaqqiqin ahli hadits.
3. Fiqhul Hadits dan pemahaman para fuqaha Syafi'iyyah terhadap dalil tersebut dalam istinbath hukum.`;
    } else {
      return `Susun naskah Draf Taswīdah Keputusan Sidang Bahtsul Masail resmi (Qarār Jamā'ī) untuk:

**Forum / Majelis:** ${paramDetails || 'Sidang Bahtsul Masail'}
**Tema Keputusan:** ${paramTopic || 'Keputusan Bahtsul Masail'}
${paramQuestions ? `\n**Arah Keputusan / Diktum:**\n${paramQuestions}\n` : ''}
Format naskah wajib mencakup:
# DRAF TASWIDAH & BAHAN KAJIAN BAHTSUL MASA'IL
**Tema:** ${paramTopic || 'Keputusan Bahtsul Masail'}
**Klasifikasi:** Masā'il Wāqi'iyyah / Maudlū'iyyah
I. Deskripsi Masalah & Kerangka Konseptual
II. Pokok Masalah (As'ilah)
III. Rumusan Draf Hukum (Taswīdah al-Qarār)
IV. Dhawābith & Rekomendasi Solutif (Makhārij Fiqhiyyah)
V. Multi-Referensi Marāji' Kutubut Turāts (minimal 3-5 kitab mu'tamad dengan ibarat Arab berharakat, mahallus syahid 【 ... 】, dan tautan verifikasi Turath.io).`;
    }
  };

  const handleApplyPromptToInput = () => {
    const prompt = buildPrompt(activeTemplateModal);
    setInputText(prompt);
    setActiveTemplateModal(null);
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
      }
    }, 100);
  };

  const handleDirectSendFromModal = () => {
    const prompt = buildPrompt(activeTemplateModal);
    setActiveTemplateModal(null);
    onSendMessage(prompt);
  };

  return (
    <div className="flex flex-col h-full bg-parchment-50 dark:bg-ink-950 transition-colors">
      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto px-3 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {messages.length === 0 ? (
          /* Empty State: Hub Operasional & 4 Template Formulasi */
          <div className="max-w-2xl mx-auto py-6 sm:py-8 text-center space-y-5">
            <div className="inline-flex p-3 sm:p-4 rounded-2xl bg-turath-emerald/10 dark:bg-turath-emerald/20 text-turath-emerald dark:text-emerald-400 border border-turath-emerald/30 shadow-inner">
              <Feather className="w-8 h-8 sm:w-10 sm:h-10 text-turath-emerald dark:text-emerald-300" />
            </div>

            <div className="space-y-1">
              <h2 className="font-serif font-bold text-xl sm:text-3xl text-ink-900 dark:text-parchment-50">
                Studio Bahtsu Klangopan
              </h2>
              <p className="font-arabic text-base sm:text-lg text-turath-emerald dark:text-emerald-400">
                مُسَاعِدُ بَحْثِ الْمَسَائِلِ عَلَى مَنْهَجِ عُلَمَاءِ أَهْلِ السُّنَّةِ وَالْجَمَاعَةِ
              </p>
              <div className="pt-0.5 flex items-center justify-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium text-ink-500 dark:text-ink-400 bg-parchment-200/50 dark:bg-ink-900/60 border border-parchment-300/50 dark:border-ink-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Mesin Penalaran: {selectedModel.replace(/^ag\//, '')}</span>
                </span>
              </div>
            </div>

            {/* Horizontal Pill Strip: Quick Operational Tools */}
            <div className="flex items-center justify-center gap-1.5 sm:gap-2 flex-wrap pt-1 font-sans">
              <button
                type="button"
                onClick={onOpenTurath}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-turath-emerald text-parchment-50 hover:bg-turath-emerald-light transition-all shadow-xs border border-turath-gold/30 hover:scale-105"
                title="Pencarian Kitab Turath.io"
              >
                <Search className="w-3.5 h-3.5 text-turath-gold" />
                <span>Cari Turath.io</span>
              </button>

              <button
                type="button"
                onClick={onOpenArchive}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-white dark:bg-ink-900 text-ink-800 dark:text-parchment-200 border border-parchment-300 dark:border-ink-800 hover:border-turath-emerald hover:text-turath-emerald transition-all shadow-xs hover:scale-105"
                title="Buka Arsip Bahan Kajian (kajian/)"
              >
                <FolderArchive className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>Arsip Kajian</span>
              </button>

              <button
                type="button"
                onClick={onOpenRouterCockpit}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 hover:bg-emerald-100 transition-all shadow-xs hover:scale-105"
                title="Buka 9Router Remote Cockpit"
              >
                <Activity className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>9Router Cockpit</span>
              </button>

              <button
                type="button"
                onClick={onOpenHistory}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-white dark:bg-ink-900 text-ink-700 dark:text-parchment-300 border border-parchment-300 dark:border-ink-800 hover:text-ink-900 hover:border-parchment-400 transition-all shadow-xs"
                title="Riwayat Musyawarah"
              >
                <History className="w-3.5 h-3.5 text-ink-500" />
                <span className="hidden sm:inline">Riwayat Sesi</span>
                <span className="sm:hidden">Riwayat</span>
              </button>

              <button
                type="button"
                onClick={onNewSession}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-white dark:bg-ink-900 text-ink-700 dark:text-parchment-300 border border-parchment-300 dark:border-ink-800 hover:text-turath-emerald hover:border-turath-emerald transition-all shadow-xs"
                title="Mulai Sesi Musyawarah Baru"
              >
                <Plus className="w-3.5 h-3.5 text-turath-emerald" />
                <span>Sesi Baru</span>
              </button>
            </div>

            {/* Section Divider & Title */}
            <div className="pt-2 text-left">
              <div className="text-xs font-bold uppercase tracking-wider text-ink-500 dark:text-ink-400 mb-2.5 flex items-center justify-between font-sans">
                <span>Template Kerangka Rumusan (Standar NU)</span>
                <span className="text-[11px] font-normal normal-case text-turath-emerald dark:text-emerald-400">Pilih untuk atur parameter</span>
              </div>

              {/* 4 Structured Template Buttons Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left font-sans">
                {/* Template 1: Format As'ilah Waqi'iyyah */}
                <button
                  type="button"
                  onClick={() => openTemplateModal('as_ilah')}
                  className="p-4 sm:p-4.5 rounded-2xl border border-parchment-200 dark:border-ink-800 bg-white dark:bg-ink-900 hover:border-turath-emerald dark:hover:border-emerald-600 transition-all shadow-xs hover:shadow-md group flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[15px] sm:text-base font-bold font-serif text-ink-900 dark:text-parchment-50 group-hover:text-turath-emerald dark:group-hover:text-emerald-300 transition-colors flex items-center gap-1.5">
                        <span>📋</span>
                        <span>Format As'ilah Waqi'iyyah</span>
                      </span>
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-turath-emerald/10 text-turath-emerald font-semibold shrink-0">
                        Wāqi'iyyah / Qauli
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-ink-600 dark:text-ink-400 leading-relaxed">
                      Kerangka resmi Bahtsul Masail: Tashawwur Mas'alah (deskripsi fakta kasus empiris), rumusan pokok pertanyaan, dan batasan fiqih.
                    </p>
                  </div>
                  <div className="mt-3.5 flex items-center justify-between text-xs pt-2.5 border-t border-parchment-100 dark:border-ink-800/80">
                    <span className="text-turath-emerald dark:text-emerald-400 font-semibold flex items-center gap-1">
                      <span>Buka Parameter Template</span>
                      <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                    <span className="text-ink-500 font-mono text-xs">Tashawwur + As'ilah</span>
                  </div>
                </button>

                {/* Template 2: Komparasi 4 Mazhab */}
                <button
                  type="button"
                  onClick={() => openTemplateModal('muqaranah')}
                  className="p-4 sm:p-4.5 rounded-2xl border border-parchment-200 dark:border-ink-800 bg-white dark:bg-ink-900 hover:border-turath-emerald dark:hover:border-emerald-600 transition-all shadow-xs hover:shadow-md group flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[15px] sm:text-base font-bold font-serif text-ink-900 dark:text-parchment-50 group-hover:text-turath-emerald dark:group-hover:text-emerald-300 transition-colors flex items-center gap-1.5">
                        <span>⚖️</span>
                        <span>Komparasi 4 Mazhab</span>
                      </span>
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-semibold shrink-0">
                        Muqāranah Madzhab
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-ink-600 dark:text-ink-400 leading-relaxed">
                      Perbandingan hukum lintas Mazhab Syafi'i, Hanafi, Maliki, dan Hanbali lengkap dengan penegasan tamyiz madzhab dan dalilnya.
                    </p>
                  </div>
                  <div className="mt-3.5 flex items-center justify-between text-xs pt-2.5 border-t border-parchment-100 dark:border-ink-800/80">
                    <span className="text-turath-emerald dark:text-emerald-400 font-semibold flex items-center gap-1">
                      <span>Buka Parameter Template</span>
                      <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                    <span className="text-ink-500 font-mono text-xs">4 Madzhab</span>
                  </div>
                </button>

                {/* Template 3: Takhrij & Validasi Hadits */}
                <button
                  type="button"
                  onClick={() => openTemplateModal('takhrij')}
                  className="p-4 sm:p-4.5 rounded-2xl border border-parchment-200 dark:border-ink-800 bg-white dark:bg-ink-900 hover:border-turath-emerald dark:hover:border-emerald-600 transition-all shadow-xs hover:shadow-md group flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[15px] sm:text-base font-bold font-serif text-ink-900 dark:text-parchment-50 group-hover:text-turath-emerald dark:group-hover:text-emerald-300 transition-colors flex items-center gap-1.5">
                        <span>🔍</span>
                        <span>Takhrij & Validasi Hadits</span>
                      </span>
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 font-semibold shrink-0">
                        Takhrij & Sanad
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-ink-600 dark:text-ink-400 leading-relaxed">
                      Uji keabsahan sanad, matan, derajat riwayat (Shahih/Dha'if), serta fiqhul hadits menurut pemahaman ulama muhaqqiqin.
                    </p>
                  </div>
                  <div className="mt-3.5 flex items-center justify-between text-xs pt-2.5 border-t border-parchment-100 dark:border-ink-800/80">
                    <span className="text-turath-emerald dark:text-emerald-400 font-semibold flex items-center gap-1">
                      <span>Buka Parameter Template</span>
                      <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                    <span className="text-ink-500 font-mono text-xs">Sanad & Matan</span>
                  </div>
                </button>

                {/* Template 4: Draf Taswīdah Putusan Sidang */}
                <button
                  type="button"
                  onClick={() => openTemplateModal('putusan')}
                  className="p-4 sm:p-4.5 rounded-2xl border border-parchment-200 dark:border-ink-800 bg-white dark:bg-ink-900 hover:border-turath-emerald dark:hover:border-emerald-600 transition-all shadow-xs hover:shadow-md group flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[15px] sm:text-base font-bold font-serif text-ink-900 dark:text-parchment-50 group-hover:text-turath-emerald dark:group-hover:text-emerald-300 transition-colors flex items-center gap-1.5">
                        <span>📑</span>
                        <span>Draf Putusan Sidang</span>
                      </span>
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-semibold shrink-0">
                        Qarār Jamā'ī
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-ink-600 dark:text-ink-400 leading-relaxed">
                      Sintesis naskah putusan konsensus Bahtsul Masail lengkap dengan maraji' berantai (3-5 ibarat), titik temu hukum, dan makharij.
                    </p>
                  </div>
                  <div className="mt-3.5 flex items-center justify-between text-xs pt-2.5 border-t border-parchment-100 dark:border-ink-800/80">
                    <span className="text-turath-emerald dark:text-emerald-400 font-semibold flex items-center gap-1">
                      <span>Buka Parameter Template</span>
                      <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                    <span className="text-ink-500 font-mono text-xs">Siap Cetak / Arsip</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Message List */
          messages.map((msg, index) => {
            const isUser = msg.role === 'user';
            const msgKey = `msg-${index}`;

            return (
              <div
                key={msgKey}
                className={`flex gap-2.5 sm:gap-4 max-w-3xl ${
                  isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'
                }`}
              >
                {/* Avatar Icon */}
                <div
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold shadow-xs ${
                    isUser
                      ? 'bg-ink-800 text-parchment-50 dark:bg-parchment-200 dark:text-ink-900'
                      : 'bg-turath-emerald text-parchment-50 border border-turath-gold/40'
                  }`}
                >
                  {isUser ? 'U' : 'BK'}
                </div>

                {/* Message Body Bubble */}
                <div
                  className={`flex-1 rounded-2xl p-3.5 sm:p-5 shadow-xs border ${
                    isUser
                      ? 'bg-turath-emerald text-parchment-50 border-turath-emerald-deep font-sans rounded-tr-sm'
                      : 'bg-card-parchment dark:bg-ink-900 border-parchment-200 dark:border-ink-800 text-ink-900 dark:text-parchment-50 rounded-tl-sm'
                  }`}
                >
                  {/* Sender & Model Header */}
                  <div className="flex items-center justify-between text-[11px] mb-2 font-sans opacity-75 border-b border-current/20 pb-1.5">
                    <span className="font-semibold tracking-wide">
                      {isUser ? 'Musyawirin / Pengkaji' : 'Tim Asistensi Bahtsu Klangopan'}
                    </span>
                    {!isUser && (
                      <span
                        className="text-[10px] font-mono px-1.5 py-0.5 rounded text-ink-500 dark:text-ink-400 opacity-60 flex items-center gap-1 font-medium"
                      >
                        <Cpu className="w-2.5 h-2.5 text-turath-gold" />
                        <span>{selectedModel.replace(/^ag\//, '')}</span>
                      </span>
                    )}
                  </div>

                  {/* Content */}
                  {isUser ? (
                    <div className="whitespace-pre-wrap text-sm leading-relaxed">
                      {msg.content}
                    </div>
                  ) : (
                    renderMessageContent(msg.content, index)
                  )}

                  {/* Actions for Assistant Response */}
                  {!isUser && msg.content && msg.content.trim().length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-parchment-200 dark:border-ink-800 flex flex-wrap items-center justify-between gap-2 text-xs font-sans">
                      <button
                        onClick={() => onTransferToTaswidah(stripThinkingTags(msg.content))}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-turath-emerald-soft dark:bg-turath-emerald-dark-soft text-turath-emerald dark:text-emerald-300 hover:bg-turath-emerald hover:text-white transition-all font-medium text-xs"
                        title="Ekstrak kutipan dan masukkan ke Panel Draf Taswidah"
                      >
                        <BookMarked className="w-3.5 h-3.5" />
                        <span>Ekstrak ke Taswīdah</span>
                      </button>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleCopyFormattedWord(index, msg.content)}
                          className="flex items-center gap-1 px-2 py-1 rounded hover:bg-parchment-200 dark:hover:bg-ink-800 text-ink-600 dark:text-ink-400 transition-colors text-xs"
                          title="Salin dengan tanda format Word / Capacities"
                        >
                          {copiedId === `word-${index}` ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="text-emerald-600 font-medium">Tersalin</span>
                            </>
                          ) : (
                            <>
                              <FileText className="w-3.5 h-3.5" />
                              <span>Format Word</span>
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => handleCopyText(index, msg.content)}
                          className="p-1 rounded hover:bg-parchment-200 dark:hover:bg-ink-800 text-ink-500 dark:text-ink-400 transition-colors"
                          title="Salin teks mentah"
                        >
                          {copiedId === index ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Prompts Input Area */}
      <div className="border-t border-parchment-200 dark:border-ink-800 bg-parchment-50/95 dark:bg-ink-950/95 p-2.5 sm:p-4 backdrop-blur-md">
        <div className="max-w-4xl mx-auto space-y-2">
          {/* Quick Action Chips with comfortable touch targets & readable font */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs sm:text-sm font-sans no-scrollbar">
            <button
              onClick={() => onSendMessage("Formulasikan deskripsi masalah ini menjadi as'ilah (pertanyaan hukum) yang presisi sesuai standar bahtsul masail.")}
              className="px-3.5 py-1.5 rounded-full border border-parchment-300 dark:border-ink-800 bg-white dark:bg-ink-900 text-ink-800 dark:text-parchment-100 hover:border-turath-emerald hover:text-turath-emerald font-semibold whitespace-nowrap transition-colors shadow-2xs min-h-[32px] flex items-center gap-1.5"
            >
              <span>📝</span>
              <span>As'ilah</span>
            </button>
            <button
              onClick={() => onSendMessage("Carikan minimal 3-5 ibarat dari kitab Syafi'iyyah (Syaikhoni & Hawasyi) yang sharih membahas masalah ini beserta wajhul istidlal-nya.")}
              className="px-3.5 py-1.5 rounded-full border border-parchment-300 dark:border-ink-800 bg-white dark:bg-ink-900 text-ink-800 dark:text-parchment-100 hover:border-turath-emerald hover:text-turath-emerald font-semibold whitespace-nowrap transition-colors shadow-2xs min-h-[32px] flex items-center gap-1.5"
            >
              <span>📚</span>
              <span>Multi-Ibarat</span>
            </button>
            <button
              onClick={() => onSendMessage("Korelasikan kasus ini dengan Qawa'id Fiqhiyyah dan Ushul Fiqh (Asybah wan Nazhair / Qawa'idul Ahkam).")}
              className="px-3.5 py-1.5 rounded-full border border-parchment-300 dark:border-ink-800 bg-white dark:bg-ink-900 text-ink-800 dark:text-parchment-100 hover:border-turath-emerald hover:text-turath-emerald font-semibold whitespace-nowrap transition-colors shadow-2xs min-h-[32px] flex items-center gap-1.5"
            >
              <span>⚖️</span>
              <span>Qawa'id</span>
            </button>
            <button
              onClick={() => onSendMessage("Susun draf taswidah resmi bahan kajian Bahtsul Masail lengkap: Judul, Deskripsi Masalah, Pertanyaan, Jawaban Berjenjang, Ibarat Berantai, dan Kesimpulan.")}
              className="px-3.5 py-1.5 rounded-full border border-parchment-300 dark:border-ink-800 bg-white dark:bg-ink-900 text-ink-800 dark:text-parchment-100 hover:border-turath-emerald hover:text-turath-emerald font-semibold whitespace-nowrap transition-colors shadow-2xs min-h-[32px] flex items-center gap-1.5"
            >
              <span>📜</span>
              <span>Taswidah</span>
            </button>
            {messages.length > 0 && (
              <button
                onClick={onResetChat}
                className="px-3 py-1.5 rounded-full border border-rose-200 dark:border-rose-900/40 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 whitespace-nowrap transition-colors flex items-center gap-1 font-semibold text-xs min-h-[32px]"
                title="Reset Sesi Diskusi Baru"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>

          {/* Textarea & Send Input Box */}
          <form
            onSubmit={handleSubmit}
            className="flex items-end gap-2 bg-white dark:bg-ink-900 rounded-2xl p-2.5 border border-parchment-300 dark:border-ink-800 shadow-xs focus-within:border-turath-emerald focus-within:ring-1 focus-within:ring-turath-emerald transition-all"
          >
            <textarea
              ref={textareaRef}
              rows={1}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isListening ? "Mendengarkan ucapan Anda (IDN)... silakan bicara..." : "Tuliskan masalah fiqih, pertanyaan as'ilah, atau telaah ibarat..."}
              className={`flex-1 bg-transparent px-2.5 py-1 text-[15px] sm:text-base text-ink-900 dark:text-parchment-50 placeholder-ink-400 dark:placeholder-ink-500 focus:outline-none resize-none font-serif leading-relaxed max-h-36 ${isListening ? 'placeholder-emerald-600 dark:placeholder-emerald-400' : ''}`}
            />

            {/* Tombol Dikte Suara (Speech to Text IDN) */}
            <button
              type="button"
              onClick={toggleListening}
              className={`p-3 rounded-xl transition-all shadow-xs flex-shrink-0 relative ${
                isListening
                  ? 'bg-rose-500 hover:bg-rose-600 text-white animate-pulse ring-2 ring-rose-400/50'
                  : 'bg-parchment-100 hover:bg-parchment-200 dark:bg-ink-800 dark:hover:bg-ink-700 text-ink-600 dark:text-parchment-200 border border-parchment-200 dark:border-ink-700 hover:text-turath-emerald dark:hover:text-emerald-400'
              }`}
              title={isListening ? 'Hentikan dikte suara' : 'Mulai dikte suara (Speech to Text - Bahasa Indonesia)'}
            >
              {isListening ? (
                <>
                  <MicOff className="w-4 h-4" />
                  <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-600"></span>
                  </span>
                </>
              ) : (
                <Mic className="w-4 h-4" />
              )}
            </button>

            {isStreaming ? (
              <button
                type="button"
                onClick={onStopStreaming}
                className="p-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white transition-colors shadow-xs flex-shrink-0"
                title="Hentikan respons streaming"
              >
                <Square className="w-4 h-4 fill-current" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="p-3 rounded-xl bg-turath-emerald hover:bg-turath-emerald-light disabled:opacity-40 disabled:hover:bg-turath-emerald text-parchment-50 transition-colors shadow-xs flex-shrink-0 border border-turath-gold/30"
                title="Kirim pesan (Enter)"
              >
                <Send className="w-4 h-4" />
              </button>
            )}
          </form>

          {/* Bottom Bar: Advice on desktop only to save vertical space on mobile */}
          <div className="hidden sm:flex items-center justify-between text-[11px] text-ink-400 dark:text-ink-500 font-sans px-1">
            <span>Tekan Enter untuk kirim, Shift+Enter untuk baris baru</span>
            <span className="font-arabic text-xs text-turath-emerald dark:text-emerald-400">
              والله أعلم بالصواب
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Template Parameter Popover Modal */}
      {activeTemplateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-ink-950/75 backdrop-blur-xs animate-fade-in font-sans">
          <div className="bg-white dark:bg-ink-900 border border-parchment-200 dark:border-ink-800 rounded-2xl w-full max-w-xl shadow-manuscript-lg overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="px-5 py-4 border-b border-parchment-200 dark:border-ink-800 bg-parchment-50 dark:bg-ink-950 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-turath-emerald/15 dark:bg-turath-emerald/25 text-turath-emerald flex items-center justify-center text-lg">
                  {activeTemplateModal === 'as_ilah' && '📋'}
                  {activeTemplateModal === 'muqaranah' && '⚖️'}
                  {activeTemplateModal === 'takhrij' && '🔍'}
                  {activeTemplateModal === 'putusan' && '📑'}
                </div>
                <div>
                  <h3 className="font-serif font-bold text-sm text-ink-900 dark:text-parchment-50">
                    {activeTemplateModal === 'as_ilah' && "Format As'ilah Waqi'iyyah Formal"}
                    {activeTemplateModal === 'muqaranah' && 'Komparasi 4 Mazhab (Muqāranah)'}
                    {activeTemplateModal === 'takhrij' && 'Takhrij & Validasi Hadits / Dalil'}
                    {activeTemplateModal === 'putusan' && 'Draf Taswīdah Putusan Sidang'}
                  </h3>
                  <p className="text-[11px] text-ink-500">
                    Lengkapi parameter di bawah untuk memformulasikan telaah otomatis
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveTemplateModal(null)}
                className="p-1.5 rounded-lg text-ink-400 hover:text-ink-900 dark:hover:text-parchment-100 hover:bg-parchment-200 dark:hover:bg-ink-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 overflow-y-auto text-xs flex-1">
              <div>
                <label className="block font-semibold text-ink-800 dark:text-parchment-200 mb-1">
                  {activeTemplateModal === 'takhrij' ? 'Teks Hadits / Matan / Dalil yang Ingin Divalidasi' : 'Topik / Judul Masalah'}
                </label>
                <input
                  type="text"
                  value={paramTopic}
                  onChange={(e) => setParamTopic(e.target.value)}
                  placeholder="Ketik topik atau teks dalil..."
                  className="w-full px-3 py-2 rounded-xl border border-parchment-300 dark:border-ink-700 bg-parchment-50 dark:bg-ink-950 text-xs text-ink-900 dark:text-parchment-50 focus:outline-none focus:ring-1 focus:ring-turath-emerald font-serif"
                />
              </div>

              {activeTemplateModal !== 'takhrij' && (
                <div>
                  <label className="block font-semibold text-ink-800 dark:text-parchment-200 mb-1">
                    {activeTemplateModal === 'putusan' ? 'Nama Forum / Sidang Bahtsul Masail' : 'Deskripsi Kasus & Fakta Empiris (Tashawwur Mas\'alah)'}
                  </label>
                  <textarea
                    rows={2}
                    value={paramDetails}
                    onChange={(e) => setParamDetails(e.target.value)}
                    placeholder="Jelaskan kronologi atau deskripsi kasus secara objektif..."
                    className="w-full px-3 py-2 rounded-xl border border-parchment-300 dark:border-ink-700 bg-parchment-50 dark:bg-ink-950 text-xs text-ink-900 dark:text-parchment-50 focus:outline-none focus:ring-1 focus:ring-turath-emerald leading-relaxed"
                  />
                </div>
              )}

              {activeTemplateModal === 'as_ilah' && (
                <div>
                  <label className="block font-semibold text-ink-800 dark:text-parchment-200 mb-1">
                    Pokok Pertanyaan Fiqih (As'ilah)
                  </label>
                  <textarea
                    rows={2}
                    value={paramQuestions}
                    onChange={(e) => setParamQuestions(e.target.value)}
                    placeholder="1. Bagaimana status hukumnya?&#10;2. Bagaimana batasan syar'inya?"
                    className="w-full px-3 py-2 rounded-xl border border-parchment-300 dark:border-ink-700 bg-parchment-50 dark:bg-ink-950 text-xs text-ink-900 dark:text-parchment-50 focus:outline-none focus:ring-1 focus:ring-turath-emerald leading-relaxed font-serif"
                  />
                </div>
              )}

              {activeTemplateModal === 'takhrij' && (
                <div>
                  <label className="block font-semibold text-ink-800 dark:text-parchment-200 mb-1">
                    Dugaan Kitab Sumber / Perawi (Opsional)
                  </label>
                  <input
                    type="text"
                    value={paramReference}
                    onChange={(e) => setParamReference(e.target.value)}
                    placeholder="Contoh: Shahih Bukhari, Sunan Tirmidzi, Musnad Ahmad..."
                    className="w-full px-3 py-2 rounded-xl border border-parchment-300 dark:border-ink-700 bg-parchment-50 dark:bg-ink-950 text-xs text-ink-900 dark:text-parchment-50 focus:outline-none focus:ring-1 focus:ring-turath-emerald font-serif"
                  />
                </div>
              )}

              {activeTemplateModal === 'putusan' && (
                <div>
                  <label className="block font-semibold text-ink-800 dark:text-parchment-200 mb-1">
                    Arah Putusan / Diktum Konsensus (Opsional)
                  </label>
                  <textarea
                    rows={2}
                    value={paramQuestions}
                    onChange={(e) => setParamQuestions(e.target.value)}
                    placeholder="Catatan rumusan arah jawaban sementara jika ada..."
                    className="w-full px-3 py-2 rounded-xl border border-parchment-300 dark:border-ink-700 bg-parchment-50 dark:bg-ink-950 text-xs text-ink-900 dark:text-parchment-50 focus:outline-none focus:ring-1 focus:ring-turath-emerald leading-relaxed font-serif"
                  />
                </div>
              )}

              {/* Live Preview Accordion */}
              <div className="p-3 rounded-xl bg-parchment-100/70 dark:bg-ink-950 border border-parchment-200 dark:border-ink-800 text-[11px] space-y-1">
                <span className="font-semibold text-ink-700 dark:text-parchment-300 block">
                  Pratinjau Prompt Formulasi:
                </span>
                <p className="font-mono text-ink-600 dark:text-ink-400 max-h-24 overflow-y-auto whitespace-pre-wrap leading-relaxed">
                  {buildPrompt(activeTemplateModal)}
                </p>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="px-5 py-3 border-t border-parchment-200 dark:border-ink-800 bg-parchment-50 dark:bg-ink-950 flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
              <button
                type="button"
                onClick={() => setActiveTemplateModal(null)}
                className="px-3 py-1.5 rounded-xl border border-parchment-300 dark:border-ink-700 text-ink-700 dark:text-parchment-300 hover:bg-parchment-200 dark:hover:bg-ink-800 transition-colors text-xs font-medium"
              >
                Batal
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleApplyPromptToInput}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-turath-emerald text-turath-emerald dark:text-emerald-300 hover:bg-turath-emerald/10 transition-colors text-xs font-semibold shadow-xs"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                  <span>Terapkan ke Kotak Input</span>
                </button>

                <button
                  type="button"
                  onClick={handleDirectSendFromModal}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-turath-emerald hover:bg-turath-emerald-light text-white text-xs font-semibold shadow-xs transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Langsung Jalankan AI</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
