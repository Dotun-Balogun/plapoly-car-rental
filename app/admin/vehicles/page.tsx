import type { Metadata } from "next";
import Link from "next/link";
import { Pencil, Plus, Trash2, Wrench } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PageHeader, EmptyRow } from "@/components/admin-ui";
import { VehicleStatusBadge } from "@/components/status-badge";
import { SubmitButton } from "@/components/submit-button";
import { Flash } from "@/components/flash";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { deleteVehicle, setVehicleStatus } from "@/app/actions/admin";
import { formatNaira } from "@/lib/utils";
import { vehicleTypeLabels, type Vehicle } from "@/lib/types";

export const metadata: Metadata = { title: "Manage vehicles" };

export default async function AdminVehiclesPage({ searchParams }: { searchParams: Promise<{ notice?: string; error?: string }> }) {
  const query = await searchParams;
  const supabase = await createClient();
  const { data } = await supabase.from("vehicles").select("*").order("created_at", { ascending: false });
  const vehicles = (data as Vehicle[] | null) ?? [];

  return (
    <>
      <PageHeader title="Vehicles" description="Add cars, update prices and take vehicles out of service.">
        <Button asChild>
          <Link href="/admin/vehicles/new"><Plus /> Add vehicle</Link>
        </Button>
      </PageHeader>
      <Flash notice={query.notice} error={query.error} />

      <Card>
        {vehicles.length === 0 ? (
          <EmptyRow>No vehicles yet. Add your first one to start taking bookings.</EmptyRow>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vehicle</TableHead>
                <TableHead>Plate</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Rate / day</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vehicles.map((v) => (
                <TableRow key={v.id}>
                  <TableCell>
                    <p className="font-semibold">{v.brand} {v.model}</p>
                    <p className="text-muted-foreground text-xs">{v.year} · {v.seats} seats</p>
                  </TableCell>
                  <TableCell className="font-mono text-xs">{v.registration_no}</TableCell>
                  <TableCell>{vehicleTypeLabels[v.type]}</TableCell>
                  <TableCell className="font-medium">{formatNaira(v.rate)}</TableCell>
                  <TableCell><VehicleStatusBadge status={v.status} /></TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/admin/vehicles/${v.id}/edit`}><Pencil /> Edit</Link>
                      </Button>
                      <form action={setVehicleStatus}>
                        <input type="hidden" name="id" value={v.id} />
                        <input type="hidden" name="status" value={v.status === "maintenance" ? "available" : "maintenance"} />
                        <SubmitButton variant="outline" size="sm">
                          <Wrench /> {v.status === "maintenance" ? "Back in service" : "Maintenance"}
                        </SubmitButton>
                      </form>
                      <form action={deleteVehicle}>
                        <input type="hidden" name="id" value={v.id} />
                        <SubmitButton variant="ghost" size="sm" className="text-destructive hover:bg-red-50" confirm={`Delete ${v.brand} ${v.model}? This cannot be undone.`} aria-label={`Delete ${v.brand} ${v.model}`}>
                          <Trash2 />
                        </SubmitButton>
                      </form>
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
