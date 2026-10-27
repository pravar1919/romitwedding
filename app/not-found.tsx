import Link from "next/link";

export default function NotFound() {
  return (
    <main className="dark" style={{ minHeight: "100vh", display: "grid", placeItems: "center", textAlign: "center", padding: "24px" }}>
      <div>
        <h1 className="shimmer-gold" style={{ fontFamily: "var(--f-script)", fontWeight: 400, fontSize: "clamp(2.6rem,8vw,4.4rem)", margin: 0 }}>
          This page wandered off
        </h1>
        <p style={{ margin: "12px 0 28px", color: "#F3DFC2" }}>The celebrations are this way.</p>
        <Link className="btn" href="/">Back to the invitation</Link>
      </div>
    </main>
  );
}
