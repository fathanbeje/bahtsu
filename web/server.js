import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import http from 'http';
import https from 'https';
import { exec } from 'child_process';
import util from 'util';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const execAsync = util.promisify(exec);

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Configuration defaults (can be overridden via .env)
const ROUTER_URL = process.env.ROUTER_URL || 'http://127.0.0.1:20128/v1';
const ROUTER_API_KEY = process.env.ROUTER_API_KEY || 'sk-b0435a91b1afbc70-18t4z6-be53e7b7';
const MASTER_PASSCODE = process.env.MASTER_PASSCODE || 'klangopan2026';
const DEFAULT_MODEL = process.env.DEFAULT_MODEL || 'ag/gemini-3.8-flash-high';

const KAJIAN_DIR = path.resolve(__dirname, '../kajian');
const SKILL_FILE = path.resolve(__dirname, '../SKILL.md');

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Ensure kajian directory exists
if (!fs.existsSync(KAJIAN_DIR)) {
  fs.mkdirSync(KAJIAN_DIR, { recursive: true });
}

// Simple Auth Middleware
function checkAuth(req, res, next) {
  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  const customHeader = req.headers['x-passcode'] || '';

  if (token === MASTER_PASSCODE || customHeader === MASTER_PASSCODE) {
    return next();
  }
  return res.status(401).json({ ok: false, error: 'Passcode tidak valid atau sesi telah berakhir.' });
}

// Login route
app.post('/api/auth/login', (req, res) => {
  const { passcode } = req.body;
  if (passcode === MASTER_PASSCODE) {
    return res.json({ ok: true, token: MASTER_PASSCODE });
  }
  return res.status(401).json({ ok: false, error: 'Passcode salah. Silakan masukkan passcode Bahtsu Klangopan yang benar.' });
});

