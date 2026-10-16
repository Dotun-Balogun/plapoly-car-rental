"use client";

import Link from "next/link";
import { Loader2 } from "lucide-react";
import { saveVehicle } from "@/app/actions/admin";
import { useFormAction } from "@/lib/use-form-action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FormMessage } from "@/components/flash";
import { vehicleTypeLabels, vehicleTypes, type FormState, type Vehicle } from "@/lib/types";

function Field({ label, htmlFor, children, hint }: { label: string; htmlFor: string; children: React.ReactNode; hint?: string }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {hint && <p className="text-muted-foreground text-xs">{hint}</p>}
    </div>
  );
}

export function VehicleForm({ vehicle }: { vehicle?: Vehicle }) {
  const { state, pending, onSubmit } = useFormAction(saveVehicle, {});

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {vehicle && <input type="hidden" name="id" value={vehicle.id} />}
      <FormMessage error={state.error} />

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Brand" htmlFor="brand">
          <Input id="brand" name="brand" defaultValue={vehicle?.brand} placeholder="Toyota" required />
        </Field>
        <Field label="Model" htmlFor="model">
          <Input id="model" name="model" defaultValue={vehicle?.model} placeholder="Corolla" required />
        </Field>
        <Field label="Registration number" htmlFor="registration_no">
          <Input id="registration_no" name="registration_no" defaultValue={vehicle?.registration_no} placeholder="KJA-214-AB" required />
        </Field>
        <Field label="Year" htmlFor="year">
          <Input id="year" name="year" type="number" min={1990} max={2100} defaultValue={vehicle?.year ?? new Date().getFullYear()} required />
        </Field>
        <Field label="Type" htmlFor="type">
          <Select id="type" name="type" defaultValue={vehicle?.type ?? "sedan"}>
            {vehicleTypes.map((t) => (
              <option key={t} value={t}>{vehicleTypeLabels[t]}</option>
            ))}
          </Select>
        </Field>
        <Field label="Colour" htmlFor="color" hint="Used to tint the illustration, e.g. Black, White, Silver, Red.">
          <Input id="color" name="color" defaultValue={vehicle?.color ?? ""} placeholder="Black" />
        </Field>
        <Field label="Seats" htmlFor="seats">
          <Input id="seats" name="seats" type="number" min={1} max={60} defaultValue={vehicle?.seats ?? 5} required />
        </Field>
        <Field label="Daily rate (₦)" htmlFor="rate">
          <Input id="rate" name="rate" type="number" min={1} step="500" defaultValue={vehicle?.rate} placeholder="50000" required />
        </Field>
        <Field label="Transmission" htmlFor="transmission">
          <Select id="transmission" name="transmission" defaultValue={vehicle?.transmission ?? "automatic"}>
            <option value="automatic">Automatic</option>
            <option value="manual">Manual</option>
          </Select>
        </Field>
        <Field label="Fuel" htmlFor="fuel">
          <Select id="fuel" name="fuel" defaultValue={vehicle?.fuel ?? "petrol"}>
            <option value="petrol">Petrol</option>
            <option value="diesel">Diesel</option>
            <option value="hybrid">Hybrid</option>
            <option value="electric">Electric</option>
          </Select>
        </Field>
        <Field label="Status" htmlFor="status">
          <Select id="status" name="status" defaultValue={vehicle?.status ?? "available"}>
            <option value="available">Available</option>
            <option value="rented">Rented out</option>
            <option value="maintenance">In maintenance</option>
          </Select>
        </Field>
        <Field label="Photo link (optional)" htmlFor="image_url" hint="A link starting with https://. Leave empty to use the illustration.">
          <Input id="image_url" name="image_url" type="url" defaultValue={vehicle?.image_url ?? ""} placeholder="https://..." />
        </Field>
      </div>

      <Field label="Description" htmlFor="description">
        <Textarea id="description" name="description" defaultValue={vehicle?.description ?? ""} placeholder="What makes this car a good pick?" />
      </Field>

      <div className="flex gap-3">
        <Button type="submit" size="lg" disabled={pending}>
          {pending && <Loader2 className="animate-spin" />} {vehicle ? "Save changes" : "Add vehicle"}
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href="/admin/vehicles">Cancel</Link>
        </Button>
      </div>
    </form>
  );
}
