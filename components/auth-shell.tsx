import { CarArt } from "@/components/car-art";
import { Logo } from "@/components/logo";

export function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <main className="grid min-h-screen lg:grid-cols-[1fr_1.05fr]">
      <div className="flex flex-col px-5 py-8 sm:px-10">
        <Logo dark />
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-10">
          <h1 className="text-3xl font-bold">{title}</h1>
          <p className="text-muted-foreground mt-2 text-sm">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </div>
      </div>
      <aside className="bg-ink relative hidden items-center justify-center overflow-hidden p-12 lg:flex">
        <div className="absolute top-1/2 left-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20 blur-3xl" />
        <div className="relative max-w-md text-white">
          <CarArt type="sedan" color="champagne" className="w-full drop-shadow-2xl" />
          <h2 className="font-display mt-8 text-3xl leading-tight font-bold">Book in minutes, drive today.</h2>
          <p className="mt-3 text-white/65">Live availability, clear prices in naira, and payment by transfer or USSD.</p>
        </div>
      </aside>
    </main>
  );
}
