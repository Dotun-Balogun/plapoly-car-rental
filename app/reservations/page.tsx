import type { Metadata } from "next";
import Link from "next/link";
import { CalendarX2, ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { VehicleImage } from "@/components/vehicle-image";
import { ReservationBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { daysBetween, formatDate, formatNaira } from "@/lib/utils";
import type { ReservationWithRelations } from "@/lib/types";

export const metadata: Metadata = { title: "My bookings" };

export default async function ReservationsPage() {
  const profile = await requireUser("/reservations");
  const supabase = await createClient();
  const { data } = await supabase
    .from("reservations")
    .select("*, vehicles(*), payments(*)")
    .eq("customer_id", profile.id)
    .order("created_at", { ascending: false });
  const reservations = (data as ReservationWithRelations[] | null) ?? [];

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-10 sm:px-6">
        <h1 className="text-3xl font-bold sm:text-4xl">My bookings</h1>
        <p className="text-muted-foreground mt-2">Track your reservations and see how to pay for them.</p>

        {reservations.length === 0 ? (
          <div className="bg-card mt-8 flex flex-col items-center rounded-2xl border px-6 py-14 text-center">
            <CalendarX2 className="text-muted-foreground size-10" />
            <h2 className="mt-4 text-xl font-semibold">You have no bookings yet</h2>
            <p className="text-muted-foreground mt-1 text-sm">Pick your dates and reserve your first car.</p>
            <Button asChild className="mt-5">
              <Link href="/vehicles">Find a car</Link>
            </Button>
          </div>
        ) : (
          <ul className="mt-8 space-y-4">
            {reservations.map((r) => (
              <li key={r.id}>
                <Link
                  href={`/reservations/${r.id}`}
                  className="bg-card hover:shadow-md flex items-stretch overflow-hidden rounded-2xl border transition-shadow hover:shadow-black/5"
                >
                  {r.vehicles && <VehicleImage vehicle={r.vehicles} className="hidden w-44 shrink-0 sm:flex" artClassName="w-[88%]" />}
                  <div className="flex flex-1 items-center justify-between gap-4 p-5">
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="font-semibold">
                          {r.vehicles ? `${r.vehicles.brand} ${r.vehicles.model}` : "Vehicle"}
                        </h2>
                        <ReservationBadge status={r.status} />
                      </div>
                      <p className="text-muted-foreground text-sm">
                        {formatDate(r.start_date)} to {formatDate(r.end_date)} ({daysBetween(r.start_date, r.end_date)} days)
                      </p>
                      <p className="text-muted-foreground text-xs">Reference {r.reference}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="font-display text-lg font-bold">{formatNaira(r.amount)}</p>
                      <ChevronRight className="text-muted-foreground size-5" />
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
