export type UserRole = "customer" | "admin";
export type VehicleType = "sedan" | "hatchback" | "suv" | "pickup" | "bus" | "luxury";
export type VehicleStatus = "available" | "rented" | "maintenance";
export type ReservationStatus = "pending" | "confirmed" | "active" | "completed" | "cancelled";
export type PaymentMethod = "bank_transfer" | "ussd";
export type PaymentStatus = "pending" | "successful" | "failed" | "refunded" | "cancelled";

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  address: string | null;
  role: UserRole;
  created_at: string;
}

export interface Vehicle {
  id: string;
  registration_no: string;
  brand: string;
  model: string;
  year: number;
  type: VehicleType;
  color: string | null;
  seats: number;
  transmission: "automatic" | "manual";
  fuel: "petrol" | "diesel" | "hybrid" | "electric";
  rate: number;
  status: VehicleStatus;
  image_url: string | null;
  description: string | null;
  created_at: string;
}

export interface Reservation {
  id: string;
  reference: string;
  customer_id: string;
  vehicle_id: string;
  start_date: string;
  end_date: string;
  amount: number;
  status: ReservationStatus;
  created_at: string;
}

export interface Payment {
  id: string;
  reservation_id: string;
  reference: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  payment_date: string | null;
  created_at: string;
}

export type ReservationWithRelations = Reservation & {
  vehicles: Vehicle | null;
  profiles: Pick<Profile, "full_name" | "email" | "phone"> | null;
  payments: Payment[];
};

export type PaymentWithRelations = Payment & {
  reservations:
    | (Pick<Reservation, "reference" | "start_date" | "end_date"> & {
        vehicles: Pick<Vehicle, "brand" | "model"> | null;
        profiles: Pick<Profile, "full_name" | "email"> | null;
      })
    | null;
};

export const vehicleTypeLabels: Record<VehicleType, string> = {
  sedan: "Sedan",
  hatchback: "Hatchback",
  suv: "SUV",
  pickup: "Pickup",
  bus: "Bus",
  luxury: "Luxury",
};

export const vehicleTypes = Object.keys(vehicleTypeLabels) as VehicleType[];

export const paymentMethodLabels: Record<PaymentMethod, string> = {
  bank_transfer: "Bank transfer",
  ussd: "USSD transfer",
};

export type FormState = { error?: string; success?: string };
