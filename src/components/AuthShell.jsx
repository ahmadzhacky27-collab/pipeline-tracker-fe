// Kerangka halaman login & register: form sempit di tengah layar.
import React from "react";

export default function AuthShell({ title, children, footer }) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <p className="mb-6 font-bold">Pipeline Konten</p>
        <h1 className="mb-6 text-2xl font-semibold">{title}</h1>
        {children}
        <p className="mt-6 text-sm text-muted-foreground">{footer}</p>
      </div>
    </div>
  );
}
