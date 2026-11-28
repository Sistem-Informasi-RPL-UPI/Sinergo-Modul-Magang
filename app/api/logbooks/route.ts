import type { NextRequest } from "next/server";
import {
  createLogbookSchema,
  logbooksQuerySchema,
} from "@/features/logbooks/schemas/logbook.schema";
import {
  createMahasiswaLogbook,
  listLogbooks,
} from "@/features/logbooks/services/logbook.server";
import { requireApiSession } from "@/libs/api-auth";
import { ApiHttpError, handleApiError } from "@/utils/api-error";
import { jsonSuccess } from "@/utils/api-response";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireApiSession();
    if (!auth.ok) {
      return auth.response;
    }

    const sp = request.nextUrl.searchParams;
    const query = logbooksQuerySchema.parse({
      semesterId: sp.get("semesterId") ?? undefined,
      pendataanId: sp.get("pendataanId") ?? undefined,
      jenisCatatan: sp.get("jenisCatatan") ?? undefined,
      statusValidasi: sp.get("statusValidasi") ?? undefined,
      q: sp.get("q") ?? undefined,
      page: sp.get("page") ?? undefined,
      limit: sp.get("limit") ?? undefined,
    });

    const data = await listLogbooks(auth.context, query);
    return jsonSuccess("Riwayat catatan logbook berhasil dimuat.", data);
  } catch (error: unknown) {
    return handleApiError(error, "Gagal memuat riwayat catatan logbook.");
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireApiSession({
      allowedRoles: ["MAHASISWA"],
    });
    if (!auth.ok) {
      return auth.response;
    }

    const rawBody = await request.json().catch(() => null);
    if (!rawBody || typeof rawBody !== "object") {
      throw new ApiHttpError(400, "Body permintaan harus berformat JSON objek.");
    }

    const parsed = createLogbookSchema.parse(rawBody);
    const created = await createMahasiswaLogbook(auth.context, parsed);

    return jsonSuccess(
      "Catatan kegiatan logbook berhasil disimpan dan menunggu validasi pembimbing.",
      created,
      201,
    );
  } catch (error: unknown) {
    return handleApiError(error, "Gagal menyimpan catatan kegiatan logbook.");
  }
}
