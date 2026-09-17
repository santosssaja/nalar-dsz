# Dokumentasi Engineering Nalar

Dokumen ini menerjemahkan visi produk menjadi keputusan implementasi. Sumber konsep tetap berada di [Nalar_Dokumen_Konsep_Lengkap.md](./Nalar_Dokumen_Konsep_Lengkap.md); dokumen di bawah memecahnya menjadi pekerjaan yang dapat dieksekusi.

## Mulai dari sini

Agent harus membaca [project-state.md](./project-state.md), lalu [execution-guide.md](./execution-guide.md). Keduanya menyatakan konteks kerja saat ini, sumber kebenaran, batas asumsi, dan format handoff.

Setelah itu, baca dokumen berdasarkan jenis pekerjaan:

| Jenis pekerjaan | Dokumen wajib |
| --- | --- |
| Semua perubahan produk | [product-brief.md](./product-brief.md), [requirements.md](./requirements.md), [decisions.md](./decisions.md) |
| UI/UX | [user-flows.md](./user-flows.md), [ui-system.md](./ui-system.md), [test-strategy.md](./test-strategy.md) |
| Backend/data/API | [architecture.md](./architecture.md), [database-schema.md](./database-schema.md), [api-contract.md](./api-contract.md), [test-strategy.md](./test-strategy.md) |
| Content/AI | [content-model.md](./content-model.md), [architecture.md](./architecture.md), [requirements.md](./requirements.md) |
| Perencanaan delivery | [delivery-plan.md](./delivery-plan.md), [decisions.md](./decisions.md) |

## Peta dokumen

| Dokumen | Isi |
| --- | --- |
| [product-brief.md](./product-brief.md) | Ringkasan produk, prinsip, persona, metrik |
| [requirements.md](./requirements.md) | Requirement fungsional/nonfungsional dan scope MVP |
| [user-flows.md](./user-flows.md) | Alur pengguna dan state penting |
| [tech-stack.md](./tech-stack.md) | Stack utama Next.js serverless dan keputusan teknis |
| [architecture.md](./architecture.md) | Boundary aplikasi, data flow, dan integrasi AI |
| [database-schema.md](./database-schema.md) | Entitas, relasi, constraint, serta ownership data |
| [api-contract.md](./api-contract.md) | Endpoint, payload, error, dan aturan idempotensi |
| [content-model.md](./content-model.md) | Model authored content dan aturan publish |
| [ui-system.md](./ui-system.md) | Arah visual, responsive behavior, dan aksesibilitas |
| [coding-conventions.md](./coding-conventions.md) | Konvensi kode dan boundary perubahan |
| [test-strategy.md](./test-strategy.md) | Piramida pengujian dan quality gate |
| [delivery-plan.md](./delivery-plan.md) | Tahapan delivery dan definition of done |
| [execution-guide.md](./execution-guide.md) | Protokol kerja, aturan asumsi, dan handoff agent |
| [project-state.md](./project-state.md) | Kondisi repository saat ini dan pekerjaan berikutnya |
| [decisions.md](./decisions.md) | Keputusan yang terkunci, usulan, dan cara mengubahnya |

## Istilah inti

- **Concept**: unit pengetahuan yang dapat punya prasyarat dan bukti mastery.
- **Learning step**: satu aktivitas berurutan dalam suatu konsep.
- **Evidence**: hasil aktivitas yang memperbarui dimensi mastery.
- **Adaptive path**: rekomendasi langkah berikutnya berdasarkan bukti, bukan path kurikulum semata.
- **Guest**: pengguna tanpa akun yang memiliki `device_id` anonim.
- **Member**: guest yang masuk atau membuat akun untuk sinkronisasi lintas perangkat.
