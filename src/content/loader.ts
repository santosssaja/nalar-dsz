import {
  DomainContent,
  ModuleContent,
  ConceptContent,
  StepContent,
} from "./schema";
import { ContentRegistry, ConceptGraphData } from "./registry";

export function getDomains(): DomainContent[] {
  return ContentRegistry.getInstance().domains;
}

export function getDomainBySlug(slug: string): DomainContent | undefined {
  return ContentRegistry.getInstance().domainsBySlug.get(slug);
}

export function getModules(domainSlug?: string): ModuleContent[] {
  const allModules = ContentRegistry.getInstance().modules;
  if (!domainSlug) return allModules;
  return allModules.filter((m) => m.domainSlug === domainSlug);
}

export function getModuleBySlug(slug: string): ModuleContent | undefined {
  return ContentRegistry.getInstance().modulesBySlug.get(slug);
}

export function getConcepts(moduleSlug?: string): ConceptContent[] {
  const allConcepts = ContentRegistry.getInstance().concepts;
  if (!moduleSlug) return allConcepts;
  const mod = getModuleBySlug(moduleSlug);
  if (!mod) return [];
  return allConcepts.filter((c) => mod.conceptSlugs.includes(c.slug));
}

export function getConceptBySlug(slug: string): ConceptContent | undefined {
  return ContentRegistry.getInstance().conceptsBySlug.get(slug);
}

export function getConceptById(id: string): ConceptContent | undefined {
  return ContentRegistry.getInstance().conceptsById.get(id);
}

export function getStepById(
  stepId: string
): { concept: ConceptContent; step: StepContent } | undefined {
  return ContentRegistry.getInstance().stepsById.get(stepId);
}

export function getModuleForConcept(
  conceptSlugOrId: string
): ModuleContent | undefined {
  return ContentRegistry.getInstance().moduleForConcept.get(conceptSlugOrId);
}

export function getConceptGraph(): ConceptGraphData {
  return ContentRegistry.getInstance().getConceptGraph();
}
