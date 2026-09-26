import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Square, 
  Copy, 
  Check, 
  FileText, 
  Sparkles, 
  HelpCircle, 
  BookMarked, 
  ChevronDown, 
  ChevronRight,
  RotateCcw,
  ExternalLink,
  Feather
} from 'lucide-react';

export default function ChatPane({
  messages,
  isStreaming,
  onSendMessage,
  onStopStreaming,
  onResetChat,
  onTransferToTaswidah,
  matraMode,
  arabicFontSize,
  arabicFontFamily,
  selectedModel,
}) {
  const [inputText, setInputText] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const [openThoughts, setOpenThoughts] = useState({});
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  // Adjust textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
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
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCopyFormattedWord = (id, content) => {
    // Replace markdown tags to standard Word HTML or clean markdown
    const formatted = content
      .replace(/<u>\*\*【/g, '<u><b>')
      .replace(/】\*\*<\/u>/g, '</b></u>');
    navigator.clipboard.writeText(formatted);
    setCopiedId(`word-${id}`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleThought = (idx) => {
    setOpenThoughts(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  // Helper to parse <think>...</think> tags if present in streaming model responses
  const renderMessageContent = (content, msgIndex) => {
    const thinkMatch = content.match(/<think>([\s\S]*?)<\/think>/);
    let mainContent = content;
    let thoughtText = '';

    if (thinkMatch) {
      thoughtText = thinkMatch[1].trim();
      mainContent = content.replace(/<think>[\s\S]*?<\/think>/, '').trim();
    }

    // Split text into paragraphs and detect Arabic blocks
    const paragraphs = mainContent.split('\n');

    return (
      <div className="space-y-3 font-serif">
        {thoughtText && (
          <div className="mb-3 rounded-lg border border-parchment-300 dark:border-ink-800 bg-parchment-100/60 dark:bg-ink-900/60 p-2.5 text-xs text-ink-600 dark:text-ink-400 font-sans">
            <button
              onClick={() => toggleThought(msgIndex)}
              className="flex items-center gap-1.5 font-medium hover:text-ink-900 dark:hover:text-parchment-200 transition-colors w-full text-left"
            >
              {openThoughts[msgIndex] ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              <span className="flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-turath-gold" />
                <span>Nalar Ushul & Istinbath AI ({thoughtText.length} karakter)</span>
              </span>
            </button>
            {openThoughts[msgIndex] && (
              <div className="mt-2 pt-2 border-t border-parchment-200 dark:border-ink-800 whitespace-pre-wrap font-mono text-[11px] leading-relaxed text-ink-500 dark:text-ink-400">
                {thoughtText}
              </div>
            )}
          </div>
        )}

        {paragraphs.map((p, idx) => {
          if (!p.trim()) return <div key={idx} className="h-1" />;

          // Detect header
          if (p.startsWith('#')) {
            const level = p.match(/^#+/)[0].length;
            const text = p.replace(/^#+\s*/, '');
            if (level === 1) return <h2 key={idx} className="text-xl font-bold font-serif text-turath-emerald dark:text-emerald-300 mt-4 mb-2 pb-1 border-b border-parchment-200 dark:border-ink-800">{text}</h2>;
            if (level === 2) return <h3 key={idx} className="text-lg font-bold font-serif text-ink-900 dark:text-parchment-100 mt-3 mb-1.5">{text}</h3>;
            return <h4 key={idx} className="text-base font-semibold font-serif text-ink-800 dark:text-parchment-200 mt-2 mb-1">{text}</h4>;
          }

          // Detect blockquote
          if (p.startsWith('>')) {
            const quoteContent = p.replace(/^>\s*/, '');
            // Check if quote contains Arabic
            const arabicChars = (quoteContent.match(/[\u0600-\u06FF]/g) || []).length;
            const isArabic = arabicChars > 15;

            return (
              <blockquote
                key={idx}
                className={`my-2 pl-3.5 pr-2 py-1.5 border-l-3 border-turath-gold bg-parchment-100/50 dark:bg-ink-900/40 rounded-r-lg text-ink-800 dark:text-parchment-200 ${
                  isArabic 
                    ? `arabic-text ${arabicFontFamily === 'scheherazade' ? 'font-scheherazade' : 'font-arabic'}` 
                    : ''
                }`}
                style={isArabic ? { fontSize: `${arabicFontSize}px` } : undefined}
                dangerouslySetInnerHTML={{
                  __html: formatTextToHtml(quoteContent),
                }}
              />
            );
          }

          // Check if normal paragraph contains predominantly Arabic
          const arabicCount = (p.match(/[\u0600-\u06FF]/g) || []).length;
          const isArabic = arabicCount > 20 && (arabicCount / p.length > 0.4);

          return (
            <p
              key={idx}
              className={`leading-relaxed text-ink-800 dark:text-parchment-100 ${
                isArabic 
                  ? `arabic-text ${arabicFontFamily === 'scheherazade' ? 'font-scheherazade' : 'font-arabic'}` 
                  : 'text-[15px]'
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

  // Convert highlights and bold in markdown to safe HTML
  const formatTextToHtml = (text) => {
    return text
      // Mahallus syahid highlight
      .replace(/<u>\*\*【(.*?)】\*\*<\/u>/g, '<u class="mahallus-syahid"><strong>【 $1 】</strong></u>')
      .replace(/【(.*?)】/g, '<span class="mahallus-syahid">【 $1 】</span>')
      // Bold
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Italic
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // Code
      .replace(/`(.*?)`/g, '<code class="px-1 py-0.5 rounded bg-parchment-200 dark:bg-ink-800 text-xs font-mono">$1</code>');
  };

  const samplePrompts = [
    {
      title: "Hukum Biaya Layanan & Bunga PayLater",
      matra: "Wāqi'iyyah",
      prompt: "Bagaimana hukum penggunaan fitur PayLater dalam transaksi e-commerce kontemporer? Tinjau dari akad qardh, bai' bithaman ajil, serta status denda keterlambatan menurut qaul mu'tamad madzhab Syafi'i.",
    },
    {
      title: "Konsep Muwathanah & Kerukunan Bernegara",
      matra: "Maudlū'iyyah",
      prompt: "Uraikan konsep fiqh muwathanah (kewarganegaraan modern) dalam pandangan Islam dan keputusan Munas Alim Ulama NU. Bagaimana relasi muslim dan non-muslim dalam bingkai negara kesepakatan (darul mitsaq)?",
    },
    {
      title: "Pajak Karbon & Regulasi Lingkungan",
      matra: "Qānūniyyah",
      prompt: "Bagaimana tinjauan fiqh siyasah syar'iyyah terhadap kebijakan pemerintah mengenai penerapan Pajak Karbon untuk mitigasi krisis iklim? Hubungkan dengan kaidah Tasharruful Imam manuthun bil maslahah.",
    },
    {
      title: "Fidyah Shalat Bagi Mayit",
      matra: "Wāqi'iyyah",
      prompt: "Jelaskan khilaf ulama Syafi'iyyah mengenai fidyah shalat bagi orang yang meninggal dunia dan masih memiliki tanggungan shalat. Sajikan ibarat dari Al-Majmu', Tuhfah, dan Hawasyi.",
    },
  ];

  return (
    <div className="flex flex-col h-full bg-parchment-50 dark:bg-ink-950 transition-colors">
      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-6">
        {messages.length === 0 ? (
          /* Empty State / Welcome Screen */
          <div className="max-w-2xl mx-auto py-8 text-center space-y-6">
            <div className="inline-flex p-4 rounded-2xl bg-turath-emerald/10 dark:bg-turath-emerald/20 text-turath-emerald dark:text-emerald-400 border border-turath-emerald/30 shadow-inner">
              <Feather className="w-10 h-10 text-turath-emerald dark:text-emerald-300" />
            </div>

            <div className="space-y-2">
              <h2 className="font-serif font-bold text-2xl sm:text-3xl text-ink-900 dark:text-parchment-50">
                Maktabah & Studio Bahtsu Klangopan
              </h2>
              <p className="font-arabic text-lg text-turath-emerald dark:text-emerald-400">
                مُسَاعِدُ بَحْثِ الْمَسَائِلِ عَلَى مَنْهَجِ عُلَمَاءِ أَهْلِ السُّنَّةِ وَالْجَمَاعَةِ
              </p>
              <p className="text-sm text-ink-600 dark:text-ink-400 max-w-lg mx-auto font-sans leading-relaxed">
                Asisten perumus bahan kajian Bahtsul Masail berstandar resmi Munas & Konbes NU. Siap menyajikan multi-ibarat mu'tamadah, penyorotan titik temu hukum, dan draf taswidah ilmiah.
              </p>
            </div>

            {/* Prompt Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left pt-4 font-sans">
              {samplePrompts.map((sample, idx) => (
                <button
                  key={idx}
                  onClick={() => onSendMessage(sample.prompt)}
                  className="p-3.5 rounded-xl border border-parchment-200 dark:border-ink-800 bg-white dark:bg-ink-900 hover:border-turath-emerald dark:hover:border-emerald-600 transition-all shadow-sm hover:shadow-md group flex flex-col justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-ink-900 dark:text-parchment-100 group-hover:text-turath-emerald dark:group-hover:text-emerald-300 transition-colors">
                        {sample.title}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-parchment-100 dark:bg-ink-800 text-ink-500 dark:text-ink-400 font-medium">
                        {sample.matra}
                      </span>
                    </div>
                    <p className="text-xs text-ink-500 dark:text-ink-400 line-clamp-2 leading-relaxed">
                      {sample.prompt}
                    </p>
                  </div>
                  <div className="mt-3 flex items-center gap-1 text-[11px] text-turath-emerald dark:text-emerald-400 font-medium">
                    <span>Mulai Telaah Masalah</span>
                    <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </button>
              ))}
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
                className={`flex gap-3 sm:gap-4 max-w-3xl ${
                  isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'
                }`}
              >
                {/* Avatar Icon */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold shadow-sm ${
                    isUser
                      ? 'bg-ink-800 text-parchment-50 dark:bg-parchment-200 dark:text-ink-900'
                      : 'bg-turath-emerald text-parchment-50 border border-turath-gold/40'
                  }`}
                >
                  {isUser ? 'U' : 'BK'}
                </div>

                {/* Message Body Bubble */}
                <div
                  className={`flex-1 rounded-2xl p-4 sm:p-5 shadow-sm border ${
                    isUser
                      ? 'bg-turath-emerald text-parchment-50 border-turath-emerald-deep font-sans rounded-tr-sm'
                      : 'bg-card-parchment dark:bg-ink-900 border-parchment-200 dark:border-ink-800 text-ink-900 dark:text-parchment-50 rounded-tl-sm'
                  }`}
                >
                  {/* Sender & Timestamp Header */}
                  <div className="flex items-center justify-between text-[11px] mb-2 font-sans opacity-70 border-b border-current pb-1.5">
                    <span className="font-semibold tracking-wide">
                      {isUser ? 'Musyawirin / Pengkaji' : 'Tim Asistensi Bahtsu Klangopan'}
                    </span>
                    {!isUser && (
                      <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-turath-gold/10 text-turath-gold">
                        {selectedModel || 'AI Model'}
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
                  {!isUser && (
                    <div className="mt-4 pt-3 border-t border-parchment-200 dark:border-ink-800 flex flex-wrap items-center justify-between gap-2 text-xs font-sans">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => onTransferToTaswidah(msg.content)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-turath-emerald-soft dark:bg-turath-emerald-dark-soft text-turath-emerald dark:text-emerald-300 hover:bg-turath-emerald hover:text-white transition-all font-medium"
                          title="Ekstrak kutipan dan masukkan ke Panel Draf Taswidah"
                        >
                          <BookMarked className="w-3.5 h-3.5" />
                          <span>Ekstrak ke Taswīdah</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleCopyFormattedWord(index, msg.content)}
                          className="flex items-center gap-1 px-2 py-1 rounded hover:bg-parchment-200 dark:hover:bg-ink-800 text-ink-600 dark:text-ink-400 transition-colors"
                          title="Salin dengan tanda format Word / Capacities"
                        >
                          {copiedId === `word-${index}` ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="text-emerald-600 font-medium">Tersalin!</span>
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
      <div className="border-t border-parchment-200 dark:border-ink-800 bg-parchment-50/95 dark:bg-ink-950/95 p-3 sm:p-4 backdrop-blur-md">
        <div className="max-w-4xl mx-auto space-y-2">
          {/* Quick Action Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-sans no-scrollbar">
            <button
              onClick={() => onSendMessage("Formulasikan deskripsi masalah ini menjadi as'ilah (pertanyaan hukum) yang presisi sesuai standar bahtsul masail.")}
              className="px-2.5 py-1 rounded-full border border-parchment-300 dark:border-ink-800 bg-white dark:bg-ink-900 text-ink-700 dark:text-parchment-200 hover:border-turath-emerald hover:text-turath-emerald whitespace-nowrap transition-colors"
            >
              📝 Formulasi As'ilah
            </button>
            <button
              onClick={() => onSendMessage("Carikan minimal 3-5 ibarat dari kitab Syafi'iyyah (Syaikhoni & Hawasyi) yang sharih membahas masalah ini beserta wajhul istidlal-nya.")}
              className="px-2.5 py-1 rounded-full border border-parchment-300 dark:border-ink-800 bg-white dark:bg-ink-900 text-ink-700 dark:text-parchment-200 hover:border-turath-emerald hover:text-turath-emerald whitespace-nowrap transition-colors"
            >
              📚 Multi-Ibarat Syafi'iyyah
            </button>
            <button
              onClick={() => onSendMessage("Korelasikan kasus ini dengan Qawa'id Fiqhiyyah dan Ushul Fiqh (Asybah wan Nazhair / Qawa'idul Ahkam).")}
              className="px-2.5 py-1 rounded-full border border-parchment-300 dark:border-ink-800 bg-white dark:bg-ink-900 text-ink-700 dark:text-parchment-200 hover:border-turath-emerald hover:text-turath-emerald whitespace-nowrap transition-colors"
            >
              ⚖️ Qawa'id Fiqhiyyah
            </button>
            <button
              onClick={() => onSendMessage("Susun draf taswidah resmi bahan kajian Bahtsul Masail lengkap: Judul, Deskripsi Masalah, Pertanyaan, Jawaban Berjenjang, Ibarat Berantai, dan Kesimpulan.")}
              className="px-2.5 py-1 rounded-full border border-parchment-300 dark:border-ink-800 bg-white dark:bg-ink-900 text-ink-700 dark:text-parchment-200 hover:border-turath-emerald hover:text-turath-emerald whitespace-nowrap transition-colors"
            >
              📜 Susun Draf Taswidah
            </button>
            {messages.length > 0 && (
              <button
                onClick={onResetChat}
                className="px-2.5 py-1 rounded-full border border-rose-200 dark:border-rose-900/40 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 whitespace-nowrap transition-colors flex items-center gap-1"
                title="Reset Sesi Diskusi Baru"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Sesi</span>
              </button>
            )}
          </div>

          {/* Textarea & Send Input Box */}
          <form
            onSubmit={handleSubmit}
            className="flex items-end gap-2 bg-white dark:bg-ink-900 rounded-2xl p-2 border border-parchment-300 dark:border-ink-800 shadow-sm focus-within:border-turath-emerald focus-within:ring-1 focus-within:ring-turath-emerald transition-all"
          >
            <textarea
              ref={textareaRef}
              rows={1}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Tuliskan masalah fiqih, pertanyaan as'ilah, atau paste teks ibarat yang ingin ditelaah..."
              className="flex-1 bg-transparent px-2 py-1 text-sm text-ink-900 dark:text-parchment-50 placeholder-ink-400 dark:placeholder-ink-500 focus:outline-none resize-none font-serif leading-relaxed max-h-44"
            />

            {isStreaming ? (
              <button
                type="button"
                onClick={onStopStreaming}
                className="p-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white transition-colors shadow-sm flex-shrink-0"
                title="Hentikan respons streaming"
              >
                <Square className="w-4 h-4 fill-current" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={!inputText.trim()}
                className="p-2.5 rounded-xl bg-turath-emerald hover:bg-turath-emerald-light disabled:opacity-40 disabled:hover:bg-turath-emerald text-parchment-50 transition-colors shadow-sm flex-shrink-0 border border-turath-gold/30"
                title="Kirim pesan (Enter)"
              >
                <Send className="w-4 h-4" />
              </button>
            )}
          </form>

          <div className="flex items-center justify-between text-[11px] text-ink-500 dark:text-ink-400 font-sans px-1">
            <span>Tekan <kbd className="px-1 py-0.5 rounded bg-parchment-200 dark:bg-ink-800 font-mono text-[10px]">Enter</kbd> untuk kirim, <kbd className="px-1 py-0.5 rounded bg-parchment-200 dark:bg-ink-800 font-mono text-[10px]">Shift+Enter</kbd> untuk baris baru</span>
            <span className="font-arabic text-xs text-turath-emerald dark:text-emerald-400">والله أعلم بالصواب</span>
          </div>
        </div>
      </div>
    </div>
  );
}
