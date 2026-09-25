# 📚 Skill `/bahtsu` — Asisten Ibarat Bahtsul Masail Pesantren

Skill khusus untuk AI coding assistant dan agent (Google Antigravity, Claude Desktop, Cursor, Windsurf, dll.) untuk meneliti, mencari *ibarat* kitab kuning secara 100% online, dan merumuskan draf keputusan Bahtsul Masail berstandar tradisi pesantren salaf (khususnya Ma'had Aly Lirboyo / LBM-NU).

---

## ✨ Fitur Unggulan

1. **100% Online (Zero-Storage Footprint):**
   - Tidak perlu mendownload database Maktabah Syamilah offline yang memakan puluhan Gigabyte.
   - Menggunakan REST API v3 dari **[Turath.io](https://turath.io)** dan/atau remote endpoint **[shamela.link](https://shamela.link)**.
2. **Pencarian Lintas Fan Ilmu:**
   - Tidak terpaku pada Fiqh Syafi'i teknis saja.
   - Mencakup kitab Ushul Fiqh, Qawa'id Fiqhiyyah, Adab Syar'iyyah, Syarah Hadits, Tafsir, dan Fatwa Muta'akhirin.
3. **Disiplin Tarjih Madzhab Syafi'i:**
   - Menghormati hierarki fatwa Syafi'iyyah (Syaikhoni $\rightarrow$ Zakariyya Al-Anshari $\rightarrow$ Ibnu Hajar Al-Haitami & Syamsuddin Ar-Ramli $\rightarrow$ Khatib Asy-Syarbini $\rightarrow$ Ashabul Hawasyi).
   - Memisahkan secara ketat mana teks **Matan**, **Syarah**, dan **Hasyiyah**.
4. **Verifikasi Teks Langsung:**
   - Setiap kutipan ibarat menyertakan link verifikasi yang dapat diklik langsung di browser: `https://app.turath.io/book/{id}?page={page}`.
5. **Format Keputusan Resmi:**
   - Menghasilkan format standar Bahtsul Masail: Deskripsi Masalah, As'ilah, Rumusan Keputusan, Dhawabith, Nash Arab berharakat, dan Terjemah Makna Murod.

---

## 🚀 Cara Pemasangan di Berbagai Lingkungan AI

### 1. Di Google Antigravity (Saat ini)
Skill ini tersimpan di:
```
~/.gemini/config/skills/bahtsu/
```
Antigravity akan otomatis mengenali skill ini. Anda cukup memanggil:
```
/bahtsu
```
atau dengan prompt alami: *"Carikan ibarat bahtsul masail untuk kasus..."*

### 2. Di Komputer Lain (Via Git)
Clone repositori ini langsung ke folder skills AI Anda:
```bash
git clone https://github.com/fathanbeje/bahtsu.git
```

### 3. Di Claude Code / Claude Desktop
Anda dapat menyertakan berkas `SKILL.md` ke dalam instruksi kustom (*System Prompt* atau file `CLAUDE.md`) pada proyek riset fiqih Anda.

---

## 🛠️ Utilitas Mandiri: `turath_search.js`

Skill ini dilengkapi skrip CLI Node.js untuk mencari ibarat langsung dari terminal tanpa membuka web browser:

```bash
# Pencarian umum lintas kitab
node scripts/turath_search.js -q "الاستصناع"

# Pencarian khusus Kategori 16 (Fiqh Syafi'i)
node scripts/turath_search.js -q "تكبيرة الإحرام" -c 16

# Format JSON output (untuk integrasi programmatic)
node scripts/turath_search.js -q "النية في الوضوء" -c 16 --json
```

---

## 📂 Struktur Direktori

```
bahtsu/
├── SKILL.md                          # Instruksi inti workflow dan metodologi bahtsu
├── README.md                         # Dokumentasi instalasi dan penggunaan
├── .gitignore                        # File pengabaian git
├── scripts/
│   └── turath_search.js             # Skrip pencarian online Turath.io API v3
└── references/
    ├── hierarki_tarjih_syafii.md    # Panduan urutan qaul mu'tamad madzhab Syafi'i
    └── template_keputusan.md        # Template baku hasil Bahtsul Masail Lirboyo
```

---

## 📜 Lisensi
MIT License — Dirancang untuk kemaslahatan khazanah keilmuan pesantren dan santri nusantara.
