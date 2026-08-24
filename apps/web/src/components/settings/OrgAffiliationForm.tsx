"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export type OrgAffiliationView = {
  id: string;
  status: "PENDING" | "VERIFIED" | "REJECTED";
  title: string | null;
  claimedAt: string;
  verifiedAt: string | null;
  rejectReason: string | null;
  organization: {
    id: string;
    jurisdiction: string;
    corporateNumber: string;
    corporateNumberDisplay: string;
    legalName: string;
  };
};

type Labels = {
  corporateNumber: string;
  corporateNumberHint: string;
  legalName: string;
  title: string;
  submit: string;
  remove: string;
  removeConfirm: string;
  statusPending: string;
  statusVerified: string;
  statusRejected: string;
  saved: string;
  errorGeneric: string;
  errorInvalidNumber: string;
  empty: string;
};

function statusLabel(status: OrgAffiliationView["status"], labels: Labels) {
  if (status === "VERIFIED") return labels.statusVerified;
  if (status === "REJECTED") return labels.statusRejected;
  return labels.statusPending;
}

export function OrgAffiliationForm({
  initial,
  labels,
}: {
  initial: OrgAffiliationView[];
  labels: Labels;
}) {
  const router = useRouter();
  const [affiliations, setAffiliations] = useState(initial);
  const [corporateNumber, setCorporateNumber] = useState("");
  const [legalName, setLegalName] = useState("");
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [errorCode, setErrorCode] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorCode(null);
    const res = await fetch("/api/user/organization", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ corporateNumber, legalName, title: title || undefined }),
    });
    if (!res.ok) {
      const body = (await res.json().catch(() => null)) as { error?: string; code?: string } | null;
      setErrorCode(body?.code ?? body?.error ?? "GENERIC");
      setStatus("error");
      return;
    }
    const data = (await res.json()) as { affiliation: OrgAffiliationView };
    setAffiliations((prev) => [data.affiliation, ...prev.filter((a) => a.id !== data.affiliation.id)]);
    setCorporateNumber("");
    setLegalName("");
    setTitle("");
    setStatus("done");
    router.refresh();
  }

  async function remove(id: string) {
    if (!window.confirm(labels.removeConfirm)) return;
    setStatus("loading");
    const res = await fetch(`/api/user/organization?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      setStatus("error");
      setErrorCode("GENERIC");
      return;
    }
    setAffiliations((prev) => prev.filter((a) => a.id !== id));
    setStatus("idle");
    router.refresh();
  }

  return (
    <div>
      {affiliations.length === 0 ? (
        <p className="page-muted-note">{labels.empty}</p>
      ) : (
        <ul className="list-muted" style={{ listStyle: "none", paddingLeft: 0, marginBottom: "1.5rem" }}>
          {affiliations.map((a) => (
            <li
              key={a.id}
              className="lf-card"
              style={{ marginBottom: "0.75rem", padding: "1rem" }}
            >
              <p style={{ margin: 0, fontWeight: 600 }}>{a.organization.legalName}</p>
              <p className="page-muted-note" style={{ margin: "0.25rem 0" }}>
                {a.organization.corporateNumberDisplay} · {statusLabel(a.status, labels)}
              </p>
              {a.title && <p className="page-muted-note">{a.title}</p>}
              {a.status === "REJECTED" && a.rejectReason && (
                <p style={{ color: "var(--danger)", margin: "0.35rem 0 0" }}>{a.rejectReason}</p>
              )}
              {a.status !== "VERIFIED" && (
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  style={{ marginTop: "0.5rem" }}
                  onClick={() => remove(a.id)}
                  disabled={status === "loading"}
                >
                  {labels.remove}
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={submit} className="lf-card" style={{ padding: "1.25rem" }}>
        <label style={{ display: "block", marginBottom: "0.75rem" }}>
          {labels.corporateNumber}
          <input
            required
            value={corporateNumber}
            onChange={(e) => setCorporateNumber(e.target.value)}
            inputMode="numeric"
            autoComplete="off"
            placeholder="1234567890123"
            style={{
              display: "block",
              width: "100%",
              marginTop: "0.25rem",
              padding: "0.5rem",
              border: "1px solid var(--border)",
              borderRadius: 8,
              background: "var(--background)",
            }}
          />
          <span className="page-muted-note">{labels.corporateNumberHint}</span>
        </label>
        <label style={{ display: "block", marginBottom: "0.75rem" }}>
          {labels.legalName}
          <input
            required
            value={legalName}
            onChange={(e) => setLegalName(e.target.value)}
            style={{
              display: "block",
              width: "100%",
              marginTop: "0.25rem",
              padding: "0.5rem",
              border: "1px solid var(--border)",
              borderRadius: 8,
              background: "var(--background)",
            }}
          />
        </label>
        <label style={{ display: "block", marginBottom: "0.75rem" }}>
          {labels.title}
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{
              display: "block",
              width: "100%",
              marginTop: "0.25rem",
              padding: "0.5rem",
              border: "1px solid var(--border)",
              borderRadius: 8,
              background: "var(--background)",
            }}
          />
        </label>
        <button type="submit" className="btn btn-primary btn-sm" disabled={status === "loading"}>
          {labels.submit}
        </button>
        {status === "done" && (
          <p style={{ color: "var(--success)", marginTop: "0.5rem" }}>{labels.saved}</p>
        )}
        {status === "error" && (
          <p style={{ color: "var(--danger)", marginTop: "0.5rem" }}>
            {errorCode === "INVALID_CORPORATE_NUMBER"
              ? labels.errorInvalidNumber
              : labels.errorGeneric}
          </p>
        )}
      </form>
    </div>
  );
}
