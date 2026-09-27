import React from 'react';
import { X, BookOpen, Layers, Scale, Sparkles, CheckCircle2 } from 'lucide-react';

export default function MatraInfoModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const matraGuides = [
    {
      id: 'waqi_iyyah',
      title: "Matra Wāqi'iyyah (واقـعية)",
      subtitle: "Kasuistik Aktual & Qauli Mu'tamad",
      badge: "Kasuistik Realitas",
      color: "emerald",
      icon: "🕌",
      desc: "Menjawab masalah-masalah hukum kasuistik nyata yang dihadapi umat dan santri sehari-hari secara mendesak dan spesifik.",
      methodology: "Bermadzhab secara Qauli (التمذهب القولي)",
      rules: [
        "Wajib merujuk nash eksplisit para imam madzhab Syafi'i (Syaikhoni: An-Nawawi & Ar-Rafi'i; Hawasyi: Ibnu Hajar & Ar-Ramli).",
        "Wajib multi-referensi berantai (minimal 3 hingga 7+ ibarat dari mutaqaddimin, muta'akhirin, hawasyi).",
        "Bila tidak ada nash qath'i, diterapkan prosedur Ilhāqul Masā'il bi Nazhā'irihā (analogi terhadap kasus yang sepadan dalam kitab salaf).",
      ],
      examples: "Hukum menabur kerikil di atas makam, hukum memarahi anak usia 6 tahun yang enggan mengaji, fidyah shalat orang yang meninggal, transaksi PayLater e-commerce.",
    },
    {
      id: 'maudlu_iyyah',
      title: "Matra Maudlū'iyyah (مـوضوعية)",
      subtitle: "Tematik Konseptual Peradaban & Manhaji",
      badge: "Tematik Strategis",
      color: "amber",
      icon: "📜",
      desc: "Menelaah tema-tema besar, doktrinal, dan peradaban yang berdimensi luas dan konseptual (bukan sekadar fatwa halal-haram satu kasus).",
      methodology: "Bermadzhab secara Manhaji (التمذهب المنهجي)",
      rules: [
        "Metode Bayani: Menelaah semantik kebahasaan teks nash dan kaidah lughawiyyah.",
        "Metode Qiyasi: Silogisme dan analogi ushuli mendalam.",
        "Metode Istishlahi / Maqashidi: Orientasi kemaslahatan publik dan maqashid asy-syari'ah (Hifzhud Din, Hifzhun Nafs, Hifzhul Mal, dll.).",
      ],
      examples: "Konsep kewarganegaraan modern non-muslim (Al-Muwathanah, Munas Banjar 2019), etika kecerdasan buatan (AI) & rekayasa genetika, krisis iklim global & keadilan ekologis.",
    },
    {
      id: 'qanuniyyah',
      title: "Matra Qānūniyyah (قـانونية)",
      subtitle: "Harmonisasi Yuridis & Kebijakan Publik",
      badge: "Legislasi & Regulasi",
      color: "blue",
      icon: "⚖️",
      desc: "Menelaah dan menguji produk hukum positif (Undang-Undang, Perpres, PP, Perda, Putusan MK) serta kebijakan publik dari kacamata syariat Islam.",
      methodology: "Siyāsah Syar'iyyah & Mashlahah 'Āmmah",
      rules: [
        "Menguji keselarasan pasal regulasi positif dengan prinsip syariah (muwafaqah vs mukhalafah).",
        "Mendasarkan fatwa pada kaidah: Tasharruf al-Imam 'ala ar-Ra'iyyah Manuthun bil Mashlahah (kebijakan pemimpin wajib berorientasi pada kemaslahatan rakyat).",
        "Menyajikan solusi maslahah dan rekomendasi klausul bagi pembuat kebijakan.",
      ],
      examples: "Telaah RUU/UU Kesehatan, harmonisasi sistem jaminan sosial BPJS, regulasi perbankan syariah, pengelolaan investasi dana haji oleh BPKH.",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-ink-950/80 backdrop-blur-xs animate-fade-in font-sans">
      <div className="bg-white dark:bg-ink-900 border border-parchment-200 dark:border-ink-800 rounded-3xl w-full max-w-3xl max-h-[90dvh] flex flex-col shadow-manuscript-lg overflow-hidden text-ink-900 dark:text-parchment-50">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-parchment-200 dark:border-ink-800 bg-parchment-50 dark:bg-ink-950 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-turath-emerald text-parchment-50 flex items-center justify-center shadow-sm border border-turath-gold/30">
              <Layers className="w-5 h-5 text-turath-gold" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base sm:text-lg text-ink-900 dark:text-parchment-50">
                Fungsi Tri-Matra Bahtsul Masail Nahdlatul Ulama
              </h3>
              <p className="text-xs text-ink-500 dark:text-ink-400">
                Standar Resmi Munas Alim Ulama, Konbes NU, dan LBM PBNU
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-ink-400 hover:text-ink-900 dark:hover:text-parchment-100 hover:bg-parchment-200 dark:hover:bg-ink-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 overscroll-contain">
          <div className="p-3.5 rounded-2xl bg-turath-emerald-soft/50 dark:bg-turath-emerald-dark-soft/40 border border-turath-emerald/20 text-xs text-ink-700 dark:text-parchment-200 leading-relaxed">
            <p>
              <b>Mengapa ada 3 tab di atas?</b> Dalam tradisi Bahtsul Masail modern Nahdlatul Ulama (Munas Bandar Lampung 1992, Munas Banjar 2019, & Muktamar Lampung 2021), kajian hukum diklasifikasikan ke dalam <b>tiga matra</b>. Memilih tab akan <b>mengubah direktif instruksi penalaran hukum yang dikirimkan ke model AI 9Router</b> agar menghasilkan rumusan yang sesuai metodologi bersangkutan.
            </p>
          </div>

          <div className="space-y-4">
            {matraGuides.map(matra => (
              <div
                key={matra.id}
                className="p-4 sm:p-5 rounded-2xl bg-parchment-50/70 dark:bg-ink-950/70 border border-parchment-200 dark:border-ink-800 space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{matra.icon}</span>
                    <div>
                      <h4 className="font-serif font-bold text-base text-ink-900 dark:text-parchment-100">
                        {matra.title}
                      </h4>
                      <p className="text-xs font-sans text-turath-emerald dark:text-emerald-400 font-semibold">
                        {matra.subtitle}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-sans font-bold px-2 py-0.5 rounded-full bg-parchment-200 dark:bg-ink-800 text-ink-600 dark:text-ink-300">
                    {matra.badge}
                  </span>
                </div>

                <p className="text-xs sm:text-[13px] text-ink-700 dark:text-parchment-200 leading-relaxed">
                  {matra.desc}
                </p>

                <div className="space-y-1 text-xs">
                  <div className="font-semibold text-ink-900 dark:text-parchment-100">
                    Kaidah & Karakteristik Analisis:
                  </div>
                  <ul className="space-y-1 text-[11.5px] text-ink-600 dark:text-ink-400 list-disc list-inside">
                    {matra.rules.map((rule, rIdx) => (
                      <li key={rIdx}>{rule}</li>
                    ))}
                  </ul>
                </div>

                <div className="pt-2 border-t border-parchment-200 dark:border-ink-800 text-[11px] text-ink-500 dark:text-ink-400">
                  <span className="font-semibold text-ink-700 dark:text-parchment-300">Contoh Topik: </span>
                  <span>{matra.examples}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-parchment-200 dark:border-ink-800 bg-parchment-50 dark:bg-ink-950 flex justify-end flex-shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-turath-emerald text-white text-xs font-semibold hover:bg-turath-emerald-light transition-colors"
          >
            Saya Mengerti
          </button>
        </div>

      </div>
    </div>
  );
}
