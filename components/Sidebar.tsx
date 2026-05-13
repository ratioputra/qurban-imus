"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Factory, 
  Truck, 
  Users, 
  PackageIcon, 
  FileText,
  Menu,
  LogOut,
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import { createClient } from "@/utils/supabase/client";

const navItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Produksi (Input)", href: "/produksi", icon: Factory },
  { name: "Distribusi (Output)", href: "/distribusi", icon: Truck },
  { name: "Mudhohi", href: "/mudhohi", icon: Users },
  { name: "Asatidz", href: "/asatidz", icon: Users },
  { name: "Paket Hewan", href: "/paket", icon: PackageIcon },
  { name: "Laporan", href: "/laporan", icon: FileText },
];

export function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Gagal logout: " + error.message);
      return;
    }
    toast.success("Berhasil logout");
    window.location.href = "/login";
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-slate-900 text-white">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-blue-400">Qurban Imus</h1>
      </div>
      <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          // Simple active state check
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link 
              key={item.href} 
              href={item.href}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive 
                  ? "bg-blue-600 text-white" 
                  : "text-slate-300 hover:bg-slate-800 hover:text-blue-400"
              }`}
            >
              <Icon size={20} />
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div className="px-4 py-4 border-t border-slate-700">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-red-400 transition-colors"
        >
          <LogOut size={20} />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col min-h-screen shrink-0 sticky top-0 bg-slate-900 z-20">
        <SidebarContent />
      </aside>

      {/* Mobile Header & Hamburger Menu */}
      <div className="md:hidden flex items-center justify-between p-4 bg-slate-900 text-white sticky top-0 z-20 w-full shadow-md">
        <h1 className="text-xl font-bold text-white">Qurban Imus</h1>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger>
            <Button variant="ghost" size="icon" className="text-white hover:bg-slate-800">
              <Menu size={24} />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 bg-slate-900 border-r-slate-800 w-64">
            <SheetHeader className="sr-only">
              <SheetTitle>Menu Navigasi</SheetTitle>
              <SheetDescription>Pilih menu navigasi aplikasi qurban</SheetDescription>
            </SheetHeader>
            <SidebarContent />
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
