"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { CommitteeMemberRole } from "@os-community/db";
import { COMMITTEE_MEMBER_ROLES } from "@/lib/admin-committees";

type Labels = {
  committeesAddMember: string;
  committeesAddMemberSearch: string;
  committeesMemberRole: string;
  committeesErrorGeneric: string;
  committeesErrorNotFound: string;
};

export function AdminCommitteeMemberForm({
  committeeSlug,
  roleLabels,
  labels,
}: {
  committeeSlug: string;
  roleLabels: Record<CommitteeMemberRole, string>;
  labels: Labels;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [userId, setUserId] = useState("");
  const [role, setRole] = useState<CommitteeMemberRole>("MEMBER");
  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");
  const [error, setError] = useState("");

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    const res = await fetch(`/api/admin/users/search?q=${encodeURIComponent(query.trim())}`);
    if (!res.ok) {
      setError(labels.committeesErrorGeneric);
      return;
    }
    const body = (await res.json()) as { users: { id: string; label: string }[] };
    if (body.users[0]) {
      setUserId(body.users[0].id);
      setError("");
    } else {
      setError(labels.committeesErrorNotFound);
    }
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!userId) return;
    setStatus("saving");
    setError("");
    const res = await fetch(`/api/admin/committees/${committeeSlug}/members`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, role }),
    });
    if (res.ok) {
      router.refresh();
      setQuery("");
      setUserId("");
      setStatus("idle");
      return;
    }
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    setError(body.error === "LAST_CHAIR" ? labels.committeesErrorGeneric : labels.committeesErrorGeneric);
    setStatus("error");
  }

  return (
    <div className="lf-card" style={{ marginBottom: "1.5rem" }}>
      <h3 style={{ marginTop: 0 }}>{labels.committeesAddMember}</h3>
      <form onSubmit={handleSearch} style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.75rem" }}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={labels.committeesAddMemberSearch}
          className="admin-users-search"
          aria-label={labels.committeesAddMemberSearch}
        />
        <button type="submit" className="btn btn-ghost btn-sm">
          Search
        </button>
      </form>
      <form onSubmit={handleAdd} style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center" }}>
        <input type="hidden" value={userId} readOnly />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as CommitteeMemberRole)}
          aria-label={labels.committeesMemberRole}
        >
          {COMMITTEE_MEMBER_ROLES.map((r) => (
            <option key={r} value={r}>
              {roleLabels[r]}
            </option>
          ))}
        </select>
        <button type="submit" className="btn btn-primary btn-sm" disabled={!userId || status === "saving"}>
          {labels.committeesAddMember}
        </button>
      </form>
      {userId && <p className="page-muted-note" style={{ marginTop: "0.5rem" }}>Selected user id: {userId}</p>}
      {error && <p style={{ color: "var(--danger)", marginTop: "0.5rem" }}>{error}</p>}
    </div>
  );
}
