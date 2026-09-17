# Database Schema

## Konvensi umum

- PostgreSQL memakai UUID untuk primary key, `timestamptz` untuk waktu, dan `created_at`/`updated_at` bila record dapat berubah.
- Nilai enum disimpan sebagai PostgreSQL enum atau `text` dengan `CHECK`, dipilih konsisten pada implementasi.
- Progress dapat dihitung ulang dari `learning_evidence`; tabel aggregate hanya cache operasional.
- Content published immutable. Perubahan membuat version baru.

## Entitas inti

| Tabel | Kolom penting | Catatan |
| --- | --- | --- |
| `users` | `id`, `email`, `display_name`, `deleted_at` | Hanya untuk member. Data auth provider terpisah sesuai adapter. |
| `learner_devices` | `id`, `user_id?`, `device_key_hash`, `last_seen_at` | Merepresentasikan guest identity dan perangkat member. Simpan hash, bukan device key mentah. |
| `learner_preferences` | `learner_device_id`, `theme`, `font_scale`, `reduced_motion`, `nai_visible` | Satu record per device; setting account dapat ditambahkan terpisah saat dibutuhkan. |
| `domains` | `id`, `slug`, `title`, `sort_order`, `status` | Contoh: matematika, fisika. |
| `modules` | `id`, `domain_id`, `slug`, `title`, `summary`, `estimated_minutes`, `status` | Metadata module overview. |
| `concepts` | `id`, `module_id`, `slug`, `title`, `summary`, `difficulty`, `status` | Unit mastery dan graph. |
| `concept_prerequisites` | `concept_id`, `prerequisite_concept_id`, `strength` | Unique pasangan; larang self-reference dan cycle pada publish validation. |
| `learning_paths` | `id`, `module_id`, `slug`, `title`, `version`, `status` | Satu module dapat memiliki beberapa path/version. |
| `path_nodes` | `id`, `path_id`, `concept_id`, `sort_order`, `required` | Urutan pedagogis, terpisah dari graph konsep. |
| `content_versions` | `id`, `owner_type`, `owner_id`, `version`, `payload`, `published_at`, `checksum` | JSONB tervalidasi, immutable setelah published. |
| `learning_steps` | `id`, `concept_id`, `content_version_id`, `kind`, `sort_order`, `config` | `kind`: encounter, predict, explore, understand, practice, apply, transfer, explain, experiment, retrieve, connect. |
| `rubrics` | `id`, `concept_id`, `content_version_id`, `criteria`, `passing_threshold` | Kriteria untuk explain atau evaluasi kompleks. |
| `attempts` | `id`, `learner_device_id`, `learning_step_id`, `content_version_id`, `idempotency_key`, `response`, `result`, `submitted_at` | Append-only. Unique `(learner_device_id, idempotency_key)`. Respons sensitif memiliki retensi jelas. |
| `learning_evidence` | `id`, `attempt_id?`, `learner_device_id`, `concept_id`, `dimension`, `score`, `source`, `observed_at` | Satu evidence menjelaskan dampak sebuah interaksi. |
| `concept_progress` | `learner_device_id`, `concept_id`, `understanding`, `practice`, `application`, `transfer`, `explanation`, `retention`, `status`, `updated_at` | Aggregate cache, PK komposit. |
| `mistake_events` | `id`, `attempt_id`, `concept_id`, `misconception_code`, `confidence` | Code mengacu taxonomy konten, bukan teks bebas model. |
| `review_queue` | `id`, `learner_device_id`, `concept_id`, `due_at`, `interval_days`, `state` | Unique active review per learner/concept. |
| `recommendations` | `id`, `learner_device_id`, `target_type`, `target_id`, `priority`, `reason_code`, `generated_at`, `dismissed_at` | Cache yang dapat digenerate ulang. |
| `ai_interactions` | `id`, `learner_device_id`, `concept_id?`, `mode`, `provider`, `model`, `input_version`, `output`, `created_at` | Simpan output terfilter dan metadata evaluasi; jangan simpan reasoning internal. |

## Relasi dan index penting

```text
domain 1─* module 1─* concept 1─* learning_step
module 1─* learning_path 1─* path_node *─1 concept
concept *─* concept (melalui concept_prerequisites)
device 1─* attempt 1─* learning_evidence
device *─* concept (melalui concept_progress)
concept 1─* rubric / review_queue / mistake_events
```

- Index `modules(domain_id, status, sort_order)` dan `concepts(module_id, status)` untuk katalog.
- Index `learning_steps(concept_id, sort_order)` untuk player.
- Index `attempts(learner_device_id, submitted_at DESC)` dan unique idempotency key untuk sync.
- Index `review_queue(learner_device_id, state, due_at)` untuk dashboard.
- Jangan mengizinkan delete cascade dari content ke attempts/progress. Gunakan soft delete atau status archive.

## Integritas

- Validasi schema `config`, `payload`, `response`, dan `result` dengan Zod di aplikasi sebelum menulis JSONB.
- Publish transaction memastikan semua path node, prerequisite, step, asset, rubric, dan evaluator reference valid.
- Kode misconception harus berasal dari daftar yang didefinisikan content version.
- Migrasi guest: set `user_id` pada device yang diklaim; tidak memindahkan attempt ke device baru kecuali kebijakan merge eksplisit diterapkan.
