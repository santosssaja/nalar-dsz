"use client";

import React, { useState } from "react";
import { Compass, Lightbulb } from "lucide-react";

export function VectorPlayground() {
  const [magA, setMagA] = useState<number>(4);
  const [magB, setMagB] = useState<number>(3);
  const [angleDeg, setAngleDeg] = useState<number>(90);

  const angleRad = (angleDeg * Math.PI) / 180;

  // Vector A along X-axis: (Ax, Ay) = (magA, 0)
  // Vector B at angle theta: (Bx, By) = (magB * cos(theta), magB * sin(theta))
  // Resultant R = (Ax + Bx, Ay + By)
  const Ax = magA;
  const Ay = 0;
  const Bx = magB * Math.cos(angleRad);
  const By = magB * Math.sin(angleRad);

  const Rx = Ax + Bx;
  const Ry = Ay + By;
  const resultMag = Math.sqrt(Rx * Rx + Ry * Ry);

  // SVG coordinate transform: origin (ox, oy) = (100, 180)
  // Scale: 1 unit = 25 pixels
  const ox = 120;
  const oy = 180;
  const scale = 26;

  const toSvg = (x: number, y: number) => ({
    x: ox + x * scale,
    y: oy - y * scale, // SVG Y is inverted
  });

  const ptA = toSvg(Ax, Ay);
  const ptB = toSvg(Bx, By);
  const ptR = toSvg(Rx, Ry);

  return (
    <div className="space-y-5 p-4 sm:p-6 rounded-2xl bg-surface border border-border">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border-subtle pb-3">
        <div>
          <h4 className="text-sm font-bold text-text flex items-center gap-2">
            <Compass className="w-4 h-4 text-accent" />
            <span>Laboratorium Vektor 2D: Pengaruh Sudut terhadap Resultan</span>
          </h4>
          <p className="text-xs text-text-muted mt-0.5">
            Ubah besar vektor dan sudut arah untuk melihat langsung bagaimana dua gaya bersatu secara geometris.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="px-2.5 py-1 rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold">
            Resultan |R| = {resultMag.toFixed(2)} N
          </span>
        </div>
      </div>

      {/* Control Sliders */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-surface-raised p-4 rounded-xl border border-border">
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-medium text-text">
            <span>Vektor A:</span>
            <span className="font-mono font-bold text-accent">{magA} N</span>
          </div>
          <input
            type="range"
            min="1"
            max="8"
            step="1"
            value={magA}
            onChange={(e) => setMagA(parseInt(e.target.value, 10))}
            className="w-full accent-accent cursor-pointer"
            aria-label="Atur besar vektor A"
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-medium text-text">
            <span>Vektor B:</span>
            <span className="font-mono font-bold text-amber-500">{magB} N</span>
          </div>
          <input
            type="range"
            min="1"
            max="8"
            step="1"
            value={magB}
            onChange={(e) => setMagB(parseInt(e.target.value, 10))}
            className="w-full accent-amber-500 cursor-pointer"
            aria-label="Atur besar vektor B"
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-medium text-text">
            <span>Sudut Antara (θ):</span>
            <span className="font-mono font-bold text-text">{angleDeg}°</span>
          </div>
          <input
            type="range"
            min="0"
            max="180"
            step="5"
            value={angleDeg}
            onChange={(e) => setAngleDeg(parseInt(e.target.value, 10))}
            className="w-full accent-text cursor-pointer"
            aria-label="Atur sudut antara kedua vektor"
          />
        </div>
      </div>

      {/* Presets */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-text-muted font-medium">Uji Cepat Kondisi Khusus:</span>
        <button
          type="button"
          onClick={() => {
            setMagA(5);
            setMagB(5);
            setAngleDeg(0);
          }}
          className="px-2.5 py-1 rounded-md text-xs font-medium bg-surface border border-border hover:border-accent text-text"
        >
          Searah (0° → Maks 10 N)
        </button>
        <button
          type="button"
          onClick={() => {
            setMagA(4);
            setMagB(3);
            setAngleDeg(90);
          }}
          className="px-2.5 py-1 rounded-md text-xs font-medium bg-surface border border-border hover:border-accent text-text"
        >
          Tegak Lurus (90° → Pythagoras 5 N)
        </button>
        <button
          type="button"
          onClick={() => {
            setMagA(5);
            setMagB(5);
            setAngleDeg(180);
          }}
          className="px-2.5 py-1 rounded-md text-xs font-medium bg-surface border border-border hover:border-accent text-text"
        >
          Berlawanan (180° → Min 0 N)
        </button>
      </div>

      {/* SVG Canvas 2D Vector */}
      <div className="overflow-x-auto bg-surface-raised/60 p-4 rounded-xl border border-border flex justify-center">
        <svg
          viewBox="0 0 540 260"
          className="w-full max-w-[540px] h-auto select-none"
          role="img"
          aria-label="Diagram geometris vektor A, vektor B, dan vektor resultan R"
        >
          <defs>
            <marker id="arrow-a" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
              <path d="M 0 1 L 7 4 L 0 7 z" className="fill-accent" />
            </marker>
            <marker id="arrow-b" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
              <path d="M 0 1 L 7 4 L 0 7 z" className="fill-amber-500" />
            </marker>
            <marker id="arrow-r" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto">
              <path d="M 0 1 L 9 5 L 0 9 z" className="fill-emerald-500" />
            </marker>
          </defs>

          {/* Grid lines */}
          <line x1="20" y1={oy} x2="520" y2={oy} stroke="currentColor" strokeWidth="1" className="text-border-subtle" />
          <line x1={ox} y1="20" x2={ox} y2="240" stroke="currentColor" strokeWidth="1" className="text-border-subtle" />

          {/* Parallelogram dashed helper lines */}
          {angleDeg !== 0 && angleDeg !== 180 && (
            <g stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" className="text-text-muted/40">
              <line x1={ptA.x} y1={ptA.y} x2={ptR.x} y2={ptR.y} />
              <line x1={ptB.x} y1={ptB.y} x2={ptR.x} y2={ptR.y} />
            </g>
          )}

          {/* Vector A (Horizontal) */}
          <line
            x1={ox}
            y1={oy}
            x2={ptA.x}
            y2={ptA.y}
            stroke="currentColor"
            strokeWidth="3"
            markerEnd="url(#arrow-a)"
            className="text-accent"
          />
          <text x={ptA.x - 10} y={ptA.y + 20} fontSize="11" fontWeight="bold" className="fill-accent">
            A = {magA} N
          </text>

          {/* Vector B */}
          <line
            x1={ox}
            y1={oy}
            x2={ptB.x}
            y2={ptB.y}
            stroke="currentColor"
            strokeWidth="3"
            markerEnd="url(#arrow-b)"
            className="text-amber-500"
          />
          <text x={ptB.x + 8} y={ptB.y - 8} fontSize="11" fontWeight="bold" className="fill-amber-500">
            B = {magB} N
          </text>

          {/* Resultant Vector R */}
          {resultMag > 0.1 && (
            <line
              x1={ox}
              y1={oy}
              x2={ptR.x}
              y2={ptR.y}
              stroke="currentColor"
              strokeWidth="4"
              markerEnd="url(#arrow-r)"
              className="text-emerald-500"
            />
          )}
          <text
            x={ptR.x + 10}
            y={ptR.y + 15}
            fontSize="12"
            fontWeight="bold"
            className="fill-emerald-600 dark:fill-emerald-400"
          >
            R = {resultMag.toFixed(2)} N
          </text>

          {/* Origin Marker */}
          <circle cx={ox} cy={oy} r="4" className="fill-text" />
          <text x={ox - 15} y={oy + 15} fontSize="10" className="fill-text-muted">
            (0,0)
          </text>
        </svg>
      </div>

      {/* Analytical Explanation */}
      <div className="p-4 rounded-xl bg-surface-raised border border-border text-xs space-y-2 leading-relaxed">
        <span className="font-bold text-text text-sm flex items-center gap-1.5">
          <Lightbulb className="w-4 h-4 text-accent shrink-0" />
          <span>Mengapa Vektor Bukan Penjumlahan Biasa?</span>
        </span>
        <p className="text-text-muted">
          Jika kamu menjumlahkan uang $4$ ribu rupiah dan $3$ ribu rupiah (besaran skalar), hasilnya <strong>selalu $7$ ribu rupiah</strong>.
        </p>
        <p className="text-text-muted">
          Namun untuk vektor gaya: dua gaya 4 N dan 3 N yang bekerja bersamaan menghasilkan gaya total antara <strong>1 N hingga 7 N</strong> tergantung sudut &theta;.
          Karena pada &theta; = 90&deg;, gaya saling tegak lurus membentuk segitiga siku-siku sehingga resultannya adalah hipotenusa Pythagoras:
          <span className="font-mono font-bold text-text block my-1">
            R = √(4² + 3²) = √(16 + 9) = √25 = 5 Newton
          </span>
        </p>
      </div>
    </div>
  );
}
