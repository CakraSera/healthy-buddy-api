import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { ChatRequestSchema } from "./schema";
import { getResponseAIChat } from "./service";

export const chatRoute = new OpenAPIHono();

chatRoute.openapi(
  createRoute({
    method: "post",
    path: "/",
    tags: ["Chat"],
    summary: "Send a message to the heatlh coach",
    description: "Streams the coach reply as text",
    request: {
      body: { content: { "application/json": { schema: ChatRequestSchema } } },
    },
    responses: {
      200: {
        description: "Streamed coach reply",
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
