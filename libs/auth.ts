import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import { createRemoteJWKSet, jwtVerify, type JWTPayload } from "jose";
import { getServerSession, type NextAuthOptions } from "next-auth";
import type { JWT } from "next-auth/jwt";
import { prisma } from "@/libs/prisma";
import type { RoleUserType } from "@/types";
import { safeReturnPath } from "@/utils/safe-return";

interface SacibiruJwtClaims extends JWTPayload {
  sub: string;
  name: string;
  email: string;
  nip: string;
  role: string;
  exp: number;
}

type SacibiruTokenResponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  [key: string]: unknown;
};

const ssoUrl = (process.env.SSO_URL ?? "https://sso.kampus.ac.id").replace(/\/+$/, "");
const ssoClientId = process.env.SSO_CLIENT_ID ?? "sinergo-modul-magang";
const ssoClientSecret = process.env.SSO_CLIENT_SECRET ?? "";

// Cache JWKS selama 5 menit sesuai spesifikasi SSO SACIBIRU dan otomatis muat ulang saat bertemu kid baru.
const jwks = createRemoteJWKSet(new URL("/api/sso/jwks", ssoUrl), {
  cacheMaxAge: 300_000,
  cooldownDuration: 30_000,
});

// Single-flight lock per sso_sub agar tab paralel tidak memakai refresh_token lama dua kali dan membatalkan rantai sesi.
const refreshInFlight = new Map<string, Promise<JWT>>();

function deriveEncryptionKey(): Buffer {
  const secret = process.env.NEXTAUTH_SECRET ?? "sinergo-dev-fallback-secret-key";
  return createHash("sha256").update(secret).digest();
}

function encryptToken(plainText: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", deriveEncryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(plainText, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return `${iv.toString("base64url")}.${authTag.toString("base64url")}.${encrypted.toString("base64url")}`;
}

export function decryptToken(cipherPayload: string): string {
  const [ivPart, tagPart, dataPart] = cipherPayload.split(".");
  if (!ivPart || !tagPart || !dataPart) {
    throw new Error("Format token terenkripsi tidak sah.");
  }
  const decipher = createDecipheriv(
    "aes-256-gcm",
    deriveEncryptionKey(),
    Buffer.from(ivPart, "base64url"),
  );
  decipher.setAuthTag(Buffer.from(tagPart, "base64url"));
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(dataPart, "base64url")),
    decipher.final(),
  ]);
  return decrypted.toString("utf8");
}

export function mapSsoRoleToAppRole(rawRole: string): RoleUserType | null {
  switch (rawRole) {
    case "Mahasiswa":
      return "MAHASISWA";
    case "Dosen":
      return "DOSEN";
    case "Admin":
    case "Staff_Kaprodi":
      return "ADMIN";
    case "Kaprodi":
      return "KAPRODI";
    default:
      return null;
  }
}

async function verifySacibiruAccessToken(accessToken: string): Promise<SacibiruJwtClaims> {
  const { payload } = await jwtVerify(accessToken, jwks, {
    issuer: ssoUrl,
    audience: ssoClientId,
    algorithms: ["RS256"],
  });

  if (
    typeof payload.sub !== "string" ||
    typeof payload.name !== "string" ||
    typeof payload.email !== "string" ||
    typeof payload.nip !== "string" ||
    typeof payload.role !== "string" ||
    typeof payload.exp !== "number"
  ) {
    throw new Error("Klaim JWT SSO SACIBIRU tidak lengkap.");
  }

  return payload as SacibiruJwtClaims;
}

async function syncUserToDatabase(
  claims: SacibiruJwtClaims,
  mappedRole: RoleUserType,
  refreshToken: string,
): Promise<string> {
  if (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes("YOUR_AIVEN_PASSWORD")) {
    return claims.sub;
  }

  const encryptedRefreshToken = encryptToken(refreshToken);
  const user = await prisma.user.upsert({
    where: { ssoSub: claims.sub },
    update: {
      email: claims.email,
      nama: claims.name,
      nipNim: claims.nip,
      role: mappedRole,
      ssoRawRole: claims.role,
      encryptedRefreshToken,
      lastLoginAt: new Date(),
    },
    create: {
      ssoSub: claims.sub,
      email: claims.email,
      nama: claims.name,
      nipNim: claims.nip,
      role: mappedRole,
      ssoRawRole: claims.role,
      encryptedRefreshToken,
      lastLoginAt: new Date(),
    },
  });

  if (mappedRole === "MAHASISWA") {
    const inferredYear = Number.parseInt(`20${claims.nip.slice(0, 2)}`, 10);
    const angkatan = Number.isFinite(inferredYear) ? inferredYear : new Date().getFullYear();

    await prisma.mahasiswa.upsert({
      where: { userId: user.id },
      update: { nim: claims.nip },
      create: {
        userId: user.id,
        nim: claims.nip,
        angkatan,
      },
    });
  } else if (mappedRole === "DOSEN" || mappedRole === "KAPRODI") {
    await prisma.dosen.upsert({
      where: { userId: user.id },
      update: {
        nip: claims.nip,
        namaBergelar: claims.name,
      },
      create: {
        userId: user.id,
        nip: claims.nip,
        namaBergelar: claims.name,
      },
    });
  }

  return user.id;
}

