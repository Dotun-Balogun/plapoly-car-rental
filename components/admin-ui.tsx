import Link from "next/link";
import { cn } from "@/lib/utils";

export function PageHeader({ title, description, children }: { title: string; description?: string; children?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">{title}</h1>
        {description && <p className="text-muted-foreground mt-1 text-sm">{description}</p>}
      </div>
      {children}
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string;
  value: string;
  hint?: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="bg-card rounded-2xl border p-5">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground text-sm">{label}</p>
        <span className="bg-accent text-accent-foreground grid size-9 place-items-center rounded-lg">
          <Icon className="size-4" />
        </span>
      </div>
      <p className="font-display mt-3 text-3xl font-bold">{value}</p>
      {hint && <p className="text-muted-foreground mt-1 text-xs">{hint}</p>}
    </div>
  );
}

export function FilterTabs({
  basePath,
  param = "status",
  current,
  options,
}: {
  basePath: string;
  param?: string;
  current?: string;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="mb-5 flex flex-wrap gap-2">
      {options.map((o) => {
        const active = (current ?? "") === o.value;
        return (
          <Link
            key={o.value}
            href={o.value ? `${basePath}?${param}=${o.value}` : basePath}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
              active ? "bg-ink border-ink text-white" : "bg-card hover:bg-muted",
            )}
          >
            {o.label}
          </Link>
        );
      })}
    </div>
  );
}

export function EmptyRow({ children }: { children: React.ReactNode }) {
  return <p className="text-muted-foreground px-5 py-12 text-center text-sm">{children}</p>;
}
