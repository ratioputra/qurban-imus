import { getLaporanData } from "./actions";
import { LaporanClient } from "./LaporanClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function LaporanPage() {
  const { transactions, inventory, totalIn, totalOut, totalStock } =
    await getLaporanData();

  return (
    <div className="space-y-6">
      {/* Header — disembunyikan saat print agar tidak dobel dengan judul tabel */}
      <div className="print:hidden">
        <h1 className="text-2xl font-bold text-slate-900">Laporan Kegiatan Qurban</h1>
        <p className="text-slate-500 mt-1">
          Rekap lengkap seluruh transaksi masuk dan keluar daging qurban.
        </p>
      </div>

      {/* Judul khusus print */}
      <div className="hidden print:block mb-4">
        <h1 className="text-xl font-bold text-slate-900">Laporan Kegiatan Qurban</h1>
        <p className="text-slate-500 text-sm">
          Dicetak pada: {new Date().toLocaleString("id-ID")}
        </p>
      </div>

      <LaporanClient
        transactions={transactions}
        inventory={inventory}
        totalIn={totalIn}
        totalOut={totalOut}
        totalStock={totalStock}
      />
    </div>
  );
}
