import React from "react";
import { getConceptGraph } from "@/content/loader";
import { ConceptGraphView } from "@/features/concept-graph/components/concept-graph-canvas";

export const metadata = {
  title: "Peta Graf Konsep STEM | Nalar",
  description: "Visualisasi jaringan 2D hubungan antarkonsep dan ketergantungan lintas disiplin ilmu Nalar.",
};

export default function ConceptGraphPage() {
  const graphData = getConceptGraph();

  return (
    <div className="space-y-6 py-4 max-w-6xl mx-auto">
      <div>
        <span className="text-xs font-semibold text-accent uppercase tracking-wider">
          Peta Pengetahuan Holistik
        </span>
        <h1 className="text-3xl font-bold text-text mt-1">Concept Graph STEM</h1>
        <p className="text-sm text-text-muted mt-2 max-w-3xl leading-relaxed">
          Eksplorasi keterhubungan antarkonsep di seluruh semesta STEM Nalar. Klik pada lingkaran konsep untuk melihat ringkasan, prasyarat, dan melompat langsung ke langkah pembelajarannya.
        </p>
      </div>

      <ConceptGraphView graphData={graphData} />
    </div>
  );
}
