import type { NextRequest } from "next/server";
import { uploadCategorySchema } from "@/features/uploads/schemas/upload.schema";
import { requireApiSession } from "@/libs/api-auth";
import { saveUploadedFile } from "@/libs/storage";
import { ApiHttpError, handleApiError } from "@/utils/api-error";
import { jsonSuccess } from "@/utils/api-response";

export async function POST(request: NextRequest) {
  try {
    const auth = await requireApiSession({
      allowedRoles: ["MAHASISWA", "ADMIN", "KAPRODI"],
    });
    if (!auth.ok) {
      return auth.response;
    }

    const formData = await request.formData().catch(() => null);
    if (!formData) {
      throw new ApiHttpError(
        400,
        "Permintaan unggah wajib menggunakan format multipart/form-data.",
      );
    }

    const rawCategory = formData.get("category");
    const category = uploadCategorySchema.parse(
      typeof rawCategory === "string" ? rawCategory : "",
    );

    const fileEntry = formData.get("file");
    if (!(fileEntry instanceof File)) {
      throw new ApiHttpError(400, "Berkas unggahan wajib disertakan pada field 'file'.");
    }

    const uploaded = await saveUploadedFile({
      file: fileEntry,
      category,
      role: auth.context.user.role,
    });

    return jsonSuccess("Berkas berhasil diunggah.", uploaded, 201);
  } catch (error: unknown) {
    return handleApiError(error, "Gagal memproses unggahan berkas.");
  }
}
