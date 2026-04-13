"use client";

import { useState } from "react";

type Props = {
  confessionId: string;
};

const OPTIONS = [
  { rating: 1, label: "👀", title: "Tame" },
  { rating: 2, label: "👀👀", title: "Juicy" },
  { rating: 3, label: "👀👀👀", title: "Screenshot-worthy" },
];

export default function ReactionButtons({ confessionId }: Props) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleReact(rating: number) {
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/reaction", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ confessionId, rating })
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Reaction failed");
      } else {
        setMessage("Reaction saved");
        window.location.reload();
      }
    } catch {
      setMessage("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="reaction-block">
      <div className="reaction-buttons">
        {OPTIONS.map((option) => (
          <button
            key={option.rating}
            type="button"
            className="reaction-button"
            disabled={loading}
            onClick={() => handleReact(option.rating)}
            title={option.title}
          >
            {option.label}
          </button>
        ))}
      </div>

      {message && <div className="reaction-message">{message}</div>}
    </div>
  );
}
