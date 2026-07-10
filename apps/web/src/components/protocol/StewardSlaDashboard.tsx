"use client";

import { useEffect, useState } from "react";

type SlaPayload = {
  ok: boolean;
  policy: { max_hours: number; escalation_hours: number };
  overdue: Array<{ operator_id: string; hours_since_revoke: number; sla_hours: number }>;
  active_operators: number;
  pending_governance: number;
  mirror_available?: boolean;
  source?: string;
};

export function StewardSlaDashboard() {
  const [data, setData] = useState<SlaPayload | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/protocol/sla")
      .then((r) => r.json())
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : "load failed"));
  }, []);

  if (error) return <p className="page-muted-note">SLA load error: {error}</p>;
  if (!data) return <p className="page-muted-note">Loading SLA…</p>;

  return (
    <div className="lf-card-grid">
      <div className="lf-card">
        <span className={`badge ${data.ok ? "badge-success" : "badge-danger"}`}>
          {data.ok ? "SLA OK" : "SLA breach"}
        </span>
        <p style={{ marginTop: "0.75rem" }}>
          Revocation max {data.policy.max_hours}h · escalate {data.policy.escalation_hours}h
        </p>
        <p className="page-muted-note">Source: {data.source ?? "unknown"}</p>
      </div>
      <div className="lf-card">
        <strong>Active operators</strong>
        <p style={{ fontSize: "2rem", margin: "0.5rem 0" }}>{data.active_operators}</p>
      </div>
      <div className="lf-card">
        <strong>Pending governance</strong>
        <p style={{ fontSize: "2rem", margin: "0.5rem 0" }}>{data.pending_governance}</p>
      </div>
      {data.overdue.length > 0 && (
        <div className="lf-card" style={{ gridColumn: "1 / -1" }}>
          <strong>Overdue revocations</strong>
          <ul>
            {data.overdue.map((o) => (
              <li key={o.operator_id}>
                {o.operator_id}: {o.hours_since_revoke.toFixed(1)}h &gt; SLA {o.sla_hours}h
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
