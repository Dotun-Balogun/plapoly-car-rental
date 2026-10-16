import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

/** A styled native <select>: best behaviour on phones and fully accessible. */
function Select({ className, children, ...props }: React.ComponentProps<"select">) {
  return (
    <div className="relative">
      <select
        className={cn(
          "border-input flex h-11 w-full cursor-pointer appearance-none rounded-lg border bg-white pr-9 pl-3.5 text-base transition-colors outline-none md:text-sm",
          "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/25 disabled:opacity-50",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown className="text-muted-foreground pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2" />
    </div>
  );
}

export { Select };
