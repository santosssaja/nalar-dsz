# Showcase Proyek Nalar — Platform Pembelajaran STEM Interaktif Terpadu

> **"Belajar bukan hanya sampai bisa menjawab. Belajar sampai tahu mengapa ini bekerja."**

---

## 1. Ringkasan Eksekutif

**Nalar** adalah platform pembelajaran STEM (Science, Technology, Engineering, & Mathematics) generasi baru berbasis web yang berpusat pada **pemahaman intuitif, eksplorasi visual real-time, jalur belajar adaptif, dan retensi jangka panjang**.

Berbeda dari aplikasi edutech konvensional yang mengandalkan hafalan rumus mati, video pasif, atau kuis pilihan ganda dangkal berbalut gamifikasi poin/streak semata, Nalar menerapkan prinsip **Active Before Passive**: siswa mengeksplorasi parameter fenomena terlebih dahulu di stasiun simulasi interaktif, membuat prediksi mandiri, baru kemudian merumuskan pemahaman formal berbasis bukti.

---

## 2. Arsitektur Teknis & Keunggulan Platform

| Lapisan Sistem | Teknologi / Pola | Nilai Tambah & Performa |
| --- | --- | --- |
| **Framework & Rendering** | Next.js 15 (App Router, React 19, TypeScript strict) | Server Component secara default untuk kecepatan render awal; Client Component terisolasi pada interaksi simulasi leaf. |
| **Styling & Aksesibilitas** | Tailwind CSS + Token Desain Semantik | Tiga mode tampilan terpadu: Terang, Gelap, dan Kontras Tinggi (High Contrast) mandiri. Aksesibilitas keyboard dan ramah screen reader. |
| **Mesin Graf Pengetahuan** | SVG Deterministik 2D Knowledge Mesh | Visualisasi jaringan 47 konsep STEM dengan tata letak berjenjang bebas tumpang tindih, pembulatan deterministik, dan zero-jitter hover. |
| **Lab Interaktif** | 14 Stasiun Nalar Lab Waktu Nyata | Simulasi parameter fisika, kalkulus, kimia, dan biologi berbasis SVG interaktif dan KaTeX math typesetting. |
| **Tutor Pedagogis Cerdas** | AI Sokratis Nai (Multi-Provider) | Google Gemma (default), Anthropic Claude, OpenAI GPT, Google Gemini, dan Local Curated Deterministic fallback. Penalaran transparan tanpa membocorkan jawaban langsung. |
| **Penyimpanan & Sesi** | PostgreSQL + PGlite / Drizzle ORM | Zero-friction guest experience: belajar seketika tanpa login, cookie perangkat deterministik, dengan opsi sinkronisasi akun via magic link email. |
| **Kualitas & Pengujian** | Vitest + TypeScript strict | 24 berkas pengujian (82 tests passed 100%), 0 error lint/typecheck. |

---

## 3. Empat Domain Inti & 47 Konsep Terkurasi

Nalar mencakup 4 pilar ilmu pengetahuan alam dan matematika terpadu yang mematuhi **Siklus 6 Tahap Kognitif** (*Encounter* → *Explore* → *Predict* → *Understand* → *Practice* → *Explain*):

### A. Fondasi Matematika & Kalkulus (12 Konsep)
- **Modul Fondasi Matematika:**
  1. `bilangan`: Garis Bilangan, Arah Vektor, dan Magnitude
  2. `operasi-aritmetika`: Translasi, Skalasi, dan Sifat Aljabar
  3. `pecahan-dan-desimal`: Bagian Utuh, Kesetaraan Nilai, dan Rasio Pembagi
  4. `rasio-dan-proporsi`: Perbandingan Relatif dan Skala Konstan
  5. `persentase`: Hakikat Per-Seratus dan Asimetri Perubahan Persen
  6. `pangkat-dan-akar`: Pertumbuhan Eksponensial dan Skala Logaritmik
  7. `urutan-dan-pola`: Menemukan Keteraturan Bilangan dan Rekursi
  8. `estimasi`: Seni Pendekatan Cepat dan Orde Magnitudo Fermi
  9. `satuan-dan-pengukuran-matematika`: Dimensi Geometri dan Konversi Dimensi
- **Modul Turunan (Kalkulus Diferensial):**
  10. `perubahan`: Diskrit vs Kontinu
  11. `laju-perubahan`: Laju Rata-rata Sekan
  12. `definisi-turunan`: Garis Sekan Menjadi Garis Singgung Tangent ($\lim_{\Delta x \to 0}$)

