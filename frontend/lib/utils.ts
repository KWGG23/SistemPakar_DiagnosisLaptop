import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCF(cf: number): string {
  return `${Math.round(cf * 100)}%`;
}

export function getCFLabel(cf: number): string {
  if (cf >= 0.8) return "Sangat Mungkin";
  if (cf >= 0.6) return "Mungkin";
  if (cf >= 0.4) return "Cukup Mungkin";
  return "Kemungkinan Kecil";
}

export function getCFColor(cf: number): string {
  if (cf >= 0.8) return "bg-red-500";
  if (cf >= 0.6) return "bg-orange-500";
  if (cf >= 0.4) return "bg-yellow-500";
  return "bg-blue-500";
}
