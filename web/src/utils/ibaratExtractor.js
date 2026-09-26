/**
 * Utility untuk mendeteksi dan mengekstrak ibarat kitab kuning,
 * mahallus syahid, dan klasifikasi maraji' dari teks kajian Bahtsul Masail.
 */

// Pola kitab mu'tamad & lapisan turats
const CLASSICAL_BOOKS = [
  { name: "Al-Majmū' Syarḥ al-Muhadhdhab", author: "Imam an-Nawawi", layer: "Syaikhoni / Muta'akhirin", madzhab: "Syafi'i" },
  { name: "Tuhfatul Muhtāj bi Syarḥ al-Minhāj", author: "Ibnu Hajar al-Haitami", layer: "Hawasyi & Tahqiq Muta'akhirin", madzhab: "Syafi'i" },
  { name: "Nihāyatul Muhtāj ilā Syarḥ al-Minhāj", author: "Syamsuddin ar-Ramli", layer: "Hawasyi & Tahqiq Muta'akhirin", madzhab: "Syafi'i" },
  { name: "Mughnī al-Muhtāj ilā Ma'rifat Ma'ānī Alfāzh al-Minhāj", author: "Al-Khatib asy-Syirbini", layer: "Hawasyi & Tahqiq Muta'akhirin", madzhab: "Syafi'i" },
  { name: "Fathul Wahhāb bi Syarḥ Manhaj at-Thullāb", author: "Syaikhul Islam Zakariyya al-Anshari", layer: "Hawasyi & Tahqiq Muta'akhirin", madzhab: "Syafi'i" },
  { name: "Asnā al-Mathālib Syarh Raudh at-Thalib", author: "Syaikhul Islam Zakariyya al-Anshari", layer: "Hawasyi & Tahqiq Muta'akhirin", madzhab: "Syafi'i" },
  { name: "Raudhatut Thālibīn wa 'Umdatul Muftīn", author: "Imam an-Nawawi", layer: "Syaikhoni / Muta'akhirin", madzhab: "Syafi'i" },
  { name: "Al-Umm", author: "Imam asy-Syafi'i", layer: "Kutubul Mutaqaddimin", madzhab: "Syafi'i" },
  { name: "Al-Hāwī al-Kabīr", author: "Imam al-Mawardi", layer: "Kutubul Mutaqaddimin", madzhab: "Syafi'i" },
  { name: "Nihāyatul Mathlab fī Dirāyatil Madzhab", author: "Imam al-Haramain al-Juwaini", layer: "Kutubul Mutaqaddimin", madzhab: "Syafi'i" },
  { name: "Ihyā' 'Ulūmiddīn", author: "Hujjatul Islam al-Ghazali", layer: "Kutubul Mutaqaddimin", madzhab: "Syafi'i" },
  { name: "Hāsyiyah al-Bājūrī 'alā Ibni Qāsim", author: "Syaikh Ibrahim al-Bajuri", layer: "Hawasyi & Taqrirat", madzhab: "Syafi'i" },
  { name: "Hāsyiyatān (Qalyūbī wa 'Umairah)", author: "Al-Qalyubi wa 'Umairah", layer: "Hawasyi & Taqrirat", madzhab: "Syafi'i" },
  { name: "I'ānatut Thālibīn", author: "Sayyid Bakri Syatha ad-Dimyathi", layer: "Hawasyi & Fatawa Muta'akhirin", madzhab: "Syafi'i" },
  { name: "Bughyatul Mustarsyidīn", author: "Sayyid Abdurrahman al-Masyhur", layer: "Hawasyi & Fatawa Muta'akhirin", madzhab: "Syafi'i" },
  { name: "Al-Asybāh wan Nazhā'ir", author: "Imam Jalaluddin as-Suyuthi", layer: "Qawā'id Fiqhiyyah & Ushul", madzhab: "Syafi'i" },
  { name: "Qawā'idul Ahkām fī Mashālihil Anām", author: "Al-'Izz bin Abdis Salam", layer: "Qawā'id Fiqhiyyah & Ushul", madzhab: "Syafi'i" },
  { name: "Raddul Muhtār 'alad Durril Mukhtār", author: "Ibnu 'Abidin", layer: "Muqaranah 4 Madzhab", madzhab: "Hanafi" },
  { name: "Badā'i'ush Shanā'i' fī Tartībis Syarā'i'", author: "Imam al-Kasani", layer: "Muqaranah 4 Madzhab", madzhab: "Hanafi" },
  { name: "Al-Mawsū'ah al-Fiqhiyyah al-Kuwaitiyyah", author: "Kementerian Wakaf Kuwait", layer: "Muqaranah 4 Madzhab", madzhab: "Muqaranah" },
  { name: "Al-Mughnī", author: "Ibnu Qudamah al-Maqdisi", layer: "Muqaranah 4 Madzhab", madzhab: "Hanbali" },
  { name: "Bidāyatul Mujtahid wa Nihāyatul Muqtashid", author: "Ibnu Rusyd al-Hafid", layer: "Muqaranah 4 Madzhab", madzhab: "Maliki" },
];

