import { Sidebar } from "@/components/Sidebar";

// Layout untuk semua halaman aplikasi (kecuali /login).
// Menambahkan Sidebar dan header di atas konten halaman.
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    // 1. Ubah min-h-full jadi h-screen agar pembungkus mengikuti tinggi layar
    <div className="h-screen flex flex-row overflow-hidden">
      {/* Sidebar akan tetap di kiri dan tidak akan ikut scroll */}
      <Sidebar />

      {/* 2. Main Content Area harus memiliki overflow-y-auto sendiri */}
      <main className="flex-1 flex flex-col h-full overflow-y-auto">
        {/* Top Header (Desktop only) */}
        <header className="flex h-16 border-b border-slate-200 bg-white items-center px-8 shrink-0 sticky top-0 z-10">
          <div className="text-sm font-medium text-slate-500">
            Sistem Informasi Qurban
          </div>
        </header>

        <div className="flex-1 p-4 md:p-8 bg-white">{children}</div>
      </main>
    </div>
  );
}
