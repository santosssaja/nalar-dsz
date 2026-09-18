import { createHash, randomUUID } from "crypto";
import { eq, desc } from "drizzle-orm";
import {
  ConceptContent,
  ConceptContentSchema,
} from "@/content/schema";
import { getDb, ensureDbInitialized, contentVersions } from "@/server/db";

export interface ValidationItem {
  category: "schema" | "pedagogy" | "accessibility" | "graph";
  rule: string;
  passed: boolean;
  message: string;
}

export interface ValidationReport {
  valid: boolean;
  errors: string[];
  warnings: string[];
  checklist: ValidationItem[];
}

export interface PublishResult {
  success: boolean;
  version: number;
  checksum: string;
  publishedAt: Date;
  validation: ValidationReport;
}

export function computeContentChecksum(payload: unknown): string {
  const serialized = JSON.stringify(payload);
  return createHash("sha256").update(serialized).digest("hex");
}

export function detectPrerequisiteCycle(
  concepts: Array<{ slug: string; prerequisites: string[] }>
): { hasCycle: boolean; cycle?: string[] } {
  const adj = new Map<string, string[]>();
  for (const c of concepts) {
    adj.set(c.slug, c.prerequisites || []);
  }

  const visited = new Set<string>();
  const recStack = new Set<string>();
  const path: string[] = [];

  function dfs(node: string): boolean {
    visited.add(node);
    recStack.add(node);
    path.push(node);

    const neighbors = adj.get(node) || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        if (dfs(neighbor)) return true;
      } else if (recStack.has(neighbor)) {
        path.push(neighbor);
        return true;
      }
    }

    recStack.delete(node);
    path.pop();
    return false;
  }

  for (const node of adj.keys()) {
    if (!visited.has(node)) {
      if (dfs(node)) {
        return { hasCycle: true, cycle: path };
      }
    }
  }

  return { hasCycle: false };
}

