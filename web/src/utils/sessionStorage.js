/**
 * Session & Persistence Manager untuk Bahtsu Klangopan
 * Menyimpan riwayat obrolan dan draf taswidah secara otomatis ke localStorage
 * sehingga data tidak hilang saat refresh, tutup tab, atau berpindah sesi.
 */

const STORAGE_KEY_SESSIONS = 'bahtsu_sessions_v1';
const STORAGE_KEY_ACTIVE_ID = 'bahtsu_active_session_id';

function cleanSessionMessages(session) {
  if (!session || !Array.isArray(session.messages)) return session;
  return {
    ...session,
    messages: session.messages.filter(m => m.role !== 'assistant' || (m.content && m.content.trim().length > 0))
  };
}

export function getAllSessions() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SESSIONS);
    const sessions = raw ? JSON.parse(raw) : [];
    return sessions.map(cleanSessionMessages);
  } catch (err) {
    console.error('Gagal membaca riwayat sesi:', err);
    return [];
  }
}

export function saveAllSessions(sessions) {
  try {
    localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(sessions));
  } catch (err) {
    console.error('Gagal menyimpan riwayat sesi:', err);
  }
}

export function getActiveSessionId() {
  return localStorage.getItem(STORAGE_KEY_ACTIVE_ID) || null;
}

export function setActiveSessionId(id) {
  if (id) {
    localStorage.setItem(STORAGE_KEY_ACTIVE_ID, id);
  } else {
    localStorage.removeItem(STORAGE_KEY_ACTIVE_ID);
  }
}

export function createNewSession(initialTitle = 'Telaah Masalah Baru', matraMode = 'waqi_iyyah', model = 'ag/gemini-3.8-flash-high') {
  const newSession = {
    id: `session-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    title: initialTitle,
    matraMode,
    model,
    messages: [],
    taswidahContent: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const sessions = getAllSessions();
  sessions.unshift(newSession);
  saveAllSessions(sessions);
  setActiveSessionId(newSession.id);

  return newSession;
}

export function saveCurrentSessionState({ id, title, matraMode, model, messages, taswidahContent }) {
  if (!id) return;

  const sessions = getAllSessions();
  const index = sessions.findIndex(s => s.id === id);

  // Auto-generate title from first user message if title is still default
  let derivedTitle = title;
  if ((!title || title === 'Telaah Masalah Baru') && messages && messages.length > 0) {
    const firstUserMsg = messages.find(m => m.role === 'user');
    if (firstUserMsg && firstUserMsg.content) {
      derivedTitle = firstUserMsg.content.substring(0, 50).trim() + (firstUserMsg.content.length > 50 ? '...' : '');
    }
  }

  const safeMessages = (messages || []).filter(
    (m, idx) => !(m.role === 'assistant' && !m.content?.trim() && idx === messages.length - 1)
  );

  const updatedSession = {
    id,
    title: derivedTitle || 'Telaah Masalah Bahtsu',
    matraMode: matraMode || 'waqi_iyyah',
    model: model || 'ag/gemini-3.8-flash-high',
    messages: safeMessages,
    taswidahContent: taswidahContent || '',
    updatedAt: new Date().toISOString(),
  };

  if (index >= 0) {
    sessions[index] = { ...sessions[index], ...updatedSession };
  } else {
    sessions.unshift(updatedSession);
  }

  saveAllSessions(sessions);
}

export function getActiveSessionOrDefault() {
  const activeId = getActiveSessionId();
  const sessions = getAllSessions();

  if (activeId) {
    const found = sessions.find(s => s.id === activeId);
    if (found) return found;
  }

  if (sessions.length > 0) {
    setActiveSessionId(sessions[0].id);
    return sessions[0];
  }

  return createNewSession();
}

export function deleteSessionById(id) {
  let sessions = getAllSessions();
  sessions = sessions.filter(s => s.id !== id);
  saveAllSessions(sessions);

  if (getActiveSessionId() === id) {
    if (sessions.length > 0) {
      setActiveSessionId(sessions[0].id);
    } else {
      setActiveSessionId(null);
    }
  }
}
