import {
  JenisCatatanLogbook,
  JenisDokumenSk,
  JenisProgramMbkm,
  KategoriAnalitikMbkm,
  ModeKegiatan,
  Prisma,
  PrismaClient,
  RoleUser,
  StatusBerkasAkhir,
  StatusLowongan,
  StatusPendataan,
  StatusPengesahanSk,
  StatusPenilaianKonversi,
  StatusValidasiLogbook,
  SumberLowongan,
  TingkatKesesuaianMk,
} from "@prisma/client";

const prisma = new PrismaClient();

const SEED_IDS = {
  lowonganTelkom: "11111111-1111-4111-8111-111111111101",
  lowonganMandiri: "11111111-1111-4111-8111-111111111102",
  lowonganBbp: "11111111-1111-4111-8111-111111111103",
  lowonganGoto: "11111111-1111-4111-8111-111111111104",
  rubrikRl401K1: "22222222-2222-4222-8222-222222222101",
  rubrikRl401K2: "22222222-2222-4222-8222-222222222102",
  rubrikRl401K3: "22222222-2222-4222-8222-222222222103",
  rubrikRl402K1: "22222222-2222-4222-8222-222222222201",
  rubrikRl402K2: "22222222-2222-4222-8222-222222222202",
  rubrikRl402K3: "22222222-2222-4222-8222-222222222203",
  rubrikRl403K1: "22222222-2222-4222-8222-222222222301",
  rubrikRl403K2: "22222222-2222-4222-8222-222222222302",
  rubrikRl403K3: "22222222-2222-4222-8222-222222222303",
  rubrikRl404K1: "22222222-2222-4222-8222-222222222401",
  rubrikRl404K2: "22222222-2222-4222-8222-222222222402",
  rubrikRl404K3: "22222222-2222-4222-8222-222222222403",
  logbookRizkyW1: "33333333-3333-4333-8333-333333333101",
  logbookRizkyW2: "33333333-3333-4333-8333-333333333102",
  logbookRizkyM1: "33333333-3333-4333-8333-333333333103",
  logbookNadiaW1: "33333333-3333-4333-8333-333333333201",
  logbookNadiaW2: "33333333-3333-4333-8333-333333333202",
} as const;

