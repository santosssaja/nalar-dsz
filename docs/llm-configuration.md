# Panduan Konfigurasi LLM & Asisten AI Nai

Dokumen ini menjelaskan cara mengonfigurasi model bahasa besar (Large Language Model / LLM) untuk asisten belajar Nai di platform Nalar, termasuk pemilih model dinamis di frontend, sinkronisasi lintas-fitur, serta penanganan batas kuota (*rate limit* / HTTP 429).

---

## 1. Prinsip Desain & Arsitektur AI di Nalar

1. **AI Sebagai Lapisan Bantuan (Scaffolding)**:
   Sesuai prinsip [D-004](./decisions.md), Nai berfungsi sebagai fasilitator Sokrates yang memicu penalaran siswa, bukan sumber otoritas materi. Evaluasi akhir dan rubrik tetap berakar pada materi terkurasi yang tervalidasi.
2. **Server-Side Security (Zero-Leak)**:
   Seluruh kredensial API dan kunci rahasia dikelola secara eksklusif di sisi server. Endpoint katalog (`/api/v1/ai/providers`) hanya mengembalikan metadata publik dan status ketersediaan (`available: boolean`), tanpa pernah mengekspos API key ke browser klien.
3. **Graceful Fallback & Offline-First (Zero-Crash)**:
   Jika API key tidak disetel, kuota habis, atau koneksi terputus, sistem secara otomatis beralih ke `curated` (mesin evaluasi deterministik offline). Aplikasi tidak akan pernah menghasilkan error 500 saat AI eksternal gagal, menjamin proses belajar siswa tetap berjalan lancar.

---

## 2. Katalog Provider & Model yang Didukung

Nalar menggunakan pola **Multi-Provider Adapter** di [`src/server/ai/`](../src/server/ai/):

| Provider ID | Nama Tampilan | Model Bawaan / Utama | Opsi Model Tersedia | Sumber Daya & Ketersediaan |
| :--- | :--- | :--- | :--- | :--- |
| `gemma` *(Default)* | Google Gemma | `gemma-4-31b-it` | `gemma-4-26b-it` | Cloud via Google AI Studio atau Local via Ollama. Tersedia jika `GEMMA_API_KEY` diset. |
| `google` | Google Gemini | `gemini-3.1-flash-lite` | `gemini-3.5-flash-lite`, `gemini-3.5-flash`, `gemini-3.8-flash` | Cloud via Google AI Studio. **Hanya muncul di frontend jika `GEMINI_API_KEY` atau `GOOGLE_API_KEY` diset di server.** |
| `openai` | OpenAI / Compatible | `gpt-4o-mini` | `gpt-4o`, model Groq / OpenRouter | Cloud OpenAI atau endpoint pihak ketiga kompatibel OpenAI. |
| `anthropic` | Anthropic Claude | `claude-3-5-haiku-20241022` | `claude-3-5-sonnet-20241022` | Cloud Anthropic API. |
| `curated` | Mode Offline Terkurasi | `curated-socratic-engine` | N/A | 100% lokal, tanpa internet & tanpa biaya (selalu tersedia). |

---

## 3. Daftar Variabel Lingkungan (*Environment Variables*)

Konfigurasi disimpan di file `.env.local` pada root proyek:

```env
# ------------------------------------------------------------------------------
# Konfigurasi Provider AI Utama
# ------------------------------------------------------------------------------
# Pilihan: 'gemma' (default) | 'google' | 'openai' | 'anthropic' | 'curated'
AI_DEFAULT_PROVIDER=gemma

# ------------------------------------------------------------------------------
# 1. Google Gemma (Default Utama Nalar)
# ------------------------------------------------------------------------------
# Dapatkan API key di Google AI Studio: https://aistudio.google.com/
GEMMA_API_KEY=AQ.Ab8RN6Ki...
GEMMA_MODEL=gemma-4-31b-it

# Atau jika menjalankan Ollama lokal (tanpa API key):
# GEMMA_ENDPOINT=http://localhost:11434
# GEMMA_MODEL=gemma-4-31b-it

# ------------------------------------------------------------------------------
# 2. Google Gemini
# ------------------------------------------------------------------------------
# Model Gemini hanya akan aktif di frontend jika kunci ini diset:
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-3.1-flash-lite

# ------------------------------------------------------------------------------
# 3. OpenAI & OpenAI-Compatible (Groq, OpenRouter, LM Studio)
# ------------------------------------------------------------------------------
OPENAI_API_KEY=your_openai_or_groq_api_key_here
OPENAI_MODEL=gpt-4o-mini
# OPENAI_BASE_URL=https://api.openai.com/v1

# ------------------------------------------------------------------------------
# 4. Anthropic Claude
# ------------------------------------------------------------------------------
ANTHROPIC_API_KEY=your_anthropic_api_key_here
ANTHROPIC_MODEL=claude-3-5-haiku-20241022
```

