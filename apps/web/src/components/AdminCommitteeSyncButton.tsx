"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function AdminCommitteeSyncButton({
  label,
  doneLabel,
  errorLabel,
}: {
  label: string;
  doneLabel: string;
  errorLabel: string;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function handleSync() {
    setStatus("loading");
    const res = await fetch("/api/admin/committees/sync", { method: "POST" });
    if (res.ok) {
      setStatus("done");
      router.refresh();
      setTimeout(() => setStatus("idle"), 2500);
      return;
    }
    setStatus("error");
  }

  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
      <button
        type="button"
        className="btn btn-ghost btn-sm"
        onClick={handleSync}
        disabled={status === "loading"}
      >
        {label}
      </button>
      {status === "done" && <span style={{ fontSize: "0.82rem", color: "var(--success)" }}>{doneLabel}</span>}
      {status === "error" && (
        <span style={{ fontSize: "0.82rem", color: "var(--danger, #c0392b)" }}>{errorLabel}</span>
      )}
    </div>
  );
}
