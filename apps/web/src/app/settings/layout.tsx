import { SettingsNav } from "@/components/settings/SettingsNav";
import { getT } from "@/lib/i18n";

export default async function SettingsLayout({ children }: { children: React.ReactNode }) {
  const { messages: t } = await getT();

  return (
    <>
      <section className="lf-hero lf-hero-compact">
        <div className="lf-hero-inner">
          <h1 className="lf-hero-title-sm">{t.settings.title}</h1>
          <p className="lf-hero-lead">{t.settings.lead}</p>
        </div>
      </section>

      <div className="page-wrap settings-layout">
        <SettingsNav
          title={t.settings.navTitle}
          items={[
            { href: "/settings/appearance", label: t.settings.appearance },
            { href: "/settings/profile", label: t.settings.profile },
            { href: "/settings/organization", label: t.settings.organization },
          ]}
        />
        <div className="settings-content">{children}</div>
      </div>
    </>
  );
}
