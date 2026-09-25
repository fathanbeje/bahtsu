# Changelog — Skill `/bahtsu`

Semua pembaruan penting dan evolusi metodologis pada repositori skill `/bahtsu` didokumentasikan di berkas ini.

Format changelog ini mengadopsi standar [Keep a Changelog](https://keepachangelog.com/).

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
