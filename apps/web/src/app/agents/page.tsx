import Link from "next/link";
import { getT } from "@/lib/i18n";
import { getAgentRegistryItems } from "@/lib/agents";
import { AgentsRegistryList } from "@/components/AgentsRegistryList";

export default async function AgentsPage() {
  const { messages: t } = await getT();
  const a = t.agentsPage;
  const agents = await getAgentRegistryItems(a);

  return (
    <>
      <section className="lf-hero lf-hero-compact">
        <div className="lf-hero-inner">
          <h1 className="lf-hero-title-sm">{a.title}</h1>
          <p className="lf-hero-lead">{a.lead}</p>
          <div className="lf-hero-actions">
            <Link href="/modules#registry" className="btn btn-outline-light btn-sm">
              {a.ctaModules}
            </Link>
            <Link href="/learning" className="btn btn-outline-light btn-sm">
              {a.ctaLearning}
            </Link>
          </div>
        </div>
      </section>

      <div className="page-wrap" id="registry">
        <AgentsRegistryList
          agents={agents}
          labels={{
            searchPlaceholder: a.searchPlaceholder,
            searchEmpty: a.searchEmpty,
            filterAll: a.filterAll,
            resultCount: a.resultCount,
            badgeCore: a.badgeCore,
            domainLabels: a.domainLabels,
          }}
        />
      </div>
    </>
  );
}
