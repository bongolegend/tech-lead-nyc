import React, { createContext, useContext, useState, useEffect } from "react";
import { User } from "../types/types";
import axios from "axios";

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
// const API_URL = import.meta.env.API_URL || "http://localhost:3000";
const API_URL = "https://interview-app-server-831130136724.us-east1.run.app";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!window.location.pathname.startsWith("/dashboard")) return;
  
    fetch(`${API_URL}/auth/me`, { credentials: "include" })
      .then(res => res.ok ? res.json() : null)
      .then(setUser)
      .finally(() => setLoading(false));
  }, []);
  

  const logout = async () => {
    await fetch(`${API_URL}/auth/logout`, {
      credentials: "include",
    });
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
