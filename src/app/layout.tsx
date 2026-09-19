import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { NavHeader } from "@/components/layout/nav-header";
import { ThemeProvider } from "@/components/theme/theme-provider";

export const metadata: Metadata = {
  title: "Nalar — Belajar Sampai Paham",
  description:
    "Platform pembelajaran STEM interaktif yang berpusat pada pemahaman, intuisi visual, dan jalur adaptif.",
};

const THEME_SCRIPT = `
(function() {
  try {
    var t = localStorage.getItem('nalar_theme');
    if (!t) {
      var match = document.cookie.match(/nalar_theme=([^;]+)/);
      if (match) t = match[1];
    }
    if (t === 'dark') {
      document.documentElement.classList.add('dark');
    }

    var c = localStorage.getItem('nalar_high_contrast');
    if (!c) {
      var matchC = document.cookie.match(/nalar_high_contrast=([^;]+)/);
      if (matchC) c = matchC[1];
    }
    if (c === 'true' || t === 'contrast') {
      document.documentElement.classList.add('high-contrast');
    }

    var m = localStorage.getItem('nalar_reduced_motion');
    if (m === 'true') {
      document.documentElement.classList.add('reduced-motion');
    }
    var f = localStorage.getItem('nalar_font_scale');
    if (f === 'large') {
      document.documentElement.classList.add('font-scale-large');
    } else if (f === 'small') {
      document.documentElement.classList.add('font-scale-small');
    }
  } catch(e) {}
})();
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className="flex flex-col min-h-screen">
        <ThemeProvider />
        <a href="#main-content" className="skip-to-content">
          Lewati ke konten utama
        </a>

        <NavHeader />

        <main id="main-content" className="flex-1 max-w-6xl w-full mx-auto px-4 py-4 sm:py-6">
          {children}
        </main>

        <footer className="border-t border-border py-6 text-xs text-text-muted bg-surface-raised">
          <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-3">
            <p>© {new Date().getFullYear()} Nalar — Akses terbuka, tanpa hambatan login.</p>
            <div className="flex items-center gap-4">
              <Link href="/lab" className="hover:underline text-accent">
                Nalar Lab
              </Link>
              <span>•</span>
              <Link href="/observability" className="hover:underline">
                Observabilitas & Audit
              </Link>
              <span>•</span>
              <a href="/api/health" className="hover:underline" target="_blank" rel="noopener noreferrer">
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
