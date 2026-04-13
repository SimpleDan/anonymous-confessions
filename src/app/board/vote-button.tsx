"use client";

import { useState } from "react";

export default function VoteButton({ confessionId }: { confessionId: string }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleVote() {
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/vote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ confessionId })
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Vote failed");
      } else {
        setMessage("Vote counted");
        window.location.reload();
      }
    } catch {
      setMessage("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button onClick={handleVote} disabled={loading}>
        {loading ? "Voting..." : "Upvote"}
      </button>
      {message && <div style={{ fontSize: "0.85rem", marginTop: "0.25rem" }}>{message}</div>}
    </div>
  );
}
