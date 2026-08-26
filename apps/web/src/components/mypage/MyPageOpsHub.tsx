import Link from "next/link";

export type OperatorOrgRow = {
  organizationId: string;
  legalName: string;
  corporateNumber: string;
  certificateNo: string;
  expiresAt: string;
};

type Props = {
  operatorOrgs: OperatorOrgRow[];
  /** OrgOS Operator Console base URL (e.g. http://127.0.0.1:9470). Empty = docs-only. */
  consoleBaseUrl?: string | null;
  /** When false, hide Console primary CTAs (unreachable / not running). */
  consoleReachable?: boolean;
  /** OOO-certified CEO / site admin — link to Console account management. */
  showOperatorAdminLink?: boolean;
  labels: {
    title: string;
    desc: string;
    empty: string;
    claimOrg: string;
    applyOoo: string;
    orgLabel: string;
    certLabel: string;
    expiresLabel: string;
    wireTitle: string;
    wireDesc: string;
    wireConsole: string;
    wireProtocol: string;
    wireGovernance: string;
    yojitsuTitle: string;
    yojitsuDesc: string;
    yojitsuConsole: string;
    yojitsuGuide: string;
    yojitsuInstall: string;
    secretaryTitle: string;
    secretaryDesc: string;
    secretaryConsole: string;
    stewardTitle: string;
    stewardDesc: string;
    stewardConsole: string;
    runsTitle: string;
    runsDesc: string;
    runsConsole: string;
    consoleOffline: string;
    operatorAdminTitle: string;
    operatorAdminDesc: string;
    operatorAdminLink: string;
  };
};

/** Community SSO start → Console /auth/community-handoff (no second login). */
function consoleStartHref(nextPath: string): string {
  return `/ops/console/start?next=${encodeURIComponent(nextPath)}`;
}

