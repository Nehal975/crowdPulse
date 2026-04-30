import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-lg text-xs font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
  {
    variants: {
      variant: {
        default:
          "bg-brand-500 text-white shadow-sm",
        secondary:
          "bg-white/10 text-white/80 border border-white/10",
        destructive:
          "bg-destructive text-white shadow-sm hover:bg-destructive/90",
        outline:
          "border border-white/20 text-white/80 hover:bg-white/10 hover:text-white",
        success:
          "bg-green-500/20 text-green-400 border border-green-500/30",
        warning:
          "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
        info:
          "bg-blue-500/20 text-blue-400 border border-blue-500/30",
        glass:
          "glass text-white/90 text-xs",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}) {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props} />
  );
}

export { Badge, badgeVariants }
