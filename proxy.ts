import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import type { RoleUserType } from "@/types";
import { getDefaultDashboardByRole, safeReturnPath } from "@/utils/safe-return";

function isAuthorizedForPath(pathname: string, role: RoleUserType): boolean {
  if (pathname.startsWith("/mahasiswa")) {
    return role === "MAHASISWA";
  }
  if (pathname.startsWith("/dosen")) {
    // Kaprodi diizinkan membuka ruang kerja Dosen apabila merangkap sebagai Dosen Pengampu MK konversi.
    return role === "DOSEN" || role === "KAPRODI";
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

  const isProtectedRoute =
    pathname.startsWith("/mahasiswa") ||
    pathname.startsWith("/dosen") ||
    pathname.startsWith("/kaprodi") ||
    pathname.startsWith("/admin");

  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token || token.error === "RefreshAccessTokenError") {
    const returnTo = safeReturnPath(`${pathname}${search}`, "/");
    const signInUrl = new URL("/api/auth/signin", request.url);
    signInUrl.searchParams.set("callbackUrl", returnTo);
    return NextResponse.redirect(signInUrl);
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
    "/mahasiswa/:path*",
    "/dosen/:path*",
    "/kaprodi/:path*",
    "/admin/:path*",
  ],
};
