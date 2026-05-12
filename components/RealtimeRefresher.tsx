"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

const WATCHED_TABLES = ["transactions", "inventory", "mudhohi", "packages"] as const;

/**
 * Berlangganan semua event ('*') pada tabel yang dipantau.
 * Setiap perubahan memicu router.refresh() agar Server Component
 * mengambil data terbaru tanpa reload halaman penuh.
 */
export function RealtimeRefresher() {
  const router = useRouter();
  const routerRef = useRef(router);

  useEffect(() => {
    routerRef.current = router;
  });

  useEffect(() => {
    const supabase = createClient();
    const refresh = () => routerRef.current.refresh();

    let channel = supabase.channel("app-realtime", {
      config: { broadcast: { self: true } },
    });

    // Daftarkan wildcard event '*' untuk setiap tabel sekaligus
    for (const table of WATCHED_TABLES) {
      channel = channel.on(
        "postgres_changes",
        { event: "*", schema: "public", table },
        (payload) => {
          console.log(`[Realtime] ${table} → ${payload.eventType}`, payload);
          refresh();
        }
      );
    }

    channel.subscribe((status, err) => {
      if (err) {
        console.error("[Realtime] subscription error:", err);
      } else {
        console.log("[Realtime] status:", status);
      }
    });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
}
