import Link from "next/link";

type Neighbor = { id: string; title: string } | null;

export function LessonNavigation({
  previous,
  next,
  prevLabel = "Previous lesson",
  nextLabel = "Next lesson",
}: {
  previous: Neighbor;
  next: Neighbor;
  prevLabel?: string;
  nextLabel?: string;
}) {
  if (!previous && !next) return null;

  return (
    <nav className="academy-lesson-nav" aria-label="Lesson navigation">
      {previous ? (
        <Link href={`/academy/lessons/${previous.id}`} className="btn btn-ghost btn-sm">
          ← {prevLabel}: {previous.title}
        </Link>
      ) : (
        <span />
      )}
      {next ? (
        <Link href={`/academy/lessons/${next.id}`} className="btn btn-primary btn-sm">
          {nextLabel}: {next.title}
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}
