import * as React from "react"

import { cn } from "@/lib/utils"

/* ============================================
   STANDARDIZED CARD COMPONENT - MODERN UI
   ============================================ */

function Card({
  className,
  ...props
}) {
  return (
    <div
      data-slot="card"
      className={cn(
        // Base styles - glass morphism
        "rounded-xl border border-white/10",
        "p-5",
        // Glass effect
        "glass",
        // Modern shadow
        "shadow-lg shadow-black/5",
        className
      )}
      {...props} />
  );
}

function CardHeader({
  className,
  ...props
}) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "flex flex-col space-y-1.5 p-5 pb-3",
        className
      )}
      {...props} />
  );
}

function CardTitle({
  className,
  ...props
}) {
  return (
    <div
      data-slot="card-title"
      className={cn(
        "text-xl font-semibold leading-none tracking-tight text-white",
        className
      )}
      {...props} />
  );
}

function CardDescription({
  className,
  ...props
}) {
  return (
    <div
      data-slot="card-description"
      className={cn(
        "text-sm text-white/60",
        className
      )}
      {...props} />
  );
}

function CardAction({
  className,
  ...props
}) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "ml-auto",
        className
      )}
      {...props} />
  );
}

function CardContent({
  className,
  ...props
}) {
  return (
    <div 
      data-slot="card-content" 
      className={cn("p-5 pt-0", className)} 
      {...props} 
    />
  );
}

function CardFooter({
  className,
  ...props
}) {
  return (
    <div
      data-slot="card-footer"
      className={cn(
        "flex items-center p-5 pt-0",
        className
      )}
      {...props} />
  );
}

/* Card Variants */
const cardVariants = {
  default: "bg-card text-card-foreground rounded-xl border border-white/10 p-5 glass shadow-lg",
  glass: "glass rounded-xl",
  interactive: "glass rounded-xl cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:border-white/20 hover:shadow-xl",
  solid: "bg-white/10 border border-white/10 rounded-xl p-5",
  glassInteractive: "glass rounded-xl cursor-pointer hover:scale-[1.02] hover:border-white/20 transition-all duration-300",
  outline: "border-2 border-white/20 rounded-xl p-5",
  elevated: "bg-black/30 border border-white/10 rounded-xl shadow-lg p-5",
  filled: "bg-white/5 rounded-xl p-5",
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
  cardVariants,
}
