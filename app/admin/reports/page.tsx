import type { Metadata } from "next";
import { Download } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PageHeader, StatCard } from "@/components/admin-ui";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CalendarCheck, Percent, TrendingUp, Wallet } from "lucide-react";
import { formatNaira } from "@/lib/utils";
import type { Payment, Reservation, Vehicle } from "@/lib/types";

export const metadata: Metadata = { title: "Reports" };

const monthKey = (iso: string) =>
  new Date(iso).toLocaleDateString("en-CA", { timeZone: "Africa/Lagos" }).slice(0, 7);

function lastMonths(n: number) {
  const out: { key: string; label: string }[] = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
    out.push({
      key: d.toISOString().slice(0, 7),
      label: new Intl.DateTimeFormat("en-NG", { month: "short", year: "2-digit", timeZone: "UTC" }).format(d),
    });
  }
  return out;
}

export default async function AdminReportsPage() {
  const supabase = await createClient();
  const [{ data: payData }, { data: resData }, { data: vehData }] = await Promise.all([
    supabase.from("payments").select("*").eq("status", "successful"),
    supabase.from("reservations").select("*"),
    supabase.from("vehicles").select("*"),
  ]);
  const payments = (payData as Payment[] | null) ?? [];
  const reservations = (resData as Reservation[] | null) ?? [];
  const vehicles = (vehData as Vehicle[] | null) ?? [];

  const totalRevenue = payments.reduce((s, p) => s + Number(p.amount), 0);
  const cancelled = reservations.filter((r) => r.status === "cancelled").length;
  const completedOrActive = reservations.filter((r) => ["confirmed", "active", "completed"].includes(r.status));
  const average = completedOrActive.length
    ? completedOrActive.reduce((s, r) => s + Number(r.amount), 0) / completedOrActive.length
    : 0;
  const cancelRate = reservations.length ? Math.round((cancelled / reservations.length) * 100) : 0;

  const months = lastMonths(6).map((m) => ({
    ...m,
    total: payments
      .filter((p) => monthKey(p.payment_date ?? p.created_at) === m.key)
      .reduce((s, p) => s + Number(p.amount), 0),
  }));
  const maxMonth = Math.max(...months.map((m) => m.total), 1);

  const byVehicle = new Map<string, { bookings: number; revenue: number }>();
  for (const r of reservations.filter((r) => r.status !== "cancelled")) {
    const cur = byVehicle.get(r.vehicle_id) ?? { bookings: 0, revenue: 0 };
    cur.bookings += 1;
    if (["confirmed", "active", "completed"].includes(r.status)) cur.revenue += Number(r.amount);
    byVehicle.set(r.vehicle_id, cur);
  }
  const top = [...byVehicle.entries()]
    .map(([id, v]) => ({ vehicle: vehicles.find((x) => x.id === id), ...v }))
    .filter((x) => x.vehicle)
    .sort((a, b) => b.bookings - a.bookings)
    .slice(0, 5);

  const exports = [
    { type: "reservations", label: "Reservations" },
    { type: "payments", label: "Payments" },
    { type: "customers", label: "Customers" },
    { type: "vehicles", label: "Vehicles" },
  ];

  return (
    <>
      <PageHeader title="Reports" description="How the business is doing, with exports for your records." />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Verified revenue" value={formatNaira(totalRevenue)} icon={Wallet} />
        <StatCard label="Total bookings" value={String(reservations.length)} icon={CalendarCheck} />
        <StatCard label="Average booking" value={formatNaira(average)} icon={TrendingUp} />
        <StatCard label="Cancellation rate" value={`${cancelRate}%`} hint={`${cancelled} cancelled`} icon={Percent} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Revenue, last 6 months</CardTitle>
            <CardDescription>Verified payments only.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex h-52 items-end gap-3" role="img" aria-label="Monthly revenue bar chart">
              {months.map((m) => (
                <div key={m.key} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
                  <span className="text-muted-foreground text-[11px]">{m.total > 0 ? formatNaira(m.total) : ""}</span>
                  <div
                    className="bg-primary w-full rounded-t-md"
                    style={{ height: `${Math.max((m.total / maxMonth) * 100, m.total > 0 ? 4 : 1)}%`, minHeight: 3 }}
                  />
                  <span className="text-xs font-medium">{m.label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Most booked vehicles</CardTitle>
            <CardDescription>Excludes cancelled reservations.</CardDescription>
          </CardHeader>
          {top.length === 0 ? (
            <p className="text-muted-foreground px-6 pb-8 text-sm">No bookings yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Bookings</TableHead>
                  <TableHead>Revenue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {top.map((t) => (
                  <TableRow key={t.vehicle!.id}>
                    <TableCell className="font-semibold">{t.vehicle!.brand} {t.vehicle!.model}</TableCell>
                    <TableCell>{t.bookings}</TableCell>
                    <TableCell>{formatNaira(t.revenue)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Download data</CardTitle>
          <CardDescription>CSV files open in Excel or Google Sheets.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          {exports.map((e) => (
            <Button key={e.type} asChild variant="outline">
              <a href={`/admin/reports/export?type=${e.type}`} download>
                <Download /> {e.label}
              </a>
            </Button>
          ))}
        </CardContent>
      </Card>
    </>
  );
}
