import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap",
  {
    variants: {
      variant: {
        neutral: "bg-secondary text-secondary-foreground",
        amber: "bg-[#fdf0d3] text-[#8a5a00]",
        green: "bg-[#dcf3e6] text-[#0f6b3a]",
        blue: "bg-[#dfeafc] text-[#1d4fb0]",
        red: "bg-[#fde3e0] text-[#a5251a]",
        dark: "bg-ink text-white",
      },
    },
    defaultVariants: { variant: "neutral" },
  },
);

function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge };
