#!/usr/bin/env node

/**
 * Turath Search CLI Utility (Advanced Multi-Query Edition)
 * Digunakan oleh skill /bahtsu untuk mencari multi-ibarat di database Turath.io secara 100% online.
 * 
 * Penggunaan:
 *   node turath_search.js --query "قضاء الصلاة عن الميت" [--category 16] [--limit 5]
 *   node turath_search.js --multi "من مات وعليه صلاة,فدية الصلاة,الاستئجار على الصلاة"
 */

const API_ENDPOINT = 'https://api.turath.io/search';

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    queries: [],
    category: null,
    limit: 5,
    json: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--query' || arg === '-q') {
      const q = args[++i] || '';
      if (q) options.queries.push(q);
    } else if (arg === '--multi' || arg === '-m') {
      const multi = (args[++i] || '').split(',').map(s => s.trim()).filter(Boolean);
      options.queries.push(...multi);
    } else if (arg === '--category' || arg === '-c') {
      options.category = parseInt(args[++i], 10) || null;
    } else if (arg === '--limit' || arg === '-l') {
      options.limit = parseInt(args[++i], 10) || 5;
    } else if (arg === '--json') {
      options.json = true;
    } else if (!arg.startsWith('-')) {
      options.queries.push(arg);
    }
  }

  return options;
}

function cleanHtml(html) {
  if (!html) return '';
  return html
    .replace(/<span[^>]*>/gi, '')
    .replace(/<\/span>/gi, '')
    .replace(/<em>/gi, '**')
    .replace(/<\/em>/gi, '**')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim();
}

async function searchTurathSingle(query, categoryId, limit) {
  let url = `${API_ENDPOINT}?q=${encodeURIComponent(query)}&v=3`;
  if (categoryId) {
    url += `&cat_id=${categoryId}`;
  }
  
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Bahtsu-Skill/2.0',
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status} (${response.statusText})`);
  }

  const result = await response.json();
  const rawItems = result.data || [];

  return rawItems.slice(0, limit).map((item) => {
    let meta = {};
    try {
      meta = typeof item.meta === 'string' ? JSON.parse(item.meta) : (item.meta || {});
    } catch {
      meta = {};
    }

    const bookId = item.book_id;
    const pageId = meta.page_id || 1;
    const bookName = meta.book_name || `Kitab ID: ${bookId}`;
    const authorName = meta.author_name || 'Ulama Salaf';
    const volume = meta.vol || '1';
    const printedPage = meta.page || pageId;
    const directUrl = `https://app.turath.io/book/${bookId}?page=${pageId}`;

    return {
      query,
      bookId,
      catId: item.cat_id,
      bookName,
      authorName,
      volume,
      printedPage,
      pageId,
      url: directUrl,
      headings: meta.headings || [],
      snippet: cleanHtml(item.snip),
      fullText: cleanHtml(item.text),
    };
  });
}

async function main() {
  const options = parseArgs();

  if (options.queries.length === 0) {
    console.error('Error: Masukkan kata kunci pencarian dengan --query atau --multi.');
    console.error('Contoh tunggal: node turath_search.js -q "تكبيرة الإحرام" -c 16');
    console.error('Contoh jamak  : node turath_search.js -m "من مات وعليه صلاة,فدية الصلاة" -l 3');
    process.exit(1);
  }

  try {
    const allResults = [];
    const seenPages = new Set();

    for (const q of options.queries) {
      const res = await searchTurathSingle(q, options.category, options.limit);
      for (const item of res) {
        const key = `${item.bookId}_${item.pageId}`;
        if (!seenPages.has(key)) {
          seenPages.add(key);
          allResults.push(item);
        }
      }
    }

    if (options.json) {
      console.log(JSON.stringify(allResults, null, 2));
      return;
    }

    if (allResults.length === 0) {
      console.log(`\nTidak ditemukan hasil untuk kueri: ${options.queries.join(', ')}${options.category ? ` pada kategori ${options.category}` : ''}.`);
      return;
    }

    console.log(`\n================================================================`);
    console.log(`📚 HASIL PENELUSURAN IBARAT TURATH.IO (${allResults.length} Rujukan Ditemukan)`);
    console.log(`Kueri: ${options.queries.join(' | ')}${options.category ? ` (Kategori: ${options.category})` : ''}`);
    console.log(`================================================================\n`);

    allResults.forEach((item, index) => {
      console.log(`### ${index + 1}. ${item.bookName} (${item.volume ? item.volume + '/' : ''}${item.printedPage})`);
      console.log(`- **Pengarang:** ${item.authorName}`);
      if (item.headings && item.headings.length > 0) {
        console.log(`- **Bab / Judul:** ${item.headings.join(' > ')}`);
      }
      console.log(`- **Tautan Verifikasi:** ${item.url}`);
      console.log(`- **Kutipan Teks Asli:**`);
      console.log(`> ${item.snippet.replace(/\n/g, '\n> ')}`);
      console.log('\n---\n');
    });

  } catch (error) {
    console.error(`Gagal melakukan pencarian: ${error.message}`);
    process.exit(1);
  }
}

main();
