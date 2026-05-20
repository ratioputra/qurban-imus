"use client";

import { useState, useEffect } from "react";
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
import {
  submitDistribusi,
  getMudhohiList,
  getMudhohiJatah,
  getAsatidzList,
  type MudhohiJatah,
} from "./actions";
import {
  RECIPIENT_TYPES,
  MANUAL_NAME_RECIPIENTS,
  type RecipientType,
} from "@/lib/recipient-types";

const MEAT_TYPES = ["Sapi", "Kambing", "Hati + Sampil"] as const;
type MeatType = (typeof MEAT_TYPES)[number] | "";

type DistribusiFormProps = {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  showTrigger?: boolean;
  onSuccess?: () => void;
};

export function DistribusiForm({
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  showTrigger = true,
  onSuccess,
}: DistribusiFormProps = {}) {
  const router = useRouter();
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;

  const setOpen = (val: boolean) => {
    if (isControlled) {
      controlledOnOpenChange?.(val);
    } else {
      setInternalOpen(val);
    }
  };
  const [recipientType, setRecipientType] = useState<RecipientType | "">("");

  const [mudhohiId, setMudhohiId] = useState("");
  const [mudhohiList, setMudhohiList] = useState<{ id: string; name: string }[]>([]);
  const [mudhohiJatah, setMudhohiJatah] = useState<MudhohiJatah | null>(null);
  const [isFetchingJatah, setIsFetchingJatah] = useState(false);

  const [asatidzId, setAsatidzId] = useState("");
  const [asatidzList, setAsatidzList] = useState<{ id: string; name: string }[]>([]);

  const [recipientName, setRecipientName] = useState("");

  // Item daging pertama (wajib untuk non-Mudhohi)
  const [meatType1, setMeatType1] = useState<MeatType>("");
  const [amount1, setAmount1] = useState("");

  // Item daging kedua (opsional)
  const [showSecondItem, setShowSecondItem] = useState(false);
  const [meatType2, setMeatType2] = useState<MeatType>("");
  const [amount2, setAmount2] = useState("");

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open) {
      getMudhohiList().then((list) => setMudhohiList(list as { id: string; name: string }[]));
      getAsatidzList().then((list) => setAsatidzList(list as { id: string; name: string }[]));
    }
  }, [open]);

  useEffect(() => {
    if (recipientType === "Mudhohi" && mudhohiId) {
      setIsFetchingJatah(true);
      setMudhohiJatah(null);
      getMudhohiJatah(mudhohiId).then((jatah) => {
        setMudhohiJatah(jatah);
        setIsFetchingJatah(false);
      });
    } else {
      setMudhohiJatah(null);
    }
  }, [recipientType, mudhohiId]);

  const isSubmitDisabled = (() => {
    if (isLoading || !recipientType) return true;
    if (recipientType === "Mudhohi") return !mudhohiId || !mudhohiJatah;
    if (recipientType === "Asatidz") return !asatidzId || !meatType1 || !amount1 || Number(amount1) <= 0;
    return !meatType1 || !amount1 || Number(amount1) <= 0;
  })();

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!recipientType) { toast.error("Pilih jenis penerima terlebih dahulu"); return; }
    if (recipientType === "Mudhohi" && !mudhohiId) { toast.error("Pilih nama Mudhohi"); return; }
    if (recipientType === "Asatidz" && !asatidzId) { toast.error("Pilih nama Asatidz"); return; }
    if (recipientType !== "Mudhohi" && (!meatType1 || !amount1 || Number(amount1) <= 0)) {
      toast.error("Pilih jenis daging dan masukkan jumlah yang valid"); return;
    }
    // Validasi item kedua jika ditampilkan
    if (showSecondItem && recipientType !== "Mudhohi") {
      if (meatType2 && (!amount2 || Number(amount2) <= 0)) {
        toast.error("Masukkan jumlah untuk jenis daging kedua"); return;
      }
      if (amount2 && Number(amount2) > 0 && !meatType2) {
        toast.error("Pilih jenis daging kedua"); return;
      }
    }

    let resolvedName: string | undefined;
    if (recipientType === "Asatidz") {
      resolvedName = asatidzList.find((a) => a.id === asatidzId)?.name;
    } else if (
      (MANUAL_NAME_RECIPIENTS as readonly string[]).includes(recipientType)
    ) {
      resolvedName = recipientName.trim() || recipientType;
    }

    setIsLoading(true);
    const res = await submitDistribusi({
      recipient_type: recipientType,
      recipient_name: resolvedName,
      mudhohi_id: mudhohiId || undefined,
      asatidz_id: asatidzId || undefined,
      meat_type_1: meatType1 || undefined,
      qty_1: amount1 ? Number(amount1) : undefined,
      meat_type_2: (showSecondItem && meatType2) ? meatType2 : undefined,
      qty_2: (showSecondItem && amount2 && Number(amount2) > 0) ? Number(amount2) : undefined,
    });
    setIsLoading(false);

    if (res.success) {
      toast.success("Distribusi berhasil diproses");
      setOpen(false);
      resetForm();
      onSuccess?.();
      router.refresh();
    } else {
      toast.error(res.error || "Gagal memproses distribusi");
    }
  };

  const resetForm = () => {
    setRecipientType(""); setMudhohiId(""); setAsatidzId("");
    setRecipientName(""); setMeatType1(""); setAmount1("");
    setShowSecondItem(false); setMeatType2(""); setAmount2("");
    setMudhohiJatah(null);
  };

  const handleOpenChange = (val: boolean) => {
    setOpen(val);
    if (!val) resetForm();
  };

  const handleRecipientChange = (val: string) => {
    setRecipientType(val as RecipientType);
    setMudhohiId(""); setAsatidzId(""); setRecipientName("");
    setMeatType1(""); setAmount1("");
    setShowSecondItem(false); setMeatType2(""); setAmount2("");
    setMudhohiJatah(null);
  };

  const needsMeatInput = recipientType !== "" && recipientType !== "Mudhohi";

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {showTrigger && (
        <DialogTrigger
          render={
            <Button className="bg-orange-500 hover:bg-orange-600 text-white">
              Input Distribusi
            </Button>
          }
        />
      )}

      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Input Distribusi Baru</DialogTitle>
          <DialogDescription>
            Masukkan data distribusi daging yang keluar dari stok.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-2">
          {/* Jenis Penerima */}
          <div className="space-y-2">
            <Label htmlFor="recipient-type">Jenis Penerima</Label>
            <Select value={recipientType} onValueChange={(val) => { if (val) handleRecipientChange(val); }}>
              <SelectTrigger id="recipient-type">
                <SelectValue placeholder="Pilih jenis penerima" />
              </SelectTrigger>
              <SelectContent>
                {RECIPIENT_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Dropdown Mudhohi */}
          {recipientType === "Mudhohi" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="mudhohi-select">Nama Mudhohi</Label>
                <Select value={mudhohiId} onValueChange={(val) => { if (val) setMudhohiId(val); }}>
                  <SelectTrigger id="mudhohi-select">
                    <SelectValue placeholder="Pilih Mudhohi..." />
                  </SelectTrigger>
                  <SelectContent>
                    {mudhohiList.length === 0 ? (
                      <SelectItem value="__empty__" disabled>
                        Semua Mudhohi sudah didistribusi
                      </SelectItem>
                    ) : (
                      mudhohiList.map((m) => (
                        <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              {isFetchingJatah && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                  <p className="text-sm text-slate-400 animate-pulse">Memuat jatah...</p>
                </div>
              )}

              {!isFetchingJatah && mudhohiJatah && (
                <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg space-y-3">
                  <div>
                    <p className="text-xs font-semibold text-orange-500 uppercase tracking-wide">Paket</p>
                    <p className="font-semibold text-slate-800 mt-0.5">{mudhohiJatah.packageName}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-orange-500 uppercase tracking-wide">Jatah</p>
                    <p className="font-medium text-slate-700 mt-0.5">{mudhohiJatah.summary}</p>
                  </div>
                  <div className="pt-1 border-t border-orange-200 space-y-1">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <span className="w-2 h-2 rounded-full bg-orange-400 flex-shrink-0" />
                      <span>{mudhohiJatah.part1.qty}x {mudhohiJatah.part1.name}</span>
                    </div>
                    {mudhohiJatah.part2 && (
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <span className="w-2 h-2 rounded-full bg-orange-400 flex-shrink-0" />
                        <span>{mudhohiJatah.part2.qty}x {mudhohiJatah.part2.name}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {!isFetchingJatah && mudhohiId && !mudhohiJatah && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-sm text-amber-700">
                    Mudhohi ini belum memiliki paket yang ditetapkan.
                  </p>
                </div>
              )}
            </>
          )}

          {/* Dropdown Asatidz */}
          {recipientType === "Asatidz" && (
            <div className="space-y-2">
              <Label htmlFor="asatidz-select">Nama Asatidz</Label>
              <Select value={asatidzId} onValueChange={(val) => { if (val) setAsatidzId(val); }}>
                <SelectTrigger id="asatidz-select">
                  <SelectValue placeholder="Pilih Asatidz..." />
                </SelectTrigger>
                <SelectContent>
                  {asatidzList.length === 0 ? (
                    <SelectItem value="__empty__" disabled>Belum ada data asatidz</SelectItem>
                  ) : (
                    asatidzList.map((a) => (
                      <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Input Nama Manual */}
          {(MANUAL_NAME_RECIPIENTS as readonly string[]).includes(
            recipientType,
          ) && (
            <div className="space-y-2">
              <Label htmlFor="recipient-name">
                Nama Penerima{" "}
                <span className="text-slate-400 font-normal">(opsional)</span>
              </Label>
              <Input
                id="recipient-name"
                placeholder={`Contoh: ${recipientType} RT 05`}
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
              />
            </div>
          )}

          {/* Input Daging */}
          {needsMeatInput && (
            <div className="space-y-4">
              {/* ── Item Daging Pertama (Wajib) ── */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold text-slate-700">Daging 1 (Wajib)</Label>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="meat-type-1" className="text-xs text-slate-500">Jenis Daging</Label>
                    <Select value={meatType1} onValueChange={(val) => { if (val) setMeatType1(val as MeatType); }}>
                      <SelectTrigger id="meat-type-1">
                        <SelectValue placeholder="Pilih..." />
                      </SelectTrigger>
                      <SelectContent>
                        {MEAT_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="amount-1" className="text-xs text-slate-500">
                      {meatType1 === "Hati + Sampil" ? "Jumlah (Pcs)" : "Jumlah (Kresek)"}
                    </Label>
                    <Input
                      id="amount-1"
                      type="number"
                      min="1"
                      value={amount1}
                      onChange={(e) => setAmount1(e.target.value)}
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>

              {/* ── Item Daging Kedua (Opsional) ── */}
              {showSecondItem ? (
                <div className="space-y-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-semibold text-slate-700">Daging 2 (Opsional)</Label>
                    <button
                      type="button"
                      onClick={() => { setShowSecondItem(false); setMeatType2(""); setAmount2(""); }}
                      className="text-xs text-red-500 hover:text-red-700 font-medium transition-colors"
                    >
                      Hapus
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="meat-type-2" className="text-xs text-slate-500">Jenis Daging</Label>
                      <Select value={meatType2} onValueChange={(val) => { if (val) setMeatType2(val as MeatType); }}>
                        <SelectTrigger id="meat-type-2">
                          <SelectValue placeholder="Pilih..." />
                        </SelectTrigger>
                        <SelectContent>
                          {MEAT_TYPES.map((type) => (
                            <SelectItem key={type} value={type}>{type}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="amount-2" className="text-xs text-slate-500">
                        {meatType2 === "Hati + Sampil" ? "Jumlah (Pcs)" : "Jumlah (Kresek)"}
                      </Label>
                      <Input
                        id="amount-2"
                        type="number"
                        min="1"
                        value={amount2}
                        onChange={(e) => setAmount2(e.target.value)}
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowSecondItem(true)}
                  className="flex items-center gap-1.5 text-sm text-orange-500 hover:text-orange-700 font-medium transition-colors"
                >
                  <span className="text-lg leading-none">+</span>
                  Tambah Jenis Daging
                </button>
              )}
            </div>
          )}

          {recipientType !== "" && (
            <Button
              type="submit"
              className="w-full bg-orange-500 hover:bg-orange-600 text-white"
              disabled={isSubmitDisabled}
            >
              {isLoading ? "Memproses..." : "Proses Distribusi"}
            </Button>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}
