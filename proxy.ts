import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import type { RoleUserType } from "@/types";
import { getDefaultDashboardByRole, safeReturnPath } from "@/utils/safe-return";

function isAuthorizedForPath(pathname: string, role: RoleUserType): boolean {
  if (pathname.startsWith("/mahasiswa")) {
    return role === "MAHASISWA";
  }
  if (pathname.startsWith("/dosen")) {
    return role === "DOSEN";
  }
  if (pathname.startsWith("/kaprodi")) {
    return role === "KAPRODI";
  }
  if (pathname.startsWith("/admin")) {
    return role === "ADMIN";
  }
  return true;
}

export async function proxy(request: NextRequest): Promise<NextResponse> {
  const { pathname, search } = request.nextUrl;

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const hasValidSession = Boolean(
    token && token.error !== "RefreshAccessTokenError",
  );

  // Halaman utama tidak berada di Modul 5; langsung arahkan ke dashboard role atau otomatis ke login SSO SACIBIRU.
  if (pathname === "/") {
    if (hasValidSession && token) {
      return NextResponse.redirect(
        new URL(getDefaultDashboardByRole(token.role), request.url),
      );
    }
    return NextResponse.redirect(new URL("/sso/login", request.url));
  }

  const isProtectedRoute =
    pathname.startsWith("/mahasiswa") ||
    pathname.startsWith("/dosen") ||
    pathname.startsWith("/kaprodi") ||
    pathname.startsWith("/admin");

  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  if (!hasValidSession || !token) {
    const returnTo = safeReturnPath(`${pathname}${search}`, "/");
    const ssoLoginUrl = new URL("/sso/login", request.url);
    ssoLoginUrl.searchParams.set("callbackUrl", returnTo);
    return NextResponse.redirect(ssoLoginUrl);
  }

  if (!isAuthorizedForPath(pathname, token.role)) {
    const deniedUrl = new URL("/akses-ditolak", request.url);
    deniedUrl.searchParams.set("from", getDefaultDashboardByRole(token.role));
    return NextResponse.redirect(deniedUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/mahasiswa",
    "/mahasiswa/:path*",
    "/dosen",
    "/dosen/:path*",
    "/kaprodi",
    "/kaprodi/:path*",
    "/admin",
    "/admin/:path*",
  ],
};
