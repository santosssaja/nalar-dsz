"use client";

import React from "react";
import { StepContent } from "@/content/schema";
import { MathRenderer } from "@/components/ui/katex-math";
import { NumberLinePlayground } from "./playgrounds/number-line-playground";
import { VectorPlayground } from "./playgrounds/vector-playground";
import { MatterPlayground } from "./playgrounds/matter-playground";
import { BiologicalScalePlayground } from "./playgrounds/biological-scale-playground";
import { CalculusPlayground } from "./playgrounds/calculus-playground";

interface StepExploreProps {
  step: StepContent;
  conceptSlug?: string;
  isCompleted: boolean;
  onCompleted: () => void;
}

export function StepExplore({
  step,
  conceptSlug = "",
  isCompleted,
  onCompleted,
}: StepExploreProps) {
  // Dynamically choose interactive playground
  const renderPlayground = () => {
    const slug = conceptSlug.toLowerCase();

    if (
      slug.includes("bilangan") ||
      slug.includes("operasi") ||
      slug.includes("pecahan")
    ) {
      return <NumberLinePlayground />;
    }

    if (
      slug.includes("vektor") ||
      slug.includes("kinematika") ||
      slug.includes("pengukuran")
    ) {
      return <VectorPlayground />;
    }

    if (
      slug.includes("materi") ||
      slug.includes("unsur") ||
      slug.includes("atom")
    ) {
      return <MatterPlayground />;
    }

    if (
      slug.includes("karakteristik") ||
      slug.includes("organisasi") ||
      slug.includes("biologi")
    ) {
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
      <div className="pt-2 flex justify-end">
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
