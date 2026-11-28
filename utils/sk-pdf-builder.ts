import { JenisDokumenSk, StatusPengesahanSk } from "@prisma/client";

export interface SkPdfCourseItem {
  kodeMk: string;
  namaMk: string;
  sks: number;
}

export interface SkPdfDocumentData {
  nomorSk: string;
  jenisSk: JenisDokumenSk;
  statusPengesahan: StatusPengesahanSk;
  tanggalDibuat: Date;
  tanggalDisahkan: Date | null;
  mahasiswa: {
    nama: string;
    nim: string;
    prodi: string;
    angkatan: number;
  };
  semester: {
    namaSemester: string;
    kodeSemester: string;
  };
  pendataan: {
    namaInstansi: string;
    alamatInstansi: string;
    posisi: string;
    jenisProgram: string;
    tanggalMulai: Date;
    tanggalSelesai: Date;
  };
  dosenPembimbing: {
    namaBergelar: string;
    nip: string;
  };
  dosenKunjung: {
    namaBergelar: string;
    nip: string;
  } | null;
  kaprodiPengesah: {
    namaBergelar: string;
    nip: string;
  } | null;
  konversiMks: readonly SkPdfCourseItem[];
}

function sanitizePdfText(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[^\x20-\x7E]/g, "")
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

function formatIndonesianDate(date: Date): string {
  const months = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];
  const utcDay = date.getUTCDate();
  const utcMonth = months[date.getUTCMonth()] ?? "Januari";
  const utcYear = date.getUTCFullYear();
  return `${utcDay} ${utcMonth} ${utcYear}`;
}

function getSkDocumentTitle(jenisSk: JenisDokumenSk): {
  heading: string;
  perihal: string;
} {
  switch (jenisSk) {
    case JenisDokumenSk.SK_PENUGASAN:
      return {
        heading: "SURAT KEPUTUSAN PENUGASAN MAHASISWA MAGANG DAN MBKM",
        perihal:
          "Penugasan Pelaksanaan Program Penguatan Pengalaman Profesional Non Kependidikan (Magang/MBKM)",
      };
    case JenisDokumenSk.SK_PEMBIMBING:
      return {
        heading: "SURAT KEPUTUSAN PENETAPAN DOSEN PEMBIMBING MAGANG",
        perihal:
          "Penetapan Dosen Pembimbing Akademik Kegiatan Magang dan Program MBKM Mahasiswa",
      };
    case JenisDokumenSk.SK_KUNJUNG_LAPANGAN:
      return {
        heading: "SURAT KEPUTUSAN PENUGASAN DOSEN KUNJUNG LAPANGAN",
        perihal:
          "Penugasan Pembimbing Lapangan (Dosen Kunjung) Supervisi Mitra Magang dan MBKM",
      };
  }
}

function wrapTextLines(text: string, maxChars: number): string[] {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) {
    return ["-"];
  }

  const lines: string[] = [];
  let current = words[0] ?? "";

  for (let i = 1; i < words.length; i += 1) {
    const word = words[i] ?? "";
    if (current.length + 1 + word.length <= maxChars) {
      current = `${current} ${word}`;
    } else {
      lines.push(current);
      current = word;
    }
  }
  lines.push(current);
  return lines;
}

