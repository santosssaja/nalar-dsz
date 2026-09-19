"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  TrendingUp,
  Ruler,
  PieChart,
  Grid,
  Compass,
  Target,
  MoveRight,
  Activity,
  Atom,
  FlaskConical,
  Dna,
  BatteryCharging,
  Eye,
  ArrowRight,
  Sparkles,
  Layers,
  LucideIcon,
} from "lucide-react";
import { MathRenderer } from "@/components/ui/katex-math";
import { NumberLinePlayground } from "@/features/learning/components/playgrounds/number-line-playground";
import { FractionRatioPlayground } from "@/features/learning/components/playgrounds/fraction-ratio-playground";
import { PatternExponentPlayground } from "@/features/learning/components/playgrounds/pattern-exponent-playground";
import { VectorPlayground } from "@/features/learning/components/playgrounds/vector-playground";
import { ProjectileMotionPlayground } from "@/features/learning/components/playgrounds/projectile-motion-playground";
import { NewtonDynamicsPlayground } from "@/features/learning/components/playgrounds/newton-dynamics-playground";
import { HarmonicOscillationPlayground } from "@/features/learning/components/playgrounds/harmonic-oscillation-playground";
import { MatterPlayground } from "@/features/learning/components/playgrounds/matter-playground";
import { PeriodicTableAtomPlayground } from "@/features/learning/components/playgrounds/periodic-table-atom-playground";
import { ChemicalBondingPlayground } from "@/features/learning/components/playgrounds/chemical-bonding-playground";
import { BiologicalScalePlayground } from "@/features/learning/components/playgrounds/biological-scale-playground";
import { CellStructurePlayground } from "@/features/learning/components/playgrounds/cell-structure-playground";
import { BiologicalEnergyPlayground } from "@/features/learning/components/playgrounds/biological-energy-playground";

type LabStationId =
  | "calculus"
  | "number-line"
  | "fraction-ratio"
  | "pattern-exponent"
  | "vector"
  | "projectile"
  | "newton-dynamics"
  | "oscillation"
  | "periodic-atom"
  | "chemical-bonding"
  | "matter"
  | "biology"
  | "cell-structure"
  | "biological-energy";

interface LabStation {
  id: LabStationId;
  title: string;
  domain: string;
  domainSlug: string;
  badgeColor: string;
  icon: LucideIcon;
  description: string;
  moduleSlug: string;
  moduleTitle: string;
}

