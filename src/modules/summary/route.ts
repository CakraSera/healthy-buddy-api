import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import {
  SummaryRequestSchema,
  SummaryAcceptedSchema,
  SummaryResultSchema,
} from "./schema";
import { createPendingSummary, getSummary } from "./service";
import { summaryQueue } from "../../utils/queue";
export const summaryRoute = new OpenAPIHono();

// POST /summary - Request a weekly health summary (runs in background)
summaryRoute.openapi(
  createRoute({
    method: "post",
    path: "/",
    tags: ["Summary"],
    request: {
      body: {
        content: { "application/json": { schema: SummaryRequestSchema } },
      },
    },
    responses: {
      202: {
        content: { "application/json": { schema: SummaryAcceptedSchema } },
        description: "Job accepted and queued",
      },
    },
  }),
  async (c) => {
    const { sessionId } = c.req.valid("json");

    // 1. Create a pending row so the client has an id to poll
    const summary = await createPendingSummary(sessionId);

    // 2. Enqueue the slow work — the API does NOT wait for the AI here
    await summaryQueue.add("summary", {
      summaryId: summary.id,
      sessionId,
    });

    // 3. Return immediately (202 Accepted)
    return c.json({ summaryId: summary.id, status: summary.status }, 202);
  },
);

// GET /summary/{id} - Get the status of a summary request
summaryRoute.openapi(
  createRoute({
    method: "get",
    path: "/{id}",
    tags: ["Summary"],
    request: {
      params: SummaryResultSchema.pick({ id: true }),
    },
    responses: {
      200: {
        content: { "application/json": { schema: SummaryResultSchema } },
        description: "Current status (pending/processing/done) and content",
      },
      404: { description: "Not found" },
    },
  }),
  async (c) => {
    const { id } = c.req.valid("param");
    const summary = await getSummary(id);
    if (!summary) {
      return c.json({ error: "Summary not found" }, 404);
    }
    return c.json(
      { id: summary.id, status: summary.status, content: summary.content },
      200,
    );
  },
);
