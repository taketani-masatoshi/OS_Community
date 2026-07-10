"use client";

import { useState } from "react";

export function GitHubProvisionButton({ label }: { label: string }) {
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    setStatus(null);
    try {
      const res = await fetch("/api/github/provision", { method: "POST" });
      const data = (await res.json()) as {
        granted?: number;
        skipped?: number;
        failed?: number;
        error?: string;
      };
      if (!res.ok) {
        setStatus(data.error ?? "Failed");
        return;
      }
      setStatus(`granted ${data.granted ?? 0}, skipped ${data.skipped ?? 0}, failed ${data.failed ?? 0}`);
    } catch {
      setStatus("Failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button type="button" className="btn btn-primary btn-sm" onClick={handleClick} disabled={loading}>
        {loading ? "…" : label}
      </button>
      {status && (
        <p className="page-muted-note" style={{ marginTop: "0.5rem" }}>
          {status}
        </p>
      )}
    </div>
  );
}
