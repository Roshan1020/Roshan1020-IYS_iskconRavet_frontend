// AuthContext.js
import React, { createContext, useState, useEffect } from "react";

// copy/paste your existing jwt helpers here (small and safe)
function base64UrlDecode(str) {
  if (!str) return null;
  str = str.replace(/-/g, "+").replace(/_/g, "/");
  while (str.length % 4) str += "=";
  try {
    return decodeURIComponent(
      atob(str)
        .split("")
        .map(c => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
  } catch {
    return null;
  }
}
function decodeJwt(token) {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const payload = base64UrlDecode(parts[1]);
  try { return JSON.parse(payload); } catch { return null; }
}
function isTokenValid(token) {
  const p = decodeJwt(token);
  if (!p) return false;
  if (p.exp) return Math.floor(Date.now()/1000) < p.exp;
  return true;
}

export const AuthContext = createContext({
  isAuthenticated: false,
  username: null,
  setAuth: () => {}
});

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState(null);

  // initial read from localStorage on mount
  useEffect(() => {
    const t = localStorage.getItem("token");
    if (t && isTokenValid(t)) {
      setIsAuthenticated(true);
      const payload = decodeJwt(t);
      setUsername(payload?.sub || localStorage.getItem("username") || null);
    } else {
      setIsAuthenticated(false);
      setUsername(null);
    }
  }, []);

  // helper to update auth state after signin/signout
  const setAuth = ({ token, username: user }) => {
    if (token) {
      localStorage.setItem("token", token.trim());
      if (user) localStorage.setItem("username", user);
      setIsAuthenticated(true);
      setUsername(user ?? decodeJwt(token)?.sub ?? null);
    } else {
      // logout
      localStorage.removeItem("token");
      localStorage.removeItem("username");
      setIsAuthenticated(false);
      setUsername(null);
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, username, setAuth }}>
      {children}
    </AuthContext.Provider>
  );
}
