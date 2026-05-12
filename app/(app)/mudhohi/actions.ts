"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export type MudhohiRow = {
  id: string;
  name: string;
  asal: string | null;
  phone: string | null;
  status_distribusi: boolean;
  package_id: string | null;
  packages: { name: string; part_1_name: string | null; part_2_name: string | null } | null;
};

export async function getMudhohi(): Promise<MudhohiRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('mudhohi')
    .select(`
      id,
      name,
      asal,
      phone,
      status_distribusi,
      package_id,
      packages ( name, part_1_name, part_2_name )
    `)
    .order('id', { ascending: false });

  if (error) {
    console.error("Error fetching mudhohi:", error);
    return [];
  }

  const normalized = (data || []).map((row: any) => ({
    ...row,
    packages: Array.isArray(row.packages)
      ? (row.packages[0] ?? null)
      : (row.packages ?? null),
  }));

  return normalized as MudhohiRow[];
}

export async function getPackages(): Promise<{ id: string; name: string }[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('packages')
    .select('id, name')
    .order('sort_order', { ascending: true });

  if (error) {
    console.error("Error fetching packages:", error);
    return [];
  }
  return (data || []) as { id: string; name: string }[];
}

export async function createMudhohi(data: { name: string; asal: string; phone: string; package_id: string }) {
  if (!data.package_id) {
    return { success: false, error: "Paket wajib dipilih" };
  }

  const supabase = await createClient();
  const { error } = await supabase.from('mudhohi').insert({
    name: data.name,
    asal: data.asal || null,
    phone: data.phone || null,
    package_id: data.package_id,
    status_distribusi: false
  });

  if (error) {
    console.error("Supabase insert error:", error);
    return { success: false, error: error.message };
  }

  revalidatePath('/mudhohi');
  return { success: true };
}

export async function updateMudhohi(id: string, data: { name: string; asal: string; phone: string; package_id: string }) {
  if (!data.package_id) {
    return { success: false, error: "Paket wajib dipilih" };
  }

  const supabase = await createClient();
  const { error } = await supabase.from('mudhohi').update({
    name: data.name,
    asal: data.asal || null,
    phone: data.phone || null,
    package_id: data.package_id
  }).eq('id', id);

  if (error) return { success: false, error: error.message };
  revalidatePath('/mudhohi');
  return { success: true };
}

export async function deleteMudhohi(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('mudhohi').delete().eq('id', id);
  if (error) return { success: false, error: error.message };
  revalidatePath('/mudhohi');
  return { success: true };
}
