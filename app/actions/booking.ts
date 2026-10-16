"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import type { FormState } from "@/lib/types";

const bookingSchema = z.object({
  vehicleId: z.string().uuid(),
  start: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Choose a pickup date."),
  end: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Choose a return date."),
  method: z.enum(["bank_transfer", "ussd"], { message: "Choose how you will pay." }),
});

export async function createBooking(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = bookingSchema.safeParse({
    vehicleId: formData.get("vehicleId"),
    start: formData.get("start"),
    end: formData.get("end"),
    method: formData.get("method"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("book_vehicle", {
    p_vehicle_id: parsed.data.vehicleId,
    p_start: parsed.data.start,
    p_end: parsed.data.end,
    p_method: parsed.data.method,
  });

  if (error) return { error: error.message };

  revalidatePath("/reservations");
  redirect(`/reservations/${data}?new=1`);
}

export async function cancelReservation(formData: FormData) {
  const id = String(formData.get("reservationId") ?? "");
  const supabase = await createClient();
  const { error } = await supabase.rpc("cancel_reservation", { p_reservation_id: id });

  revalidatePath("/reservations");
  revalidatePath(`/reservations/${id}`);
  redirect(
    error
      ? `/reservations/${id}?error=${encodeURIComponent(error.message)}`
      : `/reservations/${id}?notice=${encodeURIComponent("Your reservation has been cancelled.")}`,
  );
}
