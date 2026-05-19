import axios from "axios";
import type {
  DiagnoseResponse,
  Gejala,
  GejalaInput,
  HistoryItem,
  Kerusakan,
  Rule,
  TokenResponse,
} from "@/types";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

// Auth
export const authApi = {
  login: (username: string, password: string) =>
    api.post<TokenResponse>(
      "/api/v1/auth/login",
      new URLSearchParams({ username, password }),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    ),
  register: (data: { username: string; email: string; password: string }) =>
    api.post("/api/v1/auth/register", data),
};

// Gejala
export const gejalaApi = {
  list: (kategori?: string) =>
    api.get<Gejala[]>("/api/v1/gejala", { params: kategori ? { kategori } : {} }),
  get: (id: string) => api.get<Gejala>(`/api/v1/gejala/${id}`),
  create: (data: Omit<Gejala, "id">) => api.post<Gejala>("/api/v1/gejala", data),
  update: (id: string, data: Partial<Omit<Gejala, "id">>) =>
    api.put<Gejala>(`/api/v1/gejala/${id}`, data),
  delete: (id: string) => api.delete(`/api/v1/gejala/${id}`),
};

// Kerusakan
export const kerusakanApi = {
  list: (kategori?: string) =>
    api.get<Kerusakan[]>("/api/v1/kerusakan", { params: kategori ? { kategori } : {} }),
  get: (id: string) => api.get<Kerusakan>(`/api/v1/kerusakan/${id}`),
  create: (data: Omit<Kerusakan, "id">) => api.post<Kerusakan>("/api/v1/kerusakan", data),
  update: (id: string, data: Partial<Omit<Kerusakan, "id">>) =>
    api.put<Kerusakan>(`/api/v1/kerusakan/${id}`, data),
  delete: (id: string) => api.delete(`/api/v1/kerusakan/${id}`),
};

// Rules
export const rulesApi = {
  list: () => api.get<Rule[]>("/api/v1/rules"),
  create: (data: Omit<Rule, "id">) => api.post<Rule>("/api/v1/rules", data),
  update: (id: string, cf_pakar: number) =>
    api.put<Rule>(`/api/v1/rules/${id}`, { cf_pakar }),
  delete: (id: string) => api.delete(`/api/v1/rules/${id}`),
};

// Diagnosis
export const diagnosisApi = {
  diagnose: (gejala_list: GejalaInput[], session_id?: string) =>
    api.post<DiagnoseResponse>("/api/v1/diagnose", { gejala_list, session_id }),
};

// History
export const historyApi = {
  list: (skip = 0, limit = 20) =>
    api.get<HistoryItem[]>("/api/v1/history", { params: { skip, limit } }),
};

export default api;
