"use client";

import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="page-wrap" style={{ paddingTop: "3rem", paddingBottom: "3rem" }}>
      <h1 className="section-title">Something went wrong</h1>
      <p className="page-desc">
        A server error occurred while loading this page. You can retry or return home.
      </p>
      {error.digest && (
        <p className="page-muted-note">
          Reference: <code>{error.digest}</code>
        </p>
      )}
      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginTop: "1rem" }}>
        <button type="button" className="btn btn-primary btn-sm" onClick={() => reset()}>
          Try again
        </button>
        <Link href="/" className="btn btn-primary btn-sm">
          Home
        </Link>
      </div>
    </div>
  );
}
