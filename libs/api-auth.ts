import type { NextResponse } from "next/server";
import { getAuthSession, upsertSsoUserRecord } from "@/libs/auth";
import { prisma } from "@/libs/prisma";
import type { ApiResponse, RoleUserType } from "@/types";
import { jsonError } from "@/utils/api-response";

export interface ApiMahasiswaProfile {
  id: string;
  nim: string;
  prodi: string;
  angkatan: number;
  statusAktif: boolean;
}

export interface ApiDosenProfile {
  id: string;
  nip: string;
  namaBergelar: string;
  statusAktif: boolean;
}

export interface ApiAuthContext {
  user: {
    id: string;
    ssoSub: string;
    email: string;
    nama: string;
    nipNim: string;
    role: RoleUserType;
    ssoRawRole: string;
  };
  mahasiswa: ApiMahasiswaProfile | null;
  dosen: ApiDosenProfile | null;
}

export type ApiSessionResult =
  | { ok: true; context: ApiAuthContext }
  | { ok: false; response: NextResponse<ApiResponse<null>> };

export async function requireApiSession(options?: {
  allowedRoles?: readonly RoleUserType[];
}): Promise<ApiSessionResult> {
  const session = await getAuthSession();

  if (!session?.user || session.error === "RefreshAccessTokenError") {
    return {
      ok: false,
      response: jsonError(
        "Sesi autentikasi tidak ditemukan atau telah berakhir.",
        401,
      ),
    };
  }

  if (
    options?.allowedRoles &&
    options.allowedRoles.length > 0 &&
    !options.allowedRoles.includes(session.user.role)
  ) {
    return {
      ok: false,
      response: jsonError(
        "Anda tidak memiliki hak akses untuk menjalankan operasi ini.",
        403,
      ),
    };
  }

  let dbUser = await prisma.user.findUnique({
    where: { ssoSub: session.user.ssoSub },
    include: {
      mahasiswa: true,
      dosen: true,
    },
  });

  // Sinkronisasi otomatis apabila sesi browser diterbitkan sebelum basis data terhubung atau profil role belum terbentuk.
  const needsRoleProfile =
    (session.user.role === "MAHASISWA" && !dbUser?.mahasiswa) ||
    ((session.user.role === "DOSEN" || session.user.role === "KAPRODI") &&
      !dbUser?.dosen);

  if (!dbUser || needsRoleProfile) {
    await upsertSsoUserRecord({
      ssoSub: session.user.ssoSub,
      email: session.user.email,
      nama: session.user.name,
      nipNim: session.user.nipNim,
      mappedRole: session.user.role,
      ssoRawRole: session.user.ssoRawRole,
    });

    dbUser = await prisma.user.findUnique({
      where: { ssoSub: session.user.ssoSub },
      include: {
        mahasiswa: true,
        dosen: true,
      },
    });
  }

  if (!dbUser) {
    return {
      ok: false,
      response: jsonError(
        "Profil pengguna gagal disinkronkan dengan basis data.",
        500,
      ),
    };
  }

  return {
    ok: true,
    context: {
      user: {
        id: dbUser.id,
        ssoSub: dbUser.ssoSub,
        email: dbUser.email,
        nama: dbUser.nama,
        nipNim: dbUser.nipNim,
        role: dbUser.role,
        ssoRawRole: dbUser.ssoRawRole,
      },
      mahasiswa: dbUser.mahasiswa
        ? {
            id: dbUser.mahasiswa.id,
            nim: dbUser.mahasiswa.nim,
            prodi: dbUser.mahasiswa.prodi,
            angkatan: dbUser.mahasiswa.angkatan,
            statusAktif: dbUser.mahasiswa.statusAktif,
          }
        : null,
      dosen: dbUser.dosen
        ? {
            id: dbUser.dosen.id,
            nip: dbUser.dosen.nip,
            namaBergelar: dbUser.dosen.namaBergelar,
            statusAktif: dbUser.dosen.statusAktif,
          }
        : null,
    },
  };
}
