import { z } from "zod";

const LOA_FILE_URL_REGEX =
  /^(https?:\/\/[^\s]+|\/api\/uploads\/loa-awal\/[0-9a-f-]{36}\.(pdf|jpg|png))$/i;

const dateInputSchema = z
  .string()
  .trim()
  .min(1, "Tanggal wajib diisi.")
  .transform((val, ctx) => {
    const parsed = new Date(val);
    if (Number.isNaN(parsed.getTime())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Format tanggal tidak sah (gunakan YYYY-MM-DD).",
      });
      return z.NEVER;
    }
    return parsed;
  });

const loaFileUrlSchema = z
  .string()
  .trim()
  .min(1, "Berkas Letter of Acceptance (LOA) wajib diunggah.")
  .max(255, "URL berkas LOA terlalu panjang.")
  .refine((val) => LOA_FILE_URL_REGEX.test(val), {
    message:
      "URL berkas LOA wajib berupa hasil unggahan /api/uploads/loa-awal atau tautan http(s) yang sah.",
  });

const pendataanCoreObjectSchema = z.object({
  semesterId: z.string().uuid("ID periode semester tidak sah.").optional(),
  namaInstansi: z
    .string()
    .trim()
    .min(3, "Nama instansi minimal 3 karakter.")
    .max(150, "Nama instansi maksimal 150 karakter."),
  posisi: z
    .string()
    .trim()
    .min(3, "Posisi magang minimal 3 karakter.")
    .max(100, "Posisi magang maksimal 100 karakter."),
  alamatInstansi: z
    .string()
    .trim()
    .min(10, "Alamat lengkap instansi minimal 10 karakter.")
    .max(2000, "Alamat instansi maksimal 2000 karakter."),
  kontakInstansi: z
    .string()
    .trim()
    .min(5, "Kontak instansi minimal 5 karakter (email atau nomor telepon HRD/mentor).")
    .max(150, "Kontak instansi maksimal 150 karakter."),
  jenisProgram: z.enum([
    "MSIB",
    "SI",
    "PMM",
    "KM",
    "IISMA",
    "WMK",
    "PM",
    "MM",
    "RISET",
  ]),
  dosenPembimbingId: z.string().uuid("Dosen Pembimbing UPI wajib dipilih."),
  modeKegiatan: z.enum(["HYBRID", "ONSITE", "REMOTE", "FLEKSIBEL"]),
  tanggalMulai: dateInputSchema,
  tanggalSelesai: dateInputSchema,
  fileLoaAwalUrl: loaFileUrlSchema,
  fileLoaAwalNama: z
    .string()
    .trim()
    .min(1, "Nama asli berkas LOA wajib disertakan.")
    .max(150, "Nama berkas LOA maksimal 150 karakter."),
  matakuliahIds: z
    .array(z.string().uuid("ID mata kuliah konversi tidak sah."))
    .min(1, "Pilih minimal 1 mata kuliah konversi.")
    .max(12, "Maksimal 12 mata kuliah konversi dalam satu periode."),
});

function validatePeriodAndUniqueCourses(
  data: {
    tanggalMulai: Date;
    tanggalSelesai: Date;
    matakuliahIds: string[];
  },
  ctx: z.RefinementCtx,
): void {
  if (data.tanggalSelesai.getTime() <= data.tanggalMulai.getTime()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["tanggalSelesai"],
      message: "Tanggal selesai kegiatan wajib setelah tanggal mulai.",
    });
  }

  const uniqueMkIds = new Set(data.matakuliahIds);
  if (uniqueMkIds.size !== data.matakuliahIds.length) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["matakuliahIds"],
      message: "Tidak boleh memilih mata kuliah konversi yang sama lebih dari satu kali.",
    });
  }
}

export const savePendataanDraftSchema = pendataanCoreObjectSchema
  .extend({
    pernyataanBenar: z.boolean().optional().default(false),
  })
  .superRefine(validatePeriodAndUniqueCourses);

export const submitPendataanSchema = pendataanCoreObjectSchema
  .extend({
    pernyataanBenar: z.literal(true, {
      errorMap: () => ({
        message:
          "Anda wajib mencentang pernyataan keabsahan data sebelum mengirim pendataan.",
      }),
    }),
  })
  .superRefine(validatePeriodAndUniqueCourses);

export const pendataanOwnQuerySchema = z.object({
  semesterId: z.string().uuid("ID periode semester tidak sah.").optional(),
});

export const pendataanIdParamSchema = z.object({
  id: z.string().uuid("ID pendataan magang tidak sah."),
});

export const rekapPendataansQuerySchema = z.object({
  semesterId: z.string().uuid("ID periode semester tidak sah.").optional(),
  status: z
    .enum(["DRAF", "MENUNGGU", "PERLU_REVISI", "TERVERIFIKASI"])
    .optional(),
  jenisProgram: z
    .enum(["MSIB", "SI", "PMM", "KM", "IISMA", "WMK", "PM", "MM", "RISET"])
    .optional(),
  q: z.string().trim().max(100).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(15),
});

export const kesesuaianMkItemSchema = z.object({
  konversiMkId: z.string().uuid("ID konversi mata kuliah tidak sah."),
  tingkatKesesuaian: z.enum(["SANGAT_SESUAI", "SESUAI"]),
});

export const verifikasiPendataanDecisionSchema = z.discriminatedUnion(
  "statusPendataan",
  [
    z.object({
      statusPendataan: z.literal("TERVERIFIKASI"),
      kesesuaianMks: z.array(kesesuaianMkItemSchema).optional(),
    }),
    z.object({
      statusPendataan: z.literal("PERLU_REVISI"),
      catatanRevisi: z
        .string()
        .trim()
        .min(
          10,
          "Catatan revisi minimal 10 karakter agar mahasiswa memahami bagian yang harus diperbaiki.",
        )
        .max(2000, "Catatan revisi maksimal 2000 karakter."),
    }),
  ],
);

export type SavePendataanDraftInput = z.input<typeof savePendataanDraftSchema>;
export type ParsedSavePendataanDraft = z.output<typeof savePendataanDraftSchema>;
export type SubmitPendataanInput = z.input<typeof submitPendataanSchema>;
export type ParsedSubmitPendataan = z.output<typeof submitPendataanSchema>;
export type PendataanOwnQueryInput = z.infer<typeof pendataanOwnQuerySchema>;
export type RekapPendataansQueryInput = z.input<typeof rekapPendataansQuerySchema>;
export type ParsedRekapPendataansQuery = z.output<typeof rekapPendataansQuerySchema>;
export type VerifikasiPendataanDecisionInput = z.infer<
  typeof verifikasiPendataanDecisionSchema
>;
