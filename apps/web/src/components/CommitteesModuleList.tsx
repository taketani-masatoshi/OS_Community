"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

type ModuleCommitteeCard = {
  id: string;
  slug: string;
  name: string;
  moduleSlug: string | null;
  memberCount: number;
};

export function CommitteesModuleList({
  committees,
  labels,
}: {
  committees: ModuleCommitteeCard[];
  labels: {
    searchPlaceholder: string;
    members: string;
    viewDetail: string;
    moduleBadge: string;
    empty: string;
    showAll: string;
    showFewer: string;
  };
}) {
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return committees;
    return committees.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.slug.toLowerCase().includes(q) ||
        (c.moduleSlug?.toLowerCase().includes(q) ?? false),
    );
  }, [committees, query]);

  const visible = expanded ? filtered : filtered.slice(0, 12);
  const canCollapse = filtered.length > 12;

  return (
    <div>
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={labels.searchPlaceholder}
        className="lf-input"
        style={{ marginBottom: "1rem", maxWidth: "28rem" }}
        aria-label={labels.searchPlaceholder}
      />
      {filtered.length === 0 ? (
        <p className="page-muted-note">{labels.empty}</p>
      ) : (
        <>
          <div className="lf-card-grid">
            {visible.map((c) => (
              <Link key={c.id} href={`/committees/${c.slug}`} className="lf-card-link-wrap">
                <div className="lf-card lf-card-full">
                  <span className="badge badge-default">{labels.moduleBadge}</span>
                  {c.moduleSlug && (
                    <span className="badge badge-navy" style={{ marginLeft: "0.35rem" }}>
                      {c.moduleSlug}
                    </span>
                  )}
                  <h3>{c.name}</h3>
                  <p className="page-muted-note">
                    {labels.members}: {c.memberCount}
                  </p>
                </div>
              </Link>
            ))}
          </div>
          {canCollapse && (
            <p className="section-cta">
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => setExpanded((v) => !v)}
              >
                {expanded ? labels.showFewer : labels.showAll.replace("{count}", String(filtered.length))}
              </button>
            </p>
          )}
        </>
      )}
    </div>
  );
}
