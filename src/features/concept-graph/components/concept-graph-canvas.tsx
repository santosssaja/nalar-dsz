"use client";

import React, { useState, useMemo, useRef } from "react";
import Link from "next/link";
import { ZoomIn, ZoomOut, RotateCcw, X, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, Move } from "lucide-react";
import { ConceptGraphData, GraphNode } from "@/content/registry";
import { MathRenderer } from "@/components/ui/katex-math";

interface ConceptGraphProps {
  graphData: ConceptGraphData;
}

const DOMAIN_COLORS: Record<string, { border: string; bg: string; text: string; glow: string }> = {
  matematika: {
    border: "border-indigo-500",
    bg: "bg-indigo-500/10 dark:bg-indigo-500/20",
    text: "text-indigo-600 dark:text-indigo-400",
    glow: "#6366f1",
  },
  fisika: {
    border: "border-cyan-500",
    bg: "bg-cyan-500/10 dark:bg-cyan-500/20",
    text: "text-cyan-600 dark:text-cyan-400",
    glow: "#06b6d4",
  },
  kimia: {
    border: "border-amber-500",
    bg: "bg-amber-500/10 dark:bg-amber-500/20",
    text: "text-amber-600 dark:text-amber-400",
    glow: "#f59e0b",
  },
  biologi: {
    border: "border-emerald-500",
    bg: "bg-emerald-500/10 dark:bg-emerald-500/20",
    text: "text-emerald-600 dark:text-emerald-400",
    glow: "#10b981",
  },
};

// Clean, punchy labels for canvas nodes to avoid text clipping and visual collisions
const SHORT_LABELS: Record<string, string> = {
  // Matematika (12)
  "perubahan": "Perubahan",
  "laju-perubahan": "Laju Perubahan",
  "definisi-turunan": "Definisi Turunan",
  "bilangan": "Bilangan",
  "operasi-aritmetika": "Aritmetika",
  "pecahan-dan-desimal": "Pecahan",
  "rasio-dan-proporsi": "Rasio",
  "persentase": "Persentase",
  "pangkat-dan-akar": "Pangkat & Akar",
  "urutan-dan-pola": "Pola Bilangan",
  "estimasi": "Estimasi",
  "satuan-dan-pengukuran-matematika": "Satuan Ukur",

  // Fisika Mekanika (18)
  "pengukuran-dan-besaran": "Besaran Fisika",
  "vektor": "Vektor",
  "kinematika": "Kinematika",
  "gerak-lurus": "Gerak Lurus",
  "gerak-parabola": "Parabola",
  "gerak-melingkar": "Melingkar",
  "gaya": "Gaya",
  "hukum-newton": "Hukum Newton",
  "gesekan": "Gaya Gesek",
  "usaha-dan-energi": "Usaha & Energi",
  "momentum-dan-impuls": "Momentum",
  "tumbukan": "Tumbukan",
  "rotasi": "Rotasi",
  "torsi": "Torsi",
  "momentum-sudut": "Momentum Sudut",
  "kesetimbangan": "Kesetimbangan",
  "gravitasi": "Gravitasi",
  "osilasi": "Osilasi",

  // Kimia Dasar (11)
  "materi-dan-sifatnya": "Wujud Materi",
  "unsur-dan-senyawa": "Unsur & Senyawa",
  "atom": "Struktur Atom",
  "molekul": "Molekul",
  "ion": "Ion & Muatan",
  "sistem-periodik": "Tabel Periodik",
  "konfigurasi-elektron": "Konfigurasi e⁻",
  "bilangan-kuantum": "Bil. Kuantum",
  "ikatan-kimia": "Ikatan Kimia",
  "struktur-lewis": "Struktur Lewis",
  "geometri-molekul": "Geometri VSEPR",

  // Biologi Dasar (6)
  "karakteristik-kehidupan": "Ciri Kehidupan",
  "tingkatan-organisasi-kehidupan": "Organisasi Hayati",
  "metode-ilmiah": "Metode Ilmiah",
  "sel": "Struktur Sel",
  "molekul-biologis": "Makromolekul",
  "energi-dalam-sistem-biologis": "Bioenergetika",
};

