"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth";
import type { FormState } from "@/lib/types";

function backTo(formData: FormData, fallback: string) {
  const value = String(formData.get("returnTo") ?? "");
  return value.startsWith("/admin") ? value.split("?")[0] : fallback;
}

function flash(path: string, kind: "notice" | "error", message: string): never {
  redirect(`${path}?${kind}=${encodeURIComponent(message)}`);
}

const vehicleSchema = z.object({
  registration_no: z.string().trim().min(3, "Enter the registration number.").transform((v) => v.toUpperCase()),
  brand: z.string().trim().min(1, "Enter the brand."),
  model: z.string().trim().min(1, "Enter the model."),
  year: z.coerce.number().int().min(1990, "Enter a valid year.").max(2100, "Enter a valid year."),
  type: z.enum(["sedan", "hatchback", "suv", "pickup", "bus", "luxury"]),
  color: z.string().trim().optional(),
  seats: z.coerce.number().int().min(1, "Seats must be at least 1.").max(60),
  transmission: z.enum(["automatic", "manual"]),
  fuel: z.enum(["petrol", "diesel", "hybrid", "electric"]),
  rate: z.coerce.number().positive("Enter a daily rate greater than zero."),
  status: z.enum(["available", "rented", "maintenance"]),
  image_url: z
    .string()
    .trim()
    .optional()
    .refine((v) => !v || /^https:\/\//.test(v), "The image link must start with https://"),
  description: z.string().trim().optional(),
});

export async function saveVehicle(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();

  const parsed = vehicleSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const values = {
    ...parsed.data,
    color: parsed.data.color || null,
    image_url: parsed.data.image_url || null,
    description: parsed.data.description || null,
  };

  const id = String(formData.get("id") ?? "");
  const supabase = await createClient();
  const { error } = id
    ? await supabase.from("vehicles").update(values).eq("id", id)
    : await supabase.from("vehicles").insert(values);

  if (error) {
    return {
      error:
        error.code === "23505"
          ? "A vehicle with this registration number already exists."
          : error.message,
    };
  }

  revalidatePath("/admin/vehicles");
  revalidatePath("/vehicles");
  redirect(`/admin/vehicles?notice=${encodeURIComponent(id ? "Vehicle updated." : "Vehicle added.")}`);
}

export async function deleteVehicle(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const supabase = await createClient();
  const { error } = await supabase.from("vehicles").delete().eq("id", id);

  revalidatePath("/admin/vehicles");
  revalidatePath("/vehicles");
  if (error) {
    flash(
      "/admin/vehicles",
      "error",
      error.code === "23503"
        ? "This vehicle has reservations, so it cannot be deleted. Set it to maintenance instead."
        : error.message,
    );
  }
  flash("/admin/vehicles", "notice", "Vehicle deleted.");
}

export async function setVehicleStatus(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const status = z.enum(["available", "rented", "maintenance"]).safeParse(formData.get("status"));
  if (!status.success) flash("/admin/vehicles", "error", "Invalid status.");

  const supabase = await createClient();
  const { error } = await supabase.from("vehicles").update({ status: status.data }).eq("id", id);

  revalidatePath("/admin/vehicles");
  revalidatePath("/vehicles");
  if (error) flash("/admin/vehicles", "error", error.message);
  flash("/admin/vehicles", "notice", "Vehicle status updated.");
}

export async function updateReservationStatus(formData: FormData) {
  await requireAdmin();
  const path = backTo(formData, "/admin/reservations");
  const status = z
    .enum(["pending", "confirmed", "active", "completed", "cancelled"])
    .safeParse(formData.get("status"));
  if (!status.success) flash(path, "error", "Invalid status.");

  const supabase = await createClient();
  const { error } = await supabase.rpc("admin_update_reservation_status", {
    p_reservation_id: String(formData.get("id") ?? ""),
    p_status: status.data,
  });

  revalidatePath("/admin", "layout");
  if (error) flash(path, "error", error.message);
  flash(path, "notice", "Reservation updated.");
}

export async function updatePaymentStatus(formData: FormData) {
  await requireAdmin();
  const path = backTo(formData, "/admin/payments");
  const status = z
    .enum(["pending", "successful", "failed", "refunded", "cancelled"])
    .safeParse(formData.get("status"));
  if (!status.success) flash(path, "error", "Invalid status.");

  const supabase = await createClient();
  const { error } = await supabase.rpc("admin_update_payment", {
    p_payment_id: String(formData.get("id") ?? ""),
    p_status: status.data,
  });

  revalidatePath("/admin", "layout");
  if (error) flash(path, "error", error.message);
  flash(path, "notice", "Payment updated.");
}
