/**
 * Layout configuration, domain visual themes, and 2D grid coordinates for Concept Graph Canvas.
 */

export interface DomainColorTheme {
  border: string;
  bg: string;
  text: string;
  glow: string;
}

export const DOMAIN_COLORS: Record<string, DomainColorTheme> = {
  matematika: {
    border: "border-indigo-500",
    bg: "bg-indigo-500/10 dark:bg-indigo-500/20",
    text: "text-indigo-600 dark:text-indigo-400",
    glow: "#6366f1",
  },
  fisika: {
    border: "border-cyan-500",
    bg: "bg-cyan-500/10 dark:bg-cyan-500/20",
    text: "text-cyan-600 dark:text-cyan-400",
    glow: "#06b6d4",
  },
  kimia: {
    border: "border-amber-500",
    bg: "bg-amber-500/10 dark:bg-amber-500/20",
    text: "text-amber-600 dark:text-amber-400",
    glow: "#f59e0b",
  },
  biologi: {
    border: "border-emerald-500",
    bg: "bg-emerald-500/10 dark:bg-emerald-500/20",
    text: "text-emerald-600 dark:text-emerald-400",
    glow: "#10b981",
  },
};

/**
 * Clean, punchy labels for canvas nodes to avoid text clipping and visual collisions.
 */
export const SHORT_LABELS: Record<string, string> = {
  // Matematika (12)
  "perubahan": "Perubahan",
  "laju-perubahan": "Laju Perubahan",
  "definisi-turunan": "Definisi Turunan",
  "bilangan": "Bilangan",
  "operasi-aritmetika": "Aritmetika",
  "pecahan-dan-desimal": "Pecahan",
  "rasio-dan-proporsi": "Rasio",
  "persentase": "Persentase",
  "pangkat-dan-akar": "Pangkat & Akar",
  "urutan-dan-pola": "Pola Bilangan",
  "estimasi": "Estimasi",
  "satuan-dan-pengukuran-matematika": "Satuan Ukur",

  // Fisika Mekanika (18)
  "pengukuran-dan-besaran": "Besaran Fisika",
  "vektor": "Vektor",
  "kinematika": "Kinematika",
  "gerak-lurus": "Gerak Lurus",
  "gerak-parabola": "Parabola",
  "gerak-melingkar": "Melingkar",
  "gaya": "Gaya",
  "hukum-newton": "Hukum Newton",
  "gesekan": "Gaya Gesek",
  "usaha-dan-energi": "Usaha & Energi",
  "momentum-dan-impuls": "Momentum",
  "tumbukan": "Tumbukan",
  "rotasi": "Rotasi",
  "torsi": "Torsi",
  "momentum-sudut": "Momentum Sudut",
  "kesetimbangan": "Kesetimbangan",
  "gravitasi": "Gravitasi",
  "osilasi": "Osilasi",

  // Kimia Dasar (11)
  "materi-dan-sifatnya": "Wujud Materi",
  "unsur-dan-senyawa": "Unsur & Senyawa",
  "atom": "Struktur Atom",
  "molekul": "Molekul",
  "ion": "Ion & Muatan",
  "sistem-periodik": "Tabel Periodik",
  "konfigurasi-elektron": "Konfigurasi e⁻",
  "bilangan-kuantum": "Bil. Kuantum",
  "ikatan-kimia": "Ikatan Kimia",
  "struktur-lewis": "Struktur Lewis",
  "geometri-molekul": "Geometri VSEPR",

  // Biologi Dasar (6)
  "karakteristik-kehidupan": "Ciri Kehidupan",
  "tingkatan-organisasi-kehidupan": "Organisasi Hayati",
  "metode-ilmiah": "Metode Ilmiah",
  "sel": "Struktur Sel",
  "molekul-biologis": "Makromolekul",
  "energi-dalam-sistem-biologis": "Bioenergetika",
};

/**
 * Generously spaced, deterministic 2D grid coordinates (min. 100px separation between any two nodes).
 */
export const FIXED_POSITIONS: Record<string, { x: number; y: number }> = {
  // Matematika (Top-Left: x 40..660, y 45..420)
  "bilangan": { x: 110, y: 130 },
  "operasi-aritmetika": { x: 250, y: 130 },
  "pecahan-dan-desimal": { x: 390, y: 130 },
  "rasio-dan-proporsi": { x: 530, y: 130 },
  "persentase": { x: 110, y: 235 },
  "pangkat-dan-akar": { x: 250, y: 235 },
  "urutan-dan-pola": { x: 390, y: 235 },
  "estimasi": { x: 530, y: 235 },
  "satuan-dan-pengukuran-matematika": { x: 110, y: 340 },
  "perubahan": { x: 250, y: 340 },
  "laju-perubahan": { x: 390, y: 340 },
  "definisi-turunan": { x: 530, y: 340 },

  // Fisika Mekanika (Top-Right: x 700..1360, y 45..420)
  "pengukuran-dan-besaran": { x: 780, y: 130 },
  "vektor": { x: 880, y: 130 },
  "kinematika": { x: 980, y: 130 },
  "gerak-lurus": { x: 1080, y: 130 },
  "gerak-parabola": { x: 1180, y: 130 },
  "gerak-melingkar": { x: 1280, y: 130 },
  "gaya": { x: 780, y: 235 },
  "hukum-newton": { x: 880, y: 235 },
  "gesekan": { x: 980, y: 235 },
  "usaha-dan-energi": { x: 1080, y: 235 },
  "momentum-dan-impuls": { x: 1180, y: 235 },
  "tumbukan": { x: 1280, y: 235 },
  "rotasi": { x: 780, y: 340 },
  "torsi": { x: 880, y: 340 },
  "momentum-sudut": { x: 980, y: 340 },
  "kesetimbangan": { x: 1080, y: 340 },
  "gravitasi": { x: 1180, y: 340 },
  "osilasi": { x: 1280, y: 340 },

  // Kimia Dasar (Bottom-Left: x 40..660, y 465..855)
  "materi-dan-sifatnya": { x: 110, y: 570 },
  "unsur-dan-senyawa": { x: 250, y: 570 },
  "atom": { x: 390, y: 570 },
  "molekul": { x: 530, y: 570 },
  "ion": { x: 110, y: 675 },
  "sistem-periodik": { x: 250, y: 675 },
  "konfigurasi-elektron": { x: 390, y: 675 },
  "bilangan-kuantum": { x: 530, y: 675 },
  "ikatan-kimia": { x: 180, y: 780 },
  "struktur-lewis": { x: 320, y: 780 },
  "geometri-molekul": { x: 460, y: 780 },

  // Biologi Dasar (Bottom-Right: x 700..1360, y 465..855)
  "karakteristik-kehidupan": { x: 850, y: 610 },
  "tingkatan-organisasi-kehidupan": { x: 1030, y: 610 },
  "metode-ilmiah": { x: 1210, y: 610 },
  "sel": { x: 850, y: 745 },
  "molekul-biologis": { x: 1030, y: 745 },
  "energi-dalam-sistem-biologis": { x: 1210, y: 745 },
};
