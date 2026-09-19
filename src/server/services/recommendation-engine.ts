import { Actor } from "@/server/auth/actor-resolver";
import { getModuleBySlug, getConceptBySlug, getConceptById, getModules } from "@/content/loader";
import { getAllLearnerProgress, getMistakeSummaryForLearner } from "./learning-service";
import { getDueReviews } from "./retrieval-service";

export interface RecommendationResult {
  targetType: "concept" | "review" | "module";
  targetId: string;
  targetSlug: string;
  targetTitle: string;
  priority: number;
  reasonCode:
    | "PREREQUISITE_INCOMPLETE"
    | "RETRIEVAL_DUE"
    | "MISCONCEPTION_REMEDIAL"
    | "NEXT_PATH_NODE"
    | "PATH_COMPLETED";
  reasonText: string;
}

export async function getNextRecommendation(
  actor: Actor,
  moduleSlug = "turunan"
): Promise<RecommendationResult> {
  const moduleContent = getModuleBySlug(moduleSlug);
  if (!moduleContent) {
    throw new Error(`Modul dengan slug '${moduleSlug}' tidak ditemukan.`);
  }

  // 1. Fetch learner progress & reviews
  const progressList = await getAllLearnerProgress(actor);
  const progressMap = new Map(progressList.map((p) => [p.conceptSlug, p]));

  // Priority 1: Check Incomplete Prerequisites for any active/attempted concept
  const pathNodes = moduleContent.learningPath.nodes;
  for (const node of pathNodes) {
    const concept = getConceptBySlug(node.conceptSlug);
    if (!concept) continue;

    const prog = progressMap.get(concept.slug);
    // If learner is currently learning or attempted this concept, ensure its prerequisites are completed
    if (prog && prog.status !== "unstarted") {
      for (const prereqSlug of concept.prerequisites) {
        const prereqProgress = progressMap.get(prereqSlug);
        const prereqCompleted =
          prereqProgress &&
          (prereqProgress.status === "practiced" || prereqProgress.status === "mastered");

        if (!prereqCompleted) {
          const prereqConcept = getConceptBySlug(prereqSlug);
          if (prereqConcept) {
            return {
              targetType: "concept",
              targetId: prereqConcept.id,
              targetSlug: prereqConcept.slug,
              targetTitle: prereqConcept.title,
              priority: 1,
              reasonCode: "PREREQUISITE_INCOMPLETE",
              reasonText: `Selesaikan konsep prasyarat '${prereqConcept.title}' terlebih dahulu sebelum melanjutkan '${concept.title}'.`,
            };
          }
        }
      }
    }
  }

  // Priority 2: Spaced Retrieval Due
  const dueReviews = await getDueReviews(actor);
  if (dueReviews.length > 0) {
    const firstDue = dueReviews[0];
    return {
      targetType: "review",
      targetId: firstDue.conceptId,
      targetSlug: firstDue.conceptSlug,
      targetTitle: firstDue.conceptTitle,
      priority: 2,
      reasonCode: "RETRIEVAL_DUE",
      reasonText: `Waktunya mengulang konsep '${firstDue.conceptTitle}' untuk mengunci retensi memori jangka panjang.`,
    };
  }

  // Priority 3: Active Misconception Remedial
  const mistakes = await getMistakeSummaryForLearner(actor);
  for (const m of mistakes) {
    const concept = getConceptById(m.conceptId);
    if (!concept) continue;
    const prog = progressMap.get(concept.slug);
    // If not mastered, address the active misconception
    if (!prog || prog.status !== "mastered") {
      return {
        targetType: "concept",
        targetId: concept.id,
        targetSlug: concept.slug,
        targetTitle: concept.title,
        priority: 3,
        reasonCode: "MISCONCEPTION_REMEDIAL",
        reasonText: `Ada miskonsepsi yang perlu diperbaiki pada '${concept.title}': ${m.label}. Remedial: ${m.remediation}`,
      };
    }
  }

  // Priority 4: Next Path Node in curriculum
  for (const node of pathNodes) {
    const concept = getConceptBySlug(node.conceptSlug);
    if (!concept) continue;

    const prog = progressMap.get(concept.slug);
    if (!prog || prog.status === "unstarted" || prog.status === "learning") {
      return {
        targetType: "concept",
        targetId: concept.id,
        targetSlug: concept.slug,
        targetTitle: concept.title,
        priority: 4,
        reasonCode: "NEXT_PATH_NODE",
        reasonText: `Lanjutkan eksplorasi materi ke konsep berikutnya: '${concept.title}'.`,
      };
    }
  }

  // Priority 5: Path Completed
  return {
    targetType: "module",
    targetId: moduleContent.id,
    targetSlug: moduleContent.slug,
    targetTitle: moduleContent.title,
    priority: 5,
    reasonCode: "PATH_COMPLETED",
    reasonText: `Selamat! Kamu telah menyelesaikan seluruh konsep inti pada modul ${moduleContent.title}.`,
  };
}

export async function getGlobalLearnerRecommendation(
  actor: Actor
): Promise<RecommendationResult> {
  // 1. Spaced Retrieval Due across any concept
  const dueReviews = await getDueReviews(actor);
  if (dueReviews.length > 0) {
    const firstDue = dueReviews[0];
    return {
      targetType: "review",
      targetId: firstDue.conceptId,
      targetSlug: firstDue.conceptSlug,
      targetTitle: firstDue.conceptTitle,
      priority: 1,
      reasonCode: "RETRIEVAL_DUE",
      reasonText: `Waktunya mengulang konsep '${firstDue.conceptTitle}' untuk memperkuat retensi memori jangka panjang.`,
    };
  }

  // 2. Active Misconception Remedial
  const mistakes = await getMistakeSummaryForLearner(actor);
  const progressList = await getAllLearnerProgress(actor);
  const progressMap = new Map(progressList.map((p) => [p.conceptSlug, p]));

  for (const m of mistakes) {
    const concept = getConceptById(m.conceptId);
    if (!concept) continue;
    const prog = progressMap.get(concept.slug);
    if (!prog || prog.status !== "mastered") {
      return {
        targetType: "concept",
        targetId: concept.id,
        targetSlug: concept.slug,
        targetTitle: concept.title,
        priority: 2,
        reasonCode: "MISCONCEPTION_REMEDIAL",
        reasonText: `Ada miskonsepsi yang perlu diperbaiki pada '${concept.title}': ${m.label}. Remedial: ${m.remediation}`,
      };
    }
  }

  // 3. Next Path Node across modules in logical sequence
  const allModules = getModules();
  for (const mod of allModules) {
    for (const node of mod.learningPath.nodes) {
      const concept = getConceptBySlug(node.conceptSlug);
      if (!concept) continue;

      const prog = progressMap.get(concept.slug);
      if (!prog || prog.status === "unstarted" || prog.status === "learning") {
        return {
          targetType: "concept",
          targetId: concept.id,
          targetSlug: concept.slug,
          targetTitle: concept.title,
          priority: 3,
          reasonCode: "NEXT_PATH_NODE",
          reasonText: `Lanjutkan eksplorasi modul ${mod.title} pada konsep '${concept.title}'.`,
        };
      }
    }
  }

  // 4. All modules completed
  return {
    targetType: "module",
    targetId: allModules[0]?.id ?? "completed",
    targetSlug: allModules[0]?.slug ?? "fondasi-matematika",
    targetTitle: "Semua Modul Tuntas",
    priority: 4,
    reasonCode: "PATH_COMPLETED",
    reasonText: "Selamat! Kamu telah menuntaskan seluruh materi konsep kurikulum STEM Nalar.",
  };
}