// Merakit dokumen biner PDF 1.4 standar (A4) secara deterministik tanpa ketergantungan pustaka eksternal agar selalu stabil di Vercel Serverless.
export function buildOfficialSkPdfBuffer(data: SkPdfDocumentData): Buffer {
  const { heading, perihal } = getSkDocumentTitle(data.jenisSk);
  const isApproved = data.statusPengesahan === StatusPengesahanSk.DISAHKAN;

  const commands: string[] = [];
  let cursorY = 785;

  const drawText = (
    text: string,
    x: number,
    y: number,
    font: "F1" | "F2",
    size: number,
  ) => {
    commands.push(
      `BT /${font} ${size} Tf 1 0 0 1 ${x.toFixed(2)} ${y.toFixed(2)} Tm (${sanitizePdfText(text)}) Tj ET`,
    );
  };

  const drawCenteredText = (
    text: string,
    y: number,
    font: "F1" | "F2",
    size: number,
  ) => {
    const approxWidth = text.length * size * 0.48;
    const startX = Math.max(48, (595.28 - approxWidth) / 2);
    drawText(text, startX, y, font, size);
  };

  drawCenteredText(
    "KEMENTERIAN PENDIDIKAN TINGGI, SAINS, DAN TEKNOLOGI",
    cursorY,
    "F2",
    10,
  );
  cursorY -= 14;
  drawCenteredText(
    "UNIVERSITAS PENDIDIKAN INDONESIA - KAMPUS UPI DI CIBIRU",
    cursorY,
    "F2",
    11,
  );
  cursorY -= 14;
  drawCenteredText(
    "PROGRAM STUDI S1 REKAYASA PERANGKAT LUNAK",
    cursorY,
    "F2",
    12,
  );
  cursorY -= 13;
  drawCenteredText(
    "Jl. Pendidikan No. 15, Cibiru Wetan, Kec. Cileunyi, Kabupaten Bandung 40625",
    cursorY,
    "F1",
    8.5,
  );

  cursorY -= 10;
  commands.push(`0.01 0.01 0.72 RG 1.5 w 48 ${cursorY} m 547 ${cursorY} l S`);
  cursorY -= 3;
  commands.push(`0 0 0 RG 0.5 w 48 ${cursorY} m 547 ${cursorY} l S`);

  cursorY -= 22;
  drawCenteredText(heading, cursorY, "F2", 11);
  cursorY -= 14;
  drawCenteredText(`Nomor: ${data.nomorSk}`, cursorY, "F2", 10);

  cursorY -= 16;
  const statusBannerText = isApproved
    ? "STATUS DOKUMEN: RESMI DISAHKAN KETUA PROGRAM STUDI"
    : "STATUS DOKUMEN: DRAF - MENUNGGU PENGESAHAN KETUA PROGRAM STUDI";
  drawCenteredText(statusBannerText, cursorY, "F2", 8.5);

  cursorY -= 20;
  const introLines = wrapTextLines(
    `Ketua Program Studi Rekayasa Perangkat Lunak Kampus UPI di Cibiru melalui surat keputusan ini menetapkan ${perihal} pada periode akademik ${data.semester.namaSemester} (${data.semester.kodeSemester}) dengan rincian sebagai berikut:`,
    84,
  );
  for (const line of introLines) {
    drawText(line, 48, cursorY, "F1", 9.5);
    cursorY -= 13;
  }

  cursorY -= 6;
  drawText("A. IDENTITAS MAHASISWA DAN KEGIATAN MITRA", 48, cursorY, "F2", 9.5);
  cursorY -= 15;

  const detailPairs: ReadonlyArray<[string, string]> = [
    ["Nama Mahasiswa", data.mahasiswa.nama],
    ["NIM / Angkatan", `${data.mahasiswa.nim} / Angkatan ${data.mahasiswa.angkatan}`],
    ["Program Studi", data.mahasiswa.prodi],
    ["Skema Program MBKM", data.pendataan.jenisProgram],
    ["Instansi Mitra", data.pendataan.namaInstansi],
    ["Posisi Penempatan", data.pendataan.posisi],
    [
      "Periode Pelaksanaan",
      `${formatIndonesianDate(data.pendataan.tanggalMulai)} s.d. ${formatIndonesianDate(data.pendataan.tanggalSelesai)}`,
    ],
  ];

  for (const [label, value] of detailPairs) {
    drawText(label, 56, cursorY, "F1", 9);
    drawText(":", 180, cursorY, "F1", 9);
    const wrappedVal = wrapTextLines(value, 60);
    for (let idx = 0; idx < wrappedVal.length; idx += 1) {
      drawText(wrappedVal[idx] ?? "", 190, cursorY, idx === 0 ? "F2" : "F1", 9);
      if (idx < wrappedVal.length - 1) {
        cursorY -= 12;
      }
    }
    cursorY -= 13.5;
  }

  cursorY -= 5;
  drawText("B. DOSEN PENUGASAN DAN PEMBIMBINGAN", 48, cursorY, "F2", 9.5);
  cursorY -= 15;

  drawText("Dosen Pembimbing UPI", 56, cursorY, "F1", 9);
  drawText(":", 180, cursorY, "F1", 9);
  drawText(
    `${data.dosenPembimbing.namaBergelar} (NIP. ${data.dosenPembimbing.nip})`,
    190,
    cursorY,
    "F2",
    9,
  );
  cursorY -= 14;

  if (data.dosenKunjung || data.jenisSk === JenisDokumenSk.SK_KUNJUNG_LAPANGAN) {
    drawText("Dosen Kunjung Lapangan", 56, cursorY, "F1", 9);
    drawText(":", 180, cursorY, "F1", 9);
    drawText(
      data.dosenKunjung
        ? `${data.dosenKunjung.namaBergelar} (NIP. ${data.dosenKunjung.nip})`
        : "Belum ditetapkan",
      190,
      cursorY,
      "F2",
      9,
    );
    cursorY -= 14;
  }

  cursorY -= 5;
  const totalSks = data.konversiMks.reduce((sum, item) => sum + item.sks, 0);
  drawText(
    `C. DAFTAR MATA KULIAH KONVERSI MBKM (TOTAL ${totalSks} SKS)`,
    48,
    cursorY,
    "F2",
    9.5,
  );
  cursorY -= 15;

  data.konversiMks.slice(0, 10).forEach((mk, index) => {
    drawText(
      `${index + 1}. ${mk.kodeMk} - ${mk.namaMk} (${mk.sks} SKS)`,
      56,
      cursorY,
      "F1",
      9,
    );
    cursorY -= 12.5;
  });

  cursorY -= 8;
  const closingLines = wrapTextLines(
    "Demikian Surat Keputusan ini diterbitkan untuk dilaksanakan dengan penuh tanggung jawab sesuai pedoman akademik Universitas Pendidikan Indonesia.",
    84,
  );
  for (const line of closingLines) {
    drawText(line, 48, cursorY, "F1", 9);
    cursorY -= 12.5;
  }

  const signY = Math.min(cursorY - 14, 175);
  const signDate = data.tanggalDisahkan ?? data.tanggalDibuat;
  drawText(`Ditetapkan di: Bandung`, 350, signY, "F1", 9);
  drawText(
    `Pada tanggal : ${formatIndonesianDate(signDate)}`,
    350,
    signY - 13,
    "F1",
    9,
  );
  drawText(
    "Ketua Program Studi S1 RPL,",
    350,
    signY - 28,
    "F2",
    9,
  );

  if (isApproved && data.kaprodiPengesah) {
    drawText(
      "[Disahkan Secara Elektronik via Portal Magang]",
      350,
      signY - 52,
      "F1",
      8,
    );
    drawText(data.kaprodiPengesah.namaBergelar, 350, signY - 72, "F2", 9.5);
    drawText(`NIP. ${data.kaprodiPengesah.nip}`, 350, signY - 84, "F1", 8.5);
  } else {
    drawText(
      "[Draf Menunggu Pengesahan Kaprodi]",
      350,
      signY - 60,
      "F1",
      8.5,
    );
  }

  const contentStream = `${commands.join("\n")}\n`;
  const contentLength = Buffer.byteLength(contentStream, "ascii");

  const objects = [
    "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n",
    "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n",
    "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.28 841.89] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>\nendobj\n",
    "4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>\nendobj\n",
    "5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>\nendobj\n",
    `6 0 obj\n<< /Length ${contentLength} >>\nstream\n${contentStream}endstream\nendobj\n`,
  ];

  const header = "%PDF-1.4\n";
  const offsets: number[] = [];
  let runningOffset = Buffer.byteLength(header, "ascii");

  for (const obj of objects) {
    offsets.push(runningOffset);
    runningOffset += Buffer.byteLength(obj, "ascii");
  }

  const xrefOffset = runningOffset;
  const xrefLines = [
    `xref\n0 ${objects.length + 1}`,
    "0000000000 65535 f ",
    ...offsets.map((off) => `${String(off).padStart(10, "0")} 00000 n `),
  ];

  const trailer = `${xrefLines.join("\n")}\ntrailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;

  return Buffer.from(`${header}${objects.join("")}${trailer}`, "ascii");
}
