# Nalar --- Dokumen Konsep & Visi Produk

> **Tagline:** *Belajar bukan hanya sampai bisa menjawab. Belajar sampai
> tahu mengapa ini bekerja.*

## 1. Ringkasan Produk

**Nalar** adalah platform pembelajaran STEM interaktif, visual, adaptif,
inklusif, dan dapat diakses gratis tanpa hambatan login di awal.

Nalar mengambil inspirasi dari dua paradigma yang berbeda:

-   **Duolingo:** microlearning, progression, habit, feedback cepat, dan
    motivasi visual.
-   **Brilliant:** pembelajaran berbasis eksplorasi, simulasi, prediksi,
    dan penemuan konsep.

Namun Nalar tidak diposisikan sebagai tiruan keduanya. Identitas Nalar
dibangun melalui:

1.  **Learning Path** --- perjalanan konsep yang terstruktur.
2.  **Concept Graph** --- hubungan antarkonsep.
3.  **Adaptive Path** --- jalur belajar yang berubah berdasarkan
    pemahaman pengguna.
4.  **Mistake Map** --- pemetaan pola kesalahan, bukan sekadar jawaban
    salah.
5.  **Adaptive Hint** --- bantuan berdasarkan jenis kesulitan.
6.  **Explain It Back** --- pengguna membuktikan pemahaman dengan
    menjelaskan kembali.
7.  **Mastery & Decay** --- progress didasarkan pada kedalaman pemahaman
    dan retensi.
8.  **Nalar Lab** --- eksperimen dan problem lintas konsep.
9.  **AI Tutor Nai** --- AI sebagai tutor adaptif dan scaffolding, bukan
    mesin pemberi jawaban.

------------------------------------------------------------------------

# 2. Masalah yang Ingin Diselesaikan

## 2.1 Materi STEM terlalu abstrak

Banyak materi matematika dan sains disampaikan melalui definisi, rumus,
dan prosedur sebelum peserta didik memahami fenomena yang mendasarinya.

Nalar menggunakan prinsip:

> **Intuisi → Interaksi → Penalaran → Abstraksi → Penerapan**

## 2.2 Learning platform sering berorientasi completion

Menyelesaikan banyak lesson tidak selalu berarti memahami konsep.

Nalar membedakan:

-   **Completion:** aktivitas selesai.
-   **Understanding:** konsep dapat dijelaskan.
-   **Application:** konsep dapat digunakan.
-   **Transfer:** konsep dapat digunakan dalam konteks baru.
-   **Connection:** konsep dapat dihubungkan dengan konsep lain.
-   **Retention:** konsep masih dapat dipanggil kembali setelah jeda.

## 2.3 Akses dan inklusivitas

Nalar mempertahankan prinsip akses tanpa login pada awal penggunaan,
penyimpanan hybrid, dan aksesibilitas sebagai bagian inti arsitektur.

------------------------------------------------------------------------

# 3. Prinsip Desain Nalar

## 3.1 Learn by Understanding

Nalar tidak mengejar banyaknya materi yang selesai, tetapi kualitas
model mental yang terbentuk.

## 3.2 Active Before Passive

Pengguna didorong untuk mencoba, memprediksi, dan berpikir sebelum
memperoleh penjelasan formal.

## 3.3 Feedback Before Answer

Kesalahan menjadi informasi untuk menentukan bantuan berikutnya.

## 3.4 Adaptive, Not Punitive

Sistem menyesuaikan jalur belajar berdasarkan kebutuhan pengguna, bukan
menghukum pengguna karena kesalahan.

## 3.5 Accessibility by Default

Aksesibilitas bukan fitur tambahan.

## 3.6 AI as Scaffolding

AI membantu pengguna berpikir, bukan mengambil alih proses berpikir.

## 3.7 Short Activities, Deep Journey

Aktivitas individual dibuat cukup kecil agar mudah dimulai, tetapi
sebuah modul dapat membentuk perjalanan belajar yang dalam dan berlapis.

------------------------------------------------------------------------

# 4. Arsitektur Pembelajaran

Struktur utama Nalar terdiri dari empat lapisan:

``` text
DOMAIN
  │
  ├── Matematika
  ├── Fisika
  ├── Kimia
  └── Biologi
       │
       ↓
MODULE
       │
       ↓
LEARNING PATH
       │
       ↓
LEARNING STEPS
```

## 4.1 Domain

Bidang ilmu besar, misalnya Matematika atau Fisika.

## 4.2 Module

Satu tujuan pembelajaran besar, misalnya:

