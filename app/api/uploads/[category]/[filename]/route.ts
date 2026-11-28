import { NextResponse, type NextRequest } from "next/server";
import { requireApiSession } from "@/libs/api-auth";
import { readStoredLocalFile } from "@/libs/storage";
import { handleApiError } from "@/utils/api-error";

interface UploadRouteContext {
  params: Promise<{
    category: string;
    filename: string;
  }>;
}

export async function GET(
  _request: NextRequest,
  context: UploadRouteContext,
) {
  try {
    const auth = await requireApiSession();
    if (!auth.ok) {
      return auth.response;
    }

    const { category, filename } = await context.params;
    const stored = await readStoredLocalFile({
      rawCategory: category,
      rawFilename: filename,
    });

    return new NextResponse(new Uint8Array(stored.buffer), {
      status: 200,
      headers: {
        "Content-Type": stored.mimeType,
        "Content-Length": String(stored.buffer.byteLength),
        "Content-Disposition": `inline; filename="${stored.fileName}"`,
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (error: unknown) {
    return handleApiError(error, "Gagal membaca berkas penyimpanan.");
  }
}