// System Status & Router connectivity
app.get('/api/status', async (req, res) => {
  let routerConnected = false;
  let availableModels = [];

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const checkRes = await fetch(`${ROUTER_URL}/models`, {
      headers: {
        'Authorization': `Bearer ${ROUTER_API_KEY}`,
      },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (checkRes.ok) {
      routerConnected = true;
      const data = await checkRes.json();
      if (data && Array.isArray(data.data)) {
        availableModels = data.data.map(m => m.id);
      }
    }
  } catch (err) {
    routerConnected = false;
  }

  res.json({
    ok: true,
    name: 'Bahtsu Klangopan',
    routerConnected,
    routerUrl: ROUTER_URL,
    defaultModel: DEFAULT_MODEL,
    availableModels,
    kajianCount: fs.existsSync(KAJIAN_DIR) ? fs.readdirSync(KAJIAN_DIR).filter(f => f.endsWith('.md')).length : 0,
  });
});

const ROUTER_DB_PATH = process.env.ROUTER_DB_PATH || '/home/hermes/.9router/db/data.sqlite';

// 9Router Remote Control - Overview & Telemetry
app.get('/api/9router/overview', checkAuth, async (req, res) => {
  const startTime = Date.now();
  let routerConnected = false;
  let latencyMs = 0;
  let availableModels = [];

  // 1. Measure ping latency and check connectivity
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);

    const checkRes = await fetch(`${ROUTER_URL}/models`, {
      headers: {
        'Authorization': `Bearer ${ROUTER_API_KEY}`,
      },
      signal: controller.signal,
    });
    clearTimeout(timeout);
    latencyMs = Date.now() - startTime;

    if (checkRes.ok) {
      routerConnected = true;
      const data = await checkRes.json();
      if (data && Array.isArray(data.data)) {
        availableModels = data.data.map(m => m.id);
      }
    }
  } catch (err) {
    routerConnected = false;
  }

  // 2. Fetch Provider Accounts & Today's Usage from 9Router SQLite DB
  let accounts = [];
  let usageToday = null;
  let hasDbAccess = false;

  if (fs.existsSync(ROUTER_DB_PATH)) {
    try {
      hasDbAccess = true;
      // Fetch provider connections with their metadata (data column)
      const { stdout: accStdout } = await execAsync(
        `sqlite3 -json "${ROUTER_DB_PATH}" "SELECT id, provider, authType, name, email, isActive, priority, updatedAt, data FROM providerConnections ORDER BY priority ASC, name ASC;"`,
        { timeout: 4000 }
      );
      if (accStdout && accStdout.trim()) {
        const rawAccounts = JSON.parse(accStdout.trim());
        accounts = rawAccounts.map(acc => {
          let parsedData = {};
          try {
            parsedData = JSON.parse(acc.data || '{}');
          } catch (e) {}

          return {
            id: acc.id,
            provider: acc.provider,
            authType: acc.authType,
            name: acc.name,
            email: acc.email,
            isActive: acc.isActive,
            priority: acc.priority,
            updatedAt: acc.updatedAt,
            testStatus: parsedData.testStatus || 'active',
            expiresAt: parsedData.expiresAt || null,
            lastRefreshAt: parsedData.lastRefreshAt || null,
            projectId: parsedData.projectId || 'aicode-consumers',
          };
        });
      }

      // Fetch today's or latest usage row
      const todayKey = new Date().toISOString().split('T')[0];
      const { stdout: usageStdout } = await execAsync(
        `sqlite3 -json "${ROUTER_DB_PATH}" "SELECT dateKey, data FROM usageDaily ORDER BY dateKey DESC LIMIT 1;"`,
        { timeout: 4000 }
      );
      if (usageStdout && usageStdout.trim()) {
        const usageRows = JSON.parse(usageStdout.trim());
        if (usageRows.length > 0 && usageRows[0].data) {
          usageToday = JSON.parse(usageRows[0].data);
          usageToday.dateKey = usageRows[0].dateKey;
        }
      }
    } catch (dbErr) {
      console.warn('Error reading 9Router sqlite:', dbErr.message);
    }
  }

  // Fallback data if DB is not present
  if (accounts.length === 0) {
    accounts = [
      { id: 'ag-fathanbejo', provider: 'antigravity', name: 'Antigravity (fathanbejo@gmail.com)', email: 'fathanbejo@gmail.com', isActive: 1, priority: 1, testStatus: 'active' },
      { id: 'ag-fathanbeje', provider: 'antigravity', name: 'Antigravity (fathanbeje@gmail.com)', email: 'fathanbeje@gmail.com', isActive: 1, priority: 1, testStatus: 'active' },
      { id: 'ag-mia02database', provider: 'antigravity', name: 'Antigravity (mia02database@gmail.com)', email: 'mia02database@gmail.com', isActive: 1, priority: 1, testStatus: 'active' },
      { id: 'ag-mia02sgs', provider: 'antigravity', name: 'Antigravity (mia02sgs@gmail.com)', email: 'mia02sgs@gmail.com', isActive: 1, priority: 1, testStatus: 'active' },
    ];
  }

  // Standard limits for Google Gemini Free/Consumer tier on Antigravity
  const GEMINI_DAILY_REQUEST_LIMIT = 1500;
  const GEMINI_RPM_LIMIT = 15;
  const GEMINI_TPM_LIMIT = 1000000;

  const enrichedAccounts = accounts.map(acc => {
    const accUsage = usageToday?.byAccount?.[acc.id] || {};
    const requestsUsed = accUsage.requests || 0;
    const promptTokens = accUsage.promptTokens || 0;
    const completionTokens = accUsage.completionTokens || 0;
    const totalTokens = promptTokens + completionTokens;
    const cachedTokens = accUsage.cachedTokens || 0;
    const cost = accUsage.cost || 0;

    const requestsRemaining = Math.max(0, GEMINI_DAILY_REQUEST_LIMIT - requestsUsed);
    const quotaPercent = Math.max(0, Math.min(100, Math.round((requestsRemaining / GEMINI_DAILY_REQUEST_LIMIT) * 100)));

    return {
      ...acc,
      quota: {
        dailyLimit: GEMINI_DAILY_REQUEST_LIMIT,
        rpmLimit: GEMINI_RPM_LIMIT,
        tpmLimit: GEMINI_TPM_LIMIT,
        requestsUsed,
        requestsRemaining,
        quotaPercent,
        promptTokens,
        completionTokens,
        totalTokens,
        cachedTokens,
        cost,
        resetWindow: '00:00 UTC / 07:00 WIB',
      }
    };
  });

  const totalPoolLimit = enrichedAccounts.length * GEMINI_DAILY_REQUEST_LIMIT;
  const totalPoolUsed = enrichedAccounts.reduce((sum, a) => sum + (a.quota?.requestsUsed || 0), 0);
  const totalPoolRemaining = Math.max(0, totalPoolLimit - totalPoolUsed);
  const poolPercentRemaining = totalPoolLimit > 0 ? Math.round((totalPoolRemaining / totalPoolLimit) * 100) : 100;

  res.json({
    ok: true,
    routerConnected,
    latencyMs,
    routerUrl: ROUTER_URL,
    defaultModel: DEFAULT_MODEL,
    hasDbAccess,
    accounts: enrichedAccounts,
    poolSummary: {
      totalAccounts: enrichedAccounts.length,
      activeAccounts: enrichedAccounts.filter(a => a.isActive === 1).length,
      totalPoolLimit,
      totalPoolUsed,
      totalPoolRemaining,
      poolPercentRemaining,
    },
    usageToday,
    availableModels,
    webConsoleUrl: 'http://103.177.95.140:20128',
    masterKeyMasked: `${ROUTER_API_KEY.substring(0, 10)}...${ROUTER_API_KEY.substring(ROUTER_API_KEY.length - 6)}`,
  });
});

