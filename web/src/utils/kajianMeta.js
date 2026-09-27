/**
 * Utility functions for parsing, formatting, and generating Kajian metadata,
 * titles, themes (Tema), and filenames/slugs for Bahtsu Klangopan.
 */

/**
 * Clean text from markdown syntax and excess whitespaces
 */
export function cleanMarkdownFormatting(text = '') {
  return text
    .replace(/[#*`_~[\]]/g, '')
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Extract true Tema/Title from markdown content
 */
export function extractTemaFromContent(content = '', fallback = '') {
  if (!content || typeof content !== 'string') return fallback || 'Draf Taswidah Bahtsul Masail';

  // 1. Look for explicit **Tema:**, **Judul:**, or **Topik:**
  const temaMatch = content.match(/\*\*(?:Tema|Judul|Topik)\s*:\*\*\s*([^\n\r]+)/i)
                 || content.match(/(?:^|\n)(?:Tema|Judul|Topik)\s*:\s*([^\n\r]+)/i);
  if (temaMatch && temaMatch[1].trim()) {
    const raw = cleanMarkdownFormatting(temaMatch[1]);
    if (raw.length > 3) {
      return raw;
    }
  }

  // 2. Look for H1 (# ...), ignoring generic headings
  const h1Match = content.match(/^#\s+(.+)$/m);
  if (h1Match) {
    const rawH1 = cleanMarkdownFormatting(h1Match[1]);
    const isGeneric = /draf\s+tasw[iī]dah|bahan\s+kajian\s+bahtsul|studio\s+bahtsu/i.test(rawH1);
    if (!isGeneric && rawH1.length > 3) {
      return rawH1;
    }
  }

  // 3. Look for first As'ilah / Question if available
  const questionMatch = content.match(/\d+\.\s+\*\*([^*?]+(?:\?|\b))\*\*/);
  if (questionMatch && questionMatch[1].trim().length > 5) {
    return cleanMarkdownFormatting(questionMatch[1]);
  }

  // 4. Derive from filename if fallback ends with .md
  if (fallback && fallback.endsWith('.md')) {
    const cleanFromFilename = fallback
      .replace(/\.md$/i, '')
      .replace(/^\d{4}-\d{2}-\d{2}-/, '')
      .replace(/-/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase());
    return cleanFromFilename;
  }

  return fallback || 'Draf Taswidah Bahtsul Masail';
}

/**
 * Generate a concise, clean, URL/file-safe slug from a title or tema.
 * Limits to 6-8 key words or ~55 chars.
 */
export function generateKajianSlug(titleOrTema = '') {
  if (!titleOrTema || typeof titleOrTema !== 'string') return 'kajian-bahtsu';

  // Clean diacritics
  const normalized = titleOrTema
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/['’`ʻʿ]/g, '')
    .toLowerCase();

  // Strip non-alphanumeric
  let clean = normalized
    .replace(/[^\w\s-]/g, ' ')
    .trim()
    .replace(/\s+/g, '-');

  // Filter stop words for compact slugs if too long
  const parts = clean.split('-').filter(Boolean);
  
  // If slug starts with generic draf-taswidah, skip those prefix words
  let relevantParts = parts;
  if (parts.length > 3 && (parts[0] === 'draf' || parts[0] === 'taswidah')) {
    relevantParts = parts.filter(p => !['draf', 'taswidah', 'bahan', 'kajian', 'bahtsul', 'masail', 'dan'].includes(p));
    if (relevantParts.length === 0) relevantParts = parts;
  }

  // Limit to 7 words
  if (relevantParts.length > 7) {
    relevantParts = relevantParts.slice(0, 7);
  }

  let result = relevantParts.join('-');

  if (result.length > 55) {
    result = result.substring(0, 55).replace(/-[^-]*$/, '');
  }

  return result || 'kajian-bahtsu';
}
