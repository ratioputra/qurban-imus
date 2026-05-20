"use client";

import { useState } from "react";
import { Factory, Truck, UserPlus } from "lucide-react";
import { ProduksiFormSheet } from "@/app/(app)/produksi/ProduksiFormSheet";
import { DistribusiForm } from "@/app/(app)/distribusi/DistribusiForm";
import { MudhohiFormDialog } from "@/app/(app)/mudhohi/MudhohiFormDialog";

type PackageOption = { id: string; name: string };

export function DashboardQuickActions({ packages }: { packages: PackageOption[] }) {
  const [isProduksiOpen, setIsProduksiOpen] = useState(false);
  const [isDistribusiOpen, setIsDistribusiOpen] = useState(false);
  const [isMudhohiOpen, setIsMudhohiOpen] = useState(false);

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <button
          type="button"
          onClick={() => setIsProduksiOpen(true)}
          className="flex items-center gap-3 sm:gap-4 p-4 sm:p-5 bg-green-600 hover:bg-green-700 text-white rounded-xl shadow-sm transition-colors group text-left w-full"
        >
          <div className="p-3 bg-white/20 rounded-lg group-hover:bg-white/30 transition-colors shrink-0">
            <Factory size={24} />
          </div>
          <div>
            <p className="font-semibold text-base sm:text-lg">Input Produksi</p>
            <p className="text-green-100 text-sm">Catat daging masuk</p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setIsDistribusiOpen(true)}
          className="flex items-center gap-3 sm:gap-4 p-4 sm:p-5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl shadow-sm transition-colors group text-left w-full"
        >
          <div className="p-3 bg-white/20 rounded-lg group-hover:bg-white/30 transition-colors shrink-0">
            <Truck size={24} />
          </div>
          <div>
            <p className="font-semibold text-base sm:text-lg">Distribusi Daging</p>
            <p className="text-orange-100 text-sm">Catat daging keluar</p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setIsMudhohiOpen(true)}
          className="flex items-center gap-3 sm:gap-4 p-4 sm:p-5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm transition-colors group text-left w-full sm:col-span-2 lg:col-span-1"
        >
          <div className="p-3 bg-white/20 rounded-lg group-hover:bg-white/30 transition-colors shrink-0">
            <UserPlus size={24} />
          </div>
          <div>
            <p className="font-semibold text-base sm:text-lg">Tambah Mudhohi</p>
            <p className="text-blue-100 text-sm">Kelola peserta qurban</p>
          </div>
        </button>
      </div>

      <ProduksiFormSheet
        open={isProduksiOpen}
        onOpenChange={setIsProduksiOpen}
        showTrigger={false}
      />
      <DistribusiForm
        open={isDistribusiOpen}
        onOpenChange={setIsDistribusiOpen}
        showTrigger={false}
      />
      <MudhohiFormDialog
        packages={packages}
        open={isMudhohiOpen}
        onOpenChange={setIsMudhohiOpen}
        showTrigger={false}
      />
    </>
  );
}
