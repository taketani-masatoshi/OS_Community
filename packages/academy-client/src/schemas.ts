import { z } from "zod";

const lessonSummarySchema = z.object({
  id: z.string(),
  title: z.string(),
  track: z.string(),
  module: z.string(),
  estimated_minutes: z.number(),
  readiness: z.string(),
  content: z
    .object({
      document: z.string().optional(),
      video: z.string().optional(),
      assessment: z.string().optional(),
      video_required: z.boolean().optional(),
    })
    .optional(),
  video: z
    .object({
      id: z.string(),
      youtube: z.object({ video_id: z.string(), privacy: z.string() }),
      embed_url: z.string(),
    })
    .optional(),
  body: z.string().optional(),
});

const moduleSummarySchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  track: z.string(),
  category: z.string(),
  order: z.number(),
  lessons: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      estimated_minutes: z.number(),
      readiness: z.string(),
    }),
  ),
  assessments: z.array(
    z.object({
      key: z.string(),
      id: z.string(),
      type: z.string(),
      exam_bank: z.string(),
      form_id: z.string(),
      pass_score: z.number(),
      title: z.string(),
    }),
  ),
});

export const trackSummarySchema = z.object({
  id: z.string(),
  level: z.number(),
  name: z.string(),
  description: z.string(),
  version: z.string(),
  modules: z.array(moduleSummarySchema),
});

export const tracksResponseSchema = z.object({
  tracks: z.array(trackSummarySchema),
});

export const trackResponseSchema = z.object({
  track: trackSummarySchema,
});

export const moduleResponseSchema = z.object({
  module: moduleSummarySchema,
});

export const lessonResponseSchema = z.object({
  lesson: lessonSummarySchema,
});

export const examFormResponseSchema = z.object({
  form: z.record(z.unknown()),
  items: z.array(z.record(z.unknown())),
});

export const certTemplatesResponseSchema = z.object({
  templates: z.array(z.record(z.unknown())),
});

export const issuanceResponseSchema = z.object({
  rules: z.array(z.record(z.unknown())),
});

export type TrackSummary = z.infer<typeof trackSummarySchema>;
export type ModuleSummary = z.infer<typeof moduleSummarySchema>;
export type LessonSummary = z.infer<typeof lessonSummarySchema>;
