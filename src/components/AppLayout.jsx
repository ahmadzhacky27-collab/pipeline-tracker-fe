import { LogOut } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
// import { ROLES, labelOf } from "@/lib/constants";
import { cn } from "@/lib/utils";
import React from "react";

// Menu hanya tampil untuk peran yang diizinkan.
const NAV_ITEMS = [
  { to: "/contents", label: "Konten", roles: ["creator", "editor", "admin"] },
  { to: "/channels", label: "Channel", roles: ["creator", "admin"] },
  { to: "/users", label: "Pengguna", roles: ["admin"] },
];

export default function AppLayout() {
  const { user, logout } = useAuth();
  const menu = NAV_ITEMS.filter((item) => item.roles.includes(user.role));

  return (
    <div className="min-h-screen">
      <header className="border-b bg-card">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-6 px-4">
          <span className="font-bold">Pipeline Konten</span>

          <nav className="flex gap-1">
            {menu.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn("rounded px-3 py-1.5 text-sm hover:bg-muted", isActive && "bg-muted font-medium")
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-3">
            <span className="hidden text-sm text-muted-foreground sm:inline">
              {user.name}
            </span>
            <Button variant="ghost" size="sm" onClick={logout}>
              <LogOut className="h-4 w-4" />
              Keluar
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
