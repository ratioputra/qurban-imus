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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createPaket, updatePaket, deletePaket, type Paket } from "./actions";

const MEAT_TYPES = ["Sapi", "Kambing", "Hati + Sampil"] as const;

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
}

function MeatTypeBadge({ type }: { type: string }) {
  const styles: Record<string, string> = {
    Sapi: "bg-amber-100 text-amber-800 border-amber-200",
    Kambing: "bg-green-100 text-green-800 border-green-200",
    "Hati + Sampil": "bg-red-100 text-red-800 border-red-200",
  };
  const cls = styles[type] ?? "bg-slate-100 text-slate-700 border-slate-200";
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${cls}`}>
      {type}
    </span>
  );
}

function RincianJatah({ paket }: { paket: Paket }) {
  const part1 = `${paket.part_1_qty}x ${paket.part_1_name}`;
  const part2 =
    paket.part_2_name && paket.part_2_qty
      ? `${paket.part_2_qty}x ${paket.part_2_name}`
      : null;
  return (
    <span className="text-slate-700">
      {part1}
      {part2 && (
        <>
          <span className="mx-1.5 text-slate-400">+</span>
          {part2}
        </>
      )}
    </span>
  );
}

type FormState = {
  name: string;
  price: string;
  meat_type: string;
  part_1_name: string;
  part_1_qty: string;
  part_2_name: string;
  part_2_qty: string;
};

const EMPTY_FORM: FormState = {
  name: "", price: "", meat_type: "",
  part_1_name: "", part_1_qty: "",
  part_2_name: "", part_2_qty: "",
};

export function PaketClient({ initialData }: { initialData: Paket[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  // Selalu urutkan berdasarkan sort_order di sisi klien agar posisi tidak
  // melompat-lompat saat data diperbarui via realtime atau router.refresh()
  const sortedData = [...initialData].sort(
    (a, b) => ((a as any).sort_order ?? 0) - ((b as any).sort_order ?? 0)
  );

  const setField = (key: keyof FormState, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const resetForm = () => { setEditingId(null); setForm(EMPTY_FORM); };

  const handleEdit = (item: Paket) => {
    setEditingId(item.id);
    setForm({
      name: item.name,
      price: item.price.toString(),
      meat_type: item.meat_type,
      part_1_name: item.part_1_name,
      part_1_qty: item.part_1_qty.toString(),
      part_2_name: item.part_2_name ?? "",
      part_2_qty: item.part_2_qty?.toString() ?? "",
    });
    setOpen(true);
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Hapus paket "${name}"? Tindakan ini tidak bisa dibatalkan.`)) return;
    setIsLoading(true);
    const res = await deletePaket(id);
    setIsLoading(false);
    if (res.success) {
      toast.success("Paket berhasil dihapus");
      router.refresh();
    } else {
      toast.error(res.error || "Gagal menghapus paket");
    }
  };

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.meat_type || !form.part_1_name || !form.part_1_qty) {
      toast.error("Nama, harga, jenis daging, dan jatah bagian 1 wajib diisi");
      return;
    }

    const payload = {
      name: form.name.trim(),
      price: Number(form.price),
      meat_type: form.meat_type,
      part_1_name: form.part_1_name.trim(),
      part_1_qty: Number(form.part_1_qty),
      part_2_name: form.part_2_name.trim() || null,
      part_2_qty: form.part_2_qty ? Number(form.part_2_qty) : null,
    };

    setIsLoading(true);
    const res = editingId ? await updatePaket(editingId, payload) : await createPaket(payload);
    setIsLoading(false);

    if (res.success) {
      toast.success(editingId ? "Paket berhasil diperbarui" : "Paket berhasil ditambahkan");
      setOpen(false);
      resetForm();
      router.refresh();
    } else {
      toast.error(res.error || "Gagal menyimpan paket");
    }
  };

  return (
    <div className="space-y-4">
      {/* ── Tombol Tambah ── */}
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={(val) => { setOpen(val); if (!val) resetForm(); }}>
          <DialogTrigger
            render={
              <Button className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2">
                <Plus size={18} />
                Tambah Paket Baru
              </Button>
            }
          />

          <DialogContent className="sm:max-w-[540px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Paket" : "Tambah Paket Baru"}</DialogTitle>
              <DialogDescription>
                Isi detail paket hewan kurban beserta rincian jatah dagingnya.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-5 mt-2">
              {/* Nama Paket */}
              <div className="space-y-2">
                <Label htmlFor="pkg-name">Nama Paket</Label>
                <Input
                  id="pkg-name"
                  placeholder="Contoh: Sapi Paket A"
                  value={form.name}
                  onChange={(e) => setField("name", e.target.value)}
                  required
                />
              </div>

              {/* Harga */}
              <div className="space-y-2">
                <Label htmlFor="pkg-price">Harga (Rp)</Label>
                <Input
                  id="pkg-price"
                  type="number"
                  min="0"
                  placeholder="Contoh: 3000000"
                  value={form.price}
                  onChange={(e) => setField("price", e.target.value)}
                  required
                />
                {form.price && Number(form.price) > 0 && (
                  <p className="text-xs text-slate-500">{formatRupiah(Number(form.price))}</p>
                )}
              </div>

              {/* Jenis Daging Utama */}
              <div className="space-y-2">
                <Label htmlFor="pkg-meat">Jenis Daging Utama</Label>
                <Select value={form.meat_type}onValueChange={(v) => setField("meat_type", v ?? '')}
