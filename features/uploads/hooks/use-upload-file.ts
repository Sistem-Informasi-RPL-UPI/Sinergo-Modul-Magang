import { useMutation } from "@tanstack/react-query";
import { uploadProtectedFile } from "@/features/uploads/services/upload.service";

export function useUploadFileMutation() {
  return useMutation({
    mutationFn: uploadProtectedFile,
  });
}
