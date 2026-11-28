import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import type { RoleUserType, UploadCategoryType } from "@/types";
import { ApiHttpError } from "@/utils/api-error";
import { uploadCategorySchema } from "@/features/uploads/schemas/upload.schema";
import type { UploadedFileDto } from "@/features/uploads/types/upload.type";

type SupportedMimeType =
  | "application/pdf"
  | "image/jpeg"
  | "image/png"
  | "image/webp";

interface CategoryRule {
  maxBytes: number;
  allowedMimes: readonly SupportedMimeType[];
  allowedRoles: readonly RoleUserType[];
  label: string;
}

const CATEGORY_RULES: Record<UploadCategoryType, CategoryRule> = {
  "loa-awal": {
    maxBytes: 10 * 1024 * 1024,
    allowedMimes: ["application/pdf", "image/jpeg", "image/png"],
    allowedRoles: ["MAHASISWA", "ADMIN", "KAPRODI"],
    label: "Berkas LOA Awal",
  },
  "logbook-bukti": {
    maxBytes: 5 * 1024 * 1024,
    allowedMimes: ["image/jpeg", "image/png"],
    allowedRoles: ["MAHASISWA", "ADMIN", "KAPRODI"],
    label: "Foto Bukti Logbook",
  },
  "berkas-akhir": {
    maxBytes: 10 * 1024 * 1024,
    allowedMimes: ["application/pdf"],
    allowedRoles: ["MAHASISWA", "ADMIN", "KAPRODI"],
    label: "Dokumen Berkas Akhir",
  },
  "logo-instansi": {
    maxBytes: 2 * 1024 * 1024,
    allowedMimes: ["image/jpeg", "image/png", "image/webp"],
    allowedRoles: ["ADMIN", "KAPRODI"],
    label: "Logo Instansi Mitra",
  },
};

