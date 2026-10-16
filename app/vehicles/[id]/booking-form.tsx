"use client";

import Link from "next/link";
import { useState } from "react";
import { Banknote, Loader2, Smartphone } from "lucide-react";
import { createBooking } from "@/app/actions/booking";
import { useFormAction } from "@/lib/use-form-action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormMessage } from "@/components/flash";
import { addDays, cn, daysBetween, formatNaira } from "@/lib/utils";
import type { FormState, PaymentMethod } from "@/lib/types";

const methods: { value: PaymentMethod; title: string; text: string; icon: typeof Banknote }[] = [
  { value: "bank_transfer", title: "Bank transfer", text: "Send from your banking app", icon: Banknote },
  { value: "ussd", title: "USSD", text: "Dial your bank's code, no data needed", icon: Smartphone },
];

export function BookingForm({
  vehicleId,
  rate,
  today,
  initialStart,
  initialEnd,
  unavailable,
  signedIn,
  loginHref,
}: {
  vehicleId: string;
  rate: number;
  today: string;
  initialStart: string;
  initialEnd: string;
  unavailable: boolean;
  signedIn: boolean;
  loginHref: string;
}) {
  const { state, pending, onSubmit } = useFormAction(createBooking, {});
  const [start, setStart] = useState(initialStart);
  const [end, setEnd] = useState(initialEnd);
  const [method, setMethod] = useState<PaymentMethod>("bank_transfer");

  const days = start && end && end > start ? daysBetween(start, end) : 0;
  const total = days * rate;

  function onStartChange(value: string) {
    setStart(value);
    if (value && (!end || end <= value)) setEnd(addDays(value, 1));
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <input type="hidden" name="vehicleId" value={vehicleId} />
      <input type="hidden" name="method" value={method} />

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="start">Pickup</Label>
          <Input id="start" name="start" type="date" min={today} value={start} onChange={(e) => onStartChange(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="end">Return</Label>
          <Input id="end" name="end" type="date" min={start ? addDays(start, 1) : addDays(today, 1)} value={end} onChange={(e) => setEnd(e.target.value)} required />
        </div>
      </div>

      <fieldset className="space-y-2">
        <legend className="mb-2 text-sm font-semibold">How will you pay?</legend>
        <div className="grid gap-2">
          {methods.map(({ value, title, text, icon: Icon }) => (
            <label
              key={value}
              className={cn(
                "flex cursor-pointer items-center gap-3 rounded-xl border p-3.5 transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring",
                method === value ? "border-primary bg-primary/10" : "hover:bg-muted",
              )}
            >
              <input type="radio" name="method-choice" value={value} checked={method === value} onChange={() => setMethod(value)} className="sr-only" />
              <span className="bg-ink grid size-10 shrink-0 place-items-center rounded-lg text-white">
                <Icon className="size-5" />
              </span>
              <span className="flex-1">
                <span className="block text-sm font-semibold">{title}</span>
                <span className="text-muted-foreground block text-xs">{text}</span>
              </span>
              <span className={cn("size-4 rounded-full border-2", method === value ? "border-primary bg-primary" : "border-input")} />
            </label>
          ))}
        </div>
      </fieldset>

      <div className="bg-muted space-y-2 rounded-xl p-4 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">
            {formatNaira(rate)} x {days || 0} {days === 1 ? "day" : "days"}
          </span>
          <span>{formatNaira(total)}</span>
        </div>
        <div className="flex items-center justify-between border-t pt-2 text-base font-bold">
          <span>Total</span>
          <span className="font-display text-lg">{formatNaira(total)}</span>
        </div>
      </div>

      <FormMessage error={state.error} />

      {unavailable && (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3.5 py-3 text-sm text-amber-900">
          This car is already booked for the dates you searched. Pick other dates or choose another vehicle.
        </p>
      )}

      {signedIn ? (
        <Button type="submit" size="lg" className="w-full" disabled={pending || days === 0}>
          {pending && <Loader2 className="animate-spin" />} Reserve now
        </Button>
      ) : (
        <Button asChild size="lg" className="w-full">
          <Link href={loginHref}>Log in to reserve</Link>
        </Button>
      )}
      <p className="text-muted-foreground text-center text-xs">
        You will not be charged yet. After reserving, we show you where to send your payment.
      </p>
    </form>
  );
}
