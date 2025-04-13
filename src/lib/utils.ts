import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }
export function formatDate(date: Date | string | number | null | undefined): string { if (!date) return "-"; try { const d = new Date(date); if (isNaN(d.getTime())) return "-"; const day = d.getDate().toString().padStart(2, "0"); const month = (d.getMonth() + 1).toString().padStart(2, "0"); const year = d.getFullYear(); return `${day}/${month}/${year}`; } catch (error) { console.error("Error formatting date:", error); return "-"; } }
