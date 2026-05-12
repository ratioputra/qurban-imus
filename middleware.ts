import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Lewati pengecekan untuk halaman login dan aset statis
  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  const { supabaseResponse, user } = await updateSession(request);

  // Belum login → redirect ke /login
  if (!user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    return NextResponse.redirect(loginUrl);
  }

  // Kembalikan response yang sudah berisi cookie sesi terbaru
  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Jalankan middleware di semua path kecuali:
     * - _next/static  (file statis Next.js)
     * - _next/image   (optimisasi gambar)
     * - favicon.ico
     * - file dengan ekstensi statis (gambar, font, dll.)
     */
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?)$).*)",
  ],
};
