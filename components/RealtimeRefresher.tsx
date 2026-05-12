"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

/**
 * Komponen ini tidak merender UI apapun.
 * Tugasnya hanya berlangganan perubahan realtime dari Supabase
 * dan memanggil router.refresh() agar Server Component di atasnya
 * mengambil data terbaru tanpa reload halaman penuh.
 *
 * router disimpan di ref agar useEffect tidak re-run setiap render,
 * yang akan menyebabkan channel dibuat ulang terus-menerus.
 */
export function RealtimeRefresher() {
  const router = useRouter();
  const routerRef = useRef(router);

  // Selalu update ref ke nilai router terbaru tanpa memicu re-run effect
  useEffect(() => {
    routerRef.current = router;
  });

  useEffect(() => {
    const supabase = createClient();
    const refresh = () => routerRef.current.refresh();

    const channel = supabase
      .channel("app-realtime", {
        config: { broadcast: { self: true } },
      })
      // ── tabel transactions ──────────────────────────────────────
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "transactions" }, refresh)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "transactions" }, refresh)
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "transactions" }, refresh)
      // ── tabel inventory ─────────────────────────────────────────
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "inventory" }, refresh)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "inventory" }, refresh)
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "inventory" }, refresh)
      // ── tabel mudhohi ────────────────────────────────────────────
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "mudhohi" }, refresh)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "mudhohi" }, refresh)
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "mudhohi" }, refresh)
      // ── tabel packages ───────────────────────────────────────────
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "packages" }, refresh)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "packages" }, refresh)
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "packages" }, refresh)
      .subscribe((status, err) => {
        if (err) {
          console.error("[Realtime] subscription error:", err);
        } else {
          console.log("[Realtime] status:", status);
        }
      });

    // Cleanup: batalkan subscription saat komponen unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  // dependency array kosong — channel hanya dibuat sekali saat mount

  return null;
}
