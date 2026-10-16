import { CarArt } from "@/components/car-art";
import type { Vehicle } from "@/lib/types";
import { cn } from "@/lib/utils";

/** Shows the vehicle photo when there is one, otherwise the illustration. */
export function VehicleImage({
  vehicle,
  className,
  artClassName,
}: {
  vehicle: Pick<Vehicle, "type" | "color" | "image_url" | "brand" | "model">;
  className?: string;
  artClassName?: string;
}) {
  return (
    <div className={cn("relative flex items-center justify-center overflow-hidden bg-gradient-to-b from-[#e8edf3] to-[#d9e1ea]", className)}>
      {vehicle.image_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={vehicle.image_url}
          alt={`${vehicle.brand} ${vehicle.model}`}
          className="absolute inset-0 size-full object-cover"
          loading="lazy"
        />
      ) : (
        <CarArt type={vehicle.type} color={vehicle.color} className={cn("w-[82%] max-w-[340px]", artClassName)} />
      )}
    </div>
  );
}
