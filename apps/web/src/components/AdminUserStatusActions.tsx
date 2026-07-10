"use client";

import { useState } from "react";

type StatusLabels = {
  suspend: string;
  restore: string;
  delete: string;
  confirmSuspend: string;
  confirmDelete: string;
  errorGeneric: string;
  errorLastAdmin: string;
  errorSelfAction: string;
  saved: string;
};

export function AdminUserStatusActions({
  userId,
  actorId,
  accountStatus,
  labels,
}: {
  userId: string;
  actorId: string;
  accountStatus: "ACTIVE" | "SUSPENDED";
  labels: StatusLabels;
}) {
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const isSelf = userId === actorId;

  async function act(action: "SUSPEND" | "RESTORE" | "DELETE") {
    setError("");
    setMessage("");

    if (isSelf && (action === "SUSPEND" || action === "DELETE")) {
      setError(labels.errorSelfAction);
      return;
    }
    if (action === "SUSPEND" && !window.confirm(labels.confirmSuspend)) return;
    if (action === "DELETE" && !window.confirm(labels.confirmDelete)) return;

    const res =
      action === "DELETE"
        ? await fetch(`/api/admin/users/${userId}`, {
            method: "DELETE",
            credentials: "same-origin",
          })
        : await fetch(`/api/admin/users/${userId}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "same-origin",
            body: JSON.stringify({ action }),
          });

    let data: { error?: string } = {};
    try {
      data = (await res.json()) as { error?: string };
    } catch {
      /* non-json */
    }

    if (res.ok) {
      setMessage(labels.saved);
      window.location.reload();
      return;
    }

    const code = data.error;
    if (code === "LAST_ADMIN") setError(labels.errorLastAdmin);
    else if (code === "CANNOT_SELF_SUSPEND" || code === "CANNOT_SELF_DELETE") setError(labels.errorSelfAction);
    else setError(labels.errorGeneric);
  }

  return (
    <div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
        {accountStatus === "ACTIVE" ? (
          <button type="button" className="btn btn-primary btn-sm" onClick={() => act("SUSPEND")} disabled={isSelf}>
            {labels.suspend}
          </button>
        ) : (
          <button type="button" className="btn btn-primary btn-sm" onClick={() => act("RESTORE")}>
            {labels.restore}
          </button>
        )}
        <button type="button" className="btn btn-danger btn-sm" onClick={() => act("DELETE")} disabled={isSelf}>
          {labels.delete}
        </button>
      </div>
      {message && (
        <p style={{ color: "var(--success)", marginTop: "0.5rem", fontSize: "0.85rem" }}>{message}</p>
      )}
      {error && (
        <p style={{ color: "var(--danger)", marginTop: "0.5rem", fontSize: "0.85rem" }} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
