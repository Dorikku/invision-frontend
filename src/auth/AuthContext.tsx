import React, { createContext, useContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import type { ReactNode } from "react";
import type { DecodedToken } from "../types/auth";

interface AuthContextType {
  user: DecodedToken | null;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<DecodedToken | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if token expired
  const isTokenExpired = (decoded: DecodedToken) => {
    if (!decoded.exp) return true;
    const currentTime = Date.now() / 1000;
    return decoded.exp < currentTime;
  };

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      try {
        const decoded: DecodedToken = jwtDecode(storedToken);
        if (isTokenExpired(decoded)) {
          localStorage.removeItem("token");
        } else {
          setUser(decoded);
          setToken(storedToken);
          // Auto logout when token expires
          const timeout = (decoded.exp * 1000) - Date.now();
          setTimeout(() => logout(), timeout);
        }
      } catch {
        localStorage.removeItem("token");
      }
    }
    setLoading(false);
  }, []);

  const login = (newToken: string) => {
    localStorage.setItem("token", newToken);
    const decoded: DecodedToken = jwtDecode(newToken);
    setUser(decoded);
    setToken(newToken);

    // Auto logout after expiration
    if (decoded.exp) {
      const timeout = (decoded.exp * 1000) - Date.now();
      setTimeout(() => logout(), timeout);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setToken(null);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
