import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"
import { ROLES } from "@/lib/constants"
import { toast } from "sonner"

export function RegisterForm({ className, ...props }) {
  const { register } = useAuth()
  const navigate = useNavigate()
  
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "creator" })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.id]: e.target.value })
  }

  const handleSelectChange = (e) => {
    setForm({ ...form, role: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrors({})

    try {
      await register(form)
      toast.success("Akun berhasil dibuat!")
      navigate(form.role === "editor" ? "/contents" : "/channels")
    } catch (error) {
      setErrors(error.errors || {})
      toast.error(error.message || "Gagal membuat akun")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Buat Akun Baru</CardTitle>
          <CardDescription>
            Masukkan data diri lu untuk mendaftar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-6">
              <div className="grid gap-2">
                <Label htmlFor="name">Nama Lengkap</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Nama lu"
                  value={form.name}
                  onChange={handleChange}
                  required
                  autoFocus
                />
                {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
                {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Minimal 8 karakter"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
                {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="role">Daftar Sebagai</Label>
                <select
                  id="role"
                  value={form.role}
                  onChange={handleSelectChange}
                  className="flex w-full px-3 py-1 text-sm transition-colors bg-transparent border rounded-md shadow-sm h-9 border-input file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {ROLES.filter((role) => role.value !== "admin").map((role) => (
                    <option key={role.value} value={role.value} className="bg-background text-foreground">
                      {role.label}
                    </option>
                  ))}
                </select>
                {errors.role && <p className="text-sm text-red-500">{errors.role}</p>}
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Membuat akun..." : "Daftar"}
              </Button>

              <div className="text-sm text-center">
                Sudah punya akun?{" "}
                <Link to="/login" className="underline underline-offset-4">
                  Masuk
                </Link>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}