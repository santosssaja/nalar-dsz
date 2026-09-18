import { randomUUID } from "crypto";
import { eq, and } from "drizzle-orm";
import {
  getDb,
  ensureDbInitialized,
  aiInteractions,
  conceptProgress,
  learningEvidence,
} from "@/server/db";
import { Actor } from "@/server/auth/actor-resolver";
import { getConceptBySlug, getStepById } from "@/content/loader";
import { applyMasteryUpdate, ConceptMasterySnapshot } from "./mastery-engine";

export interface CriterionEvaluationResult {
  criterionId: string;
  name: string;
  passed: boolean;
  score: number;
  feedback: string;
}

export interface ExplainEvaluationOutput {
  passed: boolean;
  totalScore: number;
  criteriaResults: CriterionEvaluationResult[];
  overallFeedback: string;
  naiGuidance: string;
  explanationMastery: number;
}

export async function evaluateExplanation(
  actor: Actor,
  conceptSlug: string,
  stepId: string,
  explanation: string
): Promise<ExplainEvaluationOutput> {
  await ensureDbInitialized();
  const db = getDb();

  const concept = getConceptBySlug(conceptSlug);
  if (!concept) {
    throw new Error(`Konsep dengan slug '${conceptSlug}' tidak ditemukan.`);
  }

  const stepInfo = getStepById(stepId);
  const rubric = concept.rubric;

  // Curated fallback criteria if rubric is not explicitly defined in concept JSON
  const criteria = rubric?.criteria ?? [
    {
      id: "crit-geom",
      name: "Transformasi Geometris",
      description: "Menjelaskan bagaimana garis potong (secant) berputar menjadi garis singgung (tangent)",
      weight: 1,
    },
    {
      id: "crit-limit",
      name: "Peran Limit dan Jarak h",
      description: "Menyebutkan jarak kedua titik (h) yang mendekati nol melalui proses limit",
      weight: 1,
    },
    {
      id: "crit-meaning",
      name: "Makna Fisik / Kalkulus",
      description: "Menjelaskan turunan sebagai kemiringan kurva sesaat atau laju perubahan seketika",
      weight: 1,
    },
  ];

  const passingThreshold = rubric?.passingThreshold ?? 70;

  // Clean and normalize text
  const cleanText = explanation.trim().toLowerCase();

  // Evaluate each criterion using semantic keyword clustering & concept heuristics
  const criteriaResults: CriterionEvaluationResult[] = [];
  let earnedScore = 0;
  let totalPossible = 0;

  for (const crit of criteria) {
    totalPossible += crit.weight;
    let passed = false;
    let feedback = "";

    if (crit.id.startsWith("crit-bilangan-garis")) {
      const matchKeywords = ["garis", "kiri", "kanan", "arah", "posisi", "mundur"];
      const hitCount = matchKeywords.filter((k) => cleanText.includes(k)).length;
      if (hitCount >= 2 || cleanText.includes("kiri")) {
        passed = true;
        feedback = "Bagus! Kamu menekankan bahwa nilai semakin kecil saat bergerak ke arah kiri pada garis bilangan.";
      } else {
        feedback = "Sebutkan posisi pada garis bilangan: semakin ke kiri letak suatu bilangan, semakin kecil nilainya.";
      }
    } else if (crit.id.startsWith("crit-bilangan-acuan")) {
      const matchKeywords = ["nol", "acuan", "origin", "titik", "pusat", "referensi", "0"];
      const hitCount = matchKeywords.filter((k) => cleanText.includes(k)).length;
      if (hitCount >= 1 || cleanText.includes("nol") || cleanText.includes("0")) {
        passed = true;
        feedback = "Tepat! Kamu menjelaskan peran titik acuan nol (origin) sebagai batas arah.";
      } else {
        feedback = "Sertakan penjelasan mengenai titik nol sebagai acuan netral arah bilangan.";
      }
    } else if (crit.id.startsWith("crit-bilangan-magnitude")) {
      const matchKeywords = ["magnitude", "jarak", "mutlak", "langkah", "besaran", "10", "jauh"];
      const hitCount = matchKeywords.filter((k) => cleanText.includes(k)).length;
      if (hitCount >= 1 || cleanText.includes("jarak") || cleanText.includes("magnitude")) {
        passed = true;
        feedback = "Hebat! Kamu membedakan dengan jelas antara besaran jarak (magnitude) dan nilai posisi sebenarnya.";
      } else {
        feedback = "Jelaskan bahwa angka 10 menyatakan jarak atau magnitude dari nol, sedangkan tanda minus menunjukkan posisinya di sebelah kiri.";
      }
    } else if (crit.id.startsWith("crit-operasi-arah")) {
      const matchKeywords = ["arah", "balik", "translasi", "geser", "langkah", "mundur", "kiri"];
      const hitCount = matchKeywords.filter((k) => cleanText.includes(k)).length;
      if (hitCount >= 2 || cleanText.includes("balik") || cleanText.includes("geser")) {
        passed = true;
        feedback = "Bagus! Kamu menjelaskan pembalikan arah gerakan di garis bilangan saat menghadapi pengurangan.";
      } else {
        feedback = "Gunakan penjelasan arah di garis bilangan: pengurangan berarti berbalik arah atau melangkah mundur.";
      }
    } else if (crit.id.startsWith("crit-operasi-utang")) {
      const matchKeywords = ["utang", "beban", "hilang", "analog", "mundur", "pinjaman", "lunas"];
      const hitCount = matchKeywords.filter((k) => cleanText.includes(k)).length;
      if (hitCount >= 1 || cleanText.includes("utang") || cleanText.includes("mundur")) {
        passed = true;
        feedback = "Tepat! Analogi nyata yang kamu gunakan (seperti pengurangan utang atau gerak berbalik mundur) memperjelas logikanya.";
      } else {
        feedback = "Coba berikan analogi konkret seperti menghapus utang atau melangkah mundur saat badan menghadap kiri.";
      }
    } else if (crit.id.startsWith("crit-operasi-hasil")) {
      const matchKeywords = ["tambah", "positif", "plus", "maju", "kanan", "bertambah", "setara"];
      const hitCount = matchKeywords.filter((k) => cleanText.includes(k)).length;
      if (hitCount >= 1 || cleanText.includes("tambah") || cleanText.includes("plus") || cleanText.includes("positif")) {
        passed = true;
        feedback = "Sempurna! Kamu menyimpulkan mengapa hasil akhirnya setara dengan pertambahan nilai positif a + b.";
      } else {
        feedback = "Jelaskan kesimpulan akhirnya: mengapa pengurangan kuantitas negatif berujung pada pertambahan nilai (a + b).";
      }
    } else if (crit.id.startsWith("crit-pecahan-partisi")) {
      const matchKeywords = ["potong", "bagi", "utuh", "bagian", "kue", "pizza", "loyang", "benda", "satu"];
      const hitCount = matchKeywords.filter((k) => cleanText.includes(k)).length;
      if (hitCount >= 2 || cleanText.includes("kue") || cleanText.includes("pizza") || cleanText.includes("bagi")) {
        passed = true;
        feedback = "Bagus! Kamu menjelaskan bahwa kue atau benda yang dibagi memiliki satu satuan utuh yang sama.";
      } else {
        feedback = "Jelaskan bahwa pecahan adalah pembagian dari satu satuan utuh yang berukuran sama.";
      }
    } else if (crit.id.startsWith("crit-pecahan-penyebut")) {
      const matchKeywords = ["penyebut", "pemotong", "banyak", "orang", "kecil", "mengecil", "ukuran", "8"];
      const hitCount = matchKeywords.filter((k) => cleanText.includes(k)).length;
      if (hitCount >= 2 || cleanText.includes("penyebut") || cleanText.includes("mengecil") || cleanText.includes("kecil")) {
        passed = true;
        feedback = "Tepat sekali! Kamu menguraikan bahwa semakin banyak pemotong/penyebut (8 vs 4), ukuran tiap bagian menjadi semakin kecil.";
      } else {
        feedback = "Jelaskan peran penyebut: semakin besar angka penyebut (dibagi ke lebih banyak bagian), semakin kecil ukuran masing-masing potongannya.";
      }
    } else if (crit.id.startsWith("crit-pecahan-kesetaraan")) {
      const matchKeywords = ["setara", "desimal", "senilai", "ekivalen", "0.25", "0.125", "dua kali", "2/8", "kelipatan", "besar"];
      const hitCount = matchKeywords.filter((k) => cleanText.includes(k)).length;
      if (hitCount >= 1 || cleanText.includes("0.25") || cleanText.includes("senilai") || cleanText.includes("dua")) {
        passed = true;
        feedback = "Hebat! Kamu menunjukkan perbandingan nilai atau kesetaraan bahwa 1/4 dua kali lipat lebih besar dari 1/8.";
      } else {
        feedback = "Hubungkan dengan perbandingan ukuran atau nilai desimal (1/4 setara 2/8 atau 0.25 vs 0.125).";
      }
    } else if (crit.id.startsWith("crit-ukur-satuan")) {
      const matchKeywords = ["satuan", "standar", "baku", "si", "meter", "makna", "objektif", "internasional"];
      const hitCount = matchKeywords.filter((k) => cleanText.includes(k)).length;
      if (hitCount >= 1 || cleanText.includes("satuan") || cleanText.includes("baku")) {
        passed = true;
        feedback = "Bagus! Kamu menjelaskan bahwa satuan memberikan makna fisik objektif dan mencegah miskomunikasi.";
      } else {
        feedback = "Jelaskan mengapa angka hasil ukur harus memiliki satuan baku standar internasional.";
      }
    } else if (crit.id.startsWith("crit-ukur-ketidakpastian")) {
      const matchKeywords = ["ketidakpastian", "teliti", "ketelitian", "toleransi", "skala", "alat", "batas", "alat ukur"];
      const hitCount = matchKeywords.filter((k) => cleanText.includes(k)).length;
      if (hitCount >= 1 || cleanText.includes("ketidakpastian") || cleanText.includes("teliti")) {
        passed = true;
        feedback = "Tepat! Kamu menekankan bahwa setiap alat ukur di alam selalu memiliki batas ketelitian.";
      } else {
        feedback = "Sebutkan konsep batas ketelitian atau ketidakpastian alat ukur eksperimental.";
      }
    } else if (crit.id.startsWith("crit-ukur-konsistensi")) {
      const matchKeywords = ["dimensi", "eksperimen", "konsisten", "uji", "homogen", "banding", "ulang"];
      const hitCount = matchKeywords.filter((k) => cleanText.includes(k)).length;
      if (hitCount >= 1 || cleanText.includes("dimensi") || cleanText.includes("konsisten") || cleanText.includes("uji")) {
        passed = true;
        feedback = "Sempurna! Kamu memahami pentingnya konsistensi dimensi agar hasil sains dapat diverifikasi.";
      } else {
        feedback = "Jelaskan perlunya konsistensi dimensi untuk validasi dan pengujian ulang eksperimen.";
      }
    } else if (crit.id.startsWith("crit-vektor-arah")) {
      const matchKeywords = ["sudut", "arah", "orientasi", "vektor", "derajat", "panah", "relatif"];
      const hitCount = matchKeywords.filter((k) => cleanText.includes(k)).length;
      if (hitCount >= 1 || cleanText.includes("arah") || cleanText.includes("sudut")) {
        passed = true;
        feedback = "Bagus! Kamu menjelaskan bahwa penjumlahan vektor bergantung mutlak pada sudut relatif arahnya.";
      } else {
        feedback = "Jelaskan bagaimana sudut antara kedua vektor menentukan hasil resultannya.";
      }
    } else if (crit.id.startsWith("crit-vektor-ekstrem")) {
      const matchKeywords = ["0", "10", "maksimum", "minimum", "searah", "lawan", "180", "nol", "berlawanan"];
      const hitCount = matchKeywords.filter((k) => cleanText.includes(k)).length;
      if (hitCount >= 1 || cleanText.includes("searah") || cleanText.includes("berlawanan") || cleanText.includes("10")) {
        passed = true;
        feedback = "Tepat! Kamu memberikan kondisi ekstrem: searah menghasilkan nilai maksimum (10 N) dan berlawanan arah menghasilkan 0 N.";
      } else {
        feedback = "Beri contoh sudut searah (maksimum 10 N) dan sudut berlawanan (minimum 0 N).";
      }
    } else if (crit.id.startsWith("crit-vektor-skalar")) {
      const matchKeywords = ["skalar", "geometris", "biasa", "panah", "nilai", "beda"];
      const hitCount = matchKeywords.filter((k) => cleanText.includes(k)).length;
      if (hitCount >= 1 || cleanText.includes("skalar") || cleanText.includes("geometris") || cleanText.includes("arah")) {
        passed = true;
        feedback = "Hebat! Perbedaan penjumlahan skalar biasa dengan penjumlahan geometris vektor tersampaikan dengan baik.";
      } else {
        feedback = "Bandingkan penjumlahan skalar biasa dengan penjumlahan vektor berarah.";
      }
    } else if (crit.id.startsWith("crit-kinem-vektor")) {
      const matchKeywords = ["kecepatan", "vektor", "arah", "laju", "skalar", "spidometer"];
      const hitCount = matchKeywords.filter((k) => cleanText.includes(k)).length;
      if (hitCount >= 1 || cleanText.includes("vektor") || cleanText.includes("arah")) {
        passed = true;
        feedback = "Bagus! Kamu membedakan kelajuan skalar dari kecepatan vektor yang memiliki arah.";
      } else {
        feedback = "Jelaskan bahwa kecepatan adalah besaran vektor yang memiliki nilai dan arah.";
      }
    } else if (crit.id.startsWith("crit-kinem-arah")) {
      const matchKeywords = ["percepatan", "arah", "tikungan", "belok", "dv/dt", "ubah", "berubah"];
      const hitCount = matchKeywords.filter((k) => cleanText.includes(k)).length;
      if (hitCount >= 1 || cleanText.includes("percepatan") || cleanText.includes("arah") || cleanText.includes("belok")) {
        passed = true;
        feedback = "Tepat! Kamu menguraikan bahwa perubahan arah vektor tetap menghasilkan percepatan.";
      } else {
        feedback = "Jelaskan bahwa saat membelok di tikungan, arah vektor kecepatan berubah sehingga percepatan terjadi.";
      }
    } else if (crit.id.startsWith("crit-kinem-sentripetal")) {
      const matchKeywords = ["sentripetal", "pusat", "lingkaran", "tarik", "dalam", "membelok"];
      const hitCount = matchKeywords.filter((k) => cleanText.includes(k)).length;
      if (hitCount >= 1 || cleanText.includes("sentripetal") || cleanText.includes("pusat") || cleanText.includes("lingkaran")) {
        passed = true;
        feedback = "Sempurna! Kamu mengidentifikasi arah percepatan sentripetal yang mengarah ke pusat lingkaran.";
      } else {
        feedback = "Sebutkan nama percepatan sentripetal yang arahnya selalu menuju ke pusat lintasan melingkar.";
      }
    } else if (crit.id.startsWith("crit-materi-partikel")) {
      const matchKeywords = ["partikel", "molekul", "sela", "gula", "air", "sebar", "larut"];
      const hitCount = matchKeywords.filter((k) => cleanText.includes(k)).length;
      if (hitCount >= 1 || cleanText.includes("molekul") || cleanText.includes("partikel") || cleanText.includes("sela")) {
        passed = true;
        feedback = "Bagus! Kamu menjelaskan partikel molekul gula menyebar di sela molekul air.";
      } else {
        feedback = "Jelaskan proses pelarutan mikroskopis molekul gula di antara molekul air.";
      }
    } else if (crit.id.startsWith("crit-materi-identitas")) {
      const matchKeywords = ["kimia", "identitas", "manis", "baru", "zat", "ikatan"];
      const hitCount = matchKeywords.filter((k) => cleanText.includes(k)).length;
      if (hitCount >= 1 || cleanText.includes("manis") || cleanText.includes("zat baru") || cleanText.includes("identitas")) {
        passed = true;
        feedback = "Tepat! Kamu menegaskan tidak ada zat kimia baru yang terbentuk sehingga sifat manis tetap utuh.";
      } else {
        feedback = "Jelaskan bahwa identitas kimia gula tidak berubah dan rasa manisnya tetap ada.";
      }
    } else if (crit.id.startsWith("crit-materi-reversibel")) {
      const matchKeywords = ["reversibel", "uap", "kristalisasi", "pisah", "fisika", "kembali", "air"];
      const hitCount = matchKeywords.filter((k) => cleanText.includes(k)).length;
      if (hitCount >= 1 || cleanText.includes("uap") || cleanText.includes("kembali") || cleanText.includes("kristal")) {
        passed = true;
        feedback = "Hebat! Kamu membuktikan sifat perubahan fisika yang reversibel (gula dapat diperoleh kembali bila air diuapkan).";
      } else {
        feedback = "Sebutkan bahwa gula dapat diperoleh kembali melalui penguapan atau kristalisasi.";
      }
    } else if (crit.id.startsWith("crit-senyawa-ikatan")) {
      const matchKeywords = ["senyawa", "h2o", "ikatan", "tetap", "molekul", "kimia", "murni"];
      const hitCount = matchKeywords.filter((k) => cleanText.includes(k)).length;
      if (hitCount >= 1 || cleanText.includes("ikatan") || cleanText.includes("h2o") || cleanText.includes("senyawa")) {
        passed = true;
        feedback = "Bagus! Kamu menjelaskan air suling adalah molekul senyawa H2O dengan ikatan kimia tetap.";
      } else {
        feedback = "Jelaskan air murni suling sebagai senyawa dengan rasio atom terikat kuat.";
      }
    } else if (crit.id.startsWith("crit-senyawa-campuran")) {
      const matchKeywords = ["campuran", "laut", "garam", "larut", "bervariasi", "nacl", "mineral"];
      const hitCount = matchKeywords.filter((k) => cleanText.includes(k)).length;
      if (hitCount >= 1 || cleanText.includes("campuran") || cleanText.includes("garam") || cleanText.includes("laut")) {
        passed = true;
        feedback = "Tepat! Kamu menguraikan air laut sebagai campuran larutan garam dan mineral.";
      } else {
        feedback = "Jelaskan air laut sebagai campuran fisik aneka garam terlarut tanpa ikatan kimia baru.";
      }
    } else if (crit.id.startsWith("crit-senyawa-pemisahan")) {
      const matchKeywords = ["uap", "distilasi", "evaporasi", "pisah", "fisika", "elektrolisis", "didih"];
      const hitCount = matchKeywords.filter((k) => cleanText.includes(k)).length;
      if (hitCount >= 1 || cleanText.includes("pisah") || cleanText.includes("uap") || cleanText.includes("distilasi")) {
        passed = true;
        feedback = "Sempurna! Kamu membedakan pemisahan fisika (distilasi/evaporasi air laut) dengan pemisahan kimiawi senyawa.";
      } else {
        feedback = "Jelaskan bahwa komponen air laut dapat dipisahkan melalui proses fisika seperti penguapan.";
      }
    } else if (crit.id.startsWith("crit-atom-awan")) {
      const matchKeywords = ["awan", "elektron", "luar", "kulit", "negatif", "muatan"];
      const hitCount = matchKeywords.filter((k) => cleanText.includes(k)).length;
      if (hitCount >= 1 || cleanText.includes("elektron") || cleanText.includes("awan")) {
        passed = true;
        feedback = "Bagus! Kamu menyebutkan lapisan awan elektron bermuatan negatif yang membungkus permukaan luar setiap atom.";
      } else {
        feedback = "Jelaskan bahwa bagian terluar atom dilapisi oleh awan elektron bermuatan negatif.";
      }
    } else if (crit.id.startsWith("crit-atom-tolak")) {
      const matchKeywords = ["tolak", "elektrostatik", "coulomb", "muatan", "gaya", "listrik"];
      const hitCount = matchKeywords.filter((k) => cleanText.includes(k)).length;
      if (hitCount >= 1 || cleanText.includes("tolak") || cleanText.includes("gaya") || cleanText.includes("muatan")) {
        passed = true;
        feedback = "Tepat! Kamu menguraikan gaya tolak-menolak elektrostatik antarmuatan negatif sejenis.";
      } else {
        feedback = "Sebutkan gaya tolak-menolak elektrostatik antara elektron di tangan dan elektron di meja.";
      }
    } else if (crit.id.startsWith("crit-atom-padat")) {
      const matchKeywords = ["ilusi", "padat", "medan", "sentuh", "benturan", "elektromagnetik"];
      const hitCount = matchKeywords.filter((k) => cleanText.includes(k)).length;
      if (hitCount >= 1 || cleanText.includes("sentuh") || cleanText.includes("padat") || cleanText.includes("medan")) {
        passed = true;
        feedback = "Hebat! Kamu menyimpulkan bahwa sentuhan fisik adalah tolakan medan elektromagnetik bukan tumbukan massa padat.";
      } else {
        feedback = "Jelaskan bahwa sensasi kepadatan sebenarnya berasal dari tolakan gaya elektromagnetik.";
      }
    } else if (crit.id.startsWith("crit-hidup-mati")) {
      const matchKeywords = ["benda", "mati", "aseluler", "kristal", "luar", "inang", "metabolisme", "diam"];
      const hitCount = matchKeywords.filter((k) => cleanText.includes(k)).length;
      if (hitCount >= 1 || cleanText.includes("mati") || cleanText.includes("luar inang") || cleanText.includes("kristal")) {
        passed = true;
        feedback = "Bagus! Kamu menjelaskan virus di luar inang bersifat inert tanpa metabolisme dan dapat dikristalkan seperti benda mati.";
      } else {
        feedback = "Jelaskan sifat benda mati virus saat berada bebas di luar sel inang.";
      }
    } else if (crit.id.startsWith("crit-hidup-hidup")) {
      const matchKeywords = ["hidup", "replikasi", "genetik", "dna", "rna", "dalam", "biak", "inang"];
      const hitCount = matchKeywords.filter((k) => cleanText.includes(k)).length;
      if (hitCount >= 1 || cleanText.includes("replikasi") || cleanText.includes("genetik") || cleanText.includes("dna") || cleanText.includes("rna")) {
        passed = true;
        feedback = "Tepat! Kamu menguraikan bahwa virus membawa materi genetik dan mampu bereplikasi di dalam sel inang.";
      } else {
        feedback = "Sebutkan kemampuan virus mereplikasi materi genetiknya (DNA/RNA) di dalam sel inang.";
      }
    } else if (crit.id.startsWith("crit-hidup-parasit")) {
      const matchKeywords = ["parasit", "obligat", "inang", "sel", "batas", "ketergantungan", "mesin"];
      const hitCount = matchKeywords.filter((k) => cleanText.includes(k)).length;
      if (hitCount >= 1 || cleanText.includes("parasit") || cleanText.includes("inang") || cleanText.includes("batas")) {
        passed = true;
        feedback = "Sempurna! Kamu menyimpulkan virus sebagai parasit obligat di tapal batas kehidupan.";
      } else {
        feedback = "Jelaskan status virus sebagai parasit intraseluler obligat di perbatasan hidup.";
      }
    } else if (crit.id.startsWith("crit-tingkat-emergen")) {
      const matchKeywords = ["emergen", "sifat", "baru", "muncul", "keseluruhan", "interaksi", "susunan"];
      const hitCount = matchKeywords.filter((k) => cleanText.includes(k)).length;
      if (hitCount >= 1 || cleanText.includes("emergen") || cleanText.includes("sifat baru") || cleanText.includes("muncul")) {
        passed = true;
        feedback = "Bagus! Kamu mendefinisikan sifat emergen: karakteristik baru yang muncul dari keteraturan interaksi antarkomponen.";
      } else {
        feedback = "Jelaskan konsep sifat emergen (emergent properties) yang muncul pada susunan yang lebih tinggi.";
      }
    } else if (crit.id.startsWith("crit-tingkat-hierarki")) {
      const matchKeywords = ["sel", "jaringan", "organ", "otak", "jantung", "hierarki", "susun"];
      const hitCount = matchKeywords.filter((k) => cleanText.includes(k)).length;
      if (hitCount >= 1 || cleanText.includes("organ") || cleanText.includes("sel") || cleanText.includes("jaringan")) {
        passed = true;
        feedback = "Tepat! Kamu memberikan contoh organisasi bertingkat seperti sel membentuk jaringan dan organ fungsional.";
      } else {
        feedback = "Beri contoh tingkatan hierarki seperti sel saraf membentuk otak yang mampu berpikir.";
      }
    } else if (crit.id.startsWith("crit-tingkat-holistik")) {
      const matchKeywords = ["holistik", "reduksionis", "sistem", "kesadaran", "kompleks", "atom", "lebih besar"];
      const hitCount = matchKeywords.filter((k) => cleanText.includes(k)).length;
      if (hitCount >= 1 || cleanText.includes("holistik") || cleanText.includes("kesadaran") || cleanText.includes("sistem") || cleanText.includes("atom")) {
        passed = true;
        feedback = "Luar biasa! Perspektif holistik biologismu membuktikan bahwa kehidupan melampaui kumpulan atom fisik.";
      } else {
        feedback = "Jelaskan mengapa pendekatan holistik sistemik diperlukan untuk memahami fungsi kehidupan kompleks.";
      }
    } else if (crit.id.includes("geom") || crit.name.toLowerCase().includes("geometri") || crit.name.toLowerCase().includes("tangent")) {
      const matchKeywords = ["singgung", "tangent", "secant", "potong", "menyentuh", "garis"];
      const hitCount = matchKeywords.filter((k) => cleanText.includes(k)).length;
      if (hitCount >= 2 || (cleanText.includes("singgung") && cleanText.includes("titik"))) {
        passed = true;
        feedback = "Bagus! Kamu berhasil menjelaskan peralihan garis potong menjadi garis singgung.";
      } else {
        feedback = "Coba hubungkan bagaimana dua titik pada kurva didekatkan hingga garisnya menyentuh satu titik saja (garis singgung).";
      }
    } else if (crit.id.includes("limit") || crit.name.toLowerCase().includes("limit") || crit.name.toLowerCase().includes("jarak")) {
      const matchKeywords = ["limit", "mendekati", "nol", "0", "jarak", "h "];
      const hitCount = matchKeywords.filter((k) => cleanText.includes(k)).length;
      if (hitCount >= 2 || cleanText.includes("limit") || (cleanText.includes("mendekati") && cleanText.includes("0"))) {
        passed = true;
        feedback = "Tepat! Kamu menekankan peran limit saat selisih jarak mendekati nol tanpa membagi nol.";
      } else {
        feedback = "Jelaskan mengapa kita menggunakan limit saat selisih jarak horizontal (h) mendekati nol.";
      }
    } else {
      // General semantic matching with words from criterion name and description
      const critWords = (crit.name + " " + crit.description)
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, " ")
        .split(/\s+/)
        .filter((w) => w.length >= 4);
      const hitCount = critWords.filter((w) => cleanText.includes(w)).length;
      if (hitCount >= 2 || cleanText.length > 30) {
        passed = true;
        feedback = "Bagus! Penjelasan intimu sudah mencakup esensi konsep yang diminta.";
      } else {
        feedback = `Jelaskan secara lebih mendalam aspek '${crit.name}'.`;
      }
    }

    if (passed) {
      earnedScore += crit.weight;
    }

    criteriaResults.push({
      criterionId: crit.id,
      name: crit.name,
      passed,
      score: passed ? 100 : 30,
      feedback,
    });
  }

  const normalizedScore = Math.round((earnedScore / totalPossible) * 100);
  const isPassed = normalizedScore >= passingThreshold;

  const naiGuidance = isPassed
    ? "Penjelasanmu sangat jernih dan menangkap esensi kalkulus: bahwa turunan lahir dari limit kemiringan garis potong yang bertransformasi menjadi garis singgung sesaat."
    : "Penjelasanmu adalah awal yang baik! Perhatikan catatan pada kriteria yang belum terpenuhi di atas, lalu coba lengkapi penjelasanmu.";

  const overallFeedback = isPassed
    ? `Pemahaman konsep terverifikasi (Skor: ${normalizedScore}/100). Kamu telah berhasil menjelaskan konsep ini dengan bahasamu sendiri.`
    : `Skor pemahaman saat ini: ${normalizedScore}/100. Diperlukan skor minimal ${passingThreshold} untuk memenuhi kriteria penjelasan utuh.`;

  // 1. Update conceptProgress explanation dimension
  const [currentProgress] = await db
    .select()
    .from(conceptProgress)
    .where(
      and(
        eq(conceptProgress.learnerDeviceId, actor.learnerDeviceId),
        eq(conceptProgress.conceptId, concept.id)
      )
    )
    .limit(1);

  const initialSnapshot: ConceptMasterySnapshot = currentProgress
    ? {
        understanding: currentProgress.understanding,
        practice: currentProgress.practice,
        application: currentProgress.application,
        transfer: currentProgress.transfer,
        explanation: currentProgress.explanation,
        retention: currentProgress.retention,
        status: currentProgress.status as ConceptMasterySnapshot["status"],
      }
    : {
        understanding: 0,
        practice: 0,
        application: 0,
        transfer: 0,
        explanation: 0,
        retention: 0,
        status: "learning",
      };

  const delta = isPassed ? 30 : 10;
  const newSnapshot = applyMasteryUpdate(initialSnapshot, "explanation", delta);

  if (currentProgress) {
    await db
      .update(conceptProgress)
      .set({
        explanation: newSnapshot.explanation,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(conceptProgress.learnerDeviceId, actor.learnerDeviceId),
          eq(conceptProgress.conceptId, concept.id)
        )
      );
  } else {
    await db.insert(conceptProgress).values({
      learnerDeviceId: actor.learnerDeviceId,
      conceptId: concept.id,
      explanation: newSnapshot.explanation,
      status: newSnapshot.status,
      updatedAt: new Date(),
    });
  }

  // 2. Log learning evidence
  await db.insert(learningEvidence).values({
    attemptId: null,
    learnerDeviceId: actor.learnerDeviceId,
    conceptId: concept.id,
    dimension: "explanation",
    score: delta,
    source: "explain",
    observedAt: new Date(),
  });

  // 3. Log AI interaction
  await db.insert(aiInteractions).values({
    id: randomUUID(),
    learnerDeviceId: actor.learnerDeviceId,
    conceptId: concept.id,
    mode: "explainFeedback",
    provider: "nalar-rubric-orchestrator",
    model: "v1.0-curated",
    inputVersion: 1,
    output: {
      score: normalizedScore,
      passed: isPassed,
      criteriaResults,
      naiGuidance,
    },
    createdAt: new Date(),
  });

  return {
    passed: isPassed,
    totalScore: normalizedScore,
    criteriaResults,
    overallFeedback,
    naiGuidance,
    explanationMastery: newSnapshot.explanation,
  };
}
