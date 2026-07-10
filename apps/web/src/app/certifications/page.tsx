import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getLabelMessages, getPageMessages } from "@os-community/shared";
import { auth } from "@/auth";
import { getT } from "@/lib/i18n";
import { activeCertificationWhere } from "@/lib/active-certification";
import { getUserProfilePath } from "@/lib/users";

export default async function CertificationsPage() {
  const { locale, messages: t } = await getT();
  const p = getPageMessages(locale);
  const c = p.certifications;
  const ui = p.ui;
  const certLabels = getLabelMessages(locale).certification;
  const session = await auth();

  const publicCerts = await prisma.certification.findMany({
    where: activeCertificationWhere(),
    include: { user: { select: { name: true, githubLogin: true, publicSlug: true, id: true } } },
    orderBy: { issuedAt: "desc" },
    take: 50,
  });

  return (
    <>
      <section className="lf-hero lf-hero-compact">
        <div className="lf-hero-inner">
          <h1 className="lf-hero-title-sm">{c.title}</h1>
          <p className="lf-hero-lead">{c.lead}</p>
        </div>
      </section>

      <div className="page-wrap">
        <h2 className="section-title">{c.tracksTitle}</h2>
        <table className="lf-table">
          <thead>
            <tr>
              <th>{p.certificationsVerify.labelType}</th>
              <th>{ui.focus}</th>
              <th>{ui.renewal}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>{certLabels.STEWARD_OPERATOR}</strong></td>
              <td>{c.operatorFocus}</td>
              <td>{c.renewal2y}</td>
            </tr>
            <tr>
              <td><strong>{certLabels.STEWARD_DESIGNER}</strong></td>
              <td>{c.designerFocus}</td>
              <td>{c.renewal3y}</td>
            </tr>
          </tbody>
        </table>

        <p style={{ color: "var(--muted)", fontSize: "0.9rem", margin: "1rem 0 2rem" }}>
          {c.disclaimer}
        </p>

        {session?.user ? (
          <Link href="/certifications/apply" className="btn btn-primary">{c.applyCta}</Link>
        ) : (
          <p>
            <Link href="/login">{t.login.signInCta}</Link> {c.signInToApply}
          </p>
        )}

        <h2 className="section-title">{c.directoryTitle}</h2>
        {publicCerts.length === 0 ? (
          <p style={{ color: "var(--muted)" }}>{c.directoryEmpty}</p>
        ) : (
          <table className="lf-table">
            <thead>
              <tr>
                <th>{ui.name}</th>
                <th>{p.certificationsVerify.labelType}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {publicCerts.map((cert) => (
                <tr key={cert.id}>
                  <td>
                    <Link href={getUserProfilePath(cert.user)}>
                      {cert.user.githubLogin ?? cert.user.name}
                    </Link>
                  </td>
                  <td>{certLabels[cert.type]}</td>
                  <td>
                    <Link href={`/certifications/verify/${cert.certificateNo}`}>{ui.verify}</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <p className="section-cta">
          <Link href="/experts" className="btn btn-primary btn-sm">{c.expertsCta}</Link>
        </p>
      </div>
    </>
  );
}
