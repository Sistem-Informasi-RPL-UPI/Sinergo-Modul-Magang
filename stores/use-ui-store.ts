import { create } from "zustand";
import type { ActiveWorkspaceMode } from "@/types";

interface UiState {
  isMobileSidebarOpen: boolean;
  activeMode: ActiveWorkspaceMode | null;
  setMobileSidebarOpen: (open: boolean) => void;
  toggleMobileSidebar: () => void;
  setActiveMode: (mode: ActiveWorkspaceMode) => void;
}

export const useUiStore = create<UiState>((set) => ({
  isMobileSidebarOpen: false,
  activeMode: null,
  setMobileSidebarOpen: (open) => set({ isMobileSidebarOpen: open }),
  toggleMobileSidebar: () =>
    set((state) => ({ isMobileSidebarOpen: !state.isMobileSidebarOpen })),
  setActiveMode: (mode) => set({ activeMode: mode }),
}));
