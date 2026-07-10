import Link from "next/link";
import {
  STANDARD_COMMITTEE_DESCRIPTION,
  resolveMessagesLocale,
} from "@os-community/shared";
import { getT } from "@/lib/i18n";
import {
  getAllCommitteesGrouped,
  getCommitteeDisplayName,
  getCommitteeGovernanceMatrix,
  getActiveCommitteeChair,
} from "@/lib/committees";
import { CommitteesModuleList } from "@/components/CommitteesModuleList";
import { CommitteeDomainBrowser } from "@/components/CommitteeDomainBrowser";
import { CommitteeGovernanceMatrix } from "@/components/CommitteeGovernanceMatrix";
import { CommitteeParticipationGuide } from "@/components/CommitteeParticipationGuide";
import { buildDomainGovernanceGroups } from "@/lib/domain-governance-groups";

export default async function CommitteesPage() {
  const { locale, messages: t } = await getT();
  const cp = t.committeesPage;
  const { standard, domain, module: moduleCommittees } = await getAllCommitteesGrouped();
  const matrix = await getCommitteeGovernanceMatrix();
  const domainGroups = buildDomainGovernanceGroups(
    locale,
    domain.map((c) => ({
      slug: c.slug,
      jurisdictionCode: c.jurisdictionCode,
      expertDomainKey: c.expertDomainKey,
      memberCount: c._count.members,
      governedModuleCount: c._count.governedModules,
    })),
  );

  return (
    <>
      <section className="lf-hero lf-hero-compact">
        <div className="lf-hero-inner">
          <h1 className="lf-hero-title-sm">{t.nav.committees}</h1>
          <p className="lf-hero-lead">{cp.desc}</p>
          <Link href="/mypage" className="btn btn-outline-light btn-sm">
            {t.nav.myPage}
          </Link>
        </div>
      </section>

      <div className="page-wrap">
        <CommitteeParticipationGuide
          labels={{
            title: cp.participationGuideTitle,
            lead: cp.participationGuideLead,
            pathModuleTitle: cp.pathModuleTitle,
            pathModuleBody: cp.pathModuleBody,
            pathModuleCta: cp.pathModuleCta,
            pathDomainTitle: cp.pathDomainTitle,
            pathDomainBody: cp.pathDomainBody,
            pathDomainCta: cp.pathDomainCta,
            pathStandardTitle: cp.pathStandardTitle,
            pathStandardBody: cp.pathStandardBody,
            pathStandardCta: cp.pathStandardCta,
          }}
        />

        <h2 className="section-title" id="standard-committee">
          {cp.standardSection}
        </h2>
        <p className="page-desc">{cp.standardDesc}</p>
        <div className="lf-card-grid">
          {standard.map((c) => (
            <Link key={c.id} href={`/committees/${c.slug}`} className="lf-card-link-wrap">
              <div className="lf-card lf-card-full committee-card-standard">
                <span className="badge badge-navy">{t.mypage.standardBadge}</span>
                <p className="committee-card-lead">
                  {STANDARD_COMMITTEE_DESCRIPTION[resolveMessagesLocale(locale)]}
                </p>
                <p className="page-muted-note">
                  {cp.members}: {c._count.members}
                </p>
              </div>
            </Link>
          ))}
        </div>

        <h2 className="section-title" id="domain-committees">
          {cp.domainSection}
        </h2>
        <p className="page-desc">{cp.domainDesc}</p>

        <CommitteeDomainBrowser
          groups={domainGroups}
          labels={{
            filterAll: cp.domainFilterAll,
            domainBadge: cp.domainBadge,
            governedModules: cp.governedModules,
            members: cp.members,
            vacant: cp.matrixVacant,
            resultCount: cp.domainResultCount,
          }}
        />

        <details className="governance-matrix-details">
          <summary>{cp.matrixToggle}</summary>
          <CommitteeGovernanceMatrix
            locale={locale}
            cells={matrix.cells.map((committee) => ({
              slug: committee.slug,
              memberCount: committee._count.members,
              governedModuleCount: committee._count.governedModules,
              chair: getActiveCommitteeChair(committee.members),
            }))}
            labels={{
              title: cp.matrixTitle,
              desc: cp.matrixDesc,
              jurisdiction: cp.matrixJurisdiction,
              expertDomain: cp.matrixExpertDomain,
              chair: cp.matrixChair,
              vacant: cp.matrixVacant,
              members: cp.members,
            }}
          />
        </details>

        <p className="hierarchy-note">{cp.hierarchyNote}</p>

        <div className="membership-policy-callout">
          <h3 className="membership-policy-callout-title">{cp.membershipPolicyTitle}</h3>
          <p>{cp.membershipPolicyBody}</p>
          <p className="page-muted-note">{cp.participationDomainModulePath}</p>
          <Link href="/governance" className="btn btn-primary btn-sm">
            {t.about.governanceCta}
          </Link>
        </div>

        <h2 className="section-title">{cp.moduleSection}</h2>
        <p className="page-desc">{cp.moduleDesc}</p>
        <CommitteesModuleList
          committees={moduleCommittees.map((c) => ({
            id: c.id,
            slug: c.slug,
            name: getCommitteeDisplayName(c, locale),
            moduleSlug: c.module?.slug ?? null,
            memberCount: c._count.members,
          }))}
          labels={{
            searchPlaceholder: cp.moduleSearchPlaceholder,
            members: cp.members,
            viewDetail: cp.viewDetail,
            moduleBadge: t.mypage.moduleBadge,
            empty: cp.moduleListEmpty,
            showAll: cp.showAllModules,
            showFewer: cp.showFewerModules,
          }}
        />

        {moduleCommittees.length === 0 && (
          <p className="page-muted-note">{cp.emptyModulesHint}</p>
        )}
      </div>
    </>
  );
}
