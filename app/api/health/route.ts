import { prisma } from "@/libs/prisma";
import { jsonError, jsonSuccess } from "@/utils/api-response";

export const dynamic = "force-dynamic";

export async function GET() {
  const startedAt = performance.now();

  try {
    await prisma.$queryRaw`SELECT 1`;
    const dbLatencyMs = Math.round(performance.now() - startedAt);

    const ssoConfigured = Boolean(
      process.env.SSO_URL &&
        process.env.SSO_CLIENT_ID &&
        process.env.SSO_CLIENT_SECRET,
    );

    return jsonSuccess("Layanan backend dan basis data berjalan normal.", {
      status: "healthy",
      service: "sinergo-modul-magang",
      database: {
        connected: true,
        latencyMs: dbLatencyMs,
      },
      ssoConfigured,
      timestamp: new Date().toISOString(),
    });
  } catch {
    return jsonError(
      "Layanan basis data tidak dapat dijangkau saat ini.",
      503,
    );
  }
}
