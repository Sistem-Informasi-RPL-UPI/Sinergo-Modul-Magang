import { useQuery } from "@tanstack/react-query";
import type {
  MasterDosensQueryInput,
  MasterMatakuliahsQueryInput,
  MasterSemestersQueryInput,
} from "@/features/masters/schemas/master.schema";
import {
  getMasterDosens,
  getMasterMatakuliahs,
  getMasterSemesters,
} from "@/features/masters/services/master.service";

export const masterQueryKeys = {
  semesters: (params?: MasterSemestersQueryInput) =>
    ["masters", "semesters", params ?? {}] as const,
  dosens: (params?: MasterDosensQueryInput) =>
    ["masters", "dosens", params ?? {}] as const,
  matakuliahs: (params?: MasterMatakuliahsQueryInput) =>
    ["masters", "matakuliahs", params ?? {}] as const,
};

export function useMasterSemestersQuery(params?: MasterSemestersQueryInput) {
  return useQuery({
    queryKey: masterQueryKeys.semesters(params),
    queryFn: () => getMasterSemesters(params),
  });
}

export function useMasterDosensQuery(params?: MasterDosensQueryInput) {
  return useQuery({
    queryKey: masterQueryKeys.dosens(params),
    queryFn: () => getMasterDosens(params),
  });
}

export function useMasterMatakuliahsQuery(
  params?: MasterMatakuliahsQueryInput,
) {
  return useQuery({
    queryKey: masterQueryKeys.matakuliahs(params),
    queryFn: () => getMasterMatakuliahs(params),
  });
}
