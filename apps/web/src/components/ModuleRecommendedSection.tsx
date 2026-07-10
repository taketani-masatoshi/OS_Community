import Link from "next/link";
import { MonoIcon } from "@/components/icons/MonoIcon";
import { getModuleDomainIcon } from "@/lib/module-display";
import type { ModuleRegistryItem } from "@/components/ModulesRegistryList";

export function ModuleRecommendedSection({
  modules,
  title,
  subtitle,
}: {
  modules: ModuleRegistryItem[];
  title: string;
  subtitle: string;
}) {
  if (modules.length === 0) return null;

  return (
    <section className="module-recommended-section">
      <h2 className="section-title">{title}</h2>
      <p className="page-desc">{subtitle}</p>
      <div className="lf-card-grid">
        {modules.map((mod) => (
          <Link key={mod.slug} href={`/modules/${mod.slug}`} className="lf-card-link-wrap">
            <div className="lf-card lf-card-full module-recommended-card">
              <span className="module-domain-icon" aria-hidden>
                <MonoIcon name={getModuleDomainIcon(mod.slug, mod.moduleType)} size={24} />
              </span>
              <h3>{mod.name}</h3>
              {mod.description ? (
                <p className="module-card-desc">{mod.description}</p>
              ) : null}
              <span className="module-card-slug">{mod.slug}</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
