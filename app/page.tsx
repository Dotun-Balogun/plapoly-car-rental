import Link from "next/link";
import { BadgeCheck, CalendarSearch, CarFront, CreditCard, ShieldCheck, Wallet } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { SearchForm } from "@/components/search-form";
import { VehicleCard } from "@/components/vehicle-card";
import { CarArt } from "@/components/car-art";
import { Button } from "@/components/ui/button";
import { todayInLagos } from "@/lib/utils";
import { vehicleTypeLabels, type Vehicle, type VehicleType } from "@/lib/types";

const steps = [
  { icon: CalendarSearch, title: "Pick your dates", text: "Tell us when you need the car. We only show vehicles that are free for those days." },
  { icon: CarFront, title: "Choose a vehicle", text: "Compare seats, fuel and daily price, then open the one you like." },
  { icon: CreditCard, title: "Pay by transfer or USSD", text: "We show our account details and your payment reference right after you book." },
  { icon: BadgeCheck, title: "Get confirmed", text: "Once we verify your payment, your booking is confirmed and the car is held for you." },
];

export default async function HomePage() {
  const supabase = await createClient();
  const { data } = await supabase.rpc("search_available_vehicles", {});
  const vehicles = (data as Vehicle[] | null) ?? [];
  const featured = vehicles.slice(0, 6);
  const types = [...new Set(vehicles.map((v) => v.type))] as VehicleType[];

  return (
    <>
      <SiteHeader />
      <main>
        {/* Hero */}
        <section className="bg-ink relative overflow-hidden text-white">
          <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 pt-14 pb-36 sm:px-6 sm:pt-20 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <h1 className="font-display max-w-xl text-4xl leading-[1.05] font-extrabold sm:text-6xl">
                Rent the right car for every trip.
              </h1>
              <p className="mt-5 max-w-lg text-lg leading-relaxed text-white/70">
                Choose your dates, see only the cars that are actually free, and book in a few taps. Pay by bank transfer or USSD.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild size="lg">
                  <Link href="/vehicles">Browse all vehicles</Link>
                </Button>
                <Button asChild size="lg" variant="ghost-light" className="border border-white/20">
                  <Link href="/#how-it-works">How it works</Link>
                </Button>
              </div>
            </div>
            <div className="relative hidden lg:block">
              <div className="absolute inset-x-6 top-1/2 h-64 -translate-y-1/2 rounded-full bg-primary/20 blur-3xl" />
              <CarArt type="suv" color="white" className="relative w-full drop-shadow-2xl" />
            </div>
          </div>
        </section>

        {/* Search card overlapping the hero */}
        <div className="relative z-10 mx-auto -mt-24 max-w-5xl px-4 sm:px-6">
          <SearchForm today={todayInLagos()} />
        </div>

        {/* Reasons */}
        <section className="mx-auto mt-14 grid max-w-7xl gap-4 px-4 sm:px-6 md:grid-cols-3">
          {[
            { icon: ShieldCheck, title: "No double bookings", text: "Availability is checked for your exact dates, so the car you pick is yours." },
            { icon: Wallet, title: "Clear prices in naira", text: "You see the daily rate and the full total before you book. No surprises." },
            { icon: CreditCard, title: "Pay the way you already do", text: "Send a bank transfer or dial your bank's USSD code. No card needed." },
          ].map(({ icon: Icon, title, text }) => (
            <div key={title} className="bg-card flex gap-4 rounded-2xl border p-5">
              <span className="bg-accent text-accent-foreground grid size-11 shrink-0 place-items-center rounded-xl">
                <Icon className="size-5" />
              </span>
              <div>
                <h3 className="font-semibold">{title}</h3>
                <p className="text-muted-foreground mt-1 text-sm leading-relaxed">{text}</p>
              </div>
            </div>
          ))}
        </section>

        {/* Featured */}
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold sm:text-4xl">Cars ready to book</h2>
              <p className="text-muted-foreground mt-2">A few from our fleet, from everyday sedans to buses for groups.</p>
            </div>
            <Button asChild variant="outline">
              <Link href="/vehicles">See the whole fleet</Link>
            </Button>
          </div>

          {types.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {types.map((t) => (
                <Link
                  key={t}
                  href={`/vehicles?type=${t}`}
                  className="bg-card hover:bg-muted rounded-full border px-4 py-1.5 text-sm font-medium transition-colors"
                >
                  {vehicleTypeLabels[t]}
                </Link>
              ))}
            </div>
          )}

          {featured.length > 0 ? (
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((v) => (
                <VehicleCard key={v.id} vehicle={v} />
              ))}
            </div>
          ) : (
            <div className="bg-card mt-8 rounded-2xl border p-10 text-center">
              <p className="font-semibold">No vehicles yet</p>
              <p className="text-muted-foreground mt-1 text-sm">Vehicles an admin adds will show up here.</p>
            </div>
          )}
        </section>

        {/* How it works: a real sequence, so numbered */}
        <section id="how-it-works" className="bg-card border-y">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
            <h2 className="max-w-lg text-3xl font-bold sm:text-4xl">From search to keys in four steps</h2>
            <ol className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {steps.map(({ icon: Icon, title, text }, i) => (
                <li key={title} className="relative">
                  <div className="flex items-center gap-3">
                    <span className="bg-ink font-display grid size-10 place-items-center rounded-full text-base font-bold text-white">
                      {i + 1}
                    </span>
                    <Icon className="text-teal size-5" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold">{title}</h3>
                  <p className="text-muted-foreground mt-1.5 text-sm leading-relaxed">{text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