export function validateConceptContent(
  rawContent: unknown,
  existingConcepts: Array<{ slug: string; prerequisites: string[] }> = []
): ValidationReport {
  const errors: string[] = [];
  const warnings: string[] = [];
  const checklist: ValidationItem[] = [];

  // 1. Zod Schema Check
  const parseResult = ConceptContentSchema.safeParse(rawContent);
  if (!parseResult.success) {
    const fieldErrors = parseResult.error.flatten().fieldErrors;
    for (const [field, msgs] of Object.entries(fieldErrors)) {
      errors.push(`[Schema] Bidang '${field}': ${(msgs || []).join(", ")}`);
    }
    checklist.push({
      category: "schema",
      rule: "Kesesuaian Skema Zod",
      passed: false,
      message: "Konten gagal divalidasi oleh skema ConceptContent.",
    });
    return { valid: false, errors, warnings, checklist };
  }

  const concept = parseResult.data;
  checklist.push({
    category: "schema",
    rule: "Kesesuaian Skema Zod",
    passed: true,
    message: "Struktur data memenuhi skema Zod secara ketat.",
  });

  // 2. Pedagogical Checks
  const hasObjectives = concept.learningObjectives.length > 0;
  checklist.push({
    category: "pedagogy",
    rule: "Tujuan Pembelajaran Eksplisit",
    passed: hasObjectives,
    message: hasObjectives
      ? `${concept.learningObjectives.length} tujuan pembelajaran terdefinisi.`
      : "Konsep wajib memiliki minimal satu tujuan pembelajaran.",
  });
  if (!hasObjectives) errors.push("Tujuan pembelajaran kosong.");

  // Step sequence check
  const kinds = concept.steps.map((s) => s.kind);
  const hasPractice = kinds.includes("practice") || kinds.includes("predict");
  checklist.push({
    category: "pedagogy",
    rule: "Latihan atau Prediksi Aktif",
    passed: hasPractice,
    message: hasPractice
      ? "Konsep memiliki langkah interaktif (prediksi atau latihan)."
      : "Disarankan menyertakan minimal satu langkah predict atau practice.",
  });
  if (!hasPractice) {
    warnings.push("Konsep tidak memiliki latihan aktif (predict/practice).");
  }

  // Hints completeness
  let allHintsValid = true;
  for (const step of concept.steps) {
    if (step.hints && !step.hints.solution) {
      allHintsValid = false;
      errors.push(`Langkah '${step.title}' memiliki hint tanpa layer solusi.`);
    }
  }
  checklist.push({
    category: "pedagogy",
    rule: "Kelengkapan Hint Berlapis",
    passed: allHintsValid,
    message: allHintsValid
      ? "Semua langkah ber-hint menyertakan solusi penjelas."
      : "Setiap langkah dengan hint harus memiliki level solusi.",
  });

  // 3. Accessibility Checks
  let accessibilityPassed = true;
  for (const step of concept.steps) {
    if (step.kind === "explore" && (!step.instruction || step.instruction.length < 5)) {
      accessibilityPassed = false;
      warnings.push(`Langkah simulasi '${step.title}' memerlukan instruksi alternatif visual.`);
    }
  }
  checklist.push({
    category: "accessibility",
    rule: "Instruksi & Alternatif Non-Visual",
    passed: accessibilityPassed,
    message: accessibilityPassed
      ? "Seluruh langkah menyertakan instruksi yang memadai."
      : "Langkah interaktif memerlukan instruksi eksplisit.",
  });

  // 4. DAG Prerequisite Graph Check
  const combinedConcepts = [
    ...existingConcepts.filter((c) => c.slug !== concept.slug),
    { slug: concept.slug, prerequisites: concept.prerequisites },
  ];
  const cycleCheck = detectPrerequisiteCycle(combinedConcepts);
  checklist.push({
    category: "graph",
    rule: "Prasyarat Bebas Siklus (DAG)",
    passed: !cycleCheck.hasCycle,
    message: !cycleCheck.hasCycle
      ? "Graf dependensi prasyarat valid (Acyclic)."
      : `Terdeteksi siklus prasyarat melingkar: ${cycleCheck.cycle?.join(" → ")}`,
  });
  if (cycleCheck.hasCycle) {
    errors.push(`Siklus prasyarat terdeteksi: ${cycleCheck.cycle?.join(" → ")}`);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    checklist,
  };
}

export async function publishConceptContent(
  concept: ConceptContent
): Promise<PublishResult> {
  await ensureDbInitialized();
  const db = getDb();

  // 1. Run full validation pipeline
  const validation = validateConceptContent(concept);
  if (!validation.valid) {
    throw new Error(
      `Gagal mempublikasikan konsep: ${validation.errors.join("; ")}`
    );
  }

  // 2. Generate deterministic checksum
  const checksum = computeContentChecksum(concept);

  // 3. Query existing versions for this concept
  const existingVersions = await db
    .select()
    .from(contentVersions)
    .where(eq(contentVersions.ownerId, concept.id))
    .orderBy(desc(contentVersions.version))
    .limit(1);

  const nextVersion =
    existingVersions.length > 0 ? existingVersions[0].version + 1 : 1;

  const now = new Date();

  // 4. Insert immutable version record
  await db.insert(contentVersions).values({
    id: randomUUID(),
    ownerType: "concept",
    ownerId: concept.id,
    version: nextVersion,
    payload: concept,
    publishedAt: now,
    checksum,
  });

  return {
    success: true,
    version: nextVersion,
    checksum,
    publishedAt: now,
    validation,
  };
}

export async function getContentVersionHistory(ownerId: string) {
  await ensureDbInitialized();
  const db = getDb();

  return db
    .select({
      id: contentVersions.id,
      version: contentVersions.version,
      checksum: contentVersions.checksum,
      publishedAt: contentVersions.publishedAt,
    })
    .from(contentVersions)
    .where(eq(contentVersions.ownerId, ownerId))
    .orderBy(desc(contentVersions.version));
}
