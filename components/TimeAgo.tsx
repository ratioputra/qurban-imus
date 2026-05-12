"use client";

import { useState, useEffect } from "react";

function calcTimeAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return `${diff} detik lalu`;
  if (diff < 3600) return `${Math.floor(diff / 60)} menit lalu`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`;
  return `${Math.floor(diff / 86400)} hari lalu`;
}

/**
 * Merender waktu relatif (misal "3 menit lalu") hanya di sisi client.
 * Ini mencegah Hydration Error #418 yang terjadi karena Date.now()
 * menghasilkan nilai berbeda antara server render dan client hydration.
 */
export function TimeAgo({ iso }: { iso: string }) {
  const [label, setLabel] = useState<string>("");

  useEffect(() => {
    // Set nilai awal setelah mount (client-only)
    setLabel(calcTimeAgo(iso));

    // Update setiap 30 detik agar tetap akurat
    const interval = setInterval(() => {
      setLabel(calcTimeAgo(iso));
    }, 30_000);

    return () => clearInterval(interval);
  }, [iso]);

  // Render kosong saat SSR — diisi setelah hydration selesai
  if (!label) return <span className="text-xs text-slate-400">-</span>;

  return <span className="text-xs text-slate-400">{label}</span>;
}
