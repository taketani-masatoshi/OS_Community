"use client";

import { useState } from "react";

export function BootstrapFounderButton({
  label,
  doneLabel,
  description,
  errorLabel,
  modulesLabel,
}: {
  label: string;
  doneLabel: string;
  description: string;
  errorLabel: string;
  modulesLabel: string;
}) {
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleClick() {
    setStatus("loading");
    const res = await fetch("/api/admin/bootstrap-founder", { method: "POST" });
    const data = (await res.json()) as { profileUrl?: string; error?: string; moduleCount?: number };
    if (res.ok) {
      setStatus("done");
      setMessage(`${doneLabel}: ${data.profileUrl ?? ""} (${data.moduleCount ?? 0} ${modulesLabel})`);
    } else {
      setStatus("error");
      setMessage(data.error ?? errorLabel);
    }
  }

  return (
    <div className="membership-policy-callout" style={{ marginBottom: "1.5rem" }}>
      <p style={{ margin: "0 0 0.75rem", color: "var(--muted)" }}>{description}</p>
      <button
        type="button"
        className="btn btn-primary btn-sm"
        onClick={handleClick}
        disabled={status === "loading"}
      >
        {label}
      </button>
      {status === "done" && (
        <p style={{ marginTop: "0.75rem", fontSize: "0.85rem", color: "var(--success)" }}>{message}</p>
      )}
      {status === "error" && (
        <p style={{ marginTop: "0.75rem", fontSize: "0.85rem", color: "var(--danger, #c0392b)" }}>{message}</p>
      )}
    </div>
  );
}
