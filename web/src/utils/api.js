const API_BASE = '/api';

export function getAuthToken() {
  return localStorage.getItem('bahtsu_passcode') || '';
}

export function setAuthToken(token) {
  localStorage.setItem('bahtsu_passcode', token);
}

export function clearAuthToken() {
  localStorage.removeItem('bahtsu_passcode');
}

export async function login(passcode) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ passcode }),
  });
  const data = await res.json();
  if (data.ok && data.token) {
    setAuthToken(data.token);
  }
  return data;
}

export async function checkStatus() {
  try {
    const res = await fetch(`${API_BASE}/status`, {
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
      },
    });
    if (!res.ok) return { ok: false };
    return await res.json();
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

export async function streamChat({ messages, model, matraMode, temperature = 0.3, onChunk, onError, onFinish, signal }) {
  try {
    const token = getAuthToken();
    const res = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        messages,
        model,
        matraMode,
        temperature,
      }),
      signal,
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(errJson.error || `HTTP ${res.status}`);
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';
    let inThinkTag = false;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || ''; // Keep partial line

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith(':')) continue; // Skip keep-alives or comments

        if (trimmed.startsWith('data: ')) {
          const payload = trimmed.slice(6);
          if (payload === '[DONE]') {
            continue;
          }
          try {
            const parsed = JSON.parse(payload);
            const deltaObj = parsed.choices?.[0]?.delta || {};
            const reasoning = deltaObj.reasoning_content || deltaObj.thought || '';
            const content = deltaObj.content || '';

            if (reasoning) {
              if (!inThinkTag) {
                inThinkTag = true;
                if (onChunk) onChunk('<think>' + reasoning);
              } else {
                if (onChunk) onChunk(reasoning);
              }
            }

            if (content) {
              if (inThinkTag) {
                inThinkTag = false;
                if (onChunk) onChunk('</think>\n\n' + content);
              } else {
                if (onChunk) onChunk(content);
              }
            }
          } catch (e) {
            // Ignore partial JSON parse errors in streaming
          }
        }
      }
    }

    if (inThinkTag) {
      inThinkTag = false;
      if (onChunk) onChunk('</think>\n\n');
    }

    if (onFinish) onFinish();
  } catch (err) {
    if (err.name === 'AbortError') {
      if (onFinish) onFinish();
      return;
    }
    if (onError) onError(err);
  }
}

export async function searchTurath(query, category = null, limit = 6) {
  try {
    let url = `${API_BASE}/turath/search?q=${encodeURIComponent(query)}&limit=${limit}`;
    if (category) {
      url += `&category=${category}`;
    }
    const res = await fetch(url);
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(err.error || 'Gagal mencari di Turath.io');
    }
    return await res.json();
  } catch (err) {
    return { ok: false, error: err.message, results: [] };
  }
}

export async function getKajianList() {
  try {
    const res = await fetch(`${API_BASE}/kajian`, {
      headers: { 'Authorization': `Bearer ${getAuthToken()}` },
    });
    if (!res.ok) return { ok: false, files: [] };
    return await res.json();
  } catch (err) {
    return { ok: false, files: [] };
  }
}

export async function getKajianContent(filename) {
  try {
    const res = await fetch(`${API_BASE}/kajian/${encodeURIComponent(filename)}`, {
      headers: { 'Authorization': `Bearer ${getAuthToken()}` },
    });
    if (!res.ok) return { ok: false };
    return await res.json();
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

export async function saveKajian({ title, slug, content, model, matraMode }) {
  try {
    const res = await fetch(`${API_BASE}/kajian/save`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify({ title, slug, content, model, matraMode }),
    });
    return await res.json();
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

export async function syncKajianFromGitHub() {
  try {
    const res = await fetch(`${API_BASE}/kajian/sync-github`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`,
      },
    });
    return await res.json();
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

// 9Router Remote Control Client API
export async function getRouterOverview() {
  try {
    const res = await fetch(`${API_BASE}/9router/overview`, {
      headers: { 'Authorization': `Bearer ${getAuthToken()}` },
    });
    if (!res.ok) return { ok: false, error: `HTTP ${res.status}` };
    return await res.json();
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

export async function toggleRouterAccount(id, isActive) {
  try {
    const res = await fetch(`${API_BASE}/9router/toggle-account`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify({ id, isActive }),
    });
    return await res.json();
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

export async function pingRouterModel(model) {
  try {
    const res = await fetch(`${API_BASE}/9router/ping-model`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`,
      },
      body: JSON.stringify({ model }),
    });
    return await res.json();
  } catch (err) {
    return { ok: false, error: err.message, latency: 0 };
  }
}

