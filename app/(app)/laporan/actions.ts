"use server";

import { createClient } from "@/utils/supabase/server";

export type TxRow = {
  id: number;
  created_at: string;
  transaction_type: "IN" | "OUT";
  meat_type: string;
  amount: number;
  recipient_type: string | null;
  recipient_name: string | null;
};

/** Baris dari view `inventory_summary` (agregasi dari transaksi). */
export type InventorySummaryRow = {
  meat_type: string;
  total_in: number;
  total_out: number;
  current_stock: number;
  total_berat_kg: number | null;
};

export type LaporanData = {
  transactions: TxRow[];
  inventorySummary: InventorySummaryRow[];
  totalIn: number;
  totalOut: number;
  totalStock: number;
};

export async function getLaporanData(): Promise<LaporanData> {
  const supabase = await createClient();

  const [{ data: txData }, { data: invData }] = await Promise.all([
    supabase
      .from("transactions")
      .select(
        "id, created_at, transaction_type, meat_type, amount, recipient_type, recipient_name"
      )
      .order("created_at", { ascending: false }),
    supabase
      .from("inventory_summary")
      .select("meat_type, total_in, total_out, current_stock, total_berat_kg")
      .order("meat_type"),
  ]);

  const transactions = (txData as TxRow[]) || [];
  const rawSummary = (invData as InventorySummaryRow[]) || [];

  const inventorySummary: InventorySummaryRow[] = rawSummary.map((row) => ({
    meat_type: row.meat_type,
    total_in: Number(row.total_in) || 0,
    total_out: Number(row.total_out) || 0,
    current_stock: Number(row.current_stock) || 0,
    total_berat_kg:
      row.total_berat_kg === null || row.total_berat_kg === undefined
        ? null
        : Number(row.total_berat_kg),
  }));

  let totalIn = 0;
  let totalOut = 0;
  let totalStock = 0;

  transactions.forEach((tx) => {
    if (tx.transaction_type === "IN") totalIn += tx.amount;
    else totalOut += tx.amount;
  });

  inventorySummary.forEach((row) => {
    totalStock += row.current_stock;
  });

  return { transactions, inventorySummary, totalIn, totalOut, totalStock };
}
