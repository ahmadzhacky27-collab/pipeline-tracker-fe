import { Label } from "@/components/ui/label";
import React from "react";

// Label + input + pesan error dari server, dibungkus jadi satu.
export default function Field({ label, error, hint, children }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
      {hint && !error && <p className="text-xs text-muted-foreground">{hint}</p>}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
