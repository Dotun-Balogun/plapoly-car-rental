import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Fuel, Palette, Settings2, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { VehicleImage } from "@/components/vehicle-image";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookingForm } from "./booking-form";
import { formatNaira, todayInLagos } from "@/lib/utils";
import { vehicleTypeLabels, type Vehicle } from "@/lib/types";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("vehicles").select("brand, model").eq("id", id).maybeSingle();
  return { title: data ? `${data.brand} ${data.model}` : "Vehicle" };
}

const isDate = (v?: string) => Boolean(v && /^\d{4}-\d{2}-\d{2}$/.test(v));
const isUuid = (v: string) => /^[0-9a-f-]{36}$/i.test(v);

export default async function VehicleDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ start?: string; end?: string }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  if (!isUuid(id)) notFound();

  const supabase = await createClient();
  const { data } = await supabase.from("vehicles").select("*").eq("id", id).maybeSingle();
  const vehicle = data as Vehicle | null;
  if (!vehicle) notFound();

  const hasDates = isDate(query.start) && isDate(query.end) && query.end! > query.start!;
  let unavailable = vehicle.status === "maintenance";
  if (hasDates && !unavailable) {
    const { data: free } = await supabase.rpc("search_available_vehicles", { p_start: query.start, p_end: query.end });
    unavailable = !((free as Vehicle[] | null) ?? []).some((v) => v.id === id);
  }

  const user = await getCurrentUser();
  const qs = hasDates ? `?start=${query.start}&end=${query.end}` : "";
  const loginHref = `/login?next=${encodeURIComponent(`/vehicles/${id}${qs}`)}`;

  const specs = [
    { icon: Users, label: "Seats", value: `${vehicle.seats}` },
    { icon: Settings2, label: "Transmission", value: vehicle.transmission },
    { icon: Fuel, label: "Fuel", value: vehicle.fuel },
    { icon: Palette, label: "Colour", value: vehicle.color ?? "Not listed" },
  ];

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6">
        <Link href={`/vehicles${qs}`} className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-sm font-medium">
          <ArrowLeft className="size-4" /> Back to vehicles
        </Link>

        <div className="mt-6 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
          <div className="space-y-6">
            <VehicleImage vehicle={vehicle} className="h-72 rounded-2xl border sm:h-96" artClassName="max-w-[520px]" />

            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-bold sm:text-4xl">
                  {vehicle.brand} {vehicle.model}
                </h1>
                <Badge variant="neutral">{vehicleTypeLabels[vehicle.type]}</Badge>
              </div>
              <p className="text-muted-foreground mt-1">{vehicle.year}</p>
              <p className="font-display mt-4 text-2xl font-bold">
                {formatNaira(vehicle.rate)}
                <span className="text-muted-foreground text-base font-normal"> per day</span>
              </p>
              {vehicle.description && <p className="text-muted-foreground mt-4 max-w-2xl leading-relaxed">{vehicle.description}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {specs.map(({ icon: Icon, label, value }) => (
                <div key={label} className="bg-card rounded-xl border p-4">
                  <Icon className="text-teal size-5" />
                  <p className="text-muted-foreground mt-3 text-xs">{label}</p>
                  <p className="mt-0.5 text-sm font-semibold capitalize">{value}</p>
                </div>
              ))}
            </div>
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Reserve this car</CardTitle>
              </CardHeader>
              <CardContent>
                <BookingForm
                  vehicleId={vehicle.id}
                  rate={Number(vehicle.rate)}
                  today={todayInLagos()}
                  initialStart={hasDates ? query.start! : ""}
                  initialEnd={hasDates ? query.end! : ""}
                  unavailable={unavailable}
                  signedIn={Boolean(user)}
                  loginHref={loginHref}
                />
              </CardContent>
            </Card>
          </aside>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
