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
  assertTrackExamPrerequisites,
  QuizPrerequisiteError,
} from "@/lib/academy/progress-service";
import { resolveCertificationExam } from "@/lib/academy/quiz-config";
import { fillTemplate, getT } from "@/lib/i18n";

export const revalidate = 3600;

export default async function CertificationExamPage({
  params,
}: {
  params: Promise<{ bankId: string; formId: string }>;
}) {
  const { bankId, formId } = await params;
  const { locale, t } = await getT();
  const a = getPageMessages(locale).academy;

  const session = await auth();
  const config =
    resolveCertificationExam("CCU") ??
    (bankId === "ccu-v1" && formId === "form-a"
      ? {
          certificationId: "CCU",
          bankId,
          formId,
          trackId: "level-0-user",
          passScore: 70,
          timeLimitMinutes: 60,
          title: a.ccuTitle,
        }
      : null);

  if (!config || config.bankId !== bankId || config.formId !== formId) {
    notFound();
  }

  if (!session?.user) {
    redirect(`/login/start?callbackUrl=/academy/exams/${bankId}/${formId}`);
  }

  try {
    await assertTrackExamPrerequisites(session.user.id, config.trackId);
  } catch (error) {
    if (error instanceof QuizPrerequisiteError) {
      return (
        <>
          <AcademyBreadcrumb
            items={[
              { label: t.nav.learning, href: "/learning" },
              { label: config.title },
            ]}
          />
          <p className="page-desc" style={{ marginTop: "1rem" }}>
            {error.message}
          </p>
          <Link href={`/academy/tracks/${config.trackId}`} className="btn btn-primary btn-sm">
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
              { label: config.title },
            ]}
          />
          <p className="page-desc" style={{ marginTop: "1rem" }}>
            {t.learning.academyUnavailable}
          </p>
          <Link href="/learning" className="btn btn-primary btn-sm">
            {a.backToTrack}
          </Link>
        </>
      );
    }
    throw error;
  }

  let exam;
  try {
    exam = await getAcademyClient().getExamForm(bankId, formId);
  } catch (error) {
    if (error instanceof AcademyApiError && error.status < 500) {
      return (
        <>
          <AcademyBreadcrumb
            items={[
              { label: t.nav.learning, href: "/learning" },
              { label: config.title },
            ]}
          />
          <p className="page-desc" style={{ marginTop: "1rem" }}>
            {t.learning.academyUnavailable}
          </p>
          <Link href="/learning" className="btn btn-primary btn-sm">
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
          { label: config.title },
        ]}
      />
      <p className="page-desc" style={{ marginTop: "1rem" }}>
        {fillTemplate(a.examSummary, {
          title: config.title,
          count: items.length,
          score: config.passScore,
        })}
      </p>
      <div style={{ marginTop: "1.5rem" }}>
        <ModuleQuizForm
          trackId={config.trackId}
          bankId={bankId}
          formId={formId}
          form={form}
          items={items}
          timeLimitMinutes={form.time_limit_minutes ?? config.timeLimitMinutes}
          passScore={form.pass_score ?? config.passScore}
          issueCertificationId={config.certificationId}
          labels={a}
        />
      </div>
    </>
  );
}
