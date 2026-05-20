import { Sidebar } from "@/components/Sidebar";

// Layout untuk semua halaman aplikasi (kecuali /login).
// Menambahkan Sidebar dan header di atas konten halaman.
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-screen flex flex-col md:flex-row overflow-hidden">
      <Sidebar />

      <main className="flex-1 flex flex-col min-h-0 min-w-0 overflow-y-auto">
        <header className="hidden md:flex h-16 border-b border-slate-200 bg-white items-center px-8 shrink-0 sticky top-0 z-10">
          <div className="text-sm font-medium text-slate-500">
            Sistem Informasi Qurban
          </div>
        </header>

        <div className="flex-1 p-4 sm:p-6 md:p-8 bg-white min-w-0">{children}</div>
      </main>
    </div>
  );
}
