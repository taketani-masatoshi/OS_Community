"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { CommitteeMemberRole } from "@os-community/db";
import { COMMITTEE_MEMBER_ROLES } from "@/lib/admin-committees";

type Labels = {
  committeesChangeRole: string;
  committeesRemoveMember: string;
  committeesConfirmRemove: string;
  committeesErrorGeneric: string;
  committeesErrorLastChair: string;
};

export function AdminCommitteeMemberActions({
  committeeSlug,
  userId,
  currentRole,
  roleLabels,
  labels,
}: {
  committeeSlug: string;
  userId: string;
  currentRole: CommitteeMemberRole;
  roleLabels: Record<CommitteeMemberRole, string>;
  labels: Labels;
}) {
  const router = useRouter();
  const [role, setRole] = useState(currentRole);
  const [error, setError] = useState("");

  async function updateRole() {
    setError("");
    const res = await fetch(`/api/admin/committees/${committeeSlug}/members/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    if (res.ok) {
      router.refresh();
      return;
    }
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    setError(body.error === "LAST_CHAIR" ? labels.committeesErrorLastChair : labels.committeesErrorGeneric);
  }

  async function removeMember() {
    if (!window.confirm(labels.committeesConfirmRemove)) return;
    setError("");
    const res = await fetch(`/api/admin/committees/${committeeSlug}/members/${userId}`, {
      method: "DELETE",
    });
    if (res.ok) {
      router.refresh();
      return;
    }
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    setError(body.error === "LAST_CHAIR" ? labels.committeesErrorLastChair : labels.committeesErrorGeneric);
  }

  return (
    <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center" }}>
      <select value={role} onChange={(e) => setRole(e.target.value as CommitteeMemberRole)} aria-label={labels.committeesChangeRole}>
        {COMMITTEE_MEMBER_ROLES.map((r) => (
          <option key={r} value={r}>
            {roleLabels[r]}
          </option>
        ))}
      </select>
      <button type="button" className="btn btn-ghost btn-sm" onClick={updateRole}>
        {labels.committeesChangeRole}
      </button>
      <button type="button" className="btn btn-danger btn-sm" onClick={removeMember}>
        {labels.committeesRemoveMember}
      </button>
      {error && <span style={{ color: "var(--danger)", fontSize: "0.82rem" }}>{error}</span>}
    </div>
  );
}
