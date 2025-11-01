import React, { useState } from "react";

export default function Contact() {
  const [msg, setMsg] = useState("");
  const API = import.meta.env.VITE_API_URL;

  async function sendContact(e) {
    e.preventDefault();
    try {
      const res = await fetch(`${API}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg })
      });
      if (!res.ok) throw new Error("Failed");
      alert("Message sent");
      setMsg("");
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <div>
      <h2>Contact</h2>
      <form onSubmit={sendContact}>
        <textarea value={msg} onChange={e=>setMsg(e.target.value)} required />
        <br/>
        <button type="submit">Send</button>
      </form>
    </div>
  );
}
