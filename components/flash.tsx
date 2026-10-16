import { AlertCircle, CheckCircle2 } from "lucide-react";

/** Shows ?notice= / ?error= messages set by server actions. */
export function Flash({ notice, error }: { notice?: string; error?: string }) {
  if (!notice && !error) return null;
  const isError = Boolean(error);
  const Icon = isError ? AlertCircle : CheckCircle2;
  return (
    <div
      role={isError ? "alert" : "status"}
      className={`mb-6 flex items-start gap-3 rounded-xl border px-4 py-3 text-sm ${
        isError ? "border-red-200 bg-red-50 text-red-800" : "border-emerald-200 bg-emerald-50 text-emerald-800"
      }`}
    >
      <Icon className="mt-0.5 size-4 shrink-0" />
      <p>{error ?? notice}</p>
    </div>
  );
}

export function FormMessage({ error, success }: { error?: string; success?: string }) {
  if (!error && !success) return null;
  const Icon = error ? AlertCircle : CheckCircle2;
  return (
    <div
      role={error ? "alert" : "status"}
      className={`flex items-start gap-2.5 rounded-lg border px-3.5 py-3 text-sm ${
        error ? "border-red-200 bg-red-50 text-red-800" : "border-emerald-200 bg-emerald-50 text-emerald-800"
      }`}
    >
      <Icon className="mt-0.5 size-4 shrink-0" />
      <p>{error ?? success}</p>
    </div>
  );
}
