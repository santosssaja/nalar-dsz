import type { Metadata } from "next";
import "./globals.css";
import { NavHeader } from "@/components/layout/nav-header";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { AiModelProvider } from "@/features/learning/context/ai-model-context";

export const metadata: Metadata = {
  title: "Nalar — Belajar Sampai Paham",
  description:
    "Platform pembelajaran STEM interaktif yang berpusat pada pemahaman, intuisi visual, dan jalur adaptif.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
  },
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
      <body className="flex flex-col min-h-screen overflow-x-hidden">
        <ThemeProvider />
        <AiModelProvider>
          <a href="#main-content" className="skip-to-content">
            Lewati ke konten utama
          </a>

          <NavHeader />

          <main id="main-content" className="flex-1 max-w-6xl w-full mx-auto px-4 py-2 sm:py-3 md:py-4">
            {children}
          </main>

          <footer className="border-t border-border py-6 text-xs text-text-muted bg-surface-raised">
            <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-3 text-center sm:text-left">
              <p>© {new Date().getFullYear()} Nalar — Platform Pembelajaran STEM Berbasis Pemahaman &amp; Intuisi.</p>
              <div className="flex flex-wrap items-center justify-center sm:justify-end gap-x-3 gap-y-1 text-text-muted">
              </div>
            </div>
          </footer>
        </AiModelProvider>
      </body>
    </html>
  );
}
