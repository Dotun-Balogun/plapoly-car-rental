import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { PageHeader, EmptyRow } from "@/components/admin-ui";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate } from "@/lib/utils";
import type { Profile } from "@/lib/types";

export const metadata: Metadata = { title: "Customers" };

export default async function AdminCustomersPage() {
  const supabase = await createClient();
  const [{ data }, { data: bookings }] = await Promise.all([
    supabase.from("profiles").select("*").eq("role", "customer").order("created_at", { ascending: false }),
    supabase.from("reservations").select("customer_id"),
  ]);
  const customers = (data as Profile[] | null) ?? [];
  const counts = new Map<string, number>();
  for (const b of (bookings as { customer_id: string }[] | null) ?? []) {
    counts.set(b.customer_id, (counts.get(b.customer_id) ?? 0) + 1);
  }

  return (
    <>
      <PageHeader title="Customers" description={`${customers.length} registered ${customers.length === 1 ? "customer" : "customers"}.`} />
      <Card>
        {customers.length === 0 ? (
          <EmptyRow>No customers yet. They appear here after they register.</EmptyRow>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Bookings</TableHead>
                <TableHead>Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-semibold">{c.full_name || "-"}</TableCell>
                  <TableCell>{c.email}</TableCell>
                  <TableCell>{c.phone ?? "-"}</TableCell>
                  <TableCell>{counts.get(c.id) ?? 0}</TableCell>
                  <TableCell className="text-muted-foreground whitespace-nowrap">{formatDate(c.created_at)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </>
  );
}
