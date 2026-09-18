import {
  DomainContent,
  DomainContentSchema,
  ModuleContent,
  ModuleContentSchema,
  ConceptContent,
  ConceptContentSchema,
  StepContent,
} from "./schema";

// Raw JSON Imports: Domains
import matematikaDomain from "./data/domains/matematika.json";
import fisikaDomain from "./data/domains/fisika.json";
import kimiaDomain from "./data/domains/kimia.json";
import biologiDomain from "./data/domains/biologi.json";

// Raw JSON Imports: Modules
import fondasiMatematikaModule from "./data/modules/fondasi-matematika.json";
import turunanModule from "./data/modules/turunan.json";
import fisikaMekanikaModule from "./data/modules/fisika-mekanika.json";
import kimiaDasarModule from "./data/modules/kimia-dasar.json";
import biologiDasarModule from "./data/modules/biologi-dasar.json";

// Raw JSON Imports: Matematika Concepts
import perubahanConcept from "./data/concepts/01-perubahan.json";
import lajuPerubahanConcept from "./data/concepts/02-laju-perubahan.json";
import definisiTurunanConcept from "./data/concepts/03-definisi-turunan.json";
import bilanganConcept from "./data/concepts/04-bilangan.json";
import operasiAritmetikaConcept from "./data/concepts/05-operasi-aritmetika.json";
import pecahanDanDesimalConcept from "./data/concepts/06-pecahan-dan-desimal.json";

// Raw JSON Imports: Fisika Concepts
import pengukuranBesaranConcept from "./data/concepts/07-pengukuran-dan-besaran.json";
import vektorConcept from "./data/concepts/08-vektor.json";
import kinematikaConcept from "./data/concepts/09-kinematika.json";

// Raw JSON Imports: Kimia Concepts
import materiSifatConcept from "./data/concepts/10-materi-dan-sifatnya.json";
import unsurSenyawaConcept from "./data/concepts/11-unsur-dan-senyawa.json";
import atomConcept from "./data/concepts/12-atom.json";

// Raw JSON Imports: Biologi Concepts
import karakteristikKehidupanConcept from "./data/concepts/13-karakteristik-kehidupan.json";
import tingkatanOrganisasiConcept from "./data/concepts/14-tingkatan-organisasi-kehidupan.json";

export interface GraphNode {
  id: string;
  slug: string;
  title: string;
  summary: string;
  type: "domain" | "module" | "concept";
  domainSlug: string;
  moduleSlug?: string;
  difficulty?: "introductory" | "standard" | "advanced";
  stepCount?: number;
}

export interface GraphEdge {
  id: string;
  source: string; // source slug or id
  target: string; // target slug or id
  relationship: "contains" | "prerequisite" | "cross_domain";
  label?: string;
}

export interface ConceptGraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export class ContentRegistry {
  private static instance: ContentRegistry | null = null;

  public readonly domains: DomainContent[];
  public readonly modules: ModuleContent[];
  public readonly concepts: ConceptContent[];

  public readonly domainsBySlug = new Map<string, DomainContent>();
  public readonly modulesBySlug = new Map<string, ModuleContent>();
  public readonly conceptsBySlug = new Map<string, ConceptContent>();
  public readonly conceptsById = new Map<string, ConceptContent>();
  public readonly moduleForConcept = new Map<string, ModuleContent>();
  public readonly stepsById = new Map<string, { concept: ConceptContent; step: StepContent }>();

  private constructor() {
    // 1. Parse & Validate Domains
    this.domains = [
      DomainContentSchema.parse(matematikaDomain),
      DomainContentSchema.parse(fisikaDomain),
      DomainContentSchema.parse(kimiaDomain),
      DomainContentSchema.parse(biologiDomain),
    ];

    // 2. Parse & Validate Modules
    this.modules = [
      ModuleContentSchema.parse(fondasiMatematikaModule),
      ModuleContentSchema.parse(turunanModule),
      ModuleContentSchema.parse(fisikaMekanikaModule),
      ModuleContentSchema.parse(kimiaDasarModule),
      ModuleContentSchema.parse(biologiDasarModule),
    ];

    // 3. Parse & Validate Concepts
    this.concepts = [
      // Matematika
      ConceptContentSchema.parse(bilanganConcept),
      ConceptContentSchema.parse(operasiAritmetikaConcept),
      ConceptContentSchema.parse(pecahanDanDesimalConcept),
      ConceptContentSchema.parse(perubahanConcept),
      ConceptContentSchema.parse(lajuPerubahanConcept),
      ConceptContentSchema.parse(definisiTurunanConcept),

      // Fisika
      ConceptContentSchema.parse(pengukuranBesaranConcept),
      ConceptContentSchema.parse(vektorConcept),
      ConceptContentSchema.parse(kinematikaConcept),

      // Kimia
      ConceptContentSchema.parse(materiSifatConcept),
      ConceptContentSchema.parse(unsurSenyawaConcept),
      ConceptContentSchema.parse(atomConcept),

      // Biologi
      ConceptContentSchema.parse(karakteristikKehidupanConcept),
      ConceptContentSchema.parse(tingkatanOrganisasiConcept),
    ];

    // 4. Build Indexes
    for (const d of this.domains) {
      this.domainsBySlug.set(d.slug, d);
    }

    for (const m of this.modules) {
      this.modulesBySlug.set(m.slug, m);
    }

    for (const c of this.concepts) {
      this.conceptsBySlug.set(c.slug, c);
      this.conceptsById.set(c.id, c);

      // Find parent module
      const parentMod = this.modules.find(
        (m) => m.id === c.moduleId || m.conceptSlugs.includes(c.slug)
      );
      if (parentMod) {
        this.moduleForConcept.set(c.slug, parentMod);
        this.moduleForConcept.set(c.id, parentMod);
      }

      // Index steps
      for (const step of c.steps) {
        this.stepsById.set(step.id, { concept: c, step });
      }
    }
  }

