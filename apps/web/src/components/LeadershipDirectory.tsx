"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { LeadershipCategoryId } from "@os-community/shared";

export type LeadershipCardData = {
  id: string;
  category: LeadershipCategoryId;
  categoryLabel: string;
  name: string;
  role: string;
  organization: string;
  bio: string;
  profileHref?: string;
  linkedinUrl?: string;
  imageUrl?: string | null;
};

type CategoryOption = {
  id: LeadershipCategoryId | "all";
  label: string;
};

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function LeadershipDirectory({
  members,
  categories,
  filterLabel,
  emptyCategory,
  viewProfile,
  viewLinkedIn,
}: {
  members: LeadershipCardData[];
  categories: CategoryOption[];
  filterLabel: string;
  emptyCategory: string;
  viewProfile: string;
  viewLinkedIn: string;
}) {
  const [active, setActive] = useState<LeadershipCategoryId | "all">("all");

  const filtered = useMemo(
    () => (active === "all" ? members : members.filter((m) => m.category === active)),
    [active, members]
  );

  return (
    <div className="leadership-directory">
      <div className="leadership-filter-bar">
        <span className="leadership-filter-label">{filterLabel}</span>
        <div className="leadership-filter-links" role="tablist" aria-label={filterLabel}>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              role="tab"
              aria-selected={active === cat.id}
              className={`leadership-filter-link${active === cat.id ? " is-active" : ""}`}
              onClick={() => setActive(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="page-muted-note leadership-empty">{emptyCategory}</p>
      ) : (
        <div className="leadership-grid">
          {filtered.map((member) => (
            <article key={member.id} className="leadership-card">
              <div className="leadership-card-media">
                {member.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={member.imageUrl} alt="" className="leadership-card-photo" />
                ) : (
                  <div className="leadership-card-photo leadership-card-photo-placeholder" aria-hidden="true">
                    {initials(member.name)}
                  </div>
                )}
              </div>
              <div className="leadership-card-body">
                <p className="leadership-card-org">{member.organization}</p>
                <h2 className="leadership-card-name">{member.name}</h2>
                <p className="leadership-card-role">{member.role}</p>
                <p className="leadership-card-bio">{member.bio}</p>
                <div className="leadership-card-links">
                  {member.profileHref && (
                    <Link href={member.profileHref} className="leadership-card-profile-link">
                      {viewProfile}
                    </Link>
                  )}
                  {member.linkedinUrl && (
                    <a
                      href={member.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="leadership-card-profile-link"
                    >
                      {viewLinkedIn}
                    </a>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
