import Link from "next/link";

export default function HomePage() {
  return (
    <main className="page">
      <section className="hero">
        <span className="kicker">Juicy Couture Activation</span>
        <h1>Anonymous Confessions</h1>
        <p className="lead">
          Spill the secret. Stay anonymous on the board. Vote for the confessions that deserve the crown.
        </p>

        <div className="nav-links">
          <Link href="/submit" className="button button-primary">Submit a confession</Link>
          <Link href="/board" className="button button-secondary">View confession board</Link>
        </div>
      </section>
    </main>
  );
}
