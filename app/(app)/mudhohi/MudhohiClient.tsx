"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2 } from "lucide-react";
import { deleteMudhohi, type MudhohiRow } from "./actions";
import { MudhohiFormDialog } from "./MudhohiFormDialog";

export function MudhohiClient({
  initialData,
  packages,
}: {
  initialData: MudhohiRow[];
  packages: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editItem, setEditItem] = useState<MudhohiRow | null>(null);

  const handleEdit = (item: MudhohiRow) => {
    setEditItem(item);
    setOpen(true);
  };

  const handleOpenChange = (val: boolean) => {
    setOpen(val);
    if (!val) setEditItem(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus data ini?")) return;

    setIsLoading(true);
    const res = await deleteMudhohi(id);
    setIsLoading(false);

    if (res.success) {
      toast.success("Data berhasil dihapus");
      router.refresh();
    } else {
      toast.error(res.error || "Gagal menghapus data");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
          onClick={() => {
            setEditItem(null);
            setOpen(true);
          }}
        >
          <Plus size={18} />
          Tambah Mudhohi
        </Button>
        <MudhohiFormDialog
          packages={packages}
          open={open}
          onOpenChange={handleOpenChange}
          showTrigger={false}
          editItem={editItem}
        />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-200">
                <th className="px-6 py-3 font-medium">Nama</th>
                <th className="px-6 py-3 font-medium">Asal</th>
                <th className="px-6 py-3 font-medium">Nomor HP</th>
                <th className="px-6 py-3 font-medium">Paket</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {initialData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    Belum ada data mudhohi.
                  </td>
                </tr>
              ) : (
                initialData.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {item.name}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {item.asal || "-"}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {item.phone || "-"}
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-medium">
                      {item.packages?.name ?? "-"}
                    </td>
                    <td className="px-6 py-4">
                      {item.status_distribusi ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                          Sudah Terdistribusi
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                          Belum
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(item)}
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      >
                        <Edit size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(item.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        disabled={item.status_distribusi || isLoading}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