---

## 4. Pemilih Model di Frontend & Sinkronisasi Lintas-Fitur

Pengguna dapat memilih model AI yang diinginkan langsung dari antarmuka pembelajaran:

1. **Pemilih Model di Header Side Chat (`NaiTutorDrawer`)**:
   - Berada di header laci obrolan samping (*Tanya Nai*).
   - Menampilkan model yang dikelompokkan berdasarkan penyedia (`<optgroup>`).
   - Hanya menampilkan penyedia yang aktif (`available: true`). Model Gemini hanya akan tampil bila server memiliki konfigurasi `GEMINI_API_KEY` / `GOOGLE_API_KEY`.
2. **Sinkronisasi Global via React Context (`AiModelContext`)**:
   - Pilihan model tersimpan di `localStorage` peramban (`nalar_selected_ai_provider` dan `nalar_selected_ai_model`).
   - Setiap pergantian model di laci obrolan secara otomatis tersinkronisasi ke seluruh fitur bertenaga AI di aplikasi:
     - **Tutor Percakapan Laci Samping (`NaiTutorDrawer`)**: Menggunakan model terpilih untuk interaksi tanya-jawab tanya Nai.
     - **Mode Guru (`TeachModeModal`)**: Menampilkan badge nama model aktif di header modal dan mengevaluasi penjelasan pengajaran murid dengan model tersebut.
     - **Prediksi Hipotesis (`StepPredict`)**: Menampilkan badge nama model di samping opsi toggle AI dan memanfaatkan model terpilih untuk analisis intuisi kognitif.

---

## 5. Penanganan Galat, Limit Kuota, & Rate Limit (HTTP 429)

Layanan AI eksternal (seperti Google AI Studio / Gemini) memiliki batas laju pemanggilan (*rate limits*, misal 15 RPM pada free tier) dan batas kuota token harian (*daily quota limits*). Nalar mengimplementasikan strategi penanganan galat berlapis yang transparan dan tidak merusak alur belajar:

### A. Deteksi Galat Terpusat (`parseAiError`)
Modul [`src/server/ai/error-utils.ts`](../src/server/ai/error-utils.ts) secara otomatis menganalisis dan mengklasifikasikan respons galat dari penyedia AI:
- **`RATE_LIMIT_EXCEEDED` (HTTP 429)**: Terjadi saat limit RPM atau kuota harian tercapai (`RESOURCE_EXHAUSTED`, `quota`, `too many requests`).
- **`AUTH_ERROR` (HTTP 401/403)**: Kunci API tidak valid atau izin akses ditolak.
- **`SERVER_OVERLOADED` (HTTP 503)**: Server penyedia AI mengalami lonjakan beban sesaat.
- **`NETWORK_ERROR` (HTTP 502)**: Terputusnya koneksi internet atau kegagalan fetch.

### B. Fail-Safe Graceful Fallback
Ketika model cloud mengalami rate limit (HTTP 429) atau error server:
- Backend **tidak melempar crash 500** kepada pengguna.
- Sistem secara otomatis mengalihkan permintaan ke **Mesin Kurasi Lokal Sokratis** (`curated-socratic-engine`).
- Model ditandai dengan label `${modelName} (offline-curated)`.

### C. Pesan Peringatan & Error di Antarmuka Pengguna
1. **Side Chat Tutor (`NaiTutorDrawer`)**:
   - Jika terjadi rate limit sebelum streaming, sistem memancarkan chunk `type: "notice"`.
   - Laci chat menampilkan kotak peringatan oranye:
     > *"⚠️ Batas kuota atau request model [Nama Model] sedang penuh (HTTP 429). Nai beralih sementara ke respon terkurasi offline. Kamu juga dapat memilih model lain di pemilih model."*
   - Jika koneksi terputus total, chat menampilkan banner galat merah yang jelas disertai tombol saran untuk mencoba model lain atau menggunakan petunjuk bergradasi.
