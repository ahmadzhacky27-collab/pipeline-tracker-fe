import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import React from "react";

export const inputStyle =
  "flex w-full rounded border border-input bg-card px-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50";

export const Input = forwardRef(({ className, ...props }, ref) => (
  <input ref={ref} className={cn(inputStyle, "h-9", className)} {...props} />
));
Input.displayName = "Input";

export const Textarea = forwardRef(({ className, ...props }, ref) => (
  <textarea ref={ref} className={cn(inputStyle, "min-h-[80px] py-2", className)} {...props} />
));
Textarea.displayName = "Textarea";

// <select> bawaan browser, diberi gaya yang sama dengan Input.
export const Select = forwardRef(({ className, children, ...props }, ref) => (
  <select ref={ref} className={cn(inputStyle, "h-9", className)} {...props}>
    {children}
  </select>
));
Select.displayName = "Select";