const MIME_TO_EXT: Record<SupportedMimeType, string> = {
  "application/pdf": "pdf",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

const EXT_TO_MIME: Record<string, SupportedMimeType> = {
  pdf: "application/pdf",
  jpg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

const SAFE_STORED_FILENAME_REGEX = /^[0-9a-f-]{36}\.(pdf|jpg|png|webp)$/;

// Gunakan os.tmpdir() saat berjalan di lingkungan serverless Vercel tanpa token Blob agar bebas error read-only filesystem.
function getLocalStorageRoot(): string {
  if (process.env.VERCEL === "1") {
    return path.join(os.tmpdir(), "sinergo-uploads");
  }
  return path.join(process.cwd(), ".storage", "uploads");
}

// Deteksi tipe berkas asli dari magic bytes biner untuk mencegah penyamaran ekstensi file berbahaya.
function detectMimeFromSignature(buffer: Buffer): SupportedMimeType | null {
  if (
    buffer.length >= 5 &&
    buffer[0] === 0x25 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x44 &&
    buffer[3] === 0x46 &&
    buffer[4] === 0x2d
  ) {
    return "application/pdf";
  }

  if (
    buffer.length >= 3 &&
    buffer[0] === 0xff &&
    buffer[1] === 0xd8 &&
    buffer[2] === 0xff
  ) {
    return "image/jpeg";
  }

  if (
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return "image/png";
  }

  if (
    buffer.length >= 12 &&
    buffer.subarray(0, 4).toString("ascii") === "RIFF" &&
    buffer.subarray(8, 12).toString("ascii") === "WEBP"
  ) {
    return "image/webp";
  }

  return null;
}

function sanitizeOriginalFilename(rawName: string): string {
  const cleaned = path
    .basename(rawName)
    .replace(/[^\w.\- ]+/g, "_")
    .trim();
  return cleaned.slice(0, 120) || "dokumen";
}

export function assertCategoryPermission(
  category: UploadCategoryType,
  role: RoleUserType,
): void {
  const rule = CATEGORY_RULES[category];
  if (!rule.allowedRoles.includes(role)) {
    throw new ApiHttpError(
      403,
      `Peran ${role} tidak memiliki izin mengunggah kategori ${rule.label}.`,
    );
  }
}

export async function saveUploadedFile(params: {
  file: File;
  category: UploadCategoryType;
  role: RoleUserType;
}): Promise<UploadedFileDto> {
  const { file, category, role } = params;
  const rule = CATEGORY_RULES[category];

  assertCategoryPermission(category, role);

  if (file.size <= 0) {
    throw new ApiHttpError(400, "Berkas yang diunggah kosong.");
  }

  if (file.size > rule.maxBytes) {
    const maxMb = Math.round(rule.maxBytes / (1024 * 1024));
    throw new ApiHttpError(
      400,
      `Ukuran ${rule.label} melebihi batas maksimum ${maxMb} MB.`,
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const detectedMime = detectMimeFromSignature(buffer);

  if (!detectedMime || !rule.allowedMimes.includes(detectedMime)) {
    const readableFormats = rule.allowedMimes
      .map((m) => MIME_TO_EXT[m].toUpperCase())
      .join(", ");
    throw new ApiHttpError(
      400,
      `Format ${rule.label} tidak sah. Gunakan berkas asli berformat ${readableFormats}.`,
    );
  }

  const ext = MIME_TO_EXT[detectedMime];
  const storedFileName = `${randomUUID()}.${ext}`;
  const originalName = sanitizeOriginalFilename(file.name);

  const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
  if (blobToken) {
    const objectPath = `sinergo-magang/${category}/${storedFileName}`;
    const blobRes = await fetch(`https://blob.vercel-storage.com/${objectPath}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${blobToken}`,
        "x-api-version": "7",
        "x-content-type": detectedMime,
        "x-add-random-suffix": "0",
      },
      body: buffer,
    });

    if (!blobRes.ok) {
      throw new ApiHttpError(
        502,
        "Gagal menyimpan berkas ke layanan penyimpanan awan.",
      );
    }

    const blobJson = (await blobRes.json()) as { url?: string };
    if (!blobJson.url) {
      throw new ApiHttpError(
        502,
        "Respons URL berkas dari penyimpanan awan tidak valid.",
      );
    }

    return {
      fileUrl: blobJson.url,
      fileName: storedFileName,
      originalName,
      mimeType: detectedMime,
      sizeBytes: buffer.byteLength,
      category,
    };
  }

  const targetDir = path.join(getLocalStorageRoot(), category);
  await mkdir(targetDir, { recursive: true });
  await writeFile(path.join(targetDir, storedFileName), buffer);

  return {
    fileUrl: `/api/uploads/${category}/${storedFileName}`,
    fileName: storedFileName,
    originalName,
    mimeType: detectedMime,
    sizeBytes: buffer.byteLength,
    category,
  };
}

export async function readStoredLocalFile(params: {
  rawCategory: string;
  rawFilename: string;
}): Promise<{
  buffer: Buffer;
  mimeType: SupportedMimeType;
  fileName: string;
}> {
  const categoryParsed = uploadCategorySchema.safeParse(params.rawCategory);
  if (!categoryParsed.success) {
    throw new ApiHttpError(400, "Kategori berkas tidak sah.");
  }

  if (!SAFE_STORED_FILENAME_REGEX.test(params.rawFilename)) {
    throw new ApiHttpError(400, "Nama berkas tidak sah.");
  }

  const ext = params.rawFilename.split(".").pop() ?? "";
  const mimeType = EXT_TO_MIME[ext];
  if (!mimeType) {
    throw new ApiHttpError(400, "Ekstensi berkas tidak didukung.");
  }

  const fullPath = path.join(
    getLocalStorageRoot(),
    categoryParsed.data,
    params.rawFilename,
  );

  try {
    const buffer = await readFile(fullPath);
    return {
      buffer,
      mimeType,
      fileName: params.rawFilename,
    };
  } catch {
    throw new ApiHttpError(404, "Berkas yang diminta tidak ditemukan.");
  }
}
