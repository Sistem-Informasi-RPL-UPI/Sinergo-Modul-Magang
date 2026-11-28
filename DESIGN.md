# DESIGN.md — Design Direction (`Sinergo-Modul-Magang`)

Dokumen pendamping ini menjadi jembatan arah visual bagi `antislop` dan `antislop-ui`. Sumber spesifikasi penuh Design System, komponen, dan pemetaan rute wajib merujuk pada **`docs/06-design-system-dan-routing.md`**.

---

## 1. Identitas & Karakter Produk

- **Produk**: SI RPL UPI - Portal Magang & MBKM (Modul 5)
- **Institusi**: Program Studi Rekayasa Perangkat Lunak, Universitas Pendidikan Indonesia (UPI) Kampus Cibiru
- **Audiens**: Mahasiswa, Dosen (Pembimbing UPI, Dosen Kunjung, & Pengampu MK), Admin Prodi, dan Kaprodi
- **Karakter Visual**: Akademik modern yang hangat, terstruktur, tegas secara hierarki informasi, dan fokus pada kejelasan status alur birokrasi akademik (pendataan, SK, logbook, berkas akhir, dan rubrik konversi nilai).
- **Tema**: Light Mode institusional berbasis kanvas sejuk (`#F2F7FF`) dan kartu putih bersih (`#FFFFFF`) sesuai spesifikasi resmi UI Figma Prodi RPL untuk keterbacaan tabel dan dokumen akademik berdurasi panjang.

---

## 2. Liveliness Dials (`antislop` Part 3)

Dial: ENERGY 2 / RHYTHM 2 / MOTION 1

- **ENERGY 2 (Balanced)**: Identitas warna biru vibran dan aksen kuning hangat memberi sambutan jelas pada portal mahasiswa, namun tetap tenang dan fokus pada halaman tabel verifikasi serta penilaian dosen.
- **RHYTHM 2 (Consistent with purposeful breaks)**: Kerangka kerja konsisten (sidebar kiri mengambang + kanvas kerja utama), divariasikan secara fungsional sesuai kebutuhan konten tiap halaman (grid katalog lowongan, *split-view* form wizard 4 langkah + ringkasan *sticky*, serta panel analitik grafik angkatan khusus Kaprodi).
- **MOTION 1 (Calm / Functional)**: Transisi fungsional pada state hover/focus/active, perpindahan langkah wizard, pembukaan modal/drawer, dan pembaruan indikator progres tanpa animasi dekoratif berlebih serta mematuhi `prefers-reduced-motion`.

---

## 3. Palet Warna Resmi (Acuan `docs/06-design-system-dan-routing.md`)

Menggunakan 2 warna inti + 1 warna aksen terarah + basis netral (mematuhi batas `R-29`):

- **Primary (`Vibrant Blue` — `#0101B7`)**: Navigasi aktif sidebar, tombol CTA utama, header kartu lowongan *Mitra Kampus*, banner konteks mata kuliah Dosen, header modal, dan *progress bar* aktif.
- **Secondary (`Dreamy` — `#8DCCF1`)**: Seri sekunder grafik *MBKM lainnya*, latar ikon pendukung, dan aksen fokus lembut.
- **Deliberate Accent (`WarmY` — `#FFD166`)**: Digunakan secara terukur hanya pada momen kunci: header kartu *Binaan Dosen*, tombol pencarian utama di hero Mahasiswa, dan *counter badge* di sidebar.
- **Neutral Base (`Alice` — `#F2F7FF` & `Pure White` — `#FFFFFF`)**: Latar kanvas aplikasi `#F2F7FF`, permukaan kartu/tabel/modal `#FFFFFF`, teks utama `#0F172A`, dan teks sekunder `#64748B`.
- **Semantic Status Tokens**:
  - Hijau lembut (`#DCFCE7` / teks `#15803D`): `Terverifikasi`, `Tervalidasi`, `Aktif`, `Sangat sesuai`, `Terunggah`.
  - Kuning lembut (`#FEF3C7` / teks `#92400E`): `Menunggu`, `Menunggu validasi`, `Draf nilai`, `Draf belum dikirim`.
  - Merah lembut (`#FEE2E2` / teks `#B91C1C`): `Perlu revisi`, `Belum dinilai`, aksi destruktif.
  - Biru lembut (`#E0F2FE` / teks `#0369A1`): `Sesuai`, `Opsional`, label periode semester.

---

## 4. Tipografi & Hierarki Komponen

- **Heading & Angka Metrik — `Lexend`**: Memberi ketegasan geometris pada judul halaman (`24px`–`40px`) dan keterbacaan instan pada kartu statistik/skor konversi.
- **Body, Tabel, & Formulir — `Plus Jakarta Sans`**: Menjaga kenyamanan baca pada tabel padat, deskripsi rubrik capaian mata kuliah, dan input formulir (`16px` teks utama, `13px` label/metadata).
- **Hierarki Radius & Elevasi**: Gunakan variasi border-radius sesuai fungsi komponen (kartu kontainer utama `rounded-2xl`, input & tombol aksi terukur, pill khusus untuk badge status/filter — tidak menyeragamkan semua elemen menjadi bentuk kapsul penuh) dan terapkan bayangan tipis hanya pada elemen yang benar-benar mengambang seperti modal/popover.
