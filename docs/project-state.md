# Project State

## Snapshot saat ini

**Tanggal pembaruan:** 2026-09-19  
**Tahap:** Implementasi Penuh Ekosistem STEM Nalar (Concept Graph 2D, Prediction Engine, Teach Mode, AI Tutor Nai Multi-Provider, & 4 Domain Kurikulum STEM)  
**Source code aplikasi:** Next.js 15 App Router (TypeScript strict), Tailwind CSS + design tokens, Drizzle ORM PostgreSQL schema, adapter PGlite / in-memory, actor/device resolver (guest & member session, auto-persisted guest device key cookie, atomic concurrency-safe insertion), persistent zero-flash ThemeProvider dengan synchronous head script dan dynamic local-first sync, pemisah tema (Terang / Gelap) dengan opsi aksesibilitas Kontras Tinggi (High Contrast) mandiri berupa slide button toggle, NavHeader responsif dengan dynamic active-page highlighting via usePathname (Graf Konsep, Kurikulum, Nalar Lab, Observabilitas, Auth), single-page authentication (`/auth` dan modal) dengan tab switch Login/Register, verifikasi email sekali klik (magic link) via Google Gmail SMTP (`nodemailer`) dengan halaman verifikasi otomatis (`/auth/verify`), health check endpoint, content loader & schema Zod terpusat (`ContentRegistry` singleton):
- **4 Domain STEM Aktif:** Matematika, Fisika, Kimia, Biologi.
- **5 Modul Pembelajaran:** `fondasi-matematika` (3 konsep), `turunan` (3 konsep), `fisika-mekanika` (3 konsep), `kimia-dasar` (3 konsep), `biologi-dasar` (2 konsep).
- **14 Konsep Terkurasi Lengkap:** Menyelaraskan seluruh konsep di modul `turunan` (01 Perubahan, 02 Laju Perubahan, 03 Definisi Turunan) dengan standar pedoman kurikulum 6-tahap (`encounter` → `explore` → `predict` → `understand` → `practice` → `explain`), KaTeX, 4-layer hints (`orientation`, `concept`, `strategy`, `solution`), deteksi miskonsepsi eksplisit dengan trigger numerik dan distractor feedback, rubrik pedagogis berbasis kriteria semantik, serta teks aksesibilitas lengkap.
- **Concept Graph 2D Interaktif (`/graph`):** Visualisasi SVG interaktif jejaring konsep 4 domain, filter pencarian real-time, inspeksi node, koneksi prasyarat, dan cross-discipline knowledge links (contoh: Laju Perubahan Matematika ↔ Kinematika Fisika; Atom Kimia ↔ Tingkatan Organisasi Biologi) serta list view ramah screen reader.
- **Prediction Engine Tingkat Lanjut:** Pemilihan hipotesis kognitif, skala keyakinan kognitif (Eksploratif, Cukup Yakin, Sangat Yakin), formulasi alasan siswa, dan kartu komparasi mental model mismatch vs fakta empiris.
- **Mode Guru (Teach Mode):** Murid berperan sebagai guru yang mengajarkan konsep kepada murid virtual Nai, dievaluasi dengan rubrik AI / kriteria semantik.
- **AI Tutor Nai Multi-Provider & Real-time Stream Answer:** Dialog Sokratis & evaluasi mengajar dengan Google Gemma (default via `@google/generative-ai`), Google Gemini, OpenAI (`openai`), Anthropic Claude (`@anthropic-ai/sdk`), Ollama lokal (100% offline), serta fallback deterministik lokal kurasi offline tanpa memerlukan API key. Mendukung **real-time streaming jawaban** (SSE) dengan **collapsible reasoning/think block** (dapat di-hide dan di-unhide dengan tombol expand/collapse), typing cursor live, dan auto-scroll. Konfigurasi terpusat di server `.env.local` dan didokumentasikan lengkap di [`docs/llm-configuration.md`](./llm-configuration.md) serta [`.env.example`](../.env.example).
- **Nalar Lab Suite Multidisiplin 5-Wahana STEM (`/lab`):** Memperluas laboratorium interaktif dari yang semula hanya simulasi kalkulus menjadi rangkaian 5 wahana eksplorasi visual lintas domain: Kalkulus & Turunan (Matematika Lanjut), Garis Bilangan Interaktif (Fondasi Matematika), Vektor & Gaya 2D (Fisika Mekanika), Kinetika Partikel & Materi (Kimia Dasar), dan Skala Organisasi Hayati (Biologi Dasar). Masing-masing dilengkapi navigasi tab stasiun eksperimen, penjelas intuisi ilmiah, serta tautan langsung ke modul pembelajarannya.
- **Markdown & Math Rendering Berstandar Industri (`marked` + `katex`):** Menggantikan custom regex parser dengan library `marked` yang sepenuhnya mematuhi CommonMark & GitHub Flavored Markdown (GFM), mendukung nested formatting (contoh: `**titik acuan (*origin*)**`), ekstensi KaTeX display (`$$...$$`) & inline (`$...$`), custom renderer tema Nalar, serta zero-emoji UI design menggunakan `lucide-react`.
- **Optimalisasi Performa Navigasi & Client Routing (SPA + Loading Skeletons):** Menggantikan seluruh tag `<a>` internal lintas halaman (Home, Kurikulum, Modul, Concept Graph, Lesson Player, Lesson Summary, dan Footer) dengan Next.js `<Link>` yang mengaktifkan transisi client-side instan dan auto-prefetching viewport tanpa full-page browser reload. Menghadirkan loading skeleton terarah (`src/app/loading.tsx`, `modules/[slug]/loading.tsx`, `learn/[conceptSlug]/loading.tsx`) untuk umpan balik instan (<16ms), mengonsolidasi query database N+1 di halaman modul menjadi batch query (`getAllLearnerProgress`), serta mengaktifkan `optimizePackageImports` di `next.config.ts`.
- **Verifikasi Kualitas:** 24 test suite (82 tests) lulus 100%, TypeScript typecheck lulus tanpa error (`tsc --noEmit`), ESLint bersih (`eslint .`), dan production-ready.

