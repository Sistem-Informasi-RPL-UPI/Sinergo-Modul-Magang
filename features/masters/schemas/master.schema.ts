import { z } from "zod";

export const masterSemestersQuerySchema = z.object({
  aktifOnly: z.enum(["0", "1"]).optional(),
});

export const masterDosensQuerySchema = z.object({
  q: z.string().trim().max(100).optional(),
  includeInactive: z.enum(["0", "1"]).optional(),
});

export const masterMatakuliahsQuerySchema = z.object({
  q: z.string().trim().max(100).optional(),
  dosenPengampuId: z.string().uuid("ID dosen pengampu tidak valid.").optional(),
  includeRubrik: z.enum(["0", "1"]).optional(),
  includeNonKonversi: z.enum(["0", "1"]).optional(),
});

export type MasterSemestersQueryInput = z.infer<typeof masterSemestersQuerySchema>;
export type MasterDosensQueryInput = z.infer<typeof masterDosensQuerySchema>;
export type MasterMatakuliahsQueryInput = z.infer<typeof masterMatakuliahsQuerySchema>;
