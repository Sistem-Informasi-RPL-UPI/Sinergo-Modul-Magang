import { JenisProgramMbkm, KategoriAnalitikMbkm } from "@prisma/client";
import type { GradeLetterType } from "@/types";
import { ApiHttpError } from "@/utils/api-error";

export interface RubricScoreInput {
  skor: number;
  bobotPersen: number;
}

export interface GradeConversionResult {
  nilaiDosen: number;
  nilaiAkhir: number;
  nilaiHuruf: GradeLetterType;
  bobotMutu: number;
}

interface GradeThreshold {
  minScore: number;
  nilaiHuruf: GradeLetterType;
  bobotMutu: number;
}

// Skala resmi konversi nilai akademik UPI sesuai docs/02-prd-dan-rbac.md Bab 2.
export const UPI_GRADE_SCALE: readonly GradeThreshold[] = [
  { minScore: 86, nilaiHuruf: "A", bobotMutu: 4.0 },
  { minScore: 81, nilaiHuruf: "A-", bobotMutu: 3.7 },
  { minScore: 76, nilaiHuruf: "B+", bobotMutu: 3.4 },
  { minScore: 71, nilaiHuruf: "B", bobotMutu: 3.0 },
  { minScore: 66, nilaiHuruf: "B-", bobotMutu: 2.7 },
  { minScore: 61, nilaiHuruf: "C+", bobotMutu: 2.4 },
  { minScore: 56, nilaiHuruf: "C", bobotMutu: 2.0 },
  { minScore: 46, nilaiHuruf: "D", bobotMutu: 1.0 },
  { minScore: 0, nilaiHuruf: "E", bobotMutu: 0.0 },
] as const;

function roundTwoDecimals(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function calculateWeightedRubricScore(
  items: readonly RubricScoreInput[],
): number {
  if (items.length === 0) {
    throw new ApiHttpError(
      400,
      "Daftar komponen rubrik penilaian tidak boleh kosong.",
    );
  }

  let totalWeight = 0;
  let weightedSum = 0;

  for (const item of items) {
    if (!Number.isFinite(item.skor) || item.skor < 0 || item.skor > 100) {
      throw new ApiHttpError(
        400,
        "Skor setiap komponen rubrik wajib berada pada rentang 0 hingga 100.",
      );
    }

    if (!Number.isFinite(item.bobotPersen) || item.bobotPersen <= 0) {
      throw new ApiHttpError(
        400,
        "Bobot persentase komponen rubrik wajib bernilai positif.",
      );
    }

    totalWeight += item.bobotPersen;
    weightedSum += (item.skor * item.bobotPersen) / 100;
  }

  if (Math.abs(totalWeight - 100) > 0.01) {
    throw new ApiHttpError(
      400,
      `Total bobot komponen rubrik harus tepat 100% (terhitung ${roundTwoDecimals(totalWeight)}%).`,
    );
  }

  return roundTwoDecimals(weightedSum);
}

export function convertScoreToLetterGrade(score: number): {
  nilaiHuruf: GradeLetterType;
  bobotMutu: number;
} {
  if (!Number.isFinite(score) || score < 0 || score > 100) {
    throw new ApiHttpError(
      400,
      "Nilai akhir konversi wajib berada pada rentang 0 hingga 100.",
    );
  }

  const normalized = roundTwoDecimals(score);

  for (const threshold of UPI_GRADE_SCALE) {
    if (normalized >= threshold.minScore) {
      return {
        nilaiHuruf: threshold.nilaiHuruf,
        bobotMutu: threshold.bobotMutu,
      };
    }
  }

  return { nilaiHuruf: "E", bobotMutu: 0.0 };
}

export function evaluateRubricConversion(
  items: readonly RubricScoreInput[],
): GradeConversionResult {
  const nilaiDosen = calculateWeightedRubricScore(items);
  const nilaiAkhir = nilaiDosen;
  const { nilaiHuruf, bobotMutu } = convertScoreToLetterGrade(nilaiAkhir);

  return {
    nilaiDosen,
    nilaiAkhir,
    nilaiHuruf,
    bobotMutu,
  };
}

export function resolveKategoriAnalitikMbkm(
  jenisProgram: JenisProgramMbkm,
): KategoriAnalitikMbkm {
  if (
    jenisProgram === JenisProgramMbkm.MSIB ||
    jenisProgram === JenisProgramMbkm.MM
  ) {
    return KategoriAnalitikMbkm.MAGANG;
  }
  return KategoriAnalitikMbkm.MBKM_LAINNYA;
}
