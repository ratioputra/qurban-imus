"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AlertTriangle } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function ResetDatabase() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.rpc("reset_all_data");
    setLoading(false);

    if (error) {
      toast.error(error.message || "Gagal menghapus data");
      return;
    }

    toast.success("Seluruh data berhasil dibersihkan!");
    setOpen(false);
    router.refresh();
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !loading && setOpen(val)}>
      <DialogTrigger
        render={
          <Button variant="destructive" type="button">
            Reset Semua Data
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md" showCloseButton={!loading}>
        <DialogHeader>
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-full bg-red-50 text-red-600 shrink-0">
              <AlertTriangle size={20} />
            </div>
            <div className="space-y-1">
              <DialogTitle>Hapus Seluruh Data Qurban?</DialogTitle>
              <DialogDescription>
                Apakah Anda yakin ingin menghapus seluruh data transaksi,
                mudhohi, dan asatidz? Aksi ini tidak dapat dibatalkan.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <DialogFooter className="mt-2">
          <Button
            type="button"
            variant="outline"
            disabled={loading}
            onClick={() => setOpen(false)}
          >
            Batal
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={loading}
            onClick={handleReset}
          >
            {loading ? "Menghapus..." : "Ya, Hapus Semua Data"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
