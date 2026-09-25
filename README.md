# 📚 Skill `/bahtsu` — Asisten Perumus Bahtsul Masail Pesantren (Standar Munas & Konbes NU)

Skill resmi untuk AI coding assistant dan agent (Google Antigravity, Claude Desktop, Cursor, Windsurf, dll.) untuk meneliti masalah hukum, mencari multi-ibarat kitab kuning secara 100% online, dan merumuskan draf keputusan Bahtsul Masail berstandar resmi **Musyawarah Nasional (Munas) Alim Ulama, Konferensi Besar (Konbes) Nahdlatul Ulama, dan LBM PBNU**.

---

## 🏛️ Fondasi Metodologis (Munas Alim Ulama NU 2017)

Skill ini secara ketat mengintegrasikan ketetapan metodologis Komisi Bahtsul Masail Maudlu'iyyah Munas Alim Ulama NU 2017 di NTB (Hal. 73–82):
1. **Kebijakan Multi-Referensi Mutlak (*Multi-Source Mandate*):**
   - Mengharamkan kutipan referensi tunggal (*la yajuzu al-iqtishar 'ala marja'in wahid*).
   - Setiap sub-pertanyaan/hukum wajib didukung **minimal 3 sampai 7+ ibarat berantai** dari berbagai tingkatan kitab (*Kutubul Mutaqaddimin, Syaikhoni, Muta'akhirin, Hawasyi, Qawa'id Fiqhiyyah/Ushul, dan Muqaranah 4 Madzhab*).
2. **Prosedur *Taqrīr Jamā'i* (Pentarjihan Kolektif):**
   - Mengutamakan metode *Al-Jam'u wat Taufīq* (kompromi multidimensi) sebelum mentarjih qaul.
   - Mengukur maslahat berbasis *Al-Kulliyātul Khams* dan mendahulukan *Mashlahah 'Āmmah* atas *Mashlahah Khashshah*.
   - Mengakomodasi kaidah perubahan fatwa:
     $$\text{لا ينكر تغير الأحكام بتغير الأزمان والأمكنة والأحوال والظروف والعوائد}$$
3. **Prosedur *Ilhāqul Masā'il bi Nazhā'irihā* (Analogi Kasus Baru):**
   - *Takhrīj al-Furū' 'alal Furū'* (menyamakan kasus modern dengan furu' klasik sejenis).
   - *Takhrīj al-Furū' 'alal Qawā'id* (menarik kasus ke bawah kaidah fiqhiyyah/ushuliyyah universal).
   - Mewajibkan sub-bagian **Wajhul Istidlal / Wajhul Ilhāq** untuk menguraikan titik temu 'illat hukum antara teks klasik dan realitas kontemporer.

---

## 🚀 Cara Pemasangan & Penggunaan

### 1. Di Google Antigravity
Skill ini otomatis aktif di sistem Anda. Cukup ketik perintah slash command:
```
/bahtsu [masalah fiqih]
```
atau gunakan prompt alami:
> *"Gunakan skill bahtsu untuk merumuskan hukum status wakalah shalat mayit..."*

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
├── SKILL.md                          # Instruksi utama & mandatory multi-source protocol
├── README.md                         # Dokumentasi lengkap sistem
├── .gitignore                        # File pengabaian git
├── scripts/
│   └── turath_search.js             # CLI pencarian multi-ibarat online Turath.io API v3
└── references/
    ├── metodologi_ilhaq_taqrir.md    # Naskah metodologi resmi Taqrīr Jamā'i & Ilhāq Munas NU 2017
    ├── hierarki_tarjih_syafii.md    # Panduan urutan qaul mu'tamad & tarjih madzhab Syafi'i
    └── template_keputusan.md        # Format baku keputusan komprehensif Munas/Konbes NU
```

---

## 📜 Lisensi
MIT License — Didedikasikan untuk kemajuan kajian fiqih dan khazanah Bahtsul Masail Pesantren Nahdlatul Ulama.
