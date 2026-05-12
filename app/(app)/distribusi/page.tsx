import { createClient } from "@/utils/supabase/client";
const supabase = createClient();
import { DistribusiForm } from "./DistribusiForm";
import { RiwayatDistribusi, type TransaksiOut } from "./RiwayatDistribusi";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function DistribusiPage() {
  const { data, error } = await supabase
    .from("transactions")
    .select("id, created_at, recipient_name, recipient_type, meat_type, amount")
    .eq("transaction_type", "OUT")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching distribusi history:", error);
  }

  const riwayat: TransaksiOut[] = (data as TransaksiOut[]) || [];

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Distribusi (Stok Keluar)</h1>
          <p className="text-slate-500 mt-1">
            Kelola distribusi daging qurban ke berbagai penerima.
          </p>
        </div>
        <DistribusiForm />
      </div>

      {/* ── Tabel Riwayat ── */}
      <RiwayatDistribusi data={riwayat} />
    </div>
  );
}
