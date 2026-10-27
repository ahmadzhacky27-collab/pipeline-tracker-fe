import { createContext, useContext, useState } from "react";
import { api, TOKEN_KEY } from "@/lib/api";

const USER_KEY = "ccp_user";
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem(USER_KEY);
      // Pastikan data ada, tidak kosong, dan tidak bernilai string "undefined"
      if (saved && saved !== "undefined" && saved !== "null") {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.error("Gagal memparsing data user dari localStorage:", error);
      // Bersihkan data yang korup agar tidak error terus menerus
      localStorage.removeItem(USER_KEY);
    }
    return null;
  });

  function saveSession({ token, user }) {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
    setUser(user || null);
  }

  async function login(credentials) {
    const response = await api.login(credentials);
    // Sesuaikan dengan struktur response backend: { token, data (user) }
    saveSession({
      token: response.token,
      user: response.data || response.user
    });
  }

  async function register(data) {
    const response = await api.register(data);
    saveSession({
      token: response.token,
      user: response.data || response.user
    });
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}