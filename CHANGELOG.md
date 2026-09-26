# Changelog — Skill `/bahtsu`

Semua pembaruan penting dan evolusi metodologis pada repositori skill `/bahtsu` didokumentasikan di berkas ini.

Format changelog ini mengadopsi standar [Keep a Changelog](https://keepachangelog.com/).

## [2.4.0] - 2026-09-26

### 🔒 Security & Privacy
- **Pengecualian Skrip Kredensial & Rotator (`.gitignore`):** Mengecualikan seluruh skrip otomasi internal, generator/rotator akun, serta kredensial (`scripts/buka_9router_dashboard.ps1`, `scripts/ekstrak_akun_antigravity.py`, `scripts/gemini_rotator.py`, `scripts/tambah_akun_gemini.ps1`, `*.token`, `*credentials*.json`, `*accounts*.json`) agar aman dan tidak pernah terdorong ke repositori publik.

### ✨ New Features & Enhancements
- **Protokol Kompatibilitas BiDi Multi-Bahasa (`SKILL.md`):** Menetapkan 4 aturan baku anti-scrambled layout untuk rendering dokumen Markdown campuran Arab-Latin di GitHub:
  1. *Jangkar Judul LTR (BiDi Anchor):* Mewajibkan penomoran rujukan diawali teks Latin (`1. **Kitab: ...**`) agar nomor daftar menempel rapi di margin kiri.
  2. *Pemisah Baris Kosong Ganda (`\n\n`):* Memisahkan judul, kutipan ibarat, terjemahan, wajhul istidlal, dan tautan dengan baris ganda agar terproses sebagai blok independen.
  3. *Isolasi Blockquote Arab (`>`):* Kutipan ibarat Arab berdiri mandiri sehingga otomatis dievaluasi sebagai RTL murni dengan garis kutipan elegan.
  4. *Paragraf Analisis LTR:* Menjamin makna murod dan wajhul istidlal berorientasi LTR murni sehingga tanda baca titik (`.`), petik (`"`), dan kurung (`]`) tidak lagi terbalik ke sisi kiri.
- **Kewajiban Tamyīz Madzhab Non-Syafi'iyyah:** Menegaskan kewajiban label eksplisit pada rujukan Hanafi, Maliki, Hanbali, dan Muqaranah, serta pertanggungjawaban ilmiah status qaul dan makhraj syar'i guna mencegah talfiq bathil.

### 🐛 Bug Fixes & Refactoring
- **Restrukturisasi BiDi 8 Berkas Kajian (`kajian/`):** Mengaudit dan merevisi format 97 kutipan ibarat pada seluruh dokumen kajian di repositori (Hukum Asuransi BPJS Kesehatan, Shalat Arafah, Wasiat Haul, Azimat & Rajah, Model Bisnis Muse AI, Nasab Ba'alawi, Kuota Hangus, dan Shopee VIP) agar tampil rapi dan nyaman dibaca di GitHub web.
- **Pembersihan Duplikasi & Teks `\n` Mentah:** Menghapus duplikasi sub-bab pada naskah Shalat Arafah serta membersihkan string literal `\n\n` pada naskah Wasiat Haul.

### 📚 New Studies & Materials (Kajian Bahtsul Masail)
- **Hukum Asuransi BPJS Kesehatan (`kajian/2026-09-26-hukum-asuransi-bpjs-kesehatan.md`):** Telaah fiqih muamalah dan siyasah syar'iyyah mengenai akad tabarru' jaminan sosial nasional, keabsahan kewajiban iuran oleh pemerintah, serta ketiadaan riba dan gharar terlarang.
- **Hukum Azimat dan Rajah (`kajian/2026-09-26-hukum-penggunaan-azimat-rajah.md`):** Telaah akidah dan fiqih mengenai ta'widz ayat Al-Qur'an, batasan ilmu wifiq, dan adab membawa azimat ke toilet.
- **Wasiat Harta Sawah untuk Haul (`kajian/2026-09-26-wasiat-harta-untuk-haul.md`):** Telaah batas sepertiga tirkah, keabsahan wasiat sedekah makanan dan doa haul, serta status tanah sawah sebagai wasiat manfaat abadi (*waqaf wasiyyah*).

---

## [2.3.0] - 2026-09-26

### ✨ New Features & Improvements
- **Redefinisi Metadata Penyusun Naskah (Dynamic AI Model Agent Attribution):** Mengganti baris `**Disusun Oleh:** Tim Asistensi Telaah Bahtsul Masail (AI Research Assistant)` menjadi konteks penyusun naskah yang akuntabel dan kondisional: `**Penyusun Naskah:** [Model AI Aktif] — Tim Asistensi Telaah Bahtsul Masail (AI Model Agent)` (misal saat ini: `Gemini 3.8 Flash (High)`).
- **Penegasan Akuntabilitas Ilmiah (*Al-Amānah al-'Ilmiyyah*):** Menetapkan Protokol ke-4 pada `SKILL.md` yang melarang keras atribusi anonim atau samaran generik, mewajibkan deteksi model aktif secara dinamis (non-hardcoded), serta mewajibkan validitas sitasi agar alur istidlal dan ibarat dapat dipertanggungjawabkan serta diaudit (*auditable*) oleh para alim ulama.
- **Pembaruan Menyeluruh Template & Arsip Kajian:** Memperbarui `SKILL.md`, `references/template_keputusan.md`, `docs/planning_and_architecture.md`, `README.md`, serta menyelaraskan metadata pada seluruh berkas draf kajian di direktori `kajian/`.
- **Sinkronisasi Sistem Global Antigravity:** Menyelaraskan seluruh berkas repositori dengan instalasi skill global di `~/.gemini/config/skills/bahtsu/`.

---

## [2.2.0] - 2026-09-25

### ✨ New Features
- **Redefinisi Header & Etika Dokumen (*Taswidah Al-Mabahits*):** Mengubah header default dari `HASIL KEPUTUSAN BAHTSUL MASA'IL` menjadi `# DRAF TASWIDAH & BAHAN KAJIAN BAHTSUL MASA'IL` yang dilengkapi dengan catatan penegasan resmi: *"Draf telaah awal berbasis penelusuran turats & sintesis AI — Belum menjadi keputusan resmi musyawarah dan memerlukan pembahasan serta tashīh alim ulama dalam sidang resmi Bahtsul Masail."*
- **Otomatisasi Arsip Repositori (`kajian/`):** Mewajibkan AI untuk secara otomatis menulis seluruh naskah hasil perumusan ke dalam berkas `kajian/YYYY-MM-DD-slug-tema.md` dan langsung mengeksekusi `git add`, `git commit`, serta `git push origin main` ke GitHub setiap kali pembahasan selesai.
- **Penyediaan Direktori `kajian/`:** Membuat folder `kajian/` beserta `kajian/README.md` sebagai repositori permanen naskah-naskah taswidah Bahtsul Masail di GitHub.

---

## [2.1.0] - 2026-09-25

### ✨ New Features
- **Integrasi Dokumen Keputusan Munas Bandar Lampung 1992:** Menambahkan modul referensi `references/sistem_pengambilan_keputusan_munas_lampung_1992.md` yang memuat piagam resmi *"Sistem Pengambilan Keputusan Hukum dalam Bahtsul Masail di Lingkungan NU"*, mengukuhkan konsep *Bermadzhab secara Qauli* dan *Bermadzhab secara Manhaji*, serta hierarki 4 tahap penetapan hukum.
- **Integrasi Metode Istinbath Muktamar Jombang 2015:** Menambahkan modul referensi `references/metode_istinbath_muktamar_jombang_2015.md` yang memuat operasionalisasi tiga instrumen istinbath: **Metode Bayani** (semantik kebahasaan teks), **Metode Qiyasi** (analogi ushuli dan tahqiqul manath), dan **Metode Istishlahi / Maqashidi** (kemaslahatan publik dan maqashid syariat).
- **Integrasi Klasifikasi Tri-Matra Masail:** Menambahkan modul referensi `references/klasifikasi_masail_nu.md` yang merinci pembedaan operasional dan metodologi untuk *Masā'il Wāqi'iyyah* (aktual kasuistik), *Masā'il Maudlū'iyyah* (tematik konseptual kebangsaan/peradaban seperti konsep *muwathanah* Munas Banjar 2019), dan *Masā'il Qānūniyyah* (telaah yuridis perundang-undangan dan kebijakan publik).
- **Penetapan Format Highlight Multi-Platform:** Menstandarkan format penyorotan kalimat kunci ibarat (*mahallus syahid*) dengan format `<u>**【 ... 】**</u>` yang teruji kompatibel sempurna baik di **Capacities** maupun **Microsoft Word**.

### 🔧 Improvements
- **Pengayaan Metodologi Ilhaq & Taqrir (`references/metodologi_ilhaq_taqrir.md`):** Melengkapi rukun ilhaq (Al-Mulhaq, Al-Mulhaq bih, Wajhul Ilhaq, Nafyul Fariq al-Mu'atstsir), tiga tahap verifikasi manath (takhrij, tanqih, tahqiq), serta ketentuan *Intiqal al-Madzhab* tanpa talfiq bathil.
- **Penyempurnaan Template Keputusan (`references/template_keputusan.md`):** Mengakomodasi draf output berstandar LBM PBNU untuk ketiga kategori masail dengan contoh penyorotan kalimat kunci dan spasi ganda antar-baris.
- **Sinkronisasi Dua Arah:** Menyelaraskan seluruh instruksi `SKILL.md` antara repositori proyek dan instalasi global Antigravity (`~/.gemini/config/skills/bahtsu/SKILL.md`).

---

## [2.0.0] - 2026-09-25

### ✨ New Features
- **Pemberlakuan Multi-Referensi Mutlak (*Multi-Source Mandate*):** Menetapkan kewajiban minimal 3 hingga 7+ ibarat berantai untuk setiap sub-pokok masalah, melarang keras penggunaan referensi tunggal (*Zero Single-Source Policy*).
- **Integrasi Metodologi Resmi Munas & Konbes NU 2017:** Menambahkan modul metodologi *Taqrīr Jamā'i* (pentarjihan kolektif berbasis maslahat dan dalil) dan *Ilhāqul Masā'il bi Nazhā'irihā* (analogi kasus baru ke furu' klasik) pada `references/metodologi_ilhaq_taqrir.md`.
- **Fitur Multi-Query Search CLI:** Mengembangkan opsi `--multi` / `-m` pada `scripts/turath_search.js` untuk menjalankan pencarian beberapa kata kunci Arab secara paralel dengan deduplikasi otomatis.
- **Dokumentasi Perencanaan & Arsitektur:** Menambahkan `docs/planning_and_architecture.md` yang memuat komparasi pola rumusan, peta 5 lapisan kitab, dan alur kerja penelusuran online.

### 🔧 Improvements
- **Format Keputusan Standar LBM PBNU:** Memperbarui `references/template_keputusan.md` agar mencakup sub-bagian *Wajhul Istidlal / Wajhul Ilhāq* di setiap kutipan ibarat.
- **Penyempurnaan Turath Search API:** Memperbaiki pengiriman parameter `cat_id` langsung ke endpoint REST API v3 Turath.io untuk hasil pencarian Kategori 16 (Fiqh Syafi'i) yang akurat.

---

## [1.0.0] - 2026-09-25

### ✨ Initial Release
- Rilis perdana skill `/bahtsu` untuk lingkungan AI agentic (Google Antigravity, Claude, Cursor, Windsurf).
- Penyediaan skrip penelusuran online Turath.io (`scripts/turath_search.js`).
- Penyusunan panduan tarjih madzhab Syafi'i (`references/hierarki_tarjih_syafii.md`).
- Pembuatan template keputusan awal (`references/template_keputusan.md`).
