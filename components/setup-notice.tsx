import { Database } from "lucide-react";

/** Friendly screen shown when the Supabase environment variables are missing. */
export function SetupNotice() {
  return (
    <main className="grid min-h-screen place-items-center p-6">
      <div className="bg-card max-w-lg rounded-2xl border p-8 shadow-sm">
        <div className="bg-primary/15 text-primary-foreground mb-4 grid size-12 place-items-center rounded-xl">
          <Database className="size-6 text-[#8a5a00]" />
        </div>
        <h1 className="text-2xl font-bold">Almost there: connect Supabase</h1>
        <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
          Add these to your <code className="bg-muted rounded px-1.5 py-0.5">.env.local</code> file (or your Vercel
          environment variables), then restart the app:
        </p>
        <pre className="bg-ink mt-4 overflow-x-auto rounded-xl p-4 text-xs leading-relaxed text-white">
{`NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...`}
        </pre>
        <p className="text-muted-foreground mt-4 text-sm">
          You can copy both values from Supabase Dashboard, Project Settings, API Keys.
        </p>
      </div>
    </main>
  );
}