-   Kalkulus
-   Turunan
-   Aljabar Linear
-   Mekanika
-   Relativitas

## 4.3 Learning Path

Urutan konsep dan hubungan prasyarat yang membentuk perjalanan
pembelajaran.

## 4.4 Learning Steps

Aktivitas mikro yang membentuk satu pengalaman belajar lengkap.

------------------------------------------------------------------------

# 5. Module Overview

Ketika pengguna memilih modul, Nalar tidak langsung membuka lesson.

Contoh:

## Turunan

**Tujuan:** memahami bagaimana suatu besaran berubah terhadap besaran
lainnya.

Informasi yang ditampilkan:

-   jumlah konsep
-   jumlah playground
-   jumlah challenge
-   estimasi waktu
-   prasyarat
-   konsep yang akan diperoleh
-   koneksi ke modul lain
-   progress mastery

Contoh:

``` text
TURUNAN

12 konsep
7 playground
24 challenges
± 4–6 jam

Prasyarat:
✓ Fungsi
✓ Grafik
○ Limit

[Mulai Learning Path]
```

Estimasi waktu hanya bersifat perkiraan. Nalar tidak mengoptimalkan
lamanya pengguna berada di aplikasi.

------------------------------------------------------------------------

# 6. Learning Path

Learning Path adalah peta perjalanan belajar, bukan sekadar daftar
lesson.

Contoh:

``` text
TURUNAN
 │
 ├── 01. Perubahan
 │    ├── Perubahan diskrit
 │    └── Perubahan kontinu
 │
 ├── 02. Laju Perubahan
 │    ├── Average Rate
 │    ├── Grafik posisi
 │    └── Kecepatan
 │
 ├── 03. Mendekati Sesuatu
 │    ├── Limit intuitif
 │    ├── Limit grafik
 │    └── Limit numerik
 │
 ├── 04. Turunan
 │    ├── Secant → Tangent
 │    ├── Definisi turunan
 │    └── Notasi turunan
 │
 ├── 05. Aturan Turunan
 │    ├── Constant Rule
 │    ├── Power Rule
 │    ├── Product Rule
 │    └── Chain Rule
 │
 ├── 06. Aplikasi
 │    ├── Kecepatan
 │    ├── Optimasi
 │    └── Related Rates
 │
 └── NALAR LAB
```

Pengguna dapat melihat keseluruhan perjalanan, termasuk konten yang
belum dikerjakan.

------------------------------------------------------------------------

# 7. Concept Graph

Learning Path bersifat pedagogis; Concept Graph menunjukkan struktur
pengetahuan.

Contoh:

``` text
              PROPORSI
                  │
       ┌──────────┼──────────┐
       ↓          ↓          ↓
    Pecahan      Rasio    Persentase
       │                     │
       └──────────┬──────────┘
                  ↓
               Bunga
                  ↓
             Pertumbuhan
                  ↓
        Pertumbuhan Eksponensial
```

Ketika konsep dikuasai, Nalar dapat menampilkan:

> **Connection unlocked**

Tujuannya agar pengguna memahami bahwa ilmu bukan kumpulan bab yang
terpisah.

------------------------------------------------------------------------

# 8. Learning Steps

Satu konsep tidak selesai hanya karena pengguna membaca penjelasan.

Setiap konsep dapat menggunakan rangkaian:

``` text
Encounter
   ↓
Explore
   ↓
Predict
   ↓
Discover
   ↓
Understand
   ↓
Practice
   ↓
Apply
   ↓
Transfer
   ↓
Explain It Back
   ↓
Experiment
   ↓
Retrieve
   ↓
Connect
```

Tidak semua konsep wajib menggunakan seluruh langkah. Engine menentukan
kedalaman sesuai karakter konsep.

## 8.1 Encounter

Fenomena atau pertanyaan pemantik.

Contoh:

> Mengapa mobil yang semakin cepat memiliki percepatan?

## 8.2 Explore

Pengguna memanipulasi visualisasi atau parameter.

## 8.3 Predict

Pengguna membuat prediksi sebelum melihat hasil.

## 8.4 Discover

Sistem membantu pengguna melihat pola dari hasil eksplorasi.

## 8.5 Understand

Konsep formal, definisi, notasi, dan matematika diperkenalkan.

## 8.6 Practice

Latihan terarah untuk membangun kelancaran.

## 8.7 Apply

Konsep digunakan dalam masalah kontekstual.

## 8.8 Transfer

