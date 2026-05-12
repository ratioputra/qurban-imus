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

export type InventoryRow = {
  meat_type: string;
  stock: number;
};

export type LaporanData = {
  transactions: TxRow[];
  inventory: InventoryRow[];
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
    supabase.from("inventory").select("meat_type, stock"),
  ]);

  const transactions = (txData as TxRow[]) || [];
  const inventory = (invData as InventoryRow[]) || [];

  let totalIn = 0;
  let totalOut = 0;
  let totalStock = 0;

  transactions.forEach((tx) => {
    if (tx.transaction_type === "IN") totalIn += tx.amount;
    else totalOut += tx.amount;
  });

  inventory.forEach((inv) => { totalStock += inv.stock; });

  return { transactions, inventory, totalIn, totalOut, totalStock };
}
