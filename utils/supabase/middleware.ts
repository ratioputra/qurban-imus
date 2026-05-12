import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Memperbarui cookie sesi Supabase di setiap request.
 *
 * Wajib dipanggil dari middleware root agar:
 * 1. Token yang expired di-refresh secara otomatis.
 * 2. Cookie sesi terbaru ditulis kembali ke response sehingga
 *    browser dan server components selalu membaca sesi yang valid.
 *
 * PENTING: Jangan letakkan logika apapun antara createServerClient
 * dan getUser() — ini memastikan refresh token berjalan dengan benar.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Tulis ke request agar server components bisa membacanya
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          // Buat ulang response dengan request yang sudah diperbarui
          supabaseResponse = NextResponse.next({ request });
          // Tulis ke response agar browser menyimpan cookie terbaru
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // getUser() memvalidasi token ke Supabase Auth server dan
  // memicu refresh jika token sudah expired
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { supabaseResponse, user };
}