async function performRefreshTokenRotation(token: JWT): Promise<JWT> {
  if (!token.refreshToken) {
    return { ...token, error: "RefreshAccessTokenError" };
  }

  try {
    const response = await fetch(`${ssoUrl}/api/sso/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        client_id: ssoClientId,
        client_secret: ssoClientSecret,
        refresh_token: token.refreshToken,
      }),
      cache: "no-store",
    });

    if (!response.ok) {
      return { ...token, error: "RefreshAccessTokenError" };
    }

    const refreshed = (await response.json()) as SacibiruTokenResponse;
    const claims = await verifySacibiruAccessToken(refreshed.access_token);
    const mappedRole = mapSsoRoleToAppRole(claims.role);

    if (!mappedRole) {
      return { ...token, error: "RefreshAccessTokenError" };
    }

    const userId = await syncUserToDatabase(claims, mappedRole, refreshed.refresh_token);

    return {
      ...token,
      userId,
      name: claims.name,
      email: claims.email,
      nipNim: claims.nip,
      role: mappedRole,
      ssoRawRole: claims.role,
      accessTokenExpires: claims.exp * 1000,
      refreshToken: refreshed.refresh_token,
      error: undefined,
    };
  } catch {
    return { ...token, error: "RefreshAccessTokenError" };
  }
}

async function rotateTokenSingleFlight(token: JWT): Promise<JWT> {
  const existingLock = refreshInFlight.get(token.ssoSub);
  if (existingLock) {
    return existingLock;
  }

  const rotationPromise = performRefreshTokenRotation(token).finally(() => {
    refreshInFlight.delete(token.ssoSub);
  });

  refreshInFlight.set(token.ssoSub, rotationPromise);
  return rotationPromise;
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  pages: {
    error: "/akses-ditolak",
  },
  providers: [
    {
      id: "sacibiru",
      name: "SSO SACIBIRU",
      type: "oauth",
      checks: ["pkce", "state"],
      clientId: ssoClientId,
      clientSecret: ssoClientSecret,
      authorization: {
        url: `${ssoUrl}/api/sso/authorize`,
        params: {
          scope: "",
          response_type: "code",
        },
      },
      token: {
        url: `${ssoUrl}/api/sso/token`,
        async request(context) {
          const redirectUri =
            context.provider.callbackUrl ??
            `${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/api/auth/callback/sacibiru`;

          const body = new URLSearchParams({
            grant_type: "authorization_code",
            client_id: ssoClientId,
            client_secret: ssoClientSecret,
            code: String(context.params.code ?? ""),
            redirect_uri: redirectUri,
          });

          if (context.checks.code_verifier) {
            body.set("code_verifier", context.checks.code_verifier);
          }

          const response = await fetch(`${ssoUrl}/api/sso/token`, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body,
            cache: "no-store",
          });

          if (!response.ok) {
            throw new Error("Pertukaran kode otorisasi SSO SACIBIRU gagal.");
          }

          const tokens = (await response.json()) as SacibiruTokenResponse;
          return { tokens };
        },
      },
      userinfo: {
        async request(context) {
          const accessToken = context.tokens.access_token;
          if (!accessToken) {
            throw new Error("Access token tidak ditemukan pada respons SSO.");
          }
          const claims = await verifySacibiruAccessToken(accessToken);
          return {
            sub: claims.sub,
            name: claims.name,
            email: claims.email,
            nip: claims.nip,
            role: claims.role,
            exp: claims.exp,
            refreshToken: String(context.tokens.refresh_token ?? ""),
          };
        },
      },
      async profile(profile) {
        const claims = profile as SacibiruJwtClaims & { refreshToken: string };
        const mappedRole = mapSsoRoleToAppRole(claims.role);
        if (!mappedRole) {
          throw new Error("Role pengguna tidak diizinkan mengakses Modul Magang.");
        }

        const userId = await syncUserToDatabase(
          claims,
          mappedRole,
          claims.refreshToken,
        );

        return {
          id: userId,
          ssoSub: claims.sub,
          name: claims.name,
          email: claims.email,
          nipNim: claims.nip,
          role: mappedRole,
          ssoRawRole: claims.role,
          accessTokenExpires: claims.exp * 1000,
          refreshToken: claims.refreshToken,
        };
      },
    },
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        return {
          ...token,
          userId: user.id,
          ssoSub: user.ssoSub,
          name: user.name,
          email: user.email,
          nipNim: user.nipNim,
          role: user.role,
          ssoRawRole: user.ssoRawRole,
          accessTokenExpires: user.accessTokenExpires,
          refreshToken: user.refreshToken,
        };
      }

      if (Date.now() < token.accessTokenExpires - 15_000) {
        return token;
      }

      return rotateTokenSingleFlight(token);
    },
    async session({ session, token }) {
      session.user = {
        id: token.userId,
        ssoSub: token.ssoSub,
        name: token.name,
        email: token.email,
        nipNim: token.nipNim,
        role: token.role,
        ssoRawRole: token.ssoRawRole,
      };
      session.error = token.error;
      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) {
        return `${baseUrl}${safeReturnPath(url, "/")}`;
      }
      try {
        const parsed = new URL(url);
        if (parsed.origin === baseUrl) {
          return `${baseUrl}${safeReturnPath(`${parsed.pathname}${parsed.search}`, "/")}`;
        }
      } catch {
        return baseUrl;
      }
      return baseUrl;
    },
  },
};

export function getAuthSession() {
  return getServerSession(authOptions);
}

export function buildSsoLogoutUrl(postLogoutUri?: string): string {
  const logoutUrl = new URL("/api/sso/logout", ssoUrl);
  logoutUrl.searchParams.set("client_id", ssoClientId);
  logoutUrl.searchParams.set(
    "post_logout_redirect_uri",
    postLogoutUri ?? process.env.NEXTAUTH_URL ?? "http://localhost:3000/",
  );
  return logoutUrl.toString();
}
