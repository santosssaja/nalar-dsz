"use client";

import React, { useState } from "react";
import {
  Dna,
  Microscope,
  Heart,
  User,
  Users,
  Globe,
  Leaf,
  Sparkles,
  Search,
  Lightbulb,
  LucideIcon,
} from "lucide-react";

interface ScaleLevel {
  id: number;
  name: string;
  sizeOrder: string;
  icon: LucideIcon;
  examples: string;
  emergentProperty: string;
  description: string;
}

const SCALE_LEVELS: ScaleLevel[] = [
  {
    id: 1,
    name: "Tingkat Molekul & Senyawa",
    sizeOrder: "10⁻¹⁰ – 10⁻⁸ m (Sub-mikroskopis)",
    icon: Dna,
    examples: "DNA, Protein, Glukosa, Air (H₂O)",
    emergentProperty: "Kemampuan menyimpan kode genetik & mengkatalisis reaksi kimiawi.",
    description: "Kumpulan atom yang berikatan kimia. Pada tingkat ini materi BELUM hidup, namun menjadi batu bata penyusun kehidupan.",
  },
  {
    id: 2,
    name: "Tingkat Sel",
    sizeOrder: "10⁻⁵ m (Mikroskopis)",
    icon: Microscope,
    examples: "Sel Saraf, Sel Daun, Bakteri tunggal",
    emergentProperty: "Kehidupan Lahir: Mampu bermetabolisme, bereproduksi mandiri, dan menjaga homeostasis.",
    description: "Unit struktural dan fungsional terkecil dari kehidupan. Semua fungsi hidup dimulai di dalam batas membran sel.",
  },
  {
    id: 3,
    name: "Tingkat Jaringan & Organ",
    sizeOrder: "10⁻² – 10⁻¹ m (Mesoskopis)",
    icon: Heart,
    examples: "Jaringan Otot, Jantung, Daun, Lambung",
    emergentProperty: "Spesialisasi kerja terkoordinasi (misal: memompa cairan ke seluruh tubuh).",
    description: "Sekumpulan sel sejenis yang bekerja sama menjalankan fungsi fisiologis yang jauh lebih kompleks daripada kemampuan sel tunggal.",
  },
  {
    id: 4,
    name: "Tingkat Organisme / Individu",
    sizeOrder: "10⁰ m (Makroskopis)",
    icon: User,
    examples: "Seekor burung elang, seorang manusia, sebatang pohon jati",
    emergentProperty: "Kemampuan bertahan hidup, berperilaku terpadu, dan beradaptasi dengan lingkungan.",
    description: "Satu kesatuan makhluk hidup utuh yang terbentuk dari berbagai sistem organ yang saling bergantung.",
  },
  {
    id: 5,
    name: "Tingkat Populasi & Komunitas",
    sizeOrder: "10³ m (Ekologis Lokal)",
    icon: Users,
    examples: "Populasi rusa di padang rumput, komunitas hutan tropis",
    emergentProperty: "Dinamika persaingan makanan, simbiosis, rantai trofik pemangsaan, dan evolusi genetik.",
    description: "Interaksi antara individu sejenis (populasi) dan kumpulan berbagai spesies makhluk hidup di wilayah yang sama (komunitas).",
  },
  {
    id: 6,
    name: "Tingkat Ekosistem & Biosfer",
    sizeOrder: "10⁷ m (Skala Global Planet)",
    icon: Globe,
    examples: "Hutan hujan Amazon, terumbu karang, seluruh zona hidup di Bumi",
    emergentProperty: "Siklus biogeokimia global (siklus karbon, nitrogen, air) dan stabilitas iklim planet.",
    description: "Puncak tingkatan organisasi: perpaduan komunitas makhluk hidup dengan komponen abiotik (tanah, air, udara, matahari) di seluruh biosfer Bumi.",
  },
];