Konsep digunakan dalam situasi berbeda untuk menguji pemahaman
sebenarnya.

## 8.9 Explain It Back

Pengguna menjelaskan konsep dengan kata-katanya sendiri.

## 8.10 Experiment

Pengguna bebas bereksperimen menggunakan playground.

## 8.11 Retrieve

Konsep dipanggil kembali setelah jeda.

## 8.12 Connect

Pengguna melihat hubungan konsep dengan pengetahuan lain.

------------------------------------------------------------------------

# 9. Adaptive Path

Learning Path adalah kurikulum dasar.

Adaptive Path adalah perjalanan individual pengguna.

Contoh pengguna A:

``` text
Concept ✓
Practice ✓
Application ✓
Transfer ✓
```

Nalar dapat melanjutkan.

Pengguna B:

``` text
Concept ✓
Practice ✗
Transfer ✗
```

Nalar membuat remedial path:

``` text
Visual Slope
   ↓
Positive / Negative
   ↓
Slope Calculation
   ↓
Slope & Rate
   ↓
Kembali ke konsep utama
```

Dengan demikian, dua pengguna dapat mempelajari modul yang sama melalui
jalur yang berbeda.

------------------------------------------------------------------------

# 10. Mastery Model

Nalar tidak menggunakan satu angka completion sebagai ukuran pemahaman.

Setiap konsep dapat memiliki beberapa dimensi:

``` text
UNDERSTANDING
████████░░ 80%

PRACTICE
██████████ 100%

APPLICATION
████████░░ 80%

TRANSFER
██████░░░░ 60%

EXPLANATION
███████░░░ 70%

RETENTION
████████░░ 80%
```

Status keseluruhan konsep ditentukan oleh kombinasi bukti tersebut.

Tujuannya bukan membuat skor akademik palsu, tetapi memberi gambaran
tentang bagian mana yang sudah kuat dan mana yang perlu diperkuat.

------------------------------------------------------------------------

# 11. Mistake Map

Nalar menyimpan pola kesalahan.

Bukan:

> Soal 7 --- Salah.

Tetapi:

``` text
MISTAKE MAP

Pecahan
████████░░ 80%

Pola yang ditemukan:
├── Operasi pecahan
├── Menyamakan penyebut
└── Konversi pecahan → desimal
```

Kesalahan digunakan untuk menentukan:

-   remedial
-   hint
-   review
-   urutan latihan
-   rekomendasi konsep

Satu kesalahan tidak langsung berarti pengguna tidak memahami seluruh
topik.

------------------------------------------------------------------------

# 12. Adaptive Hint System

Sistem hint tidak hanya berdasarkan jumlah kesalahan.

Hint dipilih berdasarkan jenis hambatan.

## Layer 1 --- Orientation

Membantu pengguna melihat informasi penting.

> "Informasi apa saja yang diberikan?"

## Layer 2 --- Concept

Mengingatkan konsep yang relevan.

> "Perubahan kecepatan terhadap waktu berkaitan dengan konsep apa?"

## Layer 3 --- Strategy

Memberi strategi tanpa menyelesaikan semuanya.

> "Coba gunakan hubungan Δv / Δt."

## Layer 4 --- Solution

Memberikan solusi lengkap dan menjelaskan prosesnya.

Untuk playground, solusi dapat divisualisasikan dengan mengubah
parameter ke kondisi jawaban.

------------------------------------------------------------------------

# 13. Prediction Engine

Prediction adalah fitur inti Nalar.

Sebelum sistem menampilkan hasil:

> **Apa yang menurutmu akan terjadi?**

Pengguna dapat:

-   memilih prediksi
-   menggeser parameter
-   menggambar prediksi
-   menyusun urutan
-   memberikan estimasi angka

Kemudian sistem menampilkan hasil.

Jika prediksi berbeda:

> "Prediksimu berbeda dari hasil eksperimen. Mari cari tahu bagian mana
> dari model mentalmu yang perlu diperbaiki."

Kesalahan prediksi diperlakukan sebagai bahan belajar.

------------------------------------------------------------------------

# 14. Explain It Back

Setelah konsep dipelajari:

> **Jelaskan konsep ini dengan kata-katamu sendiri.**

AI menganalisis apakah penjelasan pengguna mencakup elemen penting.

Contoh:

> "Kecepatan adalah perubahan posisi terhadap waktu."

Nai:

> "Benar. Kamu sudah menangkap hubungan perubahan posisi dan waktu. Coba
> tambahkan satu hal: kecepatan juga memiliki arah."

