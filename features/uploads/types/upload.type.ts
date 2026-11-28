import type { UploadCategoryType } from "@/types";

export interface UploadedFileDto {
  fileUrl: string;
  fileName: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  category: UploadCategoryType;
}
