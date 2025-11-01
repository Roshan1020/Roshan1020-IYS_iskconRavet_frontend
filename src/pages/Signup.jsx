import React, { useState } from "react";

export default function Signup({ onNavigate }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const API = import.meta.env.VITE_API_URL;

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("");

    try {
      const res = await fetch(`${API}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("Signup failed");
      await res.json();

      // Clear inputs
      const emailValue = form.email; // keep for showing in message
      setForm({ email: "", password: "" });

      // Success message
      setMessage(
        `Mail has been triggered to your entered email (${emailValue}). Please verify by clicking the link sent to your inbox.`
      );

      // Redirect after short delay
      setTimeout(() => {
        onNavigate("home"); // Or navigate("/") if using React Router
      }, 2500);
    } catch (err) {
      setMessage("Error: " + err.message);
    }
  }

  return (
    <div style={{ maxWidth: 400, margin: "40px auto", textAlign: "center" }}>
      <h2>Sign Up</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 10 }}>
          <input
            placeholder="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
            style={{ width: "100%", padding: 8 }}
          />
        </div>
        <div style={{ marginBottom: 10 }}>
          <input
            placeholder="Password"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
            style={{ width: "100%", padding: 8 }}
          />
        </div>
        <button
          type="submit"
          style={{
            padding: "8px 16px",
            backgroundColor: "#007bff",
            color: "#fff",
            border: "none",
            cursor: "pointer",
          }}
        >
          Create account
        </button>
      </form>

      {message && (
        <p style={{ marginTop: 20, color: message.startsWith("Error") ? "red" : "green" }}>
          {message}
        </p>
      )}
    </div>
  );
}
