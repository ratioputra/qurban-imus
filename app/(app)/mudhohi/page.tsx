import { getMudhohi, getPackages } from "./actions";
import { MudhohiClient } from "./MudhohiClient";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function MudhohiPage() {
  const [mudhohiData, packages] = await Promise.all([
    getMudhohi(),
    getPackages()
  ]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Data Mudhohi</h1>
          <p className="text-slate-500 mt-1">Kelola data peserta qurban dan alokasi paketnya.</p>
        </div>
      </div>
      
      <MudhohiClient initialData={mudhohiData} packages={packages} />
    </div>
  );
}
