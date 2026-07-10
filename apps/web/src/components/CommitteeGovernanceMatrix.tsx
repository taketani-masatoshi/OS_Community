"use client";

import Link from "next/link";
import type { Locale } from "@os-community/shared";
import {
  getGovernanceExpertDomainLabel,
  getGovernanceJurisdictionLabel,
  GOVERNANCE_EXPERT_DOMAINS,
  GOVERNANCE_JURISDICTIONS,
} from "@os-community/shared";

function profilePath(user: { publicSlug: string | null; githubLogin: string | null; name: string | null }) {
  if (user.publicSlug) return `/users/${user.publicSlug}`;
  if (user.githubLogin) return `/users/${user.githubLogin}`;
  return "#";
}

type MatrixCell = {
  slug: string;
  memberCount: number;
  governedModuleCount: number;
  chair: {
    user: { name: string | null; githubLogin: string | null; publicSlug: string | null };
    termStart: Date;
    termEnd: Date | null;
  } | null;
};

export function CommitteeGovernanceMatrix({
  locale,
  cells,
  labels,
}: {
  locale: Locale;
  cells: MatrixCell[];
  labels: {
    title: string;
    desc: string;
    jurisdiction: string;
    expertDomain: string;
    chair: string;
    vacant: string;
    members: string;
  };
}) {
  const cellByKey = new Map(
    cells.map((cell) => {
      const [jurisdiction, ...domainParts] = cell.slug.split("-");
      const expertDomain = domainParts.join("-");
      return [`${jurisdiction.toUpperCase()}:${expertDomain}`, cell] as const;
    })
  );

  return (
    <section className="governance-matrix-section">
      <h3 className="subsection-title">{labels.title}</h3>
      <p className="page-desc">{labels.desc}</p>
      <div className="governance-matrix-scroll">
        <table className="lf-table governance-matrix-table">
          <thead>
            <tr>
              <th>{labels.jurisdiction}</th>
              {GOVERNANCE_EXPERT_DOMAINS.map((domain) => (
                <th key={domain.key}>{getGovernanceExpertDomainLabel(domain.key, locale)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {GOVERNANCE_JURISDICTIONS.map((jurisdiction) => (
              <tr key={jurisdiction.code}>
                <th scope="row">{getGovernanceJurisdictionLabel(jurisdiction.code, locale)}</th>
                {GOVERNANCE_EXPERT_DOMAINS.map((domain) => {
                  const cell = cellByKey.get(`${jurisdiction.code}:${domain.key}`);
                  if (!cell) {
                    return (
                      <td key={domain.key} className="governance-matrix-cell governance-matrix-cell-empty">
                        —
                      </td>
                    );
                  }
                  return (
                    <td key={domain.key} className="governance-matrix-cell">
                      <div className="governance-matrix-cell-inner">
                        {cell.chair ? (
                          <p className="governance-matrix-chair">
                            <span className="badge badge-success">{labels.chair}</span>{" "}
                            <Link href={profilePath(cell.chair.user)}>
                              {cell.chair.user.githubLogin ?? cell.chair.user.name ?? "—"}
                            </Link>
                          </p>
                        ) : (
                          <p className="page-muted-note">{labels.vacant}</p>
                        )}
                        <p className="page-muted-note">
                          {labels.members}: {cell.memberCount}
                        </p>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
