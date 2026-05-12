"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function submitProduksi(data: {
  meat_type: 'Sapi' | 'Kambing' | 'Hati + Sampil';
  amount: number;
}) {
  const { meat_type, amount } = data;

  if (!meat_type || amount <= 0) {
    return { success: false, error: "Data tidak valid" };
  }

  const supabase = await createClient();

  try {
    const { error: txError } = await supabase.from('transactions').insert({
      meat_type,
      transaction_type: 'IN',
      amount,
      recipient_type: 'Internal',
    });

    if (txError) throw txError;

    const { data: invData, error: invError } = await supabase
      .from('inventory')
      .select('id, stock')
      .eq('meat_type', meat_type)
      .single();

    if (invError && invError.code !== 'PGRST116') {
      throw invError;
    }

    if (invData) {
      const { error: updateError } = await supabase
        .from('inventory')
        .update({ stock: invData.stock + amount })
        .eq('id', invData.id);

      if (updateError) throw updateError;
    } else {
      const { error: insertError } = await supabase
        .from('inventory')
        .insert({ meat_type, stock: amount });

      if (insertError) throw insertError;
    }

    revalidatePath("/produksi");
    revalidatePath("/");

    return { success: true };
  } catch (err: any) {
    console.error("Error submitting produksi:", err);
    return { success: false, error: err.message || "Terjadi kesalahan" };
  }
}
