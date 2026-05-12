import { getAsatidzList } from "./actions";
import { AsatidzClient } from "./AsatidzClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AsatidzPage() {
  const asatidzData = await getAsatidzList();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Data Asatidz</h1>
        <p className="text-slate-500 mt-1">
          Kelola data ustadz / ustadzah penerima distribusi qurban.
        </p>
      </div>

      <AsatidzClient initialData={asatidzData} />
    </div>
  );
}
