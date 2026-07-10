import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  READINESS_TO_LIFECYCLE,
  MODULE_LIFECYCLE,
  getLocalized,
  getLabelMessages,
  getPageMessages,
} from "@os-community/shared";
import { getUserProfilePath } from "@/lib/users";
import { getT } from "@/lib/i18n";
import { activeCertificationWhere } from "@/lib/active-certification";

const userSelect = {
  name: true,
  githubLogin: true,
  image: true,
  id: true,
  publicSlug: true,
  professionalProfile: { select: { id: true } },
  _count: { select: { githubConnections: true } },
} as const;

type ExpertUser = {
  id: string;
  name: string | null;
  githubLogin: string | null;
  publicSlug: string | null;
  professionalProfile: { id: string } | null;
  _count: { githubConnections: number };
};

function buildExpertsHref(linkedin?: boolean, github?: boolean) {
  const params = new URLSearchParams();
  if (linkedin) params.set("linkedin", "1");
  if (github) params.set("github", "1");
  const query = params.toString();
  return query ? `/experts?${query}` : "/experts";
}

function userLayerFilter(linkedin: boolean, github: boolean) {
  if (!linkedin && !github) return undefined;
  return {
    ...(linkedin ? { professionalProfile: { isNot: null } } : {}),
    ...(github ? { githubConnections: { some: {} } } : {}),
  };
}

function ExpertName({ user, badgeLinkedIn, badgeGitHub }: { user: ExpertUser; badgeLinkedIn: string; badgeGitHub: string }) {
  const hasLinkedIn = Boolean(user.professionalProfile);
  const hasGitHub = user._count.githubConnections > 0;

  return (
    <>
      <Link href={getUserProfilePath(user)}>
        <strong>{user.name ?? user.githubLogin}</strong>
      </Link>
      {(hasLinkedIn || hasGitHub) && (
        <span className="expert-layer-badges">
          {hasLinkedIn && (
            <span className="badge badge-default expert-layer-badge" title="LinkedIn">
              {badgeLinkedIn}
            </span>
          )}
          {hasGitHub && (
            <span className="badge badge-default expert-layer-badge" title="GitHub">
              {badgeGitHub}
            </span>
          )}
        </span>
      )}
    </>
  );
}

