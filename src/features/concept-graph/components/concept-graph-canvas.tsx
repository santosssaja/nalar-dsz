"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { ConceptGraphData, GraphNode, GraphEdge } from "@/content/registry";
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

export function ConceptGraphView({ graphData }: ConceptGraphProps) {
  const [selectedDomain, setSelectedDomain] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [viewMode, setViewMode] = useState<"graph" | "list">("graph");

  // Only display concept nodes in graph canvas
  const conceptNodes = useMemo(() => {
    return graphData.nodes.filter((n) => n.type === "concept");
  }, [graphData]);

  // Pre-compute 2D positions for each concept node organized cleanly in 4 domain clusters
  const nodePositions = useMemo(() => {
    const posMap = new Map<string, { x: number; y: number }>();

    // Cluster centers (viewBox: 0 0 1000 650)
    const clusterCenters: Record<string, { cx: number; cy: number }> = {
      matematika: { cx: 220, cy: 180 },
      fisika: { cx: 720, cy: 180 },
      kimia: { cx: 300, cy: 460 },
      biologi: { cx: 700, cy: 460 },
    };

    // Group nodes by domain
    const byDomain: Record<string, GraphNode[]> = {
      matematika: [],
      fisika: [],
      kimia: [],
      biologi: [],
    };

    for (const node of conceptNodes) {
      if (byDomain[node.domainSlug]) {
        byDomain[node.domainSlug].push(node);
      }
    }

    // Distribute nodes in each cluster in a circular/arc pattern
    Object.entries(byDomain).forEach(([dom, nodes]) => {
      const center = clusterCenters[dom] ?? { cx: 500, cy: 300 };
      const radius = 100;
      nodes.forEach((node, idx) => {
        const angle = (idx / nodes.length) * 2 * Math.PI - Math.PI / 2;
        posMap.set(node.slug, {
          x: center.cx + radius * Math.cos(angle),
          y: center.cy + radius * Math.sin(angle),
        });
      });
    });

    return posMap;
  }, [conceptNodes]);

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

  // Edges connecting concepts
  const conceptEdges = useMemo(() => {
    return graphData.edges.filter(
      (e) =>
        nodePositions.has(e.source) &&
        nodePositions.has(e.target) &&
        (e.relationship === "prerequisite" || e.relationship === "cross_domain")
    );
  }, [graphData.edges, nodePositions]);

  return (
    <div className="space-y-6">
      {/* Controls Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 rounded-2xl bg-surface-raised border border-border">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-text-muted mr-1">Filter Domain:</span>
          {[
            { id: "all", label: "Semua Bidang" },
            { id: "matematika", label: "Matematika" },
            { id: "fisika", label: "Fisika" },
            { id: "kimia", label: "Kimia" },
            { id: "biologi", label: "Biologi" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSelectedDomain(tab.id)}
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
                  ? "bg-accent text-surface-raised"
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
                  ? "bg-accent text-surface-raised"
                  : "text-text-muted hover:text-text"
              }`}
            >
              Daftar Rapi
            </button>
          </div>
        </div>
      </div>

      {viewMode === "graph" ? (
        /* Interactive 2D SVG Graph Canvas */
        <div className="relative w-full rounded-2xl bg-surface-raised border border-border overflow-hidden p-2">
          {/* Legend Banner */}
          <div className="absolute top-4 left-4 z-10 flex flex-wrap items-center gap-3 text-[11px] p-2.5 rounded-xl bg-surface/90 backdrop-blur-md border border-border shadow-xs">
            <span className="font-semibold text-text">Legenda:</span>
            <span className="flex items-center gap-1.5 text-text">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
              Matematika
            </span>
            <span className="flex items-center gap-1.5 text-text">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-500"></span>
              Fisika
            </span>
            <span className="flex items-center gap-1.5 text-text">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              Kimia
            </span>
            <span className="flex items-center gap-1.5 text-text">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              Biologi
            </span>
            <span className="flex items-center gap-1.5 text-text-muted">
              <span className="w-3 border-t-2 border-dashed border-accent"></span>
              Koneksi Lintas Disiplin
            </span>
          </div>

          <svg
            viewBox="0 0 1000 650"
            className="w-full aspect-[16/10] select-none touch-pan-y"
            aria-label="Kanvas Graf Konsep Pengetahuan STEM Nalar"
          >
            <defs>
              <marker
                id="arrowhead-prereq"
                markerWidth="8"
                markerHeight="6"
                refX="18"
                refY="3"
                orient="auto"
              >
                <polygon points="0 0, 8 3, 0 6" fill="var(--color-border)" />
              </marker>
              <marker
                id="arrowhead-cross"
                markerWidth="8"
                markerHeight="6"
                refX="18"
                refY="3"
                orient="auto"
              >
                <polygon points="0 0, 8 3, 0 6" fill="var(--color-accent)" />
              </marker>
            </defs>

            {/* Background Cluster Zones */}
            <circle cx="220" cy="180" r="140" fill="rgba(99, 102, 241, 0.03)" stroke="rgba(99, 102, 241, 0.1)" strokeDasharray="4 4" />
            <circle cx="720" cy="180" r="140" fill="rgba(6, 182, 212, 0.03)" stroke="rgba(6, 182, 212, 0.1)" strokeDasharray="4 4" />
            <circle cx="300" cy="460" r="140" fill="rgba(245, 158, 11, 0.03)" stroke="rgba(245, 158, 11, 0.1)" strokeDasharray="4 4" />
            <circle cx="700" cy="460" r="140" fill="rgba(16, 185, 129, 0.03)" stroke="rgba(16, 185, 129, 0.1)" strokeDasharray="4 4" />

            {/* Cluster Domain Titles */}
            <text x="220" y="55" textAnchor="middle" fontSize="13" fontWeight="bold" fill="#6366f1" opacity="0.8">
              MATEMATIKA
            </text>
            <text x="720" y="55" textAnchor="middle" fontSize="13" fontWeight="bold" fill="#06b6d4" opacity="0.8">
              FISIKA MEKANIKA
            </text>
            <text x="300" y="605" textAnchor="middle" fontSize="13" fontWeight="bold" fill="#f59e0b" opacity="0.8">
              KIMIA DASAR
            </text>
            <text x="700" y="605" textAnchor="middle" fontSize="13" fontWeight="bold" fill="#10b981" opacity="0.8">
              BIOLOGI DASAR
            </text>

            {/* Edges */}
            {conceptEdges.map((edge) => {
              const src = nodePositions.get(edge.source);
              const tgt = nodePositions.get(edge.target);
              if (!src || !tgt) return null;

              const isCross = edge.relationship === "cross_domain";
              const isHighlighted =
                selectedNode &&
                (selectedNode.slug === edge.source || selectedNode.slug === edge.target);

              return (
                <g key={edge.id}>
                  <line
                    x1={src.x}
                    y1={src.y}
                    x2={tgt.x}
                    y2={tgt.y}
                    stroke={
                      isHighlighted
                        ? "var(--color-accent)"
                        : isCross
                        ? "var(--color-accent)"
                        : "var(--color-border)"
                    }
                    strokeWidth={isHighlighted ? 2.5 : isCross ? 1.5 : 1}
                    strokeDasharray={isCross ? "5 4" : undefined}
                    opacity={isHighlighted ? 1 : isCross ? 0.75 : 0.4}
                    markerEnd={isCross ? "url(#arrowhead-cross)" : "url(#arrowhead-prereq)"}
                  />
                  {isCross && (
                    <text
                      x={(src.x + tgt.x) / 2}
                      y={(src.y + tgt.y) / 2 - 4}
                      textAnchor="middle"
                      fontSize="9"
                      fill="var(--color-accent)"
                      fontWeight="bold"
                    >
                      {edge.label}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Nodes */}
            {filteredNodes.map((node) => {
              const pos = nodePositions.get(node.slug) ?? { x: 500, y: 300 };
              const colors = DOMAIN_COLORS[node.domainSlug] ?? DOMAIN_COLORS.matematika;
              const isSelected = selectedNode?.slug === node.slug;

              return (
                <g
                  key={node.id}
                  onClick={() => setSelectedNode(node)}
                  className="cursor-pointer transition-all hover:scale-105"
                  role="button"
                  tabIndex={0}
                  aria-label={`Konsep ${node.title}`}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      setSelectedNode(node);
                    }
                  }}
                >
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={isSelected ? 26 : 20}
                    fill="var(--color-surface)"
                    stroke={colors.glow}
                    strokeWidth={isSelected ? 3.5 : 2}
                    className="transition-all"
                  />
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={isSelected ? 20 : 15}
                    fill={colors.glow}
                    opacity={isSelected ? 0.3 : 0.15}
                  />
                  {/* Node Label */}
                  <text
                    x={pos.x}
                    y={pos.y + 32}
                    textAnchor="middle"
                    fontSize="10"
                    fontWeight={isSelected ? "bold" : "600"}
                    fill="var(--color-text)"
                    className="pointer-events-none select-none"
                  >
                    {node.title.length > 20 ? `${node.title.substring(0, 18)}...` : node.title}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Selected Node Details Modal / Drawer */}
          {selectedNode && (
            <div className="p-5 rounded-xl bg-surface border border-accent/40 shadow-lg mt-3 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-in fade-in">
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider bg-accent/10 text-accent">
                    {selectedNode.domainSlug}
                  </span>
                  <span className="text-xs text-text-muted">
                    {selectedNode.stepCount} Langkah Belajar • Tingkat: {selectedNode.difficulty}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-text">{selectedNode.title}</h3>
                <p className="text-xs text-text-muted max-w-2xl leading-relaxed">
                  {selectedNode.summary}
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <Link
                  href={`/learn/${selectedNode.slug}`}
                  className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-accent text-surface-raised hover:bg-accent-hover transition-colors shadow-sm"
                >
                  Mulai Pelajari Konsep →
                </Link>
                <button
                  type="button"
                  onClick={() => setSelectedNode(null)}
                  className="px-3 py-2.5 rounded-lg text-xs font-medium border border-border hover:bg-surface-raised text-text-muted"
                >
                  Tutup
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
