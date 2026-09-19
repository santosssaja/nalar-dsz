import React from "react";
import type { Metadata } from "next";
import { Sparkles } from "lucide-react";
import { LabView } from "@/features/lab/components/lab-view";

export const metadata: Metadata = {
  title: "Nalar Lab: Ruang Bermain Intuisi Sains & Matematika | Nalar",
  description:
    "Laboratorium simulasi dan visualisasi interaktif STEM. Manipulasi parameter garis bilangan, rasio, kalkulus, kinematika proyektil, atom Bohr, hingga respirasi ATP.",
};

export default function NalarLabPage() {
  return (
    <div className="space-y-8 max-w-5xl mx-auto py-4">
      {/* Header */}
      <header className="space-y-2">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold bg-accent-muted text-accent">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Laboratorium Eksperimen STEM Nalar</span>
          <span>•</span>
          <span>14 Wahana Eksplorasi Multidisiplin</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold text-text tracking-tight">
          Nalar Lab: Ruang Bermain Intuisi Sains &amp; Matematika
        </h1>
        <p className="text-sm text-text-muted max-w-3xl leading-relaxed">
          Manipulasi parameter secara langsung untuk melihat konsep beraksi. Dari garis bilangan dan rasio, garis singgung kalkulus, trajektori proyektil mekanika, kulit elektron atom, hingga siklus respirasi ATP seluler.
        </p>
      </header>

      {/* Main Interactive Lab View */}
      <LabView />
    </div>
  );
}
