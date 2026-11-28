import { NextResponse, type NextRequest } from "next/server";
import { buildSsoLogoutUrl, getAuthSession } from "@/libs/auth";
import { prisma } from "@/libs/prisma";
import { jsonSuccess } from "@/utils/api-response";

async function clearRefreshTokenIfPresent(): Promise<void> {
  const session = await getAuthSession();

  if (
    session?.user?.ssoSub &&
    process.env.DATABASE_URL &&
    !process.env.DATABASE_URL.includes("YOUR_AIVEN_PASSWORD")
  ) {
    await prisma.user
      .update({
        where: { ssoSub: session.user.ssoSub },
        data: { encryptedRefreshToken: null },
      })
      .catch(() => null);
  }
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  await clearRefreshTokenIfPresent();
  const reloginToModule = request.nextUrl.searchParams.get("relogin") === "1";
  return NextResponse.redirect(buildSsoLogoutUrl({ reloginToModule }));
}

export async function POST(request: NextRequest) {
  await clearRefreshTokenIfPresent();
  const reloginToModule = request.nextUrl.searchParams.get("relogin") === "1";
  return jsonSuccess("Sesi refresh token berhasil dicabut.", {
    logoutUrl: buildSsoLogoutUrl({ reloginToModule }),
  });
}