async function main(): Promise<void> {
  const now = new Date();

  const userKaprodi = await prisma.user.upsert({
    where: { ssoSub: "seed-sso-kaprodi-hendra" },
    update: {
      email: "hendra.wijaya.seed@upi.edu",
      nama: "Dr. Hendra Wijaya, M.T.",
      nipNim: "198103122006041001",
      role: RoleUser.KAPRODI,
      ssoRawRole: "Kaprodi",
      lastLoginAt: now,
    },
    create: {
      ssoSub: "seed-sso-kaprodi-hendra",
      email: "hendra.wijaya.seed@upi.edu",
      nama: "Dr. Hendra Wijaya, M.T.",
      nipNim: "198103122006041001",
      role: RoleUser.KAPRODI,
      ssoRawRole: "Kaprodi",
      lastLoginAt: now,
    },
  });

  const userDosenRina = await prisma.user.upsert({
    where: { ssoSub: "seed-sso-dosen-rina" },
    update: {
      email: "rina.kusuma.seed@upi.edu",
      nama: "Dr. Rina Kusumawardani, M.Kom.",
      nipNim: "198607242012122002",
      role: RoleUser.DOSEN,
      ssoRawRole: "Dosen",
      lastLoginAt: now,
    },
    create: {
      ssoSub: "seed-sso-dosen-rina",
      email: "rina.kusuma.seed@upi.edu",
      nama: "Dr. Rina Kusumawardani, M.Kom.",
      nipNim: "198607242012122002",
      role: RoleUser.DOSEN,
      ssoRawRole: "Dosen",
      lastLoginAt: now,
    },
  });

  const userDosenFajar = await prisma.user.upsert({
    where: { ssoSub: "seed-sso-dosen-fajar" },
    update: {
      email: "fajar.pratama.seed@upi.edu",
      nama: "Fajar Pratama, S.Kom., M.T.",
      nipNim: "199111082019031005",
      role: RoleUser.DOSEN,
      ssoRawRole: "Dosen",
      lastLoginAt: now,
    },
    create: {
      ssoSub: "seed-sso-dosen-fajar",
      email: "fajar.pratama.seed@upi.edu",
      nama: "Fajar Pratama, S.Kom., M.T.",
      nipNim: "199111082019031005",
      role: RoleUser.DOSEN,
      ssoRawRole: "Dosen",
      lastLoginAt: now,
    },
  });

  const userAdmin = await prisma.user.upsert({
    where: { ssoSub: "seed-sso-admin-siti" },
    update: {
      email: "siti.nurhaliza.seed@upi.edu",
      nama: "Siti Nurhaliza, S.Pd.",
      nipNim: "199305192020122008",
      role: RoleUser.ADMIN,
      ssoRawRole: "Admin",
      lastLoginAt: now,
    },
    create: {
      ssoSub: "seed-sso-admin-siti",
      email: "siti.nurhaliza.seed@upi.edu",
      nama: "Siti Nurhaliza, S.Pd.",
      nipNim: "199305192020122008",
      role: RoleUser.ADMIN,
      ssoRawRole: "Admin",
      lastLoginAt: now,
    },
  });

  const mahasiswaSpecs = [
    {
      ssoSub: "seed-sso-mhs-rizky",
      email: "rizky.ramadhan.seed@upi.edu",
      nama: "Rizky Ramadhan",
      nim: "2204101",
      angkatan: 2022,
    },
    {
      ssoSub: "seed-sso-mhs-nadia",
      email: "nadia.maharani.seed@upi.edu",
      nama: "Nadia Putri Maharani",
      nim: "2204102",
      angkatan: 2022,
    },
    {
      ssoSub: "seed-sso-mhs-dimas",
      email: "dimas.saputra.seed@upi.edu",
      nama: "Dimas Arya Saputra",
      nim: "2305201",
      angkatan: 2023,
    },
    {
      ssoSub: "seed-sso-mhs-alya",
      email: "alya.kamila.seed@upi.edu",
      nama: "Alya Zahra Kamila",
      nim: "2406301",
      angkatan: 2024,
    },
  ] as const;

  const mahasiswaRecords = [];
  for (const spec of mahasiswaSpecs) {
    const userMhs = await prisma.user.upsert({
      where: { ssoSub: spec.ssoSub },
      update: {
        email: spec.email,
        nama: spec.nama,
        nipNim: spec.nim,
        role: RoleUser.MAHASISWA,
        ssoRawRole: "Mahasiswa",
        lastLoginAt: now,
      },
      create: {
        ssoSub: spec.ssoSub,
        email: spec.email,
        nama: spec.nama,
        nipNim: spec.nim,
        role: RoleUser.MAHASISWA,
        ssoRawRole: "Mahasiswa",
        lastLoginAt: now,
      },
    });

    const profilMhs = await prisma.mahasiswa.upsert({
      where: { userId: userMhs.id },
      update: {
        nim: spec.nim,
        prodi: "Rekayasa Perangkat Lunak",
        angkatan: spec.angkatan,
        statusAktif: true,
      },
      create: {
        userId: userMhs.id,
        nim: spec.nim,
        prodi: "Rekayasa Perangkat Lunak",
        angkatan: spec.angkatan,
        statusAktif: true,
      },
    });

    mahasiswaRecords.push(profilMhs);
  }

  const [mhsRizky, mhsNadia, mhsDimas, mhsAlya] = mahasiswaRecords;
  if (!mhsRizky || !mhsNadia || !mhsDimas || !mhsAlya) {
    throw new Error("Inisialisasi profil mahasiswa gagal.");
  }

  const dosenKaprodi = await prisma.dosen.upsert({
    where: { userId: userKaprodi.id },
    update: {
      nip: "198103122006041001",
      namaBergelar: "Dr. Hendra Wijaya, M.T.",
      statusAktif: true,
    },
    create: {
      userId: userKaprodi.id,
      nip: "198103122006041001",
      namaBergelar: "Dr. Hendra Wijaya, M.T.",
      statusAktif: true,
    },
  });

  const dosenRina = await prisma.dosen.upsert({
    where: { userId: userDosenRina.id },
    update: {
      nip: "198607242012122002",
      namaBergelar: "Dr. Rina Kusumawardani, M.Kom.",
      statusAktif: true,
    },
    create: {
      userId: userDosenRina.id,
      nip: "198607242012122002",
      namaBergelar: "Dr. Rina Kusumawardani, M.Kom.",
      statusAktif: true,
    },
  });

  const dosenFajar = await prisma.dosen.upsert({
    where: { userId: userDosenFajar.id },
    update: {
      nip: "199111082019031005",
      namaBergelar: "Fajar Pratama, S.Kom., M.T.",
      statusAktif: true,
    },
    create: {
      userId: userDosenFajar.id,
      nip: "199111082019031005",
      namaBergelar: "Fajar Pratama, S.Kom., M.T.",
      statusAktif: true,
    },
  });

  const semesterLalu = await prisma.periodeSemester.upsert({
    where: { kodeSemester: "20252" },
    update: {
      namaSemester: "Genap 2025/2026",
      jenisSemester: "GENAP",
      isAktif: false,
      tanggalMulai: new Date("2026-02-02"),
      tanggalSelesai: new Date("2026-07-15"),
    },
    create: {
      kodeSemester: "20252",
      namaSemester: "Genap 2025/2026",
      jenisSemester: "GENAP",
      isAktif: false,
      tanggalMulai: new Date("2026-02-02"),
      tanggalSelesai: new Date("2026-07-15"),
    },
  });

  const semesterAktif = await prisma.periodeSemester.upsert({
    where: { kodeSemester: "20261" },
    update: {
      namaSemester: "Ganjil 2026/2027",
      jenisSemester: "GANJIL",
      isAktif: true,
      tanggalMulai: new Date("2026-09-01"),
      tanggalSelesai: new Date("2027-01-31"),
    },
    create: {
      kodeSemester: "20261",
      namaSemester: "Ganjil 2026/2027",
      jenisSemester: "GANJIL",
      isAktif: true,
      tanggalMulai: new Date("2026-09-01"),
      tanggalSelesai: new Date("2027-01-31"),
    },
  });

  const mkRl401 = await prisma.mataKuliah.upsert({
    where: { kodeMk: "RL401" },
    update: {
      dosenPengampuId: dosenRina.id,
      namaMk: "Praktik Industri Perangkat Lunak",
      sks: 4,
      isKonversiMbkm: true,
    },
    create: {
      dosenPengampuId: dosenRina.id,
      kodeMk: "RL401",
      namaMk: "Praktik Industri Perangkat Lunak",
      sks: 4,
      isKonversiMbkm: true,
    },
  });

  const mkRl402 = await prisma.mataKuliah.upsert({
    where: { kodeMk: "RL402" },
    update: {
      dosenPengampuId: dosenRina.id,
      namaMk: "Keamanan Siber dan Jaminan Kualitas",
      sks: 3,
      isKonversiMbkm: true,
    },
    create: {
      dosenPengampuId: dosenRina.id,
      kodeMk: "RL402",
      namaMk: "Keamanan Siber dan Jaminan Kualitas",
      sks: 3,
      isKonversiMbkm: true,
    },
  });

  const mkRl403 = await prisma.mataKuliah.upsert({
    where: { kodeMk: "RL403" },
    update: {
      dosenPengampuId: dosenFajar.id,
      namaMk: "Arsitektur Cloud dan DevOps",
      sks: 3,
      isKonversiMbkm: true,
    },
    create: {
      dosenPengampuId: dosenFajar.id,
      kodeMk: "RL403",
      namaMk: "Arsitektur Cloud dan DevOps",
      sks: 3,
      isKonversiMbkm: true,
    },
  });

  const mkRl404 = await prisma.mataKuliah.upsert({
    where: { kodeMk: "RL404" },
    update: {
      dosenPengampuId: dosenKaprodi.id,
      namaMk: "Manajemen Proyek Perangkat Lunak",
      sks: 3,
      isKonversiMbkm: true,
    },
    create: {
      dosenPengampuId: dosenKaprodi.id,
      kodeMk: "RL404",
      namaMk: "Manajemen Proyek Perangkat Lunak",
      sks: 3,
      isKonversiMbkm: true,
    },
  });

  // Total bobot rubrik tiap mata kuliah tepat 100.00% (40% + 35% + 25%).
  const rubrikSpecs = [
    {
      id: SEED_IDS.rubrikRl401K1,
      matakuliahId: mkRl401.id,
      namaKomponen: "Implementasi Fitur dan Kualitas Kode",
      deskripsiKomponen: "Ketepatan arsitektur kode, standar keterbacaan, dan penyelesaian modul produk di industri.",
      bobotPersen: new Prisma.Decimal("40.00"),
      urutan: 1,
    },
    {
      id: SEED_IDS.rubrikRl401K2,
      matakuliahId: mkRl401.id,
      namaKomponen: "Kolaborasi Tim dan Alur Kerja Engineering",
      deskripsiKomponen: "Kedisiplinan penggunaan Git, code review, dan komunikasi dalam tim pengembang mitra.",
      bobotPersen: new Prisma.Decimal("35.00"),
      urutan: 2,
    },
    {
      id: SEED_IDS.rubrikRl401K3,
      matakuliahId: mkRl401.id,
      namaKomponen: "Dokumentasi Teknis dan Presentasi Akhir",
      deskripsiKomponen: "Kelengkapan laporan akhir rekayasa perangkat lunak serta kemampuan mempertahankan solusi.",
      bobotPersen: new Prisma.Decimal("25.00"),
      urutan: 3,
    },
    {
      id: SEED_IDS.rubrikRl402K1,
      matakuliahId: mkRl402.id,
      namaKomponen: "Pengujian Keamanan dan Mitigasi Celah",
      deskripsiKomponen: "Penerapan standar OWASP, validasi input, dan perlindungan autentikasi pada sistem.",
      bobotPersen: new Prisma.Decimal("40.00"),
      urutan: 1,
    },
    {
      id: SEED_IDS.rubrikRl402K2,
      matakuliahId: mkRl402.id,
      namaKomponen: "Otomasi Pengujian dan Cakupan Test",
      deskripsiKomponen: "Penyusunan skenario unit test, integration test, dan regresi otomatis.",
      bobotPersen: new Prisma.Decimal("35.00"),
      urutan: 2,
    },
    {
      id: SEED_IDS.rubrikRl402K3,
      matakuliahId: mkRl402.id,
      namaKomponen: "Laporan Audit Kualitas Perangkat Lunak",
      deskripsiKomponen: "Ketajaman analisis temuan bug, metrik kualitas, dan rekomendasi perbaikan.",
      bobotPersen: new Prisma.Decimal("25.00"),
      urutan: 3,
    },
    {
      id: SEED_IDS.rubrikRl403K1,
      matakuliahId: mkRl403.id,
      namaKomponen: "Otomasi Pipeline CI/CD dan Kontainerisasi",
      deskripsiKomponen: "Perancangan build otomatis, image kontainer, dan strategi deployment tanpa henti.",
      bobotPersen: new Prisma.Decimal("40.00"),
      urutan: 1,
    },
    {
      id: SEED_IDS.rubrikRl403K2,
      matakuliahId: mkRl403.id,
      namaKomponen: "Keandalan Infrastruktur Cloud dan Observabilitas",
      deskripsiKomponen: "Konfigurasi monitoring, logging terpusat, dan efisiensi sumber daya cloud.",
      bobotPersen: new Prisma.Decimal("35.00"),
      urutan: 2,
    },
    {
      id: SEED_IDS.rubrikRl403K3,
      matakuliahId: mkRl403.id,
      namaKomponen: "Dokumentasi Runbook Operasional",
      deskripsiKomponen: "Kejelasan topologi infrastruktur serta prosedur penanganan insiden produksi.",
      bobotPersen: new Prisma.Decimal("25.00"),
      urutan: 3,
    },
    {
      id: SEED_IDS.rubrikRl404K1,
      matakuliahId: mkRl404.id,
      namaKomponen: "Perencanaan Sprint dan Estimasi Backlog",
      deskripsiKomponen: "Ketepatan penyusunan user story, estimasi beban kerja, dan prioritas rilis.",
      bobotPersen: new Prisma.Decimal("40.00"),
      urutan: 1,
    },
    {
      id: SEED_IDS.rubrikRl404K2,
      matakuliahId: mkRl404.id,
      namaKomponen: "Manajemen Risiko dan Ketepatan Delivery",
      deskripsiKomponen: "Kemampuan mengidentifikasi hambatan proyek dan menjaga capaian milestone.",
      bobotPersen: new Prisma.Decimal("35.00"),
      urutan: 2,
    },
    {
      id: SEED_IDS.rubrikRl404K3,
      matakuliahId: mkRl404.id,
      namaKomponen: "Evaluasi Retrospektif dan Pelaporan Pemangku Kepentingan",
      deskripsiKomponen: "Kualitas pelaporan progres mingguan dan evaluasi perbaikan proses tim.",
      bobotPersen: new Prisma.Decimal("25.00"),
      urutan: 3,
    },
  ] as const;

  for (const rubrik of rubrikSpecs) {
    await prisma.komponenRubrikMk.upsert({
      where: { id: rubrik.id },
      update: {
        matakuliahId: rubrik.matakuliahId,
        namaKomponen: rubrik.namaKomponen,
        deskripsiKomponen: rubrik.deskripsiKomponen,
        bobotPersen: rubrik.bobotPersen,
        urutan: rubrik.urutan,
      },
      create: rubrik,
    });
  }

  const lowonganSpecs = [
    {
      id: SEED_IDS.lowonganTelkom,
      pembuatUserId: userAdmin.id,
      dosenPjId: null,
      judulLowongan: "Backend Software Engineer Intern (Digital Tribe)",
      namaInstansi: "PT Telkom Indonesia (Persero) Tbk",
      posisiBidang: "Backend Engineering",
      lokasiModeKerja: "Bandung (Hybrid)",
      sumberLowongan: SumberLowongan.MITRA_KAMPUS,
      kontakInstansi: "recruitment-internship@telkom.co.id",
      deskripsi:
        "Terlibat langsung dalam pengembangan layanan mikro berbasis TypeScript dan Go untuk ekosistem produk digital B2B Telkom.",
      persyaratan:
        "Mahasiswa aktif S1 RPL minimal semester 5, memahami REST API, SQL relasional, serta dasar Git.",
      logoUrl: null,
      statusLowongan: StatusLowongan.AKTIF,
      jumlahPelamar: 2,
      batasTanggal: new Date("2026-12-20"),
      tanggalPublikasi: new Date("2026-08-15T09:00:00Z"),
    },
    {
      id: SEED_IDS.lowonganMandiri,
      pembuatUserId: userKaprodi.id,
      dosenPjId: dosenFajar.id,
      judulLowongan: "Cloud Infrastructure & DevSecOps Intern",
      namaInstansi: "PT Bank Mandiri (Persero) Tbk",
      posisiBidang: "Cloud & DevSecOps",
      lokasiModeKerja: "Jakarta Selatan (Hybrid)",
      sumberLowongan: SumberLowongan.BINAAN_DOSEN,
      kontakInstansi: "campus.hiring@bankmandiri.co.id",
      deskripsi:
        "Program magang kolaborasi riset binaan dosen Prodi RPL untuk otomasi CI/CD dan pemantauan keamanan klaster kontainer.",
      persyaratan:
        "Memahami Linux dasar, Docker, jaringan komputer, dan bersedia mengikuti bimbingan rutin bersama Dosen PJ.",
      logoUrl: null,
      statusLowongan: StatusLowongan.AKTIF,
      jumlahPelamar: 2,
      batasTanggal: new Date("2026-12-15"),
      tanggalPublikasi: new Date("2026-08-18T08:30:00Z"),
    },
    {
      id: SEED_IDS.lowonganBbp,
      pembuatUserId: userAdmin.id,
      dosenPjId: dosenRina.id,
      judulLowongan: "Fullstack Web Developer Sistem Penjaminan Mutu",
      namaInstansi: "BBPPMPV Bidang Mesin dan Teknik Industri",
      posisiBidang: "Fullstack Web Development",
      lokasiModeKerja: "Cimahi (Onsite)",
      sumberLowongan: SumberLowongan.BINAAN_DOSEN,
      kontakInstansi: "kerjasama.bbppmpvbmti@kemdikbud.go.id",
      deskripsi:
        "Pengembangan portal pemantauan diklat vokasi terintegrasi menggunakan Next.js dan basis data MySQL.",
      persyaratan:
        "Menguasai React/Next.js, TypeScript, dan perancangan skema basis data relasional.",
      logoUrl: null,
      statusLowongan: StatusLowongan.DRAF,
      jumlahPelamar: 0,
      batasTanggal: new Date("2027-01-10"),
      tanggalPublikasi: null,
    },
    {
      id: SEED_IDS.lowonganGoto,
      pembuatUserId: userAdmin.id,
      dosenPjId: null,
      judulLowongan: "Quality Assurance Automation Intern",
      namaInstansi: "PT GoTo Gojek Tokopedia Tbk",
      posisiBidang: "Software Quality Assurance",
      lokasiModeKerja: "Jakarta (Remote)",
      sumberLowongan: SumberLowongan.MITRA_KAMPUS,
      kontakInstansi: "earlytalent@gotocompany.com",
      deskripsi:
        "Menyusun skenario pengujian otomatis end-to-end pada layanan transaksi konsumen berskala tinggi.",
      persyaratan:
        "Memahami pengujian API, Playwright atau Cypress, dan penulisan test case terstruktur.",
      logoUrl: null,
      statusLowongan: StatusLowongan.TUTUP,
      jumlahPelamar: 1,
      batasTanggal: new Date("2026-08-30"),
      tanggalPublikasi: new Date("2026-07-25T10:00:00Z"),
    },
  ] as const;

  for (const lowongan of lowonganSpecs) {
    await prisma.lowonganMagang.upsert({
      where: { id: lowongan.id },
      update: {
        pembuatUserId: lowongan.pembuatUserId,
        dosenPjId: lowongan.dosenPjId,
        judulLowongan: lowongan.judulLowongan,
        namaInstansi: lowongan.namaInstansi,
        posisiBidang: lowongan.posisiBidang,
        lokasiModeKerja: lowongan.lokasiModeKerja,
        sumberLowongan: lowongan.sumberLowongan,
        kontakInstansi: lowongan.kontakInstansi,
        deskripsi: lowongan.deskripsi,
        persyaratan: lowongan.persyaratan,
        logoUrl: lowongan.logoUrl,
        statusLowongan: lowongan.statusLowongan,
        jumlahPelamar: lowongan.jumlahPelamar,
        batasTanggal: lowongan.batasTanggal,
        tanggalPublikasi: lowongan.tanggalPublikasi,
      },
      create: lowongan,
    });
  }

  const lamaranPairs = [
    { lowonganId: SEED_IDS.lowonganTelkom, mahasiswaId: mhsRizky.id },
    { lowonganId: SEED_IDS.lowonganTelkom, mahasiswaId: mhsDimas.id },
    { lowonganId: SEED_IDS.lowonganMandiri, mahasiswaId: mhsNadia.id },
    { lowonganId: SEED_IDS.lowonganMandiri, mahasiswaId: mhsAlya.id },
    { lowonganId: SEED_IDS.lowonganGoto, mahasiswaId: mhsRizky.id },
  ] as const;

  for (const pair of lamaranPairs) {
    await prisma.lamaranLowongan.upsert({
      where: {
        lowonganId_mahasiswaId: {
          lowonganId: pair.lowonganId,
          mahasiswaId: pair.mahasiswaId,
        },
      },
      update: {},
      create: {
        lowonganId: pair.lowonganId,
        mahasiswaId: pair.mahasiswaId,
        tanggalMinat: new Date("2026-08-22T09:15:00Z"),
      },
    });
  }

  const pendataanRizky = await prisma.pendataanMagang.upsert({
    where: {
      mahasiswaId_semesterId: {
        mahasiswaId: mhsRizky.id,
        semesterId: semesterAktif.id,
      },
    },
    update: {
      dosenPembimbingId: dosenRina.id,
      dosenKunjungId: dosenFajar.id,
      verifiedByUserId: userAdmin.id,
      namaInstansi: "PT Telkom Indonesia (Persero) Tbk",
      alamatInstansi: "Jl. Japati No. 1, Sadang Serang, Kec. Coblong, Kota Bandung, Jawa Barat",
      kontakInstansi: "Bapak Arif Budiman (arif.budiman@telkom.co.id / 081220001122)",
      posisi: "Backend Software Engineer Intern",
      jenisProgram: JenisProgramMbkm.MSIB,
      kategoriAnalitik: KategoriAnalitikMbkm.MAGANG,
      modeKegiatan: ModeKegiatan.HYBRID,
      tanggalMulai: new Date("2026-09-01"),
      tanggalSelesai: new Date("2027-01-15"),
      fileLoaAwalUrl: "https://storage.sinergo-rpl.id/loa/2204101-loa-telkom.pdf",
      fileLoaAwalNama: "LOA_MSIB_Telkom_Rizky_Ramadhan.pdf",
      pernyataanBenar: true,
      statusPendataan: StatusPendataan.TERVERIFIKASI,
      catatanRevisi: null,
      submittedAt: new Date("2026-08-28T10:00:00Z"),
      verifiedAt: new Date("2026-08-30T14:20:00Z"),
    },
    create: {
      mahasiswaId: mhsRizky.id,
      semesterId: semesterAktif.id,
      dosenPembimbingId: dosenRina.id,
      dosenKunjungId: dosenFajar.id,
      verifiedByUserId: userAdmin.id,
      namaInstansi: "PT Telkom Indonesia (Persero) Tbk",
      alamatInstansi: "Jl. Japati No. 1, Sadang Serang, Kec. Coblong, Kota Bandung, Jawa Barat",
      kontakInstansi: "Bapak Arif Budiman (arif.budiman@telkom.co.id / 081220001122)",
      posisi: "Backend Software Engineer Intern",
      jenisProgram: JenisProgramMbkm.MSIB,
      kategoriAnalitik: KategoriAnalitikMbkm.MAGANG,
      modeKegiatan: ModeKegiatan.HYBRID,
      tanggalMulai: new Date("2026-09-01"),
      tanggalSelesai: new Date("2027-01-15"),
      fileLoaAwalUrl: "https://storage.sinergo-rpl.id/loa/2204101-loa-telkom.pdf",
      fileLoaAwalNama: "LOA_MSIB_Telkom_Rizky_Ramadhan.pdf",
      pernyataanBenar: true,
      statusPendataan: StatusPendataan.TERVERIFIKASI,
      catatanRevisi: null,
      submittedAt: new Date("2026-08-28T10:00:00Z"),
      verifiedAt: new Date("2026-08-30T14:20:00Z"),
    },
  });

  const pendataanNadia = await prisma.pendataanMagang.upsert({
    where: {
      mahasiswaId_semesterId: {
        mahasiswaId: mhsNadia.id,
        semesterId: semesterAktif.id,
      },
    },
    update: {
      dosenPembimbingId: dosenFajar.id,
      dosenKunjungId: dosenRina.id,
      verifiedByUserId: userAdmin.id,
      namaInstansi: "Dicoding Akademi Indonesia",
      alamatInstansi: "Jl. Batik Kumeli No. 50, Sukaluyu, Kec. Cibeunying Kaler, Kota Bandung",
      kontakInstansi: "Ibu Ratna Sari (sib@dicoding.com / 081322445566)",
      posisi: "Cloud & Back-End Cohort Participant",
      jenisProgram: JenisProgramMbkm.SI,
      kategoriAnalitik: KategoriAnalitikMbkm.MBKM_LAINNYA,
      modeKegiatan: ModeKegiatan.REMOTE,
      tanggalMulai: new Date("2026-09-02"),
      tanggalSelesai: new Date("2027-01-10"),
      fileLoaAwalUrl: "https://storage.sinergo-rpl.id/loa/2204102-loa-dicoding.pdf",
      fileLoaAwalNama: "LOA_SIB_Dicoding_Nadia_Putri.pdf",
      pernyataanBenar: true,
      statusPendataan: StatusPendataan.TERVERIFIKASI,
      catatanRevisi: null,
      submittedAt: new Date("2026-08-29T11:30:00Z"),
      verifiedAt: new Date("2026-08-31T09:10:00Z"),
    },
    create: {
      mahasiswaId: mhsNadia.id,
      semesterId: semesterAktif.id,
      dosenPembimbingId: dosenFajar.id,
      dosenKunjungId: dosenRina.id,
      verifiedByUserId: userAdmin.id,
      namaInstansi: "Dicoding Akademi Indonesia",
      alamatInstansi: "Jl. Batik Kumeli No. 50, Sukaluyu, Kec. Cibeunying Kaler, Kota Bandung",
      kontakInstansi: "Ibu Ratna Sari (sib@dicoding.com / 081322445566)",
      posisi: "Cloud & Back-End Cohort Participant",
      jenisProgram: JenisProgramMbkm.SI,
      kategoriAnalitik: KategoriAnalitikMbkm.MBKM_LAINNYA,
      modeKegiatan: ModeKegiatan.REMOTE,
      tanggalMulai: new Date("2026-09-02"),
      tanggalSelesai: new Date("2027-01-10"),
      fileLoaAwalUrl: "https://storage.sinergo-rpl.id/loa/2204102-loa-dicoding.pdf",
      fileLoaAwalNama: "LOA_SIB_Dicoding_Nadia_Putri.pdf",
      pernyataanBenar: true,
      statusPendataan: StatusPendataan.TERVERIFIKASI,
      catatanRevisi: null,
      submittedAt: new Date("2026-08-29T11:30:00Z"),
      verifiedAt: new Date("2026-08-31T09:10:00Z"),
    },
  });

  const pendataanDimas = await prisma.pendataanMagang.upsert({
    where: {
      mahasiswaId_semesterId: {
        mahasiswaId: mhsDimas.id,
        semesterId: semesterAktif.id,
      },
    },
    update: {
      dosenPembimbingId: dosenRina.id,
      dosenKunjungId: null,
      verifiedByUserId: null,
      namaInstansi: "PT Kazee Digital Indonesia",
      alamatInstansi: "Jl. Setrasari Indah No. 18, Sukarasa, Kec. Sukasari, Kota Bandung",
      kontakInstansi: "HRD Kazee (hr@kazee.id / 082118889900)",
      posisi: "Data & Backend Developer Intern",
      jenisProgram: JenisProgramMbkm.MM,
      kategoriAnalitik: KategoriAnalitikMbkm.MAGANG,
      modeKegiatan: ModeKegiatan.ONSITE,
      tanggalMulai: new Date("2026-09-15"),
      tanggalSelesai: new Date("2027-01-20"),
      fileLoaAwalUrl: "https://storage.sinergo-rpl.id/loa/2305201-loa-kazee.pdf",
      fileLoaAwalNama: "LOA_MagangMandiri_Dimas_Arya.pdf",
      pernyataanBenar: true,
      statusPendataan: StatusPendataan.MENUNGGU,
      catatanRevisi: null,
      submittedAt: new Date("2026-09-05T13:45:00Z"),
      verifiedAt: null,
    },
    create: {
      mahasiswaId: mhsDimas.id,
      semesterId: semesterAktif.id,
      dosenPembimbingId: dosenRina.id,
      dosenKunjungId: null,
      verifiedByUserId: null,
      namaInstansi: "PT Kazee Digital Indonesia",
      alamatInstansi: "Jl. Setrasari Indah No. 18, Sukarasa, Kec. Sukasari, Kota Bandung",
      kontakInstansi: "HRD Kazee (hr@kazee.id / 082118889900)",
      posisi: "Data & Backend Developer Intern",
      jenisProgram: JenisProgramMbkm.MM,
      kategoriAnalitik: KategoriAnalitikMbkm.MAGANG,
      modeKegiatan: ModeKegiatan.ONSITE,
      tanggalMulai: new Date("2026-09-15"),
      tanggalSelesai: new Date("2027-01-20"),
      fileLoaAwalUrl: "https://storage.sinergo-rpl.id/loa/2305201-loa-kazee.pdf",
      fileLoaAwalNama: "LOA_MagangMandiri_Dimas_Arya.pdf",
      pernyataanBenar: true,
      statusPendataan: StatusPendataan.MENUNGGU,
      catatanRevisi: null,
      submittedAt: new Date("2026-09-05T13:45:00Z"),
      verifiedAt: null,
    },
  });

  await prisma.pendataanMagang.upsert({
    where: {
      mahasiswaId_semesterId: {
        mahasiswaId: mhsAlya.id,
        semesterId: semesterAktif.id,
      },
    },
    update: {
      dosenPembimbingId: dosenFajar.id,
      dosenKunjungId: null,
      verifiedByUserId: userAdmin.id,
      namaInstansi: "Institut Teknologi Sepuluh Nopember",
      alamatInstansi: "Kampus ITS Sukolilo, Kota Surabaya, Jawa Timur",
      kontakInstansi: "Sekretariat PMM ITS (pmm@its.ac.id)",
      posisi: "Peserta Pertukaran Mahasiswa Merdeka Inbound",
      jenisProgram: JenisProgramMbkm.PMM,
      kategoriAnalitik: KategoriAnalitikMbkm.MBKM_LAINNYA,
      modeKegiatan: ModeKegiatan.ONSITE,
      tanggalMulai: new Date("2026-09-10"),
      tanggalSelesai: new Date("2027-01-18"),
      fileLoaAwalUrl: "https://storage.sinergo-rpl.id/loa/2406301-loa-pmm-draft.pdf",
      fileLoaAwalNama: "Bukti_Sementara_PMM_Alya.pdf",
      pernyataanBenar: true,
      statusPendataan: StatusPendataan.PERLU_REVISI,
      catatanRevisi:
        "Mohon unggah ulang Surat Penerimaan (LOA) resmi berstempel perguruan tinggi penerima beserta lampiran KRS pertukaran.",
      submittedAt: new Date("2026-09-04T08:20:00Z"),
      verifiedAt: null,
    },
    create: {
      mahasiswaId: mhsAlya.id,
      semesterId: semesterAktif.id,
      dosenPembimbingId: dosenFajar.id,
      dosenKunjungId: null,
      verifiedByUserId: userAdmin.id,
      namaInstansi: "Institut Teknologi Sepuluh Nopember",
      alamatInstansi: "Kampus ITS Sukolilo, Kota Surabaya, Jawa Timur",
      kontakInstansi: "Sekretariat PMM ITS (pmm@its.ac.id)",
      posisi: "Peserta Pertukaran Mahasiswa Merdeka Inbound",
      jenisProgram: JenisProgramMbkm.PMM,
      kategoriAnalitik: KategoriAnalitikMbkm.MBKM_LAINNYA,
      modeKegiatan: ModeKegiatan.ONSITE,
      tanggalMulai: new Date("2026-09-10"),
      tanggalSelesai: new Date("2027-01-18"),
      fileLoaAwalUrl: "https://storage.sinergo-rpl.id/loa/2406301-loa-pmm-draft.pdf",
      fileLoaAwalNama: "Bukti_Sementara_PMM_Alya.pdf",
      pernyataanBenar: true,
      statusPendataan: StatusPendataan.PERLU_REVISI,
      catatanRevisi:
        "Mohon unggah ulang Surat Penerimaan (LOA) resmi berstempel perguruan tinggi penerima beserta lampiran KRS pertukaran.",
      submittedAt: new Date("2026-09-04T08:20:00Z"),
      verifiedAt: null,
    },
  });

  // Satu data historis semester sebelumnya untuk pengujian filter lintas periode pada analitik Kaprodi.
  await prisma.pendataanMagang.upsert({
    where: {
      mahasiswaId_semesterId: {
        mahasiswaId: mhsRizky.id,
        semesterId: semesterLalu.id,
      },
    },
    update: {
      dosenPembimbingId: dosenKaprodi.id,
      dosenKunjungId: null,
      verifiedByUserId: userAdmin.id,
      namaInstansi: "Laboratorium Riset Rekayasa Perangkat Lunak UPI",
      alamatInstansi: "Jl. Pendidikan No. 15, Cibiru Wetan, Kab. Bandung",
      kontakInstansi: "lab.rpl.cibiru@upi.edu",
      posisi: "Asisten Riset Pengolahan Bahasa Alami",
      jenisProgram: JenisProgramMbkm.RISET,
      kategoriAnalitik: KategoriAnalitikMbkm.MBKM_LAINNYA,
      modeKegiatan: ModeKegiatan.HYBRID,
      tanggalMulai: new Date("2026-02-10"),
      tanggalSelesai: new Date("2026-06-30"),
      fileLoaAwalUrl: "https://storage.sinergo-rpl.id/loa/2204101-loa-riset-20252.pdf",
      fileLoaAwalNama: "Surat_Tugas_Riset_MBKM_2204101.pdf",
      pernyataanBenar: true,
      statusPendataan: StatusPendataan.TERVERIFIKASI,
      catatanRevisi: null,
      submittedAt: new Date("2026-02-05T09:00:00Z"),
      verifiedAt: new Date("2026-02-07T15:00:00Z"),
    },
    create: {
      mahasiswaId: mhsRizky.id,
      semesterId: semesterLalu.id,
      dosenPembimbingId: dosenKaprodi.id,
      dosenKunjungId: null,
      verifiedByUserId: userAdmin.id,
      namaInstansi: "Laboratorium Riset Rekayasa Perangkat Lunak UPI",
      alamatInstansi: "Jl. Pendidikan No. 15, Cibiru Wetan, Kab. Bandung",
      kontakInstansi: "lab.rpl.cibiru@upi.edu",
      posisi: "Asisten Riset Pengolahan Bahasa Alami",
      jenisProgram: JenisProgramMbkm.RISET,
      kategoriAnalitik: KategoriAnalitikMbkm.MBKM_LAINNYA,
      modeKegiatan: ModeKegiatan.HYBRID,
      tanggalMulai: new Date("2026-02-10"),
      tanggalSelesai: new Date("2026-06-30"),
      fileLoaAwalUrl: "https://storage.sinergo-rpl.id/loa/2204101-loa-riset-20252.pdf",
      fileLoaAwalNama: "Surat_Tugas_Riset_MBKM_2204101.pdf",
      pernyataanBenar: true,
      statusPendataan: StatusPendataan.TERVERIFIKASI,
      catatanRevisi: null,
      submittedAt: new Date("2026-02-05T09:00:00Z"),
      verifiedAt: new Date("2026-02-07T15:00:00Z"),
    },
  });

  const skSpecs = [
    {
      pendataanId: pendataanRizky.id,
      jenisSk: JenisDokumenSk.SK_PENUGASAN,
      generatedByUserId: userAdmin.id,
      disahkanKaprodiId: dosenKaprodi.id,
      nomorSk: "041/UN40.C10.RPL/PK.01.06/2026",
      fileSkUrl: "https://storage.sinergo-rpl.id/sk/20261-sk-penugasan-2204101.pdf",
      statusPengesahan: StatusPengesahanSk.DISAHKAN,
      tanggalDibuat: new Date("2026-09-01T09:00:00Z"),
      tanggalDisahkan: new Date("2026-09-02T10:30:00Z"),
    },
    {
      pendataanId: pendataanRizky.id,
      jenisSk: JenisDokumenSk.SK_PEMBIMBING,
      generatedByUserId: userAdmin.id,
      disahkanKaprodiId: dosenKaprodi.id,
      nomorSk: "042/UN40.C10.RPL/PK.01.06/2026",
      fileSkUrl: "https://storage.sinergo-rpl.id/sk/20261-sk-pembimbing-2204101.pdf",
      statusPengesahan: StatusPengesahanSk.DISAHKAN,
      tanggalDibuat: new Date("2026-09-01T09:05:00Z"),
      tanggalDisahkan: new Date("2026-09-02T10:35:00Z"),
    },
    {
      pendataanId: pendataanRizky.id,
      jenisSk: JenisDokumenSk.SK_KUNJUNG_LAPANGAN,
      generatedByUserId: userAdmin.id,
      disahkanKaprodiId: dosenKaprodi.id,
      nomorSk: "089/UN40.C10.RPL/PK.01.06/2026",
      fileSkUrl: "https://storage.sinergo-rpl.id/sk/20261-sk-kunjung-2204101.pdf",
      statusPengesahan: StatusPengesahanSk.DISAHKAN,
      tanggalDibuat: new Date("2026-11-01T08:00:00Z"),
      tanggalDisahkan: new Date("2026-11-03T11:00:00Z"),
    },
    {
      pendataanId: pendataanNadia.id,
      jenisSk: JenisDokumenSk.SK_PEMBIMBING,
      generatedByUserId: userAdmin.id,
      disahkanKaprodiId: null,
      nomorSk: "045/UN40.C10.RPL/PK.01.06/2026",
      fileSkUrl: "https://storage.sinergo-rpl.id/sk/20261-draf-sk-pembimbing-2204102.pdf",
      statusPengesahan: StatusPengesahanSk.DRAF_MENUNGGU,
      tanggalDibuat: new Date("2026-09-03T13:00:00Z"),
      tanggalDisahkan: null,
    },
  ] as const;

  for (const sk of skSpecs) {
    await prisma.dokumenSk.upsert({
      where: {
        pendataanId_jenisSk: {
          pendataanId: sk.pendataanId,
          jenisSk: sk.jenisSk,
        },
      },
      update: {
        generatedByUserId: sk.generatedByUserId,
        disahkanKaprodiId: sk.disahkanKaprodiId,
        nomorSk: sk.nomorSk,
        fileSkUrl: sk.fileSkUrl,
        statusPengesahan: sk.statusPengesahan,
        tanggalDibuat: sk.tanggalDibuat,
        tanggalDisahkan: sk.tanggalDisahkan,
      },
      create: sk,
    });
  }

  const logbookSpecs = [
    {
      id: SEED_IDS.logbookRizkyW1,
      pendataanId: pendataanRizky.id,
      validatedByDosenId: dosenRina.id,
      jenisCatatan: JenisCatatanLogbook.MINGGUAN,
      tanggal: new Date("2026-09-07"),
      mingguKe: 1,
      deskripsiKegiatan:
        "Onboarding arsitektur microservice Digital Tribe, setup repositori lokal, serta mempelajari standar autentikasi OAuth internal.",
      fotoBuktiUrl: "https://storage.sinergo-rpl.id/logbooks/2204101-w1.jpg",
      namaFileBukti: "bukti_onboarding_minggu_1.jpg",
      statusValidasi: StatusValidasiLogbook.TERVALIDASI,
      catatanPembimbing: "Awal yang sangat baik, catat juga diagram alir layanannya untuk bab analisis laporan akhir.",
      validatedAt: new Date("2026-09-09T10:00:00Z"),
    },
    {
      id: SEED_IDS.logbookRizkyW2,
      pendataanId: pendataanRizky.id,
      validatedByDosenId: dosenRina.id,
      jenisCatatan: JenisCatatanLogbook.MINGGUAN,
      tanggal: new Date("2026-09-14"),
      mingguKe: 2,
      deskripsiKegiatan:
        "Mengimplementasikan endpoint validasi kuota pelanggan dan menulis integration test menggunakan Vitest dengan cakupan 88%.",
      fotoBuktiUrl: "https://storage.sinergo-rpl.id/logbooks/2204101-w2.jpg",
      namaFileBukti: "hasil_test_coverage_minggu_2.jpg",
      statusValidasi: StatusValidasiLogbook.TERVALIDASI,
      catatanPembimbing: "Pertahankan cakupan pengujian otomatisnya.",
      validatedAt: new Date("2026-09-16T14:15:00Z"),
    },
    {
      id: SEED_IDS.logbookRizkyM1,
      pendataanId: pendataanRizky.id,
      validatedByDosenId: null,
      jenisCatatan: JenisCatatanLogbook.REKAP_BULANAN,
      tanggal: new Date("2026-09-30"),
      mingguKe: 4,
      deskripsiKegiatan:
        "Rekap bulan pertama: menyelesaikan tiga endpoint katalog layanan B2B, optimasi indeks query relasional, dan rilis ke staging.",
      fotoBuktiUrl: "https://storage.sinergo-rpl.id/logbooks/2204101-m1.jpg",
      namaFileBukti: "rekap_sprint_bulan_1.jpg",
      statusValidasi: StatusValidasiLogbook.MENUNGGU_VALIDASI,
      catatanPembimbing: null,
      validatedAt: null,
    },
    {
      id: SEED_IDS.logbookNadiaW1,
      pendataanId: pendataanNadia.id,
      validatedByDosenId: dosenFajar.id,
      jenisCatatan: JenisCatatanLogbook.MINGGUAN,
      tanggal: new Date("2026-09-08"),
      mingguKe: 1,
      deskripsiKegiatan:
        "Menyelesaikan modul dasar jaringan VPC dan penyediaan instance komputasi pada platform Google Cloud.",
      fotoBuktiUrl: "https://storage.sinergo-rpl.id/logbooks/2204102-w1.jpg",
      namaFileBukti: "modul_cloud_minggu_1.jpg",
      statusValidasi: StatusValidasiLogbook.TERVALIDASI,
      catatanPembimbing: "Sudah sesuai silabus konversi Arsitektur Cloud.",
      validatedAt: new Date("2026-09-10T09:30:00Z"),
    },
    {
      id: SEED_IDS.logbookNadiaW2,
      pendataanId: pendataanNadia.id,
      validatedByDosenId: dosenFajar.id,
      jenisCatatan: JenisCatatanLogbook.MINGGUAN,
      tanggal: new Date("2026-09-15"),
      mingguKe: 2,
      deskripsiKegiatan: "Latihan deployment kontainer aplikasi backend.",
      fotoBuktiUrl: "https://storage.sinergo-rpl.id/logbooks/2204102-w2.jpg",
      namaFileBukti: "latihan_docker_minggu_2.jpg",
      statusValidasi: StatusValidasiLogbook.PERLU_REVISI,
      catatanPembimbing:
        "Deskripsi terlalu singkat. Jabarkan konfigurasi Dockerfile, arsitektur port, dan kendala yang diselesaikan.",
      validatedAt: new Date("2026-09-17T11:20:00Z"),
    },
  ] as const;

  for (const logbook of logbookSpecs) {
    await prisma.logbook.upsert({
      where: { id: logbook.id },
      update: {
        pendataanId: logbook.pendataanId,
        validatedByDosenId: logbook.validatedByDosenId,
        jenisCatatan: logbook.jenisCatatan,
        tanggal: logbook.tanggal,
        mingguKe: logbook.mingguKe,
        deskripsiKegiatan: logbook.deskripsiKegiatan,
        fotoBuktiUrl: logbook.fotoBuktiUrl,
        namaFileBukti: logbook.namaFileBukti,
        statusValidasi: logbook.statusValidasi,
        catatanPembimbing: logbook.catatanPembimbing,
        validatedAt: logbook.validatedAt,
      },
      create: logbook,
    });
  }

  await prisma.berkasAkhir.upsert({
    where: { pendataanId: pendataanRizky.id },
    update: {
      loaUrl: "https://storage.sinergo-rpl.id/berkas-akhir/2204101-loa-final.pdf",
      loaUploadedAt: new Date("2026-11-20T09:00:00Z"),
      rubrikKonversiUrl: "https://storage.sinergo-rpl.id/berkas-akhir/2204101-rubrik.pdf",
      rubrikUploadedAt: new Date("2026-11-20T09:10:00Z"),
      laporanAkhirUrl: "https://storage.sinergo-rpl.id/berkas-akhir/2204101-laporan-akhir.pdf",
      laporanUploadedAt: new Date("2026-11-21T14:00:00Z"),
      drafPksUrl: "https://storage.sinergo-rpl.id/berkas-akhir/2204101-draf-pks.pdf",
      pksUploadedAt: new Date("2026-11-21T14:15:00Z"),
      transkripInstansiUrl: "https://storage.sinergo-rpl.id/berkas-akhir/2204101-nilai-telkom.pdf",
      transkripUploadedAt: new Date("2026-11-22T10:00:00Z"),
      sertifikatUrl: "https://storage.sinergo-rpl.id/berkas-akhir/2204101-sertifikat-msib.pdf",
      sertifikatUploadedAt: new Date("2026-11-22T10:05:00Z"),
      nilaiInstansi: new Prisma.Decimal("90.00"),
      jumlahTerunggah: 6,
      progresPersen: 100,
      statusBerkas: StatusBerkasAkhir.LENGKAP_DIKIRIM,
      submittedAt: new Date("2026-11-22T10:30:00Z"),
    },
    create: {
      pendataanId: pendataanRizky.id,
      loaUrl: "https://storage.sinergo-rpl.id/berkas-akhir/2204101-loa-final.pdf",
      loaUploadedAt: new Date("2026-11-20T09:00:00Z"),
      rubrikKonversiUrl: "https://storage.sinergo-rpl.id/berkas-akhir/2204101-rubrik.pdf",
      rubrikUploadedAt: new Date("2026-11-20T09:10:00Z"),
      laporanAkhirUrl: "https://storage.sinergo-rpl.id/berkas-akhir/2204101-laporan-akhir.pdf",
      laporanUploadedAt: new Date("2026-11-21T14:00:00Z"),
      drafPksUrl: "https://storage.sinergo-rpl.id/berkas-akhir/2204101-draf-pks.pdf",
      pksUploadedAt: new Date("2026-11-21T14:15:00Z"),
      transkripInstansiUrl: "https://storage.sinergo-rpl.id/berkas-akhir/2204101-nilai-telkom.pdf",
      transkripUploadedAt: new Date("2026-11-22T10:00:00Z"),
      sertifikatUrl: "https://storage.sinergo-rpl.id/berkas-akhir/2204101-sertifikat-msib.pdf",
      sertifikatUploadedAt: new Date("2026-11-22T10:05:00Z"),
      nilaiInstansi: new Prisma.Decimal("90.00"),
      jumlahTerunggah: 6,
      progresPersen: 100,
      statusBerkas: StatusBerkasAkhir.LENGKAP_DIKIRIM,
      submittedAt: new Date("2026-11-22T10:30:00Z"),
    },
  });

  await prisma.berkasAkhir.upsert({
    where: { pendataanId: pendataanNadia.id },
    update: {
      loaUrl: "https://storage.sinergo-rpl.id/berkas-akhir/2204102-loa-final.pdf",
      loaUploadedAt: new Date("2026-11-18T08:30:00Z"),
      rubrikKonversiUrl: "https://storage.sinergo-rpl.id/berkas-akhir/2204102-rubrik.pdf",
      rubrikUploadedAt: new Date("2026-11-19T11:00:00Z"),
      laporanAkhirUrl: "https://storage.sinergo-rpl.id/berkas-akhir/2204102-draf-laporan.pdf",
      laporanUploadedAt: new Date("2026-11-24T16:20:00Z"),
      drafPksUrl: null,
      pksUploadedAt: null,
      transkripInstansiUrl: null,
      transkripUploadedAt: null,
      sertifikatUrl: null,
      sertifikatUploadedAt: null,
      nilaiInstansi: new Prisma.Decimal("88.00"),
      jumlahTerunggah: 3,
      progresPersen: 50,
      statusBerkas: StatusBerkasAkhir.DRAF,
      submittedAt: null,
    },
    create: {
      pendataanId: pendataanNadia.id,
      loaUrl: "https://storage.sinergo-rpl.id/berkas-akhir/2204102-loa-final.pdf",
      loaUploadedAt: new Date("2026-11-18T08:30:00Z"),
      rubrikKonversiUrl: "https://storage.sinergo-rpl.id/berkas-akhir/2204102-rubrik.pdf",
      rubrikUploadedAt: new Date("2026-11-19T11:00:00Z"),
      laporanAkhirUrl: "https://storage.sinergo-rpl.id/berkas-akhir/2204102-draf-laporan.pdf",
      laporanUploadedAt: new Date("2026-11-24T16:20:00Z"),
      nilaiInstansi: new Prisma.Decimal("88.00"),
      jumlahTerunggah: 3,
      progresPersen: 50,
      statusBerkas: StatusBerkasAkhir.DRAF,
      submittedAt: null,
    },
  });

  // Skor rubrik RL401 Rizky: (92*0.40) + (88*0.35) + (90*0.25) = 36.80 + 30.80 + 22.50 = 90.10.
  // Nilai akhir gabungan (50% instansi 90.00 + 50% dosen 90.10) = 90.05 -> A.
  const konversiRizkyRl401 = await prisma.konversiMataKuliah.upsert({
    where: {
      pendataanId_matakuliahId: {
        pendataanId: pendataanRizky.id,
        matakuliahId: mkRl401.id,
      },
    },
    update: {
      dosenPenilaiId: dosenRina.id,
      sksKonversi: 4,
      tingkatKesesuaian: TingkatKesesuaianMk.SANGAT_SESUAI,
      nilaiInstansiRef: new Prisma.Decimal("90.00"),
      nilaiDosen: new Prisma.Decimal("90.10"),
      nilaiAkhir: new Prisma.Decimal("90.05"),
      nilaiHuruf: "A",
      catatanDosenPengampu:
        "Capaian rekayasa backend, kualitas pengujian otomatis, dan dokumentasi akhir memenuhi standar industri dengan sangat baik.",
      statusPenilaian: StatusPenilaianKonversi.DIPUBLIKASIKAN,
      publishedAt: new Date("2026-11-25T15:00:00Z"),
    },
    create: {
      pendataanId: pendataanRizky.id,
      matakuliahId: mkRl401.id,
      dosenPenilaiId: dosenRina.id,
      sksKonversi: 4,
      tingkatKesesuaian: TingkatKesesuaianMk.SANGAT_SESUAI,
      nilaiInstansiRef: new Prisma.Decimal("90.00"),
      nilaiDosen: new Prisma.Decimal("90.10"),
      nilaiAkhir: new Prisma.Decimal("90.05"),
      nilaiHuruf: "A",
      catatanDosenPengampu:
        "Capaian rekayasa backend, kualitas pengujian otomatis, dan dokumentasi akhir memenuhi standar industri dengan sangat baik.",
      statusPenilaian: StatusPenilaianKonversi.DIPUBLIKASIKAN,
      publishedAt: new Date("2026-11-25T15:00:00Z"),
    },
  });

  // Skor rubrik RL403 Rizky (DRAF): (86*0.40) + (84*0.35) + (88*0.25) = 34.40 + 29.40 + 22.00 = 85.80.
  const konversiRizkyRl403 = await prisma.konversiMataKuliah.upsert({
    where: {
      pendataanId_matakuliahId: {
        pendataanId: pendataanRizky.id,
        matakuliahId: mkRl403.id,
      },
    },
    update: {
      dosenPenilaiId: dosenFajar.id,
      sksKonversi: 3,
      tingkatKesesuaian: TingkatKesesuaianMk.SANGAT_SESUAI,
      nilaiInstansiRef: new Prisma.Decimal("90.00"),
      nilaiDosen: new Prisma.Decimal("85.80"),
      nilaiAkhir: new Prisma.Decimal("87.90"),
      nilaiHuruf: "A-",
      catatanDosenPengampu: "Pipeline deployment staging sudah solid, menunggu verifikasi final lampiran konfigurasi Docker.",
      statusPenilaian: StatusPenilaianKonversi.DRAF,
      publishedAt: null,
    },
    create: {
      pendataanId: pendataanRizky.id,
      matakuliahId: mkRl403.id,
      dosenPenilaiId: dosenFajar.id,
      sksKonversi: 3,
      tingkatKesesuaian: TingkatKesesuaianMk.SANGAT_SESUAI,
      nilaiInstansiRef: new Prisma.Decimal("90.00"),
      nilaiDosen: new Prisma.Decimal("85.80"),
      nilaiAkhir: new Prisma.Decimal("87.90"),
      nilaiHuruf: "A-",
      catatanDosenPengampu: "Pipeline deployment staging sudah solid, menunggu verifikasi final lampiran konfigurasi Docker.",
      statusPenilaian: StatusPenilaianKonversi.DRAF,
      publishedAt: null,
    },
  });

  const pendingKonversiSpecs = [
    {
      pendataanId: pendataanRizky.id,
      matakuliahId: mkRl404.id,
      sksKonversi: 3,
      tingkatKesesuaian: TingkatKesesuaianMk.SESUAI,
      nilaiInstansiRef: new Prisma.Decimal("90.00"),
    },
    {
      pendataanId: pendataanNadia.id,
      matakuliahId: mkRl403.id,
      sksKonversi: 3,
      tingkatKesesuaian: TingkatKesesuaianMk.SANGAT_SESUAI,
      nilaiInstansiRef: new Prisma.Decimal("88.00"),
    },
    {
      pendataanId: pendataanNadia.id,
      matakuliahId: mkRl402.id,
      sksKonversi: 3,
      tingkatKesesuaian: TingkatKesesuaianMk.SESUAI,
      nilaiInstansiRef: new Prisma.Decimal("88.00"),
    },
    {
      pendataanId: pendataanDimas.id,
      matakuliahId: mkRl401.id,
      sksKonversi: 4,
      tingkatKesesuaian: TingkatKesesuaianMk.SANGAT_SESUAI,
      nilaiInstansiRef: null,
    },
  ] as const;

  for (const item of pendingKonversiSpecs) {
    await prisma.konversiMataKuliah.upsert({
      where: {
        pendataanId_matakuliahId: {
          pendataanId: item.pendataanId,
          matakuliahId: item.matakuliahId,
        },
      },
      update: {
        sksKonversi: item.sksKonversi,
        tingkatKesesuaian: item.tingkatKesesuaian,
        nilaiInstansiRef: item.nilaiInstansiRef,
        statusPenilaian: StatusPenilaianKonversi.BELUM_DINILAI,
      },
      create: {
        pendataanId: item.pendataanId,
        matakuliahId: item.matakuliahId,
        sksKonversi: item.sksKonversi,
        tingkatKesesuaian: item.tingkatKesesuaian,
        nilaiInstansiRef: item.nilaiInstansiRef,
        statusPenilaian: StatusPenilaianKonversi.BELUM_DINILAI,
      },
    });
  }

  const nilaiRubrikSpecs = [
    {
      konversiMkId: konversiRizkyRl401.id,
      komponenRubrikId: SEED_IDS.rubrikRl401K1,
      skor: new Prisma.Decimal("92.00"),
    },
    {
      konversiMkId: konversiRizkyRl401.id,
      komponenRubrikId: SEED_IDS.rubrikRl401K2,
      skor: new Prisma.Decimal("88.00"),
    },
    {
      konversiMkId: konversiRizkyRl401.id,
      komponenRubrikId: SEED_IDS.rubrikRl401K3,
      skor: new Prisma.Decimal("90.00"),
    },
    {
      konversiMkId: konversiRizkyRl403.id,
      komponenRubrikId: SEED_IDS.rubrikRl403K1,
      skor: new Prisma.Decimal("86.00"),
    },
    {
      konversiMkId: konversiRizkyRl403.id,
      komponenRubrikId: SEED_IDS.rubrikRl403K2,
      skor: new Prisma.Decimal("84.00"),
    },
    {
      konversiMkId: konversiRizkyRl403.id,
      komponenRubrikId: SEED_IDS.rubrikRl403K3,
      skor: new Prisma.Decimal("88.00"),
    },
  ] as const;

  for (const nr of nilaiRubrikSpecs) {
    await prisma.nilaiRubrikMahasiswa.upsert({
      where: {
        konversiMkId_komponenRubrikId: {
          konversiMkId: nr.konversiMkId,
          komponenRubrikId: nr.komponenRubrikId,
        },
      },
      update: {
        skor: nr.skor,
      },
      create: nr,
    });
  }

  const counts = await Promise.all([
    prisma.user.count(),
    prisma.mahasiswa.count(),
    prisma.dosen.count(),
    prisma.periodeSemester.count(),
    prisma.mataKuliah.count(),
    prisma.komponenRubrikMk.count(),
    prisma.lowonganMagang.count(),
    prisma.lamaranLowongan.count(),
    prisma.pendataanMagang.count(),
    prisma.dokumenSk.count(),
    prisma.logbook.count(),
    prisma.berkasAkhir.count(),
    prisma.konversiMataKuliah.count(),
    prisma.nilaiRubrikMahasiswa.count(),
  ]);

  console.log("Seeding 14 tabel selesai:", {
    users: counts[0],
    mahasiswa: counts[1],
    dosen: counts[2],
    periode_semester: counts[3],
    matakuliah: counts[4],
    komponen_rubrik_mk: counts[5],
    lowongan_magang: counts[6],
    lamaran_lowongan: counts[7],
    pendataan_magang: counts[8],
    dokumen_sk: counts[9],
    logbook: counts[10],
    berkas_akhir: counts[11],
    konversi_matakuliah: counts[12],
    nilai_rubrik_mahasiswa: counts[13],
  });
}

main()
  .catch((error: unknown) => {
    console.error("Gagal menjalankan seeder:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