## Target implementasi berikutnya

- Melanjutkan perluasan manipulatif visual interaktif untuk konsep lainnya (Pecahan & Desimal, Atom, Kinematika).
- Evaluasi telemetry performa pada hosting production cloud (misal Vercel / Railway / Cloudflare) bila akun cloud telah ditentukan.

## Scope yang sedang dikunci

- Kurikulum inti mencakup 4 pilar STEM: Matematika (Fondasi + Turunan), Fisika Mekanika, Kimia Dasar, dan Biologi Dasar.
- Google Gemma ditetapkan sebagai default provider untuk AI Tutor Nai, dengan kemampuan berganti model/provider (OpenAI, Claude, Gemini, Local Curated).
- Zero-friction guest learning: mulai belajar langsung tanpa login, auth opsional untuk sinkronisasi.
- Fallback deterministik bebas biaya: jika API key LLM tidak disediakan di environment, sistem AI Tutor tetap berfungsi dengan curated pedagogical engine.

## Hal yang belum diputuskan

| Keputusan | Status | Dampak |
| --- | --- | --- |
| Platform hosting serverless konkret | Open | Menentukan konfigurasi deployment dan adapter observability. |
| Provider PostgreSQL, auth, AI, dan analytics konkret | Open | Jangan mengunci SDK/provider sampai pengguna memilih atau proyek memiliki konfigurasi. |
| Formula final mastery dan jadwal decay | Open | Buat interface dan test behavior, jangan mengklaim formula ilmiah final. |
| Model authoring/backoffice | Deferred | Di luar MVP; content dapat berasal dari file tervalidasi. |

## Cara memperbarui dokumen ini

Perbarui snapshot ini setelah perubahan material: bootstrap selesai, provider dipilih, schema dibuat, milestone tercapai, atau keputusan open menjadi locked. Jangan mencatat detail tugas kecil atau status sementara yang cepat usang. Tambahkan keputusan ke `decisions.md`, bukan ke dokumen ini, jika keputusan tersebut perlu alasan dan riwayat.
