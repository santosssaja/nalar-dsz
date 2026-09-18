# Project State

## Snapshot saat ini

**Tanggal pembaruan:** 2026-09-18  
**Tahap:** Tahap 4 — Scale content dengan aman selesai (Seluruh Milestone MVP Selesai) + Single Page Auth, Zero-Flash Theme, High-Contrast Slide Toggle, Active Nav Highlight & Race-Condition Safe Actor Resolver  
**Source code aplikasi:** Next.js 15 App Router (TypeScript strict), Tailwind CSS + design tokens, Drizzle ORM PostgreSQL schema, adapter PGlite / in-memory, actor/device resolver (guest & member session, auto-persisted guest device key cookie, concurrency-safe atomic insertion with ON CONFLICT DO NOTHING dan 23505 duplicate key fallback), persistent zero-flash ThemeProvider dengan synchronous head script dan dynamic local-first sync, pemisah tema (Terang / Gelap) dengan opsi aksesibilitas Kontras Tinggi (High Contrast) mandiri berupa slide button toggle, NavHeader responsif dengan dynamic active-page highlighting via usePathname (Kurikulum, Kalkulus Turunan, Nalar Lab, Mode Tamu/Auth), single-page authentication (`/auth` dan modal) dengan tab switch Login/Register, verifikasi email sekali klik (magic link) via Google Gmail SMTP (`nodemailer`) dengan halaman verifikasi otomatis (`/auth/verify`), health check endpoint, content loader & schema Zod, modul terkurasi Turunan (3 konsep, 13 steps, prasyarat Limit), lesson player interaktif, hint drawer 4-layer, deterministic evaluator, 6-dimension mastery engine, mistake events aggregator & visualizer (MistakeMap), spaced retrieval review queue (`/api/v1/progress/review`), adaptive recommendation engine (`/api/v1/learning/next`), IndexedDB outbox wrapper untuk offline-first learning (`/api/v1/sync`), content publishing pipeline dengan audit checksum SHA-256 dan DAG cycle validation, dashboard observabilitas metrik platform (`/observability`), dan Nalar Lab (`/lab`). Seluruh test suite (22 files, 55 tests), ESLint, dan production build Next.js (30 routes) lolos 100%.

## Target implementasi berikutnya

Seluruh target dari [delivery-plan.md](./delivery-plan.md) (Tahap 0 hingga Tahap 4) telah berhasil diselesaikan secara utuh:
- Deployment preview dan CI/CD setup ke infrastruktur cloud production jika provider telah ditentukan oleh pengguna.
- Penambahan domain sains lain (Fisika / Biologi) menggunakan authoring pipeline yang telah teruji.

## Scope yang sedang dikunci

- MVP membuktikan loop belajar adaptif pada satu modul terkurasi: Matematika → Kalkulus → Turunan.
- Pengguna dapat mulai sebagai guest; login bersifat opsional untuk backup/sinkronisasi.
- Konten, rubric, evaluator terstruktur, dan hint dasar adalah authored content versioned.
- Nai adalah bantuan terbatas berbasis context/rubric terkurasi dengan fallback non-AI.

## Hal yang belum diputuskan

| Keputusan | Status | Dampak |
| --- | --- | --- |
| Platform hosting serverless konkret | Open | Menentukan konfigurasi deployment dan adapter observability. |
| Provider PostgreSQL, auth, AI, dan analytics konkret | Open | Jangan mengunci SDK/provider sampai pengguna memilih atau proyek memiliki konfigurasi. |
| Formula final mastery dan jadwal decay | Open | Buat interface dan test behavior, jangan mengklaim formula ilmiah final. |
| Model authoring/backoffice | Deferred | Di luar MVP; content dapat berasal dari file tervalidasi. |

## Cara memperbarui dokumen ini

Perbarui snapshot ini setelah perubahan material: bootstrap selesai, provider dipilih, schema dibuat, milestone tercapai, atau keputusan open menjadi locked. Jangan mencatat detail tugas kecil atau status sementara yang cepat usang. Tambahkan keputusan ke `decisions.md`, bukan ke dokumen ini, jika keputusan tersebut perlu alasan dan riwayat.
