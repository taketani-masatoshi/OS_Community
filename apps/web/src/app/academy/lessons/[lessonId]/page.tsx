import Link from "next/link";
import { notFound } from "next/navigation";
import { getPageMessages } from "@os-community/shared";
import { auth } from "@/auth";
import { Badge } from "@/components/ui";
import { MarkdownContent } from "@/components/MarkdownContent";
import { YouTubeEmbed } from "@/components/YouTubeEmbed";
import { AcademyBreadcrumb } from "@/components/academy/AcademyBreadcrumb";
import { AcademyProgressBar } from "@/components/academy/AcademyProgressBar";
import { LessonNavigation } from "@/components/academy/LessonNavigation";
import { MarkLessonCompleteButton } from "@/components/academy/MarkLessonCompleteButton";
import { MarkVideoCompleteButton } from "@/components/academy/MarkVideoCompleteButton";
import { getAcademyClient } from "@/lib/academy/server-client";
import { handleAcademyLoadError } from "@/lib/academy/page-guard";
import { getLessonProgress } from "@/lib/academy/progress-service";
import { DEFAULT_CURRICULUM_VERSION, lessonRequiresVideo } from "@/lib/academy/progress-types";
import { getT } from "@/lib/i18n";

export const revalidate = 3600;

export async function generateStaticParams() {
  try {
    const tracks = await getAcademyClient().getTracks();
    return tracks.flatMap((t) =>
      t.modules.flatMap((m) => m.lessons.map((l) => ({ lessonId: l.id }))),
    );
  } catch {
    return [];
  }
}

export default async function AcademyLessonPage({
  params,
}: {
  params: Promise<{ lessonId: string }>;
}) {
  const { lessonId } = await params;
  const { locale, t } = await getT();
  const a = getPageMessages(locale).academy;
  const buttonLabels = {
    markLessonComplete: a.markLessonComplete,
    markLessonDone: a.markLessonDone,
    markVideoComplete: a.markVideoComplete,
    markVideoDone: a.markVideoDone,
    savingProgress: a.savingProgress,
    saveProgressFailed: a.saveProgressFailed,
  };
  let lesson;
  try {
    lesson = await getAcademyClient().getLesson(lessonId);
  } catch (error) {
    handleAcademyLoadError(error);
  }

  const session = await auth();
  let progress = null;
  if (session?.user) {
    try {
      progress = await getLessonProgress(session.user.id, lessonId);
    } catch {
      /* DB/API unavailable */
    }
  }

  const trackName = progress?.trackProgress.trackName ?? lesson.track;
  const videoRequired = lessonRequiresVideo(lesson);

  return (
    <>
      <AcademyBreadcrumb
        items={[
          { label: t.nav.learning, href: "/learning" },
          { label: trackName, href: `/academy/tracks/${lesson.track}` },
          { label: lesson.title },
        ]}
      />
      {progress?.trackProgress && (
        <div style={{ marginTop: "1rem" }}>
          <AcademyProgressBar
            completed={progress.trackProgress.completion.completed}
            total={progress.trackProgress.completion.total}
            percent={progress.trackProgress.completion.percent}
            label={a.trackProgress}
          />
        </div>
      )}
      <div style={{ marginTop: "1rem", display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
        <Badge variant="navy">
          {lesson.estimated_minutes} {a.minutes}
        </Badge>
        <Badge>{lesson.readiness}</Badge>
        {progress?.completed && <Badge variant="success">{a.lessonCompleted}</Badge>}
      </div>
      {lesson.video?.youtube.video_id && (
        <div style={{ marginTop: "1.5rem" }}>
          <YouTubeEmbed videoId={lesson.video.youtube.video_id} title={lesson.title} />
          {session?.user && videoRequired && (
            <div style={{ marginTop: "0.75rem" }}>
              <MarkVideoCompleteButton
                lessonId={lesson.id}
                trackId={lesson.track}
                curriculumVersion={DEFAULT_CURRICULUM_VERSION}
                completed={progress?.videoCompleted ?? false}
                labels={buttonLabels}
              />
            </div>
          )}
        </div>
      )}
      {lesson.body ? (
        <div style={{ marginTop: "1.5rem" }}>
          <MarkdownContent content={lesson.body} />
        </div>
      ) : (
        <p className="page-desc" style={{ marginTop: "1.5rem" }}>
          {a.noBody}
        </p>
      )}
      <div style={{ marginTop: "2rem" }}>
        {session?.user ? (
          <MarkLessonCompleteButton
            lessonId={lesson.id}
            trackId={lesson.track}
            curriculumVersion={DEFAULT_CURRICULUM_VERSION}
            completed={progress?.documentCompleted ?? false}
            labels={buttonLabels}
          />
        ) : (
          <p className="page-desc">
            {a.signInPromptBefore}{" "}
            <Link href={`/login?callbackUrl=/academy/lessons/${lesson.id}`}>{a.signInLink}</Link>
            {a.signInPromptAfter}
          </p>
        )}
      </div>
      {progress?.neighbors && (
        <div style={{ marginTop: "2rem" }}>
          <LessonNavigation
            previous={progress.neighbors.previous}
            next={progress.neighbors.next}
            prevLabel={a.prevLesson}
            nextLabel={a.nextLesson}
          />
        </div>
      )}
    </>
  );
}
