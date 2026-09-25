# 📚 Skill `/bahtsu` — Asisten Perumus Bahtsul Masail Pesantren (Standar Munas & Konbes NU)

Skill resmi untuk AI coding assistant dan agent (Google Antigravity, Claude Desktop, Cursor, Windsurf, dll.) untuk meneliti masalah hukum, mencari multi-ibarat kitab kuning secara 100% online, dan merumuskan draf taswidah bahan kajian Bahtsul Masail berstandar resmi **Musyawarah Nasional (Munas) Alim Ulama, Konferensi Besar (Konbes) Nahdlatul Ulama, dan LBM PBNU**.

> **⚠️ Catatan Etika & Status Dokumen:**  
> Seluruh naskah yang dihasilkan melalui skill ini berstatus sebagai **DRAF TASWIDAH & BAHAN KAJIAN AWAL** (*Taswīdah al-Mabāhits*). Hasil sintesis AI ini disiapkan sebagai materi persidangan dan telaah awal, **bukan keputusan final musyawarah**, karena keabsahan fatwa dan keputusan hukum syar'i di lingkungan Nahdlatul Ulama mutlak membutuhkan musyawarah para alim ulama (*al-munāzharah wal munāqasyah*) serta pengesahan (*tashīh*) dari jajaran Syuriyah Nahdlatul Ulama.

---

## 🏛️ Fondasi Metodologis Resmi Nahdlatul Ulama

