import React, { useState } from "react";

export default function Signin({ onNavigate }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const API = import.meta.env.VITE_API_URL;

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const res = await fetch(`${API}/auth/signin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      if (!res.ok) throw new Error("Invalid email or password");

      const data = await res.json();

      // Store token and trigger UI update
      if (data.token) {
        localStorage.setItem("token", data.token.trim());
        localStorage.setItem("username", data.username ?? form.email);
        window.dispatchEvent(new Event("auth:login"));
      }

      // ✅ No popup here
      onNavigate("home");
    } catch (err) {
      // ❌ Only show popup on error
      alert("Error: " + err.message);
    }
  }

  return (
    <div>
      <h2>Sign In</h2>
      <form onSubmit={handleSubmit} style={{ maxWidth: 360 }}>
        <div>
          <input
            placeholder="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
        </div>
        <div>
          <input
            placeholder="Password"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
        </div>
        <button type="submit">Sign In</button>
      </form>
    </div>
  );
}