Sistem tidak hanya mengecek keyword. Untuk jawaban terbuka, AI digunakan
untuk analisis semantik dengan rubrik konsep yang telah ditentukan.

------------------------------------------------------------------------

# 15. Teach Mode

Dalam Teach Mode, pengguna menjadi pengajar.

Nai berpura-pura belum memahami konsep.

Contoh:

> **Nai:** "Kenapa penyebut pecahan berbeda tidak boleh langsung
> dijumlahkan?"

Pengguna menjelaskan.

Nai kemudian memberikan pertanyaan lanjutan.

Tujuannya menguji apakah pengguna dapat:

-   menjelaskan
-   memberi alasan
-   memberi contoh
-   menghadapi pertanyaan lanjutan

------------------------------------------------------------------------

# 16. AI Tutor --- Nai

Nai adalah panda merah yang menjadi tutor AI Nalar.

Karakter:

-   ceria
-   sabar
-   suportif
-   sedikit jahil
-   tidak menghakimi

Namun prinsip utamanya:

> **Nai semakin sedikit membantu ketika pengguna semakin mampu.**

Nai memiliki tiga mode:

### Guide

Mengenalkan konsep.

### Tutor

Membantu ketika pengguna mengalami kesulitan.

### Invisible

Tidak mengganggu ketika pengguna dapat belajar sendiri.

Nai dapat disembunyikan dan animasi dapat dimatikan.

------------------------------------------------------------------------

# 17. AI Architecture

Materi inti harus terkurasi.

``` text
CURATED CONTENT
├── Concept explanation
├── Formula
├── Playground
├── Challenge
├── Hint
└── Rubric
        │
        ↓
     NAI / LLM
        │
        ├── Natural language
        ├── Hint adaptation
        ├── Explain It Back
        ├── Socratic dialogue
        └── Mistake interpretation
```

LLM tidak perlu menghasilkan seluruh materi dari nol pada setiap
kunjungan.

Ini memberikan:

-   konsistensi
-   biaya lebih rendah
-   kontrol kualitas
-   keamanan pedagogis
-   respons lebih cepat

AI digunakan terutama ketika natural language dan adaptasi benar-benar
dibutuhkan.

------------------------------------------------------------------------

# 18. Socratic Mode

Jika pengguna bertanya:

> "Kenapa jawabannya 24?"

Nai tidak selalu langsung menjawab.

Contoh:

> "Menurutmu, angka 24 berasal dari operasi apa?"

Pengguna menjawab.

Nai melanjutkan pertanyaan berdasarkan respons.

Tujuannya membuat pengguna menemukan alasan sendiri.

------------------------------------------------------------------------

# 19. Nalar Lab

Nalar Lab adalah ruang eksperimen dan integrasi lintas konsep.

Di sini pengguna tidak mengikuti soal satu per satu.

Contoh:

## Prediksi hasil lemparan dadu

Pengguna:

1.  membuat hipotesis
2.  menjalankan simulasi
3.  mengumpulkan data
4.  melihat distribusi
5.  membandingkan hasil dengan teori
6.  menjelaskan perbedaan
7.  menarik kesimpulan

Struktur:

``` text
Learn
 ↓
Explore
 ↓
Experiment
 ↓
Analyze
 ↓
Explain
 ↓
Reflect
```

Nalar Lab menjadi salah satu pembeda utama dari aplikasi pembelajaran
berbasis lesson biasa.

------------------------------------------------------------------------

# 20. Mastery Decay & Retrieval

Setelah pengguna menguasai konsep, Nalar tidak menganggap konsep
tersebut selesai selamanya.

Setelah beberapa waktu:

> **"Masih ingat?"**

Pengguna mendapat retrieval challenge singkat.

Jika gagal:

> "Konsep ini mulai memudar. Mari kita aktifkan kembali."

Sistem kemudian membuat review kecil.

Fokusnya adalah **retensi**, bukan sekadar completion.

------------------------------------------------------------------------

# 21. Learning Momentum

Nalar dapat menggunakan momentum daripada streak sebagai indikator
konsistensi.

Contoh:

``` text
LEARNING MOMENTUM

██████████████░░

3 konsep dipahami
2 konsep direview
1 koneksi baru ditemukan
```

Pengguna tidak dihukum keras karena melewatkan satu hari.

Tujuan sistem:

> membangun kebiasaan belajar yang berkelanjutan tanpa membuat pengguna
> merasa gagal hanya karena satu hari terlewat.

------------------------------------------------------------------------

# 22. Gamifikasi

