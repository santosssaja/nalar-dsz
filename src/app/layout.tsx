import type { Metadata } from "next";
import "./globals.css";
import { NavHeader } from "@/components/layout/nav-header";

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

        <NavHeader />

        <main id="main-content" className="flex-1 max-w-6xl w-full mx-auto px-4 py-8">
          {children}
        </main>

        <footer className="border-t border-border py-6 text-xs text-text-muted bg-surface-raised">
          <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-3">
            <p>© {new Date().getFullYear()} Nalar — Akses terbuka, tanpa hambatan login.</p>
            <div className="flex items-center gap-4">
              <a href="/lab" className="hover:underline text-accent">
                Nalar Lab
              </a>
              <span>•</span>
              <a href="/observability" className="hover:underline">
                Observabilitas & Audit
              </a>
              <span>•</span>
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
