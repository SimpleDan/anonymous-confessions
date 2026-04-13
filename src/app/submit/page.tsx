"use client";

import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string;
          callback?: (token: string) => void;
        }
      ) => void;
    };
  }
}

export default function SubmitPage() {
  const [content, setContent] = useState("");
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const widgetRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (window.turnstile && widgetRef.current) {
        window.turnstile.render(widgetRef.current, {
          sitekey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!,
          callback: (receivedToken: string) => {
            setToken(receivedToken);
          },
        });
      }
    };
    document.body.appendChild(script);
  }, []);

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
          content,
          turnstileToken: token
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Submission failed");
      } else {
        setMessage(data.message || "Submitted");
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
      <p>Do not include names, contact details, or identifying information.</p>

      <form onSubmit={handleSubmit} style={{ display: "grid", gap: "1rem", marginTop: "1rem" }}>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={8}
          maxLength={400}
          placeholder="Write your anonymous confession..."
        />

        <div ref={widgetRef} />

        <button type="submit" disabled={loading}>
          {loading ? "Submitting..." : "Submit"}
        </button>

        {message && <p>{message}</p>}
      </form>
    </main>
  );
}
