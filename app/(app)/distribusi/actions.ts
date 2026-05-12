"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export type PackageData = {
  id: number;
  name: string;
  part_1_name: string;
  part_1_qty: number;
  part_2_name: string | null;
  part_2_qty: number | null;
};

export type MudhohiJatah = {
  packageName: string;
  summary: string;
  part1: { name: string; qty: number };
  part2: { name: string; qty: number } | null;
};

export async function getAsatidzList() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("asatidz")
    .select("id, name")
    .eq("status_distribusi", false)
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching asatidz:", error);
    return [];
  }
  return data || [];
}

export async function getMudhohiList() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("mudhohi")
    .select("id, name, status_distribusi")
    .eq("status_distribusi", false)
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching mudhohi:", error);
    return [];
  }
  return data || [];
}

export async function getMudhohiJatah(mudhohiId: string): Promise<MudhohiJatah | null> {
  const supabase = await createClient();

  const { data: mudhohiRow, error: mudhohiError } = await supabase
    .from("mudhohi")
    .select("package_id")
    .eq("id", mudhohiId)
    .single();

  if (mudhohiError || !mudhohiRow || !mudhohiRow.package_id) {
    console.error("Error fetching mudhohi row:", mudhohiError);
    return null;
  }

  const { data: pkg, error: pkgError } = await supabase
    .from("packages")
    .select("id, name, part_1_name, part_1_qty, part_2_name, part_2_qty")
    .eq("id", mudhohiRow.package_id)
    .single();

  if (pkgError || !pkg) {
    console.error("Error fetching package:", pkgError);
    return null;
  }

  const summaryParts = [`${pkg.part_1_qty}x ${pkg.part_1_name}`];
  if (pkg.part_2_name && pkg.part_2_qty) {
    summaryParts.push(`${pkg.part_2_qty}x ${pkg.part_2_name}`);
  }

  return {
    packageName: pkg.name,
    summary: summaryParts.join(" dan "),
    part1: { name: pkg.part_1_name, qty: pkg.part_1_qty },
    part2:
      pkg.part_2_name && pkg.part_2_qty
        ? { name: pkg.part_2_name, qty: pkg.part_2_qty }
        : null,
  };
}

export async function submitDistribusi(data: {
  recipient_type: string;
  recipient_name?: string;
  mudhohi_id?: string;
  asatidz_id?: string;
  meat_type_1?: string;
  qty_1?: number;
  meat_type_2?: string;
  qty_2?: number;
  // Legacy fields
  meat_type?: string;
  amount?: number;
}) {
  const {
    recipient_type,
    recipient_name,
    mudhohi_id,
    asatidz_id,
    meat_type_1,
    qty_1,
    meat_type_2,
    qty_2,
    meat_type,
    amount,
  } = data;

  const item1MeatType = meat_type_1 ?? meat_type;
  const item1Qty      = qty_1       ?? amount;

  const supabase = await createClient();

  try {
    if (recipient_type === "Mudhohi") {
      if (!mudhohi_id) {
        return { success: false, error: "Pilih Mudhohi terlebih dahulu" };
      }

      const { error: rpcError } = await supabase.rpc("proses_distribusi_mudhohi", {
        p_mudhohi_id: mudhohi_id,
      });

      if (rpcError) {
        console.error("RPC proses_distribusi_mudhohi error:", rpcError);
        const msg = rpcError.message ?? "";
        if (msg.toLowerCase().includes("stok") || msg.toLowerCase().includes("stock") || msg.toLowerCase().includes("insufficient")) {
          return { success: false, error: `Stok tidak cukup untuk memenuhi jatah paket Mudhohi ini. Detail: ${msg}` };
        }
        if (msg.toLowerCase().includes("sudah") || msg.toLowerCase().includes("already")) {
          return { success: false, error: "Mudhohi ini sudah menerima distribusi sebelumnya." };
        }
        if (msg.toLowerCase().includes("paket") || msg.toLowerCase().includes("package")) {
          return { success: false, error: "Mudhohi tidak memiliki paket yang ditetapkan." };
        }
        return { success: false, error: msg || "Gagal memproses distribusi Mudhohi" };
      }

    } else if (recipient_type === "Asatidz") {
      if (!asatidz_id) {
        return { success: false, error: "Pilih Asatidz terlebih dahulu" };
      }
      if (!item1MeatType) {
        return { success: false, error: "Pilih jenis daging pertama" };
      }
      if (!item1Qty || item1Qty <= 0) {
        return { success: false, error: "Masukkan jumlah daging pertama yang valid" };
      }

      const { error: rpcError } = await supabase.rpc("proses_distribusi_multi_manual", {
        p_recipient_name: recipient_name ?? "",
        p_recipient_type: recipient_type,
        p_meat_type_1:    item1MeatType,
        p_qty_1:          item1Qty,
        p_meat_type_2:    meat_type_2 || null,
        p_qty_2:          qty_2 || null,
        p_asatidz_id:     asatidz_id || null,
      });

      if (rpcError) {
        console.error("RPC proses_distribusi_multi_manual (Asatidz) error:", rpcError);
        return { success: false, error: rpcError.message || "Gagal memproses distribusi Asatidz" };
      }

    } else {
      if (!item1MeatType) {
        return { success: false, error: "Pilih jenis daging pertama" };
      }
      if (!item1Qty || item1Qty <= 0) {
        return { success: false, error: "Masukkan jumlah daging pertama yang valid" };
      }

      const { error: rpcError } = await supabase.rpc("proses_distribusi_multi_manual", {
        p_recipient_name: recipient_name ?? recipient_type,
        p_recipient_type: recipient_type,
        p_meat_type_1:    item1MeatType,
        p_qty_1:          item1Qty,
        p_meat_type_2:    meat_type_2 || null,
        p_qty_2:          qty_2 || null,
        p_asatidz_id:     null,
      });

      if (rpcError) {
        console.error("RPC proses_distribusi_multi_manual error:", rpcError);
        return { success: false, error: rpcError.message || "Gagal memproses distribusi" };
      }
    }

    revalidatePath("/distribusi");
    revalidatePath("/produksi");
    revalidatePath("/mudhohi");
    revalidatePath("/asatidz");
    revalidatePath("/");

    return { success: true };
  } catch (err: any) {
    console.error("Error submitting distribusi:", err);
    return { success: false, error: err.message || "Terjadi kesalahan tidak terduga" };
  }
}
