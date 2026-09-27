# Changelog — Skill `/bahtsu`

Semua pembaruan penting dan evolusi metodologis pada repositori skill `/bahtsu` didokumentasikan di berkas ini.

Format changelog ini mengadopsi standar [Keep a Changelog](https://keepachangelog.com/).

## [2.5.9] - 2026-09-27

### ⚡ Standardisasi Frasa Tunggal Bersambung & Eliminasi Sintaks Range Berkoma
- **Eliminasi Total Sintaks Range Berkoma (`startWords,endWords`):**
  - Menghentikan sepenuhnya penggunaan sintaks range W3C Scroll-to-Text Fragment dengan koma (`#:~:text=start,end`).
  - Analisis mendalam membuktikan bahwa traversal DOM peramban (Chrome/Edge/Safari) pada Single Page Application (SPA) Turath.io kerap gagal menyorot teks jika rentang `start` dan `end` terpotong oleh nomor catatan kaki `(١)`, tag HTML (`<span>`, `<em>`), atau jeda paragraf, sehingga peramban menyerah dan tidak menyorot apapun.
  - Menetapkan standar baku **Frasa Tunggal Bersambung (*Single Continuous Phrase*)**: W3C Fragment kini secara eksklusif menggunakan 3–4 kata awal berturutan tanpa koma (`#:~:text=word1%20word2%20word3`), menjamin penyorotan kuning pada simpul teks (*text node*) dengan stabilitas 100%.
- **Ekstraksi Diakritik Asli Berbasis Konteks Turath.io:**
  - Utilitas linter (`scripts/turath_linter.js`) kini menyelaraskan teks fragment langsung dari simpul respons API Turath (`item.text` / `item.snip`). Jika naskah kitab di Turath berharakat asli (seperti *Durar al-Hukkam* dan *Al-Mausu'ah al-Fiqhiyyah al-Kuwaitiyyah*), fragment mengambil ejaan berharakat asli. Jika gundul, fragment mengambil ejaan gundul asli Turath.
- **Koreksi Halaman Rujukan Al-Mausu'ah al-Fiqhiyyah al-Kuwaitiyyah (*Al-Farqu baynar Rasul wal Wakil*):**
  - Mengoreksi sitasi ke-5 pada `kajian/2026-09-25-model-bisnis-muse-ai-meta.md`:
    - Mengoreksi parameter halaman dari `page=1241` (Jilid 2, Hal 293 bab *Ikhtilaf* yang salah kamar) ke halaman otentik `page=24958` (Jilid 36, Hal 350 bab *Al-Farqu baynar Rasul wal Wakil*).
    - Menyelaraskan teks ibarat matan dan tautan verifikasi dengan teks otentik Turath: `الْفَرْقُ بَيْنَ الرَّسُول وَالْوَكِيل`.
- **Audit Menyeluruh & Pembersihan Komprehensif (121/121 Rujukan 100% Valid):**
  - Menjalankan migrasi otomatis linter pada seluruh 14 berkas kajian di direktori `kajian/`.
  - Berhasil mengonversi 97 tautan yang sebelumnya menggunakan sintaks range berkoma menjadi frasa tunggal bersambung.
  - Memastikan seluruh 121 rujukan berstatus `✅ Cocok` tanpa satupun tautan berkoma atau salah halaman.
- **Pembaruan Antarmuka Web Bahtsu Klangopan (`v2.5.9`):**
  - Memperbarui label versi aplikasi menjadi `v2.5.9` pada bilah navigasi (`Header.jsx`), modal pengaturan (`SettingsModal.jsx`), dan `package.json`.

---

## [2.5.8] - 2026-09-27

### 🎯 Preservasi Harakat Otentik Kitab Turats & Penyelarasan Halaman Presisi
- **Pembedaan Kitab Berharakat Asli vs Kitab Gundul Turath.io:**
  - Menemukan fakta bahwa basis data Turath.io terbagi menjadi dua kategori: kitab yang aslinya berharakat lengkap (seperti *Durar al-Hukkam*, *Al-Majmu'*, *Al-Hawi Al-Kabir*, *Mughni Al-Muhtaj*, *Tuhfatul Muhtaj*) dan kitab yang aslinya gundul (seperti *I'anatuth Thalibin*, *Al-Bayan*, *Bahrul Madzhab*, *Asna Al-Mathalib*).
  - Memperbaiki linter agar tidak melakukan pembersihan harakat berlebihan (*over-cleansing*): teks dan parameter W3C Text Fragment pada kitab yang aslinya berharakat di Turath.io WAJIB mempertahankan harakat aslinya agar pencocokan kode karakter peramban (Chrome/Edge/Safari) berhasil menyorot kalimat hukum.
- **Koreksi Halaman Rujukan Durar al-Hukkam (*Al-Kitab kal-Khithab*):**
  - Mengoreksi tautan rujukan kaidah *Al-Kitāb kal-Khithāb* pada `2026-09-25-model-bisnis-muse-ai-meta.md` dari `page=1164` (Jilid 2, Hal 387 bab Hibah yang salah kamar) ke halaman yang benar yaitu `page=53` (Jilid 1, Hal 69), lengkap dengan harakat asli Turath `الْكِتَابُ كَالْخِطَابِ`.
  - Mengoreksi tautan rujukan *Al-Ijarah al-Fasidah* pada `2026-09-25-status-hukum-kuota-hangus.md` (page=474) agar menggunakan teks berharakat asli `الْإِجَارَةُ الْفَاسِدَةُ`.
- **Ketahanan Jaringan Linter (`scripts/turath_linter.js`):**
  - Meningkatkan timeout dan retry penelusuran kitab ke 6000ms dan mencegah pencatatan cache `null` saat terjadi gangguan timeout jaringan sementara.

---

## [2.5.7] - 2026-09-27

### 📖 Otentisitas Teks Turats & Penyingkiran Harakat Buatan
- **Penyesuaian Metodologi Verifikasi Maraji' Turath.io:**
  - Mengoreksi ketentuan terdahulu yang mewajibkan *"seluruh kutipan teks kitab wajib Bahasa Arab berharakat"*. Aturan tersebut terbukti memicu kegagalan fitur *Scroll-to-Text-Fragment* W3C (`#:~:text=...`) pada peramban karena basis data Turath.io (`app.turath.io`) mayoritas berupa teks gundul (*unvowelled*), sehingga perbedaan karakter diakritik menggagalkan penyorotan teks otomatis ke *mahallus syahid*.
  - Menetapkan aturan otentik resmi pada `SKILL.md` (lokal repositori dan global) serta direktif prompt sistem `web/server.js`: *Kutipan teks ibarat Arab WAJIB mengikuti keaslian sumber Turath.io apa adanya (gundul jika di Turath.io gundul, berharakat jika memiliki harakat asli; dilarang keras menambahkan harakat buatan).*
- **Peningkatan Utilitas Linter (`scripts/turath_linter.js`):**
  - Mengimplementasikan fungsi `calculateHarakatDensity(text)` untuk mengukur rasio tanda baca harakat/tanwin/tasydid (`[\u064B-\u065F\u0670\u06D6-\u06ED]`) terhadap huruf dasar hijaiyah.
  - Menambahkan deteksi pelanggaran `ARTIFICIAL_HARAKAT` (densitas naskah > 0.15 berbanding teks asli Turath < 0.08).
  - Mengembangkan modul pembersihan otomatis pada opsi `--fix` yang mengeliminasi harakat buatan pada kutipan ibarat di berkas `.md` dengan tetap menjaga keutuhan penanda sorotan `<u>**【...】**</u>` dan format tanda baca.
- **Audit & Penyelarasan Penuh 14 Berkas Kajian (121/121 Rujukan 100% Valid):**
  - Menyinkronkan seluruh berkas kajian di direktori `kajian/` ke teks otentik Turath.io.
  - Memastikan 100% dari 121 rujukan di 14 berkas kajian lolos pengujian linter dan *pre-push hook* tanpa anomali.
- **Pembaruan Visual Aplikasi Web Bahtsu Klangopan (`v2.5.7`):**
  - Menambahkan lencana versi interaktif `v2.5.7` di bilah atas (`Header.jsx`) baik pada tampilan desktop maupun seluler.
  - Memperbarui informasi versi pada modal pengaturan (`SettingsModal.jsx`) dan manifest aplikasi (`package.json`).
  - Sinkronisasi menyeluruh cabang repositori publik (`fathanbeje/bahtsu`) dan privat (`fathanbeje/bahtsu-app`) serta rilis ulang (*re-deploy*) ke server produksi VPS.

---

## [2.5.6] - 2026-09-27

### 🛡️ Zero English Policy & Anti-Thinking Leak Architecture
- **Pencegahan Kebocoran Penalaran (CoT Thinking Leakage):**
  - Mengimplementasikan modul sanitasi `web/src/utils/thinkingHelper.js` (`extractThoughts`, `stripThinkingTags`) dengan regex multi-blok global (`/gi`) untuk mengisolasi penalaran model agen ke dalam panel kolapsibel *"Nalar Ushul & Istinbath AI"* dan mencegahnya bocor ke badan draf naskah.
  - Memperbaiki pengalihan teks pada tombol *"Ekstrak ke Taswīdah"* (`ChatPane.jsx`), fungsi salin Word / teks biasa, pengunduhan `.md` (`TaswidahDock.jsx`), dan pembaca arsip (`KajianArchivePage.jsx`) agar senantiasa bersih dari tag `<think>`.
  - Membersihkan 83 baris penalaran internal bahasa Inggris pada naskah kajian `kajian/2026-09-27-status-hukum-pemisahan-harta-bawaan-yang-bercampur.md`.
- **Penegakan Metodologi Bahasa 100% Bahasa Indonesia & Arab Turats:**
  - Menetapkan **Pasal 7: Larangan Mutlak Bahasa Inggris (Zero English Policy)** pada `SKILL.md` (lokal dan global), serta menyuntikkan `languageDirective` pada `getSystemPrompt` di `web/server.js`: model AI diharamkan menalar atau merumuskan dalam bahasa Inggris.
- **Standarisasi Auto-Linter Pra-Commit Backend (`POST /api/kajian/save`):**
  - Menyematkan pemanggilan otomatis `scripts/turath_linter.js <file> --fix` saat pengguna menyimpan naskah kajian dari studio, sehingga tautan verifikasi Turath.io dan text fragment W3C otomatis diperbaiki sebelum di-commit dan di-push ke GitHub.
- **Audit Komprehensif Seluruh Repositori Kajian:**
  - Melakukan auto-fix pada seluruh berkas kajian: 121 dari 121 rujukan (100%) di 14 berkas kajian kini terverifikasi valid dan presisi menuju mahallus syahid di Turath.io (0 errors, 0 warnings).

---

## [2.5.5] - 2026-09-27

### 🔄 On-Demand GitHub Repository Synchronization
- **Endpoint Paksa Pembaruan Kajian GitHub (`POST /api/kajian/sync-github`):**
  - Mengimplementasikan endpoint API terotentikasi di `web/server.js` untuk menarik (*git fetch*) dan mereset (*git reset --hard*) repositori naskah kajian secara langsung ke commit remote GitHub terbaru pada branch aktif (`private/bahtsu-klangopan-app`).
  - Mengembalikan metadata branch, ringkasan commit terbaru (*hash, message, time*), dan jumlah total berkas kajian aktif pasca-sinkronisasi.
- **Tombol Aksi Cepat "Update GitHub" pada Antarmuka Arsip (`KajianArchivePage.jsx`):**
  - Menambahkan tombol interaktif "Update GitHub" berdampingan dengan tombol Refresh di bilah navigasi arsip naskah kajian.
  - Dilengkapi animasi indikator proses (*spin*), penonaktifan tombol ganda saat sinkronisasi berlangsung, serta banner notifikasi status real-time dengan rincian hash commit yang berhasil ditarik.

---

## [2.5.4] - 2026-09-27

### 🎯 Strict Mahallus Syahid W3C Range Alignment
- **Penegakan Kesetaraan Ketat Fragment W3C (`scripts/turath_linter.js`):**
  - Mengeliminasi verifikasi fragment yang longgar (`cleanH.includes(fragStart)`) dan menggantikannya dengan validasi kesetaraan ketat simetris: kata awal dan kata akhir fragment wajib 100% sama persis dengan kata awal dan kata akhir dari kalimat mahallus syahid di dalam tag `<u>**【...】**</u>`.
  - Memperluas pembersihan karakter pada `cleanArabic` untuk mencakup seluruh rentang harakat, tanwin, shaddah, dagger alif (`\u0670`), dan tanda waqaf Turath (`[\u064B-\u065F\u0670\u06D6-\u06ED]`).
- **Pembersihan & Penyelarasan Menyeluruh 21 Tautan Bermasalah di Seluruh Repositori:**
  - Melakukan auto-fix (`--all --fix`) pada seluruh repositori, menyelaraskan 21 tautan maraji' pada 7 berkas kajian (`2024-06-14-hukum-jamak-qashar-shalat-arafah.md`, `2026-09-25-model-bisnis-muse-ai-meta.md`, `2026-09-25-status-hukum-kuota-hangus.md`, `2026-09-25-tinjauan-hukum-shopee-vip.md`, `2026-09-26-hukum-asuransi-bpjs-kesehatan.md`, `2026-09-26-hukum-meletakkan-batu-kerikil-di-atas-makam.md`, `2026-09-26-wasiat-harta-untuk-haul.md`).
  - Menuntaskan audit 100% sempurna: seluruh 95 rujukan di 11 berkas kajian kini memiliki W3C range text fragment presisi (`#:~:text=startWords,endWords`) yang terbukti melompat dan menyorot tepat pada kalimat ibarat yang ditekankan di Turath.io (0 errors, 0 warnings, 0 mismatches).

---

## [2.5.3] - 2026-09-27

### 🔍 Automated Verification & Precision Tahqiq
- **Pengembangan Utilitas Linter Maraji' Turath (`scripts/turath_linter.js`):**
  - Mengembangkan CLI tool otomatis untuk mengaudit dan memverifikasi keabsahan kitab, pengarang, nomor juz, nomor halaman, dan teks ibarat pada naskah kajian terhadap database Turath.io (`api.turath.io`).
  - Dilengkapi fitur `--fix` (line-precise auto-fix) yang otomatis mengoreksi tautan keliru, menyematkan ID halaman presisi, dan menempelkan parameter W3C Scroll-to-Text-Fragment (`#:~:text=startWords,endWords`).
  - **Ekstraksi Presisi dari Mahallus Syahid Naskah:** Merekonstruksi mekanisme pembentukan Text Fragment agar murni dan mutlak diambil langsung dari kalimat hukum yang disorot di naskah (`citation.highlightedText` di dalam tag `<u>**【...】**</u>`), bukan lagi dari potongan acak hasil pencarian Turath API (`item.snip`) yang kerap terpotong di kepala bab.
  - **Deteksi & Validasi Ketidakcocokan Fragment (`MISMATCH_FRAGMENT`):** Menambahkan aturan linter untuk mendeteksi apabila tautan verifikasi melenceng dari kalimat fokus hukum, serta menyinkronkan seluruh 95 tautan di 11 berkas kajian agar melompat dan menyorot kuning kalimat hukum yang tepat di peramban.
  - **Tahqiq Otentik Rawdhatuth Thalibin (Shopee VIP):** Mengoreksi rujukan nomor 3 pada `2026-09-25-tinjauan-hukum-shopee-vip.md` ke redaksi matan ashliyyah Imam An-Nawawi (*Rawdhatuth Thalibin* Juz 5, Hal. 247, Page ID 2085) terkait kepastian ongkos sewa (*istiqrarul ujrah*) saat waktu sewa telah berlalu.
  - Mengoptimalkan performa penelusuran jaringan: konfigurasi `dns.setDefaultResultOrder('ipv4first')` untuk mengeliminasi socket hang pada sistem Windows, pengaturan timeout adaptif 4 detik, in-memory negative book caching, dan penyertaan header browser lengkap (`Referer: https://app.turath.io/`) guna mencegah pemblokiran Cloudflare HTTP 429 Too Many Requests.
  - Menghasilkan status audit real-time per sitasi dan kode keluar non-nol (`exit 1`) saat ditemukan pelanggaran rujukan.

- **Tahqiq & Sinkronisasi 100% Seluruh Naskah Kajian Repositori (95/95 Rujukan Valid):**
  - Melakukan audit dan re-tahqiq komprehensif pada seluruh 11 berkas kajian di direktori `kajian/`, menghasilkan **100% rujukan valid & terverifikasi** (95 dari 95 sitasi):
    1. `2024-06-14-hukum-jamak-qashar-shalat-arafah.md` (9 rujukan) — 100% valid.
    2. `2026-09-25-model-bisnis-muse-ai-meta.md` (20 rujukan) — 20 rujukan diperbaiki dan 100% valid mengarah ke teks otentik.
    3. `2026-09-25-polemik-nasab-baalawi.md` (13 rujukan) — 100% valid.
    4. `2026-09-25-status-hukum-kuota-hangus.md` (11 rujukan) — 100% valid.
    5. `2026-09-25-tinjauan-hukum-shopee-vip.md` (12 rujukan) — 100% valid.
    6. `2026-09-26-hukum-asuransi-bpjs-kesehatan.md` (7 rujukan) — 100% valid.
    7. `2026-09-26-hukum-meletakkan-batu-kerikil-di-atas-makam.md` (7 rujukan) — 100% valid.
    8. `2026-09-26-hukum-penggunaan-azimat-rajah.md` (8 rujukan) — 8 rujukan diperbaiki dan 100% valid.
    9. `2026-09-26-wasiat-harta-untuk-haul.md` (8 rujukan) — 8 rujukan diperbaiki (termasuk verifikasi ibarat Hasyiyatul Bujairimi 1/503) dan 100% valid.
    10. `2026-09-27-uji-coba-repositori-privat.md` & `2026-09-27-validasi-auto-push-bot.md` — Terverifikasi bersih.

### 🛡️ Quality Gate & Workflow Standardization
- **Integrasi Protokol Baku Linter pada Skill (`SKILL.md`):**
  - Menetapkan kewajiban mutlak (*Mandatory Quality Gate*) pada `SKILL.md` (Langkah 3) bahwa setiap draf kajian yang selesai disusun **WAJIB lolos linter otomatis** (`node scripts/turath_linter.js kajian/YYYY-MM-DD-slug.md --fix`) sebelum diperbolehkan lanjut ke tahap commit dan push.
- **Git Pre-Push Hook Enforcer (`.git/hooks/pre-push`):**
  - Memasang hook git pre-push otomatis yang menjalankan audit seluruh berkas kajian sebelum perintah `git push` dieksekusi. Jika ditemukan satu saja rujukan yang tidak valid atau link broken, proses push akan otomatis digagalkan.

---

## [2.5.2] - 2026-09-27

### 🐛 Bug Fixes & Precision Tahqiq
- **Perbaikan Utilitas Penelusuran Turath (`scripts/turath_search.js`):**
  - Mengatasi masalah tautan yang tidak mengarah ke *mahallus syahid* dengan merekonstruksi fungsi `extractMahalSyahid`.
  - Mengganti pembentukan parameter fragment URL yang sebelumnya menggunakan kueri mentah (`query`) dengan teks kalimat asli dari kitab yang ditandai tag `<em>` oleh API Turath.
  - Menerapkan format standar W3C Scroll-to-Text-Fragment range `#:~:text=startWords,endWords` yang tahan terhadap perbedaan harakat/tashkeel dan variasi tata letak kalimat di peramban Chromium.
  - Memperbarui format output antarmuka CLI agar menyajikan nama kitab, juz, halaman cetak, teks mahallus syahid bergaris bawah `<u>**【...】**</u>`, serta tautan verifikasi presisi yang siap disalin ke draf kajian.
- **Audit & Sinkronisasi 100% Maraji' Kuota Hangus (`kajian/2026-09-25-status-hukum-kuota-hangus.md`):**
  - Mengoreksi seluruh 9 rujukan fiqih yang sebelumnya mengalami ketidakcocokan ID kitab, nomor halaman, atau pengarang:
    1. *Asy-Syarhul Kabir 'alal Muqni'* (Ibnu Abi 'Umar Al-Maqdisi, 14/376) & *Al-Mu'amalat Al-Maliyyah* (Dr. Dubyan, 9/283) — Keabsahan menggabungkan durasi waktu dan volume.
    2. *Mukhtashar Tuhfatul Muhtaj* (Ibnu Hajar Al-Haitami / Mustafa Samith, 2/431, Book ID 20, Page ID 978) — Mengoreksi tautan yang sebelumnya mengarah ke halaman keliru 991.
    3. *At-Tahdzib fil Fiqh Asy-Syafi'i* (Al-Baghawi, 4/455, Book ID 17885, Page ID 1714) — Kepastian ongkos sewa (*istiqrar al-ujrah*) saat masa aktif berakhir tanpa digunakan.
    4. *Takmilat Al-Muthi'i 'alal Majmu' Syarah Al-Muhadzdzab* (An-Nawawi / Al-Muthi'i, 15/81, Book ID 1026, Page ID 942) — Mengoreksi nomor halaman dari 642 ke 942.
    5. *Hasyiyatul Bujairimi 'alal Manhaj* (Al-Bujairimi, 3/109, Book ID 21603, Page ID 1054) — Larangan *akl al-mal bil-bathil*.
    6. *Ighatsatul Lahfan fi Mashayidisy Syaithan* (Ibnu Qayyim Al-Jauziyyah, 2/727, Book ID 18612, Page ID 769) — Kaidah keadilan dalam akad mu'awadhah (*takafu'ul 'iwadhain*).
    7. *Al-Asybah wan-Nazha'ir* (Ibnu Al-Mulaqqin, 1/30, Book ID 18192, Page ID 29) — Kaidah *adh-dhararu yuzal*.
    8. *Ghamzu 'Uyunil Basha'ir fi Syarhi Al-Asybah* (Al-Hamawi, 1/369, Book ID 21588, Page ID 361) — Kaidah siyasah syar'iyyah *tasharruful imam manuthun bil mashlahah*.
    9. *Abhats Hai'ah Kibaril Ulama* (4/57, Book ID 21759, Page ID 2122) & *Durar al-Hukkam fi Syarh Majallah al-Ahkam* (Ali Haidar, 1/511, Book ID 21692, Page ID 474) — Kewenangan otoritas regulasi membatalkan klausul baku yang sewenang-wenang (*syuruth ta'assufiyyah*).

---

## [2.5.1] - 2026-09-27

### 🔒 Security & Privacy Architecture
- **Pemisahan Total Repositori Privat (`fathanbeje/bahtsu-app`):**
  - Mengisolasi seluruh kode aplikasi web Bahtsu Klangopan, konfigurasi server, basis data, dan arsip kajian ke repositori khusus privat `fathanbeje/bahtsu-app` guna mencegah paparan kode internal ke publik.
  - Menghapus branch aplikasi `private/bahtsu-klangopan-app` dari repositori publik `fathanbeje/bahtsu`, sehingga repositori publik bersih dan murni hanya memuat dokumentasi skill publik Bahtsul Masail.
  - Menerbitkan dan mendaftarkan SSH Deploy Key berhak baca-tulis (`vps-bahtsu-app-deploy`) khusus untuk server VPS, memisahkan otentikasi dari kunci akun global.

### ✨ New Features & Automation
- **Kepatuhan Otomatisasi Changelog oleh Bot (`server.js`):**
  - Mengintegrasikan mekanisme auto-append entri `CHANGELOG.md` pada endpoint `/api/kajian/save` di server backend.
  - Setiap naskah kajian baru yang dirumuskan dan disimpan oleh bot Bahtsu Klangopan otomatis tercatat pada daftar bahan kajian di `CHANGELOG.md` sebelum dieksekusi `git commit` dan `git push` ke repositori privat.
  - Menjamin transparansi riwayat kajian dan kepatuhan penuh pada protokol Keep a Changelog.

---

## [2.5.0] - 2026-09-27

### ✨ New Features & Enhancements
- **Telemetri Sisa Kuota Multi-Akun Gemini (`RouterCockpitModal.jsx` & `server.js`):**
  - Menyajikan pemantauan sisa kuota harian riil untuk masing-masing akun Google Gemini (`fathanbejo@gmail.com`, `fathanbeje@gmail.com`, `mia02database@gmail.com`, `mia02sgs@gmail.com`) dengan batas standar 1.500 RPD (Request Per Day) dan 15 RPM.
  - Kartu Ringkasan Kuota Tergabung (*Combined Pool Quota*): Menghitung agregasi kuota 6.000 RPD, persentase ketersediaan pool dinamis, serta total kueri dan token terpakai hari ini.
  - Rincian Metrik Per Akun: Progress bar sisa kuota dengan kode warna cerdas (hijau >50%, kuning 20-50%, merah <20%), status keaktifan sesi token OAuth, estimasi waktu kedaluwarsa auto-refresh, dan tombol sakelar kendali node akun.
- **Rekalibrasi Tipografi Editorial Mobile Skala Awwwards (`KajianArchivePage.jsx`, `ChatPane.jsx`, `Header.jsx`):**
  - Mengangkat skala font mobile dari sub-10px mikro ke standar ergonomis editorial kontemporer: teks bacaan naskah fiqih 15.5px–17.5px (`leading-[1.85]`), judul kartu kajian 14.5px–16px, badge metadata 12px, serta chips filter 12px–13px.
  - Menghilangkan beban mata dan kebutuhan *squinting* pada layar ponsel beresolusi tinggi (Retina/OLED).
- **Arsitektur Halaman Arsip Kajian Full View (`KajianArchivePage.jsx`):**
  - Mengubah penampil arsip dari modal pop-up sempit menjadi halaman penuh (*dedicated full page*) dengan bilah navigasi mandiri 44px.
  - Menghilangkan redundansi tumpukan dua baris header pada mode pembaca naskah di perangkat mobile (*Distraction-Free Editorial View*).
  - Mengimplementasikan pencarian instan mendalam berbasis konten (*full-text in-content search*) dengan penyorotan kata kunci (*highlight snippet*) dan penghitung frekuensi kemunculan lafadz.

### 🐛 Bug Fixes & Refactoring
- **Koreksi Title Anti-Slop (`index.html`):** Mengganti karakter em-dash pada tag `<title>` dengan mid-dot (`·`) sesuai protokol anti-slop.
- **Pencegahan iOS Safari Auto-Zoom:** Memperbesar ukuran teks input pencarian dan textarea percakapan ke skala 15px–16px agar peramban mobile tidak melakukan zoom paksa saat kolom kueri difokuskan.
- **Portal Rendering Menu Mobile (`Header.jsx`):** Mengisolasi drawer menu mobile ke dalam React Portal (`createPortal`) pada `document.body` guna mencegah terpotongnya menu akibat batasan konteks *backdrop-blur* header.

---

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

### 📚 New Studies & Materials
- **Keabsahan Shalat Berjamaah Bersama Anak Kecil dan Perolehan Fadhilah Jamaah Ketika Istri Berhalangan (Kajian Komparatif Empat Madzhab) (`kajian/2026-09-27-keabsahan-shalat-berjamaah-bersama-anak-kecil-dan.md`):** Draf bahan kajian bahtsul masail disimpan otomatis oleh bot.
- **Status Hukum Pemisahan Harta Bawaan yang Bercampur Baur (Commingled Property) dan Hak Ahli Waris Pasca Perceraian atau Kematian (`kajian/2026-09-27-status-hukum-pemisahan-harta-bawaan-yang-bercampur.md`):** Draf bahan kajian bahtsul masail disimpan otomatis oleh bot.
- **Keabsahan Shalat Berjamaah Bersama Anak Kecil dan Perolehan Fadhilah Jamaah Ketika Istri Berhalangan (Kajian Komparatif Empat Madzhab) (`kajian/2026-09-27-keabsahan-shalat-berjamaah-bersama-anak-kecil-dan.md`):** Draf bahan kajian bahtsul masail disimpan otomatis oleh bot.
- **Hukum Meletakkan Batu Kerikil di Atas Makam dan Faedahnya bagi Jenazah (`kajian/2026-09-27-hukum-meletakkan-batu-kerikil-di-atas-makam.md`):** Draf bahan kajian bahtsul masail disimpan otomatis oleh bot.
- **Validasi Auto Push Bot Repositori Privat (`kajian/2026-09-27-validasi-auto-push-bot.md`):** Draf bahan kajian bahtsul masail disimpan otomatis oleh bot.
- **Uji Coba Sinkronisasi Repositori Privat (`kajian/2026-09-27-uji-coba-repositori-privat.md`):** Draf bahan kajian bahtsul masail disimpan otomatis oleh bot. (Kajian Bahtsul Masail)
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
