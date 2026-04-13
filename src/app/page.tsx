"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

const SUCCESS_MESSAGES = [
  "Ooooh… juicy 🍒",
  "Your secret is safe… for now 👀",
  "Your secret is safe… pinky promise 💖"
];

export default function SubmitPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const randomMessage = useMemo(() => {
    return SUCCESS_MESSAGES[Math.floor(Math.random() * SUCCESS_MESSAGES.length)];
  }, [submitted]);

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
        setSubmitted(false);
        setMessage(data.error || "Submission failed");
      } else {
        setSubmitted(true);
        setMessage(randomMessage);
        setName("");
        setEmail("");
        setContent("");
      }
    } catch {
      setSubmitted(false);
      setMessage("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page">
      <section className="card form-shell">
        <span className="kicker">Confess anonymously</span>
        <h1>Submit a confession</h1>
        <p className="notice">
          Your name and email stay private and are only collected so a winner can be contacted.
        </p>
        <p className="copy mt-sm">
          Do not include names, contact details, or identifying information inside the confession itself.
        </p>

        <form onSubmit={handleSubmit} className="form-stack">
          <div className="field-group">
            <label className="field-label">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              maxLength={100}
              required
            />
          </div>

          <div className="field-group">
            <label className="field-label">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email address"
              maxLength={255}
              required
            />
          </div>

          <div className="field-group">
            <label className="field-label">Confession</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={8}
              maxLength={400}
              placeholder="Write your anonymous confession..."
              required
            />
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "Submitting..." : "Submit"}
          </button>

          {message && <p className="status-message">{message}</p>}

          {submitted && (
            <div className="inline-actions mt-sm">
              <Link href="/board" className="button button-secondary">
                See similar confessions
              </Link>
            </div>
          )}
        </form>
      </section>
    </main>
  );
}
