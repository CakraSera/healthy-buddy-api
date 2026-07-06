import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { SummaryRequestSchema, SummaryAcceptedSchema } from "./schema";
import { createPendingSummary } from "./service";
export const summaryRoute = new OpenAPIHono();

summaryRoute.openapi(
  createRoute({
    method: "post",
    path: "/summary",
    tags: ["summary"],
    summary: "request a weekly health summary (runs in background)",
    request: {
      body: {
        content: { "application/json": { schema: SummaryRequestSchema } },
      },
    },
    responses: {
      202: {
        content: { "application/json": { schema: SummaryRequestSchema } },
        description: "job accepted and queued",
      },
    },
  }),
  async (c) => {
    const { sessionId } = c.req.valid("json");
    console.log({ sessionId });

    // 1. Create a pending row so the client has an id to poll
    const summary = await createPendingSummary(sessionId);
    console.log({ summary });

    // 2. Enqueue the slow work — the API does NOT wait for the AI here
    await summaryQueue.add("summary", {
      summaryId: summary.id,
      sessionId,
    });

    return c.json(200);
    // 3. Return immediately (202 Accepted)
    // return c.json({ summaryId: summary.id, status: summary.status }, 202);
  },
);
