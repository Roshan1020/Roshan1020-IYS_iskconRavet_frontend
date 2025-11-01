import React, { useEffect, useState } from "react";
import { API_BASE } from "../config/api";

export default function YatraRegistration() {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");

  // Payment related state
  const [selectedPayment, setSelectedPayment] = useState("");
  const [paymentId, setPaymentId] = useState("");
  const [screenshotFile, setScreenshotFile] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // UI messages
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [registrationData, setRegistrationData] = useState(null);

  const BASE = import.meta.env.VITE_API_URL;

  // Hard-coded notes as requested
  const NOTES = "Limited seats available!";

  useEffect(() => {
    setLoading(true);
    setFetchError("");
    fetch(`${BASE}/iys/eventRegDetails`)
      .then(async (res) => {
        if (!res.ok) {
          const txt = await res.text().catch(() => null);
          throw new Error(txt || `Server responded ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        // setDetails to whatever server returns (may be null/empty object)
        setDetails(data || null);
      })
      .catch((err) => {
        console.error("fetch error:", err);
        setFetchError("Unable to load yatra details from server.");
        setDetails(null);
      })
      .finally(() => setLoading(false));
  }, []);

  // Helper to format a date string (show only date). If invalid, return original string or 'Not available'
  function formatDateOnly(raw) {
    if (!raw) return "Not available";
    // if already a readable string (e.g. "2025-12-07" or ISO), try parse
    const d = new Date(raw);
    if (!isNaN(d.getTime())) {
      // show in local date format (India)
      return d.toLocaleDateString("en-IN");
    }
    // fallback: try extract date-like substring
    const maybeDate = raw.split("T")[0];
    return maybeDate || raw;
  }

  // Determine whether fees data is present and valid (no defaults here)
  const fees = details && details.fees ? details.fees : null;
  const feeInstallments = fees && Array.isArray(fees.installments) ? fees.installments : [];
  const feeFullAmount = fees && (fees.fullAmount || fees.fullAmount === 0) ? fees.fullAmount : null;
  const currencySymbol = (fees && fees.currencySymbol) || "";

  // Determine UPI and QR presence
  const upiId = details && details.upiId ? details.upiId : null;
  const qrUrl = details && details.qrUrl ? details.qrUrl : null;

  // If server returned no details at all
  const hasDetails = details && Object.keys(details).length > 0;

  const PlaceholderQR = () => (
    <div
      style={{
        width: 220,
        height: 220,
        background: "#f2f2f2",
        borderRadius: 8,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontSize: 14,
        color: "#777",
        border: "1px dashed #aaa",
      }}
    >
      QR Not Available
    </div>
  );

  function handleScreenshotChange(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) {
      setScreenshotFile(null);
      setScreenshotPreview(null);
      return;
    }
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file for screenshot.");
      return;
    }
    setScreenshotFile(file);
    setScreenshotPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    // If payments not properly configured on server, block submit
    if (!fees || (feeInstallments.length === 0 && feeFullAmount === null)) {
      setErrorMessage("Payment options not available. Please contact organizer.");
      return;
    }

    if (!selectedPayment || Number.isNaN(Number(selectedPayment)) || Number(selectedPayment) <= 0) {
      setErrorMessage("Please select a valid amount before submitting.");
      return;
    }
    if (!paymentId.trim()) {
      setErrorMessage("Please enter the payment transaction ID / UPI reference.");
      return;
    }

    if (!upiId) {
      setErrorMessage("UPI ID not available. Cannot process payment.");
      return;
    }

    setSubmitting(true);

    try {
      const form = new FormData();
      form.append("amount", selectedPayment);
      form.append("paymentId", paymentId.trim());
      if (screenshotFile) form.append("screenshot", screenshotFile);
      form.append("yatraId", details.id || "");

      // --- JWT / Auth handling ---
      // 1) Try to get token from localStorage (change the key if you store it differently)
      const token = localStorage.getItem("token");

      // Build fetch options
      const fetchOptions = {
        method: "POST",
        body: form,
        // Do NOT set Content-Type header when sending FormData
      };

      if (token) {
        // If token is available in localStorage, send Authorization header
        fetchOptions.headers = {
          Authorization: `Bearer ${token}`,
        };
        // If your backend uses cookies in addition to token, you can still include credentials:
        // fetchOptions.credentials = 'include';
      } else {
        // No token in localStorage — attempt to send cookies (HttpOnly) if backend uses them.
        // This requires server CORS to allow credentials and the origin explicitly.
        fetchOptions.credentials = "include";
      }

      const resp = await fetch(`${BASE}/iys/registration`, fetchOptions);

      const text = await resp.text();
      let result = null;
      try {
        result = text ? JSON.parse(text) : {};
      } catch (err) {
        result = { message: text || (resp.ok ? "Registration submitted." : "Server error") };
      }

      if (!resp.ok) {
        setErrorMessage(result.message || `Server error (${resp.status})`);
        return;
      }

      setSuccessMessage(result.message || "Registration submitted successfully!");
      setRegistrationData(result.data || null);

      // reset input fields
      setSelectedPayment("");
      setPaymentId("");
      setScreenshotFile(null);
      setScreenshotPreview(null);
    } catch (err) {
      console.error(err);
      setErrorMessage("Error submitting registration: " + err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <p>Loading Yatra details...</p>;

  // If fetch failed or no details returned, show friendly message and do not render form inputs that depend on server
  if (!hasDetails) {
    return (
      <div style={{ maxWidth: "800px", margin: "40px auto", padding: "30px", borderRadius: "12px", background: "#fff7f6", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
        <h2 style={{ textAlign: "center", color: "#8B0000" }}>Yatra details unavailable</h2>
        <p style={{ textAlign: "center", color: "#444" }}>
          {fetchError || "Server did not return any yatra details. Please try again later or contact the organizer."}
        </p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "800px", margin: "40px auto", padding: "30px", borderRadius: "12px", background: "#fdfaf7", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
      <h1 style={{ textAlign: "center", color: "#8B0000", marginBottom: "10px" }}>
        {details.title || "Yatra Registration"}
      </h1>

      <p style={{ textAlign: "center", color: "#444", marginBottom: "25px" }}>
        {details.description || ""}
      </p>

      <div style={{ background: "#fff", padding: "20px", borderRadius: "10px", marginBottom: "25px", border: "1px solid #eee" }}>
        <h3>Yatra Details</h3>
        <ul>
          <li>
            <b>Departure:</b>{" "}
            {details.departure
              ? formatDateOnly(details.departure)
              : "Not available"}
          </li>

          <li>
            <b>Duration:</b>{" "}
            {details.duration
              ? formatDateOnly(details.duration)
              : "Not available"}
          </li>

          <li>
            <b>Notes:</b> {NOTES}
          </li>

          <li>
            <b>Yatra Fee:</b>{" "}
            {fees ? (
              feeFullAmount !== null ? (
                `${currencySymbol}${feeFullAmount}`
              ) : feeInstallments.length > 0 ? (
                feeInstallments.map((f, i) => (
                  <span key={i}>
                    {currencySymbol}{f}{i < feeInstallments.length - 1 ? " / " : ""}
                  </span>
                ))
              ) : (
                <span>Not available</span>
              )
            ) : (
              <span>Not available</span>
            )}
          </li>
        </ul>
      </div>

      <div style={{ display: "flex", justifyContent: "space-around", alignItems: "center", marginBottom: "25px", flexWrap: "wrap", gap: "20px" }}>
        <div>
          {qrUrl ? (
            <img src={qrUrl} alt="Yatra Payment QR" style={{ width: 220, height: 220, objectFit: "cover", borderRadius: 8, border: "1px solid #ddd" }} />
          ) : (
            <PlaceholderQR />
          )}
        </div>

        <div>
          <h3>UPI Payment</h3>
          <p>
            Scan the QR or send payment to:
            <br />
            <b style={{ color: "#006400", fontSize: "18px" }}>
              {upiId || "Not available"}
            </b>
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Success message */}
        {successMessage && (
          <div style={{ background: "#d4edda", color: "#155724", padding: "12px 16px", borderRadius: "8px", marginBottom: "20px", border: "1px solid #c3e6cb", textAlign: "center", fontWeight: "500" }}>
            ✅ {successMessage}
            {registrationData && (
              <div style={{ marginTop: 8, fontSize: 14, color: '#0b4d1a' }}>
                <div><strong>Amount:</strong> {registrationData.amount}</div>
                <div><strong>Payment ID:</strong> {registrationData.paymentId}</div>
                <div><strong>Screenshot Uploaded:</strong> {registrationData.screenshotUploaded ? 'Yes' : 'No'}</div>
                {registrationData.registrationId && <div><strong>Registration ID:</strong> {registrationData.registrationId}</div>}
              </div>
            )}
          </div>
        )}

        {/* Error message */}
        {errorMessage && (
          <div style={{ background: '#f8d7da', color: '#721c24', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #f5c6cb', textAlign: 'center' }}>
            ❌ {errorMessage}
          </div>
        )}

        <div style={{ marginBottom: "20px" }}>
          <h3>Choose Installment Amount</h3>
          <div>
            {fees && feeInstallments.length > 0 ? (
              feeInstallments.map((amt) => (
                <label key={amt} style={{ display: "block", margin: "8px 0" }}>
                  <input
                    type="radio"
                    name="installment"
                    value={amt}
                    checked={String(selectedPayment) === String(amt)}
                    onChange={() => setSelectedPayment(String(amt))}
                    disabled={Boolean(successMessage)}
                  />{" "}
                  {currencySymbol}{amt}
                </label>
              ))
            ) : feeFullAmount !== null ? (
              <label style={{ display: "block", margin: "8px 0" }}>
                <input
                  type="radio"
                  name="installment"
                  value={feeFullAmount}
                  checked={String(selectedPayment) === String(feeFullAmount)}
                  onChange={() => setSelectedPayment(String(feeFullAmount))}
                  disabled={Boolean(successMessage)}
                />{" "}
                {currencySymbol}{feeFullAmount}
              </label>
            ) : (
              <div style={{ color: "#777" }}>Payment options not provided by server.</div>
            )}
          </div>
        </div>

        <div style={{ marginBottom: "16px" }}>
          <label>
            Payment Transaction ID / UPI Ref:
            <br />
            <input
              type="text"
              value={paymentId}
              onChange={(e) => setPaymentId(e.target.value)}
              placeholder="e.g. T1234567890 or UPI Ref"
              style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }}
              disabled={Boolean(successMessage) || !fees || (!upiId)}
            />
          </label>
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label>
            Upload Payment Screenshot:
            <br />
            <input type="file" accept="image/*" onChange={handleScreenshotChange} disabled={Boolean(successMessage) || !fees || (!upiId)} />
          </label>

          {screenshotPreview && (
            <div style={{ marginTop: '10px' }}>
              <strong>Preview:</strong>
              <br />
              <img src={screenshotPreview} alt="screenshot preview" style={{ width: 200, borderRadius: 8, border: '1px solid #ddd' }} />
            </div>
          )}
        </div>

        <div style={{ textAlign: 'center' }}>
          <button
            type="submit"
            disabled={
              submitting ||
              Boolean(successMessage) ||
              !fees ||
              (feeInstallments.length === 0 && feeFullAmount === null) ||
              !upiId
            }
            style={{
              background: '#8B0000',
              color: 'white',
              border: 'none',
              padding: '12px 24px',
              borderRadius: '8px',
              cursor: (submitting || successMessage || !fees || !upiId) ? 'not-allowed' : 'pointer',
              fontSize: '16px'
            }}
          >
            {submitting ? 'Submitting...' : successMessage ? 'Submitted' : 'Submit Registration'}
          </button>
        </div>
      </form>
    </div>
  );
}
