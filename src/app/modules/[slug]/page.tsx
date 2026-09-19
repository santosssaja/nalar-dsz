import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check } from "lucide-react";
import { getModuleBySlug, getConcepts } from "@/content/loader";
import { resolveActor } from "@/server/auth/actor-resolver";
import {
  getAllLearnerProgress,
  getMistakeSummaryForLearner,
} from "@/server/services/learning-service";
import { getNextRecommendation } from "@/server/services/recommendation-engine";
import { getDueReviews } from "@/server/services/retrieval-service";
import { RecommendationCard } from "@/features/learning/components/recommendation-card";
import { SpacedReviewBanner } from "@/features/learning/components/spaced-review-banner";
import { MistakeMap } from "@/features/learning/components/mistake-map";

export const dynamic = "force-dynamic";

export default async function ModuleOverviewPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const mod = getModuleBySlug(slug);

  if (!mod) {
    notFound();
  }

  const actor = await resolveActor();
  const allConcepts = getConcepts(slug);

  // Fetch progress, recommendations, due reviews, and mistakes in parallel with single consolidated query
  const [allProgress, recommendation, dueReviews, mistakes] = await Promise.all([
    getAllLearnerProgress(actor),
    getNextRecommendation(actor, slug),
    getDueReviews(actor),
    getMistakeSummaryForLearner(actor),
  ]);

  const progressMap = new Map(
    allProgress.map((item) => [
      item.conceptId,
      {
        ...item.dimensions,
        status: item.status,
      },
    ])
  );

  return (
    <div className="space-y-10 py-4 max-w-4xl mx-auto">
      {/* Module Header */}
      <div className="space-y-4">
        <Link
          href="/domains"
          className="text-xs font-semibold text-text-muted hover:text-text transition-colors flex items-center gap-1"
        >
          ← Kembali ke Kurikulum
        </Link>

        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold bg-accent-muted text-accent">
          <span>Modul Terkurasi</span>
          <span>•</span>
          <span>{mod.domainSlug.toUpperCase()}</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold text-text tracking-tight">
          {mod.title}
        </h1>

        <p className="text-base text-text-muted leading-relaxed">
          {mod.summary}
        </p>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
          <div className="p-4 rounded-xl bg-surface-raised border border-border">
            <span className="text-xs text-text-muted block">Jumlah Konsep</span>
            <span className="text-xl font-bold text-text mt-0.5 block">
              {mod.conceptSlugs.length} Konsep
            </span>
          </div>

          <div className="p-4 rounded-xl bg-surface-raised border border-border">
            <span className="text-xs text-text-muted block">Estimasi Durasi</span>
            <span className="text-xl font-bold text-text mt-0.5 block">
              ± {Math.round(mod.estimatedMinutes / 60)} Jam Belajar
            </span>
          </div>

          <div className="p-4 rounded-xl bg-surface-raised border border-border col-span-2 sm:col-span-1">
            <span className="text-xs text-text-muted block">Status Mode</span>
            <span className="text-xl font-bold text-accent mt-0.5 block">
              Tamu Aktif
            </span>
          </div>
        </div>
      </div>

      {/* Spaced Review Due Banner */}
      {dueReviews.length > 0 && (
        <SpacedReviewBanner dueReviews={dueReviews} />
      )}

      {/* Adaptive Recommendation Card */}
      <RecommendationCard recommendation={recommendation} />

      {/* Prerequisites Checklist */}
      <div className="p-6 rounded-2xl bg-surface-raised border border-border space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-text">Prasyarat Modul:</h2>
          {mod.prerequisites.length === 0 && (
            <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-success-muted text-success border border-success/30">
              Tanpa Prasyarat Khusus
            </span>
          )}
        </div>

        {mod.prerequisites.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {mod.prerequisites.map((prereq) => (
              <div
                key={prereq.slug}
                className="flex items-center gap-3 p-3 rounded-lg bg-surface border border-border text-xs"
              >
                <span className="w-5 h-5 rounded-full bg-accent/10 text-accent flex items-center justify-center font-bold">
                  <Check className="w-3 h-3" />
                </span>
                <div>
                  <span className="font-semibold text-text block">{prereq.title}</span>
                  <span className="text-text-muted text-[11px]">
                    {prereq.required ? "Prasyarat Wajib" : "Prasyarat Tambahan"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-surface border border-border-subtle flex items-start gap-3 text-xs">
            <span className="p-1 rounded-lg bg-success-muted text-success shrink-0 mt-0.5">
              <Check className="w-4 h-4" />
            </span>
            <div className="space-y-0.5">
              <p className="font-semibold text-text">
                Tidak ada prasyarat khusus untuk modul ini.
              </p>
              <p className="text-text-muted text-[11px] leading-relaxed">
                Modul ini dirancang sebagai titik awal fondasi pembelajaran. Kamu dapat langsung memulai materi tanpa perlu menuntaskan modul lain terlebih dahulu.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Learning Path Sequence */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-text">Peta Jalur Belajar</h2>
          <p className="text-xs text-text-muted mt-0.5">
            Ikuti perjalanan konsep secara bertahap atau buka langsung konsep yang ingin kamu dalami.
          </p>
        </div>

        <div className="space-y-4">
          {mod.learningPath.nodes.map((node, index) => {
            const concept = allConcepts.find((c) => c.slug === node.conceptSlug);
            if (!concept) return null;

            const progress = progressMap.get(concept.id);
            const status = progress?.status ?? "unstarted";

            const statusBadge =
              status === "mastered"
                ? { label: "Dikuasai", bg: "bg-success-muted text-success" }
                : status === "practiced"
                ? { label: "Praktik Selesai", bg: "bg-accent-muted text-accent" }
                : status === "learning"
                ? { label: "Sedang Dipelajari", bg: "bg-warning-muted text-warning" }
                : { label: "Belum Dimulai", bg: "bg-surface text-text-muted" };

            return (
              <div
                key={node.conceptSlug}
                className="p-6 rounded-2xl bg-surface-raised border border-border hover:border-accent transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-surface border border-border text-xs font-mono font-bold flex items-center justify-center text-text-muted">
                      {index + 1}
                    </span>
                    <span
                      className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border border-border-subtle ${statusBadge.bg}`}
                    >
                      {statusBadge.label}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-text">{concept.title}</h3>
                  <p className="text-xs text-text-muted leading-relaxed max-w-xl">
                    {concept.summary}
                  </p>

                  <div className="flex items-center gap-3 text-xs text-text-muted pt-1">
                    <span>{concept.steps.length} Langkah Belajar</span>
                    <span>•</span>
                    <span className="capitalize">Tingkat: {concept.difficulty}</span>
                  </div>
                </div>

                <div className="self-start sm:self-center shrink-0">
                  <Link
                    href={`/learn/${concept.slug}`}
                    className="inline-flex items-center px-5 py-2.5 rounded-lg text-sm font-medium bg-accent text-surface-raised hover:bg-accent-hover transition-colors shadow-sm"
                  >
                    {status === "unstarted" ? "Mulai Konsep →" : "Lanjutkan Belajar →"}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mistake Map & Remedial Section */}
      <div className="pt-4 border-t border-border">
        <MistakeMap mistakes={mistakes} />
      </div>
    </div>
  );
}