Skill ini secara komprehensif mengintegrasikan seluruh konsensus metodologis Bahtsul Masail Nahdlatul Ulama:
1. **Muktamar NU ke-1 (Surabaya 1926):** Peletakan asas bermazhab empat dan urutan hierarki pentarjihan madzhab Syafi'i (Syaikhoni $\rightarrow$ Nawawi $\rightarrow$ Rafi'i $\rightarrow$ Jumhur $\rightarrow$ Al-A'lam $\rightarrow$ Al-Awro').
2. **Munas Alim Ulama (Bandar Lampung 1992):** Piagam *"Sistem Pengambilan Keputusan Hukum dalam Bahtsul Masail di Lingkungan NU"*, melembagakan konsep **Bermadzhab secara Qauli** dan **Bermadzhab secara Manhaji**, serta prosedur 4 tingkat: *Qauli $\rightarrow$ Taqrir Jama'i $\rightarrow$ Ilhaq al-Masail bi Nazha'iriha $\rightarrow$ Istinbath Jama'i*.
3. **Muktamar NU ke-33 (Jombang 2015):** Formulasi tiga instrumen operasional *Istinbath al-Ahkam*: **Metode Bayani** (semantik kebahasaan teks suci), **Metode Qiyasi** (analogi ushuli dan tahqiqul manath), dan **Metode Istishlahi / Maqashidi** (kemaslahatan publik dan *maqashid asy-syari'ah*).
4. **Munas Alim Ulama & Konbes NU (NTB 2017):** Keputusan Komisi Maudlu'iyyah tentang pematangan prosedur *Taqrir Jama'i*, *Ilhaqul Masail bi Nazha'iriha*, Teori Multidimensi (*Nadhariyyatu Ta'addudil Ab'ad*), serta kaidah perubahan fatwa (*Taghayyur al-Ahkam*).
5. **Munas Banjar (2019), Muktamar 34 (2021), & Perkum LBM-NU (2022):** Penataan tri-matra forum Bahtsul Masail: *Masā'il Wāqi'iyyah* (kasuistik aktual), *Masā'il Maudlū'iyyah* (tematik peradaban/kebangsaan seperti konsep *muwathanah*), dan *Masā'il Qānūniyyah* (telaah yuridis undang-undang negara).

---

## ⚠️ Aturan Mutlak Perumusan (Mandatory Protocols)

1. **Larangan Referensi Tunggal (*Zero Single-Source Policy*):**  
   Setiap rumusan jawaban/sub-pertanyaan **WAJIB menyertakan minimal 3 hingga 7+ ibarat** dari lapisan kitab yang berbeda (*Kutubul Mutaqaddimin, Syaikhoni/Muta'akhirin, Hawasyi/Fatawa, Qawa'id Fiqhiyyah/Ushul, dan Muqaranah 4 Madzhab*).
2. **Penyorotan Kalimat Kunci Ibarat (*Multi-App Highlight*):**  
   Kalimat krusial dalil/titik temu hukum (*mahallus syahid*) disoroti dengan format kombinasi `<u>**【 ... 】**</u>` yang teruji kompatibel sempurna baik di **Capacities** maupun **Microsoft Word**.
3. **Wajhul Istidlal & Wajhul Ilhāq yang Argumentatif:**  
   Setiap kutipan teks wajib disertai penjelasan korelasi mengapa teks turats tersebut menjadi landasan hukum bagi kasus kontemporer yang dibahas.
4. **Otomatisasi Pengarsipan Repositori (.md):**  
   Setiap rumusan yang telah dituntaskan otomatis disimpan ke berkas `kajian/YYYY-MM-DD-slug-tema.md` dan di-push ke repositori GitHub.

---

## 🚀 Cara Pemasangan & Penggunaan

### 1. Di Google Antigravity
Skill ini otomatis aktif di sistem Anda. Cukup ketik perintah slash command:
```
/bahtsu [masalah fiqih]
```
atau gunakan prompt alami:
> *"Gunakan skill bahtsu untuk merumuskan hukum status transaksi cryptocurrency..."*

### 2. Di Komputer Lain (Via Git)
Clone repositori ini langsung ke direktori skills perangkat Anda:
```bash
git clone https://github.com/fathanbeje/bahtsu.git
```

---

## 🛠️ Utilitas Pencari: `turath_search.js`

Dilengkapi skrip CLI canggih untuk menarik multi-ibarat langsung dari **Turath.io REST API v3** secara real-time tanpa perlu download database offline:

```bash
# Pencarian kueri tunggal khusus Kategori 16 (Fiqh Syafi'i)
node scripts/turath_search.js -q "تكبيرة الإحرام" -c 16 -l 3

# Pencarian Multi-Kueri Berantai (Batch Search)
node scripts/turath_search.js -m "من مات وعليه صلاة,فدية الصلاة,الاستئجار على الصلاة" -l 3

# Format JSON untuk pemrosesan script lanjutan
node scripts/turath_search.js -q "الاستصناع" --json
```

---

## 📂 Struktur Direktori

```
bahtsu/
├── SKILL.md                                           # Instruksi utama & mandatory multi-source protocol
├── README.md                                          # Dokumentasi lengkap sistem
├── CHANGELOG.md                                       # Catatan rilis dan evolusi metodologis
├── .gitignore                                         # File pengabaian git
├── docs/
│   └── planning_and_architecture.md                  # Peta arsitektur, 5 lapisan kitab & alur kerja
├── kajian/                                            # Arsip berkas taswidah hasil kajian (.md)
│   └── README.md                                     # Panduan & kredensial dokumen arsip
├── scripts/
│   └── turath_search.js                              # CLI pencarian multi-ibarat online Turath.io API v3
└── references/
    ├── sistem_pengambilan_keputusan_munas_lampung_1992.md  # Naskah keputusan sistem keputusan Munas Lampung 1992
    ├── metode_istinbath_muktamar_jombang_2015.md         # Panduan operasional Bayani, Qiyasi, Maqashidi
    ├── klasifikasi_masail_nu.md                          # Panduan Masail Waqi'iyyah, Maudlu'iyyah, Qanuniyyah
    ├── metodologi_ilhaq_taqrir.md                        # Naskah Taqrīr Jamā'i & Ilhāq Munas NU 2017 & rukun ilhaq
    ├── hierarki_tarjih_syafii.md                         # Panduan urutan qaul mu'tamad & tarjih madzhab Syafi'i
    └── template_keputusan.md                             # Format baku draf taswidah bahan kajian Bahtsul Masail
```

---

## 📜 Lisensi
MIT License — Didedikasikan untuk kemajuan kajian fiqih dan khazanah Bahtsul Masail Pesantren Nahdlatul Ulama.
