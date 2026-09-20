export interface CriterionRuleDefinition {
  matcher: (id: string, name: string) => boolean;
  evaluate: (cleanText: string) => { passed: boolean; feedback: string };
}

export interface RubricCriterionLike {
  id: string;
  name: string;
  description?: string;
  weight: number;
}

export interface CriterionEvaluation {
  passed: boolean;
  feedback: string;
}

/**
 * Curated rule catalog for semantic explanation evaluation.
 * Decouples domain pedagogy rules from database orchestration and mastery calculation.
 */
export const CRITERIA_RULES: CriterionRuleDefinition[] = [
  {
    matcher: (id) => id.startsWith("crit-perubahan-kontinu"),
    evaluate: (cleanText) => {
      const matchKeywords = ["kontinu", "diskrit", "mulus", "lompat", "alir", "tangga", "lereng", "celah", "tahap"];
      const hitCount = matchKeywords.filter((k) => cleanText.includes(k)).length;
      const passed = hitCount >= 2 || (cleanText.includes("diskrit") && cleanText.includes("kontinu"));
      return {
        passed,
        feedback: passed
          ? "Bagus! Kamu membedakan dengan jelas antara lompatan bertahap (diskrit) dan aliran mulus tanpa jeda (kontinu)."
          : "Jelaskan perbedaan mendasar: diskrit memiliki lompatan/celah terpisah, sedangkan kontinu mengalir mulus tanpa celah.",
      };
    },
  },
  {
    matcher: (id) => id.startsWith("crit-perubahan-delta"),
    evaluate: (cleanText) => {
      const matchKeywords = ["delta", "selisih", "akhir", "awal", "kurang", "arah", "perubahan", "tanda"];
      const hitCount = matchKeywords.filter((k) => cleanText.includes(k)).length;
      const passed = hitCount >= 2 || cleanText.includes("delta") || cleanText.includes("selisih");
      return {
        passed,
        feedback: passed
          ? "Tepat! Kamu memahami notasi delta sebagai selisih nilai akhir dikurangi nilai awal."
          : "Sebutkan makna simbol delta (Δ) sebagai selisih nilai akhir terhadap nilai awal.",
      };
    },
  },
  {
    matcher: (id) => id.startsWith("crit-perubahan-aplikasi"),
    evaluate: (cleanText) => {
      const matchKeywords = ["alam", "roket", "gerak", "kecepatan", "fisika", "waktu", "kalkulus", "nyata", "mulus"];
      const hitCount = matchKeywords.filter((k) => cleanText.includes(k)).length;
      const passed = hitCount >= 1 || cleanText.includes("alam") || cleanText.includes("roket") || cleanText.includes("gerak");
      return {
        passed,
        feedback: passed
          ? "Hebat! Kamu menghubungkan mengapa model kontinu sangat krusial untuk memahami dinamika gerak nyata di alam."
          : "Jelaskan mengapa gerak nyata di alam (seperti roket atau mobil) membutuhkan pemodelan kontinu.",
      };
    },
  },
  {
    matcher: (id) => id.startsWith("crit-laju-rasio"),
    evaluate: (cleanText) => {
      const matchKeywords = ["rasio", "bagi", "satuan", "selisih", "jarak", "waktu", "delta", "per", "kecepatan"];
      const hitCount = matchKeywords.filter((k) => cleanText.includes(k)).length;
      const passed = hitCount >= 2 || cleanText.includes("rasio") || cleanText.includes("bagi");
      return {
        passed,
        feedback: passed
          ? "Bagus! Kamu menegaskan bahwa laju adalah rasio perbandingan per satuan interval, bukan hanya perubahan total."
          : "Tekankan bahwa laju perubahan adalah rasio perubahan vertikal dibagi perubahan horizontal (Δy / Δx).",
      };
    },
  },
  {
    matcher: (id) => id.startsWith("crit-laju-secant"),
    evaluate: (cleanText) => {
      const matchKeywords = ["secant", "potong", "garis", "kurva", "dua titik", "tali busur", "rata-rata", "lurus"];
      const hitCount = matchKeywords.filter((k) => cleanText.includes(k)).length;
      const passed = hitCount >= 2 || cleanText.includes("secant") || cleanText.includes("potong");
      return {
        passed,
        feedback: passed
          ? "Tepat! Kamu mengidentifikasi secant line sebagai garis potong yang merata-ratakan dinamika kurva."
          : "Jelaskan representasi geometris garis potong (secant line) yang menghubungkan dua titik pada kurva.",
      };
    },
  },
  {
    matcher: (id) => id.startsWith("crit-laju-paradoks"),
    evaluate: (cleanText) => {
      const matchKeywords = ["sesaat", "spidometer", "benturan", "tabrak", "fluktuasi", "berhenti", "ngebut", "waktu", "100", "50"];
      const hitCount = matchKeywords.filter((k) => cleanText.includes(k)).length;
      const passed = hitCount >= 1 || cleanText.includes("sesaat") || cleanText.includes("spidometer") || cleanText.includes("benturan") || cleanText.includes("tabrak");
      return {
        passed,
        feedback: passed
          ? "Sempurna! Kamu membongkar paradoks bahwa kecepatan benturan sesaat bisa jauh melebihi kecepatan rata-rata perjalanan."
          : "Jelaskan mengapa kecepatan rata-rata tidak bisa memprediksi kecepatan seketika pada saat benturan terjadi.",
      };
    },
  },
  {
    matcher: (id) => id.startsWith("crit-bilangan-garis"),
    evaluate: (cleanText) => {
      const matchKeywords = ["garis", "kiri", "kanan", "arah", "posisi", "mundur"];
      const hitCount = matchKeywords.filter((k) => cleanText.includes(k)).length;
      const passed = hitCount >= 2 || cleanText.includes("kiri");
      return {
        passed,
        feedback: passed
          ? "Bagus! Kamu menekankan bahwa nilai semakin kecil saat bergerak ke arah kiri pada garis bilangan."
          : "Sebutkan posisi pada garis bilangan: semakin ke kiri letak suatu bilangan, semakin kecil nilainya.",
      };
    },
  },
  {
    matcher: (id) => id.startsWith("crit-bilangan-acuan"),
    evaluate: (cleanText) => {
      const matchKeywords = ["nol", "acuan", "origin", "titik", "pusat", "referensi", "0"];
      const hitCount = matchKeywords.filter((k) => cleanText.includes(k)).length;
      const passed = hitCount >= 1 || cleanText.includes("nol") || cleanText.includes("0");
      return {
        passed,
        feedback: passed
          ? "Tepat! Kamu menjelaskan peran titik acuan nol (origin) sebagai batas arah."
          : "Sertakan penjelasan mengenai titik nol sebagai acuan netral arah bilangan.",
      };
    },
  },
  {
    matcher: (id) => id.startsWith("crit-bilangan-magnitude"),
    evaluate: (cleanText) => {
      const matchKeywords = ["magnitude", "jarak", "mutlak", "langkah", "besaran", "10", "jauh"];
      const hitCount = matchKeywords.filter((k) => cleanText.includes(k)).length;
      const passed = hitCount >= 1 || cleanText.includes("jarak") || cleanText.includes("magnitude");
      return {
        passed,
        feedback: passed
          ? "Hebat! Kamu membedakan dengan jelas antara besaran jarak (magnitude) dan nilai posisi sebenarnya."
          : "Jelaskan bahwa angka 10 menyatakan jarak atau magnitude dari nol, sedangkan tanda minus menunjukkan posisinya di sebelah kiri.",
      };
    },
  },
  {
    matcher: (id) => id.startsWith("crit-operasi-arah"),
    evaluate: (cleanText) => {
      const matchKeywords = ["arah", "balik", "translasi", "geser", "langkah", "mundur", "kiri"];
      const hitCount = matchKeywords.filter((k) => cleanText.includes(k)).length;
      const passed = hitCount >= 2 || cleanText.includes("balik") || cleanText.includes("geser");
      return {
        passed,
        feedback: passed
          ? "Bagus! Kamu menjelaskan pembalikan arah gerakan di garis bilangan saat menghadapi pengurangan."
          : "Gunakan penjelasan arah di garis bilangan: pengurangan berarti berbalik arah atau melangkah mundur.",
      };
    },
  },
  {
    matcher: (id) => id.startsWith("crit-operasi-utang"),
    evaluate: (cleanText) => {
      const matchKeywords = ["utang", "beban", "hilang", "analog", "mundur", "pinjaman", "lunas"];
      const hitCount = matchKeywords.filter((k) => cleanText.includes(k)).length;
      const passed = hitCount >= 1 || cleanText.includes("utang") || cleanText.includes("mundur");
      return {
        passed,
        feedback: passed
          ? "Tepat! Analogi nyata yang kamu gunakan (seperti pengurangan utang atau gerak berbalik mundur) memperjelas logikanya."
          : "Coba berikan analogi konkret seperti menghapus utang atau melangkah mundur saat badan menghadap kiri.",
      };
    },
  },
  {
    matcher: (id) => id.startsWith("crit-operasi-hasil"),
    evaluate: (cleanText) => {
      const matchKeywords = ["tambah", "positif", "plus", "maju", "kanan", "bertambah", "setara"];
      const hitCount = matchKeywords.filter((k) => cleanText.includes(k)).length;
      const passed = hitCount >= 1 || cleanText.includes("tambah") || cleanText.includes("plus") || cleanText.includes("positif");
      return {
        passed,
        feedback: passed
          ? "Sempurna! Kamu menyimpulkan mengapa hasil akhirnya setara dengan pertambahan nilai positif a + b."
          : "Jelaskan kesimpulan akhirnya: mengapa pengurangan kuantitas negatif berujung pada pertambahan nilai (a + b).",
      };
    },
  },
  {
    matcher: (id) => id.startsWith("crit-pecahan-partisi"),
    evaluate: (cleanText) => {
      const matchKeywords = ["potong", "bagi", "utuh", "bagian", "kue", "pizza", "loyang", "benda", "satu"];
      const hitCount = matchKeywords.filter((k) => cleanText.includes(k)).length;
      const passed = hitCount >= 2 || cleanText.includes("kue") || cleanText.includes("pizza") || cleanText.includes("bagi");
      return {
        passed,
        feedback: passed
          ? "Bagus! Kamu menjelaskan bahwa kue atau benda yang dibagi memiliki satu satuan utuh yang sama."
          : "Jelaskan bahwa pecahan adalah pembagian dari satu satuan utuh yang berukuran sama.",
      };
    },
  },
  {
    matcher: (id) => id.startsWith("crit-pecahan-penyebut"),
    evaluate: (cleanText) => {
      const matchKeywords = ["penyebut", "pemotong", "banyak", "orang", "kecil", "mengecil", "ukuran", "8"];
      const hitCount = matchKeywords.filter((k) => cleanText.includes(k)).length;
      const passed = hitCount >= 2 || cleanText.includes("penyebut") || cleanText.includes("mengecil") || cleanText.includes("kecil");
      return {
        passed,
        feedback: passed
          ? "Tepat sekali! Kamu menguraikan bahwa semakin banyak pemotong/penyebut (8 vs 4), ukuran tiap bagian menjadi semakin kecil."
          : "Jelaskan peran penyebut: semakin besar angka penyebut (dibagi ke lebih banyak bagian), semakin kecil ukuran masing-masing potongannya.",
      };
    },
  },
  {
    matcher: (id) => id.startsWith("crit-pecahan-kesetaraan"),
    evaluate: (cleanText) => {
      const matchKeywords = ["setara", "desimal", "senilai", "ekivalen", "0.25", "0.125", "dua kali", "2/8", "kelipatan", "besar"];
      const hitCount = matchKeywords.filter((k) => cleanText.includes(k)).length;
      const passed = hitCount >= 1 || cleanText.includes("0.25") || cleanText.includes("senilai") || cleanText.includes("dua");
      return {
        passed,
        feedback: passed
          ? "Hebat! Kamu menunjukkan perbandingan nilai atau kesetaraan bahwa 1/4 dua kali lipat lebih besar dari 1/8."
          : "Hubungkan dengan perbandingan ukuran atau nilai desimal (1/4 setara 2/8 atau 0.25 vs 0.125).",
      };
    },
  },
  {
    matcher: (id) => id.startsWith("crit-ukur-satuan"),
    evaluate: (cleanText) => {
      const matchKeywords = ["satuan", "standar", "baku", "si", "meter", "makna", "objektif", "internasional"];
      const hitCount = matchKeywords.filter((k) => cleanText.includes(k)).length;
      const passed = hitCount >= 1 || cleanText.includes("satuan") || cleanText.includes("baku");
      return {
        passed,
        feedback: passed
          ? "Bagus! Kamu menjelaskan bahwa satuan memberikan makna fisik objektif dan mencegah miskomunikasi."
          : "Jelaskan mengapa angka hasil ukur harus memiliki satuan baku standar internasional.",
      };
    },
  },
  {
    matcher: (id) => id.startsWith("crit-ukur-ketidakpastian"),
    evaluate: (cleanText) => {
      const matchKeywords = ["ketidakpastian", "teliti", "ketelitian", "toleransi", "skala", "alat", "batas", "alat ukur"];
      const hitCount = matchKeywords.filter((k) => cleanText.includes(k)).length;
      const passed = hitCount >= 1 || cleanText.includes("ketidakpastian") || cleanText.includes("teliti");
      return {
        passed,
        feedback: passed
          ? "Tepat! Kamu menekankan bahwa setiap alat ukur di alam selalu memiliki batas ketelitian."
          : "Sebutkan konsep batas ketelitian atau ketidakpastian alat ukur eksperimental.",
      };
    },
  },
  {
    matcher: (id) => id.startsWith("crit-ukur-konsistensi"),
    evaluate: (cleanText) => {
      const matchKeywords = ["dimensi", "eksperimen", "konsisten", "uji", "homogen", "banding", "ulang"];
      const hitCount = matchKeywords.filter((k) => cleanText.includes(k)).length;
      const passed = hitCount >= 1 || cleanText.includes("dimensi") || cleanText.includes("konsisten") || cleanText.includes("uji");
      return {
        passed,
        feedback: passed
          ? "Sempurna! Kamu memahami pentingnya konsistensi dimensi agar hasil sains dapat diverifikasi."
          : "Jelaskan perlunya konsistensi dimensi untuk validasi dan pengujian ulang eksperimen.",
      };
    },
  },
  {
    matcher: (id) => id.startsWith("crit-vektor-arah"),
    evaluate: (cleanText) => {
      const matchKeywords = ["sudut", "arah", "orientasi", "vektor", "derajat", "panah", "relatif"];
      const hitCount = matchKeywords.filter((k) => cleanText.includes(k)).length;
      const passed = hitCount >= 1 || cleanText.includes("arah") || cleanText.includes("sudut");
      return {
        passed,
        feedback: passed
          ? "Bagus! Kamu menjelaskan bahwa penjumlahan vektor bergantung mutlak pada sudut relatif arahnya."
          : "Jelaskan bagaimana sudut antara kedua vektor menentukan hasil resultannya.",
      };
    },
  },
  {
    matcher: (id) => id.startsWith("crit-vektor-ekstrem"),
    evaluate: (cleanText) => {
      const matchKeywords = ["0", "10", "maksimum", "minimum", "searah", "lawan", "180", "nol", "berlawanan"];
      const hitCount = matchKeywords.filter((k) => cleanText.includes(k)).length;
      const passed = hitCount >= 1 || cleanText.includes("searah") || cleanText.includes("berlawanan") || cleanText.includes("10");
      return {
        passed,
        feedback: passed
          ? "Tepat! Kamu memberikan kondisi ekstrem: searah menghasilkan nilai maksimum (10 N) dan berlawanan arah menghasilkan 0 N."
          : "Beri contoh sudut searah (maksimum 10 N) dan sudut berlawanan (minimum 0 N).",
      };
    },
  },
  {
    matcher: (id) => id.startsWith("crit-vektor-skalar"),
    evaluate: (cleanText) => {
      const matchKeywords = ["skalar", "geometris", "biasa", "panah", "nilai", "beda"];
      const hitCount = matchKeywords.filter((k) => cleanText.includes(k)).length;
      const passed = hitCount >= 1 || cleanText.includes("skalar") || cleanText.includes("geometris") || cleanText.includes("arah");
      return {
        passed,
        feedback: passed
          ? "Hebat! Perbedaan penjumlahan skalar biasa dengan penjumlahan geometris vektor tersampaikan dengan baik."
          : "Bandingkan penjumlahan skalar biasa dengan penjumlahan vektor berarah.",
      };
    },
  },
  {
    matcher: (id) => id.startsWith("crit-kinem-vektor"),
    evaluate: (cleanText) => {
      const matchKeywords = ["kecepatan", "vektor", "arah", "laju", "skalar", "spidometer"];
      const hitCount = matchKeywords.filter((k) => cleanText.includes(k)).length;
      const passed = hitCount >= 1 || cleanText.includes("vektor") || cleanText.includes("arah");
      return {
        passed,
        feedback: passed
          ? "Bagus! Kamu membedakan kelajuan skalar dari kecepatan vektor yang memiliki arah."
          : "Jelaskan bahwa kecepatan adalah besaran vektor yang memiliki nilai dan arah.",
      };
    },
  },
  {
    matcher: (id) => id.startsWith("crit-kinem-arah"),
    evaluate: (cleanText) => {
      const matchKeywords = ["percepatan", "arah", "tikungan", "belok", "dv/dt", "ubah", "berubah"];
      const hitCount = matchKeywords.filter((k) => cleanText.includes(k)).length;
      const passed = hitCount >= 1 || cleanText.includes("percepatan") || cleanText.includes("arah") || cleanText.includes("belok");
      return {
        passed,
        feedback: passed
          ? "Tepat! Kamu menguraikan bahwa perubahan arah vektor tetap menghasilkan percepatan."
          : "Jelaskan bahwa saat membelok di tikungan, arah vektor kecepatan berubah sehingga percepatan terjadi.",
      };
    },
  },
  {
    matcher: (id) => id.startsWith("crit-kinem-sentripetal"),
    evaluate: (cleanText) => {
      const matchKeywords = ["sentripetal", "pusat", "lingkaran", "tarik", "dalam", "membelok"];
      const hitCount = matchKeywords.filter((k) => cleanText.includes(k)).length;
      const passed = hitCount >= 1 || cleanText.includes("sentripetal") || cleanText.includes("pusat") || cleanText.includes("lingkaran");
      return {
        passed,
        feedback: passed
          ? "Sempurna! Kamu mengidentifikasi arah percepatan sentripetal yang mengarah ke pusat lingkaran."
          : "Sebutkan nama percepatan sentripetal yang arahnya selalu menuju ke pusat lintasan melingkar.",
      };
    },
  },
  {
    matcher: (id) => id.startsWith("crit-materi-partikel"),
    evaluate: (cleanText) => {
      const matchKeywords = ["partikel", "molekul", "sela", "gula", "air", "sebar", "larut"];
      const hitCount = matchKeywords.filter((k) => cleanText.includes(k)).length;
      const passed = hitCount >= 1 || cleanText.includes("molekul") || cleanText.includes("partikel") || cleanText.includes("sela");
      return {
        passed,
        feedback: passed
          ? "Bagus! Kamu menjelaskan partikel molekul gula menyebar di sela molekul air."
          : "Jelaskan proses pelarutan mikroskopis molekul gula di antara molekul air.",
      };
    },
  },
  {
    matcher: (id) => id.startsWith("crit-materi-identitas"),
    evaluate: (cleanText) => {
      const matchKeywords = ["kimia", "identitas", "manis", "baru", "zat", "ikatan"];
      const hitCount = matchKeywords.filter((k) => cleanText.includes(k)).length;
      const passed = hitCount >= 1 || cleanText.includes("manis") || cleanText.includes("zat baru") || cleanText.includes("identitas");
      return {
        passed,
        feedback: passed
          ? "Tepat! Kamu menegaskan tidak ada zat kimia baru yang terbentuk sehingga sifat manis tetap utuh."
          : "Jelaskan bahwa identitas kimia gula tidak berubah dan rasa manisnya tetap ada.",
      };
    },
  },
  {
    matcher: (id) => id.startsWith("crit-materi-reversibel"),
    evaluate: (cleanText) => {
      const matchKeywords = ["reversibel", "uap", "kristalisasi", "pisah", "fisika", "kembali", "air"];
      const hitCount = matchKeywords.filter((k) => cleanText.includes(k)).length;
      const passed = hitCount >= 1 || cleanText.includes("uap") || cleanText.includes("kembali") || cleanText.includes("kristal");
      return {
        passed,
        feedback: passed
          ? "Hebat! Kamu membuktikan sifat perubahan fisika yang reversibel (gula dapat diperoleh kembali bila air diuapkan)."
          : "Sebutkan bahwa gula dapat diperoleh kembali melalui penguapan atau kristalisasi.",
      };
    },
  },
  {
    matcher: (id) => id.startsWith("crit-senyawa-ikatan"),
    evaluate: (cleanText) => {
      const matchKeywords = ["senyawa", "h2o", "ikatan", "tetap", "molekul", "kimia", "murni"];
      const hitCount = matchKeywords.filter((k) => cleanText.includes(k)).length;
      const passed = hitCount >= 1 || cleanText.includes("ikatan") || cleanText.includes("h2o") || cleanText.includes("senyawa");
      return {
        passed,
        feedback: passed
          ? "Bagus! Kamu menjelaskan air suling adalah molekul senyawa H2O dengan ikatan kimia tetap."
          : "Jelaskan air murni suling sebagai senyawa dengan rasio atom terikat kuat.",
      };
    },
  },
  {
    matcher: (id) => id.startsWith("crit-senyawa-campuran"),
    evaluate: (cleanText) => {
      const matchKeywords = ["campuran", "laut", "garam", "larut", "bervariasi", "nacl", "mineral"];
      const hitCount = matchKeywords.filter((k) => cleanText.includes(k)).length;
      const passed = hitCount >= 1 || cleanText.includes("campuran") || cleanText.includes("garam") || cleanText.includes("laut");
      return {
        passed,
        feedback: passed
          ? "Tepat! Kamu menguraikan air laut sebagai campuran larutan garam dan mineral."
          : "Jelaskan air laut sebagai campuran fisik aneka garam terlarut tanpa ikatan kimia baru.",
      };
    },
  },
  {
    matcher: (id) => id.startsWith("crit-senyawa-pemisahan"),
    evaluate: (cleanText) => {
      const matchKeywords = ["uap", "distilasi", "evaporasi", "pisah", "fisika", "elektrolisis", "didih"];
      const hitCount = matchKeywords.filter((k) => cleanText.includes(k)).length;
      const passed = hitCount >= 1 || cleanText.includes("pisah") || cleanText.includes("uap") || cleanText.includes("distilasi");
      return {
        passed,
        feedback: passed
          ? "Sempurna! Kamu membedakan pemisahan fisika (distilasi/evaporasi air laut) dengan pemisahan kimiawi senyawa."
          : "Jelaskan bahwa komponen air laut dapat dipisahkan melalui proses fisika seperti penguapan.",
      };
    },
  },
  {
    matcher: (id) => id.startsWith("crit-atom-awan"),
    evaluate: (cleanText) => {
      const matchKeywords = ["awan", "elektron", "luar", "kulit", "negatif", "muatan"];
      const hitCount = matchKeywords.filter((k) => cleanText.includes(k)).length;
      const passed = hitCount >= 1 || cleanText.includes("elektron") || cleanText.includes("awan");
      return {
        passed,
        feedback: passed
          ? "Bagus! Kamu menyebutkan lapisan awan elektron bermuatan negatif yang membungkus permukaan luar setiap atom."
          : "Jelaskan bahwa bagian terluar atom dilapisi oleh awan elektron bermuatan negatif.",
      };
    },
  },
  {
    matcher: (id) => id.startsWith("crit-atom-tolak"),
    evaluate: (cleanText) => {
      const matchKeywords = ["tolak", "elektrostatik", "coulomb", "muatan", "gaya", "listrik"];
      const hitCount = matchKeywords.filter((k) => cleanText.includes(k)).length;
      const passed = hitCount >= 1 || cleanText.includes("tolak") || cleanText.includes("gaya") || cleanText.includes("muatan");
      return {
        passed,
        feedback: passed
          ? "Tepat! Kamu menguraikan gaya tolak-menolak elektrostatik antarmuatan negatif sejenis."
          : "Sebutkan gaya tolak-menolak elektrostatik antara elektron di tangan dan elektron di meja.",
      };
    },
  },
  {
    matcher: (id) => id.startsWith("crit-atom-padat"),
    evaluate: (cleanText) => {
      const matchKeywords = ["ilusi", "padat", "medan", "sentuh", "benturan", "elektromagnetik"];
      const hitCount = matchKeywords.filter((k) => cleanText.includes(k)).length;
      const passed = hitCount >= 1 || cleanText.includes("sentuh") || cleanText.includes("padat") || cleanText.includes("medan");
      return {
        passed,
        feedback: passed
          ? "Hebat! Kamu menyimpulkan bahwa sentuhan fisik adalah tolakan medan elektromagnetik bukan tumbukan massa padat."
          : "Jelaskan bahwa sensasi kepadatan sebenarnya berasal dari tolakan gaya elektromagnetik.",
      };
    },
  },
  {
    matcher: (id) => id.startsWith("crit-hidup-mati"),
    evaluate: (cleanText) => {
      const matchKeywords = ["benda", "mati", "aseluler", "kristal", "luar", "inang", "metabolisme", "diam"];
      const hitCount = matchKeywords.filter((k) => cleanText.includes(k)).length;
      const passed = hitCount >= 1 || cleanText.includes("mati") || cleanText.includes("luar inang") || cleanText.includes("kristal");
      return {
        passed,
        feedback: passed
          ? "Bagus! Kamu menjelaskan virus di luar inang bersifat inert tanpa metabolisme dan dapat dikristalkan seperti benda mati."
          : "Jelaskan sifat benda mati virus saat berada bebas di luar sel inang.",
      };
    },
  },
  {
    matcher: (id) => id.startsWith("crit-hidup-hidup"),
    evaluate: (cleanText) => {
      const matchKeywords = ["hidup", "replikasi", "genetik", "dna", "rna", "dalam", "biak", "inang"];
      const hitCount = matchKeywords.filter((k) => cleanText.includes(k)).length;
      const passed = hitCount >= 1 || cleanText.includes("replikasi") || cleanText.includes("genetik") || cleanText.includes("dna") || cleanText.includes("rna");
      return {
        passed,
        feedback: passed
          ? "Tepat! Kamu menguraikan bahwa virus membawa materi genetik dan mampu bereplikasi di dalam sel inang."
          : "Sebutkan kemampuan virus mereplikasi materi genetiknya (DNA/RNA) di dalam sel inang.",
      };
    },
  },
  {
    matcher: (id) => id.startsWith("crit-hidup-parasit"),
    evaluate: (cleanText) => {
      const matchKeywords = ["parasit", "obligat", "inang", "sel", "batas", "ketergantungan", "mesin"];
      const hitCount = matchKeywords.filter((k) => cleanText.includes(k)).length;
      const passed = hitCount >= 1 || cleanText.includes("parasit") || cleanText.includes("inang") || cleanText.includes("batas");
      return {
        passed,
        feedback: passed
          ? "Sempurna! Kamu menyimpulkan virus sebagai parasit obligat di tapal batas kehidupan."
          : "Jelaskan status virus sebagai parasit intraseluler obligat di perbatasan hidup.",
      };
    },
  },
  {
    matcher: (id) => id.startsWith("crit-tingkat-emergen"),
    evaluate: (cleanText) => {
      const matchKeywords = ["emergen", "sifat", "baru", "muncul", "keseluruhan", "interaksi", "susunan"];
      const hitCount = matchKeywords.filter((k) => cleanText.includes(k)).length;
      const passed = hitCount >= 1 || cleanText.includes("emergen") || cleanText.includes("sifat baru") || cleanText.includes("muncul");
      return {
        passed,
        feedback: passed
          ? "Bagus! Kamu mendefinisikan sifat emergen: karakteristik baru yang muncul dari keteraturan interaksi antarkomponen."
          : "Jelaskan konsep sifat emergen (emergent properties) yang muncul pada susunan yang lebih tinggi.",
      };
    },
  },
  {
    matcher: (id) => id.startsWith("crit-tingkat-hierarki"),
    evaluate: (cleanText) => {
      const matchKeywords = ["sel", "jaringan", "organ", "otak", "jantung", "hierarki", "susun"];
      const hitCount = matchKeywords.filter((k) => cleanText.includes(k)).length;
      const passed = hitCount >= 1 || cleanText.includes("organ") || cleanText.includes("sel") || cleanText.includes("jaringan");
      return {
        passed,
        feedback: passed
          ? "Tepat! Kamu memberikan contoh organisasi bertingkat seperti sel membentuk jaringan dan organ fungsional."
          : "Beri contoh tingkatan hierarki seperti sel saraf membentuk otak yang mampu berpikir.",
      };
    },
  },
  {
    matcher: (id) => id.startsWith("crit-tingkat-holistik"),
    evaluate: (cleanText) => {
      const matchKeywords = ["holistik", "reduksionis", "sistem", "kesadaran", "kompleks", "atom", "lebih besar"];
      const hitCount = matchKeywords.filter((k) => cleanText.includes(k)).length;
      const passed = hitCount >= 1 || cleanText.includes("holistik") || cleanText.includes("kesadaran") || cleanText.includes("sistem") || cleanText.includes("atom");
      return {
        passed,
        feedback: passed
          ? "Luar biasa! Perspektif holistik biologismu membuktikan bahwa kehidupan melampaui kumpulan atom fisik."
          : "Jelaskan mengapa pendekatan holistik sistemik diperlukan untuk memahami fungsi kehidupan kompleks.",
      };
    },
  },
  {
    matcher: (id, name) => id.includes("geom") || name.toLowerCase().includes("geometri") || name.toLowerCase().includes("tangent"),
    evaluate: (cleanText) => {
      const matchKeywords = ["singgung", "tangent", "secant", "potong", "menyentuh", "garis"];
      const hitCount = matchKeywords.filter((k) => cleanText.includes(k)).length;
      const passed = hitCount >= 2 || (cleanText.includes("singgung") && cleanText.includes("titik"));
      return {
        passed,
        feedback: passed
          ? "Bagus! Kamu berhasil menjelaskan peralihan garis potong menjadi garis singgung."
          : "Coba hubungkan bagaimana dua titik pada kurva didekatkan hingga garisnya menyentuh satu titik saja (garis singgung).",
      };
    },
  },
  {
    matcher: (id, name) => id.includes("limit") || name.toLowerCase().includes("limit") || name.toLowerCase().includes("jarak"),
    evaluate: (cleanText) => {
      const matchKeywords = ["limit", "mendekati", "nol", "0", "jarak", "h "];
      const hitCount = matchKeywords.filter((k) => cleanText.includes(k)).length;
      const passed = hitCount >= 2 || cleanText.includes("limit") || (cleanText.includes("mendekati") && cleanText.includes("0"));
      return {
        passed,
        feedback: passed
          ? "Tepat! Kamu menekankan peran limit saat selisih jarak mendekati nol tanpa membagi nol."
          : "Jelaskan mengapa kita menggunakan limit saat selisih jarak horizontal (h) mendekati nol.",
      };
    },
  },
  {
    matcher: (id, name) => id.includes("meaning") || name.toLowerCase().includes("makna"),
    evaluate: (cleanText) => {
      const matchKeywords = ["laju", "sesaat", "kemiringan", "kecepatan", "gradien", "perubahan", "f'(x)"];
      const hitCount = matchKeywords.filter((k) => cleanText.includes(k)).length;
      const passed = hitCount >= 1 || cleanText.includes("kemiringan") || cleanText.includes("laju") || cleanText.includes("gradien");
      return {
        passed,
        feedback: passed
          ? "Hebat! Kamu memahami makna f'(x) sebagai kemiringan kurva atau laju perubahan sesaat."
          : "Jelaskan makna f'(x) sebagai kemiringan garis singgung atau laju perubahan seketika pada titik tersebut.",
      };
    },
  },
];

/**
 * Evaluates a single rubric criterion against student's explanation text.
 */
export function evaluateCriterionAgainstRubric(
  cleanText: string,
  crit: RubricCriterionLike
): CriterionEvaluation {
  for (const rule of CRITERIA_RULES) {
    if (rule.matcher(crit.id, crit.name)) {
      return rule.evaluate(cleanText);
    }
  }

  // General semantic fallback matching with words from criterion name and description
  const critWords = (crit.name + " " + (crit.description || ""))
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length >= 4);

  const hitCount = critWords.filter((w) => cleanText.includes(w)).length;
  const passed = hitCount >= 2 || cleanText.length > 30;

  return {
    passed,
    feedback: passed
      ? "Bagus! Penjelasan intimu sudah mencakup esensi konsep yang diminta."
      : `Jelaskan secara lebih mendalam aspek '${crit.name}'.`,
  };
}