  public static getInstance(): ContentRegistry {
    if (!ContentRegistry.instance) {
      ContentRegistry.instance = new ContentRegistry();
    }
    return ContentRegistry.instance;
  }

  public getConceptGraph(): ConceptGraphData {
    const nodes: GraphNode[] = [];
    const edges: GraphEdge[] = [];

    // Add Domain Nodes
    for (const d of this.domains) {
      nodes.push({
        id: d.id,
        slug: d.slug,
        title: d.title,
        summary: d.summary,
        type: "domain",
        domainSlug: d.slug,
      });

      // Domain -> Module edges
      for (const modSlug of d.moduleSlugs) {
        const mod = this.modulesBySlug.get(modSlug);
        if (mod) {
          edges.push({
            id: `edge-${d.slug}-${mod.slug}`,
            source: d.slug,
            target: mod.slug,
            relationship: "contains",
            label: "Memuat Modul",
          });
        }
      }
    }

    // Add Module Nodes
    for (const m of this.modules) {
      nodes.push({
        id: m.id,
        slug: m.slug,
        title: m.title,
        summary: m.summary,
        type: "module",
        domainSlug: m.domainSlug,
        moduleSlug: m.slug,
      });

      // Module -> Concept edges
      for (const cSlug of m.conceptSlugs) {
        const concept = this.conceptsBySlug.get(cSlug);
        if (concept) {
          edges.push({
            id: `edge-${m.slug}-${concept.slug}`,
            source: m.slug,
            target: concept.slug,
            relationship: "contains",
            label: "Bagian Jalur",
          });
        }
      }

      // Module prerequisites
      for (const prereq of m.prerequisites) {
        edges.push({
          id: `edge-prereq-${prereq.slug}-${m.slug}`,
          source: prereq.slug,
          target: m.slug,
          relationship: "prerequisite",
          label: "Prasyarat Modul",
        });
      }
    }

    // Add Concept Nodes
    for (const c of this.concepts) {
      const parentMod = this.moduleForConcept.get(c.slug);
      nodes.push({
        id: c.id,
        slug: c.slug,
        title: c.title,
        summary: c.summary,
        type: "concept",
        domainSlug: parentMod?.domainSlug ?? "matematika",
        moduleSlug: parentMod?.slug,
        difficulty: c.difficulty,
        stepCount: c.steps.length,
      });

      // Concept prerequisites
      for (const prereqSlug of c.prerequisites) {
        edges.push({
          id: `edge-concept-prereq-${prereqSlug}-${c.slug}`,
          source: prereqSlug,
          target: c.slug,
          relationship: "prerequisite",
          label: "Prasyarat",
        });
      }
    }

    // Curated Cross-Domain Edges (Knowledge Mesh connections across disciplines)
    const crossLinks: Array<{ source: string; target: string; label: string }> = [
      {
        source: "laju-perubahan",
        target: "kinematika",
        label: "Aplikasi Gerak & Laju Sesaat (v = ds/dt)",
      },
      {
        source: "definisi-turunan",
        target: "kinematika",
        label: "Diferensial Percepatan (a = dv/dt)",
      },
      {
        source: "vektor",
        target: "operasi-aritmetika",
        label: "Geometri Translasi & Arah",
      },
      {
        source: "pengukuran-dan-besaran",
        target: "materi-dan-sifatnya",
        label: "Massa, Volume, & Densitas (ρ = m/V)",
      },
      {
        source: "atom",
        target: "tingkatan-organisasi-kehidupan",
        label: "Pondasi Molekuler Organisme",
      },
      {
        source: "materi-dan-sifatnya",
        target: "karakteristik-kehidupan",
        label: "Metabolisme Transformasi Materi",
      },
    ];

    for (const link of crossLinks) {
      if (this.conceptsBySlug.has(link.source) && this.conceptsBySlug.has(link.target)) {
        edges.push({
          id: `edge-cross-${link.source}-${link.target}`,
          source: link.source,
          target: link.target,
          relationship: "cross_domain",
          label: link.label,
        });
      }
    }

    return { nodes, edges };
  }
}
