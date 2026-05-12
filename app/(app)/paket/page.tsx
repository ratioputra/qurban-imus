import { getPaketList } from "./actions";
import { PaketClient } from "./PaketClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function PaketPage() {
  const paketData = await getPaketList();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Daftar Paket Hewan Kurban</h1>
        <p className="text-slate-500 mt-1">
          Kelola paket hewan kurban beserta rincian jatah dagingnya.
        </p>
      </div>

      <PaketClient initialData={paketData} />
    </div>
  );
}
