# Project State

## Snapshot saat ini

**Tanggal pembaruan:** 2026-09-17  
**Tahap:** Tahap 1 — Curated learning loop selesai  
**Source code aplikasi:** Next.js 15 App Router (TypeScript strict), Tailwind CSS + design tokens, Drizzle ORM PostgreSQL schema (19 tabel), adapter PGlite / in-memory untuk pengujian, actor/device resolver, health check endpoint, content loader & schema Zod, modul terkurasi Turunan (3 konsep, 12 steps, prasyarat Limit), lesson player interaktif (encounter, explore visualizer, predict engine, understand KaTeX, practice dengan misconception trap), hint drawer 4-layer, deterministic evaluator, 6-dimension mastery engine, dan API attempts idempoten UUID (`/api/v1/*`). Seluruh test (9 files, 22 tests) dan production build Next.js lolos 100%.

## Target implementasi berikutnya

Tahap berikutnya adalah **Tahap 2 — Adaptation dan local-first** dari [delivery-plan.md](./delivery-plan.md):
- Mistake events aggregator dan mistake map visualization per konsep.
- Spaced retrieval scheduler & review queue.
- Recommendation engine (prerequisite incomplete → review due → active misconception remedial → next path node).
- Client-side IndexedDB outbox wrapper untuk offline-first learning dan `POST /api/v1/sync`.
- Explain-it-back rubric evaluator dengan Nai AI scaffolding orchestrator dan static rule fallback.

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
