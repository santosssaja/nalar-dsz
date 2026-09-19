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
import rasioDanProporsiConcept from "./data/concepts/15-rasio-dan-proporsi.json";
import persentaseConcept from "./data/concepts/16-persentase.json";
import pangkatDanAkarConcept from "./data/concepts/17-pangkat-dan-akar.json";
import urutanDanPolaConcept from "./data/concepts/18-urutan-dan-pola.json";
import estimasiConcept from "./data/concepts/19-estimasi.json";
import satuanPengukuranConcept from "./data/concepts/20-satuan-dan-pengukuran-matematika.json";

// Raw JSON Imports: Fisika Concepts
import pengukuranBesaranConcept from "./data/concepts/07-pengukuran-dan-besaran.json";
import vektorConcept from "./data/concepts/08-vektor.json";
import kinematikaConcept from "./data/concepts/09-kinematika.json";
import gerakLurusConcept from "./data/concepts/21-gerak-lurus.json";
import gerakParabolaConcept from "./data/concepts/22-gerak-parabola.json";
import gerakMelingkarConcept from "./data/concepts/23-gerak-melingkar.json";
import hukumNewtonConcept from "./data/concepts/24-hukum-newton.json";
import gayaConcept from "./data/concepts/25-gaya.json";
import gesekanConcept from "./data/concepts/26-gesekan.json";
import usahaDanEnergiConcept from "./data/concepts/27-usaha-dan-energi.json";
import momentumDanImpulsConcept from "./data/concepts/28-momentum-dan-impuls.json";
import tumbukanConcept from "./data/concepts/29-tumbukan.json";
import rotasiConcept from "./data/concepts/30-rotasi.json";
import torsiConcept from "./data/concepts/31-torsi.json";
import momentumSudutConcept from "./data/concepts/32-momentum-sudut.json";
import gravitasiConcept from "./data/concepts/33-gravitasi.json";
import kesetimbanganConcept from "./data/concepts/34-kesetimbangan.json";
import osilasiConcept from "./data/concepts/35-osilasi.json";

// Raw JSON Imports: Kimia Concepts
import materiSifatConcept from "./data/concepts/10-materi-dan-sifatnya.json";
import unsurSenyawaConcept from "./data/concepts/11-unsur-dan-senyawa.json";
import atomConcept from "./data/concepts/12-atom.json";
import molekulConcept from "./data/concepts/36-molekul.json";
import ionConcept from "./data/concepts/37-ion.json";
import sistemPeriodikConcept from "./data/concepts/38-sistem-periodik.json";
import konfigurasiElektronConcept from "./data/concepts/39-konfigurasi-elektron.json";
import bilanganKuantumConcept from "./data/concepts/40-bilangan-kuantum.json";
import ikatanKimiaConcept from "./data/concepts/41-ikatan-kimia.json";
import strukturLewisConcept from "./data/concepts/42-struktur-lewis.json";
import geometriMolekulConcept from "./data/concepts/43-geometri-molekul.json";

