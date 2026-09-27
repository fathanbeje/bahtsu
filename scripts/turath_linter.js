#!/usr/bin/env node

/**
 * Turath Citation Linter & Auto-Verifier
 * Utilitas audit otomatis untuk memvalidasi keabsahan maraji', nomor halaman,
 * nama kitab, dan tautan verifikasi Turath.io pada seluruh naskah kajian Bahtsul Masail.
 * 
 * Penggunaan:
 *   node scripts/turath_linter.js [path/to/kajian.md]
 *   node scripts/turath_linter.js --all
 *   node scripts/turath_linter.js --all --fix
 */

const fs = require('fs');
const path = require('path');
const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

const TURATH_API = 'https://api.turath.io';
const BOOK_CACHE = new Map();

// Helper pembersih tanda baca untuk Text Fragment
function cleanPunct(s) {
  return (s || '')
    .replace(/^[،؛.:!؟\(\)\[\]«»"'_\-\s]+|[،؛.:!؟\(\)\[\]«»"'_\-\s]+$/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function cleanArabic(s) {
  return (s || '')
    .replace(/[\u064B-\u0652]/g, '') // hilangkan harakat
    .replace(/[،؛.:!؟\(\)\[\]«»"'_\-\s]+/g, ' ')
    .trim();
}

const BROWSER_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Referer': 'https://app.turath.io/',
  'Origin': 'https://app.turath.io',
  'Accept': 'application/json, text/plain, */*',
  'Accept-Language': 'ar,en-US;q=0.9,en;q=0.8',
};

async function fetchTurathWithRetry(url, maxRetries = 2) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      const res = await fetch(url, {
        signal: controller.signal,
        headers: BROWSER_HEADERS
      });
      clearTimeout(timeoutId);

      if (res.status === 429) {
        const waitMs = attempt * 800;
        await new Promise(r => setTimeout(r, waitMs));
        continue;
      }
      return res;
    } catch (err) {
      if (attempt === maxRetries) return null;
      await new Promise(r => setTimeout(r, 400));
    }
  }
  return null;
}

// Ambil metadata dasar sebuah kitab di Turath.io
async function getBookMeta(bookId) {
  if (BOOK_CACHE.has(bookId)) {
    return BOOK_CACHE.get(bookId);
  }

  try {
    const res = await fetchTurathWithRetry(`${TURATH_API}/search?q=${encodeURIComponent('في')}&book_id=${bookId}&v=3`);
    if (res && res.ok) {
      const d = await res.json();
      if (d.data && d.data.length > 0) {
        const m = typeof d.data[0].meta === 'string' ? JSON.parse(d.data[0].meta) : d.data[0].meta;
        const info = {
          bookId: Number(bookId),
          bookName: m.book_name || `Kitab ${bookId}`,
          authorName: m.author_name || 'Ulama Salaf',
          catId: d.data[0].cat_id,
        };
        BOOK_CACHE.set(bookId, info);
        return info;
      }
    }
  } catch (err) {}

  BOOK_CACHE.set(bookId, null);
  return null;
}

