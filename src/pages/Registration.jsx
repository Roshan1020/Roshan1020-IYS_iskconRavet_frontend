import React, { useState } from "react";

export default function Registration() {
  const [details, setDetails] = useState({
    name: "",
    dob: "",
    gender: "",
    center: "",
    maritalStatus: "",
    harinamInitiated: "",
    aadhaarNumber: "",
    mentorName: "",
    address: "",
    mobile: "",
    photo: null,
  });

  const API = import.meta.env.VITE_API_URL;

  async function handleRegister(e) {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");

      const formData = new FormData();
      for (const key in details) {
        if (key === "photo") continue;
        formData.append(key, details[key]);
      }
      if (details.photo) {
        formData.append("photo", details.photo);
      }

      const res = await fetch(`${API}/auth/userRegister`, {
        method: "POST",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      });

      if (!res.ok) throw new Error("Registration failed");
      alert("Registration successful!");
    } catch (err) {
      alert("Error: " + err.message);
    }
  }

  return (
    <div style={{ maxWidth: 500, margin: "auto" }}>
      <h2>Registration Form</h2>
      <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <input
          placeholder="Full Name"
          value={details.name}
          onChange={(e) => setDetails({ ...details, name: e.target.value })}
          required
        />

        <label>Date of Birth</label>
        <input
          type="date"
          value={details.dob}
          onChange={(e) => setDetails({ ...details, dob: e.target.value })}
          required
        />

        <select
          value={details.gender}
          onChange={(e) => setDetails({ ...details, gender: e.target.value })}
          required
        >
          <option value="">Select Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
        </select>

        <input
          placeholder="Center / Bace"
          value={details.center}
          onChange={(e) => setDetails({ ...details, center: e.target.value })}
          required
        />

        <select
          value={details.maritalStatus}
          onChange={(e) => setDetails({ ...details, maritalStatus: e.target.value })}
          required
        >
          <option value="">Marital Status</option>
          <option value="Single">Single</option>
          <option value="Married">Married</option>
        </select>

        <select
          value={details.harinamInitiated}
          onChange={(e) => setDetails({ ...details, harinamInitiated: e.target.value })}
          required
        >
          <option value="">Harinam Initiated?</option>
          <option value="Yes">Yes</option>
          <option value="No">No</option>
        </select>

        <input
          placeholder="Aadhaar Number"
          value={details.aadhaarNumber}
          onChange={(e) => setDetails({ ...details, aadhaarNumber: e.target.value })}
          required
        />

        <input
          placeholder="Mentor / Counselor Name"
          value={details.mentorName}
          onChange={(e) => setDetails({ ...details, mentorName: e.target.value })}
          required
        />

        <input
          placeholder="Mobile Number"
          value={details.mobile}
          onChange={(e) => setDetails({ ...details, mobile: e.target.value })}
          required
        />

        <textarea
          placeholder="Address"
          value={details.address}
          onChange={(e) => setDetails({ ...details, address: e.target.value })}
          required
        />

        <label>Upload Photo</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setDetails({ ...details, photo: e.target.files[0] })}
        />

        <button type="submit">Register</button>
      </form>
    </div>
  );
}
