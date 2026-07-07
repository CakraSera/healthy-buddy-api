import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { ChatRequestSchema } from "./schema";
import { getResponseAIChat } from "./service";

export const chatRoute = new OpenAPIHono();

// POST / - Send a message to the AI health coach
chatRoute.openapi(
  createRoute({
    method: "post",
    path: "/",
    tags: ["Chat"],
    request: {
      body: { content: { "application/json": { schema: ChatRequestSchema } } },
    },
    responses: {
      200: {
        description: "Coach reply",
      },
    },
  }),
  async (c) => {
    const { sessionId, message } = await c.req.json();
    const result = await getResponseAIChat(sessionId, message);
    if (!result) {
      return c.text("No response from the health coach.");
    }

    return c.json({ reply: result });
  },
);
