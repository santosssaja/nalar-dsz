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

    if (crit.id.includes("geom") || crit.name.toLowerCase().includes("geometri") || crit.name.toLowerCase().includes("tangent")) {
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
      // Meaning / slope / rate
      const matchKeywords = ["kemiringan", "laju", "perubahan", "gradien", "slope", "sesaat", "turunan"];
      const hitCount = matchKeywords.filter((k) => cleanText.includes(k)).length;
      if (hitCount >= 2 || cleanText.includes("kemiringan") || cleanText.includes("laju")) {
        passed = true;
        feedback = "Bagus! Makna turunan sebagai kemiringan atau laju perubahan sesaat sudah tersampaikan.";
      } else {
        feedback = "Jelaskan apa arti turunan secara nyata (misalnya: kemiringan garis di titik tersebut atau laju perubahan sesaat).";
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
