import Link from "next/link";
import { notFound } from "next/navigation";
import { getPageMessages } from "@os-community/shared";
import { auth } from "@/auth";
import { Card, Badge } from "@/components/ui";
import { AcademyBreadcrumb } from "@/components/academy/AcademyBreadcrumb";
import { AcademyProgressBar } from "@/components/academy/AcademyProgressBar";
import { getAcademyClient } from "@/lib/academy/server-client";
import { handleAcademyLoadError } from "@/lib/academy/page-guard";
import { getTrackProgress } from "@/lib/academy/progress-service";
import {
  resolveModuleQuizFromModule,
  resolveTrackCertificationExam,
} from "@/lib/academy/quiz-config";
import { fillTemplate, getT } from "@/lib/i18n";

export const revalidate = 3600;

export async function generateStaticParams() {
  try {
    const tracks = await getAcademyClient().getTracks();
    return tracks.map((t) => ({ trackId: t.id }));
  } catch {
    return [];
  }
}

export default async function AcademyTrackPage({
  params,
}: {
  params: Promise<{ trackId: string }>;
}) {
  const { trackId } = await params;
  const { locale, t } = await getT();
  const p = getPageMessages(locale);
  const a = p.academy;

  let track;
  try {
    track = await getAcademyClient().getTrack(trackId);
  } catch (error) {
    handleAcademyLoadError(error);
  }

  const session = await auth();
  let progress = null;
  if (session?.user) {
    try {
      progress = await getTrackProgress(session.user.id, trackId);
    } catch {
      /* ignore */
    }
  }

  const certExam = resolveTrackCertificationExam(trackId);

  return (
    <>
      <AcademyBreadcrumb
        items={[
          { label: t.nav.learning, href: "/learning" },
          { label: track.name },
        ]}
      />
      <p className="page-desc" style={{ marginTop: "1rem" }}>
        {track.description}
      </p>
      {progress && (
        <div style={{ marginTop: "1rem" }}>
          <AcademyProgressBar
            completed={progress.completion.completed}
            total={progress.completion.total}
            percent={progress.completion.percent}
            label={a.trackProgress}
          />
        </div>
      )}
      {certExam && session?.user && progress?.completion.isComplete && (
        <p style={{ marginTop: "1rem" }}>
          <Link href={`/academy/exams/${certExam.bankId}/${certExam.formId}`} className="btn btn-primary btn-sm">
            {fillTemplate(a.takeExamFor, { title: certExam.title })}
          </Link>
        </p>
      )}
      <div className="lf-card-grid" style={{ marginTop: "1.5rem" }}>
        {track.modules.map((mod) => {
          const quiz = resolveModuleQuizFromModule(mod);
          return (
            <Card key={mod.id} title={mod.name}>
              <Badge variant="navy">
                {mod.lessons.length} {a.lessons}
              </Badge>
              <ul style={{ marginTop: "0.75rem", paddingLeft: "1.25rem" }}>
                {mod.lessons.map((lesson) => (
                  <li key={lesson.id} style={{ marginBottom: "0.35rem" }}>
                    <Link href={`/academy/lessons/${lesson.id}`}>{lesson.title}</Link>
                    <span style={{ color: "var(--muted)", fontSize: "0.85rem", marginLeft: "0.5rem" }}>
                      ({lesson.estimated_minutes} {a.minutes})
                    </span>
                  </li>
                ))}
              </ul>
              {quiz && (
                <p style={{ marginTop: "1rem" }}>
                  {session?.user ? (
                    <Link
                      href={`/academy/modules/${trackId}/${mod.slug}/quiz`}
                      className="btn btn-primary btn-sm"
                    >
                      {a.moduleTest}
                    </Link>
                  ) : (
                    <Link
                      href={`/login/start?callbackUrl=/academy/modules/${trackId}/${mod.slug}/quiz`}
                      className="btn btn-primary btn-sm"
                    >
                      {a.signInForModuleTest}
                    </Link>
                  )}
                </p>
              )}
            </Card>
          );
        })}
      </div>
    </>
  );
}
