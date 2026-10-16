import type { Metadata } from "next";
import Link from "next/link";
import { SearchX } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { SearchForm } from "@/components/search-form";
import { VehicleCard } from "@/components/vehicle-card";
import { Button } from "@/components/ui/button";
import { daysBetween, todayInLagos } from "@/lib/utils";
import { vehicleTypeLabels, vehicleTypes, type Vehicle, type VehicleType } from "@/lib/types";

export const metadata: Metadata = { title: "Vehicles" };

const isDate = (v?: string) => Boolean(v && /^\d{4}-\d{2}-\d{2}$/.test(v));

export default async function VehiclesPage({
  searchParams,
}: {
  searchParams: Promise<{ start?: string; end?: string; type?: string }>;
}) {
  const params = await searchParams;
  const today = todayInLagos();
  const hasDates = isDate(params.start) && isDate(params.end) && params.end! > params.start!;
  const type = vehicleTypes.includes(params.type as VehicleType) ? (params.type as VehicleType) : undefined;

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("search_available_vehicles", {
    p_start: hasDates ? params.start : null,
    p_end: hasDates ? params.end : null,
    p_type: type ?? null,
  });
  const vehicles = (data as Vehicle[] | null) ?? [];
  const days = hasDates ? daysBetween(params.start!, params.end!) : undefined;

  const typeHref = (t?: VehicleType) => {
    const q = new URLSearchParams();
    if (hasDates) {
      q.set("start", params.start!);
      q.set("end", params.end!);
    }
    if (t) q.set("type", t);
    const s = q.toString();
    return s ? `/vehicles?${s}` : "/vehicles";
  };

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6">
        <h1 className="text-3xl font-bold sm:text-4xl">Find your car</h1>
        <p className="text-muted-foreground mt-2">
          {hasDates
            ? `Showing cars free from ${params.start} to ${params.end}.`
            : "Choose your dates to see what is free, or browse the whole fleet below."}
        </p>

        <div className="mt-6">
          <SearchForm
            variant="bar"
            today={today}
            start={hasDates ? params.start : ""}
            end={hasDates ? params.end : ""}
            type={type ?? ""}
          />
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {[undefined, ...vehicleTypes].map((t) => (
            <Link
              key={t ?? "all"}
              href={typeHref(t)}
              className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                type === t ? "bg-ink border-ink text-white" : "bg-card hover:bg-muted"
              }`}
            >
              {t ? vehicleTypeLabels[t] : "All"}
            </Link>
          ))}
        </div>

        {error && (
          <p className="mt-8 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            We could not load vehicles right now. Please refresh the page.
          </p>
        )}

        {vehicles.length > 0 ? (
          <>
            <p className="text-muted-foreground mt-8 text-sm">
              {vehicles.length} {vehicles.length === 1 ? "vehicle" : "vehicles"}
            </p>
            <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {vehicles.map((v) => (
                <VehicleCard key={v.id} vehicle={v} start={hasDates ? params.start : undefined} end={hasDates ? params.end : undefined} days={days} />
              ))}
            </div>
          </>
        ) : (
          !error && (
            <div className="bg-card mt-10 flex flex-col items-center rounded-2xl border px-6 py-14 text-center">
              <SearchX className="text-muted-foreground size-10" />
              <h2 className="mt-4 text-xl font-semibold">No cars match those dates</h2>
              <p className="text-muted-foreground mt-1 max-w-sm text-sm">
                Try different dates or another vehicle type to see more options.
              </p>
              <Button asChild variant="outline" className="mt-5">
                <Link href="/vehicles">Clear filters</Link>
              </Button>
            </div>
          )
        )}
      </main>
      <SiteFooter />
    </>
  );
}
