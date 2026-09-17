# Coding Conventions

## Bahasa dan struktur

- Gunakan TypeScript strict. Hindari `any`; gunakan `unknown` lalu parse dengan Zod pada boundary eksternal.
- Satu file memiliki satu tanggung jawab jelas. Pisahkan UI, schema, service, repository, dan evaluator saat ukurannya atau ownership-nya berbeda.
- Gunakan named export untuk kode aplikasi. Default export hanya bila dibutuhkan oleh konvensi Next.js.
- Nama file memakai `kebab-case`; komponen React memakai `PascalCase`; function/variable memakai `camelCase`; type/interface memakai `PascalCase`.
- Gunakan alias impor `@/` dari `src`. Urutkan impor: platform/vendor, alias internal, relatif, type-only.

## React dan Next.js

- Server Component adalah default. Tambahkan `'use client'` hanya pada leaf interaktif.
- Fetch/query data di server boundary atau service, bukan di banyak komponen anak.
- Gunakan `loading.tsx`, `error.tsx`, dan `not-found.tsx` pada route yang membutuhkannya.
- Jangan memanggil database, SDK AI, atau membaca secret dari client component.
- Jangan memakai `useEffect` untuk data server yang dapat dirender oleh server atau server action.

## Data dan API

- Validasi input HTTP, env, webhook, content JSON, dan output AI memakai schema eksplisit.
- Route handler hanya mengadaptasi HTTP. Aturan bisnis berada di service; SQL/query berada di repository.
- Transaksi dibuka pada service saat operasi menulis lebih dari satu aggregate terkait.
- Mutasi harus idempoten dan mencatat actor, waktu, content version, serta request/event ID bila relevan.
- Jangan mengirim error database/provider mentah kepada client.

## Domain learning

- Jangan menghard-code rule mastery, scoring, atau urutan hint di komponen UI.
- Evaluator mengembalikan result normalisasi. Mastery engine menerima evidence normalisasi, bukan jawaban mentah.
- Semua perubahan content behavior melewati schema dan content version; jangan mengubah interpretation attempt lama diam-diam.

## Styling dan aksesibilitas

- Gunakan design token/CSS variables dan utility class yang konsisten. Hindari nilai warna dan spacing acak di JSX.
- Pakai elemen native yang sesuai: `button` untuk aksi, `a`/`Link` untuk navigasi, label untuk input.
- Setiap komponen interaktif harus menjaga keyboard, focus-visible, label aksesibel, dan reduced motion.

## Quality gate sebelum handoff

1. Jalankan formatter dan linter.
2. Jalankan typecheck dan test yang relevan.
3. Jalankan test E2E/aksesibilitas bila perubahan menyentuh flow pengguna.
4. Periksa mobile dan keyboard untuk perubahan UI.
5. Perbarui dokumentasi, schema, dan test saat kontrak atau perilaku berubah.
