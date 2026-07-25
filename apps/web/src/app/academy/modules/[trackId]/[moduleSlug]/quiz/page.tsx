import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getPageMessages } from "@os-community/shared";
import { auth } from "@/auth";
import { AcademyBreadcrumb } from "@/components/academy/AcademyBreadcrumb";
import { ModuleQuizForm } from "@/components/academy/ModuleQuizForm";
import { getAcademyClient } from "@/lib/academy/server-client";
import { handleAcademyLoadError } from "@/lib/academy/page-guard";
import { AcademyApiError } from "@os-community/academy-client";
import {
  assertModuleQuizPrerequisites,
  QuizPrerequisiteError,
} from "@/lib/academy/progress-service";
import { resolveModuleQuizFromModule } from "@/lib/academy/quiz-config";
import { fillTemplate, getT } from "@/lib/i18n";

export const revalidate = 3600;

export default async function ModuleQuizPage({
  params,
}: {
  params: Promise<{ trackId: string; moduleSlug: string }>;
}) {
  const { trackId, moduleSlug } = await params;
  const { locale, t } = await getT();
  const a = getPageMessages(locale).academy;

  const session = await auth();
  if (!session?.user) {
    redirect(`/login/start?callbackUrl=/academy/modules/${trackId}/${moduleSlug}/quiz`);
  }

  let mod;
  try {
    mod = await getAcademyClient().getModule(trackId, moduleSlug);
  } catch (error) {
    handleAcademyLoadError(error);
  }

  const quizMeta = resolveModuleQuizFromModule(mod);
  if (!quizMeta) notFound();

  try {
    await assertModuleQuizPrerequisites(session.user.id, trackId, mod);
  } catch (error) {
    if (error instanceof QuizPrerequisiteError) {
      return (
        <>
          <AcademyBreadcrumb
            items={[
              { label: t.nav.learning, href: "/learning" },
              { label: mod.track, href: `/academy/tracks/${trackId}` },
              { label: mod.name },
            ]}
          />
          <p className="page-desc" style={{ marginTop: "1rem", color: "var(--muted)" }}>
            {error.message}
          </p>
          <Link href={`/academy/tracks/${trackId}`} className="btn btn-primary btn-sm">
            {a.backToTrack}
          </Link>
        </>
      );
    }
    if (error instanceof AcademyApiError) {
      return (
        <>
          <AcademyBreadcrumb
            items={[
              { label: t.nav.learning, href: "/learning" },
              { label: mod.track, href: `/academy/tracks/${trackId}` },
              { label: mod.name },
            ]}
          />
          <p className="page-desc" style={{ marginTop: "1rem", color: "var(--muted)" }}>
            {t.learning.academyUnavailable}
          </p>
          <Link href={`/academy/tracks/${trackId}`} className="btn btn-primary btn-sm">
            {a.backToTrack}
          </Link>
        </>
      );
    }
    throw error;
  }

  let exam;
  try {
    exam = await getAcademyClient().getExamForm(quizMeta.exam_bank, quizMeta.form_id);
  } catch (error) {
    if (error instanceof AcademyApiError && error.status < 500) {
      return (
        <>
          <AcademyBreadcrumb
            items={[
              { label: t.nav.learning, href: "/learning" },
              { label: mod.track, href: `/academy/tracks/${trackId}` },
              { label: mod.name },
            ]}
          />
          <p className="page-desc" style={{ marginTop: "1rem", color: "var(--muted)" }}>
            {t.learning.academyUnavailable}
          </p>
          <Link href={`/academy/tracks/${trackId}`} className="btn btn-primary btn-sm">
            {a.backToTrack}
          </Link>
        </>
      );
    }
    handleAcademyLoadError(error);
  }

  const form = exam.form as {
    id: string;
    name: string;
    pass_score?: number;
    time_limit_minutes?: number;
  };
  const items = exam.items as {
    id: string;
    type: string;
    stem: string;
    choices?: { id: string; text: string }[];
  }[];

  return (
    <>
      <AcademyBreadcrumb
        items={[
          { label: t.nav.learning, href: "/learning" },
          { label: mod.track, href: `/academy/tracks/${trackId}` },
          { label: mod.name },
          { label: a.moduleTest },
        ]}
      />
      <p className="page-desc" style={{ marginTop: "1rem" }}>
        {fillTemplate(a.moduleQuizSummary, { title: quizMeta.title, count: items.length })}
      </p>
      <div style={{ marginTop: "1.5rem" }}>
        <ModuleQuizForm
          trackId={trackId}
          bankId={quizMeta.exam_bank}
          formId={quizMeta.form_id}
          form={form}
          items={items}
          timeLimitMinutes={form.time_limit_minutes ?? 30}
          passScore={form.pass_score ?? quizMeta.pass_score}
          moduleSlug={moduleSlug}
          labels={a}
        />
      </div>
    </>
  );
}
