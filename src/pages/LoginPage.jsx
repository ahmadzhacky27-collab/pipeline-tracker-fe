import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import AuthShell from "@/components/AuthShell";
import Field from "@/components/Field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import React from "react";

export default function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/contents" replace />;

  const setField = (name) => (event) => setForm({ ...form, [name]: event.target.value });

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setErrors({});
    try {
      await login(form);
      navigate("/contents");
    } catch (error) {
      setErrors(error.errors || {});
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Masuk"
      footer={
        <>
          Belum punya akun?{" "}
          <Link to="/register" className="font-medium text-primary underline">
            Daftar
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Email" error={errors.email}>
          <Input type="email" value={form.email} onChange={setField("email")} autoFocus />
        </Field>
        <Field label="Password" error={errors.password}>
          <Input type="password" value={form.password} onChange={setField("password")} />
        </Field>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Memeriksa..." : "Masuk"}
        </Button>
      </form>
    </AuthShell>
  );
}
