import React from "react";
import Link from "next/link";
import {
  FlaskConical,
  Network,
  Compass,
  ArrowRight,
  Sparkles,
  Layers,
  BookOpen,
  Atom,
  Activity,
  CheckCircle2,
  Cpu,
  BarChart3,
  SlidersHorizontal,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="space-y-12 sm:space-y-16 pt-0 mt-0 pb-6">
      {/* Figma Visual Background Layers (Thin Circles & Ambient Glows Node 16:10) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1440px] h-[900px] pointer-events-none -z-10 overflow-hidden">
        <img
          src="/figma-assets/hero-bg-blur.svg"
          alt=""
          className="absolute top-0 left-[-191px] w-[1821px] h-[935px] max-w-none opacity-80"
        />
        <img
          src="/figma-assets/hero-bg-pattern.svg"
          alt=""
          className="absolute top-[80px] right-[40px] w-[414px] h-[414px] max-w-none opacity-70"
        />
        <img
          src="/figma-assets/hero-bg-pattern.svg"
          alt=""
          className="absolute top-[120px] left-[-7px] w-[414px] h-[414px] max-w-none opacity-60"
        />
        <img
          src="/figma-assets/hero-bg-lines.svg"
          alt=""
          className="absolute top-[100px] left-[63px] w-[1212px] h-[535px] max-w-none opacity-70"
        />
      </div>

      {/* Hero Section — Figma Node 16:10 Desktop 2-Column Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-0 pb-4 relative z-10">
        {/* Left Column: Headline, Subtext & ALL 3 Primary Action Buttons (Badge Removed) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-[-0.5px] text-[#101828] dark:text-text leading-[1.12]">
              Belajar bukan hanya sampai bisa menjawab.{" "}
              <span className="text-[#20b486] block mt-1">
                Belajar sampai tahu mengapa ini bekerja.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-[#646464] dark:text-text-muted leading-[1.8] font-normal max-w-2xl">
              Nalar mentransformasi pendidikan sains dan matematika menjadi penjelajahan interaktif:
              manipulasi parameter visual seketika, temukan relasi antarilmu dalam graf konsep 2D,
              dan asah pemikiran mendalam bersama tutor Sokratis Nai.
            </p>
          </div>

          {/* ALL 3 Primary Action Buttons (100% In Tact & Exact Wording) */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href="/lab"
              className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-lg font-semibold bg-[#20b486] text-white hover:bg-[#1a906b] transition-all shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05),0px_0px_0px_4px_#f4ebff] focus:outline-none focus:ring-2 focus:ring-[#1a906b]"
            >
              <FlaskConical className="w-4 h-4" />
              <span>Buka Nalar Lab (14 Stasiun)</span>
              <ArrowRight className="w-4 h-4 ml-0.5" />
            </Link>
            <Link
              href="/graph"
              className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-lg font-semibold bg-[#eafff9] text-[#3bc49a] border border-[#eafff9] hover:bg-[#d8f8ee] transition-colors shadow-xs"
            >
              <Network className="w-4 h-4 text-[#3bc49a]" />
              <span>Peta Graf Konsep STEM</span>
            </Link>
            <Link
              href="/domains"
              className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-lg font-medium bg-white border border-border hover:bg-surface text-text transition-colors shadow-xs"
            >
              <Compass className="w-4 h-4 text-[#20b486]" />
              <span>Jelajahi 4 Domain</span>
            </Link>
          </div>
        </div>

        {/* Right Column: Hero Main Illustration PNG + 3 Visual Floating Cards Melayang di Sekeliling Panda (Figma Node 16:10) */}
        <div className="lg:col-span-5 relative flex flex-col items-center justify-center -mt-4 sm:-mt-8 pt-0 lg:pt-0">
          {/* Card 1: 47 Konsep Terkurasi (Kiri Atas Pojok) */}
          <div className="absolute -top-8 -left-6 sm:-left-14 z-20 hidden sm:flex items-center gap-3 p-3.5 rounded-[18.36px] bg-[#f5f5f4] dark:bg-surface-raised border border-[#20b486]/70 shadow-[0px_18.36px_19.125px_rgba(0,0,0,0.12)] backdrop-blur-xs transition-transform hover:-translate-y-1">
            <div className="w-10 h-10 rounded-[12.24px] bg-[#20b486] p-2 flex items-center justify-center shrink-0 shadow-xs">
              <img src="/figma-assets/icon-online-education.svg" alt="" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="text-xl font-bold text-[#101828] dark:text-text leading-tight">47</div>
              <div className="text-[11px] font-normal opacity-70 text-[#101828] dark:text-text">Konsep Terkurasi</div>
            </div>
          </div>

          {/* Card 2: AI Tutor NAI (Kanan Atas Pojok) */}
          <div className="absolute -top-6 -right-6 sm:-right-12 z-20 hidden sm:flex items-center gap-3 p-3.5 rounded-[18.36px] bg-[#f5f5f4] dark:bg-surface-raised border border-[#20b486]/70 shadow-[0px_18.36px_19.125px_rgba(0,0,0,0.12)] backdrop-blur-xs transition-transform hover:-translate-y-1">
            <div className="w-10 h-10 rounded-[12.24px] bg-[#20b486] p-2 flex items-center justify-center shrink-0 shadow-xs">
              <img src="/figma-assets/chip-briefcase.svg" alt="" className="w-full h-full object-contain invert brightness-0" />
            </div>
            <div>
              <div className="text-sm font-bold text-[#101828] dark:text-text leading-tight">AI Tutor NAI</div>
              <div className="text-[11px] font-normal opacity-70 text-[#101828] dark:text-text">Bimbingan Sokratis</div>
            </div>
          </div>

          {/* Figma Main Hero Illustration (Panda Image with Background Circle SVG) */}
          <div className="relative w-full max-w-[440px] aspect-square flex items-center justify-center">
            {/* Background Decorative Thin Circle SVG right behind Panda */}
            <img
              src="/figma-assets/hero-bg-pattern.svg"
              alt=""
              className="absolute inset-0 w-full h-full object-contain scale-125 opacity-80 pointer-events-none -z-10"
            />
            <img
              src="/figma-assets/hero-illustration.png"
              alt="Nalar STEM Learning Illustration"
              className="w-full h-full object-contain drop-shadow-md rounded-2xl relative z-10"
            />
          </div>

          {/* Card 3: 14 Station Lab (Kanan Bawah Pojok) */}
          <div className="absolute -bottom-8 -right-4 sm:-right-10 z-20 hidden sm:flex items-center gap-3 p-3.5 rounded-[18.36px] bg-[#f5f5f4] dark:bg-surface-raised border border-[#20b486]/70 shadow-[0px_18.36px_19.125px_rgba(0,0,0,0.12)] backdrop-blur-xs transition-transform hover:-translate-y-1">
            <div className="w-10 h-10 rounded-[12.24px] bg-[#20b486] p-2 flex items-center justify-center shrink-0 shadow-xs">
              <img src="/figma-assets/icon-board.svg" alt="" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="text-[11px] font-normal opacity-70 text-[#101828] dark:text-text">Station Lab</div>
              <div className="text-xl font-bold text-[#101828] dark:text-text leading-tight">14</div>
            </div>
          </div>

          {/* Mobile Fallback Grid for Floating Stat Cards */}
          <div className="w-full grid grid-cols-1 sm:hidden gap-3 mt-4">
            <div className="p-3.5 rounded-[18.36px] bg-[#f5f5f4] dark:bg-surface-raised border border-[#20b486]/70 shadow-[0px_18.36px_19.125px_rgba(0,0,0,0.12)] flex items-center gap-3">
              <div className="w-10 h-10 rounded-[12.24px] bg-[#20b486] p-2 flex items-center justify-center shrink-0">
                <img src="/figma-assets/icon-online-education.svg" alt="" className="w-full h-full object-contain" />
              </div>
              <div>
                <div className="text-xl font-bold text-[#101828] dark:text-text">47</div>
                <div className="text-[11px] font-normal opacity-70 text-[#101828] dark:text-text">Konsep Terkurasi</div>
              </div>
            </div>

            <div className="p-3.5 rounded-[18.36px] bg-[#f5f5f4] dark:bg-surface-raised border border-[#20b486]/70 shadow-[0px_18.36px_19.125px_rgba(0,0,0,0.12)] flex items-center gap-3">
              <div className="w-10 h-10 rounded-[12.24px] bg-[#20b486] p-2 flex items-center justify-center shrink-0">
                <img src="/figma-assets/chip-briefcase.svg" alt="" className="w-full h-full object-contain invert brightness-0" />
              </div>
              <div>
                <div className="text-sm font-bold text-[#101828] dark:text-text">AI Tutor NAI</div>
                <div className="text-[11px] font-normal opacity-70 text-[#101828] dark:text-text">Bimbingan Sokratis</div>
              </div>
            </div>

            <div className="p-3.5 rounded-[18.36px] bg-[#f5f5f4] dark:bg-surface-raised border border-[#20b486]/70 shadow-[0px_18.36px_19.125px_rgba(0,0,0,0.12)] flex items-center gap-3">
              <div className="w-10 h-10 rounded-[12.24px] bg-[#20b486] p-2 flex items-center justify-center shrink-0">
                <img src="/figma-assets/icon-board.svg" alt="" className="w-full h-full object-contain" />
              </div>
              <div>
                <div className="text-xl font-bold text-[#101828] dark:text-text">14</div>
                <div className="text-[11px] font-normal opacity-70 text-[#101828] dark:text-text">Station Lab</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Showcase Pillar 1: Nalar Lab */}
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-accent uppercase tracking-wider">
              <FlaskConical className="w-4 h-4" />
              <span>Pilar Simulasi Interaktif</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-text mt-1">
              Nalar Lab: Geser Parameter, Saksikan Alam Bekerja
            </h2>
            <p className="text-sm text-text-muted max-w-2xl mt-2 leading-relaxed">
              Alih-alih menghafal rumus pasif, Nalar Lab mengajakmu menggerakkan slider, mengamati titik singgung kalkulus,
              menembakkan proyektil fisika, mengeksplorasi kulit elektron Bohr, hingga melacak daur ATP biologi secara langsung.
            </p>
          </div>
          <Link
            href="/lab"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent hover:underline self-start md:self-auto shrink-0"
          >
            Lihat Seluruh 14 Stasiun Lab →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/lab"
            className="p-5 rounded-xl bg-surface-raised border border-border hover:border-accent transition-all group flex flex-col justify-between gap-3 shadow-xs"
          >
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                Kalkulus & Turunan
              </span>
              <h3 className="font-bold text-base text-text group-hover:text-accent transition-colors">
                Garis Sekan ke Garis Singgung
              </h3>
              <p className="text-xs text-text-muted leading-relaxed line-clamp-2">
                Gerakkan jarak Δx mendekati 0 dan amati bagaimana garis pemotong berubah mulus menjadi laju sesaat.
              </p>
            </div>
            <div className="text-xs font-semibold text-accent flex items-center gap-1 pt-2 border-t border-border-subtle">
              <span>Coba Simulasi</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            href="/lab"
            className="p-5 rounded-xl bg-surface-raised border border-border hover:border-accent transition-all group flex flex-col justify-between gap-3 shadow-xs"
          >
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
                Fisika Mekanika
              </span>
              <h3 className="font-bold text-base text-text group-hover:text-accent transition-colors">
                Kinematika Parabola 2D
              </h3>
              <p className="text-xs text-text-muted leading-relaxed line-clamp-2">
                Eksplorasi sudut elevasi dan kecepatan awal untuk membuktikan sudut optimal 45° menghasilkan jarak terjauh.
              </p>
            </div>
            <div className="text-xs font-semibold text-accent flex items-center gap-1 pt-2 border-t border-border-subtle">
              <span>Coba Simulasi</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            href="/lab"
            className="p-5 rounded-xl bg-surface-raised border border-border hover:border-accent transition-all group flex flex-col justify-between gap-3 shadow-xs"
          >
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
                Kimia Dasar
              </span>
              <h3 className="font-bold text-base text-text group-hover:text-accent transition-colors">
                Model Atom Bohr & Kuantum
              </h3>
              <p className="text-xs text-text-muted leading-relaxed line-clamp-2">
                Pelajari susunan orbital elektron 2n², loncatan foton emisi, dan tren keelektronegatifan unsur periodik.
              </p>
            </div>
            <div className="text-xs font-semibold text-accent flex items-center gap-1 pt-2 border-t border-border-subtle">
              <span>Coba Simulasi</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            href="/lab"
            className="p-5 rounded-xl bg-surface-raised border border-border hover:border-accent transition-all group flex flex-col justify-between gap-3 shadow-xs"
          >
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                Biologi Dasar
              </span>
              <h3 className="font-bold text-base text-text group-hover:text-accent transition-colors">
                Daur Bioenergetika Fotosintesis & ATP
              </h3>
              <p className="text-xs text-text-muted leading-relaxed line-clamp-2">
                Atur intensitas cahaya matahari dan kadar CO₂ untuk melihat efisiensi produksi glukosa dan daur ulang ATP.
              </p>
            </div>
            <div className="text-xs font-semibold text-accent flex items-center gap-1 pt-2 border-t border-border-subtle">
              <span>Coba Simulasi</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </section>

      {/* Interactive Showcase Pillar 2: Concept Graph 2D */}
      <section className="p-8 rounded-2xl bg-surface-raised border border-border space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-accent uppercase tracking-wider">
              <Network className="w-4 h-4" />
              <span>Peta Pengetahuan Holistik</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-text mt-1">
              Concept Graph 2D: Keterhubungan Antardisiplin STEM
            </h2>
          </div>
          <Link
            href="/graph"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold bg-accent text-surface-raised hover:bg-accent-hover transition-colors shadow-xs self-start md:self-auto"
          >
            <span>Buka Kanvas Graf 2D</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <p className="text-sm text-text-muted leading-relaxed max-w-3xl">
          Sains tidak pernah terisolasi. Di Nalar, konsep <em>Laju Perubahan</em> di Matematika terhubung langsung ke
          <em> Kinematika</em> dan <em>Osilasi</em> di Fisika; <em>Pengukuran Besaran</em> menjadi fondasi <em>Wujud Materi</em> di Kimia;
          dan <em>Ikatan Kovalen Kimia</em> menyusun <em>Makromolekul Kehidupan</em> di Biologi.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-surface border border-border-subtle space-y-1.5">
            <div className="font-semibold text-sm text-text flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-accent"></span>
              Jalinan Pengetahuan Lintas Disiplin
            </div>
            <p className="text-xs text-text-muted leading-relaxed">
              Jembatan relasi visual yang memperlihatkan bagaimana satu rumus matematika diterapkan ke fenomena fisika, kimia, dan biologi.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-surface border border-border-subtle space-y-1.5">
            <div className="font-semibold text-sm text-text flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-accent"></span>
              Fokus Domain Tanpa Tabrakan Node
            </div>
            <p className="text-xs text-text-muted leading-relaxed">
              Navigasi bersih dengan filter per bidang, zoom adaptif, label bebas benturan, dan iluminasi relasi prasyarat instan.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-surface border border-border-subtle space-y-1.5">
            <div className="font-semibold text-sm text-text flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-accent"></span>
              Aksesibilitas Ganda (Graf 2D & Daftar Rapi)
            </div>
            <p className="text-xs text-text-muted leading-relaxed">
              Beralih dalam satu klik antara visual kanvas graf interaktif dan tampilan daftar linier yang ramah pembaca layar.
            </p>
          </div>
        </div>
      </section>

      {/* Interactive Showcase Pillar 3 & 4: AI Tutor Nai & Mastery Engine */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Tutor Nai */}
        <div className="p-7 rounded-2xl bg-surface-raised border border-border space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-accent uppercase tracking-wider">
              <Cpu className="w-4 h-4" />
              <span>Pedagogi Cerdas</span>
            </div>
            <h3 className="text-2xl font-bold text-text">
              Nai: Tutor Sokratis yang Menuntun, Bukan Menyuapi
            </h3>
            <p className="text-sm text-text-muted leading-relaxed">
              AI edukasi konvensional seringkali langsung memberikan jawaban akhir, mematikan proses berpikir analitis siswa.
              Nai dirancang berbeda: bertindak sebagai pendamping Sokratis yang menanyakan pertanyaan pemandu bertahap,
              menemukan akar kekeliruan konsep, dan menantang siswa menjelaskan kembali pemahamannya di <strong>Mode Guru (Teach Mode)</strong>.
            </p>
            <div className="space-y-2 pt-2 text-xs text-text-muted">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-accent shrink-0" />
                <span>Multi-provider fleksibel: Google Gemma (default), OpenAI, Claude, dan kurasi lokal</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-accent shrink-0" />
                <span>Streaming respon waktu nyata dengan transparansi proses penalaran</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-accent shrink-0" />
                <span>Mesin fallback deterministik tetap berjalan aktif tanpa biaya kuota API</span>
              </div>
            </div>
          </div>
          <div className="pt-4 border-t border-border-subtle">
            <Link
              href="/modules/turunan"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent hover:underline"
            >
              Coba Dialog Bersama Nai di Modul Turunan →
            </Link>
          </div>
        </div>

        {/* 6-Stage Cognitive Journey & Mastery Engine */}
        <div className="p-7 rounded-2xl bg-surface-raised border border-border space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-accent uppercase tracking-wider">
              <BarChart3 className="w-4 h-4" />
              <span>Standar Penguasaan Sejati</span>
            </div>
            <h3 className="text-2xl font-bold text-text">
              Siklus 6 Tahap Kognitif & Mastery 6 Dimensi
            </h3>
            <p className="text-sm text-text-muted leading-relaxed">
              Nalar menolak asumsi bahwa sekadar menonton video atau menyelesaikan kuis pilihan ganda adalah tanda penguasaan materi.
              Setiap konsep mematuhi alur kurikulum ketat:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 text-xs">
              <div className="p-2.5 rounded-lg bg-surface border border-border-subtle">
                <span className="font-bold text-accent block">1. Encounter</span>
                <span className="text-[11px] text-text-muted">Fenomena dunia nyata</span>
              </div>
              <div className="p-2.5 rounded-lg bg-surface border border-border-subtle">
                <span className="font-bold text-accent block">2. Explore</span>
                <span className="text-[11px] text-text-muted">Manipulasi visual</span>
              </div>
              <div className="p-2.5 rounded-lg bg-surface border border-border-subtle">
                <span className="font-bold text-accent block">3. Predict</span>
                <span className="text-[11px] text-text-muted">Uji hipotesis awal</span>
              </div>
              <div className="p-2.5 rounded-lg bg-surface border border-border-subtle">
                <span className="font-bold text-accent block">4. Understand</span>
                <span className="text-[11px] text-text-muted">Formulasi teori</span>
              </div>
              <div className="p-2.5 rounded-lg bg-surface border border-border-subtle">
                <span className="font-bold text-accent block">5. Practice</span>
                <span className="text-[11px] text-text-muted">Tantangan aplikatif</span>
              </div>
              <div className="p-2.5 rounded-lg bg-surface border border-border-subtle">
                <span className="font-bold text-accent block">6. Explain</span>
                <span className="text-[11px] text-text-muted">Jelaskan kembali</span>
              </div>
            </div>
          </div>
          <div className="pt-4 border-t border-border-subtle text-xs text-text-muted flex items-center justify-between">
            <span>Didukung 4-Layer Adaptive Hint (Orientation → Concept → Strategy → Solution)</span>
          </div>
        </div>
      </section>

      {/* 4 STEM Domains Catalog */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-accent uppercase tracking-wider">
              Kurikulum Lengkap
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-text mt-1">
              4 Domain Inti Semesta Pembelajaran Nalar
            </h2>
          </div>
          <Link
            href="/domains"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent hover:underline self-start sm:self-auto"
          >
            Lihat Detail Silabus Semua Modul →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Matematika */}
          <div className="p-6 rounded-2xl bg-surface-raised border border-border hover:border-indigo-500/50 transition-all space-y-4 flex flex-col justify-between">
            <div className="space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-lg text-text">Fondasi Matematika & Kalkulus</h3>
              <p className="text-xs text-text-muted leading-relaxed">
                Dari garis bilangan, proporsi, persentase, dan eksponensial hingga laju perubahan diferensial dan definisi turunan.
              </p>
            </div>
            <div className="space-y-2 pt-3 border-t border-border-subtle">
              <div className="flex items-center justify-between text-xs text-text-muted">
                <span>12 Konsep Terkurasi</span>
                <span className="font-semibold text-indigo-500">2 Modul</span>
              </div>
              <Link
                href="/domains/matematika"
                className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Buka Domain Matematika →
              </Link>
            </div>
          </div>

          {/* Fisika */}
          <div className="p-6 rounded-2xl bg-surface-raised border border-border hover:border-cyan-500/50 transition-all space-y-4 flex flex-col justify-between">
            <div className="space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center font-bold">
                <Activity className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-lg text-text">Fisika Mekanika Klasik</h3>
              <p className="text-xs text-text-muted leading-relaxed">
                Kinematika gerak parabola & melingkar, dinamika hukum Newton, gaya gesek, usaha energi, rotasi, gravitasi, dan osilasi harmonik.
              </p>
            </div>
            <div className="space-y-2 pt-3 border-t border-border-subtle">
              <div className="flex items-center justify-between text-xs text-text-muted">
                <span>18 Konsep Terkurasi</span>
                <span className="font-semibold text-cyan-500">1 Modul Utama</span>
              </div>
              <Link
                href="/domains/fisika"
                className="inline-flex items-center gap-1 text-xs font-bold text-cyan-600 dark:text-cyan-400 hover:underline"
              >
                Buka Domain Fisika →
              </Link>
            </div>
          </div>

          {/* Kimia */}
          <div className="p-6 rounded-2xl bg-surface-raised border border-border hover:border-amber-500/50 transition-all space-y-4 flex flex-col justify-between">
            <div className="space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                <Atom className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-lg text-text">Kimia Dasar & Kuantum</h3>
              <p className="text-xs text-text-muted leading-relaxed">
                Struktur partikel atomik, tabel periodik, konfigurasi elektron Aufbau, bilangan kuantum Schrödinger, ikatan kimia, dan geometri VSEPR 3D.
              </p>
            </div>
            <div className="space-y-2 pt-3 border-t border-border-subtle">
              <div className="flex items-center justify-between text-xs text-text-muted">
                <span>11 Konsep Terkurasi</span>
                <span className="font-semibold text-amber-500">1 Modul Utama</span>
              </div>
              <Link
                href="/domains/kimia"
                className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline"
              >
                Buka Domain Kimia →
              </Link>
            </div>
          </div>

          {/* Biologi */}
          <div className="p-6 rounded-2xl bg-surface-raised border border-border hover:border-emerald-500/50 transition-all space-y-4 flex flex-col justify-between">
            <div className="space-y-2.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-lg text-text">Biologi Dasar & Sistem Sel</h3>
              <p className="text-xs text-text-muted leading-relaxed">
                Ciri organisme hidup, hierarki organisasi biologis, metodologi ilmiah, komparasi sitologi sel, biomolekul, dan bioenergetika fotosintesis-ATP.
              </p>
            </div>
            <div className="space-y-2 pt-3 border-t border-border-subtle">
              <div className="flex items-center justify-between text-xs text-text-muted">
                <span>6 Konsep Terkurasi</span>
                <span className="font-semibold text-emerald-500">1 Modul Utama</span>
              </div>
              <Link
                href="/domains/biologi"
                className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                Buka Domain Biologi →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Pedagogical Principles Section */}
      <section className="border-t border-border pt-12">
        <h2 className="text-xl font-bold mb-8 text-text">
          Tiga Komitmen Arsitektur Belajar Nalar
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-xl bg-surface-raised border border-border space-y-3">
            <div className="w-10 h-10 rounded-lg bg-accent-muted text-accent flex items-center justify-center font-bold">
              1
            </div>
            <h3 className="font-semibold text-lg text-text">Active Before Passive</h3>
            <p className="text-sm text-text-muted leading-relaxed">
              Siswa membuat prediksi dan memanipulasi simulasi visual sebelum rumus formal diperkenalkan.
              Pemahaman dibangun dari pengalaman empiris.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-surface-raised border border-border space-y-3">
            <div className="w-10 h-10 rounded-lg bg-accent-muted text-accent flex items-center justify-center font-bold">
              2
            </div>
            <h3 className="font-semibold text-lg text-text">Evidence-Based Mastery</h3>
            <p className="text-sm text-text-muted leading-relaxed">
              Mengukur 6 dimensi pemahaman nyata: understanding, practice, application, transfer, explanation, dan retention.
              Bukan sekadar centang selesai atau streak palsu.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-surface-raised border border-border space-y-3">
            <div className="w-10 h-10 rounded-lg bg-accent-muted text-accent flex items-center justify-center font-bold">
              3
            </div>
            <h3 className="font-semibold text-lg text-text">Adaptive Mistake Map</h3>
            <p className="text-sm text-text-muted leading-relaxed">
              Mengenali pola kesalahan konseptual secara semantik untuk memberikan remedial dan petunjuk bertingkat
              tanpa mempermalukan atau menghukum siswa.
            </p>
          </div>
        </div>
      </section>

      {/* Bottom Showcase CTA Banner */}
      <section className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-surface-raised to-surface border border-accent/30 text-center space-y-6 shadow-sm">
        <div className="max-w-2xl mx-auto space-y-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-accent/10 text-accent">
            Mulai Seketika
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-text tracking-tight">
            Siap Menemukan Kembali Cara Belajar STEM?
          </h2>
          <p className="text-sm sm:text-base text-text-muted leading-relaxed">
            Tanpa perlu mengisi form pendaftaran atau mengingat kata sandi di awal.
            Eksplorasi simulasi interaktif sekarang juga dan simpan progres belajarmu secara lokal.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <Link
            href="/lab"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold bg-accent text-surface-raised hover:bg-accent-hover transition-all shadow-sm"
          >
            <FlaskConical className="w-4 h-4" />
            <span>Mulai di Nalar Lab</span>
          </Link>
          <Link
            href="/graph"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-medium bg-surface border border-border hover:bg-surface-raised text-text transition-colors"
          >
            <Network className="w-4 h-4 text-accent" />
            <span>Jelajahi Graf Konsep</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
