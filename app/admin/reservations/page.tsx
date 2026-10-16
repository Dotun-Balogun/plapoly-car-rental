import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { PageHeader, FilterTabs, EmptyRow } from "@/components/admin-ui";
import { ReservationBadge } from "@/components/status-badge";
import { SubmitButton } from "@/components/submit-button";
import { Flash } from "@/components/flash";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { updateReservationStatus } from "@/app/actions/admin";
import { daysBetween, formatDate, formatNaira } from "@/lib/utils";
import type { ReservationStatus, ReservationWithRelations } from "@/lib/types";

export const metadata: Metadata = { title: "Reservations" };

const statuses: ReservationStatus[] = ["pending", "confirmed", "active", "completed", "cancelled"];

const nextActions: Record<ReservationStatus, { status: ReservationStatus; label: string; variant?: "default" | "outline"; confirm?: string }[]> = {
  pending: [
    { status: "confirmed", label: "Confirm", confirm: "Confirm this reservation without waiting for payment?" },
    { status: "cancelled", label: "Cancel", variant: "outline", confirm: "Cancel this reservation?" },
  ],
  confirmed: [
    { status: "active", label: "Hand over car" },
    { status: "cancelled", label: "Cancel", variant: "outline", confirm: "Cancel this reservation?" },
  ],
  active: [{ status: "completed", label: "Mark returned" }],
  completed: [],
  cancelled: [],
};

export default async function AdminReservationsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; notice?: string; error?: string }>;
}) {
  const query = await searchParams;
  const filter = statuses.includes(query.status as ReservationStatus) ? (query.status as ReservationStatus) : undefined;

  const supabase = await createClient();
  let q = supabase
    .from("reservations")
    .select("*, vehicles(*), profiles(full_name, email, phone), payments(*)")
    .order("created_at", { ascending: false });
  if (filter) q = q.eq("status", filter);
  const { data } = await q;
  const reservations = (data as ReservationWithRelations[] | null) ?? [];

  return (
    <>
      <PageHeader title="Reservations" description="Follow each booking from payment to return." />
      <Flash notice={query.notice} error={query.error} />
      <FilterTabs
        basePath="/admin/reservations"
        current={filter}
        options={[{ value: "", label: "All" }, ...statuses.map((s) => ({ value: s, label: s[0].toUpperCase() + s.slice(1) }))]}
      />
      <Card>
        {reservations.length === 0 ? (
          <EmptyRow>No reservations{filter ? ` with status "${filter}"` : ""}.</EmptyRow>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Reference</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Vehicle</TableHead>
                <TableHead>Dates</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reservations.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-mono text-xs">{r.reference}</TableCell>
                  <TableCell>
                    <p className="font-semibold">{r.profiles?.full_name || "-"}</p>
                    <p className="text-muted-foreground text-xs">{r.profiles?.phone ?? r.profiles?.email}</p>
                  </TableCell>
                  <TableCell>{r.vehicles ? `${r.vehicles.brand} ${r.vehicles.model}` : "-"}</TableCell>
                  <TableCell className="whitespace-nowrap">
                    {formatDate(r.start_date)} to {formatDate(r.end_date)}
                    <p className="text-muted-foreground text-xs">{daysBetween(r.start_date, r.end_date)} days</p>
                  </TableCell>
                  <TableCell className="font-medium">{formatNaira(r.amount)}</TableCell>
                  <TableCell><ReservationBadge status={r.status} /></TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      {nextActions[r.status].map((a) => (
                        <form key={a.status} action={updateReservationStatus}>
                          <input type="hidden" name="id" value={r.id} />
                          <input type="hidden" name="status" value={a.status} />
                          <input type="hidden" name="returnTo" value="/admin/reservations" />
                          <SubmitButton size="sm" variant={a.variant ?? "default"} confirm={a.confirm}>
                            {a.label}
                          </SubmitButton>
                        </form>
                      ))}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </>
  );
}
