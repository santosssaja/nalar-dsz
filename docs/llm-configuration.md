# Panduan Konfigurasi LLM & Asisten AI Nai

Dokumen ini menjelaskan cara mengonfigurasi model bahasa besar (Large Language Model / LLM) untuk asisten belajar Nai di platform Nalar.

---

## 1. Prinsip Desain & Arsitektur AI di Nalar

1. **AI Sebagai Lapisan Bantuan (Scaffolding)**:
   Sesuai prinsip [D-004](./decisions.md), Nai berfungsi sebagai fasilitator Sokrates yang memicu penalaran siswa, bukan sumber otoritas materi. Evaluasi akhir dan rubrik tetap berakar pada materi terkurasi yang tervalidasi.
2. **Server-Side Configuration (Zero-Leak)**:
   Seluruh kredensial API dan pemilihan provider dikelola di sisi server melalui *environment variables* (file `.env` atau `.env.local`). Frontend tidak pernah mengekspos API key atau membebani siswa dengan pengaturan teknis model.
3. **Graceful Fallback & Offline-First (Zero-Crash)**:
   Jika API key tidak disetel, kuota habis, atau koneksi terputus, sistem secara otomatis beralih ke `curated` (mesin evaluasi deterministik offline). Aplikasi tidak akan pernah menghasilkan error 500 saat AI eksternal gagal.

---

## 2. Katalog Provider & Model yang Didukung

Nalar menggunakan pola **Multi-Provider Adapter** di [`src/server/ai/`](../src/server/ai/):

| Provider ID | Nama Tampilan | Model Default | Opsi Model Lain | Sumber Daya |
| :--- | :--- | :--- | :--- | :--- |
| `gemma` *(Default)* | Google Gemma | `gemma-2-9b-it` | `gemma-2-27b-it`, `gemma-2-2b-it` | Cloud via Google AI Studio atau Local via Ollama |
| `google` | Google Gemini | `gemini-1.5-flash` | `gemini-1.5-pro`, `gemini-2.0-flash` | Cloud via Google AI Studio |
| `openai` | OpenAI / Compatible | `gpt-4o-mini` | `gpt-4o`, model Groq / OpenRouter | Cloud OpenAI atau endpoint pihak ketiga |
| `anthropic` | Anthropic Claude | `claude-3-5-haiku-20241022` | `claude-3-5-sonnet-20241022` | Cloud Anthropic API |
| `curated` | Mode Offline Terkurasi | `curated-socratic-engine` | N/A | 100% lokal, tanpa internet & tanpa biaya |

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
# 1. Google Gemma (Default Platform Nalar)
# ------------------------------------------------------------------------------
# Dapatkan API key gratis di: https://aistudio.google.com/
GEMMA_API_KEY=your_google_ai_studio_api_key_here
GEMMA_MODEL=gemma-2-9b-it

# Atau jika menjalankan Ollama lokal (tanpa API key):
# GEMMA_ENDPOINT=http://localhost:11434
# GEMMA_MODEL=gemma2:9b

# ------------------------------------------------------------------------------
# 2. Google Gemini
# ------------------------------------------------------------------------------
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-1.5-flash

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

## 4. Panduan Setup Berdasarkan Skenario

### Skenario A: Menggunakan Google AI Studio (Cloud Gratis — Rekomendasi Cepat)
1. Buka [Google AI Studio](https://aistudio.google.com/) dan buat API key baru.
2. Buka `.env.local` di root proyek dan tambahkan:
   ```env
   AI_DEFAULT_PROVIDER=gemma
   GEMMA_API_KEY=AIzaSy...
   ```
3. Restart server pengembangan jika sedang berjalan (`pnpm dev`).

---

### Skenario B: Menjalankan Model Lokal via Ollama (100% Gratis & Offline)
1. Instal [Ollama](https://ollama.com/) pada komputer Anda.
2. Unduh model Gemma 2 melalui terminal:
   ```bash
   ollama run gemma2:9b
   ```
3. Buka `.env.local` dan konfigurasikan:
   ```env
   AI_DEFAULT_PROVIDER=gemma
   GEMMA_ENDPOINT=http://localhost:11434
   GEMMA_MODEL=gemma2:9b
   ```
4. Sistem Nalar akan langsung terhubung ke Ollama lokal tanpa mengirimkan data ke internet.

---

### Skenario C: Menggunakan OpenAI atau Groq
1. Dapatkan API key dari [OpenAI Platform](https://platform.openai.com/) atau [Groq Console](https://console.groq.com/).
2. Konfigurasikan di `.env.local`:
   - **OpenAI Official**:
     ```env
     AI_DEFAULT_PROVIDER=openai
     OPENAI_API_KEY=sk-proj-...
     OPENAI_MODEL=gpt-4o-mini
     ```
   - **Groq (Inference Berkecepatan Sangat Tinggi)**:
     ```env
     AI_DEFAULT_PROVIDER=openai
     OPENAI_API_KEY=gsk_...
     OPENAI_BASE_URL=https://api.groq.com/openai/v1
     OPENAI_MODEL=llama-3.3-70b-versatile
     ```

---

### Skenario D: Menggunakan Anthropic Claude
1. Dapatkan API key dari [Anthropic Console](https://console.anthropic.com/).
2. Konfigurasikan di `.env.local`:
   ```env
   AI_DEFAULT_PROVIDER=anthropic
   ANTHROPIC_API_KEY=sk-ant-...
   ANTHROPIC_MODEL=claude-3-5-haiku-20241022
   ```

---

### Skenario E: Mode Offline Bawaan Tanpa Setup Apa Pun (`curated`)
Jika Anda tidak menyetel variabel lingkungan apa pun, atau secara eksplisit memilih:
```env
AI_DEFAULT_PROVIDER=curated
```
Nalar akan menggunakan mesin evaluasi Sokrates deterministik terkurasi bawaan ([`src/server/ai/providers/curated-provider.ts`](../src/server/ai/providers/curated-provider.ts)). Mode ini:
- 100% gratis dan instan.
- Bekerja tanpa dependensi jaringan internet.
- Menjamin konsistensi pedagogis berbasis rubrik yang ketat.

---

## 5. Cara Verifikasi & Uji Coba

### 1. Verifikasi Status Provider via API
Kunjungi endpoint diagnostik melalui browser atau `curl`:
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
        "defaultModel": "gemma-2-9b-it"
      }
      ...
    ]
  }
}
```

### 2. Verifikasi Dialog Pembelajaran
1. Masuk ke salah satu materi pembelajaran (misalnya `/belajar/definisi-turunan`).
2. Buka tombol **Tanya Nai** atau **Ajari Nai** pada panel atas.
3. Kirimkan pertanyaan atau ajarkan konsep pada Nai. Nai akan merespons dengan scaffolding Sokrates menggunakan provider yang telah dikonfigurasi.

### 3. Menjalankan Uji Otomatis
Jalankan pengujian integrasi AI untuk memverifikasi fungsionalitas:
```bash
pnpm test tests/integration/ai-explain-api.test.ts
```
