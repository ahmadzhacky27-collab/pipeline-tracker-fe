import { useEffect, useState } from "react";
import { toast } from "sonner";
import { NativeSelect as Select } from "@/components/ui/native-select";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import { ROLES, labelOf } from "@/lib/constants";
import React from "react";

// Khusus admin: mengubah role pengguna.
export default function UsersPage() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState([]);

  useEffect(() => {
    api.getUsers().then(setUsers).catch((error) => toast.error(error.message));
  }, []);

  async function changeRole(target, role) {
    try {
      const updated = await api.updateUserRole(target.id, role);
      setUsers(users.map((u) => (u.id === updated.id ? updated : u)));
      toast.success(`${target.name} sekarang ${labelOf(ROLES, role)}`);
    } catch (error) {
      toast.error(error.message);
    }
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-semibold">Pengguna</h1>
      <p className="mt-1 text-muted-foreground">Atur peran setiap akun. Akun sendiri tidak bisa diubah.</p>

      <div className="mt-6 overflow-x-auto border rounded bg-card">
        <table className="w-full min-w-[30rem] text-left text-sm">
          <thead className="border-b bg-muted text-muted-foreground">
            <tr>
              <th className="px-4 py-2 font-medium">Nama</th>
              <th className="px-4 py-2 font-medium">Email</th>
              <th className="px-4 py-2 font-medium">Role</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b last:border-b-0">
                <td className="px-4 py-2 font-medium">{u.name}</td>
                <td className="px-4 py-2 text-muted-foreground">{u.email}</td>
                <td className="px-4 py-2">
                  <Select
                    className="w-32"
                    value={u.role}
                    disabled={u.id === me.id}
                    onChange={(e) => changeRole(u, e.target.value)}
                    aria-label={`Role ${u.name}`}
                  >
                    {ROLES.map((role) => (
                      <option key={role.value} value={role.value}>{role.label}</option>
                    ))}
                  </Select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
