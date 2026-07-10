"use client";

import { useState } from "react";
import type { FormMessages } from "@os-community/shared";

function resolveErrorMessage(
  status: number,
  apiError: string | undefined,
  code: string | undefined,
  labels: FormMessages["moduleRole"]
): string {
  if (code === "PENDING_EXISTS") return labels.errorPending;
  if (code === "PROFILE_INCOMPLETE") return labels.errorProfileIncomplete;
  if (code === "UNAUTHORIZED") return labels.errorUnauthorized;
  if (apiError) return apiError;
  if (status === 401) return labels.errorUnauthorized;
  if (status === 403) return labels.errorProfileIncomplete;
  if (status === 409) return labels.errorPending;
  return labels.error;
}

export function ModuleRoleRequestForm({
  moduleId,
  moduleSlug,
  labels,
  hideMaintainer = false,
}: {
  moduleId: string;
  moduleSlug: string;
  labels: FormMessages["moduleRole"];
  hideMaintainer?: boolean;
}) {
  const [role, setRole] = useState("CONTRIBUTOR");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    try {
      const res = await fetch("/api/module-roles/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ moduleId, role, message }),
      });

      let data: { error?: string; code?: string } = {};
      try {
        data = (await res.json()) as { error?: string; code?: string };
      } catch {
        if (!res.ok) {
          setStatus("error");
          setErrorMessage(resolveErrorMessage(res.status, undefined, undefined, labels));
          return;
        }
      }

      if (res.ok) {
        let data: { autoApproved?: boolean } = {};
        try {
          data = (await res.json()) as { autoApproved?: boolean };
        } catch {
          /* empty body ok */
        }
        setStatus("done");
        if (data.autoApproved && role === "CONTRIBUTOR") {
          window.location.href = `/modules/${moduleSlug}?joined=1`;
          return;
        }
        window.location.href = `/mypage`;
        return;
      }

      setStatus("error");
      setErrorMessage(resolveErrorMessage(res.status, data.error, data.code, labels));
    } catch {
      setStatus("error");
      setErrorMessage(labels.error);
    }
  }

  return (
    <form onSubmit={submit}>
      <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem" }}>
        {labels.roleLabel}
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
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
        >
          <option value="CONTRIBUTOR">{labels.roles.CONTRIBUTOR}</option>
          <option value="DEPUTY">{labels.roles.DEPUTY}</option>
          {!hideMaintainer && <option value="MAINTAINER">{labels.roles.MAINTAINER}</option>}
        </select>
      </label>
      <label style={{ display: "block", marginBottom: "0.75rem", fontSize: "0.9rem" }}>
        {labels.messageLabel}
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={3}
          placeholder={`${moduleSlug}${labels.placeholder}`}
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
      <button type="submit" className="btn btn-primary" disabled={status === "loading"}>
        {status === "loading" ? labels.submitting : labels.submit}
      </button>
      {status === "done" && <p style={{ color: "var(--success)", marginTop: "0.5rem" }}>{labels.success}</p>}
      {status === "error" && (
        <p style={{ color: "var(--danger)", marginTop: "0.5rem" }} role="alert">
          {errorMessage}
        </p>
      )}
    </form>
  );
}