const LAB_STATIONS: LabStation[] = [
  {
    id: "calculus",
    title: "Kalkulus & Turunan",
    domain: "Matematika Lanjut",
    domainSlug: "matematika",
    badgeColor: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30",
    icon: TrendingUp,
    description: "Laboratorium eksplorasi kurva fungsi, garis singgung sesaat, garis potong secant saat h mendekati nol, dan grafik turunan formal f'(x).",
    moduleSlug: "turunan",
    moduleTitle: "Modul Turunan & Diferensial",
  },
  {
    id: "number-line",
    title: "Garis Bilangan Interaktif",
    domain: "Fondasi Matematika",
    domainSlug: "matematika",
    badgeColor: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30",
    icon: Ruler,
    description: "Eksplorasi posisi, titik acuan origin (nol), besaran jarak (magnitude), serta pembuktian logis pengurangan bilangan negatif a - (-b).",
    moduleSlug: "fondasi-matematika",
    moduleTitle: "Modul Fondasi Matematika",
  },
  {
    id: "fraction-ratio",
    title: "Rasio, Proporsi, & Persen",
    domain: "Fondasi Matematika",
    domainSlug: "matematika",
    badgeColor: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30",
    icon: PieChart,
    description: "Visualisasi invariansi rasio, skala proporsional pengali k, serta perbandingan bagian terhadap keseluruhan dalam diagram lingkaran dan bilah fraksi.",
    moduleSlug: "fondasi-matematika",
    moduleTitle: "Modul Fondasi Matematika",
  },
  {
    id: "pattern-exponent",
    title: "Pola, Pangkat, & Eksponen",
    domain: "Fondasi Matematika",
    domainSlug: "matematika",
    badgeColor: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30",
    icon: Grid,
    description: "Perbandingan tingkat pertumbuhan linier, kuadratik, dan eksponensial b^n serta interpretasi geometris luas bujur sangkar dan akar kuadrat.",
    moduleSlug: "fondasi-matematika",
    moduleTitle: "Modul Fondasi Matematika",
  },
  {
    id: "vector",
    title: "Vektor & Gaya 2D",
    domain: "Fisika Mekanika",
    domainSlug: "fisika",
    badgeColor: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/30",
    icon: Compass,
    description: "Manipulasi dua vektor gaya/kecepatan, sudut relatif rotasi 0° hingga 180°, hukum kosinus, dan visualisasi geometris resultan.",
    moduleSlug: "fisika-mekanika",
    moduleTitle: "Modul Fisika Mekanika",
  },
  {
    id: "projectile",
    title: "Kinematika Gerak Parabola",
    domain: "Fisika Mekanika",
    domainSlug: "fisika",
    badgeColor: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/30",
    icon: Target,
    description: "Simulasi lintasan trajektori proyektil 2D di bawah gravitasi, sudut elevasi optimal 45°, waktu terbang, dan pemisahan gerak horizontal-vertikal.",
    moduleSlug: "fisika-mekanika",
    moduleTitle: "Modul Fisika Mekanika",
  },
  {
    id: "newton-dynamics",
    title: "Hukum Newton & Gesekan",
    domain: "Fisika Mekanika",
    domainSlug: "fisika",
    badgeColor: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/30",
    icon: MoveRight,
    description: "Diagram benda bebas (FBD), ambang gesekan statis maksimum vs kinetik, gaya normal, serta percepatan sistem menurut hukum ΣF = ma.",
    moduleSlug: "fisika-mekanika",
    moduleTitle: "Modul Fisika Mekanika",
  },
  {
    id: "oscillation",
    title: "Osilasi Harmonik & Energi",
    domain: "Fisika Mekanika",
    domainSlug: "fisika",
    badgeColor: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/30",
    icon: Activity,
    description: "Sistem osilasi pegas dan bandul sederhana, pertukaran kontinu energi potensial pegas Ep dan energi kinetik Ek, serta kekekalan energi mekanik total.",
    moduleSlug: "fisika-mekanika",
    moduleTitle: "Modul Fisika Mekanika",
  },
  {
    id: "periodic-atom",
    title: "Tabel Periodik & Atom Bohr",
    domain: "Kimia Dasar",
    domainSlug: "kimia",
    badgeColor: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30",
    icon: Atom,
    description: "Model atom Bohr interaktif, konfigurasi susunan elektron kulit K, L, M, elektron valensi, nomor atom Z, dan tren periodik unsur.",
    moduleSlug: "kimia-dasar",
    moduleTitle: "Modul Kimia Dasar",
  },
  {
    id: "chemical-bonding",
    title: "Ikatan Kimia & Geometri VSEPR",
    domain: "Kimia Dasar",
    domainSlug: "kimia",
    badgeColor: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30",
    icon: FlaskConical,
    description: "Visualisasi ikatan ionik vs kovalen polar/nonpolar, tolakan pasangan elektron bebas (PEB), struktur Lewis, serta bentuk molekul linear, bent, dan tetrahedral.",
    moduleSlug: "kimia-dasar",
    moduleTitle: "Modul Kimia Dasar",
  },
  {
    id: "matter",
    title: "Kinetika Partikel & Materi",
    domain: "Kimia Dasar",
    domainSlug: "kimia",
    badgeColor: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30",
    icon: Layers,
    description: "Simulasi gerakan partikel termal dalam fasa padat, cair, dan gas, pengaruh energi kinetik temperatur Kelvin, serta dinamika materi.",
    moduleSlug: "kimia-dasar",
    moduleTitle: "Modul Kimia Dasar",
  },
  {
    id: "biology",
    title: "Skala Organisasi Hayati",
    domain: "Biologi Dasar",
    domainSlug: "biologi",
    badgeColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
    icon: Dna,
    description: "Eksplorasi hierarki organisasi kehidupan dari skala sub-mikroskopis molekul hingga organisme utuh dan pengamatan sifat emergen.",
    moduleSlug: "biologi-dasar",
    moduleTitle: "Modul Biologi Dasar",
  },
  {
    id: "cell-structure",
    title: "Anatomi Sel & Organel",
    domain: "Biologi Dasar",
    domainSlug: "biologi",
    badgeColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
    icon: Eye,
    description: "Inspeksi anatomi mikroskopis komparatif antara sel hewan, sel tumbuhan, dan bakteri prokariotik beserta fungsi homeostasis organel.",
    moduleSlug: "biologi-dasar",
    moduleTitle: "Modul Biologi Dasar",
  },
  {
    id: "biological-energy",
    title: "Energi Hayati & Siklus ATP",
    domain: "Biologi Dasar",
    domainSlug: "biologi",
    badgeColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
    icon: BatteryCharging,
    description: "Siklus termodinamika seluler: fosforilasi ATP ⇌ ADP + Pi, respirasi seluler mitokondria, dan aliran energi biokimiawi.",
    moduleSlug: "biologi-dasar",
    moduleTitle: "Modul Biologi Dasar",
  },
];