// 9Router Remote Control - Toggle Account Node Active State
app.post('/api/9router/toggle-account', checkAuth, async (req, res) => {
  const { id, isActive } = req.body;
  if (!id || typeof isActive === 'undefined') {
    return res.status(400).json({ ok: false, error: 'Parameter id dan isActive wajib diisi.' });
  }

  const newActiveVal = isActive ? 1 : 0;

  if (fs.existsSync(ROUTER_DB_PATH)) {
    try {
      await execAsync(
        `sqlite3 "${ROUTER_DB_PATH}" "UPDATE providerConnections SET isActive = ${newActiveVal}, updatedAt = datetime('now') WHERE id = '${id.replace(/'/g, "''")}';"`,
        { timeout: 4000 }
      );
      return res.json({ ok: true, id, isActive: newActiveVal, message: `Akun ${id} berhasil di-${newActiveVal ? 'aktifkan' : 'nonaktifkan'}.` });
    } catch (err) {
      return res.status(500).json({ ok: false, error: `Gagal mengubah status di database 9Router: ${err.message}` });
    }
  }

  return res.json({ ok: true, id, isActive: newActiveVal, message: `(Mock) Akun ${id} berhasil diperbarui.` });
});

// 9Router Remote Control - Quick Ping Latency Test
app.post('/api/9router/ping-model', checkAuth, async (req, res) => {
  const { model } = req.body;
  const targetModel = model || DEFAULT_MODEL;
  const start = Date.now();

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);

    const testRes = await fetch(`${ROUTER_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ROUTER_API_KEY}`,
      },
      body: JSON.stringify({
        model: targetModel,
        messages: [{ role: 'user', content: 'Ping' }],
        max_tokens: 2,
        temperature: 0,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    const latency = Date.now() - start;

    if (!testRes.ok) {
      const errText = await testRes.text();
      return res.json({ ok: false, model: targetModel, latency, error: `HTTP ${testRes.status}: ${errText}` });
    }

    res.json({ ok: true, model: targetModel, latency, status: 'online' });
  } catch (err) {
    const latency = Date.now() - start;
    res.json({ ok: false, model: targetModel, latency, error: err.message });
  }
});

