# Requirements

## Requirement fungsional

| ID | Requirement | Kriteria penerimaan |
| --- | --- | --- |
| FR-01 | Pengguna dapat memulai sebagai guest | Tidak ada paywall atau form login sebelum membuka dan menyelesaikan aktivitas pertama. `device_id` dibuat sekali dan tersimpan lokal. |
| FR-02 | Pengguna dapat menjelajahi kurikulum | Domain, modul, metadata, prasyarat, dan learning path terlihat sebelum mulai belajar. |
| FR-03 | Lesson menjalankan step terkurasi | Step mendukung minimal `encounter`, `predict`, `understand`, `practice`, `explain`, dan `retrieve`; urutan dan konfigurasi berasal dari content. |
| FR-04 | Prediksi diberi sebelum hasil | Untuk step yang meminta prediksi, hasil atau penjelasan lanjutan tidak dibuka sebelum respons tersimpan atau pengguna memilih lewati. |
| FR-05 | Sistem memberi hint berlapis | Hint orientation, concept, strategy, dan solution dapat dilihat berurutan; penggunaan hint dicatat sebagai evidence. |
| FR-06 | Jawaban memperbarui mastery | Submission tervalidasi, menghasilkan attempt/evidence, lalu memperbarui dimensi mastery concept secara deterministik. |
| FR-07 | Sistem mengidentifikasi pola kesalahan | Attempt salah dapat menyimpan `misconception_code`; ringkasan mistake map tersedia per concept. |
| FR-08 | Sistem merekomendasikan langkah berikutnya | Next step mempertimbangkan prerequisite, status step, mastery, dan review yang jatuh tempo. Rekomendasi menyertakan alasan singkat. |
| FR-09 | Pengguna dapat menjelaskan kembali | Penjelasan bebas dievaluasi terhadap rubric terkurasi; Nai memberi feedback yang spesifik dan tidak menilai hanya dari keyword. |
| FR-10 | Pengguna dapat menyinkronkan progress | Setelah autentikasi, progress guest dimigrasikan tanpa duplikasi. Konflik memakai waktu perubahan terbaru per record dan attempt tetap append-only. |
| FR-11 | Pengguna dapat mengatur preferensi aksesibilitas | Theme, ukuran teks, reduced motion, dan visibilitas Nai tersimpan secara lokal dan tersinkron saat akun ada. |

## Requirement nonfungsional

| Area | Requirement |
| --- | --- |
| Performa | Navigasi cached dan konten statis terasa cepat; target p75 LCP ≤ 2,5 dtk pada koneksi 4G representatif. Server action/API p95 ≤ 800 ms di luar pemanggilan AI. |
| Keandalan | Submission harus idempotent. Kegagalan sync tidak menghapus progress lokal. |
| Keamanan | Endpoint mutasi memverifikasi identity guest/member dan otorisasi kepemilikan. Kunci AI/database tidak pernah masuk browser. |
| Privasi | Kumpulkan data minimum. Jawaban bebas tidak digunakan untuk pelatihan pihak ketiga tanpa persetujuan eksplisit. Sediakan penghapusan akun/data. |
| Aksesibilitas | Target WCAG 2.2 AA untuk alur inti. Keyboard, screen reader, kontras, dan reduced motion diuji. |
| Observability | Semua error server memiliki request ID; event belajar tidak mengandung isi jawaban bebas mentah kecuali dibutuhkan dan dilindungi kebijakan retensi. |

## Aturan bisnis

- `completion` berarti step selesai; ia tidak sama dengan `mastery`.
- Mastery dihitung per dimensi, berada pada rentang 0–100, dan menyimpan waktu pembaruan serta sumber evidence terakhir.
- Hasil evaluasi konten terstruktur ditentukan evaluator server yang sesuai content version. Browser tidak menjadi sumber kebenaran skor.
- Prasyarat dapat dilihat tetapi penguncian harus mempunyai alasan yang dapat diakses; konten pengantar tetap dapat dibuka bila kebijakan modul mengizinkan.
- AI tidak boleh mengarang jawaban final untuk challenge aktif tanpa pengguna secara eksplisit membuka hint solution.
