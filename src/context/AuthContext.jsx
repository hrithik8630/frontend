import { createContext, useContext, useMemo, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [role, setRole] = useState(localStorage.getItem("role") || "PATIENT");
  const [email, setEmail] = useState(localStorage.getItem("email") || "");

  const login = ({ token: nextToken, role: nextRole, email: nextEmail }) => {
    setToken(nextToken);
    setRole(nextRole || "PATIENT");
    setEmail(nextEmail || "");
    localStorage.setItem("token", nextToken);
    localStorage.setItem("role", nextRole || "PATIENT");
    localStorage.setItem("email", nextEmail || "");
  };

  const logout = () => {
    setToken("");
    setRole("PATIENT");
    setEmail("");
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("email");
  };

  const value = useMemo(() => ({ token, role, email, login, logout }), [token, role, email]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
