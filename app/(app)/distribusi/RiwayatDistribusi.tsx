"use client";

import { useState, useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  RECIPIENT_FILTER_OPTIONS,
  recipientBadgeClass,
} from "@/lib/recipient-types";

export type TransaksiOut = {
  id: number;
  created_at: string;
  recipient_name: string | null;
  recipient_type: string | null;
  meat_type: string;
  amount: number;
};

function KategoriBadge({ type }: { type: string | null }) {
  const label = type ?? "-";
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${recipientBadgeClass(type)}`}
    >
      {label}
    </span>
  );
}

function formatTanggal(iso: string) {
  return new Date(iso).toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getSatuan(meatType: string) {
  return meatType === "Hati + Sampil" ? "Pcs" : "Kresek";
}

export function RiwayatDistribusi({ data }: { data: TransaksiOut[] }) {
  const [filter, setFilter] = useState<string>("Semua");

  const filtered = useMemo(() => {
    if (filter === "Semua") return data;
    return data.filter((tx) => tx.recipient_type === filter);
  }, [data, filter]);

  return (
    <div className="bg-white rounded-xl border border-orange-100 overflow-hidden shadow-sm">
      {/* Header tabel */}
      <div className="px-6 py-4 border-b border-orange-100 bg-orange-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">Riwayat Distribusi</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            {filtered.length} transaksi keluar
            {filter !== "Semua" && ` · filter: ${filter}`}
          </p>
        </div>

        {/* Filter kategori */}
        <div className="w-full sm:w-48">
          <Select value={filter} onValueChange={(value) => setFilter(value ?? '')}>
            <SelectTrigger className="bg-white border-orange-200 focus:ring-orange-300">
              <SelectValue placeholder="Filter kategori" />
            </SelectTrigger>
            <SelectContent>
              {RECIPIENT_FILTER_OPTIONS.map((opt) => (
                <SelectItem key={opt} value={opt}>{opt}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="p-10 text-center text-slate-500">
          {filter === "Semua"
            ? "Belum ada riwayat distribusi."
            : `Belum ada distribusi untuk kategori "${filter}".`}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-200">
                <th className="px-6 py-3 font-medium whitespace-nowrap">Tanggal & Waktu</th>
                <th className="px-6 py-3 font-medium">Penerima</th>
                <th className="px-6 py-3 font-medium">Kategori</th>
                <th className="px-6 py-3 font-medium">Jenis Daging</th>
                <th className="px-6 py-3 font-medium text-right">Jumlah</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((tx) => (
                <tr key={tx.id} className="hover:bg-orange-50/40 transition-colors">
                  <td className="px-6 py-4 text-slate-500 text-sm whitespace-nowrap">
                    {tx.created_at ? formatTanggal(tx.created_at) : "-"}
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-900">
                    {tx.recipient_name || tx.recipient_type || "-"}
                  </td>
                  <td className="px-6 py-4">
                    <KategoriBadge type={tx.recipient_type} />
                  </td>
                  <td className="px-6 py-4 text-slate-700">{tx.meat_type}</td>
                  <td className="px-6 py-4 text-right">
                    <span className="font-semibold text-orange-600">
                      -{tx.amount}
                    </span>
                    <span className="text-slate-400 text-sm ml-1">
                      {getSatuan(tx.meat_type)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
