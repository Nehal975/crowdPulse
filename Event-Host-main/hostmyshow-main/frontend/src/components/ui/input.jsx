import * as React from "react"

import { cn } from "@/lib/utils"

/* ============================================
   STANDARDIZED INPUT COMPONENT - MODERN UI
   ============================================ */

function Input({
  className,
  type,
  variant = "glass",
  ...props
}) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        // Base styles
        "flex h-11 w-full rounded-lg px-4 py-2 text-base",
        // Glass variant (default)
        "border border-white/20 bg-white/10 text-white backdrop-blur-sm",
        "placeholder:text-white/40",
        // Selection
        "selection:bg-brand-500/30 selection:text-white",
        // Focus states
        "focus-visible:outline-none focus-visible:border-brand-400 focus-visible:ring-2 focus-visible:ring-brand-400/30",
        // Disabled
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        // Transition
        "transition-all duration-200",
        // Shadow
        "shadow-sm",
        className
      )}
      {...props} />
  );
}

/* Input Variants */
const inputVariants = {
  default: "bg-white/10 border-white/20 text-white placeholder:text-white/40",
  glass: "border border-white/20 bg-white/10 text-white placeholder:text-white/40 backdrop-blur-sm",
  solid: "bg-white/20 border-transparent text-white placeholder:text-white/50",
  light: "bg-white border-gray-200 text-gray-900 placeholder:text-gray-400",
  dark: "bg-gray-900/50 border-gray-700 text-white placeholder:text-gray-400",
}

/* Helper function for input variants */
function getInputClassName(variant = "default", className) {
  return cn(inputVariants[variant], className)
}

export { Input, inputVariants, getInputClassName }
