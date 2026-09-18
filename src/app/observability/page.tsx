import React from "react";
import {
  getDb,
  ensureDbInitialized,
  users,
  learnerDevices,
  attempts,
  learningEvidence,
  mistakeEvents,
  reviewQueue,
  contentVersions,
} from "@/server/db";
import { getConcepts, getModules } from "@/content/loader";
import { count, eq, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function ObservabilityDashboardPage() {
  await ensureDbInitialized();
  const db = getDb();

  const [
    usersCount,
    devicesCount,
    attemptsCount,
    evidenceCount,
    mistakesCount,
    pendingReviewsCount,
    versionsCount,
    recentVersions,
  ] = await Promise.all([
    db.select({ count: count() }).from(users),
    db.select({ count: count() }).from(learnerDevices),
    db.select({ count: count() }).from(attempts),
    db.select({ count: count() }).from(learningEvidence),
    db.select({ count: count() }).from(mistakeEvents),
    db
      .select({ count: count() })
      .from(reviewQueue)
      .where(eq(reviewQueue.state, "pending")),
    db.select({ count: count() }).from(contentVersions),
    db
      .select()
      .from(contentVersions)
      .orderBy(desc(contentVersions.publishedAt))
      .limit(10),
  ]);

  const concepts = getConcepts();
  const modules = getModules();

  const stats = {
    members: usersCount[0]?.count ?? 0,
    devices: devicesCount[0]?.count ?? 0,
    attempts: attemptsCount[0]?.count ?? 0,
    evidence: evidenceCount[0]?.count ?? 0,
    mistakes: mistakesCount[0]?.count ?? 0,
    pendingReviews: pendingReviewsCount[0]?.count ?? 0,
    versions: versionsCount[0]?.count ?? 0,
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto py-4">
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold bg-accent-muted text-accent">
          <span>Sistem & Audit</span>
          <span>•</span>
          <span>Observabilitas Platform</span>
        </div>
        <h1 className="text-3xl font-bold text-text">Dashboard Observabilitas</h1>
        <p className="text-sm text-text-muted">
          Metrik operasional, integritas database, antrean pengulangan memori, dan riwayat audit versi konten.
        </p>
      </div>

      {/* System Health Indicators */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-surface-raised border border-border space-y-1">
          <span className="text-xs text-text-muted">Status Engine</span>
          <div className="flex items-center gap-2 mt-1">
            <span className="w-2.5 h-2.5 rounded-full bg-success animate-pulse" />
            <span className="text-base font-bold text-text">Aktif Normal</span>
          </div>
          <span className="text-[11px] font-mono text-text-muted block">
            {process.env.DATABASE_URL ? "PostgreSQL Managed" : "PGlite In-Memory"}
          </span>
        </div>

        <div className="p-4 rounded-xl bg-surface-raised border border-border space-y-1">
          <span className="text-xs text-text-muted">Perangkat Terhubung</span>
          <div className="text-2xl font-bold text-text mt-1">{stats.devices}</div>
          <span className="text-[11px] text-text-muted block">
            {stats.members} Akun Terdaftar
          </span>
        </div>

        <div className="p-4 rounded-xl bg-surface-raised border border-border space-y-1">
          <span className="text-xs text-text-muted">Total Interaksi / Attempt</span>
          <div className="text-2xl font-bold text-accent mt-1">{stats.attempts}</div>
          <span className="text-[11px] text-text-muted block">
            {stats.evidence} Bukti Dimensi
          </span>
        </div>

        <div className="p-4 rounded-xl bg-surface-raised border border-border space-y-1">
          <span className="text-xs text-text-muted">Antrean Spaced Retrieval</span>
          <div className="text-2xl font-bold text-warning mt-1">{stats.pendingReviews}</div>
          <span className="text-[11px] text-text-muted block">
            {stats.mistakes} Pola Miskonsepsi
          </span>
        </div>
      </div>

      {/* Content Model Overview */}
      <div className="p-6 rounded-2xl bg-surface-raised border border-border space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-text">Inventaris Kurikulum Terkurasi</h2>
            <p className="text-xs text-text-muted">
              {modules.length} Modul Aktif • {concepts.length} Konsep Terpublikasi
            </p>
          </div>
          <span className="text-xs font-mono px-2.5 py-1 rounded bg-surface border border-border text-text-muted">
            {stats.versions} Versi Immutable
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          {concepts.map((c) => (
            <div
              key={c.id}
              className="p-3.5 rounded-xl bg-surface border border-border text-xs space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-text">{c.title}</span>
                <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-surface-raised border border-border">
                  {c.difficulty}
                </span>
              </div>
              <p className="text-text-muted line-clamp-2 text-[11px]">
                {c.summary}
              </p>
              <div className="flex items-center gap-2 text-[10px] text-text-muted pt-1 border-t border-border-subtle">
                <span>{c.steps.length} Langkah</span>
                <span>•</span>
                <span>{c.misconceptions.length} Miskonsepsi</span>
                {c.rubric && (
                  <>
                    <span>•</span>
                    <span className="text-accent font-semibold">Rubrik Aktif</span>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Version History & Audit Log */}
      <div className="p-6 rounded-2xl bg-surface-raised border border-border space-y-4">
        <div>
          <h2 className="text-base font-bold text-text">Riwayat Audit Versi Konten</h2>
          <p className="text-xs text-text-muted">
            Setiap perubahan konten menghasilkan checksum SHA-256 dan versi baru yang tidak mengubah attempt historis.
          </p>
        </div>

        {recentVersions.length === 0 ? (
          <div className="p-4 rounded-xl bg-surface border border-border text-xs text-text-muted text-center">
            Belum ada versi konten tambahan yang dipublikasikan melalui pipeline.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-border text-text-muted">
                  <th className="pb-2 font-semibold">Tipe</th>
                  <th className="pb-2 font-semibold">Versi</th>
                  <th className="pb-2 font-semibold">Checksum SHA-256</th>
                  <th className="pb-2 font-semibold">Waktu Publikasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {recentVersions.map((v) => (
                  <tr key={v.id} className="hover:bg-surface/50 transition-colors">
                    <td className="py-2.5 font-medium text-text capitalize">
                      {v.ownerType}
                    </td>
                    <td className="py-2.5 font-mono text-accent font-bold">
                      v{v.version}
                    </td>
                    <td className="py-2.5 font-mono text-[11px] text-text-muted max-w-xs truncate">
                      {v.checksum}
                    </td>
                    <td className="py-2.5 text-text-muted">
                      {new Date(v.publishedAt).toLocaleString("id-ID")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
