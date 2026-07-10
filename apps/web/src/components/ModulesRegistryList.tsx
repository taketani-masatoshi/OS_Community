"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { MonoIcon } from "@/components/icons/MonoIcon";
import { getModuleDomainIcon } from "@/lib/module-display";

export type ModuleRegistryItem = {
  slug: string;
  name: string;
  description: string;
  moduleType: "BUSINESS" | "JURISDICTION" | "WILD";
  lifecycleLabel: string;
  isWild: boolean;
  maintainerWanted: boolean;
  stewards: string[];
  maintainerDisplay?: string | null;
};

type TypeFilter = "ALL" | ModuleRegistryItem["moduleType"];

export function ModulesRegistryList({
  modules,
  labels,
  typeLabels,
}: {
  modules: ModuleRegistryItem[];
  labels: {
    searchPlaceholder: string;
    searchEmpty: string;
    filterAll: string;
    badgeUnreviewed: string;
    badgeMaintainerWanted: string;
    resultCount: string;
    maintainerLabel: string;
  };
  typeLabels: Record<ModuleRegistryItem["moduleType"], string>;
}) {
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("ALL");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return modules.filter((mod) => {
      if (typeFilter !== "ALL" && mod.moduleType !== typeFilter) {
        return false;
      }
      if (!q) return true;
      const haystack = [
        mod.name,
        mod.description,
        mod.slug,
        mod.lifecycleLabel,
        typeLabels[mod.moduleType],
        mod.maintainerDisplay ?? mod.stewards.join(" "),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [modules, query, typeFilter, typeLabels]);

  const filters: { id: TypeFilter; label: string }[] = [
    { id: "ALL", label: labels.filterAll },
    { id: "BUSINESS", label: typeLabels.BUSINESS },
    { id: "JURISDICTION", label: typeLabels.JURISDICTION },
    { id: "WILD", label: typeLabels.WILD },
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
              aria-selected={typeFilter === filter.id}
              className={`modules-registry-filter ${typeFilter === filter.id ? "active" : ""}`}
              onClick={() => setTypeFilter(filter.id)}
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
        <div className="lf-card-grid modules-registry-grid">
          {filtered.map((mod) => (
            <Link key={mod.slug} href={`/modules/${mod.slug}`} className="lf-card-link-wrap">
              <div className="lf-card lf-card-full module-registry-card">
                <span className="module-domain-icon" aria-hidden>
                  <MonoIcon name={getModuleDomainIcon(mod.slug, mod.moduleType)} size={24} />
                </span>
                <div className="card-badge-row">
                  <span className="badge badge-default">{typeLabels[mod.moduleType]}</span>
                  <span className="badge badge-navy">{mod.lifecycleLabel}</span>
                  {mod.isWild && <span className="badge badge-danger">{labels.badgeUnreviewed}</span>}
                  {mod.maintainerWanted && (
                    <span className="badge badge-warning">{labels.badgeMaintainerWanted}</span>
                  )}
                </div>
                <h3>{mod.name}</h3>
                {mod.description ? <p className="module-card-desc">{mod.description}</p> : null}
                {(mod.maintainerDisplay || mod.stewards.length > 0) && (
                  <p className="page-muted-note module-card-maintainer">
                    {labels.maintainerLabel}: {mod.maintainerDisplay ?? mod.stewards.join(", ")}
                  </p>
                )}
                <span className="module-card-slug">{mod.slug}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
