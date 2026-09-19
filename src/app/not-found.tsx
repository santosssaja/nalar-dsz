import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import {
  Compass,
  Home,
  LayoutDashboard,
  Network,
  FlaskConical,
  BookOpen,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { BackButton } from "@/components/ui/back-button";

export const metadata: Metadata = {
  title: "404 — Koordinat Belum Terpetakan | Nalar",
  description:
    "Halaman atau konsep pembelajaran yang Anda cari belum terpetakan di kurikulum Nalar.",
};

const FEATURED_MODULES = [
  {
    slug: "fondasi-matematika",
    title: "Fondasi Matematika",
    badge: "9 Konsep",
    domain: "Matematika",
    desc: "Bilangan, operasi aritmetika, pecahan, proporsi, hingga estimasi.",
    color: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
  },
  {
    slug: "turunan",
    title: "Kalkulus & Turunan",
    badge: "3 Konsep",
    domain: "Matematika",
    desc: "Intuisi perubahan dinamis, laju sesaat, dan batas limit formal.",
    color: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
  },
  {
    slug: "fisika-mekanika",
    title: "Fisika Mekanika",
    badge: "18 Konsep",
    domain: "Fisika",
    desc: "Vektor, kinematika 2D, dinamika Newton, kekekalan energi, dan osilasi.",
    color: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20",
  },
  {
    slug: "kimia-dasar",
    title: "Kimia Dasar",
    badge: "11 Konsep",
    domain: "Kimia",
    desc: "Model atom Bohr, konfigurasi kuantum, struktur Lewis, dan geometri molekul.",
    color: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  },
  {
    slug: "biologi-dasar",
    title: "Biologi Dasar",
    badge: "6 Konsep",
    domain: "Biologi",
    desc: "Struktur sel, skala hayati, dan daur bioenergetika fotosintesis/respirasi.",
    color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  },
];

export default function NotFound() {
  return (
    <div className="py-8 sm:py-12 space-y-12 max-w-4xl mx-auto">
      {/* Hero Section */}
      <section className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-surface-raised border border-border text-text-muted shadow-2xs">
          <Compass className="w-4 h-4 text-accent animate-spin-slow" />
          <span>Galat 404 • Koordinat Belum Terpetakan</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-text">
          Halaman atau Konsep Tidak Ditemukan
        </h1>

        <p className="text-sm sm:text-base text-text-muted max-w-xl mx-auto leading-relaxed">
          Tautan yang Anda tuju mungkin salah ketik, telah diperbarui, atau materi tersebut
          berada di luar jejaring kurikulum rilis saat ini.
        </p>

        {/* Primary Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <BackButton />

          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl bg-accent text-white hover:bg-accent-hover transition-all shadow-2xs"
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard Belajar</span>
          </Link>

          <Link
            href="/graph"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl border border-border bg-surface-raised hover:border-accent text-text hover:text-accent transition-all shadow-2xs"
          >
            <Network className="w-4 h-4" />
            <span>Graf Konsep (2D)</span>
          </Link>

          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl border border-border bg-surface hover:bg-surface-raised text-text-muted hover:text-text transition-all"
          >
            <Home className="w-4 h-4" />
            <span>Beranda</span>
          </Link>
        </div>
      </section>

      {/* Feature Navigation Cards */}
      <section aria-label="Gerbang Penjelajahan Alternatif" className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Nalar Lab */}
        <Link
          href="/lab"
          className="p-5 rounded-2xl bg-surface-raised border border-border hover:border-accent transition-all group flex items-start justify-between gap-4 shadow-2xs"
        >
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
                <FlaskConical className="w-4 h-4" />
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
                14 Stasiun Eksperimen
              </span>
            </div>
            <h2 className="text-sm font-bold text-text group-hover:text-accent transition-colors">
              Nalar Lab: Ruang Eksplorasi Interaktif
            </h2>
            <p className="text-xs text-text-muted leading-relaxed">
              Eksplorasi konsep kalkulus, fisika proyektil, dinamika Newton, atom Bohr, hingga sel secara visual.
            </p>
          </div>
          <ArrowRight className="w-4 h-4 text-text-muted group-hover:text-accent group-hover:translate-x-1 transition-all shrink-0 mt-2" />
        </Link>

        {/* Concept Graph */}
        <Link
          href="/graph"
          className="p-5 rounded-2xl bg-surface-raised border border-border hover:border-accent transition-all group flex items-start justify-between gap-4 shadow-2xs"
        >
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                <Network className="w-4 h-4" />
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">
                Jejaring 47 Konsep
              </span>
            </div>
            <h2 className="text-sm font-bold text-text group-hover:text-accent transition-colors">
              Peta Graf Konsep STEM Multidisiplin
            </h2>
            <p className="text-xs text-text-muted leading-relaxed">
              Temukan kembali posisi materi yang ingin Anda pelajari dan petakan prasyarat lintas disiplin ilmu.
            </p>
          </div>
          <ArrowRight className="w-4 h-4 text-text-muted group-hover:text-accent group-hover:translate-x-1 transition-all shrink-0 mt-2" />
        </Link>
      </section>

      {/* Direct Module Pathways */}
      <section aria-label="Modul Kurikulum Terkurasi" className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-accent" />
            <h2 className="text-sm font-bold text-text">
              Jelajahi Modul Kurikulum STEM Tersedia
            </h2>
          </div>
          <Link
            href="/domains"
            className="text-xs font-semibold text-accent hover:underline inline-flex items-center gap-1"
          >
            <span>Semua Domain</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {FEATURED_MODULES.map((mod) => (
            <Link
              key={mod.slug}
              href={`/modules/${mod.slug}`}
              className="p-4 rounded-xl bg-surface-raised border border-border hover:border-accent transition-all group flex flex-col justify-between gap-2 shadow-2xs"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded border ${mod.color}`}
                  >
                    {mod.domain}
                  </span>
                  <span className="text-[11px] text-text-muted font-medium">
                    {mod.badge}
                  </span>
                </div>
                <h3 className="text-xs font-bold text-text group-hover:text-accent transition-colors">
                  {mod.title}
                </h3>
                <p className="text-[11px] text-text-muted line-clamp-2 leading-relaxed">
                  {mod.desc}
                </p>
              </div>

              <div className="pt-2 flex items-center text-[11px] font-semibold text-accent gap-1 group-hover:underline">
                <span>Mulai Belajar</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Pedagogical Note / Reassurance */}
      <footer className="p-4 rounded-xl bg-surface-overlay border border-border text-center space-y-1">
        <div className="inline-flex items-center gap-1.5 text-xs font-medium text-text-muted">
          <Sparkles className="w-3.5 h-3.5 text-accent" />
          <span>Filosofi Nalar: Pemahaman Berkelanjutan</span>
        </div>
        <p className="text-xs text-text-muted max-w-md mx-auto">
          Belajar bukan tentang tidak pernah tersesat, melainkan membangun kembali peta mental
          dan menghubungkan satu intuisi dengan intuisi lainnya.
        </p>
      </footer>
    </div>
  );
}
