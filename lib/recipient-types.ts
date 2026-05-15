/** Kategori jenis penerima distribusi (OUT). */
export const RECIPIENT_TYPES = [
  "Mudhohi",
  "Asatidz",
  "Kupon",
  "Masyarakat",
] as const;

export type RecipientType = (typeof RECIPIENT_TYPES)[number];

/** Opsi filter (termasuk Semua) untuk riwayat & laporan. */
export const RECIPIENT_FILTER_OPTIONS = [
  "Semua",
  ...RECIPIENT_TYPES,
] as const;

/** Kategori yang memakai input nama penerima manual (bukan dropdown entitas). */
export const MANUAL_NAME_RECIPIENTS = ["Kupon", "Masyarakat"] as const;

/** Kategori untuk statistik dashboard (distribusi non-Mudhohi/Asatidz). */
export const DASHBOARD_OTHER_RECIPIENT_TYPES = [
  "Kupon",
  "Masyarakat",
] as const;

/** Kelas Tailwind badge per kategori (termasuk legacy & Internal). */
export const RECIPIENT_BADGE_STYLES: Record<string, string> = {
  Mudhohi: "bg-purple-100 text-purple-800 border-purple-200",
  Asatidz: "bg-blue-100 text-blue-800 border-blue-200",
  Kupon: "bg-amber-100 text-amber-800 border-amber-200",
  Masyarakat: "bg-slate-100 text-slate-700 border-slate-200",
  Internal: "bg-green-100 text-green-800 border-green-200",
  // Data lama di database (tetap ditampilkan jika ada)
  Guru: "bg-teal-100 text-teal-800 border-teal-200",
  Panitia: "bg-amber-100 text-amber-800 border-amber-200",
};

export function recipientBadgeClass(type: string | null): string {
  const label = type ?? "-";
  return (
    RECIPIENT_BADGE_STYLES[label] ??
    "bg-slate-100 text-slate-700 border-slate-200"
  );
}