// Load System Prompt from SKILL.md
function getSystemPrompt(matraMode = 'waqi_iyyah') {
  let basePrompt = '';
  try {
    if (fs.existsSync(SKILL_FILE)) {
      basePrompt = fs.readFileSync(SKILL_FILE, 'utf-8');
    }
  } catch (err) {
    console.error('Error reading SKILL.md:', err);
  }

  let matraDirective = '';
  if (matraMode === 'waqi_iyyah') {
    matraDirective = `
\n### [FOKUS MATRA AKTIF: MASĀ'IL WĀQI'IYYAH (KASUISTIK AKTUAL)]
Anda memfokuskan perumusan pada kasus waqi'iyyah kekinian:
1. Lakukan tahqiqul manath ('illat hukum) pada fakta empiris masalah.
2. Dahulukan pencarian nash sharih qaul mu'tamad Syafi'iyyah (Syaikhoni: Nawawi & Rafi'i, disusul Muta'akhirin).
3. Jika tidak ditemukan qaul sharih, tempuh prosedur Ilhaqul Masa'il bi Nazha'iriha (analogis furu'iyyah).
4. Soroti kalimat krusial dalil dengan format <u>**【 ... 】**</u>.
5. Uraikan Wajhul Istidlal secara jernih dan aplikatif.
`;
  } else if (matraMode === 'maudlu_iyyah') {
    matraDirective = `
\n### [FOKUS MATRA AKTIF: MASĀ'IL MAUDLŪ'IYYAH (TEMATIK KONSEPTUAL)]
Anda memfokuskan perumusan pada bahasan tematik peradaban, kebangsaan, dan sosial kemasyarakatan:
1. Terapkan pendekatan Nadhariyyatu Ta'addudil Ab'ad (Teori Multidimensi Muktamar/Munas NU).
2. Perkuat istishlahi dan Maqashid asy-Syari'ah (Hifzhud Din, Nafs, 'Aql, Nasl, Mal).
3. Sertakan tinjauan qawa'id fiqhiyyah dan ushul fiqh lintas mazhab (Muqaranah Mazhab).
4. Soroti kalimat krusial dalil dengan format <u>**【 ... 】**</u>.
`;
  } else if (matraMode === 'qanuniyyah') {
    matraDirective = `
\n### [FOKUS MATRA AKTIF: MASĀ'IL QĀNŪNIYYAH (TELAAH YURIDIS / UNDANG-UNDANG)]
Anda memfokuskan perumusan pada sinkronisasi hukum positif negara dan syariat Islam:
1. Hubungkan pasal undang-undang / regulasi terkait dengan prinsip syariah.
2. Terapkan kaidah Tasharruful Imam 'alar Ra'iyyah Manuthun bil Maslahah.
3. Telaah apakah regulasi sejalan atau berbenturan, serta tawarkan solusi maslahah 'ammah.
4. Soroti kalimat krusial dalil dengan format <u>**【 ... 】**</u>.
`;
  }

  return `${basePrompt}\n${matraDirective}\n\n[PENTING: Jangan gunakan tanda em-dash (—) di judul atau teks UI. Berikan ibarat Arab asli berharakat lengkap dengan maraji' jilid dan halaman.]`;
}

