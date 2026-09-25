#!/usr/bin/env node

/**
 * Turath Search CLI Utility
 * Digunakan oleh skill /bahtsu untuk mencari ibarat di database Turath.io secara 100% online.
 * 
 * Penggunaan:
 *   node turath_search.js --query "النية في الوضوء" [--category 16] [--limit 5] [--json]
 */

const API_ENDPOINT = 'https://api.turath.io/search';

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    query: '',
    category: null,
    limit: 5,
    json: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--query' || arg === '-q') {
      options.query = args[++i] || '';
    } else if (arg === '--category' || arg === '-c') {
      options.category = parseInt(args[++i], 10) || null;
    } else if (arg === '--limit' || arg === '-l') {
      options.limit = parseInt(args[++i], 10) || 5;
    } else if (arg === '--json') {
      options.json = true;
    } else if (!options.query && !arg.startsWith('-')) {
      options.query = arg;
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

async function searchTurath(query, categoryId, limit) {
  let url = `${API_ENDPOINT}?q=${encodeURIComponent(query)}&v=3`;
  if (categoryId) {
    url += `&cat_id=${categoryId}`;
  }
  
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Bahtsu-Skill/1.0',
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

  if (!options.query) {
    console.error('Error: Masukkan kata kunci pencarian dengan --query atau -q.');
    console.error('Contoh: node turath_search.js -q "تكبيرة الإحرام" -c 16');
    process.exit(1);
  }

  try {
    const results = await searchTurath(options.query, options.category, options.limit);

    if (options.json) {
      console.log(JSON.stringify(results, null, 2));
      return;
    }

    if (results.length === 0) {
      console.log(`\nTidak ditemukan hasil untuk kueri: "${options.query}"${options.category ? ` pada kategori ${options.category}` : ''}.`);
      return;
    }

    console.log(`\n=== Ditemukan ${results.length} Ibarat dari Turath.io untuk: "${options.query}"${options.category ? ` (Kategori: ${options.category})` : ''} ===\n`);

    results.forEach((item, index) => {
      console.log(`### ${index + 1}. ${item.bookName} (${item.volume ? item.volume + '/' : ''}${item.printedPage})`);
      console.log(`- **Pengarang:** ${item.authorName}`);
      if (item.headings && item.headings.length > 0) {
        console.log(`- **Bab / Judul:** ${item.headings.join(' > ')}`);
      }
      console.log(`- **Tautan Verifikasi:** ${item.url}`);
      console.log(`- **Kutipan Teks:**`);
      console.log(`> ${item.snippet.replace(/\n/g, '\n> ')}`);
      console.log('\n---\n');
    });

  } catch (error) {
    console.error(`Gagal melakukan pencarian: ${error.message}`);
    process.exit(1);
  }
}

main();
