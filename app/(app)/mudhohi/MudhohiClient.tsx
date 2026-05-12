"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Edit, Trash2 } from "lucide-react";
import { createMudhohi, updateMudhohi, deleteMudhohi, type MudhohiRow } from "./actions";

export function MudhohiClient({ initialData, packages }: { initialData: MudhohiRow[], packages: { id: string; name: string }[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [asal, setAsal] = useState("");
  const [phone, setPhone] = useState("");
  const [packageId, setPackageId] = useState("");

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setAsal("");
    setPhone("");
    setPackageId("");
  };

  const handleEdit = (item: MudhohiRow) => {
    setEditingId(item.id);
    setName(item.name);
    setAsal(item.asal || "");
    setPhone(item.phone || "");
    setPackageId(item.package_id ?? "");  // sudah string UUID, tidak perlu toString()
    setOpen(true);
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

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Nama wajib diisi");
      return;
    }
    if (!packageId) {
      toast.error("Paket wajib dipilih");
      return;
    }

    // Kirim packageId sebagai string — jangan konversi ke Number
    // agar tidak jadi NaN jika database menggunakan UUID
    const pkgId = packageId;

    setIsLoading(true);
    let res;
    if (editingId) {
      res = await updateMudhohi(editingId, { name: name.trim(), asal, phone, package_id: pkgId });
    } else {
      res = await createMudhohi({ name: name.trim(), asal, phone, package_id: pkgId });
    }
    setIsLoading(false);

    if (res.success) {
      toast.success(editingId ? "Data berhasil diupdate" : "Data berhasil ditambahkan");
      setOpen(false);
      resetForm();
      router.refresh();
    } else {
      toast.error(res.error || "Gagal menyimpan data");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog
          open={open}
          onOpenChange={(val) => {
            setOpen(val);
            if (!val) resetForm();
          }}
        >
          <DialogTrigger
            render={
              <Button className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2">
                <Plus size={18} />
                Tambah Mudhohi
              </Button>
            }
          />

          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {editingId ? "Edit Data Mudhohi" : "Tambah Mudhohi Baru"}
              </DialogTitle>
              <DialogDescription>
                Masukkan data peserta qurban beserta pilihan paketnya.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4 mt-2">
              <div className="space-y-2">
                <Label>Nama Lengkap</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Asal / Alamat</Label>
                <Input value={asal} onChange={(e) => setAsal(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Nomor HP</Label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Pilih Paket</Label>
                <Select value={packageId} onValueChange={(val) => { if (val) setPackageId(val); }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih paket..." />
                  </SelectTrigger>
                  <SelectContent>
                    {packages.map((pkg) => (
                      <SelectItem key={pkg.id} value={pkg.id}>
                        {pkg.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                disabled={isLoading}
              >
                {isLoading ? "Menyimpan..." : "Simpan Data"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
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
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">{item.name}</td>
                    <td className="px-6 py-4 text-slate-600">{item.asal || "-"}</td>
                    <td className="px-6 py-4 text-slate-600">{item.phone || "-"}</td>
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
                        disabled={item.status_distribusi}
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
