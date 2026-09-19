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

## D-009 — Session member memakai token HMAC bertanda tangan

**Status:** Locked  
**Keputusan:** Cookie session member (`nalar_session_user_id`) berisi token `payload.signature` (HMAC-SHA256 dengan `COOKIE_SECRET`, berisi userId + expiry), bukan raw user id. Header `x-user-id` tidak lagi dipercaya; klien dapat memakai header `x-session-token`. Token invalid/malformed/tampered/expired ditolak dan di-resolve sebagai guest. `claim-device` hanya dapat dilakukan oleh actor member terautentikasi (body `userId` dihapus — mencegah linkage lintas identity).  
**Konsekuensi:** Session tidak bisa spoof; `COOKIE_SECRET` wajib eksplisit di production. Semua mutation learning tetap bekerja untuk guest (D-001).  
**Rujukan:** D-001, D-002, FR-10, product rule "jangan mengekspos data pengguna lintas identity".

## D-010 — Content version per-step deterministik dari checksum konten

**Status:** Locked  
**Keputusan:** Setiap learning step menerima baris `content_versions` immutable dengan id yang diturunkan deterministik (UUID v5 dari sha256 canonical JSON step), payload snapshot penuh, dan checksum. `learning_steps.contentVersionId` dan `attempts.contentVersionId` menunjuk ke row nyata tersebut; dummy version dan self-healing insert dihapus. Perubahan konten menghasilkan id version baru.  
**Konsekuensi:** Evaluasi attempt historis tetap mengacu konten yang benar (D-002); migration data lama perlu re-seed dan relink step.  
**Rujukan:** D-002, database schema.

## D-011 — Evaluator deterministik fail-closed untuk penilaian mastery

**Status:** Locked  
**Keputusan:** `evaluateStepResponse` tidak lagi otomatis mengembalikan `correct` untuk step tanpa konfigurasi `evaluation` atau bertipe `rubric`. Keduanya mengembalikan status `undetermined`; di `submitAttempt`, delta mastery untuk status `undetermined` adalah 0 (attempt tetap dicatat, tanpa reward/penalty). Rubric hanya dievaluasi lewat jalur penilaian terkurasi (explain-feedback/AI rubrik) yang sudah ada.  
**Konsekuensi:** Farming mastery dengan menjawab sembarangan ke step yang tidak terasess via API tertutup; perilaku UI lesson player tidak berubah karena step informational/explain tidak dikirim ke `/attempts`.  
**Rujukan:** Product rule "jangan menjadikan AI/contoh evaluator tanpa content/rubric terkurasi", FR attempt/evidence.

## D-012 — Gate akses untuk publish konten

**Status:** Locked  
**Keputusan:** `/api/v1/content/publish` dijaga `publishIsAuthorized` (`src/server/services/content-publish-gate.ts`): jika `CONTENT_PUBLISH_SECRET` diset, `Authorization: Bearer <secret>` wajib di semua environment (perbandingan timing-safe via SHA-256); jika tidak diset, publish hanya terbuka di luar production (dev/test authoring) dan ditolak 403 di production.  
**Konsekuensi:** Endpoint mutasi publik tidak dapat menulis `content_versions` tanpa otorisasi; alur authoring dev tanpa config tambahan tetap berjalan.  
**Rujukan:** Product rule keamanan API, D-002, D-010.

## D-013 — Rate limit magic link verifikasi email

**Status:** Locked  
**Keputusan:** `requestEmailVerification` menolak permintaan ke-4+ dalam jendela 15 menit per email dengan kode `RATE_LIMIT_EXCEEDED` (429), dihitung dari baris `verification_tokens` yang dibuat dalam jendela. Batas tersebut non-per-instance (tervoting dari DB) dan menurun kont bonus verifikasi.  
**Konsekuensi:** Mengurangi risiko email bombing/abuse endpoint login; tidak memerlukan dependency baru (memanfaatkan tabel yang sudah ada), dan konsisten lintas instance karena dihitung dari database.  
**Rujukan:** D-009, schema `verification_tokens`.

## Cara menambah atau mengubah keputusan

Setiap decision baru berisi ID unik, status, keputusan/pertanyaan, konsekuensi, rujukan requirement, dan pemicu review bila statusnya Open. Jangan mengedit decision Locked untuk mengubah substansinya; tambahkan decision baru yang secara eksplisit menggantikan ID lama dan jelaskan alasan perubahan.
