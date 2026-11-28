import { z } from "zod";

const jenisDokumenSkEnum = z.enum([
  "SK_PENUGASAN",
  "SK_PEMBIMBING",
  "SK_KUNJUNG_LAPANGAN",
]);

export const skIdParamSchema = z.object({
  id: z.string().uuid("ID dokumen SK tidak sah."),
});

export const plotDosenKunjungSchema = z.object({
  dosenKunjungId: z
    .union([z.string().trim(), z.null()])
    .transform((val, ctx) => {
      if (val === null || val === "") {
        return null;
      }
      const parsed = z.string().uuid().safeParse(val);
      if (!parsed.success) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "ID Pembimbing Lapangan (Dosen Kunjung) tidak sah.",
        });
        return z.NEVER;
      }
      return parsed.data;
    }),
});

export const sksListQuerySchema = z.object({
  semesterId: z.string().uuid("ID periode semester tidak sah.").optional(),
  pendataanId: z.string().uuid("ID pendataan magang tidak sah.").optional(),
  jenisSk: jenisDokumenSkEnum.optional(),
  statusPengesahan: z.enum(["DRAF_MENUNGGU", "DISAHKAN"]).optional(),
  q: z.string().trim().max(100).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(15),
});

export const generateSkSchema = z.object({
  pendataanId: z.string().uuid("ID pendataan magang tidak sah."),
  jenisSks: z
    .array(jenisDokumenSkEnum)
    .min(1, "Pilih minimal satu jenis dokumen SK untuk digenerasi.")
    .max(3, "Maksimal 3 jenis dokumen SK.")
    .refine((items) => new Set(items).size === items.length, {
      message: "Daftar jenis dokumen SK tidak boleh mengandung duplikasi.",
    }),
  nomorSk: z
    .string()
    .trim()
    .min(3, "Nomor SK minimal 3 karakter.")
    .max(100, "Nomor SK maksimal 100 karakter.")
    .optional(),
  nomorSkMap: z
    .object({
      SK_PENUGASAN: z.string().trim().min(3).max(100).optional(),
      SK_PEMBIMBING: z.string().trim().min(3).max(100).optional(),
      SK_KUNJUNG_LAPANGAN: z.string().trim().min(3).max(100).optional(),
    })
    .optional(),
});

export const unduhSkQuerySchema = z.object({
  download: z.enum(["0", "1"]).optional(),
});

export type PlotDosenKunjungInput = z.input<typeof plotDosenKunjungSchema>;
export type ParsedPlotDosenKunjung = z.output<typeof plotDosenKunjungSchema>;
export type SksListQueryInput = z.input<typeof sksListQuerySchema>;
export type ParsedSksListQuery = z.output<typeof sksListQuerySchema>;
export type GenerateSkInput = z.infer<typeof generateSkSchema>;
export type UnduhSkQueryInput = z.infer<typeof unduhSkQuerySchema>;
