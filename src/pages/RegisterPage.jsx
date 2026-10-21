import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import AuthShell from "@/components/AuthShell";
import Field from "@/components/Field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect as Select } from "@/components/ui/native-select";
import { useAuth } from "@/hooks/useAuth";
import { ROLES } from "@/lib/constants";
import React from "react";

export default function RegisterPage() {
  const { user, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "creator" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/contents" replace />;

  const setField = (name) => (event) => setForm({ ...form, [name]: event.target.value });

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setErrors({});
    try {
      await register(form);
      // Editor tidak punya channel; langsung ke daftar konten.
      toast.success("Akun dibuat");
      navigate(form.role === "editor" ? "/contents" : "/channels");
    } catch (error) {
      setErrors(error.errors || {});
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Buat akun"
      footer={
        <>
          Sudah punya akun?{" "}
          <Link to="/login" className="font-medium underline text-primary">
            Masuk
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Nama lengkap" error={errors.name}>
          <Input value={form.name} onChange={setField("name")} autoFocus />
        </Field>
        <Field label="Email" error={errors.email}>
          <Input type="email" value={form.email} onChange={setField("email")} />
        </Field>
        <Field label="Password" error={errors.password} hint="Minimal 8 karakter">
          <Input type="password" value={form.password} onChange={setField("password")} />
        </Field>
        <Field label="Daftar sebagai" error={errors.role}>
          <Select value={form.role} onChange={setField("role")}>
            {/* Admin tidak bisa dipilih sendiri; hanya diangkat oleh admin lain */}
            {ROLES.filter((role) => role.value !== "admin").map((role) => (
              <option key={role.value} value={role.value}>{role.label}</option>
            ))}
          </Select>
        </Field>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Membuat akun..." : "Daftar"}
        </Button>
      </form>
    </AuthShell>
  );
}
