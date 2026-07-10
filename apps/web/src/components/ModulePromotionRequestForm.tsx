"use client";

import { useState } from "react";
import type { FormMessages } from "@os-community/shared";

export function ModulePromotionRequestForm({
  moduleSlug,
  labels,
}: {
  moduleSlug: string;
  labels: FormMessages["modulePromotion"];
}) {
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    const res = await fetch(`/api/modules/${encodeURIComponent(moduleSlug)}/promotion-request`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ message }),
    });

    let data: { error?: string; code?: string } = {};
    try {
      data = (await res.json()) as { error?: string; code?: string };
    } catch {
      /* ignore */
    }

    if (res.ok) {
      setStatus("done");
      window.location.reload();
      return;
    }

    setStatus("error");
    if (data.code === "PENDING_REQUEST") {
      setErrorMessage(labels.errorPending);
    } else if (data.code === "FORBIDDEN") {
      setErrorMessage(labels.errorForbidden);
    } else {
      setErrorMessage(data.error ?? labels.error);
    }
  }

  return (
    <form onSubmit={submit}>
      <p className="page-muted-note" style={{ marginTop: 0 }}>
        {labels.desc}
      </p>
      <label style={{ display: "block", marginBottom: "0.75rem", fontSize: "0.9rem" }}>
        {labels.messageLabel}
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          placeholder={labels.placeholder}
          style={{
            display: "block",
            width: "100%",
            marginTop: "0.25rem",
            padding: "0.5rem",
            background: "var(--background)",
            border: "1px solid var(--border)",
            borderRadius: 6,
            color: "var(--foreground)",
          }}
        />
      </label>
      <button type="submit" className="btn btn-primary btn-sm" disabled={status === "loading"}>
        {status === "loading" ? labels.submitting : labels.submit}
      </button>
      {status === "error" && (
        <p className="form-error" style={{ marginTop: "0.5rem" }} role="alert">
          {errorMessage}
        </p>
      )}
    </form>
  );
}