Gamifikasi tetap digunakan, tetapi tidak menjadi tujuan utama.

## XP

XP dapat diberikan untuk:

-   menyelesaikan challenge
-   menemukan koneksi
-   menyelesaikan eksperimen
-   menyelesaikan review

Namun XP bukan indikator pemahaman.

## Badge

Contoh:

-   First Steps
-   Polymath
-   Explorer
-   Experimenter
-   Explainer

## Progress

Progress utama ditampilkan sebagai:

-   Concept Mastery
-   Learning Path
-   Concept Graph
-   Learning Momentum

------------------------------------------------------------------------

# 23. Adaptasi Jenjang

Nalar mempertahankan pendekatan berlapis.

## Simple

Analogi dan bahasa sederhana.

## Standard

Notasi dan penjelasan langkah demi langkah.

## Advanced

Pembuktian formal, edge cases, dan hubungan lintas topik.

Pengguna tidak harus dikunci berdasarkan usia. Tingkat kedalaman dapat
berubah berdasarkan kemampuan.

------------------------------------------------------------------------

# 24. Kurikulum

Nalar dapat mencakup:
selengkapnya di @kurikulum.md

## Matematika

-   Bilangan
-   Aljabar
-   Geometri
-   Logika
-   Kalkulus
-   Matematika Diskrit
-   Bilangan Kompleks
-   Aljabar Linear
-   Statistika
-   Analisis
-   Aljabar Abstrak
-   Topologi
-   Fourier
-   Optimasi
-   Kriptografi

## Sains

-   Fisika
-   Kimia
-   Biologi

Dengan cross-link antarbidang.

Contoh:

``` text
Kalkulus
   ↓
Turunan
   ↓
Kecepatan
   ↓
Fisika
   ↓
Gerak
```

------------------------------------------------------------------------

# 25. Accessibility

Aksesibilitas merupakan bagian inti.

## Visual

-   Light
-   Dark
-   High Contrast
-   ukuran teks fleksibel
-   fokus keyboard yang jelas
-   tidak bergantung pada warna saja

## Audio

-   Text-to-Speech
-   deskripsi perubahan parameter
-   narasi alternatif

## Tunarungu

-   subtitle
-   feedback visual
-   status tidak hanya menggunakan audio

## Keyboard

-   Tab
-   Arrow
-   Enter
-   Space
-   shortcut `?`

## Motion

-   animasi dapat dimatikan
-   reduced motion
-   tidak ada informasi penting yang hanya disampaikan melalui animasi

------------------------------------------------------------------------

# 26. Arsitektur Data & Akses

Prinsip:

> **Zero-Friction First.**

Pengguna dapat mulai belajar tanpa registrasi.

Penyimpanan dapat menggunakan:

``` text
LOCAL
├── progress
├── preferences
├── cached content
└── offline state

        ↕ sync

SERVER
├── account
├── backup
├── cross-device sync
└── analytics
```

Login menjadi pilihan untuk sinkronisasi, bukan tembok masuk.

------------------------------------------------------------------------

# 27. Pengalaman Pengguna

Alur utama:

``` text
Landing
  ↓
Pilih minat
  ↓
Pilih module
  ↓
Module Overview
  ↓
Learning Path
  ↓
Concept
  ↓
Learning Steps
  ↓
Challenge
  ↓
Adaptive Hint
  ↓
Mastery
  ↓
Connection
  ↓
Review
  ↓
Nalar Lab
```

------------------------------------------------------------------------

# 28. Identitas Visual

Gaya:

-   clean
-   minimalis
-   halus
-   responsif
-   visual tetapi tidak berlebihan
-   fokus pada konten

Nai digunakan sebagai karakter pendamping, bukan pusat UI.

Antarmuka harus tetap dapat digunakan dengan baik ketika Nai
disembunyikan.

------------------------------------------------------------------------

# 29. Contoh Pengalaman Lengkap

## Modul: Turunan

Pengguna membuka modul.

### Module Overview

> "Pelajari bagaimana suatu besaran berubah."

Kemudian Learning Path:

``` text
Perubahan
 ↓
Laju Perubahan
 ↓
Limit
 ↓
Turunan
 ↓
Aturan Turunan
 ↓
Aplikasi
 ↓
Nalar Lab
```

Pengguna memilih **Turunan**.

### Step 1 --- Encounter

> "Bagaimana kita mengetahui seberapa curam jalan pada satu titik?"

### Step 2 --- Explore

Pengguna menggeser titik pada grafik.

