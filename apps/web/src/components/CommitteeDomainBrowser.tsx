"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { DomainGovernanceGroup } from "@/lib/domain-governance-groups";

type DomainCard = DomainGovernanceGroup["domains"][number] & {
  jurisdictionCode: string;
  jurisdictionLabel: string;
  regionLabel: string;
};

export function CommitteeDomainBrowser({
  groups,
  labels,
}: {
  groups: DomainGovernanceGroup[];
  labels: {
    filterAll: string;
    domainBadge: string;
    governedModules: string;
    members: string;
    vacant: string;
    resultCount: string;
  };
}) {
  const [activeCode, setActiveCode] = useState<string>("all");

  const activeGroup = useMemo(
    () => (activeCode === "all" ? null : groups.find((group) => group.code === activeCode) ?? null),
    [activeCode, groups],
  );

  const visibleDomains = useMemo(() => {
    const source = activeCode === "all" ? groups : groups.filter((group) => group.code === activeCode);
    return source.flatMap((group) =>
      group.domains.map((domain) => ({
        ...domain,
        jurisdictionCode: group.code,
        jurisdictionLabel: group.jurisdictionLabel,
        regionLabel: group.regionLabel,
      })),
    );
  }, [activeCode, groups]);

  const showJurisdictionOnCard = activeCode === "all";

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
          {groups.map((group) => (
            <button
              key={group.code}
              type="button"
              role="tab"
              aria-selected={activeCode === group.code}
              className={`modules-registry-filter${activeCode === group.code ? " active" : ""}`}
              onClick={() => setActiveCode(group.code)}
            >
              {group.jurisdictionLabel}
            </button>
          ))}
        </div>
        <p className="modules-registry-count page-muted-note">
          {labels.resultCount.replace("{count}", String(visibleDomains.length))}
        </p>
      </div>

      {activeGroup ? (
        <div className="domain-governance-region-head domain-governance-region-head-compact">
          <h3 className="subsection-title" id={`domain-region-${activeGroup.code}`}>
            {activeGroup.jurisdictionLabel}
            <span className="badge badge-navy domain-jurisdiction-code">{activeGroup.code}</span>
          </h3>
          <p className="page-muted-note domain-governance-region-meta">{activeGroup.regionLabel}</p>
        </div>
      ) : null}

      <div className="lf-card-grid domain-governance-grid">
        {visibleDomains.map((domain) => (
          <DomainGovernanceCard
            key={`${domain.jurisdictionCode}-${domain.slug}`}
            domain={domain}
            labels={labels}
            showJurisdiction={showJurisdictionOnCard}
          />
        ))}
      </div>
    </div>
  );
}

function DomainGovernanceCard({
  domain,
  labels,
  showJurisdiction,
}: {
  domain: DomainCard;
  labels: {
    domainBadge: string;
    governedModules: string;
    members: string;
    vacant: string;
  };
  showJurisdiction: boolean;
}) {
  const stats = (
    <p className="domain-governance-card-stats page-muted-note">
      <span>
        {labels.governedModules}: {domain.governedModuleCount ?? "—"}
      </span>
      <span className="domain-governance-card-stat-sep" aria-hidden="true">
        ·
      </span>
      <span>
        {labels.members}: {domain.memberCount ?? "—"}
      </span>
    </p>
  );

  const badges = (
    <div className="card-badge-row">
      <span className="badge badge-navy">{domain.domainLabel}</span>
      {showJurisdiction ? (
        <span className="badge badge-default">{domain.jurisdictionLabel}</span>
      ) : (
        <span className="badge badge-default">{labels.domainBadge}</span>
      )}
    </div>
  );

  if (!domain.href) {
    return (
      <div className="lf-card lf-card-full domain-governance-card domain-governance-card-unavailable">
        {badges}
        <h3 className="domain-governance-card-title">{domain.committeeName}</h3>
        <p className="page-muted-note domain-governance-card-vacant">{labels.vacant}</p>
        {stats}
      </div>
    );
  }

  return (
    <Link href={domain.href} className="lf-card-link-wrap">
      <div className="lf-card lf-card-full domain-governance-card">
        {badges}
        <h3 className="domain-governance-card-title">{domain.committeeName}</h3>
        {stats}
      </div>
    </Link>
  );
}
