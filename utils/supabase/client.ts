import { createBrowserClient } from "@supabase/ssr";

// Gunakan file ini di semua komponen "use client".
// createBrowserClient menyimpan sesi di cookie sehingga
// middleware dapat membaca dan memperbarui sesi di setiap request.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