// Generously spaced, deterministic 2D grid coordinates (min. 100px separation between any two nodes)
const FIXED_POSITIONS: Record<string, { x: number; y: number }> = {
  // Matematika (Top-Left: x 40..660, y 45..420)
  "bilangan": { x: 110, y: 130 },
  "operasi-aritmetika": { x: 250, y: 130 },
  "pecahan-dan-desimal": { x: 390, y: 130 },
  "rasio-dan-proporsi": { x: 530, y: 130 },
  "persentase": { x: 110, y: 235 },
  "pangkat-dan-akar": { x: 250, y: 235 },
  "urutan-dan-pola": { x: 390, y: 235 },
  "estimasi": { x: 530, y: 235 },
  "satuan-dan-pengukuran-matematika": { x: 110, y: 340 },
  "perubahan": { x: 250, y: 340 },
  "laju-perubahan": { x: 390, y: 340 },
  "definisi-turunan": { x: 530, y: 340 },

  // Fisika Mekanika (Top-Right: x 700..1360, y 45..420)
  "pengukuran-dan-besaran": { x: 780, y: 130 },
  "vektor": { x: 880, y: 130 },
  "kinematika": { x: 980, y: 130 },
  "gerak-lurus": { x: 1080, y: 130 },
  "gerak-parabola": { x: 1180, y: 130 },
  "gerak-melingkar": { x: 1280, y: 130 },
  "gaya": { x: 780, y: 235 },
  "hukum-newton": { x: 880, y: 235 },
  "gesekan": { x: 980, y: 235 },
  "usaha-dan-energi": { x: 1080, y: 235 },
  "momentum-dan-impuls": { x: 1180, y: 235 },
  "tumbukan": { x: 1280, y: 235 },
  "rotasi": { x: 780, y: 340 },
  "torsi": { x: 880, y: 340 },
  "momentum-sudut": { x: 980, y: 340 },
  "kesetimbangan": { x: 1080, y: 340 },
  "gravitasi": { x: 1180, y: 340 },
  "osilasi": { x: 1280, y: 340 },

  // Kimia Dasar (Bottom-Left: x 40..660, y 465..855)
  "materi-dan-sifatnya": { x: 110, y: 570 },
  "unsur-dan-senyawa": { x: 250, y: 570 },
  "atom": { x: 390, y: 570 },
  "molekul": { x: 530, y: 570 },
  "ion": { x: 110, y: 675 },
  "sistem-periodik": { x: 250, y: 675 },
  "konfigurasi-elektron": { x: 390, y: 675 },
  "bilangan-kuantum": { x: 530, y: 675 },
  "ikatan-kimia": { x: 180, y: 780 },
  "struktur-lewis": { x: 320, y: 780 },
  "geometri-molekul": { x: 460, y: 780 },

  // Biologi Dasar (Bottom-Right: x 700..1360, y 465..855)
  "karakteristik-kehidupan": { x: 850, y: 610 },
  "tingkatan-organisasi-kehidupan": { x: 1030, y: 610 },
  "metode-ilmiah": { x: 1210, y: 610 },
  "sel": { x: 850, y: 745 },
  "molekul-biologis": { x: 1030, y: 745 },
  "energi-dalam-sistem-biologis": { x: 1210, y: 745 },
};

