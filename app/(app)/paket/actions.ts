"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export type Paket = {
  id: number;
  name: string;
  price: number;
  meat_type: string;
  part_1_name: string;
  part_1_qty: number;
  part_2_name: string | null;
  part_2_qty: number | null;
};

export async function getPaketList(): Promise<Paket[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("packages")
    .select("id, name, price, meat_type, part_1_name, part_1_qty, part_2_name, part_2_qty")
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("Error fetching packages:", error);
    return [];
  }
  return (data as Paket[]) || [];
}

export async function createPaket(data: Omit<Paket, "id">) {
  const supabase = await createClient();
  const { error } = await supabase.from("packages").insert({
    name: data.name,
    price: data.price,
    meat_type: data.meat_type,
    part_1_name: data.part_1_name,
    part_1_qty: data.part_1_qty,
    part_2_name: data.part_2_name || null,
    part_2_qty: data.part_2_qty || null,
  });

  if (error) return { success: false, error: error.message };
  revalidatePath("/paket");
  revalidatePath("/mudhohi");
  return { success: true };
}

export async function updatePaket(id: number, data: Omit<Paket, "id">) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("packages")
    .update({
      name: data.name,
      price: data.price,
      meat_type: data.meat_type,
      part_1_name: data.part_1_name,
      part_1_qty: data.part_1_qty,
      part_2_name: data.part_2_name || null,
      part_2_qty: data.part_2_qty || null,
    })
    .eq("id", id);

  if (error) return { success: false, error: error.message };
  revalidatePath("/paket");
  revalidatePath("/mudhohi");
  return { success: true };
}

export async function deletePaket(id: number) {
  const supabase = await createClient();
  const { error } = await supabase.from("packages").delete().eq("id", id);
  if (error) return { success: false, error: error.message };
  revalidatePath("/paket");
  revalidatePath("/mudhohi");
  return { success: true };
}
