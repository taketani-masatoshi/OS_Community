import { describe, it, expect } from "vitest";
import { z } from "zod";

const postBodySchema = z.object({
  type: z.enum(["document_completed", "video_completed", "lesson_started", "lesson_completed"]),
  lessonId: z.string().min(1),
});

describe("progress route schema", () => {
  it("accepts document_completed", () => {
    const parsed = postBodySchema.safeParse({
      type: "document_completed",
      lessonId: "lesson-1",
    });
    expect(parsed.success).toBe(true);
  });

  it("accepts video_completed", () => {
    const parsed = postBodySchema.safeParse({
      type: "video_completed",
      lessonId: "lesson-1",
    });
    expect(parsed.success).toBe(true);
  });

  it("rejects empty lessonId", () => {
    const parsed = postBodySchema.safeParse({
      type: "document_completed",
      lessonId: "",
    });
    expect(parsed.success).toBe(false);
  });

  it("rejects unknown type", () => {
    const parsed = postBodySchema.safeParse({
      type: "exam_passed",
      lessonId: "lesson-1",
    });
    expect(parsed.success).toBe(false);
  });
});

describe("exam grade schema", () => {
  const bodySchema = z.object({
    bankId: z.string().min(1),
    formId: z.string().min(1),
    trackId: z.string().min(1),
    answers: z.array(z.object({ item_id: z.string().min(1) })),
  });

  it("requires bankId formId trackId", () => {
    expect(bodySchema.safeParse({ formId: "x", trackId: "y", answers: [] }).success).toBe(false);
  });

  it("accepts valid grade payload", () => {
    expect(
      bodySchema.safeParse({
        bankId: "ccu-v1",
        formId: "form-a",
        trackId: "level-0-user",
        answers: [{ item_id: "MC-001" }],
      }).success,
    ).toBe(true);
  });
});
