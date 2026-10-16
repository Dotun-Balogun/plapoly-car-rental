import * as React from "react";
import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn(
        "border-input placeholder:text-muted-foreground/80 flex min-h-24 w-full rounded-lg border bg-white px-3.5 py-2.5 text-base transition-colors outline-none md:text-sm",
        "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/25 disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
