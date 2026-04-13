import { supabase } from "../../lib/supabase";
import ReactionButtons from "./reaction-buttons";

type Reaction = {
  rating: number;
};

type Confession = {
  id: string;
  content: string;
  created_at: string;
  reactions?: Reaction[];
};

export const dynamic = "force-dynamic";

export default async function BoardPage() {
  const { data, error } = await supabase
    .from("confessions")
    .select("id, content, created_at, reactions(rating)")
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  if (error) {
    return <main className="page">Error loading confessions.</main>;
  }

  const confessions = (data ?? []) as Confession[];

  return (
    <main className="page">
      <section className="hero">
        <span className="kicker">The Receipts</span>
        <h1>Other people’s submissions</h1>
        <p className="lead">
          Tap one, two or three sets of eyes to rate each confession.
        </p>
      </section>

      <section className="section card-grid mt-lg">
        {confessions.length === 0 ? (
          <div className="empty-state">No confessions yet.</div>
        ) : (
          confessions.map((confession) => {
            const reactions = confession.reactions ?? [];
            const oneEye = reactions.filter((r) => r.rating === 1).length;
            const twoEyes = reactions.filter((r) => r.rating === 2).length;
            const threeEyes = reactions.filter((r) => r.rating === 3).length;

            return (
              <article key={confession.id} className="card confession-card">
                <p className="confession-text">{confession.content}</p>

                <div className="receipts-summary mt-md">
                  <span className="receipt-pill">👀 {oneEye}</span>
                  <span className="receipt-pill">👀👀 {twoEyes}</span>
                  <span className="receipt-pill">👀👀👀 {threeEyes}</span>
                </div>

                <div className="confession-meta">
                  <small>{new Date(confession.created_at).toLocaleString()}</small>

                  <ReactionButtons confessionId={confession.id} />
                </div>
              </article>
            );
          })
        )}
      </section>
    </main>
  );
}
