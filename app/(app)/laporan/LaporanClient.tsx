"use client";

import { useState, useMemo } from "react";
import { Printer, Download, ArrowDownToLine, ArrowUpFromLine, Boxes } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { TxRow, InventoryRow } from "./actions";

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatTanggal(iso: string) {
  return new Date(iso).toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getSatuan(meatType: string) {
  return meatType === "Hati + Sampil" ? "Pcs" : "Kresek";
}

function KategoriBadge({ type }: { type: string | null }) {
  const map: Record<string, string> = {
    Mudhohi:    "bg-purple-100 text-purple-800 border-purple-200",
    Asatidz:    "bg-blue-100   text-blue-800   border-blue-200",
    Guru:       "bg-teal-100   text-teal-800   border-teal-200",
    Panitia:    "bg-amber-100  text-amber-800  border-amber-200",
    Masyarakat: "bg-slate-100  text-slate-700  border-slate-200",
    Internal:   "bg-green-100  text-green-800  border-green-200",
  };
  const label = type ?? "-";
  const cls = map[label] ?? "bg-slate-100 text-slate-700 border-slate-200";
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${cls}`}>
      {label}
    </span>
  );
}

// ── Export CSV ────────────────────────────────────────────────────────────────

function exportCSV(rows: TxRow[]) {
  const header = ["No", "Tanggal", "Tipe", "Jenis Daging", "Jumlah", "Satuan", "Kategori", "Penerima"];
  const body = rows.map((tx, i) => [
    i + 1,
    new Date(tx.created_at).toLocaleString("id-ID"),
    tx.transaction_type === "IN" ? "Masuk" : "Keluar",
    tx.meat_type,
    tx.amount,
    getSatuan(tx.meat_type),
    tx.recipient_type ?? "-",
    tx.recipient_name ?? tx.recipient_type ?? "-",
  ]);

  const csv = [header, ...body]
    .map((row) => row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
    .join("\n");

  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `laporan-qurban-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Komponen Utama ────────────────────────────────────────────────────────────

type Props = {
  transactions: TxRow[];
  inventory: InventoryRow[];
  totalIn: number;
  totalOut: number;
  totalStock: number;
};

const MEAT_OPTIONS = ["Semua", "Sapi", "Kambing", "Hati + Sampil"] as const;
const TIPE_OPTIONS = ["Semua", "Masuk (IN)", "Keluar (OUT)"] as const;
const KATEGORI_OPTIONS = ["Semua", "Mudhohi", "Asatidz", "Guru", "Panitia", "Masyarakat"] as const;

export function LaporanClient({ transactions, inventory, totalIn, totalOut, totalStock }: Props) {
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo]     = useState("");
  const [meatFilter, setMeatFilter]         = useState("Semua");
  const [tipeFilter, setTipeFilter]         = useState("Semua");
  const [kategoriFilter, setKategoriFilter] = useState("Semua");

  // ── Filter ────────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return transactions.filter((tx) => {
      if (meatFilter !== "Semua" && tx.meat_type !== meatFilter) return false;
      if (tipeFilter === "Masuk (IN)"   && tx.transaction_type !== "IN")  return false;
      if (tipeFilter === "Keluar (OUT)" && tx.transaction_type !== "OUT") return false;
      if (kategoriFilter !== "Semua" && tx.recipient_type !== kategoriFilter) return false;
      if (dateFrom) {
        const from = new Date(dateFrom);
        from.setHours(0, 0, 0, 0);
        if (new Date(tx.created_at) < from) return false;
      }
      if (dateTo) {
        const to = new Date(dateTo);
        to.setHours(23, 59, 59, 999);
        if (new Date(tx.created_at) > to) return false;
      }
      return true;
    });
  }, [transactions, meatFilter, tipeFilter, kategoriFilter, dateFrom, dateTo]);

  // Hitung ulang total dari data terfilter
  const filteredIn  = filtered.filter((t) => t.transaction_type === "IN").reduce((s, t) => s + t.amount, 0);
  const filteredOut = filtered.filter((t) => t.transaction_type === "OUT").reduce((s, t) => s + t.amount, 0);

  const isFiltered =
    meatFilter !== "Semua" || tipeFilter !== "Semua" ||
    kategoriFilter !== "Semua" || dateFrom || dateTo;

  const resetFilter = () => {
    setDateFrom(""); setDateTo("");
    setMeatFilter("Semua"); setTipeFilter("Semua"); setKategoriFilter("Semua");
  };

  return (
    <div className="space-y-8">

      {/* ══ HEADER STATS ══════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 print:gap-3">
        <div className="bg-white p-6 rounded-xl border border-green-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-green-50 text-green-600 rounded-full flex-shrink-0">
            <ArrowDownToLine size={26} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Total Daging Masuk</p>
            <p className="text-2xl font-bold text-slate-900">
              {(isFiltered ? filteredIn : totalIn).toLocaleString("id-ID")}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">unit (Kresek / Pcs)</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-red-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-red-50 text-red-500 rounded-full flex-shrink-0">
            <ArrowUpFromLine size={26} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Total Daging Keluar</p>
            <p className="text-2xl font-bold text-slate-900">
              {(isFiltered ? filteredOut : totalOut).toLocaleString("id-ID")}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">unit (Kresek / Pcs)</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-blue-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-full flex-shrink-0">
            <Boxes size={26} />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Sisa Stok Saat Ini</p>
            <p className="text-2xl font-bold text-slate-900">
              {totalStock.toLocaleString("id-ID")}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">unit (Kresek / Pcs)</p>
          </div>
        </div>
      </div>

      {/* ══ STOK PER JENIS ════════════════════════════════════════════════════ */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
          <h2 className="font-semibold text-slate-800">Stok Saat Ini per Jenis Daging</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-200">
                <th className="px-6 py-3 font-medium">Jenis Daging</th>
                <th className="px-6 py-3 font-medium text-right">Sisa Stok</th>
                <th className="px-6 py-3 font-medium text-right">Satuan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {inventory.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-6 text-center text-slate-500">Belum ada data stok.</td>
                </tr>
              ) : (
                inventory.map((inv) => (
                  <tr key={inv.meat_type} className="hover:bg-slate-50/50">
                    <td className="px-6 py-3 font-medium text-slate-800">{inv.meat_type}</td>
                    <td className="px-6 py-3 text-right font-bold text-blue-700">
                      {inv.stock.toLocaleString("id-ID")}
                    </td>
                    <td className="px-6 py-3 text-right text-slate-500 text-sm">
                      {getSatuan(inv.meat_type)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ══ FILTER + TOMBOL AKSI ══════════════════════════════════════════════ */}
      <div className="print:hidden bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-semibold text-slate-800">Filter Laporan</h2>
          <div className="flex gap-2 flex-wrap">
            {isFiltered && (
              <Button variant="outline" size="sm" onClick={resetFilter} className="text-slate-600">
                Reset Filter
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportCSV(filtered)}
              className="flex items-center gap-1.5 border-green-300 text-green-700 hover:bg-green-50"
            >
              <Download size={15} />
              Export CSV
            </Button>
            <Button
              size="sm"
              onClick={() => window.print()}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-900 text-white"
            >
              <Printer size={15} />
              Cetak Laporan
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Dari Tanggal */}
          <div className="space-y-1.5">
            <Label className="text-xs text-slate-500">Dari Tanggal</Label>
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="text-sm"
            />
          </div>

          {/* Sampai Tanggal */}
          <div className="space-y-1.5">
            <Label className="text-xs text-slate-500">Sampai Tanggal</Label>
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="text-sm"
            />
          </div>

          {/* Jenis Daging */}
          <div className="space-y-1.5">
            <Label className="text-xs text-slate-500">Jenis Daging</Label>
            <Select value={meatFilter}onValueChange={(value) => setMeatFilter(value ?? '')}
>
              <SelectTrigger className="text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MEAT_OPTIONS.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* Tipe Transaksi */}
          <div className="space-y-1.5">
            <Label className="text-xs text-slate-500">Tipe Transaksi</Label>
            <Select value={tipeFilter}onValueChange={(value) => setTipeFilter(value ?? '')}
>
              <SelectTrigger className="text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIPE_OPTIONS.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* Kategori Penerima */}
          <div className="space-y-1.5">
            <Label className="text-xs text-slate-500">Kategori Penerima</Label>
            <Select value={kategoriFilter}onValueChange={(value) => setKategoriFilter(value ?? '')}
>
              <SelectTrigger className="text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {KATEGORI_OPTIONS.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* ══ TABEL TRANSAKSI ═══════════════════════════════════════════════════ */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-slate-800">Detail Seluruh Transaksi</h2>
            <p className="text-sm text-slate-500 mt-0.5">
              {filtered.length} transaksi
              {isFiltered && " (terfilter)"}
            </p>
          </div>
          {/* Tombol cetak versi ringkas — hanya tampil saat print */}
          <p className="hidden print:block text-sm text-slate-500">
            Dicetak: {new Date().toLocaleString("id-ID")}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-500 border-b border-slate-200">
                <th className="px-5 py-3 font-medium">No</th>
                <th className="px-5 py-3 font-medium whitespace-nowrap">Tanggal & Waktu</th>
                <th className="px-5 py-3 font-medium">Tipe</th>
                <th className="px-5 py-3 font-medium">Jenis Daging</th>
                <th className="px-5 py-3 font-medium text-right">Jumlah</th>
                <th className="px-5 py-3 font-medium">Kategori</th>
                <th className="px-5 py-3 font-medium">Penerima / Sumber</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-slate-500">
                    Tidak ada data yang sesuai dengan filter.
                  </td>
                </tr>
              ) : (
                filtered.map((tx, idx) => {
                  const isIn = tx.transaction_type === "IN";
                  return (
                    <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors print:hover:bg-transparent">
                      <td className="px-5 py-3 text-slate-400">{idx + 1}</td>
                      <td className="px-5 py-3 text-slate-500 whitespace-nowrap">
                        {formatTanggal(tx.created_at)}
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${
                            isIn
                              ? "bg-green-50 text-green-700 border-green-200"
                              : "bg-red-50 text-red-600 border-red-200"
                          }`}
                        >
                          {isIn ? "↓ Masuk" : "↑ Keluar"}
                        </span>
                      </td>
                      <td className="px-5 py-3 font-medium text-slate-800">{tx.meat_type}</td>
                      <td className="px-5 py-3 text-right">
                        <span className={`font-semibold ${isIn ? "text-green-600" : "text-red-500"}`}>
                          {isIn ? "+" : "-"}{tx.amount.toLocaleString("id-ID")}
                        </span>
                        <span className="text-slate-400 text-xs ml-1">{getSatuan(tx.meat_type)}</span>
                      </td>
                      <td className="px-5 py-3">
                        <KategoriBadge type={tx.recipient_type} />
                      </td>
                      <td className="px-5 py-3 text-slate-600">
                        {tx.recipient_name || tx.recipient_type || "-"}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>

            {/* Footer total */}
            {filtered.length > 0 && (
              <tfoot>
                <tr className="border-t-2 border-slate-200 bg-slate-50 font-semibold">
                  <td colSpan={4} className="px-5 py-3 text-slate-600">
                    Total ({filtered.length} transaksi)
                  </td>
                  <td className="px-5 py-3 text-right">
                    <span className="text-green-600">+{filteredIn.toLocaleString("id-ID")}</span>
                    {" / "}
                    <span className="text-red-500">-{filteredOut.toLocaleString("id-ID")}</span>
                  </td>
                  <td colSpan={2} />
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}
