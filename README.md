<div align="center">

# Nalar

**Platform Pembelajaran STEM Interaktif Berpusat pada Pemahaman Konseptual, Jalur Adaptif, dan Retensi.**

[![Next.js](https://img.shields.io/badge/Next.js-15.1.7-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Vitest](https://img.shields.io/badge/Tests-111%20Passed-brightgreen?style=flat-square&logo=vitest)](https://vitest.dev/)
[![Drizzle ORM](https://img.shields.io/badge/ORM-Drizzle-C5F74F?style=flat-square)](https://orm.drizzle.team/)
[![License](https://img.shields.io/badge/License-Private-lightgrey?style=flat-square)](#)

<p align="center">
  <a href="#-tentang-nalar">Tentang Nalar</a> •
  <a href="#-fitur-utama">Fitur Utama</a> •
  <a href="#-kurikulum--domain-stem">Kurikulum</a> •
  <a href="#-nalar-lab-14-stasiun">Nalar Lab</a> •
  <a href="#-arsitektur--struktur-direktori">Arsitektur</a> •
  <a href="#-memulai-quick-start">Memulai Cepat</a> •
  <a href="#-konfigurasi-ai-tutor-nai">AI Tutor</a> •
  <a href="#-pengujian--kualitas">Verifikasi</a>
</p>

---

</div>

## Tentang Nalar

**Nalar** lahir dari kegelisahan terhadap metode pembelajaran sains dan matematika konvensional yang kerap mereduksi pemahaman menjadi sekadar hafalan rumus cepat, penumpukan XP, atau mempertahankan *streak* semu.

Di Nalar, pemahaman sejati (*deep conceptual mastery*) dibangun melalui eksplorasi aktif, pengujian hipotesis intuisi sebelum formalisme matematika, serta pembuktian penalaran melalui siklus dialog sokratis.

### Prinsip Inti Pedagogis:
1. **Active Before Passive:** Pelajar memanipulasi parameter simulasi dan mengamati fenomena terlebih dahulu sebelum diperkenalkan definisi formal.
2. **Intuition First, Formalism Later:** Rumus matematika dihadirkan sebagai bahasa ringkas untuk merangkum intuisi yang telah dipahami, bukan dogma hafalan.
3. **Proof of Thought, Not Completionism:** Menyelesaikan langkah bukan jaminan penguasaan. Nalar mengukur bukti nyata penalaran lintas 6 dimensi kognitif.
4. **Socratic Guidance (Nai):** AI pendamping tidak pernah membocorkan jawaban langsung, melainkan mengajukan pertanyaan pemantik bertingkat yang menuntun logika pelajar.
5. **Zero Friction Access:** Pelajar dapat langsung belajar dan menyimpan kemajuan secara lokal tanpa hambatan registrasi atau login di awal.

---

## Fitur Utama

### 1. 6-Tahap Siklus Pembelajaran (*Learning Flow*)
Setiap konsep kurikulum mematuhi alur kognitif terstruktur:
* **Encounter:** Pemaparan fenomena dunia nyata yang memicu rasa ingin tahu.
* **Explore:** Eksplorasi interaktif melalui simulasi kanvas langsung di browser.
* **Predict:** *Prediction Engine*—pelajar merumuskan hipotesis dan tingkat keyakinan sebelum melihat hasil observasi.
* **Understand:** Penjelasan konseptual mendalam dengan rumus matematika rendered via KaTeX.
* **Practice:** Latihan soal kontekstual bertingkat dengan petunjuk 4-lapis (*layered hints*).
* **Explain (Mode Guru):** Pelajar menjelaskan konsep kembali dengan kata-kata sendiri untuk menguji pemahaman sejati (Teknik Feynman).

### 2. Nalar Lab Suite (14 Stasiun Eksplorasi Interaktif)
Laboratorium virtual terintegrasi (`/lab`) dengan simulasi responsif:
* **Kalkulus:** Garis Sekan menuju Garis Singgung & Turunan Sesaat.
* **Matematika:** Garis Bilangan & Nilai Mutlak, Rasio Proporsi & Persentase Visual, Pertumbuhan Eksponensial ($2^n$) vs Linier/Kuadratik.
* **Fisika Mekanika:** Vektor Geometri & Resultan Analitik, Kinematika Parabola 2D, Hukum Newton & Transisi Gesekan Statis/Kinetis, Gerak Harmonik Sederhana & Kekekalan Energi Mekanik ($E_p + E_k$).
* **Kimia Dasar:** Kinetika Partikel & Wujud Materi, Model Atom Bohr & Tren Periodik, Ikatan Kimia, Titik Lewis, & Geometri VSEPR 3D.
* **Biologi Dasar:** Skala Ukuran Hayati (Nanometer ke Biosfer), Sitologi Sel (Prokariotik, Hewan, Tumbuhan), Daur Bioenergetika Fotosintesis & Respirasi Seluler (ATP).

### 3. Concept Graph 2D (*Knowledge Mesh*)
Peta graf pengetahuan 2 dimensi interaktif (`/graph`) yang memvisualisasikan keterkaitan 47 konsep lintas 4 domain STEM:
* Navigasi bebas 360° pan/drag ramah sentuhan (ponsel/tablet) dan kontrol zoom halus.
* Deteksi jalur prasyarat (*prerequisites*) dan jalinan antar-disiplin (*cross-domain mesh*).
* Filter pencarian dinamis per domain dan status penguasaan konsep.

### 4. AI Tutor Sokrates "Nai" & Mode Guru (*Teach Mode*)
* **Multi-Provider AI:** Didukung oleh Google Gemma (default), Ollama lokal, Gemini, OpenAI, Claude, atau **Curated Offline Engine** (100% berfungsi tanpa internet atau API key).
* **Real-time Streaming (SSE):** Respons token-demi-token dengan visualisasi proses berpikir (*thought process*) dan kursor mengetik.
* **Mode Guru (Feynman Technique):** Pelajar berperan sebagai pengajar bagi Nai. Nai mengajukan pertanyaan kritis dan mengevaluasi kedalaman penjelasan pelajar.

### 5. Model Penguasaan 6 Dimensi & Spaced Retrieval
Pelacak kemajuan belajar yang objektif di `/dashboard`:
* **6 Dimensi Mastery:** *Understanding*, *Practice*, *Application*, *Transfer*, *Explanation*, dan *Retention*.
* **Spaced Retrieval Engine:** Sistem pengulangan terjadwal adaptif untuk mencegah kelupaan (*forgetting curve*).
* **Peta Miskonsepsi Aktif:** Mendeteksi kesalahan logika spesifik dan menyajikan rekomendasi pembenahan nalar.

### 6. Aksesibilitas & Zero-Friction Identity
* **Guest-First:** Langsung belajar tanpa akun; progress tersimpan aman di cookie perangkat & IndexedDB.
* **Magic Link Login:** Sinkronisasi akun lintas perangkat melalui verifikasi email sekali klik tanpa password.
* **Aksesibilitas UI:** Tema Gelap/Terang bebas kedipan (*zero-flash*), mode **High Contrast** mandiri, dan navigasi ramah pembaca layar (*screen-reader friendly*).

---

## Kurikulum & Domain STEM

Saat ini Nalar mencakup **47 Konsep Terkurasi Lengkap** dalam **5 Modul Inti**:

| Domain | Modul | Konsep | Contoh Materi |
| :--- | :--- | :---: | :--- |
| **Matematika** | `fondasi-matematika` | 9 Konsep | Bilangan, Pecahan & Desimal, Rasio, Eksponensial, Estimasi |
| **Kalkulus** | `turunan` | 3 Konsep | Perubahan, Laju Perubahan, Definisi Formal Turunan |
| **Fisika** | `fisika-mekanika` | 18 Konsep | Vektor, Kinematika, Hukum Newton, Usaha & Energi, Momentum, Rotasi, Gravitasi, Osilasi GHS |
| **Kimia** | `kimia-dasar` | 11 Konsep | Materi, Atom & Molekul, Konfigurasi Elektron, Ikatan Kimia, Geometri VSEPR |
| **Biologi** | `biologi-dasar` | 6 Konsep | Karakteristik Kehidupan, Sel, Molekul Hayati, Bioenergetika (ATP) |

---

## Arsitektur & Struktur Direktori

Nalar dibangun menggunakan arsitektur berlapis yang menjaga batas tanggung jawab tegas (*clean boundary*):

```text
src/
├── app/                      # Next.js 15 App Router (Pages, Layouts, Route Handlers)
│   ├── (auth)/auth/          # Autentikasi Magic Link & Verifikasi
│   ├── (overview)/dashboard/ # Dashboard Kemajuan Belajar & Pengulangan Terjadwal
│   ├── domains/              # Katalog Domain STEM
│   ├── graph/                # Visualisasi 2D Knowledge Mesh Concept Graph
│   ├── lab/                  # Suite 14 Stasiun Simulasi Interaktif
│   ├── learn/                # Player Pembelajaran Konsep Berbasis 6-Tahap
│   ├── modules/              # Detail Modul & Daftar Konsep
│   └── api/v1/               # Endpoint REST API Publik & AI Streaming
├── components/               # Komponen Antarmuka Global
│   ├── layout/               # NavHeader (Smart Auto-Hide), Footer, Pill Nav
│   ├── theme/                # ThemeProvider (Dark, Light, High Contrast)
│   └── ui/                   # Primitif UI (KaTeX Math, Modal, Button, Slider)
├── content/                  # Single Source of Truth Kurikulum STEM
│   ├── data/concepts/        # 47 Berkas JSON Konsep Terkurasi
│   ├── schema/               # Validasi Skema Zod Kurikulum & Langkah
│   ├── loader.ts             # Content Loader Tervalidasi
│   ├── registry.ts           # ContentRegistry Singleton
│   └── versioning.ts         # Pengelolaan Versi Konten Deterministik
├── features/                 # Komponen Interaktif Terisolasi Berdasarkan Domain Fitur
│   ├── concept-graph/        # Engine Kanvas SVG Concept Graph 2D
│   ├── dashboard/            # Kartu Metrik, Profil 6 Dimensi, & Kartu Rekomendasi
│   ├── lab/                  # Implementasi 14 Stasiun Laboratorium Eksplorasi
│   └── learning/             # Player Langkah, Tutor Nai Sokratis, & Mode Guru
├── lib/                      # Utilitas Umum, Logger, & Skema Environment
└── server/                   # Backend Logika Bisnis & Lapisan Akses Data
    ├── ai/                   # Multi-Provider AI Gateway & Engine Tutor Sokratis
    ├── auth/                 # Sesi HMAC, Resolver Tamu/Member, Token Verifikasi
    ├── db/                   # Skema Drizzle ORM (PostgreSQL & PGlite In-Memory)
    └── services/             # Evaluator, Mastery Engine, Progress, Retrieval
```

---

## Memulai (Quick Start)

### Prasyarat Sistem
* [Node.js](https://nodejs.org/) v20.x atau lebih baru
* [pnpm](https://pnpm.io/) v9.x atau lebih baru

### 1. Clone & Instalasi Dependensi
```bash
git clone https://github.com/santosssaja/nalar-dsz.git
cd nalar-dsz
pnpm install
```

### 2. Pengaturan Lingkungan (`.env`)
Salin berkas template konfigurasi:
```bash
cp .env.example .env
```

> **Catatan Database (Zero Config Development):**  
> Jika `DATABASE_URL` dikosongkan, Nalar **secara otomatis menggunakan PGlite in-memory**. Anda dapat langsung menjalankan dan menguji aplikasi secara penuh tanpa perlu menginstal atau menyalakan service PostgreSQL eksternal!

### 3. Menjalankan Server Pengembangan
```bash
pnpm dev
```
Buka peramban di [http://localhost:3000](http://localhost:3000).

---

## Konfigurasi AI Tutor "Nai"

Nalar mendukung arsitektur multi-provider cerdas. Pilih opsi yang paling sesuai dengan kebutuhan Anda di `.env`:

```env
# Provider aktif: 'gemma' | 'google' | 'openai' | 'anthropic' | 'curated'
AI_DEFAULT_PROVIDER=gemma
```

| Provider | Konfigurasi `.env` | Keterangan |
| :--- | :--- | :--- |
| **Google Gemma (Default)** | `GEMMA_API_KEY=...`<br>`GEMMA_MODEL=gemma-4-31b-it` | Rekomendasi utama via Google AI Studio. |
| **Ollama (100% Offline & Gratis)** | `GEMMA_ENDPOINT=http://localhost:11434`<br>`GEMMA_MODEL=gemma2:9b` | Jalankan model open-weights secara lokal di komputer Anda tanpa koneksi internet. |
| **Google Gemini** | `GEMINI_API_KEY=...`<br>`GEMINI_MODEL=gemini-1.5-flash` | Alternatif cloud Google berkemampuan tinggi. |
| **OpenAI / Compatible** | `OPENAI_API_KEY=...`<br>`OPENAI_MODEL=gpt-4o-mini` | Mendukung OpenAI, Groq, OpenRouter, atau vLLM. |
| **Anthropic Claude** | `ANTHROPIC_API_KEY=...`<br>`ANTHROPIC_MODEL=claude-3-5-haiku-20241022` | Penalaran mendalam via Anthropic API. |
| **Curated Engine** | *(Dikosongkan / default fallback)* | Menggunakan respons kurikulum deterministik terkurasi. 100% bebas biaya dan selalu siap sedia. |

---

## Pengujian & Kualitas

Nalar menerapkan piramida pengujian ketat (*fail-closed* dan *strict validation*) untuk menjamin keandalan pedagogis dan integritas data:

```bash
# Menjalankan seluruh rangkaian tes otomatis (111 tests)
pnpm test

# Menjalankan pengecekan tipe statis TypeScript
pnpm typecheck

# Menjalankan linter ESLint
pnpm lint

# Membangun build produksi aplikasi
pnpm build
```

---

## Dokumentasi Teknis Lanjutan

Untuk panduan pengembangan komprehensif, silakan pelajari berkas di direktori `docs/`:
* [Dokumen Konsep Lengkap](docs/Nalar_Dokumen_Konsep_Lengkap.md) — Filosofi produk, kurikulum, dan fondasi pedagogis.
* [Panduan Arsitektur](docs/architecture.md) — Struktur data flow, boundary server/client, dan integrasi AI.
* [Desain Sistem UI](docs/ui-system.md) — Tipografi, palet token, aksesibilitas, dan perilaku responsif.
* [Konfigurasi LLM Lengkap](docs/llm-configuration.md) — Panduan integrasi Ollama, Gemma, dan provider AI lainnya.
* [Panduan Pelaksanaan Kerja Agent](docs/execution-guide.md) — Protokol pengkodean terstandarisasi untuk developer & AI agent.

---

<div align="center">
  <p>Dibuat dengan dedikasi untuk memajukan pendidikan STEM yang berakar pada nalar dan pemahaman sejati.</p>
</div>
