import Link from "next/link";
import { MonoIcon, type MonoIconName } from "@/components/icons/MonoIcon";

export function CommitteeParticipationGuide({
  labels,
}: {
  labels: {
    title: string;
    lead: string;
    pathModuleTitle: string;
    pathModuleBody: string;
    pathModuleCta: string;
    pathDomainTitle: string;
    pathDomainBody: string;
    pathDomainCta: string;
    pathStandardTitle: string;
    pathStandardBody: string;
    pathStandardCta: string;
  };
}) {
  const paths: { title: string; body: string; href: string; icon: MonoIconName }[] = [
    {
      title: labels.pathModuleTitle,
      body: labels.pathModuleBody,
      href: "/modules#registry",
      icon: "layers",
    },
    {
      title: labels.pathDomainTitle,
      body: labels.pathDomainBody,
      href: "#domain-committees",
      icon: "globe",
    },
    {
      title: labels.pathStandardTitle,
      body: labels.pathStandardBody,
      href: "#standard-committee",
      icon: "landmark",
    },
  ];

  return (
    <section className="participation-guide">
      <h2 className="section-title">{labels.title}</h2>
      <p className="page-desc">{labels.lead}</p>
      <div className="participation-guide-grid">
        {paths.map((path) => (
          <Link key={path.title} href={path.href} className="lf-card-link-wrap">
            <div className="lf-card lf-card-full participation-guide-card">
              <span className="participation-guide-icon" aria-hidden>
                <MonoIcon name={path.icon} size={28} />
              </span>
              <h3>{path.title}</h3>
              <p className="page-muted-note">{path.body}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
