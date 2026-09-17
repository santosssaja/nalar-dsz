# Execution Guide

Dokumen ini adalah protokol kerja untuk agent yang mengubah repository. Tujuannya menjaga keputusan tetap konsisten ketika konteks percakapan tidak lengkap.

## Hierarki sumber kebenaran

Gunakan urutan berikut saat instruksi atau dokumen tampak berbeda:

1. Instruksi eksplisit pengguna pada tugas aktif.
2. `AGENTS.md` di root dan instruksi repository yang lebih dekat ke file yang diubah.
3. [project-state.md](./project-state.md) dan [decisions.md](./decisions.md).
4. Requirement dan kontrak teknis yang relevan.
5. Dokumen konsep lengkap dan kurikulum.
6. Kode, test, serta konfigurasi yang sudah ada.

Jika dua sumber pada tingkat yang sama bertentangan, jangan memilih diam-diam. Jelaskan konflik singkat, pilih perubahan paling kecil yang aman bila tetap dapat maju, atau minta keputusan pengguna bila dampaknya substantif.

## Aturan anti-asumsi

- Jangan menganggap dependency, script, environment variable, provider cloud, database, asset, atau route sudah ada. Periksa dahulu.
- Jangan membuat requirement produk baru hanya karena implementasinya lebih mudah. Catat sebagai usulan di `decisions.md` bila diperlukan.
- Jangan menyimpulkan detail UI dari referensi produk lain. Ikuti `ui-system.md` dan kebutuhan flow yang nyata.
- Jangan menganggap output AI benar. Parse ke schema, gunakan fallback, dan jangan jadikan output AI sebagai satu-satunya sumber kebenaran state belajar.
- Jangan mengubah kontrak data/API, aturan mastery, atau status content published tanpa memperbarui dokumen dan test terkait.
- Jangan mengklaim test, deployment, atau integrasi telah berjalan tanpa perintah dan output yang membuktikannya.

## Protokol sebelum mengubah kode

1. Baca `project-state.md`, `decisions.md`, dan dokumen yang wajib untuk jenis tugas.
2. Inspeksi file, konfigurasi, dan perubahan lokal yang terkait.
3. Tulis ringkasan internal: tujuan, file yang mungkin berubah, requirement yang dipenuhi, dan risiko data/UI.
4. Tentukan apakah tugas bersifat **implementasi**, **investigasi**, atau **keputusan**. Jangan melakukan implementasi saat pengguna hanya meminta investigasi.
5. Bila requirement dapat dipenuhi dengan perubahan kecil yang reversible, implementasikan. Bila pilihan mengubah arah produk, privasi, biaya berulang, skema production, atau kontrak publik, berhenti dan minta arah.

## Protokol implementasi

- Buat perubahan sekecil mungkin yang menyelesaikan acceptance criteria.
- Ikuti boundary yang tertulis di `architecture.md`; jangan melewati service/repository demi jalan pintas.
- Sertakan state loading, error, empty, offline, dan aksesibilitas bila perubahan memengaruhi UI atau network.
- Untuk mutasi, pastikan identity, ownership, validasi, idempotensi, dan content version diperiksa pada server.
- Gunakan fixture terkurasi pada test. Jangan memasukkan data pengguna atau secret.

## Kapan harus berhenti dan meminta arahan

Minta arahan jika salah satu kondisi ini benar:

- Tidak ada acceptance criteria yang cukup untuk memilih perilaku yang terlihat pengguna.
- Ada dua keputusan produk yang sama-sama masuk akal tetapi menghasilkan pengalaman atau model data yang berbeda.
- Tugas membutuhkan credential, provider, akun, biaya, migrasi data production, atau tindakan eksternal yang belum diotorisasi.
- Dokumen mengharuskan perilaku yang bertentangan dengan kode/test production yang ada dan tidak jelas mana yang lebih baru.
- Implementasi memerlukan perubahan destructive atau tidak dapat dibalik pada data pengguna.

Pertanyaan harus menyebut pilihan, dampak, dan rekomendasi. Jangan mengirim pertanyaan yang jawabannya dapat ditemukan melalui inspeksi repository.

## Kontrak handoff

Setiap handoff menyebutkan:

1. hasil yang selesai dan requirement/decision yang dipenuhi;
2. file yang diubah;
3. verifikasi yang benar-benar dijalankan dan hasilnya;
4. asumsi yang dibuat atau keputusan yang masih terbuka;
5. perubahan pada `project-state.md` dan `decisions.md` bila ada.

Handoff tidak boleh menyatakan fitur selesai bila hanya dokumentasi atau scaffold yang dibuat.
