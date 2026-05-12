"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export type Asatidz = {
  id: number;
  name: string;
  asal: string | null;
  ponpes: string | null;
  status_distribusi: boolean;
};

export async function getAsatidzList(): Promise<Asatidz[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("asatidz")
    .select("id, name, asal, ponpes, status_distribusi")
    .order("id", { ascending: false });

  if (error) {
    console.error("Error fetching asatidz:", error);
    return [];
  }
  return (data as Asatidz[]) || [];
}

export async function createAsatidz(data: Omit<Asatidz, "id" | "status_distribusi">) {
  const supabase = await createClient();
  const { error } = await supabase.from("asatidz").insert({
    name: data.name,
    asal: data.asal || null,
    ponpes: data.ponpes || null,
    status_distribusi: false,
  });

  if (error) return { success: false, error: error.message };
  revalidatePath("/asatidz");
  return { success: true };
}

export async function updateAsatidz(id: number, data: Omit<Asatidz, "id" | "status_distribusi">) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("asatidz")
    .update({
      name: data.name,
      asal: data.asal || null,
      ponpes: data.ponpes || null,
    })
    .eq("id", id);

  if (error) return { success: false, error: error.message };
  revalidatePath("/asatidz");
  return { success: true };
}

export async function deleteAsatidz(id: number) {
  const supabase = await createClient();
  const { error } = await supabase.from("asatidz").delete().eq("id", id);
  if (error) return { success: false, error: error.message };
  revalidatePath("/asatidz");
  return { success: true };
}
