import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/lib/auth";

const escape = (v: unknown) => {
  const s = v === null || v === undefined ? "" : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

function toCsv(rows: Record<string, unknown>[]) {
  if (rows.length === 0) return "No data\n";
  const headers = Object.keys(rows[0]);
  return [headers.join(","), ...rows.map((r) => headers.map((h) => escape(r[h])).join(","))].join("\n") + "\n";
}

export async function GET(request: NextRequest) {
  const profile = await getProfile();
  if (!profile || profile.role !== "admin") return new NextResponse("Forbidden", { status: 403 });

  const type = request.nextUrl.searchParams.get("type");
  const supabase = await createClient();
  let rows: Record<string, unknown>[] = [];

  if (type === "reservations") {
    const { data } = await supabase
      .from("reservations")
      .select("reference, start_date, end_date, amount, status, created_at, vehicles(brand, model, registration_no), profiles(full_name, email, phone)")
      .order("created_at", { ascending: false });
    rows = (data ?? []).map((r: any) => ({
      reference: r.reference,
      customer: r.profiles?.full_name,
      email: r.profiles?.email,
      phone: r.profiles?.phone,
      vehicle: `${r.vehicles?.brand ?? ""} ${r.vehicles?.model ?? ""}`.trim(),
      plate: r.vehicles?.registration_no,
      start_date: r.start_date,
      end_date: r.end_date,
      amount_ngn: r.amount,
      status: r.status,
      created_at: r.created_at,
    }));
  } else if (type === "payments") {
    const { data } = await supabase
      .from("payments")
      .select("reference, amount, method, status, payment_date, created_at, reservations(reference, profiles(full_name, email))")
      .order("created_at", { ascending: false });
    rows = (data ?? []).map((p: any) => ({
      payment_reference: p.reference,
      booking_reference: p.reservations?.reference,
      customer: p.reservations?.profiles?.full_name,
      email: p.reservations?.profiles?.email,
      method: p.method,
      amount_ngn: p.amount,
      status: p.status,
      paid_on: p.payment_date,
      created_at: p.created_at,
    }));
  } else if (type === "customers") {
    const { data } = await supabase
      .from("profiles")
      .select("full_name, email, phone, address, created_at")
      .eq("role", "customer")
      .order("created_at", { ascending: false });
    rows = data ?? [];
  } else if (type === "vehicles") {
    const { data } = await supabase
      .from("vehicles")
      .select("registration_no, brand, model, year, type, color, seats, transmission, fuel, rate, status")
      .order("brand");
    rows = data ?? [];
  } else {
    return new NextResponse("Unknown export type", { status: 400 });
  }

  return new NextResponse(toCsv(rows), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${type}-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
