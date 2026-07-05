import  {createRoute, OpenAPIHono} from "@hono/zod-openapi";
import { summaryrequestschema, summaryacceptedschema } from "./schema";
import { createPendingSummary } from "./service";

summary.openapi(
createroute({
  method: "post",
  path: "/summary",
  tags: ["summary"],
  summary: "request a weekly health summary (runs in background)",
  request: {
    body: { content: { "application/json": { schema: summaryrequestschema } } },
  },
  responses: {
    202: {
      content: { "application/json": { schema: summaryacceptedschema } },
      description: "job accepted and queued",
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
})
)
