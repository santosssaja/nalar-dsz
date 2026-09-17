# Content Model

## Tujuan

Konten Nalar adalah aset terkurasi dan versioned. AI memperluas dialog atau mengevaluasi respons bebas dengan rubric; AI tidak menjadi generator materi runtime.

## Struktur authored content

```text
Domain → Module → Learning Path → Concept → Learning Step
```

Setiap concept memiliki tujuan belajar, prerequisite, misconception taxonomy, mastery dimension yang diukur, dan satu atau lebih steps. Step tidak harus menjalankan seluruh urutan belajar; pilih yang mendukung tujuan konsep.

## Konfigurasi minimum concept

```ts
type ConceptContent = {
  slug: string
  title: string
  learningObjectives: string[]
  prerequisites: string[]
  misconceptions: Array<{ code: string; label: string; remediation: string }>
  steps: StepContent[]
  rubric?: ExplainRubric
}
```

Setiap step memuat `id`, `kind`, `title`, `instruction`, `estimatedMinutes`, `config`, `accessibility`, dan `evaluation`. `config` harus memakai discriminated union menurut `kind`, bukan JSON arbitrer tanpa schema.

## Aturan pedagogis

- Mulai dengan fenomena, pertanyaan, visual, atau manipulasi yang relevan sebelum definisi formal jika karakter konsep memungkinkan.
- Step predict menjelaskan apa yang perlu diprediksi dan menerima alasan singkat jika alasan itu berguna untuk feedback.
- Hint diurutkan orientation → concept → strategy → solution. Solution menjelaskan proses dan tidak hanya memberi nilai akhir.
- Evaluasi memiliki expected answer, tolerance bila numerik, feedback benar/salah, serta mapping misconception yang dapat ditinjau editor.
- Explain-it-back memiliki rubric eksplisit: klaim utama, hubungan/kausalitas, contoh atau batasan bila relevan. Feedback AI harus mengacu pada rubric tersebut.
- Assets memiliki alt text, transkrip atau deskripsi untuk simulasi yang perlu dijelaskan, dan fallback non-drag interaction.

## Siklus publish

```text
draft → automated validation → pedagogical review → accessibility review → publish(versioned)
```

Published content tidak diubah di tempat. Bug pada konten diperbaiki melalui version baru. Content validation menjalankan schema check, slug unik, referensi asset/evaluator valid, prerequisite tanpa cycle, dan semua teks UI yang wajib tersedia.