### Step 3 --- Predict

> "Apa yang terjadi pada slope ketika titik kedua semakin dekat?"

### Step 4 --- Discover

Secant berubah menjadi tangent.

### Step 5 --- Understand

Baru muncul:

\[ f'(x)=`\lim`{=tex}\_{h`\rightarrow0`{=tex}}
`\frac{f(x+h)-f(x)}{h}`{=tex} \]

### Step 6 --- Practice

Latihan sederhana.

### Step 7 --- Apply

Masalah kecepatan kendaraan.

### Step 8 --- Transfer

Pertumbuhan populasi.

### Step 9 --- Explain

> "Jelaskan arti turunan tanpa menggunakan rumus."

### Step 10 --- Experiment

Playground.

### Step 11 --- Retrieve

Beberapa hari kemudian:

> "Apa hubungan slope dan turunan?"

### Step 12 --- Connect

``` text
Posisi
 ↓ derivative
Kecepatan
 ↓ derivative
Percepatan
```

Konsep kemudian mendapat status mastery.

------------------------------------------------------------------------

# 30. Prinsip Anti-Cloning

Nalar boleh terinspirasi oleh platform edukasi yang sudah ada, tetapi
tidak menjadikan fitur mereka sebagai identitas utama.

### Jangan menjadikan ini pusat:

-   streak ala Duolingo
-   hearts ala Duolingo
-   path visual yang identik
-   lesson UI yang identik
-   playground yang hanya meniru Brilliant
-   maskot yang selalu muncul
-   XP sebagai ukuran keberhasilan

### Jadikan ini pusat:

**Nalar = pemahaman sebagai jaringan dan perjalanan adaptif.**

Identitas produk:

``` text
              NALAR
                │
       ┌────────┼────────┐
       ↓        ↓        ↓
  LEARNING   MASTERY   CONNECTION
    PATH       │          │
       │       │          │
       ↓       ↓          ↓
   Adaptive  Mistake   Concept
     Path      Map      Graph
       │       │          │
       └───────┼──────────┘
               ↓
          NALAR LAB
```

------------------------------------------------------------------------

# 31. North Star Metric

Nalar sebaiknya tidak mengoptimalkan:

> "Berapa menit pengguna berada di aplikasi?"

atau:

> "Berapa banyak lesson yang diselesaikan?"

Indikator utama yang lebih selaras dengan visi:

## **Meaningful Mastery**

Persentase konsep yang:

1.  dipelajari,
2.  dapat diterapkan,
3.  dapat ditransfer,
4.  dapat dijelaskan,
5.  dan tetap dapat diingat setelah jeda.

Dengan demikian, produk tidak mendapat insentif untuk memperpanjang
lesson secara artifisial.

------------------------------------------------------------------------

# 32. Positioning

Nalar bukan:

> "Brilliant gratis."

Nalar bukan:

> "Duolingo untuk STEM."

Nalar adalah:

> **Platform pembelajaran interaktif yang membantu pengguna membangun,
> menguji, dan mempertahankan pemahaman melalui perjalanan konsep yang
> adaptif.**

### Prinsip singkat:

> **Explore it. Reason about it. Explain it. Connect it.**

Atau dalam bahasa Indonesia:

> **Jelajahi. Nalarkan. Jelaskan. Hubungkan.**

------------------------------------------------------------------------

# 33. Visi Jangka Panjang

Jika dikembangkan penuh, Nalar dapat berkembang dari platform lesson
menjadi **learning intelligence system**.

Sistem tidak hanya mengetahui:

> "User sudah belajar kalkulus."

Tetapi:

> "User memahami konsep limit secara visual, cukup kuat dalam aplikasi,
> tetapi masih lemah dalam transfer dan mulai mengalami penurunan
> retensi."

Kemudian Nalar menentukan pengalaman berikutnya.

Dengan begitu, pengalaman belajar tidak lagi:

``` text
CONTENT
  ↓
USER
```

tetapi:

``` text
CONTENT
   ↓
USER
   ↓
OBSERVATION
   ↓
UNDERSTANDING MODEL
   ↓
ADAPTIVE PATH
   ↓
NEW EXPERIENCE
   ↓
NEW EVIDENCE
   ↺
```

Inilah inti Nalar:

> **Bukan sekadar menyediakan materi untuk dipelajari, tetapi membangun
> sistem yang memahami bagaimana seseorang sedang belajar dan membantu
> mereka bergerak dari "aku bisa mengerjakan" menuju "aku mengerti
> mengapa".**
