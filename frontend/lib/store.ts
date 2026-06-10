// lib/store.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { DiagnoseResponse, Gejala, GejalaInput, User } from "@/types";

interface AuthState {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  clearAuth: () => void;
  isAdmin: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      setAuth: (user, token) => {
        set({ user, token });
        if (typeof window !== "undefined") {
          localStorage.setItem("token", token);
        }
      },
      clearAuth: () => {
        set({ user: null, token: null });
        if (typeof window !== "undefined") {
          localStorage.removeItem("token");
        }
      },
      isAdmin: () => get().user?.is_admin ?? false,
    }),
    { name: "auth-storage" }
  )
);

interface DiagnosisState {
  gejalaList: Gejala[];
  answers: Record<string, number>;
  result: DiagnoseResponse | null;  // ← UBAH: tambahkan | null
  setGejalaList: (list: Gejala[]) => void;
  setAnswer: (gejalaId: string, cfUser: number) => void;
  setResult: (result: DiagnoseResponse | null) => void;  // ← UBAH: parameter bisa null
  getAnsweredInputs: () => GejalaInput[];
  reset: () => void;
}

export const useDiagnosisStore = create<DiagnosisState>((set, get) => ({
  gejalaList: [],
  answers: {},
  result: null,  // ← UBAH: set ke null instead of undefined
  setGejalaList: (list) => set({ gejalaList: list }),
  setAnswer: (gejalaId, cfUser) =>
    set((state) => ({ answers: { ...state.answers, [gejalaId]: cfUser } })),
  setResult: (result) => set({ result }),  // ← UBAH: sekarang bisa terima null
  getAnsweredInputs: () => {
    const { answers } = get();
    return Object.entries(answers)
      .filter(([, cf]) => cf !== 0.0)
      .map(([gejala_id, cf_user]) => ({ gejala_id, cf_user }));
  },
  reset: () => set({ gejalaList: [], answers: {}, result: null }),  // ← UBAH: set ke null
}));