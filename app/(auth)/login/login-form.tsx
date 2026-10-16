"use client";

import Link from "next/link";
import { Loader2 } from "lucide-react";
import { login } from "@/app/actions/auth";
import { useFormAction } from "@/lib/use-form-action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormMessage } from "@/components/flash";
import type { FormState } from "@/lib/types";

export function LoginForm({ next, initialError }: { next?: string; initialError?: string }) {
  const { state, pending, onSubmit } = useFormAction(login, { error: initialError });

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <input type="hidden" name="next" value={next ?? ""} />
      <FormMessage error={state.error} />
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" autoComplete="email" placeholder="you@example.com" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" name="password" type="password" autoComplete="current-password" required />
      </div>
      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending && <Loader2 className="animate-spin" />} Log in
      </Button>
      <p className="text-muted-foreground text-center text-sm">
        New here?{" "}
        <Link href={next ? `/register?next=${encodeURIComponent(next)}` : "/register"} className="text-teal font-semibold hover:underline">
          Create an account
        </Link>
      </p>
    </form>
  );
}
