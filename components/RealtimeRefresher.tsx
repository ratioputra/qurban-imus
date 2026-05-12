"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

/**
 * Komponen ini tidak merender UI apapun.
 * Tugasnya hanya berlangganan perubahan realtime dari Supabase
 * dan memanggil router.refresh() agar Server Component di atasnya
 * mengambil data terbaru tanpa reload halaman penuh.
 */
export function RealtimeRefresher() {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel("dashboard-realtime")
      // ── tabel transactions ──────────────────────────────────────
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "transactions" },
        () => router.refresh()
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "transactions" },
        () => router.refresh()
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "transactions" },
        () => router.refresh()
      )
      // ── tabel inventory ─────────────────────────────────────────
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "inventory" },
        () => router.refresh()
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "inventory" },
        () => router.refresh()
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "inventory" },
        () => router.refresh()
      )
      // ── tabel mudhohi ────────────────────────────────────────────
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "mudhohi" },
        () => router.refresh()
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "mudhohi" },
        () => router.refresh()
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "mudhohi" },
        () => router.refresh()
      )
      // ── tabel packages ───────────────────────────────────────────
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "packages" },
        () => router.refresh()
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "packages" },
        () => router.refresh()
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "packages" },
        () => router.refresh()
      )
      .subscribe();

    // Cleanup: batalkan subscription saat komponen unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [router]);

  return null;
}
