# Project State

## Snapshot saat ini

**Tanggal pembaruan:** 2026-09-19  
**Tahap:** Implementasi Lengkap Kurikulum STEM Nalar (47 Konsep Terkurasi, 14 Stasiun Nalar Lab Interaktif, Concept Graph 2D Knowledge Mesh, & AI Tutor Nai Multi-Provider)  
**Source code aplikasi:** Next.js 15 App Router (TypeScript strict), Tailwind CSS + design tokens, Drizzle ORM PostgreSQL schema, adapter PGlite / in-memory, actor/device resolver (guest & member session, auto-persisted guest device key cookie, atomic concurrency-safe insertion), persistent zero-flash ThemeProvider dengan synchronous head script dan dynamic local-first sync, pemisah tema (Terang / Gelap) dengan opsi aksesibilitas Kontras Tinggi (High Contrast) mandiri berupa slide button toggle, NavHeader responsif Smart Auto-Hide (sembunyi mulus saat scroll ke bawah untuk fokus belajar, muncul instan saat scroll ke atas untuk navigasi, dan ramah keyboard via focus capture), scrollbar-gutter stable dengan scrollbar ramping terintegrasi token tema, single-page authentication (`/auth` dan modal) dengan tab switch Login/Register, verifikasi email sekali klik (magic link) via Google Gmail SMTP (`nodemailer`) dengan halaman verifikasi otomatis (`/auth/verify`), health check endpoint, content loader & schema Zod terpusat (`ContentRegistry` singleton):
- **4 Domain STEM Aktif:** Matematika, Fisika, Kimia, Biologi.
- **5 Modul Pembelajaran Lengkap Sesuai Kurikulum:**
  1. `fondasi-matematika` (9 konsep): Bilangan, Operasi Aritmetika, Pecahan dan Desimal, Rasio dan Proporsi, Persentase, Pangkat dan Akar, Urutan dan Pola, Estimasi, Satuan dan Pengukuran Fondasi.
  2. `turunan` (3 konsep): Perubahan, Laju Perubahan, Definisi Turunan.
  3. `fisika-mekanika` (18 konsep): Pengukuran dan Besaran, Vektor, Kinematika, Gerak Lurus, Gerak Parabola, Gerak Melingkar, Hukum Newton, Gaya, Gesekan, Usaha dan Energi, Momentum dan Impuls, Tumbukan, Rotasi, Torsi, Momentum Sudut, Gravitasi, Kesetimbangan, Osilasi.
  4. `kimia-dasar` (11 konsep): Materi dan Sifatnya, Unsur dan Senyawa, Atom, Molekul, Ion, Sistem Periodik, Konfigurasi Elektron, Bilangan Kuantum, Ikatan Kimia, Struktur Lewis, Geometri Molekul.
  5. `biologi-dasar` (6 konsep): Karakteristik Kehidupan, Tingkatan Organisasi Kehidupan, Metode Ilmiah, Sel, Molekul Biologis, Energi dalam Sistem Biologis.
- **47 Konsep Terkurasi Standar Penuh:** Seluruh 47 konsep mematuhi pedoman kurikulum 6-tahap Nalar (`encounter` → `explore` → `predict` → `understand` → `practice` → `explain`), KaTeX math typesetting, 4-layer hints (`orientation`, `concept`, `strategy`, `solution`), deteksi miskonsepsi terpetakan dengan trigger numerik/distraktor, rubrik semantik di level konsep, serta teks ramah pembaca layar (screen-reader accessibility).
- **Nalar Lab Suite Lengkap 14-Stasiun Eksplorasi Interaktif (`/lab`):**
  1. *Kalkulus:* Garis Sekan ke Garis Singgung & Turunan Sesaat
  2. *Matematika:* Garis Bilangan & Nilai Mutlak
  3. *Matematika:* Pecahan, Rasio Proporsi, & Persentase Visual
  4. *Matematika:* Pola Pertumbuhan Eksponensial ($2^n$) vs Linier & Kuadratik
  5. *Fisika:* Vektor Geometri & Resultan Analitik
  6. *Fisika:* Kinematika Parabola 2 Dimensi & Jarak Maksimum
  7. *Fisika:* Dinamika Hukum Newton, Free Body Diagram (FBD), & Transisi Gesekan Statis/Kinetis
  8. *Fisika:* Gerak Harmonik Sederhana (GHS) & Kekekalan Energi Mekanik ($E_p + E_k$)
  9. *Kimia:* Termodinamika Wujud Materi & Kinetika Partikel
  10. *Kimia:* Model Atom Bohr & Tren Keperiodikan
  11. *Kimia:* Ikatan Kimia, Titik Lewis, & Geometri VSEPR 3D
  12. *Biologi:* Skala Ukuran Hayati dari Nanometer ke Biosfer
  13. *Biologi:* Komparasi Sitologi Sel Prokariotik, Hewan, & Tumbuhan
  14. *Biologi:* Daur Bioenergetika Fotosintesis Kloroplas & Respirasi Mitokondria (ATP)
  *(Switcher stasiun lab dirancang ultra-ringkas 1 baris ramping ~48px: ikon stasiun aktif, dropdown select native terkelompok per domain STEM, tombol navigasi sekuensial Prev/Next berindikator nomor, dan tautan modul kurikulum terkait).*