interface LabFunction {
  id: string;
  name: string;
  formulaKatex: string;
  derivativeKatex: string;
  fn: (x: number) => number;
  dfn: (x: number) => number;
  xRange: [number, number];
  yRange: [number, number];
  defaultX: number;
}

const LAB_FUNCTIONS: LabFunction[] = [
  {
    id: "quadratic",
    name: "Parabola Sederhana",
    formulaKatex: "f(x) = x^2",
    derivativeKatex: "f'(x) = 2x",
    fn: (x) => x * x,
    dfn: (x) => 2 * x,
    xRange: [-2.5, 2.5],
    yRange: [-1, 6],
    defaultX: 1,
  },
  {
    id: "cubic",
    name: "Polinomial Kubik",
    formulaKatex: "f(x) = x^3 - 3x",
    derivativeKatex: "f'(x) = 3x^2 - 3",
    fn: (x) => x * x * x - 3 * x,
    dfn: (x) => 3 * x * x - 3,
    xRange: [-2.5, 2.5],
    yRange: [-4, 4],
    defaultX: 0,
  },
  {
    id: "sine",
    name: "Gelombang Sinusoidal",
    formulaKatex: "f(x) = 2\\sin(x)",
    derivativeKatex: "f'(x) = 2\\cos(x)",
    fn: (x) => 2 * Math.sin(x),
    dfn: (x) => 2 * Math.cos(x),
    xRange: [-3.2, 3.2],
    yRange: [-3, 3],
    defaultX: 0.5,
  },
  {
    id: "sqrt",
    name: "Fungsi Akar Kuadrat",
    formulaKatex: "f(x) = \\sqrt{x}",
    derivativeKatex: "f'(x) = \\frac{1}{2\\sqrt{x}}",
    fn: (x) => Math.sqrt(Math.max(0, x)),
    dfn: (x) => (x <= 0.05 ? 5 : 1 / (2 * Math.sqrt(x))),
    xRange: [0, 4.5],
    yRange: [-0.5, 3],
    defaultX: 1,
  },
];