// Chat Streaming Proxy to 9Router with infinite timeout protection
app.post('/api/chat', checkAuth, async (req, res) => {
  const { messages, model, matraMode, temperature = 0.3 } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ ok: false, error: 'Pesan obrolan tidak valid.' });
  }

  const selectedModel = model || DEFAULT_MODEL;
  const systemPrompt = getSystemPrompt(matraMode);

  // Prepare OpenAI-format payload
  const formattedMessages = [
    { role: 'system', content: systemPrompt },
    ...messages.map(m => ({ role: m.role, content: m.content })),
  ];

  const payload = JSON.stringify({
    model: selectedModel,
    messages: formattedMessages,
    temperature: parseFloat(temperature),
    stream: true,
  });

  try {
    const targetUrl = new URL(`${ROUTER_URL}/chat/completions`);
    const transport = targetUrl.protocol === 'https:' ? https : http;

    // Disable client socket timeout
    if (req.socket) {
      req.socket.setTimeout(0);
      req.socket.setNoDelay(true);
      req.socket.setKeepAlive(true, 5000);
    }

    const proxyReq = transport.request(
      {
        protocol: targetUrl.protocol,
        hostname: targetUrl.hostname,
        port: targetUrl.port || (targetUrl.protocol === 'https:' ? 443 : 80),
        path: targetUrl.pathname + targetUrl.search,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${ROUTER_API_KEY}`,
          'Content-Length': Buffer.byteLength(payload),
        },
        timeout: 0, // Disable request timeout
      },
      (routerRes) => {
        if (routerRes.statusCode !== 200) {
          let errText = '';
          routerRes.on('data', chunk => { errText += chunk; });
          routerRes.on('end', () => {
            if (!res.headersSent) {
              res.status(routerRes.statusCode).json({
                ok: false,
                error: `Gagal berkomunikasi dengan 9Router (${routerRes.statusCode}): ${errText}`,
              });
            }
          });
          return;
        }

        // Set headers for Server-Sent Events (SSE)
        res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
        res.setHeader('Cache-Control', 'no-cache, no-transform');
        res.setHeader('Connection', 'keep-alive');
        res.setHeader('X-Accel-Buffering', 'no');
        if (typeof res.flushHeaders === 'function') {
          res.flushHeaders();
        }

        // Send periodic SSE comment heartbeat to keep mobile connections alive
        const heartbeat = setInterval(() => {
          if (!res.writableEnded) {
            res.write(':\n\n');
          }
        }, 4000);

        routerRes.on('data', (chunk) => {
          res.write(chunk);
        });

        routerRes.on('end', () => {
          clearInterval(heartbeat);
          res.end();
        });

        routerRes.on('error', (streamErr) => {
          clearInterval(heartbeat);
          console.error('9Router response stream error:', streamErr);
          res.end();
        });

        req.on('close', () => {
          clearInterval(heartbeat);
          proxyReq.destroy();
        });
      }
    );

    proxyReq.on('error', (err) => {
      console.error('Error connecting to 9Router:', err);
      if (!res.headersSent) {
        res.status(502).json({ ok: false, error: `Kesalahan koneksi ke 9Router: ${err.message}` });
      } else {
        res.end();
      }
    });

    proxyReq.write(payload);
    proxyReq.end();
  } catch (err) {
    console.error('Error initiating chat completion:', err);
    if (!res.headersSent) {
      res.status(500).json({ ok: false, error: `Kesalahan server streaming: ${err.message}` });
    } else {
      res.end();
    }
  }
});

// Turath.io API Search Proxy
app.get('/api/turath/search', async (req, res) => {
  const { q, category, limit = 5 } = req.query;

  if (!q) {
    return res.status(400).json({ ok: false, error: 'Kueri pencarian wajib diisi.' });
  }

  try {
    let url = `https://api.turath.io/search?q=${encodeURIComponent(q)}&v=3`;
    if (category) {
      url += `&cat_id=${encodeURIComponent(category)}`;
    }

    const turathRes = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Bahtsu-Klangopan/1.0',
        'Accept': 'application/json',
      },
    });

    if (!turathRes.ok) {
      return res.status(turathRes.status).json({
        ok: false,
        error: `Gagal mengakses Turath.io API: ${turathRes.statusText}`,
      });
    }

    const data = await turathRes.json();
    const pages = data.pages || [];

    const results = pages.slice(0, parseInt(limit, 10)).map(item => {
      const snippetClean = (item.text || '')
        .replace(/<span[^>]*>/gi, '')
        .replace(/<\/span>/gi, '')
        .replace(/<em>/gi, '**')
        .replace(/<\/em>/gi, '**')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .trim();

      return {
        id: item.id,
        bookId: item.book_id,
        bookName: item.book?.name || item.book_name || 'Kitab Turats',
        authorName: item.book?.author?.name || item.author_name || 'Ulama Salaf',
        volume: item.volume || 1,
        page: item.page || item.page_number || 1,
        snippet: snippetClean,
        turathUrl: `https://turath.io/book/${item.book_id}?page=${item.page || 1}`,
      };
    });

    res.json({
      ok: true,
      total: data.total || results.length,
      query: q,
      results,
    });
  } catch (err) {
    console.error('Error querying Turath:', err);
    res.status(500).json({ ok: false, error: `Gagal mencari di Turath.io: ${err.message}` });
  }
});

