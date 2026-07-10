import Link from "next/link";
import { notFound } from "next/navigation";
import { getT } from "@/lib/i18n";
import { getAgentById } from "@/lib/agents";
import { getLatestGitHubTag } from "@/lib/modules";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AgentJoinMemberButton } from "@/components/AgentJoinMemberButton";

export default async function AgentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { messages: t } = await getT();
  const a = t.agentsPage;
  const agent = await getAgentById(id, a);
  if (!agent) notFound();

  const session = await auth();
  const isMember = session?.user
    ? Boolean(
        await prisma.agentMember.findUnique({
          where: { agentSlug_userId: { agentSlug: agent.id, userId: session.user.id } },
        }),
      )
    : false;

  const latestTag = agent.githubRepo ? await getLatestGitHubTag(agent.githubRepo) : null;

  return (
    <>
      <section className="lf-hero lf-hero-compact">
        <div className="lf-hero-inner">
          <Link href="/agents" className="hero-back-link">
            {a.detailBack}
          </Link>
          <div className="card-badge-row" style={{ marginTop: "0.75rem" }}>
            <span className="badge badge-navy">{a.badgeCore}</span>
            <span className="badge badge-default">{agent.domainLabel}</span>
            {latestTag && <span className="badge badge-default">{latestTag}</span>}
          </div>
          <h1 className="lf-hero-title-sm">{agent.name}</h1>
          <p className="lf-hero-lead">
            {a.detailIdLabel}: {agent.id}
          </p>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginTop: "0.75rem" }}>
            {agent.githubRepo ? (
              <a
                href={agent.githubRepo}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline-light btn-sm"
              >
                GitHub
              </a>
            ) : (
              <Link href="/github" className="btn btn-outline-light btn-sm">
                {a.githubConnectCta}
              </Link>
            )}
            <Link href="/modules#registry" className="btn btn-primary btn-sm">
              {a.relatedModulesCta}
            </Link>
            <AgentJoinMemberButton
              agentId={agent.id}
              isMember={isMember}
              isSignedIn={Boolean(session?.user)}
              labels={{
                join: a.joinMemberCta,
                joined: a.joinMemberDone,
                signIn: a.joinMemberSignIn,
                submitting: a.joinMemberSubmitting,
                error: a.joinMemberError,
              }}
            />
          </div>
        </div>
      </section>

      <div className="page-wrap">
        <div className="lf-card">
          <h2 className="section-title" style={{ marginTop: 0 }}>
            {a.detailDescTitle}
          </h2>
          <p className="page-desc">{agent.description}</p>
          <p className="page-muted-note">
            {a.detailDomainLabel}: {agent.domainLabel}
          </p>
          {agent.manifestPath && (
            <p className="page-muted-note">
              {a.manifestPathLabel}: <code>{agent.manifestPath}</code>
            </p>
          )}
        </div>
      </div>
    </>
  );
}
