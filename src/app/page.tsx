export default function HomePage() {
  return (
    <div className="space-y-16 py-6">
      {/* Hero Section */}
      <section className="space-y-6 max-w-3xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-accent-muted text-accent">
          <span>Tersedia Langsung</span>
          <span>•</span>
          <span>Tanpa Login di Awal</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-text leading-tight">
          Belajar bukan hanya sampai bisa menjawab.{" "}
          <span className="text-accent underline decoration-accent/30 decoration-wavy">
            Belajar sampai tahu mengapa ini bekerja.
          </span>
        </h1>

        <p className="text-lg text-text-muted leading-relaxed">
          Nalar adalah platform pembelajaran STEM interaktif yang berpusat pada
          intuisi, eksplorasi parameter, penalaran, dan pemahaman yang bertahan.
        </p>

        <div className="flex flex-wrap items-center gap-4 pt-2">
          <a
            href="/modules/turunan"
            className="inline-flex items-center justify-center px-6 py-3 rounded-lg font-medium bg-accent text-surface-raised hover:bg-accent-hover transition-colors shadow-sm"
          >
            Mulai Modul Turunan →
          </a>
          <a
            href="/domains"
            className="inline-flex items-center justify-center px-6 py-3 rounded-lg font-medium bg-surface-raised border border-border hover:bg-surface text-text transition-colors"
          >
            Jelajahi Peta Kurikulum
          </a>
        </div>
      </section>

      {/* Principles Section */}
      <section className="border-t border-border pt-12">
        <h2 className="text-xl font-bold mb-8 text-text">
          Arsitektur Pembelajaran Nalar
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-xl bg-surface-raised border border-border space-y-3">
            <div className="w-10 h-10 rounded-lg bg-accent-muted text-accent flex items-center justify-center font-bold">
              1
            </div>
            <h3 className="font-semibold text-lg text-text">Active Before Passive</h3>
            <p className="text-sm text-text-muted leading-relaxed">
              Buat prediksi dan manipulasi visual sebelum rumus formal atau
              jawaban akhir diperkenalkan.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-surface-raised border border-border space-y-3">
            <div className="w-10 h-10 rounded-lg bg-accent-muted text-accent flex items-center justify-center font-bold">
              2
            </div>
            <h3 className="font-semibold text-lg text-text">Evidence-Based Mastery</h3>
            <p className="text-sm text-text-muted leading-relaxed">
              Mengukur 6 dimensi pemahaman nyata: understanding, practice,
              application, transfer, explanation, dan retention.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-surface-raised border border-border space-y-3">
            <div className="w-10 h-10 rounded-lg bg-accent-muted text-accent flex items-center justify-center font-bold">
              3
            </div>
            <h3 className="font-semibold text-lg text-text">Adaptive Mistake Map</h3>
            <p className="text-sm text-text-muted leading-relaxed">
              Mengenali pola kesalahan konseptual untuk memberikan remedial dan
              hint terarah tanpa menghukum.
            </p>
          </div>
        </div>
      </section>

      {/* Curated Vertical Slice Preview */}
      <section className="p-8 rounded-2xl bg-surface-raised border border-border space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold text-accent uppercase tracking-wider">
              Modul Pilihan MVP
            </span>
            <h2 className="text-2xl font-bold text-text mt-1">Kalkulus: Turunan</h2>
          </div>
          <a
            href="/modules/turunan"
            className="inline-flex items-center gap-2 text-sm font-medium text-accent hover:underline self-start sm:self-auto"
          >
            Buka Gambaran Modul →
          </a>
        </div>

        <p className="text-sm text-text-muted max-w-2xl">
          Jelajahi bagaimana laju perubahan sesaat dibangun dari laju rata-rata,
          secant line yang mendekati garis singgung (tangent), hingga aturan
          turunan formal dan aplikasi kontekstual.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center pt-2">
          <div className="p-4 rounded-lg bg-surface border border-border-subtle">
            <div className="text-2xl font-bold text-text">3</div>
            <div className="text-xs text-text-muted mt-1">Konsep Inti</div>
          </div>
          <div className="p-4 rounded-lg bg-surface border border-border-subtle">
            <div className="text-2xl font-bold text-text">12</div>
            <div className="text-xs text-text-muted mt-1">Langkah Belajar</div>
          </div>
          <div className="p-4 rounded-lg bg-surface border border-border-subtle">
            <div className="text-2xl font-bold text-text">4 Layer</div>
            <div className="text-xs text-text-muted mt-1">Adaptive Hint</div>
          </div>
          <div className="p-4 rounded-lg bg-surface border border-border-subtle">
            <div className="text-2xl font-bold text-text">6 Dimensi</div>
            <div className="text-xs text-text-muted mt-1">Mastery Engine</div>
          </div>
        </div>
      </section>
    </div>
  );
}
