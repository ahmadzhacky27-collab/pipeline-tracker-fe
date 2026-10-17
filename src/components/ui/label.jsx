import { cn } from "@/lib/utils";
import React from "react";

export function Label({ className, ...props }) {
  return <label className={cn("text-sm font-medium", className)} {...props} />;
}
