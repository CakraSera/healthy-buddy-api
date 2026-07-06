import { z } from "@hono/zod-openapi";

// Request to kick off a background summary
export const SummaryRequestSchema = z
  .object({
    sessionId: z.string().min(1).openapi({ example: "abc-123" }),
  })
  .openapi("SummaryRequest");

// Response when the job is accepted (returns immediately, before AI runs)
export const SummaryAcceptedSchema = z
  .object({
    summaryId: z.string(),
    status: z.string().openapi({ example: "pending" }),
  })
  .openapi("SummaryAccepted");

// Response when polling for a summary's result
export const SummaryResultSchema = z
  .object({
    id: z.string(),
    status: z.string().openapi({ example: "done" }),
    content: z.string().nullable(),
  })
  .openapi("SummaryResult");