// Ekstrak range W3C Text Fragment langsung dari teks mahallus syahid yang disorot
function generateW3CFragment(primaryText, fallbackSnip = '') {
  // 1. PRIORITAS UTAMA: Ambil langsung dari mahallus syahid asli yang ada di naskah!
  const raw = (primaryText || '').trim();
  if (raw) {
    const clean = cleanArabic(raw);
    const words = clean.split(/\s+/).map(cleanPunct).filter(Boolean);

    if (words.length > 0 && words.length <= 4) {
      return `#:~:text=${encodeURIComponent(words.join(' '))}`;
    }

    if (words.length > 4) {
      // Ambil 2-3 kata awal dan 2-3 kata akhir dari mahallus syahid
      const startWords = words.slice(0, 3).join(' ');
      const endWords = words.slice(-3).join(' ');
      if (startWords && endWords && startWords !== endWords) {
        return `#:~:text=${encodeURIComponent(startWords)},${encodeURIComponent(endWords)}`;
      }
      return `#:~:text=${encodeURIComponent(startWords)}`;
    }
  }

  // 2. Fallback HANYA JIKA tidak ada teks yang disorot
  const clean = (fallbackSnip || '')
    .replace(/<span[^>]*>/gi, '')
    .replace(/<\/span>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const textWithoutTags = clean.replace(/<\/?em>/gi, '').trim();
  const words = cleanArabic(textWithoutTags).split(/\s+/).map(cleanPunct).filter(Boolean);

  if (words.length === 0) return '';
  if (words.length <= 4) {
    return `#:~:text=${encodeURIComponent(words.join(' '))}`;
  }

  const startCandidates = words.slice(0, 3).filter(Boolean);
  const endCandidates = words.slice(-3).filter(Boolean);
  const startWords = startCandidates.join(' ');
  const endWords = endCandidates.join(' ');

  if (startWords && endWords && startWords !== endWords) {
    return `#:~:text=${encodeURIComponent(startWords)},${encodeURIComponent(endWords)}`;
  }
  return startWords ? `#:~:text=${encodeURIComponent(startWords)}` : '';
}

// Parse berkas Markdown untuk mengekstrak entri-entri maraji' (khusus Bagian Maraji'/Ibarat)
function parseCitations(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const citations = [];

  let inMarajiSection = false;
  let current = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Cek batas masuk bagian Maraji'
    if (line.match(/^###\s+(?:V[\.\s]|.*Mar[aā]ji|.*Dasar Pengambilan Hukum)/i)) {
      inMarajiSection = true;
      continue;
    }

    // Cek batas keluar bagian Maraji' (masuk ke Kesimpulan / Rekomendasi)
    if (inMarajiSection && line.match(/^###\s+(?:VI[\.\s]|.*Kesimpulan|.*Penutup|.*Sintesis)/i)) {
      inMarajiSection = false;
      if (current) citations.push(current);
      current = null;
      break;
    }

    if (!inMarajiSection) continue;

    // Deteksi awal entri rujukan (e.g. "1. **Kitab: ...**" atau "1. **Kitab Al-Majmu'...**")
    const headerMatch = line.match(/^(\d+)\.\s+\*\*(?:Kitab:?\s*)?([^*]+)\*\*/i);
    if (headerMatch) {
      if (current) citations.push(current);
      current = {
        index: Number(headerMatch[1]),
        rawTitle: headerMatch[2].trim(),
        startLine: i + 1,
        author: '',
        metaLine: '',
        arabicQuotes: [],
        highlightedText: '',
        linkUrl: '',
        linkText: '',
        linkLine: -1,
      };
      continue;
    }

    if (!current) continue;

    // Deteksi baris pengarang / madzhab
    if (line.includes('*Karya:') || line.includes('*Pengarang:')) {
      current.author = line.replace(/^\s*\*/, '').replace(/\*.*$/, '').trim();
    }

    // Deteksi kutipan Arab (di dalam blockquote '>')
    if (line.trim().startsWith('>')) {
      const quoteContent = line.replace(/^>\s*/, '').trim();
      current.arabicQuotes.push(quoteContent);

      // Cari mahallus syahid di dalam <u>**【...】**</u>
      const syahidMatch = quoteContent.match(/【(.*?)】/);
      if (syahidMatch) {
        current.highlightedText = syahidMatch[1].trim();
      }
    }

    // Deteksi tautan verifikasi Turath.io
    const linkMatch = line.match(/\[(.*?)\]\((https:\/\/app\.turath\.io\/book\/[^\s\)]+)\)/);
    if (linkMatch) {
      current.linkText = linkMatch[1];
      current.linkUrl = linkMatch[2];
      current.linkLine = i + 1;
    }
  }

  if (current) citations.push(current);
  return citations;
}

// Audit satu entri sitasi ke Turath API
async function auditCitation(citation, filePath) {
  const issues = [];
  let suggestedFix = null;

  if (!citation.linkUrl) {
    issues.push({
      type: 'MISSING_LINK',
      severity: 'CRITICAL',
      message: 'Tidak ditemukan tautan verifikasi Turath.io',
    });
    return { citation, issues, suggestedFix };
  }

  // Parse URL
  const urlMatch = citation.linkUrl.match(/https:\/\/app\.turath\.io\/book\/(\d+)(?:\?page=(\d+))?(?:#:~:text=([^\s]+))?/);
  if (!urlMatch) {
    issues.push({
      type: 'INVALID_URL',
      severity: 'CRITICAL',
      message: `Format URL tidak valid: ${citation.linkUrl}`,
    });
    return { citation, issues, suggestedFix };
  }

  const bookId = Number(urlMatch[1]);
  const pageId = urlMatch[2] ? Number(urlMatch[2]) : null;
  const textFrag = urlMatch[3] ? decodeURIComponent(urlMatch[3]) : '';

  // 1. Validasi apakah Book ID nyata di Turath
  const bookMeta = await getBookMeta(bookId);
  if (!bookMeta) {
    issues.push({
      type: 'UNKNOWN_BOOK_ID',
      severity: 'CRITICAL',
      message: `Book ID ${bookId} tidak ditemukan di database Turath.io`,
    });
  }

  // 2. Ambil sample kata kunci Arab untuk pencarian
  let searchPhrase = '';
  if (citation.highlightedText) {
    const words = cleanArabic(citation.highlightedText).split(/\s+/).filter(Boolean);
    searchPhrase = words.slice(0, 4).join(' ');
  } else if (citation.arabicQuotes.length > 0) {
    const combined = citation.arabicQuotes.join(' ');
    const words = cleanArabic(combined).split(/\s+/).filter(Boolean);
    searchPhrase = words.slice(0, 4).join(' ');
  }

  if (!searchPhrase) {
    issues.push({
      type: 'NO_ARABIC_TEXT',
      severity: 'WARNING',
      message: 'Tidak ditemukan kutipan teks Arab untuk divalidasi',
    });
    return { citation, issues, suggestedFix };
  }

  // 3. Bangun daftar frasa pencarian kandidat (multi-phrase fallback)
  const candidatePhrases = [];
  let allWords = [];
  if (citation.highlightedText) {
    allWords = cleanArabic(citation.highlightedText).split(/\s+/).filter(Boolean);
  }
  if (allWords.length === 0 && citation.arabicQuotes.length > 0) {
    allWords = cleanArabic(citation.arabicQuotes.join(' ')).split(/\s+/).filter(Boolean);
  }

  if (allWords.length >= 4) {
    candidatePhrases.push(allWords.slice(0, 4).join(' '));
    candidatePhrases.push(allWords.slice(0, 3).join(' '));
    candidatePhrases.push(allWords.slice(1, 4).join(' '));
  } else if (allWords.length > 0) {
    candidatePhrases.push(allWords.join(' '));
  }

  if (candidatePhrases.length === 0) {
    issues.push({
      type: 'NO_ARABIC_TEXT',
      severity: 'WARNING',
      message: 'Tidak ditemukan kutipan teks Arab untuk divalidasi',
    });
    return { citation, issues, suggestedFix };
  }

  // 4. Verifikasi apakah teks tersebut ada di dalam bookId
  let foundInTargetBook = false;
  let targetMatch = null;

  for (const phrase of candidatePhrases) {
    try {
      const res = await fetchTurathWithRetry(`${TURATH_API}/search?q=${encodeURIComponent(phrase)}&book_id=${bookId}&v=3`);
      if (res && res.ok) {
        const d = await res.json();
        if (d.data && d.data.length > 0) {
          for (const item of d.data) {
            const m = typeof item.meta === 'string' ? JSON.parse(item.meta) : item.meta;
            if (!targetMatch) targetMatch = { item, meta: m };
            if (pageId && m.page_id === pageId) {
              targetMatch = { item, meta: m };
              foundInTargetBook = true;
              break;
            }
          }
          if (targetMatch && !foundInTargetBook && targetMatch.meta.page_id) {
            foundInTargetBook = true;
          }
          if (foundInTargetBook) break;
        }
      }
    } catch (err) {
      // network issue
    }
  }

  // Evaluasi kecocokan halaman di kitab target
  if (foundInTargetBook && targetMatch) {
    const correctPageId = targetMatch.meta.page_id;
    const correctVol = targetMatch.meta.vol;
    const correctPrintedPage = targetMatch.meta.page;
    const newFragment = generateW3CFragment(citation.highlightedText, targetMatch.item.snip);
    const correctUrl = `https://app.turath.io/book/${bookId}?page=${correctPageId}${newFragment}`;

    let fragmentMatches = false;
    if (textFrag && citation.highlightedText) {
      const cleanH = cleanArabic(citation.highlightedText);
      const fragStart = cleanPunct(cleanArabic(textFrag.split(',')[0]));
      if (fragStart && cleanH.includes(fragStart)) {
        fragmentMatches = true;
      }
    }

    if (pageId !== correctPageId) {
      issues.push({
        type: 'WRONG_PAGE_ID',
        severity: 'HIGH',
        message: `Halaman keliru! URL mengarah ke page=${pageId}, padahal teks berada di page=${correctPageId} (Juz ${correctVol}, Hal ${correctPrintedPage})`,
      });
      suggestedFix = {
        correctUrl,
        correctPageId,
        correctVol,
        correctPrintedPage,
        bookName: bookMeta?.bookName || `Kitab ${bookId}`,
        authorName: bookMeta?.authorName || '',
      };
    } else if (!textFrag) {
      issues.push({
        type: 'MISSING_FRAGMENT',
        severity: 'LOW',
        message: 'Tautan belum dilengkapi Scroll-to-Text-Fragment (#:~:text=...)',
      });
      suggestedFix = {
        correctUrl,
        correctPageId,
        correctVol,
        correctPrintedPage,
        bookName: bookMeta?.bookName || `Kitab ${bookId}`,
        authorName: bookMeta?.authorName || '',
      };
    } else if (citation.highlightedText && !fragmentMatches) {
      issues.push({
        type: 'MISMATCH_FRAGMENT',
        severity: 'HIGH',
        message: `Tautan tidak mengarah ke mahallus syahid! Fragment '${textFrag}' tidak cocok dengan teks naskah yang disorot`,
      });
      suggestedFix = {
        correctUrl,
        correctPageId,
        correctVol,
        correctPrintedPage,
        bookName: bookMeta?.bookName || `Kitab ${bookId}`,
        authorName: bookMeta?.authorName || '',
      };
    }
  } else {
    // Teks TIDAK ditemukan di kitab target -> Cari secara global di Turath!
    let globalCandidate = null;
    for (const phrase of candidatePhrases) {
      try {
        const gRes = await fetchTurathWithRetry(`${TURATH_API}/search?q=${encodeURIComponent(phrase)}&v=3`);
        if (gRes && gRes.ok) {
          const gd = await gRes.json();
          if (gd.data && gd.data.length > 0) {
            const topItem = gd.data[0];
            const topMeta = typeof topItem.meta === 'string' ? JSON.parse(topItem.meta) : topItem.meta;
            globalCandidate = {
              bookId: topItem.book_id,
              pageId: topMeta.page_id,
              bookName: topMeta.book_name,
              authorName: topMeta.author_name,
              vol: topMeta.vol,
              page: topMeta.page,
              snip: topItem.snip,
            };
            break;
          }
        }
      } catch (e) {}
    }

    if (globalCandidate) {
      const newFragment = generateW3CFragment(citation.highlightedText, globalCandidate.snip);
      const correctUrl = `https://app.turath.io/book/${globalCandidate.bookId}?page=${globalCandidate.pageId}${newFragment}`;
      issues.push({
        type: 'MISMATCH_BOOK',
        severity: 'CRITICAL',
        message: `Kitab di tautan (${bookMeta ? bookMeta.bookName : bookId}) TIDAK MEMUAT teks ini! Teks sebenarnya ada di '${globalCandidate.bookName}' (${globalCandidate.authorName}) Juz ${globalCandidate.vol}, Hal ${globalCandidate.page}`,
      });
      suggestedFix = {
        correctUrl,
        correctBookId: globalCandidate.bookId,
        correctPageId: globalCandidate.pageId,
        correctVol: globalCandidate.vol,
        correctPrintedPage: globalCandidate.page,
        bookName: globalCandidate.bookName,
        authorName: globalCandidate.authorName,
      };
    } else {
      issues.push({
        type: 'TEXT_NOT_FOUND',
        severity: 'HIGH',
        message: `Kutipan teks Arab '${searchPhrase}' tidak ditemukan pada Book ID ${bookId} maupun pencarian global Turath.io`,
      });
    }
  }

  return { citation, issues, suggestedFix };
}

// Auto-fix naskah markdown dengan saran perbaikan yang terverifikasi (line-precise)
function applyFixesToFile(filePath, auditedResults) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  let fixedCount = 0;

  for (const item of auditedResults) {
    if (!item.suggestedFix) continue;
    const { citation, suggestedFix } = item;

    if (citation.linkLine > 0 && citation.linkLine <= lines.length) {
      const lineIdx = citation.linkLine - 1;
      if (citation.linkUrl && lines[lineIdx].includes(citation.linkUrl)) {
        lines[lineIdx] = lines[lineIdx].replace(citation.linkUrl, suggestedFix.correctUrl);
        fixedCount++;
        continue;
      }
      // Atau jika linkLine memuat markdown link apapun
      const m = lines[lineIdx].match(/(https:\/\/app\.turath\.io\/book\/[^\s\)]+)/);
      if (m && suggestedFix.correctUrl) {
        lines[lineIdx] = lines[lineIdx].replace(m[1], suggestedFix.correctUrl);
        fixedCount++;
        continue;
      }
    }
  }

  if (fixedCount > 0) {
    fs.writeFileSync(filePath, lines.join('\n'), 'utf-8');
  }
  return fixedCount;
}

async function main() {
  const args = process.argv.slice(2);
  const isFix = args.includes('--fix');
  const isAll = args.includes('--all');
  const isJson = args.includes('--json');

  let targetFiles = [];

  if (isAll) {
    const dir = path.join(__dirname, '..', 'kajian');
    targetFiles = fs.readdirSync(dir)
      .filter(f => f.endsWith('.md') && f !== 'README.md')
      .map(f => path.join(dir, f));
  } else {
    const specificFile = args.find(a => !a.startsWith('--'));
    if (specificFile) {
      targetFiles = [path.resolve(specificFile)];
    } else {
      console.log('Penggunaan:');
      console.log('  node scripts/turath_linter.js <path/to/kajian.md>');
      console.log('  node scripts/turath_linter.js --all [--fix]');
      process.exit(1);
    }
  }

  console.log(`\n================================================================`);
  console.log(`🔍 TURATH CITATION LINTER & VERIFIER`);
  console.log(`Memeriksa ${targetFiles.length} berkas kajian... Mode: ${isFix ? 'AUTO-FIX 🛠️' : 'AUDIT ONLY 📋'}`);
  console.log(`================================================================\n`);

  const summary = {
    totalFiles: targetFiles.length,
    totalCitations: 0,
    totalPassed: 0,
    totalIssues: 0,
    fileReports: [],
  };

  for (const file of targetFiles) {
    const fileName = path.basename(file);
    const citations = parseCitations(file);
    summary.totalCitations += citations.length;

    console.log(`📄 Memeriksa: ${fileName} (${citations.length} rujukan ditemukan)...`);

    const audited = [];
    for (let ci = 0; ci < citations.length; ci++) {
      const c = citations[ci];
      const shortTitle = c.rawTitle.length > 40 ? c.rawTitle.substring(0, 37) + '...' : c.rawTitle;
      process.stdout.write(`   [${ci + 1}/${citations.length}] ${shortTitle} ... `);
      const res = await auditCitation(c, file);
      audited.push(res);
      if (res.issues.length === 0) {
        console.log('✅ Cocok');
      } else {
        const types = res.issues.map(i => i.type).join(', ');
        console.log(`⚠️ (${types})`);
      }
      await new Promise(r => setTimeout(r, 100));
    }

    const issues = audited.filter(a => a.issues.length > 0);
    const passed = audited.filter(a => a.issues.length === 0);
    summary.totalPassed += passed.length;
    summary.totalIssues += issues.length;

    let fixedCount = 0;
    if (isFix && issues.some(i => i.suggestedFix)) {
      fixedCount = applyFixesToFile(file, audited);
    }

    summary.fileReports.push({
      file: fileName,
      total: citations.length,
      passed: passed.length,
      issuesCount: issues.length,
      fixedCount,
      details: audited,
    });

    if (issues.length === 0) {
      console.log(`   ✅ Seluruh ${citations.length} rujukan 100% VALID & cocok dengan Turath.io.\n`);
    } else {
      console.log(`   ⚠️ Ditemukan ${issues.length} rujukan bermasalah:`);
      for (const item of issues) {
        const { citation, issues: citIssues, suggestedFix } = item;
        console.log(`     - [Baris ${citation.linkLine}] ${citation.rawTitle}`);
        for (const iss of citIssues) {
          const badge = iss.severity === 'CRITICAL' ? '🔴' : iss.severity === 'HIGH' ? '🟠' : '🟡';
          console.log(`       ${badge} [${iss.type}] ${iss.message}`);
        }
        if (suggestedFix) {
          console.log(`       💡 Saran Perbaikan: ${suggestedFix.correctUrl}`);
        }
      }
      if (fixedCount > 0) {
        console.log(`   🛠️ Auto-Fix: ${fixedCount} tautan berhasil diperbaiki dan disimpan!`);
      }
      console.log('');
    }
  }

  console.log(`================================================================`);
  console.log(`📊 REKAPITULASI AUDIT TURATH:`);
  console.log(`- Total Berkas Diperiksa : ${summary.totalFiles}`);
  console.log(`- Total Rujukan Dianalisis: ${summary.totalCitations}`);
  console.log(`- Rujukan Valid (100% Cocok): ${summary.totalPassed}`);
  console.log(`- Rujukan Bermasalah   : ${summary.totalIssues}`);
  console.log(`================================================================\n`);

  if (summary.totalIssues > 0) {
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(err => {
    console.error('Linter error:', err);
    process.exit(1);
  });
}

module.exports = {
  parseCitations,
  auditCitation,
  getBookMeta,
  generateW3CFragment,
  applyFixesToFile,
  cleanArabic,
  cleanPunct,
  fetchTurathWithRetry
};
