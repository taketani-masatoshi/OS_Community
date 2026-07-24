"use client";

import { useState } from "react";
import Link from "next/link";

export function AgentJoinMemberButton({
  agentId,
  isMember,
  isSignedIn,
  labels,
}: {
  agentId: string;
  isMember: boolean;
  isSignedIn: boolean;
  labels: {
    join: string;
    joined: string;
    signIn: string;
    submitting: string;
    error: string;
  };
}) {
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">(isMember ? "done" : "idle");
  const [errorMessage, setErrorMessage] = useState("");

  if (!isSignedIn) {
    return (
      <Link
        href={`/login?callbackUrl=${encodeURIComponent(`/agents/${agentId}`)}`}
        className="btn btn-ghost btn-sm"
      >
        {labels.signIn}
      </Link>
    );
  }

  if (status === "done") {
    return <span className="badge badge-success">{labels.joined}</span>;
  }

  async function join() {
    setStatus("loading");
    setErrorMessage("");
    try {
      const res = await fetch(`/api/agents/${agentId}/join`, {
        method: "POST",
        credentials: "same-origin",
      });
      if (res.ok) {
        setStatus("done");
        return;
      }
      const data = (await res.json().catch(() => null)) as { error?: string } | null;
      setErrorMessage(data?.error ?? labels.error);
      setStatus("error");
    } catch {
      setErrorMessage(labels.error);
      setStatus("error");
    }
  }

  return (
    <div style={{ display: "inline-flex", flexDirection: "column", gap: "0.35rem" }}>
      <button type="button" className="btn btn-ghost btn-sm" disabled={status === "loading"} onClick={join}>
        {status === "loading" ? labels.submitting : labels.join}
      </button>
      {status === "error" && (
        <span style={{ color: "var(--danger)", fontSize: "0.85rem" }} role="alert">
          {errorMessage}
        </span>
      )}
    </div>
  );
}
