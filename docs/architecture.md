# Architecture

## Gambaran

```text
Browser
  ├─ Next.js server-rendered catalog/content
  ├─ lesson interaction + IndexedDB outbox
  └─ authenticated/guest requests
             │
             ▼
Next.js serverless application
  ├─ route handlers / server actions
  ├─ auth + identity resolver
  ├─ learning service
  │   ├─ evaluator
  │   ├─ mastery engine
  │   └─ recommendation engine
  ├─ Nai orchestration + safety policy
  └─ repositories
       │             │
       ▼             ▼
 PostgreSQL       KV / rate limit
       │
       ▼
 Curated content bundle / object storage
```

## Boundary kode

| Boundary | Tanggung jawab | Tidak boleh dilakukan |
| --- | --- | --- |
| `app` | Route, metadata, rendering, request adapter | Query database atau aturan mastery langsung di component/page |
| `features` | UI dan use case per domain | Mengakses secret atau driver database |
| `server/services` | Aturan bisnis, transaksi, evaluasi, rekomendasi | Bergantung pada detail React/UI |
| `server/repositories` | Query dan persistence | Menentukan kebijakan produk |
| `content` | Validasi, versioning, dan retrieval materi | Memodifikasi progress pengguna |
| `lib` | Utilitas generik kecil | Menjadi tempat aturan domain tanpa owner |

## Identity dan ownership

Setiap request mutasi harus menghasilkan `Actor`:

```ts
type Actor =
  | { kind: 'guest'; deviceId: string }
  | { kind: 'member'; userId: string; deviceId?: string }
```

Repository menerima actor atau `learner_id` yang telah diotorisasi. Jangan menerima ID pengguna bebas dari body request sebagai dasar akses.

## Alur submission

1. Route memvalidasi payload dan idempotency key.
2. Service memuat step beserta content version yang dipublikasikan.
3. Evaluator terkurasi menilai respons terstruktur. Evaluator AI hanya dipakai untuk respons bebas yang memiliki rubric.
4. Dalam satu transaksi: simpan attempt, evidence, update progress concept, buat/revisi review queue, dan tandai key idempoten selesai.
5. Response mengembalikan feedback yang aman untuk ditampilkan dan snapshot progress baru.

## Mastery dan rekomendasi

Mastery engine adalah fungsi domain deterministik yang menerima evidence normalisasi, bukan respons mentah. Setiap dimensi mempunyai bobot dan batas perubahan per evidence untuk menghindari lonjakan skor.

Recommendation engine memprioritaskan, berurutan:

1. prerequisite wajib yang belum cukup;
2. retrieval/review jatuh tempo;
3. remedial yang menargetkan gap atau misconception aktif;
4. next step pada learning path;
5. koneksi atau lab yang relevan setelah bukti cukup.

Rekomendasi harus dapat dijelaskan lewat `reason_code` dan `reason_text`.

## AI / Nai

Nai tidak langsung mengakses database luas atau internet. Orchestrator memberikan context terstruktur: concept aktif, tujuan step, rubric, hint yang diizinkan, attempt ringkas, mode bantuan, dan policy. Simpan provider/model/version serta keputusan evaluasi, bukan chain-of-thought.

Gunakan timeout, rate limit per actor, retry terbatas, dan fallback ke hint terkurasi. Kegagalan AI tidak boleh menghalangi lesson non-AI.

## Content delivery

Content yang published bersifat immutable melalui `version`. Activity mengacu pada `content_version` sehingga attempt historis tetap dapat dievaluasi dan diaudit. Draft tidak boleh terlihat melalui route publik.
