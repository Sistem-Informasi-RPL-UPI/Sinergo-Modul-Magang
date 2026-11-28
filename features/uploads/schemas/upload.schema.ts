import { z } from "zod";

export const uploadCategorySchema = z.enum([
  "loa-awal",
  "logbook-bukti",
  "berkas-akhir",
  "logo-instansi",
]);

export type UploadCategoryInput = z.infer<typeof uploadCategorySchema>;