// Helper: Extract Tema or non-generic Title from Kajian markdown
function extractTemaFromContent(content = '', fallback = '') {
  if (!content || typeof content !== 'string') return fallback || 'Draf Taswidah Bahtsul Masail';

  // 1. Look for explicit **Tema:**, **Judul:**, or **Topik:**
  const temaMatch = content.match(/\*\*(?:Tema|Judul|Topik)\s*:\*\*\s*([^\n\r]+)/i)
                 || content.match(/(?:^|\n)(?:Tema|Judul|Topik)\s*:\s*([^\n\r]+)/i);
  if (temaMatch && temaMatch[1].trim()) {
    const raw = temaMatch[1]
      .replace(/[#*`_~[\]]/g, '')
      .replace(/<[^>]*>/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    if (raw.length > 3) return raw;
  }

  // 2. Look for H1 (# ...), ignoring generic headings
  const h1Match = content.match(/^#\s+(.+)$/m);
  if (h1Match) {
    const rawH1 = h1Match[1]
      .replace(/^[^\w\s\u0600-\u06FF]+/, '')
      .replace(/[#*`_~[\]]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    const isGeneric = /draf\s+tasw[iī]dah|bahan\s+kajian\s+bahtsul|studio\s+bahtsu/i.test(rawH1);
    if (!isGeneric && rawH1.length > 3) return rawH1;
  }

  // 3. Fallback derived from filename if provided (e.g. 2026-09-26-hukum-azimat.md -> Hukum Azimat)
  if (fallback && fallback.endsWith('.md')) {
    return fallback
      .replace(/\.md$/i, '')
      .replace(/^\d{4}-\d{2}-\d{2}-/, '')
      .replace(/-/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase());
  }

  return fallback || 'Draf Taswidah Bahtsul Masail';
}

// Helper: Generate clean, concise slug from tema
function generateKajianSlug(titleOrTema = '') {
  if (!titleOrTema || typeof titleOrTema !== 'string') return 'kajian-bahtsu';

  const normalized = titleOrTema
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/['’`ʻʿ]/g, '')
    .toLowerCase();

  let clean = normalized
    .replace(/[^\w\s-]/g, ' ')
    .trim()
    .replace(/\s+/g, '-');

  const parts = clean.split('-').filter(Boolean);
  let relevantParts = parts;
  if (parts.length > 3 && (parts[0] === 'draf' || parts[0] === 'taswidah')) {
    relevantParts = parts.filter(p => !['draf', 'taswidah', 'bahan', 'kajian', 'bahtsul', 'masail', 'dan'].includes(p));
    if (relevantParts.length === 0) relevantParts = parts;
  }

  if (relevantParts.length > 7) {
    relevantParts = relevantParts.slice(0, 7);
  }

  let result = relevantParts.join('-');
  if (result.length > 55) {
    result = result.substring(0, 55).replace(/-[^-]*$/, '');
  }

  return result || 'kajian-bahtsu';
}

// Kajian Repository - List all files with true Tema, metadata, and full content for instant search
app.get('/api/kajian', checkAuth, (req, res) => {
  try {
    const files = fs.readdirSync(KAJIAN_DIR)
      .filter(f => f.endsWith('.md'))
      .sort()
      .reverse();

    const kajianList = files.map(filename => {
      const fullPath = path.join(KAJIAN_DIR, filename);
      const stat = fs.statSync(fullPath);
      const content = fs.readFileSync(fullPath, 'utf-8');

      // Extract true Tema from content
      const title = extractTemaFromContent(content, filename);

      // Extract metadata tags
      const matraMatch = content.match(/\*\*Klasifikasi:\*\*\s*([^\n\r]+)/i);
      const fanMatch = content.match(/\*\*Kajian Fan:\*\*\s*([^\n\r]+)/i);
      const penyusunMatch = content.match(/\*\*Penyusun Naskah:\*\*\s*([^\n\r]+)/i);
      const waktuMatch = content.match(/\*\*Waktu Penyusunan:\*\*\s*([^\n\r]+)/i);

      return {
        filename,
        title,
        size: stat.size,
        updatedAt: stat.mtime,
        matra: matraMatch ? matraMatch[1].replace(/[#*`_~[\]]/g, '').trim() : '',
        fan: fanMatch ? fanMatch[1].replace(/[#*`_~[\]]/g, '').trim() : '',
        penyusun: penyusunMatch ? penyusunMatch[1].replace(/[#*`_~[\]]/g, '').trim() : '',
        waktu: waktuMatch ? waktuMatch[1].replace(/[#*`_~[\]]/g, '').trim() : '',
        content, // Include full content for instantaneous client-side full-text search!
      };
    });

    res.json({ ok: true, files: kajianList });
  } catch (err) {
    res.status(500).json({ ok: false, error: `Gagal membaca repositori kajian: ${err.message}` });
  }
});

// Kajian Repository - Get single file
app.get('/api/kajian/:filename', checkAuth, (req, res) => {
  const { filename } = req.params;
  const safeFilename = path.basename(filename);
  const fullPath = path.join(KAJIAN_DIR, safeFilename);

  if (!fs.existsSync(fullPath)) {
    return res.status(404).json({ ok: false, error: 'Berkas kajian tidak ditemukan.' });
  }

  try {
    const content = fs.readFileSync(fullPath, 'utf-8');
    const title = extractTemaFromContent(content, safeFilename);
    res.json({ ok: true, filename: safeFilename, title, content });
  } catch (err) {
    res.status(500).json({ ok: false, error: `Gagal membaca isi berkas: ${err.message}` });
  }
});

// Kajian Repository - Save new kajian & auto-push to git
app.post('/api/kajian/save', checkAuth, async (req, res) => {
  const { title, slug, content, model, matraMode } = req.body;

  if (!content) {
    return res.status(400).json({ ok: false, error: 'Konten kajian tidak boleh kosong.' });
  }

  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];

  // Resolve best Tema and Slug
  const extractedTema = extractTemaFromContent(content);
  const finalTitle = (title && !/draf\s+tasw[iī]dah/i.test(title)) ? title : extractedTema;
  
  let finalSlug = slug;
  if (!finalSlug || finalSlug.startsWith('draf-taswidah')) {
    finalSlug = generateKajianSlug(finalTitle);
  } else {
    finalSlug = finalSlug
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');
  }

  const filename = `${dateStr}-${finalSlug}.md`;
  const fullPath = path.join(KAJIAN_DIR, filename);

  try {
    fs.writeFileSync(fullPath, content, 'utf-8');

    let gitPushed = false;
    let gitNote = '';
    const repoRoot = path.resolve(__dirname, '..');

    if (fs.existsSync(path.join(repoRoot, '.git'))) {
      try {
        const commitTitle = finalTitle.replace(/"/g, "'").substring(0, 72);

        // Kepatuhan Keep a Changelog: Otomatis catat bahan kajian baru ke CHANGELOG.md
        const changelogPath = path.join(repoRoot, 'CHANGELOG.md');
        let changelogModified = false;
        if (fs.existsSync(changelogPath)) {
          try {
            let changelogContent = fs.readFileSync(changelogPath, 'utf-8');
            const entryLine = `- **${finalTitle} (\`kajian/${filename}\`):** Draf bahan kajian bahtsul masail disimpan otomatis oleh bot.`;
            if (changelogContent.includes('### 📚 New Studies & Materials')) {
              changelogContent = changelogContent.replace('### 📚 New Studies & Materials', `### 📚 New Studies & Materials\n${entryLine}`);
              changelogModified = true;
            } else if (changelogContent.includes('### ✨ New Features')) {
              changelogContent = changelogContent.replace('### ✨ New Features', `### 📚 New Studies & Materials\n${entryLine}\n\n### ✨ New Features`);
              changelogModified = true;
            }
            if (changelogModified) {
              fs.writeFileSync(changelogPath, changelogContent, 'utf-8');
            }
          } catch (clErr) {
            console.warn('Gagal memutakhirkan CHANGELOG.md:', clErr.message);
          }
        }

        const addTargets = changelogModified ? `"kajian/${filename}" "CHANGELOG.md"` : `"kajian/${filename}"`;
        try {
          await execAsync(`git add ${addTargets} && git commit -m "docs(kajian): tambah bahan kajian ${commitTitle} & changelog" && git push origin HEAD`, {
            cwd: repoRoot,
            timeout: 30000,
          });
        } catch (firstPushErr) {
          // Jika ada pembaruan di remote, lakukan rebase commit lokal lalu dorong kembali
          await execAsync(`git pull --rebase origin HEAD && git push origin HEAD`, {
            cwd: repoRoot,
            timeout: 30000,
          });
        }
        gitPushed = true;
        gitNote = ' & di-push ke GitHub (private)';
      } catch (gitErr) {
        console.warn('Git push info/warning:', gitErr.message);
        gitNote = ' (tersimpan di server, push git tertunda)';
      }
    }

    res.json({
      ok: true,
      message: `Kajian berhasil disimpan${gitNote}.`,
      filename,
      title: finalTitle,
      fullPath,
      gitPushed,
    });
  } catch (err) {
    res.status(500).json({ ok: false, error: `Gagal menyimpan berkas: ${err.message}` });
  }
});

// Serve frontend build if available (production mode)
const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`========================================================`);
  console.log(`  🏛️  Bahtsu Klangopan Server Berjalan di Port ${PORT}`);
  console.log(`  URL: http://localhost:${PORT}`);
  console.log(`  9Router Gateway: ${ROUTER_URL}`);
  console.log(`  Master Passcode: ${MASTER_PASSCODE}`);
  console.log(`========================================================`);
});
