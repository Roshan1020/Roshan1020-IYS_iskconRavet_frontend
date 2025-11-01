import React, { useState, useEffect } from "react";

// --- Helper Functions ---
function base64UrlDecode(str) {
  str = str.replace(/-/g, "+").replace(/_/g, "/");
  while (str.length % 4) str += "=";
  try {
    return decodeURIComponent(
      atob(str)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
  } catch (e) {
    return null;
  }
}

function decodeJwt(token) {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const payload = base64UrlDecode(parts[1]);
  try {
    return JSON.parse(payload);
  } catch (e) {
    return null;
  }
}

function isTokenValid(token) {
  const payload = decodeJwt(token);
  if (!payload) return false;
  if (payload.exp) {
    const now = Math.floor(Date.now() / 1000);
    return payload.exp > now;
  }
  return true;
}

// --- Navbar Component ---
export default function Navbar({ onNavigate, current }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // check auth when navbar loads
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token && isTokenValid(token));

    // listen for login/logout events
    const handleAuthUpdate = () => {
      const t = localStorage.getItem("token");
      setIsAuthenticated(!!t && isTokenValid(t));
    };
    window.addEventListener("auth:login", handleAuthUpdate);
    window.addEventListener("auth:logout", handleAuthUpdate);
    return () => {
      window.removeEventListener("auth:login", handleAuthUpdate);
      window.removeEventListener("auth:logout", handleAuthUpdate);
    };
  }, []);

  // logout handler
  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    window.dispatchEvent(new Event("auth:logout"));
    alert("You have been logged out.");
    onNavigate("signin"); // redirect to signin page
  };

  const NavLink = ({ to, children }) => (
    <button
      onClick={() => {
        onNavigate(to);
        setIsOpen(false);
      }}
      style={{
        background: "transparent",
        border: "none",
        cursor: "pointer",
        padding: "10px 14px",
        fontWeight: current === to ? "700" : "500",
        display: "block",
      }}
    >
      {children}
    </button>
  );

  return (
    <nav
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "10px 24px",
        borderBottom: "1px solid #ddd",
        background: "#fafafa",
        position: "relative",
      }}
    >
      <div style={{ fontWeight: 700 }}>ISKCON RAVET</div>

      {/* Desktop Menu */}
      <div
        style={{
          display: "flex",
          gap: "20px",
        }}
        className="desktop-menu"
      >
        <div className="desktop-only" style={{ display: "flex", gap: "10px" }}>
          <NavLink to="home">Home</NavLink>
          <NavLink to="contact">Contact</NavLink>

          {!isAuthenticated ? (
            <>
              <NavLink to="signin">Sign In</NavLink>
              <NavLink to="signup">Sign Up</NavLink>
            </>
          ) : (
            <>
              <NavLink to="registration">Profile</NavLink>
              <button
                onClick={handleLogout}
                style={{
                  background: "#e63946",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  padding: "8px 14px",
                  cursor: "pointer",
                  fontWeight: "600",
                }}
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>

      {/* Mobile Hamburger */}
      <div
        className="mobile-only"
        style={{
          display: "none",
          cursor: "pointer",
        }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div style={{ width: "25px", height: "3px", backgroundColor: "#333", margin: "4px 0" }}></div>
        <div style={{ width: "25px", height: "3px", backgroundColor: "#333", margin: "4px 0" }}></div>
        <div style={{ width: "25px", height: "3px", backgroundColor: "#333", margin: "4px 0" }}></div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "60px",
            right: "0",
            background: "#fafafa",
            border: "1px solid #ddd",
            borderRadius: "4px",
            padding: "10px",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            width: "200px",
          }}
          className="mobile-menu"
        >
          <NavLink to="home">Home</NavLink>
          <NavLink to="contact">Contact</NavLink>

          {!isAuthenticated ? (
            <>
              <NavLink to="signin">Sign In</NavLink>
              <NavLink to="signup">Sign Up</NavLink>
            </>
          ) : (
            <>
              <NavLink to="registration">Registration</NavLink>
              <button
                onClick={handleLogout}
                style={{
                  background: "#e63946",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  padding: "8px 14px",
                  cursor: "pointer",
                  fontWeight: "600",
                }}
              >
                Logout
              </button>
            </>
          )}
        </div>
      )}

      <style>
        {`
          @media (max-width: 768px) {
            .desktop-only { display: none; }
            .mobile-only { display: block; }
          }
        `}
      </style>
    </nav>
  );
}
