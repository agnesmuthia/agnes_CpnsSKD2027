# Latihan SKD CPNS 2027

Aplikasi web untuk latihan rutin Seleksi Kompetensi Dasar (SKD) CPNS: **TWK, TIU, dan TKP** dengan komposisi dan penilaian ala CAT BKN.

## Fitur

- **Latihan Harian** — 110 soal (30 TWK + 35 TIU + 45 TKP), 100 menit. Set soal berganti setiap hari dan mengutamakan soal yang belum pernah Anda kerjakan; setelah semua soal suatu materi keluar, rotasi diulang dan diacak kembali.
- **Simulasi CAT acak** dan **simulasi per komponen** (TWK/TIU/TKP berwaktu).
- **Latihan per topik** (mode belajar) — kunci dan pembahasan langsung tampil setelah memilih jawaban.
- **Penilaian sesuai ketentuan terbaru**: TWK & TIU benar = 5, salah/kosong = 0; TKP setiap opsi bernilai 1–5. Passing grade 65 / 80 / 166 (KepmenPANRB 321/2024), status MS/TMS, total dari 550.
- **Hasil & pembahasan** lengkap, analisis capaian per materi, riwayat, grafik perkembangan skor, dan hitungan hari beruntun.
- Navigasi soal, tanda ragu-ragu, pintasan keyboard (A–E / 1–5, ← →), mode gelap, tampilan ponsel.

## Bank soal (7.329 soal)

| Komponen | Jumlah | Materi |
|---|---|---|
| TIU | 6.496 | Logika argumen (paling memperkuat, paling memperlemah, tidak memperkuat, tidak memperlemah; 486 soal dari 40+ topik), pola bilangan tabel tipe I (1.200) & II (1.100) termasuk pola kuadrat dan selisih bertingkat, kecukupan pernyataan (1.080), silogisme & logika, penalaran analitis, analogi, deret, soal cerita, figural |
| TWK | 430 | Nasionalisme, integritas, bela negara, pilar negara (UUD NRI 1945, Pancasila), bahasa negara |
| TKP | 403 | Pelayanan publik, jejaring kerja, sosial budaya, TIK, profesionalisme, anti radikalisme (termasuk skenario guru & sekolah) |

Komposisi TIU per sesi (35 soal) menekankan model terbaru: 6 logika argumen, 5 pola bilangan tabel, 5 kecukupan pernyataan, 5 figural, 5 soal cerita, 3 silogisme/logika, 2 analitis, 2 analogi, 2 deret.

Sebagian besar soal TIU **dibangkitkan oleh generator** (angka, tabel, susunan, dan gambar berbeda di tiap soal, lengkap dengan pembahasan yang dihitung otomatis). Soal analitis diverifikasi dengan pengecekan seluruh kemungkinan susunan agar jawabannya tunggal. Soal logika argumen, TWK, dan TKP ditulis manual. Jalankan `node tools/validate.js` untuk memeriksa seluruh bank soal.

## Cara menggunakan

- **Langsung**: buka `index.html` di peramban (tidak perlu server/internet).
- **GitHub Pages**: Settings → Pages → Deploy from branch → pilih branch ini, folder `/ (root)`.
- **Lokal dengan server**: `python3 -m http.server` lalu buka `http://localhost:8000`.

Data latihan (riwayat, rotasi soal) tersimpan di `localStorage` peramban pada perangkat tersebut.

## Struktur

```
index.html            halaman utama
css/style.css         tampilan
js/core.js            RNG deterministik, utilitas, registri bank soal
js/bank/*.js          generator & data soal per komponen
js/session.js         komposisi sesi, rotasi soal, penilaian
js/app.js             antarmuka (beranda, ujian, hasil, topik, riwayat, kisi-kisi)
tools/validate.js     validasi bank soal (node)
```

Menambah soal: tambahkan item pada file di `js/bank/` (untuk TWK/TIU opsi pertama adalah jawaban benar; untuk TKP opsi ditulis berurutan dari skor 5 ke 1 — urutan diacak saat ditampilkan), lalu jalankan `node tools/validate.js`.

> Passing grade CPNS 2027 akan ditetapkan melalui keputusan MenPANRB yang baru. Pantau informasi resmi di sscasn.bkn.go.id.
