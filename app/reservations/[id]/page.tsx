import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2, Clock } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import { config, ussdCodes } from "@/lib/config";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { VehicleImage } from "@/components/vehicle-image";
import { Flash } from "@/components/flash";
import { CopyButton } from "@/components/copy-button";
import { PaymentBadge, ReservationBadge } from "@/components/status-badge";
import { SubmitButton } from "@/components/submit-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cancelReservation } from "@/app/actions/booking";
import { cn, daysBetween, formatDate, formatDateTime, formatNaira } from "@/lib/utils";
import { paymentMethodLabels, type ReservationWithRelations } from "@/lib/types";

export const metadata: Metadata = { title: "Booking details" };

function Row({ label, value, copy }: { label: string; value: string; copy?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 py-3">
      <span className="text-muted-foreground text-sm">{label}</span>
      <span className="flex items-center gap-1 text-right text-sm font-semibold">
        {value}
        {copy && <CopyButton value={value} label={`Copy ${label}`} />}
      </span>
    </div>
  );
}

const stages = ["Booked", "Payment verified", "On the road", "Returned"];
function stageIndex(status: string) {
  if (status === "pending") return 0;
  if (status === "confirmed") return 1;
  if (status === "active") return 2;
  if (status === "completed") return 3;
  return -1;
}

export default async function ReservationPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ new?: string; notice?: string; error?: string }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  await requireUser(`/reservations/${id}`);
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();

  const supabase = await createClient();
  const { data } = await supabase.from("reservations").select("*, vehicles(*), payments(*)").eq("id", id).maybeSingle();
  const r = data as ReservationWithRelations | null;
  if (!r) notFound();

  const payment = r.payments[0];
  const days = daysBetween(r.start_date, r.end_date);
  const needsPayment = r.status === "pending" && payment?.status === "pending";
  const current = stageIndex(r.status);
  const canCancel = r.status === "pending" || r.status === "confirmed";

  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6">
        <Link href="/reservations" className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-sm font-medium">
          <ArrowLeft className="size-4" /> All bookings
        </Link>

        <div className="mt-5">
          <Flash notice={query.notice} error={query.error} />
          {query.new && needsPayment && (
            <div className="mb-6 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3.5 text-emerald-900">
              <CheckCircle2 className="mt-0.5 size-5 shrink-0" />
              <div>
                <p className="font-semibold">Your car is reserved.</p>
                <p className="text-sm">Send your payment using the details below to get it confirmed.</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold">Booking {r.reference}</h1>
            <p className="text-muted-foreground mt-1 text-sm">Made on {formatDateTime(r.created_at)}</p>
          </div>
          <ReservationBadge status={r.status} />
        </div>

        {current >= 0 && (
          <ol className="mt-6 grid grid-cols-4 gap-2">
            {stages.map((label, i) => (
              <li key={label} className="space-y-2">
                <div className={cn("h-1.5 rounded-full", i <= current ? "bg-primary" : "bg-border")} />
                <p className={cn("text-xs sm:text-sm", i <= current ? "font-semibold" : "text-muted-foreground")}>{label}</p>
              </li>
            ))}
          </ol>
        )}

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_1fr]">
          <div className="space-y-6">
            <Card className="overflow-hidden">
              {r.vehicles && <VehicleImage vehicle={r.vehicles} className="h-48" />}
              <CardContent className="pt-5">
                <h2 className="text-xl font-semibold">{r.vehicles ? `${r.vehicles.brand} ${r.vehicles.model}` : "Vehicle"}</h2>
                <div className="mt-3 divide-y">
                  <Row label="Pickup" value={formatDate(r.start_date)} />
                  <Row label="Return" value={formatDate(r.end_date)} />
                  <Row label="Duration" value={`${days} ${days === 1 ? "day" : "days"}`} />
                  {r.vehicles && <Row label="Plate number" value={r.vehicles.registration_no} />}
                  <Row label="Total" value={formatNaira(r.amount)} />
                </div>
              </CardContent>
            </Card>

            {canCancel && (
              <form action={cancelReservation}>
                <input type="hidden" name="reservationId" value={r.id} />
                <SubmitButton variant="outline" confirm="Cancel this reservation? This cannot be undone.">
                  Cancel reservation
                </SubmitButton>
              </form>
            )}
          </div>

          <div className="space-y-6">
            {payment && (
              <Card>
                <CardHeader className="flex-row items-center justify-between gap-3">
                  <CardTitle>{needsPayment ? "Complete your payment" : "Payment"}</CardTitle>
                  <PaymentBadge status={payment.status} />
                </CardHeader>
                <CardContent>
                  {needsPayment ? (
                    <>
                      <p className="text-muted-foreground mb-2 text-sm">
                        Pay with {paymentMethodLabels[payment.method].toLowerCase()} using these details.
                      </p>
                      <div className="divide-y">
                        <Row label="Amount" value={formatNaira(payment.amount)} />
                        <Row label="Bank" value={config.bank.name} />
                        <Row label="Account number" value={config.bank.accountNumber} copy />
                        <Row label="Account name" value={config.bank.accountName} />
                        <Row label="Reference (narration)" value={payment.reference} copy />
                      </div>

                      {payment.method === "ussd" && (
                        <div className="bg-muted mt-4 rounded-xl p-4 text-sm">
                          <p className="font-semibold">How to pay with USSD</p>
                          <ol className="text-muted-foreground mt-2 list-decimal space-y-1 pl-5">
                            <li>Dial your bank&apos;s USSD code from the phone linked to your account.</li>
                            <li>Choose transfer, then enter the amount and account number above.</li>
                            <li>Use the reference as the narration if your bank asks for one.</li>
                          </ol>
                          <div className="mt-3 flex flex-wrap gap-1.5">
                            {ussdCodes.map((u) => (
                              <span key={u.bank} className="bg-card rounded-md border px-2 py-1 text-xs">
                                {u.bank} <strong>{u.code}</strong>
                              </span>
                            ))}
                          </div>
                          <p className="text-muted-foreground mt-2 text-xs">Codes can change. Confirm with your bank if one does not work.</p>
                        </div>
                      )}

                      <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 p-3.5 text-sm text-amber-900">
                        <Clock className="mt-0.5 size-4 shrink-0" />
                        <p>
                          Your booking is confirmed once we verify your payment. Questions? Call{" "}
                          <a href={`tel:${config.supportPhone}`} className="font-semibold underline">{config.supportPhone}</a>.
                        </p>
                      </div>
                    </>
                  ) : (
                    <div className="divide-y">
                      <Row label="Method" value={paymentMethodLabels[payment.method]} />
                      <Row label="Amount" value={formatNaira(payment.amount)} />
                      <Row label="Reference" value={payment.reference} copy />
                      {payment.payment_date && <Row label="Paid on" value={formatDateTime(payment.payment_date)} />}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