export function MyPageOpsHub({
  operatorOrgs,
  consoleBaseUrl,
  consoleReachable = false,
  showOperatorAdminLink = false,
  labels,
}: Props) {
  const consoleUrl = consoleBaseUrl?.trim() || null;
  const showConsoleCtas = Boolean(consoleUrl && consoleReachable);
  const wireConsoleHref = showConsoleCtas ? consoleStartHref("/wire/") : null;
  const yojitsuConsoleHref = showConsoleCtas ? consoleStartHref("/") : null;
  const operatorAdminHref = showConsoleCtas && showOperatorAdminLink
    ? consoleStartHref("/?account=1")
    : null;
  const secretaryHref = showConsoleCtas ? consoleStartHref("/secretary/") : null;
  const stewardHref = showConsoleCtas ? consoleStartHref("/steward/") : null;
  const runsHref = showConsoleCtas ? consoleStartHref("/runs/") : null;
  const showOfflineNote = Boolean(consoleUrl && !consoleReachable);

  return (
    <section className="mypage-section" aria-labelledby="mypage-ops-heading">
      <h2 id="mypage-ops-heading" className="mypage-section-label">
        {labels.title}
      </h2>
      <p className="page-desc" style={{ marginTop: 0 }}>
        {labels.desc}
      </p>

      {operatorOrgs.length === 0 ? (
        <div className="mypage-ops-empty lf-card">
          <p className="page-muted-note" style={{ margin: 0 }}>
            {labels.empty}
          </p>
          <div className="mypage-ops-actions">
            <Link href="/settings/organization" className="btn btn-primary btn-sm">
              {labels.claimOrg}
            </Link>
            <Link href="/certifications/apply" className="btn btn-ghost btn-sm">
              {labels.applyOoo}
            </Link>
          </div>
        </div>
      ) : (
        <ul className="mypage-ops-org-list">
          {operatorOrgs.map((org) => (
            <li key={org.organizationId + org.certificateNo} className="lf-card mypage-ops-org-card">
              <p className="mypage-ops-org-name">{org.legalName}</p>
              <p className="page-muted-note">
                {labels.orgLabel}: {org.corporateNumber}
              </p>
              <p className="page-muted-note">
                {labels.certLabel}: {org.certificateNo}
              </p>
              <p className="page-muted-note">
                {labels.expiresLabel}: {org.expiresAt}
              </p>
            </li>
          ))}
        </ul>
      )}

      {showOfflineNote && (
        <p className="page-muted-note" role="status" style={{ marginTop: "var(--space-4)" }}>
          {labels.consoleOffline}
        </p>
      )}

      {operatorAdminHref && (
        <div className="lf-card" style={{ marginTop: "var(--space-5)" }}>
          <h3 className="mypage-ops-link-title">{labels.operatorAdminTitle}</h3>
          <p className="page-muted-note">{labels.operatorAdminDesc}</p>
          <div className="mypage-ops-actions">
            <a
              href={operatorAdminHref}
              className="btn btn-primary btn-sm"
              target="_blank"
              rel="noopener noreferrer"
            >
              {labels.operatorAdminLink}
            </a>
          </div>
        </div>
      )}

      <div className="mypage-ops-links lf-card-grid" style={{ marginTop: "var(--space-5)" }}>
        <div className="lf-card">
          <h3 className="mypage-ops-link-title">{labels.wireTitle}</h3>
          <p className="page-muted-note">{labels.wireDesc}</p>
          <div className="mypage-ops-actions">
            {wireConsoleHref && (
              <a
                href={wireConsoleHref}
                className="btn btn-primary btn-sm"
                target="_blank"
                rel="noopener noreferrer"
              >
                {labels.wireConsole}
              </a>
            )}
            <Link href="/protocol/trusted-operators" className="btn btn-ghost btn-sm">
              {labels.wireProtocol}
            </Link>
            <Link href="/governance" className="btn btn-ghost btn-sm">
              {labels.wireGovernance}
            </Link>
          </div>
        </div>
        <div className="lf-card">
          <h3 className="mypage-ops-link-title">{labels.yojitsuTitle}</h3>
          <p className="page-muted-note">{labels.yojitsuDesc}</p>
          <div className="mypage-ops-actions">
            {yojitsuConsoleHref && (
              <a
                href={yojitsuConsoleHref}
                className="btn btn-primary btn-sm"
                target="_blank"
                rel="noopener noreferrer"
              >
                {labels.yojitsuConsole}
              </a>
            )}
            <Link href="/content/module-and-agent" className="btn btn-ghost btn-sm">
              {labels.yojitsuGuide}
            </Link>
            <Link href="/content/orgos-install-setup" className="btn btn-ghost btn-sm">
              {labels.yojitsuInstall}
            </Link>
          </div>
        </div>
        <div className="lf-card">
          <h3 className="mypage-ops-link-title">{labels.secretaryTitle}</h3>
          <p className="page-muted-note">{labels.secretaryDesc}</p>
          <div className="mypage-ops-actions">
            {secretaryHref && (
              <a
                href={secretaryHref}
                className="btn btn-primary btn-sm"
                target="_blank"
                rel="noopener noreferrer"
              >
                {labels.secretaryConsole}
              </a>
            )}
          </div>
        </div>
        <div className="lf-card">
          <h3 className="mypage-ops-link-title">{labels.stewardTitle}</h3>
          <p className="page-muted-note">{labels.stewardDesc}</p>
          <div className="mypage-ops-actions">
            {stewardHref && (
              <a
                href={stewardHref}
                className="btn btn-primary btn-sm"
                target="_blank"
                rel="noopener noreferrer"
              >
                {labels.stewardConsole}
              </a>
            )}
          </div>
        </div>
        <div className="lf-card">
          <h3 className="mypage-ops-link-title">{labels.runsTitle}</h3>
          <p className="page-muted-note">{labels.runsDesc}</p>
          <div className="mypage-ops-actions">
            {runsHref && (
              <a
                href={runsHref}
                className="btn btn-primary btn-sm"
                target="_blank"
                rel="noopener noreferrer"
              >
                {labels.runsConsole}
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