export default async function ExpertsPage({
  searchParams,
}: {
  searchParams: Promise<{ linkedin?: string; github?: string }>;
}) {
  const { linkedin, github } = await searchParams;
  const filterLinkedIn = linkedin === "1";
  const filterGitHub = github === "1";
  const userWhere = userLayerFilter(filterLinkedIn, filterGitHub);

  const { locale, messages: t } = await getT();
  const p = getPageMessages(locale);
  const labels = getLabelMessages(locale);
  const ui = p.ui;
  const e = p.experts;

  const maintainers = await prisma.moduleRole.findMany({
    where: {
      role: "MAINTAINER",
      ...(userWhere ? { user: userWhere } : {}),
    },
    include: {
      user: { select: userSelect },
      module: { select: { slug: true, name: true, readinessTier: true } },
    },
  });

  const deputies = await prisma.moduleRole.findMany({
    where: {
      role: "DEPUTY",
      ...(userWhere ? { user: userWhere } : {}),
    },
    include: {
      user: { select: userSelect },
      module: { select: { slug: true, name: true } },
    },
  });

  const certs = await prisma.certification.findMany({
    where: {
      ...activeCertificationWhere(),
      ...(userWhere ? { user: userWhere } : {}),
    },
    include: { user: { select: userSelect } },
    take: 30,
  });

  const hasActiveFilter = filterLinkedIn || filterGitHub;
  const totalResults = maintainers.length + deputies.length + certs.length;

  return (
    <>
      <section className="lf-hero lf-hero-compact">
        <div className="lf-hero-inner">
          <h1 className="lf-hero-title-sm">{e.title}</h1>
          <p className="lf-hero-lead">{e.lead}</p>
        </div>
      </section>

      <div className="page-wrap">
        <p className="section-cta" style={{ marginBottom: "1.5rem" }}>
          <Link href="/compliance" className="btn btn-primary btn-sm">
            {e.registryCta}
          </Link>
        </p>

        <div className="experts-filter-bar">
          <span className="experts-filter-label">{e.filterLabel}</span>
          <div className="experts-filter-links">
            <Link
              href={buildExpertsHref(false, false)}
              className={`btn btn-sm ${!hasActiveFilter ? "btn-primary" : "btn-ghost"}`}
            >
              {e.filterAll}
            </Link>
            <Link
              href={buildExpertsHref(true, filterGitHub)}
              className={`btn btn-sm ${filterLinkedIn && !filterGitHub ? "btn-primary" : "btn-ghost"}`}
            >
              {e.filterLinkedIn}
            </Link>
            <Link
              href={buildExpertsHref(filterLinkedIn, true)}
              className={`btn btn-sm ${filterGitHub && !filterLinkedIn ? "btn-primary" : "btn-ghost"}`}
            >
              {e.filterGitHub}
            </Link>
            {filterLinkedIn && filterGitHub && (
              <Link href={buildExpertsHref(true, true)} className="btn btn-sm btn-primary">
                {e.filterBoth}
              </Link>
            )}
          </div>
        </div>

        {hasActiveFilter && totalResults === 0 && (
          <div className="mypage-alert" style={{ marginBottom: "1.5rem" }}>
            <p>{e.filterEmpty}</p>
            <Link href="/experts" className="btn btn-ghost btn-sm">
              {e.filterClear}
            </Link>
          </div>
        )}

        <h2 className="section-title">{e.maintainersTitle}</h2>
        {maintainers.length === 0 ? (
          <p style={{ color: "var(--muted)" }}>
            {hasActiveFilter ? e.filterEmpty : e.maintainersEmpty}{" "}
            {!hasActiveFilter && (
              <Link href="/modules">{t.nav.modules}</Link>
            )}
          </p>
        ) : (
          <table className="lf-table">
            <thead>
              <tr>
                <th>{ui.expert}</th>
                <th>{ui.module}</th>
                <th>{ui.lifecycle}</th>
                <th>{ui.role}</th>
              </tr>
            </thead>
            <tbody>
              {maintainers.map((r) => {
                const lifecycle =
                  READINESS_TO_LIFECYCLE[r.module.readinessTier ?? "skeleton"] ?? "COMMUNITY";
                const lifecycleMeta = MODULE_LIFECYCLE.find((s) => s.stage === lifecycle);
                const lifecycleLabel = lifecycleMeta
                  ? getLocalized(lifecycleMeta.name, locale)
                  : lifecycle;
                return (
                  <tr key={r.id}>
                    <td>
                      <ExpertName user={r.user} badgeLinkedIn={e.badgeLinkedIn} badgeGitHub={e.badgeGitHub} />
                    </td>
                    <td>
                      <Link href={`/modules/${r.module.slug}`}>{r.module.name}</Link>
                    </td>
                    <td>
                      <span className="badge badge-default">{lifecycleLabel}</span>
                    </td>
                    <td>{labels.moduleRole.MAINTAINER}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {deputies.length > 0 && (
          <>
            <h2 className="section-title">{e.deputiesTitle}</h2>
            <table className="lf-table">
              <tbody>
                {deputies.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <ExpertName user={r.user} badgeLinkedIn={e.badgeLinkedIn} badgeGitHub={e.badgeGitHub} />
                    </td>
                    <td>
                      <Link href={`/modules/${r.module.slug}`}>{r.module.name}</Link>
                    </td>
                    <td>{labels.moduleRole.DEPUTY}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        <h2 className="section-title">{e.certifiedTitle}</h2>
        {certs.length === 0 ? (
          <p style={{ color: "var(--muted)" }}>
            {hasActiveFilter ? (
              e.filterEmpty
            ) : (
              <>
                <Link href="/certifications">{p.certifications.title}</Link>
                {e.certifiedEmpty}
              </>
            )}
          </p>
        ) : (
          <table className="lf-table">
            <thead>
              <tr>
                <th>{ui.name}</th>
                <th>{p.certifications.tracksTitle}</th>
                <th>{ui.verify}</th>
              </tr>
            </thead>
            <tbody>
              {certs.map((c) => (
                <tr key={c.id}>
                  <td>
                    <ExpertName user={c.user} badgeLinkedIn={e.badgeLinkedIn} badgeGitHub={e.badgeGitHub} />
                  </td>
                  <td>{labels.certification[c.type]}</td>
                  <td>
                    <Link href={`/certifications/verify/${c.certificateNo}`}>{ui.verify}</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