>
                  <SelectTrigger id="pkg-meat">
                    <SelectValue placeholder="Pilih jenis daging..." />
                  </SelectTrigger>
                  <SelectContent>
                    {MEAT_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Jatah Bagian 1 */}
              <div className="space-y-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
                <p className="text-sm font-semibold text-slate-700">Jatah Bagian 1</p>
                <div className="space-y-2">
                  <Label htmlFor="p1-name">Nama Bagian</Label>
                  <Input
                    id="p1-name"
                    placeholder="Contoh: Daging Sapi"
                    value={form.part_1_name}
                    onChange={(e) => setField("part_1_name", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="p1-qty">Jumlah</Label>
                  <Input
                    id="p1-qty"
                    type="number"
                    min="1"
                    placeholder="Contoh: 8"
                    value={form.part_1_qty}
                    onChange={(e) => setField("part_1_qty", e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Jatah Bagian 2 */}
              <div className="space-y-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
                <p className="text-sm font-semibold text-slate-700">
                  Jatah Bagian 2{" "}
                  <span className="font-normal text-slate-400">(opsional)</span>
                </p>
                <div className="space-y-2">
                  <Label htmlFor="p2-name">Nama Bagian</Label>
                  <Input
                    id="p2-name"
                    placeholder="Contoh: Hati + Sampil"
                    value={form.part_2_name}
                    onChange={(e) => setField("part_2_name", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="p2-qty">Jumlah</Label>
                  <Input
                    id="p2-qty"
                    type="number"
                    min="1"
                    placeholder="Contoh: 1"
                    value={form.part_2_qty}
                    onChange={(e) => setField("part_2_qty", e.target.value)}
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                disabled={isLoading}
              >
                {isLoading ? "Menyimpan..." : "Simpan Paket"}
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
                <th className="px-6 py-3 font-medium">Nama Paket</th>
                <th className="px-6 py-3 font-medium">Harga</th>
                <th className="px-6 py-3 font-medium">Jenis Daging</th>
                <th className="px-6 py-3 font-medium">Rincian Jatah</th>
                <th className="px-6 py-3 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {sortedData.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-slate-500">
                    Belum ada data paket. Klik &quot;Tambah Paket Baru&quot; untuk memulai.
                  </td>
                </tr>
              ) : (
                sortedData.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-900">{item.name}</td>
                    <td className="px-6 py-4 text-slate-700 font-medium whitespace-nowrap">
                      {formatRupiah(item.price)}
                    </td>
                    <td className="px-6 py-4">
                      <MeatTypeBadge type={item.meat_type} />
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <RincianJatah paket={item} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(item)}
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          title="Edit paket"
                        >
                          <Edit size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(item.id, item.name)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          disabled={isLoading}
                          title="Hapus paket"
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
