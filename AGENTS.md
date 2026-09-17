# AGENTS.md — Nalar

## Entry point wajib

Sebelum melakukan tugas, baca [docs/project-state.md](./docs/project-state.md) dan [docs/execution-guide.md](./docs/execution-guide.md). Keduanya mengatur konteks kerja, urutan sumber kebenaran, batas asumsi, dan format handoff.

Untuk tugas produk, baca juga [docs/decisions.md](./docs/decisions.md), lalu pilih dokumen spesifik melalui [docs/README.md](./docs/README.md).

## Tujuan repository

Bangun Nalar: platform pembelajaran STEM interaktif yang berpusat pada pemahaman, jalur adaptif, dan retensi. Konsep sumber ada di `docs/Nalar_Dokumen_Konsep_Lengkap.md`.

## Urutan kerja agent

1. Tentukan apakah tugas adalah investigasi, keputusan, atau implementasi. Jangan memperluas scope tanpa otorisasi.
2. Baca requirement dan dokumen teknis yang relevan; periksa source, konfigurasi, dan test yang benar-benar tersedia.
3. Jangan mengarang dependency, script, provider, environment variable, asset, atau perilaku produk yang belum dibuktikan oleh repository/dokumen.
4. Buat perubahan kecil dan terfokus. Jaga boundary `app` → `features` → `server/services` → `repositories`.
5. Validasi input di boundary, tulis test sesuai [docs/test-strategy.md](./docs/test-strategy.md), lalu jalankan check yang tersedia.
6. Perbarui `project-state.md` atau `decisions.md` bila perubahan bersifat material atau mengunci keputusan. Laporkan file, perilaku, verifikasi, dan asumsi terbuka.

## Aturan produk yang tidak boleh dilanggar

- Jangan mewajibkan login untuk mulai belajar atau menyimpan progress awal.
- Jangan menyamakan completion, XP, atau streak dengan mastery.
- Jangan menjadikan AI sumber materi atau evaluator tanpa content/rubric terkurasi.
- Jangan membuat Nai memberi jawaban penuh untuk challenge aktif sebelum solution hint dibuka.
- Jangan menjadikan warna, animasi, atau mouse sebagai satu-satunya cara memahami atau menjalankan UI.
- Jangan mengekspos secret, raw database error, data pengguna lintas identity, atau reasoning internal model.

## Konvensi ringkas

- TypeScript strict; validasi external data dengan Zod; hindari `any`.
- Server Component secara default. Client component hanya untuk interaksi leaf.
- Route handler mengadaptasi HTTP; service memegang aturan bisnis; repository memegang query.
- Mutasi learning harus idempoten, ownership-aware, dan menyimpan content version.
- Konten published immutable dan versioned.
- UI mengikuti [docs/ui-system.md](./docs/ui-system.md): tenang, ringan, responsif, dan aksesibel.

## Verifikasi minimum

Jalankan formatter/linter, typecheck, dan test yang relevan bila script tersedia. Untuk perubahan UI, periksa state loading/error serta viewport mobile dan keyboard. Untuk perubahan data/API, uji ownership, validation, idempotency, dan migration bila relevan.

## Batas keputusan

Minta arah pengguna sebelum memilih perilaku yang terlihat pengguna tanpa acceptance criteria, mengubah kontrak publik/skema production, memilih vendor berbiaya, atau melakukan operasi destructive. Pilih default yang reversible hanya jika tidak mengubah arah produk; catat asumsi tersebut saat handoff.

## Scope MVP

Fokus awal: satu module terkurasi Turunan dengan guest flow, lesson player, hint, attempt/evidence, mastery dasar, recommendation/retrieval, dan login opsional untuk sync. Referensi lengkap ada di [docs/delivery-plan.md](./docs/delivery-plan.md).
