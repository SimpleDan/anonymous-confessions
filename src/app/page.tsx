import Link from "next/link";

export default function HomePage() {
  return (
    <main style={{ maxWidth: 800, margin: "0 auto", padding: "2rem" }}>
      <h1>Anonymous Confessions</h1>
      <p>Submit anonymously. Vote on the confessions that stand out most.</p>

      <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
        <Link href="/submit">Submit a confession</Link>
        <Link href="/board">View confession board</Link>
        <Link href="/admin">Admin</Link>
      </div>
    </main>
  );
}
