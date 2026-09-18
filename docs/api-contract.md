# API Contract

## Aturan umum

- Base path: `/api/v1`.
- JSON memakai `camelCase`; waktu memakai ISO 8601 UTC; ID memakai UUID.
- Semua body dan query divalidasi Zod. Error tidak membocorkan stack trace atau detail provider.
- Request mutasi wajib header `Idempotency-Key` berupa UUID. Server menyimpan response sukses untuk key yang sama selama masa retensi.
- Identity diambil dari session atau cookie guest yang ditandatangani. Jangan kirim `userId` dari client.

## Bentuk response

```json
{ "data": {} }
```

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Respons tidak valid.",
    "fields": { "answer": "Wajib diisi." },
    "requestId": "req_..."
  }
}
```

Kode error: `UNAUTHENTICATED`, `FORBIDDEN`, `NOT_FOUND`, `VALIDATION_ERROR`, `CONFLICT`, `RATE_LIMITED`, `CONTENT_UNAVAILABLE`, `AI_UNAVAILABLE`, `INTERNAL_ERROR`.

## Endpoint publik dan learning

| Method / path | Tujuan | Response utama |
| --- | --- | --- |
| `GET /domains` | Daftar domain published | domain cards |
| `GET /modules?domainSlug=` | Modul published per domain | module cards + progress ringkas bila actor ada |
| `GET /modules/:slug` | Module overview | metadata, prerequisites, path, progress |
| `GET /concepts/:slug` | Concept dan step published | concept, ordered steps, akses status |
| `GET /learning/next` | Rekomendasi next activity | target, priority, `reasonCode`, `reasonText` |
| `GET /progress` | Progress, review due, mistake summary | concept progress dan queue |
| `POST /attempts` | Submit satu response aktivitas | evaluation, feedback, evidence, progress |
| `POST /hints` | Meminta hint layer | allowed hint + usage event |
| `POST /ai/explain-feedback` | Evaluasi explain-it-back | rubric feedback, evidence jika final |
| `GET /ai/providers` | Katalog provider & model AI | daftar provider (`gemma`, `google`, `openai`, `anthropic`, `curated`), model aktif, metadata |
| `POST /ai/tutor` | Bimbingan Sokratis AI Tutor Nai | respons dialog Sokratis, model info, dan panduan berpikir |
| `POST /ai/teach` | Evaluasi Mode Guru (Teach Mode) | skor pemahaman konsep, respons persona murid Nai, dan saran |
| `POST /sync` | Push outbox guest/member | accepted/rejected event IDs + snapshot |
| `POST /auth/claim-device` | Klaim device guest saat login | merge summary |

## `POST /attempts`

Request:

```json
{
  "stepId": "3e3fcb79-32ca-4abd-b2af-319faad764cf",
  "contentVersion": 3,
  "response": { "answer": "12", "prediction": "increases" },
  "clientSubmittedAt": "2026-09-17T08:30:00.000Z"
}
```

Response:

```json
{
  "data": {
    "attemptId": "c6c5d243-fd55-4930-8b6c-f74c11ad645f",
    "evaluation": {
      "status": "incorrect",
      "feedback": "Periksa kembali satuan waktunya.",
      "misconceptionCodes": ["RATE_TIME_UNIT"],
      "availableHintLevel": "orientation"
    },
    "progress": {
      "conceptId": "a0b9e4f7-77ec-45ea-924a-2f56281fc4d2",
      "dimensions": { "understanding": 48, "practice": 35, "application": 0, "transfer": 0, "explanation": 0, "retention": 0 },
      "status": "learning"
    },
    "nextAction": { "type": "hint", "reasonCode": "MISCONCEPTION_ACTIVE" }
  }
}
```

`contentVersion` yang sudah tidak published mengembalikan `CONFLICT` dengan detail versi yang harus dimuat ulang. Server boleh menerima ulang request dengan idempotency key sama dan wajib memberi response yang sama.

## `POST /hints`

```json
{ "stepId": "3e3fcb79-32ca-4abd-b2af-319faad764cf", "level": "strategy" }
```

Server memastikan hint layer sebelumnya telah tersedia/dibuka sesuai kebijakan step. Hint solution harus ditandai eksplisit agar UI dapat menyesuaikan feedback pembelajaran.

## `POST /sync`

Request berisi event outbox dengan client-generated UUID stabil:

```json
{
  "events": [
    {
      "eventId": "c80a9c7e-4da6-4a89-bd0a-ec918c1cc63b",
      "type": "attempt.submit",
      "occurredAt": "2026-09-17T08:30:00.000Z",
      "payload": { "stepId": "...", "contentVersion": 3, "response": { "answer": "12" } }
    }
  ]
}
```

Response mengembalikan status setiap event, `serverTime`, dan progress yang berubah. Event diterima secara idempoten melalui `eventId`; event valid lain tetap diproses jika satu event gagal.

## Kontrak AI & Pemilihan Provider/Model

Endpoint AI tidak menerima prompt mentah sebagai satu-satunya input. Ia menerima mode yang diizinkan (`socratic`, `teach`, `explainFeedback`) dan referensi step/concept terkurasi. Server membangun prompt dari content/rubric, menerapkan rate limit, dan memfilter output ke schema response yang tervalidasi.

### Pilihan Provider & Model yang Didukung

| Provider ID | Default Model | Pilihan Model Tambahan | Tipe Eksekusi / SDK |
| --- | --- | --- | --- |
| `gemma` (Default) | `gemma-2-9b-it` | `gemma-2-27b-it`, `gemma-2-2b-it` | Google Generative AI SDK / Local endpoint kompatibel |
| `google` | `gemini-1.5-flash` | `gemini-1.5-pro`, `gemini-2.0-flash` | Google Generative AI SDK |
| `openai` | `gpt-4o-mini` | `gpt-4o` | OpenAI Official SDK |
| `anthropic` | `claude-3-5-haiku-20241022` | `claude-3-5-sonnet-20241022` | Anthropic Official SDK |
| `curated` | `curated-socratic-engine` | - | Deterministik Lokal Offline (Zero API Key / Zero Cost) |

### `POST /ai/tutor` (Dialog Sokratis)

Request:
```json
{
  "conceptSlug": "definisi-turunan",
  "stepId": "def-step-explore",
  "userQuestion": "Kenapa nilai h harus mendekati nol?",
  "provider": "gemma",
  "model": "gemma-2-9b-it",
  "apiKey": "optional-custom-key",
  "endpoint": "optional-custom-endpoint"
}
```

Response:
```json
{
  "data": {
    "answer": "Pertanyaan yang tajam! Jika h tepat bernilai 0, pembagian apa yang akan terjadi pada kemiringan kurva?",
    "provider": "gemma",
    "model": "gemma-2-9b-it",
    "actorKind": "guest"
  }
}
```

### `POST /ai/teach` (Mode Guru / Teach Mode)

Request:
```json
{
  "conceptSlug": "vektor",
  "naiQuestion": "Guru, kenapa gaya 5 N dan 5 N bisa menghasilkan total 0 N?",
  "userTeachingExplanation": "Karena kedua gaya bekerja saling berlawanan arah 180 derajat...",
  "provider": "gemma",
  "model": "gemma-2-9b-it"
}
```

Response:
```json
{
  "data": {
    "evaluation": {
      "understood": true,
      "score": 92,
      "naiResponse": "Wah, sekarang Nai paham! Jadi arah sama pentingnya dengan besar gaya ya!",
      "feedbackForTeacher": "Penjelasan sangat jernih dan berhasil mematahkan miskonsepsi skalar.",
      "suggestions": ["Coba tambahkan contoh kondisi tegak lurus 90 derajat."]
    },
    "provider": "gemma",
    "actorKind": "guest"
  }
}
```

### Prinsip Graceful Fallback
Jika provider LLM eksternal tidak memiliki API key di environment server, mengalami rate limit, atau offline, sistem otomatis beralih (*graceful fallback*) ke **`curated`** (Mode Offline Terkurasi). Pembelajaran tidak pernah terblokir oleh kegagalan API eksternal.
