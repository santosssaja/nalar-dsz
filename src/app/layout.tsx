import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nalar — Belajar Sampai Paham",
  description:
    "Platform pembelajaran STEM interaktif yang berpusat pada pemahaman, intuisi visual, dan jalur adaptif.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="flex flex-col min-h-screen">
        <a href="#main-content" className="skip-to-content">
          Lewati ke konten utama
        </a>

        <header className="border-b border-border bg-surface-raised sticky top-0 z-30">
          <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <a
                href="/"
                className="font-bold text-xl tracking-tight flex items-center gap-2 hover:opacity-90"
              >
                <span className="w-8 h-8 rounded bg-accent text-surface-raised flex items-center justify-center font-bold text-base">
                  N
                </span>
                <span>Nalar</span>
              </a>
              <span className="hidden sm:inline text-xs text-text-muted border-l border-border pl-3">
                Belajar sampai tahu mengapa
              </span>
            </div>

            <nav className="flex items-center gap-4 text-sm" aria-label="Navigasi Utama">
              <a
                href="/domains"
                className="text-text-muted hover:text-text px-2 py-1 rounded transition-colors"
              >
                Kurikulum
              </a>
              <a
                href="/modules/turunan"
                className="text-text-muted hover:text-text px-2 py-1 rounded transition-colors"
              >
                Kalkulus Turunan
              </a>
              <div className="border-l border-border pl-4 flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-surface text-text-muted border border-border">
                  <span className="w-2 h-2 rounded-full bg-accent"></span>
                  Mode Tamu
                </span>
              </div>
            </nav>
          </div>
        </header>

        <main id="main-content" className="flex-1 max-w-6xl w-full mx-auto px-4 py-8">
          {children}
        </main>

        <footer className="border-t border-border py-6 text-xs text-text-muted bg-surface-raised">
          <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-3">
            <p>© {new Date().getFullYear()} Nalar — Akses terbuka, tanpa hambatan login.</p>
            <div className="flex items-center gap-4">
              <a href="/api/health" className="hover:underline">
                Status Sistem
              </a>
              <span>•</span>
              <span>Aksesibilitas WCAG 2.2 AA</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
