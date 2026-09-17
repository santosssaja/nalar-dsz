# Test Strategy

## Prinsip

Uji perilaku yang penting bagi pembelajaran dan data pengguna. Snapshot besar tidak menggantikan assertion perilaku. Setiap bug production ditambah regression test pada level termurah yang cukup meyakinkan.

## Piramida pengujian

| Level | Fokus | Contoh |
| --- | --- | --- |
| Unit | Fungsi deterministik | mastery engine, scheduler retrieval, evaluator numerik, normalisasi misconception, content schema |
| Integration | Boundary service/repository/route | submit attempt menyimpan evidence dan progress dalam satu transaksi; ownership guest; idempotency; migrasi device |
| Component | Interaksi UI lokal | hint bertahap, keyboard dialog, status offline, feedback answer |
| E2E | Alur nyata prioritas tinggi | guest belajar, progress tersimpan, login claim, review due, retry sync |
| Accessibility | WCAG dan keyboard | axe pada route utama, tab order, focus return, reduced motion, semantic labels |

## Kasus wajib

- Mastery tidak dapat keluar dari 0–100 dan hanya memperbarui dimensi yang diizinkan evidence.
- Submission yang sama dengan idempotency key sama tidak membuat attempt atau evidence kedua.
- Guest tidak dapat membaca/menulis progress guest lain; member tidak dapat mengakses data member lain.
- Content draft atau content version yang tidak published tidak dapat diakses publik.
- Attempt lama tetap dapat ditampilkan sesudah content version baru dipublish.
- Fallback hint berfungsi ketika provider AI timeout atau rate-limited.
- Outbox mempertahankan event dan UI menyatakan pending ketika offline; sync kemudian memproses event sekali saja.
- Lesson inti selesai dengan keyboard dan pada viewport mobile.

## Tooling dan CI

- Unit/integration: Vitest. Gunakan database test terisolasi atau transaction rollback per test.
- Component: React Testing Library dengan query berbasis role/label, bukan selector implementasi.
- E2E: Playwright pada Chromium desktop dan satu viewport mobile. Mock provider AI untuk suite reguler.
- Accessibility: axe otomatis di E2E/component dan audit manual screen reader untuk lesson player/playground.
- CI wajib menjalankan format check, lint, typecheck, unit/integration test, build, dan E2E smoke. Pull request yang menyentuh UI wajib menyertakan bukti test terkait.

## Data test

Gunakan fixture content kecil namun realistis: satu module Turunan, prerequisite Limit, satu step predict, satu practice dengan misconception, satu explain rubric, dan satu retrieval. Jangan memakai data produksi atau respons bebas pengguna nyata di test.
