import Link from "next/link";
import { getT } from "@/lib/i18n";
import { consoleStartPath, overviewUrl } from "@/lib/ecosystem-links";

const REASONS = [
  "forbidden",
  "domain",
  "no_email",
  "misconfigured",
  "archived",
] as const;

type Reason = (typeof REASONS)[number];

function parseReason(raw: string | undefined): Reason {
  if (raw && (REASONS as readonly string[]).includes(raw)) return raw as Reason;
  return "forbidden";
}

export default async function ConsoleHandoffBlockedPage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string }>;
}) {
  const { reason: raw } = await searchParams;
  const reason = parseReason(raw);
  const { messages: t } = await getT();
  const c = t.consoleHandoff;

  const copy =
    reason === "forbidden"
      ? { title: c.forbiddenTitle, body: c.forbiddenBody, actionHref: "/certifications/apply", actionLabel: c.forbiddenAction }
      : reason === "domain"
        ? { title: c.domainTitle, body: c.domainBody, actionHref: "/settings/profile?edit=1", actionLabel: c.domainAction }
        : reason === "no_email"
          ? { title: c.noEmailTitle, body: c.noEmailBody, actionHref: "/settings/profile?edit=1", actionLabel: c.noEmailAction }
          : reason === "misconfigured"
            ? { title: c.misconfiguredTitle, body: c.misconfiguredBody, actionHref: null, actionLabel: null }
            : { title: c.archivedTitle, body: c.archivedBody, actionHref: null, actionLabel: null };

  const canRetry = reason !== "archived" && reason !== "misconfigured";

  return (
    <section className="lf-hero lf-hero-compact">
      <div className="lf-hero-inner">
        <p className="page-muted-note">{c.title}</p>
        <h1 className="lf-hero-title-sm">{copy.title}</h1>
        <p className="lf-hero-lead">{copy.body}</p>
        <div className="section-actions" style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-3)" }}>
          {copy.actionHref && copy.actionLabel ? (
            <Link href={copy.actionHref} className="btn btn-primary btn-sm">
              {copy.actionLabel}
            </Link>
          ) : null}
          {canRetry ? (
            <Link href={consoleStartPath("/")} className="btn btn-ghost btn-sm">
              {c.retry}
            </Link>
          ) : null}
          <Link href="/mypage" className="btn btn-ghost btn-sm">
            {c.myPage}
          </Link>
        </div>
        <p className="page-muted-note" style={{ marginTop: "var(--space-5)" }}>
          <a href={overviewUrl()}>{c.overview}</a>
          {" · "}
          <Link href="/">{c.communityHome}</Link>
        </p>
      </div>
    </section>
  );
}
