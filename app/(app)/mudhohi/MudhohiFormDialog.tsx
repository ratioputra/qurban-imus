"use client";

import { useEffect, useState } from "react";
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
import { Plus } from "lucide-react";
import {
  createMudhohi,
  updateMudhohi,
  type MudhohiRow,
} from "./actions";

type PackageOption = { id: string; name: string };

type MudhohiFormDialogProps = {
  packages: PackageOption[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  showTrigger?: boolean;
  editItem?: MudhohiRow | null;
  onSuccess?: () => void;
};

export function MudhohiFormDialog({
  packages,
  open,
  onOpenChange,
  showTrigger = true,
  editItem = null,
  onSuccess,
}: MudhohiFormDialogProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState("");
  const [asal, setAsal] = useState("");
  const [phone, setPhone] = useState("");
  const [packageId, setPackageId] = useState("");

  const editingId = editItem?.id ?? null;

  const resetForm = () => {
    setName("");
    setAsal("");
    setPhone("");
    setPackageId("");
  };

  useEffect(() => {
    if (!open) return;
    if (editItem) {
      setName(editItem.name);
      setAsal(editItem.asal || "");
      setPhone(editItem.phone || "");
      setPackageId(editItem.package_id ?? "");
    } else {
      resetForm();
    }
  }, [open, editItem]);

  const handleOpenChange = (val: boolean) => {
    onOpenChange(val);
    if (!val) resetForm();
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

    setIsLoading(true);
    let res;
    if (editingId) {
      res = await updateMudhohi(editingId, {
        name: name.trim(),
        asal,
        phone,
        package_id: packageId,
      });
    } else {
      res = await createMudhohi({
        name: name.trim(),
        asal,
        phone,
        package_id: packageId,
      });
    }
    setIsLoading(false);

    if (res.success) {
      toast.success(
        editingId ? "Data berhasil diupdate" : "Data berhasil ditambahkan",
      );
      handleOpenChange(false);
      onSuccess?.();
      router.refresh();
    } else {
      toast.error(res.error || "Gagal menyimpan data");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {showTrigger && (
        <DialogTrigger
          render={
            <Button className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2">
              <Plus size={18} />
              Tambah Mudhohi
            </Button>
          }
        />
      )}

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
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
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
            <Select
              value={packageId}
              onValueChange={(val) => {
                if (val) setPackageId(val);
              }}
            >
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
  );
}
