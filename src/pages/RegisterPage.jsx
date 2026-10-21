import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { RegisterForm } from "@/components/register-form"; // Sesuaikan path lokasi file RegisterForm

export default function RegisterPage() {
  const { user } = useAuth();

  // Jika user sudah login, lempar langsung ke /contents
  if (user) return <Navigate to="/contents" replace />;

  return (
    <div className="flex items-center justify-center w-full p-6 min-h-svh md:p-10">
      <div className="w-full max-w-sm">
        <RegisterForm />
      </div>
    </div>
  );
}