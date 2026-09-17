# Decisions

Dokumen ini menyimpan keputusan implementasi yang perlu dipertahankan lintas tugas. Status `Locked` berarti agent tidak mengubahnya tanpa instruksi pengguna atau decision baru. Status `Open` berarti agent tidak boleh mengunci provider atau perilaku final secara sepihak.

## D-001 — Pengalaman guest adalah jalur utama

**Status:** Locked  
**Keputusan:** Pengguna dapat membuka konten, memulai lesson, dan menyimpan progress awal tanpa login. Identity guest memakai device key yang tidak mengekspos nilai mentah ke database.  
**Konsekuensi:** Semua mutation learning harus bekerja untuk guest; login mengklaim/mensinkronkan device, bukan menjadi prasyarat belajar.  
**Rujukan:** FR-01, FR-10.

## D-002 — Konten published bersifat immutable dan versioned

**Status:** Locked  
**Keputusan:** Step, rubric, evaluator configuration, dan content bundle published memiliki version immutable. Attempt menyimpan content version yang dipakai saat submit.  
**Konsekuensi:** Perbaikan konten membuat version baru; evaluasi attempt historis tidak berubah diam-diam.  
**Rujukan:** FR-03, architecture content delivery.

## D-003 — Mastery berbasis evidence, bukan completion

**Status:** Locked  
**Keputusan:** Completion hanya status aktivitas. Mastery disimpan per dimensi understanding, practice, application, transfer, explanation, dan retention dari evidence yang dinormalisasi.  
**Konsekuensi:** UI dan API tidak boleh menampilkan completion sebagai sinonim mastery; engine dapat dihitung ulang dari evidence.  
**Rujukan:** FR-06, business rules.

## D-004 — AI merupakan lapisan bantuan, bukan sumber otoritas

**Status:** Locked  
**Keputusan:** Nai hanya menerima context yang disusun server dari konten/rubric terkurasi. Evaluasi terstruktur dan state belajar tidak bergantung pada respons AI.  
**Konsekuensi:** Semua flow AI membutuhkan schema output, timeout, rate limit, observability, dan fallback hint/rubric statis.  
**Rujukan:** FR-09, architecture AI.

## D-005 — Stack target bersifat portable sampai provider dipilih

**Status:** Locked  
**Keputusan:** Aplikasi memakai Next.js App Router dan PostgreSQL serverless sebagai arah arsitektur. Hosting, auth, AI, KV, analytics, dan vendor database konkret masih Open.  
**Konsekuensi:** Gunakan adapter/interface di boundary provider dan jangan memasukkan SDK vendor sebelum ada konfigurasi atau keputusan eksplisit.  
**Rujukan:** tech stack, project state.

## D-006 — Satu modul sebagai vertical slice MVP

**Status:** Locked  
**Keputusan:** Modul Turunan menjadi vertical slice pertama untuk membuktikan katalog, path, activity, feedback, evidence, mastery, review, dan sync.  
**Konsekuensi:** Jangan memperluas banyak domain/modul sebelum loop ini dapat diuji end-to-end.  
**Rujukan:** product brief, delivery plan.

## D-007 — Formula mastery dan decay belum final

**Status:** Open  
**Pertanyaan:** Bobot evidence, ambang status, dan interval retrieval perlu keputusan pedagogis dan data validasi.  
**Batas sementara:** Implementasikan interface deterministic dan fixture eksplisit; jangan menyebut nilai awal sebagai formula ilmiah atau permanent.  
**Pemicu keputusan:** Sebelum score production menjadi dasar rekomendasi penting atau pelaporan pembelajaran.

## D-008 — Provider production belum dipilih

**Status:** Open  
**Pertanyaan:** Vendor hosting, database, auth, AI, KV, analytics, dan error tracking belum diputuskan.  
**Batas sementara:** Jangan menambahkan dependency vendor atau membuat akun/proyek eksternal tanpa instruksi pengguna. Sediakan abstraction tipis hanya jika ada implementasi yang membutuhkan boundary tersebut.

## Cara menambah atau mengubah keputusan

Setiap decision baru berisi ID unik, status, keputusan/pertanyaan, konsekuensi, rujukan requirement, dan pemicu review bila statusnya Open. Jangan mengedit decision Locked untuk mengubah substansinya; tambahkan decision baru yang secara eksplisit menggantikan ID lama dan jelaskan alasan perubahan.
