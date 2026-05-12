import { createClient } from "@/utils/supabase/client";
const supabase = createClient();
import { ProduksiFormSheet } from "./ProduksiFormSheet";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ProduksiPage() {
  // Fetch history from transactions table
  const { data: history, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('transaction_type', 'IN')
    .order('created_at', { ascending: false });

  const transactions = history || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Produksi (Stok Masuk)</h1>
          <p className="text-slate-500 mt-1">Catat dan kelola data pemotongan daging qurban.</p>
        </div>
        
        <ProduksiFormSheet />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
          <h2 className="text-lg font-semibold text-slate-800">Riwayat Produksi</h2>
        </div>
        
        {transactions.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            Belum ada riwayat produksi.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-200">
                  <th className="px-6 py-3 font-medium">Tanggal</th>
                  <th className="px-6 py-3 font-medium">Jenis Daging</th>
                  <th className="px-6 py-3 font-medium text-right">Jumlah</th>
                  <th className="px-6 py-3 font-medium">Satuan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {transactions.map((tx) => {
                  const date = tx.created_at ? new Date(tx.created_at).toLocaleString('id-ID', {
                    dateStyle: 'medium',
                    timeStyle: 'short'
                  }) : '-';
                  
                  const isPcs = tx.meat_type === 'Hati + Sampil';
                  const unit = isPcs ? 'Pcs' : 'Kresek Kecil (0.5kg)';

                  return (
                    <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 text-slate-600 text-sm whitespace-nowrap">{date}</td>
                      <td className="px-6 py-4 font-medium text-slate-900">{tx.meat_type}</td>
                      <td className="px-6 py-4 text-green-600 font-semibold text-right">+{tx.amount}</td>
                      <td className="px-6 py-4 text-slate-500 text-sm">{unit}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
