import {
  Package,
  ArrowDownToLine,
  ArrowUpFromLine,
  Boxes,
  Users,
  GraduationCap,
  HeartHandshake,
  Ticket,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { RealtimeRefresher } from "@/components/RealtimeRefresher";
import { TimeAgo } from "@/components/TimeAgo";
import { DashboardQuickActions } from "@/app/(app)/DashboardQuickActions";
import { getPackages } from "@/app/(app)/mudhohi/actions";
import { ResetDatabase } from "@/components/ResetDatabase";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// ── Helper: progress bar ──────────────────────────────────────────────────────
function ProgressBar({
  value,
  max,
  color = "bg-blue-500",
}: {
  value: number;
  max: number;
  color?: string;
}) {
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

function StockAmounts({
  daging,
  jeroan,
  beratKg,
}: {
  daging: number;
  jeroan: number;
  beratKg: number;
}) {
  return (
    <>
      <div className="mt-1 space-y-0.5" suppressHydrationWarning>
        <p className="text-lg sm:text-2xl font-bold text-slate-900">
          {daging.toLocaleString("id-ID")}
          <span className="text-sm font-normal text-muted-foreground">
            {" "}
            Daging
          </span>
        </p>
        <p className="text-lg sm:text-2xl font-bold text-slate-900">
          {jeroan.toLocaleString("id-ID")}
          <span className="text-sm font-normal text-muted-foreground">
            {" "}
            Hati + Sampil
          </span>
        </p>
      </div>
      <p className="text-sm text-slate-400 mt-1" suppressHydrationWarning>
        {beratKg.toLocaleString("id-ID")} kg
      </p>
    </>
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
    { count: kuponCount },
    { count: masyarakatCount },
    packages,
  ] = await Promise.all([
    supabase.from("inventory").select("meat_type, stock"),
    supabase.from("transactions").select("meat_type, transaction_type, amount"),
    // 5 transaksi terbaru (IN + OUT)
    supabase
      .from("transactions")
      .select(
        "id, created_at, transaction_type, meat_type, amount, recipient_name, recipient_type",
      )
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
    // Transaksi OUT — Kupon
    supabase
      .from("transactions")
      .select("*", { count: "exact", head: true })
      .eq("transaction_type", "OUT")
      .eq("recipient_type", "Kupon"),
    // Transaksi OUT — Masyarakat
    supabase
      .from("transactions")
      .select("*", { count: "exact", head: true })
      .eq("transaction_type", "OUT")
      .eq("recipient_type", "Masyarakat"),
    getPackages(),
  ]);

  const inventory = inventoryData || [];
  const transactions = txData || [];
  const recentTx = recentTxData || [];

  // ── Konstanta kategori ────────────────────────────────────────────────────
  const DAGING_TYPES = ["Sapi", "Kambing"];
  const BERAT_PER_KRESEK = 0.5; // kg per kresek

  // ── Agregat dari tabel transactions ──────────────────────────────────────
  // Input (IN)
  let inputDaging = 0; // kresek Sapi + Kambing
  let inputJeroan = 0; // pcs Hati + Sampil

  // Output / distribusi (OUT)
  let outputDaging = 0;
  let outputJeroan = 0;

  // Untuk Rincian Stok per Jenis Daging (tetap dipakai di bawah)
  const meatStats: Record<string, { in: number; out: number; stock: number }> =
    {
      Sapi: { in: 0, out: 0, stock: 0 },
      Kambing: { in: 0, out: 0, stock: 0 },
      "Hati + Sampil": { in: 0, out: 0, stock: 0 },
    };

  transactions.forEach(
    (tx: { meat_type: string; transaction_type: string; amount: number }) => {
      const amt = tx.amount || 0;
      const isDaging = DAGING_TYPES.includes(tx.meat_type);
      const isJeroan = tx.meat_type === "Hati + Sampil"; // Tambahkan filter spesifik ini

      if (tx.transaction_type === "IN") {
        if (isDaging) inputDaging += amt;
        else if (isJeroan) inputJeroan += amt; // Lebih aman daripada sekadar 'else'

        if (meatStats[tx.meat_type]) meatStats[tx.meat_type].in += amt;
      } else if (tx.transaction_type === "OUT") {
        if (isDaging) {
          outputDaging += amt;
        } else if (isJeroan) {
          // SEBELUMNYA: hanya else, sehingga OUT apapun masuk sini
          // SEKARANG: Hanya OUT yang meat_type-nya "Hati + Sampil" yang masuk
          outputJeroan += amt;
        }

        if (meatStats[tx.meat_type]) meatStats[tx.meat_type].out += amt;
      }
    },
  );

  // ── Agregat dari tabel inventory (stok saat ini) ──────────────────────────
  let stockDaging = 0; // kresek Sapi + Kambing
  let stockJeroan = 0; // pcs Hati + Sampil

  inventory.forEach((item: { meat_type: string; stock: number }) => {
    const s = item.stock || 0;
    if (DAGING_TYPES.includes(item.meat_type)) stockDaging += s;
    else if (item.meat_type === "Hati + Sampil") stockJeroan += s;

    if (meatStats[item.meat_type]) {
      meatStats[item.meat_type].stock = s;
    } else {
      meatStats[item.meat_type] = { in: 0, out: 0, stock: s };
    }
  });

  // Berat (kg) = kresek × 0.5
  const inputBeratKg = inputDaging * BERAT_PER_KRESEK;
  const stockBeratKg = stockDaging * BERAT_PER_KRESEK;
  const outputBeratKg = outputDaging * BERAT_PER_KRESEK;

  const meatTypes = ["Sapi", "Kambing", "Hati + Sampil"];

  // Nilai progres
  const mTotal = mudhohiTotal ?? 0;
  const mDone = mudhohiDone ?? 0;
  const aTotal = asatidzTotal ?? 0;
  const aDone = asatidzDone ?? 0;
  const kuponTotal = kuponCount ?? 0;
  const masyarakatTotal = masyarakatCount ?? 0;

  return (
    <div className="space-y-6 sm:space-y-8 md:space-y-10">
      <RealtimeRefresher />
      {/* ── Judul ── */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-sm sm:text-base text-slate-500 mt-1 sm:mt-2">
          Ringkasan operasional dan stok daging qurban secara real-time.
        </p>
      </div>

      {/* ── Quick Actions ── */}
      <DashboardQuickActions packages={packages} />

      {/* ── Stats Cards Stok ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Card 1 — Total Terinput */}
        <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-sm flex items-start sm:items-center gap-3 sm:gap-4 min-w-0">
          <div className="p-3 sm:p-4 bg-green-50 text-green-600 rounded-full shrink-0">
            <ArrowDownToLine className="w-6 h-6 sm:w-7 sm:h-7" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-slate-500">Total Terinput</p>
            <StockAmounts
              daging={inputDaging}
              jeroan={inputJeroan}
              beratKg={inputBeratKg}
            />
          </div>
        </div>

        {/* Card 2 — Stok Saat Ini */}
        <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-sm flex items-start sm:items-center gap-3 sm:gap-4 min-w-0">
          <div className="p-3 sm:p-4 bg-blue-50 text-blue-600 rounded-full shrink-0">
            <Boxes className="w-6 h-6 sm:w-7 sm:h-7" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-slate-500">Stok Saat Ini</p>
            <StockAmounts
              daging={stockDaging}
              jeroan={stockJeroan}
              beratKg={stockBeratKg}
            />
          </div>
        </div>

        {/* Card 3 — Total Terdistribusi */}
        <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-sm flex items-start sm:items-center gap-3 sm:gap-4 min-w-0 sm:col-span-2 lg:col-span-1">
          <div className="p-3 sm:p-4 bg-red-50 text-red-600 rounded-full shrink-0">
            <ArrowUpFromLine className="w-6 h-6 sm:w-7 sm:h-7" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-slate-500">
              Total Terdistribusi
            </p>
            <StockAmounts
              daging={outputDaging}
              jeroan={outputJeroan}
              beratKg={outputBeratKg}
            />
          </div>
        </div>
      </div>

      {/* ── Progres Distribusi Penerima ── */}
      <div>
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-3 sm:mb-4">
          Progres Distribusi Penerima
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Mudhohi */}
          <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                  <Users size={18} />
                </div>
                <p className="font-semibold text-slate-700">Mudhohi</p>
              </div>
              <span
                className="text-sm font-medium text-slate-500"
                suppressHydrationWarning
              >
                {mTotal === 0 ? "0%" : `${Math.round((mDone / mTotal) * 100)}%`}
              </span>
            </div>
            <p
              className="text-3xl font-bold text-slate-900 mt-3"
              suppressHydrationWarning
            >
              {mDone}
              <span className="text-lg font-normal text-slate-400">
                /{mTotal}
              </span>
            </p>
            <p className="text-sm text-slate-500 mt-0.5">
              sudah menerima distribusi
            </p>
            <ProgressBar value={mDone} max={mTotal} color="bg-purple-500" />
          </div>

          {/* Asatidz */}
          <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <GraduationCap size={18} />
                </div>
                <p className="font-semibold text-slate-700">Asatidz</p>
              </div>
              <span
                className="text-sm font-medium text-slate-500"
                suppressHydrationWarning
              >
                {aTotal === 0
                  ? "0%"
                  : `${Math.min(100, Math.round((aDone / aTotal) * 100))}%`}
              </span>
            </div>
            <p
              className="text-3xl font-bold text-slate-900 mt-3"
              suppressHydrationWarning
            >
              {aDone}
              <span className="text-lg font-normal text-slate-400">
                /{aTotal}
              </span>
            </p>
            <p className="text-sm text-slate-500 mt-0.5">
              sudah menerima distribusi
            </p>
            <ProgressBar value={aDone} max={aTotal} color="bg-blue-500" />
          </div>

          {/* Kupon */}
          <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                  <Ticket size={18} />
                </div>
                <p className="font-semibold text-slate-700">Kupon</p>
              </div>
            </div>
            <p
              className="text-3xl font-bold text-slate-900 mt-3"
              suppressHydrationWarning
            >
              {kuponTotal}
            </p>
            <p className="text-sm text-slate-500 mt-0.5">
              total transaksi distribusi
            </p>
            <div className="w-full bg-slate-100 rounded-full h-2 mt-3">
              <div className="bg-amber-400 h-2 rounded-full w-full" />
            </div>
          </div>

          {/* Masyarakat */}
          <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-slate-100 text-slate-600 rounded-lg">
                  <HeartHandshake size={18} />
                </div>
                <p className="font-semibold text-slate-700">Masyarakat</p>
              </div>
            </div>
            <p
              className="text-3xl font-bold text-slate-900 mt-3"
              suppressHydrationWarning
            >
              {masyarakatTotal}
            </p>
            <p className="text-sm text-slate-500 mt-0.5">
              total transaksi distribusi
            </p>
            <div className="w-full bg-slate-100 rounded-full h-2 mt-3">
              <div className="bg-slate-500 h-2 rounded-full w-full" />
            </div>
          </div>
        </div>
      </div>

      {/* ── Aktivitas Terkini + Rincian Stok ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Aktivitas Terkini */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-100 bg-slate-50">
            <h2 className="text-base sm:text-lg font-semibold text-slate-800">
              Aktivitas Terkini
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              5 transaksi terakhir
            </p>
          </div>
          <ul className="divide-y divide-slate-100">
            {recentTx.length === 0 ? (
              <li className="px-4 sm:px-6 py-8 text-center text-slate-500 text-sm">
                Belum ada aktivitas.
              </li>
            ) : (
              recentTx.map((tx: any) => {
                const isIn = tx.transaction_type === "IN";
                const label = isIn
                  ? "Produksi"
                  : tx.recipient_name || tx.recipient_type || "Distribusi";
                const satuan =
                  tx.meat_type === "Hati + Sampil" ? "Pcs" : "Kresek";

                return (
                  <li key={tx.id} className="px-4 sm:px-6 py-3 sm:py-4 flex items-center gap-3 sm:gap-4">
                    {/* Icon */}
                    <div
                      className={`p-2 rounded-full flex-shrink-0 ${
                        isIn
                          ? "bg-green-50 text-green-600"
                          : "bg-red-50 text-red-500"
                      }`}
                    >
                      {isIn ? (
                        <TrendingUp size={16} />
                      ) : (
                        <TrendingDown size={16} />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-800 truncate">
                        {label}
                      </p>
                      <p className="text-sm text-slate-500">{tx.meat_type}</p>
                    </div>

                    {/* Jumlah + waktu */}
                    <div className="text-right flex-shrink-0">
                      <p
                        className={`font-semibold ${
                          isIn ? "text-green-600" : "text-red-500"
                        }`}
                      >
                        {isIn ? "+" : "-"}
                        {tx.amount} {satuan}
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
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">
            Rincian Stok per Jenis Daging
          </h2>
          {meatTypes.map((type) => {
            const stats = meatStats[type] || { in: 0, out: 0, stock: 0 };
            const isPcs = type === "Hati + Sampil";
            const mainUnit = isPcs ? "Pcs" : "Kresek Kecil";
            const pct =
              stats.in === 0 ? 0 : Math.round((stats.stock / stats.in) * 100);

            return (
              <div
                key={type}
                className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-5"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg shrink-0">
                      <Package size={20} />
                    </div>
                    <h3 className="font-semibold text-slate-800 truncate">
                      {isPcs ? "Hati + Sampil" : `Daging ${type}`}
                    </h3>
                  </div>
                  <span
                    className="text-xl sm:text-2xl font-bold text-slate-900 shrink-0"
                    suppressHydrationWarning
                  >
                    {stats.stock.toLocaleString("id-ID")}
                    <span className="text-sm font-normal text-slate-400 ml-1">
                      {mainUnit}
                    </span>
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
                    <span
                      className="font-semibold text-green-600"
                      suppressHydrationWarning
                    >
                      {stats.in.toLocaleString("id-ID")}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm">
                    <ArrowUpFromLine size={13} className="text-red-500" />
                    <span className="text-slate-500">Keluar:</span>
                    <span
                      className="font-semibold text-red-500"
                      suppressHydrationWarning
                    >
                      {stats.out.toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Pengaturan / Zona Bahaya ── */}
      <section className="rounded-xl border border-red-200 bg-red-50/40 p-4 sm:p-6">
        <h2 className="text-lg font-semibold text-slate-900">Pengaturan</h2>
        <p className="text-sm text-slate-600 mt-1 max-w-2xl">
          Reset seluruh data qurban (transaksi, mudhohi, asatidz, dan stok).
          Gunakan hanya saat memulai periode qurban baru.
        </p>
        <div className="mt-4">
          <ResetDatabase />
        </div>
      </section>
    </div>
  );
}
