"use client";

import { useState } from "react";
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
import { submitProduksi } from "./actions";
import { Plus } from "lucide-react";

export function ProduksiFormSheet() {
  const [open, setOpen] = useState(false);
  const [meatType, setMeatType] = useState<'Sapi' | 'Kambing' | 'Hati + Sampil' | ''>('');
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const resetForm = () => {
    setMeatType('');
    setAmount('');
  };

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!meatType) {
      toast.error("Pilih jenis daging terlebih dahulu");
      return;
    }
    if (!amount || Number(amount) <= 0) {
      toast.error("Jumlah tidak valid");
      return;
    }

    setIsLoading(true);
    const res = await submitProduksi({
      meat_type: meatType as any,
      amount: Number(amount),
    });
    setIsLoading(false);

    if (res.success) {
      toast.success("Data produksi berhasil disimpan");
      setOpen(false);
      resetForm();
    } else {
      toast.error(res.error || "Gagal menyimpan data");
    }
  };

  const getLabel = () => {
    if (meatType === 'Hati + Sampil') return 'Jumlah Pcs';
    return 'Jumlah Kresek Kecil (0.5kg)';
  };

  return (
    <Dialog open={open} onOpenChange={(val) => { setOpen(val); if (!val) resetForm(); }}>
      <DialogTrigger
        render={
          <Button className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2">
            <Plus size={18} />
            Input Hasil Produksi
          </Button>
        }
      />
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Input Produksi Baru</DialogTitle>
          <DialogDescription>
            Masukkan data hasil pemotongan daging ke dalam stok.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 mt-2">
          <div className="space-y-2">
            <Label>Jenis Daging</Label>
            <Select
              value={meatType}
              onValueChange={(val: any) => setMeatType(val)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih jenis daging" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Sapi">Sapi</SelectItem>
                <SelectItem value="Kambing">Kambing</SelectItem>
                <SelectItem value="Hati + Sampil">Hati + Sampil</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{getLabel()}</Label>
            <Input
              type="number"
              min="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Masukkan jumlah..."
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white"
            disabled={isLoading}
          >
            {isLoading ? "Menyimpan..." : "Simpan Data"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
