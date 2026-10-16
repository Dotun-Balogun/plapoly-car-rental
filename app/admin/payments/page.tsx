import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { PageHeader, FilterTabs, EmptyRow } from "@/components/admin-ui";
import { PaymentBadge } from "@/components/status-badge";
import { SubmitButton } from "@/components/submit-button";
import { Flash } from "@/components/flash";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { updatePaymentStatus } from "@/app/actions/admin";
import { formatDateTime, formatNaira } from "@/lib/utils";
import { paymentMethodLabels, type PaymentStatus, type PaymentWithRelations } from "@/lib/types";

export const metadata: Metadata = { title: "Payments" };

const statuses: PaymentStatus[] = ["pending", "successful", "failed", "refunded", "cancelled"];
const labels: Record<PaymentStatus, string> = {
  pending: "Pending",
  successful: "Paid",
  failed: "Failed",
  refunded: "Refunded",
  cancelled: "Cancelled",
};

export default async function AdminPaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; notice?: string; error?: string }>;
}) {
  const query = await searchParams;
  const filter = statuses.includes(query.status as PaymentStatus) ? (query.status as PaymentStatus) : undefined;

  const supabase = await createClient();
  let q = supabase
    .from("payments")
    .select("*, reservations(reference, start_date, end_date, vehicles(brand, model), profiles(full_name, email))")
    .order("created_at", { ascending: false });
  if (filter) q = q.eq("status", filter);
  const { data } = await q;
  const payments = (data as PaymentWithRelations[] | null) ?? [];

  return (
    <>
      <PageHeader title="Payments" description="Check your bank account, then mark each transfer as paid." />
      <Flash notice={query.notice} error={query.error} />
      <FilterTabs
        basePath="/admin/payments"
        current={filter}
        options={[{ value: "", label: "All" }, ...statuses.map((s) => ({ value: s, label: labels[s] }))]}
      />
      <Card>
        {payments.length === 0 ? (
          <EmptyRow>No payments{filter ? ` marked "${labels[filter].toLowerCase()}"` : ""}.</EmptyRow>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Payment ref</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Booking</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-mono text-xs">
                    {p.reference}
                    <p className="text-muted-foreground font-sans">{formatDateTime(p.created_at)}</p>
                  </TableCell>
                  <TableCell>
                    <p className="font-semibold">{p.reservations?.profiles?.full_name || "-"}</p>
                    <p className="text-muted-foreground text-xs">{p.reservations?.profiles?.email}</p>
                  </TableCell>
                  <TableCell>
                    {p.reservations?.vehicles ? `${p.reservations.vehicles.brand} ${p.reservations.vehicles.model}` : "-"}
                    <p className="text-muted-foreground font-mono text-xs">{p.reservations?.reference}</p>
                  </TableCell>
                  <TableCell>{paymentMethodLabels[p.method]}</TableCell>
                  <TableCell className="font-medium">{formatNaira(p.amount)}</TableCell>
                  <TableCell><PaymentBadge status={p.status} /></TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      {p.status === "pending" && (
                        <>
                          <form action={updatePaymentStatus}>
                            <input type="hidden" name="id" value={p.id} />
                            <input type="hidden" name="status" value="successful" />
                            <input type="hidden" name="returnTo" value="/admin/payments" />
                            <SubmitButton size="sm" confirm={`Confirm you received ${formatNaira(p.amount)} for ${p.reference}?`}>
                              Mark as paid
                            </SubmitButton>
                          </form>
                          <form action={updatePaymentStatus}>
                            <input type="hidden" name="id" value={p.id} />
                            <input type="hidden" name="status" value="failed" />
                            <input type="hidden" name="returnTo" value="/admin/payments" />
                            <SubmitButton size="sm" variant="outline">Mark failed</SubmitButton>
                          </form>
                        </>
                      )}
                      {p.status === "successful" && (
                        <form action={updatePaymentStatus}>
                          <input type="hidden" name="id" value={p.id} />
                          <input type="hidden" name="status" value="refunded" />
                          <input type="hidden" name="returnTo" value="/admin/payments" />
                          <SubmitButton size="sm" variant="outline" confirm="Mark as refunded? The reservation will be cancelled.">
                            Refund
                          </SubmitButton>
                        </form>
                      )}
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
