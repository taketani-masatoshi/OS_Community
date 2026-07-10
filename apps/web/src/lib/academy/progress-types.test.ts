import { describe, it, expect } from "vitest";
import {
  computeTrackCompletion,
  isLessonFullyComplete,
  lessonRequiresVideo,
  mergeLessonMetadata,
} from "@/lib/academy/progress-types";

describe("progress-types", () => {
  it("mergeLessonMetadata tracks document and video", () => {
    const meta = mergeLessonMetadata({}, "document_completed");
    expect(meta.documentCompleted).toBe(true);
    const withVideo = mergeLessonMetadata(meta, "video_completed");
    expect(withVideo.videoCompleted).toBe(true);
  });

  it("lesson without video completes on document only", () => {
    const lesson = { content: { video_required: false }, video: undefined };
    expect(
      isLessonFullyComplete(lesson, mergeLessonMetadata({}, "document_completed")),
    ).toBe(true);
  });

  it("lesson with video requires both", () => {
    const lesson = {
      content: {},
      video: { youtube: { video_id: "abc" } },
    };
    expect(lessonRequiresVideo(lesson)).toBe(true);
    expect(isLessonFullyComplete(lesson, { documentCompleted: true })).toBe(false);
    expect(
      isLessonFullyComplete(lesson, { documentCompleted: true, videoCompleted: true }),
    ).toBe(true);
  });

  it("computes track completion percent", () => {
    const result = computeTrackCompletion(["a", "b"], ["a", "b", "c", "d"]);
    expect(result.percent).toBe(50);
  });
});