### B. Fisika Mekanika Klasik (18 Konsep)
- **Modul Fisika Mekanika:**
  13. `pengukuran-dan-besaran`: Standar SI, Dimensi, dan Ketidakpastian
  14. `vektor`: Besar, Arah, dan Penguraian Komponen Kartesius
  15. `kinematika`: Posisi, Kecepatan, dan Percepatan Diferensial
  16. `gerak-lurus`: GLB, GLBB, dan Interpretasi Grafis
  17. `gerak-parabola`: Superposisi Gerak 2 Dimensi dan Sudut Elevasi
  18. `gerak-melingkar`: Kecepatan Sudut, Laju Linier, dan Gaya Sentripetal
  19. `gaya`: Interaksi Newton, Gaya Kontak, dan Medan Gaya
  20. `hukum-newton`: Inersia, Dinamika $F=ma$, dan Aksi-Reaksi
  21. `gesekan`: Gesekan Statis Maksimum vs Kinetis
  22. `usaha-dan-energi`: Teorema Usaha-Energi dan Konservasi Energi Mekanik
  23. `momentum-dan-impuls`: Vektor Momentum dan Impuls Gaya
  24. `tumbukan`: Elastis Sempurna, Sebagian, dan Tak Lenting Sama Sekali
  25. `rotasi`: Kinematika Sudut, Momen Inersia, dan Percepatan Sudut
  26. `torsi`: Perkalian Silang Vektor dan Lengan Momen
  27. `momentum-sudut`: Konservasi Momentum Sudut pada Sistem Berputar
  28. `kesetimbangan`: Statika Benda Tegar ($\Sigma F = 0$, $\Sigma \tau = 0$)
  29. `gravitasi`: Hukum Gravitasi Universal Kuadrat Terbalik Newton
  30. `osilasi`: Gerak Harmonik Sederhana (GHS) dan Resonansi

### C. Kimia Dasar & Struktur Materi (11 Konsep)
- **Modul Kimia Dasar:**
  31. `materi-dan-sifatnya`: Wujud Materi, Kinetika Partikel, dan Perubahan Fase
  32. `unsur-dan-senyawa`: Zat Tunggal, Senyawa Kimiawi, dan Campuran
  33. `atom`: Struktur Subatomik (Proton, Neutron, Elektron)
  34. `molekul`: Agregat Atomik dan Rumus Senyawa
  35. `ion`: Kation, Anion, dan Ketidakseimbangan Muatan
  36. `sistem-periodik`: Golongan, Periode, dan Tren Sifat Periodik
  37. `konfigurasi-elektron`: Prinsip Aufbau, Larangan Pauli, dan Aturan Hund
  38. `bilangan-kuantum`: Alamat Gelombang Elektron ($n, l, m_l, m_s$)
  39. `ikatan-kimia`: Ikatan Ionik, Kovalen, dan Logam
  40. `struktur-lewis`: Pasangan Elektron Bebas dan Kaidah Oktet
  41. `geometri-molekul`: Teori VSEPR 3D dan Penolakan Pasangan Elektron

### D. Biologi Dasar & Organisasi Kehidupan (6 Konsep)
- **Modul Biologi Dasar:**
  42. `karakteristik-kehidupan`: 7 Ciri Entitas Hidup dan Homeostasis
  43. `tingkatan-organisasi-kehidupan`: Hierarki Hayati (Molekul hingga Biosfer)
  44. `metode-ilmiah`: Observasi, Hipotesis Teruji, dan Variabel Kontrol
  45. `sel`: Teori Sel, Komparasi Prokariotik vs Eukariotik
  46. `molekul-biologis`: Karbohidrat, Lipid, Protein, dan Asam Nukleat
  47. `energi-dalam-sistem-biologis`: Bioenergetika Fotosintesis Kloroplas dan Respirasi ATP

---

## 4. Katalog 14 Stasiun Nalar Lab Interaktif (`/lab`)

1. **Kalkulus Diferensial:** *Garis Sekan ke Garis Singgung ($f(x) = x^2$)*  
   Eksplorasi nilai titik acuan $x_0$ dan selisih jarak $\Delta x$ untuk membuktikan bahwa saat $\Delta x \to 0$, gradien sekan konvergen ke garis singgung $m = 2x_0$.
2. **Fondasi Matematika:** *Garis Bilangan & Nilai Mutlak ($|x| = |-x|$)*  
   Slider nilai $x$ menunjukkan jarak magnitudo terhadap titik nol pada garis bilangan.
3. **Fondasi Matematika:** *Pecahan, Rasio, & Persentase Visual*  
   Diagram grid balok dan lingkaran menunjukkan konversi seketika antara pecahan biasa, desimal, dan persen.
4. **Fondasi Matematika:** *Pertumbuhan Eksponensial ($2^n$) vs Linier*  
   Visualisasi ledakan eksponensial pembelahan sel dibandingkan laju linier dan kuadratik.
5. **Fisika Mekanika:** *Vektor Geometri & Resultan Analitik ($R = \sqrt{A^2 + B^2 + 2AB\cos\theta}$)*  
   Dua panah vektor interaktif di atas koordinat kartesius dengan penguraian komponen $R_x$ dan $R_y$.
