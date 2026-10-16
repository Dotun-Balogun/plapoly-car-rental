"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { config } from "@/lib/config";
import { normalizeNigerianPhone, safeNextPath } from "@/lib/utils";
import type { FormState } from "@/lib/types";

const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
  password: z.string().min(1, "Enter your password."),
});

export async function login(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    const message = error.message.toLowerCase().includes("email not confirmed")
      ? "Please confirm your email first. Check your inbox for the confirmation link."
      : "Incorrect email or password.";
    return { error: message };
  }

  const next = safeNextPath(formData.get("next"));
  if (next) redirect(next);

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .maybeSingle();
  redirect(profile?.role === "admin" ? "/admin" : "/vehicles");
}

const registerSchema = z
  .object({
    fullName: z.string().trim().min(2, "Enter your full name."),
    email: z.string().trim().email("Enter a valid email address."),
    phone: z.string().trim().min(1, "Enter your phone number."),
    password: z.string().min(8, "Your password must be at least 8 characters."),
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, { message: "The passwords do not match.", path: ["confirm"] });

export async function register(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = registerSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    password: formData.get("password"),
    confirm: formData.get("confirm"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const phone = normalizeNigerianPhone(parsed.data.phone);
  if (!phone) return { error: "Enter a valid Nigerian phone number, e.g. 08012345678." };

  const h = await headers();
  const origin = h.get("origin") ?? (h.get("host") ? `https://${h.get("host")}` : config.siteUrl);

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { full_name: parsed.data.fullName, phone },
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    return {
      error: error.message.toLowerCase().includes("already")
        ? "An account with this email already exists. Try logging in."
        : error.message,
    };
  }

  // Supabase returns a user with no identities when the email is already registered.
  if (data.user && data.user.identities?.length === 0) {
    return { error: "An account with this email already exists. Try logging in." };
  }

  if (data.session) redirect("/vehicles");

  return { success: "Account created. Check your email and click the confirmation link to finish." };
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
