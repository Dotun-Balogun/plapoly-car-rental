import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/admin-ui";
import { Card, CardContent } from "@/components/ui/card";
import { VehicleForm } from "../../vehicle-form";
import type { Vehicle } from "@/lib/types";

export const metadata: Metadata = { title: "Edit vehicle" };

export default async function EditVehiclePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const supabase = await createClient();
  const { data } = await supabase.from("vehicles").select("*").eq("id", id).maybeSingle();
  if (!data) notFound();

  return (
    <>
      <PageHeader title="Edit vehicle" description={`${data.brand} ${data.model}`} />
      <Card>
        <CardContent className="pt-6">
          <VehicleForm vehicle={data as Vehicle} />
        </CardContent>
      </Card>
    </>
  );
}
