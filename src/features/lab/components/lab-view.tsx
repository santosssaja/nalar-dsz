"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import { LAB_STATIONS } from "../data/lab-stations";
import type { LabStationId } from "../types";

// Playgrounds
import { NumberLinePlayground } from "@/features/learning/components/playgrounds/number-line-playground";
import { FractionRatioPlayground } from "@/features/learning/components/playgrounds/fraction-ratio-playground";
import { PatternExponentPlayground } from "@/features/learning/components/playgrounds/pattern-exponent-playground";
import { CalculusLabPlayground } from "@/features/learning/components/playgrounds/calculus-lab-playground";
import { VectorPlayground } from "@/features/learning/components/playgrounds/vector-playground";
import { ProjectileMotionPlayground } from "@/features/learning/components/playgrounds/projectile-motion-playground";
import { NewtonDynamicsPlayground } from "@/features/learning/components/playgrounds/newton-dynamics-playground";
import { HarmonicOscillationPlayground } from "@/features/learning/components/playgrounds/harmonic-oscillation-playground";
import { PeriodicTableAtomPlayground } from "@/features/learning/components/playgrounds/periodic-table-atom-playground";
import { ChemicalBondingPlayground } from "@/features/learning/components/playgrounds/chemical-bonding-playground";
import { MatterPlayground } from "@/features/learning/components/playgrounds/matter-playground";
import { BiologicalScalePlayground } from "@/features/learning/components/playgrounds/biological-scale-playground";
import { CellStructurePlayground } from "@/features/learning/components/playgrounds/cell-structure-playground";
import { BiologicalEnergyPlayground } from "@/features/learning/components/playgrounds/biological-energy-playground";

const PLAYGROUND_COMPONENTS: Record<LabStationId, React.ComponentType> = {
  "number-line": NumberLinePlayground,
  "fraction-ratio": FractionRatioPlayground,
  "pattern-exponent": PatternExponentPlayground,
  "calculus": CalculusLabPlayground,
  vector: VectorPlayground,
  projectile: ProjectileMotionPlayground,
  "newton-dynamics": NewtonDynamicsPlayground,
  oscillation: HarmonicOscillationPlayground,
  "periodic-atom": PeriodicTableAtomPlayground,
  "chemical-bonding": ChemicalBondingPlayground,
  matter: MatterPlayground,
  biology: BiologicalScalePlayground,
  "cell-structure": CellStructurePlayground,
  "biological-energy": BiologicalEnergyPlayground,
};

interface LabViewProps {
  initialStationId?: LabStationId;
}

export function LabView({ initialStationId }: LabViewProps) {
  const defaultStationId = LAB_STATIONS[0].id;
  const [activeStationId, setActiveStationId] = useState<LabStationId>(
    initialStationId && PLAYGROUND_COMPONENTS[initialStationId]
      ? initialStationId
      : defaultStationId
  );

  const currentStation =
    LAB_STATIONS.find((s) => s.id === activeStationId) ?? LAB_STATIONS[0];

  const CurrentIcon = currentStation.icon;

  const ActivePlaygroundComponent =
    PLAYGROUND_COMPONENTS[activeStationId] ?? PLAYGROUND_COMPONENTS[defaultStationId];

  const currentIndex = LAB_STATIONS.findIndex((s) => s.id === activeStationId);

  const handlePrev = () => {
    if (currentIndex > 0) {
      setActiveStationId(LAB_STATIONS[currentIndex - 1].id);
    }
  };

  const handleNext = () => {
    if (currentIndex < LAB_STATIONS.length - 1) {
      setActiveStationId(LAB_STATIONS[currentIndex + 1].id);
    }
  };

  return (
    <div className="space-y-4">
      {/* Unified Single-Row Station Control Bar */}
      <section
        aria-label="Navigasi Stasiun Laboratorium"
        className="p-3 sm:p-3.5 rounded-2xl bg-surface-raised border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
      >
        {/* Left: Station Icon + Dropdown Select + Domain Badge */}
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <span className="p-2 rounded-xl bg-accent-muted text-accent shrink-0">
            <CurrentIcon className="w-5 h-5" />
          </span>

          <div className="relative flex-1 sm:max-w-md">
            <label htmlFor="lab-station-select" className="sr-only">
              Pilih Stasiun Eksperimen
            </label>
            <select
              id="lab-station-select"
              value={activeStationId}
              onChange={(e) => setActiveStationId(e.target.value as LabStationId)}
              className="w-full appearance-none bg-surface border border-border rounded-xl pl-3 pr-8 py-2 text-xs sm:text-sm font-semibold text-text cursor-pointer hover:border-accent focus:outline-none focus:ring-2 focus:ring-accent shadow-2xs transition-colors"
            >
              <optgroup label="Fondasi Matematika &amp; Kalkulus">
                {LAB_STATIONS.filter((s) => s.domainSlug === "matematika").map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Fisika Mekanika">
                {LAB_STATIONS.filter((s) => s.domainSlug === "fisika").map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Kimia Dasar">
                {LAB_STATIONS.filter((s) => s.domainSlug === "kimia").map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Biologi Dasar">
                {LAB_STATIONS.filter((s) => s.domainSlug === "biologi").map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title}
                  </option>
                ))}
              </optgroup>
            </select>
            <ChevronDown className="w-4 h-4 text-text-muted absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <span
            className={`hidden md:inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-lg border shrink-0 ${currentStation.badgeColor}`}
          >
            {currentStation.domain}
          </span>
        </div>

        {/* Right: Sequential Prev/Next Buttons + Module Link */}
        <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0">
          <div className="flex items-center gap-1 border border-border rounded-xl p-1 bg-surface">
            <button
              type="button"
              onClick={handlePrev}
              disabled={currentIndex <= 0}
              className="p-1.5 rounded-lg hover:bg-surface-raised text-text disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
              title="Stasiun Sebelumnya"
              aria-label="Stasiun Sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-mono text-text-muted text-xs px-2 whitespace-nowrap select-none">
              {currentIndex + 1} / {LAB_STATIONS.length}
            </span>
            <button
              type="button"
              onClick={handleNext}
              disabled={currentIndex >= LAB_STATIONS.length - 1}
              className="p-1.5 rounded-lg hover:bg-surface-raised text-text disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
              title="Stasiun Berikutnya"
              aria-label="Stasiun Berikutnya"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <Link
            href={`/modules/${currentStation.moduleSlug}`}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-surface border border-border hover:border-accent text-text hover:bg-surface-raised transition-all shrink-0 shadow-2xs"
            title={`Pelajari konsep teori di ${currentStation.moduleTitle}`}
          >
            <span className="hidden sm:inline">Buka Modul</span>
            <span className="sm:hidden">Modul</span>
            <ArrowRight className="w-3.5 h-3.5 text-accent" />
          </Link>
        </div>
      </section>

      {/* Brief Station Description Banner */}
      <section
        aria-label="Penjelasan Eksperimen"
        className="px-4 py-3 rounded-xl bg-surface border border-border text-xs text-text-muted flex items-start sm:items-center justify-between gap-2 shadow-2xs"
      >
        <p className="leading-relaxed">
          <strong className="text-text font-semibold">{currentStation.title}:</strong>{" "}
          {currentStation.description}
        </p>
      </section>

      {/* Active Station Interactive Simulation */}
      <section aria-label={`Eksperimen ${currentStation.title}`} className="pt-1">
        <ActivePlaygroundComponent />
      </section>
    </div>
  );
}
