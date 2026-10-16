import Link from "next/link";
import { Fuel, Settings2, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { VehicleImage } from "@/components/vehicle-image";
import { formatNaira } from "@/lib/utils";
import { vehicleTypeLabels, type Vehicle } from "@/lib/types";

export function VehicleCard({
  vehicle,
  start,
  end,
  days,
}: {
  vehicle: Vehicle;
  start?: string;
  end?: string;
  days?: number;
}) {
  const query = start && end ? `?start=${start}&end=${end}` : "";
  const total = days ? Number(vehicle.rate) * days : null;

  return (
    <Link
      href={`/vehicles/${vehicle.id}${query}`}
      className="bg-card group flex flex-col overflow-hidden rounded-2xl border border-border/80 transition-shadow hover:shadow-lg hover:shadow-black/5 focus-visible:ring-2 focus-visible:ring-ring"
    >
      <VehicleImage vehicle={vehicle} className="h-44" artClassName="transition-transform duration-300 group-hover:scale-[1.03]" />
      <div className="flex flex-1 flex-col gap-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg leading-tight font-semibold">
              {vehicle.brand} {vehicle.model}
            </h3>
            <p className="text-muted-foreground mt-0.5 text-sm">{vehicle.year}</p>
          </div>
          <Badge variant="neutral">{vehicleTypeLabels[vehicle.type]}</Badge>
        </div>

        <ul className="text-muted-foreground flex flex-wrap gap-x-4 gap-y-1.5 text-sm">
          <li className="flex items-center gap-1.5"><Users className="size-4" /> {vehicle.seats} seats</li>
          <li className="flex items-center gap-1.5"><Settings2 className="size-4" /> <span className="capitalize">{vehicle.transmission}</span></li>
          <li className="flex items-center gap-1.5"><Fuel className="size-4" /> <span className="capitalize">{vehicle.fuel}</span></li>
        </ul>

        <div className="mt-auto flex items-end justify-between border-t pt-4">
          <div>
            <p className="font-display text-xl font-bold">
              {formatNaira(vehicle.rate)}
              <span className="text-muted-foreground text-sm font-normal"> / day</span>
            </p>
            {total !== null && (
              <p className="text-muted-foreground text-xs">
                {formatNaira(total)} for {days} {days === 1 ? "day" : "days"}
              </p>
            )}
          </div>
          <span className="text-teal text-sm font-semibold group-hover:underline">View and book</span>
        </div>
      </div>
    </Link>
  );
}
