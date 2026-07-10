import { describe, it, expect } from "vitest";
import {
  resolveCertificationExam,
  resolveModuleQuizFromModule,
  resolveTrackCertificationExam,
} from "@/lib/academy/quiz-config";

describe("quiz-config", () => {
  it("resolves module quiz from assessments array", () => {
    const quiz = resolveModuleQuizFromModule({
      slug: "openorgos-fundamentals",
      assessments: [
        {
          key: "module_quiz",
          id: "a1",
          type: "module_exam",
          exam_bank: "openorgos-fundamentals-v1",
          form_id: "module-quiz",
          pass_score: 70,
          title: "Module test",
        },
      ],
    });
    expect(quiz?.exam_bank).toBe("openorgos-fundamentals-v1");
  });

  it("resolves CCU certification exam", () => {
    expect(resolveCertificationExam("CCU")?.bankId).toBe("ccu-v1");
    expect(resolveTrackCertificationExam("level-0-user")?.formId).toBe("form-a");
  });
});
