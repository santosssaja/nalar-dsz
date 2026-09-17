import React from "react";
import { getDomains, getModules } from "@/content/loader";

export default function DomainsPage() {
  const domains = getDomains();
  const allModules = getModules();

  return (
    <div className="space-y-8 py-4">
      <div>
        <span className="text-xs font-semibold text-accent uppercase tracking-wider">
          Peta Pengetahuan
        </span>
        <h1 className="text-3xl font-bold text-text mt-1">Kurikulum STEM Nalar</h1>
        <p className="text-sm text-text-muted mt-2 max-w-2xl">
          Kurikulum Nalar dirancang sebagai jaringan konsep yang saling terhubung. Pilih domain untuk melihat modul dan jalur pembelajaran yang tersedia.
        </p>
      </div>

      <div className="space-y-6">
        {domains.map((domain) => {
          const domainModules = allModules.filter((m) =>
            domain.moduleSlugs.includes(m.slug)
          );

          return (
            <div
              key={domain.id}
              className="p-6 rounded-2xl bg-surface-raised border border-border space-y-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-text">{domain.title}</h2>
                  <p className="text-xs text-text-muted mt-1">{domain.summary}</p>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-surface text-text border border-border">
                  {domainModules.length} Modul
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {domainModules.map((mod) => (
                  <a
                    key={mod.id}
                    href={`/modules/${mod.slug}`}
                    className="p-5 rounded-xl border border-border hover:border-accent bg-surface hover:bg-surface-raised transition-all group block space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-accent uppercase">
                        Modul Aktif
                      </span>
                      <span className="text-xs text-text-muted">
                        ± {Math.round(mod.estimatedMinutes / 60)} Jam
                      </span>
                    </div>

                    <h3 className="font-bold text-base text-text group-hover:text-accent transition-colors">
                      {mod.title}
                    </h3>

                    <p className="text-xs text-text-muted leading-relaxed line-clamp-2">
                      {mod.summary}
                    </p>

                    <div className="pt-2 flex items-center justify-between text-xs font-medium text-accent">
                      <span>Lihat Gambaran Modul →</span>
                      <span className="text-text-muted">
                        {mod.conceptSlugs.length} Konsep
                      </span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