function CalculusLabView() {
  const [selectedFuncId, setSelectedFuncId] = useState<string>("quadratic");
  const [x0, setX0] = useState<number>(1.0);
  const [showDerivativeCurve, setShowDerivativeCurve] = useState<boolean>(true);
  const [showSecant, setShowSecant] = useState<boolean>(false);
  const [h, setH] = useState<number>(0.5);

  const activeFunc =
    LAB_FUNCTIONS.find((f) => f.id === selectedFuncId) ?? LAB_FUNCTIONS[0];

  const y0 = activeFunc.fn(x0);
  const slope = activeFunc.dfn(x0);

  // Secant calculations if enabled
  const xB = x0 + h;
  const yB = activeFunc.fn(xB);
  const secantSlope = (yB - y0) / h;

  // Viewport transforms (400x300 SVG)
  const [minX, maxX] = activeFunc.xRange;
  const [minY, maxY] = activeFunc.yRange;

  const toSvgX = (x: number) => 30 + ((x - minX) / (maxX - minX)) * 340;
  const toSvgY = (y: number) => 270 - ((y - minY) / (maxY - minY)) * 240;

  // Points for f(x)
  const curvePoints: string[] = [];
  const stepSize = (maxX - minX) / 80;
  for (let x = minX; x <= maxX; x += stepSize) {
    curvePoints.push(`${toSvgX(x)},${toSvgY(activeFunc.fn(x))}`);
  }
  const curvePathD = `M ${curvePoints.join(" L ")}`;

  // Points for f'(x)
  const derivPoints: string[] = [];
  for (let x = minX; x <= maxX; x += stepSize) {
    derivPoints.push(`${toSvgX(x)},${toSvgY(activeFunc.dfn(x))}`);
  }
  const derivPathD = `M ${derivPoints.join(" L ")}`;

  // Tangent line endpoints across canvas
  const ptAx = toSvgX(x0);
  const ptAy = toSvgY(y0);

  const tangX1 = minX;
  const tangY1 = y0 + slope * (tangX1 - x0);
  const tangX2 = maxX;
  const tangY2 = y0 + slope * (tangX2 - x0);

  // Interpretation of slope
  const getSlopeInterpretation = (m: number) => {
    if (Math.abs(m) < 0.05) {
      return {
        label: "Titik Stasioner (Mendatar / m = 0)",
        color: "text-amber-500",
        desc: "Kurva berada di puncak lokal, lembah lokal, atau titik belok mendatar.",
      };
    }
    if (m > 0) {
      return {
        label: `Menanjak Positif (m = +${m.toFixed(2)})`,
        color: "text-success",
        desc: "Nilai fungsi sedang bertambah seiring bertambahnya x (laju perubahan positif).",
      };
    }
    return {
      label: `Menurun Negatif (m = ${m.toFixed(2)})`,
      color: "text-danger",
      desc: "Nilai fungsi sedang berkurang seiring bertambahnya x (laju perubahan negatif).",
    };
  };

  const interpretation = getSlopeInterpretation(slope);

  return (
    <div className="space-y-6">
      {/* Function Selection Tabs */}
      <div className="space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-text-muted">
          Pilih Fungsi Kurva:
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {LAB_FUNCTIONS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => {
                setSelectedFuncId(f.id);
                setX0(f.defaultX);
              }}
              className={`p-3 rounded-xl border text-left transition-all ${
                selectedFuncId === f.id
                  ? "bg-accent-muted border-accent text-accent shadow-xs"
                  : "bg-surface-raised border-border text-text hover:bg-surface"
              }`}
            >
              <span className="text-xs font-bold block">{f.name}</span>
              <span className="text-xs text-text-muted mt-1 block">
                <MathRenderer inline content={`$${f.formulaKatex}$`} />
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Interactive Canvas & Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interactive SVG Canvas */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-surface-raised border border-border space-y-4">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-text">Kanvas Visualisasi</span>
              <span className="text-text-muted">•</span>
              <span className="font-mono text-accent">
                <MathRenderer inline content={`$${activeFunc.formulaKatex}$`} />
              </span>
            </div>

            <div className="flex items-center gap-4 text-text-muted">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-0.5 bg-accent inline-block"></span>
                <span>Kurva</span>
                <MathRenderer inline content="$f(x)$" />
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-0.5 bg-danger inline-block"></span>
                <span>Garis Singgung</span>
              </span>
              {showDerivativeCurve && (
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-0.5 bg-purple-500 border-b border-dashed inline-block"></span>
                  <span>Turunan</span>
                  <MathRenderer inline content="$f'(x)$" />
                </span>
              )}
            </div>
          </div>

          {/* SVG Viewport */}
          <div className="w-full aspect-[4/3] bg-surface rounded-xl border border-border-subtle overflow-hidden relative flex items-center justify-center">
            <svg
              viewBox="0 0 400 300"
              className="w-full h-full select-none"
              role="img"
              aria-label={`Grafik fungsi ${activeFunc.name}`}
            >
              {/* Grid Lines */}
              <defs>
                <pattern
                  id="lab-grid"
                  width="20"
                  height="20"
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d="M 20 0 L 0 0 0 20"
                    fill="none"
                    stroke="currentColor"
                    strokeOpacity="0.04"
                  />
                </pattern>
              </defs>
              <rect width="400" height="300" fill="url(#lab-grid)" />

              {/* Axes */}
              {minY <= 0 && maxY >= 0 && (
                <line
                  x1="30"
                  y1={toSvgY(0)}
                  x2="370"
                  y2={toSvgY(0)}
                  stroke="currentColor"
                  strokeOpacity="0.25"
                  strokeWidth="1.5"
                />
              )}
              {minX <= 0 && maxX >= 0 && (
                <line
                  x1={toSvgX(0)}
                  y1="30"
                  x2={toSvgX(0)}
                  y2="270"
                  stroke="currentColor"
                  strokeOpacity="0.25"
                  strokeWidth="1.5"
                />
              )}

              {/* Derivative curve f'(x) (Dashed Purple) */}
              {showDerivativeCurve && (
                <path
                  d={derivPathD}
                  fill="none"
                  stroke="#a855f7"
                  strokeWidth="2"
                  strokeDasharray="4 3"
                  strokeOpacity="0.75"
                />
              )}

              {/* Original function curve f(x) (Solid Accent) */}
              <path
                d={curvePathD}
                fill="none"
                stroke="var(--color-accent)"
                strokeWidth="2.5"
              />

              {/* Secant Line (Garis Potong) if toggled */}
              {showSecant && (
                <>
                  <line
                    x1={ptAx}
                    y1={ptAy}
                    x2={toSvgX(xB)}
                    y2={toSvgY(yB)}
                    stroke="#f59e0b"
                    strokeWidth="2"
                    strokeDasharray="2 2"
                  />
                  {/* Point B */}
                  <circle
                    cx={toSvgX(xB)}
                    cy={toSvgY(yB)}
                    r="5"
                    fill="#f59e0b"
                    stroke="#fff"
                    strokeWidth="1.5"
                  />
                </>
              )}

              {/* Tangent Line (Red/Danger) */}
              <line
                x1={toSvgX(tangX1)}
                y1={toSvgY(tangY1)}
                x2={toSvgX(tangX2)}
                y2={toSvgY(tangY2)}
                stroke="#ef4444"
                strokeWidth="2"
                strokeOpacity="0.9"
              />

              {/* Touch Point A (x0, y0) */}
              <circle
                cx={ptAx}
                cy={ptAy}
                r="6"
                fill="#ef4444"
                stroke="#ffffff"
                strokeWidth="2"
                className="drop-shadow-md"
              />
            </svg>
          </div>

          {/* Canvas Subtitle & Controls */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2 text-xs">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={showDerivativeCurve}
                  onChange={(e) => setShowDerivativeCurve(e.target.checked)}
                  className="rounded border-border text-accent focus:ring-accent"
                />
                <span className="text-text font-medium inline-flex items-center gap-1">
                  <span>Tampilkan Kurva Turunan</span>
                  <MathRenderer inline content="$f'(x)$" />
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={showSecant}
                  onChange={(e) => setShowSecant(e.target.checked)}
                  className="rounded border-border text-amber-500 focus:ring-amber-500"
                />
                <span className="text-text font-medium inline-flex items-center gap-1">
                  <span>Tampilkan Secant (</span>
                  <MathRenderer inline content="$h$" />
                  <span>)</span>
                </span>
              </label>
            </div>

            <span className="text-text-muted font-mono text-[11px]">
              Koordinat: ({x0.toFixed(2)}, {y0.toFixed(2)})
            </span>
          </div>
        </div>

        {/* Sidebar Controls & Real-time Readout */}
        <div className="space-y-4">
          {/* Position Slider */}
          <div className="p-5 rounded-xl bg-surface-raised border border-border space-y-3">
            <div className="flex items-center justify-between">
              <label htmlFor="lab-x0" className="text-xs font-bold text-text inline-flex items-center gap-1">
                <span>Geser Titik</span>
                <MathRenderer inline content="$x_0$:" />
              </label>
              <span className="font-mono text-sm font-bold text-accent bg-accent/10 px-2 py-0.5 rounded">
                x = {x0.toFixed(2)}
              </span>
            </div>

            <input
              id="lab-x0"
              type="range"
              min={minX}
              max={maxX}
              step={(maxX - minX) / 100}
              value={x0}
              onChange={(e) => setX0(parseFloat(e.target.value))}
              className="w-full accent-accent cursor-pointer h-2 bg-border rounded-lg"
            />

            <div className="flex justify-between text-[10px] text-text-muted font-mono">
              <span>{minX}</span>
              <span>0</span>
              <span>{maxX}</span>
            </div>
          </div>

          {/* Real-time Math Value Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-xl bg-surface-raised border border-border space-y-1">
              <span className="text-[11px] text-text-muted font-medium flex items-center gap-1">
                <span>Tinggi Titik</span>
                <MathRenderer inline content="$f(x_0)$" />
              </span>
              <span className="text-xl font-bold font-mono text-text block">
                {y0.toFixed(3)}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-surface-raised border border-border space-y-1">
              <span className="text-[11px] text-text-muted font-medium flex items-center gap-1">
                <span>Kemiringan</span>
                <MathRenderer inline content="$f'(x_0)$" />
              </span>
              <span className="text-xl font-bold font-mono text-danger block">
                {slope.toFixed(3)}
              </span>
            </div>
          </div>

          {/* Slope Dynamic Interpretation */}
          <div className="p-4 rounded-xl bg-surface-raised border border-border space-y-2">
            <span className="text-xs font-bold text-text block">
              Analisis Dinamika Sesaat:
            </span>
            <div className="p-3 rounded-lg bg-surface border border-border-subtle space-y-1">
              <span className={`text-xs font-bold ${interpretation.color} block`}>
                {interpretation.label}
              </span>
              <p className="text-[11px] text-text-muted leading-relaxed">
                {interpretation.desc}
              </p>
            </div>
          </div>

          {/* Secant delta-x slider if enabled */}
          {showSecant && (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-2 text-xs animate-in fade-in duration-150">
              <div className="flex justify-between font-bold text-text">
                <span className="inline-flex items-center gap-1">
                  <span>Jarak Horizontal (</span>
                  <MathRenderer inline content="$h$" />
                  <span>):</span>
                </span>
                <span className="font-mono text-amber-600 dark:text-amber-400">
                  {h.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-[11px] text-text-muted">
                <span>Kemiringan Secant:</span>
                <span className="font-mono font-bold text-text">
                  {secantSlope.toFixed(3)}
                </span>
              </div>
              <input
                type="range"
                min={0.05}
                max={1.5}
                step={0.05}
                value={h}
                onChange={(e) => setH(parseFloat(e.target.value))}
                className="w-full accent-accent cursor-pointer h-1.5 bg-border rounded-lg"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function NalarLabPage() {
  const [activeStationId, setActiveStationId] = useState<LabStationId>("calculus");

  const currentStation =
    LAB_STATIONS.find((s) => s.id === activeStationId) ?? LAB_STATIONS[0];

  return (
    <div className="space-y-8 max-w-5xl mx-auto py-4">
      {/* Header */}
      <div className="space-y-2">
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
          Manipulasi parameter secara langsung untuk melihat konsep beraksi. Dari garis singgung kalkulus, trajektori proyektil mekanika, kulit elektron atom, hingga siklus respirasi ATP seluler.
        </p>
      </div>

      {/* Station Navigation Carousel / Selector Tabs */}
      <div className="space-y-3">
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
      </div>

      {/* Station Overview & Link to Module */}
      <div className="p-4 rounded-xl bg-surface-raised border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
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
      </div>

      {/* Active Station Interactive Content */}
      <div className="pt-2">
        {activeStationId === "calculus" && <CalculusLabView />}
        {activeStationId === "number-line" && <NumberLinePlayground />}
        {activeStationId === "fraction-ratio" && <FractionRatioPlayground />}
        {activeStationId === "pattern-exponent" && <PatternExponentPlayground />}
        {activeStationId === "vector" && <VectorPlayground />}
        {activeStationId === "projectile" && <ProjectileMotionPlayground />}
        {activeStationId === "newton-dynamics" && <NewtonDynamicsPlayground />}
        {activeStationId === "oscillation" && <HarmonicOscillationPlayground />}
        {activeStationId === "periodic-atom" && <PeriodicTableAtomPlayground />}
        {activeStationId === "chemical-bonding" && <ChemicalBondingPlayground />}
        {activeStationId === "matter" && <MatterPlayground />}
        {activeStationId === "biology" && <BiologicalScalePlayground />}
        {activeStationId === "cell-structure" && <CellStructurePlayground />}
        {activeStationId === "biological-energy" && <BiologicalEnergyPlayground />}
      </div>
    </div>
  );
}
