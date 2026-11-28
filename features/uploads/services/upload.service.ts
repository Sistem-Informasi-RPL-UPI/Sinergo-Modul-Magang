import type { UploadedFileDto } from "@/features/uploads/types/upload.type";
import { apiClient } from "@/libs/axios";
import type { ApiResponse, UploadCategoryType } from "@/types";

export async function uploadProtectedFile(input: {
  file: File;
  category: UploadCategoryType;
}): Promise<UploadedFileDto> {
  const formData = new FormData();
  formData.set("category", input.category);
  formData.set("file", input.file);

  const { data } = await apiClient.post<ApiResponse<UploadedFileDto>>(
    "/uploads",
    formData,
    {
      // Kosongkan default application/json agar browser menyertakan boundary multipart secara otomatis.
      headers: {
        "Content-Type": undefined,
      },
    },
  );
  return data.data;
}