// Raw JSON Imports: Biologi Concepts
import karakteristikKehidupanConcept from "./data/concepts/13-karakteristik-kehidupan.json";
import tingkatanOrganisasiConcept from "./data/concepts/14-tingkatan-organisasi-kehidupan.json";
import metodeIlmiahConcept from "./data/concepts/44-metode-ilmiah.json";
import selConcept from "./data/concepts/45-sel.json";
import molekulBiologisConcept from "./data/concepts/46-molekul-biologis.json";
import energiBiologisConcept from "./data/concepts/47-energi-dalam-sistem-biologis.json";

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
      // Matematika - Fondasi
      ConceptContentSchema.parse(bilanganConcept),
      ConceptContentSchema.parse(operasiAritmetikaConcept),
      ConceptContentSchema.parse(pecahanDanDesimalConcept),
      ConceptContentSchema.parse(rasioDanProporsiConcept),
      ConceptContentSchema.parse(persentaseConcept),
      ConceptContentSchema.parse(pangkatDanAkarConcept),
      ConceptContentSchema.parse(urutanDanPolaConcept),
      ConceptContentSchema.parse(estimasiConcept),
      ConceptContentSchema.parse(satuanPengukuranConcept),

      // Matematika - Turunan
      ConceptContentSchema.parse(perubahanConcept),
      ConceptContentSchema.parse(lajuPerubahanConcept),
      ConceptContentSchema.parse(definisiTurunanConcept),

      // Fisika - Mekanika
      ConceptContentSchema.parse(pengukuranBesaranConcept),
      ConceptContentSchema.parse(vektorConcept),
      ConceptContentSchema.parse(kinematikaConcept),
      ConceptContentSchema.parse(gerakLurusConcept),
      ConceptContentSchema.parse(gerakParabolaConcept),
      ConceptContentSchema.parse(gerakMelingkarConcept),
      ConceptContentSchema.parse(hukumNewtonConcept),
      ConceptContentSchema.parse(gayaConcept),
      ConceptContentSchema.parse(gesekanConcept),
      ConceptContentSchema.parse(usahaDanEnergiConcept),
      ConceptContentSchema.parse(momentumDanImpulsConcept),
      ConceptContentSchema.parse(tumbukanConcept),
      ConceptContentSchema.parse(rotasiConcept),
      ConceptContentSchema.parse(torsiConcept),
      ConceptContentSchema.parse(momentumSudutConcept),
      ConceptContentSchema.parse(gravitasiConcept),
      ConceptContentSchema.parse(kesetimbanganConcept),
      ConceptContentSchema.parse(osilasiConcept),

      // Kimia - Dasar
      ConceptContentSchema.parse(materiSifatConcept),
      ConceptContentSchema.parse(unsurSenyawaConcept),
      ConceptContentSchema.parse(atomConcept),
      ConceptContentSchema.parse(molekulConcept),
      ConceptContentSchema.parse(ionConcept),
      ConceptContentSchema.parse(sistemPeriodikConcept),
      ConceptContentSchema.parse(konfigurasiElektronConcept),
      ConceptContentSchema.parse(bilanganKuantumConcept),
      ConceptContentSchema.parse(ikatanKimiaConcept),
      ConceptContentSchema.parse(strukturLewisConcept),
      ConceptContentSchema.parse(geometriMolekulConcept),

      // Biologi - Dasar
      ConceptContentSchema.parse(karakteristikKehidupanConcept),
      ConceptContentSchema.parse(tingkatanOrganisasiConcept),
      ConceptContentSchema.parse(metodeIlmiahConcept),
      ConceptContentSchema.parse(selConcept),
      ConceptContentSchema.parse(molekulBiologisConcept),
      ConceptContentSchema.parse(energiBiologisConcept),
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
        source: "definisi-turunan",
        target: "osilasi",
        label: "Persamaan Diferensial Harmonik (d²x/dt² = -ω²x)",
      },
      {
        source: "vektor",
        target: "operasi-aritmetika",
        label: "Geometri Translasi & Arah",
      },
      {
        source: "pangkat-dan-akar",
        target: "gravitasi",
        label: "Hukum Kuadrat Terbalik (1/r²)",
      },
      {
        source: "rasio-dan-proporsi",
        target: "sistem-periodik",
        label: "Rasio Stoikiometrik & Massa Relatif",
      },
      {
        source: "satuan-dan-pengukuran-matematika",
        target: "pengukuran-dan-besaran",
        label: "Standar Dimensi Satuan SI",
      },
      {
        source: "pengukuran-dan-besaran",
        target: "materi-dan-sifatnya",
        label: "Massa, Volume, & Densitas (ρ = m/V)",
      },
      {
        source: "atom",
        target: "tingkatan-organisasi-kehidupan",
        label: "Fondasi Molekuler Organisme",
      },
      {
        source: "molekul",
        target: "molekul-biologis",
        label: "Struktur Karbon Makromolekul",
      },
      {
        source: "ikatan-kimia",
        target: "karakteristik-kehidupan",
        label: "Energi Kovalen Ikatan Biologis",
      },
      {
        source: "usaha-dan-energi",
        target: "energi-dalam-sistem-biologis",
        label: "Termodinamika Daur Energi Seluler",
      },
      {
        source: "metode-ilmiah",
        target: "pengukuran-dan-besaran",
        label: "Metodologi Pengukuran Empiris",
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