export function ConceptGraphView({ graphData }: ConceptGraphProps) {
  const [selectedDomain, setSelectedDomain] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"graph" | "list">("graph");
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  // Only display concept nodes in graph canvas
  const conceptNodes = useMemo(() => {
    return graphData.nodes.filter((n) => n.type === "concept");
  }, [graphData]);

  // Dynamic ViewBox: Focusing directly into the selected domain with high clarity and generous room + zoom scaling
  const currentViewBox = useMemo(() => {
    let x = 0;
    let y = 0;
    let w = 1400;
    let h = 890;

    switch (selectedDomain) {
      case "matematika":
        x = 35;
        y = 40;
        w = 635;
        h = 390;
        break;
      case "fisika":
        x = 695;
        y = 40;
        w = 670;
        h = 390;
        break;
      case "kimia":
        x = 35;
        y = 460;
        w = 635;
        h = 405;
        break;
      case "biologi":
        x = 695;
        y = 460;
        w = 670;
        h = 405;
        break;
      default:
        x = 0;
        y = 0;
        w = 1400;
        h = 890;
    }

    if (zoomLevel !== 1) {
      const newW = w / zoomLevel;
      const newH = h / zoomLevel;
      const newX = x + (w - newW) / 2;
      const newY = y + (h - newH) / 2;
      return `${newX} ${newY} ${newW} ${newH}`;
    }

    return `${x} ${y} ${w} ${h}`;
  }, [selectedDomain, zoomLevel]);

  // Filtered concepts
  const filteredNodes = useMemo(() => {
    return conceptNodes.filter((n) => {
      const matchDomain = selectedDomain === "all" || n.domainSlug === selectedDomain;
      const matchSearch =
        !searchQuery.trim() ||
        n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.summary.toLowerCase().includes(searchQuery.toLowerCase());
      return matchDomain && matchSearch;
    });
  }, [conceptNodes, selectedDomain, searchQuery]);

  // Filtered Edges connecting concepts
  const conceptEdges = useMemo(() => {
    return graphData.edges.filter((e) => {
      const hasSrc = Boolean(FIXED_POSITIONS[e.source]);
      const hasTgt = Boolean(FIXED_POSITIONS[e.target]);
      if (!hasSrc || !hasTgt) return false;

      // In domain-specific view, only show edges internal to that domain
      if (selectedDomain !== "all") {
        const srcNode = conceptNodes.find((n) => n.slug === e.source);
        const tgtNode = conceptNodes.find((n) => n.slug === e.target);
        return srcNode?.domainSlug === selectedDomain && tgtNode?.domainSlug === selectedDomain;
      }

      return e.relationship === "prerequisite" || e.relationship === "cross_domain";
    });
  }, [graphData.edges, selectedDomain, conceptNodes]);

  // Currently active concept (either hovered or selected) for connection illumination
  const activeSlug = hoveredNode || selectedNode?.slug || null;

  // Zoom control handlers
  const handleZoomIn = () => setZoomLevel((prev) => Math.min(2.5, +(prev + 0.25).toFixed(2)));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(0.75, +(prev - 0.25).toFixed(2)));
  const handleZoomReset = () => {
    setZoomLevel(1);
    scrollContainerRef.current?.scrollTo({ left: 0, top: 0, behavior: "smooth" });
  };

  // 2D Scroll & drag-to-pan handlers for mobile and desktop
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isPointerDownRef = useRef(false);
  const pointerStartRef = useRef({ x: 0, y: 0, scrollLeft: 0, scrollTop: 0 });
  const hasDraggedRef = useRef(false);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // If clicking a button or link or zoom control, ignore drag
    if ((e.target as HTMLElement).closest("button, a")) return;

    isPointerDownRef.current = true;
    hasDraggedRef.current = false;
    pointerStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      scrollLeft: scrollContainerRef.current?.scrollLeft ?? 0,
      scrollTop: scrollContainerRef.current?.scrollTop ?? 0,
    };
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isPointerDownRef.current || !scrollContainerRef.current) return;

    const dx = e.clientX - pointerStartRef.current.x;
    const dy = e.clientY - pointerStartRef.current.y;

    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
      hasDraggedRef.current = true;
    }

    scrollContainerRef.current.scrollLeft = pointerStartRef.current.scrollLeft - dx;
    scrollContainerRef.current.scrollTop = pointerStartRef.current.scrollTop - dy;
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    isPointerDownRef.current = false;
    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch {
      // ignore
    }
  };

  const handleScrollLeft = () => {
    scrollContainerRef.current?.scrollBy({ left: -220, behavior: "smooth" });
  };

  const handleScrollRight = () => {
    scrollContainerRef.current?.scrollBy({ left: 220, behavior: "smooth" });
  };

  const handleScrollUp = () => {
    scrollContainerRef.current?.scrollBy({ top: -180, behavior: "smooth" });
  };

  const handleScrollDown = () => {
    scrollContainerRef.current?.scrollBy({ top: 180, behavior: "smooth" });
  };

  return (
    <div className="space-y-6">
      {/* Controls Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 rounded-2xl bg-surface-raised border border-border">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-text-muted mr-1">Filter Domain:</span>
          {[
            { id: "all", label: "Semua Bidang (47)" },
            { id: "matematika", label: "Matematika (12)" },
            { id: "fisika", label: "Fisika (18)" },
            { id: "kimia", label: "Kimia (11)" },
            { id: "biologi", label: "Biologi (6)" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setSelectedDomain(tab.id);
                setSelectedNode(null);
                setZoomLevel(1);
                scrollContainerRef.current?.scrollTo({ left: 0, top: 0, behavior: "smooth" });
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                selectedDomain === tab.id
                  ? "bg-accent text-surface-raised font-bold shadow-xs"
                  : "bg-surface hover:bg-surface-raised border border-border text-text"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <input
            type="text"
            placeholder="Cari konsep..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-3.5 py-1.5 text-xs rounded-lg bg-surface border border-border text-text placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent w-full md:w-48"
          />

          <div className="flex items-center rounded-lg border border-border bg-surface p-0.5 shrink-0">
            <button
              type="button"
              onClick={() => setViewMode("graph")}
              className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${
                viewMode === "graph"
                  ? "bg-accent text-surface-raised font-bold"
                  : "text-text-muted hover:text-text"
              }`}
            >
              Graf 2D
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${
                viewMode === "list"
                  ? "bg-accent text-surface-raised font-bold"
                  : "text-text-muted hover:text-text"
              }`}
            >
              Daftar Rapi
            </button>
          </div>
        </div>
      </div>

      {viewMode === "graph" ? (
        <div className="space-y-3">
          {/* Legend & Navigation Toolbar - Placed cleanly above the canvas so the graph remains 100% unobstructed */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 px-3.5 py-2 rounded-xl bg-surface-raised border border-border text-xs">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="font-semibold text-text">Bidang:</span>
              <span className="inline-flex items-center gap-1.5 text-text">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
                Matematika
              </span>
              <span className="inline-flex items-center gap-1.5 text-text">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-500"></span>
                Fisika
              </span>
              <span className="inline-flex items-center gap-1.5 text-text">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                Kimia
              </span>
              <span className="inline-flex items-center gap-1.5 text-text">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                Biologi
              </span>
              {selectedDomain === "all" && (
                <span className="inline-flex items-center gap-1.5 text-text-muted">
                  <span className="w-3 border-t-2 border-dashed border-accent"></span>
                  Lintas Disiplin
                </span>
              )}
            </div>

            {/* Controls: 2D Pan & Zoom Toolbar */}
            <div className="flex items-center gap-1 ml-auto">
              {/* Mobile 2D Directional Pan Buttons */}
              <div className="flex items-center gap-0.5 md:hidden">
                <button
                  type="button"
                  onClick={handleScrollLeft}
                  title="Geser ke kiri"
                  aria-label="Geser ke kiri"
                  className="p-1 rounded-md text-text-muted hover:text-text hover:bg-surface border border-border/60 transition-colors"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={handleScrollRight}
                  title="Geser ke kanan"
                  aria-label="Geser ke kanan"
                  className="p-1 rounded-md text-text-muted hover:text-text hover:bg-surface border border-border/60 transition-colors"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={handleScrollUp}
                  title="Geser ke atas"
                  aria-label="Geser ke atas"
                  className="p-1 rounded-md text-text-muted hover:text-text hover:bg-surface border border-border/60 transition-colors"
                >
                  <ChevronUp className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={handleScrollDown}
                  title="Geser ke bawah"
                  aria-label="Geser ke bawah"
                  className="p-1 rounded-md text-text-muted hover:text-text hover:bg-surface border border-border/60 transition-colors"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="w-px h-3.5 bg-border mx-0.5 md:hidden" />

              {/* Zoom Controls */}
              <button
                type="button"
                onClick={handleZoomIn}
                disabled={zoomLevel >= 2.5}
                title="Perbesar graf"
                aria-label="Perbesar graf"
                className="p-1 rounded-md text-text-muted hover:text-text hover:bg-surface border border-border/60 disabled:opacity-40 transition-colors"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <span className="text-[11px] font-mono font-medium px-1 text-text-muted min-w-[36px] text-center select-none">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                type="button"
                onClick={handleZoomOut}
                disabled={zoomLevel <= 0.75}
                title="Perkecil graf"
                aria-label="Perkecil graf"
                className="p-1 rounded-md text-text-muted hover:text-text hover:bg-surface border border-border/60 disabled:opacity-40 transition-colors"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              {zoomLevel !== 1 && (
                <button
                  type="button"
                  onClick={handleZoomReset}
                  title="Reset ukuran dan posisi graf"
                  aria-label="Reset ukuran dan posisi graf"
                  className="p-1 rounded-md text-accent hover:bg-accent/10 border border-accent/40 transition-colors ml-0.5"
                >
                  <RotateCcw className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Interactive 2D SVG Graph Canvas */}
          <div className="relative w-full rounded-2xl bg-surface-raised border border-border overflow-hidden p-1 sm:p-2">
            {/* 2D pan wrapper on mobile with active pointer-drag and native touch scroll */}
            <div
              ref={scrollContainerRef}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              className="w-full h-[400px] sm:h-[480px] md:h-auto overflow-x-auto overflow-y-auto scrollbar-thin cursor-grab active:cursor-grabbing select-none overscroll-contain"
              style={{
                WebkitOverflowScrolling: "touch",
                touchAction: "none",
              }}
            >
              <div className="w-[880px] md:w-full shrink-0">
                <svg
                  viewBox={currentViewBox}
                  className="w-full aspect-[16/10] block pointer-events-auto"
                  aria-label="Kanvas Graf Konsep Pengetahuan STEM Nalar"
                >
            <defs>
              <marker
                id="arrowhead-prereq"
                markerWidth="8"
                markerHeight="6"
                refX="19"
                refY="3"
                orient="auto"
              >
                <polygon points="0 0, 8 3, 0 6" fill="var(--color-border)" />
              </marker>
              <marker
                id="arrowhead-cross"
                markerWidth="8"
                markerHeight="6"
                refX="19"
                refY="3"
                orient="auto"
              >
                <polygon points="0 0, 8 3, 0 6" fill="var(--color-accent)" />
              </marker>
              <marker
                id="arrowhead-active"
                markerWidth="9"
                markerHeight="7"
                refX="19"
                refY="3.5"
                orient="auto"
              >
                <polygon points="0 0, 9 3.5, 0 7" fill="var(--color-accent)" />
              </marker>
            </defs>

            {/* Domain Background Boundary Cards */}
            {(selectedDomain === "all" || selectedDomain === "matematika") && (
              <g>
                <rect
                  x="45"
                  y="50"
                  width="610"
                  height="370"
                  rx="20"
                  fill="#6366f1"
                  fillOpacity="0.03"
                  stroke="#6366f1"
                  strokeOpacity="0.2"
                  strokeDasharray="4 4"
                />
                <text x="70" y="82" fontSize="13" fontWeight="bold" fill="#6366f1" letterSpacing="0.5">
                  FONDASI MATEMATIKA & KALKULUS
                </text>
              </g>
            )}

            {(selectedDomain === "all" || selectedDomain === "fisika") && (
              <g>
                <rect
                  x="705"
                  y="50"
                  width="650"
                  height="370"
                  rx="20"
                  fill="#06b6d4"
                  fillOpacity="0.03"
                  stroke="#06b6d4"
                  strokeOpacity="0.2"
                  strokeDasharray="4 4"
                />
                <text x="730" y="82" fontSize="13" fontWeight="bold" fill="#06b6d4" letterSpacing="0.5">
                  FISIKA MEKANIKA
                </text>
              </g>
            )}

            {(selectedDomain === "all" || selectedDomain === "kimia") && (
              <g>
                <rect
                  x="45"
                  y="470"
                  width="610"
                  height="385"
                  rx="20"
                  fill="#f59e0b"
                  fillOpacity="0.03"
                  stroke="#f59e0b"
                  strokeOpacity="0.2"
                  strokeDasharray="4 4"
                />
                <text x="70" y="504" fontSize="13" fontWeight="bold" fill="#f59e0b" letterSpacing="0.5">
                  KIMIA DASAR: STRUKTUR & IKATAN
                </text>
              </g>
            )}

            {(selectedDomain === "all" || selectedDomain === "biologi") && (
              <g>
                <rect
                  x="705"
                  y="470"
                  width="650"
                  height="385"
                  rx="20"
                  fill="#10b981"
                  fillOpacity="0.03"
                  stroke="#10b981"
                  strokeOpacity="0.2"
                  strokeDasharray="4 4"
                />
                <text x="730" y="504" fontSize="13" fontWeight="bold" fill="#10b981" letterSpacing="0.5">
                  BIOLOGI DASAR: ENTITAS HIDUP & SEL
                </text>
              </g>
            )}

            {/* Edges */}
            {conceptEdges.map((edge) => {
              const src = FIXED_POSITIONS[edge.source];
              const tgt = FIXED_POSITIONS[edge.target];
              if (!src || !tgt) return null;

              const isCross = edge.relationship === "cross_domain";
              const isConnected =
                activeSlug !== null && (edge.source === activeSlug || edge.target === activeSlug);
              const isDimmed = activeSlug !== null && !isConnected;

              return (
                <g key={edge.id}>
                  <line
                    x1={src.x}
                    y1={src.y}
                    x2={tgt.x}
                    y2={tgt.y}
                    stroke={
                      isConnected
                        ? "var(--color-accent)"
                        : isCross
                        ? "var(--color-accent)"
                        : "var(--color-border)"
                    }
                    strokeWidth={isConnected ? 2.5 : isCross ? 1.5 : 1}
                    strokeDasharray={isCross ? "5 4" : undefined}
                    opacity={isConnected ? 1 : isDimmed ? 0.12 : isCross ? 0.6 : 0.35}
                    markerEnd={
                      isConnected
                        ? "url(#arrowhead-active)"
                        : isCross
                        ? "url(#arrowhead-cross)"
                        : "url(#arrowhead-prereq)"
                    }
                    className="transition-all duration-150"
                  />
                  {isCross && selectedDomain === "all" && (
                    <g opacity={isDimmed ? 0.2 : 0.95}>
                      <rect
                        x={Math.round(((src.x + tgt.x) / 2 - 80) * 10) / 10}
                        y={Math.round(((src.y + tgt.y) / 2 - 9) * 10) / 10}
                        width="160"
                        height="18"
                        rx="9"
                        fill="var(--color-surface)"
                        stroke="var(--color-accent)"
                        strokeWidth="0.8"
                      />
                      <text
                        x={Math.round(((src.x + tgt.x) / 2) * 10) / 10}
                        y={Math.round(((src.y + tgt.y) / 2 + 3) * 10) / 10}
                        textAnchor="middle"
                        fontSize="8.5"
                        fill="var(--color-accent)"
                        fontWeight="bold"
                        className="pointer-events-none select-none"
                      >
                        {edge.label}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}

            {/* Nodes */}
            {filteredNodes.map((node) => {
              const pos = FIXED_POSITIONS[node.slug] ?? { x: 700, y: 450 };
              const colors = DOMAIN_COLORS[node.domainSlug] ?? DOMAIN_COLORS.matematika;
              const isSelected = selectedNode?.slug === node.slug;
              const isHovered = hoveredNode === node.slug;

              // Check if node is connected to active (hovered or selected) node
              const isConnectedToActive =
                activeSlug !== null &&
                (node.slug === activeSlug ||
                  graphData.edges.some(
                    (e) =>
                      (e.source === activeSlug && e.target === node.slug) ||
                      (e.target === activeSlug && e.source === node.slug)
                  ));
              const isDimmed = activeSlug !== null && !isConnectedToActive;

              return (
                <g
                  key={node.id}
                  onClick={() => {
                    if (hasDraggedRef.current) return;
                    setSelectedNode(node);
                  }}
                  onMouseEnter={() => setHoveredNode(node.slug)}
                  onMouseLeave={() => setHoveredNode(null)}
                  className="cursor-pointer outline-none group"
                  role="button"
                  tabIndex={0}
                  aria-label={`Konsep ${node.title}`}
                  opacity={isDimmed ? 0.35 : 1}
                  style={{ transition: "opacity 150ms ease" }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      setSelectedNode(node);
                    }
                  }}
                >
                  {/* 1. Constant Invisible Hit-Test Area: Prevents boundary scaling jitter on hover */}
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={26}
                    fill="transparent"
                  />

                  {/* 2. Outer Glow / Ring */}
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={isSelected ? 26 : isHovered ? 23 : 19}
                    fill={colors.glow}
                    opacity={isSelected ? 0.35 : isHovered ? 0.25 : 0.12}
                    className="transition-all duration-150"
                  />

                  {/* 3. Main Node Circle */}
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={isSelected ? 20 : isHovered ? 18.5 : 16.5}
                    fill="var(--color-surface)"
                    stroke={
                      isSelected
                        ? "var(--color-accent)"
                        : isHovered
                        ? colors.glow
                        : "var(--color-border)"
                    }
                    strokeWidth={isSelected ? 3.5 : isHovered ? 2.5 : 1.8}
                    className="transition-all duration-150"
                  />

                  {/* 4. Center Dot Pip */}
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={isSelected ? 7 : isHovered ? 6 : 4}
                    fill={colors.glow}
                    className="transition-all duration-150"
                  />

                  {/* 5. Short Display Label */}
                  <text
                    x={pos.x}
                    y={pos.y + 28}
                    textAnchor="middle"
                    fontSize="9.5"
                    fontWeight={isSelected || isHovered ? "bold" : "600"}
                    fill={
                      isSelected
                        ? "var(--color-accent)"
                        : isHovered
                        ? "var(--color-text)"
                        : "var(--color-text-muted)"
                    }
                    className="pointer-events-none select-none transition-colors duration-150"
                  >
                    {SHORT_LABELS[node.slug] || node.title}
                  </text>

                  {/* 6. Floating Tooltip Preview on Hover */}
                  {isHovered && !isSelected && (
                    <g className="pointer-events-none" opacity="0.97">
                      <rect
                        x={pos.x - 85}
                        y={pos.y - 44}
                        width="170"
                        height="24"
                        rx="12"
                        fill="var(--color-surface-raised)"
                        stroke="var(--color-border)"
                        strokeWidth="1"
                      />
                      <text
                        x={pos.x}
                        y={pos.y - 28}
                        textAnchor="middle"
                        fontSize="9"
                        fontWeight="bold"
                        fill="var(--color-text)"
                      >
                        {node.title.length > 24 ? `${node.title.substring(0, 22)}...` : node.title}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </svg>
              </div>
            </div>
          </div>

          {/* Selected Node Details: Positioned cleanly below the canvas in natural flow - NEVER covering any nodes */}
          {selectedNode && (
            <div
              role="region"
              aria-label={`Detail konsep ${selectedNode.title}`}
              className="p-4 sm:p-5 rounded-2xl bg-surface-raised border border-accent/40 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-3 sm:gap-4 animate-in fade-in duration-200"
            >
              <div className="space-y-1 sm:space-y-1.5 flex-1 pr-4 sm:pr-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider bg-accent/10 text-accent">
                    {selectedNode.domainSlug}
                  </span>
                  <span className="text-[11px] sm:text-xs text-text-muted">
                    {selectedNode.stepCount} Langkah Belajar • Tingkat: {selectedNode.difficulty}
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-text">{selectedNode.title}</h3>
                <p className="text-xs text-text-muted max-w-2xl leading-relaxed">
                  {selectedNode.summary}
                </p>
              </div>

              <div className="flex items-center gap-2.5 sm:gap-3 w-full sm:w-auto shrink-0 pt-2 sm:pt-0 border-t border-border/60 sm:border-0 justify-end">
                <Link
                  href={`/learn/${selectedNode.slug}`}
                  className="flex-1 sm:flex-initial text-center px-4 sm:px-5 py-2.5 rounded-lg text-xs sm:text-sm font-semibold bg-accent text-surface-raised hover:bg-accent-hover transition-colors shadow-sm"
                >
                  Mulai Pelajari Konsep →
                </Link>
                <button
                  type="button"
                  onClick={() => setSelectedNode(null)}
                  title="Tutup detail konsep"
                  aria-label="Tutup detail konsep"
                  className="px-3 py-2.5 rounded-lg text-xs font-medium border border-border hover:bg-surface text-text-muted flex items-center justify-center gap-1"
                >
                  <X className="w-4 h-4" />
                  <span>Tutup</span>
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Accessible List View */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredNodes.map((node) => {
            const colors = DOMAIN_COLORS[node.domainSlug] ?? DOMAIN_COLORS.matematika;
            return (
              <div
                key={node.id}
                className="p-5 rounded-xl bg-surface-raised border border-border hover:border-accent transition-all flex flex-col justify-between gap-3"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span
                      className={`font-semibold uppercase text-[10px] px-2 py-0.5 rounded-full border ${colors.border} ${colors.text} ${colors.bg}`}
                    >
                      {node.domainSlug}
                    </span>
                    <span className="text-text-muted">{node.stepCount} Langkah</span>
                  </div>

                  <h3 className="font-bold text-base text-text">{node.title}</h3>
                  <div className="text-xs text-text-muted leading-relaxed line-clamp-2">
                    <MathRenderer content={node.summary} />
                  </div>
                </div>

                <div className="pt-2 border-t border-border-subtle flex items-center justify-between">
                  <span className="text-xs text-text-muted capitalize">
                    Tingkat: {node.difficulty}
                  </span>
                  <Link
                    href={`/learn/${node.slug}`}
                    className="text-xs font-semibold text-accent hover:underline flex items-center gap-1"
                  >
                    Buka Konsep →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