- **Concept Graph 2D Interaktif (`/graph`):** Visualisasi SVG interaktif jejaring konsep 4 domain dengan 47 node konsep, modul, prasyarat, filter pencarian live, dan jalinan lintas disiplin (knowledge mesh connections). Dilengkapi optimasi mobile 2D ramah sentuhan: kanvas bersih tanpa overlay (`h-[400px] sm:h-[480px] md:h-auto` dengan `w-[880px] md:w-full shrink-0`) yang mendukung seret bebas 360 derajat (horizontal & vertikal), bilah toolbar atas yang memadukan legenda dan tombol navigasi 4-arah (`ChevronLeft`, `ChevronRight`, `ChevronUp`, `ChevronDown`) serta kontrol zoom, dan kartu detail konsep yang ditempatkan secara alami di bawah kanvas sehingga tidak pernah menutupi node mana pun.
- **Mode Guru (Teach Mode):** Dilengkapi pertanyaan pemantik Sokratis Nai yang unik untuk setiap konsep di seluruh modul.
- **Showcase & Halaman Beranda Interaktif:** Beranda (`/`) diperbarui secara komprehensif menampilkan metrik 47 konsep, gerbang langsung ke 14 stasiun Nalar Lab, pratinjau Concept Graph 2D, pemaparan tutor Sokratis Nai, kurikulum 4 domain, dan prinsip pedagogis Active Before Passive.
- **Dashboard Pemahaman Belajar Terintegrasi (`/dashboard`):** Pusat kendali kemajuan belajar pelajar yang menyatukan 4 kartu metrik utama (konsep terkuasai, sedang berjalan, uji retensi jatuh tempo, dan skor rata-rata), rekomendasi adaptif langkah terbaik lintas modul (`getGlobalLearnerRecommendation`), kemajuan terperinci pada 5 modul STEM, profil analisis 6 dimensi penguasaan Nalar (`understanding`, `practice`, `application`, `transfer`, `explanation`, `retention`), peta miskonsepsi aktif dengan arahan pembenahan logika, serta akses cepat ke Nalar Lab dan Graf Konsep.
- **Penanganan Galat & Rute Belum Terpetakan (`not-found.tsx` & `error.tsx`):** Halaman 404 kustom yang tenang dan terarah secara pedagogis (Galat 404: Koordinat Belum Terpetakan) dilengkapi tombol navigasi cepat (Dashboard, Graf Konsep, Beranda, tombol Kembali), gerbang Nalar Lab, serta tautan langsung ke 5 modul kurikulum STEM; didukung error boundary `error.tsx` yang aman (tanpa mengekspos detail raw DB / secret).
- **Verifikasi Kualitas:** 26 test suite (88 tests) lulus 100%, TypeScript typecheck lulus 100% (`tsc --noEmit`), zero syntax/lint error, zero-emoji UI design dengan Lucide icons.

## Target implementasi berikutnya

- Evaluasi telemetry performa pada hosting production cloud (misal Vercel / Railway / Cloudflare) bila akun cloud telah ditentukan.

## Scope yang sedang dikunci

- Kurikulum inti mencakup 4 pilar STEM: Matematika (Fondasi + Turunan), Fisika Mekanika, Kimia Dasar, dan Biologi Dasar.
- Google Gemma ditetapkan sebagai default provider untuk AI Tutor Nai, dengan kemampuan berganti model/provider (OpenAI, Claude, Gemini, Local Curated).
- Zero-friction guest learning: mulai belajar langsung tanpa login, auth opsional untuk sinkronisasi.
- Fallback deterministik bebas biaya: jika API key LLM tidak disediakan di environment, sistem AI Tutor tetap berfungsi dengan curated pedagogical engine.

## Hal yang belum diputuskan

| Keputusan | Status | Dampak |
| --- | --- | --- |
| Platform hosting serverless konkret | Open | Menentukan konfigurasi deployment dan adapter observability. |
| Provider PostgreSQL, auth, AI, dan analytics konkret | Open | Jangan mengunci SDK/provider sampai pengguna memilih atau proyek memiliki konfigurasi. |
| Formula final mastery dan jadwal decay | Open | Buat interface dan test behavior, jangan mengklaim formula ilmiah final. |
| Model authoring/backoffice | Deferred | Di luar MVP; content dapat berasal dari file tervalidasi. |

## Cara memperbarui dokumen ini

Perbarui snapshot ini setelah perubahan material: bootstrap selesai, provider dipilih, schema dibuat, milestone tercapai, atau keputusan open menjadi locked. Jangan mencatat detail tugas kecil atau status sementara yang cepat usang. Tambahkan keputusan ke `decisions.md`, bukan ke dokumen ini, jika keputusan tersebut perlu alasan dan riwayat.
