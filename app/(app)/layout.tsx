import { Sidebar } from "@/components/Sidebar";

// Layout untuk semua halaman aplikasi (kecuali /login).
// Menambahkan Sidebar dan header di atas konten halaman.
export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-full flex flex-col md:flex-row">
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-h-screen max-w-full overflow-x-hidden">
        {/* Top Header (Desktop only) */}
        <header className="hidden md:flex h-16 border-b border-slate-200 bg-white items-center px-8 shrink-0 sticky top-0 z-10">
          <div className="text-sm font-medium text-slate-500">
            Sistem Informasi Qurban
          </div>
        </header>

        <div className="flex-1 p-4 md:p-8 bg-white">
          {children}
        </div>
      </main>
    </div>
  );
}
