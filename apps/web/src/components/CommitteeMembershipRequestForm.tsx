"use client";

import { useState } from "react";
import type { FormMessages } from "@os-community/shared";

export function CommitteeMembershipRequestForm({
  committeeSlug,
  labels,
}: {
  committeeSlug: string;
  labels: FormMessages["committeeMembership"];
}) {
  const [desiredRole, setDesiredRole] = useState<"MEMBER" | "REVIEWER">("MEMBER");
  const [message, setMessage] = useState("");
  const [bridgeExpertise, setBridgeExpertise] = useState("");
  const [bridgeRegion, setBridgeRegion] = useState("");
  const [nominatorName, setNominatorName] = useState("");
  const [conflictAccepted, setConflictAccepted] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [errorText, setErrorText] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!conflictAccepted) {
      setErrorText(labels.conflictRequired);
      setStatus("error");
      return;
    }
    setStatus("loading");
    setErrorText("");
    const res = await fetch(`/api/committees/${committeeSlug}/membership-request`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({
        desiredRole,
        message,
        bridgeExpertise,
        bridgeRegion,
        nominatorName,
        conflictAccepted,
      }),
    });
    if (res.ok) {
      const data = (await res.json().catch(() => ({}))) as { autoApproved?: boolean };
      setStatus("done");
      if (data.autoApproved && desiredRole === "MEMBER") {
        window.location.reload();
      }
      return;
    }
    const data = (await res.json().catch(() => null)) as { error?: string } | null;
    setErrorText(data?.error ?? labels.error);
    setStatus("error");
  }

  if (status === "done") {
    return <p style={{ color: "var(--success)", margin: 0 }}>{labels.success}</p>;
  }

  const fieldStyle = {
    display: "block" as const,
    width: "100%",
    marginTop: "0.35rem",
    padding: "0.5rem",
    borderRadius: 6,
    border: "1px solid var(--border)",
    background: "var(--background)",
    color: "var(--foreground)",
  };

  return (
    <form onSubmit={submit} className="lf-card" style={{ marginTop: "1rem" }}>
      <label style={{ display: "block", marginBottom: "0.75rem", fontSize: "0.9rem" }}>
        {labels.roleLabel}
        <select
          value={desiredRole}
          onChange={(e) => setDesiredRole(e.target.value as "MEMBER" | "REVIEWER")}
          style={fieldStyle}
        >
          <option value="MEMBER">{labels.roles.MEMBER}</option>
          <option value="REVIEWER">{labels.roles.REVIEWER}</option>
        </select>
      </label>
      <label style={{ display: "block", marginBottom: "0.75rem", fontSize: "0.9rem" }}>
        {labels.bridgeExpertiseLabel}
        <input
          type="text"
          required
          value={bridgeExpertise}
          onChange={(e) => setBridgeExpertise(e.target.value)}
          placeholder={labels.bridgeExpertisePlaceholder}
          style={fieldStyle}
        />
      </label>
      <label style={{ display: "block", marginBottom: "0.75rem", fontSize: "0.9rem" }}>
        {labels.bridgeRegionLabel}
        <input
          type="text"
          required
          value={bridgeRegion}
          onChange={(e) => setBridgeRegion(e.target.value)}
          placeholder={labels.bridgeRegionPlaceholder}
          style={fieldStyle}
        />
      </label>
      <label style={{ display: "block", marginBottom: "0.75rem", fontSize: "0.9rem" }}>
        {labels.nominatorLabel}
        <input
          type="text"
          required
          value={nominatorName}
          onChange={(e) => setNominatorName(e.target.value)}
          placeholder={labels.nominatorPlaceholder}
          style={fieldStyle}
        />
      </label>
      <label style={{ display: "block", marginBottom: "0.75rem", fontSize: "0.9rem" }}>
        {labels.messageLabel}
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={3}
          placeholder={labels.placeholder}
          style={fieldStyle}
        />
      </label>
      <label style={{ display: "flex", gap: "0.5rem", alignItems: "flex-start", fontSize: "0.9rem" }}>
        <input
          type="checkbox"
          checked={conflictAccepted}
          onChange={(e) => setConflictAccepted(e.target.checked)}
          style={{ marginTop: "0.25rem" }}
        />
        <span>{labels.conflictLabel}</span>
      </label>
      <button
        type="submit"
        className="btn btn-primary btn-sm"
        disabled={status === "loading"}
        style={{ marginTop: "0.75rem" }}
      >
        {status === "loading" ? labels.submitting : labels.submit}
      </button>
      {status === "error" && errorText && (
        <p style={{ color: "var(--danger)", marginTop: "0.75rem", fontSize: "0.9rem" }} role="alert">
          {errorText}
        </p>
      )}
    </form>
  );
}
