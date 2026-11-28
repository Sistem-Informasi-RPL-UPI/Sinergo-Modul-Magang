import { z } from "zod";

const LOGO_URL_REGEX =
  /^(https?:\/\/[^\s]+|\/api\/uploads\/logo-instansi\/[0-9a-f-]{36}\.(jpg|png|webp))$/i;

const nullableDateSchema = z
  .union([z.string().trim(), z.null()])
  .transform((val, ctx) => {
    if (val === null || val === "") {
      return null;
    }
    const parsed = new Date(val);
    if (Number.isNaN(parsed.getTime())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Format batas tanggal tidak sah (gunakan YYYY-MM-DD).",
      });
      return z.NEVER;
    }
    return parsed;
  });

const nullableLogoUrlSchema = z
  .union([z.string().trim().max(255), z.null()])
  .transform((val, ctx) => {
    if (val === null || val === "") {
      return null;
    }
    if (!LOGO_URL_REGEX.test(val)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "URL logo wajib berupa tautan http(s) atau hasil unggahan /api/uploads/logo-instansi.",
      });
      return z.NEVER;
    }
    return val;
  });

const nullableDosenPjSchema = z
  .union([z.string().trim(), z.null()])
  .transform((val, ctx) => {
    if (val === null || val === "") {
      return null;
    }
    const check = z.string().uuid().safeParse(val);
    if (!check.success) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "ID Dosen Penanggung Jawab tidak sah.",
      });
      return z.NEVER;
    }
    return check.data;
  });

export const lowonganIdParamSchema = z.object({
  id: z.string().uuid("ID lowongan magang tidak sah."),
});

export const lowongansQuerySchema = z.object({
  q: z.string().trim().max(100).optional(),
  sumber: z.enum(["MITRA_KAMPUS", "BINAAN_DOSEN"]).optional(),
  status: z.enum(["DRAF", "AKTIF", "TUTUP"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
});

export const createLowonganSchema = z
  .object({
    judulLowongan: z
      .string()
      .trim()
      .min(3, "Judul lowongan minimal 3 karakter.")
      .max(150, "Judul lowongan maksimal 150 karakter."),
    namaInstansi: z
      .string()
      .trim()
      .min(2, "Nama instansi minimal 2 karakter.")
      .max(150, "Nama instansi maksimal 150 karakter."),
    posisiBidang: z
      .string()
      .trim()
      .min(2, "Posisi atau bidang kerja minimal 2 karakter.")
      .max(100, "Posisi atau bidang kerja maksimal 100 karakter."),
    lokasiModeKerja: z
      .string()
      .trim()
      .min(2, "Lokasi dan mode kerja minimal 2 karakter.")
      .max(100, "Lokasi dan mode kerja maksimal 100 karakter."),
    sumberLowongan: z.enum(["MITRA_KAMPUS", "BINAAN_DOSEN"]),
    dosenPjId: nullableDosenPjSchema.optional(),
    kontakInstansi: z
      .string()
      .trim()
      .min(5, "Kontak instansi minimal 5 karakter (email, tautan, atau telepon).")
      .max(150, "Kontak instansi maksimal 150 karakter."),
    deskripsi: z
      .string()
      .trim()
      .min(20, "Deskripsi pekerjaan minimal 20 karakter.")
      .max(5000, "Deskripsi pekerjaan maksimal 5000 karakter."),
    persyaratan: z
      .string()
      .trim()
      .min(10, "Persyaratan pelamar minimal 10 karakter.")
      .max(5000, "Persyaratan pelamar maksimal 5000 karakter."),
    logoUrl: nullableLogoUrlSchema.optional(),
    batasTanggal: nullableDateSchema.optional(),
    statusLowongan: z.enum(["DRAF", "AKTIF"]).default("DRAF"),
  })
  .superRefine((data, ctx) => {
    if (data.sumberLowongan === "BINAAN_DOSEN" && !data.dosenPjId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["dosenPjId"],
        message:
          "Dosen Penanggung Jawab wajib dipilih untuk lowongan Binaan Dosen.",
      });
    }
  });

export const updateLowonganSchema = z
  .object({
    judulLowongan: z.string().trim().min(3).max(150).optional(),
    namaInstansi: z.string().trim().min(2).max(150).optional(),
    posisiBidang: z.string().trim().min(2).max(100).optional(),
    lokasiModeKerja: z.string().trim().min(2).max(100).optional(),
    sumberLowongan: z.enum(["MITRA_KAMPUS", "BINAAN_DOSEN"]).optional(),
    dosenPjId: nullableDosenPjSchema.optional(),
    kontakInstansi: z.string().trim().min(5).max(150).optional(),
    deskripsi: z.string().trim().min(20).max(5000).optional(),
    persyaratan: z.string().trim().min(10).max(5000).optional(),
    logoUrl: nullableLogoUrlSchema.optional(),
    batasTanggal: nullableDateSchema.optional(),
    statusLowongan: z.enum(["DRAF", "AKTIF", "TUTUP"]).optional(),
  })
  .refine((payload) => Object.keys(payload).length > 0, {
    message: "Minimal satu atribut perubahan wajib dikirimkan.",
  });

export const analitikMbkmQuerySchema = z.object({
  semesterId: z.string().uuid("ID periode semester tidak sah.").optional(),
});

export type LowongansQueryInput = z.input<typeof lowongansQuerySchema>;
export type ParsedLowongansQuery = z.output<typeof lowongansQuerySchema>;
export type CreateLowonganInput = z.input<typeof createLowonganSchema>;
export type ParsedCreateLowongan = z.output<typeof createLowonganSchema>;
export type UpdateLowonganInput = z.input<typeof updateLowonganSchema>;
export type ParsedUpdateLowongan = z.output<typeof updateLowonganSchema>;
export type AnalitikMbkmQueryInput = z.infer<typeof analitikMbkmQuerySchema>;
