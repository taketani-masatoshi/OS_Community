"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Labels = {
  verify: string;
  reject: string;
  rejectPrompt: string;
  saved: string;
  error: string;
};

export function AdminAffiliationDecideButtons({
  affiliationId,
  labels,
}: {
  affiliationId: string;
  labels: Labels;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");

  async function decide(action: "verify" | "reject") {
    let note: string | undefined;
    if (action === "reject") {
      const entered = window.prompt(labels.rejectPrompt);
      if (entered === null) return;
      note = entered.trim() || undefined;
    }
    setStatus("loading");
    const res = await fetch(`/api/admin/organizations/affiliations/${affiliationId}/decide`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, note }),
    });
    if (!res.ok) {
      setStatus("error");
      return;
    }
    setStatus("idle");
    router.refresh();
  }

  return (
    <span style={{ display: "inline-flex", gap: "0.5rem", flexWrap: "wrap" }}>
      <button
        type="button"
        className="btn btn-primary btn-sm"
        disabled={status === "loading"}
        onClick={() => decide("verify")}
      >
        {labels.verify}
      </button>
      <button
        type="button"
        className="btn btn-ghost btn-sm"
        disabled={status === "loading"}
        onClick={() => decide("reject")}
      >
        {labels.reject}
      </button>
      {status === "error" && (
        <span style={{ color: "var(--danger)", fontSize: "0.85rem" }}>{labels.error}</span>
      )}
    </span>
  );
}
