import { supabase } from "../../lib/supabase";
import VoteButton from "./vote-button";

type Confession = {
  id: string;
  content: string;
  score: number;
  created_at: string;
};

export const dynamic = "force-dynamic";

export default async function BoardPage() {
  const { data, error } = await supabase
    .from("confessions")
    .select("id, content, score, created_at")
    .eq("status", "approved")
    .order("score", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    return <main style={{ padding: "2rem" }}>Error loading confessions.</main>;
  }

  const confessions = (data ?? []) as Confession[];

  return (
    <main style={{ maxWidth: 800, margin: "0 auto", padding: "2rem" }}>
      <h1>Confession Board</h1>

      {confessions.length === 0 ? (
        <p>No confessions yet.</p>
      ) : (
        <div style={{ display: "grid", gap: "1rem" }}>
          {confessions.map((confession) => (
            <article
              key={confession.id}
              style={{ border: "1px solid #ddd", borderRadius: 8, padding: "1rem" }}
            >
              <p style={{ whiteSpace: "pre-wrap" }}>{confession.content}</p>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: "1rem"
                }}
              >
                <small>{new Date(confession.created_at).toLocaleString()}</small>

                <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                  <span>▲ {confession.score}</span>
                  <VoteButton confessionId={confession.id} />
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
