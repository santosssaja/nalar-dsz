import { z } from "zod";

// 1. Misconceptions
export const MisconceptionTaxonomySchema = z.object({
  code: z.string(),
  label: z.string(),
  remediation: z.string(),
});
export type MisconceptionTaxonomy = z.infer<typeof MisconceptionTaxonomySchema>;

// 2. Step Kind
export const StepKindSchema = z.enum([
  "encounter",
  "explore",
  "predict",
  "understand",
  "practice",
  "apply",
  "transfer",
  "explain",
  "experiment",
  "retrieve",
  "connect",
]);
export type StepKind = z.infer<typeof StepKindSchema>;

// 3. Hint Layers
export const HintLayerSchema = z.object({
  orientation: z.string().optional(),
  concept: z.string().optional(),
  strategy: z.string().optional(),
  solution: z.string(),
});
export type HintLayer = z.infer<typeof HintLayerSchema>;
export type HintLevel = "orientation" | "concept" | "strategy" | "solution";

// 4. Step Evaluation Configs
export const NumericEvaluationSchema = z.object({
  type: z.literal("numeric"),
  expectedValue: z.number(),
  tolerance: z.number().default(0.01),
  units: z.string().optional(),
  feedbackCorrect: z.string().default("Jawabanmu tepat!"),
  misconceptions: z
    .array(
      z.object({
        code: z.string(),
        triggerValue: z.number(),
        feedback: z.string(),
      })
    )
    .default([]),
});

export const ChoiceOptionSchema = z.object({
  id: z.string(),
  label: z.string(),
  isCorrect: z.boolean(),
  misconceptionCode: z.string().optional(),
  feedback: z.string().optional(),
});

export const ChoiceEvaluationSchema = z.object({
  type: z.literal("choice"),
  options: z.array(ChoiceOptionSchema).min(2),
  feedbackCorrect: z.string().default("Prediksi / jawabanmu benar!"),
});

export const RubricCriterionSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  weight: z.number().default(1),
});

export const RubricEvaluationSchema = z.object({
  type: z.literal("rubric"),
  rubricId: z.string(),
  criteria: z.array(RubricCriterionSchema).min(1),
  passingThreshold: z.number().default(70),
});

export const StepEvaluationSchema = z.discriminatedUnion("type", [
  NumericEvaluationSchema,
  ChoiceEvaluationSchema,
  RubricEvaluationSchema,
]);
export type StepEvaluation = z.infer<typeof StepEvaluationSchema>;

// 5. Learning Step Content
export const StepContentSchema = z.object({
  id: z.string().uuid(),
  kind: StepKindSchema,
  sortOrder: z.number(),
  title: z.string(),
  instruction: z.string(),
  content: z.string(),
  estimatedMinutes: z.number().default(3),
  config: z.record(z.unknown()).default({}),
  hints: HintLayerSchema.optional(),
  evaluation: StepEvaluationSchema.optional(),
  accessibility: z
    .object({
      altText: z.string().optional(),
      screenReaderNote: z.string().optional(),
    })
    .optional(),
});
export type StepContent = z.infer<typeof StepContentSchema>;

// 6. Concept Content
export const ConceptContentSchema = z.object({
  id: z.string().uuid(),
  moduleId: z.string().uuid(),
  slug: z.string(),
  title: z.string(),
  summary: z.string(),
  difficulty: z.enum(["introductory", "standard", "advanced"]).default("standard"),
  learningObjectives: z.array(z.string()),
  prerequisites: z.array(z.string()).default([]),
  misconceptions: z.array(MisconceptionTaxonomySchema).default([]),
  steps: z.array(StepContentSchema).min(1),
  rubric: RubricEvaluationSchema.optional(),
});
export type ConceptContent = z.infer<typeof ConceptContentSchema>;

// 7. Module Content
export const ModuleContentSchema = z.object({
  id: z.string().uuid(),
  domainId: z.string().uuid(),
  domainSlug: z.string(),
  slug: z.string(),
  title: z.string(),
  summary: z.string(),
  estimatedMinutes: z.number().default(60),
  prerequisites: z
    .array(
      z.object({
        slug: z.string(),
        title: z.string(),
        required: z.boolean().default(true),
      })
    )
    .default([]),
  conceptSlugs: z.array(z.string()).min(1),
  learningPath: z.object({
    slug: z.string(),
    title: z.string(),
    nodes: z.array(
      z.object({
        conceptSlug: z.string(),
        sortOrder: z.number(),
        required: z.boolean().default(true),
      })
    ),
  }),
});
export type ModuleContent = z.infer<typeof ModuleContentSchema>;

// 8. Domain Content
export const DomainContentSchema = z.object({
  id: z.string().uuid(),
  slug: z.string(),
  title: z.string(),
  summary: z.string(),
  sortOrder: z.number().default(0),
  moduleSlugs: z.array(z.string()).min(1),
});
export type DomainContent = z.infer<typeof DomainContentSchema>;
