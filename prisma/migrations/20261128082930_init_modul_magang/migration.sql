-- CreateTable
CREATE TABLE `users` (
    `id` CHAR(36) NOT NULL,
    `sso_sub` VARCHAR(128) NOT NULL,
    `email` VARCHAR(150) NOT NULL,
    `nama` VARCHAR(150) NOT NULL,
    `nip_nim` VARCHAR(30) NOT NULL,
    `role` ENUM('MAHASISWA', 'DOSEN', 'ADMIN', 'KAPRODI') NOT NULL,
    `sso_raw_role` VARCHAR(30) NOT NULL,
    `encrypted_refresh_token` TEXT NULL,
    `last_login_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_sso_sub_key`(`sso_sub`),
    UNIQUE INDEX `users_email_key`(`email`),
    INDEX `users_nip_nim_idx`(`nip_nim`),
    INDEX `users_role_idx`(`role`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `mahasiswa` (
    `id` CHAR(36) NOT NULL,
    `user_id` CHAR(36) NOT NULL,
    `nim` VARCHAR(20) NOT NULL,
    `prodi` VARCHAR(100) NOT NULL DEFAULT 'Rekayasa Perangkat Lunak',
    `angkatan` SMALLINT NOT NULL,
    `status_aktif` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `mahasiswa_user_id_key`(`user_id`),
    UNIQUE INDEX `mahasiswa_nim_key`(`nim`),
    INDEX `mahasiswa_angkatan_idx`(`angkatan`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `dosen` (
    `id` CHAR(36) NOT NULL,
    `user_id` CHAR(36) NOT NULL,
    `nip` VARCHAR(30) NOT NULL,
    `nama_bergelar` VARCHAR(150) NOT NULL,
    `status_aktif` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `dosen_user_id_key`(`user_id`),
    UNIQUE INDEX `dosen_nip_key`(`nip`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `periode_semester` (
    `id` CHAR(36) NOT NULL,
    `kode_semester` VARCHAR(10) NOT NULL,
    `nama_semester` VARCHAR(50) NOT NULL,
    `jenis_semester` VARCHAR(10) NOT NULL,
    `is_aktif` BOOLEAN NOT NULL DEFAULT false,
    `tanggal_mulai` DATE NOT NULL,
    `tanggal_selesai` DATE NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `periode_semester_kode_semester_key`(`kode_semester`),
    INDEX `periode_semester_is_aktif_idx`(`is_aktif`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `matakuliah` (
    `id` CHAR(36) NOT NULL,
    `dosen_pengampu_id` CHAR(36) NOT NULL,
    `kode_mk` VARCHAR(15) NOT NULL,
    `nama_mk` VARCHAR(150) NOT NULL,
    `sks` SMALLINT NOT NULL DEFAULT 3,
    `is_konversi_mbkm` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `matakuliah_kode_mk_key`(`kode_mk`),
    INDEX `matakuliah_dosen_pengampu_id_idx`(`dosen_pengampu_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `komponen_rubrik_mk` (
    `id` CHAR(36) NOT NULL,
    `matakuliah_id` CHAR(36) NOT NULL,
    `nama_komponen` VARCHAR(150) NOT NULL,
    `deskripsi_komponen` TEXT NOT NULL,
    `bobot_persen` DECIMAL(5, 2) NOT NULL,
    `urutan` SMALLINT NOT NULL DEFAULT 1,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `komponen_rubrik_mk_matakuliah_id_idx`(`matakuliah_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `lowongan_magang` (
    `id` CHAR(36) NOT NULL,
    `pembuat_user_id` CHAR(36) NOT NULL,
    `dosen_pj_id` CHAR(36) NULL,
    `judul_lowongan` VARCHAR(150) NOT NULL,
    `nama_instansi` VARCHAR(150) NOT NULL,
    `posisi_bidang` VARCHAR(100) NOT NULL,
    `lokasi_mode_kerja` VARCHAR(100) NOT NULL,
    `sumber_lowongan` ENUM('MITRA_KAMPUS', 'BINAAN_DOSEN') NOT NULL DEFAULT 'MITRA_KAMPUS',
    `kontak_instansi` VARCHAR(150) NOT NULL,
    `deskripsi` TEXT NOT NULL,
    `persyaratan` TEXT NOT NULL,
    `logo_url` VARCHAR(255) NULL,
    `status_lowongan` ENUM('DRAF', 'AKTIF', 'TUTUP') NOT NULL DEFAULT 'DRAF',
    `jumlah_pelamar` INTEGER NOT NULL DEFAULT 0,
    `batas_tanggal` DATE NULL,
    `tanggal_publikasi` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `lowongan_magang_judul_lowongan_idx`(`judul_lowongan`),
    INDEX `lowongan_magang_nama_instansi_idx`(`nama_instansi`),
    INDEX `lowongan_magang_sumber_lowongan_idx`(`sumber_lowongan`),
    INDEX `lowongan_magang_status_lowongan_idx`(`status_lowongan`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `lamaran_lowongan` (
    `id` CHAR(36) NOT NULL,
    `lowongan_id` CHAR(36) NOT NULL,
    `mahasiswa_id` CHAR(36) NOT NULL,
    `tanggal_minat` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `lamaran_lowongan_lowongan_id_mahasiswa_id_key`(`lowongan_id`, `mahasiswa_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pendataan_magang` (
    `id` CHAR(36) NOT NULL,
    `mahasiswa_id` CHAR(36) NOT NULL,
    `semester_id` CHAR(36) NOT NULL,
    `dosen_pembimbing_id` CHAR(36) NOT NULL,
    `dosen_kunjung_id` CHAR(36) NULL,
    `verified_by_user_id` CHAR(36) NULL,
    `nama_instansi` VARCHAR(150) NOT NULL,
    `alamat_instansi` TEXT NOT NULL,
    `kontak_instansi` VARCHAR(150) NOT NULL,
    `posisi` VARCHAR(100) NOT NULL,
    `jenis_program` ENUM('MSIB', 'SI', 'PMM', 'KM', 'IISMA', 'WMK', 'PM', 'MM', 'RISET') NOT NULL,
    `kategori_analitik` ENUM('MAGANG', 'MBKM_LAINNYA') NOT NULL,
    `mode_kegiatan` ENUM('HYBRID', 'ONSITE', 'REMOTE', 'FLEKSIBEL') NOT NULL DEFAULT 'HYBRID',
    `tanggal_mulai` DATE NOT NULL,
    `tanggal_selesai` DATE NOT NULL,
    `file_loa_awal_url` VARCHAR(255) NOT NULL,
    `file_loa_awal_nama` VARCHAR(150) NOT NULL,
    `pernyataan_benar` BOOLEAN NOT NULL DEFAULT false,
    `status_pendataan` ENUM('DRAF', 'MENUNGGU', 'PERLU_REVISI', 'TERVERIFIKASI') NOT NULL DEFAULT 'DRAF',
    `catatan_revisi` TEXT NULL,
    `submitted_at` DATETIME(3) NULL,
    `verified_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `pendataan_magang_mahasiswa_id_idx`(`mahasiswa_id`),
    INDEX `pendataan_magang_semester_id_idx`(`semester_id`),
    INDEX `pendataan_magang_dosen_pembimbing_id_idx`(`dosen_pembimbing_id`),
    INDEX `pendataan_magang_dosen_kunjung_id_idx`(`dosen_kunjung_id`),
    INDEX `pendataan_magang_nama_instansi_idx`(`nama_instansi`),
    INDEX `pendataan_magang_jenis_program_idx`(`jenis_program`),
    INDEX `pendataan_magang_kategori_analitik_idx`(`kategori_analitik`),
    INDEX `pendataan_magang_status_pendataan_idx`(`status_pendataan`),
    UNIQUE INDEX `pendataan_magang_mahasiswa_id_semester_id_key`(`mahasiswa_id`, `semester_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `dokumen_sk` (
    `id` CHAR(36) NOT NULL,
    `pendataan_id` CHAR(36) NOT NULL,
    `generated_by_user_id` CHAR(36) NOT NULL,
    `disahkan_kaprodi_id` CHAR(36) NULL,
    `nomor_sk` VARCHAR(100) NOT NULL,
    `jenis_sk` ENUM('SK_PENUGASAN', 'SK_PEMBIMBING', 'SK_KUNJUNG_LAPANGAN') NOT NULL,
    `file_sk_url` VARCHAR(255) NOT NULL,
    `status_pengesahan` ENUM('DRAF_MENUNGGU', 'DISAHKAN') NOT NULL DEFAULT 'DRAF_MENUNGGU',
    `tanggal_dibuat` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `tanggal_disahkan` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `dokumen_sk_pendataan_id_idx`(`pendataan_id`),
    INDEX `dokumen_sk_nomor_sk_idx`(`nomor_sk`),
    INDEX `dokumen_sk_status_pengesahan_idx`(`status_pengesahan`),
    UNIQUE INDEX `dokumen_sk_pendataan_id_jenis_sk_key`(`pendataan_id`, `jenis_sk`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `logbook` (
    `id` CHAR(36) NOT NULL,
    `pendataan_id` CHAR(36) NOT NULL,
    `validated_by_dosen_id` CHAR(36) NULL,
    `jenis_catatan` ENUM('MINGGUAN', 'REKAP_BULANAN') NOT NULL DEFAULT 'MINGGUAN',
    `tanggal` DATE NOT NULL,
    `minggu_ke` SMALLINT NOT NULL,
    `deskripsi_kegiatan` TEXT NOT NULL,
    `foto_bukti_url` VARCHAR(255) NOT NULL,
    `nama_file_bukti` VARCHAR(150) NOT NULL,
    `status_validasi` ENUM('MENUNGGU_VALIDASI', 'TERVALIDASI', 'PERLU_REVISI') NOT NULL DEFAULT 'MENUNGGU_VALIDASI',
    `catatan_pembimbing` TEXT NULL,
    `validated_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `logbook_pendataan_id_idx`(`pendataan_id`),
    INDEX `logbook_tanggal_idx`(`tanggal`),
    INDEX `logbook_status_validasi_idx`(`status_validasi`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `berkas_akhir` (
    `id` CHAR(36) NOT NULL,
    `pendataan_id` CHAR(36) NOT NULL,
    `loa_url` VARCHAR(255) NULL,
    `loa_uploaded_at` DATETIME(3) NULL,
    `rubrik_konversi_url` VARCHAR(255) NULL,
    `rubrik_uploaded_at` DATETIME(3) NULL,
    `laporan_akhir_url` VARCHAR(255) NULL,
    `laporan_uploaded_at` DATETIME(3) NULL,
    `draf_pks_url` VARCHAR(255) NULL,
    `pks_uploaded_at` DATETIME(3) NULL,
    `transkrip_instansi_url` VARCHAR(255) NULL,
    `transkrip_uploaded_at` DATETIME(3) NULL,
    `sertifikat_url` VARCHAR(255) NULL,
    `sertifikat_uploaded_at` DATETIME(3) NULL,
    `nilai_instansi` DECIMAL(5, 2) NULL,
    `jumlah_terunggah` SMALLINT NOT NULL DEFAULT 0,
    `progres_persen` SMALLINT NOT NULL DEFAULT 0,
    `status_berkas` ENUM('DRAF', 'LENGKAP_DIKIRIM') NOT NULL DEFAULT 'DRAF',
    `submitted_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `berkas_akhir_pendataan_id_key`(`pendataan_id`),
    INDEX `berkas_akhir_status_berkas_idx`(`status_berkas`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `konversi_matakuliah` (
    `id` CHAR(36) NOT NULL,
    `pendataan_id` CHAR(36) NOT NULL,
    `matakuliah_id` CHAR(36) NOT NULL,
    `dosen_penilai_id` CHAR(36) NULL,
    `sks_konversi` SMALLINT NOT NULL,
    `tingkat_kesesuaian` ENUM('SANGAT_SESUAI', 'SESUAI') NOT NULL DEFAULT 'SESUAI',
    `nilai_instansi_ref` DECIMAL(5, 2) NULL,
    `nilai_dosen` DECIMAL(5, 2) NULL,
    `nilai_akhir` DECIMAL(5, 2) NULL,
    `nilai_huruf` VARCHAR(3) NULL,
    `catatan_dosen_pengampu` TEXT NULL,
    `status_penilaian` ENUM('BELUM_DINILAI', 'DRAF', 'DIPUBLIKASIKAN') NOT NULL DEFAULT 'BELUM_DINILAI',
    `published_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `konversi_matakuliah_pendataan_id_idx`(`pendataan_id`),
    INDEX `konversi_matakuliah_matakuliah_id_idx`(`matakuliah_id`),
    INDEX `konversi_matakuliah_dosen_penilai_id_idx`(`dosen_penilai_id`),
    INDEX `konversi_matakuliah_status_penilaian_idx`(`status_penilaian`),
    UNIQUE INDEX `konversi_matakuliah_pendataan_id_matakuliah_id_key`(`pendataan_id`, `matakuliah_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `nilai_rubrik_mahasiswa` (
    `id` CHAR(36) NOT NULL,
    `konversi_mk_id` CHAR(36) NOT NULL,
    `komponen_rubrik_id` CHAR(36) NOT NULL,
    `skor` DECIMAL(5, 2) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `nilai_rubrik_mahasiswa_konversi_mk_id_komponen_rubrik_id_key`(`konversi_mk_id`, `komponen_rubrik_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `mahasiswa` ADD CONSTRAINT `mahasiswa_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `dosen` ADD CONSTRAINT `dosen_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `matakuliah` ADD CONSTRAINT `matakuliah_dosen_pengampu_id_fkey` FOREIGN KEY (`dosen_pengampu_id`) REFERENCES `dosen`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `komponen_rubrik_mk` ADD CONSTRAINT `komponen_rubrik_mk_matakuliah_id_fkey` FOREIGN KEY (`matakuliah_id`) REFERENCES `matakuliah`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lowongan_magang` ADD CONSTRAINT `lowongan_magang_pembuat_user_id_fkey` FOREIGN KEY (`pembuat_user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lowongan_magang` ADD CONSTRAINT `lowongan_magang_dosen_pj_id_fkey` FOREIGN KEY (`dosen_pj_id`) REFERENCES `dosen`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lamaran_lowongan` ADD CONSTRAINT `lamaran_lowongan_lowongan_id_fkey` FOREIGN KEY (`lowongan_id`) REFERENCES `lowongan_magang`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lamaran_lowongan` ADD CONSTRAINT `lamaran_lowongan_mahasiswa_id_fkey` FOREIGN KEY (`mahasiswa_id`) REFERENCES `mahasiswa`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pendataan_magang` ADD CONSTRAINT `pendataan_magang_mahasiswa_id_fkey` FOREIGN KEY (`mahasiswa_id`) REFERENCES `mahasiswa`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pendataan_magang` ADD CONSTRAINT `pendataan_magang_semester_id_fkey` FOREIGN KEY (`semester_id`) REFERENCES `periode_semester`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pendataan_magang` ADD CONSTRAINT `pendataan_magang_dosen_pembimbing_id_fkey` FOREIGN KEY (`dosen_pembimbing_id`) REFERENCES `dosen`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pendataan_magang` ADD CONSTRAINT `pendataan_magang_dosen_kunjung_id_fkey` FOREIGN KEY (`dosen_kunjung_id`) REFERENCES `dosen`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pendataan_magang` ADD CONSTRAINT `pendataan_magang_verified_by_user_id_fkey` FOREIGN KEY (`verified_by_user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `dokumen_sk` ADD CONSTRAINT `dokumen_sk_pendataan_id_fkey` FOREIGN KEY (`pendataan_id`) REFERENCES `pendataan_magang`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `dokumen_sk` ADD CONSTRAINT `dokumen_sk_generated_by_user_id_fkey` FOREIGN KEY (`generated_by_user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `dokumen_sk` ADD CONSTRAINT `dokumen_sk_disahkan_kaprodi_id_fkey` FOREIGN KEY (`disahkan_kaprodi_id`) REFERENCES `dosen`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `logbook` ADD CONSTRAINT `logbook_pendataan_id_fkey` FOREIGN KEY (`pendataan_id`) REFERENCES `pendataan_magang`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `logbook` ADD CONSTRAINT `logbook_validated_by_dosen_id_fkey` FOREIGN KEY (`validated_by_dosen_id`) REFERENCES `dosen`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `berkas_akhir` ADD CONSTRAINT `berkas_akhir_pendataan_id_fkey` FOREIGN KEY (`pendataan_id`) REFERENCES `pendataan_magang`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `konversi_matakuliah` ADD CONSTRAINT `konversi_matakuliah_pendataan_id_fkey` FOREIGN KEY (`pendataan_id`) REFERENCES `pendataan_magang`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `konversi_matakuliah` ADD CONSTRAINT `konversi_matakuliah_matakuliah_id_fkey` FOREIGN KEY (`matakuliah_id`) REFERENCES `matakuliah`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `konversi_matakuliah` ADD CONSTRAINT `konversi_matakuliah_dosen_penilai_id_fkey` FOREIGN KEY (`dosen_penilai_id`) REFERENCES `dosen`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `nilai_rubrik_mahasiswa` ADD CONSTRAINT `nilai_rubrik_mahasiswa_konversi_mk_id_fkey` FOREIGN KEY (`konversi_mk_id`) REFERENCES `konversi_matakuliah`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `nilai_rubrik_mahasiswa` ADD CONSTRAINT `nilai_rubrik_mahasiswa_komponen_rubrik_id_fkey` FOREIGN KEY (`komponen_rubrik_id`) REFERENCES `komponen_rubrik_mk`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