2. **Mode Guru (`TeachModeModal`)**:
   - Menampilkan kotak notifikasi oranye jika evaluasi terpaksa dialihkan ke penilai terkurasi akibat limit API.
   - Menampilkan banner galat jika terjadi kegagalan transmisi tanpa menutup paksa modal, sehingga tulisan pengajaran siswa tidak hilang.
3. **Analisis Nalar Prediksi Hipotesis (`StepPredict`)**:
   - Jika analisis LLM gagal termuat akibat limit kuota (429), kartu "Catatan Analisis AI" berwarna oranye akan muncul dengan pesan:
     > *"Batas kuota atau rate limit model [Nama Model] sedang penuh (HTTP 429). Silakan tunggu beberapa saat atau coba model lain."*
   - Hipotesis pilihan siswa tetap tersimpan dan terekam dengan aman, dan tombol navigasi ke langkah eksplorasi berikutnya tetap aktif.

---

## 6. Panduan Setup Berdasarkan Skenario

### Skenario A: Menggunakan Google AI Studio Cloud Gratis (Rekomendasi)
1. Buka [Google AI Studio](https://aistudio.google.com/) dan buat API key baru.
2. Buka `.env.local` di root proyek dan tambahkan:
   ```env
   AI_DEFAULT_PROVIDER=gemma
   GEMMA_API_KEY=AQ.Ab8RN6Ki...
   GEMMA_MODEL=gemma-4-31b-it
   ```
3. (Opsional) Jika ingin membuka opsi model Gemini di dropdown frontend:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
4. Restart server pengembangan jika sedang berjalan (`pnpm dev`).

---

### Skenario B: Menjalankan Model Lokal via Ollama (100% Gratis & Offline)
1. Instal [Ollama](https://ollama.com/) pada komputer Anda.
2. Unduh model melalui terminal:
   ```bash
   ollama run gemma2:9b
   ```
3. Buka `.env.local` dan konfigurasikan:
   ```env
   AI_DEFAULT_PROVIDER=gemma
   GEMMA_ENDPOINT=http://localhost:11434
   GEMMA_MODEL=gemma2:9b
   ```
4. Sistem Nalar akan langsung terhubung ke Ollama lokal tanpa dependensi internet.

---

### Skenario C: Mode Offline Bawaan Tanpa Setup Apa Pun (`curated`)
Jika Anda tidak menyetel variabel lingkungan apa pun, atau secara eksplisit memilih:
```env
AI_DEFAULT_PROVIDER=curated
```
Nalar akan menggunakan mesin evaluasi Sokrates deterministik terkurasi bawaan ([`src/server/ai/providers/curated-provider.ts`](../src/server/ai/providers/curated-provider.ts)). Mode ini:
- 100% gratis, bebas limit kuota, dan instan.
- Bekerja tanpa dependensi jaringan internet.
- Menjamin konsistensi pedagogis berbasis rubrik yang ketat.

---

## 7. Cara Verifikasi & Uji Coba

### 1. Verifikasi Status Provider via API
Kunjungi endpoint katalog diagnostik melalui browser atau `curl`:
```bash
curl http://localhost:3000/api/v1/ai/providers
```
Format respons yang diharapkan:
```json
{
  "data": {
    "defaultProvider": "gemma",
    "providers": [
      {
        "id": "gemma",
        "name": "Google Gemma (Default)",
        "available": true,
        "defaultModel": "gemma-4-31b-it",
        "models": [
          { "id": "gemma-4-31b-it", "name": "Gemma 4 31B IT", "recommended": true },
          { "id": "gemma-4-26b-it", "name": "Gemma 4 26B IT" }
        ]
      },
      {
        "id": "google",
        "name": "Google Gemini",
        "available": true,
        "defaultModel": "gemini-3.1-flash-lite",
        "models": [
          { "id": "gemini-3.1-flash-lite", "name": "Gemini 3.1 Flash Lite" },
          { "id": "gemini-3.5-flash-lite", "name": "Gemini 3.5 Flash Lite" },
          { "id": "gemini-3.5-flash", "name": "Gemini 3.5 Flash" },
          { "id": "gemini-3.8-flash", "name": "Gemini 3.8 Flash" }
        ]
      }
    ]
  }
}
```

### 2. Menjalankan Uji Otomatis
Jalankan pengujian integrasi AI untuk memverifikasi fungsionalitas dan streaming:
```bash
pnpm test tests/integration/ai-explain-api.test.ts
```
