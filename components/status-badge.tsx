import { Badge } from "@/components/ui/badge";
import type { PaymentStatus, ReservationStatus, VehicleStatus } from "@/lib/types";

type Variant = "neutral" | "amber" | "green" | "blue" | "red" | "dark";

const reservation: Record<ReservationStatus, [string, Variant]> = {
  pending: ["Awaiting payment", "amber"],
  confirmed: ["Confirmed", "green"],
  active: ["On the road", "blue"],
  completed: ["Completed", "neutral"],
  cancelled: ["Cancelled", "red"],
};

const payment: Record<PaymentStatus, [string, Variant]> = {
  pending: ["Pending", "amber"],
  successful: ["Paid", "green"],
  failed: ["Failed", "red"],
  refunded: ["Refunded", "blue"],
  cancelled: ["Cancelled", "neutral"],
};

const vehicle: Record<VehicleStatus, [string, Variant]> = {
  available: ["Available", "green"],
  rented: ["Rented out", "blue"],
  maintenance: ["In maintenance", "amber"],
};

export function ReservationBadge({ status }: { status: ReservationStatus }) {
  const [label, variant] = reservation[status];
  return <Badge variant={variant}>{label}</Badge>;
}
export function PaymentBadge({ status }: { status: PaymentStatus }) {
  const [label, variant] = payment[status];
  return <Badge variant={variant}>{label}</Badge>;
}
export function VehicleStatusBadge({ status }: { status: VehicleStatus }) {
  const [label, variant] = vehicle[status];
  return <Badge variant={variant}>{label}</Badge>;
}
