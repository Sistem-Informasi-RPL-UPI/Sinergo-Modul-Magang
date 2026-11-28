import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  AnalitikMbkmQueryInput,
  CreateLowonganInput,
  LowongansQueryInput,
  UpdateLowonganInput,
} from "@/features/lowongans/schemas/lowongan.schema";
import {
  catatMinatLowongan,
  createLowongan,
  deleteLowongan,
  getAnalitikMbkm,
  getLowonganById,
  getLowongans,
  updateLowongan,
} from "@/features/lowongans/services/lowongan.service";

export const lowonganQueryKeys = {
  all: ["lowongans"] as const,
  list: (params?: LowongansQueryInput) =>
    ["lowongans", "list", params ?? {}] as const,
  detail: (id: string) => ["lowongans", "detail", id] as const,
  analitik: (params?: AnalitikMbkmQueryInput) =>
    ["kaprodi", "analitik-mbkm", params ?? {}] as const,
};

export function useLowongansQuery(params?: LowongansQueryInput) {
  return useQuery({
    queryKey: lowonganQueryKeys.list(params),
    queryFn: () => getLowongans(params),
  });
}

export function useLowonganDetailQuery(id: string | null) {
  return useQuery({
    queryKey: lowonganQueryKeys.detail(id ?? ""),
    queryFn: () => getLowonganById(id ?? ""),
    enabled: Boolean(id),
  });
}

export function useCreateLowonganMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateLowonganInput) => createLowongan(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: lowonganQueryKeys.all });
    },
  });
}

export function useUpdateLowonganMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { id: string; payload: UpdateLowonganInput }) =>
      updateLowongan(input),
    onSuccess: async (_data, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: lowonganQueryKeys.all }),
        queryClient.invalidateQueries({
          queryKey: lowonganQueryKeys.detail(variables.id),
        }),
      ]);
    },
  });
}

export function useDeleteLowonganMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteLowongan(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: lowonganQueryKeys.all });
    },
  });
}

export function useCatatMinatLowonganMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => catatMinatLowongan(id),
    onSuccess: async (_data, lowonganId) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: lowonganQueryKeys.all }),
        queryClient.invalidateQueries({
          queryKey: lowonganQueryKeys.detail(lowonganId),
        }),
      ]);
    },
  });
}

export function useAnalitikMbkmQuery(
  params?: AnalitikMbkmQueryInput,
  enabled = true,
) {
  return useQuery({
    queryKey: lowonganQueryKeys.analitik(params),
    queryFn: () => getAnalitikMbkm(params),
    enabled,
  });
}
