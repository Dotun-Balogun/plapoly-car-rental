import type { Metadata } from "next";
import { AuthShell } from "@/components/auth-shell";
import { RegisterForm } from "./register-form";

export const metadata: Metadata = { title: "Create account" };

export default function RegisterPage() {
  return (
    <AuthShell title="Create your account" subtitle="It takes a minute. You need an account to reserve a vehicle.">
      <RegisterForm />
    </AuthShell>
  );
}
