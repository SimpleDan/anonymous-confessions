"use client";

import { useState } from "react";

export default function SubmitPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/confessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name,
          email,
          content
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Submission failed");
      } else {
        setMessage(data.message || "Submitted");
        setName("");
        setEmail("");
        setContent("");
      }
    } catch {
      setMessage("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ maxWidth: 800, margin: "0 auto", padding: "2rem" }}>
      <h1>Submit a confession</h1>
      <p>
        Your name and email will not be shown publicly. They are only collected so a winner can be contacted.
      </p>
      <p>Do not include names, contact details, or identifying information inside the confession itself.</p>

      <form onSubmit={handleSubmit} style={{ display: "grid", gap: "1rem", marginTop: "1rem" }}>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          maxLength={100}
          required
        />

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your email address"
          maxLength={255}
          required
        />

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={8}
          maxLength={400}
          placeholder="Write your anonymous confession..."
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Submitting..." : "Submit"}
        </button>

        {message && <p>{message}</p>}
      </form>
    </main>
  );
}
