import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Menggabungkan class Tailwind tanpa konflik (dipakai semua komponen shadcn).
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// "2026-10-18" -> "18 Okt 2026"
export function formatDate(dateString) {
  if (!dateString) return "-";
  return new Date(`${dateString}T00:00:00`).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatNumber(value) {
  return Number(value).toLocaleString("id-ID");
}

export function todayString() {
  return new Date().toISOString().slice(0, 10);
}
