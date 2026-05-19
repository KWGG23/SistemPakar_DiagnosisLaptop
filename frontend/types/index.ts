export interface Gejala {
  id: string;
  kode: string;
  pertanyaan: string;
  kategori: string;
}

export interface Kerusakan {
  id: string;
  kode: string;
  nama: string;
  deskripsi: string;
  solusi: string;
  kategori: string;
}

export interface Rule {
  id: string;
  gejala_id: string;
  kerusakan_id: string;
  cf_pakar: number;
  gejala_kode?: string;
  gejala_pertanyaan?: string;
  kerusakan_kode?: string;
  kerusakan_nama?: string;
}

export interface GejalaInput {
  gejala_id: string;
  cf_user: number;
}

export interface DiagnosisItem {
  kerusakan_id: string;
  kode: string;
  nama: string;
  deskripsi: string;
  solusi: string;
  kategori: string;
  cf_total: number;
}

export interface DiagnoseResponse {
  session_id: string;
  hasil: DiagnosisItem[];
  total_gejala: number;
}

export interface HistoryItem {
  id: string;
  session_id: string;
  gejala_dipilih: GejalaInput[];
  hasil: DiagnosisItem[];
  created_at: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  is_admin: boolean;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export const CF_USER_VALUES = {
  ya: 1.0,
  mungkin: 0.6,
  tidak_tahu: 0.0,
  tidak: -1.0,
} as const;

export type CFUserKey = keyof typeof CF_USER_VALUES;

export const KATEGORI_LABELS: Record<string, string> = {
  power: "Daya / Power",
  baterai: "Baterai",
  display: "Layar / Display",
  overheating: "Overheat",
  storage: "Penyimpanan",
  keyboard: "Keyboard & Touchpad",
  audio: "Audio / Suara",
  konektivitas: "Konektivitas",
  port: "Port & Konektor",
  ram: "RAM / Memori",
  motherboard: "Motherboard",
  cpu: "Prosesor (CPU)",
  gpu: "Kartu Grafis (GPU)",
};
