import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";
import { cn } from "@/utils/cn";

const statusBadgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[13px] font-medium leading-tight",
  {
    variants: {
      tone: {
        success: "bg-[#DCFCE7] text-[#065F46]",
        warning: "bg-[#FEF3C7] text-[#92400E]",
        danger: "bg-[#FEE2E2] text-[#B91C1C]",
        info: "bg-[#E0F2FE] text-[#0369A1]",
        brand: "bg-[#0101B7] text-white",
      },
    },
    defaultVariants: {
      tone: "info",
    },
  },
);

export interface StatusBadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof statusBadgeVariants> {}

export function StatusBadge({
  className,
  tone,
  children,
  ...props
}: StatusBadgeProps) {
  return (
    <span className={cn(statusBadgeVariants({ tone }), className)} {...props}>
      {children}
    </span>
  );
}
