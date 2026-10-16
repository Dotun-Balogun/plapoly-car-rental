import type { Metadata } from "next";
import { PageHeader } from "@/components/admin-ui";
import { Card, CardContent } from "@/components/ui/card";
import { VehicleForm } from "../vehicle-form";

export const metadata: Metadata = { title: "Add vehicle" };

export default function NewVehiclePage() {
  return (
    <>
      <PageHeader title="Add vehicle" description="Fill in the details customers will see." />
      <Card>
        <CardContent className="pt-6">
          <VehicleForm />
        </CardContent>
      </Card>
    </>
  );
}
