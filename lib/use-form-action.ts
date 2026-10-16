"use client";

import { useActionState, useTransition, type FormEvent } from "react";
import type { FormState } from "@/lib/types";

/**
 * Wraps a server action so the form keeps what the user typed when the
 * server returns an error (React 19 would otherwise clear the fields).
 */
export function useFormAction(
  action: (prev: FormState, formData: FormData) => Promise<FormState>,
  initial: FormState,
) {
  const [state, formAction, actionPending] = useActionState<FormState, FormData>(action, initial);
  const [transitionPending, startTransition] = useTransition();

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => formAction(formData));
  }

  return { state, pending: actionPending || transitionPending, onSubmit };
}
