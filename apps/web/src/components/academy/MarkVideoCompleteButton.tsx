"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { PageMessages } from "@os-community/shared";

type VideoLabels = Pick<
  PageMessages["academy"],
  "markVideoComplete" | "markVideoDone" | "savingProgress" | "saveProgressFailed"
>;

type Props = {
  lessonId: string;
  trackId: string;
  curriculumVersion: string;
  completed: boolean;
  labels: VideoLabels;
};

export function MarkVideoCompleteButton({
  lessonId,
  trackId,
  curriculumVersion,
  completed,
  labels,
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(completed);

  async function markComplete() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/academy/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "video_completed",
          lessonId,
          trackId,
          curriculumVersion,
        }),
      });
      if (!res.ok) {
        const body = (await res.json()) as { error?: string };
        throw new Error(body.error ?? labels.saveProgressFailed);
      }
      setDone(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : labels.saveProgressFailed);
    } finally {
      setLoading(false);
    }
  }

  if (done) return <p className="academy-progress-done">{labels.markVideoDone}</p>;

  return (
    <div className="academy-progress-actions">
      <button type="button" className="btn btn-primary btn-sm" disabled={loading} onClick={markComplete}>
        {loading ? labels.savingProgress : labels.markVideoComplete}
      </button>
      {error && <p className="academy-progress-error">{error}</p>}
    </div>
  );
}
