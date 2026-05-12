import Link from "next/link";
import {
  Package,
  ArrowDownToLine,
  ArrowUpFromLine,
  Boxes,
  Users,
  GraduationCap,
  HeartHandshake,
  Factory,
  Truck,
  UserPlus,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { RealtimeRefresher } from "@/components/RealtimeRefresher";
import { TimeAgo } from "@/components/TimeAgo";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// ── Helper: progress bar ──────────────────────────────────────────────────────
function ProgressBar({ value, max, color = "bg-blue-500" }: { value: number; max: number; color?: string }) {
  const pct = max === 0 ? 0 : Math.min(100, Math.round((value / max) * 100));
  return (
    <div className="w-full bg-slate-100 rounded-full h-2 mt-3">
      <div
        className={`${color} h-2 rounded-full transition-all`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export default async function DashboardPage() {
  const supabase = await createClient();
  // ── Fetch semua data secara paralel ──────────────────────────────────────────
  const [
    { data: inventoryData },
    { data: txData },
    { data: recentTxData },
    { count: mudhohiTotal },
    { count: mudhohiDone },
    { count: asatidzTotal },
    { count: asatidzDone },
    { count: lainnyaCount },
  ] = await Promise.all([
    supabase.from("inventory").select("meat_type, stock"),
    supabase.from("transactions").select("meat_type, transaction_type, amount"),
    // 5 transaksi terbaru (IN + OUT)
    supabase
      .from("transactions")
      .select("id, created_at, transaction_type, meat_type, amount, recipient_name, recipient_type")
      .order("created_at", { ascending: false })
      .limit(5),
    // Total mudhohi
    supabase.from("mudhohi").select("*", { count: "exact", head: true }),
    // Mudhohi sudah distribusi
    supabase
      .from("mudhohi")
      .select("*", { count: "exact", head: true })
      .eq("status_distribusi", true),
    // Total asatidz
    supabase.from("asatidz").select("*", { count: "exact", head: true }),
    // Asatidz yang sudah menerima distribusi (berdasarkan kolom status_distribusi)
    supabase
      .from("asatidz")
      .select("*", { count: "exact", head: true })
      .eq("status_distribusi", true),
    // Transaksi OUT untuk Masyarakat / Guru / Panitia
    supabase
      .from("transactions")
      .select("*", { count: "exact", head: true })
      .eq("transaction_type", "OUT")
      .in("recipient_type", ["Masyarakat", "Guru", "Panitia"]),
  ]);

  const inventory = inventoryData || [];
  const transactions = txData || [];
  const recentTx = recentTxData || [];

  // ── Hitung agregat stok ───────────────────────────────────────────────────
  let totalInput = 0;
  let totalOutput = 0;
  let currentTotalStock = 0;

  const meatStats: Record<string, { in: number; out: number; stock: number }> = {
    Sapi: { in: 0, out: 0, stock: 0 },
    Kambing: { in: 0, out: 0, stock: 0 },
    "Hati + Sampil": { in: 0, out: 0, stock: 0 },
  };

  inventory.forEach((item: { meat_type: string; stock: number }) => {
    currentTotalStock += item.stock || 0;
    if (meatStats[item.meat_type]) {
      meatStats[item.meat_type].stock = item.stock || 0;
    } else {
      meatStats[item.meat_type] = { in: 0, out: 0, stock: item.stock || 0 };
    }
  });

  transactions.forEach((tx: { meat_type: string; transaction_type: string; amount: number }) => {
    if (tx.transaction_type === "IN") {
      totalInput += tx.amount || 0;
      if (meatStats[tx.meat_type]) meatStats[tx.meat_type].in += tx.amount || 0;
    } else if (tx.transaction_type === "OUT") {
      totalOutput += tx.amount || 0;
      if (meatStats[tx.meat_type]) meatStats[tx.meat_type].out += tx.amount || 0;
    }
  });

  const meatTypes = ["Sapi", "Kambing", "Hati + Sampil"];

  // Nilai progres
  const mTotal = mudhohiTotal ?? 0;
  const mDone = mudhohiDone ?? 0;
  const aTotal = asatidzTotal ?? 0;
  const aDone = asatidzDone ?? 0;
  const lTotal = lainnyaCount ?? 0;

  return (
    <div className="space-y-10">
      <RealtimeRefresher />
      {/* ── Judul ── */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 mt-2">
          Ringkasan operasional dan stok daging qurban secara real-time.
        </p>
      </div>

      {/* ── Quick Actions ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          href="/produksi"
          className="flex items-center gap-4 p-5 bg-green-600 hover:bg-green-700 text-white rounded-xl shadow-sm transition-colors group"
        >
          <div className="p-3 bg-white/20 rounded-lg group-hover:bg-white/30 transition-colors">
            <Factory size={24} />
          </div>
          <div>
            <p className="font-semibold text-lg">Input Produksi</p>
            <p className="text-green-100 text-sm">Catat daging masuk</p>
          </div>
        </Link>

        <Link
          href="/distribusi"
          className="flex items-center gap-4 p-5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl shadow-sm transition-colors group"
        >
          <div className="p-3 bg-white/20 rounded-lg group-hover:bg-white/30 transition-colors">
            <Truck size={24} />
          </div>
          <div>
            <p className="font-semibold text-lg">Distribusi Daging</p>
            <p className="text-orange-100 text-sm">Catat daging keluar</p>
          </div>
        </Link>

        <Link
          href="/mudhohi"
          className="flex items-center gap-4 p-5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm transition-colors group"
        >
          <div className="p-3 bg-white/20 rounded-lg group-hover:bg-white/30 transition-colors">
            <UserPlus size={24} />
          </div>
          <div>
            <p className="font-semibold text-lg">Tambah Mudhohi</p>
            <p className="text-blue-100 text-sm">Kelola peserta qurban</p>
          </div>
        </Link>
      </div>

      {/* ── Stats Cards Stok ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-green-50 text-green-600 rounded-full">
            <ArrowDownToLine size={28} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Terinput</p>
            <h3 className="text-2xl font-bold text-slate-900">
              {totalInput.toLocaleString("id-ID")}
            </h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-blue-50 text-blue-600 rounded-full">
            <Boxes size={28} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Stok Saat Ini</p>
            <h3 className="text-2xl font-bold text-slate-900">
              {currentTotalStock.toLocaleString("id-ID")}
            </h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-red-50 text-red-600 rounded-full">
            <ArrowUpFromLine size={28} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Terdistribusi</p>
            <h3 className="text-2xl font-bold text-slate-900">
              {totalOutput.toLocaleString("id-ID")}
            </h3>
          </div>
        </div>
      </div>

      {/* ── Progres Distribusi Penerima ── */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 mb-4">Progres Distribusi Penerima</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Mudhohi */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                  <Users size={18} />
                </div>
                <p className="font-semibold text-slate-700">Mudhohi</p>
              </div>
              <span className="text-sm font-medium text-slate-500">
                {mTotal === 0 ? "0%" : `${Math.round((mDone / mTotal) * 100)}%`}
              </span>
            </div>
            <p className="text-3xl font-bold text-slate-900 mt-3">
              {mDone}
              <span className="text-lg font-normal text-slate-400">/{mTotal}</span>
            </p>
            <p className="text-sm text-slate-500 mt-0.5">sudah menerima distribusi</p>
            <ProgressBar value={mDone} max={mTotal} color="bg-purple-500" />
          </div>

          {/* Asatidz */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <GraduationCap size={18} />
                </div>
                <p className="font-semibold text-slate-700">Asatidz</p>
              </div>
              <span className="text-sm font-medium text-slate-500">
                {aTotal === 0 ? "0%" : `${Math.min(100, Math.round((aDone / aTotal) * 100))}%`}
              </span>
            </div>
            <p className="text-3xl font-bold text-slate-900 mt-3">
              {aDone}
              <span className="text-lg font-normal text-slate-400">/{aTotal}</span>
            </p>
            <p className="text-sm text-slate-500 mt-0.5">sudah menerima distribusi</p>
            <ProgressBar value={aDone} max={aTotal} color="bg-blue-500" />
          </div>

          {/* Lainnya */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
                  <HeartHandshake size={18} />
                </div>
                <p className="font-semibold text-slate-700">Masyarakat & Lainnya</p>
              </div>
            </div>
            <p className="text-3xl font-bold text-slate-900 mt-3">
              {lTotal}
            </p>
            <p className="text-sm text-slate-500 mt-0.5">total transaksi distribusi</p>
            <div className="w-full bg-slate-100 rounded-full h-2 mt-3">
              <div className="bg-orange-400 h-2 rounded-full w-full" />
            </div>
          </div>
        </div>
      </div>

      {/* ── Aktivitas Terkini + Rincian Stok ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Aktivitas Terkini */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
            <h2 className="text-lg font-semibold text-slate-800">Aktivitas Terkini</h2>
            <p className="text-sm text-slate-500 mt-0.5">5 transaksi terakhir</p>
          </div>
          <ul className="divide-y divide-slate-100">
            {recentTx.length === 0 ? (
              <li className="px-6 py-8 text-center text-slate-500 text-sm">
                Belum ada aktivitas.
              </li>
            ) : (
              recentTx.map((tx: any) => {
                const isIn = tx.transaction_type === "IN";
                const label = isIn
                  ? "Produksi"
                  : tx.recipient_name || tx.recipient_type || "Distribusi";
                const satuan = tx.meat_type === "Hati + Sampil" ? "Pcs" : "Kresek";

                return (
                  <li key={tx.id} className="px-6 py-4 flex items-center gap-4">
                    {/* Icon */}
                    <div
                      className={`p-2 rounded-full flex-shrink-0 ${
                        isIn
                          ? "bg-green-50 text-green-600"
                          : "bg-red-50 text-red-500"
                      }`}
                    >
                      {isIn ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-800 truncate">{label}</p>
                      <p className="text-sm text-slate-500">{tx.meat_type}</p>
                    </div>

                    {/* Jumlah + waktu */}
                    <div className="text-right flex-shrink-0">
                      <p
                        className={`font-semibold ${
                          isIn ? "text-green-600" : "text-red-500"
                        }`}
                      >
                        {isIn ? "+" : "-"}{tx.amount} {satuan}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {tx.created_at ? <TimeAgo iso={tx.created_at} /> : "-"}
                      </p>
                    </div>
                  </li>
                );
              })
            )}
          </ul>
        </div>

        {/* Rincian Stok per Jenis Daging */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900">Rincian Stok per Jenis Daging</h2>
          {meatTypes.map((type) => {
            const stats = meatStats[type] || { in: 0, out: 0, stock: 0 };
            const isPcs = type === "Hati + Sampil";
            const mainUnit = isPcs ? "Pcs" : "Kresek Kecil";
            const pct =
              stats.in === 0 ? 0 : Math.round((stats.stock / stats.in) * 100);

            return (
              <div
                key={type}
                className="bg-white rounded-xl shadow-sm border border-slate-200 p-5"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg">
                      <Package size={20} />
                    </div>
                    <h3 className="font-semibold text-slate-800">
                      {isPcs ? "Hati + Sampil" : `Daging ${type}`}
                    </h3>
                  </div>
                  <span className="text-2xl font-bold text-slate-900">
                    {stats.stock.toLocaleString("id-ID")}
                    <span className="text-sm font-normal text-slate-400 ml-1">{mainUnit}</span>
                  </span>
                </div>

                {/* Mini progress sisa stok */}
                <div className="w-full bg-slate-100 rounded-full h-1.5">
                  <div
                    className="bg-blue-400 h-1.5 rounded-full"
                    style={{ width: `${pct}%` }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 mt-3 pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-1.5 text-sm">
                    <ArrowDownToLine size={13} className="text-green-500" />
                    <span className="text-slate-500">Masuk:</span>
                    <span className="font-semibold text-green-600">
                      {stats.in.toLocaleString("id-ID")}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm">
                    <ArrowUpFromLine size={13} className="text-red-500" />
                    <span className="text-slate-500">Keluar:</span>
                    <span className="font-semibold text-red-500">
                      {stats.out.toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
