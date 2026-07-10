"use client";

import { useMemo, useState } from "react";
import type { WireTrustNode } from "@/lib/steward-protocol";

export function WireJurisdictionRegistry({
  nodes,
  labels,
}: {
  nodes: WireTrustNode[];
  labels: {
    filterAll: string;
    nodeId: string;
    displayName: string;
    jurisdiction: string;
    wireUrl: string;
    resultCount: string;
  };
}) {
  const jurisdictions = useMemo(() => {
    const codes = new Set<string>();
    for (const node of nodes) {
      if (node.witness_jurisdiction) codes.add(node.witness_jurisdiction);
    }
    return [...codes].sort();
  }, [nodes]);

  const [activeCode, setActiveCode] = useState<string>("all");

  const visible = useMemo(() => {
    if (activeCode === "all") return nodes;
    return nodes.filter((n) => n.witness_jurisdiction === activeCode);
  }, [activeCode, nodes]);

  return (
    <div className="domain-governance-browser">
      <div className="domain-governance-toolbar">
        <div className="modules-registry-filters domain-governance-filters" role="tablist" aria-label={labels.filterAll}>
          <button
            type="button"
            role="tab"
            aria-selected={activeCode === "all"}
            className={`modules-registry-filter${activeCode === "all" ? " active" : ""}`}
            onClick={() => setActiveCode("all")}
          >
            {labels.filterAll}
          </button>
          {jurisdictions.map((code) => (
            <button
              key={code}
              type="button"
              role="tab"
              aria-selected={activeCode === code}
              className={`modules-registry-filter${activeCode === code ? " active" : ""}`}
              onClick={() => setActiveCode(code)}
            >
              {code}
            </button>
          ))}
        </div>
        <p className="modules-registry-count page-muted-note">
          {labels.resultCount.replace("{count}", String(visible.length))}
        </p>
      </div>

      <div className="lf-card-grid domain-governance-grid">
        {visible.map((node) => (
          <div key={node.node_id} className="lf-card lf-card-full domain-governance-card">
            <div className="card-badge-row">
              <span className="badge badge-navy">{node.witness_jurisdiction ?? "—"}</span>
              <span className="badge badge-default">{node.node_id}</span>
            </div>
            <h3 className="domain-governance-card-title">{node.display_name}</h3>
            <p className="page-muted-note domain-governance-card-stats">
              <span>
                {labels.jurisdiction}: {node.witness_jurisdiction ?? "—"}
              </span>
              {node.wire_url ? (
                <>
                  <span className="domain-governance-card-stat-sep" aria-hidden="true">
                    ·
                  </span>
                  <span>
                    {labels.wireUrl}: {node.wire_url}
                  </span>
                </>
              ) : null}
            </p>
            {node.did ? <p className="page-muted-note">{node.did}</p> : null}
          </div>
        ))}
      </div>
    </div>
  );
}
