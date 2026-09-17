import {
  DomainContent,
  DomainContentSchema,
  ModuleContent,
  ModuleContentSchema,
  ConceptContent,
  ConceptContentSchema,
  StepContent,
} from "./schema";

// Import raw JSON content
import matematikaDomain from "./data/domains/matematika.json";
import turunanModule from "./data/modules/turunan.json";
import perubahanConcept from "./data/concepts/01-perubahan.json";
import lajuPerubahanConcept from "./data/concepts/02-laju-perubahan.json";
import definisiTurunanConcept from "./data/concepts/03-definisi-turunan.json";

// In-memory validated cache
let cachedDomains: DomainContent[] | null = null;
let cachedModules: ModuleContent[] | null = null;
let cachedConcepts: ConceptContent[] | null = null;

function loadAllContent() {
  if (cachedDomains && cachedModules && cachedConcepts) {
    return {
      domains: cachedDomains,
      modules: cachedModules,
      concepts: cachedConcepts,
    };
  }

  const domains = [DomainContentSchema.parse(matematikaDomain)];
  const modules = [ModuleContentSchema.parse(turunanModule)];
  const concepts = [
    ConceptContentSchema.parse(perubahanConcept),
    ConceptContentSchema.parse(lajuPerubahanConcept),
    ConceptContentSchema.parse(definisiTurunanConcept),
  ];

  cachedDomains = domains;
  cachedModules = modules;
  cachedConcepts = concepts;

  return { domains, modules, concepts };
}

export function getDomains(): DomainContent[] {
  return loadAllContent().domains;
}

export function getDomainBySlug(slug: string): DomainContent | undefined {
  return getDomains().find((d) => d.slug === slug);
}

export function getModules(domainSlug?: string): ModuleContent[] {
  const allModules = loadAllContent().modules;
  if (!domainSlug) return allModules;
  return allModules.filter((m) => m.domainSlug === domainSlug);
}

export function getModuleBySlug(slug: string): ModuleContent | undefined {
  return loadAllContent().modules.find((m) => m.slug === slug);
}

export function getConcepts(moduleSlug?: string): ConceptContent[] {
  const allConcepts = loadAllContent().concepts;
  if (!moduleSlug) return allConcepts;
  const mod = getModuleBySlug(moduleSlug);
  if (!mod) return [];
  return allConcepts.filter((c) => mod.conceptSlugs.includes(c.slug));
}

export function getConceptBySlug(slug: string): ConceptContent | undefined {
  return loadAllContent().concepts.find((c) => c.slug === slug);
}

export function getStepById(stepId: string): { concept: ConceptContent; step: StepContent } | undefined {
  const allConcepts = loadAllContent().concepts;
  for (const concept of allConcepts) {
    const step = concept.steps.find((s) => s.id === stepId);
    if (step) {
      return { concept, step };
    }
  }
  return undefined;
}
