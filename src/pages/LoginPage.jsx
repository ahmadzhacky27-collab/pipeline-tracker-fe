import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { LoginForm } from "@/components/login-form"; // Sesuaikan path lokasi file LoginForm kamu

export default function LoginPage() {
  const { user } = useAuth();

  // Jika user sudah login, otomatis lempar ke /contents
  if (user) return <Navigate to="/contents" replace />;

  return (
    <div className="flex items-center justify-center w-full p-6 min-h-svh md:p-10">
      <div className="w-full max-w-sm">
        <LoginForm />
      </div>
    </div>
  );
}