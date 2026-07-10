import Link from "next/link";
import { getT } from "@/lib/i18n";

type WildModule = {
  slug: string;
  name: string;
  repoUrl: string;
  createdAt: Date;
};

export async function MyPageWildModulesSection({ modules }: { modules: WildModule[] }) {
  const { messages: t } = await getT();
  const labels = t.mypage;

  return (
    <section className="mypage-section">
      <h2 className="mypage-section-label">
        {labels.wildModulesTitle} ({modules.length})
      </h2>
      <p className="page-muted-note">{labels.wildModulesDesc}</p>

      {modules.length === 0 ? (
        <div className="lf-card">
          <p className="page-muted-note" style={{ margin: 0 }}>
            {labels.wildModulesEmpty}
          </p>
          <p className="section-cta" style={{ marginTop: "0.75rem" }}>
            <Link href="/wild-modules/register" className="btn btn-primary btn-sm">
              {labels.wildModulesRegister}
            </Link>
          </p>
        </div>
      ) : (
        <div className="lf-card-grid">
          {modules.map((mod) => (
            <div key={mod.slug} className="lf-card lf-card-full">
              <span className="badge badge-danger">{labels.wildModulesBadge}</span>
              <h3 style={{ marginTop: "0.5rem" }}>
                <Link href={`/modules/${mod.slug}`}>{mod.name}</Link>
              </h3>
              <p className="module-card-slug">{mod.slug}</p>
              <p className="section-cta" style={{ marginTop: "0.75rem", marginBottom: 0 }}>
                <Link href={`/modules/${mod.slug}#promotion`} className="btn btn-primary btn-sm">
                  {labels.wildModulesPromote}
                </Link>
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
