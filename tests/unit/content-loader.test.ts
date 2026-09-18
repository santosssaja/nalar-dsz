import { describe, it, expect } from "vitest";
import {
  getDomains,
  getModules,
  getModuleBySlug,
  getConcepts,
  getConceptBySlug,
  getStepById,
  getConceptGraph,
} from "@/content/loader";

describe("Curated Content Loader", () => {
  it("should load Matematika domain successfully", () => {
    const domains = getDomains();
    expect(domains.length).toBeGreaterThanOrEqual(1);

    const mat = domains.find((d) => d.slug === "matematika");
    expect(mat).toBeDefined();
    expect(mat?.title).toBe("Matematika");
    expect(mat?.moduleSlugs).toContain("turunan");
  });

  it("should load Turunan module with learning path", () => {
    const mod = getModuleBySlug("turunan");
    expect(mod).toBeDefined();
    expect(mod?.title).toContain("Turunan");
    expect(mod?.conceptSlugs.length).toBe(3);
    expect(mod?.learningPath.nodes.length).toBe(3);
  });

  it("should load 3 curated concepts for Turunan", () => {
    const concepts = getConcepts("turunan");
    expect(concepts.length).toBe(3);

    const slugs = concepts.map((c) => c.slug);
    expect(slugs).toEqual(["perubahan", "laju-perubahan", "definisi-turunan"]);
  });

  it("should validate concept 03-definisi-turunan steps and hints", () => {
    const concept = getConceptBySlug("definisi-turunan");
    expect(concept).toBeDefined();
    expect(concept?.steps.length).toBe(6);

    const kinds = concept?.steps.map((s) => s.kind);
    expect(kinds).toContain("encounter");
    expect(kinds).toContain("explore");
    expect(kinds).toContain("predict");
    expect(kinds).toContain("understand");
    expect(kinds).toContain("practice");
    expect(kinds).toContain("explain");

    // Check predict step has hints
    const predictStep = concept?.steps.find((s) => s.kind === "predict");
    expect(predictStep?.hints?.solution).toBeDefined();
  });

  it("should retrieve step by ID", () => {
    const stepInfo = getStepById("40000000-0000-4000-8000-000000000010");
    expect(stepInfo).toBeDefined();
    expect(stepInfo?.step.kind).toBe("predict");
    expect(stepInfo?.concept.slug).toBe("definisi-turunan");
  });

  it("should load Fondasi Matematika module and its 3 concepts", () => {
    const mod = getModuleBySlug("fondasi-matematika");
    expect(mod).toBeDefined();
    expect(mod?.title).toContain("Fondasi Matematika");
    expect(mod?.conceptSlugs).toEqual(["bilangan", "operasi-aritmetika", "pecahan-dan-desimal"]);
    expect(mod?.learningPath.nodes.length).toBe(3);

    const concepts = getConcepts("fondasi-matematika");
    expect(concepts.length).toBe(3);
    const slugs = concepts.map((c) => c.slug);
    expect(slugs).toEqual(["bilangan", "operasi-aritmetika", "pecahan-dan-desimal"]);
  });

  it("should validate concept bilangan steps, misconceptions, and evaluation", () => {
    const concept = getConceptBySlug("bilangan");
    expect(concept).toBeDefined();
    expect(concept?.steps.length).toBe(6);

    const kinds = concept?.steps.map((s) => s.kind);
    expect(kinds).toContain("encounter");
    expect(kinds).toContain("explore");
    expect(kinds).toContain("predict");
    expect(kinds).toContain("understand");
    expect(kinds).toContain("practice");
    expect(kinds).toContain("explain");

    expect(concept?.misconceptions.length).toBeGreaterThanOrEqual(3);
    expect(concept?.rubric?.criteria.length).toBe(3);

    // Test practice step numeric evaluation
    const practiceStep = concept?.steps.find((s) => s.kind === "practice");
    expect(practiceStep?.evaluation?.type).toBe("numeric");
  });

  it("should validate concept operasi-aritmetika and pecahan-dan-desimal", () => {
    const operasi = getConceptBySlug("operasi-aritmetika");
    expect(operasi).toBeDefined();
    expect(operasi?.steps.length).toBe(5);
    expect(operasi?.prerequisites).toContain("bilangan");

    const pecahan = getConceptBySlug("pecahan-dan-desimal");
    expect(pecahan).toBeDefined();
    expect(pecahan?.steps.length).toBe(5);
    expect(pecahan?.prerequisites).toContain("bilangan");
    expect(pecahan?.prerequisites).toContain("operasi-aritmetika");
  });

  it("should load all 4 STEM domains: Matematika, Fisika, Kimia, and Biologi", () => {
    const domains = getDomains();
    expect(domains.length).toBe(4);
    const domainSlugs = domains.map((d) => d.slug);
    expect(domainSlugs).toContain("matematika");
    expect(domainSlugs).toContain("fisika");
    expect(domainSlugs).toContain("kimia");
    expect(domainSlugs).toContain("biologi");
  });

  it("should load all 5 modules across domains", () => {
    const allModules = getModules();
    expect(allModules.length).toBe(5);
    const moduleSlugs = allModules.map((m) => m.slug);
    expect(moduleSlugs).toContain("fondasi-matematika");
    expect(moduleSlugs).toContain("turunan");
    expect(moduleSlugs).toContain("fisika-mekanika");
    expect(moduleSlugs).toContain("kimia-dasar");
    expect(moduleSlugs).toContain("biologi-dasar");

    const fisikaModules = getModules("fisika");
    expect(fisikaModules.length).toBe(1);
    expect(fisikaModules[0].slug).toBe("fisika-mekanika");
  });

  it("should validate Fisika Mekanika concepts (Pengukuran, Vektor, Kinematika)", () => {
    const concepts = getConcepts("fisika-mekanika");
    expect(concepts.length).toBe(3);
    const slugs = concepts.map((c) => c.slug);
    expect(slugs).toEqual(["pengukuran-dan-besaran", "vektor", "kinematika"]);

    const vektor = getConceptBySlug("vektor");
    expect(vektor).toBeDefined();
    expect(vektor?.steps.length).toBeGreaterThanOrEqual(4);
    expect(vektor?.prerequisites).toContain("pengukuran-dan-besaran");

    const kinematika = getConceptBySlug("kinematika");
    expect(kinematika).toBeDefined();
    expect(kinematika?.steps.length).toBeGreaterThanOrEqual(5);
    expect(kinematika?.prerequisites).toContain("vektor");
  });

  it("should validate Kimia Dasar concepts (Materi dan Sifatnya, Unsur dan Senyawa, Atom)", () => {
    const concepts = getConcepts("kimia-dasar");
    expect(concepts.length).toBe(3);
    const slugs = concepts.map((c) => c.slug);
    expect(slugs).toEqual(["materi-dan-sifatnya", "unsur-dan-senyawa", "atom"]);

    const atom = getConceptBySlug("atom");
    expect(atom).toBeDefined();
    expect(atom?.steps.length).toBeGreaterThanOrEqual(5);
    expect(atom?.prerequisites).toContain("unsur-dan-senyawa");
    expect(atom?.misconceptions.length).toBeGreaterThanOrEqual(2);
  });

  it("should validate Biologi Dasar concepts (Karakteristik Kehidupan, Tingkatan Organisasi)", () => {
    const concepts = getConcepts("biologi-dasar");
    expect(concepts.length).toBe(2);
    const slugs = concepts.map((c) => c.slug);
    expect(slugs).toEqual(["karakteristik-kehidupan", "tingkatan-organisasi-kehidupan"]);

    const tingkatan = getConceptBySlug("tingkatan-organisasi-kehidupan");
    expect(tingkatan).toBeDefined();
    expect(tingkatan?.steps.length).toBeGreaterThanOrEqual(5);
    expect(tingkatan?.prerequisites).toContain("karakteristik-kehidupan");
  });

  it("should construct a connected Concept Graph with cross-domain links", () => {
    const graph = getConceptGraph();
    expect(graph.nodes.length).toBeGreaterThanOrEqual(20); // 4 domains + 5 modules + 14 concepts
    expect(graph.edges.length).toBeGreaterThan(15);

    // Cross-domain edges should connect concepts across disciplines
    const crossEdges = graph.edges.filter((e) => e.relationship === "cross_domain");
    expect(crossEdges.length).toBeGreaterThanOrEqual(4);

    const kinLink = crossEdges.find((e) => e.target === "kinematika");
    expect(kinLink).toBeDefined();
  });
});
