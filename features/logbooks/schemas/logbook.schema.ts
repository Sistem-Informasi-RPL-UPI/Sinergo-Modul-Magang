import { z } from "zod";

const FOTO_BUKTI_URL_REGEX =
  /^(https?:\/\/[^\s]+|\/api\/uploads\/logbook-bukti\/[0-9a-f-]{36}\.(jpg|png))$/i;

const canonicalDateSchema = z
  .string()
  .trim()
  .min(1, "Tanggal kegiatan wajib diisi.")
  .transform((val, ctx) => {
    const match = /^(\d{4}-\d{2}-\d{2})/.exec(val);
    const parsed = match
      ? new Date(`${match[1]}T00:00:00.000Z`)
      : new Date(val);

    if (Number.isNaN(parsed.getTime())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Format tanggal kegiatan tidak sah (gunakan YYYY-MM-DD).",
      });
      return z.NEVER;
    }

    const yyyyMmDd = parsed.toISOString().slice(0, 10);
    return new Date(`${yyyyMmDd}T00:00:00.000Z`);
  });

const fotoBuktiUrlSchema = z
  .string()
  .trim()
  .min(1, "Foto bukti kegiatan wajib diunggah.")
  .max(255, "URL foto bukti terlalu panjang.")
  .refine((val) => FOTO_BUKTI_URL_REGEX.test(val), {
    message:
      "URL foto bukti wajib berasal dari /api/uploads/logbook-bukti atau tautan gambar http(s) yang sah.",
  });

export const logbookIdParamSchema = z.object({
  id: z.string().uuid("ID catatan logbook tidak sah."),
});

export const logbooksQuerySchema = z.object({
  semesterId: z.string().uuid("ID periode semester tidak sah.").optional(),
  pendataanId: z.string().uuid("ID pendataan magang tidak sah.").optional(),
  jenisCatatan: z.enum(["MINGGUAN", "REKAP_BULANAN"]).optional(),
  statusValidasi: z
    .enum(["MENUNGGU_VALIDASI", "TERVALIDASI", "PERLU_REVISI"])
    .optional(),
  q: z.string().trim().max(100).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const createLogbookSchema = z.object({
  jenisCatatan: z.enum(["MINGGUAN", "REKAP_BULANAN"]).default("MINGGUAN"),
  tanggal: canonicalDateSchema,
  mingguKe: z.coerce
    .number()
    .int("Minggu ke- wajib berupa bilangan bulat.")
    .min(1, "Minggu ke- minimal 1.")
    .max(30, "Minggu ke- maksimal 30."),
  deskripsiKegiatan: z
    .string()
    .trim()
    .min(20, "Deskripsi kegiatan minimal 20 karakter.")
    .max(5000, "Deskripsi kegiatan maksimal 5000 karakter."),
  fotoBuktiUrl: fotoBuktiUrlSchema,
  namaFileBukti: z
    .string()
    .trim()
    .min(1, "Nama berkas foto bukti wajib disertakan.")
    .max(150, "Nama berkas foto bukti maksimal 150 karakter."),
});

export const updateLogbookSchema = z
  .object({
    jenisCatatan: z.enum(["MINGGUAN", "REKAP_BULANAN"]).optional(),
    tanggal: canonicalDateSchema.optional(),
    mingguKe: z.coerce.number().int().min(1).max(30).optional(),
    deskripsiKegiatan: z.string().trim().min(20).max(5000).optional(),
    fotoBuktiUrl: fotoBuktiUrlSchema.optional(),
    namaFileBukti: z.string().trim().min(1).max(150).optional(),
  })
  .refine((payload) => Object.keys(payload).length > 0, {
    message: "Minimal satu atribut perubahan logbook wajib dikirimkan.",
  });

export const validasiLogbookDecisionSchema = z.discriminatedUnion(
  "statusValidasi",
  [
    z.object({
      statusValidasi: z.literal("TERVALIDASI"),
      catatanPembimbing: z
        .string()
        .trim()
        .max(2000, "Catatan pembimbing maksimal 2000 karakter.")
        .nullable()
        .optional(),
    }),
    z.object({
      statusValidasi: z.literal("PERLU_REVISI"),
      catatanPembimbing: z
        .string()
        .trim()
        .min(5, "Catatan perbaikan wajib diisi minimal 5 karakter.")
        .max(2000, "Catatan pembimbing maksimal 2000 karakter."),
    }),
  ],
);

export type LogbooksQueryInput = z.input<typeof logbooksQuerySchema>;
export type ParsedLogbooksQuery = z.output<typeof logbooksQuerySchema>;
export type CreateLogbookInput = z.input<typeof createLogbookSchema>;
export type ParsedCreateLogbook = z.output<typeof createLogbookSchema>;
export type UpdateLogbookInput = z.input<typeof updateLogbookSchema>;
export type ParsedUpdateLogbook = z.output<typeof updateLogbookSchema>;
export type ValidasiLogbookDecisionInput = z.infer<
  typeof validasiLogbookDecisionSchema
>;
