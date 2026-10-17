import { cva } from "class-variance-authority";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import React from "react";

// Dipakai juga untuk <Link> agar tampilannya sama dengan tombol.
export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        outline: "border border-input bg-card hover:bg-muted",
        ghost: "hover:bg-muted",
        destructive: "text-destructive hover:bg-destructive/10",
      },
      size: {
        default: "h-9 px-4",
        sm: "h-8 px-3",
        icon: "h-8 w-8",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
);

export const Button = forwardRef(({ className, variant, size, ...props }, ref) => (
  <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
));
Button.displayName = "Button";
