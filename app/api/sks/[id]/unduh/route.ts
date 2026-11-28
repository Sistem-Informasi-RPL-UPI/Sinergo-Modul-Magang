import { NextResponse, type NextRequest } from "next/server";
import {
  skIdParamSchema,
  unduhSkQuerySchema,
} from "@/features/pendataans/schemas/sk.schema";
import { getAuthorizedSkPdf } from "@/features/pendataans/services/sk.server";
import { requireApiSession } from "@/libs/api-auth";
import { handleApiError } from "@/utils/api-error";

interface UnduhSkRouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(
  request: NextRequest,
  context: UnduhSkRouteContext,
) {
  try {
    const auth = await requireApiSession();
    if (!auth.ok) {
      return auth.response;
    }

    const { id } = skIdParamSchema.parse(await context.params);
    const query = unduhSkQuerySchema.parse({
      download: request.nextUrl.searchParams.get("download") ?? undefined,
    });

    const { pdfBuffer, fileName } = await getAuthorizedSkPdf(auth.context, id);
    const dispositionType = query.download === "1" ? "attachment" : "inline";

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Length": String(pdfBuffer.byteLength),
        "Content-Disposition": `${dispositionType}; filename="${fileName}"`,
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error: unknown) {
    return handleApiError(error, "Gagal menyiapkan dokumen PDF Surat Keputusan.");
  }
}
