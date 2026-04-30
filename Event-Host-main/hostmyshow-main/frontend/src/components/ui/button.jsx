import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-brand-500 text-white shadow-md hover:bg-brand-600 hover:shadow-lg hover:shadow-brand-500/25 active:scale-[0.98] transition-transform",
        destructive:
          "bg-destructive text-destructive-foreground shadow-md hover:bg-destructive/90 hover:shadow-lg active:scale-[0.98]",
        outline:
          "border border-white/20 bg-transparent text-white hover:bg-white/10 hover:border-white/40 active:scale-[0.98] backdrop-blur-sm",
        secondary:
          "bg-white/10 border border-white/10 text-white shadow-sm hover:bg-white/20 hover:border-white/30 active:scale-[0.98]",
        ghost:
          "text-white/80 hover:bg-white/10 hover:text-white",
        link: "text-brand-400 underline-offset-4 hover:underline hover:text-brand-300",
        /* Brand gradient button - primary CTA */
        brand:
          "bg-gradient-to-r from-brand-500 to-brand-600 text-white shadow-md hover:from-brand-600 hover:to-brand-700 hover:shadow-lg hover:shadow-brand-500/25 active:scale-[0.98]",
        /* Gradient variant with purple */
        gradient:
          "bg-gradient-to-r from-brand-500 via-purple-500 to-brand-500 text-white shadow-md hover:from-brand-600 hover:via-purple-600 hover:to-brand-600 hover:shadow-lg hover:shadow-purple-500/25 active:scale-[0.98] bg-[length:200%_100%] animate-gradient",
        /* Glass style button */
        glass:
          "glass-button text-white border-white/20 backdrop-blur-md",
        /* Success button */
        success:
          "bg-green-500 text-white shadow-md hover:bg-green-600 hover:shadow-lg active:scale-[0.98]",
        /* Modern outline variant */
        "outline-modern":
          "border-2 border-brand-500/50 bg-transparent text-brand-400 hover:bg-brand-500/10 hover:border-brand-500 hover:text-brand-300 active:scale-[0.98] font-semibold",
        /* Soft shadow variant */
        "soft":
          "bg-white/10 text-white hover:bg-white/20 active:scale-[0.98] backdrop-blur-md",
      },
      size: {
        default: "h-10 px-5 py-2 has-[>svg]:px-4",
        sm: "h-8 rounded-md gap-1.5 px-3 text-xs has-[>svg]:px-2.5",
        lg: "h-12 rounded-lg px-8 text-base has-[>svg]:px-5",
        xl: "h-14 rounded-xl px-10 text-lg has-[>svg]:px-6 shadow-lg",
        icon: "h-10 w-10",
        "icon-sm": "h-8 w-8",
        "icon-lg": "h-12 w-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props} />
  );
}

export { Button, buttonVariants }
