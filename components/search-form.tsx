"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { addDays } from "@/lib/utils";
import { vehicleTypeLabels, vehicleTypes } from "@/lib/types";

/** Pickup / return / type search. Submits to /vehicles as a normal GET. */
export function SearchForm({
  today,
  start: initialStart = "",
  end: initialEnd = "",
  type: initialType = "",
  variant = "hero",
}: {
  today: string;
  start?: string;
  end?: string;
  type?: string;
  variant?: "hero" | "bar";
}) {
  const [start, setStart] = useState(initialStart);
  const [end, setEnd] = useState(initialEnd);

  function onStartChange(value: string) {
    setStart(value);
    if (value && (!end || end <= value)) setEnd(addDays(value, 1));
  }

  return (
    <form
      action="/vehicles"
      className={
        variant === "hero"
          ? "bg-card grid gap-4 rounded-2xl p-4 shadow-2xl shadow-black/20 sm:p-5 md:grid-cols-[1fr_1fr_1fr_auto] md:items-end"
          : "bg-card grid gap-4 rounded-2xl border p-4 md:grid-cols-[1fr_1fr_1fr_auto] md:items-end"
      }
    >
      <div className="space-y-2">
        <Label htmlFor="start">Pickup date</Label>
        <Input id="start" name="start" type="date" min={today} value={start} onChange={(e) => onStartChange(e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="end">Return date</Label>
        <Input
          id="end"
          name="end"
          type="date"
          min={start ? addDays(start, 1) : addDays(today, 1)}
          value={end}
          onChange={(e) => setEnd(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="type">Vehicle type</Label>
        <Select id="type" name="type" defaultValue={initialType}>
          <option value="">All types</option>
          {vehicleTypes.map((t) => (
            <option key={t} value={t}>
              {vehicleTypeLabels[t]}
            </option>
          ))}
        </Select>
      </div>
      <Button type="submit" size="lg" className="h-11 w-full md:w-auto">
        <Search /> Find cars
      </Button>
    </form>
  );
}
