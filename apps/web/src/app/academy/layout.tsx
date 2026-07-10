import { getPageMessages } from "@os-community/shared";
import { getT } from "@/lib/i18n";

export default async function AcademyLayout({ children }: { children: React.ReactNode }) {
  const { locale, t } = await getT();
  const a = getPageMessages(locale).academy;

  return (
    <>
      <section className="lf-hero lf-hero-compact">
        <div className="lf-hero-inner">
          <h1 className="lf-hero-title-sm">{t.nav.learning}</h1>
          <p className="lf-hero-lead">{a.layoutLead}</p>
        </div>
      </section>
      <div className="page-wrap">{children}</div>
    </>
  );
}
