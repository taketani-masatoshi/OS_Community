import Link from "next/link";
import { getPageMessages, localeToBcp47 } from "@os-community/shared";
import { fillTemplate, getT } from "@/lib/i18n";

import { AcademyProgressBar } from "@/components/academy/AcademyProgressBar";
import { Badge } from "@/components/ui";
import { getAcademyDashboard } from "@/lib/academy/progress-service";
import { evaluateCertificationEligibility } from "@/lib/academy/issuance-service";
import { resolveTrackCertificationExam } from "@/lib/academy/quiz-config";

type AcademyDashboard = Awaited<ReturnType<typeof getAcademyDashboard>>;

export async function AcademyDashboardSection({
  userId,
  dashboard: preloaded,
}: {
  userId: string;
  dashboard?: AcademyDashboard | null;
}) {
  const { locale, t } = await getT();
  const a = getPageMessages(locale).academy;
  const dateLocale = localeToBcp47(locale);

  let dashboard = preloaded;
  if (dashboard === undefined) {
    try {
      dashboard = await getAcademyDashboard(userId);
    } catch {
      return null;
    }
  }
  if (!dashboard) return null;

  const hasActivity =
    dashboard.tracks.some((track) => track.completion.completed > 0) ||
    dashboard.certificates.length > 0;

  if (!hasActivity) {
    return (
      <section className="mypage-section">
        <h2 className="section-title">{a.dashboardTitle}</h2>
        <p className="page-muted-note">{a.dashboardEmpty}</p>
        <p className="section-cta">
          <Link href="/learning" className="btn btn-primary btn-sm">
            {t.nav.learning}
          </Link>
        </p>
      </section>
    );
  }

  let ccuEligibility = null;
  try {
    ccuEligibility = await evaluateCertificationEligibility(userId, "CCU");
  } catch {
    /* ignore */
  }

  const ccuExam = resolveTrackCertificationExam("level-0-user");

  return (
    <section className="mypage-section">
      <div className="mypage-section-header">
        <h2 className="section-title" style={{ marginBottom: 0 }}>
          {a.dashboardTitle}
        </h2>
        <Link href="/learning" className="btn btn-primary btn-sm">
          {a.viewAllAcademy}
        </Link>
      </div>

      {dashboard.continueTrack && (
        <div className="lf-card" style={{ marginBottom: "1.25rem" }}>
          <h3 className="subsection-title" style={{ marginTop: 0 }}>
            {a.continueLearning}
          </h3>
          <p className="page-muted-note">{dashboard.continueTrack.trackName}</p>
          <p className="section-cta" style={{ marginTop: "0.75rem" }}>
            <Link
              href={`/academy/lessons/${dashboard.continueTrack.lessonId}`}
              className="btn btn-primary btn-sm"
            >
              {fillTemplate(a.continueLessonCta, { title: dashboard.continueTrack.lessonTitle })}
            </Link>
          </p>
        </div>
      )}

      <div className="lf-card-grid">
        {dashboard.tracks
          .filter((track) => track.completion.total > 0)
          .map((track) => (
            <Link key={track.trackId} href={`/academy/tracks/${track.trackId}`} className="lf-card-link-wrap">
              <div className="lf-card lf-card-full">
                <h3>{track.trackName}</h3>
                <AcademyProgressBar
                  completed={track.completion.completed}
                  total={track.completion.total}
                  percent={track.completion.percent}
                  label={a.trackProgress}
                />
                {track.completion.isComplete && (
                  <p style={{ marginTop: "0.5rem" }}>
                    <Badge variant="success">{a.trackCompleteBadge}</Badge>
                  </p>
                )}
              </div>
            </Link>
          ))}
      </div>

      {(dashboard.recentLessons.length > 0 || dashboard.recentExams.length > 0) && (
        <div style={{ marginTop: "1.5rem" }}>
          <h3 className="subsection-title">{a.recentActivityTitle}</h3>
          <div className="mypage-activity-grid">
            {dashboard.recentLessons.length > 0 && (
              <div className="lf-card">
                <h4 className="mypage-activity-heading">{a.recentLessonsTitle}</h4>
                <ul className="mypage-activity-list">
                  {dashboard.recentLessons.map((lesson) => (
                    <li key={`${lesson.trackId}-${lesson.lessonId}`}>
                      <Link href={`/academy/lessons/${lesson.lessonId}`}>
                        {lesson.lessonTitle}
                      </Link>
                      <span className="page-muted-note" style={{ display: "block", fontSize: "0.85rem" }}>
                        {lesson.trackName} ·{" "}
                        <span
                          className={`badge ${
                            lesson.status === "completed" ? "badge-success" : "badge-warning"
                          }`}
                        >
                          {lesson.status === "completed" ? a.lessonCompletedBadge : a.lessonInProgress}
                        </span>
                        {" · "}
                        {lesson.updatedAt.toLocaleDateString(dateLocale)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {dashboard.recentExams.length > 0 && (
              <div className="lf-card">
                <h4 className="mypage-activity-heading">{a.recentExamsTitle}</h4>
                <ul className="mypage-activity-list">
                  {dashboard.recentExams.map((exam) => (
                    <li key={`${exam.bankId}-${exam.formId}-${exam.submittedAt.toISOString()}`}>
                      <span>{exam.trackName}</span>
                      <span className="page-muted-note" style={{ display: "block", fontSize: "0.85rem" }}>
                        {fillTemplate(a.examScoreLine, { score: String(exam.score) })}{" "}
                        <span className={`badge ${exam.passed ? "badge-success" : "badge-default"}`}>
                          {exam.passed ? a.examPassed : a.examFailed}
                        </span>
                        {" · "}
                        {exam.submittedAt.toLocaleDateString(dateLocale)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {dashboard.certificates.length > 0 && (
        <div style={{ marginTop: "1.5rem" }}>
          <h3 className="subsection-title">{a.certificatesTitle}</h3>
          <ul className="mypage-activity-list">
            {dashboard.certificates.map((c) => (
              <li key={c.id}>
                <strong>{c.certificationId}</strong>: {c.certificateNo}{" "}
                <span className="page-muted-note">
                  ({c.issuedAt.toLocaleDateString(dateLocale)})
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {ccuExam && ccuEligibility && (
        <div style={{ marginTop: "1.5rem" }} className="lf-card">
          <h3>{a.ccuTitle}</h3>
          {ccuEligibility.eligible ? (
            <>
              <Badge variant="success">{a.ccuEligible}</Badge>
              <p className="section-cta" style={{ marginTop: "0.75rem" }}>
                <Link
                  href={`/academy/exams/${ccuExam.bankId}/${ccuExam.formId}`}
                  className="btn btn-primary btn-sm"
                >
                  {a.ccuExamCta}
                </Link>
              </p>
            </>
          ) : (
            <p className="page-muted-note">{ccuEligibility.reasons.join(" · ")}</p>
          )}
        </div>
      )}
    </section>
  );
}
