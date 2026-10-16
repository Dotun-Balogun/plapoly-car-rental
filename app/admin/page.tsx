import type { Metadata } from "next";
import Link from "next/link";
import { CalendarCheck, CarFront, Users, Wallet } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PageHeader, StatCard, EmptyRow } from "@/components/admin-ui";
import { ReservationBadge } from "@/components/status-badge";
import { SubmitButton } from "@/components/submit-button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Flash } from "@/components/flash";
import { updatePaymentStatus } from "@/app/actions/admin";
import { formatDate, formatNaira } from "@/lib/utils";
import type { PaymentWithRelations, ReservationWithRelations } from "@/lib/types";

export const metadata: Metadata = { title: "Admin dashboard" };

export default async function AdminDashboard({ searchParams }: { searchParams: Promise<{ notice?: string; error?: string }> }) {
  const query = await searchParams;
  const supabase = await createClient();

  const [vehicles, availableVehicles, customers, reservations, pendingReservations, paid, pendingPayments, recent] = await Promise.all([
    supabase.from("vehicles").select("*", { count: "exact", head: true }),
    supabase.from("vehicles").select("*", { count: "exact", head: true }).eq("status", "available"),
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "customer"),
    supabase.from("reservations").select("*", { count: "exact", head: true }),
    supabase.from("reservations").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("payments").select("amount").eq("status", "successful"),
    supabase
      .from("payments")
      .select("*, reservations(reference, start_date, end_date, vehicles(brand, model), profiles(full_name, email))")
      .eq("status", "pending")
      .order("created_at", { ascending: true })
      .limit(6),
    supabase
      .from("reservations")
      .select("*, vehicles(*), profiles(full_name, email, phone), payments(*)")
      .order("created_at", { ascending: false })
      .limit(6),
  ]);

  const revenue = ((paid.data as { amount: number }[] | null) ?? []).reduce((s, p) => s + Number(p.amount), 0);
  const pending = (pendingPayments.data as PaymentWithRelations[] | null) ?? [];
  const recentReservations = (recent.data as ReservationWithRelations[] | null) ?? [];

  return (
    <>
      <PageHeader title="Dashboard" description="A quick look at your fleet, bookings and payments." />
      <Flash notice={query.notice} error={query.error} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Vehicles" value={String(vehicles.count ?? 0)} hint={`${availableVehicles.count ?? 0} available now`} icon={CarFront} />
        <StatCard label="Customers" value={String(customers.count ?? 0)} icon={Users} />
        <StatCard label="Reservations" value={String(reservations.count ?? 0)} hint={`${pendingReservations.count ?? 0} awaiting payment`} icon={CalendarCheck} />
        <StatCard label="Revenue (verified)" value={formatNaira(revenue)} icon={Wallet} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Payments to verify</CardTitle>
            <Link href="/admin/payments?status=pending" className="text-teal text-sm font-semibold hover:underline">View all</Link>
          </CardHeader>
          {pending.length === 0 ? (
            <EmptyRow>Nothing to verify. You are all caught up.</EmptyRow>
          ) : (
            <ul className="divide-y border-t">
              {pending.map((p) => (
                <li key={p.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 sm:px-6">
                  <div>
                    <p className="text-sm font-semibold">{p.reservations?.profiles?.full_name || p.reservations?.profiles?.email}</p>
                    <p className="text-muted-foreground text-xs">
                      {p.reservations?.vehicles?.brand} {p.reservations?.vehicles?.model} · Ref {p.reference}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-display font-bold">{formatNaira(p.amount)}</span>
                    <form action={updatePaymentStatus}>
                      <input type="hidden" name="id" value={p.id} />
                      <input type="hidden" name="status" value="successful" />
                      <input type="hidden" name="returnTo" value="/admin" />
                      <SubmitButton size="sm" confirm={`Confirm you received ${formatNaira(p.amount)} for reference ${p.reference}?`}>
                        Mark as paid
                      </SubmitButton>
                    </form>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Recent reservations</CardTitle>
            <Link href="/admin/reservations" className="text-teal text-sm font-semibold hover:underline">View all</Link>
          </CardHeader>
          {recentReservations.length === 0 ? (
            <EmptyRow>No reservations yet.</EmptyRow>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Dates</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentReservations.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.profiles?.full_name || r.profiles?.email}</TableCell>
                    <TableCell>{r.vehicles ? `${r.vehicles.brand} ${r.vehicles.model}` : "-"}</TableCell>
                    <TableCell className="text-muted-foreground whitespace-nowrap">{formatDate(r.start_date)}</TableCell>
                    <TableCell><ReservationBadge status={r.status} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>
      </div>
    </>
  );
}
