# UI System

## Arah visual

Antarmuka bersih, minimal, tenang, modern, ringan, dan refined. Konten belajar adalah pusat layar; Nai adalah pendamping opsional, bukan dekorasi yang selalu mendominasi.

Prioritas desain: readability, hierarchy, whitespace, consistency, responsiveness, lalu visual polish. Hindari pola kartu SaaS berulang, gradient dekoratif yang ramai, dashboard padat, dan gamifikasi yang mengalihkan fokus dari pemahaman.

## Token dasar

- Gunakan maksimal dua font family: satu sans-serif yang sangat mudah dibaca untuk UI/body dan satu display yang hemat untuk heading bila benar-benar diperlukan.
- Gunakan 3–4 weight saja: regular, medium, semibold, bold. Body memiliki line-height longgar sekitar 1.5–1.7.
- Spacing scale: `4, 8, 12, 16, 24, 32, 48, 64, 96px`. Jangan membuat nilai ad hoc kecuali perlu untuk alignment kecil.
- Definisikan color semantic (`surface`, `text`, `muted`, `border`, `accent`, `success`, `warning`, `danger`, `focus`) dengan pasangan light, dark, dan high-contrast. Status selalu memakai teks/ikon selain warna.
- Batasi content width desktop; teks pelajaran nyaman dibaca pada kolom yang tidak terlalu lebar.

## Komponen dan interaksi

- Button, link, input, dialog, menu, tabs, card, progress indicator, skeleton, toast, dan interactive canvas harus memiliki state default, hover, focus-visible, disabled, loading, dan error bila relevan.
- Hover transition berada pada 150–250 ms. Gunakan opacity, color, shadow, atau transform kecil. Hindari animasi loop, bounce, atau transisi yang memperlambat belajar.
- Focus ring harus jelas dengan kontras memadai dan tidak dihapus.
- Dialog/dropdown menggunakan transition ringan dan mengembalikan fokus ke trigger ketika ditutup.
- Loading memakai skeleton dengan tinggi/layout mendekati konten akhir untuk mencegah layout shift.

## Responsive behavior

| Breakpoint konteks | Aturan |
| --- | --- |
| Mobile | Satu kolom, padding lebih kecil, navigasi menjadi menu ringkas, target sentuh minimal 44×44 px, tabel menjadi list/card. |
| Tablet | Layout intermediate; panel pendamping boleh berpindah ke bawah konten utama. |
| Desktop | Maksimalkan whitespace dengan content width terbatas; gunakan dua kolom hanya jika panel kedua mendukung aktivitas aktif. |

Jangan hanya memperkecil desktop. Lesson player perlu mempertahankan urutan baca dan kontrol simulasi yang mudah diakses pada layar sempit.

## Aksesibilitas implementatif

- HTML semantik dahulu; ARIA hanya melengkapi semantik yang kurang.
- Semua aksi dapat dioperasikan keyboard. Interactive graph/playground memiliki instruksi keyboard dan alternatif yang setara.
- Hormati `prefers-reduced-motion`; pilihan pengguna dapat mematikan animasi non-esensial.
- Media dan visual perubahan parameter memiliki nama/description yang dapat dibaca screen reader.
- Uji zoom hingga 200%, navigasi tab, kontras, dan mode high contrast pada alur utama.