export function extractIbaratFromText(text) {
  if (!text) return [];

  const ibaratList = [];
  const lines = text.split('\n');

  let currentBlock = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Cek header kitab / maraji', contoh: "1. **Kitab Al-Majmu' Syarh al-Muhadzdzab**" atau "### 1. Kitab..."
    const bookHeaderMatch = line.match(/(?:###|\*\*|[0-9]+\.)\s*(?:Kitab|Referensi|Ibarat|Rujukan)?\s*:?\s*\*?\*?([A-Za-z\s'ʻ`\-]+|[\u0600-\u06FF\s]+)\*?\*?/i);

    // Cek teks Arab gundul/berharakat yang panjang (lebih dari 30 karakter dengan proporsi Arab > 40%)
    const arabicChars = (line.match(/[\u0600-\u06FF]/g) || []).length;
    const isArabicLine = arabicChars > 25 && (arabicChars / (line.length || 1) > 0.35);

    // Cek mahallus syahid
    const highlightMatch = line.match(/(?:<u>\*\*【(.*?)】\*\*<\/u>|【(.*?)】|\*\*【(.*?)】\*\*)/);

    if (isArabicLine) {
      // Temukan atau buat blok ibarat
      const highlightText = highlightMatch ? (highlightMatch[1] || highlightMatch[2] || highlightMatch[3]) : '';
      
      // Deteksi nama kitab terdekat di sekitar baris ini (5 baris sebelumnya)
      let detectedBook = "Kitab Turats";
      let detectedLayer = "Kutubul Mu'tamadah";
      let detectedMadzhab = "Syafi'i";

      for (let j = Math.max(0, i - 6); j <= i; j++) {
        const prevLine = lines[j];
        for (const b of CLASSICAL_BOOKS) {
          const simpleName = b.name.toLowerCase().replace(/[^a-z]/g, '');
          const lineSimple = prevLine.toLowerCase().replace(/[^a-z]/g, '');
          if (lineSimple.includes(simpleName.substring(0, 8))) {
            detectedBook = b.name;
            detectedLayer = b.layer;
            detectedMadzhab = b.madzhab;
            break;
          }
        }
      }

      ibaratList.push({
        id: `ibarat-${i}-${Date.now().toString(36)}`,
        book: detectedBook,
        layer: detectedLayer,
        madzhab: detectedMadzhab,
        arabicText: line.replace(/<u>\*\*【/g, '【').replace(/】\*\*<\/u>/g, '】').trim(),
        highlight: highlightText,
        lineIndex: i,
      });
    }
  }

  return ibaratList;
}

/**
 * Format teks ibarat untuk Word dan Capacities dengan styling yang kompatibel
 */
export function formatIbaratForWord(ibaratItem) {
  const highlightTag = ibaratItem.highlight
    ? `<u>**【 ${ibaratItem.highlight} 】**</u>`
    : '';

  return `> **${ibaratItem.book}** (${ibaratItem.layer} - Madzhab ${ibaratItem.madzhab})  
> 
> ${ibaratItem.arabicText}
> 
> *Titik Temu Hukum (Mahallus Syahid):* ${highlightTag}
`;
}
