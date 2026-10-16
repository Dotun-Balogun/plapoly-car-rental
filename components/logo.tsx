import Link from "next/link";
import { CarFront } from "lucide-react";
import { config } from "@/lib/config";

export function Logo({ dark = false }: { dark?: boolean }) {
  return (
    <Link href="/" className="inline-flex items-center gap-2.5">
      <span className="bg-primary text-primary-foreground grid size-9 place-items-center rounded-xl">
        <CarFront className="size-5" strokeWidth={2.4} />
      </span>
      <span className={`font-display text-xl font-bold tracking-tight ${dark ? "text-ink" : "text-white"}`}>
        {config.appName}
      </span>
    </Link>
  );
}
