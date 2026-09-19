"use client";

import React from "react";
import { StepContent } from "@/content/schema";
import { MathRenderer } from "@/components/ui/katex-math";
import { NumberLinePlayground } from "./playgrounds/number-line-playground";
import { FractionRatioPlayground } from "./playgrounds/fraction-ratio-playground";
import { PatternExponentPlayground } from "./playgrounds/pattern-exponent-playground";
import { VectorPlayground } from "./playgrounds/vector-playground";
import { ProjectileMotionPlayground } from "./playgrounds/projectile-motion-playground";
import { NewtonDynamicsPlayground } from "./playgrounds/newton-dynamics-playground";
import { HarmonicOscillationPlayground } from "./playgrounds/harmonic-oscillation-playground";
import { MatterPlayground } from "./playgrounds/matter-playground";
import { PeriodicTableAtomPlayground } from "./playgrounds/periodic-table-atom-playground";
import { ChemicalBondingPlayground } from "./playgrounds/chemical-bonding-playground";
import { BiologicalScalePlayground } from "./playgrounds/biological-scale-playground";
import { CellStructurePlayground } from "./playgrounds/cell-structure-playground";
import { BiologicalEnergyPlayground } from "./playgrounds/biological-energy-playground";
import { CalculusPlayground } from "./playgrounds/calculus-playground";

interface StepExploreProps {
  step: StepContent;
  conceptSlug?: string;
  isCompleted: boolean;
  onCompleted: () => void;
  onPrevious?: () => void;
}

export function StepExplore({
  step,
  conceptSlug = "",
  isCompleted,
  onCompleted,
  onPrevious,
}: StepExploreProps) {
  // Dynamically choose interactive playground
  const renderPlayground = () => {
    const slug = conceptSlug.toLowerCase();

    // 1. Fondasi Matematika Playgrounds
    if (slug.includes("rasio") || slug.includes("proporsi") || slug.includes("persentase") || slug.includes("pecahan")) {
      return <FractionRatioPlayground />;
    }
    if (slug.includes("pangkat") || slug.includes("akar") || slug.includes("pola") || slug.includes("urutan") || slug.includes("estimasi")) {
      return <PatternExponentPlayground />;
    }
    if (slug.includes("bilangan") || slug.includes("operasi") || slug.includes("satuan-dan-pengukuran-matematika")) {
      return <NumberLinePlayground />;
    }

    // 2. Fisika Mekanika Playgrounds
    if (slug.includes("parabola") || slug.includes("gerak-lurus") || slug.includes("gerak-melingkar") || slug.includes("kinematika")) {
      return <ProjectileMotionPlayground />;
    }
    if (slug.includes("newton") || slug.includes("gaya") || slug.includes("gesekan") || slug.includes("usaha") || slug.includes("momentum") || slug.includes("tumbukan") || slug.includes("kesetimbangan")) {
      return <NewtonDynamicsPlayground />;
    }
    if (slug.includes("osilasi") || slug.includes("rotasi") || slug.includes("torsi") || slug.includes("gravitasi")) {
      return <HarmonicOscillationPlayground />;
    }
    if (slug.includes("vektor") || slug.includes("pengukuran")) {
      return <VectorPlayground />;
    }

    // 3. Dasar Kimia Playgrounds
    if (slug.includes("periodik") || slug.includes("konfigurasi") || slug.includes("kuantum") || slug.includes("atom")) {
      return <PeriodicTableAtomPlayground />;
    }
    if (slug.includes("ikatan") || slug.includes("lewis") || slug.includes("geometri") || slug.includes("molekul") || slug.includes("ion")) {
      return <ChemicalBondingPlayground />;
    }
    if (slug.includes("materi") || slug.includes("unsur")) {
      return <MatterPlayground />;
    }

    // 4. Dasar Biologi Playgrounds
    if (slug.includes("sel") || slug.includes("metode-ilmiah")) {
      return <CellStructurePlayground />;
    }
    if (slug.includes("energi-dalam-sistem-biologis") || slug.includes("molekul-biologis")) {
      return <BiologicalEnergyPlayground />;
    }
    if (slug.includes("karakteristik") || slug.includes("organisasi") || slug.includes("biologi")) {
      return <BiologicalScalePlayground />;
    }

    // Default to Calculus Secant/Tangent
    return <CalculusPlayground />;
  };

  return (
    <div className="p-4 sm:p-5 rounded-xl bg-surface-raised border border-border space-y-4 shadow-sm">
      <div>
        <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-accent-muted text-accent mb-1.5">
          <span>Interactive Playground</span>
          <span>•</span>
          <span>Manipulasi Parameter</span>
        </div>
        <h3 className="text-lg sm:text-xl font-bold text-text">{step.title}</h3>
        <MathRenderer
          content={step.instruction}
          inline
          as="p"
          className="text-xs sm:text-sm text-text-muted mt-0.5"
        />
      </div>

      <div className="text-sm text-text leading-relaxed">
        <MathRenderer content={step.content} />
      </div>

      {/* Domain-specific interactive playground */}
      {renderPlayground()}

      {/* Navigation */}
      <div className="pt-2 flex items-center justify-between gap-3">
        {onPrevious ? (
          <button
            type="button"
            onClick={onPrevious}
            className="px-4 py-2 rounded-lg text-xs font-medium border border-border hover:bg-surface text-text transition-colors"
          >
            ← Langkah Sebelumnya
          </button>
        ) : (
          <div />
        )}
        <button
          type="button"
          onClick={onCompleted}
          className="px-6 py-2.5 rounded-lg text-sm font-semibold bg-accent text-surface-raised hover:bg-accent-hover transition-colors shadow-sm"
        >
          {isCompleted ? "Lanjut ke Langkah Berikutnya →" : "Saya Telah Bereksplorasi, Lanjutkan →"}
        </button>
      </div>
    </div>
  );
}
