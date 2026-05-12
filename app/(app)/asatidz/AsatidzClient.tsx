"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Edit, Trash2 } from "lucide-react";
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
import { createAsatidz, updateAsatidz, deleteAsatidz, type Asatidz } from "./actions";

type FormState = {
  name: string;
  asal: string;
  ponpes: string;
};

const EMPTY_FORM: FormState = { name: "", asal: "", ponpes: "" };

export function AsatidzClient({ initialData }: { initialData: Asatidz[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  const setField = (key: keyof FormState, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const resetForm = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
  };

  const handleEdit = (item: Asatidz) => {
    setEditingId(item.id);
    setForm({
      name: item.name,
      asal: item.asal ?? "",
      ponpes: item.ponpes ?? "",
    });
    setOpen(true);
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Hapus data "${name}"? Tindakan ini tidak bisa dibatalkan.`)) return;
    setIsLoading(true);
    const res = await deleteAsatidz(id);
    setIsLoading(false);
    if (res.success) {
      toast.success("Data berhasil dihapus");
      router.refresh();
    } else {
      toast.error(res.error || "Gagal menghapus data");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Nama wajib diisi");
      return;
    }

    const payload = {
      name: form.name.trim(),
      asal: form.asal.trim() || null,
      ponpes: form.ponpes.trim() || null,
    };

    setIsLoading(true);
    const res = editingId
      ? await updateAsatidz(editingId, payload)
      : await createAsatidz(payload);
    setIsLoading(false);

    if (res.success) {
      toast.success(editingId ? "Data berhasil diperbarui" : "Data berhasil ditambahkan");
      setOpen(false);
      resetForm();
      router.refresh();
    } else {
      toast.error(res.error || "Gagal menyimpan data");
    }
  };

  return (
    <div className="space-y-4">
      {/* ── Tombol Tambah ── */}
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
                Tambah Asatidz
              </Button>
            }
          />

          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {editingId ? "Edit Data Asatidz" : "Tambah Asatidz Baru"}
              </DialogTitle>
              <DialogDescription>
                Masukkan data ustadz / ustadzah penerima distribusi qurban.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-5 mt-2">
              <div className="space-y-2">
                <Label htmlFor="ast-name">Nama Lengkap</Label>
                <Input
                  id="ast-name"
                  placeholder="Contoh: Ust. Ahmad Fauzi"
                  value={form.name}
                  onChange={(e) => setField("name", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ast-asal">Asal / Kota</Label>
                <Input
                  id="ast-asal"
                  placeholder="Contoh: Bandung"
                  value={form.asal}
                  onChange={(e) => setField("asal", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ast-ponpes">Nama Ponpes</Label>
                <Input
                  id="ast-ponpes"
                  placeholder="Contoh: PP. Al-Hidayah"
                  value={form.ponpes}
                  onChange={(e) => setField("ponpes", e.target.value)}
                />
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

      {/* ── Tabel ── */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-200">
                <th className="px-6 py-3 font-medium">Nama</th>
                <th className="px-6 py-3 font-medium">Asal / Kota</th>
                <th className="px-6 py-3 font-medium">Nama Ponpes</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {initialData.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-slate-500">
                    Belum ada data asatidz. Klik &quot;Tambah Asatidz&quot; untuk memulai.
                  </td>
                </tr>
              ) : (
                initialData.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">{item.name}</td>
                    <td className="px-6 py-4 text-slate-600">{item.asal ?? "-"}</td>
                    <td className="px-6 py-4 text-slate-600">{item.ponpes ?? "-"}</td>
                    <td className="px-6 py-4">
                      {item.status_distribusi ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                          Sudah Ambil
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                          Belum Ambil
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(item)}
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(item.id, item.name)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          disabled={isLoading}
                          title="Hapus"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
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
