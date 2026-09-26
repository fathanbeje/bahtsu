import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import http from 'http';
import https from 'https';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

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

// Kajian Repository - List all files
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

      // Extract title from first # heading
      const titleMatch = content.match(/^#\s+(.+)$/m);
      const title = titleMatch ? titleMatch[1].replace(/^[^\w\s\u0600-\u06FF]+/, '').trim() : filename;

      return {
        filename,
        title,
        size: stat.size,
        updatedAt: stat.mtime,
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
    res.json({ ok: true, filename: safeFilename, content });
  } catch (err) {
    res.status(500).json({ ok: false, error: `Gagal membaca isi berkas: ${err.message}` });
  }
});

// Kajian Repository - Save new kajian
app.post('/api/kajian/save', checkAuth, (req, res) => {
  const { title, slug, content, model, matraMode } = req.body;

  if (!content) {
    return res.status(400).json({ ok: false, error: 'Konten kajian tidak boleh kosong.' });
  }

  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const safeSlug = (slug || title || 'kajian-bahtsu')
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');

  const filename = `${dateStr}-${safeSlug}.md`;
  const fullPath = path.join(KAJIAN_DIR, filename);

  try {
    fs.writeFileSync(fullPath, content, 'utf-8');
    res.json({
      ok: true,
      message: 'Kajian berhasil disimpan ke repositori.',
      filename,
      fullPath,
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