export function BiologicalScalePlayground() {
  const [currentLevelId, setCurrentLevelId] = useState<number>(2);

  const activeLevel = SCALE_LEVELS.find((l) => l.id === currentLevelId) || SCALE_LEVELS[1];

  return (
    <div className="space-y-5 p-4 sm:p-6 rounded-2xl bg-surface border border-border">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border-subtle pb-3">
        <div>
          <h4 className="text-sm font-bold text-text flex items-center gap-2">
            <Leaf className="w-4 h-4 text-accent" />
            <span>Eksplorasi Hierarki Organisasi: Konsep &apos;Emergent Properties&apos;</span>
          </h4>
          <p className="text-xs text-text-muted mt-0.5">
            Geser skala zoom dari molekul mati hingga biosfer untuk melihat sifat baru apa yang lahir di tiap tingkatan.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-rose-500/15 text-rose-600 dark:text-rose-400 font-bold">
            <activeLevel.icon className="w-3.5 h-3.5" />
            <span>Tingkat {activeLevel.id}: {activeLevel.name}</span>
          </span>
        </div>
      </div>

      {/* Scale Slider */}
      <div className="space-y-2 bg-surface-raised p-4 rounded-xl border border-border">
        <div className="flex justify-between text-xs font-medium text-text">
          <span>Skala Ukuran Zoom:</span>
          <span className="font-mono font-bold text-accent">{activeLevel.sizeOrder}</span>
        </div>
        <input
          type="range"
          min="1"
          max="6"
          step="1"
          value={currentLevelId}
          onChange={(e) => setCurrentLevelId(parseInt(e.target.value, 10))}
          className="w-full accent-rose-500 cursor-pointer"
          aria-label="Atur tingkat hierarki organisasi kehidupan"
        />
        <div className="flex justify-between text-[10px] text-text-muted">
          <span>1. Molekul</span>
          <span>2. Sel</span>
          <span>3. Organ</span>
          <span>4. Organisme</span>
          <span>5. Populasi</span>
          <span>6. Biosfer</span>
        </div>
      </div>

      {/* Interactive Level Cards Selection */}
      <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
        {SCALE_LEVELS.map((lvl) => {
          const isSelected = lvl.id === currentLevelId;
          const IconComp = lvl.icon;
          return (
            <button
              key={lvl.id}
              type="button"
              onClick={() => setCurrentLevelId(lvl.id)}
              className={`p-2.5 rounded-xl border text-center transition-all ${
                isSelected
                  ? "bg-rose-500/15 border-rose-500 text-text font-bold shadow-xs"
                  : "bg-surface border-border text-text-muted hover:bg-surface-raised hover:text-text"
              }`}
            >
              <IconComp className="w-5 h-5 mx-auto mb-1 text-rose-600 dark:text-rose-400" />
              <div className="text-[11px] leading-tight line-clamp-2">{lvl.name.replace("Tingkat ", "")}</div>
            </button>
          );
        })}
      </div>

      {/* Detailed Emergent Property View Card */}
      <div className="p-5 rounded-2xl bg-surface-raised border border-border space-y-4">
        <div className="flex items-start gap-4">
          <span className="w-14 h-14 rounded-2xl bg-rose-500/15 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0 shadow-2xs">
            <activeLevel.icon className="w-7 h-7" />
          </span>
          <div className="space-y-1">
            <h5 className="text-base font-bold text-text">{activeLevel.name}</h5>
            <p className="text-xs text-text-muted font-mono">{activeLevel.sizeOrder}</p>
            <p className="text-xs text-text leading-relaxed pt-1">{activeLevel.description}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <div className="p-3 rounded-xl bg-surface border border-border space-y-1">
            <span className="text-xs font-bold text-text flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-accent shrink-0" />
              <span>Properti Munculan (Emergent Property):</span>
            </span>
            <p className="text-xs text-rose-600 dark:text-rose-400 font-medium leading-relaxed">
              {activeLevel.emergentProperty}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-surface border border-border space-y-1">
            <span className="text-xs font-bold text-text flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5 text-accent shrink-0" />
              <span>Contoh Nyata:</span>
            </span>
            <p className="text-xs text-text-muted leading-relaxed font-mono">
              {activeLevel.examples}
            </p>
          </div>
        </div>
      </div>

      {/* Pedagogical Insight */}
      <div className="p-4 rounded-xl bg-surface-raised border border-border text-xs text-text-muted leading-relaxed">
        <span className="font-bold text-text flex items-center gap-1.5 mb-1">
          <Lightbulb className="w-3.5 h-3.5 text-accent shrink-0" />
          <span>Inti Penalaran Biologi:</span>
        </span>
        <p>
          Kehidupan bukanlah sekadar penjumlahan zat kimia mati. Di setiap kenaikan tingkatan, susunan interaksi antarkomponen memunculkan sifat baru (*emergent property*). Seekor burung dapat terbang bukan karena setiap sel ototnya bisa terbang, melainkan karena kerja sama terorganisasi dari jutaan sel, jaringan, dan sayapnya!
        </p>
      </div>
    </div>
  );
}
