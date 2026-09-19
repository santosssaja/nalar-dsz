"use client";

import React, { useState } from "react";
import { MoveRight, ShieldAlert, Sparkles } from "lucide-react";
import { MathRenderer } from "@/components/ui/katex-math";

export function NewtonDynamicsPlayground() {
  const [mass, setMass] = useState<number>(5); // kg
  const [appliedForce, setAppliedForce] = useState<number>(25); // N
  const [muS, setMuS] = useState<number>(0.4); // static friction coeff
  const [muK, setMuK] = useState<number>(0.25); // kinetic friction coeff

  const g = 9.8;
  const normalForce = mass * g;
  const maxStaticFriction = muS * normalForce;
  const kineticFriction = muK * normalForce;

  const isMoving = appliedForce > maxStaticFriction;
  const frictionForce = isMoving ? kineticFriction : Math.min(appliedForce, maxStaticFriction);
  const netForce = isMoving ? appliedForce - kineticFriction : 0;
  const acceleration = isMoving ? netForce / mass : 0;

  return (
    <div className="space-y-5 p-4 sm:p-6 rounded-2xl bg-surface border border-border">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border-subtle pb-3">
        <div>
          <h4 className="text-sm font-bold text-text flex items-center gap-2">
            <MoveRight className="w-4 h-4 text-accent" />
            <span>Laboratorium Dinamika Newton &amp; Gesekan: &Sigma;F = ma</span>
          </h4>
          <p className="text-xs text-text-muted mt-0.5">
            Amati ambang batas gesekan statis maksimum sebelum balok mulai meluncur dan hukum percepatan Newton berlaku.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono">
          <span
            className={`px-2.5 py-1 rounded-md font-bold ${
              isMoving
                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                : "bg-amber-500/15 text-amber-600 dark:text-amber-400"
            }`}
          >
            {isMoving ? `Bergerak (a = ${acceleration.toFixed(2)} m/s²)` : "Diam (Kesetimbangan Statis)"}
          </span>
        </div>
      </div>

      {/* Control Sliders */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-surface-raised p-4 rounded-xl border border-border">
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-medium text-text">
            <span>Gaya Tarik (F):</span>
            <span className="font-mono font-bold text-accent">{appliedForce} N</span>
          </div>
          <input
            type="range"
            min="0"
            max="60"
            step="1"
            value={appliedForce}
            onChange={(e) => setAppliedForce(parseInt(e.target.value, 10))}
            className="w-full accent-accent cursor-pointer"
            aria-label="Atur gaya dorong atau tarik F"
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-medium text-text">
            <span>Massa Benda (m):</span>
            <span className="font-mono font-bold text-text">{mass} kg</span>
          </div>
          <input
            type="range"
            min="2"
            max="10"
            step="1"
            value={mass}
            onChange={(e) => setMass(parseInt(e.target.value, 10))}
            className="w-full accent-indigo-500 cursor-pointer"
            aria-label="Atur massa benda m"
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-medium text-text">
            <span>Koefisien Gesek Statis (&mu;&#8347;):</span>
            <span className="font-mono font-bold text-amber-600 dark:text-amber-400">{muS.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min="0.1"
            max="0.8"
            step="0.05"
            value={muS}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              setMuS(val);
              if (muK > val) setMuK(parseFloat((val * 0.7).toFixed(2)));
            }}
            className="w-full accent-amber-500 cursor-pointer"
            aria-label="Atur koefisien gesek statis mu_s"
          />
        </div>
      </div>

      {/* Free Body Diagram SVG Canvas */}
      <div className="w-full aspect-[2/1] max-h-[220px] bg-surface-raised rounded-xl border border-border relative overflow-hidden flex items-center justify-center p-3">
        <svg
          viewBox="0 0 450 200"
          className="w-full h-full select-none"
          role="img"
          aria-label={`Diagram benda bebas balok massa ${mass} kg dengan gaya tarik ${appliedForce} N dan gaya gesek ${frictionForce.toFixed(1)} N`}
        >
          {/* Surface line */}
          <line x1="30" y1="140" x2="420" y2="140" stroke="var(--color-border)" strokeWidth="2.5" />

          {/* Block (Center around x=225, y=90, width=80, height=50) */}
          <rect
            x="185"
            y="90"
            width="80"
            height="50"
            rx="4"
            className="fill-accent/20 stroke-accent stroke-2"
          />
          <text
            x="225"
            y="120"
            textAnchor="middle"
            fontSize="12"
            fontWeight="bold"
            className="fill-text font-mono"
          >
            {mass} kg
          </text>

          {/* Normal Force N (upwards from center) */}
          <line x1="225" y1="90" x2="225" y2="35" stroke="var(--color-success)" strokeWidth="2" markerEnd="url(#arrow-green)" />
          <text x="233" y="45" fontSize="10" fontWeight="bold" fill="var(--color-success)">
            N = {normalForce.toFixed(0)} N
          </text>

          {/* Gravity Force W (downwards from center) */}
          <line x1="225" y1="140" x2="225" y2="185" stroke="var(--color-text-muted)" strokeWidth="2" />
          <text x="233" y="180" fontSize="10" fontWeight="bold" fill="var(--color-text-muted)">
            W = mg = {normalForce.toFixed(0)} N
          </text>

          {/* Applied Force F (rightwards) */}
          {appliedForce > 0 && (
            <>
              <line
                x1="265"
                y1="115"
                x2={265 + Math.min(130, appliedForce * 2.2)}
                y2="115"
                stroke="var(--color-accent)"
                strokeWidth="2.5"
              />
              <text
                x={275 + Math.min(130, appliedForce * 2.2)}
                y="118"
                fontSize="11"
                fontWeight="bold"
                fill="var(--color-accent)"
              >
                F = {appliedForce} N
              </text>
            </>
          )}

          {/* Friction Force f (leftwards) */}
          {frictionForce > 0 && (
            <>
              <line
                x1="185"
                y1="138"
                x2={185 - Math.min(120, frictionForce * 2.2)}
                y2="138"
                stroke="var(--color-danger)"
                strokeWidth="2.5"
              />
              <text
                x={140 - Math.min(120, frictionForce * 2.2)}
                y="142"
                fontSize="11"
                fontWeight="bold"
                fill="var(--color-danger)"
              >
                f = {frictionForce.toFixed(1)} N
              </text>
            </>
          )}
        </svg>
      </div>

      {/* Force Balance Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xl bg-surface-raised border border-border text-xs">
        <div>
          <span className="text-text-muted block">Ambang Statis (<MathRenderer inline content="$f_{s,\max}$" />):</span>
          <span className="font-mono font-bold text-amber-600 dark:text-amber-400">{maxStaticFriction.toFixed(1)} N</span>
        </div>
        <div>
          <span className="text-text-muted block">Gesekan Kinetik (<MathRenderer inline content="$f_k$" />):</span>
          <span className="font-mono font-bold text-danger">{kineticFriction.toFixed(1)} N</span>
        </div>
        <div>
          <span className="text-text-muted block">Gaya Bersih (<MathRenderer inline content="$\Sigma F_x$" />):</span>
          <span className="font-mono font-bold text-accent">{netForce.toFixed(1)} N</span>
        </div>
        <div>
          <span className="text-text-muted block">Percepatan (<MathRenderer inline content="$a = \Sigma F / m$" />):</span>
          <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{acceleration.toFixed(2)} m/s²</span>
        </div>
      </div>

      {/* Analytical Reasoning Card */}
      <div className="p-4 rounded-xl bg-surface-raised border border-border text-xs space-y-2">
        <div className="font-bold text-text text-sm flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-accent" />
          <span>Konsep Dasar Hukum Newton &amp; Gesekan:</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-text-muted leading-relaxed">
          <div className="p-3 rounded-lg bg-surface border border-border-subtle space-y-1">
            <span className="font-semibold text-text block">1. Mengapa Benda Sulit Mulai Bergerak tapi Mudah Dilanjutkan?</span>
            <p>
              Koefisien gesek statis selalu lebih besar daripada koefisien kinetik (<MathRenderer inline content={`$\\mu_s > \\mu_k$`} />). Kamu membutuhkan gaya awal <MathRenderer inline content={`$F > ${maxStaticFriction.toFixed(1)}\\text{ N}$`} /> untuk memecah ikatan mikro-permukaan, namun setelah meluncur, gesekan langsung turun ke <MathRenderer inline content={`$${kineticFriction.toFixed(1)}\\text{ N}$`} />.
            </p>
          </div>
          <div className="p-3 rounded-lg bg-surface border border-border-subtle space-y-1">
            <span className="font-semibold text-text block">2. Hukum II Newton (&Sigma;F = ma):</span>
            <p>
              Percepatan balok tidak ditentukan oleh besarnya gaya tarik semata, melainkan oleh gaya bersih hasil resultan tarik dikurangi hambatan gesekan: <MathRenderer inline content={`$a = \\frac{F - f_k}{m}$`} />.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
