"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, Layers } from "lucide-react";
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
  // Default to the first station in LAB_STATIONS (top-left on grid: number-line)
  const defaultStationId = LAB_STATIONS[0].id;
  const [activeStationId, setActiveStationId] = useState<LabStationId>(
    initialStationId && PLAYGROUND_COMPONENTS[initialStationId]
      ? initialStationId
      : defaultStationId
  );

  const currentStation =
    LAB_STATIONS.find((s) => s.id === activeStationId) ?? LAB_STATIONS[0];

  const ActivePlaygroundComponent =
    PLAYGROUND_COMPONENTS[activeStationId] ?? PLAYGROUND_COMPONENTS[defaultStationId];

  return (
    <div className="space-y-6">
      {/* Station Navigation Selector Grid */}
      <section aria-label="Pilihan Stasiun Laboratorium" className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-accent" />
            <span>Pilih Stasiun Eksperimen:</span>
          </span>
          <span className="text-xs text-text-muted font-mono">
            {LAB_STATIONS.findIndex((s) => s.id === activeStationId) + 1} / {LAB_STATIONS.length}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2.5">
          {LAB_STATIONS.map((station) => {
            const isActive = station.id === activeStationId;
            const Icon = station.icon;
            return (
              <button
                key={station.id}
                type="button"
                aria-pressed={isActive}
                onClick={() => setActiveStationId(station.id)}
                className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between gap-2.5 group ${
                  isActive
                    ? "bg-accent-muted/40 border-accent shadow-xs ring-1 ring-accent/40"
                    : "bg-surface-raised border-border hover:bg-surface hover:border-border-strong"
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span
                    className={`p-1.5 rounded-lg ${
                      isActive ? "bg-accent/20 text-accent" : "bg-surface text-text-muted"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </span>
                  <span
                    className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full border ${station.badgeColor}`}
                  >
                    {station.domainSlug}
                  </span>
                </div>

                <div>
                  <h3
                    className={`text-xs font-bold leading-snug ${
                      isActive ? "text-text" : "text-text-muted group-hover:text-text"
                    }`}
                  >
                    {station.title}
                  </h3>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Station Overview & Link to Module */}
      <section
        aria-label="Ringkasan Stasiun Aktif"
        className="p-4 rounded-xl bg-surface-raised border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3"
      >
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-text">{currentStation.title}</span>
            <span className="text-xs text-text-muted">•</span>
            <span className="text-xs text-accent font-semibold">{currentStation.domain}</span>
          </div>
          <p className="text-xs text-text-muted max-w-2xl leading-relaxed">
            {currentStation.description}
          </p>
        </div>

        <Link
          href={`/modules/${currentStation.moduleSlug}`}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-surface border border-border hover:border-accent text-text hover:bg-surface-raised transition-all shrink-0 shadow-2xs self-start sm:self-auto"
        >
          <span>Buka {currentStation.moduleTitle}</span>
          <ArrowRight className="w-3.5 h-3.5 text-accent" />
        </Link>
      </section>

      {/* Active Station Interactive Content */}
      <section aria-label={`Eksperimen ${currentStation.title}`} className="pt-2">
        <ActivePlaygroundComponent />
      </section>
    </div>
  );
}
