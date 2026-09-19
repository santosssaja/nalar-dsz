import { describe, it, expect } from "vitest";
import { LAB_STATIONS } from "@/features/lab/data/lab-stations";

describe("Nalar Lab Stations", () => {
  it("should contain exactly 14 multidisciplinary STEM stations", () => {
    expect(LAB_STATIONS).toHaveLength(14);
  });

  it("should start with Fondasi Matematika: Garis Bilangan as the top-left default station", () => {
    const firstStation = LAB_STATIONS[0];
    expect(firstStation.id).toBe("number-line");
    expect(firstStation.title).toBe("Garis Bilangan Interaktif");
    expect(firstStation.domainSlug).toBe("matematika");
    expect(firstStation.moduleSlug).toBe("fondasi-matematika");
  });

  it("should ensure every station has unique IDs and required metadata", () => {
    const ids = new Set<string>();
    for (const station of LAB_STATIONS) {
      expect(ids.has(station.id)).toBe(false);
      ids.add(station.id);

      expect(station.title).toBeTruthy();
      expect(station.domain).toBeTruthy();
      expect(station.domainSlug).toMatch(/^(matematika|fisika|kimia|biologi)$/);
      expect(station.description.length).toBeGreaterThan(15);
      expect(station.moduleSlug).toBeTruthy();
      expect(station.moduleTitle).toBeTruthy();
      expect(station.icon).toBeDefined();
    }
  });

  it("should cover all four core STEM domains in logical sequence", () => {
    const domains = LAB_STATIONS.map((s) => s.domainSlug);
    expect(domains).toContain("matematika");
    expect(domains).toContain("fisika");
    expect(domains).toContain("kimia");
    expect(domains).toContain("biologi");

    // Math comes first
    expect(domains[0]).toBe("matematika");
  });
});
