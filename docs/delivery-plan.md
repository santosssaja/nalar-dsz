# Delivery Plan

## Tahap 0 — Foundation

- Bootstrap Next.js strict TypeScript, lint/format, test runner, design tokens, env validation, dan CI.
- Tambahkan PostgreSQL, Drizzle migration, auth adapter, guest device resolver, dan observability dasar.
- Definition of done: deployment preview dapat membuka katalog statis; schema/migration dan health check teruji.

## Tahap 1 — Curated learning loop

- Implement domain/module/concept content loader dan module overview.
- Buat lesson player untuk encounter, predict, understand, practice, dan hint berlapis.
- Simpan attempt/evidence/progress secara idempoten untuk guest online.
- Definition of done: pengguna guest dapat menyelesaikan satu concept Turunan dan melihat progress yang benar setelah refresh.

## Tahap 2 — Adaptation dan local-first

- Implement mistake events, mastery engine, recommendation/review queue, IndexedDB outbox, dan offline state.
- Tambahkan explain-it-back dengan rubric serta fallback hint terkurasi.
- Definition of done: jawaban dengan misconception memunculkan remedial yang dapat dijelaskan; submission offline tersinkron sekali saat online.

## Tahap 3 — Account dan polish

- Implement login opsional, claim device, merge progress, preferences sinkron, responsive audit, dan accessibility audit.
- Definition of done: guest dapat login tanpa kehilangan progress; alur inti memenuhi keyboard/mobile test dan target WCAG AA yang ditetapkan.

## Tahap 4 — Scale content dengan aman

- Tambahkan pipeline publish content, review checklist, version history, dashboard observability, dan Nalar Lab terkurasi pertama.
- Definition of done: editor/maintainer dapat mempublish version baru yang tervalidasi tanpa mengubah evaluasi attempt historis.

## Definition of done untuk setiap perubahan

- Requirement dan acceptance criteria jelas.
- Schema/API/content version diperbarui bila kontrak berubah.
- UI memiliki loading, error, empty, responsive, keyboard, dan reduced-motion state yang relevan.
- Test proporsional terhadap risiko lulus di CI.
- Tidak ada secret, data pengguna, atau reasoning internal AI yang tercatat di client/log tanpa dasar yang jelas.
