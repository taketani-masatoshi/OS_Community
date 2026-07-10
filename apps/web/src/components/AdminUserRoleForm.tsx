"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { SiteRole } from "@os-community/db";
import type { LabelMessages } from "@os-community/shared";
import { ALLOWED_SITE_ROLES } from "@/lib/admin-users-shared";

type ErrorCode = "INVALID_ROLE" | "USER_NOT_FOUND" | "LAST_ADMIN" | "INVALID_JSON" | "GENERIC";

type FormLabels = {
  updateLabel: string;
  savedLabel: string;
  confirmGrantAdmin: string;
  confirmSelfDemote: string;
  errorGeneric: string;
  errorLastAdmin: string;
  errorNotFound: string;
};

export function AdminUserRoleForm({
  actorId,
  userId,
  currentRole,
  roleLabels,
  labels,
}: {
  actorId: string;
  userId: string;
  currentRole: SiteRole;
  roleLabels: LabelMessages["siteRole"];
  labels: FormLabels;
}) {
  const router = useRouter();
  const [role, setRole] = useState(currentRole);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [errorCode, setErrorCode] = useState<ErrorCode | null>(null);

  useEffect(() => {
    setRole(currentRole);
  }, [currentRole]);

  function mapApiError(code: string | undefined): ErrorCode {
    if (code === "LAST_ADMIN") return "LAST_ADMIN";
    if (code === "USER_NOT_FOUND") return "USER_NOT_FOUND";
    if (code === "INVALID_ROLE" || code === "INVALID_JSON") return "GENERIC";
    return "GENERIC";
  }

  function errorMessage(code: ErrorCode | null) {
    if (code === "LAST_ADMIN") return labels.errorLastAdmin;
    if (code === "USER_NOT_FOUND") return labels.errorNotFound;
    return labels.errorGeneric;
  }

  function needsConfirm(nextRole: SiteRole): string | null {
    if (nextRole === "ADMIN" && currentRole !== "ADMIN") {
      return labels.confirmGrantAdmin;
    }
    if (actorId === userId && currentRole === "ADMIN" && nextRole !== "ADMIN") {
      return labels.confirmSelfDemote;
    }
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const confirmMessage = needsConfirm(role);
    if (confirmMessage && !window.confirm(confirmMessage)) {
      return;
    }

    setStatus("saving");
    setErrorCode(null);
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ siteRole: role }),
    });

    if (res.ok) {
      const body = (await res.json()) as { siteRole?: SiteRole; changed?: boolean };
      if (body.changed === false) {
        setStatus("idle");
        return;
      }
      setStatus("saved");
      router.refresh();
      setTimeout(() => setStatus("idle"), 2000);
      return;
    }

    const body = (await res.json().catch(() => ({}))) as { error?: string };
    setErrorCode(mapApiError(body.error));
    setStatus("error");
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
      <select
        value={role}
        onChange={(e) => setRole(e.target.value as SiteRole)}
        className="admin-role-select"
        aria-label={labels.updateLabel}
      >
        {ALLOWED_SITE_ROLES.map((r) => (
          <option key={r} value={r}>
            {roleLabels[r]}
          </option>
        ))}
      </select>
      <button type="submit" className="btn btn-primary btn-sm" disabled={status === "saving"}>
        {labels.updateLabel}
      </button>
      {status === "saved" && <span style={{ fontSize: "0.82rem", color: "var(--success)" }}>{labels.savedLabel}</span>}
      {status === "error" && (
        <span style={{ fontSize: "0.82rem", color: "var(--danger, #c0392b)" }}>{errorMessage(errorCode)}</span>
      )}
    </form>
  );
}
