import React, { useEffect, useState } from "react";

const API = import.meta.env.VITE_API_URL || ""; // e.g. "http://localhost:8080"

export default function Home({ onNavigate = () => {} }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const buildUrl = (path) => {
    const base = API.replace(/\/$/, "");
    return `${base}${path.startsWith("/") ? path : `/${path}`}`;
  };

  async function fetchJsonSafe(url, options = {}) {
    const resp = await fetch(url, options);
    const contentType = resp.headers.get("content-type") || "";
    if (!resp.ok) {
      const bodyText = await resp.text().catch(() => "");
      throw new Error(`HTTP ${resp.status} ${resp.statusText} - ${bodyText.slice(0, 200)}`);
    }
    if (contentType.includes("application/json")) {
      return resp.json();
    }
    const text = await resp.text();
    throw new Error(
      `Expected JSON but got: ${contentType}. Response starts: ${text.slice(0, 200)}`
    );
  }

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(Boolean(token));
  }, []);

  useEffect(() => {
    if (!isLoggedIn) return;
    const controller = new AbortController();
    const signal = controller.signal;

    async function fetchEvents() {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("token");
        const url = buildUrl("/iys/events");
        const data = await fetchJsonSafe(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          signal,
        });
        if (!Array.isArray(data)) throw new Error("Invalid response format");
        setEvents(data);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message || "Failed to load events");
          setEvents([]);
        }
      } finally {
        setLoading(false);
      }
    }

    fetchEvents();
    return () => controller.abort();
  }, [isLoggedIn]);

  const formatDateIndian = (isoString) => {
    if (!isoString) return "-";
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        timeZone: "Asia/Kolkata",
      });
    } catch {
      return isoString;
    }
  };

  const handleNavigate = (step, payload) => {
    if (typeof onNavigate === "function") onNavigate(step, payload || {});
  };

  const handleCardClick = (eventObj) => {
    if (!eventObj?.registration?.open) return;
    handleNavigate("yatraRegistration", { eventId: eventObj.id, event: eventObj });
  };

  return (
    <section
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        minHeight: "80vh",
        backgroundColor: "#f9fafb",
        padding: "24px",
      }}
    >
      {/* Work-in-progress banner */}
      <div
        style={{
          width: "100%",
          maxWidth: 1000,
          background: "#FFF3CD",
          border: "1px solid #FFEEBA",
          color: "#856404",
          padding: "10px 16px",
          borderRadius: 8,
          marginBottom: 20,
          textAlign: "center",
        }}
      >
        ⚠️ Website under development — some pages may not work properly.
      </div>

      <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 10, color: "#333" }}>
        Welcome to ISKCON GOVIND DHAM
      </h1>
      <p style={{ fontSize: 16, color: "#555", marginBottom: 20 }}>
        Upcoming Yatra details below
      </p>

      {!isLoggedIn && <p style={{ color: "#888" }}>Please sign in to view registration options.</p>}
      {isLoggedIn && loading && <p style={{ color: "#666" }}>Loading events...</p>}
      {isLoggedIn && error && <p style={{ color: "crimson" }}>⚠️ {error}</p>}
      {isLoggedIn && !loading && !error && events.length === 0 && (
        <p style={{ color: "#666" }}>No upcoming events at the moment.</p>
      )}

      {/* Events grid */}
      {isLoggedIn && !loading && events.length > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "20px",
            width: "100%",
            maxWidth: "1000px",
            marginBottom: "30px",
          }}
        >
          {events.map((event) => {
            const isOpen = Boolean(event?.registration?.open);
            const baseStyle = {
              borderRadius: "15px",
              padding: "20px",
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
              display: "flex",
              flexDirection: "column",
              gap: 8,
            };

            return isOpen ? (
              <article
                key={event.id}
                role="button"
                onClick={() => handleCardClick(event)}
                style={{
                  ...baseStyle,
                  background: "white",
                  boxShadow: "0 6px 20px rgba(0,0,0,0.1)",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-4px)")}
                onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
              >
                <h2 style={{ color: "#E65100", fontSize: "20px", margin: 0 }}>
                  {event.title || "Untitled Event"}
                </h2>
                <div style={{ color: "#555", fontSize: 14 }}>
                  <div>
                    <strong>Starts:</strong> {formatDateIndian(event.startDate)}
                  </div>
                  <div>
                    <strong>Ends:</strong> {formatDateIndian(event.endDate)}
                  </div>
                </div>
                <div style={{ marginTop: 6 }}>
                  <strong>Registration:</strong>{" "}
                  <span style={{ color: "green" }}>{event.registration?.label || "Open"}</span>
                </div>
              </article>
            ) : (
              <article
                key={event.id}
                aria-disabled="true"
                style={{
                  ...baseStyle,
                  background: "#fff",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                  color: "#666",
                  opacity: 0.85,
                  cursor: "not-allowed",
                }}
              >
                <h2 style={{ color: "#999", fontSize: "20px", margin: 0 }}>
                  {event.title || "Untitled Event"}
                </h2>
                <div style={{ color: "#777", fontSize: 14 }}>
                  <div>
                    <strong>Starts:</strong> {formatDateIndian(event.startDate)}
                  </div>
                  <div>
                    <strong>Ends:</strong> {formatDateIndian(event.endDate)}
                  </div>
                </div>
                <div style={{ marginTop: 6 }}>
                  <strong>Registration:</strong>{" "}
                  <span style={{ color: "red" }}>{event.registration?.label || "Closed"}</span>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Short Instructions below cards */}
      <div
        style={{
          width: "100%",
          maxWidth: "600px",
          background: "#fff",
          border: "1px solid #eee",
          borderRadius: 10,
          padding: 16,
          boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
          textAlign: "center",
        }}
      >
        <h3 style={{ marginBottom: 8, fontSize: 18, color: "#333" }}>Registration Steps</h3>
        <p style={{ fontSize: 15, color: "#444", marginBottom: 8 }}>1️⃣ Sign-up / Sign-in</p>
        <p style={{ fontSize: 15, color: "#444", marginBottom: 8 }}>2️⃣ Fill your Profile</p>
        <p style={{ fontSize: 15, color: "#444", marginBottom: 8 }}>3️⃣ Register for Yatra</p>

        <div style={{ marginTop: 10 }}>
          <button
            onClick={() => handleNavigate("signup")}
            style={{
              margin: "5px",
              padding: "8px 14px",
              borderRadius: 8,
              border: "1px solid #E2E8F0",
              background: "#f9fafb",
              cursor: "pointer",
            }}
          >
            Go to Sign-up
          </button>
          <button
            onClick={() => handleNavigate("profile")}
            style={{
              margin: "5px",
              padding: "8px 14px",
              borderRadius: 8,
              border: "1px solid #E2E8F0",
              background: "#f9fafb",
              cursor: "pointer",
            }}
          >
            Complete Profile
          </button>
        </div>
      </div>
    </section>
  );
}
