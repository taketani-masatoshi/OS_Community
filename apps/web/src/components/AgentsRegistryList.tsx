"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { AgentDomain } from "@os-community/shared";
import type { AgentRegistryItem } from "@/lib/agents";

type DomainFilter = "ALL" | AgentDomain;

export function AgentsRegistryList({
  agents,
  labels,
}: {
  agents: AgentRegistryItem[];
  labels: {
    searchPlaceholder: string;
    searchEmpty: string;
    filterAll: string;
    resultCount: string;
    badgeCore: string;
    domainLabels: Record<AgentDomain, string>;
  };
}) {
  const [query, setQuery] = useState("");
  const [domainFilter, setDomainFilter] = useState<DomainFilter>("ALL");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return agents.filter((agent) => {
      if (domainFilter !== "ALL" && agent.domain !== domainFilter) {
        return false;
      }
      if (!q) return true;
      const haystack = [agent.name, agent.id, agent.description, agent.domainLabel]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [agents, query, domainFilter]);

  const filters: { id: DomainFilter; label: string }[] = [
    { id: "ALL", label: labels.filterAll },
    { id: "governance", label: labels.domainLabels.governance },
    { id: "finance", label: labels.domainLabels.finance },
    { id: "operations", label: labels.domainLabels.operations },
  ];

  return (
    <div className="modules-registry">
      <div className="modules-registry-toolbar">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={labels.searchPlaceholder}
          className="lf-input modules-registry-search"
          aria-label={labels.searchPlaceholder}
        />
        <div className="modules-registry-filters" role="tablist" aria-label={labels.filterAll}>
          {filters.map((filter) => (
            <button
              key={filter.id}
              type="button"
              role="tab"
              aria-selected={domainFilter === filter.id}
              className={`modules-registry-filter ${domainFilter === filter.id ? "active" : ""}`}
              onClick={() => setDomainFilter(filter.id)}
            >
              {filter.label}
            </button>
          ))}
        </div>
        <p className="modules-registry-count page-muted-note">
          {labels.resultCount.replace("{count}", String(filtered.length))}
        </p>
      </div>

      {filtered.length === 0 ? (
        <p className="page-muted-note">{labels.searchEmpty}</p>
      ) : (
        <div className="lf-card-grid">
          {filtered.map((agent) => (
            <Link key={agent.id} href={`/agents/${agent.id}`} className="lf-card-link-wrap">
              <div className="lf-card lf-card-full">
                <div className="card-badge-row">
                  <span className="badge badge-navy">{labels.badgeCore}</span>
                  <span className="badge badge-default">{agent.domainLabel}</span>
                </div>
                <h3>{agent.name}</h3>
                <p className="page-muted-note" style={{ fontSize: "0.82rem" }}>
                  {agent.id}
                </p>
                <p style={{ fontSize: "0.9rem", marginBottom: "0.75rem" }}>{agent.description}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
