# Tech Stack

## Keputusan utama

Nalar memakai **Next.js App Router dengan TypeScript** yang dideploy sebagai aplikasi serverless. Rendering server dipakai untuk katalog dan konten publik; interaksi lesson memakai Client Components seminimal mungkin.

| Layer | Pilihan | Alasan |
| --- | --- | --- |
| Web | Next.js App Router, React, TypeScript strict | Routing, SSR/streaming, server actions/route handlers, dan type safety dalam satu aplikasi. |
| Hosting | Vercel atau platform serverless kompatibel Next.js | CDN untuk content publik dan scale-to-zero untuk API/AI. Konfigurasi deployment harus portable. |
| Database | PostgreSQL serverless | Relasi kurikulum kuat, transaksi, constraint, dan query progress. |
| ORM/query | Drizzle ORM + migration SQL | Skema dekat dengan SQL, typing, dan migrasi eksplisit. |
| Auth | Auth.js atau provider OIDC yang kompatibel | Login opsional dengan session server-side dan provider dapat diganti. |
| Validasi | Zod | Schema request, env, content configuration, dan response boundary. |
| Cache/rate limit | Upstash Redis atau KV kompatibel | Rate limit AI, cache rekomendasi pendek, dan idempotency key. |
| Client local-first | IndexedDB melalui wrapper kecil | Menyimpan guest identity, preferences, cached content, serta outbox sync. |
| Styling | Tailwind CSS + CSS variables + komponen headless aksesibel | Token konsisten dan UI kecil tanpa desain SaaS generik. |
| Konten matematika | MDX/JSON tervalidasi + KaTeX | Konten dikurasi, rendering aman, dan formula konsisten. |
| AI | Provider AI melalui server adapter | Multi-provider (Gemma, Gemini, OpenAI, Claude, Curated). Lihat [llm-configuration.md](./llm-configuration.md). |
| Observability | Structured logs, error tracking, product analytics privacy-aware | Mendiagnosis error dan mengukur meaningful mastery. |
| Testing | Vitest, React Testing Library, Playwright, axe | Unit, component, end-to-end, dan aksesibilitas otomatis. |

## Versi dan batas runtime

- Gunakan Node.js LTS yang didukung oleh versi Next.js proyek.
- Pin dependency melalui lockfile. Jangan memakai versi floating untuk dependency produksi.
- Route yang memakai driver database, SDK auth, atau SDK AI memakai Node runtime. Edge hanya dipakai setelah dependency dan observability diverifikasi kompatibel.
- Semua secret divalidasi saat startup melalui schema environment dan hanya dibaca di server.

## Struktur direktori yang diharapkan

```text
src/
  app/                 # routes, layouts, route handlers
  components/          # UI reusable dan feature components
  features/            # domain feature: learning, progress, nai, auth
  server/              # database, repositories, services, auth
  content/             # loader, schema, authored content bundles
  lib/                 # utilitas bebas domain
  styles/              # globals dan design tokens
tests/
  e2e/
  fixtures/
```

Jangan membuat Client Component sebagai default. Letakkan state interaktif dekat dengan widget yang membutuhkan state.
