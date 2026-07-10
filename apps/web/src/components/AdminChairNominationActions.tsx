"use client";

import { useState } from "react";
import type { FormMessages } from "@os-community/shared";

export function AdminChairNominationActions({
  committeeSlug,
  nominationId,
  labels,
}: {
  committeeSlug: string;
  nominationId: string;
  labels: FormMessages["admin"];
}) {
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  async function act(decision: "APPROVED" | "REJECTED") {
    setError("");
    const res = await fetch(`/api/committees/${committeeSlug}/chair-nominations`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ nominationId, decision, reviewNote: note.trim() || undefined }),
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
        <button type="button" className="btn btn-success btn-sm" onClick={() => act("APPROVED")}>
          {labels.approve}
        </button>
        <button type="button" className="btn btn-danger btn-sm" onClick={() => act("REJECTED")}>
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
