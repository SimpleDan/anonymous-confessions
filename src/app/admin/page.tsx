"use client";

import { useEffect, useState } from "react";

type Confession = {
  id: string;
  name: string | null;
  email: string | null;
  content: string;
  created_at: string;
  flag_reason: string | null;
};

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [items, setItems] = useState<Confession[]>([]);
  const [message, setMessage] = useState("");

  async function loadPending(adminPassword: string) {
    const res = await fetch("/api/admin/pending", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ password: adminPassword })
    });

    const data = await res.json();

    if (!res.ok) {
      setMessage(data.error || "Failed");
      return;
    }

    setAuthenticated(true);
    setItems(data.items);
    localStorage.setItem("admin_password", adminPassword);
  }

  useEffect(() => {
    const saved = localStorage.getItem("admin_password");
    if (saved) {
      setPassword(saved);
      loadPending(saved);
    }
  }, []);

  async function updateStatus(id: string, status: "approved" | "rejected") {
    const res = await fetch("/api/admin/update", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ password, id, status })
    });

    const data = await res.json();

    if (!res.ok) {
      setMessage(data.error || "Failed to update");
      return;
    }

    setItems((prev) => prev.filter((item) => item.id !== id));
  }

  if (!authenticated) {
    return (
      <main style={{ maxWidth: 700, margin: "0 auto", padding: "2rem" }}>
        <h1>Admin</h1>
        <input
          type="password"
          placeholder="Admin password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button onClick={() => loadPending(password)} style={{ marginLeft: "0.5rem" }}>
          Enter
        </button>
        {message && <p>{message}</p>}
      </main>
    );
  }

  return (
    <main style={{ maxWidth: 800, margin: "0 auto", padding: "2rem" }}>
      <h1>Pending Confessions</h1>

      {items.length === 0 ? (
        <p>No pending items.</p>
      ) : (
        <div style={{ display: "grid", gap: "1rem", marginTop: "1rem" }}>
          {items.map((item) => (
            <article
              key={item.id}
              style={{ border: "1px solid #ddd", borderRadius: 8, padding: "1rem" }}
            >
              <p><strong>Name:</strong> {item.name || "-"}</p>
              <p><strong>Email:</strong> {item.email || "-"}</p>
              <p style={{ whiteSpace: "pre-wrap" }}>{item.content}</p>
              <small>{new Date(item.created_at).toLocaleString()}</small>
              {item.flag_reason && <p>Flag: {item.flag_reason}</p>}

              <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
                <button onClick={() => updateStatus(item.id, "approved")}>Approve</button>
                <button onClick={() => updateStatus(item.id, "rejected")}>Reject</button>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