6. **Fisika Mekanika:** *Kinematika Parabola 2 Dimensi*  
   Eksplorasi sudut tembak $\theta$ dan kecepatan awal $v_0$ untuk menganalisis titik tertinggi $h_{\max}$ dan jarak terjauh $x_{\max}$.
7. **Fisika Mekanika:** *Dinamika Hukum Newton & Free Body Diagram (FBD)*  
   Balok pada bidang datar dengan gaya tarik $F_{\text{tarik}}$ dan koefisien gesek ($\mu_s, \mu_k$), memperlihatkan transisi dari kondisi diam ke gerak GLBB.
8. **Fisika Mekanika:** *Gerak Harmonik Sederhana & Kekekalan Energi Mekanik*  
   Pegas berosilasi dengan grafik transfer energi kinetik $E_k$ dan energi potensial pegas $E_p$.
9. **Kimia Dasar:** *Termodinamika Wujud Materi & Suhu Kelvin*  
   Slider suhu (0 K hingga 600 K) memperlihatkan transisi wujud padat, cair, dan gas beserta getaran partikel kinetik.
10. **Kimia Dasar:** *Model Atom Bohr & Tren Keperiodikan*  
    Pemilihan nomor atom $Z=1$ s.d. $18$ menampilkan susunan elektron pada kulit K, L, M dan jari-jari atomik.
11. **Kimia Dasar:** *Ikatan Kimia & Geometri Molekul VSEPR 3D*  
    Simulasi bentuk molekul linear, segitiga planar, tetrahedral, trigonal bipiramidal, dan oktahedral.
12. **Biologi Dasar:** *Skala Ukuran Hayati (Nanometer ke Meter)*  
    Slider zoom eksponensial dari skala molekul air ($0.3\text{ nm}$), virus ($100\text{ nm}$), bakteri, sel hewan, hingga organisme manusia ($1.7\text{ m}$).
13. **Biologi Dasar:** *Sitologi Sel: Prokariotik, Hewan, & Tumbuhan*  
    Diagram komparasi organel membran sel, dinding sel selulosa, kloroplas, mitokondria, dan inti sel nukleus.
14. **Biologi Dasar:** *Daur Bioenergetika Fotosintesis & Respirasi Seluler*  
    Simulasi fotokimia input foton cahaya + $\text{CO}_2$ yang menghasilkan glukosa, dilanjutkan oleh respirasi mitokondria yang mendaur ulang 36-38 ATP.

---

## 5. Concept Graph 2D Knowledge Mesh (`/graph`)

Concept Graph menghubungkan seluruh 47 konsep ke dalam kanvas jejaring dua dimensi interaktif:
- **Zero Coordinate Jitter:** Hitbox tetap berdiameter 52px yang menghilangkan efek getar atau maju-mundur saat pointer menyentuh perimeter.
- **Relasi Prasyarat & Pengetahuan Lintas Disiplin:**
  - Laju Perubahan (Matematika) $\to$ Kinematika (Fisika)
  - Definisi Turunan (Matematika) $\to$ Persamaan Osilasi Harmonik (Fisika)
  - Vektor (Fisika) $\to$ Aljabar Translasi (Matematika)
  - Satuan & Pengukuran (Matematika) $\to$ Pengukuran Besaran SI (Fisika) $\to$ Wujud Materi (Kimia)
  - Atom & Molekul (Kimia) $\to$ Tingkatan Organisasi & Makromolekul (Biologi)
  - Usaha & Energi Mekanik (Fisika) $\to$ Daur Bioenergetika Seluler (Biologi)
  - Metode Ilmiah (Biologi) $\to$ Standar Pengukuran Empiris (Fisika)
- **Dynamic ViewBox Focus:** Pemilihan tab bidang (misal *Fisika*) langsung memfokuskan kanvas ke wilayah domain tersebut dengan resolusi tinggi.
- **Aksesibilitas Ganda:** Opsi satu-klik berpindah ke *Daftar Rapi* (*Accessible Linear List*) untuk pembaca layar.

---

## 6. AI Socratic Tutor Nai & Mode Guru

- **Pedagogi Tanpa Contekan:** Nai dilatih dengan prompt Sokratis ketat agar tidak pernah membocorkan jawaban akhir soal sebelum siswa menyelesaikan tahapan penalaran atau membuka layer *solution hint*.
- **Multi-Provider Engine:** Menggunakan Google Gemma sebagai model default yang efisien dan ramah privasi, dengan kompatibilitas terhadap model Claude, OpenAI, Gemini, serta mesin penalaran deterministik terkurasi lokal yang bekerja 100% tanpa internet ataupun biaya kuota.
- **Mode Guru (Teach Mode):** Siswa ditantang berperan sebagai guru yang menjelaskan konsep kepada Nai; Nai mengevaluasi kelengkapan analogi, kebenaran terminologi, dan ketepatan kausalitas secara real-time.
