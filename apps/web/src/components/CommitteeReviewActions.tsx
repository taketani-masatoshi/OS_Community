"use client";

import { useState } from "react";
import type { FormMessages } from "@os-community/shared";

type ReviewKind = "module-role" | "committee-membership";

export function CommitteeReviewActions({
  kind,
  requestId,
  committeeSlug,
  labels,
}: {
  kind: ReviewKind;
  requestId: string;
  committeeSlug?: string;
  labels: FormMessages["admin"];
}) {
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  async function act(action: "approve" | "reject") {
    setError("");
    const url =
      kind === "module-role"
        ? "/api/reviews/module-role-requests"
        : `/api/committees/${committeeSlug}/membership-review`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ requestId, action, note: note.trim() || undefined }),
    });
    if (res.ok) {
      window.location.reload();
      return;
    }
    setError(labels.errorAction);
  }

  return (
    <div>
      <label style={{ display: "block", marginTop: "0.5rem", fontSize: "0.85rem" }}>
        {labels.reviewNoteLabel}
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
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
      <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.75rem" }}>
        <button type="button" className="btn btn-success btn-sm" onClick={() => act("approve")}>
          {labels.approve}
        </button>
        <button type="button" className="btn btn-danger btn-sm" onClick={() => act("reject")}>
          {labels.reject}
        </button>
      </div>
      {error && (
        <p style={{ color: "var(--danger)", marginTop: "0.5rem", fontSize: "0.9rem" }} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
