# User Flows

## 1. Guest memulai belajar

```text
Landing → pilih minat/domain → pilih modul → module overview
→ lihat path dan prasyarat → mulai → lesson player → submit respons
→ feedback/hint → progress tersimpan lokal → next step
```

1. Saat kunjungan pertama, aplikasi membuat `device_id` acak dan preference default.
2. Guest dapat membuka module overview dan learning path tanpa autentikasi.
3. Saat mulai, content bundle di-cache lokal bila tersedia.
4. Setiap submission dicatat di outbox lokal terlebih dahulu, kemudian dikirim saat jaringan tersedia.
5. CTA login muncul setelah value tercapai, misalnya setelah progress pertama tersimpan atau saat pengguna ingin backup.

## 2. Menyelesaikan satu learning step

```text
Render step → pengguna berinteraksi → validasi input lokal
→ submit idempoten → evaluasi server → evidence + mastery diperbarui
→ feedback → pilih lanjut, buka hint, atau ulangi
```

- Step `predict` menyimpan prediksi sebelum hasil eksperimen ditampilkan.
- Step `practice` mengembalikan correctness, feedback, dan hint level yang tersedia.
- Step `explain` mengirim respons ke evaluator rubric; UI menjelaskan bahwa feedback dapat membutuhkan beberapa saat.
- Jika jaringan putus, respons masuk outbox dengan status `pending`; UI tidak menyatakan masteri final hingga sinkronisasi berhasil.

## 3. Remedial dan review

```text
Attempt/evidence → deteksi gap atau misconception → rekomendasi remedial/retrieval
→ pengguna membuka aktivitas → evidence baru → rekomendasi diperbarui
```

Jika transfer lemah tetapi practice kuat, sistem menawarkan step remedial yang menargetkan transfer atau konsep prasyarat terkait. Jika review jatuh tempo, tampilkan di urutan tinggi tetapi jangan menghukum pengguna yang menundanya.

## 4. Login dan migrasi guest

```text
Guest memilih backup → autentikasi → server mengklaim device_id
→ import event/outbox yang belum tersinkron → merge progress → konfirmasi
```

- Progress dengan user yang sama tidak diduplikasi.
- Attempt tidak ditimpa karena bersifat append-only.
- Jika progress concept bertabrakan, gunakan `updated_at` terbaru dan hitung ulang aggregate mastery dari evidence bila perlu.

## 5. Nai memberi bantuan

```text
Pengguna memilih “Butuh bantuan” → pilih hint layer atau tanya Nai
→ server memberi context terkurasi terbatas → Nai merespons
→ pengguna melanjutkan aktivitas → interaksi dianalitik secara aman
```

Nai menahan jawaban lengkap selama solution hint belum dibuka. Jawaban harus merujuk pada konsep/step aktif, mengakui ketidakpastian, dan menyediakan jalur kembali ke aktivitas.

## State yang harus terlihat

- loading: gunakan skeleton untuk shell dan content cards;
- saving: indikator ringkas tanpa memblokir interaksi;
- offline: beri tahu bahwa perubahan menunggu sinkronisasi;
- error: jelaskan aksi pemulihan dan sediakan coba lagi;
- locked: tampilkan prerequisite dan alasan, bukan hanya ikon gembok;
- complete/mastered/review due: status teks dan ikon, tidak hanya warna.
