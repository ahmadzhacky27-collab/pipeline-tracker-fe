import { Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";
import AppLayout from "./components/AppLayout";
import { useAuth } from "./hooks/useAuth";
import ChannelsPage from "./pages/ChannelsPage";
import ContentDetailPage from "./pages/ContentDetailPage";
import ContentsPage from "./pages/ContentsPage";
import LoginPage from "./pages/LoginPage";
import NewContentPage from "./pages/NewContentPage";
import RegisterPage from "./pages/RegisterPage";
import UsersPage from "./pages/UsersPage";
import React from "react";

// Halaman di dalam sini hanya bisa dibuka jika sudah login.
function ProtectedRoutes() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <AppLayout />;
}

// Batasi halaman berdasarkan peran. Peran yang tidak cocok dikembalikan ke daftar konten.
function RequireRole({ roles, children }) {
  const { user } = useAuth();
  return roles.includes(user.role) ? children : <Navigate to="/contents" replace />;
}

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route element={<ProtectedRoutes />}>
          <Route path="/contents" element={<ContentsPage />} />
          <Route path="/contents/:id" element={<ContentDetailPage />} />
          <Route
            path="/contents/new"
            element={<RequireRole roles={["creator", "admin"]}><NewContentPage /></RequireRole>}
          />
          <Route
            path="/channels"
            element={<RequireRole roles={["creator", "admin"]}><ChannelsPage /></RequireRole>}
          />
          <Route
            path="/users"
            element={<RequireRole roles={["admin"]}><UsersPage /></RequireRole>}
          />
        </Route>

        <Route path="*" element={<Navigate to="/contents" replace />} />
      </Routes>
      <Toaster position="bottom-right" richColors />
    </>
  );
}
